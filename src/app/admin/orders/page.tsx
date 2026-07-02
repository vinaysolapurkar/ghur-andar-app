export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import OrderCard from "@/components/order-card";
import OrdersFilterBar from "./orders-filter-bar";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ status?: string; search?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status && params.status !== "all" ? params.status : undefined;
  const search = params.search || undefined;
  const page = parseInt(params.page ?? "1", 10) || 1;

  const result = await getOrders({ status, search, page });

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Orders</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {result.total} total
          </p>
        </div>
        <Link
          href="/admin/orders/new"
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New
        </Link>
      </div>

      {/* Filter bar (client component) */}
      <OrdersFilterBar
        currentStatus={params.status ?? "all"}
        currentSearch={search ?? ""}
      />

      {/* Orders list */}
      {result.orders.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">No orders found</p>
          {(status || search) && (
            <a
              href="/admin/orders"
              className="text-xs text-amber-400 hover:text-amber-300 mt-2 block transition-colors"
            >
              Clear filters
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {result.orders.map((order) => (
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

      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-4">
          {page > 1 && (
            <Link
              href={`/admin/orders?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(search ? { search } : {}),
                page: String(page - 1),
              })}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← Prev
            </Link>
          )}

          <span className="text-sm text-slate-400">
            {page} / {result.totalPages}
          </span>

          {page < result.totalPages && (
            <Link
              href={`/admin/orders?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(search ? { search } : {}),
                page: String(page + 1),
              })}`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
