// @ts-nocheck -- Act III sheet presentation only; sheet count/progression stays in the base scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "the_haven";

const SHEET_SCENES: Record<string, { label: string; title: string; body: string }> = {
  "0": {
    label: "Examine the restless music sheet",
    title: "The Restless Page",
    body: "The noise circles the page, but it cannot change the notes. Maria steadies it in her hands. “What matters to us is louder than doubt.”",
  },
  "1": {
    label: "Remember with the music sheet",
    title: "The Memory Page",
    body: "For a heartbeat, Haven falls away. Maria remembers Andrew beside her, both of them laughing when they lost the rhythm and finding it again together. “We always find our way back into step.”",
  },
  "2": {
    label: "Listen beside the music sheet",
    title: "The Peaceful Page",
    body: "Under the wind, the worry, and the distant noise, the melody was here all along. Maria listens until she can hear it clearly. “Peace does not need to shout.”",
  },
};

function sheetInteractable(scene: SceneLike, id: string) {
  return (scene.interactables ?? []).find((it: any) => it?.kind === "sheet" && String(it.id) === id);
}

function addOrbit(scene: SceneLike, x: number, y: number, index: number) {
  const mote = scene.add.circle(x, y, 5, index % 2 ? 0xff79ad : 0x8d5ba7, 0.8).setDepth(14);
  mote.setData("act3SheetScene", "0");
  const angle = (index / 3) * Math.PI * 2;
  const radiusX = 22 + index * 3;
  const radiusY = 13 + index * 2;
  scene.tweens.addCounter({
    from: 0,
    to: Math.PI * 2,
    duration: 2200 + index * 260,
    repeat: -1,
    onUpdate: (tw: any) => {
      if (!mote.active) return;
      const a = angle + tw.getValue();
      mote.setPosition(x + Math.cos(a) * radiusX, y + Math.sin(a) * radiusY);
      mote.setAlpha(0.55 + Math.sin(a * 2) * 0.2);
    },
  });
  return mote;
}

function decorateSheet(scene: SceneLike, id: string) {
  const it = sheetInteractable(scene, id);
  const cfg = SHEET_SCENES[id];
  if (!it?.obj || !cfg) return;
  it.label = cfg.label;
  const x = it.obj.x;
  const y = it.obj.y;
  const visuals: any[] = [];

  if (id === "0") {
    for (let i = 0; i < 3; i++) visuals.push(addOrbit(scene, x, y, i));
    const tremble = scene.tweens.add({ targets: it.obj, x: x + 2, duration: 90, yoyo: true, repeat: -1 });
    it.obj.setData("act3SheetTremble", tremble);
  } else if (id === "1") {
    const glow = scene.add.circle(x, y, 24, 0xffd98b, 0.12).setDepth(3);
    visuals.push(glow);
    scene.tweens.add({ targets: glow, alpha: 0.3, scale: 1.18, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  } else {
    const sanctuary = scene.add.circle(x, y, 38, 0xfff1bd, 0.1).setDepth(2);
    visuals.push(sanctuary);
    scene.tweens.add({ targets: sanctuary, alpha: 0.22, scale: 1.08, duration: 1700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    for (let i = 0; i < 4; i++) {
      const petal = scene.add.ellipse(x + Phaser.Math.Between(-28, 28), y + Phaser.Math.Between(-22, 22), 5, 3, 0xffb8cf, 0.72).setDepth(4);
      visuals.push(petal);
      scene.tweens.add({ targets: petal, y: petal.y - 12, x: petal.x + Phaser.Math.Between(-8, 8), alpha: 0.18, duration: 1800 + i * 180, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
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

function playDiscovery(scene: SceneLike, it: any) {
  const id = String(it.id ?? "");
  const cfg = SHEET_SCENES[id];
  if (!cfg) return;
  const x = it.obj?.x ?? scene.player.x;
  const y = it.obj?.y ?? scene.player.y;

  if (id === "0") {
    scene.cameras.main.flash(180, 255, 184, 215);
    scene.spawnSparkle?.(x, y, 0xff8fba, 18);
  } else if (id === "1") {
    scene.cameras.main.flash(260, 255, 229, 177);
    scene.spawnSparkle?.(x - 16, y - 8, 0xffd98b, 10);
    scene.spawnSparkle?.(x + 16, y - 8, 0xffb6ce, 10);
    const echoA = scene.add.ellipse(x - 18, y - 8, 10, 24, 0xffd6e5, 0.32).setDepth(12);
    const echoB = scene.add.ellipse(x + 18, y - 8, 10, 24, 0x9fc8ff, 0.3).setDepth(12);
    scene.tweens.add({ targets: [echoA, echoB], y: y - 20, alpha: 0, duration: 1100, ease: "Sine.easeOut", onComplete: () => { echoA.destroy(); echoB.destroy(); } });
  } else {
    scene.spawnSparkle?.(x, y, 0xffefb0, 20);
    const pulse = scene.add.circle(x, y, 18, 0xfff1bd, 0.18).setDepth(3);
    scene.tweens.add({ targets: pulse, scale: 3.2, alpha: 0, duration: 950, ease: "Sine.easeOut", onComplete: () => pulse.destroy() });
  }

  scene.time.delayedCall(80, () => scene.openModal?.({ type: "info", title: cfg.title, body: cfg.body }));
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
