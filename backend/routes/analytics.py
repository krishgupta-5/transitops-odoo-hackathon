from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from db.database import get_db
from db.models import User, Vehicle
from app.oauth2 import require_roles
from app.enums import UserRole
from app.services.financial_analytics import get_financial_summary, get_vehicle_financials

router = APIRouter(
    prefix="/api/v1/analytics",
    tags=["Analytics"]
)

@router.get("/financial/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.FINANCIAL_ANALYST]))
):
    return get_financial_summary(db)

@router.get("/financial/vehicles")
def list_vehicle_financials(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.FINANCIAL_ANALYST]))
):
    vehicles = db.query(Vehicle).all()
    results = []
    for v in vehicles:
        fin = get_vehicle_financials(db, v.id)
        if fin:
            results.append(fin)
    return results

@router.get("/financial/vehicles/{vehicle_id}")
def get_single_vehicle_financials(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.FINANCIAL_ANALYST]))
):
    fin = get_vehicle_financials(db, vehicle_id)
    if not fin:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return fin
