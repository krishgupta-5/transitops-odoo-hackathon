'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TripDialogs from "@/components/dispatcher/TripDialogs";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState<{ dispatch: boolean; complete: boolean; cancel: boolean }>({
    dispatch: false,
    complete: false,
    cancel: false,
  });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const data = await apiClient("/trips/");
      setTrips(data);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const matchesSearch = trip.trip_number.toLowerCase().includes(search.toLowerCase()) || 
                          trip.source.toLowerCase().includes(search.toLowerCase()) ||
                          trip.destination.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT": return <Badge className="bg-zinc-500 hover:bg-zinc-600 text-white shadow-sm border-none">Draft</Badge>;
      case "DISPATCHED": return <Badge className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-none">Dispatched</Badge>;
      case "COMPLETED": return <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-sm border-none">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-red-500 hover:bg-red-600 text-white shadow-sm border-none">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openAction = (trip: any, action: 'dispatch' | 'complete' | 'cancel') => {
    setSelectedTrip(trip);
    setDialogOpen({ dispatch: false, complete: false, cancel: false, [action]: true });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 tracking-tight">Trips</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage all dispatcher trips.</p>
        </div>
        <Link href="/dispatcher/trips/create" className={buttonVariants({ className: "bg-orange-600 hover:bg-orange-700 text-white" })}>
          Create Trip
        </Link>
      </div>

      <div className="flex gap-4 items-center bg-[#18181b] p-4 rounded-lg border border-zinc-800">
        <Input 
          placeholder="Search trips..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs bg-zinc-900 border-zinc-700 text-zinc-100"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="DISPATCHED">Dispatched</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-zinc-800 bg-[#18181b] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading trips...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">No trips found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-transparent border-b border-zinc-800">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Trip</TableHead>
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Route</TableHead>
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Vehicle & Driver</TableHead>
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Weight / Dist</TableHead>
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase">Status</TableHead>
                <TableHead className="text-xs text-zinc-500 font-medium tracking-wider h-10 uppercase text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id} className="border-b border-zinc-800 hover:bg-zinc-800/30 border-none">
                  <TableCell className="font-medium text-zinc-200 py-3">{trip.trip_number}</TableCell>
                  <TableCell className="text-zinc-400 py-3 text-sm">
                    {trip.source} &rarr; {trip.destination}
                  </TableCell>
                  <TableCell className="text-zinc-400 py-3 text-sm">
                    <div className="font-medium text-zinc-300">{trip.vehicle?.registration_number}</div>
                    <div className="text-xs">{trip.driver?.name}</div>
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm py-3">
                    {trip.cargo_weight}kg / {trip.planned_distance}km
                  </TableCell>
                  <TableCell className="py-3">
                    {getStatusBadge(trip.status)}
                  </TableCell>
                  <TableCell className="text-right py-3 space-x-2">
                    {trip.status === "DRAFT" && (
                      <Button variant="outline" size="sm" className="bg-transparent border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300" onClick={() => openAction(trip, 'dispatch')}>Dispatch</Button>
                    )}
                    {trip.status === "DISPATCHED" && (
                      <Button variant="outline" size="sm" className="bg-transparent border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300" onClick={() => openAction(trip, 'complete')}>Complete</Button>
                    )}
                    {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
                      <Button variant="outline" size="sm" className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" onClick={() => openAction(trip, 'cancel')}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <TripDialogs 
        trip={selectedTrip} 
        open={dialogOpen} 
        onClose={() => setDialogOpen({ dispatch: false, complete: false, cancel: false })} 
        onSuccess={fetchTrips} 
      />
    </div>
  );
}
