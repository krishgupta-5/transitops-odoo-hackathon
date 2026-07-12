'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CreateDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    license_category: "",
    license_expiry_date: "",
    contact_number: "",
    safety_score: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: formData.name,
        license_number: formData.license_number,
        license_category: formData.license_category,
        license_expiry_date: formData.license_expiry_date,
        contact_number: formData.contact_number,
        safety_score: formData.safety_score ? parseFloat(formData.safety_score) : null
      };

      await apiClient('/drivers/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      router.push('/fleet-manager/drivers');
    } catch (err: any) {
      setError(err.message || "Failed to create driver");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Add Driver</h1>
          <p className="text-sm text-zinc-400 mt-1">Register a new driver to the fleet.</p>
        </div>
        <Link href="/fleet-manager/drivers" className={buttonVariants({ variant: "outline", className: "bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white" })}>
          Cancel
        </Link>
      </div>

      <Card className="bg-[#18181b] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-200">Driver Details</CardTitle>
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
                <label className="text-xs font-semibold text-zinc-400 uppercase">Full Name</label>
                <Input 
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Contact Number</label>
                <Input 
                  required
                  placeholder="e.g. +1 234 567 8900"
                  value={formData.contact_number}
                  onChange={e => setFormData({...formData, contact_number: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">License Number</label>
                <Input 
                  required
                  placeholder="e.g. D123456789"
                  value={formData.license_number}
                  onChange={e => setFormData({...formData, license_number: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">License Category</label>
                <Select required value={formData.license_category} onValueChange={(v) => setFormData({...formData, license_category: v || ""})}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="Class A">Class A</SelectItem>
                    <SelectItem value="Class B">Class B</SelectItem>
                    <SelectItem value="Class C">Class C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">License Expiry Date</label>
                <Input 
                  required
                  type="date"
                  value={formData.license_expiry_date}
                  onChange={e => setFormData({...formData, license_expiry_date: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100 dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Initial Safety Score (0-100)</label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.safety_score}
                  onChange={e => setFormData({...formData, safety_score: e.target.value})}
                  className="bg-zinc-900 border-zinc-700 text-zinc-100"
                  placeholder="Leave empty if N/A"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white">
                {loading ? "Registering..." : "Register Driver"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
