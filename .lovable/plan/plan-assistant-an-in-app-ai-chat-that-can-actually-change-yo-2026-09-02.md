# Plan Assistant — an in-app AI chat that can actually change your plan

A ChatGPT-style assistant built into the app. It knows your live numbers (budget, funds, wedding payments, expenses, milestones, emergency fund) and can make changes for you when you ask — "mark payment 3 as paid", "add a $62 grocery expense for Maria", "bump the venue to $16,500", "how much surplus do we have after the next two payments?"

One honest limit up front: it can chat and edit your plan data, but it cannot rewrite the app's own code or fix app bugs — that's what I do here in Lovable. If you want, tell it about a bug and it will just note it in the chat.

## What you'll see

- A new **Assistant** button on the main dashboard hub, alongside Devotionals and Storage & Health.
- A chat screen with a thread list: past conversations on the left (top on mobile), "New chat" button, and each thread at its own URL so it reloads correctly.
- Threads and messages are stored in the cloud, so you and Maria see the same conversations on both phones.
- Answers stream in live, formatted with headings/lists.
- When the assistant wants to change something, it shows a small **confirm card** ("Mark Payment 3 — Oct 16, 2026 as paid?") with Approve / Cancel. Nothing changes until you tap Approve.
- Approved changes flow through the same save path as manual edits, so they hit the cloud instantly, appear on Maria's phone, and get written into your existing Edit History log (labelled as assistant changes).

## What the assistant can do

Read: full plan snapshot — budget lines, all accounts, family contributions, monthly overhead, lease tracker, milestones and countdowns, the 6 wedding payments, logged expenses, furnishing tiers, emergency fund.

Change (each requires your tap to approve):
- Update any money field (budget line, account balance, monthly overhead item, lease saved, milestone amounts, emergency goal)
- Update any date field
- Toggle a wedding payment paid/unpaid
- Add or delete an expense
- Add a note/comment to the Activity feed

It will not touch devotionals, notes privacy, or the health monitoring.

## Technical notes

- **Model / provider:** Lovable AI via the AI Gateway, called only from the server. Adds `ai`, `@ai-sdk/react`, and the gateway provider packages. `LOVABLE_API_KEY` already exists.
- **Streaming endpoint:** `src/routes/api/chat.ts` (TanStack server route) using `streamText` + `toUIMessageStreamResponse`, with tool definitions for the read/change actions above. Mutating tools use `needsApproval` so the UI renders the confirm card.
- **Gate:** the endpoint checks the existing password-session cookie (same helper as `src/lib/gate.functions.ts`) so it isn't a public AI endpoint.
- **Database:** two new tables, following the existing shared-anon pattern used by `plan_state`:
  - `chat_threads` — title, created/updated timestamps
  - `chat_messages` — thread id, role, `parts` JSONB (AI SDK `UIMessage` shape), created_at
  Both with GRANTs and RLS policies matching the current shared-access model, plus Realtime enabled so a thread started on one phone appears on the other.
- **Routes:** `src/routes/assistant.tsx` (thread list + redirect to newest/new thread) and `src/routes/assistant.$threadId.tsx` (the chat). Chat is keyed by `threadId`; messages persist in `onFinish`.
- **Applying changes:** approved tool calls are applied client-side through the existing `usePlan()` actions in `src/lib/use-plan.ts`, so cloud sync, echo-loop protection, and activity logging all keep working unchanged. A thin `applyAssistantAction` helper maps a tool call to the right existing action.
- **Styling:** same navy/gold/emerald tokens, white cards, existing primitives.

## Out of scope

- No code editing, deployment, or bug fixing by the AI.
- No changes to devotionals, health monitoring, or the password gate itself.
