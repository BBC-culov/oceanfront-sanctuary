import { useMemo, useState } from "react";
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
  Download,
  Loader2,
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
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  differenceInCalendarMonths,
  isWithinInterval,
} from "date-fns";
import { it } from "date-fns/locale";
import { useOwnerApartments, useOwnerBookings, useOwnerGuestCounts } from "@/hooks/useOwnerData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "@/assets/logo-bazhouse.png";

// Bookings considered "earned/active"
const ACTIVE_STATUSES = ["confirmed", "paid", "awaiting_verification", "completed"];

// Platform fee estimate to derive a "margine" indicator (commission retained by BAZHOUSE)
const PLATFORM_FEE_RATE = 0.15;

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const CHART_COLORS = ["hsl(var(--primary))", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

type PeriodPreset = "current_month" | "last_3" | "last_6" | "last_12" | "ytd" | "all" | "custom";

const computeRange = (preset: PeriodPreset, from: string, to: string): { from: Date; to: Date } => {
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

const loadImageDataUrl = async (url: string): Promise<string | null> => {
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

const ProprietarioOverview = () => {
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

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 40;

      const logo = await loadImageDataUrl(logoUrl);
      if (logo) {
        try { doc.addImage(logo, "PNG", margin, 32, 110, 36, undefined, "FAST"); } catch {}
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 20, 20);
      doc.text("Report Performance", pageWidth - margin, 50, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(`Periodo: ${periodLabel}`, pageWidth - margin, 66, { align: "right" });
      doc.text(
        `Generato: ${format(new Date(), "dd MMM yyyy HH:mm", { locale: it })}`,
        pageWidth - margin, 80, { align: "right" },
      );

      doc.setDrawColor(220, 220, 220);
      doc.line(margin, 96, pageWidth - margin, 96);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text("Riepilogo economico", margin, 122);

      autoTable(doc, {
        startY: 132,
        head: [["Indicatore", "Valore"]],
        body: [
          ["Prenotazioni nel periodo", String(kpis.totalBookings)],
          ["Entrate totali", eur(kpis.totalRevenue)],
          ["Pagamenti ricevuti", eur(kpis.totalReceived)],
          ["Margine stimato (netto piattaforma)", eur(kpis.margin)],
          ["Tasso pagamento", kpis.totalRevenue > 0 ? `${Math.round((kpis.totalReceived / kpis.totalRevenue) * 100)}%` : "—"],
        ],
        theme: "grid",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      let y = (doc as any).lastAutoTable.finalY + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Performance generale", margin, y);

      autoTable(doc, {
        startY: y + 10,
        head: [["Metrica", "Dettaglio"]],
        body: [
          ["Appartamento più scelto", topApartment ? `${topApartment.name} (${topApartment.value} pren.)` : "—"],
          ["Periodo top", peakMonth],
          ["Ospiti medi per prenotazione", avgGuests > 0 ? avgGuests.toFixed(1) : "—"],
          ["Appartamenti gestiti", String(apartments.length)],
        ],
        theme: "grid",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 10 },
        margin: { left: margin, right: margin },
      });

      y = (doc as any).lastAutoTable.finalY + 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Andamento mensile", margin, y);

      autoTable(doc, {
        startY: y + 10,
        head: [["Mese", "Prenotazioni", "Entrate"]],
        body: monthlySeries.map((m) => [m.label, String(m.bookings), eur(m.revenue)]),
        theme: "striped",
        headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        margin: { left: margin, right: margin },
      });

      if (activeBookings.length > 0) {
        y = (doc as any).lastAutoTable.finalY + 24;
        if (y > 720) { doc.addPage(); y = 60; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Dettaglio prenotazioni", margin, y);

        autoTable(doc, {
          startY: y + 10,
          head: [["Codice", "Appartamento", "Check-in", "Check-out", "Stato", "Totale", "Pagato"]],
          body: activeBookings
            .slice()
            .sort((a, b) => a.check_in.localeCompare(b.check_in))
            .map((b) => [
              b.booking_code ?? "—",
              aptNameById.get(b.apartment_id) ?? "—",
              format(parseISO(b.check_in), "dd/MM/yyyy"),
              format(parseISO(b.check_out), "dd/MM/yyyy"),
              b.status,
              eur(Number(b.total_price ?? 0)),
              eur(Number(b.amount_paid ?? 0)),
            ]),
          theme: "striped",
          headStyles: { fillColor: [20, 20, 20], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          margin: { left: margin, right: margin },
        });
      }

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("BAZHOUSE — Report riservato al proprietario", margin, doc.internal.pageSize.getHeight() - 24);
        doc.text(`Pagina ${i} di ${pageCount}`, pageWidth - margin, doc.internal.pageSize.getHeight() - 24, { align: "right" });
      }

      doc.save(`bazhouse-report-${format(range.from, "yyyyMMdd")}-${format(range.to, "yyyyMMdd")}.pdf`);
      toast({ title: "Report scaricato", description: "Il PDF è stato generato." });
    } catch (e: any) {
      toast({ title: "Errore export", description: e?.message ?? "Impossibile generare il PDF.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Prenotazioni nel periodo", value: kpis.totalBookings, icon: CalendarDays, color: "text-primary" },
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
