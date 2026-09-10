import * as Phaser from "phaser";

const ZONE = "the_haven";
const CLAMOUR_NAME = "The Clamour of Doubt";
const ENEMY_REACH = 72;
const BOSS_REACH = 82;
const TOGETHER_WINDOW = 900;
const TOGETHER_COOLDOWN = 2600;
const ANDREW_SCALE = 1.265; // existing 1.1 presentation + 15%

type SceneCtor = { prototype: any };

type AndrewMotion = {
  vx: number;
  vy: number;
  lastAt: number;
  dir: "down" | "up" | "side";
  facing: 1 | -1;
};

function clamourActive(scene: any) {
  return Boolean(
    scene.save?.current_zone === ZONE &&
      scene.boss?.active &&
      scene.bossPhase === 1 &&
      scene.bossName === CLAMOUR_NAME,
  );
}

function togetherFlourish(scene: any) {
  if (!clamourActive(scene) || !scene.player?.active || !scene.companion?.active) return;
  const now = Number(scene.time?.now ?? 0);
  if (now < (scene.__act3TogetherReadyAt ?? 0)) return;
  scene.__act3TogetherReadyAt = now + TOGETHER_COOLDOWN;

  const boss = scene.boss;
  const maria = scene.player;
  const andrew = scene.companion;
  const depth = (boss.depth ?? 18) + 1;

  scene.spawnSparkle?.(boss.x - 9, boss.y, 0xff8fb8, 8);
  scene.spawnSparkle?.(boss.x + 9, boss.y, 0x78baff, 8);

  const rose = scene.add.arc(maria.x, maria.y - 5, 18, -55, 55, false, 0xff8fb8, 0.42)
    .setStrokeStyle(2, 0xffc4d8, 0.9).setDepth(depth);
  const blue = scene.add.arc(andrew.x, andrew.y - 5, 18, 125, 235, false, 0x78baff, 0.42)
    .setStrokeStyle(2, 0xc5ddff, 0.9).setDepth(depth);
  scene.tweens.add({ targets: rose, x: boss.x - 5, y: boss.y, alpha: 0, scale: 0.45, duration: 360, ease: "Sine.easeIn", onComplete: () => rose.destroy() });
  scene.tweens.add({ targets: blue, x: boss.x + 5, y: boss.y, alpha: 0, scale: 0.45, duration: 360, ease: "Sine.easeIn", onComplete: () => blue.destroy() });

  const heart = scene.add.text(boss.x, boss.y - 20, "♥", {
    fontFamily: "Georgia, serif", fontSize: "20px", fontStyle: "bold", color: "#f2d9ff", stroke: "#7a5ca6", strokeThickness: 2,
  }).setOrigin(0.5).setDepth(depth + 1).setAlpha(0.95);
  scene.tweens.add({ targets: heart, y: heart.y - 22, scale: { from: 0.7, to: 1.25 }, alpha: 0, duration: 700, ease: "Sine.easeOut", onComplete: () => heart.destroy() });

  scene.__act3TogetherCount = (scene.__act3TogetherCount ?? 0) + 1;
  if (scene.__act3TogetherCount % 2 !== 1) return;
  const text = scene.add.text(boss.x, boss.y - 44, "♥ Together ♥", {
    fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold italic", color: "#fff4fb", stroke: "#6b5a91", strokeThickness: 3,
  }).setOrigin(0.5, 1).setDepth(depth + 2).setAlpha(0.98);
  scene.tweens.add({ targets: text, y: text.y - 24, alpha: 0, duration: 900, hold: 180, ease: "Sine.easeOut", onComplete: () => text.destroy() });
}

function recordClamourHit(scene: any, partner: "maria" | "andrew") {
  if (!clamourActive(scene)) return;
  const now = Number(scene.time?.now ?? 0);
  const previous = scene.__act3LastClamourHit as { partner: "maria" | "andrew"; at: number } | undefined;
  if (previous && previous.partner !== partner && now - previous.at <= TOGETHER_WINDOW) togetherFlourish(scene);
  scene.__act3LastClamourHit = { partner, at: now };
}

function sizeAndrew(scene: any) {
  if (scene.save?.current_zone !== ZONE) return;
  const companion = scene.companion as Phaser.GameObjects.Sprite | null;
  if (companion?.active) companion.setScale(ANDREW_SCALE);
  for (const it of scene.interactables ?? []) {
    if (it?.kind === "andrew" && it.obj?.active) it.obj.setScale(ANDREW_SCALE);
  }
}

/** Haven-only Andrew/wildlife/combat presentation polish. */
export function installAct3CompanionPolish(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype as any;
  if (proto.__act3CompanionPolishInstalled) return;
  proto.__act3CompanionPolishInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  proto.buildAct3 = function act3CompanionPolishBuild(...args: any[]) {
    const result = originalBuildAct3.apply(this, args);
    this.spawnAnimals?.(3317, [["bird", 48, 18, 2], ["cat", 18, 20, 1], ["duck", 62, 53, 2]]);
    sizeAndrew(this);
    return result;
  };

  const originalSpawnCompanion = proto.spawnCompanion;
  proto.spawnCompanion = function act3LargeAndrewCompanion(...args: any[]) {
    const result = originalSpawnCompanion.apply(this, args);
    sizeAndrew(this);
    return result;
  };

  const originalAttack = proto.attack;
  proto.attack = function act3TogetherMariaAttack(...args: any[]) {
    const beforeHp = clamourActive(this) ? Number(this.bossHp) : NaN;
    const result = originalAttack.apply(this, args);
    if (Number.isFinite(beforeHp) && Number(this.bossHp) < beforeHp) recordClamourHit(this, "maria");
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
      this.transformEnemy(enemy); hit = true; break;
    }
    if (!hit && this.boss?.active && this.bossPhase === 1 && Phaser.Math.Distance.Between(this.boss.x, this.boss.y, c.x, c.y) < BOSS_REACH) {
      const beforeHp = Number(this.bossHp);
      this.bossHitAt = 0;
      this.damageBoss(power);
      if (Number(this.bossHp) < beforeHp) recordClamourHit(this, "andrew");
      hit = true;
    }
    if (!hit) return;
    this.allySwingAt = time + 900;
    this.spawnSparkle(c.x + 14, c.y, 0x6fb6ff, 6);
    if (this.allyBlade) this.tweens.add({ targets: this.allyBlade, angle: { from: -35, to: 45 }, duration: 200, yoyo: true, onComplete: () => this.allyBlade?.setAngle(0) });
  };

  const originalUpdateCompanion = proto.updateCompanion;
  proto.updateCompanion = function act3MariaLikeAndrewWalk() {
    if (this.save?.current_zone !== ZONE) return originalUpdateCompanion.call(this);
    const c = this.companion as Phaser.GameObjects.Sprite | null;
    if (!c?.active || !this.player?.active) return;
    const now = Number(this.time?.now ?? 0);
    const motion: AndrewMotion = this.__act3AndrewMotion ?? { vx: 0, vy: 0, lastAt: now, dir: "down", facing: 1 };
    const dt = Phaser.Math.Clamp((now - motion.lastAt) / 1000, 1 / 120, 0.05);
    motion.lastAt = now;
    const dx = this.player.x - 34 - c.x;
    const dy = this.player.y + 10 - c.y;
    const distance = Math.hypot(dx, dy);
    const wantsMove = distance > 13;
    const targetSpeed = wantsMove ? Math.min(126, Math.max(54, distance * 3.2)) : 0;
    const tx = wantsMove ? (dx / Math.max(distance, 0.001)) * targetSpeed : 0;
    const ty = wantsMove ? (dy / Math.max(distance, 0.001)) * targetSpeed : 0;
    const damp = 1 - Math.exp(-(wantsMove ? 12 : 16) * dt);
    motion.vx += (tx - motion.vx) * damp; motion.vy += (ty - motion.vy) * damp;
    if (Math.abs(motion.vx) < 1.5) motion.vx = 0;
    if (Math.abs(motion.vy) < 1.5) motion.vy = 0;
    c.x += motion.vx * dt; c.y += motion.vy * dt;
    const moving = Math.hypot(motion.vx, motion.vy) > 5;
    if (moving) {
      if (Math.abs(motion.vx) > Math.abs(motion.vy)) { motion.dir = "side"; motion.facing = motion.vx >= 0 ? 1 : -1; }
      else motion.dir = motion.vy < 0 ? "up" : "down";
    }
    c.setFlipX(motion.dir === "side" && motion.facing < 0);
    const key = `andrew-${moving ? "walk" : "idle"}-${motion.dir}`;
    if (c.anims.currentAnim?.key !== key) c.anims.play(key, true);
    const bob = moving ? Math.sin(now / 92) * 0.014 : 0;
    c.setScale(ANDREW_SCALE, ANDREW_SCALE + bob).setDepth(this.dsort(c.y));
    this.__act3AndrewMotion = motion;
  };
}
