// @ts-nocheck -- Act III roaming enemy identity only; bosses and progression are untouched.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const WISP_KEY = "enemy-haven-heart-wisp";
const VEILED_KEY = "enemy-haven-veiled-doubt";

const HAVEN_MOBS: { key: string; tx: number; ty: number; speed: number }[] = [
  // Heart Wisps — light one-hit worries along Haven's main walking streets.
  { key: WISP_KEY, tx: 22, ty: 34, speed: 46 },
  { key: WISP_KEY, tx: 22, ty: 74, speed: 46 },
  { key: WISP_KEY, tx: 40, ty: 51, speed: 46 },
  { key: WISP_KEY, tx: 96, ty: 42, speed: 46 },
  { key: WISP_KEY, tx: 96, ty: 78, speed: 46 },
  // Veiled Doubts — fewer, heavier two-hit shadows on the outer approaches.
  { key: VEILED_KEY, tx: 22, ty: 84, speed: 32 },
  { key: VEILED_KEY, tx: 46, ty: 51, speed: 32 },
  { key: VEILED_KEY, tx: 96, ty: 64, speed: 32 },
];

function canvas(scene: SceneLike, key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const texture = scene.textures.createCanvas(key, w, h);
  if (!texture) return;
  const ctx = texture.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  draw(ctx);
  texture.refresh();
}

function makeTextures(scene: SceneLike) {
  canvas(scene, WISP_KEY, 38, 42, (c) => {
    c.fillStyle = "rgba(22,18,31,.28)";
    c.beginPath(); c.ellipse(19, 38, 13, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#2a2137";
    c.beginPath(); c.ellipse(19, 21, 13, 15, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#4d3960"; c.fillRect(9, 17, 20, 12);
    c.fillStyle = "#ff7dad";
    c.fillRect(14, 17, 5, 5); c.fillRect(20, 17, 5, 5); c.fillRect(16, 21, 7, 7); c.fillRect(18, 27, 3, 3);
    c.fillStyle = "#fff2f7"; c.fillRect(17, 19, 2, 2); c.fillRect(21, 20, 2, 2);
    c.strokeStyle = "#a77bc2"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(8, 13); c.quadraticCurveTo(3, 18, 7, 24); c.moveTo(30, 12); c.quadraticCurveTo(35, 18, 31, 25); c.stroke();
    c.fillStyle = "#f3ce70"; c.fillRect(6, 10, 3, 3); c.fillRect(30, 8, 3, 3);
    c.fillStyle = "#cfeaff"; c.fillRect(4, 27, 3, 3); c.fillRect(32, 25, 3, 3);
  });

  canvas(scene, VEILED_KEY, 52, 60, (c) => {
    c.fillStyle = "rgba(19,18,28,.3)";
    c.beginPath(); c.ellipse(26, 55, 19, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#242331";
    c.beginPath(); c.moveTo(15, 51); c.lineTo(17, 24); c.lineTo(23, 13); c.lineTo(32, 13); c.lineTo(38, 25); c.lineTo(42, 52); c.closePath(); c.fill();
    c.fillStyle = "#3d3749";
    c.beginPath(); c.moveTo(20, 48); c.lineTo(20, 26); c.lineTo(26, 18); c.lineTo(34, 25); c.lineTo(36, 49); c.closePath(); c.fill();
    c.fillStyle = "#f1eadc";
    c.beginPath(); c.moveTo(15, 12); c.quadraticCurveTo(26, 1, 39, 12); c.lineTo(37, 31); c.lineTo(31, 24); c.lineTo(26, 33); c.lineTo(20, 24); c.lineTo(15, 31); c.closePath(); c.fill();
    c.fillStyle = "#c8bea9"; c.fillRect(18, 13, 4, 15); c.fillRect(34, 13, 3, 16);
    c.fillStyle = "#ff7dad"; c.fillRect(23, 19, 4, 4); c.fillRect(28, 19, 4, 4); c.fillRect(25, 22, 5, 6);
    c.fillStyle = "#f0c86c"; c.fillRect(18, 38, 18, 2); c.fillRect(25, 40, 3, 5);
    c.strokeStyle = "#b08c60"; c.lineWidth = 2; c.beginPath(); c.moveTo(12, 34); c.lineTo(6, 47); c.moveTo(40, 34); c.lineTo(46, 47); c.stroke();
    c.fillStyle = "#ffb7cf"; c.fillRect(5, 45, 4, 6); c.fillRect(44, 45, 4, 6);
    c.fillStyle = "#d7efff"; c.fillRect(12, 8, 3, 3); c.fillRect(40, 9, 3, 3);
  });
}

function havenBurst(scene: SceneLike, enemy: any, heavy = false) {
  if (!enemy?.active) return;
  const colors = [0xff91b8, 0xefc56b, 0xbfe3ff, 0x82639d];
  const count = heavy ? 9 : 6;
  for (let i = 0; i < count; i++) {
    const mote = scene.add.rectangle(
      enemy.x + Phaser.Math.Between(-7, 7),
      enemy.y + Phaser.Math.Between(-7, 6),
      Phaser.Math.Between(2, 4),
      Phaser.Math.Between(2, 4),
      colors[i % colors.length],
      0.85,
    ).setDepth((enemy.depth ?? 15) + 0.4).setAngle(Phaser.Math.Between(-30, 30));
    scene.tweens.add({
      targets: mote,
      x: mote.x + Phaser.Math.Between(-18, 18),
      y: mote.y - Phaser.Math.Between(10, 28),
      alpha: 0,
      duration: Phaser.Math.Between(260, 430),
      onComplete: () => mote.destroy(),
    });
  }
}

function addReadabilityGlow(scene: SceneLike, enemy: any, color: number, radius: number) {
  const glow = scene.add.circle(enemy.x, enemy.y, radius, color, 0.13).setDepth((enemy.depth ?? 12) - 0.2);
  scene.tweens.add({ targets: glow, alpha: { from: 0.07, to: 0.2 }, scale: { from: 0.9, to: 1.12 }, duration: 1100, yoyo: true, repeat: -1 });
  const follow = () => {
    if (!enemy?.active || !glow.active) { glow.destroy(); return; }
    glow.setPosition(enemy.x, enemy.y).setDepth((enemy.depth ?? 12) - 0.2);
    scene.time.delayedCall(80, follow);
  };
  follow();
}

function spawnHavenMob(scene: SceneLike, key: string, tx: number, ty: number, speed: number) {
  const authoredX = scene.wx(tx);
  const authoredY = scene.wy(ty);
  const spot = scene.walkableSpot?.(authoredX, authoredY) ?? { x: authoredX, y: authoredY };
  const enemy = scene.spawnEnemy(spot.x, spot.y, key, speed, false) as Phaser.Physics.Arcade.Sprite | null;
  if (!enemy) return null;
  enemy.setTexture(key).clearTint();
  enemy.setData("act3HavenMob", true);
  enemy.setData("act3HavenType", key === VEILED_KEY ? "veiled" : "wisp");
  if (key === VEILED_KEY) {
    enemy.setData("brute", true);
    enemy.setData("hp", 2);
    enemy.setScale(1.24);
    enemy.setCircle(11, 15, 25);
    addReadabilityGlow(scene, enemy, 0xefc56b, 25);
  } else {
    enemy.setData("brute", false);
    enemy.setData("hp", 1);
    enemy.setScale(1.18);
    enemy.setCircle(9, 10, 16);
    addReadabilityGlow(scene, enemy, 0xff7dad, 19);
  }
  return enemy;
}

function spawnHavenPopulation(scene: SceneLike) {
  makeTextures(scene);
  for (const mob of HAVEN_MOBS) spawnHavenMob(scene, mob.key, mob.tx, mob.ty, mob.speed);
}

export function installAct3Enemies(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3EnemiesInstalled) return;
  proto.__act3EnemiesInstalled = true;

  const originalSpawnForZone = proto.spawnEnemiesForZone;
  proto.spawnEnemiesForZone = function act3EnemyPopulation(zone: string, ...args: any[]) {
    const result = originalSpawnForZone.call(this, zone, ...args);
    if (zone === ZONE) spawnHavenPopulation(this);
    return result;
  };

  const originalTransform = proto.transformEnemy;
  proto.transformEnemy = function act3EnemyTransform(enemy: any, ...args: any[]) {
    if (this.save?.current_zone !== ZONE || !enemy?.active || !enemy.getData?.("act3HavenMob")) {
      return originalTransform.call(this, enemy, ...args);
    }

    const veiled = enemy.getData("act3HavenType") === "veiled";
    const hp = Number(enemy.getData("hp") ?? (veiled ? 2 : 1));
    if (veiled && hp > 1) {
      enemy.setData("hp", hp - 1);
      havenBurst(this, enemy, false);
      enemy.setTint(0xffb6ce);
      this.time.delayedCall(120, () => { if (enemy.active) enemy.clearTint(); });
      return;
    }

    havenBurst(this, enemy, veiled);
    return originalTransform.call(this, enemy, ...args);
  };
}
