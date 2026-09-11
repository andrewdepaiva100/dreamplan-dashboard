// @ts-nocheck -- Exact Act II interaction-copy + gameplay corrections.

/**
 * Runs after the existing interaction polish so it can correct final
 * player-facing copy and small Act II regressions without rewriting the core scene.
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

      // Summer guardians were spawned with zero base speed, so the normal enemy
      // update could leave them standing still even after the trial wakes them.
      // Apply their authored Summer speed after the normal update so they
      // consistently pursue Maria while awake.
      if (!this.frozen && this.player?.active) {
        for (const enemy of this.__summerGuardians ?? []) {
          if (
            !enemy?.active ||
            enemy.getData?.("summerAwake") !== true ||
            enemy.getData?.("summerDangerous") !== true ||
            !enemy.body?.enable
          ) continue;

          const dx = this.player.x - enemy.x;
          const dy = this.player.y - enemy.y;
          const dist = Math.hypot(dx, dy);
          const speed = Math.max(24, Number(enemy.getData?.("summerSpeed") ?? 51));
          if (dist > 24) enemy.setVelocity?.((dx / dist) * speed, (dy / dist) * speed);
          else enemy.setVelocity?.(0, 0);
        }
      }

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

  const originalInteract = proto.interact;
  if (typeof originalInteract === "function") {
    proto.interact = function interactionRewardFix(...args: any[]) {
      if (this.save?.current_zone === "wedding_garden") {
        const near = typeof this.nearest === "function" ? this.nearest() : null;
        if (String(near?.kind ?? "").toLowerCase() === "garden-keeper") {
          // Evelyn is now the Act II keeper, so the Act II weapon should come
          // from her conversation. Restore the Floral Bow reward on first talk.
          if (!this.save.weapons.includes("floral-bow")) {
            this.save.weapons.push("floral-bow");
            this.save.equipped_weapon = "floral-bow";
            this.emitToast?.("Evelyn gives you the Floral Bow.");
            this.emitSave?.();
            this.pushHud?.(true);
          }
        }
      }
      return originalInteract.apply(this, args);
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
