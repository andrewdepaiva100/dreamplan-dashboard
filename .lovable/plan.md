# Act I Simplification, Wedding-Hype Characters & Distinct Act IV Bosses

## 1. Act I — remove the River Gates side quest
Strip out the block-pushing puzzle so the start is a simple straight shot into the story.

- Delete the 3 pressure plates, 3 pushable blocks, their physics group/colliders, and the repeating check timer (`gatesOpen`).
- Delete `openRiverGates()` and its call.
- The grotto entrance is open from the start (paint that wall gap as floor in `buildAct1()`), so the road runs spawn → bridge → grotto with nothing in the way.
- The Lantern of Quiet Care and the Act II gateway spawn on the normal boss flow (beat boss → relic → portal), no puzzle gate.
- Simplify the starting objective text: "Follow the road east, cross the bridge, and face what waits in the grotto."
- Everything else stays: village, decor, animals, Bram the smith, Max, envelope, rest stone, boss.

## 2. One excited wedding guest per act
Add a friendly, non-combat NPC in each act, standing near the main path (easy to bump into). Talking to them opens a dialogue modal — their whole personality is being thrilled about the wedding. Each has their own written lines (2–3 beats, tap to continue), all distinct in voice.

| Act | Character | Look |
| --- | --- | --- |
| I — Sunlit Shores | Lorena | Brown-skinned young woman, warm bright outfit |
| II — Wedding Garden | Alicia | Tan-skinned young woman, floral dress |
| III — The Haven | Pedro | Tan-skinned boy, Maria's little brother, playful |
| IV — Starry Ascent | Gianluca | Tan-skinned young man, relaxed and hyped |

New sprite art is generated for each and registered as quest textures.

## 3. Act V — the four parents, all together
In the church, add a group of four seated/standing near the front, each interactable with their own separate excited dialogue:

- **Raquel** — Andrew's mom, white
- **Marcos** — Andrew's dad, tan
- **Silvia** — Maria's mom, tan
- **Gustavo** — Maria's dad, tan

Each gets its own sprite and its own dialogue (mom-crying-happy, proud-dad, etc.), independent of the ceremony flow. The ceremony with Father Elias still runs exactly as it does now.

## 4. Act IV — make the two bosses physically different
- The first boss (The Weight of Waiting) and the second (The Hollow of Doubtful Nights) currently share the same look family. Give the second boss its own distinct artwork — different silhouette, color, and scale — so they read as two different enemies on screen.
- Remove the second boss's dialogue entirely: no intro, no taunt card, no reply choices. It spawns and immediately fights.

## Technical notes
- Files touched: `src/lib/quest/scene.ts` (puzzle removal, NPC spawns, boss spawn path), `src/lib/quest/content.ts` (NPC dialogue data, second-boss config), `src/lib/quest/textures.ts` (new sprite registrations), `src/components/plan/quest.tsx` (NPC dialogue modal), plus new art under `src/assets/quest/`.
- NPC dialogue reuses the existing interactable + modal pattern (same as the guide/signpost), so it pauses and resumes the scene correctly.
- Second boss keeps its HP/behavior but skips the dormant dialogue phase and enters combat directly.

## Verification
Typecheck + build; confirm no dangling `blocks`/`plates`/`gatesOpen` references remain.
