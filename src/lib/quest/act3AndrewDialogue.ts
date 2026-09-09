// @ts-nocheck -- Act III Andrew conversation presentation only. No quest state is changed here.

type Reply = { maria: string; andrew: string };

const ZONE = "the_haven";

function setStyle(el: HTMLElement, values: Record<string, string>) {
  Object.assign(el.style, values);
}

function repliesFor(line: string): Reply[] {
  if (line.includes("supposed to be waiting for you at the Cathedral")) {
    return [
      { maria: "You came all the way back for our song?", andrew: "For our song? I'd cross every realm twice. Those pages belong at the altar with us." },
      { maria: "You were supposed to be waiting for me.", andrew: "I was. Then three pages of our wedding song went flying across Haven. Apparently even destiny needs someone to pick up after it." },
      { maria: "I'm glad I found you here.", andrew: "Me too. But when this is finished, I'm going ahead. The next time you see me waiting, it'll be where I promised." },
    ];
  }
  if (line.includes("Three pages of our wedding song")) {
    return [
      { maria: "Then we'll put our song back together.", andrew: "Exactly. One page at a time, the same way we'll build everything else — together." },
      { maria: "You really weren't leaving them behind, were you?", andrew: "Not a chance. Some things are worth turning around for." },
      { maria: "Wait for me here. I'll find them.", andrew: "Always. And when you bring them back, we'll finish what the Clamour tried to interrupt." },
    ];
  }
  if (/1\/3 pages/.test(line)) {
    return [
      { maria: "One down. Two to go.", andrew: "And already the melody feels less broken. Keep going — I'll be right here." },
      { maria: "Haven hides things well.", andrew: "It does. Look behind the ordinary places. That's where our best memories usually are too." },
      { maria: "I wish you could search with me.", andrew: "So do I. Let me hold this part of the square steady while you bring the song home." },
    ];
  }
  if (/2\/3 pages/.test(line)) {
    return [
      { maria: "Just one more page.", andrew: "One more. I can almost hear the whole song again." },
      { maria: "We're close.", andrew: "We are. Don't let being close make you rush the last step." },
      { maria: "Then save me a place in the melody.", andrew: "Maria, the melody has always had your name in it." },
    ];
  }
  if (line.includes("found every last page") || line.includes("melody is ours now")) {
    return [
      { maria: "We got our song back.", andrew: "We did. The Clamour could scatter the pages, but it couldn't take what they mean." },
      { maria: "Now go wait for me at the Cathedral.", andrew: "Gladly. No more detours. The next time you find me, I'll be exactly where I promised." },
      { maria: "Play it for me once before you go.", andrew: "Always. Then I'll carry the last note ahead and wait for you at the altar." },
    ];
  }
  return [
    { maria: "I'm with you.", andrew: "That's the part I never doubt." },
    { maria: "We'll finish this together.", andrew: "Together. Even when one of us has to walk a few steps ahead." },
  ];
}

function showAndrew(scene: any, line: string) {
  const parent = scene.game?.canvas?.parentElement ?? document.body;
  const mobile = window.innerWidth < 700;
  scene.frozen = true;
  scene.physics?.pause?.();

  const overlay = document.createElement("div");
  overlay.className = "quest-act3-andrew-dialogue";
  setStyle(overlay, { position: "absolute", inset: "0", zIndex: "10070", display: "flex", alignItems: mobile ? "flex-end" : "center", justifyContent: "center", padding: mobile ? "10px" : "24px", boxSizing: "border-box", background: "radial-gradient(circle at 25% 28%,rgba(255,159,197,.16),rgba(3,8,18,.91) 64%)" });

  const card = document.createElement("div");
  setStyle(card, { width: "min(96vw,900px)", maxHeight: mobile ? "91vh" : "84vh", overflow: "auto", border: "2px solid rgba(255,159,197,.72)", borderRadius: mobile ? "18px" : "26px", background: "linear-gradient(145deg,rgba(36,23,38,.99),rgba(7,18,33,.99) 74%)", boxShadow: "0 24px 64px rgba(0,0,0,.55),0 0 34px rgba(255,159,197,.12)", color: "white", padding: mobile ? "18px" : "26px", boxSizing: "border-box" });

  const eyebrow = document.createElement("div");
  eyebrow.textContent = "A CONVERSATION IN THE HAVEN";
  setStyle(eyebrow, { fontSize: "10px", letterSpacing: ".2em", fontWeight: "900", color: "#f4d37d" });
  const title = document.createElement("div");
  title.textContent = "♥  Andrew";
  setStyle(title, { marginTop: "5px", fontFamily: "Georgia,serif", fontSize: mobile ? "25px" : "32px", fontWeight: "800", color: "#ff9fc5" });
  const role = document.createElement("div");
  role.textContent = "Your person · here for the song before returning to the Cathedral";
  setStyle(role, { marginTop: "4px", fontSize: "11px", color: "rgba(255,255,255,.58)" });
  const speech = document.createElement("div");
  speech.textContent = `“${line}”`;
  setStyle(speech, { marginTop: "20px", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "15px" : "19px", lineHeight: "1.58", color: "rgba(255,255,255,.96)" });
  const prompt = document.createElement("div");
  prompt.textContent = "Maria responds";
  setStyle(prompt, { marginTop: "22px", marginBottom: "9px", fontSize: "10px", letterSpacing: ".14em", fontWeight: "900", color: "rgba(255,255,255,.48)", textTransform: "uppercase" });
  const choices = document.createElement("div");
  setStyle(choices, { display: "grid", gap: "9px" });
  const response = document.createElement("div");
  setStyle(response, { marginTop: "15px" });
  const finish = document.createElement("button");
  finish.type = "button";
  finish.textContent = "Return to Haven";
  setStyle(finish, { display: "none", width: "100%", minHeight: "46px", marginTop: "15px", borderRadius: "13px", border: "1px solid #ff9fc5", background: "rgba(255,159,197,.1)", color: "#f4d37d", fontWeight: "900", cursor: "pointer" });

  const close = () => {
    overlay.remove();
    scene.frozen = false;
    scene.physics?.resume?.();
    scene.stick = { x: 0, y: 0 };
    // The Act III opening flow deliberately awakens the Clamour only after
    // Maria finishes this first conversation.
    scene.onResume?.();
  };
  finish.onclick = close;

  for (const option of repliesFor(line)) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `“${option.maria}”`;
    setStyle(button, { width: "100%", textAlign: "left", border: "1px solid rgba(255,159,197,.38)", borderRadius: "13px", background: "rgba(255,255,255,.055)", color: "rgba(255,255,255,.96)", padding: "11px 13px", fontFamily: "Georgia,serif", fontSize: "13px", lineHeight: "1.42", cursor: "pointer" });
    button.onclick = () => {
      choices.innerHTML = "";
      const maria = document.createElement("div");
      maria.textContent = `Maria: “${option.maria}”`;
      setStyle(maria, { color: "rgba(255,255,255,.72)", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "13px" });
      const andrew = document.createElement("div");
      andrew.textContent = `Andrew: “${option.andrew}”`;
      setStyle(andrew, { marginTop: "9px", color: "#f4d37d", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: mobile ? "14px" : "16px", lineHeight: "1.5", borderLeft: "2px solid rgba(255,159,197,.55)", paddingLeft: "10px" });
      response.append(maria, andrew);
      finish.style.display = "block";
    };
    choices.append(button);
  }

  card.append(eyebrow, title, role, speech, prompt, choices, response, finish);
  overlay.append(card);
  parent.append(overlay);
}

export function installAct3AndrewDialogue(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3AndrewDialogueInstalled) return;
  proto.__act3AndrewDialogueInstalled = true;
  const originalOpenModal = proto.openModal;
  if (typeof originalOpenModal !== "function") return;

  // Installed after the global character-dialogue layer so Haven's Andrew
  // conversations can use progress-aware Maria responses without affecting
  // Andrew or any other character in other acts.
  proto.openModal = function act3AndrewModal(payload: any) {
    if (this.save?.current_zone === ZONE && payload?.type === "andrew") {
      showAndrew(this, String(payload.line ?? ""));
      return;
    }
    return originalOpenModal.call(this, payload);
  };
}
