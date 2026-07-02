export const dynamic = "force-dynamic";

import { getOrderStats, getOrders } from "@/lib/actions/orders";
import { getRepeatCustomers } from "@/lib/actions/customers";
import { getStockBalance } from "@/lib/actions/stock";
import StatsCard from "@/components/stats-card";
import OrderCard from "@/components/order-card";
import QuickPasteSection from "./quick-paste-section";

export default async function AdminDashboardPage() {
  const [stats, ordersResult, repeatCustomers, stockBalance] =
    await Promise.all([
      getOrderStats(),
      getOrders({ limit: 10 }),
      getRepeatCustomers(),
      getStockBalance(),
    ]);

  const recentOrders = ordersResult.orders;

  return (
    <div className="px-4 py-5 space-y-6 max-w-2xl mx-auto">
      {/* Page title */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Dashboard</h2>
        <p className="text-xs text-slate-400 mt-0.5">Admin overview</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📦"
          color="text-slate-100"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingOrders}
          subtitle="new + confirmed"
          icon="⏳"
          color="text-yellow-400"
        />
        <StatsCard
          title="Stock Left"
          value={stockBalance}
          subtitle="units available"
          icon="🔘"
          color={
            stockBalance > 20
              ? "text-green-400"
              : stockBalance >= 5
                ? "text-yellow-400"
                : "text-red-400"
          }
        />
        <StatsCard
          title="Revenue"
          value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
          subtitle="from delivered"
          icon="💰"
          color="text-amber-400"
        />
      </div>

      {/* Quick paste section (client component) */}
      <QuickPasteSection />

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
            Recent Orders
          </h3>
          <a
            href="/admin/orders"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all →
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No orders yet
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...order,
                  pincode: order.pincode ?? "",
                  trackingNumber: order.trackingNumber ?? null,
                }}
                basePath="/admin/orders"
              />
            ))}
          </div>
        )}
      </section>

      {/* Repeat Customers */}
      {repeatCustomers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Repeat Customers
            </h3>
            <a
              href="/admin/customers"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              View all →
            </a>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 divide-y divide-slate-800">
            {repeatCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between px-4 py-3 gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {customer.name}
                  </p>
                  <p className="text-xs text-slate-400">{customer.phone}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Orders</p>
                    <p className="text-sm font-bold text-amber-400">
                      {customer.totalOrders}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Rings</p>
                    <p className="text-sm font-bold text-slate-100">
                      {customer.totalRings}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
