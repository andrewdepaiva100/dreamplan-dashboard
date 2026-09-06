import * as Phaser from "phaser";
import { WEAPONS, WEAPON_BY_ID } from "./content";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const BLADE_ID = "crossing-blade";
const BLADE_DAMAGE = 350;

function readState() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as any;
    return {
      talked: Array.isArray(parsed.talked) ? parsed.talked : [],
      forged: Boolean(parsed.forged),
      wardenDefeated: Boolean(parsed.wardenDefeated),
    };
  } catch {
    return { talked: [] as string[], forged: false, wardenDefeated: false };
  }
}

function ensureDefinition(defeated: boolean) {
  let blade = WEAPON_BY_ID[BLADE_ID] as any;
  if (!blade) {
    blade = {
      id: BLADE_ID,
      name: "The Crossing Blade",
      icon: "🗡️",
      damage: defeated ? 0 : BLADE_DAMAGE,
      reach: 84,
      color: 0x9ee7f2,
      blurb: defeated
        ? "Three failed journeys, carried across by a fourth. Its power faded when the Warden fell; it remains as a keepsake."
        : "Reforged from three failed crossings. Deals 350 damage until the Warden of Rushing Water falls.",
    };
    WEAPON_BY_ID[BLADE_ID] = blade;
    if (!WEAPONS.some((w) => w.id === BLADE_ID)) WEAPONS.push(blade);
  }
  blade.damage = defeated ? 0 : BLADE_DAMAGE;
}

function ensureSword(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const state = readState();
  ensureDefinition(state.wardenDefeated);

  // Repair an already-earned blade in old saves without spawning anything new.
  if (state.forged && !state.wardenDefeated && scene.save) {
    scene.save.weapons = Array.isArray(scene.save.weapons) ? scene.save.weapons : [];
    if (!scene.save.weapons.includes(BLADE_ID)) {
      scene.save.weapons = [...scene.save.weapons, BLADE_ID];
      scene.save.equipped_weapon = BLADE_ID;
      scene.emitSave?.();
      scene.pushHud?.(true);
      scene.refreshHand?.();
    }
    return;
  }

  if (state.wardenDefeated || state.forged || state.talked.length < 3) return;
  const center = scene.__lastCrossingCenter;
  if (!center || !Array.isArray(scene.interactables)) return;

  const existing = scene.interactables.find(
    (it: any) => it?.kind === "last-crossing-forge" && it?.obj?.active !== false,
  );
  if (existing) return;
  if (!scene.textures?.exists?.("last-crossing-blade")) return;

  const sword = scene.add.sprite(center.x, center.y - 42, "last-crossing-blade").setDepth(18).setScale(1.2);
  scene.tweens.add({
    targets: sword,
    y: sword.y - 4,
    alpha: { from: 0.78, to: 1 },
    duration: 900,
    yoyo: true,
    repeat: -1,
  });
  scene.interactables.push({
    obj: sword,
    kind: "last-crossing-forge",
    id: BLADE_ID,
    label: "Receive the Crossing Blade",
    radius: 82,
    enabled: true,
  });
}

function scheduleEnsure(scene: SceneLike, delay = 0) {
  try {
    scene.time?.delayedCall?.(delay, () => ensureSword(scene));
  } catch {
    // Scene may be shutting down.
  }
}

export function installCrossingBladeLifecycleFix(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__crossingBladeLifecycleFixInstalled) return;
  proto.__crossingBladeLifecycleFixInstalled = true;

  const originalCreate = proto.create;
  proto.create = function crossingBladeCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    scheduleEnsure(this, 300);
    return result;
  };

  const originalBuildAct1 = proto.buildAct1;
  if (typeof originalBuildAct1 === "function") {
    proto.buildAct1 = function crossingBladeBuild(this: SceneLike, ...args: any[]) {
      const result = originalBuildAct1.apply(this, args);
      scheduleEnsure(this, 20);
      return result;
    };
  }

  const originalResume = proto.onResume;
  if (typeof originalResume === "function") {
    proto.onResume = function crossingBladeResume(this: SceneLike, ...args: any[]) {
      const result = originalResume.apply(this, args);
      scheduleEnsure(this, 40);
      return result;
    };
  }
}
