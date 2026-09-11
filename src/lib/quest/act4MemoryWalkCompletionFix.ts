// @ts-nocheck -- Small Act-IV-only reliability patch for the Memory Walk handoff.
import { QuestScene } from "./scene";

const ACT4 = "starry_ascent";
const SEAL = "seal";

function hasSeal(scene: any) {
  return scene?.save?.current_zone === ACT4 && scene?.save?.relics_collected?.includes?.(SEAL);
}

function removeAct4Gateway(scene: any) {
  try {
    const gateways = (scene.interactables ?? []).filter((it: any) => it?.kind === "gateway");
    for (const it of gateways) {
      it.enabled = false;
      it.obj?.destroy?.();
    }
    scene.interactables = (scene.interactables ?? []).filter((it: any) => it?.kind !== "gateway");
    scene.gatewayObj = null;
  } catch {}
}

function prepareForMemoryWalk(scene: any) {
  removeAct4Gateway(scene);
  try { scene.bossTimer?.remove?.(); } catch {}
  try { scene.bossShotTimer?.remove?.(); } catch {}
  try {
    for (const bolt of scene.bolts?.getChildren?.() ?? []) {
      if (bolt?.active) bolt.destroy?.();
    }
  } catch {}
  try { scene.player?.setVelocity?.(0, 0); } catch {}
  scene.objective = "The stars remember — the Memory Walk begins.";
}

function queueMemoryWalk(scene: any, delay = 520) {
  if (!hasSeal(scene) || scene.__memoryWalkLaunching || scene.__act4MemoryWalkQueued) return;
  scene.__act4MemoryWalkQueued = true;
  prepareForMemoryWalk(scene);

  const go = () => {
    scene.__act4MemoryWalkQueued = false;
    if (!hasSeal(scene) || scene.__memoryWalkLaunching) return;
    prepareForMemoryWalk(scene);
    scene.advanceZone?.();
  };

  try { scene.time?.delayedCall?.(delay, go); }
  catch { go(); }
}

function installAct4MemoryWalkCompletionFix() {
  const proto: any = QuestScene?.prototype;
  if (!proto || proto.__act4MemoryWalkCompletionFixInstalled) return;
  proto.__act4MemoryWalkCompletionFixInstalled = true;

  // Never allow Portal 5 to be created once the Act IV Seal is owned.
  // Other acts continue using the original gateway behavior unchanged.
  const originalSpawnGateway = proto.spawnGateway;
  if (typeof originalSpawnGateway === "function") {
    proto.spawnGateway = function act4NoPortalFive(this: any, ...args: any[]) {
      if (hasSeal(this)) {
        removeAct4Gateway(this);
        return;
      }
      return originalSpawnGateway.apply(this, args);
    };
  }

  // When the actual second/final Act IV boss falls and the Seal is already in
  // the save, bypass the old portal branch and enter the Memory Walk directly.
  const originalDefeatActBoss = proto.defeatActBoss;
  if (typeof originalDefeatActBoss === "function") {
    proto.defeatActBoss = function act4FinalBossToMemoryWalk(this: any, ...args: any[]) {
      const finalAct4Boss =
        hasSeal(this) &&
        this.zoneState?.secondBoss === true &&
        String(this.bossName ?? "").toLowerCase().includes("hollow");

      const result = originalDefeatActBoss.apply(this, args);
      if (finalAct4Boss) queueMemoryWalk(this, 650);
      return result;
    };
  }

  // Existing test saves may already own the Seal. The base Act IV builder used
  // to recreate Portal 5 on reload, so recover those saves by suppressing the
  // portal and starting the Memory Walk after the scene is fully constructed.
  const originalCreate = proto.create;
  if (typeof originalCreate === "function") {
    proto.create = function act4CompletedSaveRecovery(this: any, ...args: any[]) {
      const result = originalCreate.apply(this, args);
      if (hasSeal(this)) queueMemoryWalk(this, 700);
      return result;
    };
  }
}

installAct4MemoryWalkCompletionFix();
