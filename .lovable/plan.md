# Quest polish: intro overlap, smaller HUD, better dialogue box, Andrew's demons

## 1. Landmark card no longer collides with the act intro
Right now, entering an act shows the big act banner while the landmark arrival cutscene can fire at the same moment (you spawn close to the act's building), so the "The River Gate Temple" card lands on top of the intro.

- Hold the landmark arrival cutscene until the act intro banner has finished (a short grace window after entering a realm, plus a check that no banner is on screen).
- Queue the landmark info card so it only opens after the banner clears, instead of stacking over it.
- Applies to every act, since all of them use the same arrival trigger.

## 2. Objective tracker 20% smaller
The top-centre panel (act name, objective, counters, Ping Objective) shrinks about 20%: tighter padding, smaller text sizes, a slimmer ping button, and a narrower max width so it stops covering the play area on phones.

## 3. Nicer conversation box (the "Andrew" card)
Rebuild that card into the same cinematic style as the guest dialogue: larger portrait with a soft gold frame, name plus a small role subtitle, typewriter reveal of the italic line, and a clean gold-accented footer with the Continue button — instead of the current plain stacked layout.

## 4. Bosses are Andrew's struggles, and Maria knows it
Each boss gets a short framing line so it is explicit these are Andrew's real inner battles, not random monsters:

- A one-line "what this really is" note shown at the top of the boss dialogue card (for example: doubt, stress, weariness, self-worth) tying it to something Andrew wrestles with.
- A short Maria reaction line before the choices, where she recognises the demon as his and says she is fighting it with him.
- The silent second boss keeps no dialogue; it gets the framing note only via a toast when it appears.

## Technical notes
- `src/lib/quest/scene.ts`: gate `checkCutscene()` on realm-entry time and emit the landmark modal after the banner window.
- `src/components/plan/quest.tsx`: shrink the objective HUD block; rework the `andrew` modal; render new boss framing/Maria line in the boss modal.
- `src/lib/quest/content.ts`: add `demonOf` + `mariaLine` fields to each `BossConfig` (including second bosses) with the new copy.
