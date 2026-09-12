// @ts-nocheck -- Presentation-only polish for the Memory Walk and second-boss warning.
import * as Phaser from "phaser";
import { MemoryWalkScene } from "./memoryWalk";

const THIRD_REMINISCENCE = "Andrew was here through all of it… somehow that made this place feel like home.";
const WARNING_TITLE = "Something has followed you from the dark";
const WARNING_BODY = "The blossoms have barely settled, but the stars are already dying. Something ancient is moving where the shadow stood. It knows you’re here.";

function installAndrewReminiscence() {
  const proto = MemoryWalkScene?.prototype as any;
  if (!proto || proto.__andrewReminiscenceInstalled) return;
  proto.__andrewReminiscenceInstalled = true;

  const original = proto.showReminiscence;
  if (typeof original !== "function") return;

  proto.showReminiscence = function andrewThirdReminiscence(index: number, ...args: any[]) {
    const result = original.call(this, index, ...args);
    if (index !== 2) return result;

    const bubble = this.reminiscenceBubble;
    const children = bubble?.list ?? [];
    const text = children.find((child: any) => child instanceof Phaser.GameObjects.Text);
    text?.setText?.(THIRD_REMINISCENCE);
    return result;
  };
}

function installOminousWarningPresentation() {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  if ((window as any).__questOminousWarningInstalled) return;
  (window as any).__questOminousWarningInstalled = true;

  const apply = () => {
    const headings = Array.from(document.querySelectorAll("h3"));
    const heading = headings.find((node) => {
      const text = node.textContent?.trim();
      return text === "The sky is not finished with you" || text === WARNING_TITLE;
    }) as HTMLElement | undefined;
    if (!heading) return;

    const panel = heading.closest(".rounded-2xl") as HTMLElement | null;
    const overlay = panel?.parentElement;
    if (!panel || !overlay || panel.dataset["ominousWarning"] === "1") return;
    panel.dataset["ominousWarning"] = "1";
    panel.classList.add("quest-ominous-warning");
    overlay.classList.add("quest-ominous-warning-overlay");

    heading.textContent = WARNING_TITLE;
    const body = panel.querySelector(".mt-3 p") as HTMLElement | null;
    if (body) body.textContent = WARNING_BODY;

    const continueButton = Array.from(panel.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Continue",
    );
    continueButton?.classList.add("quest-ominous-warning-continue");
  };

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
}

installAndrewReminiscence();
installOminousWarningPresentation();
