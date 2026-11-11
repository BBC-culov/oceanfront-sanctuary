// Server copy of the Tax ID / VAT rule used by the booking forms
// (src/lib/bookingValidation.ts → isValidFiscalCode). A test checks both agree.

const EU_COUNTRY_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "italia": "IT", "italy": "IT",
  "francia": "FR", "france": "FR",
  "germania": "DE", "germany": "DE", "deutschland": "DE",
  "spagna": "ES", "spain": "ES", "españa": "ES",
  "portogallo": "PT", "portugal": "PT",
  "paesi bassi": "NL", "olanda": "NL", "netherlands": "NL",
  "belgio": "BE", "belgium": "BE",
  "austria": "AT",
  "irlanda": "IE", "ireland": "IE",
  "grecia": "GR", "greece": "GR",
  "polonia": "PL", "poland": "PL",
  "svezia": "SE", "sweden": "SE",
  "danimarca": "DK", "denmark": "DK",
  "finlandia": "FI", "finland": "FI",
  "regno unito": "GB", "uk": "GB", "united kingdom": "GB", "inghilterra": "GB",
  "svizzera": "CH", "switzerland": "CH",
  "stati uniti": "US", "usa": "US", "united states": "US",
};

const resolveCountryCode = (country: string): string | null => {
  if (!country) return null;
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
};

export const isValidFiscalCode = (value: unknown, country?: unknown): boolean => {
  if (typeof value !== "string") return false;
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  if (!cleaned) return false;

  const code = typeof country === "string" && country ? resolveCountryCode(country) : null;

  if (code === "IT") {
    return /^[A-Z0-9]{16}$/.test(cleaned) || /^\d{11}$/.test(cleaned);
  }
  if (code && EU_COUNTRY_CODES.has(code)) {
    const withPrefix = new RegExp(`^${code}[A-Z0-9]{8,12}$`);
    return withPrefix.test(cleaned) || /^[A-Z0-9]{8,12}$/.test(cleaned);
  }
  return /^[A-Z0-9]{4,20}$/.test(cleaned);
};
