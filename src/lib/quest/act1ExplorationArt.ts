import * as Phaser from "phaser";
import { T } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const TIDE_KEY = "marias-quest-act1-whispering-tide-v1";
const WATCH_KEY = "marias-quest-act1-river-watch-v1";
const CACHE_KEY = "marias-quest-act1-river-watch-cache-v1";
const TRACK = "act1ExplorationArt";
const ENVELOPE_DECOR = "act1LoveEnvelopeDecor";

function isAct1(scene: SceneLike) {
  return scene.save?.current_zone === "sunlit_shores";
}

function seen(key: string) {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(key) === "1"; } catch { return false; }
}

function mark(key: string) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(key, "1"); } catch { /* optional persistence */ }
}

function track<T extends any>(obj: T): T {
  obj?.setData?.(TRACK, true);
  return obj;
}

function cleanup(scene: SceneLike) {
  scene.interactables = (scene.interactables ?? []).filter((it: any) => {
    if (!it?.obj?.getData?.(TRACK)) return true;
    scene.tweens?.killTweensOf?.(it.obj);
    it.obj.destroy?.();
    return false;
  });
  for (const child of [...(scene.children?.list ?? [])]) {
    const obj = child as any;
    if (!obj?.getData?.(TRACK)) continue;
    scene.tweens?.killTweensOf?.(obj);
    obj.destroy?.();
  }
  for (const child of [...(scene.solidDecor?.getChildren?.() ?? [])]) {
    const obj = child as any;
    if (obj?.getData?.(TRACK)) obj.destroy?.();
  }
}

function clearTrees(scene: SceneLike, x: number, y: number, radius: number) {
  const near = (obj: any) => obj?.active !== false && obj?.texture?.key === "tree" && Phaser.Math.Distance.Between(Number(obj.x ?? 0), Number(obj.y ?? 0), x, y) < radius;
  for (const child of [...(scene.children?.list ?? [])]) if (near(child)) child.destroy?.();
  for (const child of [...(scene.solidDecor?.getChildren?.() ?? [])]) if (near(child)) child.destroy?.();
}

function makeLoveEnvelopeTexture(scene: SceneLike) {
  const key = "act1-love-envelope";
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 46, 34)!;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, 46, 34);
  ctx.fillStyle = "rgba(37,27,22,.22)"; ctx.beginPath(); ctx.ellipse(23,30,17,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#c7a66a"; ctx.beginPath(); ctx.moveTo(5,7); ctx.lineTo(39,5); ctx.lineTo(43,10); ctx.lineTo(41,27); ctx.lineTo(35,30); ctx.lineTo(7,29); ctx.lineTo(3,24); ctx.lineTo(4,11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#f5e5bd"; ctx.beginPath(); ctx.moveTo(6,8); ctx.lineTo(38,7); ctx.lineTo(41,11); ctx.lineTo(39,26); ctx.lineTo(34,28); ctx.lineTo(8,27); ctx.lineTo(5,23); ctx.lineTo(6,11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#fff3d4"; ctx.beginPath(); ctx.moveTo(7,9); ctx.lineTo(38,8); ctx.lineTo(39,12); ctx.lineTo(23,22); ctx.lineTo(7,12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#d3ad54"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(7,11); ctx.lineTo(23,22); ctx.lineTo(39,11); ctx.moveTo(6,24); ctx.lineTo(17,16); ctx.moveTo(40,24); ctx.lineTo(29,16); ctx.stroke();
  ctx.fillStyle = "#fff8e7"; ctx.fillRect(9,10,17,1);
  ctx.fillStyle = "#81283a"; ctx.beginPath(); ctx.arc(23,22,6,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#b93b54"; ctx.beginPath(); ctx.arc(21.5,20.5,4.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#e9b0ad"; ctx.beginPath(); ctx.moveTo(23,24.5); ctx.bezierCurveTo(17.8,21.2,19.1,18.4,21.3,19.1); ctx.bezierCurveTo(23,17.1,26.9,19.2,25.1,21.6); ctx.closePath(); ctx.fill();
  tex.refresh();
  return key;
}

function makeTidePoolTexture(scene: SceneLike) {
  const key = "act1-whispering-tide-pool";
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key,196,126)!;
  const c = tex.getContext(); c.imageSmoothingEnabled = false; c.clearRect(0,0,196,126);
  c.fillStyle="rgba(28,55,44,.18)"; c.beginPath(); c.ellipse(98,72,88,45,-.05,0,Math.PI*2); c.fill();
  const stones = [[18,62,19,11],[32,39,17,12],[55,27,20,11],[82,20,18,10],[111,20,20,11],[139,28,19,11],[161,42,18,12],[174,64,18,11],[164,88,20,11],[142,103,18,10],[113,108,21,10],[84,109,20,10],[56,103,19,11],[34,91,20,11],[20,78,17,10]] as [number,number,number,number][];
  stones.forEach(([x,y,w,h],i)=>{ c.fillStyle=i%3===0?"#718779":i%3===1?"#839486":"#687d72"; c.beginPath(); c.ellipse(x,y,w,h,(i%4-1.5)*.09,0,Math.PI*2); c.fill(); c.fillStyle="rgba(190,211,183,.35)"; c.beginPath(); c.ellipse(x-4,y-3,w*.5,h*.35,0,0,Math.PI*2); c.fill(); });
  c.fillStyle="#4aaeb6"; c.beginPath(); c.moveTo(28,61); c.bezierCurveTo(32,35,60,27,89,29); c.bezierCurveTo(123,22,156,39,166,59); c.bezierCurveTo(177,79,151,99,122,98); c.bezierCurveTo(91,108,55,98,37,84); c.bezierCurveTo(27,77,23,69,28,61); c.closePath(); c.fill();
  c.fillStyle="rgba(140,231,224,.65)"; c.beginPath(); c.moveTo(40,57); c.bezierCurveTo(54,39,82,35,103,38); c.bezierCurveTo(130,33,150,47,156,62); c.bezierCurveTo(161,76,141,87,116,87); c.bezierCurveTo(88,94,57,87,44,76); c.bezierCurveTo(36,69,35,63,40,57); c.closePath(); c.fill();
  c.fillStyle="rgba(231,255,244,.5)"; c.beginPath(); c.ellipse(82,51,34,6,-.08,0,Math.PI*2); c.fill();
  c.fillStyle="rgba(255,255,255,.58)"; ([[61,66],[91,44],[121,71],[140,54],[78,83],[110,58]] as [number,number][]).forEach(([x,y])=>{c.fillRect(x,y,3,1); c.fillRect(x+1,y-1,1,3);});
  c.strokeStyle="#527b55"; c.lineWidth=2; [29,35,157,164,47,151].forEach(x=>{const y=x<100?83+(x%9):78+(x%7); c.beginPath(); c.moveTo(x,y); c.quadraticCurveTo(x-4,y-18,x+(x%3)-1,y-27); c.stroke(); c.beginPath(); c.moveTo(x+4,y); c.quadraticCurveTo(x+8,y-14,x+6,y-22); c.stroke();});
  c.strokeStyle="#7a5b42"; c.lineWidth=4; c.beginPath(); c.moveTo(46,92); c.quadraticCurveTo(61,85,74,90); c.stroke(); c.strokeStyle="#a98461"; c.lineWidth=1; c.beginPath(); c.moveTo(48,90); c.lineTo(68,88); c.stroke();
  ([[132,96],[146,92],[48,49]] as [number,number][]).forEach(([x,y])=>{c.fillStyle="#f6dfc9"; c.beginPath(); c.arc(x,y,3,Math.PI,0); c.fill(); c.strokeStyle="#c89982"; c.beginPath(); c.moveTo(x,y); c.lineTo(x,y-3); c.stroke();});
  ([[31,46,"#f4b3c7"],[42,101,"#fff4ea"],[151,34,"#fff8ed"],[164,94,"#e99cb7"],[64,111,"#f7c1d2"],[126,108,"#fff7ef"]] as [number,number,string][]).forEach(([x,y,col])=>{c.fillStyle="#5f8655"; c.fillRect(x,y+2,1,6); c.fillStyle=col; c.beginPath(); c.arc(x-2,y,2,0,Math.PI*2); c.arc(x+2,y,2,0,Math.PI*2); c.arc(x,y-2,2,0,Math.PI*2); c.fill(); c.fillStyle="#e5b95b"; c.fillRect(x,y,1,1);});
  tex.refresh(); return key;
}

function makeWatchTexture(scene: SceneLike) {
  const key="act1-abandoned-river-watch";
  if(scene.textures.exists(key)) return key;
  const tex=scene.textures.createCanvas(key,142,154)!; const c=tex.getContext(); c.imageSmoothingEnabled=false; c.clearRect(0,0,142,154);
  c.fillStyle="rgba(31,28,22,.22)"; c.beginPath(); c.ellipse(72,140,55,9,0,0,Math.PI*2); c.fill();
  const post=(x:number,top:number,bottom:number,lean:number)=>{c.strokeStyle="#4b3527";c.lineWidth=11;c.beginPath();c.moveTo(x,bottom);c.lineTo(x+lean,top);c.stroke();c.strokeStyle="#775239";c.lineWidth=5;c.beginPath();c.moveTo(x-1,bottom-3);c.lineTo(x+lean-1,top+4);c.stroke();c.strokeStyle="#65764c";c.lineWidth=2;c.beginPath();c.moveTo(x+3,bottom-20);c.lineTo(x+lean+3,top+8);c.stroke();}; post(31,47,136,-4); post(111,50,136,3);
  c.fillStyle="#493326";c.beginPath();c.moveTo(20,88);c.lineTo(119,84);c.lineTo(125,108);c.lineTo(17,112);c.closePath();c.fill(); for(let i=0;i<7;i++){const y=90+i*3;c.strokeStyle=i%2?"#8a6244":"#6e4c36";c.lineWidth=2;c.beginPath();c.moveTo(24+(i%3),y);c.lineTo(116-(i%2)*5,y-2);c.stroke();} c.fillStyle="#2e241d";c.fillRect(62,89,4,21);c.fillRect(96,87,3,22);
  c.strokeStyle="#543a2a";c.lineWidth=8;c.beginPath();c.moveTo(24,67);c.lineTo(69,31);c.lineTo(119,67);c.stroke();c.strokeStyle="#7a563d";c.lineWidth=4;c.beginPath();c.moveTo(31,65);c.lineTo(70,38);c.lineTo(108,63);c.stroke();c.fillStyle="#51483e";c.beginPath();c.moveTo(41,58);c.lineTo(69,37);c.lineTo(84,48);c.lineTo(68,61);c.closePath();c.fill();c.fillStyle="#65705c";c.beginPath();c.moveTo(77,42);c.lineTo(102,59);c.lineTo(93,67);c.lineTo(70,51);c.closePath();c.fill();
  c.strokeStyle="#b39062";c.lineWidth=2;c.beginPath();c.moveTo(101,57);c.bezierCurveTo(112,70,100,76,108,88);c.stroke();c.beginPath();c.arc(108,91,5,0,Math.PI*1.7);c.stroke();
  c.strokeStyle="#79563d";c.lineWidth=4;c.beginPath();c.moveTo(38,137);c.lineTo(54,91);c.moveTo(51,139);c.lineTo(65,91);c.stroke();c.lineWidth=2;for(let y=100;y<136;y+=9){c.beginPath();c.moveTo(50-(y-100)*.05,y);c.lineTo(62-(y-100)*.05,y-1);c.stroke();}
  c.fillStyle="#5b4632";c.fillRect(84,105,25,19);c.strokeStyle="#9a7651";c.lineWidth=2;c.strokeRect(86,107,21,15);c.beginPath();c.moveTo(87,108);c.lineTo(106,121);c.moveTo(106,108);c.lineTo(87,121);c.stroke();c.fillStyle="#d9c594";c.fillRect(71,102,17,5);c.fillStyle="#9a7d57";c.fillRect(71,102,3,5);c.fillRect(85,102,3,5);
  c.fillStyle="#2f302e";c.fillRect(24,76,10,14);c.strokeStyle="#b79451";c.lineWidth=2;c.strokeRect(25,77,8,11);c.strokeStyle="#e2c16a";c.beginPath();c.moveTo(27,80);c.lineTo(32,86);c.moveTo(32,80);c.lineTo(27,86);c.stroke();c.strokeStyle="#9a5f58";c.lineWidth=4;c.beginPath();c.moveTo(116,69);c.quadraticCurveTo(128,75,121,88);c.stroke();
  ([[59,108,"#f2b4c8"],[66,110,"#fff2e5"],[114,119,"#e9a1b9"]] as [number,number,string][]).forEach(([x,y,col])=>{c.strokeStyle="#577249";c.lineWidth=1;c.beginPath();c.moveTo(x,y+8);c.lineTo(x,y);c.stroke();c.fillStyle=col;c.beginPath();c.arc(x-2,y,2,0,Math.PI*2);c.arc(x+2,y,2,0,Math.PI*2);c.fill();}); tex.refresh(); return key;
}

function makeSmallTextures(scene: SceneLike) {
  if(!scene.textures.exists("act1-watch-note")){const t=scene.textures.createCanvas("act1-watch-note",22,16)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="rgba(35,24,18,.18)";c.fillRect(4,13,15,2);c.fillStyle="#d8c49a";c.beginPath();c.moveTo(3,2);c.lineTo(19,3);c.lineTo(18,13);c.lineTo(4,12);c.closePath();c.fill();c.strokeStyle="#9b8058";c.beginPath();c.moveTo(6,6);c.lineTo(16,6);c.moveTo(6,9);c.lineTo(14,9);c.stroke();t.refresh();}
  if(!scene.textures.exists("act1-watch-cache")){const t=scene.textures.createCanvas("act1-watch-cache",24,20)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#5c402c";c.fillRect(3,8,18,10);c.fillStyle="#8a6242";c.fillRect(4,6,16,5);c.strokeStyle="#d4af5a";c.lineWidth=2;c.strokeRect(4,7,16,10);c.fillStyle="#efd17b";c.fillRect(11,9,3,4);t.refresh();}
  if(!scene.textures.exists("act1-reflection-point")){const t=scene.textures.createCanvas("act1-reflection-point",20,20)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="rgba(196,252,245,.22)";c.beginPath();c.arc(10,10,8,0,Math.PI*2);c.fill();c.fillStyle="#e9fff8";c.fillRect(9,3,2,14);c.fillRect(3,9,14,2);c.fillStyle="#8ce0d7";c.fillRect(6,6,2,2);c.fillRect(13,13,2,2);t.refresh();}
}

function decorateWaterfallEnvelope(scene: SceneLike) {
  const it=(scene.interactables??[]).find((e:any)=>e?.kind==="envelope"&&e?.id==="waterfall"&&e?.obj?.active); if(!it?.obj)return;
  it.obj.setTexture?.(makeLoveEnvelopeTexture(scene)).setScale?.(1.08).setDepth?.(Math.max(18,Number(it.obj.depth??0))); it.obj.setData?.("act1LoveEnvelope",true);
  const x=it.obj.x,y=it.obj.y,depth=Number(it.obj.depth??18);
  const halo=track(scene.add.ellipse(x,y+5,48,18,0xf4d783,.12).setDepth(depth-1)); halo.setData(ENVELOPE_DECOR,true); scene.tweens.add({targets:halo,alpha:{from:.05,to:.2},scaleX:{from:.9,to:1.12},duration:1250,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  for(let i=0;i<6;i++){const mote=track(scene.add.circle(x+Phaser.Math.Between(-24,24),y+Phaser.Math.Between(-22,14),Phaser.Math.Between(1,2),0xffe9a3,.8).setDepth(depth+1));mote.setData(ENVELOPE_DECOR,true);scene.tweens.add({targets:mote,y:mote.y-Phaser.Math.Between(10,22),x:mote.x+Phaser.Math.Between(-5,5),alpha:{from:.15,to:.85},duration:Phaser.Math.Between(900,1500),yoyo:true,repeat:-1,delay:i*120,ease:"Sine.easeInOut"});}
}

function paintApproach(scene: SceneLike, points:[number,number][]) {
  if(!scene.layer)return; const world=points.map(([dx,dy])=>[Number(scene.wx?.(dx)??dx*32),Number(scene.wy?.(dy)??dy*32)] as [number,number]);
  for(let p=0;p<world.length-1;p++){const [ax,ay]=world[p]!,[bx,by]=world[p+1]!;const steps=Math.max(1,Math.ceil(Phaser.Math.Distance.Between(ax,ay,bx,by)/24));for(let i=0;i<=steps;i++){const x=Phaser.Math.Linear(ax,bx,i/steps),y=Phaser.Math.Linear(ay,by,i/steps),tx=Math.floor(x/32),ty=Math.floor(y/32);for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const tile=scene.layer.getTileAt?.(tx+ox,ty+oy);if(tile&&tile.index!==T.WATER)scene.layer.putTileAt(T.PATH,tx+ox,ty+oy);}}} scene.layer.setCollision?.([T.WALL,T.HEDGE,T.VOID,T.WATER]);
}

function spawnTidePool(scene:SceneLike){const x=Number(scene.wx?.(21)??672),y=Number(scene.wy?.(14)??448);clearTrees(scene,x,y,190);paintApproach(scene,[[16,20],[18,18],[21,14]]);const pool=track(scene.add.image(x,y,makeTidePoolTexture(scene)).setDepth(4));pool.setData("explorationName","Whispering Tide Pool");const marker=track(scene.add.sprite(x+18,y+8,"act1-reflection-point").setDepth(13).setAlpha(.84));scene.tweens.add({targets:marker,alpha:{from:.36,to:.95},scale:{from:.86,to:1.08},duration:1000,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});scene.interactables.push({obj:marker,kind:"act1-tide-pool",id:"whispering-tide",label:"Look into the still water",radius:80,enabled:true});for(let i=0;i<7;i++){const f=track(scene.add.circle(x+Phaser.Math.Between(-70,70),y+Phaser.Math.Between(-42,38),1.5,i%2?0xffefaa:0xc8fff1,.75).setDepth(12));scene.tweens.add({targets:f,x:f.x+Phaser.Math.Between(-14,14),y:f.y+Phaser.Math.Between(-12,12),alpha:{from:.18,to:.9},duration:Phaser.Math.Between(1100,2100),yoyo:true,repeat:-1,delay:i*90,ease:"Sine.easeInOut"});}}

function addInvisibleBlocker(scene:SceneLike,x:number,y:number,sx:number,sy:number){if(!scene.solidDecor)return;const b=track(scene.solidDecor.create(x,y,"block") as Phaser.Physics.Arcade.Sprite);b.setVisible(false).setAlpha(.001).setScale(sx,sy);(b as any).refreshBody?.();}

function spawnRiverWatch(scene:SceneLike){const x=Number(scene.wx?.(78)??2496),y=Number(scene.wy?.(77)??2464);clearTrees(scene,x,y,210);paintApproach(scene,[[72,69],[74,72],[76,75],[78,77]]);const watch=track(scene.add.image(x,y,makeWatchTexture(scene)).setDepth(scene.dsort?.(y+34)??11));watch.setData("explorationName","Abandoned River Watch");addInvisibleBlocker(scene,x,y+38,1.6,.45);const note=track(scene.add.sprite(x+10,y+25,"act1-watch-note").setDepth(Number(watch.depth??11)+2));scene.interactables.push({obj:note,kind:"act1-river-watch-note",id:"river-watch-note",label:"Read the weathered lookout note",radius:74,enabled:true});scene.tweens.add({targets:note,y:note.y-2,duration:1500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});if(!seen(CACHE_KEY)){const cache=track(scene.add.sprite(x-38,y+36,"act1-watch-cache").setDepth(Number(watch.depth??11)+2));scene.interactables.push({obj:cache,kind:"act1-river-watch-cache",id:"river-watch-cache",label:"Inspect the forgotten cache",radius:68,enabled:true});scene.tweens.add({targets:cache,alpha:{from:.72,to:1},y:cache.y-2,duration:1100,yoyo:true,repeat:-1});const g=track(scene.add.circle(cache.x,cache.y-8,2,0xffdf85,.9).setDepth(Number(cache.depth??12)+1));scene.tweens.add({targets:g,alpha:{from:.1,to:1},scale:{from:.5,to:1.5},duration:800,yoyo:true,repeat:-1});}}

function healOne(scene:SceneLike){if(!scene.save)return false;const current=Number(scene.save.player_health??0),max=Math.max(1,Number(scene.getMaxHealth?.()??scene.maxHealth??5));if(current>=max)return false;scene.save.player_health=Math.min(max,current+1);scene.emitSave?.();scene.pushHud?.(true);scene.spawnSparkle?.(scene.player?.x??0,scene.player?.y??0,0xffe6a4,10);return true;}

function interactTide(scene:SceneLike){const first=!seen(TIDE_KEY);if(first)mark(TIDE_KEY);const healed=first?healOne(scene):false;scene.openModal?.({type:"info",title:"The Whispering Tide Pool",body:first?`Maria kneels beside the glass-still water. “Still water carries the things the river forgets.”${healed?" The quiet returns one heart of strength.":" The quiet settles around her, gentle and complete."}`:"The tide pool remembers the sky without asking anything from it. Maria lets the silence stay a little longer."});}
function interactWatch(scene:SceneLike){if(!seen(WATCH_KEY))mark(WATCH_KEY);scene.openModal?.({type:"info",title:"Weathered River Watch Note",body:"The current grows meaner near the Warden. We stopped trying to overpower it. Watch the water, learn where it wants to go, then move with it. The survivors have gone southeast to the Last Crossing."});}
function interactCache(scene:SceneLike,it:any){if(seen(CACHE_KEY))return;mark(CACHE_KEY);const healed=healOne(scene);scene.tweens?.killTweensOf?.(it.obj);it.obj?.destroy?.();scene.interactables=(scene.interactables??[]).filter((x:any)=>x!==it);scene.openModal?.({type:"info",title:"A Forgotten Watch Cache",body:healed?"Inside the little weathered box, Maria finds a sealed honey tonic left for the next watcher. One heart is restored.":"Inside is a sealed honey tonic and a faded ribbon. Maria is already at full strength, so she leaves the tonic untouched and keeps only the memory of the kindness."});}

function spawnExploration(scene:SceneLike){cleanup(scene);if(!isAct1(scene))return;makeSmallTextures(scene);decorateWaterfallEnvelope(scene);spawnTidePool(scene);spawnRiverWatch(scene);}
function cleanupEnvelopeDecor(scene:SceneLike){for(const child of [...(scene.children?.list??[])]){const obj=child as any;if(!obj?.getData?.(ENVELOPE_DECOR))continue;scene.tweens?.killTweensOf?.(obj);obj.destroy?.();}}

export function installAct1ExplorationArt(QuestScene:SceneCtor){const proto=QuestScene.prototype;if(proto.__act1ExplorationArtInstalled)return;proto.__act1ExplorationArtInstalled=true;const originalCreate=proto.create;proto.create=function act1ExplorationCreate(this:SceneLike,...args:any[]){const result=originalCreate.apply(this,args);this.time.delayedCall(140,()=>spawnExploration(this));return result;};const originalBuildAct1=proto.buildAct1;proto.buildAct1=function act1ExplorationBuild(this:SceneLike,...args:any[]){const result=originalBuildAct1.apply(this,args);this.time.delayedCall(80,()=>spawnExploration(this));return result;};const originalInteract=proto.interact;proto.interact=function act1ExplorationInteract(this:SceneLike,...args:any[]){if(this.frozen)return;const it=this.nearest?.();if(it?.kind==="act1-tide-pool"){interactTide(this);return;}if(it?.kind==="act1-river-watch-note"){interactWatch(this);return;}if(it?.kind==="act1-river-watch-cache"){interactCache(this,it);return;}const wasWaterfall=it?.kind==="envelope"&&it?.id==="waterfall";const result=originalInteract.apply(this,args);if(wasWaterfall)this.time.delayedCall(20,()=>cleanupEnvelopeDecor(this));return result;};}
