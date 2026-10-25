import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { errorMessage } from "@/lib/dataTypes";
// Client-side dialog: request modifications (dates, main guest, flight, additional guests, services, notes)
// Sends to request-booking-modification edge function.
import { useEffect, useState } from "react";
import { Loader2, X, CalendarDays, PlaneTakeoff, Sparkles, MessageSquare, Phone, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdditionalServices } from "@/hooks/useAdditionalServices";
import { extractEdgeError } from "@/lib/edgeError";
import PhonePrefixInput from "@/components/PhonePrefixInput";
import { useBookingEditForm } from "@/hooks/useBookingEditForm";
import { ErrorMsg, AdditionalGuestsSection } from "./BookingModificationFormFields";

interface Props {
  open: boolean;
  onClose: () => void;
  booking: Tables<"bookings">;
  onSubmitted?: () => void;
}

const fieldClass = (hasError: boolean) =>
  `w-full h-11 px-3 rounded-md bg-background border text-sm ${hasError ? "border-destructive focus:border-destructive" : "border-border"}`;

export default function RequestModificationDialog({ open, onClose, booking, onSubmitted }: Props) {
  const { data: services = [] } = useAdditionalServices();
  const [submitting, setSubmitting] = useState(false);
  const form = useBookingEditForm(open, booking);
  const {
    errors, checkIn, setCheckIn, checkOut, setCheckOut,
    guestName, setGuestName, guestLast, setGuestLast, guestEmail, setGuestEmail, phone, setPhone,
    gDob, setGDob, gPob, setGPob, gNat, setGNat, gIdType, setGIdType, gIdNum, setGIdNum,
    gIdIss, setGIdIss, gIdExp, setGIdExp,
    flightOut, setFlightOut, flightRet, setFlightRet, airline, setAirline,
    arrTime, setArrTime, depTime, setDepTime, noTransfer, setNoTransfer, notes,
    selectedSvcIds, toggleService, guests, setGuests, editGuests, setEditGuests, nights,
  } = form;
  const [customerNote, setCustomerNote] = useState("");
  const [editMainGuest, setEditMainGuest] = useState(false);

  useEffect(() => {
    if (!open || !booking) return;
    setCustomerNote("");
    setEditMainGuest(false);
  }, [open, booking]);

  if (!open) return null;

  const validate = () => form.validate({ includeMainGuest: editMainGuest });

  const submit = async () => {
    if (!validate()) {
      toast.error("Controlla i campi evidenziati");
      return;
    }
    setSubmitting(true);
    try {
      const changes: TablesUpdate<"bookings"> = {
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
      };
      if (editMainGuest) {
        Object.assign(changes, {
          guest_name: guestName,
          guest_last_name: guestLast,
          guest_date_of_birth: gDob || null,
          guest_place_of_birth: gPob || null,
          guest_nationality: gNat || null,
          guest_id_type: gIdType,
          guest_id_card_number: gIdNum || null,
          guest_id_card_issued: gIdIss || null,
          guest_id_card_expiry: gIdExp || null,
        });
      }
      const { data, error } = await supabase.functions.invoke("request-booking-modification", {
        body: {
          booking_id: booking.id,
          changes,
          ...(editGuests ? { additional_guests: guests } : {}),
          customer_note: customerNote || null,
        },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      toast.success("Richiesta inviata! Riceverai una conferma via email.");
      onSubmitted?.();
      onClose();
    } catch (e: unknown) {
      toast.error(errorMessage(e) || "Errore invio richiesta");
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
                    className={fieldClass(!!errors.check_in) + " mt-1"} />
                  <ErrorMsg msg={errors.check_in} />
                </div>
                <div>
                  <label className="font-sans text-xs text-muted-foreground">Check-out</label>
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)}
                    className={fieldClass(!!errors.check_out) + " mt-1"} />
                  <ErrorMsg msg={errors.check_out} />
                </div>
              </div>
              {nights > 0 && <p className="font-sans text-xs text-muted-foreground mt-2">Durata: {nights} notti</p>}
            </section>

            {/* Phone (always editable) */}
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <Phone className="w-3.5 h-3.5" /> Telefono di contatto
              </h3>
              <PhonePrefixInput value={phone} onChange={setPhone} variant="compact" placeholder="333 123 4567" />
              <ErrorMsg msg={errors.guest_phone} />

            </section>

            {/* Main guest data */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  <User className="w-3.5 h-3.5" /> Dati ospite principale
                </h3>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" checked={editMainGuest} onChange={(e) => setEditMainGuest(e.target.checked)} />
                  Modifica dati
                </label>
              </div>
              {editMainGuest ? (
                <div className="space-y-5">
                  {/* Anagrafica */}
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Anagrafica</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Nome</label>
                        <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={fieldClass(!!errors.guest_name) + " mt-1"} />
                        <ErrorMsg msg={errors.guest_name} />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Cognome</label>
                        <input value={guestLast} onChange={(e) => setGuestLast(e.target.value)} className={fieldClass(!!errors.guest_last_name) + " mt-1"} />
                        <ErrorMsg msg={errors.guest_last_name} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Email</label>
                        <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={fieldClass(!!errors.guest_email) + " mt-1"} />
                        <ErrorMsg msg={errors.guest_email} />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di nascita</label>
                        <input type="date" value={gDob} onChange={(e) => setGDob(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Luogo di nascita</label>
                        <input value={gPob} onChange={(e) => setGPob(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Nazionalità</label>
                        <input value={gNat} onChange={(e) => setGNat(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                    </div>
                  </div>
                  {/* Documento */}
                  <div>
                    <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Documento d'identità</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Tipo documento</label>
                        <select value={gIdType} onChange={(e) => setGIdType(e.target.value)} className={fieldClass(false) + " mt-1"}>
                          <option value="id_card">Carta d'identità</option>
                          <option value="passport">Passaporto</option>
                          <option value="driver_license">Patente</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Numero documento</label>
                        <input value={gIdNum} onChange={(e) => setGIdNum(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di rilascio</label>
                        <input type="date" value={gIdIss} onChange={(e) => setGIdIss(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                      <div>
                        <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di scadenza</label>
                        <input type="date" value={gIdExp} onChange={(e) => setGIdExp(e.target.value)} className={fieldClass(false) + " mt-1"} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-sans text-xs text-muted-foreground italic">
                  Spunta "Modifica dati" per aggiornare nome, email, anagrafica e dati del documento dell'ospite principale.
                </p>
              )}
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
                  <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Compagnia aerea" className={fieldClass(false)} />
                  <input value={flightOut} onChange={(e) => setFlightOut(e.target.value)} placeholder="Volo andata" className={fieldClass(false)} />
                  <input type="time" value={arrTime} onChange={(e) => setArrTime(e.target.value)} className={fieldClass(false)} />
                  <input value={flightRet} onChange={(e) => setFlightRet(e.target.value)} placeholder="Volo ritorno" className={fieldClass(false)} />
                  <input type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)} className={fieldClass(false)} />
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

            {/* Additional guests */}
            <AdditionalGuestsSection guests={guests} setGuests={setGuests} editGuests={editGuests} setEditGuests={setEditGuests} errors={errors} />

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
