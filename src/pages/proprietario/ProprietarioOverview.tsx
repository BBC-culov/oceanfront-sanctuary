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
import { useOwnerOverviewMetrics } from "@/hooks/useOwnerOverviewMetrics";
import { exportOwnerReportPdf } from "@/lib/ownerPdfExport";
import { eur, CHART_COLORS } from "@/lib/ownerOverview";
import type { PeriodPreset } from "@/lib/ownerOverview";

const ProprietarioOverview = () => {
  const metrics = useOwnerOverviewMetrics();
  const {
    apartments, loading, period, setPeriod, customFrom, setCustomFrom, customTo, setCustomTo,
    exporting, setExporting, kpis, monthlySeries, apartmentBreakdown, topApartment, peakMonth,
    avgGuests, periodLabel,
  } = metrics;

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await exportOwnerReportPdf(metrics);
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
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground">Panoramica</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Stato economico e performance dei tuoi appartamenti.
          </p>
          <p className="font-sans text-xs text-muted-foreground mt-1">
            Periodo selezionato: <span className="text-foreground font-medium">{periodLabel}</span>
          </p>
        </div>
        <Button onClick={handleExportPdf} disabled={exporting} className="gap-2 shrink-0">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          Scarica PDF
        </Button>
      </div>

      {/* Period filter */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex-1 min-w-0">
            <Label className="font-sans text-xs text-muted-foreground">Periodo</Label>
            <Select value={period} onValueChange={(v: PeriodPreset) => setPeriod(v)}>
              <SelectTrigger className="mt-1 font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Mese corrente</SelectItem>
                <SelectItem value="last_3">Ultimi 3 mesi</SelectItem>
                <SelectItem value="last_6">Ultimi 6 mesi</SelectItem>
                <SelectItem value="last_12">Ultimi 12 mesi</SelectItem>
                <SelectItem value="ytd">Anno in corso</SelectItem>
                <SelectItem value="all">Tutto lo storico</SelectItem>
                <SelectItem value="custom">Personalizzato</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {period === "custom" && (
            <>
              <div className="flex-1 min-w-0">
                <Label className="font-sans text-xs text-muted-foreground">Da</Label>
                <Input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="mt-1 font-sans"
                />
              </div>
              <div className="flex-1 min-w-0">
                <Label className="font-sans text-xs text-muted-foreground">A</Label>
                <Input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="mt-1 font-sans"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>


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
