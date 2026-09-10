import type { ZoneId } from "./content";
import "./bossNightmare.css";
import "./questMobilePolish.css";
import "./act1EnvelopePolish.css";
import "./relicPresentation.css";
import "./titleScreenCinematic.css";

const QUEST_RUNTIME_READY_EVENT = "quest:runtime-ready";

if (typeof window !== "undefined") {
  (window as any).__questRuntimeReady = false;
  queueMicrotask(() => {
    void Promise.all([
      import("./scene"), import("./house"), import("./upgrades"), import("./visualRemaster"), import("./homeRemaster"), import("./homeScalePolish"),
      import("./act1WorldRemaster"), import("./lastCrossing"), import("./silasPolish"), import("./silasPlacementFix"),
      import("./lastCrossingLifecycle"), import("./act1GameplayPolish"), import("./fallenCrossingShrine"), import("./fallenCrossingJournalBook"),
      import("./wardenCombat"), import("./act1WoodenBridges"), import("./wardenTidalRings"), import("./act1ExplorationArt"),
      import("./lastCrossingDefense"), import("./majesticPortal"), import("./relicPresentation"), import("./act2Enemies"),
      import("./act2GardenKeeper"), import("./act2EvelynSprite"), import("./act2VisualTuning"), import("./act2GuideCleanup"),
      import("./act2SeasonIdentity"), import("./act2BramForgemaster"), import("./act2BramWeaponOwnership"), import("./act2SeasonChallenges"),
      import("./act2BossRemaster"), import("./act2Wildlife"), import("./act2Memorial"), import("./meleeHitPolish"), import("./act3OpeningFlow"), import("./act3Enemies"), import("./act3BossPolish"), import("./act3SheetScenes"), import("./act3MusicIdentity"), import("./act3HavenLandmarks"), import("./global2_5dPolish"), import("./desktopActSelector"), import("./desktopControlsPolish"), import("./interactionPolish"),
      import("./wrenIntro"), import("./lastCrossingDialogueRebind"), import("./weaponVisualSync"), import("./introUiPolish"),
      import("./mariaMovementPolish"), import("./mariaCombatAnimation"), import("./globalCharacterReactions"), import("./globalNpcLife"), import("./enemyReactionPolish"), import("./combatImpactPolish"),
      import("./actArrivalCinematics"), import("./environmentalMicroLife"), import("./explorationFeedback"),
    ]).then(([
      sceneModule, houseModule, upgrades, visualRemaster, homeRemaster, homeScalePolish, act1WorldRemaster, lastCrossing, silasPolish,
      silasPlacementFix, lastCrossingLifecycle, act1GameplayPolish, fallenCrossingShrine, fallenCrossingJournalBook,
      wardenCombat, act1WoodenBridges, wardenTidalRings, act1ExplorationArt, lastCrossingDefense, majesticPortal,
      relicPresentation, act2Enemies, act2GardenKeeper, act2EvelynSprite, act2VisualTuning, act2GuideCleanup,
      act2SeasonIdentity, act2BramForgemaster, act2BramWeaponOwnership, act2SeasonChallenges, act2BossRemaster, act2Wildlife, act2Memorial, meleeHitPolish, act3OpeningFlow, act3Enemies, act3BossPolish, act3SheetScenes, act3MusicIdentity, act3HavenLandmarks, global25DPolish,
      desktopActSelector, desktopControlsPolish, interactionPolish, wrenIntro, lastCrossingDialogueRebind, weaponVisualSync,
      introUiPolish, mariaMovementPolish, mariaCombatAnimation, globalCharacterReactions, globalNpcLife, enemyReactionPolish, combatImpactPolish, actArrivalCinematics,
      environmentalMicroLife, explorationFeedback,
    ]) => {
      const QuestScene = sceneModule.QuestScene as unknown as any;
      const QuestHouseScene = houseModule.QuestHouseScene as unknown as any;
      upgrades.installQuestUpgrades(QuestScene);
      visualRemaster.installVisualRemaster(QuestScene);
      homeRemaster.installHomeRemaster(QuestScene, QuestHouseScene);
      homeScalePolish.installHomeScalePolish(QuestHouseScene);
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
      act2GardenKeeper.installAct2GardenKeeper(QuestScene);
      act2EvelynSprite.installAct2EvelynSprite(QuestScene);
      act2VisualTuning.installAct2VisualTuning(QuestScene);
      act2GuideCleanup.installAct2GuideCleanup(QuestScene);
      act2SeasonIdentity.installAct2SeasonIdentity(QuestScene);
      act2BramForgemaster.installAct2BramForgemaster(QuestScene);
      act2BramWeaponOwnership.installAct2BramWeaponOwnership(QuestScene);
      act2SeasonChallenges.installAct2SeasonChallenges(QuestScene);
      act2BossRemaster.installAct2BossRemaster(QuestScene);
      act2Wildlife.installAct2Wildlife(QuestScene);
      act2Memorial.installAct2Memorial(QuestScene);
      meleeHitPolish.installMeleeHitPolish(QuestScene);
      act3OpeningFlow.installAct3OpeningFlow(QuestScene);
      act3Enemies.installAct3Enemies(QuestScene);
      act3BossPolish.installAct3BossPolish(QuestScene);
      act3SheetScenes.installAct3SheetScenes(QuestScene);
      act3MusicIdentity.installAct3MusicIdentity(QuestScene);
      act3HavenLandmarks.installAct3HavenLandmarks(QuestScene);
      global25DPolish.installGlobal25DPolish(QuestScene);
      desktopActSelector.installDesktopActSelector(QuestScene);
      desktopControlsPolish.installDesktopControlsPolish();
      interactionPolish.installInteractionPolish(QuestScene);
      wrenIntro.installWrenIntro(QuestScene);
      lastCrossingDialogueRebind.rebindLastCrossingDialoguePolish(QuestScene);
      weaponVisualSync.installWeaponVisualSync(QuestScene);
      introUiPolish.installIntroUiPolish(QuestScene);
      mariaMovementPolish.installMariaMovementPolish(QuestScene, QuestHouseScene);
      mariaCombatAnimation.installMariaCombatAnimation(QuestScene);
      globalCharacterReactions.installGlobalCharacterReactions(QuestScene);
      globalNpcLife.installGlobalNpcLife(QuestScene);
      enemyReactionPolish.installEnemyReactionPolish(QuestScene);
      combatImpactPolish.installCombatImpactPolish(QuestScene);
      actArrivalCinematics.installActArrivalCinematics(QuestScene);
      environmentalMicroLife.installEnvironmentalMicroLife(QuestScene);
      explorationFeedback.installExplorationFeedback(QuestScene);

      (window as any).__questRuntimeReady = true;
      window.dispatchEvent(new Event(QUEST_RUNTIME_READY_EVENT));
      requestAnimationFrame(() => requestAnimationFrame(() => {
        void Promise.all([import("./globalCharacterDialogue"), import("./act3AndrewDialogue")])
          .then(([dialogue, act3AndrewDialogue]) => {
            dialogue.installGlobalCharacterDialogue(QuestScene);
            act3AndrewDialogue.installAct3AndrewDialogue(QuestScene);
          })
          .catch((error) => console.error("[quest] dialogue polish install failed", error));
      }));
    }).catch((error) => console.error("[quest] premium upgrade install failed", error));
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
