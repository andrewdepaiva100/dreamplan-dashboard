# Home Redesign, Sleep Fix, and a Real Opening Conversation

Three things: make the inside of the house actually look good, stop the game freezing when you sleep or back out, and turn the first person Maria meets into a real guide who explains the world.

## 1. A nicer home interior

Right now the room is a flat orange checkerboard with three big yellow blobs of light. Replacing it with a cozy, believable cottage room:

- Wooden plank floor with long horizontal boards, subtle grain and seams, instead of the checkerboard tiles.
- A proper wall: dark timber beams, a lighter plaster panel between them, and a baseboard where wall meets floor.
- The two windows become framed windows with sills and a soft square of daylight spilling onto the floor beneath each.
- The rug gets a woven border and sits under a small table with a candle and a mug, so the middle of the room isn't empty.
- Furniture (hearth, chest, bed) gets a soft contact shadow so nothing looks like it's floating, plus a small hanging shelf and wall picture for warmth.
- Lighting: one gentle glow from the fire and one from the candle, both small and soft, plus a slight darkening at the room's edges. No more big yellow circles floating in mid-air.
- The doorway at the bottom becomes a real door with a frame, a mat, and the "Outside" label above it.
- Title card at the top restyled to sit on a small wooden sign rather than floating text.

## 2. Sleep / back-out freeze

Confirmed cause: when you open the bed, chest or hearth panel the game pauses movement, and closing the panel un-freezes the controls but never un-pauses movement — so Maria can't move and can't leave. Fix: closing any home panel restores movement fully. Also after sleeping, the panel closes itself and movement returns, with a short morning fade.

## 3. The first NPC gives a real orientation, not a map popup

- The "Read the Realm Map" prompt next to the first NPC is removed. The realm map stays available from the map button in the corner.
- Talking to the act's guide (Wren on the Sunlit Shores, and the equivalent guide in each act) becomes a multi-page conversation with next/back, written in depth: who they are, where Maria has woken up, why the realm is golden, what the relics and envelopes are, who Andrew is and what waits at the end, what the dangers are and how to fight them, how hearts, resting and the house work, and exactly what her next objective is. The weapon gift lands at the end of that conversation, as it does today.
- Each of the five acts gets its own long version of that talk, so the guide in every realm explains that realm properly rather than a single line.

## Technical notes

- `src/lib/quest/house.ts` — new room rendering (plank floor, beams, windows, shadows, vignette), and `onResume` must call `this.physics.resume()` alongside clearing the frozen flag.
- `src/lib/quest/textures.ts` — new procedural sprites for plank/wall/window-light/shelf/candle-table; keep existing keys working.
- `src/components/plan/quest.tsx` — bed panel closes itself after sleeping; no other panel logic changes.
- `src/lib/quest/scene.ts` — drop the `guide`/"Read the Realm Map" interactable from `spawnGuideAndSignpost` (signpost stays); route `act-guide` into the new paged dialogue modal, granting the weapon on the final page.
- `src/lib/quest/content.ts` — `ACT_GUIDES` gains a `pages: string[]` field with the long per-act script; existing `line` kept for repeat visits.
- New modal variant in `src/lib/quest/events.ts` for paged guide dialogue.
