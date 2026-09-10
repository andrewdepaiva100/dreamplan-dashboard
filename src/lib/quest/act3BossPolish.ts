// @ts-nocheck -- Act III Clamour-only combat polish. Other bosses and progression stay untouched.
import * as Phaser from "phaser";
import { installAct3AndrewPresence } from "./act3AndrewPresence";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const CLAMOUR_NAME = "The Clamour of Doubt";
const SLOW_MULTIPLIER = 0.8;
const PULSE_INTERVAL = 5500;
const PULSE_WARNING = 850;
const PULSE_RADIUS = 130;
const FINALE_DURATION = 4400;

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
  clearPulseVisuals(scene);

  const boss = scene.boss;
  const x = boss.x;
  const y = boss.y;
  const depth = (boss.depth ?? 18) - 0.08;
  const outer = scene.add.circle(x, y, PULSE_RADIUS, 0xff9fc5, 0.045)
    .setStrokeStyle(4, 0xff9fc5, 0.9).setScale(0.18).setDepth(depth);
  const gold = scene.add.circle(x, y, PULSE_RADIUS * 0.78, 0xf3ce70, 0.035)
    .setStrokeStyle(2, 0xf3ce70, 0.78).setScale(0.18).setDepth(depth + 0.01);
  const core = scene.add.circle(x, y, 22, 0xff7dad, 0.18)
    .setStrokeStyle(2, 0xffd7e5, 0.8).setDepth(depth + 0.02);
  scene.act3DoubtPulseVisuals = [outer, gold, core];

  scene.tweens.add({ targets: outer, scale: 1, alpha: { from: 0.72, to: 0.12 }, duration: PULSE_WARNING, ease: "Sine.easeOut" });
  scene.tweens.add({ targets: gold, scale: 1, alpha: { from: 0.52, to: 0.08 }, duration: PULSE_WARNING, ease: "Sine.easeOut" });
  scene.tweens.add({ targets: core, scale: { from: 0.85, to: 1.35 }, alpha: { from: 0.28, to: 0.05 }, duration: PULSE_WARNING, ease: "Sine.easeOut" });

  scene.act3DoubtPulseWarning = scene.time.delayedCall(PULSE_WARNING, () => {
    scene.act3DoubtPulseWarning = undefined;
    clearPulseVisuals(scene);
    if (!clamourActive(scene) || scene.frozen || !scene.player?.active) return;
    const bx = scene.boss.x;
    const by = scene.boss.y;
    scene.spawnSparkle?.(bx, by, 0xff9fc5, 16);
    const dist = Phaser.Math.Distance.Between(bx, by, scene.player.x, scene.player.y);
    if (dist <= PULSE_RADIUS && typeof scene.hurtPlayerDirect === "function") scene.hurtPlayerDirect();
  });
}

function installPulseTimer(scene: SceneLike) {
  clearPulseSystem(scene);
  scene.act3DoubtPulseTimer = scene.time.addEvent({ delay: PULSE_INTERVAL, loop: true, callback: () => fireDoubtPulse(scene) });
  scene.events?.once?.(Phaser.Scenes.Events.SHUTDOWN, () => clearPulseSystem(scene));
}

function floatingLine(scene: SceneLike, target: any, line: string) {
  if (!target?.active) return;
  const text = scene.add.text(target.x, target.y - 48, line, {
    fontFamily: "Georgia, serif",
    fontSize: "14px",
    fontStyle: "bold italic",
    color: "#fff7fb",
    stroke: "#46628e",
    strokeThickness: 3,
    align: "center",
  }).setOrigin(0.5, 1).setDepth(980).setAlpha(0.98);
  scene.tweens.add({
    targets: text,
    y: text.y - 22,
    alpha: 0,
    duration: 1550,
    hold: 850,
    ease: "Sine.easeOut",
    onComplete: () => text.destroy(),
  });
}

function brokenNotes(scene: SceneLike, x: number, y: number) {
  const glyphs = ["♪", "♫", "♩", "♪", "♫", "♩", "♪", "♫"];
  glyphs.forEach((glyph, i) => {
    const note = scene.add.text(x + Phaser.Math.Between(-18, 18), y + Phaser.Math.Between(-14, 12), glyph, {
      fontFamily: "Georgia, serif",
      fontSize: i % 3 === 0 ? "17px" : "13px",
      color: i % 2 ? "#8e78a9" : "#c96d94",
      stroke: "#332941",
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(975).setAlpha(0.9);
    const a = (i / glyphs.length) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.2, 0.2);
    scene.tweens.add({
      targets: note,
      x: x + Math.cos(a) * Phaser.Math.Between(65, 125),
      y: y + Math.sin(a) * Phaser.Math.Between(45, 95) - 18,
      angle: Phaser.Math.Between(-75, 75),
      alpha: 0,
      scale: 0.55,
      duration: Phaser.Math.Between(900, 1350),
      ease: "Sine.easeOut",
      onComplete: () => note.destroy(),
    });
  });
}

function cleanMelody(scene: SceneLike, maria: any, andrew: any) {
  if (!maria?.active || !andrew?.active) return;
  const glyphs = ["♪", "♫", "♪", "♩", "♫"];
  glyphs.forEach((glyph, i) => {
    scene.time.delayedCall(i * 180, () => {
      if (!scene.sys?.isActive?.() || !maria.active || !andrew.active) return;
      const sx = maria.x + (i % 2 ? 7 : -7);
      const sy = maria.y - 26;
      const note = scene.add.text(sx, sy, glyph, {
        fontFamily: "Georgia, serif",
        fontSize: i % 2 ? "15px" : "13px",
        color: i % 2 ? "#86bfff" : "#ff9fbd",
        stroke: "#fff2d2",
        strokeThickness: 1,
      }).setOrigin(0.5).setDepth(978).setAlpha(0.96);
      scene.tweens.add({
        targets: note,
        x: andrew.x + (i % 2 ? -8 : 8),
        y: andrew.y - 30 - (i % 3) * 5,
        alpha: 0,
        duration: 760,
        ease: "Sine.easeInOut",
        onComplete: () => note.destroy(),
      });
    });
  });
}

function playClamourFinale(scene: SceneLike, originalDefeatBoss: (...args: any[]) => any, args: any[]) {
  if (scene.__act3ClamourFinaleRunning) return;
  scene.__act3ClamourFinaleRunning = true;
  clearPulseSystem(scene);

  const boss = scene.boss;
  const bx = boss?.x ?? scene.player?.x ?? 0;
  const by = boss?.y ?? scene.player?.y ?? 0;
  const maria = scene.player;
  const andrew = scene.companion;

  // Stop combat immediately, but defer the established defeat/reward cleanup
  // until the presentation ends. This keeps damage/progression semantics intact.
  scene.bossPhase = 3;
  boss?.setVelocity?.(0, 0);
  scene.bossTimer?.remove?.();
  scene.bossTimer = undefined;
  scene.frozen = true;
  scene.physics?.pause?.();
  maria?.setVelocity?.(0, 0);

  if (boss?.active) {
    brokenNotes(scene, bx, by);
    scene.spawnSparkle?.(bx, by, 0x8e78a9, 14);
    scene.spawnSparkle?.(bx, by, 0xff8fb8, 10);
    scene.tweens.add({
      targets: boss,
      alpha: 0.12,
      scaleX: boss.scaleX * 0.72,
      scaleY: boss.scaleY * 0.72,
      angle: { from: -3, to: 3 },
      duration: 1150,
      ease: "Sine.easeIn",
    });
  }

  // A brief visual silence after the Clamour breaks.
  scene.time.delayedCall(1350, () => {
    if (!scene.sys?.isActive?.()) return;
    scene.cameras?.main?.flash?.(520, 255, 232, 214);
    scene.spawnSparkle?.(bx, by, 0xf5d889, 22);
    scene.spawnSparkle?.(bx, by, 0xffb5cf, 18);

    if (andrew?.active && maria?.active) {
      const dx = maria.x - andrew.x;
      const dy = maria.y - andrew.y;
      const d = Math.max(1, Math.hypot(dx, dy));
      const travel = Math.max(0, Math.min(54, d - 42));
      const tx = andrew.x + (dx / d) * travel;
      const ty = andrew.y + (dy / d) * travel;
      scene.tweens.add({
        targets: andrew,
        x: tx,
        y: ty,
        duration: 780,
        ease: "Sine.easeInOut",
        onUpdate: () => andrew.setDepth?.(scene.dsort?.(andrew.y) ?? andrew.depth),
      });
      cleanMelody(scene, maria, andrew);
    }
  });

  scene.time.delayedCall(2450, () => {
    if (!scene.sys?.isActive?.()) return;
    if (andrew?.active) {
      if (maria?.active) andrew.setFlipX?.(maria.x < andrew.x);
      floatingLine(scene, andrew, "There you are. I could hear our song through all that noise.");
      scene.spawnSparkle?.(andrew.x, andrew.y - 12, 0x86bfff, 7);
      scene.spawnSparkle?.(maria?.x ?? andrew.x, (maria?.y ?? andrew.y) - 12, 0xff9fbd, 7);
    }
  });

  scene.time.delayedCall(FINALE_DURATION, () => {
    if (!scene.sys?.isActive?.()) return;
    // Restore the boss to a harmless visible state so the original routine can
    // perform its exact established destruction, arbor, objective and reward flow.
    if (boss?.active) boss.setAlpha?.(1).setAngle?.(0);
    const result = originalDefeatBoss.apply(scene, args);
    scene.__act3ClamourFinaleRunning = false;
    scene.frozen = false;
    scene.physics?.resume?.();
    scene.stick = { x: 0, y: 0 };
    scene.pushHud?.(true);
    return result;
  });
}

export function installAct3BossPolish(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3BossPolishInstalled) return;
  proto.__act3BossPolishInstalled = true;
  installAct3AndrewPresence(QuestScene);

  const originalSpawnBoss = proto.spawnActBoss;
  proto.spawnActBoss = function act3ClamourSpawn(...args: any[]) {
    const result = originalSpawnBoss.apply(this, args);
    if (this.save?.current_zone !== ZONE || !this.boss?.active || this.bossName !== CLAMOUR_NAME) return result;
    this.bossSlow = SLOW_MULTIPLIER;
    this.bossTimer?.remove?.();
    this.bossTimer = undefined;
    installPulseTimer(this);
    return result;
  };

  const originalDefeatBoss = proto.defeatActBoss;
  proto.defeatActBoss = function act3ClamourDefeat(...args: any[]) {
    if (this.save?.current_zone !== ZONE || this.bossName !== CLAMOUR_NAME) return originalDefeatBoss.apply(this, args);
    if (this.__act3ClamourFinaleRunning) return;
    playClamourFinale(this, originalDefeatBoss, args);
  };
}
