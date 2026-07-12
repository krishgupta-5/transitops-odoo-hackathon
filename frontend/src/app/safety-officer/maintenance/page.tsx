'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Play, CheckCircle2, XCircle, Eye, Activity
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingState } from '@/components/ui/LoadingState';

interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
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
  created_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  vehicle?: Vehicle;
}

export default function MaintenanceListPage() {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Confirmation Dialog States
  const [activeMaint, setActiveMaint] = useState<Maintenance | null>(null);
  const [dialogType, setDialogType] = useState<'start' | 'complete' | 'cancel' | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchMaintenances = async () => {
    try {
      setLoading(true);
      const data = await apiClient('/maintenance/');
      setMaintenances(data || []);
    } catch (e) {
      console.error("Failed fetching maintenance records", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  const executeAction = async () => {
    if (!activeMaint || !dialogType) return;
    setErrorMsg(null);
    try {
      await apiClient(`/maintenance/${activeMaint.id}/${dialogType}`, { method: 'POST' });
      setActiveMaint(null);
      setDialogType(null);
      await fetchMaintenances();
    } catch (e: any) {
      setErrorMsg(e.message || `Failed to ${dialogType} maintenance record`);
    }
  };

  const openDialog = (maint: Maintenance, type: 'start' | 'complete' | 'cancel') => {
    setActiveMaint(maint);
    setDialogType(type);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 font-sans max-w-[1040px] mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Maintenance Logs
          </h1>
        </div>
        <Link
          href="/safety-officer/maintenance/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Schedule Maintenance</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Search by vehicle reg or service type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl text-xs bg-gray-50 dark:bg-[#181818] border-gray-200 dark:border-white/10">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow className="border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">ID</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">VEHICLE</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">SERVICE DETAILS</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">SERVICE DATE</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">COST</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6">STATUS</TableHead>
              <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500 py-3.5 px-6 text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs">
            {loading ? (
              <TableRow className="border-0">
                <TableCell colSpan={7} className="py-0">
                  <LoadingState message="Loading maintenance logs..." className="py-16 min-h-[220px]" />
                </TableCell>
              </TableRow>
            ) : maintenances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-gray-400 dark:text-gray-500">
                  No maintenance records found.
                </TableCell>
              </TableRow>
            ) : (
              maintenances
                .filter(m => {
                  if (statusFilter !== 'all' && m.status !== statusFilter) return false;
                  if (search) {
                    const q = search.toLowerCase();
                    const matchReg = m.vehicle?.registration_number?.toLowerCase().includes(q);
                    const matchService = m.service_type.toLowerCase().includes(q);
                    return matchReg || matchService;
                  }
                  return true;
                })
                .map((m) => (
                  <TableRow key={m.id} className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-mono text-gray-500 dark:text-gray-400 py-3.5 px-6">
                      MNT-{String(m.id).padStart(4, '0')}
                    </TableCell>
                    <TableCell className="py-3.5 px-6 font-semibold text-gray-900 dark:text-white">
                      {m.vehicle?.registration_number || `Vehicle #${m.vehicle_id}`}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">{m.vehicle?.name}</div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-gray-700 dark:text-gray-300">
                      <span className="font-semibold">{m.service_type}</span>
                      {m.description && <div className="text-[11px] text-gray-500 max-w-xs truncate">{m.description}</div>}
                    </TableCell>
                    <TableCell className="py-3.5 px-6 font-mono text-gray-500 dark:text-gray-400">
                      {m.service_date}
                    </TableCell>
                    <TableCell className="py-3.5 px-6 font-mono font-semibold text-gray-900 dark:text-white">
                      ${Number(m.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      {getStatusBadge(m.status)}
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right space-x-2 whitespace-nowrap">
                      <Link
                        href={`/safety-officer/maintenance/${m.id}`}
                        className="text-xs font-medium px-3.5 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors inline-block"
                      >
                        View
                      </Link>

                      {m.status === 'SCHEDULED' && (
                        <>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors"
                            onClick={() => openDialog(m, 'start')}
                          >
                            <Play size={13} />
                            <span>Start</span>
                          </button>
                          <button 
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500 hover:text-white transition-colors"
                            onClick={() => openDialog(m, 'cancel')}
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        </>
                      )}

                      {m.status === 'IN_PROGRESS' && (
                        <button 
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                          onClick={() => openDialog(m, 'complete')}
                        >
                          <CheckCircle2 size={13} />
                          <span>Complete</span>
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeMaint && dialogType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
              Confirm {dialogType} Maintenance
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Are you sure you want to {dialogType} maintenance record <span className="font-semibold text-gray-900 dark:text-white">#{activeMaint.id} ({activeMaint.service_type})</span> for vehicle <span className="font-semibold text-gray-900 dark:text-white">{activeMaint.vehicle?.registration_number}</span>?
            </p>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => { setActiveMaint(null); setDialogType(null); }}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold hover:opacity-90 transition-all capitalize"
              >
                Confirm {dialogType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
