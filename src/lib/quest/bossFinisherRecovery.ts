// @ts-nocheck -- Narrow safety patch for the cinematic boss finisher.

const STATE = "__bossFinisherState";

/**
 * The finisher temporarily sets scene.frozen=true while it stages Maria's
 * strike. The lethal hit runs through the normal defeatActBoss() path, but the
 * finisher's surrounding finally block can momentarily restore that old frozen
 * value after the boss has already been defeated. This decorator makes boss
 * defeat authoritative: once the canonical defeat path completes, gameplay is
 * immediately restored unless another real modal/cutscene paused the Phaser
 * scene itself.
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

    // The boss's normal defeat path has now owned progression/rewards. Mark the
    // finisher's saved state as playable so its later cleanup cannot re-freeze
    // Maria. The microtask runs after the finisher's lethal-hit finally block,
    // which is the exact point where the stale `frozen=true` could be restored.
    if (this[STATE] === finisher) finisher.savedFrozen = false;

    queueMicrotask(() => {
      if (!this.sys?.isActive?.()) return;
      const state = this[STATE];
      if (state && state !== finisher && !state.cleaned) return;

      // Do not fight a genuine Phaser scene pause created by a modal/cutscene.
      // Normal boss defeat itself does not pause the scene.
      if (!this.scene?.isPaused?.()) {
        this.frozen = false;
        this.physics?.resume?.();
        this.player?.setVelocity?.(0, 0);
        this.stick = { x: 0, y: 0 };
        this.pushHud?.(true);
      }
    });

    return result;
  };
}
