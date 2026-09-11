// @ts-nocheck -- Narrow safety patch for the cinematic boss finisher.

const STATE = "__bossFinisherState";

/**
 * The finisher stages its lethal hit while the quest scene is temporarily
 * frozen. Some boss decorators can leave either the scene or Arcade Physics
 * paused after that hit completes. This recovery layer makes the canonical
 * boss defeat authoritative and explicitly restores play once the finisher's
 * lethal strike has finished.
 */
export function installBossFinisherRecovery(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__bossFinisherRecoveryInstalled) return;
  proto.__bossFinisherRecoveryInstalled = true;

  const originalDefeat = proto.defeatActBoss;
  if (typeof originalDefeat !== "function") return;

  proto.defeatActBoss = function bossFinisherRecoveryDefeat(...args: any[]) {
    const finisher = this[STATE];
    const wasFinishing = Boolean(finisher && !finisher.cleaned && finisher.mode === "executing");
    const result = originalDefeat.apply(this, args);

    if (!wasFinishing) return result;

    // The normal defeat path has already handled rewards, portals, guardians,
    // second-boss state, and every other progression side effect. From here on
    // the finisher owns only presentation, so it must never keep gameplay locked.
    if (this[STATE] === finisher) finisher.savedFrozen = false;

    const restoreGameplay = () => {
      if (!this.sys?.isActive?.()) return;

      // Resume both layers deliberately. A Phaser scene pause prevents its own
      // timers from advancing, so relying on a delayed in-scene cleanup can
      // deadlock forever; browser-scheduled recovery avoids that failure mode.
      try {
        const key = this.sys?.settings?.key;
        if (this.scene?.isPaused?.(key)) this.scene?.resume?.(key);
      } catch {
        try { this.scene?.resume?.(); } catch { /* scene may be shutting down */ }
      }

      try { this.physics?.resume?.(); } catch { /* physics may already be running */ }

      this.frozen = false;
      this.player?.setVelocity?.(0, 0);
      if (this.vel) {
        this.vel.x = 0;
        this.vel.y = 0;
      }
      this.stick = { x: 0, y: 0 };
      this.pushHud?.(true);
    };

    // First pass runs after the finisher's synchronous lethal-hit finally block.
    queueMicrotask(restoreGameplay);

    // Two browser-clock fallbacks cover decorators that re-pause during their
    // own immediate defeat feedback. They intentionally finish before the base
    // game's delayed second-boss modal at 900ms, so genuine story modals still
    // retain control when they appear.
    if (typeof window !== "undefined") {
      window.setTimeout(restoreGameplay, 120);
      window.setTimeout(restoreGameplay, 650);
    }

    return result;
  };
}
