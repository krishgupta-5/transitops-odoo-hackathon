'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Activity, Info } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
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
        setVehicles((data || []).filter((v: Vehicle) => v.status !== 'RETIRED'));
      } catch (e) {
        console.error("Failed loading fleet", e);
      } finally {
        setLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, []);

  const selectedVehicle = vehicles.find(v => v.id === Number(vehicleId));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        vehicle_id: Number(vehicleId),
        service_type: serviceType.trim(),
        service_date: serviceDate,
        cost: parseFloat(cost),
        description: description.trim() || undefined,
      };

      await apiClient('/maintenance/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      router.push('/safety-officer/maintenance');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to schedule maintenance.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans max-w-[800px] mx-auto">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
        <Link
          href="/safety-officer/maintenance"
          className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Schedule New Maintenance
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Create a new scheduled servicing or inspection task for a vehicle
          </p>
        </div>
      </div>

      <Card className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
            Service Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* Vehicle Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Select Vehicle
              </label>
              {loadingVehicles ? (
                <div className="text-gray-500 text-xs py-2 flex items-center">
                  <Activity size={14} className="animate-spin mr-1.5" /> Loading non-retired fleet registry...
                </div>
              ) : (
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white font-semibold cursor-pointer"
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
                <div className="bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 p-4 rounded-xl space-y-2 text-xs mt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 font-mono">REGISTRATION:</span>
                      <p className="font-bold text-gray-900 dark:text-white">{selectedVehicle.registration_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-mono">MODEL / NAME:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 font-mono">CURRENT STATUS:</span>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedVehicle.status}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Service Type */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Service Type
                </label>
                <Input
                  placeholder="e.g. Oil Change, Brake Pad Replacement"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818]"
                  required
                />
              </div>

              {/* Service Date */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Service Date
                </label>
                <Input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818]"
                  required
                />
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Estimated Cost ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 150.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="rounded-xl text-xs bg-gray-50 dark:bg-[#181818]"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Description / Notes
              </label>
              <textarea
                placeholder="Add any specific diagnostic details or shop instructions..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl text-xs p-3 bg-gray-50 dark:bg-[#181818] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/[0.06]">
              <Link
                href="/safety-officer/maintenance"
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Maintenance'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
