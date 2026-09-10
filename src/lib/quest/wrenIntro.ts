// @ts-nocheck -- Premium Act I Wren introduction, isolated from core quest logic.

const ZONE = "sunlit_shores";
const GUIDE_KIND = "act-guide";
const WREN_WEAPON = "spark-wand";

const TURNS = [
  { speaker: "Wren", tone: "gold", text: "Easy now, Maria. You are safe. I'm Wren, keeper of these shores. The sea has been restless since before sunrise, but the moment you woke, it went quiet. It knew you were coming before I did." },
  { speaker: "Maria", tone: "rose", text: "The sea knew my name? I feel like I just woke from a dream. Where am I?" },
  { speaker: "Wren", tone: "gold", text: "At the beginning of the Realm of the Golden Ring. Five realms lie ahead, each holding something Andrew has been trying to tell you — not with a speech, but with a journey you can walk for yourself." },
  { speaker: "Maria", tone: "rose", text: "Andrew made all of this? Then I'm going to him." },
  { speaker: "Wren", tone: "gold", text: "Good. Don't carry all five realms at once. Today you only need the road in front of your feet. Along it you'll find five Relics — truths Andrew wants you to carry — and sealed Envelopes tucked into quieter places. Read those slowly." },
  { speaker: "Maria", tone: "rose", text: "And the creatures out there? They don't exactly look peaceful." },
  { speaker: "Wren", tone: "gold", text: "They are worries given shape, not evil given a face. Fear, hurry, doubt — this realm makes them visible. Protect yourself, but remember what you are here to do: help them remember what they were before worry twisted them." },
  { speaker: "Maria", tone: "rose", text: "So I can fight without becoming cruel." },
  { speaker: "Wren", tone: "gold", text: "Exactly. Which is why this belongs with you: the Radiant Spark Wand. It throws light instead of steel. Better tools will find you later, but this is enough for the first road." },
  { speaker: "Maria", tone: "rose", text: "What happens if I get hurt?" },
  { speaker: "Wren", tone: "gold", text: "Watch your hearts. If they empty, you'll wake again at the start of the realm with nothing important taken from you. Rest stones restore you. Your house can too. This world expects you to rest, not just endure." },
  { speaker: "Maria", tone: "rose", text: "And if I get lost?" },
  { speaker: "Wren", tone: "gold", text: "Use the map. Read the signposts. A wrong turn is not a failure. Then, when you're ready, follow the coastal road east to the River Gate Temple. The Warden of Rushing Water guards the Lantern there." },
  { speaker: "Maria", tone: "rose", text: "River Gate Temple. I'm ready." },
  { speaker: "Wren", tone: "gold", text: "Then take the light, Maria. You're not lost, and you're not late. You arrived exactly when the story needed you." },
] as const;

function apply(el: HTMLElement, styles: Record<string, string>) {
  Object.assign(el.style, styles);
}

function makePortrait(label: string, side: "left" | "right") {
  const portrait = document.createElement("div");
  portrait.textContent = label === "Maria" ? "M" : "W";
  apply(portrait, {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    flex: "0 0 76px",
    fontFamily: "Georgia,serif",
    fontWeight: "900",
    fontSize: "31px",
    color: label === "Maria" ? "#f7d7de" : "#ffe4a0",
    border: `2px solid ${label === "Maria" ? "rgba(222,146,164,.82)" : "rgba(235,196,96,.88)"}`,
    background: label === "Maria"
      ? "radial-gradient(circle at 35% 30%,#7b4054 0%,#4a2438 56%,#24172a 100%)"
      : "radial-gradient(circle at 35% 30%,#2e7583 0%,#194655 55%,#102736 100%)",
    boxShadow: label === "Maria" ? "0 0 26px rgba(222,146,164,.2)" : "0 0 26px rgba(235,196,96,.2)",
    order: side === "left" ? "0" : "2",
  });
  return portrait;
}

function showWrenIntro(scene: any) {
  document.getElementById("quest-wren-intro")?.remove();
  scene.frozen = true;
  scene.physics?.pause?.();

  let index = 0;

  const overlay = document.createElement("div");
  overlay.id = "quest-wren-intro";
  apply(overlay, {
    position: "fixed",
    inset: "0",
    zIndex: "10040",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    background: "radial-gradient(circle at 50% 35%,rgba(48,113,130,.2),rgba(4,8,19,.87) 72%)",
    backdropFilter: "blur(8px)",
  });

  const shell = document.createElement("div");
  apply(shell, {
    width: "min(1040px,96vw)",
    borderRadius: "28px",
    border: "2px solid rgba(225,187,92,.76)",
    background: "linear-gradient(180deg,rgba(14,24,47,.985),rgba(8,15,32,.99))",
    boxShadow: "0 38px 110px rgba(0,0,0,.7),0 0 70px rgba(87,177,196,.12)",
    color: "white",
    overflow: "hidden",
    position: "relative",
  });
  overlay.appendChild(shell);

  const top = document.createElement("div");
  apply(top, {
    padding: "18px 24px 14px",
    borderBottom: "1px solid rgba(231,194,100,.2)",
    background: "linear-gradient(90deg,rgba(70,130,145,.08),rgba(225,187,92,.05),rgba(168,81,104,.06))",
  });
  top.innerHTML = `<div style="font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:#e4bf68;font-weight:900">Act I · The First Conversation</div><div style="font-family:Georgia,serif;font-size:28px;font-weight:800;color:#fff1c8;margin-top:4px">Wren of the Shores</div><div style="font-size:12px;color:rgba(222,239,245,.62);margin-top:3px">Keeper of the first road · Maria's first guide into the Realm of the Golden Ring</div>`;
  shell.appendChild(top);

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "Close Wren dialogue");
  apply(close, {
    position: "absolute",
    right: "16px",
    top: "14px",
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    border: "1px solid rgba(232,196,103,.5)",
    background: "rgba(6,13,29,.82)",
    color: "#e6c36e",
    fontWeight: "900",
    cursor: "pointer",
    zIndex: "3",
  });
  shell.appendChild(close);

  const stage = document.createElement("div");
  apply(stage, {
    padding: "26px 26px 18px",
    minHeight: "330px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "20px",
  });
  shell.appendChild(stage);

  const dialogueRow = document.createElement("div");
  apply(dialogueRow, {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    minHeight: "220px",
  });
  stage.appendChild(dialogueRow);

  const progress = document.createElement("div");
  apply(progress, { display: "flex", alignItems: "center", gap: "6px", padding: "0 2px" });
  stage.appendChild(progress);

  const footer = document.createElement("button");
  footer.type = "button";
  apply(footer, {
    width: "100%",
    minHeight: "54px",
    borderRadius: "15px",
    border: "1px solid rgba(229,194,104,.5)",
    background: "linear-gradient(90deg,rgba(229,194,104,.08),rgba(102,180,197,.06))",
    color: "#f0ce7a",
    fontWeight: "900",
    letterSpacing: ".17em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontSize: "12px",
  });
  stage.appendChild(footer);

  const finish = () => {
    overlay.remove();
    scene.frozen = false;
    scene.physics?.resume?.();
    scene.pushHud?.(true);
  };
  close.onclick = finish;

  const render = () => {
    const turn = TURNS[index]!;
    const mariaSpeaking = turn.speaker === "Maria";
    dialogueRow.innerHTML = "";
    progress.innerHTML = "";

    const leftPortrait = makePortrait(mariaSpeaking ? "Maria" : "Wren", "left");
    const rightPortrait = makePortrait(mariaSpeaking ? "Wren" : "Maria", "right");
    const card = document.createElement("div");
    apply(card, {
      flex: "1",
      borderRadius: "22px",
      border: mariaSpeaking ? "1px solid rgba(221,145,164,.34)" : "1px solid rgba(231,193,98,.34)",
      background: mariaSpeaking ? "rgba(92,44,63,.16)" : "rgba(29,77,89,.16)",
      padding: "24px",
      boxShadow: "inset 0 0 35px rgba(255,255,255,.015)",
      order: "1",
    });

    const speaker = document.createElement("div");
    speaker.textContent = turn.speaker;
    apply(speaker, {
      fontFamily: "Georgia,serif",
      fontSize: "23px",
      fontWeight: "800",
      color: mariaSpeaking ? "#e8a9b9" : "#e6c36e",
      marginBottom: "11px",
    });
    const line = document.createElement("div");
    line.textContent = `“${turn.text}”`;
    apply(line, {
      fontFamily: "Georgia,serif",
      fontSize: "clamp(16px,2vw,20px)",
      lineHeight: "1.65",
      fontStyle: "italic",
      color: "rgba(255,255,255,.95)",
    });
    const cue = document.createElement("div");
    cue.textContent = mariaSpeaking ? "Maria answers" : "Wren speaks";
    apply(cue, {
      marginTop: "18px",
      fontSize: "9px",
      letterSpacing: ".22em",
      textTransform: "uppercase",
      color: mariaSpeaking ? "rgba(235,177,190,.58)" : "rgba(236,207,132,.58)",
      fontWeight: "900",
    });
    card.append(speaker, line, cue);
    dialogueRow.append(leftPortrait, card, rightPortrait);

    for (let i = 0; i < TURNS.length; i++) {
      const d = document.createElement("span");
      apply(d, {
        height: "5px",
        flex: "1",
        borderRadius: "999px",
        background: i <= index ? (TURNS[i]!.speaker === "Maria" ? "#c98196" : "#d8b55e") : "rgba(255,255,255,.12)",
        transition: "background 160ms ease",
      });
      progress.appendChild(d);
    }

    footer.textContent = index === TURNS.length - 1 ? "Take the Radiant Spark Wand" : mariaSpeaking ? "Listen to Wren" : "Maria responds";
  };

  footer.onclick = () => {
    if (index >= TURNS.length - 1) {
      scene.spawnSparkle?.(scene.player.x, scene.player.y, 0xffdf82, 24);
      scene.emitToast?.("Radiant Spark Wand received. Follow the coastal road east.");
      finish();
      return;
    }
    index += 1;
    render();
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
