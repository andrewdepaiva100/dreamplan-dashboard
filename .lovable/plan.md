# Act I — Remove the River Gates Puzzle, Straight Path Through

## Goal
Strip out the block-pushing "River Gates" side quest at the start of the game so Act I is a simple walk: talk to the guide, cross the bridge, beat the boss, take the Lantern, walk through the portal to Act II.

## Changes (`src/lib/quest/scene.ts`)

1. **Remove the puzzle entirely**
   - Delete the 3 pressure plates, the 3 pushable blocks, their physics group/colliders, and the repeating timer that checks block positions (`gatesOpen` logic).
   - Delete the `openRiverGates()` method and its call.

2. **Open the grotto from the start**
   - The grotto wall gap that the puzzle used to open is now open by default — paint it as marble/path in `buildAct1()` so nothing blocks the road.
   - The main road already runs spawn → river bridge → grotto temple; keep it as the obvious straight route.

3. **Relic + gateway spawn immediately**
   - The Lantern of Quiet Care interactable (at the grotto temple, 108,28) spawns right away instead of waiting for the puzzle — still only after the Act I boss is defeated (boss stands there until beaten, then the relic appears, then the gateway to Act II at the same spot).
   - Update the starting objective text to something simple like "Follow the road east, cross the bridge, and face what waits in the grotto."

4. **Keep everything else** — village, decor, animals, blacksmith (Bram), Max the dog, waterfall envelope, rest stone, and boss fight all stay untouched.

## Result
Act I completion path: spawn → follow road → boss → lantern → portal. No side-quest gate, no pushing blocks.

## Verification
- Typecheck + build pass.
- Confirm no dangling references to `blocks`, `plates`, or `gatesOpen` remain.
