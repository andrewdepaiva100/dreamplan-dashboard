// @ts-nocheck -- Isolated presentation enhancement for Wren's existing React guide dialogue.
import wrenArt from "../../assets/quest/guide-act.png";
import mariaPortrait from "../../assets/quest/maria-portrait.png";

const REPLIES = [
  "I understand. Tell me what I need to know.",
  "Andrew made all of this for me?",
  "Then I’m ready. I’ll keep going.",
];

function style(el: HTMLElement, values: Record<string, string>) {
  Object.assign(el.style, values);
}

function portrait(src: string, alt: string, side: "wren" | "maria") {
  const frame = document.createElement("div");
  frame.className = `quest-wren-portrait quest-wren-portrait-${side}`;
  style(frame, {
    width: side === "wren" ? "104px" : "68px",
    height: side === "wren" ? "104px" : "68px",
    minWidth: side === "wren" ? "104px" : "68px",
    borderRadius: "16px",
    border: `2px solid ${side === "wren" ? "rgba(211,174,89,.9)" : "rgba(231,189,195,.8)"}`,
    overflow: "hidden",
    background: side === "wren" ? "linear-gradient(160deg,#19334e,#091326)" : "#f4e4dd",
    boxShadow: "0 12px 30px rgba(0,0,0,.34)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
  });
  const img = document.createElement("img");
  img.src = src;
  img.alt = alt;
  style(img, {
    width: side === "wren" ? "76px" : "100%",
    height: side === "wren" ? "110px" : "100%",
    objectFit: side === "wren" ? "contain" : "cover",
    objectPosition: "50% 12%",
    imageRendering: "pixelated",
  });
  frame.appendChild(img);
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

function addReplyPanel(shell: HTMLElement, advance: HTMLButtonElement, status: string) {
  if (shell.querySelector(".quest-wren-replies")) return;

  const panel = document.createElement("section");
  panel.className = "quest-wren-replies";
  style(panel, {
    marginTop: "10px",
    padding: "13px",
    borderRadius: "16px",
    border: "1px solid rgba(211,174,89,.5)",
    background: "linear-gradient(135deg,rgba(7,15,31,.98),rgba(17,22,43,.98))",
    boxShadow: "0 16px 38px rgba(0,0,0,.3)",
    color: "white",
  });

  const label = document.createElement("div");
  label.textContent = "How does Maria answer?";
  style(label, {
    fontSize: "10px", textTransform: "uppercase", letterSpacing: ".18em",
    color: "#d3ae59", marginBottom: "9px", fontWeight: "800",
  });
  panel.appendChild(label);

  const choices = document.createElement("div");
  style(choices, { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "8px" });

  REPLIES.forEach((text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `“${text}”`;
    style(button, {
      minHeight: "46px", borderRadius: "12px", border: "1px solid rgba(211,174,89,.38)",
      background: "rgba(255,255,255,.06)", color: "rgba(255,255,255,.96)", padding: "10px 12px",
      textAlign: "left", fontSize: "13px", lineHeight: "1.35", cursor: "pointer",
    });
    button.onmouseenter = () => { button.style.background = "rgba(211,174,89,.15)"; button.style.borderColor = "rgba(211,174,89,.75)"; };
    button.onmouseleave = () => { button.style.background = "rgba(255,255,255,.06)"; button.style.borderColor = "rgba(211,174,89,.38)"; };
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      choices.replaceChildren();
      label.textContent = "Maria";

      const row = document.createElement("div");
      style(row, { display: "flex", alignItems: "center", gap: "12px" });
      row.appendChild(portrait(mariaPortrait, "Maria", "maria"));
      const copy = document.createElement("div");
      const who = document.createElement("div");
      who.textContent = "Maria";
      style(who, { color: "#e7bdc3", fontWeight: "800", fontSize: "15px", marginBottom: "4px" });
      const quote = document.createElement("div");
      quote.textContent = `“${text}”`;
      style(quote, { color: "rgba(255,255,255,.96)", fontSize: "14px", fontStyle: "italic", lineHeight: "1.45" });
      copy.append(who, quote);
      row.appendChild(copy);
      choices.appendChild(row);

      const cont = document.createElement("button");
      cont.type = "button";
      cont.textContent = /Tap to close/i.test(status) ? "Finish conversation" : "Continue with Wren";
      style(cont, {
        width: "100%", marginTop: "10px", minHeight: "42px", borderRadius: "12px",
        border: "1px solid rgba(211,174,89,.75)", background: "rgba(211,174,89,.18)",
        color: "#f2d78f", fontWeight: "800", cursor: "pointer",
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
  style(overlay, { background: "rgba(4,10,22,.55)", backdropFilter: "blur(3px)" });
  style(shell, { maxWidth: "880px" });

  const cardInner = name.closest(".relative.flex.items-start") as HTMLElement | null;
  if (cardInner) {
    style(cardInner, { padding: "16px 18px", gap: "16px", alignItems: "center" });
    if (!cardInner.querySelector(".quest-wren-portrait-wren")) {
      cardInner.insertBefore(portrait(wrenArt, "Wren of the Shores", "wren"), cardInner.firstChild);
    }
    const card = cardInner.parentElement as HTMLElement | null;
    if (card) style(card, {
      borderRadius: "20px", borderColor: "rgba(211,174,89,.82)",
      background: "linear-gradient(135deg,rgba(7,17,36,.98),rgba(16,24,48,.97))",
      boxShadow: "0 20px 60px rgba(0,0,0,.4), inset 0 0 45px rgba(211,174,89,.04)",
    });
  }

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
  const w = window as Window & { __act1WrenDialoguePolishV2?: boolean };
  if (w.__act1WrenDialoguePolishV2) return;
  w.__act1WrenDialoguePolishV2 = true;

  enhance();
  const observer = new MutationObserver(enhance);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  // React may mount the modal after the installer. A small polling fallback makes
  // the enhancement deterministic without touching quest progression state.
  window.setInterval(enhance, 250);
}
