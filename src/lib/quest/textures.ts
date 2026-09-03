import * as Phaser from "phaser";

import tileMeadow from "@/assets/quest/tile-meadow.jpg";
import tileBloom from "@/assets/quest/tile-bloom.jpg";
import tileWater from "@/assets/quest/tile-water.jpg";
import tileWall from "@/assets/quest/tile-wall.jpg";
import tileMarble from "@/assets/quest/tile-marble.jpg";
import tileHedge from "@/assets/quest/tile-hedge.jpg";
import tileVoid from "@/assets/quest/tile-void.jpg";
import tileCandle from "@/assets/quest/tile-candle.jpg";
import tilePath from "@/assets/quest/tile-path.jpg";
import tileSky from "@/assets/quest/tile-sky.jpg";

import imgMariaDown from "@/assets/quest/maria-down.png";
import imgMariaSide from "@/assets/quest/maria-side.png";
import imgMariaUp from "@/assets/quest/maria-up.png";
import imgAndrew from "@/assets/quest/andrew.png";
import imgAndrewCeremony from "@/assets/quest/andrew-ceremony.png";
import imgEnemy from "@/assets/quest/enemy.png";
import imgSpectre from "@/assets/quest/spectre.png";
import imgPetal from "@/assets/quest/petal.png";
import imgButterfly from "@/assets/quest/butterfly.png";
import imgRelic from "@/assets/quest/relic.png";
import imgEnvelope from "@/assets/quest/envelope.png";
import imgKey from "@/assets/quest/key.png";
import imgBlock from "@/assets/quest/block.png";
import imgPlate from "@/assets/quest/plate.png";
import imgRestStone from "@/assets/quest/rest-stone.png";
import imgSheet from "@/assets/quest/sheet.png";
import imgPillar from "@/assets/quest/pillar.png";
import imgStoneMemory from "@/assets/quest/stone-memory.png";
import imgVaultDoor from "@/assets/quest/vault-door.png";
import imgGateway from "@/assets/quest/gateway.png";
import imgHeart from "@/assets/quest/heart-pickup.png";
import imgGoldenHeart from "@/assets/quest/golden-heart.png";
import imgArbor from "@/assets/quest/arbor.png";
import imgGuest from "@/assets/quest/guest.png";
import imgGuide from "@/assets/quest/guide.png";
import imgSignpost from "@/assets/quest/signpost.png";
import imgFountain from "@/assets/quest/fountain.png";
import imgHouse from "@/assets/quest/house.png";
import imgCottage from "@/assets/quest/cottage.png";
import imgTree from "@/assets/quest/tree.png";
import imgFence from "@/assets/quest/fence.png";
import imgFlowers from "@/assets/quest/flowers.png";
import imgLamp from "@/assets/quest/lamp.png";
import imgBench from "@/assets/quest/bench.png";
import imgBridge from "@/assets/quest/bridge.png";

export const TILE = 32;
export const HD = 2;

/** Tile indices used by every generated map. Every tile renders in full colour. */
export const T = {
  /** Lush meadow grass (formerly the desaturated "noise" tile). */
  GREY: 0,
  MEADOW: 0,
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

/** Raw art loaded in preload(), keyed by `art-*` so composed textures keep clean names. */
const TILE_ART: { slot: number; url: string }[] = [
  { slot: T.MEADOW, url: tileMeadow },
  { slot: T.BLOOM, url: tileBloom },
  { slot: T.WATER, url: tileWater },
  { slot: T.WALL, url: tileWall },
  { slot: T.MARBLE, url: tileMarble },
  { slot: T.HEDGE, url: tileHedge },
  { slot: T.VOID, url: tileVoid },
  { slot: T.CANDLE, url: tileCandle },
  { slot: T.PATH, url: tilePath },
  { slot: T.SKY, url: tileSky },
];

/** source art key -> [url, target width, target height] */
const SPRITE_ART: Record<string, [string, number, number]> = {
  "maria-down": [imgMariaDown, 24, 34],
  "maria-side": [imgMariaSide, 24, 34],
  "maria-up": [imgMariaUp, 24, 34],
  andrew: [imgAndrew, 24, 34],
  "andrew-ceremony": [imgAndrewCeremony, 24, 34],
  enemy: [imgEnemy, 22, 22],
  spectre: [imgSpectre, 48, 48],
  petal: [imgPetal, 10, 10],
  butterfly: [imgButterfly, 16, 12],
  relic: [imgRelic, 22, 26],
  envelope: [imgEnvelope, 24, 18],
  key: [imgKey, 18, 14],
  block: [imgBlock, 30, 30],
  plate: [imgPlate, 30, 30],
  "rest-stone": [imgRestStone, 28, 24],
  sheet: [imgSheet, 18, 20],
  pillar: [imgPillar, 26, 44],
  "stone-memory": [imgStoneMemory, 30, 30],
  "vault-door": [imgVaultDoor, 40, 52],
  gateway: [imgGateway, 44, 56],
  "heart-pickup": [imgHeart, 16, 14],
  "golden-heart": [imgGoldenHeart, 26, 24],
  arbor: [imgArbor, 40, 44],
  guest: [imgGuest, 20, 30],
  guide: [imgGuide, 22, 32],
  signpost: [imgSignpost, 24, 32],
  fountain: [imgFountain, 34, 38],
  house: [imgHouse, 64, 56],
  cottage: [imgCottage, 56, 50],
  tree: [imgTree, 40, 46],
  fence: [imgFence, 40, 18],
  flowers: [imgFlowers, 22, 16],
  lamp: [imgLamp, 18, 40],
  bench: [imgBench, 34, 22],
  bridge: [imgBridge, 44, 64],
};

/** Queue every bundled image. Call from the scene's preload(). */
export function preloadQuestArt(scene: Phaser.Scene) {
  for (const t of TILE_ART) scene.load.image(`art-tile-${t.slot}`, t.url);
  for (const [key, [url]] of Object.entries(SPRITE_ART)) scene.load.image(`art-${key}`, url);
}

function source(scene: Phaser.Scene, key: string) {
  return scene.textures.get(key).getSourceImage() as CanvasImageSource;
}

/** Builds the shared tileset strip texture (one row of TILE_COUNT tiles). */
export function buildTileset(scene: Phaser.Scene, key = "quest-tiles") {
  if (scene.textures.exists(key)) return key;
  const size = TILE * HD;
  const tex = scene.textures.createCanvas(key, size * TILE_COUNT, size)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  for (const t of TILE_ART) {
    ctx.drawImage(source(scene, `art-tile-${t.slot}`), t.slot * size, 0, size, size);
  }
  tex.refresh();
  return key;
}

function drawTo(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  draw(ctx);
  tex.refresh();
}

function scaled(scene: Phaser.Scene, key: string, artKey: string, w: number, h: number) {
  drawTo(scene, key, w, h, (ctx) => ctx.drawImage(source(scene, `art-${artKey}`), 0, 0, w, h));
}

/** Same art, hue-shifted with a soft colour wash — used for the four worry blobs. */
function tinted(scene: Phaser.Scene, key: string, artKey: string, w: number, h: number, tint: string) {
  drawTo(scene, key, w, h, (ctx) => {
    ctx.drawImage(source(scene, `art-${artKey}`), 0, 0, w, h);
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  });
}

/** A walk frame: the base art nudged/squashed slightly so the two frames read as steps. */
function walkFrame(
  scene: Phaser.Scene,
  key: string,
  artKey: string,
  w: number,
  h: number,
  step: number,
) {
  drawTo(scene, key, w, h, (ctx) => {
    // step 0 = neutral, 1 = left lift, 2 = right lift (mirrored sway)
    const bob = step === 0 ? 0 : 1;
    const squash = step === 0 ? 0 : 2;
    const lean = step === 1 ? -1 : step === 2 ? 1 : 0;
    ctx.drawImage(source(scene, `art-${artKey}`), squash / 2 + lean, bob, w - squash, h - bob);
  });
}

/** Registers every game texture from the bundled art (plus two tiny glow particles). */
export function buildSprites(scene: Phaser.Scene) {
  // ---- MARIA: 4-directional, two frames each ----------------------------
  for (const dir of ["down", "side", "up"] as const) {
    walkFrame(scene, `maria-${dir}-0`, `maria-${dir}`, 24, 34, 0);
    walkFrame(scene, `maria-${dir}-1`, `maria-${dir}`, 24, 34, 1);
    walkFrame(scene, `maria-${dir}-2`, `maria-${dir}`, 24, 34, 2);
  }
  // legacy keys kept so existing scene code keeps working
  walkFrame(scene, "maria-0", "maria-down", 24, 34, 0);
  walkFrame(scene, "maria-1", "maria-down", 24, 34, 1);

  // ---- ANDREW -----------------------------------------------------------
  scaled(scene, "andrew", "andrew", 24, 34);
  scaled(scene, "andrew-ceremony", "andrew-ceremony", 24, 34);

  // ---- ENEMIES ----------------------------------------------------------
  tinted(scene, "enemy-distraction", "enemy", 22, 22, "#9ba0ad");
  tinted(scene, "enemy-overwhelm", "enemy", 22, 22, "#7d6cb0");
  tinted(scene, "enemy-rush", "enemy", 22, 22, "#b56a62");
  tinted(scene, "enemy-weariness", "enemy", 22, 22, "#5f7080");
  scaled(scene, "spectre", "spectre", 48, 48);

  // ---- PICKUPS / PROPS / NPCS -------------------------------------------
  const plain: [string, string][] = [
    ["petal", "petal"],
    ["butterfly", "butterfly"],
    ["relic", "relic"],
    ["envelope", "envelope"],
    ["key", "key"],
    ["block", "block"],
    ["plate", "plate"],
    ["rest-stone", "rest-stone"],
    ["sheet", "sheet"],
    ["pillar", "pillar"],
    ["stone-memory", "stone-memory"],
    ["vault-door", "vault-door"],
    ["gateway", "gateway"],
    ["heart-pickup", "heart-pickup"],
    ["golden-heart", "golden-heart"],
    ["arbor", "arbor"],
    ["guest", "guest"],
    ["guide", "guide"],
    ["signpost", "signpost"],
    ["fountain", "fountain"],
    ["house", "house"],
    ["cottage", "cottage"],
    ["tree", "tree"],
    ["fence", "fence"],
    ["flowers", "flowers"],
    ["lamp", "lamp"],
    ["bench", "bench"],
    ["bridge", "bridge"],
  ];
  for (const [key, art] of plain) {
    const spec = SPRITE_ART[art]!;
    scaled(scene, key, art, spec[1], spec[2]);
  }

  // ---- tiny glow particles (kept procedural: pure light, no artwork) -----
  drawTo(scene, "spark", 6, 6, (ctx) => {
    const g = ctx.createRadialGradient(3, 3, 0, 3, 3, 3);
    g.addColorStop(0, "rgba(255,247,214,1)");
    g.addColorStop(1, "rgba(255,214,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 6, 6);
  });
  drawTo(scene, "glow", 24, 24, (ctx) => {
    const g = ctx.createRadialGradient(12, 12, 0, 12, 12, 12);
    g.addColorStop(0, "rgba(255,240,191,0.9)");
    g.addColorStop(1, "rgba(255,214,120,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 24, 24);
  });
}
