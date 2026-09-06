import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const BRIDGE_KEY = "act1-wood-bridge-horizontal";

function buildBridgeTexture(scene: SceneLike) {
  if (scene.textures?.exists?.(BRIDGE_KEY)) return;
  const w = 224;
  const h = 72;
  const tex = scene.textures.createCanvas(BRIDGE_KEY, w, h);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;

  // Shadow under the deck.
  ctx.fillStyle = "rgba(31,22,17,.28)";
  ctx.fillRect(7, 10, w - 14, h - 8);

  // Deck body.
  ctx.fillStyle = "#7a4e2b";
  ctx.fillRect(9, 13, w - 18, h - 18);
  ctx.fillStyle = "#a26b3a";
  ctx.fillRect(11, 15, w - 22, h - 23);

  // Vertical planks across the full river width.
  const plankW = 18;
  for (let x = 12, i = 0; x < w - 12; x += plankW, i++) {
    ctx.fillStyle = i % 2 === 0 ? "#a66d3a" : "#946036";
    ctx.fillRect(x, 16, plankW - 2, h - 26);
    ctx.fillStyle = "rgba(255,220,160,.13)";
    ctx.fillRect(x + 2, 18, 2, h - 31);
    ctx.fillStyle = "rgba(45,26,16,.34)";
    ctx.fillRect(x + plankW - 3, 16, 2, h - 26);
    // Small grain marks so the bridge reads as timber, not a flat rectangle.
    ctx.fillStyle = "rgba(66,38,22,.34)";
    ctx.fillRect(x + 5, 26 + ((i * 7) % 12), 6, 1);
    ctx.fillRect(x + 7, 39 + ((i * 5) % 7), 5, 1);
  }

  // Dark end beams.
  ctx.fillStyle = "#4a301f";
  ctx.fillRect(7, 12, 8, h - 15);
  ctx.fillRect(w - 15, 12, 8, h - 15);

  // Rails run across the entire bridge, matching the approved horizontal design.
  ctx.fillStyle = "#4b3020";
  ctx.fillRect(8, 7, w - 16, 7);
  ctx.fillRect(8, h - 16, w - 16, 7);
  ctx.fillStyle = "#805331";
  ctx.fillRect(10, 8, w - 20, 3);
  ctx.fillRect(10, h - 15, w - 20, 3);
  ctx.fillStyle = "#2e2119";
  ctx.fillRect(9, 15, w - 18, 3);
  ctx.fillRect(9, h - 22, w - 18, 3);

  // Evenly spaced square support posts.
  const posts = [8, 52, 96, 140, 184, 208];
  for (const x of posts) {
    ctx.fillStyle = "#3e2b20";
    ctx.fillRect(x - 5, 3, 11, h - 5);
    ctx.fillStyle = "#7c5433";
    ctx.fillRect(x - 3, 5, 7, h - 9);
    ctx.fillStyle = "#b37a45";
    ctx.fillRect(x - 2, 6, 5, 5);
    ctx.fillStyle = "#2b1f18";
    ctx.fillRect(x - 5, 12, 11, 3);
    ctx.fillRect(x - 5, h - 17, 11, 3);
  }

  // Bolts / joinery details.
  ctx.fillStyle = "#cfaa68";
  for (const x of posts) {
    ctx.fillRect(x - 1, 9, 2, 2);
    ctx.fillRect(x - 1, h - 13, 2, 2);
  }

  tex.refresh();
}

function bridgeWidth(scene: SceneLike) {
  // Act I river is 12 design units wide. Span beyond both banks so no water seam is exposed.
  if (typeof scene.wx === "function") {
    const left = Number(scene.wx(51));
    const right = Number(scene.wx(69));
    const span = Math.abs(right - left);
    if (Number.isFinite(span) && span > 80) return Phaser.Math.Clamp(span, 150, 230);
  }
  return 196;
}

function bridgeHeight(scene: SceneLike) {
  if (typeof scene.wy === "function") {
    const a = Number(scene.wy(48));
    const b = Number(scene.wy(54));
    const span = Math.abs(b - a);
    if (Number.isFinite(span) && span > 30) return Phaser.Math.Clamp(span, 52, 72);
  }
  return 62;
}

function remasterAct1Bridges(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  buildBridgeTexture(scene);
  if (!scene.textures?.exists?.(BRIDGE_KEY)) return;

  const bridges = (scene.children?.list ?? []).filter(
    (obj: any) => obj?.active && obj?.texture?.key === "bridge",
  ) as Phaser.GameObjects.Sprite[];

  const targetW = bridgeWidth(scene);
  const targetH = bridgeHeight(scene);
  for (const bridge of bridges) {
    bridge
      .setTexture(BRIDGE_KEY)
      .setAngle(0)
      .setDisplaySize(targetW, targetH)
      .setOrigin(0.5, 0.5)
      .setAlpha(1)
      .clearTint();
    bridge.setDepth(scene.dsort?.(bridge.y + targetH * 0.28) ?? 6);
    bridge.setData("act1-wood-bridge", true);

    // Small bank shadows help the bridge feel seated into the path instead of pasted over water.
    const shadow = scene.add
      .ellipse(bridge.x, bridge.y + targetH * 0.33, targetW * 0.91, 12, 0x2c261f, 0.16)
      .setDepth(Math.max(2, bridge.depth - 1));
    shadow.setData("act1-wood-bridge", true);
  }
}

export function installAct1WoodenBridges(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__act1WoodenBridgesInstalled) return;
  proto.__act1WoodenBridgesInstalled = true;

  const originalCreate = proto.create;
  proto.create = function act1WoodenBridgeCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(220, () => remasterAct1Bridges(this));
    return result;
  };

  const originalBuildAct1 = proto.buildAct1;
  if (typeof originalBuildAct1 === "function") {
    proto.buildAct1 = function act1WoodenBridgeBuild(this: SceneLike, ...args: any[]) {
      const result = originalBuildAct1.apply(this, args);
      this.time.delayedCall(0, () => remasterAct1Bridges(this));
      return result;
    };
  }
}
