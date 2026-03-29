import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, RotateCcw, Headphones } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const PagamentoFallito = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [deleting, setDeleting] = useState(true);

  // Delete the pending booking on mount
  useEffect(() => {
    const cleanup = async () => {
      if (bookingId) {
        try {
          // Delete additional guests first, then the booking
          await supabase.from("booking_guests").delete().eq("booking_id", bookingId);
          await supabase.from("bookings").delete().eq("id", bookingId).eq("status", "pending");
        } catch (e) {
          console.error("Error cleaning up pending booking:", e);
        }
      }
      setDeleting(false);
    };
    cleanup();
  }, [bookingId]);

  return (
    <PageTransition>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
            className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"
          >
            <XCircle className="w-10 h-10 text-destructive" strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-3">
            <h1 className="font-serif text-2xl sm:text-3xl text-foreground">
              Pagamento non riuscito
            </h1>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Si è verificato un errore durante l'elaborazione del pagamento. 
              La prenotazione non è stata creata. Puoi riprovare o contattare il nostro team di assistenza.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/appartamenti"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-4 hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
              Riprova prenotazione
            </Link>

            <a
              href="https://wa.me/2389573808"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground font-sans text-[11px] tracking-[0.15em] uppercase px-6 py-4 hover:bg-secondary/50 transition-colors"
            >
              <Headphones className="w-4 h-4" strokeWidth={1.5} />
              Richiedi assistenza
            </a>
          </div>

          {deleting && (
            <p className="font-sans text-[10px] text-muted-foreground/50">
              Pulizia in corso...
            </p>
          )}
        </motion.div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default PagamentoFallito;
