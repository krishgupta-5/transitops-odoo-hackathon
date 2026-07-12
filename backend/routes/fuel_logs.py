from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from db.database import get_db
from db.models import FuelLog, Vehicle, Trip, User
from app.schemas import FuelLogCreate, FuelLogUpdate, FuelLogOut
from app.oauth2 import get_current_user, require_roles
from app.enums import UserRole, TripStatus

router = APIRouter(
    prefix="/fuel-logs",
    tags=["Fuel Logs"]
)

@router.post("/", response_model=FuelLogOut, status_code=status.HTTP_201_CREATED)
def create_fuel_log(
    fuel_log_in: FuelLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    trip = db.query(Trip).filter(Trip.id == fuel_log_in.trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    if trip.status != TripStatus.COMPLETED.value:
        raise HTTPException(status_code=400, detail="Financial fuel logs can only be created for COMPLETED trips")
        
    if not trip.fuel_consumed or trip.fuel_consumed <= 0:
        raise HTTPException(status_code=400, detail="Trip must have a valid fuel_consumed value > 0")

    existing_log = db.query(FuelLog).filter(FuelLog.trip_id == trip.id).first()
    if existing_log:
        raise HTTPException(status_code=409, detail="A fuel log already exists for this trip")

    new_fuel_log = FuelLog(
        vehicle_id=trip.vehicle_id,
        trip_id=trip.id,
        liters=trip.fuel_consumed,
        cost=fuel_log_in.cost,
        fuel_date=fuel_log_in.fuel_date
    )
    db.add(new_fuel_log)
    db.commit()
    db.refresh(new_fuel_log)
    return new_fuel_log

@router.get("/", response_model=List[FuelLogOut])
def get_fuel_logs(
    vehicle_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER))
):
    query = db.query(FuelLog)
    if vehicle_id:
        query = query.filter(FuelLog.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(FuelLog.trip_id == trip_id)
        
    return query.order_by(FuelLog.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{fuel_log_id}", response_model=FuelLogOut)
def get_fuel_log(
    fuel_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER))
):
    fuel_log = db.query(FuelLog).filter(FuelLog.id == fuel_log_id).first()
    if not fuel_log:
        raise HTTPException(status_code=404, detail="Fuel Log not found")
    return fuel_log

@router.patch("/{fuel_log_id}", response_model=FuelLogOut)
def update_fuel_log(
    fuel_log_id: int,
    fuel_log_in: FuelLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    fuel_log = db.query(FuelLog).filter(FuelLog.id == fuel_log_id).first()
    if not fuel_log:
        raise HTTPException(status_code=404, detail="Fuel Log not found")

    update_data = fuel_log_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(fuel_log, key, value)
        
    db.commit()
    db.refresh(fuel_log)
    return fuel_log

@router.delete("/{fuel_log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fuel_log(
    fuel_log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    fuel_log = db.query(FuelLog).filter(FuelLog.id == fuel_log_id).first()
    if not fuel_log:
        raise HTTPException(status_code=404, detail="Fuel Log not found")
        
    db.delete(fuel_log)
    db.commit()
    return None
