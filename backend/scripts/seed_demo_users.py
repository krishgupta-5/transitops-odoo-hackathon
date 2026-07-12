"""
TransitOps Demo User Seed Script

Creates four demo users (one per role) for development and testing.
Idempotent — safe to run multiple times without creating duplicates.

Usage:
    cd backend
    python3 -m scripts.seed_demo_users

Demo password for all users: transitops2026
"""

import sys
import os

# Ensure the backend root is on the path so imports resolve
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.enums import UserRole
from app.utils import hash_password
from db.database import SessionLocal
from db import models

# ──────────────────────────────────────────────
# DEVELOPMENT-ONLY demo password (all 4 users)
DEMO_PASSWORD = "transitops2026"
# ──────────────────────────────────────────────

DEMO_USERS = [
    {
        "name": "Demo Fleet Manager",
        "email": "fleet@transitops.demo",
        "role": UserRole.FLEET_MANAGER.value,
    },
    {
        "name": "Demo Dispatcher",
        "email": "dispatcher@transitops.demo",
        "role": UserRole.DISPATCHER.value,
    },
    {
        "name": "Demo Safety Officer",
        "email": "safety@transitops.demo",
        "role": UserRole.SAFETY_OFFICER.value,
    },
    {
        "name": "Demo Financial Analyst",
        "email": "finance@transitops.demo",
        "role": UserRole.FINANCIAL_ANALYST.value,
    },
]


def seed():
    db = SessionLocal()
    try:
        hashed = hash_password(DEMO_PASSWORD)

        created = 0
        skipped = 0

        for user_data in DEMO_USERS:
            existing = db.query(models.User).filter(
                models.User.email == user_data["email"]
            ).first()

            if existing:
                print(f"  ⏭  Already exists: {user_data['email']} ({user_data['role']})")
                skipped += 1
                continue

            new_user = models.User(
                name=user_data["name"],
                email=user_data["email"],
                hashed_password=hashed,
                role=user_data["role"],
                is_active=True,
            )
            db.add(new_user)
            print(f"  ✅ Created: {user_data['email']} ({user_data['role']})")
            created += 1

        db.commit()
        print(f"\nDone — {created} created, {skipped} skipped (already existed).")

    finally:
        db.close()


if __name__ == "__main__":
    print("🚀 Seeding TransitOps demo users...\n")
    seed()
