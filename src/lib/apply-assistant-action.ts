import { currency, formatDate, type ExpenseCategory, type PlanState } from "./plan-data";
import { EXPENSE_CATEGORY_KEYS, MONEY_FIELDS } from "./assistant-tools";

type PlanActions = {
  plan: PlanState;
  setField: (
    section: keyof PlanState,
    key: never,
    value: never,
    label: string,
    format?: (v: unknown) => string,
  ) => void;
  setPaymentField: (
    key: string,
    field: "date" | "amount",
    value: string | number,
    format?: (v: unknown) => string,
  ) => void;
  togglePayment: (key: string) => void;
  addExpense: (e: {
    date: string;
    label: string;
    category: ExpenseCategory;
    payer: string;
    amount: number;
  }) => void;
  removeExpense: (id: string) => void;
  addComment: (author: string, text: string) => void;
};

export type ApplyResult = { applied: boolean; detail: string };

const money = (v: unknown) => currency(Number(v) || 0);
const date = (v: unknown) => formatDate(String(v));

/** Human-readable one-liner for the approval card. */
export function describeAction(toolName: string, input: any): string {
  switch (toolName) {
    case "updateMoney":
      return `Set ${input?.label ?? `${input?.section}.${input?.key}`} to ${money(input?.value)}`;
    case "updateDate":
      return `Set ${input?.label ?? `${input?.section}.${input?.key}`} to ${date(input?.value)}`;
    case "setPaymentPaid":
      return `Mark ${String(input?.paymentKey ?? "").toUpperCase()} as ${input?.paid ? "Paid" : "Unpaid"}`;
    case "updatePayment":
      return `Change ${String(input?.paymentKey ?? "").toUpperCase()} ${input?.field} to ${
        input?.field === "amount" ? money(input?.value) : date(input?.value)
      }`;
    case "addExpense":
      return `Log expense "${input?.label}" ${money(input?.amount)} (${input?.payer}, ${input?.date})`;
    case "removeExpense":
      return `Delete expense ${input?.expenseId}`;
    case "addNote":
      return `Post a note from ${input?.author}: "${input?.text}"`;
    default:
      return `Run ${toolName}`;
  }
}

export function applyAssistantAction(
  toolName: string,
  input: any,
  actions: PlanActions,
): ApplyResult {
  try {
    switch (toolName) {
      case "updateMoney": {
        const section = input.section as keyof typeof MONEY_FIELDS;
        const allowed = MONEY_FIELDS[section] as readonly string[] | undefined;
        if (!allowed || !allowed.includes(input.key)) {
          return { applied: false, detail: `Unknown field ${input.section}.${input.key}` };
        }
        const value = Number(input.value);
        if (!Number.isFinite(value)) return { applied: false, detail: "Invalid amount" };
        actions.setField(
          section as keyof PlanState,
          input.key as never,
          value as never,
          input.label || `${section} — ${input.key}`,
          money,
        );
        return { applied: true, detail: describeAction(toolName, input) };
      }
      case "updateDate": {
        const section = input.section as "milestones" | "emergency";
        const allowed =
          section === "milestones" ? ["leaseDate", "furnishingDate"] : ["date"];
        if (!allowed.includes(input.key)) {
          return { applied: false, detail: `Unknown date field ${section}.${input.key}` };
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.value))) {
          return { applied: false, detail: "Date must be YYYY-MM-DD" };
        }
        actions.setField(
          section as keyof PlanState,
          input.key as never,
          String(input.value) as never,
          input.label || `${section} — ${input.key}`,
          date,
        );
        return { applied: true, detail: describeAction(toolName, input) };
      }
      case "setPaymentPaid": {
        const row = actions.plan.payments.find((p) => p.key === input.paymentKey);
        if (!row) return { applied: false, detail: `No payment ${input.paymentKey}` };
        if (row.paid === Boolean(input.paid)) {
          return { applied: true, detail: `${row.label} was already ${row.paid ? "paid" : "unpaid"}` };
        }
        actions.togglePayment(row.key);
        return { applied: true, detail: `${row.label} marked ${input.paid ? "Paid" : "Unpaid"}` };
      }
      case "updatePayment": {
        const row = actions.plan.payments.find((p) => p.key === input.paymentKey);
        if (!row) return { applied: false, detail: `No payment ${input.paymentKey}` };
        if (input.field === "amount") {
          const value = Number(input.value);
          if (!Number.isFinite(value)) return { applied: false, detail: "Invalid amount" };
          actions.setPaymentField(row.key, "amount", value, money);
        } else {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(String(input.value))) {
            return { applied: false, detail: "Date must be YYYY-MM-DD" };
          }
          actions.setPaymentField(row.key, "date", String(input.value), date);
        }
        return { applied: true, detail: describeAction(toolName, input) };
      }
      case "addExpense": {
        const amount = Number(input.amount);
        if (!Number.isFinite(amount) || amount <= 0) {
          return { applied: false, detail: "Invalid amount" };
        }
        const category = (EXPENSE_CATEGORY_KEYS as readonly string[]).includes(input.category)
          ? (input.category as ExpenseCategory)
          : ("other" as ExpenseCategory);
        actions.addExpense({
          date: /^\d{4}-\d{2}-\d{2}$/.test(String(input.date))
            ? String(input.date)
            : new Date().toISOString().slice(0, 10),
          label: String(input.label || "Expense"),
          category,
          payer: String(input.payer || "Shared"),
          amount,
        });
        return { applied: true, detail: describeAction(toolName, input) };
      }
      case "removeExpense": {
        const row = actions.plan.expenses.find((e) => e.id === input.expenseId);
        if (!row) return { applied: false, detail: "That expense no longer exists" };
        actions.removeExpense(row.id);
        return { applied: true, detail: `Deleted "${row.label}"` };
      }
      case "addNote": {
        const text = String(input.text || "").trim();
        if (!text) return { applied: false, detail: "Empty note" };
        actions.addComment(String(input.author || "Andrew"), text);
        return { applied: true, detail: "Note posted to the Activity feed" };
      }
      default:
        return { applied: false, detail: `Unknown action ${toolName}` };
    }
  } catch (error) {
    return { applied: false, detail: `Failed: ${(error as Error).message}` };
  }
}
