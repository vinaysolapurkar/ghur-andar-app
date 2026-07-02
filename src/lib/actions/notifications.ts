"use server";

import { db } from "../db";
import { notifications } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export async function getNotifications(role: string, limit: number = 50) {
  return await db
    .select()
    .from(notifications)
    .where(eq(notifications.targetRole, role))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getUnreadCount(role: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(
      and(eq(notifications.targetRole, role), eq(notifications.isRead, 0))
    );
  return Number(result[0]?.count ?? 0);
}

export async function markAllRead(role: string): Promise<void> {
  await db
    .update(notifications)
    .set({ isRead: 1 })
    .where(
      and(eq(notifications.targetRole, role), eq(notifications.isRead, 0))
    );
}

export async function createNotification(
  targetRole: string,
  message: string,
  orderId?: number
): Promise<void> {
  await db.insert(notifications).values({
    targetRole,
    message,
    orderId: orderId ?? null,
    isRead: 0,
  });
}
