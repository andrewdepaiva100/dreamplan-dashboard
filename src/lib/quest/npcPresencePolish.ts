// @ts-nocheck -- Presentation-only NPC idle presence; gameplay/progression state is untouched.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

type PresenceState = {
  it: any;
  obj: any;
  baseX: number;
  baseY: number;
  baseAngle: number;
  nextIdleAt: number;
  nextGlanceAt: number;
  lastNear: boolean;
};

const NPC_KINDS = new Set([
  "guest", "guide", "act-guide", "garden-keeper", "evelyn", "bram", "smith",
  "wren", "silas", "elara", "pip", "maeve", "pastor",
]);
const EXCLUDED_KINDS = new Set(["andrew", "andrew-ceremony", "companion"]);
const NPC_WORDS = /\b(?:guest|guide|evelyn|bram|wren|silas|pastor|keeper|smith|forgemaster|elara|pip|maeve)\b/i;
const NEAR_DISTANCE = 112;

function eligible(it: any) {
  if (!it?.obj?.active || it.enabled === false) return false;
  const kind = String(it.kind ?? "").toLowerCase();
  if (EXCLUDED_KINDS.has(kind)) return false;
  if (it.obj.getData?.("npc-life-locked") || it.data?.npcLifeLocked) return false;
  return NPC_KINDS.has(kind) || NPC_WORDS.test(`${kind} ${String(it.label ?? "")}`);
}

function initialize(scene: SceneLike, time: number) {
  const states: PresenceState[] = [];
  for (const it of Array.isArray(scene.interactables) ? scene.interactables : []) {
    if (!eligible(it)) continue;
    const obj = it.obj;
    states.push({
      it,
      obj,
      baseX: obj.x,
      baseY: obj.y,
      baseAngle: Number(obj.angle ?? 0),
      nextIdleAt: time + Phaser.Math.Between(3000, 8500),
      nextGlanceAt: time + Phaser.Math.Between(6500, 12000),
      lastNear: false,
    });
  }
  scene.__npcPresenceStates = states;
}

function blocked(scene: SceneLike, state: PresenceState) {
  const obj = state.obj;
  if (!scene.player?.active || !obj?.active || state.it.enabled === false) return true;
  if (scene.frozen || scene.__actArrivalActive) return true;
  if (obj.getData?.("npc-reaction-active") || obj.getData?.("npc-life-bubble") || obj.getData?.("npc-greeting-active")) return true;
  if (obj.getData?.("npc-presence-active")) return true;
  const life = (scene.__globalNpcLifeStates ?? []).find((s: any) => s?.obj === obj);
  if (life && scene.time.now < Number(life.movingUntil ?? 0)) return true;
  return false;
}

function faceMaria(scene: SceneLike, obj: any) {
  const dx = scene.player.x - obj.x;
  if (Math.abs(dx) > 4 && typeof obj.setFlipX === "function") obj.setFlipX(dx < 0);
}

function idleShift(scene: SceneLike, state: PresenceState) {
  const obj = state.obj;
  if (!obj?.active) return;
  obj.setData?.("npc-presence-active", true);
  const startX = obj.x;
  const startY = obj.y;
  const startAngle = Number(obj.angle ?? state.baseAngle);
  const direction = Math.random() < 0.5 ? -1 : 1;
  scene.tweens.add({
    targets: obj,
    x: startX + direction * Phaser.Math.Between(1, 2),
    y: startY - 1,
    angle: startAngle + direction * 0.8,
    duration: 260,
    ease: "Sine.easeInOut",
    yoyo: true,
    hold: 180,
    onComplete: () => {
      if (!obj?.active) return;
      obj.setPosition(startX, startY);
      obj.setAngle?.(startAngle);
      obj.setData?.("npc-presence-active", false);
    },
  });
}

function glance(scene: SceneLike, state: PresenceState) {
  const obj = state.obj;
  if (!obj?.active || typeof obj.setFlipX !== "function") return;
  obj.setData?.("npc-presence-active", true);
  faceMaria(scene, obj);
  const towardMaria = Boolean(obj.flipX);
  scene.time.delayedCall(220, () => {
    if (!obj?.active || scene.frozen) {
      obj?.setData?.("npc-presence-active", false);
      return;
    }
    obj.setFlipX(!towardMaria);
    scene.time.delayedCall(520, () => {
      if (!obj?.active) return;
      if (!scene.frozen && scene.player?.active) faceMaria(scene, obj);
      obj.setData?.("npc-presence-active", false);
    });
  });
}

function updatePresence(scene: SceneLike, time: number) {
  if (!scene.__npcPresenceStates) initialize(scene, time);
  for (const state of scene.__npcPresenceStates ?? []) {
    const obj = state.obj;
    if (!obj?.active || state.it.enabled === false) continue;
    const distance = scene.player?.active
      ? Phaser.Math.Distance.Between(scene.player.x, scene.player.y, obj.x, obj.y)
      : Infinity;
    const near = distance <= Math.max(NEAR_DISTANCE, Number(state.it.radius ?? 48) * 1.65);

    if (near && !blocked(scene, state)) faceMaria(scene, obj);

    if (near && !state.lastNear) {
      state.nextGlanceAt = time + Phaser.Math.Between(4500, 8500);
    }
    state.lastNear = near;

    if (blocked(scene, state)) continue;

    if (near) {
      if (time >= state.nextGlanceAt) {
        state.nextGlanceAt = time + Phaser.Math.Between(9000, 16000);
        glance(scene, state);
      }
      continue;
    }

    if (time >= state.nextIdleAt) {
      state.nextIdleAt = time + Phaser.Math.Between(7000, 14000);
      idleShift(scene, state);
    }
  }
}

export function installNpcPresencePolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__npcPresencePolishInstalled) return;
  proto.__npcPresencePolishInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function npcPresenceUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updatePresence(this, time);
    return result;
  };
}
