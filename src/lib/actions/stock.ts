"use server";

import { db } from "../db";
import { stockLedger } from "../db/schema";
import { desc } from "drizzle-orm";

async function getCurrentBalance(): Promise<number> {
  const latest = await db
    .select({ balanceAfter: stockLedger.balanceAfter })
    .from(stockLedger)
    .orderBy(desc(stockLedger.id))
    .limit(1);
  return latest[0]?.balanceAfter ?? 0;
}

export async function getStockBalance(): Promise<number> {
  return getCurrentBalance();
}

export async function addStock(
  amount: number,
  reason: string
): Promise<{ balanceAfter: number }> {
  const current = await getCurrentBalance();
  const balanceAfter = current + amount;

  await db.insert(stockLedger).values({
    change: amount,
    reason,
    balanceAfter,
    orderId: null,
  });

  return { balanceAfter };
}

export async function getStockHistory(limit: number = 50) {
  return await db
    .select()
    .from(stockLedger)
    .orderBy(desc(stockLedger.id))
    .limit(limit);
}

export async function deductStock(
  amount: number,
  orderId: number
): Promise<{ balanceAfter: number }> {
  const current = await getCurrentBalance();
  const balanceAfter = current - amount;

  await db.insert(stockLedger).values({
    change: -amount,
    reason: `Order #${orderId} - auto deduct`,
    balanceAfter,
    orderId,
  });

  return { balanceAfter };
}
