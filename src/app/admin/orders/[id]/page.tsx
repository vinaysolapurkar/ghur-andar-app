export const dynamic = "force-dynamic";

import { getOrder } from "@/lib/actions/orders";
import { getCustomer } from "@/lib/actions/customers";
import { notFound } from "next/navigation";
import OrderTimeline from "@/components/order-timeline";
import StatusBadge from "@/components/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";
import OrderActions from "./order-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = parseInt(id, 10);

  if (isNaN(orderId)) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();

  // Fetch full customer data if we have a customerId
  const customerDetail =
    order.customerId ? await getCustomer(order.customerId) : null;

  const isRepeatCustomer =
    customerDetail ? (customerDetail.totalOrders ?? 0) > 1 : false;

  return (
    <div className="px-4 py-5 space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <a
              href="/admin/orders"
              className="text-slate-500 hover:text-slate-300 transition-colors"
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </a>
            <h2 className="text-lg font-bold text-slate-100">
              Order #{order.id}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 ml-6">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Timeline */}
      <OrderTimeline currentStatus={order.status} />

      {/* Order Details */}
      <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Order Details
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Name</p>
            <p className="text-sm font-semibold text-slate-100">{order.name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Phone</p>
            <a
              href={`tel:${order.phone}`}
              className="text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              {order.phone}
            </a>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-500 mb-0.5">Address</p>
            <p className="text-sm text-slate-100">{order.address}</p>
            {order.city && (
              <p className="text-xs text-slate-400 mt-0.5">{order.city}</p>
            )}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Pincode</p>
            <p className="text-sm text-slate-100">{order.pincode || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">City</p>
            <p className="text-sm text-slate-100">{order.city || "—"}</p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Rings</p>
            <p className="text-sm font-bold text-amber-400">
              {order.rings} ×{" "}
              <span className="text-xs font-normal text-slate-400">₹250</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-0.5">Total</p>
            <p className="text-sm font-bold text-slate-100">
              {formatCurrency(order.totalAmount)}
            </p>
          </div>
          {order.trackingNumber && (
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Tracking</p>
              <p className="text-sm font-mono text-slate-100">
                {order.trackingNumber}
              </p>
            </div>
          )}
        </div>

        {order.shippedAt && (
          <div className="text-xs text-slate-500">
            Shipped: {formatDate(order.shippedAt)}
          </div>
        )}
        {order.deliveredAt && (
          <div className="text-xs text-slate-500">
            Delivered: {formatDate(order.deliveredAt)}
          </div>
        )}
      </section>

      {/* Customer Info */}
      {customerDetail && (
        <section className="bg-slate-900 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Customer
            </h3>
            {isRepeatCustomer && (
              <span className="text-xs font-semibold bg-amber-900/50 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full">
                Repeat Customer
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Total Orders</p>
              <p className="text-sm font-bold text-slate-100">
                {customerDetail.totalOrders}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Total Rings</p>
              <p className="text-sm font-bold text-slate-100">
                {customerDetail.totalRings}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">First Order</p>
              <p className="text-sm text-slate-300">
                {formatDate(customerDetail.firstOrderAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Last Order</p>
              <p className="text-sm text-slate-300">
                {formatDate(customerDetail.lastOrderAt)}
              </p>
            </div>
          </div>

          {customerDetail.orders && customerDetail.orders.length > 1 && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Past Orders</p>
              <div className="space-y-1.5">
                {customerDetail.orders.map((pastOrder) => (
                  <a
                    key={pastOrder.id}
                    href={`/admin/orders/${pastOrder.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      pastOrder.id === order.id
                        ? "bg-slate-800 text-slate-400 cursor-default"
                        : "bg-slate-800/50 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <span>
                      #{pastOrder.id} — {pastOrder.rings} ring
                      {pastOrder.rings !== 1 ? "s" : ""}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={pastOrder.status} />
                      {pastOrder.id === order.id && (
                        <span className="text-xs text-slate-500">current</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Raw Message */}
      {order.rawMessage && (
        <RawMessageSection rawMessage={order.rawMessage} />
      )}

      {/* Action buttons + notes */}
      <OrderActions order={order} />
    </div>
  );
}

function RawMessageSection({ rawMessage }: { rawMessage: string }) {
  return (
    <section className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
      <details>
        <summary className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none list-none flex items-center justify-between">
          <span>Original Message</span>
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
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <div className="px-4 pb-4">
          <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-slate-800 rounded-lg p-3 border border-slate-700">
            {rawMessage}
          </pre>
        </div>
      </details>
    </section>
  );
}
