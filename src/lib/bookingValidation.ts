// Booking form field validation utilities

/** Phone: validates total digits (6-15) regardless of format.
 *  Accepts international prefixes ("+39", "0039"), spaces, dashes, dots and parentheses. */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Strip every non-digit character (including +, spaces, dashes, parentheses)
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
};

/** ID Card (Carta d'identità): Italian format - 2 letters + 5-7 digits, or newer format with mixed alphanumerics, 7-9 chars */
export const isValidIdCard = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  return /^[A-Z0-9]{7,9}$/.test(cleaned);
};

/** Passport: 6-9 alphanumeric characters */
export const isValidPassport = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  return /^[A-Z0-9]{6,9}$/.test(cleaned);
};

/** Validate document number based on type */
export const isValidDocumentNumber = (value: string, type: "id_card" | "passport"): boolean => {
  if (!value.trim()) return false;
  return type === "passport" ? isValidPassport(value) : isValidIdCard(value);
};

/** ZIP/CAP: 3-10 digits (covers Italian 5-digit and international formats) */
export const isValidZip = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, "");
  return /^\d{3,10}$/.test(cleaned);
};

/** EU country codes (ISO 3166-1 alpha-2) for VAT validation */
const EU_COUNTRY_CODES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE",
]);

/** Map of common country names (IT/EN, lowercase) to ISO codes */
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

/** Resolve a country input (name or code) to an ISO 3166-1 alpha-2 code */
export const resolveCountryCode = (country: string): string | null => {
  if (!country) return null;
  const trimmed = country.trim();
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase();
  return COUNTRY_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
};

/** Get the appropriate label for the fiscal code field based on country */
export const getFiscalCodeLabel = (country: string): string => {
  const code = resolveCountryCode(country);
  if (code === "IT") return "Codice Fiscale / P.IVA";
  if (code && EU_COUNTRY_CODES.has(code)) return "VAT / P.IVA";
  return "Tax ID / VAT / P.IVA";
};

/** Get the placeholder for the fiscal code field based on country */
export const getFiscalCodePlaceholder = (country: string): string => {
  const code = resolveCountryCode(country);
  if (code === "IT") return "RSSMRA85M01H501Z";
  if (code === "DE") return "DE123456789";
  if (code === "FR") return "FRXX123456789";
  if (code === "ES") return "ESX1234567X";
  if (code && EU_COUNTRY_CODES.has(code)) return `${code}123456789`;
  return "Tax ID / VAT number";
};

/** Get a human-readable validation hint based on country */
export const getFiscalCodeHint = (country: string): string => {
  const code = resolveCountryCode(country);
  if (code === "IT") return "16 caratteri (CF) o 11 cifre (P.IVA)";
  if (code && EU_COUNTRY_CODES.has(code)) return `Formato VAT EU (es. ${code}123456789)`;
  return "4-20 caratteri alfanumerici";
};

/** Adaptive Tax ID / VAT validation based on the billing country.
 *  - IT  → CF (16 alphanumeric) or P.IVA (11 digits)
 *  - EU  → standard VAT format: 2-letter country prefix + 8-12 alphanumeric
 *          (also accepts the body without prefix, 8-12 alphanumeric)
 *  - Other countries → 4-20 alphanumeric (broad validation) */
export const isValidFiscalCode = (value: string, country?: string): boolean => {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  if (!cleaned) return false;

  const code = country ? resolveCountryCode(country) : null;

  // Italy: CF (16 alphanumeric) or P.IVA (11 digits)
  if (code === "IT") {
    return /^[A-Z0-9]{16}$/.test(cleaned) || /^\d{11}$/.test(cleaned);
  }

  // EU country: VAT format
  if (code && EU_COUNTRY_CODES.has(code)) {
    // Accept either with or without country prefix
    const withPrefix = new RegExp(`^${code}[A-Z0-9]{8,12}$`);
    return withPrefix.test(cleaned) || /^[A-Z0-9]{8,12}$/.test(cleaned);
  }

  // Unknown / non-EU: lenient alphanumeric range
  return /^[A-Z0-9]{4,20}$/.test(cleaned);
};

/** Filter to allow only digits */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/** Filter to allow only alphanumeric */
export const onlyAlphanumeric = (value: string): string => value.replace(/[^a-zA-Z0-9]/g, "");

/** Filter to allow only letters, spaces, accents and apostrophes (for names) */
export const onlyLetters = (value: string): string => value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
