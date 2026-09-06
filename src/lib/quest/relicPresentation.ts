// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
const RELIC_BY_NAME: Record<string, string> = {
  "The Lantern of Quiet Care": "lantern",
  "The Anchor of Comfort": "anchor",
  "The Bloom of Reflection": "bloom",
  "The Shield of Unshakable Faith": "shield",
  "The Seal of Perfect Peace": "seal",
};

function enhanceRelicModal(root: ParentNode = document) {
  const overlays = root.querySelectorAll<HTMLElement>('div.fixed.inset-0.z-\\[60\\]');
  for (const overlay of overlays) {
    if (overlay.dataset.questRelicEnhanced === "1") continue;
    const title = Array.from(overlay.querySelectorAll("p")).find((p) => RELIC_BY_NAME[p.textContent?.trim() ?? ""]);
    if (!title) continue;
    const id = RELIC_BY_NAME[title.textContent!.trim()]!;
    const border = overlay.firstElementChild as HTMLElement | null;
    const card = border?.firstElementChild as HTMLElement | null;
    if (!border || !card) continue;

    overlay.dataset.questRelicEnhanced = "1";
    overlay.dataset.questRelic = id;
    border.dataset.questRelicFrame = id;
    card.dataset.questRelicCard = id;

    const ornament = document.createElement("div");
    ornament.className = "quest-relic-ornament";
    ornament.setAttribute("aria-hidden", "true");
    ornament.innerHTML = '<span class="quest-relic-wing quest-relic-wing-left">✦</span><span class="quest-relic-glyph"></span><span class="quest-relic-wing quest-relic-wing-right">✦</span>';
    card.prepend(ornament);

    const corners = document.createElement("div");
    corners.className = "quest-relic-corners";
    corners.setAttribute("aria-hidden", "true");
    corners.innerHTML = "<i></i><i></i><i></i><i></i>";
    card.prepend(corners);

    const shimmer = document.createElement("div");
    shimmer.className = "quest-relic-shimmer";
    shimmer.setAttribute("aria-hidden", "true");
    card.prepend(shimmer);

    const motes = document.createElement("div");
    motes.className = "quest-relic-motes";
    motes.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 12; i++) {
      const mote = document.createElement("span");
      mote.style.setProperty("--i", String(i));
      motes.append(mote);
    }
    overlay.append(motes);
  }
}

export function installRelicPresentation() {
  if (typeof document === "undefined") return;
  const key = "__questRelicPresentationInstalled";
  const w = window as unknown as Record<string, unknown>;
  if (w[key]) return;
  w[key] = true;

  enhanceRelicModal();
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of Array.from(record.addedNodes)) {
        if (node instanceof HTMLElement) enhanceRelicModal(node.parentNode ?? document);
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
