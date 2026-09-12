import { useCallback, useEffect, useRef, useState } from "react";
import QuestCore from "./questCore";
import QuestJournal from "./QuestJournal";
import { EMPTY_SAVE, loadSave, type QuestSave } from "@/lib/quest/save";
import type { JournalProgress } from "@/lib/quest/journalContent";
import "@/lib/quest/inventoryArmoryPolish";
import "@/lib/quest/ominousTransitionPolish";
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
        .quest-ominous-warning-overlay {
          background: radial-gradient(circle at 50% 42%, rgba(78, 7, 18, .30), rgba(1, 2, 8, .94) 70%) !important;
          backdrop-filter: blur(5px) saturate(.72) !important;
        }
        .quest-ominous-warning {
          position: relative !important;
          overflow: hidden !important;
          border-color: rgba(165, 31, 48, .82) !important;
          background: linear-gradient(155deg, rgba(18, 15, 22, .985), rgba(5, 7, 14, .99)) !important;
          box-shadow: 0 0 0 1px rgba(255, 77, 92, .08), 0 0 48px rgba(145, 8, 28, .34), 0 28px 80px rgba(0, 0, 0, .78) !important;
          animation: ominous-warning-breathe 2.8s ease-in-out infinite !important;
        }
        .quest-ominous-warning::before {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% -15%, rgba(170, 24, 42, .24), transparent 47%), repeating-linear-gradient(0deg, rgba(255,255,255,.012) 0 1px, transparent 1px 4px);
        }
        .quest-ominous-warning h3 {
          position: relative;
          color: #f1d7da !important;
          text-shadow: 0 0 18px rgba(215, 38, 58, .38) !important;
          letter-spacing: .015em !important;
        }
        .quest-ominous-warning .mt-3 {
          position: relative;
          color: rgba(230, 218, 222, .82) !important;
        }
        .quest-ominous-warning .mt-3 p {
          color: #cbbbc1 !important;
          line-height: 1.75 !important;
        }
        .quest-ominous-warning button[aria-label="Skip"] {
          position: relative;
          border-color: rgba(183, 48, 64, .55) !important;
          background: rgba(8, 8, 14, .9) !important;
          color: #d7a9b1 !important;
        }
        .quest-ominous-warning-continue {
          position: relative !important;
          border: 1px solid rgba(190, 40, 58, .62) !important;
          background: linear-gradient(180deg, #36101a, #170911) !important;
          color: #f5e7e9 !important;
          box-shadow: inset 0 0 18px rgba(170, 18, 38, .16), 0 0 22px rgba(120, 5, 22, .22) !important;
          letter-spacing: .05em !important;
        }
        @keyframes ominous-warning-breathe {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,77,92,.07), 0 0 38px rgba(145,8,28,.25), 0 28px 80px rgba(0,0,0,.78); }
          50% { box-shadow: 0 0 0 1px rgba(255,77,92,.13), 0 0 62px rgba(160,8,30,.42), 0 28px 80px rgba(0,0,0,.82); }
        }
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