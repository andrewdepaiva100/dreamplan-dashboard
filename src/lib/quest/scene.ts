// @ts-nocheck -- Thin direct progression layer over the preserved quest scene.
import * as Phaser from "phaser";
import { QuestScene as BaseQuestScene } from "./sceneBase";
import { QuestHouseScene } from "./house";
import type { QuestSave } from "./save";

export { EV } from "./events";
export type { HudState, ModalPayload } from "./events";

const ACT4 = "starry_ascent";
const SEAL = "seal";

/**
 * The full quest implementation lives in sceneBase.ts unchanged. This class
 * owns the Act IV -> Memory Walk handoff directly so Portal 5 cannot be created
 * by the base scene's legacy gateway safety net.
 */
export class QuestScene extends BaseQuestScene {
  private act4DirectExitQueued = false;
  private act4DirectExitPending = false;

  private act4SealComplete() {
    return this.save?.current_zone === ACT4 && this.save?.relics_collected?.includes?.(SEAL);
  }

  override create() {
    super.create();

    // Completed Act IV saves used to rebuild Portal 5 on load. Never leave a
    // completed save sitting in the old portal state: enter the Memory Walk.
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
      this.traveling = true;
      this.advanceZone();
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
    scene: [QuestScene, QuestHouseScene],
  });
  game.scene.start("quest", { save });
  return game;
}
