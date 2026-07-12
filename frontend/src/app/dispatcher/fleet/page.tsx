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
    // Debounce search
    const delay = setTimeout(() => {
      fetchVehicles();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_SHOP': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RETIRED': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Vehicles</h1>
          <p className="text-sm text-zinc-400 mt-1">View the active vehicle registry.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-[#18181b] p-4 rounded-lg border border-zinc-800">
        <Input 
          placeholder="Search registration or name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
        />
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-40 bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="IN_SHOP">In Shop</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#18181b] overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">REGISTRATION</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">MODEL</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">TYPE / CAP</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">ODOMETER</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase text-right">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Loading vehicles...</TableCell>
              </TableRow>
            ) : vehicles.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">No vehicles found.</TableCell>
              </TableRow>
            ) : (
              vehicles.map((v) => (
                <TableRow key={v.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-zinc-200">{v.registration_number}</TableCell>
                  <TableCell className="text-zinc-400">{v.name}</TableCell>
                  <TableCell className="text-zinc-400">
                    <div>{v.vehicle_type}</div>
                    <div className="text-xs text-zinc-500">{v.max_load_capacity} kg</div>
                  </TableCell>
                  <TableCell className="text-zinc-400">{v.odometer} km</TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={getStatusColor(v.status)}>
                      {v.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
