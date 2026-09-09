// @ts-nocheck -- Act III Andrew conversation presentation only. No quest state is changed here.

type Reply = { maria: string; andrew: string };
type Beat = { andrew: string; replies: Reply[] };

const ZONE = "the_haven";
const FIRST_SWORD_LINE =
  "I made this sword for you — I thought you might need it. Rose-pink, because that is what you are to me. I kept the blue one, so wherever this road goes, I'm swinging right beside you.";

function setStyle(el: HTMLElement, values: Record<string, string>) { Object.assign(el.style, values); }
const r = (maria: string, andrew: string): Reply => ({ maria, andrew });

function openingBeats(): Beat[] {
  return [
    {
      andrew: "Maria... there you are. I know I was supposed to be waiting for you at the Cathedral. I promise I'll explain. But first — I have something for you. A sword. Yours, if you'll take it.",
      replies: [
        r("You came back and brought me a sword?", "I know that sounds like a very Andrew way to make an entrance. But yes. I wanted you to have something that felt like me standing beside you, even when the road puts a little distance between us."),
        r("I was wondering why my groom wasn't where he promised to be.", "Your groom is guilty. Completely. But he missed you, he has a very good explanation, and he brought a present. I'm hoping at least one of those helps my case."),
        r("I'm just happy to see you.", "Come here. That's all I wanted to hear for one second. I have been trying to be useful and brave and responsible, but mostly I've just been hoping you'd walk into this square."),
      ],
    },
    {
      andrew: "I call it the Love Sword. Mine has its blue twin, and this one is yours. Not because I think you need rescuing — I've met you, remember? — but because loving you has never meant standing in front of you. It means standing with you.",
      replies: [
        r("Then I'll carry it like you're beside me.", "That's exactly what I hoped you'd say. And when you swing it, imagine me somewhere nearby being extremely impressed and pretending I wasn't worried at all."),
        r("You really made us matching swords?", "Of course I did. We are getting married. Matching swords felt like a perfectly reasonable extension of matching a life."),
        r("I don't need rescuing. But I do need you.", "Good. Because I never want to be your hero from a distance. I want to be your person up close — the one who listens, stays, apologizes, laughs with you, and keeps choosing you."),
      ],
    },
    {
      andrew: "There's something I wanted the sword to say better than I can: I trust you. I trust your strength, your heart, and the way you keep moving without becoming hard. Whatever waits on the rest of this road, you don't have to prove anything to me.",
      replies: [
        r("You always know what I need to hear.", "Not always. But I plan to spend a lifetime learning. And when I get it wrong, you can tell me and I'll try again."),
        r("I trust you too.", "That means more to me than any grand promise I could make in a square. Keep trusting me with the ordinary things too. Those are the ones I want most."),
        r("Careful. You're going to make me cry before the wedding.", "Then I'll take responsibility for the first tear and spend the rest of the day trying to earn the happy ones."),
      ],
    },
    {
      andrew: "Now... about why I'm here instead of behaving like a groom and waiting patiently at the Cathedral. The wedding melody was being carried ahead for the ceremony. When the disturbance hit Haven, three pages tore free and scattered across town.",
      replies: [
        r("Three pages of our song are somewhere in Haven?", "Three. I found where the trail began, but the Clamour rose around Town Hall before I could recover them. I couldn't leave our song broken and pretend it didn't matter."),
        r("So that's what pulled you away from the Cathedral.", "Yes. I know a few sheets of paper shouldn't outweigh a promise. But this wasn't me running from where I'm supposed to be. It was me trying to carry something precious there with us."),
        r("You came back because it's ours.", "Exactly. Not because the paper is sacred. Because we chose that melody together, and I want to hear every note when I see you coming toward me."),
      ],
    },
    {
      andrew: "I kept thinking about the ceremony without those pages. We could have managed. We could have laughed about it. But I know us — we'd always remember the missing notes. So I turned around. Maybe that's marriage too: noticing what's been scattered and caring enough to go back for it.",
      replies: [
        r("Then we'll put it back together.", "One page at a time. And someday, when something harder than music gets scattered, we'll do the same thing. No keeping score. No leaving the other person alone with the pieces."),
        r("I love that you cared this much.", "I care this much about everything that becomes ours. The song, the home, the ridiculous grocery list on a Tuesday, all of it. Especially you."),
        r("You know I would've married you without the music.", "I know. I'd marry you in complete silence. But if I can give you the song too, let me give you the song."),
      ],
    },
    {
      andrew: "The Clamour is the part I didn't expect. It found every quiet doubt in this town and made it loud. It keeps saying I'm not enough for you, that I'll disappoint you, that one day you'll look at me and wonder why you chose me.",
      replies: [
        r("Andrew, I choose you. Not some perfect version of you.", "I know. I do know. Sometimes fear is just louder than what I know. Hearing you say it helps me remember which voice deserves to stay."),
        r("You don't have to be enough all by yourself.", "That's one of the reasons I love you. You never make love sound like an exam I have to pass. You make it sound like a place we both keep showing up to."),
        r("Then let it talk. It doesn't get to decide for us.", "There she is. My favorite person in every realm. You're right. It can be loud. It still doesn't get a vote."),
      ],
    },
    {
      andrew: "Find the three pages for me, love. I'll hold this part of the square steady and keep the Clamour from swallowing the whole town. Bring our melody back, and we'll remind it that fear can make noise without becoming truth.",
      replies: [
        r("I'll bring our song home to you.", "And I'll be right here when you do. No matter which street you take, come back to me."),
        r("Only if you promise to stay safe.", "I promise to be sensible, which is almost the same thing. And I promise I won't try to be brave in any way that would make you roll your eyes at me."),
        r("Hold my place. I'll be back.", "Always. Your place with me isn't something you can lose by walking away for a while."),
      ],
    },
    {
      andrew: "And when we've finished this, I'm going ahead to the Cathedral. No more detours. The next time you find me waiting, I'll be exactly where I promised — probably trying not to cry before you even reach the altar.",
      replies: [
        r("You are absolutely going to cry.", "Completely. I've accepted it. My only remaining goal is to make it look dignified for at least three seconds."),
        r("Then wait for me there.", "With everything I have. Take the road at your pace, Maria. I don't need you to hurry toward forever."),
        r("I love you, Andrew.", "I love you too. In every loud place, every quiet place, every ordinary day after this one. Now go find our song, future wife."),
      ],
    },
  ];
}

function progressBeats(line: string): Beat[] {
  if (/1\/3 pages/.test(line)) return [
    { andrew: "One page. Look at you. I knew the first piece would find its way back to us.", replies: [r("Two more and our song is whole.", "Two more. No rush, love. I would rather wait for you than have you turn the search into another thing you think you have to do perfectly."), r("I wanted to bring you something back quickly.", "You already brought yourself back to me. The page is a lovely bonus."), r("Haven really did hide it well.", "Haven has always tucked important things into ordinary corners. Maybe it knows that's where we tend to find each other too.")] },
    { andrew: "Keep the page safe. I can almost hear where it belongs — like the melody noticed a missing piece came home.", replies: [r("I'll find the next one.", "I know you will. And I'll still be here when you need a quiet minute between searches."), r("You really can hear it already?", "In my head, yes. Though to be fair, your song has been stuck in my head for a very long time."), r("Save the humming for when I get back.", "Deal. But I'm making no promises about smiling like an idiot while I wait.")] },
  ];
  if (/2\/3 pages/.test(line)) return [
    { andrew: "Two pages. Maria, we're one note away from turning this whole detour into a story we'll laugh about for the rest of our lives.", replies: [r("Just one more.", "Just one. And then I get to hear the whole thing with you standing here beside me."), r("I think I already like this story.", "Me too. Mostly the part where you keep coming back to the fountain and I get to see you again."), r("We are definitely telling this story at the reception.", "Only if you leave out the part where the groom abandoned his assigned Cathedral position to chase sheet music.")] },
    { andrew: "Don't rush the last page because it's the last one. Take your time. I want you safe more than I want any song completed.", replies: [r("I promise.", "Thank you. That's all I need."), r("You worry sweetly, you know that?", "I've had years of practice. I'm hoping marriage eventually earns me an advanced certification."), r("And I want you safe too.", "Then we have a deal. We both make it to the Cathedral. Everything else is details.")] },
  ];
  if (line.includes("found every last page")) return [
    { andrew: "You found every last page. Come here. For a second, forget the square, forget the Clamour, forget every road still ahead. You brought our song back.", replies: [r("We brought it back.", "We did. You carried the pages, I kept believing you'd return, and somehow that feels very us."), r("I told you I'd come back to you.", "You did. And I hope neither of us ever gets too used to the miracle of hearing the other person keep a promise."), r("Play it for me.", "Gladly. I've been hearing the missing notes in my head since you walked away.")] },
    { andrew: "Listen. That's it. That's the melody I hear when I think about you — not because everything with us is perfect, but because even the difficult notes keep resolving into home.", replies: [r("Home sounds pretty beautiful.", "It does when it's you."), r("I'm going to remember this at the altar.", "So am I. If I look overwhelmed when the music starts, you'll know exactly why."), r("You are being dangerously sweet right now.", "I have a limited window before I have to go be a dignified groom. I'm using it irresponsibly.")] },
    { andrew: "Take the Shield of Unshakable Faith. Not because we'll never doubt, but because I believe in what we do when doubt arrives: we tell the truth, we stay kind, we turn toward each other instead of away.", replies: [r("That's the kind of faith I want with you.", "Me too. Not blind certainty. The kind we build by choosing each other honestly, over and over."), r("Then I'll carry your faith with me.", "And I'll carry yours. That's how this is supposed to work."), r("No turning away.", "No turning away. Even when we need a minute, we find our way back.")] },
    { andrew: "Now I really am going to the Cathedral. I have a promise to keep and a place to stand. When you get there, don't look for anyone else first. Look for me.", replies: [r("I'll find you.", "I know. I think I'd find you in any crowd, in any realm, in any life."), r("No more leaving the Cathedral.", "No more leaving the Cathedral. You have my official groom's word."), r("Go wait for your bride.", "Gladly. I have been waiting for her for a long time. A little longer is easy.")] },
  ];
  if (line.includes("melody is ours now")) return [
    { andrew: "The melody is ours now. Whenever the world gets loud, hum it and remember I'm right here — even when the road puts us in different places for a little while.", replies: [r("I'll remember.", "Good. And I'll do the same whenever I need reminding that the best part of every road is who I'm walking toward."), r("You're supposed to be at the Cathedral, mister.", "I know, I know. Consider this my final unauthorized fountain appearance."), r("I love our song.", "I love what it means more. It keeps finding its way back to us.")] },
  ];
  return [{ andrew: line, replies: [r("I'm with you.", "That's the part I never doubt."), r("We'll finish this together.", "Together. Even when one of us has to walk a few steps ahead.")] }];
}

function beatsFor(line: string, firstTalk: boolean): Beat[] {
  if (firstTalk || line === FIRST_SWORD_LINE) return openingBeats();
  return progressBeats(line);
}

function makeAndrewPortrait(scene: any): HTMLElement | null {
  const andrew = scene.interactables?.find?.((it: any) => it?.kind === "andrew" && it?.obj?.active);
  const sprite = andrew?.obj;
  const frame = sprite?.frame;
  const source = frame?.source?.image;
  if (!frame || !source) return null;

  const portrait = document.createElement("div");
  portrait.className = "quest-act3-andrew-portrait";
  setStyle(portrait, {
    width: "108px", height: "108px", flex: "0 0 108px", borderRadius: "24px",
    border: "2px solid rgba(255,159,197,.82)", background: "radial-gradient(circle,rgba(255,159,197,.2),rgba(7,18,33,.97))",
    boxShadow: "0 10px 28px rgba(0,0,0,.38),0 0 22px rgba(255,159,197,.16)", display: "grid", placeItems: "center", overflow: "hidden"
  });
  const canvas = document.createElement("canvas");
  canvas.width = 108; canvas.height = 108;
  setStyle(canvas, { width: "100px", height: "100px", imageRendering: "pixelated" });
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.imageSmoothingEnabled = false;
  const sw = frame.cutWidth ?? frame.width;
  const sh = frame.cutHeight ?? frame.height;
  const scale = Math.min(86 / sw, 86 / sh);
  const dw = sw * scale, dh = sh * scale;
  ctx.drawImage(source, frame.cutX ?? 0, frame.cutY ?? 0, sw, sh, (108 - dw) / 2, 108 - dh - 8, dw, dh);
  portrait.append(canvas);
  return portrait;
}

function showAndrew(scene: any, line: string, firstTalk = false) {
  const beats = beatsFor(line, firstTalk);
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const mobile = window.innerWidth < 700;
  scene.frozen = true; scene.physics?.pause?.();

  const overlay = document.createElement("div"); overlay.className = "quest-act3-andrew-dialogue";
  setStyle(overlay, { position: "absolute", inset: "0", zIndex: "10070", display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center", padding: mobile ? "10px" : "24px", boxSizing: "border-box", background: "radial-gradient(circle at 25% 28%,rgba(255,159,197,.16),rgba(3,8,18,.91) 64%)" });
  const card = document.createElement("div");
  setStyle(card, { width: "min(96vw,900px)", maxHeight: mobile ? "91vh" : "84vh", overflow: "auto", border: "2px solid rgba(255,159,197,.72)", borderRadius: mobile ? "18px" : "26px", background: "linear-gradient(145deg,rgba(36,23,38,.99),rgba(7,18,33,.99) 74%)", boxShadow: "0 24px 64px rgba(0,0,0,.55),0 0 34px rgba(255,159,197,.12)", color: "white", padding: mobile ? "18px" : "26px", boxSizing: "border-box" });

  const header = document.createElement("div");
  setStyle(header, { display: "flex", alignItems: "center", gap: mobile ? "14px" : "20px" });
  const portrait = makeAndrewPortrait(scene);
  if (portrait) header.append(portrait);
  const headerCopy = document.createElement("div"); setStyle(headerCopy, { minWidth: "0", flex: "1" });
  const eyebrow = document.createElement("div"); eyebrow.textContent = "A CONVERSATION IN THE HAVEN"; setStyle(eyebrow, { fontSize: "10px", letterSpacing: ".2em", fontWeight: "900", color: "#f4d37d" });
  const title = document.createElement("div"); title.textContent = "♥  Andrew"; setStyle(title, { marginTop: "5px", fontFamily: "Georgia,serif", fontSize: mobile ? "25px" : "32px", fontWeight: "800", color: "#ff9fc5" });
  const role = document.createElement("div"); role.textContent = "Your person · here for the song before returning to the Cathedral"; setStyle(role, { marginTop: "4px", fontSize: "11px", color: "rgba(255,255,255,.58)" });
  headerCopy.append(eyebrow, title, role); header.append(headerCopy);

  const progress = document.createElement("div"); setStyle(progress, { marginTop: "17px", fontSize: "10px", letterSpacing: ".14em", fontWeight: "900", color: "rgba(255,255,255,.4)" });
  const speech = document.createElement("div"); setStyle(speech, { marginTop: "12px", minHeight: "76px", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "15px" : "19px", lineHeight: "1.58", color: "rgba(255,255,255,.96)" });
  const prompt = document.createElement("div"); prompt.textContent = "Maria responds"; setStyle(prompt, { marginTop: "20px", marginBottom: "9px", fontSize: "10px", letterSpacing: ".14em", fontWeight: "900", color: "rgba(255,255,255,.48)", textTransform: "uppercase" });
  const choices = document.createElement("div"); setStyle(choices, { display: "grid", gap: "9px" });
  const response = document.createElement("div"); setStyle(response, { marginTop: "15px" });
  const next = document.createElement("button"); next.type = "button"; setStyle(next, { display: "none", width: "100%", minHeight: "46px", marginTop: "15px", borderRadius: "13px", border: "1px solid #ff9fc5", background: "rgba(255,159,197,.1)", color: "#f4d37d", fontWeight: "900", cursor: "pointer" });

  let index = 0;
  const close = () => { overlay.remove(); scene.frozen = false; scene.physics?.resume?.(); scene.stick = { x: 0, y: 0 }; scene.onResume?.(); };
  const render = () => {
    const beat = beats[index]; response.innerHTML = ""; choices.innerHTML = ""; next.style.display = "none";
    progress.textContent = `${String(index + 1).padStart(2, "0")} / ${String(beats.length).padStart(2, "0")}`;
    speech.textContent = `“${beat.andrew}”`;
    for (const option of beat.replies) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = `“${option.maria}”`;
      setStyle(button, { width: "100%", textAlign: "left", border: "1px solid rgba(255,159,197,.38)", borderRadius: "13px", background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.96)", padding: "11px 13px", fontFamily: "Georgia,serif", fontSize: "13px", lineHeight: "1.42", cursor: "pointer" });
      button.onclick = () => {
        choices.innerHTML = "";
        const maria = document.createElement("div"); maria.textContent = `Maria: “${option.maria}”`; setStyle(maria, { color: "rgba(255,255,255,.72)", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "13px" });
        const andrew = document.createElement("div"); andrew.textContent = `Andrew: “${option.andrew}”`; setStyle(andrew, { marginTop: "9px", color: "#f4d37d", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "14px" : "16px", lineHeight: "1.5", borderLeft: "2px solid rgba(255,159,197,.55)", paddingLeft: "10px" });
        response.append(maria, andrew);
        next.textContent = index === beats.length - 1 ? "Return to Haven" : "Continue"; next.style.display = "block";
      };
      choices.append(button);
    }
  };
  next.onclick = () => { if (index >= beats.length - 1) close(); else { index += 1; render(); card.scrollTop = 0; } };

  card.append(header, progress, speech, prompt, choices, response, next); overlay.append(card); parent.append(overlay); render();
}

export function installAct3AndrewDialogue(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3AndrewDialogueInstalled) return;
  proto.__act3AndrewDialogueInstalled = true;
  const originalOpenModal = proto.openModal;
  if (typeof originalOpenModal !== "function") return;

  // Haven's first Andrew modal is the base Love Sword line. Recognize that
  // exact payload directly so the same interaction continues through all eight
  // beats, including the three-sheet explanation, without requiring a second
  // Talk interaction.
  proto.openModal = function act3AndrewModal(payload: any) {
    if (this.save?.current_zone === ZONE && payload?.type === "andrew") {
      const line = String(payload.line ?? "");
      const firstTalk = payload.act3FirstAndrew === true || line === FIRST_SWORD_LINE;
      showAndrew(this, line, firstTalk);
      return;
    }
    return originalOpenModal.call(this, payload);
  };
}
