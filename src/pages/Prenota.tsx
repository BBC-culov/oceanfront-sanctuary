import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, LogIn } from "lucide-react";
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
  phone: "", email: "", nationality: "", id_type: "id_card", id_card_number: "",
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

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [mainGuest, setMainGuest] = useState<GuestData>(emptyMainGuest);
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuestData[]>([]);
  const [flightData, setFlightData] = useState<FlightData>(emptyFlightData);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [billing, setBilling] = useState<BillingData>(emptyBilling);
  const [noTransfer, setNoTransfer] = useState(false);
  const [flightErrors, setFlightErrors] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check auth
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Auto-fill from user profile
  useEffect(() => {
    if (!user) return;
    const fillFromProfile = async () => {
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
  }, [user]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return differenceInDays(parseISO(checkOut), parseISO(checkIn));
  }, [checkIn, checkOut]);

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

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const { first_name, last_name, date_of_birth, nationality, id_card_number, id_card_issued, id_card_expiry, email, phone } = mainGuest;
      if (!first_name || !last_name || !date_of_birth || !nationality || !id_card_number || !id_card_issued || !id_card_expiry || !email || !phone) {
        toast.error("Compila tutti i campi obbligatori dell'ospite principale");
        // Scroll to the guest section
        document.getElementById("step-guest-data")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (s === 1) {
      if (!noTransfer) {
        const errs: Record<string, boolean> = {};
        const fields: (keyof FlightData)[] = ["airline", "flight_outbound", "arrival_time", "flight_return", "departure_time"];
        let hasError = false;
        for (const f of fields) {
          if (!flightData[f]) {
            errs[f] = true;
            hasError = true;
          }
        }
        if (hasError) {
          setFlightErrors(errs);
          toast.error("Compila tutti i campi del volo oppure seleziona la casella per non usufruire del trasporto");
          document.getElementById("flight-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
          return false;
        }
      }
      setFlightErrors({});
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
          apartment_id: (dbApt as any)?.id || "",
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
        },
      });

      if (error) throw new Error(error.message || "Errore durante la creazione del pagamento");
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("URL di pagamento non ricevuto");
      }
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
