// @ts-nocheck -- Presentation-only styling for the second-boss warning.

const WARNING_TITLE = "Something has followed you from the dark";

function installOminousWarningPresentation() {
  if (typeof document === "undefined" || typeof MutationObserver === "undefined") return;
  if ((window as any).__questOminousWarningInstalled) return;
  (window as any).__questOminousWarningInstalled = true;

  const apply = () => {
    const headings = Array.from(document.querySelectorAll("h3"));
    const heading = headings.find((node) => node.textContent?.trim() === WARNING_TITLE) as HTMLElement | undefined;
    if (!heading) return;

    const panel = heading.closest(".rounded-2xl") as HTMLElement | null;
    const overlay = panel?.parentElement;
    if (!panel || !overlay || panel.dataset["ominousWarning"] === "1") return;
    panel.dataset["ominousWarning"] = "1";
    panel.classList.add("quest-ominous-warning");
    overlay.classList.add("quest-ominous-warning-overlay");

    const continueButton = Array.from(panel.querySelectorAll("button")).find(
      (button) => button.textContent?.trim() === "Continue",
    );
    continueButton?.classList.add("quest-ominous-warning-continue");
  };

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
}

installOminousWarningPresentation();
