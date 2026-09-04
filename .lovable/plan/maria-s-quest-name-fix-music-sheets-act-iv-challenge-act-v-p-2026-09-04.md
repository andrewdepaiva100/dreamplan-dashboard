# Maria's Quest — name fix, music sheets, Act IV challenge, Act V polish

## 1. Pedro says "Maria"
Change Pedro's opening line from "MARI!..." to "MARIA! Are you getting married for REAL for real?!".

## 2. The three music sheets (Act III)
- Rewrite Andrew's explanation so it's clear why they matter: the three pages are the song of their wedding — every page found is a promise that their marriage will be as beautiful and in-tune as the melody they'll dance to. His lines change depending on how many pages are found.
- Move the three pages to genuinely hidden spots (a back alley behind the stalls, tucked behind the town hall, off the road near the eastern trees) instead of sitting on the main road, and remove the tall golden beacons that gave them away. The objective line still tracks progress (x/3) so she isn't lost.
- Andrew only starts walking beside Maria once all three pages are recovered — the companion no longer appears in Act III before that.

## 3. Act IV — much livelier and harder
- Turning each crystal pillar gold now summons a mini boss with 1000 HP right beside that pillar: a distinct crystal-shard guardian with its own colour per pillar, a slow chase, and ranged shots. No dialogue — it just appears and fights. The pillar only stays gold once its guardian is defeated.
- After the act's main boss is defeated, a short message warns that something far worse is stirring, then a final Act IV boss spawns with 12000 HP, larger, with a heavier attack pattern.
- Fix the popup interruption: the Observatory (landmark) cutscene and any other landmark cutscene will no longer trigger while a boss fight or boss dialogue is active — it waits until the fight is over.

## 4. Act V — always daytime, no house
- Act V is locked to full daylight (no night veil, no lamp-glow dimming, clock reads midday) since it's the wedding day.
- Maria's cottage is not placed in Act V.

## 5. Aisle runner colour
Repaint the centre aisle runner and side aisles in the cathedral with a light white/beige floor instead of the dark purple candle tile, so the nave reads clean and bright.

## 6. Distinct music per act
Each act gets its own clearly different theme instead of five variations of the same tune: Act I a bright open seaside melody, Act II a light waltz, Act III a warm folky town tune, Act IV a slow airy night-sky theme with sparse high notes, Act V a solemn organ-like processional. Tempo, tone and octave differ per act so they're instantly recognisable. Battle and home music stay as they are.

## Technical notes
- `src/lib/quest/content.ts`: Pedro line, Andrew's music-sheet dialogue text.
- `src/lib/quest/scene.ts`: sheet placement/beacons, companion gate in `spawnCompanion`, pillar mini-boss spawning + second Act IV boss in `buildAct4`/boss defeat handling, `checkCutscene` guard against active boss, Act V build using a light tile for the runner, `houseSpot` returning null for `cathedral`, day/night forced for `cathedral`.
- `src/components/plan/quest.tsx`: per-act melody, tempo and tone in the music hook.
- No database or schema changes.
