from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.database import get_db
from db.models import Vehicle, User
from app.schemas import VehicleOut, VehicleCreate, VehicleUpdate
from app.enums import UserRole, VehicleStatus
from app.oauth2 import require_roles

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("/", response_model=List[VehicleOut])
def list_vehicles(
    status: Optional[str] = None,
    vehicle_type: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Vehicle.registration_number.ilike(search_term),
                Vehicle.name.ilike(search_term)
            )
        )
        
    return query.order_by(Vehicle.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{vehicle_id}", response_model=VehicleOut)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@router.post("/", response_model=VehicleOut, status_code=status.HTTP_201_CREATED)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    existing = db.query(Vehicle).filter(Vehicle.registration_number == payload.registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Registration number already exists")
    
    vehicle = Vehicle(
        registration_number=payload.registration_number,
        name=payload.name,
        vehicle_type=payload.vehicle_type,
        max_load_capacity=payload.max_load_capacity,
        odometer=payload.odometer,
        acquisition_cost=payload.acquisition_cost,
        status=VehicleStatus.AVAILABLE.value
    )
    
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.patch("/{vehicle_id}", response_model=VehicleOut)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if payload.registration_number and payload.registration_number != vehicle.registration_number:
        existing = db.query(Vehicle).filter(Vehicle.registration_number == payload.registration_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="Registration number already exists")

    if vehicle.status == VehicleStatus.ON_TRIP.value:
        # Protect ON_TRIP fields
        if payload.registration_number or payload.max_load_capacity is not None or payload.odometer is not None or payload.status:
            raise HTTPException(
                status_code=409, 
                detail="Cannot modify registration, capacity, odometer, or status while vehicle is ON_TRIP"
            )

    if payload.status and payload.status != vehicle.status:
        # Explicit status transition rules
        old_status = vehicle.status
        new_status = payload.status
        
        # Forbidden: Any manual transition TO ON_TRIP
        if new_status == VehicleStatus.ON_TRIP.value:
            raise HTTPException(status_code=400, detail="Cannot manually set status to ON_TRIP")

        # Forbidden: Transitions FROM ON_TRIP
        if old_status == VehicleStatus.ON_TRIP.value:
            raise HTTPException(status_code=409, detail="Cannot manually transition FROM ON_TRIP")

        # Allowed transitions mapping:
        allowed_transitions = {
            VehicleStatus.AVAILABLE.value: [VehicleStatus.IN_SHOP.value, VehicleStatus.RETIRED.value],
            VehicleStatus.IN_SHOP.value: [VehicleStatus.AVAILABLE.value, VehicleStatus.RETIRED.value],
            VehicleStatus.RETIRED.value: []
        }
        
        if new_status not in allowed_transitions.get(old_status, []):
            raise HTTPException(status_code=400, detail=f"Invalid transition from {old_status} to {new_status}")

        vehicle.status = new_status

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key != 'status': # Status is already handled above
            setattr(vehicle, key, value)

    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def retire_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status == VehicleStatus.ON_TRIP.value:
        raise HTTPException(status_code=409, detail="Cannot retire vehicle while ON_TRIP")

    vehicle.status = VehicleStatus.RETIRED.value
    db.commit()
    return None
