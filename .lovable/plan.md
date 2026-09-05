# Fix the music + rebuild the inside of Maria's house

## 1. Music never plays

The game starts muted: the sound state begins as "off", so unless a player finds the speaker button in the corner, there is silence the whole time. There is also a second problem — the sound engine gets shut down once during startup and is never rebuilt, so even flipping the speaker on can stay silent.

Fixes:
- Start with sound **on**, and wake the audio engine on the first tap/click or key press (browsers block sound until the player interacts, so this is what makes it actually play).
- Rebuild the audio engine if it was previously torn down, instead of reusing a dead one.
- Keep the speaker button working as a mute/unmute toggle, and remember the choice so a player who mutes stays muted next visit.

## 2. A properly textured interior

Right now the room is drawn as flat coloured rectangles. It gets rebuilt as a tiled, textured room in the same pixel-art style as the rest of the game — all art generated inside the game (no downloads, no licensing), then tiled and layered so it reads like a real tile pack:

- **Floor**: a repeating wooden floorboard tile with grain, knots, nail heads and darker seams, tiled across the room, plus a subtle worn path and shading near the walls.
- **Walls**: a repeating stone-block tile for the lower wall with mortar and chipped edges, warm plaster above it, timber beams, a carved wood picture rail and skirting.
- **Furniture as rendered pieces** (replacing the current flat shapes):
  - Bed with a carved headboard, quilt with stitched pattern, pillow and shadow.
  - Chest in dark wood with iron bands, corner studs and a brass lock.
  - Hearth as a stone fireplace with mantel, hanging kettle, log pile and animated flame.
  - Bookshelf, rug, potted plant, wall frames and a small table redrawn with the same tile-pack shading.
- **Lighting pass**: warm firelight falling across the boards, window light pools, soft corner shadow — tuned so the room looks lit rather than dim.

Everything keeps its current position and interaction (chest, hearth, bed, door), so nothing about how the room plays changes.

## Technical notes

- Music: `useActMusic` and the mute state in `src/components/plan/quest.tsx` — default `muted` to `false` (persisted in localStorage), recreate the `AudioContext` when `state === "closed"`, and resume it on the first user gesture instead of relying only on the effect's `resume()`.
- Interior: new tile textures in `src/lib/quest/textures.ts` (`floor-wood`, `wall-stone`, `wall-plaster`) drawn on canvas and rendered with `add.tileSprite` in `src/lib/quest/house.ts`; furniture textures (`bed`, `chest`, `hearth`, plus new `bookshelf`, `rug`, `table`) redrawn at higher detail with shading, outline and highlight passes. No changes to `spots`, collision bounds or the item/modal flow.
