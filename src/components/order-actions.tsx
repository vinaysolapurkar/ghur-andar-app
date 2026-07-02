"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/lib/actions/orders";

// ─── Mark Shipped Form ────────────────────────────────────────────────────────

interface MarkShippedFormProps {
  orderId: number;
  /** if true, renders inline (no outer card wrapper) */
  inline?: boolean;
  onSuccess?: () => void;
}

export function MarkShippedForm({
  orderId,
  inline,
  onSuccess,
}: MarkShippedFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const tracking = inputRef.current?.value.trim() ?? "";
    if (!tracking) {
      setError("Please enter a tracking number.");
      return;
    }
    setError(null);

    startTransition(async () => {
      await updateOrderStatus(orderId, "shipped", tracking);
      setDone(true);
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
        <p className="text-green-700 font-semibold text-sm">
          Marked as Shipped!
        </p>
        <p className="text-green-600 text-xs mt-0.5">Page is refreshing…</p>
      </div>
    );
  }

  const content = (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Tracking Number
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. P10001234"
          defaultValue="P"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          autoFocus
          autoComplete="off"
        />
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base py-3 transition-all shadow-sm"
      >
        {isPending ? "Saving…" : "Confirm Shipped"}
      </button>
    </form>
  );

  if (inline) return content;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-semibold text-amber-800 mb-3">
        Enter Tracking Number
      </h3>
      {content}
    </div>
  );
}

// ─── Mark Delivered Button ────────────────────────────────────────────────────

interface MarkDeliveredButtonProps {
  orderId: number;
}

export function MarkDeliveredButton({ orderId }: MarkDeliveredButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleClick() {
    startTransition(async () => {
      await updateOrderStatus(orderId, "delivered");
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-center">
        <p className="text-green-700 font-semibold text-sm">
          Marked as Delivered!
        </p>
        <p className="text-green-600 text-xs mt-0.5">Page is refreshing…</p>
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-xl bg-green-600 hover:bg-green-500 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-base py-3.5 transition-all shadow-sm"
    >
      {isPending ? "Saving…" : "Mark as Delivered"}
    </button>
  );
}

// ─── Log Return Button ─────────────────────────────────────────────────────────

interface LogReturnButtonProps {
  orderId: number;
}

export function LogReturnButton({ orderId }: LogReturnButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [notes, setNotes] = useState("");

  function handleReturn() {
    startTransition(async () => {
      await updateOrderStatus(orderId, "returned", undefined, notes || undefined);
      setDone(true);
      router.refresh();
    });
  }

  if (done) {
    return (
      <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 text-center">
        <p className="text-orange-700 font-semibold text-sm">Return Logged</p>
        <p className="text-orange-600 text-xs mt-0.5">
          Stock has been restocked. Page is refreshing…
        </p>
      </div>
    );
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-full rounded-xl border-2 border-orange-400 text-orange-600 hover:bg-orange-50 active:scale-[0.98] font-bold text-base py-3.5 transition-all"
      >
        Log Return / Failed Delivery
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-orange-800">Log Return</h3>
      <p className="text-xs text-orange-600">
        This will mark the order as returned and restock the rings.
      </p>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          Notes (optional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Customer refused delivery"
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="flex-1 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm py-2.5 hover:bg-slate-100 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={handleReturn}
          disabled={isPending}
          className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-[0.98] disabled:opacity-60 text-white font-bold text-sm py-2.5 transition-all"
        >
          {isPending ? "Saving…" : "Confirm Return"}
        </button>
      </div>
    </div>
  );
}

// ─── Inline Dashboard "Mark Shipped" Card ─────────────────────────────────────
// Used on DTD dashboard for the action items list

interface DashboardShipCardProps {
  order: {
    id: number;
    name: string;
    address: string;
    city?: string | null;
    pincode?: string | null;
    rings: number;
    phone: string;
  };
}

export function DashboardShipCard({ order }: DashboardShipCardProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Order info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-base truncate">
              {order.name}
            </p>
            <p className="text-xs text-slate-500">{order.phone}</p>
          </div>
          <span className="shrink-0 inline-flex items-center gap-1 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            {order.rings}
          </span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">
          {order.address}
          {order.pincode ? `, ${order.pincode}` : ""}
          {order.city ? ` – ${order.city}` : ""}
        </p>
      </div>

      {/* Action section */}
      <div className="px-4 pb-4">
        {showForm ? (
          <MarkShippedForm
            orderId={order.id}
            inline
            onSuccess={() => setShowForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-white font-bold text-base py-3.5 transition-all shadow-sm"
          >
            Mark Shipped
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Copy Address Button ───────────────────────────────────────────────────────

interface CopyAddressButtonProps {
  address: string;
  city?: string | null;
  pincode?: string | null;
}

export function CopyAddressButton({
  address,
  city,
  pincode,
}: CopyAddressButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const parts = [address, city, pincode].filter(Boolean).join(", ");
    navigator.clipboard.writeText(parts).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
        copied
          ? "bg-green-50 border-green-200 text-green-700"
          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {copied ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy Address
        </>
      )}
    </button>
  );
}
