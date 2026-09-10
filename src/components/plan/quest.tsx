import { useCallback, useEffect, useState } from "react";
import Phaser from "phaser";
import QuestCore from "./questCore";
import QuestJournal from "./QuestJournal";
import { EMPTY_SAVE, loadSave, type QuestSave } from "@/lib/quest/save";
import type { JournalProgress } from "@/lib/quest/journalContent";

function questScene() {
  const games = (Phaser as unknown as { GAMES?: Phaser.Game[] }).GAMES ?? [];
  for (const game of games) {
    try {
      const scene = game.scene?.getScene("quest") as
        | (Phaser.Scene & {
            frozen?: boolean;
            boss?: { active?: boolean } | null;
            __actArrivalActive?: boolean;
            save?: QuestSave;
            player?: { setVelocity?: (x: number, y: number) => unknown };
            onResume?: () => void;
          })
        | undefined;
      if (scene) return scene;
    } catch {
      // A Phaser game may exist before the quest scene has finished booting.
    }
  }
  return undefined;
}

function progressFromSave(save: QuestSave): JournalProgress {
  return {
    zone: save.current_zone,
    relics: save.relics_collected,
    envelopes: save.secret_envelopes_found,
    weapons: save.weapons,
    weddingCompleted: save.wedding_completed,
  };
}

/**
 * Thin presentation shell around the existing quest component. The core game
 * remains byte-for-byte unchanged; this shell replaces the old Album affordance
 * with the richer Memory Journal without touching quest progression or saves.
 */
export function MariasQuest({ onExit }: { onExit?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [progress, setProgress] = useState<JournalProgress>(() => progressFromSave({ ...EMPTY_SAVE }));

  const refreshSceneState = useCallback(() => {
    const scene = questScene();
    const albumButton = document.querySelector('button[aria-label="Memories"]');
    setPlaying(Boolean(albumButton));
    setBlocked(Boolean(scene?.frozen || scene?.boss?.active || scene?.__actArrivalActive));
    if (scene?.save) setProgress(progressFromSave(scene.save));
  }, []);

  useEffect(() => {
    refreshSceneState();
    const observer = new MutationObserver(refreshSceneState);
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(refreshSceneState, 500);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [refreshSceneState]);

  useEffect(() => {
    if (!journalOpen) return;
    const timer = window.setInterval(refreshSceneState, 450);
    return () => window.clearInterval(timer);
  }, [journalOpen, refreshSceneState]);

  const openJournal = useCallback(async () => {
    const scene = questScene();
    if (!scene || scene.frozen || scene.boss?.active || scene.__actArrivalActive) return;

    try {
      navigator.vibrate?.(18);
    } catch {
      // Haptics are optional.
    }

    if (scene.save) {
      setProgress(progressFromSave(scene.save));
    } else {
      const saved = await loadSave();
      setProgress(progressFromSave(saved ?? { ...EMPTY_SAVE }));
    }

    scene.frozen = true;
    scene.player?.setVelocity?.(0, 0);
    scene.physics?.pause?.();
    setJournalOpen(true);
  }, []);

  const closeJournal = useCallback(() => {
    setJournalOpen(false);
    const scene = questScene();
    scene?.onResume?.();
  }, []);

  return (
    <>
      <style>{`button[aria-label="Memories"] { visibility: hidden !important; }`}</style>
      <QuestCore onExit={onExit} />

      {playing ? (
        <button
          type="button"
          disabled={blocked || journalOpen}
          onClick={() => void openJournal()}
          className="fixed right-3 z-[160] flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-[#e6c778]/70 bg-[rgba(11,30,61,0.86)] text-[8px] font-bold uppercase tracking-wider text-[#f2d894] shadow-[0_0_18px_rgba(201,162,75,.2)] backdrop-blur transition hover:border-[#f2d894] hover:bg-[rgba(31,43,70,0.94)] disabled:cursor-not-allowed disabled:opacity-35"
          style={{ top: "calc(max(0.75rem, env(safe-area-inset-top)) + 6.5rem)" }}
          aria-label="Memory Journal"
          title={blocked ? "The journal can be opened during quiet exploration." : "Open Maria's Memory Journal"}
        >
          <span className="text-base leading-none">📖</span>
          <span>Journal</span>
        </button>
      ) : null}

      {journalOpen ? (
        <div className="fixed inset-0 z-[200]">
          <QuestJournal progress={progress} onClose={closeJournal} />
        </div>
      ) : null}
    </>
  );
}

export default MariasQuest;
