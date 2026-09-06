// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";
import { T } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const STOMP_RADIUS = 190;
const STOMP_DAMAGE = 2;
const STOMP_TELEGRAPH_MS = 700;
const STOMP_COOLDOWN_MS = 5600;
const STOMP_ZONES = new Set(["sunlit_shores", "starry_ascent"]);
const INTRO_OBJECTIVE = "TALK TO WREN — Walk up to Wren and press E / TALK.";

function isCoarsePointer() {
  return typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
}

function tutorialActive(scene: SceneLike) {
  return scene.save?.current_zone === "sunlit_shores" && (scene.save?.weapons?.length ?? 0) === 0;
}

function findGuide(scene: SceneLike) {
  return (scene.interactables ?? []).find((it: any) => it?.kind === "act-guide" && it?.obj?.active);
}

function ensureIntroTutorial(scene: SceneLike) {
  if (!tutorialActive(scene)) {
    if (scene.__introGuideMarker) {
      scene.tweens?.killTweensOf?.(scene.__introGuideMarker);
      scene.__introGuideMarker.destroy?.();
      scene.__introGuideMarker = undefined;
    }
    scene.__introTutorialCard?.destroy?.();
    scene.__introTutorialCard = undefined;
    if (scene.__introObjectiveBackup && scene.objective === INTRO_OBJECTIVE) {
      scene.objective = scene.__introObjectiveBackup;
      scene.pushHud?.(true);
    }
    scene.__introObjectiveBackup = undefined;
    toggleTalkButton(false);
    return;
  }

  const guide = findGuide(scene);
  if (!guide?.obj) return;

  if (!scene.__introObjectiveBackup) scene.__introObjectiveBackup = scene.objective;
  if (scene.objective !== INTRO_OBJECTIVE) {
    scene.objective = INTRO_OBJECTIVE;
    scene.pushHud?.(true);
  }

  if (!scene.__introGuideMarker?.active) {
    const marker = scene.add
      .triangle(guide.obj.x, guide.obj.y - 46, 0, 18, 10, 0, -10, 0, 0xffd84d, 1)
      .setStrokeStyle(2, 0xffffff, 0.95)
      .setDepth(990);
    marker.setData("quest-intro-marker", true);
    scene.tweens.add({
      targets: marker,
      y: marker.y - 9,
      scale: { from: 0.9, to: 1.1 },
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    scene.__introGuideMarker = marker;
  }

  if (!scene.__introTutorialCard?.active) {
    const width = Math.min(Math.max(250, scene.scale?.width - 48), 430);
    const card = scene.add
      .text((scene.scale?.width ?? 800) / 2, 132, "YOUR JOURNEY STARTS WITH PEOPLE\nTalk to Wren first. Characters reveal where to go, give important items, and move the story forward.", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "13px",
        fontStyle: "bold",
        align: "center",
        color: "#fff8dc",
        backgroundColor: "rgba(11,30,61,0.93)",
        padding: { x: 14, y: 10 },
        wordWrap: { width: width - 28 },
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(999);
    card.setStroke("#3a2d0f", 2);
    scene.__introTutorialCard = card;
  }

  scene.__introGuideMarker?.setPosition(guide.obj.x, guide.obj.y - 46);
  scene.__introTutorialCard?.setPosition((scene.scale?.width ?? 800) / 2, 132);
  const near = scene.player && Phaser.Math.Distance.Between(scene.player.x, scene.player.y, guide.obj.x, guide.obj.y) < 125;
  toggleTalkButton(Boolean(near));
}

function toggleTalkButton(on: boolean) {
  if (typeof document === "undefined") return;
  for (const button of Array.from(document.querySelectorAll("button"))) {
    if ((button.textContent ?? "").trim() !== "TALK") continue;
    button.classList.toggle("quest-tutorial-talk", on);
  }
}

function spawnAct1Butterflies(scene: SceneLike) {
  if (scene.save?.current_zone !== "sunlit_shores" || !scene.textures?.exists?.("butterfly")) return;
  const existing = (scene.children?.list ?? []).filter((child: any) => child?.getData?.("act1-butterfly") === true && child.active);
  if (existing.length >= 8) return;

  const colors = [0x83c95d, 0xa8d96d, 0xf2d34f, 0xe3b93f];
  const maxX = Math.max(6, Number(scene.mapW ?? 55) - 5);
  const maxY = Math.max(6, Number(scene.mapH ?? 50) - 5);
  const solid = new Set([T.WALL, T.HEDGE, T.VOID, T.WATER]);
  const worldW = Number(scene.mapW ?? 55) * 32;
  const worldH = Number(scene.mapH ?? 50) * 32;

  const wander = (b: Phaser.GameObjects.Sprite) => {
    if (!b.active || scene.save?.current_zone !== "sunlit_shores") return;
    const nx = Phaser.Math.Clamp(b.x + Phaser.Math.Between(-85, 85), 48, worldW - 48);
    const ny = Phaser.Math.Clamp(b.y + Phaser.Math.Between(-60, 60), 48, worldH - 48);
    b.setFlipX(nx < b.x);
    scene.tweens.add({
      targets: b,
      x: nx,
      y: ny,
      angle: Phaser.Math.Between(-10, 10),
      duration: Phaser.Math.Between(1500, 3000),
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (!b.active) return;
        scene.time.delayedCall(Phaser.Math.Between(120, 650), () => wander(b));
      },
    });
  };

  let made = 0;
  let guard = 0;
  while (made < 16 && guard++ < 240) {
    const tx = Phaser.Math.Between(4, maxX);
    const ty = Phaser.Math.Between(4, maxY);
    const tile = scene.layer?.getTileAt?.(tx, ty);
    if (!tile || solid.has(tile.index)) continue;
    const x = tx * 32 + Phaser.Math.Between(-12, 12);
    const y = ty * 32 + Phaser.Math.Between(-10, 10);
    if (scene.player && Phaser.Math.Distance.Between(x, y, scene.player.x, scene.player.y) < 130) continue;
    const b = scene.add
      .sprite(x, y, "butterfly")
      .setDepth(13)
      .setTint(colors[made % colors.length]!)
      .setAlpha(0.88)
      .setScale(Phaser.Math.FloatBetween(0.72, 1.05));
    b.setData("act1-butterfly", true);
    scene.tweens.add({
      targets: b,
      scaleX: b.scaleX * 0.45,
      y: y - Phaser.Math.Between(3, 8),
      duration: Phaser.Math.Between(140, 220),
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    wander(b);
    made++;
  }
}

function removeFenceOverlaps(scene: SceneLike) {
  const houses = (scene.children?.list ?? []).filter((o: any) => ["house", "cottage"].includes(o?.texture?.key) && o.active);
  const fences = (scene.children?.list ?? []).filter((o: any) => o?.texture?.key === "fence" && o.active);
  for (const fence of fences as any[]) {
    const overlaps = houses.some((house: any) => {
      const hw = Math.max(44, Number(house.displayWidth ?? house.width ?? 70) * 0.52);
      const hh = Math.max(32, Number(house.displayHeight ?? house.height ?? 70) * 0.46);
      return Math.abs(fence.x - house.x) < hw && Math.abs(fence.y - house.y) < hh;
    });
    if (overlaps) fence.destroy?.();
  }
}

function stompColor(scene: SceneLike) {
  return scene.save?.current_zone === "starry_ascent" ? 0x9aa8ff : 0x6fd3e8;
}

function clearStomp(scene: SceneLike) {
  scene.__bossStompRing?.destroy?.();
  scene.__bossStompRing = undefined;
  scene.__bossStompCharging = false;
}

function executeStomp(scene: SceneLike) {
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | undefined;
  if (!boss?.active || scene.bossPhase !== 1 || !STOMP_ZONES.has(scene.save?.current_zone)) {
    clearStomp(scene);
    return;
  }

  const color = stompColor(scene);
  scene.__bossStompRing?.destroy?.();
  scene.__bossStompRing = undefined;
  scene.__bossStompCharging = false;
  scene.__bossStompNextAt = scene.time.now + STOMP_COOLDOWN_MS;

  const impact = scene.add.circle(boss.x, boss.y, 28, color, 0.22).setStrokeStyle(5, color, 0.95).setDepth(970);
  scene.tweens.add({
    targets: impact,
    radius: STOMP_RADIUS,
    alpha: 0,
    duration: 380,
    ease: "Quad.easeOut",
    onComplete: () => impact.destroy(),
  });
  scene.cameras.main.shake(260, 0.012);

  if (!scene.player?.active) return;
  const d = Phaser.Math.Distance.Between(boss.x, boss.y, scene.player.x, scene.player.y);
  if (d > STOMP_RADIUS || scene.time.now < Number(scene.invulnUntil ?? 0)) return;

  const a = Math.atan2(scene.player.y - boss.y, scene.player.x - boss.x);
  const knock = 330;
  scene.invulnUntil = scene.time.now + 1300;
  scene.save.player_health = Math.max(0, Number(scene.save.player_health ?? 5) - STOMP_DAMAGE);
  scene.vel = scene.vel ?? { x: 0, y: 0 };
  scene.vel.x = Math.cos(a) * knock;
  scene.vel.y = Math.sin(a) * knock;
  scene.player.setVelocity(scene.vel.x, scene.vel.y);
  scene.player.setTint(0xff8f8f);
  scene.time.delayedCall(260, () => scene.player?.active && scene.player.clearTint());
  scene.floatText?.(scene.player.x, scene.player.y - 12, `-${STOMP_DAMAGE} ♥`, "#ff8f8f", true);
  scene.emitSave?.();
  scene.pushHud?.(true);
  if (scene.save.player_health <= 0) scene.openModal?.({ type: "gameover" });
}

function updateBossStomp(scene: SceneLike, time: number) {
  const boss = scene.boss as Phaser.Physics.Arcade.Sprite | undefined;
  const valid = Boolean(boss?.active && scene.bossPhase === 1 && STOMP_ZONES.has(scene.save?.current_zone));
  if (!valid) {
    clearStomp(scene);
    scene.__bossStompNextAt = undefined;
    return;
  }

  if (scene.__bossStompCharging) {
    boss!.setVelocity(0, 0);
    scene.__bossStompRing?.setPosition(boss!.x, boss!.y);
    return;
  }

  if (!scene.__bossStompNextAt) {
    scene.__bossStompNextAt = time + 2800;
    return;
  }
  if (time < scene.__bossStompNextAt) return;

  const distance = Phaser.Math.Distance.Between(boss!.x, boss!.y, scene.player.x, scene.player.y);
  if (distance > 470) {
    scene.__bossStompNextAt = time + 500;
    return;
  }

  scene.__bossStompCharging = true;
  boss!.setVelocity(0, 0);
  const color = stompColor(scene);
  const ring = scene.add.circle(boss!.x, boss!.y, 24, color, 0.08).setStrokeStyle(4, color, 0.9).setDepth(965);
  scene.__bossStompRing = ring;
  scene.tweens.add({
    targets: ring,
    radius: STOMP_RADIUS,
    alpha: { from: 0.75, to: 0.18 },
    duration: STOMP_TELEGRAPH_MS,
    ease: "Sine.easeOut",
  });
  scene.tweens.add({
    targets: boss,
    scaleX: (boss!.scaleX || 1) * 1.16,
    scaleY: (boss!.scaleY || 1) * 0.86,
    duration: 180,
    yoyo: true,
    repeat: 1,
  });
  scene.time.delayedCall(STOMP_TELEGRAPH_MS, () => executeStomp(scene));
}

function crossingState() {
  if (typeof window === "undefined") return { wardenDefeated: false };
  try {
    const raw = JSON.parse(window.localStorage.getItem("marias-quest-last-crossing-v1") ?? "{}") as { wardenDefeated?: boolean };
    return { wardenDefeated: Boolean(raw.wardenDefeated) };
  } catch {
    return { wardenDefeated: false };
  }
}

function silasPortrait() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="#33465d"/><circle cx="160" cy="126" r="76" fill="#d7a47b"/><path d="M82 126c4-70 42-99 83-99 50 0 86 34 87 97-24-17-40-47-54-69-24 28-62 50-116 71Z" fill="#5a402e"/><ellipse cx="132" cy="132" rx="8" ry="6" fill="#29231f"/><ellipse cx="188" cy="132" rx="8" ry="6" fill="#29231f"/><path d="M145 170q17 12 33 0" stroke="#915949" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M72 320c6-78 36-116 88-116 53 0 84 38 89 116Z" fill="#203b5a"/><path d="M95 222c38 24 89 24 129 0l-18 38c-31 14-61 14-94 0Z" fill="#a9513c"/><path d="M228 220l54 12-13 70-54-12Z" fill="#b58b57"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function closeSilas(scene: SceneLike, overlay: HTMLElement) {
  overlay.remove();
  scene.__silasBridgeDialogueOpen = false;
  scene.frozen = false;
  scene.physics.resume();
}

function showSilasBridgeDialogue(scene: SceneLike) {
  if (scene.__silasBridgeDialogueOpen) return;
  const parent = scene.game.canvas?.parentElement;
  if (!parent) return;
  scene.__silasBridgeDialogueOpen = true;
  scene.frozen = true;
  scene.physics.pause();

  const overlay = document.createElement("div");
  Object.assign(overlay.style, { position: "absolute", inset: "0", zIndex: "10030", display: "flex", alignItems: window.innerWidth < 640 ? "flex-end" : "center", justifyContent: "center", padding: "12px", background: "rgba(6,10,24,.6)", backdropFilter: "blur(3px)", boxSizing: "border-box" });
  const shell = document.createElement("div");
  Object.assign(shell.style, { width: "min(100%, 768px)", display: "flex", alignItems: "flex-end", gap: window.innerWidth < 640 ? "0" : "12px", position: "relative" });
  const portrait = document.createElement("img");
  portrait.src = silasPortrait();
  portrait.alt = "Silas";
  Object.assign(portrait.style, { width: "176px", height: "176px", flex: "0 0 176px", objectFit: "cover", borderRadius: "16px", border: "2px solid rgba(201,162,75,.72)", display: window.innerWidth < 640 ? "none" : "block" });
  const panel = document.createElement("div");
  Object.assign(panel.style, { position: "relative", flex: "1", minHeight: "176px", borderRadius: "16px", border: "2px solid rgba(201,162,75,.72)", background: "rgba(10,16,34,.97)", color: "white", padding: "16px", boxSizing: "border-box", boxShadow: "0 18px 40px rgba(0,0,0,.42)" });
  const close = document.createElement("button");
  close.type = "button";
  close.textContent = "×";
  Object.assign(close.style, { position: "absolute", right: "10px", top: "8px", width: "34px", height: "34px", borderRadius: "50%", border: "1px solid rgba(201,162,75,.6)", background: "#0b1e3d", color: "#d9b75e", cursor: "pointer", fontSize: "20px" });
  close.addEventListener("click", () => closeSilas(scene, overlay));
  const heading = document.createElement("div");
  heading.innerHTML = `<span style="font-family:Georgia,serif;font-size:18px;font-weight:700;color:#d9b75e">Silas</span><span style="margin-left:12px;font-size:10px;letter-spacing:.18em;color:rgba(255,255,255,.5);font-weight:700">CARTOGRAPHER</span>`;
  const line = document.createElement("p");
  Object.assign(line.style, { margin: "12px 0 0", minHeight: "58px", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: "15px", lineHeight: "1.5", color: "rgba(255,255,255,.95)" });
  const choices = document.createElement("div");
  Object.assign(choices.style, { display: "grid", gap: "7px", marginTop: "10px" });
  panel.append(close, heading, line, choices);
  shell.append(portrait, panel);
  overlay.append(shell);
  parent.append(overlay);

  const defeated = crossingState().wardenDefeated;
  if (defeated) {
    line.textContent = "“You made the crossing. Good. Then the road finally has a new story to tell.”";
    panel.addEventListener("click", (e) => { if (e.target === panel || e.target === line) closeSilas(scene, overlay); }, { once: true });
    return;
  }

  line.textContent = "“Stop before the bridge. If you're planning to face the Warden, don't cross yet. Go to The Last Crossing first.”";
  const options = [
    ["Where is The Last Crossing?", "Southeast of here. Follow the old road until you see the lamps. Three travelers live there — Elara, Pip, and Maeve. Talk to all three before you face the Warden."],
    ["Why do I need to go there?", "Because all three challenged the Warden and survived. They know what the crossing costs, and they have something that can help you. Go to The Last Crossing first."],
    ["I can handle the Warden myself.", "Maybe you can. Go anyway. Confidence is useful; information is better. The Last Crossing is southeast — speak to the three travelers before you cross this bridge."],
  ] as const;
  for (const [maria, reply] of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `“${maria}”`;
    Object.assign(button.style, { width: "100%", border: "1px solid rgba(201,162,75,.36)", borderRadius: "11px", padding: "9px 11px", background: "rgba(255,255,255,.05)", color: "white", textAlign: "left", cursor: "pointer", fontSize: "13px" });
    button.addEventListener("click", () => {
      choices.innerHTML = "";
      line.textContent = `“${reply}”`;
      const done = document.createElement("button");
      done.type = "button";
      done.textContent = "Continue";
      Object.assign(done.style, { width: "100%", minHeight: "42px", borderRadius: "11px", border: "1px solid #d9b75e", background: "rgba(201,162,75,.13)", color: "#d9b75e", fontWeight: "800", cursor: "pointer" });
      done.addEventListener("click", () => closeSilas(scene, overlay));
      choices.append(done);
    });
    choices.append(button);
  }
}

export function installAct1GameplayPolish(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__act1GameplayPolishInstalled) return;
  proto.__act1GameplayPolishInstalled = true;

  const originalCreate = proto.create;
  proto.create = function act1GameplayPolishCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    this.time.delayedCall(80, () => {
      spawnAct1Butterflies(this);
      removeFenceOverlaps(this);
      ensureIntroTutorial(this);
    });
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act1GameplayPolishInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === "last-crossing-silas") {
      showSilasBridgeDialogue(this);
      return;
    }
    return originalInteract.apply(this, args);
  };

  const originalUpdate = proto.update;
  proto.update = function act1GameplayPolishUpdate(this: SceneLike, time: number, delta: number, ...args: any[]) {
    if (isCoarsePointer() && this.stick) {
      const x = Number(this.stick.x ?? 0);
      const y = Number(this.stick.y ?? 0);
      const len = Math.hypot(x, y);
      if (len < 0.04) this.stick = { x: 0, y: 0 };
      else if (len < 1) {
        const boosted = Math.min(1, 0.22 + len * 0.98);
        this.stick = { x: (x / len) * boosted, y: (y / len) * boosted };
      }
    }

    const result = originalUpdate.call(this, time, delta, ...args);
    if (!this.player?.active || this.frozen) return result;
    ensureIntroTutorial(this);
    updateBossStomp(this, time);
    return result;
  };
}
