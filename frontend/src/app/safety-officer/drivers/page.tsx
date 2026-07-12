'use client';

import React, { useState, useEffect } from 'react';
import { Search, Phone, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState } from '@/components/ui/LoadingState';

interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: string;
}

export default function DriverSafetyPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [validityFilter, setValidityFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setPage(1);
  }, [search, validityFilter]);

  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);
      try {
        const data = await apiClient('/drivers/');
        setDrivers(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  const getLicenseClassification = (expiryStr: string) => {
    if (!expiryStr) return 'UNKNOWN';
    const now = new Date();
    const expiry = new Date(expiryStr);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'EXPIRED';
    if (diffDays <= 30) return 'EXPIRING_SOON';
    return 'VALID';
  };

  const getValidityBadge = (classification: string) => {
    switch (classification) {
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Expired
          </span>
        );
      case 'EXPIRING_SOON':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Expiring &lt;30d
          </span>
        );
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Valid
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">
            Unknown
          </span>
        );
    }
  };

  const filteredDrivers = drivers.filter(d => {
    if (validityFilter !== 'ALL') {
      const classification = getLicenseClassification(d.license_expiry_date);
      if (validityFilter !== classification) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.license_number.toLowerCase().includes(q) ||
        (d.license_category && d.license_category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalPages = Math.ceil(filteredDrivers.length / itemsPerPage);
  const paginatedDrivers = filteredDrivers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 font-sans max-w-[1040px] mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Driver Safety & Compliance Audit
        </h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search driver by name or license #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/10"
          />
        </div>

        <Select value={validityFilter} onValueChange={(val) => setValidityFilter(val || "ALL")}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/10">
            <SelectValue placeholder="License Validity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Licenses</SelectItem>
            <SelectItem value="VALID">Valid Only</SelectItem>
            <SelectItem value="EXPIRING_SOON">Expiring &lt;30d</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">DRIVER</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">LICENSE #</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">CLASS</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">EXPIRY DATE</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">VALIDITY</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">SAFETY SCORE</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs">
            {loading ? (
              <TableRow className="border-0">
                <TableCell colSpan={7} className="py-0">
                  <LoadingState message="Loading driver safety records..." className="py-16 min-h-[220px]" />
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400 dark:text-gray-500">
                  No driver records found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDrivers.map((d) => {
                const classification = getLicenseClassification(d.license_expiry_date);
                const score = d.safety_score ?? 100;
                return (
                  <TableRow key={d.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-gray-800 dark:text-gray-200 shrink-0">
                          {d.name ? d.name.substring(0, 2).toUpperCase() : 'DR'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">{d.name}</div>
                          {d.contact_number && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                              <Phone size={11} /> {d.contact_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6 font-mono text-gray-700 dark:text-gray-300 font-semibold">
                      {d.license_number}
                    </TableCell>

                    <TableCell className="py-3.5 px-6 font-semibold text-gray-700 dark:text-gray-300">
                      {d.license_category}
                    </TableCell>

                    <TableCell className="py-3.5 px-6 font-mono text-gray-500 dark:text-gray-400">
                      {d.license_expiry_date}
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      {getValidityBadge(classification)}
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-100 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                          />
                        </div>
                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                          {score}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300">
                        {d.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-[#161616]">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-xs font-semibold px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/5 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
