// @ts-nocheck -- isolated presentation gate + Maria palette selection.
import "./mariaWardrobe.css";

const STORAGE_KEY = "marias-quest-outfit-v1";

const OUTFITS = [
  { id: "classic", name: "Classic Maria", note: "Brave. Kind. You.", tint: null, colors: ["#f4ead8", "#7b4b2f", "#173f69"] },
  { id: "rose", name: "Rose Dress", note: "Romantic and radiant.", tint: 0xf08aa2, colors: ["#f08aa2", "#f7b6c7", "#b92e50"] },
  { id: "golden", name: "Golden Traveler", note: "For the road ahead.", tint: 0xe3b34c, colors: ["#f4ead8", "#e3b34c", "#476b3b"] },
  { id: "garden", name: "Garden Dress", note: "Soft as the season.", tint: 0x91c69b, colors: ["#91c69b", "#f0a6bb", "#f5e8d5"] },
  { id: "evening", name: "Evening Look", note: "Grace in the quiet.", tint: 0x35569a, colors: ["#183d7a", "#70409c", "#d5aa52"] },
  { id: "winter", name: "Winter Wrap", note: "Warm through anything.", tint: 0xb8d9ea, colors: ["#e8f4f8", "#8ec7e8", "#6f657d"] },
  { id: "sunlit", name: "Sunlit Dress", note: "Light finds you.", tint: 0xf0c45b, colors: ["#f4d263", "#fff3d8", "#e99a42"] },
  { id: "midnight", name: "Midnight Wanderer", note: "Bold and free.", tint: 0x57418d, colors: ["#171a28", "#57418d", "#315a9d"] },
  { id: "haven", name: "Heart of Haven", note: "Home, always.", tint: 0x5aaed0, colors: ["#4aa9d0", "#f4ead8", "#89b89a"] },
  { id: "crimson", name: "Crimson Trail", note: "Fierce and fearless.", tint: 0xb93646, colors: ["#c93b4d", "#7d2933", "#d4a74e"] },
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
    if (player) {
      if (outfit.tint == null) player.clearTint?.();
      else player.setTint?.(outfit.tint);
      player.setData?.("maria-outfit", outfit.id);
    }
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
