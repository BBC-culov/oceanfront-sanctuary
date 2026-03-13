import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Search, Trash2, ChevronDown, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  guest_name: string;
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
}

const statusOptions = [
  { value: "pending", label: "In attesa", color: "bg-accent/20 text-accent-foreground" },
  { value: "confirmed", label: "Confermata", color: "bg-primary/10 text-primary" },
  { value: "cancelled", label: "Cancellata", color: "bg-destructive/10 text-destructive" },
];

const AdminPrenotazioni = () => {
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
      const matchSearch = !search || 
        b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
        b.guest_email.toLowerCase().includes(search.toLowerCase());
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

  const deleteBooking = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa prenotazione?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
      toast({ title: "Prenotazione eliminata" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-light text-foreground">Prenotazioni</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Gestisci tutte le prenotazioni</p>
      </div>

      {/* Filters */}
      <Card className="bg-background">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-sans appearance-none pr-8 w-full sm:w-44"
              >
                <option value="">Tutti gli stati</option>
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterApartment}
                onChange={(e) => setFilterApartment(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm font-sans appearance-none pr-8 w-full sm:w-48"
              >
                <option value="">Tutti gli appartamenti</option>
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-background">
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Caricamento...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nessuna prenotazione trovata</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Cliente", "Appartamento", "Check-in", "Check-out", "Stato", "Azioni"].map((h) => (
                      <th key={h} className="text-left font-sans text-xs uppercase tracking-wider text-muted-foreground py-3 px-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((b) => (
                      <motion.tr
                        key={b.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <p className="font-sans text-sm text-foreground">{b.guest_name}</p>
                          <p className="font-sans text-xs text-muted-foreground">{b.guest_email}</p>
                        </td>
                        <td className="py-3 px-2 font-sans text-sm">{b.apartment_name}</td>
                        <td className="py-3 px-2 font-sans text-sm text-muted-foreground">
                          {format(new Date(b.check_in), "dd MMM yyyy", { locale: it })}
                        </td>
                        <td className="py-3 px-2 font-sans text-sm text-muted-foreground">
                          {format(new Date(b.check_out), "dd MMM yyyy", { locale: it })}
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={b.status}
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            className={`font-sans text-xs px-2.5 py-1 rounded-full border-0 appearance-none cursor-pointer ${
                              statusOptions.find((s) => s.value === b.status)?.color ?? ""
                            }`}
                          >
                            {statusOptions.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => deleteBooking(b.id)}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                            title="Elimina"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPrenotazioni;
