import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return "₹0.00";
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDistance(distance: number | null | undefined): string {
  if (distance === null || distance === undefined || isNaN(Number(distance))) return "0 km";
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(distance)) + " km";
}

export function formatFuel(liters: number | null | undefined): string {
  if (liters === null || liters === undefined || isNaN(Number(liters))) return "0 L";
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(Number(liters)) + " L";
}

export function formatWeight(weight: number | null | undefined): string {
  if (weight === null || weight === undefined || isNaN(Number(weight))) return "0 kg";
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Number(weight)) + " kg";
}

export function formatPercentage(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined || isNaN(Number(percentage))) return "0%";
  const num = Number(percentage);
  // Show decimals only if it's not a whole number
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: num % 1 === 0 ? 0 : 1,
  }).format(num) + "%";
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (e) {
    return "Invalid Date";
  }
}

export function formatCostPerKm(cost: number | null | undefined): string {
  if (cost === null || cost === undefined || isNaN(Number(cost))) return "₹0.00/km";
  return formatCurrency(cost) + "/km";
}

export function formatCostPerLiter(cost: number | null | undefined): string {
  if (cost === null || cost === undefined || isNaN(Number(cost))) return "₹0.00/L";
  return formatCurrency(cost) + "/L";
}

export function formatFuelEfficiency(efficiency: number | null | undefined): string {
  if (efficiency === null || efficiency === undefined || isNaN(Number(efficiency))) return "0.0 km/L";
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number(efficiency)) + " km/L";
}
