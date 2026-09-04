# Fix the Conservatory door + a beautiful pixel-art opening screen

## 1. You can't reach the Conservatory door

The Grand Conservatory building sits just above the round door in Act II. The building has an invisible "footprint" barrier at its base, and that barrier currently extends down over the exact tile where the door sits — so Maria physically stops before she can ever get close enough for the E prompt to appear.

Fixes:
- Shrink the Conservatory's base barrier so it stops at the building's own footprint and no longer covers the doorway tile.
- Move the door a bit further down onto the open marble plaza, clear of the building.
- Give the door a generous interaction radius (same reach as the love letters) so the E prompt appears as soon as Maria is on the plaza in front of it.
- Also widen the marble approach in front of the door so nothing pinches the walk-up.

## 2. A much nicer opening screen

Replace the plain glass card with a cinematic title screen:
- A new pixel-art portrait of Andrew & Maria together (generated in a warm 16-bit RPG style, matching the game's art), shown in a gold-framed panel above the title.
- Soft gold vignette + starfield behind it, a subtle glow/float animation on the portrait, and the existing drifting particles kept.
- Title typography refined: "A GIFT FOR MARIA" eyebrow, large "Maria's Quest", rose-gold italic subtitle, then the buttons in a tighter, more polished stack (New Game / Continue / How to Play & Story / Back to Dashboard).
- Buttons get gold-glow hover/press states and larger tap targets for phone.

## 3. Serious, threatening boss dialogues

Rewrite every boss conversation in `src/lib/quest/content.ts` (all four act bosses + the second Act IV boss) so they read like a real threat, not a quippy fairy-tale:
- Intros become cold and menacing — the bosses promise real consequences (drowning doubt, unravelling the wedding, breaking her resolve) instead of playful teasing.
- Maria's three replies stay meaningful (bold / gentle / faith) but lose the jokey punchlines; the boss answers concede ground darkly rather than with humor.
- Taunts shown when the fight starts get the same treatment.
- No changes to mechanics: HP, boons (stamina / slow / heart), and dialogue flow stay identical — only the writing changes.

## Technical notes

- `src/lib/quest/scene.ts`: reduce the landmark static-body height/offset in `addLandmark`, reposition the `conservatory` interactable and pass a larger `radius`, extend the marble plaza rect in `buildAct2`.
- New asset `src/assets/quest/title-couple.png` generated as pixel art; imported into the title screen in `src/components/plan/quest.tsx`.
- `src/lib/quest/content.ts`: text-only rewrite of `ACT_BOSSES` and `SECOND_BOSSES` dialogue.
- Title screen markup/styles only — no gameplay or save-schema changes.
