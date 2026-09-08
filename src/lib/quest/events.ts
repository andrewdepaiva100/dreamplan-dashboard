import type { ZoneId } from "./content";
import "./bossNightmare.css";
import "./questMobilePolish.css";
import "./act1EnvelopePolish.css";
import "./relicPresentation.css";
import "./titleScreenCinematic.css";

const SAVE_KEY = "marias-quest-save-v1";
const VALID_ZONES = new Set<ZoneId>([
  "sunlit_shores",
  "wedding_garden",
  "the_haven",
  "starry_ascent",
  "cathedral",
]);

const installedZonePacks = new Set<ZoneId>();
const zonePackPromises = new Map<ZoneId, Promise<void>>();

function readBootZone(): ZoneId {
  if (typeof window === "undefined") return "sunlit_shores";
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return "sunlit_shores";
    const parsed = JSON.parse(raw) as { current_zone?: unknown };
    const zone = parsed.current_zone;
    return typeof zone === "string" && VALID_ZONES.has(zone as ZoneId)
      ? (zone as ZoneId)
      : "sunlit_shores";
  } catch {
    return "sunlit_shores";
  }
}

async function installZonePack(zone: ZoneId, QuestScene: any): Promise<void> {
  if (installedZonePacks.has(zone)) return;
  const existing = zonePackPromises.get(zone);
  if (existing) return existing;

  const work = (async () => {
    if (zone === "sunlit_shores") {
      const [
        act1WorldRemaster,
        lastCrossing,
        silasPolish,
        silasPlacementFix,
        lastCrossingLifecycle,
        act1GameplayPolish,
        fallenCrossingShrine,
        fallenCrossingJournalBook,
        wardenCombat,
        act1WoodenBridges,
        wardenTidalRings,
        act1ExplorationArt,
        lastCrossingDefense,
        wrenIntro,
        lastCrossingDialogueRebind,
      ] = await Promise.all([
        import("./act1WorldRemaster"),
        import("./lastCrossing"),
        import("./silasPolish"),
        import("./silasPlacementFix"),
        import("./lastCrossingLifecycle"),
        import("./act1GameplayPolish"),
        import("./fallenCrossingShrine"),
        import("./fallenCrossingJournalBook"),
        import("./wardenCombat"),
        import("./act1WoodenBridges"),
        import("./wardenTidalRings"),
        import("./act1ExplorationArt"),
        import("./lastCrossingDefense"),
        import("./wrenIntro"),
        import("./lastCrossingDialogueRebind"),
      ]);

      // Preserve the proven Act I decorator order. The final dialogue rebind
      // remains authoritative for Elara, Pip, Maeve, Silas and the forge.
      act1WorldRemaster.installAct1WorldRemaster(QuestScene);
      lastCrossing.installLastCrossing(QuestScene);
      silasPolish.installSilasPolish(QuestScene);
      silasPlacementFix.installSilasPlacementFix(QuestScene);
      lastCrossingLifecycle.installLastCrossingLifecycle(QuestScene);
      act1GameplayPolish.installAct1GameplayPolish(QuestScene);
      fallenCrossingShrine.installFallenCrossingShrine(QuestScene);
      fallenCrossingJournalBook.installFallenCrossingJournalBook(QuestScene);
      wardenCombat.installWardenCombat(QuestScene);
      act1WoodenBridges.installAct1WoodenBridges(QuestScene);
      wardenTidalRings.installWardenTidalRings(QuestScene);
      act1ExplorationArt.installAct1ExplorationArt(QuestScene);
      lastCrossingDefense.installLastCrossingDefense(QuestScene);
      wrenIntro.installWrenIntro(QuestScene);
      lastCrossingDialogueRebind.rebindLastCrossingDialoguePolish(QuestScene);
    } else if (zone === "wedding_garden") {
      const [
        act2Enemies,
        act2GardenKeeper,
        act2EvelynSprite,
        act2VisualTuning,
        act2GuideCleanup,
        act2SeasonIdentity,
        act2BramForgemaster,
        act2BramWeaponOwnership,
        act2SeasonChallenges,
      ] = await Promise.all([
        import("./act2Enemies"),
        import("./act2GardenKeeper"),
        import("./act2EvelynSprite"),
        import("./act2VisualTuning"),
        import("./act2GuideCleanup"),
        import("./act2SeasonIdentity"),
        import("./act2BramForgemaster"),
        import("./act2BramWeaponOwnership"),
        import("./act2SeasonChallenges"),
      ]);

      act2Enemies.installAct2Enemies(QuestScene);
      act2GardenKeeper.installAct2GardenKeeper(QuestScene);
      act2EvelynSprite.installAct2EvelynSprite(QuestScene);
      act2VisualTuning.installAct2VisualTuning(QuestScene);
      act2GuideCleanup.installAct2GuideCleanup(QuestScene);
      act2SeasonIdentity.installAct2SeasonIdentity(QuestScene);
      act2BramForgemaster.installAct2BramForgemaster(QuestScene);
      act2BramWeaponOwnership.installAct2BramWeaponOwnership(QuestScene);
      act2SeasonChallenges.installAct2SeasonChallenges(QuestScene);
    }

    // Acts III-V currently need only the core scene systems. Marking the pack
    // complete keeps travel checks constant-time and leaves room for future packs.
    installedZonePacks.add(zone);
  })();

  zonePackPromises.set(zone, work);
  try {
    await work;
  } finally {
    zonePackPromises.delete(zone);
  }
}

function installZoneTravelPreloader(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__zoneTravelPreloaderInstalled) return;
  const originalTravelTo = proto.travelTo;
  if (typeof originalTravelTo !== "function") return;
  proto.__zoneTravelPreloaderInstalled = true;

  proto.travelTo = function lazyZoneTravel(zone: ZoneId) {
    if (!VALID_ZONES.has(zone)) return originalTravelTo.call(this, zone);
    if (zone === this.save?.current_zone || installedZonePacks.has(zone)) {
      return originalTravelTo.call(this, zone);
    }

    // Let the original method keep ownership of locked-zone behavior. We only
    // intercept a destination that is already unlocked and genuinely changing.
    const unlocked = typeof this.unlockedZones === "function" ? this.unlockedZones() : [];
    if (Array.isArray(unlocked) && !unlocked.includes(zone)) {
      return originalTravelTo.call(this, zone);
    }
    if (this.__zonePackTravelPending) return;
    this.__zonePackTravelPending = true;

    void installZonePack(zone, QuestScene)
      .then(() => originalTravelTo.call(this, zone))
      .catch((error) => {
        console.error(`[quest] ${zone} pack failed to preload`, error);
        // Preserve the old travel path as a fallback rather than trapping Maria.
        originalTravelTo.call(this, zone);
      })
      .finally(() => {
        this.__zonePackTravelPending = false;
      });
  };
}

// Boot only universal systems plus the active realm. Previously every Act I and
// Act II decorator was parsed and installed in one startup burst, even when most
// of it could not be used in the current realm.
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void Promise.all([
      import("./scene"),
      import("./house"),
      import("./upgrades"),
      import("./visualRemaster"),
      import("./homeRemaster"),
      import("./majesticPortal"),
      import("./relicPresentation"),
      import("./global2_5dPolish"),
      import("./desktopActSelector"),
      import("./desktopControlsPolish"),
      import("./interactionPolish"),
      import("./weaponVisualSync"),
    ])
      .then(async ([
        sceneModule,
        houseModule,
        upgrades,
        visualRemaster,
        homeRemaster,
        majesticPortal,
        relicPresentation,
        global25DPolish,
        desktopActSelector,
        desktopControlsPolish,
        interactionPolish,
        weaponVisualSync,
      ]) => {
        const QuestScene = sceneModule.QuestScene as unknown as any;
        const QuestHouseScene = houseModule.QuestHouseScene as unknown as any;

        upgrades.installQuestUpgrades(QuestScene);
        visualRemaster.installVisualRemaster(QuestScene);
        homeRemaster.installHomeRemaster(QuestScene, QuestHouseScene);

        // The active realm pack must be on the prototype before Phaser calls
        // create(), because several decorators augment the realm build itself.
        const bootZone = readBootZone();
        await installZonePack(bootZone, QuestScene);

        majesticPortal.installMajesticPortal(QuestScene);
        relicPresentation.installRelicPresentation();
        global25DPolish.installGlobal25DPolish(QuestScene);
        desktopActSelector.installDesktopActSelector(QuestScene);
        desktopControlsPolish.installDesktopControlsPolish();
        interactionPolish.installInteractionPolish(QuestScene);
        installZoneTravelPreloader(QuestScene);

        // Keep weapon visuals authoritative after every gameplay decorator that
        // was installed for the active realm.
        weaponVisualSync.installWeaponVisualSync(QuestScene);

        // Dialogue presentation is large but not required to draw/control Maria.
        // Parse it only after two stable paints, outside the first playable frame.
        requestAnimationFrame(() => requestAnimationFrame(() => {
          void import("./globalCharacterDialogue")
            .then((dialogue) => dialogue.installGlobalCharacterDialogue(QuestScene))
            .catch((error) => console.error("[quest] dialogue polish install failed", error));
        }));
      })
      .catch((error) => console.error("[quest] premium upgrade install failed", error));
  });
}

export const EV = {
  hud: "quest:hud", modal: "quest:modal", toast: "quest:toast", save: "quest:save", ceremony: "quest:ceremony",
  resume: "quest:resume", stick: "quest:stick", action: "quest:action", swing: "quest:swing", dash: "quest:dash",
  interact: "quest:interact", guide: "quest:guide", act: "quest:act", travel: "quest:travel", ping: "quest:ping",
  equip: "quest:equip", bosschoice: "quest:bosschoice", companion: "quest:companion", music: "quest:music",
  item: "quest:item", respawn: "quest:respawn",
} as const;

export type HudState = {
  health: number; maxHealth: number; stamina: number; dashProgress: number; zone: ZoneId; zoneTitle: string; act: string;
  objective: string; relics: string[]; envelopes: string[]; keys: number; prompt: string | null; weddingCompleted: boolean;
  weapons: string[]; equipped: string | null; boss: { name: string; hp: number; max: number } | null;
  shield: { owned: boolean; ready: boolean } | null; timeOfDay: number; night: boolean; clock: string;
  inventory: Record<string, number>; indoors: boolean;
};

export type ModalPayload =
  | { type: "gameover" }
  | { type: "relic"; relicId: string }
  | { type: "envelope"; envelopeId: string }
  | { type: "memory" }
  | { type: "andrew"; line: string }
  | { type: "vault" }
  | { type: "info"; title: string; body: string }
  | { type: "guide" }
  | { type: "guidetalk"; name: string; pages: string[]; weaponId?: string; line: string }
  | { type: "weapon"; weaponId: string; speaker: string; line: string }
  | { type: "directions"; title: string; lines: string[] }
  | { type: "guest"; id: string; name: string; role?: string; lines: string[] }
  | { type: "companion"; name: string; body: string; owned: boolean }
  | { type: "chest"; inventory: Record<string, number>; chest: Record<string, number> }
  | { type: "hearth"; inventory: Record<string, number> }
  | { type: "bed" }
  | { type: "boss"; name: string; art: string; role?: string; intro: string; demon: string; mariaLine: string; slides: { boss: string; replies: { id: string; text: string; answer: string }[] }[] };
