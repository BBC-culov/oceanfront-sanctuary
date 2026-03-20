import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeft, CalendarCheck, User, Users, PlaneTakeoff, PlaneLanding,
  Receipt, Sparkles, MessageSquare, Clock, CheckCircle2, XCircle,
  Phone, Mail, MapPin, Building2, CreditCard, Shield, Globe,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  pending: { label: "In attesa", icon: Clock, bg: "bg-accent/15", text: "text-accent-foreground" },
  confirmed: { label: "Confermata", icon: CheckCircle2, bg: "bg-primary/10", text: "text-primary" },
  cancelled: { label: "Cancellata", icon: XCircle, bg: "bg-destructive/10", text: "text-destructive" },
};

const Section = ({
  icon: Icon, title, children, delay = 0,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card/40 border border-border/50 p-5 sm:p-6 space-y-4"
  >
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-primary/8 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-muted-foreground font-medium">{title}</h3>
    </div>
    {children}
  </motion.div>
);

const Row = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />}
      <div className="flex-1 min-w-0">
        <p className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground/70">{label}</p>
        <p className="font-sans text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const AdminPrenotazioneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [guests, setGuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: b } = await supabase.from("bookings").select("*").eq("id", id!).single();
      if (!b) { navigate("/admin/prenotazioni"); return; }
      setBooking(b);

      const [aptRes, guestsRes] = await Promise.all([
        supabase.from("apartments").select("name, slug, images").eq("id", (b as any).apartment_id).single(),
        supabase.from("booking_guests").select("*").eq("booking_id", (b as any).id),
      ]);
      setApartment(aptRes.data);
      setGuests(guestsRes.data ?? []);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const updateStatus = async (status: string) => {
    const { error } = await supabase.from("bookings").update({ status } as any).eq("id", id!);
    if (error) {
      toast({ title: "Errore", description: error.message, variant: "destructive" });
    } else {
      setBooking((prev: any) => ({ ...prev, status }));
      toast({ title: "Stato aggiornato" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/30 animate-pulse rounded-sm" />
        ))}
      </div>
    );
  }

  if (!booking) return null;

  const nights = differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
  const sc = statusConfig[booking.status] || statusConfig.pending;
  const StatusIcon = sc.icon;
  const services: any[] = booking.selected_services || [];
  const aptImage = apartment?.images?.[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 max-w-3xl"
    >
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate("/admin/prenotazioni")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Torna alle prenotazioni
      </motion.button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-card border border-border/50 overflow-hidden"
      >
        <div className="flex gap-0">
          {aptImage && (
            <img src={aptImage} alt={apartment?.name} className="w-32 sm:w-44 h-auto object-cover flex-shrink-0" />
          )}
          <div className="flex-1 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Prenotazione #{booking.id.slice(0, 8)}
                </p>
                <h1 className="font-serif text-xl sm:text-2xl text-foreground leading-tight">
                  {booking.guest_name} {booking.guest_last_name || ""}
                </h1>
                <p className="font-sans text-xs text-muted-foreground mt-1">
                  {apartment?.name} · {format(new Date(booking.check_in), "d MMM", { locale: it })} → {format(new Date(booking.check_out), "d MMM yyyy", { locale: it })} · {nights} notti
                </p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm ${sc.bg} flex-shrink-0`}>
                <StatusIcon className={`w-3.5 h-3.5 ${sc.text}`} strokeWidth={1.5} />
                <span className={`font-sans text-[11px] tracking-wide uppercase font-medium ${sc.text}`}>{sc.label}</span>
              </div>
            </div>

            {/* Status change */}
            <div className="flex items-center gap-2 mt-4">
              {Object.entries(statusConfig).map(([val, cfg]) => (
                <motion.button
                  key={val}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus(val)}
                  disabled={booking.status === val}
                  className={`font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 border transition-all duration-200 ${
                    booking.status === val
                      ? `${cfg.bg} ${cfg.text} border-transparent`
                      : "border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {cfg.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guest info */}
        <Section icon={User} title="Ospite principale" delay={0.08}>
          <div className="space-y-1">
            <Row icon={User} label="Nome completo" value={`${booking.guest_name} ${booking.guest_last_name || ""}`} />
            <Row icon={Mail} label="Email" value={booking.guest_email} />
            <Row icon={Phone} label="Telefono" value={booking.guest_phone} />
            <Row icon={CalendarCheck} label="Data di nascita" value={booking.guest_date_of_birth ? format(new Date(booking.guest_date_of_birth), "d MMMM yyyy", { locale: it }) : null} />
            <Row icon={MapPin} label="Luogo di nascita" value={booking.guest_place_of_birth} />
            <Row icon={Globe} label="Nazionalità" value={booking.guest_nationality} />
          </div>
          {booking.guest_id_card_number && (
            <div className="pt-3 mt-3 border-t border-border/30">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-3 h-3 text-muted-foreground" strokeWidth={1.5} />
                <span className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground/70">Documento</span>
              </div>
              <Row label="Numero" value={booking.guest_id_card_number} />
              <Row label="Emissione" value={booking.guest_id_card_issued ? format(new Date(booking.guest_id_card_issued), "d MMM yyyy", { locale: it }) : null} />
              <Row label="Scadenza" value={booking.guest_id_card_expiry ? format(new Date(booking.guest_id_card_expiry), "d MMM yyyy", { locale: it }) : null} />
            </div>
          )}
        </Section>

        {/* Flight info */}
        <Section icon={PlaneTakeoff} title="Informazioni volo" delay={0.14}>
          <div className="space-y-1">
            <Row icon={PlaneTakeoff} label="Volo andata" value={booking.flight_outbound} />
            <Row icon={Clock} label="Arrivo stimato" value={booking.arrival_time} />
            <Row icon={PlaneLanding} label="Volo ritorno" value={booking.flight_return} />
            <Row icon={Clock} label="Partenza stimata" value={booking.departure_time} />
          </div>
          {!booking.flight_outbound && !booking.flight_return && (
            <p className="font-sans text-xs text-muted-foreground/50 italic">Nessun dato volo inserito</p>
          )}
        </Section>

        {/* Additional guests */}
        {guests.length > 0 && (
          <Section icon={Users} title={`Ospiti aggiuntivi (${guests.length})`} delay={0.2}>
            <div className="space-y-3">
              {guests.map((g: any, i: number) => (
                <div key={g.id} className="p-3 bg-background/50 border border-border/30 rounded-sm space-y-1">
                  <p className="font-sans text-xs font-medium text-foreground">
                    Ospite {i + 2}: {g.first_name} {g.last_name}
                  </p>
                  <Row label="Data di nascita" value={g.date_of_birth ? format(new Date(g.date_of_birth), "d MMM yyyy", { locale: it }) : null} />
                  <Row label="Nazionalità" value={g.nationality} />
                  <Row label="Documento" value={g.id_card_number} />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Billing */}
        <Section icon={Receipt} title="Fatturazione" delay={0.26}>
          <div className="space-y-1">
            <Row icon={User} label="Intestatario" value={booking.billing_name} />
            <Row icon={CreditCard} label="CF / P.IVA" value={booking.billing_fiscal_code} />
            <Row icon={MapPin} label="Indirizzo" value={booking.billing_address ? `${booking.billing_address}, ${booking.billing_zip || ""} ${booking.billing_city || ""}` : null} />
            <Row icon={Globe} label="Paese" value={booking.billing_country} />
          </div>
          {!booking.billing_name && (
            <p className="font-sans text-xs text-muted-foreground/50 italic">Nessun dato di fatturazione</p>
          )}
        </Section>
      </div>

      {/* Services */}
      {services.length > 0 && (
        <Section icon={Sparkles} title="Servizi aggiuntivi" delay={0.32}>
          <div className="space-y-2">
            {services.map((s: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-1.5">
                <span className="font-sans text-sm text-foreground">{s.name}</span>
                <span className="font-sans text-sm font-semibold text-foreground">€{s.price}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Notes */}
      {booking.notes && (
        <Section icon={MessageSquare} title="Note" delay={0.38}>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed">{booking.notes}</p>
        </Section>
      )}

      {/* Price summary */}
      {booking.total_price && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="bg-card border border-border/50 px-6 py-5 flex justify-between items-baseline"
        >
          <span className="font-sans text-sm font-semibold text-foreground tracking-wide uppercase">Totale prenotazione</span>
          <span className="font-serif text-2xl text-foreground">€{booking.total_price}</span>
        </motion.div>
      )}

      {/* Meta */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-sans text-[10px] text-muted-foreground/50 text-center pb-4"
      >
        Prenotazione creata il {format(new Date(booking.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
      </motion.p>
    </motion.div>
  );
};

export default AdminPrenotazioneDetail;
