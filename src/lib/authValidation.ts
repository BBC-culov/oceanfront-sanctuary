import { z } from "zod";

// Single source of truth for the auth form validation rules (login + registration).

export const loginSchema = z.object({
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  password: z.string().min(1, "Inserisci la password"),
});

export const registerSchema = z.object({
  firstName: z.string().trim().min(2, "Il nome deve avere almeno 2 caratteri").max(50, "Il nome è troppo lungo"),
  lastName: z.string().trim().min(2, "Il cognome deve avere almeno 2 caratteri").max(50, "Il cognome è troppo lungo"),
  email: z.string().trim().email("Inserisci un indirizzo email valido"),
  phone: z.string().trim().regex(/^\+?[0-9\s]{7,15}$/, "Inserisci un numero di telefono valido (es. +39 333 1234567)"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri")
    .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
    .regex(/[0-9]/, "La password deve contenere almeno un numero"),
  confirmPassword: z.string(),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Devi accettare la Privacy Policy, il Rental Agreement e la Refund Policy" }) }),
}).refine(data => data.password === data.confirmPassword, {
  message: "Le password non corrispondono",
  path: ["confirmPassword"],
});

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Flattens a Zod error into a { field: message } map for inline display. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  error.errors.forEach(err => {
    if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
  });
  return fieldErrors;
}

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptPrivacy: boolean;
};
