// @ts-nocheck -- Narrow Act II boss presentation decorator for the Phaser quest scene.

const ZONE = "wedding_garden";
const BOSS_NAME = "The Stress Spectre";
const BOSS_ADD_TAG = "act2BossAdd";
const BOSS_ADD_SPEED = "act2BossAddSpeed";

type Season = {
  name: string;
  color: number;
  accent: number;
  message: string;
};

const SEASONS: Season[] = [
  { name: "Spring", color: 0x9dff70, accent: 0xf0b8cf, message: "Spring strains to begin." },
  { name: "Summer", color: 0xffd94a, accent: 0xffa85b, message: "Summer burns too brightly." },
  { name: "Autumn", color: 0xff9a3d, accent: 0xb86742, message: "Autumn refuses to let go." },
  { name: "Winter", color: 0x8fd4ff, accent: 0xd9f3ff, message: "Winter holds the garden still." },
];

function isStressSpectre(scene: any) {
  return scene?.save?.current_zone === ZONE && scene?.bossName === BOSS_NAME;
}

function phaseIndex(scene: any) {
  const max = Math.max(1, Number(scene?.bossMax) || 1);
  const ratio = Math.max(0, Math.min(1, (Number(scene?.bossHp) || 0) / max));
  if (ratio > 0.75) return 0;
  if (ratio > 0.5) return 1;
  if (ratio > 0.25) return 2;
  return 3;
}

function destroyFx(scene: any) {
  const fx = scene.__act2BossFx;
  if (!fx) return;
  fx.attackTimer?.remove?.();
  fx.pulseTimer?.remove?.();
  for (const obj of fx.objects ?? []) obj?.destroy?.();
  scene.__act2BossFx = undefined;
}

function addArenaBloom(scene: any, x: number, y: number) {
  const objects: any[] = [];
  const ring = scene.add.circle(x, y, 118, 0x2d1739, 0.18).setDepth(15);
  ring.setStrokeStyle(2, 0xb79cf0, 0.34);
  objects.push(ring);

  const petals: any[] = [];
  const colors = SEASONS.map((season) => season.color);
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const radius = 82 + (i % 3) * 13;
    const petal = scene.add
      .ellipse(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius, 7, 3, colors[i % 4], 0.42)
      .setDepth(16)
      .setRotation(angle);
    petals.push(petal);
    objects.push(petal);
  }

  scene.tweens.add({
    targets: petals,
    alpha: { from: 0.22, to: 0.58 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
  return { ring, petals, objects };
}

function revealBoss(scene: any) {
  if (!scene.boss?.active || scene.__act2BossFx) return;
  const boss = scene.boss;
  const arena = addArenaBloom(scene, boss.x, boss.y);
  const objects = [...arena.objects];

  const veil = scene.add
    .rectangle(scene.cameras.main.centerX, scene.cameras.main.centerY, scene.scale.width * 1.4, scene.scale.height * 1.4, 0x24172f, 0)
    .setScrollFactor(0)
    .setDepth(87);
  objects.push(veil);
  scene.tweens.add({ targets: veil, alpha: 0.18, duration: 240, yoyo: true, hold: 260, ease: "Sine.easeInOut" });
  scene.time.delayedCall(850, () => veil?.destroy?.());

  const title = scene.add
    .text(scene.cameras.main.centerX, scene.scale.height * 0.23, "THE STRESS SPECTRE", {
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "18px",
      color: "#f5e6ff",
      stroke: "#24172f",
      strokeThickness: 4,
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(94)
    .setAlpha(0);
  objects.push(title);
  scene.tweens.add({ targets: title, alpha: 1, y: title.y - 8, duration: 420, yoyo: true, hold: 620, ease: "Sine.easeOut" });
  scene.time.delayedCall(1600, () => title?.destroy?.());

  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const r = 70 + (i % 5) * 10;
    const mote = scene.add.circle(boss.x + Math.cos(a) * r, boss.y + Math.sin(a) * r, 2 + (i % 2), SEASONS[i % 4].color, 0.6).setDepth(18);
    objects.push(mote);
    scene.tweens.add({ targets: mote, x: boss.x, y: boss.y, alpha: 0, duration: 700 + (i % 4) * 90, ease: "Sine.easeIn" });
    scene.time.delayedCall(1200, () => mote?.destroy?.());
  }

  scene.__act2BossFx = { objects, arena, phase: -1, attackTimer: null, pulseTimer: null };
  applySeason(scene, true);

  // Keep the existing seasonal arena rhythm as presentation-only pressure.
  scene.__act2BossFx.attackTimer = scene.time.addEvent({
    delay: 3400,
    loop: true,
    callback: () => {
      if (!isStressSpectre(scene) || scene.bossPhase !== 1 || !scene.boss?.active || scene.frozen) return;
      seasonalTelegraph(scene, phaseIndex(scene));
    },
  });

  // One simple extra attack: a slow, clearly telegraphed pulse around the boss.
  scene.__act2BossFx.pulseTimer = scene.time.addEvent({
    delay: 6500,
    loop: true,
    callback: () => {
      if (!isStressSpectre(scene) || scene.bossPhase !== 1 || !scene.boss?.active || scene.frozen) return;
      seasonalPulse(scene);
    },
  });
}

function applySeason(scene: any, announce = false) {
  const fx = scene.__act2BossFx;
  if (!fx || !scene.boss?.active) return;
  const index = phaseIndex(scene);
  if (fx.phase === index && !announce) return;
  fx.phase = index;
  const season = SEASONS[index];

  scene.boss.setTint(season.color);
  scene.bossHalo?.setFillStyle?.(season.color, 0.2);
  scene.bossHalo?.setStrokeStyle?.(2, season.accent, 0.32);
  fx.arena?.ring?.setFillStyle?.(season.color, 0.09);
  fx.arena?.ring?.setStrokeStyle?.(2, season.accent, 0.32);

  for (let i = 0; i < (fx.arena?.petals?.length ?? 0); i++) {
    const p = fx.arena.petals[i];
    p?.setFillStyle?.(i % 2 ? season.color : season.accent, 0.5);
  }

  if (!announce) {
    scene.emitToast?.(`${season.name} turns through the Conservatory — ${season.message}`);
    scene.cameras.main.flash(180,
      (season.color >> 16) & 0xff,
      (season.color >> 8) & 0xff,
      season.color & 0xff,
      false,
      undefined,
      0.12,
    );
  }
}

function seasonalTelegraph(scene: any, index: number) {
  const boss = scene.boss;
  if (!boss?.active) return;
  const season = SEASONS[index];
  const objects = scene.__act2BossFx?.objects ?? [];
  const radius = index === 0 ? 56 : index === 1 ? 68 : index === 2 ? 76 : 62;
  const ring = scene.add.circle(boss.x, boss.y, radius, season.color, 0.035).setDepth(16);
  ring.setStrokeStyle(2, season.accent, 0.55);
  objects.push(ring);
  scene.tweens.add({ targets: ring, scale: 1.55, alpha: 0, duration: 980, ease: "Sine.easeOut" });
  scene.time.delayedCall(1050, () => ring?.destroy?.());

  const count = index === 2 ? 10 : 8;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + index * 0.35;
    const mark = scene.add
      .ellipse(boss.x + Math.cos(a) * radius, boss.y + Math.sin(a) * radius * 0.65, index === 3 ? 8 : 6, index === 3 ? 3 : 5, i % 2 ? season.color : season.accent, 0.48)
      .setDepth(16)
      .setRotation(a);
    objects.push(mark);
    scene.tweens.add({ targets: mark, alpha: 0, scale: 1.5, duration: 1050, ease: "Sine.easeOut" });
    scene.time.delayedCall(1120, () => mark?.destroy?.());
  }
}

function seasonalPulse(scene: any) {
  const boss = scene.boss;
  const player = scene.player;
  if (!boss?.active || !player?.active) return;
  const season = SEASONS[phaseIndex(scene)];
  const startX = boss.x;
  const startY = boss.y;
  const ring = scene.add.circle(startX, startY, 28, season.color, 0.04).setDepth(18);
  ring.setStrokeStyle(3, season.accent, 0.9);
  scene.__act2BossFx?.objects?.push?.(ring);
  scene.tweens.add({ targets: ring, scale: 4.3, alpha: 0.28, duration: 800, ease: "Sine.easeOut" });

  scene.time.delayedCall(800, () => {
    if (!isStressSpectre(scene) || scene.bossPhase !== 1 || !scene.boss?.active || scene.frozen) {
      ring?.destroy?.();
      return;
    }
    const dist = Math.hypot(player.x - startX, player.y - startY);
    if (dist <= 120) scene.hurtPlayerDirect?.();
    const burst = scene.add.circle(startX, startY, 120, season.color, 0.08).setDepth(17);
    burst.setStrokeStyle(2, season.accent, 0.5);
    scene.tweens.add({ targets: burst, alpha: 0, scale: 1.08, duration: 260, ease: "Sine.easeOut" });
    scene.time.delayedCall(320, () => burst?.destroy?.());
    ring?.destroy?.();
  });
}

function keepBossAddsMoving(scene: any) {
  if (!isStressSpectre(scene) || scene.bossPhase !== 1 || !scene.boss?.active || !scene.player?.active) return;
  const adds = scene.enemies?.getChildren?.() ?? [];
  for (const e of adds) {
    if (!e?.active || e.getData?.(BOSS_ADD_TAG) !== true || !e.body?.enable) continue;
    const vx = Number(e.body?.velocity?.x) || 0;
    const vy = Number(e.body?.velocity?.y) || 0;
    if (Math.hypot(vx, vy) > 2) continue;
    const dx = scene.player.x - e.x;
    const dy = scene.player.y - e.y;
    const dist = Math.hypot(dx, dy);
    if (dist <= 18) continue;
    const speed = Math.max(30, Number(e.getData?.(BOSS_ADD_SPEED)) || 62);
    e.setVelocity((dx / dist) * speed, (dy / dist) * speed);
    e.setFlipX?.(dx < 0);
  }
}

function seasonalBoltAccent(scene: any) {
  if (!scene.__act2BossFx || !scene.boss?.active) return;
  const season = SEASONS[phaseIndex(scene)];
  const boss = scene.boss;
  const halo = scene.add.circle(boss.x, boss.y, 24, season.color, 0.1).setDepth(18);
  halo.setStrokeStyle(2, season.accent, 0.7);
  scene.tweens.add({ targets: halo, scale: 2.1, alpha: 0, duration: 430, ease: "Sine.easeOut" });
  scene.time.delayedCall(500, () => halo?.destroy?.());
}

function finale(scene: any, x: number, y: number) {
  const fx = scene.__act2BossFx;
  fx?.attackTimer?.remove?.();
  fx?.pulseTimer?.remove?.();
  if (fx?.arena?.ring) {
    scene.tweens.add({ targets: fx.arena.ring, alpha: 0.22, scale: 1.14, duration: 500, yoyo: true, ease: "Sine.easeInOut" });
  }
  for (let i = 0; i < 28; i++) {
    const season = SEASONS[i % 4];
    const a = (i / 28) * Math.PI * 2;
    const petal = scene.add.ellipse(x, y, 7, 4, season.color, 0.8).setDepth(20).setRotation(a);
    const r = 60 + (i % 7) * 9;
    scene.tweens.add({
      targets: petal,
      x: x + Math.cos(a) * r,
      y: y + Math.sin(a) * r * 0.68,
      alpha: 0,
      rotation: a + 1.2,
      duration: 900 + (i % 5) * 80,
      ease: "Sine.easeOut",
    });
    scene.time.delayedCall(1400, () => petal?.destroy?.());
  }
  const bloom = scene.add.circle(x, y, 16, 0xffe8b0, 0.32).setDepth(19);
  scene.tweens.add({ targets: bloom, scale: 7, alpha: 0, duration: 900, ease: "Sine.easeOut" });
  scene.time.delayedCall(1000, () => bloom?.destroy?.());
  scene.time.delayedCall(1700, () => destroyFx(scene));
}

export function installAct2BossRemaster(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2BossRemasterInstalled) return;
  proto.__act2BossRemasterInstalled = true;

  const originalSpawnActBoss = proto.spawnActBoss;
  proto.spawnActBoss = function act2BossRemasterSpawn(...args: any[]) {
    const result = originalSpawnActBoss.apply(this, args);
    if (isStressSpectre(this) && this.boss?.active) revealBoss(this);
    return result;
  };

  const originalSpawnEnemy = proto.spawnEnemy;
  proto.spawnEnemy = function act2BossRemasterEnemy(x: number, y: number, key: string, speed: number, temp: boolean) {
    const result = originalSpawnEnemy.call(this, x, y, key, speed, temp);
    if (result && temp === true && isStressSpectre(this) && this.bossPhase === 1) {
      result.setData?.(BOSS_ADD_TAG, true);
      result.setData?.(BOSS_ADD_SPEED, speed);
    }
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function act2BossRemasterUpdate(...args: any[]) {
    const result = originalUpdate?.apply(this, args);
    keepBossAddsMoving(this);
    return result;
  };

  const originalDamageBoss = proto.damageBoss;
  proto.damageBoss = function act2BossRemasterDamage(amount: number) {
    const wasStress = isStressSpectre(this) && this.boss?.active;
    const result = originalDamageBoss.call(this, amount);
    if (wasStress && this.boss?.active) {
      this.time?.delayedCall?.(140, () => {
        if (isStressSpectre(this) && this.boss?.active) applySeason(this);
      });
    }
    return result;
  };

  const originalFireBossBolt = proto.fireBossBolt;
  proto.fireBossBolt = function act2BossRemasterBolt(shot: any) {
    if (isStressSpectre(this) && this.bossPhase === 1) seasonalBoltAccent(this);
    return originalFireBossBolt.call(this, shot);
  };

  const originalDefeatActBoss = proto.defeatActBoss;
  proto.defeatActBoss = function act2BossRemasterDefeat(...args: any[]) {
    const wasStress = isStressSpectre(this) && this.boss?.active;
    const x = this.boss?.x ?? this.player?.x ?? 0;
    const y = this.boss?.y ?? this.player?.y ?? 0;
    if (wasStress) finale(this, x, y);
    return originalDefeatActBoss.apply(this, args);
  };

  const originalCreate = proto.create;
  proto.create = function act2BossRemasterCreate(...args: any[]) {
    destroyFx(this);
    const result = originalCreate.apply(this, args);
    this.events?.once?.("shutdown", () => destroyFx(this));
    return result;
  };
}
