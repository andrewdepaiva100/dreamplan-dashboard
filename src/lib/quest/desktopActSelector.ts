// @ts-nocheck -- Developer-only desktop helper intentionally patches the runtime scene.
import type { ZoneId } from "./content";

const DEV_ACT_KEY = "marias-quest-dev-act-once";
const ROOT_ID = "marias-quest-desktop-act-selector";
const MODAL_ID = "marias-quest-desktop-act-selector-modal";

const ACTS: { label: string; subtitle: string; zone: ZoneId }[] = [
  { label: "Act I", subtitle: "Sunlit Shores", zone: "sunlit_shores" },
  { label: "Act II", subtitle: "Wedding Garden", zone: "wedding_garden" },
  { label: "Act III", subtitle: "The Haven", zone: "the_haven" },
  { label: "Act IV", subtitle: "Starry Ascent", zone: "starry_ascent" },
  { label: "Act V", subtitle: "Grand Cathedral", zone: "cathedral" },
];

function isMacBookLikeDesktop() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const platform = `${navigator.platform ?? ""} ${navigator.userAgent ?? ""}`;
  return (
    /Mac/i.test(platform) &&
    (navigator.maxTouchPoints ?? 0) === 0 &&
    window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)").matches
  );
}

function titleIsVisible() {
  return Boolean(document.querySelector('img[alt^="Pixel-art Andrew and Maria"]'));
}

function findLaunchButton() {
  const buttons = Array.from(document.querySelectorAll("button"));
  const continuing = buttons.find(
    (button) => button.textContent?.includes("Continue Your Journey") && !button.disabled,
  );
  if (continuing) return continuing;
  return buttons.find((button) => button.textContent?.trim() === "New Game" && !button.disabled) ?? null;
}

function closeModal() {
  document.getElementById(MODAL_ID)?.remove();
}

function launchAct(zone: ZoneId) {
  try {
    window.sessionStorage.setItem(DEV_ACT_KEY, zone);
  } catch {
    return;
  }

  closeModal();
  const launch = findLaunchButton();
  if (launch) {
    launch.click();
    return;
  }

  // Save loading can take a moment. Keep the override one-shot and wait briefly
  // for the normal title buttons rather than introducing a second game boot path.
  let attempts = 0;
  const timer = window.setInterval(() => {
    attempts += 1;
    const button = findLaunchButton();
    if (button) {
      window.clearInterval(timer);
      button.click();
    } else if (attempts > 40) {
      window.clearInterval(timer);
      window.sessionStorage.removeItem(DEV_ACT_KEY);
    }
  }, 100);
}

function openModal() {
  if (document.getElementById(MODAL_ID)) return;

  const backdrop = document.createElement("div");
  backdrop.id = MODAL_ID;
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  backdrop.setAttribute("aria-label", "Developer act selector");
  Object.assign(backdrop.style, {
    position: "fixed",
    inset: "0",
    zIndex: "100000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background: "rgba(3, 8, 19, 0.78)",
    backdropFilter: "blur(10px)",
  });

  const card = document.createElement("div");
  Object.assign(card.style, {
    width: "min(92vw, 520px)",
    padding: "24px",
    border: "1px solid rgba(231, 193, 105, 0.7)",
    borderRadius: "22px",
    background: "linear-gradient(180deg, rgba(26, 40, 70, .98), rgba(8, 18, 38, .99))",
    boxShadow: "0 30px 90px rgba(0,0,0,.55), 0 0 45px rgba(220,174,82,.14)",
    color: "#f8edd7",
    fontFamily: "Georgia, 'Times New Roman', serif",
  });

  const eyebrow = document.createElement("div");
  eyebrow.textContent = "MACBOOK TEST MENU";
  Object.assign(eyebrow.style, {
    marginBottom: "6px",
    color: "#ddb45d",
    fontFamily: "system-ui, sans-serif",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: ".25em",
  });

  const title = document.createElement("div");
  title.textContent = "Jump to an Act";
  Object.assign(title.style, {
    marginBottom: "18px",
    color: "#f3d78b",
    fontSize: "30px",
    fontWeight: "700",
  });

  const grid = document.createElement("div");
  Object.assign(grid.style, { display: "grid", gap: "9px" });

  for (const act of ACTS) {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span style="font-weight:800;color:#f1cb70">${act.label}</span><span style="opacity:.78;margin-left:10px">${act.subtitle}</span>`;
    Object.assign(button.style, {
      width: "100%",
      minHeight: "50px",
      padding: "12px 16px",
      border: "1px solid rgba(222,184,103,.42)",
      borderRadius: "12px",
      background: "rgba(255,255,255,.055)",
      color: "#f8edd7",
      textAlign: "left",
      cursor: "pointer",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: "14px",
    });
    button.addEventListener("mouseenter", () => {
      button.style.background = "rgba(221,180,93,.14)";
      button.style.borderColor = "rgba(241,203,112,.82)";
    });
    button.addEventListener("mouseleave", () => {
      button.style.background = "rgba(255,255,255,.055)";
      button.style.borderColor = "rgba(222,184,103,.42)";
    });
    button.addEventListener("click", () => launchAct(act.zone));
    grid.appendChild(button);
  }

  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.textContent = "Cancel";
  Object.assign(cancel.style, {
    width: "100%",
    marginTop: "12px",
    padding: "10px",
    border: "0",
    background: "transparent",
    color: "rgba(240,230,210,.65)",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "12px",
  });
  cancel.addEventListener("click", closeModal);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeModal();
  });

  card.append(eyebrow, title, grid, cancel);
  backdrop.appendChild(card);
  document.body.appendChild(backdrop);
}

function syncButton() {
  const existing = document.getElementById(ROOT_ID);
  if (!isMacBookLikeDesktop() || !titleIsVisible()) {
    existing?.remove();
    closeModal();
    return;
  }
  if (existing) return;

  const button = document.createElement("button");
  button.id = ROOT_ID;
  button.type = "button";
  button.textContent = "DEV · ACT SELECT";
  button.title = "Jump directly to any act for testing";
  Object.assign(button.style, {
    position: "fixed",
    right: "20px",
    bottom: "20px",
    zIndex: "99999",
    padding: "10px 14px",
    border: "1px solid rgba(242, 202, 108, .72)",
    borderRadius: "999px",
    background: "rgba(8, 18, 38, .92)",
    boxShadow: "0 8px 26px rgba(0,0,0,.35)",
    color: "#f2ca6c",
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: ".14em",
    backdropFilter: "blur(8px)",
  });
  button.addEventListener("click", openModal);
  document.body.appendChild(button);
}

function installTitleButton() {
  syncButton();
  const observer = new MutationObserver(syncButton);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", syncButton, { passive: true });
}

export function installDesktopActSelector(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__desktopActSelectorInstalled) return;
  proto.__desktopActSelectorInstalled = true;

  const originalInit = proto.init;
  proto.init = function devActSelectorInit(data: any) {
    let requested: ZoneId | null = null;
    try {
      const raw = window.sessionStorage.getItem(DEV_ACT_KEY);
      if (ACTS.some((act) => act.zone === raw)) requested = raw as ZoneId;
      window.sessionStorage.removeItem(DEV_ACT_KEY);
    } catch {
      requested = null;
    }

    if (requested) {
      const nextData = {
        ...(data ?? {}),
        save: {
          ...(data?.save ?? {}),
          current_zone: requested,
        },
      };
      return originalInit.call(this, nextData);
    }
    return originalInit.call(this, data);
  };

  installTitleButton();
}
