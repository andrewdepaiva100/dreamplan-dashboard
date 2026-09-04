import { useRef, useState } from "react";
import { Sparkles, X } from "lucide-react";
import type { MutableRefObject } from "react";
import type { InputState } from "./shared";

function Joystick({ input }: { input: MutableRefObject<InputState> }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef<number | null>(null);

  const update = (clientX: number, clientY: number) => {
    const el = zoneRef.current;
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
    input.current.x = dx;
    input.current.z = dy;
    input.current.sprint = len > 0.92;
    setKnob({ x: dx * 34, y: dy * 34 });
  };

  const end = () => {
    active.current = null;
    input.current.x = 0;
    input.current.z = 0;
    input.current.sprint = false;
    setKnob({ x: 0, y: 0 });
  };

  return (
    <div
      ref={zoneRef}
      className="pointer-events-auto absolute bottom-6 left-6 h-32 w-32 touch-none rounded-full border border-white/25 bg-[rgba(11,30,61,0.35)] backdrop-blur-sm"
      style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
      onPointerDown={(e) => {
        active.current = e.pointerId;
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        update(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => active.current === e.pointerId && update(e.clientX, e.clientY)}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/50 bg-[rgba(233,185,73,0.35)] shadow"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  );
}

export function HUD3D({
  input,
  onExit,
  banner,
}: {
  input: MutableRefObject<InputState>;
  onExit: () => void;
  banner: string | null;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {/* top bar */}
      <div
        className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        <div className="rounded-xl bg-[rgba(11,30,61,0.72)] px-3 py-2 text-white backdrop-blur">
          <div className="text-lg leading-none tracking-widest text-[#ff6b7a]">♥♥♥♥♥</div>
          <p className="mt-1.5 max-w-[180px] text-[11px] leading-snug text-white/80">
            Explore the Sunlit Meadow — reach the golden arch
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full border border-gold/50 bg-[rgba(11,30,61,0.72)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-gold backdrop-blur">
            3D Beta
          </span>
          <button
            type="button"
            onClick={onExit}
            className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[rgba(11,30,61,0.72)] text-white backdrop-blur transition hover:bg-[rgba(11,30,61,0.9)]"
            aria-label="Exit 3D realm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* act banner */}
      {banner ? (
        <div className="absolute inset-x-0 top-1/3 flex justify-center">
          <div className="rounded-2xl border border-gold/40 bg-[rgba(11,30,61,0.8)] px-8 py-4 text-center backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">Act I</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{banner}</p>
          </div>
        </div>
      ) : null}

      <Joystick input={input} />

      {/* attack button */}
      <button
        type="button"
        className="pointer-events-auto absolute right-6 h-16 w-16 touch-none rounded-full border border-gold/60 bg-[rgba(233,185,73,0.35)] text-gold backdrop-blur-sm transition active:scale-95"
        style={{ bottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        onPointerDown={() => {
          input.current.attack += 1;
        }}
        aria-label="Cast"
      >
        <Sparkles className="mx-auto h-7 w-7" />
      </button>
    </div>
  );
}
