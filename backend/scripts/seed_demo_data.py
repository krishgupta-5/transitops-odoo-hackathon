"""
TransitOps Full Operational Demo Seeding Script

This script creates users, vehicles, drivers, trips, fuel logs, expenses, 
and maintenance logs to establish a rich, realistic development environment.
All entities are seeded idempotently, preventing duplicates if executed repeatedly.

Usage:
    cd backend
    python3 -m scripts.seed_demo_data
"""

import sys
import os
from datetime import datetime, date, timezone, timedelta
from decimal import Decimal

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import SessionLocal
from db import models
from app.enums import UserRole, VehicleStatus, DriverStatus, TripStatus, MaintenanceStatus, ExpenseCategory
from app.utils import hash_password

# Constants
DEMO_PASSWORD = "transitops2026"
BASE_DATE = date(2026, 7, 12)

def seed_data():
    db = SessionLocal()
    try:
        print("--- Seeding Demo Users ---")
        hashed_pw = hash_password(DEMO_PASSWORD)
        
        users_to_seed = [
            {"name": "Demo Fleet Manager", "email": "fleet@transitops.demo", "role": UserRole.FLEET_MANAGER.value},
            {"name": "Demo Dispatcher", "email": "dispatcher@transitops.demo", "role": UserRole.DISPATCHER.value},
            {"name": "Demo Safety Officer", "email": "safety@transitops.demo", "role": UserRole.SAFETY_OFFICER.value},
            {"name": "Demo Financial Analyst", "email": "finance@transitops.demo", "role": UserRole.FINANCIAL_ANALYST.value},
        ]
        
        seeded_users = {}
        for u in users_to_seed:
            user = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not user:
                user = models.User(
                    name=u["name"],
                    email=u["email"],
                    hashed_password=hashed_pw,
                    role=u["role"],
                    is_active=True
                )
                db.add(user)
                db.flush()
                print(f"Created user: {u['email']}")
            else:
                print(f"Skipped existing user: {u['email']}")
            seeded_users[u["role"]] = user

        print("\n--- Seeding Vehicles ---")
        vehicles_to_seed = [
            {
                "registration_number": "MH-12-PQ-9999",
                "name": "Tata Prima 4028.S",
                "vehicle_type": "TRUCK",
                "max_load_capacity": Decimal("25000.00"),
                "odometer": 45000,
                "acquisition_cost": Decimal("3500000.00"),
                "status": VehicleStatus.AVAILABLE.value
            },
            {
                "registration_number": "KA-03-TR-8888",
                "name": "Ashok Leyland 3520",
                "vehicle_type": "TRUCK",
                "max_load_capacity": Decimal("20000.00"),
                "odometer": 62500,
                "acquisition_cost": Decimal("3100000.00"),
                "status": VehicleStatus.ON_TRIP.value
            },
            {
                "registration_number": "DL-01-AB-1234",
                "name": "Mahindra Bolero Pickup",
                "vehicle_type": "LCV",
                "max_load_capacity": Decimal("3500.00"),
                "odometer": 15200,
                "acquisition_cost": Decimal("950000.00"),
                "status": VehicleStatus.IN_SHOP.value
            },
            {
                "registration_number": "GJ-01-XY-5678",
                "name": "Force Traveller Monobus",
                "vehicle_type": "VAN",
                "max_load_capacity": Decimal("2500.00"),
                "odometer": 22100,
                "acquisition_cost": Decimal("1500000.00"),
                "status": VehicleStatus.AVAILABLE.value
            },
            {
                "registration_number": "KL-07-CD-4321",
                "name": "BharatBenz 2823R",
                "vehicle_type": "TRUCK",
                "max_load_capacity": Decimal("30000.00"),
                "odometer": 85000,
                "acquisition_cost": Decimal("3800000.00"),
                "status": VehicleStatus.AVAILABLE.value
            }
        ]

        seeded_vehicles = {}
        for v_data in vehicles_to_seed:
            v = db.query(models.Vehicle).filter(models.Vehicle.registration_number == v_data["registration_number"]).first()
            if not v:
                v = models.Vehicle(**v_data)
                db.add(v)
                db.flush()
                print(f"Created vehicle: {v_data['registration_number']} ({v_data['name']})")
            else:
                # Keep database odometer/status in sync if already exists, but log skipping
                print(f"Skipped existing vehicle: {v_data['registration_number']}")
            seeded_vehicles[v_data["registration_number"]] = v

        print("\n--- Seeding Drivers ---")
        drivers_to_seed = [
            {
                "name": "Rajesh Kumar",
                "license_number": "MH-14-2015-0012345",
                "license_category": "HMV",
                "license_expiry_date": date(2030, 12, 31),
                "contact_number": "+91 98765 43210",
                "safety_score": Decimal("92.50"),
                "status": DriverStatus.AVAILABLE.value
            },
            {
                "name": "Amit Patel",
                "license_number": "GJ-01-2012-0054321",
                "license_category": "LMV",
                "license_expiry_date": date(2026, 8, 5), # Expiring soon
                "contact_number": "+91 99887 76655",
                "safety_score": Decimal("85.00"),
                "status": DriverStatus.AVAILABLE.value
            },
            {
                "name": "Vikram Singh",
                "license_number": "DL-03-2005-0098765",
                "license_category": "HMV",
                "license_expiry_date": date(2025, 5, 10), # Expired
                "contact_number": "+91 97766 55443",
                "safety_score": Decimal("78.00"),
                "status": DriverStatus.AVAILABLE.value
            },
            {
                "name": "Suresh Raina",
                "license_number": "KA-05-2018-0076543",
                "license_category": "HMV",
                "license_expiry_date": date(2029, 4, 15),
                "contact_number": "+91 95544 33221",
                "safety_score": Decimal("95.00"),
                "status": DriverStatus.ON_TRIP.value
            },
            {
                "name": "Harpreet Singh",
                "license_number": "PB-02-2016-0043210",
                "license_category": "HMV",
                "license_expiry_date": date(2028, 9, 20),
                "contact_number": "+91 91122 33445",
                "safety_score": Decimal("55.00"), # Critical safety score
                "status": DriverStatus.AVAILABLE.value
            }
        ]

        seeded_drivers = {}
        for d_data in drivers_to_seed:
            d = db.query(models.Driver).filter(models.Driver.license_number == d_data["license_number"]).first()
            if not d:
                d = models.Driver(**d_data)
                db.add(d)
                db.flush()
                print(f"Created driver: {d_data['name']}")
            else:
                print(f"Skipped existing driver: {d_data['name']}")
            seeded_drivers[d_data["name"]] = d

        print("\n--- Seeding Trips ---")
        trips_to_seed = [
            {
                "trip_number": "TRIP-000001",
                "source": "Mumbai",
                "destination": "Pune",
                "vehicle_id": seeded_vehicles["MH-12-PQ-9999"].id,
                "driver_id": seeded_drivers["Rajesh Kumar"].id,
                "cargo_weight": Decimal("18000.00"),
                "planned_distance": Decimal("150.00"),
                "revenue": Decimal("35000.00"),
                "status": TripStatus.COMPLETED.value,
                "initial_odometer": 44850,
                "final_odometer": 45000,
                "fuel_consumed": Decimal("45.00"),
                "dispatched_at": datetime.now(timezone.utc) - timedelta(days=2),
                "completed_at": datetime.now(timezone.utc) - timedelta(days=2, hours=4)
            },
            {
                "trip_number": "TRIP-000002",
                "source": "Bangalore",
                "destination": "Chennai",
                "vehicle_id": seeded_vehicles["KA-03-TR-8888"].id,
                "driver_id": seeded_drivers["Suresh Raina"].id,
                "cargo_weight": Decimal("15000.00"),
                "planned_distance": Decimal("350.00"),
                "revenue": Decimal("75000.00"),
                "status": TripStatus.COMPLETED.value,
                "initial_odometer": 62150,
                "final_odometer": 62500,
                "fuel_consumed": Decimal("105.00"),
                "dispatched_at": datetime.now(timezone.utc) - timedelta(days=1),
                "completed_at": datetime.now(timezone.utc) - timedelta(days=1, hours=8)
            },
            {
                "trip_number": "TRIP-000003",
                "source": "Chennai",
                "destination": "Bangalore",
                "vehicle_id": seeded_vehicles["KA-03-TR-8888"].id,
                "driver_id": seeded_drivers["Suresh Raina"].id,
                "cargo_weight": Decimal("12000.00"),
                "planned_distance": Decimal("350.00"),
                "revenue": Decimal("72000.00"),
                "status": TripStatus.DISPATCHED.value,
                "initial_odometer": 62500,
                "final_odometer": None,
                "fuel_consumed": None,
                "dispatched_at": datetime.now(timezone.utc) - timedelta(hours=4)
            },
            {
                "trip_number": "TRIP-000004",
                "source": "Delhi",
                "destination": "Jaipur",
                "vehicle_id": seeded_vehicles["GJ-01-XY-5678"].id,
                "driver_id": seeded_drivers["Amit Patel"].id,
                "cargo_weight": Decimal("2000.00"),
                "planned_distance": Decimal("270.00"),
                "revenue": Decimal("18000.00"),
                "status": TripStatus.DRAFT.value,
                "initial_odometer": 22100,
                "final_odometer": None,
                "fuel_consumed": None
            }
        ]

        seeded_trips = {}
        for t_data in trips_to_seed:
            t = db.query(models.Trip).filter(models.Trip.trip_number == t_data["trip_number"]).first()
            if not t:
                t = models.Trip(**t_data)
                db.add(t)
                db.flush()
                print(f"Created trip: {t_data['trip_number']}")
            else:
                print(f"Skipped existing trip: {t_data['trip_number']}")
            seeded_trips[t_data["trip_number"]] = t

        print("\n--- Seeding Fuel Logs ---")
        # 1:1 linked to completed trips
        fuel_logs_to_seed = [
            {
                "vehicle_id": seeded_vehicles["MH-12-PQ-9999"].id,
                "trip_id": seeded_trips["TRIP-000001"].id,
                "liters": Decimal("45.00"),
                "cost": Decimal("4500.00"),
                "fuel_date": date(2026, 7, 10)
            },
            {
                "vehicle_id": seeded_vehicles["KA-03-TR-8888"].id,
                "trip_id": seeded_trips["TRIP-000002"].id,
                "liters": Decimal("105.00"),
                "cost": Decimal("10500.00"),
                "fuel_date": date(2026, 7, 11)
            }
        ]

        for fl_data in fuel_logs_to_seed:
            fl = db.query(models.FuelLog).filter(models.FuelLog.trip_id == fl_data["trip_id"]).first()
            if not fl:
                fl = models.FuelLog(**fl_data)
                db.add(fl)
                db.flush()
                print(f"Created fuel log for Trip ID: {fl_data['trip_id']}")
            else:
                print(f"Skipped existing fuel log for Trip ID: {fl_data['trip_id']}")

        print("\n--- Seeding Maintenance logs ---")
        maintenance_to_seed = [
            {
                "vehicle_id": seeded_vehicles["DL-01-AB-1234"].id,
                "service_type": "Engine Oil Change",
                "service_date": "2026-07-12",
                "cost": Decimal("4500.00"),
                "description": "Routine scheduled synthetic oil change and filter replacement.",
                "status": "IN_PROGRESS",
                "started_at": datetime.now(timezone.utc) - timedelta(hours=3)
            },
            {
                "vehicle_id": seeded_vehicles["MH-12-PQ-9999"].id,
                "service_type": "Brake Pad Replacement",
                "service_date": "2026-07-05",
                "cost": Decimal("8500.00"),
                "description": "Front and rear semi-metallic brake pad replacement.",
                "status": "COMPLETED",
                "started_at": datetime.now(timezone.utc) - timedelta(days=7, hours=5),
                "completed_at": datetime.now(timezone.utc) - timedelta(days=7)
            },
            {
                "vehicle_id": seeded_vehicles["KL-07-CD-4321"].id,
                "service_type": "Tire Rotation",
                "service_date": "2026-07-20",
                "cost": Decimal("6000.00"),
                "description": "10-wheel tire rotation and pressure balance check.",
                "status": "SCHEDULED"
            }
        ]

        for m_data in maintenance_to_seed:
            m = db.query(models.Maintenance).filter(
                models.Maintenance.vehicle_id == m_data["vehicle_id"],
                models.Maintenance.service_type == m_data["service_type"],
                models.Maintenance.service_date == m_data["service_date"]
            ).first()
            if not m:
                m = models.Maintenance(**m_data)
                db.add(m)
                db.flush()
                print(f"Created maintenance: {m_data['service_type']}")
            else:
                print(f"Skipped existing maintenance: {m_data['service_type']}")

        print("\n--- Seeding Expenses ---")
        expenses_to_seed = [
            # Trip specific expenses
            {
                "vehicle_id": seeded_vehicles["MH-12-PQ-9999"].id,
                "trip_id": seeded_trips["TRIP-000001"].id,
                "category": ExpenseCategory.TOLL,
                "amount": Decimal("500.00"),
                "expense_date": date(2026, 7, 10),
                "description": "Mumbai-Pune Expressway toll charge."
            },
            {
                "vehicle_id": seeded_vehicles["KA-03-TR-8888"].id,
                "trip_id": seeded_trips["TRIP-000002"].id,
                "category": ExpenseCategory.TOLL,
                "amount": Decimal("1200.00"),
                "expense_date": date(2026, 7, 11),
                "description": "NH48 highway tolls."
            },
            # Vehicle level general expenses
            {
                "vehicle_id": seeded_vehicles["KL-07-CD-4321"].id,
                "trip_id": None,
                "category": ExpenseCategory.INSURANCE,
                "amount": Decimal("45000.00"),
                "expense_date": date(2026, 7, 1),
                "description": "Annual commercial fleet insurance premium renewal."
            },
            {
                "vehicle_id": seeded_vehicles["GJ-01-XY-5678"].id,
                "trip_id": None,
                "category": ExpenseCategory.PERMIT,
                "amount": Decimal("8000.00"),
                "expense_date": date(2026, 7, 5),
                "description": "All India Tourist Permit renewal fee."
            }
        ]

        for e_data in expenses_to_seed:
            e = db.query(models.Expense).filter(
                models.Expense.vehicle_id == e_data["vehicle_id"],
                models.Expense.amount == e_data["amount"],
                models.Expense.expense_date == e_data["expense_date"],
                models.Expense.category == e_data["category"].value
            ).first()
            if not e:
                e = models.Expense(
                    vehicle_id=e_data["vehicle_id"],
                    trip_id=e_data["trip_id"],
                    category=e_data["category"].value,
                    amount=e_data["amount"],
                    expense_date=e_data["expense_date"],
                    description=e_data["description"]
                )
                db.add(e)
                db.flush()
                print(f"Created expense category {e_data['category'].value} of ₹{e_data['amount']}")
            else:
                print(f"Skipped existing expense of ₹{e_data['amount']}")

        db.commit()
        print("\nDemo seeding completed successfully and commit finalized!")
        
    except Exception as ex:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {ex}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("Initializing TransitOps database seeding...\n")
    seed_data()
