import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import RequestModificationDialog from "@/components/booking/RequestModificationDialog";
import { countNights } from "@/lib/nights";
import { useBookingDetail } from "@/hooks/useBookingDetail";
import { Section } from "@/components/booking-detail/Section";
import BookingHeroCard from "@/components/booking-detail/BookingHeroCard";
import {
  ModificationHistorySection,
  ModificationPaymentCard,
  PendingModificationBanner,
  RequestModificationCta,
} from "@/components/booking-detail/ModificationPanels";
import {
  BillingSection,
  FlightInfoSection,
  GuestInfoSection,
  ServicesSection,
} from "@/components/booking-detail/BookingInfoSections";
import { PriceSummarySection, RemainingBalanceCard } from "@/components/booking-detail/PriceSummarySection";
import CancelBookingCard from "@/components/booking-detail/CancelBookingCard";
import AssistanceCard from "@/components/booking-detail/AssistanceCard";

const PrenotazioneDetail = () => {
  const [modOpen, setModOpen] = useState(false);
  const {
    navigate,
    booking, apartment, loading,
    pendingMod, modHistory,
    payingMod, payModificationDiff,
    reloadBooking, cancelBooking,
  } = useBookingDetail();

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

  const nights = countNights(booking.check_in, booking.check_out);
  const services: { name: string; price: number }[] = Array.isArray(booking.selected_services)
    ? booking.selected_services
    : [];

  const showRemainingBalance =
    (booking.status === "confirmed" || booking.status === "awaiting_verification") &&
    booking.payment_type === "deposit" &&
    booking.amount_paid < booking.total_price;

  return (
    <PageTransition>
      <Seo
        noindex
        title="Dettaglio Prenotazione | BAZHOUSE"
        description="Visualizza i dettagli della tua prenotazione BAZHOUSE: date, ospiti, servizi, pagamenti e richieste di modifica."
      />
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

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

          <BookingHeroCard booking={booking} apartment={apartment} nights={nights} />

          {pendingMod && <PendingModificationBanner pendingMod={pendingMod} />}

          {booking.modification_amount_due > 0 && booking.modification_payment_url && (
            <ModificationPaymentCard booking={booking} paying={payingMod} onPay={payModificationDiff} />
          )}

          {!pendingMod && ["confirmed", "awaiting_verification", "paid"].includes(booking.status) && (
            <RequestModificationCta onOpen={() => setModOpen(true)} />
          )}

          {modHistory.length > 0 && <ModificationHistorySection modHistory={modHistory} />}

          <GuestInfoSection booking={booking} />

          {(booking.flight_outbound || booking.flight_return) && <FlightInfoSection booking={booking} />}

          {services.length > 0 && <ServicesSection services={services} />}

          {booking.billing_name && <BillingSection booking={booking} />}

          {booking.total_price && <PriceSummarySection booking={booking} nights={nights} />}

          {showRemainingBalance && <RemainingBalanceCard booking={booking} />}

          {booking.notes && (
            <Section icon={MessageCircle} title="Note" delay={0.55}>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">{booking.notes}</p>
            </Section>
          )}

          {(booking.status === "pending" || booking.status === "confirmed") && (
            <CancelBookingCard booking={booking} onCancel={cancelBooking} />
          )}

          <AssistanceCard onContact={() => navigate("/contatti")} />

        </div>
      </main>
      <RequestModificationDialog
        open={modOpen}
        onClose={() => setModOpen(false)}
        booking={booking}
        onSubmitted={reloadBooking}
      />
      <Footer />
    </PageTransition>
  );
};

export default PrenotazioneDetail;
