// Presentation-only polish for the Cathedral ceremony. No quest/save/progression changes.
// The selectors below target the actual ceremony DOM directly so the vows render
// beautifully even if MutationObserver timing differs between browsers.

const STYLE_ID = "quest-cathedral-ceremony-polish";
const ROOT_CLASS = "quest-cathedral-ceremony";
const CARD_CLASS = "quest-cathedral-ceremony-card";
const OVERLAY_SELECTOR = "div.absolute.inset-0.z-50.flex.items-center.justify-center";
const CARD_SELECTOR = `${OVERLAY_SELECTOR} > div.w-full.max-w-lg`;

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    /* Direct selectors are intentional: this is the real Cathedral vows popup. */
    ${OVERLAY_SELECTOR},
    .${ROOT_CLASS} {
      position: absolute !important;
      overflow: hidden !important;
      background:
        radial-gradient(circle at 50% 30%, rgba(255,226,157,.20), transparent 31%),
        radial-gradient(circle at 20% 78%, rgba(229,153,181,.10), transparent 36%),
        radial-gradient(circle at 80% 76%, rgba(255,216,139,.09), transparent 34%),
        rgba(3,7,18,.91) !important;
      backdrop-filter: blur(9px) saturate(.84) !important;
      animation: cathedral-ceremony-veil 700ms ease-out both;
    }

    ${OVERLAY_SELECTOR}::before,
    ${OVERLAY_SELECTOR}::after,
    .${ROOT_CLASS}::before,
    .${ROOT_CLASS}::after {
      content: "";
      position: absolute;
      pointer-events: none;
      inset: 0;
      z-index: 0;
    }

    ${OVERLAY_SELECTOR}::before,
    .${ROOT_CLASS}::before {
      opacity: .64;
      background-image:
        radial-gradient(circle, rgba(255,242,199,.95) 0 1px, transparent 1.65px),
        radial-gradient(circle, rgba(255,214,227,.65) 0 1px, transparent 1.55px),
        radial-gradient(circle, rgba(255,255,255,.38) 0 .8px, transparent 1.4px);
      background-size: 83px 83px, 127px 127px, 173px 173px;
      background-position: 12px 20px, 52px 68px, 91px 34px;
      animation: cathedral-ceremony-stars 15s linear infinite;
    }

    ${OVERLAY_SELECTOR}::after,
    .${ROOT_CLASS}::after {
      background:
        linear-gradient(102deg, transparent 31%, rgba(255,231,173,.045) 47%, rgba(255,244,210,.12) 50%, rgba(255,231,173,.045) 53%, transparent 69%);
      transform: translateX(-120%);
      animation: cathedral-ceremony-ray 8s ease-in-out infinite;
    }

    ${CARD_SELECTOR},
    .${CARD_CLASS} {
      position: relative !important;
      z-index: 2 !important;
      isolation: isolate !important;
      overflow: hidden !important;
      border: 1px solid rgba(246,216,143,.82) !important;
      border-radius: 30px !important;
      padding: clamp(22px, 4vw, 34px) !important;
      background:
        radial-gradient(circle at 50% -18%, rgba(255,225,153,.23), transparent 46%),
        radial-gradient(circle at 15% 110%, rgba(218,127,161,.10), transparent 40%),
        linear-gradient(155deg, rgba(15,21,40,.975), rgba(7,11,25,.985) 57%, rgba(29,16,31,.975)) !important;
      color: #fff8e9 !important;
      box-shadow:
        0 0 0 1px rgba(255,248,219,.075),
        0 0 78px rgba(222,177,78,.25),
        0 34px 110px rgba(0,0,0,.68),
        inset 0 1px rgba(255,255,255,.09),
        inset 0 -30px 80px rgba(72,42,78,.08) !important;
      animation: cathedral-ceremony-card 620ms cubic-bezier(.2,.8,.2,1) both;
    }

    ${CARD_SELECTOR}::before,
    .${CARD_CLASS}::before {
      content: "A  ·  M";
      display: block;
      margin: 0 auto 17px;
      width: fit-content;
      padding: 6px 15px;
      border: 1px solid rgba(238,203,119,.48);
      border-radius: 999px;
      color: #f8dea0;
      background: rgba(255,240,194,.055);
      font-family: Georgia, serif;
      font-size: 10px;
      letter-spacing: .42em;
      text-indent: .42em;
      box-shadow: 0 0 26px rgba(231,187,86,.14);
    }

    ${CARD_SELECTOR}::after,
    .${CARD_CLASS}::after {
      content: "";
      pointer-events: none;
      position: absolute;
      inset: 9px;
      border: 1px solid rgba(255,238,194,.09);
      border-radius: 23px;
      box-shadow: inset 0 0 34px rgba(255,219,142,.035);
      z-index: -1;
    }

    ${CARD_SELECTOR} h3,
    .${CARD_CLASS} h3 {
      margin-top: 0 !important;
      color: #f5d98e !important;
      font-family: Georgia, serif !important;
      font-size: clamp(1.55rem, 4.2vw, 2.15rem) !important;
      font-weight: 700 !important;
      letter-spacing: .025em !important;
      text-shadow: 0 0 24px rgba(235,190,88,.28) !important;
      animation: cathedral-vow-speaker 420ms ease-out both;
    }

    ${CARD_SELECTOR}[data-vow-speaker="Maria"] h3,
    .${CARD_CLASS}[data-vow-speaker="Maria"] h3 {
      color: #f3c5d2 !important;
      text-shadow: 0 0 24px rgba(231,151,180,.26) !important;
    }

    ${CARD_SELECTOR}[data-vow-speaker="Pastor Alcir"] h3,
    .${CARD_CLASS}[data-vow-speaker="Pastor Alcir"] h3 {
      color: #ead9b0 !important;
    }

    ${CARD_SELECTOR} p,
    .${CARD_CLASS} p {
      color: rgba(255,248,232,.91) !important;
    }

    ${CARD_SELECTOR} p.mt-3,
    ${CARD_SELECTOR} > p.mt-4:not([class*="uppercase"]),
    .${CARD_CLASS} p.mt-3,
    .${CARD_CLASS} > p.mt-4:not([class*="uppercase"]) {
      margin-top: 14px !important;
      font-family: Georgia, serif !important;
      font-style: italic !important;
      font-size: clamp(.98rem, 2.5vw, 1.08rem) !important;
      line-height: 1.9 !important;
      color: #fff9ec !important;
      text-wrap: pretty;
      animation: cathedral-vow-copy 500ms ease-out both;
    }

    ${CARD_SELECTOR} p[class*="uppercase"],
    .${CARD_CLASS} p[class*="uppercase"] {
      color: rgba(241,207,125,.72) !important;
      letter-spacing: .25em !important;
    }

    ${CARD_SELECTOR} button,
    .${CARD_CLASS} button {
      border: 1px solid rgba(239,204,119,.58) !important;
      background: linear-gradient(180deg, rgba(211,171,78,.97), rgba(145,104,34,.98)) !important;
      color: #fffaf0 !important;
      border-radius: 15px !important;
      box-shadow: 0 8px 28px rgba(121,82,25,.29), inset 0 1px rgba(255,255,255,.23) !important;
      transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease !important;
    }

    ${CARD_SELECTOR} button:hover,
    .${CARD_CLASS} button:hover {
      filter: brightness(1.09);
      box-shadow: 0 11px 38px rgba(190,145,54,.36), inset 0 1px rgba(255,255,255,.25) !important;
    }
    ${CARD_SELECTOR} button:active,
    .${CARD_CLASS} button:active { transform: scale(.985); }

    /* Choice buttons should read like handwritten responses, not generic UI. */
    ${CARD_SELECTOR} .space-y-2 button,
    .${CARD_CLASS} .space-y-2 button {
      background: linear-gradient(135deg, rgba(255,249,233,.08), rgba(238,195,214,.065)) !important;
      color: #fff8e9 !important;
      text-align: left !important;
      font-family: Georgia, serif !important;
      font-style: italic !important;
      line-height: 1.6 !important;
    }

    ${CARD_SELECTOR} img,
    .${CARD_CLASS} img {
      border: 1px solid rgba(244,214,143,.65) !important;
      box-shadow: 0 18px 52px rgba(0,0,0,.42), 0 0 34px rgba(225,180,84,.15) !important;
    }

    @keyframes cathedral-ceremony-veil {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes cathedral-ceremony-card {
      from { opacity: 0; transform: translateY(17px) scale(.972); }
      to { opacity: 1; transform: none; }
    }
    @keyframes cathedral-vow-speaker {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes cathedral-vow-copy {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: none; }
    }
    @keyframes cathedral-ceremony-stars {
      from { background-position: 12px 20px,52px 68px,91px 34px; }
      to { background-position: 12px -63px,52px -59px,91px -139px; }
    }
    @keyframes cathedral-ceremony-ray {
      0%,58% { transform: translateX(-120%); opacity:0; }
      72% { opacity:.76; }
      88%,100% { transform: translateX(120%); opacity:0; }
    }

    @media (max-width: 640px) {
      ${CARD_SELECTOR}, .${CARD_CLASS} {
        max-height: calc(100dvh - 28px) !important;
        border-radius: 24px !important;
      }
      ${CARD_SELECTOR} p.mt-3,
      .${CARD_CLASS} p.mt-3 { line-height: 1.72 !important; }
    }
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
    // Slow 6/8 wedding processional: C - G - Am - F, with bell-like upper notes.
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
      try {
        master.gain.cancelScheduledValues(ctx.currentTime);
        master.gain.setValueAtTime(Math.max(master.gain.value,.0001),ctx.currentTime);
        master.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+.9);
      } catch {}
      window.setTimeout(()=>{ try { void ctx.close(); } catch {} },1000);
      stopMusic=null;
      audio=null;
    };
  } catch {}
}

function markCeremony() {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>(OVERLAY_SELECTOR));
  const overlay = overlays.find((el) => {
    const text = el.textContent ?? "";
    return (
      text.includes("Continue") ||
      text.includes("Yes — forever") ||
      text.includes("Realm of the Golden Ring") ||
      text.includes("Pastor Alcir") ||
      text.includes("Andrew") ||
      text.includes("Maria")
    );
  });

  if (!overlay) {
    if (stopMusic) stopMusic();
    return;
  }

  overlay.classList.add(ROOT_CLASS);
  const card = overlay.firstElementChild as HTMLElement | null;
  if (card) {
    card.classList.add(CARD_CLASS);
    const speaker = card.querySelector("h3")?.textContent?.trim();
    if (speaker) card.dataset.vowSpeaker = speaker;
  }
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
  if (document.body) boot();
  else window.addEventListener("DOMContentLoaded",boot,{once:true});
  window.addEventListener("pagehide",()=>{ stopMusic?.(); observer.disconnect(); },{once:true});
}
