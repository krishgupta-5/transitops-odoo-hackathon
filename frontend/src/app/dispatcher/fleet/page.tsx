'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
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

type Vehicle = {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  status: string;
};

export default function DispatcherFleetPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      let query = "?";
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (typeFilter !== 'all') query += `vehicle_type=${typeFilter}&`;
      if (search) query += `search=${search}&`;
      
      const data = await apiClient(`/vehicles/${query}`);
      setVehicles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs border-none">Available</Badge>;
      case 'ON_TRIP':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-none">On Trip</Badge>;
      case 'IN_SHOP':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-xs border-none">In Shop</Badge>;
      case 'RETIRED':
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs border-none">Retired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fleet Status</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input 
          placeholder="Search registration or model name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold"
        />
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE" className="text-xs font-semibold">Available</SelectItem>
            <SelectItem value="ON_TRIP" className="text-xs font-semibold">On Trip</SelectItem>
            <SelectItem value="IN_SHOP" className="text-xs font-semibold">In Shop</SelectItem>
            <SelectItem value="RETIRED" className="text-xs font-semibold">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading vehicles..." className="py-20" />
        ) : vehicles.length === 0 ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">No vehicles found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Registration</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Model</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Type / Capacity</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Odometer</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-bold text-xs text-gray-900 dark:text-white pl-6">{v.registration_number}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">{v.name}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">{v.vehicle_type} / {v.max_load_capacity} kg</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">{v.odometer.toLocaleString()} km</TableCell>
                  <TableCell className="pr-6">
                    {getStatusBadge(v.status)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
