'use client';

import { useEffect, useState } from "react";
import { getFuelLogs, createFuelLog, deleteFuelLog, FuelLog, getTrips } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

  useEffect(() => {
    if (isDialogOpen) {
      getTrips('COMPLETED').then(setTrips).catch(console.error);
    }
  }, [isDialogOpen]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getFuelLogs();
      setLogs(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createFuelLog({
        vehicle_id: parseInt(formData.vehicle_id),
        trip_id: parseInt(formData.trip_id),
        liters: parseFloat(formData.liters),
        cost: parseFloat(formData.cost),
        fuel_date: formData.fuel_date
      });
      setIsDialogOpen(false);
      loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to add fuel log');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this fuel log?')) return;
    try {
      await deleteFuelLog(id);
      loadLogs();
    } catch (err: any) {
      alert(err.message || 'Failed to delete fuel log');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Fuel Logs</h2>
          <p className="text-zinc-400">Track and manage fuel consumption across the fleet.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors">
            Add Fuel Log
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Add Fuel Log</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Record a new fuel purchase for a completed trip.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none">Completed Trip</label>
                  <Select onValueChange={(val: any) => {
                    if (!val) return;
                    const trip = trips.find(t => t.id.toString() === val);
                    if (trip) {
                      setFormData({...formData, trip_id: val, vehicle_id: trip.vehicle_id.toString()});
                    }
                  }}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                      <SelectValue placeholder="Select Trip" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      {trips.length === 0 ? (
                        <SelectItem value="none" disabled>No completed trips available</SelectItem>
                      ) : (
                        trips.map(t => (
                          <SelectItem key={t.id} value={t.id.toString()}>
                            {t.trip_number} - {t.vehicle?.registration_number} (Fuel: {t.fuel_consumed}L)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="liters" className="text-sm font-medium leading-none">Liters</label>
                  <Input 
                    id="liters" 
                    type="number"
                    step="0.01"
                    required
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.liters}
                    onChange={(e) => setFormData({...formData, liters: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cost" className="text-sm font-medium leading-none">Total Cost (INR)</label>
                  <Input 
                    id="cost" 
                    type="number"
                    step="0.01"
                    required
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="fuel_date" className="text-sm font-medium leading-none">Date</label>
                <Input 
                  id="fuel_date" 
                  type="date"
                  required
                  className="bg-zinc-950 border-zinc-800 text-zinc-100"
                  value={formData.fuel_date}
                  onChange={(e) => setFormData({...formData, fuel_date: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-400 bg-red-400/10 p-4 rounded-md border border-red-400/20">{error}</div>}

      <div className="bg-[#111111] rounded-lg border border-zinc-800 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-zinc-400">Vehicle</TableHead>
              <TableHead className="text-zinc-400">Trip Ref</TableHead>
              <TableHead className="text-zinc-400 text-right">Liters</TableHead>
              <TableHead className="text-zinc-400 text-right">Cost</TableHead>
              <TableHead className="text-zinc-400 text-right">Unit Price</TableHead>
              <TableHead className="text-zinc-400 text-right w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">Loading...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">No fuel logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="text-zinc-300">{new Date(log.fuel_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-100">{log.vehicle?.registration_number}</div>
                    <div className="text-xs text-zinc-500">{log.vehicle?.name}</div>
                  </TableCell>
                  <TableCell className="text-zinc-400">#{log.trip_id}</TableCell>
                  <TableCell className="text-right text-zinc-300">{log.liters} L</TableCell>
                  <TableCell className="text-right text-zinc-300 font-medium">{formatINR(log.cost)}</TableCell>
                  <TableCell className="text-right text-zinc-400 text-xs">{formatINR(log.cost / log.liters)}/L</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)} className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-400/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
