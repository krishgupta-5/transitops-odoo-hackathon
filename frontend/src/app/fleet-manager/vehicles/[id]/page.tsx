'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";

type Vehicle = {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [retireDialogOpen, setRetireDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      const data = await apiClient(`/vehicles/${id}`);
      setVehicle(data);
    } catch (e: any) {
      setError(e.message || "Failed to load vehicle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const handleRetire = async () => {
    setActionLoading(true);
    try {
      await apiClient(`/vehicles/${id}`, { method: 'DELETE' });
      setRetireDialogOpen(false);
      fetchVehicle();
    } catch (e: any) {
      alert(e.message || "Failed to retire vehicle");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async () => {
    setActionLoading(true);
    try {
      await apiClient(`/vehicles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: targetStatus })
      });
      setStatusDialogOpen(false);
      fetchVehicle();
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

  if (loading) return <LoadingState message="Loading vehicle details..." />;
  if (error || !vehicle) return <div className="p-8 text-red-500 font-sans">{error || "Vehicle not found"}</div>;

  const getVehicleStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
      case 'ON_TRIP':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
      case 'IN_SHOP':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
      case 'RETIRED':
        return { backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF' };
      default:
        return { backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF' };
    }
  };

  return (
    <div className="max-w-[960px] mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight font-mono">{vehicle.registration_number}</h1>
            <span
              style={getVehicleStatusStyle(vehicle.status)}
              className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full"
            >
              {vehicle.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{vehicle.name}</p>
        </div>
        <Link
          href="/fleet-manager/vehicles"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Vehicle Specifications</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vehicle Type</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{vehicle.vehicle_type}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Max Load Capacity</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{vehicle.max_load_capacity} kg</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Current Odometer</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{vehicle.odometer} km</div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Acquisition Cost</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">
                  {vehicle.acquisition_cost !== null ? `$${vehicle.acquisition_cost}` : 'N/A'}
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.04] sm:col-span-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registered On</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1 font-mono">{new Date(driver_or_created(vehicle.created_at)).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#121212] p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Fleet Actions</h2>
            <div className="space-y-3">
              {(vehicle.status === 'IN_SHOP' || vehicle.status === 'RETIRED') && (
                <button
                  onClick={() => openStatusDialog('AVAILABLE')}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                >
                  Mark Available
                </button>
              )}
              {vehicle.status === 'AVAILABLE' && (
                <>
                  <button
                    onClick={() => openStatusDialog('IN_SHOP')}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer"
                  >
                    Send to Maintenance
                  </button>
                  <button
                    onClick={() => setRetireDialogOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500 text-red-600 dark:text-red-400 hover:text-white border border-red-500/30 transition-colors cursor-pointer"
                  >
                    Retire Vehicle
                  </button>
                </>
              )}
              
              {vehicle.status === 'ON_TRIP' && (
                <div className="text-xs text-gray-500 bg-gray-50 dark:bg-white/[0.03] p-4 rounded-xl border border-gray-100 dark:border-white/[0.05] text-center">
                  Status changes are disabled while vehicle is on an active trip.
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
              Are you sure you want to change vehicle status to <strong className="text-gray-900 dark:text-white">{targetStatus.replace('_', ' ')}</strong>?
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

      <Dialog open={retireDialogOpen} onOpenChange={setRetireDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 font-sans">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-red-600 dark:text-red-400">Retire Vehicle</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Are you sure you want to retire <strong className="text-gray-900 dark:text-white">{vehicle.registration_number}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setRetireDialogOpen(false)} disabled={actionLoading} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRetire}
              disabled={actionLoading}
              className="rounded-xl text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              {actionLoading ? "Retiring..." : "Retire Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function driver_or_created(dateStr: string) {
  return dateStr;
}
