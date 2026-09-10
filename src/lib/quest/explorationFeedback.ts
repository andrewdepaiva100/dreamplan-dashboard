// @ts-nocheck -- Presentation-only exploration feedback. No movement, collision, or progression state is changed.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };
type ZoneId = "sunlit_shores" | "wedding_garden" | "the_haven" | "starry_ascent" | "cathedral";

const FOOTSTEP_GAP = 135;
const WORLD_STIR_GAP = 700;

const ZONE_STYLE: Record<ZoneId, { primary: number; secondary: number; kind: "dust" | "petal" | "star" | "gold" }> = {
  sunlit_shores: { primary: 0xffe2a8, secondary: 0xfff2cf, kind: "dust" },
  wedding_garden: { primary: 0xf4a6bd, secondary: 0xffd2df, kind: "petal" },
  the_haven: { primary: 0xd9c3aa, secondary: 0xffe6c7, kind: "dust" },
  starry_ascent: { primary: 0xbfc4ff, secondary: 0xe4ddff, kind: "star" },
  cathedral: { primary: 0xffd995, secondary: 0xffefc0, kind: "gold" },
};

function worldStyle(scene: SceneLike) {
  const zone = String(scene.save?.current_zone ?? "sunlit_shores") as ZoneId;
  return ZONE_STYLE[zone] ?? ZONE_STYLE.sunlit_shores;
}

function canPresent(scene: SceneLike) {
  return !!scene.player?.active && !scene.frozen && !scene.__actArrivalActive;
}

function motion(scene: SceneLike) {
  const body = scene.player?.body as Phaser.Physics.Arcade.Body | undefined;
  if (!body) return { speed: 0, vx: 0, vy: 0 };
  const vx = Number(body.velocity.x ?? 0);
  const vy = Number(body.velocity.y ?? 0);
  return { speed: Math.hypot(vx, vy), vx, vy };
}

function trailPoint(scene: SceneLike, back = 8) {
  const { speed, vx, vy } = motion(scene);
  if (speed <= 1) return { x: scene.player.x, y: scene.player.y + 10 };
  return {
    x: scene.player.x - (vx / speed) * back,
    y: scene.player.y - (vy / speed) * back + 10,
  };
}

function spawnFootContact(scene: SceneLike) {
  const style = worldStyle(scene);
  const point = trailPoint(scene, 7);
  const dir = motion(scene);
  const sideX = dir.speed > 0 ? -dir.vy / dir.speed : 1;
  const sideY = dir.speed > 0 ? dir.vx / dir.speed : 0;

  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const x = point.x + sideX * side * Phaser.Math.Between(3, 6);
    const y = point.y + sideY * side * Phaser.Math.Between(2, 4);
    let mote: any;

    if (style.kind === "petal") {
      mote = scene.add.ellipse(x, y, 4.5, 2.2, i ? style.secondary : style.primary, 0.68)
        .setDepth(scene.dsort?.(y) ?? 12)
        .setAngle(Phaser.Math.Between(-35, 35));
    } else if (style.kind === "star" || style.kind === "gold") {
      mote = scene.add.sprite(x, y, "spark")
        .setTint(i ? style.secondary : style.primary)
        .setScale(style.kind === "star" ? 0.42 : 0.34)
        .setAlpha(0.72)
        .setDepth((scene.dsort?.(y) ?? 12) + 0.2);
    } else {
      mote = scene.add.ellipse(x, y, 3.5, 2.2, i ? style.secondary : style.primary, 0.42)
        .setDepth(scene.dsort?.(y) ?? 12);
    }

    scene.tweens.add({
      targets: mote,
      x: x + Phaser.Math.Between(-5, 5),
      y: y - Phaser.Math.Between(3, 8),
      alpha: 0,
      scaleX: (mote.scaleX || 1) * 0.7,
      scaleY: (mote.scaleY || 1) * 0.7,
      duration: Phaser.Math.Between(240, 360),
      ease: "Quad.easeOut",
      onComplete: () => mote.destroy(),
    });
  }
}

function spawnWorldStir(scene: SceneLike) {
  const style = worldStyle(scene);
  const { speed, vx, vy } = motion(scene);
  if (speed <= 5) return;

  const nx = vx / speed;
  const ny = vy / speed;
  const sideX = -ny;
  const sideY = nx;
  const side = Phaser.Math.RND.sign();
  const x = scene.player.x + sideX * side * Phaser.Math.Between(14, 26) + nx * Phaser.Math.Between(2, 10);
  const y = scene.player.y + sideY * side * Phaser.Math.Between(9, 18) + ny * Phaser.Math.Between(2, 10);

  if (style.kind === "petal") {
    const petal = scene.add.ellipse(x, y, 5, 2.4, style.primary, 0.72)
      .setDepth((scene.dsort?.(y) ?? 12) + 0.15)
      .setAngle(Phaser.Math.Between(-50, 50));
    scene.tweens.add({
      targets: petal,
      x: x - nx * Phaser.Math.Between(8, 18) + sideX * side * Phaser.Math.Between(8, 14),
      y: y - Phaser.Math.Between(14, 26),
      angle: petal.angle + Phaser.Math.Between(70, 150),
      alpha: 0,
      duration: Phaser.Math.Between(520, 760),
      ease: "Sine.easeOut",
      onComplete: () => petal.destroy(),
    });
    return;
  }

  const mote = scene.add.sprite(x, y, "spark")
    .setTint(style.primary)
    .setScale(style.kind === "star" ? 0.62 : 0.42)
    .setAlpha(style.kind === "dust" ? 0.48 : 0.66)
    .setDepth((scene.dsort?.(y) ?? 12) + 0.15);
  scene.tweens.add({
    targets: mote,
    x: x - nx * Phaser.Math.Between(6, 16) + sideX * side * Phaser.Math.Between(4, 10),
    y: y - Phaser.Math.Between(12, 24),
    alpha: 0,
    scale: 0.14,
    duration: Phaser.Math.Between(430, 680),
    ease: "Quad.easeOut",
    onComplete: () => mote.destroy(),
  });
}

function dashBurst(scene: SceneLike) {
  if (!canPresent(scene)) return;
  const style = worldStyle(scene);
  const point = trailPoint(scene, 4);
  const ring = scene.add.circle(point.x, point.y, 8, style.primary, 0.035)
    .setStrokeStyle(2, style.primary, 0.62)
    .setDepth((scene.dsort?.(point.y) ?? 12) - 0.1)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: ring,
    radius: 28,
    alpha: 0,
    duration: 180,
    ease: "Quad.easeOut",
    onComplete: () => ring.destroy(),
  });

  for (let i = 0; i < 3; i++) {
    scene.time.delayedCall(i * 45, () => {
      if (!canPresent(scene)) return;
      const p = trailPoint(scene, 12 + i * 5);
      const echo = scene.add.sprite(p.x, p.y - 2, "spark")
        .setTint(i % 2 ? style.secondary : style.primary)
        .setScale(0.65 - i * 0.08)
        .setAlpha(0.72 - i * 0.12)
        .setDepth((scene.dsort?.(p.y) ?? 12) + 0.2)
        .setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({
        targets: echo,
        alpha: 0,
        scale: 0.12,
        y: p.y - 10,
        duration: 220 + i * 40,
        ease: "Quad.easeOut",
        onComplete: () => echo.destroy(),
      });
    });
  }
}

export function installExplorationFeedback(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__explorationFeedbackInstalled) return;
  proto.__explorationFeedbackInstalled = true;

  const originalCreate = proto.create;
  proto.create = function explorationFeedbackCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.__explorationFootAt = 0;
    this.__explorationStirAt = 0;
    return result;
  };

  const originalDash = proto.dash;
  proto.dash = function explorationFeedbackDash(this: SceneLike, ...args: any[]) {
    const before = Number(this.dashUntil ?? 0);
    const result = originalDash.apply(this, args);
    const after = Number(this.dashUntil ?? 0);
    if (after > before) dashBurst(this);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function explorationFeedbackUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate?.call(this, time, delta);
    if (!canPresent(this)) return result;

    const { speed } = motion(this);
    if (speed <= 8) return result;

    if (time >= Number(this.__explorationFootAt ?? 0)) {
      spawnFootContact(this);
      const stride = Phaser.Math.Clamp(Number(this.__mariaStrideAmount ?? 0), 0, 1);
      this.__explorationFootAt = time + FOOTSTEP_GAP - stride * 28;
    }

    if (time >= Number(this.__explorationStirAt ?? 0)) {
      spawnWorldStir(this);
      this.__explorationStirAt = time + WORLD_STIR_GAP + Phaser.Math.Between(-90, 130);
    }

    return result;
  };
}
