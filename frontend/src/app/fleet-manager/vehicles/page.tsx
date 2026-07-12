'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/LoadingState";
import { formatWeight, formatDistance } from "@/lib/utils";

type Vehicle = {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  status: string;
};

export default function FleetVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let query = `?skip=${skip}&limit=${limit}&`;
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (typeFilter !== 'all') query += `vehicle_type=${typeFilter}&`;
      if (search) query += `search=${search}&`;
      
      const data = await apiClient(`/vehicles/${query}`);
      setVehicles(data);
      setHasMore(data.length === limit);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to page 1 on filter/search change
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, typeFilter, page]);

  const getVehicleStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10B981',
          borderColor: 'rgba(16, 185, 129, 0.4)',
        };
      case 'ON_TRIP':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          color: '#3B82F6',
          borderColor: 'rgba(59, 130, 246, 0.4)',
        };
      case 'IN_SHOP':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          borderColor: 'rgba(245, 158, 11, 0.4)',
        };
      case 'RETIRED':
        return {
          backgroundColor: 'rgba(156, 163, 175, 0.15)',
          color: '#9CA3AF',
          borderColor: 'rgba(156, 163, 175, 0.4)',
        };
      default:
        return {
          backgroundColor: 'rgba(156, 163, 175, 0.15)',
          color: '#9CA3AF',
          borderColor: 'rgba(156, 163, 175, 0.4)',
        };
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-[1040px] mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Vehicles
          </h1>
        </div>
        <Link
          href="/fleet-manager/vehicles/create"
          className="bg-black dark:bg-white text-white dark:text-black text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
        >
          + Add Vehicle
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input 
          placeholder="Search vehicles..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-transparent border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder:text-gray-400 font-mono text-xs h-9 rounded-xl focus-visible:ring-1 focus-visible:ring-gray-400"
        />
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-44 bg-transparent border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-mono text-xs rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#0F0F0F] border-gray-200 dark:border-gray-800 font-mono text-xs rounded-xl">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="IN_SHOP">In Shop</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicles Table Container */}
      <div className="border border-gray-200/80 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#0F0F0F] overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">REGISTRATION</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">MODEL</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">TYPE / CAP</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">ODOMETER</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">STATUS</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-0">
                <TableCell colSpan={6} className="py-0">
                  <LoadingState message="Loading vehicles..." className="py-16 min-h-[220px]" />
                </TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow className="border-0">
                <TableCell colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                  {search || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? "No vehicles match your current filters." 
                    : "No vehicles registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-semibold text-gray-900 dark:text-white">{v.registration_number}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{v.name}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    <div>{v.vehicle_type}</div>
                    <div className="text-[11px] text-gray-400">{formatWeight(v.max_load_capacity)}</div>
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDistance(v.odometer)}</TableCell>
                  <TableCell>
                    <span
                      style={getVehicleStatusStyle(v.status)}
                      className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                    >
                      {v.status.replace('_', ' ')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/fleet-manager/vehicles/${v.id}`}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
