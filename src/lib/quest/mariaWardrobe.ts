// @ts-nocheck -- isolated presentation gate + Maria outfit selection.
import "./mariaWardrobe.css";
import imgMariaDown from "@/assets/quest/maria-down.png";

const STORAGE_KEY = "marias-quest-outfit-v1";

const OUTFITS = [
  { id: "rose", name: "Rose Dress", note: "Romantic and radiant.", color: "#f01861", colors: ["#ff6f9d", "#f01861", "#8f173e"] },
  { id: "golden", name: "Golden Traveler", note: "For the road ahead.", color: "#e69a00", colors: ["#ffd34f", "#e69a00", "#54742b"] },
  { id: "garden", name: "Garden Dress", note: "Soft as the season.", color: "#24b85f", colors: ["#63e58d", "#24b85f", "#ef4f8a"] },
  { id: "evening", name: "Evening Look", note: "Grace in the quiet.", color: "#174fb8", colors: ["#174fb8", "#5f2bb0", "#e5b63c"] },
  { id: "winter", name: "Winter Wrap", note: "Warm through anything.", color: "#45bfe9", colors: ["#bcefff", "#45bfe9", "#62558f"] },
  { id: "sunlit", name: "Sunlit Dress", note: "Light finds you.", color: "#f29b00", colors: ["#ffe45d", "#f29b00", "#f06324"] },
  { id: "midnight", name: "Midnight Wanderer", note: "Bold and free.", color: "#49208f", colors: ["#171326", "#6b2fc2", "#1d58bd"] },
  { id: "haven", name: "Heart of Haven", note: "Home, always.", color: "#0099c8", colors: ["#24c5ee", "#0099c8", "#4eaa68"] },
  { id: "crimson", name: "Crimson Trail", note: "Fierce and fearless.", color: "#b50d32", colors: ["#ef284b", "#b50d32", "#e7a72e"] },
  { id: "lavender", name: "Lavender Dream", note: "Soft, bright, and a little enchanted.", color: "#9455d6", colors: ["#c99aef", "#9455d6", "#e36aa7"] },
  { id: "ocean", name: "Ocean Breeze", note: "Cool as the open water.", color: "#00a9c9", colors: ["#58d8e9", "#00a9c9", "#1f78b8"] },
  { id: "classic", name: "Original Dress", note: "Maria exactly as her journey began.", color: null, colors: ["#fff1d6", "#8a4f2b", "#123f73"] },
];

function selectedId() {
  try { return window.localStorage.getItem(STORAGE_KEY) || "classic"; } catch { return "classic"; }
}

function hexToRgb(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

function isSkinLike(r: number, g: number, b: number) {
  return r > 135 && g > 75 && b > 45 && r > g + 12 && g >= b && r - b > 35;
}

function isDressPixel(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const light = (r + g + b) / 3;
  if (light < 92 || chroma > 72) return false;
  if (isSkinLike(r, g, b)) return false;
  return true;
}

function recolorDressPixels(data: Uint8ClampedArray, width: number, height: number, hex: string) {
  const target = hexToRgb(hex);
  const top = Math.floor(height * 0.355);
  const bottom = Math.floor(height * 0.885);
  const center = width / 2;
  const chinProtectBottom = Math.floor(height * 0.445);
  const chinProtectHalfWidth = width * 0.16;

  for (let y = top; y <= bottom; y++) {
    const t = (y - top) / Math.max(1, bottom - top);
    const halfWidth = width * (0.20 + 0.27 * Math.pow(t, 0.8));
    const left = Math.max(0, Math.floor(center - halfWidth));
    const right = Math.min(width - 1, Math.ceil(center + halfWidth));

    for (let x = left; x <= right; x++) {
      // The pale anti-aliased pixels under Maria's face can resemble the white
      // dress closely enough to pass the colour test. Keep a small upper-centre
      // no-paint zone over her chin/neck; the dress begins outside/below it.
      if (y <= chinProtectBottom && Math.abs(x - center) <= chinProtectHalfWidth) continue;

      const i = (y * width + x) * 4;
      if (data[i + 3] < 20) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (!isDressPixel(r, g, b)) continue;

      const light = (r + g + b) / 3;
      const shade = Math.max(0.34, Math.min(1.12, light / 205));
      const highlight = Math.max(0, (light - 205) / 65);
      data[i] = Math.min(255, target.r * shade + 34 * highlight);
      data[i + 1] = Math.min(255, target.g * shade + 34 * highlight);
      data[i + 2] = Math.min(255, target.b * shade + 34 * highlight);
    }
  }
}

function recoloredCanvas(source: CanvasImageSource, width: number, height: number, color: string | null) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(source, 0, 0, width, height);
  if (color) {
    const image = ctx.getImageData(0, 0, width, height);
    recolorDressPixels(image.data, width, height, color);
    ctx.putImageData(image, 0, 0);
  }
  return canvas;
}

function makePreviewDataUrl(image: HTMLImageElement, color: string | null) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  return recoloredCanvas(image, width, height, color).toDataURL("image/png");
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
    const outfit = OUTFITS.find((o) => o.id === choice) ?? OUTFITS[OUTFITS.length - 1];
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

  root.querySelectorAll(".mqw-card[data-outfit]").forEach((card) => {
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

function bakedTextureKey(outfitId: string, dir: string) {
  return `maria-outfit-source-${outfitId}-${dir}`;
}

function outfitTextureKey(outfitId: string, dir: string, frame: number) {
  return `maria-outfit-${outfitId}-${dir}-${frame}`;
}

function bakeOutfitSource(scene: any, outfit: any, dir: string) {
  const key = bakedTextureKey(outfit.id, dir);
  if (scene.textures.exists(key)) return key;
  const artKey = `art-maria-${dir}`;
  if (!scene.textures.exists(artKey)) return null;

  const source = scene.textures.get(artKey).getSourceImage();
  const width = source.naturalWidth || source.width;
  const height = source.naturalHeight || source.height;
  const tex = scene.textures.createCanvas(key, width, height);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  const image = ctx.getImageData(0, 0, width, height);
  recolorDressPixels(image.data, width, height, outfit.color);
  ctx.putImageData(image, 0, 0);
  tex.refresh();
  return key;
}

function buildOutfitFrame(scene: any, bakedKey: string, targetKey: string, step: number) {
  if (scene.textures.exists(targetKey)) return;
  const source = scene.textures.get(bakedKey).getSourceImage();
  const tex = scene.textures.createCanvas(targetKey, 24, 34);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = true;
  const bob = step === 0 ? 0 : 1;
  const squash = step === 0 ? 0 : 2;
  const lean = step === 1 ? -1 : step === 2 ? 1 : 0;
  ctx.clearRect(0, 0, 24, 34);
  ctx.drawImage(source, squash / 2 + lean, bob, 24 - squash, 34 - bob);
  tex.refresh();
}

function installOutfitFrames(scene: any, outfit: any) {
  if (!outfit?.color) return false;
  const dirs = ["down", "side", "up"];

  for (const dir of dirs) {
    const baked = bakeOutfitSource(scene, outfit, dir);
    if (!baked) return false;
    for (let frame = 0; frame < 3; frame++) {
      buildOutfitFrame(scene, baked, outfitTextureKey(outfit.id, dir, frame), frame);
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
    const outfit = OUTFITS.find((o) => o.id === id) ?? OUTFITS[OUTFITS.length - 1];
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
