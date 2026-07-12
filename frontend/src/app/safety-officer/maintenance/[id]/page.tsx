'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit2, Play, CheckCircle2, XCircle, 
  Save, X, Calendar, DollarSign, FileText, AlertCircle, Clock
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  vehicle: Vehicle;
}

export default function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [maint, setMaint] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editServiceType, setEditServiceType] = useState('');
  const [editServiceDate, setEditServiceDate] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Dialog Action states
  const [dialogType, setDialogType] = useState<'start' | 'complete' | 'cancel' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchMaintDetails = async () => {
    try {
      const data = await apiClient(`/maintenance/${id}`);
      setMaint(data);
      // Initialize edit fields
      setEditServiceType(data.service_type);
      setEditServiceDate(data.service_date);
      setEditCost(String(data.cost));
      setEditDescription(data.description || '');
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to load maintenance details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintDetails();
  }, [id]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServiceType.trim()) {
      setActionError("Service type cannot be empty.");
      return;
    }
    if (!editServiceDate) {
      setActionError("Please select a service date.");
      return;
    }
    if (Number(editCost) < 0) {
      setActionError("Cost must be non-negative.");
      return;
    }

    try {
      setActionError(null);
      const updated = await apiClient(`/maintenance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          service_type: editServiceType.trim(),
          service_date: editServiceDate,
          cost: Number(editCost),
          description: editDescription.trim() || null,
        }),
      });
      setMaint(updated);
      setIsEditing(false);
    } catch (err: any) {
      setActionError(err.message || "Failed to update record.");
    }
  };

  const handleLifecycleAction = async () => {
    if (!dialogType || !maint) return;
    try {
      setActionError(null);
      await apiClient(`/maintenance/${maint.id}/${dialogType}`, { method: 'POST' });
      await fetchMaintDetails();
      closeDialog();
    } catch (err: any) {
      setActionError(err.message || 'Operation failed. Please review lifecycle constraints.');
    }
  };

  const openDialog = (type: 'start' | 'complete' | 'cancel') => {
    setDialogType(type);
    setActionError(null);
  };

  const closeDialog = () => {
    setDialogType(null);
    setActionError(null);
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

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString();
  };

  if (loading) {
    return <div className="text-zinc-400 py-8 text-center">Loading maintenance details...</div>;
  }

  if (errorMsg || !maint) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded text-sm leading-normal max-w-lg mx-auto mt-8">
        <div className="flex gap-2 items-center">
          <AlertCircle size={18} />
          <span className="font-semibold">{errorMsg || "Record not found"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/safety-officer/maintenance" className={buttonVariants({ variant: "outline", size: "sm", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800" })}>
            <ArrowLeft size={16} /> Logs
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Maintenance Record</h1>
            <p className="text-xs font-mono text-zinc-500 mt-0.5">ID: MNT-{String(maint.id).padStart(4, '0')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`px-3 py-1 text-xs font-bold ${getStatusColor(maint.status)}`}>
            {maint.status}
          </Badge>
        </div>
      </div>

      {actionError && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded text-xs leading-normal">
          {actionError}
        </div>
      )}

      {/* Main card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Column */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
            <CardHeader className="border-b border-zinc-850 flex flex-row justify-between items-center py-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300">Service Registration Details</CardTitle>
              {maint.status === 'SCHEDULED' && !isEditing && (
                <Button 
                  size="sm"
                  variant="outline" 
                  className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 size={12} className="mr-1.5" /> Edit Record
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Service Type</label>
                    <select
                      value={editServiceType}
                      onChange={(e) => setEditServiceType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 text-xs font-semibold cursor-pointer"
                      required
                    >
                      <option value="Routine Service">Routine Service</option>
                      <option value="Engine Repair">Engine Repair</option>
                      <option value="Brake Inspection">Brake Inspection</option>
                      <option value="Tire Replacement">Tire Replacement</option>
                      <option value="Oil Change">Oil Change</option>
                      <option value="Transmission Repair">Transmission Repair</option>
                      <option value="Electrical Repair">Electrical Repair</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Service Date</label>
                      <Input 
                        type="date"
                        value={editServiceDate}
                        onChange={(e) => setEditServiceDate(e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cost ($)</label>
                      <Input 
                        type="number"
                        step="0.01"
                        min="0"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        className="bg-zinc-900 border-zinc-700 text-zinc-100"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                    <textarea 
                      rows={3}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 text-xs leading-relaxed resize-none"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800"
                      onClick={() => {
                        setIsEditing(false);
                        setActionError(null);
                      }}
                    >
                      <X size={14} className="mr-1" /> Discard
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                    >
                      <Save size={14} className="mr-1" /> Save
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Service Type</span>
                      <span className="text-zinc-200 text-base font-bold mt-1 block">{maint.service_type}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block font-mono">Service Date</span>
                      <div className="flex items-center gap-1.5 text-zinc-300 mt-1">
                        <Calendar size={14} className="text-zinc-500" />
                        <span className="font-mono">{maint.service_date}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Cost</span>
                      <div className="flex items-center gap-1 text-zinc-200 mt-1 font-mono font-semibold text-lg">
                        <DollarSign size={16} className="text-zinc-500" />
                        <span>{Number(maint.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Created on</span>
                      <div className="flex items-center gap-1.5 text-zinc-400 mt-1 font-mono text-xs">
                        <Clock size={12} className="text-zinc-500" />
                        <span>{formatDate(maint.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-850 pt-4">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block">Description / Notes</span>
                    <div className="flex gap-2 items-start text-zinc-300 mt-2 bg-zinc-900/40 p-4 rounded-md border border-zinc-850 leading-relaxed text-xs">
                      <FileText size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                      <p>{maint.description || "No diagnostics or notes provided."}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lifecycle Timestamps */}
          <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
            <CardHeader className="border-b border-zinc-850 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Lifecycle Auditing</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-mono">
                <div className="bg-zinc-900/30 p-3 rounded border border-zinc-850">
                  <span className="text-zinc-500">STARTED AT</span>
                  <p className="text-zinc-300 mt-1 font-bold">{formatDate(maint.started_at)}</p>
                </div>
                <div className="bg-zinc-900/30 p-3 rounded border border-zinc-850">
                  <span className="text-zinc-500">COMPLETED AT</span>
                  <p className="text-zinc-300 mt-1 font-bold">{formatDate(maint.completed_at)}</p>
                </div>
                <div className="bg-zinc-900/30 p-3 rounded border border-zinc-850">
                  <span className="text-zinc-500">CANCELLED AT</span>
                  <p className="text-zinc-300 mt-1 font-bold">{formatDate(maint.cancelled_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle & Actions Column */}
        <div className="space-y-6">
          {/* Associated Vehicle */}
          <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
            <CardHeader className="border-b border-zinc-850 py-4">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Vehicle Profile</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <div>
                <span className="text-zinc-500">REGISTRATION:</span>
                <p className="text-base font-bold text-zinc-200 mt-0.5">{maint.vehicle?.registration_number}</p>
              </div>
              <div>
                <span className="text-zinc-500">MODEL / MAKE:</span>
                <p className="font-semibold text-zinc-300 mt-0.5">{maint.vehicle?.name}</p>
              </div>
              <div>
                <span className="text-zinc-500">VEHICLE TYPE:</span>
                <p className="text-zinc-400 mt-0.5">{maint.vehicle?.vehicle_type}</p>
              </div>
              <div>
                <span className="text-zinc-500">CURRENT STATUS:</span>
                <p className="mt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    maint.vehicle?.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    maint.vehicle?.status === 'ON_TRIP' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {maint.vehicle?.status}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Mutation Actions */}
          {maint.status !== 'COMPLETED' && maint.status !== 'CANCELLED' && (
            <Card className="bg-[#18181b] border-zinc-800 text-zinc-100 border-l-orange-500 border-l-2">
              <CardHeader className="py-4">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-300">Lifecycle Operations</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col gap-3">
                {maint.status === 'SCHEDULED' && (
                  <>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
                      onClick={() => openDialog('start')}
                    >
                      <Play size={14} className="mr-2" /> Start Maintenance
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full font-bold"
                      onClick={() => openDialog('cancel')}
                    >
                      <XCircle size={14} className="mr-2" /> Cancel Servicing
                    </Button>
                  </>
                )}

                {maint.status === 'IN_PROGRESS' && (
                  <>
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                      onClick={() => openDialog('complete')}
                    >
                      <CheckCircle2 size={14} className="mr-2" /> Complete Maintenance
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="w-full font-bold"
                      onClick={() => openDialog('cancel')}
                    >
                      <XCircle size={14} className="mr-2" /> Cancel Servicing
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Overlay Dialog */}
      {dialogType && maint && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white capitalize">Confirm transition</h3>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                {dialogType === 'start' && (
                  <>
                    Starting maintenance will mark this vehicle as <strong>IN SHOP</strong> and it will no longer be available for dispatch.
                  </>
                )}
                {dialogType === 'complete' && (
                  <>
                    Completing this maintenance record will restore the vehicle status to <strong>AVAILABLE</strong> if no other maintenance is in progress.
                  </>
                )}
                {dialogType === 'cancel' && (
                  <>
                    Cancelling this maintenance will transition the log to CANCELLED.
                    {maint.status === 'IN_PROGRESS' && (
                      <span> The vehicle will become <strong>AVAILABLE</strong> only if no other maintenance is currently in progress.</span>
                    )}
                  </>
                )}
              </p>
            </div>

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
                onClick={handleLifecycleAction}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
