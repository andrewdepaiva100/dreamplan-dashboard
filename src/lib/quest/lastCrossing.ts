import * as Phaser from "phaser";
import { T } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };
type VillagerId = "elara" | "pip" | "maeve";

type GuestBeat = {
  id: string;
  name: string;
  role: string;
  lines: string[];
};

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const BLADE_DAMAGE = 350;
const VILLAGE_SAFE_RADIUS = 310;

// Reuse existing in-game portrait + overworld sprite pairs so these three
// immediately match the same art direction, proportions, and dialogue UI as
// Lorena and the other established NPCs.
const VILLAGER_ART: Record<VillagerId, { art: string; portraitId: string; name: string; role: string }> = {
  elara: { art: "adriel", portraitId: "adriel", name: "Elara", role: "Former Knight" },
  pip: { art: "pedro", portraitId: "pedro", name: "Pip", role: "Inventor" },
  maeve: { art: "alicia", portraitId: "alicia", name: "Maeve", role: "Healer" },
};

const PRE_DIALOGUE: Record<VillagerId, string[]> = {
  elara: [
    "You're headed for the crossing, aren't you?",
    "I know because you're wearing the same face I wore before I met the Warden.",
    "I thought courage meant refusing to retreat. The river taught me otherwise.",
    "Don't mistake surviving for cowardice, Maria. Sometimes coming home is the bravest thing you do.",
  ],
  pip: [
    "WAIT. You're not planning to cross the river, are you?",
    "Excellent. Terrible. Mostly terrible. I tried seven times.",
    "Technically the seventh attempt was the remains of the sixth attempt.",
    "I kept thinking if I built something clever enough, I wouldn't have to be afraid. Turns out fear knows how to swim.",
  ],
  maeve: [
    "Maria.",
    "The Warden said your name when I reached the other side.",
    "I made it farther than Elara or Pip. Then he asked what I was willing to lose, and I had no answer.",
    "He isn't guarding the other side. He's guarding the part of you that wants to turn around.",
  ],
};

const POST_DIALOGUE: Record<VillagerId, string[]> = {
  elara: [
    "You crossed.",
    "I spent years believing the river had the final word. Thank you for proving me wrong.",
  ],
  pip: [
    "You actually did it.",
    "Which means I owe several people money. More importantly: the blade worked.",
  ],
  maeve: [
    "Whatever your answer was, you carried all four of us across that river.",
    "The Crossing Blade is only old steel now. Keep it anyway. Some things are worth carrying after their power is gone.",
  ],
};

const FORGE_DIALOGUE: GuestBeat[] = [
  {
    id: VILLAGER_ART.elara.portraitId,
    name: "Elara",
    role: "Former Knight",
    lines: [
      "There is one thing we haven't told you.",
      "This is what remained of my sword after I challenged the Warden. I brought back more cracks than steel.",
    ],
  },
  {
    id: VILLAGER_ART.pip.portraitId,
    name: "Pip",
    role: "Inventor",
    lines: [
      "She calls it a sword. When she gave it to me, it was approximately six pieces of metal and a bad memory.",
      "I rebuilt it with pieces from all three of our failed expeditions. It can hold together now. Mostly.",
    ],
  },
  {
    id: VILLAGER_ART.maeve.portraitId,
    name: "Maeve",
    role: "Healer",
    lines: [
      "Repairing the blade isn't enough. The crossing remembers us — our fear, our failures, every time we turned back.",
      "I bound that memory to one enemy. The blade will recognize the Warden of Rushing Water and no one else.",
    ],
  },
  {
    id: VILLAGER_ART.elara.portraitId,
    name: "Elara",
    role: "Former Knight",
    lines: [
      "Listen carefully. That sword belongs to the crossing.",
      "Each clean strike against the Warden deals 350 damage. Once he falls, the blade's strength dies with him.",
    ],
  },
  {
    id: VILLAGER_ART.maeve.portraitId,
    name: "Maeve",
    role: "Healer",
    lines: [
      "You may carry the steel afterward, but not its power.",
      "We're not giving you a weapon, Maria. We're giving you the attempt we never finished.",
      "The Crossing Blade is yours. 350 damage — Warden only.",
    ],
  },
];

function readState() {
  const fallback = { talked: [] as VillagerId[], forged: false, wardenDefeated: false };
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<typeof fallback>;
    return {
      talked: Array.isArray(parsed.talked)
        ? parsed.talked.filter((id): id is VillagerId => ["elara", "pip", "maeve"].includes(id))
        : [],
      forged: Boolean(parsed.forged),
      wardenDefeated: Boolean(parsed.wardenDefeated),
    };
  } catch {
    return fallback;
  }
}

function writeState(state: ReturnType<typeof readState>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Optional persistence only; the current scene still continues normally.
  }
}

function ensureBladeTexture(scene: SceneLike) {
  if (scene.textures.exists("last-crossing-blade")) return;
  const tex = scene.textures.createCanvas("last-crossing-blade", 20, 34)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 20, 34);
  ctx.fillStyle = "#6b4a2f";
  ctx.fillRect(7, 25, 5, 7);
  ctx.fillStyle = "#d8ad55";
  ctx.fillRect(4, 23, 12, 3);
  ctx.fillRect(8, 20, 4, 4);
  ctx.fillStyle = "#dff7ff";
  ctx.fillRect(9, 4, 4, 17);
  ctx.fillStyle = "#8ed7e8";
  ctx.fillRect(7, 7, 3, 15);
  ctx.fillStyle = "#fff2a8";
  ctx.fillRect(12, 4, 2, 14);
  ctx.fillStyle = "#5e8195";
  ctx.fillRect(7, 20, 3, 2);
  tex.refresh();
}

function addBlocker(scene: SceneLike, x: number, y: number, sx: number, sy: number) {
  if (!scene.solidDecor) return;
  const b = scene.solidDecor.create(x, y, "block") as Phaser.Physics.Arcade.Sprite;
  b.setVisible(false).setAlpha(0.001).setScale(sx, sy);
  (b as any).refreshBody?.();
}

function clearVillageSpace(scene: SceneLike, cx: number, cy: number) {
  for (const child of [...(scene.children?.list ?? [])]) {
    const o = child as any;
    if (o?.texture?.key === "tree" && Phaser.Math.Distance.Between(o.x ?? 0, o.y ?? 0, cx, cy) < VILLAGE_SAFE_RADIUS) {
      o.destroy();
    }
  }
  for (const enemy of scene.enemies?.getChildren?.() ?? []) {
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    if (e.active && Phaser.Math.Distance.Between(e.x, e.y, cx, cy) < VILLAGE_SAFE_RADIUS) e.disableBody(true, true);
  }
}

function paintVillageGround(scene: SceneLike, cx: number, cy: number) {
  const tx = Math.floor(cx / 32);
  const ty = Math.floor(cy / 32);
  const spots: [number, number][] = [];
  for (let y = -3; y <= 3; y++) {
    for (let x = -6; x <= 6; x++) {
      if ((x * x) / 38 + (y * y) / 10 <= 1) spots.push([tx + x, ty + y]);
    }
  }
  for (let x = -11; x <= -5; x++) {
    spots.push([tx + x, ty + 2], [tx + x, ty + 3]);
  }
  for (const [x, y] of spots) {
    const tile = scene.layer?.getTileAt?.(x, y);
    if (tile && tile.index !== T.WATER) scene.layer.putTileAt(T.PATH, x, y);
  }
  scene.layer?.setCollision?.([T.WALL, T.HEDGE, T.VOID, T.WATER]);
}

function addHouse(scene: SceneLike, x: number, y: number, tint: number) {
  const house = scene.add.sprite(x, y, "house").setDepth(scene.dsort?.(y + 22) ?? 10).setScale(0.96).setTint(tint);
  addBlocker(scene, x, y + 18, 1.65, 0.68);
  return house;
}

function addDecor(scene: SceneLike, key: string, x: number, y: number, scale = 1, tint?: number) {
  const s = scene.add.sprite(x, y, key).setDepth(scene.dsort?.(y) ?? 9).setScale(scale);
  if (tint != null) s.setTint(tint);
  return s;
}

function addVillageInteractable(
  scene: SceneLike,
  x: number,
  y: number,
  texture: string,
  id: VillagerId,
  label: string,
) {
  const obj = scene.add.sprite(x, y, texture).setDepth(scene.dsort?.(y) ?? 11);
  scene.interactables.push({ obj, kind: "last-crossing-npc", id, label, radius: 80, enabled: true });
  scene.tweens.add({ targets: obj, y: y - 2, duration: 1600, yoyo: true, repeat: -1 });
  return obj;
}

function drawVillage(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__lastCrossingBuilt) return;
  scene.__lastCrossingBuilt = true;
  ensureBladeTexture(scene);

  // Bottom-right meadow: intentionally compact, with a natural road connection
  // instead of the oversized translucent oval used in the first pass.
  const cx = Math.round((scene.mapW ?? 55) * 32 * 0.79);
  const cy = Math.round((scene.mapH ?? 50) * 32 * 0.78);
  clearVillageSpace(scene, cx, cy);
  paintVillageGround(scene, cx, cy);

  addHouse(scene, cx - 118, cy - 86, 0xf0c9a0);
  addHouse(scene, cx + 118, cy - 86, 0xc9d8dd);
  addHouse(scene, cx + 18, cy + 116, 0xd6ddbd);

  // Central square using only established scenery sprites.
  addDecor(scene, "fountain", cx, cy + 8, 0.82);
  addBlocker(scene, cx, cy + 18, 0.78, 0.48);
  addDecor(scene, "bench", cx - 84, cy + 34, 0.9);
  addDecor(scene, "bench", cx + 86, cy + 35, 0.9).setFlipX(true);
  addDecor(scene, "lamp", cx - 56, cy - 54, 0.86);
  addDecor(scene, "lamp", cx + 62, cy - 52, 0.86);
  addDecor(scene, "flowers", cx - 150, cy + 62, 1.0);
  addDecor(scene, "flowers", cx - 124, cy + 64, 0.9);
  addDecor(scene, "flowers", cx + 118, cy + 55, 1.0);
  addDecor(scene, "flowers", cx + 148, cy + 62, 0.9);

  // Tiny garden plots and fence edges — no clutter in the walking lanes.
  for (const [x, y] of [
    [cx - 186, cy + 72],
    [cx - 146, cy + 72],
    [cx + 150, cy - 8],
    [cx + 190, cy - 8],
  ] as [number, number][]) addDecor(scene, "fence", x, y, 0.88);

  // Failed expedition corner: recognizable game props instead of giant vector rings.
  const cart = addDecor(scene, "stall", cx + 210, cy + 82, 0.72, 0x8b6f59).setAngle(-8);
  addDecor(scene, "bench", cx + 170, cy + 105, 0.72, 0x76533e).setAngle(12);
  addDecor(scene, "fence", cx + 230, cy + 120, 0.72, 0x76533e).setAngle(-18);
  addBlocker(scene, cart.x, cart.y + 8, 0.9, 0.55);

  const sign = addDecor(scene, "signpost", cx - 252, cy + 112, 0.9);
  const label = scene.add
    .text(sign.x + 26, sign.y - 5, "THE LAST CROSSING", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "7px",
      fontStyle: "bold",
      color: "#f4e6bd",
      backgroundColor: "#4a3427",
      padding: { x: 4, y: 2 },
    })
    .setOrigin(0, 0.5)
    .setDepth(12);
  void label;

  addVillageInteractable(scene, cx - 92, cy - 2, VILLAGER_ART.elara.art, "elara", "Talk to Elara");
  addVillageInteractable(scene, cx + 95, cy - 2, VILLAGER_ART.pip.art, "pip", "Talk to Pip");
  addVillageInteractable(scene, cx + 20, cy + 70, VILLAGER_ART.maeve.art, "maeve", "Talk to Maeve");

  scene.__lastCrossingCenter = { x: cx, y: cy };
  refreshForgeInteractable(scene);
}

function openGuest(scene: SceneLike, beat: GuestBeat) {
  scene.openModal({
    type: "guest",
    id: beat.id,
    name: beat.name,
    role: beat.role,
    lines: beat.lines,
  });
}

function queueGuestSequence(scene: SceneLike, beats: GuestBeat[]) {
  scene.__lastCrossingGuestQueue = beats.slice(1);
  openGuest(scene, beats[0]!);
}

function refreshForgeInteractable(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const state = readState();
  const existing = (scene.interactables ?? []).find((it: any) => it.kind === "last-crossing-forge");
  const ready = state.talked.length === 3 && !state.forged && !state.wardenDefeated;
  if (!ready || existing) return;
  const c = scene.__lastCrossingCenter;
  if (!c) return;
  const obj = scene.add.sprite(c.x, c.y - 42, "last-crossing-blade").setDepth(18).setScale(1.15);
  scene.tweens.add({ targets: obj, y: obj.y - 4, alpha: { from: 0.78, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
  scene.interactables.push({
    obj,
    kind: "last-crossing-forge",
    id: "crossing-blade",
    label: "Receive the Crossing Blade",
    radius: 82,
    enabled: true,
  });
}

function handleVillager(scene: SceneLike, id: VillagerId) {
  const state = readState();
  const who = VILLAGER_ART[id];
  if (state.wardenDefeated) {
    openGuest(scene, { id: who.portraitId, name: who.name, role: who.role, lines: POST_DIALOGUE[id] });
    return;
  }

  if (!state.talked.includes(id)) {
    state.talked.push(id);
    writeState(state);
  }
  openGuest(scene, { id: who.portraitId, name: who.name, role: who.role, lines: PRE_DIALOGUE[id] });

  if (state.talked.length === 3 && !state.forged) {
    scene.game.events.emit("quest:toast", "The three villagers have shared their stories. Something waits by the fountain.");
    refreshForgeInteractable(scene);
  }
}

function handleForge(scene: SceneLike, it: any) {
  const state = readState();
  if (state.forged || state.wardenDefeated || state.talked.length < 3) return;

  state.forged = true;
  writeState(state);
  it.enabled = false;
  it.obj?.destroy?.();
  scene.interactables = (scene.interactables ?? []).filter((x: any) => x !== it);
  queueGuestSequence(scene, FORGE_DIALOGUE);
  scene.game.events.emit("quest:toast", `The Crossing Blade is ready — ${BLADE_DAMAGE} damage against the Warden only.`);
}

function updateBladeVisual(scene: SceneLike) {
  const active = Boolean(
    scene.__crossingBladeActive &&
      scene.save?.current_zone === "sunlit_shores" &&
      scene.boss?.active &&
      scene.bossPhase === 1,
  );
  let blade = scene.__crossingBladeSprite as Phaser.GameObjects.Sprite | undefined;
  if (!active) {
    blade?.destroy();
    scene.__crossingBladeSprite = undefined;
    return;
  }
  if (!blade?.active) {
    blade = scene.add.sprite(scene.player.x, scene.player.y, "last-crossing-blade").setDepth(24).setScale(1.05);
    scene.__crossingBladeSprite = blade;
  }
  const dir = scene.lastDir as "up" | "down" | "side";
  const facing = Number(scene.facing ?? 1);
  if (dir === "up") blade.setPosition(scene.player.x + 8, scene.player.y - 17).setAngle(-36).setFlipX(false);
  else if (dir === "down") blade.setPosition(scene.player.x + 11, scene.player.y + 8).setAngle(40).setFlipX(false);
  else blade.setPosition(scene.player.x + 16 * facing, scene.player.y - 1).setAngle(facing > 0 ? 18 : -18).setFlipX(facing < 0);
  blade.setDepth((scene.player.depth ?? 20) + 1);
}

export function installLastCrossing(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__lastCrossingInstalled) return;
  proto.__lastCrossingInstalled = true;

  const originalCreate = proto.create;
  proto.create = function lastCrossingCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    drawVillage(this);
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function lastCrossingInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === "last-crossing-npc") {
      handleVillager(this, it.id as VillagerId);
      return;
    }
    if (it?.kind === "last-crossing-forge") {
      handleForge(this, it);
      return;
    }
    return originalInteract.apply(this, args);
  };

  const originalResume = proto.onResume;
  proto.onResume = function lastCrossingResume(this: SceneLike, ...args: any[]) {
    const result = originalResume.apply(this, args);
    const queue = this.__lastCrossingGuestQueue as GuestBeat[] | undefined;
    if (queue?.length) {
      const next = queue.shift()!;
      this.__lastCrossingGuestQueue = queue;
      this.time.delayedCall(20, () => openGuest(this, next));
    } else {
      this.__lastCrossingGuestQueue = undefined;
    }
    return result;
  };

  const originalBossChoice = proto.onBossChoice;
  proto.onBossChoice = function lastCrossingBossChoice(this: SceneLike, ...args: any[]) {
    const result = originalBossChoice.apply(this, args);
    const state = readState();
    if (
      this.save?.current_zone === "sunlit_shores" &&
      this.bossName === "Warden of Rushing Water" &&
      state.forged &&
      !state.wardenDefeated
    ) {
      this.__crossingBladeActive = true;
      this.game.events.emit("quest:toast", `The Crossing Blade wakes — ${BLADE_DAMAGE} damage per hit.`);
    }
    return result;
  };

  const originalDamageBoss = proto.damageBoss;
  proto.damageBoss = function lastCrossingDamageBoss(this: SceneLike, amount: number) {
    const state = readState();
    const useBlade =
      this.__crossingBladeActive === true &&
      this.save?.current_zone === "sunlit_shores" &&
      this.bossName === "Warden of Rushing Water" &&
      this.bossPhase === 1 &&
      state.forged &&
      !state.wardenDefeated;
    return originalDamageBoss.call(this, useBlade ? BLADE_DAMAGE : amount);
  };

  const originalDefeatBoss = proto.defeatActBoss;
  proto.defeatActBoss = function lastCrossingDefeatBoss(this: SceneLike, ...args: any[]) {
    const wasWarden = this.save?.current_zone === "sunlit_shores" && this.bossName === "Warden of Rushing Water";
    const result = originalDefeatBoss.apply(this, args);
    if (wasWarden) {
      const state = readState();
      state.wardenDefeated = true;
      writeState(state);
      this.__crossingBladeActive = false;
      this.__crossingBladeSprite?.destroy?.();
      this.__crossingBladeSprite = undefined;
      if (state.forged) {
        this.game.events.emit(
          "quest:toast",
          "The Crossing Blade goes quiet. Its 350-damage blessing ended with the Warden.",
        );
      }
    }
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function lastCrossingUpdate(this: SceneLike, ...args: any[]) {
    const result = originalUpdate.apply(this, args);
    updateBladeVisual(this);
    return result;
  };
}
