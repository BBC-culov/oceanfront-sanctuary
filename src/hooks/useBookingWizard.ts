// State, auth, profile autofill, resume-from-link and step validation for the
// 4-step booking wizard (/prenota). Payment submission stays in the page.
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { countNights } from "@/lib/nights";
import type { GuestData, AdditionalGuestData } from "@/components/booking/StepGuestData";
import type { FlightData } from "@/components/booking/StepFlightServices";
import type { BillingData } from "@/components/booking/StepBilling";
import staticApartments from "@/data/apartments";
import { isValidPhone, isValidDocumentNumber, isValidZip, isValidFiscalCode } from "@/lib/bookingValidation";
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


export function useBookingWizard() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get("apt");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const resumeToken = searchParams.get("resume");

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

  // Resume incomplete booking: prefill all wizard state from sessionStorage payload
  useEffect(() => {
    if (!resumeToken || !slug) return;
    const raw = sessionStorage.getItem(`booking-resume-${slug}`);
    if (!raw) return;
    try {
      const { booking: bk } = JSON.parse(raw);
      if (!bk) return;

      setMainGuest({
        first_name: bk.guest_name || "",
        last_name: bk.guest_last_name || "",
        date_of_birth: bk.guest_date_of_birth || "",
        place_of_birth: bk.guest_place_of_birth || "",
        phone: bk.guest_phone || "",
        email: bk.guest_email || "",
        nationality: bk.guest_nationality || "",
        id_type: bk.guest_id_type || "id_card",
        id_card_number: bk.guest_id_card_number || "",
        id_card_issued: bk.guest_id_card_issued || "",
        id_card_expiry: bk.guest_id_card_expiry || "",
      });
      setFlightData({
        flight_outbound: bk.flight_outbound || "",
        flight_return: bk.flight_return || "",
        arrival_time: bk.arrival_time || "",
        departure_time: bk.departure_time || "",
        airline: bk.airline || "",
      });
      setNoTransfer(!!bk.no_transfer);
      setNotes(bk.notes || "");
      setBilling({
        billing_name: bk.billing_name || "",
        billing_address: bk.billing_address || "",
        billing_city: bk.billing_city || "",
        billing_zip: bk.billing_zip || "",
        billing_country: bk.billing_country || "",
        billing_fiscal_code: bk.billing_fiscal_code || "",
      });
      if (Array.isArray(bk.selected_services)) {
        const ids = bk.selected_services
          .map((s: any) => (typeof s === "string" ? s : s?.id))
          .filter(Boolean);
        setSelectedServices(ids);
      }
      // Jump straight to recap so the user can confirm and pay
      setStep(3);
      toast.success("Prenotazione ripristinata: completa il pagamento per confermare");
    } catch (e) {
      console.error("Errore parsing resume payload", e);
    }
  }, [resumeToken, slug]);

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return countNights(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const validateStep = (s: number): boolean => {
    if (s === 0) {
      const { first_name, last_name, date_of_birth, nationality, id_card_number, id_card_issued, id_card_expiry, email, phone } = mainGuest;
      if (!first_name || !last_name || !date_of_birth || !nationality || !id_card_number || !id_card_issued || !id_card_expiry || !email || !phone) {
        toast.error("Compila tutti i campi obbligatori dell'ospite principale");
        document.getElementById("step-guest-data")?.scrollIntoView({ behavior: "smooth", block: "start" });
        return false;
      }
      if (!isValidPhone(phone)) {
        toast.error("Numero di telefono non valido: inserisci solo cifre (6-15 cifre)");
        return false;
      }
      if (!isValidDocumentNumber(id_card_number, mainGuest.id_type)) {
        const docLabel = mainGuest.id_type === "passport" ? "passaporto" : "carta d'identità";
        toast.error(`Numero di ${docLabel} non valido: solo lettere e numeri, ${mainGuest.id_type === "passport" ? "6-9" : "7-9"} caratteri`);
        return false;
      }
      for (let i = 0; i < additionalGuests.length; i++) {
        const g = additionalGuests[i];
        if (!g.first_name || !g.last_name || !g.date_of_birth || !g.nationality || !g.id_card_number || !g.id_card_issued || !g.id_card_expiry) {
          toast.error(`Compila tutti i campi dell'ospite ${i + 2}`);
          return false;
        }
        if (!isValidDocumentNumber(g.id_card_number, g.id_type)) {
          const docLabel = g.id_type === "passport" ? "passaporto" : "carta d'identità";
          toast.error(`Ospite ${i + 2}: numero di ${docLabel} non valido`);
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
      if (!isValidZip(billing_zip)) {
        toast.error("CAP non valido: inserisci solo cifre (3-10 cifre)");
        return false;
      }
      if (!isValidFiscalCode(billing_fiscal_code, billing_country)) {
        toast.error("Tax ID / VAT / P.IVA non valido per il paese selezionato");
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

  return { searchParams, navigate, slug, checkIn, checkOut, resumeToken, dbApt, staticApt, apt, services, user, setUser, authLoading, step, setStep, mainGuest, setMainGuest, additionalGuests, setAdditionalGuests, flightData, setFlightData, selectedServices, setSelectedServices, notes, setNotes, billing, setBilling, noTransfer, setNoTransfer, flightErrors, setFlightErrors, isSubmitting, setIsSubmitting, nights, validateStep, nextStep, prevStep };
}
