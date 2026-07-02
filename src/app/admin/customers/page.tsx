export const dynamic = "force-dynamic";

import { getCustomers } from "@/lib/actions/customers";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import CustomerListClient from "./customer-list-client";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search || undefined;
  const page = parseInt(params.page ?? "1", 10) || 1;

  const result = await getCustomers(search, page);

  // Sort client-side based on sort param (db already gives us latest first by default)
  const sort = params.sort ?? "recent";
  const sorted = [...result.customers].sort((a, b) => {
    if (sort === "orders") {
      return (b.totalOrders ?? 0) - (a.totalOrders ?? 0);
    }
    if (sort === "name") {
      return a.name.localeCompare(b.name);
    }
    // Default: most recent (already sorted by createdAt desc from DB)
    return 0;
  });

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Customers</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {result.total} total customers
        </p>
      </div>

      {/* Client-side search + sort + expand */}
      <CustomerListClient
        customers={sorted}
        total={result.total}
        currentPage={page}
        totalPages={result.totalPages}
        currentSearch={search ?? ""}
        currentSort={sort}
      />
    </div>
  );
}
