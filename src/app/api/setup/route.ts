import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export async function GET() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const statements = [
    `CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      city TEXT,
      pincode TEXT,
      total_orders INTEGER DEFAULT 0,
      total_rings INTEGER DEFAULT 0,
      first_order_at TEXT,
      last_order_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER REFERENCES customers(id),
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT NOT NULL,
      city TEXT,
      pincode TEXT,
      rings INTEGER NOT NULL DEFAULT 1,
      price_per_ring INTEGER DEFAULT 250,
      total_amount INTEGER DEFAULT 250,
      status TEXT NOT NULL DEFAULT 'new',
      tracking_number TEXT,
      return_tracking TEXT,
      raw_message TEXT,
      notes TEXT,
      created_by TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      shipped_at TEXT,
      delivered_at TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS stock_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      change INTEGER NOT NULL,
      reason TEXT NOT NULL,
      balance_after INTEGER NOT NULL,
      order_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_role TEXT NOT NULL,
      message TEXT NOT NULL,
      order_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`,
  ];

  const results: { table: string; status: string; error?: string }[] = [];
  const tableNames = ["customers", "orders", "stock_ledger", "notifications"];

  try {
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.execute(statements[i]);
        results.push({ table: tableNames[i], status: "ok" });
      } catch (err) {
        results.push({
          table: tableNames[i],
          status: "error",
          error: String(err),
        });
      }
    }

    const allOk = results.every((r) => r.status === "ok");
    return NextResponse.json({
      success: allOk,
      message: allOk ? "All tables created successfully" : "Some tables had errors",
      tables: results,
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  } finally {
    client.close();
  }
}
