# Maria's Quest — Smaller Act II & Seasonal Key Finder

Act II (Wedding Garden) is currently a full 180x180 map with the four seasonal keys scattered at its far corners, which makes the key hunt a slog. This plan shrinks the realm and adds clear ways to find the keys.

## 1. Shrink Act II

- Act II drops from 180x180 to about 100x100 tiles (between Act I's compact 62 and the later acts' 180).
- Everything in `buildAct2()` is repositioned proportionally: conservatory, fountain plaza, benches/flowers, animals, rest stone, hedge secret, portal — and the four seasonal keys move to the four quadrants of the smaller map so each is a short walk from the center instead of a cross-map trek.

## 2. Finding the four keys

- **Seasonal beacons**: each unfound key gets a tall glowing pillar of light (spring green, summer gold, autumn amber, winter blue) with a soft sparkle loop, visible from far across the map. The beacon vanishes when that key is taken.
- **Smarter Ping**: while seasonal keys remain in Act II, the Radar Ping compass points to the *nearest unfound key* (before relics) and the toast says how many remain, e.g. "Compass seeks the Spring key — 3 of 4 remain."
- **Live Map pins**: unfound seasonal keys appear as gold pins on the compact live map, alongside the existing landmark/guide pins.
- **Objective tracker**: the HUD objective already reads "The Seasons Tile Lock — n/4 seasonal keys" and stays accurate as keys are collected.

## Technical notes

- Files: `src/lib/quest/scene.ts` (Act II dimensions, key spots, beacon sprites, ping/objective-target priority, map snapshot pins). No save-shape changes; existing saves clamp into the new bounds.
- Verified with typecheck, production build, and a browser run entering Act II, pinging, and collecting all four keys.
