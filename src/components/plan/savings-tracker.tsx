import { currency } from "@/lib/plan-data";

type Week = {
  week: number;
  ending: string;
  andrew: number;
  maria: number;
  family: number;
  total: number;
};

/** Weekly contributions from the shared Marriage & Honeymoon savings tracker. */
const WEEKS: Week[] = [
  { week: 1, ending: "Mar 7", andrew: 675, maria: 434.5, family: 0, total: 7400 },
  { week: 2, ending: "Mar 14", andrew: 600, maria: 374.11, family: 100, total: 8374 },
  { week: 3, ending: "Mar 21", andrew: 100, maria: 374.11, family: 0, total: 8848 },
  { week: 4, ending: "Mar 28", andrew: 1200, maria: 371.9, family: 1000, total: 13640 },
  { week: 5, ending: "Apr 4", andrew: 850, maria: 377.42, family: 900, total: 15767 },
  { week: 6, ending: "Apr 11", andrew: 400, maria: 312, family: 1000, total: 17179 },
  { week: 7, ending: "Apr 18", andrew: 40, maria: 384, family: 0, total: 18003 },
  { week: 8, ending: "Apr 25", andrew: 60, maria: 374, family: 0, total: 18437 },
  { week: 9, ending: "May 2", andrew: 875, maria: 381, family: 1000, total: 20553 },
  { week: 10, ending: "May 9", andrew: 830, maria: 374, family: 1000, total: 22757 },
  { week: 11, ending: "May 16", andrew: 20, maria: 374, family: 0, total: 23151 },
  { week: 12, ending: "May 23", andrew: 910, maria: 374, family: 0, total: 24445 },
  { week: 13, ending: "May 30", andrew: 603, maria: 374, family: 0, total: 25427 },
  { week: 14, ending: "Jun 6", andrew: 639, maria: 371, family: 1000, total: 27427 },
  { week: 15, ending: "Jun 13", andrew: 10, maria: 377, family: 0, total: 27859 },
  { week: 16, ending: "Jun 20", andrew: 599, maria: 374, family: 0, total: 28832 },
  { week: 17, ending: "Jun 27", andrew: 10, maria: 453, family: 0, total: 29295 },
  { week: 18, ending: "Jul 4", andrew: 950, maria: 377, family: 0, total: 30622 },
  { week: 19, ending: "Jul 11", andrew: 300, maria: 85, family: 440, total: 31440 },
];

const GOAL = 29000;

export function SavingsTracker() {
  const andrewTotal = WEEKS.reduce((a, w) => a + w.andrew, 0);
  const mariaTotal = WEEKS.reduce((a, w) => a + w.maria, 0);
  const familyTotal = WEEKS.reduce((a, w) => a + w.family, 0);
  const finalTotal = WEEKS[WEEKS.length - 1]!.total;

  const W = 780;
  const H = 300;
  const padL = 54;
  const padR = 16;
  const padT = 16;
  const padB = 46;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxWeekly = Math.max(...WEEKS.map((w) => Math.max(w.andrew, w.maria)));
  const yBar = (v: number) => innerH - (v / maxWeekly) * innerH;
  const slot = innerW / WEEKS.length;
  const barW = Math.min(13, slot / 2.6);

  const maxTotal = Math.max(finalTotal, GOAL);
  const linePts = WEEKS.map((w, i) => {
    const x = padL + slot * i + slot / 2;
    const y = padT + innerH - (w.total / maxTotal) * innerH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const goalY = padT + innerH - (GOAL / maxTotal) * innerH;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Andrew saved", value: andrewTotal, color: "var(--navy)" },
          { label: "Maria saved", value: mariaTotal, color: "var(--royal)" },
          { label: "Family support", value: familyTotal, color: "var(--gold)" },
          { label: "Running total", value: finalTotal, color: "var(--teal)" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-mist bg-white/70 px-4 py-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
              {c.label}
            </div>
            <div className="mt-1 font-display text-lg font-bold tabular-nums text-navy">
              {currency(c.value)}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-mist bg-white/70 p-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold text-navy">
            Weekly contributions — Andrew vs. Maria
          </h3>
          <p className="text-xs text-ink-soft">
            Goal {currency(GOAL)} · reached in week 17, finished at {currency(finalTotal)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-[300px] w-full min-w-[640px]">
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const y = padT + innerH - f * innerH;
              return (
                <g key={f}>
                  <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--mist)" strokeWidth="1" />
                  <text x={padL - 8} y={y + 4} textAnchor="end" fontSize="10" fill="var(--ink-soft, #667)">
                    ${Math.round((maxWeekly * f) / 10) * 10}
                  </text>
                </g>
              );
            })}

            {WEEKS.map((w, i) => {
              const x = padL + slot * i + slot / 2;
              return (
                <g key={w.week}>
                  <rect
                    x={x - barW - 1.5}
                    y={padT + yBar(w.andrew)}
                    width={barW}
                    height={innerH - yBar(w.andrew)}
                    rx="2"
                    fill="var(--navy)"
                  >
                    <title>{`Week ${w.week} (${w.ending}) — Andrew ${currency(w.andrew)}`}</title>
                  </rect>
                  <rect
                    x={x + 1.5}
                    y={padT + yBar(w.maria)}
                    width={barW}
                    height={innerH - yBar(w.maria)}
                    rx="2"
                    fill="var(--royal)"
                  >
                    <title>{`Week ${w.week} (${w.ending}) — Maria ${currency(w.maria)}`}</title>
                  </rect>
                  <text
                    x={x}
                    y={H - padB + 16}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--ink-soft, #667)"
                  >
                    {w.ending}
                  </text>
                </g>
              );
            })}

            <line
              x1={padL}
              x2={W - padR}
              y1={goalY}
              y2={goalY}
              stroke="var(--gold)"
              strokeWidth="1.5"
              strokeDasharray="6 5"
            />
            <polyline points={linePts} fill="none" stroke="var(--teal)" strokeWidth="2.5" />
          </svg>
        </div>
        <ul className="mt-3 flex flex-wrap gap-4 text-[12px] text-ink-soft">
          {[
            { label: "Andrew (weekly)", color: "var(--navy)" },
            { label: "Maria (weekly)", color: "var(--royal)" },
            { label: "Running total", color: "var(--teal)" },
            { label: "$29,000 goal", color: "var(--gold)" },
          ].map((l) => (
            <li key={l.label} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              {l.label}
            </li>
          ))}
        </ul>
      </div>

      <div className="overflow-x-auto rounded-xl border border-mist">
        <table className="w-full min-w-[560px] border-collapse text-[13px]">
          <thead>
            <tr className="bg-mist/40 text-left">
              {["Week", "Ending", "Andrew", "Maria", "Family", "Running total"].map((h) => (
                <th key={h} className="px-3 py-2 font-semibold text-navy">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {WEEKS.map((w) => (
              <tr key={w.week} className="border-t border-mist/70">
                <td className="px-3 py-1.5 text-ink-soft">{w.week}</td>
                <td className="px-3 py-1.5 text-ink-soft">{w.ending}</td>
                <td className="px-3 py-1.5 tabular-nums">{currency(w.andrew)}</td>
                <td className="px-3 py-1.5 tabular-nums">{currency(w.maria)}</td>
                <td className="px-3 py-1.5 tabular-nums text-ink-soft">
                  {w.family ? currency(w.family) : "—"}
                </td>
                <td className="px-3 py-1.5 font-semibold tabular-nums text-navy">
                  {currency(w.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
