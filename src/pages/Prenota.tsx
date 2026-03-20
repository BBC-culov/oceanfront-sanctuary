import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BookingStepIndicator from "@/components/booking/BookingStepIndicator";
import StepGuestData, { type GuestData, type AdditionalGuestData } from "@/components/booking/StepGuestData";
import StepFlightServices, { type FlightData } from "@/components/booking/StepFlightServices";
import StepBilling, { type BillingData } from "@/components/booking/StepBilling";
import StepRecap from "@/components/booking/StepRecap";

import staticApartments from "@/data/apartments";
import { useApartmentBySlug } from "@/hooks/useApartments";
import { useAdditionalServices } from "@/hooks/useAdditionalServices";
import { supabase } from "@/integrations/supabase/client";

const emptyMainGuest: GuestData = {
  first_name: "", last_name: "", date_of_birth: "", place_of_birth: "",
  phone: "", email: "", nationality: "", id_card_number: "",
  id_card_issued: "", id_card_expiry: "",
};

const emptyFlightData: FlightData = {
  flight_outbound: "", flight_return: "", arrival_time: "", departure_time: "", airline: "",
};

const emptyBilling: BillingData = {
  billing_name: "", billing_address: "", billing_city: "",
  billing_zip: "", billing_country: "", billing_fiscal_code: "",
};

const Prenota = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("apt");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  const { data: dbApt } = useApartmentBySlug(slug);
  const staticApt = staticApartments.find((a) => a.slug === slug);
  const apt = dbApt || staticApt;

  const { data: services = [] } = useAdditionalServices();

  const [step, setStep] = useState(0);
  const [mainGuest, setMainGuest] = useState<GuestData>(emptyMainGuest);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuestData[]>([]);
  const [flightData, setFlightData] = useState<FlightData>(emptyFlightData);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [billing, setBilling] = useState<BillingData>(emptyBilling);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    const fillFromProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setMainGuest((prev) => ({
          ...prev,
          first_name: prev.first_name || profile.first_name || "",
          last_name: prev.last_name || profile.last_name || "",
          phone: prev.phone || profile.phone || "",
          email: prev.email || user.email || "",
        }));
      } else {
        setMainGuest((prev) => ({
          ...prev,
          email: prev.email || user.email || "",
        }));
      }
    };
    fillFromProfile();
  }, []);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(parseISO(checkOut), parseISO(checkIn));
  }, [checkIn, checkOut]);

  if (!slug || !checkIn || !checkOut || !apt || nights <= 0) {
    return <Navigate to="/appartamenti" replace />;
  }

  const pricePerNight = (dbApt as any)?.price_per_night ?? 0;

  const cover = apt.gallery?.[0] || apt.cover;

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const { first_name, last_name, date_of_birth, nationality, id_card_number, id_card_issued, id_card_expiry, email, phone } = mainGuest;
      if (!first_name || !last_name || !date_of_birth || !nationality || !id_card_number || !id_card_issued || !id_card_expiry || !email || !phone) {
        toast.error("Compila tutti i campi obbligatori dell'ospite principale");
        return false;
      }
      for (let i = 0; i < additionalGuests.length; i++) {
        const g = additionalGuests[i];
        if (!g.first_name || !g.last_name || !g.date_of_birth || !g.nationality || !g.id_card_number || !g.id_card_issued || !g.id_card_expiry) {
          toast.error(`Compila tutti i campi dell'ospite ${i + 2}`);
          return false;
        }
      }
      return true;
    }
    if (s === 2) {
      const { billing_name, billing_address, billing_city, billing_zip, billing_country, billing_fiscal_code } = billing;
      if (!billing_name || !billing_address || !billing_city || !billing_zip || !billing_country || !billing_fiscal_code) {
        toast.error("Compila tutti i dati di fatturazione");
        return false;
      }
      return true;
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(s + 1, 3));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const selectedServicesData = services
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => ({ id: s.id, name: s.name, price: s.price }));

      const { data: booking, error } = await supabase
        .from("bookings")
        .insert({
          apartment_id: (dbApt as any)?.id || "",
          check_in: checkIn,
          check_out: checkOut,
          guest_name: mainGuest.first_name,
          guest_email: mainGuest.email,
          guest_phone: mainGuest.phone,
          guest_last_name: mainGuest.last_name,
          guest_date_of_birth: mainGuest.date_of_birth,
          guest_place_of_birth: mainGuest.place_of_birth,
          guest_nationality: mainGuest.nationality,
          guest_id_card_number: mainGuest.id_card_number,
          guest_id_card_issued: mainGuest.id_card_issued,
          guest_id_card_expiry: mainGuest.id_card_expiry,
          flight_outbound: flightData.flight_outbound,
          flight_return: flightData.flight_return,
          arrival_time: flightData.arrival_time,
          departure_time: flightData.departure_time,
          billing_name: billing.billing_name,
          billing_address: billing.billing_address,
          billing_city: billing.billing_city,
          billing_zip: billing.billing_zip,
          billing_country: billing.billing_country,
          billing_fiscal_code: billing.billing_fiscal_code,
          selected_services: selectedServicesData as any,
          notes,
          user_id: user?.id || null,
          status: "pending",
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Insert additional guests
      if (additionalGuests.length > 0 && booking) {
        const { error: guestsError } = await supabase
          .from("booking_guests")
          .insert(
            additionalGuests.map((g) => ({
              booking_id: (booking as any).id,
              first_name: g.first_name,
              last_name: g.last_name,
              date_of_birth: g.date_of_birth,
              nationality: g.nationality,
              id_card_number: g.id_card_number,
              id_card_issued: g.id_card_issued,
              id_card_expiry: g.id_card_expiry,
            })) as any
          );
        if (guestsError) console.error("Error inserting guests:", guestsError);
      }

      toast.success("Prenotazione creata con successo! Il pagamento verrà configurato a breve.");
      navigate(`/appartamenti/${slug}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Errore durante la prenotazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
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
          {step < 3 && (
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

              <motion.button
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={nextStep}
                className="flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg"
              >
                Avanti
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

export default Prenota;
