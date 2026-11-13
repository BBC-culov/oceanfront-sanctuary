import { describe, it, expect } from "vitest";
import { isPathAllowedInGestione, roleHomePath, PUBLIC_SITE_ENABLED } from "@/lib/siteMode";

describe("modalità gestione", () => {
  it("il sito vetrina è disattivato", () => expect(PUBLIC_SITE_ENABLED).toBe(false));
  it("le vecchie pagine pubbliche non sono raggiungibili", () => {
    for (const p of ["/appartamenti", "/compra", "/chi-siamo", "/servizi", "/contatti", "/prenota", "/registrati", "/appartamenti/x"]) {
      expect(isPathAllowedInGestione(p)).toBe(false);
    }
  });
  it("dashboard e pagine di ritorno pagamento restano attive", () => {
    for (const p of ["/", "/admin", "/admin/prenotazioni/nuova", "/proprietario", "/prenotazione-successo/1", "/prenotazione/1", "/pagamento-fallito", "/reset-password", "/unsubscribe", "/privacy-policy"]) {
      expect(isPathAllowedInGestione(p)).toBe(true);
    }
  });
  it("redirect per ruolo", () => {
    expect(roleHomePath(["amministratore"])).toBe("/admin");
    expect(roleHomePath(["admin"])).toBe("/admin");
    expect(roleHomePath(["proprietario"])).toBe("/proprietario");
    expect(roleHomePath(["user"])).toBeNull();
  });
});
