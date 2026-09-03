# Maria's Quest — 6 Upgrades

## 1. Glassmorphism title screen
Rebuild the title view in the quest component: frosted glass card (blurred translucent panel, rose-gold gradient border and glow), romantic serif display type for "Maria's Quest", and a lightweight animated background canvas behind it with drifting gold light motes and slowly falling rose petals. Buttons (New Game, Continue, How to Play & Story, Back to Dashboard) restyled as soft glass pills. Rose-gold tones added as tokens in the stylesheet rather than hardcoded colors.

## 2. "How to Play & Story" modal
New prominent button on the title screen opening a glass overlay with two blocks:
- Story: the Bringer of Peace premise (transform the grey noise into bloom, collect 5 Relics of Devotion, find hidden love notes, reach the Grand Cathedral).
- Controls: joystick / WASD movement, Peace Burst (non-violent transformation), Dash.
Closes back to the title screen; no game state touched.

## 3. Crisp HD rendering
Switch the Phaser config to `pixelArt: false`, `antialias: true`, `roundPixels: true`, and render at device pixel ratio. Regenerate the procedural art at higher internal resolution (larger canvas textures, smooth curves/gradients instead of hard 1px blocks) for Maria, Andrew, enemies, relics, props and tiles, then downscale in-game so edges stay smooth. Camera zoom reduced accordingly, plus a soft ambient light/vignette overlay.

## 4. 3x world map
Map grid grows from 44x34 to 132x102 tiles per zone. All zone layouts are currently written with hardcoded tile coordinates, so each zone gets rebuilt against the larger grid: longer winding trails, wider grottoes, a bigger labyrinth, an expanded town square, and roomier boss arenas. Landmark/object placements are repositioned to the new landmarks, and enemy counts and camera bounds scale with the area.

## 5. Realm Guide + signpost at spawn
Add a Guide NPC sprite and an illuminated signpost right next to Maria's Act I spawn. Interacting with either opens a Realm Map modal listing all five landmarks with their directions:
West — River Gates & Sunken Grotto (Act I); North — Labyrinth of the Wedding Garden (Act II); Center — Haven Town Square & Fountain (Act III); East — Starry Ascent Mountain (Act IV); Summit — Grand Cathedral of Serenity (Act V).
The modal is reopenable any time by returning to the guide.

## 6. Movement speed
Base player speed drops from 165 to 120 units. Dash multiplier, enemy speeds and stamina drain stay tuned so the slower pace still feels responsive.

## Technical notes
- Files: `src/components/plan/quest.tsx` (title, modals, guide map UI), `src/lib/quest/scene.ts` (map size, layouts, guide NPC, speed, renderer config), `src/lib/quest/textures.ts` (HD art), `src/lib/quest/content.ts` (story/controls/realm-map copy), `src/styles.css` (rose-gold tokens).
- Saves stay compatible: the save shape is unchanged; only spawn coordinates move, so existing saves are clamped into the new bounds on load.
- Larger maps use culling and pooled objects already in place; tile data stays generated at runtime so no asset size cost.
