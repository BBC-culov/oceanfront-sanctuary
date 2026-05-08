// Client-side dialog: request modifications (dates, flight, guests, services, notes)
// Sends to request-booking-modification edge function.
import { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { Loader2, X, CalendarDays, PlaneTakeoff, Sparkles, MessageSquare, Phone, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdditionalServices } from "@/hooks/useAdditionalServices";
import { extractEdgeError } from "@/lib/edgeError";
import GuestListEditor, { type GuestRow, emptyGuest } from "./GuestListEditor";

interface Props {
  open: boolean;
  onClose: () => void;
  booking: any;
  onSubmitted?: () => void;
}

export default function RequestModificationDialog({ open, onClose, booking, onSubmitted }: Props) {
  const { data: services = [] } = useAdditionalServices();
  const [submitting, setSubmitting] = useState(false);

  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const [phone, setPhone] = useState(booking?.guest_phone ?? "");
  const [flightOut, setFlightOut] = useState(booking?.flight_outbound ?? "");
  const [flightRet, setFlightRet] = useState(booking?.flight_return ?? "");
  const [airline, setAirline] = useState(booking?.airline ?? "");
  const [arrTime, setArrTime] = useState(booking?.arrival_time ?? "");
  const [depTime, setDepTime] = useState(booking?.departure_time ?? "");
  const [noTransfer, setNoTransfer] = useState(!!booking?.no_transfer);
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [selectedSvcIds, setSelectedSvcIds] = useState<string[]>(
    Array.isArray(booking?.selected_services)
      ? booking.selected_services.map((s: any) => (typeof s === "string" ? s : s?.id)).filter(Boolean)
      : []
  );
  const [customerNote, setCustomerNote] = useState("");
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [editGuests, setEditGuests] = useState(false);

  useEffect(() => {
    if (!open || !booking) return;
    setCheckIn(booking.check_in ?? "");
    setCheckOut(booking.check_out ?? "");
    setPhone(booking.guest_phone ?? "");
    setFlightOut(booking.flight_outbound ?? "");
    setFlightRet(booking.flight_return ?? "");
    setAirline(booking.airline ?? "");
    setArrTime(booking.arrival_time ?? "");
    setDepTime(booking.departure_time ?? "");
    setNoTransfer(!!booking.no_transfer);
    setNotes(booking.notes ?? "");
    setSelectedSvcIds(
      Array.isArray(booking.selected_services)
        ? booking.selected_services.map((s: any) => (typeof s === "string" ? s : s?.id)).filter(Boolean)
        : []
    );
    setCustomerNote("");
  }, [open, booking]);

  if (!open) return null;

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;

  const toggleService = (id: string) => {
    setSelectedSvcIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const submit = async () => {
    if (!checkIn || !checkOut) {
      toast.error("Date obbligatorie");
      return;
    }
    if (nights < 1) {
      toast.error("Soggiorno minimo 1 notte");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("request-booking-modification", {
        body: {
          booking_id: booking.id,
          changes: {
            check_in: checkIn,
            check_out: checkOut,
            guest_phone: phone,
            flight_outbound: flightOut,
            flight_return: flightRet,
            airline,
            arrival_time: arrTime,
            departure_time: depTime,
            no_transfer: noTransfer,
            notes,
            selected_services: selectedSvcIds,
          },
          customer_note: customerNote || null,
        },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      toast.success("Richiesta inviata! Riceverai una conferma via email.");
      onSubmitted?.();
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Errore invio richiesta");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl"
        >
          <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border/60 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 className="font-serif text-xl text-foreground">Richiedi modifica</h2>
              <p className="font-sans text-xs text-muted-foreground">Le modifiche saranno valutate dal team.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Dates */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <CalendarDays className="w-3.5 h-3.5" /> Date soggiorno
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-sans text-xs text-muted-foreground">Check-in</label>
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full h-11 mt-1 px-3 rounded-md bg-background border border-border text-sm" />
                </div>
                <div>
                  <label className="font-sans text-xs text-muted-foreground">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full h-11 mt-1 px-3 rounded-md bg-background border border-border text-sm" />
                </div>
              </div>
              {nights > 0 && (
                <p className="font-sans text-xs text-muted-foreground mt-2">Durata: {nights} notti</p>
              )}
            </section>

            {/* Contact */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <Phone className="w-3.5 h-3.5" /> Contatto
              </h3>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefono"
                className="w-full h-11 px-3 rounded-md bg-background border border-border text-sm" />
            </section>

            {/* Flight */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <PlaneTakeoff className="w-3.5 h-3.5" /> Volo
              </h3>
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={noTransfer} onChange={(e) => setNoTransfer(e.target.checked)} />
                <span className="font-sans text-sm">Non richiedo trasporto aeroportuale</span>
              </label>
              {!noTransfer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Compagnia aerea"
                    className="h-11 px-3 rounded-md bg-background border border-border text-sm" />
                  <input value={flightOut} onChange={(e) => setFlightOut(e.target.value)} placeholder="Volo andata"
                    className="h-11 px-3 rounded-md bg-background border border-border text-sm" />
                  <input type="time" value={arrTime} onChange={(e) => setArrTime(e.target.value)}
                    className="h-11 px-3 rounded-md bg-background border border-border text-sm" />
                  <input value={flightRet} onChange={(e) => setFlightRet(e.target.value)} placeholder="Volo ritorno"
                    className="h-11 px-3 rounded-md bg-background border border-border text-sm" />
                  <input type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)}
                    className="h-11 px-3 rounded-md bg-background border border-border text-sm" />
                </div>
              )}
            </section>

            {/* Services */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Servizi aggiuntivi
              </h3>
              <div className="space-y-2">
                {services.map((s) => (
                  <label key={s.id} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedSvcIds.includes(s.id) ? "bg-primary/5 border-primary/40" : "bg-background border-border hover:border-border"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedSvcIds.includes(s.id)} onChange={() => toggleService(s.id)} />
                      <div>
                        <p className="font-sans text-sm text-foreground">{s.name}</p>
                        {s.description && <p className="font-sans text-xs text-muted-foreground">{s.description}</p>}
                      </div>
                    </div>
                    <span className="font-sans text-sm font-medium text-primary">€{s.price}</span>
                  </label>
                ))}
              </div>
            </section>

            {/* Note */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <MessageSquare className="w-3.5 h-3.5" /> Note (opzionale)
              </h3>
              <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={3}
                placeholder="Spiega la modifica richiesta..."
                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm" />
            </section>
          </div>

          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-6 py-4 flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground">
              Annulla
            </button>
            <button onClick={submit} disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Invia richiesta
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
