import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const JOURNAL_KIND = "fallen-crossing-journal";
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";
// Southwest / bottom-left of the Act I design map. This is deliberately well
// away from the River Gate Temple and main eastbound progression road.
const SHRINE_TX = 18;
const SHRINE_TY = 82;
const SITE_RX = 270;
const SITE_RY = 205;

function hasMetSilas() {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1"; } catch { return false; }
}

function depth(scene: SceneLike, y: number, plus = 0) {
  return (scene.dsort?.(y) ?? 10) + plus;
}

function tag<T extends Phaser.GameObjects.GameObject>(obj: T): T {
  obj.setData("fallen-crossing-shrine", true);
  return obj;
}

function clearSite(scene: SceneLike, cx: number, cy: number) {
  // Open a deliberate exploration pocket in the existing southwest grove.
  // Only generated decor is removed; NPCs, pickups and interactables survive.
  const children = scene.solidDecor?.getChildren?.() ?? [];
  for (const raw of [...children] as any[]) {
    if (!raw?.active || raw.getData?.("fallen-crossing-shrine")) continue;
    const dx = (raw.x - cx) / SITE_RX;
    const dy = (raw.y - cy) / SITE_RY;
    if (dx * dx + dy * dy < 1) raw.destroy();
  }
}

function addBlocker(scene: SceneLike, x: number, y: number, sx: number, sy: number) {
  if (!scene.solidDecor) return;
  const blocker = scene.solidDecor.create(x, y, "block") as Phaser.Physics.Arcade.Sprite;
  blocker.setVisible(false).setAlpha(0.001).setScale(sx, sy).setData("fallen-crossing-shrine", true);
  (blocker as any).refreshBody?.();
}

function addButterfly(scene: SceneLike, x: number, y: number, tint: number, seed: number) {
  if (!scene.textures?.exists?.("butterfly")) return;
  const b = tag(scene.add.sprite(x, y, "butterfly")).setDepth(18).setTint(tint).setScale(0.72 + (seed % 3) * 0.08).setAlpha(0.94);
  scene.tweens.add({
    targets: b,
    x: x + (((seed * 41) % 70) - 35),
    y: y - 22 + (((seed * 29) % 42) - 21),
    angle: seed % 2 ? 9 : -9,
    scaleX: b.scaleX * 0.42,
    duration: 900 + seed * 95,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function addFlower(scene: SceneLike, x: number, y: number, tint: number, scale = 0.82) {
  if (!scene.textures?.exists?.("flowers")) return;
  tag(scene.add.sprite(x, y, "flowers")).setDepth(depth(scene, y, -2)).setTint(tint).setScale(scale).setAlpha(0.96);
}

function buildShrine(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__fallenCrossingShrineBuilt) return;
  scene.__fallenCrossingShrineBuilt = true;

  const cx = scene.wx?.(SHRINE_TX) ?? SHRINE_TX * 32;
  const cy = scene.wy?.(SHRINE_TY) ?? SHRINE_TY * 32;
  clearSite(scene, cx, cy);

  // One graphics object carries the environmental illustration. The shapes are
  // intentionally irregular and layered so the site reads as world art rather
  // than a UI panel dropped onto the map.
  const g = tag(scene.add.graphics()).setDepth(depth(scene, cy + 150, -4));

  // Trampled earth and moss-softened stone approach.
  g.fillStyle(0x536b3e, 0.28); g.fillEllipse(cx, cy + 22, 430, 290);
  g.fillStyle(0x6f674f, 0.54); g.fillEllipse(cx - 4, cy + 54, 350, 205);
  g.fillStyle(0x8b8065, 0.55); g.fillEllipse(cx - 8, cy + 45, 305, 168);
  const pathStones = [
    [-22, 176, 58, 25, -0.12], [18, 143, 52, 23, 0.08], [-11, 111, 61, 25, -0.05],
    [26, 79, 50, 22, 0.14], [-17, 48, 58, 24, -0.1], [14, 18, 46, 20, 0.06],
  ];
  for (const [ox, oy, w, h] of pathStones) {
    g.fillStyle(0xaaa28d, 0.78); g.fillRoundedRect(cx + ox - w / 2, cy + oy - h / 2, w, h, 6);
    g.lineStyle(2, 0x5b5b50, 0.62); g.strokeRoundedRect(cx + ox - w / 2, cy + oy - h / 2, w, h, 6);
  }

  // Broken semicircle of old shrine masonry.
  const stones = [[-158,-20,52,23],[-128,-61,47,21],[-90,-91,42,22],[-49,-111,48,22],[49,-112,44,21],[91,-94,48,22],[132,-63,46,21],[160,-19,50,23]];
  for (const [ox, oy, w, h] of stones) {
    g.fillStyle(0x6b6c61, 1); g.fillRoundedRect(cx + ox - w/2, cy + oy - h/2, w, h, 5);
    g.fillStyle(0x9b9a89, 0.9); g.fillRoundedRect(cx + ox - w/2 + 4, cy + oy - h/2 + 3, w - 8, Math.max(5, h * 0.34), 3);
    g.fillStyle(0x60734c, 0.72); g.fillEllipse(cx + ox - w * 0.2, cy + oy - h * 0.3, w * 0.42, 7);
  }

  // Three broken columns frame the memorial, matching the approved concept.
  const column = (x: number, y: number, h: number, brokenRight: boolean) => {
    g.fillStyle(0x4c504a, 0.45); g.fillEllipse(x + 5, y + 8, 45, 15);
    g.fillStyle(0x686b63, 1); g.fillRoundedRect(x - 17, y - h, 34, h, 5);
    g.fillStyle(0xa5a394, 0.94); g.fillRoundedRect(x - 11, y - h + 5, 12, h - 12, 3);
    g.fillStyle(0x7d806f, 0.95); g.fillRect(x - 22, y - 10, 44, 10);
    g.fillStyle(0x566c47, 0.9); g.fillEllipse(x - 8, y - h + 14, 24, 10);
    g.lineStyle(3, 0x4e514b, 0.8);
    if (brokenRight) { g.lineBetween(x - 17, y - h + 4, x + 4, y - h + 14); g.lineBetween(x + 4, y - h + 14, x + 17, y - h + 7); }
    else { g.lineBetween(x - 15, y - h + 10, x + 5, y - h + 3); g.lineBetween(x + 5, y - h + 3, x + 17, y - h + 13); }
  };
  column(cx - 112, cy - 30, 108, true);
  column(cx + 112, cy - 30, 92, false);
  column(cx - 174, cy + 18, 64, true);

  // Main carved memorial: stepped base, weathered slab, chipped crown and cracks.
  g.fillStyle(0x444943, 0.55); g.fillEllipse(cx + 5, cy - 3, 150, 31);
  g.fillStyle(0x5b5f58, 1); g.fillRoundedRect(cx - 70, cy - 22, 140, 24, 5);
  g.fillStyle(0x83847a, 1); g.fillRoundedRect(cx - 59, cy - 39, 118, 22, 5);
  g.fillStyle(0x686b65, 1); g.fillRoundedRect(cx - 49, cy - 154, 98, 118, 7);
  g.fillStyle(0xa4a398, 0.96); g.fillRoundedRect(cx - 40, cy - 146, 76, 100, 5);
  // chipped crown and moss
  g.fillStyle(0x6a6d65, 1); g.fillTriangle(cx - 49, cy - 150, cx - 25, cy - 171, cx - 5, cy - 151);
  g.fillTriangle(cx - 7, cy - 153, cx + 19, cy - 176, cx + 49, cy - 153);
  g.fillStyle(0x5f754a, 0.92); g.fillEllipse(cx - 20, cy - 146, 48, 13); g.fillEllipse(cx + 29, cy - 117, 25, 10);
  g.lineStyle(3, 0x50534f, 0.9); g.lineBetween(cx + 8, cy - 145, cx - 2, cy - 119); g.lineBetween(cx - 2, cy - 119, cx + 13, cy - 91); g.lineBetween(cx + 13, cy - 91, cx + 2, cy - 64);

  const names = tag(scene.add.text(cx, cy - 91, "ELARA\nPIP\nMAEVE", {
    fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#e7d8a6", align: "center", lineSpacing: 3,
  })).setOrigin(0.5).setDepth(depth(scene, cy - 35, 3)).setAlpha(0.96);

  // Campfire with ember glow, logs and ash ring.
  g.fillStyle(0x4b4840, 1); g.fillCircle(cx - 113, cy + 82, 32);
  for (let i = 0; i < 9; i++) {
    const a = (Math.PI * 2 * i) / 9;
    g.fillStyle(i % 2 ? 0x8c887a : 0x77756d, 1); g.fillCircle(cx - 113 + Math.cos(a) * 25, cy + 82 + Math.sin(a) * 25, 8);
  }
  g.lineStyle(8, 0x4d3425, 1); g.lineBetween(cx - 132, cy + 68, cx - 94, cy + 96); g.lineBetween(cx - 132, cy + 96, cx - 94, cy + 68);
  g.fillStyle(0xf0a33b, 0.82); g.fillTriangle(cx - 122, cy + 82, cx - 111, cy + 51, cx - 101, cy + 83);
  g.fillStyle(0xffd36b, 0.92); g.fillTriangle(cx - 117, cy + 82, cx - 111, cy + 61, cx - 105, cy + 82);
  const glow = tag(scene.add.circle(cx - 113, cy + 72, 54, 0xffb84a, 0.12)).setDepth(depth(scene, cy + 72, -1));
  scene.tweens.add({ targets: glow, alpha: { from: 0.07, to: 0.18 }, scale: { from: 0.9, to: 1.08 }, duration: 780, yoyo: true, repeat: -1 });

  // Three expedition bedrolls / packs in distinct survivor colors.
  const bedroll = (x: number, y: number, tint: number) => {
    g.fillStyle(0x3e3b34, 0.45); g.fillEllipse(x + 5, y + 8, 74, 22);
    g.fillStyle(tint, 1); g.fillRoundedRect(x - 31, y - 11, 62, 22, 8);
    g.lineStyle(3, 0x443b31, 0.9); g.strokeRoundedRect(x - 31, y - 11, 62, 22, 8); g.lineBetween(x + 17, y - 10, x + 17, y + 10);
  };
  bedroll(cx - 164, cy + 130, 0x7f4449);
  bedroll(cx + 9, cy + 126, 0x39766d);
  bedroll(cx + 142, cy + 104, 0x778b67);

  // Elara: large dented shield leaned beside a travel pack.
  g.fillStyle(0x704a38, 1); g.fillRoundedRect(cx - 194, cy + 28, 46, 55, 8);
  g.fillStyle(0x435a6d, 1); g.fillCircle(cx - 153, cy + 42, 30); g.fillStyle(0x324655, 1); g.fillTriangle(cx - 183, cy + 42, cx - 123, cy + 42, cx - 153, cy + 82);
  g.lineStyle(4, 0xb59a63, 1); g.strokeCircle(cx - 153, cy + 42, 26); g.lineBetween(cx - 170, cy + 23, cx - 138, cy + 62);

  // Pip: broken brass/teal field device with exposed arm and gear.
  g.fillStyle(0x6b4e2c, 1); g.fillRoundedRect(cx + 133, cy + 20, 66, 47, 6); g.fillStyle(0xc19a49, 1); g.fillRoundedRect(cx + 140, cy + 27, 48, 31, 4);
  g.fillStyle(0x2f6970, 1); g.fillCircle(cx + 156, cy + 43, 11); g.lineStyle(5, 0x765b30, 1); g.lineBetween(cx + 188, cy + 30, cx + 217, cy + 3); g.lineBetween(cx + 217, cy + 3, cx + 229, cy + 14);

  // Maeve: empty leather medicine satchel with a faded healer cross/bandage.
  g.fillStyle(0x6f5940, 1); g.fillRoundedRect(cx + 76, cy + 139, 59, 44, 8); g.lineStyle(4, 0x493b2e, 1); g.arc(cx + 105, cy + 139, 25, Math.PI, 0, false);
  g.fillStyle(0xe5ddc6, 0.95); g.fillRect(cx + 97, cy + 150, 17, 5); g.fillRect(cx + 103, cy + 144, 5, 17); g.fillRect(cx + 139, cy + 157, 38, 11);

  // Warm shrine lantern and candles break up the cool stone palette.
  g.fillStyle(0x4a4033, 1); g.fillRoundedRect(cx + 66, cy - 35, 24, 37, 5); g.fillStyle(0xffcf65, 0.96); g.fillRoundedRect(cx + 71, cy - 28, 14, 21, 3);
  const lanternGlow = tag(scene.add.circle(cx + 78, cy - 17, 38, 0xffc45c, 0.11)).setDepth(depth(scene, cy - 17, -1));
  scene.tweens.add({ targets: lanternGlow, alpha: { from: 0.06, to: 0.17 }, duration: 1000, yoyo: true, repeat: -1 });
  for (const [ox, oy] of [[-66,-28],[-78,-18],[57,-22],[48,-12]] as [number,number][]) {
    g.fillStyle(0xeee1bf, 1); g.fillRect(cx + ox, cy + oy, 5, 15); g.fillStyle(0xffd56a, 1); g.fillCircle(cx + ox + 2, cy + oy - 3, 4);
  }

  // Dense edge planting integrates the ruin with Act I rather than boxing it in.
  const flowerTints = [0xffffff, 0xff9fc6, 0xf3d35b, 0x8bc766];
  const flowers = [[-207,-42],[-190,-75],[-150,-105],[-91,-137],[-58,2],[94,-126],[145,-95],[191,-55],[205,12],[185,76],[150,153],[54,172],[-54,166],[-184,163],[-220,92]];
  flowers.forEach(([ox, oy], i) => addFlower(scene, cx + ox, cy + oy, flowerTints[i % flowerTints.length]!, 0.72 + (i % 3) * 0.12));
  addButterfly(scene, cx - 137, cy - 80, 0x91d85f, 1);
  addButterfly(scene, cx + 139, cy - 71, 0xf2d34f, 2);
  addButterfly(scene, cx - 35, cy + 72, 0xb1e46c, 3);
  addButterfly(scene, cx + 181, cy + 72, 0xe9c43f, 4);
  addButterfly(scene, cx - 190, cy + 35, 0xf1d75b, 5);

  // Collision only at the memorial/columns; the camp remains easy to explore.
  addBlocker(scene, cx, cy - 82, 1.7, 2.2);
  addBlocker(scene, cx - 112, cy - 78, 0.55, 1.55);
  addBlocker(scene, cx + 112, cy - 72, 0.55, 1.35);

  // The journal is the single optional interaction. It uses an existing world
  // prop rather than a floating UI marker.
  const journalKey = scene.textures.exists("rest-stone") ? "rest-stone" : "signpost";
  const journal = tag(scene.add.sprite(cx - 18, cy + 61, journalKey)).setDepth(depth(scene, cy + 61, 2)).setScale(0.68).setTint(0xb59b70);
  scene.interactables.push({ obj: journal, kind: JOURNAL_KIND, id: "fallen-crossing-journal", label: "Read the traveler's journal", radius: 92, enabled: true });
  scene.tweens.add({ targets: journal, alpha: { from: 0.82, to: 1 }, y: journal.y - 3, duration: 1050, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

function openJournal(scene: SceneLike) {
  const recognition = hasMetSilas()
    ? "\n\nMaria: “The Last Crossing… Silas was talking about them.”"
    : "\n\nA final arrow has been scratched beneath the words, pointing southeast.";
  scene.openModal?.({
    type: "info",
    title: "Shrine of the Fallen Crossing",
    body: "Traveler's Journal\n\n“Three of us crossed together. Three of us came back. The Warden's weight hits farther than it looks — when he rises, move before the ground answers.\n\nIf someone finds this before trying the bridge, find us southeast at The Last Crossing. There are things we know now that we wish we knew then.”" + recognition,
  });
}

export function installFallenCrossingShrine(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__fallenCrossingShrineInstalled) return;
  proto.__fallenCrossingShrineInstalled = true;

  const originalCreate = proto.create;
  proto.create = function fallenCrossingShrineCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(160, () => buildShrine(this));
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function fallenCrossingShrineInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === JOURNAL_KIND) { openJournal(this); return; }
    return originalInteract.apply(this, args);
  };
}
