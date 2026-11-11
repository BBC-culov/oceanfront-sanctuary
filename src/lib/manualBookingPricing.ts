// Pricing rules for admin manual bookings (flat price + custom payment link amount).
// Mirrored server-side in supabase/functions/_shared/manual-booking-pricing.ts — keep in sync.
import { calcDeposit } from "@/lib/bookingDeposit";

export type ManualTotalMode = "calculated" | "flat_total" | "per_person";
export type ManualLinkType = "deposit" | "full" | "custom" | "none";

/** Stripe minimum charge for EUR. */
export const MIN_LINK_AMOUNT = 1;

const round2 = (n: number) => Math.round(Number(n) * 100) / 100;

/** Final booking total: calculated (nights × price + services) or an admin flat price. */
export function resolveManualTotal(
  calculated: number,
  mode: ManualTotalMode,
  amount: number | null | undefined,
  guests: number,
): number {
  if (mode === "flat_total") return round2(Number(amount ?? 0));
  if (mode === "per_person") return round2(Number(amount ?? 0) * Math.max(1, guests));
  return round2(calculated);
}

/** Amount charged by the Stripe link generated at creation time. */
export function resolveLinkAmount(
  type: ManualLinkType,
  total: number,
  customAmount: number | null | undefined,
): number {
  if (type === "full") return round2(total);
  if (type === "deposit") return calcDeposit(total);
  if (type === "custom") return round2(Number(customAmount ?? 0));
  return 0;
}

/** Deposit stored on the booking: the custom amount when chosen, else the standard deposit. */
export function resolveStoredDeposit(type: ManualLinkType, total: number, customAmount: number | null | undefined): number {
  return type === "custom" ? round2(Number(customAmount ?? 0)) : calcDeposit(total);
}

/** Returns an Italian error message or null when the pricing choices are valid. */
export function validateManualPricing(input: {
  mode: ManualTotalMode;
  amount: number | null | undefined;
  total: number;
  linkType: ManualLinkType;
  customAmount: number | null | undefined;
}): string | null {
  const { mode, amount, total, linkType, customAmount } = input;
  if (mode !== "calculated" && !(Number(amount) > 0)) return "Inserisci un prezzo forfettario valido";
  if (!(total > 0)) return "Il totale della prenotazione deve essere maggiore di zero";
  if (linkType === "custom") {
    const c = Number(customAmount);
    if (!(c >= MIN_LINK_AMOUNT)) return `Inserisci l'importo del link (minimo ${MIN_LINK_AMOUNT} €)`;
    if (round2(c) > round2(total)) return `L'importo del link non può superare il totale (€${round2(total)})`;
  }
  return null;
}
