import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Home, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { BRAND_CONTACTS } from "@/lib/contacts";

const PrenotazioneSuccesso = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [apartmentName, setApartmentName] = useState("");

  useEffect(() => {
    const confirm = async () => {
      if (!id) return;

      const payment = searchParams.get("payment");
      if (payment === "success") {
        try {
          await supabase.functions.invoke("confirm-booking-payment", {
            body: { booking_id: id, type: "initial" },
          });
        } catch (e) {
          console.error("Confirm error:", e);
        }
      }

      // Load booking data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/registrati"); return; }

      const { data: b } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (!b) { navigate("/profilo"); return; }
      setBooking(b);

      const { data: apt } = await supabase
        .from("apartments")
        .select("name")
        .eq("id", b.apartment_id)
        .single();
      setApartmentName(apt?.name || "Appartamento");

      setConfirming(false);
    };
    confirm();
  }, [id, searchParams, navigate]);

  if (confirming) {
    return (
      <PageTransition>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center px-4 py-24">
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

  const remaining = booking
    ? Math.round((booking.total_price - (booking.amount_paid || booking.deposit_amount || 0)) * 100) / 100
    : 0;

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto"
          >
            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              Prenotazione effettuata con successo!
            </h1>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              La tua prenotazione per <strong className="text-foreground">{apartmentName}</strong> è stata confermata.
            </p>
          </div>

          {/* Prominent contact-promise message */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="bg-secondary/60 border border-border/60 rounded-xl p-6 sm:p-8 space-y-5"
          >
            <p className="font-serif text-xl sm:text-2xl text-foreground leading-snug text-center">
              Verrai contattato per organizzare il pagamento e il saldo finale prima del check-in.
            </p>
            <a
              href={BRAND_CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#1faa55] text-white font-sans text-[11px] tracking-[0.2em] uppercase px-6 py-4 transition-colors rounded-md shadow-md"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
              Scrivici subito su WhatsApp
            </a>
            <p className="font-sans text-[11px] text-muted-foreground text-center">
              Oppure chiama il <a href={`tel:${BRAND_CONTACTS.phoneTel}`} className="text-foreground underline-offset-2 hover:underline">{BRAND_CONTACTS.phoneDisplay}</a>
            </p>
          </motion.div>

          {remaining > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-left space-y-2"
            >
              <p className="font-sans text-sm text-foreground font-medium">Saldo rimanente da pagare</p>
              <p className="font-serif text-3xl text-primary font-medium">€{remaining}</p>
            </motion.div>
          )}

          {booking?.booking_code && (
            <p className="font-sans text-xs text-muted-foreground">
              Codice prenotazione: <span className="font-mono text-primary font-medium tracking-wider">#{booking.booking_code}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to={`/prenotazione/${id}`}
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-4 hover:bg-primary/90 transition-colors"
            >
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
              Vedi dettagli prenotazione
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-4 hover:bg-secondary/50 transition-colors"
            >
              <Home className="w-4 h-4" strokeWidth={1.5} />
              Torna alla home
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default PrenotazioneSuccesso;
