// Shared booking price computation — used by admin-update-booking,
// request-booking-modification, review-booking-modification.

export interface ServiceLine {
  id: string;
  name: string;
  price: number;
}

export interface PriceInput {
  apartment: { price_per_night: number; guests: number };
  check_in: string;
  check_out: string;
  serviceIds: string[];
  servicesCatalog: Array<{ id: string; name: string; price: number; is_active: boolean }>;
}

export interface PriceResult {
  nights: number;
  accommodationTotal: number;
  servicesTotal: number;
  totalPrice: number;
  trustedServices: ServiceLine[];
}

// Single source of truth for the nights calculation (mirrored client-side in
// src/lib/nights.ts). Uses UTC midnights so DST can never shift the result.
export function nightsBetween(checkIn: string | Date, checkOut: string | Date): number {
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return 0;
  const utc = (d: Date) => Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  return Math.max(0, Math.round((utc(b) - utc(a)) / 86400000));
}

export function computeBookingPrice(input: PriceInput): PriceResult {
  const nights = nightsBetween(input.check_in, input.check_out);

  const accommodationTotal = Math.round(Number(input.apartment.price_per_night) * nights * 100) / 100;

  let servicesTotal = 0;
  const trustedServices: ServiceLine[] = [];

  for (const id of input.serviceIds) {
    const svc = input.servicesCatalog.find((s) => s.id === id);
    if (!svc || !svc.is_active) continue;
    const isPerNight =
      svc.name.toLowerCase().includes("noleggio") ||
      svc.name.toLowerCase().includes("giorno");
    const qty = isPerNight ? nights : 1;
    servicesTotal += Number(svc.price) * qty;
    trustedServices.push({ id: svc.id, name: svc.name, price: Number(svc.price) });
  }
  servicesTotal = Math.round(servicesTotal * 100) / 100;

  const totalPrice = Math.round((accommodationTotal + servicesTotal) * 100) / 100;
  return { nights, accommodationTotal, servicesTotal, totalPrice, trustedServices };
}

export function diffChanges<T extends Record<string, any>>(
  current: T,
  proposed: Partial<T>
): Partial<T> {
  const out: any = {};
  for (const k of Object.keys(proposed)) {
    const a = (current as any)[k];
    const b = (proposed as any)[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = b;
  }
  return out;
}

// Single source of truth for the deposit (caparra) percentage.
// Mirrored client-side in src/lib/bookingDeposit.ts.
export const DEPOSIT_RATE = 0.2;
export const DEPOSIT_PERCENT_LABEL = `${Math.round(DEPOSIT_RATE * 100)}%`;

export function calcDeposit(total: number): number {
  return Math.round(Number(total) * DEPOSIT_RATE * 100) / 100;
}
