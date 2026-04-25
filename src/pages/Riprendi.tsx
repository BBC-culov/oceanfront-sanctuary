import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, AlertTriangle, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

type Status = "loading" | "ok" | "not_found" | "expired";

const Riprendi = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [booking, setBooking] = useState<any>(null);
  const [apartmentSlug, setApartmentSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("not_found");
      return;
    }

    const load = async () => {
      // Lookup the incomplete booking by its resume token
      const { data: bk, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("resume_token", token)
        .eq("status", "incomplete")
        .maybeSingle();

      if (error || !bk) {
        setStatus("not_found");
        return;
      }

      // Lookup apartment slug for the wizard URL
      const { data: apt } = await supabase
        .from("apartments")
        .select("slug")
        .eq("id", bk.apartment_id)
        .maybeSingle();

      if (!apt?.slug) {
        setStatus("not_found");
        return;
      }

      setBooking(bk);
      setApartmentSlug(apt.slug);
      setStatus("ok");
    };

    load();
  }, [token]);

  const handleResume = () => {
    if (!booking || !apartmentSlug) return;
    // Persist booking data so the wizard can pre-fill all fields
    sessionStorage.setItem(
      `booking-resume-${apartmentSlug}`,
      JSON.stringify({ token, booking }),
    );
    navigate(
      `/prenota?apt=${apartmentSlug}&checkIn=${booking.check_in}&checkOut=${booking.check_out}&resume=${token}`,
    );
  };

  return (
    <PageTransition>
      <Navbar />
      <main className="pt-32 pb-24 min-h-[70vh]">
        <div className="mx-auto max-w-xl px-6 text-center">
          {status === "loading" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" strokeWidth={1.5} />
              <p className="font-sans text-sm text-muted-foreground">Recupero della tua prenotazione...</p>
            </motion.div>
          )}

          {status === "not_found" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-3xl font-light text-foreground">
                Link non più valido
              </h1>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Questo link di ripresa non è più disponibile. La prenotazione potrebbe essere già stata completata, cancellata o il periodo di validità è scaduto.
              </p>
              <Link
                to="/appartamenti"
                className="inline-block font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3.5 hover:bg-primary/90 transition-colors"
              >
                Vedi gli appartamenti
              </Link>
            </motion.div>
          )}

          {status === "ok" && booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div>
                <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                  Bentornato
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
                  La tua prenotazione ti aspetta
                </h1>
              </div>

              <div className="bg-secondary/40 border border-border/60 rounded-sm p-6 text-left space-y-3">
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium text-foreground">{booking.check_in}</span>
                </div>
                <div className="flex justify-between font-sans text-sm">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium text-foreground">{booking.check_out}</span>
                </div>
                {booking.guest_name && (
                  <div className="flex justify-between font-sans text-sm">
                    <span className="text-muted-foreground">Ospite</span>
                    <span className="font-medium text-foreground">
                      {booking.guest_name} {booking.guest_last_name || ""}
                    </span>
                  </div>
                )}
              </div>

              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Riprenderai esattamente da dove avevi lasciato. Tutti i dati che avevi inserito sono stati mantenuti.
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResume}
                className="inline-flex items-center gap-3 font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3.5 hover:bg-primary/90 transition-colors"
              >
                Riprendi la prenotazione
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Riprendi;
