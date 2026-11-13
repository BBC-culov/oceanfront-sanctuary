/**
 * Il sito vetrina pubblico è disattivato: questo progetto serve solo la
 * dashboard di gestione (gestione.bazhouse.com). Le pagine pubbliche sono
 * conservate nel codice; impostare a `true` per riattivarle.
 */
export const PUBLIC_SITE_ENABLED = false;

/** Indirizzi ancora raggiungibili con il sito vetrina disattivato. */
export const GESTIONE_ALLOWED_PREFIXES = [
  "/admin",
  "/proprietario",
  "/prenotazione-successo/",
  "/prenotazione/",
  "/profilo",
  "/pagamento-fallito",
  "/reset-password",
  "/unsubscribe",
  "/privacy-policy",
  "/refund-policy",
  "/rental-agreement",
];

export function isPathAllowedInGestione(pathname: string): boolean {
  if (pathname === "/") return true;
  return GESTIONE_ALLOWED_PREFIXES.some((p) =>
    p.endsWith("/") ? pathname.startsWith(p) : pathname === p || pathname.startsWith(p + "/"),
  );
}

export type RoleTarget = "/admin" | "/proprietario" | null;
export function roleHomePath(roles: string[]): RoleTarget {
  if (roles.includes("admin") || roles.includes("amministratore")) return "/admin";
  if (roles.includes("proprietario")) return "/proprietario";
  return null;
}
