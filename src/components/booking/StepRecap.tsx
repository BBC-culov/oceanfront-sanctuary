import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarCheck, Users, PlaneTakeoff, PlaneLanding,
  Receipt, Sparkles, CreditCard, MessageSquare, Building2, ChevronRight,
} from "lucide-react";
import type { GuestData, AdditionalGuestData } from "./StepGuestData";
import type { FlightData } from "./StepFlightServices";
import type { BillingData } from "./StepBilling";
import type { AdditionalService } from "@/hooks/useAdditionalServices";

interface StepRecapProps {
  apartmentName: string;
  apartmentImage: string;
  checkIn: string;
  checkOut: string;
  mainGuest: GuestData;
  additionalGuests: AdditionalGuestData[];
  flightData: FlightData;
  selectedServiceIds: string[];
  services: AdditionalService[];
  billing: BillingData;
  notes: string;
  pricePerNight: number;
  onSubmit: () => void;
  isSubmitting: boolean;
}

const Section = ({
  icon: Icon, title, children, delay = 0,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    className="py-5 first:pt-0"
  >
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-7 h-7 rounded-full bg-primary/8 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
      </div>
      <h4 className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium">{title}</h4>
    </div>
    {children}
  </motion.div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline py-1">
    <span className="font-sans text-sm text-muted-foreground">{label}</span>
    <span className="font-sans text-sm font-medium text-foreground text-right ml-4">{value}</span>
  </div>
);

const StepRecap = ({
  apartmentName, apartmentImage, checkIn, checkOut,
  mainGuest, additionalGuests, flightData,
  selectedServiceIds, services, billing, notes,
  pricePerNight, onSubmit, isSubmitting,
}: StepRecapProps) => {
  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
  const accommodationTotal = pricePerNight * nights;
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const getServiceTotal = (s: AdditionalService) =>
    s.name.toLowerCase().includes("noleggio") || s.name.toLowerCase().includes("giorno")
      ? s.price * nights : s.price;
  const servicesTotal = selectedServices.reduce((sum, s) => sum + getServiceTotal(s), 0);
  const grandTotal = accommodationTotal + servicesTotal;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-0"
    >
      {/* Apartment hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-card border border-border/50 mb-6"
      >
        <div className="flex gap-0">
          <img
            src={apartmentImage}
            alt={apartmentName}
            className="w-28 sm:w-36 h-auto object-cover flex-shrink-0"
          />
          <div className="flex-1 p-5">
            <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Il tuo soggiorno</p>
            <h3 className="font-serif text-xl text-foreground leading-tight">{apartmentName}</h3>
            <div className="flex items-center gap-2 mt-2.5">
              <CalendarCheck className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
              <span className="font-sans text-xs text-muted-foreground">
                {format(parseISO(checkIn), "d MMM", { locale: it })}
                <ChevronRight className="w-3 h-3 inline mx-0.5" />
                {format(parseISO(checkOut), "d MMM yyyy", { locale: it })}
              </span>
            </div>
            <p className="font-sans text-xs text-primary font-medium mt-1">{nights} notti · {additionalGuests.length + 1} ospiti</p>
          </div>
        </div>
      </motion.div>

      {/* Details */}
      <div className="bg-card/40 border border-border/50 px-6 sm:px-7 divide-y divide-border/40">
        <Section icon={Users} title="Ospiti" delay={0.08}>
          <Row label="Ospite principale" value={`${mainGuest.first_name} ${mainGuest.last_name}`} />
          <Row label="Contatto" value={`${mainGuest.email} · ${mainGuest.phone}`} />
          {additionalGuests.map((g, i) => (
            <Row key={i} label={`Ospite ${i + 2}`} value={`${g.first_name} ${g.last_name}`} />
          ))}
        </Section>

        {(flightData.flight_outbound || flightData.flight_return || flightData.airline) && (
          <Section icon={PlaneTakeoff} title="Voli" delay={0.14}>
            {flightData.airline && <Row label="Compagnia" value={flightData.airline} />}
            {flightData.flight_outbound && (
              <Row label="Andata" value={`${flightData.flight_outbound}${flightData.arrival_time ? ` · arr. ${flightData.arrival_time}` : ""}`} />
            )}
            {flightData.flight_return && (
              <Row label="Ritorno" value={`${flightData.flight_return}${flightData.departure_time ? ` · part. ${flightData.departure_time}` : ""}`} />
            )}
          </Section>
        )}

        {selectedServices.length > 0 && (
          <Section icon={Sparkles} title="Servizi aggiuntivi" delay={0.2}>
            {selectedServices.map((s) => (
              <Row key={s.id} label={s.name} value={`€${getServiceTotal(s)}`} />
            ))}
          </Section>
        )}

        <Section icon={Receipt} title="Fatturazione" delay={0.26}>
          <Row label="Intestatario" value={billing.billing_name} />
          <Row label="CF / P.IVA" value={billing.billing_fiscal_code} />
          <Row label="Indirizzo" value={`${billing.billing_address}, ${billing.billing_zip} ${billing.billing_city}`} />
        </Section>

        {notes && (
          <Section icon={MessageSquare} title="Note" delay={0.32}>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed">{notes}</p>
          </Section>
        )}
      </div>

      {/* Price breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="bg-card border border-border/50 px-6 sm:px-7 py-5 mt-4 space-y-2"
      >
        <Row label={`Alloggio (${nights} notti × €${pricePerNight})`} value={`€${accommodationTotal}`} />
        {servicesTotal > 0 && <Row label="Servizi aggiuntivi" value={`€${servicesTotal}`} />}
        <div className="flex justify-between items-baseline pt-3 mt-2 border-t border-border/50">
          <span className="font-sans text-sm font-semibold text-foreground tracking-wide uppercase">Totale</span>
          <span className="font-serif text-2xl text-foreground">€{grandTotal}</span>
        </div>
      </motion.div>

      {/* Pay button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
        whileTap={{ scale: 0.98 }}
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-sans text-[11px] tracking-[0.2em] uppercase px-8 py-5 mt-6 hover:bg-primary/90 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreditCard className="w-4 h-4" strokeWidth={1.5} />
        {isSubmitting ? "Elaborazione in corso..." : "Procedi al pagamento"}
      </motion.button>

      <p className="text-center font-sans text-[10px] text-muted-foreground/60 mt-3 pb-2">
        Il pagamento verrà gestito in modo sicuro tramite Stripe
      </p>
    </motion.div>
  );
};

export default StepRecap;
