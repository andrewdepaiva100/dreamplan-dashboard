// @ts-nocheck -- Act II-only Bram presentation/story decorator.
// This is intentionally isolated from scene.ts so the Wedding Garden can be
// tuned without disturbing saves, combat, or other acts.

import bramPortrait from "../../assets/quest/smith.png";
import { BLACKSMITH } from "./content";

const ZONE = "wedding_garden";
const SMITH_KIND = "smith";
const BLADE = "ember-blade";

const SEASON_NAMES = ["Spring", "Summer", "Autumn", "Winter"] as const;

const STORY = {
  first:
    "You've got the look of someone carrying more than a blade, Maria. I'm Bram. I keep the forge because gardens and marriages have one thing in common: neither stays beautiful by accident. They are tended, repaired, and chosen again.",
  garden:
    "Evelyn tends what grows. I tend what has to endure. When the seasons fractured, hinges warped, benches split, and the Conservatory's white iron went cold. I've been putting the garden back together one piece at a time while she teaches it how to breathe again.",
  covenant:
    "A good blade isn't strong because it never bends. It's strong because the smith knows how to bring it back true. Same with a promise. Heat, patience, pressure, rest — none of those ruin good metal. Used well, they are what make it last.",
  legacy:
    "I learned that from a couple who came through this garden years ago. They argued right here beside the forge, then sat on that bench until sunset and left holding hands. Before they went, the husband told me: 'Don't confuse an easy season with a lasting one.' I kept the sentence.",
  boss:
    "The thing inside the Conservatory feeds on the lie that carrying everything is the same as being strong. It isn't. Strength is knowing what belongs in your hands and what should be set down. When you go in there, don't let its hurry become yours.",
};

function style(el: HTMLElement, values: Record<string, string>) {
  Object.assign(el.style, values);
}

function currentKeys(scene: any) {
  return Math.max(0, Math.min(4, Number(scene.zoneState?.["keysFound"] ?? 0)));
}

function ensureBramPresentation(scene: any, it: any) {
  if (!it?.obj?.active || it.obj.getData?.("bram-premium")) return;
  it.obj.setData?.("bram-premium", true);
  it.label = "Talk to Bram the Forgemaster";
  it.radius = Math.max(76, it.radius ?? 46);
  it.obj.setScale?.(1.42);
  it.obj.clearTint?.();
  it.obj.setDepth?.(scene.dsort?.(it.obj.y + (it.obj.displayHeight ?? 34) * 0.28) ?? 14);

  // Keep the authored smith sprite as the character art. These small authored
  // accents make him read as important without replacing him with geometric art.
  if (scene.textures?.exists?.("relic")) {
    const crest = scene.add.sprite(it.obj.x, it.obj.y + 7, "relic")
      .setScale(0.26)
      .setTint(0xe1b45c)
      .setAlpha(0.92)
      .setDepth((it.obj.depth ?? 14) + 0.03);
    scene.__bramCrest = crest;
  }

  if (scene.textures?.exists?.("spark")) {
    const sparks: any[] = [];
    for (let i = 0; i < 3; i++) {
      const s = scene.add.sprite(it.obj.x - 22 + i * 8, it.obj.y - 12 - i * 5, "spark")
        .setTint(0xffb35f)
        .setScale(0.45 + i * 0.08)
        .setAlpha(0.28)
        .setDepth((it.obj.depth ?? 14) - 0.02);
      scene.tweens.add({
        targets: s,
        y: s.y - 15,
        alpha: { from: 0.16, to: 0.5 },
        duration: 900 + i * 180,
        yoyo: true,
        repeat: -1,
        delay: i * 220,
      });
      sparks.push(s);
    }
    scene.__bramSparks = sparks;
  }
}

function syncBramArt(scene: any) {
  const smith = (scene.interactables ?? []).find((entry: any) => entry?.enabled && entry.kind === SMITH_KIND);
  if (smith) ensureBramPresentation(scene, smith);
  const obj = smith?.obj;
  if (!obj?.active) return;
  const crest = scene.__bramCrest;
  if (crest?.active) crest.setPosition(obj.x, obj.y + 7).setDepth((obj.depth ?? 14) + 0.03);
}

function choiceButton(text: string) {
  const b = document.createElement("button");
  b.type = "button";
  b.textContent = text;
  style(b, {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(225,180,92,.42)",
    borderRadius: "12px",
    background: "linear-gradient(135deg,rgba(255,255,255,.065),rgba(225,180,92,.045))",
    color: "#fff",
    padding: "11px 13px",
    fontFamily: "Georgia,serif",
    fontSize: "14px",
    lineHeight: "1.35",
    cursor: "pointer",
  });
  b.onmouseenter = () => {
    b.style.borderColor = "rgba(244,201,103,.88)";
    b.style.background = "linear-gradient(135deg,rgba(225,180,92,.18),rgba(255,255,255,.06))";
    b.style.transform = "translateX(3px)";
  };
  b.onmouseleave = () => {
    b.style.borderColor = "rgba(225,180,92,.42)";
    b.style.background = "linear-gradient(135deg,rgba(255,255,255,.065),rgba(225,180,92,.045))";
    b.style.transform = "translateX(0)";
  };
  return b;
}

function showBramDialogue(scene: any) {
  document.getElementById("quest-bram-dialogue")?.remove();
  const keys = currentKeys(scene);
  const hasBlade = scene.save?.weapons?.includes?.(BLADE) === true;
  const tempered = Math.max(0, Number(scene.zoneState?.["bramTempered"] ?? 0));

  const overlay = document.createElement("div");
  overlay.id = "quest-bram-dialogue";
  style(overlay, {
    position: "fixed",
    inset: "0",
    zIndex: "10020",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "18px",
    background: "radial-gradient(circle at 55% 48%,rgba(68,39,22,.28),rgba(4,9,21,.82) 68%)",
    backdropFilter: "blur(5px)",
  });

  const shell = document.createElement("div");
  style(shell, {
    width: "min(980px,96vw)",
    maxHeight: "88vh",
    overflow: "auto",
    borderRadius: "24px",
    border: "2px solid rgba(226,183,90,.82)",
    background: "radial-gradient(110% 180% at 10% 0%,#24344dfa,#091326fc 53%,#121020fc)",
    boxShadow: "0 32px 90px rgba(0,0,0,.7),0 0 55px rgba(226,183,90,.13)",
    color: "white",
    position: "relative",
  });
  overlay.appendChild(shell);

  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "✕";
  close.setAttribute("aria-label", "Close Bram dialogue");
  style(close, {
    position: "absolute", right: "15px", top: "13px", zIndex: "3", width: "38px", height: "38px",
    borderRadius: "999px", border: "1px solid rgba(235,193,98,.7)", background: "#081226ee",
    color: "#efca6b", fontWeight: "900", cursor: "pointer",
  });
  shell.appendChild(close);

  const header = document.createElement("div");
  style(header, { display: "flex", gap: "18px", padding: "20px 58px 14px 20px", alignItems: "center", borderBottom: "1px solid rgba(226,183,90,.25)" });
  const portraitFrame = document.createElement("div");
  style(portraitFrame, {
    width: "112px", height: "112px", minWidth: "112px", borderRadius: "20px", overflow: "hidden",
    border: "2px solid rgba(232,190,94,.95)", background: "radial-gradient(circle at 50% 22%,#5b402d,#121a2a 75%)",
    boxShadow: "0 14px 32px rgba(0,0,0,.5),0 0 28px rgba(232,190,94,.2)", display: "flex", alignItems: "center", justifyContent: "center",
  });
  const img = document.createElement("img");
  img.src = bramPortrait;
  img.alt = "Bram the Forgemaster";
  style(img, { width: "96px", height: "112px", objectFit: "contain", imageRendering: "pixelated", transform: "scale(1.45)", transformOrigin: "50% 70%" });
  portraitFrame.appendChild(img);
  header.appendChild(portraitFrame);
  const title = document.createElement("div");
  title.innerHTML = `<div style="font-size:10px;letter-spacing:.22em;color:#d9b25d;font-weight:900;text-transform:uppercase">Act II · Wedding Garden</div><div style="font-family:Georgia,serif;font-size:29px;font-weight:800;color:#f0c868;margin-top:3px">Bram the Forgemaster</div><div style="font-size:12px;color:rgba(255,255,255,.62);margin-top:4px">Keeper of the forge · mender of what must endure</div>`;
  header.appendChild(title);
  shell.appendChild(header);

  const body = document.createElement("div");
  style(body, { display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(260px,.8fr)", gap: "16px", padding: "18px 20px 20px" });
  shell.appendChild(body);

  const conversation = document.createElement("section");
  style(conversation, { borderRadius: "18px", border: "1px solid rgba(226,183,90,.25)", padding: "17px", background: "rgba(255,255,255,.025)" });
  const speaker = document.createElement("div");
  speaker.textContent = "Bram";
  style(speaker, { fontFamily: "Georgia,serif", color: "#efc96b", fontSize: "16px", fontWeight: "800" });
  const line = document.createElement("p");
  line.textContent = STORY.first;
  style(line, { fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "16px", lineHeight: "1.62", color: "rgba(255,255,255,.95)", minHeight: "116px", margin: "10px 0 14px" });
  const response = document.createElement("div");
  style(response, { display: "none", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(226,183,90,.2)" });
  conversation.append(speaker, line, response);
  body.appendChild(conversation);

  const choices = document.createElement("section");
  style(choices, { display: "flex", flexDirection: "column", gap: "8px" });
  body.appendChild(choices);

  const setLine = (maria: string, bram: string) => {
    speaker.textContent = "Maria";
    speaker.style.color = "#f0c4d2";
    line.textContent = `“${maria}”`;
    response.style.display = "block";
    response.innerHTML = `<div style="font-family:Georgia,serif;color:#efc96b;font-weight:800;margin-bottom:7px">Bram</div><div style="font-family:Georgia,serif;font-style:italic;line-height:1.58;color:rgba(255,255,255,.93)">“${bram}”</div>`;
  };

  const addChoice = (label: string, answer: string, action?: () => void) => {
    const b = choiceButton(label);
    b.onclick = () => {
      action?.();
      setLine(label, answer);
    };
    choices.appendChild(b);
  };

  if (!hasBlade) {
    addChoice("Can you forge something for me?", "I already did. I started it before dawn because the forge went warm before you arrived. The Ember Blade isn't a weapon made for anger; it's a tool for cutting through what crowds your way. Take it. Then bring it back as the seasons return, and I'll temper it to what the garden teaches you.", () => {
      const fresh = scene.grantWeapon?.(BLACKSMITH.weapon);
      if (fresh) {
        scene.spawnSparkle?.(scene.player.x, scene.player.y, 0xffb35f, 22);
        scene.emitToast?.("Bram places the Ember Blade in Maria's hands.");
        scene.refreshHand?.();
      }
    });
  } else {
    const canTemper = keys > tempered;
    addChoice(
      canTemper ? `Temper the Ember Blade with what I've restored (${keys}/4)` : `How is the Ember Blade holding? (${tempered}/4 tempered)`,
      canTemper
        ? `There. ${SEASON_NAMES[Math.max(0, keys - 1)] ?? "Another season"} left its mark in the steel. Not louder — steadier. That's what good tempering does. Bring it back when another season comes home.`
        : keys < 4
          ? "It is holding exactly as it should. Restore another season and bring it back. Good metal learns from every honest fire."
          : "All four seasons are in it now: renewal, abundance, release, and rest. I wouldn't touch it again. Some things are finished when they finally become balanced.",
      () => {
        if (canTemper) {
          scene.zoneState["bramTempered"] = keys;
          scene.spawnSparkle?.(scene.player.x, scene.player.y, 0xf0bd62, 18);
          scene.emitToast?.(`Bram tempers the Ember Blade — ${keys}/4 seasonal marks.`);
        }
      },
    );
  }

  addChoice("What do you do here besides forge blades?", STORY.garden);
  addChoice("What makes something strong enough to last?", STORY.covenant);
  addChoice("You sound like you've seen a lot of people come through here.", STORY.legacy);
  if (keys >= 4) addChoice("What should I know before I enter the Conservatory?", STORY.boss);

  const footer = document.createElement("div");
  style(footer, { gridColumn: "1 / -1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "3px", paddingTop: "13px", borderTop: "1px solid rgba(226,183,90,.2)" });
  footer.innerHTML = `<div style="font-size:10px;letter-spacing:.13em;text-transform:uppercase;color:rgba(255,255,255,.5)">Forge record</div><div style="font-family:Georgia,serif;color:#e8bf62;font-size:13px">Seasonal tempering: ${tempered}/4 · Keys restored: ${keys}/4</div>`;
  body.appendChild(footer);

  const exit = () => {
    overlay.remove();
    scene.scene?.resume?.();
    scene.physics?.resume?.();
    scene.frozen = false;
  };
  close.onclick = exit;
  overlay.onclick = (event) => { if (event.target === overlay) exit(); };
  document.body.appendChild(overlay);
  scene.frozen = true;
  scene.player?.setVelocity?.(0, 0);
  scene.physics?.pause?.();
  scene.scene?.pause?.();
}

export function installAct2BramForgemaster(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2BramForgemasterInstalled) return;
  proto.__act2BramForgemasterInstalled = true;

  const originalAddBlacksmith = proto.addBlacksmith;
  proto.addBlacksmith = function premiumBram(tx: number, ty: number) {
    const result = originalAddBlacksmith.call(this, tx, ty);
    if (this.save?.current_zone === ZONE) {
      const smith = (this.interactables ?? []).findLast?.((entry: any) => entry?.kind === SMITH_KIND)
        ?? [...(this.interactables ?? [])].reverse().find((entry: any) => entry?.kind === SMITH_KIND);
      ensureBramPresentation(this, smith);
    }
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function bramStoryInteract(...args: any[]) {
    if (this.save?.current_zone === ZONE) {
      const nearest = this.nearest?.();
      if (nearest?.kind === SMITH_KIND) {
        showBramDialogue(this);
        return;
      }
    }
    return originalInteract.apply(this, args);
  };

  const originalUpdate = proto.update;
  proto.update = function bramPremiumUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    if (this.save?.current_zone === ZONE) syncBramArt(this);
    return result;
  };
}
