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
  const radiusX = 26 + index * 4;
  const radiusY = 15 + index * 2;
  scene.tweens.addCounter({
    from: 0,
    to: Math.PI * 2,
    duration: 2300 + index * 280,
    repeat: -1,
    onUpdate: (tw: any) => {
      if (!mote.active) return;
      const a = angle + tw.getValue();
      mote.setPosition(x + Math.cos(a) * radiusX, y + Math.sin(a) * radiusY);
      mote.setAlpha(0.5 + Math.sin(a * 2) * 0.22);
    },
  });
  return mote;
}

function addWeddingPageFrame(scene: SceneLike, it: any, id: string, visuals: any[]) {
  const cfg = SHEET_SCENES[id];
  const x = it.obj.x;
  const y = it.obj.y;
  const accent = cfg?.accent ?? 0xffd98b;

  // A shared ornate wedding-song silhouette makes all three pages read as one
  // special set, while each page keeps its own authored mood around it.
  const halo = scene.add.circle(x, y, 32, accent, 0.12).setDepth(2);
  halo.setStrokeStyle(1.5, 0xffe7ad, 0.5);
  visuals.push(halo);
  scene.tweens.add({
    targets: halo,
    alpha: { from: 0.08, to: 0.22 },
    scale: { from: 0.94, to: 1.14 },
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const parchment = scene.add
    .rectangle(x, y, 31, 39, 0xfff2cf, 0.24)
    .setDepth(Math.max(3, (it.obj.depth ?? 8) - 1))
    .setStrokeStyle(1.5, 0xd9aa55, 0.86);
  visuals.push(parchment);
  scene.tweens.add({
    targets: parchment,
    alpha: { from: 0.2, to: 0.34 },
    duration: 1250,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  for (const [ox, oy] of [
    [-17, -21],
    [17, -21],
    [-17, 21],
    [17, 21],
  ]) {
    const jewel = scene.add.circle(x + ox, y + oy, 2.3, 0xffd36d, 0.9).setDepth((it.obj.depth ?? 8) + 1);
    visuals.push(jewel);
    scene.tweens.add({
      targets: jewel,
      alpha: { from: 0.45, to: 1 },
      scale: { from: 0.75, to: 1.25 },
      duration: 900 + Math.abs(ox * 13 + oy),
      yoyo: true,
      repeat: -1,
    });
  }

  const noteGlyphs = ["♪", "♫", "♪"];
  noteGlyphs.forEach((glyph, i) => {
    const note = scene.add
      .text(x + (i - 1) * 18, y - 30 - (i % 2) * 5, glyph, {
        fontFamily: "Georgia, serif",
        fontSize: i === 1 ? "12px" : "10px",
        color: i === 1 ? "#ffd46f" : "#ff9fbd",
        stroke: "#5a3658",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth((it.obj.depth ?? 8) + 2)
      .setAlpha(0.78);
    visuals.push(note);
    scene.tweens.add({
      targets: note,
      y: note.y - 8 - i * 2,
      alpha: { from: 0.42, to: 0.95 },
      duration: 1300 + i * 220,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  });

  // Let the actual collectible page become the visual focus instead of a tiny
  // generic pickup floating inside the effects.
  it.obj.setScale(1.22).setTint(0xfff0d0);
  scene.tweens.add({
    targets: it.obj,
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 1450,
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
    const memoryRing = scene.add.circle(x, y, 41, 0xffd98b, 0.08).setDepth(2);
    memoryRing.setStrokeStyle(2, 0xffc86a, 0.42);
    visuals.push(memoryRing);
    scene.tweens.add({
      targets: memoryRing,
      alpha: 0.2,
      scale: 1.16,
      duration: 1350,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  } else {
    const sanctuary = scene.add.circle(x, y, 48, 0xfff1bd, 0.07).setDepth(2);
    sanctuary.setStrokeStyle(1.5, 0xffe7ad, 0.4);
    visuals.push(sanctuary);
    scene.tweens.add({
      targets: sanctuary,
      alpha: 0.18,
      scale: 1.1,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    for (let i = 0; i < 6; i++) {
      const petal = scene.add
        .ellipse(x + Phaser.Math.Between(-34, 34), y + Phaser.Math.Between(-25, 25), 5, 3, 0xffb8cf, 0.72)
        .setDepth(4);
      visuals.push(petal);
      scene.tweens.add({
        targets: petal,
        y: petal.y - 14,
        x: petal.x + Phaser.Math.Between(-9, 9),
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
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const note = scene.add
      .text(x, y, i % 3 === 0 ? "♫" : "♪", {
        fontFamily: "Georgia, serif",
        fontSize: i % 3 === 0 ? "13px" : "10px",
        color: i % 2 === 0 ? "#ffe59a" : "#ff9fbd",
        stroke: "#60405f",
        strokeThickness: 1,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setAlpha(0.92);
    scene.tweens.add({
      targets: note,
      x: x + Math.cos(angle) * (42 + (i % 2) * 16),
      y: y + Math.sin(angle) * (28 + (i % 2) * 10) - 10,
      alpha: 0,
      scale: 1.3,
      duration: 850 + i * 35,
      ease: "Sine.easeOut",
      onComplete: () => note.destroy(),
    });
  }

  const ring = scene.add.circle(x, y, 18, accent, 0.08).setDepth(7).setStrokeStyle(2, 0xffe8a6, 0.75);
  scene.tweens.add({
    targets: ring,
    scale: 3.4,
    alpha: 0,
    duration: 950,
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

export function installAct3SheetScenes(QuestScene: SceneCtor) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3SheetScenesInstalled) return;
  proto.__act3SheetScenesInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  proto.buildAct3 = function act3SheetScenesBuild(...args: any[]) {
    const result = originalBuildAct3.apply(this, args);
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
    // The base handler remains the single source of truth for removal, sheet
    // counting, 3/3 objective changes, companion spawn, and Andrew progression.
    return originalInteract.apply(this, args);
  };
}
