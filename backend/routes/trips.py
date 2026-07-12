from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import exc

from db.database import get_db
from db.models import Trip, Vehicle, Driver, User
from app.schemas import TripCreate, TripOut, TripCompleteRequest
from app.enums import UserRole, TripStatus, VehicleStatus, DriverStatus
from app.oauth2 import require_roles, get_current_active_user

router = APIRouter(prefix="/trips", tags=["Trips"])

def generate_trip_number(db: Session) -> str:
    # A simple, safe implementation that counts trips and adds 1.
    # In production, a sequence or uuid might be safer for high concurrency.
    count = db.query(Trip).count()
    return f"TRIP-{count + 1:06d}"


@router.post("/", response_model=TripOut, status_code=status.HTTP_201_CREATED)
def create_trip(
    trip_in: TripCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DISPATCHER))
):
    if trip_in.source.strip().lower() == trip_in.destination.strip().lower():
        raise HTTPException(status_code=422, detail="Source and destination cannot be the same")

    vehicle = db.query(Vehicle).filter(Vehicle.id == trip_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    driver = db.query(Driver).filter(Driver.id == trip_in.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    if trip_in.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(status_code=422, detail="Cargo weight exceeds vehicle maximum load capacity")

    trip_number = generate_trip_number(db)
    
    trip = Trip(
        trip_number=trip_number,
        source=trip_in.source,
        destination=trip_in.destination,
        vehicle_id=trip_in.vehicle_id,
        driver_id=trip_in.driver_id,
        cargo_weight=trip_in.cargo_weight,
        planned_distance=trip_in.planned_distance,
        revenue=trip_in.revenue,
        status=TripStatus.DRAFT.value,
        initial_odometer=vehicle.odometer
    )
    
    db.add(trip)
    try:
        db.commit()
        db.refresh(trip)
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error")
        
    return db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver)).filter(Trip.id == trip.id).first()


@router.get("/", response_model=List[TripOut])
def list_trips(
    skip: int = 0,
    limit: int = Query(default=100, le=1000),
    status: Optional[str] = None,
    vehicle_id: Optional[int] = None,
    driver_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    query = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver))
    
    if status:
        query = query.filter(Trip.status == status)
    if vehicle_id:
        query = query.filter(Trip.vehicle_id == vehicle_id)
    if driver_id:
        query = query.filter(Trip.driver_id == driver_id)
        
    trips = query.order_by(Trip.created_at.desc()).offset(skip).limit(limit).all()
    return trips


@router.get("/active", response_model=List[TripOut])
def get_active_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DISPATCHER, UserRole.FLEET_MANAGER))
):
    trips = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver))\
        .filter(Trip.status == TripStatus.DISPATCHED.value)\
        .order_by(Trip.dispatched_at.desc())\
        .all()
    return trips


@router.get("/{trip_id}", response_model=TripOut)
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(
        UserRole.DISPATCHER, UserRole.FLEET_MANAGER, UserRole.SAFETY_OFFICER, UserRole.FINANCIAL_ANALYST
    ))
):
    trip = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver)).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("/{trip_id}/dispatch", response_model=TripOut)
def dispatch_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DISPATCHER))
):
    trip = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver)).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status != TripStatus.DRAFT.value:
        raise HTTPException(status_code=409, detail="Trip must be in DRAFT status to dispatch")
        
    vehicle = trip.vehicle
    if vehicle.status != VehicleStatus.AVAILABLE.value:
        raise HTTPException(status_code=409, detail="Vehicle is not available for dispatch")
        
    if trip.cargo_weight > vehicle.max_load_capacity:
        raise HTTPException(status_code=422, detail="Cargo weight exceeds vehicle maximum load capacity")
        
    driver = trip.driver
    if driver.status != DriverStatus.AVAILABLE.value:
        raise HTTPException(status_code=409, detail="Driver is not available for dispatch")
        
    today = datetime.now(timezone.utc).date()
    if driver.license_expiry_date < today:
        raise HTTPException(status_code=409, detail="Driver license has expired")

    # Concurrency checks: ensure driver/vehicle not already dispatched in another active trip
    active_vehicle_trip = db.query(Trip).filter(Trip.vehicle_id == vehicle.id, Trip.status == TripStatus.DISPATCHED.value).first()
    if active_vehicle_trip:
        raise HTTPException(status_code=409, detail="Vehicle is already assigned to an active trip")
        
    active_driver_trip = db.query(Trip).filter(Trip.driver_id == driver.id, Trip.status == TripStatus.DISPATCHED.value).first()
    if active_driver_trip:
        raise HTTPException(status_code=409, detail="Driver is already assigned to an active trip")

    # Perform dispatch
    trip.status = TripStatus.DISPATCHED.value
    trip.dispatched_at = datetime.now(timezone.utc)
    vehicle.status = VehicleStatus.ON_TRIP.value
    driver.status = DriverStatus.ON_TRIP.value
    
    try:
        db.commit()
        db.refresh(trip)
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during dispatch")
        
    return trip


@router.post("/{trip_id}/complete", response_model=TripOut)
def complete_trip(
    trip_id: int,
    completion_data: TripCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DISPATCHER))
):
    trip = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver)).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status != TripStatus.DISPATCHED.value:
        raise HTTPException(status_code=409, detail="Only DISPATCHED trips can be completed")
        
    vehicle = trip.vehicle
    
    if completion_data.final_odometer < trip.initial_odometer:
        raise HTTPException(status_code=422, detail="Final odometer cannot be less than initial odometer")
        
    if completion_data.final_odometer < vehicle.odometer:
        raise HTTPException(status_code=422, detail="Final odometer cannot be less than current vehicle odometer")

    driver = trip.driver
    
    trip.final_odometer = completion_data.final_odometer
    trip.fuel_consumed = completion_data.fuel_consumed
    trip.status = TripStatus.COMPLETED.value
    trip.completed_at = datetime.now(timezone.utc)
    
    vehicle.odometer = completion_data.final_odometer
    vehicle.status = VehicleStatus.AVAILABLE.value
    driver.status = DriverStatus.AVAILABLE.value
    
    try:
        db.commit()
        db.refresh(trip)
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during completion")
        
    return trip


@router.post("/{trip_id}/cancel", response_model=TripOut)
def cancel_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.DISPATCHER))
):
    trip = db.query(Trip).options(joinedload(Trip.vehicle), joinedload(Trip.driver)).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status in [TripStatus.COMPLETED.value, TripStatus.CANCELLED.value]:
        raise HTTPException(status_code=409, detail=f"Cannot cancel a {trip.status} trip")

    if trip.status == TripStatus.DISPATCHED.value:
        vehicle = trip.vehicle
        driver = trip.driver
        vehicle.status = VehicleStatus.AVAILABLE.value
        driver.status = DriverStatus.AVAILABLE.value

    trip.status = TripStatus.CANCELLED.value
    trip.cancelled_at = datetime.now(timezone.utc)
    
    try:
        db.commit()
        db.refresh(trip)
    except exc.IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Database integrity error during cancellation")
        
    return trip
