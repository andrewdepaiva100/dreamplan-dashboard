// @ts-nocheck -- Act III narrative sequencing only; boss balance/progression is unchanged.
import * as Phaser from "phaser";

const ZONE = "the_haven";
const PENDING = "act3ClamourPending";
const AWAKENED = "act3ClamourAwakened";

export function installAct3OpeningFlow(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3OpeningFlowInstalled) return;
  proto.__act3OpeningFlowInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  const originalInteract = proto.interact;
  const originalResume = proto.onResume;

  // Build Haven exactly as before, except hold back its opening boss until
  // Maria has recovered all three music sheets. The held spawn preserves the
  // boss's authored Town Hall position and all existing encounter decorators.
  proto.buildAct3 = function act3OpeningBuild(...args: any[]) {
    const scene = this;
    const originalSpawnActBoss = scene.spawnActBoss;
    let heldOpeningBoss: { tx: number; ty: number; override?: any } | null = null;

    scene.spawnActBoss = function holdOpeningClamour(tx: number, ty: number, override?: any) {
      if (!override && scene.save?.current_zone === ZONE && !scene.zoneState?.[AWAKENED]) {
        heldOpeningBoss = { tx, ty, override };
        return undefined;
      }
      return originalSpawnActBoss.call(scene, tx, ty, override);
    };

    try {
      const result = originalBuildAct3.apply(scene, args);
      if (heldOpeningBoss) scene.zoneState.act3HeldClamour = heldOpeningBoss;
      return result;
    } finally {
      scene.spawnActBoss = originalSpawnActBoss;
    }
  };

  // Andrew's first conversation arms the eventual confrontation, but no boss
  // can wake yet. On the third sheet the base handler remains responsible for
  // incrementing the sheet counter and spawning Andrew through the established
  // companion system; this wrapper only updates the encounter objective.
  proto.interact = function act3OpeningInteract(...args: any[]) {
    const scene = this;
    const beforeHadLoveSword = scene.save?.weapons?.includes?.("love-sword") === true;
    const nearby = scene.save?.current_zone === ZONE ? scene.nearest?.() : null;
    const nearbyAndrew =
      !beforeHadLoveSword &&
      nearby?.enabled &&
      nearby?.obj?.active &&
      nearby.kind === "andrew" &&
      Phaser.Math.Distance.Between(scene.player.x, scene.player.y, nearby.obj.x, nearby.obj.y) <= (nearby.radius ?? 54);
    const collectingSheet = nearby?.kind === "sheet";

    const result = originalInteract.apply(scene, args);

    if (nearbyAndrew && scene.save?.weapons?.includes?.("love-sword") === true) {
      scene.zoneState[PENDING] = true;
    }

    if (collectingSheet && ((scene.zoneState?.["sheets"] as number) ?? 0) >= 3) {
      // spawnCompanion() is already called by the base third-sheet handler, so
      // Andrew arrives with his existing blue blade, follow AI, and ally damage.
      scene.zoneState[PENDING] = true;
      scene.objective = "The melody is whole — Andrew joins you as the Clamour stirs at Town Hall.";
      scene.pushHud?.(true);
    }

    return result;
  };

  proto.onResume = function act3OpeningResume(...args: any[]) {
    const result = originalResume.apply(this, args);
    const scene = this;
    const sheets = (scene.zoneState?.["sheets"] as number) ?? 0;
    if (
      scene.save?.current_zone !== ZONE ||
      !scene.zoneState?.[PENDING] ||
      sheets < 3 ||
      scene.zoneState?.[AWAKENED] ||
      scene.boss?.active
    ) return result;

    scene.zoneState[PENDING] = false;
    scene.zoneState[AWAKENED] = true;
    const held = scene.zoneState.act3HeldClamour ?? { tx: 66, ty: 28 };

    // The third sheet's discovery modal closes into this beat: Andrew is now
    // beside Maria, then the existing Clamour encounter wakes at Town Hall.
    scene.time.delayedCall(520, () => {
      if (!scene.scene?.isActive?.() || scene.save?.current_zone !== ZONE || scene.boss?.active) return;
      const x = scene.wx(held.tx);
      const y = scene.wy(held.ty);
      scene.spawnSparkle(x, y, 0xd9a441, 20);
      scene.cameras.main.flash(220, 217, 164, 65);
      scene.spawnActBoss(held.tx, held.ty, held.override);
      scene.objective = "The Clamour of Doubt — fight together with Andrew.";
      scene.pushHud?.(true);
      scene.emitToast("Andrew draws his blue blade as the Clamour rises at Town Hall.");
    });

    return result;
  };
}
