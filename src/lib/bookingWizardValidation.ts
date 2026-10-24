// Pure step validators for the booking wizards (client and admin).
// Each returns null when valid, otherwise the error message to show.
import type { GuestData, AdditionalGuestData } from "@/components/booking/StepGuestData";
import type { FlightData } from "@/components/booking/StepFlightServices";
import type { BillingData } from "@/components/booking/StepBilling";
import { isValidPhone, isValidDocumentNumber, isValidZip, isValidFiscalCode } from "@/lib/bookingValidation";

export interface StepError {
  message: string;
  /** DOM id to scroll into view, when relevant */
  scrollTo?: string;
}

const docLabel = (t: GuestData["id_type"]) => (t === "passport" ? "passaporto" : "carta d'identità");

export const isMainGuestComplete = (g: GuestData): boolean =>
  !!(g.first_name && g.last_name && g.date_of_birth && g.nationality && g.id_card_number &&
    g.id_card_issued && g.id_card_expiry && g.email && g.phone);

export const isAdditionalGuestComplete = (g: AdditionalGuestData): boolean =>
  !!(g.first_name && g.last_name && g.date_of_birth && g.nationality &&
    g.id_card_number && g.id_card_issued && g.id_card_expiry);

/** Client wizard — guests step */
export const validateGuestsStep = (main: GuestData, additional: AdditionalGuestData[]): StepError | null => {
  if (!isMainGuestComplete(main)) {
    return { message: "Compila tutti i campi obbligatori dell'ospite principale", scrollTo: "step-guest-data" };
  }
  if (!isValidPhone(main.phone)) {
    return { message: "Numero di telefono non valido: inserisci solo cifre (6-15 cifre)" };
  }
  if (!isValidDocumentNumber(main.id_card_number, main.id_type)) {
    return {
      message: `Numero di ${docLabel(main.id_type)} non valido: solo lettere e numeri, ${main.id_type === "passport" ? "6-9" : "7-9"} caratteri`,
    };
  }
  for (let i = 0; i < additional.length; i++) {
    const g = additional[i];
    if (!isAdditionalGuestComplete(g)) return { message: `Compila tutti i campi dell'ospite ${i + 2}` };
    if (!isValidDocumentNumber(g.id_card_number, g.id_type)) {
      return { message: `Ospite ${i + 2}: numero di ${docLabel(g.id_type)} non valido` };
    }
  }
  return null;
};

const FLIGHT_FIELDS: (keyof FlightData)[] = ["airline", "flight_outbound", "arrival_time", "flight_return", "departure_time"];

/** Returns the flight fields missing (empty object when ok or transfer not wanted). */
export const missingFlightFields = (noTransfer: boolean, flight: FlightData): Record<string, boolean> => {
  const errs: Record<string, boolean> = {};
  if (noTransfer) return errs;
  for (const f of FLIGHT_FIELDS) if (!flight[f]) errs[f] = true;
  return errs;
};

export interface BillingMessages { zip: string }

export const validateBilling = (b: BillingData, msgs: BillingMessages): string | null => {
  if (!b.billing_name || !b.billing_address || !b.billing_city || !b.billing_zip || !b.billing_country || !b.billing_fiscal_code) {
    return "Compila tutti i dati di fatturazione";
  }
  if (!isValidZip(b.billing_zip)) return msgs.zip;
  if (!isValidFiscalCode(b.billing_fiscal_code, b.billing_country)) {
    return "Tax ID / VAT / P.IVA non valido per il paese selezionato";
  }
  return null;
};

export const CLIENT_ZIP_MSG = "CAP non valido: inserisci solo cifre (3-10 cifre)";
export const ADMIN_ZIP_MSG = "CAP non valido";
