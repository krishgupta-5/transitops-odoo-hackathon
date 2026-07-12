'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVehicleFinancialsList, VehicleFinancials } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/LoadingState";

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
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Vehicle Profitability & ROI Analytics
        </h1>
      </div>

      {error && (
        <div className="text-red-600 dark:text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full">
            <LoadingState message="Loading vehicle analytics..." />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm font-semibold">No vehicle financial data available.</div>
        ) : (
          vehicles.map((v) => (
            <Link key={v.vehicle_id} href={`/financial-analyst/vehicles/${v.vehicle_id}`}>
              <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 hover:border-black dark:hover:border-white/40 transition-all rounded-3xl shadow-xs cursor-pointer group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {v.registration_number}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500 dark:text-gray-400">
                        {v.vehicle_name}
                      </CardDescription>
                    </div>
                    {v.roi_percentage !== null && (
                      <Badge variant="outline" className={v.roi_percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 font-bold text-xs' : 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 font-bold text-xs'}>
                        ROI: {v.roi_percentage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-gray-400">Net Profit</span>
                      <span className={`font-bold ${v.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                        {formatINR(v.profit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-gray-500 dark:text-gray-400">Cost per km</span>
                      <span className="text-gray-900 dark:text-gray-200">
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
