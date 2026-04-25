import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { it } from "date-fns/locale";
import {
  ArrowLeft, CalendarCheck, Building2, Users, PlaneTakeoff, PlaneLanding,
  Receipt, Clock, CheckCircle2, XCircle, Phone, Mail, MapPin,
  CreditCard, Headphones, MessageCircle, Sparkles, AlertTriangle, Ban,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { getStatusConfig } from "@/lib/bookingStatus";

const Section = ({
  icon: Icon, title, children, delay = 0,
}: {
  icon: React.ElementType; title: string; children: React.ReactNode; delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
  >
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-secondary/20">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
      </div>
      <h3 className="font-sans text-[11px] tracking-[0.15em] uppercase text-foreground/70 font-medium">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </motion.div>
);

const InfoRow = ({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string | null | undefined }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/15 last:border-0">
      {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" strokeWidth={1.5} />}
      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-4">
        <span className="font-sans text-xs text-muted-foreground">{label}</span>
        <span className="font-sans text-sm text-foreground font-medium text-right">{value}</span>
      </div>
    </div>
  );
};

const PrenotazioneDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [apartment, setApartment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelStep, setCancelStep] = useState(0); // 0=hidden, 1=warning, 2=confirm, 3=processing
  const [cancelConfirmText, setCancelConfirmText] = useState("");

  // Handle payment success redirects
  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success" && id) {
      navigate(`/prenotazione-successo/${id}?payment=success`, { replace: true });
      return;
    }
    // Map admin-generated link returns + balance returns to a confirm type
    const confirmTypeMap: Record<string, "initial" | "balance" | "full"> = {
      balance_success: "balance",
      deposit_success: "initial",
      full_success: "full",
    };
    const confirmType = payment ? confirmTypeMap[payment] : undefined;
    if (confirmType && id) {
      const run = async () => {
        try {
          await supabase.functions.invoke("confirm-booking-payment", {
            body: { booking_id: id, type: confirmType },
          });
          toast.success(
            confirmType === "balance"
              ? "Saldo pagato con successo!"
              : "Pagamento ricevuto con successo!"
          );
          // Reload booking data
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            const { data: b } = await supabase
              .from("bookings")
              .select("*")
              .eq("id", id)
              .eq("user_id", session.user.id)
              .single();
            if (b) setBooking(b);
          }
        } catch (e) {
          console.error("Confirm error:", e);
        }
        // Clean URL
        setSearchParams({}, { replace: true });
      };
      run();
    }
  }, [searchParams, id, navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/registrati"); return; }

      const { data: b } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id!)
        .eq("user_id", session.user.id)
        .single();

      if (!b) { navigate("/profilo#prenotazioni"); return; }
      setBooking(b);

      const { data: apt } = await supabase
        .from("apartments")
        .select("name, slug, images, address")
        .eq("id", b.apartment_id)
        .single();
      setApartment(apt);
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <PageTransition>
        <Navbar />
        <main className="pt-28 pb-24 flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!booking) return null;

  const status = getStatusConfig(booking.status);
  const StatusIcon = status.icon;
  const nights = differenceInDays(new Date(booking.check_out), new Date(booking.check_in));
  const services: { name: string; price: number }[] = Array.isArray(booking.selected_services) ? booking.selected_services : [];
  const coverImg = apartment?.images?.[0] ?? null;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link
              to="/profilo#prenotazioni"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Le mie prenotazioni
            </Link>
          </motion.div>

          {/* Hero card with cover + status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
          >
            {coverImg && (
              <div className="relative h-44 sm:h-56 overflow-hidden">
                <img
                  src={coverImg}
                  alt={apartment?.name || "Appartamento"}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5">
                  <p className="font-serif text-xl sm:text-2xl text-white drop-shadow-lg">
                    {apartment?.name || "Appartamento"}
                  </p>
                  {apartment?.address && (
                    <p className="font-sans text-xs text-white/80 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {apartment.address}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="p-5">
              {!coverImg && (
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  <h1 className="font-serif text-2xl text-foreground">{apartment?.name || "Appartamento"}</h1>
                </div>
              )}
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} ${status.text} border ${status.border}`}>
                  <StatusIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="font-sans text-sm font-medium">{status.label}</span>
                </div>
                {booking.booking_code && (
                  <span className="font-mono text-xs tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                    #{booking.booking_code}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Check-in</p>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {format(new Date(booking.check_in), "d MMMM yyyy", { locale: it })}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Check-out</p>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {format(new Date(booking.check_out), "d MMMM yyyy", { locale: it })}
                  </p>
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Durata</p>
                  <p className="font-sans text-sm font-medium text-foreground">{nights} notti</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Guest info */}
          <Section icon={Users} title="Dati ospite" delay={0.15}>
            <div className="space-y-0">
              <InfoRow label="Nome" value={`${booking.guest_name} ${booking.guest_last_name || ""}`} />
              <InfoRow icon={Mail} label="Email" value={booking.guest_email} />
              <InfoRow icon={Phone} label="Telefono" value={booking.guest_phone} />
              <InfoRow label="Nazionalità" value={booking.guest_nationality} />
              <InfoRow label="Data di nascita" value={booking.guest_date_of_birth ? format(new Date(booking.guest_date_of_birth), "d MMMM yyyy", { locale: it }) : null} />
              <InfoRow label="Luogo di nascita" value={booking.guest_place_of_birth} />
            </div>
          </Section>

          {/* Flight info */}
          {(booking.flight_outbound || booking.flight_return) && (
            <Section icon={PlaneTakeoff} title="Informazioni volo" delay={0.25}>
              <div className="space-y-0">
                <InfoRow icon={PlaneTakeoff} label="Volo andata" value={booking.flight_outbound} />
                <InfoRow icon={PlaneLanding} label="Volo ritorno" value={booking.flight_return} />
                <InfoRow icon={Clock} label="Orario arrivo" value={booking.arrival_time} />
                <InfoRow icon={Clock} label="Orario partenza" value={booking.departure_time} />
              </div>
            </Section>
          )}

          {/* Services */}
          {services.length > 0 && (
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
          )}

          {/* Billing */}
          {booking.billing_name && (
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
          )}

          {/* Price summary */}
          {booking.total_price && (
            <Section icon={Receipt} title="Riepilogo costi" delay={0.5}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-sm text-muted-foreground">Totale soggiorno ({nights} notti)</span>
                  <span className="font-serif text-xl font-medium text-foreground">€{booking.total_price}</span>
                </div>
                {booking.amount_paid >= booking.total_price ? (
                  <div className="flex items-center gap-2 pt-3 border-t border-border/30">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-sans text-sm font-semibold text-emerald-700">Prenotazione saldata completamente</span>
                  </div>
                ) : (booking as any).payment_type === "deposit" ? (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t border-border/30">
                      <span className="font-sans text-sm text-muted-foreground">Caparra versata</span>
                      <span className="font-sans text-sm font-medium text-emerald-600">€{(booking as any).amount_paid || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-sans text-sm font-semibold text-foreground">Saldo rimanente</span>
                      <span className="font-sans text-sm font-semibold text-foreground">
                        €{Math.round((booking.total_price - ((booking as any).amount_paid || 0)) * 100) / 100}
                      </span>
                    </div>
                  </>
                ) : (booking as any).amount_paid > 0 ? (
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="font-sans text-sm text-muted-foreground">Pagato</span>
                    <span className="font-sans text-sm font-medium text-emerald-600">€{(booking as any).amount_paid}</span>
                  </div>
                ) : null}
              </div>
            </Section>
          )}

          {/* Remaining balance info (no pay button) */}
          {(booking.status === "confirmed" || booking.status === "awaiting_verification") && (booking as any).payment_type === "deposit" && booking.amount_paid < booking.total_price && (() => {
            const remaining = Math.round((booking.total_price - ((booking as any).amount_paid || 0)) * 100) / 100;
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="bg-primary/5 border border-primary/20 rounded-2xl shadow-sm overflow-hidden"
              >
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <CreditCard className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-sans text-sm text-muted-foreground">Saldo rimanente</p>
                    <p className="font-serif text-2xl text-foreground font-medium">€{remaining}</p>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    La contatteremo per organizzare il pagamento del saldo finale prima del check-in.
                  </p>
                </div>
              </motion.div>
            );
          })()}

          {/* Notes */}
          {booking.notes && (
            <Section icon={MessageCircle} title="Note" delay={0.55}>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{booking.notes}</p>
            </Section>
          )}

          {/* Cancel booking */}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.58 }}
              className="bg-card border border-destructive/30 rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <AnimatePresence mode="wait">
                  {cancelStep === 0 && (
                    <motion.div
                      key="step0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center"
                    >
                      <button
                        onClick={() => setCancelStep(1)}
                        className="inline-flex items-center gap-2 text-destructive/70 hover:text-destructive transition-colors font-sans text-sm"
                      >
                        <Ban className="w-4 h-4" />
                        Annulla prenotazione
                      </button>
                    </motion.div>
                  )}

                  {cancelStep === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-sans text-sm font-semibold text-amber-800">Attenzione: conseguenze dell'annullamento</p>
                          <ul className="font-sans text-sm text-amber-700 space-y-1.5 list-disc list-inside">
                            <li><strong>La caparra del 20% non è rimborsabile</strong> in nessun caso.</li>
                            <li>Per il rimborso del saldo rimanente, si applica la nostra <Link to="/refund-policy" className="underline font-medium hover:text-amber-900" target="_blank">Refund Policy</Link>.</li>
                            <li>Per richiedere il rimborso del saldo, dovrai contattare l'assistenza.</li>
                            <li>L'annullamento è <strong>irreversibile</strong>.</li>
                          </ul>
                        </div>
                      </div>

                      {booking.amount_paid > 0 && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                          <div className="font-sans text-sm text-red-700 space-y-1">
                            <p><strong>Riepilogo economico:</strong></p>
                            <p>Caparra versata (non rimborsabile): <strong>€{booking.deposit_amount || Math.round(booking.total_price * 0.2 * 100) / 100}</strong></p>
                            {booking.amount_paid > (booking.deposit_amount || booking.total_price * 0.2) && (
                              <p>Saldo versato (rimborsabile secondo policy): <strong>€{Math.round((booking.amount_paid - (booking.deposit_amount || booking.total_price * 0.2)) * 100) / 100}</strong></p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => setCancelStep(0)}
                          className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Indietro
                        </button>
                        <button
                          onClick={() => setCancelStep(2)}
                          className="px-5 py-2 bg-destructive/10 text-destructive rounded-lg font-sans text-sm font-medium hover:bg-destructive/20 transition-colors"
                        >
                          Ho capito, continua
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {cancelStep === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2">
                          <p className="font-sans text-sm font-semibold text-red-800">Conferma finale</p>
                          <p className="font-sans text-sm text-red-700">
                            Per confermare l'annullamento, digita <strong>ANNULLA</strong> nel campo sottostante.
                          </p>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={cancelConfirmText}
                        onChange={(e) => setCancelConfirmText(e.target.value.toUpperCase())}
                        placeholder='Digita "ANNULLA"'
                        className="w-full px-4 py-3 rounded-lg bg-muted/50 border border-border text-foreground text-sm font-sans placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive/50 transition-all"
                      />

                      <div className="flex gap-3 justify-end">
                        <button
                          onClick={() => { setCancelStep(1); setCancelConfirmText(""); }}
                          className="px-4 py-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Indietro
                        </button>
                        <button
                          disabled={cancelConfirmText !== "ANNULLA"}
                          onClick={async () => {
                            setCancelStep(3);
                            try {
                              const { error } = await supabase
                                .from("bookings")
                                .update({ status: "cancelled" as any })
                                .eq("id", booking.id);
                              if (error) throw error;
                              toast.success("Prenotazione annullata. Per il rimborso del saldo, contatta l'assistenza.");
                              window.location.reload();
                            } catch (err: any) {
                              toast.error(err.message || "Errore durante l'annullamento");
                              setCancelStep(2);
                            }
                          }}
                          className="px-5 py-2 bg-destructive text-destructive-foreground rounded-lg font-sans text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-destructive/90"
                        >
                          Annulla prenotazione
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {cancelStep === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-8 h-8 border-2 border-destructive border-t-transparent rounded-full mx-auto mb-3"
                      />
                      <p className="font-sans text-sm text-muted-foreground">Annullamento in corso...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Contact assistance */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden"
          >
            <div className="p-6 sm:p-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Headphones className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="font-serif text-xl text-foreground mb-1">Hai bisogno di assistenza?</h3>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
                  Se hai domande o problemi con la tua prenotazione, il nostro team è pronto ad aiutarti.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <motion.a
                  href="https://wa.me/+393331234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-lg font-sans text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </motion.a>
                <motion.button
                  onClick={() => navigate("/contatti")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-sans text-sm tracking-wider uppercase transition-all duration-300 hover:shadow-lg"
                >
                  <Mail className="w-4 h-4" />
                  Contattaci
                </motion.button>
              </div>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default PrenotazioneDetail;
