// Meta (Facebook) Pixel — consent-gated loader + event helpers.
// The pixel script is only injected AFTER the user accepts cookies.

const PIXEL_ID = "1345445894467225";
const COOKIE_KEY = "bazhouse_cookie_consent";

type PixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push?: PixelFunction;
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: PixelFunction;
    _fbq?: PixelFunction;
  }
}

let initialized = false;

export const hasCookieConsent = (): boolean => {
  try {
    return localStorage.getItem(COOKIE_KEY) === "accepted";
  } catch {
    return false;
  }
};

export const initMetaPixel = () => {
  if (initialized || typeof window === "undefined") return;
  if (!hasCookieConsent()) return;

  // Standard Meta Pixel base code
  (function (f: Window, b: Document, e: "script", v: string) {
    if (f.fbq) return;
    const n: PixelFunction = Object.assign(function (...args: unknown[]) {
      if (n.callMethod) n.callMethod(...args);
      else n.queue.push(args);
    }, { queue: [] as unknown[][] });
    f.fbq = n;
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e);
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  window.fbq?.("init", PIXEL_ID);
  window.fbq?.("track", "PageView");
  initialized = true;
};

export const trackPageView = () => {
  if (!hasCookieConsent()) return;
  if (!initialized) initMetaPixel();
  window.fbq?.("track", "PageView");
};

export const trackCustomEvent = (name: string, params?: Record<string, unknown>) => {
  if (!hasCookieConsent()) return;
  if (!initialized) initMetaPixel();
  window.fbq?.("trackCustom", name, params || {});
};
