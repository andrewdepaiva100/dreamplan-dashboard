// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const WARDEN_NAME = "Warden of Rushing Water";
const STOMP_RADIUS = 76;
const STOMP_DAMAGE = 2;
const STOMP_TELEGRAPH_MS = 700;
const STOMP_EVERY_MS = 8000;
const STOMP_RECOVERY_MS = 2000;
const WATER_TELEGRAPH_MS = 900;
const WATER_EVERY_MS = 6500;
const TEMP_MOB_CAP = 4;

function isWarden(scene: SceneLike) {
  return scene.save?.current_zone === "sunlit_shores" && scene.bossName === WARDEN_NAME;
}

function combatReady(scene: SceneLike) {
  return Boolean(
    isWarden(scene) &&
      scene.boss?.active &&
      scene.player?.active &&
      scene.bossPhase === 1 &&
      !scene.bossTalking &&
      !scene.frozen,
  );
}

function token(scene: SceneLike) {
  return Number(scene.__wardenCombatToken ?? 0);
}

function tokenAlive(scene: SceneLike, expected: number) {
  return expected === token(scene) && combatReady(scene);
}

function destroyObject(obj: any) {
  try {
    if (obj?.active !== false) obj?.destroy?.();
  } catch {
    // A scene transition may already have disposed the object.
  }
}

function clearVisuals(scene: SceneLike) {
  destroyObject(scene.__wardenStompRing);
  scene.__wardenStompRing = undefined;
  for (const lane of (scene.__wardenWaterLanes ?? []) as any[]) destroyObject(lane);
  scene.__wardenWaterLanes = [];
}

function cleanupWarden(scene: SceneLike) {
  scene.__wardenCombatToken = token(scene) + 1;
  clearVisuals(scene);
  scene.__wardenStompCharging = false;
  scene.__wardenWaterCharging = false;
  scene.__wardenRecoveryUntil = 0;
  scene.__wardenPhaseTransitionUntil = 0;
  scene.__wardenNextStompAt = 0;
  scene.__wardenNextWaterAt = 0;
  scene.__wardenPhase2 = false;
  scene.__wardenReinforcementSent = false;
}

function activeTempMobs(scene: SceneLike) {
  const children = (scene.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[];
  return children.filter((e) => e?.active && e.getData?.("temp") === true);
}

function spawnCappedMinions(scene: SceneLike, requested = 2) {
  if (!combatReady(scene) || !scene.boss?.active) return;
  const current = activeTempMobs(scene).length;
  const slots = Math.max(0, TEMP_MOB_CAP - current);
  const count = Math.min(requested, slots);
  for (let i = 0; i < count; i++) {
    const a = ((i + current) / Math.max(1, count + current)) * Math.PI * 2;
    const e = scene.spawnEnemy?.(
      scene.boss.x + Math.cos(a) * 68,
      scene.boss.y + Math.sin(a) * 68,
      "enemy-rush",
      58,
      true,
    ) as Phaser.Physics.Arcade.Sprite | undefined;
    if (!e) continue;
    const lifeToken = token(scene);
    scene.time.delayedCall(7000, () => {
      if (lifeToken !== token(scene)) return;
      if (e.active) e.destroy();
    });
  }
}

function installSafeMinionTimer(scene: SceneLike) {
  if (!isWarden(scene)) return;
  scene.bossTimer?.remove?.();
  scene.bossTimer = scene.time.addEvent({
    delay: 5200,
    loop: true,
    callback: () => {
      if (!combatReady(scene)) return;
      spawnCappedMinions(scene, 2);
    },
  });
}

function damagePlayerByStomp(scene: SceneLike, bossX: number, bossY: number) {
  if (!scene.player?.active || !scene.save) return;
  if (scene.time.now < Number(scene.invulnUntil ?? 0)) return;
  const d = Phaser.Math.Distance.Between(bossX, bossY, scene.player.x, scene.player.y);
  if (d > STOMP_RADIUS) {
    scene.floatText?.(scene.player.x, scene.player.y - 14, "DODGED!", "#bff7ff", true);
    return;
  }

  const a = Math.atan2(scene.player.y - bossY, scene.player.x - bossX);
  scene.invulnUntil = scene.time.now + 1300;
  scene.save.player_health = Math.max(0, Number(scene.save.player_health ?? 5) - STOMP_DAMAGE);
  scene.vel = scene.vel ?? { x: 0, y: 0 };
  scene.vel.x = Math.cos(a) * 300;
  scene.vel.y = Math.sin(a) * 300;
  scene.player.setVelocity?.(scene.vel.x, scene.vel.y);
  scene.player.setTint?.(0xff8f8f);
  const expected = token(scene);
  scene.time.delayedCall(240, () => {
    if (expected !== token(scene)) return;
    if (scene.player?.active) scene.player.clearTint?.();
  });
  scene.floatText?.(scene.player.x, scene.player.y - 12, `-${STOMP_DAMAGE} ♥`, "#ff8f8f", true);
  scene.emitSave?.();
  scene.pushHud?.(true);
  if (scene.save.player_health <= 0) {
    cleanupWarden(scene);
    scene.openModal?.({ type: "gameover" });
  }
}

function executeStomp(scene: SceneLike, expected: number) {
  if (!tokenAlive(scene, expected)) {
    destroyObject(scene.__wardenStompRing);
    scene.__wardenStompRing = undefined;
    scene.__wardenStompCharging = false;
    return;
  }
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite;
  const bossX = boss.x;
  const bossY = boss.y;

  destroyObject(scene.__wardenStompRing);
  scene.__wardenStompRing = undefined;
  scene.__wardenStompCharging = false;
  scene.__wardenRecoveryUntil = scene.time.now + STOMP_RECOVERY_MS;
  scene.__wardenNextStompAt = scene.time.now + STOMP_EVERY_MS;

  const impact = scene.add
    .circle(bossX, bossY, 18, 0x6fd3e8, 0.28)
    .setStrokeStyle(4, 0xc8f8ff, 0.95)
    .setDepth(970);
  scene.tweens.add({
    targets: impact,
    radius: STOMP_RADIUS,
    alpha: 0,
    duration: 360,
    ease: "Quad.easeOut",
    onComplete: () => destroyObject(impact),
  });
  scene.cameras?.main?.shake?.(180, 0.008);
  scene.spawnSparkle?.(bossX, bossY, 0x8feeff, 16);
  damagePlayerByStomp(scene, bossX, bossY);

  if (scene.boss?.active) {
    scene.boss.setVelocity?.(0, 0);
    scene.boss.setTint?.(0xa9e9f2);
    scene.floatText?.(scene.boss.x, scene.boss.y - 30, "EXHAUSTED", "#c9f8ff", true);
    scene.time.delayedCall(STOMP_RECOVERY_MS, () => {
      if (!tokenAlive(scene, expected)) return;
      scene.boss?.clearTint?.();
    });
  }
}

function startStomp(scene: SceneLike) {
  if (!combatReady(scene) || scene.__wardenWaterCharging || scene.__wardenStompCharging) return;
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite;
  const expected = token(scene);
  scene.__wardenStompCharging = true;
  boss.setVelocity?.(0, 0);

  const ring = scene.add
    .circle(boss.x, boss.y, 18, 0x6fd3e8, 0.08)
    .setStrokeStyle(4, 0xbff7ff, 0.95)
    .setDepth(965);
  scene.__wardenStompRing = ring;
  scene.tweens.add({
    targets: ring,
    radius: STOMP_RADIUS,
    alpha: { from: 0.78, to: 0.18 },
    duration: STOMP_TELEGRAPH_MS,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: boss,
    scaleX: (boss.scaleX || 1) * 1.12,
    scaleY: (boss.scaleY || 1) * 0.9,
    duration: 170,
    yoyo: true,
    repeat: 1,
  });
  scene.time.delayedCall(STOMP_TELEGRAPH_MS, () => executeStomp(scene, expected));
}

function laneHit(scene: SceneLike, orientation: "vertical" | "horizontal", positions: number[], halfWidth: number) {
  if (!scene.player?.active) return false;
  const value = orientation === "vertical" ? scene.player.x : scene.player.y;
  return positions.some((p) => Math.abs(value - p) <= halfWidth);
}

function executeWaterLanes(
  scene: SceneLike,
  expected: number,
  orientation: "vertical" | "horizontal",
  positions: number[],
) {
  if (!tokenAlive(scene, expected)) {
    for (const lane of (scene.__wardenWaterLanes ?? []) as any[]) destroyObject(lane);
    scene.__wardenWaterLanes = [];
    scene.__wardenWaterCharging = false;
    return;
  }

  const lanes = (scene.__wardenWaterLanes ?? []) as Phaser.GameObjects.Rectangle[];
  scene.__wardenWaterLanes = [];
  scene.__wardenWaterCharging = false;
  scene.__wardenNextWaterAt = scene.time.now + WATER_EVERY_MS;

  for (const lane of lanes) {
    if (!lane?.active) continue;
    lane.setFillStyle(0x61d9f4, 0.52).setStrokeStyle(3, 0xc9f8ff, 0.95);
    scene.tweens.add({
      targets: lane,
      alpha: 0,
      duration: 330,
      ease: "Quad.easeOut",
      onComplete: () => destroyObject(lane),
    });
  }
  scene.cameras?.main?.shake?.(120, 0.004);

  if (laneHit(scene, orientation, positions, 18)) {
    scene.hurtPlayerDirect?.();
  } else {
    scene.floatText?.(scene.player.x, scene.player.y - 12, "CLEAR!", "#bff7ff");
  }
}

function startWaterLanes(scene: SceneLike) {
  if (!combatReady(scene) || scene.__wardenStompCharging || scene.__wardenWaterCharging) return;
  const expected = token(scene);
  const vertical = (Number(scene.__wardenWaterPattern ?? 0) % 2) === 0;
  scene.__wardenWaterPattern = Number(scene.__wardenWaterPattern ?? 0) + 1;
  const orientation: "vertical" | "horizontal" = vertical ? "vertical" : "horizontal";
  const center = vertical ? scene.player.x : scene.player.y;
  const positions = [center - 88, center, center + 88];
  const worldW = Number(scene.mapW ?? 55) * 32;
  const worldH = Number(scene.mapH ?? 50) * 32;
  const lanes: Phaser.GameObjects.Rectangle[] = [];

  for (const p of positions) {
    const lane = vertical
      ? scene.add.rectangle(p, scene.boss.y, 36, Math.min(900, worldH - 40), 0x54cfe9, 0.12)
      : scene.add.rectangle(scene.boss.x, p, Math.min(900, worldW - 40), 36, 0x54cfe9, 0.12);
    lane.setStrokeStyle(2, 0x9cecff, 0.85).setDepth(962);
    lanes.push(lane);
    scene.tweens.add({
      targets: lane,
      alpha: { from: 0.12, to: 0.34 },
      duration: 260,
      yoyo: true,
      repeat: 2,
    });
  }
  scene.__wardenWaterLanes = lanes;
  scene.__wardenWaterCharging = true;
  scene.floatText?.(scene.boss.x, scene.boss.y - 34, "CURRENT SURGE", "#9cecff", true);
  scene.time.delayedCall(WATER_TELEGRAPH_MS, () => executeWaterLanes(scene, expected, orientation, positions));
}

function enterPhaseTwo(scene: SceneLike) {
  if (!combatReady(scene) || scene.__wardenPhase2) return;
  scene.__wardenPhase2 = true;
  scene.__wardenPhaseTransitionUntil = scene.time.now + 900;
  scene.emitToast?.("THE CURRENT TURNS VIOLENT");
  scene.cameras?.main?.flash?.(260, 105, 210, 235);
  scene.cameras?.main?.shake?.(180, 0.006);
  if (scene.boss?.active) {
    const pulse = scene.add
      .circle(scene.boss.x, scene.boss.y, 38, 0x5ed8ee, 0.16)
      .setStrokeStyle(4, 0xc8f8ff, 0.9)
      .setDepth(968);
    scene.tweens.add({
      targets: pulse,
      radius: 120,
      alpha: 0,
      duration: 700,
      onComplete: () => destroyObject(pulse),
    });
  }
  if (!scene.__wardenReinforcementSent) {
    scene.__wardenReinforcementSent = true;
    spawnCappedMinions(scene, 2);
  }
}

function updateWarden(scene: SceneLike, time: number) {
  if (!isWarden(scene)) return;

  // Suppress the older generic Act I stomp controller. Act IV still keeps it.
  scene.__bossStompNextAt = Number.MAX_SAFE_INTEGER;
  if (scene.__bossStompCharging) scene.__bossStompCharging = false;
  if (scene.__bossStompRing) {
    destroyObject(scene.__bossStompRing);
    scene.__bossStompRing = undefined;
  }

  // Do not alter normal roaming enemies before the Warden dialogue. They now
  // continue using the base scene's standard movement/AI exactly as usual.
  if (!combatReady(scene)) return;

  if (!scene.__wardenNextStompAt) scene.__wardenNextStompAt = time + STOMP_EVERY_MS;
  if (!scene.__wardenNextWaterAt) scene.__wardenNextWaterAt = time + 4000;

  const recovering = time < Number(scene.__wardenRecoveryUntil ?? 0);
  const transitioning = time < Number(scene.__wardenPhaseTransitionUntil ?? 0);
  if (recovering || transitioning || scene.__wardenStompCharging) {
    scene.boss?.setVelocity?.(0, 0);
  } else if (scene.__wardenPhase2 && scene.boss?.body?.velocity) {
    scene.boss.body.velocity.x *= 1.18;
    scene.boss.body.velocity.y *= 1.18;
  }

  if (scene.__wardenStompCharging || scene.__wardenWaterCharging || recovering || transitioning) return;

  if (time >= Number(scene.__wardenNextStompAt)) {
    startStomp(scene);
    return;
  }

  if (time >= Number(scene.__wardenNextWaterAt)) {
    const untilStomp = Number(scene.__wardenNextStompAt) - time;
    if (untilStomp < 1800) scene.__wardenNextWaterAt = Number(scene.__wardenNextStompAt) + 1700;
    else startWaterLanes(scene);
  }
}

export function installWardenCombat(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__wardenCombatInstalled) return;
  proto.__wardenCombatInstalled = true;

  const originalSpawnActBoss = proto.spawnActBoss;
  proto.spawnActBoss = function wardenSpawnActBoss(this: SceneLike, ...args: any[]) {
    const result = originalSpawnActBoss.apply(this, args);
    if (isWarden(this)) {
      cleanupWarden(this);
      installSafeMinionTimer(this);
    }
    return result;
  };

  const originalBossChoice = proto.onBossChoice;
  proto.onBossChoice = function wardenBossChoice(this: SceneLike, ...args: any[]) {
    const result = originalBossChoice.apply(this, args);
    if (isWarden(this) && this.bossPhase === 1) {
      this.__wardenCombatToken = token(this) + 1;
      this.__wardenNextStompAt = this.time.now + STOMP_EVERY_MS;
      this.__wardenNextWaterAt = this.time.now + 4000;
      this.__wardenPhase2 = false;
      this.__wardenReinforcementSent = false;
      this.__wardenStompCharging = false;
      this.__wardenWaterCharging = false;
      installSafeMinionTimer(this);
    }
    return result;
  };

  const originalDamageBoss = proto.damageBoss;
  proto.damageBoss = function wardenDamageBoss(this: SceneLike, amount: number, ...args: any[]) {
    const bonus = isWarden(this) && this.time.now < Number(this.__wardenRecoveryUntil ?? 0) ? 1.25 : 1;
    const result = originalDamageBoss.call(this, amount * bonus, ...args);
    if (combatReady(this) && !this.__wardenPhase2 && Number(this.bossHp) <= Number(this.bossMax) * 0.5) {
      enterPhaseTwo(this);
    }
    return result;
  };

  const originalDefeat = proto.defeatActBoss;
  proto.defeatActBoss = function wardenDefeat(this: SceneLike, ...args: any[]) {
    if (isWarden(this)) cleanupWarden(this);
    return originalDefeat.apply(this, args);
  };

  const originalUpdate = proto.update;
  proto.update = function wardenCombatUpdate(this: SceneLike, time: number, delta: number, ...args: any[]) {
    if (isWarden(this)) {
      this.__bossStompNextAt = Number.MAX_SAFE_INTEGER;
      this.__bossStompCharging = false;
      if (this.__bossStompRing) {
        destroyObject(this.__bossStompRing);
        this.__bossStompRing = undefined;
      }
    }
    const result = originalUpdate.call(this, time, delta, ...args);
    updateWarden(this, time);
    return result;
  };

  const originalCreate = proto.create;
  proto.create = function wardenCombatCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => cleanupWarden(this));
    return result;
  };
}
