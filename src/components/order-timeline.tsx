type OrderStatus =
  | "new"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "returned"
  | "cancelled";

interface OrderTimelineProps {
  currentStatus: string;
}

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STEP_ORDER: Record<string, number> = {
  new: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
};

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const isTerminal =
    currentStatus === "returned" || currentStatus === "cancelled";
  const currentIndex = STEP_ORDER[currentStatus] ?? 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
        Order Status
      </h3>

      {/* Terminal state banner */}
      {isTerminal && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm font-medium text-center ${
            currentStatus === "returned"
              ? "bg-orange-50 text-orange-700 border border-orange-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {currentStatus === "returned"
            ? "Order Returned"
            : "Order Cancelled"}
        </div>
      )}

      {/* Timeline steps */}
      <div className="relative flex items-start justify-between">
        {/* Connecting line behind dots */}
        <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
          {!isTerminal && currentIndex > 0 && (
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{
                width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
              }}
            />
          )}
        </div>

        {STEPS.map((step, index) => {
          const isPast = !isTerminal && index < currentIndex;
          const isCurrent = !isTerminal && index === currentIndex;
          const isFuture = isTerminal || index > currentIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex flex-col items-center gap-2"
              style={{ flex: "1" }}
            >
              {/* Dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                  isPast
                    ? "bg-amber-400 border-amber-400 text-white"
                    : isCurrent
                      ? "bg-white border-amber-400 ring-4 ring-amber-100"
                      : "bg-white border-slate-300 text-slate-300"
                }`}
              >
                {isPast ? (
                  <CheckIcon />
                ) : isCurrent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium text-center leading-tight ${
                  isPast
                    ? "text-amber-600"
                    : isCurrent
                      ? "text-slate-900"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
