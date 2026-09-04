# Maria's Quest — Refinement Pass

Seven refinements to the existing game. Some items are already in place; those are listed as verification only so nothing regresses.

## 1. Radar Ping replaces Guide Me

Remove the autopilot button and its auto-walk logic entirely. In its place, a "Ping Objective" button sits next to the objective tracker. Tapping it plays a soft gold pulse wave rippling outward from Maria and shows a glowing gold compass marker pointing at the current objective for a few seconds. Movement stays fully manual at all times.

## 2. Maria's face and expression

Regenerate Maria's down/up/side sprites and add dedicated dialogue portrait art in a crisp 16/32-bit indie RPG style, with a clearly visible, warm, smiling face. She keeps her long dark brown hair, white midi dress, tan wedge sandals, and glowing red rose bouquet. The portrait shows during guide, boss, and Andrew dialogue.

## 3. Act-specific weapons, no blacksmith

The act guides already award the act weapon on conversation. This pass removes the blacksmith building, the smith NPC, the wooden sword default, and the "find the Blacksmith" messaging, so each act's guide is the only source:

- Act I: Radiant Spark Wand
- Act II: Floral Bow
- Act III: Lightblade
- Act IV: Celestial Stave (renaming the current Starlight Censer)
- Act V: Vow Shield / Peace Blade (renaming the current Ring of Dawn)

Weapons stay permanently in the belt and remain switchable at any time. Existing saves that hold a wooden sword are migrated to the Act I wand.

## 4. Compact live map modal

Scale the map/navigation pop-up to roughly 60–70% of the viewport, centred, with the game softly visible behind it. Fast-travel tap targets and the live player ticker stay unchanged.

## 5. Balanced bosses

Lower boss health so the act's own weapon finishes a fight quickly and satisfyingly, keep the top-of-screen boss health bar, and keep shadow minion summons at a gentle pace.

## 6. Act I size, streets, animals

Shrink Act I to about one-third of the current map footprint for faster pacing (other acts keep their size). Verify the cobblestone streets, dirt trails, wooden bridges, houses, cottages, and market stalls read clearly at the smaller scale, and that wandering cats, dogs, birds, ducks, and butterflies still roam correctly.

## 7. Engine, mute, saves — verification

Confirm the full-viewport canvas with fixed HUD overlays, the title screen (HOW TO PLAY / NEW GAME / CONTINUE from the cloud save), the MEMORIES tab, music muted by default with the speaker toggle in the top-right, and that the save record keeps zone, health, relics, envelopes, vault keys, wedding completion, and weapons.

## Technical notes

- `src/lib/quest/scene.ts`: drop `autopilot` field/update branch and `spawnBlacksmith`/`blacksmith` interaction; add a `pingObjective()` emitting a tween pulse plus a camera-space compass marker; per-zone map dimensions so Act I uses ~60x60 instead of the shared 180x180.
- `src/lib/quest/content.ts`: remove `BLACKSMITH` and `wooden-sword`, rename two weapons, set `DEFAULT_WEAPON` to `spark-wand`, reduce boss `hp` values.
- `src/lib/quest/events.ts` + `quest.tsx`: swap the Guide Me control for the ping button, add portrait rendering in dialogue modals, resize the map modal.
- `src/assets/quest/`: regenerate `maria-down/up/side.png`, add `maria-portrait.png`, delete blacksmith art; register in `textures.ts`.
- `src/lib/quest/save.ts`: migrate legacy `wooden-sword` entries; no schema change.
