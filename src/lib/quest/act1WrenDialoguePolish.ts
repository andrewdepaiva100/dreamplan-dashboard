// @ts-nocheck -- Isolated presentation enhancement for Wren's existing React guide dialogue.
import wrenArt from "../../assets/quest/guide-act.png";
import mariaPortrait from "../../assets/quest/maria-portrait.png";

type ReplySet = { match: RegExp; replies: string[] };

const CONTEXTUAL_REPLIES: ReplySet[] = [
  {
    match: /Oh — you're awake|sea told me someone was coming/i,
    replies: [
      "The sea told you I was coming?",
      "Where am I exactly?",
      "You've been waiting here since sunrise?",
    ],
  },
  {
    match: /Your name is Maria|five lands laid end to end/i,
    replies: [
      "Five lands? What happened to this place?",
      "Why do you keep telling me to hold on to my name?",
      "Alright. Where am I supposed to start?",
    ],
  },
  {
    match: /Andrew is the reason all this exists|road only runs one way/i,
    replies: [
      "He built all of this?",
      "Why can't he come to me?",
      "Then tell me how to reach him.",
    ],
  },
  {
    match: /gathering five Relics|sealed Envelopes/i,
    replies: [
      "So each Relic is something he couldn't say?",
      "The letters matter as much as the road?",
      "Where should I look first?",
    ],
  },
  {
    match: /Each land is guarded|isn't evil|too much or not enough/i,
    replies: [
      "If they aren't evil, I don't want to treat them like they are.",
      "What happens if I start believing what they say?",
      "Then I'll keep moving, even when they get loud.",
    ],
  },
  {
    match: /Radiant Spark Wand|throws light, not blades/i,
    replies: [
      "Light instead of blades. I like that.",
      "So I can calm things without hurting them?",
      "Show me how to use it.",
    ],
  },
  {
    match: /Watch your hearts|Five hits|Rest stones/i,
    replies: [
      "Five hits sends me back, but I don't lose everything?",
      "Good. I want to know where I can rest.",
      "A house... here?",
    ],
  },
  {
    match: /sun here runs a real day|Animals wander the grass/i,
    replies: [
      "So this place really keeps time.",
      "I'd rather not hunt unless I have to.",
      "Alright — daylight matters. I'll pay attention.",
    ],
  },
  {
    match: /Your road today|River Gate Temple|You're expected/i,
    replies: [
      "East to the River Gate Temple. Got it.",
      "And the Warden is waiting inside?",
      "I'm ready, Wren.",
    ],
  },
];

const FALLBACK_REPLIES = [
  "Tell me more.",
  "What should I understand about that?",
  "Alright. Keep going.",
];

function repliesFor(shell: HTMLElement) {
  const text = shell.textContent ?? "";
  return CONTEXTUAL_REPLIES.find((entry) => entry.match.test(text))?.replies ?? FALLBACK_REPLIES;
}

function style(el: HTMLElement, values: Record<string, string>) {
  Object.assign(el.style, values);
}

function portrait(src: string, alt: string, side: "wren" | "maria") {
  const frame = document.createElement("div");
  frame.className = `quest-wren-portrait quest-wren-portrait-${side}`;
  style(frame, {
    position: "relative",
    width: side === "wren" ? "112px" : "72px",
    height: side === "wren" ? "112px" : "72px",
    minWidth: side === "wren" ? "112px" : "72px",
    borderRadius: side === "wren" ? "22px" : "18px",
    border: `2px solid ${side === "wren" ? "rgba(230,191,101,.95)" : "rgba(235,190,204,.88)"}`,
    overflow: "hidden",
    background: side === "wren"
      ? "radial-gradient(circle at 50% 28%,rgba(74,112,139,.45),rgba(8,18,36,.98) 72%)"
      : "linear-gradient(160deg,#f6e8e5,#d8b6bc)",
    boxShadow: side === "wren"
      ? "0 0 0 4px rgba(211,174,89,.08),0 0 34px rgba(211,174,89,.2),0 16px 34px rgba(0,0,0,.42)"
      : "0 0 0 3px rgba(231,189,195,.08),0 12px 28px rgba(0,0,0,.34)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
  });

  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  style(img, {
    width: side === "wren" ? "82px" : "100%",
    height: side === "wren" ? "118px" : "100%",
    objectFit: side === "wren" ? "contain" : "cover",
    objectPosition: "50% 12%",
    imageRendering: "pixelated",
    filter: side === "wren" ? "drop-shadow(0 5px 4px rgba(0,0,0,.35))" : "none",
  });
  frame.appendChild(img);

  const crest = document.createElement("div");
  crest.textContent = "✦";
  style(crest, {
    position: "absolute",
    right: "6px",
    top: "5px",
    color: side === "wren" ? "#e6bf65" : "#efc8d2",
    fontSize: "10px",
    textShadow: "0 0 10px currentColor",
  });
  frame.appendChild(crest);
  return frame;
}

function findWrenDialog() {
  const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-label="Continue conversation"]'));
  for (const advance of buttons) {
    const shell = advance.parentElement as HTMLElement | null;
    if (!shell) continue;
    const text = shell.textContent ?? "";
    if (!/Wren of the Shores/i.test(text)) continue;
    const overlay = shell.closest(".absolute.inset-0") as HTMLElement | null;
    const name = Array.from(shell.querySelectorAll<HTMLElement>("span")).find((el) => /Wren of the Shores/i.test(el.textContent ?? ""));
    if (overlay && name) return { overlay, shell, advance, name };
  }
  return null;
}

function decorateCard(shell: HTMLElement, name: HTMLElement) {
  const cardInner = name.closest(".relative.flex.items-start") as HTMLElement | null;
  if (!cardInner) return;

  style(cardInner, {
    padding: "20px 22px",
    gap: "18px",
    alignItems: "center",
    minHeight: "150px",
  });

  if (!cardInner.querySelector(".quest-wren-portrait-wren")) {
    cardInner.insertBefore(portrait(wrenArt, "Wren of the Shores", "wren"), cardInner.firstChild);
  }

  const copy = name.parentElement?.parentElement as HTMLElement | null;
  if (copy) {
    if (!copy.querySelector(".quest-wren-eyebrow")) {
      const eyebrow = document.createElement("div");
      eyebrow.className = "quest-wren-eyebrow";
      eyebrow.textContent = "✦  ACT I  ·  THE SUNLIT SHORES  ✦";
      style(eyebrow, {
        marginBottom: "5px",
        color: "rgba(230,191,101,.72)",
        fontSize: "9px",
        fontWeight: "800",
        letterSpacing: ".24em",
        textTransform: "uppercase",
      });
      copy.insertBefore(eyebrow, copy.firstChild);
    }
    style(name, {
      fontSize: "22px",
      letterSpacing: ".015em",
      textShadow: "0 1px 0 rgba(0,0,0,.3),0 0 18px rgba(211,174,89,.14)",
    });
  }

  const card = cardInner.parentElement as HTMLElement | null;
  if (card) style(card, {
    position: "relative",
    borderRadius: "24px",
    borderColor: "rgba(222,183,91,.9)",
    background: "radial-gradient(120% 180% at 0% 0%,rgba(31,57,82,.98),rgba(8,17,35,.99) 52%,rgba(14,17,39,.99))",
    boxShadow: "0 26px 70px rgba(0,0,0,.46),0 0 0 1px rgba(255,222,140,.05) inset,0 0 50px rgba(211,174,89,.08)",
  });

  if (!shell.querySelector(".quest-wren-ornament")) {
    const ornament = document.createElement("div");
    ornament.className = "quest-wren-ornament";
    ornament.innerHTML = "<span>◆</span><span></span><span>✦</span><span></span><span>◆</span>";
    style(ornament, {
      display: "grid",
      gridTemplateColumns: "auto 1fr auto 1fr auto",
      alignItems: "center",
      gap: "8px",
      margin: "9px 20px 0",
      color: "rgba(211,174,89,.58)",
      fontSize: "8px",
      pointerEvents: "none",
    });
    for (const child of Array.from(ornament.children)) {
      const el = child as HTMLElement;
      if (!el.textContent) style(el, { height: "1px", background: "linear-gradient(90deg,transparent,rgba(211,174,89,.5),transparent)" });
    }
    shell.insertBefore(ornament, shell.children[1] ?? null);
  }
}

function addReplyPanel(shell: HTMLElement, advance: HTMLButtonElement, status: string) {
  if (shell.querySelector(".quest-wren-replies")) return;

  const panel = document.createElement("section");
  panel.className = "quest-wren-replies";
  style(panel, {
    position: "relative",
    marginTop: "10px",
    padding: "16px",
    borderRadius: "20px",
    border: "1px solid rgba(211,174,89,.58)",
    background: "radial-gradient(120% 160% at 50% 0%,rgba(25,36,63,.99),rgba(6,13,28,.99) 68%)",
    boxShadow: "0 18px 45px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.025)",
    color: "white",
    overflow: "hidden",
  });

  const glow = document.createElement("div");
  style(glow, {
    position: "absolute", inset: "0", pointerEvents: "none",
    background: "linear-gradient(110deg,rgba(211,174,89,.05),transparent 28%,transparent 72%,rgba(231,189,195,.04))",
  });
  panel.appendChild(glow);

  const labelRow = document.createElement("div");
  style(labelRow, { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px", position: "relative" });
  const label = document.createElement("div");
  label.textContent = "How does Maria answer?";
  style(label, {
    fontSize: "10px", textTransform: "uppercase", letterSpacing: ".2em",
    color: "#e1b95b", fontWeight: "900",
  });
  const hint = document.createElement("div");
  hint.textContent = "Choose what feels most like her";
  style(hint, { color: "rgba(255,255,255,.38)", fontSize: "10px", fontStyle: "italic" });
  labelRow.append(label, hint);
  panel.appendChild(labelRow);

  const choices = document.createElement("div");
  style(choices, { position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "9px" });

  const replies = repliesFor(shell);
  replies.forEach((text, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span style="display:block;color:#d9b45d;font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-bottom:5px">${index === 0 ? "Curious" : index === 1 ? "Thoughtful" : "Ready"}</span><span>“${text}”</span>`;
    style(button, {
      minHeight: "66px",
      borderRadius: "15px",
      border: "1px solid rgba(211,174,89,.34)",
      background: "linear-gradient(150deg,rgba(255,255,255,.07),rgba(255,255,255,.025))",
      color: "rgba(255,255,255,.97)",
      padding: "12px 14px",
      textAlign: "left",
      fontSize: "13px",
      lineHeight: "1.4",
      cursor: "pointer",
      transition: "transform .16s ease,border-color .16s ease,background .16s ease,box-shadow .16s ease",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.035)",
    });
    button.onmouseenter = () => {
      button.style.transform = "translateY(-2px)";
      button.style.background = "linear-gradient(150deg,rgba(211,174,89,.17),rgba(255,255,255,.045))";
      button.style.borderColor = "rgba(230,191,101,.85)";
      button.style.boxShadow = "0 8px 22px rgba(0,0,0,.22),0 0 20px rgba(211,174,89,.06)";
    };
    button.onmouseleave = () => {
      button.style.transform = "translateY(0)";
      button.style.background = "linear-gradient(150deg,rgba(255,255,255,.07),rgba(255,255,255,.025))";
      button.style.borderColor = "rgba(211,174,89,.34)";
      button.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,.035)";
    };
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      choices.replaceChildren();
      label.textContent = "Maria";
      hint.textContent = "Her answer";

      const row = document.createElement("div");
      style(row, {
        display: "flex", alignItems: "center", gap: "14px", padding: "10px 12px",
        borderRadius: "16px", border: "1px solid rgba(231,189,195,.28)",
        background: "linear-gradient(135deg,rgba(231,189,195,.08),rgba(255,255,255,.025))",
      });
      row.appendChild(portrait(mariaPortrait, "Maria", "maria"));
      const copy = document.createElement("div");
      const who = document.createElement("div");
      who.textContent = "Maria";
      style(who, { color: "#efc4d0", fontWeight: "900", fontSize: "15px", marginBottom: "4px", letterSpacing: ".02em" });
      const quote = document.createElement("div");
      quote.textContent = `“${text}”`;
      style(quote, { color: "rgba(255,255,255,.97)", fontSize: "14px", fontStyle: "italic", lineHeight: "1.5" });
      copy.append(who, quote);
      row.appendChild(copy);
      choices.appendChild(row);

      const cont = document.createElement("button");
      cont.type = "button";
      cont.textContent = /Tap to close/i.test(status) ? "Finish conversation  ✦" : "Continue with Wren  →";
      style(cont, {
        position: "relative",
        width: "100%", marginTop: "12px", minHeight: "44px", borderRadius: "13px",
        border: "1px solid rgba(230,191,101,.82)",
        background: "linear-gradient(90deg,rgba(183,143,57,.24),rgba(230,191,101,.16),rgba(183,143,57,.24))",
        color: "#f2d78f", fontWeight: "900", cursor: "pointer", letterSpacing: ".02em",
        boxShadow: "inset 0 1px 0 rgba(255,239,190,.08),0 8px 22px rgba(0,0,0,.18)",
      });
      cont.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        advance.dataset.wrenAllowAdvance = "1";
        advance.click();
      });
      panel.appendChild(cont);
    });
    choices.appendChild(button);
  });

  panel.appendChild(choices);
  shell.appendChild(panel);
}

function enhance() {
  const found = findWrenDialog();
  if (!found) return;
  const { overlay, shell, advance, name } = found;

  overlay.dataset.wrenCinematic = "true";
  style(overlay, {
    background: "radial-gradient(circle at 50% 42%,rgba(5,15,31,.34),rgba(2,7,18,.7))",
    backdropFilter: "blur(4px) saturate(.88)",
  });
  style(shell, { maxWidth: "900px" });
  decorateCard(shell, name);

  if (advance.dataset.wrenGuard !== "1") {
    advance.dataset.wrenGuard = "1";
    advance.addEventListener("click", (event) => {
      const currentStatus = advance.textContent ?? "";
      const ready = /Tap to (continue|close)/i.test(currentStatus);
      if (!ready) return;
      if (advance.dataset.wrenAllowAdvance === "1") {
        delete advance.dataset.wrenAllowAdvance;
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      addReplyPanel(shell, advance, currentStatus);
    }, true);
  }

  const status = advance.textContent ?? "";
  const finishedTyping = /Tap to (continue|close)/i.test(status);
  const panel = shell.querySelector(".quest-wren-replies") as HTMLElement | null;
  if (!finishedTyping) panel?.remove();
  else addReplyPanel(shell, advance, status);
}

export function installAct1WrenDialoguePolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const w = window as Window & { __act1WrenDialoguePolishV3?: boolean };
  if (w.__act1WrenDialoguePolishV3) return;
  w.__act1WrenDialoguePolishV3 = true;

  enhance();
  const observer = new MutationObserver(enhance);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.setInterval(enhance, 250);
}
