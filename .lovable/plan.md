# Cinematic Boss Confrontations + Lighter Environments

## What changes

### 1. Every boss fight becomes a 5-slide confrontation
Right now each boss says one line, Maria says one line, and you pick one reply. That becomes a real scene:

- 5 slides per boss. On each slide the boss speaks, then Maria answers with a choice you pick (3 options each slide).
- The boss reacts to what you chose before moving to the next slide, so the exchange feels like a real argument.
- The tone gets darker and more personal: each boss states plainly that its goal is to break Andrew and destroy the marriage before it starts — through provision fear, pressure, self-doubt, exhaustion, and the long nights of doubt.
- Maria's replies stay in three flavors (defiant / compassionate / faith-anchored), and the mix of choices you make across the 5 slides decides the opening advantage you carry into the fight (stamina, slowed boss, or restored heart).
- The Act IV second boss stays silent by design — no dialogue, it attacks immediately.

### 2. Scary, face-forward boss dialogue UI
- Dark cinematic panel (not the cream glass card) with the boss's own artwork shown large beside its lines, name and title in blood-toned/gold lettering.
- Typewriter text, slide progress dots (1/5 … 5/5), subtle shake/pulse on the boss portrait when it speaks.
- Maria's turn swaps to her portrait with her choices listed below, matching the existing cinematic guest dialogue style.

### 3. Environment: 15% fewer trees and animals in every act
- Tree density in each act reduced by 15% (spacing rules kept, so no clumping).
- Animal counts in Acts I–IV reduced by 15%, keeping at least one of each species so the world still feels alive.

## Technical notes

- `src/lib/quest/content.ts`: extend `BossConfig` with an ordered `slides` array — each slide holds the boss line and 3 `BossReply` options with the boss's answer; keep `boon` per reply and tally the dominant flavor at the end. Rewrite all five boss scripts (Warden of Rushing Water, Stress Spectre, Clamour of Doubt, Weight of Weariness, and the silent Hollow of Doubtful Nights stays silent).
- `src/lib/quest/events.ts`: boss modal payload carries the slide list and boss art key; `EV.bosschoice` is emitted once at the end with the resolved boon id, so scene combat logic is unchanged.
- `src/components/plan/quest.tsx`: new `BossDialogue` component (modeled on `GuestDialogue`) with dark styling and boss portrait imports; replaces the current `GlassPanel` boss branch.
- Boss portraits reuse the existing `src/assets/quest/boss-*.png` art imported into React.
- `src/lib/quest/scene.ts`: scale the tree count and each `spawnAnimals` count by 0.85 (rounded, min 1).

No changes to HP, weapons, save schema, or any non-game part of the app.
