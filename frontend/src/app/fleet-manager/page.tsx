'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Vehicle = {
  id: number;
  status: string;
};

type Driver = {
  id: number;
  status: string;
  license_expiry_date: string;
};

export default function FleetManagerDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [vData, dData] = await Promise.all([
          apiClient('/vehicles/'),
          apiClient('/drivers/')
        ]);
        setVehicles(vData);
        setDrivers(dData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-zinc-400">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

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
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Fleet Dashboard</h1>
          <p className="text-sm text-zinc-400 mt-1">Overview of your vehicles and drivers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-100">{totalVehicles}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {availableVehicles} Available • {onTripVehicles} On Trip
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Vehicles In Shop</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-100">{inShopVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-100">{totalDrivers}</div>
            <div className="text-xs text-zinc-500 mt-1">
              {availableDrivers} Available • {onTripDrivers} On Trip
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">License Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold text-zinc-100">{expiredDrivers.length + expiringSoonDrivers.length}</div>
            <div className="text-xs text-zinc-500 mt-1">
              <span className={expiredDrivers.length > 0 ? "text-red-400" : ""}>{expiredDrivers.length} Expired</span>
              {" • "}
              <span className={expiringSoonDrivers.length > 0 ? "text-amber-400" : ""}>{expiringSoonDrivers.length} Expiring Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-200">Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">AVAILABLE</Badge>
              <span className="text-zinc-300 font-medium">{availableVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">ON TRIP</Badge>
              <span className="text-zinc-300 font-medium">{onTripVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">IN SHOP</Badge>
              <span className="text-zinc-300 font-medium">{inShopVehicles}</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20">RETIRED</Badge>
              <span className="text-zinc-300 font-medium">{retiredVehicles}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-zinc-800">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-zinc-200">License Expirations</CardTitle>
          </CardHeader>
          <CardContent>
            {expiredDrivers.length === 0 && expiringSoonDrivers.length === 0 ? (
              <div className="text-sm text-zinc-500">All driver licenses are up to date.</div>
            ) : (
              <div className="space-y-4">
                {expiredDrivers.map(d => (
                  <div key={`exp-${d.id}`} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Driver #{d.id}</span>
                    <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">EXPIRED</Badge>
                  </div>
                ))}
                {expiringSoonDrivers.map(d => (
                  <div key={`soon-${d.id}`} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">Driver #{d.id}</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">EXPIRING SOON</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
