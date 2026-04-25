import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Trash2, CalendarRange, Lock, AlertCircle } from "lucide-react";
import { format, startOfDay, addDays, isBefore, isSameDay } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  apartmentId: string;
  apartmentName: string;
}

interface Block {
  id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
}

interface BookingRange {
  check_in: string;
  check_out: string;
  booking_code: string;
  status: string;
}

const AvailabilityManagerDialog = ({ open, onClose, apartmentId, apartmentName }: Props) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [bookings, setBookings] = useState<BookingRange[]>([]);
  const [range, setRange] = useState<DateRange | undefined>();
  const [reason, setReason] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocksRes, bookingsRes] = await Promise.all([
        supabase
          .from("apartment_availability_blocks")
          .select("id, start_date, end_date, reason")
          .eq("apartment_id", apartmentId)
          .order("start_date", { ascending: true }),
        supabase
          .from("bookings")
          .select("check_in, check_out, booking_code, status")
          .eq("apartment_id", apartmentId)
          .in("status", ["confirmed", "pending", "awaiting_verification", "paid"]),
      ]);
      if (blocksRes.error) throw blocksRes.error;
      if (bookingsRes.error) throw bookingsRes.error;
      setBlocks(blocksRes.data ?? []);
      setBookings(bookingsRes.data ?? []);
    } catch (e: any) {
      toast({ title: "Errore caricamento", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && apartmentId) {
      loadData();
      setRange(undefined);
      setReason("");
    }
  }, [open, apartmentId]);

  // Days disabled = booked by clients (cannot be blocked manually here)
  const bookedDays: Date[] = [];
  bookings.forEach((b) => {
    const start = startOfDay(new Date(b.check_in));
    const end = startOfDay(new Date(b.check_out));
    for (let d = start; isBefore(d, end); d = addDays(d, 1)) {
      bookedDays.push(d);
    }
  });

  // Days highlighted = manually blocked
  const blockedDays: Date[] = [];
  blocks.forEach((b) => {
    const start = startOfDay(new Date(b.start_date));
    const end = startOfDay(new Date(b.end_date));
    for (let d = start; !isBefore(end, d); d = addDays(d, 1)) {
      blockedDays.push(d);
    }
  });

  const handleSaveBlock = async () => {
    if (!range?.from || !range?.to) {
      toast({ title: "Seleziona un intervallo", variant: "destructive" });
      return;
    }
    // Check overlap with bookings
    const start = startOfDay(range.from);
    const end = startOfDay(range.to);
    const overlap = bookings.some((b) => {
      const bStart = startOfDay(new Date(b.check_in));
      const bEnd = startOfDay(new Date(b.check_out));
      return start < bEnd && addDays(end, 1) > bStart;
    });
    if (overlap) {
      toast({
        title: "Conflitto con prenotazioni",
        description: "Il periodo selezionato si sovrappone a prenotazioni esistenti.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessione scaduta");

      const { error } = await supabase.from("apartment_availability_blocks").insert({
        apartment_id: apartmentId,
        start_date: format(start, "yyyy-MM-dd"),
        end_date: format(end, "yyyy-MM-dd"),
        reason: reason.trim() || null,
        created_by: user.id,
      });
      if (error) throw error;
      toast({ title: "Periodo bloccato" });
      setRange(undefined);
      setReason("");
      await loadData();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!confirm("Eliminare questo blocco?")) return;
    try {
      const { error } = await supabase
        .from("apartment_availability_blocks")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast({ title: "Blocco rimosso" });
      await loadData();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message, variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-background border border-border rounded-md shadow-xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-border sticky top-0 bg-background z-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarRange className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-serif text-base text-foreground">Disponibilità</h2>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">{apartmentName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6 p-5">
                  {/* Calendar */}
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Seleziona intervallo da bloccare
                    </p>
                    <div className="border border-border rounded-md bg-secondary/40 flex justify-center">
                      <Calendar
                        mode="range"
                        selected={range}
                        onSelect={setRange}
                        numberOfMonths={1}
                        locale={it}
                        weekStartsOn={1}
                        disabled={[
                          { before: startOfDay(new Date()) },
                          ...bookedDays,
                        ]}
                        modifiers={{
                          booked: bookedDays,
                          blocked: blockedDays,
                        }}
                        modifiersClassNames={{
                          booked: "bg-destructive/15 text-destructive line-through",
                          blocked: "bg-orange-100 text-orange-700",
                        }}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-sans text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-destructive/30" />
                        Prenotato
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-orange-200" />
                        Bloccato manualmente
                      </span>
                    </div>

                    <Textarea
                      placeholder="Motivo (opzionale): manutenzione, uso personale…"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="mt-3 font-sans text-xs"
                    />

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={saving || !range?.from || !range?.to}
                      onClick={handleSaveBlock}
                      className="mt-3 w-full flex items-center justify-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide px-4 py-2.5 bg-primary text-primary-foreground rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvataggio…
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Blocca periodo
                        </>
                      )}
                    </motion.button>

                    {range?.from && range?.to && (
                      <p className="mt-2 text-[11px] font-sans text-muted-foreground text-center">
                        {format(range.from, "d MMM", { locale: it })}{" "}
                        →{" "}
                        {format(range.to, "d MMM yyyy", { locale: it })}
                      </p>
                    )}
                  </div>

                  {/* Existing blocks */}
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
                      Blocchi attivi ({blocks.length})
                    </p>

                    {blocks.length === 0 ? (
                      <div className="border border-dashed border-border rounded-md p-6 text-center">
                        <AlertCircle className="w-5 h-5 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="font-sans text-xs text-muted-foreground">
                          Nessun periodo bloccato manualmente
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {blocks.map((b) => {
                          const start = new Date(b.start_date);
                          const end = new Date(b.end_date);
                          const same = isSameDay(start, end);
                          return (
                            <motion.div
                              key={b.id}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-start justify-between gap-3 p-3 border border-border rounded-md bg-secondary/30 hover:bg-secondary/60 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-sans text-xs font-medium text-foreground">
                                  {same
                                    ? format(start, "d MMMM yyyy", { locale: it })
                                    : `${format(start, "d MMM", { locale: it })} → ${format(end, "d MMM yyyy", { locale: it })}`}
                                </p>
                                {b.reason && (
                                  <p className="font-sans text-[11px] text-muted-foreground mt-1 truncate">
                                    {b.reason}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleDeleteBlock(b.id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                title="Elimina blocco"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}

                    {/* Bookings list */}
                    {bookings.length > 0 && (
                      <>
                        <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2 mt-5">
                          Prenotazioni attive ({bookings.length})
                        </p>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                          {bookings.map((b, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between gap-2 p-2 border border-border/50 rounded-sm bg-destructive/5"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  {b.booking_code}
                                </p>
                                <p className="font-sans text-[11px] text-foreground">
                                  {format(new Date(b.check_in), "d MMM", { locale: it })} →{" "}
                                  {format(new Date(b.check_out), "d MMM yyyy", { locale: it })}
                                </p>
                              </div>
                              <span className="font-sans text-[9px] uppercase tracking-wider text-destructive/70">
                                {b.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AvailabilityManagerDialog;
