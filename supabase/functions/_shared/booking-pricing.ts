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

export function computeBookingPrice(input: PriceInput): PriceResult {
  const checkIn = new Date(input.check_in);
  const checkOut = new Date(input.check_out);
  const nights = Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);

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
