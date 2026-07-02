"use server";

import { db } from "../db";
import { orders, customers, stockLedger, notifications } from "../db/schema";
import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { normalizePhone } from "../phone";
import { deductStock, addStock } from "./stock";
import { createNotification } from "./notifications";

const PAGE_SIZE = 20;

export async function createOrder(data: {
  name: string;
  phone: string;
  address: string;
  rings: number;
  pincode?: string;
  city?: string;
  rawMessage?: string;
  notes?: string;
}) {
  const normalizedPhone = normalizePhone(data.phone);

  // Find or create customer
  const existingCustomers = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, normalizedPhone))
    .limit(1);

  let customer = existingCustomers[0];

  if (!customer) {
    const now = new Date().toISOString();
    const inserted = await db
      .insert(customers)
      .values({
        name: data.name,
        phone: normalizedPhone,
        address: data.address,
        city: data.city ?? null,
        pincode: data.pincode ?? null,
        totalOrders: 1,
        totalRings: data.rings,
        firstOrderAt: now,
        lastOrderAt: now,
      })
      .returning();
    customer = inserted[0];
  } else {
    // Update existing customer stats
    const now = new Date().toISOString();
    await db
      .update(customers)
      .set({
        totalOrders: sql`${customers.totalOrders} + 1`,
        totalRings: sql`${customers.totalRings} + ${data.rings}`,
        lastOrderAt: now,
        // Update address/city/pincode if provided
        ...(data.city ? { city: data.city } : {}),
        ...(data.pincode ? { pincode: data.pincode } : {}),
      })
      .where(eq(customers.id, customer.id));
  }

  const totalAmount = data.rings * 250;

  // Create the order
  const inserted = await db
    .insert(orders)
    .values({
      customerId: customer.id,
      name: data.name,
      phone: normalizedPhone,
      address: data.address,
      city: data.city ?? null,
      pincode: data.pincode ?? null,
      rings: data.rings,
      pricePerRing: 250,
      totalAmount,
      status: "new",
      rawMessage: data.rawMessage ?? null,
      notes: data.notes ?? null,
    })
    .returning();

  const order = inserted[0];

  // Auto-deduct stock
  await deductStock(data.rings, order.id);

  // Notify DTD
  await createNotification(
    "dtd",
    `New order: ${data.name} - ${data.rings} ring(s)`,
    order.id
  );

  return order;
}

export async function updateOrderStatus(
  orderId: number,
  status: string,
  trackingNumber?: string,
  notes?: string
) {
  const now = new Date().toISOString();

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: now,
  };

  if (trackingNumber !== undefined) {
    updateData.trackingNumber = trackingNumber;
  }
  if (notes !== undefined) {
    updateData.notes = notes;
  }

  if (status === "shipped") {
    updateData.shippedAt = now;
  } else if (status === "delivered") {
    updateData.deliveredAt = now;
  }

  const updated = await db
    .update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId))
    .returning();

  const order = updated[0];
  if (!order) return null;

  // Notifications and stock adjustments by status
  if (status === "shipped") {
    await createNotification(
      "admin",
      `Order #${orderId} shipped${trackingNumber ? ` - Tracking: ${trackingNumber}` : ""}`,
      orderId
    );
  } else if (status === "delivered") {
    await createNotification(
      "admin",
      `Order #${orderId} delivered to ${order.name}`,
      orderId
    );
  } else if (status === "returned") {
    // Return stock
    await addStock(
      order.rings,
      `Return - Order #${orderId} (${order.name})`
    );
    await createNotification(
      "admin",
      `Order #${orderId} returned - ${order.rings} ring(s) restocked`,
      orderId
    );
  }

  return order;
}

export async function getOrders(filters?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters?.page ?? 1;
  const limit = filters?.limit ?? PAGE_SIZE;
  const offset = (page - 1) * limit;

  const conditions: ReturnType<typeof eq>[] = [];

  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status));
  }

  let searchCondition;
  if (filters?.search) {
    const term = `%${filters.search}%`;
    searchCondition = or(
      like(orders.name, term),
      like(orders.phone, term),
      like(orders.address, term),
      like(orders.trackingNumber, term)
    );
  }

  const whereClause =
    conditions.length > 0 && searchCondition
      ? and(...conditions, searchCondition)
      : conditions.length > 0
        ? and(...conditions)
        : searchCondition;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(whereClause),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);

  return {
    orders: rows,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getOrder(id: number) {
  const orderRows = await db
    .select({
      order: orders,
      customer: customers,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id))
    .limit(1);

  if (!orderRows[0]) return null;

  return {
    ...orderRows[0].order,
    customer: orderRows[0].customer,
  };
}

export async function getOrderStats() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const [totalResult, pendingResult, shippedTodayResult, deliveredResult, newResult, revenueResult] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(orders),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          or(
            eq(orders.status, "new"),
            eq(orders.status, "confirmed")
          )
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(
          and(
            eq(orders.status, "shipped"),
            like(orders.shippedAt, `${today}%`)
          )
        ),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.status, "delivered")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.status, "new")),
      db
        .select({ total: sql<number>`sum(total_amount)` })
        .from(orders)
        .where(eq(orders.status, "delivered")),
    ]);

  return {
    totalOrders: Number(totalResult[0]?.count ?? 0),
    pendingOrders: Number(pendingResult[0]?.count ?? 0),
    shippedToday: Number(shippedTodayResult[0]?.count ?? 0),
    deliveredTotal: Number(deliveredResult[0]?.count ?? 0),
    newOrders: Number(newResult[0]?.count ?? 0),
    totalRevenue: Number(revenueResult[0]?.total ?? 0),
  };
}

export async function getDashboardData() {
  const [stats, recentOrdersResult, repeatCustomersResult] = await Promise.all([
    getOrderStats(),
    db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10),
    db
      .select()
      .from(customers)
      .where(sql`${customers.totalOrders} > 1`)
      .orderBy(desc(customers.totalOrders))
      .limit(5),
  ]);

  return {
    stats,
    recentOrders: recentOrdersResult,
    repeatCustomers: repeatCustomersResult,
  };
}
