'use client';

import { useEffect, useState } from "react";
import { getExpenses, createExpense, deleteExpense, Expense, getVehicles, getTrips, apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(false);
  
  const [formData, setFormData] = useState({
    vehicle_id: '',
    trip_id: '',
    category: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (isDialogOpen) {
      getVehicles().then(setVehicles).catch(console.error);
      getTrips('status=COMPLETED').then(setTrips).catch(console.error); // Query string fix
    }
  }, [isDialogOpen]);

  const handleTripChange = (val: any) => {
    if (!val || val === "none") {
      setFormData(prev => ({ ...prev, trip_id: '' }));
      return;
    }
    const trip = trips.find(t => t.id.toString() === val);
    if (trip) {
      setFormData(prev => ({
        ...prev,
        trip_id: val,
        vehicle_id: trip.vehicle_id.toString()
      }));
    }
  };

  const handleVehicleChange = (val: any) => {
    if (!val) return;
    setFormData(prev => {
      const newFormData = { ...prev, vehicle_id: val };
      if (prev.trip_id) {
        const trip = trips.find(t => t.id.toString() === prev.trip_id);
        if (trip && trip.vehicle_id.toString() !== val) {
          newFormData.trip_id = '';
        }
      }
      return newFormData;
    });
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const skip = (page - 1) * limit;
      const data = await apiClient(`/expenses/?skip=${skip}&limit=${limit}`);
      setExpenses(data);
      setHasMore(data.length === limit);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense({
        vehicle_id: parseInt(formData.vehicle_id),
        trip_id: formData.trip_id ? parseInt(formData.trip_id) : undefined,
        category: formData.category,
        amount: parseFloat(formData.amount),
        expense_date: formData.expense_date,
        description: formData.description
      });
      setIsDialogOpen(false);
      setPage(1); // Reset to page 1
      loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to add expense');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(id);
      loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete expense');
    }
  };

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Operational Expenses</h1>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-sm shrink-0">
            + Record Operational Expense
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-3xl p-6 sm:p-7 shadow-2xl sm:max-w-xl overflow-visible">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-white">Record Operational Expense</DialogTitle>
              <DialogDescription className="text-xs text-gray-500 dark:text-gray-400">
                Record a new operational expense for a vehicle or specific trip.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <label htmlFor="expense_date" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Date *</label>
                <Input 
                  id="expense_date" 
                  type="date"
                  required
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                  value={formData.expense_date}
                  onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Vehicle *</label>
                  <Select required value={formData.vehicle_id} onValueChange={handleVehicleChange}>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5">
                      <SelectValue placeholder="Select Vehicle..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl shadow-xl max-h-60">
                      {vehicles.length === 0 ? (
                        <SelectItem value="none" disabled className="text-xs">Loading vehicles...</SelectItem>
                      ) : (
                        vehicles.map(v => (
                          <SelectItem key={v.id} value={v.id.toString()} className="text-xs font-semibold py-2">
                            {v.registration_number} — {v.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Trip (Optional)</label>
                  <Select value={formData.trip_id || "none"} onValueChange={handleTripChange}>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5">
                      <SelectValue placeholder="No Trip / Vehicle-level Expense" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl shadow-xl max-h-60">
                      <SelectItem value="none" className="text-xs font-semibold py-2">No Trip / Vehicle-level Expense</SelectItem>
                      {trips
                        .filter(t => !formData.vehicle_id || t.vehicle_id.toString() === formData.vehicle_id)
                        .map(t => (
                          <SelectItem key={t.id} value={t.id.toString()} className="text-xs font-semibold py-2">
                            {t.trip_number} — {t.route?.source} → {t.route?.destination}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="category" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Category *</label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value || ''})}>
                    <SelectTrigger className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5">
                      <SelectValue placeholder="Select Category..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#181818] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-2xl shadow-xl">
                      <SelectItem value="TOLL" className="text-xs font-semibold py-2">Toll</SelectItem>
                      <SelectItem value="REPAIR" className="text-xs font-semibold py-2">Repair</SelectItem>
                      <SelectItem value="INSURANCE" className="text-xs font-semibold py-2">Insurance</SelectItem>
                      <SelectItem value="PERMIT" className="text-xs font-semibold py-2">Permit</SelectItem>
                      <SelectItem value="PARKING" className="text-xs font-semibold py-2">Parking</SelectItem>
                      <SelectItem value="OTHER" className="text-xs font-semibold py-2">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="amount" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Amount (INR) *</label>
                  <Input 
                    id="amount" 
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 2450.00"
                    className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="description" className="block text-xs font-bold text-gray-700 dark:text-gray-300">Description</label>
                <Input
                  id="description" 
                  type="text"
                  className="w-full bg-gray-50 dark:bg-[#1A1A1A] border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl h-10 px-3.5"
                  placeholder="Enter toll plaza, permit, parking, or repair details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
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
                  disabled={!formData.category || !formData.vehicle_id}
                  className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Expense Record
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-red-600 dark:text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 text-xs font-semibold">{error}</div>}

      <div className="bg-white dark:bg-[#121212] rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-xs flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 dark:border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 pl-6">Date</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Vehicle</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400">Description</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right">Amount</TableHead>
                <TableHead className="text-xs font-bold text-gray-500 dark:text-gray-400 text-right w-12 pr-6"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-0">
                  <TableCell colSpan={6} className="py-0">
                    <LoadingState message="Loading expenses..." className="py-16 min-h-[220px]" />
                  </TableCell>
                </TableRow>
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">No expenses found.</TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-gray-100 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="text-xs font-semibold text-gray-700 dark:text-gray-300 pl-6">{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="font-bold text-sm text-gray-900 dark:text-white">{expense.vehicle?.registration_number}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{expense.vehicle?.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-semibold text-gray-700 dark:text-gray-300 border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04]">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500 dark:text-gray-400">{expense.description || '-'}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-gray-900 dark:text-white">{formatINR(expense.amount)}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)} className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Page {page}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={!hasMore}
            className="text-xs font-medium px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
