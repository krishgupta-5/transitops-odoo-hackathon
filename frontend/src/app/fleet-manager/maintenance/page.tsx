'use client';

import React, { useState, useEffect } from 'react';
import { Search, Wrench, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState } from '@/components/ui/LoadingState';

interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  status: string;
}

interface Maintenance {
  id: number;
  vehicle_id: number;
  service_type: string;
  service_date: string;
  cost: number;
  description: string;
  status: string;
  vehicle: Vehicle;
}

export default function FleetManagerMaintenancePage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    async function loadFilterData() {
      try {
        const vehiclesData = await apiClient('/vehicles/?limit=100');
        setVehicles(vehiclesData);
      } catch (err: any) {
        console.error("Failed to load vehicles list for filter", err);
      }
    }
    loadFilterData();
  }, []);

  const fetchMaintenances = async () => {
    setLoading(true);
    setError(null);
    try {
      const skip = (page - 1) * limit;
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (vehicleFilter !== 'all') params.append('vehicle_id', vehicleFilter);
      if (search) params.append('service_type', search);
      params.append('skip', skip.toString());
      params.append('limit', limit.toString());

      const data = await apiClient(`/maintenance/?${params.toString()}`);
      setMaintenances(data);
      setHasMore(data.length === limit);
    } catch (err: any) {
      setError(err.message || "Failed to load maintenance logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, vehicleFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMaintenances();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, vehicleFilter, page]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const isFiltered = search || statusFilter !== 'all' || vehicleFilter !== 'all';

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Maintenance Logs</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Read-only fleet servicing tracker. View scheduled and completed vehicle maintenance activities.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap gap-4 items-center bg-white dark:bg-[#121212] p-4 rounded-2xl border border-gray-200 dark:border-white/10 shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
          <Input 
            placeholder="Search service type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-full sm:w-44 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED" className="text-xs font-semibold">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS" className="text-xs font-semibold">In Progress</SelectItem>
            <SelectItem value="COMPLETED" className="text-xs font-semibold">Completed</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs font-semibold">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={vehicleFilter} onValueChange={(v) => setVehicleFilter(v || "all")}>
          <SelectTrigger className="w-full sm:w-56 bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
            <SelectValue placeholder="Filter by Vehicle" />
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
      </div>

      {/* Main Table */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs overflow-hidden flex flex-col">
        {error ? (
          <div className="p-12 text-center text-xs font-bold text-red-600 dark:text-red-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle size={28} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <LoadingState message="Loading maintenance records..." className="py-20" />
        ) : maintenances.length === 0 ? (
          <div className="p-20 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-3">
            <Wrench size={32} className="text-gray-300 dark:text-gray-655 animate-pulse" />
            <span>
              {isFiltered ? "No maintenance logs match your search filters." : "No maintenance history available."}
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">ID</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Service Type</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Date</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Cost</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</TableHead>
                  <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pr-6">Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenances.map((m) => (
                  <TableRow key={m.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-mono text-gray-500 text-xs pl-6">MNT-{String(m.id).padStart(4, '0')}</TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{m.vehicle?.registration_number}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{m.vehicle?.name}</div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-950 dark:text-white">{m.service_type}</TableCell>
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 font-mono">{m.service_date}</TableCell>
                    <TableCell className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                      ₹{Number(m.cost).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold ${getStatusColor(m.status)}`}>
                        {m.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate pr-6">
                      {m.description || '-'}
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
