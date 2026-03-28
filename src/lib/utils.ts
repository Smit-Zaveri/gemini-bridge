import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString();
}

export function getCriticalityColor(level: string) {
  switch (level.toLowerCase()) {
    case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
    case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
    case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20 animate-pulse';
    default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  }
}
