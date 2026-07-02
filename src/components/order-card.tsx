import Link from "next/link";
import StatusBadge from "./status-badge";

interface Order {
  id: string | number;
  name: string;
  phone: string | null;
  address: string;
  rings: number;
  status: string;
  trackingNumber?: string | null;
  createdAt: string | Date | null;
  pincode: string;
}

interface OrderCardProps {
  order: Order;
  basePath: "/admin/orders" | "/dtd/orders";
}

function formatDate(value: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function OrderCard({ order, basePath }: OrderCardProps) {
  const href = `${basePath}/${order.id}`;

  return (
    <Link
      href={href}
      className="block bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all active:scale-[0.99]"
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-slate-900 text-base truncate">
              {order.name}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{order.phone ?? ""}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Address */}
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {order.address}
          {order.pincode ? `, ${order.pincode}` : ""}
        </p>

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            {/* Rings count */}
            <div className="flex items-center gap-1 text-sm text-slate-700">
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
              <span className="font-medium">
                {order.rings} ring{order.rings !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
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
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="font-mono truncate max-w-[100px]">
                  {order.trackingNumber}
                </span>
              </div>
            )}
          </div>

          {/* Date */}
          <span className="text-xs text-slate-400 shrink-0">
            {formatDate(order.createdAt)}
          </span>
        </div>
      </div>
    </Link>
  );
}
