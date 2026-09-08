// @ts-nocheck -- Isolated Wedding Garden wildlife decorator.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const ZONE = "wedding_garden";
const NEW_SPECIES = new Set(["moon-hare", "peacock", "garden-fox"]);

function canvas(scene: SceneLike, key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  if (!tex) return;
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, w, h);
  draw(c);
  tex.refresh();
}

function makeTextures(scene: SceneLike) {
  canvas(scene, "moon-hare", 24, 25, (c) => {
    c.fillStyle = "#d8d0e8";
    c.fillRect(8, 8, 10, 11);
    c.fillRect(10, 4, 7, 7);
    c.fillRect(10, 0, 2, 7);
    c.fillRect(15, 1, 2, 6);
    c.fillStyle = "#f1e9ff";
    c.fillRect(11, 1, 1, 4);
    c.fillRect(15, 2, 1, 3);
    c.fillRect(6, 17, 5, 5);
    c.fillRect(16, 17, 5, 5);
    c.fillStyle = "#8f78b7";
    c.fillRect(11, 8, 2, 2);
    c.fillRect(16, 8, 2, 2);
    c.fillStyle = "#fff4c7";
    c.fillRect(12, 9, 1, 1);
    c.fillRect(17, 9, 1, 1);
    c.fillStyle = "#f6b6cf";
    c.fillRect(14, 12, 2, 1);
    c.fillStyle = "#bcaed8";
    c.fillRect(4, 11, 5, 6);
    c.fillRect(18, 12, 4, 5);
  });

  canvas(scene, "peacock", 29, 31, (c) => {
    c.fillStyle = "#245a55";
    c.fillRect(11, 9, 8, 14);
    c.fillStyle = "#2f7b75";
    c.fillRect(12, 5, 6, 7);
    c.fillStyle = "#d9c36c";
    c.fillRect(14, 6, 2, 2);
    c.fillStyle = "#162f35";
    c.fillRect(15, 6, 1, 1);
    c.fillStyle = "#6ea65f";
    c.fillRect(3, 14, 23, 12);
    c.fillRect(6, 10, 17, 15);
    c.fillStyle = "#3f7c5d";
    c.fillRect(7, 13, 4, 8);
    c.fillRect(18, 13, 4, 8);
    c.fillStyle = "#365c9b";
    c.fillRect(8, 15, 3, 3);
    c.fillRect(18, 15, 3, 3);
    c.fillRect(13, 20, 3, 3);
    c.fillStyle = "#f2cf59";
    c.fillRect(9, 16, 1, 1);
    c.fillRect(19, 16, 1, 1);
    c.fillRect(14, 21, 1, 1);
    c.fillStyle = "#a7774d";
    c.fillRect(12, 23, 2, 6);
    c.fillRect(17, 23, 2, 6);
    c.fillStyle = "#d2a765";
    c.fillRect(11, 28, 4, 2);
    c.fillRect(16, 28, 4, 2);
    c.fillStyle = "#54715c";
    c.fillRect(13, 1, 1, 4);
    c.fillRect(16, 1, 1, 4);
    c.fillStyle = "#5d8f64";
    c.fillRect(12, 0, 3, 2);
    c.fillRect(15, 0, 3, 2);
  });

  canvas(scene, "garden-fox", 31, 24, (c) => {
    c.fillStyle = "#b96f42";
    c.fillRect(8, 8, 15, 10);
    c.fillRect(18, 5, 8, 9);
    c.fillRect(20, 2, 3, 5);
    c.fillRect(25, 3, 3, 5);
    c.fillStyle = "#e6b07d";
    c.fillRect(21, 8, 6, 5);
    c.fillRect(10, 15, 7, 4);
    c.fillStyle = "#f5dfc5";
    c.fillRect(23, 10, 5, 3);
    c.fillRect(6, 17, 5, 4);
    c.fillStyle = "#3b2b28";
    c.fillRect(22, 7, 2, 2);
    c.fillRect(27, 10, 2, 2);
    c.fillStyle = "#8f5439";
    c.fillRect(2, 10, 8, 7);
    c.fillRect(0, 8, 5, 5);
    c.fillStyle = "#f4d8b8";
    c.fillRect(0, 8, 3, 3);
    c.fillStyle = "#6f4635";
    c.fillRect(9, 18, 3, 5);
    c.fillRect(19, 18, 3, 5);
  });
}

export function installAct2Wildlife(QuestScene: SceneCtor) {
  const p = QuestScene?.prototype;
  if (!p || p.__act2WildlifeInstalled) return;
  p.__act2WildlifeInstalled = true;

  const originalSpawnAnimals = p.spawnAnimals;
  p.spawnAnimals = function act2WildlifeSpawn(seed: number, specs: [string, number, number, number][]) {
    if (this.save?.current_zone !== ZONE || seed !== 2202) {
      return originalSpawnAnimals.call(this, seed, specs);
    }

    makeTextures(this);
    const reduced = specs.map(([key, x, y, count]) => {
      if (key === "bird") return [key, x, y, Math.min(count, 4)];
      if (key === "cat") return [key, x, y, Math.min(count, 2)];
      if (key === "deer") return [key, x, y, Math.min(count, 1)];
      return [key, x, y, count];
    }) as [string, number, number, number][];

    reduced.push(
      ["moon-hare", 28, 72, 3],
      ["peacock", 44, 34, 2],
      ["garden-fox", 74, 78, 2],
    );
    return originalSpawnAnimals.call(this, seed, reduced);
  };

  const originalDamageAnimal = p.damageAnimal;
  p.damageAnimal = function act2WildlifeDamage(a: Phaser.GameObjects.Sprite, amount: number) {
    const species = String(a?.getData?.("species") ?? "");
    if (this.save?.current_zone !== ZONE || !NEW_SPECIES.has(species)) {
      return originalDamageAnimal.call(this, a, amount);
    }

    const currentHp = Number(a.getData?.("hp") ?? a.getData?.("maxhp") ?? 1);
    const hp = Math.max(0, currentHp - amount);
    a.setData?.("hp", hp);
    this.floatText?.(a.x, a.y, `-${amount}`, "#ffe9a8");
    a.setTint?.(0xff9aa5);
    this.time?.delayedCall?.(120, () => a.active && a.clearTint?.());
    if (hp > 0) return;

    const { x, y } = a;
    this.tweens?.killTweensOf?.(a);
    this.animals = (this.animals ?? []).filter((o: any) => o !== a);
    a.destroy?.();
    this.spawnSparkle?.(x, y, 0xffd7e5, 12);

    if (species === "moon-hare") {
      this.dropItem?.(x, y, "berries");
    } else if (species === "peacock") {
      this.dropItem?.(x, y, "raw-meat");
    } else {
      this.dropItem?.(x, y, "raw-meat");
      if (Phaser.Math.Between(0, 100) > 55) this.dropItem?.(x + 14, y + 6, "berries");
    }
  };
}
