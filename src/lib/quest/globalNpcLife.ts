// @ts-nocheck -- Presentation-only runtime decorator intentionally reads scene-private NPC interactables.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

type LifeState = {
  it: any;
  obj: any;
  homeX: number;
  homeY: number;
  nextMoveAt: number;
  movingUntil: number;
};

const NPC_KINDS = new Set([
  "guest", "guide", "act-guide", "garden-keeper", "evelyn", "bram", "smith",
  "wren", "silas", "elara", "pip", "maeve", "pastor",
]);
const CRITICAL_KINDS = new Set(["andrew", "andrew-ceremony", "companion"]);

const CHAT: Record<string, [string, string][]> = {
  sunlit_shores: [
    ["The tide sounds peaceful today.", "Like the shore is breathing."],
    ["Did you see Maria pass by?", "She's got that determined look again."],
    ["The light on the water is beautiful.", "Worth stopping for a moment."],
  ],
  wedding_garden: [
    ["The garden looks beautiful.", "Every flower feels ready for them."],
    ["Have you seen Maria?", "She's making everything come together."],
    ["What a day for a celebration.", "One we'll remember for years."],
  ],
  the_haven: [
    ["It's good to see the square lively.", "The Haven feels like itself again."],
    ["Maria has done so much.", "People here won't forget it."],
    ["Hear that music in the distance?", "Makes the whole town feel warmer."],
  ],
  starry_ascent: [
    ["The stars feel close tonight.", "Close enough to carry a wish."],
    ["It's quiet up here.", "Not empty. Just peaceful."],
    ["Maria keeps climbing.", "She always does."],
  ],
  cathedral: [
    ["Everything is almost ready.", "It's going to be beautiful."],
    ["What a journey to get here.", "And what a beginning ahead."],
    ["Have you seen Maria?", "She looks radiant."],
  ],
};

function isNpc(it: any) {
  if (!it?.obj?.active || it.enabled === false) return false;
  const kind = String(it.kind ?? "").toLowerCase();
  if (CRITICAL_KINDS.has(kind)) return false;
  return NPC_KINDS.has(kind) || /\b(?:guest|guide|evelyn|bram|wren|silas|pastor|keeper|smith)\b/i.test(`${kind} ${it.label ?? ""}`);
}

function bubble(scene: SceneLike, obj: any, line: string, duration = 2500) {
  if (!obj?.active || obj.getData?.("npc-life-bubble")) return;
  obj.setData?.("npc-life-bubble", true);
  const text = scene.add.text(obj.x, obj.y - Math.max(34, (obj.displayHeight ?? 30) * 0.72), line, {
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "8px",
    fontStyle: "600",
    color: "#fff8df",
    backgroundColor: "rgba(8,20,40,.88)",
    padding: { x: 6, y: 4 },
    stroke: "#071426",
    strokeThickness: 1,
    wordWrap: { width: 132 },
    align: "center",
  }).setOrigin(0.5, 1).setDepth(99988).setAlpha(0);
  scene.tweens.add({ targets: text, alpha: 0.96, y: text.y - 2, duration: 160, ease: "Sine.easeOut" });
  const follow = () => {
    if (!text.active || !obj?.active) return;
    text.setPosition(obj.x, obj.y - Math.max(34, (obj.displayHeight ?? 30) * 0.72) - 2);
  };
  scene.events.on("update", follow);
  scene.time.delayedCall(duration, () => {
    scene.events.off("update", follow);
    if (!text.active) return;
    scene.tweens.add({ targets: text, alpha: 0, y: text.y - 3, duration: 180, onComplete: () => text.destroy() });
    obj.setData?.("npc-life-bubble", false);
  });
}

function face(a: any, b: any) {
  if (!a?.active || !b?.active || typeof a.setFlipX !== "function") return;
  const dx = b.x - a.x;
  if (Math.abs(dx) > 3) a.setFlipX(dx < 0);
}

function safeToAnimate(scene: SceneLike, state: LifeState) {
  if (scene.frozen || !scene.player?.active || !state.obj?.active || state.it.enabled === false) return false;
  if (state.obj.getData?.("npc-reaction-active") || state.obj.getData?.("npc-life-bubble")) return false;
  const d = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, state.obj.x, state.obj.y);
  return d > Math.max(105, Number(state.it.radius ?? 48) * 1.8);
}

function initialize(scene: SceneLike, time: number) {
  const list = Array.isArray(scene.interactables) ? scene.interactables : [];
  const states: LifeState[] = [];
  for (const it of list) {
    if (!isNpc(it)) continue;
    const obj = it.obj;
    // Progression-sensitive authored actors can opt out, and ceremony/companion actors are excluded above.
    if (obj.getData?.("npc-life-locked") || it.data?.npcLifeLocked) continue;
    states.push({
      it, obj, homeX: obj.x, homeY: obj.y,
      nextMoveAt: time + Phaser.Math.Between(2200, 7200), movingUntil: 0,
    });
  }
  scene.__globalNpcLifeStates = states;
  scene.__globalNpcLifeNextChat = time + Phaser.Math.Between(6500, 11500);
}

function updateLife(scene: SceneLike, time: number) {
  if (!scene.__globalNpcLifeStates) initialize(scene, time);
  const states: LifeState[] = scene.__globalNpcLifeStates ?? [];
  if (!states.length || scene.frozen) return;

  // At most two NPCs are allowed to be in an ambient movement at once.
  let moving = states.filter((s) => s.obj?.active && time < s.movingUntil).length;
  for (const state of states) {
    if (moving >= 2 || time < state.nextMoveAt || !safeToAnimate(scene, state)) continue;
    const obj = state.obj;
    const distanceFromHome = Phaser.Math.Distance.Between(obj.x, obj.y, state.homeX, state.homeY);
    const returning = distanceFromHome > 20 || Math.random() < 0.38;
    const tx = returning ? state.homeX : state.homeX + Phaser.Math.Between(-18, 18);
    const ty = returning ? state.homeY : state.homeY + Phaser.Math.Between(-12, 12);
    const distance = Phaser.Math.Distance.Between(obj.x, obj.y, tx, ty);
    state.nextMoveAt = time + Phaser.Math.Between(6500, 13000);
    if (distance < 5) continue;
    face(obj, { x: tx, y: ty, active: true });
    const duration = Phaser.Math.Clamp(distance * 45, 650, 1500);
    state.movingUntil = time + duration;
    moving++;
    scene.tweens.add({
      targets: obj, x: tx, y: ty, duration, ease: "Sine.easeInOut",
      onUpdate: () => obj.setDepth?.(scene.dsort?.(obj.y) ?? obj.depth),
      onComplete: () => { state.movingUntil = 0; },
    });
  }

  if (time < (scene.__globalNpcLifeNextChat ?? 0)) return;
  scene.__globalNpcLifeNextChat = time + Phaser.Math.Between(9000, 17000);
  const idle = states.filter((s) => safeToAnimate(scene, s) && time >= s.movingUntil);
  let pair: [LifeState, LifeState] | null = null;
  for (let i = 0; i < idle.length && !pair; i++) {
    for (let j = i + 1; j < idle.length; j++) {
      const a = idle[i]!, b = idle[j]!;
      const d = Phaser.Math.Distance.Between(a.obj.x, a.obj.y, b.obj.x, b.obj.y);
      if (d >= 28 && d <= 145) { pair = [a, b]; break; }
    }
  }
  if (!pair) return;
  const [a, b] = pair;
  face(a.obj, b.obj); face(b.obj, a.obj);
  const lines = CHAT[String(scene.save?.current_zone ?? "")] ?? CHAT.sunlit_shores;
  const exchange = lines[Phaser.Math.Between(0, lines.length - 1)]!;
  bubble(scene, a.obj, exchange[0], 2500);
  scene.time.delayedCall(1250, () => {
    if (!scene.frozen && a.obj?.active && b.obj?.active) bubble(scene, b.obj, exchange[1], 2600);
  });
}

export function installGlobalNpcLife(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__globalNpcLifeInstalled) return;
  proto.__globalNpcLifeInstalled = true;
  const originalUpdate = proto.update;
  proto.update = function globalNpcLifeUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updateLife(this, time);
    return result;
  };
}
