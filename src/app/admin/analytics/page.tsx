export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { orders, customers } from "@/lib/db/schema";
import { eq, sql, desc, gt } from "drizzle-orm";
import { getOrderStats } from "@/lib/actions/orders";
import { getCustomerStats } from "@/lib/actions/customers";
import StatsCard from "@/components/stats-card";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500",
  confirmed: "bg-yellow-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
  returned: "bg-orange-500",
  cancelled: "bg-red-500",
};

const STATUS_BG: Record<string, string> = {
  new: "bg-blue-900/20 border-blue-800",
  confirmed: "bg-yellow-900/20 border-yellow-800",
  shipped: "bg-purple-900/20 border-purple-800",
  delivered: "bg-green-900/20 border-green-800",
  returned: "bg-orange-900/20 border-orange-800",
  cancelled: "bg-red-900/20 border-red-800",
};

const STATUS_TEXT: Record<string, string> = {
  new: "text-blue-300",
  confirmed: "text-yellow-300",
  shipped: "text-purple-300",
  delivered: "text-green-300",
  returned: "text-orange-300",
  cancelled: "text-red-300",
};

export default async function AnalyticsPage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const [orderStats, customerStats, statusBreakdown, topCities, newThisWeek, newThisMonth, avgRings] =
    await Promise.all([
      getOrderStats(),
      getCustomerStats(),
      // Orders by status
      db
        .select({
          status: orders.status,
          count: sql<number>`count(*)`,
        })
        .from(orders)
        .groupBy(orders.status),
      // Top cities
      db
        .select({
          city: customers.city,
          count: sql<number>`count(*)`,
        })
        .from(customers)
        .where(sql`${customers.city} IS NOT NULL AND ${customers.city} != ''`)
        .groupBy(customers.city)
        .orderBy(desc(sql`count(*)`))
        .limit(10),
      // New customers this week
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(sql`date(${customers.createdAt}) >= ${weekAgo}`),
      // New customers this month
      db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(sql`date(${customers.createdAt}) >= ${monthAgo}`),
      // Average rings per order
      db.select({ avg: sql<number>`avg(rings)` }).from(orders),
    ]);

  const totalOrders = orderStats.totalOrders;
  const repeatRate =
    customerStats.totalCustomers > 0
      ? Math.round(
          (customerStats.repeatCustomers / customerStats.totalCustomers) * 100
        )
      : 0;

  const avgRingsPerOrder = Number(avgRings[0]?.avg ?? 0).toFixed(1);

  // Build status breakdown with percentages
  const statusData = statusBreakdown.map((row) => ({
    status: row.status,
    count: Number(row.count),
    pct: totalOrders > 0 ? Math.round((Number(row.count) / totalOrders) * 100) : 0,
  }));
  statusData.sort((a, b) => b.count - a.count);

  const newThisWeekCount = Number(newThisWeek[0]?.count ?? 0);
  const newThisMonthCount = Number(newThisMonth[0]?.count ?? 0);

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Analytics</h2>
        <p className="text-xs text-slate-400 mt-0.5">Business overview</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title="Total Orders"
          value={orderStats.totalOrders}
          icon="📦"
          color="text-slate-100"
        />
        <StatsCard
          title="Total Customers"
          value={customerStats.totalCustomers}
          icon="👤"
          color="text-slate-100"
        />
        <StatsCard
          title="Repeat Rate"
          value={`${repeatRate}%`}
          subtitle={`${customerStats.repeatCustomers} repeat customers`}
          icon="🔄"
          color={repeatRate > 20 ? "text-green-400" : "text-slate-100"}
        />
        <StatsCard
          title="Avg Rings/Order"
          value={avgRingsPerOrder}
          subtitle="rings per order"
          icon="🔘"
          color="text-amber-400"
        />
        <StatsCard
          title="Revenue"
          value={formatCurrency(orderStats.totalRevenue)}
          subtitle="from delivered orders"
          icon="💰"
          color="text-amber-400"
          trend="up"
        />
        <StatsCard
          title="Delivered"
          value={orderStats.deliveredTotal}
          subtitle="orders completed"
          icon="✅"
          color="text-green-400"
        />
      </div>

      {/* Orders by status */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          Orders by Status
        </h3>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">
              No orders yet
            </p>
          ) : (
            statusData.map(({ status, count, pct }) => (
              <div key={status} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={`font-semibold capitalize ${STATUS_TEXT[status] ?? "text-slate-300"}`}
                  >
                    {status}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{count} orders</span>
                    <span
                      className={`font-bold ${STATUS_TEXT[status] ?? "text-slate-300"}`}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[status] ?? "bg-slate-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Top cities */}
      {topCities.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
            Top Cities
          </h3>
          <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800">
            {topCities.map((city, index) => (
              <div
                key={city.city ?? index}
                className="flex items-center justify-between px-4 py-3 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-500 w-5 text-right shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-100 truncate">
                    {city.city || "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-sm font-bold text-amber-400">
                    {city.count}
                  </span>
                  <span className="text-xs text-slate-500">customers</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer acquisition */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          Customer Acquisition
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">This Week</p>
            <p className="text-3xl font-black text-slate-100">
              {newThisWeekCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">new customers</p>
          </div>
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
            <p className="text-xs text-slate-500 mb-1">This Month</p>
            <p className="text-3xl font-black text-slate-100">
              {newThisMonthCount}
            </p>
            <p className="text-xs text-slate-500 mt-1">new customers</p>
          </div>
        </div>
      </section>
    </div>
  );
}
