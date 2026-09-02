import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  Activity as ActivityIcon,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Map,
  ShieldCheck,
  Sofa,
  Wallet,
} from "lucide-react";
import { isUnlocked, lockSite } from "@/lib/gate.functions";

import {
  Callout,
  DateInput,
  MoneyInput,
  Page,
  Td,
  TextInput,
  Th,
  TotalRow,
} from "@/components/plan/primitives";
import { ActivityPanel } from "@/components/plan/activity";
import { ExpenseTracker } from "@/components/plan/expenses";
import { Devotionals } from "@/components/plan/devotionals";
import { Donut, SurplusGauge } from "@/components/plan/charts";


import {
  countdownLabel,
  currency,
  formatDate,
  relativeTime,
  signedCurrency,
  sum,
} from "@/lib/plan-data";
import { usePlan } from "@/lib/use-plan";
import { getDbMetrics, takeHealthSnapshot, type DbMetrics, type HealthSnapshot } from "@/lib/health.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Financial Master Plan — Andrew & Maria" },
      {
        name: "description",
        content:
          "Interactive wedding, honeymoon and first-apartment financial dashboard for Andrew & Maria — live budget, funds, savings roadmap and emergency fund tracking.",
      },
      { property: "og:title", content: "Financial Master Plan — Andrew & Maria" },
      {
        property: "og:description",
        content:
          "Live budget, available funds, monthly overhead, savings milestones and furnishing plan in one editable dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const { unlocked } = await isUnlocked();
    if (!unlocked) throw redirect({ to: "/unlock" });
    return null;
  },
  component: Index,
});


const SECTION_LINKS = [
  { id: "s1", label: "Budget & Funds", desc: "Targets vs. available cash", Icon: Wallet, tint: "bg-navy/10 text-navy" },
  { id: "payments", label: "Wedding Payments", desc: "6 installments & balance", Icon: CreditCard, tint: "bg-royal/10 text-royal" },
  { id: "s2", label: "Monthly & Lease", desc: "Overhead & lease reserve", Icon: CalendarDays, tint: "bg-sky/20 text-deep-blue" },
  { id: "s3", label: "Savings Roadmap", desc: "Milestones & countdowns", Icon: Map, tint: "bg-gold/15 text-gold" },
  { id: "s4", label: "Furnishing Budget", desc: "Room-by-room tiers", Icon: Sofa, tint: "bg-teal/10 text-teal" },
  { id: "s5", label: "Final Goal & Emergency", desc: "$20k buffer fund", Icon: ShieldCheck, tint: "bg-navy/10 text-navy" },
  { id: "devotionals", label: "Devotionals", desc: "Daily reading & notes", Icon: BookOpen, tint: "bg-gold/15 text-gold" },
  { id: "activity", label: "Activity & Notes", desc: "History & comments", Icon: ClipboardList, tint: "bg-royal/10 text-royal" },

];

const BUDGET_ROWS: { key: keyof ReturnType<typeof usePlan>["plan"]["budget"]; label: string }[] = [
  { key: "venue", label: "Marriage (Venue & Operations)" },
  { key: "honeymoon", label: "Honeymoon Budget" },
  { key: "dress", label: "Wedding Dress Budget" },
  { key: "desserts", label: "Desserts Budget" },
  { key: "makeup", label: "Makeup & Beauty Budget" },
];

const BUDGET_COLORS: Record<string, string> = {
  venue: "var(--navy)",
  honeymoon: "var(--royal)",
  dress: "var(--sky)",
  desserts: "var(--gold)",
  makeup: "var(--teal)",
};

const FUND_COLORS = {
  checking: "var(--navy)",
  savings: "var(--royal)",
  marcus: "var(--gold)",
  herParents: "var(--teal)",
  yourParents: "var(--sky)",
} as const;

const MONTHLY_ROWS: {
  key: keyof ReturnType<typeof usePlan>["plan"]["monthly"];
  label: string;
}[] = [
  { key: "spotify", label: "Spotify" },
  { key: "cinemark", label: "Cinemark" },
  { key: "phone", label: "Mobile Phone Plan" },
  { key: "health", label: "Health Insurance" },
  { key: "life", label: "Life Insurance" },
  { key: "groceries", label: "Groceries" },
  { key: "lifestyle", label: "Lifestyle Service" },
];

function Index() {
  const { plan, hydrated, savedAt, online, setField, setFurnishing, setPaymentField, togglePayment, addExpense, removeExpense, addComment, openDevotional, setDevotionalNote, selectDevotionalDay, reset } = usePlan();
  const router = useRouter();
  const lock = useServerFn(lockSite);
  const [, tick] = useState(0);


  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  const OVERHEAD_TARGET = 584.78;
  const [reconcileKey, setReconcileKey] = useState<string>("groceries");
  const [active, setActive] = useState<string | null>(null);
  const goTo = (id: string | null) => {
    setActive(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const targetBudget = sum(plan.budget);
  const personalCash = plan.funds.checking + plan.funds.savings + plan.funds.marcus;
  const familyContrib = plan.funds.herParents + plan.funds.yourParents;
  const totalAvailable = personalCash + familyContrib;
  const surplus = totalAvailable - targetBudget;
  const overhead = sum(plan.monthly);

  const leasePct =
    plan.lease.goal > 0
      ? Math.min(100, Math.max(0, (plan.lease.saved / plan.lease.goal) * 100))
      : 0;
  const leaseRemaining = Math.max(0, plan.lease.goal - plan.lease.saved);

  const furnConservative = plan.furnishing.reduce((a, r) => a + r.conservative, 0);
  const furnMid = plan.furnishing.reduce((a, r) => a + r.mid, 0);

  const paidTotal = plan.payments.reduce((a, r) => a + (r.paid ? r.amount : 0), 0);
  const paidCount = plan.payments.filter((r) => r.paid).length;
  const paymentsTotal = plan.payments.reduce((a, r) => a + r.amount, 0);
  const paidPct = paymentsTotal > 0 ? (paidTotal / paymentsTotal) * 100 : 0;
  const remainingChecking = Math.max(0, plan.funds.checking - paidTotal);
  const weddingRemaining = Math.max(0, paymentsTotal - paidTotal);

  const money = (v: unknown) => currency(Number(v));

  const budgetSlices = BUDGET_ROWS.map((r) => ({
    label: r.label,
    value: plan.budget[r.key],
    color: BUDGET_COLORS[r.key]!,
  }));
  const fundSlices = [
    { label: "Checking", value: plan.funds.checking, color: FUND_COLORS.checking },
    { label: "Savings", value: plan.funds.savings, color: FUND_COLORS.savings },
    { label: "Marcus HYSA", value: plan.funds.marcus, color: FUND_COLORS.marcus },
    { label: "Her Parents", value: plan.funds.herParents, color: FUND_COLORS.herParents },
    { label: "Your Parents", value: plan.funds.yourParents, color: FUND_COLORS.yourParents },
  ];

  const stats = [
    { label: "Target Budget", value: currency(targetBudget), tone: "navy" as const },
    { label: "Total Available", value: currency(totalAvailable), tone: "navy" as const },
    {
      label: "Surplus Reserve",
      value: signedCurrency(surplus),
      tone: surplus >= 0 ? ("teal" as const) : ("red" as const),
    },
    { label: "Baseline Monthly Overhead", value: currency(overhead), tone: "navy" as const },
  ];

  return (
    <main className="mx-auto max-w-[900px] px-4 pb-20 pt-12">
      <header className="relative overflow-hidden rounded-[22px] bg-[image:var(--gradient-cover)] px-6 py-14 text-center shadow-[var(--shadow-cover)] sm:px-12">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(400px 220px at 15% 20%, color-mix(in oklab, var(--sky) 25%, transparent), transparent 60%), radial-gradient(500px 260px at 85% 85%, color-mix(in oklab, var(--gold) 20%, transparent), transparent 60%)",
          }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-sky">
          Prepared for Andrew &amp; Maria
        </p>
        <h1 className="relative mt-3 font-display text-[2.6rem] font-extrabold leading-tight text-white">
          Our Financial Master Plan
        </h1>
        <p className="relative font-serif-italic text-[19px] italic text-sky">
          Master Overview &amp; Capital Position
        </p>
        <div className="relative mx-auto mt-5 h-0.5 w-16 bg-gold" />
        <div className="relative mt-4 flex items-center justify-center gap-2 text-xs text-sky">
          <span
            className={`h-[7px] w-[7px] rounded-full ${online ? "bg-teal" : "bg-gold"}`}
          />
          {!hydrated
            ? "Loading the shared plan…"
            : !online
              ? "Offline — changes saved on this device and will sync when reconnected"
              : savedAt
                ? `Live sync · updated ${relativeTime(savedAt)} — everyone sees this`
                : "Live sync on — edits appear on every device instantly"}
        </div>
        <button
          type="button"
          onClick={async () => {
            await lock({});
            await router.navigate({ to: "/unlock" });
          }}
          className="absolute right-4 top-4 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          Lock
        </button>
      </header>

      {/* SECTION QUICK NAV (overview only) */}
      {!active && (
        <nav className="relative z-30 mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {SECTION_LINKS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className="card-surface group flex flex-col items-start gap-2.5 rounded-2xl px-4 py-4 text-left transition-all hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[var(--shadow-cover)]"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${s.tint}`}
              >
                <s.Icon size={19} strokeWidth={2} />
              </span>
              <span>
                <span className="block text-[13.5px] font-bold leading-snug text-navy">
                  {s.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-ink-soft">
                  {s.desc}
                </span>
              </span>
            </button>
          ))}
        </nav>
      )}

      {/* SCRIPTURE BANNER (overview only) */}
      {!active && (
      <div className="relative z-10 mt-6 mb-2 rounded-2xl border-t-2 border-gold bg-white/95 px-6 py-6 text-center shadow-[var(--shadow-card)] backdrop-blur-sm">
        <blockquote className="mx-auto max-w-2xl">
          <p className="font-display text-lg italic leading-relaxed text-navy md:text-xl">
            “For which of you, desiring to build a tower, does not first sit down and count the cost, whether he has enough to complete it?”
          </p>
          <footer className="mt-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              Luke 14:28 · ESV
            </span>
          </footer>
        </blockquote>
      </div>
      )}

      {/* PERSISTENT METRIC STRIP (hidden in the Devotionals reading view) */}
      {active !== "devotionals" && (
      <div className="sticky top-0 z-20 mt-6 grid grid-cols-2 gap-3.5 px-2 pt-2 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface rounded-2xl px-4 py-4">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {s.label}
            </div>
            <div
              className={`mt-1.5 font-display text-[22px] font-bold ${
                s.tone === "teal" ? "text-teal" : s.tone === "red" ? "text-destructive" : "text-navy"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>
      )}

      {/* BACK TO OVERVIEW (section view only) */}
      {active && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => goTo(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Back to Overview
          </button>
        </div>
      )}

      {/* SECTION 1 */}
      {active === "s1" && (
      <Page id="s1" title="Target Budget & Available Funds">
        <div className="grid gap-9 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-royal">
              1. Target Budget Required
            </h3>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr>
                  <Th>Category</Th>
                  <Th num>Amount</Th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_ROWS.map((r) => (
                  <tr key={r.key} className="transition-colors hover:bg-mist/70">
                    <Td>
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: BUDGET_COLORS[r.key] }}
                        />
                        {r.label}
                      </span>
                    </Td>
                    <Td num className="w-[130px]">
                      <MoneyInput
                        value={plan.budget[r.key]}
                        onCommit={(n) => setField("budget", r.key, n, r.label, money)}
                      />
                    </Td>
                  </tr>
                ))}
                <TotalRow label="Total Target Budget" values={[currency(targetBudget)]} />
              </tbody>
            </table>
            <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
              <Donut slices={budgetSlices} total={targetBudget} centerLabel="Target" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-royal">
              2. Available Funds & Cash Position
            </h3>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr>
                  <Th>Source</Th>
                  <Th num>Amount</Th>
                </tr>
              </thead>
              <tbody>
                <tr className="transition-colors hover:bg-mist/70">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: FUND_COLORS.checking }}
                      />
                      <span>
                        Checking (Acct{" "}
                        <TextInput
                          value={plan.funds.checkingAcct}
                          onCommit={(v) =>
                            setField("funds", "checkingAcct", v, "Checking account number")
                          }
                          className="w-24 text-center text-[13.5px]"
                        />
                        )
                      </span>
                    </span>
                  </Td>
                  <Td num className="w-[130px]">
                    <MoneyInput
                      value={plan.funds.checking}
                      onCommit={(n) => setField("funds", "checking", n, "Checking balance", money)}
                    />
                  </Td>
                </tr>
                <tr className="transition-colors hover:bg-mist/70">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: FUND_COLORS.savings }}
                      />
                      <span>
                        Savings (Acct{" "}
                        <TextInput
                          value={plan.funds.savingsAcct}
                          onCommit={(v) =>
                            setField("funds", "savingsAcct", v, "Savings account number")
                          }
                          className="w-24 text-center text-[13.5px]"
                        />
                        )
                      </span>
                    </span>
                  </Td>
                  <Td num className="w-[130px]">
                    <MoneyInput
                      value={plan.funds.savings}
                      onCommit={(n) => setField("funds", "savings", n, "Savings balance", money)}
                    />
                  </Td>
                </tr>
                <tr className="transition-colors hover:bg-mist/70">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: FUND_COLORS.marcus }}
                      />
                      <span>
                        Marcus High Yield Savings (Acct{" "}
                        <TextInput
                          value={plan.funds.marcusAcct}
                          onCommit={(v) =>
                            setField("funds", "marcusAcct", v, "Marcus account number")
                          }
                          className="w-24 text-center text-[13.5px]"
                        />
                        )
                      </span>
                    </span>
                  </Td>
                  <Td num className="w-[130px]">
                    <MoneyInput
                      value={plan.funds.marcus}
                      onCommit={(n) => setField("funds", "marcus", n, "Marcus balance", money)}
                    />
                  </Td>
                </tr>
                <tr className="bg-mist/60">
                  <Td className="font-semibold text-navy">Personal Cash On Hand</Td>
                  <Td num className="font-semibold text-navy">
                    {currency(personalCash)}
                  </Td>
                </tr>
                <tr className="transition-colors hover:bg-mist/70">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: FUND_COLORS.herParents }}
                      />
                      Her Parents' Support
                    </span>
                  </Td>
                  <Td num className="w-[130px]">
                    <MoneyInput
                      value={plan.funds.herParents}
                      onCommit={(n) =>
                        setField("funds", "herParents", n, "Her parents' support", money)
                      }
                    />
                  </Td>
                </tr>
                <tr className="transition-colors hover:bg-mist/70">
                  <Td>
                    <span className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ background: FUND_COLORS.yourParents }}
                      />
                      Your Parents' Support
                    </span>
                  </Td>
                  <Td num className="w-[130px]">
                    <MoneyInput
                      value={plan.funds.yourParents}
                      onCommit={(n) =>
                        setField("funds", "yourParents", n, "Your parents' support", money)
                      }
                    />
                  </Td>
                </tr>
                <tr className="bg-mist/60">
                  <Td className="font-semibold text-navy">Family Contributions</Td>
                  <Td num className="font-semibold text-navy">
                    {currency(familyContrib)}
                  </Td>
                </tr>
                <TotalRow label="Total Sum Available" values={[currency(totalAvailable)]} />
              </tbody>
            </table>
            <div className="mt-6 rounded-2xl border border-line bg-paper p-4">
              <Donut slices={fundSlices} total={totalAvailable} centerLabel="Available" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-paper p-5">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-royal">
            Budget vs Available
          </div>
          <SurplusGauge target={targetBudget} available={totalAvailable} />
        </div>

        <div
          className={`mt-6 rounded-2xl border-l-4 p-5 ${
            surplus >= 0 ? "border-l-teal bg-teal/10" : "border-l-destructive bg-destructive/10"
          }`}
        >
          <div className="text-[14.5px] font-bold text-navy">
            {surplus >= 0 ? "Capital Surplus" : "Capital Shortfall"}
          </div>
          <p className="mt-1 text-[13.8px] leading-relaxed text-ink-soft">
            Against a target budget of {currency(targetBudget)}, you hold{" "}
            {currency(totalAvailable)} — leaving a live reserve of{" "}
            <b className={surplus >= 0 ? "text-teal" : "text-destructive"}>
              {signedCurrency(surplus)}
            </b>{" "}
            to absorb overages and seed the first year together.
          </p>
        </div>
      </Page>
      )}

      {/* WEDDING PAYMENT SCHEDULE */}
      {active === "payments" && (
      <Page id="payments" title="Wedding Payment Schedule & Progress Tracker">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-[image:var(--gradient-cover)] p-5 text-white shadow-[var(--shadow-cover)]">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-sky">
              Starting Checking Balance
            </div>
            <div className="mt-1.5 font-display text-[26px] font-bold">
              {currency(plan.funds.checking)}
            </div>
            <p className="mt-1 text-[12px] text-sky">
              Baseline before any wedding installment payments.
            </p>
          </div>
          <div className="rounded-2xl border-2 border-teal/40 bg-teal/10 p-5">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-teal">
              Remaining Checking Balance after Payments
            </div>
            <div className="mt-1.5 font-display text-[26px] font-bold text-teal">
              {currency(remainingChecking)}
            </div>
            <p className="mt-1 text-[12px] text-ink-soft">
              {currency(plan.funds.checking)} minus {currency(paidTotal)} across {paidCount} paid{" "}
              {paidCount === 1 ? "installment" : "installments"}.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[13px] text-ink-soft">
            <span>
              <b className="text-navy">{paidCount} of {plan.payments.length}</b> payments made
            </span>
            <span>
              <b className="text-navy">{currency(paidTotal)}</b> paid ·{" "}
              <b className="text-navy">{currency(weddingRemaining)}</b> remaining wedding balance
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-md bg-mist">
            <div
              className="h-full rounded-md bg-[image:var(--gradient-progress)] transition-all duration-300"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <p className="mt-1.5 text-[12.5px] text-ink-soft">
            <b className="text-navy">{paidPct.toFixed(1)}% of the {currency(paymentsTotal)} schedule complete</b>
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plan.payments.map((p) => {
            const balanceAfter = Math.max(
              0,
              plan.funds.checking -
                plan.payments
                  .slice(0, plan.payments.indexOf(p) + 1)
                  .reduce((a, r) => a + r.amount, 0),
            );
            return (
              <div
                key={p.key}
                className={`rounded-2xl border-2 p-4 transition-colors ${
                  p.paid ? "border-teal/50 bg-teal/10" : "border-mist bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-royal">
                    {p.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => togglePayment(p.key)}
                    className={`rounded-full px-3 py-1 text-[11.5px] font-bold transition-colors ${
                      p.paid
                        ? "bg-teal text-white hover:bg-teal/85"
                        : "bg-mist text-ink-soft hover:bg-royal hover:text-white"
                    }`}
                  >
                    {p.paid ? "✓ Paid" : "Mark Paid"}
                  </button>
                </div>
                <div className="mt-2.5 flex items-center gap-2 text-[13px] text-ink-soft">
                  <DateInput
                    value={p.date}
                    onCommit={(v) => setPaymentField(p.key, "date", v)}
                  />
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <MoneyInput
                    value={p.amount}
                    onCommit={(n) => setPaymentField(p.key, "amount", n, money)}
                  />
                </div>
                <p className="mt-2 border-t border-mist pt-2 text-[12px] text-ink-soft">
                  Balance left:{" "}
                  <b className={p.paid ? "text-teal" : "text-navy"}>{currency(balanceAfter)}</b>
                </p>
              </div>
            );
          })}
        </div>
      </Page>
      )}

      {/* SECTION 2 */}
      {active === "s2" && (
      <Page id="s2" title="Monthly Expenses & Lease Reserve">
        <div className="grid gap-9 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-royal">
              Recurring Monthly Overhead
            </h3>
            <table className="mt-2 w-full border-collapse">
              <thead>
                <tr>
                  <Th>Item</Th>
                  <Th num>Monthly</Th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_ROWS.map((r) => (
                  <tr key={r.key}>
                    <Td>{r.label}</Td>
                    <Td num>
                      <MoneyInput
                        value={plan.monthly[r.key]}
                        onCommit={(n) => setField("monthly", r.key, n, r.label, money)}
                      />
                    </Td>
                  </tr>
                ))}
                <TotalRow label="Baseline Overhead" values={[`${currency(overhead)}/mo`]} />
              </tbody>
            </table>
            {(() => {
              const gap = Math.round((OVERHEAD_TARGET - overhead) * 100) / 100;
              if (Math.abs(gap) < 0.005) {
                return (
                  <p className="mt-3 flex items-center gap-2 rounded-xl bg-teal/10 px-3.5 py-2.5 text-[12.5px] font-semibold text-teal">
                    <span className="h-[7px] w-[7px] rounded-full bg-teal" />
                    Rows reconciled — totals exactly {currency(OVERHEAD_TARGET)}/mo.
                  </p>
                );
              }
              return (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-gold/10 px-3.5 py-2.5">
                  <span className="text-[12.5px] text-ink-soft">
                    Rows are <b className="text-navy">{currency(Math.abs(gap))}</b>{" "}
                    {gap > 0 ? "short of" : "above"} the document's {currency(OVERHEAD_TARGET)}/mo
                    total. Auto-adjust
                  </span>
                  <select
                    value={reconcileKey}
                    onChange={(e) => setReconcileKey(e.target.value)}
                    className="rounded-lg border border-ink/15 bg-white px-2 py-1 text-[12.5px] font-medium text-navy outline-none focus:border-royal"
                  >
                    {MONTHLY_ROWS.map((r) => (
                      <option key={r.key} value={r.key}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const row = MONTHLY_ROWS.find((r) => r.key === reconcileKey)!;
                      const next =
                        Math.round((plan.monthly[row.key] + gap) * 100) / 100;
                      setField("monthly", row.key, next, `${row.label} (reconciliation)`, money);
                    }}
                    className="rounded-lg bg-royal px-3 py-1 text-[12.5px] font-semibold text-white transition-colors hover:bg-navy"
                  >
                    Apply {signedCurrency(gap)}
                  </button>
                </div>
              );
            })()}
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-royal">
              Apartment Lease Allocation Tracker
            </h3>
            <div className="mt-3 flex items-center gap-3 text-sm text-ink-soft">
              <span>Saved</span>
              <div className="w-32">
                <MoneyInput
                  value={plan.lease.saved}
                  onCommit={(n) => setField("lease", "saved", n, "Lease reserve saved", money)}
                />
              </div>
              <span>of</span>
              <div className="w-32">
                <MoneyInput
                  value={plan.lease.goal}
                  onCommit={(n) => setField("lease", "goal", n, "Lease reserve goal", money)}
                />
              </div>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-md bg-mist">
              <div
                className="h-full rounded-md bg-[image:var(--gradient-progress)] transition-all duration-300"
                style={{ width: `${leasePct}%` }}
              />
            </div>
            <p className="mt-2 text-[13px] text-ink-soft">
              <b className="text-navy">{leasePct.toFixed(1)}% complete</b> —{" "}
              {currency(leaseRemaining)} remaining to reach the {currency(plan.lease.goal)} move-in
              reserve.
            </p>

            <ul className="mt-5 list-disc space-y-2 pl-5 text-[14.5px] leading-snug text-ink">
              <li>
                <b className="text-navy">Profile:</b> 800–1200 sq ft Florida apartment at roughly{" "}
                <span className="inline-block w-28 align-middle">
                  <MoneyInput
                    value={plan.lease.rent}
                    onCommit={(n) => setField("lease", "rent", n, "Target monthly rent", money)}
                    align="center"
                  />
                </span>{" "}
                per month.
              </li>
              <li>
                <b className="text-navy">Capital structure:</b> first month's rent of{" "}
                {currency(plan.lease.rent)} plus security deposit and last month of{" "}
                <span className="inline-block w-28 align-middle">
                  <MoneyInput
                    value={plan.lease.depositLastMonth}
                    onCommit={(n) =>
                      setField("lease", "depositLastMonth", n, "Deposit + last month", money)
                    }
                    align="center"
                  />
                </span>
                .
              </li>
              <li>
                <b className="text-navy">Move-in cash required:</b>{" "}
                {currency(plan.lease.rent + plan.lease.depositLastMonth)} — covered by the{" "}
                {currency(plan.lease.goal)} reserve goal.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-9 border-t border-mist pt-7">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-royal">
            Shared Expense Tracker
          </h3>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            Log what Andrew and Maria actually spend each month. Entries mapped to an overhead
            category are compared against the {currency(OVERHEAD_TARGET)}/mo baseline; every logged
            dollar is also subtracted from the live surplus.
          </p>
          <div className="mt-4">
            <ExpenseTracker
              expenses={plan.expenses}
              baseline={overhead}
              surplus={surplus}
              onAdd={addExpense}
              onRemove={removeExpense}
            />
          </div>
        </div>
      </Page>
      )}


      {/* SECTION 3 */}
      {active === "s3" && (
      <Page id="s3" title="Savings Roadmap & Milestones">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <Th>Milestone</Th>
                <Th>Target / Status</Th>
                <Th num>Estimated Allocation</Th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Td>Apartment Lease &amp; Move-In</Td>
                <Td>
                  <DateInput
                    value={plan.milestones.leaseDate}
                    onCommit={(v) =>
                      setField("milestones", "leaseDate", v, "Lease move-in date", (x) =>
                        formatDate(String(x)),
                      )
                    }
                  />
                  <div className="mt-0.5 pl-2 text-[11px] font-semibold text-teal">
                    {countdownLabel(plan.milestones.leaseDate)}
                  </div>
                </Td>
                <Td num>
                  <MoneyInput
                    value={plan.milestones.leaseAmount}
                    onCommit={(n) =>
                      setField("milestones", "leaseAmount", n, "Lease allocation", money)
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Td>Honeymoon Reserve Fund</Td>
                <Td>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[11.5px] font-semibold text-teal">
                    Fully Allocated in Master Budget
                  </span>
                </Td>
                <Td num>
                  <MoneyInput
                    value={plan.milestones.honeymoonAmount}
                    onCommit={(n) =>
                      setField("milestones", "honeymoonAmount", n, "Honeymoon reserve", money)
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Td>Wedding &amp; Venue Finalization</Td>
                <Td>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[11.5px] font-semibold text-teal">
                    Fully Allocated in Master Budget
                  </span>
                </Td>
                <Td num>
                  <MoneyInput
                    value={plan.milestones.weddingAmount}
                    onCommit={(n) =>
                      setField("milestones", "weddingAmount", n, "Wedding allocation", money)
                    }
                  />
                </Td>
              </tr>
              <tr>
                <Td>Apartment Furnishing &amp; Setup</Td>
                <Td>
                  <DateInput
                    value={plan.milestones.furnishingDate}
                    onCommit={(v) =>
                      setField("milestones", "furnishingDate", v, "Furnishing target date", (x) =>
                        formatDate(String(x)),
                      )
                    }
                  />
                  <div className="mt-0.5 pl-2 text-[11px] font-semibold text-teal">
                    {countdownLabel(plan.milestones.furnishingDate)}
                  </div>
                </Td>
                <Td num>
                  <div className="flex items-center justify-end gap-1">
                    <MoneyInput
                      value={plan.milestones.furnishingLow}
                      onCommit={(n) =>
                        setField("milestones", "furnishingLow", n, "Furnishing low estimate", money)
                      }
                    />
                    <span className="text-ink-soft">–</span>
                    <MoneyInput
                      value={plan.milestones.furnishingHigh}
                      onCommit={(n) =>
                        setField(
                          "milestones",
                          "furnishingHigh",
                          n,
                          "Furnishing high estimate",
                          money,
                        )
                      }
                    />
                  </div>
                </Td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tone="gold" title="3 Key Savings Principles for the First Year">
          <ol className="list-decimal space-y-1.5 pl-4">
            <li>
              <b className="text-navy">Zero unnecessary debt</b> — no financing on furniture,
              travel, or the wedding itself.
            </li>
            <li>
              <b className="text-navy">Phase furniture purchases</b> — buy per room as cash allows,
              starting with bedroom and living room.
            </li>
            <li>
              <b className="text-navy">3-month emergency buffer</b> — hold at least three months of
              overhead ({currency(overhead * 3)}) untouched at all times.
            </li>
          </ol>
        </Callout>
      </Page>
      )}

      {/* SECTION 4 */}
      {active === "s4" && (
      <Page id="s4" title="Florida Apartment Furnishing Budget">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr>
                <Th>Room / Category</Th>
                <Th num>Conservative</Th>
                <Th num>Mid-Range</Th>
              </tr>
            </thead>
            <tbody>
              {plan.furnishing.map((r) => (
                <tr key={r.key}>
                  <Td>
                    <div className="font-medium text-navy">{r.room}</div>
                    <div className="text-[12.5px] text-ink-soft">{r.detail}</div>
                  </Td>
                  <Td num>
                    <MoneyInput
                      value={r.conservative}
                      onCommit={(n) => setFurnishing(r.key, "conservative", n, currency)}
                    />
                  </Td>
                  <Td num>
                    <MoneyInput
                      value={r.mid}
                      onCommit={(n) => setFurnishing(r.key, "mid", n, currency)}
                    />
                  </Td>
                </tr>
              ))}
              <TotalRow
                label="Total Furnishing Budget"
                values={[currency(furnConservative), currency(furnMid)]}
              />
            </tbody>
          </table>
        </div>
        <Callout title="Recommended posture">
          Start conservative at {currency(furnConservative)} and let the{" "}
          {signedCurrency(surplus)} surplus decide whether to step selected rooms up toward the{" "}
          {currency(furnMid)} mid-range tier.
        </Callout>
      </Page>
      )}

      {/* SECTION 5 */}
      {active === "s5" && (
      <Page id="s5" title="The Final Goal & Emergency Fund">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { name: "Apartment Lease", amt: currency(plan.milestones.leaseAmount) },
            { name: "Honeymoon", amt: currency(plan.milestones.honeymoonAmount) },
            { name: "Wedding", amt: currency(plan.milestones.weddingAmount) },
            {
              name: "Furnishing",
              amt: `${currency(furnConservative)} – ${currency(furnMid)}`,
            },
          ].map((m) => (
            <div key={m.name} className="rounded-2xl bg-mist p-4 text-center">
              <div className="mx-auto mb-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-teal text-sm text-white">
                ✓
              </div>
              <div className="text-[13.5px] font-bold text-navy">{m.name}</div>
              <div className="mt-0.5 text-[12.5px] text-ink-soft">{m.amt}</div>
            </div>
          ))}
        </div>

        <div className="mt-7 rounded-[18px] bg-[image:var(--gradient-final)] px-6 py-10 text-center sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky">
            Emergency &amp; Buffer Fund
          </p>
          <h3 className="mt-3 font-display text-[28px] font-bold text-white">
            Our Security Cushion
          </h3>
          <p className="font-serif-italic text-[20px] italic text-sky">
            Fully funded before anything else grows
          </p>
          <div className="mx-auto mt-4 w-full max-w-[340px]">
            <input
              className="w-full bg-transparent text-center font-display text-[46px] font-extrabold text-gold focus:outline-none"
              value={currency(plan.emergency.goal)}
              onChange={(e) => {
                const n = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                setField(
                  "emergency",
                  "goal",
                  Number.isFinite(n) ? n : 0,
                  "Emergency fund goal",
                  money,
                );
              }}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-white/90">
            <span>Target date</span>
            <DateInput
              tone="dark"
              value={plan.emergency.date}
              onCommit={(v) =>
                setField("emergency", "date", v, "Emergency fund target date", (x) =>
                  formatDate(String(x)),
                )
              }
            />
            <span className="font-semibold text-sky">
              {countdownLabel(plan.emergency.date)}
            </span>
          </div>
          <p className="mt-6 font-serif-italic text-[17px] italic text-sky">
            "A plan we both understand is worth more than a number either of us guesses at."
          </p>
        </div>
      </Page>
      )}

      {/* DEVOTIONALS */}
      {active === "devotionals" && (
      <Page id="devotionals" title="Daily Devotionals for Andrew & Maria">
        <Devotionals
          devotionals={plan.devotionals}
          onOpen={openDevotional}
          onNote={setDevotionalNote}
          onSelectDay={selectDevotionalDay}
          onBack={() => goTo(null)}
        />
      </Page>
      )}

      {/* ACTIVITY */}
      {active === "activity" && (
      <Page id="activity" title="Edit History & Shared Notes">
        <ActivityPanel log={plan.log} comments={plan.comments} onAddComment={addComment} />
      </Page>
      )}


      {/* SECTION JUMP BAR (section view only) */}
      {active && (
        <nav className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {SECTION_LINKS.filter((s) => s.id !== active).map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(s.id)}
              className="card-surface flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left transition-all hover:border-gold/50"
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.tint}`}>
                <s.Icon size={15} strokeWidth={2} />
              </span>
              <span className="text-[12px] font-bold leading-tight text-navy">{s.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            if (confirm("Reset every figure back to the original document numbers?")) reset();
          }}
          className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs tracking-wide text-sky transition-colors hover:bg-white/20"
        >
          Reset to original numbers
        </button>
        <p className="mt-4 text-[11.5px] tracking-wide text-sky/70">
          Financial Master Plan · Andrew &amp; Maria · saved locally in this browser
        </p>
      </div>
    </main>
  );
}
