// Meta (Facebook) Pixel — consent-gated loader + event helpers.
// The pixel script is only injected AFTER the user accepts cookies.

const PIXEL_ID = "1053507033899259";
const COOKIE_KEY = "bazhouse_cookie_consent";

declare global {
  interface Window {
    fbq?: ((...args: any[]) => void) & { callMethod?: (...a: any[]) => void; queue?: any[]; loaded?: boolean; version?: string };
    _fbq?: any;
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
  (function (f: any, b, e, v, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
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

export const trackCustomEvent = (name: string, params?: Record<string, any>) => {
  if (!hasCookieConsent()) return;
  if (!initialized) initMetaPixel();
  window.fbq?.("trackCustom", name, params || {});
};
