// Shared constants and helpers for the owner overview dashboard.
import { startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear, parseISO } from "date-fns";

// Bookings considered "earned/active"
export const ACTIVE_STATUSES = ["confirmed", "paid", "awaiting_verification", "completed"];


export const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const CHART_COLORS = ["hsl(var(--primary))", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export type PeriodPreset = "current_month" | "last_3" | "last_6" | "last_12" | "ytd" | "all" | "custom";

export const computeRange = (preset: PeriodPreset, from: string, to: string): { from: Date; to: Date } => {
  const now = new Date();
  switch (preset) {
    case "current_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_3":
      return { from: startOfMonth(subMonths(now, 2)), to: endOfMonth(now) };
    case "last_6":
      return { from: startOfMonth(subMonths(now, 5)), to: endOfMonth(now) };
    case "last_12":
      return { from: startOfMonth(subMonths(now, 11)), to: endOfMonth(now) };
    case "ytd":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "all":
      return { from: new Date(2000, 0, 1), to: new Date(2999, 11, 31) };
    case "custom":
      return {
        from: from ? parseISO(from) : startOfMonth(subMonths(now, 11)),
        to: to ? parseISO(to) : endOfMonth(now),
      };
  }
};

export const loadImageDataUrl = async (url: string): Promise<string | null> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};
