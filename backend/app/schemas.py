from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field

from app.enums import UserRole, TripStatus, ExpenseCategory


class UserCreate(BaseModel):
    """Registration schema with role selection matching backend enums."""
    name: Optional[str] = None
    email: EmailStr
    password: str
    role: Optional[UserRole] = UserRole.DISPATCHER



class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None


class UserOut(BaseModel):
    id: int
    name: Optional[str] = None
    email: str
    role: UserRole
    phone: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    is_active: bool
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    id: Optional[str] = None
    role: Optional[UserRole] = None


class TokenRefresh(BaseModel):
    refresh_token: str


class VehicleOut(BaseModel):
    id: int
    name: str
    registration_number: str
    vehicle_type: str
    max_load_capacity: float
    odometer: int
    acquisition_cost: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class VehicleCreate(BaseModel):
    registration_number: str = Field(..., min_length=1)
    name: str = Field(..., min_length=1)
    vehicle_type: str = Field(..., min_length=1)
    max_load_capacity: float = Field(..., gt=0)
    odometer: int = Field(0, ge=0)
    acquisition_cost: Optional[float] = Field(None, ge=0)

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    name: Optional[str] = None
    vehicle_type: Optional[str] = None
    max_load_capacity: Optional[float] = Field(None, gt=0)
    odometer: Optional[int] = Field(None, ge=0)
    acquisition_cost: Optional[float] = Field(None, ge=0)
    status: Optional[str] = None


class DriverOut(BaseModel):
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: Optional[str] = None
    safety_score: Optional[float] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DriverCreate(BaseModel):
    name: str = Field(..., min_length=1)
    license_number: str = Field(..., min_length=1)
    license_category: str = Field(..., min_length=1)
    license_expiry_date: date
    contact_number: str = Field(..., min_length=1)
    safety_score: Optional[float] = Field(None, ge=0, le=100)

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry_date: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = Field(None, ge=0, le=100)
    status: Optional[str] = None



class TripCreate(BaseModel):
    source: str = Field(..., min_length=1)
    destination: str = Field(..., min_length=1)
    vehicle_id: int
    driver_id: int
    cargo_weight: float = Field(..., gt=0)
    planned_distance: float = Field(..., gt=0)
    revenue: float = Field(..., ge=0)


class TripCompleteRequest(BaseModel):
    final_odometer: int = Field(..., ge=0)
    fuel_consumed: float = Field(..., ge=0)


class TripOut(BaseModel):
    id: int
    trip_number: str
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    revenue: float
    status: TripStatus
    
    initial_odometer: Optional[int] = None
    final_odometer: Optional[int] = None
    fuel_consumed: Optional[float] = None
    
    created_at: datetime
    updated_at: datetime
    dispatched_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None

    vehicle: VehicleOut
    driver: DriverOut

    model_config = ConfigDict(from_attributes=True)


class FuelLogCreate(BaseModel):
    vehicle_id: int
    trip_id: int
    liters: float = Field(..., gt=0)
    cost: float = Field(..., ge=0)
    fuel_date: date

class FuelLogUpdate(BaseModel):
    liters: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, ge=0)
    fuel_date: Optional[date] = None

class FuelLogOut(BaseModel):
    id: int
    vehicle_id: int
    trip_id: int
    liters: float
    cost: float
    fuel_date: date
    created_at: datetime
    updated_at: datetime
    
    vehicle: VehicleOut
    trip: TripOut

    model_config = ConfigDict(from_attributes=True)


class ExpenseCreate(BaseModel):
    vehicle_id: int
    trip_id: Optional[int] = None
    category: ExpenseCategory
    amount: float = Field(..., ge=0)
    expense_date: date
    description: Optional[str] = None

class ExpenseUpdate(BaseModel):
    category: Optional[ExpenseCategory] = None
    amount: Optional[float] = Field(None, ge=0)
    expense_date: Optional[date] = None
    description: Optional[str] = None

class ExpenseOut(BaseModel):
    id: int
    vehicle_id: int
    trip_id: Optional[int] = None
    category: ExpenseCategory
    amount: float
    expense_date: date
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    vehicle: VehicleOut
    trip: Optional[TripOut] = None

    model_config = ConfigDict(from_attributes=True)
