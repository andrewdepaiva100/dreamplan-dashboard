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
import imgSwiftSandals from "@/assets/quest/swift-sandals.png";
import imgArbor from "@/assets/quest/arbor.png";
import imgPriest from "@/assets/quest/priest.png";
import imgAndre from "@/assets/quest/andre.png";
import imgPhillip from "@/assets/quest/phillip.png";
import imgItalo from "@/assets/quest/italo.png";
import imgGabe from "@/assets/quest/gabe.png";
import imgPew from "@/assets/quest/pew.png";
import imgAltar from "@/assets/quest/altar.png";
import imgChurchWindow from "@/assets/quest/church-window.png";
import imgChurchColumn from "@/assets/quest/church-column.png";
import imgAltarpiece from "@/assets/quest/church-altarpiece.png";
import imgLorena from "@/assets/quest/lorena.png";
import imgAlicia from "@/assets/quest/alicia.png";
import imgPedro from "@/assets/quest/pedro.png";
import imgGianluca from "@/assets/quest/gianluca.png";
import imgAdriel from "@/assets/quest/adriel.png";
import imgRaquel from "@/assets/quest/raquel.png";
import imgMarcos from "@/assets/quest/marcos.png";
import imgSilvia from "@/assets/quest/silvia.png";
import imgGustavo from "@/assets/quest/gustavo.png";
import imgAndressa from "@/assets/quest/andressa.png";
import imgBossHollow from "@/assets/quest/boss-hollow.png";
import imgGuest from "@/assets/quest/guest.png";
import imgGuide from "@/assets/quest/guide.png";
import imgSignpost from "@/assets/quest/signpost.png";
import imgFountain from "@/assets/quest/fountain.png";
import imgHouse from "@/assets/quest/house.png";

import imgTree from "@/assets/quest/tree.png";
import imgFence from "@/assets/quest/fence.png";
import imgFlowers from "@/assets/quest/flowers.png";
import imgLamp from "@/assets/quest/lamp.png";
import imgBench from "@/assets/quest/bench.png";
import imgBridge from "@/assets/quest/bridge.png";
import imgAndrewDown from "@/assets/quest/andrew-down.png";
import imgAndrewSide from "@/assets/quest/andrew-side.png";
import imgAndrewUp from "@/assets/quest/andrew-up.png";
import imgLmTemple from "@/assets/quest/landmark-temple.png";
import imgLmConservatory from "@/assets/quest/landmark-conservatory.png";
import imgLmTownhall from "@/assets/quest/landmark-townhall.png";
import imgLmObservatory from "@/assets/quest/landmark-observatory.png";
import imgLmCathedral from "@/assets/quest/landmark-cathedral.png";
import imgPortal from "@/assets/quest/portal.png";
import imgStall from "@/assets/quest/stall.png";
import imgCat from "@/assets/quest/cat.png";
import imgDog from "@/assets/quest/dog.png";
import imgBird from "@/assets/quest/bird.png";
import imgDeer from "@/assets/quest/deer.png";
import imgDuck from "@/assets/quest/duck.png";
import imgGuideAct from "@/assets/quest/guide-act.png";
import imgBlacksmith from "@/assets/quest/blacksmith.png";
import imgSmith from "@/assets/quest/smith.png";
import imgBossWater from "@/assets/quest/boss-water.png";
import imgBossGarden from "@/assets/quest/boss-garden.png";
import imgBossHaven from "@/assets/quest/boss-haven.png";
import imgBossStar from "@/assets/quest/boss-star.png";

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

export const SOLID_TILES = [T.WALL, T.HEDGE, T.VOID, T.WATER];
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
  andrew: [imgAndrew, 25, 39],
  "andrew-ceremony": [imgAndrewCeremony, 25, 39],
  enemy: [imgEnemy, 22, 22],
  spectre: [imgSpectre, 48, 48],
  "boss-water": [imgBossWater, 54, 66],
  "boss-garden": [imgBossGarden, 58, 66],
  "boss-haven": [imgBossHaven, 62, 64],
  "boss-star": [imgBossStar, 60, 64],
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
  "swift-sandals": [imgSwiftSandals, 26, 22],
  arbor: [imgArbor, 40, 44],
  priest: [imgPriest, 26, 37],
  andre: [imgAndre, 24, 35],
  phillip: [imgPhillip, 24, 35],
  italo: [imgItalo, 24, 35],
  gabe: [imgGabe, 24, 35],
  pew: [imgPew, 40, 22],
  altar: [imgAltar, 46, 34],
  "church-window": [imgChurchWindow, 46, 62],
  "church-column": [imgChurchColumn, 30, 52],
  altarpiece: [imgAltarpiece, 118, 88],
  lorena: [imgLorena, 24, 35],
  alicia: [imgAlicia, 24, 35],
  pedro: [imgPedro, 20, 29],
  gianluca: [imgGianluca, 24, 35],
  adriel: [imgAdriel, 24, 35],
  raquel: [imgRaquel, 24, 35],
  marcos: [imgMarcos, 24, 35],
  silvia: [imgSilvia, 24, 35],
  gustavo: [imgGustavo, 24, 35],
  andressa: [imgAndressa, 24, 35],
  "boss-hollow": [imgBossHollow, 34, 44],
  guest: [imgGuest, 20, 30],
  guide: [imgGuide, 22, 32],
  "guide-act": [imgGuideAct, 24, 34],
  signpost: [imgSignpost, 24, 32],
  fountain: [imgFountain, 34, 38],
  house: [imgHouse, 64, 56],
  
  tree: [imgTree, 40, 46],
  fence: [imgFence, 40, 18],
  flowers: [imgFlowers, 22, 16],
  lamp: [imgLamp, 18, 40],
  bench: [imgBench, 34, 22],
  bridge: [imgBridge, 44, 64],
  "andrew-down": [imgAndrewDown, 25, 39],
  "andrew-side": [imgAndrewSide, 27, 39],
  "andrew-up": [imgAndrewUp, 25, 39],
  "landmark-temple": [imgLmTemple, 200, 222],
  "landmark-conservatory": [imgLmConservatory, 204, 220],
  "landmark-townhall": [imgLmTownhall, 210, 230],
  "landmark-observatory": [imgLmObservatory, 190, 242],
  "landmark-cathedral": [imgLmCathedral, 196, 278],
  portal: [imgPortal, 62, 76],
  stall: [imgStall, 42, 51],
  cat: [imgCat, 18, 23],
  dog: [imgDog, 26, 22],
  bird: [imgBird, 17, 14],
  deer: [imgDeer, 30, 21],
  duck: [imgDuck, 19, 20],
  blacksmith: [imgBlacksmith, 78, 74],
  smith: [imgSmith, 26, 34],
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

  // ---- ANDREW: 4-directional, three frames each --------------------------
  for (const dir of ["down", "side", "up"] as const) {
    const spec = SPRITE_ART[`andrew-${dir}`]!;
    walkFrame(scene, `andrew-${dir}-0`, `andrew-${dir}`, spec[1], spec[2], 0);
    walkFrame(scene, `andrew-${dir}-1`, `andrew-${dir}`, spec[1], spec[2], 1);
    walkFrame(scene, `andrew-${dir}-2`, `andrew-${dir}`, spec[1], spec[2], 2);
  }
  scaled(scene, "andrew", "andrew-down", 25, 39);
  scaled(scene, "andrew-ceremony", "andrew-ceremony", 25, 39);

  // ---- ENEMIES ----------------------------------------------------------
  tinted(scene, "enemy-distraction", "enemy", 22, 22, "#58a6e8");
  tinted(scene, "enemy-overwhelm", "enemy", 22, 22, "#9d68e0");
  tinted(scene, "enemy-rush", "enemy", 22, 22, "#e86a58");
  tinted(scene, "enemy-weariness", "enemy", 22, 22, "#4fb08a");
  scaled(scene, "spectre", "spectre", 48, 48);

  // ---- MARIA'S COTTAGE (procedural pixel-art: stone roof, wood planks, ----
  // ---- glowing windows, chimney) -----------------------------------------
  drawTo(scene, "cottage", 56, 50, (ctx) => {
    // chimney
    ctx.fillStyle = "#7a6a5f";
    ctx.fillRect(40, 2, 6, 12);
    ctx.fillStyle = "#8d7c6f";
    ctx.fillRect(40, 2, 6, 2);
    // stone-tile roof with shading
    ctx.fillStyle = "#5d6b7d";
    ctx.beginPath();
    ctx.moveTo(2, 22);
    ctx.lineTo(28, 6);
    ctx.lineTo(54, 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4c5867";
    for (let r = 0; r < 4; r++) {
      const y = 20 - r * 4;
      for (let x = 4 + (r % 2) * 3; x < 52; x += 6) {
        const half = (22 - y) * 1.6;
        if (Math.abs(x - 28) < 26 - half * 0) ctx.fillRect(x, y, 5, 3);
      }
    }
    ctx.strokeStyle = "#3a4450";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(2, 22);
    ctx.lineTo(28, 6);
    ctx.lineTo(54, 22);
    ctx.stroke();
    // warm wood-plank walls
    ctx.fillStyle = "#b98a5e";
    ctx.fillRect(6, 22, 44, 24);
    ctx.fillStyle = "#a67a52";
    for (let y = 26; y < 46; y += 4) ctx.fillRect(6, y, 44, 1);
    ctx.fillStyle = "rgba(90,60,35,0.35)";
    for (let y = 24; y < 46; y += 4)
      for (let x = 8 + ((y / 4) % 2) * 6; x < 48; x += 12) ctx.fillRect(x, y, 1, 3);
    // timber frame corners
    ctx.fillStyle = "#7c5a3a";
    ctx.fillRect(6, 22, 2, 24);
    ctx.fillRect(48, 22, 2, 24);
    ctx.fillRect(6, 22, 44, 2);
    // arched door
    ctx.fillStyle = "#5c3a22";
    ctx.fillRect(24, 32, 9, 14);
    ctx.beginPath();
    ctx.arc(28.5, 32, 4.5, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#ffd977";
    ctx.fillRect(31, 38, 1.6, 1.6);
    // glowing windows with cross frames
    for (const wx of [11, 38]) {
      ctx.fillStyle = "#ffe9a8";
      ctx.fillRect(wx, 27, 8, 8);
      const g = ctx.createRadialGradient(wx + 4, 31, 1, wx + 4, 31, 7);
      g.addColorStop(0, "rgba(255,224,138,0.85)");
      g.addColorStop(1, "rgba(255,224,138,0)");
      ctx.fillStyle = g;
      ctx.fillRect(wx - 3, 24, 14, 14);
      ctx.fillStyle = "#7c5a3a";
      ctx.fillRect(wx + 3.4, 27, 1.2, 8);
      ctx.fillRect(wx, 30.4, 8, 1.2);
      ctx.strokeStyle = "#5c3a22";
      ctx.strokeRect(wx - 0.6, 26.4, 9.2, 9.2);
    }
    // stone foundation
    ctx.fillStyle = "#8d8d94";
    ctx.fillRect(4, 46, 48, 3);
    ctx.fillStyle = "#707078";
    ctx.fillRect(10, 46, 1, 3);
    ctx.fillRect(22, 46, 1, 3);
    ctx.fillRect(34, 46, 1, 3);
    ctx.fillRect(46, 46, 1, 3);
  });

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
    ["swift-sandals", "swift-sandals"],
    ["arbor", "arbor"],
    ["priest", "priest"],
    ["andre", "andre"],
    ["phillip", "phillip"],
    ["italo", "italo"],
    ["gabe", "gabe"],
    ["pew", "pew"],
    ["altar", "altar"],
    ["church-window", "church-window"],
    ["church-column", "church-column"],
    ["altarpiece", "altarpiece"],
    ["lorena", "lorena"],
    ["alicia", "alicia"],
    ["pedro", "pedro"],
    ["gianluca", "gianluca"],
    ["adriel", "adriel"],
    ["raquel", "raquel"],
    ["marcos", "marcos"],
    ["silvia", "silvia"],
    ["gustavo", "gustavo"],
    ["andressa", "andressa"],
    ["boss-hollow", "boss-hollow"],
    ["guest", "guest"],
    ["guide", "guide"],
    ["guide-act", "guide-act"],
    ["blacksmith", "blacksmith"],
    ["smith", "smith"],
    ["signpost", "signpost"],
    ["fountain", "fountain"],
    ["house", "house"],
    
    ["tree", "tree"],
    ["fence", "fence"],
    ["flowers", "flowers"],
    ["lamp", "lamp"],
    ["bench", "bench"],
    ["bridge", "bridge"],
    ["landmark-temple", "landmark-temple"],
    ["landmark-conservatory", "landmark-conservatory"],
    ["landmark-townhall", "landmark-townhall"],
    ["landmark-observatory", "landmark-observatory"],
    ["landmark-cathedral", "landmark-cathedral"],
    ["portal", "portal"],
    ["stall", "stall"],
    ["cat", "cat"],
    ["dog", "dog"],
    ["bird", "bird"],
    ["deer", "deer"],
    ["duck", "duck"],
    ["boss-water", "boss-water"],
    ["boss-garden", "boss-garden"],
    ["boss-haven", "boss-haven"],
    ["boss-star", "boss-star"],
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

  // ---- WEAPON-IN-HAND overlays (procedural, tinted per weapon) -----------
  const HAND: Record<string, { blade: string; grip: string; kind: "sword" | "wand" | "bow" | "ring" }> = {
    "ember-blade": { blade: "#ffa14a", grip: "#5c3a22", kind: "sword" },
    "spark-wand": { blade: "#ffd977", grip: "#8a6a34", kind: "wand" },
    "floral-bow": { blade: "#ff9ec4", grip: "#6d4d2c", kind: "bow" },
    lightblade: { blade: "#bfe3ff", grip: "#c8a24a", kind: "sword" },
    "love-sword": { blade: "#ff6fae", grip: "#c8a24a", kind: "sword" },
    "ally-blade": { blade: "#6fb6ff", grip: "#c8a24a", kind: "sword" },
    "starlight-censer": { blade: "#a9b6ff", grip: "#9aa4c4", kind: "wand" },
    "blade-of-vows": { blade: "#f2f0e4", grip: "#c8a24a", kind: "sword" },
    "lantern-wand": { blade: "#ffd977", grip: "#8a6a34", kind: "wand" },
    "bow-of-patience": { blade: "#e6cfa4", grip: "#6d4d2c", kind: "bow" },
    "censer-of-calm": { blade: "#dfe7ff", grip: "#9aa4c4", kind: "wand" },
    "ring-of-dawn": { blade: "#ffe6a8", grip: "#c9a24a", kind: "ring" },
  };
  for (const [id, spec] of Object.entries(HAND)) {
    drawTo(scene, `hand-${id}`, 12, 26, (ctx) => {
      ctx.lineCap = "round";
      if (spec.kind === "ring") {
        ctx.strokeStyle = spec.blade;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(6, 16, 5, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }
      if (spec.kind === "bow") {
        ctx.strokeStyle = spec.grip;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(4, 13, 9, -Math.PI / 2.2, Math.PI / 2.2);
        ctx.stroke();
        ctx.strokeStyle = spec.blade;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(6, 4);
        ctx.lineTo(6, 22);
        ctx.stroke();
        return;
      }
      // sword / wand: grip + blade
      ctx.strokeStyle = spec.grip;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(6, 24);
      ctx.lineTo(6, 19);
      ctx.stroke();
      ctx.strokeStyle = spec.grip;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(1.5, 18);
      ctx.lineTo(10.5, 18);
      ctx.stroke();
      ctx.strokeStyle = spec.blade;
      ctx.lineWidth = spec.kind === "wand" ? 3 : 4;
      ctx.beginPath();
      ctx.moveTo(6, 17);
      ctx.lineTo(6, 2);
      ctx.stroke();
      if (spec.kind === "wand") {
        ctx.fillStyle = spec.blade;
        ctx.beginPath();
        ctx.arc(6, 2.5, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  // ---- AEGIS shield ------------------------------------------------------
  drawTo(scene, "aegis", 26, 30, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(13, 1);
    ctx.lineTo(25, 7);
    ctx.lineTo(25, 17);
    ctx.quadraticCurveTo(25, 26, 13, 29);
    ctx.quadraticCurveTo(1, 26, 1, 17);
    ctx.lineTo(1, 7);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, 30);
    g.addColorStop(0, "#ffe9b0");
    g.addColorStop(1, "#d5a34a");
    ctx.fillStyle = "#f3d489";
    ctx.fill();
    ctx.strokeStyle = "#a8783a";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.strokeStyle = "#fffaf0";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(13, 6);
    ctx.lineTo(13, 23);
    ctx.moveTo(7, 12);
    ctx.lineTo(19, 12);
    ctx.stroke();
    void g;
  });

  buildHomeSprites(scene);
}

/**
 * Cottage interior furniture, food drops, boss bolts and the warm light discs
 * used by the day/night pass. All procedural — no extra art to download.
 */
export function buildHomeSprites(scene: Phaser.Scene) {
  // soft warm light disc for lamps, torches and windows at night
  drawTo(scene, "light-warm", 128, 128, (ctx) => {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,226,170,0.7)");
    g.addColorStop(0.25, "rgba(255,198,120,0.22)");
    g.addColorStop(0.6, "rgba(255,186,110,0.06)");
    g.addColorStop(1, "rgba(255,180,100,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  });

  // boss projectile — white core so a runtime tint reads true
  drawTo(scene, "bolt", 18, 18, (ctx) => {
    const g = ctx.createRadialGradient(9, 9, 0, 9, 9, 9);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.55, "rgba(255,255,255,0.75)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 18, 18);
  });

  // raw meat drop
  drawTo(scene, "drop-raw-meat", 20, 16, (ctx) => {
    ctx.fillStyle = "#c9505a";
    ctx.beginPath();
    ctx.ellipse(10, 9, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e88a92";
    ctx.beginPath();
    ctx.ellipse(8, 7, 4, 2.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2e6d2";
    ctx.fillRect(15, 6, 4, 3);
  });

  // cooked meat drop
  drawTo(scene, "drop-cooked-meat", 20, 16, (ctx) => {
    ctx.fillStyle = "#8a4a25";
    ctx.beginPath();
    ctx.ellipse(10, 9, 8, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#c07a3d";
    ctx.beginPath();
    ctx.ellipse(8, 7, 4, 2.6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f2e6d2";
    ctx.fillRect(15, 6, 4, 3);
  });

  // berries drop
  drawTo(scene, "drop-berries", 16, 14, (ctx) => {
    for (const [x, y, r, c] of [
      [5, 8, 4, "#5b4bb5"],
      [10, 6, 3.4, "#7663d6"],
      [11, 10, 3, "#4a3d99"],
    ] as [number, number, number, string][]) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "#3f7a3f";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(12, 1);
    ctx.stroke();
  });

  // storage chest
  drawTo(scene, "chest", 34, 28, (ctx) => {
    ctx.fillStyle = "#7a4d24";
    ctx.fillRect(2, 10, 30, 16);
    ctx.fillStyle = "#96632f";
    ctx.beginPath();
    ctx.moveTo(2, 11);
    ctx.quadraticCurveTo(17, 0, 32, 11);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#d8a94e";
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 11, 28, 14);
    ctx.fillStyle = "#e6c065";
    ctx.fillRect(15, 12, 4, 8);
    ctx.fillStyle = "#3a2410";
    ctx.fillRect(16, 15, 2, 3);
  });

  // hearth / fireplace
  drawTo(scene, "hearth", 44, 40, (ctx) => {
    ctx.fillStyle = "#6d6a66";
    ctx.fillRect(1, 4, 42, 34);
    ctx.fillStyle = "#8b8781";
    for (let y = 0; y < 5; y++)
      for (let x = 0; x < 6; x++)
        ctx.fillRect(3 + x * 7 + (y % 2 ? 3 : 0), 6 + y * 6, 6, 5);
    ctx.fillStyle = "#231a14";
    ctx.beginPath();
    ctx.moveTo(11, 38);
    ctx.lineTo(11, 22);
    ctx.quadraticCurveTo(22, 12, 33, 22);
    ctx.lineTo(33, 38);
    ctx.closePath();
    ctx.fill();
    const g = ctx.createLinearGradient(0, 38, 0, 22);
    g.addColorStop(0, "#ffd166");
    g.addColorStop(1, "#e2542a");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(15, 38);
    ctx.quadraticCurveTo(16, 26, 22, 22);
    ctx.quadraticCurveTo(28, 26, 29, 38);
    ctx.closePath();
    ctx.fill();
  });

  // bed
  drawTo(scene, "bed", 48, 34, (ctx) => {
    ctx.fillStyle = "#6b4526";
    ctx.fillRect(1, 6, 46, 26);
    ctx.fillStyle = "#8a5a31";
    ctx.fillRect(1, 2, 8, 30);
    ctx.fillStyle = "#f6efe2";
    ctx.fillRect(9, 9, 12, 14);
    ctx.fillStyle = "#c2405a";
    ctx.fillRect(20, 9, 26, 20);
    ctx.fillStyle = "#e0708a";
    ctx.fillRect(20, 9, 26, 5);
  });

  // small round rug
  drawTo(scene, "rug", 88, 56, (ctx) => {
    ctx.fillStyle = "#8d3f52";
    ctx.beginPath();
    ctx.ellipse(44, 28, 43, 27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d8a94e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(44, 28, 32, 19, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "#f2dfae";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(44, 28, 20, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
  });

  // warm interior window
  drawTo(scene, "window-warm", 34, 30, (ctx) => {
    ctx.fillStyle = "#5a3a1e";
    ctx.fillRect(0, 0, 34, 30);
    const g = ctx.createLinearGradient(0, 0, 0, 30);
    g.addColorStop(0, "#1c2a52");
    g.addColorStop(1, "#3d4f86");
    ctx.fillStyle = g;
    ctx.fillRect(3, 3, 28, 24);
    ctx.strokeStyle = "#5a3a1e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(17, 3);
    ctx.lineTo(17, 27);
    ctx.moveTo(3, 15);
    ctx.lineTo(31, 15);
    ctx.stroke();
  });

  // cooking pot / table
  drawTo(scene, "table", 40, 26, (ctx) => {
    ctx.fillStyle = "#8a5a31";
    ctx.fillRect(2, 4, 36, 8);
    ctx.fillStyle = "#6b4526";
    ctx.fillRect(5, 12, 5, 12);
    ctx.fillRect(30, 12, 5, 12);
    ctx.fillStyle = "#e6d7bd";
    ctx.fillRect(12, 0, 16, 5);
  });
}

