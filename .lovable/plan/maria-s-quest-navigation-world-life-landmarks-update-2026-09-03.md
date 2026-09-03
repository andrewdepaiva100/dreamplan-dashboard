# Maria's Quest — Navigation, World Life & Landmarks Update

Some items in the request are already in the game (verified in the code): sprites are already at 1.1x scale with adjusted hitboxes, speed is already 120, the glassmorphism title screen with How to Play & Story exists, the canvas is already full-screen with fixed HUD overlays, the CONTROLS button exists, art is already bundled locally, and the save table already has the listed columns. Those stay as they are. Below is the new work.

## 1. Walk cycles and Andrew's look

- Maria gets a true alternating-stride cycle: left-lift, neutral, right-lift, neutral per direction, with dress sway, and a clean planted idle pose on stop facing the last direction.
- Andrew becomes a 4-directional animated character (currently a single static image): new up/down/side art with the described look (dark curtain hair, white collar shirt, dark trousers, black wristwatch), same animation treatment.
- Maria's art refreshed to match the description (dark brown hair, white midi dress, tan wedge sandals, glowing red rose bouquet).

## 2. Roads, villages, bridges, animals

- Every act gets a real road network instead of open fields: cobblestone streets in town areas, dirt trails through forest and mountain, wooden plank bridges over every water crossing. Paths connect spawn to each landmark, so there is always a road to follow.
- Village clusters built along those streets: cottages, houses, market stalls, lamps, benches, and garden plazas.
- Ambient wildlife group: cats and dogs near houses, butterflies and birds near flowers and groves, deer and ducks near water and forest edges. Each wanders a small home radius with an idle animation loop and never blocks the player.

## 3. Navigation: live map, fast travel, portals, autopilot

- Live Map overlay replaces the text-only Realm Map: a rendered mini-map of the current region drawn from the actual tile data, with landmark pins and a pulsing gold Maria marker tracking her real coordinates.
- Tapping any unlocked act landmark on the map fast-travels her to it.
- Glowing labeled archway portals ("To Act II: Wedding Garden", etc.) at the edge of each region give instant act transitions; the old key/puzzle gating stays available but is no longer required to progress.
- "Guide Me" button beside the objective tracker: Maria auto-walks a gold petal trail to the current objective, cancelled by any manual input.
- Arriving at a new act's landmark triggers an automatic cutscene: 2-second movement pause, camera zoom onto the building, "ACT N: TITLE" banner, then the intro story modal.

## 4. Flagship landmark buildings

New large multi-tile buildings, one per act, each the focal point and cutscene target: Ancient Stone Temple (Act I), Glass Conservatory Palace (Act II), Marble Town Hall & Clocktower (Act III), Celestial Observatory (Act IV), Grand Cathedral (Act V).

## 5. Map size and color

- Zones grow from 132x102 to 180x180 tiles, framed by tree lines, cliffs and water at the borders.
- The last grey-tile scatter left in Act IV is removed so every region is fully saturated from the first frame.

## 6. Narrative flow per act

Objectives, relics, envelopes and unlock text rewritten to the act-by-act flow described: temple -> grotto -> Lantern of Quiet Care; conservatory -> Stress Spectre -> Anchor of Comfort and Bloom of Reflection; town hall -> Andrew at the fountain -> Missing Melody -> Shield of Unshakable Faith; observatory -> Seal of Perfect Peace plus vault entrance; cathedral cutscene -> processional -> proposal -> golden ring -> fireworks, `wedding_completed` saved, permanent ring badge in the header.

## 7. Memories album, feedback, free roam

- MEMORIES tab in the HUD collecting every relic card, envelope letter and photo moment, re-readable at any time.
- Per-act ambient music generated in-browser (warm guitar-like tones in Act I, piano in Act III, organ swell in Act V) with a mute toggle, plus haptic vibration on interaction modals where the device supports it. No third-party audio files, so nothing can fail to load.
- After Act V, Free Roam: Andrew follows Maria across the map as a companion with the ring active.

## Technical notes

- Files: `src/lib/quest/scene.ts` (map size, roads, villages, animals, portals, fast travel, autopilot, cutscenes, landmarks), `src/lib/quest/textures.ts` (new art registration, Andrew directions, animal frames), `src/lib/quest/content.ts` (act narrative, landmark and portal copy), `src/components/plan/quest.tsx` (Live Map overlay, Guide Me, Memories tab, act banner, audio toggle), `src/lib/quest/events.ts` (map/memories/cutscene payloads), `src/lib/quest/save.ts` unchanged.
- New bundled art generated into `src/assets/quest/`: five landmark buildings, Andrew 4-direction sheets, refreshed Maria sheets, market stall, cat, dog, bird, deer, duck, portal arch. Kept small and optimized like the existing set.
- 180x180 zones are 2.5x the current cell count; tile layers stay runtime-generated with culling on, wildlife and decor are pooled and only updated near the camera.
- Save shape is unchanged; existing saves load and are clamped into the new bounds.
- Verified with typecheck, production build, and a browser run through each act's spawn, portal and fast travel.
