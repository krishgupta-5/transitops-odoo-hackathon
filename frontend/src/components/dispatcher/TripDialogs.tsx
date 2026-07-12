'use client';

import { useState } from "react";
import { apiClient } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface TripDialogsProps {
  trip: any;
  open: { dispatch: boolean; complete: boolean; cancel: boolean };
  onClose: () => void;
  onSuccess: () => void;
}

export default function TripDialogs({ trip, open, onClose, onSuccess }: TripDialogsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completeData, setCompleteData] = useState({ final_odometer: "", fuel_consumed: "" });

  if (!trip) return null;

  const handleAction = async (endpoint: string, body?: any) => {
    setLoading(true);
    setError("");
    try {
      await apiClient(`/trips/${trip.id}${endpoint}`, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const onCompleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction("/complete", {
      final_odometer: parseInt(completeData.final_odometer),
      fuel_consumed: parseFloat(completeData.fuel_consumed)
    });
  };

  return (
    <>
      {/* Dispatch Dialog */}
      <Dialog open={open.dispatch} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Dispatch Trip {trip.trip_number}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to dispatch this trip? 
              <br/><br/>
              <strong>Vehicle:</strong> {trip.vehicle?.registration_number}<br/>
              <strong>Driver:</strong> {trip.driver?.name}<br/>
              <strong>Cargo Weight:</strong> {trip.cargo_weight}kg
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="flex gap-2 items-start text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="bg-transparent border-zinc-700 text-zinc-300">Cancel</Button>
            <Button onClick={() => handleAction("/dispatch")} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Dispatching..." : "Confirm Dispatch"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={open.complete} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Complete Trip {trip.trip_number}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter the final metrics to complete this trip.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex gap-2 items-start text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={onCompleteSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Final Odometer</label>
              <Input 
                required 
                type="number" 
                min={trip.initial_odometer || 0}
                value={completeData.final_odometer} 
                onChange={(e) => setCompleteData({...completeData, final_odometer: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase">Fuel Consumed</label>
              <Input 
                required 
                type="number" 
                step="0.01" 
                min="0"
                value={completeData.fuel_consumed} 
                onChange={(e) => setCompleteData({...completeData, fuel_consumed: e.target.value})}
                className="bg-zinc-800 border-zinc-700 text-zinc-100" 
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-zinc-700 text-zinc-300">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Completing..." : "Complete Trip"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={open.cancel} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Cancel Trip {trip.trip_number}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {trip.status === "DRAFT" 
                ? "The trip will be cancelled."
                : "The trip will be cancelled and the assigned vehicle and driver will become available again."}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="flex gap-2 items-start text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="bg-transparent border-zinc-700 text-zinc-300">Close</Button>
            <Button onClick={() => handleAction("/cancel")} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? "Cancelling..." : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
