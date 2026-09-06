import { CONTROLS_HELP, HOW_TO_PLAY } from "./content";

type HelpEntry = { title: string; body: string };

const KEYBOARD_HELP: HelpEntry = {
  title: "Mac / desktop controls",
  body: "Move: WASD or Arrow Keys · Talk / Interact: E or Enter · Attack: Space or J · Dash: Shift or K. Touch buttons are hidden on desktop so the game stays clear and keyboard-first.",
};

function upsertHelp(list: HelpEntry[]) {
  const existing = list.find((entry) => entry.title === KEYBOARD_HELP.title);
  if (existing) existing.body = KEYBOARD_HELP.body;
  else list.push({ ...KEYBOARD_HELP });
}

function isDesktopPointer() {
  return window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? false;
}

function polishTouchButtons() {
  const desktop = isDesktopPointer();
  for (const button of Array.from(document.querySelectorAll("button"))) {
    const text = (button.textContent ?? "").trim().toUpperCase();
    if (!["TALK", "DASH", "ATTACK"].includes(text)) continue;
    const el = button as HTMLButtonElement;
    if (desktop) {
      if (!el.dataset.questDesktopHidden) el.dataset.questDesktopHidden = el.style.display || "__empty__";
      el.style.setProperty("display", "none", "important");
    } else if (el.dataset.questDesktopHidden !== undefined) {
      const previous = el.dataset.questDesktopHidden;
      if (previous === "__empty__") el.style.removeProperty("display");
      else el.style.display = previous;
      delete el.dataset.questDesktopHidden;
    }
  }
}

function polishRightToolbar() {
  const help = document.querySelector('button[aria-label="Controls"]') as HTMLButtonElement | null;
  const stack = help?.parentElement;
  if (!stack) return;
  stack.style.gap = "10px";
  for (const child of Array.from(stack.children)) {
    if (!(child instanceof HTMLButtonElement)) continue;
    child.style.width = "52px";
    child.style.height = "52px";
    child.style.minWidth = "52px";
    child.style.minHeight = "52px";
    child.style.fontSize = "10px";
    const icon = child.querySelector("span:first-child") as HTMLElement | null;
    if (icon) icon.style.fontSize = "20px";
  }
}

function scan() {
  if (typeof document === "undefined") return;
  polishTouchButtons();
  polishRightToolbar();
}

export function installDesktopControlsPolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const globalWindow = window as Window & { __questDesktopControlsPolish?: boolean };
  if (globalWindow.__questDesktopControlsPolish) return;
  globalWindow.__questDesktopControlsPolish = true;

  upsertHelp(HOW_TO_PLAY as HelpEntry[]);
  upsertHelp(CONTROLS_HELP as HelpEntry[]);

  scan();
  const observer = new MutationObserver(() => scan());
  observer.observe(document.body, { childList: true, subtree: true });
  window.matchMedia?.("(hover: hover) and (pointer: fine)").addEventListener?.("change", scan);
}
