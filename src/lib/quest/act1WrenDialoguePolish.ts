// @ts-nocheck -- Presentation-only DOM enhancement for the existing React guide dialogue.
import wrenArt from "../../assets/quest/guide.png";
import mariaPortrait from "../../assets/quest/maria-portrait.png";

const WREN_NAME = "Wren of the Shores";
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
    width: "88px", height: "88px", minWidth: "88px", borderRadius: "16px",
    border: "2px solid rgba(211,174,89,.82)", overflow: "hidden",
    background: side === "wren" ? "linear-gradient(160deg,#1a3450,#0a1325)" : "#f4e4dd",
    boxShadow: "0 10px 28px rgba(0,0,0,.32)", display: "flex", alignItems: "flex-start", justifyContent: "center",
  });
  const img = document.createElement("img");
  img.src = src; img.alt = alt;
  style(img, {
    width: side === "wren" ? "118px" : "100%", height: side === "wren" ? "158px" : "100%",
    objectFit: side === "wren" ? "contain" : "cover", objectPosition: "50% 10%",
    imageRendering: "pixelated",
  });
  frame.appendChild(img);
  return frame;
}

function findWrenDialog() {
  const names = Array.from(document.querySelectorAll("span"));
  const name = names.find((node) => (node.textContent ?? "").trim() === WREN_NAME) as HTMLElement | undefined;
  if (!name) return null;
  const overlay = name.closest(".absolute.inset-0") as HTMLElement | null;
  const shell = name.closest(".relative.w-full.max-w-3xl") as HTMLElement | null;
  const advance = shell?.querySelector('button[aria-label="Continue conversation"]') as HTMLButtonElement | null;
  return overlay && shell && advance ? { overlay, shell, advance, name } : null;
}

function enhance() {
  const found = findWrenDialog();
  if (!found) return;
  const { overlay, shell, advance, name } = found;
  overlay.dataset.wrenCinematic = "true";
  style(overlay, { background: "rgba(4,10,22,.50)", backdropFilter: "blur(2px)" });
  style(shell, { maxWidth: "900px" });

  const cardInner = name.closest(".relative.flex.items-start") as HTMLElement | null;
  if (cardInner && !cardInner.querySelector(".quest-wren-portrait-wren")) {
    cardInner.insertBefore(portrait(wrenArt, WREN_NAME, "wren"), cardInner.firstChild);
    style(cardInner, { padding: "18px 20px", gap: "16px", alignItems: "center" });
    const card = cardInner.parentElement as HTMLElement | null;
    if (card) style(card, {
      borderRadius: "20px", borderColor: "rgba(211,174,89,.78)",
      background: "linear-gradient(135deg,rgba(8,18,38,.97),rgba(15,25,49,.95))",
      boxShadow: "0 20px 60px rgba(0,0,0,.38), inset 0 0 45px rgba(211,174,89,.035)",
    });
  }

  const status = advance.textContent ?? "";
  const finishedTyping = /Tap to (continue|close)/i.test(status);
  let replyPanel = shell.querySelector(".quest-wren-replies") as HTMLElement | null;
  if (!finishedTyping) {
    replyPanel?.remove();
    return;
  }
  if (replyPanel) return;

  replyPanel = document.createElement("div");
  replyPanel.className = "quest-wren-replies";
  style(replyPanel, {
    marginTop: "10px", padding: "12px", borderRadius: "18px",
    border: "1px solid rgba(211,174,89,.48)", background: "rgba(7,15,31,.94)",
    boxShadow: "0 14px 35px rgba(0,0,0,.28)", color: "white",
  });
  const label = document.createElement("div");
  label.textContent = "How does Maria answer?";
  style(label, { fontSize: "10px", textTransform: "uppercase", letterSpacing: ".18em", color: "#d3ae59", marginBottom: "8px", fontWeight: "700" });
  replyPanel.appendChild(label);

  const choices = document.createElement("div");
  style(choices, { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "8px" });
  REPLIES.forEach((text) => {
    const button = document.createElement("button");
    button.type = "button"; button.textContent = `“${text}”`;
    style(button, {
      minHeight: "44px", borderRadius: "12px", border: "1px solid rgba(211,174,89,.35)",
      background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.94)", padding: "9px 11px",
      textAlign: "left", fontSize: "13px", lineHeight: "1.35", cursor: "pointer",
    });
    button.addEventListener("click", (event) => {
      event.preventDefault(); event.stopPropagation();
      choices.replaceChildren();
      const mariaRow = document.createElement("div");
      style(mariaRow, { display: "flex", alignItems: "center", gap: "12px" });
      mariaRow.appendChild(portrait(mariaPortrait, "Maria", "maria"));
      const copy = document.createElement("div");
      const who = document.createElement("div"); who.textContent = "Maria";
      style(who, { color: "#e7bdc3", fontWeight: "700", fontSize: "15px", marginBottom: "4px" });
      const quote = document.createElement("div"); quote.textContent = `“${text}”`;
      style(quote, { color: "rgba(255,255,255,.94)", fontSize: "14px", fontStyle: "italic", lineHeight: "1.45" });
      copy.append(who, quote); mariaRow.appendChild(copy); choices.appendChild(mariaRow);
      label.textContent = "Maria";

      const cont = document.createElement("button");
      cont.type = "button"; cont.textContent = /Tap to close/i.test(status) ? "Finish conversation" : "Continue with Wren";
      style(cont, { width: "100%", marginTop: "10px", minHeight: "42px", borderRadius: "12px", border: "1px solid rgba(211,174,89,.7)", background: "rgba(211,174,89,.18)", color: "#f2d78f", fontWeight: "700", cursor: "pointer" });
      cont.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); advance.click(); });
      replyPanel!.appendChild(cont);
    });
    choices.appendChild(button);
  });
  replyPanel.appendChild(choices);
  shell.appendChild(replyPanel);
}

export function installAct1WrenDialoguePolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const w = window as Window & { __act1WrenDialoguePolish?: boolean };
  if (w.__act1WrenDialoguePolish) return;
  w.__act1WrenDialoguePolish = true;
  enhance();
  const observer = new MutationObserver(() => enhance());
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
