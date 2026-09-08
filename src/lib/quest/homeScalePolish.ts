// @ts-nocheck -- Runtime decorator for Maria's house proportion and prompt polish.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const OBJECT_SCALE = 0.78;

function scaleFurniture(scene: SceneLike) {
  for (const child of scene.children?.list ?? []) {
    if (child?.getData?.("home-remaster-object") === true) {
      child.setScale?.(OBJECT_SCALE);
    }

    if (child?.getData?.("home-remaster-solid") === true) {
      const body = child.body as Phaser.Physics.Arcade.StaticBody | undefined;
      if (!body || child.getData?.("home-proportion-scaled")) continue;
      child.setData?.("home-proportion-scaled", true);
      body.setSize?.(body.width * OBJECT_SCALE, body.height * OBJECT_SCALE, true);
      body.updateFromGameObject?.();
    }
  }
}

function stylePrompt(scene: SceneLike) {
  const prompt = scene.promptText as Phaser.GameObjects.Text | undefined;
  if (!prompt?.active) return;
  prompt
    .setDepth(20000)
    .setOrigin(0.5, 1)
    .setStyle({
      fontFamily: "system-ui, sans-serif",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#fff1d0",
      backgroundColor: "rgba(22, 15, 12, 0.96)",
      padding: { x: 9, y: 5 },
      stroke: "#4a2f20",
      strokeThickness: 2,
    });
}

function placePrompt(scene: SceneLike) {
  const prompt = scene.promptText as Phaser.GameObjects.Text | undefined;
  if (!prompt?.active) return;

  const near = scene.nearest?.();
  if (!near) {
    prompt.setVisible(false);
    return;
  }

  const liftByKind: Record<string, number> = {
    bed: 58,
    chest: 45,
    hearth: 74,
    door: 38,
  };
  const lift = liftByKind[near.kind] ?? 50;
  const width = Number(scene.scale?.width ?? 800);
  const height = Number(scene.scale?.height ?? 600);
  const x = Phaser.Math.Clamp(Number(near.x ?? scene.player?.x ?? width / 2), 54, width - 54);
  const y = Phaser.Math.Clamp(Number(near.y ?? scene.player?.y ?? height / 2) - lift, 38, height - 38);

  prompt
    .setDepth(20000)
    .setPosition(x, y)
    .setText(`E — ${near.label}`)
    .setVisible(true);
}

export function installHomeScalePolish(QuestHouseScene: SceneCtor) {
  const house = QuestHouseScene?.prototype;
  if (!house || house.__homeScalePolishInstalled) return;
  house.__homeScalePolishInstalled = true;

  const originalCreate = house.create;
  house.create = function proportionedHouseCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    scaleFurniture(this);
    stylePrompt(this);
    return result;
  };

  const originalUpdate = house.update;
  house.update = function proportionedHouseUpdate(this: SceneLike, ...args: any[]) {
    const result = originalUpdate?.apply(this, args);
    placePrompt(this);
    return result;
  };
}
