# Maria's Quest — bosses, relics, death & world polish

## 1. Boss names stay mysterious
Every boss currently announces whose fear it is ("Andrew's fear of not providing", "the tiredness Andrew hides"). All five bosses get generic, ominous wording instead — e.g. "A fear that walks" / "This is fear." No name attached.

## 2. Envelope #1 needs real water
The first love letter says it was hidden behind the water, but there is no water where it sits. A small pond/waterfall pool with rocks is added right beside that envelope in Act I, so the letter matches the place.

## 3. Alicia's line
Replaced with a warmer, less throwaway line from a lifelong friend.

## 4. Bram the Smith becomes worth visiting
Bram now forges and hands over a high-power sword (200 damage) with its own name, description and look, plus updated dialogue. His weapon blurb and the Armory text are updated so every weapon clearly states its damage.

## 5. Relic cards get a proper treatment
The relic popup is redesigned: gold-framed card, glowing relic emblem, ornate divider, relic numeral, letter-style script for the message, and a soft light animation on open. Same for the envelope cards so both feel like treasures.

## 6. Maria can die — with checkpoints
- Losing the last heart now ends the run: a "Game Over" panel appears with the option to continue from the last checkpoint or start over.
- Entering the house in any act saves a checkpoint. Respawn puts her just outside that house with full health.
- If she never entered a house in that act, she restarts at the act's beginning.

## Also
- 10% more lamps and torches across Acts I–IV for a warmer, better-lit world.
- The grey enemies get colour — tinted, more characterful variants instead of flat grey blobs.

## Technical notes
- `src/lib/quest/content.ts`: boss `demon`/`role` text, Alicia line, Bram weapon + line, new sword entry with damage, weapon blurbs with damage values.
- `src/lib/quest/scene.ts`: water tiles + collision near the Act I envelope, extra lamp coordinates in four zones, enemy tint palette, death flow replacing the `player_health <= 0` auto-heal, checkpoint stored on house entry (zone + door position) in the save.
- `src/lib/quest/save.ts`: checkpoint fields with safe defaults for existing saves.
- `src/components/plan/quest.tsx`: Game Over overlay, restyled relic/envelope cards.
