// @ts-nocheck -- Runtime Phaser decorator; intentionally isolated from core scene typing.

const FIRST_PASS_ZONES = new Set(["sunlit_shores", "wedding_garden"]);
const ACTOR_KINDS = new Set([
  "guest",
  "guide",
  "act-guide",
  "smith",
  "garden-keeper",
  "dog",
  "andrew",
  "andrew-ceremony",
]);
const NON_OCCLUDERS = new Set(["fence", "bridge", "lamp", "bench"]);

function feetDepth(scene: any, obj: any, extra = 0) {
  if (!obj?.active || typeof obj.y !== "number") return;
  const footY = obj.y + Math.max(0, (obj.displayHeight ?? 0) * 0.28) + extra;
  obj.setDepth?.(scene.dsort?.(footY) ?? (12 + footY * 0.01));
}

function addLandmarkDepthShadow(scene: any, sprite: any) {
  if (!sprite?.active || !FIRST_PASS_ZONES.has(scene.save?.current_zone)) return null;
  const textureKey = sprite.texture?.key;
  if (!textureKey || !scene.textures?.exists?.(textureKey)) return null;

  // Reuse the actual landmark artwork as its own offset silhouette. This gives
  // the building visible height without introducing geometric programmer art.
  // Use the source sprite's horizontal scale as the authored scale; the scene's
  // projection hook compensates vertical scale for upright world objects.
  const shadow = scene.add
    .sprite(sprite.x + 5, sprite.y + 9, textureKey)
    .setOrigin(sprite.originX ?? 0.5, sprite.originY ?? 0.5)
    .setScale(sprite.scaleX ?? 1)
    .setTint(0x182038)
    .setAlpha(0.18)
    .setDepth(Math.max(2, (sprite.depth ?? 8) - 0.16));
  shadow.setData("2.5d-depth-shadow", true);
  return shadow;
}

function collectOccluders(scene: any) {
  const out: any[] = [];
  for (const obj of scene.solidDecor?.getChildren?.() ?? []) {
    if (!obj?.active || !obj.texture?.key) continue;
    if (NON_OCCLUDERS.has(String(obj.texture.key))) continue;
    if ((obj.displayHeight ?? 0) < 24) continue;
    obj.setData?.("2.5d-base-alpha", obj.alpha ?? 1);
    out.push(obj);
  }
  const landmark = scene.landmark?.sprite;
  if (landmark?.active) {
    landmark.setData?.("2.5d-base-alpha", landmark.alpha ?? 1);
    out.push(landmark);
  }
  return out;
}

function updateOcclusion(scene: any) {
  const state = scene.__global25d;
  const player = scene.player;
  if (!state || !player?.active) return;

  for (const obj of state.occluders ?? []) {
    if (!obj?.active) continue;
    const dx = Math.abs(player.x - obj.x);
    const dy = player.y - obj.y;
    const width = Math.max(44, (obj.displayWidth ?? 44) * 0.46);
    const height = Math.max(38, (obj.displayHeight ?? 38) * 0.5);
    // Fade only when Maria is visually behind/under a tall prop, never simply
    // because she walks nearby. This preserves solid silhouettes in open space.
    const covered = dx < width && dy > -height * 0.42 && dy < height * 0.68;
    const base = Number(obj.getData?.("2.5d-base-alpha") ?? 1);
    const target = covered ? Math.min(base, 0.58) : base;
    obj.alpha += (target - obj.alpha) * 0.16;
  }
}

function updateActorDepth(scene: any) {
  feetDepth(scene, scene.player, 2);
  feetDepth(scene, scene.companion, 2);
  feetDepth(scene, scene.dog, 2);
  feetDepth(scene, scene.boss, 4);

  for (const enemy of scene.enemies?.getChildren?.() ?? []) feetDepth(scene, enemy, 3);
  for (const animal of scene.animals ?? []) feetDepth(scene, animal, 1);
  for (const it of scene.interactables ?? []) {
    if (!it?.enabled || !it.obj?.active) continue;
    if (ACTOR_KINDS.has(it.kind)) feetDepth(scene, it.obj, 2);
    else if (["season-key", "relic", "vault-key", "envelope"].includes(it.kind)) feetDepth(scene, it.obj, 0);
  }
}

export function installGlobal25DPolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__global25DPolishInstalled) return;
  proto.__global25DPolishInstalled = true;

  const originalAddLandmark = proto.addLandmark;
  proto.addLandmark = function polished25DLandmark(...args: any[]) {
    const result = originalAddLandmark.apply(this, args);
    if (FIRST_PASS_ZONES.has(this.save?.current_zone)) {
      const sprite = this.landmark?.sprite;
      const shadow = addLandmarkDepthShadow(this, sprite);
      if (shadow) {
        this.__global25dLandmarkShadows ??= [];
        this.__global25dLandmarkShadows.push(shadow);
      }
    }
    return result;
  };

  const originalCreate = proto.create;
  proto.create = function polished25DCreate(...args: any[]) {
    const result = originalCreate.apply(this, args);

    // Keep the pixel-art presentation crisp while the vertically-squashed
    // camera supplies the ground-plane perspective already present in scene.ts.
    this.cameras?.main?.setRoundPixels?.(true);

    this.__global25d = {
      occluders: collectOccluders(this),
      firstPassZone: FIRST_PASS_ZONES.has(this.save?.current_zone),
    };

    // Give tall static props feet-based depth too. Their collision footprints
    // stay untouched; this is purely a render-order pass.
    for (const obj of this.solidDecor?.getChildren?.() ?? []) {
      if (!obj?.active) continue;
      feetDepth(this, obj, 0);
    }
    updateActorDepth(this);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function polished25DUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updateActorDepth(this);
    updateOcclusion(this);
    return result;
  };
}
