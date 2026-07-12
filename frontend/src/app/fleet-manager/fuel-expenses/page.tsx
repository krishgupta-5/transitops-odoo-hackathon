'use client';

import React, { useState, useEffect } from 'react';
import { Search, Fuel, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState } from '@/components/ui/LoadingState';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
}

interface Trip {
  id: number;
  trip_number: string;
  source: string;
  destination: string;
}

interface FuelLog {
  id: number;
  vehicle_id: number;
  trip_id: number;
  liters: number;
  cost: number;
  fuel_date: string;
  vehicle?: Vehicle;
  trip?: Trip;
}

interface Expense {
  id: number;
  vehicle_id: number;
  trip_id: number | null;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
  vehicle?: Vehicle;
  trip?: Trip;
}

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FleetManagerFuelExpensesPage() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lists & Paginations
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await apiClient('/vehicles/?limit=100');
        setVehicles(data);
      } catch (err) {
        console.error("Failed to load vehicles list", err);
      }
    }
    loadVehicles();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const params = new URLSearchParams();
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());
      if (vehicleFilter !== 'all') params.append('vehicle_id', vehicleFilter);

      if (activeTab === 'fuel') {
        const data = await apiClient(`/fuel-logs/?${params.toString()}`);
        // Fetch detailed vehicle/trip objects if not fully loaded by backend
        // Since get_fuel_logs returns Vehicle/Trip relations or IDs, let's make sure it handles it
        // The backend GET /fuel-logs/ returns FuelLogOut schema which includes relationship info
        setFuelLogs(data);
        setHasMore(data.length === limit);
      } else {
        if (categoryFilter !== 'all') params.append('category', categoryFilter);
        const data = await apiClient(`/expenses/?${params.toString()}`);
        setExpenses(data);
        setHasMore(data.length === limit);
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve records from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab, vehicleFilter, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [activeTab, vehicleFilter, categoryFilter, page]);

  // Client-side filtering helper for description or details
  const filteredFuelLogs = fuelLogs.filter(log => {
    if (!search) return true;
    const matchReg = log.vehicle?.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchTrip = log.trip?.trip_number?.toLowerCase().includes(search.toLowerCase());
    return matchReg || matchTrip;
  });

  const filteredExpenses = expenses.filter(exp => {
    if (!search) return true;
    const matchReg = exp.vehicle?.registration_number?.toLowerCase().includes(search.toLowerCase());
    const matchDesc = exp.description?.toLowerCase().includes(search.toLowerCase());
    return matchReg || matchDesc;
  });

  const isFiltered = search || vehicleFilter !== 'all' || (activeTab === 'expenses' && categoryFilter !== 'all');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Fleet Cost & Financial Visibility</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Read-only financial operations tracking. Monitor logged fuel purchases and auxiliary trip expenses.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-white/10">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'fuel'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-gray-400 dark:text-gray-550 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Fuel size={14} />
          <span>Fuel Logs</span>
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'expenses'
              ? 'border-black dark:border-white text-black dark:text-white'
              : 'border-transparent text-gray-400 dark:text-gray-550 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <DollarSign size={14} />
          <span>Operational Expenses</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input 
            placeholder={activeTab === 'fuel' ? "Search Reg or Trip..." : "Search Reg or Desc..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold"
          />
        </div>

        <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v || "all")}>
          <SelectTrigger className="w-full sm:w-56 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
            <SelectValue placeholder="All Vehicles" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">All Vehicles</SelectItem>
            {vehicles.map(v => (
              <SelectItem key={v.id} value={v.id.toString()} className="text-xs font-semibold">
                {v.registration_number} — {v.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeTab === 'expenses' && (
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v || "all")}>
            <SelectTrigger className="w-full sm:w-44 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl">
              <SelectItem value="all" className="text-xs font-semibold">All Categories</SelectItem>
              <SelectItem value="TOLL" className="text-xs font-semibold">Toll</SelectItem>
              <SelectItem value="REPAIR" className="text-xs font-semibold">Repair</SelectItem>
              <SelectItem value="INSURANCE" className="text-xs font-semibold">Insurance</SelectItem>
              <SelectItem value="PERMIT" className="text-xs font-semibold">Permit</SelectItem>
              <SelectItem value="PARKING" className="text-xs font-semibold">Parking</SelectItem>
              <SelectItem value="OTHER" className="text-xs font-semibold">Other</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs overflow-hidden flex flex-col">
        {error ? (
          <div className="p-12 text-center text-xs font-bold text-red-600 dark:text-red-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={28} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <LoadingState message={activeTab === 'fuel' ? "Loading fuel logs..." : "Loading expenses..."} className="py-20" />
        ) : (activeTab === 'fuel' ? filteredFuelLogs.length === 0 : filteredExpenses.length === 0) ? (
          <div className="p-20 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
            {activeTab === 'fuel' ? <Fuel size={32} className="text-gray-300" /> : <DollarSign size={32} className="text-gray-300" />}
            <span>
              {isFiltered ? "No operational costs match your search filters." : "No records recorded."}
            </span>
          </div>
        ) : activeTab === 'fuel' ? (
          /* FUEL LOGS VIEW */
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Date</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Trip Number</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Route</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Fuel Consumed</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Unit Price</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pr-6 text-right">Total Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFuelLogs.map((log) => {
                  const unitPrice = log.liters > 0 ? log.cost / log.liters : 0;
                  return (
                    <TableRow key={log.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 pl-6">{new Date(log.fuel_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs font-bold text-gray-900 dark:text-white">
                        {log.trip?.trip_number || `-`}
                      </TableCell>
                      <TableCell className="py-3">
                        <div className="font-bold text-xs text-gray-900 dark:text-white">{log.vehicle?.registration_number}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{log.vehicle?.name}</div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {log.trip ? `${log.trip.source} → ${log.trip.destination}` : '-'}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-gray-900 dark:text-white font-mono">{log.liters} L</TableCell>
                      <TableCell className="text-xs font-semibold text-gray-550 dark:text-gray-400 font-mono">₹{unitPrice.toFixed(2)}/L</TableCell>
                      <TableCell className="text-xs font-bold text-gray-950 dark:text-white text-right pr-6 font-mono">
                        {formatINR(log.cost)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          /* EXPENSES VIEW */
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Date</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Trip Number</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Description</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pr-6 text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((exp) => (
                  <TableRow key={exp.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 pl-6">{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{exp.vehicle?.registration_number}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{exp.vehicle?.name}</div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-gray-750 dark:text-gray-300 font-mono">
                      {exp.trip?.trip_number || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04] text-gray-700 dark:text-gray-300">
                        {exp.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {exp.description || '-'}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-950 dark:text-white text-right pr-6 font-mono">
                      {formatINR(exp.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
