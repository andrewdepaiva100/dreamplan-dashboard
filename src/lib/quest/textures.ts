import * as Phaser from "phaser";

export const TILE = 32;
export const HD = 2;

/** Tile indices used by every generated map. */
export const T = {
  GREY: 0,
  BLOOM: 1,
  WATER: 2,
  WALL: 3,
  MARBLE: 4,
  HEDGE: 5,
  VOID: 6,
  CANDLE: 7,
  PATH: 8,
  SKY: 9,
} as const;

export const SOLID_TILES = [T.WALL, T.HEDGE, T.VOID];
export const TILE_COUNT = 10;

function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function grad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  colorFrom: string,
  colorTo: string,
  vertical = true,
) {
  const g = ctx.createLinearGradient(x, y, vertical ? x : x + w, vertical ? y + h : y);
  g.addColorStop(0, colorFrom);
  g.addColorStop(1, colorTo);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function noise(
  ctx: CanvasRenderingContext2D,
  ox: number,
  colors: string[],
  seed: number,
  density = 26,
) {
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = 0; i < density; i++) {
    const x = Math.floor(rnd() * TILE);
    const y = Math.floor(rnd() * TILE);
    const c = colors[Math.floor(rnd() * colors.length)]!;
    px(ctx, ox + x, y, 2, 2, c);
  }
}

/** Builds the shared tileset strip texture (one row of TILE_COUNT tiles). */
export function buildTileset(scene: Phaser.Scene, key = "quest-tiles") {
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, TILE * HD * TILE_COUNT, TILE * HD)!;
  const ctx = tex.getContext();
  ctx.save();
  ctx.scale(HD, HD);

  // 0 grey "Noise of Life"
  grad(ctx, T.GREY * TILE, 0, TILE, TILE, "#7a7f8a", "#5d626d", true);
  noise(ctx, T.GREY * TILE, ["#5d626d", "#8f95a3", "#565b66"], 7, 38);

  // 1 blooming grass
  grad(ctx, T.BLOOM * TILE, 0, TILE, TILE, "#4caf7a", "#3a8f5e", true);
  noise(ctx, T.BLOOM * TILE, ["#6fcf92", "#2f7f47", "#ffd7e5", "#f9e28a"], 13, 48);

  // 2 water
  grad(ctx, T.WATER * TILE, 0, TILE, TILE, "#4a9de8", "#2165a8", true);
  noise(ctx, T.WATER * TILE, ["#74baf7", "#1f5fa8", "#e0f2ff"], 21, 30);

  // 3 stone wall
  grad(ctx, T.WALL * TILE, 0, TILE, TILE, "#9e9886", "#7a7565", true);
  for (let y = 0; y < TILE; y += 8) {
    px(ctx, T.WALL * TILE, y, TILE, 1, "#6e6858");
    px(ctx, T.WALL * TILE + ((y / 8) % 2 === 0 ? 10 : 22), y, 1, 8, "#6e6858");
  }

  // 4 marble
  grad(ctx, T.MARBLE * TILE, 0, TILE, TILE, "#f7f0e6", "#e2dacd", true);
  px(ctx, T.MARBLE * TILE, 0, TILE, 1, "#d8cfc0");
  px(ctx, T.MARBLE * TILE, 0, 1, TILE, "#d8cfc0");
  noise(ctx, T.MARBLE * TILE, ["#e2dacd", "#fffbf5"], 5, 14);

  // 5 hedge
  grad(ctx, T.HEDGE * TILE, 0, TILE, TILE, "#2a8a4d", "#15522c", true);
  noise(ctx, T.HEDGE * TILE, ["#3aa85e", "#1b6b3c", "#ffd7e5"], 33, 50);

  // 6 void / cloud edge
  grad(ctx, T.VOID * TILE, 0, TILE, TILE, "#1e2647", "#0d1226", true);
  noise(ctx, T.VOID * TILE, ["#2f3b6e", "#0d1226"], 41, 22);

  // 7 candlelit floor
  grad(ctx, T.CANDLE * TILE, 0, TILE, TILE, "#4a3757", "#2d2136", true);
  noise(ctx, T.CANDLE * TILE, ["#5a4369", "#2d2136", "#c9a24b"], 55, 24);

  // 8 sand path
  grad(ctx, T.PATH * TILE, 0, TILE, TILE, "#e4cf9f", "#c8ae83", true);
  noise(ctx, T.PATH * TILE, ["#c8ae83", "#f3e6c5"], 67, 28);

  // 9 star sky
  grad(ctx, T.SKY * TILE, 0, TILE, TILE, "#25306e", "#10153a", true);
  noise(ctx, T.SKY * TILE, ["#4a5aa0", "#ffffff", "#c9a24b"], 71, 18);

  ctx.restore();
  tex.refresh();
  return key;
}

type Draw = (ctx: CanvasRenderingContext2D) => void;

function sprite(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  ctx.save();
  ctx.scale(HD, HD);
  draw(ctx);
  ctx.restore();
  tex.refresh();
}

/** All character / object sprites, drawn procedurally as crisp HD canvas art. */
export function buildSprites(scene: Phaser.Scene) {
  // ---- MARIA ------------------------------------------------------------
  const maria = (key: string, step: number) =>
    sprite(scene, key, 24, 34, (c) => {
      const legY = 26 + (step === 1 ? -1 : 0);
      // hair back (long, dark brown)
      grad(c, 5, 3, 14, 20, "#4a2c1d", "#3b2318", true);
      // face
      circle(c, 12, 9, 5, "#f0cdb2");
      // fringe
      grad(c, 7, 3, 10, 4, "#5a3a28", "#4a2c1d", true);
      px(c, 6, 6, 2, 6, "#3b2318");
      px(c, 16, 6, 2, 6, "#3b2318");
      // eyes
      px(c, 10, 9, 1, 2, "#2a1b12");
      px(c, 13, 9, 1, 2, "#2a1b12");
      // puff sleeves
      grad(c, 3, 14, 5, 5, "#ffffff", "#f2ece4", true);
      grad(c, 16, 14, 5, 5, "#ffffff", "#f2ece4", true);
      // bodice
      grad(c, 7, 13, 10, 8, "#ffffff", "#efe6dc", true);
      px(c, 7, 13, 10, 1, "#efe6dc");
      // tiered midi skirt
      grad(c, 5, 21, 14, 4, "#ffffff", "#f7f3ee", true);
      grad(c, 4, 24, 16, 3, "#f7f3ee", "#e6dccf", true);
      px(c, 5, 21, 14, 1, "#e6dccf");
      px(c, 4, 24, 16, 1, "#e6dccf");
      // arms
      grad(c, 4, 18, 3, 4, "#f0cdb2", "#e9bd9b", true);
      grad(c, 17, 18, 3, 4, "#f0cdb2", "#e9bd9b", true);
      // platform wedge sandals
      grad(c, 6, legY + 1, 4, 4, "#f2e0c2", "#e8d3b4", true);
      grad(c, 14, legY + 1, 4, 4, "#f2e0c2", "#e8d3b4", true);
      grad(c, 6, legY + 4, 4, 2, "#d4b88e", "#c8ab84", true);
      grad(c, 14, legY + 4, 4, 2, "#d4b88e", "#c8ab84", true);
      // glowing red rose bouquet
      grad(c, 18, 19, 5, 5, "#2d8a4d", "#1f6b3c", true);
      grad(c, 17, 17, 3, 3, "#d61f2c", "#b3121f", true);
      grad(c, 20, 18, 3, 3, "#e63a45", "#d61f2c", true);
      grad(c, 18, 20, 3, 3, "#9c0f1a", "#8e0c18", true);
      px(c, 19, 18, 1, 1, "#ff8f9c");
    });
  maria("maria-0", 0);
  maria("maria-1", 1);

  // ---- ANDREW -----------------------------------------------------------
  sprite(scene, "andrew", 24, 34, (c) => {
    // curtain hair, middle part
    grad(c, 6, 2, 12, 6, "#4a2c1d", "#3b2318", true);
    px(c, 5, 4, 3, 8, "#3b2318");
    px(c, 16, 4, 3, 8, "#3b2318");
    px(c, 11, 2, 2, 4, "#f0cdb2");
    // face
    circle(c, 12, 10, 5, "#e9bd9b");
    px(c, 10, 10, 1, 2, "#2a1b12");
    px(c, 13, 10, 1, 2, "#2a1b12");
    // white unbuttoned collar shirt
    grad(c, 6, 14, 12, 10, "#ffffff", "#f2ece4", true);
    px(c, 11, 14, 2, 9, "#e5dfd6");
    px(c, 8, 14, 2, 3, "#f2ece4");
    px(c, 14, 14, 2, 3, "#f2ece4");
    // chest showing between the open collar
    px(c, 11, 16, 2, 4, "#e9bd9b");
    // arms + wristwatch
    grad(c, 4, 15, 3, 8, "#ffffff", "#f2ece4", true);
    grad(c, 17, 15, 3, 8, "#ffffff", "#f2ece4", true);
    grad(c, 4, 22, 3, 3, "#e9bd9b", "#dcaa88", true);
    grad(c, 17, 22, 3, 3, "#e9bd9b", "#dcaa88", true);
    px(c, 17, 22, 3, 1, "#151515");
    // charcoal trousers
    grad(c, 7, 24, 10, 6, "#2f333d", "#23252c", true);
    px(c, 11, 24, 1, 6, "#171920");
    // dress shoes
    grad(c, 6, 30, 5, 3, "#1c1f25", "#111318", true);
    grad(c, 13, 30, 5, 3, "#1c1f25", "#111318", true);
  });

  // ---- ANDREW CEREMONY (at altar) ---------------------------------------
  sprite(scene, "andrew-ceremony", 24, 34, (c) => {
    // hair
    grad(c, 6, 2, 12, 6, "#4a2c1d", "#3b2318", true);
    px(c, 5, 4, 3, 8, "#3b2318");
    px(c, 16, 4, 3, 8, "#3b2318");
    // face
    circle(c, 12, 10, 5, "#e9bd9b");
    px(c, 10, 10, 1, 2, "#2a1b12");
    px(c, 13, 10, 1, 2, "#2a1b12");
    // navy suit jacket
    grad(c, 4, 14, 16, 12, "#1a3a6b", "#123a6b", true);
    grad(c, 11, 14, 2, 12, "#ffffff", "#f2ece4", true);
    // white shirt collar
    px(c, 8, 14, 2, 3, "#ffffff");
    px(c, 14, 14, 2, 3, "#ffffff");
    // arms
    grad(c, 4, 22, 3, 6, "#1a3a6b", "#123a6b", true);
    grad(c, 17, 22, 3, 6, "#1a3a6b", "#123a6b", true);
    grad(c, 4, 28, 3, 3, "#e9bd9b", "#dcaa88", true);
    grad(c, 17, 28, 3, 3, "#e9bd9b", "#dcaa88", true);
    // trousers
    grad(c, 7, 26, 10, 6, "#2f333d", "#23252c", true);
    // shoes
    grad(c, 6, 31, 5, 3, "#1c1f25", "#111318", true);
    grad(c, 13, 31, 5, 3, "#1c1f25", "#111318", true);
  });

  // ---- ENEMIES ----------------------------------------------------------
  const blob = (key: string, color: string, dark: string) =>
    sprite(scene, key, 22, 22, (c) => {
      const g = c.createRadialGradient(11, 11, 2, 11, 11, 10);
      g.addColorStop(0, color);
      g.addColorStop(1, dark);
      c.fillStyle = g;
      c.beginPath();
      c.arc(11, 11, 10, 0, Math.PI * 2);
      c.fill();
      px(c, 6, 8, 3, 4, "#ffffff");
      px(c, 13, 8, 3, 4, "#ffffff");
      px(c, 7, 9, 1, 2, dark);
      px(c, 14, 9, 1, 2, dark);
      px(c, 7, 15, 8, 1, dark);
    });
  blob("enemy-distraction", "#9ba0ad", "#3a3d47");
  blob("enemy-overwhelm", "#7d6cb0", "#2c2447");
  blob("enemy-rush", "#b56a62", "#3c1f1c");
  blob("enemy-weariness", "#5f7080", "#1d262e");

  sprite(scene, "spectre", 48, 48, (c) => {
    const g = c.createRadialGradient(24, 22, 4, 24, 22, 20);
    g.addColorStop(0, "#5a4f78");
    g.addColorStop(1, "#2b2540");
    c.fillStyle = g;
    c.beginPath();
    c.arc(24, 22, 20, 0, Math.PI * 2);
    c.fill();
    grad(c, 10, 40, 28, 6, "#3b3350", "#2b2540", true);
    px(c, 14, 16, 7, 8, "#ffffff");
    px(c, 27, 16, 7, 8, "#ffffff");
    px(c, 16, 18, 3, 4, "#c11f2c");
    px(c, 29, 18, 3, 4, "#c11f2c");
  });

  // ---- PICKUPS / PROPS --------------------------------------------------
  sprite(scene, "petal", 10, 10, (c) => {
    const g = c.createRadialGradient(5, 5, 1, 5, 5, 4);
    g.addColorStop(0, "#ff8f9c");
    g.addColorStop(1, "#d61f2c");
    c.fillStyle = g;
    c.beginPath();
    c.ellipse(5, 5, 4, 3, Math.PI / 4, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "spark", 6, 6, (c) => {
    const g = c.createRadialGradient(3, 3, 0.5, 3, 3, 3);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#fff0bf");
    c.fillStyle = g;
    c.beginPath();
    c.arc(3, 3, 3, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "butterfly", 16, 12, (c) => {
    grad(c, 7, 2, 2, 8, "#5c4030", "#4a3324", true);
    const wg = c.createRadialGradient(4, 4, 1, 4, 4, 4);
    wg.addColorStop(0, "#ffd7e5");
    wg.addColorStop(1, "#f7c6d9");
    c.fillStyle = wg;
    c.beginPath();
    c.ellipse(4, 4, 4, 3, 0, 0, Math.PI * 2);
    c.ellipse(12, 4, 4, 3, 0, 0, Math.PI * 2);
    c.fill();
    const yg = c.createRadialGradient(4, 9, 0.5, 4, 9, 3);
    yg.addColorStop(0, "#e6c672");
    yg.addColorStop(1, "#c9a24b");
    c.fillStyle = yg;
    c.beginPath();
    c.ellipse(4, 9, 3, 2, 0, 0, Math.PI * 2);
    c.ellipse(12, 9, 3, 2, 0, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "relic", 22, 26, (c) => {
    grad(c, 6, 2, 10, 3, "#e6c672", "#c9a24b", true);
    grad(c, 4, 5, 14, 16, "#fff6d8", "#f0d68a", true);
    grad(c, 6, 7, 10, 12, "#ffffff", "#fff6d8", true);
    grad(c, 4, 21, 14, 3, "#e6c672", "#c9a24b", true);
    grad(c, 9, 10, 4, 6, "#c9a24b", "#a8832f", true);
  });

  sprite(scene, "envelope", 24, 18, (c) => {
    grad(c, 0, 0, 24, 18, "#fffdf5", "#fff6e8", true);
    px(c, 0, 0, 24, 1, "#c9a24b");
    px(c, 0, 17, 24, 1, "#c9a24b");
    c.strokeStyle = "#c9a24b";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(12, 10);
    c.lineTo(24, 0);
    c.stroke();
    grad(c, 10, 8, 4, 4, "#d61f2c", "#b3121f", true);
  });

  sprite(scene, "key", 18, 14, (c) => {
    grad(c, 1, 5, 10, 4, "#e6c672", "#c9a24b", true);
    grad(c, 11, 3, 6, 8, "#f0d68a", "#e6c672", true);
    px(c, 13, 5, 2, 4, "#8a6a26");
    grad(c, 3, 9, 2, 3, "#c9a24b", "#a8832f", true);
    grad(c, 7, 9, 2, 3, "#c9a24b", "#a8832f", true);
  });

  sprite(scene, "block", 30, 30, (c) => {
    grad(c, 0, 0, 30, 30, "#a9a090", "#8d8776", true);
    px(c, 0, 0, 30, 3, "#bdb4a0");
    px(c, 0, 27, 30, 3, "#7a7263");
    grad(c, 4, 4, 22, 22, "#9c9382", "#8d8776", true);
  });

  sprite(scene, "plate", 30, 30, (c) => {
    const g = c.createRadialGradient(15, 15, 3, 15, 15, 13);
    g.addColorStop(0, "#fff0bf");
    g.addColorStop(1, "#c9a24b");
    c.fillStyle = g;
    c.beginPath();
    c.arc(15, 15, 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fffdf5";
    c.beginPath();
    c.arc(15, 15, 8, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "rest-stone", 28, 24, (c) => {
    grad(c, 2, 8, 24, 14, "#b9b2a3", "#a9a396", true);
    grad(c, 5, 4, 18, 6, "#cdc6b6", "#c4bfb2", true);
    grad(c, 9, 11, 10, 6, "#c9a24b", "#a8832f", true);
    px(c, 11, 13, 6, 2, "#fff6d8");
  });

  sprite(scene, "sheet", 18, 20, (c) => {
    grad(c, 0, 0, 18, 20, "#fffdf5", "#f7f3ee", true);
    px(c, 2, 4, 14, 1, "#5b5b5b");
    px(c, 2, 8, 14, 1, "#5b5b5b");
    px(c, 2, 12, 14, 1, "#5b5b5b");
    grad(c, 5, 6, 3, 6, "#1a4a85", "#123a6b", true);
    grad(c, 11, 3, 3, 8, "#1a4a85", "#123a6b", true);
  });

  sprite(scene, "pillar", 26, 44, (c) => {
    grad(c, 6, 36, 14, 6, "#e0e7ff", "#cfd6ff", true);
    grad(c, 8, 6, 10, 30, "#a8baff", "#8fa6ff", true);
    grad(c, 10, 8, 6, 26, "#e8edff", "#d7e0ff", true);
    grad(c, 11, 0, 4, 8, "#e6c672", "#c9a24b", true);
  });

  sprite(scene, "stone-memory", 30, 30, (c) => {
    grad(c, 3, 6, 24, 22, "#c4bdb0", "#b9b2a3", true);
    grad(c, 7, 2, 16, 8, "#d6cfbe", "#cdc6b6", true);
    grad(c, 9, 12, 12, 10, "#1a4a85", "#123a6b", true);
    grad(c, 11, 14, 8, 6, "#c9a24b", "#a8832f", true);
  });

  sprite(scene, "vault-door", 40, 52, (c) => {
    grad(c, 0, 0, 40, 52, "#6b5339", "#5a4630", true);
    grad(c, 4, 4, 32, 44, "#8a6d49", "#7a5f3f", true);
    grad(c, 16, 22, 8, 8, "#e6c672", "#c9a24b", true);
    grad(c, 6, 6, 28, 2, "#e6c672", "#c9a24b", true);
    grad(c, 6, 44, 28, 2, "#e6c672", "#c9a24b", true);
  });

  sprite(scene, "gateway", 44, 56, (c) => {
    grad(c, 2, 10, 8, 46, "#e6c672", "#c9a24b", true);
    grad(c, 34, 10, 8, 46, "#e6c672", "#c9a24b", true);
    grad(c, 2, 4, 40, 8, "#fff0bf", "#e6c672", true);
    c.fillStyle = "rgba(255,246,216,0.55)";
    c.fillRect(10, 12, 24, 44);
  });

  sprite(scene, "heart-pickup", 16, 14, (c) => {
    const g = c.createRadialGradient(8, 6, 1, 8, 6, 6);
    g.addColorStop(0, "#ff8f9c");
    g.addColorStop(1, "#d61f2c");
    c.fillStyle = g;
    c.beginPath();
    c.arc(5, 5, 4, 0, Math.PI * 2);
    c.arc(11, 5, 4, 0, Math.PI * 2);
    c.moveTo(1, 6);
    c.lineTo(8, 13);
    c.lineTo(15, 6);
    c.fill();
  });

  sprite(scene, "golden-heart", 26, 24, (c) => {
    const g = c.createRadialGradient(13, 10, 2, 13, 10, 11);
    g.addColorStop(0, "#fff0bf");
    g.addColorStop(1, "#c9a24b");
    c.fillStyle = g;
    c.beginPath();
    c.arc(8, 8, 7, 0, Math.PI * 2);
    c.arc(18, 8, 7, 0, Math.PI * 2);
    c.moveTo(1, 10);
    c.lineTo(13, 23);
    c.lineTo(25, 10);
    c.fill();
  });

  sprite(scene, "arbor", 40, 44, (c) => {
    grad(c, 2, 12, 6, 32, "#2b8a4d", "#1f6b3c", true);
    grad(c, 32, 12, 6, 32, "#2b8a4d", "#1f6b3c", true);
    grad(c, 2, 6, 36, 8, "#3aa85e", "#2b8a4d", true);
    for (let i = 0; i < 10; i++) px(c, 4 + i * 3, 4 + (i % 3) * 3, 3, 3, "#ffd7e5");
  });

  sprite(scene, "guest", 20, 30, (c) => {
    grad(c, 6, 2, 8, 7, "#4a2c1d", "#3b2318", true);
    circle(c, 10, 11, 4, "#e9bd9b");
    grad(c, 4, 14, 12, 12, "#1a4a85", "#123a6b", true);
    grad(c, 6, 26, 4, 3, "#2a2a2a", "#1c1c1c", true);
    grad(c, 11, 26, 4, 3, "#2a2a2a", "#1c1c1c", true);
  });

  // ---- REALM GUIDE NPC --------------------------------------------------
  sprite(scene, "guide", 22, 32, (c) => {
    // hooded cloak
    grad(c, 4, 6, 14, 22, "#6b4c7a", "#4a3757", true);
    // lantern face
    circle(c, 11, 8, 5, "#f0cdb2");
    px(c, 9, 7, 1, 2, "#2a1b12");
    px(c, 12, 7, 1, 2, "#2a1b12");
    // golden lantern
    grad(c, 16, 16, 5, 8, "#fff0bf", "#c9a24b", true);
    grad(c, 17, 14, 3, 2, "#e6c672", "#c9a24b", true);
    // hands
    grad(c, 6, 24, 3, 3, "#f0cdb2", "#e9bd9b", true);
    grad(c, 13, 24, 3, 3, "#f0cdb2", "#e9bd9b", true);
    // boots
    grad(c, 5, 28, 5, 4, "#3b2318", "#2a1b12", true);
    grad(c, 12, 28, 5, 4, "#3b2318", "#2a1b12", true);
  });

  // ---- SIGNPOST ---------------------------------------------------------
  sprite(scene, "signpost", 24, 32, (c) => {
    // post
    grad(c, 10, 4, 4, 28, "#8a6d49", "#5a4630", true);
    // base
    grad(c, 6, 28, 12, 4, "#7a7565", "#5c574b", true);
    // sign board
    grad(c, 2, 6, 20, 10, "#fffdf5", "#f7f0e6", true);
    px(c, 2, 6, 20, 1, "#c9a24b");
    px(c, 2, 15, 20, 1, "#c9a24b");
    // arrow
    c.fillStyle = "#c9a24b";
    c.beginPath();
    c.moveTo(8, 10);
    c.lineTo(14, 10);
    c.lineTo(12, 8);
    c.lineTo(18, 11);
    c.lineTo(12, 14);
    c.lineTo(14, 12);
    c.lineTo(8, 12);
    c.closePath();
    c.fill();
    // glow cap
    grad(c, 10, 2, 4, 3, "#fff0bf", "#c9a24b", true);
  });
}
