import { extractEdgeError } from "@/lib/edgeError";
import { errorMessage } from "@/lib/dataTypes";
import { Link, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn } from "lucide-react";
import { parseISO } from "date-fns";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import Seo from "@/components/Seo";
import BookingStepIndicator from "@/components/booking/BookingStepIndicator";
import StepGuestData, { type GuestData, type AdditionalGuestData } from "@/components/booking/StepGuestData";
import StepFlightServices, { type FlightData } from "@/components/booking/StepFlightServices";
import StepBilling, { type BillingData } from "@/components/booking/StepBilling";
import StepRecap from "@/components/booking/StepRecap";

import { supabase } from "@/integrations/supabase/client";
import { trackCustomEvent } from "@/lib/metaPixel";

import { useBookingWizard } from "@/hooks/useBookingWizard";

const Prenota = () => {
  const { searchParams, navigate, slug, checkIn, checkOut, resumeToken, dbApt, staticApt, apt, services, user, setUser, authLoading, step, setStep, mainGuest, setMainGuest, additionalGuests, setAdditionalGuests, flightData, setFlightData, selectedServices, setSelectedServices, notes, setNotes, billing, setBilling, noTransfer, setNoTransfer, flightErrors, setFlightErrors, isSubmitting, setIsSubmitting, nights, validateStep, nextStep, prevStep } = useBookingWizard();

  if (!slug || !checkIn || !checkOut || !apt || nights <= 0) {
    return <Navigate to="/appartamenti" replace />;
  }

  const pricePerNight = dbApt?.pricePerNight ?? 0;
  const cover = apt.gallery?.[0] || apt.cover;

  // Auth gate: require login
  if (authLoading) {
    return (
      <PageTransition>
        <Navbar />
        <main className="pt-24 pb-24 flex items-center justify-center min-h-[60vh]">
          <p className="font-sans text-sm text-muted-foreground">Caricamento...</p>
        </main>
        <Footer />
      </PageTransition>
    );
  }

  if (!user) {
    const returnUrl = `/appartamenti/${slug}`;
    return (
      <PageTransition>
        <Navbar />
        <main className="pt-24 pb-24">
          <div className="mx-auto max-w-md px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <LogIn className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h1 className="font-serif text-3xl font-light text-foreground">Accedi per prenotare</h1>
              <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                Per completare la prenotazione è necessario accedere al tuo account o registrarti. I tuoi dati verranno compilati automaticamente.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link
                  to={`/registrati?redirect=${encodeURIComponent(returnUrl)}`}
                  className="font-sans text-xs tracking-[0.2em] uppercase bg-primary text-primary-foreground px-8 py-3.5 hover:bg-primary/90 transition-colors"
                >
                  Accedi o Registrati
                </Link>
                <Link
                  to={`/appartamenti/${slug}`}
                  className="font-sans text-xs tracking-[0.2em] uppercase border border-border text-muted-foreground px-8 py-3.5 hover:border-foreground/20 hover:text-foreground transition-colors"
                >
                  Torna all'appartamento
                </Link>
              </div>
            </motion.div>
          </div>
        </main>
        <Footer />
      </PageTransition>
    );
  }


  const handleSubmit = async () => {
    setIsSubmitting(true);
    trackCustomEvent("ClickPrenotaAppartamento", {
      apartment_name: apt?.name,
      check_in: checkIn,
      check_out: checkOut,
      nights,
    });
    try {
      const selectedServicesData = services
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name, price: s.price }));

      // Build services line items for Stripe
      const selectedSvcObjects = services.filter((s) => selectedServices.includes(s.id));
      const servicesLineItems = selectedSvcObjects.map((s) => {
        const isPerNight = s.name.toLowerCase().includes("noleggio") || s.name.toLowerCase().includes("giorno");
        return {
          name: s.name,
          unit_price: s.price,
          quantity: isPerNight ? nights : 1,
        };
      });
      const servicesTotal = servicesLineItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
      const accommodationTotal = pricePerNight * nights;
      const totalPrice = accommodationTotal + servicesTotal;

      const { data, error } = await supabase.functions.invoke("create-booking-payment", {
        body: {
          apartment_id: dbApt?.id || "",
          apartment_name: apt.name,
          check_in: checkIn,
          check_out: checkOut,
          guest_name: mainGuest.first_name,
          guest_email: mainGuest.email,
          guest_phone: mainGuest.phone,
          guest_last_name: mainGuest.last_name,
          guest_date_of_birth: mainGuest.date_of_birth,
          guest_place_of_birth: mainGuest.place_of_birth,
          guest_nationality: mainGuest.nationality,
          guest_id_type: mainGuest.id_type,
          guest_id_card_number: mainGuest.id_card_number,
          guest_id_card_issued: mainGuest.id_card_issued,
          guest_id_card_expiry: mainGuest.id_card_expiry,
          flight_outbound: flightData.flight_outbound,
          flight_return: flightData.flight_return,
          arrival_time: flightData.arrival_time,
          departure_time: flightData.departure_time,
          airline: flightData.airline,
          no_transfer: noTransfer,
          billing_name: billing.billing_name,
          billing_address: billing.billing_address,
          billing_city: billing.billing_city,
          billing_zip: billing.billing_zip,
          billing_country: billing.billing_country,
          billing_fiscal_code: billing.billing_fiscal_code,
          selected_services: selectedServicesData,
          notes,
          additional_guests: additionalGuests,
          price_per_night: pricePerNight,
          nights,
          total_price: totalPrice,
          services_total: servicesTotal,
          services_line_items: servicesLineItems,
          payment_type: "deposit",
        },
      });

      if (error) throw new Error(await extractEdgeError(error, "Errore durante la creazione del pagamento"));
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("URL di pagamento non ricevuto");
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(errorMessage(err) || "Errore durante la prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Seo
        title="Prenota il tuo soggiorno | BAZHOUSE"
        description="Completa la tua prenotazione presso BAZHOUSE: dati ospiti, volo, fatturazione e riepilogo per un soggiorno a Boa Vista, Capo Verde."
      />
      <Navbar />
      <main className="pt-24 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Back link */}
          <Link
            to={`/appartamenti/${slug}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors font-sans text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Torna all'appartamento
          </Link>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="font-sans text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
              Prenotazione
            </p>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground">
              {apt.name}
            </h1>
            <p className="font-sans text-sm text-muted-foreground mt-2">
              {nights} notti • {additionalGuests.length + 1} {additionalGuests.length + 1 === 1 ? "ospite" : "ospiti"}
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mb-12"
          >
            <BookingStepIndicator currentStep={step} />
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <StepGuestData
                key="step-0"
                mainGuest={mainGuest}
                setMainGuest={setMainGuest}
                additionalGuests={additionalGuests}
                setAdditionalGuests={setAdditionalGuests}
                maxGuests={apt.guests}
              />
            )}
            {step === 1 && (
              <StepFlightServices
                key="step-1"
                flightData={flightData}
                setFlightData={setFlightData}
                selectedServices={selectedServices}
                setSelectedServices={setSelectedServices}
                notes={notes}
                setNotes={setNotes}
                nights={nights}
                noTransfer={noTransfer}
                setNoTransfer={setNoTransfer}
                errors={flightErrors}
              />
            )}
            {step === 2 && (
              <StepBilling
                key="step-2"
                billing={billing}
                setBilling={setBilling}
              />
            )}
            {step === 3 && (
              <StepRecap
                key="step-3"
                apartmentName={apt.name}
                apartmentImage={cover}
                checkIn={checkIn!}
                checkOut={checkOut!}
                mainGuest={mainGuest}
                additionalGuests={additionalGuests}
                flightData={flightData}
                selectedServiceIds={selectedServices}
                services={services}
                billing={billing}
                notes={notes}
                pricePerNight={pricePerNight}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
              />
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between mt-10 pt-8 border-t border-border"
          >
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={prevStep}
              disabled={step === 0}
              className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed px-6 py-3 border border-border hover:border-foreground/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Indietro
            </motion.button>

            {step < 3 && (
              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Avanti
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Prenota;
