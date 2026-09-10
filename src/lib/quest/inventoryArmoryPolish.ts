// @ts-nocheck -- Presentation-only polish for Backpack and Armory panels.
import "./inventoryArmoryPolish.css";

const PANEL_SELECTOR = ".absolute.inset-0.z-40 > div";

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

function scan(root: ParentNode = document) {
  root.querySelectorAll?.(PANEL_SELECTOR).forEach(classifyPanel);
  if (root instanceof Element && root.matches?.(PANEL_SELECTOR)) classifyPanel(root);
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
