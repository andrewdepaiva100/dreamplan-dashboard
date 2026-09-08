// @ts-nocheck -- Presentation-only runtime decorator intentionally reads scene-private interactables.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const CHARACTER_KINDS = new Set([
  "guest", "guide", "act-guide", "andrew", "andrew-ceremony", "smith", "garden-keeper",
  "wren", "silas", "elara", "pip", "maeve", "evelyn", "bram", "pastor", "companion",
]);

const CHARACTER_WORDS = /\b(?:talk|wren|silas|elara|pip|maeve|evelyn|bram|andrew|pastor|guide|guest|keeper|smith|forgemaster)\b/i;

function isCharacter(it: any) {
  if (!it?.obj?.active || it.enabled === false) return false;
  const kind = String(it.kind ?? "").toLowerCase();
  const label = String(it.label ?? "");
  return CHARACTER_KINDS.has(kind) || CHARACTER_WORDS.test(`${kind} ${label}`);
}

function faceMaria(scene: SceneLike, obj: any) {
  if (!obj?.active || !scene.player?.active) return;
  const dx = scene.player.x - obj.x;
  // Most NPC art is front/side authored; horizontal acknowledgement is safe for all of them.
  if (Math.abs(dx) > 3 && typeof obj.setFlipX === "function") obj.setFlipX(dx < 0);
}

function acknowledge(scene: SceneLike, obj: any) {
  if (!obj?.active || obj.getData?.("npc-reaction-active")) return;
  obj.setData?.("npc-reaction-active", true);
  const y = obj.y;
  const angle = obj.angle ?? 0;
  scene.tweens.killTweensOf(obj);
  scene.tweens.add({
    targets: obj,
    y: y - 2,
    angle: angle + (scene.player.x >= obj.x ? 1.2 : -1.2),
    duration: 95,
    ease: "Sine.easeOut",
    yoyo: true,
    onComplete: () => {
      if (!obj?.active) return;
      obj.setAngle?.(angle);
      obj.setData?.("npc-reaction-active", false);
    },
  });
}

function nearestCharacter(scene: SceneLike) {
  const list = Array.isArray(scene.interactables) ? scene.interactables : [];
  let best: any = null;
  let bestD = Infinity;
  for (const it of list) {
    if (!isCharacter(it)) continue;
    const obj = it.obj;
    const d = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, obj.x, obj.y);
    const range = Math.max(86, Number(it.radius ?? 48) * 1.45);
    if (d <= range && d < bestD) {
      best = it;
      bestD = d;
    }
  }
  return best;
}

function updateReactions(scene: SceneLike) {
  if (!scene.player?.active) return;
  const current = nearestCharacter(scene);
  const previous = scene.__npcReactionTarget;

  if (current?.obj?.active) faceMaria(scene, current.obj);

  if (current !== previous) {
    scene.__npcReactionTarget = current ?? null;
    if (current?.obj?.active) acknowledge(scene, current.obj);
  }

  // While a modal/cutscene has frozen Maria, keep the conversation partner oriented toward her.
  if (scene.frozen && scene.__npcReactionTarget?.obj?.active) {
    faceMaria(scene, scene.__npcReactionTarget.obj);
  }
}

export function installGlobalCharacterReactions(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__globalCharacterReactionsInstalled) return;
  proto.__globalCharacterReactionsInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function globalCharacterReactionUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updateReactions(this);
    return result;
  };

  // Layer acknowledgement around the existing interaction dispatch without changing its outcome.
  const originalInteract = proto.interact;
  if (typeof originalInteract === "function") {
    proto.interact = function globalCharacterReactionInteract(this: SceneLike, ...args: any[]) {
      const target = nearestCharacter(this);
      if (target?.obj?.active) {
        this.__npcReactionTarget = target;
        faceMaria(this, target.obj);
        acknowledge(this, target.obj);
      }
      return originalInteract.apply(this, args);
    };
  }
}
