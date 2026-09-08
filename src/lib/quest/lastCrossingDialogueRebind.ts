// @ts-nocheck -- Ensure Last Crossing premium dialogue owns the final interact route.
import { installLastCrossingDialoguePolish } from "./lastCrossingDialoguePolish";

/**
 * Several quest decorators wrap QuestScene.interact. Rebind the Last Crossing
 * dialogue pass after every other installer so Elara, Pip, Maeve, Silas and
 * the forge cannot fall through to the older generic dialogue handlers.
 */
export function rebindLastCrossingDialoguePolish(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto) return;
  // The first installation may have happened earlier through interactionPolish.
  // Clearing only this installer guard is safe: the new outer wrapper intercepts
  // Last Crossing interactions and returns before reaching the older wrapper.
  proto.__lastCrossingDialoguePolishInstalled = false;
  installLastCrossingDialoguePolish(QuestScene);
}
