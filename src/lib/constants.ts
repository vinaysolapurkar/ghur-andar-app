export const ORDER_STATUSES = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PRICE_PER_RING = 250;

export const ROLES = ["admin", "dtd"] as const;
export type Role = (typeof ROLES)[number];
