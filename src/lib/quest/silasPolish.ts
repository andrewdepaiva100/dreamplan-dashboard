import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const SILAS_STORAGE_KEY = "marias-quest-silas-v1";
const CROSSING_STORAGE_KEY = "marias-quest-last-crossing-v1";

function readCrossingState() {
  if (typeof window === "undefined") return { talked: [] as string[], forged: false, wardenDefeated: false };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CROSSING_STORAGE_KEY) ?? "{}") as {
      talked?: string[];
      forged?: boolean;
      wardenDefeated?: boolean;
    };
    return {
      talked: Array.isArray(parsed.talked) ? parsed.talked : [],
      forged: Boolean(parsed.forged),
      wardenDefeated: Boolean(parsed.wardenDefeated),
    };
  } catch {
    return { talked: [] as string[], forged: false, wardenDefeated: false };
  }
}

function hasMetSilas() {
  try {
    return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function markSilasMet() {
  try {
    window.localStorage.setItem(SILAS_STORAGE_KEY, "1");
  } catch {
    // Optional persistence only.
  }
}

function portraitDataUrl() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 448">
    <defs>
      <radialGradient id="bg" cx="35%" cy="25%"><stop offset="0" stop-color="#ead8b8"/><stop offset="1" stop-color="#43556b"/></radialGradient>
      <linearGradient id="coat" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#355d82"/><stop offset="1" stop-color="#1b314d"/></linearGradient>
    </defs>
    <rect width="448" height="448" fill="url(#bg)"/>
    <circle cx="224" cy="190" r="115" fill="#d9a77e"/>
    <path d="M108 188c6-99 62-145 122-145 72 0 125 50 127 140-35-22-61-64-79-97-35 42-91 73-170 102Z" fill="#5b402d"/>
    <path d="M126 170c12-58 46-93 82-108-47 11-84 50-93 110Z" fill="#7b5638" opacity=".85"/>
    <ellipse cx="181" cy="201" rx="13" ry="9" fill="#29231f"/><ellipse cx="268" cy="201" rx="13" ry="9" fill="#29231f"/>
    <path d="M170 171q28-15 57 0M239 171q28-14 54 2" stroke="#5b402d" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M202 250q24 17 48 0" stroke="#925d4c" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M104 448c8-112 50-167 120-167 76 0 120 55 126 167Z" fill="url(#coat)"/>
    <path d="M132 306c27 15 58 23 92 23 36 0 67-8 92-24l-21 43c-26 12-48 17-72 17-26 0-50-6-74-18Z" fill="#ad533b"/>
    <path d="M318 301l70 14-16 92-70-14Z" fill="#b68d58"/>
    <path d="M330 325h39M327 346h38M324 367h33" stroke="#5f4c35" stroke-width="5"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function closeDialogue(scene: SceneLike, overlay: HTMLElement) {
  overlay.remove();
  scene.__silasLorenaDialogueOpen = false;
  scene.frozen = false;
  scene.physics.resume();
  markSilasMet();
}

function showSilasLorenaDialogue(scene: SceneLike) {
  if (scene.__silasLorenaDialogueOpen) return;
  const parent = scene.game.canvas?.parentElement;
  if (!parent) return;

  scene.__silasLorenaDialogueOpen = true;
  scene.frozen = true;
  scene.physics.pause();

  const state = readCrossingState();
  const alreadyMet = hasMetSilas();
  const discovered = state.talked.length > 0 || state.forged;
  const defeated = state.wardenDefeated;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "absolute",
    inset: "0",
    zIndex: "10020",
    display: "flex",
    alignItems: window.innerWidth < 640 ? "flex-end" : "center",
    justifyContent: "center",
    padding: "12px",
    background: "rgba(6,10,24,0.60)",
    backdropFilter: "blur(3px)",
    boxSizing: "border-box",
  });

  const shell = document.createElement("div");
  Object.assign(shell.style, {
    position: "relative",
    width: "min(100%, 768px)",
  });

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  close.setAttribute("aria-label", "Skip dialogue");
  Object.assign(close.style, {
    position: "absolute",
    right: "4px",
    top: "-12px",
    zIndex: "3",
    width: "36px",
    height: "36px",
    borderRadius: "999px",
    border: "1px solid rgba(201,162,75,.65)",
    background: "rgba(10,16,34,.96)",
    color: "#d9b75e",
    fontSize: "20px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,.35)",
  });
  close.addEventListener("click", () => closeDialogue(scene, overlay));

  const row = document.createElement("div");
  Object.assign(row.style, {
    display: "flex",
    alignItems: "flex-end",
    gap: window.innerWidth < 640 ? "0" : "12px",
  });

  const portrait = document.createElement("img");
  portrait.src = portraitDataUrl();
  portrait.alt = "Silas";
  Object.assign(portrait.style, {
    width: "176px",
    height: "176px",
    flex: "0 0 176px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "2px solid rgba(201,162,75,.72)",
    boxShadow: "0 18px 40px rgba(0,0,0,.42)",
    display: window.innerWidth < 640 ? "none" : "block",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    position: "relative",
    flex: "1",
    overflow: "hidden",
    borderRadius: "16px",
    border: "2px solid rgba(201,162,75,.72)",
    background: "rgba(10,16,34,.95)",
    boxShadow: "0 18px 40px rgba(0,0,0,.42)",
    minHeight: window.innerWidth < 640 ? "210px" : "176px",
  });

  const glow = document.createElement("div");
  Object.assign(glow.style, {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    background: "linear-gradient(135deg, rgba(201,162,75,.10), transparent 45%, rgba(214,144,139,.08))",
  });

  const content = document.createElement("div");
  Object.assign(content.style, { position: "relative", padding: "16px", display: "flex", gap: "12px" });

  const mobilePortrait = portrait.cloneNode(true) as HTMLImageElement;
  mobilePortrait.alt = "";
  Object.assign(mobilePortrait.style, {
    display: window.innerWidth < 640 ? "block" : "none",
    width: "64px",
    height: "64px",
    flex: "0 0 64px",
    borderRadius: "12px",
    borderWidth: "1px",
  });

  const textCol = document.createElement("div");
  Object.assign(textCol.style, { minWidth: "0", flex: "1" });

  const heading = document.createElement("div");
  heading.innerHTML = `<span style="font-family:Georgia,serif;font-size:18px;font-weight:700;letter-spacing:.02em;color:#d9b75e">Silas</span><span style="margin-left:12px;font-size:11px;letter-spacing:.18em;color:rgba(255,255,255,.55);font-weight:700">CARTOGRAPHER</span>`;

  const line = document.createElement("p");
  Object.assign(line.style, {
    margin: "10px 0 0",
    minHeight: "54px",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
    fontSize: "15px",
    lineHeight: "1.5",
    color: "rgba(255,255,255,.95)",
  });

  const choices = document.createElement("div");
  Object.assign(choices.style, { display: "grid", gap: "7px", marginTop: "10px" });

  const footer = document.createElement("div");
  Object.assign(footer.style, {
    marginTop: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
  });
  const dots = document.createElement("div");
  dots.innerHTML = `<span style="display:inline-block;width:16px;height:6px;border-radius:999px;background:#d9b75e;margin-right:6px"></span><span style="display:inline-block;width:16px;height:6px;border-radius:999px;background:rgba(255,255,255,.20);margin-right:6px"></span><span style="display:inline-block;width:16px;height:6px;border-radius:999px;background:rgba(255,255,255,.20)"></span>`;
  const hint = document.createElement("span");
  Object.assign(hint.style, { fontSize: "11px", fontWeight: "700", letterSpacing: ".18em", color: "#d9b75e" });
  hint.textContent = "TAP TO CONTINUE";
  footer.append(dots, hint);

  textCol.append(heading, line, choices, footer);
  content.append(mobilePortrait, textCol);
  panel.append(glow, content);
  row.append(portrait, panel);
  shell.append(close, row);
  overlay.append(shell);
  parent.append(overlay);

  let timer: number | undefined;
  const typeLine = (text: string, done?: () => void) => {
    if (timer) window.clearInterval(timer);
    line.textContent = "“";
    let i = 0;
    timer = window.setInterval(() => {
      i += 1;
      line.textContent = `“${text.slice(0, i)}${i >= text.length ? "”" : ""}`;
      if (i >= text.length) {
        window.clearInterval(timer);
        timer = undefined;
        done?.();
      }
    }, 18);
  };

  const finish = () => closeDialogue(scene, overlay);

  if (defeated) {
    typeLine("You crossed the river. Then I suppose I need a new map.", () => {
      hint.textContent = "TAP TO CLOSE";
      panel.style.cursor = "pointer";
      panel.addEventListener("click", finish, { once: true });
    });
    return;
  }

  if (discovered || alreadyMet) {
    typeLine(
      state.forged
        ? "You found the three — and judging by what you're carrying, they trusted you with something they never trusted themselves to finish. Don't waste that faith."
        : "You found the settlement. Good. Listen to those three before you face the Warden; they know the crossing better than any map ever could.",
      () => {
        hint.textContent = "TAP TO CLOSE";
        panel.style.cursor = "pointer";
        panel.addEventListener("click", finish, { once: true });
      },
    );
    return;
  }

  typeLine("Going toward the river? Then don't follow the old road straight there. Everyone who does comes back wearing the same expression.", () => {
    hint.textContent = "CHOOSE MARIA'S RESPONSE";
    const options = [
      {
        maria: "I'm still crossing. Tell me what you know.",
        silas: "Good. Southeast of here is a little settlement called The Last Crossing. Three people live there. All three challenged the Warden. All three came back. Talk to them before you decide you're ready.",
      },
      {
        maria: "Are you trying to scare me away?",
        silas: "No. Fear makes terrible maps. I'm trying to keep you from walking into the same mistake three other people already survived. Follow the old stone road southeast. When the lamps start appearing, you're close.",
      },
      {
        maria: "Why should I trust three people who failed?",
        silas: "Because failure is expensive knowledge. They know where the current pulls, when the Warden closes distance, and what courage looks like after it breaks. You want the other side? Start with the people who came back alive.",
      },
    ];

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `“${option.maria}”`;
      Object.assign(button.style, {
        width: "100%",
        border: "1px solid rgba(201,162,75,.35)",
        borderRadius: "12px",
        padding: "10px 12px",
        background: "rgba(255,255,255,.05)",
        color: "rgba(255,255,255,.94)",
        textAlign: "left",
        fontSize: "13px",
        cursor: "pointer",
        transition: "background .15s ease, border-color .15s ease, transform .15s ease",
      });
      button.addEventListener("mouseenter", () => {
        button.style.background = "rgba(201,162,75,.13)";
        button.style.borderColor = "rgba(201,162,75,.78)";
        button.style.transform = "translateX(2px)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.background = "rgba(255,255,255,.05)";
        button.style.borderColor = "rgba(201,162,75,.35)";
        button.style.transform = "translateX(0)";
      });
      button.addEventListener("click", () => {
        choices.innerHTML = "";
        hint.textContent = "SILAS RESPONDS";
        const maria = document.createElement("div");
        maria.textContent = `Maria: “${option.maria}”`;
        Object.assign(maria.style, {
          marginTop: "8px",
          color: "rgba(255,255,255,.68)",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          fontSize: "13px",
        });
        choices.append(maria);
        typeLine(option.silas, () => {
          hint.textContent = "TAP TO CLOSE";
          const continueButton = document.createElement("button");
          continueButton.type = "button";
          continueButton.textContent = "Continue";
          Object.assign(continueButton.style, {
            marginTop: "9px",
            width: "100%",
            minHeight: "40px",
            borderRadius: "11px",
            border: "1px solid rgba(201,162,75,.60)",
            background: "rgba(201,162,75,.12)",
            color: "#d9b75e",
            fontWeight: "800",
            cursor: "pointer",
          });
          continueButton.addEventListener("click", finish);
          choices.append(continueButton);
        });
      });
      choices.append(button);
    });
  });
}

function repositionSilas(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores") return;
  const it = (scene.interactables ?? []).find((entry: any) => entry.kind === "last-crossing-silas");
  if (!it?.obj) return;

  // Wren is placed around design tile 50,56. Twenty-five tiles to the right
  // keeps Silas on the approach road and safely outside the Warden courtyard.
  const x = scene.wx?.(75) ?? 75 * 32;
  const y = scene.wy?.(56) ?? 56 * 32;
  it.obj.setPosition(x, y);

  // Keep his nearby sign with him if the previous implementation spawned one.
  const nearestSign = (scene.children?.list ?? [])
    .filter((child: any) => child?.texture?.key === "signpost")
    .sort((a: any, b: any) => Phaser.Math.Distance.Between(a.x, a.y, x, y) - Phaser.Math.Distance.Between(b.x, b.y, x, y))[0] as any;
  if (nearestSign && Phaser.Math.Distance.Between(nearestSign.x, nearestSign.y, it.obj.x, it.obj.y) < 900) {
    nearestSign.setPosition(x - 34, y + 8);
  }
}

export function installSilasPolish(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__silasPolishInstalled) return;
  proto.__silasPolishInstalled = true;

  const originalCreate = proto.create;
  proto.create = function silasPolishCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(0, () => repositionSilas(this));
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function silasPolishInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === "last-crossing-silas") {
      showSilasLorenaDialogue(this);
      return;
    }
    return originalInteract.apply(this, args);
  };
}
