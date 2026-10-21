import { describe, it, expect } from "vitest";
import { calcDeposit } from "@/lib/bookingDeposit";
import { PLATFORM_FEE_RATE, calcOwnerMargin } from "@/lib/ownerFees";

describe("regole prezzi", () => {
  it("caparra = 20% del totale", () => {
    expect(calcDeposit(1000)).toBe(200);
    expect(calcDeposit(333.33)).toBe(66.67);
  });
  it("provvigione piattaforma = 15%", () => {
    expect(PLATFORM_FEE_RATE).toBe(0.15);
    expect(calcOwnerMargin(1000)).toBe(850);
  });
});
