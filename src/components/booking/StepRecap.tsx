import { motion } from "framer-motion";
import { format, differenceInDays, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import {
  CalendarCheck, Users, PlaneTakeoff, PlaneLanding,
  Receipt, Sparkles, CreditCard, MapPin,
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

const Section = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="space-y-3"
  >
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
      <h4 className="font-sans text-xs tracking-[0.2em] uppercase text-muted-foreground">{title}</h4>
    </div>
    {children}
  </motion.div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-1.5">
    <span className="font-sans text-sm text-muted-foreground">{label}</span>
    <span className="font-sans text-sm font-medium text-foreground text-right">{value}</span>
  </div>
);

const StepRecap = ({
  apartmentName,
  apartmentImage,
  checkIn,
  checkOut,
  mainGuest,
  additionalGuests,
  flightData,
  selectedServiceIds,
  services,
  billing,
  notes,
  pricePerNight,
  onSubmit,
  isSubmitting,
}: StepRecapProps) => {
  const nights = differenceInDays(parseISO(checkOut), parseISO(checkIn));
  const accommodationTotal = pricePerNight * nights;

  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const getServiceTotal = (s: AdditionalService) =>
    s.name.toLowerCase().includes("noleggio") || s.name.toLowerCase().includes("giorno")
      ? s.price * nights
      : s.price;

  const servicesTotal = selectedServices.reduce((sum, s) => sum + getServiceTotal(s), 0);
  const grandTotal = accommodationTotal + servicesTotal;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Apartment card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex gap-4 p-4 bg-secondary border border-border"
      >
        <img src={apartmentImage} alt={apartmentName} className="w-24 h-24 object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-light text-foreground">{apartmentName}</h3>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <CalendarCheck className="w-3.5 h-3.5" />
            <span className="font-sans text-xs">
              {format(parseISO(checkIn), "d MMM", { locale: it })} → {format(parseISO(checkOut), "d MMM yyyy", { locale: it })}
            </span>
          </div>
          <p className="font-sans text-xs text-primary mt-1 font-medium">{nights} notti</p>
        </div>
      </motion.div>

      <div className="space-y-6 divide-y divide-border">
        {/* Guests */}
        <Section icon={Users} title="Ospiti">
          <div className="space-y-1">
            <Row label="Ospite principale" value={`${mainGuest.first_name} ${mainGuest.last_name}`} />
            {additionalGuests.map((g, i) => (
              <Row key={i} label={`Ospite ${i + 2}`} value={`${g.first_name} ${g.last_name}`} />
            ))}
          </div>
        </Section>

        {/* Flights */}
        {(flightData.flight_outbound || flightData.flight_return) && (
          <Section icon={PlaneTakeoff} title="Voli">
            <div className="space-y-1 pt-2">
              {flightData.flight_outbound && (
                <Row label="Andata" value={`${flightData.flight_outbound}${flightData.arrival_time ? ` — arr. ${flightData.arrival_time}` : ""}`} />
              )}
              {flightData.flight_return && (
                <Row label="Ritorno" value={`${flightData.flight_return}${flightData.departure_time ? ` — part. ${flightData.departure_time}` : ""}`} />
              )}
            </div>
          </Section>
        )}

        {/* Services */}
        {selectedServices.length > 0 && (
          <Section icon={Sparkles} title="Servizi aggiuntivi">
            <div className="space-y-1 pt-2">
              {selectedServices.map((s) => (
                <Row key={s.id} label={s.name} value={`€${getServiceTotal(s)}`} />
              ))}
            </div>
          </Section>
        )}

        {/* Billing */}
        <Section icon={Receipt} title="Fatturazione">
          <div className="space-y-1 pt-2">
            <Row label="Intestatario" value={billing.billing_name} />
            <Row label="CF / P.IVA" value={billing.billing_fiscal_code} />
            <Row label="Indirizzo" value={`${billing.billing_address}, ${billing.billing_zip} ${billing.billing_city}`} />
          </div>
        </Section>

        {/* Notes */}
        {notes && (
          <Section icon={MapPin} title="Note">
            <p className="font-sans text-sm text-muted-foreground pt-2">{notes}</p>
          </Section>
        )}

        {/* Total */}
        <div className="pt-4 space-y-2">
          <Row label={`Alloggio (${nights} notti × €${pricePerNight})`} value={`€${accommodationTotal}`} />
          {servicesTotal > 0 && <Row label="Servizi aggiuntivi" value={`€${servicesTotal}`} />}
          <div className="flex justify-between pt-3 border-t border-border">
            <span className="font-sans text-base font-semibold text-foreground">Totale</span>
            <span className="font-serif text-2xl font-light text-foreground">€{grandTotal}</span>
          </div>
        </div>
      </div>

      {/* Pay button */}
      <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.97 }}
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground font-sans text-xs tracking-[0.2em] uppercase px-8 py-5 hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CreditCard className="w-4 h-4" />
        {isSubmitting ? "Elaborazione..." : "Procedi al pagamento"}
      </motion.button>

      <p className="text-center font-sans text-[10px] text-muted-foreground">
        Il pagamento verrà gestito in modo sicuro tramite Stripe
      </p>
    </motion.div>
  );
};

export default StepRecap;
