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
const PICKUP_KINDS = new Set(["season-key", "relic", "vault-key", "envelope"]);

function feetDepth(scene: any, obj: any, extra = 0) {
  if (!obj?.active || typeof obj.y !== "number") return;
  const footY = obj.y + Math.max(0, (obj.displayHeight ?? 0) * 0.28) + extra;
  obj.setDepth?.(scene.dsort?.(footY) ?? (12 + footY * 0.01));
}

function makeSpriteSilhouette(scene: any, source: any, xOffset: number, yOffset: number, alpha: number, depthOffset: number) {
  if (!source?.active) return null;
  const textureKey = source.texture?.key;
  if (!textureKey || !scene.textures?.exists?.(textureKey)) return null;
  const shadow = scene.add
    .sprite(source.x + xOffset, source.y + yOffset, textureKey)
    .setOrigin(source.originX ?? 0.5, source.originY ?? 0.5)
    .setScale(source.scaleX ?? 1)
    .setTint(0x171a2a)
    .setAlpha(alpha)
    .setDepth(Math.max(2, (source.depth ?? 8) + depthOffset));
  shadow.setData("2.5d-depth-shadow", true);
  return shadow;
}

function addLandmarkDepth(scene: any, sprite: any) {
  if (!sprite?.active || !FIRST_PASS_ZONES.has(scene.save?.current_zone)) return [];
  // Stack silhouettes made from the authored landmark itself. The staggered
  // copies read as wall/roof thickness under the tilted camera without adding
  // replacement geometry or changing collision.
  return [
    makeSpriteSilhouette(scene, sprite, 2, 4, 0.22, -0.19),
    makeSpriteSilhouette(scene, sprite, 4, 8, 0.16, -0.18),
    makeSpriteSilhouette(scene, sprite, 7, 12, 0.10, -0.17),
  ].filter(Boolean);
}

function addTallPropDepth(scene: any, obj: any) {
  if (!FIRST_PASS_ZONES.has(scene.save?.current_zone) || !obj?.active) return null;
  if ((obj.displayHeight ?? 0) < 34 || (obj.displayWidth ?? 0) < 18) return null;
  if (NON_OCCLUDERS.has(String(obj.texture?.key ?? ""))) return null;
  return makeSpriteSilhouette(scene, obj, 3, 6, 0.13, -0.12);
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
    const covered = dx < width && dy > -height * 0.42 && dy < height * 0.68;
    const base = Number(obj.getData?.("2.5d-base-alpha") ?? 1);
    const target = covered ? Math.min(base, 0.54) : base;
    obj.alpha += (target - obj.alpha) * 0.16;
  }
}

function actorList(scene: any) {
  const actors: any[] = [scene.player, scene.companion, scene.dog, scene.boss];
  actors.push(...(scene.enemies?.getChildren?.() ?? []));
  actors.push(...(scene.animals ?? []));
  for (const it of scene.interactables ?? []) {
    if (it?.enabled && it.obj?.active && ACTOR_KINDS.has(it.kind)) actors.push(it.obj);
  }
  return actors.filter((obj, i, all) => obj?.active && all.indexOf(obj) === i);
}

function ensureActorContactShadow(scene: any, actor: any) {
  if (!actor?.active || !FIRST_PASS_ZONES.has(scene.save?.current_zone)) return;
  scene.__global25d.actorShadows ??= new Map();
  if (scene.__global25d.actorShadows.has(actor)) return;
  const key = actor.texture?.key;
  if (!key || !scene.textures?.exists?.(key)) return;

  // A compressed copy of the actual sprite creates a pixel-consistent contact
  // shadow. It is deliberately subtle and avoids smooth procedural ellipses.
  const shadow = scene.add
    .sprite(actor.x + 3, actor.y + Math.max(4, (actor.displayHeight ?? 20) * 0.3), key)
    .setOrigin(actor.originX ?? 0.5, actor.originY ?? 0.5)
    .setScale((actor.scaleX ?? 1) * 0.82, (actor.scaleY ?? 1) * 0.24)
    .setTint(0x171a24)
    .setAlpha(actor === scene.player ? 0.24 : 0.18);
  shadow.setData("2.5d-contact-shadow", true);
  scene.__global25d.actorShadows.set(actor, shadow);
}

function updateContactShadows(scene: any) {
  if (!scene.__global25d?.firstPassZone) return;
  for (const actor of actorList(scene)) ensureActorContactShadow(scene, actor);
  for (const [actor, shadow] of scene.__global25d.actorShadows ?? []) {
    if (!actor?.active || !shadow?.active) {
      shadow?.destroy?.();
      scene.__global25d.actorShadows.delete(actor);
      continue;
    }
    shadow.setPosition(actor.x + 3, actor.y + Math.max(4, (actor.displayHeight ?? 20) * 0.3));
    shadow.setScale((actor.scaleX ?? 1) * 0.82, (actor.scaleY ?? 1) * 0.24);
    shadow.setDepth(Math.max(2, (actor.depth ?? 10) - 0.08));
    shadow.setVisible(actor.visible !== false);
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
    else if (PICKUP_KINDS.has(it.kind)) feetDepth(scene, it.obj, 0);
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
      const shadows = addLandmarkDepth(this, this.landmark?.sprite);
      if (shadows.length) {
        this.__global25dLandmarkShadows ??= [];
        this.__global25dLandmarkShadows.push(...shadows);
      }
    }
    return result;
  };

  const originalCreate = proto.create;
  proto.create = function polished25DCreate(...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.cameras?.main?.setRoundPixels?.(true);

    this.__global25d = {
      occluders: collectOccluders(this),
      firstPassZone: FIRST_PASS_ZONES.has(this.save?.current_zone),
      actorShadows: new Map(),
      propShadows: [],
    };

    for (const obj of this.solidDecor?.getChildren?.() ?? []) {
      if (!obj?.active) continue;
      feetDepth(this, obj, 0);
      const shadow = addTallPropDepth(this, obj);
      if (shadow) this.__global25d.propShadows.push(shadow);
    }
    updateActorDepth(this);
    updateContactShadows(this);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function polished25DUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updateActorDepth(this);
    updateContactShadows(this);
    updateOcclusion(this);
    return result;
  };
}
