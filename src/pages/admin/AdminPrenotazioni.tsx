import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  Search, Trash2, ChevronDown, CalendarDays, Eye, Clock,
  CheckCircle2, XCircle, AlertCircle, Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  guest_name: string;
  guest_last_name: string | null;
  guest_email: string;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number | null;
  notes: string | null;
  apartment_id: string;
  apartment_name?: string;
  created_at: string;
  booking_code?: string;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  pending: { label: "In attesa", icon: Clock, bg: "bg-accent/15", text: "text-accent-foreground" },
  confirmed: { label: "Confermata", icon: CheckCircle2, bg: "bg-primary/10", text: "text-primary" },
  cancelled: { label: "Cancellata", icon: XCircle, bg: "bg-destructive/10", text: "text-destructive" },
};

const AdminPrenotazioni = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [apartments, setApartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterApartment, setFilterApartment] = useState("");

  const fetchData = async () => {
    const [bRes, aRes] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("apartments").select("id, name"),
    ]);
    const aptMap = new Map((aRes.data ?? []).map((a: any) => [a.id, a.name]));
    setApartments(aRes.data ?? []);
    setBookings(
      (bRes.data ?? []).map((b: any) => ({ ...b, apartment_name: aptMap.get(b.apartment_id) ?? "—" }))
    );
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const fullName = `${b.guest_name} ${b.guest_last_name || ""}`.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !search ||
        fullName.includes(q) ||
        b.guest_email.toLowerCase().includes(q) ||
        (b.booking_code && b.booking_code.toLowerCase().includes(q));
      const matchStatus = !filterStatus || b.status === filterStatus;
      const matchApt = !filterApartment || b.apartment_id === filterApartment;
      return matchSearch && matchStatus && matchApt;
    });
  }, [bookings, search, filterStatus, filterApartment]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status } as any).eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast({ title: "Stato aggiornato" });
    }
  };

  const deleteBooking = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Sei sicuro di voler eliminare questa prenotazione?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Prenotazione eliminata" });
    }
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  }), [bookings]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl text-foreground">Prenotazioni</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">
          {stats.total} totali · {stats.confirmed} confermate · {stats.pending} in attesa
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Totali", value: stats.total, icon: CalendarDays, color: "text-foreground" },
          { label: "In attesa", value: stats.pending, icon: Clock, color: "text-accent-foreground" },
          { label: "Confermate", value: stats.confirmed, icon: CheckCircle2, color: "text-primary" },
          { label: "Cancellate", value: stats.cancelled, icon: XCircle, color: "text-destructive" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-card/40 border border-border/50 p-4 flex items-center gap-3"
          >
            <s.icon className={`w-5 h-5 ${s.color} opacity-60`} strokeWidth={1.5} />
            <div>
              <p className={`font-sans text-xl font-semibold ${s.color}`}>{s.value}</p>
              <p className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, email o codice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card/50 border-border/60 h-10"
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm font-sans appearance-none pr-8 w-full sm:w-40"
          >
            <option value="">Tutti gli stati</option>
            {Object.entries(statusConfig).map(([val, cfg]) => (
              <option key={val} value={val}>{cfg.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={filterApartment}
            onChange={(e) => setFilterApartment(e.target.value)}
            className="h-10 rounded-md border border-border/60 bg-card/50 px-3 py-2 text-sm font-sans appearance-none pr-8 w-full sm:w-48"
          >
            <option value="">Tutti gli appartamenti</option>
            {apartments.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </motion.div>

      {/* Booking list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted/30 animate-pulse rounded-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-sans text-sm">Nessuna prenotazione trovata</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((b, i) => {
              const sc = statusConfig[b.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const nights = differenceInDays(new Date(b.check_out), new Date(b.check_in));

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  onClick={() => navigate(`/admin/prenotazioni/${b.id}`)}
                  className="group flex items-center gap-4 p-4 bg-card/40 border border-border/50 hover:border-primary/30 transition-all duration-200 cursor-pointer"
                >
                  {/* Status dot */}
                  <div className={`w-10 h-10 rounded-full ${sc.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${sc.text}`} strokeWidth={1.5} />
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {b.booking_code && (
                        <span className="font-mono text-[10px] tracking-wider text-primary/70 bg-primary/5 px-1.5 py-0.5 rounded-sm flex-shrink-0">
                          #{b.booking_code}
                        </span>
                      )}
                      <p className="font-sans text-sm font-medium text-foreground truncate">
                        {b.guest_name} {b.guest_last_name || ""}
                      </p>
                      <span className={`font-sans text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-sm ${sc.bg} ${sc.text}`}>
                        {sc.label}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5 truncate">
                      {b.apartment_name} · {format(new Date(b.check_in), "d MMM", { locale: it })} → {format(new Date(b.check_out), "d MMM yyyy", { locale: it })} · {nights} notti
                    </p>
                  </div>

                  {/* Price */}
                  {b.total_price && (
                    <span className="font-sans text-sm font-semibold text-foreground flex-shrink-0 hidden sm:block">
                      €{b.total_price}
                    </span>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <select
                      value={b.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => { e.stopPropagation(); updateStatus(b.id, e.target.value); }}
                      className="h-8 rounded-md border border-border/40 bg-transparent px-2 text-[11px] font-sans appearance-none cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-24"
                    >
                      {Object.entries(statusConfig).map(([val, cfg]) => (
                        <option key={val} value={val}>{cfg.label}</option>
                      ))}
                    </select>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => deleteBooking(b.id, e)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      title="Elimina"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </motion.button>

                    <div className="w-8 h-8 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPrenotazioni;
