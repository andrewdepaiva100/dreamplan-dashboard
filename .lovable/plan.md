# Maria's Quest — Full-Color World & Real Art Assets

Replace the procedurally drawn, partly-grey world with real bundled artwork, a 100% full-color map from the first frame, animated 4-directional characters, and a warm sunlight glow.

## 1. Full-color world (no grey)

- Remove the grey "Noise of Life" ground tile entirely. Every map fills with lush grass, cobblestone/dirt paths, bright water, marble, hedges, and flower beds — vibrant from load, no desaturation pass.
- Ground variation comes from grass/flower tile variants instead of grey patches, so the world reads rich rather than flat.

## 2. Aura of Peace, re-purposed

- The aura no longer recolors tiles. It becomes a radiant golden light that follows Maria and continuously spawns rose petals and soft sparkles along her path (denser while moving, gentle while idle).
- Enemies stay: the "worry" foes still roam and are still transformed by the Peace Burst — only the visual language changes.
- Story/how-to text updated so the premise no longer mentions turning grey into color.

## 3. Real art assets (bundled, AI-generated)

Cohesive top-down RPG art generated once and bundled into the app (no runtime third-party CDN calls, so nothing can fail to load or clash with the navy/gold theme):

- Terrain tileset: grass variants, flower beds, cobblestone/dirt path, water, marble floor, stone wall, hedge, candle/void.
- Maria: 4-directional walk spritesheet — white dress, dark brown hair.
- Andrew: 4-directional character spritesheet — white shirt, dark trousers.
- Decor sheet: marble fountain, stone archway, rest stone, pressure plate, altar pedestal, envelope, relic, signpost, guide NPC, block, petal, enemy.

All `fillRect` / `fillCircle` / gradient drawing in the texture builder is deleted; Phaser `preload()` loads the bundled images and slices them into tiles/frames.

## 4. Animations & lighting

- `anims.create()` walk cycles for Maria: up, down, left, right, plus idle frames; the movement loop picks the animation from the velocity vector.
- Water and fountain get simple frame animations.
- A warm sunlight overlay (soft gold, additive) sits above the world for a romantic glow, replacing the current dim blue vignette pulse.

## Technical notes

- New assets generated into `src/assets/quest/` as a tileset PNG, two character spritesheets, and a decor atlas; each is uploaded as a CDN asset pointer so the repo stays light.
- `src/lib/quest/textures.ts` is rewritten from a canvas-drawing module into an asset preload + `spritesheet`/`image` registration module, keeping the exported `T`, `TILE`, `SOLID_TILES`, `TILE_COUNT` contract so map code is unaffected.
- `src/lib/quest/scene.ts`: drop `T.GREY` from map generation and the island scatter, remove the aura's tile-recoloring loop, add the petal/sparkle emitter, add `anims.create()` definitions and per-frame direction selection, swap the vignette for the sunlight overlay.
- Enemy transform, relics, envelopes, puzzles, boss phases, ceremony, saves, and HUD logic are untouched.
- Verified with typecheck, production build, and a browser boot of the title screen and Act I.
