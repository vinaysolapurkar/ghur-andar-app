"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useTransition } from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
  { value: "cancelled", label: "Cancelled" },
];

interface OrdersFilterBarProps {
  currentStatus: string;
  currentSearch: string;
}

export default function OrdersFilterBar({
  currentStatus,
  currentSearch,
}: OrdersFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  function updateUrl(updates: Record<string, string>) {
    const params = new URLSearchParams();
    const status = updates.status ?? currentStatus;
    const q = updates.search ?? search;
    if (status && status !== "all") params.set("status", status);
    if (q) params.set("search", q);
    const query = params.toString();
    startTransition(() => {
      router.push(`${pathname}${query ? `?${query}` : ""}`);
    });
  }

  function handleStatusChange(value: string) {
    updateUrl({ status: value });
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl({ search });
  }

  function handleSearchClear() {
    setSearch("");
    updateUrl({ search: "" });
  }

  return (
    <div className="space-y-3">
      {/* Status filter pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleStatusChange(opt.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentStatus === opt.value
                ? "bg-amber-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 border border-slate-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

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
          placeholder="Search name, phone, address…"
          className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-10 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
        />
        {search && (
          <button
            type="button"
            onClick={handleSearchClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </form>

      {isPending && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3 h-3 border border-slate-600 border-t-amber-400 rounded-full animate-spin" />
          Filtering…
        </div>
      )}
    </div>
  );
}
