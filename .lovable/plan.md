# Maria's Quest: portals, hand-held weapons, shield and heart pickups

## 1. Portals that actually work

The portal currently only reacts to the interact button and only appears in a few
scripted spots, and travel between acts routes through several different code paths.
The exact reason a given portal does nothing is not yet confirmed, so the first step is
to reproduce it in the running game (start Act I, clear the act, walk to the portal) and
capture what happens.

Then:
- Walking into a portal triggers it — no button press needed — with the interact
  button kept as a backup.
- Every act guarantees exactly one portal once its act goal is done, placed on open
  walkable ground near the act landmark, with a floating "Enter" label.
- Entering a portal permanently unlocks the next realm so the map's fast travel
  matches where she has actually been.

## 2. Take the roses out of Maria's hands

Regenerate Maria's three walk sheets (down / side / up) with the same look — dark
brown hair, white midi dress, tan wedge sandals — but with empty hands, and swap the
new art in. Frame sizes and animations stay unchanged.

## 3. Show the equipped weapon in her hand

A small weapon sprite is attached to Maria and drawn in her hand, positioned and
flipped per facing direction (behind her when walking up, in front otherwise). It
changes art the moment a new weapon is equipped, hides when she has none, and sweeps
with the attack animation. Each of the six weapons (wooden sword through the final act
weapon) gets its own small in-hand image.

## 4. Signpost and Realm Guide stop doing the same thing

Right now both open the realm map. The signpost instead shows a short written
directions panel — current act, current objective, and which way the landmark and
portal lie. The Realm Guide keeps the map.

## 5. The very special shield from the guide

The Act I guide hands Maria the Shield of Unshakable Faith as a special gift alongside
her weapon. It sits in her HUD, and when she drops to one heart it can be triggered —
a golden ring pushes back everything nearby and briefly protects her, then recharges.
A HUD badge shows whether the shield is ready or recharging.

## 6. Hearts scattered around every map

- Small hearts: restore one heart. Roughly 10-14 per act, placed on walkable ground
  along trails, in villages and near landmarks.
- Golden hearts: restore full health. 2-3 per act, tucked in harder-to-reach corners.
- Both are picked up by walking over them, with a sparkle, chime-free pop and a toast.
- Collected hearts respawn when the act is re-entered, so she is never stranded at
  low health.

## 7. Distinct boss designs with a pre-fight conversation

Each act's boss gets its own custom artwork and personality instead of a shared
silhouette — for example a shadowed Doubt-wraith on the shores, a thorn-crowned
garden warden, a hollow house-spirit in the Haven, a star-eater on the ascent, and a
veiled figure at the cathedral. Each gets an idle animation, a colored aura and its
own attack pattern flavour.

Before every boss fight, a conversation panel opens: the boss speaks its taunt, then
Maria picks one of three replies (for example bold, gentle, or faith-filled). The
choice sets the fight's opening tone — a small starting advantage such as extra
stamina, a slower boss, or a heart restored — and the boss answers back before combat
begins. Choices are remembered for the ending recap.

## Technical notes

- `src/lib/quest/scene.ts`: portal overlap trigger + single guaranteed portal per act,
  unlocked-zone bookkeeping on `advanceZone`, split `signpost` from `guide` in
  `interact()`, weapon-in-hand sprite synced in `update()` and the attack tween,
  a pooled `pickups` physics group with heart/golden-heart overlap handlers, and
  shield grant moved to the Act I guide.
- `src/lib/quest/content.ts`: signpost directions text, shield copy, per-act heart
  spawn point lists.
- `src/lib/quest/textures.ts`: register the regenerated Maria sheets and the six
  in-hand weapon images.
- `src/lib/quest/events.ts` / `src/components/plan/quest.tsx`: HUD gains a shield
  ready/recharging badge; existing weapon belt unchanged.
- Saves keep the existing `maria_quest_saves` columns; the shield remains a relic id,
  so no database change is needed.
- Verified after the change by running the game in a browser: clear Act I, walk into
  the portal, confirm Act II loads, confirm hearts heal and the sword renders in hand.
