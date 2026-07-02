import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  pincode: text("pincode"),
  totalOrders: integer("total_orders").default(0),
  totalRings: integer("total_rings").default(0),
  firstOrderAt: text("first_order_at"),
  lastOrderAt: text("last_order_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").references(() => customers.id),
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address").notNull(),
  city: text("city"),
  pincode: text("pincode"),
  rings: integer("rings").notNull().default(1),
  pricePerRing: integer("price_per_ring").default(250),
  totalAmount: integer("total_amount").default(250),
  status: text("status").notNull().default("new"), // new, confirmed, shipped, delivered, returned, cancelled
  trackingNumber: text("tracking_number"), // P1000... from DTD
  returnTracking: text("return_tracking"), // P5000... for returns
  rawMessage: text("raw_message"),
  notes: text("notes"),
  createdBy: text("created_by").default("admin"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
  shippedAt: text("shipped_at"),
  deliveredAt: text("delivered_at"),
});

export const stockLedger = sqliteTable("stock_ledger", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  change: integer("change").notNull(),
  reason: text("reason").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  orderId: integer("order_id"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  targetRole: text("target_role").notNull(), // admin or dtd
  message: text("message").notNull(),
  orderId: integer("order_id"),
  isRead: integer("is_read").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});
