from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class UserCreate(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    password: str
    role: Optional[str] = "DISPATCHER"


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
    role: str
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
    role: Optional[str] = None


class TokenRefresh(BaseModel):
    refresh_token: str
