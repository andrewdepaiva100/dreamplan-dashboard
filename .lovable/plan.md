# Devotionals: 1,500-Entry Personal Growth Bank

## A note on NIV / ESV

Both the NIV and the ESV are copyrighted translations. Bundling 1,500 passages of either one into the app isn't something I can ship. What I'll use instead is the **Berean Standard Bible (BSB)** — a modern, highly readable translation that is freely licensed for exactly this kind of use, and reads very close to NIV/ESV phrasing. Every verse will be cited clearly (e.g. "Philippians 4:6-7 (BSB)").

If you'd rather show real NIV/ESV text later, the clean route is a "Read in ESV" link on each devotional that opens the passage on a licensed site — I can add that on top.

## 1. New devotional bank (1,500 entries)

- Rebuild the bank to **1,500 unique entries**, all focused on **individual spiritual growth**: personal faith, character, identity in Christ, prayer life, resilience, obedience, humility, gratitude, courage, purpose, repentance, trust, contentment, and daily walk with God. No marriage or couple-focused content.
- Scripture length **varies naturally**: some entries carry 1 verse, some 2, some 3 (from a curated verse pool where each item is tagged with how many verses it contains).
- Each entry keeps the existing structure:
  - Scripture passage + citation (BSB)
  - A short, encouraging devotional reflection written in second person ("you"), for one reader
  - Exactly **3 reflection questions** for personal application
- Reflection length stays in the 300-500 word range that's already validated, and the generator checks all 1,500 entries for uniqueness and word count.
- Andrew and Maria each still get their own independent entry for the same day.

## 2. Reset of devotional history

Because entry numbering changes, existing devotional history and notes are cleared on the shared cloud record when the new bank loads. All financial data (budget, funds, payments, expenses, activity log, comments) is untouched.

## 3. Scripture banner behavior

- The Luke 14:28 banner stays on the main dashboard overview, with spacing corrected so it sits cleanly above the metric cards with no overlap at any screen width.
- The banner is fully hidden the moment you enter the Devotionals section (already the intended behavior — I'll confirm it holds on mobile widths too).

## 4. Devotionals landing view

- Tapping **Devotionals** shows only two large buttons — **Andrew** and **Maria** — plus **Back to Dashboard**. Nothing else on that screen.
- Tapping a name opens that person's space: their assigned devotional, the 3 reflection questions, and their private reflection box, with a "Back to choice" control.
- Selections and notes continue syncing live through Lovable Cloud, so both phones stay in step.

## Technical details

- `src/lib/devotionals/verses.ts` — replaced with a BSB, individually-focused verse pool where each item declares 1-3 verses of text; growth themes only.
- `src/lib/devotionals/themes.ts` — themes, opener/insight/application/prayer text rewritten for personal growth (singular "you"), removing couple/wedding/budget framing.
- `src/lib/devotionals/index.ts` — `TOTAL_DEVOTIONALS = 1500`; deterministic composer regenerated; validation script re-run to confirm 1,500 unique entries, each 300-500 words, with 3 questions.
- `src/lib/use-plan.ts` — one-time devotional-state migration that resets `devotionals.people` to empty for the new bank version (financial state preserved).
- `src/routes/index.tsx` — banner spacing fix; confirm banner is overview-only.
- `src/components/plan/devotionals.tsx` — landing/person views verified; verse block renders multi-verse passages cleanly.
