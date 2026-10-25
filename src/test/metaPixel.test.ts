import { beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  delete window.fbq;
  delete window._fbq;
  document.head.innerHTML = "<script></script>";
});

it("does not load or send events without consent", async () => {
  const pixel = await import("@/lib/metaPixel");
  pixel.initMetaPixel();
  pixel.trackCustomEvent("PrenotazioneCompletata");
  expect(window.fbq).toBeUndefined();
  expect(document.querySelector('script[src*="fbevents"]')).toBeNull();
});

it("retains the pixel ID and queued events after consent", async () => {
  localStorage.setItem("bazhouse_cookie_consent", "accepted");
  const pixel = await import("@/lib/metaPixel");
  pixel.initMetaPixel();
  pixel.trackCustomEvent("PrenotazioneCompletata", { value: 100, currency: "EUR" });
  expect(window.fbq?.queue).toEqual([
    ["init", "1345445894467225"],
    ["track", "PageView"],
    ["trackCustom", "PrenotazioneCompletata", { value: 100, currency: "EUR" }],
  ]);
});