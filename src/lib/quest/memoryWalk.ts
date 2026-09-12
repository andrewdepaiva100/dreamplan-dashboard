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
      // Reuse the gentlest score mode as an interlude-only lullaby.
      this.game.events.emit(EV.music, "home");
      this.game.events.emit(EV.act, { title: "MEMORY WALK · BETWEEN ACT IV & ACT V" });
      this.buildMemoryWalk();
    } catch (err) {
      console.warn?.("[quest] Memory Walk setup failed; continuing safely to Act V", err);
      this.finishToCathedral();
    }
  }

  private buildMemoryWalk() {
    this.cameras.main.setBackgroundColor("#050817");
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x040713, 0x07102a, 0x1a102f, 0x100918, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    // A field of stars that slowly warms as Maria nears the Cathedral.
    for (let i = 0; i < 150; i++) {
      const x = 22 + ((i * 197) % (WORLD_W - 44));
      const y = 22 + ((i * 83) % 410);
      const r = i % 13 === 0 ? 2.4 : i % 4 === 0 ? 1.45 : 0.8;
      const tint = x > 2180 ? 0xffe2a0 : i % 5 === 0 ? 0xc8ddff : 0xffffff;
      const star = this.add.circle(x, y, r, tint, i % 4 === 0 ? 0.78 : 0.45).setDepth(1);
      if (i % 11 === 0) {
        this.tweens.add({
          targets: star,
          alpha: { from: 0.22, to: 0.92 },
          scale: { from: 0.72, to: 1.35 },
          duration: 1450 + (i % 6) * 190,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    const path = this.add.graphics().setDepth(2);
    path.fillStyle(0x101a38, 0.9);
    path.fillRoundedRect(0, 394, WORLD_W, 142, 52);
    path.lineStyle(2, 0xa8bbff, 0.16);
    path.strokeRoundedRect(0, 394, WORLD_W, 142, 52);
    for (let x = 72; x < WORLD_W; x += 88) {
      const warm = Phaser.Math.Clamp((x - 1960) / 700, 0, 1);
      path.fillStyle(warm > 0.4 ? 0xffd786 : 0xb6c7ff, 0.08 + warm * 0.16);
      path.fillCircle(x, WALK_Y + Math.sin(x * 0.031) * 18, warm > 0.4 ? 7 : 4.5);
    }

    this.addOpeningTitle();
    this.memories.push(this.addMemory(470, "ACT I", "Sunlit Shores", 0xffd48a, "landmark-temple", ["tree", "fountain"], "Where the journey learned to hope."));
    this.memories.push(this.addMemory(980, "ACT II", "Wedding Garden", 0xff9fca, "landmark-conservatory", ["flowers", "arbor"], "Love grew through every season."));
    this.memories.push(this.addMemory(1490, "ACT III", "The Haven", 0xf1c27f, "landmark-townhall", ["house", "lamp"], "Home became something worth carrying."));
    this.memories.push(this.addMemory(2000, "ACT IV", "Starry Ascent", 0x9ab7ff, "landmark-observatory", ["pillar", "adriel"], "Even doubt could not stop the climb."));
    this.addAct4Pillars(2000);
    this.addCathedralReveal();

    const mariaKey = this.textures.exists("maria-down-0") ? "maria-down-0" : "maria-down";
    this.maria = this.add.sprite(110, WALK_Y, mariaKey).setDepth(40).setScale(1.12);
    this.cameras.main.startFollow(this.maria, true, 0.08, 0.08, -118, 0);
    this.cameras.main.setDeadzone(220, 130);

    this.game.events.on(EV.stick, this.onStick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(EV.stick, this.onStick, this);
    });

    this.cameras.main.fadeIn(1000, 5, 8, 23);
  }

  private addOpeningTitle() {
    const root = this.add.container(160, 250).setDepth(30);
    const veil = this.add.rectangle(0, 0, 500, 180, 0x050817, 0.42).setOrigin(0, 0.5);
    const small = this.add.text(14, -52, "BETWEEN ACT IV & ACT V", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#c8d6ff",
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
      color: "#e1e5f6",
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
    const glow = this.add.ellipse(0, 402, 380, 232, tint, 0.07).setBlendMode(Phaser.BlendModes.ADD);
    const landmark = this.add.sprite(0, 350, landmarkKey).setTint(tint).setAlpha(0.28);
    if (landmark.width > 0) landmark.setScale(Math.min(1.15, 190 / landmark.width));
    root.add([glow, landmark]);

    for (const ox of [-14, 14]) {
      const echo = this.add.sprite(ox, 354, landmarkKey).setTint(tint).setAlpha(0.055);
      echo.setScale(landmark.scaleX * 1.05, landmark.scaleY * 1.05);
      root.add(echo);
    }

    accents.forEach((key, i) => {
      if (!this.textures.exists(key)) return;
      const side = i === 0 ? -1 : 1;
      const a = this.add.sprite(side * 124, 430 - i * 20, key).setTint(tint).setAlpha(0.34);
      a.setScale(key === "pillar" ? 1.1 : key === "adriel" ? 1.0 : 0.82);
      root.add(a);
    });

    for (let i = 0; i < 12; i++) {
      const mote = this.add.circle(-155 + ((i * 37) % 310), 322 + ((i * 29) % 158), i % 3 === 0 ? 2.2 : 1.2, tint, 0.5);
      root.add(mote);
      this.tweens.add({
        targets: mote,
        y: mote.y - 18 - (i % 4) * 5,
        alpha: 0.12,
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
      color: "#f6e8bb",
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0.74));
    root.add(this.add.text(0, 295, title, {
      fontFamily: "Georgia, serif",
      fontSize: "23px",
      color: "#ffffff",
      stroke: "#080b1c",
      strokeThickness: 4,
    }).setOrigin(0.5).setAlpha(0.92));
    root.add(this.add.text(0, 500, line, {
      fontFamily: "Georgia, serif",
      fontSize: "12px",
      fontStyle: "italic",
      color: "#ece9f6",
      align: "center",
      wordWrap: { width: 290 },
    }).setOrigin(0.5).setAlpha(0.68));

    this.tweens.add({
      targets: glow,
      alpha: { from: 0.035, to: 0.12 },
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
      const p = this.add.sprite(px, py, "pillar").setDepth(9).setTint(0xffdf8a).setAlpha(0.36).setScale(0.8);
      this.tweens.add({ targets: p, alpha: { from: 0.18, to: 0.5 }, duration: 1600 + i * 130, yoyo: true, repeat: -1 });
    }
  }

  private addCathedralReveal() {
    const x = 2580;
    const aura = this.add.ellipse(x, 378, 540, 360, 0xffd37a, 0.12).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: aura, alpha: { from: 0.05, to: 0.22 }, scale: { from: 0.9, to: 1.09 }, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const cathedral = this.add.sprite(x, 336, "landmark-cathedral").setDepth(10).setTint(0xffe4a3).setAlpha(0.88);
    if (cathedral.width > 0) cathedral.setScale(Math.min(1.55, 270 / cathedral.width));
    const echo = this.add.sprite(x, 342, "landmark-cathedral").setDepth(9).setTint(0xffc85a).setAlpha(0.18);
    echo.setScale(cathedral.scaleX * 1.12, cathedral.scaleY * 1.12);

    for (let i = 0; i < 6; i++) {
      const beam = this.add.rectangle(x - 118 + i * 47, 246, 15, 285, 0xffe3a1, 0.052)
        .setDepth(4)
        .setAngle(i % 2 ? 5 : -5)
        .setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: beam, alpha: { from: 0.02, to: 0.12 }, duration: 1750 + i * 210, yoyo: true, repeat: -1 });
    }

    this.add.text(x, 518, "Everything led me here.", {
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      fontStyle: "italic",
      color: "#ffe9b5",
      stroke: "#080b1c",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.9);
    this.add.text(x, 548, "ACT V · THE CATHEDRAL", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#f6d98d",
      letterSpacing: 4,
    }).setOrigin(0.5).setDepth(20).setAlpha(0.7);
  }

  private onStick(v: { x?: number; y?: number }) {
    this.stick.x = Number(v?.x ?? 0);
    this.stick.y = Number(v?.y ?? 0);
  }

  update(_time: number, delta: number) {
    if (this.exiting || !this.maria?.active) return;

    const kb = this.input.keyboard;
    let dx = this.stick.x;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) dx += 1;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) dx -= 1;

    this.maria.x = Phaser.Math.Clamp(
      this.maria.x + Phaser.Math.Clamp(dx, -1, 1) * 108 * Math.min(delta, 50) / 1000,
      72,
      2670,
    );
    this.maria.setFlipX(dx < -0.05);

    // Memories brighten as Maria approaches and dissolve once she passes them.
    for (const m of this.memories) {
      const d = this.maria.x - m.centerX;
      const ahead = Phaser.Math.Clamp(1 - Math.abs(d) / 430, 0, 1);
      const passedFade = d > 180 ? Phaser.Math.Clamp(1 - (d - 180) / 260, 0, 1) : 1;
      m.root.setAlpha((0.22 + ahead * 0.78) * passedFade);
    }
    this.titleCard?.setAlpha(Phaser.Math.Clamp(1 - (this.maria.x - 150) / 430, 0, 1));

    const milestones = [340, 850, 1360, 1870, 2240];
    const reached = milestones.reduce((n, m, i) => this.maria.x >= m ? i : n, -1);
    if (reached > this.lastMilestone) {
      this.lastMilestone = reached;
      if (reached === 4) this.spawnGuidingButterfly();
    }

    if (this.butterfly?.active) {
      const tx = Math.min(2620, this.maria.x + 105);
      const ty = WALK_Y - 58 + Math.sin(this.time.now / 240) * 13;
      this.butterfly.x += (tx - this.butterfly.x) * 0.06;
      this.butterfly.y += (ty - this.butterfly.y) * 0.07;
      this.butterfly.setFlipX(tx < this.butterfly.x);
    }

    if (this.maria.x >= 2635) this.beginExit();
  }

  private spawnGuidingButterfly() {
    if (this.butterfly?.active || !this.textures.exists("butterfly")) return;
    this.butterfly = this.add.sprite(this.maria.x + 90, WALK_Y - 58, "butterfly")
      .setDepth(45)
      .setTint(0xffdc83)
      .setScale(1.2);
    this.tweens.add({
      targets: this.butterfly,
      alpha: { from: 0.45, to: 1 },
      scale: { from: 0.95, to: 1.28 },
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private beginExit() {
    if (this.exiting) return;
    this.exiting = true;
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
