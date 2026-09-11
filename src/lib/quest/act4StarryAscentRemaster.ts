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
 * Static Act-IV scenery pass. Everything in here is presentation-only:
 * no physics bodies, no colliders, no timers, no per-frame updates, and no
 * progression state. That keeps the plateau richer without adding gameplay
 * risk or a meaningful runtime cost.
 */
function addStaticScenery(scene: any) {
  const scenery: any[] = [];
  const world = scene.add.graphics().setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
  scenery.push(world);

  // Low-contrast constellation lines laid into open ground. One Graphics
  // object draws every line so this stays extremely cheap to render.
  const constellations: [number, number][][] = [
    [[12, 18], [18, 22], [24, 18], [30, 24]],
    [[94, 34], [100, 30], [106, 36], [112, 31]],
    [[18, 58], [24, 54], [30, 60], [36, 56]],
    [[74, 72], [80, 76], [86, 72], [92, 78]],
    [[48, 88], [54, 84], [60, 90], [66, 86]],
  ];
  for (const chain of constellations) {
    world.lineStyle(1, 0xaec8ff, 0.16);
    for (let i = 0; i < chain.length - 1; i++) {
      const [ax, ay] = chain[i]!;
      const [bx, by] = chain[i + 1]!;
      world.lineBetween(scene.wx(ax), scene.wy(ay), scene.wx(bx), scene.wy(by));
    }
    for (const [gx, gy] of chain) {
      world.fillStyle(0xe5edff, 0.35);
      world.fillCircle(scene.wx(gx), scene.wy(gy), 2.1);
    }
  }

  // Edge crystal formations: small, static silhouettes outside the main paths.
  // Triangles are non-interactive GameObjects and never receive physics bodies.
  const crystalClusters: [number, number, number][] = [
    [10, 30, 0x7da6ff], [16, 12, 0x9e8cff], [36, 10, 0x77b8ff],
    [58, 12, 0x9d8dff], [116, 16, 0x7caeff], [120, 40, 0x8f9fff],
    [118, 66, 0xb4a0ff], [110, 90, 0x7faeff], [72, 92, 0xa591ff],
    [14, 88, 0x7cb5ff], [8, 68, 0x9d8cff], [98, 88, 0x79a9ff],
  ];
  crystalClusters.forEach(([gx, gy, tint], index) => {
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const h = 14 + (index % 3) * 4;
    const main = scene.add.triangle(x, y, 0, -h, -7, 8, 7, 8, tint, 0.34)
      .setStrokeStyle(1, 0xdce7ff, 0.28)
      .setDepth(4);
    const shard = scene.add.triangle(x + 8, y + 3, 0, -(h * 0.65), -4, 5, 4, 5, 0xd7cbff, 0.24)
      .setDepth(4);
    scenery.push(main, shard);
  });

  // Small celestial stone clusters fill dead corners without narrowing any
  // route. Ellipses are intentionally low and fully non-colliding.
  const rockClusters: [number, number][] = [
    [20, 34], [34, 74], [48, 28], [64, 64], [82, 40],
    [96, 76], [108, 48], [44, 82], [76, 18], [24, 46],
  ];
  rockClusters.forEach(([gx, gy], i) => {
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const shadow = scene.add.ellipse(x + 4, y + 5, 28, 10, 0x0a1026, 0.18).setDepth(2);
    const a = scene.add.ellipse(x, y, 20 + (i % 3) * 4, 12, 0x34436d, 0.62)
      .setStrokeStyle(1, 0x7d8db8, 0.2)
      .setDepth(4);
    const b = scene.add.ellipse(x + 10, y + 2, 12, 8, 0x46547d, 0.54).setDepth(4);
    scenery.push(shadow, a, b);
  });

  // Star-flowers: reuse an already-loaded texture, but keep these completely
  // static. No animation/tween is attached to any of them.
  if (scene.textures?.exists?.("flowers")) {
    const flowerSpots: [number, number, number][] = [
      [30, 18, 0xcbd7ff], [38, 38, 0xe2d3ff], [52, 54, 0xbfd8ff],
      [66, 82, 0xffe4ad], [80, 60, 0xd8c9ff], [94, 54, 0xbfdcff],
      [106, 26, 0xe2d5ff], [102, 84, 0xffe6b7], [22, 78, 0xc9d8ff],
      [58, 18, 0xd5c8ff], [86, 24, 0xbddcff], [112, 72, 0xdfd0ff],
    ];
    flowerSpots.forEach(([gx, gy, tint], i) => {
      const f = scene.add.sprite(scene.wx(gx), scene.wy(gy), "flowers")
        .setTint(tint)
        .setScale(0.52 + (i % 3) * 0.08)
        .setAlpha(0.68)
        .setDepth(4);
      scenery.push(f);
    });
  }

  // Give each pillar a subtle static four-point floor sigil. The pillar itself
  // remains fully accessible because these are visual marks only.
  PILLARS.forEach(([gx, gy], i) => {
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const g = scene.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    g.lineStyle(1, i % 2 ? 0xe0d5ff : 0xbcd6ff, 0.22);
    g.lineBetween(x - 18, y, x + 18, y);
    g.lineBetween(x, y - 12, x, y + 12);
    g.strokeCircle(x, y, 16);
    scenery.push(g);
  });

  // Observatory approach markers: two quiet rows of star-stones that visually
  // lead toward the landmark without creating a corridor or any collision.
  const approach: [number, number][] = [
    [86, 34], [90, 31], [94, 28], [98, 25],
    [88, 38], [92, 35], [96, 32], [100, 29],
  ];
  approach.forEach(([gx, gy], i) => {
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const base = scene.add.ellipse(x, y + 3, 14, 6, 0x111a38, 0.24).setDepth(2);
    const marker = scene.add.diamond(x, y, 8, 12, i % 2 ? 0xcbbcff : 0xffe3a0, 0.4)
      .setStrokeStyle(1, 0xffffff, 0.22)
      .setDepth(4);
    scenery.push(base, marker);
  });

  return scenery;
}

function addCelestialWildlife(scene: any) {
  const animals: any[] = [];

  const addDrifter = (
    texture: string,
    gx: number,
    gy: number,
    tint: number,
    scale: number,
    driftX: number,
    driftY: number,
    duration: number,
  ) => {
    if (!scene.textures?.exists?.(texture)) return;
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const animal = scene.add.sprite(x, y, texture)
      .setTint(tint)
      .setScale(scale)
      .setAlpha(0.88)
      .setDepth(9);
    animal.setData?.("act4-celestial-wildlife", true);
    animals.push(animal);

    scene.tweens.add({
      targets: animal,
      x: x + driftX,
      y: y + driftY,
      duration,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      onYoyo: () => animal?.active && animal.setFlipX?.(driftX < 0),
      onRepeat: () => animal?.active && animal.setFlipX?.(driftX >= 0),
    });

    scene.tweens.add({
      targets: animal,
      alpha: { from: 0.72, to: 1 },
      duration: 1300 + Math.floor(duration * 0.18),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  };

  // Act-IV-only celestial wildlife. These are decorative sprites only: no
  // collisions, combat, drops, pickups, objectives, or progression hooks.
  addDrifter("deer", 18, 22, 0xb9d8ff, 1.18, 52, 8, 5200);
  addDrifter("deer", 112, 76, 0xe5d5ff, 1.08, -46, -6, 5700);
  addDrifter("bird", 30, 32, 0xc8b9ff, 1.24, 72, -22, 3100);
  addDrifter("bird", 92, 20, 0x9fdcff, 1.18, -84, 18, 3400);
  addDrifter("bird", 108, 58, 0xffe5a8, 1.12, 66, -16, 3600);
  addDrifter("butterfly", 38, 86, 0xd8c8ff, 1.2, 34, -28, 2800);
  addDrifter("butterfly", 78, 54, 0xaedfff, 1.15, -30, -24, 3000);

  return animals;
}

function makeState(scene: any) {
  const summit = { x: scene.wx(84), y: scene.wy(16) };
  const beamGfx = scene.add.graphics().setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
  const shrineGlows: any[] = [];
  const shrineCores: any[] = [];

  PILLARS.forEach(([gx, gy], i) => {
    const x = scene.wx(gx);
    const y = scene.wy(gy);
    const glow = scene.add.circle(x, y + 8, 30, 0x8298ff, 0.055)
      .setStrokeStyle(1, 0xb9c5ff, 0.32)
      .setDepth(3);
    const core = scene.add.sprite(x, y - 26, "spark")
      .setTint(0xb9c5ff)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(1.35)
      .setAlpha(0.48)
      .setDepth(7);
    shrineGlows.push(glow);
    shrineCores.push(core);

    scene.tweens.add({
      targets: core,
      alpha: { from: 0.34, to: 0.72 },
      scale: { from: 1.18, to: 1.7 },
      duration: 1450 + i * 110,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  });

  const summitHalo = scene.add.circle(summit.x, summit.y, 52, 0xffe8a8, 0.035)
    .setStrokeStyle(2, 0xe9ddff, 0.28)
    .setDepth(2)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: summitHalo,
    alpha: { from: 0.03, to: 0.12 },
    radius: { from: 48, to: 66 },
    duration: 2400,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const edgeStars: any[] = [];
  const points: [number, number][] = [
    [9, 16], [22, 10], [42, 12], [61, 8], [83, 10], [106, 13], [122, 20],
    [8, 42], [124, 48], [10, 74], [122, 78], [24, 94], [52, 96], [84, 95], [108, 91],
  ];
  points.forEach(([gx, gy], i) => {
    const s = scene.add.sprite(scene.wx(gx), scene.wy(gy), "spark")
      .setTint(i % 3 === 0 ? 0xffe6a8 : 0xcbd5ff)
      .setScale(0.55 + (i % 4) * 0.12)
      .setAlpha(0.18 + (i % 3) * 0.08)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: s,
      alpha: { from: s.alpha * 0.55, to: Math.min(0.75, s.alpha + 0.25) },
      scale: s.scaleX * 1.35,
      duration: 1700 + i * 95,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    edgeStars.push(s);
  });

  return {
    summit,
    beamGfx,
    shrineGlows,
    shrineCores,
    summitHalo,
    edgeStars,
    staticScenery: addStaticScenery(scene),
    celestialWildlife: addCelestialWildlife(scene),
    lastPillarSignature: "",
    lastGoldCount: 0,
    stairsCelebrated: false,
    nextRefreshAt: 0,
    // Decorative stars appear about twice as often as before.
    nextStarAt: Number(scene.time?.now ?? 0) + Phaser.Math.Between(14000, 21000),
    fallingStar: null,
  };
}

function pillarValues(scene: any): number[] {
  const raw = scene.zoneState?.["pillars"];
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, PILLARS.length).map((value: any) => Number(value));
}

function goldPillars(scene: any): number[] {
  const values = pillarValues(scene);
  const gold: number[] = [];
  values.forEach((value, index) => {
    if (value === 1) gold.push(index);
  });
  return gold;
}

function allPillarsGold(scene: any) {
  const pillars = pillarValues(scene);
  return pillars.length === PILLARS.length && pillars.every((value) => value === 1);
}

function redrawBeams(scene: any, state: any, gold: number[]) {
  state.beamGfx.clear();
  gold.forEach((idx: number) => {
    const spot = PILLARS[idx];
    if (!spot) return;
    const x = scene.wx(spot[0]);
    const y = scene.wy(spot[1]);
    state.beamGfx.lineStyle(7, 0xffdc83, 0.055);
    state.beamGfx.lineBetween(x, y - 20, state.summit.x, state.summit.y + 6);
    state.beamGfx.lineStyle(2, 0xfff3be, 0.34);
    state.beamGfx.lineBetween(x, y - 20, state.summit.x, state.summit.y + 6);
  });
}

function refreshPillars(scene: any, force = false) {
  if (scene.save?.current_zone !== ZONE) return;
  const state = scene[STATE];
  if (!state) return;

  const values = pillarValues(scene);
  const signature = values.join(",");
  if (!force && signature === state.lastPillarSignature) return;

  const previousGoldCount = Number(state.lastGoldCount ?? 0);
  const gold = goldPillars(scene);
  state.lastPillarSignature = signature;
  state.lastGoldCount = gold.length;
  redrawBeams(scene, state, gold);

  PILLARS.forEach((_spot, i) => {
    const done = gold.includes(i);
    const glow = state.shrineGlows[i];
    const core = state.shrineCores[i];
    glow?.setFillStyle?.(done ? 0xffd66f : 0x8298ff, done ? 0.16 : 0.055);
    glow?.setStrokeStyle?.(done ? 3 : 1, done ? 0xffefad : 0xb9c5ff, done ? 0.82 : 0.32);
    core?.setTint?.(done ? 0xffe27e : 0xb9c5ff);
    core?.setAlpha?.(done ? 0.9 : 0.48);
  });

  if (!force && gold.length > previousGoldCount) {
    const newlyGold = gold.find((index) => !String(state.previousGoldSignature ?? "").split(",").includes(String(index)));
    if (newlyGold != null) {
      const [gx, gy] = PILLARS[newlyGold];
      const x = scene.wx(gx), y = scene.wy(gy);
      scene.spawnSparkle?.(x, y - 18, 0xffe185, 28);
      scene.cameras?.main?.flash?.(180, 255, 239, 180);
      scene.emitToast?.(`Pillar ${gold.length}/5 turns gold — its light reaches toward the summit.`);
    }
  }
  state.previousGoldSignature = gold.join(",");
}

function celebrateStaircase(scene: any) {
  if (scene.save?.current_zone !== ZONE) return;
  const state = scene[STATE];
  if (!state || state.stairsCelebrated) return;
  state.stairsCelebrated = true;

  const cam = scene.cameras.main;
  cam.flash(380, 255, 241, 190);
  cam.shake(260, 0.0022);

  const label = scene.add.text(cam.width / 2, cam.height * 0.29, "✦  THE CELESTIAL STAIRCASE AWAKENS  ✦", {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: cam.width < 700 ? "15px" : "20px",
    fontStyle: "bold",
    color: "#fff2ba",
    stroke: "#10152e",
    strokeThickness: 5,
    align: "center",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200030).setAlpha(0).setScale(0.96);

  scene.tweens.add({ targets: label, alpha: 1, scale: 1, duration: 420, ease: "Sine.easeOut" });
  scene.time.delayedCall(1800, () => scene.tweens.add({
    targets: label,
    alpha: 0,
    y: label.y - 8,
    duration: 650,
    ease: "Sine.easeIn",
    onComplete: () => safeDestroy(label),
  }));

  for (let i = 0; i < 15; i++) {
    scene.time.delayedCall(i * 70, () => {
      if (scene.save?.current_zone !== ZONE) return;
      const t = i / 14;
      const x = Phaser.Math.Linear(scene.wx(60), scene.wx(84), t);
      const y = Phaser.Math.Linear(scene.wy(25), scene.wy(16), t);
      const step = scene.add.rectangle(x, y, 34, 8, 0xffe8a1, 0.12)
        .setStrokeStyle(1, 0xffffff, 0.35)
        .setDepth(4)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0);
      scene.tweens.add({
        targets: step,
        alpha: { from: 0, to: 0.52 },
        scaleX: { from: 0.35, to: 1 },
        duration: 420,
        ease: "Back.easeOut",
      });
      scene.tweens.add({
        targets: step,
        alpha: 0.22,
        duration: 1800,
        delay: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      scene.spawnSparkle?.(x, y, 0xffe8a1, 4);
    });
  }
}

function chooseStarLanding(scene: any) {
  const p = scene.player;
  if (!p) return null;
  const worldW = Math.max(400, Number(scene.mapW ?? 180) * 16);
  const worldH = Math.max(400, Number(scene.mapH ?? 180) * 16);
  for (let i = 0; i < 10; i++) {
    const a = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const d = Phaser.Math.Between(150, 280);
    const x = Phaser.Math.Clamp(p.x + Math.cos(a) * d, 80, worldW - 80);
    const y = Phaser.Math.Clamp(p.y + Math.sin(a) * d, 80, worldH - 80);
    const tile = scene.layer?.getTileAtWorldXY?.(x, y);
    if (tile && !tile.collides) return { x, y };
  }
  return { x: p.x + 150, y: p.y };
}

function launchFallingStar(scene: any, state: any) {
  // Falling stars are now scenery only. They never run during combat and they
  // create no pickup, blessing, save mutation, HUD change, or interaction.
  if (state.fallingStar?.active || scene.frozen || scene.boss?.active) return;
  const landing = chooseStarLanding(scene);
  if (!landing) return;

  const startX = landing.x - 250;
  const startY = landing.y - 210;
  const star = scene.add.sprite(startX, startY, "spark")
    .setTint(0xffe58a)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setScale(3.5)
    .setAlpha(0.92)
    .setDepth(11);
  const trail = scene.add.graphics().setDepth(10).setBlendMode(Phaser.BlendModes.ADD);
  trail.lineStyle(5, 0xffe58a, 0.14).lineBetween(startX, startY, landing.x, landing.y);
  trail.lineStyle(2, 0xffffff, 0.34).lineBetween(startX, startY, landing.x, landing.y);
  state.fallingStar = star;

  scene.tweens.add({
    targets: star,
    x: landing.x,
    y: landing.y,
    scale: 0.7,
    alpha: 0,
    // Previous fall lasted 900 ms. 450 ms makes the streak cross twice as fast.
    duration: 450,
    ease: "Cubic.easeIn",
    onComplete: () => {
      safeDestroy(trail);
      safeDestroy(star);
      state.fallingStar = null;
      // Tiny visual-only glint at the endpoint; it cannot be collected.
      try { scene.spawnSparkle?.(landing.x, landing.y, 0xffe58a, 5); } catch {}
    },
  });
}

function updateFallingStar(scene: any, state: any, time: number) {
  if (!state.fallingStar && time >= state.nextStarAt) {
    launchFallingStar(scene, state);
    // About twice the old frequency, still one decorative streak at a time.
    state.nextStarAt = time + Phaser.Math.Between(19000, 30000);
  }
}

export function installAct4StarryAscentRemaster(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act4StarryAscentRemasterInstalled) return;
  proto.__act4StarryAscentRemasterInstalled = true;

  // Act IV's authored build creates its main boss immediately. Hold only that
  // default boss spawn while the realm is being built. The true boss is gated
  // strictly by all five pillar values being gold.
  const originalSpawnActBoss = proto.spawnActBoss;
  if (typeof originalSpawnActBoss === "function") {
    proto.spawnActBoss = function act4GoldenPillarBossGate(...args: any[]) {
      const explicitConfig = args[2];
      if (this.save?.current_zone === ZONE && this.__act4BuildingBase && !explicitConfig) {
        this.__act4MainBossDeferred = true;
        return null;
      }
      return originalSpawnActBoss.apply(this, args);
    };
  }

  const originalBuildAct4 = proto.buildAct4;
  if (typeof originalBuildAct4 === "function") {
    proto.buildAct4 = function act4StarryRemasterBuild(...args: any[]) {
      this.__act4BuildingBase = true;
      this.__act4MainBossDeferred = false;
      this.__act4MainBossSpawned = false;
      let result: any;
      try {
        result = originalBuildAct4.apply(this, args);
      } finally {
        this.__act4BuildingBase = false;
      }
      this[STATE] = makeState(this);
      refreshPillars(this, true);
      return result;
    };
  }

  const originalOpenStaircase = proto.openStaircase;
  if (typeof originalOpenStaircase === "function") {
    proto.openStaircase = function act4StarryRemasterStaircase(...args: any[]) {
      const result = originalOpenStaircase.apply(this, args);
      celebrateStaircase(this);
      return result;
    };
  }

  const originalUpdate = proto.update;
  if (typeof originalUpdate === "function") {
    proto.update = function act4StarryRemasterUpdate(time: number, delta: number) {
      const result = originalUpdate.call(this, time, delta);
      if (this.save?.current_zone !== ZONE) return result;
      const state = this[STATE];
      if (!state) return result;

      if (time >= state.nextRefreshAt) {
        state.nextRefreshAt = time + 220;
        refreshPillars(this);
      }

      if (
        !this.__act4MainBossSpawned
        && this.__act4MainBossDeferred
        && allPillarsGold(this)
        && !this.boss?.active
        && !this.bossTalking
      ) {
        this.__act4MainBossSpawned = true;
        this.__act4MainBossDeferred = false;
        originalSpawnActBoss?.call(this, 100, 32);
        this.spawnSparkle?.(this.wx(100), this.wy(32), 0xffe59a, 34);
        this.cameras?.main?.flash?.(220, 255, 239, 180);
        this.emitToast?.("All five pillars burn gold — a presence awakens at the observatory.");
        this.objective = `${this.bossName || "The final guardian"} awaits at the Starry Observatory.`;
        this.pushHud?.(true);
      }

      updateFallingStar(this, state, time);
      return result;
    };
  }

  const originalCreate = proto.create;
  if (typeof originalCreate === "function") {
    proto.create = function act4StarryRemasterCreate(...args: any[]) {
      this[STATE] = null;
      this.__act4BuildingBase = false;
      this.__act4MainBossDeferred = false;
      this.__act4MainBossSpawned = false;
      return originalCreate.apply(this, args);
    };
  }
}
