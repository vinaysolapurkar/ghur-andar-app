interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: "up" | "down" | "neutral";
  color?: string;
}

function TrendArrow({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
        >
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
        Up
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3 h-3"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="19 12 12 19 5 12" />
        </svg>
        Down
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3 h-3"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
      Flat
    </span>
  );
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
}: StatsCardProps) {
  const accentColor = color ?? "text-slate-900";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col gap-2">
      {/* Top row: title + icon */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </p>
        {icon && (
          <span className="text-xl leading-none" role="img" aria-hidden>
            {icon}
          </span>
        )}
      </div>

      {/* Value */}
      <p className={`text-3xl font-bold leading-none ${accentColor}`}>
        {value}
      </p>

      {/* Bottom row: subtitle + trend */}
      <div className="flex items-center justify-between gap-2 mt-1">
        {subtitle && (
          <p className="text-xs text-slate-500 leading-snug">{subtitle}</p>
        )}
        {trend && <TrendArrow trend={trend} />}
      </div>
    </div>
  );
}
