# Fix: black screen after walking through a portal

## What's happening

Walking into a portal fades the camera to black, then reloads the game scene for the next realm. The screen stays black afterwards, while the on-screen HUD still shows the *previous* realm's objective. That combination means the new realm never finishes building — the fade-to-black is never cleared and no fresh HUD is sent.

Two things can cause this, and both are cheap to handle:

1. The camera fade-out is still applied when the scene reloads. The fade is only undone at the very end of the realm setup, so anything that interrupts setup leaves the screen black forever.
2. Something in the next realm's setup throws an error, aborting setup silently (no error surfaces in the game UI today, so it just looks frozen).

## Plan

1. Reproduce the transition in a headless browser: start the game, jump straight to the second realm, walk into the portal, and capture the exact console error at the moment of the black screen.
2. Clear the black fade first, not last. On realm load, reset the camera effects and fade back in before any world building happens, so a slow or failing build can never leave a black screen.
3. Make realm loading failure-proof: wrap the realm build in error handling that logs the real cause, restores the camera, and shows a readable in-game message instead of a black void.
4. Fix whatever the reproduction step turns up as the actual crash cause.
5. Re-verify by walking through the portal again in the browser and confirming the new realm renders, the HUD updates to the new act, and the console is clean.

## Technical notes

- `src/lib/quest/scene.ts`: `advanceZone()` / `checkPortal()` do `cameras.main.fadeOut(...)` then `scene.restart({ save })`. `create()` calls `buildZone()` before `cameras.main.fadeIn(...)`; move a `cameras.main.resetFX()` + `fadeIn()` to the top of `create()`.
- Guard `buildZone()` with try/catch that emits a toast/modal and calls `pushHud(true)` so the UI never keeps stale act data.
- Also reset `traveling`/`frozen` on the new scene instance so a failed transition can't lock input.
