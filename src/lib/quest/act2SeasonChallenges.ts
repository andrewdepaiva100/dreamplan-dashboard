// @ts-nocheck -- Act II seasonal mini-games + visible restoration payoff.
// Existing Seasonal Keys remain the authoritative 0/4 progression.

const ZONE = "wedding_garden";
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"] as const;
const TINTS: Record<string, number> = {
  Spring: 0xa9ef8c,
  Summer: 0xffcf62,
  Autumn: 0xd88945,
  Winter: 0xc9e4ff,
};
const SPOTS: Record<string, [number, number]> = {
  Spring: [18, 18],
  Summer: [96, 18],
  Autumn: [18, 82],
  Winter: [96, 82],
};
const INTRO_COPY: Record<string, { kicker: string; body: string }> = {
  Spring: {
    kicker: "RENEWAL",
    body: "The garden remembers its bloom. Wake the flower beds in the order they answer you.",
  },
  Summer: {
    kicker: "PERSEVERANCE",
    body: "The garden has grown wild. Clear the bramble guardians protecting the Summer Key.",
  },
  Autumn: {
    kicker: "RELEASE",
    body: "Not everything is meant to be held. Release the old growth in the order it calls to you.",
  },
  Winter: {
    kicker: "REST",
    body: "Even a sleeping garden needs warmth. Relight the lanterns and discover the right balance.",
  },
};

function ensureState(scene: any) {
  const existing = scene.zoneState?.["seasonMiniGames"];
  if (!existing || typeof existing !== "object") {
    scene.zoneState["seasonMiniGames"] = {
      Spring: { progress: 0, done: false },
      Summer: { defeated: 0, done: false },
      Autumn: { progress: 0, done: false },
      Winter: { lamps: [false, true, false], done: false },
    };
  }
  return scene.zoneState["seasonMiniGames"];
}

function seasonState(scene: any, season: string) {
  return ensureState(scene)[season];
}

function challengeDone(scene: any, season: string) {
  return seasonState(scene, season)?.done === true;
}

function seasonKey(scene: any, season: string) {
  return (scene.interactables ?? []).find(
    (it: any) => it?.enabled && it.kind === "season-key" && it.id === season,
  );
}

function decor(scene: any, key: string, tx: number, ty: number, tint: number, scale = 0.7, alpha = 0.95) {
  if (!scene.textures?.exists?.(key)) return null;
  const y = scene.wy(ty);
  const s = scene.add.sprite(scene.wx(tx), y, key).setTint(tint).setScale(scale).setAlpha(alpha).setDepth(scene.dsort?.(y + 8) ?? 6);
  s.setData?.("act2-restoration", true);
  return s;
}

function addChallengeInteractable(scene: any, season: string, tx: number, ty: number, texture: string, label: string, id: string, index: number) {
  if (!scene.textures?.exists?.(texture)) texture = "flowers";
  const it = scene.addInteractable(scene.wx(tx), scene.wy(ty), texture, "season-mini-game", label, {
    id: `${season}:${id}`,
    radius: 72,
  });
  if (!it) return null;
  it.data = { season, challengeId: id, index };
  it.obj.setTint?.(TINTS[season]).setScale?.(0.84);
  return it;
}

function setKeyLockedVisual(scene: any, season: string) {
  const key = seasonKey(scene, season);
  if (!key) return;
  if (challengeDone(scene, season)) {
    key.obj.clearTint?.();
    key.obj.setAlpha?.(1);
    key.label = `Open ${season} Key`;
  } else {
    key.obj.setTint?.(0x718096).setAlpha?.(0.58);
    key.label = `Complete the ${season} trial first`;
  }
}

function showCard(scene: any, season: string, complete = false) {
  if (typeof document === "undefined") return;
  document.getElementById("quest-season-card")?.remove();
  const copy = INTRO_COPY[season];
  if (!copy) return;
  const card = document.createElement("div");
  card.id = "quest-season-card";
  Object.assign(card.style, {
    position: "fixed",
    left: "50%",
    top: "11%",
    transform: "translate(-50%, -12px)",
    width: "min(560px, calc(100vw - 30px))",
    zIndex: "10010",
    pointerEvents: "none",
    opacity: "0",
    transition: "opacity 260ms ease, transform 260ms ease",
    borderRadius: "18px",
    border: `1px solid #${TINTS[season].toString(16).padStart(6, "0")}`,
    background: "linear-gradient(145deg, rgba(9,20,40,.97), rgba(24,23,48,.96))",
    boxShadow: "0 18px 45px rgba(0,0,0,.42), inset 0 0 26px rgba(255,255,255,.025)",
    color: "#fff",
    padding: "14px 18px 15px",
    textAlign: "center",
    fontFamily: "Georgia, serif",
  });
  const title = complete ? `${season.toUpperCase()} TRIAL COMPLETE` : `${season.toUpperCase()} · ${copy.kicker}`;
  const body = complete ? `The ${season} Seasonal Key awakens.` : copy.body;
  card.innerHTML = `
    <div style="font-size:10px;letter-spacing:.22em;font-weight:900;color:#${TINTS[season].toString(16).padStart(6, "0")};text-transform:uppercase">Wedding Garden</div>
    <div style="font-size:22px;font-weight:800;margin-top:4px;color:#fff7df">${title}</div>
    <div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.45;color:rgba(255,255,255,.78);margin-top:6px">${body}</div>
  `;
  document.body.appendChild(card);
  requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transform = "translate(-50%, 0)";
  });
  const hold = complete ? 2200 : 3600;
  window.setTimeout(() => {
    card.style.opacity = "0";
    card.style.transform = "translate(-50%, -8px)";
    window.setTimeout(() => card.remove(), 280);
  }, hold);
}

function finishTrial(scene: any, season: string) {
  const st = seasonState(scene, season);
  if (st.done) return;
  st.done = true;
  setKeyLockedVisual(scene, season);
  scene.objective = `${season} trial complete — open the ${season} Seasonal Key.`;
  scene.spawnSparkle?.(scene.wx(SPOTS[season][0]), scene.wy(SPOTS[season][1]), TINTS[season], 20);
  scene.cameras?.main?.flash?.(180, ...(season === "Winter" ? [220, 240, 255] : [255, 238, 188]));
  scene.emitToast?.(`${season} answers. Its Seasonal Key is ready.`);
  scene.pushHud?.(true);
  showCard(scene, season, true);
}

function setupSpring(scene: any) {
  const spots = [[11, 22], [18, 27], [26, 22]];
  scene.__springTrialNodes = spots.map(([x, y], i) => addChallengeInteractable(scene, "Spring", x, y, "flowers", "Listen to the Spring bed", `bed-${i}`, i));
  refreshSpringVisual(scene);
}

function refreshSpringVisual(scene: any) {
  const st = seasonState(scene, "Spring");
  (scene.__springTrialNodes ?? []).forEach((it: any, i: number) => {
    if (!it?.obj?.active) return;
    const current = i === Number(st.progress ?? 0);
    it.obj.setAlpha?.(current ? 1 : 0.42);
    it.obj.setTint?.(current ? 0xd7ffb8 : 0x7e9f76);
    it.label = current ? "Wake this answering flower bed" : "Listen for the answering flower bed";
  });
}

function springInteract(scene: any, it: any) {
  const st = seasonState(scene, "Spring");
  const expected = Number(st.progress ?? 0);
  if (it.data?.index !== expected) {
    st.progress = 0;
    scene.emitToast?.("Spring falls quiet — listen for the bed that glows first.");
    refreshSpringVisual(scene);
    return;
  }
  st.progress = expected + 1;
  scene.spawnSparkle?.(it.obj.x, it.obj.y, TINTS.Spring, 10);
  it.obj.setTint?.(0xa9ef8c).setAlpha?.(0.9);
  if (st.progress >= 3) {
    for (const node of scene.__springTrialNodes ?? []) if (node?.enabled) scene.removeInteractable?.(node);
    [[11,22],[18,27],[26,22]].forEach(([x,y]) => decor(scene,"flowers",x,y,0xc8f7a8,.9,1));
    finishTrial(scene, "Spring");
  } else {
    scene.objective = `Spring — follow the answering beds (${st.progress}/3).`;
    scene.emitToast?.(`Spring answers ${st.progress}/3.`);
    refreshSpringVisual(scene);
  }
}

function setupSummer(scene: any) {
  if (scene.save?.current_zone !== ZONE || scene.__summerTrialInitialized) return true;
  const st = seasonState(scene, "Summer");
  if (st.done) {
    scene.__summerTrialInitialized = true;
    return true;
  }
  // buildAct2 runs before QuestScene creates its pooled enemy group. Do not
  // touch spawnEnemy until that group exists; otherwise the whole realm throws
  // and the scene safety net falls back to Act I.
  if (!scene.enemies?.get || !scene.spawnEnemy) return false;

  scene.__summerGuardians = [];
  const spots = [[89, 22], [97, 27], [105, 22]];
  try {
    spots.forEach(([tx, ty], i) => {
      const key = scene.textures?.exists?.("enemy-bramble-guardian")
        ? "enemy-bramble-guardian"
        : scene.textures?.exists?.("enemy-rose-crawler")
          ? "enemy-rose-crawler"
          : "enemy-rush";
      const e = scene.spawnEnemy(scene.wx(tx), scene.wy(ty), key, 42 + i * 3, true);
      if (!e) return;
      e.setData?.("seasonMiniGame", "Summer");
      e.setData?.("summerGuardian", true);
      e.setTint?.(0xffcf62);
      scene.__summerGuardians.push(e);
    });
  } catch (error) {
    console.error("[quest] Summer trial guardians could not spawn", error);
    scene.__summerGuardians = [];
    return false;
  }

  if (scene.__summerGuardians.length !== 3) {
    for (const e of scene.__summerGuardians) e?.disableBody?.(true, true);
    scene.__summerGuardians = [];
    return false;
  }
  scene.__summerTrialInitialized = true;
  return true;
}

function onSummerGuardianDefeated(scene: any, enemy: any) {
  if (enemy?.getData?.("summerCounted")) return;
  enemy?.setData?.("summerCounted", true);
  const st = seasonState(scene, "Summer");
  st.defeated = Math.min(3, Number(st.defeated ?? 0) + 1);
  if (st.defeated >= 3) finishTrial(scene, "Summer");
  else {
    scene.objective = `Summer — clear the bramble guardians (${st.defeated}/3).`;
    scene.emitToast?.(`Summer guardians cleared ${st.defeated}/3.`);
    scene.pushHud?.(true);
  }
}

function setupAutumn(scene: any) {
  const spots = [[11, 77], [18, 72], [26, 77]];
  scene.__autumnTrialNodes = spots.map(([x, y], i) => addChallengeInteractable(scene, "Autumn", x, y, "flowers", "Release the old growth", `release-${i}`, i));
  refreshAutumnVisual(scene);
}

function refreshAutumnVisual(scene: any) {
  const st = seasonState(scene, "Autumn");
  const order = [1, 0, 2];
  const nextIndex = order[Number(st.progress ?? 0)] ?? -1;
  (scene.__autumnTrialNodes ?? []).forEach((it: any, i: number) => {
    if (!it?.obj?.active) return;
    const current = i === nextIndex;
    it.obj.setAlpha?.(current ? 1 : 0.48);
    it.obj.setTint?.(current ? 0xf0b26b : 0x9a6c4a);
    it.label = current ? "Release the growth that is ready" : "This growth is not ready to release";
  });
}

function autumnInteract(scene: any, it: any) {
  const st = seasonState(scene, "Autumn");
  const order = [1, 0, 2];
  const expected = order[Number(st.progress ?? 0)];
  if (it.data?.index !== expected) {
    st.progress = 0;
    scene.emitToast?.("Autumn gathers itself again — release what glows warmest first.");
    refreshAutumnVisual(scene);
    return;
  }
  st.progress = Number(st.progress ?? 0) + 1;
  scene.spawnSparkle?.(it.obj.x, it.obj.y, TINTS.Autumn, 10);
  if (st.progress >= 3) {
    for (const node of scene.__autumnTrialNodes ?? []) if (node?.enabled) scene.removeInteractable?.(node);
    [[11,77],[18,72],[26,77]].forEach(([x,y]) => decor(scene,"flowers",x,y,0xc7763d,.72,.78));
    finishTrial(scene, "Autumn");
  } else {
    scene.objective = `Autumn — release the old growth in order (${st.progress}/3).`;
    scene.emitToast?.(`Autumn releases ${st.progress}/3.`);
    refreshAutumnVisual(scene);
  }
}

function setupWinter(scene: any) {
  const spots = [[88, 77], [97, 72], [105, 77]];
  scene.__winterTrialNodes = spots.map(([x, y], i) => addChallengeInteractable(scene, "Winter", x, y, "lamp", "Adjust the Winter lantern", `lamp-${i}`, i));
  refreshWinterVisual(scene);
}

function refreshWinterVisual(scene: any) {
  const st = seasonState(scene, "Winter");
  (scene.__winterTrialNodes ?? []).forEach((it: any, i: number) => {
    if (!it?.obj?.active) return;
    const lit = Boolean(st.lamps?.[i]);
    it.obj.setTint?.(lit ? 0xffe5a3 : 0x7f91ad).setAlpha?.(lit ? 1 : 0.48);
    it.label = lit ? "Adjust this glowing lantern" : "Relight this cold lantern";
  });
}

function winterInteract(scene: any, it: any) {
  const st = seasonState(scene, "Winter");
  const i = Number(it.data?.index ?? 0);
  const pairs: Record<number, number[]> = { 0: [0, 1], 1: [0, 1, 2], 2: [1, 2] };
  const lamps = [...(st.lamps ?? [false, true, false])];
  for (const idx of pairs[i] ?? [i]) lamps[idx] = !lamps[idx];
  st.lamps = lamps;
  scene.spawnSparkle?.(it.obj.x, it.obj.y, TINTS.Winter, 8);
  refreshWinterVisual(scene);
  if (lamps.every(Boolean)) {
    for (const node of scene.__winterTrialNodes ?? []) if (node?.enabled) scene.removeInteractable?.(node);
    [[88,77],[97,72],[105,77]].forEach(([x,y]) => decor(scene,"lamp",x,y,0xffe5a3,.84,1));
    finishTrial(scene, "Winter");
  } else {
    const n = lamps.filter(Boolean).length;
    scene.objective = `Winter — bring all three lanterns into balance (${n}/3 glowing).`;
    scene.emitToast?.(`${n}/3 Winter lanterns are glowing.`);
    scene.pushHud?.(true);
  }
}

function setupMiniGames(scene: any) {
  ensureState(scene);
  setupSpring(scene);
  // Summer is intentionally deferred until QuestScene.create() has created
  // this.enemies. setupSummer() is retried safely from the update wrapper.
  scene.__summerTrialInitialized = false;
  setupAutumn(scene);
  setupWinter(scene);
  SEASONS.forEach((s) => setKeyLockedVisual(scene, s));
}

function addFountainLayer(scene: any, season: string, index: number) {
  scene.__act2FountainLayers ??= {};
  if (scene.__act2FountainLayers[season]) return;
  const angles = [[-9,-5],[9,-5],[-9,7],[9,7]];
  const [dx, dy] = angles[index] ?? [0, 0];
  const key = season === "Winter" ? "spark" : "flowers";
  const s = decor(scene, key, 66 + dx, 54 + dy, TINTS[season], season === "Winter" ? 0.7 : 0.64, 0.9);
  if (s) scene.__act2FountainLayers[season] = s;
}

function wakeConservatory(scene: any, count: number) {
  scene.__act2ConservatoryWake ??= [];
  while (scene.__act2ConservatoryWake.length < count) {
    const i = scene.__act2ConservatoryWake.length;
    const pts = [[113,45],[121,40],[128,45],[121,57]];
    const [x, y] = pts[i];
    const s = decor(scene, i === 3 ? "flowers" : "lamp", x, y, TINTS[SEASONS[i]], i === 3 ? 0.72 : 0.6, 0.38 + i * 0.13);
    if (s) scene.__act2ConservatoryWake.push(s);
    else break;
  }
}

function applyRestoration(scene: any, season: string) {
  scene.__act2Restored ??= {};
  if (scene.__act2Restored[season]) return;
  scene.__act2Restored[season] = true;
  const [x, y] = SPOTS[season];
  const tint = TINTS[season];
  const offsets = [[-8,0],[-5,6],[0,8],[6,5],[8,-1],[3,-7],[-4,-6]];
  offsets.forEach(([dx, dy], i) => decor(scene, i === 5 ? "tree" : "flowers", x + dx, y + dy, tint, i === 5 ? 0.78 : 0.62 + (i % 2) * 0.1, 0.88));
  const index = SEASONS.indexOf(season as any);
  addFountainLayer(scene, season, index);
  const count = Object.keys(scene.__act2Restored).length;
  wakeConservatory(scene, count);
  scene.spawnSparkle?.(scene.wx(x), scene.wy(y), tint, 18);
  if (count === 4) {
    scene.spawnSparkle?.(scene.wx(66), scene.wy(54), 0xffe9a8, 28);
    scene.emitToast?.("The Wedding Garden breathes in all four seasons again.");
  } else scene.emitToast?.(`${season} settles back into the Wedding Garden.`);
}

function maybeShowProximityIntro(scene: any) {
  if (scene.save?.current_zone !== ZONE || !scene.player?.active || scene.frozen) return;
  scene.__seasonIntroShown ??= new Set<string>();
  for (const season of SEASONS) {
    if (scene.__seasonIntroShown.has(season) || challengeDone(scene, season)) continue;
    const [tx, ty] = SPOTS[season];
    const dx = scene.player.x - scene.wx(tx);
    const dy = scene.player.y - scene.wy(ty);
    if (Math.hypot(dx, dy) > 185) continue;
    scene.__seasonIntroShown.add(season);
    showCard(scene, season, false);
    const st = seasonState(scene, season);
    if (season === "Spring") scene.objective = `Spring — follow the answering flower beds (${st.progress ?? 0}/3).`;
    if (season === "Summer") scene.objective = `Summer — clear the bramble guardians (${st.defeated ?? 0}/3).`;
    if (season === "Autumn") scene.objective = `Autumn — release the old growth in order (${st.progress ?? 0}/3).`;
    if (season === "Winter") scene.objective = "Winter — bring all three lanterns into balance.";
    scene.pushHud?.(true);
    break;
  }
}

export function installAct2SeasonChallenges(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2SeasonChallengesInstalled) return;
  proto.__act2SeasonChallengesInstalled = true;

  const originalBuild = proto.buildAct2;
  proto.buildAct2 = function act2SeasonMiniGamesBuild(...args: any[]) {
    const result = originalBuild.apply(this, args);
    setupMiniGames(this);
    return result;
  };

  const originalTransformEnemy = proto.transformEnemy;
  proto.transformEnemy = function act2SeasonEnemyDefeat(enemy: any, ...args: any[]) {
    const summer = this.save?.current_zone === ZONE && enemy?.active && enemy?.getData?.("seasonMiniGame") === "Summer";
    const result = originalTransformEnemy.call(this, enemy, ...args);
    if (summer) onSummerGuardianDefeated(this, enemy);
    return result;
  };

  const originalInteract = proto.interact;
  proto.interact = function act2SeasonMiniGameInteract(...args: any[]) {
    if (this.save?.current_zone !== ZONE) return originalInteract.apply(this, args);
    const nearest = this.nearest?.();
    if (nearest?.kind === "season-mini-game") {
      const season = nearest.data?.season;
      if (season === "Spring") springInteract(this, nearest);
      else if (season === "Autumn") autumnInteract(this, nearest);
      else if (season === "Winter") winterInteract(this, nearest);
      return;
    }
    if (nearest?.kind === "season-key" && SEASONS.includes(nearest.id) && !challengeDone(this, nearest.id)) {
      this.objective = `Complete the ${nearest.id} seasonal trial before opening its Key.`;
      this.emitToast?.(`${nearest.id}'s Key is sleeping. Finish this corner's trial first.`);
      this.pushHud?.(true);
      return;
    }
    const before = Number(this.zoneState?.["keysFound"] ?? 0);
    const id = nearest?.kind === "season-key" ? nearest.id : null;
    const result = originalInteract.apply(this, args);
    const after = Number(this.zoneState?.["keysFound"] ?? 0);
    if (id && after > before) applyRestoration(this, id);
    return result;
  };

  const originalUpdate = proto.update;
  proto.update = function act2SeasonMiniGameUpdate(time: number, delta: number) {
    const result = originalUpdate.call(this, time, delta);
    if (this.save?.current_zone === ZONE && !this.__summerTrialInitialized) setupSummer(this);
    maybeShowProximityIntro(this);
    return result;
  };
}
