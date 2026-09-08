// @ts-nocheck -- Runtime scene decorator for low-risk interaction polish.
import "./objectivePolish.css";
import { installLastCrossingDialoguePolish } from "./lastCrossingDialoguePolish";

/**
 * Gives the nearest usable interactable a gentle proximity pulse, upgrades the
 * floating interaction prompt with a concise contextual verb, and shows small
 * nearby nameplates for important NPCs. No radii, handlers, quest state, or
 * progression rules are changed.
 */
export function installInteractionPolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionPolishInstalled) return;
  proto.__interactionPolishInstalled = true;

  // The Last Crossing uses the same interaction entry point, but its premium
  // conversations are isolated in their own decorator so combat/progression
  // logic stays in lastCrossing.ts.
  installLastCrossingDialoguePolish(QuestScene);

  const baseAlpha = new WeakMap<object, number>();
  const nameplates = new WeakMap<object, any>();
  const originalUpdate = proto.update;

  const contextualLabel = (it: any) => {
    const raw = String(it?.label ?? "Interact").trim();
    const kind = String(it?.kind ?? "").toLowerCase();
    const lower = raw.toLowerCase();

    if (/evelyn|bram|wren|keeper|guide|guest|pastor|andrew/.test(`${kind} ${lower}`)) {
      // Normalize any pre-existing or accidentally duplicated verb prefixes.
      const subject = raw.replace(/^(?:talk\s+to\s+)+/i, "").trim();
      return `Talk to ${subject || "them"}`;
    }
    if (/rest|bed|hearth|camp|stone/.test(`${kind} ${lower}`)) {
      return lower.startsWith("rest") ? raw : `Rest at ${raw}`;
    }
    if (/key/.test(`${kind} ${lower}`)) return `Open ${raw}`;
    if (/chest|box|crate/.test(`${kind} ${lower}`)) return `Open ${raw}`;
    if (/sign|journal|book|letter|note/.test(`${kind} ${lower}`)) return `Read ${raw}`;
    if (/portal|gateway|gate|door|entrance/.test(`${kind} ${lower}`)) return `Enter ${raw}`;
    if (/forge|anvil/.test(`${kind} ${lower}`)) return `Use ${raw}`;
    if (/relic|pickup|heart|envelope/.test(`${kind} ${lower}`)) return `Take ${raw}`;
    if (/talk|open|read|rest|enter|use|take/.test(lower)) return raw;
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
        const pulse = 0.92 + (Math.sin(time / 210) + 1) * 0.04;
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
          plate
            .setPosition(obj.x, obj.y - Math.max(24, (obj.displayHeight ?? 32) * 0.62))
            .setVisible(show)
            .setAlpha(show ? 0.92 : 0);
        }
      }
    }

    if (this.promptText && near) {
      const label = contextualLabel(near);
      this.prompt = label;
      this.promptText
        .setText(`E  ·  ${label}`)
        .setFontFamily("system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif")
        .setFontSize(9)
        .setFontStyle("600")
        .setColor("#f8fbff")
        .setBackgroundColor("#10233f")
        .setPadding(7, 4, 7, 4)
        .setStroke("#071426", 1)
        .setShadow(0, 2, "#000000", 3, false, true)
        .setAlpha(0.96)
        .setOrigin(0.5, 1)
        .setPosition(this.player.x, this.player.y - 31)
        .setDepth(100000)
        .setVisible(true);
    }

    return result;
  };
}
