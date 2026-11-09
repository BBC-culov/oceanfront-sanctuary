import { supabase } from "@/integrations/supabase/client";

/**
 * The auth client reads and clears the recovery tokens from the URL as soon as
 * the app boots, often before the lazily-loaded reset page mounts. This module
 * is imported first in main.tsx so it captures the original URL and the
 * PASSWORD_RECOVERY event before they are lost.
 */

export interface RecoveryUrlInfo {
  isRecovery: boolean;
  code: string | null;
  errorCode: string | null;
  errorDescription: string | null;
}

export function parseRecoveryUrl(hash: string, search: string): RecoveryUrlInfo {
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);
  const searchParams = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const get = (key: string) => hashParams.get(key) ?? searchParams.get(key);

  const errorCode = get("error_code") ?? get("error");
  return {
    isRecovery: get("type") === "recovery" || hashParams.has("access_token"),
    code: searchParams.get("code"),
    errorCode,
    errorDescription: errorCode ? get("error_description") : null,
  };
}

/** Italian message for errors returned by the auth server in the link. */
export function recoveryErrorMessage(info: RecoveryUrlInfo): string {
  if (info.errorCode === "otp_expired" || info.errorCode === "access_denied") {
    return "Questo link è scaduto o è già stato usato. Ricorda che vale solo l'ultima email ricevuta: richiedi un nuovo link dalla pagina di login.";
  }
  return "Questo link di reset password non è valido o è scaduto. Richiedi un nuovo link dalla pagina di login.";
}

const isBrowser = typeof window !== "undefined";
const initialPath = isBrowser ? window.location.pathname : "";

export const initialRecoveryUrl: RecoveryUrlInfo = isBrowser && initialPath.startsWith("/reset-password")
  ? parseRecoveryUrl(window.location.hash, window.location.search)
  : { isRecovery: false, code: null, errorCode: null, errorDescription: null };

let recoveryEventSeen = false;
const listeners = new Set<() => void>();

supabase.auth.onAuthStateChange((event) => {
  if (event === "PASSWORD_RECOVERY") {
    recoveryEventSeen = true;
    listeners.forEach((fn) => fn());
  }
});

export function hasRecoveryEvent(): boolean {
  return recoveryEventSeen;
}

export function onRecoveryEvent(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
