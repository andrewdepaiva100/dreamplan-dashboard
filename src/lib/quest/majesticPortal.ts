import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const TRACK = "majesticPortalDecor";
const NEXT_TINT: Record<string, number> = {
  sunlit_shores: 0xf4c2d9,
  wedding_garden: 0xaadff2,
  the_haven: 0xb6a6ff,
  starry_ascent: 0xffe3a5,
};

function tracked<T extends any>(obj: T): T {
  obj?.setData?.(TRACK, true);
  return obj;
}

function clearPortalDecor(scene: SceneLike) {
  for (const child of [...(scene.children?.list ?? [])]) {
    const obj = child as any;
    if (!obj?.getData?.(TRACK)) continue;
    scene.tweens?.killTweensOf?.(obj);
    obj.destroy?.();
  }
  scene.__majesticPortalDecor = undefined;
}

function ensureArchTexture(scene: SceneLike) {
  const key = "majestic-portal-arch";
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, 118, 150)!;
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, 118, 150);

  c.fillStyle = "rgba(17,14,28,.24)";
  c.beginPath(); c.ellipse(59, 137, 46, 9, 0, 0, Math.PI * 2); c.fill();

  c.strokeStyle = "#5f5b65"; c.lineWidth = 17;
  c.beginPath(); c.moveTo(20,136); c.lineTo(20,70); c.bezierCurveTo(20,23,98,23,98,70); c.lineTo(98,136); c.stroke();
  c.strokeStyle = "#aaa7ab"; c.lineWidth = 9;
  c.beginPath(); c.moveTo(20,136); c.lineTo(20,70); c.bezierCurveTo(20,29,98,29,98,70); c.lineTo(98,136); c.stroke();
  c.strokeStyle = "#ded7c7"; c.lineWidth = 3;
  c.beginPath(); c.moveTo(18,132); c.lineTo(18,70); c.bezierCurveTo(18,25,100,25,100,70); c.lineTo(100,132); c.stroke();

  c.strokeStyle = "#c7a757"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(28,126); c.lineTo(28,72); c.bezierCurveTo(28,38,90,38,90,72); c.lineTo(90,126); c.stroke();

  c.fillStyle = "#4f4a50";
  c.fillRect(7,128,28,11); c.fillRect(83,128,28,11);
  c.fillStyle = "#8c8378";
  c.fillRect(11,127,20,5); c.fillRect(87,127,20,5);
  c.fillStyle = "#d7c99f";
  c.fillRect(14,126,14,2); c.fillRect(90,126,14,2);

  const runes = [[59,37],[34,51],[84,51],[25,78],[93,78],[24,104],[94,104],[22,124],[96,124]] as const;
  for (const [x,y] of runes) {
    c.fillStyle = "#d9bd69";
    c.fillRect(x-1,y-3,2,6); c.fillRect(x-3,y-1,6,2);
    c.fillStyle = "#fff3b5"; c.fillRect(x,y-2,1,4);
  }

  c.strokeStyle = "#507554"; c.lineWidth = 2;
  c.beginPath(); c.moveTo(17,122); c.bezierCurveTo(2,102,15,80,9,62); c.moveTo(101,116); c.bezierCurveTo(113,98,102,82,109,67); c.stroke();
  c.fillStyle = "#6f9658";
  for (const [x,y,a] of [[12,103,-.4],[9,84,.5],[15,68,-.3],[104,99,.4],[109,81,-.5],[104,70,.2]] as [number,number,number][]) {
    c.save(); c.translate(x,y); c.rotate(a); c.beginPath(); c.ellipse(0,0,5,2.5,0,0,Math.PI*2); c.fill(); c.restore();
  }
  c.fillStyle = "#f0b7cb";
  c.beginPath(); c.arc(10,93,2.5,0,Math.PI*2); c.arc(108,91,2.5,0,Math.PI*2); c.fill();
  c.fillStyle = "#fff0cf";
  c.beginPath(); c.arc(15,75,2,0,Math.PI*2); c.arc(103,77,2,0,Math.PI*2); c.fill();

  tex.refresh();
  return key;
}

function decoratePortal(scene: SceneLike, reveal = false) {
  const gateway = scene.gatewayObj as Phaser.GameObjects.Sprite | undefined;
  if (!gateway?.active) return;
  clearPortalDecor(scene);
  const x = gateway.x, y = gateway.y;
  const tint = NEXT_TINT[String(scene.save?.current_zone ?? "")] ?? 0xffe4a6;
  ensureArchTexture(scene);

  gateway.setScale(1.65).setDepth(18).setTint(tint);
  scene.tweens?.killTweensOf?.(gateway);
  scene.tweens.add({targets:gateway,alpha:{from:.78,to:1},scale:{from:1.58,to:1.72},duration:1250,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

  const ground = tracked(scene.add.ellipse(x,y+32,150,52,tint,.16).setDepth(6).setBlendMode(Phaser.BlendModes.ADD));
  ground.setStrokeStyle(2,0xe8cf87,.7);
  const ground2 = tracked(scene.add.ellipse(x,y+32,116,38,0xffedba,.04).setDepth(6).setStrokeStyle(1,0xffe3a0,.5));
  const arch = tracked(scene.add.sprite(x,y-28,"majestic-portal-arch").setDepth(17).setScale(1.17));
  const innerGlow = tracked(scene.add.ellipse(x,y-31,70,112,tint,.18).setDepth(16).setBlendMode(Phaser.BlendModes.ADD));
  const core = tracked(scene.add.ellipse(x,y-31,48,94,tint,.22).setDepth(16).setBlendMode(Phaser.BlendModes.ADD));
  const halo = tracked(scene.add.sprite(x,y-30,"glow").setDepth(15).setScale(7).setTint(tint).setAlpha(.28).setBlendMode(Phaser.BlendModes.ADD));

  scene.tweens.add({targets:[innerGlow,core],alpha:"+=.16",scaleX:"+=.06",duration:1100,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  scene.tweens.add({targets:halo,scale:{from:6.6,to:8.1},alpha:{from:.17,to:.34},duration:1900,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  scene.tweens.add({targets:[ground,ground2],scaleX:{from:.93,to:1.06},alpha:"-=.05",duration:1700,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});

  const orbiters: Phaser.GameObjects.Sprite[] = [];
  for (let i=0;i<8;i++) {
    const a = i/8*Math.PI*2;
    const s = tracked(scene.add.sprite(x+Math.cos(a)*52,y-30+Math.sin(a)*38,"spark").setTint(i%2?tint:0xffe5a1).setScale(.8+(i%3)*.18).setAlpha(.72).setDepth(19).setBlendMode(Phaser.BlendModes.ADD));
    s.setData("portal-orbit",{a,r:52+(i%2)*8,ry:36+(i%3)*3,speed:.00042+(i%3)*.00008});
    orbiters.push(s);
  }

  const flowers: Phaser.GameObjects.Sprite[] = [];
  for (let i=0;i<7;i++) {
    const side=i<4?-1:1;
    const fx=x+side*(45+(i%4)*9), fy=y+31-(i%3)*3;
    const f=tracked(scene.add.sprite(fx,fy,"flowers").setDepth(8).setScale(.62+(i%2)*.12).setTint(i%2?0xffd8e4:0xfff0c4).setAlpha(.86));
    flowers.push(f);
  }

  const riseTimer = scene.time.addEvent({delay:360,loop:true,callback:()=>{
    if(!gateway.active){riseTimer.destroy();return;}
    const s=tracked(scene.add.sprite(x+Phaser.Math.Between(-34,34),y+24,"spark").setTint(Phaser.Math.Between(0,1)?tint:0xffe8ae).setAlpha(.8).setScale(Phaser.Math.FloatBetween(.5,1.1)).setDepth(19).setBlendMode(Phaser.BlendModes.ADD));
    scene.tweens.add({targets:s,y:y-112,x:s.x+Phaser.Math.Between(-15,15),alpha:0,scale:.2,duration:Phaser.Math.Between(1100,1700),ease:"Sine.easeOut",onComplete:()=>s.destroy()});
  }});

  scene.__majesticPortalDecor={gateway,arch,ground,ground2,innerGlow,core,halo,orbiters,flowers,riseTimer,x,y};

  if(reveal){
    arch.setAlpha(0).setScale(.88);
    innerGlow.setAlpha(0); core.setAlpha(0); halo.setAlpha(0); gateway.setAlpha(0);
    scene.cameras?.main?.flash?.(260,255,238,188);
    scene.tweens.add({targets:arch,alpha:1,scale:1.17,duration:650,ease:"Back.easeOut"});
    scene.tweens.add({targets:[innerGlow,core,halo,gateway],alpha:1,duration:620,delay:260,ease:"Sine.easeOut"});
    for(let i=0;i<3;i++) scene.time.delayedCall(280+i*150,()=>{
      const ring=tracked(scene.add.circle(x,y-28,18+i*6,tint,0).setDepth(18).setStrokeStyle(2,0xffe3a0,.82));
      scene.tweens.add({targets:ring,radius:92+i*14,alpha:0,duration:900,onComplete:()=>ring.destroy()});
    });
  }
}

function updatePortal(scene: SceneLike, time: number) {
  const d=scene.__majesticPortalDecor;
  const gateway=scene.gatewayObj as Phaser.GameObjects.Sprite|undefined;
  if(!gateway?.active){if(d)clearPortalDecor(scene);return;}
  if(!d||d.gateway!==gateway){decoratePortal(scene,false);return;}
  if(Math.abs(gateway.x-d.x)>1||Math.abs(gateway.y-d.y)>1){decoratePortal(scene,false);return;}
  for(const s of d.orbiters??[]){
    if(!s?.active)continue;
    const o=s.getData?.("portal-orbit");if(!o)continue;
    const a=o.a+time*o.speed;
    s.setPosition(gateway.x+Math.cos(a)*o.r,gateway.y-30+Math.sin(a)*o.ry);
    s.setAlpha(.5+.35*(.5+.5*Math.sin(a*2)));
  }
}

export function installMajesticPortal(QuestScene: SceneCtor) {
  const p=QuestScene.prototype;
  if(p.__majesticPortalInstalled)return;
  p.__majesticPortalInstalled=true;

  const originalSpawn=p.spawnGateway;
  p.spawnGateway=function majesticSpawnGateway(this:SceneLike,x:number,y:number,relocate=false){
    const had=Boolean(this.gatewayObj?.active);
    const result=originalSpawn.call(this,x,y,relocate);
    this.time.delayedCall(10,()=>decoratePortal(this,!had));
    return result;
  };

  const originalUpdate=p.update;
  p.update=function majesticPortalUpdate(this:SceneLike,time:number,delta:number,...args:any[]){
    const result=originalUpdate.call(this,time,delta,...args);
    updatePortal(this,time);
    return result;
  };

  const originalCreate=p.create;
  p.create=function majesticPortalCreate(this:SceneLike,...args:any[]){
    const result=originalCreate.apply(this,args);
    this.time.delayedCall(120,()=>decoratePortal(this,false));
    return result;
  };
}
