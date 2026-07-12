'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, ArrowLeft } from "lucide-react";
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
  created_at: string;
  updated_at: string;
};

export default function DriverDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDriver = async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/drivers/${id}`);
      setDriver(data);
    } catch (e: any) {
      setError(e.message || "Failed to load driver");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const handleStatusChange = async () => {
    setActionLoading(true);
    try {
      if (targetStatus === 'OFF_DUTY_DELETE') {
         await apiClient(`/drivers/${id}`, { method: 'DELETE' });
      } else {
         await apiClient(`/drivers/${id}`, {
           method: 'PATCH',
           body: JSON.stringify({ status: targetStatus })
         });
      }
      setStatusDialogOpen(false);
      fetchDriver();
    } catch (e: any) {
      alert(e.message || "Failed to change status");
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusDialog = (status: string) => {
    setTargetStatus(status);
    setStatusDialogOpen(true);
  };

  if (loading) return <LoadingState message="Loading driver details..." />;
  if (error || !driver) return <div className="p-8 text-red-500 font-sans">{error || "Driver not found"}</div>;

  const getDriverStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
      case 'ON_TRIP':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
      case 'OFF_DUTY':
        return { backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' };
      case 'SUSPENDED':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' };
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF' };
    }
  };

  const getLicenseWarning = () => {
    const now = new Date();
    const expiry = new Date(driver.license_expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expiry < now) {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">Driver's license is EXPIRED. Do not dispatch.</span>
        </div>
      );
    } else if (expiry <= thirtyDaysFromNow) {
      return (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">Driver's license will expire soon on {driver.license_expiry_date}.</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[960px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{driver.name}</h1>
            <span
              style={getDriverStatusStyle(driver.status)}
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
            >
              {driver.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">License: {driver.license_number}</p>
        </div>
        <Link
          href="/fleet-manager/drivers"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Directory</span>
        </Link>
      </div>
      
      {getLicenseWarning()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Driver Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Contact Number</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{driver.contact_number}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Safety Score</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {driver.safety_score !== null ? `${driver.safety_score}/100` : 'N/A'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Category</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">Class {driver.license_category}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">License Expiry Date</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{driver.license_expiry_date}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] sm:col-span-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered On</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{new Date(driver.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Personnel Actions</h2>
            <div className="space-y-3">
              {(driver.status === 'OFF_DUTY' || driver.status === 'SUSPENDED') && (
                <button
                  onClick={() => openStatusDialog('AVAILABLE')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Mark Available
                </button>
              )}
              {driver.status === 'AVAILABLE' && (
                <>
                  <button
                    onClick={() => openStatusDialog('OFF_DUTY_DELETE')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    Set Off Duty
                  </button>
                  <button
                    onClick={() => openStatusDialog('SUSPENDED')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/30 transition-colors cursor-pointer"
                  >
                    Suspend Driver
                  </button>
                </>
              )}
              
              {driver.status === 'ON_TRIP' && (
                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] text-center">
                  Status changes are disabled while driver is on an active trip.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-gray-900 dark:text-white">Confirm Action</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Are you sure you want to change driver status to <strong className="text-gray-900 dark:text-white">{targetStatus.replace('_DELETE', '').replace('_', ' ')}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={actionLoading} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={actionLoading}
              className="rounded-xl text-xs bg-black dark:bg-white text-white dark:text-black font-semibold"
            >
              {actionLoading ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
