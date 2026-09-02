import { tool } from "ai";
import { z } from "zod";

export const MONEY_FIELDS = {
  budget: ["venue", "honeymoon", "dress", "desserts", "makeup"],
  funds: ["checking", "savings", "marcus", "herParents", "yourParents"],
  monthly: ["spotify", "cinemark", "phone", "health", "life", "groceries", "lifestyle"],
  lease: ["saved", "goal", "rent", "depositLastMonth"],
  milestones: [
    "leaseAmount",
    "honeymoonAmount",
    "weddingAmount",
    "furnishingLow",
    "furnishingHigh",
  ],
  emergency: ["goal"],
} as const;

export const EXPENSE_CATEGORY_KEYS = [
  "spotify",
  "cinemark",
  "phone",
  "health",
  "life",
  "groceries",
  "lifestyle",
  "other",
] as const;

const moneySection = z.enum([
  "budget",
  "funds",
  "monthly",
  "lease",
  "milestones",
  "emergency",
]);

export const updateMoneyInput = z.object({
  section: moneySection,
  key: z.string().describe("Field key inside the section, e.g. 'venue' or 'checking'"),
  value: z.number().describe("New dollar amount"),
  label: z.string().describe("Short human label for the activity log, e.g. 'Venue budget'"),
});

export const updateDateInput = z.object({
  section: z.enum(["milestones", "emergency"]),
  key: z.string().describe("'leaseDate', 'furnishingDate' or 'date'"),
  value: z.string().describe("New date as YYYY-MM-DD"),
  label: z.string(),
});

export const setPaymentPaidInput = z.object({
  paymentKey: z.string().describe("Payment key: p1 … p6"),
  paid: z.boolean(),
});

export const updatePaymentInput = z.object({
  paymentKey: z.string().describe("Payment key: p1 … p6"),
  field: z.enum(["date", "amount"]),
  value: z.string().describe("New date (YYYY-MM-DD) or amount as a number string"),
});

export const addExpenseInput = z.object({
  date: z.string().describe("YYYY-MM-DD"),
  label: z.string(),
  category: z.enum(EXPENSE_CATEGORY_KEYS),
  payer: z.string().describe("Andrew, Maria or Shared"),
  amount: z.number(),
});

export const removeExpenseInput = z.object({
  expenseId: z.string(),
});

export const addNoteInput = z.object({
  author: z.string().describe("Andrew or Maria"),
  text: z.string(),
});

/**
 * Tools are declared without `execute` on purpose: every one of them changes
 * the shared plan, so the browser renders an approve/cancel card and applies
 * the change through the existing usePlan actions.
 */
const actionOutput = z.object({ applied: z.boolean(), detail: z.string() });

export const assistantTools = {
  updateMoney: tool({
    description:
      "Change a dollar amount on the plan (budget line, account balance, monthly overhead item, lease reserve, milestone amount or emergency goal).",
    inputSchema: updateMoneyInput,
    outputSchema: actionOutput,
  }),
  updateDate: tool({
    description: "Change a date on the plan (lease date, furnishing date, emergency fund date).",
    inputSchema: updateDateInput,
    outputSchema: actionOutput,
  }),
  setPaymentPaid: tool({
    description: "Mark one of the six wedding installments as paid or unpaid.",
    inputSchema: setPaymentPaidInput,
    outputSchema: actionOutput,
  }),
  updatePayment: tool({
    description: "Change the date or amount of one of the six wedding installments.",
    inputSchema: updatePaymentInput,
    outputSchema: actionOutput,
  }),
  addExpense: tool({
    description: "Log a real spent expense in the shared expense tracker.",
    inputSchema: addExpenseInput,
    outputSchema: actionOutput,
  }),
  removeExpense: tool({
    description: "Delete a logged expense by its id.",
    inputSchema: removeExpenseInput,
    outputSchema: actionOutput,
  }),
  addNote: tool({
    description: "Post a note/comment to the shared Activity feed.",
    inputSchema: addNoteInput,
    outputSchema: actionOutput,
  }),
} as const;

export type AssistantToolName = keyof typeof assistantTools;
