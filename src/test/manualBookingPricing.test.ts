import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  resolveInitialLinkAmount,
  resolveLinkAmount,
  resolveManualTotal,
  resolveStoredDeposit,
  validateManualPricing,
} from "@/lib/manualBookingPricing";

describe("prenotazione manuale: prezzo forfettario", () => {
  it("totale calcolato resta notti × prezzo + servizi", () => {
    expect(resolveManualTotal(1400, "calculated", 999, 3)).toBe(1400);
  });
  it("forfait totale sostituisce il calcolato (es. 1.700 €)", () => {
    expect(resolveManualTotal(1400, "flat_total", 1700, 3)).toBe(1700);
  });
  it("forfait a persona = prezzo × ospiti (es. 2.000 € × 3)", () => {
    expect(resolveManualTotal(1400, "per_person", 2000, 3)).toBe(6000);
  });
  it("forfait senza importo è rifiutato", () => {
    expect(validateManualPricing({ mode: "flat_total", amount: null, total: 0, linkType: "none", customAmount: null }))
      .not.toBeNull();
  });
});

describe("prenotazione manuale: importo link", () => {
  it("caparra standard = 20% del totale", () => {
    expect(resolveLinkAmount("deposit", 1700, null)).toBe(340);
  });
  it("importo libero usa la cifra scelta (es. 500 €)", () => {
    expect(resolveLinkAmount("custom", 6000, 500)).toBe(500);
    expect(resolveStoredDeposit("custom", 6000, 500)).toBe(500);
  });
  it("totale = 100%", () => {
    expect(resolveLinkAmount("full", 1700, null)).toBe(1700);
  });
  it("importo libero oltre il totale è rifiutato", () => {
    expect(validateManualPricing({ mode: "flat_total", amount: 1700, total: 1700, linkType: "custom", customAmount: 1800 }))
      .not.toBeNull();
  });
  it("importo libero entro il totale è valido", () => {
    expect(validateManualPricing({ mode: "flat_total", amount: 1700, total: 1700, linkType: "custom", customAmount: 500 }))
      .toBeNull();
  });
  it("importo libero vuoto è rifiutato", () => {
    expect(validateManualPricing({ mode: "calculated", amount: null, total: 1000, linkType: "custom", customAmount: null }))
      .not.toBeNull();
  });
});

describe("regole client e server allineate", () => {
  it("la copia server ha le stesse regole della copia client", () => {
    const body = (p: string) =>
      readFileSync(resolve(__dirname, p), "utf8").split("\n").filter((l) => !l.startsWith("//") && !l.startsWith("import")).join("\n");
    expect(body("../../supabase/functions/_shared/manual-booking-pricing.ts")).toBe(body("../lib/manualBookingPricing.ts"));
  });
});

describe("prenotazione manuale: primo link (anche quando viene rigenerato)", () => {
  it("caparra libera di 500 € resta 500 € su un totale di 1.300 €", () => {
    expect(resolveInitialLinkAmount("deposit", 1300, 500)).toBe(500);
  });
  it("caparra standard salvata = 20% del totale (1.300 € → 260 €)", () => {
    expect(resolveInitialLinkAmount("deposit", 1300, 260)).toBe(260);
  });
  it("senza caparra salvata usa il 20%", () => {
    expect(resolveInitialLinkAmount("deposit", 1300, 0)).toBe(260);
  });
  it("prenotazione con pagamento totale chiede l'intero importo", () => {
    expect(resolveInitialLinkAmount("full", 1300, 260)).toBe(1300);
  });
});
