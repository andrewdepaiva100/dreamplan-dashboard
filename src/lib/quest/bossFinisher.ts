// @ts-nocheck -- isolated cinematic finisher decorator for QuestScene bosses.
import * as Phaser from "phaser";

type FinisherState = {
  mode: "armed" | "executing";
  boss: Phaser.Physics.Arcade.Sprite;
  prompt: Phaser.GameObjects.Text | null;
  subPrompt: Phaser.GameObjects.Text | null;
  ring: Phaser.GameObjects.Arc | null;
  vignette: Phaser.GameObjects.Rectangle | null;
  savedZoom: number;
  savedFrozen: boolean;
  bossBodyWasEnabled: boolean;
  allowLethal: boolean;
  cleaned: boolean;
};

const STATE = "__bossFinisherState";
const INSTALLED = "__bossFinisherInstalled";

function styleFor(zone: string) {
  if (zone === "sunlit_shores") return { color: 0x72d8ff, accent: 0xffe08a, subtitle: "BREAK THE TIDE" };
  if (zone === "wedding_garden") return { color: 0xff79ad, accent: 0xffd86b, subtitle: "LET THE GARDEN BLOOM" };
  if (zone === "the_haven") return { color: 0xff6f91, accent: 0xffd47d, subtitle: "STRIKE TRUE" };
  if (zone === "starry_ascent") return { color: 0xb89cff, accent: 0xffe58c, subtitle: "SHATTER THE SHADOW" };
  return { color: 0xffd977, accent: 0xffffff, subtitle: "END THE FIGHT" };
}

function destroySafe(obj: any) {
  try {
    if (obj?.active !== false) obj?.destroy?.();
  } catch {
    /* scene teardown can race a delayed callback */
  }
}

function clearBossBolts(scene: any) {
  try {
    for (const child of scene.bolts?.getChildren?.() ?? []) {
      if (child?.active) child.destroy?.();
    }
  } catch {
    /* optional pooled group */
  }
}

function pauseBossTimers(scene: any, paused: boolean) {
  for (const timer of [scene.bossTimer, scene.bossShotTimer]) {
    try {
      if (timer && !timer.hasDispatched) timer.paused = paused;
    } catch {
      /* timer may already have been removed by the normal defeat path */
    }
  }
}

function setFinisherFacing(scene: any, dx: number, dy: number) {
  if (Math.abs(dx) >= Math.abs(dy)) {
    scene.lastDir = "side";
    scene.facing = dx >= 0 ? 1 : -1;
    scene.player?.setFlipX?.(scene.facing < 0);
  } else {
    scene.lastDir = dy < 0 ? "up" : "down";
    scene.player?.setFlipX?.(false);
  }
}

function fixedText(scene: any, y: number, text: string, size: string, color: string, depth: number) {
  const cam = scene.cameras.main;
  return scene.add
    .text(cam.width / 2, y, text, {
      fontFamily: "Georgia, serif",
      fontSize: size,
      fontStyle: "bold",
      color,
      stroke: "#07142c",
      strokeThickness: 6,
      align: "center",
    })
    .setOrigin(0.5)
    .setScrollFactor(0)
    .setDepth(depth);
}

function armFinisher(scene: any, boss: Phaser.Physics.Arcade.Sprite) {
  const existing = scene[STATE] as FinisherState | undefined;
  if (existing && !existing.cleaned) return;
  if (!boss?.active || scene.bossPhase !== 1) return;

  const style = styleFor(scene.save?.current_zone ?? "");
  const cam = scene.cameras.main;
  const body = boss.body as Phaser.Physics.Arcade.Body | undefined;
  const state: FinisherState = {
    mode: "armed",
    boss,
    prompt: null,
    subPrompt: null,
    ring: null,
    vignette: null,
    savedZoom: cam.zoom,
    savedFrozen: Boolean(scene.frozen),
    bossBodyWasEnabled: body?.enable !== false,
    allowLethal: false,
    cleaned: false,
  };
  scene[STATE] = state;

  // The fight is already won at this point. Freeze the action cleanly so no
  // projectile, collision or minion can steal the player's finishing moment.
  scene.frozen = true;
  scene.player?.setVelocity?.(0, 0);
  boss.setVelocity?.(0, 0);
  if (body) body.enable = false;
  pauseBossTimers(scene, true);
  clearBossBolts(scene);

  state.vignette = scene.add
    .rectangle(cam.width / 2, cam.height / 2, cam.width + 8, cam.height + 8, 0x07142c, 0.28)
    .setScrollFactor(0)
    .setDepth(982);
  state.vignette.setBlendMode?.(Phaser.BlendModes.MULTIPLY);

  state.ring = scene.add
    .circle(boss.x, boss.y, 36, style.color, 0.08)
    .setStrokeStyle(3, style.accent, 0.95)
    .setDepth(24);
  scene.tweens.add({
    targets: state.ring,
    radius: { from: 34, to: 54 },
    alpha: { from: 0.9, to: 0.35 },
    duration: 700,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  state.prompt = fixedText(scene, cam.height * 0.38, "✦  FINAL STRIKE  ✦", "28px", "#ffe6a8", 991);
  state.subPrompt = fixedText(scene, cam.height * 0.38 + 42, "SPACE / ACTION", "13px", "#ffffff", 991);
  state.subPrompt.setAlpha(0.9);
  scene.tweens.add({
    targets: [state.prompt, state.subPrompt],
    alpha: { from: 0.72, to: 1 },
    scale: { from: 0.98, to: 1.035 },
    duration: 620,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  scene.spawnSparkle?.(boss.x, boss.y, style.color, 18);
  scene.pushHud?.(true);
}

function impactBurst(scene: any, x: number, y: number, style: any) {
  const outer = scene.add.circle(x, y, 18, style.accent, 0.12).setStrokeStyle(5, style.accent, 1).setDepth(985);
  const inner = scene.add.circle(x, y, 8, style.color, 0.35).setStrokeStyle(2, 0xffffff, 1).setDepth(986);
  scene.tweens.add({
    targets: outer,
    radius: 110,
    alpha: 0,
    duration: 420,
    ease: "Quad.easeOut",
    onComplete: () => destroySafe(outer),
  });
  scene.tweens.add({
    targets: inner,
    radius: 62,
    alpha: 0,
    duration: 260,
    ease: "Cubic.easeOut",
    onComplete: () => destroySafe(inner),
  });
  scene.spawnSparkle?.(x, y, style.accent, 34);
  scene.cameras.main.shake(170, 0.008);
  scene.cameras.main.flash(120, 255, 246, 207);
}

function cleanupFinisher(scene: any, state: FinisherState, restorePlay = true) {
  if (!state || state.cleaned) return;
  state.cleaned = true;
  destroySafe(state.prompt);
  destroySafe(state.subPrompt);
  destroySafe(state.ring);
  destroySafe(state.vignette);

  const bossStillAlive = scene.boss?.active && scene.boss === state.boss;
  if (bossStillAlive) {
    const body = scene.boss.body as Phaser.Physics.Arcade.Body | undefined;
    if (body) body.enable = state.bossBodyWasEnabled;
    pauseBossTimers(scene, false);
  }

  if (restorePlay && scene.sys?.isActive?.()) {
    // Never override another system that intentionally opened a modal/cutscene
    // after the boss died. We restore only when no new freeze replaced ours.
    if (scene.frozen === true) scene.frozen = state.savedFrozen;
  }
  if (scene[STATE] === state) scene[STATE] = null;
}

function executeFinisher(scene: any, originalAttack: Function, originalDamageBoss: Function) {
  const state = scene[STATE] as FinisherState | undefined;
  if (!state || state.cleaned || state.mode !== "armed") return;
  const boss = state.boss;
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!boss?.active || !player?.active) {
    cleanupFinisher(scene, state);
    return;
  }

  state.mode = "executing";
  destroySafe(state.prompt);
  destroySafe(state.subPrompt);
  state.prompt = null;
  state.subPrompt = null;

  const style = styleFor(scene.save?.current_zone ?? "");
  const cam = scene.cameras.main;
  const bx = boss.x;
  const by = boss.y;
  let dx = bx - player.x;
  let dy = by - player.y;
  let len = Math.hypot(dx, dy);
  if (len < 1) {
    dx = scene.facing >= 0 ? 1 : -1;
    dy = 0;
    len = 1;
  }
  const ux = dx / len;
  const uy = dy / len;
  const approachX = bx - ux * 34;
  const approachY = by - uy * 34;
  const throughX = bx + ux * 52;
  const throughY = by + uy * 52;
  setFinisherFacing(scene, dx, dy);

  scene.hand?.setVisible?.(false);
  cam.zoomTo(Math.min(2.2, Math.max(state.savedZoom * 1.18, state.savedZoom + 0.12)), 260, "Sine.easeOut", true);
  const title = fixedText(scene, cam.height * 0.30, style.subtitle, "15px", "#fff4ca", 992);
  title.setAlpha(0);
  scene.tweens.add({ targets: title, alpha: 1, y: title.y - 8, duration: 220, ease: "Quad.easeOut" });

  // Dash to striking distance. This is deliberately positional rather than
  // physics-driven so walls, knockback and framerate cannot interrupt it.
  scene.tweens.add({
    targets: player,
    x: approachX,
    y: approachY,
    duration: 300,
    ease: "Cubic.easeIn",
    onUpdate: () => {
      const ghost = scene.add.sprite(player.x - ux * 8, player.y - uy * 8, player.texture.key).setDepth(player.depth - 0.1).setAlpha(0.18);
      ghost.setFlipX?.(player.flipX);
      scene.tweens.add({ targets: ghost, alpha: 0, duration: 140, onComplete: () => destroySafe(ghost) });
    },
    onComplete: () => {
      if (!scene.sys?.isActive?.()) return;
      player.setVelocity?.(0, 0);
      scene.hand?.setVisible?.(true);
      scene.updateHand?.(scene.lastDir);

      // Oversized cinematic slash layered over the game's normal weapon swing.
      const angle = Math.atan2(uy, ux);
      const slash = scene.add
        .arc(bx, by, 56, Phaser.Math.RadToDeg(angle) - 78, Phaser.Math.RadToDeg(angle) + 78, false, style.accent, 0.52)
        .setStrokeStyle(5, 0xffffff, 0.9)
        .setDepth(984);
      slash.setRotation(angle);
      scene.tweens.add({
        targets: slash,
        scale: 1.55,
        alpha: 0,
        duration: 300,
        ease: "Quad.easeOut",
        onComplete: () => destroySafe(slash),
      });

      // Let the existing attack/damage/defeat code own the lethal hit. The boss
      // is already at 1 HP, so this preserves every existing relic, portal,
      // guardian and second-boss transition exactly as authored.
      scene.bossHp = 1;
      scene.bossHitAt = 0;
      scene.swingAt = 0;
      state.allowLethal = true;
      const wasFrozen = scene.frozen;
      scene.frozen = false;
      try {
        originalAttack.call(scene);
      } finally {
        scene.frozen = wasFrozen;
        state.allowLethal = false;
      }

      // Failsafe: if another decorator prevented the normal swing from landing,
      // invoke the original boss damage path once at 1 HP. This still uses the
      // game's canonical defeatActBoss() and therefore cannot bypass rewards.
      if (scene.boss?.active && scene.boss === boss) {
        scene.bossHitAt = 0;
        state.allowLethal = true;
        try {
          originalDamageBoss.call(scene, Math.max(1, scene.bossHp));
        } finally {
          state.allowLethal = false;
        }
      }

      impactBurst(scene, bx, by, style);

      scene.time.delayedCall(90, () => {
        if (!player?.active) return;
        scene.tweens.add({
          targets: player,
          x: throughX,
          y: throughY,
          duration: 240,
          ease: "Cubic.easeOut",
        });
      });

      scene.time.delayedCall(430, () => {
        destroySafe(title);
        cam.zoomTo(state.savedZoom, 320, "Sine.easeInOut", true);
      });
      scene.time.delayedCall(720, () => cleanupFinisher(scene, state));
    },
  });

  // Absolute safety net: no finisher may ever leave input or the camera locked.
  scene.time.delayedCall(3200, () => {
    if (!state.cleaned) {
      destroySafe(title);
      try { cam.zoomTo(state.savedZoom, 180, "Linear", true); } catch { /* scene ended */ }
      cleanupFinisher(scene, state);
    }
  });
}

export function installBossFinisher(QuestScene: any) {
  const p = QuestScene?.prototype;
  if (!p || p[INSTALLED]) return;
  p[INSTALLED] = true;

  const originalAttack = p.attack;
  const originalDamageBoss = p.damageBoss;
  if (typeof originalAttack !== "function" || typeof originalDamageBoss !== "function") return;

  p.damageBoss = function (amount: number) {
    const state = this[STATE] as FinisherState | undefined;
    if (state?.mode === "executing" && state.allowLethal) {
      return originalDamageBoss.call(this, amount);
    }
    if (state && !state.cleaned) return;

    const boss = this.boss as Phaser.Physics.Arcade.Sprite | null;
    const hp = Number(this.bossHp ?? 0);
    const max = Number(this.bossMax ?? 0);
    if (!boss?.active || this.bossPhase !== 1 || hp <= 0 || max <= 0) {
      return originalDamageBoss.call(this, amount);
    }

    const threshold = Math.max(1, Math.ceil(max * 0.12));
    const projected = hp - Math.max(0, Number(amount) || 0);
    if (projected > threshold) return originalDamageBoss.call(this, amount);

    // Clamp the threshold-crossing hit to 1 HP. We intentionally call the
    // original damage function so its hit flash, recoil, numbers and any other
    // installed combat polish still run before the cinematic arms.
    const damageToOne = Math.max(0, hp - 1);
    const before = this.bossHp;
    if (damageToOne > 0) originalDamageBoss.call(this, damageToOne);

    if (this.boss?.active && (this.bossHp === 1 || before === 1)) {
      this.bossHp = 1;
      armFinisher(this, this.boss);
      this.pushHud?.(true);
    }
  };

  p.attack = function (...args: any[]) {
    const state = this[STATE] as FinisherState | undefined;
    if (state?.mode === "armed" && !state.cleaned) {
      executeFinisher(this, originalAttack, originalDamageBoss);
      return;
    }
    if (state?.mode === "executing" && !state.cleaned) return;
    return originalAttack.apply(this, args);
  };

  // Scene teardown must never preserve a decorator-owned visual/state object.
  const originalCreate = p.create;
  if (typeof originalCreate === "function") {
    p.create = function (...args: any[]) {
      this[STATE] = null;
      const result = originalCreate.apply(this, args);
      this.events?.once?.(Phaser.Scenes.Events.SHUTDOWN, () => {
        const state = this[STATE] as FinisherState | undefined;
        if (state && !state.cleaned) cleanupFinisher(this, state, false);
        this[STATE] = null;
      });
      return result;
    };
  }
}
