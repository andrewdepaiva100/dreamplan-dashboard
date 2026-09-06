// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const WARDEN_NAME = "Warden of Rushing Water";
const TIDAL_EVERY_MS = 8000;
const TIDAL_TELEGRAPH_MS = 1000;
const TIDAL_RECOVERY_MS = 1800;
const RING_HALF_WIDTH = 14;

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

function destroy(obj: any) {
  try {
    obj?.destroy?.();
  } catch {
    // Scene transition may have already disposed it.
  }
}

function disableEveryWardenStomp(scene: SceneLike) {
  scene.__bossStompNextAt = Number.MAX_SAFE_INTEGER;
  scene.__bossStompCharging = false;
  if (scene.__bossStompRing) {
    destroy(scene.__bossStompRing);
    scene.__bossStompRing = undefined;
  }

  scene.__wardenNextStompAt = Number.MAX_SAFE_INTEGER;
  scene.__wardenStompCharging = false;
  if (scene.__wardenStompRing) {
    destroy(scene.__wardenStompRing);
    scene.__wardenStompRing = undefined;
  }

  scene.__wardenSafeNextStompAt = Number.MAX_SAFE_INTEGER;
  scene.__wardenSafeStompCharging = false;
  try {
    scene.__wardenSafeStompTimer?.remove?.(false);
  } catch {
    // no-op
  }
  scene.__wardenSafeStompTimer = undefined;
  if (scene.__wardenSafeStompRing) {
    destroy(scene.__wardenSafeStompRing);
    scene.__wardenSafeStompRing = undefined;
  }
}

function clearTidal(scene: SceneLike, resetClock = true) {
  scene.__wardenTidalToken = Number(scene.__wardenTidalToken ?? 0) + 1;
  try {
    scene.__wardenTidalTimer?.remove?.(false);
  } catch {
    // no-op
  }
  scene.__wardenTidalTimer = undefined;
  for (const ring of (scene.__wardenTidalRings ?? []) as any[]) destroy(ring);
  scene.__wardenTidalRings = [];
  scene.__wardenTidalCharging = false;
  if (resetClock) scene.__wardenNextTidalAt = 0;
}

function clearPhaseAura(scene: SceneLike) {
  for (const aura of (scene.__wardenPhaseAura ?? []) as any[]) destroy(aura);
  scene.__wardenPhaseAura = [];
  scene.__wardenPhaseAuraAnnounced = false;
  scene.__wardenPhaseAuraSparkAt = 0;
}

function updatePhaseAura(scene: SceneLike, time: number) {
  if (!ready(scene) || !scene.__wardenPhase2 || !scene.boss?.active) {
    if (scene.__wardenPhaseAura?.length) clearPhaseAura(scene);
    return;
  }

  const boss = scene.boss as Phaser.Physics.Arcade.Sprite;
  let aura = (scene.__wardenPhaseAura ?? []) as Phaser.GameObjects.Arc[];
  if (!aura.length || aura.some((ring) => !ring?.active)) {
    for (const ring of aura) destroy(ring);
    const inner = scene.add
      .circle(boss.x, boss.y, 42, 0x54cfe9, 0.035)
      .setStrokeStyle(3, 0x8feeff, 0.72)
      .setDepth(958);
    const outer = scene.add
      .circle(boss.x, boss.y, 62, 0x54cfe9, 0.015)
      .setStrokeStyle(2, 0xc8f8ff, 0.5)
      .setDepth(957);
    aura = [inner, outer];
    scene.__wardenPhaseAura = aura;
    scene.tweens.add({
      targets: inner,
      scaleX: { from: 0.94, to: 1.08 },
      scaleY: { from: 0.94, to: 1.08 },
      alpha: { from: 0.38, to: 0.78 },
      duration: 760,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    scene.tweens.add({
      targets: outer,
      scaleX: { from: 1.06, to: 0.96 },
      scaleY: { from: 1.06, to: 0.96 },
      alpha: { from: 0.22, to: 0.58 },
      duration: 980,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  for (const ring of aura) ring?.setPosition?.(boss.x, boss.y);

  if (!scene.__wardenPhaseAuraAnnounced) {
    scene.__wardenPhaseAuraAnnounced = true;
    scene.floatText?.(boss.x, boss.y - 40, "THE TIDE RISES", "#9cecff", true);
    scene.cameras?.main?.flash?.(180, 80, 190, 225);
  }

  if (time >= Number(scene.__wardenPhaseAuraSparkAt ?? 0)) {
    scene.__wardenPhaseAuraSparkAt = time + 900;
    scene.spawnSparkle?.(
      boss.x + Phaser.Math.Between(-22, 22),
      boss.y + Phaser.Math.Between(-18, 18),
      0x8feeff,
      3,
    );
  }
}

function currentRadii(scene: SceneLike) {
  return scene.__wardenPhase2 ? [58, 116, 176] : [76, 150];
}

function playerOnDangerBand(scene: SceneLike, bossX: number, bossY: number, radii: number[]) {
  const p = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!p?.active) return false;
  const d = Phaser.Math.Distance.Between(bossX, bossY, p.x, p.y);
  return radii.some((r) => Math.abs(d - r) <= RING_HALF_WIDTH);
}

function resolveTidal(scene: SceneLike, expectedToken: number, bossX: number, bossY: number, radii: number[]) {
  if (expectedToken !== Number(scene.__wardenTidalToken ?? 0) || !ready(scene)) {
    clearTidal(scene, false);
    return;
  }

  const rings = (scene.__wardenTidalRings ?? []) as Phaser.GameObjects.Arc[];
  scene.__wardenTidalRings = [];
  scene.__wardenTidalCharging = false;
  scene.__wardenTidalTimer = undefined;
  scene.__wardenNextTidalAt = scene.time.now + TIDAL_EVERY_MS;
  scene.__wardenRecoveryUntil = scene.time.now + TIDAL_RECOVERY_MS;

  for (const ring of rings) {
    if (!ring?.active) continue;
    ring.setStrokeStyle(8, 0xcdf9ff, 1).setFillStyle(0x62d8ee, 0.04);
    scene.tweens.add({
      targets: ring,
      alpha: 0,
      duration: 320,
      ease: "Quad.easeOut",
      onComplete: () => destroy(ring),
    });
  }

  scene.cameras?.main?.shake?.(110, 0.004);
  scene.spawnSparkle?.(bossX, bossY, 0x8feeff, 12);

  if (playerOnDangerBand(scene, bossX, bossY, radii)) {
    scene.hurtPlayerDirect?.();
  } else if (scene.player?.active) {
    scene.floatText?.(scene.player.x, scene.player.y - 12, "SAFE GAP", "#bff7ff", true);
  }

  if (scene.boss?.active) {
    scene.boss.setVelocity?.(0, 0);
    scene.boss.setTint?.(0xa9e9f2);
    scene.floatText?.(scene.boss.x, scene.boss.y - 30, "EXHAUSTED", "#c9f8ff", true);
    const token = Number(scene.__wardenTidalToken ?? 0);
    scene.time.delayedCall(TIDAL_RECOVERY_MS, () => {
      if (token !== Number(scene.__wardenTidalToken ?? 0)) return;
      if (scene.boss?.active) scene.boss.clearTint?.();
    });
  }
}

function startTidal(scene: SceneLike) {
  if (!ready(scene) || scene.__wardenTidalCharging || scene.__wardenWaterCharging) return;
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | undefined;
  if (!boss?.active) return;

  clearTidal(scene, false);
  scene.__wardenTidalCharging = true;
  boss.setVelocity?.(0, 0);

  const radii = currentRadii(scene);
  const bossX = boss.x;
  const bossY = boss.y;
  const expectedToken = Number(scene.__wardenTidalToken ?? 0);
  const rings: Phaser.GameObjects.Arc[] = [];

  for (const radius of radii) {
    const ring = scene.add
      .circle(bossX, bossY, radius, 0x61d9f4, 0.025)
      .setStrokeStyle(5, 0x9cecff, 0.86)
      .setDepth(965);
    rings.push(ring);
    scene.tweens.add({
      targets: ring,
      alpha: { from: 0.2, to: 0.8 },
      scaleX: { from: 0.96, to: 1.03 },
      scaleY: { from: 0.96, to: 1.03 },
      duration: 250,
      yoyo: true,
      repeat: 1,
      ease: "Sine.easeInOut",
    });
  }

  scene.__wardenTidalRings = rings;
  scene.floatText?.(bossX, bossY - 36, "TIDAL RINGS", "#9cecff", true);
  scene.__wardenTidalTimer = scene.time.delayedCall(TIDAL_TELEGRAPH_MS, () =>
    resolveTidal(scene, expectedToken, bossX, bossY, radii),
  );
}

function updateTidal(scene: SceneLike, time: number) {
  if (!isWarden(scene)) {
    if (scene.__wardenTidalCharging || scene.__wardenTidalRings?.length) clearTidal(scene);
    if (scene.__wardenPhaseAura?.length) clearPhaseAura(scene);
    return;
  }

  disableEveryWardenStomp(scene);
  updatePhaseAura(scene, time);
  if (!ready(scene)) {
    if (scene.__wardenTidalCharging) clearTidal(scene, false);
    return;
  }

  if (!scene.__wardenNextTidalAt) scene.__wardenNextTidalAt = time + TIDAL_EVERY_MS;
  if (scene.__wardenTidalCharging) {
    scene.boss?.setVelocity?.(0, 0);
    return;
  }

  const recovering = time < Number(scene.__wardenRecoveryUntil ?? 0);
  const transitioning = time < Number(scene.__wardenPhaseTransitionUntil ?? 0);
  if (recovering || transitioning || scene.__wardenWaterCharging) return;

  if (time >= Number(scene.__wardenNextTidalAt)) {
    const nextWater = Number(scene.__wardenNextWaterAt ?? 0);
    if (nextWater && Math.abs(nextWater - time) < 1500) {
      scene.__wardenNextTidalAt = time + 1700;
      return;
    }
    startTidal(scene);
  }
}

export function installWardenTidalRings(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__wardenTidalRingsInstalled) return;
  proto.__wardenTidalRingsInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function wardenTidalUpdate(this: SceneLike, time: number, delta: number, ...args: any[]) {
    if (isWarden(this)) disableEveryWardenStomp(this);
    const result = originalUpdate.call(this, time, delta, ...args);
    updateTidal(this, time);
    return result;
  };

  const originalBossChoice = proto.onBossChoice;
  proto.onBossChoice = function wardenTidalChoice(this: SceneLike, ...args: any[]) {
    const result = originalBossChoice.apply(this, args);
    if (isWarden(this) && this.bossPhase === 1) {
      disableEveryWardenStomp(this);
      clearTidal(this);
      clearPhaseAura(this);
      this.__wardenNextTidalAt = this.time.now + TIDAL_EVERY_MS;
    }
    return result;
  };

  const originalDefeat = proto.defeatActBoss;
  proto.defeatActBoss = function wardenTidalDefeat(this: SceneLike, ...args: any[]) {
    if (isWarden(this)) {
      clearTidal(this);
      clearPhaseAura(this);
    }
    return originalDefeat.apply(this, args);
  };

  const originalCreate = proto.create;
  proto.create = function wardenTidalCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      clearTidal(this);
      clearPhaseAura(this);
    });
    return result;
  };
}
