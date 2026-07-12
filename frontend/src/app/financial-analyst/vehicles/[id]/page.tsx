'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVehicleFinancials, VehicleFinancials } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    return <div className="text-zinc-500 p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-300">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="text-red-400 bg-red-400/10 p-4 rounded-md border border-red-400/20">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" onClick={() => router.back()} className="mb-4 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analytics
        </Button>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">{data.registration_number} - {data.vehicle_name}</h2>
        <p className="text-zinc-400">Detailed financial performance report.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Total Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-400">{formatINR(data.revenue)}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Total Costs</CardDescription>
            <CardTitle className="text-2xl text-red-400">{formatINR(data.total_operational_cost)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Net Profit</CardDescription>
            <CardTitle className={`text-2xl ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatINR(data.profit)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Return on Investment</CardDescription>
            <CardTitle className={`text-2xl ${data.roi_percentage && data.roi_percentage >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
              {data.roi_percentage !== null ? `${data.roi_percentage.toFixed(1)}%` : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Fuel Cost</span>
              <span className="text-zinc-200 font-medium">{formatINR(data.fuel_cost)}</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Maintenance</span>
              <span className="text-zinc-200 font-medium">
                {data.maintenance_cost_available && data.maintenance_cost !== null 
                  ? formatINR(data.maintenance_cost) 
                  : <span className="text-yellow-500 text-sm">Integration Pending</span>}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Other Expenses</span>
              <span className="text-zinc-200 font-medium">{formatINR(data.other_expenses)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Efficiency Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Actual Distance</span>
              <span className="text-zinc-200 font-medium">{data.actual_distance} km</span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Cost per KM</span>
              <span className="text-zinc-200 font-medium">
                {data.cost_per_km !== null ? `${formatINR(data.cost_per_km)}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-400">Fuel Efficiency</span>
              <span className="text-zinc-200 font-medium">
                {data.fuel_efficiency !== null ? `${data.fuel_efficiency.toFixed(2)} km/L` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
