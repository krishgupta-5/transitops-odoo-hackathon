'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

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

  if (loading) return <div className="p-8 text-zinc-400">Loading vehicle details...</div>;
  if (error || !vehicle) return <div className="p-8 text-red-500">{error || "Vehicle not found"}</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'IN_SHOP': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RETIRED': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">{vehicle.registration_number}</h1>
            <Badge variant="outline" className={getStatusColor(vehicle.status)}>
              {vehicle.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">{vehicle.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/fleet-manager/vehicles" className={buttonVariants({ variant: "outline", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" })}>
            Back to Registry
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-zinc-200">Vehicle Specifications</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Vehicle Type</div>
                <div className="text-zinc-200 mt-1">{vehicle.vehicle_type}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Max Load Capacity</div>
                <div className="text-zinc-200 mt-1">{vehicle.max_load_capacity} kg</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Current Odometer</div>
                <div className="text-zinc-200 mt-1">{vehicle.odometer} km</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Acquisition Cost</div>
                <div className="text-zinc-200 mt-1">{vehicle.acquisition_cost !== null ? `$${vehicle.acquisition_cost}` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Registered On</div>
                <div className="text-zinc-200 mt-1">{new Date(vehicle.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-zinc-200">Fleet Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicle.status === 'AVAILABLE' && (
                <Button onClick={() => openStatusDialog('IN_SHOP')} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  Mark In Shop
                </Button>
              )}
              {vehicle.status === 'IN_SHOP' && (
                <Button onClick={() => openStatusDialog('AVAILABLE')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mark Available
                </Button>
              )}
              {vehicle.status !== 'RETIRED' && vehicle.status !== 'ON_TRIP' && (
                <Button variant="destructive" onClick={() => setRetireDialogOpen(true)} className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/50">
                  Retire Vehicle
                </Button>
              )}
              {vehicle.status === 'ON_TRIP' && (
                <div className="text-sm text-zinc-500 bg-zinc-900/50 p-3 rounded border border-zinc-800 text-center">
                  Status changes are disabled while vehicle is on an active trip.
                </div>
              )}
              {vehicle.status === 'RETIRED' && (
                <div className="text-sm text-zinc-500 bg-zinc-900/50 p-3 rounded border border-zinc-800 text-center">
                  This vehicle has been permanently retired from the fleet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={retireDialogOpen} onOpenChange={setRetireDialogOpen}>
        <DialogContent className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Retire Vehicle</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to retire {vehicle.registration_number}? This will permanently remove it from active dispatch operations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetireDialogOpen(false)} className="bg-transparent border-zinc-700 text-zinc-300">Cancel</Button>
            <Button variant="destructive" onClick={handleRetire} disabled={actionLoading}>Confirm Retirement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Change Status</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to mark this vehicle as {targetStatus.replace('_', ' ')}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="bg-transparent border-zinc-700 text-zinc-300">Cancel</Button>
            <Button onClick={handleStatusChange} disabled={actionLoading} className="bg-purple-600 hover:bg-purple-700 text-white">Confirm Change</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
