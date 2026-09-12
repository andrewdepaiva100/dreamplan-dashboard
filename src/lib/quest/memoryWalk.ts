// @ts-nocheck -- Standalone cinematic interlude between Act IV and Act V.
import * as Phaser from "phaser";
import { EV } from "./events";
import { buildSprites, preloadQuestArt } from "./textures";

export const MEMORY_WALK_SCENE_KEY = "memory-walk";
export const MEMORY_WALK_SAVE_ID = "memory_walk";
export const MEMORY_WALK_TITLE = "Memory Walk";

const ACT5 = "cathedral";
const WORLD_W = 2820;
const WORLD_H = 680;
const WALK_Y = 548;
const PATH_TOP = 500;

type MemoryGroup = {
  root: Phaser.GameObjects.Container;
  centerX: number;
};

export class MemoryWalkScene extends Phaser.Scene {
  save: any;
  maria!: Phaser.GameObjects.Sprite;
  butterfly: Phaser.GameObjects.Sprite | null = null;
  stick = { x: 0, y: 0 };
  exiting = false;
  lastMilestone = -1;
  memories: MemoryGroup[] = [];
  titleCard!: Phaser.GameObjects.Container;
  private walkFrame = 0;
  private lastWalkFrameAt = 0;
  private lastFootGlowAt = 0;
  private lastButterflyTrailAt = 0;
  private memoryAudio: AudioContext | null = null;
  private memoryMusicStop: (() => void) | null = null;
  private cathedralSwelled = false;

  constructor() {
    super(MEMORY_WALK_SCENE_KEY);
  }

  init(data: { save?: any }) {
    this.save = data?.save;
  }

  preload() {
    preloadQuestArt(this);
  }

  create() {
    try {
      buildSprites(this);
      if (!this.save) throw new Error("Memory Walk opened without a save");
      this.save.current_zone = MEMORY_WALK_SAVE_ID;
      this.game.events.emit(EV.save, { ...this.save });
      this.game.events.emit(EV.hud, null);
      this.game.events.emit(EV.music, "home");
      this.game.events.emit(EV.act, { title: "MEMORY WALK · BETWEEN ACT IV & ACT V" });
      this.buildMemoryWalk();
      this.startMemoryWalkMusic();
    } catch (err) {
      console.warn?.("[quest] Memory Walk setup failed; continuing safely to Act V", err);
      this.finishToCathedral();
    }
  }

  private buildMemoryWalk() {
    this.cameras.main.setBackgroundColor("#080b1a");
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x070a18, 0x0d1735, 0x21183b, 0x17101f, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    // Layered celestial haze creates depth before any landmark appears.
    const hazeBack = this.add.graphics().setDepth(0).setScrollFactor(0.82, 1);
    for (let i = 0; i < 8; i++) {
      const x = 210 + i * 405;
      const tint = i >= 6 ? 0xffd792 : i % 2 ? 0x7967b4 : 0x6d8bc4;
      hazeBack.fillStyle(tint, 0.035 + (i % 3) * 0.012);
      hazeBack.fillEllipse(x, 250 + (i % 2) * 35, 420, 210);
    }

    const hazeFront = this.add.graphics().setDepth(1).setScrollFactor(0.93, 1);
    for (let i = 0; i < 10; i++) {
      const x = 90 + i * 315;
      hazeFront.fillStyle(i > 7 ? 0xffdb98 : 0xbfc8ff, 0.018 + (i % 2) * 0.014);
      hazeFront.fillEllipse(x, 386 + (i % 3) * 20, 260, 92);
    }

    for (let i = 0; i < 165; i++) {
      const x = 22 + ((i * 197) % (WORLD_W - 44));
      const y = 18 + ((i * 83) % 455);
      const r = i % 13 === 0 ? 2.4 : i % 4 === 0 ? 1.45 : 0.8;
      const tint = x > 2180 ? 0xffe2a0 : i % 5 === 0 ? 0xc8ddff : 0xffffff;
      const star = this.add.circle(x, y, r, tint, i % 4 === 0 ? 0.82 : 0.5).setDepth(1);
      if (i % 11 === 0) {
        this.tweens.add({
          targets: star,
          alpha: { from: 0.25, to: 0.98 },
          scale: { from: 0.72, to: 1.35 },
          duration: 1450 + (i % 6) * 190,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    // Ornamental constellations in the deep background.
    const constellations = this.add.graphics().setDepth(1).setScrollFactor(0.88, 1);
    const constellationXs = [420, 970, 1500, 2010, 2520];
    constellationXs.forEach((cx, idx) => {
      const tint = idx === 4 ? 0xffdf94 : idx === 1 ? 0xffaad0 : 0xc9d4ff;
      const pts = [
        [cx - 72, 95 + idx * 7],
        [cx - 25, 72 + idx * 4],
        [cx + 18, 108 - idx * 2],
        [cx + 66, 78 + idx * 5],
      ];
      constellations.lineStyle(1, tint, 0.12);
      for (let p = 0; p < pts.length - 1; p++) {
        constellations.lineBetween(pts[p]![0], pts[p]![1], pts[p + 1]![0], pts[p + 1]![1]);
      }
      pts.forEach(([px, py]) => {
        constellations.fillStyle(tint, 0.42);
        constellations.fillCircle(px, py, 2.1);
      });
    });

    // The road lives below every landmark caption and quote.
    const pathGlow = this.add.graphics().setDepth(2);
    pathGlow.fillStyle(0x8fa9ff, 0.07);
    pathGlow.fillRoundedRect(-20, PATH_TOP - 12, WORLD_W + 40, 142, 54);
    pathGlow.fillStyle(0xdce7ff, 0.09);
    pathGlow.fillRoundedRect(-8, PATH_TOP - 4, WORLD_W + 16, 126, 50);

    const path = this.add.graphics().setDepth(3);
    path.fillGradientStyle(0x7f95cb, 0xaec2ec, 0x3f5078, 0x5e73a1, 0.94);
    path.fillRoundedRect(0, PATH_TOP, WORLD_W, 112, 44);
    path.fillStyle(0xf9f4e6, 0.12);
    path.fillRoundedRect(18, PATH_TOP + 17, WORLD_W - 36, 76, 34);
    path.fillStyle(0xffffff, 0.08);
    path.fillRoundedRect(28, PATH_TOP + 34, WORLD_W - 56, 34, 17);
    path.lineStyle(2, 0xe8efff, 0.45);
    path.strokeRoundedRect(0, PATH_TOP, WORLD_W, 112, 44);

    const goldWash = this.add.graphics().setDepth(3);
    goldWash.fillGradientStyle(0xffd98a, 0xffedbd, 0xffbd62, 0xffd98a, 0.22);
    goldWash.fillRoundedRect(1980, PATH_TOP + 3, WORLD_W - 1980, 106, 41);

    for (let x = 72; x < WORLD_W; x += 78) {
      const warm = Phaser.Math.Clamp((x - 1840) / 820, 0, 1);
      const tint = warm > 0.35 ? 0xffde8f : 0xe6ecff;
      const dot = this.add.circle(
        x,
        WALK_Y + 8 + Math.sin(x * 0.031) * 10,
        4.5 + warm * 3,
        tint,
        0.2 + warm * 0.24,
      ).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
      if (x % 156 === 72) {
        this.tweens.add({
          targets: dot,
          alpha: { from: 0.12, to: 0.58 + warm * 0.2 },
          scale: { from: 0.75, to: 1.3 },
          duration: 1500 + (x % 5) * 120,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    const guide = this.add.rectangle(WORLD_W / 2, PATH_TOP + 83, WORLD_W - 90, 2, 0xf7f1dc, 0.22)
      .setDepth(4)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: guide, alpha: { from: 0.12, to: 0.4 }, duration: 1900, yoyo: true, repeat: -1 });

    this.addOpeningTitle();
    this.addMemorySeparator(725, 0xbfd1ff);
    this.addMemorySeparator(1235, 0xf6b2d1);
    this.addMemorySeparator(1745, 0xf2c582);
    this.addMemorySeparator(2255, 0xb6c8ff);

    this.memories.push(this.addMemory(
      470,
      "ACT I",
      "Sunlit Shores",
      0xffd48a,
      "landmark-temple",
      ["tree", "fountain"],
      "Every beginning is a promise we do not yet know we are making.",
      "shore",
    ));
    this.memories.push(this.addMemory(
      980,
      "ACT II",
      "Wedding Garden",
      0xff9fca,
      "landmark-conservatory",
      ["flowers", "arbor"],
      "Love does not bloom once. It chooses every season.",
      "garden",
    ));
    this.memories.push(this.addMemory(
      1490,
      "ACT III",
      "The Haven",
      0xf1c27f,
      "landmark-townhall",
      ["house", "lamp"],
      "Home is not where the road ends. It is who waits there with you.",
      "haven",
    ));
    this.memories.push(this.addMemory(
      2000,
      "ACT IV",
      "Starry Ascent",
      0x9ab7ff,
      "landmark-observatory",
      ["pillar", "adriel"],
      "Some climbs change the view. Others change the heart.",
      "stars",
    ));
    this.addAct4Pillars(2000);
    this.addCathedralReveal();

    // Foreground silhouettes gently frame the walk and move a touch faster than the camera.
    const foreground = this.add.graphics().setDepth(28).setScrollFactor(1.035, 1);
    foreground.fillStyle(0x050711, 0.5);
    for (let i = 0; i < 18; i++) {
      const x = 20 + i * 165;
      const h = 18 + (i % 4) * 6;
      foreground.fillEllipse(x, PATH_TOP + 111, 95, h);
    }

    this.maria = this.add.sprite(110, WALK_Y, "maria-side-0").setDepth(40).setScale(1.18);
    this.maria.setFlipX(false);
    this.cameras.main.startFollow(this.maria, true, 0.08, 0.08, -118, 22);
    this.cameras.main.setDeadzone(220, 120);

    this.game.events.on(EV.stick, this.onStick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(EV.stick, this.onStick, this);
      this.stopMemoryWalkMusic();
    });

    this.cameras.main.fadeIn(1000, 5, 8, 23);
  }

  private addOpeningTitle() {
    const root = this.add.container(160, 204).setDepth(30);
    const veil = this.add.rectangle(0, 0, 510, 178, 0x050817, 0.4).setOrigin(0, 0.5);
    const small = this.add.text(14, -52, "BETWEEN ACT IV & ACT V", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#d9e3ff",
      letterSpacing: 4,
    });
    const title = this.add.text(10, -18, "MEMORY WALK", {
      fontFamily: "Georgia, serif",
      fontSize: "38px",
      color: "#ffe7ae",
      stroke: "#080b1c",
      strokeThickness: 6,
      letterSpacing: 5,
    });
    const sub = this.add.text(14, 39, "Walk forward. Let every chapter pass beside you.", {
      fontFamily: "Georgia, serif",
      fontSize: "14px",
      fontStyle: "italic",
      color: "#f0f2ff",
    });
    const star = this.add.circle(438, -20, 3, 0xffe5a3, 0.85).setBlendMode(Phaser.BlendModes.ADD);
    root.add([veil, small, title, sub, star]);
    this.tweens.add({ targets: star, scale: { from: 0.7, to: 1.8 }, alpha: { from: 0.35, to: 1 }, duration: 1400, yoyo: true, repeat: -1 });
    this.titleCard = root;
  }

  private addMemorySeparator(x: number, tint: number) {
    const root = this.add.container(x, 0).setDepth(6);
    const line = this.add.rectangle(0, 335, 1.5, 245, tint, 0.09).setBlendMode(Phaser.BlendModes.ADD);
    const flare = this.add.ellipse(0, 335, 54, 190, tint, 0.03).setBlendMode(Phaser.BlendModes.ADD);
    root.add([flare, line]);
    for (let i = 0; i < 5; i++) {
      const mote = this.add.circle(-13 + i * 7, 250 + i * 38, 1.4 + (i % 2), tint, 0.28).setBlendMode(Phaser.BlendModes.ADD);
      root.add(mote);
      this.tweens.add({ targets: mote, y: mote.y - 24, alpha: { from: 0.12, to: 0.55 }, duration: 1300 + i * 180, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
  }

  private addMemory(
    x: number,
    act: string,
    title: string,
    tint: number,
    landmarkKey: string,
    accents: string[],
    quote: string,
    theme: "shore" | "garden" | "haven" | "stars",
  ): MemoryGroup {
    const root = this.add.container(x, 0).setDepth(7);

    const outerGlow = this.add.ellipse(0, 334, 430, 300, tint, 0.09).setBlendMode(Phaser.BlendModes.ADD);
    const innerGlow = this.add.ellipse(0, 344, 320, 228, tint, 0.13).setBlendMode(Phaser.BlendModes.ADD);
    const floorGlow = this.add.ellipse(0, 437, 330, 54, tint, 0.09).setBlendMode(Phaser.BlendModes.ADD);
    const echo = this.add.sprite(8, 342, landmarkKey).setTint(tint).setAlpha(0.1);
    const landmark = this.add.sprite(0, 334, landmarkKey).setAlpha(0.98);
    if (landmark.width > 0) landmark.setScale(Math.min(1.24, 210 / landmark.width));
    echo.setScale(landmark.scaleX * 1.045, landmark.scaleY * 1.045);
    root.add([outerGlow, innerGlow, floorGlow, echo, landmark]);

    // Each act gets a small environmental vignette rather than only a landmark.
    const vignette = this.add.graphics();
    if (theme === "shore") {
      vignette.lineStyle(2, 0x8fc7ff, 0.2);
      for (let i = 0; i < 4; i++) vignette.strokeEllipse(-110 + i * 72, 433 + (i % 2) * 7, 72, 14);
      vignette.fillStyle(0xffd98b, 0.16);
      vignette.fillCircle(-156, 352, 18);
    } else if (theme === "garden") {
      vignette.fillStyle(0xffa6c9, 0.18);
      for (let i = 0; i < 10; i++) vignette.fillCircle(-160 + i * 35, 424 - (i % 3) * 8, 5 + (i % 2));
      vignette.lineStyle(1, 0xb6d993, 0.18);
      for (let i = 0; i < 7; i++) vignette.lineBetween(-150 + i * 48, 440, -142 + i * 48, 414 - (i % 2) * 12);
    } else if (theme === "haven") {
      vignette.fillStyle(0xffcc7f, 0.13);
      for (let i = 0; i < 6; i++) vignette.fillRoundedRect(-150 + i * 58, 414 + (i % 2) * 6, 34, 18, 4);
      vignette.lineStyle(1, 0xffe3a5, 0.18);
      for (let i = 0; i < 5; i++) vignette.lineBetween(-120 + i * 60, 407, -120 + i * 60, 438);
    } else {
      vignette.lineStyle(1.5, 0xc7d5ff, 0.18);
      for (let i = 0; i < 5; i++) vignette.strokeCircle(-126 + i * 63, 421 + Math.abs(2 - i) * 7, 15 + (i % 2) * 4);
      vignette.fillStyle(0x9cbcff, 0.14);
      for (let i = 0; i < 9; i++) vignette.fillCircle(-160 + i * 40, 390 - (i % 3) * 15, 2.5);
    }
    root.add(vignette);

    accents.forEach((key, i) => {
      if (!this.textures.exists(key)) return;
      const side = i === 0 ? -1 : 1;
      const a = this.add.sprite(side * 136, 408 - i * 18, key).setAlpha(0.88);
      if (theme === "stars" || i === 0) a.setTint(tint);
      a.setScale(key === "pillar" ? 1.12 : key === "adriel" ? 1.04 : 0.88);
      root.add(a);
    });

    for (let i = 0; i < 18; i++) {
      const mote = this.add.circle(
        -180 + ((i * 43) % 360),
        266 + ((i * 31) % 178),
        i % 4 === 0 ? 2.5 : 1.25,
        tint,
        0.66,
      );
      root.add(mote);
      this.tweens.add({
        targets: mote,
        y: mote.y - 17 - (i % 5) * 4,
        alpha: 0.16,
        duration: 1350 + i * 82,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const actText = this.add.text(0, 178, act, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f8eabf",
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.92);

    const titleText = this.add.text(0, 211, title, {
      fontFamily: "Georgia, serif",
      fontSize: "26px",
      color: "#ffffff",
      stroke: "#080b1c",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const quoteGlow = this.add.rectangle(0, 458, 362, 82, tint, 0.04)
      .setOrigin(0.5)
      .setBlendMode(Phaser.BlendModes.ADD);
    const quotePanel = this.add.rectangle(0, 458, 348, 70, 0x070b19, 0.82)
      .setOrigin(0.5)
      .setStrokeStyle(1, tint, 0.4);
    const quoteText = this.add.text(0, 458, `“${quote}”`, {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "italic",
      color: "#fffaf0",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 306 },
      stroke: "#050817",
      strokeThickness: 2,
    }).setOrigin(0.5);

    // Tiny ornamental corners keep the quote feeling like a keepsake plaque.
    const ornaments = this.add.graphics();
    ornaments.lineStyle(1, tint, 0.5);
    for (const sx of [-1, 1]) {
      ornaments.lineBetween(sx * 174, 432, sx * 154, 432);
      ornaments.lineBetween(sx * 174, 432, sx * 174, 444);
      ornaments.lineBetween(sx * 174, 484, sx * 154, 484);
      ornaments.lineBetween(sx * 174, 484, sx * 174, 472);
    }
    ornaments.fillStyle(tint, 0.65);
    ornaments.fillCircle(-174, 458, 2.2);
    ornaments.fillCircle(174, 458, 2.2);

    root.add([actText, titleText, quoteGlow, quotePanel, quoteText, ornaments]);

    this.tweens.add({
      targets: outerGlow,
      alpha: { from: 0.05, to: 0.16 },
      scaleX: { from: 0.94, to: 1.06 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: innerGlow,
      alpha: { from: 0.08, to: 0.2 },
      duration: 1900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    return { root, centerX: x };
  }

  private addAct4Pillars(x: number) {
    if (!this.textures.exists("pillar")) return;
    for (let i = 0; i < 5; i++) {
      const px = x - 126 + i * 63;
      const py = 414 + Math.abs(2 - i) * 7;
      const p = this.add.sprite(px, py, "pillar")
        .setDepth(10)
        .setTint(0xffdf8a)
        .setAlpha(0.86)
        .setScale(0.84);
      const halo = this.add.ellipse(px, py + 18, 50, 20, 0xffd98a, 0.08).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: p, alpha: { from: 0.62, to: 0.98 }, duration: 1600 + i * 130, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: halo, alpha: { from: 0.03, to: 0.14 }, scaleX: { from: 0.8, to: 1.25 }, duration: 1500 + i * 100, yoyo: true, repeat: -1 });
    }
  }

  private addCathedralReveal() {
    const x = 2580;

    const farHalo = this.add.ellipse(x, 336, 700, 470, 0xffd37a, 0.08).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    const aura = this.add.ellipse(x, 340, 570, 390, 0xffd37a, 0.2).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    const innerAura = this.add.ellipse(x, 346, 390, 285, 0xffefbd, 0.08).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: farHalo, alpha: { from: 0.035, to: 0.12 }, scale: { from: 0.94, to: 1.08 }, duration: 3100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: aura, alpha: { from: 0.09, to: 0.34 }, scale: { from: 0.9, to: 1.11 }, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: innerAura, alpha: { from: 0.04, to: 0.14 }, duration: 1700, yoyo: true, repeat: -1 });

    const cathedral = this.add.sprite(x, 315, "landmark-cathedral")
      .setDepth(10)
      .setTint(0xfff5df)
      .setAlpha(1);
    if (cathedral.width > 0) cathedral.setScale(Math.min(1.68, 296 / cathedral.width));
    const echo = this.add.sprite(x, 321, "landmark-cathedral")
      .setDepth(9)
      .setTint(0xffc85a)
      .setAlpha(0.19);
    echo.setScale(cathedral.scaleX * 1.14, cathedral.scaleY * 1.14);

    for (let i = 0; i < 9; i++) {
      const beam = this.add.rectangle(x - 188 + i * 47, 236, 17, 320, 0xffe3a1, 0.075)
        .setDepth(4)
        .setAngle(i % 2 ? 5 : -5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: beam,
        alpha: { from: 0.025, to: 0.18 },
        duration: 1700 + i * 155,
        yoyo: true,
        repeat: -1,
      });
    }

    for (let i = 0; i < 22; i++) {
      const mote = this.add.circle(
        x - 235 + ((i * 47) % 470),
        250 + ((i * 37) % 220),
        i % 5 === 0 ? 2.8 : 1.4,
        i % 3 === 0 ? 0xffffff : 0xffdc8a,
        0.56,
      ).setDepth(12).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: mote, y: mote.y - 24 - (i % 4) * 7, alpha: { from: 0.16, to: 0.78 }, duration: 1400 + i * 75, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    const quoteGlow = this.add.rectangle(x, 455, 410, 88, 0xffd37a, 0.07)
      .setDepth(18)
      .setBlendMode(Phaser.BlendModes.ADD);
    const quotePanel = this.add.rectangle(x, 455, 396, 76, 0x0a0b15, 0.84)
      .setDepth(19)
      .setStrokeStyle(1, 0xffd98a, 0.5);
    this.add.text(x, 446, "“Everything led me here.”", {
      fontFamily: "Georgia, serif",
      fontSize: "20px",
      fontStyle: "italic",
      color: "#fff4d2",
      stroke: "#080b1c",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.add.text(x, 477, "ACT V · THE CATHEDRAL", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#ffe39a",
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.94);
  }

  private onStick(v: { x?: number; y?: number }) {
    this.stick.x = Number(v?.x ?? 0);
    this.stick.y = Number(v?.y ?? 0);
  }

  update(time: number, delta: number) {
    if (this.exiting || !this.maria?.active) return;

    const kb = this.input.keyboard;
    let dx = this.stick.x;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) dx += 1;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) dx -= 1;
    dx = Phaser.Math.Clamp(dx, -1, 1);

    const moving = Math.abs(dx) > 0.05;
    this.maria.x = Phaser.Math.Clamp(
      this.maria.x + dx * 108 * Math.min(delta, 50) / 1000,
      72,
      2670,
    );

    if (moving) {
      this.maria.setFlipX(dx < 0);
      if (time - this.lastWalkFrameAt >= 145) {
        this.lastWalkFrameAt = time;
        this.walkFrame = this.walkFrame === 1 ? 2 : 1;
        this.maria.setTexture(`maria-side-${this.walkFrame}`);
      }
      this.maria.y = WALK_Y + Math.sin(time / 92) * 1.4;
      if (time - this.lastFootGlowAt >= 245) {
        this.lastFootGlowAt = time;
        this.spawnFootGlow();
      }
    } else {
      this.walkFrame = 0;
      this.maria.setTexture("maria-side-0");
      this.maria.y += (WALK_Y - this.maria.y) * 0.25;
    }

    let nearest = 9999;
    for (const m of this.memories) {
      const d = this.maria.x - m.centerX;
      nearest = Math.min(nearest, Math.abs(d));
      const approach = Phaser.Math.Clamp(1 - Math.abs(d) / 500, 0, 1);
      const passedFade = d > 280 ? Phaser.Math.Clamp(1 - (d - 280) / 320, 0.08, 1) : 1;
      const alpha = Math.min(1, 0.78 + approach * 0.22) * passedFade;
      m.root.setAlpha(alpha);
      const focusScale = 1 + approach * 0.018 + (d > 280 ? (1 - passedFade) * 0.02 : 0);
      m.root.setScale(focusScale);
    }

    // A barely perceptible camera push makes each memory feel like a vignette,
    // while returning to normal scale between exhibits.
    const targetZoom = nearest < 250 ? 1.025 : 1;
    this.cameras.main.zoom += (targetZoom - this.cameras.main.zoom) * 0.045;

    this.titleCard?.setAlpha(Phaser.Math.Clamp(1 - (this.maria.x - 150) / 430, 0, 1));

    const milestones = [340, 850, 1360, 1870, 2240];
    const reached = milestones.reduce((n, m, i) => this.maria.x >= m ? i : n, -1);
    if (reached > this.lastMilestone) {
      this.lastMilestone = reached;
      // The butterfly becomes a thread through the memories after Act I rather
      // than appearing only at the very end.
      if (reached >= 0 && !this.butterfly?.active) this.spawnGuidingButterfly();
      if (reached === 4) this.cueCathedralSwell();
    }

    if (this.butterfly?.active) {
      const tx = Math.min(2620, this.maria.x + 105);
      const ty = WALK_Y - 66 + Math.sin(this.time.now / 240) * 15;
      this.butterfly.x += (tx - this.butterfly.x) * 0.055;
      this.butterfly.y += (ty - this.butterfly.y) * 0.065;
      this.butterfly.setFlipX(tx < this.butterfly.x);
      if (time - this.lastButterflyTrailAt >= 105) {
        this.lastButterflyTrailAt = time;
        this.spawnButterflyTrail();
      }
    }

    if (this.maria.x >= 2635) this.beginExit();
  }

  private spawnFootGlow() {
    const warm = Phaser.Math.Clamp((this.maria.x - 1880) / 760, 0, 1);
    const tint = warm > 0.3 ? 0xffdc91 : 0xe4ebff;
    const shadow = this.add.ellipse(this.maria.x, WALK_Y + 17, 28, 8, 0x111526, 0.2).setDepth(5);
    const ripple = this.add.ellipse(
      this.maria.x - (this.maria.flipX ? -4 : 4),
      WALK_Y + 15,
      18,
      6,
      tint,
      0.24,
    ).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: shadow, alpha: 0, scaleX: 1.25, duration: 520, onComplete: () => shadow.destroy() });
    this.tweens.add({
      targets: ripple,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.5,
      duration: 540,
      ease: "Sine.easeOut",
      onComplete: () => ripple.destroy(),
    });
  }

  private spawnGuidingButterfly() {
    if (this.butterfly?.active || !this.textures.exists("butterfly")) return;
    this.butterfly = this.add.sprite(this.maria.x + 90, WALK_Y - 66, "butterfly")
      .setDepth(45)
      .setTint(0xffdc83)
      .setScale(1.3);
    this.tweens.add({
      targets: this.butterfly,
      alpha: { from: 0.45, to: 1 },
      scale: { from: 1.02, to: 1.38 },
      duration: 820,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private spawnButterflyTrail() {
    if (!this.butterfly?.active) return;
    const mote = this.add.circle(
      this.butterfly.x - 8 + Phaser.Math.Between(-4, 4),
      this.butterfly.y + Phaser.Math.Between(-4, 4),
      Phaser.Math.FloatBetween(1.2, 2.6),
      0xffe2a0,
      0.7,
    ).setDepth(44).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: mote,
      x: mote.x - 22,
      y: mote.y + Phaser.Math.Between(-10, 10),
      alpha: 0,
      scale: 0.25,
      duration: 680,
      ease: "Sine.easeOut",
      onComplete: () => mote.destroy(),
    });
  }

  private startMemoryWalkMusic() {
    try {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      this.memoryAudio = ctx;
      void ctx.resume();

      const master = ctx.createGain();
      master.gain.value = 0.0001;
      master.connect(ctx.destination);
      master.gain.exponentialRampToValueAtTime(0.048, ctx.currentTime + 2.4);

      const soft = ctx.createBiquadFilter();
      soft.type = "lowpass";
      soft.frequency.value = 1800;
      soft.Q.value = 0.35;
      soft.connect(master);

      const hz = (n: number) => 220 * Math.pow(2, n / 12);
      const melody = [7, 12, 14, 19, 16, 14, 12, 9, 7, 11, 14, 16, 19, 21, 19, 14];
      const bass = [-12, -7, -5, -7];
      let step = 0;
      let next = ctx.currentTime + 0.35;

      const note = (freq: number, at: number, dur: number, gain: number, type: OscillatorType = "sine") => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(freq, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain, at + 0.08);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g).connect(soft);
        o.start(at);
        o.stop(at + dur + 0.08);
      };

      const schedule = () => {
        const horizon = ctx.currentTime + 1.4;
        while (next < horizon) {
          const n = melody[step % melody.length]!;
          note(hz(n), next, 2.7, 0.18, "sine");
          note(hz(n + 12), next + 0.06, 1.5, 0.04, "triangle");
          if (step % 4 === 0) {
            const b = bass[Math.floor(step / 4) % bass.length]!;
            note(hz(b), next, 4.2, 0.12, "sine");
          }
          next += 1.05;
          step += 1;
        }
      };
      schedule();
      const timer = window.setInterval(schedule, 420);

      const wake = () => void ctx.resume();
      window.addEventListener("pointerdown", wake, { passive: true });
      window.addEventListener("keydown", wake);
      window.addEventListener("touchstart", wake, { passive: true });

      this.memoryMusicStop = () => {
        window.clearInterval(timer);
        window.removeEventListener("pointerdown", wake);
        window.removeEventListener("keydown", wake);
        window.removeEventListener("touchstart", wake);
        try {
          master.gain.cancelScheduledValues(ctx.currentTime);
          master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), ctx.currentTime);
          master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
        } catch {}
        window.setTimeout(() => {
          try { void ctx.close(); } catch {}
        }, 900);
      };
    } catch (err) {
      console.warn?.("[quest] Memory Walk music unavailable", err);
    }
  }

  private cueCathedralSwell() {
    if (this.cathedralSwelled || !this.memoryAudio) return;
    this.cathedralSwelled = true;
    try {
      const ctx = this.memoryAudio;
      const now = ctx.currentTime + 0.04;
      const chord = [329.63, 392.0, 493.88, 659.25];
      chord.forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = i % 2 ? "triangle" : "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.linearRampToValueAtTime(0.018 - i * 0.002, now + 0.7);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.6);
        o.connect(g).connect(ctx.destination);
        o.start(now + i * 0.06);
        o.stop(now + 4.8);
      });
    } catch {}
  }

  private stopMemoryWalkMusic() {
    try { this.memoryMusicStop?.(); } catch {}
    this.memoryMusicStop = null;
    this.memoryAudio = null;
  }

  private beginExit() {
    if (this.exiting) return;
    this.exiting = true;
    this.stopMemoryWalkMusic();
    this.game.events.emit(EV.music, "home");
    this.cameras.main.fadeOut(1200, 255, 244, 214);
    this.time.delayedCall(1240, () => this.finishToCathedral());
  }

  private finishToCathedral() {
    if (!this.save) return;
    try {
      this.save.current_zone = ACT5;
      this.save.player_health = 5;
      this.game.events.emit(EV.save, { ...this.save });
    } catch (err) {
      console.warn?.("[quest] Memory Walk save handoff warning", err);
    }

    try {
      this.scene.stop(MEMORY_WALK_SCENE_KEY);
      this.scene.start("quest", { save: this.save });
    } catch (err) {
      console.warn?.("[quest] Memory Walk Cathedral handoff failed", err);
    }
  }
}
