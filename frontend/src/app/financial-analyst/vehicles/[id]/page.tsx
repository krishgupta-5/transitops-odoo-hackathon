'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVehicleFinancials, VehicleFinancials } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function VehicleAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<VehicleFinancials | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const res = await getVehicleFinancials(parseInt(id as string));
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load vehicle analytics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
        </Button>
        <LoadingState message="Loading vehicle financial report..." className="py-16" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto font-sans">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
        </Button>
        <div className="text-red-600 dark:text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs font-semibold">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {data.registration_number} — {data.vehicle_name}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">Detailed financial performance and operational cost report.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Revenue</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatINR(data.revenue)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Operational Cost</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {data.total_operational_cost !== null ? formatINR(data.total_operational_cost) : <span className="text-amber-500 text-lg">Incomplete</span>}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Net Profit</CardDescription>
            <CardTitle className={`text-xl sm:text-2xl font-bold ${data.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatINR(data.profit)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Return on Investment</CardDescription>
            <CardTitle className={`text-xl sm:text-2xl font-bold ${data.roi_percentage && data.roi_percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {data.roi_percentage !== null ? `${data.roi_percentage.toFixed(1)}%` : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Fuel Cost</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{formatINR(data.fuel_cost)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Maintenance</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {data.maintenance_cost_available && data.maintenance_cost !== null 
                  ? formatINR(data.maintenance_cost) 
                  : <span className="text-amber-500 text-xs">Integration Pending</span>}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Other Expenses</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{formatINR(data.other_expenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-3xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Operational Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Distance Traveled</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {data.actual_distance !== null && data.actual_distance !== undefined ? `${Number(data.actual_distance).toFixed(1)} km` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Cost per Kilometer</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white">
                {data.cost_per_km !== null ? `${formatINR(data.cost_per_km)}/km` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/[0.06] pb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Profit Margin</span>
              <span className={`text-xs font-bold ${data.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {data.revenue > 0 ? `${((data.profit / data.revenue) * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
