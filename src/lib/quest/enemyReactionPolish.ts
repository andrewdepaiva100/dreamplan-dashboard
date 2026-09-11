// @ts-nocheck -- Presentation-only runtime decorator for regular enemies.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

function contactRing(scene: SceneLike, enemy: Phaser.Physics.Arcade.Sprite, tint: number) {
  const ring = scene.add.circle(enemy.x, enemy.y, 9, tint, 0.05)
    .setStrokeStyle(2, tint, 0.9)
    .setDepth((enemy.depth ?? 15) + 0.5)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: ring,
    radius: 25,
    alpha: 0,
    duration: 125,
    ease: "Quad.easeOut",
    onComplete: () => ring.destroy(),
  });
}

function contactSparks(scene: SceneLike, enemy: Phaser.Physics.Arcade.Sprite, tint: number, count: number) {
  const sourceX = scene.player?.x ?? enemy.x - 1;
  const sourceY = scene.player?.y ?? enemy.y;
  const away = Math.atan2(enemy.y - sourceY, enemy.x - sourceX);
  for (let i = 0; i < count; i++) {
    const a = away + Phaser.Math.FloatBetween(-0.8, 0.8);
    const d = Phaser.Math.Between(9, 22);
    const spark = scene.add.sprite(enemy.x, enemy.y, "spark")
      .setDepth((enemy.depth ?? 15) + 0.6)
      .setTint(i % 3 === 0 ? 0xffffff : tint)
      .setAlpha(0.9)
      .setScale(Phaser.Math.FloatBetween(0.28, 0.56));
    scene.tweens.add({
      targets: spark,
      x: enemy.x + Math.cos(a) * d,
      y: enemy.y + Math.sin(a) * d,
      alpha: 0,
      scale: 0.12,
      duration: Phaser.Math.Between(100, 165),
      ease: "Quad.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}

function hitReaction(scene: SceneLike, enemy: Phaser.Physics.Arcade.Sprite) {
  if (!enemy?.active) return;
  const now = scene.time.now;
  if (now < Number(enemy.getData("reactionLockUntil") ?? 0)) return;
  enemy.setData("reactionLockUntil", now + 105);

  const baseX = enemy.x;
  const baseY = enemy.y;
  const baseScaleX = enemy.scaleX;
  const baseScaleY = enemy.scaleY;
  const isSummerGuardian =
    enemy.getData?.("summerGuardian") === true ||
    enemy.getData?.("seasonMiniGame") === "Summer";
  const dx = enemy.x - (scene.player?.x ?? enemy.x - 1);
  const dy = enemy.y - (scene.player?.y ?? enemy.y);
  const len = Math.max(1, Math.hypot(dx, dy));
  const kickX = (dx / len) * 5;
  const kickY = (dy / len) * 3.5;
  const meleeContact = Number(scene.__combatImpactMariaSwingUntil ?? -Infinity) >= now;
  const tint = meleeContact ? Number(scene.equippedWeapon?.()?.color ?? 0xffc8d6) : 0xffc8d6;

  enemy.setTint(0xfff2f5);
  contactRing(scene, enemy, tint);
  contactSparks(scene, enemy, tint, meleeContact ? 6 : 4);

  const tweenConfig: Record<string, any> = {
    targets: enemy,
    x: baseX + kickX,
    y: baseY + kickY,
    duration: 52,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete: () => {
      if (!enemy.active) return;
      enemy.setPosition(baseX, baseY);
      if (!isSummerGuardian) enemy.setScale(baseScaleX, baseScaleY);
      enemy.clearTint();
    },
  };

  // Summer guardians must keep their exact authored scale while taking hits.
  // Other enemies retain the squash/stretch impact feedback.
  if (!isSummerGuardian) {
    tweenConfig.scaleX = baseScaleX * 1.045;
    tweenConfig.scaleY = baseScaleY * 0.94;
  }

  scene.tweens.add(tweenConfig);
  scene.spawnSparkle?.(enemy.x, enemy.y, tint, meleeContact ? 5 : 3);
}

function deathPresentation(scene: SceneLike, enemy: Phaser.Physics.Arcade.Sprite) {
  if (!enemy?.active || enemy.getData("deathReactionPlayed")) return;
  enemy.setData("deathReactionPlayed", true);
  const x = enemy.x;
  const y = enemy.y;
  const texture = enemy.texture?.key;
  if (!texture) return;

  // The gameplay enemy still dies immediately through the existing transform
  // routine. This temporary echo supplies a readable collapse without delaying
  // collision removal, drops, progression, or pooled-enemy cleanup.
  const echo = scene.add.sprite(x, y, texture)
    .setDepth((enemy.depth ?? 15) + 0.2)
    .setFlipX(enemy.flipX)
    .setAngle(enemy.angle ?? 0)
    .setScale(enemy.scaleX, enemy.scaleY)
    .setAlpha(0.9)
    .setTint(0xffd9e3);

  scene.tweens.add({
    targets: echo,
    y: y + 7,
    angle: echo.angle + (scene.player?.x <= x ? 7 : -7),
    scaleX: echo.scaleX * 0.88,
    scaleY: echo.scaleY * 0.48,
    alpha: 0,
    duration: 230,
    ease: "Cubic.easeIn",
    onComplete: () => echo.destroy(),
  });

  for (let i = 0; i < 7; i++) {
    const mote = scene.add.sprite(x + Phaser.Math.Between(-7, 7), y + Phaser.Math.Between(-5, 7), "spark")
      .setDepth((enemy.depth ?? 15) + 0.3)
      .setTint(i % 2 ? 0xffd7e5 : 0xf1c6ff)
      .setScale(Phaser.Math.FloatBetween(0.35, 0.7));
    scene.tweens.add({
      targets: mote,
      x: mote.x + Phaser.Math.Between(-18, 18),
      y: mote.y - Phaser.Math.Between(12, 32),
      alpha: 0,
      scale: 0.15,
      duration: Phaser.Math.Between(260, 430),
      ease: "Quad.easeOut",
      onComplete: () => mote.destroy(),
    });
  }
}

export function installEnemyReactionPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__enemyReactionPolishInstalled) return;
  proto.__enemyReactionPolishInstalled = true;

  const originalTransform = proto.transformEnemy;
  proto.transformEnemy = function polishedEnemyTransform(this: SceneLike, enemy: Phaser.Physics.Arcade.Sprite, ...args: any[]) {
    if (!enemy?.active) return originalTransform.call(this, enemy, ...args);

    // transformEnemy is only the regular-enemy path. Bosses use damageBoss and
    // are deliberately untouched. Multi-hit brutes remain alive until hp reaches 0.
    const brute = enemy.getData?.("brute") === true;
    const hpBefore = Number(enemy.getData?.("hp") ?? 1);
    hitReaction(this, enemy);

    if (!brute || hpBefore <= 1) deathPresentation(this, enemy);
    return originalTransform.call(this, enemy, ...args);
  };
}
