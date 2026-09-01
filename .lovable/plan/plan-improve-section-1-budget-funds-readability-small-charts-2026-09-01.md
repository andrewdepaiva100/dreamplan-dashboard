# Plan: Improve Section 1 (Budget & Funds) Readability + Small Charts

## What changes

### 1. Cleaner, easier-to-read tables
- Restyle the Section 1 tables: comfortable row spacing, clearer typography, subtle zebra/hover rows, and right-aligned totals with the existing gold total styling.
- Give each row a small colored dot so categories match the charts at a glance.

### 2. Easier editing
- Money fields become clearly editable at a glance: underlined/inset input styling on hover, pencil affordance, larger tap target on phones (Maria's phone), and commit on blur/Enter as today.
- No behavior changes to logging or cloud sync — edits still flow through the existing `setField` path and Activity log.

### 3. Small charts (live, synced to edits)
Added directly inside Section 1:
- **Budget breakdown donut** — each wedding category's share of the $35,000 target.
- **Available funds donut** — Checking, Savings, Marcus HYSA, Family Contributions.
- **Surplus mini bar gauge** — Target Budget vs Total Available with the surplus segment highlighted in emerald/gold, echoing the top metric strip.

Charts update instantly when any amount is edited (they read the same live state — no extra storage or sync work needed).

## How it's built
- Donuts + gauge rendered as lightweight inline SVG (no chart library needed at this scale), or Recharts if interactivity (tooltips/legend hover) is preferred — decide at build time; SVG keeps the bundle tiny and matches the existing styling exactly.
- Colors come from the existing navy/royal/gold/emerald tokens in `src/styles.css` — no new palette.
- Layout: on desktop, charts sit beside or beneath the two tables inside Section 1; on mobile they stack below the tables, sized small so they don't push content down.

## Out of scope
- No new routes, no new data fields, no changes to other sections or to the payment tracker.
