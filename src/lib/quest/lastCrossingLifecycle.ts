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

function writeState(state: ReturnType<typeof readState>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Optional local quest-state persistence only.
  }
}

function ensureBladeTexture(scene: SceneLike) {
  if (scene.textures?.exists?.("last-crossing-blade")) return true;
  const tex = scene.textures?.createCanvas?.("last-crossing-blade", 20, 34);
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
  tex.refresh();
  return true;
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

function crossingCenter(scene: SceneLike) {
  if (scene.__lastCrossingCenter?.x != null && scene.__lastCrossingCenter?.y != null) return scene.__lastCrossingCenter;
  return {
    x: Math.round((scene.mapW ?? 55) * 32 * 0.79),
    y: Math.round((scene.mapH ?? 50) * 32 * 0.78),
  };
}

function looksLikeFreshAct1Save(scene: SceneLike) {
  const save = scene.save;
  if (!save || save.current_zone !== "sunlit_shores") return false;
  const nonCrossingWeapons = (save.weapons ?? []).filter((id: string) => id !== CROSSING_BLADE_ID);
  return Boolean(
    (save.relics_collected?.length ?? 0) === 0 &&
      (save.secret_envelopes_found?.length ?? 0) === 0 &&
      Number(save.vault_keys_count ?? 0) === 0 &&
      !save.wedding_completed &&
      !save.checkpoint_zone &&
      Object.keys(save.inventory ?? {}).length === 0 &&
      nonCrossingWeapons.length === 0,
  );
}

function removeCrossingBladeFromSave(scene: SceneLike) {
  if (!scene.save) return;
  const before = Array.isArray(scene.save.weapons) ? scene.save.weapons : [];
  const next = before.filter((id: string) => id !== CROSSING_BLADE_ID);
  const changed = next.length !== before.length || scene.save.equipped_weapon === CROSSING_BLADE_ID;
  scene.save.weapons = next;
  if (scene.save.equipped_weapon === CROSSING_BLADE_ID) scene.save.equipped_weapon = next[0] ?? null;
  if (changed) {
    scene.emitSave?.();
    scene.pushHud?.(true);
    scene.refreshHand?.();
  }
}

function repairCrossingProgress(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const state = readState();
  const realWardenDefeated = Boolean(scene.save?.relics_collected?.includes?.("lantern"));

  if (looksLikeFreshAct1Save(scene)) {
    if (state.talked.length || state.forged || state.wardenDefeated || scene.save?.weapons?.includes?.(CROSSING_BLADE_ID)) {
      writeState({ talked: [], forged: false, wardenDefeated: false });
      removeCrossingBladeFromSave(scene);
    }
    return;
  }

  let changed = false;
  if (state.wardenDefeated !== realWardenDefeated) {
    state.wardenDefeated = realWardenDefeated;
    changed = true;
  }
  if (!realWardenDefeated && state.forged && state.talked.length < 3) {
    state.forged = false;
    removeCrossingBladeFromSave(scene);
    changed = true;
  }
  if (changed) writeState(state);
}

function removeOldAct1RestStation(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || !Array.isArray(scene.interactables)) return;
  scene.interactables = scene.interactables.filter((it: any) => {
    const oldRest = it?.kind === "rest" && it?.obj?.texture?.key === "rest-stone";
    if (oldRest) it.obj?.destroy?.();
    return !oldRest;
  });
}

function removeWorldBladePickup(scene: SceneLike) {
  if (!Array.isArray(scene.interactables)) return;
  scene.interactables = scene.interactables.filter((it: any) => {
    if (it?.kind !== "last-crossing-forge") return true;
    scene.tweens?.killTweensOf?.(it.obj);
    it.obj?.destroy?.();
    return false;
  });
}

function ensureCrossingBlade(scene: SceneLike, cx: number, cy: number) {
  const state = readState();
  if (state.wardenDefeated) {
    removeWorldBladePickup(scene);
    return;
  }

  if (state.forged && scene.save) {
    // Once Maria accepts the blade, the physical pickup is gone for good.
    // Only the equipped hand sprite is allowed to remain.
    removeWorldBladePickup(scene);
    scene.save.weapons = Array.isArray(scene.save.weapons) ? scene.save.weapons : [];
    if (!scene.save.weapons.includes(CROSSING_BLADE_ID)) {
      scene.save.weapons = [...scene.save.weapons, CROSSING_BLADE_ID];
      scene.save.equipped_weapon = CROSSING_BLADE_ID;
      scene.emitSave?.();
      scene.pushHud?.(true);
      scene.refreshHand?.();
    }
    return;
  }

  if (state.talked.length !== 3 || !Array.isArray(scene.interactables)) return;
  scene.interactables = scene.interactables.filter((it: any) => {
    if (it?.kind !== "last-crossing-forge") return true;
    return it?.obj?.active === true && it?.enabled !== false;
  });

  const existing = scene.interactables.find(
    (it: any) => it?.kind === "last-crossing-forge" && it?.obj?.active === true && it?.enabled !== false,
  );
  if (existing || !ensureBladeTexture(scene)) return;

  const obj = track(
    scene,
    scene.add.sprite(cx, cy - 42, "last-crossing-blade").setDepth(20).setScale(1.22),
  );
  scene.tweens.add({
    targets: obj,
    y: obj.y - 4,
    alpha: { from: 0.78, to: 1 },
    duration: 900,
    yoyo: true,
    repeat: -1,
  });
  scene.interactables.push({
    obj,
    kind: "last-crossing-forge",
    id: CROSSING_BLADE_ID,
    label: "Receive the Crossing Blade",
    radius: 86,
    enabled: true,
  });
}

function restoreVillage(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  repairCrossingProgress(scene);
  removeOldAct1RestStation(scene);

  const fallbackCx = Math.round((scene.mapW ?? 55) * 32 * 0.79);
  const fallbackCy = Math.round((scene.mapH ?? 50) * 32 * 0.78);
  const knownCenter = scene.__lastCrossingCenter ?? { x: fallbackCx, y: fallbackCy };

  const existingNpcs = (scene.interactables ?? []).filter(
    (it: any) => it?.kind === "last-crossing-npc" && it?.obj?.active !== false,
  );
  if (existingNpcs.length >= 3) {
    scene.__lastCrossingBuilt = true;
    ensureCrossingBlade(scene, knownCenter.x, knownCenter.y);
    return;
  }

  cleanupLifecycleCopies(scene);
  scene.interactables = (scene.interactables ?? []).filter(
    (it: any) => !["last-crossing-npc", "last-crossing-forge"].includes(it?.kind),
  );

  const cx = fallbackCx;
  const cy = fallbackCy;
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
  ensureCrossingBlade(scene, cx, cy);
}

function refreshBladeAfterDialogue(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  repairCrossingProgress(scene);
  const state = readState();
  if (state.forged || state.wardenDefeated) {
    removeWorldBladePickup(scene);
    return;
  }
  if (state.talked.length !== 3) return;
  const center = crossingCenter(scene);
  scene.__lastCrossingCenter = center;
  ensureCrossingBlade(scene, center.x, center.y);
}

export function installLastCrossingLifecycle(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__lastCrossingLifecycleInstalled) return;
  proto.__lastCrossingLifecycleInstalled = true;

  const originalCreate = proto.create;
  proto.create = function lastCrossingLifecycleCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(0, () => restoreVillage(this));
    return result;
  };

  const originalBuildAct1 = proto.buildAct1;
  proto.buildAct1 = function lastCrossingBuildAct1(this: SceneLike, ...args: any[]) {
    this.__lastCrossingBuilt = false;
    const result = originalBuildAct1.apply(this, args);
    this.time.delayedCall(0, () => restoreVillage(this));
    return result;
  };

  const originalResume = proto.onResume;
  if (typeof originalResume === "function") {
    proto.onResume = function lastCrossingLifecycleResume(this: SceneLike, ...args: any[]) {
      const result = originalResume.apply(this, args);
      this.time.delayedCall(40, () => refreshBladeAfterDialogue(this));
      return result;
    };
  }
}
