'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Truck, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";

export default function DispatcherDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tData, vData, dData] = await Promise.all([
          apiClient("/trips/"),
          apiClient("/vehicles/"),
          apiClient("/drivers/")
        ]);
        setTrips(tData);
        setVehicles(vData);
        setDrivers(dData);
        setError("");
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const activeTripsCount = trips.filter(t => t.status === "DISPATCHED").length;
  const pendingTripsCount = trips.filter(t => t.status === "DRAFT").length;
  const completedTripsCount = trips.filter(t => t.status === "COMPLETED").length;
  
  const activeVehiclesCount = vehicles.filter(v => v.status === "ON_TRIP").length;
  const availableVehiclesCount = vehicles.filter(v => v.status === "AVAILABLE").length;
  const inShopVehiclesCount = vehicles.filter(v => v.status === "IN_SHOP").length;
  
  const driversOnDutyCount = drivers.filter(d => d.status === "ON_TRIP").length;
  const availableDriversCount = drivers.filter(d => d.status === "AVAILABLE").length;

  const operationalVehicles = vehicles.filter(v => v.status !== "RETIRED").length;
  const fleetUtilization = operationalVehicles > 0 
    ? Math.round((activeVehiclesCount / operationalVehicles) * 100) 
    : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge className="bg-gray-500 hover:bg-gray-600 text-white shadow-xs border-none text-[10px] uppercase font-bold">Draft</Badge>;
      case "DISPATCHED": return <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-none text-[10px] uppercase font-bold">Dispatched</Badge>;
      case "COMPLETED": return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-none text-[10px] uppercase font-bold">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs border-none text-[10px] uppercase font-bold">Cancelled</Badge>;
      default: return <Badge variant="outline" className="text-[10px] uppercase font-bold">{status}</Badge>;
    }
  };

  if (loading) {
    return <LoadingState message="Loading dispatcher operations..." />;
  }

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      {/* Top Header matching Fleet Manager SAME TO SAME */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Dispatch Operations Overview
          </h1>
        </div>

        <Link
          href="/dispatcher/profile"
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all shadow-2xs group self-start sm:self-auto"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Profile Settings</span>
          <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {error && (
        <div className="flex gap-2 items-start text-red-600 dark:text-red-400 text-sm bg-red-500/10 p-3.5 rounded-xl border border-red-500/20">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* 4 Beautiful Standalone Metric Cards matching Fleet Manager SAME TO SAME */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dispatcher/trips"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Active Trips</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <MapPin size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {activeTripsCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span>{pendingTripsCount} Pending</span>
              <span>•</span>
              <span>{completedTripsCount} Completed</span>
            </div>
          </div>
        </Link>

        <Link
          href="/dispatcher/fleet"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Fleet Utilization</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Truck size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {fleetUtilization}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span>{activeVehiclesCount} Active</span>
              <span>•</span>
              <span>{availableVehiclesCount} Available</span>
            </div>
          </div>
        </Link>

        <Link
          href="/dispatcher/drivers"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Drivers On Duty</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Users size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {driversOnDutyCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span>{availableDriversCount} Ready</span>
              <span>•</span>
              <span>{drivers.length} Total</span>
            </div>
          </div>
        </Link>

        <Link
          href="/dispatcher/trips"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Pending Dispatches</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Clock size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {pendingTripsCount}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Trips Awaiting Dispatch
            </div>
          </div>
        </Link>
      </div>

      {/* Rounded Panels Grid matching Fleet Manager SAME TO SAME */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Dispatches */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Recent Dispatches
            </h2>
            <Link
              href="/dispatcher/trips"
              className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View All Trips</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">No trips found.</div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
                <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 h-9">Trip</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 h-9">Route</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 h-9">Vehicle & Driver</TableHead>
                  <TableHead className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 h-9">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.slice(0, 6).map((trip) => (
                  <TableRow key={trip.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="font-bold text-xs text-gray-900 dark:text-white py-3">{trip.trip_number}</TableCell>
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 py-3">
                      {trip.source} → {trip.destination}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">{trip.vehicle?.registration_number || "--"}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">{trip.driver?.name || "--"}</div>
                    </TableCell>
                    <TableCell className="py-3">
                      {getStatusBadge(trip.status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Right 1 Col: Status Breakdown matching Fleet Manager Status Breakdown Panel */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
              Status Breakdown
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Dispatched Trips</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{activeTripsCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Draft Trips</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{pendingTripsCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Available Vehicles</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{availableVehiclesCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Vehicles On Trip</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{activeVehiclesCount}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Drivers Ready</span>
                <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{availableDriversCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.06] flex justify-between items-center text-xs">
            <span className="text-gray-500 dark:text-gray-400">Total Fleet Active</span>
            <span className="font-bold text-gray-900 dark:text-white">{activeVehiclesCount + availableVehiclesCount} units</span>
          </div>
        </div>
      </div>
    </div>
  );
}
