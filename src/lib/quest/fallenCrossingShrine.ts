import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const JOURNAL_KIND = "fallen-crossing-journal";
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";

function hasMetSilas() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function addBlocker(scene: SceneLike, x: number, y: number, sx: number, sy: number) {
  if (!scene.solidDecor) return;
  const blocker = scene.solidDecor.create(x, y, "block") as Phaser.Physics.Arcade.Sprite;
  blocker.setVisible(false).setAlpha(0.001).setScale(sx, sy);
  blocker.setData("fallen-crossing-shrine", true);
  (blocker as any).refreshBody?.();
}

function addShrineButterfly(scene: SceneLike, x: number, y: number, tint: number, seed: number) {
  if (!scene.textures?.exists?.("butterfly")) return;
  const b = scene.add
    .sprite(x, y, "butterfly")
    .setDepth(14)
    .setTint(tint)
    .setScale(0.78 + (seed % 3) * 0.08)
    .setAlpha(0.9)
    .setData("fallen-crossing-shrine", true);
  const ox = ((seed * 37) % 54) - 27;
  const oy = ((seed * 23) % 32) - 16;
  scene.tweens.add({
    targets: b,
    x: x + ox,
    y: y - 18 + oy,
    angle: seed % 2 === 0 ? 8 : -8,
    scaleX: b.scaleX * 0.45,
    duration: 900 + seed * 80,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function shrineAnchor(scene: SceneLike) {
  const landmark = scene.landmark?.sprite as Phaser.GameObjects.Sprite | undefined;
  if (landmark?.active) {
    return { x: landmark.x, y: landmark.y + Math.max(110, landmark.displayHeight * 0.42) };
  }
  return { x: scene.wx?.(104) ?? 104 * 32, y: scene.wy?.(34) ?? 34 * 32 };
}

function buildShrine(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__fallenCrossingShrineBuilt) return;
  scene.__fallenCrossingShrineBuilt = true;

  const { x: cx, y: cy } = shrineAnchor(scene);
  const g = scene.add.graphics().setDepth(scene.dsort?.(cy + 42) ?? 10).setData("fallen-crossing-shrine", true);

  // Broken oval foundation so this reads as an old roadside memorial rather than a clean arena.
  g.fillStyle(0x726a5d, 0.34);
  g.fillEllipse(cx, cy + 22, 286, 132);
  g.lineStyle(7, 0x8f897a, 0.72);
  g.beginPath();
  g.arc(cx, cy + 20, 132, Phaser.Math.DegToRad(198), Phaser.Math.DegToRad(350), false);
  g.strokePath();
  g.beginPath();
  g.arc(cx, cy + 20, 132, Phaser.Math.DegToRad(18), Phaser.Math.DegToRad(142), false);
  g.strokePath();

  // Central cracked memorial stone.
  g.fillStyle(0x77766f, 1);
  g.fillRoundedRect(cx - 38, cy - 58, 76, 88, 8);
  g.fillStyle(0x919087, 1);
  g.fillRoundedRect(cx - 30, cy - 50, 60, 70, 6);
  g.lineStyle(3, 0x55544f, 0.9);
  g.lineBetween(cx - 3, cy - 48, cx + 11, cy - 23);
  g.lineBetween(cx + 11, cy - 23, cx + 1, cy - 4);
  g.lineBetween(cx + 1, cy - 4, cx + 15, cy + 15);
  g.lineStyle(2, 0xb8aa78, 0.75);
  g.lineBetween(cx - 20, cy - 6, cx + 20, cy - 6);

  const names = scene.add
    .text(cx, cy - 18, "ELARA  ·  PIP  ·  MAEVE", {
      fontFamily: "Georgia, serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#d8cda6",
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth((scene.dsort?.(cy) ?? 10) + 1)
    .setData("fallen-crossing-shrine", true);
  names.setAlpha(0.88);

  // Burnt campfire and three old bedrolls.
  g.fillStyle(0x332b25, 0.95);
  g.fillCircle(cx - 92, cy + 31, 20);
  g.lineStyle(6, 0x513b2a, 1);
  g.lineBetween(cx - 108, cy + 20, cx - 77, cy + 41);
  g.lineBetween(cx - 106, cy + 42, cx - 78, cy + 18);
  for (const [bx, by, tint] of [
    [cx - 132, cy + 64, 0x7b3f46],
    [cx - 36, cy + 79, 0x39766d],
    [cx + 72, cy + 68, 0x718565],
  ] as [number, number, number][]) {
    g.fillStyle(tint, 0.88);
    g.fillRoundedRect(bx - 24, by - 8, 48, 16, 5);
    g.lineStyle(2, 0x433a31, 0.72);
    g.strokeRoundedRect(bx - 24, by - 8, 48, 16, 5);
  }

  // Elara's dented shield.
  g.fillStyle(0x596573, 1);
  g.fillCircle(cx + 102, cy - 10, 22);
  g.fillStyle(0x9b7250, 1);
  g.fillCircle(cx + 102, cy - 10, 7);
  g.lineStyle(4, 0x343c45, 1);
  g.lineBetween(cx + 86, cy - 25, cx + 116, cy + 8);

  // Pip's broken gadget: brass frame, snapped arm and dead lens.
  g.fillStyle(0xb28a43, 1);
  g.fillRoundedRect(cx + 135, cy + 32, 40, 24, 5);
  g.fillStyle(0x315c63, 1);
  g.fillCircle(cx + 148, cy + 44, 7);
  g.lineStyle(4, 0x6e532d, 1);
  g.lineBetween(cx + 169, cy + 34, cx + 188, cy + 17);
  g.lineBetween(cx + 179, cy + 25, cx + 191, cy + 31);

  // Maeve's empty medicine satchel with pale bandage cloth beside it.
  g.fillStyle(0x776148, 1);
  g.fillRoundedRect(cx + 34, cy + 93, 42, 30, 7);
  g.lineStyle(4, 0x4d3e2f, 1);
  g.arc(cx + 55, cy + 92, 18, Math.PI, 0, false);
  g.fillStyle(0xd8d2bd, 0.92);
  g.fillRect(cx + 83, cy + 97, 28, 9);

  // Broken lantern posts and flowers soften the edges.
  for (const [lx, ly, angle] of [
    [cx - 153, cy - 5, -11],
    [cx + 157, cy - 34, 14],
  ] as [number, number, number][]) {
    g.lineStyle(7, 0x574b3c, 1);
    g.lineBetween(lx, ly, lx + angle * 0.45, ly - 42);
    g.fillStyle(0x8d7449, 0.9);
    g.fillRect(lx - 7 + angle * 0.45, ly - 51, 15, 13);
  }
  for (const [fx, fy, tint] of [
    [cx - 164, cy + 47, 0xf1ce4f],
    [cx - 145, cy + 30, 0x7cb85c],
    [cx + 132, cy + 80, 0xf2d65c],
    [cx + 155, cy + 60, 0x79b85d],
  ] as [number, number, number][]) {
    const f = scene.add.sprite(fx, fy, "flowers").setDepth(7).setScale(0.85).setTint(tint);
    f.setData("fallen-crossing-shrine", true);
  }

  addShrineButterfly(scene, cx - 118, cy - 25, 0x82c75d, 1);
  addShrineButterfly(scene, cx + 122, cy + 17, 0xf2d34f, 2);
  addShrineButterfly(scene, cx - 20, cy + 100, 0xa8d96d, 3);
  addShrineButterfly(scene, cx + 76, cy - 62, 0xe3b93f, 4);

  addBlocker(scene, cx, cy - 15, 1.45, 1.6);

  const journal = scene.add
    .sprite(cx - 48, cy + 28, scene.textures.exists("signpost") ? "signpost" : "rest-stone")
    .setDepth(scene.dsort?.(cy + 29) ?? 11)
    .setScale(0.62)
    .setTint(0xa8855c)
    .setData("fallen-crossing-shrine", true);
  scene.interactables.push({
    obj: journal,
    kind: JOURNAL_KIND,
    id: "fallen-crossing-journal",
    label: "Read the abandoned traveler's journal",
    radius: 86,
    enabled: true,
  });
  scene.tweens.add({
    targets: journal,
    alpha: { from: 0.76, to: 1 },
    y: journal.y - 2,
    duration: 1150,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function openJournal(scene: SceneLike) {
  const recognition = hasMetSilas()
    ? "\n\nMaria: “The Last Crossing… Silas was talking about them.”"
    : "\n\nA final arrow has been scratched beneath the words, pointing southeast.";
  scene.openModal?.({
    type: "info",
    title: "Shrine of the Fallen Crossing",
    body:
      "Traveler's Journal\n\n“Three of us crossed together. Three of us came back. The Warden's weight hits farther than it looks — when he rises, move before the ground answers.\n\nIf someone finds this before trying the bridge, find us southeast at The Last Crossing. There are things we know now that we wish we knew then.”" +
      recognition,
  });
}

export function installFallenCrossingShrine(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__fallenCrossingShrineInstalled) return;
  proto.__fallenCrossingShrineInstalled = true;

  const originalCreate = proto.create;
  proto.create = function fallenCrossingShrineCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(140, () => buildShrine(this));
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function fallenCrossingShrineInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === JOURNAL_KIND) {
      openJournal(this);
      return;
    }
    return originalInteract.apply(this, args);
  };
}
