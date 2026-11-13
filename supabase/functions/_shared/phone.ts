// Server copy of the phone rule used by the booking forms
// (src/lib/bookingValidation.ts → isValidPhone). A test checks both agree.

/** Phone: validates total digits (6-15) regardless of format.
 *  Accepts international prefixes ("+39", "0039"), spaces, dashes, dots and parentheses. */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  // Strip every non-digit character (including +, spaces, dashes, parentheses)
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 6 && digits.length <= 15;
};
