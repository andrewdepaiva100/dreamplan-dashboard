import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type Phaser from "phaser";
import {
  ANDREW_AFFIRMATIONS,
  CEREMONY_CHOICES,
  CEREMONY_OPENING,
  CONTROLS_HELP,
  ENVELOPES,
  FINAL_PROPOSAL,
  HOW_TO_PLAY,
  MEMORY_STONE_TEXT,
  PHOTO_SRC,
  REALM_LANDMARKS,
  RELICS,
  STORY_PREMISE,
  VAULT_JOURNAL,
  ZONES,
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
import type { ZoneId } from "@/lib/quest/content";

type MapSnapshot = {
  rows: string[];
  player: { x: number; y: number };
  pins: { x: number; y: number; label: string; kind: string }[];
  zone: ZoneId;
  unlocked: ZoneId[];
};

const MAP_TILE_COLORS = [
  "#6aa84f",
  "#8fbc5a",
  "#4a8fd6",
  "#6b6257",
  "#e8e3d6",
  "#2f6b3a",
  "#141b30",
  "#3a2f4a",
  "#c1a173",
  "#26406b",
];

/** Renders the live world snapshot as a small canvas map. */
function LiveMapCanvas({ snap }: { snap: MapSnapshot }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const n = snap.rows.length || 1;
    const cell = c.width / n;
    ctx.clearRect(0, 0, c.width, c.height);
    snap.rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        ctx.fillStyle = MAP_TILE_COLORS[Number(row[x])] ?? "#6aa84f";
        ctx.fillRect(x * cell, y * cell, cell + 0.6, cell + 0.6);
      }
    });
    for (const pin of snap.pins) {
      ctx.beginPath();
      ctx.arc(pin.x * c.width, pin.y * c.height, 5, 0, Math.PI * 2);
      ctx.fillStyle = pin.kind === "landmark" ? "#c9a24b" : "#ffffff";
      ctx.strokeStyle = "#0b1e3d";
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(snap.player.x * c.width, snap.player.y * c.height, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#ff6b7a";
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
  }, [snap]);
  return <canvas ref={ref} width={420} height={420} className="mx-auto w-full max-w-sm rounded-xl border border-gold/40" />;
}

/** Gentle procedural score — one warm chord loop per act, no audio files. */
function useActMusic(zone: ZoneId | undefined, muted: boolean) {
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    stopRef.current?.();
    stopRef.current = null;
    if (!zone || muted) return;
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = ctxRef.current ?? new AC();
    ctxRef.current = ctx;
    void ctx.resume();
    const chords: Record<string, number[]> = {
      sunlit_shores: [261.6, 329.6, 392.0],
      wedding_garden: [293.7, 370.0, 440.0],
      the_haven: [349.2, 440.0, 523.3],
      starry_ascent: [220.0, 277.2, 329.6],
      cathedral: [261.6, 392.0, 523.3],
    };
    const notes = chords[zone] ?? chords["sunlit_shores"]!;
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 2);
    const oscs = notes.map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sine" : "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0.32 / (i + 1);
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lg = ctx.createGain();
      lg.gain.value = 0.16;
      lfo.connect(lg).connect(g.gain);
      lfo.start();
      o.connect(g).connect(master);
      o.start();
      return [o, lfo] as const;
    });
    stopRef.current = () => {
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      setTimeout(() => {
        oscs.forEach(([o, l]) => {
          try {
            o.stop();
            l.stop();
          } catch {
            /* already stopped */
          }
        });
        master.disconnect();
      }, 700);
    };
    return () => stopRef.current?.();
  }, [zone, muted]);
  useEffect(() => () => void ctxRef.current?.close(), []);
}

function buzz(ms = 18) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* haptics unsupported */
  }
}

type Screen = "title" | "playing";
type TitleOverlay = null | "story" | "guide";

const HEART = "♥";

function GlassPanel({
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
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-[rgba(6,10,24,0.72)] p-4 backdrop-blur-sm">
      <div
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-full overflow-y-auto rounded-2xl border border-rose-gold/40 bg-[rgba(253,250,243,0.92)] p-6 shadow-2xl`}
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

/** Ambient background canvas: drifting gold motes and falling rose petals. */
function AmbientCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", resize);

    const motes: { x: number; y: number; r: number; s: number; a: number }[] = [];
    for (let i = 0; i < 36; i++) {
      motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        s: Math.random() * 0.4 + 0.2,
        a: Math.random() * Math.PI * 2,
      });
    }

    const petals: { x: number; y: number; r: number; dx: number; dy: number; rot: number; drot: number }[] = [];
    for (let i = 0; i < 18; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 4 + 3,
        dx: Math.random() * 0.6 - 0.3,
        dy: Math.random() * 0.5 + 0.3,
        rot: Math.random() * Math.PI * 2,
        drot: (Math.random() - 0.5) * 0.03,
      });
    }

    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 16, 2);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // soft rose-gold vignette gradient
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.9);
      g.addColorStop(0, "rgba(255, 230, 235, 0.08)");
      g.addColorStop(0.5, "rgba(201, 162, 75, 0.04)");
      g.addColorStop(1, "rgba(11, 30, 61, 0.22)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // gold motes
      for (const m of motes) {
        m.a += 0.02 * dt;
        m.x += Math.cos(m.a) * m.s * dt;
        m.y -= m.s * 0.4 * dt;
        if (m.y < -10) {
          m.y = h + 10;
          m.x = Math.random() * w;
        }
        if (m.x < -10) m.x = w + 10;
        if (m.x > w + 10) m.x = -10;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 240, 191, ${0.35 + Math.sin(m.a) * 0.15})`;
        ctx.fill();
      }

      // rose petals
      for (const p of petals) {
        p.x += p.dx * dt;
        p.y += p.dy * dt;
        p.rot += p.drot * dt;
        if (p.y > h + 10) {
          p.y = -10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 200, 210, 0.55)";
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
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
  const [overlay, setOverlay] = useState<TitleOverlay>(null);
  const [showControls, setShowControls] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSnap, setMapSnap] = useState<MapSnapshot | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [actBanner, setActBanner] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  useActMusic(screen === "playing" ? hud?.zone : undefined, muted);

  // lock page scroll while the full-screen game is up
  useEffect(() => {
    if (screen !== "playing") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [screen]);

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
      requestAnimationFrame(() => {
        const host = hostRef.current;
        if (!host || gameRef.current) return;
        const game = createQuestGame(host, save);
        gameRef.current = game;
        game.events.on(EV.hud, (s: HudState) => setHud(s));
        game.events.on(EV.modal, (m: ModalPayload) => {
          buzz(24);
          setModal(m);
        });
        game.events.on(EV.act, (a: { title: string }) => {
          buzz(40);
          setActBanner(a.title);
          setTimeout(() => setActBanner(null), 3600);
        });
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

  // live map polling while the overlay is open
  useEffect(() => {
    if (!showMap) return;
    const read = () => {
      const scene = gameRef.current?.scene.getScene("quest") as
        | { getMapSnapshot?: () => MapSnapshot }
        | undefined;
      const snap = scene?.getMapSnapshot?.();
      if (snap) setMapSnap(snap);
    };
    read();
    const t = setInterval(read, 400);
    return () => clearInterval(t);
  }, [showMap]);

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
      <div className="relative overflow-hidden rounded-2xl border border-rose-gold/30 bg-[image:var(--gradient-cover)] px-6 py-12 text-center">
        <AmbientCanvas />
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
          <div className="w-full rounded-3xl border border-rose-gold/40 bg-[rgba(255,255,255,0.12)] p-8 shadow-[0_0_60px_-20px_rgba(201,162,75,0.45)] backdrop-blur-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-glow">
              A gift for Maria
            </p>
            <h2 className="mt-4 font-display text-[2.6rem] font-extrabold leading-tight text-white">
              Maria&apos;s Quest
            </h2>
            <p className="mt-1 font-serif-italic text-xl italic text-blush">Realm of the Golden Ring</p>
            <p className="mx-auto mt-5 max-w-xs text-sm leading-relaxed text-sky">
              Walk five realms, turn worry into blossoms, gather five relics of love, and find Andrew
              waiting at the cathedral.
            </p>

            <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => void startGame(true)}
                className="rounded-xl bg-gradient-to-r from-gold to-gold-glow px-5 py-3 text-sm font-bold text-navy shadow-lg shadow-gold/20 transition-transform active:scale-[0.98] disabled:opacity-60"
              >
                New Game
              </button>
              <button
                type="button"
                disabled={loading || !canContinue}
                onClick={() => void startGame(false)}
                className="rounded-xl border border-sky/60 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                {canContinue ? "Continue Your Journey" : "No saved journey yet"}
              </button>
              <button
                type="button"
                onClick={() => setOverlay("story")}
                className="rounded-xl border border-rose-gold/40 bg-white/10 px-5 py-3 text-sm font-semibold text-blush backdrop-blur-sm transition-transform active:scale-[0.98]"
              >
                How to Play &amp; Story
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-sky underline underline-offset-4 transition-transform active:scale-[0.98]"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {overlay === "story" ? (
          <GlassPanel title="How to Play & Story" onClose={() => setOverlay(null)} wide>
            <div className="space-y-4">
              <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-rose-gold/10 to-transparent p-4">
                <p className="text-sm font-semibold text-navy">The Premise</p>
                <p className="mt-1 text-sm leading-relaxed text-navy/85">{STORY_PREMISE}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {HOW_TO_PLAY.map((h) => (
                  <div
                    key={h.title}
                    className="rounded-xl border border-gold/20 bg-white/70 p-3 text-left"
                  >
                    <p className="text-sm font-bold text-navy">{h.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-navy/80">{h.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        ) : null}
      </div>
    );
  }

  // ---------------- playing ---------------------------------------------
  return (
    <div className="fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden bg-[#0b1e3d]">
      <div ref={hostRef} className="absolute inset-0 h-full w-full touch-none" />

      {/* HUD */}
      {hud ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 text-white"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
        >
          <div className="rounded-xl bg-[rgba(11,30,61,0.72)] px-3 py-2 backdrop-blur">
            <div className="text-lg leading-none tracking-widest text-[#ff6b7a]">
              {HEART.repeat(hud.health)}
              <span className="text-white/25">{HEART.repeat(hud.maxHealth - hud.health)}</span>
            </div>
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-teal" style={{ width: `${hud.stamina}%` }} />
            </div>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-gold"
                style={{ width: `${Math.round(hud.dashProgress * 100)}%` }}
              />
            </div>
          </div>

          {/* objective tracker — top centre */}
          <div className="max-w-[46%] rounded-xl border border-gold/40 bg-[rgba(11,30,61,0.78)] px-3 py-2 text-center backdrop-blur">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold">
              {hud.act} · {hud.zoneTitle}
            </p>
            <p className="mt-0.5 text-xs leading-snug text-white/95">{hud.objective}</p>
            <p className="mt-1 text-[11px] text-sky">
              Relics {hud.relics.length}/5 · Letters {hud.envelopes.length}/5 · Keys {hud.keys}/3
            </p>
          </div>

          <div className="pointer-events-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setShowControls(true)}
              className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-sky/50 bg-[rgba(11,30,61,0.78)] text-[9px] font-bold uppercase tracking-wider text-sky backdrop-blur"
              aria-label="Controls"
            >
              <span className="text-base leading-none">🎮</span>
              <span>Help</span>
            </button>
            <button
              type="button"
              onClick={() => {
                buzz();
                setShowMap(true);
              }}
              className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-gold/50 bg-[rgba(11,30,61,0.78)] text-[9px] font-bold uppercase tracking-wider text-gold backdrop-blur"
              aria-label="Realm map"
            >
              <span className="text-base leading-none">🗺️</span>
              <span>Map</span>
            </button>
            <button
              type="button"
              onClick={() => {
                buzz();
                setShowMemories(true);
              }}
              className="flex h-11 w-11 flex-col items-center justify-center rounded-xl border border-blush/50 bg-[rgba(11,30,61,0.78)] text-[9px] font-bold uppercase tracking-wider text-blush backdrop-blur"
              aria-label="Memories"
            >
              <span className="text-base leading-none">💛</span>
              <span>Album</span>
            </button>
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-[rgba(11,30,61,0.78)] text-base text-white backdrop-blur"
              aria-label={muted ? "Unmute music" : "Mute music"}
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>
        </div>
      ) : null}

      {/* prompt */}
      {hud?.prompt ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-48 z-20 flex justify-center">
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
      <div
        className="absolute inset-x-0 bottom-0 z-20 flex select-none items-end justify-between p-4"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
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
        <GlassPanel title={relic.name} onClose={closeModal}>
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{relic.note}</p>
          <p className="font-serif-italic italic">“{relic.card}”</p>
        </GlassPanel>
      ) : null}

      {modal?.type === "envelope" && envelope ? (
        <GlassPanel title={envelope.title} onClose={closeModal}>
          <p>{envelope.letter}</p>
        </GlassPanel>
      ) : null}

      {modal?.type === "memory" ? (
        <GlassPanel title="Memory Stone" onClose={closeModal} wide>
          <img
            src={PHOTO_SRC}
            alt="Andrew and Maria together"
            className="mx-auto max-h-72 rounded-xl object-cover"
          />
          <p>{MEMORY_STONE_TEXT}</p>
        </GlassPanel>
      ) : null}

      {modal?.type === "andrew" ? (
        <GlassPanel title="Andrew" onClose={closeModal}>
          <p className="font-serif-italic italic">“{modal.line}”</p>
          <p className="text-xs text-navy/60">
            {ANDREW_AFFIRMATIONS[Math.floor(Math.random() * ANDREW_AFFIRMATIONS.length)]}
          </p>
        </GlassPanel>
      ) : null}

      {modal?.type === "vault" ? (
        <GlassPanel title="The Vault of Gratitude" onClose={closeModal} wide>
          {VAULT_JOURNAL.map((entry) => (
            <div key={entry.title} className="rounded-xl border border-gold/30 bg-white/70 p-3">
              <p className="text-sm font-bold text-navy">{entry.title}</p>
              <p className="mt-1 text-sm text-navy/80">{entry.body}</p>
            </div>
          ))}
        </GlassPanel>
      ) : null}

      {modal?.type === "info" ? (
        <GlassPanel title={modal.title} onClose={closeModal}>
          <p>{modal.body}</p>
        </GlassPanel>
      ) : null}

      {modal?.type === "guide" ? (
        <GlassPanel title="Realm Map" onClose={closeModal} wide>
          <p className="text-sm text-navy/80">
            The Realm Guide points toward the five landmarks that lead to the Grand Cathedral.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {REALM_LANDMARKS.map((lm) => (
              <div
                key={lm.zone}
                className="rounded-xl border border-gold/30 bg-white/70 p-3 text-left"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                  {lm.direction} · {lm.act}
                </p>
                <p className="mt-1 text-sm font-semibold text-navy">{lm.name}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {showControls ? (
        <GlassPanel title="How to play" onClose={() => setShowControls(false)} wide>
          <div className="grid gap-2 sm:grid-cols-2">
            {CONTROLS_HELP.map((c) => (
              <div key={c.title} className="rounded-xl border border-gold/25 bg-white/70 p-3">
                <p className="text-sm font-bold text-navy">{c.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-navy/80">{c.body}</p>
              </div>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {actBanner ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="animate-fade-in rounded-2xl border border-gold/60 bg-[rgba(11,30,61,0.86)] px-8 py-6 text-center backdrop-blur">
            <p className="text-[11px] uppercase tracking-[0.35em] text-gold">
              {hud?.act ?? "Your journey"}
            </p>
            <p className="mt-2 font-display text-2xl font-bold text-white">{actBanner}</p>
          </div>
        </div>
      ) : null}

      {showMap ? (
        <GlassPanel title="Realm Map" onClose={() => setShowMap(false)} wide>
          {mapSnap ? (
            <>
              <LiveMapCanvas snap={mapSnap} />
              <p className="text-center text-xs text-navy/70">
                Rose marker: you. Gold marker: this act&apos;s landmark. White markers: relics,
                guides and portals.
              </p>
              <button
                type="button"
                onClick={() => {
                  buzz();
                  emit(EV.guideme);
                  setShowMap(false);
                }}
                className="w-full rounded-xl bg-gradient-to-r from-gold to-gold-glow px-4 py-3 text-sm font-bold text-navy"
              >
                ✨ Guide Me to my objective
              </button>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  Fast travel
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {REALM_LANDMARKS.map((lm) => {
                    const unlocked = mapSnap.unlocked.includes(lm.zone as ZoneId);
                    const here = mapSnap.zone === lm.zone;
                    return (
                      <button
                        key={lm.zone}
                        type="button"
                        disabled={!unlocked || here}
                        onClick={() => {
                          buzz();
                          emit(EV.travel, lm.zone);
                          setShowMap(false);
                        }}
                        className="rounded-xl border border-gold/30 bg-white/70 p-3 text-left disabled:opacity-45"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gold">
                          {lm.direction} · {lm.act}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-navy">{lm.name}</p>
                        <p className="mt-0.5 text-[11px] text-navy/60">
                          {here ? "You are here" : unlocked ? "Travel here" : "Sealed"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-navy/70">Charting the realm…</p>
          )}
        </GlassPanel>
      ) : null}

      {showMemories ? (
        <GlassPanel title="Album of Memories" onClose={() => setShowMemories(false)} wide>
          <img
            src={PHOTO_SRC}
            alt="Andrew and Maria together"
            className="mx-auto max-h-56 rounded-xl object-cover"
          />
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Relics of devotion ({hud?.relics.length ?? 0}/5)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {RELICS.map((r) => {
              const found = hud?.relics.includes(r.id);
              return (
                <div
                  key={r.id}
                  className={`rounded-xl border p-3 ${found ? "border-gold/40 bg-white/75" : "border-navy/10 bg-white/40"}`}
                >
                  <p className="text-sm font-semibold text-navy">{found ? r.name : "Not yet found"}</p>
                  <p className="mt-1 text-xs text-navy/75">
                    {found ? r.card : `Hidden in ${ZONES[r.zone].title}.`}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
            Love letters ({hud?.envelopes.length ?? 0}/5)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {ENVELOPES.map((e) => {
              const found = hud?.envelopes.includes(e.id);
              return (
                <div
                  key={e.id}
                  className={`rounded-xl border p-3 ${found ? "border-blush/50 bg-white/75" : "border-navy/10 bg-white/40"}`}
                >
                  <p className="text-sm font-semibold text-navy">{found ? e.title : "Sealed letter"}</p>
                  {found ? <p className="mt-1 text-xs text-navy/75">{e.letter}</p> : null}
                </div>
              );
            })}
          </div>
        </GlassPanel>
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
