// @ts-nocheck -- Presentation-only romance and lamp ambience. No gameplay state is changed.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const CLOSE_DISTANCE = 62;
const STILL_SPEED = 9;
const CLOSE_HOLD_MS = 3000;
const HEART_COOLDOWN_MIN = 10000;
const HEART_COOLDOWN_MAX = 16000;

function mariaSpeed(scene: SceneLike) {
  const body = scene.player?.body as Phaser.Physics.Arcade.Body | undefined;
  if (!body) return 0;
  return Math.hypot(Number(body.velocity.x ?? 0), Number(body.velocity.y ?? 0));
}

function activeAndrew(scene: SceneLike) {
  const companion = scene.companion;
  if (!companion?.active) return null;
  const texture = String(companion.texture?.key ?? "").toLowerCase();
  return texture.includes("andrew") ? companion : null;
}

function andrewSpeed(scene: SceneLike, andrew: any, time: number) {
  const previous = scene.__romanticAndrewSample;
  scene.__romanticAndrewSample = { x: andrew.x, y: andrew.y, time };
  if (!previous || time <= previous.time) return 0;
  const elapsed = Math.max(1, time - previous.time);
  return Math.hypot(andrew.x - previous.x, andrew.y - previous.y) * (1000 / elapsed);
}

function heartAllowed(scene: SceneLike, andrew: any, time: number) {
  if (!scene.player?.active || !andrew?.active || scene.frozen || scene.__actArrivalActive) return false;
  if (mariaSpeed(scene) > STILL_SPEED) return false;
  if (andrewSpeed(scene, andrew, time) > STILL_SPEED) return false;
  return Phaser.Math.Distance.Between(scene.player.x, scene.player.y, andrew.x, andrew.y) <= CLOSE_DISTANCE;
}

function spawnHeart(scene: SceneLike, andrew: any) {
  const x = (scene.player.x + andrew.x) * 0.5;
  const y = Math.min(scene.player.y, andrew.y) - 25;
  const heart = scene.add.text(x, y, "♥", {
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontSize: "11px",
    color: "#ffabc7",
    stroke: "#fff2f7",
    strokeThickness: 1,
  })
    .setOrigin(0.5)
    .setDepth(99980)
    .setAlpha(0)
    .setScale(0.82);

  scene.tweens.add({
    targets: heart,
    y: y - 9,
    alpha: { from: 0, to: 0.88 },
    scale: { from: 0.82, to: 1 },
    duration: 420,
    ease: "Sine.easeOut",
    yoyo: true,
    hold: 260,
    onComplete: () => heart.destroy(),
  });
}

function setupLampWarmth(scene: SceneLike) {
  const glows: any[] = [];
  const lamps = (scene.solidDecor?.getChildren?.() ?? []).filter(
    (obj: any) => obj?.active && String(obj.texture?.key ?? "") === "lamp",
  );

  for (const lamp of lamps) {
    const glow = scene.add.circle(lamp.x, lamp.y - 16, 17, 0xffc76a, 1)
      .setDepth(944)
      .setAlpha(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    glow.setData("romantic-lamp-phase", Phaser.Math.FloatBetween(0, Math.PI * 2));
    glows.push(glow);
  }

  scene.__romanticLampGlows = glows;
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    for (const glow of glows) glow?.destroy?.();
  });
}

function updateLampWarmth(scene: SceneLike, time: number) {
  const glows = scene.__romanticLampGlows ?? [];
  if (!glows.length) return;

  // Mirror the existing scene dusk/night curve without changing the clock or core lights.
  const h = Number(scene.dayT ?? 0.5) * 24;
  let night = 0;
  if (scene.save?.current_zone !== "cathedral") {
    if (h > 18.5 && h < 19.5) night = Phaser.Math.Clamp(h - 18.5, 0, 1);
    else if (h > 6.5 && h < 7.5) night = Phaser.Math.Clamp(7.5 - h, 0, 1);
    else if (h < 6.5 || h >= 19.5) night = 1;
  }
  const visibility = Phaser.Math.Clamp((night - 0.18) / 0.6, 0, 1);

  for (const glow of glows) {
    if (!glow?.active) continue;
    const phase = Number(glow.getData?.("romantic-lamp-phase") ?? 0);
    const breath = 0.5 + 0.5 * Math.sin(time / 1350 + phase);
    glow.setAlpha(visibility * (0.025 + breath * 0.025));
    glow.setScale(0.96 + breath * 0.08);
    glow.setVisible(visibility > 0.02);
  }
}

function updateAndrewHeart(scene: SceneLike, time: number) {
  const andrew = activeAndrew(scene);
  if (!andrew) {
    scene.__romanticCloseSince = 0;
    scene.__romanticAndrewSample = null;
    return;
  }

  if (!heartAllowed(scene, andrew, time)) {
    scene.__romanticCloseSince = 0;
    return;
  }

  if (!scene.__romanticCloseSince) scene.__romanticCloseSince = time;
  if (time - scene.__romanticCloseSince < CLOSE_HOLD_MS) return;
  if (time < Number(scene.__romanticHeartReadyAt ?? 0)) return;

  spawnHeart(scene, andrew);
  scene.__romanticHeartReadyAt = time + Phaser.Math.Between(HEART_COOLDOWN_MIN, HEART_COOLDOWN_MAX);
  scene.__romanticCloseSince = time;
}

export function installRomanticMicroPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__romanticMicroPolishInstalled) return;
  proto.__romanticMicroPolishInstalled = true;

  const originalCreate = proto.create;
  proto.create = function romanticMicroCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.__romanticCloseSince = 0;
    this.__romanticHeartReadyAt = 0;
    this.__romanticAndrewSample = null;
    setupLampWarmth(this);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function romanticMicroUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate?.call(this, time, delta);
    updateAndrewHeart(this, time);
    updateLampWarmth(this, time);
    return result;
  };
}
