// @ts-nocheck -- Cinematic, contextual conversation layer for Wren's Act I guide dialogue.
import wrenArt from "../../assets/quest/guide-act.png";
import mariaPortrait from "../../assets/quest/maria-portrait.png";

type Choice = { text: string; answer: string };
type Beat = { match: RegExp; short: string; choices: Choice[] };

// Wren's displayed monologue is tightened by roughly 25%, while every Maria
// question gets a direct Wren answer before the underlying guide advances.
const BEATS: Beat[] = [
  {
    match: /Oh — you're awake|sea told me someone was coming/i,
    short: "Oh — you're awake. Steady. I'm Wren, keeper of these shores. I've been waiting since sunrise; the sea told me someone was coming today.",
    choices: [
      { text: "The sea told you I was coming?", answer: "It did. The tide went still at dawn, then turned toward this shore. Around here, the sea notices arrivals before I do." },
      { text: "Where am I exactly?", answer: "On the Sunlit Shores, at the edge of a much larger realm. I'll explain the rest — just keep your feet under you first." },
      { text: "You've been waiting here since sunrise?", answer: "Since the first light. I didn't know your face yet, only that someone important was on her way." },
    ],
  },
  {
    match: /Your name is Maria|five lands laid end to end/i,
    short: "Your name is Maria. Hold on to that. This is the Realm of the Golden Ring: five lands joined together, each shaped by something Andrew feels about you.",
    choices: [
      { text: "Five lands? What happened to this place?", answer: "Nothing happened to it. It was made this way — five parts of one road, each carrying a different truth for you to find." },
      { text: "Why do you keep telling me to hold on to my name?", answer: "Because this realm can feel like a dream. Your name is an anchor. Remember who you are, and the rest becomes easier to face." },
      { text: "Alright. Where am I supposed to start?", answer: "Here, on the Shores. Learn the road, take what you need, then follow it east. I'll give you the destination before you leave." },
    ],
  },
  {
    match: /Andrew is the reason all this exists|road only runs one way/i,
    short: "Andrew is why this realm exists. He's waiting at the far end, but he cannot come to you. That's the rule: the road runs one way, and you have to walk it.",
    choices: [
      { text: "He built all of this?", answer: "In the way this realm understands building, yes. His memories, hopes, fears, and love became places you can actually walk through." },
      { text: "Why can't he come to me?", answer: "Because the road is meant to show you what he couldn't simply hand you. If he crossed it for you, the journey would lose its meaning." },
      { text: "Then tell me how to reach him.", answer: "Keep moving through each land and gather what was left for you. The road itself will open the way to him." },
    ],
  },
  {
    match: /gathering five Relics|sealed Envelopes/i,
    short: "You're gathering five Relics — not treasure, but truths Andrew wants you to know. You'll also find sealed letters in quiet places. Read them; they're part of the journey.",
    choices: [
      { text: "So each Relic is something he couldn't say?", answer: "Something he wanted you to feel, not just hear. Each Relic gives that truth a shape you can carry." },
      { text: "The letters matter as much as the road?", answer: "Yes. Don't rush past them. The road gets you forward; the letters tell you why you're walking it." },
      { text: "Where should I look first?", answer: "Follow the natural edges of each land and notice the quiet corners. The important things here rarely shout for attention." },
    ],
  },
  {
    match: /Each land is guarded|isn't evil|too much or not enough/i,
    short: "Each land is guarded. Sorrow takes shape here, but it isn't evil. It tries to make you believe you're too much or not enough. Beat it by refusing that lie.",
    choices: [
      { text: "If they aren't evil, I don't want to treat them like they are.", answer: "Good. You don't destroy them here. You break the fear holding them together and let them become gentle again." },
      { text: "What happens if I start believing what they say?", answer: "Then stop, breathe, and remember whose voice you're hearing. A fear can sound convincing without being true." },
      { text: "Then I'll keep moving, even when they get loud.", answer: "That's enough. Courage here isn't silence — it's taking the next step while the noise is still there." },
    ],
  },
  {
    match: /Radiant Spark Wand|throws light, not blades/i,
    short: "Take the Radiant Spark Wand. It throws light, not blades; what it touches turns gentle again. You'll find stronger weapons later, and you can keep them all.",
    choices: [
      { text: "Light instead of blades. I like that.", answer: "I thought you might. This realm answers you best when strength and gentleness are the same thing." },
      { text: "So I can calm things without hurting them?", answer: "Exactly. Strike the fear, not the creature underneath it. You'll see the difference when the petals appear." },
      { text: "Show me how to use it.", answer: "Face what threatens you and swing. The wand does the rest. Keep moving while you fight; standing still makes you an easy target." },
    ],
  },
  {
    match: /Watch your hearts|Five hits|Rest stones/i,
    short: "Watch your hearts. Five hits return you to the start of the land, but you lose nothing. Rest stones and your house restore you; the house also has storage, cooking, and a bed.",
    choices: [
      { text: "Five hits sends me back, but I don't lose everything?", answer: "Correct. No Relics, letters, or progress disappear. You only retrace a little road." },
      { text: "Where can I rest?", answer: "Look for the glowing rest stones, or return to your house. Either will put you back on your feet." },
      { text: "A house... here?", answer: "Yours. A small safe place in every strange thing around you. Use it whenever the road starts feeling too loud." },
    ],
  },
  {
    match: /sun here runs a real day|Animals wander the grass/i,
    short: "Time moves here: daylight fades and the lamps come on at night. Animals wander the grass, and food can restore your hearts when you need it.",
    choices: [
      { text: "So this place really keeps time.", answer: "It does. Morning, evening, night — the world keeps breathing even when you stand still." },
      { text: "I'd rather not hunt unless I have to.", answer: "Then don't. Rest stones and your house are there too. Food is an option, not an obligation." },
      { text: "Alright — daylight matters. I'll pay attention.", answer: "Good. The road doesn't close at night, but landmarks are easier to read while the sun is up." },
    ],
  },
  {
    match: /Your road today|River Gate Temple|You're expected/i,
    short: "For now, follow the coastal path east to the River Gate Temple. Use the signposts or map if you lose your bearings. You're not lost, Maria. You're expected.",
    choices: [
      { text: "East to the River Gate Temple. Got it.", answer: "That's the road. Stay on the coast and you'll see the temple before you can miss it." },
      { text: "And the Warden is waiting inside?", answer: "Yes — guarding the Lantern. Remember what I told you: what waits there is sorrow with a shape, not something born evil." },
      { text: "I'm ready, Wren.", answer: "I believe you. Take the wand, follow the water east, and trust yourself when the road gets loud." },
    ],
  },
];

const FALLBACK: Choice[] = [
  { text: "Tell me more.", answer: "Of course. One thing at a time." },
  { text: "What should I understand about that?", answer: "Only what matters for the next step. The rest will make sense on the road." },
  { text: "Alright. Keep going.", answer: "Good. Stay with me a moment longer." },
];

function style(el: HTMLElement, values: Record<string, string>) { Object.assign(el.style, values); }

function portrait(src: string, alt: string, maria = false) {
  const frame = document.createElement("div");
  frame.className = maria ? "quest-wren-portrait-maria" : "quest-wren-portrait-wren";
  style(frame, { width: maria ? "72px" : "112px", height: maria ? "72px" : "112px", minWidth: maria ? "72px" : "112px", borderRadius: maria ? "18px" : "22px", border: `2px solid ${maria ? "rgba(235,190,204,.9)" : "rgba(230,191,101,.96)"}`, overflow: "hidden", background: maria ? "#e7cbd0" : "radial-gradient(circle at 50% 25%,#294762,#081224 72%)", boxShadow: maria ? "0 10px 28px #0006" : "0 0 0 4px #d3ae5914,0 0 36px #d3ae5930,0 18px 38px #0008", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" });
  const img = document.createElement("img"); img.src = src; img.alt = alt;
  style(img, { width: maria ? "100%" : "82px", height: maria ? "100%" : "118px", objectFit: maria ? "cover" : "contain", objectPosition: "50% 12%", imageRendering: "pixelated" });
  frame.appendChild(img); return frame;
}

function findDialog() {
  for (const advance of Array.from(document.querySelectorAll<HTMLButtonElement>('button[aria-label="Continue conversation"]'))) {
    const shell = advance.parentElement as HTMLElement | null;
    if (!shell || !/Wren of the Shores/i.test(shell.textContent ?? "")) continue;
    const overlay = shell.closest(".absolute.inset-0") as HTMLElement | null;
    const name = Array.from(shell.querySelectorAll<HTMLElement>("span")).find(el => /Wren of the Shores/i.test(el.textContent ?? ""));
    if (overlay && name) return { advance, shell, overlay, name };
  }
  return null;
}

function beatFor(shell: HTMLElement) { const t = shell.textContent ?? ""; return BEATS.find(b => b.match.test(t)); }

function decorate(shell: HTMLElement, overlay: HTMLElement, name: HTMLElement) {
  style(overlay, { background: "radial-gradient(circle at 50% 42%,rgba(5,15,31,.34),rgba(2,7,18,.72))", backdropFilter: "blur(5px) saturate(.9)" });
  style(shell, { maxWidth: "900px" });
  const inner = name.closest(".relative.flex.items-start") as HTMLElement | null; if (!inner) return;
  style(inner, { padding: "18px 22px", gap: "18px", alignItems: "center", minHeight: "142px" });
  if (!inner.querySelector(".quest-wren-portrait-wren")) inner.insertBefore(portrait(wrenArt, "Wren of the Shores"), inner.firstChild);
  const card = inner.parentElement as HTMLElement | null;
  if (card) style(card, { borderRadius: "24px", borderColor: "rgba(230,191,101,.92)", background: "radial-gradient(120% 180% at 0 0,#203a54fa,#081123fc 52%,#0e1127fc)", boxShadow: "0 28px 75px #0008,0 0 55px #d3ae5914" });
  if (!shell.querySelector(".quest-wren-crownline")) {
    const line = document.createElement("div"); line.className = "quest-wren-crownline"; line.textContent = "✦  ACT I  ·  THE SUNLIT SHORES  ·  A CONVERSATION  ✦";
    style(line, { position: "absolute", top: "8px", left: "50%", transform: "translateX(-50%)", color: "#e6bf6599", fontSize: "9px", fontWeight: "900", letterSpacing: ".2em", whiteSpace: "nowrap", pointerEvents: "none" });
    shell.appendChild(line);
  }
}

function addPanel(shell: HTMLElement, advance: HTMLButtonElement, status: string, beat?: Beat) {
  if (shell.querySelector(".quest-wren-replies")) return;
  const choicesData = beat?.choices ?? FALLBACK;
  const panel = document.createElement("section"); panel.className = "quest-wren-replies";
  style(panel, { marginTop: "10px", padding: "16px", borderRadius: "20px", border: "1px solid #d3ae5994", background: "radial-gradient(120% 160% at 50% 0%,#19243ffc,#060d1cfc 68%)", boxShadow: "0 20px 48px #0006", color: "white" });
  const label = document.createElement("div"); label.textContent = "HOW DOES MARIA ANSWER?"; style(label, { color: "#e1b95b", fontSize: "10px", fontWeight: "900", letterSpacing: ".2em", marginBottom: "12px" }); panel.appendChild(label);
  const grid = document.createElement("div"); style(grid, { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "9px" }); panel.appendChild(grid);
  choicesData.forEach((choice, i) => {
    const b = document.createElement("button"); b.type = "button"; b.innerHTML = `<small style="display:block;color:#d9b45d;font-weight:900;letter-spacing:.15em;margin-bottom:5px">${i === 0 ? "CURIOUS" : i === 1 ? "THOUGHTFUL" : "READY"}</small>“${choice.text}”`;
    style(b, { minHeight: "66px", borderRadius: "15px", border: "1px solid #d3ae5957", background: "linear-gradient(150deg,#ffffff12,#ffffff06)", color: "#fff", padding: "12px 14px", textAlign: "left", fontSize: "13px", lineHeight: "1.4", cursor: "pointer", transition: ".16s ease" });
    b.onmouseenter = () => { b.style.transform = "translateY(-2px)"; b.style.borderColor = "#e6bf65d9"; b.style.background = "linear-gradient(150deg,#d3ae592b,#ffffff0b)"; };
    b.onmouseleave = () => { b.style.transform = "none"; b.style.borderColor = "#d3ae5957"; b.style.background = "linear-gradient(150deg,#ffffff12,#ffffff06)"; };
    b.onclick = e => {
      e.preventDefault(); e.stopPropagation(); grid.replaceChildren(); label.textContent = "MARIA";
      const mariaRow = document.createElement("div"); style(mariaRow, { display: "flex", alignItems: "center", gap: "14px", padding: "10px", borderRadius: "16px", background: "#e7bdc314", border: "1px solid #e7bdc347" }); mariaRow.appendChild(portrait(mariaPortrait, "Maria", true));
      const mq = document.createElement("div"); mq.innerHTML = `<b style="color:#efc4d0">Maria</b><div style="margin-top:5px;font-style:italic">“${choice.text}”</div>`; mariaRow.appendChild(mq); grid.appendChild(mariaRow);
      const answer = document.createElement("div"); style(answer, { display: "flex", gap: "14px", alignItems: "center", marginTop: "10px", padding: "12px", borderRadius: "16px", background: "#d3ae5910", border: "1px solid #d3ae5945" }); answer.appendChild(portrait(wrenArt, "Wren"));
      const aq = document.createElement("div"); aq.innerHTML = `<b style="color:#e6bf65">Wren answers</b><div style="margin-top:5px;line-height:1.5;font-style:italic">“${choice.answer}”</div>`; answer.appendChild(aq); panel.appendChild(answer);
      const cont = document.createElement("button"); cont.type = "button"; cont.textContent = /Tap to close/i.test(status) ? "Finish conversation  ✦" : "Continue with Wren  →";
      style(cont, { width: "100%", marginTop: "12px", minHeight: "44px", borderRadius: "13px", border: "1px solid #e6bf65d1", background: "linear-gradient(90deg,#b78f393d,#e6bf6529,#b78f393d)", color: "#f2d78f", fontWeight: "900", cursor: "pointer" });
      cont.onclick = ev => { ev.preventDefault(); ev.stopPropagation(); advance.dataset.wrenAllowAdvance = "1"; advance.click(); }; panel.appendChild(cont);
    }; grid.appendChild(b);
  }); shell.appendChild(panel);
}

function shortenVisibleLine(shell: HTMLElement, beat?: Beat) {
  if (!beat) return;
  const candidates = Array.from(shell.querySelectorAll<HTMLElement>("p,blockquote,div"));
  const el = candidates.find(node => beat.match.test(node.textContent ?? "") && !node.querySelector("button") && !/Wren of the Shores/.test(node.textContent ?? ""));
  if (el && el.textContent !== beat.short) el.textContent = beat.short;
}

function enhance() {
  const f = findDialog(); if (!f) return;
  const { shell, overlay, advance, name } = f; decorate(shell, overlay, name);
  const status = advance.textContent ?? ""; const ready = /Tap to (continue|close)/i.test(status); const beat = beatFor(shell);
  if (ready) shortenVisibleLine(shell, beat);
  if (advance.dataset.wrenGuard !== "1") {
    advance.dataset.wrenGuard = "1";
    advance.addEventListener("click", e => {
      const s = advance.textContent ?? ""; if (!/Tap to (continue|close)/i.test(s)) return;
      if (advance.dataset.wrenAllowAdvance === "1") { delete advance.dataset.wrenAllowAdvance; return; }
      e.preventDefault(); e.stopImmediatePropagation(); addPanel(shell, advance, s, beatFor(shell));
    }, true);
  }
  const panel = shell.querySelector(".quest-wren-replies") as HTMLElement | null;
  if (!ready) panel?.remove(); else addPanel(shell, advance, status, beat);
}

export function installAct1WrenDialoguePolish() {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const w = window as Window & { __act1WrenDialoguePolishV4?: boolean }; if (w.__act1WrenDialoguePolishV4) return; w.__act1WrenDialoguePolishV4 = true;
  enhance(); const observer = new MutationObserver(enhance); observer.observe(document.body, { childList: true, subtree: true, characterData: true }); window.setInterval(enhance, 250);
}
