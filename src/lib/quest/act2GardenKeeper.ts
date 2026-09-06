// @ts-nocheck -- Narrow runtime decorator for the Phaser quest scene.

const ZONE = "wedding_garden";
const KEEPER_KIND = "garden-keeper";
const LETTER_KIND = "garden-keeper-letter";
const KEEPER_X = 88;
const KEEPER_Y = 54;

const KEEPER_LINES = [
  "This garden is not simply dying, Maria. Its seasons have forgotten how to belong to one another. Spring keeps trying to begin. Summer refuses to end. Autumn cannot let go. Winter will not wake. The four Seasonal Keys once kept them in balance. Bring them home, and watch what the garden remembers.",
  "Spring answered you. I have tended these beds for years, but they have not opened like that for me. Keep going — the garden knows the difference between being repaired and being cared for.",
  "Two seasons are breathing together again. Look at the fountain light. The garden recognizes you, Maria. You are not merely collecting keys; you are reminding this place what it was made to hold.",
  "Three seasons have returned. One remains. When the fourth comes home, return to me. There is something beneath the flowering arch that has been waiting longer than I have.",
  "All four seasons are home. The Conservatory can hear them again. Before you go inside, there is something here for you — beneath the flowering arch.",
];

function removeActTwoDog(scene: any) {
  // The Act II dog offer is intentionally gone. This does not touch animal
  // ambience in other acts or the underlying companion system.
  for (const it of [...(scene.interactables ?? [])]) {
    if (it?.kind !== "dog") continue;
    it.enabled = false;
    it.obj?.destroy?.();
    scene.interactables = scene.interactables.filter((entry: any) => entry !== it);
  }
}

function addKeeperStation(scene: any) {
  const x = scene.wx(KEEPER_X);
  const y = scene.wy(KEEPER_Y);

  const keeper = scene.addInteractable(x, y, "guide-act", KEEPER_KIND, "Talk to Evelyn", {
    id: "evelyn",
    radius: 92,
    depth: 9,
  });
  keeper?.obj?.setTint?.(0x91aa78);
  keeper?.obj?.setScale?.(0.92);
  if (keeper?.obj) {
    scene.tweens.add({ targets: keeper.obj, y: keeper.obj.y - 2, duration: 1700, yoyo: true, repeat: -1 });
  }

  // Evelyn's permanent gardening station: worktable, pots, watering can,
  // pruning tools and a small lantern. Primitives keep this self-contained
  // and avoid introducing another asset dependency into Act II.
  const depth = 6;
  scene.add.rectangle(x - 58, y + 38, 62, 20, 0x76513b, 1).setDepth(depth);
  scene.add.rectangle(x - 58, y + 50, 54, 7, 0x4f382d, 1).setDepth(depth);
  scene.add.rectangle(x - 79, y + 60, 6, 24, 0x4f382d, 1).setDepth(depth);
  scene.add.rectangle(x - 37, y + 60, 6, 24, 0x4f382d, 1).setDepth(depth);
  scene.add.circle(x - 78, y + 27, 8, 0xb86f4f, 1).setDepth(depth + 1);
  scene.add.circle(x - 56, y + 28, 7, 0xc57a55, 1).setDepth(depth + 1);
  scene.add.circle(x - 35, y + 28, 6, 0xa95e45, 1).setDepth(depth + 1);
  scene.add.rectangle(x - 49, y + 26, 18, 5, 0xb9c1a0, 1).setAngle(-18).setDepth(depth + 2);
  scene.add.circle(x - 22, y + 29, 7, 0xd8b65d, 0.72).setDepth(depth + 1);

  const glow = scene.add.circle(x - 22, y + 29, 17, 0xffdc82, 0.12).setDepth(depth);
  scene.tweens.add({ targets: glow, alpha: { from: 0.06, to: 0.2 }, scale: { from: 0.85, to: 1.15 }, duration: 1400, yoyo: true, repeat: -1 });

  scene.__act2KeeperArt = { x, y, glow, stage: -1, seasonal: [] };
  refreshKeeperGarden(scene, true);
}

function clearSeasonalArt(scene: any) {
  const art = scene.__act2KeeperArt;
  if (!art) return;
  for (const obj of art.seasonal ?? []) obj?.destroy?.();
  art.seasonal = [];
}

function refreshKeeperGarden(scene: any, force = false) {
  if (scene.save?.current_zone !== ZONE) return;
  const art = scene.__act2KeeperArt;
  if (!art) return;
  const n = Math.max(0, Math.min(4, Number(scene.zoneState?.["keysFound"] ?? 0)));
  if (!force && art.stage === n) return;
  art.stage = n;
  clearSeasonalArt(scene);

  const made: any[] = [];
  const { x, y } = art;
  const addFlower = (dx: number, dy: number, tint: number, scale = 0.72) => {
    const f = scene.add.sprite(x + dx, y + dy, "flowers").setTint(tint).setScale(scale).setDepth(5);
    made.push(f);
    return f;
  };

  // The station itself becomes a readable progress meter.
  if (n >= 1) {
    addFlower(-78, 20, 0x9dff70, 0.62);
    for (const [dx, dy] of [[-18, 68], [12, 74], [38, 62]]) addFlower(dx, dy, 0xb9f28f);
  }
  if (n >= 2) {
    art.glow?.setFillStyle?.(0xffd66f, 0.28);
    for (const [dx, dy] of [[-6, -54], [28, -46], [52, -22]]) {
      const light = scene.add.circle(x + dx, y + dy, 5, 0xffd66f, 0.75).setDepth(7);
      made.push(light);
      scene.tweens.add({ targets: light, alpha: { from: 0.35, to: 0.9 }, duration: 1100 + Math.random() * 500, yoyo: true, repeat: -1 });
    }
  }
  if (n >= 3) {
    for (let i = 0; i < 8; i++) {
      const leaf = scene.add.ellipse(x - 72 + i * 20, y - 58 + (i % 3) * 14, 7, 4, i % 2 ? 0xd98b43 : 0xe7b95f, 0.72).setDepth(7);
      made.push(leaf);
      scene.tweens.add({ targets: leaf, y: leaf.y + 28, x: leaf.x + 10, alpha: 0.1, duration: 2200 + i * 130, repeat: -1, delay: i * 180 });
    }
  }
  if (n >= 4) {
    // Flowering arch and one-chair letter table: the visual payoff for
    // restoring all four seasons.
    const archLeft = scene.add.rectangle(x + 72, y - 8, 7, 72, 0x6c8f55, 1).setDepth(5);
    const archRight = scene.add.rectangle(x + 130, y - 8, 7, 72, 0x6c8f55, 1).setDepth(5);
    const archTop = scene.add.rectangle(x + 101, y - 43, 64, 7, 0x6c8f55, 1).setDepth(5);
    made.push(archLeft, archRight, archTop);
    for (const [dx, dy] of [[72,-36],[84,-44],[98,-46],[112,-44],[128,-36],[72,-12],[130,-10]]) addFlower(dx, dy, 0xf2a5bd, 0.58);
    const table = scene.add.ellipse(x + 101, y + 28, 50, 22, 0x7a563e, 1).setDepth(5);
    const leg = scene.add.rectangle(x + 101, y + 42, 6, 26, 0x51392e, 1).setDepth(4);
    const chair = scene.add.rectangle(x + 142, y + 35, 18, 28, 0x6a4936, 1).setDepth(4);
    made.push(table, leg, chair);

    if (!scene.__act2KeeperLetterAdded) {
      scene.__act2KeeperLetterAdded = true;
      const letter = scene.addInteractable(x + 101, y + 20, "envelope", LETTER_KIND, "Read the letter for Maria", {
        id: "four-seasons",
        radius: 72,
        depth: 8,
      });
      if (letter?.obj) {
        letter.obj.setTint?.(0xffe5a8);
        scene.tweens.add({ targets: letter.obj, y: letter.obj.y - 3, duration: 1200, yoyo: true, repeat: -1 });
      }
      scene.spawnSparkle?.(x + 101, y + 10, 0xffd978, 20);
      scene.emitToast?.("The four seasons answer together. A flowering arch opens beside Evelyn.");
    }
  }

  art.seasonal = made;
}

function talkToKeeper(scene: any) {
  const n = Math.max(0, Math.min(4, Number(scene.zoneState?.["keysFound"] ?? 0)));
  scene.zoneState["keeperMet"] = true;
  if (n === 0) scene.objective = "Restore the Four Seasons — Seasonal Keys 0/4.";
  scene.openModal({ type: "info", title: "Evelyn — Keeper of the Four Seasons", body: KEEPER_LINES[n] });
}

function readGardenLetter(scene: any) {
  scene.zoneState["gardenLetterRead"] = true;
  scene.openModal({
    type: "info",
    title: "For Maria — In Every Season",
    body: "Some things are beautiful because they last. Others are beautiful because we choose them again with every season.\n\nEvelyn looks toward the Conservatory. “Now you're ready to see what the garden was protecting.”",
  });
  scene.objective = "All four seasons are restored — enter the Grand Conservatory.";
}

export function installAct2GardenKeeper(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2GardenKeeperInstalled) return;
  proto.__act2GardenKeeperInstalled = true;

  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function act2GardenKeeperBuild() {
    const result = originalBuildAct2.call(this);
    removeActTwoDog(this);
    addKeeperStation(this);
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act2GardenKeeperInteract() {
    if (this.save?.current_zone !== ZONE) return originalInteract.call(this);

    const nearest = this.nearest?.();
    if (nearest?.kind === KEEPER_KIND) {
      talkToKeeper(this);
      return;
    }
    if (nearest?.kind === LETTER_KIND) {
      readGardenLetter(this);
      return;
    }

    const before = Number(this.zoneState?.["keysFound"] ?? 0);
    const result = originalInteract.call(this);
    const after = Number(this.zoneState?.["keysFound"] ?? 0);
    if (after !== before) {
      refreshKeeperGarden(this);
      if (this.zoneState?.["keeperMet"] === true) {
        this.objective = after >= 4
          ? "All four seasons are restored — return to Evelyn by the fountain."
          : `Restore the Four Seasons — Seasonal Keys ${after}/4.`;
      }
    }
    return result;
  };
}
