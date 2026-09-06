import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const JOURNAL_KIND = "fallen-crossing-journal";
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";
// Fixed design-space location in the open exploration pocket west of the River Gate approach.
// Do not anchor this to the boss landmark: that made the shrine drift into/behind the temple area.
const SHRINE_TX = 82;
const SHRINE_TY = 36;

function hasMetSilas() {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1"; } catch { return false; }
}

function addBlocker(scene: SceneLike, x: number, y: number, sx: number, sy: number) {
  if (!scene.solidDecor) return;
  const blocker = scene.solidDecor.create(x, y, "block") as Phaser.Physics.Arcade.Sprite;
  blocker.setVisible(false).setAlpha(0.001).setScale(sx, sy).setData("fallen-crossing-shrine", true);
  (blocker as any).refreshBody?.();
}

function addShrineButterfly(scene: SceneLike, x: number, y: number, tint: number, seed: number) {
  if (!scene.textures?.exists?.("butterfly")) return;
  const b = scene.add.sprite(x, y, "butterfly").setDepth(14).setTint(tint).setScale(0.78 + (seed % 3) * 0.08).setAlpha(0.9).setData("fallen-crossing-shrine", true);
  const ox = ((seed * 37) % 54) - 27;
  const oy = ((seed * 23) % 32) - 16;
  scene.tweens.add({ targets: b, x: x + ox, y: y - 18 + oy, angle: seed % 2 === 0 ? 8 : -8, scaleX: b.scaleX * 0.45, duration: 900 + seed * 80, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

function shrineAnchor(scene: SceneLike) {
  return { x: scene.wx?.(SHRINE_TX) ?? SHRINE_TX * 32, y: scene.wy?.(SHRINE_TY) ?? SHRINE_TY * 32 };
}

function buildShrine(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__fallenCrossingShrineBuilt) return;
  scene.__fallenCrossingShrineBuilt = true;
  const { x: cx, y: cy } = shrineAnchor(scene);
  const g = scene.add.graphics().setDepth(scene.dsort?.(cy + 42) ?? 10).setData("fallen-crossing-shrine", true);

  // A wide, broken foundation and path make the optional site readable from a distance.
  g.fillStyle(0x6d685d, 0.42); g.fillEllipse(cx, cy + 22, 330, 154);
  g.fillStyle(0x918a78, 0.48); g.fillRoundedRect(cx - 30, cy + 72, 60, 120, 20);
  g.lineStyle(8, 0xa29a84, 0.78);
  g.beginPath(); g.arc(cx, cy + 20, 150, Phaser.Math.DegToRad(198), Phaser.Math.DegToRad(350), false); g.strokePath();
  g.beginPath(); g.arc(cx, cy + 20, 150, Phaser.Math.DegToRad(18), Phaser.Math.DegToRad(142), false); g.strokePath();

  // Taller cracked memorial silhouette.
  g.fillStyle(0x62635f, 1); g.fillRoundedRect(cx - 47, cy - 82, 94, 116, 9);
  g.fillStyle(0x96958b, 1); g.fillRoundedRect(cx - 38, cy - 72, 76, 92, 7);
  g.lineStyle(4, 0x4e4f4b, 0.95); g.lineBetween(cx - 4, cy - 70, cx + 14, cy - 38); g.lineBetween(cx + 14, cy - 38, cx + 1, cy - 9); g.lineBetween(cx + 1, cy - 9, cx + 18, cy + 14);
  const names = scene.add.text(cx, cy - 24, "ELARA  ·  PIP  ·  MAEVE", { fontFamily: "Georgia, serif", fontSize: "10px", fontStyle: "bold", color: "#efe1ae", align: "center" }).setOrigin(0.5).setDepth((scene.dsort?.(cy) ?? 10) + 1).setData("fallen-crossing-shrine", true);
  names.setAlpha(0.95);

  // Burnt campfire and three survivor bedrolls.
  g.fillStyle(0x2f2924, 0.98); g.fillCircle(cx - 102, cy + 30, 22);
  g.lineStyle(7, 0x513b2a, 1); g.lineBetween(cx - 120, cy + 17, cx - 84, cy + 43); g.lineBetween(cx - 118, cy + 44, cx - 84, cy + 16);
  for (const [bx, by, tint] of [[cx - 140, cy + 75, 0x7b3f46], [cx - 34, cy + 91, 0x39766d], [cx + 82, cy + 76, 0x718565]] as [number, number, number][]) {
    g.fillStyle(tint, 0.92); g.fillRoundedRect(bx - 27, by - 9, 54, 18, 5); g.lineStyle(2, 0x433a31, 0.8); g.strokeRoundedRect(bx - 27, by - 9, 54, 18, 5);
  }

  // Elara's dented shield.
  g.fillStyle(0x596573, 1); g.fillCircle(cx + 112, cy - 15, 25); g.fillStyle(0x9b7250, 1); g.fillCircle(cx + 112, cy - 15, 8); g.lineStyle(4, 0x343c45, 1); g.lineBetween(cx + 93, cy - 33, cx + 128, cy + 5);
  // Pip's broken brass gadget.
  g.fillStyle(0xb28a43, 1); g.fillRoundedRect(cx + 142, cy + 34, 43, 27, 5); g.fillStyle(0x315c63, 1); g.fillCircle(cx + 156, cy + 47, 8); g.lineStyle(4, 0x6e532d, 1); g.lineBetween(cx + 178, cy + 35, cx + 198, cy + 16);
  // Maeve's empty medicine satchel and bandage.
  g.fillStyle(0x776148, 1); g.fillRoundedRect(cx + 35, cy + 105, 46, 32, 7); g.lineStyle(4, 0x4d3e2f, 1); g.arc(cx + 58, cy + 104, 19, Math.PI, 0, false); g.fillStyle(0xd8d2bd, 0.95); g.fillRect(cx + 88, cy + 109, 31, 10);

  for (const [lx, ly, angle] of [[cx - 170, cy - 9, -11], [cx + 172, cy - 38, 14]] as [number, number, number][]) {
    g.lineStyle(7, 0x574b3c, 1); g.lineBetween(lx, ly, lx + angle * 0.45, ly - 46); g.fillStyle(0x8d7449, 0.9); g.fillRect(lx - 7 + angle * 0.45, ly - 56, 15, 14);
  }
  for (const [fx, fy, tint] of [[cx - 178, cy + 52, 0xf1ce4f], [cx - 157, cy + 32, 0x7cb85c], [cx + 145, cy + 88, 0xf2d65c], [cx + 169, cy + 64, 0x79b85d]] as [number, number, number][]) {
    const f = scene.add.sprite(fx, fy, "flowers").setDepth(7).setScale(0.9).setTint(tint); f.setData("fallen-crossing-shrine", true);
  }
  addShrineButterfly(scene, cx - 132, cy - 30, 0x82c75d, 1); addShrineButterfly(scene, cx + 137, cy + 17, 0xf2d34f, 2); addShrineButterfly(scene, cx - 20, cy + 112, 0xa8d96d, 3); addShrineButterfly(scene, cx + 80, cy - 72, 0xe3b93f, 4);
  addBlocker(scene, cx, cy - 25, 1.7, 2.05);

  const journal = scene.add.sprite(cx - 54, cy + 31, scene.textures.exists("signpost") ? "signpost" : "rest-stone").setDepth(scene.dsort?.(cy + 32) ?? 11).setScale(0.7).setTint(0xb38b5c).setData("fallen-crossing-shrine", true);
  scene.interactables.push({ obj: journal, kind: JOURNAL_KIND, id: "fallen-crossing-journal", label: "Read the abandoned traveler's journal", radius: 96, enabled: true });
  scene.tweens.add({ targets: journal, alpha: { from: 0.7, to: 1 }, y: journal.y - 3, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

function openJournal(scene: SceneLike) {
  const recognition = hasMetSilas() ? "\n\nMaria: “The Last Crossing… Silas was talking about them.”" : "\n\nA final arrow has been scratched beneath the words, pointing southeast.";
  scene.openModal?.({ type: "info", title: "Shrine of the Fallen Crossing", body: "Traveler's Journal\n\n“Three of us crossed together. Three of us came back. The Warden's weight hits farther than it looks — when he rises, move before the ground answers.\n\nIf someone finds this before trying the bridge, find us southeast at The Last Crossing. There are things we know now that we wish we knew then.”" + recognition });
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
    if (it?.kind === JOURNAL_KIND) { openJournal(this); return; }
    return originalInteract.apply(this, args);
  };
}
