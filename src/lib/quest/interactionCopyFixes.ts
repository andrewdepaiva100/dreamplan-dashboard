// @ts-nocheck -- Exact Act II interaction-copy + gameplay corrections.

function addExtraAct4Hearts(scene: any) {
  if (scene.save?.current_zone !== "starry_ascent" || !scene.hearts || !scene.layer) return;

  const worldW = Math.max(160, Number(scene.mapW ?? 35) * 16);
  const worldH = Math.max(160, Number(scene.mapH ?? 35) * 16);

  const place = (key: "heart-pickup" | "golden-heart", count: number) => {
    let made = 0;
    let tries = 0;
    while (made < count && tries < count * 80) {
      tries++;
      const x = Phaser.Math.Between(56, Math.max(56, worldW - 56));
      const y = Phaser.Math.Between(56, Math.max(56, worldH - 56));
      const tile = scene.layer?.getTileAtWorldXY?.(x, y);
      if (!tile || tile.collides) continue;
      if (scene.player?.active && Phaser.Math.Distance.Between(x, y, scene.player.x, scene.player.y) < 100) continue;

      const heart = scene.hearts.create(x, y, key) as Phaser.Physics.Arcade.Sprite | null;
      if (!heart) continue;
      heart.setDepth?.(9).setData?.("golden", key === "golden-heart");
      const body = heart.body as Phaser.Physics.Arcade.Body | undefined;
      body?.setAllowGravity?.(false);
      scene.tweens?.add?.({
        targets: heart,
        y: y - 5,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
      made++;
    }
  };

  // Act IV gets seven additional recovery pickups: four red and three golden.
  place("heart-pickup", 4);
  place("golden-heart", 3);
}

/**
 * Runs after the existing interaction polish so it can correct final
 * player-facing copy and small Act II regressions without rewriting the core scene.
 */
export function installInteractionCopyFixes(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__interactionCopyFixesInstalled) return;
  proto.__interactionCopyFixesInstalled = true;

  const originalSpawnHearts = proto.spawnHearts;
  if (typeof originalSpawnHearts === "function") {
    proto.spawnHearts = function extraAct4RecoveryHearts(...args: any[]) {
      const result = originalSpawnHearts.apply(this, args);
      addExtraAct4Hearts(this);
      return result;
    };
  }

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

          // Make Summer contact damage deterministic instead of depending on the
          // generic enemy overlap callback. hurtPlayerDirect uses the normal
          // player invulnerability window, so sustained contact cannot drain
          // multiple hearts in a single frame. This path never changes guardian scale.
          if (dist <= 30 && typeof this.hurtPlayerDirect === "function") {
            this.hurtPlayerDirect();
          }
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

  // Do not wrap transformEnemy for Summer hit feedback here. A previous version
  // animated scaleX/scaleY on every hit, which made the guardians appear to grow.
  // The base Summer challenge already handles tint/damage feedback without scaling.
}
