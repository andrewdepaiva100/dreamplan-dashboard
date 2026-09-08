// @ts-nocheck -- Narrow runtime decorator for the Phaser quest scene.

import evelynPortrait from "../../assets/quest/portrait-evelyn.svg";

const ZONE = "wedding_garden";
const KEEPER_KIND = "garden-keeper";
const LETTER_KIND = "garden-keeper-letter";
const KEEPER_X = 70;
const KEEPER_Y = 56;
const GUIDE_X = 62;
const GUIDE_Y = 34;
const SMITH_X = 70;
const SMITH_Y = 38;
const GUEST_X = 76;
const GUEST_Y = 76;

const KEEPER_LINES = [
  "Welcome to the Wedding Garden, Maria. Long before the Conservatory was sealed, this realm was kept in balance by four Seasonal Keys — Spring to begin, Summer to flourish, Autumn to release, and Winter to rest. Something broke that rhythm. The seasons pulled apart, the garden's creatures turned restless, and the Grand Conservatory locked itself behind their silence. Your path through Act II is to explore the four corners of the garden, recover each Seasonal Key, and bring their cycle back into harmony. Every key you restore will change this place. When all four seasons are breathing together again, return to me before you enter the Conservatory.",
  "Spring has returned, and you can already see what one restored season does. New growth is answering the paths, but the garden is still uneven. Three Seasonal Keys remain. As you travel farther from the fountain, watch the beds and the creatures around them — each part of the garden has been shaped by the season that became stranded there. Restore the remaining keys, then the Conservatory will begin to recognize the whole cycle again.",
  "Two seasons are breathing together now. That is the heart of this realm, Maria: not choosing one beautiful season and holding it forever, but allowing each one to make room for the next. The Grand Conservatory was built to preserve that balance. With half the keys restored, its old magic is waking, but its doors will not truly answer until all four seasons are home.",
  "Three seasons have returned. Only one Seasonal Key remains between this fractured garden and a complete cycle. When you restore it, the Conservatory should finally hear the garden again. Come back to me before you enter. There is something beneath the flowering arch that belongs to this part of your journey — something the garden protected while everything else was changing.",
  "All four Seasonal Keys are home. Spring can begin, Summer can flourish, Autumn can release, and Winter can rest. The garden is whole enough for the Grand Conservatory to open its heart again. Before you cross that threshold, read what has been waiting beneath the roses. It is the final piece of what Act II was trying to show you: love does not survive by freezing one perfect moment. It survives by choosing each other through every season that follows.",
];

type KeeperReply = { maria: string; evelyn: string };
const KEEPER_REPLIES: KeeperReply[][] = [
  [
    { maria: "What happened here?", evelyn: "The four seasons once moved through this realm like one long breath. Then the cycle fractured. Each season clung to its own corner, the Seasonal Keys scattered with them, and the garden began repeating pieces of itself instead of changing. That is why some paths feel too wild, some beds refuse to wake, and the creatures here have become unsettled." },
    { maria: "What exactly are the Seasonal Keys?", evelyn: "They are anchors for the garden's cycle. Spring carries renewal, Summer carries abundance, Autumn carries release, and Winter carries rest. They are not ordinary keys for four ordinary locks. Returning them teaches the entire realm how to move forward again. You may recover them in whatever order the garden allows." },
    { maria: "What's inside the Grand Conservatory?", evelyn: "It is the heart of the Wedding Garden — glass and white iron built around a place where all four seasons could exist in harmony. When the cycle broke, the Conservatory sealed itself rather than preserve a false, frozen version of the garden. Restore all four keys and its doors can wake safely." },
    { maria: "Where should I start?", evelyn: "Explore outward from this fountain and look for the four seasonal corners. Each holds one key. You do not need to solve them in a perfect order. Recover a key, notice how the garden responds, and keep moving. When your count reaches four of four, come back to me before entering the Conservatory." },
  ],
  [
    { maria: "Why did Spring change so much?", evelyn: "Because the keys affect more than the place where you find them. Each restored season rejoins the shared cycle. Spring can finally send new life beyond its own corner instead of endlessly trying to begin there." },
    { maria: "What should I watch for next?", evelyn: "The farther corners of the garden. The remaining seasons have been isolated longer, and their imbalance may be more obvious in the paths, flowers, and creatures around them. Three keys remain; each one should make the whole realm feel a little more connected." },
    { maria: "And the Conservatory is still sealed?", evelyn: "Yes. One season is a promise, not a cycle. The Conservatory needs all four voices before it can trust that the garden is truly moving again." },
  ],
  [
    { maria: "Why does balance matter more than one perfect season?", evelyn: "Because perfection that cannot change becomes a cage. Spring must become Summer. Summer must eventually yield to Autumn. Winter must be allowed to rest before anything can begin again. The garden is teaching the same truth this journey keeps placing before you." },
    { maria: "What is the Conservatory protecting?", evelyn: "A memory of the garden as it was meant to be — not frozen, but whole. There is something more personal waiting there too, but I will not steal that discovery from you. Two more keys will make the way clear." },
    { maria: "So I'm halfway through Act II?", evelyn: "Through its seasonal restoration, yes. Two keys are home and two remain. Keep exploring, let the garden change around you, and return here once the fourth has answered." },
  ],
  [
    { maria: "What happens when I restore the last key?", evelyn: "The four seasons will finally recognize one another again. The garden should bloom as a complete cycle, the flowering arch here will reveal what it has protected, and the Grand Conservatory will be ready for you." },
    { maria: "What is waiting under the arch?", evelyn: "A small message that survived the fracture. I kept it where no single season could claim it. Bring the last season home, and the roses will show you." },
    { maria: "Then I'm finishing this.", evelyn: "Good. Just remember what this act has asked of you: you are not defeating a season. You are returning it to relationship with the others. Let the last one come home gently." },
  ],
  [
    { maria: "We restored the whole garden.", evelyn: "You restored its ability to change. That is more important. The Conservatory can open because Spring, Summer, Autumn, and Winter are no longer fighting to be the only season that matters." },
    { maria: "What was Act II trying to tell me?", evelyn: "That lasting love is not one endless spring day. There will be beginnings, abundance, change, and quiet seasons. The promise is not that nothing changes. The promise is that you keep choosing one another as it does." },
    { maria: "I'm ready for the Conservatory.", evelyn: "Then read the letter beneath the roses first. After that, follow the restored garden to the Grand Conservatory. You have earned whatever it has been waiting to show you." },
  ],
];

function removeActTwoDog(scene: any) {
  for (const it of [...(scene.interactables ?? [])]) {
    if (it?.kind !== "dog") continue;
    it.enabled = false;
    it.obj?.destroy?.();
    scene.interactables = scene.interactables.filter((entry: any) => entry !== it);
  }
  const offer = scene.zoneState?.["dogOffer"];
  if (offer) {
    offer.enabled = false;
    offer.obj?.destroy?.();
    scene.zoneState["dogOffer"] = undefined;
  }
  if (scene.dog) {
    scene.dog.destroy?.();
    scene.dog = null;
  }
}

function ensureKeeperTextures(scene: any) {
  if (!scene.textures.exists("evelyn-keeper")) {
    const tex = scene.textures.createCanvas("evelyn-keeper", 24, 35);
    const c = tex.getContext();
    c.imageSmoothingEnabled = false;
    const p = (x:number,y:number,w:number,h:number,color:string) => { c.fillStyle=color;c.fillRect(x,y,w,h); };
    p(6,32,12,2,"#26352c"); p(7,29,4,4,"#49372c"); p(14,29,4,4,"#49372c");
    p(5,15,14,15,"#263d34"); p(4,18,3,9,"#263d34"); p(18,18,3,9,"#263d34");
    p(6,16,12,13,"#648567"); p(5,19,3,7,"#789a76"); p(17,19,3,7,"#526f59");
    p(9,17,6,12,"#e4d8b8"); p(10,18,4,10,"#f1e6c9"); p(11,18,2,10,"#b99148");
    p(4,24,3,3,"#c99070"); p(18,24,3,3,"#c99070"); p(5,24,2,2,"#e0aa86"); p(18,24,2,2,"#e0aa86");
    p(5,4,14,11,"#3c4650"); p(4,7,3,8,"#4e5961"); p(18,7,3,8,"#313b43");
    p(7,2,10,4,"#68737a"); p(5,5,3,5,"#7c878b"); p(16,4,3,5,"#59646a"); p(8,3,4,2,"#929b9c");
    p(7,7,10,8,"#d7a17e"); p(8,8,8,7,"#e6b18d"); p(8,9,2,2,"#f0c09d");
    p(9,10,2,2,"#27323a"); p(14,10,2,2,"#27323a"); p(10,14,5,1,"#9b6257");
    p(6,6,3,8,"#667177"); p(16,6,3,8,"#4d585f"); p(17,5,2,2,"#d8b45d"); p(18,4,1,1,"#f1d77d");
    p(6,17,2,10,"#87a982"); p(16,18,1,9,"#425e4d"); p(7,28,4,1,"#496451"); p(14,28,3,1,"#496451");
    tex.refresh();
  }

  if (!scene.textures.exists("keeper-nook")) {
    const tex = scene.textures.createCanvas("keeper-nook", 112, 76);
    const c = tex.getContext();
    c.imageSmoothingEnabled = false;
    const p=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    p(8,61,92,4,"rgba(38,55,39,.24)"); p(16,65,72,2,"rgba(38,55,39,.16)");
    p(8,9,4,48,"#49372d"); p(10,8,4,49,"#76543b"); p(79,9,4,48,"#49372d"); p(77,8,4,49,"#76543b");
    p(10,7,71,4,"#49372d"); p(13,5,65,4,"#8a6443");
    const leaves=[[9,8],[16,5],[25,6],[35,4],[46,5],[58,4],[69,6],[78,9],[8,18],[79,20],[11,31],[77,32]];
    for (const [x,y] of leaves){p(x,y,5,4,"#365c42");p(x+2,y-2,4,4,"#557b51");}
    const roses=[[18,6],[38,5],[61,5],[78,14],[10,25]];
    for(const [x,y] of roses){p(x,y,4,4,"#9e3f58");p(x+1,y-1,3,3,"#d36b7f");p(x+2,y,1,1,"#f3a0ad");}
    p(18,34,66,5,"#4b3529"); p(16,30,70,5,"#76513a"); p(18,28,66,3,"#9a6b48");
    p(19,39,5,27,"#4b3529"); p(78,39,5,27,"#4b3529"); p(22,45,58,4,"#654631"); p(24,48,54,3,"#8a6040");
    p(20,31,62,1,"#c08a5b"); p(27,33,1,2,"#3e2c25"); p(59,33,1,2,"#3e2c25");
    const pots=[[23,22],[38,24],[70,21]];
    for(const [x,y] of pots){p(x,y,10,3,"#7e4637");p(x+1,y+3,8,7,"#a85d45");p(x+2,y+3,2,5,"#d0835d");p(x+2,y+10,6,2,"#704035");}
    p(51,23,7,7,"#d9c48a"); p(52,24,5,2,"#668354"); p(59,26,9,5,"#c9d2b5"); p(60,27,7,1,"#eef0d6");
    p(45,33,10,2,"#c8c9b4"); p(48,31,2,5,"#8c9b8b"); p(55,30,2,2,"#d6b459");
    p(30,51,15,8,"#607d78"); p(27,53,5,3,"#789690"); p(43,49,3,8,"#435e5b"); p(32,49,8,2,"#91aaa0");
    p(55,52,16,9,"#8a633e"); p(57,54,12,6,"#b28350"); p(58,51,10,2,"#d0a66b"); p(59,53,2,6,"#755238"); p(65,53,2,6,"#755238");
    p(89,29,3,28,"#4b382c"); p(84,25,17,11,"#76563b"); p(86,27,13,7,"#b38a59");
    p(88,29,2,2,"#75a66b"); p(92,29,2,2,"#e0b55c"); p(96,29,2,2,"#c8754c"); p(92,32,2,1,"#c9e0e4");
    p(95,47,3,13,"#31383b"); p(92,43,9,7,"#3a4142"); p(94,44,5,5,"#f3ce70"); p(95,45,3,3,"#fff0a8"); p(93,42,7,2,"#252c2e");
    tex.refresh();
  }
}

function addKeeperStation(scene: any) {
  ensureKeeperTextures(scene);
  const x = scene.wx(KEEPER_X);
  const y = scene.wy(KEEPER_Y);
  // Keep the same detailed art, but make the nook a compact keeper station
  // rather than a second house-sized landmark beside Maria's arrival.
  const nook = scene.add.image(x - 58, y + 5, "keeper-nook").setScale(1.04).setDepth(5);
  nook.setOrigin(0.5, 0.5);
  const keeper = scene.addInteractable(x, y, "evelyn-keeper", KEEPER_KIND, "Talk", { id: "evelyn", radius: 92, depth: 9 });
  keeper?.obj?.clearTint?.();
  keeper?.obj?.setScale?.(1.75);
  if (keeper?.obj) scene.tweens.add({ targets: keeper.obj, y: keeper.obj.y - 1, duration: 1850, yoyo: true, repeat: -1 });
  const stones:any[] = [];
  for (const [dx,dy,w] of [[-2,39,15],[-15,46,13],[-28,52,12]]) {
    const s = scene.add.ellipse(x + dx, y + dy, w, 7, 0xd9d2b7, 0.88).setDepth(3);
    s.setStrokeStyle?.(1,0xa79e82,0.7); stones.push(s);
  }
  const glow = scene.add.circle(x - 18, y + 4, 14, 0xffdc82, 0.08).setDepth(4);
  scene.tweens.add({ targets: glow, alpha: { from: 0.04, to: 0.13 }, scale: { from: 0.9, to: 1.08 }, duration: 1700, yoyo: true, repeat: -1 });
  scene.__act2KeeperArt = { x, y, glow, nook, stones, stage: -1, seasonal: [] };
  refreshKeeperGarden(scene, true);
}

function clearSeasonalArt(scene: any) {
  const art = scene.__act2KeeperArt;
  if (!art) return;
  for (const obj of art.seasonal ?? []) obj?.destroy?.();
  art.seasonal = [];
}

function refreshKeeperGarden(scene: any, force = false) {
  if (scene.save?.current_zone !== ZONE) return;
  const art = scene.__act2KeeperArt;
  if (!art) return;
  const n = Math.max(0, Math.min(4, Number(scene.zoneState?.["keysFound"] ?? 0)));
  if (!force && art.stage === n) return;
  art.stage = n;
  clearSeasonalArt(scene);
  const made:any[] = [];
  const { x, y } = art;
  const flower=(dx:number,dy:number,tint:number,scale=.48)=>{const f=scene.add.sprite(x+dx,y+dy,"flowers").setTint(tint).setScale(scale).setDepth(5);made.push(f);return f;};
  if (n >= 1) for (const [dx,dy] of [[-104,40],[-87,51],[-62,56],[-41,53]]) flower(dx,dy,0xb9f28f,.42);
  if (n >= 2) {
    art.glow?.setFillStyle?.(0xffd66f,.22);
    for (const [dx,dy] of [[-88,-21],[-56,-29],[-25,-18]]) {
      const light=scene.add.circle(x+dx,y+dy,3,0xffd66f,.68).setDepth(7); made.push(light);
      scene.tweens.add({targets:light,alpha:{from:.3,to:.85},duration:1250,yoyo:true,repeat:-1});
    }
  }
  if (n >= 3) {
    for (let i=0;i<6;i++) {
      const leaf=scene.add.ellipse(x-99+i*16,y-37+(i%3)*9,5,2.5,i%2?0xd98b43:0xe7b95f,.65).setDepth(7); made.push(leaf);
      scene.tweens.add({targets:leaf,y:leaf.y+20,x:leaf.x+8,alpha:.08,duration:2300+i*120,repeat:-1,delay:i*170});
    }
  }
  if (n >= 4) {
    const ax=x+62, ay=y-9;
    const left=scene.add.sprite(ax,ay,"flowers").setTint(0xf2a5bd).setScale(.62).setDepth(6);
    const right=scene.add.sprite(ax+38,ay,"flowers").setTint(0xf2a5bd).setScale(.62).setDepth(6);
    const top=scene.add.sprite(ax+19,ay-27,"flowers").setTint(0xf2a5bd).setScale(.7).setDepth(6);
    made.push(left,right,top);
    if (!scene.__act2KeeperLetterAdded) {
      scene.__act2KeeperLetterAdded = true;
      const letter=scene.addInteractable(ax+19,ay+24,"envelope",LETTER_KIND,"Read the letter for Maria",{id:"four-seasons",radius:72,depth:8});
      if(letter?.obj){letter.obj.setTint?.(0xffe5a8);scene.tweens.add({targets:letter.obj,y:letter.obj.y-3,duration:1200,yoyo:true,repeat:-1});}
      scene.spawnSparkle?.(ax+19,ay+12,0xffd978,20);
      scene.emitToast?.("The four seasons answer together. A flowering arch opens beside Evelyn.");
    }
  }
  art.seasonal = made;
}

function showEvelynDialogue(scene:any,line:string,replies:KeeperReply[]) {
  document.getElementById("quest-evelyn-dialogue")?.remove();
  const overlay=document.createElement("div");
  overlay.id="quest-evelyn-dialogue";
  overlay.style.cssText="position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(6,10,24,.64);backdrop-filter:blur(3px);font-family:inherit";
  overlay.innerHTML=`<div style="position:relative;width:min(900px,96vw);display:flex;align-items:flex-end;gap:14px"><button data-close aria-label="Skip dialogue" style="position:absolute;right:2px;top:-42px;z-index:3;width:36px;height:36px;border-radius:999px;border:1px solid rgba(240,210,125,.75);background:rgba(10,16,34,.96);color:#efd477;font-weight:800;cursor:pointer">✕</button><img src="${evelynPortrait}" alt="Evelyn" style="width:min(240px,28vw);aspect-ratio:1;object-fit:cover;border-radius:18px;border:2px solid #d7b65e;box-shadow:0 18px 50px rgba(0,0,0,.48),0 0 30px rgba(215,182,94,.18)"/><div data-panel style="position:relative;flex:1;min-height:220px;text-align:left;overflow:hidden;border-radius:20px;border:2px solid rgba(215,182,94,.82);background:rgba(10,16,34,.97);box-shadow:0 20px 55px rgba(0,0,0,.48);padding:22px 24px;color:white"><div style="position:absolute;inset:0;background:linear-gradient(135deg,rgba(215,182,94,.12),transparent 48%,rgba(145,170,120,.11));pointer-events:none"></div><div style="position:relative"><div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap"><strong data-speaker style="font-family:Georgia,serif;font-size:23px;color:#efd477">Evelyn</strong><span data-role style="font-size:10px;color:rgba(255,255,255,.58);letter-spacing:.18em;text-transform:uppercase">Keeper of the Four Seasons</span></div><p data-text style="min-height:74px;margin:13px 0 0;font-family:Georgia,serif;font-style:italic;font-size:16px;line-height:1.65;color:rgba(255,255,255,.96)"></p><div data-choices style="display:none;gap:8px;flex-direction:column;margin-top:12px"></div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px"><span style="display:flex;gap:6px"><i style="width:20px;height:4px;border-radius:9px;background:#d7b65e"></i><i style="width:20px;height:4px;border-radius:9px;background:rgba(255,255,255,.18)"></i><i style="width:20px;height:4px;border-radius:9px;background:rgba(255,255,255,.18)"></i></span><button data-next style="display:none;border:1px solid rgba(215,182,94,.7);border-radius:999px;background:rgba(215,182,94,.12);color:#efd477;padding:8px 13px;font-size:10px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;cursor:pointer">Continue</button><span data-hint style="font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#efd477">…</span></div></div></div></div>`;
  if(window.matchMedia("(max-width: 640px)").matches){const wrap=overlay.firstElementChild as HTMLElement;wrap.style.alignItems="stretch";const img=overlay.querySelector("img") as HTMLElement;img.style.width="78px";img.style.height="78px";img.style.position="absolute";img.style.left="16px";img.style.top="16px";img.style.zIndex="3";const panel=overlay.querySelector("[data-panel]") as HTMLElement;panel.style.padding="20px 16px 18px 108px";panel.style.minHeight="290px";}
  document.body.appendChild(overlay);
  const text=overlay.querySelector("[data-text]") as HTMLElement;
  const hint=overlay.querySelector("[data-hint]") as HTMLElement;
  const speaker=overlay.querySelector("[data-speaker]") as HTMLElement;
  const role=overlay.querySelector("[data-role]") as HTMLElement;
  const choices=overlay.querySelector("[data-choices]") as HTMLElement;
  const next=overlay.querySelector("[data-next]") as HTMLButtonElement;
  let timer=0; let finished=false; let picked:KeeperReply|null=null;
  const stop=()=>{if(timer)window.clearInterval(timer);timer=0;};
  const type=(value:string,onDone:()=>void)=>{stop();finished=false;text.textContent="";let i=0;timer=window.setInterval(()=>{i+=2;text.textContent=`“${value.slice(0,i)}${i>=value.length?"”":""}`;if(i>=value.length){stop();finished=true;onDone();}},18);};
  const close=()=>{stop();overlay.remove();scene.scene?.resume?.();};
  const showChoices=()=>{hint.style.display="none";choices.style.display="flex";choices.innerHTML="";for(const reply of replies){const b=document.createElement("button");b.textContent=reply.maria;b.style.cssText="text-align:left;border:1px solid rgba(215,182,94,.5);border-radius:12px;background:rgba(255,255,255,.05);color:#fff;padding:10px 12px;font-family:Georgia,serif;font-size:14px;cursor:pointer";b.addEventListener("click",()=>{picked=reply;choices.style.display="none";speaker.textContent="Maria";role.textContent="Your reply";text.textContent=`“${reply.maria}”`;next.style.display="inline-block";});choices.appendChild(b);}};
  next.addEventListener("click",()=>{if(!picked)return;next.style.display="none";speaker.textContent="Evelyn";role.textContent="Keeper of the Four Seasons";type(picked.evelyn,()=>{hint.style.display="inline";hint.textContent="Tap to close";});});
  overlay.querySelector("[data-close]")?.addEventListener("click",close);
  const panel=overlay.querySelector("[data-panel]") as HTMLElement;
  panel.addEventListener("click",(ev)=>{if((ev.target as HTMLElement).closest("button"))return;if(!finished){stop();text.textContent=`“${line}”`;finished=true;showChoices();}else if(picked&&next.style.display==="none"&&choices.style.display==="none")close();});
  type(line,showChoices);
  scene.scene?.pause?.();
}

function showGardenLetter(scene:any){
  document.getElementById("quest-garden-letter")?.remove();
  const overlay=document.createElement("div");
  overlay.id="quest-garden-letter";
  overlay.style.cssText="position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;padding:22px;background:rgba(8,18,28,.56);backdrop-filter:blur(5px);font-family:Georgia,'Times New Roman',serif";
  overlay.innerHTML=`<div data-card style="position:relative;width:min(980px,96vw);min-height:430px;overflow:hidden;border-radius:30px;border:2px solid #d0ad65;background:linear-gradient(145deg,#fffaf0 0%,#f7edda 58%,#f1e2c6 100%);box-shadow:0 32px 90px rgba(4,15,24,.48),inset 0 0 0 5px rgba(255,255,255,.6);color:#11284a"><div style="position:absolute;inset:12px;border:1px solid rgba(183,139,66,.42);border-radius:22px;pointer-events:none"></div><div style="position:absolute;left:18px;top:14px;color:#b78b42;font-size:25px">❀</div><div style="position:absolute;right:18px;top:14px;color:#b78b42;font-size:25px">❀</div><div style="position:absolute;left:18px;bottom:14px;color:#b78b42;font-size:25px">❀</div><div style="position:absolute;right:18px;bottom:14px;color:#b78b42;font-size:25px">❀</div><button data-close aria-label="Close" style="position:absolute;right:26px;top:24px;z-index:4;width:48px;height:48px;border-radius:999px;border:1px solid rgba(17,40,74,.24);background:rgba(255,255,255,.74);color:#193252;font-size:25px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(17,40,74,.12)">×</button><div data-layout style="position:relative;display:grid;grid-template-columns:minmax(210px,30%) 1fr;gap:28px;align-items:end;min-height:430px;padding:34px 52px 34px 34px"><div data-portrait-wrap style="align-self:stretch;display:flex;align-items:flex-end;justify-content:center;position:relative"><div style="position:absolute;inset:26px 10px 8px;border-radius:50% 50% 24px 24px;background:radial-gradient(circle at 50% 34%,rgba(255,233,174,.72),rgba(206,230,195,.24) 52%,transparent 73%)"></div><img src="${evelynPortrait}" alt="Evelyn" style="position:relative;width:100%;max-width:260px;aspect-ratio:1;object-fit:cover;border-radius:26px;border:2px solid rgba(183,139,66,.72);box-shadow:0 18px 35px rgba(59,72,48,.2)"/></div><div style="align-self:center;padding:10px 0 4px"><div style="color:#af7d31;font-size:13px;font-family:system-ui,sans-serif;font-weight:800;letter-spacing:.18em;text-transform:uppercase">A note from the Wedding Garden</div><h2 style="margin:8px 0 0;font-size:clamp(29px,4vw,45px);line-height:1.08;color:#11284a;font-weight:700">For Maria — In Every Season</h2><div style="width:96px;height:2px;background:linear-gradient(90deg,#b78b42,rgba(183,139,66,0));margin:17px 0 20px"></div><p style="margin:0;max-width:650px;font-size:clamp(18px,2.15vw,25px);line-height:1.55;color:#2c4362">Some things are beautiful because they last. Others are beautiful because we choose them again with every season.</p><p style="margin:17px 0 0;max-width:650px;font-size:clamp(17px,2vw,23px);line-height:1.5;color:#526179;font-style:italic">Evelyn looks toward the Conservatory. “Now you're ready to see what the garden was protecting.”</p><button data-continue style="width:min(520px,100%);margin-top:28px;padding:15px 24px;border-radius:999px;border:2px solid #c7a35d;background:linear-gradient(180deg,#183653,#0b2645);box-shadow:0 8px 18px rgba(11,38,69,.2),inset 0 1px rgba(255,255,255,.18);color:#fff8e8;font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:700;cursor:pointer">Continue</button></div></div></div>`;
  document.body.appendChild(overlay);
  const close=()=>{overlay.remove();scene.scene?.resume?.();};
  overlay.querySelector("[data-close]")?.addEventListener("click",close);
  overlay.querySelector("[data-continue]")?.addEventListener("click",close);
  overlay.addEventListener("click",(ev)=>{if(ev.target===overlay)close();});
  if(window.matchMedia("(max-width: 700px)").matches){
    const card=overlay.querySelector("[data-card]") as HTMLElement;
    const layout=overlay.querySelector("[data-layout]") as HTMLElement;
    const portrait=overlay.querySelector("[data-portrait-wrap]") as HTMLElement;
    card.style.minHeight="0";
    layout.style.gridTemplateColumns="1fr";
    layout.style.gap="12px";
    layout.style.padding="64px 24px 28px";
    portrait.style.minHeight="0";
    const img=portrait.querySelector("img") as HTMLElement;
    img.style.width="116px";
  }
  scene.scene?.pause?.();
}

function talkToKeeper(scene:any){
  const n=Math.max(0,Math.min(4,Number(scene.zoneState?.["keysFound"]??0)));
  scene.zoneState["keeperMet"]=true;
  if(n===0)scene.objective="Restore the Four Seasons — Seasonal Keys 0/4. Explore the garden's four seasonal corners.";
  showEvelynDialogue(scene,KEEPER_LINES[n],KEEPER_REPLIES[n] ?? KEEPER_REPLIES[0]);
}

function readGardenLetter(scene:any){
  scene.zoneState["gardenLetterRead"]=true;
  showGardenLetter(scene);
  scene.objective="All four seasons are restored — enter the Grand Conservatory.";
}

export function installAct2GardenKeeper(QuestScene:any){
  const proto=QuestScene?.prototype;if(!proto||proto.__act2GardenKeeperInstalled)return;proto.__act2GardenKeeperInstalled=true;
  const originalSpawnActGuide=proto.spawnActGuide;proto.spawnActGuide=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalSpawnActGuide.call(this,GUIDE_X,GUIDE_Y);return originalSpawnActGuide.call(this,tx,ty);};
  const originalAddBlacksmith=proto.addBlacksmith;proto.addBlacksmith=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalAddBlacksmith.call(this,SMITH_X,SMITH_Y);return originalAddBlacksmith.call(this,tx,ty);};
  const originalAddGuest=proto.addGuest;proto.addGuest=function(guest:any,tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalAddGuest.call(this,{...guest,prompt:"Talk"},GUEST_X,GUEST_Y);return originalAddGuest.call(this,guest,tx,ty);};
  const originalAddDogOffer=proto.addDogOffer;proto.addDogOffer=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return;return originalAddDogOffer.call(this,tx,ty);};

  const originalHouseSpot=proto.houseSpot;
  proto.houseSpot=function(){
    if(this.save?.current_zone===ZONE)return [this.wx(54),this.wy(72)];
    return originalHouseSpot.call(this);
  };

  // The Act II house stays on the left plaza and gets no baked ground shadow.
  const originalAddHouse=proto.addHouse;
  proto.addHouse=function(){
    if(this.save?.current_zone!==ZONE)return originalAddHouse.call(this);
    const originalBakeShadow=this.bakeShadow;
    this.bakeShadow=()=>{};
    try{return originalAddHouse.call(this);}finally{this.bakeShadow=originalBakeShadow;}
  };

  const originalBuildAct2=proto.buildAct2;proto.buildAct2=function(){const result=originalBuildAct2.call(this);removeActTwoDog(this);addKeeperStation(this);return result;};
  const originalInteract=proto.interact;proto.interact=function(){if(this.save?.current_zone!==ZONE)return originalInteract.call(this);const nearest=this.nearest?.();if(nearest?.kind===KEEPER_KIND){talkToKeeper(this);return;}if(nearest?.kind===LETTER_KIND){readGardenLetter(this);return;}const before=Number(this.zoneState?.["keysFound"]??0);const result=originalInteract.call(this);const after=Number(this.zoneState?.["keysFound"]??0);if(after!==before){refreshKeeperGarden(this);if(this.zoneState?.["keeperMet"]===true)this.objective=after>=4?"All four seasons are restored — return to Evelyn before entering the Grand Conservatory.":`Restore the Four Seasons — Seasonal Keys ${after}/4. Explore the remaining seasonal corners.`;}return result;};
}
