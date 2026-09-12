// Presentation-only polish for the Cathedral ceremony. No quest/save/progression changes.

const STYLE_ID = "quest-cathedral-ceremony-polish";
const ROOT_CLASS = "quest-cathedral-ceremony";
const CARD_CLASS = "quest-cathedral-ceremony-card";

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    .${ROOT_CLASS} {
      background:
        radial-gradient(circle at 50% 34%, rgba(255,225,155,.18), transparent 31%),
        radial-gradient(circle at 50% 72%, rgba(236,164,184,.12), transparent 42%),
        rgba(3,7,18,.88) !important;
      backdrop-filter: blur(7px) saturate(.82) !important;
      animation: cathedral-ceremony-veil 900ms ease-out both;
    }
    .${ROOT_CLASS}::before,
    .${ROOT_CLASS}::after {
      content: "";
      position: absolute;
      pointer-events: none;
      inset: 0;
    }
    .${ROOT_CLASS}::before {
      opacity: .62;
      background-image:
        radial-gradient(circle, rgba(255,241,194,.92) 0 1px, transparent 1.7px),
        radial-gradient(circle, rgba(255,211,224,.68) 0 1px, transparent 1.6px);
      background-size: 83px 83px, 127px 127px;
      background-position: 12px 20px, 52px 68px;
      animation: cathedral-ceremony-stars 12s linear infinite;
    }
    .${ROOT_CLASS}::after {
      background: linear-gradient(90deg, transparent, rgba(255,226,154,.055) 50%, transparent);
      transform: translateX(-100%);
      animation: cathedral-ceremony-ray 7s ease-in-out infinite;
    }
    .${CARD_CLASS} {
      position: relative !important;
      isolation: isolate !important;
      overflow: hidden !important;
      border: 1px solid rgba(245,214,137,.78) !important;
      border-radius: 28px !important;
      background:
        radial-gradient(circle at 50% -20%, rgba(255,224,150,.20), transparent 48%),
        linear-gradient(155deg, rgba(14,20,39,.965), rgba(7,11,25,.975) 58%, rgba(29,16,31,.965)) !important;
      color: #fff8e9 !important;
      box-shadow:
        0 0 0 1px rgba(255,248,219,.08),
        0 0 60px rgba(222,177,78,.22),
        0 32px 100px rgba(0,0,0,.62),
        inset 0 1px rgba(255,255,255,.08) !important;
      animation: cathedral-ceremony-card 720ms cubic-bezier(.2,.8,.2,1) both;
    }
    .${CARD_CLASS}::before {
      content: "A  ·  M";
      display: block;
      margin: 0 auto 18px;
      width: fit-content;
      padding: 6px 14px;
      border: 1px solid rgba(238,203,119,.45);
      border-radius: 999px;
      color: #f7dda0;
      background: rgba(255,240,194,.055);
      font-family: Georgia, serif;
      font-size: 11px;
      letter-spacing: .42em;
      text-indent: .42em;
      box-shadow: 0 0 24px rgba(231,187,86,.12);
    }
    .${CARD_CLASS} h3 {
      color: #f5d98e !important;
      font-family: Georgia, serif !important;
      font-size: clamp(1.45rem, 4vw, 2rem) !important;
      letter-spacing: .025em !important;
      text-shadow: 0 0 22px rgba(235,190,88,.25) !important;
    }
    .${CARD_CLASS} p { color: rgba(255,248,232,.88) !important; }
    .${CARD_CLASS} p.mt-3,
    .${CARD_CLASS} > p.mt-4:not([class*="uppercase"]) {
      font-family: Georgia, serif !important;
      font-style: italic !important;
      font-size: 1rem !important;
      line-height: 1.9 !important;
      color: #fff8e9 !important;
    }
    .${CARD_CLASS} p[class*="uppercase"] { color: rgba(241,207,125,.72) !important; }
    .${CARD_CLASS} button {
      border: 1px solid rgba(239,204,119,.56) !important;
      background: linear-gradient(180deg, rgba(215,176,82,.95), rgba(154,113,38,.96)) !important;
      color: #fff9e9 !important;
      border-radius: 14px !important;
      box-shadow: 0 8px 26px rgba(121,82,25,.28), inset 0 1px rgba(255,255,255,.22) !important;
      transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease !important;
    }
    .${CARD_CLASS} button:hover { filter: brightness(1.08); box-shadow: 0 10px 34px rgba(190,145,54,.34) !important; }
    .${CARD_CLASS} button:active { transform: scale(.985); }
    .${CARD_CLASS} img {
      border: 1px solid rgba(244,214,143,.62) !important;
      box-shadow: 0 18px 50px rgba(0,0,0,.38), 0 0 30px rgba(225,180,84,.14) !important;
    }
    @keyframes cathedral-ceremony-veil { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cathedral-ceremony-card { from { opacity: 0; transform: translateY(16px) scale(.975); } to { opacity: 1; transform: none; } }
    @keyframes cathedral-ceremony-stars { from { background-position: 12px 20px,52px 68px; } to { background-position: 12px -63px,52px -59px; } }
    @keyframes cathedral-ceremony-ray { 0%,58% { transform: translateX(-110%); opacity:0; } 72% { opacity:.7; } 88%,100% { transform: translateX(110%); opacity:0; } }
  `;
  document.head.appendChild(style);
}

let audio: AudioContext | null = null;
let stopMusic: (() => void) | null = null;

function startWeddingMusic() {
  if (stopMusic) return;
  try {
    const AC = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    audio = ctx;
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.setValueAtTime(.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(.027, ctx.currentTime + 2.2);
    master.connect(ctx.destination);
    const warmth = ctx.createBiquadFilter();
    warmth.type = "lowpass";
    warmth.frequency.value = 2100;
    warmth.Q.value = .35;
    warmth.connect(master);
    const hz = (semi: number) => 261.63 * Math.pow(2, semi / 12);
    // Slow 6/8-like wedding processional: C - G - Am - F, with bell-like upper vows.
    const chords = [[0,4,7],[7,11,14],[9,12,16],[5,9,12]];
    const melody = [12,16,19,16,14,12, 11,14,19,14,12,11, 12,16,21,19,16,12, 9,12,17,16,14,12];
    let step = 0;
    let next = ctx.currentTime + .18;
    const voice = (freq:number, at:number, dur:number, gain:number, type:OscillatorType="sine") => {
      const o=ctx.createOscillator(); const g=ctx.createGain();
      o.type=type; o.frequency.setValueAtTime(freq,at);
      g.gain.setValueAtTime(.0001,at); g.gain.linearRampToValueAtTime(gain,at+.07); g.gain.exponentialRampToValueAtTime(.0001,at+dur);
      o.connect(g).connect(warmth); o.start(at); o.stop(at+dur+.08);
    };
    const schedule=()=>{
      const horizon=ctx.currentTime+1.5;
      while(next<horizon){
        const m=melody[step%melody.length]!;
        voice(hz(m),next,2.25,.13,"sine");
        voice(hz(m+12),next+.035,1.35,.025,"triangle");
        if(step%6===0){
          const chord=chords[Math.floor(step/6)%chords.length]!;
          chord.forEach((n,i)=>voice(hz(n-12),next+i*.055,4.5,.045-i*.006,"sine"));
          voice(hz(chord[0]!-24),next,4.8,.055,"sine");
        }
        next += .72;
        step++;
      }
    };
    schedule();
    const timer=window.setInterval(schedule,420);
    const wake=()=>void ctx.resume();
    window.addEventListener("pointerdown",wake,{passive:true});
    window.addEventListener("keydown",wake);
    stopMusic=()=>{
      window.clearInterval(timer);
      window.removeEventListener("pointerdown",wake);
      window.removeEventListener("keydown",wake);
      try { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(Math.max(master.gain.value,.0001),ctx.currentTime); master.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.9); } catch {}
      window.setTimeout(()=>{ try { void ctx.close(); } catch {} },1000);
      stopMusic=null; audio=null;
    };
  } catch {}
}

function markCeremony() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>("div.absolute.inset-0.z-50"));
  const overlay = overlays.find((el) => {
    const text = el.textContent ?? "";
    return text.includes("Continue") || text.includes("Yes — forever") || text.includes("Realm of the Golden Ring");
  });
  if (!overlay) {
    if (stopMusic) stopMusic();
    return;
  }
  overlay.classList.add(ROOT_CLASS);
  const card = overlay.firstElementChild as HTMLElement | null;
  card?.classList.add(CARD_CLASS);
  startWeddingMusic();
}

if (typeof window !== "undefined") {
  installStyles();
  const observer = new MutationObserver(markCeremony);
  const boot = () => {
    if (!document.body) return;
    observer.observe(document.body,{childList:true,subtree:true,characterData:true});
    markCeremony();
  };
  if (document.body) boot(); else window.addEventListener("DOMContentLoaded",boot,{once:true});
  window.addEventListener("pagehide",()=>{ stopMusic?.(); observer.disconnect(); },{once:true});
}
