import type { ZoneId } from "./content";
import "./bossNightmare.css";
import "./questMobilePolish.css";
import "./act1EnvelopePolish.css";
import "./relicPresentation.css";

// Install the optional scene polish after the scene module finishes evaluating.
// Dynamic loading avoids a circular static dependency because scene.ts imports
// this events module for the shared event names below.
if (typeof window !== "undefined") {
  queueMicrotask(() => {
    void Promise.all([
      import("./scene"),
      import("./house"),
      import("./upgrades"),
      import("./visualRemaster"),
      import("./homeRemaster"),
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
      import("./majesticPortal"),
      import("./relicPresentation"),
      import("./act2Enemies"),
      import("./desktopControlsPolish"),
    ])
      .then(([
        sceneModule,
        houseModule,
        upgrades,
        visualRemaster,
        homeRemaster,
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
        majesticPortal,
        relicPresentation,
        act2Enemies,
        desktopControlsPolish,
      ]) => {
        const QuestScene = sceneModule.QuestScene as unknown as any;
        const QuestHouseScene = houseModule.QuestHouseScene as unknown as any;
        upgrades.installQuestUpgrades(QuestScene);
        visualRemaster.installVisualRemaster(QuestScene);
        homeRemaster.installHomeRemaster(QuestScene, QuestHouseScene);
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
        majesticPortal.installMajesticPortal(QuestScene);
        relicPresentation.installRelicPresentation();
        act2Enemies.installAct2Enemies(QuestScene);
        desktopControlsPolish.installDesktopControlsPolish();
      })
      .catch((error) => console.error("[quest] premium upgrade install failed", error));
  });
}

export const EV = {
  hud: "quest:hud",
  modal: "quest:modal",
  toast: "quest:toast",
  save: "quest:save",
  ceremony: "quest:ceremony",
  resume: "quest:resume",
  stick: "quest:stick",
  action: "quest:action",
  /** Scene -> React: Maria swung a weapon (payload: weapon id) — play its swing sound. */
  swing: "quest:swing",
  dash: "quest:dash",
  interact: "quest:interact",
  guide: "quest:guide",
  act: "quest:act",
  travel: "quest:travel",
  ping: "quest:ping",
  equip: "quest:equip",
  bosschoice: "quest:bosschoice",
  companion: "quest:companion",
  /** Scene -> React: "explore" or "battle" music layer. */
  music: "quest:music",
  /** React -> scene: inventory action (eat / cook / stash / take / sleep / leave). */
  item: "quest:item",
  /** React -> scene: continue from checkpoint after a game over. */
  respawn: "quest:respawn",
} as const;

export type HudState = {
  health: number;
  maxHealth: number;
  stamina: number;
  dashProgress: number;
  zone: ZoneId;
  zoneTitle: string;
  act: string;
  objective: string;
  relics: string[];
  envelopes: string[];
  keys: number;
  prompt: string | null;
  weddingCompleted: boolean;
  weapons: string[];
  equipped: string | null;
  boss: { name: string; hp: number; max: number } | null;
  shield: { owned: boolean; ready: boolean } | null;
  /** 0..1 through the day; 0 = dawn. */
  timeOfDay: number;
  night: boolean;
  clock: string;
  /** Backpack contents, item id -> count. */
  inventory: Record<string, number>;
  /** True while Maria is inside her house. */
  indoors: boolean;
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
  | {
      type: "boss";
      name: string;
      art: string;
      role?: string;
      intro: string;
      demon: string;
      mariaLine: string;
      slides: {
        boss: string;
        replies: { id: string; text: string; answer: string }[];
      }[];
    };
