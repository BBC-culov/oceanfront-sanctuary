import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeft, CalendarCheck, User, Users, PlaneTakeoff, PlaneLanding,
  Receipt, Sparkles, MessageSquare, Clock, CheckCircle2, XCircle,
  Phone, Mail, MapPin, Building2, CreditCard, Shield, Globe, ChevronRight,
  Link as LinkIcon, Copy, Loader2, Wallet, Plus,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BOOKING_STATUS, getStatusConfig, getPaymentMethodLabel } from "@/lib/bookingStatus";
import RecordManualPaymentDialog from "@/components/admin/RecordManualPaymentDialog";

const Section = ({
  icon: Icon, title, children, delay = 0,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-white border border-border rounded-sm shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/60 bg-secondary/30">
      <Icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
      <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground/70 font-medium">{title}</h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </motion.div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/60 mt-1 flex-shrink-0" strokeWidth={1.5} />}
      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
        <span className="font-sans text-xs text-muted-foreground flex-shrink-0">{label}</span>
        <span className="font-sans text-sm text-foreground font-medium text-right">{value}</span>
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
  const [generatingLink, setGeneratingLink] = useState(false);
  const [balanceLink, setBalanceLink] = useState<string | null>(null);
  const [balanceSessionId, setBalanceSessionId] = useState<string | null>(null);
  const [linkExpiresAt, setLinkExpiresAt] = useState<number | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [manualPayments, setManualPayments] = useState<any[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const reloadBookingAndPayments = async () => {
    if (!id) return;
    const [bRes, mpRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("id", id).single(),
      supabase.from("manual_payments").select("*").eq("booking_id", id).order("created_at", { ascending: false }),
    ]);
    if (bRes.data) setBooking(bRes.data);
    setManualPayments(mpRes.data ?? []);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: b } = await supabase.from("bookings").select("*").eq("id", id!).single();
      if (!b) { navigate("/admin/prenotazioni"); return; }
      setBooking(b);

      // Restore persisted balance link
      const bAny = b as any;
      if (bAny.balance_payment_url && bAny.balance_link_expires_at) {
        setBalanceLink(bAny.balance_payment_url);
        setBalanceSessionId(bAny.balance_session_id || null);
        setLinkExpiresAt(bAny.balance_link_expires_at);
      }

      const [aptRes, guestsRes, mpRes] = await Promise.all([
        supabase.from("apartments").select("name, slug, images").eq("id", bAny.apartment_id).single(),
        supabase.from("booking_guests").select("*").eq("booking_id", bAny.id),
        supabase.from("manual_payments").select("*").eq("booking_id", bAny.id).order("created_at", { ascending: false }),
      ]);
      setApartment(aptRes.data);
      setGuests(guestsRes.data ?? []);
      setManualPayments(mpRes.data ?? []);
      setLoading(false);
    };
    fetchData();
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
      <div className="space-y-4 max-w-4xl">
        <div className="h-8 w-48 bg-muted/40 animate-pulse rounded-sm" />
        <div className="h-40 bg-muted/40 animate-pulse rounded-sm" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 bg-muted/40 animate-pulse rounded-sm" />
          <div className="h-64 bg-muted/40 animate-pulse rounded-sm" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const nights = differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
  const sc = getStatusConfig(booking.status);
  const StatusIcon = sc.icon;
  const services: any[] = booking.selected_services || [];
  const aptImage = apartment?.images?.[0] || "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-5 max-w-4xl"
    >
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/admin/prenotazioni")}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Torna alle prenotazioni
      </motion.button>

      {/* Hero header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white border border-border rounded-sm shadow-sm overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row">
          {aptImage && (
            <img src={aptImage} alt={apartment?.name} className="w-full sm:w-48 h-36 sm:h-auto object-cover flex-shrink-0" />
          )}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                  Prenotazione <span className="font-semibold text-foreground/80">#{booking.booking_code}</span>
                </p>
                <h1 className="font-serif text-2xl text-foreground mt-1 leading-tight">
                  {booking.guest_name} {booking.guest_last_name || ""}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="font-sans text-sm">{apartment?.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <CalendarCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span className="font-sans text-sm">
                    {format(new Date(booking.check_in), "d MMM", { locale: it })}
                    <ChevronRight className="w-3 h-3 inline mx-0.5" />
                    {format(new Date(booking.check_out), "d MMM yyyy", { locale: it })}
                    <span className="text-primary font-medium ml-1.5">({nights} notti)</span>
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1.5 px-3 py-2 rounded-sm border ${sc.bg} ${sc.border}`}>
                <StatusIcon className={`w-4 h-4 ${sc.text}`} strokeWidth={1.5} />
                <span className={`font-sans text-xs tracking-wide uppercase font-semibold ${sc.text}`}>{sc.label}</span>
              </div>
            </div>

            {/* Status actions */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50 flex-wrap">
              <span className="font-sans text-[10px] tracking-wide uppercase text-muted-foreground mr-1">Stato:</span>
              <p className="font-sans text-xs text-muted-foreground italic flex-1">{sc.description}</p>
              <select
                value={booking.status}
                onChange={(e) => updateStatus(e.target.value)}
                className="h-8 rounded-sm border border-border/60 bg-white px-2.5 text-[11px] font-sans cursor-pointer hover:border-primary/50 transition-colors"
              >
                {Object.entries(BOOKING_STATUS).map(([val, cfg]) => (
                  <option key={val} value={val}>{cfg.label}</option>
                ))}
              </select>
              {booking.status === "awaiting_verification" && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateStatus("confirmed")}
                  className="font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-sm bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Conferma pagamento
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main guest */}
        <Section icon={User} title="Ospite principale" delay={0.08}>
          <div className="space-y-0">
            <InfoRow icon={User} label="Nome" value={`${booking.guest_name} ${booking.guest_last_name || ""}`} />
            <InfoRow icon={Mail} label="Email" value={booking.guest_email} />
            <InfoRow icon={Phone} label="Telefono" value={booking.guest_phone} />
            <InfoRow icon={CalendarCheck} label="Nascita" value={booking.guest_date_of_birth ? format(new Date(booking.guest_date_of_birth), "d MMMM yyyy", { locale: it }) : null} />
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
              <InfoRow label="Emissione" value={booking.guest_id_card_issued ? format(new Date(booking.guest_id_card_issued), "d MMM yyyy", { locale: it }) : null} />
              <InfoRow label="Scadenza" value={booking.guest_id_card_expiry ? format(new Date(booking.guest_id_card_expiry), "d MMM yyyy", { locale: it }) : null} />
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
              {guests.map((g: any, i: number) => (
                <div key={g.id} className="p-3.5 bg-secondary/40 border border-border/30 rounded-sm">
                  <p className="font-sans text-sm font-medium text-foreground mb-2">
                    {g.first_name} {g.last_name}
                  </p>
                  <div className="space-y-0">
                    <InfoRow label="Nascita" value={g.date_of_birth ? format(new Date(g.date_of_birth), "d MMM yyyy", { locale: it }) : null} />
                    <InfoRow label="Nazionalità" value={g.nationality} />
                    <InfoRow label="Tipo documento" value={g.id_type === "passport" ? "Passaporto" : "Carta d'identità"} />
                    <InfoRow label="N° documento" value={g.id_card_number} />
                    <InfoRow label="Emissione" value={g.id_card_issued ? format(new Date(g.id_card_issued), "d MMM yyyy", { locale: it }) : null} />
                    <InfoRow label="Scadenza" value={g.id_card_expiry ? format(new Date(g.id_card_expiry), "d MMM yyyy", { locale: it }) : null} />
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

      {/* Total + Payment status */}
      {booking.total_price && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42 }}
          className="bg-white border border-border rounded-sm shadow-sm px-6 py-5 space-y-4"
        >
          <div className="flex justify-between items-baseline">
            <span className="font-sans text-sm font-semibold text-foreground tracking-wide uppercase">Totale</span>
            <span className="font-serif text-3xl text-primary">€{booking.total_price}</span>
          </div>

          {/* Payment details */}
          {booking.amount_paid > 0 && (
            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-sans text-sm text-muted-foreground">Caparra versata</span>
                <span className="font-sans text-sm font-medium text-emerald-600">€{booking.amount_paid}</span>
              </div>
              {booking.amount_paid >= booking.total_price ? (
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="font-sans text-sm font-bold text-emerald-700 uppercase tracking-wide">Prenotazione saldata</span>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm font-semibold text-foreground">Saldo rimanente</span>
                  <span className="font-sans text-sm font-semibold text-amber-600">
                    €{Math.round((booking.total_price - booking.amount_paid) * 100) / 100}
                  </span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Generate / show payment link — for confirmed (balance) or pending (manual booking with deposit/full link) */}
      {booking.total_price && booking.amount_paid < booking.total_price && booking.status !== "cancelled" && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.46 }}
          className="bg-white border-2 border-primary/30 rounded-sm shadow-sm px-6 py-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-sans text-sm font-semibold text-foreground">
                {booking.status === "pending" && booking.amount_paid === 0
                  ? (booking.payment_type === "full" ? "Link pagamento totale" : "Link caparra prenotazione")
                  : "Saldo prenotazione"}
              </h3>
              <p className="font-sans text-xs text-muted-foreground">
                {booking.status === "pending" && booking.amount_paid === 0
                  ? `Link Stripe da inviare al cliente per ${booking.payment_type === "full" ? "saldare l'intero importo" : "versare la caparra"} di €${booking.payment_type === "full" ? booking.total_price : Math.round(booking.total_price * 0.2 * 100) / 100}`
                  : `Genera un link di pagamento Stripe da inviare al cliente per saldare €${Math.round((booking.total_price - booking.amount_paid) * 100) / 100}`}
              </p>
            </div>
          </div>

          {(() => {
            const isExpired = linkExpiresAt ? Date.now() / 1000 > linkExpiresAt : false;
            
            return balanceLink ? (
            <div className="space-y-3">
              {isExpired ? (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-sm">
                  <XCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-sans text-xs font-semibold text-destructive">Link scaduto</p>
                    <p className="font-sans text-[10px] text-destructive/80">
                      Il link di pagamento è scaduto il {new Date(linkExpiresAt! * 1000).toLocaleString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}. È necessario rigenerarne uno nuovo.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 p-3 bg-secondary/50 border border-border/60 rounded-sm">
                    <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    <input
                      type="text"
                      readOnly
                      value={balanceLink}
                      className="flex-1 bg-transparent text-xs font-mono text-foreground border-none outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(balanceLink);
                        toast({ title: "Link copiato!", description: "Puoi inviarlo al cliente." });
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-sm hover:bg-primary/90 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copia
                    </button>
                  </div>

                  {/* Expiry info */}
                  {linkExpiresAt && (
                    <p className="font-sans text-[10px] text-muted-foreground">
                      Il link scade il {new Date(linkExpiresAt * 1000).toLocaleString("it-IT", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}. 
                      Dopo la scadenza sarà necessario generarne uno nuovo.
                    </p>
                  )}
                </>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {/* Send email button — hidden when expired */}
                {!isExpired && (
                  !emailSent ? (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      disabled={sendingEmail}
                      onClick={async () => {
                        setSendingEmail(true);
                        try {
                          const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
                            body: { booking_id: booking.id, action: "send_email", payment_link: balanceLink },
                          });
                          if (error) throw error;
                          if (data?.error) throw new Error(data.error);
                          setEmailSent(true);
                          toast({ title: "Email inviata!", description: `Email con link di pagamento inviata a ${booking.guest_email}` });
                        } catch (e: any) {
                          toast({ title: "Errore invio email", description: e.message || "Errore nell'invio dell'email", variant: "destructive" });
                        } finally {
                          setSendingEmail(false);
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-sans text-xs font-semibold uppercase tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {sendingEmail ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Invio in corso...
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5" />
                          Invia email automatica
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-sans text-xs font-semibold uppercase tracking-wide rounded-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Email inviata a {booking.guest_email}
                    </div>
                  )
                )}

                {/* Regenerate button */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  disabled={generatingLink}
                  onClick={async () => {
                    setGeneratingLink(true);
                    setEmailSent(false);
                    try {
                      const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
                        body: { booking_id: booking.id, expire_session_id: balanceSessionId },
                      });
                      if (error) throw error;
                      if (data?.error) throw new Error(data.error);
                      setBalanceLink(data.url);
                      setBalanceSessionId(data.session_id);
                      setLinkExpiresAt(data.expires_at);
                      toast({ title: "Link rigenerato!", description: "Il link precedente è stato invalidato. Nuovo link valido per 24 ore." });
                    } catch (e: any) {
                      toast({ title: "Errore", description: e.message || "Errore nella rigenerazione del link", variant: "destructive" });
                    } finally {
                      setGeneratingLink(false);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 font-sans text-xs font-semibold uppercase tracking-wide rounded-sm transition-colors disabled:opacity-50 ${
                    isExpired
                      ? "flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border text-foreground hover:bg-secondary/50"
                  }`}
                >
                  {generatingLink ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <LinkIcon className="w-3.5 h-3.5" />
                      {isExpired ? "Genera nuovo link" : "Rigenera"}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={generatingLink}
              onClick={async () => {
                setGeneratingLink(true);
                try {
                  const { data, error } = await supabase.functions.invoke("create-balance-payment-link", {
                    body: { booking_id: booking.id },
                  });
                  if (error) throw error;
                  if (data?.error) throw new Error(data.error);
                  setBalanceLink(data.url);
                  setBalanceSessionId(data.session_id);
                  setLinkExpiresAt(data.expires_at);
                  toast({ title: "Link generato!", description: "Copialo e invialo al cliente." });
                } catch (e: any) {
                  toast({ title: "Errore", description: e.message || "Errore nella generazione del link", variant: "destructive" });
                } finally {
                  setGeneratingLink(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground font-sans text-sm font-semibold uppercase tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {generatingLink ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generazione in corso...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  SALDA PRENOTAZIONE
                </>
              )}
            </motion.button>
          )})()}
        </motion.div>
      )}

      {/* Manual offline payments */}
      {booking.total_price && booking.status !== "cancelled" && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5 }}
          className="bg-white border border-border rounded-sm shadow-sm overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/60 bg-secondary/30">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-4 h-4 text-primary" strokeWidth={1.5} />
              <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground/70 font-medium">
                Pagamenti offline ({manualPayments.length})
              </h3>
            </div>
            {booking.amount_paid < booking.total_price && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setPaymentDialogOpen(true)}
                className="flex items-center gap-1.5 font-sans text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
              >
                <Plus className="w-3 h-3" />
                Registra pagamento
              </motion.button>
            )}
          </div>
          <div className="p-5">
            {manualPayments.length === 0 ? (
              <p className="font-sans text-sm text-muted-foreground/60 italic text-center py-3">
                Nessun pagamento offline registrato.
                {booking.amount_paid < booking.total_price && " Usa il pulsante in alto per registrare contanti, bonifici o altri pagamenti ricevuti fuori da Stripe."}
              </p>
            ) : (
              <div className="divide-y divide-border/30">
                {manualPayments.map((p) => (
                  <div key={p.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-sans text-sm font-semibold text-foreground">€{p.amount}</span>
                        <span className="font-sans text-[10px] tracking-wide uppercase px-1.5 py-0.5 rounded-sm bg-secondary text-muted-foreground">
                          {getPaymentMethodLabel(p.method, p.custom_method)}
                        </span>
                      </div>
                      {p.notes && (
                        <p className="font-sans text-xs text-muted-foreground mt-1 italic">{p.notes}</p>
                      )}
                    </div>
                    <span className="font-sans text-[10px] text-muted-foreground/60 flex-shrink-0">
                      {format(new Date(p.created_at), "d MMM yyyy, HH:mm", { locale: it })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      <RecordManualPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        bookingId={booking.id}
        totalPrice={booking.total_price ?? 0}
        amountPaid={booking.amount_paid ?? 0}
        onRecorded={reloadBookingAndPayments}
      />

      {/* Meta */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="font-sans text-[10px] text-muted-foreground/40 text-center pb-4"
      >
        Creata il {format(new Date(booking.created_at), "d MMMM yyyy 'alle' HH:mm", { locale: it })}
      </motion.p>
    </motion.div>
  );
};

export default AdminPrenotazioneDetail;
