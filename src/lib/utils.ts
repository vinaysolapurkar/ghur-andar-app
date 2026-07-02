import type { OrderStatus } from "./constants";

/**
 * Format an ISO date string or datetime to a human-readable label.
 * Example: "Jul 2, 2:30 PM"
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a number as Indian Rupee currency.
 * Example: 250 → "₹250"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Return a Tailwind CSS color class (bg + text) for a given order status.
 */
export function getStatusColor(status: OrderStatus | string): string {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "confirmed":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-purple-100 text-purple-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "returned":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

/**
 * Return a human-readable label for an order status.
 */
export function getStatusLabel(status: OrderStatus | string): string {
  switch (status) {
    case "new":
      return "New";
    case "confirmed":
      return "Confirmed";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "returned":
      return "Returned";
    case "cancelled":
      return "Cancelled";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Generate a simple string fingerprint for duplicate order detection.
 * Combines name, phone, and ring count into a normalized hash string.
 */
export function generateFingerprint(name: string, phone: string, rings: number): string {
  const normalizedName = name.trim().toLowerCase().replace(/\s+/g, " ");
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10); // last 10 digits
  const key = `${normalizedName}|${normalizedPhone}|${rings}`;

  // Simple djb2-style hash
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 33) ^ key.charCodeAt(i);
    hash = hash >>> 0; // keep as 32-bit unsigned int
  }
  return hash.toString(36);
}

/**
 * Combine class names, filtering out falsy values.
 * Works like clsx for simple use cases.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
