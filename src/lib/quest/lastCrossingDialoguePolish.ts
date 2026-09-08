// @ts-nocheck -- Premium dialogue pass for The Last Crossing.

const STORAGE_KEY = "marias-quest-last-crossing-v1";
const ZONE = "sunlit_shores";
const BLADE_ID = "crossing-blade";
const BLADE_DAMAGE = 350;

type VillagerId = "elara" | "pip" | "maeve";
type Choice = { text: string; reply: string };
type Slide = { kicker: string; speaker: string; line: string; choices: Choice[] };

const THEMES: Record<string, { accent: string; soft: string; bg: string; role: string }> = {
  elara: { accent: "#d39aaa", soft: "#8d5064", bg: "#281923", role: "Former Knight" },
  pip: { accent: "#7fd6df", soft: "#3b8995", bg: "#10272e", role: "Inventor" },
  maeve: { accent: "#d8dfb0", soft: "#7f9767", bg: "#1b281d", role: "Healer" },
  silas: { accent: "#e0bd75", soft: "#8d6941", bg: "#211b17", role: "Cartographer of the old road" },
  forge: { accent: "#f1cf77", soft: "#77c8d7", bg: "#101c2b", role: "The Last Crossing" },
};

const PRE: Record<VillagerId, Slide[]> = {
  elara: [
    { kicker: "A Knight Who Came Back", speaker: "Elara", line: "You're headed for the river. I can tell because you're wearing the same expression I had the morning I challenged the Warden: fear pretending to be certainty.", choices: [
      { text: "I'm afraid, but I'm still going.", reply: "Good. Courage that admits fear is sturdier than courage that needs to deny it." },
      { text: "Did you turn back?", reply: "Eventually. I hated myself for it for years. I don't anymore." },
      { text: "What did the Warden do to you?", reply: "Less than I did to myself afterward. That's the part I want you to avoid." },
    ]},
    { kicker: "What Courage Isn't", speaker: "Elara", line: "I used to think courage meant never retreating. I thought if I came home, then the river had named me a coward. The truth was uglier and kinder: I survived because I finally listened when my body told me I was done.", choices: [
      { text: "Surviving wasn't failure.", reply: "It took me a long time to say that without feeling ashamed. Thank you." },
      { text: "Would you cross again?", reply: "Not to prove anything. That's the difference now." },
    ]},
    { kicker: "The Lesson She Kept", speaker: "Elara", line: "The Warden wants you to believe that turning around and giving up are the same thing. They aren't. Sometimes you step back because you're choosing to return stronger, wiser, and alive.", choices: [
      { text: "I'll remember that if I need to retreat.", reply: "Then you've already learned something I paid dearly to understand." },
      { text: "I still want the other side.", reply: "Want it. Just don't make reaching it the price of your own mercy." },
    ]},
    { kicker: "Before the River", speaker: "Elara", line: "Talk to Pip and Maeve too. We all failed differently, which means between us we know more about that crossing than anyone who succeeded on the first try ever could.", choices: [
      { text: "I'll hear all three of you out.", reply: "Good. Then when you face him, you won't be carrying only your own first attempt." },
      { text: "Thank you for telling me the truth.", reply: "Do something useful with it. That's thanks enough." },
    ]},
  ],
  pip: [
    { kicker: "Seven Attempts", speaker: "Pip", line: "WAIT. You are absolutely planning to cross the river, aren't you? Wonderful. Horrible. Statistically upsetting. I tried seven times.", choices: [
      { text: "Seven?", reply: "Six and three quarters if we're being strict. One bridge became several smaller bridges very quickly." },
      { text: "You don't sound traumatized.", reply: "That is because I have converted approximately eighty percent of it into jokes." },
      { text: "What went wrong?", reply: "Which attempt? I have charts. None of them are flattering." },
    ]},
    { kicker: "Outbuilding Fear", speaker: "Pip", line: "Every time I was afraid, I built something more complicated. Hooks, braces, counterweights, a very ambitious flotation harness. I thought clever enough meant fearless enough.", choices: [
      { text: "Did any of it help?", reply: "Some of it. Enough to get me farther. Not enough to make fear disappear, because fear is irritatingly non-mechanical." },
      { text: "You were trying to solve yourself.", reply: "Yes. Rude of you to diagnose that so efficiently." },
    ]},
    { kicker: "What the River Taught", speaker: "Pip", line: "Turns out fear knows how to swim. You don't beat it by building a machine big enough to keep it out. You bring it with you and make sure it doesn't get to steer.", choices: [
      { text: "I can do that.", reply: "Excellent. That is much cheaper than my approach." },
      { text: "And if it does steer?", reply: "Correct course. Nobody gets extra points for never wobbling." },
    ]},
    { kicker: "Useful Failure", speaker: "Pip", line: "Talk to Elara and Maeve before you go. Between her instincts, Maeve's read on the Warden, and my magnificent pile of mistakes, we may actually be useful to you.", choices: [
      { text: "Your mistakes count as research.", reply: "Finally, someone with academic standards." },
      { text: "I'll take every advantage I can get.", reply: "Now you're thinking like an inventor." },
    ]},
  ],
  maeve: [
    { kicker: "The Name in the Water", speaker: "Maeve", line: "Maria. The Warden said your name when I reached the far bank. I didn't know who you were then. I only knew the river was waiting for someone who hadn't arrived yet.", choices: [
      { text: "He knew I was coming?", reply: "I think the crossing knows what each traveler is carrying before they do." },
      { text: "That isn't comforting.", reply: "No. But truth doesn't have to be comforting to be useful." },
    ]},
    { kicker: "Farther Than Before", speaker: "Maeve", line: "I made it farther than Elara or Pip. Close enough to believe I had won. Then the Warden asked me one question: what are you willing to lose to keep going? I had no answer.", choices: [
      { text: "What did you think he meant?", reply: "At first, my life. Later I understood he meant the things I was clinging to just because I was afraid to release them." },
      { text: "What would you answer now?", reply: "I would tell him I am willing to lose the need to prove myself." },
    ]},
    { kicker: "What He Guards", speaker: "Maeve", line: "He isn't really guarding the other side. He's guarding the part of you that wants to turn around, the part that says fear is prophecy instead of information.", choices: [
      { text: "Then I answer that part of myself first.", reply: "Yes. By the time your blade reaches him, the more important fight may already be underway." },
      { text: "What if that part is right?", reply: "Then listen to it carefully. Fear can warn you without ruling you." },
    ]},
    { kicker: "Carry More Than Steel", speaker: "Maeve", line: "Hear Elara and Pip too. Their failures are not warnings to stay home. They're pieces of a map. If you carry all three, your first crossing won't truly be a first attempt.", choices: [
      { text: "I'll carry all of you with me.", reply: "Then perhaps this time, all four of us reach the other side." },
      { text: "I'll come back after the Warden.", reply: "Do that. We deserve to know what the river looks like after fear loses its throne." },
    ]},
  ],
};

const POST: Record<VillagerId, Slide[]> = {
  elara: [{ kicker: "After the Crossing", speaker: "Elara", line: "You crossed. I spent years believing that river had the final word on who I was. Thank you for proving a place can wound you without getting to define you.", choices: [{ text: "You helped me get there.", reply: "Then maybe I crossed a little of it too." }, { text: "Your retreat saved your life.", reply: "And your return gave the memory somewhere new to end." }] }],
  pip: [{ kicker: "A Successful Experiment", speaker: "Pip", line: "You actually did it. Which means several old calculations are wrong, I owe Elara money, and—more importantly—the blade held.", choices: [{ text: "The blade worked.", reply: "Please say that louder near my workshop." }, { text: "Fear still came with me.", reply: "Of course. The impressive part is that you didn't give it the map." }] }],
  maeve: [{ kicker: "Four Crossings", speaker: "Maeve", line: "Whatever you said to the Warden, you carried all four of us across that river. The blade is ordinary steel now. Keep it anyway. Some things are worth carrying after their power is gone.", choices: [{ text: "I will.", reply: "Good. Let it remind you that borrowed strength can become your own." }, { text: "We all made it.", reply: "Yes. Not in the way we imagined, but yes." }] }],
};

const SILAS: Slide[] = [
  { kicker: "The Old Road", speaker: "Silas", line: "Going toward the river? Then don't follow the old road straight there. Everyone who does comes back wearing the same expression.", choices: [
    { text: "I'm still crossing. Tell me what you know.", reply: "Good. Southeast of here is a settlement called The Last Crossing. Three people live there. All three challenged the Warden. All three came back." },
    { text: "Are you trying to scare me away?", reply: "No. Fear makes terrible maps. I'm trying to keep you from repeating an expensive mistake." },
    { text: "Why trust people who failed?", reply: "Because failure is expensive knowledge, and they already paid for it." },
  ]},
  { kicker: "Three Survivors", speaker: "Silas", line: "Elara, Pip, and Maeve failed in different ways. That's useful. One learned when to retreat, one learned cleverness can't erase fear, and one got close enough to understand what the Warden is really guarding.", choices: [
    { text: "I'll talk to all three.", reply: "Then you'll arrive at the river with three lifetimes of warning in your pocket." },
    { text: "Where exactly are they?", reply: "Follow the old stone road southeast. When the lamps begin appearing, you're close." },
  ]},
  { kicker: "A Map Made of People", speaker: "Silas", line: "Maps are usually lines and landmarks. This one is people. Listen before you decide you're ready. Then decide for yourself.", choices: [
    { text: "That's the plan.", reply: "Good. A traveler who listens tends to keep more than directions." },
    { text: "And after them?", reply: "The river. By then, you'll know why you're going." },
  ]},
];

const FORGE: Slide[] = [
  { kicker: "What Remained", speaker: "Elara", line: "There is one thing we haven't told you. This is what remained of my sword after I challenged the Warden. I brought back more cracks than steel.", choices: [{ text: "You kept it all this time?", reply: "I couldn't decide whether it was a failure or a promise. Maybe it was waiting for you to answer that." }, { text: "That's still a sword?", reply: "Pip would like a word with your definition of 'still.'" }] },
  { kicker: "Rebuilt From Failure", speaker: "Pip", line: "She calls it a sword. When she gave it to me, it was six pieces of metal and a bad memory. I rebuilt it with parts from all three of our failed expeditions.", choices: [{ text: "So all three of you are in it.", reply: "Exactly. Which is either poetic or a horrifying violation of engineering best practices." }, { text: "Will it hold?", reply: "Now? Yes. I have upgraded my answer from 'mostly.'" }] },
  { kicker: "The Blessing", speaker: "Maeve", line: "Repairing it isn't enough. The crossing remembers us—our fear, our failures, every time we turned back. I can bind that memory into the blade long enough for you to finish what we couldn't.", choices: [{ text: "What will it do?", reply: "Every clean strike will carry the weight of all three failed crossings." }, { text: "And what does it cost?", reply: "Nothing permanent. Its power belongs only to this unfinished crossing." }] },
  { kicker: "Three Hundred Fifty", speaker: "Elara", line: "Listen carefully. Every clean strike carries 350 damage. Use it on the road if you need to. When the Warden falls, the blessing ends forever.", choices: [{ text: "350 damage. Understood.", reply: "Good. I prefer courage with accurate numbers." }, { text: "Why does the power end?", reply: "Because the blade exists to finish one unfinished thing, not to make every future fight easy." }] },
  { kicker: "The Attempt We Share", speaker: "Maeve", line: "We're not giving you a weapon forever, Maria. We're giving you the attempt we never finished. When you take it, you take our fear too—but you also take everything we learned after surviving it.", choices: [{ text: "Then we cross together.", reply: "Yes. That is exactly what I hoped you'd say." }, { text: "I'll bring it back quiet.", reply: "Bring yourself back first. The steel is secondary." }] },
  { kicker: "The Crossing Blade", speaker: "Pip", line: "All right. No more speeches before I accidentally have a feeling. Take it. The Crossing Blade: 350 damage until the Warden of Rushing Water falls, and then a perfectly respectable keepsake.", choices: [{ text: "I'll finish what you started.", reply: "Go make our worst research useful." }, { text: "See you after the river.", reply: "Preferably with fewer pieces than the sword had when I met it." }] },
];

function readState() {
  const fallback = { talked: [] as VillagerId[], forged: false, wardenDefeated: false };
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      talked: Array.isArray(parsed.talked) ? parsed.talked.filter((x: string) => ["elara", "pip", "maeve"].includes(x)) : [],
      forged: Boolean(parsed.forged),
      wardenDefeated: Boolean(parsed.wardenDefeated),
    };
  } catch { return fallback; }
}
function writeState(s: any) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }
function styles(el: HTMLElement, values: Record<string, string>) { Object.assign(el.style, values); }
function choiceButton(text: string, accent: string) {
  const b = document.createElement("button"); b.type = "button"; b.textContent = `“${text}”`;
  styles(b, { width: "100%", textAlign: "left", padding: "12px 14px", borderRadius: "13px", border: `1px solid ${accent}66`, background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.95)", fontSize: "13px", lineHeight: "1.4", cursor: "pointer", transition: "150ms ease" });
  b.onmouseenter = () => { b.style.transform = "translateX(3px)"; b.style.borderColor = accent; b.style.background = "rgba(255,255,255,.09)"; };
  b.onmouseleave = () => { b.style.transform = "translateX(0)"; b.style.borderColor = `${accent}66`; b.style.background = "rgba(255,255,255,.055)"; };
  return b;
}

function showConversation(scene: any, id: string, name: string, slides: Slide[], onFinish?: () => void) {
  document.getElementById("quest-last-crossing-premium")?.remove();
  scene.frozen = true; scene.physics?.pause?.();
  const theme = THEMES[id] ?? THEMES.forge;
  let index = 0; let response: string | null = null;

  const overlay = document.createElement("div"); overlay.id = "quest-last-crossing-premium";
  styles(overlay, { position: "fixed", inset: "0", zIndex: "10050", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px", background: `radial-gradient(circle at 42% 35%,${theme.soft}33,rgba(3,7,17,.9) 68%)`, backdropFilter: "blur(7px)" });
  const card = document.createElement("div");
  styles(card, { width: "min(980px,96vw)", maxHeight: "90vh", overflow: "auto", borderRadius: "25px", border: `2px solid ${theme.accent}cc`, background: `radial-gradient(120% 180% at 12% 0%,${theme.bg},#091326 55%,#070d19)`, boxShadow: `0 35px 100px rgba(0,0,0,.72),0 0 60px ${theme.soft}22`, color: "white", position: "relative" });
  overlay.appendChild(card);
  const header = document.createElement("div");
  styles(header, { padding: "21px 24px 16px", borderBottom: `1px solid ${theme.accent}38` });
  header.innerHTML = `<div style="font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${theme.accent};font-weight:900">Act I · The Last Crossing</div><div style="font-family:Georgia,serif;font-size:30px;font-weight:800;color:#fff7df;margin-top:4px">${name}</div><div style="font-size:12px;color:rgba(255,255,255,.58);margin-top:3px">${theme.role}</div>`;
  card.appendChild(header);
  const close = document.createElement("button"); close.type = "button"; close.textContent = "✕";
  styles(close, { position: "absolute", right: "15px", top: "14px", width: "38px", height: "38px", borderRadius: "50%", border: `1px solid ${theme.accent}88`, background: "rgba(3,9,20,.78)", color: theme.accent, fontWeight: "900", cursor: "pointer" }); card.appendChild(close);
  const body = document.createElement("div"); styles(body, { display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(260px,.85fr)", gap: "18px", padding: "20px 22px 22px" }); card.appendChild(body);
  const speech = document.createElement("section"); styles(speech, { border: `1px solid ${theme.soft}55`, borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,.025)", minHeight: "265px" }); body.appendChild(speech);
  const side = document.createElement("section"); styles(side, { display: "flex", flexDirection: "column", gap: "8px" }); body.appendChild(side);

  const finish = () => { overlay.remove(); scene.frozen = false; scene.physics?.resume?.(); scene.pushHud?.(true); onFinish?.(); };
  close.onclick = finish;
  const render = () => {
    const s = slides[index]!; speech.innerHTML = ""; side.innerHTML = "";
    const meta = document.createElement("div"); meta.innerHTML = `<span style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:${theme.accent};font-weight:900">${s.kicker}</span><span style="float:right;font-size:11px;color:rgba(255,255,255,.45)">${index + 1} / ${slides.length}</span>`; speech.appendChild(meta);
    const speaker = document.createElement("div"); speaker.textContent = response ? s.speaker : s.speaker; styles(speaker, { marginTop: "20px", color: theme.accent, fontFamily: "Georgia,serif", fontWeight: "800", fontSize: "17px" }); speech.appendChild(speaker);
    const line = document.createElement("p"); line.textContent = `“${response ?? s.line}”`; styles(line, { margin: "9px 0 0", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "17px", lineHeight: "1.62", color: "rgba(255,255,255,.96)" }); speech.appendChild(line);
    const bars = document.createElement("div"); styles(bars, { display: "flex", gap: "5px", marginTop: "22px" });
    slides.forEach((_, i) => { const x = document.createElement("span"); styles(x, { height: "4px", flex: "1", borderRadius: "999px", background: i <= index ? theme.accent : "rgba(255,255,255,.13)" }); bars.appendChild(x); }); speech.appendChild(bars);
    if (!response) {
      const prompt = document.createElement("div"); prompt.textContent = "Maria — choose a response"; styles(prompt, { color: "#efc4d0", fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", fontWeight: "900", marginBottom: "3px" }); side.appendChild(prompt);
      s.choices.forEach(c => { const b = choiceButton(c.text, theme.accent); b.onclick = () => { response = c.reply; render(); }; side.appendChild(b); });
    } else {
      const heard = document.createElement("div"); heard.textContent = `${s.speaker} heard you.`; styles(heard, { color: "rgba(255,255,255,.52)", fontSize: "11px", padding: "4px 2px 8px" }); side.appendChild(heard);
      const next = choiceButton(index === slides.length - 1 ? "Continue" : "Continue", theme.accent); next.style.textAlign = "center"; next.style.fontWeight = "800"; next.onclick = () => { if (index >= slides.length - 1) finish(); else { index++; response = null; render(); } }; side.appendChild(next);
    }
  };
  render(); document.body.appendChild(overlay);
}

function ensureForge(scene: any) {
  const state = readState();
  if (state.talked.length !== 3 || state.forged || state.wardenDefeated) return;
  if ((scene.interactables ?? []).some((x: any) => x.kind === "last-crossing-forge" && x.enabled)) return;
  const c = scene.__lastCrossingCenter; if (!c || !scene.textures?.exists?.("last-crossing-blade")) return;
  const obj = scene.add.sprite(c.x, c.y - 42, "last-crossing-blade").setDepth(18).setScale(1.15);
  scene.tweens.add({ targets: obj, y: obj.y - 4, alpha: { from: .78, to: 1 }, duration: 900, yoyo: true, repeat: -1 });
  scene.interactables.push({ obj, kind: "last-crossing-forge", id: BLADE_ID, label: "Receive the Crossing Blade", radius: 82, enabled: true });
  scene.game.events.emit("quest:toast", "The three villagers have shared their stories. Something waits by the fountain.");
}

function giveBlade(scene: any, it: any) {
  const state = readState(); if (state.forged || state.wardenDefeated) return;
  state.forged = true; writeState(state);
  if (it) { it.enabled = false; it.obj?.destroy?.(); scene.interactables = (scene.interactables ?? []).filter((x: any) => x !== it); }
  if (!scene.save.weapons.includes(BLADE_ID)) scene.save.weapons = [...scene.save.weapons, BLADE_ID];
  scene.save.equipped_weapon = BLADE_ID; scene.emitSave?.(); scene.refreshHand?.(); scene.pushHud?.(true);
  scene.spawnSparkle?.(scene.player.x, scene.player.y, 0x9ee7f2, 30);
  scene.game.events.emit("quest:toast", `The Crossing Blade is equipped — ${BLADE_DAMAGE} damage until the Warden falls.`);
}

export function installLastCrossingDialoguePolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__lastCrossingDialoguePolishInstalled) return;
  proto.__lastCrossingDialoguePolishInstalled = true;
  const originalInteract = proto.interact;
  proto.interact = function lastCrossingPremiumInteract(...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (this.save?.current_zone !== ZONE || !it) return originalInteract.apply(this, args);
    if (it.kind === "last-crossing-npc") {
      const id = it.id as VillagerId; const state = readState(); const name = id === "elara" ? "Elara" : id === "pip" ? "Pip" : "Maeve";
      const slides = state.wardenDefeated ? POST[id] : PRE[id];
      showConversation(this, id, name, slides, () => {
        if (!state.wardenDefeated && !state.talked.includes(id)) { const latest = readState(); if (!latest.talked.includes(id)) latest.talked.push(id); writeState(latest); }
        ensureForge(this);
      });
      return;
    }
    if (it.kind === "last-crossing-silas") { showConversation(this, "silas", "Silas", SILAS); return; }
    if (it.kind === "last-crossing-forge") {
      showConversation(this, "forge", "The Crossing Blade", FORGE, () => giveBlade(this, it));
      return;
    }
    return originalInteract.apply(this, args);
  };
}
