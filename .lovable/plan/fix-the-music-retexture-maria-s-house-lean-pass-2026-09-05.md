# Fix the music + retexture Maria's house (lean pass)

Kept deliberately small — two focused edits, no reworking of how the room plays.

## 1. Music never plays

The game starts muted, so unless a player finds the speaker button there is silence. The sound engine can also be torn down during startup and never rebuilt, so even unmuting can stay quiet.

- Start with sound on, and wake the audio engine on the first tap or key press.
- Rebuild the engine if it was previously shut down.
- Speaker button still toggles mute, and the choice is remembered.

## 2. Textured interior

The room is currently flat coloured rectangles. It gets a texture pass in the same pixel-art style, all generated in-game (no downloads):

- Repeating wooden floorboard tile with grain, knots and seams across the floor.
- Repeating stone-block tile for the lower wall with mortar lines, warm plaster above, timber beams and skirting.
- Bed, chest and hearth redrawn with real shading — carved headboard and quilt, iron-banded chest with brass lock, stone fireplace with mantel and flame.
- Existing rug, bookshelf, plant, frames and lighting kept, lightly warmed so the room reads lit rather than dim.

Positions and interactions (chest, hearth, bed, door) stay exactly as they are.

## Technical notes

- `src/components/plan/quest.tsx`: default `muted` to `false` (persisted), recreate the `AudioContext` when its state is `closed`, resume on first user gesture.
- `src/lib/quest/textures.ts`: add `floor-wood` and `wall-stone` tiles; redraw `bed`, `chest`, `hearth` with more detail.
- `src/lib/quest/house.ts`: render the two new tiles with `add.tileSprite` in place of the flat floor/wall graphics. No changes to `spots`, collision bounds or the modal/item flow.
