// Pure step validators for the admin "new booking" wizard.
import type { ClientSelection } from "@/components/admin/booking-wizard/StepClientSelection";
import type { StayData } from "@/components/admin/booking-wizard/StepStay";
import type { GuestData, AdditionalGuestData } from "@/components/booking/StepGuestData";
import { isValidPhone, isValidDocumentNumber } from "@/lib/bookingValidation";
import { isMainGuestComplete, isAdditionalGuestComplete } from "@/lib/bookingWizardValidation";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateClientStep = (c: ClientSelection): string | null => {
  if (c.mode === "existing") {
    return c.existing_user_id ? null : "Seleziona un cliente esistente o crea un nuovo account";
  }
  if (!c.new_first_name?.trim() || !c.new_last_name?.trim()) return "Inserisci nome e cognome del nuovo cliente";
  if (!c.new_email || !EMAIL_RE.test(c.new_email)) return "Email cliente non valida";
  if (c.new_phone && !isValidPhone(c.new_phone)) return "Telefono cliente non valido";
  return null;
};

/** Main-guest prefill from the selected client (used only when the guest email is still empty). */
export const mainGuestFromClient = (c: ClientSelection, current: GuestData): GuestData =>
  c.mode === "existing"
    ? {
        ...current,
        first_name: c.existing_user_first_name ?? "",
        last_name: c.existing_user_last_name ?? "",
        email: c.existing_user_email ?? "",
        phone: c.existing_user_phone ?? "",
      }
    : {
        ...current,
        first_name: c.new_first_name ?? "",
        last_name: c.new_last_name ?? "",
        email: c.new_email ?? "",
        phone: c.new_phone ?? "",
      };

export const validateStayStep = (s: StayData, nights: number): string | null => {
  if (!s.apartment_id) return "Seleziona un appartamento";
  if (!s.check_in || !s.check_out) return "Inserisci le date di check-in e check-out";
  if (nights < 1) return "Il check-out deve essere successivo al check-in";
  return null;
};

export const validateAdminGuestsStep = (
  main: GuestData,
  additional: AdditionalGuestData[],
  maxGuests?: number,
): string | null => {
  if (!isMainGuestComplete(main)) return "Compila tutti i campi obbligatori dell'ospite principale";
  if (!isValidPhone(main.phone)) return "Telefono ospite non valido (6-15 cifre)";
  if (!isValidDocumentNumber(main.id_card_number, main.id_type)) return "Numero documento ospite non valido";
  if (maxGuests !== undefined && additional.length + 1 > maxGuests) {
    return `Capacità appartamento superata (max ${maxGuests} ospiti)`;
  }
  for (let i = 0; i < additional.length; i++) {
    const g = additional[i];
    if (!isAdditionalGuestComplete(g)) return `Compila tutti i campi dell'ospite ${i + 2}`;
    if (!isValidDocumentNumber(g.id_card_number, g.id_type)) return `Ospite ${i + 2}: numero documento non valido`;
  }
  return null;
};
