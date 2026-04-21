import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Check, Wand2 } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAdditionalServices } from "@/hooks/useAdditionalServices";
import { useApartments } from "@/hooks/useApartments";
import {
  isValidPhone, isValidDocumentNumber, isValidZip, isValidFiscalCode,
} from "@/lib/bookingValidation";

import AdminBookingStepIndicator from "@/components/admin/AdminBookingStepIndicator";
import StepClientSelection, { type ClientSelection } from "@/components/admin/booking-wizard/StepClientSelection";
import StepStay, { type StayData } from "@/components/admin/booking-wizard/StepStay";
import StepGuestData, { type GuestData, type AdditionalGuestData } from "@/components/booking/StepGuestData";
import StepFlightServices, { type FlightData } from "@/components/booking/StepFlightServices";
import StepBilling, { type BillingData } from "@/components/booking/StepBilling";
import StepRecap from "@/components/booking/StepRecap";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const emptyMainGuest: GuestData = {
  first_name: "", last_name: "", date_of_birth: "", place_of_birth: "",
  phone: "", email: "", nationality: "", id_type: "id_card",
  id_card_number: "", id_card_issued: "", id_card_expiry: "",
};

const emptyFlight: FlightData = {
  flight_outbound: "", flight_return: "", arrival_time: "", departure_time: "", airline: "",
};

const emptyBilling: BillingData = {
  billing_name: "", billing_address: "", billing_city: "",
  billing_zip: "", billing_country: "", billing_fiscal_code: "",
};

const TOTAL_STEPS = 6;

const AdminPrenotazioneNuova = () => {
  const navigate = useNavigate();
  const { data: apartments = [] } = useApartments();
  const { data: services = [] } = useAdditionalServices();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [client, setClient] = useState<ClientSelection>({ mode: "existing" });
  const [stay, setStay] = useState<StayData>({ apartment_id: "", check_in: "", check_out: "" });
  const [mainGuest, setMainGuest] = useState<GuestData>(emptyMainGuest);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuestData[]>([]);
  const [flightData, setFlightData] = useState<FlightData>(emptyFlight);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [billing, setBilling] = useState<BillingData>(emptyBilling);
  const [noTransfer, setNoTransfer] = useState(false);
  const [flightErrors, setFlightErrors] = useState<Record<string, boolean>>({});
  const [paymentChoice, setPaymentChoice] = useState<"full_paid" | "deposit_paid" | "unpaid">("unpaid");
  const [sendEmail, setSendEmail] = useState(false);

  const apt = useMemo(
    () => apartments.find((a: any) => a.id === stay.apartment_id) as any,
    [apartments, stay.apartment_id],
  );
  const nights =
    stay.check_in && stay.check_out
      ? Math.max(0, differenceInDays(parseISO(stay.check_out), parseISO(stay.check_in)))
      : 0;
  const pricePerNight = apt?.pricePerNight ?? 0;

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      // Cliente
      if (client.mode === "existing") {
        if (!client.existing_user_id) {
          toast.error("Seleziona un cliente esistente o crea un nuovo account");
          return false;
        }
      } else {
        if (!client.new_first_name?.trim() || !client.new_last_name?.trim()) {
          toast.error("Inserisci nome e cognome del nuovo cliente");
          return false;
        }
        if (!client.new_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.new_email)) {
          toast.error("Email cliente non valida");
          return false;
        }
        if (client.new_phone && !isValidPhone(client.new_phone)) {
          toast.error("Telefono cliente non valido");
          return false;
        }
      }
      // Auto-fill main guest with client data the first time
      if (!mainGuest.email) {
        if (client.mode === "existing") {
          setMainGuest({
            ...mainGuest,
            first_name: client.existing_user_first_name ?? "",
            last_name: client.existing_user_last_name ?? "",
            email: client.existing_user_email ?? "",
            phone: client.existing_user_phone ?? "",
          });
        } else {
          setMainGuest({
            ...mainGuest,
            first_name: client.new_first_name ?? "",
            last_name: client.new_last_name ?? "",
            email: client.new_email ?? "",
            phone: client.new_phone ?? "",
          });
        }
      }
      return true;
    }

    if (s === 1) {
      // Soggiorno
      if (!stay.apartment_id) { toast.error("Seleziona un appartamento"); return false; }
      if (!stay.check_in || !stay.check_out) { toast.error("Inserisci le date di check-in e check-out"); return false; }
      if (nights < 1) { toast.error("Il check-out deve essere successivo al check-in"); return false; }
      return true;
    }

    if (s === 2) {
      // Ospiti
      const { first_name, last_name, date_of_birth, nationality, id_card_number,
        id_card_issued, id_card_expiry, email, phone } = mainGuest;
      if (!first_name || !last_name || !date_of_birth || !nationality || !id_card_number ||
          !id_card_issued || !id_card_expiry || !email || !phone) {
        toast.error("Compila tutti i campi obbligatori dell'ospite principale");
        return false;
      }
      if (!isValidPhone(phone)) {
        toast.error("Telefono ospite non valido (6-15 cifre)"); return false;
      }
      if (!isValidDocumentNumber(id_card_number, mainGuest.id_type)) {
        toast.error("Numero documento ospite non valido"); return false;
      }
      if (apt && additionalGuests.length + 1 > apt.guests) {
        toast.error(`Capacità appartamento superata (max ${apt.guests} ospiti)`);
        return false;
      }
      for (let i = 0; i < additionalGuests.length; i++) {
        const g = additionalGuests[i];
        if (!g.first_name || !g.last_name || !g.date_of_birth || !g.nationality ||
            !g.id_card_number || !g.id_card_issued || !g.id_card_expiry) {
          toast.error(`Compila tutti i campi dell'ospite ${i + 2}`); return false;
        }
        if (!isValidDocumentNumber(g.id_card_number, g.id_type)) {
          toast.error(`Ospite ${i + 2}: numero documento non valido`); return false;
        }
      }
      return true;
    }

    if (s === 3) {
      // Volo & servizi
      if (!noTransfer) {
        const errs: Record<string, boolean> = {};
        const fields: (keyof FlightData)[] = ["airline", "flight_outbound", "arrival_time", "flight_return", "departure_time"];
        let hasError = false;
        for (const f of fields) {
          if (!flightData[f]) { errs[f] = true; hasError = true; }
        }
        if (hasError) {
          setFlightErrors(errs);
          toast.error("Compila i dati del volo o spunta 'no transfer'");
          return false;
        }
      }
      setFlightErrors({});
      return true;
    }

    if (s === 4) {
      const { billing_name, billing_address, billing_city, billing_zip, billing_country, billing_fiscal_code } = billing;
      if (!billing_name || !billing_address || !billing_city || !billing_zip || !billing_country || !billing_fiscal_code) {
        toast.error("Compila tutti i dati di fatturazione"); return false;
      }
      if (!isValidZip(billing_zip)) { toast.error("CAP non valido"); return false; }
      if (!isValidFiscalCode(billing_fiscal_code)) { toast.error("Codice Fiscale / P.IVA non valido"); return false; }
      return true;
    }

    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        client_mode: client.mode,
        client_user_id: client.existing_user_id,
        new_client: client.mode === "new" ? {
          email: client.new_email,
          first_name: client.new_first_name,
          last_name: client.new_last_name,
          phone: client.new_phone ?? "",
        } : undefined,
        apartment_id: stay.apartment_id,
        check_in: stay.check_in,
        check_out: stay.check_out,
        main_guest: mainGuest,
        additional_guests: additionalGuests,
        flight: flightData,
        no_transfer: noTransfer,
        selected_services: selectedServices,
        notes,
        billing,
        payment_choice: paymentChoice,
        send_email: sendEmail,
      };
      const { data, error } = await supabase.functions.invoke("admin-create-booking", { body: payload });
      if (error) throw new Error(error.message ?? "Errore creazione prenotazione");
      if (data?.error) throw new Error(data.error);
      toast.success(`Prenotazione ${data.booking_code} creata con successo`);
      navigate(`/admin/prenotazioni/${data.booking_id}`);
    } catch (e: any) {
      toast.error(e.message ?? "Errore");
    } finally {
      setSubmitting(false);
    }
  };

  const apartmentName = apt?.name ?? "—";
  const apartmentImage = apt?.gallery?.[0] ?? apt?.cover ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/prenotazioni")}
            className="inline-flex items-center gap-1.5 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Torna alle prenotazioni
          </button>
          <h1 className="font-serif text-2xl text-foreground flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Nuova prenotazione manuale
          </h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Crea una prenotazione e intestala a un cliente esistente o nuovo.
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <AdminBookingStepIndicator currentStep={step} />

      {/* Step content */}
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepClientSelection key="step-client" value={client} onChange={setClient} />
          )}
          {step === 1 && (
            <StepStay key="step-stay" value={stay} onChange={setStay} />
          )}
          {step === 2 && apt && (
            <StepGuestData
              key="step-guests"
              mainGuest={mainGuest}
              setMainGuest={setMainGuest}
              additionalGuests={additionalGuests}
              setAdditionalGuests={setAdditionalGuests}
              maxGuests={apt.guests}
            />
          )}
          {step === 3 && (
            <StepFlightServices
              key="step-flight"
              flightData={flightData}
              setFlightData={setFlightData}
              selectedServices={selectedServices}
              setSelectedServices={setSelectedServices}
              notes={notes}
              setNotes={setNotes}
              nights={nights}
              noTransfer={noTransfer}
              setNoTransfer={setNoTransfer}
              errors={flightErrors}
            />
          )}
          {step === 4 && (
            <StepBilling key="step-billing" billing={billing} setBilling={setBilling} />
          )}
          {step === 5 && (
            <motion.div
              key="step-recap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <StepRecap
                apartmentName={apartmentName}
                apartmentImage={apartmentImage}
                checkIn={stay.check_in}
                checkOut={stay.check_out}
                mainGuest={mainGuest}
                additionalGuests={additionalGuests}
                flightData={flightData}
                selectedServiceIds={selectedServices}
                services={services as any}
                billing={billing}
                notes={notes}
                pricePerNight={pricePerNight}
                onSubmit={() => {}}
                isSubmitting={false}
              />

              {/* Payment choice */}
              <div className="border border-border p-5 space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-foreground">Stato pagamento</h3>
                  <p className="font-sans text-xs text-muted-foreground mt-0.5">
                    Indica se il cliente ha già pagato (es. bonifico/contanti) o se deve ancora saldare.
                  </p>
                </div>
                <RadioGroup
                  value={paymentChoice}
                  onValueChange={(v) => setPaymentChoice(v as any)}
                  className="space-y-2"
                >
                  {[
                    { v: "full_paid", label: "Pagamento totale incassato", desc: "Stato: confermata · saldo già coperto" },
                    { v: "deposit_paid", label: "Caparra (20%) incassata", desc: "Stato: confermata · saldo da incassare separatamente" },
                    { v: "unpaid", label: "Da pagare interamente", desc: "Stato: in attesa · cliente deve ancora versare" },
                  ].map((o) => (
                    <label
                      key={o.v}
                      htmlFor={`pay-${o.v}`}
                      className={`flex items-start gap-3 p-3 border cursor-pointer transition-all ${
                        paymentChoice === o.v ? "border-primary bg-primary/5" : "border-border hover:border-foreground/20"
                      }`}
                    >
                      <RadioGroupItem value={o.v} id={`pay-${o.v}`} className="mt-0.5" />
                      <div>
                        <p className="font-sans text-sm text-foreground">{o.label}</p>
                        <p className="font-sans text-xs text-muted-foreground">{o.desc}</p>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              {/* Email confirmation */}
              <div className="border border-border p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={sendEmail}
                    onCheckedChange={(v) => setSendEmail(!!v)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-sans text-sm text-foreground">Invia email di conferma al cliente</p>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">
                      L'email contiene il codice prenotazione e il riepilogo. Disattiva se vuoi avvisare il cliente personalmente (es. WhatsApp).
                    </p>
                  </div>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="flex justify-between mt-10 pt-6 border-t border-border">
          <button
            onClick={prev}
            disabled={step === 0 || submitting}
            className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 border border-border hover:border-foreground/20"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>

          {step < TOTAL_STEPS - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors"
            >
              Avanti
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creazione in corso...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Crea prenotazione
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPrenotazioneNuova;
