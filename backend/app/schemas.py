from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict

from app.enums import UserRole


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
