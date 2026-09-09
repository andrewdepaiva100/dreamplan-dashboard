// @ts-nocheck -- Reuses the existing quest music modes; no second audio engine.
import * as Phaser from "phaser";

const ZONE = "the_haven";
const MUSIC_EVENT = "quest:music";

/**
 * Haven is the emotional "home" act, so its outdoor exploration deliberately
 * uses the existing slow vow/lullaby score instead of the generic explore
 * cadence. Boss state still owns the established battle transition.
 */
export function installAct3MusicIdentity(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3MusicIdentityInstalled) return;
  proto.__act3MusicIdentityInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function act3MusicIdentityUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    if (this.save?.current_zone !== ZONE || !this.player?.active) return result;

    const fighting = Boolean(
      this.boss?.active &&
        (this.bossPhase === 1 || this.bossTalking) &&
        Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y) < 620,
    );
    const desired = fighting ? "battle" : "home";

    // Keep a decorator-local state so we do not interfere with the scene's own
    // explore/battle bookkeeping. React receives one intentional Haven override
    // only when the desired musical mood actually changes.
    if (this.__act3MusicIdentityLast !== desired) {
      this.__act3MusicIdentityLast = desired;
      this.game?.events?.emit?.(MUSIC_EVENT, desired);
    }

    return result;
  };
}
