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

    // The road lives below every landmark caption and quote. It should feel like
    // a luminous floor beneath Maria, never like a translucent panel through text.
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
    this.memories.push(this.addMemory(
      470,
      "ACT I",
      "Sunlit Shores",
      0xffd48a,
      "landmark-temple",
      ["tree", "fountain"],
      "Every beginning is a promise we do not yet know we are making.",
    ));
    this.memories.push(this.addMemory(
      980,
      "ACT II",
      "Wedding Garden",
      0xff9fca,
      "landmark-conservatory",
      ["flowers", "arbor"],
      "Love does not bloom once. It chooses every season.",
    ));
    this.memories.push(this.addMemory(
      1490,
      "ACT III",
      "The Haven",
      0xf1c27f,
      "landmark-townhall",
      ["house", "lamp"],
      "Home is not where the road ends. It is who waits there with you.",
    ));
    this.memories.push(this.addMemory(
      2000,
      "ACT IV",
      "Starry Ascent",
      0x9ab7ff,
      "landmark-observatory",
      ["pillar", "adriel"],
      "Some climbs change the view. Others change the heart.",
    ));
    this.addAct4Pillars(2000);
    this.addCathedralReveal();

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
    root.add([veil, small, title, sub]);
    this.titleCard = root;
  }

  private addMemory(
    x: number,
    act: string,
    title: string,
    tint: number,
    landmarkKey: string,
    accents: string[],
    quote: string,
  ): MemoryGroup {
    const root = this.add.container(x, 0).setDepth(7);

    // Strong halo, natural-color landmark, and only a faint ghost echo. The
    // memories should read as beautiful places first and apparitions second.
    const outerGlow = this.add.ellipse(0, 334, 420, 290, tint, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    const innerGlow = this.add.ellipse(0, 344, 310, 220, tint, 0.11).setBlendMode(Phaser.BlendModes.ADD);
    const echo = this.add.sprite(8, 342, landmarkKey).setTint(tint).setAlpha(0.11);
    const landmark = this.add.sprite(0, 334, landmarkKey).setAlpha(0.94);
    if (landmark.width > 0) landmark.setScale(Math.min(1.2, 202 / landmark.width));
    echo.setScale(landmark.scaleX * 1.045, landmark.scaleY * 1.045);
    root.add([outerGlow, innerGlow, echo, landmark]);

    accents.forEach((key, i) => {
      if (!this.textures.exists(key)) return;
      const side = i === 0 ? -1 : 1;
      const a = this.add.sprite(side * 132, 409 - i * 18, key).setAlpha(0.82);
      a.setTint(i === 0 ? tint : 0xffffff);
      a.setScale(key === "pillar" ? 1.12 : key === "adriel" ? 1.04 : 0.86);
      root.add(a);
    });

    for (let i = 0; i < 16; i++) {
      const mote = this.add.circle(
        -174 + ((i * 43) % 348),
        276 + ((i * 31) % 160),
        i % 4 === 0 ? 2.4 : 1.25,
        tint,
        0.62,
      );
      root.add(mote);
      this.tweens.add({
        targets: mote,
        y: mote.y - 17 - (i % 5) * 4,
        alpha: 0.18,
        duration: 1350 + i * 82,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    const actText = this.add.text(0, 187, act, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f8eabf",
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.9);

    const titleText = this.add.text(0, 218, title, {
      fontFamily: "Georgia, serif",
      fontSize: "25px",
      color: "#ffffff",
      stroke: "#080b1c",
      strokeThickness: 5,
    }).setOrigin(0.5);

    const quotePanel = this.add.rectangle(0, 457, 338, 66, 0x070b19, 0.76)
      .setOrigin(0.5)
      .setStrokeStyle(1, tint, 0.32);
    const quoteGlow = this.add.rectangle(0, 457, 348, 76, tint, 0.035)
      .setOrigin(0.5)
      .setBlendMode(Phaser.BlendModes.ADD);
    const quoteText = this.add.text(0, 457, `“${quote}”`, {
      fontFamily: "Georgia, serif",
      fontSize: "13px",
      fontStyle: "italic",
      color: "#fffaf0",
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 300 },
      stroke: "#050817",
      strokeThickness: 2,
    }).setOrigin(0.5);

    root.add([actText, titleText, quoteGlow, quotePanel, quoteText]);

    this.tweens.add({
      targets: outerGlow,
      alpha: { from: 0.045, to: 0.14 },
      scaleX: { from: 0.94, to: 1.05 },
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: innerGlow,
      alpha: { from: 0.07, to: 0.17 },
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
        .setAlpha(0.82)
        .setScale(0.82);
      this.tweens.add({
        targets: p,
        alpha: { from: 0.58, to: 0.94 },
        duration: 1600 + i * 130,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  private addCathedralReveal() {
    const x = 2580;
    const aura = this.add.ellipse(x, 340, 570, 390, 0xffd37a, 0.17)
      .setDepth(3)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: aura,
      alpha: { from: 0.08, to: 0.31 },
      scale: { from: 0.9, to: 1.1 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const cathedral = this.add.sprite(x, 315, "landmark-cathedral")
      .setDepth(10)
      .setTint(0xfff2cf)
      .setAlpha(1);
    if (cathedral.width > 0) cathedral.setScale(Math.min(1.62, 286 / cathedral.width));
    const echo = this.add.sprite(x, 321, "landmark-cathedral")
      .setDepth(9)
      .setTint(0xffc85a)
      .setAlpha(0.18);
    echo.setScale(cathedral.scaleX * 1.13, cathedral.scaleY * 1.13);

    for (let i = 0; i < 7; i++) {
      const beam = this.add.rectangle(x - 141 + i * 47, 238, 17, 305, 0xffe3a1, 0.075)
        .setDepth(4)
        .setAngle(i % 2 ? 5 : -5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({
        targets: beam,
        alpha: { from: 0.025, to: 0.17 },
        duration: 1700 + i * 190,
        yoyo: true,
        repeat: -1,
      });
    }

    const quoteGlow = this.add.rectangle(x, 455, 390, 82, 0xffd37a, 0.06)
      .setDepth(18)
      .setBlendMode(Phaser.BlendModes.ADD);
    const quotePanel = this.add.rectangle(x, 455, 378, 72, 0x0a0b15, 0.78)
      .setDepth(19)
      .setStrokeStyle(1, 0xffd98a, 0.42);
    this.add.text(x, 447, "“Everything led me here.”", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      fontStyle: "italic",
      color: "#fff0c8",
      stroke: "#080b1c",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.add.text(x, 476, "ACT V · THE CATHEDRAL", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#ffe39a",
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.9);
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

    // Keep future/nearby landmarks richly visible; only memories well behind
    // Maria dissolve away. This avoids the washed-out look from the first pass.
    for (const m of this.memories) {
      const d = this.maria.x - m.centerX;
      const approach = Phaser.Math.Clamp(1 - Math.abs(d) / 500, 0, 1);
      const passedFade = d > 260 ? Phaser.Math.Clamp(1 - (d - 260) / 300, 0.08, 1) : 1;
      const alpha = Math.min(1, 0.72 + approach * 0.28) * passedFade;
      m.root.setAlpha(alpha);
      if (d > 260) m.root.setScale(1 + (1 - passedFade) * 0.028);
      else m.root.setScale(1);
    }
    this.titleCard?.setAlpha(Phaser.Math.Clamp(1 - (this.maria.x - 150) / 430, 0, 1));

    const milestones = [340, 850, 1360, 1870, 2240];
    const reached = milestones.reduce((n, m, i) => this.maria.x >= m ? i : n, -1);
    if (reached > this.lastMilestone) {
      this.lastMilestone = reached;
      if (reached === 4) {
        this.spawnGuidingButterfly();
        this.cueCathedralSwell();
      }
    }

    if (this.butterfly?.active) {
      const tx = Math.min(2620, this.maria.x + 105);
      const ty = WALK_Y - 58 + Math.sin(this.time.now / 240) * 13;
      this.butterfly.x += (tx - this.butterfly.x) * 0.06;
      this.butterfly.y += (ty - this.butterfly.y) * 0.07;
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
    const ripple = this.add.ellipse(
      this.maria.x - (this.maria.flipX ? -4 : 4),
      WALK_Y + 15,
      18,
      6,
      tint,
      0.22,
    ).setDepth(5).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: ripple,
      alpha: 0,
      scaleX: 1.7,
      scaleY: 1.45,
      duration: 520,
      ease: "Sine.easeOut",
      onComplete: () => ripple.destroy(),
    });
  }

  private spawnGuidingButterfly() {
    if (this.butterfly?.active || !this.textures.exists("butterfly")) return;
    this.butterfly = this.add.sprite(this.maria.x + 90, WALK_Y - 58, "butterfly")
      .setDepth(45)
      .setTint(0xffdc83)
      .setScale(1.26);
    this.tweens.add({
      targets: this.butterfly,
      alpha: { from: 0.5, to: 1 },
      scale: { from: 1.0, to: 1.34 },
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
      Phaser.Math.FloatBetween(1.2, 2.4),
      0xffe2a0,
      0.68,
    ).setDepth(44).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({
      targets: mote,
      x: mote.x - 18,
      y: mote.y + Phaser.Math.Between(-8, 8),
      alpha: 0,
      scale: 0.35,
      duration: 620,
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
