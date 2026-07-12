'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Info } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  status: string;
}

export default function CreateMaintenancePage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  // Form values
  const [vehicleId, setVehicleId] = useState<string>('');
  const [serviceType, setServiceType] = useState('');
  const [serviceDate, setServiceDate] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const data = await apiClient('/vehicles/');
        // Filter out RETIRED vehicles
        const nonRetired = data.filter((v: Vehicle) => v.status !== 'RETIRED');
        setVehicles(nonRetired);
      } catch (e) {
        console.error("Failed to load vehicles", e);
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, []);

  const selectedVehicle = vehicles.find(v => String(v.id) === vehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      setErrorMsg("Please select a vehicle.");
      return;
    }
    if (!serviceType.trim()) {
      setErrorMsg("Service type cannot be empty.");
      return;
    }
    if (!serviceDate) {
      setErrorMsg("Please select a service date.");
      return;
    }
    if (Number(cost) < 0) {
      setErrorMsg("Cost must be non-negative.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await apiClient('/maintenance/', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: Number(vehicleId),
          service_type: serviceType.trim(),
          service_date: serviceDate,
          cost: Number(cost),
          description: description.trim() || null,
        }),
      });
      router.push('/safety-officer/maintenance');
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create maintenance record.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/safety-officer/maintenance" className={buttonVariants({ variant: "outline", size: "sm", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800" })}>
          <ArrowLeft size={16} /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Schedule New Maintenance</h1>
          <p className="text-sm text-zinc-400 mt-1">Create a new scheduled servicing task for a vehicle.</p>
        </div>
      </div>

      <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
        <CardHeader className="border-b border-zinc-850">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-300">Maintenance Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded text-xs leading-normal">
                {errorMsg}
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Vehicle</label>
              {loadingVehicles ? (
                <div className="text-zinc-500 text-xs py-2 flex items-center">
                  <Activity size={14} className="animate-spin mr-1.5" /> Loading non-retired fleet registry...
                </div>
              ) : (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 text-xs font-semibold cursor-pointer"
                  required
                >
                  <option value="">-- Choose a vehicle --</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registration_number} - {v.name} ({v.status})
                    </option>
                  ))}
                </select>
              )}

              {selectedVehicle && (
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-md space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-zinc-500 font-mono">REGISTRATION:</span>
                      <p className="font-bold text-zinc-200">{selectedVehicle.registration_number}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono">MODEL / NAME:</span>
                      <p className="font-semibold text-zinc-300">{selectedVehicle.name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono">TYPE:</span>
                      <p className="text-zinc-300">{selectedVehicle.vehicle_type}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono">STATUS:</span>
                      <p className="mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          selectedVehicle.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400' :
                          selectedVehicle.status === 'ON_TRIP' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          {selectedVehicle.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  {selectedVehicle.status === 'ON_TRIP' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-2.5 rounded flex items-start gap-2 mt-2 leading-normal">
                      <Info size={14} className="shrink-0 mt-0.5" />
                      <span>This vehicle cannot start maintenance while on an active trip. It can only be scheduled.</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 text-xs font-semibold cursor-pointer"
                required
              >
                <option value="">-- Select Service Type --</option>
                <option value="Routine Service">Routine Service</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Brake Inspection">Brake Inspection</option>
                <option value="Tire Replacement">Tire Replacement</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Transmission Repair">Transmission Repair</option>
                <option value="Electrical Repair">Electrical Repair</option>
                <option value="Other">Other (Specify in description)</option>
              </select>
            </div>

            {/* Service Date & Cost */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Service Date</label>
                <Input 
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estimated Cost ($)</label>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
              <textarea 
                rows={3}
                placeholder="Describe the diagnostics, parts to replace, or detailed reasons for maintenance..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md px-3.5 py-2.5 text-zinc-100 focus:outline-none focus:border-orange-500 text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-850">
              <Link href="/safety-officer/maintenance" className={buttonVariants({ variant: "outline", className: "border-zinc-700 bg-transparent text-zinc-300 hover:bg-zinc-800" })}>
                Cancel
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
              >
                {isSubmitting ? 'Creating...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
