# Chest drag & drop, easy cooking, earlier boss music, cosier house

Four fixes to Maria's Quest.

## 1. Drag and drop for the chest

The Home Chest screen becomes drag-and-drop: press and hold an item, drag it across to the other side, let go and it moves. Works with a finger on the phone and with the mouse. The slot you're hovering lights up so you know where it will land, and the item follows your finger while you drag. Tapping still works exactly as it does now, so nothing you're used to breaks.

## 2. Cooking with no fuss

Raw meat can be cooked from the backpack at any time, anywhere — no hearth, no fire, nothing to gather first. Each raw meat in the backpack gets a small "Cook" action right next to "Eat". The hearth at home keeps working too, and its wording changes so it no longer implies you must be home to cook. If you have no raw meat, the option simply isn't shown instead of showing a greyed "Cook Raw Meat (0)".

## 3. Boss music at the first line

Right now the battle music only kicks in once the fight actually starts. Instead it will start the moment the boss conversation opens, and run straight through the dialogue into the fight, then fade back to the normal realm music when the boss is beaten or you walk away.

## 4. A warmer, pixel-art house interior

The room is rebuilt to match the reference picture: a wide plank floor with visible brick-like board joints, cream plaster walls capped with dark timber, a big stone fireplace with a lit fire as the centrepiece, a green woven rug with a fringed border, a bookshelf, a small potted tree, framed pictures on the wall, a hearth rug/pelt on the floor, the bed tucked in a corner with the chest at its foot, and a dark doorway gap at the bottom for the exit. Lighting stays soft — a glow around the fire and the candle only, no big floating circles.

## Technical notes

- `src/components/plan/quest.tsx` — chest panel gets HTML5 drag events plus pointer-based touch dragging with a drop-target highlight; backpack rows gain a Cook action for items with a `cookedId`; hearth copy updated.
- `src/lib/quest/house.ts` — `onItem` cook branch stays as-is (already generic); interior `create()` redrawn to the reference layout (fireplace, bookshelf, plant, pelt, framed art, doorway gap).
- `src/lib/quest/scene.ts` — set the music mode to `battle` in `checkBossEncounter()` when the boss modal opens, and keep the update-loop check from downgrading it back to `explore` while the dialogue is open.
