import type { ZoneId } from "./content";
import "./bossNightmare.css";
import "./questMobilePolish.css";
import "./act1EnvelopePolish.css";
import "./relicPresentation.css";
import "./titleScreenCinematic.css";
import "./inventoryArmoryPolish.css";

const QUEST_RUNTIME_READY_EVENT = "quest:runtime-ready";

function releaseQuestRuntimeReady() {
  if (typeof window === "undefined") return;
  (window as any).__questRuntimeReady = true;
  window.dispatchEvent(new Event(QUEST_RUNTIME_READY_EVENT));
}

async function safeImport<T>(label: string, loader: () => Promise<T>): Promise<T | null> {
  try {
    return await loader();
  } catch (error) {
    console.error(`[quest] failed to import ${label}`, error);
    return null;
  }
}

function safeInstall(label: string, installer: (() => void) | null | undefined) {
  if (!installer) return;
  try {
    installer();
  } catch (error) {
    console.error(`[quest] failed to install ${label}`, error);
  }
}

if (typeof window !== "undefined") {
  (window as any).__questRuntimeReady = false;
  queueMicrotask(() => {
    void (async () => {
      const [
        sceneModule, houseModule, upgrades, visualRemaster, homeRemaster, homeScalePolish, act1WorldRemaster, lastCrossing, silasPolish,
        silasPlacementFix, lastCrossingLifecycle, act1GameplayPolish, fallenCrossingShrine, fallenCrossingJournalBook,
        wardenCombat, act1WoodenBridges, wardenTidalRings, act1ExplorationArt, lastCrossingDefense, majesticPortal,
        relicPresentation, act2Enemies, act2GardenKeeper, act2EvelynSprite, act2VisualTuning, act2GuideCleanup,
        act2SeasonIdentity, act2BramForgemaster, act2BramWeaponOwnership, act2SeasonChallenges, act2BossRemaster, act2Wildlife, act2Memorial, meleeHitPolish,
        act3OpeningFlow, act3Enemies, act3BossPolish, act3SheetScenes, act3MusicIdentity, act3HavenLandmarks, global25DPolish,
        desktopActSelector, desktopControlsPolish, interactionPolish, wrenIntro, lastCrossingDialogueRebind, weaponVisualSync,
        introUiPolish, mariaMovementPolish, mariaCombatAnimation, globalCharacterReactions, globalNpcLife, enemyReactionPolish, combatImpactPolish,
        actArrivalCinematics, environmentalMicroLife, explorationFeedback, romanticMicroPolish, npcPresencePolish, canvasSeamPolish,
      ] = await Promise.all([
        safeImport("scene", () => import("./scene")), safeImport("house", () => import("./house")), safeImport("upgrades", () => import("./upgrades")), safeImport("visualRemaster", () => import("./visualRemaster")), safeImport("homeRemaster", () => import("./homeRemaster")), safeImport("homeScalePolish", () => import("./homeScalePolish")),
        safeImport("act1WorldRemaster", () => import("./act1WorldRemaster")), safeImport("lastCrossing", () => import("./lastCrossing")), safeImport("silasPolish", () => import("./silasPolish")), safeImport("silasPlacementFix", () => import("./silasPlacementFix")),
        safeImport("lastCrossingLifecycle", () => import("./lastCrossingLifecycle")), safeImport("act1GameplayPolish", () => import("./act1GameplayPolish")), safeImport("fallenCrossingShrine", () => import("./fallenCrossingShrine")), safeImport("fallenCrossingJournalBook", () => import("./fallenCrossingJournalBook")),
        safeImport("wardenCombat", () => import("./wardenCombat")), safeImport("act1WoodenBridges", () => import("./act1WoodenBridges")), safeImport("wardenTidalRings", () => import("./wardenTidalRings")), safeImport("act1ExplorationArt", () => import("./act1ExplorationArt")),
        safeImport("lastCrossingDefense", () => import("./lastCrossingDefense")), safeImport("majesticPortal", () => import("./majesticPortal")), safeImport("relicPresentation", () => import("./relicPresentation")), safeImport("act2Enemies", () => import("./act2Enemies")),
        safeImport("act2GardenKeeper", () => import("./act2GardenKeeper")), safeImport("act2EvelynSprite", () => import("./act2EvelynSprite")), safeImport("act2VisualTuning", () => import("./act2VisualTuning")), safeImport("act2GuideCleanup", () => import("./act2GuideCleanup")),
        safeImport("act2SeasonIdentity", () => import("./act2SeasonIdentity")), safeImport("act2BramForgemaster", () => import("./act2BramForgemaster")), safeImport("act2BramWeaponOwnership", () => import("./act2BramWeaponOwnership")), safeImport("act2SeasonChallenges", () => import("./act2SeasonChallenges")),
        safeImport("act2BossRemaster", () => import("./act2BossRemaster")), safeImport("act2Wildlife", () => import("./act2Wildlife")), safeImport("act2Memorial", () => import("./act2Memorial")), safeImport("meleeHitPolish", () => import("./meleeHitPolish")),
        safeImport("act3OpeningFlow", () => import("./act3OpeningFlow")), safeImport("act3Enemies", () => import("./act3Enemies")), safeImport("act3BossPolish", () => import("./act3BossPolish")), safeImport("act3SheetScenes", () => import("./act3SheetScenes")),
        safeImport("act3MusicIdentity", () => import("./act3MusicIdentity")), safeImport("act3HavenLandmarks", () => import("./act3HavenLandmarks")), safeImport("global2_5dPolish", () => import("./global2_5dPolish")), safeImport("desktopActSelector", () => import("./desktopActSelector")),
        safeImport("desktopControlsPolish", () => import("./desktopControlsPolish")), safeImport("interactionPolish", () => import("./interactionPolish")), safeImport("wrenIntro", () => import("./wrenIntro")), safeImport("lastCrossingDialogueRebind", () => import("./lastCrossingDialogueRebind")),
        safeImport("weaponVisualSync", () => import("./weaponVisualSync")), safeImport("introUiPolish", () => import("./introUiPolish")), safeImport("mariaMovementPolish", () => import("./mariaMovementPolish")), safeImport("mariaCombatAnimation", () => import("./mariaCombatAnimation")),
        safeImport("globalCharacterReactions", () => import("./globalCharacterReactions")), safeImport("globalNpcLife", () => import("./globalNpcLife")), safeImport("enemyReactionPolish", () => import("./enemyReactionPolish")), safeImport("combatImpactPolish", () => import("./combatImpactPolish")),
        safeImport("actArrivalCinematics", () => import("./actArrivalCinematics")), safeImport("environmentalMicroLife", () => import("./environmentalMicroLife")), safeImport("explorationFeedback", () => import("./explorationFeedback")), safeImport("romanticMicroPolish", () => import("./romanticMicroPolish")), safeImport("npcPresencePolish", () => import("./npcPresencePolish")),
        safeImport("canvasSeamPolish", () => import("./canvasSeamPolish")),
      ]);

      if (!sceneModule?.QuestScene) {
        console.error("[quest] scene module unavailable; premium decorators cannot install");
        releaseQuestRuntimeReady();
        return;
      }

      const QuestScene = sceneModule.QuestScene as unknown as any;
      const QuestHouseScene = houseModule?.QuestHouseScene as unknown as any;

      safeInstall("upgrades", upgrades ? () => upgrades.installQuestUpgrades(QuestScene) : null);
      safeInstall("visualRemaster", visualRemaster ? () => visualRemaster.installVisualRemaster(QuestScene) : null);
      safeInstall("homeRemaster", homeRemaster && QuestHouseScene ? () => homeRemaster.installHomeRemaster(QuestScene, QuestHouseScene) : null);
      safeInstall("homeScalePolish", homeScalePolish && QuestHouseScene ? () => homeScalePolish.installHomeScalePolish(QuestHouseScene) : null);
      safeInstall("act1WorldRemaster", act1WorldRemaster ? () => act1WorldRemaster.installAct1WorldRemaster(QuestScene) : null);
      safeInstall("lastCrossing", lastCrossing ? () => lastCrossing.installLastCrossing(QuestScene) : null);
      safeInstall("silasPolish", silasPolish ? () => silasPolish.installSilasPolish(QuestScene) : null);
      safeInstall("silasPlacementFix", silasPlacementFix ? () => silasPlacementFix.installSilasPlacementFix(QuestScene) : null);
      safeInstall("lastCrossingLifecycle", lastCrossingLifecycle ? () => lastCrossingLifecycle.installLastCrossingLifecycle(QuestScene) : null);
      safeInstall("act1GameplayPolish", act1GameplayPolish ? () => act1GameplayPolish.installAct1GameplayPolish(QuestScene) : null);
      safeInstall("fallenCrossingShrine", fallenCrossingShrine ? () => fallenCrossingShrine.installFallenCrossingShrine(QuestScene) : null);
      safeInstall("fallenCrossingJournalBook", fallenCrossingJournalBook ? () => fallenCrossingJournalBook.installFallenCrossingJournalBook(QuestScene) : null);
      safeInstall("wardenCombat", wardenCombat ? () => wardenCombat.installWardenCombat(QuestScene) : null);
      safeInstall("act1WoodenBridges", act1WoodenBridges ? () => act1WoodenBridges.installAct1WoodenBridges(QuestScene) : null);
      safeInstall("wardenTidalRings", wardenTidalRings ? () => wardenTidalRings.installWardenTidalRings(QuestScene) : null);
      safeInstall("act1ExplorationArt", act1ExplorationArt ? () => act1ExplorationArt.installAct1ExplorationArt(QuestScene) : null);
      safeInstall("lastCrossingDefense", lastCrossingDefense ? () => lastCrossingDefense.installLastCrossingDefense(QuestScene) : null);
      safeInstall("majesticPortal", majesticPortal ? () => majesticPortal.installMajesticPortal(QuestScene) : null);
      safeInstall("relicPresentation", relicPresentation ? () => relicPresentation.installRelicPresentation() : null);
      safeInstall("act2Enemies", act2Enemies ? () => act2Enemies.installAct2Enemies(QuestScene) : null);
      safeInstall("act2GardenKeeper", act2GardenKeeper ? () => act2GardenKeeper.installAct2GardenKeeper(QuestScene) : null);
      safeInstall("act2EvelynSprite", act2EvelynSprite ? () => act2EvelynSprite.installAct2EvelynSprite(QuestScene) : null);
      safeInstall("act2VisualTuning", act2VisualTuning ? () => act2VisualTuning.installAct2VisualTuning(QuestScene) : null);
      safeInstall("act2GuideCleanup", act2GuideCleanup ? () => act2GuideCleanup.installAct2GuideCleanup(QuestScene) : null);
      safeInstall("act2SeasonIdentity", act2SeasonIdentity ? () => act2SeasonIdentity.installAct2SeasonIdentity(QuestScene) : null);
      safeInstall("act2BramForgemaster", act2BramForgemaster ? () => act2BramForgemaster.installAct2BramForgemaster(QuestScene) : null);
      safeInstall("act2BramWeaponOwnership", act2BramWeaponOwnership ? () => act2BramWeaponOwnership.installBramWeaponOwnership(QuestScene) : null);
      safeInstall("act2SeasonChallenges", act2SeasonChallenges ? () => act2SeasonChallenges.installAct2SeasonChallenges(QuestScene) : null);
      safeInstall("act2BossRemaster", act2BossRemaster ? () => act2BossRemaster.installAct2BossRemaster(QuestScene) : null);
      safeInstall("act2Wildlife", act2Wildlife ? () => act2Wildlife.installAct2Wildlife(QuestScene) : null);
      safeInstall("act2Memorial", act2Memorial ? () => act2Memorial.installAct2Memorial(QuestScene) : null);
      safeInstall("meleeHitPolish", meleeHitPolish ? () => meleeHitPolish.installMeleeHitPolish(QuestScene) : null);
      safeInstall("act3OpeningFlow", act3OpeningFlow ? () => act3OpeningFlow.installAct3OpeningFlow(QuestScene) : null);
      safeInstall("act3Enemies", act3Enemies ? () => act3Enemies.installAct3Enemies(QuestScene) : null);
      safeInstall("act3BossPolish", act3BossPolish ? () => act3BossPolish.installAct3BossPolish(QuestScene) : null);
      safeInstall("act3SheetScenes", act3SheetScenes ? () => act3SheetScenes.installAct3SheetScenes(QuestScene) : null);
      safeInstall("act3MusicIdentity", act3MusicIdentity ? () => act3MusicIdentity.installAct3MusicIdentity(QuestScene) : null);
      safeInstall("act3HavenLandmarks", act3HavenLandmarks ? () => act3HavenLandmarks.installAct3HavenLandmarks(QuestScene) : null);
      safeInstall("global2_5dPolish", global25DPolish ? () => global25DPolish.installGlobal25DPolish(QuestScene) : null);
      safeInstall("desktopActSelector", desktopActSelector ? () => desktopActSelector.installDesktopActSelector(QuestScene) : null);
      safeInstall("desktopControlsPolish", desktopControlsPolish ? () => desktopControlsPolish.installDesktopControlsPolish() : null);
      safeInstall("canvasSeamPolish", canvasSeamPolish ? () => canvasSeamPolish.installCanvasSeamPolish() : null);
      safeInstall("interactionPolish", interactionPolish ? () => interactionPolish.installInteractionPolish(QuestScene) : null);
      safeInstall("wrenIntro", wrenIntro ? () => wrenIntro.installWrenIntro(QuestScene) : null);
      safeInstall("lastCrossingDialogueRebind", lastCrossingDialogueRebind ? () => lastCrossingDialogueRebind.rebindLastCrossingDialoguePolish(QuestScene) : null);
      safeInstall("weaponVisualSync", weaponVisualSync ? () => weaponVisualSync.installWeaponVisualSync(QuestScene) : null);
      safeInstall("introUiPolish", introUiPolish ? () => introUiPolish.installIntroUiPolish(QuestScene) : null);
      safeInstall("mariaMovementPolish", mariaMovementPolish ? () => mariaMovementPolish.installMariaMovementPolish(QuestScene, QuestHouseScene) : null);
      safeInstall("mariaCombatAnimation", mariaCombatAnimation ? () => mariaCombatAnimation.installMariaCombatAnimation(QuestScene) : null);
      safeInstall("globalCharacterReactions", globalCharacterReactions ? () => globalCharacterReactions.installGlobalCharacterReactions(QuestScene) : null);
      safeInstall("globalNpcLife", globalNpcLife ? () => globalNpcLife.installGlobalNpcLife(QuestScene) : null);
      safeInstall("enemyReactionPolish", enemyReactionPolish ? () => enemyReactionPolish.installEnemyReactionPolish(QuestScene) : null);
      safeInstall("combatImpactPolish", combatImpactPolish ? () => combatImpactPolish.installCombatImpactPolish(QuestScene) : null);
      safeInstall("actArrivalCinematics", actArrivalCinematics ? () => actArrivalCinematics.installActArrivalCinematics(QuestScene) : null);
      safeInstall("environmentalMicroLife", environmentalMicroLife ? () => environmentalMicroLife.installEnvironmentalMicroLife(QuestScene) : null);
      safeInstall("explorationFeedback", explorationFeedback ? () => explorationFeedback.installExplorationFeedback(QuestScene) : null);
      safeInstall("romanticMicroPolish", romanticMicroPolish ? () => romanticMicroPolish.installRomanticMicroPolish(QuestScene) : null);
      safeInstall("npcPresencePolish", npcPresencePolish ? () => npcPresencePolish.installNpcPresencePolish(QuestScene) : null);

      releaseQuestRuntimeReady();

      requestAnimationFrame(() => requestAnimationFrame(() => {
        void (async () => {
          const dialogue = await safeImport("globalCharacterDialogue", () => import("./globalCharacterDialogue"));
          const act3AndrewDialogue = await safeImport("act3AndrewDialogue", () => import("./act3AndrewDialogue"));
          safeInstall("globalCharacterDialogue", dialogue ? () => dialogue.installGlobalCharacterDialogue(QuestScene) : null);
          safeInstall("act3AndrewDialogue", act3AndrewDialogue ? () => act3AndrewDialogue.installAct3AndrewDialogue(QuestScene) : null);
        })();
      }));
    })().catch((error) => {
      console.error("[quest] resilient premium install failed unexpectedly", error);
      releaseQuestRuntimeReady();
    });
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
