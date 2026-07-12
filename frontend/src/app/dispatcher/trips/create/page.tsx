'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
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
    <div className="space-y-8 max-w-3xl mx-auto font-sans pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Create Trip</h1>
        </div>
        <Link 
          href="/dispatcher/trips" 
          className="bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
        >
          Cancel
        </Link>
      </div>

      <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 rounded-3xl shadow-xs">
        <CardHeader className="pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Trip Specifications</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <div className="flex gap-2 items-start text-red-600 dark:text-red-400 text-xs font-semibold mb-6 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Source *</label>
                <Input required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5" placeholder="Origin city or depot" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Destination *</label>
                <Input required value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5" placeholder="Destination city or depot" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Vehicle *</label>
                <Select required value={formData.vehicle_id} onValueChange={(v) => setFormData({...formData, vehicle_id: v || ""})}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5">
                    <SelectValue placeholder="Select an available vehicle..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl max-h-60">
                    {vehicles.length === 0 && <SelectItem value="none" disabled className="text-xs">No vehicles available</SelectItem>}
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id.toString()} className="text-xs font-semibold py-2">
                        {v.registration_number} ({v.vehicle_type}) - Max Load: {v.max_load_capacity}kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Driver *</label>
                <Select required value={formData.driver_id} onValueChange={(v) => setFormData({...formData, driver_id: v || ""})}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5">
                    <SelectValue placeholder="Select an available driver..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl max-h-60">
                    {drivers.length === 0 && <SelectItem value="none" disabled className="text-xs">No drivers available</SelectItem>}
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()} className="text-xs font-semibold py-2">
                        {d.name} ({d.license_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Cargo Weight (kg) *</label>
                <Input required type="number" step="0.01" min="0.01" value={formData.cargo_weight} onChange={e => setFormData({...formData, cargo_weight: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Planned Distance (km) *</label>
                <Input required type="number" step="0.01" min="0.01" value={formData.planned_distance} onChange={e => setFormData({...formData, planned_distance: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Revenue (INR) *</label>
                <Input required type="number" step="0.01" min="0" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5" />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-black dark:bg-white text-white dark:text-black font-bold text-xs px-6 h-10 rounded-xl hover:opacity-90 transition-opacity">
                {loading ? "Creating Trip..." : "Create Trip"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
