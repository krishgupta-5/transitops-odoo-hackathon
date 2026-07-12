'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function CreateTripPage() {
  const router = useRouter();
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    source: "",
    destination: "",
    vehicle_id: "",
    driver_id: "",
    cargo_weight: "",
    planned_distance: "",
    revenue: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [vData, dData] = await Promise.all([
          apiClient("/vehicles/?status=AVAILABLE"),
          apiClient("/drivers/?status=AVAILABLE")
        ]);
        setVehicles(vData);
        setDrivers(dData);
      } catch (err: any) {
        setError("Failed to load vehicles and drivers. " + (err.message || ""));
      }
    }
    fetchData();
  }, []);

  const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    const cargo_weight = parseFloat(formData.cargo_weight);
    if (selectedVehicle && cargo_weight > selectedVehicle.max_load_capacity) {
      setError(`Cargo weight (${cargo_weight}kg) exceeds selected vehicle maximum load capacity (${selectedVehicle.max_load_capacity}kg)`);
      return;
    }

    setLoading(true);
    try {
      await apiClient("/trips/", {
        method: "POST",
        body: JSON.stringify({
          source: formData.source,
          destination: formData.destination,
          vehicle_id: parseInt(formData.vehicle_id),
          driver_id: parseInt(formData.driver_id),
          cargo_weight: cargo_weight,
          planned_distance: parseFloat(formData.planned_distance),
          revenue: parseFloat(formData.revenue)
        })
      });
      router.push("/dispatcher/trips");
    } catch (err: any) {
      setError(err.message || "Failed to create trip");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Create Trip</h1>
          <p className="text-sm text-zinc-400 mt-1">Assign a new trip to an available vehicle and driver.</p>
        </div>
        <Link href="/dispatcher/trips" className={buttonVariants({ variant: "outline", className: "bg-transparent border-zinc-700 text-zinc-300" })}>
          Cancel
        </Link>
      </div>

      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 font-medium">Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex gap-2 items-start text-red-400 text-sm mb-6 bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Source</label>
                <Input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Destination</label>
                <Input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Vehicle</label>
                <Select required value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v || ""})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select an available vehicle" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-h-64">
                    {vehicles.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id.toString()}>
                        {v.registration_number} ({v.vehicle_type}) - Max Load: {v.max_load_capacity}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Driver</label>
                <Select required value={formData.driver_id} onValueChange={(v) => setFormData({...formData, driver_id: v || ""})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select an available driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-h-64">
                    {drivers.length === 0 && <SelectItem value="none" disabled>No drivers available</SelectItem>}
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.name} ({d.license_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Cargo Weight (kg)</label>
                <Input required type="number" step="0.01" min="0.01" value={formData.cargo_weight} onChange={e => setFormData({...formData, cargo_weight: e.target.value})} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Planned Dist (km)</label>
                <Input required type="number" step="0.01" min="0.01" value={formData.planned_distance} onChange={e => setFormData({...formData, planned_distance: e.target.value})} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Revenue ($)</label>
                <Input required type="number" step="0.01" min="0" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} className="bg-zinc-900 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white w-32">
                {loading ? "Creating..." : "Create Trip"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
