// Admin: edit booking directly via admin-update-booking edge function.
// Supports dates, contact, full main guest, flight, services, additional guests, notes.
// Can generate a 24h Stripe "modification" payment link for a positive price diff.
import { useEffect, useState } from "react";
import { differenceInDays } from "date-fns";
import { Loader2, X, CalendarDays, PlaneTakeoff, Sparkles, MessageSquare, Phone, CreditCard, Mail, Users, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAdditionalServices } from "@/hooks/useAdditionalServices";
import { extractEdgeError } from "@/lib/edgeError";
import GuestListEditor, { type GuestRow } from "@/components/booking/GuestListEditor";
import { mainGuestSchema, stayDatesSchema, guestSchema, flattenZodErrors, type FieldErrors } from "@/lib/modificationValidation";
import PhonePrefixInput from "@/components/PhonePrefixInput";

interface Props {
  open: boolean;
  onClose: () => void;
  booking: any;
  onSaved?: () => void;
}

const fieldClass = (hasError: boolean) =>
  `h-11 px-3 rounded-md bg-background border text-sm ${hasError ? "border-destructive" : "border-border"}`;

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? <p className="mt-1 text-[11px] text-destructive flex items-center gap-1"><AlertCircle className="w-3 h-3" />{msg}</p> : null;

export default function AdminEditBookingDialog({ open, onClose, booking, onSaved }: Props) {
  const { data: services = [] } = useAdditionalServices();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestLast, setGuestLast] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gDob, setGDob] = useState("");
  const [gPob, setGPob] = useState("");
  const [gNat, setGNat] = useState("");
  const [gIdType, setGIdType] = useState("id_card");
  const [gIdNum, setGIdNum] = useState("");
  const [gIdIss, setGIdIss] = useState("");
  const [gIdExp, setGIdExp] = useState("");
  const [flightOut, setFlightOut] = useState("");
  const [flightRet, setFlightRet] = useState("");
  const [airline, setAirline] = useState("");
  const [arrTime, setArrTime] = useState("");
  const [depTime, setDepTime] = useState("");
  const [noTransfer, setNoTransfer] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedSvcIds, setSelectedSvcIds] = useState<string[]>([]);
  const [generateLink, setGenerateLink] = useState(true);
  const [sendEmail, setSendEmail] = useState(true);
  const [guests, setGuests] = useState<GuestRow[]>([]);
  const [editGuests, setEditGuests] = useState(false);

  useEffect(() => {
    if (!open || !booking) return;
    setErrors({});
    setCheckIn(booking.check_in ?? "");
    setCheckOut(booking.check_out ?? "");
    setGuestName(booking.guest_name ?? "");
    setGuestLast(booking.guest_last_name ?? "");
    setGuestEmail(booking.guest_email ?? "");
    setPhone(booking.guest_phone ?? "");
    setGDob(booking.guest_date_of_birth ?? "");
    setGPob(booking.guest_place_of_birth ?? "");
    setGNat(booking.guest_nationality ?? "");
    setGIdType(booking.guest_id_type ?? "id_card");
    setGIdNum(booking.guest_id_card_number ?? "");
    setGIdIss(booking.guest_id_card_issued ?? "");
    setGIdExp(booking.guest_id_card_expiry ?? "");
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
    setGenerateLink(true);
    setSendEmail(true);
    setEditGuests(false);
    (async () => {
      const { data } = await supabase
        .from("booking_guests")
        .select("first_name,last_name,date_of_birth,nationality,id_type,id_card_number,id_card_issued,id_card_expiry")
        .eq("booking_id", booking.id);
      setGuests(
        (data ?? []).map((g: any) => ({
          first_name: g.first_name ?? "",
          last_name: g.last_name ?? "",
          date_of_birth: g.date_of_birth ?? "",
          nationality: g.nationality ?? "",
          id_type: g.id_type ?? "id_card",
          id_card_number: g.id_card_number ?? "",
          id_card_issued: g.id_card_issued ?? "",
          id_card_expiry: g.id_card_expiry ?? "",
        }))
      );
    })();
  }, [open, booking]);

  if (!open) return null;

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const toggleService = (id: string) =>
    setSelectedSvcIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    const dRes = stayDatesSchema.safeParse({ check_in: checkIn, check_out: checkOut });
    if (!dRes.success) Object.assign(errs, flattenZodErrors(dRes.error));
    const mRes = mainGuestSchema.safeParse({
      guest_name: guestName, guest_last_name: guestLast, guest_email: guestEmail, guest_phone: phone,
      guest_date_of_birth: gDob, guest_place_of_birth: gPob, guest_nationality: gNat,
      guest_id_type: gIdType as any, guest_id_card_number: gIdNum,
      guest_id_card_issued: gIdIss, guest_id_card_expiry: gIdExp,
    });
    if (!mRes.success) Object.assign(errs, flattenZodErrors(mRes.error));
    if (editGuests) {
      guests.forEach((g, idx) => {
        const r = guestSchema.safeParse(g);
        if (!r.success) {
          const fl = flattenZodErrors(r.error);
          for (const k of Object.keys(fl)) errs[`guest_${idx}_${k}`] = fl[k];
        }
      });
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) {
      toast({ title: "Compila correttamente i campi evidenziati", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-update-booking", {
        body: {
          booking_id: booking.id,
          changes: {
            check_in: checkIn, check_out: checkOut,
            guest_name: guestName, guest_last_name: guestLast,
            guest_email: guestEmail, guest_phone: phone,
            guest_date_of_birth: gDob || null,
            guest_place_of_birth: gPob || null,
            guest_nationality: gNat || null,
            guest_id_type: gIdType,
            guest_id_card_number: gIdNum || null,
            guest_id_card_issued: gIdIss || null,
            guest_id_card_expiry: gIdExp || null,
            flight_outbound: flightOut, flight_return: flightRet,
            airline, arrival_time: arrTime, departure_time: depTime, no_transfer: noTransfer,
            notes,
            selected_services: selectedSvcIds,
          },
          ...(editGuests ? { additional_guests: guests } : {}),
          generate_modification_link: generateLink,
          send_email: sendEmail,
        },
      });
      if (data?.error) throw new Error(data.error);
      if (error) throw new Error(await extractEdgeError(error));
      toast({
        title: "Prenotazione aggiornata",
        description: data?.modification_payment_url
          ? `Link modifica generato (differenza €${Number(data.price_diff).toFixed(2)}).`
          : `Nuovo totale: €${Number(data.new_total).toFixed(2)}`,
      });
      onSaved?.();
      onClose();
    } catch (e: any) {
      toast({ title: "Errore", description: e.message || "Errore aggiornamento", variant: "destructive" });
    } finally { setSubmitting(false); }
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
              <h2 className="font-serif text-xl text-foreground">Modifica prenotazione</h2>
              <p className="font-sans text-xs text-muted-foreground">#{booking.booking_code}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <CalendarDays className="w-3.5 h-3.5" /> Date soggiorno
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={`w-full ${fieldClass(!!errors.check_in)}`} /><ErrorMsg msg={errors.check_in} /></div>
                <div><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={`w-full ${fieldClass(!!errors.check_out)}`} /><ErrorMsg msg={errors.check_out} /></div>
              </div>
              {nights > 0 && <p className="font-sans text-xs text-muted-foreground mt-2">{nights} notti</p>}
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <User className="w-3.5 h-3.5" /> Ospite principale
              </h3>
              <div className="space-y-5">
                {/* Contatti */}
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Contatti</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Nome</label>
                      <input value={guestName} onChange={(e) => setGuestName(e.target.value)} className={`w-full mt-1 ${fieldClass(!!errors.guest_name)}`} />
                      <ErrorMsg msg={errors.guest_name} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Cognome</label>
                      <input value={guestLast} onChange={(e) => setGuestLast(e.target.value)} className={`w-full mt-1 ${fieldClass(!!errors.guest_last_name)}`} />
                      <ErrorMsg msg={errors.guest_last_name} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Email</label>
                      <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={`w-full mt-1 ${fieldClass(!!errors.guest_email)}`} />
                      <ErrorMsg msg={errors.guest_email} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Telefono</label>
                      <div className="mt-1">
                        <PhonePrefixInput value={phone} onChange={setPhone} variant="compact" />
                      </div>
                      <ErrorMsg msg={errors.guest_phone} />

                    </div>
                  </div>
                </div>
                {/* Anagrafica */}
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Anagrafica</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di nascita</label>
                      <input type="date" value={gDob} onChange={(e) => setGDob(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Luogo di nascita</label>
                      <input value={gPob} onChange={(e) => setGPob(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Nazionalità</label>
                      <input value={gNat} onChange={(e) => setGNat(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                  </div>
                </div>
                {/* Documento */}
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70 mb-2">Documento d'identità</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Tipo documento</label>
                      <select value={gIdType} onChange={(e) => setGIdType(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`}>
                        <option value="id_card">Carta d'identità</option>
                        <option value="passport">Passaporto</option>
                        <option value="driver_license">Patente</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Numero documento</label>
                      <input value={gIdNum} onChange={(e) => setGIdNum(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di rilascio</label>
                      <input type="date" value={gIdIss} onChange={(e) => setGIdIss(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                    <div>
                      <label className="font-sans text-[11px] uppercase tracking-wide text-muted-foreground/80">Data di scadenza</label>
                      <input type="date" value={gIdExp} onChange={(e) => setGIdExp(e.target.value)} className={`w-full mt-1 ${fieldClass(false)}`} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <PlaneTakeoff className="w-3.5 h-3.5" /> Volo
              </h3>
              <label className="flex items-center gap-2 mb-3">
                <input type="checkbox" checked={noTransfer} onChange={(e) => setNoTransfer(e.target.checked)} />
                <span className="font-sans text-sm">Nessun trasporto aeroportuale</span>
              </label>
              {!noTransfer && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input value={airline} onChange={(e) => setAirline(e.target.value)} placeholder="Compagnia" className={`w-full ${fieldClass(false)}`} />
                  <input value={flightOut} onChange={(e) => setFlightOut(e.target.value)} placeholder="Volo andata" className={`w-full ${fieldClass(false)}`} />
                  <input type="time" value={arrTime} onChange={(e) => setArrTime(e.target.value)} className={`w-full ${fieldClass(false)}`} />
                  <input value={flightRet} onChange={(e) => setFlightRet(e.target.value)} placeholder="Volo ritorno" className={`w-full ${fieldClass(false)}`} />
                  <input type="time" value={depTime} onChange={(e) => setDepTime(e.target.value)} className={`w-full ${fieldClass(false)}`} />
                </div>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <Sparkles className="w-3.5 h-3.5" /> Servizi aggiuntivi
              </h3>
              <div className="space-y-2">
                {services.map((s) => (
                  <label key={s.id} className={`flex items-center justify-between p-3 rounded-md border cursor-pointer ${
                    selectedSvcIds.includes(s.id) ? "bg-primary/5 border-primary/40" : "bg-background border-border"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedSvcIds.includes(s.id)} onChange={() => toggleService(s.id)} />
                      <span className="font-sans text-sm">{s.name}</span>
                    </div>
                    <span className="font-sans text-sm font-medium text-primary">€{s.price}</span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                  <Users className="w-3.5 h-3.5" /> Ospiti aggiuntivi
                </h3>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" checked={editGuests} onChange={(e) => setEditGuests(e.target.checked)} />
                  Modifica ospiti
                </label>
              </div>
              {editGuests ? (
                <>
                  <GuestListEditor guests={guests} onChange={setGuests} />
                  {Object.keys(errors).some((k) => k.startsWith("guest_")) && (
                    <p className="mt-2 text-[11px] text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Compila correttamente tutti i campi degli ospiti
                    </p>
                  )}
                </>
              ) : (
                <p className="font-sans text-xs text-muted-foreground italic">
                  Spunta "Modifica ospiti" per aggiungere o modificare gli ospiti registrati ({guests.length} attuali).
                </p>
              )}
            </section>

            <section>
              <h3 className="flex items-center gap-2 font-sans text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
                <MessageSquare className="w-3.5 h-3.5" /> Note interne
              </h3>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm" />
            </section>

            <section className="space-y-2 border-t border-border/40 pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={generateLink} onChange={(e) => setGenerateLink(e.target.checked)} />
                <CreditCard className="w-3.5 h-3.5 text-primary" />
                Genera link Stripe per eventuale differenza (24h)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
                <Mail className="w-3.5 h-3.5 text-primary" />
                Invia email di notifica al cliente
              </label>
            </section>
          </div>

          <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border/60 px-6 py-4 flex gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground">
              Annulla
            </button>
            <button onClick={submit} disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-sans text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Salva modifiche
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
