// Booking form field validation utilities

/** Phone: only digits (after removing prefix/spaces), 6-15 digits */
export const isValidPhone = (phone: string): boolean => {
  // Remove prefix (e.g. "+39 ") and spaces
  const digits = phone.replace(/\+\d+\s*/, "").replace(/\s/g, "");
  return /^\d{6,15}$/.test(digits);
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

/** Codice Fiscale: 16 alphanumeric chars, or P.IVA: 11 digits */
export const isValidFiscalCode = (value: string): boolean => {
  const cleaned = value.replace(/\s/g, "").toUpperCase();
  return /^[A-Z0-9]{11,16}$/.test(cleaned);
};

/** Filter to allow only digits */
export const onlyDigits = (value: string): string => value.replace(/\D/g, "");

/** Filter to allow only alphanumeric */
export const onlyAlphanumeric = (value: string): string => value.replace(/[^a-zA-Z0-9]/g, "");

/** Filter to allow only letters, spaces, accents and apostrophes (for names) */
export const onlyLetters = (value: string): string => value.replace(/[^a-zA-ZÀ-ÿ\s'-]/g, "");
