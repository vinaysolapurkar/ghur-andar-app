export const dynamic = "force-dynamic";

import { getStockBalance, getStockHistory } from "@/lib/actions/stock";
import StockIndicator from "@/components/stock-indicator";
import { formatDate } from "@/lib/utils";
import AddStockForm from "./add-stock-form";

export default async function StockPage() {
  const [balance, history] = await Promise.all([
    getStockBalance(),
    getStockHistory(50),
  ]);

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">Stock</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Ghur.Andar ring inventory
        </p>
      </div>

      {/* Large stock count */}
      <StockIndicator current={balance} label="Current Stock" />

      {/* Add stock form (client component) */}
      <AddStockForm currentBalance={balance} />

      {/* Stock history */}
      <section>
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
          History
        </h3>

        {history.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No stock movements yet
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="divide-y divide-slate-800">
              {history.map((entry) => {
                const isPositive = entry.change > 0;
                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3"
                  >
                    {/* Change amount */}
                    <div
                      className={`flex-shrink-0 w-16 text-sm font-bold text-right ${
                        isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {entry.change}
                    </div>

                    {/* Reason */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate">
                        {entry.reason}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatDate(entry.createdAt)}
                      </p>
                    </div>

                    {/* Balance after */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-slate-500">Balance</p>
                      <p className="text-sm font-semibold text-slate-300">
                        {entry.balanceAfter}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
