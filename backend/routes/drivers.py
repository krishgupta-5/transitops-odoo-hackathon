from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from db.database import get_db
from db.models import Driver, User
from app.schemas import DriverOut, DriverCreate, DriverUpdate
from app.enums import UserRole, DriverStatus
from app.oauth2 import require_roles

router = APIRouter(prefix="/drivers", tags=["Drivers"])

@router.get("/", response_model=List[DriverOut])
def list_drivers(
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    query = db.query(Driver)
    
    if status:
        query = query.filter(Driver.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Driver.license_number.ilike(search_term),
                Driver.name.ilike(search_term)
            )
        )
        
    return query.order_by(Driver.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{driver_id}", response_model=DriverOut)
def get_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.post("/", response_model=DriverOut, status_code=status.HTTP_201_CREATED)
def create_driver(
    payload: DriverCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    existing = db.query(Driver).filter(Driver.license_number == payload.license_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="License number already exists")
    
    driver = Driver(
        name=payload.name,
        license_number=payload.license_number,
        license_category=payload.license_category,
        license_expiry_date=payload.license_expiry_date,
        contact_number=payload.contact_number,
        safety_score=payload.safety_score,
        status=DriverStatus.AVAILABLE.value
    )
    
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver

@router.patch("/{driver_id}", response_model=DriverOut)
def update_driver(
    driver_id: int,
    payload: DriverUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if payload.license_number and payload.license_number != driver.license_number:
        existing = db.query(Driver).filter(Driver.license_number == payload.license_number).first()
        if existing:
            raise HTTPException(status_code=400, detail="License number already exists")

    if driver.status == DriverStatus.ON_TRIP.value:
        # Protect ON_TRIP fields
        if payload.status:
            raise HTTPException(
                status_code=409, 
                detail="Cannot modify status while driver is ON_TRIP"
            )

    if payload.status and payload.status != driver.status:
        # Explicit status transition rules
        old_status = driver.status
        new_status = payload.status
        
        # Forbidden: Any manual transition TO ON_TRIP
        if new_status == DriverStatus.ON_TRIP.value:
            raise HTTPException(status_code=400, detail="Cannot manually set status to ON_TRIP")

        # Forbidden: Transitions FROM ON_TRIP
        if old_status == DriverStatus.ON_TRIP.value:
            raise HTTPException(status_code=409, detail="Cannot manually transition FROM ON_TRIP")

        # Allowed transitions mapping:
        allowed_transitions = {
            DriverStatus.AVAILABLE.value: [DriverStatus.OFF_DUTY.value, DriverStatus.SUSPENDED.value],
            DriverStatus.OFF_DUTY.value: [DriverStatus.AVAILABLE.value, DriverStatus.SUSPENDED.value],
            DriverStatus.SUSPENDED.value: [DriverStatus.AVAILABLE.value, DriverStatus.OFF_DUTY.value]
        }
        
        if new_status not in allowed_transitions.get(old_status, []):
            raise HTTPException(status_code=400, detail=f"Invalid transition from {old_status} to {new_status}")

        driver.status = new_status

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key != 'status': # Status is already handled above
            setattr(driver, key, value)

    db.commit()
    db.refresh(driver)
    return driver

@router.delete("/{driver_id}", status_code=status.HTTP_204_NO_CONTENT)
def off_duty_driver(
    driver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FLEET_MANAGER))
):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if driver.status == DriverStatus.ON_TRIP.value:
        raise HTTPException(status_code=409, detail="Cannot set driver off duty while ON_TRIP")

    driver.status = DriverStatus.OFF_DUTY.value
    db.commit()
    return None
