// @ts-nocheck -- Small Act II-only visual and interaction tuning decorator.

const ZONE = "wedding_garden";
const SEASON_KEYS = new Set(["Spring", "Summer", "Autumn", "Winter"]);

function addGardenDensity(scene: any) {
  if (scene.save?.current_zone !== ZONE) return;

  // Six carefully placed solid props add structure without touching the
  // Conservatory plaza, fountain perimeter, house approach, key spaces, or
  // the main promenade. Reuse the base decor builder so collision footprints
  // stay identical to every other bench and lamp in the game.
  scene.scatterDecor?.(22021, {
    lamps: [
      [24, 42],
      [40, 56],
      [82, 28],
      [84, 76],
    ],
    benches: [
      [42, 28],
      [38, 74],
    ],
  });

  // Small non-colliding rose pockets sit in otherwise empty grass/garden-bed
  // edges. They are intentionally separate from the 200 ambient flower count.
  const rosePockets: [number, number][] = [
    [28, 16],
    [98, 16],
    [28, 80],
    [98, 80],
    [62, 23],
    [70, 23],
    [39, 35],
    [42, 70],
  ];
  const roseTints = [0xe65f86, 0xf1a1bb, 0xffffff, 0xb779e8];
  rosePockets.forEach(([tx, ty], pocket) => {
    for (let i = 0; i < 3; i++) {
      const x = scene.wx(tx + (i - 1) * 0.85);
      const y = scene.wy(ty + (i % 2 ? 0.45 : -0.2));
      const bloom = scene.add
        .ellipse(x, y, 7, 5, roseTints[(pocket + i) % roseTints.length], 0.92)
        .setDepth(3);
      const center = scene.add.circle(x, y, 1.2, 0xffe0a1, 0.95).setDepth(3.1);
      scene.tweens.add({
        targets: [bloom, center],
        scaleX: { from: 0.94, to: 1.04 },
        scaleY: { from: 0.94, to: 1.04 },
        duration: 1500 + pocket * 45 + i * 90,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  });

  // Three light movement pockets make the garden feel occupied without adding
  // collision, lights, enemies, or gameplay state.
  const lifePockets: [number, number][] = [
    [34, 34],
    [46, 76],
    [84, 36],
  ];
  lifePockets.forEach(([tx, ty], pocket) => {
    for (let i = 0; i < 2; i++) {
      const x = scene.wx(tx + i * 1.7);
      const y = scene.wy(ty + (i ? 1.1 : -0.4));
      const butterfly = scene.add.sprite(x, y, "butterfly").setDepth(7).setAlpha(0.86);
      scene.tweens.add({
        targets: butterfly,
        x: x + (i ? -18 : 18),
        y: y - 10 - pocket * 2,
        angle: i ? -8 : 8,
        duration: 1600 + pocket * 180 + i * 220,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
    for (let i = 0; i < 3; i++) {
      const x = scene.wx(tx - 1.2 + i * 1.1);
      const y = scene.wy(ty + 1.4 + (i % 2) * 0.7);
      const petal = scene.add.sprite(x, y, "petal").setDepth(6).setAlpha(0.72).setScale(0.7);
      scene.tweens.add({
        targets: petal,
        x: x + 10 + i * 4,
        y: y + 5,
        angle: 30 + i * 18,
        alpha: { from: 0.48, to: 0.82 },
        duration: 1900 + i * 240 + pocket * 120,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  });
}

export function installAct2VisualTuning(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2VisualTuningInstalled) return;
  proto.__act2VisualTuningInstalled = true;

  // Keep Wedding Garden ambient flowers at exactly 200. Story flowers around
  // Evelyn and the final rose reveal remain untouched.
  const originalScatterDecor = proto.scatterDecor;
  proto.scatterDecor = function act2FlowerDensity(seed: number, opts: any) {
    if (this.save?.current_zone !== ZONE || !opts || typeof opts.flowers !== "number") {
      return originalScatterDecor.call(this, seed, opts);
    }
    return originalScatterDecor.call(this, seed, {
      ...opts,
      flowers: 200,
    });
  };

  // Add curated density after the base Wedding Garden has finished building.
  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function act2GardenDensity(...args: any[]) {
    const result = originalBuildAct2.apply(this, args);
    addGardenDensity(this);
    return result;
  };

  // Give each Seasonal Key a clear proper name and make the nearby interaction
  // read like opening that key. The existing E/Enter interaction and collection
  // logic remains authoritative, so progression and save behavior do not change.
  const originalAddInteractable = proto.addInteractable;
  proto.addInteractable = function act2NamedSeasonKey(
    x: number,
    y: number,
    texture: string,
    kind: string,
    label: string,
    opts: any = {},
  ) {
    if (this.save?.current_zone === ZONE && kind === "season-key" && SEASON_KEYS.has(opts?.id)) {
      label = `Open ${opts.id} Key`;
    }
    return originalAddInteractable.call(this, x, y, texture, kind, label, opts);
  };

  // Keep the four Seasonal Keys readable, but make their glow low, soft and
  // compact instead of a tall beacon. Other beacons are untouched.
  const originalAddKeyBeacon = proto.addKeyBeacon;
  proto.addKeyBeacon = function act2CompactSeasonKeyBeacon(x: number, y: number, id: string, tint: number) {
    const result = originalAddKeyBeacon.call(this, x, y, id, tint);
    if (this.save?.current_zone !== ZONE || !SEASON_KEYS.has(id)) return result;

    const beacon = this.keyBeacons?.get?.(id);
    if (!beacon) return result;

    // Much softer overall intensity and roughly half-height/footprint.
    beacon.setAlpha?.(0.34);
    beacon.setScale?.(0.64, 0.48);

    const children = beacon.list ?? beacon.getAll?.() ?? [];
    for (const child of children) {
      if (typeof child?.alpha === "number") child.setAlpha?.(Math.min(child.alpha, 0.34));

      // Pull any stacked beacon elements closer to the key so the effect hugs
      // the pickup rather than rising like a column of light.
      if (typeof child?.y === "number") child.y *= 0.58;
      if (typeof child?.scaleY === "number") child.scaleY *= 0.72;
      if (typeof child?.scaleX === "number") child.scaleX *= 0.86;
    }
    return result;
  };
}
