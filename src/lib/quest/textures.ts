import Phaser from "phaser";

export const TILE = 32;

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
  const tex = scene.textures.createCanvas(key, TILE * TILE_COUNT, TILE)!;
  const ctx = tex.getContext();

  // 0 grey "Noise of Life"
  px(ctx, T.GREY * TILE, 0, TILE, TILE, "#6f7480");
  noise(ctx, T.GREY * TILE, ["#5d626d", "#7f8593", "#565b66"], 7);

  // 1 blooming grass
  px(ctx, T.BLOOM * TILE, 0, TILE, TILE, "#3f9d5a");
  noise(ctx, T.BLOOM * TILE, ["#57bd72", "#2f7f47", "#ffd7e5", "#f9e28a"], 13, 34);

  // 2 water
  px(ctx, T.WATER * TILE, 0, TILE, TILE, "#2f7fd1");
  noise(ctx, T.WATER * TILE, ["#59a6ec", "#1f5fa8", "#bfe2ff"], 21);

  // 3 stone wall
  px(ctx, T.WALL * TILE, 0, TILE, TILE, "#8d8776");
  for (let y = 0; y < TILE; y += 8) {
    px(ctx, T.WALL * TILE, y, TILE, 1, "#6e6858");
    px(ctx, T.WALL * TILE + ((y / 8) % 2 === 0 ? 10 : 22), y, 1, 8, "#6e6858");
  }

  // 4 marble
  px(ctx, T.MARBLE * TILE, 0, TILE, TILE, "#efe9df");
  px(ctx, T.MARBLE * TILE, 0, TILE, 1, "#d8cfc0");
  px(ctx, T.MARBLE * TILE, 0, 1, TILE, "#d8cfc0");
  noise(ctx, T.MARBLE * TILE, ["#e2dacd"], 5, 10);

  // 5 hedge
  px(ctx, T.HEDGE * TILE, 0, TILE, TILE, "#1f6b3c");
  noise(ctx, T.HEDGE * TILE, ["#2b8a4d", "#15522c", "#ffd7e5"], 33, 40);

  // 6 void / cloud edge
  px(ctx, T.VOID * TILE, 0, TILE, TILE, "#141a35");
  noise(ctx, T.VOID * TILE, ["#25305c", "#0d1226"], 41, 16);

  // 7 candlelit floor
  px(ctx, T.CANDLE * TILE, 0, TILE, TILE, "#3a2b45");
  noise(ctx, T.CANDLE * TILE, ["#4a3757", "#2d2136", "#c9a24b"], 55, 18);

  // 8 sand path
  px(ctx, T.PATH * TILE, 0, TILE, TILE, "#d9c39a");
  noise(ctx, T.PATH * TILE, ["#c8ae83", "#eadcbb"], 67, 22);

  // 9 star sky
  px(ctx, T.SKY * TILE, 0, TILE, TILE, "#1b2350");
  noise(ctx, T.SKY * TILE, ["#39457f", "#ffffff", "#c9a24b"], 71, 12);

  tex.refresh();
  return key;
}

type Draw = (ctx: CanvasRenderingContext2D) => void;

function sprite(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  draw(tex.getContext());
  tex.refresh();
}

/** All character / object sprites, drawn procedurally as pixel art. */
export function buildSprites(scene: Phaser.Scene) {
  // ---- MARIA ------------------------------------------------------------
  const maria = (key: string, step: number) =>
    sprite(scene, key, 24, 34, (c) => {
      const legY = 26 + (step === 1 ? -1 : 0);
      // hair back (long, dark brown)
      px(c, 5, 3, 14, 20, "#3b2318");
      // face
      px(c, 8, 5, 8, 8, "#f0cdb2");
      // fringe
      px(c, 7, 3, 10, 4, "#4a2c1d");
      px(c, 6, 6, 2, 6, "#3b2318");
      px(c, 16, 6, 2, 6, "#3b2318");
      // eyes
      px(c, 10, 9, 1, 2, "#2a1b12");
      px(c, 13, 9, 1, 2, "#2a1b12");
      // puff sleeves
      px(c, 3, 14, 5, 5, "#ffffff");
      px(c, 16, 14, 5, 5, "#ffffff");
      // bodice
      px(c, 7, 13, 10, 8, "#ffffff");
      px(c, 7, 13, 10, 1, "#efe6dc");
      // tiered midi skirt
      px(c, 5, 21, 14, 4, "#ffffff");
      px(c, 4, 24, 16, 3, "#f7f3ee");
      px(c, 5, 21, 14, 1, "#e6dccf");
      px(c, 4, 24, 16, 1, "#e6dccf");
      // arms
      px(c, 4, 18, 3, 4, "#f0cdb2");
      px(c, 17, 18, 3, 4, "#f0cdb2");
      // platform wedge sandals
      px(c, 6, legY + 1, 4, 4, "#e8d3b4");
      px(c, 14, legY + 1, 4, 4, "#e8d3b4");
      px(c, 6, legY + 4, 4, 2, "#c8ab84");
      px(c, 14, legY + 4, 4, 2, "#c8ab84");
      // glowing red rose bouquet
      px(c, 18, 19, 5, 5, "#1f6b3c");
      px(c, 17, 17, 3, 3, "#b3121f");
      px(c, 20, 18, 3, 3, "#d61f2c");
      px(c, 18, 20, 3, 3, "#8e0c18");
      px(c, 19, 18, 1, 1, "#ff8f9c");
    });
  maria("maria-0", 0);
  maria("maria-1", 1);

  // ---- ANDREW -----------------------------------------------------------
  sprite(scene, "andrew", 24, 34, (c) => {
    // curtain hair, middle part
    px(c, 6, 2, 12, 6, "#3b2318");
    px(c, 5, 4, 3, 8, "#3b2318");
    px(c, 16, 4, 3, 8, "#3b2318");
    px(c, 11, 2, 2, 4, "#f0cdb2");
    // face
    px(c, 8, 6, 8, 8, "#e9bd9b");
    px(c, 10, 10, 1, 2, "#2a1b12");
    px(c, 13, 10, 1, 2, "#2a1b12");
    // white unbuttoned collar shirt
    px(c, 6, 14, 12, 10, "#ffffff");
    px(c, 11, 14, 2, 9, "#e5dfd6");
    px(c, 8, 14, 2, 3, "#f2ece4");
    px(c, 14, 14, 2, 3, "#f2ece4");
    // chest showing between the open collar
    px(c, 11, 16, 2, 4, "#e9bd9b");
    // arms + wristwatch
    px(c, 4, 15, 3, 8, "#ffffff");
    px(c, 17, 15, 3, 8, "#ffffff");
    px(c, 4, 22, 3, 3, "#e9bd9b");
    px(c, 17, 22, 3, 3, "#e9bd9b");
    px(c, 17, 22, 3, 1, "#151515");
    // charcoal trousers
    px(c, 7, 24, 10, 6, "#23252c");
    px(c, 11, 24, 1, 6, "#171920");
    // dress shoes
    px(c, 6, 30, 5, 3, "#111318");
    px(c, 13, 30, 5, 3, "#111318");
  });

  // ---- ENEMIES ----------------------------------------------------------
  const blob = (key: string, color: string, dark: string) =>
    sprite(scene, key, 22, 22, (c) => {
      c.fillStyle = color;
      c.beginPath();
      c.arc(11, 11, 10, 0, Math.PI * 2);
      c.fill();
      px(c, 6, 8, 3, 4, "#ffffff");
      px(c, 13, 8, 3, 4, "#ffffff");
      px(c, 7, 9, 1, 2, dark);
      px(c, 14, 9, 1, 2, dark);
      px(c, 7, 15, 8, 1, dark);
    });
  blob("enemy-distraction", "#8b8f9c", "#3a3d47");
  blob("enemy-overwhelm", "#6d5c9c", "#2c2447");
  blob("enemy-rush", "#a3564f", "#3c1f1c");
  blob("enemy-weariness", "#4f5f6d", "#1d262e");

  sprite(scene, "spectre", 48, 48, (c) => {
    c.fillStyle = "#3b3350";
    c.beginPath();
    c.arc(24, 22, 20, 0, Math.PI * 2);
    c.fill();
    px(c, 10, 40, 28, 6, "#2b2540");
    px(c, 14, 16, 7, 8, "#ffffff");
    px(c, 27, 16, 7, 8, "#ffffff");
    px(c, 16, 18, 3, 4, "#c11f2c");
    px(c, 29, 18, 3, 4, "#c11f2c");
  });

  // ---- PICKUPS / PROPS --------------------------------------------------
  sprite(scene, "petal", 10, 10, (c) => {
    c.fillStyle = "#d61f2c";
    c.beginPath();
    c.ellipse(5, 5, 4, 3, Math.PI / 4, 0, Math.PI * 2);
    c.fill();
    px(c, 4, 4, 2, 2, "#ff8f9c");
  });

  sprite(scene, "spark", 6, 6, (c) => {
    c.fillStyle = "#ffffff";
    c.beginPath();
    c.arc(3, 3, 3, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "butterfly", 16, 12, (c) => {
    px(c, 7, 2, 2, 8, "#4a3324");
    c.fillStyle = "#f7c6d9";
    c.beginPath();
    c.ellipse(4, 4, 4, 3, 0, 0, Math.PI * 2);
    c.ellipse(12, 4, 4, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#c9a24b";
    c.beginPath();
    c.ellipse(4, 9, 3, 2, 0, 0, Math.PI * 2);
    c.ellipse(12, 9, 3, 2, 0, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "relic", 22, 26, (c) => {
    px(c, 6, 2, 10, 3, "#c9a24b");
    px(c, 4, 5, 14, 16, "#f0d68a");
    px(c, 6, 7, 10, 12, "#fff6d8");
    px(c, 4, 21, 14, 3, "#c9a24b");
    px(c, 9, 10, 4, 6, "#c9a24b");
  });

  sprite(scene, "envelope", 24, 18, (c) => {
    px(c, 0, 0, 24, 18, "#fff6e8");
    px(c, 0, 0, 24, 1, "#c9a24b");
    px(c, 0, 17, 24, 1, "#c9a24b");
    c.strokeStyle = "#c9a24b";
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(12, 10);
    c.lineTo(24, 0);
    c.stroke();
    px(c, 10, 8, 4, 4, "#b3121f");
  });

  sprite(scene, "key", 18, 14, (c) => {
    px(c, 1, 5, 10, 4, "#c9a24b");
    px(c, 11, 3, 6, 8, "#e6c672");
    px(c, 13, 5, 2, 4, "#8a6a26");
    px(c, 3, 9, 2, 3, "#c9a24b");
    px(c, 7, 9, 2, 3, "#c9a24b");
  });

  sprite(scene, "block", 30, 30, (c) => {
    px(c, 0, 0, 30, 30, "#9c9382");
    px(c, 0, 0, 30, 3, "#bdb4a0");
    px(c, 0, 27, 30, 3, "#7a7263");
    px(c, 4, 4, 22, 22, "#8d8776");
  });

  sprite(scene, "plate", 30, 30, (c) => {
    c.fillStyle = "#c9a24b";
    c.beginPath();
    c.arc(15, 15, 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#fff0bf";
    c.beginPath();
    c.arc(15, 15, 8, 0, Math.PI * 2);
    c.fill();
  });

  sprite(scene, "rest-stone", 28, 24, (c) => {
    px(c, 2, 8, 24, 14, "#a9a396");
    px(c, 5, 4, 18, 6, "#c4bfb2");
    px(c, 9, 11, 10, 6, "#c9a24b");
    px(c, 11, 13, 6, 2, "#fff6d8");
  });

  sprite(scene, "sheet", 18, 20, (c) => {
    px(c, 0, 0, 18, 20, "#fffdf5");
    px(c, 2, 4, 14, 1, "#5b5b5b");
    px(c, 2, 8, 14, 1, "#5b5b5b");
    px(c, 2, 12, 14, 1, "#5b5b5b");
    px(c, 5, 6, 3, 6, "#123a6b");
    px(c, 11, 3, 3, 8, "#123a6b");
  });

  sprite(scene, "pillar", 26, 44, (c) => {
    px(c, 6, 36, 14, 6, "#cfd6ff");
    px(c, 8, 6, 10, 30, "#8fa6ff");
    px(c, 10, 8, 6, 26, "#d7e0ff");
    px(c, 11, 0, 4, 8, "#c9a24b");
  });

  sprite(scene, "stone-memory", 30, 30, (c) => {
    px(c, 3, 6, 24, 22, "#b9b2a3");
    px(c, 7, 2, 16, 8, "#cdc6b6");
    px(c, 9, 12, 12, 10, "#123a6b");
    px(c, 11, 14, 8, 6, "#c9a24b");
  });

  sprite(scene, "vault-door", 40, 52, (c) => {
    px(c, 0, 0, 40, 52, "#5a4630");
    px(c, 4, 4, 32, 44, "#7a5f3f");
    px(c, 16, 22, 8, 8, "#c9a24b");
    px(c, 6, 6, 28, 2, "#c9a24b");
    px(c, 6, 44, 28, 2, "#c9a24b");
  });

  sprite(scene, "gateway", 44, 56, (c) => {
    px(c, 2, 10, 8, 46, "#c9a24b");
    px(c, 34, 10, 8, 46, "#c9a24b");
    px(c, 2, 4, 40, 8, "#e6c672");
    c.fillStyle = "rgba(255,246,216,0.55)";
    c.fillRect(10, 12, 24, 44);
  });

  sprite(scene, "heart-pickup", 16, 14, (c) => {
    c.fillStyle = "#d61f2c";
    c.beginPath();
    c.arc(5, 5, 4, 0, Math.PI * 2);
    c.arc(11, 5, 4, 0, Math.PI * 2);
    c.moveTo(1, 6);
    c.lineTo(8, 13);
    c.lineTo(15, 6);
    c.fill();
  });

  sprite(scene, "golden-heart", 26, 24, (c) => {
    c.fillStyle = "#c9a24b";
    c.beginPath();
    c.arc(8, 8, 7, 0, Math.PI * 2);
    c.arc(18, 8, 7, 0, Math.PI * 2);
    c.moveTo(1, 10);
    c.lineTo(13, 23);
    c.lineTo(25, 10);
    c.fill();
  });

  sprite(scene, "arbor", 40, 44, (c) => {
    px(c, 2, 12, 6, 32, "#1f6b3c");
    px(c, 32, 12, 6, 32, "#1f6b3c");
    px(c, 2, 6, 36, 8, "#2b8a4d");
    for (let i = 0; i < 10; i++) px(c, 4 + i * 3, 4 + (i % 3) * 3, 3, 3, "#ffd7e5");
  });

  sprite(scene, "guest", 20, 30, (c) => {
    px(c, 6, 2, 8, 7, "#3b2318");
    px(c, 7, 8, 6, 6, "#e9bd9b");
    px(c, 4, 14, 12, 12, "#123a6b");
    px(c, 6, 26, 4, 3, "#1c1c1c");
    px(c, 11, 26, 4, 3, "#1c1c1c");
  });
}
