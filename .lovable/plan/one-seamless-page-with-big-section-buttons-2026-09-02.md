# One seamless page with big section buttons

Remove the "pages" feel and turn the quick-jump navigation into large, beautiful section cards.

## Changes

**1. Remove the "Page X of 5" tags** (`src/routes/index.tsx`, `src/components/plan/primitives.tsx`)
- Drop the `tag` prop from all five `<Page>` usages (`s1`–`s5`).
- Update the `Page` component: remove the `tag` prop and its eyebrow row (gold dash + "Page X of 5" text). Sections keep their big headings, so nothing is lost.

**2. Big beautiful section buttons** (`src/routes/index.tsx`)
- Replace the current small pill nav with a grid of large tappable cards (2 columns on phone, up to 4 on desktop).
- Each card: Lucide icon in a tinted rounded square (navy/royal/sky/gold/teal rotation), bold label, small one-line description (e.g. "Budget & Funds — targets vs. available cash").
- Cards use the existing white card surface, gold hover accent, and smooth-scroll to their section on tap (same `scrollIntoView` behavior, sections already have `scroll-mt`).
- 7 cards: Budget & Funds, Wedding Payments, Monthly & Lease, Savings Roadmap, Furnishing Budget, Final Goal & Emergency, Activity & Notes.

**3. Keep everything else identical** — one long scrolling page, sticky metric strip, all sections, editing, and cloud sync untouched.

## Technical notes
- Only two files change: `src/routes/index.tsx` (nav grid + remove tag props) and `src/components/plan/primitives.tsx` (simplify `Page`).
- No new dependencies; uses existing design tokens and Lucide icons already imported.
- Verify with a build check after edits.
