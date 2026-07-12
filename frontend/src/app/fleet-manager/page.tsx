'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Truck, Users, Wrench, AlertTriangle } from "lucide-react";
import Link from "next/link";

type Vehicle = {
  id: number;
  status: string;
};

type Driver = {
  id: number;
  name: string;
  status: string;
  license_expiry_date: string;
};

import { LoadingState } from "@/components/ui/LoadingState";

export default function FleetManagerDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vData, dData, uData] = await Promise.all([
          apiClient('/vehicles/'),
          apiClient('/drivers/'),
          apiClient('/auth/me').catch(() => null)
        ]);
        setVehicles(vData);
        setDrivers(dData);
        if (uData) setUser(uData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error) {
    return (
      <div className="py-12 font-sans text-xs text-red-500">
        {error}
      </div>
    );
  }

  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const onTripVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const inShopVehicles = vehicles.filter(v => v.status === 'IN_SHOP').length;
  const retiredVehicles = vehicles.filter(v => v.status === 'RETIRED').length;

  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE').length;
  const onTripDrivers = drivers.filter(d => d.status === 'ON_TRIP').length;

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const expiredDrivers = drivers.filter(d => new Date(d.license_expiry_date) < now);
  const expiringSoonDrivers = drivers.filter(d => {
    const expiry = new Date(d.license_expiry_date);
    return expiry >= now && expiry <= thirtyDaysFromNow;
  });

  return (
    <div className="space-y-8 font-sans max-w-[1040px] mx-auto">
      {/* Page Title & Profile Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Fleet Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time monitoring of vehicles, active drivers, and maintenance alerts
          </p>
        </div>

        <Link
          href="/fleet-manager/profile"
          className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 hover:border-gray-400 dark:hover:border-white/25 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all shadow-2xs group self-start sm:self-auto"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Profile Settings</span>
          <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>

      {/* 4 Beautiful Rounded Standalone Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/fleet-manager/vehicles"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Vehicles</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Truck size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalVehicles}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span>{availableVehicles} Available</span>
              <span>•</span>
              <span>{onTripVehicles} Active</span>
            </div>
          </div>
        </Link>

        <Link
          href="/fleet-manager/vehicles?status=IN_SHOP"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Maintenance</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Wrench size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {inShopVehicles}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              In Shop
            </div>
          </div>
        </Link>

        <Link
          href="/fleet-manager/drivers"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Drivers</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Users size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {totalDrivers}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span>{availableDrivers} Available</span>
              <span>•</span>
              <span>{onTripDrivers} Active</span>
            </div>
          </div>
        </Link>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">License Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-red-500">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {expiredDrivers.length + expiringSoonDrivers.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
              <span className="text-red-500">{expiredDrivers.length} Expired</span>
              <span>•</span>
              <span className="text-amber-500">{expiringSoonDrivers.length} Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rounded Panels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status Breakdown Panel */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
            Status Breakdown
          </h2>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Available</span>
              <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{availableVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
              <span className="text-gray-600 dark:text-gray-300 font-medium">On Trip</span>
              <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{onTripVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
              <span className="text-gray-600 dark:text-gray-300 font-medium">In Shop</span>
              <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{inShopVehicles}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Retired</span>
              <span className="font-bold text-gray-900 dark:text-white bg-gray-200 dark:bg-white/10 px-2.5 py-0.5 rounded-full">{retiredVehicles}</span>
            </div>
          </div>
        </div>

        {/* License Watchlist Panel */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 shadow-xs">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-5">
            License Watchlist
          </h2>
          {expiredDrivers.length === 0 && expiringSoonDrivers.length === 0 ? (
            <div className="text-xs text-gray-400 py-10 text-center rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
              All driver licenses are valid and up to date.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {expiredDrivers.map(d => (
                <Link
                  href={`/fleet-manager/drivers/${d.id}`}
                  key={`exp-${d.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-500/5 dark:bg-red-500/[0.03] border border-red-500/20 hover:border-red-500/40 transition-colors group"
                >
                  <span className="text-gray-900 dark:text-white font-semibold group-hover:underline">
                    {d.name || `Driver #${d.id}`}
                  </span>
                  <span
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                  >
                    Expired
                  </span>
                </Link>
              ))}
              {expiringSoonDrivers.map(d => (
                <Link
                  href={`/fleet-manager/drivers/${d.id}`}
                  key={`soon-${d.id}`}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/[0.03] border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
                >
                  <span className="text-gray-900 dark:text-white font-semibold group-hover:underline">
                    {d.name || `Driver #${d.id}`}
                  </span>
                  <span
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase"
                  >
                    Expiring Soon
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fleet Manager Profile Banner Card */}
      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg flex items-center justify-center shrink-0">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'FM'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {user?.name || 'Fleet Manager'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {user?.role || 'Fleet Manager'}{user?.email ? ` • ${user.email}` : ''}
            </p>
          </div>
        </div>

        <Link
          href="/fleet-manager/profile"
          className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-3 rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shrink-0 shadow-2xs"
        >
          <span>Manage Profile</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
