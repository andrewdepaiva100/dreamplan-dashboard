// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";
import { SOLID_TILES, TILE } from "./textures";
import type { ZoneId } from "./content";

type QuestSceneLike = Phaser.Scene & Record<string, any>;
type QuestSceneCtor = { prototype: QuestSceneLike };

// The existing scene already runs at 80% of authored roaming counts. Applying
// the requested additional 15% reduction yields 0.80 * 0.85 = 0.68.
const NORMAL_POPULATION_MULTIPLIER = 0.68;
const BRUTE_SPAWN_CHANCE = 0.75;
const BRUTE_SLOT_DIVISOR = 4;
const BRUTE_HP = 3;
const BRUTE_DAMAGE = 2;
const BRUTE_HEART_DROP_CHANCE = 0.2;
const BRUTE_SCALE = 1.65;
const BRUTE_TELEGRAPH_MS = 320;
const BRUTE_ATTACK_WINDOW_MS = 520;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function ensureBruteTexture(scene: QuestSceneLike) {
  if (scene.textures.exists("enemy-brute")) return;
  const sourceKey = scene.textures.exists("enemy-overwhelm") ? "enemy-overwhelm" : "enemy-rush";
  const tex = scene.textures.createCanvas("enemy-brute", 44, 44);
  if (!tex) return;
  const ctx = tex.getContext();
  const source = scene.textures.get(sourceKey).getSourceImage() as CanvasImageSource;
  ctx.imageSmoothingEnabled = true;

  // A larger silhouette built from the existing worry art so it still belongs
  // to the same visual language, with a darker premium-grade value range.
  ctx.save();
  ctx.shadowColor = "rgba(20, 12, 34, 0.38)";
  ctx.shadowBlur = 5;
  ctx.drawImage(source, 4, 5, 36, 36);
  ctx.restore();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = "#49345f";
  ctx.fillRect(0, 0, 44, 44);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // Crown-like spikes make the heavy mob readable at a glance without
  // introducing an unrelated art style.
  ctx.fillStyle = "#2d2340";
  ctx.beginPath();
  ctx.moveTo(10, 12);
  ctx.lineTo(14, 2);
  ctx.lineTo(19, 12);
  ctx.lineTo(24, 1);
  ctx.lineTo(29, 12);
  ctx.lineTo(35, 4);
  ctx.lineTo(36, 16);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(235, 216, 255, 0.72)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(22, 24, 17, 0.25, Math.PI - 0.25);
  ctx.stroke();
  tex.refresh();
}

function spawnHeartDrop(scene: QuestSceneLike, x: number, y: number) {
  const hearts = scene.hearts as Phaser.Physics.Arcade.Group | undefined;
  if (!hearts) return;
  const heart = hearts.create(x, y, "heart-pickup") as Phaser.Physics.Arcade.Sprite | null;
  if (!heart) return;
  heart
    .setActive(true)
    .setVisible(true)
    .setDepth(scene.dsort?.(y) ?? 18)
    .setData("golden", false)
    .setScale(1.18);
  const body = heart.body as Phaser.Physics.Arcade.Body | null;
  body?.setAllowGravity(false);
  heart.setCircle(6, 2, 1);
  scene.tweens.add({
    targets: heart,
    y: y - 6,
    scale: { from: 1.05, to: 1.22 },
    duration: 760,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  scene.spawnSparkle?.(x, y, 0xff9ec4, 8);
}

function addBruteTelegraph(scene: QuestSceneLike, enemy: Phaser.Physics.Arcade.Sprite, time: number) {
  enemy.setData("bruteTelegraphUntil", time + BRUTE_TELEGRAPH_MS);
  enemy.setData("bruteAttackArmedAt", time + BRUTE_TELEGRAPH_MS);
  enemy.setData("bruteAttackExpiresAt", time + BRUTE_TELEGRAPH_MS + BRUTE_ATTACK_WINDOW_MS);
  enemy.setData("bruteNextTelegraphAt", time + BRUTE_TELEGRAPH_MS + BRUTE_ATTACK_WINDOW_MS + 700);

  const ring = scene.add
    .circle(enemy.x, enemy.y + 5, 20, 0x8f5a70, 0)
    .setDepth((scene.dsort?.(enemy.y) ?? 15) - 0.1)
    .setStrokeStyle(2, 0xf0b8c6, 0.72);
  scene.tweens.add({
    targets: ring,
    radius: 38,
    alpha: 0,
    duration: BRUTE_TELEGRAPH_MS,
    ease: "Cubic.easeOut",
    onComplete: () => ring.destroy(),
  });
}

/**
 * Installs presentation/combat polish without changing the save schema or
 * replacing the existing Phaser scene. TypeScript `private` methods compile
 * to normal prototype methods here, so wrapping them lets the game keep using
 * its existing collision, damage, drop and animation plumbing.
 */
export function installQuestUpgrades(QuestScene: QuestSceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__premiumQuestUpgradesInstalled) return;
  proto.__premiumQuestUpgradesInstalled = true;

  const originalCreate = proto.create;
  proto.create = function upgradedCreate(this: QuestSceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);

    // Smooth the rendered pixel art and gently compress saturation/contrast.
    // This keeps the current palette recognizable while reducing harshness.
    const canvas = this.game.canvas;
    canvas.style.imageRendering = "auto";
    canvas.style.filter = "saturate(0.90) contrast(0.965) brightness(0.985)";

    // The original scene already has sunlight, haze and a vignette. Tone the
    // strongest sunlight wash down so highlights remain comfortable.
    for (const child of this.children.list) {
      if (child instanceof Phaser.GameObjects.Rectangle && child.depth === 90) {
        this.tweens.killTweensOf(child);
        child.setAlpha(0.085);
        this.tweens.add({
          targets: child,
          alpha: { from: 0.065, to: 0.11 },
          duration: 5200,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }

    return result;
  };

  const originalAuraTrail = proto.auraTrail;
  proto.auraTrail = function upgradedAuraTrail(this: QuestSceneLike, moving: boolean) {
    const now = this.time.now;
    const last = (this.__premiumAuraAt as number | undefined) ?? 0;
    if (now - last < (moving ? 150 : 220)) return;
    this.__premiumAuraAt = now;
    return originalAuraTrail.call(this, moving);
  };

  const originalSpawnEnemy = proto.spawnEnemy;
  proto.spawnEnemy = function upgradedSpawnEnemy(
    this: QuestSceneLike,
    x: number,
    y: number,
    key: string,
    speed: number,
    temp: boolean,
  ) {
    if (key === "enemy-brute") ensureBruteTexture(this);
    const enemy = originalSpawnEnemy.call(this, x, y, key, speed, temp) as Phaser.Physics.Arcade.Sprite | null;
    if (!enemy) return enemy;

    const brute = key === "enemy-brute";
    enemy.setData("brute", brute);
    enemy.setData("hp", brute ? BRUTE_HP : 1);
    enemy.setData("maxHp", brute ? BRUTE_HP : 1);
    enemy.setData("damage", brute ? BRUTE_DAMAGE : 1);
    enemy.setData("hitLockUntil", 0);
    enemy.setData("bruteAttackArmedAt", brute ? Number.POSITIVE_INFINITY : 0);
    enemy.setData("bruteAttackExpiresAt", 0);
    enemy.setData("bruteNextTelegraphAt", brute ? this.time.now + Phaser.Math.Between(500, 1200) : 0);

    if (brute) {
      enemy.setScale(BRUTE_SCALE);
      enemy.setCircle(15, 7, 7);
      enemy.setTint(0xf1e4ff);
      this.time.delayedCall(120, () => enemy.active && enemy.clearTint());
    } else {
      enemy.setScale(1);
      enemy.setCircle(10);
    }
    return enemy;
  };

  // Replace only the zone population policy. Placement, collision and enemy
  // construction continue through the scene's existing methods.
  proto.spawnEnemiesForZone = function upgradedSpawnEnemiesForZone(this: QuestSceneLike, zone: ZoneId) {
    if (zone === "the_haven" || zone === "cathedral") return;
    const config: Record<string, { key: string; count: number; speed: number }> = {
      sunlit_shores: { key: "enemy-distraction", count: 18, speed: 48 },
      wedding_garden: { key: "enemy-rush", count: 22, speed: 68 },
      starry_ascent: { key: "enemy-weariness", count: 6, speed: 28 },
    };
    const c = config[zone];
    if (!c) return;

    // The live game was already at 80% of authored roaming mobs; this applies
    // the requested additional 15% reduction to that current population.
    const normalTarget = Math.max(1, Math.round(c.count * NORMAL_POPULATION_MULTIPLIER));
    const rnd = seededRandom(zone.length * 37 + 11);
    const solid = SOLID_TILES as readonly number[];

    const placeOne = (key: string, speed: number, minDistance: number) => {
      let guard = 0;
      while (guard++ < 180) {
        const x = Math.floor(rnd() * (this.mapW - 8)) + 4;
        const y = Math.floor(rnd() * (this.mapH - 8)) + 4;
        const tile = this.layer.getTileAt(x, y);
        if (!tile || solid.includes(tile.index)) continue;
        if (Phaser.Math.Distance.Between(x * TILE, y * TILE, this.player.x, this.player.y) < minDistance)
          continue;
        return this.spawnEnemy(x * TILE, y * TILE, key, speed, false) as Phaser.Physics.Arcade.Sprite | null;
      }
      return null;
    };

    for (let i = 0; i < normalTarget; i++) placeOne(c.key, c.speed, 220);

    // The original game uses seeded one-time population rather than timed
    // respawns. Give the brute a 75% spawn chance in each rare heavy-mob slot
    // (25% less frequent than a guaranteed normal spawn) and keep slots sparse
    // so total entities do not balloon.
    const bruteSlots = Math.max(1, Math.round(normalTarget / BRUTE_SLOT_DIVISOR));
    for (let i = 0; i < bruteSlots; i++) {
      if (rnd() > BRUTE_SPAWN_CHANCE) continue;
      placeOne("enemy-brute", Math.max(24, Math.round(c.speed * 0.82)), 300);
    }
  };

  const originalTransformEnemy = proto.transformEnemy;
  proto.transformEnemy = function upgradedTransformEnemy(
    this: QuestSceneLike,
    enemy: Phaser.Physics.Arcade.Sprite,
  ) {
    if (!enemy.active || enemy.getData("brute") !== true) {
      return originalTransformEnemy.call(this, enemy);
    }

    const now = this.time.now;
    if (now < ((enemy.getData("hitLockUntil") as number) ?? 0)) return;
    enemy.setData("hitLockUntil", now + 170);
    const hp = Math.max(0, ((enemy.getData("hp") as number) ?? BRUTE_HP) - 1);
    enemy.setData("hp", hp);

    if (hp > 0) {
      this.floatText?.(enemy.x, enemy.y - 8, `-${1}`, "#f4d9ff", hp === 1);
      enemy.setTint(0xffc9d5);
      this.cameras.main.shake(70, 0.0015);
      this.spawnSparkle?.(enemy.x, enemy.y, 0xd7b9ff, 6);
      this.time.delayedCall(110, () => enemy.active && enemy.clearTint());
      return;
    }

    const { x, y } = enemy;
    originalTransformEnemy.call(this, enemy);
    this.cameras.main.shake(95, 0.0022);
    this.spawnSparkle?.(x, y, 0xe5c6ff, 14);
    if (Math.random() < BRUTE_HEART_DROP_CHANCE) spawnHeartDrop(this, x, y);
  };

  const originalHurtPlayer = proto.hurtPlayer;
  proto.hurtPlayer = function upgradedHurtPlayer(
    this: QuestSceneLike,
    enemy: Phaser.Physics.Arcade.Sprite,
  ) {
    if (!enemy.active || this.frozen) return;
    const now = this.time.now;
    if (now < this.invulnUntil) return;

    const brute = enemy.getData("brute") === true;
    if (brute) {
      const armedAt = (enemy.getData("bruteAttackArmedAt") as number) ?? Number.POSITIVE_INFINITY;
      const expiresAt = (enemy.getData("bruteAttackExpiresAt") as number) ?? 0;
      if (now < armedAt || now > expiresAt) return;
      enemy.setData("bruteAttackArmedAt", Number.POSITIVE_INFINITY);
      enemy.setData("bruteAttackExpiresAt", 0);
      enemy.setData("bruteNextTelegraphAt", now + 1050);

      // The existing damage routine owns invulnerability, shield checks,
      // save/HUD updates and game-over. Pre-charge one extra heart so that
      // routine still performs the final hit and all of its normal side effects.
      this.save.player_health = Math.max(0, this.save.player_health - (BRUTE_DAMAGE - 1));
      this.floatText?.(this.player.x, this.player.y - 24, `-${BRUTE_DAMAGE} ♥`, "#ffb3bf", true);
      this.__premiumHurtUntil = now + 360;
    }
    return originalHurtPlayer.call(this, enemy);
  };

  const originalAttack = proto.attack;
  proto.attack = function upgradedAttack(this: QuestSceneLike, ...args: any[]) {
    const before = this.swingAt;
    const result = originalAttack.apply(this, args);
    if (this.swingAt !== before) {
      const now = this.time.now;
      this.__premiumAttackStartedAt = now;
      this.__premiumAttackUntil = now + 300;
      this.cameras.main.shake(55, 0.0009);
    }
    return result;
  };

  const originalDash = proto.dash;
  proto.dash = function upgradedDash(this: QuestSceneLike, ...args: any[]) {
    const before = this.dashUntil;
    const result = originalDash.apply(this, args);
    if (this.dashUntil !== before) this.__premiumDashPoseUntil = this.time.now + 230;
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function upgradedUpdate(this: QuestSceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    const player = this.player as Phaser.Physics.Arcade.Sprite | undefined;
    if (!player?.active || this.frozen) return result;

    const velocity = this.vel as { x: number; y: number } | undefined;
    const body = player.body as Phaser.Physics.Arcade.Body | null;
    const vx = velocity?.x ?? body?.velocity.x ?? 0;
    const vy = velocity?.y ?? body?.velocity.y ?? 0;
    const speed = Math.hypot(vx, vy);
    const move01 = Phaser.Math.Clamp(speed / 120, 0, 1.6);

    // Premium character motion: subtle breathing at rest, directional lean in
    // locomotion, then explicit anticipation -> strike -> recovery poses.
    let sx = 1.1;
    let sy = 1.1;
    let angle = Phaser.Math.Clamp((vx / 120) * 2.2, -2.4, 2.4);
    if (speed < 5) {
      const breath = Math.sin(time / 430);
      sx += breath * 0.006;
      sy += breath * 0.012;
      angle = Math.sin(time / 900) * 0.35;
    } else {
      const stride = Math.sin(time / 105) * Math.min(1, move01);
      sx += Math.abs(stride) * 0.012;
      sy -= Math.abs(stride) * 0.009;
    }

    const attackUntil = (this.__premiumAttackUntil as number | undefined) ?? 0;
    const attackStart = (this.__premiumAttackStartedAt as number | undefined) ?? 0;
    if (time < attackUntil) {
      const p = Phaser.Math.Clamp((time - attackStart) / Math.max(1, attackUntil - attackStart), 0, 1);
      const side = this.facing >= 0 ? 1 : -1;
      if (p < 0.23) {
        const q = p / 0.23;
        sx -= 0.025 * q;
        sy += 0.035 * q;
        angle -= side * 3.2 * q;
      } else if (p < 0.58) {
        const q = (p - 0.23) / 0.35;
        sx += 0.05 * Math.sin(q * Math.PI);
        sy -= 0.025 * Math.sin(q * Math.PI);
        angle += side * 5.5 * Math.sin(q * Math.PI);
      } else {
        const q = (p - 0.58) / 0.42;
        angle *= 1 - q;
      }
    }

    if (time < ((this.__premiumDashPoseUntil as number | undefined) ?? 0)) {
      sx += 0.035;
      sy -= 0.028;
      angle += Phaser.Math.Clamp((vx / 120) * 3.5, -4, 4);
    }
    if (time < ((this.__premiumHurtUntil as number | undefined) ?? 0)) {
      angle += Math.sin(time / 24) * 2.2;
    }

    player.setScale(sx, sy).setAngle(angle);

    const enemies = this.enemies?.getChildren?.() as Phaser.Physics.Arcade.Sprite[] | undefined;
    for (const enemy of enemies ?? []) {
      if (!enemy.active || enemy.getData("brute") !== true) continue;
      const d = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
      const nextTelegraph = (enemy.getData("bruteNextTelegraphAt") as number) ?? 0;
      const telegraphUntil = (enemy.getData("bruteTelegraphUntil") as number) ?? 0;
      const attackExpires = (enemy.getData("bruteAttackExpiresAt") as number) ?? 0;

      if (d < 112 && time >= nextTelegraph && time > telegraphUntil && time > attackExpires) {
        addBruteTelegraph(this, enemy, time);
      }

      const tellUntil = (enemy.getData("bruteTelegraphUntil") as number) ?? 0;
      if (time < tellUntil) {
        enemy.setVelocity(0, 0);
        const p = 1 - (tellUntil - time) / BRUTE_TELEGRAPH_MS;
        const pulse = Math.sin(Phaser.Math.Clamp(p, 0, 1) * Math.PI);
        enemy.setScale(BRUTE_SCALE + pulse * 0.13).setTint(0xffbdc8);
      } else {
        enemy.clearTint();
        const enemyBody = enemy.body as Phaser.Physics.Arcade.Body | null;
        const ex = enemyBody?.velocity.x ?? 0;
        enemy.setFlipX(ex < -2);
        const weight = Math.sin(time / 185 + enemy.x * 0.01);
        enemy.setScale(BRUTE_SCALE + weight * 0.025).setAngle(weight * 1.4);
      }
    }

    return result;
  };
}
