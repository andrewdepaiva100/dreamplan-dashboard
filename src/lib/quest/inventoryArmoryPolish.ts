// @ts-nocheck -- Presentation-only polish for Backpack and Armory panels.
import "./inventoryArmoryPolish.css";

const OVERLAY_SELECTOR = ".absolute.inset-0.z-40";

function classifyPanel(panel: Element) {
  const title = panel.querySelector("h3")?.textContent?.trim();
  if (title === "Backpack") {
    panel.setAttribute("data-quest-panel", "backpack");
    panel.parentElement?.setAttribute("data-quest-panel-overlay", "backpack");
  } else if (title === "Armory") {
    panel.setAttribute("data-quest-panel", "armory");
    panel.parentElement?.setAttribute("data-quest-panel-overlay", "armory");
  }
}

function classifyOverlay(overlay: Element) {
  const panel = overlay.firstElementChild;
  if (panel) classifyPanel(panel);
}

function scan(root: ParentNode = document) {
  // MutationObserver usually receives the overlay as the newly-added root. Since
  // querySelectorAll never includes the root itself, explicitly classify it first.
  if (root instanceof Element && root.matches?.(OVERLAY_SELECTOR)) classifyOverlay(root);
  root.querySelectorAll?.(OVERLAY_SELECTOR).forEach(classifyOverlay);
}

function installInventoryArmoryPolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if ((window as any).__inventoryArmoryPolishInstalled) return;
  (window as any).__inventoryArmoryPolishInstalled = true;

  const start = () => {
    if (!document.body) return;
    scan(document);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node instanceof Element) scan(node);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.body) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
}

installInventoryArmoryPolish();
