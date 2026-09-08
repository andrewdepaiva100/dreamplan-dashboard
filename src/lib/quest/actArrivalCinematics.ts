// @ts-nocheck -- Presentation-only scene decorator for authored realm arrivals.
import * as Phaser from "phaser";
import { ZONES } from "./content";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ARRIVALS: Record<string, any> = {
  sunlit_shores: { subtitle: "Where the road begins in light", tint: 0xffd98a, panX: 118, panY: -34, zoom: 0.80 },
  wedding_garden: { subtitle: "Every path was planted for this day", tint: 0xffa9c8, panX: 28, panY: -118, zoom: 0.78 },
  the_haven: { subtitle: "A home for all the ordinary forever", tint: 0xbfe3ff, panX: 102, panY: -64, zoom: 0.82 },
  starry_ascent: { subtitle: "Rest beneath the stars, then rise", tint: 0xb9b6ff, panX: 38, panY: -132, zoom: 0.76 },
  cathedral: { subtitle: "At the end of the road, a promise", tint: 0xffe0a6, panX: 0, panY: -154, zoom: 0.74 },
};

function baseZoom(scene: SceneLike) {
  const fill = Math.max(scene.scale.width / (scene.mapW * 16), scene.scale.height / (scene.mapH * 16 * 0.8));
  return Math.max(scene.scale.width < 620 ? 1.1 : 1.45, fill);
}

function addLetterbox(scene: SceneLike) {
  const w = scene.scale.width;
  const h = scene.scale.height;
  const top = scene.add.rectangle(w / 2, 0, w + 8, h * 0.09, 0x050914, 0.94).setOrigin(0.5, 0).setScrollFactor(0).setDepth(200010);
  const bottom = scene.add.rectangle(w / 2, h, w + 8, h * 0.09, 0x050914, 0.94).setOrigin(0.5, 1).setScrollFactor(0).setDepth(200010);
  return [top, bottom];
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
  const revealZoom = Math.max(0.72, normalZoom * cfg.zoom);
  const startX = scene.player.x;
  const startY = scene.player.y;
  const revealX = Phaser.Math.Clamp(startX + cfg.panX, camera.width * 0.2, scene.mapW * 16 - camera.width * 0.2);
  const revealY = Phaser.Math.Clamp(startY + cfg.panY, camera.height * 0.2, scene.mapH * 16 - camera.height * 0.2);

  const previousFrozen = !!scene.frozen;
  scene.frozen = true;
  scene.vel && (scene.vel.x = scene.vel.y = 0);
  scene.player.body?.setVelocity?.(0, 0);
  camera.stopFollow();

  const veil = scene.add.rectangle(scene.scale.width / 2, scene.scale.height / 2, scene.scale.width + 8, scene.scale.height + 8, 0x071020, 0.18)
    .setScrollFactor(0).setDepth(200000).setAlpha(0);
  const [barTop, barBottom] = addLetterbox(scene);
  barTop.setAlpha(0); barBottom.setAlpha(0);

  const act = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.39, String(info.act).toUpperCase(), {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "13px" : "15px",
    fontStyle: "bold", color: "#f7e7b2", letterSpacing: 5,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const rule = scene.add.rectangle(scene.scale.width / 2, scene.scale.height * 0.445, 0, 1, cfg.tint, 0.9)
    .setScrollFactor(0).setDepth(200020);

  const title = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.49, info.title, {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "19px" : "27px",
    fontStyle: "bold", color: "#fffaf0", align: "center", stroke: "#071020", strokeThickness: 3,
    wordWrap: { width: scene.scale.width * 0.82 },
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0).setScale(0.96);

  const subtitle = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.57, cfg.subtitle, {
    fontFamily: "Georgia, 'Times New Roman', serif", fontSize: scene.scale.width < 620 ? "10px" : "12px",
    fontStyle: "italic", color: "#e9edf5", align: "center",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const hint = scene.add.text(scene.scale.width / 2, scene.scale.height * 0.86, "PRESS ANY ACTION TO CONTINUE", {
    fontFamily: "system-ui, sans-serif", fontSize: "8px", color: "#d8dfec", letterSpacing: 2,
  }).setOrigin(0.5).setScrollFactor(0).setDepth(200020).setAlpha(0);

  const cleanup = () => {
    if (!scene.__actArrivalActive) return;
    scene.__actArrivalActive = false;
    scene.tweens.killTweensOf([veil, barTop, barBottom, act, rule, title, subtitle, hint]);
    scene.tweens.add({ targets: [act, title, subtitle, hint, veil], alpha: 0, duration: 280, ease: "Sine.easeIn" });
    scene.tweens.add({ targets: [barTop, barBottom], alpha: 0, duration: 360, ease: "Sine.easeIn" });
    camera.pan(startX, startY, 700, "Sine.easeInOut");
    camera.zoomTo(normalZoom, 700, "Sine.easeInOut", false, (_cam: any, progress: number) => {
      // Preserve the game's intentional vertical 2.5D squash while zooming.
      if (progress >= 1) camera.setZoom(normalZoom, normalZoom * 0.8);
    });
    scene.time.delayedCall(720, () => {
      camera.startFollow(scene.player, true, 0.12, 0.12);
      camera.setZoom(normalZoom, normalZoom * 0.8);
      scene.frozen = previousFrozen;
      [veil, barTop, barBottom, act, rule, title, subtitle, hint].forEach((o: any) => o?.destroy?.());
    });
  };

  scene.__skipActArrival = cleanup;
  scene.tweens.add({ targets: [veil, barTop, barBottom], alpha: 1, duration: 500, ease: "Sine.easeOut" });
  camera.pan(revealX, revealY, 1450, "Sine.easeInOut");
  camera.zoomTo(revealZoom, 1450, "Sine.easeInOut", false, (_cam: any, progress: number) => {
    if (progress >= 1) camera.setZoom(revealZoom, revealZoom * 0.8);
  });
  scene.time.delayedCall(700, () => scene.tweens.add({ targets: act, alpha: 1, y: act.y - 4, duration: 500, ease: "Cubic.easeOut" }));
  scene.time.delayedCall(920, () => scene.tweens.add({ targets: rule, width: Math.min(260, scene.scale.width * 0.48), duration: 650, ease: "Cubic.easeOut" }));
  scene.time.delayedCall(1050, () => scene.tweens.add({ targets: title, alpha: 1, scale: 1, duration: 650, ease: "Cubic.easeOut" }));
  scene.time.delayedCall(1320, () => scene.tweens.add({ targets: subtitle, alpha: 0.88, y: subtitle.y + 3, duration: 600, ease: "Sine.easeOut" }));
  scene.time.delayedCall(2100, () => scene.tweens.add({ targets: hint, alpha: 0.58, duration: 450 }));
  scene.time.delayedCall(zone === "cathedral" ? 5200 : 4500, cleanup);
}

export function installActArrivalCinematics(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__actArrivalCinematicsInstalled) return;
  proto.__actArrivalCinematicsInstalled = true;

  const originalCreate = proto.create;
  proto.create = function cinematicArrivalCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    // Let the realm, HUD, decorators, camera bounds and initial fade settle first.
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
