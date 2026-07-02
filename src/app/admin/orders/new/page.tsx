"use client";

import { useState } from "react";
import { parseWhatsAppMessages, type ParsedOrder } from "@/lib/parser";
import ParsePreview from "@/components/parse-preview";
import { createOrder } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";

export default function NewOrderPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedOrder[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<
    { success: boolean; name: string; error?: string }[]
  >([]);
  const [showResults, setShowResults] = useState(false);

  function handleParse() {
    const results = parseWhatsAppMessages(text);
    setParsed(results);
    setHasParsed(true);
    setShowResults(false);
    setResults([]);
  }

  function handleClear() {
    setText("");
    setParsed([]);
    setHasParsed(false);
    setShowResults(false);
    setResults([]);
  }

  async function handleSubmit(orders: ParsedOrder[]) {
    setSubmitting(true);
    setShowResults(false);
    const outcomes: { success: boolean; name: string; error?: string }[] = [];

    for (const order of orders) {
      try {
        await createOrder({
          name: order.name,
          phone: order.phone,
          address: order.address,
          rings: order.rings,
          pincode: order.pincode || undefined,
          city: order.city || undefined,
          rawMessage: order.rawMessage,
        });
        outcomes.push({ success: true, name: order.name });
      } catch (err) {
        outcomes.push({
          success: false,
          name: order.name,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }

    setResults(outcomes);
    setShowResults(true);
    setSubmitting(false);

    const allSucceeded = outcomes.every((o) => o.success);
    if (allSucceeded) {
      // Navigate to orders list after short delay
      setTimeout(() => router.push("/admin/orders"), 2000);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failCount = results.filter((r) => !r.success).length;

  return (
    <div className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">New Orders</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Paste WhatsApp messages to create orders
        </p>
      </div>

      {/* Textarea */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          WhatsApp Messages
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Paste order messages here…\n\nExample:\nName: Priya Sharma\nPhone: 9876543210\nAddress: 12 MG Road, Pune 411001\nRings: 2`}
          rows={10}
          className="w-full text-sm bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none font-mono leading-relaxed"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleParse}
            disabled={!text.trim() || submitting}
            className="flex-1 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold py-3 rounded-xl transition-colors"
          >
            Parse Orders
          </button>
          {hasParsed && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Results feedback */}
      {showResults && (
        <div
          className={`rounded-xl border p-4 space-y-2 ${
            failCount === 0
              ? "bg-green-900/30 border-green-700"
              : "bg-slate-900 border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {failCount === 0 ? (
              <>
                <span className="text-green-400 font-bold text-sm">
                  {successCount} order{successCount !== 1 ? "s" : ""} created
                  successfully!
                </span>
                <span className="text-xs text-slate-400">
                  Redirecting to orders…
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-slate-100">
                {successCount} succeeded, {failCount} failed
              </span>
            )}
          </div>

          {results.map((r, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 text-xs ${
                r.success ? "text-green-300" : "text-red-300"
              }`}
            >
              <span>{r.success ? "✓" : "✗"}</span>
              <span className="font-medium">{r.name || "Unknown"}</span>
              {!r.success && r.error && (
                <span className="text-red-400">— {r.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Parsed preview */}
      {hasParsed && !showResults && (
        <>
          {submitting ? (
            <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
              <span className="text-sm">Creating orders…</span>
            </div>
          ) : parsed.length === 0 ? (
            <div className="text-center py-10 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-slate-400 text-sm">
                No orders detected in the pasted text.
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Make sure the message has Name:, Phone:, and Address: fields.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">
                {parsed.length} order{parsed.length !== 1 ? "s" : ""} detected
                — review and submit below
              </p>
              <ParsePreview
                parsedOrders={parsed}
                onSubmit={handleSubmit}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
