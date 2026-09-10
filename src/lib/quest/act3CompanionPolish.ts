import * as Phaser from "phaser";

const ZONE = "the_haven";
const ENEMY_REACH = 72;
const BOSS_REACH = 82;

type SceneCtor = { prototype: any };

type AndrewMotion = {
  vx: number;
  vy: number;
  lastAt: number;
  dir: "down" | "up" | "side";
  facing: 1 | -1;
};

/**
 * Small Haven-only companion polish:
 * - adds a few extra non-blocking animals around authored social spaces;
 * - makes Andrew's blade connect only at believable melee distance;
 * - gives his follow movement Maria-like easing, facing, and walk cadence.
 */
export function installAct3CompanionPolish(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype as any;
  if (proto.__act3CompanionPolishInstalled) return;
  proto.__act3CompanionPolishInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  proto.buildAct3 = function act3CompanionPolishBuild(...args: any[]) {
    const result = originalBuildAct3.apply(this, args);
    // Keep the existing Haven wildlife and add only a handful of extra life:
    // birds by the northern flowers/Town Hall, a patio cat, and fountain ducks.
    this.spawnAnimals?.(3317, [
      ["bird", 48, 18, 2],
      ["cat", 18, 20, 1],
      ["duck", 62, 53, 2],
    ]);
    return result;
  };

  const originalUpdateAlly = proto.updateAlly;
  proto.updateAlly = function act3CloseRangeAlly(time: number) {
    if (this.save?.current_zone !== ZONE) return originalUpdateAlly.call(this, time);
    const c = this.companion as Phaser.GameObjects.Sprite | null;
    if (!c?.active) return;
    if (this.allyBlade) this.allyBlade.setPosition(c.x + 19, c.y + 2).setDepth(c.depth + 1);
    if (!this.save?.weapons?.includes("love-sword") || time < this.allySwingAt) return;

    const power = Math.max(1, Math.round(this.equippedWeapon().damage / 2));
    let hit = false;
    const enemies = (this.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[];
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      if (Phaser.Math.Distance.Between(enemy.x, enemy.y, c.x, c.y) >= ENEMY_REACH) continue;
      this.transformEnemy(enemy);
      hit = true;
      break;
    }

    if (!hit && this.boss?.active && this.bossPhase === 1) {
      if (Phaser.Math.Distance.Between(this.boss.x, this.boss.y, c.x, c.y) < BOSS_REACH) {
        this.bossHitAt = 0;
        this.damageBoss(power);
        hit = true;
      }
    }
    if (!hit) return;

    this.allySwingAt = time + 900;
    this.spawnSparkle(c.x + 14, c.y, 0x6fb6ff, 6);
    if (this.allyBlade) {
      this.tweens.add({
        targets: this.allyBlade,
        angle: { from: -35, to: 45 },
        duration: 200,
        yoyo: true,
        onComplete: () => this.allyBlade?.setAngle(0),
      });
    }
  };

  const originalUpdateCompanion = proto.updateCompanion;
  proto.updateCompanion = function act3MariaLikeAndrewWalk() {
    if (this.save?.current_zone !== ZONE) return originalUpdateCompanion.call(this);
    const c = this.companion as Phaser.GameObjects.Sprite | null;
    if (!c?.active || !this.player?.active) return;

    const now = Number(this.time?.now ?? 0);
    const motion: AndrewMotion = this.__act3AndrewMotion ?? {
      vx: 0,
      vy: 0,
      lastAt: now,
      dir: "down",
      facing: 1,
    };
    const dt = Phaser.Math.Clamp((now - motion.lastAt) / 1000, 1 / 120, 0.05);
    motion.lastAt = now;

    const dx = this.player.x - 34 - c.x;
    const dy = this.player.y + 10 - c.y;
    const distance = Math.hypot(dx, dy);
    const wantsMove = distance > 13;
    const targetSpeed = wantsMove ? Math.min(126, Math.max(54, distance * 3.2)) : 0;
    const tx = wantsMove ? (dx / Math.max(distance, 0.001)) * targetSpeed : 0;
    const ty = wantsMove ? (dy / Math.max(distance, 0.001)) * targetSpeed : 0;

    // Maria eases into and out of motion; Andrew now does the same instead of
    // stepping directly toward the follow point every frame.
    const damp = 1 - Math.exp(-(wantsMove ? 12 : 16) * dt);
    motion.vx += (tx - motion.vx) * damp;
    motion.vy += (ty - motion.vy) * damp;
    if (Math.abs(motion.vx) < 1.5) motion.vx = 0;
    if (Math.abs(motion.vy) < 1.5) motion.vy = 0;

    c.x += motion.vx * dt;
    c.y += motion.vy * dt;
    const speed = Math.hypot(motion.vx, motion.vy);
    const moving = speed > 5;

    if (moving) {
      if (Math.abs(motion.vx) > Math.abs(motion.vy)) {
        motion.dir = "side";
        motion.facing = motion.vx >= 0 ? 1 : -1;
      } else {
        motion.dir = motion.vy < 0 ? "up" : "down";
      }
    }
    c.setFlipX(motion.dir === "side" && motion.facing < 0);
    const key = `andrew-${moving ? "walk" : "idle"}-${motion.dir}`;
    if (c.anims.currentAnim?.key !== key) c.anims.play(key, true);

    // Match Maria's subtle grounded walk pulse without changing Andrew's scale.
    const bob = moving ? Math.sin(now / 92) * 0.012 : 0;
    c.setScale(1.1, 1.1 + bob).setDepth(this.dsort(c.y));
    this.__act3AndrewMotion = motion;
  };
}
