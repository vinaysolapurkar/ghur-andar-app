export const dynamic = "force-dynamic";

import { getOrders } from "@/lib/actions/orders";
import OrderCard from "@/components/order-card";
import Link from "next/link";

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
] as const;

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function DTDOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status ?? "";
  const search = params.search ?? "";
  const page = Math.max(1, Number(params.page ?? 1));

  const { orders, totalPages, total } = await getOrders({
    status: status || undefined,
    search: search || undefined,
    page,
  });

  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const next = new URLSearchParams();
    const merged: Record<string, string> = {};
    if (status) merged.status = status;
    if (search) merged.search = search;
    merged.page = String(page);
    for (const [k, v] of Object.entries(overrides)) {
      if (v !== undefined && v !== "") merged[k] = String(v);
      else delete merged[k];
    }
    for (const [k, v] of Object.entries(merged)) {
      if (v) next.set(k, v);
    }
    return `/dtd/orders?${next.toString()}`;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Sticky filter bar under the layout header */}
      <div className="sticky top-14 z-30 bg-slate-950 border-b border-slate-800 px-4 pt-3 pb-2 space-y-2">
        {/* Search */}
        <form method="GET" action="/dtd/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search name, phone, tracking…"
              className="w-full bg-slate-800 text-slate-100 placeholder:text-slate-500 text-sm rounded-lg pl-9 pr-3 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </form>

        {/* Status filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {STATUS_FILTERS.map((f) => {
            const isActive = status === f.value;
            return (
              <Link
                key={f.value}
                href={buildUrl({ status: f.value || undefined, page: 1 })}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  isActive
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 max-w-lg mx-auto w-full">
        {/* Result count */}
        <p className="text-xs text-slate-500 mb-3">
          {total === 0
            ? "No orders found"
            : `${total} order${total !== 1 ? "s" : ""}${search ? ` matching "${search}"` : ""}`}
        </p>

        {/* Order cards */}
        {orders.length === 0 ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-10 text-center mt-4">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-slate-300 font-semibold">No orders here</p>
            <p className="text-slate-500 text-sm mt-1">
              {search
                ? "Try a different search term."
                : "Nothing in this category yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={{
                  ...order,
                  pincode: order.pincode ?? "",
                }}
                basePath="/dtd/orders"
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 gap-3">
            {page > 1 ? (
              <Link
                href={buildUrl({ page: page - 1 })}
                className="flex-1 text-center text-sm font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 py-2.5 transition-all"
              >
                ← Prev
              </Link>
            ) : (
              <span className="flex-1" />
            )}

            <span className="text-xs text-slate-500 whitespace-nowrap">
              {page} / {totalPages}
            </span>

            {page < totalPages ? (
              <Link
                href={buildUrl({ page: page + 1 })}
                className="flex-1 text-center text-sm font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 py-2.5 transition-all"
              >
                Next →
              </Link>
            ) : (
              <span className="flex-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
