'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    registration_number: "",
    name: "",
    vehicle_type: "",
    max_load_capacity: "",
    odometer: "0",
    acquisition_cost: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        registration_number: formData.registration_number,
        name: formData.name,
        vehicle_type: formData.vehicle_type,
        max_load_capacity: parseFloat(formData.max_load_capacity),
        odometer: parseInt(formData.odometer || "0", 10),
        acquisition_cost: formData.acquisition_cost ? parseFloat(formData.acquisition_cost) : null
      };

      await apiClient('/vehicles/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      router.push('/fleet-manager/vehicles');
    } catch (err: any) {
      setError(err.message || "Failed to create vehicle");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Add Vehicle</h1>
          <p className="text-sm text-zinc-400 mt-1">Register a new vehicle to the fleet.</p>
        </div>
        <Link href="/fleet-manager/vehicles" className={buttonVariants({ variant: "outline", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" })}>
          Cancel
        </Link>
      </div>

      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-200">Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Registration Number</label>
                <Input 
                  required
                  placeholder="e.g. TRUCK-001"
                  value={formData.registration_number}
                  onChange={e => setFormData({...formData, registration_number: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Model / Name</label>
                <Input 
                  required
                  placeholder="e.g. Volvo FH16"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Vehicle Type</label>
                <Select required value={formData.vehicle_type} onValueChange={(v) => setFormData({...formData, vehicle_type: v || ""})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="Heavy Truck">Heavy Truck</SelectItem>
                    <SelectItem value="Light Commercial">Light Commercial</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Max Load Capacity (kg)</label>
                <Input 
                  required
                  type="number"
                  min="1"
                  step="0.1"
                  value={formData.max_load_capacity}
                  onChange={e => setFormData({...formData, max_load_capacity: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Initial Odometer (km)</label>
                <Input 
                  type="number"
                  min="0"
                  value={formData.odometer}
                  onChange={e => setFormData({...formData, odometer: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Acquisition Cost ($)</label>
                <Input 
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.acquisition_cost}
                  onChange={e => setFormData({...formData, acquisition_cost: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? "Registering..." : "Register Vehicle"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
