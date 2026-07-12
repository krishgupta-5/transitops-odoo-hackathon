'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVehicleFinancialsList, VehicleFinancials } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AnalyticsPage() {
  const [vehicles, setVehicles] = useState<VehicleFinancials[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getVehicleFinancialsList();
        setVehicles(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Vehicle Analytics</h2>
        <p className="text-zinc-400">Deep dive into financial performance for each individual vehicle.</p>
      </div>

      {error && <div className="text-red-400 bg-red-400/10 p-4 rounded-md border border-red-400/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="text-zinc-500">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-zinc-500">No vehicle data available.</div>
        ) : (
          vehicles.map((v) => (
            <Link key={v.vehicle_id} href={`/financial-analyst/vehicles/${v.vehicle_id}`}>
              <Card className="bg-zinc-900/50 border-zinc-800 hover:border-green-500/50 hover:bg-zinc-800/80 transition-colors cursor-pointer group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-zinc-100 group-hover:text-green-400 transition-colors">{v.registration_number}</CardTitle>
                      <CardDescription className="text-zinc-400">{v.vehicle_name}</CardDescription>
                    </div>
                    {v.roi_percentage !== null && (
                       <Badge variant="outline" className={v.roi_percentage >= 100 ? 'text-green-400 border-green-900 bg-green-400/10' : 'text-orange-400 border-orange-900 bg-orange-400/10'}>
                         ROI: {v.roi_percentage.toFixed(1)}%
                       </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Profit</span>
                      <span className={`font-medium ${v.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatINR(v.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Cost/KM</span>
                      <span className="text-zinc-200">
                        {v.cost_per_km !== null ? `${formatINR(v.cost_per_km)}/km` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
