# Share Only the Game with a Friend

## Goal
Give your friend a link that opens *Maria's Quest* and nothing else — no financial dashboard, no budget numbers, no unlock screen for the plan.

## What we'll build
A dedicated public `/game` route that renders the full game in a clean, full-screen view. The existing `/` financial dashboard stays password-locked, so anyone with the `/game` link can play but cannot reach your private plan.

## Plan

1. **Create a public `/game` route**
   - Add `src/routes/game.tsx`.
   - Render `<MariasQuest />` directly with no dashboard chrome.
   - Do **not** call `isUnlocked()` in the loader, so the route is reachable without the plan password.
   - Set game-specific head metadata (title, description, OG tags).

2. **Make the "Back to Dashboard" button optional**
   - In `src/components/plan/quest.tsx`, change `onExit` from required to optional.
   - Hide the "Back to Dashboard" button when `onExit` is not provided, so the game-only page has no accidental exit to the plan.

3. **Share the link**
   - After the route exists, you can send your friend either:
     - The **published URL** with `/game` on the end (e.g. `https://dreamplan-dashboard.lovable.app/game`) — permanent and public once you publish.
     - A **Share preview** link with `/game` appended — temporary 7-day public link that does not require a Lovable login.
   - The root `/` will still ask for the plan password, so your financial data stays protected.

## Notes
- The game saves progress in its own localStorage slot; nothing financial is loaded on `/game`.
- No backend or database changes are needed.
