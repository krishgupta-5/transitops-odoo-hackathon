'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wrench, Users, AlertTriangle, ShieldAlert, CheckCircle2, 
  Calendar, Award, Activity, ArrowRight, ShieldCheck, Hammer
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Baseline date for expiry checks: 2026-07-12
const BASELINE_DATE_STR = '2026-07-12';
const THRESHOLD_30_DAYS_STR = '2026-08-11';

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
  vehicle: Vehicle;
}

export default function SafetyOfficerDashboard() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [driversData, vehiclesData, maintData] = await Promise.all([
        apiClient('/drivers/'),
        apiClient('/vehicles/'),
        apiClient('/maintenance/')
      ]);
      setDrivers(driversData);
      setVehicles(vehiclesData);
      setMaintenances(maintData);
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Helper functions for license checks
  const getLicenseClassification = (expiryDate: string) => {
    if (expiryDate < BASELINE_DATE_STR) return 'EXPIRED';
    if (expiryDate <= THRESHOLD_30_DAYS_STR) return 'EXPIRING_SOON';
    return 'VALID';
  };

  // KPIs
  const vehiclesInShop = vehicles.filter(v => v.status === 'IN_SHOP').length;
  const scheduledCount = maintenances.filter(m => m.status === 'SCHEDULED').length;
  const inProgressCount = maintenances.filter(m => m.status === 'IN_PROGRESS').length;
  const completedCount = maintenances.filter(m => m.status === 'COMPLETED').length;

  const expiredLicenses = drivers.filter(d => getLicenseClassification(d.license_expiry_date) === 'EXPIRED').length;
  const expiringSoonLicenses = drivers.filter(d => getLicenseClassification(d.license_expiry_date) === 'EXPIRING_SOON').length;

  // Filters for tables
  const attentionRecords = maintenances.filter(m => 
    m.status === 'IN_PROGRESS' || 
    (m.status === 'SCHEDULED' && m.service_date <= BASELINE_DATE_STR)
  );

  const safetyAlertDrivers = drivers.filter(d => 
    getLicenseClassification(d.license_expiry_date) === 'EXPIRED' ||
    getLicenseClassification(d.license_expiry_date) === 'EXPIRING_SOON' ||
    (d.safety_score !== null && d.safety_score < 60)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-zinc-400">
        <Activity size={24} className="animate-spin mr-2" />
        <span>Loading safety operational intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Intro */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Operational Dashboard</h1>
        <p className="text-zinc-400 text-sm mt-1">Real-time status of fleet safety indicators and active workshop tasks.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Vehicles In Shop */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">In Shop</CardTitle>
            <Hammer size={18} className="text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{vehiclesInShop}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">ACTIVE VEHICLES</p>
          </CardContent>
        </Card>

        {/* Scheduled Maintenance */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Scheduled</CardTitle>
            <Calendar size={18} className="text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scheduledCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">DUE SOON</p>
          </CardContent>
        </Card>

        {/* In Progress */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">In Progress</CardTitle>
            <Wrench size={18} className="text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{inProgressCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">UNDER REPAIR</p>
          </CardContent>
        </Card>

        {/* Completed */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Completed</CardTitle>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCount}</div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">RELEASED COPIES</p>
          </CardContent>
        </Card>

        {/* Expired Driver Licenses */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Expired CDL</CardTitle>
            <AlertTriangle size={18} className="text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-400">{expiredLicenses}</div>
            <p className="text-[10px] text-rose-500 mt-1 font-mono">BLOCKED FROM TRIP</p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Expiring Soon</CardTitle>
            <Award size={18} className="text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">{expiringSoonLicenses}</div>
            <p className="text-[10px] text-yellow-500 mt-1 font-mono">RENEW IN 30 DAYS</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Alert Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Attention Card */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="border-b border-zinc-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench size={18} className="text-amber-500" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Maintenance Attention Required</CardTitle>
            </div>
            <Link href="/safety-officer/maintenance" className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-medium">
              View Log <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {attentionRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <span className="text-sm font-semibold text-zinc-300">All maintenance records are on track</span>
                <span className="text-xs">No overdue or active repairs requiring urgent action.</span>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Vehicle</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Service Type</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Date</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attentionRecords.map(m => (
                    <TableRow key={m.id} className="border-zinc-800 hover:bg-zinc-800/40">
                      <TableCell className="font-semibold text-zinc-200">
                        {m.vehicle?.registration_number}
                        <div className="text-[10px] text-zinc-500 font-normal">{m.vehicle?.name}</div>
                      </TableCell>
                      <TableCell className="text-zinc-300">{m.service_type}</TableCell>
                      <TableCell className="text-zinc-400 font-mono text-[11px]">{m.service_date}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={m.status === 'IN_PROGRESS' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }
                        >
                          {m.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'OVERDUE'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Driver Safety Alerts Card */}
        <Card className="bg-[#18181b] border-zinc-800 text-zinc-100">
          <CardHeader className="border-b border-zinc-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-rose-400" />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">Driver Safety Alerts</CardTitle>
            </div>
            <Link href="/safety-officer/drivers" className="text-xs text-orange-400 hover:underline flex items-center gap-1 font-medium">
              View Roster <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {safetyAlertDrivers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
                <ShieldCheck size={32} className="text-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-zinc-300">All driver licenses & records are fully cleared</span>
                <span className="text-xs">No active suspensions, expired credentials, or critical alerts.</span>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Driver Name</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Safety Score</TableHead>
                    <TableHead className="text-zinc-400 text-[10px] uppercase font-bold">Alert Indicator</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {safetyAlertDrivers.map(d => {
                    const classification = getLicenseClassification(d.license_expiry_date);
                    const isLowScore = d.safety_score !== null && d.safety_score < 60;
                    return (
                      <TableRow key={d.id} className="border-zinc-800 hover:bg-zinc-800/40">
                        <TableCell className="font-semibold text-zinc-200">
                          {d.name}
                          <div className="text-[10px] text-zinc-500 font-mono">LIC: {d.license_number}</div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold font-mono ${
                            d.safety_score >= 90 ? 'text-emerald-400' :
                            d.safety_score >= 70 ? 'text-yellow-500' : 'text-rose-500'
                          }`}>
                            {d.safety_score !== null ? d.safety_score : 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="space-y-1">
                          {classification === 'EXPIRED' && (
                            <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[9px]">
                              EXPIRED LICENSE
                            </Badge>
                          )}
                          {classification === 'EXPIRING_SOON' && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-[9px]">
                              EXPIRING SOON ({d.license_expiry_date})
                            </Badge>
                          )}
                          {isLowScore && (
                            <Badge variant="outline" className="bg-rose-600/10 text-rose-500 border-rose-600/20 text-[9px] block w-fit">
                              CRITICAL SAFETY SCORE
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
