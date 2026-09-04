# Maria's Quest: harder bosses, legendary weapons, family names, prettier grass

## 1. Every boss 30% harder
Raise HP for all act bosses and the silent second boss by ~30% (6→8, 7→9, 16→21, 5→7; Act IV second boss 6→8), and increase their move/attack pacing slightly so the extra health doesn't just feel slower. Minion waves stay as they are so fights stay fair on mobile.

## 2. Three overpowered weapons hidden in the world
Three legendary pickups, one each in Acts I, III and IV, found by walking up and pressing E (gold beacon so they're easy to spot). They join the permanent weapon list and can be switched at any time like the others:

- Ring of Eternal Vow — highest damage, long reach
- Seraph's Edge — very fast, wide sweep
- Crown of the Golden Ring — massive damage, huge reach

They are strong on purpose so the harder bosses stay fun.

## 3. Family names and dialogue
Rename Act V family NPCs to exactly: `Dad (Marcos)`, `Mom (Raquel)`, `Mom (Silvia)`, `Dad (Gustavo)`. Remove the "mija" line from Silvia's dialogue and replace it with a warm line without that word.

## 4. Four new friends in Act V
Add Andre, Phillip, Italo and Gabe as guests in the Cathedral act, each with their own short excited-for-the-wedding dialogue and their own pixel portraits:
- Phillip: blonde, fair skin
- Andre: fair skin, black hair
- Gabe: fair skin, black hair
- Italo: tan skin, brown hair

They get the same cinematic portrait dialogue box the other guests use.

## 5. Grass and flowers in the opening area
The patchy two-tone checkerboard in Act I becomes one clean, even meadow green across the whole realm. Scattered flower sprites are reduced by 25% (240 → 180 in Act I, and proportionally in the other acts) and restricted to purple, red, white and pink only.

## Technical notes
- `src/lib/quest/content.ts`: boss HP values, three new `WEAPONS` entries + pickup definitions, `FAMILY_GUESTS` names/lines, new Act V guest records.
- `src/lib/quest/scene.ts`: `makeMap` stops sprinkling `T.BLOOM` (uniform `T.MEADOW`), flower counts reduced 25%, `flowerTints` limited to purple/red/white/pink, new legendary weapon pickup interactables with beacons, boss speed tuning.
- `src/lib/quest/textures.ts`: register the four new guest sprites and legendary weapon icons.
- New generated pixel art for Andre, Phillip, Italo, Gabe (sprites + dialogue portraits) in `src/assets/quest/`.
- Save schema already stores `weapons[]`, so the new weapons persist with no migration.
