'use client';

import { useEffect, useState } from "react";
import { getFuelLogs, createFuelLog, deleteFuelLog, FuelLog, getTrips } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { LoadingState } from "@/components/ui/LoadingState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formatINR = (value: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

export default function FuelLogsPage() {
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trips, setTrips] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    trip_id: '',
    liters: '',
    cost: '',
    fuel_date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, tripsData] = await Promise.all([
        getFuelLogs(),
        getTrips('status=COMPLETED')
      ]);
      setLogs(logsData);
      setTrips(tripsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createFuelLog({
        vehicle_id: parseInt(formData.vehicle_id),
        trip_id: formData.trip_id ? parseInt(formData.trip_id) : undefined,
        liters: parseFloat(formData.liters),
        cost: parseFloat(formData.cost),
        fuel_date: formData.fuel_date
      });
      setIsDialogOpen(false);
      setFormData({
        vehicle_id: '',
        trip_id: '',
        liters: '',
        cost: '',
        fuel_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create fuel log');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this fuel log?")) return;
    try {
      await deleteFuelLog(id);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete fuel log');
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Fuel Logs</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0">
            + Record Fuel Purchase
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-3xl p-6 sm:p-7 shadow-2xl sm:max-w-lg overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Record Fuel Purchase</DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                Record a new fuel purchase for a completed trip.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <label htmlFor="fuel_date" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Purchase Date</label>
                <Input 
                  id="fuel_date" 
                  type="date"
                  required
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                  value={formData.fuel_date}
                  onChange={(e) => setFormData({...formData, fuel_date: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Completed Trip</label>
                <Select onValueChange={(val: any) => {
                  if (!val) return;
                  const trip = trips.find(t => t.id.toString() === val);
                  if (trip) {
                    setFormData({...formData, trip_id: val, vehicle_id: trip.vehicle_id.toString()});
                  }
                }}>
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-11 px-3.5">
                    <SelectValue placeholder="Select Completed Trip..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl shadow-xl max-h-60">
                    {trips.length === 0 ? (
                      <SelectItem value="none" disabled className="text-xs">No completed trips available</SelectItem>
                    ) : (
                      trips.map(t => (
                        <SelectItem key={t.id} value={t.id.toString()} className="text-xs font-semibold py-2">
                          {t.trip_number} — {t.vehicle?.registration_number} (Fuel: {t.fuel_consumed}L)
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="liters" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Liters</label>
                  <Input 
                    id="liters" 
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 120.5"
                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                    value={formData.liters}
                    onChange={(e) => setFormData({...formData, liters: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="cost" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Total Cost (INR)</label>
                  <Input 
                    id="cost" 
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 11450"
                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  Save Fuel Record
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 dark:text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs font-semibold">{error}</div>}

      <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Date</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Liters</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Cost</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Unit Price</TableHead>
              <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right w-12 pr-6"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-0">
                <TableCell colSpan={6} className="py-0">
                  <LoadingState message="Loading fuel logs..." className="py-16 min-h-[220px]" />
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">No fuel records found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const unitPrice = log.liters > 0 ? log.cost / log.liters : 0;
                return (
                  <TableRow key={log.id} className="border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 pl-6">{new Date(log.fuel_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{log.vehicle?.registration_number}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{log.vehicle?.name}</div>
                    </TableCell>
                    <TableCell className="text-xs font-bold text-gray-900 dark:text-white">{log.liters} L</TableCell>
                    <TableCell className="text-xs font-bold text-gray-900 dark:text-white">{formatINR(log.cost)}</TableCell>
                    <TableCell className="text-xs font-semibold text-gray-500 dark:text-gray-400">₹{unitPrice.toFixed(2)} / L</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
