// @ts-nocheck -- Exact interaction-copy corrections requested for Act II.

/**
 * Runs after the existing interaction polish so it only corrects the final
 * player-facing prompt text. No interaction radii, handlers, progression, or
 * character behavior are changed.
 */
export function installInteractionCopyFixes(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionCopyFixesInstalled) return;
  proto.__interactionCopyFixesInstalled = true;

  const originalUpdate = proto.update;
  if (typeof originalUpdate !== "function") return;

  proto.update = function interactionCopyFixesUpdate(...args: any[]) {
    const result = originalUpdate.apply(this, args);
    if (this.save?.current_zone !== "wedding_garden") return result;

    const near = typeof this.nearest === "function" ? this.nearest() : null;
    if (!near) return result;

    const kind = String(near.kind ?? "").toLowerCase();
    const id = String(near.id ?? "").toLowerCase();
    const raw = String(near.label ?? "").trim();
    const haystack = `${kind} ${id} ${raw}`.toLowerCase();

    let corrected: string | null = null;
    if (kind === "guest" && id === "alicia") corrected = "Talk to Alicia";
    else if (haystack.includes("lamp")) corrected = "Lighten the lamp";

    if (corrected) {
      this.prompt = corrected;
      this.promptText?.setText?.(`E  ·  ${corrected}`);
    }

    return result;
  };
}
