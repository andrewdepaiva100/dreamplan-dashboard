import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Phaser from "phaser";
import {
  ANDREW_AFFIRMATIONS,
  CEREMONY_CHOICES,
  CEREMONY_OPENING,
  ENVELOPES,
  FINAL_PROPOSAL,
  MEMORY_STONE_TEXT,
  PHOTO_SRC,
  RELICS,
  VAULT_JOURNAL,
} from "@/lib/quest/content";
import {
  EMPTY_SAVE,
  createDebouncedSaver,
  hasSave,
  loadSave,
  persistSave,
  type QuestSave,
} from "@/lib/quest/save";
import { EV, type HudState, type ModalPayload } from "@/lib/quest/events";

type Screen = "title" | "playing";

const HEART = "♥";

function Panel({
  children,
  onClose,
  title,
  wide,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(6,10,24,0.78)] p-4">
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-full overflow-y-auto rounded-2xl border border-gold/50 bg-[#fdfaf3] p-6 shadow-2xl`}
      >
        <h3 className="font-display text-xl font-bold text-navy">{title}</h3>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-navy/85">{children}</div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
          >
            Continue
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function MariasQuest({ onExit }: { onExit: () => void }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const saverRef = useRef(createDebouncedSaver(1200));
  const saveRef = useRef<QuestSave>({ ...EMPTY_SAVE });

  const [screen, setScreen] = useState<Screen>("title");
  const [canContinue, setCanContinue] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hud, setHud] = useState<HudState | null>(null);
  const [modal, setModal] = useState<ModalPayload | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [photo, setPhoto] = useState(false);
  const [ceremony, setCeremony] = useState<null | {
    step: "opening" | "reply" | "proposal" | "vows" | "finale";
    choice?: string;
  }>(null);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const existing = await loadSave();
      if (!alive) return;
      if (existing) saveRef.current = existing;
      setCanContinue(await hasSave());
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const emit = useCallback((event: string, payload?: unknown) => {
    gameRef.current?.events.emit(event, payload);
  }, []);

  const startGame = useCallback(
    async (fresh: boolean) => {
      const save = fresh ? { ...EMPTY_SAVE } : saveRef.current;
      saveRef.current = save;
      if (fresh) await persistSave(save);
      setScreen("playing");
      const { createQuestGame } = await import("@/lib/quest/scene");
      // host element mounts with the "playing" screen
      requestAnimationFrame(() => {
        const host = hostRef.current;
        if (!host || gameRef.current) return;
        const game = createQuestGame(host, save);
        gameRef.current = game;
        game.events.on(EV.hud, (s: HudState) => setHud(s));
        game.events.on(EV.modal, (m: ModalPayload) => setModal(m));
        game.events.on(EV.save, (s: QuestSave) => {
          saveRef.current = s;
          saverRef.current.queue(s);
        });
        game.events.on(EV.toast, (m: string) => setToast(m));
        game.events.on(EV.ceremony, () => setCeremony({ step: "opening" }));
      });
    },
    [],
  );

  const destroyGame = useCallback(async () => {
    const game = gameRef.current;
    gameRef.current = null;
    if (game) {
      game.events.removeAllListeners();
      game.destroy(true);
    }
    await saverRef.current.flushNow(saveRef.current);
  }, []);

  useEffect(() => {
    return () => {
      const game = gameRef.current;
      gameRef.current = null;
      if (game) {
        game.events.removeAllListeners();
        game.destroy(true);
      }
      saverRef.current.flush();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const closeModal = useCallback(() => {
    setModal(null);
    emit(EV.resume);
  }, [emit]);

  const returnToTitle = useCallback(async () => {
    await destroyGame();
    setHud(null);
    setModal(null);
    setCeremony(null);
    setCanContinue(await hasSave());
    setScreen("title");
  }, [destroyGame]);

  // ---------------- touch controls --------------------------------------
  const stickRef = useRef<HTMLDivElement | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const pointerId = useRef<number | null>(null);

  const updateStick = (clientX: number, clientY: number) => {
    const el = stickRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = (clientX - cx) / (r.width / 2);
    let dy = (clientY - cy) / (r.height / 2);
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    setKnob({ x: dx * 34, y: dy * 34 });
    emit(EV.stick, { x: dx, y: dy });
  };

  const endStick = () => {
    pointerId.current = null;
    setKnob({ x: 0, y: 0 });
    emit(EV.stick, { x: 0, y: 0 });
  };

  const relic = useMemo(
    () => (modal?.type === "relic" ? RELICS.find((r) => r.id === modal.relicId) : undefined),
    [modal],
  );
  const envelope = useMemo(
    () =>
      modal?.type === "envelope" ? ENVELOPES.find((e) => e.id === modal.envelopeId) : undefined,
    [modal],
  );

  // ---------------- title screen ----------------------------------------
  if (screen === "title") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-[image:var(--gradient-cover)] px-6 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky">
          A gift for Maria
        </p>
        <h2 className="mt-3 font-display text-[2.2rem] font-extrabold leading-tight text-white">
          Maria&apos;s Quest
        </h2>
        <p className="font-serif-italic text-lg italic text-gold">Realm of the Golden Ring</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-sky">
          Walk five realms, turn worry into blossoms, gather five relics of love, and find Andrew
          waiting at the cathedral.
        </p>
        <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => void startGame(true)}
            className="rounded-xl bg-gold px-5 py-3 text-sm font-bold text-navy disabled:opacity-60"
          >
            New Game
          </button>
          <button
            type="button"
            disabled={loading || !canContinue}
            onClick={() => void startGame(false)}
            className="rounded-xl border border-sky/60 px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            {canContinue ? "Continue Your Journey" : "No saved journey yet"}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-sky underline"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ---------------- playing ---------------------------------------------
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gold/40 bg-[#0b1e3d]">
      <div ref={hostRef} className="h-[70vh] min-h-[420px] w-full touch-none" />

      {/* HUD */}
      {hud ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-start justify-between gap-2 p-3 text-white">
          <div className="rounded-xl bg-[rgba(11,30,61,0.72)] px-3 py-2 backdrop-blur">
            <div className="text-lg leading-none tracking-widest text-[#ff6b7a]">
              {HEART.repeat(hud.health)}
              <span className="text-white/25">{HEART.repeat(hud.maxHealth - hud.health)}</span>
            </div>
            <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-teal" style={{ width: `${hud.stamina}%` }} />
            </div>
            <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-gold"
                style={{ width: `${Math.round(hud.dashProgress * 100)}%` }}
              />
            </div>
          </div>
          <div className="max-w-[52%] rounded-xl bg-[rgba(11,30,61,0.72)] px-3 py-2 text-right backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-sky">
              {hud.act} · {hud.zoneTitle}
            </p>
            <p className="text-xs text-white/90">{hud.objective}</p>
            <p className="mt-1 text-[11px] text-gold">
              Relics {hud.relics.length}/5 · Letters {hud.envelopes.length}/5 · Keys {hud.keys}/3
            </p>
          </div>
        </div>
      ) : null}

      {/* prompt */}
      {hud?.prompt ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-40 z-20 flex justify-center">
          <span className="rounded-full bg-gold px-4 py-1.5 text-xs font-bold text-navy">
            {hud.prompt}
          </span>
        </div>
      ) : null}

      {toast ? (
        <div className="pointer-events-none absolute inset-x-0 top-24 z-30 flex justify-center px-6">
          <span className="rounded-xl bg-[rgba(253,250,243,0.95)] px-4 py-2 text-center text-xs font-medium text-navy shadow-lg">
            {toast}
          </span>
        </div>
      ) : null}

      {/* touch controls */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex select-none items-end justify-between p-4">
        <div
          ref={stickRef}
          className="relative h-32 w-32 rounded-full border border-white/25 bg-white/10 backdrop-blur"
          onPointerDown={(e) => {
            pointerId.current = e.pointerId;
            e.currentTarget.setPointerCapture(e.pointerId);
            updateStick(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (pointerId.current === e.pointerId) updateStick(e.clientX, e.clientY);
          }}
          onPointerUp={endStick}
          onPointerCancel={endStick}
        >
          <div
            className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70"
            style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
          />
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onPointerDown={() => emit(EV.interact)}
              className="h-14 w-14 rounded-full bg-sky/80 text-xs font-bold text-navy"
            >
              TALK
            </button>
            <button
              type="button"
              onPointerDown={() => emit(EV.dash)}
              className="h-14 w-14 rounded-full bg-white/70 text-xs font-bold text-navy"
            >
              DASH
            </button>
            <button
              type="button"
              onPointerDown={() => emit(EV.action)}
              className="h-16 w-16 rounded-full bg-[#d61f2c] text-xs font-bold text-white"
            >
              PEACE
            </button>
          </div>
          <button
            type="button"
            onClick={() => void returnToTitle()}
            className="rounded-full bg-[rgba(11,30,61,0.75)] px-3 py-1.5 text-[11px] font-semibold text-sky"
          >
            Save &amp; Title
          </button>
        </div>
      </div>

      {/* modals */}
      {modal?.type === "relic" && relic ? (
        <Panel title={relic.name} onClose={closeModal}>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{relic.note}</p>
          <p className="font-serif-italic italic">“{relic.card}”</p>
        </Panel>
      ) : null}

      {modal?.type === "envelope" && envelope ? (
        <Panel title={envelope.title} onClose={closeModal}>
          <p>{envelope.letter}</p>
        </Panel>
      ) : null}

      {modal?.type === "memory" ? (
        <Panel title="Memory Stone" onClose={closeModal} wide>
          <img
            src={PHOTO_SRC}
            alt="Andrew and Maria together"
            className="mx-auto max-h-72 rounded-xl object-cover"
          />
          <p>{MEMORY_STONE_TEXT}</p>
        </Panel>
      ) : null}

      {modal?.type === "andrew" ? (
        <Panel title="Andrew" onClose={closeModal}>
          <p className="font-serif-italic italic">“{modal.line}”</p>
          <p className="text-xs text-navy/60">
            {ANDREW_AFFIRMATIONS[Math.floor(Math.random() * ANDREW_AFFIRMATIONS.length)]}
          </p>
        </Panel>
      ) : null}

      {modal?.type === "vault" ? (
        <Panel title="The Vault of Gratitude" onClose={closeModal} wide>
          {VAULT_JOURNAL.map((entry) => (
            <div key={entry.title} className="rounded-xl border border-gold/30 bg-white/70 p-3">
              <p className="text-sm font-bold text-navy">{entry.title}</p>
              <p className="mt-1 text-sm text-navy/80">{entry.body}</p>
            </div>
          ))}
        </Panel>
      ) : null}

      {modal?.type === "info" ? (
        <Panel title={modal.title} onClose={closeModal}>
          <p>{modal.body}</p>
        </Panel>
      ) : null}

      {/* ceremony */}
      {ceremony ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(6,10,24,0.88)] p-4">
          <div className="w-full max-w-lg max-h-full overflow-y-auto rounded-2xl border border-gold/60 bg-[#fdfaf3] p-6 text-center">
            {ceremony.step === "opening" ? (
              <>
                <h3 className="font-display text-xl font-bold text-navy">Andrew</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy/85">{CEREMONY_OPENING}</p>
                <div className="mt-5 space-y-2 text-left">
                  {CEREMONY_CHOICES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCeremony({ step: "reply", choice: c.id })}
                      className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm font-medium text-navy"
                    >
                      {c.player}
                    </button>
                  ))}
                </div>
              </>
            ) : null}

            {ceremony.step === "reply" ? (
              <>
                <h3 className="font-display text-xl font-bold text-navy">Andrew</h3>
                <p className="mt-3 font-serif-italic text-sm italic text-navy/85">
                  “{CEREMONY_CHOICES.find((c) => c.id === ceremony.choice)?.andrew}”
                </p>
                <button
                  type="button"
                  onClick={() => setCeremony({ step: "proposal" })}
                  className="mt-6 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
                >
                  Take his hand
                </button>
              </>
            ) : null}

            {ceremony.step === "proposal" ? (
              <>
                <img
                  src={PHOTO_SRC}
                  alt="Andrew and Maria together"
                  className="mx-auto max-h-72 rounded-xl object-cover"
                />
                <p className="mt-4 text-sm leading-relaxed text-navy/85">{FINAL_PROPOSAL}</p>
                <button
                  type="button"
                  onClick={() => {
                    const scene = gameRef.current?.scene.getScene("quest") as
                      | { completeWedding: () => void }
                      | undefined;
                    scene?.completeWedding();
                    setCeremony({ step: "finale" });
                  }}
                  className="mt-6 w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-navy"
                >
                  Yes — forever
                </button>
              </>
            ) : null}

            {ceremony.step === "finale" ? (
              <>
                <h3 className="font-display text-2xl font-extrabold text-navy">
                  Realm of the Golden Ring
                </h3>
                <p className="mt-2 font-serif-italic text-lg italic text-gold">
                  Andrew &amp; Maria — forever begins here.
                </p>
                <button
                  type="button"
                  onClick={() => setPhoto(true)}
                  className="mt-5 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
                >
                  View our photo
                </button>
                <button
                  type="button"
                  onClick={() => void returnToTitle()}
                  className="mt-3 w-full rounded-xl border border-navy/30 px-4 py-3 text-sm font-semibold text-navy"
                >
                  Return to the title screen
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {photo ? (
        <button
          type="button"
          onClick={() => setPhoto(false)}
          className="absolute inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
        >
          <img
            src={PHOTO_SRC}
            alt="Andrew and Maria together"
            className="max-h-full max-w-full rounded-xl object-contain"
          />
        </button>
      ) : null}
    </div>
  );
}

export default MariasQuest;
