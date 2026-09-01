import { currency } from "@/lib/plan-data";

export type Slice = { label: string; value: number; color: string };

export function Donut({
  slices,
  total,
  centerLabel,
}: {
  slices: Slice[];
  total: number;
  centerLabel: string;
}) {
  const R = 54;
  const C = 2 * Math.PI * R;
  const safeTotal = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  let acc = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
          <circle
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke="var(--mist)"
            strokeWidth="17"
          />
          {slices
            .filter((s) => s.value > 0)
            .map((s) => {
              const frac = safeTotal > 0 ? s.value / safeTotal : 0;
              const dash = Math.max(0, frac * C - 1.5);
              const offset = -acc * C;
              acc += frac;
              return (
                <circle
                  key={s.label}
                  cx="75"
                  cy="75"
                  r={R}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="17"
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={offset}
                >
                  <title>
                    {s.label}: {currency(s.value)}
                  </title>
                </circle>
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-soft">
            {centerLabel}
          </span>
          <span className="font-display text-[15px] font-bold text-navy">
            {currency(total)}
          </span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[12.5px]">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: s.color }}
            />
            <span className="truncate text-ink-soft">{s.label}</span>
            <span className="ml-auto pl-2 font-semibold tabular-nums text-navy">
              {safeTotal > 0 ? `${Math.round((s.value / safeTotal) * 100)}%` : "—"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SurplusGauge({
  target,
  available,
}: {
  target: number;
  available: number;
}) {
  const max = Math.max(target, available, 1);
  const targetPct = (target / max) * 100;
  const availablePct = (available / max) * 100;
  const surplus = available - target;

  return (
    <div>
      <div className="relative h-4 overflow-hidden rounded-full bg-mist">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[image:var(--gradient-progress)]"
          style={{ width: `${targetPct}%` }}
        >
          <title>Target Budget: {currency(target)}</title>
        </div>
        <div
          className={`absolute inset-y-0 ${
            surplus >= 0 ? "bg-teal/85" : "bg-destructive/85"
          }`}
          style={
            surplus >= 0
              ? { left: `${targetPct}%`, width: `${Math.max(0, availablePct - targetPct)}%` }
              : { left: `${availablePct}%`, width: `${Math.max(0, targetPct - availablePct)}%` }
          }
        >
          <title>
            {surplus >= 0 ? "Surplus" : "Shortfall"}: {currency(Math.abs(surplus))}
          </title>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px]">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-royal" />
          <span className="text-ink-soft">Target</span>
          <b className="tabular-nums text-navy">{currency(target)}</b>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-teal" />
          <span className="text-ink-soft">{surplus >= 0 ? "Surplus" : "Shortfall"}</span>
          <b className={`tabular-nums ${surplus >= 0 ? "text-teal" : "text-destructive"}`}>
            {currency(Math.abs(surplus))}
          </b>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-ink-soft">Available</span>
          <b className="tabular-nums text-navy">{currency(available)}</b>
        </span>
      </div>
    </div>
  );
}
