export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { detail: response.statusText };
    }
    
    // Check if unauthorized and token is invalid/expired
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    const message = data.detail || 'An API error occurred';
    throw new ApiError(typeof message === 'string' ? message : JSON.stringify(message), response.status, data);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Financial Analyst API Types

export type FuelLog = {
  id: number;
  vehicle_id: number;
  trip_id: number;
  liters: number;
  cost: number;
  fuel_date: string;
  created_at: string;
  vehicle: any;
  trip: any;
};

export type ExpenseCategory = 'TOLL' | 'REPAIR' | 'INSURANCE' | 'PERMIT' | 'PARKING' | 'OTHER';

export type Expense = {
  id: number;
  vehicle_id: number;
  trip_id?: number | null;
  category: ExpenseCategory;
  amount: number;
  expense_date: string;
  description?: string | null;
  created_at: string;
  vehicle: any;
  trip?: any;
};

export type FinancialSummary = {
  total_revenue: number;
  total_operational_cost: number | null;
  total_fuel_cost: number;
  total_maintenance_cost: number | null;
  maintenance_cost_available: boolean;
  total_other_expenses: number;
  net_profit: number;
  total_actual_distance: number;
  cost_per_km: number | null;
  fleet_fuel_efficiency: number | null;
  fleet_utilization: number;
  overall_roi_percentage?: number | null;
};

export type VehicleFinancials = {
  vehicle_id: number;
  registration_number: string;
  vehicle_name: string;
  vehicle_type: string;
  revenue: number;
  fuel_cost: number;
  maintenance_cost: number | null;
  maintenance_cost_available: boolean;
  other_expenses: number;
  total_operational_cost: number | null;
  actual_distance: number;
  total_km?: number | null;
  cost_per_km: number | null;
  fuel_efficiency: number | null;
  profit: number;
  acquisition_cost: number | null;
  roi_percentage: number | null;
};

// API Functions

export const getFuelLogs = async (): Promise<FuelLog[]> => {
  return apiClient('/fuel-logs/');
};

export const createFuelLog = async (data: { vehicle_id: number; trip_id?: number; liters: number; cost: number; fuel_date: string }): Promise<FuelLog> => {
  return apiClient('/fuel-logs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getExpenses = async (): Promise<Expense[]> => {
  return apiClient('/expenses/');
};

export const createExpense = async (data: { vehicle_id: number; trip_id?: number; category: string; amount: number; expense_date: string; description?: string }): Promise<Expense> => {
  return apiClient('/expenses/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const getFinancialSummary = async (): Promise<FinancialSummary> => {
  return apiClient('/analytics/financial/summary');
};

export const getVehicleFinancialsList = async (): Promise<VehicleFinancials[]> => {
  return apiClient('/analytics/financial/vehicles');
};

export const getVehicleFinancials = async (vehicleId: number): Promise<VehicleFinancials> => {
  return apiClient(`/analytics/financial/vehicles/${vehicleId}`);
};

export const deleteFuelLog = async (id: number): Promise<void> => {
  return apiClient(`/fuel-logs/${id}`, { method: 'DELETE' });
};

export const deleteExpense = async (id: number): Promise<void> => {
  return apiClient(`/expenses/${id}`, { method: 'DELETE' });
};

export const getTrips = async (status?: string): Promise<any[]> => {
  return apiClient(status ? `/trips/?status=${status}` : '/trips/');
};

export const getVehicles = async (): Promise<any[]> => {
  return apiClient('/vehicles/');
};
