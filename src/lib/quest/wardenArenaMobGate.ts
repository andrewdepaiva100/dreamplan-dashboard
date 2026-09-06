import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const WARDEN_NAME = "Warden of Rushing Water";
const ARENA_RADIUS = 430;

function isPreFightWarden(scene: SceneLike) {
  return Boolean(
    scene.save?.current_zone === "sunlit_shores" &&
      scene.bossName === WARDEN_NAME &&
      scene.boss?.active &&
      scene.player?.active &&
      scene.bossPhase !== 1,
  );
}

function applyArenaGate(scene: SceneLike) {
  if (!isPreFightWarden(scene)) return;
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite;
  const player = scene.player as Phaser.Physics.Arcade.Sprite;
  const enemies = (scene.enemies?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[];

  for (const enemy of enemies) {
    if (!enemy?.active || !enemy.body) continue;
    const distanceFromBoss = Phaser.Math.Distance.Between(enemy.x, enemy.y, boss.x, boss.y);
    if (distanceFromBoss <= ARENA_RADIUS) {
      enemy.setVelocity?.(0, 0);
      continue;
    }

    // wardenCombat freezes the whole group before dialogue. Restore only mobs
    // outside the arena so normal Act I still feels alive.
    if (enemy.body.velocity.lengthSq() > 1) continue;
    const speed = Number(enemy.getData?.("speed") ?? enemy.getData?.("moveSpeed") ?? 42);
    const distanceToPlayer = Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y);
    if (distanceToPlayer < 360) {
      scene.physics?.moveToObject?.(enemy, player, speed);
    } else {
      const angle = (enemy.x * 0.011 + enemy.y * 0.017 + scene.time.now * 0.00018) % (Math.PI * 2);
      enemy.setVelocity?.(Math.cos(angle) * speed * 0.4, Math.sin(angle) * speed * 0.4);
    }
  }
}

export function installWardenArenaMobGate(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__wardenArenaMobGateInstalled) return;
  proto.__wardenArenaMobGateInstalled = true;

  const originalUpdate = proto.update;
  proto.update = function wardenArenaMobGateUpdate(this: SceneLike, time: number, delta: number, ...args: any[]) {
    const result = originalUpdate.call(this, time, delta, ...args);
    applyArenaGate(this);
    return result;
  };
}
