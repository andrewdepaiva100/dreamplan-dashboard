import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

type VillagerId = "elara" | "pip" | "maeve";
type DialogueBeat = { id: VillagerId | "blade"; name: string; role?: string; line: string };

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const BLADE_DAMAGE = 350;
const VILLAGE_SAFE_RADIUS = 285;

const PRE_DIALOGUE: Record<VillagerId, DialogueBeat[]> = {
  elara: [
    { id: "elara", name: "Elara", role: "Former knight", line: "You're headed for the crossing, aren't you?" },
    { id: "elara", name: "Elara", role: "Former knight", line: "I know because you're wearing the same face I wore before I met the Warden." },
    { id: "elara", name: "Elara", role: "Former knight", line: "I thought courage meant refusing to retreat. The river taught me otherwise." },
    { id: "elara", name: "Elara", role: "Former knight", line: "Don't mistake surviving for cowardice, Maria. Sometimes coming home is the bravest thing you do." },
  ],
  pip: [
    { id: "pip", name: "Pip", role: "Inventor", line: "WAIT. You're not planning to cross the river, are you?" },
    { id: "pip", name: "Pip", role: "Inventor", line: "Excellent. Terrible. Mostly terrible. I tried seven times." },
    { id: "pip", name: "Pip", role: "Inventor", line: "Technically the seventh attempt was the remains of the sixth attempt." },
    { id: "pip", name: "Pip", role: "Inventor", line: "I kept thinking if I built something clever enough, I wouldn't have to be afraid." },
    { id: "pip", name: "Pip", role: "Inventor", line: "Turns out fear knows how to swim." },
  ],
  maeve: [
    { id: "maeve", name: "Maeve", role: "Healer", line: "Maria." },
    { id: "maeve", name: "Maeve", role: "Healer", line: "The Warden said your name when I reached the other side." },
    { id: "maeve", name: "Maeve", role: "Healer", line: "I made it farther than Elara or Pip. Then he asked what I was willing to lose, and I had no answer." },
    { id: "maeve", name: "Maeve", role: "Healer", line: "He isn't guarding the other side. He's guarding the part of you that wants to turn around." },
  ],
};

const POST_DIALOGUE: Record<VillagerId, DialogueBeat[]> = {
  elara: [
    { id: "elara", name: "Elara", role: "Former knight", line: "You crossed." },
    { id: "elara", name: "Elara", role: "Former knight", line: "I spent years believing the river had the final word. Thank you for proving me wrong." },
  ],
  pip: [
    { id: "pip", name: "Pip", role: "Inventor", line: "You actually did it." },
    { id: "pip", name: "Pip", role: "Inventor", line: "Which means I owe several people money. More importantly: the blade worked." },
  ],
  maeve: [
    { id: "maeve", name: "Maeve", role: "Healer", line: "What did he ask you?" },
    { id: "maeve", name: "Maeve", role: "Healer", line: "Whatever your answer was, you carried all four of us across that river." },
    { id: "maeve", name: "Maeve", role: "Healer", line: "The Crossing Blade is only old steel now. Keep it anyway. Some things are worth carrying after their power is gone." },
  ],
};

const FORGE_DIALOGUE: DialogueBeat[] = [
  { id: "elara", name: "Elara", role: "Former knight", line: "There is one thing we haven't told you. This is what remained of my sword after I challenged him." },
  { id: "pip", name: "Pip", role: "Inventor", line: "She calls it a sword. When she gave it to me, it was approximately six pieces of metal and a bad memory." },
  { id: "pip", name: "Pip", role: "Inventor", line: "I rebuilt it with pieces from all three of our failed expeditions. It can hold together now. Mostly." },
  { id: "maeve", name: "Maeve", role: "Healer", line: "Repairing the blade isn't enough. The crossing remembers us — our fear, our failures, every time we turned back." },
  { id: "maeve", name: "Maeve", role: "Healer", line: "The blessing binds that memory to one enemy. The blade will recognize the Warden and no one else." },
  { id: "elara", name: "Elara", role: "Former knight", line: "Listen carefully. That sword belongs to the crossing. Once the Warden falls, its strength dies with him." },
  { id: "pip", name: "Pip", role: "Inventor", line: "You can carry it afterward. It just won't be particularly impressive anymore." },
  { id: "maeve", name: "Maeve", role: "Healer", line: "We're not giving you a weapon, Maria. We're giving you the attempt we never finished." },
  { id: "blade", name: "The Crossing Blade", role: "WARDEN ONLY · 350 DAMAGE", line: "Bound to the Warden of Rushing Water. Every successful strike deals 350 damage using the Warden's real health pool. Its power ends when the Warden falls." },
];

function readState() {
  const fallback = { talked: [] as VillagerId[], forged: false, wardenDefeated: false };
  if (typeof window === "undefined") return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<typeof fallback>;
    return {
      talked: Array.isArray(parsed.talked) ? parsed.talked.filter((id): id is VillagerId => ["elara", "pip", "maeve"].includes(id)) : [],
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
    // Local progression is optional; the village still works for the current session.
  }
}

function ensureTexture(scene: SceneLike, key: string, draw: (g: Phaser.GameObjects.Graphics) => void, w: number, h: number) {
  if (scene.textures.exists(key)) return;
  const g = scene.add.graphics();
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

function buildVillageTextures(scene: SceneLike) {
  const npc = (key: string, hair: number, coat: number, accent: number, extra: "shield" | "goggles" | "herbs") => {
    ensureTexture(scene, key, (g) => {
      g.fillStyle(0x1e1b22, 0.2); g.fillEllipse(12, 30, 16, 5);
      g.fillStyle(coat, 1); g.fillRoundedRect(6, 14, 12, 15, 3);
      g.fillStyle(0xe8b98e, 1); g.fillCircle(12, 10, 6);
      g.fillStyle(hair, 1); g.fillRoundedRect(6, 3, 12, 7, 3); g.fillRect(6, 7, 3, 7);
      g.fillStyle(0x24202a, 1); g.fillRect(9, 10, 2, 2); g.fillRect(14, 10, 2, 2);
      g.fillStyle(accent, 1); g.fillRect(8, 17, 8, 3);
      g.fillStyle(0x45352f, 1); g.fillRect(7, 27, 4, 5); g.fillRect(14, 27, 4, 5);
      if (extra === "shield") { g.fillStyle(0x7b6958, 1); g.fillCircle(3, 20, 5); g.lineStyle(1, 0xd8c498, 1); g.strokeCircle(3, 20, 4); }
      if (extra === "goggles") { g.lineStyle(2, 0xd8aa48, 1); g.strokeCircle(9, 9, 3); g.strokeCircle(15, 9, 3); g.lineBetween(12, 9, 12, 9); }
      if (extra === "herbs") { g.fillStyle(0x6ea35b, 1); g.fillCircle(20, 18, 3); g.fillCircle(21, 23, 3); g.fillStyle(0xe7d47b, 1); g.fillCircle(20, 20, 1.5); }
    }, 24, 34);
  };

  npc("last-crossing-elara", 0x56505f, 0x7c3446, 0xc49b61, "shield");
  npc("last-crossing-pip", 0x6c4b2e, 0x416f79, 0xe7b84b, "goggles");
  npc("last-crossing-maeve", 0x9a4f36, 0x66855b, 0xe9dfb7, "herbs");

  const portrait = (key: string, hair: number, coat: number, accent: number, extra: "shield" | "goggles" | "herbs") => {
    ensureTexture(scene, key, (g) => {
      g.fillStyle(0x11182b, 1); g.fillRect(0, 0, 112, 112);
      g.fillStyle(0x24334d, 1); g.fillCircle(56, 58, 49);
      g.fillStyle(coat, 1); g.fillRoundedRect(22, 74, 68, 38, 14);
      g.fillStyle(0xe8b98e, 1); g.fillCircle(56, 50, 29);
      g.fillStyle(hair, 1); g.fillRoundedRect(28, 17, 56, 26, 15); g.fillRect(28, 35, 11, 32);
      g.fillStyle(0x29222b, 1); g.fillCircle(46, 50, 3); g.fillCircle(66, 50, 3);
      g.lineStyle(2, 0x7d4b44, 1); g.beginPath(); g.arc(56, 62, 10, 0.2, Math.PI - 0.2); g.strokePath();
      g.fillStyle(accent, 1); g.fillRect(34, 79, 44, 7);
      if (extra === "shield") { g.lineStyle(4, 0xc9b07a, 1); g.strokeCircle(91, 84, 17); g.lineBetween(80, 96, 102, 72); }
      if (extra === "goggles") { g.lineStyle(5, 0xd9ad4f, 1); g.strokeCircle(45, 49, 10); g.strokeCircle(67, 49, 10); g.lineBetween(55, 49, 57, 49); }
      if (extra === "herbs") { g.fillStyle(0x6aa45b, 1); g.fillCircle(91, 86, 9); g.fillCircle(101, 76, 7); g.fillStyle(0xf0d86d, 1); g.fillCircle(95, 81, 3); }
    }, 112, 112);
  };

  portrait("last-crossing-portrait-elara", 0x56505f, 0x7c3446, 0xc49b61, "shield");
  portrait("last-crossing-portrait-pip", 0x6c4b2e, 0x416f79, 0xe7b84b, "goggles");
  portrait("last-crossing-portrait-maeve", 0x9a4f36, 0x66855b, 0xe9dfb7, "herbs");

  ensureTexture(scene, "last-crossing-blade", (g) => {
    g.lineStyle(5, 0x6c4c37, 1); g.lineBetween(9, 30, 18, 21);
    g.lineStyle(3, 0xe7c972, 1); g.lineBetween(7, 25, 13, 31);
    g.lineStyle(6, 0xb7e8ef, 1); g.lineBetween(17, 21, 35, 3);
    g.lineStyle(2, 0xffefae, 1); g.lineBetween(18, 19, 34, 3);
    g.fillStyle(0xe7c972, 1); g.fillCircle(14, 24, 3);
  }, 40, 36);
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
    if (o?.texture?.key === "tree" && Phaser.Math.Distance.Between(o.x ?? 0, o.y ?? 0, cx, cy) < VILLAGE_SAFE_RADIUS) o.destroy();
  }
  for (const enemy of scene.enemies?.getChildren?.() ?? []) {
    const e = enemy as Phaser.Physics.Arcade.Sprite;
    if (e.active && Phaser.Math.Distance.Between(e.x, e.y, cx, cy) < VILLAGE_SAFE_RADIUS) e.disableBody(true, true);
  }
}

function drawCottage(scene: SceneLike, x: number, y: number, wall: number, roof: number, accent: number) {
  const g = scene.add.graphics().setDepth(scene.dsort?.(y + 34) ?? 10);
  g.fillStyle(0x17202a, 0.18); g.fillEllipse(x + 8, y + 35, 104, 27);
  g.fillStyle(0x806d58, 1); g.fillRect(x - 42, y + 26, 84, 8);
  g.fillStyle(wall, 1); g.fillRoundedRect(x - 39, y - 6, 78, 35, 4);
  g.fillStyle(0x5a4436, 1); g.fillRect(x - 39, y - 6, 5, 35); g.fillRect(x + 34, y - 6, 5, 35);
  g.fillStyle(roof, 1); g.beginPath(); g.moveTo(x - 49, y - 4); g.lineTo(x, y - 37); g.lineTo(x + 49, y - 4); g.closePath(); g.fill();
  g.fillStyle(0x302822, 1); g.fillRect(x - 8, y + 7, 17, 22);
  g.fillStyle(0x9fd2df, 1); g.fillRect(x - 29, y + 5, 14, 12); g.fillRect(x + 17, y + 5, 14, 12);
  g.lineStyle(2, 0xf3e6bf, 1); g.strokeRect(x - 29, y + 5, 14, 12); g.strokeRect(x + 17, y + 5, 14, 12);
  g.fillStyle(accent, 1); g.fillCircle(x - 35, y + 27, 6); g.fillCircle(x + 36, y + 28, 6);
  addBlocker(scene, x, y + 19, 2.6, 1.0);
}

function addVillageInteractable(scene: SceneLike, x: number, y: number, texture: string, kind: string, id: string, label: string, radius = 62) {
  const obj = scene.add.sprite(x, y, texture).setDepth(scene.dsort?.(y) ?? 15).setScale(1.25);
  scene.interactables.push({ obj, kind, id, label, radius, enabled: true });
  return obj;
}

function drawVillage(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || scene.__lastCrossingBuilt) return;
  scene.__lastCrossingBuilt = true;
  buildVillageTextures(scene);

  const cx = Math.round((scene.mapW ?? 55) * 32 * 0.79);
  const cy = Math.round((scene.mapH ?? 50) * 32 * 0.78);
  clearVillageSpace(scene, cx, cy);

  const ground = scene.add.graphics().setDepth(5);
  ground.fillStyle(0xc7ae7a, 0.35); ground.fillEllipse(cx, cy + 24, 360, 220);
  ground.lineStyle(18, 0xbca471, 0.42);
  ground.beginPath(); ground.moveTo(cx - 250, cy + 150); ground.lineTo(cx - 110, cy + 60); ground.lineTo(cx + 40, cy + 25); ground.lineTo(cx + 230, cy - 40); ground.strokePath();
  ground.lineStyle(3, 0xe8dbb8, 0.42);
  for (let i = -4; i <= 4; i++) ground.strokeCircle(cx + i * 34, cy + 30 + Math.sin(i) * 12, 7);

  drawCottage(scene, cx - 120, cy - 70, 0xd4b58c, 0x6b4850, 0xc86f7d);
  drawCottage(scene, cx + 120, cy - 70, 0xc6b08a, 0x445f68, 0xe4bd59);
  drawCottage(scene, cx + 15, cy + 115, 0xd9c9a8, 0x60704f, 0x87a66b);

  const decor = scene.add.graphics().setDepth(9);
  // central well
  decor.fillStyle(0x756b61, 1); decor.fillEllipse(cx, cy + 12, 52, 20); decor.fillStyle(0x34383e, 1); decor.fillEllipse(cx, cy + 9, 36, 12);
  decor.lineStyle(4, 0x604938, 1); decor.lineBetween(cx - 20, cy + 8, cx - 20, cy - 30); decor.lineBetween(cx + 20, cy + 8, cx + 20, cy - 30); decor.lineBetween(cx - 22, cy - 28, cx + 22, cy - 28);
  // communal fire and logs
  decor.fillStyle(0x775640, 1); decor.fillRect(cx - 78, cy + 54, 30, 6); decor.fillRect(cx - 74, cy + 46, 6, 24);
  decor.fillStyle(0xf2b84b, 1); decor.fillCircle(cx - 61, cy + 45, 8); decor.fillStyle(0xe66b3b, 0.9); decor.fillCircle(cx - 60, cy + 49, 5);
  // broken wagon / failed expedition gear
  decor.lineStyle(5, 0x6a4c36, 1); decor.strokeCircle(cx + 205, cy + 90, 18); decor.strokeCircle(cx + 250, cy + 90, 18); decor.lineBetween(cx + 205, cy + 72, cx + 250, cy + 72); decor.lineBetween(cx + 225, cy + 70, cx + 260, cy + 42);
  decor.lineStyle(4, 0x7d6a5a, 1); decor.lineBetween(cx + 170, cy + 70, cx + 192, cy + 50); decor.lineBetween(cx + 182, cy + 82, cx + 200, cy + 60);
  // gardens and fence fragments
  decor.lineStyle(3, 0x80664b, 1);
  for (let i = 0; i < 5; i++) { decor.lineBetween(cx - 210 + i * 18, cy + 65, cx - 210 + i * 18, cy + 95); decor.lineBetween(cx - 220, cy + 78 + i * 4, cx - 125, cy + 78 + i * 4); }
  for (let i = 0; i < 16; i++) { const px = cx - 210 + (i % 8) * 12; const py = cy + 80 + Math.floor(i / 8) * 16; decor.fillStyle(i % 2 ? 0xd98aa1 : 0xe8cf75, 1); decor.fillCircle(px, py, 3); }
  // village sign
  decor.fillStyle(0x6d4e35, 1); decor.fillRect(cx - 272, cy + 124, 6, 40); decor.fillRoundedRect(cx - 315, cy + 110, 92, 28, 4); decor.lineStyle(2, 0xe5d4aa, 1); decor.strokeRoundedRect(cx - 312, cy + 113, 86, 22, 3);
  const signText = scene.add.text(cx - 269, cy + 124, "THE LAST\nCROSSING", { fontFamily: "serif", fontSize: "9px", color: "#f4e6bd", align: "center" }).setOrigin(0.5).setDepth(10);

  addBlocker(scene, cx, cy + 12, 1.2, 0.55);
  addBlocker(scene, cx + 228, cy + 77, 1.65, 0.7);

  addVillageInteractable(scene, cx - 112, cy - 8, "last-crossing-elara", "last-crossing-npc", "elara", "Talk to Elara", 72);
  addVillageInteractable(scene, cx + 112, cy - 8, "last-crossing-pip", "last-crossing-npc", "pip", "Talk to Pip", 72);
  addVillageInteractable(scene, cx + 15, cy + 68, "last-crossing-maeve", "last-crossing-npc", "maeve", "Talk to Maeve", 72);

  scene.__lastCrossingCenter = { x: cx, y: cy };
  refreshForgeInteractable(scene);
  void signText;
}

function refreshForgeInteractable(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const state = readState();
  const existing = (scene.interactables ?? []).find((it: any) => it.kind === "last-crossing-forge");
  const ready = state.talked.length === 3 && !state.forged && !state.wardenDefeated;
  if (!ready || existing) return;
  const c = scene.__lastCrossingCenter;
  if (!c) return;
  const obj = scene.add.sprite(c.x, c.y - 35, "last-crossing-blade").setDepth(18).setScale(1.3);
  scene.tweens.add({ targets: obj, y: obj.y - 5, alpha: { from: 0.72, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
  scene.interactables.push({ obj, kind: "last-crossing-forge", id: "crossing-blade", label: "Receive the Crossing Blade", radius: 82, enabled: true });
}

function portraitKey(id: DialogueBeat["id"]) {
  if (id === "blade") return "last-crossing-blade";
  return `last-crossing-portrait-${id}`;
}

function showDialogue(scene: SceneLike, beats: DialogueBeat[], onDone?: () => void) {
  if (!beats.length || scene.__lastCrossingDialogue) return;
  scene.__lastCrossingDialogue = true;
  scene.frozen = true;
  scene.physics.pause();

  const cam = scene.cameras.main;
  const width = cam.width;
  const height = cam.height;
  const root = scene.add.container(0, 0).setDepth(5000).setScrollFactor(0);
  const bg = scene.add.rectangle(0, 0, width, height, 0x060a18, 0.78).setOrigin(0).setScrollFactor(0);
  const panelH = Math.min(230, height * 0.46);
  const panelY = height - panelH - 18;
  const panel = scene.add.rectangle(18, panelY, width - 36, panelH, 0x0b1428, 0.97).setOrigin(0).setStrokeStyle(2, 0xd1ad62, 0.95).setScrollFactor(0);
  const portrait = scene.add.sprite(92, panelY + panelH / 2, portraitKey(beats[0]!.id)).setScrollFactor(0).setScale(beats[0]!.id === "blade" ? 2.3 : 1.2);
  const name = scene.add.text(166, panelY + 24, "", { fontFamily: "Georgia, serif", fontSize: "22px", fontStyle: "bold", color: "#e8c66d" }).setScrollFactor(0);
  const role = scene.add.text(166, panelY + 54, "", { fontFamily: "system-ui, sans-serif", fontSize: "10px", color: "#aeb8ca" }).setScrollFactor(0);
  const text = scene.add.text(166, panelY + 80, "", { fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "italic", color: "#f6f0e5", wordWrap: { width: Math.max(180, width - 210) }, lineSpacing: 6 }).setScrollFactor(0);
  const hint = scene.add.text(width - 36, panelY + panelH - 24, "Tap / click to continue", { fontFamily: "system-ui, sans-serif", fontSize: "10px", color: "#e8c66d" }).setOrigin(1, 0.5).setScrollFactor(0);
  root.add([bg, panel, portrait, name, role, text, hint]);

  let index = 0;
  const render = () => {
    const beat = beats[index]!;
    portrait.setTexture(portraitKey(beat.id)).setScale(beat.id === "blade" ? 2.3 : 1.2);
    name.setText(beat.name);
    role.setText((beat.role ?? "").toUpperCase());
    text.setText(`“${beat.line}”`);
  };

  const finish = () => {
    scene.input.off("pointerdown", advance);
    root.destroy(true);
    scene.__lastCrossingDialogue = false;
    scene.frozen = false;
    scene.physics.resume();
    onDone?.();
  };
  const advance = () => {
    index += 1;
    if (index >= beats.length) finish();
    else render();
  };
  scene.input.on("pointerdown", advance);
  render();
}

function handleVillager(scene: SceneLike, id: VillagerId) {
  const state = readState();
  if (state.wardenDefeated) {
    showDialogue(scene, POST_DIALOGUE[id]);
    return;
  }
  showDialogue(scene, PRE_DIALOGUE[id], () => {
    const next = readState();
    if (!next.talked.includes(id)) next.talked.push(id);
    writeState(next);
    if (next.talked.length === 3 && !next.forged) {
      scene.game.events.emit("quest:toast", "The three villagers gather by the well. Something is ready for you.");
      refreshForgeInteractable(scene);
    }
  });
}

function handleForge(scene: SceneLike, it: any) {
  const state = readState();
  if (state.forged || state.wardenDefeated || state.talked.length < 3) return;
  showDialogue(scene, FORGE_DIALOGUE, () => {
    const next = readState();
    next.forged = true;
    writeState(next);
    it.enabled = false;
    it.obj?.destroy?.();
    scene.interactables = (scene.interactables ?? []).filter((x: any) => x !== it);
    scene.game.events.emit("quest:toast", `The Crossing Blade is ready — ${BLADE_DAMAGE} damage against the Warden only.`);
  });
}

function updateBladeVisual(scene: SceneLike) {
  const active = Boolean(scene.__crossingBladeActive && scene.save?.current_zone === "sunlit_shores" && scene.boss?.active && scene.bossPhase === 1);
  let blade = scene.__crossingBladeSprite as Phaser.GameObjects.Sprite | undefined;
  if (!active) {
    blade?.destroy();
    scene.__crossingBladeSprite = undefined;
    return;
  }
  if (!blade?.active) {
    blade = scene.add.sprite(scene.player.x, scene.player.y, "last-crossing-blade").setDepth(24).setScale(1.1);
    scene.__crossingBladeSprite = blade;
  }
  const dir = scene.lastDir as "up" | "down" | "side";
  const facing = Number(scene.facing ?? 1);
  if (dir === "up") blade.setPosition(scene.player.x + 9, scene.player.y - 18).setAngle(-38).setFlipX(false);
  else if (dir === "down") blade.setPosition(scene.player.x + 12, scene.player.y + 9).setAngle(42).setFlipX(false);
  else blade.setPosition(scene.player.x + 17 * facing, scene.player.y - 2).setAngle(facing > 0 ? 18 : -18).setFlipX(facing < 0);
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
      if (state.forged) this.game.events.emit("quest:toast", "The Crossing Blade goes quiet. Its 350-damage blessing ended with the Warden.");
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
