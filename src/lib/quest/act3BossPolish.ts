// @ts-nocheck -- Act III Clamour-only combat polish. Other bosses and progression stay untouched.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const SLOW_MULTIPLIER = 0.8;
const PULSE_INTERVAL = 5500;
const PULSE_WARNING = 850;
const PULSE_RADIUS = 130;

function fireDoubtPulse(scene: SceneLike) {
  if (
    scene.save?.current_zone !== ZONE ||
    !scene.boss?.active ||
    scene.bossPhase !== 1 ||
    scene.frozen
  ) return;

  const x = scene.boss.x;
  const y = scene.boss.y;
  const ring = scene.add.circle(x, y, 24, 0xd9a441, 0.04)
    .setStrokeStyle(4, 0xff9fc5, 0.88)
    .setDepth((scene.boss.depth ?? 18) - 0.1);
  const inner = scene.add.circle(x, y, 15, 0xf3ce70, 0.08)
    .setStrokeStyle(2, 0xf3ce70, 0.72)
    .setDepth((scene.boss.depth ?? 18) - 0.05);

  scene.tweens.add({
    targets: ring,
    radius: PULSE_RADIUS,
    alpha: { from: 0.72, to: 0.12 },
    duration: PULSE_WARNING,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: inner,
    radius: PULSE_RADIUS * 0.72,
    alpha: { from: 0.5, to: 0.06 },
    duration: PULSE_WARNING,
    ease: "Sine.easeOut",
  });

  scene.time.delayedCall(PULSE_WARNING, () => {
    ring.destroy();
    inner.destroy();
    if (
      scene.save?.current_zone !== ZONE ||
      !scene.boss?.active ||
      scene.bossPhase !== 1 ||
      scene.frozen
    ) return;

    const bx = scene.boss.x;
    const by = scene.boss.y;
    scene.spawnSparkle?.(bx, by, 0xff9fc5, 16);
    const dist = Phaser.Math.Distance.Between(bx, by, scene.player.x, scene.player.y);
    if (dist <= PULSE_RADIUS) scene.hurtPlayerDirect?.();
  });
}

function installPulseTimer(scene: SceneLike) {
  scene.act3DoubtPulseTimer?.remove?.();
  scene.act3DoubtPulseTimer = scene.time.addEvent({
    delay: PULSE_INTERVAL,
    loop: true,
    callback: () => fireDoubtPulse(scene),
  });
}

export function installAct3BossPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3BossPolishInstalled) return;
  proto.__act3BossPolishInstalled = true;

  const originalSpawnBoss = proto.spawnActBoss;
  proto.spawnActBoss = function act3ClamourSpawn(...args: any[]) {
    const result = originalSpawnBoss.apply(this, args);
    if (this.save?.current_zone !== ZONE || !this.boss?.active) return result;

    // Haven's base chase speed is 78; the shared update multiplies by bossSlow,
    // so 0.8 gives the requested 20% reduction without touching any other boss.
    this.bossSlow = SLOW_MULTIPLIER;

    // The shared boss timer creates three temporary rush mobs every 3.2 seconds
    // in Haven. Remove only that timer; other bosses retain their add waves.
    this.bossTimer?.remove?.();
    this.bossTimer = undefined;

    installPulseTimer(this);
    return result;
  };

  const originalDefeatBoss = proto.defeatActBoss;
  proto.defeatActBoss = function act3ClamourDefeat(...args: any[]) {
    if (this.save?.current_zone === ZONE) {
      this.act3DoubtPulseTimer?.remove?.();
      this.act3DoubtPulseTimer = undefined;
    }
    return originalDefeatBoss.apply(this, args);
  };
}
