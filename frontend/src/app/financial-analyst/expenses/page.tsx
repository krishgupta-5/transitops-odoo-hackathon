'use client';

import { useEffect, useState } from "react";
import { getExpenses, createExpense, Expense } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  const [formData, setFormData] = useState({
    vehicle_id: '',
    trip_id: '',
    category: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

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
      loadExpenses();
    } catch (err: any) {
      alert(err.message || 'Failed to add expense');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Operational Expenses</h2>
          <p className="text-zinc-400">Track tolls, repairs, insurance, permits, and other vehicle costs.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 transition-colors">
            Add Expense
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
              <DialogDescription className="text-zinc-400">
                Record a new operational expense for a vehicle.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="vehicle_id" className="text-sm font-medium leading-none">Vehicle ID</label>
                  <Input 
                    id="vehicle_id" 
                    type="number"
                    required
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="trip_id" className="text-sm font-medium leading-none">Trip ID (Optional)</label>
                  <Input 
                    id="trip_id" 
                    type="number"
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.trip_id}
                    onChange={(e) => setFormData({...formData, trip_id: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium leading-none">Category</label>
                  <Select onValueChange={(value: any) => setFormData({...formData, category: value || ''})}>
                    <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-100">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                      <SelectItem value="TOLL">Toll</SelectItem>
                      <SelectItem value="REPAIR">Repair</SelectItem>
                      <SelectItem value="INSURANCE">Insurance</SelectItem>
                      <SelectItem value="PERMIT">Permit</SelectItem>
                      <SelectItem value="PARKING">Parking</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="amount" className="text-sm font-medium leading-none">Amount (INR)</label>
                  <Input 
                    id="amount" 
                    type="number"
                    step="0.01"
                    required
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="expense_date" className="text-sm font-medium leading-none">Date</label>
                  <Input 
                    id="expense_date" 
                    type="date"
                    required
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium leading-none">Description</label>
                  <Input 
                    id="description" 
                    className="bg-zinc-950 border-zinc-800 text-zinc-100"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-zinc-700 hover:bg-zinc-800 text-zinc-300">
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white" disabled={!formData.category}>
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
              <TableHead className="text-zinc-400">Category</TableHead>
              <TableHead className="text-zinc-400">Description</TableHead>
              <TableHead className="text-zinc-400 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">Loading...</TableCell>
              </TableRow>
            ) : expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-zinc-500">No expenses found.</TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id} className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="text-zinc-300">{new Date(expense.expense_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="font-medium text-zinc-100">{expense.vehicle?.registration_number}</div>
                    <div className="text-xs text-zinc-500">{expense.vehicle?.name}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-zinc-300 border-zinc-700 bg-zinc-800/50">
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-400">{expense.description || '-'}</TableCell>
                  <TableCell className="text-right text-zinc-300 font-medium">{formatINR(expense.amount)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
