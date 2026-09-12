import { useCallback, useEffect, useRef, useState } from "react";
import QuestCore from "./questCore";
import QuestJournal from "./QuestJournal";
import { EMPTY_SAVE, loadSave, type QuestSave } from "@/lib/quest/save";
import type { JournalProgress } from "@/lib/quest/journalContent";
import "@/lib/quest/inventoryArmoryPolish";
import { openMariaWardrobe } from "@/lib/quest/mariaWardrobe";

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
 * remains unchanged; this shell replaces the old Album affordance with the
 * richer Memory Journal without touching quest progression or saves.
 */
export function MariasQuest({ onExit }: { onExit?: () => void }) {
  const [playing, setPlaying] = useState(false);
  const [journalOpen, setJournalOpen] = useState(false);
  const [progress, setProgress] = useState<JournalProgress>(() => progressFromSave({ ...EMPTY_SAVE }));
  const wardrobeBypassRef = useRef(false);

  useEffect(() => {
    const refreshPlaying = () => {
      const albumButton = document.querySelector('button[aria-label="Memories"]');
      setPlaying(Boolean(albumButton));
    };
    refreshPlaying();
    const observer = new MutationObserver(refreshPlaying);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const openJournal = useCallback(async () => {
    try {
      navigator.vibrate?.(18);
    } catch {
      // Haptics are optional.
    }

    const saved = await loadSave();
    setProgress(progressFromSave(saved ?? { ...EMPTY_SAVE }));
    setJournalOpen(true);
  }, []);

  const closeJournal = useCallback(() => {
    setJournalOpen(false);
  }, []);

  const interceptNewGame = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (wardrobeBypassRef.current) {
      wardrobeBypassRef.current = false;
      return;
    }

    const button = (event.target as Element | null)?.closest?.("button");
    if (!button || button.textContent?.trim() !== "New Game") return;

    event.preventDefault();
    event.stopPropagation();
    openMariaWardrobe(() => {
      wardrobeBypassRef.current = true;
      button.click();
    });
  }, []);

  return (
    <>
      <style>{`
        button[aria-label="Memories"] { visibility: hidden !important; }
        @media (hover: hover) and (pointer: fine) {
          button[aria-label="Memory Journal"] {
            width: 52px !important;
            height: 52px !important;
            min-width: 52px !important;
            min-height: 52px !important;
            right: 12px !important;
            top: calc(max(0.75rem, env(safe-area-inset-top)) + 124px) !important;
            padding: 3px !important;
            gap: 3px !important;
            box-sizing: border-box !important;
          }
          button[aria-label="Memory Journal"] > span:first-child {
            font-size: 20px !important;
          }
          button[aria-label="Memory Journal"] > span:last-child {
            font-size: 8px !important;
            letter-spacing: .035em !important;
            line-height: 1 !important;
          }
        }
      `}</style>
      <div onClickCapture={interceptNewGame}>
        <QuestCore {...(onExit ? { onExit } : {})} />
      </div>

      {playing ? (
        <button
          type="button"
          disabled={journalOpen}
          onClick={() => void openJournal()}
          className="fixed right-3 z-[160] flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-[#e6c778]/70 bg-[rgba(11,30,61,0.86)] text-[8px] font-bold uppercase tracking-wider text-[#f2d894] shadow-[0_0_18px_rgba(201,162,75,.2)] backdrop-blur transition hover:border-[#f2d894] hover:bg-[rgba(31,43,70,0.94)] disabled:cursor-not-allowed disabled:opacity-35"
          style={{ top: "calc(max(0.75rem, env(safe-area-inset-top)) + 6.5rem)" }}
          aria-label="Memory Journal"
          title="Open Maria's Memory Journal"
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