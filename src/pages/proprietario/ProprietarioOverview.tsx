import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  CalendarDays,
  Euro,
  Wallet,
  TrendingUp,
  Users,
  Star,
  CalendarRange,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { format, parseISO, startOfMonth, subMonths, isAfter } from "date-fns";
import { it } from "date-fns/locale";
import { useOwnerApartments, useOwnerBookings, useOwnerGuestCounts } from "@/hooks/useOwnerData";
import { Loader2 } from "lucide-react";

// Bookings considered "earned/active"
const ACTIVE_STATUSES = ["confirmed", "paid", "awaiting_verification", "completed"];

// Platform fee estimate to derive a "margine" indicator (commission retained by BAZHOUSE)
const PLATFORM_FEE_RATE = 0.15;

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const CHART_COLORS = ["hsl(var(--primary))", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const ProprietarioOverview = () => {
  const { data: apartments = [], isLoading: aptLoading } = useOwnerApartments();
  const { data: bookings = [], isLoading: bkLoading } = useOwnerBookings();
  const bookingIds = useMemo(() => bookings.map((b) => b.id), [bookings]);
  const { data: guestCounts } = useOwnerGuestCounts(bookingIds);

  const loading = aptLoading || bkLoading;

  const aptNameById = useMemo(() => {
    const m = new Map<string, string>();
    apartments.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [apartments]);

  // Filter active bookings (revenue-generating)
  const activeBookings = useMemo(
    () => bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)),
    [bookings],
  );

  // KPIs
  const kpis = useMemo(() => {
    const totalBookings = activeBookings.length;
    const totalRevenue = activeBookings.reduce((s, b) => s + Number(b.total_price ?? 0), 0);
    const totalReceived = activeBookings.reduce((s, b) => s + Number(b.amount_paid ?? 0), 0);
    const margin = totalRevenue * (1 - PLATFORM_FEE_RATE);

    // Monthly revenue this month
    const monthStart = startOfMonth(new Date());
    const monthlyRevenue = activeBookings
      .filter((b) => isAfter(parseISO(b.check_in), monthStart) || parseISO(b.check_in).getTime() === monthStart.getTime())
      .reduce((s, b) => s + Number(b.total_price ?? 0), 0);

    return { totalBookings, totalRevenue, totalReceived, margin, monthlyRevenue };
  }, [activeBookings]);

  // Monthly revenue last 12 months
  const monthlySeries = useMemo(() => {
    const map = new Map<string, { label: string; revenue: number; bookings: number }>();
    for (let i = 11; i >= 0; i--) {
      const d = subMonths(startOfMonth(new Date()), i);
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
  }, [activeBookings]);

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

  // Peak month
  const peakMonth = useMemo(() => {
    const arr = monthlySeries.slice().sort((a, b) => b.bookings - a.bookings);
    return arr[0] && arr[0].bookings > 0 ? arr[0].label : "—";
  }, [monthlySeries]);

  // Average guests
  const avgGuests = useMemo(() => {
    if (!guestCounts || activeBookings.length === 0) return 0;
    const total = activeBookings.reduce((s, b) => s + (guestCounts.get(b.id) ?? 0), 0);
    return total / activeBookings.length;
  }, [guestCounts, activeBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Prenotazioni attive", value: kpis.totalBookings, icon: CalendarDays, color: "text-primary" },
    { label: "Entrate mese corrente", value: eur(kpis.monthlyRevenue), icon: Euro, color: "text-emerald-600" },
    { label: "Pagamenti ricevuti", value: eur(kpis.totalReceived), icon: Wallet, color: "text-sky-600" },
    { label: "Margine stimato", value: eur(kpis.margin), icon: TrendingUp, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Panoramica</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Stato economico e performance dei tuoi appartamenti.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                    <p className="font-serif text-2xl text-foreground mt-1.5">{s.value}</p>
                  </div>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif">Entrate mensili (ultimi 12 mesi)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={monthlySeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}€`} />
                <Tooltip
                  formatter={(value: number, name) => (name === "revenue" ? eur(value) : value)}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Entrate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bookings per month line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif">Andamento prenotazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={monthlySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="bookings"
                    name="Prenotazioni"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Apartment distribution pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-serif">Distribuzione per appartamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              {apartmentBreakdown.length === 0 ? (
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                  Nessun dato disponibile
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={apartmentBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {apartmentBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-serif">Performance generale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Più scelto</p>
                <p className="font-serif text-lg text-foreground mt-1">{topApartment?.name ?? "—"}</p>
                <p className="font-sans text-xs text-muted-foreground">
                  {topApartment ? `${topApartment.value} prenotazioni` : "nessuna prenotazione"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CalendarRange className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Periodo top</p>
                <p className="font-serif text-lg text-foreground mt-1 capitalize">{peakMonth}</p>
                <p className="font-sans text-xs text-muted-foreground">Mese con più prenotazioni</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Ospiti medi</p>
                <p className="font-serif text-lg text-foreground mt-1">
                  {avgGuests > 0 ? avgGuests.toFixed(1) : "—"}
                </p>
                <p className="font-sans text-xs text-muted-foreground">per prenotazione</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Metric label="Appartamenti" value={apartments.length} icon={Building2} />
            <Metric label="Totale prenotazioni" value={bookings.length} icon={CalendarDays} />
            <Metric label="Entrate totali" value={eur(kpis.totalRevenue)} icon={Euro} />
            <Metric
              label="Tasso pagamento"
              value={
                kpis.totalRevenue > 0
                  ? `${Math.round((kpis.totalReceived / kpis.totalRevenue) * 100)}%`
                  : "—"
              }
              icon={Wallet}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) => (
  <div className="flex items-center gap-2">
    <Icon className="w-4 h-4 text-muted-foreground" />
    <div>
      <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="font-serif text-sm text-foreground">{value}</p>
    </div>
  </div>
);

export default ProprietarioOverview;
