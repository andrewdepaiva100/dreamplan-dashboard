// @ts-nocheck -- Premium presentation for character-bearing quest modals.
// Dialogue choices are deliberately slide-specific: Maria never responds to
// information the character has not said yet.

const EXCLUDED = new Set([
  "Wren of the Shores", "Elara", "Pip", "Maeve", "Silas", "The Crossing Blade",
  "Evelyn", "Bram the Forgemaster",
]);

type Choice = { maria: string; reply: string };
type Theme = { accent: string; accent2: string; bg: string; role: string; mark: string };

const THEMES: Record<string, Theme> = {
  "Ivy the Gardener": { accent: "#a8d884", accent2: "#e7c76f", bg: "#10251c", role: "Keeper of the Wedding Garden", mark: "✿" },
  "Marlowe the Bellkeeper": { accent: "#9bd7ef", accent2: "#e0b45f", bg: "#102236", role: "Bellkeeper of the Haven", mark: "◈" },
  "Astra the Stargazer": { accent: "#c4b8ff", accent2: "#f1d582", bg: "#17162c", role: "Watcher of the Starry Ascent", mark: "✦" },
  "Sister Lumen": { accent: "#f0d987", accent2: "#fff4c2", bg: "#241f18", role: "Keeper of the Cathedral Light", mark: "☼" },
  "Bram the Smith": { accent: "#efb05e", accent2: "#ffd994", bg: "#291b14", role: "Blacksmith", mark: "⚒" },
  Andrew: { accent: "#ff9fc5", accent2: "#f4d37d", bg: "#241726", role: "Your person, waiting beside you", mark: "♥" },
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

const c = (maria: string, reply: string): Choice => ({ maria, reply });

// Each nested array belongs to exactly one spoken slide at the same index.
const CHOICES: Record<string, Choice[][]> = {
  "Ivy the Gardener": [
    [c("I promise I won't step on anything.", "Good. The flowers forgive quickly, but I am slower about footprints."), c("You grew all of this yourself?", "Every bed. A garden this important deserved hands in the soil, not shortcuts.")],
    [c("Andrew pictured me walking down an aisle here?", "He did. The whole place grew from that picture."), c("I noticed there aren't any mazes.", "Exactly. He wanted your path open and certain — no guessing where you stand.")],
    [c("Two relics in one garden?", "Comfort and reflection belong together. One gives you somewhere safe to land; the other helps you understand what you carried there."), c("I'll look for the envelope in the hedge.", "Look where the wind goes quiet. Some words were meant to be found gently.")],
    [c("Spring, summer, autumn, winter — four keys.", "That's the lock. Wake each season and the Conservatory will answer."), c("What should I know about the Spectre?", "She's quick. Don't let her speed convince you that panic is required.")],
    [c("I'll take the Floral Bow.", "Good. Distance can be wisdom without becoming fear."), c("And I keep the wand too?", "Every gift stays yours. Use the tool the moment asks for.")],
    [c("I'll talk to everyone I find.", "Please do. A wedding is also the people who witnessed the love becoming real."), c("Rest stone, house, guests. Got it.", "Then you're ready. Let the garden teach you at its own pace.")],
  ],
  "Marlowe the Bellkeeper": [
    [c("You weren't kidding about the noise.", "Haven has difficult days. Noise is not always danger, but it can make danger feel close."), c("Bellkeeper. So you're Marlowe?", "That's me. I know when a town needs waking — and, more importantly, when it needs quiet.")],
    [c("Andrew built a town for the ordinary years?", "The Tuesdays especially. Forever is mostly ordinary days, and those are worth building well."), c("I like that it's not about a grand moment.", "Grand moments get remembered. Ordinary kindness is what keeps a home standing.")],
    [c("Andrew is really waiting by the fountain?", "As real as this realm can hold him. Go to him before you fight anything."), c("And the patio holds the third envelope.", "Yes. Long talks leave a shape in a place, even after the chairs are empty.")],
    [c("I know that voice that says I'm behind.", "Then you know its favorite trick: repetition. Saying something often does not make it true."), c("So patience beats the Clamour.", "Exactly. You do not have to answer every accusation it throws at you.")],
    [c("I'll carry the Lightblade.", "Let it cut through noise, never through hearts."), c("I'll pay attention to the Memory Stone.", "Do. Some ordinary moments deserve to be remembered exactly.")],
  ],
  "Astra the Stargazer": [
    [c("You watched me climb the whole way?", "Every switchback. The stars make excellent witnesses."), c("Fourth land. So I'm really close.", "Close enough to see the end, and far enough to let the last stretch matter.")],
    [c("These stars are Andrew's sleepless thoughts?", "The ones he stared at too long to say aloud."), c("Then I'll walk through them with him.", "That is the answer this mountain has been waiting for.")],
    [c("No Seal, no wedding. Understood.", "Good. Clarity is useful at altitude."), c("Then the Seal is my priority.", "Exactly. Reach it patiently; panic does not make the summit closer.")],
    [c("All five pillars have to be gold together.", "Yes. One bright pillar is beautiful; five aligned pillars make a path."), c("Blue, gold, rose, then back around.", "You've got it. Watch more carefully than you rush.")],
    [c("I won't try to overpower Weariness.", "Good. Exhaustion wins when people pretend they are above needing rest."), c("I'll outlast it instead.", "Gently. Some victories look almost like slowing down.")],
    [c("I'll take the Starlight Censer.", "Carry it as a reminder that rest can be an action."), c("And I'll read the envelope at the summit.", "Do. Some words deserve that much sky around them.")],
  ],
  "Sister Lumen": [
    [c("The last land... I can finally breathe.", "Yes. Put your shoulders down. You have carried enough to get here."), c("I'll be quiet.", "Not because joy must whisper — only because some thresholds deserve to be noticed.")],
    [c("Nothing left to fight?", "Nothing. Every creature that wanted you to turn back is behind you now."), c("That feels strange after everything.", "Peace often does, when you've been braced for a long time.")],
    [c("Everyone is really inside?", "Every face that belongs to this story. They came to witness what you built together."), c("Pastor Alcir is Andrew's grandfather?", "He is — and very proud of the honor waiting for him at the altar.")],
    [c("Loyalty. The last envelope.", "Some truths need fewer words because a whole life will explain them."), c("I'll find it before I go in.", "Take the time you need. No one at that altar is going anywhere.")],
    [c("I'll take the Ring of Dawn.", "Then carry it through the doors as a reminder of everything you crossed."), c("And then I just go to Andrew.", "That's all that's left, Maria. Let him look at you.")],
  ],
  "Bram the Smith": [[c("You forged this this morning?", "Before sunrise. A road like yours deserves a blade that knows why it was made."), c("Two hundred in every swing?", "Two hundred. Enough to keep the dark off you, not enough to excuse getting careless.")]],
  Andrew: [[c("You made this for me?", "Of course. If I could put every way I want to protect you into steel, it would look something like that."), c("Then keep up with your blue one.", "Try me. I've been waiting to fight beside you instead of watching from the edge of the story."), c("I need you here more than I need the sword.", "Then take both. The sword is a gift. Me staying is the promise.")]],
  "Pastor Adriel": [
    [c("You really knew I'd make the climb?", "I had faith in you. Not because the climb was easy, but because I have seen how you keep going."), c("The stars make it feel very close now.", "You are close. Let that make you grateful, not hurried.")],
    [c("You prayed for us by name?", "Many times. Love this serious deserves prayer before it ever deserves applause."), c("Being this close feels unreal.", "Answered prayers often do when they finally stand in front of you.")],
    [c("I'll turn the pillars gold.", "And remember: agreement is not sameness. Five lights can keep their own shape and still make one path."), c("Heaven is watching?", "I believe heaven notices every promise made with a sincere heart.")],
    [c("Pastor Alcir will be waiting?", "He will. Your story is in good hands at that altar."), c("Thank you for being here too.", "There is nowhere else I would rather stand than near a story God has been kind to.")],
  ],
  "Pastor Alcir": [
    [c("We're here, Pastor.", "You are. Ready does not mean unshaken; it means willing to step forward together."), c("Keeping God at the center matters to us.", "Then keep choosing that center on ordinary mornings too. Today is the beginning, not the finish.")],
    [c("You really prayed for us for that long?", "Long enough that today feels less like a surprise and more like an answer arriving on schedule."), c("This feels like a reward to us too.", "Then receive it with gratitude, children. Joy does not need to apologize for being joyful.")],
    [c("Your knees better make it through the vows.", "These knees survived Andrew's childhood. A wedding is easy work by comparison."), c("I knew you'd have a joke ready.", "A grandfather earns certain privileges. Bad jokes are near the top of the list.")],
    [c("We'll walk forward together.", "That is the whole sermon, Maria. Keep doing that long after everyone goes home."), c("Thank you for standing with us.", "It is one of the great privileges of my life.")],
  ],
  Lorena: [
    [c("I know — it's finally real.", "I have been waiting to hear you say that without immediately talking about the next thing you have to do."), c("You sound more excited than I am.", "Impossible. I am simply louder about it.")],
    [c("Six different colors?", "Minimum six. There may have been stickers involved. This wedding has had project-management status for months."), c("Of course you color-coded it.", "You know me. Important events deserve excessive stationery.")],
    [c("I won't let a river monster stop me.", "Good. Wedding nerves, river monsters, bad shoes — whatever shows up, I am in your corner."), c("I'll see you at the aisle.", "You absolutely will. Now go make the rest of us wait a little less.")],
  ],
  Alicia: [
    [c("It really does look dressed for a wedding.", "Exactly! Even the flowers understood the assignment."), c("I think the garden is showing off.", "It has every right to. Look at this place.")],
    [c("You already cried twice?", "Twice that I am admitting to. Bridesmaid confidentiality covers the rest."), c("Save some tears for the ceremony.", "No promises. I have a schedule and apparently crying is on every page.")],
    [c("You've been my person forever too.", "And I plan to keep the job after you are married. Andrew does not get exclusive rights to you."), c("I'm glad you're here to see this.", "There is nowhere else I would be.")],
  ],
  Pedro: [
    [c("Yes — for REAL for real.", "Okay, good, because I already told everyone. That would have been awkward."), c("Why do you sound surprised?", "Because weddings always sounded like a grown-up thing, and somehow my sister is doing one now!")],
    [c("You really agreed to nice shoes?", "For you. Historic sacrifice. Please make sure everyone knows."), c("Only this once?", "Maybe twice if there's cake involved. I refuse to commit beyond that.")],
    [c("Almost as cool as you?", "Correct. I am willing to negotiate Andrew up to ninety-eight percent after the ceremony."), c("I'll tell Andrew you approve.", "Tell him the official little-brother review is very positive. Almost perfect.")],
  ],
  Gianluca: [
    [c("They're talking about the wedding up here too?", "Everywhere. At this point the mountain probably knows the seating chart."), c("I guess there's no escaping it now.", "Not a chance. You two are the headline today.")],
    [c("I'm glad you're genuinely excited.", "I am. You two make commitment look like having your best teammate for life."), c("Easy is generous.", "Fair. Maybe not easy — just worth choosing again and again.")],
    [c("Save me that seat.", "Front row if I can get away with it — though you're supposed to be at the altar."), c("I'll get to the church.", "Good. Andrew has done enough waiting for one lifetime.")],
  ],
  "Mom (Raquel)": [
    [c("You can cry, Mom.", "I know, sweetheart. I just hoped to make it through one sentence first."), c("He really is getting married.", "My baby boy, somehow grown into the man standing here today.")],
    [c("Thank you for praying for me too.", "You were an answer before anyone printed an invitation."), c("I love him so much.", "I know. A mother can see when her child is safely loved.")],
    [c("Go ahead and cry.", "There it is. I knew I wasn't making it through this conversation."), c("I'm excited too.", "Then come here before we both ruin ourselves before the ceremony.")],
  ],
  "Dad (Marcos)": [
    [c("He does look sharp.", "Don't tell him I said it twice. A father has a reputation to maintain."), c("You should be proud of him.", "I am — more for the man than the suit.")],
    [c("He keeps earning my choice.", "Good. Love should never become an excuse to stop being worthy of each other's trust."), c("I chose well too.", "Then keep choosing well on the ordinary days. Those are the ones that count.")],
    [c("Best day in the family?", "So far. I expect you two to give us plenty of competition in the years ahead."), c("We're excited too.", "Good. Go enjoy it. You worked hard enough to reach today.")],
  ],
  "Mom (Silvia)": [
    [c("Mom, you're going to make me cry.", "Then we can ruin our makeup together and call it a family tradition."), c("I feel like I'm glowing.", "You are. A mother knows that kind of light.")],
    [c("He really was already family, wasn't he?", "The right people arrive before the paperwork catches up."), c("Officially sounds pretty good.", "It does. Though he has been ours for a while now.")],
    [c("A whole week without sleep?", "Worth every tired minute. I would do it again."), c("I'm so excited too.", "I know, meu amor. Go live the day you've been waiting for.")],
  ],
  "Dad (Gustavo)": [
    [c("Dad, be nice to him.", "I am being nice. This is my nice face. Ask him later."), c("He is brave, isn't he?", "Brave enough to join this family. That already tells me something.")],
    [c("We're going to take care of each other.", "That is what I needed to hear. Not that he carries you — that you carry each other."), c("He will, Dad.", "I can see it. That's why I'm smiling instead of interrogating him.")],
    [c("One big loud family.", "Exactly. Loud enough that neither of you will ever wonder whether you're loved."), c("I couldn't be happier either.", "Then let's not keep the happy part waiting.")],
  ],
  Andre: [
    [c("Calmest man in the building? Really?", "That's what he wants everyone to think. I've seen him check his cuffs six times."), c("The suit is convincing.", "The suit is doing heroic work.")],
    [c("Thanks for showing up for him.", "Showing up is easy. He's done the same for me for years."), c("He's been waiting a long time.", "Long enough. Today he finally gets to stop waiting.")],
    [c("You couldn't sleep either?", "Apparently wedding excitement is contagious."), c("Let's get us married, then.", "Please. Before Andrew checks those cuffs a seventh time.")],
  ],
  Phillip: [
    [c("Bad haircuts too?", "Evidence exists. I have chosen mercy because it's his wedding day."), c("You've really known him forever.", "Long enough to know exactly how much today means to him.")],
    [c("The real deal?", "Everyone in this room can see it. You don't have to sell anybody on you two."), c("That means a lot.", "Good. Let it. People are allowed to be happy for you.")],
    [c("I'm glad his oldest friends are here.", "We wouldn't miss seeing the kid we knew become the man standing up there."), c("I'll go find him.", "Go on. He's waited long enough.")],
  ],
  Italo: [
    [c("You've been counting down too?", "For months. At this point I could probably tell you the number of hours."), c("It really is finally here.", "Finally. No more planning — now you get to live it.")],
    [c("He talked about the wedding that much?", "Enough that the rest of us could probably recite parts of the plan from memory."), c("That sounds like Andrew.", "Exactly. Once he cares about something, good luck getting him to pretend he doesn't.")],
    [c("Then let's finally start it.", "Please. I have been emotionally ready since breakfast."), c("I'm excited too.", "Good. That's the only correct mood today.")],
  ],
  Gabe: [
    [c("You checked the rings four times?", "Five now, because you mentioned them. Still there. We are professionals."), c("Best day of six years?", "Easily. I've never seen him happier or more certain.")],
    [c("You really believe in us?", "Completely. You two make commitment look less like a cage and more like getting your best teammate for life."), c("I didn't know we had that effect.", "You do. People notice the way you choose each other.")],
    [c("Best day of the year?", "Easy call. Ask me again after the cake and it'll be unanimous."), c("Then let's get to the wedding.", "Rings accounted for. Best man adjacent. We're ready.")],
  ],
  Andressa: [
    [c("I already feel like your sister.", "Good, because I skipped the trial period. You are stuck with me now."), c("I've been waiting for this too.", "Then today belongs to both sides of the family becoming one.")],
    [c("He really smiled like that every time?", "Every single time. Embarrassing and adorable. Mostly adorable."), c("He talked about me forever?", "Forever. You were basically a recurring character before I properly knew you.")],
    [c("I love you too.", "Good. That's settled. Official sister status begins immediately."), c("I'm happy to join your family.", "And we're happy you're joining us. No fine print.")],
  ],
};

function themeFor(name: string, role = ""): Theme {
  if (THEMES[name]) return THEMES[name];
  const lower = `${name} ${role}`.toLowerCase();
  if (/pastor|priest/.test(lower)) return { accent: "#efd27e", accent2: "#fff0b3", bg: "#211d1a", role: role || "Pastor", mark: "✦" };
  if (/friend|best man/.test(lower)) return { accent: "#a8c8ef", accent2: "#e7c676", bg: "#172338", role: role || "Friend", mark: "◇" };
  if (/mother|father|sister|brother/.test(lower)) return { accent: "#efb0ca", accent2: "#e8c675", bg: "#271c26", role: role || "Family", mark: "♥" };
  return { accent: "#d9bd72", accent2: "#9fcfe5", bg: "#111d2d", role: role || "Wedding Guest", mark: "✧" };
}

function choicesFor(name: string, index: number, total: number): Choice[] {
  const exact = CHOICES[name]?.[index];
  if (exact) return exact;
  if (index === 0) return [c("I'm glad I stopped to talk.", "So am I, Maria. Some parts of a journey are meant to be conversations, not checkpoints."), c("Tell me more.", "I will. Take your time — there is no need to rush this conversation.")];
  if (index === total - 1) return [c("That means a lot to me.", "Then carry it with you. You have more people cheering for you than you know."), c("Thank you.", "Always. Now keep going when you're ready.")];
  return [];
}

function setStyle(el: HTMLElement, values: Record<string, string>) { Object.assign(el.style, values); }

function makeChoice(text: string, accent: string) {
  const b = document.createElement("button");
  b.type = "button"; b.textContent = `“${text}”`;
  setStyle(b, { width: "100%", textAlign: "left", border: `1px solid ${accent}66`, borderRadius: "13px", background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.96)", padding: "11px 13px", fontFamily: "Georgia,serif", fontSize: "13px", lineHeight: "1.42", cursor: "pointer", transition: "transform .14s ease,background .14s ease,border-color .14s ease" });
  b.onmouseenter = () => { b.style.transform = "translateX(3px)"; b.style.background = `${accent}18`; b.style.borderColor = accent; };
  b.onmouseleave = () => { b.style.transform = "translateX(0)"; b.style.background = "rgba(255,255,255,.055)"; b.style.borderColor = `${accent}66`; };
  return b;
}

function showConversation(scene: any, name: string, role: string, lines: string[], onFinish?: () => void) {
  if (!lines?.length) { onFinish?.(); return; }
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const theme = themeFor(name, role); const mobile = window.innerWidth < 700;
  scene.frozen = true; scene.physics?.pause?.();
  const overlay = document.createElement("div"); overlay.className = "quest-global-character-dialogue";
  setStyle(overlay, { position: "absolute", inset: "0", zIndex: "10050", display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center", padding: mobile ? "10px" : "24px", boxSizing: "border-box", background: `radial-gradient(circle at 22% 30%,${theme.accent}20,rgba(3,8,18,.9) 62%)` });
  const shell = document.createElement("div");
  setStyle(shell, { width: "min(96vw,1040px)", maxHeight: mobile ? "90vh" : "84vh", overflow: "auto", position: "relative", border: `2px solid ${theme.accent}bb`, borderRadius: mobile ? "18px" : "26px", background: `linear-gradient(145deg,${theme.bg}fa,#071221fb 72%)`, boxShadow: `0 24px 64px rgba(0,0,0,.52),0 0 32px ${theme.accent}18`, color: "white", transform: "translateZ(0)" });
  const header = document.createElement("div");
  setStyle(header, { display: "grid", gridTemplateColumns: mobile ? "70px 1fr" : "118px 1fr", gap: mobile ? "12px" : "18px", padding: mobile ? "14px 48px 12px 14px" : "20px 62px 17px 20px", borderBottom: `1px solid ${theme.accent}33`, alignItems: "center" });
  const crest = document.createElement("div"); crest.textContent = theme.mark;
  setStyle(crest, { height: mobile ? "70px" : "110px", borderRadius: mobile ? "16px" : "22px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: mobile ? "34px" : "52px", color: theme.accent2, border: `2px solid ${theme.accent}aa`, background: `radial-gradient(circle at 35% 30%,${theme.accent}40,rgba(255,255,255,.035) 68%)` });
  const title = document.createElement("div"); title.innerHTML = `<div style="font-size:${mobile ? 8 : 10}px;letter-spacing:.22em;text-transform:uppercase;font-weight:900;color:${theme.accent2}">A conversation on Maria's road</div><div style="font-family:Georgia,serif;font-size:${mobile ? 22 : 31}px;font-weight:800;color:${theme.accent};margin-top:3px">${name}</div><div style="font-size:${mobile ? 10 : 12}px;color:rgba(255,255,255,.62);margin-top:4px">${role || theme.role}</div>`;
  header.append(crest, title);
  const close = document.createElement("button"); close.type = "button"; close.textContent = "×"; close.setAttribute("aria-label", `Close ${name} dialogue`);
  setStyle(close, { position: "absolute", right: "13px", top: "12px", width: "38px", height: "38px", borderRadius: "50%", border: `1px solid ${theme.accent}99`, background: "#081326e8", color: theme.accent, fontSize: "24px", cursor: "pointer", zIndex: "4" });
  const body = document.createElement("div"); setStyle(body, { padding: mobile ? "14px" : "20px 24px 24px" });
  const progress = document.createElement("div"); setStyle(progress, { display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,.5)", fontSize: "10px", fontWeight: "800", letterSpacing: ".15em" });
  const counter = document.createElement("span"), bar = document.createElement("div"), fill = document.createElement("div");
  setStyle(bar, { height: "3px", flex: "1", borderRadius: "999px", background: "rgba(255,255,255,.09)", overflow: "hidden" }); setStyle(fill, { height: "100%", width: "0%", background: `linear-gradient(90deg,${theme.accent},${theme.accent2})`, transition: "width .22s ease" }); bar.append(fill); progress.append(counter, bar);
  const speaker = document.createElement("div"); speaker.textContent = name; setStyle(speaker, { marginTop: "17px", color: theme.accent, fontFamily: "Georgia,serif", fontWeight: "800", fontSize: mobile ? "14px" : "16px" });
  const line = document.createElement("div"); setStyle(line, { marginTop: "8px", minHeight: mobile ? "72px" : "92px", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "15px" : "19px", lineHeight: "1.58", color: "rgba(255,255,255,.96)" });
  const choices = document.createElement("div"); setStyle(choices, { display: "grid", gap: "8px", marginTop: "16px" }); const response = document.createElement("div"); setStyle(response, { marginTop: "14px" });
  const next = document.createElement("button"); next.type = "button"; setStyle(next, { display: "none", width: "100%", minHeight: "46px", marginTop: "14px", borderRadius: "13px", border: `1px solid ${theme.accent}`, background: `${theme.accent}18`, color: theme.accent2, fontWeight: "900", cursor: "pointer", letterSpacing: ".04em" });
  body.append(progress, speaker, line, choices, response, next); shell.append(close, header, body); overlay.append(shell); parent.append(overlay);

  let index = 0, raf = 0, token = 0;
  // rAF keeps typing synchronized with paint and caps DOM writes to ~30fps,
  // instead of waking the main thread every 14ms with setInterval.
  const type = (text: string, target: HTMLElement, done?: () => void) => {
    token += 1; const mine = token; if (raf) cancelAnimationFrame(raf); target.textContent = "“"; const start = performance.now(); let last = -1;
    const tick = (now: number) => { if (mine !== token) return; const count = Math.min(text.length, Math.floor((now - start) / 12)); if (count !== last) { last = count; target.textContent = `“${text.slice(0, count)}${count >= text.length ? "”" : ""}`; } if (count < text.length) raf = requestAnimationFrame(tick); else { raf = 0; done?.(); } };
    raf = requestAnimationFrame(tick);
  };
  const finish = () => { token += 1; if (raf) cancelAnimationFrame(raf); overlay.remove(); scene.frozen = false; scene.physics?.resume?.(); scene.stick = { x: 0, y: 0 }; onFinish?.(); };
  close.onclick = finish;
  const render = () => {
    choices.innerHTML = ""; response.innerHTML = ""; next.style.display = "none"; counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(lines.length).padStart(2, "0")}`; fill.style.width = `${((index + 1) / lines.length) * 100}%`;
    const current = choicesFor(name, index, lines.length);
    type(lines[index]!, line, () => {
      if (!current.length) { next.textContent = index === lines.length - 1 ? "Finish conversation" : "Continue"; next.style.display = "block"; return; }
      current.forEach((opt) => { const b = makeChoice(opt.maria, theme.accent); b.onclick = () => { choices.innerHTML = ""; const maria = document.createElement("div"); maria.textContent = `Maria: “${opt.maria}”`; setStyle(maria, { color: "rgba(255,255,255,.7)", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "13px", marginBottom: "9px" }); const reply = document.createElement("div"); setStyle(reply, { color: theme.accent2, fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "14px" : "16px", lineHeight: "1.5", borderLeft: `2px solid ${theme.accent}88`, paddingLeft: "10px" }); response.append(maria, reply); type(opt.reply, reply, () => { next.textContent = index === lines.length - 1 ? "Finish conversation" : "Continue"; next.style.display = "block"; }); }; choices.append(b); });
    });
  };
  next.onclick = () => { if (index >= lines.length - 1) finish(); else { index += 1; render(); } }; render();
}

function showMax(scene: any, payload: any) {
  const owned = Boolean(payload.owned), line = String(payload.body ?? "Max looks up at you."); if (owned) return showConversation(scene, "Max", "Companion · Bram's scruffy shadow", [line]);
  const parent = scene.game?.canvas?.parentElement ?? document.body; const accent = "#e8c78a"; scene.frozen = true; scene.physics?.pause?.();
  const overlay = document.createElement("div"); setStyle(overlay, { position: "absolute", inset: "0", zIndex: "10055", display: "flex", alignItems: "center", justifyContent: "center", padding: "18px", background: "rgba(4,9,18,.9)" });
  const card = document.createElement("div"); setStyle(card, { width: "min(92vw,620px)", border: `2px solid ${accent}aa`, borderRadius: "22px", background: "linear-gradient(145deg,#201b17,#071221)", boxShadow: "0 24px 60px rgba(0,0,0,.5)", color: "white", padding: "22px" });
  const title = document.createElement("div"); title.innerHTML = `<div style="font-size:42px">🐾</div><div style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:${accent}">Max</div><div style="font-size:11px;color:rgba(255,255,255,.58);letter-spacing:.12em;text-transform:uppercase">Bram's scruffy shadow</div>`;
  const body = document.createElement("p"); body.textContent = `“${line}”`; setStyle(body, { fontFamily: "Georgia,serif", fontStyle: "italic", lineHeight: "1.58", fontSize: "16px" }); const actions = document.createElement("div"); setStyle(actions, { display: "grid", gap: "9px", marginTop: "16px" });
  const finish = (answer: string) => { overlay.remove(); scene.frozen = false; scene.physics?.resume?.(); scene.onCompanionChoice?.(answer); }; const yes = makeChoice("Come with me, Max.", accent), no = makeChoice("Stay with Bram for now.", accent); yes.onclick = () => finish("yes"); no.onclick = () => finish("no"); actions.append(yes, no); card.append(title, body, actions); overlay.append(card); parent.append(overlay);
}

export function installGlobalCharacterDialogue(QuestScene: any) {
  const proto = QuestScene?.prototype; if (!proto || proto.__globalCharacterDialogueInstalled) return; proto.__globalCharacterDialogueInstalled = true; const originalOpenModal = proto.openModal; if (typeof originalOpenModal !== "function") return;
  proto.openModal = function premiumCharacterModal(payload: any) {
    const type = String(payload?.type ?? "");
    if (type === "guest") { const name = String(payload.name ?? "Guest"); if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload); showConversation(this, name, String(payload.role ?? "Wedding Guest"), Array.isArray(payload.lines) ? payload.lines : []); return; }
    if (type === "guidetalk") { const name = String(payload.name ?? "Guide"); if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload); showConversation(this, name, themeFor(name).role, Array.isArray(payload.pages) ? payload.pages : [String(payload.line ?? "")]); return; }
    if (type === "weapon") { const name = String(payload.speaker ?? "Bram the Smith"); if (EXCLUDED.has(name)) return originalOpenModal.call(this, payload); showConversation(this, name, themeFor(name).role, [String(payload.line ?? "")]); return; }
    if (type === "andrew") { showConversation(this, "Andrew", THEMES.Andrew.role, [String(payload.line ?? "")]); return; }
    if (type === "companion" && String(payload.name ?? "") === "Max") { showMax(this, payload); return; }
    return originalOpenModal.call(this, payload);
  };
}
