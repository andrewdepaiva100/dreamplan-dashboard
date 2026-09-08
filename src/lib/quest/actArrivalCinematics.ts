// @ts-nocheck -- Presentation-only scene decorator for authored realm arrivals.
import * as Phaser from "phaser";
import { ZONES } from "./content";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const SQUASH = 0.8;
const ARRIVALS: Record<string, any> = {
  sunlit_shores: { subtitle: "Where the road begins in light", tint: 0xffd98a, panX: 96, panY: -24, zoom: 0.91 },
  wedding_garden: { subtitle: "Every path was planted for this day", tint: 0xffa9c8, panX: 22, panY: -86, zoom: 0.90 },
  the_haven: { subtitle: "A home for all the ordinary forever", tint: 0xbfe3ff, panX: 80, panY: -46, zoom: 0.92 },
  starry_ascent: { subtitle: "Rest beneath the stars, then rise", tint: 0xb9b6ff, panX: 28, panY: -96, zoom: 0.89 },
  cathedral: { subtitle: "At the end of the road, a promise", tint: 0xffe0a6, panX: 0, panY: -112, zoom: 0.88 },
};

function baseZoom(scene: SceneLike) {
  const fill = Math.max(scene.scale.width / (scene.mapW * 16), scene.scale.height / (scene.mapH * 16 * SQUASH));
  return Math.max(scene.scale.width < 620 ? 1.1 : 1.45, fill);
}

/** Tween a proxy value so the camera keeps the game's exact 2.5D x/y ratio on every frame. */
function tweenCameraZoom(scene: SceneLike, camera: any, from: number, to: number, duration: number) {
  const proxy = { z: from };
  camera.setZoom(from, from * SQUASH);
  return scene.tweens.add({
    targets: proxy,
    z: to,
    duration,
    ease: "Sine.easeInOut",
    onUpdate: () => camera.setZoom(proxy.z, proxy.z * SQUASH),
    onComplete: () => camera.setZoom(to, to * SQUASH),
  });
}

function playArrival(scene: SceneLike) {
  if (scene.__actArrivalActive || !scene.player?.active) return;
  const zone = String(scene.save?.current_zone ?? "");
  const cfg = ARRIVALS[zone];
  const info = ZONES[zone as keyof typeof ZONES];
  if (!cfg || !info) return;

  scene.__actArrivalActive = true;
  const camera = scene.cameras.main;
  const normalZoom = baseZoom(scene);
  const revealZoom = Math.max(0.86, normalZoom * cfg.zoom);
  const startX = scene.player.x;
  const startY = scene.player.y;
  const revealX = Phaser.Math.Clamp(startX + cfg.panX, camera.width * 0.2, scene.mapW * 16 - camera.width * 0.2);
  const revealY = Phaser.Math.Clamp(startY + cfg.panY, camera.height * 0.2, scene.mapH * 16 - camera.height * 0.2);

  const previousFrozen = !!scene.frozen;
  scene.frozen = true;
  scene.vel && (scene.vel.x = scene.vel.y = 0);
  scene.player.body?.setVelocity?.(0, 0);
  camera.stopFollow();
  // Never switch to scalar zoom: preserve the same aspect/framing used during gameplay.
  camera.setZoom(normalZoom, normalZoom * SQUASH);

  const veil = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width + 8, scene.scale.height + 8, 0x071020, 0.10)
    .setScrollFactor(0).setDepth(200000).setAlpha(0);

  const act = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.39, String(info.act).toUpperCase(), {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "13px" : "15px",
    fontStyle: "bold", color: "#f7e7b2", letterSpacing: 5,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const rule = scene.add.rectangle(scene.scale.width / 2, scene.scale.height * 0.445, 0, 1, cfg.tint, 0.82)
    .setScrollFactor(0).setDepth(200020);

  const title = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.49, info.title, {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "19px" : "27px",
    fontStyle: "bold", color: "#fffaf0", align: "center", stroke: "#071020", strokeThickness: 3,
    wordWrap: { width: scene.scale.width * 0.82 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0).setScale(0.985);

  const subtitle = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.57, cfg.subtitle, {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "10px" : "12px",
    fontStyle: "italic", color: "#e9edf5", align: "center",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const hint = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.86, "PRESS ANY ACTION TO CONTINUE", {
    fontFamily: "system-ui, sans-serif", fontSize: "8px", color: "#d8dfec", letterSpacing: 2,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  let ending = false;
  let zoomTween: any = null;
  const cleanup = () => {
    if (!scene.__actArrivalActive || ending) return;
    ending = true;
    scene.__actArrivalActive = false;
    zoomTween?.stop?.();
    scene.tweens.killTweensOf([veil, act, rule, title, subtitle, hint]);
    scene.tweens.add({ targets: [act, title, subtitle, hint, veil], alpha: 0, duration: 560, ease: "Sine.easeInOut" });
    scene.tweens.add({ targets: rule, alpha: 0, width: 0, duration: 500, ease: "Sine.easeInOut" });
    camera.pan(startX, startY, 1250, "Sine.easeInOut");
    zoomTween = tweenCameraZoom(scene, camera, camera.zoomX || revealZoom, normalZoom, 1250);
    scene.time.delayedCall(1270, () => {
      camera.startFollow(scene.player, true, 0.12, 0.12);
      camera.setZoom(normalZoom, normalZoom * SQUASH);
      scene.frozen = previousFrozen;
      [veil, act, rule, title, subtitle, hint].forEach((o: any) => o?.destroy?.());
    });
  };

  scene.__skipActArrival = cleanup;
  scene.tweens.add({ targets: veil, alpha: 1, duration: 1000, ease: "Sine.easeInOut" });
  camera.pan(revealX, revealY, 2200, "Sine.easeInOut");
  zoomTween = tweenCameraZoom(scene, camera, normalZoom, revealZoom, 2200);
  scene.time.delayedCall(850, () => scene.tweens.add({ targets: act, alpha: 1, y: act.y - 2, duration: 800, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1160, () => scene.tweens.add({ targets: rule, width: Math.min(250, scene.scale.width * 0.46), duration: 900, ease: "Sine.easeInOut" }));
  scene.time.delayedCall(1320, () => scene.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 900, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1660, () => scene.tweens.add({ targets: subtitle, alpha: 0.88, y: subtitle.y + 1, duration: 850, ease: "Sine.easeOut" }));
  scene.time.delayedCall(2500, () => scene.tweens.add({ targets: hint, alpha: 0.48, duration: 650, ease: "Sine.easeOut" }));
  scene.time.delayedCall(zone === "cathedral" ? 5750 : 5100, cleanup);
}

export function installActArrivalCinematics(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__actArrivalCinematicsInstalled) return;
  proto.__actArrivalCinematicsInstalled = true;

  const originalCreate = proto.create;
  proto.create = function cinematicArrivalCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(650, () => playArrival(this));
    return result;
  };

  for (const method of ["attack", "dash", "interact"] as const) {
    const original = proto[method];
    if (typeof original !== "function") continue;
    proto[method] = function arrivalSkippableAction(this: SceneLike, ...args: any[]) {
      if (this.__actArrivalActive && this.__skipActArrival) {
        this.__skipActArrival();
        return;
      }
      return original.apply(this, args);
    };
  }
}
