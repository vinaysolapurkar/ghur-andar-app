export const dynamic = "force-dynamic";

import { getOrders, getOrderStats } from "@/lib/actions/orders";
import { getStockBalance } from "@/lib/actions/stock";
import StatsCard from "@/components/stats-card";
import { DashboardShipCard } from "@/components/order-actions";
import Link from "next/link";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

async function getShippedThisWeek(): Promise<number> {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const msBack = dayOfWeek * 24 * 60 * 60 * 1000;
  const weekStart = new Date(now.getTime() - msBack);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().slice(0, 10); // YYYY-MM-DD

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.status, "shipped"),
        gte(orders.shippedAt, weekStartStr)
      )
    );

  return Number(result[0]?.count ?? 0);
}

export default async function DTDDashboardPage() {
  const [stats, stockBalance, actionItemsResult, shippedThisWeek] =
    await Promise.all([
      getOrderStats(),
      getStockBalance(),
      getOrders({ status: "confirmed", limit: 50 }),
      getShippedThisWeek(),
    ]);

  const actionOrders = actionItemsResult.orders;
  const pendingCount = stats.pendingOrders;

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
      {/* Stats grid */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <StatsCard
            title="Pending Orders"
            value={pendingCount}
            subtitle="New + confirmed"
            icon="📦"
            color={pendingCount > 0 ? "text-amber-400" : "text-slate-900"}
          />
          <StatsCard
            title="To Ship"
            value={actionOrders.length}
            subtitle="confirmed orders"
            icon="🚚"
            color="text-purple-400"
          />
          <StatsCard
            title="Shipped This Week"
            value={shippedThisWeek}
            subtitle="in transit"
            icon="📫"
            color="text-blue-400"
          />
          <StatsCard
            title="Stock with Me"
            value={stockBalance}
            subtitle="rings available"
            icon="💍"
            color={
              stockBalance > 20
                ? "text-green-400"
                : stockBalance >= 5
                  ? "text-yellow-400"
                  : "text-red-400"
            }
          />
        </div>
      </section>

      {/* Action items */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center gap-2">
            Needs Shipping
            {actionOrders.length > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold">
                {actionOrders.length}
              </span>
            )}
          </h2>
          <Link
            href="/dtd/orders"
            className="text-xs text-amber-400 hover:text-amber-300 font-medium"
          >
            View all →
          </Link>
        </div>

        {actionOrders.length === 0 ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-center">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-slate-300 font-semibold">All caught up!</p>
            <p className="text-slate-500 text-sm mt-1">
              No confirmed orders waiting to ship.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {actionOrders.map((order) => (
              <DashboardShipCard
                key={order.id}
                order={{
                  id: order.id,
                  name: order.name,
                  address: order.address,
                  city: order.city,
                  pincode: order.pincode,
                  rings: order.rings,
                  phone: order.phone ?? "",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
