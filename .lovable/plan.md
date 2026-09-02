# Menu-only navigation — one section visible at a time

Turn the dashboard into a hub-and-spoke layout: the home screen shows the header, metric strip, and big section buttons. Tapping a button swaps the whole view to that section only. No continuous scrolling through all sections.

## Changes (`src/routes/index.tsx` only)

**1. Active-section state**
- Add `const [active, setActive] = useState<string | null>(null)` — `null` means the overview menu.

**2. Overview (default) view**
- Header, scripture banner, sticky metric strip, and the big button grid.
- Buttons call `setActive(id)` and scroll to top (instead of `scrollIntoView`).

**3. Section view**
- When `active` is set, render ONLY that section's `<Page>` content (conditional render per section id: `s1`, `payments`, `s2`, `s3`, `s4`, `s5`, `activity`).
- Keep the sticky metric strip visible at top so key numbers are always in view.
- Add a prominent "Back to Overview" button (ArrowLeft icon) above the section, plus a compact button grid at the bottom of the section to jump directly to another section without going back.

**4. Keep everything else identical**
- All sections, editing, charts, and live cloud sync work exactly as before — only which section is mounted changes.

## Technical notes
- Single-file change in `src/routes/index.tsx`; no new dependencies, no data or sync changes.
- Scroll to top on every section switch so mobile users always land at the section heading.
- Verify with a build check after edits.
