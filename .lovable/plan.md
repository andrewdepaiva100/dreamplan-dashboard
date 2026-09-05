# Mobile stick, tougher bosses, hidden legendaries, richer house, bolder music

A small polish pass on Maria's Quest, kept tight on credits.

## Controls
- Make the on-screen joystick 15% larger (pad and knob), with the same drag feel and dead zone.

## Bosses
- Raise every boss's health by 20% — the five act bosses and the Act IV second boss. The silent pillar guardians stay as they are.

## Hidden legendary weapons
- The three legendary pickups (Ring of Eternal Vow, Seraph's Edge, Crown of the Golden Ring) move to out-of-the-way corners of their acts, tucked behind trees/rocks/water edges rather than on open ground.
- Remove their glowing beacon markers and shrink their sprite/glow so they no longer advertise themselves; the pick-up prompt only appears when Maria is right on top of them.

## Maria's house art
- Replace the flat house image with a procedurally drawn pixel-art house texture: warm wood-plank siding with grain, a stone-tile roof with shading, a chimney, and windows that glow warm at night. Keeps the pink tint and current size, drawn in the same canvas pipeline as the rest of the world art so it matches the game's look.

## Music
- Overall music volume up 10%.
- Boss music reworked to be scarier and more dramatic: lower, heavier bass drone, dissonant minor motif, a pulsing drum-like hit on the beat, and a rising tension line as the fight goes on.

## Technical notes
- `src/components/plan/quest.tsx`: joystick sizing; music gain and battle-mode voice in `useActMusic`.
- `src/lib/quest/content.ts`: boss `hp` values ×1.2; new coordinates for `LEGENDARY_PICKUPS`.
- `src/lib/quest/scene.ts`: `spawnLegendaries` — drop `addKeyBeacon`, reduce scale/tint and interaction radius.
- `src/lib/quest/textures.ts`: draw a `house` texture procedurally instead of the imported PNG.
