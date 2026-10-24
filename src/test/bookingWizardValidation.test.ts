import { describe, it, expect } from "vitest";
import { validateGuestsStep, missingFlightFields, validateBilling, CLIENT_ZIP_MSG } from "@/lib/bookingWizardValidation";
import { validateStayStep, validateAdminGuestsStep, validateClientStep } from "@/lib/adminBookingValidation";

const guest = {
  first_name: "Mario", last_name: "Rossi", date_of_birth: "1980-01-01", place_of_birth: "Roma",
  phone: "+39 347 750 4352", email: "m@r.it", nationality: "IT", id_type: "id_card" as const,
  id_card_number: "CA12345AB", id_card_issued: "2020-01-01", id_card_expiry: "2030-01-01",
};
const billing = { billing_name: "M", billing_address: "Via", billing_city: "Roma", billing_zip: "00100", billing_country: "Italia", billing_fiscal_code: "12345678901" };

describe("booking wizard step rules", () => {
  it("accepts a complete main guest", () => expect(validateGuestsStep(guest, [])).toBeNull());
  it("rejects missing main guest fields", () =>
    expect(validateGuestsStep({ ...guest, phone: "" }, [])?.message).toBe("Compila tutti i campi obbligatori dell'ospite principale"));
  it("rejects a phone with too few digits", () =>
    expect(validateGuestsStep({ ...guest, phone: "123" }, [])?.message).toContain("telefono non valido"));
  it("requires flight fields unless no transfer", () => {
    const empty = { flight_outbound: "", flight_return: "", arrival_time: "", departure_time: "", airline: "" };
    expect(Object.keys(missingFlightFields(false, empty))).toHaveLength(5);
    expect(missingFlightFields(true, empty)).toEqual({});
  });
  it("validates Italian P.IVA and bad ZIP", () => {
    expect(validateBilling(billing, { zip: CLIENT_ZIP_MSG })).toBeNull();
    expect(validateBilling({ ...billing, billing_zip: "AB" }, { zip: CLIENT_ZIP_MSG })).toBe(CLIENT_ZIP_MSG);
    expect(validateBilling({ ...billing, billing_fiscal_code: "XX" }, { zip: CLIENT_ZIP_MSG })).toContain("P.IVA non valido");
  });
  it("admin: check-out must be after check-in", () =>
    expect(validateStayStep({ apartment_id: "a", check_in: "2026-10-22", check_out: "2026-10-22" }, 0)).toBe("Il check-out deve essere successivo al check-in"));
  it("admin: guest count limited by apartment capacity", () =>
    expect(validateAdminGuestsStep(guest, [{ ...guest }, { ...guest }], 2)).toBe("Capacità appartamento superata (max 2 ospiti)"));
  it("admin: existing client must be selected", () =>
    expect(validateClientStep({ mode: "existing" })).toBe("Seleziona un cliente esistente o crea un nuovo account"));
});
