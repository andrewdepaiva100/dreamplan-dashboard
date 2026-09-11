// @ts-nocheck -- isolated, fail-safe cinematic finisher decorator for QuestScene bosses.
import * as Phaser from "phaser";

type FinisherState = {
  mode: "armed" | "executing";
  boss: Phaser.Physics.Arcade.Sprite;
  prompt: Phaser.GameObjects.Text | null;
  subPrompt: Phaser.GameObjects.Text | null;
  ring: Phaser.GameObjects.Arc | null;
  vignette: Phaser.GameObjects.Rectangle | null;
  title: Phaser.GameObjects.Text | null;
  savedZoom: number;
  savedInvulnUntil: number;
  allowLethal: boolean;
  cleaned: boolean;
};

const STATE = "__bossFinisherState";
const INSTALLED = "__bossFinisherInstalled";
const KIND = "final-strike-kind";
const DONE = "final-strike-done";

function styleFor(zone: string) {
  if (zone === "sunlit_shores") return { color: 0x72d8ff, accent: 0xffe08a, subtitle: "BREAK THE TIDE" };
  if (zone === "wedding_garden") return { color: 0xff79ad, accent: 0xffd86b, subtitle: "LET THE GARDEN BLOOM" };
  if (zone === "the_haven") return { color: 0xff6f91, accent: 0xffd47d, subtitle: "STRIKE TRUE" };
  if (zone === "starry_ascent") return { color: 0xb89cff, accent: 0xffe58c, subtitle: "SHATTER THE SHADOW" };
  return { color: 0xffd977, accent: 0xffffff, subtitle: "FINAL STRIKE" };
}

function isAct4ShardGuardian(scene: any) {
  return scene?.save?.current_zone === "starry_ascent"
    && /shard guardian/i.test(String(scene?.bossName ?? ""));
}

function markBossKind(scene: any) {
  const boss = scene?.boss;
  if (!boss?.active) return;
  if (boss.getData?.(KIND)) return;
  boss.setData?.(KIND, isAct4ShardGuardian(scene) ? "guardian" : "boss");
}

function isFinisherEligible(scene: any, boss: any) {
  if (!boss?.active) return false;
  // Act IV pillar guardians are puzzle encounters. They must bypass every part of
  // the Final Strike controller and remain owned by the canonical Act IV code.
  if (isAct4ShardGuardian(scene)) return false;
  markBossKind(scene);
  if (boss.getData?.(KIND) === "guardian") return false;
  if (boss.getData?.(DONE)) return false;
  if (Number(scene?.bossPhase ?? 0) !== 1) return false;
  if (!Number.isFinite(Number(scene?.bossHp)) || Number(scene?.bossHp) <= 0) return false;
  if (!Number.isFinite(Number(scene?.bossMax)) || Number(scene?.bossMax) <= 0) return false;
  return true;
}

function destroySafe(obj: any) {
  try { obj?.destroy?.(); } catch { /* scene teardown can race callbacks */ }
}

function sceneActive(scene: any) {
  try { return Boolean(scene?.sys?.isActive?.()); } catch { return false; }
}

function clearBossBolts(scene: any) {
  try {
    for (const child of scene.bolts?.getChildren?.() ?? []) if (child?.active) child.destroy?.();
  } catch { /* optional group */ }
}

function pauseBossTimers(scene: any, paused: boolean) {
  for (const timer of [scene.bossTimer, scene.bossShotTimer]) {
    try { if (timer && !timer.hasDispatched) timer.paused = paused; } catch { /* removed timer */ }
  }
}

function setFacing(scene: any, dx: number, dy: number) {
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
  return scene.add.text(cam.width / 2, y, text, {
    fontFamily: "Georgia, serif",
    fontSize: size,
    fontStyle: "bold",
    color,
    stroke: "#07142c",
    strokeThickness: 6,
    align: "center",
  }).setOrigin(0.5).setScrollFactor(0).setDepth(depth);
}

function cleanupFinisher(scene: any, state: FinisherState) {
  if (!state || state.cleaned) return;
  state.cleaned = true;

  try { scene.tweens?.killTweensOf?.([state.prompt, state.subPrompt, state.ring, state.vignette, state.title]); } catch {}
  destroySafe(state.prompt);
  destroySafe(state.subPrompt);
  destroySafe(state.ring);
  destroySafe(state.vignette);
  destroySafe(state.title);

  try {
    if (scene.boss?.active && scene.boss === state.boss) pauseBossTimers(scene, false);
  } catch {}

  try {
    scene.player?.setVelocity?.(0, 0);
    if (scene.vel) { scene.vel.x = 0; scene.vel.y = 0; }
  } catch {}

  try {
    scene.invulnUntil = Math.max(Number(scene.invulnUntil ?? 0), state.savedInvulnUntil);
    scene.cameras?.main?.setZoom?.(state.savedZoom);
  } catch {}

  try { scene.hand?.setVisible?.(true); } catch {}
  if (scene[STATE] === state) scene[STATE] = null;
  try { scene.pushHud?.(true); } catch {}
}

function armFinisher(scene: any, boss: Phaser.Physics.Arcade.Sprite) {
  const existing = scene[STATE] as FinisherState | undefined;
  if (existing && !existing.cleaned) return;
  if (!isFinisherEligible(scene, boss)) return;

  const cam = scene.cameras.main;
  const style = styleFor(scene.save?.current_zone ?? "");
  const state: FinisherState = {
    mode: "armed",
    boss,
    prompt: null,
    subPrompt: null,
    ring: null,
    vignette: null,
    title: null,
    savedZoom: Number(cam.zoom ?? 1),
    savedInvulnUntil: Number(scene.invulnUntil ?? 0),
    allowLethal: false,
    cleaned: false,
  };
  scene[STATE] = state;

  boss.setData?.(DONE, true);
  scene.player?.setVelocity?.(0, 0);
  boss.setVelocity?.(0, 0);
  pauseBossTimers(scene, true);
  clearBossBolts(scene);
  scene.invulnUntil = Math.max(Number(scene.invulnUntil ?? 0), Number(scene.time?.now ?? 0) + 10000);

  try {
    state.vignette = scene.add.rectangle(cam.width / 2, cam.height / 2, cam.width + 8, cam.height + 8, 0x07142c, 0.28)
      .setScrollFactor(0).setDepth(982);
    state.vignette.setBlendMode?.(Phaser.BlendModes.MULTIPLY);

    state.ring = scene.add.circle(boss.x, boss.y, 36, style.color, 0.08)
      .setStrokeStyle(3, style.accent, 0.95).setDepth(24);
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
  } catch (error) {
    console.error("[quest] final strike arm visual failed", error);
  }

  scene.pushHud?.(true);
}

function impactBurst(scene: any, x: number, y: number, style: any) {
  try {
    const outer = scene.add.circle(x, y, 18, style.accent, 0.12).setStrokeStyle(5, style.accent, 1).setDepth(985);
    const inner = scene.add.circle(x, y, 8, style.color, 0.35).setStrokeStyle(2, 0xffffff, 1).setDepth(986);
    scene.tweens.add({ targets: outer, radius: 110, alpha: 0, duration: 420, ease: "Quad.easeOut", onComplete: () => destroySafe(outer) });
    scene.tweens.add({ targets: inner, radius: 62, alpha: 0, duration: 260, ease: "Cubic.easeOut", onComplete: () => destroySafe(inner) });
    scene.spawnSparkle?.(x, y, style.accent, 34);
    scene.cameras?.main?.shake?.(170, 0.008);
    scene.cameras?.main?.flash?.(120, 255, 246, 207);
  } catch (error) {
    console.error("[quest] final strike impact visual failed", error);
  }
}

function completeBossDefeat(scene: any, state: FinisherState, originalDamageBoss: Function) {
  const boss = state.boss;
  if (!boss?.active || scene.boss !== boss) {
    cleanupFinisher(scene, state);
    return;
  }

  cleanupFinisher(scene, state);

  scene.bossHp = 1;
  scene.bossHitAt = 0;
  state.allowLethal = true;
  try {
    originalDamageBoss.call(scene, 1);
  } catch (error) {
    console.error("[quest] final strike canonical defeat failed; attempting safe boss fallback", error);
    try {
      if (scene.boss === boss && boss.active && typeof scene.defeatActBoss === "function") {
        scene.bossHp = 0;
        scene.defeatActBoss();
      }
    } catch (fallbackError) {
      console.error("[quest] final strike fallback defeat failed", fallbackError);
    }
  } finally {
    state.allowLethal = false;
  }
}

function executeFinisher(scene: any, originalDamageBoss: Function) {
  const state = scene[STATE] as FinisherState | undefined;
  if (!state || state.cleaned || state.mode !== "armed") return;
  const boss = state.boss;
  const player = scene.player as Phaser.Physics.Arcade.Sprite | undefined;
  if (!boss?.active || !player?.active || scene.boss !== boss) {
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
  if (len < 1) { dx = scene.facing >= 0 ? 1 : -1; dy = 0; len = 1; }
  const ux = dx / len;
  const uy = dy / len;
  const approachX = bx - ux * 34;
  const approachY = by - uy * 34;
  setFacing(scene, dx, dy);

  try {
    scene.hand?.setVisible?.(false);
    cam.zoomTo?.(Math.min(2.2, Math.max(state.savedZoom * 1.18, state.savedZoom + 0.12)), 220, "Sine.easeOut", true);
    state.title = fixedText(scene, cam.height * 0.30, style.subtitle, "15px", "#fff4ca", 992).setAlpha(0);
    scene.tweens.add({ targets: state.title, alpha: 1, y: state.title.y - 8, duration: 170, ease: "Quad.easeOut" });

    scene.tweens.add({
      targets: player,
      x: approachX,
      y: approachY,
      duration: 240,
      ease: "Cubic.easeIn",
      onComplete: () => {
        if (!sceneActive(scene) || state.cleaned || scene.boss !== boss || !boss.active) {
          cleanupFinisher(scene, state);
          return;
        }

        try {
          player.setVelocity?.(0, 0);
          scene.hand?.setVisible?.(true);
          scene.updateHand?.(scene.lastDir);
          const angle = Math.atan2(uy, ux);
          const slash = scene.add.arc(bx, by, 56, Phaser.Math.RadToDeg(angle) - 78, Phaser.Math.RadToDeg(angle) + 78, false, style.accent, 0.52)
            .setStrokeStyle(5, 0xffffff, 0.9).setDepth(984);
          slash.setRotation(angle);
          scene.tweens.add({ targets: slash, scale: 1.55, alpha: 0, duration: 260, ease: "Quad.easeOut", onComplete: () => destroySafe(slash) });
          impactBurst(scene, bx, by, style);
        } catch (error) {
          console.error("[quest] final strike cinematic step failed", error);
        }

        completeBossDefeat(scene, state, originalDamageBoss);
      },
    });
  } catch (error) {
    console.error("[quest] final strike execution setup failed", error);
    completeBossDefeat(scene, state, originalDamageBoss);
  }

  if (typeof window !== "undefined") {
    window.setTimeout(() => {
      if (!state.cleaned && sceneActive(scene) && scene.boss === boss && boss.active) {
        completeBossDefeat(scene, state, originalDamageBoss);
      } else if (!state.cleaned) {
        cleanupFinisher(scene, state);
      }
    }, 1400);
  }
}

export function installBossFinisher(QuestScene: any) {
  const p = QuestScene?.prototype;
  if (!p || p[INSTALLED]) return;
  p[INSTALLED] = true;

  const originalDamageBoss = p.damageBoss;
  const originalAttack = p.attack;
  const originalDash = p.dash;
  const originalInteract = p.interact;
  const originalUpdate = p.update;
  if (typeof originalDamageBoss !== "function" || typeof originalAttack !== "function") return;

  p.damageBoss = function (amount: number, ...args: any[]) {
    // Hard bypass: Shard Guardians never enter, mutate, clean up, or otherwise
    // participate in Final Strike state. Their damage/death path is untouched.
    if (isAct4ShardGuardian(this)) {
      return originalDamageBoss.call(this, amount, ...args);
    }

    const state = this[STATE] as FinisherState | undefined;
    if (state?.mode === "executing" && state.allowLethal) return originalDamageBoss.call(this, amount, ...args);
    if (state && !state.cleaned) return;

    const boss = this.boss as Phaser.Physics.Arcade.Sprite | null;
    markBossKind(this);

    if (!isFinisherEligible(this, boss)) return originalDamageBoss.call(this, amount, ...args);

    const hp = Number(this.bossHp ?? 0);
    const max = Number(this.bossMax ?? 0);
    const incoming = Math.max(0, Number(amount) || 0);
    const threshold = Math.max(1, Math.ceil(max * 0.12));
    const projected = hp - incoming;
    if (projected > threshold) return originalDamageBoss.call(this, amount, ...args);

    const damageToOne = Math.max(0, hp - 1);
    if (damageToOne > 0) {
      this.bossHitAt = 0;
      originalDamageBoss.call(this, damageToOne, ...args);
    }

    if (this.boss === boss && boss?.active) {
      this.bossHp = 1;
      armFinisher(this, boss);
      this.pushHud?.(true);
    }
  };

  p.attack = function (...args: any[]) {
    // Shard Guardian attacks always use the original combat input path.
    if (isAct4ShardGuardian(this)) return originalAttack.apply(this, args);
    const state = this[STATE] as FinisherState | undefined;
    if (state?.mode === "armed" && !state.cleaned) {
      executeFinisher(this, originalDamageBoss);
      return;
    }
    if (state?.mode === "executing" && !state.cleaned) return;
    return originalAttack.apply(this, args);
  };

  if (typeof originalDash === "function") {
    p.dash = function (...args: any[]) {
      if (isAct4ShardGuardian(this)) return originalDash.apply(this, args);
      const state = this[STATE] as FinisherState | undefined;
      if (state && !state.cleaned) return;
      return originalDash.apply(this, args);
    };
  }

  if (typeof originalInteract === "function") {
    p.interact = function (...args: any[]) {
      if (isAct4ShardGuardian(this)) return originalInteract.apply(this, args);
      const state = this[STATE] as FinisherState | undefined;
      if (state && !state.cleaned) return;
      return originalInteract.apply(this, args);
    };
  }

  if (typeof originalUpdate === "function") {
    p.update = function (...args: any[]) {
      const result = originalUpdate.apply(this, args);

      // Most importantly, do nothing at all to Shard Guardian runtime state.
      // No frozen/input/physics/timer/camera/body writes happen here.
      if (isAct4ShardGuardian(this)) return result;

      markBossKind(this);
      const state = this[STATE] as FinisherState | undefined;
      if (state && !state.cleaned) {
        if (!state.boss?.active || this.boss !== state.boss) {
          cleanupFinisher(this, state);
          return result;
        }
        this.player?.setVelocity?.(0, 0);
        state.boss?.setVelocity?.(0, 0);
        if (this.vel) { this.vel.x = 0; this.vel.y = 0; }
        state.ring?.setPosition?.(state.boss.x, state.boss.y);
      }
      return result;
    };
  }

  const originalCreate = p.create;
  if (typeof originalCreate === "function") {
    p.create = function (...args: any[]) {
      this[STATE] = null;
      const result = originalCreate.apply(this, args);
      this.events?.once?.(Phaser.Scenes.Events.SHUTDOWN, () => {
        const state = this[STATE] as FinisherState | undefined;
        if (state && !state.cleaned) cleanupFinisher(this, state);
        this[STATE] = null;
      });
      return result;
    };
  }
}
