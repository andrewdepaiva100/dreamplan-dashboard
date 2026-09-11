// @ts-nocheck -- Presentation-only world ambience. No gameplay state is touched.
import * as Phaser from "phaser";

type ZoneId = "sunlit_shores" | "wedding_garden" | "the_haven" | "starry_ascent" | "cathedral";

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const ZONE_SEED: Record<ZoneId, number> = {
  sunlit_shores: 1103,
  wedding_garden: 2207,
  the_haven: 3319,
  starry_ascent: 4421,
  cathedral: 5531,
};

export function installEnvironmentalMicroLife(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__environmentalMicroLifeInstalled) return;
  proto.__environmentalMicroLifeInstalled = true;

  const originalCreate = proto.create;

  proto.create = function environmentalMicroLifeCreate(...args: any[]) {
    const result = originalCreate.apply(this, args);
    const scene = this;
    const zone = String(scene.save?.current_zone ?? "sunlit_shores") as ZoneId;
    if (!(zone in ZONE_SEED)) return result;

    const rnd = seeded(ZONE_SEED[zone]);
    const bounds = scene.physics?.world?.bounds;
    const worldW = Math.max(320, Number(bounds?.width) || 1600);
    const worldH = Math.max(240, Number(bounds?.height) || 1200);
    const owned: Phaser.GameObjects.GameObject[] = [];

    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
      owned.push(obj);
      return obj;
    };

    const xAt = (lo = 0.08, hi = 0.92) => worldW * (lo + rnd() * (hi - lo));
    const yAt = (lo = 0.08, hi = 0.92) => worldH * (lo + rnd() * (hi - lo));

    const fadeIn = (obj: any, alpha: number, delay = 0) => {
      obj.setAlpha(0);
      scene.tweens.add({
        targets: obj,
        alpha,
        duration: 900 + rnd() * 700,
        delay,
        ease: "Sine.easeOut",
      });
    };

    const addMote = (tint: number, alpha = 0.18, radius = 1.4) => {
      const dot = keep(scene.add.circle(xAt(), yAt(), radius, tint, 1).setDepth(8));
      fadeIn(dot, alpha, rnd() * 700);
      scene.tweens.add({
        targets: dot,
        y: dot.y - (8 + rnd() * 14),
        x: dot.x + (rnd() - 0.5) * 10,
        alpha: { from: alpha * 0.55, to: alpha },
        duration: 3200 + rnd() * 2600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    const addPetal = () => {
      const petal = keep(scene.add.ellipse(xAt(), yAt(), 4, 2, 0xf4a6bd, 1).setDepth(7));
      petal.rotation = rnd() * Math.PI;
      fadeIn(petal, 0.28, rnd() * 900);
      scene.tweens.add({
        targets: petal,
        x: petal.x + 18 + rnd() * 28,
        y: petal.y + 10 + rnd() * 20,
        rotation: petal.rotation + Math.PI * (1 + rnd()),
        duration: 5200 + rnd() * 3600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    const addButterfly = () => {
      const container = keep(scene.add.container(xAt(), yAt()).setDepth(9));
      const left = scene.add.ellipse(-2, 0, 4, 3, 0xffd27a, 0.42);
      const right = scene.add.ellipse(2, 0, 4, 3, 0xffe6a6, 0.42);
      container.add([left, right]);
      container.setAlpha(0);
      scene.tweens.add({ targets: container, alpha: 0.7, duration: 1100, delay: rnd() * 1000 });
      scene.tweens.add({
        targets: [left, right],
        scaleX: { from: 0.45, to: 1 },
        duration: 180 + rnd() * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      scene.tweens.add({
        targets: container,
        x: container.x + (rnd() - 0.35) * 70,
        y: container.y + (rnd() - 0.5) * 34,
        duration: 6500 + rnd() * 4500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    // Jewel-toned Act-IV butterflies. These are tiny display containers only:
    // no physics, input, collision, save data, combat, or update-loop hooks.
    const addExoticButterfly = (primary: number, secondary: number, scale = 1) => {
      const container = keep(scene.add.container(xAt(0.12, 0.88), yAt(0.14, 0.88)).setDepth(9));
      const left = scene.add.ellipse(-3, 0, 6, 4, primary, 0.72).setRotation(-0.18);
      const right = scene.add.ellipse(3, 0, 6, 4, secondary, 0.72).setRotation(0.18);
      const leftTip = scene.add.circle(-4.2, -0.5, 1.15, secondary, 0.82);
      const rightTip = scene.add.circle(4.2, -0.5, 1.15, primary, 0.82);
      const body = scene.add.ellipse(0, 0.6, 1.3, 5.2, 0x241b38, 0.9);
      container.add([left, right, leftTip, rightTip, body]);
      container.setScale(scale).setAlpha(0);

      scene.tweens.add({ targets: container, alpha: 0.82, duration: 900, delay: rnd() * 900 });
      scene.tweens.add({
        targets: [left, right, leftTip, rightTip],
        scaleX: { from: 0.38, to: 1 },
        duration: 145 + rnd() * 80,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      scene.tweens.add({
        targets: container,
        x: container.x + (rnd() - 0.45) * 90,
        y: container.y + (rnd() - 0.5) * 48,
        rotation: (rnd() - 0.5) * 0.16,
        duration: 7200 + rnd() * 4200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    const addSparkle = () => {
      const sparkle = keep(scene.add.circle(xAt(0.08, 0.9), yAt(0.55, 0.9), 1 + rnd() * 0.8, 0xfff0bf, 1).setDepth(6));
      sparkle.setAlpha(0);
      scene.tweens.add({
        targets: sparkle,
        alpha: { from: 0.03, to: 0.24 },
        scale: { from: 0.75, to: 1.15 },
        duration: 1300 + rnd() * 900,
        delay: rnd() * 1300,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    };

    const addSmokeWisp = (x: number, y: number, delay: number) => {
      const puff = keep(scene.add.ellipse(x, y, 7, 5, 0xd7dde2, 1).setDepth(7));
      puff.setAlpha(0);
      scene.tweens.add({
        targets: puff,
        y: y - 30,
        x: x + 8,
        scaleX: 1.65,
        scaleY: 1.45,
        alpha: { from: 0, to: 0.12 },
        duration: 4200,
        delay,
        repeat: -1,
        repeatDelay: 900,
        ease: "Sine.easeOut",
        onRepeat: () => {
          puff.setPosition(x, y).setScale(1).setAlpha(0);
        },
      });
    };

    // Delay creation slightly so realm/camera arrival effects establish first.
    scene.time.delayedCall(650, () => {
      if (!scene.scene?.isActive?.()) return;

      if (zone === "sunlit_shores") {
        for (let i = 0; i < 5; i++) addSparkle();
        for (let i = 0; i < 3; i++) addButterfly();
      } else if (zone === "wedding_garden") {
        for (let i = 0; i < 6; i++) addPetal();
        for (let i = 0; i < 3; i++) addButterfly();
      } else if (zone === "the_haven") {
        for (let i = 0; i < 5; i++) addMote(0xffe6c7, 0.14, 1.2);
        addSmokeWisp(worldW * 0.37, worldH * 0.34, 0);
        addSmokeWisp(worldW * 0.63, worldH * 0.39, 1350);
      } else if (zone === "starry_ascent") {
        for (let i = 0; i < 10; i++) addMote(0xd8d4ff, 0.16, 1.15 + rnd() * 0.45);
        addExoticButterfly(0x36e5ff, 0x8d5cff, 1.08);
        addExoticButterfly(0xff5fc8, 0x55f0c7, 0.94);
        addExoticButterfly(0xffc857, 0x7f6cff, 1.16);
        addExoticButterfly(0x69f0ff, 0xff79a8, 1.02);
        addExoticButterfly(0xc86cff, 0x67ffb7, 0.9);
      } else if (zone === "cathedral") {
        for (let i = 0; i < 7; i++) addMote(0xffe7bd, 0.12, 1.1 + rnd() * 0.35);
      }
    });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      for (const obj of owned) if (obj?.active) obj.destroy();
    });

    return result;
  };
}
