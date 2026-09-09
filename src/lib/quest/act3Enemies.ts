// @ts-nocheck -- Act III roaming enemy identity only; bosses and progression are untouched.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
// New texture keys make the art refresh cleanly even across a hot-reloaded scene.
const WISP_KEY = "enemy-haven-heart-wisp-v2";
const VEILED_KEY = "enemy-haven-veiled-doubt-v2";

const HAVEN_MOBS: { key: string; tx: number; ty: number; speed: number }[] = [
  { key: WISP_KEY, tx: 22, ty: 34, speed: 46 },
  { key: WISP_KEY, tx: 22, ty: 74, speed: 46 },
  { key: WISP_KEY, tx: 40, ty: 51, speed: 46 },
  { key: WISP_KEY, tx: 96, ty: 42, speed: 46 },
  { key: WISP_KEY, tx: 96, ty: 78, speed: 46 },
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

function heartPath(c: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  c.beginPath();
  c.moveTo(cx, cy + s * 0.72);
  c.bezierCurveTo(cx - s * 1.05, cy + s * 0.08, cx - s * 0.85, cy - s * 0.78, cx - s * 0.34, cy - s * 0.72);
  c.bezierCurveTo(cx - s * 0.08, cy - s * 0.7, cx, cy - s * 0.44, cx, cy - s * 0.28);
  c.bezierCurveTo(cx, cy - s * 0.44, cx + s * 0.08, cy - s * 0.7, cx + s * 0.34, cy - s * 0.72);
  c.bezierCurveTo(cx + s * 0.85, cy - s * 0.78, cx + s * 1.05, cy + s * 0.08, cx, cy + s * 0.72);
  c.closePath();
}

function makeTextures(scene: SceneLike) {
  // HEART WISP — read first as a broken glowing heart, then as a smoke creature.
  canvas(scene, WISP_KEY, 64, 72, (c) => {
    const glow = c.createRadialGradient(32, 31, 3, 32, 31, 27);
    glow.addColorStop(0, "rgba(255,125,173,.42)");
    glow.addColorStop(0.48, "rgba(183,84,171,.17)");
    glow.addColorStop(1, "rgba(45,24,61,0)");
    c.fillStyle = glow; c.fillRect(4, 4, 56, 56);
    c.fillStyle = "rgba(10,12,22,.36)";
    c.beginPath(); c.ellipse(32, 66, 18, 4, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = "#1b1428"; c.lineWidth = 11; c.lineCap = "round";
    c.beginPath(); c.moveTo(31, 43); c.bezierCurveTo(18, 50, 21, 60, 33, 61); c.bezierCurveTo(43, 62, 44, 68, 35, 70); c.stroke();
    c.strokeStyle = "#452758"; c.lineWidth = 5;
    c.beginPath(); c.moveTo(28, 43); c.bezierCurveTo(19, 51, 25, 57, 35, 59); c.stroke();
    heartPath(c, 32, 29, 18); c.fillStyle = "#171222"; c.fill(); c.strokeStyle = "#6f397e"; c.lineWidth = 3; c.stroke();
    heartPath(c, 32, 29, 13);
    const core = c.createLinearGradient(22, 18, 42, 42);
    core.addColorStop(0, "#ffb1d0"); core.addColorStop(0.45, "#ff5f9f"); core.addColorStop(1, "#b72f78"); c.fillStyle = core; c.fill();
    c.strokeStyle = "#fff2f8"; c.lineWidth = 2;
    c.beginPath(); c.moveTo(33, 17); c.lineTo(29, 27); c.lineTo(34, 29); c.lineTo(29, 40); c.stroke();
    c.fillStyle = "#fff7fb"; c.fillRect(26, 23, 3, 3); c.fillRect(37, 25, 3, 3);
    const shards = [[10,22,6,10],[50,16,7,11],[8,42,5,7],[52,41,6,9],[45,55,4,6]];
    for (let i = 0; i < shards.length; i++) {
      const [x,y,w,h] = shards[i]; c.fillStyle = i % 2 ? "#f3ce70" : "#ff83b4";
      c.beginPath(); c.moveTo(x, y + h/2); c.lineTo(x+w/2, y); c.lineTo(x+w, y+h/2); c.lineTo(x+w/2, y+h); c.closePath(); c.fill();
    }
  });

  // VEILED DOUBT — a recognizable humanoid bridal-shadow with lantern.
  canvas(scene, VEILED_KEY, 76, 92, (c) => {
    const glow = c.createRadialGradient(38, 39, 4, 38, 39, 34);
    glow.addColorStop(0, "rgba(255,125,173,.28)"); glow.addColorStop(0.58, "rgba(240,200,108,.09)"); glow.addColorStop(1, "rgba(20,16,30,0)");
    c.fillStyle = glow; c.fillRect(2, 4, 72, 72);
    c.fillStyle = "rgba(12,14,24,.38)"; c.beginPath(); c.ellipse(38, 86, 24, 5, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#171522"; c.beginPath(); c.moveTo(31, 36); c.lineTo(45, 36); c.lineTo(58, 82); c.lineTo(18, 82); c.closePath(); c.fill();
    c.fillStyle = "#33243f"; c.beginPath(); c.moveTo(34, 39); c.lineTo(42, 39); c.lineTo(49, 77); c.lineTo(27, 77); c.closePath(); c.fill();
    c.fillStyle = "#522f5f"; c.beginPath(); c.moveTo(30, 48); c.lineTo(37, 43); c.lineTo(37, 77); c.lineTo(26, 77); c.closePath(); c.fill();
    c.strokeStyle = "#e9be63"; c.lineWidth = 3; c.beginPath(); c.moveTo(26, 68); c.lineTo(50, 68); c.moveTo(31, 43); c.lineTo(38, 49); c.lineTo(45, 43); c.stroke();
    c.fillStyle = "#f4d37d"; c.fillRect(36, 69, 4, 8);
    c.fillStyle = "#efe6d8"; c.beginPath(); c.moveTo(19, 13); c.quadraticCurveTo(38, -1, 56, 13); c.lineTo(61, 49); c.lineTo(50, 42); c.lineTo(46, 56); c.lineTo(38, 43); c.lineTo(29, 55); c.lineTo(25, 41); c.lineTo(15, 49); c.closePath(); c.fill();
    c.fillStyle = "#c9bba7"; c.beginPath(); c.moveTo(20, 15); c.quadraticCurveTo(38, 3, 55, 15); c.lineTo(53, 21); c.quadraticCurveTo(38, 12, 22, 21); c.closePath(); c.fill();
    c.strokeStyle = "#d6a957"; c.lineWidth = 2; c.beginPath(); c.moveTo(21, 15); c.quadraticCurveTo(38, 4, 55, 15); c.stroke();
    c.fillStyle = "#0d0c16"; c.beginPath(); c.ellipse(38, 28, 12, 13, 0, 0, Math.PI * 2); c.fill();
    heartPath(c, 38, 29, 7); c.fillStyle = "#ff639f"; c.fill(); c.strokeStyle = "#ffd7e6"; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = "#fff6fa"; c.fillRect(35, 25, 2, 2); c.fillRect(40, 25, 2, 2);
    c.strokeStyle = "#24202d"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(27, 45); c.lineTo(15, 58); c.moveTo(49, 45); c.lineTo(59, 59); c.stroke();
    c.strokeStyle = "#d1a55c"; c.lineWidth = 2; c.beginPath(); c.moveTo(26, 45); c.lineTo(15, 58); c.moveTo(50, 45); c.lineTo(58, 58); c.stroke();
    c.strokeStyle = "#d6a957"; c.lineWidth = 2; c.beginPath(); c.moveTo(59, 58); c.lineTo(64, 63); c.stroke();
    c.fillStyle = "#3a243a"; c.fillRect(59, 62, 11, 15); c.strokeStyle = "#e9be63"; c.strokeRect(59, 62, 11, 15);
    c.fillStyle = "#ff729f"; c.fillRect(62, 66, 5, 7); c.fillStyle = "#ffd9e5"; c.fillRect(63, 67, 2, 2);
    c.fillStyle = "#ff91b8"; c.fillRect(9, 28, 4, 3); c.fillRect(64, 35, 4, 3); c.fillRect(12, 74, 3, 3);
  });
}

function havenBurst(scene: SceneLike, enemy: any, heavy = false) {
  if (!enemy?.active) return;
  const colors = [0xff91b8, 0xefc56b, 0xbfe3ff, 0x82639d];
  const count = heavy ? 10 : 7;
  for (let i = 0; i < count; i++) {
    const mote = scene.add.rectangle(enemy.x + Phaser.Math.Between(-9, 9), enemy.y + Phaser.Math.Between(-9, 7), Phaser.Math.Between(2, 4), Phaser.Math.Between(2, 4), colors[i % colors.length], 0.88)
      .setDepth((enemy.depth ?? 15) + 0.4).setAngle(Phaser.Math.Between(-30, 30));
    scene.tweens.add({ targets: mote, x: mote.x + Phaser.Math.Between(-20, 20), y: mote.y - Phaser.Math.Between(12, 30), alpha: 0, duration: Phaser.Math.Between(280, 440), onComplete: () => mote.destroy() });
  }
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
    enemy.setScale(0.50);
    enemy.setSize(22, 28).setOffset(27, 50);
  } else {
    enemy.setData("brute", false);
    enemy.setData("hp", 1);
    enemy.setScale(0.721);
    enemy.setCircle(18, 14, 18);
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
    if (this.save?.current_zone !== ZONE || !enemy?.active || !enemy.getData?.("act3HavenMob")) return originalTransform.call(this, enemy, ...args);
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
