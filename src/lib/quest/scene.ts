// @ts-nocheck -- Thin direct progression layer over the preserved quest scene.
import * as Phaser from "phaser";
import { QuestScene as BaseQuestScene } from "./sceneBase";
import { QuestHouseScene } from "./house";
import type { QuestSave } from "./save";
import {
  MEMORY_WALK_SAVE_ID,
  MEMORY_WALK_SCENE_KEY,
  MemoryWalkScene,
} from "./memoryWalk";
import { EV } from "./events";
import "./cathedralVowsDirectFix";

export { EV } from "./events";
export type { HudState, ModalPayload } from "./events";

const ACT4 = "starry_ascent";
const ACT5 = "cathedral";
const SEAL = "seal";
const WEARINESS_NAME = "The Weight of Weariness";
const WEARINESS_SCALE = 1.2;
const LEGACY_SECOND_BOSS_WARNING = "The sky is not finished with you";
const OMINOUS_SECOND_BOSS_TITLE = "Something has followed you from the dark";
const OMINOUS_SECOND_BOSS_BODY =
  "The blossoms have barely settled, but the stars are already dying. Something ancient is moving where the shadow stood. It knows you’re here.";
const THIRD_REMINISCENCE =
  "Andrew was here through all of it… somehow that made this place feel like home.";

/** The registered Memory Walk scene owns Maria's visible interlude presentation directly. */
class DirectMemoryWalkScene extends MemoryWalkScene {
  override create() {
    super.create();

    // Keep the interlude title clean: no visible "between Act IV & Act V" label.
    this.game.events.emit(EV.act, { title: "MEMORY WALK" });
    for (const child of this.children?.list ?? []) {
      if (!(child instanceof Phaser.GameObjects.Text)) continue;
      const value = String(child.text ?? "").toUpperCase();
      if (value.includes("BETWEEN ACT IV & ACT V")) child.setText("");
    }
  }

  private showReminiscence(index: number, ...args: any[]) {
    const result = super.showReminiscence(index, ...args);
    if (index !== 2) return result;

    const bubble = this.reminiscenceBubble;
    const children = bubble?.list ?? [];
    const text = children.find((child: any) => child instanceof Phaser.GameObjects.Text);
    text?.setText?.(THIRD_REMINISCENCE);
    return result;
  }
}

/**
 * The full quest implementation lives in sceneBase.ts unchanged. This class
 * owns the Act IV -> Memory Walk -> Act V handoff directly so Portal 5 cannot
 * be created by the legacy gateway safety net.
 */
export class QuestScene extends BaseQuestScene {
  private act4DirectExitQueued = false;
  private act4DirectExitPending = false;

  /** Route the second-boss warning through the active scene before React sees it. */
  private openModal(payload: any) {
    if (payload?.type === "info" && payload?.title === LEGACY_SECOND_BOSS_WARNING) {
      return super.openModal({
        ...payload,
        title: OMINOUS_SECOND_BOSS_TITLE,
        body: OMINOUS_SECOND_BOSS_BODY,
      });
    }
    return super.openModal(payload);
  }

  /** One shared dark, heavy finishing cue for every boss. */
  private playBossFinisherSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = ((this.game as any).__bossFinisherAudioContext ??= new AudioCtx()) as AudioContext;
      if (ctx.state === "suspended") void ctx.resume();

      const now = ctx.currentTime;
      const master = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-18, now);
      compressor.knee.setValueAtTime(12, now);
      compressor.ratio.setValueAtTime(8, now);
      compressor.attack.setValueAtTime(0.004, now);
      compressor.release.setValueAtTime(0.32, now);
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.46, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.42);
      master.connect(compressor).connect(ctx.destination);

      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = "sine";
      sub.frequency.setValueAtTime(86, now);
      sub.frequency.exponentialRampToValueAtTime(27, now + 0.58);
      subGain.gain.setValueAtTime(1.0, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.92);
      sub.connect(subGain).connect(master);
      sub.start(now);
      sub.stop(now + 0.94);

      const hammer = ctx.createOscillator();
      const hammerGain = ctx.createGain();
      const distortion = ctx.createWaveShaper();
      const curve = new Float32Array(256);
      for (let i = 0; i < curve.length; i++) {
        const x = (i * 2) / (curve.length - 1) - 1;
        curve[i] = Math.tanh(3.8 * x);
      }
      distortion.curve = curve;
      distortion.oversample = "2x";
      hammer.type = "sawtooth";
      hammer.frequency.setValueAtTime(118, now);
      hammer.frequency.exponentialRampToValueAtTime(43, now + 0.24);
      hammerGain.gain.setValueAtTime(0.48, now);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
      hammer.connect(distortion).connect(hammerGain).connect(master);
      hammer.start(now);
      hammer.stop(now + 0.44);

      [146.83, 207.65, 293.66].forEach((frequency, index) => {
        const metal = ctx.createOscillator();
        const metalGain = ctx.createGain();
        metal.type = index === 1 ? "square" : "triangle";
        metal.frequency.setValueAtTime(frequency, now + 0.018);
        metal.frequency.exponentialRampToValueAtTime(frequency * 0.72, now + 0.48);
        metalGain.gain.setValueAtTime(0.18 / (index + 1), now + 0.018);
        metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.62 + index * 0.08);
        metal.connect(metalGain).connect(master);
        metal.start(now + 0.018);
        metal.stop(now + 0.86);
      });

      const tail = ctx.createOscillator();
      const tailGain = ctx.createGain();
      tail.type = "sine";
      tail.frequency.setValueAtTime(55, now + 0.18);
      tail.frequency.exponentialRampToValueAtTime(36, now + 1.28);
      tailGain.gain.setValueAtTime(0.0001, now + 0.18);
      tailGain.gain.exponentialRampToValueAtTime(0.2, now + 0.27);
      tailGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.36);
      tail.connect(tailGain).connect(master);
      tail.start(now + 0.18);
      tail.stop(now + 1.38);
    } catch (err) {
      console.warn?.("[quest] boss finisher audio unavailable", err);
    }
  }

  /** The first Act IV boss must stay at its authored size through every hit reaction. */
  private lockWearinessScale() {
    if (
      this.save?.current_zone === ACT4 &&
      this.boss?.active &&
      String(this.bossName ?? "") === WEARINESS_NAME
    ) {
      this.boss.setScale(WEARINESS_SCALE);
    }
  }

  /** Play the shared finisher only when this accepted hit crosses boss HP to zero. */
  private damageBoss(amount: number) {
    const beforeHp = Number(this.bossHp ?? 0);
    const wasFight = Boolean(this.boss?.active && this.bossPhase === 1);
    const result = super.damageBoss(amount);
    this.lockWearinessScale();
    if (wasFight && beforeHp > 0 && Number(this.bossHp ?? 0) <= 0) {
      this.playBossFinisherSound();
    }
    return result;
  }

  /** Keep presentation decorators from accumulating scale on Weariness between hits. */
  override update(time: number, delta: number) {
    const result = super.update(time, delta);
    this.lockWearinessScale();
    return result;
  }

  /** Respawn Andrew beside Maria instead of making him run across the realm to catch up. */
  private respawnAtCheckpoint() {
    const result = super.respawnAtCheckpoint();
    try {
      if (this.companion?.active && this.player?.active) {
        this.companion.setPosition(this.player.x - 28, this.player.y + 12);
        this.companion.setVelocity?.(0, 0);
        if (this.allyBlade?.active) {
          this.allyBlade.setPosition(this.companion.x, this.companion.y);
        }
      }
    } catch {}
    return result;
  }

  private act4SealComplete() {
    return this.save?.current_zone === ACT4 && this.save?.relics_collected?.includes?.(SEAL);
  }

  /** Cathedral letter stays discoverable, but without the tall rose beacon/glow. */
  private addKeyBeacon(x: number, y: number, id: string, tint: number) {
    if (this.save?.current_zone === ACT5 && String(id).startsWith("env-cathedral")) return;
    return super.addKeyBeacon(x, y, id, tint);
  }

  /** Defensive cleanup: Act V must never inherit Maria's cottage or its house trigger. */
  private removeCathedralHomeRemnants() {
    if (this.save?.current_zone !== ACT5) return;

    try {
      const keep: any[] = [];
      for (const it of this.interactables ?? []) {
        if (it?.kind === "house") {
          it.obj?.destroy?.();
          continue;
        }
        keep.push(it);
      }
      this.interactables = keep;
    } catch {}

    try {
      for (const child of [...(this.children?.list ?? [])]) {
        const key = String((child as any)?.texture?.key ?? "");
        if (key === "house" || key === "cottage") child?.destroy?.();
      }
    } catch {}
  }

  override create() {
    if (String(this.save?.current_zone) === MEMORY_WALK_SAVE_ID) {
      this.scene.start(MEMORY_WALK_SCENE_KEY, { save: this.save });
      return;
    }

    if (
      this.save?.current_zone === ACT5 &&
      this.save?.relics_collected?.includes?.(SEAL) &&
      !this.save?.memory_walk_completed
    ) {
      this.save.memory_walk_completed = true;
      this.emitSave();
    }

    super.create();
    this.removeCathedralHomeRemnants();

    if (this.act4SealComplete()) {
      this.objective = "The stars remember — the Memory Walk begins.";
      this.queueAct4MemoryWalk(700);
    }
  }

  private queueAct4MemoryWalk(delay = 220) {
    if (!this.act4SealComplete()) return;
    if (this.act4DirectExitQueued || this.__memoryWalkLaunching) return;

    this.act4DirectExitQueued = true;
    this.objective = "The stars remember — the Memory Walk begins.";

    const go = () => {
      this.act4DirectExitQueued = false;
      if (!this.act4SealComplete() || this.__memoryWalkLaunching) return;

      this.__memoryWalkLaunching = true;
      this.traveling = true;
      this.frozen = true;
      try { this.player?.setVelocity?.(0, 0); } catch {}
      try { this.physics?.pause?.(); } catch {}
      try { this.bossTimer?.remove?.(); } catch {}
      try { this.bossShotTimer?.remove?.(); } catch {}
      try {
        for (const bolt of this.bolts?.getChildren?.() ?? []) {
          if (bolt?.active) bolt.destroy?.();
        }
      } catch {}

      this.save.current_zone = MEMORY_WALK_SAVE_ID as any;
      this.save.memory_walk_completed = false;
      this.save.player_health = 5;
      this.emitSave();
      this.game.events.emit(EV.music, "home");
      this.game.events.emit(EV.hud, null);

      const enter = () => {
        try {
          this.scene.start(MEMORY_WALK_SCENE_KEY, { save: this.save });
        } catch (err) {
          console.warn?.("[quest] Memory Walk start failed; restoring Act IV safely", err);
          this.save.current_zone = ACT4;
          this.__memoryWalkLaunching = false;
          this.traveling = false;
          this.frozen = false;
          try { this.physics?.resume?.(); } catch {}
          this.emitSave();
        }
      };

      try {
        this.cameras.main.fadeOut(760, 5, 8, 23);
        this.time.delayedCall(800, enter);
      } catch {
        enter();
      }
    };

    try {
      this.time.delayedCall(delay, go);
    } catch {
      go();
    }
  }

  private spawnGateway(x: number, y: number, relocate = false) {
    if (this.save?.current_zone === ACT4) {
      if (this.save?.relics_collected?.includes?.(SEAL)) {
        if (this.frozen || !this.enemies) this.act4DirectExitPending = true;
        else this.queueAct4MemoryWalk(650);
      }
      return;
    }
    return super.spawnGateway(x, y, relocate);
  }

  private ensureGateway() {
    if (this.save?.current_zone === ACT4) return;
    return super.ensureGateway();
  }

  private onResume() {
    super.onResume();
    if (!this.act4SealComplete()) return;
    if (!this.act4DirectExitPending && this.zoneState?.finale !== true) return;

    this.act4DirectExitPending = false;
    this.queueAct4MemoryWalk(180);
  }
}

export function createQuestGame(parent: HTMLElement, save: QuestSave) {
  const game = new Phaser.Game({
    type: Phaser.WEBGL,
    parent,
    width: parent.clientWidth || 800,
    height: parent.clientHeight || 600,
    backgroundColor: "#0b1e3d",
    pixelArt: false,
    roundPixels: true,
    antialias: true,
    fps: { target: 60, forceSetTimeOut: false },
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [QuestScene, QuestHouseScene, DirectMemoryWalkScene],
  });

  const skippedMemoryWalk =
    String(save?.current_zone) === ACT5 &&
    save?.relics_collected?.includes?.(SEAL) &&
    !save?.wedding_completed &&
    !save?.memory_walk_completed;

  if (skippedMemoryWalk) save.current_zone = MEMORY_WALK_SAVE_ID as any;

  const startKey = String(save?.current_zone) === MEMORY_WALK_SAVE_ID ? MEMORY_WALK_SCENE_KEY : "quest";
  game.scene.start(startKey, { save });
  return game;
}
