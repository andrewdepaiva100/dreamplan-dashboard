// @ts-nocheck -- Act III environmental story landmarks only; no rewards or progression gates.
import * as Phaser from "phaser";

type SceneCtor = { prototype: any };
const ZONE = "the_haven";

const BUILDINGS = [
  {
    id: "music-house",
    tx: 42,
    ty: 38,
    title: "The Haven Music House",
    prompt: "Visit the Haven Music House",
    kicker: "WHERE HAVEN KEEPS ITS SONGS",
    quote: "Two people keep finding the rhythm again.",
    body:
      "The little rehearsal hall has kept Haven's wedding songs for generations. Handwritten arrangements fill the shelves inside, each one marked with the names of the people who first danced to it. Maria recognizes a phrase from her own missing melody in the practice notes pinned beside the window.",
    palette: { wall: 0xffe8df, trim: 0xd68aa2, roof: 0x8f5f78, dark: 0x5d4055, glow: 0xffd98b },
    sign: "MUSIC HOUSE",
    emblem: "♫",
  },
  {
    id: "promise-archive",
    tx: 88,
    ty: 44,
    title: "The Promise Archive",
    prompt: "Visit the Promise Archive",
    kicker: "A HOUSE FOR WORDS MEANT TO LAST",
    quote: "A promise is the choice to keep returning.",
    body:
      "Blue-grey stone protects thousands of promises from Haven's rain and years. Couples have brought copies of vows, letters, pressed flowers and tiny photographs here since the town was founded. Among the newer drawers, Maria notices an empty rose-gold card waiting for a future memory of her own.",
    palette: { wall: 0xd9e4ed, trim: 0x7898b8, roof: 0x536f8e, dark: 0x344a63, glow: 0xffdf91 },
    sign: "PROMISE ARCHIVE",
    emblem: "♥",
  },
  {
    id: "hearth-home",
    tx: 62,
    ty: 84,
    title: "The Hearth & Home",
    prompt: "Visit the Hearth & Home",
    kicker: "FOR ALL THE LITTLE DAYS AFTER THE WEDDING",
    quote: "The home is all the little days you build together.",
    body:
      "For generations, newly married couples in Haven came here after the ceremony to share their first ordinary meal with neighbors. In harder years the same tables filled with food, letters and quiet company; on anniversaries, couples returned to light one small candle in the front window. Maria lingers over the thought: beyond vows and songs, this is what she and Andrew are walking toward — a life made warm by returning, repairing, laughing, eating, resting and choosing each other again.",
    palette: { wall: 0xffe4bd, trim: 0xb8734d, roof: 0x60443d, dark: 0x49332f, glow: 0xffbd62 },
    sign: "HEARTH & HOME",
    emblem: "♥",
  },
] as const;

const ANDREW_REACTIONS: Record<string, string> = {
  "music-house": "If they have our song in there, I'm requesting the version where I somehow know how to dance.",
  "promise-archive": "I like that they kept the imperfect promises too. Those are probably the ones people had to choose more than once.",
  "hearth-home": "That's the part I'm most excited for, you know. Not just the wedding. The Tuesdays after it.",
};

function cssHex(n: number) {
  return `#${n.toString(16).padStart(6, "0")}`;
}

function addMusicHouseRoof(scene: any, c: any, p: any) {
  const roof = scene.add.graphics();
  roof.fillStyle(p.roof, 1);
  roof.lineStyle(3, p.dark, 0.95);
  roof.beginPath();
  // The lower edge deliberately overlaps the facade top (-38) by 8px so the
  // roof reads as physically seated on the building, never floating above it.
  roof.moveTo(-64, -30);
  roof.lineTo(-35, -67);
  roof.lineTo(0, -84);
  roof.lineTo(35, -67);
  roof.lineTo(64, -30);
  roof.lineTo(50, -30);
  roof.lineTo(0, -72);
  roof.lineTo(-50, -30);
  roof.closePath();
  roof.fillPath();
  roof.strokePath();
  roof.lineStyle(2, p.trim, 0.95);
  roof.lineBetween(-55, -35, 0, -76);
  roof.lineBetween(0, -76, 55, -35);
  const fascia = scene.add.rectangle(0, -31, 112, 9, p.trim, 1).setStrokeStyle(2, p.dark, 0.82);
  const underEave = scene.add.rectangle(0, -27, 102, 4, p.dark, 0.9);
  const ridge = scene.add.rectangle(0, -78, 24, 5, 0xdcb0bd, 1).setStrokeStyle(1, p.dark, 0.8);
  const peak = scene.add.text(0, -89, "♫", { fontFamily: "Georgia, serif", fontSize: "12px", color: "#ffe2a0", stroke: "#5d4055", strokeThickness: 2 }).setOrigin(0.5);
  c.add([roof, fascia, underEave, ridge, peak]);
}

function addPromiseArchiveRoof(scene: any, c: any, p: any) {
  // Formal roofline with a deep base overlapping the wall, then a raised civic
  // cap and pediment. The base reaches down to -27, well into the facade.
  const roofBase = scene.add.rectangle(0, -37, 112, 22, p.roof, 1).setStrokeStyle(3, p.dark, 0.95);
  const lowerCornice = scene.add.rectangle(0, -27, 118, 7, p.trim, 1).setStrokeStyle(1, p.dark, 0.8);
  const cap = scene.add.rectangle(0, -51, 118, 7, 0x6d89a6, 1).setStrokeStyle(1, p.dark, 0.75);
  const pediment = scene.add.triangle(0, -55, -36, 18, 0, -12, 36, 18, 0x7898b8, 1).setStrokeStyle(2, p.dark, 0.95);
  const pedimentLine = scene.add.rectangle(0, -43, 76, 5, 0xb9c9d8, 1).setStrokeStyle(1, p.dark, 0.7);
  const crest = scene.add.text(0, -60, "♥", { fontFamily: "Georgia, serif", fontSize: "11px", color: "#ffe2a0", stroke: "#344a63", strokeThickness: 2 }).setOrigin(0.5);
  c.add([roofBase, lowerCornice, cap, pediment, pedimentLine, crest]);
}

function addHearthRoof(scene: any, c: any, p: any) {
  const roof = scene.add.triangle(0, -55, -61, 27, 0, -26, 61, 27, p.roof, 1).setStrokeStyle(3, p.dark, 0.95);
  const roofBand = scene.add.rectangle(0, -31, 110, 9, p.trim, 1).setStrokeStyle(2, p.dark, 0.75);
  const underEave = scene.add.rectangle(0, -27, 102, 4, p.dark, 0.9);
  c.add([roof, roofBand, underEave]);
}

function makeBuilding(scene: any, cfg: (typeof BUILDINGS)[number]) {
  const x = scene.wx(cfg.tx), y = scene.wy(cfg.ty), p = cfg.palette, depth = scene.dsort(y);
  const c = scene.add.container(x, y).setDepth(depth);
  const shadow = scene.add.ellipse(0, 18, 118, 28, 0x342d38, 0.2);
  const step = scene.add.rectangle(0, 19, 84, 10, 0xb8a69d, 0.95).setStrokeStyle(2, p.dark, 0.5);
  const wall = scene.add.rectangle(0, -8, 100, 60, p.wall, 1).setStrokeStyle(3, p.trim, 1);
  c.add([shadow, step, wall]);
  if (cfg.id === "music-house") addMusicHouseRoof(scene, c, p);
  else if (cfg.id === "promise-archive") addPromiseArchiveRoof(scene, c, p);
  else addHearthRoof(scene, c, p);

  const door = scene.add.rectangle(0, 3, 24, 42, p.dark, 1).setStrokeStyle(2, 0xffe9bd, 0.72);
  const doorInset = scene.add.rectangle(0, 4, 15, 30, p.trim, 0.72);
  const knob = scene.add.circle(7, 5, 2.2, 0xffd875, 1);
  const leftWindow = scene.add.rectangle(-31, -4, 22, 25, 0x9ed9e5, 0.88).setStrokeStyle(3, p.trim, 1);
  const rightWindow = scene.add.rectangle(31, -4, 22, 25, 0x9ed9e5, 0.88).setStrokeStyle(3, p.trim, 1);
  const mullions = scene.add.graphics(); mullions.lineStyle(2, 0xfff1d8, 0.9);
  for (const wx of [-31, 31]) { mullions.lineBetween(wx, -16, wx, 8); mullions.lineBetween(wx - 10, -4, wx + 10, -4); }
  const signWidth = cfg.id === "promise-archive" ? 84 : cfg.id === "hearth-home" ? 78 : 70;
  const signPlate = scene.add.rectangle(0, -29, signWidth, 15, 0xfff1d5, 0.98).setStrokeStyle(2, p.trim, 1);
  const sign = scene.add.text(0, -29, cfg.sign, { fontFamily: "Georgia, serif", fontSize: cfg.id === "promise-archive" ? "8px" : "9px", fontStyle: "bold", color: "#5a4351" }).setOrigin(0.5);
  c.add([door, doorInset, knob, leftWindow, rightWindow, mullions, signPlate, sign]);

  if (cfg.id === "music-house") {
    const awning = scene.add.rectangle(-34, 13, 30, 5, 0xffd2dc, 1).setStrokeStyle(1, p.dark, 0.6);
    const roses = [-48, -39, 40, 49].map((ox, i) => scene.add.circle(ox, 20 - (i % 2) * 3, 4.5, i % 2 ? 0xff9fbd : 0xffffff, 0.95));
    const stand = scene.add.rectangle(-42, 5, 14, 10, 0x6b4b5d, 0.92).setAngle(-5);
    const standPost = scene.add.rectangle(-42, 15, 2, 17, 0x6b4b5d, 0.9);
    const poster = scene.add.rectangle(43, -15, 15, 18, 0xfff3dc, 0.95).setStrokeStyle(1, p.trim, 0.8);
    c.add([awning, ...roses, stand, standPost, poster]);
    ["♪", "♫", "♪"].forEach((glyph, i) => {
      const note = scene.add.text(x - 30 + i * 28, y - 88 - (i % 2) * 8, glyph, { fontFamily: "Georgia, serif", fontSize: "12px", color: i % 2 ? "#d68aa2" : "#d6a75c" }).setOrigin(0.5).setDepth(depth + 1).setAlpha(0.7);
      scene.tweens.add({ targets: note, y: note.y - 10, alpha: { from: 0.35, to: 0.8 }, duration: 1100 + i * 180, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    });
  } else if (cfg.id === "promise-archive") {
    const columns = [-43, 43].map((ox) => scene.add.rectangle(ox, -1, 8, 47, 0xc3d0dc, 1).setStrokeStyle(1, p.dark, 0.45));
    const plaque = scene.add.rectangle(31, 14, 25, 9, 0xcaa25f, 0.95).setStrokeStyle(1, 0xffe2a0, 0.8);
    const ivy = [-50, -44, 44, 50].map((ox, i) => scene.add.circle(ox, 18 - (i % 2) * 6, 4, 0x789b72, 0.88));
    c.add([...columns, plaque, ...ivy]);
  } else {
    const beams = scene.add.graphics(); beams.lineStyle(5, 0x7a503d, 0.9);
    beams.lineBetween(-48, -27, -48, 17); beams.lineBetween(48, -27, 48, 17); beams.lineBetween(-48, -24, -13, 15); beams.lineBetween(48, -24, 13, 15);
    const chimney = scene.add.rectangle(38, -58, 13, 32, 0x8b5c4b, 1).setStrokeStyle(2, 0x49332f, 0.8);
    const chimneyCap = scene.add.rectangle(38, -75, 17, 5, 0x49332f, 1);
    const flowerBoxes = [-31, 31].map((ox) => scene.add.rectangle(ox, 10, 25, 6, 0x8d573d, 1).setStrokeStyle(1, 0x49332f, 0.7));
    const flowers = [-39, -32, -24, 23, 31, 39].map((ox, i) => scene.add.circle(ox, 6 - (i % 2) * 2, 3.2, i % 3 === 0 ? 0xfff1d0 : i % 2 ? 0xff8fa8 : 0xd98d64, 1));
    const wood = [-50, -44, -38].map((ox, i) => scene.add.rectangle(ox, 21 - i * 2, 14, 4, 0x79513d, 1).setAngle(i % 2 ? 8 : -7));
    const table = scene.add.rectangle(47, 23, 29, 6, 0x8a6046, 1).setStrokeStyle(1, 0x49332f, 0.7);
    const candle = scene.add.circle(47, 17, 3, 0xffd879, 0.95);
    c.add([beams, chimney, chimneyCap, ...flowerBoxes, ...flowers, ...wood, table, candle]);
    scene.tweens.add({ targets: candle, alpha: { from: 0.55, to: 1 }, scale: { from: 0.85, to: 1.2 }, duration: 620, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  }

  const glow = scene.add.ellipse(x, y + 12, 104, 34, p.glow, 0.1).setDepth(depth - 0.2).setBlendMode(Phaser.BlendModes.ADD);
  scene.tweens.add({ targets: glow, alpha: { from: 0.06, to: 0.16 }, scaleX: { from: 0.94, to: 1.08 }, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

  if (!scene.solidDecor) scene.solidDecor = scene.physics.add.staticGroup();
  const blocker = scene.solidDecor.create(x, y + 17, "block") as Phaser.Physics.Arcade.Sprite;
  blocker.setVisible(false).setAlpha(0).setDisplaySize(76, 13).refreshBody?.();
  const body = blocker.body as Phaser.Physics.Arcade.StaticBody;
  body.setSize(76, 13).setOffset((blocker.width - 76) / 2, (blocker.height - 13) / 2); body.updateFromGameObject?.();

  const it = scene.addInteractable(x, y + 33, "spark", "haven-building", cfg.prompt, { id: cfg.id, radius: 62, data: { title: cfg.title, body: cfg.body }, depth: depth + 1 });
  it.obj.setAlpha(0.001).setScale(0.15); scene.tweens.killTweensOf(it.obj); it.obj.setY(y + 33);
}

function popupFlourish(scene: any, cfg: any, x: number, y: number) {
  const p = cfg.palette;
  scene.cameras?.main?.flash?.(220, 255, 243, 225);
  scene.spawnSparkle?.(x, y - 18, p.glow, 14);
  const halo = scene.add.circle(x, y - 20, 28, p.glow, 0.08).setStrokeStyle(2, p.trim, 0.85).setDepth(970);
  const emblem = scene.add.text(x, y - 20, cfg.emblem, { fontFamily: "Georgia, serif", fontSize: "22px", fontStyle: "bold", color: "#fff3cf", stroke: "#5b4654", strokeThickness: 3 }).setOrigin(0.5).setDepth(971);
  scene.tweens.add({ targets: [halo, emblem], y: `-=18`, alpha: 0, scale: 1.28, duration: 650, ease: "Sine.easeOut", onComplete: () => { halo.destroy(); emblem.destroy(); } });
}

function showAndrewReaction(scene: any, id: string) {
  const line = ANDREW_REACTIONS[id];
  const andrew = scene.companion;
  if (!line || !andrew?.active || scene.save?.current_zone !== ZONE) return;
  scene.spawnSparkle?.(andrew.x - 7, andrew.y - 8, 0x78baff, 6);
  scene.spawnSparkle?.(andrew.x + 7, andrew.y - 8, 0xff9fc5, 5);
  const text = scene.add.text(andrew.x, andrew.y - 42, `Andrew: “${line}”`, {
    fontFamily: "Georgia, serif",
    fontSize: "12px",
    fontStyle: "italic",
    color: "#fff6df",
    backgroundColor: "rgba(24,35,61,.72)",
    padding: { x: 10, y: 7 },
    stroke: "#243b61",
    strokeThickness: 4,
    align: "center",
    wordWrap: { width: 270, useAdvancedWrap: true },
  }).setOrigin(0.5, 1).setDepth(982).setAlpha(0);
  scene.tweens.add({ targets: text, alpha: 0.98, y: text.y - 5, duration: 280, ease: "Sine.easeOut" });
  scene.time?.delayedCall?.(6500, () => {
    if (!text?.active) return;
    scene.tweens.add({ targets: text, y: text.y - 18, alpha: 0, duration: 1500, ease: "Sine.easeIn", onComplete: () => text.destroy() });
  });
}

function showHavenStoryCard(scene: any, cfg: any) {
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const mobile = window.innerWidth < 700;
  const p = cfg.palette;
  const trim = cssHex(p.trim);
  const glow = cssHex(p.glow);
  const dark = cssHex(p.dark);
  scene.frozen = true;
  scene.physics?.pause?.();

  const overlay = document.createElement("div");
  overlay.className = `quest-haven-story-card quest-haven-story-${cfg.id}`;
  Object.assign(overlay.style, {
    position: "absolute", inset: "0", zIndex: "10065", display: "flex", alignItems: mobile ? "flex-end" : "center",
    justifyContent: "center", padding: mobile ? "10px" : "28px", boxSizing: "border-box",
    background: `radial-gradient(circle at 50% 36%,${trim}33,rgba(4,9,18,.92) 64%)`, backdropFilter: "blur(3px)",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    position: "relative", width: "min(94vw,760px)", maxHeight: mobile ? "88vh" : "82vh", overflow: "auto",
    border: `1px solid ${glow}aa`, borderRadius: mobile ? "20px" : "30px", padding: mobile ? "22px 18px 20px" : "34px 40px 30px",
    boxSizing: "border-box", color: "#fff9ed",
    background: `linear-gradient(155deg,${dark}fa,rgba(9,16,29,.985) 72%)`,
    boxShadow: `0 30px 80px rgba(0,0,0,.6),0 0 0 5px ${trim}20,0 0 42px ${glow}22`,
  });

  const innerFrame = document.createElement("div");
  Object.assign(innerFrame.style, {
    position: "absolute", inset: mobile ? "8px" : "11px", border: `1px solid ${trim}66`, borderRadius: mobile ? "15px" : "22px",
    pointerEvents: "none",
  });

  const seal = document.createElement("div");
  seal.textContent = cfg.emblem;
  Object.assign(seal.style, {
    width: mobile ? "64px" : "78px", height: mobile ? "64px" : "78px", margin: "0 auto 14px", borderRadius: "50%",
    display: "grid", placeItems: "center", fontFamily: "Georgia,serif", fontSize: mobile ? "30px" : "38px", fontWeight: "900",
    color: "#fff7d5", border: `2px solid ${glow}`, background: `radial-gradient(circle,${trim}dd,${dark})`,
    boxShadow: `0 0 0 6px ${glow}18,0 8px 24px rgba(0,0,0,.35),0 0 28px ${glow}30`,
  });

  const kicker = document.createElement("div");
  kicker.textContent = cfg.kicker;
  Object.assign(kicker.style, { textAlign: "center", fontSize: "10px", letterSpacing: ".23em", fontWeight: "900", color: glow, marginBottom: "8px" });

  const title = document.createElement("div");
  title.textContent = cfg.title;
  Object.assign(title.style, { textAlign: "center", fontFamily: "Georgia,serif", fontSize: mobile ? "27px" : "36px", lineHeight: "1.12", fontWeight: "800", color: "#fffaf0", textShadow: `0 2px 14px ${glow}28` });

  const ornament = document.createElement("div");
  ornament.textContent = cfg.id === "music-house" ? "♪   ✦   ♫   ✦   ♪" : cfg.id === "promise-archive" ? "♥   ───   ✦   ───   ♥" : "✦   ♥   ✦   ♥   ✦";
  Object.assign(ornament.style, { textAlign: "center", color: trim, fontSize: mobile ? "13px" : "15px", letterSpacing: ".12em", margin: "18px 0" });

  const lore = document.createElement("div");
  lore.textContent = cfg.body;
  Object.assign(lore.style, { fontFamily: "Georgia,serif", fontSize: mobile ? "15px" : "17px", lineHeight: "1.72", color: "rgba(255,249,237,.92)", textAlign: "left" });

  const quote = document.createElement("div");
  quote.textContent = `“${cfg.quote}”`;
  Object.assign(quote.style, {
    margin: "22px 0 8px", padding: mobile ? "15px 16px" : "18px 24px", borderRadius: "16px", border: `1px solid ${glow}66`,
    borderLeft: `4px solid ${glow}`, background: `${trim}16`, fontFamily: "Georgia,serif", fontStyle: "italic", fontWeight: "700",
    fontSize: mobile ? "17px" : "21px", lineHeight: "1.45", color: "#fff2c7", textAlign: "center",
    boxShadow: `inset 0 0 24px ${glow}0d`,
  });

  const footer = document.createElement("div");
  footer.textContent = cfg.id === "music-house" ? "A song remembered in Haven" : cfg.id === "promise-archive" ? "A promise preserved in Haven" : "A future imagined in Haven";
  Object.assign(footer.style, { marginTop: "17px", textAlign: "center", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.48)" });

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "Return to Haven";
  Object.assign(close.style, {
    width: "100%", minHeight: "48px", marginTop: "18px", borderRadius: "14px", border: `1px solid ${glow}`,
    background: `linear-gradient(180deg,${trim}38,${trim}18)`, color: "#fff4cf", fontWeight: "900", letterSpacing: ".06em", cursor: "pointer",
    boxShadow: `0 8px 24px rgba(0,0,0,.24),inset 0 1px ${glow}44`,
  });
  const closeStory = () => {
    if (!overlay.isConnected) return;
    overlay.remove();
    scene.onResume?.();
  };
  close.onclick = closeStory;
  overlay.addEventListener("click", (ev) => { if (ev.target === overlay) closeStory(); });

  card.append(innerFrame, seal, kicker, title, ornament, lore, quote, footer, close);
  overlay.append(card);
  parent.append(overlay);
}

function openBuildingPopup(scene: any, it: any) {
  const cfg = BUILDINGS.find((b) => b.id === it.id);
  if (!cfg) return false;
  popupFlourish(scene, cfg, it.obj.x, it.obj.y);
  const seen = (scene.__act3LandmarkReactionSeen ??= new Set<string>());
  if (scene.companion?.active && !seen.has(cfg.id)) scene.__act3PendingLandmarkReaction = cfg.id;
  showHavenStoryCard(scene, cfg);
  return true;
}

function thinCrowdedHavenTrees(scene: any) {
  const children = (scene.solidDecor?.getChildren?.() ?? []) as Phaser.Physics.Arcade.Sprite[];
  const trees = children.filter((obj) => obj?.active && obj.texture?.key === "tree");
  const worldW = scene.mapW * 32, worldH = scene.mapH * 32;
  const interior = trees.filter((t) => t.x > 105 && t.y > 105 && t.x < worldW - 105 && t.y < worldH - 105);
  const kept: Phaser.Physics.Arcade.Sprite[] = [];
  const minGap = 118;
  for (const tree of interior) {
    const crowded = kept.some((other) => Phaser.Math.Distance.Between(tree.x, tree.y, other.x, other.y) < minGap);
    if (crowded) {
      scene.tweens?.killTweensOf?.(tree);
      tree.disableBody?.(true, true);
      tree.destroy?.();
    } else kept.push(tree);
  }
}

export function installAct3HavenLandmarks(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype as any;
  if (proto.__act3HavenLandmarksInstalled) return;
  proto.__act3HavenLandmarksInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  proto.buildAct3 = function act3HavenLandmarksBuild(...args: any[]) {
    const result = originalBuildAct3.apply(this, args);
    if (this.save?.current_zone === ZONE) {
      thinCrowdedHavenTrees(this);
      BUILDINGS.forEach((cfg) => makeBuilding(this, cfg));
    }
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act3HavenLandmarkInteract(...args: any[]) {
    if (this.save?.current_zone === ZONE && !this.frozen) {
      let best: any = null, bestD = Infinity;
      for (const it of this.interactables ?? []) {
        if (!it?.enabled || !it.obj?.active || it.kind !== "haven-building") continue;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, it.obj.x, it.obj.y);
        if (d <= (it.radius ?? 62) && d < bestD) { best = it; bestD = d; }
      }
      if (best && openBuildingPopup(this, best)) return;
    }
    return originalInteract.apply(this, args);
  };

  const originalResume = proto.onResume;
  proto.onResume = function act3HavenLandmarkResume(...args: any[]) {
    const result = originalResume.apply(this, args);
    const id = this.__act3PendingLandmarkReaction as string | undefined;
    if (!id || this.save?.current_zone !== ZONE || !this.companion?.active) return result;
    this.__act3PendingLandmarkReaction = undefined;
    const seen = (this.__act3LandmarkReactionSeen ??= new Set<string>());
    if (seen.has(id)) return result;
    seen.add(id);
    this.time?.delayedCall?.(320, () => showAndrewReaction(this, id));
    return result;
  };
}
