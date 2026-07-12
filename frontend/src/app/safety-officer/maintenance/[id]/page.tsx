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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  updated_at: string;
  started_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  vehicle?: Vehicle;
}

export default function MaintenanceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [maint, setMaint] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editServiceType, setEditServiceType] = useState('');
  const [editServiceDate, setEditServiceDate] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Confirmation Dialog
  const [dialogType, setDialogType] = useState<'start' | 'complete' | 'cancel' | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchMaintenanceDetail = async () => {
    try {
      setLoading(true);
      const data = await apiClient(`/maintenance/${id}`);
      setMaint(data);
      if (data) {
        setEditServiceType(data.service_type);
        setEditServiceDate(data.service_date);
        setEditCost(String(data.cost));
        setEditDescription(data.description || '');
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to load record details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceDetail();
  }, [id]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await apiClient(`/maintenance/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          service_type: editServiceType.trim(),
          service_date: editServiceDate,
          cost: parseFloat(editCost),
          description: editDescription.trim() || undefined,
        }),
      });
      setIsEditing(false);
      await fetchMaintenanceDetail();
    } catch (e: any) {
      setActionError(e.message || "Failed to edit record");
    }
  };

  const executeAction = async () => {
    if (!dialogType || !maint) return;
    setActionError(null);
    try {
      await apiClient(`/maintenance/${maint.id}/${dialogType}`, { method: 'POST' });
      setDialogType(null);
      await fetchMaintenanceDetail();
    } catch (e: any) {
      setActionError(e.message || `Failed to ${dialogType} record`);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return <LoadingState message="Loading maintenance record details..." />;
  }

  if (errorMsg || !maint) {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold max-w-lg mx-auto mt-8 flex items-center gap-2">
        <AlertCircle size={16} />
        <span>{errorMsg || "Record not found"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans max-w-[1040px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link
            href="/safety-officer/maintenance"
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Maintenance Record
            </h1>
            <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
              ID: MNT-{String(maint.id).padStart(4, '0')} • {maint.vehicle?.registration_number}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {getStatusBadge(maint.status)}
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {actionError}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Service Details */}
        <div className="md:col-span-2 space-y-6">
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/[0.06] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                Service Registration Details
              </CardTitle>
              {maint.status === 'SCHEDULED' && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Edit2 size={13} />
                  <span>Edit Record</span>
                </button>
              )}
            </CardHeader>

            <CardContent className="p-6">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Service Type</label>
                    <Input
                      value={editServiceType}
                      onChange={(e) => setEditServiceType(e.target.value)}
                      className="rounded-xl text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Service Date</label>
                      <Input
                        type="date"
                        value={editServiceDate}
                        onChange={(e) => setEditServiceDate(e.target.value)}
                        className="rounded-xl text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Cost ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editCost}
                        onChange={(e) => setEditCost(e.target.value)}
                        className="rounded-xl text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl text-xs p-3 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300"
                    >
                      Cancel
                    </button>
                    <Button type="submit" className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold">
                      Save Changes
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Service Type</span>
                      <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{maint.service_type}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Service Date</span>
                      <p className="mt-1 text-sm font-mono font-semibold text-gray-900 dark:text-white">{maint.service_date}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Estimated Cost</span>
                      <p className="mt-1 text-sm font-mono font-bold text-gray-900 dark:text-white">
                        ${Number(maint.cost).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Logged At</span>
                      <p className="mt-1 text-xs font-mono text-gray-600 dark:text-gray-400">
                        {maint.created_at ? new Date(maint.created_at).toLocaleString() : '—'}
                      </p>
                    </div>
                  </div>

                  {maint.description && (
                    <div className="pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Service Notes</span>
                      <p className="mt-1.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-[#181818] p-3.5 rounded-xl border border-gray-200/50 dark:border-white/[0.05]">
                        {maint.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Vehicle Info & Workflow Actions */}
        <div className="space-y-6">
          <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
            <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
              <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                Assigned Vehicle
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Registration</span>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">
                  {maint.vehicle?.registration_number}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Model Name</span>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-0.5">
                  {maint.vehicle?.name}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Current Status</span>
                <p className="text-xs font-semibold text-gray-900 dark:text-white mt-0.5">
                  {maint.vehicle?.status}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          {(maint.status === 'SCHEDULED' || maint.status === 'IN_PROGRESS') && (
            <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
                <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                  Workflow Control
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {maint.status === 'SCHEDULED' && (
                  <>
                    <button
                      onClick={() => setDialogType('start')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <Play size={14} />
                      <span>Start Service Work</span>
                    </button>
                    <button
                      onClick={() => setDialogType('cancel')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors"
                    >
                      <XCircle size={14} />
                      <span>Cancel Maintenance</span>
                    </button>
                  </>
                )}

                {maint.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => setDialogType('complete')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <CheckCircle2 size={14} />
                    <span>Complete Service Work</span>
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {dialogType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#151515] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 dark:text-white capitalize">
              Confirm {dialogType} Maintenance
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Are you sure you want to {dialogType} this maintenance record?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDialogType(null)}
                className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className="px-4 py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black text-xs font-semibold capitalize"
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
