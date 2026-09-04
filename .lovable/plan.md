# Maria's Quest — Guides, Weapons, Boss Fights & Map Polish

Already in the game (verified in the code): 1.1x sprites with matched hitboxes, speed 120, roads/villages/bridges/wandering animals, portals, fast travel, "Guide Me" autopilot, act-arrival cutscenes with banner, the five flagship landmark buildings, glassmorphism title screen with HOW TO PLAY / NEW GAME / CONTINUE, full-screen canvas with fixed HUD, mute toggle in the HUD, the 5-act narrative through the ceremony and Free Roam with Andrew, and the `maria_quest_saves` schema with all listed columns. Those stay as they are. Below is the new work.

## 1. Compact pop-up Live Map

The map overlay shrinks from full-screen to a centered glass panel at roughly 65% of viewport width and height (with sensible min/max sizes so it stays usable on phone and desktop). The background stays visible and softly blurred behind it. The rendered mini-map, landmark pins, fast-travel taps and the pulsing gold Maria ticker all keep working at the smaller size, with the pin hit areas kept finger-friendly.

## 2. Attack button, blacksmith, guides and permanent weapons

The PEACE button is gone. In its place is a single ATTACK button (same position, same keys) that swings whatever weapon Maria currently holds — a short arc swing with a light trail, hit spark and knockback.

At the very start of Act I, a large Blacksmith building sits beside the spawn with a blacksmith NPC outside. Talking to him hands Maria the **Wooden Sword**, her default weapon, so she is armed before the first enemy.

Each act then gets its own friendly guide NPC near the act's spawn, with a distinct name and look. Talking to them explains the act's goal in plain terms and awards a stronger permanent weapon:

- Act I — Radiant Spark Wand
- Act II — Floral Bow
- Act III — Lightblade
- Act IV — Starlight Censer
- Act V — Ring of Dawn

Weapons collect into an inventory shown in the HUD (small icon row) and in the Memories album; tapping an icon equips it. The newest weapon auto-equips, and each has its own swing art, reach and damage (wooden sword weakest, later weapons noticeably stronger). Owned weapons and the equipped one persist in the save.


## 3. Balanced boss fight per act

Every act ends in an approachable boss encounter instead of an item puzzle:

- A boss health bar pinned to the top of the screen with the boss name and a smooth depleting fill.
- The boss drifts toward Maria on a slow pattern and periodically summons a few weak shadow/stress minions that dissolve into petals when hit.
- Tuned easy: Maria's current weapon deals heavy damage, so a boss goes down in a handful of swings; contact damage is light and there are heart pickups in the arena.
- On defeat: petal burst, the act's relic drops, the act completes and the next portal opens. The old puzzle objects stay in the world as optional flavour but are no longer required.

## 4. Smaller Act I map

Act I (Sunlit Shores) plays on a compact region about one third of the current area, with camera and world bounds, spawn, roads, village, landmark temple and enemy counts all re-fitted to the smaller footprint so the guide and temple are seconds away from spawn. Other acts keep their current size.

## 5. Audio off by default

Background music starts muted; the speaker toggle in the top-right HUD turns it on. The choice is remembered for the session.

## Technical notes

- `src/lib/quest/scene.ts`: per-zone map dimensions (Act I ~1/3 area) replacing the single global size, act guide NPCs with dialogue, weapon award events, weapon-scaled Peace Burst, per-act boss definitions with health, minion summon timer and arena setup, boss HP broadcast on the HUD event.
- `src/lib/quest/content.ts`: guide names/dialogue per act, weapon definitions (name, blurb, icon), boss names and objective copy.
- `src/components/plan/quest.tsx`: compact centered map modal, boss health bar overlay, inventory strip, weapon-received modal, mute defaulting to on.
- `src/lib/quest/events.ts`: boss HP and weapon payload types.
- `src/lib/quest/save.ts` + `maria_quest_saves`: weapons stored inside the existing jsonb state; no schema change needed.
- New bundled art in `src/assets/quest/` for the four extra guides, five weapon icons, and a minion sprite, generated in the same style as the current set.
- Verified with typecheck, production build and a live browser run through Act I's guide, weapon award and boss fight.
