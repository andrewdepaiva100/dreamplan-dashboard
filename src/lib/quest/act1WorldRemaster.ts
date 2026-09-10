// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const HOUSE_CLEAR_RADIUS = 280;
const TREE_KEEP_RATE = 0.9;
const RUIN_COUNT = 3;
const DESIGN_W = 132;
const DESIGN_H = 102;
const ACT1_EXPANDED_W = 55;
const ACT1_EXPANDED_H = 50;
const WATER_TILE = 2;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function destroyTree(scene: SceneLike, tree: any) {
  if (!tree || tree.active === false || tree.texture?.key !== "tree") return;
  tree.destroy();
}

function collectTrees(scene: SceneLike) {
  const trees = new Set<any>();
  for (const child of scene.children?.list ?? []) {
    if ((child as any)?.texture?.key === "tree") trees.add(child);
  }
  for (const child of scene.solidDecor?.getChildren?.() ?? []) {
    if ((child as any)?.texture?.key === "tree") trees.add(child);
  }
  return [...trees];
}

function clearHouseTrees(scene: SceneLike) {
  const spot = scene.houseSpot?.() as [number, number] | null | undefined;
  if (!spot) return;
  const [hx, hy] = spot;
  for (const tree of collectTrees(scene)) {
    const d = Phaser.Math.Distance.Between(tree.x ?? 0, tree.y ?? 0, hx, hy);
    if (d < HOUSE_CLEAR_RADIUS) destroyTree(scene, tree);
  }
}

function thinTrees(scene: SceneLike) {
  const trees = collectTrees(scene).sort((a, b) => (a.x - b.x) || (a.y - b.y));
  const rnd = seeded(0x4d415249 ^ String(scene.save?.current_zone ?? "zone").length * 8191);
  for (const tree of trees) {
    if (rnd() > TREE_KEEP_RATE) destroyTree(scene, tree);
  }
}

function drawBrokenHouse(scene: SceneLike, x: number, y: number, variant: number) {
  const g = scene.add.graphics().setDepth(scene.dsort?.(y + 34) ?? 11);
  const wall = variant === 0 ? 0x927259 : variant === 1 ? 0x806754 : 0x9b765c;
  const timber = 0x4f382d;
  const roof = variant === 1 ? 0x3c4150 : 0x47495a;
  const dark = 0x2e2522;

  g.fillStyle(0x6f665f, 1);
  g.fillRect(x - 42, y + 24, 84, 9);
  g.fillStyle(wall, 1);
  g.fillRect(x - 38, y - 4, 76, 30);
  g.fillStyle(timber, 1);
  g.fillRect(x - 38, y - 5, 5, 31);
  g.fillRect(x + 10, y - 4, 5, 30);
  g.fillRect(x + 33, y - 4, 5, 30);

  g.fillStyle(roof, 1);
  g.beginPath();
  g.moveTo(x - 48, y - 3);
  g.lineTo(x - 9, y - 31);
  g.lineTo(x + 47, y - 3);
  g.lineTo(x + 28, y - 1);
  g.lineTo(x + 12, y - 14);
  g.lineTo(x - 2, y - 8);
  g.lineTo(x - 17, y - 21);
  g.lineTo(x - 31, y - 6);
  g.closePath();
  g.fill();

  g.fillStyle(dark, 1);
  g.fillRect(x - 27, y + 5, 15, 12);
  g.fillRect(x + 20, y + 2, 13, 13);
  g.fillRect(x - 2, y + 8, 15, 20);
  g.fillStyle(0x6e4a35, 1);
  g.fillRect(x + 3, y + 9, 4, 18);

  g.lineStyle(5, timber, 1);
  g.lineBetween(x - 30, y - 10, x - 3, y + 18);
  g.lineBetween(x + 31, y - 12, x + 12, y + 14);
  g.lineStyle(3, 0x6d625a, 1);
  g.lineBetween(x - 51, y + 32, x - 34, y + 25);
  g.lineBetween(x + 31, y + 31, x + 50, y + 25);

  for (const [ox, oy] of [[-37, 25], [-24, 29], [27, 27], [39, 22]] as [number, number][]) {
    g.fillStyle(0x58704b, 1);
    g.fillCircle(x + ox, y + oy, 7);
    g.fillStyle(0x7f965e, 1);
    g.fillCircle(x + ox + 4, y + oy - 4, 4);
  }

  if (scene.solidDecor) {
    const blocker = scene.solidDecor.create(x, y + 13, "block") as Phaser.Physics.Arcade.Sprite;
    blocker.setVisible(false).setAlpha(0.001).setScale(2.7, 1.35);
    (blocker as any).refreshBody?.();
  }
}

function placeAct1Ruins(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  if (scene.__act1RuinsPlaced) return;
  scene.__act1RuinsPlaced = true;

  const mapW = Number(scene.mapW ?? 180);
  const mapH = Number(scene.mapH ?? 180);
  const tile = 32;
  const house = scene.houseSpot?.() as [number, number] | null | undefined;
  const player = scene.player as Phaser.GameObjects.Sprite | undefined;
  const rnd = seeded(0x41435431);
  const solidTiles = new Set([2, 3, 5, 6]);
  const chosen: [number, number][] = [];

  let guard = 0;
  while (chosen.length < RUIN_COUNT && guard++ < 1200) {
    const band = chosen.length;
    const txMin = 12 + band * Math.floor((mapW - 24) / 3);
    const txMax = Math.min(mapW - 12, txMin + Math.floor((mapW - 24) / 3) - 5);
    const tx = Math.floor(txMin + rnd() * Math.max(1, txMax - txMin));
    const ty = Math.floor(16 + rnd() * Math.max(1, mapH - 32));
    const x = tx * tile;
    const y = ty * tile;

    const mapTile = scene.layer?.getTileAt?.(tx, ty);
    if (!mapTile || solidTiles.has(mapTile.index)) continue;
    if (house && Phaser.Math.Distance.Between(x, y, house[0], house[1]) < 520) continue;
    if (player && Phaser.Math.Distance.Between(x, y, player.x, player.y) < 360) continue;
    if (chosen.some(([cx, cy]) => Phaser.Math.Distance.Between(x, y, cx, cy) < 700)) continue;

    chosen.push([x, y]);
  }

  chosen.forEach(([x, y], i) => drawBrokenHouse(scene, x, y, i));
}

/**
 * Act I's authored water tiles are still the source of collision and bridge logic,
 * but the bundled water texture reads as a dark vertical seam at this scale.
 * Paint a calm blue ground-surface directly over WATER tiles so the river reads
 * as water while preserving the exact tilemap underneath.
 */
function paintAct1WaterSurface(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  if (!scene.layer?.forEachTile || scene.__act1WaterSurface?.active) return;

  const g = scene.add.graphics();
  scene.__act1WaterSurface = g;
  g.setDepth(Number(scene.layer.depth ?? 0) + 0.05);
  g.setName?.("act1-water-surface");

  scene.layer.forEachTile((tile: any) => {
    if (!tile || tile.index !== WATER_TILE) return;
    const x = Number(tile.pixelX ?? tile.x * 32);
    const y = Number(tile.pixelY ?? tile.y * 32);
    const w = Number(tile.width ?? 32);
    const h = Number(tile.height ?? 32);

    // Opaque enough to fully cover the black/white stripe, but still soft enough
    // to blend naturally with the surrounding painted map.
    g.fillStyle(0x4f9fd3, 0.96);
    g.fillRect(x, y, w + 0.5, h + 0.5);

    // Gentle surface variation keeps the river from becoming a flat blue bar.
    g.fillStyle(0x75bce1, 0.34);
    g.fillRect(x + 2, y + 5, Math.max(4, w - 8), 3);
    g.fillStyle(0xc6e8f5, 0.22);
    g.fillRect(x + 7, y + 16, Math.max(3, w - 14), 2);
    g.fillStyle(0x2f79ad, 0.18);
    g.fillRect(x + 3, y + h - 6, Math.max(4, w - 10), 2);
  });
}

export function installAct1WorldRemaster(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__act1WorldRemasterInstalled) return;
  proto.__act1WorldRemasterInstalled = true;

  const originalBuildAct1 = proto.buildAct1;
  proto.buildAct1 = function expandedAct1(this: SceneLike, ...args: any[]) {
    this.mapW = ACT1_EXPANDED_W;
    this.mapH = ACT1_EXPANDED_H;
    this.sxF = this.mapW / DESIGN_W;
    this.syF = this.mapH / DESIGN_H;
    const result = originalBuildAct1.apply(this, args);
    paintAct1WaterSurface(this);
    return result;
  };

  const originalCreate = proto.create;
  proto.create = function act1WorldRemasteredCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);

    thinTrees(this);
    clearHouseTrees(this);
    placeAct1Ruins(this);

    return result;
  };
}
