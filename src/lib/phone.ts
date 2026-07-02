/**
 * Normalize a phone number to 10-digit Indian format (no prefix).
 */
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters
  let digits = phone.replace(/\D/g, "");
  // Handle Indian numbers: strip leading 91 country code if 12 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  // Strip leading 0
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}
