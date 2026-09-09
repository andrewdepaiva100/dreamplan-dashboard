// @ts-nocheck -- Act III Clamour-only combat polish. Other bosses and progression stay untouched.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const CLAMOUR_NAME = "The Clamour of Doubt";
const SLOW_MULTIPLIER = 0.8;
const PULSE_INTERVAL = 5500;
const PULSE_WARNING = 850;
const PULSE_RADIUS = 130;

function clamourActive(scene: SceneLike) {
  return Boolean(
    scene.sys?.isActive?.() &&
    scene.save?.current_zone === ZONE &&
    scene.boss?.active &&
    scene.bossPhase === 1 &&
    scene.bossName === CLAMOUR_NAME,
  );
}

function clearPulseVisuals(scene: SceneLike) {
  scene.act3DoubtPulseWarning?.remove?.();
  scene.act3DoubtPulseWarning = undefined;
  const visuals = scene.act3DoubtPulseVisuals as Phaser.GameObjects.GameObject[] | undefined;
  if (visuals) {
    for (const obj of visuals) {
      if (!obj) continue;
      scene.tweens?.killTweensOf?.(obj);
      if ((obj as any).active) (obj as any).destroy?.();
    }
  }
  scene.act3DoubtPulseVisuals = undefined;
}

function clearPulseSystem(scene: SceneLike) {
  scene.act3DoubtPulseTimer?.remove?.();
  scene.act3DoubtPulseTimer = undefined;
  clearPulseVisuals(scene);
}

function fireDoubtPulse(scene: SceneLike) {
  if (!clamourActive(scene) || scene.frozen) return;

  // Never let an older warning survive into a later pulse. The original version
  // could leave an in-flight delayed callback behind when the fight ended or the
  // scene changed; keeping one owned warning at a time makes the attack lifecycle safe.
  clearPulseVisuals(scene);

  const boss = scene.boss;
  const x = boss.x;
  const y = boss.y;
  const depth = (boss.depth ?? 18) - 0.08;

  // Fixed-size circles are scaled instead of tweening Arc.radius directly.
  // That keeps the telegraph purely visual and avoids mutating geometry while
  // Phaser may also be tearing down the scene or the boss.
  const outer = scene.add.circle(x, y, PULSE_RADIUS, 0xff9fc5, 0.045)
    .setStrokeStyle(4, 0xff9fc5, 0.9)
    .setScale(0.18)
    .setDepth(depth);
  const gold = scene.add.circle(x, y, PULSE_RADIUS * 0.78, 0xf3ce70, 0.035)
    .setStrokeStyle(2, 0xf3ce70, 0.78)
    .setScale(0.18)
    .setDepth(depth + 0.01);
  const core = scene.add.circle(x, y, 22, 0xff7dad, 0.18)
    .setStrokeStyle(2, 0xffd7e5, 0.8)
    .setDepth(depth + 0.02);

  scene.act3DoubtPulseVisuals = [outer, gold, core];

  scene.tweens.add({
    targets: outer,
    scale: 1,
    alpha: { from: 0.72, to: 0.12 },
    duration: PULSE_WARNING,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: gold,
    scale: 1,
    alpha: { from: 0.52, to: 0.08 },
    duration: PULSE_WARNING,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: core,
    scale: { from: 0.85, to: 1.35 },
    alpha: { from: 0.28, to: 0.05 },
    duration: PULSE_WARNING,
    ease: "Sine.easeOut",
  });

  scene.act3DoubtPulseWarning = scene.time.delayedCall(PULSE_WARNING, () => {
    scene.act3DoubtPulseWarning = undefined;
    clearPulseVisuals(scene);
    if (!clamourActive(scene) || scene.frozen || !scene.player?.active) return;

    const bx = scene.boss.x;
    const by = scene.boss.y;
    scene.spawnSparkle?.(bx, by, 0xff9fc5, 16);
    const dist = Phaser.Math.Distance.Between(bx, by, scene.player.x, scene.player.y);
    if (dist <= PULSE_RADIUS && typeof scene.hurtPlayerDirect === "function") {
      // This is the same proven damage path used by the base boss projectile overlap.
      scene.hurtPlayerDirect();
    }
  });
}

function installPulseTimer(scene: SceneLike) {
  clearPulseSystem(scene);
  scene.act3DoubtPulseTimer = scene.time.addEvent({
    delay: PULSE_INTERVAL,
    loop: true,
    callback: () => fireDoubtPulse(scene),
  });

  // Phaser clears its own time events on shutdown, but explicitly releasing our
  // references/visuals prevents a late callback from touching a torn-down fight.
  scene.events?.once?.(Phaser.Scenes.Events.SHUTDOWN, () => clearPulseSystem(scene));
}

export function installAct3BossPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3BossPolishInstalled) return;
  proto.__act3BossPolishInstalled = true;

  const originalSpawnBoss = proto.spawnActBoss;
  proto.spawnActBoss = function act3ClamourSpawn(...args: any[]) {
    const result = originalSpawnBoss.apply(this, args);
    if (
      this.save?.current_zone !== ZONE ||
      !this.boss?.active ||
      this.bossName !== CLAMOUR_NAME
    ) return result;

    // Haven's base chase speed is 78; the shared update multiplies by bossSlow,
    // so 0.8 gives the requested 20% reduction without touching any other boss.
    this.bossSlow = SLOW_MULTIPLIER;

    // The shared Haven boss timer creates temporary rush mobs. Remove only the
    // Clamour's add timer; other acts and any unrelated encounter keep theirs.
    this.bossTimer?.remove?.();
    this.bossTimer = undefined;

    installPulseTimer(this);
    return result;
  };

  const originalDefeatBoss = proto.defeatActBoss;
  proto.defeatActBoss = function act3ClamourDefeat(...args: any[]) {
    if (this.save?.current_zone === ZONE && this.bossName === CLAMOUR_NAME) {
      clearPulseSystem(this);
    }
    return originalDefeatBoss.apply(this, args);
  };
}
