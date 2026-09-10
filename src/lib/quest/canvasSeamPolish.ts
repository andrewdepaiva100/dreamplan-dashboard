// Presentation-only DOM polish for the Phaser quest canvas.
// Keeps the RESIZE canvas flush with its already-fullscreen React host so
// browser/Phaser centering styles cannot expose a vertical seam during mount.

function isQuestCanvas(canvas: HTMLCanvasElement) {
  const parent = canvas.parentElement;
  if (!parent) return false;
  return parent.classList.contains("absolute") && parent.classList.contains("inset-0");
}

function flushCanvas(canvas: HTMLCanvasElement) {
  if (!isQuestCanvas(canvas)) return;

  canvas.style.setProperty("display", "block", "important");
  canvas.style.setProperty("position", "absolute", "important");
  canvas.style.setProperty("left", "0", "important");
  canvas.style.setProperty("top", "0", "important");
  canvas.style.setProperty("margin", "0", "important");
  canvas.style.setProperty("padding", "0", "important");
  canvas.style.setProperty("border", "0", "important");
  canvas.style.setProperty("transform", "none", "important");
  canvas.style.setProperty("max-width", "none", "important");
  canvas.style.setProperty("max-height", "none", "important");
}

function scan() {
  for (const canvas of Array.from(document.querySelectorAll("canvas"))) {
    flushCanvas(canvas as HTMLCanvasElement);
  }
}

export function installCanvasSeamPolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const globalWindow = window as Window & { __questCanvasSeamPolish?: boolean };
  if (globalWindow.__questCanvasSeamPolish) return;
  globalWindow.__questCanvasSeamPolish = true;

  scan();
  requestAnimationFrame(scan);
  requestAnimationFrame(() => requestAnimationFrame(scan));

  const observer = new MutationObserver(scan);
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", scan, { passive: true });
}
