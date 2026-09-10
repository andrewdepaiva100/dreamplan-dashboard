// @ts-nocheck -- Presentation-only combat feedback; no damage, timing, or progression changes.
import * as Phaser from "phaser";
import { installBossFinisher } from "./bossFinisher";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const MARIA_CONTACT_WINDOW = 180;
const BOSS_REACTION_LOCK = 90;

function weaponColor(scene: SceneLike) {
  try {
    return Number(scene.equippedWeapon?.()?.color ?? 0xffd7e5);
  } catch {
    return 0xffd7e5;
  }
}

function impactRing(scene: SceneLike, x: number, y: number, tint: number, finishing: boolean) {
  const ring = scene.add.circle(x, y, finishing ? 18 : 13, tint, 0.06)
    .setStrokeStyle(finishing ? 4 : 3, tint, 0.9)
    .setDepth(980)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({
    targets: ring,
    radius: finishing ? 52 : 36,
    alpha: 0,
    duration: finishing ? 230 : 150,
    ease: "Quad.easeOut",
    onComplete: () => ring.destroy(),
  });
}

function directionalSparks(scene: SceneLike, x: number, y: number, tint: number, sourceX: number, sourceY: number, count: number) {
  const away = Math.atan2(y - sourceY, x - sourceX);
  for (let i = 0; i < count; i++) {
    const spread = Phaser.Math.FloatBetween(-0.72, 0.72);
    const a = away + spread;
    const d = Phaser.Math.Between(13, 31);
    const spark = scene.add.sprite(x, y, "spark")
      .setTint(i % 3 === 0 ? 0xfff4e7 : tint)
      .setDepth(981)
      .setScale(Phaser.Math.FloatBetween(0.32, 0.7))
      .setAlpha(0.95);
    scene.tweens.add({
      targets: spark,
      x: x + Math.cos(a) * d,
      y: y + Math.sin(a) * d,
      alpha: 0,
      scale: 0.12,
      duration: Phaser.Math.Between(115, 190),
      ease: "Quad.easeOut",
      onComplete: () => spark.destroy(),
    });
  }
}

function bossFlashEcho(scene: SceneLike, boss: Phaser.Physics.Arcade.Sprite, x: number, y: number, finishing: boolean) {
  const texture = boss.texture?.key;
  if (!texture) return;
  const frame = boss.frame?.name;
  const echo = scene.add.sprite(x, y, texture, frame)
    .setDepth((boss.depth ?? 20) + 0.45)
    .setFlipX(boss.flipX)
    .setAngle(boss.angle ?? 0)
    .setScale(boss.scaleX, boss.scaleY)
    .setTint(0xffffff)
    .setAlpha(finishing ? 0.88 : 0.72)
    .setBlendMode(Phaser.BlendModes.ADD);

  const playerX = scene.player?.x ?? x - 1;
  const playerY = scene.player?.y ?? y;
  const dx = x - playerX;
  const dy = y - playerY;
  const len = Math.max(1, Math.hypot(dx, dy));
  const kick = finishing ? 5 : 3;
  scene.tweens.add({
    targets: echo,
    x: x + (dx / len) * kick,
    y: y + (dy / len) * kick * 0.65,
    scaleX: echo.scaleX * (finishing ? 1.07 : 1.04),
    scaleY: echo.scaleY * (finishing ? 0.92 : 0.95),
    alpha: 0,
    duration: finishing ? 145 : 105,
    ease: "Quad.easeOut",
    onComplete: () => echo.destroy(),
  });
}

function bossImpact(scene: SceneLike, boss: Phaser.Physics.Arcade.Sprite, x: number, y: number, finishing: boolean, mariaHit: boolean) {
  const now = Number(scene.time?.now ?? 0);
  const last = Number(scene.__combatBossReactionAt ?? -Infinity);
  if (!finishing && now - last < BOSS_REACTION_LOCK) return;
  scene.__combatBossReactionAt = now;

  const tint = mariaHit ? weaponColor(scene) : 0xffd7e5;
  impactRing(scene, x, y, tint, finishing);
  directionalSparks(scene, x, y, tint, scene.player?.x ?? x - 1, scene.player?.y ?? y, finishing ? 11 : 7);
  if (boss) bossFlashEcho(scene, boss, x, y, finishing);

  // Camera feedback is deliberately reserved for Maria's confirmed melee hits.
  // This is visual only and does not pause or alter the physics simulation.
  if (mariaHit) scene.cameras?.main?.shake?.(finishing ? 85 : 48, finishing ? 0.0022 : 0.00125);
}

function swingAccent(scene: SceneLike) {
  const player = scene.player;
  if (!player?.active) return;
  const w = scene.equippedWeapon?.();
  if (!w) return;
  const dir =
    scene.lastDir === "up"
      ? -Math.PI / 2
      : scene.lastDir === "down"
        ? Math.PI / 2
        : scene.facing > 0
          ? 0
          : Math.PI;
  const x = player.x + Math.cos(dir) * w.reach * 0.72;
  const y = player.y + Math.sin(dir) * w.reach * 0.72;
  const streak = scene.add.arc(
    player.x,
    player.y,
    Math.max(18, w.reach * 0.82),
    Phaser.Math.RadToDeg(dir) - 34,
    Phaser.Math.RadToDeg(dir) + 34,
    false,
    w.color,
    0.18,
  ).setStrokeStyle(2, w.color, 0.72).setDepth(20).setBlendMode(Phaser.BlendModes.ADD);
  const glint = scene.add.sprite(x, y, "spark").setTint(w.color).setDepth(21).setScale(0.7).setAlpha(0.8);
  scene.tweens.add({ targets: streak, alpha: 0, scale: 1.06, duration: 120, ease: "Quad.easeOut", onComplete: () => streak.destroy() });
  scene.tweens.add({ targets: glint, alpha: 0, scale: 0.15, duration: 115, ease: "Quad.easeOut", onComplete: () => glint.destroy() });
}

export function installCombatImpactPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__combatImpactPolishInstalled) return;
  proto.__combatImpactPolishInstalled = true;

  const originalAttack = proto.attack;
  proto.attack = function combatImpactAttack(this: SceneLike, ...args: any[]) {
    const canSwing =
      !this.frozen &&
      this.player?.active &&
      this.save?.weapons?.includes(this.save?.equipped_weapon ?? "") &&
      Number(this.time?.now ?? 0) >= Number(this.swingAt ?? 0);
    if (canSwing) {
      this.__combatImpactMariaSwingUntil = Number(this.time?.now ?? 0) + MARIA_CONTACT_WINDOW;
      swingAccent(this);
    }
    return originalAttack.apply(this, args);
  };

  const originalDamageBoss = proto.damageBoss;
  proto.damageBoss = function combatImpactBossDamage(this: SceneLike, amount: number, ...args: any[]) {
    const boss = this.boss as Phaser.Physics.Arcade.Sprite | null;
    const hpBefore = Number(this.bossHp ?? 0);
    const x = boss?.x ?? 0;
    const y = boss?.y ?? 0;
    const result = originalDamageBoss.call(this, amount, ...args);
    const hpAfter = Number(this.bossHp ?? hpBefore);
    if (boss && hpAfter < hpBefore) {
      const mariaHit = Number(this.time?.now ?? 0) <= Number(this.__combatImpactMariaSwingUntil ?? -Infinity);
      bossImpact(this, boss, x, y, hpAfter <= 0, mariaHit);
    }
    return result;
  };

  // Install the finishing-strike controller after the normal impact decorator
  // so threshold hits retain all existing flash/recoil/spark feedback and the
  // finisher can hand the lethal blow back through the canonical boss path.
  installBossFinisher(QuestScene as any);
}
