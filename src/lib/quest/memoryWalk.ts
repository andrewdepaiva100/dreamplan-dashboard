// @ts-nocheck -- Standalone cinematic interlude between Act IV and Act V.
import * as Phaser from "phaser";
import { EV } from "./events";
import { buildSprites, preloadQuestArt } from "./textures";

export const MEMORY_WALK_SCENE_KEY = "memory-walk";
export const MEMORY_WALK_SAVE_ID = "memory_walk";
export const MEMORY_WALK_TITLE = "Memory Walk";

const ACT5 = "cathedral";
const WORLD_W = 2820;
const WORLD_H = 640;
const WALK_Y = 462;

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
    // Makes the interlude safe to resume directly from a saved Memory Walk.
    preloadQuestArt(this);
  }

  create() {
    try {
      buildSprites(this);
      if (!this.save) throw new Error("Memory Walk opened without a save");
      this.save.current_zone = MEMORY_WALK_SAVE_ID;
      this.game.events.emit(EV.save, { ...this.save });
      // Hide normal combat HUD during the interlude.
      this.game.events.emit(EV.hud, null);
      // Keep the normal score in its gentlest mode underneath the dedicated cue.
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

    // A field of stars that slowly warms as Maria nears the Cathedral.
    for (let i = 0; i < 150; i++) {
      const x = 22 + ((i * 197) % (WORLD_W - 44));
      const y = 22 + ((i * 83) % 410);
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

    // Brighter, layered path: cool ivory at the beginning, warming into gold.
    const pathGlow = this.add.graphics().setDepth(2);
    pathGlow.fillStyle(0x9fb8ff, 0.09);
    pathGlow.fillRoundedRect(-20, 382, WORLD_W + 40, 168, 62);
    pathGlow.fillStyle(0xdbe5ff, 0.11);
    pathGlow.fillRoundedRect(-8, 390, WORLD_W + 16, 152, 58);

    const path = this.add.graphics().setDepth(3);
    path.fillGradientStyle(0x889ed7, 0xa8bce8, 0x465782, 0x596d9c, 0.93);
    path.fillRoundedRect(0, 394, WORLD_W, 142, 52);
    path.fillStyle(0xf6f0dd, 0.13);
    path.fillRoundedRect(18, 412, WORLD_W - 36, 96, 40);
    path.fillStyle(0xffffff, 0.075);
    path.fillRoundedRect(28, 430, WORLD_W - 56, 48, 24);
    path.lineStyle(3, 0xdde7ff, 0.42);
    path.strokeRoundedRect(0, 394, WORLD_W, 142, 52);

    const goldWash = this.add.graphics().setDepth(3);
    goldWash.fillGradientStyle(0xffd98a, 0xffedbd, 0xffbd62, 0xffd98a, 0.2);
    goldWash.fillRoundedRect(1980, 398, WORLD_W - 1980, 134, 48);

    for (let x = 72; x < WORLD_W; x += 78) {
      const warm = Phaser.Math.Clamp((x - 1840) / 820, 0, 1);
      const tint = warm > 0.35 ? 0xffde8f : 0xe6ecff;
      const dot = this.add.circle(x, WALK_Y + Math.sin(x * 0.031) * 18, 5 + warm * 3.5, tint, 0.2 + warm * 0.22)
        .setDepth(4)
        .setBlendMode(Phaser.BlendModes.ADD);
      if (x % 156 === 72) {
        this.tweens.add({
          targets: dot,
          alpha: { from: 0.12, to: 0.55 + warm * 0.2 },
          scale: { from: 0.75, to: 1.3 },
          duration: 1500 + (x % 5) * 120,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    // Thin luminous guide line through the center of the road.
    const guide = this.add.rectangle(WORLD_W / 2, WALK_Y + 29, WORLD_W - 90, 2, 0xf7f1dc, 0.2)
      .setDepth(4)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: guide, alpha: { from: 0.12, to: 0.36 }, duration: 1900, yoyo: true, repeat: -1 });

    this.addOpeningTitle();
    this.memories.push(this.addMemory(470, "ACT I", "Sunlit Shores", 0xffd48a, "landmark-temple", ["tree", "fountain"], "Where the journey learned to hope."));
    this.memories.push(this.addMemory(980, "ACT II", "Wedding Garden", 0xff9fca, "landmark-conservatory", ["flowers", "arbor"], "Love grew through every season."));
    this.memories.push(this.addMemory(1490, "ACT III", "The Haven", 0xf1c27f, "landmark-townhall", ["house", "lamp"], "Home became something worth carrying."));
    this.memories.push(this.addMemory(2000, "ACT IV", "Starry Ascent", 0x9ab7ff, "landmark-observatory", ["pillar", "adriel"], "Even doubt could not stop the climb."));
    this.addAct4Pillars(2000);
    this.addCathedralReveal();

    this.maria = this.add.sprite(110, WALK_Y, "maria-side-0").setDepth(40).setScale(1.18);
    this.maria.setFlipX(false);
    this.cameras.main.startFollow(this.maria, true, 0.08, 0.08, -118, 0);
    this.cameras.main.setDeadzone(220, 130);

    this.game.events.on(EV.stick, this.onStick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(EV.stick, this.onStick, this);
      this.stopMemoryWalkMusic();
    });

    this.cameras.main.fadeIn(1000, 5, 8, 23);
  }

  private addOpeningTitle() {
    const root = this.add.container(160, 250).setDepth(30);
    const veil = this.add.rectangle(0, 0, 500, 180, 0x050817, 0.34).setOrigin(0, 0.5);
    const small = this.add.text(14, -52, "BETWEEN ACT IV & ACT V", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#d9e3ff",
      letterSpacing: 4,
    });
    const title = this.add.text(10, -18, "MEMORY WALK", {
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      color: "#ffe7ae",
      stroke: "#080b1c",
      strokeThickness: 6,
      letterSpacing: 5,
    });
    const sub = this.add.text(14, 36, "Walk forward. Let every chapter pass beside you.", {
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
    line: string,
  ): MemoryGroup {
    const root = this.add.container(x, 0).setDepth(5);
    const glow = this.add.ellipse(0, 402, 380, 232, tint, 0.08).setBlendMode(Phaser.BlendModes.ADD);
    const landmark = this.add.sprite(0, 350, landmarkKey).setTint(tint).setAlpha(0.3);
    if (landmark.width > 0) landmark.setScale(Math.min(1.15, 190 / landmark.width));
    root.add([glow, landmark]);

    for (const ox of [-14, 14]) {
      const echo = this.add.sprite(ox, 354, landmarkKey).setTint(tint).setAlpha(0.065);
      echo.setScale(landmark.scaleX * 1.05, landmark.scaleY * 1.05);
      root.add(echo);
    }

    accents.forEach((key, i) => {
      if (!this.textures.exists(key)) return;
      const side = i === 0 ? -1 : 1;
      const a = this.add.sprite(side * 124, 430 - i * 20, key).setTint(tint).setAlpha(0.38);
      a.setScale(key === "pillar" ? 1.1 : key === "adriel" ? 1.0 : 0.82);
      root.add(a);
    });

    for (let i = 0; i < 12; i++) {
      const mote = this.add.circle(-155 + ((i * 37) % 310), 322 + ((i * 29) % 158), i % 3 === 0 ? 2.2 : 1.2, tint, 0.55);
      root.add(mote);
      this.tweens.add({
        targets: mote,
        y: mote.y - 18 - (i % 4) * 5,
        alpha: 0.14,
        duration: 1300 + i * 95,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }

    root.add(this.add.text(0, 270, act, {
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#f8eabf",
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.78));
    root.add(this.add.text(0, 295, title, {
      fontFamily: "Georgia, serif",
      fontSize: "23px",
      color: "#ffffff",
      stroke: "#080b1c",
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.95));
    root.add(this.add.text(0, 500, line, {
      fontFamily: "Georgia, serif",
      fontSize: "12px",
      fontStyle: "italic",
      color: "#f3effa",
      align: "center",
      wordWrap: { width: 290 },
    }).setOrigin(0.5).setAlpha(0.74));

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.04, to: 0.14 },
      scaleX: { from: 0.92, to: 1.05 },
      duration: 2400,
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
      const py = 438 + Math.abs(2 - i) * 8;
      const p = this.add.sprite(px, py, "pillar").setDepth(9).setTint(0xffdf8a).setAlpha(0.4).setScale(0.8);
      this.tweens.add({ targets: p, alpha: { from: 0.2, to: 0.56 }, duration: 1600 + i * 130, yoyo: true, repeat: -1 });
    }
  }

  private addCathedralReveal() {
    const x = 2580;
    const aura = this.add.ellipse(x, 378, 560, 380, 0xffd37a, 0.15).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: aura, alpha: { from: 0.07, to: 0.28 }, scale: { from: 0.9, to: 1.1 }, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const cathedral = this.add.sprite(x, 336, "landmark-cathedral").setDepth(10).setTint(0xffe8b0).setAlpha(0.94);
    if (cathedral.width > 0) cathedral.setScale(Math.min(1.58, 278 / cathedral.width));
    const echo = this.add.sprite(x, 342, "landmark-cathedral").setDepth(9).setTint(0xffc85a).setAlpha(0.24);
    echo.setScale(cathedral.scaleX * 1.14, cathedral.scaleY * 1.14);

    for (let i = 0; i < 7; i++) {
      const beam = this.add.rectangle(x - 141 + i * 47, 246, 17, 300, 0xffe3a1, 0.07)
        .setDepth(4)
        .setAngle(i % 2 ? 5 : -5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: beam, alpha: { from: 0.025, to: 0.16 }, duration: 1700 + i * 190, yoyo: true, repeat: -1 });
    }

    this.add.text(x, 518, "Everything led me here.", {
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      fontStyle: "italic",
      color: "#fff0c8",
      stroke: "#080b1c",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.96);
    this.add.text(x, 548, "ACT V · THE CATHEDRAL", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#ffe39a",
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.82);
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

    // Use the actual three-frame side-walk textures generated by buildSprites.
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

    // Memories brighten as Maria approaches and dissolve more dramatically once passed.
    for (const m of this.memories) {
      const d = this.maria.x - m.centerX;
      const ahead = Phaser.Math.Clamp(1 - Math.abs(d) / 430, 0, 1);
      const passedFade = d > 150 ? Phaser.Math.Clamp(1 - (d - 150) / 235, 0, 1) : 1;
      const alpha = (0.18 + ahead * 0.82) * passedFade;
      m.root.setAlpha(alpha);
      if (d > 150) m.root.setScale(1 + (1 - passedFade) * 0.035);
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
    const ripple = this.add.ellipse(this.maria.x - (this.maria.flipX ? -4 : 4), WALK_Y + 15, 18, 6, tint, 0.22)
      .setDepth(5)
      .setBlendMode(Phaser.BlendModes.ADD);
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
