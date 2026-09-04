# Andrew's reach, Andressa's face, and a prettier Act IV

## 1. Andrew's sword hits from further away

Andrew currently only strikes things almost touching him. His swing range grows
by roughly 50% so he helps in a fight instead of trailing behind:

- enemies: hit distance 74 -> 112
- boss: hit distance 96 -> 145
- the blade sits slightly further out from his hand so the longer reach reads visually

Damage stays exactly as it is (half of Maria's).

## 2. Andressa gets a face in conversation

Every other wedding guest shows a painted portrait when you talk to them;
Andressa has none. A new portrait is generated in the same painted style as the
others (light tan skin, brown hair, green eyes, warm smile, wedding attire) and
wired into the portrait list so it appears whenever her dialogue opens.

## 3. Act IV becomes beautiful

Act IV is a bare marble plateau. It gets a night-sky garden treatment while
keeping the same open, easy-to-walk floor and the same puzzle:

- a constellation-patterned court: bloom-and-marble ring around the center,
  star-point inlays along both roads instead of plain slabs
- reflecting pools at the plateau edges with soft glow, placed clear of paths
- floating star lanterns and slow drifting light motes across the sky
- crystal shards and star-flowers dotted around the three pillars, so each
  pillar reads as a shrine rather than a lone post
- richer aura on the pillars: blue pulse, gold shimmer once turned, rose bloom
- a soft aurora wash over the upper sky and a gentle vignette
- when the staircase forms, a burst of rising star particles along it

No changes to enemies, guardians, boss HP, or the puzzle rules.

## Technical notes

- `src/lib/quest/scene.ts`: `updateAlly` distances and blade offset; `buildAct4`
  tile decoration, decor sprites, particle emitters, pillar aura tweens;
  `openStaircase` particle flourish.
- New `src/assets/quest/portrait-andressa.jpg`, imported and added to
  `GUEST_PORTRAITS` in `src/components/plan/quest.tsx`.
- Reuses existing sprites (lamp, flowers, petal, key/relic glow) where possible
  to keep this cheap; no new tile art.
