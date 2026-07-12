from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from db.database import get_db
from db import models
from app.enums import UserRole, VehicleStatus, DriverStatus, MaintenanceStatus
from app.oauth2 import require_roles
from app import schemas

router = APIRouter(prefix="/maintenance", tags=["Maintenance Operations"])

@router.post("/", response_model=schemas.MaintenanceOut, status_code=status.HTTP_201_CREATED)
def create_maintenance(
    payload: schemas.MaintenanceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER))
):
    # Verify vehicle exists
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    # Reject RETIRED vehicles
    if vehicle.status == VehicleStatus.RETIRED.value:
        raise HTTPException(status_code=400, detail="Cannot create maintenance for a retired vehicle")

    # Validate cost
    if payload.cost < 0:
        raise HTTPException(status_code=422, detail="Cost must be non-negative")

    # Validate service_type
    if not payload.service_type or not payload.service_type.strip():
        raise HTTPException(status_code=422, detail="Service type cannot be empty")

    new_maint = models.Maintenance(
        vehicle_id=payload.vehicle_id,
        service_type=payload.service_type.strip(),
        service_date=payload.service_date,
        cost=payload.cost,
        description=payload.description,
        status=MaintenanceStatus.SCHEDULED.value
    )
    db.add(new_maint)
    db.commit()
    db.refresh(new_maint)
    return new_maint


@router.get("/", response_model=List[schemas.MaintenanceOut])
def list_maintenance(
    status: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    service_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(
        UserRole.SAFETY_OFFICER, UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST
    ))
):
    query = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle))
    
    if status:
        query = query.filter(models.Maintenance.status == status)
    if vehicle_id:
        query = query.filter(models.Maintenance.vehicle_id == vehicle_id)
    if service_type:
        query = query.filter(models.Maintenance.service_type.ilike(f"%{service_type}%"))
        
    return query.order_by(models.Maintenance.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/{maintenance_id}", response_model=schemas.MaintenanceOut)
def get_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(
        UserRole.SAFETY_OFFICER, UserRole.FLEET_MANAGER, UserRole.FINANCIAL_ANALYST
    ))
):
    maint = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle)).filter(
        models.Maintenance.id == maintenance_id
    ).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")
    return maint


@router.patch("/{maintenance_id}", response_model=schemas.MaintenanceOut)
def update_maintenance(
    maintenance_id: int,
    payload: schemas.MaintenanceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER))
):
    maint = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle)).filter(
        models.Maintenance.id == maintenance_id
    ).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    if maint.status != MaintenanceStatus.SCHEDULED.value:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot edit maintenance record in {maint.status} status. Only SCHEDULED records can be edited."
        )

    # Apply updates
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(maint, key, value)

    maint.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(maint)
    return maint


@router.post("/{maintenance_id}/start", response_model=schemas.MaintenanceOut)
def start_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER))
):
    maint = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle)).filter(
        models.Maintenance.id == maintenance_id
    ).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    if maint.status != MaintenanceStatus.SCHEDULED.value:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot start maintenance record with status {maint.status}. Status must be SCHEDULED."
        )

    vehicle = maint.vehicle
    if not vehicle:
        raise HTTPException(status_code=404, detail="Assigned vehicle not found")

    if vehicle.status == VehicleStatus.ON_TRIP.value:
        raise HTTPException(
            status_code=409,
            detail="Cannot start maintenance: vehicle is currently ON_TRIP."
        )

    if vehicle.status == VehicleStatus.RETIRED.value:
        raise HTTPException(
            status_code=409,
            detail="Cannot start maintenance: vehicle is RETIRED."
        )

    if vehicle.status == VehicleStatus.IN_SHOP.value:
        raise HTTPException(
            status_code=409,
            detail="Cannot start maintenance: vehicle is already IN_SHOP."
        )

    # Verify that the vehicle is AVAILABLE (or not ON_TRIP/RETIRED/IN_SHOP)
    # The requirement says: Starting maintenance should normally require the vehicle to be AVAILABLE.
    # Allowed: Vehicle AVAILABLE -> Start Maintenance -> Vehicle IN_SHOP.
    if vehicle.status != VehicleStatus.AVAILABLE.value:
         raise HTTPException(
            status_code=409,
            detail=f"Cannot start maintenance: vehicle status must be AVAILABLE (current: {vehicle.status})."
        )

    # Check if another maintenance is already IN_PROGRESS for this vehicle
    other_active = db.query(models.Maintenance).filter(
        models.Maintenance.vehicle_id == vehicle.id,
        models.Maintenance.status == MaintenanceStatus.IN_PROGRESS.value,
        models.Maintenance.id != maintenance_id
    ).first()
    if other_active:
        raise HTTPException(
            status_code=409,
            detail="Another maintenance record is already IN_PROGRESS for this vehicle."
        )

    # Start maintenance transactionally
    maint.status = MaintenanceStatus.IN_PROGRESS.value
    maint.started_at = datetime.now(timezone.utc)
    maint.updated_at = datetime.now(timezone.utc)
    vehicle.status = VehicleStatus.IN_SHOP.value
    vehicle.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(maint)
    return maint


@router.post("/{maintenance_id}/complete", response_model=schemas.MaintenanceOut)
def complete_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER))
):
    maint = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle)).filter(
        models.Maintenance.id == maintenance_id
    ).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    if maint.status != MaintenanceStatus.IN_PROGRESS.value:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot complete maintenance record with status {maint.status}. Status must be IN_PROGRESS."
        )

    vehicle = maint.vehicle
    if not vehicle:
        raise HTTPException(status_code=404, detail="Assigned vehicle not found")

    if vehicle.status != VehicleStatus.IN_SHOP.value:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot complete maintenance: vehicle is currently {vehicle.status}, expected IN_SHOP."
        )

    # Check if another maintenance record is still IN_PROGRESS
    other_active = db.query(models.Maintenance).filter(
        models.Maintenance.vehicle_id == vehicle.id,
        models.Maintenance.status == MaintenanceStatus.IN_PROGRESS.value,
        models.Maintenance.id != maintenance_id
    ).first()

    maint.status = MaintenanceStatus.COMPLETED.value
    maint.completed_at = datetime.now(timezone.utc)
    maint.updated_at = datetime.now(timezone.utc)

    # Only restore vehicle to AVAILABLE if no other active maintenance is in progress
    if not other_active:
        vehicle.status = VehicleStatus.AVAILABLE.value
        vehicle.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(maint)
    return maint


@router.post("/{maintenance_id}/cancel", response_model=schemas.MaintenanceOut)
def cancel_maintenance(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(UserRole.SAFETY_OFFICER))
):
    maint = db.query(models.Maintenance).options(joinedload(models.Maintenance.vehicle)).filter(
        models.Maintenance.id == maintenance_id
    ).first()
    if not maint:
        raise HTTPException(status_code=404, detail="Maintenance record not found")

    if maint.status not in [MaintenanceStatus.SCHEDULED.value, MaintenanceStatus.IN_PROGRESS.value]:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot cancel maintenance record in {maint.status} status. Only SCHEDULED or IN_PROGRESS can be cancelled."
        )

    vehicle = maint.vehicle
    if not vehicle:
        raise HTTPException(status_code=404, detail="Assigned vehicle not found")

    old_status = maint.status
    maint.status = MaintenanceStatus.CANCELLED.value
    maint.cancelled_at = datetime.now(timezone.utc)
    maint.updated_at = datetime.now(timezone.utc)

    # If it was IN_PROGRESS, check other active maintenances to restore vehicle status
    if old_status == MaintenanceStatus.IN_PROGRESS.value:
        other_active = db.query(models.Maintenance).filter(
            models.Maintenance.vehicle_id == vehicle.id,
            models.Maintenance.status == MaintenanceStatus.IN_PROGRESS.value,
            models.Maintenance.id != maintenance_id
        ).first()

        if not other_active:
            if vehicle.status == VehicleStatus.IN_SHOP.value:
                vehicle.status = VehicleStatus.AVAILABLE.value
                vehicle.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(maint)
    return maint
