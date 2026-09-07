// @ts-nocheck -- Act II seasonal mini-challenges + visible restoration payoff.
// Isolated decorator: existing Seasonal Keys remain the authoritative 0/4 progression.

const ZONE = "wedding_garden";
const SEASONS = ["Spring", "Summer", "Autumn", "Winter"] as const;
const TINTS: Record<string, number> = { Spring: 0xa9ef8c, Summer: 0xffcf62, Autumn: 0xd88945, Winter: 0xc9e4ff };
const SPOTS: Record<string, [number, number]> = { Spring:[18,18], Summer:[96,18], Autumn:[18,82], Winter:[96,82] };
const REQUIRED = 3;

function state(scene:any) {
  scene.zoneState["seasonChallenges"] ??= { Spring:0, Summer:0, Autumn:0, Winter:0 };
  return scene.zoneState["seasonChallenges"];
}
function done(scene:any, season:string) { return Number(state(scene)[season] ?? 0) >= REQUIRED; }
function seasonKey(scene:any, season:string) {
  return (scene.interactables ?? []).find((it:any)=>it?.enabled && it.kind === "season-key" && it.id === season);
}
function decor(scene:any,key:string,tx:number,ty:number,tint:number,scale=.7,alpha=.95) {
  if(!scene.textures?.exists?.(key)) return null;
  const y=scene.wy(ty);
  const s=scene.add.sprite(scene.wx(tx),y,key).setTint(tint).setScale(scale).setAlpha(alpha).setDepth(scene.dsort?.(y+8)??6);
  s.setData?.("act2-restoration",true); return s;
}
function challenge(scene:any, season:string, tx:number,ty:number,texture:string,label:string,id:string) {
  if(!scene.textures?.exists?.(texture)) texture="flowers";
  const it=scene.addInteractable(scene.wx(tx),scene.wy(ty),texture,"season-challenge",label,{id:`${season}:${id}`,radius:72});
  it.data={season,challengeId:id};
  it.obj.setTint?.(TINTS[season]).setAlpha?.(.78).setScale?.(.82);
  return it;
}
function setKeyLockedVisual(scene:any,season:string) {
  const key=seasonKey(scene,season); if(!key) return;
  if(done(scene,season)) { key.obj.clearTint?.(); key.obj.setAlpha?.(1); key.label=`Open ${season} Key`; }
  else { key.obj.setTint?.(0x718096).setAlpha?.(.62); key.label=`Restore ${season} before opening the Key`; }
}
function addChallenges(scene:any) {
  state(scene);
  // Spring: wake three dormant beds.
  challenge(scene,"Spring",11,22,"flowers","Wake the dormant Spring bed","bed-a");
  challenge(scene,"Spring",18,27,"flowers","Wake the dormant Spring bed","bed-b");
  challenge(scene,"Spring",26,22,"flowers","Wake the dormant Spring bed","bed-c");
  // Summer: three bramble hearts. They read as a compact clearing task while reusing authored garden foliage.
  challenge(scene,"Summer",88,22,"tree","Clear the Summer brambles","bramble-a");
  challenge(scene,"Summer",97,27,"tree","Clear the Summer brambles","bramble-b");
  challenge(scene,"Summer",105,22,"tree","Clear the Summer brambles","bramble-c");
  // Autumn: release three old-growth markers.
  challenge(scene,"Autumn",11,77,"flowers","Release the old Autumn growth","release-a");
  challenge(scene,"Autumn",18,72,"flowers","Release the old Autumn growth","release-b");
  challenge(scene,"Autumn",26,77,"flowers","Release the old Autumn growth","release-c");
  // Winter: relight three cold garden lamps.
  challenge(scene,"Winter",88,77,"lamp","Relight the Winter lantern","lamp-a");
  challenge(scene,"Winter",97,72,"lamp","Relight the Winter lantern","lamp-b");
  challenge(scene,"Winter",105,77,"lamp","Relight the Winter lantern","lamp-c");
  SEASONS.forEach(s=>setKeyLockedVisual(scene,s));
}
function restoreChallengePiece(scene:any,it:any) {
  const season=it.data?.season ?? String(it.id??"").split(":")[0];
  if(!SEASONS.includes(season)) return;
  const st=state(scene); st[season]=Math.min(REQUIRED,Number(st[season]??0)+1);
  const n=st[season]; const x=it.obj.x,y=it.obj.y;
  scene.removeInteractable?.(it);
  scene.spawnSparkle?.(x,y,TINTS[season],10);
  if(season==="Spring") decor(scene,"flowers",scene.sx?x/(scene.wx(1)-scene.wx(0)):18,18,TINTS.Spring,.85);
  if(season==="Summer") decor(scene,"flowers",SPOTS.Summer[0]+(n-2)*4,SPOTS.Summer[1]+6,0xffd36b,.82);
  if(season==="Autumn") decor(scene,"flowers",SPOTS.Autumn[0]+(n-2)*4,SPOTS.Autumn[1]-5,0xc7763d,.72,.8);
  if(season==="Winter") decor(scene,"lamp",SPOTS.Winter[0]+(n-2)*5,SPOTS.Winter[1]-6,0xffe5a3,.78);
  if(n<REQUIRED) {
    const verbs={Spring:"flower beds awake",Summer:"bramble hearts cleared",Autumn:"old growth released",Winter:"lanterns relit"};
    scene.objective=`Restore ${season} — ${n}/${REQUIRED} ${verbs[season]}.`;
    scene.emitToast?.(`${season}: ${n}/${REQUIRED}.`);
  } else {
    setKeyLockedVisual(scene,season);
    scene.objective=`${season} is restored — open the ${season} Seasonal Key.`;
    scene.emitToast?.(`${season} answers. Its Seasonal Key is ready.`);
    scene.cameras?.main?.flash?.(180,...(season==="Winter"?[220,240,255]:[255,238,188]));
  }
  scene.pushHud?.(true);
}

function addFountainLayer(scene:any,season:string,index:number) {
  scene.__act2FountainLayers ??= {};
  if(scene.__act2FountainLayers[season]) return;
  const angles=[[-9,-5],[9,-5],[-9,7],[9,7]]; const [dx,dy]=angles[index]??[0,0];
  const key=season==="Winter"?"spark":"flowers";
  const s=decor(scene,key,66+dx,54+dy,TINTS[season],season==="Winter"?.7:.64,.9);
  if(s) scene.__act2FountainLayers[season]=s;
}
function wakeConservatory(scene:any,count:number) {
  scene.__act2ConservatoryWake ??=[];
  while(scene.__act2ConservatoryWake.length<count) {
    const i=scene.__act2ConservatoryWake.length;
    const pts:[[number,number],[number,number],[number,number],[number,number]]=[[113,45],[121,40],[128,45],[121,57]] as any;
    const [x,y]=pts[i];
    const s=decor(scene,i===3?"flowers":"lamp",x,y,TINTS[SEASONS[i]],i===3?.72:.6,.38+i*.13);
    if(s) scene.__act2ConservatoryWake.push(s); else break;
  }
}
function applyRestoration(scene:any,season:string) {
  scene.__act2Restored ??={}; if(scene.__act2Restored[season]) return;
  scene.__act2Restored[season]=true;
  const [x,y]=SPOTS[season]; const tint=TINTS[season];
  const offsets=[[-8,0],[-5,6],[0,8],[6,5],[8,-1],[3,-7],[-4,-6]];
  offsets.forEach(([dx,dy],i)=>decor(scene,i===5?"tree":"flowers",x+dx,y+dy,tint,i===5?.78:.62+(i%2)*.1,.88));
  const index=SEASONS.indexOf(season as any); addFountainLayer(scene,season,index);
  const count=Object.keys(scene.__act2Restored).length; wakeConservatory(scene,count);
  scene.spawnSparkle?.(scene.wx(x),scene.wy(y),tint,18);
  if(count===4) {
    scene.spawnSparkle?.(scene.wx(66),scene.wy(54),0xffe9a8,28);
    scene.emitToast?.("The Wedding Garden breathes in all four seasons again.");
  } else scene.emitToast?.(`${season} settles back into the Wedding Garden.`);
}

export function installAct2SeasonChallenges(QuestScene:any) {
  const proto=QuestScene?.prototype; if(!proto||proto.__act2SeasonChallengesInstalled) return;
  proto.__act2SeasonChallengesInstalled=true;
  const originalBuild=proto.buildAct2;
  proto.buildAct2=function(...args:any[]){ const result=originalBuild.apply(this,args); addChallenges(this); return result; };
  const originalInteract=proto.interact;
  proto.interact=function(...args:any[]){
    if(this.save?.current_zone!==ZONE) return originalInteract.apply(this,args);
    const nearest=this.nearest?.();
    if(nearest?.kind==="season-challenge") { restoreChallengePiece(this,nearest); return; }
    if(nearest?.kind==="season-key" && SEASONS.includes(nearest.id) && !done(this,nearest.id)) {
      const n=Number(state(this)[nearest.id]??0);
      this.objective=`Restore ${nearest.id} before opening its Seasonal Key — ${n}/${REQUIRED}.`;
      this.emitToast?.(`${nearest.id}'s Key is sleeping. Complete this corner first (${n}/${REQUIRED}).`);
      this.pushHud?.(true); return;
    }
    const before=Number(this.zoneState?.["keysFound"]??0); const id=nearest?.kind==="season-key"?nearest.id:null;
    const result=originalInteract.apply(this,args); const after=Number(this.zoneState?.["keysFound"]??0);
    if(id && after>before) applyRestoration(this,id);
    return result;
  };
}
