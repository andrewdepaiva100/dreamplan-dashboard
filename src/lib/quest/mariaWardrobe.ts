// @ts-nocheck -- isolated presentation gate + Maria palette selection.
import "./mariaWardrobe.css";
import imgMariaDown from "@/assets/quest/maria-down.png";

const STORAGE_KEY = "marias-quest-outfit-v1";

const OUTFITS = [
  { id: "classic", name: "Classic Maria", note: "Brave. Kind. You.", color: null, colors: ["#fff1d6", "#8a4f2b", "#123f73"] },
  { id: "rose", name: "Rose Dress", note: "Romantic and radiant.", color: "#e83e72", colors: ["#ff6f9d", "#e83e72", "#8f173e"] },
  { id: "golden", name: "Golden Traveler", note: "For the road ahead.", color: "#d99a12", colors: ["#ffd45a", "#d99a12", "#5e7d31"] },
  { id: "garden", name: "Garden Dress", note: "Soft as the season.", color: "#3fa968", colors: ["#70d58f", "#3fa968", "#e85d91"] },
  { id: "evening", name: "Evening Look", note: "Grace in the quiet.", color: "#244f9f", colors: ["#244f9f", "#62329c", "#e1b84f"] },
  { id: "winter", name: "Winter Wrap", note: "Warm through anything.", color: "#63b9df", colors: ["#bcecff", "#63b9df", "#665c86"] },
  { id: "sunlit", name: "Sunlit Dress", note: "Light finds you.", color: "#f0a51a", colors: ["#ffe36a", "#f0a51a", "#ef7130"] },
  { id: "midnight", name: "Midnight Wanderer", note: "Bold and free.", color: "#3f287f", colors: ["#19172b", "#5a34a6", "#245aaa"] },
  { id: "haven", name: "Heart of Haven", note: "Home, always.", color: "#168fba", colors: ["#2cb9e7", "#168fba", "#5aa66c"] },
  { id: "crimson", name: "Crimson Trail", note: "Fierce and fearless.", color: "#a81834", colors: ["#e1334f", "#a81834", "#e2aa38"] },
];

function selectedId() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "classic"; } catch { return "classic"; }
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function recolorImageData(data: Uint8ClampedArray, hex: string) {
  const target = hexToRgb(hex);
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
    const shade = Math.max(0.42, Math.min(1.14, light / 214));
    const highlight = Math.max(0, (light - 202) / 75);
    data[i] = Math.min(255, target.r * shade + 42 * highlight);
    data[i + 1] = Math.min(255, target.g * shade + 42 * highlight);
    data[i + 2] = Math.min(255, target.b * shade + 42 * highlight);
  }
}

function makePreviewDataUrl(image: HTMLImageElement, color: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return image.src;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (color) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    recolorImageData(imageData.data, color);
    ctx.putImageData(imageData, 0, 0);
  }
  return canvas.toDataURL("image/png");
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
      <div class="mqw-layout">
        <aside class="mqw-preview" aria-live="polite">
          <div class="mqw-preview-kicker">Your Maria</div>
          <div class="mqw-preview-stage">
            <div class="mqw-preview-glow"></div>
            <img class="mqw-preview-maria" src="${imgMariaDown}" alt="Maria wearing the selected dress" />
          </div>
          <div class="mqw-preview-copy">
            <strong class="mqw-preview-name"></strong>
            <span class="mqw-preview-note"></span>
            <div class="mqw-preview-swatches"></div>
          </div>
          <p class="mqw-preview-quote">Same Maria. New colors. A little more magic.</p>
        </aside>
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
      </div>
      <div class="mqw-actions">
        <button type="button" class="mqw-back">Back</button>
        <button type="button" class="mqw-begin">Begin Your Journey</button>
      </div>
      <p class="mqw-quote">“Different paths. The same Maria.”</p>
    </div>`;
  document.body.appendChild(root);

  const previewImg = root.querySelector(".mqw-preview-maria") as HTMLImageElement | null;
  const sourceImg = new Image();
  sourceImg.src = imgMariaDown;
  const previewCache = new Map<string, string>();

  const updatePreview = () => {
    const outfit = OUTFITS.find((o) => o.id === choice) ?? OUTFITS[0];
    const name = root.querySelector(".mqw-preview-name");
    const note = root.querySelector(".mqw-preview-note");
    const swatches = root.querySelector(".mqw-preview-swatches");
    if (name) name.textContent = outfit.name;
    if (note) note.textContent = outfit.note;
    if (swatches) swatches.innerHTML = outfit.colors.map(c => `<i style="background:${c}"></i>`).join("");
    root.querySelector(".mqw-preview")?.setAttribute("data-outfit", outfit.id);
    if (previewImg && sourceImg.complete && sourceImg.naturalWidth) {
      const cached = previewCache.get(outfit.id);
      if (cached) previewImg.src = cached;
      else {
        const url = makePreviewDataUrl(sourceImg, outfit.color);
        previewCache.set(outfit.id, url);
        previewImg.src = url;
      }
    }
  };

  sourceImg.onload = updatePreview;
  updatePreview();

  root.querySelectorAll("[data-outfit]").forEach((card) => {
    card.addEventListener("click", () => {
      choice = card.getAttribute("data-outfit") || "classic";
      root.querySelectorAll(".mqw-card[data-outfit]").forEach((c) => {
        const active = c.getAttribute("data-outfit") === choice;
        c.classList.toggle("is-selected", active);
        c.setAttribute("aria-pressed", active ? "true" : "false");
      });
      updatePreview();
    });
  });
  root.querySelector(".mqw-back")?.addEventListener("click", () => root.remove());
  root.querySelector(".mqw-begin")?.addEventListener("click", () => {
    try { window.localStorage.setItem(STORAGE_KEY, choice); } catch { /* storage optional */ }
    root.remove();
    onBegin();
  });
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
  recolorImageData(image.data, hex);
  ctx.putImageData(image, 0, 0);
  tex.refresh();
}

function installOutfitFrames(scene: any, outfit: any) {
  if (!outfit?.color) return false;
  const dirs = ["down", "side", "up"];
  for (const dir of dirs) {
    for (let frame = 0; frame < 3; frame++) {
      recolorDressFrame(scene, `maria-${dir}-${frame}`, outfitTextureKey(outfit.id, dir, frame), outfit.color);
    }
  }
  for (const dir of dirs) {
    scene.anims.remove(`maria-walk-${dir}`);
    scene.anims.remove(`maria-idle-${dir}`);
    scene.anims.create({ key: `maria-walk-${dir}`, frames: [0, 1, 0, 2].map((frame) => ({ key: outfitTextureKey(outfit.id, dir, frame) })), frameRate: 9, repeat: -1 });
    scene.anims.create({ key: `maria-idle-${dir}`, frames: [{ key: outfitTextureKey(outfit.id, dir, 0) }], frameRate: 1, repeat: -1 });
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
