// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type QuestSceneLike = Phaser.Scene & Record<string, any>;
type QuestSceneCtor = { prototype: QuestSceneLike };

const SMALL_FOREST_KEYS = new Set([
  "enemy-distraction",
  "enemy-overwhelm",
  "enemy-rush",
  "enemy-weariness",
]);

const SKIP_REMASTER = new Set(["quest-tiles", "spark", "glow"]);
const MARIA_PREFIXES = ["maria-", "maria-down", "maria-side", "maria-up"];

function clamp255(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function isMariaKey(key: string) {
  return MARIA_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function getCanvasTexture(scene: QuestSceneLike, key: string) {
  if (!scene.textures.exists(key)) return null;
  const texture = scene.textures.get(key) as any;
  const source = texture.getSourceImage?.();
  if (!(source instanceof HTMLCanvasElement)) return null;
  return { texture, canvas: source as HTMLCanvasElement };
}

/**
 * Cohesive premium-JRPG treatment for existing runtime sprite canvases.
 * Texture keys and source sprite names stay exactly the same.
 */
function premiumGrade(scene: QuestSceneLike, key: string, maria = false) {
  const entry = getCanvasTexture(scene, key);
  if (!entry) return;
  const { texture, canvas } = entry;
  if (!canvas.width || !canvas.height) return;

  const src = document.createElement("canvas");
  src.width = canvas.width;
  src.height = canvas.height;
  const sctx = src.getContext("2d");
  const ctx = canvas.getContext("2d");
  if (!sctx || !ctx) return;
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(canvas, 0, 0);

  const image = sctx.getImageData(0, 0, src.width, src.height);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 8) continue;
    let r = data[i]!;
    let g = data[i + 1]!;
    let b = data[i + 2]!;
    const luma = r * 0.299 + g * 0.587 + b * 0.114;

    if (luma < 92) {
      r *= maria ? 0.94 : 0.91;
      g *= maria ? 0.93 : 0.92;
      b *= maria ? 1.03 : 1.07;
    } else if (luma > 176) {
      r = r * 1.025 + (maria ? 6 : 4);
      g = g * 1.01 + 2;
      b = b * 0.985 + (maria ? 2 : 0);
    } else {
      r *= 0.985;
      g *= 0.99;
      b *= 1.005;
    }

    const avg = (r + g + b) / 3;
    const sat = maria ? 0.94 : 0.91;
    r = avg + (r - avg) * sat;
    g = avg + (g - avg) * sat;
    b = avg + (b - avg) * sat;

    data[i] = clamp255(r);
    data[i + 1] = clamp255(g);
    data[i + 2] = clamp255(b);
  }
  sctx.putImageData(image, 0, 0);

  const silhouette = document.createElement("canvas");
  silhouette.width = src.width;
  silhouette.height = src.height;
  const octx = silhouette.getContext("2d");
  if (!octx) return;
  octx.imageSmoothingEnabled = false;
  octx.drawImage(src, 0, 0);
  octx.globalCompositeOperation = "source-in";
  octx.fillStyle = maria ? "#3a2639" : "#202538";
  octx.fillRect(0, 0, src.width, src.height);
  octx.globalCompositeOperation = "source-over";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.globalAlpha = maria ? 0.72 : 0.82;
  for (const [ox, oy] of [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const) {
    ctx.drawImage(silhouette, ox, oy);
  }
  ctx.globalAlpha = 1;
  ctx.drawImage(src, 0, 0);

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const p = pixels.data;
  for (let y = 1; y < canvas.height; y++) {
    for (let x = 1; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      if (p[i + 3]! < 80) continue;
      const up = ((y - 1) * canvas.width + x) * 4;
      const left = (y * canvas.width + x - 1) * 4;
      if (p[up + 3]! < 20 || p[left + 3]! < 20) {
        p[i] = clamp255(p[i]! + (maria ? 13 : 8));
        p[i + 1] = clamp255(p[i + 1]! + (maria ? 9 : 7));
        p[i + 2] = clamp255(p[i + 2]! + (maria ? 10 : 9));
      }
    }
  }
  ctx.putImageData(pixels, 0, 0);
  texture.refresh?.();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, flip = false) {
  ctx.fillStyle = "#7f9b55";
  ctx.fillRect(x, y, 4, 2);
  ctx.fillStyle = "#a8bf6b";
  ctx.fillRect(x + (flip ? 0 : 1), y - 2, 3, 2);
  ctx.fillStyle = "#536b3f";
  ctx.fillRect(x + (flip ? 3 : 0), y + 1, 1, 2);
}

function drawForestSpirit(scene: QuestSceneLike, key: string) {
  const entry = getCanvasTexture(scene, key);
  if (!entry) return;
  const { texture, canvas } = entry;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const palettes: Record<string, { bark: string; dark: string; leaf: string; glow: string }> = {
    "enemy-distraction": { bark: "#6f5a49", dark: "#342f35", leaf: "#8ba861", glow: "#ef9fc4" },
    "enemy-overwhelm": { bark: "#61516d", dark: "#302b3b", leaf: "#78915b", glow: "#dca4f1" },
    "enemy-rush": { bark: "#795348", dark: "#382d30", leaf: "#9a9850", glow: "#f09a87" },
    "enemy-weariness": { bark: "#58624e", dark: "#29342f", leaf: "#7ea16d", glow: "#9fcdb6" },
  };
  const c = palettes[key] ?? palettes["enemy-distraction"]!;

  ctx.fillStyle = c.dark;
  ctx.fillRect(5, 17, 5, 2);
  ctx.fillRect(12, 17, 5, 2);
  ctx.fillRect(3, 19, 6, 2);
  ctx.fillRect(13, 19, 6, 2);

  ctx.fillStyle = c.dark;
  ctx.fillRect(5, 7, 12, 11);
  ctx.fillRect(7, 5, 8, 15);
  ctx.fillStyle = c.bark;
  ctx.fillRect(6, 8, 10, 8);
  ctx.fillRect(8, 6, 6, 11);
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  ctx.fillRect(8, 7, 2, 7);
  ctx.fillRect(11, 6, 1, 4);

  ctx.fillStyle = c.dark;
  ctx.fillRect(8, 2, 2, 6);
  ctx.fillRect(13, 1, 2, 7);
  ctx.fillRect(6, 3, 3, 2);
  ctx.fillRect(14, 3, 3, 2);
  ctx.fillStyle = c.leaf;
  ctx.fillRect(3, 2, 5, 3);
  ctx.fillRect(15, 1, 4, 3);
  ctx.fillStyle = "#b8c77b";
  ctx.fillRect(4, 1, 3, 2);
  ctx.fillRect(16, 0, 2, 2);

  ctx.fillStyle = c.glow;
  ctx.fillRect(8, 10, 2, 2);
  ctx.fillRect(13, 10, 2, 2);
  ctx.fillStyle = "#fff1f7";
  ctx.fillRect(9, 10, 1, 1);
  ctx.fillRect(14, 10, 1, 1);
  ctx.fillStyle = c.dark;
  ctx.fillRect(10, 14, 3, 1);

  texture.refresh?.();
}

function drawRootGuardian(scene: QuestSceneLike) {
  const entry = getCanvasTexture(scene, "enemy-brute");
  if (!entry) return;
  const { texture, canvas } = entry;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const barkDark = "#2b302a";
  const bark = "#635744";
  const barkLight = "#89755a";
  const moss = "#62774c";
  const leaf = "#8fa263";
  const glow = "#ed7fb2";

  ctx.fillStyle = barkDark;
  ctx.fillRect(6, 34, 14, 5);
  ctx.fillRect(24, 34, 14, 5);
  ctx.fillRect(2, 39, 17, 4);
  ctx.fillRect(25, 39, 17, 4);

  ctx.fillStyle = barkDark;
  ctx.fillRect(10, 11, 24, 27);
  ctx.fillRect(5, 17, 9, 17);
  ctx.fillRect(30, 17, 9, 17);
  ctx.fillStyle = bark;
  ctx.fillRect(12, 13, 20, 23);
  ctx.fillRect(7, 19, 7, 13);
  ctx.fillRect(30, 19, 7, 13);
  ctx.fillStyle = barkLight;
  ctx.fillRect(14, 15, 4, 17);
  ctx.fillRect(28, 18, 2, 13);

  ctx.fillStyle = barkDark;
  ctx.fillRect(12, 4, 4, 12);
  ctx.fillRect(28, 3, 4, 13);
  ctx.fillRect(8, 2, 4, 8);
  ctx.fillRect(33, 1, 4, 10);
  ctx.fillRect(5, 5, 8, 3);
  ctx.fillRect(31, 6, 9, 3);
  drawLeaf(ctx, 3, 1);
  drawLeaf(ctx, 34, 1, true);
  drawLeaf(ctx, 10, 5);
  drawLeaf(ctx, 29, 7, true);

  ctx.fillStyle = moss;
  ctx.fillRect(8, 15, 9, 4);
  ctx.fillRect(27, 14, 9, 4);
  ctx.fillRect(15, 31, 14, 4);
  ctx.fillStyle = leaf;
  ctx.fillRect(9, 14, 4, 2);
  ctx.fillRect(31, 13, 4, 2);
  ctx.fillStyle = "#f2a7c5";
  ctx.fillRect(6, 12, 2, 2);
  ctx.fillRect(36, 10, 2, 2);
  ctx.fillRect(33, 28, 2, 2);

  ctx.fillStyle = "#4a3142";
  ctx.fillRect(17, 19, 11, 10);
  ctx.fillStyle = glow;
  ctx.fillRect(19, 20, 7, 7);
  ctx.fillRect(18, 22, 9, 3);
  ctx.fillStyle = "#ffd6e8";
  ctx.fillRect(21, 21, 2, 5);
  ctx.fillRect(23, 24, 2, 2);

  ctx.fillStyle = "#f3cadb";
  ctx.fillRect(17, 15, 3, 2);
  ctx.fillRect(25, 15, 3, 2);
  ctx.fillStyle = barkDark;
  ctx.fillRect(18, 16, 2, 1);
  ctx.fillRect(25, 16, 2, 1);

  texture.refresh?.();
}

function remasterAllRuntimeSprites(scene: QuestSceneLike) {
  const list = (scene.textures as any).list as Record<string, any> | undefined;
  if (!list) return;
  for (const key of Object.keys(list)) {
    if (key.startsWith("__") || key.startsWith("art-") || SKIP_REMASTER.has(key)) continue;
    if (SMALL_FOREST_KEYS.has(key) || key === "enemy-brute") continue;
    premiumGrade(scene, key, isMariaKey(key));
  }
  for (const key of SMALL_FOREST_KEYS) drawForestSpirit(scene, key);
}

export function installVisualRemaster(QuestScene: QuestSceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__visualRemasterInstalled) return;
  proto.__visualRemasterInstalled = true;

  const originalCreate = proto.create;
  proto.create = function remasteredCreate(this: QuestSceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);

    remasterAllRuntimeSprites(this);

    const player = this.player as Phaser.Physics.Arcade.Sprite | undefined;
    if (player?.active) {
      player.setData("visualRemasterMaria", true);
      player.setData("visualRemasterScale", 1.145);
    }

    if (this.enemies && this.solidDecor) {
      this.physics.add.collider(this.enemies, this.solidDecor);
    }
    for (const enemy of (this.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[]) {
      const body = enemy.body as Phaser.Physics.Arcade.Body | null;
      body?.setCollideWorldBounds(true);
    }

    return result;
  };

  const originalSpawnEnemy = proto.spawnEnemy;
  proto.spawnEnemy = function remasteredSpawnEnemy(this: QuestSceneLike, ...args: any[]) {
    const enemy = originalSpawnEnemy.apply(this, args) as Phaser.Physics.Arcade.Sprite | null;
    if (!enemy) return enemy;
    const key = String(args[2] ?? enemy.texture.key);
    const body = enemy.body as Phaser.Physics.Arcade.Body | null;
    body?.setCollideWorldBounds(true);

    if (SMALL_FOREST_KEYS.has(key)) {
      drawForestSpirit(this, key);
      enemy.setData("forestSpirit", true);
    } else if (key === "enemy-brute") {
      drawRootGuardian(this);
      enemy.setData("rootGuardian", true);
    }
    return enemy;
  };

  const originalUpdate = proto.update;
  proto.update = function remasteredUpdate(this: QuestSceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);

    const player = this.player as Phaser.Physics.Arcade.Sprite | undefined;
    if (!this.frozen && player?.active && player.getData("visualRemasterMaria")) {
      const boost = (player.getData("visualRemasterScale") as number) ?? 1.145;
      player.scaleX *= boost;
      player.scaleY *= boost;
    }

    const enemies = (this.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[];
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const body = enemy.body as Phaser.Physics.Arcade.Body | null;
      body?.setCollideWorldBounds(true);

      if (enemy.getData("forestSpirit") === true) {
        const vx = body?.velocity.x ?? 0;
        enemy.setFlipX(vx < -2);
        const sway = Math.sin(time / 165 + enemy.x * 0.017);
        enemy.setAngle(sway * 1.8);
        enemy.setScale(1 + Math.abs(sway) * 0.018, 1 - Math.abs(sway) * 0.012);
      }
    }
    return result;
  };
}
