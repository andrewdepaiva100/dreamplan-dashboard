// @ts-nocheck -- Optional Act II memorial; presentation only, no save/progression state.

const ZONE = "wedding_garden";
const KIND = "garden-memorial";
const TITLE = "The Garden of Remembrance";
const BODY = [
  "For those we love who could not walk beside us today.",
  "Some people leave footprints on our lives so deep that time cannot wash them away. They live in the stories we tell, the lessons we carry, the prayers we whisper, and the love we give to the people still beside us.",
  "Every beautiful beginning carries something forward.",
  "They are remembered here.",
];

function ensureMemorialTexture(scene: any) {
  if (scene.textures.exists("act2-memorial")) return;
  const tex = scene.textures.createCanvas("act2-memorial", 42, 52);
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  const p = (x:number,y:number,w:number,h:number,color:string) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
  // low plinth and warm ivory remembrance stone
  p(5,44,32,5,"#6d675f"); p(2,48,38,4,"#4f4b47");
  p(9,12,24,34,"#b8b0a1"); p(11,10,20,36,"#d8d0bf"); p(14,8,14,3,"#eee5cf");
  p(14,17,14,2,"#8d806d"); p(16,22,10,1,"#a0927e"); p(16,26,10,1,"#a0927e");
  // tiny carved flower
  p(20,32,2,7,"#7c8b68"); p(17,31,4,3,"#b56f82"); p(21,29,4,4,"#d58aa0"); p(24,32,3,3,"#b56f82");
  tex.refresh();
}

function showMemorialPopup(scene: any) {
  if (typeof document === "undefined" || document.getElementById("quest-act2-memorial")) return;
  scene.frozen = true;
  scene.player?.setVelocity?.(0, 0);

  const overlay = document.createElement("div");
  overlay.id = "quest-act2-memorial";
  overlay.style.cssText = "position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:22px;background:radial-gradient(circle at 50% 38%,rgba(42,57,46,.34),rgba(7,15,25,.82));backdrop-filter:blur(7px);font-family:Georgia,'Times New Roman',serif;animation:memorialFade .28s ease-out";

  const card = document.createElement("div");
  card.style.cssText = "position:relative;width:min(620px,92vw);max-height:86vh;overflow:auto;box-sizing:border-box;padding:38px 42px 32px;border:1px solid rgba(183,145,72,.72);border-radius:18px;background:linear-gradient(145deg,#fffaf0 0%,#f4ead5 58%,#eadcc2 100%);color:#24354a;box-shadow:0 30px 90px rgba(0,0,0,.52),inset 0 0 0 5px rgba(255,255,255,.42),inset 0 0 55px rgba(135,95,43,.10);text-align:center";

  const ornament = document.createElement("div");
  ornament.textContent = "❦  ✦  ❦";
  ornament.style.cssText = "color:#a17a36;font-size:18px;letter-spacing:8px;margin-bottom:12px";
  const eyebrow = document.createElement("div");
  eyebrow.textContent = "WEDDING GARDEN · A QUIET PLACE";
  eyebrow.style.cssText = "font-family:system-ui,sans-serif;font-size:10px;font-weight:800;letter-spacing:2.3px;color:#92733d;margin-bottom:9px";
  const title = document.createElement("h2");
  title.textContent = TITLE;
  title.style.cssText = "margin:0 0 18px;font-size:clamp(26px,5vw,38px);line-height:1.05;color:#173452;font-weight:600";
  const rule = document.createElement("div");
  rule.style.cssText = "width:90px;height:1px;margin:0 auto 22px;background:linear-gradient(90deg,transparent,#b58a42,transparent)";

  card.append(ornament, eyebrow, title, rule);
  BODY.forEach((text, i) => {
    const p = document.createElement("p");
    p.textContent = text;
    p.style.cssText = `margin:${i === 0 ? "0 0 18px" : "13px 0"};font-size:${i === 0 ? "18px" : "16px"};line-height:1.65;${i === 0 || i === BODY.length - 1 ? "font-style:italic;color:#6b4f45;" : "color:#31455a;"}`;
    card.appendChild(p);
  });

  const closing = document.createElement("div");
  closing.textContent = "Maria places a flower beside the stone.";
  closing.style.cssText = "margin:24px auto 20px;padding-top:18px;border-top:1px solid rgba(161,122,54,.28);font-size:14px;font-style:italic;color:#826858";
  const button = document.createElement("button");
  button.textContent = "Return to the Garden";
  button.style.cssText = "appearance:none;border:1px solid #9d7839;border-radius:999px;padding:11px 22px;background:linear-gradient(#244b69,#173852);color:#fff8e8;font:700 12px system-ui,sans-serif;letter-spacing:.5px;cursor:pointer;box-shadow:0 5px 14px rgba(23,56,82,.24)";
  card.append(closing, button);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const close = () => {
    overlay.remove();
    scene.frozen = false;
  };
  button.addEventListener("click", close, { once: true });
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter" || e.key.toLowerCase() === "e") {
      document.removeEventListener("keydown", key, true);
      close();
    }
  };
  document.addEventListener("keydown", key, true);
}

function addMemorial(scene: any) {
  if (scene.save?.current_zone !== ZONE) return;
  ensureMemorialTexture(scene);
  // Quiet western lawn: away from Conservatory, fountain, house approach and seasonal-key corners.
  const x = scene.wx(43);
  const y = scene.wy(42);
  const stone = scene.add.sprite(x, y, "act2-memorial").setDepth(scene.dsort(y + 10));
  scene.bakeShadow?.(x, y + 18, 30, 0.2);
  const glow = scene.add.ellipse(x, y + 16, 62, 24, 0xffe6b8, 0.13).setDepth(6);
  scene.tweens.add({ targets: glow, alpha: { from: 0.08, to: 0.18 }, scale: { from: 0.94, to: 1.05 }, duration: 2200, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
  const flowerTints = [0xffffff, 0xf2b7c9, 0xd99ab3, 0xffe6b8];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI;
    scene.add.ellipse(x - 38 + i * 9.5, y + 24 + Math.sin(a) * 7, 6, 4, flowerTints[i % flowerTints.length], 0.92).setDepth(8);
  }
  const it = scene.addInteractable(x, y + 12, "plate", KIND, "Read the Memorial", { radius: 68, depth: 6 });
  it?.obj?.setAlpha?.(0.001);
}

export function installAct2Memorial(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2MemorialInstalled) return;
  proto.__act2MemorialInstalled = true;

  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function act2MemorialBuild(...args: any[]) {
    const result = originalBuildAct2.apply(this, args);
    addMemorial(this);
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act2MemorialInteract(...args: any[]) {
    const near = this.nearest?.();
    if (near?.kind === KIND) {
      showMemorialPopup(this);
      return;
    }
    return originalInteract.apply(this, args);
  };
}
