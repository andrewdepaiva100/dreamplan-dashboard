// @ts-nocheck -- Presentation-only runtime decorator for regular enemies.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

function hitReaction(scene: SceneLike, enemy: Phaser.Physics.Arcade.Sprite) {
  if (!enemy?.active) return;
  const now = scene.time.now;
  if (now < Number(enemy.getData("reactionLockUntil") ?? 0)) return;
  enemy.setData("reactionLockUntil", now + 105);

  const baseX = enemy.x;
  const baseY = enemy.y;
  const dx = enemy.x - (scene.player?.x ?? enemy.x - 1);
  const dy = enemy.y - (scene.player?.y ?? enemy.y);
  const len = Math.max(1, Math.hypot(dx, dy));
  const kickX = (dx / len) * 4;
  const kickY = (dy / len) * 3;

  enemy.setTint(0xffd7df);
  scene.tweens.add({
    targets: enemy,
    x: baseX + kickX,
    y: baseY + kickY,
    duration: 55,
    yoyo: true,
    ease: "Quad.easeOut",
    onComplete: () => {
      if (!enemy.active) return;
      enemy.setPosition(baseX, baseY);
      enemy.clearTint();
    },
  });
  scene.spawnSparkle?.(enemy.x, enemy.y, 0xffc8d6, 4);
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
