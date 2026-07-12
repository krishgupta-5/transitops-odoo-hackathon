'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFinancialSummary, getVehicleFinancialsList, FinancialSummary, VehicleFinancials, apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/LoadingState";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

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
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [sum, veh, uData] = await Promise.all([
          getFinancialSummary(),
          getVehicleFinancialsList(),
          apiClient('/auth/me').catch(() => null)
        ]);
        setSummary(sum);
        setVehicles(veh);
        if (uData) setUser(uData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      }
    }
    loadData();
  }, []);

  if (error) {
    return <div className="text-red-500 dark:text-red-400 font-semibold p-4">Error: {error}</div>;
  }

  if (!summary) {
    return <LoadingState message="Loading financial analytics..." />;
  }

  // Prep data for Top 5 Profitable Vehicles
  const topVehiclesData = [...vehicles]
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 5)
    .map(v => ({
      reg: v.registration_number,
      Profit: v.profit,
      Revenue: v.revenue
    }));

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Financial Analytics Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Monitor real-time operational costs, revenue streams, and vehicle profitability.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Revenue</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatINR(summary.total_revenue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Operational Cost</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {summary.total_operational_cost !== null ? formatINR(summary.total_operational_cost) : <span className="text-amber-500 text-lg">Incomplete</span>}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Net Profit</CardDescription>
            <CardTitle className={`text-xl sm:text-2xl font-bold ${summary.net_profit !== null && summary.net_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {summary.net_profit !== null ? formatINR(summary.net_profit) : <span className="text-amber-500 text-lg">Incomplete</span>}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Overall ROI</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {summary.overall_roi_percentage !== null && summary.overall_roi_percentage !== undefined ? `${summary.overall_roi_percentage.toFixed(1)}%` : <span className="text-amber-500 text-lg">Incomplete</span>}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Cost per km</CardDescription>
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {summary.cost_per_km !== null ? formatINR(summary.cost_per_km) : <span className="text-amber-500 text-lg">Incomplete</span>}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Revenue vs Operational Cost</CardTitle>
            <CardDescription className="text-xs">Visual breakdown of profitability margin</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {summary.net_profit !== null && summary.total_operational_cost !== null ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Operational Cost', value: summary.total_operational_cost, color: '#DC2626' },
                      { name: 'Net Profit', value: Math.max(0, summary.net_profit), color: '#059669' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    <Cell fill="#DC2626" />
                    <Cell fill="#059669" />
                  </Pie>
                  <Tooltip formatter={(value) => [formatINR(Number(value)), 'Amount']} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No complete financial data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Top 5 Profitable Vehicles</CardTitle>
            <CardDescription className="text-xs">Based on total net profits generated</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {topVehiclesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topVehiclesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="reg" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(val) => `₹${val / 1000}k`} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [formatINR(Number(value)), 'Profit']} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="Profit" fill="#059669" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">No vehicle data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle Profitability Table */}
      <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-3xl overflow-hidden">
        <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] pb-4">
          <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Vehicle Financial Breakdown</CardTitle>
          <CardDescription className="text-xs text-gray-500 dark:text-gray-400">Detailed revenue, operational cost, and profit per vehicle</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Vehicle</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right">Revenue</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right">Op Cost</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right">Profit</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right pr-6">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.vehicle_id} className="border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="pl-6 py-4">
                    <Link href={`/financial-analyst/vehicles/${v.vehicle_id}`} className="hover:underline">
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{v.registration_number}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{v.vehicle_name}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300">{formatINR(v.revenue)}</TableCell>
                  <TableCell className="text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {v.total_operational_cost !== null ? formatINR(v.total_operational_cost) : <span className="text-amber-500">N/A</span>}
                  </TableCell>
                  <TableCell className={`text-right text-xs font-bold ${v.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatINR(v.profit)}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {v.roi_percentage !== null ? (
                      <Badge variant="outline" className={v.roi_percentage >= 100 ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10'}>
                        {v.roi_percentage.toFixed(1)}%
                      </Badge>
                    ) : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {vehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                    No vehicles found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financial Analyst Profile Banner Card */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg flex items-center justify-center shrink-0">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'FA'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {user?.name || 'Demo Financial Analyst'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.role || 'FINANCIAL_ANALYST'}{user?.email ? ` • ${user.email}` : ''}
            </p>
          </div>
        </div>

        <Link
          href="/financial-analyst/profile"
          className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shrink-0 shadow-2xs"
        >
          <span>Manage Profile</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
