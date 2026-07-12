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

export default function FleetDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let query = `?skip=${skip}&limit=${limit}&`;
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (search) query += `search=${search}&`;
      
      const data = await apiClient(`/drivers/${query}`);
      setDrivers(data);
      setHasMore(data.length === limit);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchDrivers();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter, page]);

  const getDriverStatusStyle = (status: string) => {
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
      case 'OFF_DUTY':
        return {
          backgroundColor: 'rgba(168, 85, 247, 0.15)',
          color: '#A855F7',
          borderColor: 'rgba(168, 85, 247, 0.4)',
        };
      case 'SUSPENDED':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        };
      default:
        return {
          backgroundColor: 'rgba(156, 163, 175, 0.15)',
          color: '#9CA3AF',
          borderColor: 'rgba(156, 163, 175, 0.4)',
        };
    }
  };

  const getLicenseStatusStyle = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    if (expiry < now) {
      return {
        text: 'EXPIRED',
        style: {
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: '#EF4444',
          borderColor: 'rgba(239, 68, 68, 0.4)',
        },
      };
    } else if (expiry <= thirtyDaysFromNow) {
      return {
        text: 'EXPIRING SOON',
        style: {
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          borderColor: 'rgba(245, 158, 11, 0.4)',
        },
      };
    }
    return {
      text: 'VALID',
      style: {
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        color: '#10B981',
        borderColor: 'rgba(16, 185, 129, 0.4)',
      },
    };
  };

  return (
    <div className="space-y-6 font-sans max-w-[1040px] mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Drivers
          </h1>
        </div>
        <Link
          href="/fleet-manager/drivers/create"
          className="bg-black dark:bg-white text-white dark:text-black text-xs font-semibold px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
        >
          + Add Driver
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input 
          placeholder="Search drivers..." 
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
            <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Drivers Table Container */}
      <div className="border border-gray-200/80 dark:border-white/[0.08] rounded-xl bg-white dark:bg-[#0F0F0F] overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.06]">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">DRIVER NAME</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">LICENSE</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">CONTACT</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">SAFETY SCORE</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase">STATUS</TableHead>
              <TableHead className="text-gray-400 text-[11px] font-semibold tracking-wider uppercase text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-0">
                <TableCell colSpan={6} className="py-0">
                  <LoadingState message="Loading drivers..." className="py-16 min-h-[220px]" />
                </TableCell>
              </TableRow>
            ) : drivers.length === 0 ? (
              <TableRow className="border-0">
                <TableCell colSpan={6} className="text-center py-10 text-gray-400 text-xs">
                  {search || statusFilter !== 'all'
                    ? "No drivers match your current filters."
                    : "No drivers registered yet."}
                </TableCell>
              </TableRow>
            ) : (
              drivers.map((d) => {
                const licenseStatus = getLicenseStatusStyle(d.license_expiry_date);
                return (
                  <TableRow key={d.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-semibold text-gray-900 dark:text-white">{d.name}</TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">
                      <div className="font-medium">{d.license_number}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-gray-400">Class {d.license_category}</span>
                        <span
                          style={licenseStatus.style}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        >
                          {licenseStatus.text}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-300">{d.contact_number}</TableCell>
                    <TableCell>
                      {d.safety_score !== null ? (
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {d.safety_score}/100
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        style={getDriverStatusStyle(d.status)}
                        className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/fleet-manager/drivers/${d.id}`}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
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
