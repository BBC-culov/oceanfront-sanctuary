// Single source of truth for the deposit (caparra) percentage.
// Used by admin UI copy and mirrored in supabase/functions/_shared/booking-pricing.ts
// for server-side calculations.

export const DEPOSIT_RATE = 0.2;

export const DEPOSIT_PERCENT_LABEL = `${Math.round(DEPOSIT_RATE * 100)}%`;

export function calcDeposit(total: number): number {
  return Math.round(Number(total) * DEPOSIT_RATE * 100) / 100;
}
