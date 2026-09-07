// @ts-nocheck -- Small Act II-only scene decorator.

const ZONE = "wedding_garden";

/**
 * Evelyn now owns Act II's main guidance role. The legacy Ivy act-guide is
 * intentionally not spawned in the Wedding Garden, which removes duplicate
 * exposition without changing guides in any other act.
 */
export function installAct2GuideCleanup(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2GuideCleanupInstalled) return;
  proto.__act2GuideCleanupInstalled = true;

  const originalSpawnActGuide = proto.spawnActGuide;
  proto.spawnActGuide = function act2EvelynOnlyGuide(tx: number, ty: number) {
    if (this.save?.current_zone === ZONE) return;
    return originalSpawnActGuide.call(this, tx, ty);
  };
}
