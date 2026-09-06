// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const WARDEN_NAME = "Warden of Rushing Water";
const SAFE_STOMP_RADIUS = 57;
const SAFE_STOMP_DAMAGE = 2;
const SAFE_STOMP_TELEGRAPH = 700;
const SAFE_STOMP_EVERY = 8000;
const SAFE_STOMP_RECOVERY = 2000;

function isWarden(scene: SceneLike) {
  return scene.save?.current_zone === "sunlit_shores" && scene.bossName === WARDEN_NAME;
}

function ready(scene: SceneLike) {
  return Boolean(
    isWarden(scene) &&
      scene.sys?.isActive?.() !== false &&
      scene.boss?.active &&
      scene.player?.active &&
      scene.bossPhase === 1 &&
      !scene.bossTalking &&
      !scene.frozen,
  );
}

function removeTimer(scene: SceneLike) {
  try {
    scene.__wardenSafeStompTimer?.remove?.(false);
  } catch {
    // Scene may already be shutting down.
  }
  scene.__wardenSafeStompTimer = undefined;
}

function destroyRing(scene: SceneLike) {
  try {
    scene.__wardenSafeStompRing?.destroy?.();
  } catch {
    // Already destroyed during a scene transition.
  }
  scene.__wardenSafeStompRing = undefined;
}

function cancelSafeStomp(scene: SceneLike, resetClock = true) {
  removeTimer(scene);
  destroyRing(scene);
  scene.__wardenSafeStompCharging = false;
  scene.__wardenSafeStompToken = Number(scene.__wardenSafeStompToken ?? 0) + 1;
  if (resetClock) scene.__wardenSafeNextStompAt = 0;
}

function applySafeDamage(scene: SceneLike, bossX: number, bossY: number) {
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!player?.active || !scene.save) return;
  if (scene.time.now < Number(scene.invulnUntil ?? 0)) return;

  const distance = Phaser.Math.Distance.Between(bossX, bossY, player.x, player.y);
  if (distance > SAFE_STOMP_RADIUS) {
    scene.floatText?.(player.x, player.y - 14, "DODGED!", "#bff7ff", true);
    return;
  }

  const angle = Math.atan2(player.y - bossY, player.x - bossX);
  scene.invulnUntil = scene.time.now + 1250;
  scene.save.player_health = Math.max(0, Number(scene.save.player_health ?? 5) - SAFE_STOMP_DAMAGE);

  // Keep knockback simple and bounded. Do not queue any player tween/callback here.
  const knockback = 250;
  const vx = Math.cos(angle) * knockback;
  const vy = Math.sin(angle) * knockback;
  scene.vel = { x: vx, y: vy };
  player.setVelocity?.(vx, vy);

  scene.floatText?.(player.x, player.y - 12, `-${SAFE_STOMP_DAMAGE} ♥`, "#ff8f8f", true);
  scene.cameras?.main?.shake?.(120, 0.005);
  scene.emitSave?.();
  scene.pushHud?.(true);

  if (scene.save.player_health <= 0) {
    cancelSafeStomp(scene);
    scene.openModal?.({ type: "gameover" });
  }
}

function resolveSafeStomp(scene: SceneLike, expectedToken: number, bossX: number, bossY: number) {
  // Every state check happens before touching Phaser objects. If anything changed,
  // the stomp simply disappears instead of running against stale scene objects.
  if (expectedToken !== Number(scene.__wardenSafeStompToken ?? 0) || !ready(scene)) {
    destroyRing(scene);
    scene.__wardenSafeStompCharging = false;
    return;
  }

  destroyRing(scene);
  scene.__wardenSafeStompCharging = false;
  scene.__wardenSafeNextStompAt = scene.time.now + SAFE_STOMP_EVERY;
  scene.__wardenRecoveryUntil = scene.time.now + SAFE_STOMP_RECOVERY;

  // Static impact ring + short alpha fade: deliberately avoids animating radius,
  // which removes one more moving part from the crash-prone stomp path.
  const impact = scene.add
    .circle(bossX, bossY, SAFE_STOMP_RADIUS, 0x6fd3e8, 0.12)
    .setStrokeStyle(4, 0xc8f8ff, 0.95)
    .setDepth(970);
  scene.tweens.add({
    targets: impact,
    alpha: 0,
    duration: 260,
    ease: "Quad.easeOut",
    onComplete: () => {
      try { impact.destroy(); } catch { /* scene already disposed */ }
    },
  });

  scene.spawnSparkle?.(bossX, bossY, 0x8feeff, 12);
  scene.floatText?.(bossX, bossY - 30, "EXHAUSTED", "#c9f8ff", true);
  applySafeDamage(scene, bossX, bossY);
}

function startSafeStomp(scene: SceneLike) {
  if (!ready(scene) || scene.__wardenSafeStompCharging || scene.__wardenWaterCharging) return;
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | undefined;
  if (!boss?.active) return;

  cancelSafeStomp(scene, false);
  scene.__wardenSafeStompCharging = true;
  const expectedToken = Number(scene.__wardenSafeStompToken ?? 0);
  const bossX = boss.x;
  const bossY = boss.y;
  boss.setVelocity?.(0, 0);

  const ring = scene.add
    .circle(bossX, bossY, SAFE_STOMP_RADIUS, 0x6fd3e8, 0.035)
    .setStrokeStyle(4, 0xbff7ff, 0.98)
    .setDepth(965);
  scene.__wardenSafeStompRing = ring;
  scene.tweens.add({
    targets: ring,
    alpha: { from: 0.22, to: 0.72 },
    duration: 220,
    yoyo: true,
    repeat: 2,
    ease: "Sine.easeInOut",
  });

  scene.__wardenSafeStompTimer = scene.time.delayedCall(SAFE_STOMP_TELEGRAPH, () => {
    scene.__wardenSafeStompTimer = undefined;
    resolveSafeStomp(scene, expectedToken, bossX, bossY);
  });
}

function updateSafeStomp(scene: SceneLike, time: number) {
  if (!isWarden(scene)) {
    if (scene.__wardenSafeStompCharging || scene.__wardenSafeStompRing) cancelSafeStomp(scene);
    return;
  }

  // Completely disable both older Warden stomp schedulers. Water lanes, minion cap,
  // phase transition and recovery bonus from wardenCombat remain intact.
  scene.__bossStompNextAt = Number.MAX_SAFE_INTEGER;
  scene.__bossStompCharging = false;
  scene.__wardenNextStompAt = Number.MAX_SAFE_INTEGER;

  if (!ready(scene)) {
    if (scene.__wardenSafeStompCharging) cancelSafeStomp(scene);
    return;
  }

  if (!scene.__wardenSafeNextStompAt) scene.__wardenSafeNextStompAt = time + SAFE_STOMP_EVERY;
  if (scene.__wardenSafeStompCharging) {
    scene.boss?.setVelocity?.(0, 0);
    return;
  }
  if (time >= Number(scene.__wardenSafeNextStompAt)) startSafeStomp(scene);
}

export function installWardenStompSafety(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__wardenStompSafetyInstalled) return;
  proto.__wardenStompSafetyInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function wardenStompSafetyUpdate(this: SceneLike, time: number, delta: number, ...args: any[]) {
    if (isWarden(this)) {
      // Suppress the previous controller before it gets a chance to schedule a stomp.
      this.__wardenNextStompAt = Number.MAX_SAFE_INTEGER;
      this.__bossStompNextAt = Number.MAX_SAFE_INTEGER;
      this.__bossStompCharging = false;
    }
    const result = originalUpdate.call(this, time, delta, ...args);
    updateSafeStomp(this, time);
    return result;
  };

  const originalBossChoice = proto.onBossChoice;
  proto.onBossChoice = function wardenStompSafetyChoice(this: SceneLike, ...args: any[]) {
    const result = originalBossChoice.apply(this, args);
    if (isWarden(this) && this.bossPhase === 1) {
      cancelSafeStomp(this);
      this.__wardenSafeNextStompAt = this.time.now + SAFE_STOMP_EVERY;
    }
    return result;
  };

  const originalDefeat = proto.defeatActBoss;
  proto.defeatActBoss = function wardenStompSafetyDefeat(this: SceneLike, ...args: any[]) {
    if (isWarden(this)) cancelSafeStomp(this);
    return originalDefeat.apply(this, args);
  };

  const originalCreate = proto.create;
  proto.create = function wardenStompSafetyCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cancelSafeStomp(this));
    return result;
  };
}
