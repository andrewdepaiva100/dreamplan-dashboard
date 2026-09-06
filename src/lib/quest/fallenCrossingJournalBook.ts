import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const JOURNAL_KIND = "fallen-crossing-journal";
const SILAS_STORAGE_KEY = "marias-quest-silas-v1";

function hasMetSilas() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SILAS_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function closeJournal(scene: SceneLike, overlay: HTMLElement) {
  overlay.remove();
  scene.__fallenCrossingBookOpen = false;
  scene.frozen = false;
  scene.physics?.resume?.();
}

function makeDiv(className: string, html = "") {
  const el = document.createElement("div");
  el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

function showBook(scene: SceneLike) {
  if (typeof document === "undefined" || scene.__fallenCrossingBookOpen) return;
  const parent = scene.game?.canvas?.parentElement;
  if (!parent) return;

  scene.__fallenCrossingBookOpen = true;
  scene.frozen = true;
  scene.player?.setVelocity?.(0, 0);
  scene.physics?.pause?.();

  const overlay = makeDiv("fc-book-overlay");
  const book = makeDiv("fc-book");
  const left = makeDiv("fc-page fc-left");
  const right = makeDiv("fc-page fc-right");
  const spine = makeDiv("fc-spine");

  const close = document.createElement("button");
  close.type = "button";
  close.className = "fc-book-close";
  close.setAttribute("aria-label", "Close journal");
  close.textContent = "×";
  close.addEventListener("click", () => closeJournal(scene, overlay));

  const continueButton = document.createElement("button");
  continueButton.type = "button";
  continueButton.className = "fc-book-continue";
  continueButton.innerHTML = "<span>✦</span> Continue <span>✦</span>";
  continueButton.addEventListener("click", () => closeJournal(scene, overlay));

  left.innerHTML = `
    <div class="fc-page-grain"></div>
    <div class="fc-kicker">TRAVELER'S JOURNAL</div>
    <h2>Shrine of the Fallen Crossing</h2>
    <div class="fc-rule"><span>◇</span></div>
    <p class="fc-script fc-lead">Three of us crossed together. Three of us came back.</p>
    <p class="fc-script">The Warden's weight hits farther than it looks — when he rises, move <strong>before the ground answers.</strong></p>
    <p class="fc-script">If someone finds this before trying the bridge, find us southeast at <strong>The Last Crossing.</strong></p>
    <p class="fc-script">There are things we know now that we wish we knew then.</p>
    <div class="fc-signature">— Elara, Pip, Maeve</div>
    <div class="fc-margin-note">Three of us.<br/>Always.</div>
    <div class="fc-pressed-flower">✿<span>❀</span></div>
    <div class="fc-compass"><b>✦</b><small>N</small></div>
    <div class="fc-maria-note">${hasMetSilas() ? "Maria: “The Last Crossing… Silas was talking about them.”" : "Maria: “Someone wanted this place to be found.”"}</div>
  `;

  right.innerHTML = `
    <div class="fc-page-grain"></div>
    <div class="fc-sketch fc-warden-sketch">
      <div class="fc-warden-body"></div>
      <div class="fc-warden-head"></div>
      <div class="fc-warden-arm fc-arm-left"></div>
      <div class="fc-warden-arm fc-arm-right"></div>
      <div class="fc-ground-line"></div>
      <div class="fc-bridge-sketch">╱╲╱╲╱╲</div>
    </div>
    <div class="fc-warning">When he rises…<br/>the ground answers.<br/><strong>Move early.</strong></div>
    <div class="fc-map-title">Road sketch — southeast</div>
    <div class="fc-map">
      <div class="fc-river"></div>
      <div class="fc-road"></div>
      <div class="fc-map-bridge">▰</div>
      <div class="fc-map-shrine">✝</div>
      <div class="fc-map-crossing">✦</div>
      <div class="fc-dotted-path">• · • · • · • · •</div>
      <div class="fc-arrow">↘</div>
      <div class="fc-crossing-label">The Last Crossing<br/><small>(southeast)</small></div>
      <div class="fc-rose">✥</div>
    </div>
    <div class="fc-flowers-note"><span>✿</span><span>❀</span><span>✿</span><em>Three paths. One light.</em></div>
    <div class="fc-butterfly-note">⌁ <span>still with us,<br/>somehow.</span></div>
  `;

  book.append(left, spine, right, close, continueButton);
  overlay.append(book);
  parent.append(overlay);

  const style = document.createElement("style");
  style.textContent = `
    .fc-book-overlay{position:absolute;inset:0;z-index:10080;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(3,12,18,.78);backdrop-filter:blur(7px);box-sizing:border-box;animation:fcFade .22s ease-out}
    .fc-book{position:relative;display:grid;grid-template-columns:1fr 18px 1fr;width:min(1120px,96vw);height:min(690px,90vh);border-radius:24px;background:linear-gradient(90deg,#3b251b,#6a3f28 3%,#291a15 50%,#6a3f28 97%,#3b251b);padding:20px 22px 72px;box-sizing:border-box;box-shadow:0 28px 80px rgba(0,0,0,.68),0 0 0 2px #8d6436,0 0 0 6px #2d1c14;animation:fcOpen .34s cubic-bezier(.2,.8,.2,1);overflow:hidden}
    .fc-book:before,.fc-book:after{content:"";position:absolute;top:9px;bottom:62px;width:12px;border-radius:9px;background:linear-gradient(#7c452c,#3b2118,#845034);box-shadow:inset 0 0 0 2px rgba(255,208,126,.18)}
    .fc-book:before{left:8px}.fc-book:after{right:8px}
    .fc-page{position:relative;overflow:hidden;padding:38px 48px 42px;color:#34261a;background:radial-gradient(140% 110% at 48% 32%,#f6e5bd 0%,#e9cf9b 59%,#caa873 100%);box-shadow:inset 0 0 45px rgba(86,53,26,.26);font-family:Georgia,"Times New Roman",serif;box-sizing:border-box}
    .fc-left{border-radius:16px 4px 8px 18px;clip-path:polygon(1% 1%,99% 0,100% 98%,2% 100%,0 80%,1% 55%,0 32%)}
    .fc-right{border-radius:4px 16px 18px 8px;clip-path:polygon(0 0,99% 1%,100% 30%,99% 54%,100% 81%,98% 100%,0 98%)}
    .fc-page-grain{position:absolute;inset:0;pointer-events:none;opacity:.35;background-image:radial-gradient(circle at 20% 30%,rgba(87,55,28,.12) 0 1px,transparent 1px),radial-gradient(circle at 70% 60%,rgba(87,55,28,.1) 0 1px,transparent 1px);background-size:19px 23px,27px 31px;mix-blend-mode:multiply}
    .fc-spine{background:linear-gradient(90deg,rgba(63,40,25,.2),rgba(55,31,20,.78),rgba(255,236,189,.18),rgba(55,31,20,.78),rgba(63,40,25,.2));box-shadow:0 0 18px rgba(47,26,16,.42)}
    .fc-kicker{position:relative;font-size:11px;font-weight:800;letter-spacing:.28em;color:#815f34;text-align:center}
    .fc-page h2{position:relative;margin:10px 0 5px;text-align:center;font-size:clamp(24px,2.4vw,38px);line-height:1.05;color:#2b2119;font-weight:700}
    .fc-rule{position:relative;display:flex;align-items:center;gap:8px;margin:12px 0 23px;color:#765733}.fc-rule:before,.fc-rule:after{content:"";height:1px;flex:1;background:linear-gradient(90deg,transparent,#765733,transparent)}
    .fc-script{position:relative;margin:0 0 17px;font-size:clamp(16px,1.5vw,22px);line-height:1.52;font-style:italic;letter-spacing:.01em}.fc-lead{font-size:clamp(18px,1.65vw,24px)}
    .fc-script strong{font-weight:700;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px}
    .fc-signature{position:relative;margin-top:24px;font-size:19px;font-style:italic;transform:rotate(-1deg)}
    .fc-margin-note{position:absolute;right:22px;top:78px;font-size:15px;line-height:1.35;font-style:italic;transform:rotate(5deg);color:#5d4630}
    .fc-maria-note{position:absolute;left:48px;right:40px;bottom:34px;font-size:16px;font-style:italic;color:#5b4633;transform:rotate(-1deg);border-top:1px solid rgba(93,70,48,.35);padding-top:11px}
    .fc-pressed-flower{position:absolute;left:12px;bottom:78px;font-size:40px;color:#d9c07c;transform:rotate(-19deg);filter:sepia(.5)}.fc-pressed-flower span{display:block;margin-left:18px;margin-top:-11px;font-size:29px}
    .fc-compass{position:absolute;left:14px;bottom:18px;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#233241;color:#e2b95f;border:5px solid #8a6332;box-shadow:0 4px 10px rgba(0,0,0,.35)}.fc-compass b{font-size:34px}.fc-compass small{position:absolute;top:4px;color:#f0dba4;font-size:9px}
    .fc-sketch{position:absolute;left:45px;right:42px;top:36px;height:220px;border-bottom:1px solid rgba(75,56,37,.35);opacity:.76}.fc-warden-body{position:absolute;left:52%;top:36px;width:76px;height:100px;background:rgba(55,47,40,.5);clip-path:polygon(35% 0,70% 3%,100% 45%,75% 100%,24% 100%,0 48%);transform:translateX(-50%) rotate(-2deg)}.fc-warden-head{position:absolute;left:52%;top:12px;width:52px;height:48px;border-radius:45% 45% 40% 40%;background:rgba(50,43,37,.58);transform:translateX(-50%)}.fc-warden-arm{position:absolute;top:70px;width:80px;height:25px;background:rgba(55,47,40,.48)}.fc-arm-left{left:calc(52% - 100px);transform:rotate(-22deg)}.fc-arm-right{left:calc(52% + 20px);transform:rotate(22deg)}.fc-ground-line{position:absolute;left:8%;right:8%;bottom:30px;height:2px;background:rgba(68,50,34,.48);box-shadow:0 -10px 0 rgba(68,50,34,.08),0 9px 0 rgba(68,50,34,.12)}.fc-bridge-sketch{position:absolute;left:16%;right:16%;bottom:35px;text-align:center;color:#584531;font-size:30px;letter-spacing:5px}
    .fc-warning{position:absolute;right:34px;top:38px;width:150px;font-size:16px;line-height:1.35;font-style:italic;text-align:right;transform:rotate(4deg);color:#503b29}.fc-warning strong{text-decoration:underline}
    .fc-map-title{position:absolute;left:44px;top:282px;font-size:11px;font-weight:800;letter-spacing:.2em;color:#80623d;text-transform:uppercase}
    .fc-map{position:absolute;left:42px;right:44px;top:310px;bottom:100px;border:1px solid rgba(92,68,42,.16);border-radius:44% 48% 42% 46%;transform:rotate(-1deg);background:radial-gradient(ellipse at center,rgba(102,78,49,.05),transparent 70%)}.fc-river{position:absolute;left:28%;top:4%;width:12%;height:86%;border-left:9px double rgba(76,91,95,.45);border-radius:50%;transform:rotate(8deg)}.fc-road{position:absolute;left:22%;top:58%;width:58%;height:4px;background:repeating-linear-gradient(90deg,rgba(78,58,39,.55) 0 8px,transparent 8px 13px);transform:rotate(-14deg)}.fc-map-bridge{position:absolute;left:29%;top:43%;font-size:28px;color:#5b4632;transform:rotate(6deg)}.fc-map-shrine{position:absolute;left:17%;top:64%;font-size:25px;color:#5c4631}.fc-map-crossing{position:absolute;right:17%;top:35%;width:40px;height:40px;border:2px solid #6b4c2d;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#6b4c2d;font-size:24px}.fc-dotted-path{position:absolute;left:37%;top:47%;color:#634b34;font-size:18px;transform:rotate(-16deg)}.fc-arrow{position:absolute;right:23%;top:19%;font-size:55px;color:#5a4028;transform:rotate(9deg)}.fc-crossing-label{position:absolute;right:2%;top:6%;font-size:17px;font-style:italic;transform:rotate(3deg)}.fc-crossing-label small{font-size:13px}.fc-rose{position:absolute;left:52%;bottom:3%;font-size:48px;color:rgba(91,66,39,.46)}
    .fc-flowers-note{position:absolute;left:52px;bottom:32px;display:flex;align-items:center;gap:18px;color:#6b5135}.fc-flowers-note span{font-size:28px}.fc-flowers-note em{font-size:14px;margin-left:2px}.fc-butterfly-note{position:absolute;right:32px;bottom:24px;font-size:35px;color:#6c5136;transform:rotate(4deg)}.fc-butterfly-note span{display:inline-block;font-size:12px;font-style:italic;line-height:1.2;margin-left:5px}
    .fc-book-close{position:absolute;right:10px;top:8px;z-index:5;width:48px;height:48px;border-radius:50%;border:2px solid #b98b4c;background:#4b2e20;color:#f2d59b;font:700 30px/1 Georgia,serif;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.4)}
    .fc-book-continue{position:absolute;left:50%;bottom:11px;transform:translateX(-50%);z-index:6;min-width:360px;height:54px;border-radius:14px;border:2px solid #9d783f;background:linear-gradient(#17243a,#0e1829);color:#f0dfb9;font:700 18px Georgia,serif;letter-spacing:.03em;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45),inset 0 0 0 1px rgba(244,208,137,.17)}.fc-book-continue span{color:#d4ad61;margin:0 22px}
    @keyframes fcFade{from{opacity:0}to{opacity:1}}@keyframes fcOpen{from{opacity:0;transform:scale(.92) rotateX(5deg)}to{opacity:1;transform:scale(1) rotateX(0)}}
    @media (max-width:760px){.fc-book-overlay{padding:8px;align-items:flex-end}.fc-book{grid-template-columns:1fr;width:100%;height:94vh;padding:12px 12px 68px;overflow-y:auto;border-radius:20px}.fc-spine{display:none}.fc-page{min-height:640px;padding:28px 28px 40px}.fc-left,.fc-right{clip-path:none;border-radius:10px}.fc-right{margin-top:8px;min-height:620px}.fc-book-close{position:fixed;right:16px;top:16px}.fc-book-continue{position:fixed;bottom:12px;min-width:0;width:calc(100% - 44px)}.fc-margin-note{display:none}.fc-maria-note{left:28px;right:28px}.fc-warning{right:26px}.fc-script{font-size:17px}}
    @media (prefers-reduced-motion:reduce){.fc-book-overlay,.fc-book{animation:none}}
  `;
  overlay.append(style);
}

export function installFallenCrossingJournalBook(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__fallenCrossingJournalBookInstalled) return;
  proto.__fallenCrossingJournalBookInstalled = true;

  const originalInteract = proto.interact;
  proto.interact = function fallenCrossingJournalBookInteract(this: SceneLike, ...args: any[]) {
    if (this.frozen) return;
    const it = this.nearest?.();
    if (it?.kind === JOURNAL_KIND) {
      showBook(this);
      return;
    }
    return originalInteract.apply(this, args);
  };
}
