// @ts-nocheck -- Presentation/combat tuning layered around canonical progression.
import * as Phaser from "phaser";
import { installBossFinisher } from "./bossFinisher";
import { installBossFinisherRecovery } from "./bossFinisherRecovery";
import { installInteractionCopyFixes } from "./interactionCopyFixes";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const MARIA_CONTACT_WINDOW = 180;
const BOSS_REACTION_LOCK = 90;
const ACT4_ZONE = "starry_ascent";
const WEARINESS_NAME = "The Weight of Weariness";

function weaponColor(scene: SceneLike) {
  try { return Number(scene.equippedWeapon?.()?.color ?? 0xffd7e5); } catch { return 0xffd7e5; }
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
    const a = away + Phaser.Math.FloatBetween(-0.72, 0.72);
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
  if (!boss?.active || !boss.scene) return;
  const texture = boss.texture?.key;
  if (!texture) return;
  const echo = scene.add.sprite(x, y, texture, boss.frame?.name)
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

function isWeariness(scene: SceneLike, bossName = String(scene.bossName ?? "")) {
  return scene.save?.current_zone === ACT4_ZONE && bossName === WEARINESS_NAME;
}

function isAct4ShardGuardian(scene: SceneLike, bossName: string) {
  return scene.save?.current_zone === ACT4_ZONE && /shard guardian/i.test(bossName);
}

function bossImpact(scene: SceneLike, boss: Phaser.Physics.Arcade.Sprite | null, x: number, y: number, finishing: boolean, mariaHit: boolean) {
  const now = Number(scene.time?.now ?? 0);
  const last = Number(scene.__combatBossReactionAt ?? -Infinity);
  if (!finishing && now - last < BOSS_REACTION_LOCK) return;
  scene.__combatBossReactionAt = now;
  const tint = mariaHit ? weaponColor(scene) : 0xffd7e5;
  const bossName = String(scene.bossName ?? "");
  if (!isWeariness(scene, bossName) && !isAct4ShardGuardian(scene, bossName)) {
    impactRing(scene, x, y, tint, finishing);
  }
  directionalSparks(scene, x, y, tint, scene.player?.x ?? x - 1, scene.player?.y ?? y, finishing ? 11 : 7);
  if (boss?.active && boss.scene) bossFlashEcho(scene, boss, x, y, finishing);
  if (mariaHit) scene.cameras?.main?.shake?.(finishing ? 85 : 48, finishing ? 0.0022 : 0.00125);
}

function shardTint(name: string) {
  if (/sapphire/i.test(name)) return 0x5aa7ff;
  if (/amber/i.test(name)) return 0xffbd4a;
  if (/rose/i.test(name)) return 0xff6da8;
  if (/violet/i.test(name)) return 0xa77cff;
  return 0xffe79a;
}

function removeGuardianImpulse(scene: SceneLike) {
  // Remove the boss halo object itself. Hiding it was not enough because the
  // base spawner still owned its tween; destroying it means there is no ring
  // left for any later callback to reveal or pulse.
  const halo = scene.bossHalo;
  if (halo) {
    try {
      scene.tweens?.killTweensOf?.(halo);
      halo.destroy?.();
    } catch {}
    scene.bossHalo = null;
  }

  // Pillar guardians have no ranged/impulse attack. The timer is removed as a
  // safety net and all already-created projectiles are destroyed immediately.
  if (scene.bossShotTimer) {
    try { scene.bossShotTimer.remove?.(); } catch {}
    scene.bossShotTimer = undefined;
  }
  try { scene.bolts?.clear?.(true, true); } catch {}
}

function restyleShardGuardian(scene: SceneLike) {
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | null;
  const name = String(scene.bossName ?? "");
  if (!boss?.active || !isAct4ShardGuardian(scene, name)) return;
  try {
    if (scene.textures?.exists?.("enemy-rush")) boss.setTexture("enemy-rush");
    boss.setTint(shardTint(name));
    boss.setAlpha(1);
    boss.setScale(1.65);
    boss.setAngle(0);
    (boss.body as Phaser.Physics.Arcade.Body | undefined)?.setCircle?.(12, 2, 2);
    removeGuardianImpulse(scene);
  } catch (err) {
    console.warn?.("[quest] shard guardian visual restyle skipped", err);
  }
}

function tuneShardGuardianStats(scene: SceneLike) {
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | null;
  if (!boss?.active || !isAct4ShardGuardian(scene, String(scene.bossName ?? ""))) return;
  if (!boss.getData?.("act4-guardian-hp-3000")) {
    scene.bossHp = 3000;
    scene.bossMax = 3000;
    boss.setData?.("act4-guardian-hp-3000", true);
    scene.pushHud?.(true);
  }
}

function removeWearinessPulse(scene: SceneLike) {
  const halo = scene.bossHalo;
  if (halo) {
    try {
      scene.tweens?.killTweensOf?.(halo);
      halo.setAlpha?.(0);
      halo.setVisible?.(false);
    } catch {}
  }
  try { scene.bolts?.clear?.(true, true); } catch {}
  if (scene.bossShotTimer) {
    try { scene.bossShotTimer.remove?.(); } catch {}
    scene.bossShotTimer = undefined;
  }
}

function tuneWeariness(scene: SceneLike) {
  if (!isWeariness(scene)) return;
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | null;
  if (!boss?.active) return;
  boss.setAlpha(1);
  removeWearinessPulse(scene);
  const body = boss.body as Phaser.Physics.Arcade.Body | undefined;
  if (body && (body.velocity.x || body.velocity.y)) {
    boss.setVelocity(body.velocity.x * 1.05, body.velocity.y * 1.05);
  }
  if (scene.bossTimer && scene.__wearinessMobTimer !== scene.bossTimer) {
    scene.__wearinessMobTimer = scene.bossTimer;
    scene.bossTimer.timeScale = 2;
  }
}

function swingAccent(scene: SceneLike) {
  const player = scene.player;
  if (!player?.active) return;
  const w = scene.equippedWeapon?.();
  if (!w) return;
  const dir = scene.lastDir === "up"
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

function halveAct4SwordKnockback(scene: SceneLike) {
  if (scene.save?.current_zone !== ACT4_ZONE) return;
  const weaponId = String(scene.save?.equipped_weapon ?? "").toLowerCase();
  const weapon = scene.equippedWeapon?.();
  if (!weapon || !weaponId.includes("sword") || !scene.player?.active) return;
  const reach = Math.max(28, Number(weapon.reach ?? 44) * 1.35);
  const px = scene.player.x;
  const py = scene.player.y;
  const targets: Phaser.Physics.Arcade.Sprite[] = [];
  if (scene.boss?.active) targets.push(scene.boss);
  for (const enemy of (scene.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[]) {
    if (enemy?.active) targets.push(enemy);
  }
  for (const target of targets) {
    if (Phaser.Math.Distance.Between(px, py, target.x, target.y) > reach) continue;
    const body = target.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) target.setVelocity(body.velocity.x * 0.5, body.velocity.y * 0.5);
  }
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
    const result = originalAttack.apply(this, args);
    if (canSwing) halveAct4SwordKnockback(this);
    return result;
  };

  const originalFireBossBolt = proto.fireBossBolt;
  if (typeof originalFireBossBolt === "function") {
    proto.fireBossBolt = function(this: SceneLike, ...args: any[]) {
      const name = String(this.bossName ?? "");
      if (isWeariness(this, name) || isAct4ShardGuardian(this, name)) return;
      return originalFireBossBolt.apply(this, args);
    };
  }

  const originalSpawnActBoss = proto.spawnActBoss;
  if (typeof originalSpawnActBoss === "function") {
    proto.spawnActBoss = function(this: SceneLike, ...args: any[]) {
      // IMPORTANT: strip the guardian projectile BEFORE the base spawner sees
      // the config. This prevents the impulse/projectile timer from ever being
      // created in the first place rather than trying to clean it up afterward.
      if (this.save?.current_zone === ACT4_ZONE) {
        const override = args[2];
        if (override && /shard guardian/i.test(String(override.name ?? ""))) {
          args[2] = { ...override, projectile: undefined };
        }
      }

      const result = originalSpawnActBoss.apply(this, args);
      if (this.save?.current_zone === ACT4_ZONE) {
        const name = String(this.bossName ?? "");
        if (isAct4ShardGuardian(this, name)) {
          restyleShardGuardian(this);
          tuneShardGuardianStats(this);
          removeGuardianImpulse(this);
        }
        if (name === WEARINESS_NAME) {
          this.__wearinessMobTimer = null;
          removeWearinessPulse(this);
          if (this.bossTimer) {
            this.__wearinessMobTimer = this.bossTimer;
            this.bossTimer.timeScale = 2;
          }
        }
      }
      return result;
    };
  }

  const originalUpdate = proto.update;
  if (typeof originalUpdate === "function") {
    proto.update = function(this: SceneLike, time: number, delta: number) {
      const result = originalUpdate.call(this, time, delta);
      if (this.save?.current_zone === ACT4_ZONE) {
        const name = String(this.bossName ?? "");
        if (isAct4ShardGuardian(this, name)) {
          removeGuardianImpulse(this);
          this.boss?.setAlpha?.(1);
          const body = this.boss?.body as Phaser.Physics.Arcade.Body | undefined;
          if (body && (body.velocity.x || body.velocity.y)) {
            this.boss.setVelocity(body.velocity.x * 1.1, body.velocity.y * 1.1);
          }
        } else if (name === WEARINESS_NAME) {
          tuneWeariness(this);
        }
      }
      return result;
    };
  }

  const originalDamageBoss = proto.damageBoss;
  proto.damageBoss = function(this: SceneLike, amount: number, ...args: any[]) {
    const bossNameBefore = String(this.bossName ?? "");
    if (isAct4ShardGuardian(this, bossNameBefore)) {
      return originalDamageBoss.call(this, amount, ...args);
    }
    const boss = this.boss as Phaser.Physics.Arcade.Sprite | null;
    const hpBefore = Number(this.bossHp ?? 0);
    const x = boss?.x ?? 0;
    const y = boss?.y ?? 0;
    const result = originalDamageBoss.call(this, amount, ...args);
    const hpAfter = Number(this.bossHp ?? hpBefore);
    if (boss && hpAfter < hpBefore) {
      const mariaHit = Number(this.time?.now ?? 0) <= Number(this.__combatImpactMariaSwingUntil ?? -Infinity);
      try {
        bossImpact(this, boss?.active && boss.scene ? boss : null, x, y, hpAfter <= 0, mariaHit);
      } catch (err) {
        console.warn?.("[quest] combat impact skipped after boss state changed", err);
      }
    }
    return result;
  };

  installBossFinisher(QuestScene as any);
  installBossFinisherRecovery(QuestScene as any);
  installInteractionCopyFixes(QuestScene as any);
}
