"use server";

import { db } from "../db";
import { customers, orders } from "../db/schema";
import { eq, like, desc, sql, gt, or } from "drizzle-orm";
import { normalizePhone } from "../phone";

const PAGE_SIZE = 20;

export async function getCustomers(search?: string, page: number = 1) {
  const offset = (page - 1) * PAGE_SIZE;

  const whereClause = search
    ? or(
        like(customers.name, `%${search}%`),
        like(customers.phone, `%${search}%`),
        like(customers.city, `%${search}%`)
      )
    : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(customers)
      .where(whereClause)
      .orderBy(desc(customers.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(whereClause),
  ]);

  const total = Number(totalResult[0]?.count ?? 0);
  return {
    customers: rows,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getCustomer(id: number) {
  const customerRows = await db
    .select()
    .from(customers)
    .where(eq(customers.id, id))
    .limit(1);

  if (!customerRows[0]) return null;

  const customerOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt));

  return {
    ...customerRows[0],
    orders: customerOrders,
  };
}

export async function getRepeatCustomers() {
  return await db
    .select()
    .from(customers)
    .where(gt(customers.totalOrders, 1))
    .orderBy(desc(customers.totalOrders));
}

export async function getCustomerByPhone(phone: string) {
  const normalized = normalizePhone(phone);
  const rows = await db
    .select()
    .from(customers)
    .where(eq(customers.phone, normalized))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCustomerStats() {
  const [totalResult, repeatResult, cityResult, avgResult] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(customers),
    db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
      .where(gt(customers.totalOrders, 1)),
    db
      .select({
        city: customers.city,
        cnt: sql<number>`count(*) as cnt`,
      })
      .from(customers)
      .groupBy(customers.city)
      .orderBy(desc(sql`cnt`))
      .limit(1),
    db
      .select({
        avg: sql<number>`avg(total_orders)`,
      })
      .from(customers),
  ]);

  return {
    totalCustomers: Number(totalResult[0]?.count ?? 0),
    repeatCustomers: Number(repeatResult[0]?.count ?? 0),
    topCity: cityResult[0]?.city ?? null,
    avgOrdersPerCustomer: Number(avgResult[0]?.avg ?? 0).toFixed(1),
  };
}

