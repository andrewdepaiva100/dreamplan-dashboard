// @ts-nocheck -- compatibility shim for the old scene-freezing finisher.

/**
 * The current boss finisher no longer freezes QuestScene or pauses Arcade
 * Physics, so the old recovery wrapper must not resume the scene after a boss
 * defeat. Keeping this exported installer as a no-op preserves the existing
 * import path without interfering with genuine relic/story modals.
 */
export function installBossFinisherRecovery(_QuestScene: any) {
  // Intentionally empty.
}
