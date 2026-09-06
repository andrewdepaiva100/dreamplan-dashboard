import * as Phaser from "phaser";
import { T } from "./textures";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const TIDE_KEY = "marias-quest-act1-whispering-tide-v1";
const WATCH_KEY = "marias-quest-act1-river-watch-v1";
const CACHE_KEY = "marias-quest-act1-river-watch-cache-v1";
const TRACK = "act1ExplorationArt";
const ENVELOPE_DECOR = "act1LoveEnvelopeDecor";
const REACTION_PREFIX = "marias-quest-act1-reaction-v1:";

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
  const key = "act1-whispering-tide-pool-small";
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 124, 78)!;
  const c = tex.getContext(); c.imageSmoothingEnabled = false; c.clearRect(0,0,124,78);
  c.fillStyle = "rgba(29,53,43,.18)"; c.beginPath(); c.ellipse(63,45,51,24,-.13,0,Math.PI*2); c.fill();
  const stones = [[16,43,13,8],[27,27,12,7],[46,18,13,7],[70,15,14,7],[94,23,13,8],[108,38,12,8],[102,58,14,8],[78,66,14,7],[51,66,13,7],[28,59,14,8]] as [number,number,number,number][];
  stones.forEach(([x,y,w,h],i)=>{c.fillStyle=i%2?"#7f9083":"#697e71";c.beginPath();c.ellipse(x,y,w,h,(i%3-1)*.08,0,Math.PI*2);c.fill();c.fillStyle="rgba(198,216,190,.28)";c.beginPath();c.ellipse(x-3,y-2,w*.45,h*.3,0,0,Math.PI*2);c.fill();});
  c.fillStyle="#50aeb4";c.beginPath();c.moveTo(24,40);c.bezierCurveTo(31,26,48,22,67,24);c.bezierCurveTo(89,21,103,31,104,43);c.bezierCurveTo(104,56,87,61,68,59);c.bezierCurveTo(48,63,30,56,25,48);c.bezierCurveTo(22,45,22,42,24,40);c.closePath();c.fill();
  c.fillStyle="rgba(150,232,222,.62)";c.beginPath();c.moveTo(32,39);c.bezierCurveTo(43,29,60,28,72,30);c.bezierCurveTo(88,28,96,34,97,42);c.bezierCurveTo(96,51,83,53,68,52);c.bezierCurveTo(51,55,37,50,32,45);c.closePath();c.fill();
  c.fillStyle="rgba(241,255,248,.55)";c.beginPath();c.ellipse(57,35,18,3,-.08,0,Math.PI*2);c.fill();
  c.strokeStyle="#527a55";c.lineWidth=2;[[23,54],[101,50],[34,24]].forEach(([x,y])=>{c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-2,y-11,x+1,y-18);c.stroke();});
  c.strokeStyle="#795b42";c.lineWidth=3;c.beginPath();c.moveTo(35,60);c.quadraticCurveTo(44,54,52,58);c.stroke();
  [[25,25,"#f4b4c6"],[95,59,"#fff3e8"],[74,68,"#f7c3d2"]].forEach(([x,y,col])=>{c.fillStyle="#5f8655";c.fillRect(Number(x),Number(y)+2,1,5);c.fillStyle=String(col);c.beginPath();c.arc(Number(x)-2,Number(y),2,0,Math.PI*2);c.arc(Number(x)+2,Number(y),2,0,Math.PI*2);c.fill();});
  tex.refresh(); return key;
}

function makeWatchTexture(scene: SceneLike) {
  const key = "act1-abandoned-river-watch-small";
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 94, 92)!;
  const c = tex.getContext(); c.imageSmoothingEnabled = false; c.clearRect(0,0,94,92);
  c.fillStyle="rgba(35,28,22,.2)";c.beginPath();c.ellipse(48,84,35,6,0,0,Math.PI*2);c.fill();
  const post=(x:number,top:number,bottom:number,lean:number)=>{c.strokeStyle="#4c3527";c.lineWidth=8;c.beginPath();c.moveTo(x,bottom);c.lineTo(x+lean,top);c.stroke();c.strokeStyle="#77533a";c.lineWidth=3;c.beginPath();c.moveTo(x-1,bottom-2);c.lineTo(x+lean-1,top+3);c.stroke();};
  post(24,30,82,-3); post(67,34,80,2);
  c.fillStyle="#4b3426";c.beginPath();c.moveTo(17,56);c.lineTo(70,54);c.lineTo(74,68);c.lineTo(15,70);c.closePath();c.fill();
  c.strokeStyle="#856047";c.lineWidth=2;for(let y=58;y<68;y+=3){c.beginPath();c.moveTo(19,y);c.lineTo(70,y-1);c.stroke();}
  c.strokeStyle="#563b2a";c.lineWidth=6;c.beginPath();c.moveTo(19,40);c.lineTo(45,19);c.lineTo(73,39);c.stroke();
  c.strokeStyle="#76523a";c.lineWidth=3;c.beginPath();c.moveTo(24,39);c.lineTo(45,24);c.lineTo(59,34);c.stroke();
  c.fillStyle="#596056";c.beginPath();c.moveTo(33,32);c.lineTo(45,23);c.lineTo(55,30);c.lineTo(44,38);c.closePath();c.fill();
  c.strokeStyle="#a98a62";c.lineWidth=2;c.beginPath();c.moveTo(66,36);c.bezierCurveTo(74,45,67,51,72,57);c.stroke();
  c.fillStyle="#31312e";c.fillRect(17,45,8,10);c.strokeStyle="#c09c59";c.strokeRect(18,46,6,8);
  c.fillStyle="#d7c498";c.fillRect(47,58,12,4);
  c.strokeStyle="#7b583e";c.lineWidth=3;c.beginPath();c.moveTo(26,84);c.lineTo(37,61);c.moveTo(36,85);c.lineTo(45,61);c.stroke();
  c.strokeStyle="#9a5f58";c.lineWidth=3;c.beginPath();c.moveTo(70,42);c.quadraticCurveTo(82,48,75,59);c.stroke();
  c.strokeStyle="#6b543c";c.lineWidth=4;c.beginPath();c.moveTo(55,76);c.lineTo(78,82);c.moveTo(60,72);c.lineTo(83,76);c.stroke();
  tex.refresh(); return key;
}

function makeSmallTextures(scene: SceneLike) {
  if(!scene.textures.exists("act1-watch-note")){const t=scene.textures.createCanvas("act1-watch-note",18,13)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#d8c49a";c.beginPath();c.moveTo(2,2);c.lineTo(16,3);c.lineTo(15,11);c.lineTo(3,10);c.closePath();c.fill();c.strokeStyle="#9b8058";c.beginPath();c.moveTo(5,5);c.lineTo(13,5);c.moveTo(5,8);c.lineTo(11,8);c.stroke();t.refresh();}
  if(!scene.textures.exists("act1-watch-cache")){const t=scene.textures.createCanvas("act1-watch-cache",19,15)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#5c402c";c.fillRect(2,6,15,8);c.fillStyle="#8a6242";c.fillRect(3,4,13,4);c.strokeStyle="#d4af5a";c.strokeRect(3,5,13,8);t.refresh();}
  if(!scene.textures.exists("act1-reflection-point")){const t=scene.textures.createCanvas("act1-reflection-point",16,16)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="rgba(196,252,245,.2)";c.beginPath();c.arc(8,8,6,0,Math.PI*2);c.fill();c.fillStyle="#e9fff8";c.fillRect(7,2,2,12);c.fillRect(2,7,12,2);t.refresh();}
  if(!scene.textures.exists("act1-rabbit")){const t=scene.textures.createCanvas("act1-rabbit",18,14)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#b89a78";c.fillRect(5,6,9,6);c.fillRect(12,4,4,5);c.fillRect(13,0,2,5);c.fillRect(10,1,2,4);c.fillStyle="#f3e0c8";c.fillRect(3,8,3,3);c.fillStyle="#2b2521";c.fillRect(14,5,1,1);t.refresh();}
  if(!scene.textures.exists("act1-bird")){const t=scene.textures.createCanvas("act1-bird",18,12)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#d8c394";c.beginPath();c.ellipse(9,7,5,3,0,0,Math.PI*2);c.fill();c.fillStyle="#7d6c58";c.beginPath();c.moveTo(7,6);c.lineTo(2,2);c.lineTo(6,8);c.closePath();c.fill();c.fillStyle="#e5ad52";c.fillRect(14,6,3,1);t.refresh();}
  if(!scene.textures.exists("act1-frog")){const t=scene.textures.createCanvas("act1-frog",16,12)!;const c=t.getContext();c.imageSmoothingEnabled=false;c.fillStyle="#6f9657";c.fillRect(4,5,8,5);c.fillRect(2,8,4,2);c.fillRect(10,8,4,2);c.fillStyle="#d7e9b8";c.fillRect(5,6,6,2);c.fillStyle="#1f2a1c";c.fillRect(5,4,1,1);c.fillRect(10,4,1,1);t.refresh();}
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
  for(let p=0;p<world.length-1;p++){const [ax,ay]=world[p]!,[bx,by]=world[p+1]!;const steps=Math.max(1,Math.ceil(Phaser.Math.Distance.Between(ax,ay,bx,by)/28));for(let i=0;i<=steps;i++){const x=Phaser.Math.Linear(ax,bx,i/steps),y=Phaser.Math.Linear(ay,by,i/steps),tx=Math.floor(x/32),ty=Math.floor(y/32);for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){const tile=scene.layer.getTileAt?.(tx+ox,ty+oy);if(tile&&tile.index!==T.WATER&&Math.abs(ox)+Math.abs(oy)<2)scene.layer.putTileAt(T.PATH,tx+ox,ty+oy);}}} scene.layer.setCollision?.([T.WALL,T.HEDGE,T.VOID,T.WATER]);
}

function spawnTidePool(scene:SceneLike){const x=Number(scene.wx?.(21)??672),y=Number(scene.wy?.(14)??448);clearTrees(scene,x,y,118);paintApproach(scene,[[17,19],[19,17],[21,14]]);const pool=track(scene.add.image(x,y,makeTidePoolTexture(scene)).setDepth(4));pool.setData("explorationName","Whispering Tide Pool");const marker=track(scene.add.sprite(x+9,y+8,"act1-reflection-point").setDepth(13).setAlpha(.78));scene.tweens.add({targets:marker,alpha:{from:.32,to:.9},scale:{from:.84,to:1.02},duration:1150,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});scene.interactables.push({obj:marker,kind:"act1-tide-pool",id:"whispering-tide",label:"Look into the still water",radius:66,enabled:true});for(let i=0;i<4;i++){const f=track(scene.add.circle(x+Phaser.Math.Between(-42,42),y+Phaser.Math.Between(-25,24),1.2,i%2?0xffefaa:0xc8fff1,.7).setDepth(12));scene.tweens.add({targets:f,x:f.x+Phaser.Math.Between(-8,8),y:f.y+Phaser.Math.Between(-8,8),alpha:{from:.18,to:.85},duration:Phaser.Math.Between(1300,2200),yoyo:true,repeat:-1,delay:i*120,ease:"Sine.easeInOut"});}}

function addInvisibleBlocker(scene:SceneLike,x:number,y:number,sx:number,sy:number){if(!scene.solidDecor)return;const b=track(scene.solidDecor.create(x,y,"block") as Phaser.Physics.Arcade.Sprite);b.setVisible(false).setAlpha(.001).setScale(sx,sy);(b as any).refreshBody?.();}

function spawnRiverWatch(scene:SceneLike){const x=Number(scene.wx?.(78)??2496),y=Number(scene.wy?.(77)??2464);clearTrees(scene,x,y,132);paintApproach(scene,[[73,70],[75,73],[77,75],[78,77]]);const watch=track(scene.add.image(x,y,makeWatchTexture(scene)).setDepth(scene.dsort?.(y+20)??11));watch.setData("explorationName","Abandoned River Watch");addInvisibleBlocker(scene,x,y+22,1.0,.3);const note=track(scene.add.sprite(x+2,y+12,"act1-watch-note").setDepth(Number(watch.depth??11)+2));scene.interactables.push({obj:note,kind:"act1-river-watch-note",id:"river-watch-note",label:"Read the weathered note",radius:62,enabled:true});scene.tweens.add({targets:note,y:note.y-1,duration:1600,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});if(!seen(CACHE_KEY)){const cache=track(scene.add.sprite(x-25,y+24,"act1-watch-cache").setDepth(Number(watch.depth??11)+2));scene.interactables.push({obj:cache,kind:"act1-river-watch-cache",id:"river-watch-cache",label:"Inspect the tucked-away cache",radius:58,enabled:true});scene.tweens.add({targets:cache,alpha:{from:.72,to:1},duration:1250,yoyo:true,repeat:-1});}}

function reactionKey(id:string){return `${REACTION_PREFIX}${id}`;}
function oneTimeReaction(scene:SceneLike,id:string,line:string){const key=reactionKey(id);if(seen(key))return;mark(key);scene.game?.events?.emit?.("quest:toast",`Maria: “${line}”`);}

function addMicro(scene:SceneLike,x:number,y:number,kind:string,label?:string){const d=track(scene.add.container(x,y).setDepth(scene.dsort?.(y)??8));d.setData("micro-kind",kind);if(label)scene.interactables.push({obj:d,kind:"act1-micro",id:kind,label,radius:60,enabled:true});return d;}
function drawMicroDiscoveries(scene:SceneLike){
  const p1=[Number(scene.wx?.(31)??992),Number(scene.wy?.(22)??704)] as [number,number];const picnic=addMicro(scene,p1[0],p1[1],"picnic","Look at the abandoned picnic");picnic.add([track(scene.add.rectangle(-5,4,34,20,0x9d4d5c,.9).setAngle(-5)),track(scene.add.circle(10,-3,5,0xe1cf9b,1)),track(scene.add.rectangle(-16,-6,10,5,0x6b4d34,1).setAngle(12))]);
  const p2=[Number(scene.wx?.(43)??1376),Number(scene.wy?.(18)??576)] as [number,number];const carved=addMicro(scene,p2[0],p2[1],"carved-initials","Read the initials carved into the bark");carved.add([track(scene.add.rectangle(0,0,13,29,0x6b4a32,1)),track(scene.add.text(0,-2,"A + M",{fontFamily:"Georgia,serif",fontSize:"5px",color:"#f1d7a3"}).setOrigin(.5))]);
  const p3=[Number(scene.wx?.(13)??416),Number(scene.wy?.(35)??1120)] as [number,number];const crown=addMicro(scene,p3[0],p3[1],"flower-crown");for(let i=0;i<8;i++){const a=i/8*Math.PI*2;crown.add(track(scene.add.circle(Math.cos(a)*9,Math.sin(a)*4,2,i%2?0xf4b7c8:0xfff3dc,1)));}
  const p4=[Number(scene.wx?.(28)??896),Number(scene.wy?.(42)??1344)] as [number,number];const pack=addMicro(scene,p4[0],p4[1],"traveler-pack","Inspect the abandoned traveler pack");pack.add([track(scene.add.rectangle(0,2,18,14,0x69503d,1).setAngle(-7)),track(scene.add.rectangle(0,-5,12,5,0x8d6a4c,1).setAngle(-7)),track(scene.add.line(0,0,-8,8,8,-6,0xb79a6a,1).setLineWidth(2))]);
  const p5=[Number(scene.wx?.(54)??1728),Number(scene.wy?.(31)??992)] as [number,number];const bottle=addMicro(scene,p5[0],p5[1],"washed-bottle");bottle.add([track(scene.add.rectangle(0,0,5,15,0x8bc5b5,.7).setAngle(64)),track(scene.add.rectangle(7,-5,4,3,0xc6a77a,1).setAngle(64))]);
  const p6=[Number(scene.wx?.(64)??2048),Number(scene.wy?.(48)??1536)] as [number,number];const ribbon=addMicro(scene,p6[0],p6[1],"memorial-ribbon");ribbon.add([track(scene.add.rectangle(0,4,4,25,0x66513b,1)),track(scene.add.line(5,-5,0,0,14,8,0xb35d6b,1).setLineWidth(3))]);scene.tweens.add({targets:ribbon.list[1],angle:{from:-5,to:8},duration:1400,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
}

function spawnWildlife(scene:SceneLike){
  const rabbit=track(scene.add.sprite(Number(scene.wx?.(37)??1184),Number(scene.wy?.(29)??928),"act1-rabbit").setDepth(12));rabbit.setData("wildlife","rabbit");
  const birds=[[24,25],[58,21],[70,57]] as [number,number][];birds.forEach(([tx,ty],i)=>{const b=track(scene.add.sprite(Number(scene.wx?.(tx)??tx*32),Number(scene.wy?.(ty)??ty*32),"act1-bird").setDepth(12).setFlipX(i%2===1));b.setData("wildlife","bird");});
  const frog=track(scene.add.sprite(Number(scene.wx?.(22)??704),Number(scene.wy?.(15)??480),"act1-frog").setDepth(12));frog.setData("wildlife","frog");
  scene.__act1Wildlife={rabbit,birds:(scene.children.list??[]).filter((o:any)=>o?.getData?.("wildlife")==="bird"),frog};
}

function updateWildlife(scene:SceneLike){if(!scene.player?.active||!scene.__act1Wildlife)return;const w=scene.__act1Wildlife;const flee=(obj:any,dist:number,dx:number,dy:number)=>{if(!obj?.active||obj.getData?.("fled"))return;if(Phaser.Math.Distance.Between(scene.player.x,scene.player.y,obj.x,obj.y)>dist)return;obj.setData?.("fled",true);scene.tweens.add({targets:obj,x:obj.x+dx,y:obj.y+dy,alpha:0,duration:500,ease:"Quad.easeIn",onComplete:()=>obj.destroy?.()});};flee(w.rabbit,78,85,-38);for(const b of w.birds??[])flee(b,72,Phaser.Math.Between(-55,55),-78);if(w.frog?.active&&!w.frog.getData?.("fled")&&Phaser.Math.Distance.Between(scene.player.x,scene.player.y,w.frog.x,w.frog.y)<64){w.frog.setData("fled",true);scene.tweens.add({targets:w.frog,x:w.frog.x+18,y:w.frog.y+18,scale:{from:1,to:.5},alpha:0,duration:380,ease:"Quad.easeIn",onComplete:()=>w.frog.destroy?.()});}}

function updateAmbientReactions(scene:SceneLike){if(!scene.player?.active)return;const checks=[
  ["river-edge",60,50,90,"The river sounds different here... heavier."],
  ["quiet-flowers",15,36,72,"Someone took care of these once."],
  ["old-road",47,43,78,"So many people must have walked this road before me."],
] as const;for(const [id,tx,ty,r,line] of checks){if(seen(reactionKey(id)))continue;const x=Number(scene.wx?.(tx)??tx*32),y=Number(scene.wy?.(ty)??ty*32);if(Phaser.Math.Distance.Between(scene.player.x,scene.player.y,x,y)<r){oneTimeReaction(scene,id,line);break;}}}

function healOne(scene:SceneLike){if(!scene.save)return false;const current=Number(scene.save.player_health??0),max=Math.max(1,Number(scene.getMaxHealth?.()??scene.maxHealth??5));if(current>=max)return false;scene.save.player_health=Math.min(max,current+1);scene.emitSave?.();scene.pushHud?.(true);scene.spawnSparkle?.(scene.player?.x??0,scene.player?.y??0,0xffe6a4,10);return true;}

function interactTide(scene:SceneLike){const first=!seen(TIDE_KEY);if(first)mark(TIDE_KEY);const healed=first?healOne(scene):false;scene.openModal?.({type:"info",title:"The Whispering Tide Pool",body:first?`Maria kneels beside the glass-still water. “Still water carries the things the river forgets.”${healed?" The quiet returns one heart of strength.":" The quiet settles around her, gentle and complete."}`:"The little pool holds the sky without disturbing it. Maria stays for one quiet moment."});}
function interactWatch(scene:SceneLike){if(!seen(WATCH_KEY))mark(WATCH_KEY);scene.openModal?.({type:"info",title:"Weathered River Watch Note",body:"The current grows meaner near the Warden. Don't fight the river. Watch where it wants to go, then move with it. The survivors went southeast — to the Last Crossing."});}
function interactCache(scene:SceneLike,it:any){if(seen(CACHE_KEY))return;mark(CACHE_KEY);const healed=healOne(scene);scene.tweens?.killTweensOf?.(it.obj);it.obj?.destroy?.();scene.interactables=(scene.interactables??[]).filter((x:any)=>x!==it);scene.openModal?.({type:"info",title:"A Tucked-Away Cache",body:healed?"Under a loose plank, Maria finds a tiny sealed honey tonic. One heart is restored.":"Under a loose plank is a tiny honey tonic and a faded ribbon. Maria leaves the tonic for whoever needs it next."});}
function interactMicro(scene:SceneLike,it:any){const id=String(it.id??"");const text:Record<string,string>={picnic:"Two cups. One blanket. Whoever sat here expected to come back.","carved-initials":"A + M. The letters are old, but someone carved them carefully.","traveler-pack":"The straps are torn and the pack is empty. Someone left in a hurry."};const line=text[id];if(line)oneTimeReaction(scene,`micro-${id}`,line);}

function spawnExploration(scene:SceneLike){cleanup(scene);if(!isAct1(scene))return;makeSmallTextures(scene);decorateWaterfallEnvelope(scene);spawnTidePool(scene);spawnRiverWatch(scene);drawMicroDiscoveries(scene);spawnWildlife(scene);}
function cleanupEnvelopeDecor(scene:SceneLike){for(const child of [...(scene.children?.list??[])]){const obj=child as any;if(!obj?.getData?.(ENVELOPE_DECOR))continue;scene.tweens?.killTweensOf?.(obj);obj.destroy?.();}}

export function installAct1ExplorationArt(QuestScene:SceneCtor){
  const proto=QuestScene.prototype;if(proto.__act1ExplorationArtInstalled)return;proto.__act1ExplorationArtInstalled=true;
  const originalCreate=proto.create;proto.create=function act1ExplorationCreate(this:SceneLike,...args:any[]){const result=originalCreate.apply(this,args);this.time.delayedCall(140,()=>spawnExploration(this));return result;};
  const originalBuildAct1=proto.buildAct1;proto.buildAct1=function act1ExplorationBuild(this:SceneLike,...args:any[]){const result=originalBuildAct1.apply(this,args);this.time.delayedCall(80,()=>spawnExploration(this));return result;};
  const originalInteract=proto.interact;proto.interact=function act1ExplorationInteract(this:SceneLike,...args:any[]){if(this.frozen)return;const it=this.nearest?.();if(it?.kind==="act1-tide-pool"){interactTide(this);return;}if(it?.kind==="act1-river-watch-note"){interactWatch(this);return;}if(it?.kind==="act1-river-watch-cache"){interactCache(this,it);return;}if(it?.kind==="act1-micro"){interactMicro(this,it);return;}const wasWaterfall=it?.kind==="envelope"&&it?.id==="waterfall";const result=originalInteract.apply(this,args);if(wasWaterfall)this.time.delayedCall(20,()=>cleanupEnvelopeDecor(this));return result;};
  const originalUpdate=proto.update;proto.update=function act1ExplorationUpdate(this:SceneLike,time:number,delta:number,...args:any[]){const result=originalUpdate.call(this,time,delta,...args);if(isAct1(this)&&!this.frozen){updateWildlife(this);updateAmbientReactions(this);}return result;};
}
