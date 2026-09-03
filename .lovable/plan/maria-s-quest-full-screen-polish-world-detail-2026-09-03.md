# Maria's Quest — Full-Screen Polish & World Detail

Seven updates to the existing quest module. Items 2 (bundled art) and full-color terrain are already in place from the previous pass; this plan verifies them and builds the remaining six.

## 1. True full-screen canvas with overlay HUD
The game currently renders in a 70vh rounded card inside the dashboard. When the quest is playing, it becomes a fixed full-viewport layer (100vw x 100vh, dark backdrop, page scroll locked). Every HUD piece — joystick, action buttons, hearts/stamina, objective tracker, prompts, toasts, Save & Title — becomes a fixed overlay above the canvas, with safe-area padding so nothing sits under an iPhone notch or home bar. Phaser keeps RESIZE scale mode so the world fills the screen rather than being squished.

## 2. Bundled art + full-color terrain (verification)
All sprites and tiles already load from locally bundled files — no external CDN. Terrain already renders in full saturation with no grey filter. This step confirms it on a live boot and fixes any tile that still reads dull.

## 3. Characters +10% and smoother walk cycles
Maria and Andrew render at 1.1x scale with their physics bodies resized and re-offset to match, so collisions stay accurate. Maria's four walk loops get an extra in-between frame each (dress sway and leg lift) for fluid motion, and stopping snaps her to a clean idle pose facing the direction she last moved.

## 4. Signpost and Guide interaction
Both get a proper interaction radius Maria can reliably trigger. A floating gold prompt ("Tap ACTION to read" / "Press E to read") appears above her head while in range. Pressing action freezes movement and opens the Realm Map modal at the highest overlay depth, resuming play on close.

## 5. Objective tracker + directional arrow
A top-center HUD panel shows the current act goal (e.g. "Act I: Cross the river and locate the Sunken Grotto"). A soft glowing gold arrow points from Maria toward the active target for that act; when the target is off-screen the arrow pins to the screen edge, and it fades out when the target is close or the act has no single target. The arrow retargets automatically as each act's goal advances through all five acts.

## 6. Dense environment decor
New bundled art for houses, stone cottages, tree clusters, wood fences, flower patches, streetlamps, benches, and cobblestone bridges. These are scattered across the expanded map with per-zone density — a village cluster in Haven Town, tree groves and fences along the trails, lamps and benches lining paths, bridges over the river crossings. Solid decor collides with Maria. Outer map borders get closed off naturally with tree lines, cliff walls, and water instead of invisible edges.

## 7. CONTROLS button
A small icon button in the HUD's top-right opens a modal explaining joystick/WASD movement, the interact and Peace Burst buttons, dash and its cooldown, and what the gold arrow means.

## Technical notes
- `src/components/plan/quest.tsx`: fixed full-viewport play layer with body scroll lock, safe-area insets, objective panel, arrow overlay (or Phaser-drawn arrow), CONTROLS modal, high-depth guide modal.
- `src/lib/quest/scene.ts`: player/Andrew `setScale(1.1)` with matching `setSize/setOffset`; extra walk frames and idle-frame snap in `makeWalkAnims`; wider interact radius plus in-world floating prompt sprite; per-act objective target coordinates feeding the arrow; new decor placement pass in each zone builder with collision groups and border framing.
- `src/lib/quest/textures.ts` + `src/assets/quest/`: add generated house, cottage, tree, fence, flower-patch, lamp, bench, and bridge art; register them in the preload/sprite tables.
- `src/lib/quest/content.ts`: controls-modal copy and per-act objective text.
- Verified with typecheck, production build, and a live browser boot screenshot.
