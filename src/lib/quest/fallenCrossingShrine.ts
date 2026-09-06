import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const JOURNAL_KIND = "fallen-crossing-journal";
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";
const SHRINE_TX = 18;
const SHRINE_TY = 82;
const SHRINE_SCALE = 0.8;

function hasMetSilas() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function world(scene: SceneLike, tx: number, ty: number) {
  return {
    x: scene.wx?.(tx) ?? tx * 32,
    y: scene.wy?.(ty) ?? ty * 32,
  };
}

function tag<T extends Phaser.GameObjects.GameObject>(obj: T) {
  obj.setData?.("fallen-crossing-shrine", true);
  return obj;
}

function addStaticSprite(
  scene: SceneLike,
  tx: number,
  ty: number,
  key: string,
  scale = 1,
  tint?: number,
  foot = 0.34,
) {
  if (!scene.textures?.exists?.(key)) return null;
  if (!scene.solidDecor) scene.solidDecor = scene.physics.add.staticGroup();
  const { x, y } = world(scene, tx, ty);
  const s = scene.solidDecor.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
  s.setScale(scale * SHRINE_SCALE);
  if (tint !== undefined) s.setTint(tint);
  s.setDepth(scene.dsort?.(y + s.displayHeight * 0.28) ?? 10);
  tag(s);
  const body = s.body as Phaser.Physics.Arcade.StaticBody | undefined;
  if (body) {
    const h = Math.max(6, s.height * foot * 0.5);
    const w = Math.max(8, s.width * 0.48);
    body.setSize(w, h);
    body.setOffset((s.width - w) / 2, s.height - h);
    body.updateFromGameObject?.();
  }
  scene.bakeShadow?.(x, y + s.displayHeight * 0.34, s.displayWidth * 0.62, 0.2);
  return s;
}

function addDecorSprite(
  scene: SceneLike,
  tx: number,
  ty: number,
  key: string,
  scale = 1,
  tint?: number,
  depthOffset = 0,
) {
  if (!scene.textures?.exists?.(key)) return null;
  const { x, y } = world(scene, tx, ty);
  const s = scene.add.sprite(x, y, key).setScale(scale * SHRINE_SCALE);
  if (tint !== undefined) s.setTint(tint);
  s.setDepth((scene.dsort?.(y) ?? 10) + depthOffset);
  tag(s);
  return s;
}

function addShrineButterfly(scene: SceneLike, tx: number, ty: number, tint: number, seed: number) {
  if (!scene.textures?.exists?.("butterfly")) return;
  const { x, y } = world(scene, tx, ty);
  const b = scene.add
    .sprite(x, y, "butterfly")
    .setDepth(14)
    .setTint(tint)
    .setScale((0.72 + (seed % 3) * 0.08) * SHRINE_SCALE)
    .setAlpha(0.92);
  tag(b);
  const ox = ((seed * 31) % 34) - 17;
  const oy = ((seed * 19) % 24) - 12;
  scene.tweens.add({
    targets: b,
    x: x + ox,
    y: y - 13 + oy,
    angle: seed % 2 === 0 ? 8 : -8,
    scaleX: b.scaleX * 0.5,
    duration: 850 + seed * 90,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function clearShrinePocket(scene: SceneLike, cx: number, cy: number) {
  const radiusX = 245;
  const radiusY = 205;
  for (const obj of [...(scene.children?.list ?? [])] as any[]) {
    if (!obj?.active || obj?.getData?.("fallen-crossing-shrine")) continue;
    const key = obj?.texture?.key;
    if (!["tree", "fence", "bench", "lamp", "flowers"].includes(key)) continue;
    if (Math.abs(obj.x - cx) < radiusX && Math.abs(obj.y - cy) < radiusY) obj.destroy?.();
  }
}

function buildGround(scene: SceneLike, cx: number, cy: number) {
  const g = scene.add.graphics().setDepth(2);
  tag(g);

  // A compact, organic earth clearing instead of a giant painted oval.
  g.fillStyle(0x756b56, 0.23);
  g.fillEllipse(cx, cy + 48, 275, 190);
  g.fillStyle(0x8f8065, 0.18);
  g.fillEllipse(cx - 38, cy + 60, 160, 105);

  // Irregular stepping stones leading into the site.
  const stones = [
    [0, 126, 44, 18],
    [-7, 102, 48, 19],
    [8, 79, 42, 17],
    [-10, 57, 45, 18],
  ];
  for (const [ox, oy, w, h] of stones) {
    g.fillStyle(0x948f80, 0.96);
    g.fillRoundedRect(cx + ox - w / 2, cy + oy - h / 2, w, h, 6);
    g.lineStyle(2, 0x5f5b52, 0.65);
    g.strokeRoundedRect(cx + ox - w / 2, cy + oy - h / 2, w, h, 6);
  }
}

function buildMemorial(scene: SceneLike, cx: number, cy: number) {
  // The visual mass is now actual scene structures rather than floor drawings.
  const mausoleum = addStaticSprite(scene, SHRINE_TX, SHRINE_TY - 3.8, "cottage", 0.82, 0xb7b8b1, 0.3);
  if (mausoleum) {
    mausoleum.setDepth(scene.dsort?.(mausoleum.y + 28) ?? 11);
    mausoleum.setAlpha(0.98);
  }

  // Side chapel / shelter and expedition lean-to use real building sprites when available.
  const leftShelterKey = scene.textures.exists("stall") ? "stall" : "house";
  const rightShelterKey = scene.textures.exists("stall") ? "stall" : "cottage";
  addStaticSprite(scene, SHRINE_TX - 4.2, SHRINE_TY + 0.5, leftShelterKey, 0.68, 0x6f8294, 0.32);
  addStaticSprite(scene, SHRINE_TX + 4.2, SHRINE_TY + 0.65, rightShelterKey, 0.64, 0x8b7657, 0.32);

  // Three upright grave markers, deliberately small and tucked around the mausoleum.
  const markerKey = scene.textures.exists("rest-stone") ? "rest-stone" : "signpost";
  addDecorSprite(scene, SHRINE_TX - 1.7, SHRINE_TY - 0.15, markerKey, 0.62, 0x8f918b, 1);
  addDecorSprite(scene, SHRINE_TX, SHRINE_TY + 0.05, markerKey, 0.62, 0x98998f, 1);
  addDecorSprite(scene, SHRINE_TX + 1.7, SHRINE_TY - 0.15, markerKey, 0.62, 0x8f918b, 1);

  const plaque = scene.add
    .text(cx, cy - 92, "ELARA\nPIP\nMAEVE", {
      fontFamily: "Georgia, serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#efe4b8",
      align: "center",
      stroke: "#4c4b43",
      strokeThickness: 2,
    })
    .setOrigin(0.5)
    .setDepth(30);
  tag(plaque);

  // Low perimeter fence creates a believable memorial courtyard.
  const fenceKey = scene.textures.exists("fence") ? "fence" : null;
  if (fenceKey) {
    for (const [tx, ty] of [
      [12.8, 84.6], [14.0, 84.6], [15.2, 84.6],
      [20.8, 84.6], [22.0, 84.6], [23.2, 84.6],
      [12.8, 80.4], [23.2, 80.4],
    ] as [number, number][]) {
      addStaticSprite(scene, tx, ty, fenceKey, 0.72, 0x7e6b52, 0.5);
    }
  }

  // Lanterns and bench make the area feel intentionally constructed.
  for (const [tx, ty] of [[15.2, 80.7], [20.8, 80.7]] as [number, number][]) {
    const lamp = addStaticSprite(scene, tx, ty, "lamp", 0.72, undefined, 0.22);
    if (lamp) scene.addLight?.(lamp.x, lamp.y - 16, 0.48);
  }
  addStaticSprite(scene, SHRINE_TX - 2.9, SHRINE_TY + 2.6, "bench", 0.72, 0x7c6248, 0.5);
}

function buildCamp(scene: SceneLike, cx: number, cy: number) {
  const g = scene.add.graphics().setDepth(12);
  tag(g);

  // Compact stone fire ring with an actual animated flame/light focal point.
  const fx = cx + 68;
  const fy = cy + 76;
  g.fillStyle(0x4f4c45, 1);
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI * 2 * i) / 10;
    g.fillCircle(fx + Math.cos(a) * 19, fy + Math.sin(a) * 13, 6);
  }
  g.lineStyle(6, 0x553c28, 1);
  g.lineBetween(fx - 15, fy - 7, fx + 15, fy + 8);
  g.lineBetween(fx - 14, fy + 9, fx + 14, fy - 8);
  const flame = scene.add.triangle(fx, fy - 8, 0, 24, 12, 0, 24, 24, 0xffc14d, 1).setOrigin(0.5).setDepth(15);
  tag(flame);
  scene.tweens.add({ targets: flame, scaleY: { from: 0.75, to: 1.12 }, alpha: { from: 0.75, to: 1 }, duration: 360, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  scene.addLight?.(fx, fy - 10, 0.55);

  // Survivor equipment is grouped around the actual shelters rather than painted flat across the clearing.
  const shield = scene.add.graphics().setDepth(14);
  tag(shield);
  shield.fillStyle(0x536b83, 1);
  shield.fillCircle(cx - 83, cy + 56, 15);
  shield.lineStyle(4, 0xc4a55a, 1);
  shield.lineBetween(cx - 94, cy + 45, cx - 72, cy + 67);
  shield.lineBetween(cx - 72, cy + 45, cx - 94, cy + 67);

  const gadget = scene.add.graphics().setDepth(14);
  tag(gadget);
  gadget.fillStyle(0xa8793d, 1);
  gadget.fillRoundedRect(cx - 5, cy + 72, 30, 22, 4);
  gadget.fillStyle(0x2f6672, 1);
  gadget.fillCircle(cx + 5, cy + 83, 6);
  gadget.lineStyle(3, 0x6c4f2c, 1);
  gadget.lineBetween(cx + 22, cy + 75, cx + 34, cy + 64);

  const satchel = scene.add.graphics().setDepth(14);
  tag(satchel);
  satchel.fillStyle(0x755c43, 1);
  satchel.fillRoundedRect(cx + 102, cy + 60, 34, 26, 5);
  satchel.fillStyle(0xe3ddd0, 1);
  satchel.fillRect(cx + 115, cy + 66, 8, 14);
  satchel.fillRect(cx + 112, cy + 69, 14, 8);

  // Bedrolls scaled down 20% and kept near the tents.
  for (const [ox, oy, tint] of [
    [-98, 88, 0x74424d],
    [-5, 108, 0x3e746e],
    [92, 92, 0x687d62],
  ] as [number, number, number][]) {
    const roll = scene.add.rectangle(cx + ox, cy + oy, 42, 14, tint, 0.96).setStrokeStyle(2, 0x403a32, 0.75).setDepth(13);
    tag(roll);
  }
}

function addFlora(scene: SceneLike) {
  const flowers: [number, number, number][] = [
    [13.5, 80.9, 0xffffff], [14.1, 82.2, 0xff8ec4], [15.1, 84.1, 0xb779e8],
    [21.0, 81.0, 0xffffff], [21.8, 82.0, 0xff8ec4], [20.6, 84.0, 0xb779e8],
    [16.2, 79.9, 0xe23a4e], [19.8, 79.8, 0xffffff],
  ];
  for (const [tx, ty, tint] of flowers) addDecorSprite(scene, tx, ty, "flowers", 0.66, tint, -2);
  addShrineButterfly(scene, 14.8, 80.5, 0x8ed45a, 1);
  addShrineButterfly(scene, 20.8, 81.1, 0xf0cf45, 2);
  addShrineButterfly(scene, 17.1, 84.0, 0xa8d96d, 3);
}

function addJournal(scene: SceneLike, cx: number, cy: number) {
  const key = scene.textures.exists("signpost") ? "signpost" : "rest-stone";
  const journal = scene.add
    .sprite(cx, cy + 44, key)
    .setDepth(18)
    .setScale(0.52)
    .setTint(0xb28a5d);
  tag(journal);
  scene.interactables.push({
    obj: journal,
    kind: JOURNAL_KIND,
    id: "fallen-crossing-journal",
    label: "Read the abandoned traveler's journal",
    radius: 82,
    enabled: true,
  });
  scene.tweens.add({
    targets: journal,
    y: journal.y - 2,
    alpha: { from: 0.8, to: 1 },
    duration: 950,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const marker = scene.add
    .text(cx, cy + 12, "!", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "14px",
      fontStyle: "bold",
      color: "#fff1c2",
      backgroundColor: "#1b2230",
      padding: { x: 6, y: 2 },
    })
    .setOrigin(0.5)
    .setDepth(19);
  tag(marker);
  scene.tweens.add({ targets: marker, y: marker.y - 4, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

function buildShrine(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__fallenCrossingShrineBuilt) return;
  scene.__fallenCrossingShrineBuilt = true;

  const { x: cx, y: cy } = world(scene, SHRINE_TX, SHRINE_TY);
  clearShrinePocket(scene, cx, cy);
  buildGround(scene, cx, cy);
  buildMemorial(scene, cx, cy);
  buildCamp(scene, cx, cy);
  addFlora(scene);
  addJournal(scene, cx, cy);
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
    this.time.delayedCall(160, () => buildShrine(this));
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
