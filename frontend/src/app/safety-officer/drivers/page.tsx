'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Award, Phone, Calendar, User, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Calculations baseline dates: 2026-07-12
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

export default function DriverSafetyPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [validityFilter, setValidityFilter] = useState("ALL");

  useEffect(() => {
    async function fetchDrivers() {
      setLoading(true);
      try {
        const data = await apiClient('/drivers/');
        setDrivers(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDrivers();
  }, []);

  const getLicenseClassification = (expiryDate: string) => {
    if (expiryDate < BASELINE_DATE_STR) return 'EXPIRED';
    if (expiryDate <= THRESHOLD_30_DAYS_STR) return 'EXPIRING_SOON';
    return 'VALID';
  };

  const getValidityBadge = (classification: string) => {
    switch (classification) {
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-bold">EXPIRED LICENSE</Badge>;
      case 'EXPIRING_SOON':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 font-bold">EXPIRING SOON</Badge>;
      default:
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold">VALID</Badge>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ON_TRIP': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'OFF_DUTY': return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'SUSPENDED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-zinc-800 text-zinc-300';
    }
  };

  const filteredDrivers = drivers.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || 
                        d.license_number.toLowerCase().includes(search.toLowerCase());
    
    const classification = getLicenseClassification(d.license_expiry_date);
    const matchValidity = validityFilter === 'ALL' || classification === validityFilter;

    return matchSearch && matchValidity;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Driver Safety Roster</h1>
        <p className="text-sm text-zinc-400 mt-1">Read-only view for checking CDL expirations, driver availability status, and safety score analytics.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex gap-4 items-center bg-[#18181b] p-4 rounded-lg border border-zinc-800">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <Input 
            placeholder="Search driver name or CDL..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
          />
        </div>
        
        <Select value={validityFilter} onValueChange={(v) => setValidityFilter(v || "ALL")}>
          <SelectTrigger className="w-44 bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="License Validity" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <SelectItem value="ALL">All Licenses</SelectItem>
            <SelectItem value="VALID">Valid Only</SelectItem>
            <SelectItem value="EXPIRING_SOON">Expiring Soon</SelectItem>
            <SelectItem value="EXPIRED">Expired Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-zinc-800 bg-[#18181b] overflow-hidden">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">DRIVER</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">LICENSE NUMBER</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">LICENSE CLASS</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">EXPIRY DATE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">VALIDITY</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">SAFETY SCORE</TableHead>
              <TableHead className="text-zinc-400 text-xs font-semibold tracking-wider uppercase">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">
                  <Activity size={18} className="animate-spin inline mr-2 text-zinc-400" />
                  Loading driver records...
                </TableCell>
              </TableRow>
            ) : filteredDrivers.length === 0 ? (
              <TableRow className="border-zinc-800">
                <TableCell colSpan={7} className="text-center py-8 text-zinc-500">No driver records found matching filters.</TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((d) => {
                const classification = getLicenseClassification(d.license_expiry_date);
                const isLowScore = d.safety_score !== null && d.safety_score < 60;
                return (
                  <TableRow key={d.id} className="border-zinc-800 hover:bg-zinc-800/30 transition-colors align-middle">
                    {/* Driver Profile */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-orange-400 shrink-0">
                          {d.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-200">{d.name}</div>
                          {d.contact_number && (
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5 flex items-center gap-1">
                              <Phone size={10} /> {d.contact_number}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* License Number */}
                    <TableCell className="font-mono text-zinc-300 font-semibold">{d.license_number}</TableCell>

                    {/* License Category */}
                    <TableCell className="text-zinc-300 font-semibold">{d.license_category}</TableCell>

                    {/* Expiry Date */}
                    <TableCell className="text-zinc-300 font-mono">{d.license_expiry_date}</TableCell>

                    {/* License Validity badge */}
                    <TableCell>
                      {getValidityBadge(classification)}
                    </TableCell>

                    {/* Safety Score progress */}
                    <TableCell>
                      <div className="space-y-1.5 w-24">
                        <div className="flex justify-between text-[11px]">
                          <span className={`font-bold ${
                            d.safety_score >= 90 ? 'text-emerald-400' :
                            d.safety_score >= 70 ? 'text-yellow-500' : 'text-rose-500'
                          }`}>
                            {d.safety_score !== null ? d.safety_score : '100.0'}
                          </span>
                          <span className="text-zinc-500 font-mono">%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              d.safety_score >= 90 ? 'bg-emerald-400' :
                              d.safety_score >= 70 ? 'bg-yellow-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${d.safety_score !== null ? d.safety_score : 100}%` }}
                          />
                        </div>
                        {isLowScore && (
                          <div className="text-[9px] font-bold text-rose-500">Low Score warning</div>
                        )}
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <Badge variant="outline" className={`capitalize ${getStatusColor(d.status)}`}>
                        {d.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
