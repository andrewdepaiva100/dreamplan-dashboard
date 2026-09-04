import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

const Quest3D = lazy(() => import("./quest3d/Quest3D"));
import type Phaser from "phaser";
import {
  ANDREW_AFFIRMATIONS,
  CEREMONY_SCRIPT,
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
  WEAPON_BY_ID,
  WEAPONS,
  ZONES,
  FOOD_ITEMS,
  FOOD_BY_ID,
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
import mariaPortrait from "@/assets/quest/maria-portrait.png";
import titleCouple from "@/assets/quest/title-couple.png";
import portraitLorena from "@/assets/quest/portrait-lorena.jpg";
import portraitAlicia from "@/assets/quest/portrait-alicia.jpg";
import portraitPedro from "@/assets/quest/portrait-pedro.jpg";
import portraitGianluca from "@/assets/quest/portrait-gianluca.jpg";
import portraitAdriel from "@/assets/quest/portrait-adriel.jpg";
import portraitAndrew from "@/assets/quest/portrait-andrew.jpg";
import portraitRaquel from "@/assets/quest/portrait-raquel.jpg";
import portraitMarcos from "@/assets/quest/portrait-marcos.jpg";
import portraitSilvia from "@/assets/quest/portrait-silvia.jpg";
import portraitGustavo from "@/assets/quest/portrait-gustavo.jpg";
import portraitAndre from "@/assets/quest/portrait-andre.jpg";
import portraitPhillip from "@/assets/quest/portrait-phillip.jpg";
import portraitItalo from "@/assets/quest/portrait-italo.jpg";
import portraitGabe from "@/assets/quest/portrait-gabe.jpg";
import bossWater from "@/assets/quest/boss-water.png";
import bossGarden from "@/assets/quest/boss-garden.png";
import bossHaven from "@/assets/quest/boss-haven.png";
import bossStar from "@/assets/quest/boss-star.png";
import bossHollow from "@/assets/quest/boss-hollow.png";



const GUEST_PORTRAITS: Record<string, string> = {
  lorena: portraitLorena,
  alicia: portraitAlicia,
  pedro: portraitPedro,
  gianluca: portraitGianluca,
  adriel: portraitAdriel,
  andrew: portraitAndrew,
  raquel: portraitRaquel,
  marcos: portraitMarcos,
  silvia: portraitSilvia,
  gustavo: portraitGustavo,
  andre: portraitAndre,
  phillip: portraitPhillip,
  italo: portraitItalo,
  gabe: portraitGabe,
};

/** Wax-seal colour + display word per themed love letter. */
const ENVELOPE_THEMES: Record<string, { word: string; seal: string }> = {
  waterfall: { word: "Love", seal: "#c2405a" },
  hedge: { word: "Peace", seal: "#3f7a63" },
  patio: { word: "Patience", seal: "#a8762c" },
  summit: { word: "Kindness", seal: "#8455a8" },
  cathedral: { word: "Loyalty", seal: "#b8912f" },
};


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

/**
 * Procedural score — a real melody, not a drone. Each act gets a gentle
 * music-box theme plucked over a soft bass, battles get a driving minor
 * theme, and home gets a slow lullaby.
 */
function useActMusic(zone: ZoneId | undefined, muted: boolean, mode: MusicMode = "explore") {
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

    // semitone -> Hz, A4 = 440
    const hz = (n: number) => 440 * Math.pow(2, (n - 9) / 12);
    // melodies are scale degrees in semitones from C4 (0 = C4)
    const THEMES: Record<string, number[]> = {
      sunlit_shores: [0, 4, 7, 12, 9, 7, 4, 7, 5, 9, 12, 9, 7, 4, 2, 0],
      wedding_garden: [2, 5, 9, 14, 12, 9, 5, 9, 7, 11, 14, 12, 9, 7, 5, 2],
      the_haven: [5, 9, 12, 17, 16, 12, 9, 12, 7, 11, 14, 12, 9, 5, 7, 5],
      starry_ascent: [-3, 2, 4, 9, 7, 4, 2, 4, 0, 5, 9, 7, 4, 2, -1, -3],
      cathedral: [0, 7, 12, 16, 19, 16, 12, 7, 5, 9, 12, 17, 16, 12, 7, 0],
    };
    const BATTLE = [-5, -5, 2, 3, -5, 7, 6, 3, -5, -5, 2, 3, 10, 7, 3, 2];
    const HOME = [0, 4, 7, 4, 5, 2, 0, -5, 0, 4, 9, 7, 5, 4, 2, 0];
    const melody = mode === "battle" ? BATTLE : mode === "home" ? HOME : (THEMES[zone] ?? THEMES["sunlit_shores"]!);
    const bassRoot = mode === "battle" ? -17 : mode === "home" ? -12 : -12;
    // Unhurried, breathing pace — closer to a quiet piano score than a chiptune.
    const step = mode === "battle" ? 0.34 : mode === "home" ? 1.5 : 1.15;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(mode === "battle" ? 0.075 : 0.06, ctx.currentTime + 2.5);

    // warm, soft-felt tone: heavy low-pass so nothing sounds pixelated
    const soft = ctx.createBiquadFilter();
    soft.type = "lowpass";
    soft.frequency.value = mode === "battle" ? 1500 : 1000;
    soft.Q.value = 0.4;
    soft.connect(master);

    /** A felt-piano note: sine body, faint triangle overtone, long soft tail. */
    const note = (freq: number, at: number, dur: number, gain: number) => {
      for (const [type, mul, amp] of [
        ["sine", 1, 1],
        ["triangle", 2, 0.16],
      ] as [OscillatorType, number, number][]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(freq * mul, at);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(gain * amp, at + 0.09);
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
        o.connect(g).connect(soft);
        o.start(at);
        o.stop(at + dur + 0.1);
      }
    };

    // a slow pad underneath, the way ambient game scores hold a room together
    const padOsc = ctx.createOscillator();
    const padGain = ctx.createGain();
    padOsc.type = "sine";
    padOsc.frequency.value = hz(bassRoot);
    padGain.gain.value = 0.0001;
    padGain.gain.linearRampToValueAtTime(mode === "battle" ? 0.05 : 0.035, ctx.currentTime + 4);
    padOsc.connect(padGain).connect(soft);
    padOsc.start();

    let i = 0;
    let next = ctx.currentTime + 0.6;
    const tick = () => {
      const horizon = ctx.currentTime + 1.2;
      while (next < horizon) {
        const n = melody[i % melody.length]!;
        const rest = mode === "battle" ? 0 : Math.random();
        // let phrases breathe: sometimes simply hold the silence
        if (rest < 0.78) {
          note(hz(n), next, mode === "battle" ? 0.9 : 3.4, mode === "battle" ? 0.32 : 0.24);
          if (i % 4 === 0) note(hz(n + 7) / 2, next + 0.12, 4.2, 0.09);
        }
        if (i % 4 === 0) note(hz(bassRoot + (i % 8 === 0 ? 0 : 5)), next, 4.5, 0.14);
        next += step * (mode === "battle" ? 1 : 0.85 + Math.random() * 0.6);
        i += 1;
      }
    };
    tick();
    const timer = window.setInterval(tick, 400);

    stopRef.current = () => {
      window.clearInterval(timer);
      master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          padOsc.stop();
          padGain.disconnect();
          soft.disconnect();
          master.disconnect();
        } catch {
          /* already gone */
        }
      }, 1500);
    };
    return () => stopRef.current?.();
  }, [zone, muted, mode]);
  useEffect(() => () => void ctxRef.current?.close(), []);
}


function buzz(ms = 18) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* haptics unsupported */
  }
}

type MusicMode = "explore" | "battle" | "home";

type Screen = "title" | "playing";
type TitleOverlay = null | "story" | "guide";

const HEART = "♥";

/** Maria's dialogue portrait — her expression carries the scene. */
function MariaPortrait({ caption }: { caption?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-rose-gold/40 bg-white/70 p-2">
      <img
        src={mariaPortrait}
        alt="Maria smiling"
        width={256}
        height={256}
        loading="lazy"
        className="h-20 w-20 shrink-0 rounded-lg border border-gold/40 bg-blush/20 object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
        {caption ?? "Maria"}
      </p>
    </div>
  );
}

function GlassPanel({
  children,
  onClose,
  title,
  wide,
  compact,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  title: string;
  wide?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 z-40 flex items-center justify-center p-4 ${
        compact ? "bg-[rgba(6,10,24,0.42)] backdrop-blur-[2px]" : "bg-[rgba(6,10,24,0.72)] backdrop-blur-sm"
      }`}
    >
      <div
        className={`${
          compact
            ? "w-[64vw] min-w-[290px] max-w-md max-h-[66vh] p-4"
            : `w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-full p-6`
        } overflow-y-auto rounded-2xl border border-rose-gold/40 bg-[rgba(253,250,243,0.92)] shadow-2xl`}
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

/**
 * Minecraft-style slot grid with press-and-move dragging that works with a
 * finger, a mouse or a trackpad. Tapping a slot still acts instantly.
 */
function ItemGrid({
  items,
  slots = 20,
  selected,
  onPick,
  dragGroup,
  onDropIn,
}: {
  items: Record<string, number>;
  slots?: number;
  selected?: string | null;
  onPick?: (id: string) => void;
  /** Shared key so two grids can drag items between each other. */
  dragGroup?: string;
  onDropIn?: (id: string, from: string) => void;
}) {
  const [over, setOver] = useState(false);
  const [ghost, setGhost] = useState<{ x: number; y: number; icon: string; name: string } | null>(
    null,
  );
  const filled = Object.entries(items).filter(([, n]) => n > 0);
  const cells = Array.from({ length: Math.max(slots, filled.length) }, (_, i) => filled[i] ?? null);

  // Another grid asks us to accept an item / highlight while hovered.
  useEffect(() => {
    if (!dragGroup) return;
    const onDrop = (e: Event) => {
      const d = (e as CustomEvent<{ to: string; from: string; id: string }>).detail;
      setOver(false);
      if (d.to === dragGroup && d.from !== dragGroup) onDropIn?.(d.id, d.from);
    };
    const onOver = (e: Event) => {
      const d = (e as CustomEvent<{ to: string | null; from: string }>).detail;
      setOver(d.to === dragGroup && d.from !== dragGroup);
    };
    window.addEventListener("quest-slot-drop", onDrop);
    window.addEventListener("quest-slot-over", onOver);
    return () => {
      window.removeEventListener("quest-slot-drop", onDrop);
      window.removeEventListener("quest-slot-over", onOver);
    };
  }, [dragGroup, onDropIn]);

  const startDrag = (id: string, e: import("react").PointerEvent) => {
    if (!dragGroup) return;
    const food = FOOD_BY_ID[id];
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    const groupAt = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y) as HTMLElement | null;
      return el?.closest<HTMLElement>("[data-slot-group]")?.dataset["slotGroup"] ?? null;
    };
    const move = (ev: PointerEvent) => {
      if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) < 8) return;
      moved = true;
      setGhost({ x: ev.clientX, y: ev.clientY, icon: food?.icon ?? "📦", name: food?.name ?? id });
      window.dispatchEvent(
        new CustomEvent("quest-slot-over", {
          detail: { to: groupAt(ev.clientX, ev.clientY), from: dragGroup },
        }),
      );
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setGhost(null);
      window.dispatchEvent(
        new CustomEvent("quest-slot-over", { detail: { to: null, from: dragGroup } }),
      );
      if (!moved) {
        onPick?.(id);
        return;
      }
      const to = groupAt(ev.clientX, ev.clientY);
      if (to && to !== dragGroup) {
        window.dispatchEvent(
          new CustomEvent("quest-slot-drop", { detail: { to, from: dragGroup, id } }),
        );
      }
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <>
      <div
        data-slot-group={dragGroup}
        className={`grid grid-cols-5 gap-1.5 rounded-xl p-1 transition ${
          over ? "bg-gold/20 ring-2 ring-gold" : ""
        }`}
      >
        {cells.map((cell, i) => {
          const food = cell ? FOOD_BY_ID[cell[0]] : undefined;
          const on = cell && selected === cell[0];
          return (
            <button
              key={i}
              type="button"
              disabled={!cell}
              onPointerDown={(e) => {
                if (!cell) return;
                if (dragGroup) startDrag(cell[0], e);
              }}
              onClick={() => {
                if (cell && !dragGroup) onPick?.(cell[0]);
              }}
              title={food?.name ?? "Empty slot"}
              className={`relative flex aspect-square touch-none select-none items-center justify-center rounded-lg border text-xl transition ${
                on
                  ? "border-gold bg-gold/30"
                  : cell
                    ? "border-navy/25 bg-white/80 hover:bg-gold/15"
                    : "border-navy/10 bg-navy/5"
              }`}
            >
              <span>{food?.icon ?? ""}</span>
              {cell && cell[1] > 1 ? (
                <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-navy">
                  {cell[1]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {ghost ? (
        <div
          className="pointer-events-none fixed z-[60] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-gold bg-white/95 px-2 py-1 text-center shadow-xl"
          style={{ left: ghost.x, top: ghost.y }}
        >
          <span className="text-xl">{ghost.icon}</span>
          <span className="ml-1 text-[10px] font-bold text-navy">{ghost.name}</span>
        </div>
      ) : null}
    </>
  );
}

/**
 * Cinematic NPC conversation: a large painted portrait beside a typewriter
 * dialogue box, tapped through line by line like a premium RPG.
 */
/** A long, paged conversation with an act guide — weapon handed over at the end. */
function GuideTalk({
  name,
  pages,
  weaponId,
  line,
  onClose,
}: {
  name: string;
  pages: string[];
  weaponId?: string | undefined;
  line: string;
  onClose: () => void;
}) {
  const [showGift, setShowGift] = useState(false);
  const w = weaponId ? WEAPON_BY_ID[weaponId] : undefined;

  if (showGift && w) {
    return (
      <GlassPanel title={name} onClose={onClose}>
        <p className="font-serif-italic italic">“{line}”</p>
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
          <p className="text-3xl leading-none">{w.icon}</p>
          <p className="mt-2 font-display text-lg font-bold text-navy">{w.name}</p>
          <p className="mt-1 text-xs text-navy/70">{w.blurb}</p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gold">
            Power {w.damage} · Reach {w.reach}
          </p>
        </div>
      </GlassPanel>
    );
  }

  return (
    <GuestDialogue
      id="act-guide"
      name={name}
      lines={pages}
      onClose={() => {
        if (w) setShowGift(true);
        else onClose();
      }}
    />
  );
}

function GuestDialogue({
  id,
  name,
  role,
  lines,
  onClose,
}: {
  id: string;
  name: string;
  role?: string | undefined;
  lines: string[];
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const line = lines[Math.min(idx, lines.length - 1)] ?? "";
  const last = idx >= lines.length - 1;
  const done = typed.length >= line.length;
  const portrait = GUEST_PORTRAITS[id];

  useEffect(() => {
    setTyped("");
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(t);
    }, 18);
    return () => window.clearInterval(t);
  }, [line]);

  const advance = () => {
    buzz();
    if (!done) {
      setTyped(line);
      return;
    }
    if (last) onClose();
    else setIdx((i) => i + 1);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[rgba(6,10,24,0.6)] p-3 backdrop-blur-[3px] sm:items-center">
      <button
        type="button"
        onClick={advance}
        className="w-full max-w-3xl cursor-pointer text-left"
        aria-label="Continue conversation"
      >
        <div className="flex items-end gap-0 sm:gap-3">
          {portrait ? (
            <img
              src={portrait}
              alt={name}
              width={448}
              height={448}
              loading="lazy"
              className="hidden h-44 w-44 shrink-0 rounded-2xl border-2 border-gold/70 object-cover shadow-2xl sm:block"
            />
          ) : null}
          <div className="relative flex-1 overflow-hidden rounded-2xl border-2 border-gold/70 bg-[rgba(10,16,34,0.94)] shadow-2xl">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-rose-gold/10" />
            <div className="relative flex items-start gap-3 p-4">
              {portrait ? (
                <img
                  src={portrait}
                  alt=""
                  width={448}
                  height={448}
                  loading="lazy"
                  className="h-16 w-16 shrink-0 rounded-xl border border-gold/60 object-cover sm:hidden"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-display text-lg font-bold tracking-wide text-gold">{name}</span>
                  {role ? (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-white/55">{role}</span>
                  ) : null}
                </div>
                <p className="mt-2 min-h-[3.5rem] font-serif-italic text-[15px] italic leading-relaxed text-white/95">
                  “{typed}
                  {done ? "”" : ""}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {lines.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 w-4 rounded-full ${i <= idx ? "bg-gold" : "bg-white/20"}`}
                      />
                    ))}
                  </div>
                  <span className="animate-pulse text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    {done ? (last ? "Tap to close" : "Tap to continue") : "…"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

type BossSlideUI = { boss: string; replies: { id: string; text: string; answer: string }[] };

const BOSS_ART: Record<string, string> = {
  "boss-water": bossWater,
  "boss-garden": bossGarden,
  "boss-haven": bossHaven,
  "boss-star": bossStar,
  "boss-hollow": bossHollow,
};

/**
 * Five-beat boss confrontation: the creature speaks, Maria answers, it answers
 * back. Whichever tone she uses most decides the boon she carries into combat.
 */
function BossDialogue({
  name,
  role,
  art,
  demon,
  mariaLine,
  slides,
  onDone,
}: {
  name: string;
  role?: string | undefined;
  art: string;
  demon: string;
  mariaLine: string;
  slides: BossSlideUI[];
  onDone: (flavor: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const picks = useRef<string[]>([]);
  const slide = slides[Math.min(idx, slides.length - 1)];
  const line = answer ?? slide?.boss ?? "";
  const done = typed.length >= line.length;
  const portrait = BOSS_ART[art];
  const last = idx >= slides.length - 1;

  useEffect(() => {
    setTyped("");
    let i = 0;
    const t = window.setInterval(() => {
      i += 1;
      setTyped(line.slice(0, i));
      if (i >= line.length) window.clearInterval(t);
    }, 16);
    return () => window.clearInterval(t);
  }, [line]);

  const finish = () => {
    const tally: Record<string, number> = {};
    for (const p of picks.current) tally[p] = (tally[p] ?? 0) + 1;
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "bold";
    onDone(best);
  };

  const choose = (r: { id: string; answer: string }) => {
    buzz(24);
    picks.current.push(r.id);
    setAnswer(r.answer);
  };

  const advance = () => {
    buzz();
    if (!done) {
      setTyped(line);
      return;
    }
    if (answer === null) return;
    if (last) finish();
    else {
      setAnswer(null);
      setIdx((i) => i + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-[rgba(2,3,10,0.86)] p-3 backdrop-blur-[3px] sm:items-center">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-[#7d1b2b] bg-[rgba(8,7,14,0.97)] shadow-[0_0_60px_rgba(160,20,40,0.35)]">
        <div className="flex items-start gap-3 border-b border-[#7d1b2b]/60 bg-[rgba(30,6,12,0.75)] p-3">
          {portrait ? (
            <img
              src={portrait}
              alt={name}
              width={128}
              height={128}
              className="h-20 w-20 shrink-0 animate-pulse rounded-xl border-2 border-[#a8253c] bg-black/50 object-contain p-1"
              style={{ imageRendering: "pixelated" }}
            />
          ) : null}
          <div className="min-w-0">
            <p className="font-display text-xl font-bold tracking-wide text-[#ff5a6e]">{name}</p>
            {role ? (
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">{role}</p>
            ) : null}
            <p className="mt-1 text-[11px] leading-snug text-white/50">{demon}</p>
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto p-4">
          <p className="min-h-[4.5rem] font-serif-italic text-[15px] italic leading-relaxed text-[#ffd7dc]">
            “{typed}
            {done ? "”" : ""}
          </p>

          {answer === null && done ? (
            <div className="mt-4">
              {idx === 0 ? (
                <p className="mb-2 font-serif-italic text-[13px] italic text-white/70">
                  Maria: “{mariaLine}”
                </p>
              ) : null}
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                How does Maria answer?
              </p>
              <div className="mt-2 grid gap-2">
                {(slide?.replies ?? []).map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => choose(r)}
                    className="rounded-xl border border-gold/35 bg-white/5 p-3 text-left text-sm font-medium text-white/90 transition hover:border-gold hover:bg-gold/15"
                  >
                    “{r.text}”
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {answer !== null ? (
            <button
              type="button"
              onClick={advance}
              className="mt-4 w-full rounded-xl bg-[#7d1b2b] px-4 py-3 text-sm font-semibold text-white"
            >
              {last ? "Draw your weapon" : "Continue"}
            </button>
          ) : null}

          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-5 rounded-full ${i <= idx ? "bg-[#ff5a6e]" : "bg-white/15"}`}
                />
              ))}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
              {Math.min(idx + 1, slides.length)} / {slides.length}
            </span>
          </div>
        </div>
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
    phase: "script" | "proposal" | "finale";
    i: number;
    reply?: string;
  }>(null);
  const [overlay, setOverlay] = useState<TitleOverlay>(null);
  const [showControls, setShowControls] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapSnap, setMapSnap] = useState<MapSnapshot | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [showArmory, setShowArmory] = useState(false);
  const [actBanner, setActBanner] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [realm3d, setRealm3d] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [musicMode, setMusicMode] = useState<MusicMode>("explore");

  useActMusic(screen === "playing" ? hud?.zone : undefined, muted, musicMode);

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
        game.events.on(EV.music, (m: MusicMode) => setMusicMode(m));
        game.events.on(EV.toast, (m: string) => setToast(m));
        game.events.on(EV.ceremony, () => setCeremony({ phase: "script", i: 0 }));
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

  const equippedWeapon = hud?.equipped ? WEAPON_BY_ID[hud.equipped] : undefined;

  const relic = useMemo(
    () => (modal?.type === "relic" ? RELICS.find((r) => r.id === modal.relicId) : undefined),
    [modal],
  );
  const envelope = useMemo(
    () =>
      modal?.type === "envelope" ? ENVELOPES.find((e) => e.id === modal.envelopeId) : undefined,
    [modal],
  );

  // ---------------- 3D realm --------------------------------------------
  if (realm3d) {
    return (
      <Suspense
        fallback={
          <div className="flex h-[60vh] items-center justify-center rounded-2xl border border-rose-gold/30 bg-[#0b1e3d] text-sm text-white">
            Entering the 3D realm…
          </div>
        }
      >
        <Quest3D onExit={() => setRealm3d(false)} />
      </Suspense>
    );
  }

  // ---------------- title screen ----------------------------------------
  if (screen === "title") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-rose-gold/30 bg-[image:var(--gradient-cover)] px-6 py-12 text-center">
        <AmbientCanvas />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(6,10,24,0.55)_100%)]" />
        <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
          <div className="w-full rounded-3xl border border-rose-gold/40 bg-[rgba(255,255,255,0.12)] p-6 shadow-[0_0_60px_-20px_rgba(201,162,75,0.45)] backdrop-blur-xl sm:p-8">
            <div className="mx-auto max-w-[240px] animate-[quest-float_6s_ease-in-out_infinite]">
              <img
                src={titleCouple}
                alt="Pixel-art Andrew and Maria standing together in a golden flower meadow"
                width={1024}
                height={1024}
                className="w-full rounded-2xl border-2 border-gold/70 shadow-[0_0_40px_-10px_rgba(201,162,75,0.6)]"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.35em] text-gold-glow">
              A gift for Maria
            </p>
            <h2 className="mt-3 font-display text-[2.6rem] font-extrabold leading-tight text-white">
              Maria&apos;s Quest
            </h2>
            <p className="mt-1 font-serif-italic text-xl italic text-blush">Realm of the Golden Ring</p>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-sky">
              Walk five realms, turn worry into blossoms, gather five relics of love, and find Andrew
              waiting at the cathedral.
            </p>

            <div className="mx-auto mt-7 flex max-w-xs flex-col gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => void startGame(true)}
                className="rounded-xl bg-gradient-to-r from-gold to-gold-glow px-5 py-3.5 text-sm font-bold text-navy shadow-lg shadow-gold/30 transition hover:shadow-xl hover:shadow-gold/40 active:scale-[0.98] disabled:opacity-60"
              >
                New Game
              </button>
              <button
                type="button"
                disabled={loading || !canContinue}
                onClick={() => void startGame(false)}
                className="rounded-xl border border-sky/60 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:border-gold/60 hover:bg-white/15 active:scale-[0.98] disabled:opacity-40"
              >
                {canContinue ? "Continue Your Journey" : "No saved journey yet"}
              </button>
              <button
                type="button"
                onClick={() => setOverlay("story")}
                className="rounded-xl border border-rose-gold/40 bg-white/10 px-5 py-3.5 text-sm font-semibold text-blush backdrop-blur-sm transition hover:border-gold/60 hover:bg-white/15 active:scale-[0.98]"
              >
                How to Play &amp; Story
              </button>
              <button
                type="button"
                onClick={() => setRealm3d(true)}
                className="rounded-xl border border-teal/50 bg-teal/15 px-5 py-3.5 text-sm font-bold text-teal backdrop-blur-sm transition hover:bg-teal/25 active:scale-[0.98]"
              >
                ✦ Enter the 3D Realm — Beta
              </button>
              <button
                type="button"
                onClick={onExit}
                className="rounded-xl px-5 py-3 text-sm font-semibold text-sky underline underline-offset-4 transition hover:text-white active:scale-[0.98]"
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
              {Array.from({ length: hud.maxHealth }, (_, i) => {
                const fill = Math.max(0, Math.min(1, hud.health - i));
                return (
                  <span key={i} className="relative inline-block">
                    <span className="text-white/25">{HEART}</span>
                    {fill > 0 ? (
                      <span
                        className="absolute inset-y-0 left-0 overflow-hidden text-[#ff6b7a]"
                        style={{ width: `${fill * 100}%` }}
                      >
                        {HEART}
                      </span>
                    ) : null}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-teal" style={{ width: `${hud.stamina}%` }} />
            </div>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">
              {hud.night ? "🌙" : "☀️"} {hud.clock}
            </p>
            <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-gold"
                style={{ width: `${Math.round(hud.dashProgress * 100)}%` }}
              />
            </div>
            {hud.shield?.owned ? (
              <p
                className={`mt-1.5 text-[10px] font-bold uppercase tracking-[0.15em] ${
                  hud.shield.ready ? "text-gold" : "text-white/40"
                }`}
              >
                Aegis {hud.shield.ready ? "ready" : "resting"}
              </p>
            ) : null}
          </div>

          {/* objective tracker — top centre */}
          <div className="max-w-[28%] rounded-md border border-gold/40 bg-[rgba(11,30,61,0.78)] px-1.5 py-1 text-center backdrop-blur">
            <p className="text-[6px] uppercase tracking-[0.16em] text-gold">
              {hud.act} · {hud.zoneTitle}
            </p>
            <p className="mt-0.5 text-[8px] leading-snug text-white/95">{hud.objective}</p>
            <p className="mt-0.5 text-[7px] text-sky">
              Relics {hud.relics.length}/5 · Letters {hud.envelopes.length}/5 · Keys {hud.keys}/3
            </p>
            <button
              type="button"
              onClick={() => {
                buzz();
                emit(EV.ping);
              }}
              className="pointer-events-auto mt-1 w-full rounded-md border border-gold/60 bg-gold/20 px-1 py-0.5 text-[6px] font-bold uppercase tracking-[0.12em] text-gold"
            >
              📡 Ping objective
            </button>
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
              onClick={() => {
                buzz();
                setShowArmory(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-[rgba(11,30,61,0.78)] text-sm text-white backdrop-blur"
              aria-label="Open the armory"
              title="Armory"
            >
              ⚔️
            </button>
            <button
              type="button"
              onClick={() => {
                buzz();
                setShowBag(true);
              }}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/30 bg-[rgba(11,30,61,0.78)] text-sm text-white backdrop-blur"
              aria-label="Open the backpack"
              title="Backpack"
            >
              🎒
              {Object.values(hud.inventory ?? {}).reduce((a, b) => a + b, 0) > 0 ? (
                <span className="absolute -right-1 -top-1 rounded-full bg-gold px-1 text-[9px] font-bold text-navy">
                  {Object.values(hud.inventory ?? {}).reduce((a, b) => a + b, 0)}
                </span>
              ) : null}
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

      {/* boss health bar */}
      {hud?.boss ? (
        <div className="pointer-events-none absolute inset-x-0 top-28 z-20 flex justify-center px-6">
          <div className="w-full max-w-sm rounded-xl border border-[#ff6b7a]/50 bg-[rgba(11,30,61,0.8)] px-4 py-2 backdrop-blur">
            <p className="text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff9aa5]">
              {hud.boss.name}
            </p>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full bg-gradient-to-r from-[#ff6b7a] to-[#ffd977] transition-all duration-200"
                style={{ width: `${Math.round((hud.boss.hp / hud.boss.max) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* weapon belt */}
      {hud && hud.weapons.length > 0 ? (
        <div className="pointer-events-auto absolute bottom-44 right-4 z-20 flex flex-col gap-1.5">
          {hud.weapons.map((id) => {
            const w = WEAPON_BY_ID[id];
            if (!w) return null;
            const on = hud.equipped === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  buzz();
                  emit(EV.equip, id);
                }}
                title={w.name}
                aria-label={`Equip ${w.name}`}
                className={`flex h-10 w-10 items-center justify-center rounded-xl border text-lg backdrop-blur ${
                  on
                    ? "border-gold bg-gold/30 shadow-[0_0_12px_rgba(201,162,75,0.6)]"
                    : "border-white/25 bg-[rgba(11,30,61,0.7)]"
                }`}
              >
                {w.icon}
              </button>
            );
          })}
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
              className="flex h-16 w-16 flex-col items-center justify-center rounded-full bg-[#d61f2c] text-[11px] font-bold text-white shadow-lg"
            >
              <span className="text-base leading-none">{equippedWeapon?.icon ?? "🗡️"}</span>
              ATTACK
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div
            className="quest-letter relative w-full max-w-lg overflow-hidden rounded-[20px] border border-[#d9c49a] p-6 shadow-2xl sm:p-8"
            style={{
              background:
                "radial-gradient(120% 90% at 20% 0%, #fffaf0 0%, #f7ecd6 55%, #efdfc2 100%)",
            }}
          >
            <div
              className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-[0.15em] text-white shadow-md"
              style={{ background: ENVELOPE_THEMES[envelope.id]?.seal ?? "#b8912f" }}
            >
              A&amp;M
            </div>
            <p className="text-center font-serif-italic text-3xl italic text-[#7a5a1e]">
              {ENVELOPE_THEMES[envelope.id]?.word ?? "Letter"}
            </p>
            <p className="mt-1 text-center text-[10px] uppercase tracking-[0.3em] text-[#a8905f]">
              {envelope.title}
            </p>
            <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#c9a94f] to-transparent" />
            <p className="max-h-[46vh] overflow-y-auto whitespace-pre-line font-serif-italic text-[15px] leading-7 text-[#3a3020]">
              {envelope.letter}
            </p>
            <div className="my-4 h-px w-full bg-gradient-to-r from-transparent via-[#c9a94f] to-transparent" />
            <button
              type="button"
              onClick={closeModal}
              className="mx-auto block rounded-full bg-[#2c3350] px-8 py-2.5 text-sm font-semibold text-[#f7ecd6] transition hover:bg-[#3a4368] active:scale-95"
            >
              Continue
            </button>
          </div>
        </div>
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
        <GuestDialogue
          key={modal.line}
          id="andrew"
          name="Andrew"
          role="Your fiancé"
          lines={[
            modal.line,
            ANDREW_AFFIRMATIONS[Math.floor(Math.random() * ANDREW_AFFIRMATIONS.length)] ?? "",
          ].filter(Boolean)}
          onClose={closeModal}
        />
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

      {modal?.type === "weapon" ? (
        <GlassPanel title={modal.speaker} onClose={closeModal}>
          <MariaPortrait caption="Maria receives a gift" />
          <p className="font-serif-italic italic">“{modal.line}”</p>
          {(() => {
            const w = WEAPON_BY_ID[modal.weaponId];
            if (!w) return null;
            return (
              <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-center">
                <p className="text-3xl leading-none">{w.icon}</p>
                <p className="mt-2 font-display text-lg font-bold text-navy">{w.name}</p>
                <p className="mt-1 text-xs text-navy/70">{w.blurb}</p>
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-gold">
                  Power {w.damage} · Reach {w.reach}
                </p>
              </div>
            );
          })()}
        </GlassPanel>
      ) : null}

      {modal?.type === "directions" ? (
        <GlassPanel title={modal.title} onClose={closeModal}>
          <ul className="space-y-2 text-left">
            {modal.lines.map((line) => (
              <li
                key={line}
                className="rounded-xl border border-gold/30 bg-white/70 p-3 text-sm text-navy"
              >
                {line}
              </li>
            ))}
          </ul>
        </GlassPanel>
      ) : null}

      {modal?.type === "guidetalk" ? (
        <GuideTalk
          key={modal.name}
          name={modal.name}
          pages={modal.pages}
          {...(modal.weaponId ? { weaponId: modal.weaponId } : {})}
          line={modal.line}
          onClose={closeModal}
        />
      ) : null}

      {modal?.type === "guest" ? (
        <GuestDialogue
          key={modal.name}
          id={modal.id}
          name={modal.name}
          {...(modal.role ? { role: modal.role } : {})}
          lines={modal.lines}
          onClose={closeModal}
        />
      ) : null}

      {modal?.type === "companion" ? (
        <GlassPanel
          title={modal.name}
          {...(modal.owned ? { onClose: closeModal } : {})}
        >
          <p className="text-navy/85">{modal.body}</p>
          {modal.owned ? null : (
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  buzz();
                  setModal(null);
                  emit(EV.companion, "yes");
                  emit(EV.resume);
                }}
                className="rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
              >
                Yes — come with me, Max!
              </button>
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  emit(EV.companion, "no");
                  emit(EV.resume);
                }}
                className="rounded-xl border border-gold/40 bg-white/80 px-4 py-3 text-sm font-medium text-navy"
              >
                Not right now
              </button>
            </div>
          )}
        </GlassPanel>
      ) : null}

      {modal?.type === "boss" ? (
        <BossDialogue
          name={modal.name}
          role={modal.role}
          art={modal.art}
          demon={modal.demon}
          mariaLine={modal.mariaLine}
          slides={modal.slides.length ? modal.slides : [{ boss: modal.intro, replies: [] }]}
          onDone={(flavor) => {
            setModal(null);
            emit(EV.bosschoice, flavor);
          }}
        />
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

      {showBag ? (
        <GlassPanel title="Backpack" onClose={() => setShowBag(false)}>
          <p className="text-xs text-navy/70">
            Everything you've gathered. Tap an item to eat it, or use the Eat buttons below — raw
            meat can be cooked right here, any time.
          </p>
          <div className="mt-3">
            <ItemGrid
              items={hud?.inventory ?? {}}
              onPick={(id) => {
                buzz();
                emit(EV.item, { action: "eat", id });
              }}
            />
          </div>
          <div className="mt-3 space-y-2">
            {FOOD_ITEMS.filter((f) => !f.raw && (hud?.inventory?.[f.id] ?? 0) > 0).map((f) => (
              <button
                key={`eat-${f.id}`}
                type="button"
                onClick={() => {
                  buzz();
                  emit(EV.item, { action: "eat", id: f.id });
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-rose-gold/50 bg-white/80 p-3 text-left"
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="flex-1 text-sm font-bold text-navy">
                  Eat {f.name} ({hud?.inventory?.[f.id] ?? 0})
                </span>
                <span className="text-[11px] font-semibold text-navy/70">
                  +{f.heal} {HEART}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {FOOD_ITEMS.filter((f) => f.cookedId && (hud?.inventory?.[f.id] ?? 0) > 0).map((f) => (
              <button
                key={`cook-${f.id}`}
                type="button"
                onClick={() => {
                  buzz();
                  emit(EV.item, { action: "cook", id: f.id });
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-gold/50 bg-white/80 p-3 text-left"
              >
                <span className="text-2xl">{f.icon}</span>
                <span className="flex-1 text-sm font-bold text-navy">
                  Cook {f.name} ({hud?.inventory?.[f.id] ?? 0})
                </span>
                <span className="text-lg">🔥</span>
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1">
            {FOOD_ITEMS.map((f) => (
              <p key={f.id} className="text-[11px] text-navy/70">
                <span className="mr-1">{f.icon}</span>
                <span className="font-semibold text-navy">{f.name}</span> — {f.blurb}
              </p>
            ))}
          </div>
        </GlassPanel>
      ) : null}

      {modal?.type === "chest" ? (
        <GlassPanel title="Home Chest" onClose={closeModal} wide>
          <p className="text-xs text-navy/70">
            Drag an item across to move it — or just tap it.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                Backpack
              </p>
              <ItemGrid
                items={modal.inventory}
                slots={10}
                dragGroup="bag"
                onDropIn={(id) => {
                  buzz();
                  emit(EV.item, { action: "take", id });
                }}
                onPick={(id) => {
                  buzz();
                  emit(EV.item, { action: "stash", id });
                }}
              />
            </div>
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                Chest
              </p>
              <ItemGrid
                items={modal.chest}
                slots={10}
                dragGroup="chest"
                onDropIn={(id) => {
                  buzz();
                  emit(EV.item, { action: "stash", id });
                }}
                onPick={(id) => {
                  buzz();
                  emit(EV.item, { action: "take", id });
                }}
              />
            </div>
          </div>
        </GlassPanel>
      ) : null}

      {modal?.type === "hearth" ? (
        <GlassPanel title="The Hearth" onClose={closeModal}>
          <p className="text-xs text-navy/70">
            The fire is warm. Cooked meat restores two hearts — you can also cook straight from
            your backpack anywhere.
          </p>
          <div className="mt-3 space-y-2">
            {FOOD_ITEMS.filter((f) => f.cookedId && (modal.inventory[f.id] ?? 0) > 0).map((f) => {
              const have = modal.inventory[f.id] ?? 0;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={have <= 0}
                  onClick={() => {
                    buzz();
                    emit(EV.item, { action: "cook", id: f.id });
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${
                    have > 0 ? "border-gold/50 bg-white/80" : "border-navy/15 bg-white/40 opacity-60"
                  }`}
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="flex-1">
                    <span className="block text-sm font-bold text-navy">
                      Cook {f.name} ({have})
                    </span>
                    <span className="block text-[11px] text-navy/70">
                      Becomes {FOOD_BY_ID[f.cookedId!]?.name}.
                    </span>
                  </span>
                  <span className="text-lg">🔥</span>
                </button>
              );
            })}
          </div>
        </GlassPanel>
      ) : null}

      {modal?.type === "bed" ? (
        <GlassPanel title="Your Bed" onClose={closeModal}>
          <p className="text-sm text-navy/80">
            Soft quilts, quiet windows. Sleeping restores every heart and carries you through to
            morning.
          </p>
          <button
            type="button"
            onClick={() => {
              buzz(40);
              emit(EV.item, { action: "sleep" });
              closeModal();
            }}
            className="mt-4 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
          >
            😴 Sleep until morning
          </button>
        </GlassPanel>
      ) : null}

      {showArmory ? (
        <GlassPanel title="Armory" onClose={() => setShowArmory(false)} wide>
          <p className="text-xs text-navy/70">
            Every weapon in the realm. Gold ones are yours — tap to equip.
          </p>
          <div className="mt-2 grid gap-2">
            {WEAPONS.map((w) => {
              const owned = hud?.weapons.includes(w.id) ?? false;
              const on = hud?.equipped === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  disabled={!owned}
                  onClick={() => {
                    buzz();
                    emit(EV.equip, w.id);
                    setShowArmory(false);
                  }}
                  className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                    on
                      ? "border-gold bg-gold/25"
                      : owned
                        ? "border-gold/40 bg-white/80 hover:bg-gold/10"
                        : "border-navy/15 bg-white/40 opacity-70"
                  }`}
                >
                  <span className="text-2xl leading-none">{w.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-display text-sm font-bold text-navy">{w.name}</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                        {on ? "Equipped" : owned ? "Owned" : "Not found yet"}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[11px] font-semibold text-navy/70">
                      Power {w.damage} · Reach {w.reach}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-navy/75">
                      {w.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
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
        <GlassPanel title="Realm Map" onClose={() => setShowMap(false)} compact>
          {mapSnap ? (
            <>
              <LiveMapCanvas snap={mapSnap} />
              <p className="text-center text-xs text-navy/70">
                Rose marker: you. Gold marker: this act&apos;s landmark. White markers: relics,
                guides and portals.
              </p>
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
            {ceremony.phase === "script"
              ? (() => {
                  const beat = CEREMONY_SCRIPT[ceremony.i]!;
                  const advance = () =>
                    setCeremony(
                      ceremony.i + 1 < CEREMONY_SCRIPT.length
                        ? { phase: "script", i: ceremony.i + 1 }
                        : { phase: "proposal", i: ceremony.i },
                    );
                  if ("choices" in beat && !ceremony.reply) {
                    return (
                      <>
                        <h3 className="font-display text-xl font-bold text-navy">Maria</h3>
                        <div className="mt-4 space-y-2 text-left">
                          {beat.choices.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() =>
                                setCeremony({ phase: "script", i: ceremony.i, reply: c.andrew })
                              }
                              className="w-full rounded-xl border border-navy/20 bg-white px-4 py-3 text-sm font-medium text-navy"
                            >
                              {c.player}
                            </button>
                          ))}
                        </div>
                      </>
                    );
                  }
                  const speaker = "choices" in beat ? "Andrew" : beat.speaker;
                  const text = "choices" in beat ? ceremony.reply! : beat.text;
                  return (
                    <>
                      <h3 className="font-display text-xl font-bold text-navy">{speaker}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-navy/85">{text}</p>
                      <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-gold">
                        {ceremony.i + 1} / {CEREMONY_SCRIPT.length}
                      </p>
                      <button
                        type="button"
                        onClick={advance}
                        className="mt-4 w-full rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white"
                      >
                        Continue
                      </button>
                    </>
                  );
                })()
              : null}

            {ceremony.phase === "proposal" ? (
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
                    setCeremony({ phase: "finale", i: 0 });
                  }}
                  className="mt-6 w-full rounded-xl bg-gold px-4 py-3 text-sm font-bold text-navy"
                >
                  Yes — forever
                </button>
              </>
            ) : null}

            {ceremony.phase === "finale" ? (

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
