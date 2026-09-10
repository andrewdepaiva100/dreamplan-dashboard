// @ts-nocheck -- Act III Andrew/Maria presentation polish only; no combat or progression values change.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";
const CLAMOUR_NAME = "The Clamour of Doubt";
const ECHO_RANGE = 430;
const BARK_COOLDOWN = 8000;
const BARKS = ["Maria!", "I've got you!", "Stay with me!"];

function haven(scene: SceneLike) {
  return scene.save?.current_zone === ZONE;
}

function andrewTarget(scene: SceneLike) {
  if (scene.companion?.active) return scene.companion;
  return (scene.interactables ?? []).find((it: any) => it?.kind === "andrew" && it?.obj?.active)?.obj;
}

function nearbyAndrew(scene: SceneLike) {
  const andrew = andrewTarget(scene);
  if (!andrew?.active || !scene.player?.active) return undefined;
  return Phaser.Math.Distance.Between(scene.player.x, scene.player.y, andrew.x, andrew.y) <= ECHO_RANGE ? andrew : undefined;
}

function melodyEcho(scene: SceneLike) {
  if (!haven(scene) || !nearbyAndrew(scene)) return;
  const maria = scene.player;
  const glyphs = ["♪", "♫", "♪", "♩", "♫", "♪"];

  glyphs.forEach((glyph, i) => {
    scene.time.delayedCall(i * 330, () => {
      const andrew = nearbyAndrew(scene);
      if (!scene.sys?.isActive?.() || !haven(scene) || !andrew) return;
      const startX = maria.x + (i % 2 ? 8 : -8);
      const startY = maria.y - 24 - (i % 3) * 4;
      const targetX = andrew.x + (i % 2 ? -7 : 7);
      const targetY = andrew.y - 30 - (i % 2) * 5;
      const note = scene.add.text(startX, startY, glyph, {
        fontFamily: "Georgia, serif",
        fontSize: i % 3 === 1 ? "16px" : "13px",
        color: i % 2 === 0 ? "#ff9fbd" : "#9fc8ff",
        stroke: "#fff3dc",
        strokeThickness: 1,
      }).setOrigin(0.5).setDepth(24).setAlpha(0.96);

      const midX = (startX + targetX) / 2 + (i % 2 ? 18 : -18);
      const midY = Math.min(startY, targetY) - 26 - (i % 3) * 4;
      scene.tweens.add({
        targets: note,
        x: midX,
        y: midY,
        angle: i % 2 ? 10 : -10,
        duration: 520,
        ease: "Sine.easeOut",
        onComplete: () => {
          if (!note.active || !andrew.active) {
            note.destroy?.();
            return;
          }
          scene.tweens.add({
            targets: note,
            x: andrew.x + (i % 2 ? -7 : 7),
            y: andrew.y - 30 - (i % 2) * 5,
            alpha: 0,
            scale: 0.72,
            duration: 520,
            ease: "Sine.easeIn",
            onComplete: () => {
              note.destroy();
              if (i === glyphs.length - 1 && andrew.active) {
                scene.spawnSparkle?.(andrew.x, andrew.y - 18, 0xffc2dc, 7);
                scene.spawnSparkle?.(andrew.x, andrew.y - 18, 0x9fc8ff, 7);
              }
            },
          });
        },
      });
    });
  });
}

function protectiveBark(scene: SceneLike) {
  if (!haven(scene) || !scene.companion?.active) return;
  if (!scene.boss?.active || scene.bossPhase !== 1 || scene.bossName !== CLAMOUR_NAME) return;
  const now = scene.time?.now ?? 0;
  if (now < (scene.act3AndrewBarkReadyAt ?? 0)) return;
  scene.act3AndrewBarkReadyAt = now + BARK_COOLDOWN;

  const index = (scene.act3AndrewBarkIndex ?? 0) % BARKS.length;
  scene.act3AndrewBarkIndex = index + 1;
  const andrew = scene.companion;
  const text = scene.add.text(andrew.x, andrew.y - 44, BARKS[index], {
    fontFamily: "Georgia, serif",
    fontSize: "13px",
    fontStyle: "bold italic",
    color: "#f7fbff",
    stroke: "#315b91",
    strokeThickness: 3,
    align: "center",
  }).setOrigin(0.5, 1).setDepth(970).setAlpha(0.98);

  scene.tweens.add({
    targets: text,
    y: text.y - 24,
    alpha: 0,
    duration: 1350,
    hold: 350,
    ease: "Sine.easeOut",
    onComplete: () => text.destroy(),
  });
}

export function installAct3AndrewPresence(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3AndrewPresenceInstalled) return;
  proto.__act3AndrewPresenceInstalled = true;

  const originalInteract = proto.interact;
  proto.interact = function act3AndrewPresenceInteract(...args: any[]) {
    if (haven(this) && !this.frozen) {
      const it = this.nearest?.();
      if (it?.kind === "sheet" && ["0", "1", "2"].includes(String(it.id ?? ""))) {
        this.act3MelodyEchoPending = String(it.id);
      }
    }
    return originalInteract.apply(this, args);
  };

  const originalResume = proto.onResume;
  proto.onResume = function act3AndrewPresenceResume(...args: any[]) {
    const pending = haven(this) ? this.act3MelodyEchoPending : undefined;
    this.act3MelodyEchoPending = undefined;
    const result = originalResume.apply(this, args);
    if (pending !== undefined) this.time?.delayedCall?.(120, () => melodyEcho(this));
    return result;
  };

  const originalHurt = proto.hurtPlayerDirect;
  proto.hurtPlayerDirect = function act3AndrewPresenceHurt(...args: any[]) {
    const before = this.save?.player_health;
    const result = originalHurt.apply(this, args);
    const after = this.save?.player_health;
    if (typeof before === "number" && typeof after === "number" && after < before) protectiveBark(this);
    return result;
  };
}
