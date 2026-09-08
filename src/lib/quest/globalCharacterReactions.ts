// @ts-nocheck -- Presentation-only runtime decorator intentionally reads scene-private interactables.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const CHARACTER_KINDS = new Set([
  "guest", "guide", "act-guide", "andrew", "andrew-ceremony", "smith", "garden-keeper",
  "wren", "silas", "elara", "pip", "maeve", "evelyn", "bram", "pastor", "companion",
]);

const CHARACTER_WORDS = /\b(?:talk|wren|silas|elara|pip|maeve|evelyn|bram|andrew|pastor|guide|guest|keeper|smith|forgemaster)\b/i;
const GREETINGS: Record<string, string[]> = {
  sunlit_shores: [
    "Maria!",
    "Good to see you.",
    "Safe travels, Maria.",
    "The shore's calm today.",
    "Watch your step by the tide.",
    "Beautiful light on the water.",
    "You look ready for adventure.",
    "The sea's been kind today.",
    "Glad you came this way.",
    "Keep your eyes on the horizon.",
  ],
  wedding_garden: [
    "Maria! The garden is glowing.",
    "There you are!",
    "What a beautiful day.",
    "The flowers are showing off today.",
    "Everything is coming together.",
    "You picked the perfect day for this.",
    "The garden feels extra bright today.",
    "Everyone's excited to see you.",
    "You should see the roses by the path.",
    "It really feels like a celebration now.",
  ],
  the_haven: [
    "Maria! Welcome.",
    "Good to see you here.",
    "The Haven feels brighter today.",
    "The square's lively again.",
    "People have been asking about you.",
    "You brought some hope with you.",
    "It's good having you around.",
    "Take a moment to enjoy the town.",
    "Things feel steadier with you here.",
    "You always seem to arrive when needed.",
  ],
  starry_ascent: [
    "Maria... look at those stars.",
    "Glad to see you.",
    "Keep going, Maria.",
    "The night feels peaceful up here.",
    "The stars are unusually bright.",
    "You've come a long way.",
    "Quiet place, isn't it?",
    "The path ahead is worth it.",
    "Feels like the whole sky is listening.",
    "Take your time up here.",
  ],
  cathedral: [
    "Maria!",
    "Everything is nearly ready.",
    "What a beautiful day for you both.",
    "You made it.",
    "The courtyard looks wonderful.",
    "Everyone's been waiting for this moment.",
    "You look radiant, Maria.",
    "The whole place feels full of joy.",
    "It's finally here.",
    "This is a day worth remembering.",
  ],
};

function isCharacter(it: any) {
  if (!it?.obj?.active || it.enabled === false) return false;
  const kind = String(it.kind ?? "").toLowerCase();
  const label = String(it.label ?? "");
  return CHARACTER_KINDS.has(kind) || CHARACTER_WORDS.test(`${kind} ${label}`);
}

function faceMaria(scene: SceneLike, obj: any) {
  if (!obj?.active || !scene.player?.active) return;
  const dx = scene.player.x - obj.x;
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

function speechY(obj: any) {
  const nameplateY = obj.y - Math.max(24, (obj.displayHeight ?? 32) * 0.62);
  return nameplateY - 18;
}

function greeting(scene: SceneLike, it: any) {
  const obj = it?.obj;
  if (!obj?.active || scene.frozen || obj.getData?.("npc-greeting-active")) return;
  const now = scene.time.now;
  const ready = Number(obj.getData?.("npc-greeting-ready") ?? 0);
  if (now < ready) return;
  obj.setData?.("npc-greeting-ready", now + Phaser.Math.Between(18000, 30000));
  obj.setData?.("npc-greeting-active", true);
  const lines = GREETINGS[String(scene.save?.current_zone ?? "")] ?? GREETINGS.sunlit_shores;
  const line = lines[Phaser.Math.Between(0, lines.length - 1)]!;
  const text = scene.add.text(obj.x, speechY(obj), line, {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "8px", fontStyle: "600", color: "#fff8df",
    backgroundColor: "rgba(8,20,40,.88)", padding: { x: 6, y: 4 },
    stroke: "#071426", strokeThickness: 1, wordWrap: { width: 138 }, align: "center",
  }).setOrigin(0.5, 1).setDepth(99989).setAlpha(0);
  scene.tweens.add({ targets: text, alpha: 0.96, y: text.y - 2, duration: 150, ease: "Sine.easeOut" });
  const follow = () => {
    if (text.active && obj?.active) text.setPosition(obj.x, speechY(obj) - 2);
  };
  scene.events.on("update", follow);
  scene.time.delayedCall(2300, () => {
    scene.events.off("update", follow);
    if (text.active) scene.tweens.add({ targets: text, alpha: 0, y: text.y - 3, duration: 170, onComplete: () => text.destroy() });
    obj.setData?.("npc-greeting-active", false);
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
    if (d <= range && d < bestD) { best = it; bestD = d; }
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
    if (current?.obj?.active) {
      acknowledge(scene, current.obj);
      // Greetings are ambient and deliberately sparse; entering dialogue still takes priority.
      if (Math.random() < 0.68) greeting(scene, current);
    }
  }
  if (scene.frozen && scene.__npcReactionTarget?.obj?.active) faceMaria(scene, scene.__npcReactionTarget.obj);
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
