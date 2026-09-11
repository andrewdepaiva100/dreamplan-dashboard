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
    lastPillarSignature: "",
    lastGoldCount: 0,
    stairsCelebrated: false,
    nextRefreshAt: 0,
    nextStarAt: Number(scene.time?.now ?? 0) + Phaser.Math.Between(28000, 42000),
    fallingStar: null,
    landingGlow: null,
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
  if (state.fallingStar?.active || state.landingGlow?.active || scene.frozen || scene.boss?.active) return;
  const landing = chooseStarLanding(scene);
  if (!landing) return;

  const star = scene.add.sprite(landing.x - 220, landing.y - 180, "spark")
    .setTint(0xffe58a)
    .setBlendMode(Phaser.BlendModes.ADD)
    .setScale(3.8)
    .setAlpha(0.95)
    .setDepth(990);
  const trail = scene.add.graphics().setDepth(989).setBlendMode(Phaser.BlendModes.ADD);
  trail.lineStyle(5, 0xffe58a, 0.18).lineBetween(star.x, star.y, landing.x, landing.y);
  trail.lineStyle(2, 0xffffff, 0.45).lineBetween(star.x, star.y, landing.x, landing.y);
  state.fallingStar = star;
  scene.emitToast?.("A falling star streaks across the ascent...");

  scene.tweens.add({
    targets: star,
    x: landing.x,
    y: landing.y,
    scale: 1.2,
    duration: 900,
    ease: "Cubic.easeIn",
    onComplete: () => {
      safeDestroy(trail);
      safeDestroy(star);
      state.fallingStar = null;
      scene.spawnSparkle?.(landing.x, landing.y, 0xffe58a, 22);
      const glow = scene.add.circle(landing.x, landing.y, 24, 0xffdf73, 0.16)
        .setStrokeStyle(2, 0xfff4c4, 0.75)
        .setDepth(12)
        .setBlendMode(Phaser.BlendModes.ADD);
      state.landingGlow = glow;
      scene.tweens.add({
        targets: glow,
        radius: { from: 21, to: 34 },
        alpha: { from: 0.12, to: 0.28 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      scene.time.delayedCall(15000, () => {
        if (state.landingGlow === glow) {
          safeDestroy(glow);
          state.landingGlow = null;
        }
      });
    },
  });
}

function updateFallingStar(scene: any, state: any, time: number) {
  if (state.landingGlow?.active && scene.player?.active) {
    const d = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, state.landingGlow.x, state.landingGlow.y);
    if (d < 42) {
      const x = state.landingGlow.x, y = state.landingGlow.y;
      safeDestroy(state.landingGlow);
      state.landingGlow = null;
      scene.stamina = 100;
      if (typeof scene.save?.player_health === "number") {
        scene.save.player_health = Math.min(5, scene.save.player_health + 0.5);
        scene.emitSave?.();
      }
      scene.spawnSparkle?.(x, y, 0xffe89c, 30);
      scene.cameras?.main?.flash?.(160, 255, 241, 190);
      scene.emitToast?.("Star Blessing — your heart and stamina brighten.");
      scene.pushHud?.(true);
      state.nextStarAt = time + Phaser.Math.Between(38000, 60000);
    }
  }

  if (!state.fallingStar && !state.landingGlow && time >= state.nextStarAt) {
    launchFallingStar(scene, state);
    state.nextStarAt = time + Phaser.Math.Between(38000, 60000);
  }
}

export function installAct4StarryAscentRemaster(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act4StarryAscentRemasterInstalled) return;
  proto.__act4StarryAscentRemasterInstalled = true;

  // Act IV's authored build creates its main boss immediately. Hold only that
  // default boss spawn while the realm is being built. No pillar-guardian
  // requirement exists here: the main boss is gated strictly by pillar color.
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

      // The main boss appears as soon as the existing pillar puzzle reaches
      // its solved state: all five pillar values are gold (1).
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
