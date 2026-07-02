"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";

interface Order {
  id: number;
  status: string;
  notes: string | null;
  trackingNumber: string | null;
}

interface OrderActionsProps {
  order: Order;
}

export default function OrderActions({ order }: OrderActionsProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [trackingInput, setTrackingInput] = useState(
    order.trackingNumber ?? ""
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  async function changeStatus(
    newStatus: string,
    trackingNumber?: string,
    notes?: string
  ) {
    setSaving(true);
    setFeedback(null);
    try {
      await updateOrderStatus(order.id, newStatus, trackingNumber, notes);
      setFeedback({ type: "success", message: `Status updated to ${newStatus}` });
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to update status",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveNote() {
    if (!note.trim()) return;
    setSaving(true);
    setFeedback(null);
    try {
      const existingNotes = order.notes ? order.notes + "\n" : "";
      await updateOrderStatus(
        order.id,
        order.status,
        undefined,
        existingNotes + `[${new Date().toLocaleDateString("en-IN")}] ${note.trim()}`
      );
      setNote("");
      setFeedback({ type: "success", message: "Note saved" });
      router.refresh();
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save note",
      });
    } finally {
      setSaving(false);
    }
  }

  const showConfirmButton = order.status === "new";
  const showShippedInfo = order.status === "confirmed";
  const showTrackingDisplay = order.status === "shipped";

  return (
    <div className="space-y-4">
      {/* Action buttons based on status */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Actions
        </h3>

        {showConfirmButton && (
          <button
            type="button"
            onClick={() => changeStatus("confirmed")}
            disabled={saving}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-white text-sm font-bold py-3 rounded-xl transition-colors"
          >
            {saving ? "Confirming…" : "Confirm Order"}
          </button>
        )}

        {showShippedInfo && (
          <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl px-4 py-3">
            <p className="text-sm font-medium text-yellow-300">
              Waiting for DTD to ship
            </p>
            <p className="text-xs text-yellow-500 mt-0.5">
              DTD will update tracking when shipped
            </p>
          </div>
        )}

        {showTrackingDisplay && order.trackingNumber && (
          <div className="bg-purple-900/20 border border-purple-800 rounded-xl px-4 py-3">
            <p className="text-xs text-purple-400 mb-0.5">Tracking Number</p>
            <p className="text-sm font-mono font-bold text-purple-200">
              {order.trackingNumber}
            </p>
          </div>
        )}

        {/* Cancel / Return options for eligible statuses */}
        {(order.status === "new" || order.status === "confirmed") && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Cancel this order?")) changeStatus("cancelled");
            }}
            disabled={saving}
            className="w-full bg-slate-800 hover:bg-red-900/50 border border-slate-700 hover:border-red-800 disabled:opacity-50 text-slate-400 hover:text-red-300 text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Cancel Order
          </button>
        )}

        {order.status === "delivered" && (
          <button
            type="button"
            onClick={() => {
              if (confirm("Mark as returned? Stock will be restocked."))
                changeStatus("returned");
            }}
            disabled={saving}
            className="w-full bg-slate-800 hover:bg-orange-900/30 border border-slate-700 hover:border-orange-800 disabled:opacity-50 text-slate-400 hover:text-orange-300 text-sm font-semibold py-2.5 rounded-xl transition-colors"
          >
            Mark as Returned
          </button>
        )}
      </section>

      {/* Existing Notes */}
      {order.notes && (
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Notes
          </h3>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
            {order.notes}
          </pre>
        </section>
      )}

      {/* Add Note */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Add Note
        </h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about this order…"
          rows={3}
          className="w-full text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
        />
        <button
          type="button"
          onClick={saveNote}
          disabled={!note.trim() || saving}
          className="w-full bg-slate-700 hover:bg-slate-600 active:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-100 text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving…" : "Save Note"}
        </button>
      </section>

      {/* Feedback */}
      {feedback && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-900/30 border border-green-700 text-green-300"
              : "bg-red-900/30 border border-red-700 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
}
