"use client";

import { useState } from "react";
import { parseWhatsAppMessages } from "@/lib/parser";
import ParsePreview from "@/components/parse-preview";
import { createOrder } from "@/lib/actions/orders";
import type { ParsedOrder } from "@/lib/parser";

export default function QuickPasteSection() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedOrder[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleParse() {
    const results = parseWhatsAppMessages(text);
    setParsed(results);
    setHasParsed(true);
    setSuccessCount(null);
    setError(null);
  }

  async function handleSubmit(orders: ParsedOrder[]) {
    setSubmitting(true);
    setError(null);
    let count = 0;
    try {
      for (const order of orders) {
        await createOrder({
          name: order.name,
          phone: order.phone,
          address: order.address,
          rings: order.rings,
          pincode: order.pincode || undefined,
          city: order.city || undefined,
          rawMessage: order.rawMessage,
        });
        count++;
      }
      setSuccessCount(count);
      setParsed([]);
      setHasParsed(false);
      setText("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create order(s)"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
          Quick Paste
        </h3>
        <span className="text-xs text-slate-500">Paste WhatsApp messages</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste order message(s) here…"
        rows={4}
        className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
      />

      <button
        type="button"
        onClick={handleParse}
        disabled={!text.trim()}
        className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        Parse
      </button>

      {successCount !== null && (
        <div className="rounded-lg bg-green-900/40 border border-green-700 px-3 py-2 text-sm text-green-300 font-medium">
          {successCount} order{successCount !== 1 ? "s" : ""} created
          successfully!
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/40 border border-red-700 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {hasParsed && parsed.length > 0 && (
        <div className="pt-1">
          {submitting ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-slate-600 border-t-amber-400 rounded-full animate-spin" />
              Creating orders…
            </div>
          ) : (
            <ParsePreview
              parsedOrders={parsed}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      )}

      {hasParsed && parsed.length === 0 && (
        <div className="text-center py-4 text-slate-500 text-sm">
          Could not parse any orders from the pasted text.
        </div>
      )}
    </section>
  );
}
