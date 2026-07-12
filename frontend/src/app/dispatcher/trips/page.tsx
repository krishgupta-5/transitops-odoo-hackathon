'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { LoadingState } from "@/components/ui/LoadingState";

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
      case "DRAFT": return <Badge className="bg-gray-500 hover:bg-gray-600 text-white shadow-xs border-none">Draft</Badge>;
      case "DISPATCHED": return <Badge className="bg-blue-600 hover:bg-blue-700 text-white shadow-xs border-none">Dispatched</Badge>;
      case "COMPLETED": return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs border-none">Completed</Badge>;
      case "CANCELLED": return <Badge className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs border-none">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const openAction = (trip: any, action: 'dispatch' | 'complete' | 'cancel') => {
    setSelectedTrip(trip);
    setDialogOpen({ dispatch: false, complete: false, cancel: false, [action]: true });
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Trips</h1>
        </div>
        <Link 
          href="/dispatcher/trips/create" 
          className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0"
        >
          + Create New Trip
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Input 
          placeholder="Search trips by number, origin, destination..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-[180px] bg-white dark:bg-[#121212] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl h-10 text-xs font-semibold">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl">
            <SelectItem value="all" className="text-xs font-semibold">All Statuses</SelectItem>
            <SelectItem value="DRAFT" className="text-xs font-semibold">Draft</SelectItem>
            <SelectItem value="DISPATCHED" className="text-xs font-semibold">Dispatched</SelectItem>
            <SelectItem value="COMPLETED" className="text-xs font-semibold">Completed</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs font-semibold">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#121212] shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading trips..." className="py-20" />
        ) : error ? (
          <div className="p-10 text-center text-xs font-bold text-red-600 dark:text-red-400">{error}</div>
        ) : filteredTrips.length === 0 ? (
          <div className="p-16 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">No trips found.</div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50 dark:bg-white/[0.02]">
              <TableRow className="border-b border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Trip</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Route</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle & Driver</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Weight / Dist</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Status</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.map((trip) => (
                <TableRow key={trip.id} className="border-b border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="font-bold text-xs text-gray-900 dark:text-white pl-6">{trip.trip_number}</TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {trip.source} &rarr; {trip.destination}
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    <div className="font-bold text-gray-900 dark:text-white">{trip.vehicle?.registration_number}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">{trip.driver?.name}</div>
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {trip.cargo_weight}kg / {trip.planned_distance}km
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(trip.status)}
                  </TableCell>
                  <TableCell className="text-right pr-6 space-x-2">
                    {trip.status === "DRAFT" && (
                      <Button variant="outline" size="sm" className="bg-white dark:bg-[#1A1A1A] border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-xs font-bold rounded-xl" onClick={() => openAction(trip, 'dispatch')}>Dispatch</Button>
                    )}
                    {trip.status === "DISPATCHED" && (
                      <Button variant="outline" size="sm" className="bg-white dark:bg-[#1A1A1A] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-xs font-bold rounded-xl" onClick={() => openAction(trip, 'complete')}>Complete</Button>
                    )}
                    {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
                      <Button variant="outline" size="sm" className="bg-white dark:bg-[#1A1A1A] border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-xs font-bold rounded-xl" onClick={() => openAction(trip, 'cancel')}>Cancel</Button>
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
