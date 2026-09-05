import * as Phaser from "phaser";
import { T } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };
type VillagerId = "elara" | "pip" | "maeve";

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const CROSSING_BLADE_ID = "crossing-blade";
const VILLAGE_SAFE_RADIUS = 310;

const NPC_TEXTURES: Record<VillagerId, string> = {
  elara: "last-crossing-elara",
  pip: "last-crossing-pip",
  maeve: "last-crossing-maeve",
};

function readState() {
  const fallback = { talked: [] as VillagerId[], forged: false, wardenDefeated: false };
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<typeof fallback>;
    return {
      talked: Array.isArray(parsed.talked)
        ? parsed.talked.filter((id): id is VillagerId => ["elara", "pip", "maeve"].includes(id))
        : [],
      forged: Boolean(parsed.forged),
      wardenDefeated: Boolean(parsed.wardenDefeated),
    };
  } catch {
    return fallback;
  }
}

function track(scene: SceneLike, obj: any) {
  if (!obj) return obj;
  obj.setData?.("lastCrossingLifecycle", true);
  return obj;
}

function addBlocker(scene: SceneLike, x: number, y: number, sx: number, sy: number) {
  if (!scene.solidDecor) return;
  const b = scene.solidDecor.create(x, y, "block") as Phaser.Physics.Arcade.Sprite;
  b.setVisible(false).setAlpha(0.001).setScale(sx, sy);
  (b as any).refreshBody?.();
  track(scene, b);
}

function addDecor(scene: SceneLike, key: string, x: number, y: number, scale = 1, tint?: number) {
  const s = track(scene, scene.add.sprite(x, y, key).setDepth(scene.dsort?.(y) ?? 9).setScale(scale));
  if (tint != null) s.setTint(tint);
  return s;
}

function addHouse(scene: SceneLike, x: number, y: number, tint: number) {
  const house = track(
    scene,
    scene.add.sprite(x, y, "house").setDepth(scene.dsort?.(y + 22) ?? 10).setScale(0.96).setTint(tint),
  );
  addBlocker(scene, x, y + 18, 1.65, 0.68);
  return house;
}

function addNpc(scene: SceneLike, x: number, y: number, id: VillagerId, label: string) {
  const texture = NPC_TEXTURES[id];
  if (!scene.textures.exists(texture)) return;
  const obj = track(scene, scene.add.sprite(x, y, texture).setDepth(scene.dsort?.(y) ?? 11));
  scene.interactables.push({ obj, kind: "last-crossing-npc", id, label, radius: 80, enabled: true });
  scene.tweens.add({ targets: obj, y: y - 2, duration: 1600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
}

function paintGround(scene: SceneLike, cx: number, cy: number) {
  const tx = Math.floor(cx / 32);
  const ty = Math.floor(cy / 32);
  const spots: [number, number][] = [];
  for (let y = -3; y <= 3; y++) {
    for (let x = -6; x <= 6; x++) {
      if ((x * x) / 38 + (y * y) / 10 <= 1) spots.push([tx + x, ty + y]);
    }
  }
  for (let x = -11; x <= -5; x++) spots.push([tx + x, ty + 2], [tx + x, ty + 3]);
  for (const [x, y] of spots) {
    const tile = scene.layer?.getTileAt?.(x, y);
    if (tile && tile.index !== T.WATER) scene.layer.putTileAt(T.PATH, x, y);
  }
  scene.layer?.setCollision?.([T.WALL, T.HEDGE, T.VOID, T.WATER]);
}

function clearVillageSpace(scene: SceneLike, cx: number, cy: number) {
  for (const child of [...(scene.children?.list ?? [])]) {
    const o = child as any;
    if (o?.texture?.key === "tree" && Phaser.Math.Distance.Between(o.x ?? 0, o.y ?? 0, cx, cy) < VILLAGE_SAFE_RADIUS) {
      o.destroy();
    }
  }
  for (const enemy of scene.enemies?.getChildren?.() ?? []) {
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    if (e.active && Phaser.Math.Distance.Between(e.x, e.y, cx, cy) < VILLAGE_SAFE_RADIUS) e.disableBody(true, true);
  }
}

function cleanupLifecycleCopies(scene: SceneLike) {
  scene.interactables = (scene.interactables ?? []).filter((it: any) => {
    if (it?.obj?.getData?.("lastCrossingLifecycle")) {
      it.obj.destroy?.();
      return false;
    }
    return true;
  });
  for (const child of [...(scene.children?.list ?? [])]) {
    const obj = child as any;
    if (obj?.getData?.("lastCrossingLifecycle")) obj.destroy?.();
  }
  for (const child of [...(scene.solidDecor?.getChildren?.() ?? [])]) {
    const obj = child as any;
    if (obj?.getData?.("lastCrossingLifecycle")) obj.destroy?.();
  }
}

function restoreVillage(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;

  // If the normal Last Crossing installer already rebuilt all three villagers,
  // leave that complete instance alone. This prevents duplicates on initial create.
  const existingNpcs = (scene.interactables ?? []).filter(
    (it: any) => it?.kind === "last-crossing-npc" && it?.obj?.active !== false,
  );
  if (existingNpcs.length >= 3) {
    scene.__lastCrossingBuilt = true;
    return;
  }

  cleanupLifecycleCopies(scene);
  scene.interactables = (scene.interactables ?? []).filter(
    (it: any) => !["last-crossing-npc", "last-crossing-forge"].includes(it?.kind),
  );

  const cx = Math.round((scene.mapW ?? 55) * 32 * 0.79);
  const cy = Math.round((scene.mapH ?? 50) * 32 * 0.78);
  clearVillageSpace(scene, cx, cy);
  paintGround(scene, cx, cy);

  addHouse(scene, cx - 118, cy - 86, 0xf0c9a0);
  addHouse(scene, cx + 118, cy - 86, 0xc9d8dd);
  addHouse(scene, cx + 18, cy + 116, 0xd6ddbd);

  addDecor(scene, "fountain", cx, cy + 8, 0.82);
  addBlocker(scene, cx, cy + 18, 0.78, 0.48);
  addDecor(scene, "bench", cx - 84, cy + 34, 0.9);
  addDecor(scene, "bench", cx + 86, cy + 35, 0.9).setFlipX(true);
  addDecor(scene, "lamp", cx - 56, cy - 54, 0.86);
  addDecor(scene, "lamp", cx + 62, cy - 52, 0.86);
  addDecor(scene, "flowers", cx - 150, cy + 62, 1.0);
  addDecor(scene, "flowers", cx - 124, cy + 64, 0.9);
  addDecor(scene, "flowers", cx + 118, cy + 55, 1.0);
  addDecor(scene, "flowers", cx + 148, cy + 62, 0.9);

  for (const [x, y] of [
    [cx - 186, cy + 72],
    [cx - 146, cy + 72],
    [cx + 150, cy - 8],
    [cx + 190, cy - 8],
  ] as [number, number][]) addDecor(scene, "fence", x, y, 0.88);

  const cart = addDecor(scene, "stall", cx + 210, cy + 82, 0.72, 0x8b6f59).setAngle(-8);
  addDecor(scene, "bench", cx + 170, cy + 105, 0.72, 0x76533e).setAngle(12);
  addDecor(scene, "fence", cx + 230, cy + 120, 0.72, 0x76533e).setAngle(-18);
  addBlocker(scene, cart.x, cart.y + 8, 0.9, 0.55);

  const sign = addDecor(scene, "signpost", cx - 252, cy + 112, 0.9);
  track(
    scene,
    scene.add
      .text(sign.x + 26, sign.y - 5, "THE LAST CROSSING", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "7px",
        fontStyle: "bold",
        color: "#f4e6bd",
        backgroundColor: "#4a3427",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0, 0.5)
      .setDepth(12),
  );

  addNpc(scene, cx - 92, cy - 2, "elara", "Talk to Elara");
  addNpc(scene, cx + 95, cy - 2, "pip", "Talk to Pip");
  addNpc(scene, cx + 20, cy + 70, "maeve", "Talk to Maeve");

  scene.__lastCrossingCenter = { x: cx, y: cy };
  scene.__lastCrossingBuilt = true;

  const state = readState();
  const swordReady = state.talked.length === 3 && !state.forged && !state.wardenDefeated;
  if (swordReady && scene.textures.exists("last-crossing-blade")) {
    const obj = track(
      scene,
      scene.add.sprite(cx, cy - 42, "last-crossing-blade").setDepth(18).setScale(1.15),
    );
    scene.tweens.add({ targets: obj, y: obj.y - 4, alpha: { from: 0.78, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
    scene.interactables.push({
      obj,
      kind: "last-crossing-forge",
      id: CROSSING_BLADE_ID,
      label: "Receive the Crossing Blade",
      radius: 82,
      enabled: true,
    });
  }
}

export function installLastCrossingLifecycle(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__lastCrossingLifecycleInstalled) return;
  proto.__lastCrossingLifecycleInstalled = true;

  const originalBuildAct1 = proto.buildAct1;
  proto.buildAct1 = function lastCrossingBuildAct1(this: SceneLike, ...args: any[]) {
    // buildZone can regenerate Act I without constructing a brand-new scene.
    // Clear the stale guard before that regeneration so the village can return.
    this.__lastCrossingBuilt = false;
    const result = originalBuildAct1.apply(this, args);

    // Wait until the current build stack finishes. On initial scene creation the
    // original Last Crossing create wrapper wins; on later Act I rebuilds this
    // restores the village only when those NPCs are actually missing.
    this.time.delayedCall(0, () => restoreVillage(this));
    return result;
  };
}
