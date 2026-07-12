'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Users, MapPin, Wrench, Activity, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/LoadingState';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function FleetManagerAnalyticsPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllAnalyticsData() {
      setLoading(true);
      setError(null);
      try {
        const [vData, dData, tData, mData] = await Promise.all([
          apiClient('/vehicles/?limit=1000'),
          apiClient('/drivers/?limit=1000'),
          apiClient('/trips/?limit=1000'),
          apiClient('/maintenance/?limit=1000')
        ]);
        setVehicles(vData);
        setDrivers(dData);
        setTrips(tData);
        setMaintenances(mData);
      } catch (err: any) {
        setError(err.message || "Failed to load operational analytics data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAllAnalyticsData();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating operational analytics..." className="min-h-[400px]" />;
  }

  if (error) {
    return (
      <div className="p-12 text-center text-xs font-bold text-red-655 dark:text-red-400 flex flex-col items-center justify-center gap-2 font-sans">
        <AlertCircle size={28} />
        <span>{error}</span>
      </div>
    );
  }

  // KPIs
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;
  const retiredVehicles = vehicles.filter(v => v.status === 'RETIRED').length;

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTripDrivers = drivers.filter(d => d.status === 'ON_TRIP').length;
  const offDutyDrivers = drivers.filter(d => d.status === 'OFF_DUTY').length;
  const suspendedDrivers = drivers.filter(d => d.status === 'SUSPENDED').length;

  const activeTripsCount = trips.filter(t => t.status === "DISPATCHED").length;
  
  const operationalVehicles = vehicles.filter(v => v.status !== "RETIRED").length;
  const fleetUtilization = operationalVehicles > 0 
    ? Math.round((onTripVehicles / operationalVehicles) * 100) 
    : 0;

  // Chart data preps
  const vehicleStatusData = [
    { name: 'Available', value: availableVehicles, color: '#10B981' },
    { name: 'On Trip', value: onTripVehicles, color: '#3B82F6' },
    { name: 'In Shop', value: inShopVehicles, color: '#F59E0B' },
    { name: 'Retired', value: retiredVehicles, color: '#6B7280' },
  ].filter(d => d.value > 0);

  const driverStatusData = [
    { name: 'Available', value: availableDrivers, color: '#10B981' },
    { name: 'On Trip', value: onTripDrivers, color: '#3B82F6' },
    { name: 'Off Duty', value: offDutyDrivers, color: '#6B7280' },
    { name: 'Suspended', value: suspendedDrivers, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const tripStatusData = [
    { name: 'Draft', value: trips.filter(t => t.status === "DRAFT").length, color: '#6B7280' },
    { name: 'Dispatched', value: activeTripsCount, color: '#3B82F6' },
    { name: 'Completed', value: trips.filter(t => t.status === "COMPLETED").length, color: '#10B981' },
    { name: 'Cancelled', value: trips.filter(t => t.status === "CANCELLED").length, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const maintenanceStatusData = [
    { name: 'Scheduled', value: maintenances.filter(m => m.status === 'SCHEDULED').length, color: '#3b82f6' },
    { name: 'In Progress', value: maintenances.filter(m => m.status === 'IN_PROGRESS').length, color: '#f59e0b' },
    { name: 'Completed', value: maintenances.filter(m => m.status === 'COMPLETED').length, color: '#10b981' },
    { name: 'Cancelled', value: maintenances.filter(m => m.status === 'CANCELLED').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Operational Analytics
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive, live-data overview of vehicle statuses, driver allocations, and active dispatch statistics.
        </p>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vehicles KPI */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Fleet Size</CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{totalVehicles}</span>
              <Truck size={16} className="text-gray-400" />
            </CardTitle>
            <div className="text-[10px] text-gray-500 font-semibold mt-1">
              {availableVehicles} Avail • {onTripVehicles} On Trip • {inShopVehicles} In Shop
            </div>
          </CardHeader>
        </Card>

        {/* Drivers KPI */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Total Drivers</CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{totalDrivers}</span>
              <Users size={16} className="text-gray-400" />
            </CardTitle>
            <div className="text-[10px] text-gray-500 font-semibold mt-1">
              {availableDrivers} Avail • {onTripDrivers} Active • {suspendedDrivers} Suspended
            </div>
          </CardHeader>
        </Card>

        {/* Active Trips KPI */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Active Dispatches</CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{activeTripsCount}</span>
              <MapPin size={16} className="text-gray-400" />
            </CardTitle>
            <div className="text-[10px] text-gray-500 font-semibold mt-1">
              Currently dispatched and in transit.
            </div>
          </CardHeader>
        </Card>

        {/* Fleet Utilization KPI */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-bold text-gray-500 dark:text-gray-400">Fleet Utilization</CardDescription>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-between">
              <span>{fleetUtilization}%</span>
              <Activity size={16} className="text-gray-400" />
            </CardTitle>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-black dark:bg-white rounded-full transition-all"
                style={{ width: `${fleetUtilization}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Distribution Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Status Distribution */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Vehicle Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-64 flex items-center justify-center">
            {vehicleStatusData.length === 0 ? (
              <div className="text-xs text-gray-400">No vehicle data available</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={vehicleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {vehicleStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Vehicles']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Status Distribution */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Driver Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-64 flex items-center justify-center">
            {driverStatusData.length === 0 ? (
              <div className="text-xs text-gray-400">No driver data available</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={driverStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {driverStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Drivers']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trip Status Distribution */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Trip Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-64 flex items-center justify-center">
            {tripStatusData.length === 0 ? (
              <div className="text-xs text-gray-400">No trip data available</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tripStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {tripStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Trips']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Status Distribution */}
        <Card className="bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 shadow-xs rounded-2xl">
          <CardHeader className="border-b border-gray-100 dark:border-white/[0.06] pb-3">
            <CardTitle className="text-sm font-bold text-gray-900 dark:text-white">Maintenance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 h-64 flex items-center justify-center">
            {maintenanceStatusData.length === 0 ? (
              <div className="text-xs text-gray-400">No maintenance data available</div>
            ) : (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={maintenanceStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {maintenanceStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Servicings']} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
