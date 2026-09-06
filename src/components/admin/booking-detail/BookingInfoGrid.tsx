import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  User, Users, PlaneTakeoff, PlaneLanding, Receipt, Sparkles, MessageSquare,
  Clock, XCircle, Phone, Mail, MapPin, Building2, CreditCard, Shield, Globe,
  CalendarCheck,
} from "lucide-react";
import { Section, InfoRow } from "./DetailSection";

const fmt = (d?: string | null, pattern = "d MMM yyyy") =>
  d ? format(new Date(d), pattern, { locale: it }) : null;

const BookingInfoGrid = ({ booking, guests }: { booking: any; guests: any[] }) => {
  const services: any[] = booking.selected_services || [];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main guest */}
        <Section icon={User} title="Ospite principale" delay={0.08}>
          <div className="space-y-0">
            <InfoRow icon={User} label="Nome" value={`${booking.guest_name} ${booking.guest_last_name || ""}`} />
            <InfoRow icon={Mail} label="Email" value={booking.guest_email} />
            <InfoRow icon={Phone} label="Telefono" value={booking.guest_phone} />
            <InfoRow icon={CalendarCheck} label="Nascita" value={fmt(booking.guest_date_of_birth, "d MMMM yyyy")} />
            <InfoRow icon={MapPin} label="Luogo nascita" value={booking.guest_place_of_birth} />
            <InfoRow icon={Globe} label="Nazionalità" value={booking.guest_nationality} />
          </div>
          {booking.guest_id_card_number && (
            <div className="mt-4 pt-4 border-t border-border/40">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3.5 h-3.5 text-primary/60" strokeWidth={1.5} />
                <span className="font-sans text-[10px] tracking-[0.12em] uppercase text-muted-foreground font-medium">
                  {booking.guest_id_type === "passport" ? "Passaporto" : "Carta d'identità"}
                </span>
              </div>
              <InfoRow label="Numero" value={booking.guest_id_card_number} />
              <InfoRow label="Emissione" value={fmt(booking.guest_id_card_issued)} />
              <InfoRow label="Scadenza" value={fmt(booking.guest_id_card_expiry)} />
            </div>
          )}
        </Section>

        {/* Flight */}
        <Section icon={PlaneTakeoff} title="Informazioni volo" delay={0.14}>
          {booking.no_transfer ? (
            <div className="flex items-center gap-2 py-4">
              <XCircle className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
              <p className="font-sans text-sm text-amber-700 font-medium">Il cliente non ha richiesto il servizio trasporto A/R Aeroporto</p>
            </div>
          ) : booking.flight_outbound || booking.flight_return ? (
            <div className="space-y-0">
              <InfoRow icon={Building2} label="Compagnia aerea" value={booking.airline} />
              <InfoRow icon={PlaneTakeoff} label="Volo andata" value={booking.flight_outbound} />
              <InfoRow icon={Clock} label="Arrivo stimato" value={booking.arrival_time} />
              <InfoRow icon={PlaneLanding} label="Volo ritorno" value={booking.flight_return} />
              <InfoRow icon={Clock} label="Partenza stimata" value={booking.departure_time} />
            </div>
          ) : (
            <p className="font-sans text-sm text-muted-foreground/50 italic py-4 text-center">Nessun dato volo inserito</p>
          )}
        </Section>

        {/* Additional guests */}
        {guests.length > 0 && (
          <Section icon={Users} title={`Ospiti aggiuntivi (${guests.length})`} delay={0.2}>
            <div className="space-y-3">
              {guests.map((g: any) => (
                <div key={g.id} className="p-3.5 bg-secondary/40 border border-border/30 rounded-sm">
                  <p className="font-sans text-sm font-medium text-foreground mb-2">
                    {g.first_name} {g.last_name}
                  </p>
                  <div className="space-y-0">
                    <InfoRow label="Nascita" value={fmt(g.date_of_birth)} />
                    <InfoRow label="Nazionalità" value={g.nationality} />
                    <InfoRow label="Tipo documento" value={g.id_type === "passport" ? "Passaporto" : "Carta d'identità"} />
                    <InfoRow label="N° documento" value={g.id_card_number} />
                    <InfoRow label="Emissione" value={fmt(g.id_card_issued)} />
                    <InfoRow label="Scadenza" value={fmt(g.id_card_expiry)} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Billing */}
        <Section icon={Receipt} title="Fatturazione" delay={0.26}>
          {booking.billing_name ? (
            <div className="space-y-0">
              <InfoRow icon={User} label="Intestatario" value={booking.billing_name} />
              <InfoRow icon={CreditCard} label="CF / P.IVA" value={booking.billing_fiscal_code} />
              <InfoRow icon={MapPin} label="Indirizzo" value={booking.billing_address ? `${booking.billing_address}, ${booking.billing_zip || ""} ${booking.billing_city || ""}` : null} />
              <InfoRow icon={Globe} label="Paese" value={booking.billing_country} />
            </div>
          ) : (
            <p className="font-sans text-sm text-muted-foreground/50 italic py-4 text-center">Nessun dato di fatturazione</p>
          )}
        </Section>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <Section icon={Sparkles} title="Servizi aggiuntivi" delay={0.32}>
          <div className="divide-y divide-border/30">
            {services.map((s: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2.5">
                <span className="font-sans text-sm text-foreground">{s.name}</span>
                <span className="font-sans text-sm font-semibold text-primary">€{s.price}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Notes */}
      {booking.notes && (
        <Section icon={MessageSquare} title="Note del cliente" delay={0.38}>
          <p className="font-sans text-sm text-foreground/80 leading-relaxed">{booking.notes}</p>
        </Section>
      )}
    </>
  );
};

export default BookingInfoGrid;
