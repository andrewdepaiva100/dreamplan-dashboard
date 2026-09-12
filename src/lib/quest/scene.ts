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

export { EV } from "./events";
export type { HudState, ModalPayload } from "./events";

const ACT4 = "starry_ascent";
const ACT5 = "cathedral";
const SEAL = "seal";

/**
 * The full quest implementation lives in sceneBase.ts unchanged. This class
 * owns the Act IV -> Memory Walk -> Act V handoff directly so Portal 5 cannot
 * be created by the legacy gateway safety net.
 */
export class QuestScene extends BaseQuestScene {
  private act4DirectExitQueued = false;
  private act4DirectExitPending = false;

  private act4SealComplete() {
    return this.save?.current_zone === ACT4 && this.save?.relics_collected?.includes?.(SEAL);
  }

  override create() {
    // A save made during the interlude must resume in the interlude, never let
    // the base realm builder try to interpret memory_walk as a normal realm.
    if (String(this.save?.current_zone) === MEMORY_WALK_SAVE_ID) {
      this.scene.start(MEMORY_WALK_SCENE_KEY, { save: this.save });
      return;
    }

    // Reaching the Cathedral from the Memory Walk marks the interlude complete.
    // Existing pre-fix Cathedral saves are intercepted in createQuestGame below,
    // so this branch only runs after the Memory Walk itself starts Act V.
    if (
      this.save?.current_zone === ACT5 &&
      this.save?.relics_collected?.includes?.(SEAL) &&
      !this.save?.memory_walk_completed
    ) {
      this.save.memory_walk_completed = true;
      this.emitSave();
    }

    super.create();

    // Completed Act IV saves used to rebuild Portal 5 on load. Instead, make
    // the saved progression state explicitly become the Memory Walk.
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

      // This is a real persisted progression state between Act IV and Act V.
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

  /**
   * Act IV has no portal to Act V. Any legacy request to create one is converted
   * into the Memory Walk handoff instead. Acts I-III keep their base portals.
   */
  private spawnGateway(x: number, y: number, relocate = false) {
    if (this.save?.current_zone === ACT4) {
      if (this.save?.relics_collected?.includes?.(SEAL)) {
        // Relic collection opens a modal before it asks for the old gateway.
        // Wait for that modal to close; boss/reload paths may transition now.
        if (this.frozen || !this.enemies) this.act4DirectExitPending = true;
        else this.queueAct4MemoryWalk(650);
      }
      return;
    }
    return super.spawnGateway(x, y, relocate);
  }

  /** The recurring gateway safety net must never recreate Portal 5. */
  private ensureGateway() {
    if (this.save?.current_zone === ACT4) return;
    return super.ensureGateway();
  }

  /** Start the Memory Walk only after the Seal presentation has closed. */
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
    scene: [QuestScene, QuestHouseScene, MemoryWalkScene],
  });

  // One-time migration for saves that were already pushed straight into Act V
  // by the old transition bug. Once Memory Walk completes, the local completion
  // marker prevents this recovery from ever running again.
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
