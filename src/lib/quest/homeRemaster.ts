// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const HOUSE_CLEAR_RADIUS = 184;

function canvasTexture(scene: SceneLike, key: string) {
  if (!scene.textures.exists(key)) return null;
  const texture = scene.textures.get(key) as any;
  const source = texture.getSourceImage?.();
  if (!(source instanceof HTMLCanvasElement)) return null;
  return { texture, canvas: source as HTMLCanvasElement };
}

/** Redraw the existing `cottage` texture in place so all house logic stays intact. */
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
  const sx = w / 64;
  const sy = h / 58;
  const R = (x: number, y: number, rw: number, rh: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x * sx), Math.round(y * sy), Math.ceil(rw * sx), Math.ceil(rh * sy));
  };

  // Ground shadow and stone foundation.
  R(5, 49, 54, 5, "rgba(24,18,20,.42)");
  R(7, 42, 50, 8, "#736b68");
  for (let x = 8; x < 56; x += 8) {
    R(x, 43 + ((x / 8) % 2), 6, 3, "#92877f");
    R(x + 2, 47, 6, 2, "#5d5857");
  }

  // Pink plaster cottage body with warm timber structure.
  R(7, 25, 50, 20, "#c9828f");
  R(9, 27, 46, 16, "#d99aa4");
  R(7, 24, 50, 3, "#654637");
  for (const x of [9, 31, 53]) R(x, 26, 2, 18, "#6c4938");
  R(9, 40, 46, 3, "#76503c");

  // Deep layered slate roof with a stronger cottage silhouette.
  ctx.fillStyle = "#243247";
  ctx.beginPath();
  ctx.moveTo(2 * sx, 27 * sy);
  ctx.lineTo(31 * sx, 5 * sy);
  ctx.lineTo(62 * sx, 27 * sy);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a2637";
  ctx.beginPath();
  ctx.moveTo(7 * sx, 25 * sy);
  ctx.lineTo(31 * sx, 8 * sy);
  ctx.lineTo(57 * sx, 25 * sy);
  ctx.lineTo(53 * sx, 27 * sy);
  ctx.lineTo(31 * sx, 12 * sy);
  ctx.lineTo(11 * sx, 27 * sy);
  ctx.closePath();
  ctx.fill();
  for (let y = 12; y <= 23; y += 4) {
    const inset = Math.max(0, (23 - y) * 1.15);
    for (let x = 8 + inset; x < 56 - inset; x += 7) R(x, y, 6, 2, y % 8 ? "#3d5069" : "#34465e");
  }
  R(28, 7, 7, 2, "#556a84");

  // Stone chimney with individual block highlights.
  R(47, 5, 7, 14, "#6b625e");
  R(46, 4, 9, 3, "#4f4948");
  for (let y = 7; y < 18; y += 4) {
    R(48, y, 3, 2, "#8c8179");
    R(52, y + 2, 2, 2, "#7a716c");
  }

  // Small attic window tucked into the gable.
  R(27, 15, 9, 8, "#563e35");
  R(28, 16, 7, 6, "#ffc975");
  R(31, 16, 1, 6, "#84624a");
  R(28, 18, 7, 1, "#84624a");

  // Recessed arched door and stone threshold.
  R(26, 31, 11, 15, "#4d3027");
  ctx.fillStyle = "#4d3027";
  ctx.beginPath();
  ctx.arc(31.5 * sx, 31 * sy, 5.5 * sx, Math.PI, 0);
  ctx.fill();
  R(27, 34, 2, 9, "#74493a");
  R(34, 36, 1, 1, "#f0c86d");
  R(24, 45, 15, 2, "#9c8d82");
  R(25, 47, 13, 2, "#756d68");

  // Warm windows with mullions and flower boxes.
  for (const x of [12, 43]) {
    R(x - 1, 29, 10, 10, "#4f382f");
    R(x, 30, 8, 8, "#ffd27c");
    R(x, 30, 8, 3, "#ffe6a8");
    R(x + 3.5, 30, 1, 8, "#7b5a43");
    R(x, 33.5, 8, 1, "#7b5a43");
    R(x - 2, 39, 12, 3, "#694737");
    for (const [dx, c] of [[0, "#d96587"], [3, "#f4a6ba"], [6, "#e57f9c"], [8, "#f6c1cf"]]) R(x + dx, 38, 2, 2, c);
  }

  // Climbing rose vines around the doorway and roof edge.
  const vine = [
    [23, 28], [21, 31], [20, 34], [20, 38], [22, 41], [40, 27], [41, 30], [42, 34], [42, 38],
    [14, 24], [18, 22], [22, 21], [39, 21], [44, 23], [48, 25],
  ];
  for (let i = 0; i < vine.length; i++) {
    const [x, y] = vine[i]!;
    R(x, y, 2, 2, i % 3 ? "#648453" : "#7f9b62");
    if (i % 2 === 0) R(x + 1, y - 1, 2, 2, i % 4 ? "#e67698" : "#f2a6ba");
  }

  // Lanterns by the door.
  for (const x of [22, 40]) {
    R(x, 33, 2, 6, "#2e2d32");
    R(x - 1, 34, 4, 3, "#ffcf70");
    R(x, 34, 2, 1, "#fff0ae");
  }

  texture.refresh?.();
}

function removeTreesNearHouse(scene: SceneLike, hx: number, hy: number) {
  const near = (obj: any) =>
    obj?.active !== false &&
    obj?.texture?.key === "tree" &&
    Phaser.Math.Distance.Between(obj.x ?? 0, obj.y ?? 0, hx, hy) < HOUSE_CLEAR_RADIUS;

  for (const child of [...scene.children.list]) if (near(child)) child.destroy();
  const solids = (scene.solidDecor?.getChildren?.() ?? []) as any[];
  for (const child of [...solids]) if (near(child)) child.destroy();
}

function decorateHouseYard(scene: SceneLike, hx: number, hy: number) {
  const baseDepth = (scene.dsort?.(hy + 48) ?? 12) - 0.4;
  const g = scene.add.graphics().setDepth(baseDepth);

  // Soft earth apron and a handcrafted stepping-stone approach.
  g.fillStyle(0x70573f, 0.22);
  g.fillEllipse(hx, hy + 46, 176, 86);
  const stones = [
    [-2, 36, 30, 10], [5, 49, 34, 11], [-5, 63, 31, 10], [3, 77, 36, 11], [-3, 92, 30, 10],
  ];
  for (let i = 0; i < stones.length; i++) {
    const [dx, dy, sw, sh] = stones[i]!;
    g.fillStyle(i % 2 ? 0xb9ad98 : 0xc9bda7, 0.96);
    g.fillRoundedRect(hx + dx - sw / 2, hy + dy, sw, sh, 4);
    g.fillStyle(0xffffff, 0.09);
    g.fillRoundedRect(hx + dx - sw / 2 + 3, hy + dy + 2, sw - 6, 2, 2);
  }

  // Layered flower beds and low greenery.
  for (const side of [-1, 1]) {
    const bx = hx + side * 62;
    g.fillStyle(0x49643f, 0.95);
    g.fillEllipse(bx, hy + 48, 64, 30);
    g.fillStyle(0x668354, 0.9);
    g.fillEllipse(bx + side * 5, hy + 42, 48, 20);
  }
  const blooms = [
    [-82, 42, 0xf2a2b9], [-70, 52, 0xdb7192], [-56, 39, 0xf4c4d1], [-47, 51, 0xe487a3],
    [48, 50, 0xf3afc1], [59, 38, 0xe87597], [72, 52, 0xf6c9d4], [84, 43, 0xd9678d],
  ];
  for (const [dx, dy, c] of blooms as [number, number, number][]) {
    g.fillStyle(c, 1);
    g.fillCircle(hx + dx, hy + dy, 4);
    g.fillStyle(0xffe5ed, 0.62);
    g.fillCircle(hx + dx - 1, hy + dy - 1, 1.5);
  }

  // Low lanterns and warm pools, kept decorative only.
  for (const x of [hx - 54, hx + 54]) {
    g.fillStyle(0x2d2e34, 1);
    g.fillRect(x - 2, hy + 53, 4, 25);
    g.fillStyle(0x4d4539, 1);
    g.fillRoundedRect(x - 6, hy + 47, 12, 11, 2);
    g.fillStyle(0xffcf75, 1);
    g.fillRoundedRect(x - 4, hy + 49, 8, 7, 2);
    const glow = scene.add.sprite(x, hy + 54, "light-warm").setDepth(baseDepth - 0.1).setBlendMode(Phaser.BlendModes.ADD).setScale(0.54).setAlpha(0.18);
    scene.tweens.add({ targets: glow, alpha: { from: 0.12, to: 0.23 }, duration: 1500 + Math.random() * 500, yoyo: true, repeat: -1 });
  }

  // A little chimney smoke gives the exterior life without changing collisions.
  for (let i = 0; i < 4; i++) {
    const puff = scene.add.circle(hx + 25 + i * 4, hy - 55 - i * 7, 7 + i * 2, 0xe5e1db, 0.13).setDepth(baseDepth - 0.2);
    scene.tweens.add({
      targets: puff,
      x: puff.x + 12 + i * 4,
      y: puff.y - 26,
      alpha: 0,
      scale: 1.55,
      duration: 2700 + i * 350,
      delay: i * 420,
      repeat: -1,
    });
  }
}

function drawInterior(scene: SceneLike) {
  const ROOM_W = 860;
  const ROOM_H = 560;
  const ox = (scene.scale.width - ROOM_W) / 2;
  const oy = (scene.scale.height - ROOM_H) / 2;
  const fy = oy + 118;
  const cx = ox + ROOM_W / 2;
  const g = scene.add.graphics().setDepth(9.35);

  // Richer structural shell: dark timber frame, warm plaster, dimensional floorboards.
  g.fillStyle(0x241812, 1); g.fillRect(ox, oy, ROOM_W, ROOM_H);
  g.fillStyle(0xd8b795, 1); g.fillRect(ox + 14, oy + 14, ROOM_W - 28, 102);
  g.fillStyle(0x5b3e2d, 1); g.fillRect(ox + 14, fy - 8, ROOM_W - 28, 13);
  for (const x of [ox + 14, ox + 226, cx, ox + 634, ox + ROOM_W - 28]) {
    g.fillStyle(0x513526, 1); g.fillRect(x, oy + 14, 15, 102);
    g.fillStyle(0x76513a, 0.55); g.fillRect(x + 3, oy + 14, 3, 102);
  }

  g.fillStyle(0x805638, 1); g.fillRect(ox + 14, fy + 5, ROOM_W - 28, ROOM_H - 137);
  for (let y = fy + 5; y < oy + ROOM_H - 14; y += 22) {
    g.fillStyle(0x64422e, 0.7); g.fillRect(ox + 14, y, ROOM_W - 28, 2);
    g.fillStyle(0xd9aa73, 0.08); g.fillRect(ox + 14, y + 2, ROOM_W - 28, 2);
    for (let x = ox + 32 + (((y - fy) / 22) % 2) * 44; x < ox + ROOM_W - 20; x += 88) {
      g.fillStyle(0x523522, 0.48); g.fillRect(x, y + 2, 2, 20);
    }
  }

  // Two framed windows with curtains and bright warm panes.
  for (const wx of [ox + 176, ox + ROOM_W - 176]) {
    g.fillStyle(0x4d3327, 1); g.fillRect(wx - 61, oy + 27, 122, 72);
    g.fillStyle(0x8fc0d0, 1); g.fillRect(wx - 51, oy + 35, 102, 54);
    g.fillStyle(0xffdfa0, 0.24); g.fillRect(wx - 51, oy + 35, 102, 18);
    g.fillStyle(0x5b4134, 1); g.fillRect(wx - 3, oy + 35, 6, 54); g.fillRect(wx - 51, oy + 60, 102, 5);
    g.fillStyle(0x7f4860, 1); g.fillRect(wx - 70, oy + 20, 20, 85); g.fillRect(wx + 50, oy + 20, 20, 85);
    g.fillStyle(0xc47790, 0.75); g.fillRect(wx - 63, oy + 20, 6, 85); g.fillRect(wx + 57, oy + 20, 6, 85);
    g.fillStyle(0xd9b35b, 1); g.fillRect(wx - 74, oy + 16, 148, 5);
    g.fillStyle(0x6a4938, 1); g.fillRect(wx - 58, oy + 94, 116, 8);
  }

  // Layered rugs with borders and woven details.
  const rug = (x: number, y: number, w: number, h: number, fill: number, edge: number, accent: number) => {
    g.fillStyle(0x2a1b17, 0.22); g.fillRoundedRect(x - 8, y - 5, w + 16, h + 15, 16);
    g.fillStyle(edge, 1); g.fillRoundedRect(x - 6, y - 6, w + 12, h + 12, 14);
    g.fillStyle(fill, 1); g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(3, accent, 0.55); g.strokeRoundedRect(x + 10, y + 10, w - 20, h - 20, 8);
    g.lineStyle(1, accent, 0.32); g.strokeRoundedRect(x + 18, y + 18, w - 36, h - 36, 6);
  };
  rug(ox + 72, fy + 83, 250, 148, 0x874d5d, 0x583543, 0xe5c49e);
  rug(cx + 80, fy + 55, 232, 178, 0xa86475, 0x714557, 0xf0c8ad);
  rug(cx + 50, fy + 250, 286, 128, 0x49634f, 0x324638, 0xd7c39a);

  // Kitchen wall: counters, sink, shelves, ceramics and hanging herbs.
  g.fillStyle(0x53382b, 1); g.fillRect(ox + 34, oy + 35, 242, 62);
  g.fillStyle(0xb18762, 1); g.fillRect(ox + 34, oy + 35, 242, 8);
  for (let x = ox + 44; x < ox + 260; x += 54) {
    g.fillStyle(0x704a36, 1); g.fillRect(x, oy + 49, 42, 39);
    g.fillStyle(0xa97c58, 0.55); g.fillRect(x + 4, oy + 53, 34, 3);
    g.fillStyle(0xd0a675, 1); g.fillRect(x + 18, oy + 68, 5, 3);
  }
  g.fillStyle(0xaeb9b4, 1); g.fillRect(ox + 126, oy + 45, 54, 20);
  g.fillStyle(0x728b87, 1); g.fillRect(ox + 135, oy + 49, 36, 12);
  g.fillStyle(0x755943, 1); g.fillRect(ox + 67, oy + 22, 168, 8);
  for (let i = 0; i < 5; i++) {
    g.fillStyle(i % 2 ? 0xd8c6ad : 0x8aa3a0, 1);
    g.fillRoundedRect(ox + 78 + i * 30, oy + 10, 15, 12, 4);
  }
  for (const hx of [ox + 248, ox + 266]) {
    g.lineStyle(2, 0x56704b, 1); g.lineBetween(hx, oy + 18, hx - 3, oy + 39);
    g.fillStyle(0x68855b, 1); g.fillCircle(hx - 4, oy + 34, 7); g.fillCircle(hx + 2, oy + 39, 6);
  }

  // Bedroom dressing around the existing interactive bed.
  g.fillStyle(0x563a2b, 1); g.fillRoundedRect(cx + 87, fy + 42, 228, 18, 7);
  g.fillStyle(0xd3a0ac, 1); g.fillRoundedRect(cx + 101, fy + 53, 202, 144, 12);
  g.fillStyle(0xe7c6c4, 1); g.fillRoundedRect(cx + 112, fy + 61, 180, 68, 10);
  g.fillStyle(0xf1e5d7, 1); g.fillRoundedRect(cx + 127, fy + 69, 72, 35, 12);
  g.fillStyle(0xf4dfd5, 1); g.fillRoundedRect(cx + 205, fy + 69, 72, 35, 12);
  g.fillStyle(0xa85e76, 0.74); g.fillRoundedRect(cx + 128, fy + 137, 164, 50, 10);
  g.lineStyle(2, 0xe7b9c1, 0.5); g.strokeRoundedRect(cx + 139, fy + 146, 142, 31, 8);
  g.fillStyle(0x674331, 1); g.fillRoundedRect(cx + 322, fy + 76, 56, 72, 8);
  g.fillStyle(0xc9915e, 1); g.fillRect(cx + 330, fy + 84, 40, 8);
  g.fillStyle(0xf3d7a1, 1); g.fillCircle(cx + 350, fy + 69, 7);

  // Dining table and chairs with flowers and candles.
  g.fillStyle(0x4c3227, 0.25); g.fillRoundedRect(ox + 111, fy + 124, 194, 86, 10);
  g.fillStyle(0x654431, 1); g.fillRoundedRect(ox + 118, fy + 116, 178, 72, 8);
  g.fillStyle(0x9a704c, 1); g.fillRoundedRect(ox + 126, fy + 122, 162, 56, 6);
  for (const [cx2, cy2] of [[ox + 103, fy + 135], [ox + 103, fy + 184], [ox + 310, fy + 135], [ox + 310, fy + 184]]) {
    g.fillStyle(0x5d3d2c, 1); g.fillRoundedRect(cx2 - 14, cy2 - 12, 28, 24, 5);
  }
  g.fillStyle(0xf0dfc8, 1); g.fillCircle(ox + 207, fy + 150, 13);
  for (const [dx, dy, c] of [[0,0,0xd87595],[7,-4,0xf2a8bb],[-7,-3,0xe692aa],[3,6,0xf5c7d1]]) {
    g.fillStyle(c, 1); g.fillCircle(ox + 207 + dx, fy + 146 + dy, 4);
  }
  for (const x of [ox + 163, ox + 252]) {
    g.fillStyle(0xe8c477, 1); g.fillRect(x - 2, fy + 137, 4, 12);
    g.fillStyle(0xffe1a0, 1); g.fillCircle(x, fy + 134, 4);
  }

  // Living corner: upholstered sofa, pillows, coffee table, books.
  g.fillStyle(0x29372f, 0.28); g.fillRoundedRect(ox + 86, fy + 294, 220, 87, 18);
  g.fillStyle(0x35523f, 1); g.fillRoundedRect(ox + 94, fy + 286, 205, 78, 18);
  g.fillStyle(0x527159, 1); g.fillRoundedRect(ox + 104, fy + 294, 185, 54, 14);
  g.fillStyle(0xe6c7ae, 1); g.fillRoundedRect(ox + 128, fy + 306, 42, 30, 9);
  g.fillStyle(0xc98fa4, 1); g.fillRoundedRect(ox + 220, fy + 306, 42, 30, 9);
  g.fillStyle(0x60412f, 1); g.fillRoundedRect(ox + 154, fy + 373, 112, 42, 7);
  g.fillStyle(0xd4b68d, 1); g.fillRect(ox + 172, fy + 382, 32, 18);
  g.fillStyle(0x7b4d5d, 1); g.fillRect(ox + 209, fy + 385, 24, 6);
  g.fillStyle(0x4e6b76, 1); g.fillRect(ox + 209, fy + 392, 28, 6);

  // Study nook with layered books, papers and plant.
  g.fillStyle(0x493026, 0.26); g.fillRoundedRect(cx + 110, fy + 298, 175, 73, 8);
  g.fillStyle(0x5f402e, 1); g.fillRoundedRect(cx + 118, fy + 290, 160, 68, 7);
  g.fillStyle(0x9a704c, 1); g.fillRect(cx + 128, fy + 300, 140, 48);
  g.fillStyle(0xeee3d0, 1); g.fillRect(cx + 146, fy + 311, 46, 29);
  g.fillStyle(0xe1d0b8, 1); g.fillRect(cx + 152, fy + 315, 34, 2);
  g.fillStyle(0x3d563f, 1); g.fillRoundedRect(cx + 209, fy + 306, 40, 34, 5);
  for (let i = 0; i < 4; i++) {
    g.fillStyle([0x9a566a, 0x4e667d, 0x8a744b, 0x567055][i]!);
    g.fillRect(cx + 249, fy + 312 + i * 7, 18 + (i % 2) * 6, 5);
  }

  // Plants, framed memories, candles and small domestic details.
  for (const [px, py] of [[ox + 54, fy + 286], [cx + 354, fy + 250], [cx + 340, oy + 72], [ox + 318, oy + 80]] as [number, number][]) {
    g.fillStyle(0x9d6846, 1); g.fillRoundedRect(px - 11, py + 8, 22, 16, 4);
    g.fillStyle(0x466d46, 1); g.fillCircle(px, py, 15);
    g.fillStyle(0x67905a, 1); g.fillCircle(px - 8, py - 8, 8); g.fillCircle(px + 8, py - 9, 8);
  }
  for (const [px, py, tone] of [[cx - 50, oy + 47, 0x6c87a1], [cx + 43, oy + 46, 0x7b9a6e], [cx + 5, oy + 76, 0xb16f83]] as [number, number, number][]) {
    g.fillStyle(0x654432, 1); g.fillRect(px - 18, py - 15, 36, 30);
    g.fillStyle(tone, 1); g.fillRect(px - 13, py - 10, 26, 20);
    g.fillStyle(0xeccf98, 0.8); g.fillCircle(px + 6, py - 3, 4);
  }
  for (const [px, py] of [[ox + 350, fy + 52], [cx + 362, fy + 225], [cx - 58, fy + 350]] as [number, number][]) {
    g.fillStyle(0xd5b064, 1); g.fillRect(px - 2, py, 4, 13);
    g.fillStyle(0xffdfa0, 1); g.fillCircle(px, py - 3, 4);
  }

  // Subtle firelight and window sheen.
  for (const [lx, ly, scale, alpha] of [[cx, oy + 100, 1.45, 0.18], [ox + 176, fy + 35, 0.85, 0.1], [ox + ROOM_W - 176, fy + 35, 0.85, 0.1]] as [number, number, number, number][]) {
    const light = scene.add.sprite(lx, ly, "light-warm").setDepth(9.3).setBlendMode(Phaser.BlendModes.ADD).setScale(scale).setAlpha(alpha);
    scene.tweens.add({ targets: light, alpha: { from: alpha * 0.72, to: alpha * 1.18 }, duration: 1550 + Math.random() * 650, yoyo: true, repeat: -1 });
  }

  // Sparse dust motes for atmosphere; purely visual and lightweight.
  for (let i = 0; i < 12; i++) {
    const mote = scene.add.circle(ox + 60 + ((i * 67) % 730), fy + 40 + ((i * 91) % 340), 1.2 + (i % 3) * 0.45, 0xffe7bb, 0.12).setDepth(9.45);
    scene.tweens.add({
      targets: mote,
      y: mote.y - 18 - (i % 4) * 5,
      x: mote.x + (i % 2 ? 8 : -8),
      alpha: { from: 0.05, to: 0.22 },
      duration: 3200 + i * 120,
      yoyo: true,
      repeat: -1,
      delay: i * 110,
    });
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
