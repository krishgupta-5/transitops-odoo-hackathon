from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from app.enums import UserRole, TripStatus


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
    status: str

    model_config = ConfigDict(from_attributes=True)


class DriverOut(BaseModel):
    id: int
    name: str
    license_number: str
    status: str

    model_config = ConfigDict(from_attributes=True)


from pydantic import Field

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
