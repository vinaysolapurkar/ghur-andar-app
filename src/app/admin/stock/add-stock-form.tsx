"use client";

import { useState } from "react";
import { addStock } from "@/lib/actions/stock";
import { useRouter } from "next/navigation";

const REASONS = [
  { value: "Restock", label: "Restock" },
  { value: "Return", label: "Customer Return" },
  { value: "Adjustment", label: "Manual Adjustment" },
];

interface AddStockFormProps {
  currentBalance: number;
}

export default function AddStockForm({ currentBalance }: AddStockFormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("Restock");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const qty = parseInt(quantity, 10);
  const newBalance = !isNaN(qty) && qty > 0 ? currentBalance + qty : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!qty || qty <= 0) return;

    setSubmitting(true);
    setFeedback(null);

    try {
      const result = await addStock(qty, `${reason} (+${qty})`);
      setFeedback({
        type: "success",
        message: `Added ${qty} units. New balance: ${result.balanceAfter}`,
      });
      setQuantity("");
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to add stock",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Add Stock
      </h3>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Quantity input */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Quantity to Add
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="e.g. 50"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
          {newBalance !== null && (
            <p className="text-xs text-slate-400 mt-1">
              New balance will be{" "}
              <span className="font-bold text-amber-400">{newBalance}</span>
            </p>
          )}
        </div>

        {/* Reason dropdown */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Reason
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!qty || qty <= 0 || submitting}
          className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-colors"
        >
          {submitting ? "Adding…" : `Add ${qty > 0 ? qty : ""} Units`}
        </button>
      </form>

      {feedback && (
        <div
          className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-900/30 border border-green-700 text-green-300"
              : "bg-red-900/30 border border-red-700 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </section>
  );
}
