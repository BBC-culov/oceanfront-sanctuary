// Data + metrics for the owner overview dashboard (no UI).
import { useMemo, useState } from "react";
import {
  format, parseISO, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear,
  differenceInCalendarMonths, isWithinInterval,
} from "date-fns";
import { it } from "date-fns/locale";
import { useOwnerApartments, useOwnerBookings, useOwnerGuestCounts } from "@/hooks/useOwnerData";
import { PLATFORM_FEE_RATE } from "@/lib/ownerFees";
import { ACTIVE_STATUSES, computeRange, type PeriodPreset } from "@/lib/ownerOverview";

export function useOwnerOverviewMetrics() {
  const { data: apartments = [], isLoading: aptLoading } = useOwnerApartments();
  const { data: bookings = [], isLoading: bkLoading } = useOwnerBookings();
  const bookingIds = useMemo(() => bookings.map((b) => b.id), [bookings]);
  const { data: guestCounts } = useOwnerGuestCounts(bookingIds);

  const [period, setPeriod] = useState<PeriodPreset>("last_12");
  const [customFrom, setCustomFrom] = useState<string>("");
  const [customTo, setCustomTo] = useState<string>("");
  const [exporting, setExporting] = useState(false);



  const loading = aptLoading || bkLoading;

  const aptNameById = useMemo(() => {
    const m = new Map<string, string>();
    apartments.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [apartments]);

  // Date range from period filter
  const range = useMemo(
    () => computeRange(period, customFrom, customTo),
    [period, customFrom, customTo],
  );

  // Filter active bookings (revenue-generating) within selected range
  const activeBookings = useMemo(
    () =>
      bookings.filter((b) => {
        if (!ACTIVE_STATUSES.includes(b.status)) return false;
        const d = parseISO(b.check_in);
        return isWithinInterval(d, { start: range.from, end: range.to });
      }),
    [bookings, range],
  );

  // KPIs
  const kpis = useMemo(() => {
    const totalBookings = activeBookings.length;
    const totalRevenue = activeBookings.reduce((s, b) => s + Number(b.total_price ?? 0), 0);
    const totalReceived = activeBookings.reduce((s, b) => s + Number(b.amount_paid ?? 0), 0);
    const margin = totalRevenue * (1 - PLATFORM_FEE_RATE);

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());
    const monthlyRevenue = activeBookings
      .filter((b) => isWithinInterval(parseISO(b.check_in), { start: monthStart, end: monthEnd }))
      .reduce((s, b) => s + Number(b.total_price ?? 0), 0);

    return { totalBookings, totalRevenue, totalReceived, margin, monthlyRevenue };
  }, [activeBookings]);

  // Monthly buckets within selected range (capped at 24 for chart sanity)
  const monthlySeries = useMemo(() => {
    const map = new Map<string, { label: string; revenue: number; bookings: number }>();
    const months = Math.max(
      1,
      Math.min(24, differenceInCalendarMonths(range.to, range.from) + 1),
    );
    const end = startOfMonth(range.to);
    for (let i = months - 1; i >= 0; i--) {
      const d = subMonths(end, i);
      const key = format(d, "yyyy-MM");
      map.set(key, { label: format(d, "MMM yy", { locale: it }), revenue: 0, bookings: 0 });
    }
    activeBookings.forEach((b) => {
      const key = format(parseISO(b.check_in), "yyyy-MM");
      const item = map.get(key);
      if (item) {
        item.revenue += Number(b.total_price ?? 0);
        item.bookings += 1;
      }
    });
    return Array.from(map.values());
  }, [activeBookings, range]);

  // Apartment distribution
  const apartmentBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    activeBookings.forEach((b) => {
      counts.set(b.apartment_id, (counts.get(b.apartment_id) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([id, value]) => ({
      name: aptNameById.get(id) ?? "—",
      value,
    }));
  }, [activeBookings, aptNameById]);

  const topApartment = apartmentBreakdown.slice().sort((a, b) => b.value - a.value)[0];

  const peakMonth = useMemo(() => {
    const arr = monthlySeries.slice().sort((a, b) => b.bookings - a.bookings);
    return arr[0] && arr[0].bookings > 0 ? arr[0].label : "—";
  }, [monthlySeries]);

  const avgGuests = useMemo(() => {
    if (!guestCounts || activeBookings.length === 0) return 0;
    const total = activeBookings.reduce((s, b) => s + (guestCounts.get(b.id) ?? 0), 0);
    return total / activeBookings.length;
  }, [guestCounts, activeBookings]);

  const periodLabel = useMemo(
    () =>
      `${format(range.from, "dd MMM yyyy", { locale: it })} – ${format(range.to, "dd MMM yyyy", { locale: it })}`,
    [range],
  );

  return {
    apartments, bookings, loading, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo,
    exporting, setExporting, aptNameById, range, activeBookings, kpis, monthlySeries,
    apartmentBreakdown, topApartment, peakMonth, avgGuests, periodLabel,
  };
}

export type OwnerOverviewMetrics = ReturnType<typeof useOwnerOverviewMetrics>;
