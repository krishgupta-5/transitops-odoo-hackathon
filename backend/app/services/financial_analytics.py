from sqlalchemy.orm import Session
from sqlalchemy import func
from db.models import Trip, FuelLog, Expense, Vehicle
from app.enums import TripStatus, VehicleStatus

def get_financial_summary(db: Session):
    # Total Revenue (Only completed trips)
    total_revenue = db.query(func.sum(Trip.revenue)).filter(Trip.status == TripStatus.COMPLETED.value).scalar() or 0.0

    # Total Fuel Cost (Actual expense from FuelLog)
    total_fuel_cost = db.query(func.sum(FuelLog.cost)).scalar() or 0.0

    # Total Other Expenses (From Expense)
    total_other_expenses = db.query(func.sum(Expense.amount)).scalar() or 0.0

    # Maintenance Cost (Currently isolated because Safety/Maintenance is not merged)
    # The integration is pending the other developer's merge.
    # We must explicitly return null for maintenance and indicate it's unavailable.
    total_maintenance_cost = None
    maintenance_cost_available = False

    # Operational Cost = Fuel Cost + Maintenance Cost
    total_operational_cost = None
    if maintenance_cost_available and total_maintenance_cost is not None:
        total_operational_cost = float(total_fuel_cost) + float(total_maintenance_cost)

    # Net Profit
    # Net Profit = Revenue - Fuel Cost - Maintenance Cost - Other Expenses
    # Since maintenance is missing, we use 0 for it in the net profit calculation
    net_profit = float(total_revenue) - float(total_fuel_cost) - 0.0 - float(total_other_expenses)

    # Distance and Fuel Efficiency
    completed_trips = db.query(Trip).filter(
        Trip.status == TripStatus.COMPLETED.value,
        Trip.initial_odometer.isnot(None),
        Trip.final_odometer.isnot(None)
    ).all()

    total_actual_distance = 0.0
    total_fuel_consumed = 0.0

    for t in completed_trips:
        if t.final_odometer >= t.initial_odometer:
            total_actual_distance += (t.final_odometer - t.initial_odometer)
        if t.fuel_consumed:
            total_fuel_consumed += float(t.fuel_consumed)

    cost_per_km = None
    if total_actual_distance > 0 and total_operational_cost is not None:
        cost_per_km = total_operational_cost / total_actual_distance

    fleet_fuel_efficiency = None
    if total_fuel_consumed > 0:
        fleet_fuel_efficiency = total_actual_distance / total_fuel_consumed

    # Fleet Utilization
    operational_statuses = [VehicleStatus.AVAILABLE.value, VehicleStatus.ON_TRIP.value, VehicleStatus.IN_SHOP.value]
    operational_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status.in_(operational_statuses)).scalar() or 0
    on_trip_vehicles = db.query(func.count(Vehicle.id)).filter(Vehicle.status == VehicleStatus.ON_TRIP.value).scalar() or 0
    
    fleet_utilization = 0.0
    if operational_vehicles > 0:
        fleet_utilization = (on_trip_vehicles / operational_vehicles) * 100

    return {
        "total_revenue": float(total_revenue),
        "total_operational_cost": total_operational_cost,
        "total_fuel_cost": float(total_fuel_cost),
        "total_maintenance_cost": total_maintenance_cost,
        "maintenance_cost_available": maintenance_cost_available,
        "total_other_expenses": float(total_other_expenses),
        "net_profit": net_profit,
        "total_actual_distance": total_actual_distance,
        "cost_per_km": cost_per_km,
        "fleet_fuel_efficiency": fleet_fuel_efficiency,
        "fleet_utilization": fleet_utilization
    }

def get_vehicle_financials(db: Session, vehicle_id: int):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        return None

    # Revenue
    revenue = db.query(func.sum(Trip.revenue)).filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status == TripStatus.COMPLETED.value
    ).scalar() or 0.0

    # Costs
    fuel_cost = db.query(func.sum(FuelLog.cost)).filter(FuelLog.vehicle_id == vehicle_id).scalar() or 0.0
    other_expenses = db.query(func.sum(Expense.amount)).filter(Expense.vehicle_id == vehicle_id).scalar() or 0.0
    maintenance_cost = None
    maintenance_cost_available = False

    # Operational Cost = Fuel Cost + Maintenance Cost
    total_operational_cost = None
    if maintenance_cost_available and maintenance_cost is not None:
        total_operational_cost = float(fuel_cost) + float(maintenance_cost)

    # Net Profit = Revenue - Fuel Cost - Maintenance Cost - Other Expenses
    profit = float(revenue) - float(fuel_cost) - 0.0 - float(other_expenses)

    # ROI = (Revenue - (Maintenance Cost + Fuel Cost)) / Acquisition Cost
    # Other expenses are explicitly excluded from ROI
    roi_percentage = None
    if vehicle.acquisition_cost and vehicle.acquisition_cost > 0 and total_operational_cost is not None:
        roi_percentage = ((float(revenue) - total_operational_cost) / float(vehicle.acquisition_cost)) * 100

    # Distance and Efficiency
    completed_trips = db.query(Trip).filter(
        Trip.vehicle_id == vehicle_id,
        Trip.status == TripStatus.COMPLETED.value,
        Trip.initial_odometer.isnot(None),
        Trip.final_odometer.isnot(None)
    ).all()

    actual_distance = 0.0
    total_fuel_consumed = 0.0

    for t in completed_trips:
        if t.final_odometer >= t.initial_odometer:
            actual_distance += (t.final_odometer - t.initial_odometer)
        if t.fuel_consumed:
            total_fuel_consumed += float(t.fuel_consumed)

    cost_per_km = None
    if actual_distance > 0 and total_operational_cost is not None:
        cost_per_km = total_operational_cost / actual_distance

    fuel_efficiency = None
    if total_fuel_consumed > 0:
        fuel_efficiency = actual_distance / total_fuel_consumed

    return {
        "vehicle_id": vehicle.id,
        "registration_number": vehicle.registration_number,
        "vehicle_name": vehicle.name,
        "vehicle_type": vehicle.vehicle_type,
        "revenue": float(revenue),
        "fuel_cost": float(fuel_cost),
        "maintenance_cost": maintenance_cost,
        "maintenance_cost_available": maintenance_cost_available,
        "other_expenses": float(other_expenses),
        "total_operational_cost": total_operational_cost,
        "actual_distance": actual_distance,
        "cost_per_km": cost_per_km,
        "fuel_efficiency": fuel_efficiency,
        "profit": profit,
        "acquisition_cost": float(vehicle.acquisition_cost) if vehicle.acquisition_cost else None,
        "roi_percentage": roi_percentage
    }
