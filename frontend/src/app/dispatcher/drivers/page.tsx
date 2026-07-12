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
import { LoadingState } from "@/components/ui/LoadingState";

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs border-none">Available</Badge>;
      case 'ON_TRIP':
        return <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-none">On Trip</Badge>;
      case 'OFF_DUTY':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-xs border-none">Off Duty</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs border-none">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLicenseStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expiry < now) {
      return <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 text-[10px] font-bold"><AlertCircle className="w-3 h-3"/> EXPIRED</Badge>;
    } else if (expiry <= thirtyDaysFromNow) {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 gap-1 text-[10px] font-bold"><AlertCircle className="w-3 h-3"/> EXPIRING SOON</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Drivers</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input 
          placeholder="Search name or license number..." 
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
            <SelectItem value="OFF_DUTY" className="text-xs font-semibold">Off Duty</SelectItem>
            <SelectItem value="SUSPENDED" className="text-xs font-semibold">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading drivers..." className="py-20" />
        ) : drivers.length === 0 ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">No drivers found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Driver Name</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">License Number</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Category & Expiry</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Contact</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Safety Score</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drivers.map((d) => (
                <TableRow key={d.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-bold text-xs text-gray-900 dark:text-white pl-6">{d.name}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.license_number}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{d.license_category}</Badge>
                      <span>{new Date(d.license_expiry_date).toLocaleDateString()}</span>
                      {getLicenseStatus(d.license_expiry_date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">{d.contact_number}</TableCell>
                  <TableCell className="text-xs font-bold text-gray-900 dark:text-white">
                    {d.safety_score !== null ? `${d.safety_score}/100` : '--'}
                  </TableCell>
                  <TableCell className="pr-6">
                    {getStatusBadge(d.status)}
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
