// @ts-nocheck -- Runtime weapon overlay sync for the Phaser quest scene.
import { WEAPON_BY_ID } from "./content";

type WeaponKind = "sword" | "wand" | "bow" | "ring" | "shield" | "crown";

function hex(color: number | undefined, fallback = "#f3d489") {
  const n = Number.isFinite(color) ? Number(color) : parseInt(fallback.slice(1), 16);
  return `#${Math.max(0, Math.min(0xffffff, n)).toString(16).padStart(6, "0")}`;
}

function kindFor(id: string, weapon: any): WeaponKind {
  const hay = `${id} ${weapon?.name ?? ""} ${weapon?.icon ?? ""}`.toLowerCase();
  if (/bow|🏹/.test(hay)) return "bow";
  if (/shield|🛡/.test(hay)) return "shield";
  if (/crown|👑/.test(hay)) return "crown";
  if (/ring|💍/.test(hay)) return "ring";
  if (/wand|stave|censer|staff|✨|🌟/.test(hay)) return "wand";
  return "sword";
}

function ensureHandTexture(scene: any, id: string) {
  const key = `hand-${id}`;
  if (scene.textures?.exists?.(key)) return key;
  const weapon = WEAPON_BY_ID[id];
  if (!weapon || !scene.textures?.createCanvas) return null;

  const kind = kindFor(id, weapon);
  const tex = scene.textures.createCanvas(key, 18, 32);
  if (!tex) return null;
  const ctx = tex.getContext();
  ctx.clearRect(0, 0, 18, 32);
  ctx.imageSmoothingEnabled = true;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const blade = hex(weapon.color, "#f3d489");
  const grip = kind === "wand" ? "#7b5a35" : "#6a472b";
  const gold = "#d9b45f";
  const light = "#fff4cc";

  if (kind === "bow") {
    ctx.strokeStyle = grip;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(5, 16, 10, -Math.PI / 2.15, Math.PI / 2.15);
    ctx.stroke();
    ctx.strokeStyle = blade;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(7, 6);
    ctx.lineTo(7, 26);
    ctx.stroke();
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.arc(5, 16, 2.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "ring") {
    ctx.strokeStyle = blade;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(9, 16, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(9, 8.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === "shield") {
    ctx.fillStyle = blade;
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(9, 3);
    ctx.lineTo(16, 7);
    ctx.lineTo(15, 19);
    ctx.quadraticCurveTo(14, 25, 9, 29);
    ctx.quadraticCurveTo(4, 25, 3, 19);
    ctx.lineTo(2, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = light;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(9, 7);
    ctx.lineTo(9, 24);
    ctx.moveTo(5.5, 13);
    ctx.lineTo(12.5, 13);
    ctx.stroke();
  } else if (kind === "crown") {
    ctx.strokeStyle = grip;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, 29);
    ctx.lineTo(9, 14);
    ctx.stroke();
    ctx.fillStyle = blade;
    ctx.beginPath();
    ctx.moveTo(3, 13);
    ctx.lineTo(2, 5);
    ctx.lineTo(6, 9);
    ctx.lineTo(9, 2);
    ctx.lineTo(12, 9);
    ctx.lineTo(16, 5);
    ctx.lineTo(15, 13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else {
    // Sword and wand share a compact grip so every unlocked weapon sits in the
    // exact same hand anchor and can be swapped without leaving the old sprite.
    ctx.strokeStyle = grip;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(9, 30);
    ctx.lineTo(9, 23);
    ctx.stroke();
    ctx.strokeStyle = gold;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(3, 22);
    ctx.lineTo(15, 22);
    ctx.stroke();
    ctx.strokeStyle = blade;
    ctx.lineWidth = kind === "wand" ? 3.2 : 4.2;
    ctx.beginPath();
    ctx.moveTo(9, 21);
    ctx.lineTo(9, 3);
    ctx.stroke();
    if (kind === "wand") {
      ctx.fillStyle = blade;
      ctx.beginPath();
      ctx.arc(9, 3.8, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = light;
      ctx.beginPath();
      ctx.arc(8, 2.8, 1.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = light;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(8, 18);
      ctx.lineTo(8, 5);
      ctx.stroke();
    }
  }

  tex.refresh();
  return key;
}

function sync(scene: any) {
  const id = scene.save?.equipped_weapon;
  const owned = !!id && Array.isArray(scene.save?.weapons) && scene.save.weapons.includes(id);

  if (!owned) {
    scene.hand?.destroy?.();
    scene.hand = null;
    scene.__weaponVisualId = null;
    scene.__crossingBladeSprite?.destroy?.();
    scene.__crossingBladeSprite = undefined;
    return;
  }

  const key = ensureHandTexture(scene, id);
  if (!key) {
    // Never leave the previously equipped weapon in Maria's hand when the new
    // weapon has no authored texture. A missing visual is preferable to a lie.
    scene.hand?.destroy?.();
    scene.hand = null;
    scene.__weaponVisualId = id;
    return;
  }

  if (!scene.hand?.active) scene.hand = scene.add.sprite(scene.player.x, scene.player.y, key).setDepth(21);
  else if (scene.hand.texture?.key !== key) scene.hand.setTexture(key);
  scene.hand.setVisible(true);
  scene.__weaponVisualId = id;

  // The Crossing Blade originally had a second, bespoke overlay. Once every
  // weapon uses the shared hand system that duplicate must never render.
  scene.__crossingBladeSprite?.destroy?.();
  scene.__crossingBladeSprite = undefined;
}

export function installWeaponVisualSync(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__weaponVisualSyncInstalled) return;
  proto.__weaponVisualSyncInstalled = true;

  const originalRefreshHand = proto.refreshHand;
  proto.refreshHand = function weaponVisualRefreshHand(...args: any[]) {
    const id = this.save?.equipped_weapon;
    if (id) ensureHandTexture(this, id);
    const result = originalRefreshHand?.apply(this, args);
    sync(this);
    return result;
  };

  const originalCreate = proto.create;
  proto.create = function weaponVisualCreate(...args: any[]) {
    const result = originalCreate.apply(this, args);
    sync(this);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function weaponVisualUpdate(...args: any[]) {
    const result = originalUpdate.apply(this, args);
    if (this.save?.equipped_weapon !== this.__weaponVisualId || this.__crossingBladeSprite?.active) sync(this);
    return result;
  };
}
