interface StockIndicatorProps {
  current: number;
  label?: string;
}

function getStockColor(current: number): {
  text: string;
  bar: string;
  bg: string;
  badge: string;
} {
  if (current > 20) {
    return {
      text: "text-green-700",
      bar: "bg-green-500",
      bg: "bg-green-100",
      badge: "bg-green-100 text-green-700 border-green-200",
    };
  }
  if (current >= 5) {
    return {
      text: "text-yellow-700",
      bar: "bg-yellow-400",
      bg: "bg-yellow-50",
      badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
  }
  return {
    text: "text-red-700",
    bar: "bg-red-500",
    bg: "bg-red-50",
    badge: "bg-red-100 text-red-700 border-red-200",
  };
}

function getStockLabel(current: number): string {
  if (current > 20) return "In Stock";
  if (current >= 5) return "Low Stock";
  if (current > 0) return "Critical";
  return "Out of Stock";
}

export default function StockIndicator({
  current,
  label,
}: StockIndicatorProps) {
  const colors = getStockColor(current);
  const statusLabel = getStockLabel(current);

  // Bar max reference: 100 units = full bar
  const MAX_REF = 100;
  const barWidth = Math.min((current / MAX_REF) * 100, 100);

  return (
    <div className={`rounded-xl border p-4 ${colors.bg} border-current/10`}>
      {/* Label */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label ?? "Stock"}
        </p>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colors.badge}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Large number */}
      <p className={`text-5xl font-black leading-none mt-2 mb-3 ${colors.text}`}>
        {current.toLocaleString("en-IN")}
      </p>
      <p className="text-xs text-slate-500 mb-3">units available</p>

      {/* Progress bar */}
      <div className="relative h-2.5 bg-white/60 rounded-full overflow-hidden border border-white/50">
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-slate-400">0</span>
        <span className="text-xs text-slate-400">{MAX_REF}+</span>
      </div>
    </div>
  );
}
