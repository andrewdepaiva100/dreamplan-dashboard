# Smart Financial Timeline

## What this adds
A new "Timeline" section in the hub-and-spoke layout that shows every money-related event between now and the wedding/honeymoon finish line. It combines wedding installment due dates, savings milestones, lease move-in targets, and any custom reminders into one scrollable timeline. Each event displays the cash required, the projected checking balance at that point, and a status badge.

## Why this is life changing
Instead of checking five different tables to know if you can afford the next payment, you open one screen and immediately see: "Payment 3 is due Oct 16; after it clears, checking drops to $8,431; you are safe" or "Warning: honeymoon deposit is due before Payment 4 clears."

## Scope
- Pure frontend + existing `plan_state` JSONB persistence. No new backend tables.
- Reads existing `payments`, `milestones`, `lease`, `funds.checking`, and `expenses`.
- Adds a new `timelineEvents` array derived from those sources, plus a small editable "custom reminders" list stored inside `PlanState`.
- Live cloud sync via the existing `usePlan` upsert/realtime channel.

## UI/UX
1. **Hub button**: Add "Timeline" to the main grid with a `CalendarClock` icon.
2. **Timeline view**:
   - Vertical chronological list grouped by month.
   - Each card shows: date, title, amount (if any), projected checking balance after the event, and a status badge (`upcoming`, `due-soon`, `paid`, `overdue`, `milestone`).
   - "Due soon" = within 14 days. "Overdue" = past due and unpaid.
3. **Projected balance line**:
   - Start from current `funds.checking`.
   - Subtract scheduled wedding payments in order.
   - Add any positive savings events (e.g., lease goal reached).
   - Subtract average monthly overhead * number of months elapsed.
   - Display as "Estimated checking balance after this event."
4. **Custom reminders**:
   - Simple inline form: label, date, optional amount.
   - Stored in `plan_state` under `timelineReminders`.
   - Syncs live.
5. **Detail drawer**:
   - Tapping a timeline card opens a small panel explaining the calculation and linking to the source section.

## Data model changes
- Add to `PlanState`:
  - `timelineReminders: { id, label, date, amount?, paid? }[]`
- Derive events in component; do not duplicate source of truth.

## Technical notes
- Compute timeline in a memoized helper inside the route/component.
- Re-use existing date/currency helpers from `src/lib/plan-data.ts`.
- Keep the hub-and-spoke navigation pattern: `active === "timeline"` renders the timeline view with a back button.
- No new server functions or cron jobs needed.

## Out of scope (for now)
- Email/SMS notifications (would need external provider).
- Bank account syncing.
- Recurring income modeling.

## Verification
- Typecheck passes.
- Build passes.
- Browser check: timeline shows Payment 1 paid, Payments 2-6 scheduled, milestones, and custom reminders; projected balances match manual math.
