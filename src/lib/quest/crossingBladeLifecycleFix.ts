import * as Phaser from "phaser";
import { WEAPONS, WEAPON_BY_ID } from "./content";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const BLADE_ID = "crossing-blade";
const BLADE_DAMAGE = 350;
const BLADE_TEXTURE = "last-crossing-blade";

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
  blade.blurb = defeated
    ? "Three failed journeys, carried across by a fourth. Its power faded when the Warden fell; it remains as a keepsake."
    : "Reforged from three failed crossings. Deals 350 damage until the Warden of Rushing Water falls.";
}

function ensureBladeTexture(scene: SceneLike) {
  if (scene.textures?.exists?.(BLADE_TEXTURE)) return true;
  const tex = scene.textures?.createCanvas?.(BLADE_TEXTURE, 20, 34);
  if (!tex) return false;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 20, 34);
  ctx.fillStyle = "#6b4a2f";
  ctx.fillRect(7, 25, 5, 7);
  ctx.fillStyle = "#d8ad55";
  ctx.fillRect(4, 23, 12, 3);
  ctx.fillRect(8, 20, 4, 4);
  ctx.fillStyle = "#dff7ff";
  ctx.fillRect(9, 4, 4, 17);
  ctx.fillStyle = "#8ed7e8";
  ctx.fillRect(7, 7, 3, 15);
  ctx.fillStyle = "#fff2a8";
  ctx.fillRect(12, 4, 2, 14);
  ctx.fillStyle = "#5e8195";
  ctx.fillRect(7, 20, 3, 2);
  tex.refresh();
  return true;
}

function crossingCenter(scene: SceneLike) {
  if (scene.__lastCrossingCenter?.x != null && scene.__lastCrossingCenter?.y != null) {
    return scene.__lastCrossingCenter;
  }
  // Same location used by the Last Crossing lifecycle rebuild. This fallback
  // means the sword can still return even if that helper has not populated its
  // center field yet on a fresh Act I build.
  return {
    x: Math.round(Number(scene.mapW ?? 55) * 32 * 0.79),
    y: Math.round(Number(scene.mapH ?? 50) * 32 * 0.78),
  };
}

function removeDeadForgeEntries(scene: SceneLike) {
  if (!Array.isArray(scene.interactables)) return;
  scene.interactables = scene.interactables.filter(
    (it: any) => it?.kind !== "last-crossing-forge" || it?.obj?.active !== false,
  );
}

function ensureSword(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const state = readState();
  ensureDefinition(state.wardenDefeated);

  if (state.forged && !state.wardenDefeated && scene.save) {
    scene.save.weapons = Array.isArray(scene.save.weapons) ? scene.save.weapons : [];
    if (!scene.save.weapons.includes(BLADE_ID)) {
      scene.save.weapons = [...scene.save.weapons, BLADE_ID];
      scene.save.equipped_weapon = BLADE_ID;
      scene.emitSave?.();
      scene.pushHud?.(true);
      scene.refreshHand?.();
      scene.game?.events?.emit?.("quest:toast", "The Crossing Blade has been restored to your inventory.");
    }
    return;
  }

  if (state.wardenDefeated || state.forged || state.talked.length < 3) return;
  if (!Array.isArray(scene.interactables)) return;

  removeDeadForgeEntries(scene);
  const existing = scene.interactables.find(
    (it: any) => it?.kind === "last-crossing-forge" && it?.obj?.active !== false,
  );
  if (existing) return;
  if (!ensureBladeTexture(scene)) return;

  const center = crossingCenter(scene);
  scene.__lastCrossingCenter = center;
  const sword = scene.add.sprite(center.x, center.y - 42, BLADE_TEXTURE).setDepth(22).setScale(1.35);
  const glow = scene.add
    .circle(center.x, center.y - 40, 29, 0x8feeff, 0.12)
    .setStrokeStyle(2, 0xdffaff, 0.82)
    .setDepth(21);
  const label = scene.add
    .text(center.x, center.y - 82, "THE CROSSING BLADE", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#effcff",
      backgroundColor: "rgba(8,24,34,.82)",
      padding: { x: 6, y: 3 },
    })
    .setOrigin(0.5)
    .setDepth(23);

  scene.tweens.add({
    targets: [sword, glow],
    y: "-=4",
    alpha: { from: 0.78, to: 1 },
    duration: 850,
    yoyo: true,
    repeat: -1,
  });
  scene.interactables.push({
    obj: sword,
    kind: "last-crossing-forge",
    id: BLADE_ID,
    label: "Receive the Crossing Blade",
    radius: 92,
    enabled: true,
  });
  sword.setData?.("crossingBladeLifecycleFix", true);
  glow.setData?.("crossingBladeLifecycleFix", true);
  label.setData?.("crossingBladeLifecycleFix", true);
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
    scheduleEnsure(this, 250);
    scheduleEnsure(this, 900);
    return result;
  };

  const originalBuildAct1 = proto.buildAct1;
  if (typeof originalBuildAct1 === "function") {
    proto.buildAct1 = function crossingBladeBuild(this: SceneLike, ...args: any[]) {
      const result = originalBuildAct1.apply(this, args);
      scheduleEnsure(this, 30);
      scheduleEnsure(this, 500);
      return result;
    };
  }

  const originalResume = proto.onResume;
  if (typeof originalResume === "function") {
    proto.onResume = function crossingBladeResume(this: SceneLike, ...args: any[]) {
      const result = originalResume.apply(this, args);
      scheduleEnsure(this, 40);
      scheduleEnsure(this, 350);
      return result;
    };
  }
}
