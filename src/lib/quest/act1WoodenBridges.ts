// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
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

  // Deck shadow and body run cleanly into both banks so the entrances feel open.
  ctx.fillStyle = "rgba(31,22,17,.24)";
  ctx.fillRect(0, 13, w, h - 20);
  ctx.fillStyle = "#7a4e2b";
  ctx.fillRect(0, 14, w, h - 22);
  ctx.fillStyle = "#a26b3a";
  ctx.fillRect(0, 16, w, h - 26);

  const plankW = 18;
  for (let x = 0, i = 0; x < w; x += plankW, i++) {
    ctx.fillStyle = i % 2 === 0 ? "#a66d3a" : "#946036";
    ctx.fillRect(x, 16, Math.min(plankW - 2, w - x), h - 26);
    ctx.fillStyle = "rgba(255,220,160,.13)";
    ctx.fillRect(x + 2, 18, 2, h - 31);
    ctx.fillStyle = "rgba(45,26,16,.34)";
    ctx.fillRect(Math.min(w - 2, x + plankW - 3), 16, 2, h - 26);
    ctx.fillStyle = "rgba(66,38,22,.34)";
    ctx.fillRect(x + 5, 26 + ((i * 7) % 12), 6, 1);
    ctx.fillRect(x + 7, 39 + ((i * 5) % 7), 5, 1);
  }

  // Side rails deliberately begin inside the bridge instead of blocking the entrances.
  const railInset = 22;
  const railW = w - railInset * 2;
  ctx.fillStyle = "#4b3020";
  ctx.fillRect(railInset, 7, railW, 7);
  ctx.fillRect(railInset, h - 16, railW, 7);
  ctx.fillStyle = "#805331";
  ctx.fillRect(railInset + 2, 8, railW - 4, 3);
  ctx.fillRect(railInset + 2, h - 15, railW - 4, 3);
  ctx.fillStyle = "#2e2119";
  ctx.fillRect(railInset + 1, 15, railW - 2, 3);
  ctx.fillRect(railInset + 1, h - 22, railW - 2, 3);

  // Interior support posts only — no closed end posts or end beams.
  const posts = [28, 66, 104, 142, 180, 196];
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

  ctx.fillStyle = "#cfaa68";
  for (const x of posts) {
    ctx.fillRect(x - 1, 9, 2, 2);
    ctx.fillRect(x - 1, h - 13, 2, 2);
  }

  tex.refresh();
}

function bridgeWidth(scene: SceneLike) {
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
    (obj: any) => obj?.active && (obj?.texture?.key === "bridge" || obj?.getData?.("act1-wood-bridge") === true),
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

    // Keep the bridge floor beneath Maria so she stays visible while crossing.
    bridge.setDepth(4);
    bridge.setData("act1-wood-bridge", true);

    const shadow = scene.add
      .ellipse(bridge.x, bridge.y + targetH * 0.33, targetW * 0.91, 12, 0x2c261f, 0.14)
      .setDepth(3);
    shadow.setData("act1-wood-bridge-shadow", true);
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
