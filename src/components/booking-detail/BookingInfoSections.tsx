import { Clock, CreditCard, Mail, Phone, PlaneLanding, PlaneTakeoff, Sparkles, Users } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { InfoRow, Section } from "./Section";

/** Main guest personal data. */
export const GuestInfoSection = ({ booking }: { booking: any }) => (
  <Section icon={Users} title="Dati ospite" delay={0.15}>
    <div className="space-y-0">
      <InfoRow label="Nome" value={`${booking.guest_name} ${booking.guest_last_name || ""}`} />
      <InfoRow icon={Mail} label="Email" value={booking.guest_email} />
      <InfoRow icon={Phone} label="Telefono" value={booking.guest_phone} />
      <InfoRow label="Nazionalità" value={booking.guest_nationality} />
      <InfoRow
        label="Data di nascita"
        value={booking.guest_date_of_birth ? format(new Date(booking.guest_date_of_birth), "d MMMM yyyy", { locale: it }) : null}
      />
      <InfoRow label="Luogo di nascita" value={booking.guest_place_of_birth} />
    </div>
  </Section>
);

/** Flight and transfer times. */
export const FlightInfoSection = ({ booking }: { booking: any }) => (
  <Section icon={PlaneTakeoff} title="Informazioni volo" delay={0.25}>
    <div className="space-y-0">
      <InfoRow icon={PlaneTakeoff} label="Volo andata" value={booking.flight_outbound} />
      <InfoRow icon={PlaneLanding} label="Volo ritorno" value={booking.flight_return} />
      <InfoRow icon={Clock} label="Orario arrivo" value={booking.arrival_time} />
      <InfoRow icon={Clock} label="Orario partenza" value={booking.departure_time} />
    </div>
  </Section>
);

/** Selected extra services. */
export const ServicesSection = ({ services }: { services: { name: string; price: number }[] }) => (
  <Section icon={Sparkles} title="Servizi aggiuntivi" delay={0.35}>
    <div className="space-y-2">
      {services.map((s, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border/15 last:border-0">
          <span className="font-sans text-sm text-foreground">{s.name}</span>
          <span className="font-sans text-sm font-medium text-foreground">€{s.price}</span>
        </div>
      ))}
    </div>
  </Section>
);

/** Billing details. */
export const BillingSection = ({ booking }: { booking: any }) => (
  <Section icon={CreditCard} title="Dati fatturazione" delay={0.45}>
    <div className="space-y-0">
      <InfoRow label="Intestatario" value={booking.billing_name} />
      <InfoRow label="Indirizzo" value={booking.billing_address} />
      <InfoRow label="Città" value={booking.billing_city} />
      <InfoRow label="CAP" value={booking.billing_zip} />
      <InfoRow label="Paese" value={booking.billing_country} />
      <InfoRow label="Codice fiscale / P.IVA" value={booking.billing_fiscal_code} />
    </div>
  </Section>
);
