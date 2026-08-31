import { useMemo, useState } from "react";
import {
  EXPENSE_CATEGORIES,
  currency,
  formatDate,
  monthKey,
  monthLabel,
  signedCurrency,
  type ExpenseCategory,
  type PlanState,
} from "@/lib/plan-data";

type Props = {
  expenses: PlanState["expenses"];
  baseline: number;
  surplus: number;
  onAdd: (e: {
    date: string;
    label: string;
    category: ExpenseCategory;
    payer: string;
    amount: number;
  }) => void;
  onRemove: (id: string) => void;
};

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ExpenseTracker({ expenses, baseline, surplus, onAdd, onRemove }: Props) {
  const [date, setDate] = useState(todayIso);
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("groceries");
  const [payer, setPayer] = useState("Andrew");
  const [amount, setAmount] = useState("");

  const months = useMemo(() => {
    const set = new Set(expenses.map((e) => monthKey(e.date)));
    set.add(monthKey(todayIso()));
    return [...set].sort().reverse();
  }, [expenses]);

  const [month, setMonth] = useState(months[0]);
  const activeMonth = months.includes(month) ? month : months[0];

  const rows = useMemo(
    () =>
      expenses
        .filter((e) => monthKey(e.date) === activeMonth)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [expenses, activeMonth],
  );

  const total = rows.reduce((a, r) => a + r.amount, 0);
  const overheadSpend = rows
    .filter((r) => r.category !== "other")
    .reduce((a, r) => a + r.amount, 0);
  const extras = total - overheadSpend;
  const variance = overheadSpend - baseline;
  const byPayer = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.payer] = (acc[r.payer] ?? 0) + r.amount;
    return acc;
  }, {});
  const pct = baseline > 0 ? Math.min(200, (overheadSpend / baseline) * 100) : 0;

  const submit = () => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (!Number.isFinite(n) || n <= 0) return;
    onAdd({
      date,
      label: label.trim() || EXPENSE_CATEGORIES.find((c) => c.key === category)!.label,
      category,
      payer: payer.trim() || "Andrew",
      amount: Math.round(n * 100) / 100,
    });
    setLabel("");
    setAmount("");
  };

  const field =
    "rounded-lg border border-ink/15 bg-white px-3 py-2 text-[13.5px] text-navy outline-none transition-colors focus:border-royal focus:ring-4 focus:ring-royal/10";

  return (
    <div>
      {/* Entry form */}
      <div className="grid gap-2 rounded-2xl bg-mist/60 p-3 sm:grid-cols-[auto_1fr_auto_auto_auto_auto]">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
          aria-label="Expense date"
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="What was it? (e.g. Publix run)"
          className={field}
          aria-label="Expense description"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          className={field}
          aria-label="Expense category"
        >
          {EXPENSE_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={payer}
          onChange={(e) => setPayer(e.target.value)}
          className={field}
          aria-label="Paid by"
        >
          <option value="Andrew">Andrew</option>
          <option value="Maria">Maria</option>
          <option value="Joint">Joint</option>
        </select>
        <input
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="$0.00"
          className={`${field} w-28 text-right font-semibold`}
          aria-label="Expense amount"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-royal px-4 py-2 text-[13.5px] font-semibold text-white transition-colors hover:bg-navy"
        >
          Log expense
        </button>
      </div>

      {/* Month selector + summary */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={activeMonth}
          onChange={(e) => setMonth(e.target.value)}
          className={field}
          aria-label="Month"
        >
          {months.map((m) => (
            <option key={m} value={m}>
              {monthLabel(m)}
            </option>
          ))}
        </select>
        <span className="text-[13px] text-ink-soft">
          {rows.length} logged {rows.length === 1 ? "expense" : "expenses"}
        </span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-mist bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
            Actual overhead spend
          </p>
          <p className="mt-1 font-display text-xl font-bold text-navy">
            {currency(overheadSpend)}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            vs {currency(baseline)} baseline
          </p>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            variance <= 0 ? "border-teal/30 bg-teal/10" : "border-destructive/30 bg-destructive/10"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
            {variance <= 0 ? "Under baseline" : "Over baseline"}
          </p>
          <p
            className={`mt-1 font-display text-xl font-bold ${
              variance <= 0 ? "text-teal" : "text-destructive"
            }`}
          >
            {signedCurrency(variance)}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-soft">{pct.toFixed(0)}% of the monthly plan</p>
        </div>
        <div className="rounded-2xl border border-mist bg-white p-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">
            Surplus after this month
          </p>
          <p
            className={`mt-1 font-display text-xl font-bold ${
              surplus - total >= 0 ? "text-teal" : "text-destructive"
            }`}
          >
            {signedCurrency(surplus - total)}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            {currency(surplus)} surplus − {currency(total)} spent
            {extras > 0 ? ` (incl. ${currency(extras)} one-off)` : ""}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2.5 overflow-hidden rounded-md bg-mist">
        <div
          className={`h-full rounded-md transition-all duration-300 ${
            variance <= 0 ? "bg-teal" : "bg-destructive"
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>

      {Object.keys(byPayer).length > 0 && (
        <p className="mt-2 text-[12.5px] text-ink-soft">
          Split:{" "}
          {Object.entries(byPayer)
            .map(([who, v]) => `${who} ${currency(v)}`)
            .join(" · ")}
        </p>
      )}

      {/* Ledger */}
      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-mist/60 px-4 py-5 text-center text-[13.5px] text-ink-soft">
          No expenses logged for {monthLabel(activeMonth)} yet — add the first one above.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-mist rounded-2xl border border-mist">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-24 shrink-0 text-[12.5px] text-ink-soft">
                {formatDate(r.date)}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px] text-ink">
                {r.label}
                <span className="ml-2 rounded-full bg-mist px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-royal">
                  {EXPENSE_CATEGORIES.find((c) => c.key === r.category)?.label}
                </span>
              </span>
              <span className="hidden shrink-0 text-[12.5px] text-ink-soft sm:inline">
                {r.payer}
              </span>
              <span className="w-24 shrink-0 text-right font-semibold text-navy">
                {currency(r.amount)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(r.id)}
                aria-label={`Remove ${r.label}`}
                className="shrink-0 rounded-md px-2 text-ink-soft transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
