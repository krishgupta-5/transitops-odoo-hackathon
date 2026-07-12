'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Wrench, Calendar, 
  Trash2, Play, CheckCircle2, XCircle, Eye, Activity
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  vehicle: Vehicle;
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
    setLoading(true);
    try {
      let query = "?";
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (search) query += `service_type=${search}&`;
      
      const data = await apiClient(`/maintenance/${query}`);
      setMaintenances(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchMaintenances();
    }, 300);
    return () => clearTimeout(delay);
  }, [search, statusFilter]);

  const handleAction = async () => {
    if (!activeMaint || !dialogType) return;
    try {
      setErrorMsg(null);
      await apiClient(`/maintenance/${activeMaint.id}/${dialogType}`, { method: 'POST' });
      // Refresh
      await fetchMaintenances();
      closeDialog();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed. Please review lifecycle constraints.');
    }
  };

  const openDialog = (maint: Maintenance, type: 'start' | 'complete' | 'cancel') => {
    setActiveMaint(maint);
    setDialogType(type);
    setErrorMsg(null);
  };

  const closeDialog = () => {
    setActiveMaint(null);
    setDialogType(null);
    setErrorMsg(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_PROGRESS': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'CANCELLED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Maintenance Registry</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage scheduled, active, and historical fleet vehicle servicing logs.</p>
        </div>
        <Link href="/safety-officer/maintenance/create" className={buttonVariants({ className: "bg-orange-600 hover:bg-orange-700 text-white font-semibold" })}>
          <Plus size={16} className="mr-1.5" /> Schedule Maintenance
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex gap-4 items-center bg-[#18181b] p-4 rounded-lg border border-zinc-800">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input 
            placeholder="Search service type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-44 bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-zinc-800 bg-[#18181b] overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">MAINTENANCE ID</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">VEHICLE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">SERVICE DETAILS</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">SERVICE DATE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">COST</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">STATUS</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase text-right">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  <Activity size={18} className="animate-spin inline mr-2 text-zinc-400" />
                  Loading maintenance logs...
                </TableCell>
              </TableRow>
            ) : maintenances.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">No maintenance records found.</TableCell>
              </TableRow>
            ) : (
              maintenances.map((m) => (
                <TableRow key={m.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <TableCell className="font-mono text-zinc-500 text-xs">MNT-{String(m.id).padStart(4, '0')}</TableCell>
                  <TableCell className="font-medium text-zinc-200">
                    {m.vehicle?.registration_number}
                    <div className="text-xs text-zinc-500 font-normal">{m.vehicle?.name}</div>
                  </TableCell>
                  <TableCell className="text-zinc-300">
                    <span className="font-semibold">{m.service_type}</span>
                    {m.description && <div className="text-xs text-zinc-500 max-w-xs truncate">{m.description}</div>}
                  </TableCell>
                  <TableCell className="text-zinc-400 font-mono text-xs">{m.service_date}</TableCell>
                  <TableCell className="text-zinc-300 font-mono font-semibold">${Number(m.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(m.status)}>
                      {m.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                    <Link href={`/safety-officer/maintenance/${m.id}`} className={buttonVariants({ variant: "outline", size: "sm", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-850 hover:text-white" })}>
                      <Eye size={12} className="mr-1" /> View
                    </Link>

                    {m.status === 'SCHEDULED' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-amber-600 hover:bg-amber-700 text-white font-medium"
                          onClick={() => openDialog(m, 'start')}
                        >
                          <Play size={12} className="mr-1" /> Start
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openDialog(m, 'cancel')}
                        >
                          <XCircle size={12} className="mr-1" /> Cancel
                        </Button>
                      </>
                    )}

                    {m.status === 'IN_PROGRESS' && (
                      <>
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          onClick={() => openDialog(m, 'complete')}
                        >
                          <CheckCircle2 size={12} className="mr-1" /> Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openDialog(m, 'cancel')}
                        >
                          <XCircle size={12} className="mr-1" /> Cancel
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Modals */}
      {dialogType && activeMaint && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white capitalize">
                {dialogType === 'start' && 'Start Maintenance'}
                {dialogType === 'complete' && 'Complete Maintenance'}
                {dialogType === 'cancel' && 'Cancel Maintenance'}
              </h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {dialogType === 'start' && (
                  <>
                    Starting maintenance will mark this vehicle as <strong>IN SHOP</strong> and it will no longer be available for dispatch.
                  </>
                )}
                {dialogType === 'complete' && (
                  <>
                    Completing this maintenance record will make the vehicle <strong>AVAILABLE</strong> if no other maintenance is currently in progress.
                  </>
                )}
                {dialogType === 'cancel' && (
                  <>
                    Cancelling this maintenance will stop the service log.
                    {activeMaint.status === 'IN_PROGRESS' && (
                      <span> The vehicle will become <strong>AVAILABLE</strong> only if no other maintenance is currently in progress.</span>
                    )}
                  </>
                )}
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded text-xs leading-normal">
                {errorMsg}
              </div>
            )}

            <div className="flex justify-end gap-3 text-xs pt-2">
              <Button variant="outline" className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800" onClick={closeDialog}>
                Discard
              </Button>
              <Button 
                className={
                  dialogType === 'cancel'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white font-bold'
                    : dialogType === 'complete'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold'
                    : 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                }
                onClick={handleAction}
              >
                Confirm Action
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
