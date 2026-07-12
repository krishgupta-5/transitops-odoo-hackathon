'use client';

import { useEffect, useState } from "react";
import { getFinancialSummary, getVehicleFinancialsList, FinancialSummary, VehicleFinancials } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [vehicles, setVehicles] = useState<VehicleFinancials[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [sum, veh] = await Promise.all([
          getFinancialSummary(),
          getVehicleFinancialsList()
        ]);
        setSummary(sum);
        setVehicles(veh);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      }
    }
    loadData();
  }, []);

  if (error) {
    return <div className="text-red-400">Error: {error}</div>;
  }

  if (!summary) {
    return <div className="text-zinc-400">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Financial Dashboard</h2>
        <p className="text-zinc-400">Monitor fleet operational costs and profitability.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Total Revenue</CardDescription>
            <CardTitle className="text-2xl text-green-400">{formatINR(summary.total_revenue)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Total Operational Cost</CardDescription>
            <CardTitle className="text-2xl text-red-400">{formatINR(summary.total_operational_cost)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Fuel Cost</CardDescription>
            <CardTitle className="text-2xl text-orange-400">{formatINR(summary.total_fuel_cost)}</CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400 flex justify-between items-center">
              Maintenance Cost
              {!summary.maintenance_cost_available && (
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-1 rounded ml-2">Integration Pending</span>
              )}
            </CardDescription>
            <CardTitle className="text-2xl text-zinc-300">
              {summary.maintenance_cost_available && summary.total_maintenance_cost !== null 
                ? formatINR(summary.total_maintenance_cost) 
                : 'Not Available'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Net Profit</CardDescription>
            <CardTitle className={`text-2xl ${summary.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatINR(summary.net_profit)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Cost Per KM</CardDescription>
            <CardTitle className="text-xl text-zinc-100">
              {summary.cost_per_km !== null ? `${formatINR(summary.cost_per_km)}/km` : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Fuel Efficiency</CardDescription>
            <CardTitle className="text-xl text-zinc-100">
              {summary.fleet_fuel_efficiency !== null ? `${summary.fleet_fuel_efficiency.toFixed(2)} km/L` : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader className="pb-2">
            <CardDescription className="text-zinc-400">Fleet Utilization</CardDescription>
            <CardTitle className="text-xl text-zinc-100">
              {summary.fleet_utilization.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Vehicle Profitability Table */}
      <Card className="bg-zinc-900/50 border-zinc-800 mt-6">
        <CardHeader>
          <CardTitle className="text-xl text-zinc-100">Vehicle Profitability</CardTitle>
          <CardDescription className="text-zinc-400">Financial performance breakdown by vehicle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                <TableHead className="text-zinc-400">Vehicle</TableHead>
                <TableHead className="text-zinc-400 text-right">Revenue</TableHead>
                <TableHead className="text-zinc-400 text-right">Op Cost</TableHead>
                <TableHead className="text-zinc-400 text-right">Profit</TableHead>
                <TableHead className="text-zinc-400 text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.vehicle_id} className="border-zinc-800 hover:bg-zinc-800/50">
                  <TableCell>
                    <div className="font-medium text-zinc-100">{v.registration_number}</div>
                    <div className="text-xs text-zinc-500">{v.vehicle_name}</div>
                  </TableCell>
                  <TableCell className="text-right text-zinc-300">{formatINR(v.revenue)}</TableCell>
                  <TableCell className="text-right text-zinc-300">{formatINR(v.total_operational_cost)}</TableCell>
                  <TableCell className={`text-right font-medium ${v.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatINR(v.profit)}
                  </TableCell>
                  <TableCell className="text-right text-zinc-300">
                    {v.roi_percentage !== null ? (
                       <Badge variant="outline" className={v.roi_percentage >= 100 ? 'text-green-400 border-green-900 bg-green-400/10' : 'text-orange-400 border-orange-900 bg-orange-400/10'}>
                         {v.roi_percentage.toFixed(1)}%
                       </Badge>
                    ) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-zinc-500">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
