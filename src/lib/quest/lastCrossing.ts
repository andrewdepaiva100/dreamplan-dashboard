// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";
import { WEAPONS, WEAPON_BY_ID } from "./content";
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
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";
const CROSSING_BLADE_ID = "crossing-blade";
const BLADE_DAMAGE = 350;
const VILLAGE_SAFE_RADIUS = 310;

const VILLAGER_ART: Record<
  VillagerId,
  { baseArt: string; art: string; portraitId: string; name: string; role: string; outfit: string; accent: string }
> = {
  elara: {
    baseArt: "adriel",
    art: "last-crossing-elara",
    portraitId: "adriel",
    name: "Elara",
    role: "Former Knight",
    outfit: "#7b3045",
    accent: "#9da5b4",
  },
  pip: {
    baseArt: "pedro",
    art: "last-crossing-pip",
    portraitId: "pedro",
    name: "Pip",
    role: "Inventor",
    outfit: "#287582",
    accent: "#d4a93f",
  },
  maeve: {
    baseArt: "alicia",
    art: "last-crossing-maeve",
    portraitId: "alicia",
    name: "Maeve",
    role: "Healer",
    outfit: "#718b5c",
    accent: "#eee0bb",
  },
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
      "The blessing will hold from the moment you take it until the Warden falls. Use it on the road if you need to — once he is gone, so is its power.",
    ],
  },
  {
    id: VILLAGER_ART.elara.portraitId,
    name: "Elara",
    role: "Former Knight",
    lines: [
      "Listen carefully. Every clean strike carries 350 damage.",
      "Carry it. Practice with it. Clear the road with it. But after the Warden falls, it becomes ordinary steel forever.",
    ],
  },
  {
    id: VILLAGER_ART.maeve.portraitId,
    name: "Maeve",
    role: "Healer",
    lines: [
      "We're not giving you a weapon forever, Maria. We're giving you the attempt we never finished.",
      "The Crossing Blade is yours. Three hundred and fifty damage — until the Warden falls.",
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

function registerCrossingBladeWeapon() {
  const state = readState();
  let blade = WEAPON_BY_ID[CROSSING_BLADE_ID];
  if (!blade) {
    blade = {
      id: CROSSING_BLADE_ID,
      name: "The Crossing Blade",
      icon: "🗡️",
      damage: state.wardenDefeated ? 0 : BLADE_DAMAGE,
      reach: 84,
      color: 0x9ee7f2,
      blurb: state.wardenDefeated
        ? "Three failed journeys, carried across by a fourth. Its power faded when the Warden fell; it remains as a keepsake."
        : "Reforged from three failed crossings. Deals 350 damage from the moment Maria receives it until the Warden of Rushing Water falls.",
    };
    WEAPON_BY_ID[CROSSING_BLADE_ID] = blade;
    if (!WEAPONS.some((w) => w.id === CROSSING_BLADE_ID)) WEAPONS.push(blade);
  } else {
    blade.damage = state.wardenDefeated ? 0 : BLADE_DAMAGE;
    blade.blurb = state.wardenDefeated
      ? "Three failed journeys, carried across by a fourth. Its power faded when the Warden fell; it remains as a keepsake."
      : "Reforged from three failed crossings. Deals 350 damage from the moment Maria receives it until the Warden of Rushing Water falls.";
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

function ensureVillagerTexture(scene: SceneLike, id: VillagerId) {
  const cfg = VILLAGER_ART[id];
  if (scene.textures.exists(cfg.art) || !scene.textures.exists(cfg.baseArt)) return;
  const frame = scene.textures.getFrame(cfg.baseArt);
  if (!frame) return;
  const w = Math.max(1, Math.round(frame.width));
  const h = Math.max(1, Math.round(frame.height));
  const tex = scene.textures.createCanvas(cfg.art, w, h)!;
  const ctx = tex.getContext();
  const src = scene.textures.get(cfg.baseArt).getSourceImage() as CanvasImageSource;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(src, 0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = "source-atop";
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = cfg.outfit;
  ctx.fillRect(0, Math.floor(h * 0.43), w, Math.ceil(h * 0.57));
  ctx.globalAlpha = 0.68;
  ctx.fillStyle = cfg.accent;
  ctx.fillRect(Math.floor(w * 0.2), Math.floor(h * 0.48), Math.ceil(w * 0.6), Math.max(2, Math.ceil(h * 0.12)));
  ctx.restore();
  tex.refresh();
}

function ensureSilasTexture(scene: SceneLike) {
  if (scene.textures.exists("last-crossing-silas")) return;
  const tex = scene.textures.createCanvas("last-crossing-silas", 24, 35)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 24, 35);
  ctx.fillStyle = "rgba(20,20,25,.22)";
  ctx.fillRect(5, 32, 14, 2);
  ctx.fillStyle = "#6a482d";
  ctx.fillRect(8, 2, 9, 4);
  ctx.fillStyle = "#8a6040";
  ctx.fillRect(6, 5, 12, 4);
  ctx.fillStyle = "#d9aa7f";
  ctx.fillRect(7, 8, 10, 8);
  ctx.fillStyle = "#2c2524";
  ctx.fillRect(8, 10, 2, 2);
  ctx.fillRect(14, 10, 2, 2);
  ctx.fillStyle = "#223a5a";
  ctx.fillRect(5, 16, 14, 12);
  ctx.fillStyle = "#a84d38";
  ctx.fillRect(5, 16, 14, 3);
  ctx.fillRect(15, 18, 4, 7);
  ctx.fillStyle = "#b88a55";
  ctx.fillRect(4, 20, 3, 9);
  ctx.fillRect(17, 23, 3, 6);
  ctx.fillStyle = "#4f3a2d";
  ctx.fillRect(6, 28, 5, 6);
  ctx.fillRect(14, 28, 5, 6);
  ctx.fillStyle = "#d9bd76";
  ctx.fillRect(4, 19, 2, 8);
  ctx.fillRect(19, 18, 2, 10);
  tex.refresh();
}

function silasPortraitDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 448">
    <defs>
      <radialGradient id="bg" cx="35%" cy="25%"><stop offset="0" stop-color="#d7c29e"/><stop offset="1" stop-color="#314258"/></radialGradient>
      <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#294c70"/><stop offset="1" stop-color="#172b45"/></linearGradient>
    </defs>
    <rect width="448" height="448" fill="url(#bg)"/>
    <circle cx="224" cy="188" r="116" fill="#d8a67c"/>
    <path d="M110 186c4-98 61-143 121-143 74 0 125 52 126 141-34-23-58-71-77-99-30 36-80 64-170 101Z" fill="#5d422e"/>
    <path d="M122 177c5-65 43-106 82-120-58 11-92 59-92 121Z" fill="#7a5739" opacity=".9"/>
    <ellipse cx="181" cy="199" rx="14" ry="10" fill="#26211f"/><ellipse cx="267" cy="199" rx="14" ry="10" fill="#26211f"/>
    <path d="M176 172q28-16 55 0M239 171q25-13 50 2" stroke="#5d422e" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M201 249q25 18 49 0" stroke="#8e5848" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M102 448c7-112 49-166 122-166s119 55 126 166Z" fill="url(#coat)"/>
    <path d="M135 309l78 70-48 69h-66c4-55 12-98 36-139Zm178 0-78 70 48 69h66c-4-55-12-98-36-139Z" fill="#18334f"/>
    <path d="M132 304c29 15 57 22 91 22 38 0 67-8 94-23l-24 41c-25 11-44 16-70 16-27 0-49-5-73-16Z" fill="#a74f3b"/>
    <rect x="311" y="300" width="72" height="92" rx="10" fill="#b38b55" transform="rotate(8 311 300)"/>
    <path d="M326 316h42M327 335h39M329 354h35" stroke="#5e4b35" stroke-width="5"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
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

function addSilas(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  ensureSilasTexture(scene);
  // Wren starts around design tile 50,56. Silas waits roughly fifty tiles east.
  const x = scene.wx?.(100) ?? 100 * 32;
  const y = scene.wy?.(56) ?? 56 * 32;
  const obj = scene.add.sprite(x, y, "last-crossing-silas").setDepth(scene.dsort?.(y) ?? 11);
  scene.interactables.push({
    obj,
    kind: "last-crossing-silas",
    id: "silas",
    label: "Talk to Silas",
    radius: 84,
    enabled: true,
  });
  scene.tweens.add({ targets: obj, y: y - 2, duration: 1700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  addDecor(scene, "signpost", x - 34, y + 8, 0.78);
}

function drawVillage(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__lastCrossingBuilt) return;
  scene.__lastCrossingBuilt = true;
  registerCrossingBladeWeapon();
  ensureBladeTexture(scene);
  ensureVillagerTexture(scene, "elara");
  ensureVillagerTexture(scene, "pip");
  ensureVillagerTexture(scene, "maeve");

  const state = readState();
  if (state.forged && !scene.save?.weapons?.includes(CROSSING_BLADE_ID) && !state.wardenDefeated) {
    state.forged = false;
    writeState(state);
  }
  if (state.forged && state.wardenDefeated && !scene.save?.weapons?.includes(CROSSING_BLADE_ID)) {
    scene.save.weapons = [...(scene.save.weapons ?? []), CROSSING_BLADE_ID];
    scene.emitSave?.();
  }

  const cx = Math.round((scene.mapW ?? 55) * 32 * 0.79);
  const cy = Math.round((scene.mapH ?? 50) * 32 * 0.78);
  clearVillageSpace(scene, cx, cy);
  paintVillageGround(scene, cx, cy);

  addHouse(scene, cx - 118, cy - 86, 0xf0c9a0);
  addHouse(scene, cx + 118, cy - 86, 0xc9d8dd);
  addHouse(scene, cx + 18, cy + 116, 0xd6ddbd);

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

  for (const [x, y] of [
    [cx - 186, cy + 72],
    [cx - 146, cy + 72],
    [cx + 150, cy - 8],
    [cx + 190, cy - 8],
  ] as [number, number][]) addDecor(scene, "fence", x, y, 0.88);

  const cart = addDecor(scene, "stall", cx + 210, cy + 82, 0.72, 0x8b6f59).setAngle(-8);
  addDecor(scene, "bench", cx + 170, cy + 105, 0.72, 0x76533e).setAngle(12);
  addDecor(scene, "fence", cx + 230, cy + 120, 0.72, 0x76533e).setAngle(-18);
  addBlocker(scene, cart.x, cart.y + 8, 0.9, 0.55);

  const sign = addDecor(scene, "signpost", cx - 252, cy + 112, 0.9);
  scene.add
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
    id: CROSSING_BLADE_ID,
    label: "Receive the Crossing Blade",
    radius: 82,
    enabled: true,
  });
}

function drawPopupSword(canvas: HTMLCanvasElement) {
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 128, 128);
  ctx.save();
  ctx.translate(64, 64);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "#6b4a2f";
  ctx.fillRect(-6, 24, 12, 30);
  ctx.fillStyle = "#d8ad55";
  ctx.fillRect(-24, 18, 48, 10);
  ctx.fillRect(-8, 8, 16, 14);
  ctx.fillStyle = "#6f9fb4";
  ctx.fillRect(-10, -50, 20, 60);
  ctx.fillStyle = "#dff7ff";
  ctx.fillRect(-5, -56, 10, 65);
  ctx.fillStyle = "#fff1a4";
  ctx.fillRect(4, -50, 4, 52);
  ctx.restore();
}

function showBladeRewardPopup(scene: SceneLike) {
  if (scene.__crossingBladePopupOpen || readState().wardenDefeated) return;
  const parent = scene.game.canvas?.parentElement;
  if (!parent) return;
  scene.__crossingBladePopupOpen = true;
  scene.frozen = true;
  scene.physics.pause();

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    zIndex: "10000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
    background: "rgba(5, 9, 22, 0.72)",
    backdropFilter: "blur(5px)",
    boxSizing: "border-box",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    width: "min(92vw, 430px)",
    maxHeight: "min(88vh, 560px)",
    overflow: "auto",
    boxSizing: "border-box",
    border: "2px solid rgba(218, 181, 94, 0.82)",
    borderRadius: "20px",
    background: "linear-gradient(145deg, rgba(12,22,43,.98), rgba(18,25,44,.98))",
    boxShadow: "0 24px 70px rgba(0,0,0,.48)",
    color: "#f8f3e7",
    textAlign: "center",
    padding: "22px",
    fontFamily: "system-ui, sans-serif",
  });

  const eyebrow = document.createElement("div");
  eyebrow.textContent = "SPECIAL QUEST WEAPON";
  Object.assign(eyebrow.style, { color: "#d8b45e", fontSize: "10px", letterSpacing: ".22em", fontWeight: "800" });

  const canvas = document.createElement("canvas");
  drawPopupSword(canvas);
  Object.assign(canvas.style, { width: "112px", height: "112px", margin: "12px auto 4px", imageRendering: "pixelated", display: "block" });

  const title = document.createElement("div");
  title.textContent = "The Crossing Blade";
  Object.assign(title.style, { color: "#f0cf77", fontFamily: "Georgia, serif", fontSize: "26px", fontWeight: "700" });

  const stats = document.createElement("div");
  stats.textContent = "350 DAMAGE · ACTIVE UNTIL THE WARDEN FALLS";
  Object.assign(stats.style, { marginTop: "7px", color: "#9ee7f2", fontSize: "11px", letterSpacing: ".1em", fontWeight: "800" });

  const body = document.createElement("p");
  body.textContent = "Reforged from Elara, Pip, and Maeve's failed crossings. Equip and use it immediately anywhere on the road to the Warden. The instant the Warden of Rushing Water falls, its power disappears forever and the blade becomes a keepsake.";
  Object.assign(body.style, { margin: "14px auto 18px", maxWidth: "340px", color: "rgba(248,243,231,.78)", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", lineHeight: "1.55" });

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Add to Inventory";
  Object.assign(button.style, { width: "100%", minHeight: "48px", border: "1px solid #e2c16c", borderRadius: "14px", background: "linear-gradient(90deg, #c99e42, #e4c86f)", color: "#142039", fontSize: "14px", fontWeight: "900", cursor: "pointer" });

  button.addEventListener("click", () => {
    const state = readState();
    state.forged = true;
    writeState(state);
    registerCrossingBladeWeapon();
    if (!scene.save.weapons.includes(CROSSING_BLADE_ID)) scene.save.weapons = [...scene.save.weapons, CROSSING_BLADE_ID];
    scene.save.equipped_weapon = CROSSING_BLADE_ID;
    scene.emitSave?.();
    scene.pushHud?.(true);
    scene.refreshHand?.();
    scene.game.events.emit("quest:toast", "The Crossing Blade is equipped — 350 damage until the Warden falls.");
    scene.__crossingBladePending = false;
    scene.__crossingBladePopupOpen = false;
    overlay.remove();
    scene.onResume?.();
  });

  card.append(eyebrow, canvas, title, stats, body, button);
  overlay.append(card);
  parent.append(overlay);
}

function hasMetSilas() {
  try {
    return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSilasMet() {
  try {
    window.localStorage.setItem(SILAS_STORAGE_KEY, "1");
  } catch {
    // Dialogue remains available even if storage is blocked.
  }
}

function showSilasDialogue(scene: SceneLike) {
  if (scene.__silasDialogueOpen) return;
  const parent = scene.game.canvas?.parentElement;
  if (!parent) return;
  scene.__silasDialogueOpen = true;
  scene.frozen = true;
  scene.physics.pause();

  const crossing = readState();
  const alreadyMet = hasMetSilas();
  const discovered = crossing.talked.length > 0 || crossing.forged;
  const defeated = crossing.wardenDefeated;
  const firstConversation = !alreadyMet && !defeated && !discovered;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    zIndex: "10020",
    display: "flex",
    alignItems: window.innerWidth < 700 ? "flex-end" : "center",
    justifyContent: "center",
    padding: "clamp(10px, 3vw, 28px)",
    background: "rgba(6,10,24,.62)",
    backdropFilter: "blur(4px)",
    boxSizing: "border-box",
  });

  const wrap = document.createElement("div");
  Object.assign(wrap.style, {
    width: "min(96vw, 1120px)",
    display: "grid",
    gridTemplateColumns: window.innerWidth < 700 ? "86px 1fr" : "minmax(210px, 300px) 1fr",
    gap: window.innerWidth < 700 ? "10px" : "18px",
    alignItems: "stretch",
    position: "relative",
  });

  const portrait = document.createElement("img");
  portrait.src = silasPortraitDataUrl();
  portrait.alt = "Silas";
  Object.assign(portrait.style, {
    width: "100%",
    height: window.innerWidth < 700 ? "86px" : "100%",
    minHeight: window.innerWidth < 700 ? "86px" : "280px",
    objectFit: "cover",
    border: "3px solid rgba(210,175,91,.75)",
    borderRadius: window.innerWidth < 700 ? "14px" : "24px",
    boxShadow: "0 18px 45px rgba(0,0,0,.38)",
    boxSizing: "border-box",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    position: "relative",
    minHeight: window.innerWidth < 700 ? "210px" : "280px",
    maxHeight: "78vh",
    overflow: "auto",
    border: "3px solid rgba(210,175,91,.7)",
    borderRadius: window.innerWidth < 700 ? "16px" : "26px",
    background: "linear-gradient(145deg, rgba(13,19,38,.98), rgba(11,17,34,.98))",
    boxShadow: "0 18px 48px rgba(0,0,0,.42)",
    padding: window.innerWidth < 700 ? "16px" : "28px 32px",
    color: "white",
    boxSizing: "border-box",
  });

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  Object.assign(close.style, {
    position: "absolute",
    right: "12px",
    top: "10px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(210,175,91,.7)",
    background: "#0d162b",
    color: "#e3c16d",
    fontSize: "24px",
    cursor: "pointer",
    zIndex: "2",
  });

  const heading = document.createElement("div");
  heading.innerHTML = `<span style="font-family:Georgia,serif;font-size:${window.innerWidth < 700 ? 21 : 30}px;font-weight:700;color:#dfbd68">Silas</span><span style="margin-left:14px;font-size:11px;letter-spacing:.2em;color:rgba(255,255,255,.58);font-weight:700">CARTOGRAPHER</span>`;

  const line = document.createElement("div");
  Object.assign(line.style, {
    marginTop: "20px",
    minHeight: "74px",
    color: "rgba(255,255,255,.96)",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: window.innerWidth < 700 ? "15px" : "19px",
    lineHeight: "1.55",
  });

  const choices = document.createElement("div");
  Object.assign(choices.style, { display: "grid", gap: "9px", marginTop: "14px" });

  const response = document.createElement("div");
  Object.assign(response.style, { marginTop: "14px" });

  panel.append(close, heading, line, choices, response);
  wrap.append(portrait, panel);
  overlay.append(wrap);
  parent.append(overlay);

  let timer: number | undefined;
  const type = (text: string, target: HTMLElement, done?: () => void) => {
    if (timer) window.clearInterval(timer);
    target.textContent = "“";
    let i = 0;
    timer = window.setInterval(() => {
      i += 1;
      target.textContent = `“${text.slice(0, i)}${i >= text.length ? "”" : ""}`;
      if (i >= text.length) {
        window.clearInterval(timer);
        timer = undefined;
        done?.();
      }
    }, 18);
  };

  const finish = () => {
    if (timer) window.clearInterval(timer);
    overlay.remove();
    scene.__silasDialogueOpen = false;
    scene.frozen = false;
    scene.physics.resume();
    markSilasMet();
  };
  close.addEventListener("click", finish);

  if (defeated) {
    type("You crossed the river. Then I suppose I need a new map.", line);
    return;
  }
  if (discovered || alreadyMet) {
    type(
      crossing.forged
        ? "You found the three — and judging by what you're carrying, they trusted you with something they never trusted themselves to finish. Don't waste that faith."
        : "You found the settlement. Good. Listen to those three before you face the Warden; they know the crossing better than any map ever could.",
      line,
    );
    return;
  }

  const opening = "Going toward the river? Then don't follow the old road straight there. Everyone who does comes back wearing the same expression.";
  type(opening, line, () => {
    const options = [
      {
        maria: "I'm still crossing. Tell me what you know.",
        silas: "Good. Southeast of here is a little settlement called The Last Crossing. Three people live there. All three challenged the Warden. All three came back. Talk to them before you decide you're ready.",
      },
      {
        maria: "Are you trying to scare me away?",
        silas: "No. Fear makes terrible maps. I'm trying to keep you from walking into the same mistake three other people already survived. Follow the old stone road southeast. When the lamps start appearing, you're close.",
      },
      {
        maria: "Why should I trust three people who failed?",
        silas: "Because failure is expensive knowledge. They know where the current pulls, when the Warden closes distance, and what courage looks like after it breaks. You want the other side? Start with the people who came back alive.",
      },
    ];

    options.forEach((opt) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = `“${opt.maria}”`;
      Object.assign(b.style, {
        width: "100%",
        border: "1px solid rgba(218,181,94,.38)",
        borderRadius: "12px",
        padding: "11px 13px",
        background: "rgba(255,255,255,.055)",
        color: "rgba(255,255,255,.94)",
        textAlign: "left",
        fontSize: window.innerWidth < 700 ? "13px" : "14px",
        cursor: "pointer",
        transition: "transform .14s ease, background .14s ease, border-color .14s ease",
      });
      b.addEventListener("mouseenter", () => {
        b.style.transform = "translateX(3px)";
        b.style.background = "rgba(218,181,94,.12)";
        b.style.borderColor = "rgba(218,181,94,.8)";
      });
      b.addEventListener("mouseleave", () => {
        b.style.transform = "translateX(0)";
        b.style.background = "rgba(255,255,255,.055)";
        b.style.borderColor = "rgba(218,181,94,.38)";
      });
      b.addEventListener("click", () => {
        choices.innerHTML = "";
        const maria = document.createElement("div");
        maria.textContent = `Maria: “${opt.maria}”`;
        Object.assign(maria.style, { color: "rgba(255,255,255,.72)", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "13px", marginBottom: "10px" });
        const silas = document.createElement("div");
        Object.assign(silas.style, { color: "#f5ead0", fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: window.innerWidth < 700 ? "14px" : "17px", lineHeight: "1.5" });
        const done = document.createElement("button");
        done.type = "button";
        done.textContent = "Continue";
        Object.assign(done.style, { display: "none", marginTop: "14px", width: "100%", minHeight: "44px", borderRadius: "12px", border: "1px solid #d7b45f", background: "rgba(215,180,95,.14)", color: "#e6c871", fontWeight: "800", cursor: "pointer" });
        done.addEventListener("click", finish);
        response.append(maria, silas, done);
        type(opt.silas, silas, () => { done.style.display = "block"; });
      });
      choices.append(b);
    });
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
  it.enabled = false;
  it.obj?.destroy?.();
  scene.interactables = (scene.interactables ?? []).filter((x: any) => x !== it);
  scene.__crossingBladePending = true;
  queueGuestSequence(scene, FORGE_DIALOGUE);
}

function updateBladeVisual(scene: SceneLike) {
  const state = readState();
  const active = Boolean(
    !state.wardenDefeated &&
      scene.save?.current_zone === "sunlit_shores" &&
      scene.save?.equipped_weapon === CROSSING_BLADE_ID &&
      scene.save?.weapons?.includes(CROSSING_BLADE_ID),
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
  registerCrossingBladeWeapon();

  const originalCreate = proto.create;
  proto.create = function lastCrossingCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    drawVillage(this);
    addSilas(this);
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
    if (it?.kind === "last-crossing-silas") {
      showSilasDialogue(this);
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
      if (this.__crossingBladePending && !this.__crossingBladePopupOpen) this.time.delayedCall(30, () => showBladeRewardPopup(this));
    }
    return result;
  };

  const originalEquip = proto.equipWeapon;
  proto.equipWeapon = function lastCrossingEquip(this: SceneLike, id: string, ...args: any[]) {
    if (id === CROSSING_BLADE_ID && readState().wardenDefeated) {
      this.game.events.emit("quest:toast", "The Crossing Blade is a keepsake now — its power ended with the Warden.");
      return;
    }
    return originalEquip.call(this, id, ...args);
  };

  const originalBossChoice = proto.onBossChoice;
  proto.onBossChoice = function lastCrossingBossChoice(this: SceneLike, ...args: any[]) {
    const result = originalBossChoice.apply(this, args);
    if (
      this.save?.current_zone === "sunlit_shores" &&
      this.bossName === "Warden of Rushing Water" &&
      this.save?.equipped_weapon === CROSSING_BLADE_ID &&
      !readState().wardenDefeated
    ) {
      this.game.events.emit("quest:toast", `The Crossing Blade is already awake — ${BLADE_DAMAGE} damage per hit.`);
    }
    return result;
  };

  const originalDefeatBoss = proto.defeatActBoss;
  proto.defeatActBoss = function lastCrossingDefeatBoss(this: SceneLike, ...args: any[]) {
    const wasWarden = this.save?.current_zone === "sunlit_shores" && this.bossName === "Warden of Rushing Water";
    const result = originalDefeatBoss.apply(this, args);
    if (wasWarden) {
      const state = readState();
      state.wardenDefeated = true;
      writeState(state);
      registerCrossingBladeWeapon();
      this.__crossingBladeSprite?.destroy?.();
      this.__crossingBladeSprite = undefined;
      if (this.save?.equipped_weapon === CROSSING_BLADE_ID) {
        const fallback = (this.save.weapons ?? []).find((id: string) => id !== CROSSING_BLADE_ID && WEAPON_BY_ID[id]);
        this.save.equipped_weapon = fallback ?? null;
        this.refreshHand?.();
        this.emitSave?.();
      }
      if (state.forged) {
        this.game.events.emit("quest:toast", "The Crossing Blade goes quiet. Its 350-damage power ended with the Warden.");
      }
      this.pushHud?.(true);
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
