// @ts-nocheck -- Act III roaming enemy identity only; bosses and progression are untouched.
import * as Phaser from "phaser";
import { SOLID_TILES, TILE } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const WISP_KEY = "enemy-haven-heart-wisp";
const VEILED_KEY = "enemy-haven-veiled-doubt";
const WISP_COUNT = 5;
const VEILED_COUNT = 3;

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
    c.fillStyle = "rgba(22,18,31,.25)";
    c.beginPath(); c.ellipse(19, 38, 12, 3, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#2a2137";
    c.beginPath(); c.ellipse(19, 21, 13, 15, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#41304f";
    c.fillRect(9, 17, 20, 12);
    c.fillStyle = "#ff7dad";
    c.fillRect(14, 17, 5, 5); c.fillRect(20, 17, 5, 5); c.fillRect(16, 21, 7, 7); c.fillRect(18, 27, 3, 3);
    c.fillStyle = "#ffd7e5"; c.fillRect(17, 19, 2, 2);
    c.strokeStyle = "#7c6294"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(8, 13); c.quadraticCurveTo(3, 18, 7, 24); c.moveTo(30, 12); c.quadraticCurveTo(35, 18, 31, 25); c.stroke();
    c.fillStyle = "#efc56b"; c.fillRect(6, 10, 2, 2); c.fillRect(30, 8, 2, 2);
    c.fillStyle = "#bfe3ff"; c.fillRect(4, 27, 2, 2); c.fillRect(32, 25, 2, 2);
  });

  canvas(scene, VEILED_KEY, 52, 60, (c) => {
    c.fillStyle = "rgba(19,18,28,.28)";
    c.beginPath(); c.ellipse(26, 55, 18, 4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#242331";
    c.beginPath(); c.moveTo(15, 51); c.lineTo(17, 24); c.lineTo(23, 13); c.lineTo(32, 13); c.lineTo(38, 25); c.lineTo(42, 52); c.closePath(); c.fill();
    c.fillStyle = "#343041";
    c.beginPath(); c.moveTo(20, 48); c.lineTo(20, 26); c.lineTo(26, 18); c.lineTo(34, 25); c.lineTo(36, 49); c.closePath(); c.fill();
    c.fillStyle = "#e6dfcf";
    c.beginPath(); c.moveTo(15, 12); c.quadraticCurveTo(26, 1, 39, 12); c.lineTo(37, 31); c.lineTo(31, 24); c.lineTo(26, 33); c.lineTo(20, 24); c.lineTo(15, 31); c.closePath(); c.fill();
    c.fillStyle = "#c8bea9"; c.fillRect(18, 13, 4, 15); c.fillRect(34, 13, 3, 16);
    c.fillStyle = "#ff7dad"; c.fillRect(23, 19, 4, 4); c.fillRect(28, 19, 4, 4); c.fillRect(25, 22, 5, 6);
    c.fillStyle = "#f0c86c"; c.fillRect(18, 38, 18, 2); c.fillRect(25, 40, 3, 5);
    c.strokeStyle = "#9b7a54"; c.lineWidth = 2; c.beginPath(); c.moveTo(12, 34); c.lineTo(6, 47); c.moveTo(40, 34); c.lineTo(46, 47); c.stroke();
    c.fillStyle = "#ffb7cf"; c.fillRect(5, 45, 4, 6); c.fillRect(44, 45, 4, 6);
    c.fillStyle = "#bfe3ff"; c.fillRect(12, 8, 2, 2); c.fillRect(40, 9, 2, 2);
  });
}

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
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

function spawnHavenMob(scene: SceneLike, key: string, x: number, y: number, speed: number) {
  const enemy = scene.spawnEnemy(x, y, key, speed, false) as Phaser.Physics.Arcade.Sprite | null;
  if (!enemy) return null;
  enemy.setTexture(key).clearTint();
  enemy.setData("act3HavenMob", true);
  enemy.setData("act3HavenType", key === VEILED_KEY ? "veiled" : "wisp");
  if (key === VEILED_KEY) {
    enemy.setData("brute", true);
    enemy.setData("hp", 2);
    enemy.setScale(1.12);
    enemy.setCircle(11, 15, 25);
  } else {
    enemy.setData("brute", false);
    enemy.setData("hp", 1);
    enemy.setScale(1.02);
    enemy.setCircle(9, 10, 16);
  }
  return enemy;
}

function spawnHavenPopulation(scene: SceneLike) {
  makeTextures(scene);
  const rnd = seeded(33031);
  const player = scene.player;
  const andrew = scene.interactables?.find?.((it: any) => it?.kind === "andrew" && it?.obj?.active)?.obj;
  const townHallX = scene.wx?.(66) ?? 0;
  const townHallY = scene.wy?.(28) ?? 0;
  const targets = [
    ...Array(WISP_COUNT).fill(WISP_KEY),
    ...Array(VEILED_COUNT).fill(VEILED_KEY),
  ];
  let placed = 0;
  let guard = 0;

  while (placed < targets.length && guard++ < 1400) {
    const tx = Math.floor(rnd() * ((scene.mapW ?? 180) - 12)) + 6;
    const ty = Math.floor(rnd() * ((scene.mapH ?? 180) - 12)) + 6;
    const tile = scene.layer?.getTileAt?.(tx, ty);
    if (!tile || SOLID_TILES.includes(tile.index as any)) continue;
    const x = tx * TILE;
    const y = ty * TILE;
    if (player && Phaser.Math.Distance.Between(x, y, player.x, player.y) < 250) continue;
    if (andrew && Phaser.Math.Distance.Between(x, y, andrew.x, andrew.y) < 175) continue;
    if (Phaser.Math.Distance.Between(x, y, townHallX, townHallY) < 145) continue;
    const tooClose = (scene.enemies?.getChildren?.() ?? []).some((e: any) =>
      e?.active && e?.getData?.("act3HavenMob") && Phaser.Math.Distance.Between(x, y, e.x, e.y) < 115,
    );
    if (tooClose) continue;

    const key = targets[placed];
    const speed = key === VEILED_KEY ? 32 : 46;
    if (spawnHavenMob(scene, key, x, y, speed)) placed++;
  }
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
