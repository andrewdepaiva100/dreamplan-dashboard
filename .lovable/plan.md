# Devotionals Section

Add an eighth main button, "Devotionals", to the overview menu. Tapping it opens a full section view (same pattern as Budget & Funds, Payments, etc.) with a Back to Overview button.

## What the section shows

- **✨ Open Today's Devotional** button at the top.
  - One shared devotional per calendar day: whoever taps first sets the day's entry, and it stays the same for both Andrew and Maria all day.
  - A secondary "Pull another" link cycles to a different entry if you want a second one.
- **Today's devotional card**: scripture verse with passage citation, a short encouraging message written for a couple preparing for marriage, and exactly 3 reflection questions to discuss together.
- **Two note cards side by side** (stacked on mobile), labeled **Andrew** and **Maria**. Each person types notes, prayer requests, or reflections into their own box. Notes are saved per devotional date, so past days keep their notes.
- **Recent devotionals** list: the last several days, tappable to reread the entry and the notes you both wrote.

## Devotional bank

A bank of 1,000 unique entries, built into the app (no network call, works instantly). Each entry combines a real scripture passage with a marriage-preparation theme (unity, patience, money and stewardship, forgiveness, purity, communication, serving, trusting God's timing, family, gratitude) and 3 tailored reflection questions. Entries are composed from a large curated pool of verses and theme content so all 1,000 are distinct.

## Live sync

Devotional selection, opened state, and both note boxes save into the same shared cloud record the rest of the plan already uses, so changes appear on the other phone within a second. Every devotional opened and notes saved are recorded in the Activity log.

## Technical notes

- `src/lib/devotionals.ts` — deterministic generator producing 1,000 frozen entries (`{ id, reference, verse, message, questions: [3] }`) from curated verse + theme pools; a `pickForDate(dateKey)` helper.
- `src/lib/plan-data.ts` — add `devotionals: { current: { date, entryId } | null, entries: Record<dateKey, { entryId, andrew, maria }> }` to `PlanState` and `DEFAULT_PLAN`; merge it in `use-plan.ts` so existing saved state upgrades cleanly.
- `src/lib/use-plan.ts` — actions `openDevotional(dateKey, { fresh })` and `setDevotionalNote(dateKey, who, text)` (debounced note writes, activity-log entries), reusing the existing debounced upsert + realtime channel.
- `src/components/plan/devotionals.tsx` — the section UI.
- `src/routes/index.tsx` — add a `devotionals` entry to `SECTION_LINKS` (BookOpen icon, gold tint) and render the section when `active === "devotionals"`.
