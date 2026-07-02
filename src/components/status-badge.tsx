type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<
  OrderStatus,
  { label: string; classes: string }
> = {
  new: {
    label: "New",
    classes: "bg-blue-100 text-blue-800 border border-blue-200",
  },
  confirmed: {
    label: "Confirmed",
    classes: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  shipped: {
    label: "Shipped",
    classes: "bg-purple-100 text-purple-800 border border-purple-200",
  },
  delivered: {
    label: "Delivered",
    classes: "bg-green-100 text-green-800 border border-green-200",
  },
  returned: {
    label: "Returned",
    classes: "bg-orange-100 text-orange-800 border border-orange-200",
  },
  cancelled: {
    label: "Cancelled",
    classes: "bg-red-100 text-red-800 border border-red-200",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config =
    statusConfig[status as OrderStatus] ?? {
      label: status,
      classes: "bg-slate-100 text-slate-700 border border-slate-200",
    };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${config.classes}`}
    >
      {config.label}
    </span>
  );
}
