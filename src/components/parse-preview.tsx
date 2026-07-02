"use client";

import { useState } from "react";

interface ParsedOrder {
  name: string;
  phone: string;
  address: string;
  rings: number;
  pincode: string;
  city: string;
  confidence: "high" | "medium" | "low";
  rawMessage: string;
}

interface ParsePreviewProps {
  parsedOrders: ParsedOrder[];
  onChange?: (index: number, updated: Partial<ParsedOrder>) => void;
  onSubmit?: (orders: ParsedOrder[]) => void;
}

type Confidence = "high" | "medium" | "low";

const confidenceConfig: Record<
  Confidence,
  { label: string; classes: string }
> = {
  high: {
    label: "High confidence",
    classes: "bg-green-100 text-green-700 border border-green-200",
  },
  medium: {
    label: "Medium confidence",
    classes: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  low: {
    label: "Low confidence",
    classes: "bg-red-100 text-red-700 border border-red-200",
  },
};

function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  const cfg = confidenceConfig[confidence] ?? confidenceConfig.low;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.classes}`}
    >
      {cfg.label}
    </span>
  );
}

interface OrderFormCardProps {
  order: ParsedOrder;
  index: number;
  onChange: (index: number, updated: Partial<ParsedOrder>) => void;
  onSubmit: (order: ParsedOrder) => void;
}

function OrderFormCard({
  order,
  index,
  onChange,
  onSubmit,
}: OrderFormCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="font-semibold text-slate-800 truncate">
            {order.name || "Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ConfidenceBadge confidence={order.confidence} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div className="p-4 space-y-3">
        {/* Name + Phone row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Name
            </label>
            <input
              type="text"
              value={order.name}
              onChange={(e) => onChange(index, { name: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-slate-900"
              placeholder="Customer name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={order.phone}
              onChange={(e) => onChange(index, { phone: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-slate-900"
              placeholder="Phone number"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Address
          </label>
          <textarea
            value={order.address}
            onChange={(e) => onChange(index, { address: e.target.value })}
            rows={2}
            className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-slate-900 resize-none"
            placeholder="Full address"
          />
        </div>

        {/* Rings + Pincode row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Rings
            </label>
            <input
              type="number"
              min={1}
              value={order.rings}
              onChange={(e) =>
                onChange(index, { rings: parseInt(e.target.value, 10) || 1 })
              }
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Pincode
            </label>
            <input
              type="text"
              value={order.pincode}
              onChange={(e) => onChange(index, { pincode: e.target.value })}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white text-slate-900"
              placeholder="PIN code"
            />
          </div>
        </div>

        {/* Raw message (collapsible) */}
        {expanded && order.rawMessage && (
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Original Message
            </label>
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 whitespace-pre-wrap font-mono leading-relaxed">
              {order.rawMessage}
            </div>
          </div>
        )}

        {/* Create Order button */}
        <button
          type="button"
          onClick={() => onSubmit(order)}
          className="w-full bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          Create Order
        </button>
      </div>
    </div>
  );
}

export default function ParsePreview({
  parsedOrders: initialOrders,
  onChange,
  onSubmit,
}: ParsePreviewProps) {
  const [orders, setOrders] = useState<ParsedOrder[]>(initialOrders);

  const handleChange = (index: number, updated: Partial<ParsedOrder>) => {
    setOrders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updated };
      return next;
    });
    onChange?.(index, updated);
  };

  const handleSubmitOne = (order: ParsedOrder) => {
    onSubmit?.([order]);
  };

  const handleSubmitAll = () => {
    onSubmit?.(orders);
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400">
        <p className="text-sm">No orders parsed yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-bold text-slate-900 text-base">
            Parsed Orders
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {orders.length} order{orders.length !== 1 ? "s" : ""} detected
          </p>
        </div>
        {orders.length > 1 && (
          <button
            type="button"
            onClick={handleSubmitAll}
            className="flex-shrink-0 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Create All ({orders.length})
          </button>
        )}
      </div>

      {/* Order cards */}
      <div className="space-y-4">
        {orders.map((order, index) => (
          <OrderFormCard
            key={index}
            order={order}
            index={index}
            onChange={handleChange}
            onSubmit={handleSubmitOne}
          />
        ))}
      </div>

      {/* Create All sticky bottom (mobile UX) */}
      {orders.length > 1 && (
        <div className="sticky bottom-[72px] pt-2">
          <button
            type="button"
            onClick={handleSubmitAll}
            className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white text-sm font-bold py-3 rounded-xl shadow-lg transition-colors"
          >
            Create All {orders.length} Orders — ₹{orders.reduce((sum, o) => sum + o.rings * 250, 0).toLocaleString("en-IN")}
          </button>
        </div>
      )}
    </div>
  );
}
