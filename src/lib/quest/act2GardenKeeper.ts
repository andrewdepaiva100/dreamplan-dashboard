// @ts-nocheck -- Narrow runtime decorator for the Phaser quest scene.

import evelynPortrait from "../../assets/quest/portrait-evelyn.svg";

const ZONE = "wedding_garden";
const KEEPER_KIND = "garden-keeper";
const LETTER_KIND = "garden-keeper-letter";

// Evelyn now sits just off Maria's Act II arrival point so the Garden Keeper
// is one of the first characters the player naturally meets.
const KEEPER_X = 96;
const KEEPER_Y = 56;
const GUIDE_X = 86;
const GUIDE_Y = 34;
const SMITH_X = 104;
const SMITH_Y = 38;
const GUEST_X = 108;
const GUEST_Y = 78;

const KEEPER_LINES = [
  "This garden is not simply dying, Maria. Its seasons have forgotten how to belong to one another. Spring keeps trying to begin. Summer refuses to end. Autumn cannot let go. Winter will not wake. The four Seasonal Keys once kept them in balance. Bring them home, and watch what the garden remembers.",
  "Spring answered you. I have tended these beds for years, but they have not opened like that for me. Keep going — the garden knows the difference between being repaired and being cared for.",
  "Two seasons are breathing together again. Look at the fountain light. The garden recognizes you, Maria. You are not merely collecting keys; you are reminding this place what it was made to hold.",
  "Three seasons have returned. One remains. When the fourth comes home, return to me. There is something beneath the flowering arch that has been waiting longer than I have.",
  "All four seasons are home. The Conservatory can hear them again. Before you go inside, there is something here for you — beneath the flowering arch.",
];

function removeActTwoDog(scene: any) {
  for (const it of [...(scene.interactables ?? [])]) {
    if (it?.kind !== "dog") continue;
    it.enabled = false;
    it.obj?.destroy?.();
    scene.interactables = scene.interactables.filter((entry: any) => entry !== it);
  }
  const offer = scene.zoneState?.["dogOffer"];
  if (offer) {
    offer.enabled = false;
    offer.obj?.destroy?.();
    scene.zoneState["dogOffer"] = undefined;
  }
  if (scene.dog) {
    scene.dog.destroy?.();
    scene.dog = null;
  }
}

function addKeeperStation(scene: any) {
  const x = scene.wx(KEEPER_X);
  const y = scene.wy(KEEPER_Y);
  const keeper = scene.addInteractable(x, y, "guide-act", KEEPER_KIND, "Talk to Evelyn", { id: "evelyn", radius: 92, depth: 9 });
  keeper?.obj?.setTint?.(0x91aa78);
  keeper?.obj?.setScale?.(0.92);
  if (keeper?.obj) scene.tweens.add({ targets: keeper.obj, y: keeper.obj.y - 2, duration: 1700, yoyo: true, repeat: -1 });

  const depth = 6;
  scene.add.rectangle(x - 88, y + 42, 68, 20, 0x76513b, 1).setDepth(depth);
  scene.add.rectangle(x - 88, y + 54, 58, 7, 0x4f382d, 1).setDepth(depth);
  scene.add.rectangle(x - 112, y + 66, 6, 26, 0x4f382d, 1).setDepth(depth);
  scene.add.rectangle(x - 64, y + 66, 6, 26, 0x4f382d, 1).setDepth(depth);
  scene.add.circle(x - 111, y + 29, 8, 0xb86f4f, 1).setDepth(depth + 1);
  scene.add.circle(x - 84, y + 29, 7, 0xc57a55, 1).setDepth(depth + 1);
  scene.add.circle(x - 58, y + 31, 6, 0xa95e45, 1).setDepth(depth + 1);
  scene.add.rectangle(x - 80, y + 27, 20, 5, 0xb9c1a0, 1).setAngle(-18).setDepth(depth + 2);
  scene.add.circle(x + 48, y + 8, 7, 0xd8b65d, 0.72).setDepth(depth + 1);
  const glow = scene.add.circle(x + 48, y + 8, 20, 0xffdc82, 0.12).setDepth(depth);
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
  if (n >= 1) {
    addFlower(-120, 18, 0x9dff70, 0.62);
    for (const [dx, dy] of [[-30, 82], [20, 88], [66, 66]]) addFlower(dx, dy, 0xb9f28f);
  }
  if (n >= 2) {
    art.glow?.setFillStyle?.(0xffd66f, 0.28);
    for (const [dx, dy] of [[18, -58], [62, -40], [92, -10]]) {
      const light = scene.add.circle(x + dx, y + dy, 5, 0xffd66f, 0.75).setDepth(7);
      made.push(light);
      scene.tweens.add({ targets: light, alpha: { from: 0.35, to: 0.9 }, duration: 1100 + Math.random() * 500, yoyo: true, repeat: -1 });
    }
  }
  if (n >= 3) {
    for (let i = 0; i < 8; i++) {
      const leaf = scene.add.ellipse(x - 96 + i * 25, y - 68 + (i % 3) * 16, 7, 4, i % 2 ? 0xd98b43 : 0xe7b95f, 0.72).setDepth(7);
      made.push(leaf);
      scene.tweens.add({ targets: leaf, y: leaf.y + 30, x: leaf.x + 12, alpha: 0.1, duration: 2200 + i * 130, repeat: -1, delay: i * 180 });
    }
  }
  if (n >= 4) {
    const archLeft = scene.add.rectangle(x + 92, y - 8, 7, 72, 0x6c8f55, 1).setDepth(5);
    const archRight = scene.add.rectangle(x + 150, y - 8, 7, 72, 0x6c8f55, 1).setDepth(5);
    const archTop = scene.add.rectangle(x + 121, y - 43, 64, 7, 0x6c8f55, 1).setDepth(5);
    made.push(archLeft, archRight, archTop);
    for (const [dx, dy] of [[92,-36],[104,-44],[118,-46],[132,-44],[148,-36],[92,-12],[150,-10]]) addFlower(dx, dy, 0xf2a5bd, 0.58);
    const table = scene.add.ellipse(x + 121, y + 28, 50, 22, 0x7a563e, 1).setDepth(5);
    const leg = scene.add.rectangle(x + 121, y + 42, 6, 26, 0x51392e, 1).setDepth(4);
    const chair = scene.add.rectangle(x + 162, y + 35, 18, 28, 0x6a4936, 1).setDepth(4);
    made.push(table, leg, chair);
    if (!scene.__act2KeeperLetterAdded) {
      scene.__act2KeeperLetterAdded = true;
      const letter = scene.addInteractable(x + 121, y + 20, "envelope", LETTER_KIND, "Read the letter for Maria", { id: "four-seasons", radius: 72, depth: 8 });
      if (letter?.obj) {
        letter.obj.setTint?.(0xffe5a8);
        scene.tweens.add({ targets: letter.obj, y: letter.obj.y - 3, duration: 1200, yoyo: true, repeat: -1 });
      }
      scene.spawnSparkle?.(x + 121, y + 10, 0xffd978, 20);
      scene.emitToast?.("The four seasons answer together. A flowering arch opens beside Evelyn.");
    }
  }
  art.seasonal = made;
}

function showEvelynDialogue(scene: any, line: string) {
  document.getElementById("quest-evelyn-dialogue")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "quest-evelyn-dialogue";
  overlay.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(6,10,24,.64);backdrop-filter:blur(3px);font-family:inherit";
  overlay.innerHTML = `
    <div style="position:relative;width:min(860px,96vw);display:flex;align-items:flex-end;gap:14px">
      <button data-close aria-label="Skip dialogue" style="position:absolute;right:2px;top:-42px;z-index:2;width:36px;height:36px;border-radius:999px;border:1px solid rgba(240,210,125,.75);background:rgba(10,16,34,.96);color:#efd477;font-weight:800;cursor:pointer">✕</button>
      <img src="${evelynPortrait}" alt="Evelyn" style="width:min(240px,28vw);aspect-ratio:1;object-fit:cover;border-radius:18px;border:2px solid #d7b65e;box-shadow:0 18px 50px rgba(0,0,0,.48),0 0 30px rgba(215,182,94,.18)" />
      <button data-advance style="position:relative;flex:1;min-height:190px;text-align:left;overflow:hidden;border-radius:20px;border:2px solid rgba(215,182,94,.82);background:rgba(10,16,34,.96);box-shadow:0 20px 55px rgba(0,0,0,.48);padding:22px 24px;cursor:pointer;color:white">
        <div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(215,182,94,.12),transparent 48%,rgba(145,170,120,.11));pointer-events:none"></div>
        <div style="position:relative">
          <div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap"><strong style="font-family:Georgia,serif;font-size:23px;color:#efd477;letter-spacing:.02em">Evelyn</strong><span style="font-size:10px;color:rgba(255,255,255,.58);letter-spacing:.18em;text-transform:uppercase">Keeper of the Four Seasons</span></div>
          <p data-text style="min-height:78px;margin:13px 0 0;font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.65;color:rgba(255,255,255,.96)"></p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span style="display:flex;gap:6px"><i style="width:20px;height:4px;border-radius:9px;background:#d7b65e"></i><i style="width:20px;height:4px;border-radius:9px;background:rgba(255,255,255,.18)"></i><i style="width:20px;height:4px;border-radius:9px;background:rgba(255,255,255,.18)"></i></span><span data-hint style="font-size:10px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#efd477">…</span></div>
        </div>
      </button>
    </div>`;
  if (window.matchMedia("(max-width: 640px)").matches) {
    const wrap = overlay.firstElementChild as HTMLElement;
    wrap.style.alignItems = "stretch";
    const img = overlay.querySelector("img") as HTMLElement;
    img.style.width = "78px";
    img.style.height = "78px";
    img.style.position = "absolute";
    img.style.left = "16px";
    img.style.top = "16px";
    img.style.zIndex = "3";
    const panel = overlay.querySelector("[data-advance]") as HTMLElement;
    panel.style.padding = "20px 18px 18px 110px";
    panel.style.minHeight = "210px";
  }
  document.body.appendChild(overlay);
  const text = overlay.querySelector("[data-text]") as HTMLElement;
  const hint = overlay.querySelector("[data-hint]") as HTMLElement;
  let i = 0;
  let timer = window.setInterval(() => {
    i += 2;
    text.textContent = `“${line.slice(0, i)}${i >= line.length ? "”" : ""}`;
    if (i >= line.length) {
      window.clearInterval(timer);
      hint.textContent = "Tap to close";
    }
  }, 18);
  const close = () => {
    window.clearInterval(timer);
    overlay.remove();
    scene.scene?.resume?.();
  };
  overlay.querySelector("[data-close]")?.addEventListener("click", close);
  overlay.querySelector("[data-advance]")?.addEventListener("click", () => {
    if (i < line.length) {
      i = line.length;
      window.clearInterval(timer);
      text.textContent = `“${line}”`;
      hint.textContent = "Tap to close";
    } else close();
  });
  scene.scene?.pause?.();
}

function talkToKeeper(scene: any) {
  const n = Math.max(0, Math.min(4, Number(scene.zoneState?.["keysFound"] ?? 0)));
  scene.zoneState["keeperMet"] = true;
  if (n === 0) scene.objective = "Restore the Four Seasons — Seasonal Keys 0/4.";
  showEvelynDialogue(scene, KEEPER_LINES[n]);
}

function readGardenLetter(scene: any) {
  scene.zoneState["gardenLetterRead"] = true;
  scene.openModal({ type: "info", title: "For Maria — In Every Season", body: "Some things are beautiful because they last. Others are beautiful because we choose them again with every season.\n\nEvelyn looks toward the Conservatory. “Now you're ready to see what the garden was protecting.”" });
  scene.objective = "All four seasons are restored — enter the Grand Conservatory.";
}

export function installAct2GardenKeeper(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2GardenKeeperInstalled) return;
  proto.__act2GardenKeeperInstalled = true;

  const originalSpawnActGuide = proto.spawnActGuide;
  proto.spawnActGuide = function act2SpreadGuide(tx: number, ty: number) {
    if (this.save?.current_zone === ZONE) return originalSpawnActGuide.call(this, GUIDE_X, GUIDE_Y);
    return originalSpawnActGuide.call(this, tx, ty);
  };

  const originalAddBlacksmith = proto.addBlacksmith;
  proto.addBlacksmith = function act2SpreadBlacksmith(tx: number, ty: number) {
    if (this.save?.current_zone === ZONE) return originalAddBlacksmith.call(this, SMITH_X, SMITH_Y);
    return originalAddBlacksmith.call(this, tx, ty);
  };

  const originalAddGuest = proto.addGuest;
  proto.addGuest = function act2SpreadGuest(guest: any, tx: number, ty: number) {
    if (this.save?.current_zone === ZONE) return originalAddGuest.call(this, guest, GUEST_X, GUEST_Y);
    return originalAddGuest.call(this, guest, tx, ty);
  };

  const originalAddDogOffer = proto.addDogOffer;
  proto.addDogOffer = function noActTwoDog(tx: number, ty: number) {
    if (this.save?.current_zone === ZONE) return;
    return originalAddDogOffer.call(this, tx, ty);
  };

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
        this.objective = after >= 4 ? "All four seasons are restored — return to Evelyn by the fountain." : `Restore the Four Seasons — Seasonal Keys ${after}/4.`;
      }
    }
    return result;
  };
}
