"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getCustomer } from "@/lib/actions/customers";
import { formatDate, formatCurrency } from "@/lib/utils";
import StatusBadge from "@/components/status-badge";
import Link from "next/link";

interface Customer {
  id: number;
  name: string;
  phone: string;
  city: string | null;
  totalOrders: number | null;
  totalRings: number | null;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  createdAt: string | null;
  address: string | null;
  pincode: string | null;
}

interface CustomerOrder {
  id: number;
  status: string;
  rings: number;
  totalAmount: number | null;
  createdAt: string | null;
}

interface CustomerDetail extends Customer {
  orders: CustomerOrder[];
}

interface CustomerListClientProps {
  customers: Customer[];
  total: number;
  currentPage: number;
  totalPages: number;
  currentSearch: string;
  currentSort: string;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "orders", label: "Most Orders" },
  { value: "name", label: "Name A–Z" },
];

export default function CustomerListClient({
  customers,
  total,
  currentPage,
  totalPages,
  currentSearch,
  currentSort,
}: CustomerListClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null);
  const [customerDetails, setCustomerDetails] = useState<
    Record<number, CustomerDetail>
  >({});

  function updateUrl(updates: Record<string, string>) {
    const p = new URLSearchParams();
    const q = updates.search ?? search;
    const s = updates.sort ?? currentSort;
    const pg = updates.page ?? "1";
    if (q) p.set("search", q);
    if (s && s !== "recent") p.set("sort", s);
    if (pg && pg !== "1") p.set("page", pg);
    const query = p.toString();
    startTransition(() => {
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ search });
  }

  async function toggleExpand(customerId: number) {
    if (expandedId === customerId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(customerId);

    if (!customerDetails[customerId]) {
      setLoadingDetail(customerId);
      try {
        const detail = await getCustomer(customerId);
        if (detail) {
          setCustomerDetails((prev) => ({
            ...prev,
            [customerId]: detail as CustomerDetail,
          }));
        }
      } catch {
        // silently fail
      } finally {
        setLoadingDetail(null);
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, city…"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
      </form>

      {/* Sort pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => updateUrl({ sort: opt.value })}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentSort === opt.value
                ? "bg-amber-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 border border-slate-600 border-t-amber-400 rounded-full animate-spin" />
          Loading…
        </div>
      )}

      {/* Customer list */}
      {customers.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-sm">No customers found</p>
          {currentSearch && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                updateUrl({ search: "" });
              }}
              className="text-xs text-amber-400 hover:text-amber-300 mt-2 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => {
            const isRepeat = (customer.totalOrders ?? 0) > 1;
            const isExpanded = expandedId === customer.id;
            const detail = customerDetails[customer.id];
            const isLoadingThis = loadingDetail === customer.id;

            return (
              <div
                key={customer.id}
                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
              >
                {/* Customer row */}
                <button
                  type="button"
                  onClick={() => toggleExpand(customer.id)}
                  className="w-full text-left p-4 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-100 text-sm">
                          {customer.name}
                        </span>
                        {isRepeat && (
                          <span className="text-[10px] font-bold bg-amber-900/50 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            Repeat
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {customer.phone}
                        {customer.city ? ` · ${customer.city}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Orders</p>
                        <p className="text-sm font-bold text-amber-400">
                          {customer.totalOrders ?? 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Rings</p>
                        <p className="text-sm font-bold text-slate-100">
                          {customer.totalRings ?? 0}
                        </p>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`w-4 h-4 text-slate-500 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>

                  {customer.lastOrderAt && (
                    <p className="text-xs text-slate-600 mt-2">
                      Last order: {formatDate(customer.lastOrderAt)}
                    </p>
                  )}
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-slate-800 px-4 pb-4 pt-3 space-y-3">
                    {isLoadingThis ? (
                      <div className="flex items-center justify-center py-4 gap-2 text-slate-500 text-xs">
                        <div className="w-4 h-4 border border-slate-600 border-t-amber-400 rounded-full animate-spin" />
                        Loading orders…
                      </div>
                    ) : detail ? (
                      <>
                        {/* Customer meta */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-slate-500">First Order</p>
                            <p className="text-slate-300 font-medium">
                              {formatDate(detail.firstOrderAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Total Spent</p>
                            <p className="text-amber-400 font-bold">
                              {formatCurrency(
                                (detail.totalRings ?? 0) * 250
                              )}
                            </p>
                          </div>
                          {detail.address && (
                            <div className="col-span-2">
                              <p className="text-slate-500">Address</p>
                              <p className="text-slate-300">{detail.address}</p>
                            </div>
                          )}
                        </div>

                        {/* Orders list */}
                        {detail.orders && detail.orders.length > 0 && (
                          <div>
                            <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">
                              Orders
                            </p>
                            <div className="space-y-1.5">
                              {detail.orders.map((o) => (
                                <Link
                                  key={o.id}
                                  href={`/admin/orders/${o.id}`}
                                  className="flex items-center justify-between px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors"
                                >
                                  <span className="text-slate-300">
                                    #{o.id} — {o.rings} ring
                                    {o.rings !== 1 ? "s" : ""}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">
                                      {formatDate(o.createdAt)}
                                    </span>
                                    <StatusBadge status={o.status} />
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2 pb-4">
          {currentPage > 1 && (
            <button
              type="button"
              onClick={() => updateUrl({ page: String(currentPage - 1) })}
              className="px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              ← Prev
            </button>
          )}
          <span className="text-sm text-slate-400">
            {currentPage} / {totalPages}
          </span>
          {currentPage < totalPages && (
            <button
              type="button"
              onClick={() => updateUrl({ page: String(currentPage + 1) })}
              className="px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
