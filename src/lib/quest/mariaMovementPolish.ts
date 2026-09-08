// @ts-nocheck -- Runtime Phaser decorators intentionally access scene-private fields.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

type Dir = "down" | "up" | "side";

const WORLD_BASE_SCALE = 1.1;
const HOUSE_BASE_SCALE = 1.08;

function tuneAnimations(scene: SceneLike) {
  // Reuse the existing Maria frames everywhere; this pass changes cadence,
  // transition behavior and body motion rather than introducing Act-specific art.
  for (const dir of ["down", "side", "up"] as Dir[]) {
    const walk = scene.anims?.get?.(`maria-walk-${dir}`);
    if (walk) {
      walk.frameRate = 9;
      walk.repeat = -1;
    }
    const idle = scene.anims?.get?.(`maria-idle-${dir}`);
    if (idle) idle.frameRate = 4;
  }
}

function chooseDirection(scene: SceneLike, vx: number, vy: number): Dir {
  const ax = Math.abs(vx);
  const ay = Math.abs(vy);
  const previous = (scene.__mariaMotionDir ?? scene.lastDir ?? "down") as Dir;

  // Direction hysteresis prevents diagonal input from rapidly snapping between
  // side/up/down while Maria is moving near a 45-degree angle.
  if (previous === "side" && ax >= ay * 0.82) return "side";
  if (previous !== "side" && ay >= ax * 0.82) return vy < 0 ? "up" : "down";
  return ax > ay ? "side" : vy < 0 ? "up" : "down";
}

function applyMovementPresentation(scene: SceneLike, time: number, house = false) {
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  const body = player?.body as Phaser.Physics.Arcade.Body | undefined;
  if (!player?.active || !body) return;

  const vx = body.velocity.x;
  const vy = body.velocity.y;
  const speed = Math.hypot(vx, vy);
  const moving = speed > 5 && !scene.frozen;
  const previousMoving = Boolean(scene.__mariaWasMoving);

  if (moving) {
    const dir = chooseDirection(scene, vx, vy);
    scene.__mariaMotionDir = dir;
    scene.lastDir = dir;

    if (dir === "side") {
      if (vx > 4) scene.facing = 1;
      else if (vx < -4) scene.facing = -1;
    }
    player.setFlipX(dir === "side" && scene.facing < 0);

    const key = `maria-walk-${dir}`;
    if (player.anims.currentAnim?.key !== key) {
      // Keep the current walk phase when changing direction so feet do not
      // visually reset to the first frame on every turn.
      const progress = player.anims.getProgress?.() ?? 0;
      player.anims.play(key, true);
      if (progress > 0 && progress < 1) player.anims.setProgress?.(progress);
    }

    // Match cadence to actual ground speed. Dashes are deliberately capped;
    // this is a walk polish pass, not a dash redesign.
    const anim = player.anims.currentAnim;
    if (anim) anim.frameRate = Phaser.Math.Clamp(7.5 + speed / 42, 8, 11.5);
  } else {
    const dir = (scene.__mariaMotionDir ?? scene.lastDir ?? "down") as Dir;
    const key = `maria-idle-${dir}`;
    if (player.anims.currentAnim?.key !== key) player.anims.play(key, true);
  }

  // A restrained stride gives the existing art weight without turning Maria
  // into a bouncing sprite. The easing also softens the final stop frame.
  const targetStride = moving ? Phaser.Math.Clamp(speed / 145, 0, 1) : 0;
  const previousStride = Number(scene.__mariaStrideAmount ?? 0);
  const stride = Phaser.Math.Linear(previousStride, targetStride, moving ? 0.22 : 0.15);
  scene.__mariaStrideAmount = stride;

  if (moving) {
    if (!previousMoving) scene.__mariaStrideStartedAt = time;
    const phase = ((time - Number(scene.__mariaStrideStartedAt ?? time)) / 1000) * (8.4 + stride * 2.2);
    const foot = Math.sin(phase);
    const lift = Math.abs(Math.sin(phase));
    const base = house ? HOUSE_BASE_SCALE : WORLD_BASE_SCALE;
    const visualBoost = house ? 1 : Number(player.getData?.("visualRemasterScale") ?? 1.145);
    const scale = base * visualBoost;

    player.setScale(
      scale * (1 + Math.abs(foot) * 0.008 * stride),
      scale * (1 - lift * 0.013 * stride),
    );
    player.setAngle(foot * (scene.__mariaMotionDir === "side" ? 0.8 : 0.45) * stride);

    // Slight forward lean follows travel direction while remaining subtle.
    if (scene.__mariaMotionDir === "side") {
      player.x += Math.sign(vx || 1) * 0.08 * stride;
    }
  } else {
    const base = house ? HOUSE_BASE_SCALE : WORLD_BASE_SCALE;
    const visualBoost = house ? 1 : Number(player.getData?.("visualRemasterScale") ?? 1.145);
    const scale = base * visualBoost;
    player.setScale(scale);
    player.setAngle(Phaser.Math.Linear(player.angle, 0, 0.28));
  }

  scene.__mariaWasMoving = moving;

  // Grounding: contact shadow becomes a touch narrower during the lifted part
  // of a step, but never detaches from Maria's feet.
  if (house) {
    const shadow = (scene.children?.list ?? []).find((o: any) => o?.name === "shadow");
    if (shadow?.active) {
      const stride = Number(scene.__mariaStrideAmount ?? 0);
      shadow.setPosition(player.x, player.y + 18);
      shadow.setScale(1 - stride * 0.05, 1 - stride * 0.02);
      shadow.setAlpha(0.28 - stride * 0.035);
    }
  } else {
    for (const pair of (scene.shadows ?? []) as any[]) {
      if (pair?.t !== player || !pair?.s?.active) continue;
      const stride = Number(scene.__mariaStrideAmount ?? 0);
      pair.s.setScale(1 - stride * 0.05, 1 - stride * 0.02);
      pair.s.setAlpha(player.alpha * (0.9 - stride * 0.06));
      break;
    }
  }
}

function installOnScene(Scene: SceneCtor, house: boolean) {
  const proto = Scene?.prototype;
  if (!proto || proto.__mariaMovementPolishInstalled) return;
  proto.__mariaMovementPolishInstalled = true;

  const originalCreate = proto.create;
  proto.create = function mariaMovementCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    tuneAnimations(this);
    this.__mariaMotionDir = this.lastDir ?? "down";
    this.__mariaStrideAmount = 0;
    this.__mariaWasMoving = false;
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function mariaMovementUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate?.call(this, time, delta);
    applyMovementPresentation(this, time, house);
    return result;
  };
}

/** Shared movement presentation for Maria in every realm and inside her home. */
export function installMariaMovementPolish(QuestScene: SceneCtor, QuestHouseScene: SceneCtor) {
  installOnScene(QuestScene, false);
  installOnScene(QuestHouseScene, true);
}
