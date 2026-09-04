# Maria's Quest — water, dialogue, HUD, sleep and the house

A single focused pass covering all seven notes.

## 1. Water is solid
Water becomes a wall Maria can't cross. Bridges and stone crossings stay walkable, so the routes across the river still work. Enemies and animals respect the same rule.

## 2. Shorter opening conversation
Wren's opening talk gets trimmed by roughly a fifth, and the lines that name what's coming later (the wardens further on, doubt/stress/weariness) are pulled back to a vaguer hint. He still explains where Maria is, who Andrew is, and what to do next.

## 3. Smaller objective banner
The act banner at the top (act name, objective line, counters, Ping button) shrinks — smaller text, tighter padding, narrower box — so it covers much less of the screen.

## 4 + 5. Aegis explanation, tied to Ivy
The Aegis of Unshakable Faith message gets two extra short sentences: what actually happens when it triggers (last heart, a push-back, a few safe seconds) and why it matters for what Ivy just told Maria — the Conservatory, the four seasonal keys and the Stress Spectre waiting inside. Kept brief, no wall of text.

## 6. Sleeping and Maria's house
- Sleeping always wakes Maria at 7:00 AM, whatever hour she lay down, and the outdoor world now actually shows morning when she steps back out (the world clock currently keeps its old time).
- Her house moves noticeably closer to the arrival point in all five acts.
- The house is purple and about 20% larger.
- The interior gets a richer, higher-end look: warmer layered lighting around the fire and windows, better wood and plaster shading, softer floor shadows, curtains, wall trim and small props so it reads like a polished game room rather than flat blocks.

## Technical notes
- `src/lib/quest/textures.ts`: add `T.WATER` to `SOLID_TILES`; recolour/enlarge the `cottage` sprite (purple walls, 1.2x).
- `src/lib/quest/scene.ts`: house spots moved near each zone spawn; verify bridge tiles are separate from `T.WATER` before enabling collision; sync `dayT` from the save on resume.
- `src/lib/quest/house.ts`: `sleep` sets `time_of_day` to 7/24 and emits it to the world scene; interior redraw pass.
- `src/lib/quest/content.ts`: trim Wren's `pages`, expand the Aegis text.
- `src/components/plan/quest.tsx`: shrink objective HUD banner.
- One typecheck and build pass at the end; no browser session.
