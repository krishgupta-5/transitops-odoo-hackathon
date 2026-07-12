'use client';

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

export default function DispatcherDashboard() {
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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

  // Compute filtered trips based on vehicle type and trip status
  const filteredTrips = trips.filter(trip => {
    let matchType = true;
    if (filterType !== "all" && trip.vehicle) {
      matchType = trip.vehicle.vehicle_type.toLowerCase() === filterType.toLowerCase();
    }
    let matchStatus = true;
    if (filterStatus !== "all") {
      matchStatus = trip.status === filterStatus;
    }
    return matchType && matchStatus;
  });

  // Calculate KPIs
  const activeTripsCount = filteredTrips.filter(t => t.status === "DISPATCHED").length;
  const pendingTripsCount = filteredTrips.filter(t => t.status === "DRAFT").length;
  
  const activeVehiclesCount = vehicles.filter(v => v.status === "ON_TRIP").length;
  const availableVehiclesCount = vehicles.filter(v => v.status === "AVAILABLE").length;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === "IN_SHOP").length;
  
  const driversOnDutyCount = drivers.filter(d => d.status === "ON_TRIP").length;

  const operationalVehicles = vehicles.filter(v => v.status !== "RETIRED").length;
  const fleetUtilization = operationalVehicles > 0 
    ? Math.round((activeVehiclesCount / operationalVehicles) * 100) 
    : 0;

  const kpis = [
    { label: "ACTIVE VEHICLES", value: activeVehiclesCount.toString(), borderClass: "border-l-blue-500" },
    { label: "AVAILABLE VEHICLES", value: availableVehiclesCount.toString(), borderClass: "border-l-green-500" },
    { label: "VEHICLES IN MAINTENANCE", value: maintenanceVehiclesCount.toString(), borderClass: "border-l-orange-500" },
    { label: "ACTIVE TRIPS", value: activeTripsCount.toString(), borderClass: "border-l-blue-500" },
    { label: "PENDING TRIPS", value: pendingTripsCount.toString(), borderClass: "border-l-red-500" },
    { label: "DRIVERS ON DUTY", value: driversOnDutyCount.toString(), borderClass: "border-l-blue-500" },
    { label: "FLEET UTILIZATION", value: `${fleetUtilization}%`, borderClass: "border-l-green-500" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge className="bg-zinc-500 hover:bg-zinc-600 text-white shadow-sm border-none">Draft</Badge>;
      case "DISPATCHED": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-none">Dispatched</Badge>;
      case "COMPLETED": return <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-sm border-none">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-sm border-none">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEta = (trip: any) => {
    // If the backend doesn't provide ETA, do not calculate fake ETA.
    return "--"; 
  };

  const vehicleStatusCounts = {
    Available: vehicles.filter(v => v.status === "AVAILABLE").length,
    OnTrip: vehicles.filter(v => v.status === "ON_TRIP").length,
    InShop: vehicles.filter(v => v.status === "IN_SHOP").length,
    Retired: vehicles.filter(v => v.status === "RETIRED").length,
  };

  const totalVehicles = vehicles.length || 1; // Prevent div by zero

  const vehicleStatusData = [
    { label: "Available", percentage: (vehicleStatusCounts.Available / totalVehicles) * 100, color: "bg-green-500" },
    { label: "On Trip", percentage: (vehicleStatusCounts.OnTrip / totalVehicles) * 100, color: "bg-blue-500" },
    { label: "In Shop", percentage: (vehicleStatusCounts.InShop / totalVehicles) * 100, color: "bg-orange-500" },
    { label: "Retired", percentage: (vehicleStatusCounts.Retired / totalVehicles) * 100, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {error && (
        <div className="flex gap-2 items-start text-red-400 text-sm bg-red-500/10 p-3 rounded-md border border-red-500/20">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-zinc-500 tracking-wider">FILTERS</label>
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={(v) => setFilterType(v || "all")}>
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-700 text-zinc-300 h-9">
              <SelectValue placeholder="Vehicle Type: All" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectItem value="all">Vehicle Type: All</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="van">Van</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v || "all")}>
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-700 text-zinc-300 h-9">
              <SelectValue placeholder="Status: All" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-300">
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="DISPATCHED">Dispatched</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select disabled defaultValue="all">
            <SelectTrigger className="w-[180px] bg-transparent border-zinc-800 text-zinc-500 h-9 opacity-50 cursor-not-allowed">
              <SelectValue placeholder="Region: N/A" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Region: N/A</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-zinc-600 self-center">* Region filtering is not supported by the backend yet.</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="flex flex-wrap gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className={`bg-[#18181b] border-y border-r border-l-4 border-y-zinc-800 border-r-zinc-800 ${kpi.borderClass} rounded-md shadow-none flex-1 min-w-[140px]`}>
            <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">{kpi.label}</span>
              <span className="text-3xl font-light text-zinc-100">
                {loading ? "-" : kpi.value}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid: Recent Trips & Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
        
        {/* Recent Trips */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 tracking-wider">RECENT TRIPS</h2>
          <div className="rounded-md border border-zinc-800 bg-[#18181b] overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-zinc-500">Loading trips...</div>
            ) : filteredTrips.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">No recent trips found.</div>
            ) : (
              <Table>
                <TableHeader className="bg-transparent border-b border-zinc-800">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Trip</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Vehicle</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Driver</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Status</TableHead>
                    <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">ETA</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.slice(0, 5).map((trip) => (
                    <TableRow key={trip.id} className="border-b border-zinc-800 hover:bg-zinc-800/20 border-none">
                      <TableCell className="font-medium text-zinc-300 py-3">{trip.trip_number}</TableCell>
                      <TableCell className="text-zinc-400 py-3">{trip.vehicle?.registration_number || "--"}</TableCell>
                      <TableCell className="text-zinc-400 py-3">{trip.driver?.name || "--"}</TableCell>
                      <TableCell className="py-3">
                        {getStatusBadge(trip.status)}
                      </TableCell>
                      <TableCell className="text-zinc-400 text-sm py-3">{getEta(trip)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Vehicle Status */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 tracking-wider">VEHICLE STATUS</h2>
          <div className="space-y-6 mt-6">
            {vehicleStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-sm text-zinc-400 w-20">{item.label}</span>
                <div className="flex-1 h-3 bg-zinc-800 rounded-sm overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-sm transition-all duration-500`} 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
