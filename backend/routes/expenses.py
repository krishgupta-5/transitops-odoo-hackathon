from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from db.database import get_db
from db.models import Expense, Vehicle, Trip, User
from app.schemas import ExpenseCreate, ExpenseUpdate, ExpenseOut
from app.oauth2 import get_current_user, require_roles
from app.enums import UserRole, ExpenseCategory

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == expense_in.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if expense_in.trip_id is not None:
        trip = db.query(Trip).filter(Trip.id == expense_in.trip_id).first()
        if not trip:
            raise HTTPException(status_code=404, detail="Trip not found")
        if trip.vehicle_id != expense_in.vehicle_id:
            raise HTTPException(status_code=400, detail="Trip does not belong to the selected Vehicle")

    if expense_in.amount <= 0:
        raise HTTPException(status_code=422, detail="Amount must be strictly positive")

    new_expense = Expense(
        vehicle_id=expense_in.vehicle_id,
        trip_id=expense_in.trip_id,
        category=expense_in.category.value,
        amount=expense_in.amount,
        expense_date=expense_in.expense_date,
        description=expense_in.description
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/", response_model=List[ExpenseOut])
def get_expenses(
    vehicle_id: Optional[int] = None,
    trip_id: Optional[int] = None,
    category: Optional[ExpenseCategory] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER))
):
    query = db.query(Expense)
    if vehicle_id:
        query = query.filter(Expense.vehicle_id == vehicle_id)
    if trip_id:
        query = query.filter(Expense.trip_id == trip_id)
    if category:
        query = query.filter(Expense.category == category.value)
        
    return query.order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/{expense_id}", response_model=ExpenseOut)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST, UserRole.FLEET_MANAGER))
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.patch("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: int,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    update_data = expense_in.model_dump(exclude_unset=True)
    if "category" in update_data:
        update_data["category"] = update_data["category"].value

    for key, value in update_data.items():
        setattr(expense, key, value)
        
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.FINANCIAL_ANALYST))
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
        
    db.delete(expense)
    db.commit()
    return None
