# Maria's Quest — Night, Home, Food & Battle Music

A big update to the game: the world now has day and night, Maria gets a cozy home in every act, animals drop food you can cook, hits show damage numbers, bosses throw ranged attacks, and the music swells when a boss appears.

## 1. Day and night (5-minute cycle)
- A full day runs about 5 minutes: warm morning, bright noon, golden dusk, deep blue night, repeating.
- Lamps, torches and windows glow at night with a soft pool of light around them; a gentle moonlight tint covers everything else.
- At night monsters move a bit slower and give off a faint eerie glow so they stay easy to see.
- The clock keeps running while you explore and is remembered in your save.

## 2. Compact inventory
- Replaces the current list-style panel with a tidy grid of square slots (Minecraft-style): item picture, small count number, tap a slot for details.
- Tabs/rows separate weapons, food and keepsakes so nothing feels bulky.
- Opens from the existing small pack button; closes with one tap.

## 3. Animals, food and cooking
- Every animal has exactly 50 health and can be defeated; only animals drop food (raw meat, plus occasional berries).
- Raw food restores a little health; cooked food restores much more.
- Food is stored in the inventory grid and eaten from there.

## 4. Damage numbers
- Every hit on a monster or boss pops a white number at the point of impact that floats up and fades.

## 5. Boss changes
- All boss dialogue rewritten shorter and punchier — fewer, tighter lines, less brooding.
- Every boss's health goes up 30%.
- Every boss can now fire projectiles at Maria between melee phases; they can be dodged or blocked with the shield.
- Regular monster spawns reduced by 20% everywhere.

## 6. Maria's house (in every act)
- A cottage sits naturally in the landscape of each act, with a lit path and garden around it.
- Standing at the door and pressing E (or the on-screen prompt) takes Maria inside through a smooth fade.
- Inside is a warm, candle-lit sanctuary where no enemies can follow, containing:
  - a storage chest sharing the same grid inventory, for stashing food and items;
  - a hearth for cooking raw meat into cooked food;
  - a bed to rest — restores all health and skips to the next morning.
- Leaving by the door returns Maria to the exact spot outside.

## 7. Map polish
- Cleaner ground blending, tidier paths and fences, better spacing of props so acts read as designed places rather than scattered objects.
- The house, garden and lamps are placed to fit the terrain in each act.

## 8. Music
- Built-in generated music (no downloads): a distinct calm theme per act that layers up as you explore.
- When a boss confrontation starts, the music crossfades into a tense, driving battle track, then settles back after the fight.
- The existing mute button controls all of it.

## Technical notes
- `src/lib/quest/scene.ts`: new time-of-day controller (tint overlay + light sprites with additive blend), night monster speed/glow modifiers, animal HP/health bars and loot drops, floating damage-number helper, boss projectile group + collision with player, spawn-count multiplier 0.8, house placement per zone with a door interactable, and an interior sub-scene (`QuestHouseScene`) handling chest/hearth/bed.
- `src/lib/quest/content.ts`: shortened boss dialogue slides, boss `hp * 1.3`, new `projectile` config per boss, `FOOD_ITEMS` table, house copy.
- `src/lib/quest/save.ts`: new fields `time_of_day`, `inventory` (slot array with counts), `chest` (per-save shared storage); migration defaults keep existing saves working.
- `src/components/plan/quest.tsx`: new compact grid `InventoryPanel` + chest/hearth/bed modals; replace `useActMusic` with a layered `useQuestMusic` hook supporting an explore↔battle crossfade driven by a new `EV.music` event.
- `src/lib/quest/textures.ts`: register new art (cottage exterior/interior floor and walls, chest, hearth, bed, raw/cooked meat, berries, torch glow, projectile orb).
- New generated pixel art assets under `src/assets/quest/`.
- Verify with typecheck, production build, and browser screenshots of day, night, house interior and a boss fight.

## Out of scope
- No changes to the finance dashboard, calendar, devotionals or notifications.
- The 3D beta stays as-is; this work targets the main 2D game.
