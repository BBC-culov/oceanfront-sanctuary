// Shared zod schemas for booking modification forms (client + admin).
import { z } from "zod";

const dateStr = z.string().min(1, "Data obbligatoria");
const optStr = z.string().optional().or(z.literal(""));
const phoneRegex = /^\+?[0-9\s().-]{6,20}$/;

export const guestSchema = z
  .object({
    first_name: z.string().trim().min(1, "Nome obbligatorio").max(80),
    last_name: z.string().trim().min(1, "Cognome obbligatorio").max(80),
    date_of_birth: z.string().min(1, "Data di nascita obbligatoria"),
    nationality: z.string().trim().min(2, "Nazionalità obbligatoria").max(60),
    id_type: z.enum(["id_card", "passport", "driver_license"]),
    id_card_number: z.string().trim().min(2, "Numero documento obbligatorio").max(40),
    id_card_issued: z.string().min(1, "Data rilascio obbligatoria"),
    id_card_expiry: z.string().min(1, "Data scadenza obbligatoria"),
  })
  .refine((g) => new Date(g.id_card_expiry) > new Date(), {
    message: "Documento scaduto",
    path: ["id_card_expiry"],
  })
  .refine((g) => new Date(g.date_of_birth) < new Date(), {
    message: "Data di nascita non valida",
    path: ["date_of_birth"],
  });

export const mainGuestSchema = z.object({
  guest_name: z.string().trim().min(1, "Nome obbligatorio").max(80),
  guest_last_name: z.string().trim().min(1, "Cognome obbligatorio").max(80),
  guest_email: z.string().trim().email("Email non valida").max(180),
  guest_phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Telefono non valido")
    .or(z.literal("")),
  guest_date_of_birth: optStr,
  guest_place_of_birth: optStr,
  guest_nationality: optStr,
  guest_id_type: z.enum(["id_card", "passport", "driver_license"]).optional(),
  guest_id_card_number: optStr,
  guest_id_card_issued: optStr,
  guest_id_card_expiry: optStr,
});

export const stayDatesSchema = z
  .object({ check_in: dateStr, check_out: dateStr })
  .refine((d) => new Date(d.check_out) > new Date(d.check_in), {
    message: "Check-out deve essere dopo il check-in",
    path: ["check_out"],
  });

export type FieldErrors = Record<string, string>;

export function flattenZodErrors(err: z.ZodError, prefix = ""): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const key = (prefix ? `${prefix}.` : "") + issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
