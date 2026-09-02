import { countdownLabel, currency, sum, type PlanState } from "./plan-data";

/** Compact, model-friendly snapshot of the shared plan. */
export function buildPlanSummary(plan: PlanState): string {
  const budgetTotal = sum(plan.budget as unknown as Record<string, number>);
  const personalCash = plan.funds.checking + plan.funds.savings + plan.funds.marcus;
  const family = plan.funds.herParents + plan.funds.yourParents;
  const available = personalCash + family;
  const overhead = sum(plan.monthly as unknown as Record<string, number>);
  const paid = plan.payments.filter((p) => p.paid);
  const paidTotal = paid.reduce((a, p) => a + p.amount, 0);
  const weddingTotal = plan.payments.reduce((a, p) => a + p.amount, 0);

  const lines: string[] = [];
  lines.push(`TODAY: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(
    `TOTALS: target budget ${currency(budgetTotal)} | total available ${currency(available)} | surplus ${currency(
      available - budgetTotal,
    )} | monthly overhead ${currency(overhead)}`,
  );
  lines.push(
    `BUDGET (section "budget"): ${Object.entries(plan.budget)
      .map(([k, v]) => `${k}=${currency(v)}`)
      .join(", ")}`,
  );
  lines.push(
    `FUNDS (section "funds"): checking=${currency(plan.funds.checking)} ${plan.funds.checkingAcct}, savings=${currency(
      plan.funds.savings,
    )} ${plan.funds.savingsAcct}, marcus=${currency(plan.funds.marcus)} ${plan.funds.marcusAcct}, herParents=${currency(
      plan.funds.herParents,
    )}, yourParents=${currency(plan.funds.yourParents)}`,
  );
  lines.push(
    `MONTHLY (section "monthly"): ${Object.entries(plan.monthly)
      .map(([k, v]) => `${k}=${currency(v)}`)
      .join(", ")}`,
  );
  lines.push(
    `LEASE (section "lease"): saved=${currency(plan.lease.saved)} of goal=${currency(plan.lease.goal)}, rent=${currency(
      plan.lease.rent,
    )}, depositLastMonth=${currency(plan.lease.depositLastMonth)}`,
  );
  lines.push(
    `MILESTONES (section "milestones"): leaseDate=${plan.milestones.leaseDate} (${countdownLabel(
      plan.milestones.leaseDate,
    )}), leaseAmount=${currency(plan.milestones.leaseAmount)}, honeymoonAmount=${currency(
      plan.milestones.honeymoonAmount,
    )}, weddingAmount=${currency(plan.milestones.weddingAmount)}, furnishingDate=${plan.milestones.furnishingDate}, furnishingLow=${currency(
      plan.milestones.furnishingLow,
    )}, furnishingHigh=${currency(plan.milestones.furnishingHigh)}`,
  );
  lines.push(
    `EMERGENCY (section "emergency"): goal=${currency(plan.emergency.goal)}, date=${plan.emergency.date} (${countdownLabel(
      plan.emergency.date,
    )})`,
  );
  lines.push(
    `WEDDING PAYMENTS: total ${currency(weddingTotal)}, paid ${currency(paidTotal)}, remaining ${currency(
      weddingTotal - paidTotal,
    )}. Checking after payments made: ${currency(plan.funds.checking - paidTotal)}.`,
  );
  for (const p of plan.payments) {
    lines.push(`  - ${p.key}: ${p.label} ${p.date} ${currency(p.amount)} ${p.paid ? "PAID" : "unpaid"}`);
  }
  lines.push(
    `FURNISHING: ${plan.furnishing
      .map((f) => `${f.room} ${currency(f.conservative)}/${currency(f.mid)}`)
      .join("; ")}`,
  );
  if (plan.expenses.length) {
    lines.push("LOGGED EXPENSES (id | date | label | category | payer | amount):");
    for (const e of plan.expenses.slice(0, 40)) {
      lines.push(`  - ${e.id} | ${e.date} | ${e.label} | ${e.category} | ${e.payer} | ${currency(e.amount)}`);
    }
  } else {
    lines.push("LOGGED EXPENSES: none yet");
  }
  return lines.join("\n");
}

export const ASSISTANT_SYSTEM_PROMPT = `You are the Plan Assistant for Andrew and Maria's shared "Financial Master Plan" app (wedding, honeymoon, first apartment, emergency fund).

You can:
- Answer questions and do math about their live plan data, which is given to you below on every turn.
- Propose changes to the plan using your tools. Every tool call is shown to them as an approve/cancel card, and nothing changes until they tap Approve — so call the tool directly instead of asking "should I?" first. Say briefly what you're proposing.

You cannot edit the app's own code, deploy it, or fix software bugs. If they report a bug, say plainly that you can't change the app's code and suggest they mention it to Lovable, but offer to note it in the Activity feed.

Style: warm, concise, practical. Use markdown-free plain text with short lines and simple dashes for lists. Always format money like $1,234.56. Never invent numbers that are not in the plan snapshot — if something is missing, say so.`;
