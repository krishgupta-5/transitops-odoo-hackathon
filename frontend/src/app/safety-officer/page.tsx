'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, Users, AlertTriangle, ShieldAlert, CheckCircle2, 
  Calendar, Award, Activity, ArrowRight, ShieldCheck, Hammer
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { LoadingState } from '@/components/ui/LoadingState';

interface Driver {
  id: number;
  name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: string;
}

interface Vehicle {
  id: number;
  registration_number: string;
  name: string;
  vehicle_type: string;
  status: string;
  odometer: number;
}

interface Maintenance {
  id: number;
  vehicle_id: number;
  service_type: string;
  service_date: string;
  cost: number;
  description: string;
  status: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  vehicle?: Vehicle;
}

export default function SafetyOfficerDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [driversData, vehiclesData, maintData] = await Promise.all([
          apiClient('/drivers/'),
          apiClient('/vehicles/'),
          apiClient('/maintenance/')
        ]);
        setDrivers(driversData || []);
        setVehicles(vehiclesData || []);
        setMaintenances(maintData || []);
      } catch (err: any) {
        setError(err.message || "Failed to load safety dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading safety & compliance dashboard..." />;
  }

  if (error) {
    return (
      <div className="py-12 font-sans text-xs text-red-500">
        {error}
      </div>
    );
  }

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  const expiredDrivers = drivers.filter(d => new Date(d.license_expiry_date) < now);
  const expiringSoonDrivers = drivers.filter(d => {
    const expiry = new Date(d.license_expiry_date);
    return expiry >= now && expiry <= thirtyDaysFromNow;
  });

  const inProgressMaintenance = maintenances.filter(m => m.status === 'IN_PROGRESS');
  const scheduledMaintenance = maintenances.filter(m => m.status === 'SCHEDULED');
  const completedMaintenance = maintenances.filter(m => m.status === 'COMPLETED');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Progress
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Scheduled
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/10 text-gray-500 border border-gray-500/20">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 font-sans max-w-[1040px] mx-auto">
      {/* Page Title & Profile Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 dark:border-white/[0.06]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Safety & Compliance Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time monitoring of fleet safety, driver compliance, and vehicle maintenance logs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/safety-officer/maintenance/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all shadow-sm shrink-0"
          >
            <Wrench size={14} />
            <span>Schedule Maintenance</span>
          </Link>
          <Link
            href="/safety-officer/profile"
            className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#181818] border border-gray-200 dark:border-white/15 hover:border-gray-400 dark:hover:border-white/30 text-xs font-semibold text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white transition-all shadow-2xs group shrink-0"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Profile Settings</span>
            <span className="text-gray-400 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* 4 Beautiful Standalone Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/safety-officer/maintenance"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Active Shop Work</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Wrench size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {inProgressMaintenance.length}
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 mt-2 font-semibold">
              Vehicles in shop right now
            </div>
          </div>
        </Link>

        <Link
          href="/safety-officer/maintenance"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Scheduled Services</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <Calendar size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {scheduledMaintenance.length}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-semibold">
              Upcoming maintenance jobs
            </div>
          </div>
        </Link>

        <Link
          href="/safety-officer/drivers"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Expired Licenses</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <AlertTriangle size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {expiredDrivers.length}
            </div>
            <div className="text-xs text-red-500 dark:text-red-400 mt-2 font-semibold">
              Immediate attention needed
            </div>
          </div>
        </Link>

        <Link
          href="/safety-officer/drivers"
          className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] p-6 flex flex-col justify-between hover:border-gray-400 dark:hover:border-white/20 transition-all shadow-xs"
        >
          <div className="flex items-center justify-between mb-4 text-gray-400 dark:text-gray-500">
            <span className="text-[11px] uppercase tracking-wider font-semibold">Expiring Within 30d</span>
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
              <ShieldAlert size={15} />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
              {expiringSoonDrivers.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Requires renewal audit
            </div>
          </div>
        </Link>
      </div>

      {/* Driver Compliance Alert Notice if any */}
      {(expiredDrivers.length > 0 || expiringSoonDrivers.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Driver Compliance Action Required
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {expiredDrivers.length} expired license(s) and {expiringSoonDrivers.length} expiring soon across the active driver fleet.
              </p>
            </div>
          </div>
          <Link
            href="/safety-officer/drivers"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#181818] border border-amber-500/30 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all shrink-0"
          >
            Review Driver Compliance →
          </Link>
        </div>
      )}

      {/* Main Content Grid: Recent Maintenance & High-Risk Drivers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Maintenance Activities */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Maintenance Logs
            </h2>
            <Link
              href="/safety-officer/maintenance"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors shrink-0 whitespace-nowrap"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.06] text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">
                  <th className="py-3.5 px-6">Vehicle</th>
                  <th className="py-3.5 px-6">Service Type</th>
                  <th className="py-3.5 px-6">Service Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06] text-xs">
                {maintenances.slice(0, 6).map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-gray-900 dark:text-white">
                      {m.vehicle?.registration_number || `Vehicle #${m.vehicle_id}`}
                    </td>
                    <td className="py-3.5 px-6 text-gray-700 dark:text-gray-300">
                      {m.service_type}
                    </td>
                    <td className="py-3.5 px-6 text-gray-500 dark:text-gray-400">
                      {m.service_date}
                    </td>
                    <td className="py-3.5 px-6">
                      {getStatusBadge(m.status)}
                    </td>
                    <td className="py-3.5 px-6 text-right font-medium text-gray-900 dark:text-white">
                      ${Number(m.cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {maintenances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                      No maintenance records recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Compliance Watchlist */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Driver Compliance Watchlist
            </h2>
            <Link
              href="/safety-officer/drivers"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors shrink-0 whitespace-nowrap"
            >
              All Drivers →
            </Link>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {drivers.slice(0, 5).map((d) => {
              const expiry = new Date(d.license_expiry_date);
              const isExpired = expiry < now;
              const isExpiringSoon = expiry >= now && expiry <= thirtyDaysFromNow;

              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-[#161616]"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {d.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      Lic: #{d.license_number} • Exp: {d.license_expiry_date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isExpired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        Expired
                      </span>
                    ) : isExpiringSoon ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        Expiring Soon
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Valid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            {drivers.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400 dark:text-gray-500">
                No drivers registered yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
