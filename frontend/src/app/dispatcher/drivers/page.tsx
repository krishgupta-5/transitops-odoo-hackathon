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
import { AlertCircle } from "lucide-react";

type Driver = {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number | null;
  status: string;
};

export default function DispatcherDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      let query = "?";
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (search) query += `search=${search}&`;
      
      const data = await apiClient(`/drivers/${query}`);
      setDrivers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDrivers();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'OFF_DUTY': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SUSPENDED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const getLicenseStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expiry < now) {
      return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 gap-1"><AlertCircle className="w-3 h-3"/> EXPIRED</Badge>;
    } else if (expiry <= thirtyDaysFromNow) {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 gap-1"><AlertCircle className="w-3 h-3"/> EXPIRING SOON</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Drivers & Safety Profiles</h1>
          <p className="text-sm text-zinc-400 mt-1">View the fleet driver directory and active statuses.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-[#18181b] p-4 rounded-lg border border-zinc-800">
        <Input 
          placeholder="Search name or license..." 
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
            <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-[#18181b] overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">NAME</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">LICENSE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">EXPIRY</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">SAFETY SCORE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase text-right">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">Loading drivers...</TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={5} className="text-center py-8 text-zinc-500">No drivers found.</TableCell>
              </TableRow>
            ) : (
              drivers.map((d) => (
                <TableRow key={d.id} className="border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                  <TableCell className="font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      {d.name}
                      {getLicenseStatus(d.license_expiry_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-400">
                    <div>{d.license_number}</div>
                    <div className="text-xs text-zinc-500">{d.license_category}</div>
                  </TableCell>
                  <TableCell className="text-zinc-400">{d.license_expiry_date}</TableCell>
                  <TableCell className="text-zinc-400">
                    {d.safety_score !== null ? `${d.safety_score}/100` : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="outline" className={getStatusColor(d.status)}>
                      {d.status.replace('_', ' ')}
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
