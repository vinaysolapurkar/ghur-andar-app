export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/actions/orders";
import OrderTimeline from "@/components/order-timeline";
import StatusBadge from "@/components/status-badge";
import {
  CopyAddressButton,
  LogReturnButton,
  MarkDeliveredButton,
  MarkShippedForm,
} from "@/components/order-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DTDOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (isNaN(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  const isConfirmed = order.status === "confirmed";
  const isShipped = order.status === "shipped";
  const isDelivered = order.status === "delivered";
  const isTerminal =
    order.status === "returned" || order.status === "cancelled";

  return (
    <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
      {/* Back + order header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dtd/orders"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 transition-colors text-slate-300 shrink-0"
          aria-label="Back to orders"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-400">Order #{order.id}</p>
          <h2 className="text-base font-bold text-slate-100 truncate leading-tight">
            {order.name}
          </h2>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <OrderTimeline currentStatus={order.status} />

      {/* Action buttons — shown prominently at top for speed */}
      {(isConfirmed || isShipped) && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
            Actions
          </h2>

          {isConfirmed && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-3">
                Mark as Shipped
              </h3>
              <MarkShippedForm orderId={order.id} inline />
            </div>
          )}

          {isShipped && (
            <div className="space-y-3">
              <MarkDeliveredButton orderId={order.id} />
              <LogReturnButton orderId={order.id} />
            </div>
          )}
        </section>
      )}

      {/* Customer info */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Customer
          </h2>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Name</p>
              <p className="text-sm font-semibold text-slate-900">
                {order.name}
              </p>
            </div>
            {order.customer?.totalOrders && order.customer.totalOrders > 1 ? (
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                {order.customer.totalOrders}x customer
              </span>
            ) : null}
          </div>

          {/* Phone */}
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Phone</p>
            <a
              href={`tel:${order.phone}`}
              className="text-sm font-semibold text-amber-600 hover:text-amber-500 active:underline"
            >
              {order.phone}
            </a>
          </div>

          {/* Address with copy button */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs text-slate-400">Delivery Address</p>
              <CopyAddressButton
                address={order.address}
                city={order.city}
                pincode={order.pincode}
              />
            </div>
            <p className="text-sm text-slate-800 leading-snug">
              {order.address}
              {order.city ? `, ${order.city}` : ""}
              {order.pincode ? ` – ${order.pincode}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* Order details */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Order Details
          </h2>
        </div>

        <div className="p-4 space-y-3">
          {/* Rings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-amber-500"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span className="text-sm text-slate-600">Rings</span>
            </div>
            <span className="text-base font-bold text-slate-900">
              {order.rings} ring{order.rings !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Amount</span>
            <span className="text-base font-bold text-slate-900">
              ₹{(order.totalAmount ?? 0).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Tracking */}
          {order.trackingNumber && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Tracking No.</span>
              <span className="text-sm font-mono font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded">
                {order.trackingNumber}
              </span>
            </div>
          )}

          {/* Return tracking */}
          {order.returnTracking && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Return Tracking</span>
              <span className="text-sm font-mono font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                {order.returnTracking}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Timestamps */}
      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
            Timestamps
          </h2>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Ordered</span>
            <span className="text-slate-800 font-medium">
              {formatDate(order.createdAt)}
            </span>
          </div>
          {order.shippedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Shipped</span>
              <span className="text-slate-800 font-medium">
                {formatDate(order.shippedAt)}
              </span>
            </div>
          )}
          {order.deliveredAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Delivered</span>
              <span className="text-slate-800 font-medium">
                {formatDate(order.deliveredAt)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Notes */}
      {order.notes && (
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Notes
            </h2>
          </div>
          <div className="p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {order.notes}
            </p>
          </div>
        </section>
      )}

      {/* Delivered state */}
      {isDelivered && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-5 text-center">
          <p className="text-2xl mb-1">✅</p>
          <p className="text-green-700 font-bold">Delivered!</p>
          <p className="text-green-600 text-sm mt-0.5">
            Order delivered to {order.name}
          </p>
        </div>
      )}

      {/* Terminal state */}
      {isTerminal && (
        <div
          className={`rounded-xl border p-5 text-center ${
            order.status === "returned"
              ? "bg-orange-50 border-orange-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <p
            className={`font-bold ${
              order.status === "returned" ? "text-orange-700" : "text-red-700"
            }`}
          >
            {order.status === "returned" ? "Order Returned" : "Order Cancelled"}
          </p>
          <p
            className={`text-sm mt-0.5 ${
              order.status === "returned" ? "text-orange-600" : "text-red-600"
            }`}
          >
            {order.status === "returned"
              ? `${order.rings} ring${order.rings !== 1 ? "s" : ""} restocked.`
              : "This order has been cancelled."}
          </p>
        </div>
      )}
    </div>
  );
}
