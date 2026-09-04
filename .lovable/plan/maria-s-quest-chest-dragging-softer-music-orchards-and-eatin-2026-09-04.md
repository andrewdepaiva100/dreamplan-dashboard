# Maria's Quest — chest dragging, softer music, orchards and eating

## 1. Chest drag and drop that actually works

The current dragging uses the desktop-only browser drag feature, which does nothing on a touch screen and often refuses to start on a trackpad because each slot is a button.

Replace it with press-and-move dragging: press a slot, a small floating copy of the item follows your finger or cursor, and releasing it over the other side moves it. The target side highlights while hovered. Tapping still moves an item instantly, so nothing gets slower.

## 2. Music with a Minecraft feel

Replace the plucky chiptune melody with calm, breathy piano notes over a soft pad: slower pace, longer decay, gentle random spacing between phrases and occasional silence — the ambient, unhurried feel of Minecraft rather than an arcade tune. Battle music stays more urgent but uses the same warmer instrument, and the home lullaby gets softer.

## 3. Act I world changes

- 20% fewer flowers in Act I (180 to 144).
- 15% fewer heart pickups in every act.
- Apple and orange trees scattered lightly around Act I (roughly 8 of them), visibly fruit-laden. Walk up and press E to pick — each tree gives 1–2 fruits, then goes bare and regrows after a couple of minutes.

## 4. Eating and healing

- New food items: Apple and Orange, each restoring a quarter heart.
- Every other food restores half a heart (raw meat included, cooked meat included).
- Backpack gets a clear Eat button under the selected item instead of relying on tapping the slot; tapping still works.
- Health can now sit at part of a heart, so the heart row shows quarter- and half-filled hearts.

## 5. Extra smoothness suggestions (included)

- Item counts and a name label show on the slot you're holding, so you always know what you picked up.
- Eating when already at full health is blocked with a short message instead of wasting food.
- Fruit trees show a small sparkle when ready to pick, so you can spot them from a distance.

## Technical notes

- `src/components/plan/quest.tsx`: rewrite `ItemGrid` drag handling with pointer events (`onPointerDown`/`window` move+up listeners) and a fixed-position ghost element; add hover-target state shared between the two grids via a lifted `dragging` state in the chest panel. Add the Eat button to the backpack panel. Render fractional hearts in the HUD.
- `src/lib/quest/content.ts`: add `apple`/`orange` to `FOOD_ITEMS` with `heal: 0.25`; change other `heal` values to `0.5`.
- `src/lib/quest/scene.ts`: Act I `flowers: 180 -> 144`; scale heart-pickup counts by 0.85 in every zone; add a `fruitTrees` decoration pass placing `tree` sprites tinted with fruit overlay sprites and registering `fruit-tree` interactables with a regrow timer; allow fractional `player_health` in damage/heal paths and clamp to 0..5.
- `src/components/plan/quest.tsx` `useActMusic`: new envelope (slow attack, 2.5–4s release), sine+triangle layering, wider note spacing, pauses between phrases.
- One typecheck and build pass; no browser session, to keep credit use low.
