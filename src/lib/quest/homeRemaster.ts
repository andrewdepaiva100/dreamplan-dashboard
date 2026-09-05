import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const HOUSE_CLEAR_RADIUS = 175;

function canvasTexture(scene: SceneLike, key: string) {
  if (!scene.textures.exists(key)) return null;
  const texture = scene.textures.get(key) as any;
  const source = texture.getSourceImage?.();
  if (!(source instanceof HTMLCanvasElement)) return null;
  return { texture, canvas: source as HTMLCanvasElement };
}

/** Redraw the existing `cottage` key in place — no sprite/key rename. */
function redrawCottage(scene: SceneLike) {
  const entry = canvasTexture(scene, "cottage");
  if (!entry) return;
  const { texture, canvas } = entry;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 56;
  const sy = h / 50;
  const R = (x: number, y: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * sx), Math.round(y * sy), Math.ceil(rw * sx), Math.ceil(rh * sy));
  };

  // Foundation + warm plaster body.
  R(5, 24, 46, 22, "#b99572");
  R(5, 44, 46, 4, "#786f6b");
  R(7, 27, 42, 17, "#c8a47e");

  // Timber frame.
  R(5, 23, 46, 3, "#6f4d36");
  R(7, 26, 2, 18, "#77523a");
  R(47, 26, 2, 18, "#77523a");
  R(27, 26, 2, 18, "#7d583e");

  // Deep slate roof with layered shingle bands.
  ctx.fillStyle = "#344258";
  ctx.beginPath();
  ctx.moveTo(2 * sx, 25 * sy);
  ctx.lineTo(28 * sx, 6 * sy);
  ctx.lineTo(54 * sx, 25 * sy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#263448";
  for (let y = 10; y <= 22; y += 4) {
    const inset = Math.max(0, (22 - y) * 1.2);
    for (let x = 6 + inset; x < 50 - inset; x += 7) R(x, y, 6, 2, "#43536a");
  }
  R(25, 7, 6, 2, "#53627a");

  // Chimney.
  R(41, 5, 6, 12, "#8a7a6d");
  R(40, 4, 8, 3, "#685d55");
  R(42, 8, 2, 2, "#9d8c7d");

  // Central arched door.
  R(23, 31, 10, 14, "#5b3828");
  ctx.fillStyle = "#5b3828";
  ctx.beginPath();
  ctx.arc(28 * sx, 31 * sy, 5 * sx, Math.PI, 0);
  ctx.fill();
  R(24, 34, 2, 8, "#79503a");
  R(31, 37, 1, 1, "#f2cd72");

  // Bright windows with flower boxes.
  for (const x of [12, 38]) {
    R(x, 29, 8, 8, "#513b32");
    R(x + 1, 30, 6, 6, "#ffd98c");
    R(x + 3.7, 30, 1, 6, "#8b684c");
    R(x + 1, 32.7, 6, 1, "#8b684c");
    R(x - 1, 37, 10, 3, "#6d4b37");
    R(x, 36, 2, 2, "#cc6385");
    R(x + 3, 36, 2, 2, "#f29ab5");
    R(x + 6, 36, 2, 2, "#d77895");
  }

  // Climbing flowers around the doorway.
  for (const [x, y, c] of [
    [20, 28, "#75945a"], [18, 31, "#75945a"], [18, 35, "#8ca567"],
    [36, 28, "#75945a"], [37, 32, "#75945a"], [37, 36, "#8ca567"],
    [19, 29, "#f29ab5"], [18, 34, "#d96f91"], [36, 30, "#f3b0c5"], [38, 35, "#d96f91"],
  ] as [number, number, string][]) R(x, y, 2, 2, c);

  // Two wall lanterns.
  for (const x of [20, 36]) {
    R(x, 31, 2, 5, "#2f3037");
    R(x, 32, 2, 2, "#ffd477");
  }

  texture.refresh?.();
}

function removeTreesNearHouse(scene: SceneLike, hx: number, hy: number) {
  const near = (obj: any) =>
    obj?.active !== false &&
    obj?.texture?.key === "tree" &&
    Phaser.Math.Distance.Between(obj.x ?? 0, obj.y ?? 0, hx, hy) < HOUSE_CLEAR_RADIUS;

  for (const child of [...scene.children.list]) {
    if (near(child)) child.destroy();
  }
  const solids = (scene.solidDecor?.getChildren?.() ?? []) as any[];
  for (const child of [...solids]) {
    if (near(child)) child.destroy();
  }
}

function decorateHouseYard(scene: SceneLike, hx: number, hy: number) {
  const g = scene.add.graphics().setDepth((scene.dsort?.(hy + 42) ?? 12) - 0.4);

  // Small stone approach and compact flower beds; deliberately no trees.
  g.fillStyle(0xd6c9ae, 0.95);
  for (let i = 0; i < 5; i++) {
    g.fillRoundedRect(hx - 12 + (i % 2) * 6, hy + 34 + i * 12, 24, 8, 3);
  }
  g.fillStyle(0x6e8752, 0.95);
  g.fillRoundedRect(hx - 68, hy + 31, 42, 18, 5);
  g.fillRoundedRect(hx + 26, hy + 31, 42, 18, 5);
  for (const [x, y, c] of [
    [-58, 35, 0xe98aac], [-45, 39, 0xf2c5d2], [-32, 34, 0xd86f96],
    [34, 35, 0xf0adbf], [47, 39, 0xd96f91], [59, 34, 0xf3d2da],
  ] as [number, number, number][]) {
    g.fillStyle(c, 1);
    g.fillCircle(hx + x, hy + y, 3);
  }

  // Warm low lanterns flanking the door.
  for (const x of [hx - 48, hx + 48]) {
    g.fillStyle(0x32323b, 1);
    g.fillRect(x - 2, hy + 42, 4, 24);
    g.fillStyle(0xf6ca70, 1);
    g.fillRoundedRect(x - 5, hy + 39, 10, 9, 2);
  }
}

function drawInterior(scene: SceneLike) {
  const ROOM_W = 860;
  const ROOM_H = 560;
  const ox = (scene.scale.width - ROOM_W) / 2;
  const oy = (scene.scale.height - ROOM_H) / 2;
  const fy = oy + 118;
  const cx = ox + ROOM_W / 2;

  // This layer sits above the old structural dressing but below Maria, prompts,
  // exit marker and interactive furniture, so gameplay wiring stays untouched.
  const g = scene.add.graphics().setDepth(9.4);

  // Clean warm plaster wall and richer plank floor.
  g.fillStyle(0x38261d, 1);
  g.fillRect(ox, oy, ROOM_W, ROOM_H);
  g.fillStyle(0xd6b898, 1);
  g.fillRect(ox + 12, oy + 12, ROOM_W - 24, 104);
  g.fillStyle(0x644735, 1);
  g.fillRect(ox + 12, fy - 8, ROOM_W - 24, 12);
  g.fillStyle(0x855d3c, 1);
  g.fillRect(ox + 12, fy + 4, ROOM_W - 24, ROOM_H - 134);
  for (let y = fy + 4; y < oy + ROOM_H - 12; y += 22) {
    g.fillStyle(0x6f4b33, 0.55);
    g.fillRect(ox + 12, y, ROOM_W - 24, 2);
    for (let x = ox + 36 + ((y / 22) % 2) * 38; x < ox + ROOM_W - 18; x += 76) {
      g.fillRect(x, y + 2, 2, 20);
    }
  }

  // Three room zones: kitchen/dining, bedroom, living/study.
  const rug = (x: number, y: number, w: number, h: number, fill: number, edge: number) => {
    g.fillStyle(edge, 1); g.fillRoundedRect(x - 6, y - 6, w + 12, h + 12, 14);
    g.fillStyle(fill, 1); g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, 0xe7c99d, 0.65); g.strokeRoundedRect(x + 8, y + 8, w - 16, h - 16, 8);
  };
  rug(ox + 82, fy + 86, 250, 150, 0x8d4d5f, 0x593446);
  rug(cx + 86, fy + 48, 210, 168, 0xb16d7d, 0x75485b);
  rug(cx + 52, fy + 250, 270, 126, 0x557056, 0x384d3b);

  // Kitchen counters on the back-left wall.
  g.fillStyle(0x5b3d2d, 1); g.fillRect(ox + 36, oy + 34, 240, 62);
  g.fillStyle(0xb48b63, 1); g.fillRect(ox + 36, oy + 34, 240, 8);
  for (let x = ox + 46; x < ox + 260; x += 54) {
    g.fillStyle(0x76503a, 1); g.fillRect(x, oy + 48, 42, 40);
    g.fillStyle(0xc69b70, 1); g.fillRect(x + 18, oy + 66, 5, 3);
  }
  g.fillStyle(0xa7b0ad, 1); g.fillRect(ox + 126, oy + 44, 54, 20);
  g.fillStyle(0x6f8583, 1); g.fillRect(ox + 134, oy + 48, 38, 12);
  g.fillStyle(0x887058, 1); g.fillRect(ox + 88, oy + 24, 142, 8);

  // Window and curtains in bedroom area.
  const wx = cx + 210;
  g.fillStyle(0x5a3b2d, 1); g.fillRect(wx - 58, oy + 24, 116, 74);
  g.fillStyle(0x91bfd1, 1); g.fillRect(wx - 49, oy + 32, 98, 56);
  g.fillStyle(0xe4d5b1, 0.45); g.fillRect(wx - 49, oy + 32, 98, 18);
  g.fillStyle(0x75445b, 1); g.fillRect(wx - 66, oy + 18, 22, 86); g.fillRect(wx + 44, oy + 18, 22, 86);
  g.fillStyle(0xb96c89, 1); g.fillRect(wx - 59, oy + 18, 8, 86); g.fillRect(wx + 51, oy + 18, 8, 86);

  // Dining table.
  g.fillStyle(0x6a4733, 1); g.fillRoundedRect(ox + 118, fy + 116, 178, 72, 8);
  g.fillStyle(0x9a704c, 1); g.fillRoundedRect(ox + 126, fy + 122, 162, 56, 6);
  g.fillStyle(0xf0dfc8, 1); g.fillCircle(ox + 207, fy + 150, 11);
  g.fillStyle(0xd8879d, 1); g.fillCircle(ox + 204, fy + 147, 5);

  // Green sofa + coffee table in living corner.
  g.fillStyle(0x35523f, 1); g.fillRoundedRect(ox + 94, fy + 286, 205, 78, 18);
  g.fillStyle(0x527159, 1); g.fillRoundedRect(ox + 104, fy + 294, 185, 54, 14);
  g.fillStyle(0xe6c7ae, 1); g.fillRoundedRect(ox + 128, fy + 307, 38, 28, 9);
  g.fillStyle(0xc98fa4, 1); g.fillRoundedRect(ox + 220, fy + 307, 38, 28, 9);
  g.fillStyle(0x60412f, 1); g.fillRoundedRect(ox + 154, fy + 372, 112, 42, 7);

  // Study desk on right.
  g.fillStyle(0x5f402e, 1); g.fillRoundedRect(cx + 118, fy + 290, 160, 68, 7);
  g.fillStyle(0x9a704c, 1); g.fillRect(cx + 128, fy + 300, 140, 48);
  g.fillStyle(0xe6dcc9, 1); g.fillRect(cx + 150, fy + 311, 42, 28);
  g.fillStyle(0x3d563f, 1); g.fillRoundedRect(cx + 209, fy + 306, 40, 34, 5);

  // Plants, books and little domestic details.
  for (const [px, py] of [
    [ox + 54, fy + 286], [cx + 354, fy + 250], [cx + 340, oy + 72], [ox + 318, oy + 80],
  ] as [number, number][]) {
    g.fillStyle(0x9d6846, 1); g.fillRoundedRect(px - 11, py + 8, 22, 16, 4);
    g.fillStyle(0x466d46, 1); g.fillCircle(px, py, 15);
    g.fillStyle(0x67905a, 1); g.fillCircle(px - 8, py - 8, 8); g.fillCircle(px + 8, py - 9, 8);
  }

  // Soft pools of warm light.
  for (const [lx, ly] of [[cx - 250, fy + 210], [cx + 230, fy + 180], [cx + 220, fy + 340]] as [number, number][]) {
    for (let r = 5; r > 0; r--) {
      g.fillStyle(0xffd18a, 0.018 + r * 0.004);
      g.fillCircle(lx, ly, r * 26);
    }
  }
}

export function installHomeRemaster(QuestScene: SceneCtor, QuestHouseScene: SceneCtor) {
  const world = QuestScene.prototype;
  if (!world.__homeExteriorRemasterInstalled) {
    world.__homeExteriorRemasterInstalled = true;
    const originalCreate = world.create;
    world.create = function remasteredWorldCreate(this: SceneLike, ...args: any[]) {
      const result = originalCreate.apply(this, args);
      redrawCottage(this);

      // A bit smaller than the previous visual-remaster pass while keeping
      // Maria's physics body and movement unchanged.
      if (this.player?.active) this.player.setData("visualRemasterScale", 0.95);

      const spot = this.houseSpot?.() as [number, number] | null | undefined;
      if (spot) {
        const [hx, hy] = spot;
        removeTreesNearHouse(this, hx, hy);
        decorateHouseYard(this, hx, hy);
      }
      return result;
    };
  }

  const house = QuestHouseScene.prototype;
  if (!house.__homeInteriorRemasterInstalled) {
    house.__homeInteriorRemasterInstalled = true;
    const originalCreate = house.create;
    house.create = function remasteredHouseCreate(this: SceneLike, ...args: any[]) {
      const result = originalCreate.apply(this, args);
      drawInterior(this);
      if (this.player?.active) this.player.setScale(1.08);
      return result;
    };
  }
}
