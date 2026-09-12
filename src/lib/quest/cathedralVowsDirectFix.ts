// Direct DOM hardening for the Cathedral ceremony popup.
// Presentation only: no quest, save, progression, or ceremony state changes.

const OVERLAY_SELECTOR = "div.absolute.inset-0.z-50.flex.items-center.justify-center";
const MARK = "data-cathedral-vows-direct";

function setImportant(el: HTMLElement, prop: string, value: string) {
  el.style.setProperty(prop, value, "important");
}

function applyCeremonyPresentation() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR));
  const overlay = overlays.find((el) => {
    const text = el.textContent ?? "";
    return (
      text.includes("Pastor Alcir") ||
      text.includes("Yes — forever") ||
      text.includes("Realm of the Golden Ring") ||
      (text.includes("Andrew") && text.includes("Continue")) ||
      (text.includes("Maria") && text.includes("Continue"))
    );
  });
  if (!overlay) return;

  overlay.setAttribute(MARK, "1");
  setImportant(overlay, "background", "radial-gradient(circle at 50% 28%, rgba(255,226,157,.22), transparent 31%), radial-gradient(circle at 18% 78%, rgba(229,153,181,.12), transparent 36%), rgba(3,7,18,.93)");
  setImportant(overlay, "backdrop-filter", "blur(10px) saturate(.86)");
  setImportant(overlay, "overflow", "hidden");

  const card = overlay.firstElementChild as HTMLElement | null;
  if (!card) return;
  setImportant(card, "position", "relative");
  setImportant(card, "overflow", "hidden");
  setImportant(card, "border", "1px solid rgba(246,216,143,.88)");
  setImportant(card, "border-radius", "30px");
  setImportant(card, "background", "radial-gradient(circle at 50% -15%, rgba(255,225,153,.24), transparent 46%), radial-gradient(circle at 12% 108%, rgba(218,127,161,.12), transparent 40%), linear-gradient(155deg, rgba(15,21,40,.985), rgba(7,11,25,.99) 57%, rgba(29,16,31,.985))");
  setImportant(card, "color", "#fff8e9");
  setImportant(card, "box-shadow", "0 0 0 1px rgba(255,248,219,.08), 0 0 88px rgba(222,177,78,.28), 0 36px 120px rgba(0,0,0,.72), inset 0 1px rgba(255,255,255,.10)");
  setImportant(card, "padding", "clamp(22px,4vw,34px)");

  if (!card.querySelector("[data-vow-monogram]")) {
    const badge = document.createElement("div");
    badge.setAttribute("data-vow-monogram", "1");
    badge.textContent = "A  ·  M";
    badge.style.cssText = "margin:0 auto 18px;width:max-content;padding:6px 15px;border:1px solid rgba(238,203,119,.48);border-radius:999px;color:#f8dea0;background:rgba(255,240,194,.055);font-family:Georgia,serif;font-size:10px;letter-spacing:.42em;text-indent:.42em;box-shadow:0 0 26px rgba(231,187,86,.14);";
    card.prepend(badge);
  }

  const heading = card.querySelector<HTMLElement>("h3");
  if (heading) {
    const speaker = heading.textContent?.trim() ?? "";
    const color = speaker === "Maria" ? "#f3c5d2" : speaker === "Pastor Alcir" ? "#ead9b0" : "#f5d98e";
    setImportant(heading, "color", color);
    setImportant(heading, "font-family", "Georgia, serif");
    setImportant(heading, "font-size", "clamp(1.55rem,4.2vw,2.15rem)");
    setImportant(heading, "letter-spacing", ".025em");
    setImportant(heading, "text-shadow", "0 0 24px rgba(235,190,88,.28)");
  }

  for (const p of Array.from(card.querySelectorAll<HTMLElement>("p"))) {
    setImportant(p, "color", "rgba(255,248,232,.92)");
    if (p.classList.contains("mt-3") || (p.classList.contains("mt-4") && !p.className.includes("uppercase"))) {
      setImportant(p, "font-family", "Georgia, serif");
      setImportant(p, "font-style", "italic");
      setImportant(p, "font-size", "clamp(.98rem,2.5vw,1.08rem)");
      setImportant(p, "line-height", "1.9");
    }
  }

  for (const button of Array.from(card.querySelectorAll<HTMLButtonElement>("button"))) {
    setImportant(button, "border", "1px solid rgba(239,204,119,.62)");
    setImportant(button, "border-radius", "15px");
    setImportant(button, "color", "#fffaf0");
    setImportant(button, "box-shadow", "0 8px 28px rgba(121,82,25,.30), inset 0 1px rgba(255,255,255,.23)");
    const isChoice = Boolean(button.closest(".space-y-2"));
    setImportant(button, "background", isChoice ? "linear-gradient(135deg, rgba(255,249,233,.10), rgba(238,195,214,.08))" : "linear-gradient(180deg, rgba(211,171,78,.97), rgba(145,104,34,.98))");
    if (isChoice) {
      setImportant(button, "font-family", "Georgia, serif");
      setImportant(button, "font-style", "italic");
      setImportant(button, "line-height", "1.6");
    }
  }

  for (const img of Array.from(card.querySelectorAll<HTMLImageElement>("img"))) {
    setImportant(img, "border", "1px solid rgba(244,214,143,.65)");
    setImportant(img, "box-shadow", "0 18px 52px rgba(0,0,0,.42), 0 0 34px rgba(225,180,84,.15)");
  }
}

if (typeof window !== "undefined") {
  const boot = () => {
    applyCeremonyPresentation();
    const observer = new MutationObserver(applyCeremonyPresentation);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("pagehide", () => observer.disconnect(), { once: true });
  };
  if (document.body) boot();
  else window.addEventListener("DOMContentLoaded", boot, { once: true });
}
