// @ts-nocheck -- Act IV presentation remaster layered around existing progression.
import * as Phaser from "phaser";

const ZONE = "starry_ascent";
const STATE = "__act4StarryRemaster";

const PILLARS: [number, number][] = [
  [54, 78],
  [88, 68],
  [42, 46],
  [72, 30],
  [26, 72],
];

function safeDestroy(obj: any) {
  try { obj?.destroy?.(); } catch { /* scene shutdown */ }
}

/**
 * High-detail Act-IV scenery drawn into a small number of Graphics objects.
 * It is deliberately render-only: no physics bodies, no colliders, no input,
 * no timers and no update-loop work. Keeping it out of Arcade Physics means
 * this art can never block Maria's movement.
 */
function addStaticScenery(scene: any) {
  const scenery: any[] = [];
  if (!scene?.add?.graphics || !scene?.wx || !scene?.wy) return scenery;

  const ground = scene.add.graphics().setDepth(2);
  const decor = scene.add.graphics().setDepth(4);
  const glow = scene.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
  scenery.push(ground, glow, decor);

  const X = (gx: number) => scene.wx(gx);
  const Y = (gy: number) => scene.wy(gy);

  const constellations: [number, number][][] = [
    [[12, 18], [18, 22], [24, 18], [30, 24]],
    [[94, 34], [100, 30], [106, 36], [112, 31]],
    [[18, 58], [24, 54], [30, 60], [36, 56]],
    [[74, 72], [80, 76], [86, 72], [92, 78]],
    [[48, 88], [54, 84], [60, 90], [66, 86]],
  ];
  constellations.forEach((chain, ci) => {
    glow.lineStyle(4, ci % 2 ? 0x8d9dff : 0x73c7ff, 0.035);
    ground.lineStyle(1, ci % 2 ? 0xc8c4ff : 0xaedcff, 0.24);
    for (let i = 0; i < chain.length - 1; i++) {
      const [ax, ay] = chain[i]!;
      const [bx, by] = chain[i + 1]!;
      glow.lineBetween(X(ax), Y(ay), X(bx), Y(by));
      ground.lineBetween(X(ax), Y(ay), X(bx), Y(by));
    }
    chain.forEach(([gx, gy], i) => {
      glow.fillStyle(i === 1 ? 0xffe7a6 : 0xb9d8ff, 0.16);
      glow.fillCircle(X(gx), Y(gy), 5.5);
      ground.fillStyle(i === 1 ? 0xffedb8 : 0xe9f1ff, 0.72);
      ground.fillCircle(X(gx), Y(gy), i === 1 ? 2.5 : 1.8);
      ground.fillStyle(0xb9c8ff, 0.42);
      ground.fillCircle(X(gx + 1.4), Y(gy - 1.1), 0.9);
    });
  });

  const crystals: [number, number, number][] = [
    [10, 30, 0x658de8], [16, 12, 0x8876db], [36, 10, 0x5e9de8],
    [58, 12, 0x8675dd], [116, 16, 0x6698ea], [120, 40, 0x7889e6],
    [118, 66, 0x9b83e8], [110, 90, 0x6899e9], [72, 92, 0x8c78e1],
    [14, 88, 0x639ce8], [8, 68, 0x8b75df], [98, 88, 0x6694e2],
  ];
  crystals.forEach(([gx, gy, base], i) => {
    const x = X(gx), y = Y(gy);
    const h = 17 + (i % 3) * 4;
    ground.fillStyle(0x070d22, 0.26);
    ground.fillEllipse(x + 4, y + 7, 35, 11);
    glow.fillStyle(i % 2 ? 0xbca9ff : 0x8fd7ff, 0.07);
    glow.fillCircle(x, y - 4, 22);
    decor.fillStyle(base, 0.82);
    decor.fillTriangle(x - 7, y + 5, x, y - h, x + 6, y + 5);
    decor.fillStyle(0xbdd6ff, 0.5);
    decor.fillTriangle(x, y - h, x + 6, y + 5, x + 2, y - 2);
    decor.fillStyle(i % 2 ? 0x705bc7 : 0x4777bf, 0.76);
    decor.fillTriangle(x - 13, y + 6, x - 7, y - h * 0.58, x - 2, y + 6);
    decor.fillStyle(0xd9d2ff, 0.58);
    decor.fillTriangle(x + 5, y + 7, x + 11, y - h * 0.46, x + 15, y + 7);
    decor.lineStyle(1, 0xeaf3ff, 0.42);
    decor.lineBetween(x, y - h + 2, x, y + 3);
    glow.fillStyle(0xffffff, 0.36);
    glow.fillCircle(x + 1, y - h + 4, 1.5);
  });

  const rocks: [number, number][] = [
    [20, 34], [34, 74], [48, 28], [64, 64], [82, 40],
    [96, 76], [108, 48], [44, 82], [76, 18], [24, 46],
  ];
  rocks.forEach(([gx, gy], i) => {
    const x = X(gx), y = Y(gy);
    ground.fillStyle(0x070c20, 0.3);
    ground.fillEllipse(x + 5, y + 6, 34, 12);
    decor.fillStyle(0x26365e, 0.9);
    decor.fillEllipse(x, y, 25 + (i % 3) * 3, 15);
    decor.fillStyle(0x3f527f, 0.86);
    decor.fillEllipse(x + 10, y + 2, 14, 9);
    decor.lineStyle(1, 0x8fa7d4, 0.35);
    decor.strokeEllipse(x - 2, y - 2, 17, 7);
    decor.fillStyle(i % 3 === 0 ? 0xffdf8b : 0xa9c9ff, 0.72);
    decor.fillCircle(x - 4, y - 2, 1.4);
    decor.fillCircle(x + 7, y + 1, 1);
  });

  const flowers: [number, number, number][] = [
    [30, 18, 0xb9d8ff], [38, 38, 0xd8c8ff], [52, 54, 0xaed9ff],
    [66, 82, 0xffd88d], [80, 60, 0xcab9ff], [94, 54, 0xa9d9ff],
    [106, 26, 0xd9c9ff], [102, 84, 0xffdda0], [22, 78, 0xb8d3ff],
    [58, 18, 0xcabaff], [86, 24, 0xa9d9ff], [112, 72, 0xd6c5ff],
  ];
  flowers.forEach(([gx, gy, color], i) => {
    const x = X(gx), y = Y(gy);
    const r = 3.2 + (i % 2) * 0.6;
    glow.fillStyle(color, 0.07);
    glow.fillCircle(x, y, 11);
    decor.fillStyle(color, 0.72);
    for (let p = 0; p < 5; p++) {
      const a = -Math.PI / 2 + p * Math.PI * 0.4;
      decor.fillCircle(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.8);
    }
    decor.fillStyle(0xffedaa, 0.95);
    decor.fillCircle(x, y, 1.6);
    decor.lineStyle(1, 0x7187a8, 0.34);
    decor.lineBetween(x, y + 4, x - 1, y + 10);
  });

  PILLARS.forEach(([gx, gy], i) => {
    const x = X(gx), y = Y(gy);
    const c = i % 2 ? 0xd4c6ff : 0xb5d8ff;
    glow.lineStyle(5, c, 0.035);
    glow.strokeCircle(x, y, 21);
    ground.lineStyle(1, c, 0.3);
    ground.strokeCircle(x, y, 18);
    ground.strokeCircle(x, y, 12);
    ground.lineBetween(x - 24, y, x - 15, y);
    ground.lineBetween(x + 15, y, x + 24, y);
    ground.lineBetween(x, y - 21, x, y - 13);
    ground.lineBetween(x, y + 13, x, y + 21);
    ground.lineBetween(x - 13, y - 13, x - 8, y - 8);
    ground.lineBetween(x + 8, y + 8, x + 13, y + 13);
    ground.fillStyle(0xffe6a2, 0.55);
    ground.fillCircle(x, y, 2);
  });

  const approach: [number, number][] = [
    [86, 34], [90, 31], [94, 28], [98, 25],
    [88, 38], [92, 35], [96, 32], [100, 29],
  ];
  approach.forEach(([gx, gy], i) => {
    const x = X(gx), y = Y(gy);
    ground.fillStyle(0x090f27, 0.28);
    ground.fillEllipse(x + 2, y + 4, 16, 7);
    const c = i % 2 ? 0xbda9ff : 0xffdc82;
    decor.fillStyle(c, 0.58);
    decor.fillTriangle(x, y - 7, x - 4, y, x, y + 7);
    decor.fillTriangle(x, y - 7, x + 4, y, x, y + 7);
    decor.lineStyle(1, 0xf5f3ff, 0.42);
    decor.lineBetween(x, y - 5, x, y + 4);
    glow.fillStyle(c, 0.08);
    glow.fillCircle(x, y, 10);
  });

  const ox = X(100), oy = Y(24);
  ground.lineStyle(2, 0x9ebcff, 0.18);
  ground.strokeEllipse(ox, oy + 12, 112, 34);
  ground.lineStyle(1, 0xffe3a0, 0.22);
  ground.strokeEllipse(ox, oy + 12, 88, 24);
  glow.fillStyle(0x8caeff, 0.025);
  glow.fillEllipse(ox, oy + 12, 118, 38);

  return scenery;
}

function addCelestialWildlife(scene: any) {
  const animals: any[] = [];
  const addDrifter = (texture: string, gx: number, gy: number, tint: number, scale: number, driftX: number, driftY: number, duration: number) => {
    if (!scene.textures?.exists?.(texture)) return;
    const x = scene.wx(gx), y = scene.wy(gy);
    const animal = scene.add.sprite(x, y, texture).setTint(tint).setScale(scale).setAlpha(0.88).setDepth(9);
    animal.setData?.("act4-celestial-wildlife", true);
    animals.push(animal);
    scene.tweens.add({ targets: animal, x: x + driftX, y: y + driftY, duration, yoyo: true, repeat: -1, ease: "Sine.easeInOut", onYoyo: () => animal?.active && animal.setFlipX?.(driftX < 0), onRepeat: () => animal?.active && animal.setFlipX?.(driftX >= 0) });
    scene.tweens.add({ targets: animal, alpha: { from: 0.72, to: 1 }, duration: 1300 + Math.floor(duration * 0.18), yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  };
  addDrifter("deer", 18, 22, 0xb9d8ff, 1.18, 52, 8, 5200);
  addDrifter("deer", 112, 76, 0xe5d5ff, 1.08, -46, -6, 5700);
  addDrifter("bird", 30, 32, 0xc8b9ff, 1.24, 72, -22, 3100);
  addDrifter("bird", 92, 20, 0x9fdcff, 1.18, -84, 18, 3400);
  addDrifter("bird", 108, 58, 0xffe5a8, 1.12, 66, -16, 3600);
  addDrifter("butterfly", 38, 86, 0xd8c8ff, 1.2, 34, -28, 2800);
  addDrifter("butterfly", 78, 54, 0xaedfff, 1.15, -30, -24, 3000);
  return animals;
}

function resizePastorAdriel(scene: any) {
  // Pastor Adriel is an ordinary guest interactable. Resize only his rendered
  // sprite: +15% width and +5% height. His interaction radius/body is untouched.
  const list = Array.isArray(scene.interactables) ? scene.interactables : [];
  const adriel = list.find((it: any) => it?.kind === "guest" && it?.id === "adriel");
  const sprite = adriel?.obj;
  if (!sprite?.active || sprite.getData?.("adriel-resized")) return;
  sprite.setData?.("adriel-resized", true);
  sprite.setScale(sprite.scaleX * 1.15, sprite.scaleY * 1.05);
}

function makeState(scene: any) {
  const summit = { x: scene.wx(84), y: scene.wy(16) };
  const beamGfx = scene.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
  const shrineGlows: any[] = [];
  const shrineCores: any[] = [];
  PILLARS.forEach(([gx, gy], i) => {
    const x = scene.wx(gx), y = scene.wy(gy);
    const glow = scene.add.circle(x, y + 8, 30, 0x8298ff, 0.055).setStrokeStyle(1, 0xb9c5ff, 0.32).setDepth(3);
    const core = scene.add.sprite(x, y - 26, "spark").setTint(0xb9c5ff).setBlendMode(Phaser.BlendModes.ADD).setScale(1.35).setAlpha(0.48).setDepth(7);
    shrineGlows.push(glow); shrineCores.push(core);
    scene.tweens.add({ targets: core, alpha: { from: 0.34, to: 0.72 }, scale: { from: 1.18, to: 1.7 }, duration: 1450 + i * 110, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  });
  const summitHalo = scene.add.circle(summit.x, summit.y, 52, 0xffe8a8, 0.035).setStrokeStyle(2, 0xe9ddff, 0.28).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: summitHalo, alpha: { from: 0.03, to: 0.12 }, radius: { from: 48, to: 66 }, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  const edgeStars: any[] = [];
  const points: [number, number][] = [[9,16],[22,10],[42,12],[61,8],[83,10],[106,13],[122,20],[8,42],[124,48],[10,74],[122,78],[24,94],[52,96],[84,95],[108,91]];
  points.forEach(([gx, gy], i) => {
    const s = scene.add.sprite(scene.wx(gx), scene.wy(gy), "spark").setTint(i % 3 === 0 ? 0xffe6a8 : 0xcbd5ff).setScale(0.55 + (i % 4) * 0.12).setAlpha(0.18 + (i % 3) * 0.08).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: s, alpha: { from: s.alpha * 0.55, to: Math.min(0.75, s.alpha + 0.25) }, scale: s.scaleX * 1.35, duration: 1700 + i * 95, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    edgeStars.push(s);
  });
  return { summit, beamGfx, shrineGlows, shrineCores, summitHalo, edgeStars, staticScenery: addStaticScenery(scene), celestialWildlife: addCelestialWildlife(scene), lastPillarSignature: "", lastGoldCount: 0, stairsCelebrated: false, nextRefreshAt: 0, nextStarAt: Number(scene.time?.now ?? 0) + Phaser.Math.Between(14000, 21000), fallingStar: null };
}

function pillarValues(scene: any): number[] { const raw = scene.zoneState?.["pillars"]; if (!Array.isArray(raw)) return []; return raw.slice(0, PILLARS.length).map((value: any) => Number(value)); }
function goldPillars(scene: any): number[] { const values = pillarValues(scene); const gold: number[] = []; values.forEach((value, index) => { if (value === 1) gold.push(index); }); return gold; }
function allPillarsGold(scene: any) { const pillars = pillarValues(scene); return pillars.length === PILLARS.length && pillars.every((value) => value === 1); }
function redrawBeams(scene: any, state: any, gold: number[]) { state.beamGfx.clear(); gold.forEach((idx: number) => { const spot = PILLARS[idx]; if (!spot) return; const x = scene.wx(spot[0]), y = scene.wy(spot[1]); state.beamGfx.lineStyle(7, 0xffdc83, 0.055); state.beamGfx.lineBetween(x, y - 20, state.summit.x, state.summit.y + 6); state.beamGfx.lineStyle(2, 0xfff3be, 0.34); state.beamGfx.lineBetween(x, y - 20, state.summit.x, state.summit.y + 6); }); }
function refreshPillars(scene: any, force = false) { if (scene.save?.current_zone !== ZONE) return; const state = scene[STATE]; if (!state) return; const values = pillarValues(scene), signature = values.join(","); if (!force && signature === state.lastPillarSignature) return; const previousGoldCount = Number(state.lastGoldCount ?? 0), gold = goldPillars(scene); state.lastPillarSignature = signature; state.lastGoldCount = gold.length; redrawBeams(scene, state, gold); PILLARS.forEach((_spot, i) => { const done = gold.includes(i), glow = state.shrineGlows[i], core = state.shrineCores[i]; glow?.setFillStyle?.(done ? 0xffd66f : 0x8298ff, done ? 0.16 : 0.055); glow?.setStrokeStyle?.(done ? 3 : 1, done ? 0xffefad : 0xb9c5ff, done ? 0.82 : 0.32); core?.setTint?.(done ? 0xffe27e : 0xb9c5ff); core?.setAlpha?.(done ? 0.9 : 0.48); }); if (!force && gold.length > previousGoldCount) { const newlyGold = gold.find((index) => !String(state.previousGoldSignature ?? "").split(",").includes(String(index))); if (newlyGold != null) { const [gx, gy] = PILLARS[newlyGold]; const x = scene.wx(gx), y = scene.wy(gy); scene.spawnSparkle?.(x, y - 18, 0xffe185, 28); scene.cameras?.main?.flash?.(180, 255, 239, 180); scene.emitToast?.(`Pillar ${gold.length}/5 turns gold — its light reaches toward the summit.`); } } state.previousGoldSignature = gold.join(","); }

function celebrateStaircase(scene: any) {
  if (scene.save?.current_zone !== ZONE) return; const state = scene[STATE]; if (!state || state.stairsCelebrated) return; state.stairsCelebrated = true;
  const cam = scene.cameras.main; cam.flash(380, 255, 241, 190); cam.shake(260, 0.0022);
  const label = scene.add.text(cam.width / 2, cam.height * 0.29, "✦  THE CELESTIAL STAIRCASE AWAKENS  ✦", { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: cam.width < 700 ? "15px" : "20px", fontStyle: "bold", color: "#fff2ba", stroke: "#10152e", strokeThickness: 5, align: "center" }).setOrigin(0.5).setScrollFactor(0).setDepth(200030).setAlpha(0).setScale(0.96);
  scene.tweens.add({ targets: label, alpha: 1, scale: 1, duration: 420, ease: "Sine.easeOut" });
  scene.time.delayedCall(1800, () => scene.tweens.add({ targets: label, alpha: 0, y: label.y - 8, duration: 650, ease: "Sine.easeIn", onComplete: () => safeDestroy(label) }));
  for (let i = 0; i < 15; i++) scene.time.delayedCall(i * 70, () => { if (scene.save?.current_zone !== ZONE) return; const t = i / 14, x = Phaser.Math.Linear(scene.wx(60), scene.wx(84), t), y = Phaser.Math.Linear(scene.wy(25), scene.wy(16), t); const step = scene.add.rectangle(x, y, 34, 8, 0xffe8a1, 0.12).setStrokeStyle(1, 0xffffff, 0.35).setDepth(4).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0); scene.tweens.add({ targets: step, alpha: { from: 0, to: 0.52 }, scaleX: { from: 0.35, to: 1 }, duration: 420, ease: "Back.easeOut" }); scene.tweens.add({ targets: step, alpha: 0.22, duration: 1800, delay: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }); scene.spawnSparkle?.(x, y, 0xffe8a1, 4); });
}

function chooseStarLanding(scene: any) { const p = scene.player; if (!p) return null; const worldW = Math.max(400, Number(scene.mapW ?? 180) * 16), worldH = Math.max(400, Number(scene.mapH ?? 180) * 16); for (let i = 0; i < 10; i++) { const a = Phaser.Math.FloatBetween(0, Math.PI * 2), d = Phaser.Math.Between(150, 280), x = Phaser.Math.Clamp(p.x + Math.cos(a) * d, 80, worldW - 80), y = Phaser.Math.Clamp(p.y + Math.sin(a) * d, 80, worldH - 80), tile = scene.layer?.getTileAtWorldXY?.(x, y); if (tile && !tile.collides) return { x, y }; } return { x: p.x + 150, y: p.y }; }
function launchFallingStar(scene: any, state: any) { if (state.fallingStar?.active || scene.frozen || scene.boss?.active) return; const landing = chooseStarLanding(scene); if (!landing) return; const startX = landing.x - 250, startY = landing.y - 210; const star = scene.add.sprite(startX, startY, "spark").setTint(0xffe58a).setBlendMode(Phaser.BlendModes.ADD).setScale(3.5).setAlpha(0.92).setDepth(11); const trail = scene.add.graphics().setDepth(10).setBlendMode(Phaser.BlendModes.ADD); trail.lineStyle(5, 0xffe58a, 0.14).lineBetween(startX, startY, landing.x, landing.y); trail.lineStyle(2, 0xffffff, 0.34).lineBetween(startX, startY, landing.x, landing.y); state.fallingStar = star; scene.tweens.add({ targets: star, x: landing.x, y: landing.y, scale: 0.7, alpha: 0, duration: 450, ease: "Cubic.easeIn", onComplete: () => { safeDestroy(trail); safeDestroy(star); state.fallingStar = null; try { scene.spawnSparkle?.(landing.x, landing.y, 0xffe58a, 5); } catch {} } }); }
function updateFallingStar(scene: any, state: any, time: number) { if (!state.fallingStar && time >= state.nextStarAt) { launchFallingStar(scene, state); state.nextStarAt = time + Phaser.Math.Between(19000, 30000); } }

export function installAct4StarryAscentRemaster(QuestScene: any) {
  const proto = QuestScene?.prototype; if (!proto || proto.__act4StarryAscentRemasterInstalled) return; proto.__act4StarryAscentRemasterInstalled = true;
  const originalSpawnActBoss = proto.spawnActBoss;
  if (typeof originalSpawnActBoss === "function") proto.spawnActBoss = function act4GoldenPillarBossGate(...args: any[]) { const explicitConfig = args[2]; if (this.save?.current_zone === ZONE && this.__act4BuildingBase && !explicitConfig) { this.__act4MainBossDeferred = true; return null; } return originalSpawnActBoss.apply(this, args); };
  const originalBuildAct4 = proto.buildAct4;
  if (typeof originalBuildAct4 === "function") proto.buildAct4 = function act4StarryRemasterBuild(...args: any[]) { this.__act4BuildingBase = true; this.__act4MainBossDeferred = false; this.__act4MainBossSpawned = false; let result: any; try { result = originalBuildAct4.apply(this, args); } finally { this.__act4BuildingBase = false; } resizePastorAdriel(this); this[STATE] = makeState(this); refreshPillars(this, true); return result; };
  const originalOpenStaircase = proto.openStaircase;
  if (typeof originalOpenStaircase === "function") proto.openStaircase = function act4StarryRemasterStaircase(...args: any[]) { const result = originalOpenStaircase.apply(this, args); celebrateStaircase(this); return result; };
  const originalUpdate = proto.update;
  if (typeof originalUpdate === "function") proto.update = function act4StarryRemasterUpdate(time: number, delta: number) { const result = originalUpdate.call(this, time, delta); if (this.save?.current_zone !== ZONE) return result; const state = this[STATE]; if (!state) return result; if (time >= state.nextRefreshAt) { state.nextRefreshAt = time + 220; refreshPillars(this); } if (!this.__act4MainBossSpawned && this.__act4MainBossDeferred && allPillarsGold(this) && !this.boss?.active && !this.bossTalking) { this.__act4MainBossSpawned = true; this.__act4MainBossDeferred = false; originalSpawnActBoss?.call(this, 100, 32); this.spawnSparkle?.(this.wx(100), this.wy(32), 0xffe59a, 34); this.cameras?.main?.flash?.(220, 255, 239, 180); this.emitToast?.("All five pillars burn gold — a presence awakens at the observatory."); this.objective = `${this.bossName || "The final guardian"} awaits at the Starry Observatory.`; this.pushHud?.(true); } updateFallingStar(this, state, time); return result; };
  const originalCreate = proto.create;
  if (typeof originalCreate === "function") proto.create = function act4StarryRemasterCreate(...args: any[]) { this[STATE] = null; this.__act4BuildingBase = false; this.__act4MainBossDeferred = false; this.__act4MainBossSpawned = false; return originalCreate.apply(this, args); };
}
