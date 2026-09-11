// @ts-nocheck -- Isolated, presentation-first bridge from Act IV into the Cathedral.
import * as Phaser from "phaser";
import { QuestScene } from "./scene";
import { EV } from "./events";

const KEY = "memory-walk";
const ACT4 = "starry_ascent";
const ACT5 = "cathedral";
const WORLD_W = 2500;
const WORLD_H = 620;

class MemoryWalkScene extends Phaser.Scene {
  parentScene: any;
  save: any;
  maria!: Phaser.GameObjects.Sprite;
  stick = { x: 0, y: 0 };
  exiting = false;
  lastMilestone = -1;

  constructor() { super(KEY); }
  init(data: { parent: any; save: any }) { this.parentScene = data?.parent; this.save = data?.save; }

  create() {
    try { this.buildMemoryWalk(); }
    catch (err) {
      console.warn?.("[quest] Memory Walk art failed; continuing safely to Act V", err);
      this.finishToCathedral();
    }
  }

  private buildMemoryWalk() {
    this.cameras.main.setBackgroundColor("#050817");
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
    this.game.events.emit(EV.music, "explore");

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x050817, 0x08112b, 0x17102e, 0x08091a, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    for (let i = 0; i < 115; i++) {
      const x = 24 + ((i * 197) % (WORLD_W - 48));
      const y = 24 + ((i * 83) % 430);
      const r = i % 11 === 0 ? 2.2 : i % 4 === 0 ? 1.4 : 0.8;
      const tint = i % 5 === 0 ? 0xffe7b0 : i % 3 === 0 ? 0xb8d8ff : 0xffffff;
      const star = this.add.circle(x, y, r, tint, i % 4 === 0 ? 0.8 : 0.48).setDepth(1);
      if (i % 13 === 0) this.tweens.add({ targets: star, alpha: { from: 0.25, to: 0.9 }, scale: { from: 0.7, to: 1.35 }, duration: 1500 + (i % 5) * 220, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    const path = this.add.graphics().setDepth(2);
    path.fillStyle(0x101a38, 0.88);
    path.fillRoundedRect(0, 390, WORLD_W, 138, 48);
    path.lineStyle(2, 0x9eb8ff, 0.18);
    path.strokeRoundedRect(0, 390, WORLD_W, 138, 48);
    for (let x = 80; x < WORLD_W; x += 95) {
      path.fillStyle(x > 1980 ? 0xffd98b : 0xb8c7ff, x > 1980 ? 0.22 : 0.1);
      path.fillCircle(x, 458 + Math.sin(x * 0.03) * 18, x > 1980 ? 8 : 5);
    }

    this.add.text(86, 325, "THE MEMORY WALK", { fontFamily: "Georgia, serif", fontSize: "24px", color: "#f8e7b1", letterSpacing: 5, stroke: "#0b1028", strokeThickness: 5 }).setOrigin(0, 0.5).setDepth(20).setAlpha(0.88);
    this.add.text(88, 354, "Walk forward. Let every chapter pass beside you.", { fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "italic", color: "#d8def5" }).setDepth(20).setAlpha(0.7);

    this.addMemory(430, "ACT I", "Sunlit Shores", 0xffd48a, "landmark-temple", ["tree", "fountain"], "Where the journey learned to hope.");
    this.addMemory(900, "ACT II", "Wedding Garden", 0xff9fca, "landmark-conservatory", ["flowers", "arbor"], "Love grew through every season.");
    this.addMemory(1370, "ACT III", "The Haven", 0xf2bf7a, "landmark-townhall", ["cottage", "lamp"], "Home became something worth carrying.");
    this.addMemory(1810, "ACT IV", "Starry Ascent", 0x9ab7ff, "landmark-observatory", ["pillar", "butterfly"], "Even doubt could not stop the climb.");
    this.addCathedralReveal();

    this.maria = this.add.sprite(105, 452, "maria-down").setDepth(40).setScale(1.1);
    this.cameras.main.startFollow(this.maria, true, 0.08, 0.08, -110, 0);
    this.cameras.main.setDeadzone(210, 130);
    this.game.events.on(EV.stick, this.onStick, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(EV.stick, this.onStick, this));
    this.cameras.main.fadeIn(900, 5, 8, 23);
    this.time.delayedCall(650, () => {
      if (this.scene.isActive()) this.parentScene?.emitToast?.("The stars hold their breath. Maria walks through what brought her here.");
    });
  }

  private addMemory(x: number, act: string, title: string, tint: number, landmarkKey: string, accents: string[], line: string) {
    const glow = this.add.ellipse(x, 405, 360, 220, tint, 0.07).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: { from: 0.035, to: 0.12 }, scaleX: { from: 0.92, to: 1.05 }, duration: 2400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const landmark = this.add.sprite(x, 350, landmarkKey).setDepth(6).setTint(tint).setAlpha(0.24);
    if (landmark.width > 0) landmark.setScale(Math.min(1.25, 180 / landmark.width));
    for (const ox of [-12, 12]) this.add.sprite(x + ox, 354, landmarkKey).setDepth(5).setTint(tint).setAlpha(0.07).setScale(landmark.scaleX * 1.04, landmark.scaleY * 1.04);
    accents.forEach((key, i) => {
      if (!this.textures.exists(key)) return;
      const side = i === 0 ? -1 : 1;
      this.add.sprite(x + side * 118, 430 - i * 22, key).setDepth(8).setTint(tint).setAlpha(0.32).setScale(key === "pillar" ? 1.15 : 0.82);
    });
    for (let i = 0; i < 10; i++) {
      const mote = this.add.circle(x - 150 + ((i * 37) % 300), 330 + ((i * 29) % 150), i % 3 === 0 ? 2.2 : 1.2, tint, 0.5).setDepth(9);
      this.tweens.add({ targets: mote, y: mote.y - 18 - (i % 4) * 5, alpha: 0.12, duration: 1300 + i * 95, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }
    this.add.text(x, 278, act, { fontFamily: "system-ui, sans-serif", fontSize: "11px", fontStyle: "bold", color: "#f6e8bb", letterSpacing: 4 }).setOrigin(0.5).setDepth(15).setAlpha(0.7);
    this.add.text(x, 298, title, { fontFamily: "Georgia, serif", fontSize: "22px", color: "#ffffff", stroke: "#080b1c", strokeThickness: 4 }).setOrigin(0.5).setDepth(15).setAlpha(0.9);
    this.add.text(x, 492, line, { fontFamily: "Georgia, serif", fontSize: "12px", fontStyle: "italic", color: "#e9e6f4", align: "center", wordWrap: { width: 280 } }).setOrigin(0.5).setDepth(15).setAlpha(0.64);
  }

  private addCathedralReveal() {
    const x = 2290;
    const aura = this.add.ellipse(x, 380, 480, 330, 0xffd37a, 0.11).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: aura, alpha: { from: 0.05, to: 0.2 }, scale: { from: 0.9, to: 1.08 }, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    const cathedral = this.add.sprite(x, 342, "landmark-cathedral").setDepth(10).setTint(0xffe4a3).setAlpha(0.82);
    if (cathedral.width > 0) cathedral.setScale(Math.min(1.55, 255 / cathedral.width));
    this.add.sprite(x, 346, "landmark-cathedral").setDepth(9).setTint(0xffc85a).setAlpha(0.18).setScale(cathedral.scaleX * 1.12, cathedral.scaleY * 1.12);
    for (let i = 0; i < 5; i++) {
      const beam = this.add.rectangle(x - 92 + i * 46, 250, 14, 260, 0xffe3a1, 0.055).setDepth(4).setAngle(i % 2 ? 5 : -5).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: beam, alpha: { from: 0.025, to: 0.11 }, duration: 1800 + i * 240, yoyo: true, repeat: -1 });
    }
    this.add.text(x, 520, "Everything led me here.", { fontFamily: "Georgia, serif", fontSize: "17px", fontStyle: "italic", color: "#ffe9b5", stroke: "#080b1c", strokeThickness: 4 }).setOrigin(0.5).setDepth(20).setAlpha(0.86);
  }

  private onStick(v: { x?: number; y?: number }) { this.stick.x = Number(v?.x ?? 0); this.stick.y = Number(v?.y ?? 0); }

  update(_time: number, delta: number) {
    if (this.exiting || !this.maria?.active) return;
    const kb = this.input.keyboard;
    let dx = this.stick.x;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown) dx += 1;
    if (kb?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown || kb?.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown) dx -= 1;
    this.maria.x = Phaser.Math.Clamp(this.maria.x + Phaser.Math.Clamp(dx, -1, 1) * 112 * Math.min(delta, 50) / 1000, 72, 2365);
    this.maria.setFlipX(dx < -0.05);
    const milestones = [330, 800, 1270, 1710, 2070];
    const reached = milestones.reduce((n, m, i) => this.maria.x >= m ? i : n, -1);
    if (reached > this.lastMilestone) {
      this.lastMilestone = reached;
      if (reached === 4) this.parentScene?.emitToast?.("Ahead, the Cathedral waits in gold.");
    }
    if (this.maria.x >= 2325) this.beginExit();
  }

  private beginExit() {
    if (this.exiting) return;
    this.exiting = true;
    this.game.events.emit(EV.music, "explore");
    this.cameras.main.fadeOut(1150, 255, 244, 214);
    this.time.delayedCall(1200, () => this.finishToCathedral());
  }

  private finishToCathedral() {
    if (!this.save) return;
    try {
      this.save.current_zone = ACT5;
      this.save.player_health = 5;
      this.parentScene?.emitSave?.();
    } catch (err) { console.warn?.("[quest] Memory Walk save handoff warning", err); }
    const parent = this.parentScene;
    try {
      if (parent?.scene) {
        parent.scene.stop(KEY);
        parent.scene.restart({ save: this.save });
        return;
      }
    } catch (err) { console.warn?.("[quest] Memory Walk restart fallback", err); }
    try { this.scene.stop(); this.scene.start("quest", { save: this.save }); } catch {}
  }
}

function removeAct4Gateway(scene: any) {
  try {
    const gateways = (scene.interactables ?? []).filter((it: any) => it?.kind === "gateway");
    for (const it of gateways) {
      it.enabled = false;
      it.obj?.destroy?.();
    }
    scene.interactables = (scene.interactables ?? []).filter((it: any) => it?.kind !== "gateway");
    scene.gatewayObj = null;
  } catch {}
}

function installMemoryWalk() {
  const proto: any = QuestScene?.prototype;
  if (!proto || proto.__memoryWalkInstalled) return;
  proto.__memoryWalkInstalled = true;

  const originalAdvanceZone = proto.advanceZone;
  if (typeof originalAdvanceZone !== "function") return;

  proto.advanceZone = function memoryWalkAdvanceZone(this: any, ...args: any[]) {
    if (this.save?.current_zone !== ACT4) return originalAdvanceZone.apply(this, args);
    // A second completion signal can arrive while the fade/launch is already
    // underway. Swallow it instead of falling through to the normal Act V
    // restart, which would bypass the Memory Walk entirely.
    if (this.__memoryWalkLaunching) return;
    this.__memoryWalkLaunching = true;
    this.traveling = true;
    this.frozen = true;
    try { this.player?.setVelocity?.(0, 0); } catch {}
    try { this.physics?.pause?.(); } catch {}
    try { this.game.events.emit(EV.music, "explore"); } catch {}

    const launch = () => {
      try {
        if (!this.__memoryWalkSceneRegistered) {
          this.scene.add(KEY, MemoryWalkScene, false);
          this.__memoryWalkSceneRegistered = true;
        }
        this.scene.launch(KEY, { parent: this, save: this.save });
        this.scene.pause();
      } catch (err) {
        console.warn?.("[quest] Memory Walk launch failed; using normal Act V transition", err);
        this.__memoryWalkLaunching = false;
        this.traveling = false;
        this.frozen = false;
        try { this.physics?.resume?.(); } catch {}
        return originalAdvanceZone.apply(this, args);
      }
    };
    try { this.cameras.main.fadeOut(700, 5, 8, 23); this.time.delayedCall(740, launch); }
    catch { launch(); }
  };

  // Act IV no longer uses a portal to Act V. Collecting the Seal still shows
  // its relic presentation; when that modal closes, the Memory Walk begins.
  const originalCollectRelic = proto.collectRelic;
  if (typeof originalCollectRelic === "function") {
    proto.collectRelic = function memoryWalkRelicExit(this: any, it: any, ...args: any[]) {
      const act4Seal = this.save?.current_zone === ACT4 && it?.id === "seal";
      const result = originalCollectRelic.call(this, it, ...args);
      if (act4Seal && this.save?.relics_collected?.includes?.("seal")) {
        removeAct4Gateway(this);
        this.objective = "The stars remember — close the relic to begin the Memory Walk.";
        this.__memoryWalkPending = true;
      }
      return result;
    };
  }

  // The base update periodically recreates completed-act gateways. Suppress that
  // safety net only in completed Act IV; all earlier acts keep their portals.
  const originalEnsureGateway = proto.ensureGateway;
  if (typeof originalEnsureGateway === "function") {
    proto.ensureGateway = function memoryWalkNoAct4Gateway(this: any, ...args: any[]) {
      if (this.save?.current_zone === ACT4 && this.save?.relics_collected?.includes?.("seal")) {
        removeAct4Gateway(this);
        return;
      }
      return originalEnsureGateway.apply(this, args);
    };
  }

  // Relic modals resume the quest through onResume. Use that exact safe point so
  // the transition never launches underneath the relic UI or while physics is paused.
  const originalOnResume = proto.onResume;
  if (typeof originalOnResume === "function") {
    proto.onResume = function memoryWalkResume(this: any, ...args: any[]) {
      const result = originalOnResume.apply(this, args);
      if (this.save?.current_zone === ACT4 && this.__memoryWalkPending && !this.__memoryWalkLaunching) {
        this.__memoryWalkPending = false;
        removeAct4Gateway(this);
        this.time?.delayedCall?.(180, () => {
          if (this.save?.current_zone === ACT4 && !this.__memoryWalkLaunching) this.advanceZone();
        });
      }
      return result;
    };
  }
}

installMemoryWalk();