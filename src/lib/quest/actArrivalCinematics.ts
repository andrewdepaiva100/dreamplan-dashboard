// @ts-nocheck -- Presentation-only scene decorator for authored realm arrivals.
import * as Phaser from "phaser";
import { ZONES } from "./content";
import { installAct4StarryAscentRemaster } from "./act4StarryAscentRemaster";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ARRIVALS: Record<string, any> = {
  sunlit_shores: { subtitle: "Where the road begins in light", tint: 0xffd98a, panX: 78, panY: -18, zoom: 0.94 },
  wedding_garden: { subtitle: "Every path was planted for this day", tint: 0xffa9c8, panX: 18, panY: -68, zoom: 0.935 },
  the_haven: { subtitle: "A home for all the ordinary forever", tint: 0xbfe3ff, panX: 64, panY: -36, zoom: 0.945 },
  starry_ascent: { subtitle: "Rest beneath the stars, then rise", tint: 0xb9b6ff, panX: 22, panY: -76, zoom: 0.93 },
  cathedral: { subtitle: "At the end of the road, a promise", tint: 0xffe0a6, panX: 0, panY: -88, zoom: 0.925 },
};

function currentZoom(camera: any) {
  return {
    x: Number(camera.zoomX ?? camera.zoom ?? 1),
    y: Number(camera.zoomY ?? camera.zoom ?? 1),
  };
}

/** Tween both camera axes from their actual live values, never forcing a new aspect ratio. */
function tweenCameraZoom(scene: SceneLike, camera: any, from: { x: number; y: number }, to: { x: number; y: number }, duration: number) {
  const proxy = { x: from.x, y: from.y };
  camera.setZoom(from.x, from.y);
  return scene.tweens.add({
    targets: proxy,
    x: to.x,
    y: to.y,
    duration,
    ease: "Sine.easeInOut",
    onUpdate: () => camera.setZoom(proxy.x, proxy.y),
    onComplete: () => camera.setZoom(to.x, to.y),
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
  // Capture the exact gameplay camera state produced by the existing scene and decorators.
  // The cinematic only scales that framing proportionally, so the screen never squeezes.
  const normalZoom = currentZoom(camera);
  const revealZoom = { x: normalZoom.x * cfg.zoom, y: normalZoom.y * cfg.zoom };
  const startX = scene.player.x;
  const startY = scene.player.y;
  const revealX = Phaser.Math.Clamp(startX + cfg.panX, camera.width * 0.2, scene.mapW * 16 - camera.width * 0.2);
  const revealY = Phaser.Math.Clamp(startY + cfg.panY, camera.height * 0.2, scene.mapH * 16 - camera.height * 0.2);

  const previousFrozen = !!scene.frozen;
  scene.frozen = true;
  scene.vel && (scene.vel.x = scene.vel.y = 0);
  scene.player.body?.setVelocity?.(0, 0);
  camera.stopFollow();

  const veil = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width + 8, scene.scale.height + 8, 0x071020, 0.08)
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
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0).setScale(0.99);

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
    scene.tweens.add({ targets: [act, title, subtitle, hint, veil], alpha: 0, duration: 650, ease: "Sine.easeInOut" });
    scene.tweens.add({ targets: rule, alpha: 0, width: 0, duration: 600, ease: "Sine.easeInOut" });
    camera.pan(startX, startY, 1450, "Sine.easeInOut");
    zoomTween = tweenCameraZoom(scene, camera, currentZoom(camera), normalZoom, 1450);
    scene.time.delayedCall(1470, () => {
      camera.startFollow(scene.player, true, 0.12, 0.12);
      camera.setZoom(normalZoom.x, normalZoom.y);
      scene.frozen = previousFrozen;
      [veil, act, rule, title, subtitle, hint].forEach((o: any) => o?.destroy?.());
    });
  };

  scene.__skipActArrival = cleanup;
  scene.tweens.add({ targets: veil, alpha: 1, duration: 1200, ease: "Sine.easeInOut" });
  camera.pan(revealX, revealY, 2500, "Sine.easeInOut");
  zoomTween = tweenCameraZoom(scene, camera, normalZoom, revealZoom, 2500);
  scene.time.delayedCall(950, () => scene.tweens.add({ targets: act, alpha: 1, y: act.y - 2, duration: 900, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1300, () => scene.tweens.add({ targets: rule, width: Math.min(245, scene.scale.width * 0.45), duration: 1000, ease: "Sine.easeInOut" }));
  scene.time.delayedCall(1480, () => scene.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 1000, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1840, () => scene.tweens.add({ targets: subtitle, alpha: 0.88, duration: 950, ease: "Sine.easeOut" }));
  scene.time.delayedCall(2700, () => scene.tweens.add({ targets: hint, alpha: 0.46, duration: 750, ease: "Sine.easeOut" }));
  scene.time.delayedCall(zone === "cathedral" ? 6100 : 5450, cleanup);
}

export function installActArrivalCinematics(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__actArrivalCinematicsInstalled) return;
  proto.__actArrivalCinematicsInstalled = true;

  installAct4StarryAscentRemaster(QuestScene as any);

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
