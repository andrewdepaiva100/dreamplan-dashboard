// @ts-nocheck -- Runtime Phaser decorator intentionally accesses scene-private fields.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };
type Dir = "down" | "up" | "side";
type WeaponKind = "sword" | "wand" | "bow" | "ring";

const ATTACK_MS = 270;

function weaponKind(id: string): WeaponKind {
  const key = id.toLowerCase();
  if (key.includes("bow")) return "bow";
  if (key.includes("ring")) return "ring";
  if (key.includes("wand") || key.includes("censer")) return "wand";
  return "sword";
}

function attackDirection(scene: SceneLike) {
  const dir = (scene.__mariaMotionDir ?? scene.lastDir ?? "down") as Dir;
  if (dir === "up") return { dir, angle: -Math.PI / 2, x: 0, y: -1 };
  if (dir === "down") return { dir, angle: Math.PI / 2, x: 0, y: 1 };
  const sign = scene.facing >= 0 ? 1 : -1;
  return { dir, angle: sign > 0 ? 0 : Math.PI, x: sign, y: 0 };
}

function createTrail(scene: SceneLike, angle: number, reach: number, color: number, kind: WeaponKind) {
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!player?.active) return;

  if (kind === "wand" || kind === "ring") {
    const pulse = scene.add
      .arc(player.x + Math.cos(angle) * reach * 0.58, player.y + Math.sin(angle) * reach * 0.58,
        kind === "ring" ? 14 : 9, 0, 360, false, color, 0.42)
      .setDepth(20)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({ targets: pulse, scale: 1.65, alpha: 0, duration: 180, ease: "Quad.easeOut", onComplete: () => pulse.destroy() });
    return;
  }

  if (kind === "bow") {
    const streak = scene.add
      .rectangle(player.x + Math.cos(angle) * 22, player.y + Math.sin(angle) * 22, Math.min(42, reach * 0.7), 2.5, color, 0.72)
      .setDepth(20)
      .setRotation(angle)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.tweens.add({
      targets: streak,
      x: player.x + Math.cos(angle) * reach * 0.85,
      y: player.y + Math.sin(angle) * reach * 0.85,
      alpha: 0,
      duration: 150,
      ease: "Quad.easeOut",
      onComplete: () => streak.destroy(),
    });
    return;
  }

  const trail = scene.add
    .arc(player.x, player.y, reach * 0.82, Phaser.Math.RadToDeg(angle) - 62, Phaser.Math.RadToDeg(angle) + 46, false, color, 0.22)
    .setDepth(20)
    .setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: trail, alpha: 0, scale: 1.08, duration: 150, ease: "Quad.easeOut", onComplete: () => trail.destroy() });
}

function startAttackPresentation(scene: SceneLike, weaponId: string) {
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!player?.active) return;

  const now = scene.time.now;
  const direction = attackDirection(scene);
  const kind = weaponKind(weaponId);
  const weapon = scene.equippedWeapon?.();
  const reach = Number(weapon?.reach ?? 54);
  const color = Number(weapon?.color ?? 0xffe9a8);

  scene.__mariaAttack = {
    startedAt: now,
    endsAt: now + ATTACK_MS,
    dir: direction.dir,
    angle: direction.angle,
    x: direction.x,
    y: direction.y,
    kind,
    weaponId,
  };

  // Anticipation: briefly draw Maria away from the strike before the body follows through.
  player.setData("mariaAttackActive", true);
  createTrail(scene, direction.angle, reach, color, kind);

  // Weapon-specific hand motion. Keep the equipped weapon at its exact normal
  // scale throughout every attack; only rotation changes for presentation.
  const hand = scene.hand as Phaser.GameObjects.Sprite | null;
  if (hand?.active) {
    scene.tweens.killTweensOf(hand);
    const baseScaleX = hand.scaleX;
    const baseScaleY = hand.scaleY;
    hand.setScale(baseScaleX, baseScaleY);
    const restoreHand = () => {
      if (!hand?.active) return;
      hand.setAngle(0);
      hand.setScale(baseScaleX, baseScaleY);
    };

    if (kind === "sword") {
      const sign = direction.dir === "side" && scene.facing < 0 ? -1 : 1;
      hand.setAngle(-52 * sign);
      scene.tweens.add({
        targets: hand,
        angle: 58 * sign,
        duration: 145,
        ease: "Cubic.easeOut",
        yoyo: true,
        hold: 18,
        onComplete: restoreHand,
      });
    } else if (kind === "wand" || kind === "ring") {
      scene.tweens.add({
        targets: hand,
        angle: direction.dir === "side" ? 18 * scene.facing : 12,
        duration: 105,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: restoreHand,
      });
    } else {
      scene.tweens.add({
        targets: hand,
        angle: direction.dir === "side" ? -16 * scene.facing : -12,
        duration: 85,
        yoyo: true,
        ease: "Quad.easeOut",
        onComplete: restoreHand,
      });
    }
  }
}

function updateAttackPresentation(scene: SceneLike, time: number) {
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  const attack = scene.__mariaAttack;
  if (!player?.active || !attack) return;

  if (time >= attack.endsAt || scene.frozen) {
    player.setData("mariaAttackActive", false);
    scene.__mariaAttack = null;
    player.setAngle(Phaser.Math.Linear(player.angle, 0, 0.5));
    return;
  }

  const p = Phaser.Math.Clamp((time - attack.startedAt) / ATTACK_MS, 0, 1);
  const kind = attack.kind as WeaponKind;
  let body = 0;
  let lean = 0;

  if (p < 0.2) {
    const t = p / 0.2;
    body = -Math.sin(t * Math.PI / 2) * (kind === "sword" ? 2.2 : 1.2);
    lean = -Math.sin(t * Math.PI / 2);
  } else if (p < 0.62) {
    const t = (p - 0.2) / 0.42;
    body = Phaser.Math.Linear(kind === "sword" ? -2.2 : -1.2, kind === "sword" ? 3.2 : 1.7, Phaser.Math.Easing.Cubic.Out(t));
    lean = Phaser.Math.Linear(-1, 1, Phaser.Math.Easing.Cubic.Out(t));
  } else {
    const t = (p - 0.62) / 0.38;
    body = Phaser.Math.Linear(kind === "sword" ? 3.2 : 1.7, 0, Phaser.Math.Easing.Sine.Out(t));
    lean = Phaser.Math.Linear(1, 0, Phaser.Math.Easing.Sine.Out(t));
  }

  // Full-body participation: restrained rotation plus compression/extension.
  // We intentionally do not move the physics body or change velocity.
  const sideSign = attack.dir === "side" ? (scene.facing >= 0 ? 1 : -1) : 1;
  player.setAngle(body * sideSign);
  const baseX = player.scaleX;
  const baseY = player.scaleY;
  const extension = kind === "sword" ? 0.018 : 0.01;
  player.setScale(baseX * (1 + extension * Math.max(0, lean)), baseY * (1 - 0.012 * Math.abs(lean)));

  // Small visual recoil on the strike frame, applied to display origin only via
  // sprite offset so collision and world position remain untouched.
  const recoil = p > 0.38 && p < 0.68 ? Math.sin(((p - 0.38) / 0.3) * Math.PI) : 0;
  player.setData("mariaAttackRecoil", recoil * 1.4);
}

export function installMariaCombatAnimation(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__mariaCombatAnimationInstalled) return;
  proto.__mariaCombatAnimationInstalled = true;

  const originalAttack = proto.attack;
  proto.attack = function mariaAnimatedAttack(this: SceneLike, ...args: any[]) {
    const before = Number(this.swingAt ?? 0);
    const result = originalAttack.apply(this, args);
    const accepted = Number(this.swingAt ?? 0) > before;
    if (accepted) {
      const weapon = this.equippedWeapon?.();
      startAttackPresentation(this, String(weapon?.id ?? this.save?.equipped_weapon ?? "weapon"));
    }
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function mariaCombatAnimationUpdate(this: SceneLike, time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    updateAttackPresentation(this, time);
    return result;
  };
}
