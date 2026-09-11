// @ts-nocheck -- Exact Act II interaction-copy + hit-feedback corrections.

/**
 * Runs after the existing interaction polish so it only corrects final
 * player-facing prompt text and the Summer guardian hit reaction.
 */
export function installInteractionCopyFixes(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionCopyFixesInstalled) return;
  proto.__interactionCopyFixesInstalled = true;

  const originalUpdate = proto.update;
  if (typeof originalUpdate === "function") {
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
      else if (
        kind === "season-mini-game" &&
        (String(near.data?.season ?? "").toLowerCase() === "autumn" || id.startsWith("autumn:")) &&
        raw.toLowerCase().includes("release")
      ) corrected = "Release";

      if (corrected) {
        this.prompt = corrected;
        this.promptText?.setText?.(`E  ·  ${corrected}`);
      }

      return result;
    };
  }

  const originalTransformEnemy = proto.transformEnemy;
  if (typeof originalTransformEnemy === "function") {
    proto.transformEnemy = function interactionHitFeedback(enemy: any, ...args: any[]) {
      const isSummerGuardian =
        this.save?.current_zone === "wedding_garden" &&
        enemy?.active &&
        (enemy.getData?.("summerGuardian") === true || enemy.getData?.("seasonMiniGame") === "Summer");

      if (isSummerGuardian && this.__summerSwordStrike) {
        const baseX = Number(enemy.getData?.("summerHitBaseScaleX") ?? enemy.scaleX ?? 1);
        const baseY = Number(enemy.getData?.("summerHitBaseScaleY") ?? enemy.scaleY ?? 1);
        enemy.setData?.("summerHitBaseScaleX", baseX);
        enemy.setData?.("summerHitBaseScaleY", baseY);

        const previousTween = enemy.getData?.("summerHitTween");
        previousTween?.stop?.();
        previousTween?.remove?.();

        enemy.setScale?.(baseX, baseY);
        const tween = this.tweens?.add?.({
          targets: enemy,
          scaleX: baseX * 1.18,
          scaleY: baseY * 1.18,
          duration: 70,
          yoyo: true,
          ease: "Quad.easeOut",
          onComplete: () => {
            if (enemy?.active) enemy.setScale?.(baseX, baseY);
            enemy?.setData?.("summerHitTween", null);
          },
        });
        enemy.setData?.("summerHitTween", tween ?? null);
      }

      return originalTransformEnemy.call(this, enemy, ...args);
    };
  }
}
