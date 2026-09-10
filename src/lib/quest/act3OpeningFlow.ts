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
  // Maria and Andrew have recovered all three music sheets. The held spawn
  // preserves the boss's authored Town Hall position and every encounter decorator.
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

  // Andrew's first conversation still grants the Love Sword through the base
  // interaction. Immediately afterward, let the established companion system
  // create him early so his promise to help search is true in both story and play.
  // The temporary sheet count only bypasses the old companion wait condition;
  // the real count is restored before this interaction returns.
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
      const realSheets = (scene.zoneState?.["sheets"] as number) ?? 0;
      if (!scene.companion?.active) {
        scene.zoneState["sheets"] = Math.max(3, realSheets);
        scene.spawnCompanion?.();
        scene.zoneState["sheets"] = realSheets;
      }
      scene.zoneState[PENDING] = true;
      scene.objective = "Search Haven together — recover the three scattered pages of your wedding melody.";
      scene.pushHud?.(true);
    }

    if (collectingSheet && ((scene.zoneState?.["sheets"] as number) ?? 0) >= 3) {
      scene.zoneState[PENDING] = true;
      scene.objective = "The melody is whole — together, you and Andrew turn toward Town Hall.";
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

    // The third sheet completes the shared search; Andrew is already walking
    // beside Maria when the existing Clamour encounter wakes at Town Hall.
    scene.time.delayedCall(520, () => {
      if (!scene.scene?.isActive?.() || scene.save?.current_zone !== ZONE || scene.boss?.active) return;
      const x = scene.wx(held.tx);
      const y = scene.wy(held.ty);
      scene.spawnSparkle(x, y, 0xd9a441, 20);
      scene.cameras.main.flash(220, 217, 164, 65);
      scene.spawnActBoss(held.tx, held.ty, held.override);
      scene.objective = "The Clamour of Doubt — fight together with Andrew.";
      scene.pushHud?.(true);
      scene.emitToast("Andrew draws his blue blade beside you as the Clamour rises at Town Hall.");
    });

    return result;
  };
}
