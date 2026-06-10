import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CalendarDays, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useOwnerApartments, useOwnerBookings } from "@/hooks/useOwnerData";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";

const STATUS_LABEL: Record<string, string> = {
  pending: "In attesa",
  incomplete: "Incompleta",
  awaiting_verification: "Da verificare",
  confirmed: "Confermata",
  paid: "Pagata",
  completed: "Completata",
  cancelled: "Cancellata",
  refunded: "Rimborsata",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  incomplete: "bg-muted text-muted-foreground",
  awaiting_verification: "bg-sky-100 text-sky-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  completed: "bg-primary/15 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
  refunded: "bg-destructive/10 text-destructive",
};

const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

const ProprietarioPrenotazioni = () => {
  const { data: apartments = [] } = useOwnerApartments();
  const { data: bookings = [], isLoading } = useOwnerBookings();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [aptFilter, setAptFilter] = useState<string>("all");

  const aptNameById = useMemo(() => {
    const m = new Map<string, string>();
    apartments.forEach((a) => m.set(a.id, a.name));
    return m;
  }, [apartments]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (aptFilter !== "all" && b.apartment_id !== aptFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const name = `${b.guest_name ?? ""} ${b.guest_last_name ?? ""}`.toLowerCase();
        const apt = (aptNameById.get(b.apartment_id) ?? "").toLowerCase();
        if (
          !name.includes(q) &&
          !(b.booking_code ?? "").toLowerCase().includes(q) &&
          !(b.guest_email ?? "").toLowerCase().includes(q) &&
          !apt.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [bookings, statusFilter, aptFilter, query, aptNameById]);

  const statuses = Array.from(new Set(bookings.map((b) => b.status)));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl text-foreground">Prenotazioni</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          Stato di tutte le prenotazioni sui tuoi appartamenti.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca codice, ospite, email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background font-sans text-sm"
        >
          <option value="all">Tutti gli stati</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s] ?? s}
            </option>
          ))}
        </select>
        <select
          value={aptFilter}
          onChange={(e) => setAptFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background font-sans text-sm"
        >
          <option value="all">Tutti gli appartamenti</option>
          {apartments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CalendarDays className="w-8 h-8 mx-auto text-muted-foreground/40 mb-3" />
            <p className="font-sans text-sm text-muted-foreground">Nessuna prenotazione trovata.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Codice</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Appartamento</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Ospite</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Periodo</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Stato</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Totale</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-muted-foreground font-medium text-right">Pagato</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, i) => (
                    <motion.tr
                      key={b.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border-b border-border/60 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {b.booking_code ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {aptNameById.get(b.apartment_id) ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">{b.guest_name} {b.guest_last_name}</div>
                        <div className="text-[11px] text-muted-foreground truncate max-w-[200px]">{b.guest_email}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">
                        {format(parseISO(b.check_in), "d MMM", { locale: it })} →{" "}
                        {format(parseISO(b.check_out), "d MMM yyyy", { locale: it })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex font-sans text-[10px] uppercase tracking-wider px-2 py-1 rounded-sm ${STATUS_COLOR[b.status] ?? "bg-muted text-muted-foreground"}`}>
                          {STATUS_LABEL[b.status] ?? b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{eur(Number(b.total_price ?? 0))}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{eur(Number(b.amount_paid ?? 0))}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProprietarioPrenotazioni;
