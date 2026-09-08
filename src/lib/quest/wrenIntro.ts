// @ts-nocheck -- Premium Act I Wren introduction, isolated from core quest logic.

const ZONE = "sunlit_shores";
const GUIDE_KIND = "act-guide";
const WREN_NAME = "Wren of the Shores";
const WREN_WEAPON = "spark-wand";

const SLIDES = [
  {
    kicker: "The First Voice",
    wren: "Easy now, Maria. You are safe. I'm Wren, keeper of these shores. The sea has been restless since before sunrise, but the moment you woke, it went quiet. It knew you were coming before I did.",
    choices: [
      { text: "Where am I?", reply: "At the beginning of the Realm of the Golden Ring — and exactly where you are supposed to be." },
      { text: "You know my name?", reply: "I do. This realm was shaped with you in mind. Your name has been carried through it for a long time." },
      { text: "I feel like I just woke from a dream.", reply: "Maybe you did. Some journeys only begin once the noise outside them finally goes quiet." },
    ],
  },
  {
    kicker: "The Golden Ring",
    wren: "This world is five realms laid one after another like stones in a ring. Each place holds something Andrew has been trying to tell you — not with a speech, but with a journey you can walk for yourself.",
    choices: [
      { text: "Andrew made all of this?", reply: "In the way that matters, yes. Every road here is built from what he feels, remembers, fears, and hopes for with you." },
      { text: "Five realms sounds like a lot.", reply: "Don't carry all five at once. Today you only need the road in front of your feet." },
    ],
  },
  {
    kicker: "At the Far End",
    wren: "Andrew is waiting at the far end of the road. He cannot come backward to meet you — that is one of the rules of this place. You have to move toward him, one realm at a time, until there is no distance left between you.",
    choices: [
      { text: "Then I'm going to him.", reply: "Good. Hold on to that certainty when a harder part of the road tries to borrow it from you." },
      { text: "Why can't he come to me?", reply: "Because this part belongs to you. He can build the path, but he cannot walk your steps for you." },
    ],
  },
  {
    kicker: "What You Carry",
    wren: "There are five Relics hidden through the realms. They are not trophies. Each one is a truth Andrew wants you to carry with you. You'll also find sealed Envelopes tucked into quieter corners. Those letters are not decoration, Maria. Read them slowly.",
    choices: [
      { text: "What do the Relics mean?", reply: "Each names something steady and real — the kind of truth that can outlast a difficult day." },
      { text: "And the letters?", reply: "Those are Andrew without armor. When you find one, give it a little time." },
    ],
  },
  {
    kicker: "The Things in Your Way",
    wren: "You will meet creatures that look hostile. Remember this before you swing: they are worries given shape, not evil given a face. Fear, hurry, doubt — this realm makes them visible. Your job is not to become cruel enough to beat them. It is to remind them they were gentle once.",
    choices: [
      { text: "So I don't have to kill them?", reply: "Exactly. You break the hold the worry has on them. Petals are a much better ending than bodies." },
      { text: "What if they hurt me?", reply: "Protect yourself. Gentleness does not mean standing still while fear bites you." },
    ],
  },
  {
    kicker: "A Light for the Road",
    wren: "Which is why I have something for you: the Radiant Spark Wand. It throws light instead of steel. Strike with it and the things crowding your path can remember what they were before worry twisted them.",
    choices: [
      { text: "A wand? I can work with that.", reply: "I thought you might. It suits someone whose first instinct is to bring peace instead of noise." },
      { text: "Is this the only weapon I'll have?", reply: "No. Better tools will find you later. Keep what you earn and choose what feels right from your Armory." },
    ],
  },
  {
    kicker: "Stay Standing",
    wren: "Watch your hearts. If they empty, you'll wake again at the start of the realm — frustrated, perhaps, but with nothing important taken from you. Rest stones restore you. Your house can too: hearth, chest, bed. This world expects you to rest, not just endure.",
    choices: [
      { text: "Good. I was hoping rest counted.", reply: "It counts more than most heroes admit." },
      { text: "And if I get lost?", reply: "Use the map, read the signposts, and stop treating a wrong turn like a failure. Roads can teach sideways." },
    ],
  },
  {
    kicker: "Your First Step",
    wren: "For now, follow the coastal road east to the River Gate Temple. The Warden of Rushing Water guards the Lantern there. Don't rush the shore just because you know the destination. Look around. This is the first place Andrew chose for you to see.",
    choices: [
      { text: "River Gate Temple. I'm ready.", reply: "Then take the light, Maria. The road has been waiting for you." },
      { text: "Anything else before I go?", reply: "Only this: you're not lost, and you're not late. You arrived exactly when the story needed you." },
    ],
  },
] as const;

function apply(el: HTMLElement, styles: Record<string, string>) {
  Object.assign(el.style, styles);
}

function button(text: string) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  apply(b, {
    width: "100%",
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(232,200,116,.38)",
    background: "linear-gradient(135deg,rgba(255,255,255,.065),rgba(83,155,181,.07))",
    color: "rgba(255,255,255,.94)",
    fontFamily: "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    fontSize: "13px",
    lineHeight: "1.35",
    cursor: "pointer",
    transition: "160ms ease",
  });
  b.onmouseenter = () => {
    b.style.borderColor = "rgba(245,211,122,.88)";
    b.style.background = "linear-gradient(135deg,rgba(245,211,122,.15),rgba(83,155,181,.12))";
    b.style.transform = "translateX(3px)";
  };
  b.onmouseleave = () => {
    b.style.borderColor = "rgba(232,200,116,.38)";
    b.style.background = "linear-gradient(135deg,rgba(255,255,255,.065),rgba(83,155,181,.07))";
    b.style.transform = "translateX(0)";
  };
  return b;
}

function showWrenIntro(scene: any) {
  document.getElementById("quest-wren-intro")?.remove();
  scene.frozen = true;
  scene.physics?.pause?.();

  let index = 0;
  let answer: string | null = null;
  const used = new Set<string>();

  const overlay = document.createElement("div");
  overlay.id = "quest-wren-intro";
  apply(overlay, {
    position: "fixed", inset: "0", zIndex: "10040", display: "flex", alignItems: "center", justifyContent: "center",
    padding: "18px", background: "radial-gradient(circle at 42% 35%,rgba(34,99,119,.27),rgba(4,9,22,.88) 68%)",
    backdropFilter: "blur(7px)",
  });

  const card = document.createElement("div");
  apply(card, {
    width: "min(960px,96vw)", maxHeight: "90vh", overflow: "auto", borderRadius: "25px",
    border: "2px solid rgba(238,204,113,.8)",
    background: "radial-gradient(120% 170% at 15% 0%,#244961 0%,#0b1b31 43%,#081020 100%)",
    boxShadow: "0 35px 100px rgba(0,0,0,.7),0 0 65px rgba(92,186,213,.13)", color: "white", position: "relative",
  });
  overlay.appendChild(card);

  const header = document.createElement("div");
  apply(header, { padding: "22px 24px 17px", borderBottom: "1px solid rgba(238,204,113,.24)", position: "relative" });
  header.innerHTML = `<div style="font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#efd178;font-weight:900">Act I · Sunlit Shores</div><div style="font-family:Georgia,serif;font-size:30px;font-weight:800;color:#fff4cf;margin-top:4px">Wren of the Shores</div><div style="font-size:12px;color:rgba(215,239,247,.66);margin-top:3px">Keeper of the first road · your guide into the Realm of the Golden Ring</div>`;
  card.appendChild(header);

  const close = document.createElement("button");
  close.type = "button"; close.textContent = "✕"; close.setAttribute("aria-label", "Close Wren dialogue");
  apply(close, { position: "absolute", right: "15px", top: "14px", width: "38px", height: "38px", borderRadius: "999px", border: "1px solid rgba(238,204,113,.55)", background: "rgba(4,11,25,.78)", color: "#efd178", fontWeight: "900", cursor: "pointer", zIndex: "2" });
  card.appendChild(close);

  const body = document.createElement("div");
  apply(body, { display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(260px,.8fr)", gap: "18px", padding: "20px 22px 22px" });
  card.appendChild(body);

  const speech = document.createElement("section");
  apply(speech, { border: "1px solid rgba(104,190,214,.24)", borderRadius: "18px", padding: "18px", background: "rgba(255,255,255,.025)", minHeight: "270px" });
  body.appendChild(speech);

  const side = document.createElement("section");
  apply(side, { display: "flex", flexDirection: "column", gap: "8px" });
  body.appendChild(side);

  const finish = () => {
    overlay.remove();
    scene.frozen = false;
    scene.physics?.resume?.();
    scene.pushHud?.(true);
  };
  close.onclick = finish;

  const render = () => {
    const slide = SLIDES[index]!;
    speech.innerHTML = "";
    side.innerHTML = "";

    const meta = document.createElement("div");
    apply(meta, { display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" });
    meta.innerHTML = `<span style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#79c7da;font-weight:900">${slide.kicker}</span><span style="font-size:11px;color:rgba(255,255,255,.48)">${index + 1} / ${SLIDES.length}</span>`;
    speech.appendChild(meta);

    const name = document.createElement("div");
    name.textContent = answer ? "Wren" : "Wren";
    apply(name, { marginTop: "20px", fontFamily: "Georgia,serif", fontSize: "17px", fontWeight: "800", color: "#efd178" });
    speech.appendChild(name);

    const line = document.createElement("p");
    line.textContent = `“${answer ?? slide.wren}”`;
    apply(line, { margin: "9px 0 0", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "17px", lineHeight: "1.65", color: "rgba(255,255,255,.95)" });
    speech.appendChild(line);

    const dots = document.createElement("div");
    apply(dots, { display: "flex", gap: "5px", marginTop: "22px" });
    for (let i = 0; i < SLIDES.length; i++) {
      const d = document.createElement("span");
      apply(d, { height: "4px", flex: "1", borderRadius: "999px", background: i <= index ? "#efd178" : "rgba(255,255,255,.13)" });
      dots.appendChild(d);
    }
    speech.appendChild(dots);

    if (!answer) {
      const prompt = document.createElement("div");
      prompt.textContent = "Maria — choose a response";
      apply(prompt, { fontSize: "10px", letterSpacing: ".16em", textTransform: "uppercase", color: "#f3c6d3", fontWeight: "900", marginBottom: "3px" });
      side.appendChild(prompt);
      slide.choices.forEach((choice, ci) => {
        const key = `${index}:${ci}`;
        if (used.has(key)) return;
        const b = button(choice.text);
        b.onclick = () => {
          used.add(key);
          answer = choice.reply;
          render();
        };
        side.appendChild(b);
      });
    } else {
      const chosen = document.createElement("div");
      chosen.textContent = "Wren heard you.";
      apply(chosen, { fontSize: "11px", color: "rgba(255,255,255,.55)", padding: "4px 2px 8px" });
      side.appendChild(chosen);
      const next = button(index === SLIDES.length - 1 ? "Take the Radiant Spark Wand" : "Continue");
      next.style.textAlign = "center";
      next.style.fontWeight = "800";
      next.style.color = "#ffe59a";
      next.onclick = () => {
        if (index >= SLIDES.length - 1) {
          scene.spawnSparkle?.(scene.player.x, scene.player.y, 0xffdf82, 24);
          scene.emitToast?.("Radiant Spark Wand received. Follow the coastal road east.");
          finish();
          return;
        }
        index += 1;
        answer = null;
        render();
      };
      side.appendChild(next);
    }
  };

  render();
  document.body.appendChild(overlay);
}

export function installWrenIntro(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__wrenIntroInstalled) return;
  proto.__wrenIntroInstalled = true;

  const originalInteract = proto.interact;
  proto.interact = function wrenPremiumInteract() {
    if (this.frozen) return;
    const it = typeof this.nearest === "function" ? this.nearest() : null;
    const isWren = this.save?.current_zone === ZONE && it?.kind === GUIDE_KIND && /wren/i.test(String(it?.label ?? ""));
    if (!isWren) return originalInteract.call(this);

    // Preserve the existing progression rule: the first conversation grants the
    // Spark Wand. Repeat conversations continue through the original guide path.
    const fresh = this.grantWeapon?.(WREN_WEAPON);
    if (!fresh) return originalInteract.call(this);

    showWrenIntro(this);
  };
}
