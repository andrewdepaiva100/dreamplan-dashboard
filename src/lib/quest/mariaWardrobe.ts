// @ts-nocheck -- isolated presentation gate + Maria palette selection.
import "./mariaWardrobe.css";

const STORAGE_KEY = "marias-quest-outfit-v1";

const OUTFITS = [
  { id: "classic", name: "Classic Maria", note: "Brave. Kind. You.", color: null, colors: ["#f4ead8", "#7b4b2f", "#173f69"] },
  { id: "rose", name: "Rose Dress", note: "Romantic and radiant.", color: "#f08aa2", colors: ["#f08aa2", "#f7b6c7", "#b92e50"] },
  { id: "golden", name: "Golden Traveler", note: "For the road ahead.", color: "#d7a53f", colors: ["#f4ead8", "#e3b34c", "#476b3b"] },
  { id: "garden", name: "Garden Dress", note: "Soft as the season.", color: "#91c69b", colors: ["#91c69b", "#f0a6bb", "#f5e8d5"] },
  { id: "evening", name: "Evening Look", note: "Grace in the quiet.", color: "#35569a", colors: ["#183d7a", "#70409c", "#d5aa52"] },
  { id: "winter", name: "Winter Wrap", note: "Warm through anything.", color: "#b8d9ea", colors: ["#e8f4f8", "#8ec7e8", "#6f657d"] },
  { id: "sunlit", name: "Sunlit Dress", note: "Light finds you.", color: "#f0c45b", colors: ["#f4d263", "#fff3d8", "#e99a42"] },
  { id: "midnight", name: "Midnight Wanderer", note: "Bold and free.", color: "#57418d", colors: ["#171a28", "#57418d", "#315a9d"] },
  { id: "haven", name: "Heart of Haven", note: "Home, always.", color: "#5aaed0", colors: ["#4aa9d0", "#f4ead8", "#89b89a"] },
  { id: "crimson", name: "Crimson Trail", note: "Fierce and fearless.", color: "#b93646", colors: ["#c93b4d", "#7d2933", "#d4a74e"] },
];

function selectedId() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "classic"; } catch { return "classic"; }
}

export function openMariaWardrobe(onBegin: () => void) {
  if (typeof document === "undefined") return;
  if (document.getElementById("quest-maria-wardrobe")) return;
  let choice = selectedId();
  const root = document.createElement("div");
  root.id = "quest-maria-wardrobe";
  root.innerHTML = `
    <div class="mqw-shell" role="dialog" aria-modal="true" aria-label="Dress Maria">
      <div class="mqw-flourish">✦ ❦ ✦</div>
      <h2>Dress Maria</h2>
      <p class="mqw-subtitle">Choose the colors that feel like you.</p>
      <div class="mqw-grid">
        ${OUTFITS.map((o, i) => `
          <button type="button" class="mqw-card${choice === o.id ? " is-selected" : ""}" data-outfit="${o.id}" aria-pressed="${choice === o.id}">
            <span class="mqw-number">${i + 1}</span>
            <span class="mqw-dress" style="--dress:${o.colors[0]};--dress2:${o.colors[1]}">👗</span>
            <strong>${o.name}</strong>
            <small>${o.note}</small>
            <span class="mqw-swatches">${o.colors.map(c => `<i style="background:${c}"></i>`).join("")}</span>
          </button>`).join("")}
      </div>
      <div class="mqw-actions">
        <button type="button" class="mqw-back">Back</button>
        <button type="button" class="mqw-begin">Begin Your Journey</button>
      </div>
      <p class="mqw-quote">“Different paths. The same Maria.”</p>
    </div>`;
  document.body.appendChild(root);

  root.querySelectorAll("[data-outfit]").forEach((card) => {
    card.addEventListener("click", () => {
      choice = card.getAttribute("data-outfit") || "classic";
      root.querySelectorAll("[data-outfit]").forEach((c) => {
        const active = c.getAttribute("data-outfit") === choice;
        c.classList.toggle("is-selected", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });
    });
  });
  root.querySelector(".mqw-back")?.addEventListener("click", () => root.remove());
  root.querySelector(".mqw-begin")?.addEventListener("click", () => {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch { /* storage optional */ }
    root.remove();
    onBegin();
  });
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function outfitTextureKey(outfitId: string, dir: string, frame: number) {
  return `maria-outfit-${outfitId}-${dir}-${frame}`;
}

function recolorDressFrame(scene: any, sourceKey: string, targetKey: string, hex: string) {
  if (scene.textures.exists(targetKey) || !scene.textures.exists(sourceKey)) return;
  const source = scene.textures.get(sourceKey).getSourceImage();
  const width = source.width || 48;
  const height = source.height || 68;
  const tex = scene.textures.createCanvas(targetKey, width, height);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const target = hexToRgb(hex);

  // Maria's base dress is cream/white. Recolour only neutral light fabric pixels,
  // leaving skin, hair, face, shoes and coloured details intact.
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 20) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;
    const light = (r + g + b) / 3;

    if (light < 112 || chroma > 34) continue;

    const shade = Math.max(0.46, Math.min(1.08, light / 220));
    const highlight = Math.max(0, (light - 205) / 90);
    data[i] = Math.min(255, target.r * shade + 38 * highlight);
    data[i + 1] = Math.min(255, target.g * shade + 38 * highlight);
    data[i + 2] = Math.min(255, target.b * shade + 38 * highlight);
  }

  ctx.putImageData(image, 0, 0);
  tex.refresh();
}

function installOutfitFrames(scene: any, outfit: any) {
  if (!outfit?.color) return false;
  const dirs = ["down", "side", "up"];
  for (const dir of dirs) {
    for (let frame = 0; frame < 3; frame++) {
      recolorDressFrame(
        scene,
        `maria-${dir}-${frame}`,
        outfitTextureKey(outfit.id, dir, frame),
        outfit.color,
      );
    }
  }

  for (const dir of dirs) {
    scene.anims.remove(`maria-walk-${dir}`);
    scene.anims.remove(`maria-idle-${dir}`);
    scene.anims.create({
      key: `maria-walk-${dir}`,
      frames: [0, 1, 0, 2].map((frame) => ({ key: outfitTextureKey(outfit.id, dir, frame) })),
      frameRate: 9,
      repeat: -1,
    });
    scene.anims.create({
      key: `maria-idle-${dir}`,
      frames: [{ key: outfitTextureKey(outfit.id, dir, 0) }],
      frameRate: 1,
      repeat: -1,
    });
  }
  return true;
}

export function installMariaWardrobe(QuestScene: any) {
  if (!QuestScene?.prototype || QuestScene.prototype.__mariaWardrobeInstalled) return;
  QuestScene.prototype.__mariaWardrobeInstalled = true;
  const original = QuestScene.prototype.addPlayer;
  if (typeof original !== "function") return;

  QuestScene.prototype.addPlayer = function (...args: any[]) {
    const result = original.apply(this, args);
    const id = selectedId();
    const outfit = OUTFITS.find((o) => o.id === id) ?? OUTFITS[0];
    const player = this.player;
    if (!player) return result;

    // Never use Phaser's whole-sprite tint for wardrobe colours. It colours
    // Maria's skin/hair too, and combat hit flashes clear it afterward.
    player.clearTint?.();

    if (installOutfitFrames(this, outfit)) {
      player.setTexture(outfitTextureKey(outfit.id, "down", 0));
      player.anims.play("maria-idle-down", true);
    }
    player.setData?.("maria-outfit", outfit.id);
    return result;
  };
}

if (typeof window !== "undefined") {
  const installRuntime = () => {
    void import("./scene").then((m) => installMariaWardrobe(m.QuestScene)).catch(() => undefined);
  };
  if ((window as any).__questRuntimeReady) installRuntime();
  else window.addEventListener("quest:runtime-ready", installRuntime, { once: true });
}
