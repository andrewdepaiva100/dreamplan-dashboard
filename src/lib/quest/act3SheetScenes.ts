// @ts-nocheck -- Act III sheet presentation only; sheet count/progression stays in the base scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";

const SHEET_SCENES: Record<string, { label: string; title: string; body: string; accent: number }> = {
  "0": {
    // interactionPolish turns this into the single prompt: “Interact with the music sheet”.
    label: "the music sheet",
    title: "The Restless Page",
    body:
      "A torn edge flutters as little shadows circle the staff, trying to shake every note loose. Maria smooths the page beneath her hand and the ink warms rose-gold. The melody does not disappear just because doubt gets loud. “What matters to us is louder than doubt.”",
    accent: 0xff7faf,
  },
  "1": {
    label: "the music sheet",
    title: "The Memory Page",
    body:
      "Gold light gathers between the notes. For one bright heartbeat, Haven falls away and Maria remembers Andrew beside her — missing the rhythm, laughing, then finding it again together. The page seems to hum with the memory. “We always find our way back into step.”",
    accent: 0xffd98b,
  },
  "2": {
    label: "the music sheet",
    title: "The Peaceful Page",
    body:
      "Petals settle around the final page as if the whole garden has gone quiet to listen. Beneath the wind, the worry, and the distant noise, the wedding melody has been here all along — soft, steady, and complete. “Peace does not need to shout.”",
    accent: 0xffefb0,
  },
};

function sheetInteractable(scene: SceneLike, id: string) {
  return (scene.interactables ?? []).find((it: any) => it?.kind === "sheet" && String(it.id) === id);
}

function addOrbit(scene: SceneLike, x: number, y: number, index: number) {
  const mote = scene.add.circle(x, y, 4.5, index % 2 ? 0xff79ad : 0x8d5ba7, 0.82).setDepth(14);
  mote.setData("act3SheetScene", "0");
  const angle = (index / 3) * Math.PI * 2;
  const radiusX = 30 + index * 5;
  const radiusY = 18 + index * 2;
  scene.tweens.addCounter({
    from: 0,
    to: Math.PI * 2,
    duration: 2400 + index * 280,
    repeat: -1,
    onUpdate: (tw: any) => {
      if (!mote.active) return;
      const a = angle + tw.getValue();
      mote.setPosition(x + Math.cos(a) * radiusX, y + Math.sin(a) * radiusY);
      mote.setAlpha(0.48 + Math.sin(a * 2) * 0.24);
    },
  });
  return mote;
}

function addSheetInk(scene: SceneLike, x: number, y: number, depth: number, visuals: any[]) {
  const ink = scene.add.graphics().setDepth(depth);
  ink.lineStyle(1, 0x6b493d, 0.76);
  for (let row = 0; row < 2; row++) {
    const sy = y - 11 + row * 16;
    for (let line = 0; line < 5; line++) {
      ink.lineBetween(x - 17, sy + line * 2, x + 17, sy + line * 2);
    }
  }
  ink.fillStyle(0x70453e, 0.9);
  const notes = [
    [-12, -8], [-4, -5], [5, -9], [13, -4],
    [-14, 9], [-7, 13], [2, 8], [10, 12], [16, 7],
  ];
  notes.forEach(([ox, oy], i) => {
    ink.fillEllipse(x + ox, y + oy, 3.2, 2.3);
    ink.lineStyle(1, 0x70453e, 0.9);
    ink.lineBetween(x + ox + 1.4, y + oy, x + ox + 1.4, y + oy - (i % 2 ? 7 : 6));
  });
  visuals.push(ink);

  const monogram = scene.add
    .text(x, y + 20, "A  ♥  M", {
      fontFamily: "Georgia, serif",
      fontSize: "7px",
      fontStyle: "bold italic",
      color: "#a46963",
      stroke: "#fff0d2",
      strokeThickness: 1,
    })
    .setOrigin(0.5)
    .setDepth(depth + 1)
    .setAlpha(0.9);
  visuals.push(monogram);
}

function addWeddingPageFrame(scene: SceneLike, it: any, id: string, visuals: any[]) {
  const cfg = SHEET_SCENES[id];
  const x = it.obj.x;
  const y = it.obj.y;
  const accent = cfg?.accent ?? 0xffd98b;
  const pageDepth = Math.max(8, it.obj.depth ?? 8);

  const halo = scene.add.circle(x, y, 39, accent, 0.11).setDepth(2);
  halo.setStrokeStyle(2, 0xffe7ad, 0.52);
  visuals.push(halo);
  scene.tweens.add({
    targets: halo,
    alpha: { from: 0.07, to: 0.21 },
    scale: { from: 0.92, to: 1.16 },
    duration: 1650,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const outer = scene.add
    .rectangle(x, y, 47, 58, 0xfff6df, 0.98)
    .setDepth(pageDepth - 2)
    .setStrokeStyle(2, 0xc98b62, 0.96);
  const inner = scene.add
    .rectangle(x, y, 41, 52, 0xffefd0, 0.44)
    .setDepth(pageDepth - 1)
    .setStrokeStyle(1, 0xe4bd83, 0.92);
  visuals.push(outer, inner);

  const ribbonTop = scene.add.rectangle(x, y - 24, 31, 2, 0xd58a98, 0.68).setDepth(pageDepth);
  const ribbonBottom = scene.add.rectangle(x, y + 24, 31, 2, 0xd58a98, 0.52).setDepth(pageDepth);
  visuals.push(ribbonTop, ribbonBottom);

  addSheetInk(scene, x, y - 1, pageDepth + 1, visuals);

  const flourishes = [
    [-20, -25, "❦"],
    [20, -25, "❦"],
    [-20, 25, "♥"],
    [20, 25, "♥"],
  ];
  flourishes.forEach(([ox, oy, glyph], i) => {
    const mark = scene.add
      .text(x + Number(ox), y + Number(oy), String(glyph), {
        fontFamily: "Georgia, serif",
        fontSize: i < 2 ? "9px" : "7px",
        color: i < 2 ? "#bc7a8a" : "#d69a68",
      })
      .setOrigin(0.5)
      .setDepth(pageDepth + 2)
      .setAlpha(0.92);
    visuals.push(mark);
  });

  for (const [ox, oy] of [[-24, -30], [24, -30], [-24, 30], [24, 30]]) {
    const jewel = scene.add.circle(x + ox, y + oy, 2.5, 0xffd36d, 0.95).setDepth(pageDepth + 2);
    visuals.push(jewel);
    scene.tweens.add({
      targets: jewel,
      alpha: { from: 0.4, to: 1 },
      scale: { from: 0.72, to: 1.28 },
      duration: 900 + Math.abs(ox * 11 + oy),
      yoyo: true,
      repeat: -1,
    });
  }

  const noteGlyphs = ["♪", "♫", "♪", "♩"];
  noteGlyphs.forEach((glyph, i) => {
    const note = scene.add
      .text(x + (i - 1.5) * 20, y - 39 - (i % 2) * 5, glyph, {
        fontFamily: "Georgia, serif",
        fontSize: i === 1 ? "13px" : "10px",
        color: i % 2 ? "#ffd46f" : "#ff9fbd",
        stroke: "#5a3658",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(pageDepth + 3)
      .setAlpha(0.8);
    visuals.push(note);
    scene.tweens.add({
      targets: note,
      y: note.y - 9 - i,
      alpha: { from: 0.38, to: 0.96 },
      duration: 1350 + i * 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  });

  it.obj.setScale(0.74).setTint(0xffe6c2).setDepth(pageDepth + 2).setAlpha(0.72);
  scene.tweens.add({
    targets: [outer, inner],
    y: y - 2,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}

function decorateSheet(scene: SceneLike, id: string) {
  const it = sheetInteractable(scene, id);
  const cfg = SHEET_SCENES[id];
  if (!it?.obj || !cfg) return;
  it.label = cfg.label;
  const x = it.obj.x;
  const y = it.obj.y;
  const visuals: any[] = [];

  addWeddingPageFrame(scene, it, id, visuals);

  if (id === "0") {
    for (let i = 0; i < 3; i++) visuals.push(addOrbit(scene, x, y, i));
    const tremble = scene.tweens.add({
      targets: it.obj,
      x: x + 1.5,
      duration: 105,
      yoyo: true,
      repeat: -1,
    });
    it.obj.setData("act3SheetTremble", tremble);
  } else if (id === "1") {
    const memoryRing = scene.add.circle(x, y, 50, 0xffd98b, 0.07).setDepth(2);
    memoryRing.setStrokeStyle(2, 0xffc86a, 0.4);
    visuals.push(memoryRing);
    scene.tweens.add({
      targets: memoryRing,
      alpha: 0.2,
      scale: 1.14,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  } else {
    const sanctuary = scene.add.circle(x, y, 56, 0xfff1bd, 0.065).setDepth(2);
    sanctuary.setStrokeStyle(1.5, 0xffe7ad, 0.4);
    visuals.push(sanctuary);
    scene.tweens.add({
      targets: sanctuary,
      alpha: 0.18,
      scale: 1.1,
      duration: 1850,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    for (let i = 0; i < 7; i++) {
      const petal = scene.add
        .ellipse(x + Phaser.Math.Between(-40, 40), y + Phaser.Math.Between(-30, 30), 5, 3, 0xffb8cf, 0.72)
        .setDepth(4);
      visuals.push(petal);
      scene.tweens.add({
        targets: petal,
        y: petal.y - 16,
        x: petal.x + Phaser.Math.Between(-10, 10),
        angle: Phaser.Math.Between(-80, 80),
        alpha: 0.15,
        duration: 1800 + i * 150,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  it.obj.setData("act3SheetVisuals", visuals);
}

function clearSheetScene(scene: SceneLike, it: any) {
  const visuals = it?.obj?.getData?.("act3SheetVisuals") ?? [];
  const tremble = it?.obj?.getData?.("act3SheetTremble");
  tremble?.stop?.();
  for (const visual of visuals) {
    if (!visual) continue;
    scene.tweens?.killTweensOf?.(visual);
    visual.destroy?.();
  }
}

function addRevealNotes(scene: SceneLike, x: number, y: number, accent: number) {
  const total = 14;
  for (let i = 0; i < total; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const lane = Math.floor(i / 2);
    const spreadX = 24 + lane * 10;
    const rise = 30 + lane * 8;
    const note = scene.add
      .text(x + side * 4, y - 2, i % 4 === 0 ? "♫" : i % 3 === 0 ? "♩" : "♪", {
        fontFamily: "Georgia, serif",
        fontSize: i % 4 === 0 ? "15px" : i % 3 === 0 ? "12px" : "10px",
        color: i % 2 === 0 ? "#ffe59a" : "#ff9fbd",
        stroke: "#60405f",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0.94)
      .setScale(0.72);

    scene.tweens.add({
      targets: note,
      x: x + side * spreadX,
      y: y - rise - (lane % 2) * 8,
      angle: side * (8 + lane * 2),
      alpha: 0,
      scale: 1.22 + (i % 3) * 0.08,
      delay: lane * 55,
      duration: 920 + lane * 55,
      ease: "Sine.easeOut",
      onComplete: () => note.destroy(),
    });
  }

  for (let i = 0; i < 7; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const spark = scene.add.circle(x, y, 1.8 + (i % 2) * 0.7, 0xffe7a1, 0.9).setDepth(19);
    scene.tweens.add({
      targets: spark,
      x: x + side * (18 + i * 8),
      y: y - 24 - i * 9,
      alpha: 0,
      scale: 0.3,
      delay: i * 45,
      duration: 760 + i * 40,
      ease: "Sine.easeOut",
      onComplete: () => spark.destroy(),
    });
  }

  const ring = scene.add.circle(x, y, 18, accent, 0.08).setDepth(7).setStrokeStyle(2, 0xffe8a6, 0.78);
  scene.tweens.add({
    targets: ring,
    scale: 4.1,
    alpha: 0,
    duration: 1050,
    ease: "Sine.easeOut",
    onComplete: () => ring.destroy(),
  });
}

function playDiscovery(scene: SceneLike, it: any) {
  const id = String(it.id ?? "");
  const cfg = SHEET_SCENES[id];
  if (!cfg) return;
  const x = it.obj?.x ?? scene.player.x;
  const y = it.obj?.y ?? scene.player.y;

  scene.cameras.main.flash(id === "1" ? 280 : 210, 255, id === "0" ? 194 : 231, id === "0" ? 218 : 178);
  scene.spawnSparkle?.(x, y, cfg.accent, id === "1" ? 24 : 20);
  addRevealNotes(scene, x, y, cfg.accent);

  if (id === "0") {
    scene.spawnSparkle?.(x - 14, y + 4, 0xff8fba, 10);
  } else if (id === "1") {
    const echoA = scene.add.ellipse(x - 18, y - 8, 10, 24, 0xffd6e5, 0.32).setDepth(12);
    const echoB = scene.add.ellipse(x + 18, y - 8, 10, 24, 0x9fc8ff, 0.3).setDepth(12);
    scene.tweens.add({
      targets: [echoA, echoB],
      y: y - 22,
      alpha: 0,
      duration: 1200,
      ease: "Sine.easeOut",
      onComplete: () => {
        echoA.destroy();
        echoB.destroy();
      },
    });
  } else {
    const pulse = scene.add.circle(x, y, 18, 0xfff1bd, 0.16).setDepth(3);
    scene.tweens.add({
      targets: pulse,
      scale: 3.8,
      alpha: 0,
      duration: 1050,
      ease: "Sine.easeOut",
      onComplete: () => pulse.destroy(),
    });
  }

  scene.time.delayedCall(100, () => scene.openModal?.({ type: "info", title: cfg.title, body: cfg.body }));
}

function spreadTownHallDecor(scene: SceneLike, runBuild: () => any) {
  const originalScatterDecor = scene.scatterDecor;
  const originalAddStalls = scene.addStalls;

  scene.scatterDecor = function act3SpreadVillage(seed: number, options: any, ...rest: any[]) {
    if (seed === 33 && Array.isArray(options?.village)) {
      const village = options.village.map((spot: number[]) => {
        const [x, y] = spot;
        if (x === 40 && y === 34) return [36, 38];
        if (x === 82 && y === 30) return [90, 34];
        return spot;
      });
      return originalScatterDecor.call(scene, seed, { ...options, village }, ...rest);
    }
    return originalScatterDecor.call(scene, seed, options, ...rest);
  };

  scene.addStalls = function act3SpreadStalls(spots: number[][], ...rest: any[]) {
    const moved = Array.isArray(spots)
      ? spots.map((spot: number[]) => {
          const [x, y] = spot;
          if (x === 52 && y === 30) return [46, 32];
          if (x === 60 && y === 30) return [54, 32];
          if (x === 76 && y === 30) return [80, 32];
          if (x === 84 && y === 30) return [88, 32];
          return spot;
        })
      : spots;
    return originalAddStalls.call(scene, moved, ...rest);
  };

  try {
    return runBuild();
  } finally {
    scene.scatterDecor = originalScatterDecor;
    scene.addStalls = originalAddStalls;
  }
}

export function installAct3SheetScenes(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3SheetScenesInstalled) return;
  proto.__act3SheetScenesInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  proto.buildAct3 = function act3SheetScenesBuild(...args: any[]) {
    const result = spreadTownHallDecor(this, () => originalBuildAct3.apply(this, args));
    if (this.save?.current_zone === ZONE) {
      decorateSheet(this, "0");
      decorateSheet(this, "1");
      decorateSheet(this, "2");
    }
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act3SheetScenesInteract(...args: any[]) {
    if (this.save?.current_zone !== ZONE || this.frozen) return originalInteract.apply(this, args);
    const it = this.nearest?.();
    if (!it || it.kind !== "sheet" || !SHEET_SCENES[String(it.id ?? "")]) return originalInteract.apply(this, args);

    clearSheetScene(this, it);
    playDiscovery(this, it);
    return originalInteract.apply(this, args);
  };
}
