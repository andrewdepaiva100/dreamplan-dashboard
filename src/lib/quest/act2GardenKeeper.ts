// @ts-nocheck -- Narrow runtime decorator for the Phaser quest scene.

import evelynPortrait from "../../assets/quest/portrait-evelyn.svg";

const ZONE = "wedding_garden";
const KEEPER_KIND = "garden-keeper";
const LETTER_KIND = "garden-keeper-letter";
const KEEPER_X = 96;
const KEEPER_Y = 56;
const GUIDE_X = 86;
const GUIDE_Y = 34;
const SMITH_X = 104;
const SMITH_Y = 38;
const GUEST_X = 108;
const GUEST_Y = 78;

const KEEPER_LINES = [
  "This garden is not simply dying, Maria. Its seasons have forgotten how to belong to one another. Spring keeps trying to begin. Summer refuses to end. Autumn cannot let go. Winter will not wake. The four Seasonal Keys once kept them in balance. Bring them home, and watch what the garden remembers.",
  "Spring answered you. I have tended these beds for years, but they have not opened like that for me. Keep going — the garden knows the difference between being repaired and being cared for.",
  "Two seasons are breathing together again. Look at the fountain light. The garden recognizes you, Maria. You are not merely collecting keys; you are reminding this place what it was made to hold.",
  "Three seasons have returned. One remains. When the fourth comes home, return to me. There is something beneath the flowering arch that has been waiting longer than I have.",
  "All four seasons are home. The Conservatory can hear them again. Before you go inside, there is something here for you — beneath the flowering arch.",
];

type KeeperReply = { maria: string; evelyn: string };
const KEEPER_REPLIES: KeeperReply[][] = [
  [
    { maria: "What happened to the garden?", evelyn: "It stopped moving as one living thing. Each season began protecting only itself. That is why the keys matter — they remind the garden that change is not loss." },
    { maria: "Why do the seasons matter so much?", evelyn: "Because a garden cannot live in only one perfect moment. Spring begins, summer gives, autumn releases, winter rests. Love survives by learning all four." },
    { maria: "Tell me where to begin.", evelyn: "Begin anywhere. The closest season will answer when you reach it. Bring each key home in your own order; the garden is listening for your care, not your speed." },
  ],
  [
    { maria: "It really changed when I touched the key.", evelyn: "Yes. Not because the key is powerful by itself — because you carried its season back with intention. The garden felt that." },
    { maria: "Three more, then.", evelyn: "Three more. But do not rush past what each corner becomes. This place is trying to tell you something while it heals." },
  ],
  [
    { maria: "You think the garden recognizes me?", evelyn: "I do. Some places remember the people who arrive willing to listen. You have been listening since you stepped through the gate." },
    { maria: "What is inside the Conservatory?", evelyn: "Something the garden refused to surrender, even when everything else fractured. I would rather let it introduce itself when you are ready." },
  ],
  [
    { maria: "What is waiting under the arch?", evelyn: "A small thing. Which is often how the important things survive. Bring winter home and I will show you." },
    { maria: "Then I am finishing this.", evelyn: "I knew you would. Just remember: restoring a place is different from defeating it. Let the last season come home gently." },
  ],
  [
    { maria: "We did it.", evelyn: "You did more than that. You gave the garden permission to become whole again. Go read what waited for you beneath the roses." },
    { maria: "I want to see what it was protecting.", evelyn: "Then read the letter first, Maria. After that, the Conservatory is yours to enter." },
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
    const p = (x:number,y:number,w:number,h:number,color:string) => { c.fillStyle=color; c.fillRect(x,y,w,h); };
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
  const nook = scene.add.image(x - 76, y + 8, "keeper-nook").setScale(1.45).setDepth(5);
  nook.setOrigin(0.5, 0.5);
  const keeper = scene.addInteractable(x, y, "evelyn-keeper", KEEPER_KIND, "Talk to Evelyn", { id: "evelyn", radius: 92, depth: 9 });
  keeper?.obj?.clearTint?.();
  keeper?.obj?.setScale?.(1.75);
  if (keeper?.obj) scene.tweens.add({ targets: keeper.obj, y: keeper.obj.y - 1, duration: 1850, yoyo: true, repeat: -1 });
  const stones:any[] = [];
  for (const [dx,dy,w] of [[-2,48,18],[-18,57,16],[-35,64,14]]) {
    const s = scene.add.ellipse(x + dx, y + dy, w, 8, 0xd9d2b7, 0.88).setDepth(3);
    s.setStrokeStyle?.(1,0xa79e82,0.7); stones.push(s);
  }
  const glow = scene.add.circle(x - 22, y + 5, 18, 0xffdc82, 0.08).setDepth(4);
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
  const flower=(dx:number,dy:number,tint:number,scale=.58)=>{const f=scene.add.sprite(x+dx,y+dy,"flowers").setTint(tint).setScale(scale).setDepth(5);made.push(f);return f;};
  if (n >= 1) for (const [dx,dy] of [[-138,52],[-116,66],[-82,73],[-54,70]]) flower(dx,dy,0xb9f28f,.5);
  if (n >= 2) {
    art.glow?.setFillStyle?.(0xffd66f,.22);
    for (const [dx,dy] of [[-118,-28],[-73,-38],[-31,-24]]) {
      const light=scene.add.circle(x+dx,y+dy,4,0xffd66f,.68).setDepth(7); made.push(light);
      scene.tweens.add({targets:light,alpha:{from:.3,to:.85},duration:1250,yoyo:true,repeat:-1});
    }
  }
  if (n >= 3) {
    for (let i=0;i<7;i++) {
      const leaf=scene.add.ellipse(x-132+i*20,y-50+(i%3)*12,6,3,i%2?0xd98b43:0xe7b95f,.65).setDepth(7); made.push(leaf);
      scene.tweens.add({targets:leaf,y:leaf.y+25,x:leaf.x+10,alpha:.08,duration:2300+i*120,repeat:-1,delay:i*170});
    }
  }
  if (n >= 4) {
    const ax=x+78, ay=y-12;
    const left=scene.add.sprite(ax,ay,"flowers").setTint(0xf2a5bd).setScale(.8).setDepth(6);
    const right=scene.add.sprite(ax+50,ay,"flowers").setTint(0xf2a5bd).setScale(.8).setDepth(6);
    const top=scene.add.sprite(ax+25,ay-34,"flowers").setTint(0xf2a5bd).setScale(.9).setDepth(6);
    made.push(left,right,top);
    if (!scene.__act2KeeperLetterAdded) {
      scene.__act2KeeperLetterAdded = true;
      const letter=scene.addInteractable(ax+25,ay+30,"envelope",LETTER_KIND,"Read the letter for Maria",{id:"four-seasons",radius:72,depth:8});
      if(letter?.obj){letter.obj.setTint?.(0xffe5a8);scene.tweens.add({targets:letter.obj,y:letter.obj.y-3,duration:1200,yoyo:true,repeat:-1});}
      scene.spawnSparkle?.(ax+25,ay+15,0xffd978,20);
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

function talkToKeeper(scene:any){
  const n=Math.max(0,Math.min(4,Number(scene.zoneState?.["keysFound"]??0)));
  scene.zoneState["keeperMet"]=true;
  if(n===0)scene.objective="Restore the Four Seasons — Seasonal Keys 0/4.";
  showEvelynDialogue(scene,KEEPER_LINES[n],KEEPER_REPLIES[n] ?? KEEPER_REPLIES[0]);
}

function readGardenLetter(scene:any){
  scene.zoneState["gardenLetterRead"]=true;
  scene.openModal({type:"info",title:"For Maria — In Every Season",body:"Some things are beautiful because they last. Others are beautiful because we choose them again with every season.\n\nEvelyn looks toward the Conservatory. “Now you're ready to see what the garden was protecting.”"});
  scene.objective="All four seasons are restored — enter the Grand Conservatory.";
}

export function installAct2GardenKeeper(QuestScene:any){
  const proto=QuestScene?.prototype;if(!proto||proto.__act2GardenKeeperInstalled)return;proto.__act2GardenKeeperInstalled=true;
  const originalSpawnActGuide=proto.spawnActGuide;proto.spawnActGuide=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalSpawnActGuide.call(this,GUIDE_X,GUIDE_Y);return originalSpawnActGuide.call(this,tx,ty);};
  const originalAddBlacksmith=proto.addBlacksmith;proto.addBlacksmith=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalAddBlacksmith.call(this,SMITH_X,SMITH_Y);return originalAddBlacksmith.call(this,tx,ty);};
  const originalAddGuest=proto.addGuest;proto.addGuest=function(guest:any,tx:number,ty:number){if(this.save?.current_zone===ZONE)return originalAddGuest.call(this,guest,GUEST_X,GUEST_Y);return originalAddGuest.call(this,guest,tx,ty);};
  const originalAddDogOffer=proto.addDogOffer;proto.addDogOffer=function(tx:number,ty:number){if(this.save?.current_zone===ZONE)return;return originalAddDogOffer.call(this,tx,ty);};

  // The base game intentionally keeps Maria's cottage close to each arrival point.
  // In Act II, push that same valid house spot farther away from Evelyn's nook so
  // the Keeper's garden reads as its own destination. All other acts are untouched.
  const originalHouseSpot=proto.houseSpot;
  proto.houseSpot=function(){
    const spot=originalHouseSpot.call(this);
    if(this.save?.current_zone!==ZONE||!spot)return spot;
    const [x,y]=spot;
    const ex=this.wx(KEEPER_X), ey=this.wy(KEEPER_Y);
    let dx=x-ex, dy=y-ey;
    let len=Math.hypot(dx,dy);
    if(len<1){dx=-1;dy=.35;len=Math.hypot(dx,dy);}
    const push=190;
    const maxX=Math.max(120,(this.mapW??56)*32-120);
    const maxY=Math.max(120,(this.mapH??56)*32-120);
    return [Math.max(120,Math.min(maxX,x+(dx/len)*push)),Math.max(120,Math.min(maxY,y+(dy/len)*push))];
  };

  const originalBuildAct2=proto.buildAct2;proto.buildAct2=function(){const result=originalBuildAct2.call(this);removeActTwoDog(this);addKeeperStation(this);return result;};
  const originalInteract=proto.interact;proto.interact=function(){if(this.save?.current_zone!==ZONE)return originalInteract.call(this);const nearest=this.nearest?.();if(nearest?.kind===KEEPER_KIND){talkToKeeper(this);return;}if(nearest?.kind===LETTER_KIND){readGardenLetter(this);return;}const before=Number(this.zoneState?.["keysFound"]??0);const result=originalInteract.call(this);const after=Number(this.zoneState?.["keysFound"]??0);if(after!==before){refreshKeeperGarden(this);if(this.zoneState?.["keeperMet"]===true)this.objective=after>=4?"All four seasons are restored — return to Evelyn by the fountain.":`Restore the Four Seasons — Seasonal Keys ${after}/4.`;}return result;};
}
