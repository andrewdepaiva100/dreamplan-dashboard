# Fix: Devotionals crash when tapping Andrew or Maria

## Root cause (confirmed)

In `src/components/plan/devotionals.tsx`, the `useMemo` hook on line 139 is placed **after** an early `return` for the landing view (`if (!who) return ...`). When you tap Andrew or Maria, the component switches from the landing view to the person view, and React suddenly sees a different number of hooks than the previous render — a "Rendered more hooks than during the previous render" error that unmounts the whole app and shows the "This page didn't load" screen.

## Fix

1. **Move the `useMemo` above the early return** in `devotionals.tsx` so hooks run in the same order on every render (compute with a guard when `who` is null).

2. **Defensive guards for synced data** (prevents the same crash class from older cloud state):
   - `devotionals?.people?.[who]` with a safe fallback so a stale/partial cloud record can't throw on `person.current`.
   - `d.note?.trim()` instead of `d.note.trim()` in the recent-devotionals list, so a missing note field never crashes.

3. **Verify in the live preview**: unlock, open Devotionals, tap Andrew and Maria, confirm each space renders (devotional, questions, notes box) with no error page, then confirm the crash page no longer appears.

## Technical details

- File touched: `src/components/plan/devotionals.tsx` only.
- No data-model or cloud-sync changes; existing saved devotionals and notes are untouched.
- React rules-of-hooks fix is the minimal change; no visual redesign.
