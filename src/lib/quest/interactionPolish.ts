// @ts-nocheck -- Runtime scene decorator for low-risk interaction polish.
import "./objectivePolish.css";

/**
 * Gives the nearest usable interactable a gentle proximity response, upgrades
 * the floating interaction prompt with a concise contextual verb, and shows
 * small nearby nameplates for important NPCs. No radii, handlers, quest state,
 * or progression rules are changed.
 */
export function installInteractionPolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionPolishInstalled) return;
  proto.__interactionPolishInstalled = true;

  const baseAlpha = new WeakMap<object, number>();
  const nameplates = new WeakMap<object, any>();
  const nameplateAlpha = new WeakMap<object, number>();
  const promptState = new WeakMap<object, { alpha: number; label: string }>();
  const originalUpdate = proto.update;
  const originalBuildAct2 = proto.buildAct2;
  const originalSpawnActBoss = proto.spawnActBoss;
  const originalCheckCutscene = proto.checkCutscene;

  // Give the Stress Spectre roughly 20% more room without touching the rest of
  // Act II progression. The existing 40x42 Conservatory becomes a 48x50 open
  // marble court, and the door/landmark are pulled toward its new centre.
  proto.buildAct2 = function interactionPolishBuildAct2(...args: any[]) {
    const result = originalBuildAct2.apply(this, args);
    const marble = this.layer?.getTileAt(this.sx(92), this.sy(30))?.index;
    if (typeof marble === "number") this.rectLive(84, 26, 48, 50, marble);

    const door = Array.isArray(this.interactables)
      ? this.interactables.find((it: any) => it?.kind === "conservatory")
      : null;
    door?.obj?.setPosition?.(this.wx(112), this.wy(51));
    if (this.landmark?.title === "The Grand Conservatory") {
      this.landmark.sprite?.setPosition?.(this.wx(116), this.wy(42));
    }
    return result;
  };

  // Keep the Act II boss centred in the expanded court. All other bosses and
  // all boss stats/attacks continue through the original shared method.
  proto.spawnActBoss = function interactionPolishSpawnActBoss(tx: number, ty: number, ...rest: any[]) {
    if (this.save?.current_zone === "wedding_garden" && tx === 121 && ty === 51 && !rest[0]) {
      return originalSpawnActBoss.call(this, 112, 51, ...rest);
    }
    return originalSpawnActBoss.call(this, tx, ty, ...rest);
  };

  // The Conservatory already gets the cream info modal. Suppress only its
  // duplicate Act-title card so the two presentations can never overlap.
  proto.checkCutscene = function interactionPolishCheckCutscene(...args: any[]) {
    if (this.save?.current_zone !== "wedding_garden" || this.landmark?.title !== "The Grand Conservatory") {
      return originalCheckCutscene.apply(this, args);
    }
    const events = this.game?.events;
    const emit = events?.emit;
    if (typeof emit !== "function") return originalCheckCutscene.apply(this, args);
    events.emit = function patchedEmit(event: any, ...payload: any[]) {
      if (payload?.[0]?.title === "The Grand Conservatory") return false;
      return emit.call(this, event, ...payload);
    };
    try {
      return originalCheckCutscene.apply(this, args);
    } finally {
      events.emit = emit;
    }
  };

  const approach = (current: number, target: number, delta: number, speed: number) =>
    Phaser.Math.Linear(current, target, 1 - Math.exp(-Math.max(0, delta) / speed));

  const contextualLabel = (it: any) => {
    const raw = String(it?.label ?? "Interact").trim();
    const kind = String(it?.kind ?? "").toLowerCase();
    const lower = raw.toLowerCase();

    // A deliberately concise NPC label is already complete. In particular,
    // never turn the authored label "Talk" into the nonsensical "Talk to Talk".
    if (lower === "talk") return "Talk";

    // Authored labels that already contain an action are complete prompts.
    // Keep exactly one verb instead of producing combinations such as
    // "Interact with Look at...", "Read Look into...", or "Open Examine...".
    if (/^(?:look\s+(?:at|into|in|through)\b|examine\b|inspect\b|read\b|open\b|talk\s+to\b|rest\b|enter\b|use\b|take\b|pick\b|collect\b|touch\b|activate\b|light\b|sit\b|sleep\b|cook\b|store\b|leave\b|return\b)/i.test(raw)) {
      return raw;
    }

    if (/evelyn|bram|wren|keeper|guide|guest|pastor|andrew/.test(`${kind} ${lower}`)) {
      const subject = raw.replace(/^(?:talk\s+to\s+)+/i, "").trim();
      return `Talk to ${subject || "them"}`;
    }
    if (/rest|bed|hearth|camp|stone/.test(`${kind} ${lower}`)) return `Rest at ${raw}`;
    if (/key/.test(`${kind} ${lower}`)) return `Open ${raw}`;
    if (/chest|box|crate/.test(`${kind} ${lower}`)) return `Open ${raw}`;
    if (/sign|journal|book|letter|note/.test(`${kind} ${lower}`)) return `Read ${raw}`;
    if (/portal|gateway|gate|door|entrance/.test(`${kind} ${lower}`)) return `Enter ${raw}`;
    if (/forge|anvil/.test(`${kind} ${lower}`)) return `Use ${raw}`;
    if (/relic|pickup|heart|envelope/.test(`${kind} ${lower}`)) return `Take ${raw}`;
    return `Interact with ${raw}`;
  };

  const npcName = (it: any) => {
    const kind = String(it?.kind ?? "").toLowerCase();
    const label = String(it?.label ?? "").trim();
    const haystack = `${kind} ${label}`.toLowerCase();
    if (haystack.includes("evelyn") || kind === "garden-keeper") return "Evelyn";
    if (haystack.includes("bram") || kind === "smith") return "Bram";
    if (haystack.includes("wren")) return "Wren";
    if (haystack.includes("pastor adriel")) return "Pastor Adriel";
    if (haystack.includes("pastor alcir")) return "Pastor Alcir";
    return null;
  };

  const getNameplate = (scene: any, it: any, name: string) => {
    const obj = it?.obj;
    if (!obj) return null;
    let text = nameplates.get(obj);
    if (!text || !text.active) {
      text = scene.add.text(obj.x, obj.y - 26, name, {
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontSize: "8px",
        fontStyle: "700",
        color: "#fff8df",
        backgroundColor: "rgba(8,20,40,.78)",
        padding: { x: 5, y: 2 },
        stroke: "#071426",
        strokeThickness: 1,
      })
        .setOrigin(0.5, 1)
        .setDepth(99990)
        .setAlpha(0)
        .setVisible(false);
      nameplates.set(obj, text);
      nameplateAlpha.set(obj, 0);
    }
    return text;
  };

  proto.update = function interactionPolishUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    const list = Array.isArray(this.interactables) ? this.interactables : [];
    const near = typeof this.nearest === "function" ? this.nearest() : null;

    for (const it of list) {
      const obj = it?.obj;
      if (!obj || !obj.active) continue;

      if (!baseAlpha.has(obj)) baseAlpha.set(obj, typeof obj.alpha === "number" ? obj.alpha : 1);

      const base = baseAlpha.get(obj) ?? 1;
      if (it === near) {
        const pulse = 0.94 + (Math.sin(time / 230) + 1) * 0.025;
        obj.setAlpha?.(Math.min(base, pulse));
      } else {
        obj.setAlpha?.(base);
      }

      const name = npcName(it);
      if (name) {
        const plate = getNameplate(this, it, name);
        if (plate) {
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
          const show = !!it.enabled && d <= Math.max(150, (it.radius ?? 48) * 2.1);
          const current = nameplateAlpha.get(obj) ?? 0;
          const alpha = approach(current, show ? 0.92 : 0, delta, show ? 90 : 135);
          nameplateAlpha.set(obj, alpha);
          plate
            .setPosition(obj.x, obj.y - Math.max(24, (obj.displayHeight ?? 32) * 0.62) + (1 - alpha / 0.92) * 2)
            .setVisible(show || alpha > 0.02)
            .setAlpha(alpha);
        }
      }
    }

    if (this.promptText) {
      let state = promptState.get(this);
      if (!state) {
        state = { alpha: 0, label: "Interact" };
        promptState.set(this, state);
      }

      if (near) {
        state.label = contextualLabel(near);
        this.prompt = state.label;
      }

      state.alpha = approach(state.alpha, near ? 1 : 0, delta, near ? 70 : 105);
      const visible = !!near || state.alpha > 0.025;

      if (visible) {
        const lift = (1 - state.alpha) * 4;
        this.promptText
          .setText(`E  ·  ${state.label}`)
          .setFontFamily("system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif")
          .setFontSize(9)
          .setFontStyle("600")
          .setColor("#f8fbff")
          .setBackgroundColor("#10233f")
          .setPadding(7, 4, 7, 4)
          .setStroke("#071426", 1)
          .setShadow(0, 2, "#000000", 3, false, true)
          .setAlpha(0.96 * state.alpha)
          .setOrigin(0.5, 1)
          .setPosition(this.player.x, this.player.y - 31 + lift)
          .setDepth(100000)
          .setVisible(true);
      } else {
        this.promptText.setAlpha(0).setVisible(false);
      }
    }

    return result;
  };
}
