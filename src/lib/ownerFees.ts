// Single source of truth for the platform commission applied to owner revenue.
export const PLATFORM_FEE_RATE = 0.15;

export function calcOwnerMargin(revenue: number): number {
  return Number(revenue) * (1 - PLATFORM_FEE_RATE);
}
