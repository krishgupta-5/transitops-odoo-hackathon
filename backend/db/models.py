from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from db.database import Base
from app.enums import UserRole, VehicleStatus, DriverStatus, TripStatus
from sqlalchemy import Date, Numeric


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.DISPATCHER.value, nullable=False)

    # Optional Profile Fields
    phone = Column(String(50), nullable=True)
    address = Column(String(255), nullable=True)
    profile_picture = Column(String(512), nullable=True)

    # Status & Account Lockout (5 failed attempts)
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(512), unique=True, index=True, nullable=False)
    is_revoked = Column(Boolean, default=False, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="refresh_tokens")


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    registration_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    vehicle_type = Column(String(100), nullable=False)
    max_load_capacity = Column(Numeric(10, 2), nullable=False)
    odometer = Column(Integer, default=0, nullable=False)
    acquisition_cost = Column(Numeric(12, 2), nullable=True)
    status = Column(String(50), default=VehicleStatus.AVAILABLE.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    trips = relationship("Trip", back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    license_category = Column(String(50), nullable=False)
    license_expiry_date = Column(Date, nullable=False)
    contact_number = Column(String(50), nullable=True)
    safety_score = Column(Numeric(5, 2), nullable=True)
    status = Column(String(50), default=DriverStatus.AVAILABLE.value, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    trips = relationship("Trip", back_populates="driver")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    trip_number = Column(String(50), unique=True, index=True, nullable=False)
    source = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    
    vehicle_id = Column(Integer, ForeignKey("vehicles.id", ondelete="RESTRICT"), nullable=False)
    driver_id = Column(Integer, ForeignKey("drivers.id", ondelete="RESTRICT"), nullable=False)
    
    cargo_weight = Column(Numeric(10, 2), nullable=False)
    planned_distance = Column(Numeric(10, 2), nullable=False)
    revenue = Column(Numeric(12, 2), nullable=False, default=0)
    
    status = Column(String(50), default=TripStatus.DRAFT.value, nullable=False)
    
    initial_odometer = Column(Integer, nullable=True)
    final_odometer = Column(Integer, nullable=True)
    fuel_consumed = Column(Numeric(10, 2), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    dispatched_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)

    vehicle = relationship("Vehicle", back_populates="trips")
    driver = relationship("Driver", back_populates="trips")
