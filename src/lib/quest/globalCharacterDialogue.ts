// @ts-nocheck -- Runtime dialogue presentation layer for existing quest characters.
// Keeps quest/combat state in the scene; only replaces the presentation of
// character-bearing modals that still used the generic React dialogue cards.

const EXCLUDED = new Set([
  "Wren of the Shores",
  "Elara",
  "Pip",
  "Maeve",
  "Silas",
  "The Crossing Blade",
  "Evelyn",
  "Bram the Forgemaster",
]);

type Choice = { maria: string; reply: string };
type Theme = { accent: string; accent2: string; bg: string; role: string; mark: string };

const THEMES: Record<string, Theme> = {
  "Ivy the Gardener": { accent: "#a8d884", accent2: "#e7c76f", bg: "#10251c", role: "Keeper of the Wedding Garden", mark: "✿" },
  "Marlowe the Bellkeeper": { accent: "#9bd7ef", accent2: "#e0b45f", bg: "#102236", role: "Bellkeeper of the Haven", mark: "◈" },
  "Astra the Stargazer": { accent: "#c4b8ff", accent2: "#f1d582", bg: "#17162c", role: "Watcher of the Starry Ascent", mark: "✦" },
  "Sister Lumen": { accent: "#f0d987", accent2: "#fff4c2", bg: "#241f18", role: "Keeper of the Cathedral Light", mark: "☼" },
  "Bram the Smith": { accent: "#efb05e", accent2: "#ffd994", bg: "#291b14", role: "Blacksmith", mark: "⚒" },
  "Andrew": { accent: "#ff9fc5", accent2: "#f4d37d", bg: "#241726", role: "Your person, waiting beside you", mark: "♥" },
  "Pastor Adriel": { accent: "#e8cf89", accent2: "#b9d7ff", bg: "#1d2130", role: "Pastor · Friend of your story", mark: "✧" },
  "Pastor Alcir": { accent: "#f0cf7c", accent2: "#fff0bd", bg: "#241e19", role: "Andrew's grandfather · Officiant", mark: "✦" },
  Lorena: { accent: "#f3a8c7", accent2: "#f2d17d", bg: "#271924", role: "Maria's closest friend", mark: "❀" },
  Alicia: { accent: "#efb2d4", accent2: "#c6e6b3", bg: "#24192a", role: "Bridesmaid · Lifelong friend", mark: "✿" },
  Pedro: { accent: "#8fd8ff", accent2: "#ffe084", bg: "#14243a", role: "Maria's little brother", mark: "★" },
  Gianluca: { accent: "#acc7ff", accent2: "#eac875", bg: "#182237", role: "Best Man", mark: "◆" },
  "Mom (Raquel)": { accent: "#f0aac2", accent2: "#efd17b", bg: "#281b22", role: "Andrew's mother", mark: "♥" },
  "Dad (Marcos)": { accent: "#b9c9e5", accent2: "#e8c06b", bg: "#1b2230", role: "Andrew's father", mark: "◆" },
  "Mom (Silvia)": { accent: "#efb4c9", accent2: "#f0d589", bg: "#291d25", role: "Maria's mother", mark: "♥" },
  "Dad (Gustavo)": { accent: "#b9d0dc", accent2: "#e7c171", bg: "#1c262b", role: "Maria's father", mark: "◆" },
  Andre: { accent: "#9fc5ef", accent2: "#e5c473", bg: "#172338", role: "Wedding friend", mark: "◇" },
  Phillip: { accent: "#a9c8ef", accent2: "#e9c876", bg: "#172338", role: "Lifelong Friend", mark: "◇" },
  Italo: { accent: "#9fc8e4", accent2: "#e4c06d", bg: "#172333", role: "Wedding friend", mark: "◇" },
  Gabe: { accent: "#a4c9f0", accent2: "#efca76", bg: "#172338", role: "Closest Friend", mark: "◇" },
  Andressa: { accent: "#eeb2cf", accent2: "#ecd27f", bg: "#271c28", role: "Andrew's sister", mark: "♥" },
};

const CURATED: Record<string, Choice[][]> = {
  "Ivy the Gardener": [
    [
      { maria: "This garden feels like it knows me.", reply: "It does, in the way a place can know the person it was grown for. Nothing here is accidental, Maria." },
      { maria: "Tell me what Andrew imagined here.", reply: "An open path. No guessing, no maze, no test of whether you could find him. Just a place prepared for you to arrive." },
    ],
    [
      { maria: "So the garden is about the wedding?", reply: "About the wedding, yes — but more about what comes after it. A garden stays beautiful because someone keeps tending it." },
      { maria: "Why are the paths so open?", reply: "Because love should not make you solve a puzzle just to know where you stand. Andrew wanted this realm to say that plainly." },
    ],
    [
      { maria: "Two relics in one realm?", reply: "Comfort and reflection belong beside each other. One gives you somewhere safe to land; the other helps you understand what you carried there." },
      { maria: "And there's another letter here?", reply: "There is. Some truths are better found quietly than announced across a garden." },
    ],
    [
      { maria: "Four keys. I can do that.", reply: "Spring, Summer, Autumn, Winter. Let each one teach you something before you hurry to the next." },
      { maria: "What should I know about the Spectre?", reply: "It moves like stress does — fast enough to make you mistake urgency for importance. Keep moving, but do not let it choose your pace." },
    ],
    [
      { maria: "I'll take the Floral Bow.", reply: "Good. Let distance be wisdom, not fear. You do not have to let every worry get close enough to touch you." },
      { maria: "I can keep the wand too?", reply: "Every gift stays yours. Use the tool that fits the moment; strength is not loyalty to one method." },
    ],
    [
      { maria: "I'll talk to the people here.", reply: "Please do. A wedding is never only two people; it is also everyone who witnessed the love becoming real." },
      { maria: "Then point me toward the first season.", reply: "Follow whichever corner catches your eye. Gardens rarely teach in straight lines, even when their paths are open." },
    ],
  ],
  "Marlowe the Bellkeeper": [
    [
      { maria: "It's loud even from here.", reply: "That is Haven on a difficult day. Noise is not always danger, but it can make danger feel close." },
      { maria: "Bellkeeper sounds important.", reply: "Mostly it means I know when the town needs waking and when it needs quiet. The second skill took longer." },
    ],
    [
      { maria: "Andrew imagined ordinary life here?", reply: "The Tuesdays, especially. Forever is mostly ordinary days, and he seems to understand that those are the ones worth building well." },
      { maria: "I like that this realm is ordinary.", reply: "Good. Grand gestures get remembered; ordinary kindness is what keeps a home standing." },
    ],
    [
      { maria: "Andrew is really here?", reply: "As real as this realm can hold him. Go to the fountain. Some conversations should happen before any battle." },
      { maria: "I'll find the patio letter too.", reply: "Take your time with it. Long talks leave a shape in a place, even after the chairs are empty." },
    ],
    [
      { maria: "I know that voice of doubt.", reply: "Then you already know its favorite trick: repetition. It mistakes saying something often for making it true." },
      { maria: "How do I quiet it?", reply: "Do not answer every accusation. Sometimes the strongest reply is continuing the life it says you cannot build." },
    ],
    [
      { maria: "I'll carry the Lightblade.", reply: "Then let it cut through noise, not people. That distinction matters more than how sharp it is." },
      { maria: "And the Memory Stone?", reply: "Read it. There are days worth remembering exactly because everything around them kept moving." },
    ],
  ],
  "Astra the Stargazer": [
    [
      { maria: "You watched me climb?", reply: "Every switchback. The stars make excellent witnesses and terrible gossips, so your secret is safe with us." },
      { maria: "How close am I?", reply: "Close enough to see the end and still far enough to be changed by the last stretch." },
    ],
    [
      { maria: "These stars are Andrew's thoughts?", reply: "The ones that would not let him sleep. Some fears shine because he stared at them too long." },
      { maria: "Then I'll walk through them with him.", reply: "That is the answer this mountain has been waiting to hear." },
    ],
    [
      { maria: "The Seal is the last key to the cathedral.", reply: "Exactly. Nothing here is more important than reaching it, but reaching it requires patience, not panic." },
      { maria: "No Seal, no wedding. Understood.", reply: "Good. Clarity is useful at altitude." },
    ],
    [
      { maria: "All five pillars must be gold together.", reply: "Yes. One bright pillar is beautiful; five aligned pillars make a path. Remember that." },
      { maria: "So I keep circling until they match.", reply: "Blue, gold, rose, back again. Watch more carefully than you rush." },
    ],
    [
      { maria: "Weariness doesn't scare me.", reply: "It should not scare you, but respect it. Exhaustion wins most often when people pretend they are above needing rest." },
      { maria: "Then I'll outlast it gently.", reply: "Exactly. There are victories that look almost like slowing down." },
    ],
    [
      { maria: "I'll take the Celestial Stave.", reply: "Carry it like a reminder: rest can be an action, not merely the absence of one." },
      { maria: "I'll read the letter at the summit.", reply: "Do. Some words deserve enough sky around them." },
    ],
  ],
  "Sister Lumen": [
    [
      { maria: "No more fighting?", reply: "None. You have carried enough steel to reach a place where it can finally become ceremonial." },
      { maria: "Then why give me a weapon here?", reply: "Because not every blade is for battle. Some objects exist to remind you what you promised not to become." },
    ],
    [
      { maria: "The cathedral feels different.", reply: "It is meant to. Every realm before this asked you to resist something. This one asks you to receive." },
      { maria: "Andrew is really waiting inside.", reply: "He is. And for once the road between you contains no enemy." },
    ],
  ],
  "Bram the Smith": [
    [
      { maria: "You made this for me?", reply: "Made it for the road you are walking. A blade should know its purpose before it ever knows an edge." },
      { maria: "Two hundred damage sounds serious.", reply: "Serious enough to clear worry, not serious enough to make you careless. Keep both truths in your hand." },
    ],
  ],
  Andrew: [
    [
      { maria: "You made this for me?", reply: "Of course I did. If I could put every way I want to protect you into steel, it would probably look something like that." },
      { maria: "Then you better keep up with your blue one.", reply: "Try me. I have been waiting a long time to fight beside you instead of watching from the edge of the story." },
      { maria: "I don't need the sword as much as I need you here.", reply: "Then take both. The sword is a gift. Me staying is the promise." },
    ],
  ],
  "Pastor Adriel": [
    [
      { maria: "You really prayed for us?", reply: "By name. More than once. Love this serious deserves prayer before it ever deserves applause." },
      { maria: "I'm almost at the altar.", reply: "You are. Do not let being close make you rush the last faithful steps." },
    ],
    [],
    [
      { maria: "I'll turn the pillars gold.", reply: "And when they align, remember that agreement is not sameness. Five lights can keep their own shape and still make one path." },
      { maria: "Heaven is watching?", reply: "I believe heaven notices every promise made with a sincere heart." },
    ],
    [
      { maria: "Tell Pastor Alcir I'm coming.", reply: "He already knows. Grandfathers have a way of knowing when the moment they prayed for is walking toward them." },
      { maria: "Thank you for being here.", reply: "There is nowhere else I would rather stand than near a story God has been kind to." },
    ],
  ],
  "Pastor Alcir": [
    [
      { maria: "I'm trying not to cry yet.", reply: "Do not waste energy fighting happy tears, child. We have handkerchiefs and plenty of time." },
      { maria: "We're ready, Pastor.", reply: "I know. Ready does not mean unshaken; it means willing to step forward anyway." },
    ],
    [],
    [
      { maria: "Your knees better make it through the vows.", reply: "These knees have survived Andrew's childhood. A wedding is easy work by comparison." },
      { maria: "You really have been praying for us.", reply: "Long enough that today feels less like a surprise and more like an answer arriving on schedule." },
    ],
    [
      { maria: "We'll walk forward together.", reply: "That is the whole sermon, Maria. Keep doing that long after everyone goes home." },
      { maria: "Thank you for marrying us.", reply: "It is one of the great privileges of my life." },
    ],
  ],
};

const GUEST_CHOICES: Record<string, Choice[]> = {
  Lorena: [
    { maria: "You circled the date in six colors?", reply: "Minimum six. There may have been stickers involved. This wedding has had project-management status for months." },
    { maria: "I'm glad you're here with me.", reply: "Always. River monsters, wedding nerves, bad shoes — whatever shows up, I am in your corner." },
  ],
  Alicia: [
    { maria: "You already cried twice?", reply: "Twice that I am admitting to. Bridesmaid confidentiality covers the rest." },
    { maria: "You've been my person forever.", reply: "And I plan to keep the job after you are married. Andrew does not get exclusive rights to you." },
  ],
  Pedro: [
    { maria: "Almost as cool as you?", reply: "Correct. I am willing to negotiate him up to ninety-eight percent after the ceremony." },
    { maria: "You really agreed to nice shoes?", reply: "For you. This is historic sacrifice. Please make sure everyone knows." },
  ],
  Gianluca: [
    { maria: "You make it sound like Andrew is calm.", reply: "Externally. Internally I suspect he has rehearsed standing at the altar forty times." },
    { maria: "Save me that seat.", reply: "Front row if I can get away with it. But you are supposed to be at the altar, so do not make me use it." },
  ],
  "Mom (Raquel)": [
    { maria: "You can cry, Mom.", reply: "I know, sweetheart. I just hoped to make it through one sentence first." },
    { maria: "Thank you for welcoming me.", reply: "You were family before anyone printed an invitation." },
  ],
  "Dad (Marcos)": [
    { maria: "He keeps earning it.", reply: "Good. Love should never become an excuse to stop being worthy of each other's trust." },
    { maria: "You look proud of him.", reply: "I am. More because of the man he became than the suit he put on." },
  ],
  "Mom (Silvia)": [
    { maria: "Mom, you're going to make me cry.", reply: "Then we can ruin our makeup together and call it a family tradition." },
    { maria: "He really was already family, wasn't he?", reply: "The right people arrive before the paperwork catches up." },
  ],
  "Dad (Gustavo)": [
    { maria: "Dad, be nice to him.", reply: "I am being nice. This is my nice face. Ask him later." },
    { maria: "We're going to take care of each other.", reply: "That is what I needed to hear. Not that he carries you — that you carry each other." },
  ],
  Andre: [
    { maria: "Calmest man in the building? Really?", reply: "That is what he wants everyone to think. I have seen the man check his cuffs six times." },
    { maria: "Thanks for showing up for him.", reply: "Showing up is the easy part. He has done the same for me for years." },
  ],
  Phillip: [
    { maria: "Bad haircuts too?", reply: "Evidence exists. I have chosen mercy because it is his wedding day." },
    { maria: "I'm glad his oldest friends are here.", reply: "We would not miss seeing the kid we knew become the man standing up there." },
  ],
  Italo: [
    { maria: "He talked about the wedding that much?", reply: "Enough that the rest of us could probably recite parts of the plan from memory." },
    { maria: "Then let's finally start it.", reply: "Please. I have been emotionally ready since breakfast." },
  ],
  Gabe: [
    { maria: "You checked the rings four times?", reply: "Five now, because you mentioned them. Still there. We are professionals." },
    { maria: "You really believe in us?", reply: "Completely. You two make commitment look less like a cage and more like getting your best teammate for life." },
  ],
  Andressa: [
    { maria: "I already feel like your sister.", reply: "Good, because I skipped the trial period. You are stuck with me now." },
    { maria: "He really smiled like that?", reply: "Every single time. It was embarrassing and adorable. Mostly adorable." },
  ],
};

function themeFor(name: string, role = "") : Theme {
  if (THEMES[name]) return THEMES[name];
  const lower = `${name} ${role}`.toLowerCase();
  if (lower.includes("pastor") || lower.includes("priest")) return { accent: "#efd27e", accent2: "#fff0b3", bg: "#211d1a", role: role || "Pastor", mark: "✦" };
  if (lower.includes("friend") || lower.includes("best man")) return { accent: "#a8c8ef", accent2: "#e7c676", bg: "#172338", role: role || "Friend", mark: "◇" };
  if (lower.includes("mother") || lower.includes("father") || lower.includes("sister") || lower.includes("brother")) return { accent: "#efb0ca", accent2: "#e8c675", bg: "#271c26", role: role || "Family", mark: "♥" };
  return { accent: "#d9bd72", accent2: "#9fcfe5", bg: "#111d2d", role: role || "Wedding Guest", mark: "✧" };
}

function fallbackChoices(name: string, index: number, total: number): Choice[] {
  if (index === 0) return [
    { maria: "I'm glad I stopped to talk.", reply: `So am I, Maria. Some parts of a journey are meant to be conversations, not checkpoints.` },
    { maria: "Tell me more.", reply: `I will. You have enough people giving you directions; you deserve a few people simply speaking from the heart.` },
  ];
  if (index === total - 1) return [
    { maria: "That means a lot to me.", reply: `Then carry it with you. The road is lighter when you remember how many people are cheering for you.` },
    { maria: "I'll see you at the wedding.", reply: `You absolutely will. Now go make the rest of us wait a little less.` },
  ];
  return [];
}

function choicesFor(name: string, role: string, index: number, total: number): Choice[] {
  const exact = CURATED[name]?.[index];
  if (exact?.length) return exact;
  const guest = GUEST_CHOICES[name];
  if (guest?.length && (index === 0 || index === total - 1)) return guest;
  return fallbackChoices(name, index, total);
}

function setStyle(el: HTMLElement, values: Record<string, string>) { Object.assign(el.style, values); }

function makeChoice(text: string, accent: string) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = `“${text}”`;
  setStyle(b, {
    width: "100%", textAlign: "left", border: `1px solid ${accent}66`, borderRadius: "13px",
    background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.96)", padding: "11px 13px",
    fontFamily: "Georgia,serif", fontSize: "13px", lineHeight: "1.42", cursor: "pointer",
    transition: "transform .14s ease,background .14s ease,border-color .14s ease",
  });
  b.onmouseenter = () => { b.style.transform = "translateX(3px)"; b.style.background = `${accent}18`; b.style.borderColor = accent; };
  b.onmouseleave = () => { b.style.transform = "translateX(0)"; b.style.background = "rgba(255,255,255,.055)"; b.style.borderColor = `${accent}66`; };
  return b;
}

function showConversation(scene: any, name: string, role: string, lines: string[], onFinish?: () => void) {
  if (!lines?.length) { onFinish?.(); return; }
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const theme = themeFor(name, role);
  const mobile = window.innerWidth < 700;
  scene.frozen = true;
  scene.physics?.pause?.();

  const overlay = document.createElement("div");
  overlay.className = "quest-global-character-dialogue";
  setStyle(overlay, {
    position: "absolute", inset: "0", zIndex: "10050", display: "flex", alignItems: mobile ? "flex-end" : "center",
    justifyContent: "center", padding: mobile ? "10px" : "24px", boxSizing: "border-box",
    background: `radial-gradient(circle at 22% 30%,${theme.accent}20,rgba(3,8,18,.84) 62%)`, backdropFilter: "blur(6px)",
  });

  const shell = document.createElement("div");
  setStyle(shell, {
    width: "min(96vw,1040px)", maxHeight: mobile ? "90vh" : "84vh", overflow: "auto", position: "relative",
    border: `2px solid ${theme.accent}bb`, borderRadius: mobile ? "18px" : "26px",
    background: `linear-gradient(145deg,${theme.bg}fa,#071221fb 72%)`,
    boxShadow: `0 28px 80px rgba(0,0,0,.58),0 0 46px ${theme.accent}20`, color: "white",
  });

  const header = document.createElement("div");
  setStyle(header, {
    display: "grid", gridTemplateColumns: mobile ? "70px 1fr" : "118px 1fr", gap: mobile ? "12px" : "18px",
    padding: mobile ? "14px 48px 12px 14px" : "20px 62px 17px 20px", borderBottom: `1px solid ${theme.accent}33`, alignItems: "center",
  });
  const crest = document.createElement("div");
  crest.textContent = theme.mark;
  setStyle(crest, {
    height: mobile ? "70px" : "110px", borderRadius: mobile ? "16px" : "22px", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: mobile ? "34px" : "52px", color: theme.accent2, border: `2px solid ${theme.accent}aa`,
    background: `radial-gradient(circle at 35% 30%,${theme.accent}40,rgba(255,255,255,.035) 68%)`, boxShadow: `inset 0 0 30px ${theme.accent}18`,
  });
  const title = document.createElement("div");
  title.innerHTML = `<div style="font-size:${mobile ? 8 : 10}px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:${theme.accent2}">A conversation on Maria's road</div><div style="font-family:Georgia,serif;font-size:${mobile ? 22 : 31}px;font-weight:800;color:${theme.accent};margin-top:3px">${name}</div><div style="font-size:${mobile ? 10 : 12}px;color:rgba(255,255,255,.62);margin-top:4px">${role || theme.role}</div>`;
  header.append(crest, title);

  const close = document.createElement("button");
  close.type = "button"; close.textContent = "×"; close.setAttribute("aria-label", `Close ${name} dialogue`);
  setStyle(close, { position: "absolute", right: "13px", top: "12px", width: "38px", height: "38px", borderRadius: "50%", border: `1px solid ${theme.accent}99`, background: "#081326e8", color: theme.accent, fontSize: "24px", cursor: "pointer", zIndex: "4" });

  const body = document.createElement("div");
  setStyle(body, { padding: mobile ? "14px" : "20px 24px 24px" });
  const progress = document.createElement("div");
  setStyle(progress, { display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,.5)", fontSize: "10px", fontWeight: "800", letterSpacing: ".15em" });
  const counter = document.createElement("span");
  const bar = document.createElement("div");
  setStyle(bar, { height: "3px", flex: "1", borderRadius: "999px", background: "rgba(255,255,255,.09)", overflow: "hidden" });
  const fill = document.createElement("div");
  setStyle(fill, { height: "100%", width: "0%", background: `linear-gradient(90deg,${theme.accent},${theme.accent2})`, transition: "width .22s ease" });
  bar.append(fill); progress.append(counter, bar);

  const speaker = document.createElement("div");
  speaker.textContent = name;
  setStyle(speaker, { marginTop: "17px", color: theme.accent, fontFamily: "Georgia,serif", fontWeight: "800", fontSize: mobile ? "14px" : "16px" });
  const line = document.createElement("div");
  setStyle(line, { marginTop: "8px", minHeight: mobile ? "72px" : "92px", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "15px" : "19px", lineHeight: "1.58", color: "rgba(255,255,255,.96)" });
  const choices = document.createElement("div");
  setStyle(choices, { display: "grid", gap: "8px", marginTop: "16px" });
  const response = document.createElement("div");
  setStyle(response, { marginTop: "14px" });
  const next = document.createElement("button");
  next.type = "button";
  setStyle(next, { display: "none", width: "100%", minHeight: "46px", marginTop: "14px", borderRadius: "13px", border: `1px solid ${theme.accent}`, background: `${theme.accent}18`, color: theme.accent2, fontWeight: "900", cursor: "pointer", letterSpacing: ".04em" });
  body.append(progress, speaker, line, choices, response, next);
  shell.append(close, header, body); overlay.append(shell); parent.append(overlay);

  let index = 0;
  let timer: number | undefined;
  const type = (text: string, target: HTMLElement, done?: () => void) => {
    if (timer) window.clearInterval(timer);
    target.textContent = "“";
    let i = 0;
    timer = window.setInterval(() => {
      i += 2;
      target.textContent = `“${text.slice(0, i)}${i >= text.length ? "”" : ""}`;
      if (i >= text.length) { window.clearInterval(timer); timer = undefined; done?.(); }
    }, 14);
  };

  const finish = () => {
    if (timer) window.clearInterval(timer);
    overlay.remove();
    scene.frozen = false;
    scene.physics?.resume?.();
    scene.stick = { x: 0, y: 0 };
    onFinish?.();
  };
  close.onclick = finish;

  const render = () => {
    choices.innerHTML = ""; response.innerHTML = ""; next.style.display = "none";
    counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(lines.length).padStart(2, "0")}`;
    fill.style.width = `${((index + 1) / lines.length) * 100}%`;
    const currentChoices = choicesFor(name, role, index, lines.length);
    type(lines[index]!, line, () => {
      if (!currentChoices.length) {
        next.textContent = index === lines.length - 1 ? "Finish conversation" : "Continue";
        next.style.display = "block";
        return;
      }
      currentChoices.forEach((opt) => {
        const b = makeChoice(opt.maria, theme.accent);
        b.onclick = () => {
          choices.innerHTML = ""; // selected option disappears immediately
          const maria = document.createElement("div");
          maria.textContent = `Maria: “${opt.maria}”`;
          setStyle(maria, { color: "rgba(255,255,255,.7)", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "13px", marginBottom: "9px" });
          const reply = document.createElement("div");
          setStyle(reply, { color: theme.accent2, fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "14px" : "16px", lineHeight: "1.5", borderLeft: `2px solid ${theme.accent}88`, paddingLeft: "10px" });
          response.append(maria, reply);
          type(opt.reply, reply, () => {
            next.textContent = index === lines.length - 1 ? "Finish conversation" : "Continue";
            next.style.display = "block";
          });
        };
        choices.append(b);
      });
    });
  };
  next.onclick = () => { if (index >= lines.length - 1) finish(); else { index += 1; render(); } };
  render();
}

function showMax(scene: any, payload: any) {
  const owned = Boolean(payload.owned);
  const line = String(payload.body ?? "Max looks up at you.");
  if (owned) return showConversation(scene, "Max", "Companion · Bram's scruffy shadow", [line]);
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const theme: Theme = { accent: "#e8c78a", accent2: "#ffe4a8", bg: "#201b17", role: "Possible companion", mark: "🐾" };
  scene.frozen = true; scene.physics?.pause?.();
  const overlay = document.createElement("div");
  setStyle(overlay, { position: "absolute", inset: "0", zIndex: "10055", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px", background: "rgba(4,9,18,.82)", backdropFilter: "blur(5px)" });
  const card = document.createElement("div");
  setStyle(card, { width: "min(92vw,620px)", border: `2px solid ${theme.accent}aa`, borderRadius: "22px", background: `linear-gradient(145deg,${theme.bg},#071221)`, boxShadow: "0 28px 70px rgba(0,0,0,.55)", color: "white", padding: "22px" });
  const title = document.createElement("div");
  title.innerHTML = `<div style="font-size:42px">🐾</div><div style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:${theme.accent}">Max</div><div style="font-size:11px;color:rgba(255,255,255,.58);letter-spacing:.12em;text-transform:uppercase">Bram's scruffy shadow</div>`;
  const body = document.createElement("p"); body.textContent = `“${line}”`; setStyle(body, { fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.58", fontSize: "16px", color: "rgba(255,255,255,.94)" });
  const actions = document.createElement("div"); setStyle(actions, { display: "grid", gap: "9px", marginTop: "16px" });
  const finish = (answer: string) => { overlay.remove(); scene.frozen = false; scene.physics?.resume?.(); scene.onCompanionChoice?.(answer); };
  const yes = makeChoice("Come with me, Max.", theme.accent); yes.onclick = () => finish("yes");
  const no = makeChoice("Stay with Bram for now.", theme.accent); no.onclick = () => finish("no");
  actions.append(yes, no); card.append(title, body, actions); overlay.append(card); parent.append(overlay);
}

export function installGlobalCharacterDialogue(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__globalCharacterDialogueInstalled) return;
  proto.__globalCharacterDialogueInstalled = true;
  const originalOpenModal = proto.openModal;
  if (typeof originalOpenModal !== "function") return;

  proto.openModal = function premiumCharacterModal(payload: any) {
    const type = String(payload?.type ?? "");
    if (type === "guest") {
      const name = String(payload.name ?? "Guest");
      if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload);
      showConversation(this, name, String(payload.role ?? "Wedding Guest"), Array.isArray(payload.lines) ? payload.lines : []);
      return;
    }
    if (type === "guidetalk") {
      const name = String(payload.name ?? "Guide");
      if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload);
      showConversation(this, name, themeFor(name).role, Array.isArray(payload.pages) ? payload.pages : [String(payload.line ?? "")]);
      return;
    }
    if (type === "weapon") {
      const name = String(payload.speaker ?? "Bram the Smith");
      if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload);
      showConversation(this, name, themeFor(name).role, [String(payload.line ?? "")]);
      return;
    }
    if (type === "andrew") {
      showConversation(this, "Andrew", THEMES.Andrew.role, [String(payload.line ?? "")]);
      return;
    }
    if (type === "companion" && String(payload.name ?? "") === "Max") {
      showMax(this, payload);
      return;
    }
    // Boss dialogue and the wedding ceremony already have native Maria-choice
    // flows with progression hooks. They are intentionally preserved rather
    // than duplicated here.
    return originalOpenModal.call(this, payload);
  };
}
