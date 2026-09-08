// @ts-nocheck -- Runtime scene decorator for low-risk interaction polish.

/**
 * Gives the nearest usable interactable a gentle proximity pulse and upgrades
 * the floating interaction prompt with a concise contextual verb.
 * No radii, interaction handlers, quest state, or gameplay rules are changed.
 */
export function installInteractionPolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionPolishInstalled) return;
  proto.__interactionPolishInstalled = true;

  const baseAlpha = new WeakMap<object, number>();
  const originalUpdate = proto.update;

  const contextualLabel = (it: any) => {
    const raw = String(it?.label ?? "Interact").trim();
    const kind = String(it?.kind ?? "").toLowerCase();
    const lower = raw.toLowerCase();

    if (/evelyn|bram|wren|keeper|guide|guest|pastor|andrew/.test(`${kind} ${lower}`)) {
      return `Talk to ${raw}`;
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

  proto.update = function interactionPolishUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    const list = Array.isArray(this.interactables) ? this.interactables : [];
    const near = typeof this.nearest === "function" ? this.nearest() : null;

    // Restore every non-nearby interactable, then gently breathe the nearest one.
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
