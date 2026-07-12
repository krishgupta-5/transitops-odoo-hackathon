'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";

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

  if (loading) return <div className="p-8 text-zinc-400">Loading driver details...</div>;
  if (error || !driver) return <div className="p-8 text-red-500">{error || "Driver not found"}</div>;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'OFF_DUTY': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SUSPENDED': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const getLicenseWarning = () => {
    const now = new Date();
    const expiry = new Date(driver.license_expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    if (expiry < now) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">Driver's license is EXPIRED. Do not dispatch.</span>
        </div>
      );
    } else if (expiry <= thirtyDaysFromNow) {
      return (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-md">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">Driver's license will expire soon on {driver.license_expiry_date}.</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">{driver.name}</h1>
            <Badge variant="outline" className={getStatusColor(driver.status)}>
              {driver.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400 mt-1">License: {driver.license_number}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/fleet-manager/drivers" className={buttonVariants({ variant: "outline", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" })}>
            Back to Directory
          </Link>
        </div>
      </div>
      
      {getLicenseWarning()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-zinc-200">Driver Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4">
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Contact Number</div>
                <div className="text-zinc-200 mt-1">{driver.contact_number}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Safety Score</div>
                <div className="text-zinc-200 mt-1">{driver.safety_score !== null ? `${driver.safety_score}/100` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">License Category</div>
                <div className="text-zinc-200 mt-1">{driver.license_category}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">License Expiry Date</div>
                <div className="text-zinc-200 mt-1">{driver.license_expiry_date}</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-500 uppercase">Registered On</div>
                <div className="text-zinc-200 mt-1">{new Date(driver.created_at).toLocaleDateString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#18181b] border-zinc-800">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-zinc-200">Personnel Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(driver.status === 'OFF_DUTY' || driver.status === 'SUSPENDED') && (
                <Button onClick={() => openStatusDialog('AVAILABLE')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                  Mark Available
                </Button>
              )}
              {driver.status === 'AVAILABLE' && (
                <>
                  <Button onClick={() => openStatusDialog('OFF_DUTY_DELETE')} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Set Off Duty
                  </Button>
                  <Button variant="destructive" onClick={() => openStatusDialog('SUSPENDED')} className="w-full bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-900/50">
                    Suspend Driver
                  </Button>
                </>
              )}
              
              {driver.status === 'ON_TRIP' && (
                <div className="text-sm text-zinc-500 bg-zinc-900/50 p-3 rounded border border-zinc-800 text-center">
                  Status changes are disabled while driver is on an active trip.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to {targetStatus === 'OFF_DUTY_DELETE' ? 'mark this driver as OFF DUTY' : `mark this driver as ${targetStatus.replace('_', ' ')}`}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)} className="bg-transparent border-zinc-700 text-zinc-300">Cancel</Button>
            <Button 
              onClick={handleStatusChange} 
              disabled={actionLoading} 
              className={targetStatus === 'SUSPENDED' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
