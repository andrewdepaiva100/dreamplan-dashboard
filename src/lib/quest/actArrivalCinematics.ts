// @ts-nocheck -- Presentation-only scene decorator for authored realm arrivals.
import * as Phaser from "phaser";
import { ZONES } from "./content";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ARRIVALS: Record<string, any> = {
  sunlit_shores: { subtitle: "Where the road begins in light", tint: 0xffd98a, panX: 104, panY: -28, zoom: 0.88 },
  wedding_garden: { subtitle: "Every path was planted for this day", tint: 0xffa9c8, panX: 24, panY: -96, zoom: 0.87 },
  the_haven: { subtitle: "A home for all the ordinary forever", tint: 0xbfe3ff, panX: 88, panY: -52, zoom: 0.90 },
  starry_ascent: { subtitle: "Rest beneath the stars, then rise", tint: 0xb9b6ff, panX: 32, panY: -108, zoom: 0.85 },
  cathedral: { subtitle: "At the end of the road, a promise", tint: 0xffe0a6, panX: 0, panY: -124, zoom: 0.84 },
};

function baseZoom(scene: SceneLike) {
  const fill = Math.max(scene.scale.width / (scene.mapW * 16), scene.scale.height / (scene.mapH * 16 * 0.8));
  return Math.max(scene.scale.width < 620 ? 1.1 : 1.45, fill);
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
  const revealZoom = Math.max(0.82, normalZoom * cfg.zoom);
  const startX = scene.player.x;
  const startY = scene.player.y;
  const revealX = Phaser.Math.Clamp(startX + cfg.panX, camera.width * 0.2, scene.mapW * 16 - camera.width * 0.2);
  const revealY = Phaser.Math.Clamp(startY + cfg.panY, camera.height * 0.2, scene.mapH * 16 - camera.height * 0.2);

  const previousFrozen = !!scene.frozen;
  scene.frozen = true;
  scene.vel && (scene.vel.x = scene.vel.y = 0);
  scene.player.body?.setVelocity?.(0, 0);
  camera.stopFollow();
  // Use one uniform camera zoom for the cinematic. Tweening Phaser's scalar
  // zoom and then replacing it with an anisotropic x/y zoom was the source of
  // the visible temporary screen squeeze.
  camera.setZoom(normalZoom);

  const veil = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width + 8, scene.scale.height + 8, 0x071020, 0.12)
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
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0).setScale(0.975);

  const subtitle = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.57, cfg.subtitle, {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "10px" : "12px",
    fontStyle: "italic", color: "#e9edf5", align: "center",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const hint = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.86, "PRESS ANY ACTION TO CONTINUE", {
    fontFamily: "system-ui, sans-serif", fontSize: "8px", color: "#d8dfec", letterSpacing: 2,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  let ending = false;
  const cleanup = () => {
    if (!scene.__actArrivalActive || ending) return;
    ending = true;
    scene.__actArrivalActive = false;
    scene.tweens.killTweensOf([veil, act, rule, title, subtitle, hint]);
    scene.tweens.add({ targets: [act, title, subtitle, hint, veil], alpha: 0, duration: 480, ease: "Sine.easeInOut" });
    scene.tweens.add({ targets: rule, alpha: 0, width: 0, duration: 420, ease: "Sine.easeInOut" });
    camera.pan(startX, startY, 1050, "Sine.easeInOut");
    camera.zoomTo(normalZoom, 1050, "Sine.easeInOut");
    scene.time.delayedCall(1070, () => {
      camera.startFollow(scene.player, true, 0.12, 0.12);
      // Restore the normal game's 2.5D framing only after the cinematic camera
      // has fully settled, so the player never watches the viewport distort.
      camera.setZoom(normalZoom, normalZoom * 0.8);
      scene.frozen = previousFrozen;
      [veil, act, rule, title, subtitle, hint].forEach((o: any) => o?.destroy?.());
    });
  };

  scene.__skipActArrival = cleanup;
  scene.tweens.add({ targets: veil, alpha: 1, duration: 850, ease: "Sine.easeInOut" });
  camera.pan(revealX, revealY, 1900, "Sine.easeInOut");
  camera.zoomTo(revealZoom, 1900, "Sine.easeInOut");
  scene.time.delayedCall(780, () => scene.tweens.add({ targets: act, alpha: 1, y: act.y - 3, duration: 700, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1080, () => scene.tweens.add({ targets: rule, width: Math.min(250, scene.scale.width * 0.46), duration: 800, ease: "Sine.easeInOut" }));
  scene.time.delayedCall(1220, () => scene.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 820, ease: "Sine.easeOut" }));
  scene.time.delayedCall(1530, () => scene.tweens.add({ targets: subtitle, alpha: 0.88, y: subtitle.y + 2, duration: 760, ease: "Sine.easeOut" }));
  scene.time.delayedCall(2350, () => scene.tweens.add({ targets: hint, alpha: 0.52, duration: 600, ease: "Sine.easeOut" }));
  scene.time.delayedCall(zone === "cathedral" ? 5500 : 4850, cleanup);
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
