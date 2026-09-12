// @ts-nocheck -- Standalone cinematic interlude between Act IV and Act V.
import * as Phaser from "phaser";
import { EV } from "./events";
import { buildSprites, preloadQuestArt } from "./textures";

export const MEMORY_WALK_SCENE_KEY = "memory-walk";
export const MEMORY_WALK_SAVE_ID = "memory_walk";
export const MEMORY_WALK_TITLE = "Memory Walk";

const ACT5 = "cathedral";
const WORLD_W = 2820;
const WORLD_H = 680;
const WALK_Y = 548;
const PATH_TOP = 500;
const MARIA_SCALE = 1.357;
const WALK_SPEED = 86.4;
const MEMORY_CENTERS = [470, 980, 1490, 2000] as const;
const REMINISCENCES = [
  "I remember thinking the road ahead was endless.",
  "This was when love started to feel like home.",
  "Andrew… I remember looking at you here and realizing I didn’t need to know where the road ended anymore.",
  "I was afraid… but I kept climbing.",
  "Every road. Every promise. Everyone I carried with me… Everything brought me here.",
];

type MemoryTheme = "shore" | "garden" | "haven" | "stars";
type MemoryGroup = {
  root: Phaser.GameObjects.Container;
  centerX: number;
  tint: number;
  theme: MemoryTheme;
  pulse: Phaser.GameObjects.Ellipse;
};

export class MemoryWalkScene extends Phaser.Scene {
  save: any;
  maria!: Phaser.GameObjects.Sprite;
  butterfly: Phaser.GameObjects.Sprite | null = null;
  stick = { x: 0, y: 0 };
  exiting = false;
  memories: MemoryGroup[] = [];
  titleCard!: Phaser.GameObjects.Container;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private walkFrame = 0;
  private lastWalkFrameAt = 0;
  private lastFootGlowAt = 0;
  private lastButterflyTrailAt = 0;
  private lastPocketParticleAt = 0;
  private memoryAudio: AudioContext | null = null;
  private memoryMusicStop: (() => void) | null = null;
  private cathedralSwelled = false;
  private focusMemory = -1;
  private reminiscenceShown = new Set<number>();
  private motifPlayed = new Set<number>();
  private pausePlayed = new Set<number>();
  private reminiscenceBubble: Phaser.GameObjects.Container | null = null;
  private worldVeil!: Phaser.GameObjects.Rectangle;
  private goldRoad!: Phaser.GameObjects.Rectangle;
  private cathedralRoot!: Phaser.GameObjects.Container;
  private cathedralTitle!: Phaser.GameObjects.Container;
  private act4Pillars: Phaser.GameObjects.Sprite[] = [];
  private pauseUntil = 0;

  constructor() { super(MEMORY_WALK_SCENE_KEY); }
  init(data: { save?: any }) { this.save = data?.save; }
  preload() { preloadQuestArt(this); }

  create() {
    try {
      buildSprites(this);
      if (!this.save) throw new Error("Memory Walk opened without a save");
      this.save.current_zone = MEMORY_WALK_SAVE_ID;
      this.game.events.emit(EV.save, { ...this.save });
      this.game.events.emit(EV.hud, null);
      this.game.events.emit(EV.music, "home");
      this.game.events.emit(EV.act, { title: "MEMORY WALK · BETWEEN ACT IV & ACT V" });
      this.buildMemoryWalk();
      this.startMemoryWalkMusic();
    } catch (err) {
      console.warn?.("[quest] Memory Walk setup failed; continuing safely to Act V", err);
      this.finishToCathedral();
    }
  }

  private buildMemoryWalk() {
    this.cameras.main.setBackgroundColor("#080b1a");
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    const bg = this.add.graphics().setDepth(0);
    bg.fillGradientStyle(0x060916, 0x0b1632, 0x24193e, 0x170f20, 1);
    bg.fillRect(0, 0, WORLD_W, WORLD_H);

    const moods = this.add.graphics().setDepth(0);
    [[160,0xffc66e],[720,0xff8fbd],[1240,0xe5aa63],[1760,0x799cff],[2360,0xffd680]].forEach(([x,tint], i) => {
      moods.fillStyle(tint, i === 4 ? 0.045 : 0.035);
      moods.fillEllipse(x, 300, 760, 520);
    });

    const hazeBack = this.add.graphics().setDepth(0).setScrollFactor(0.82,1);
    for (let i=0;i<8;i++) {
      const x=210+i*405;
      const tint=i>=6?0xffd792:i%2?0x7967b4:0x6d8bc4;
      hazeBack.fillStyle(tint,0.025+(i%3)*0.01);
      hazeBack.fillEllipse(x,250+(i%2)*35,420,210);
    }

    for (let i=0;i<175;i++) {
      const x=22+((i*197)%(WORLD_W-44));
      const y=18+((i*83)%455);
      const r=i%13===0?2.4:i%4===0?1.45:0.8;
      const tint=x>2240?0xffe2a0:i%5===0?0xc8ddff:0xffffff;
      const star=this.add.circle(x,y,r,tint,i%4===0?0.76:0.44).setDepth(1);
      if(i%11===0)this.tweens.add({targets:star,alpha:{from:0.18,to:0.92},scale:{from:0.72,to:1.35},duration:1450+(i%6)*190,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    }

    const pathGlow=this.add.graphics().setDepth(2);
    pathGlow.fillStyle(0x8fa9ff,0.07);pathGlow.fillRoundedRect(-20,PATH_TOP-12,WORLD_W+40,142,54);
    pathGlow.fillStyle(0xdce7ff,0.09);pathGlow.fillRoundedRect(-8,PATH_TOP-4,WORLD_W+16,126,50);
    const path=this.add.graphics().setDepth(3);
    path.fillGradientStyle(0x7188bd,0xaec2ec,0x34466e,0x596f9e,0.94);
    path.fillRoundedRect(0,PATH_TOP,WORLD_W,112,44);
    path.fillStyle(0xf9f4e6,0.12);path.fillRoundedRect(18,PATH_TOP+17,WORLD_W-36,76,34);
    path.lineStyle(2,0xe8efff,0.45);path.strokeRoundedRect(0,PATH_TOP,WORLD_W,112,44);

    this.goldRoad=this.add.rectangle(2390,PATH_TOP+56,860,104,0xffd98a,0).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);
    this.add.rectangle(WORLD_W/2,PATH_TOP+83,WORLD_W-90,2,0xf7f1dc,0.22).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);

    this.addOpeningTitle();
    this.memories.push(this.addMemory(470,"ACT I","Sunlit Shores",0xffd48a,"landmark-temple",["tree","fountain"],"Every beginning is a promise we do not yet know we are making.","shore"));
    this.memories.push(this.addMemory(980,"ACT II","Wedding Garden",0xff9fca,"landmark-conservatory",["flowers","arbor"],"Love does not bloom once. It chooses every season.","garden"));
    this.memories.push(this.addMemory(1490,"ACT III","The Haven",0xf1c27f,"landmark-townhall",["house","lamp"],"Home is not where the road ends. It is who waits there with you.","haven"));
    this.memories.push(this.addMemory(2000,"ACT IV","Starry Ascent",0x9ab7ff,"landmark-observatory",["pillar","adriel"],"Some climbs change the view. Others change the heart.","stars"));
    this.addHavenPresence(1490);
    this.addAct4Pillars(2000);
    this.addCathedralReveal();

    const foreground=this.add.graphics().setDepth(28).setScrollFactor(1.035,1);
    foreground.fillStyle(0x050711,0.44);
    for(let i=0;i<18;i++){const x=20+i*165;foreground.fillEllipse(x,PATH_TOP+111,95,18+(i%4)*6);}

    this.maria=this.add.sprite(110,WALK_Y,"maria-side-0").setDepth(40).setScale(MARIA_SCALE);
    this.cameras.main.startFollow(this.maria,true,0.075,0.075,-118,22);
    this.cameras.main.setDeadzone(220,120);

    this.worldVeil=this.add.rectangle(0,0,2400,1400,0x03040c,0.05).setOrigin(0).setScrollFactor(0).setDepth(35);
    this.worldVeil.setInteractive(false);

    this.cursors=this.input.keyboard!.createCursorKeys();
    this.keyA=this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD=this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.game.events.on(EV.stick,this.onStick,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.game.events.off(EV.stick,this.onStick,this);
      this.stopMemoryWalkMusic();
    });
    this.cameras.main.fadeIn(1000,5,8,23);
  }

  private addOpeningTitle(){
    const root=this.add.container(160,204).setDepth(30);
    const glow=this.add.rectangle(250,0,530,190,0x7e8cff,0.035).setBlendMode(Phaser.BlendModes.ADD);
    const veil=this.add.rectangle(0,0,510,178,0x050817,0.44).setOrigin(0,0.5).setStrokeStyle(1,0xd9e3ff,0.12);
    const small=this.add.text(14,-52,"BETWEEN ACT IV & ACT V",{fontFamily:"system-ui, sans-serif",fontSize:"12px",fontStyle:"bold",color:"#d9e3ff",letterSpacing:4});
    const title=this.add.text(10,-18,"MEMORY WALK",{fontFamily:"Georgia, serif",fontSize:"38px",color:"#ffe7ae",stroke:"#080b1c",strokeThickness:6,letterSpacing:5});
    const sub=this.add.text(14,39,"Walk forward. Let every chapter pass beside you.",{fontFamily:"Georgia, serif",fontSize:"14px",fontStyle:"italic",color:"#f0f2ff"});
    root.add([glow,veil,small,title,sub]);
    this.tweens.add({targets:glow,alpha:{from:0.02,to:0.07},duration:2200,yoyo:true,repeat:-1});
    this.titleCard=root;
  }

  private addMemory(x:number,act:string,title:string,tint:number,landmarkKey:string,accents:string[],quote:string,theme:MemoryTheme):MemoryGroup{
    const root=this.add.container(x,0).setDepth(7);
    const beam=this.add.rectangle(0,320,150,300,tint,0.018).setAngle(theme==="garden"?-4:theme==="stars"?4:0).setBlendMode(Phaser.BlendModes.ADD);
    const outerGlow=this.add.ellipse(0,334,460,318,tint,0.07).setBlendMode(Phaser.BlendModes.ADD);
    const innerGlow=this.add.ellipse(0,344,326,232,tint,0.12).setBlendMode(Phaser.BlendModes.ADD);
    const pulse=this.add.ellipse(0,428,360,72,tint,0.06).setBlendMode(Phaser.BlendModes.ADD);
    const echo=this.add.sprite(8,342,landmarkKey).setTint(tint).setAlpha(0.07);
    const landmark=this.add.sprite(0,332,landmarkKey).setAlpha(1);
    if(landmark.width>0)landmark.setScale(Math.min(1.28,218/landmark.width));
    echo.setScale(landmark.scaleX*1.045,landmark.scaleY*1.045);
    root.add([beam,outerGlow,innerGlow,pulse,echo,landmark]);

    const vignette=this.add.graphics();
    if(theme==="shore"){
      vignette.lineStyle(2,0x8fc7ff,0.24);for(let i=0;i<4;i++)vignette.strokeEllipse(-110+i*72,433+(i%2)*7,72,14);
      vignette.fillStyle(0xffd98b,0.18);vignette.fillCircle(-156,352,18);
    }else if(theme==="garden"){
      vignette.fillStyle(0xffa6c9,0.2);for(let i=0;i<12;i++)vignette.fillCircle(-170+i*31,424-(i%3)*8,5+(i%2));
    }else if(theme==="haven"){
      vignette.fillStyle(0xffcc7f,0.16);for(let i=0;i<6;i++)vignette.fillRoundedRect(-150+i*58,414+(i%2)*6,34,18,4);
      vignette.fillStyle(0xffe2a5,0.42);for(let i=0;i<5;i++)vignette.fillCircle(-120+i*60,410,3.5);
    }else{
      vignette.lineStyle(1.5,0xc7d5ff,0.22);for(let i=0;i<5;i++)vignette.strokeCircle(-126+i*63,421+Math.abs(2-i)*7,15+(i%2)*4);
    }
    root.add(vignette);

    accents.forEach((key,i)=>{if(!this.textures.exists(key))return;const side=i===0?-1:1;const a=this.add.sprite(side*138,408-i*18,key).setAlpha(0.9);if(theme==="stars"||i===0)a.setTint(tint);a.setScale(key==="pillar"?1.15:key==="adriel"?1.06:0.9);root.add(a);});

    for(let i=0;i<18;i++){
      const mote=this.add.circle(-185+((i*43)%370),258+((i*31)%186),i%4===0?2.5:1.25,tint,0.48);
      root.add(mote);
      this.tweens.add({targets:mote,y:mote.y-18-(i%5)*4,alpha:0.1,duration:1350+i*82,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    }

    const actText=this.add.text(0,172,act,{fontFamily:"system-ui, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8eabf",letterSpacing:4}).setOrigin(0.5);
    const titleText=this.add.text(0,205,title,{fontFamily:"Georgia, serif",fontSize:"27px",color:"#ffffff",stroke:"#080b1c",strokeThickness:5}).setOrigin(0.5);
    const quotePanel=this.add.rectangle(0,458,354,72,0x070b19,0.86).setStrokeStyle(1,tint,0.45);
    const quoteText=this.add.text(0,458,`“${quote}”`,{fontFamily:"Georgia, serif",fontSize:"13px",fontStyle:"italic",color:"#fffaf0",align:"center",lineSpacing:4,wordWrap:{width:306},stroke:"#050817",strokeThickness:2}).setOrigin(0.5);
    root.add([actText,titleText,quotePanel,quoteText]);

    this.tweens.add({targets:outerGlow,alpha:{from:0.035,to:0.14},scaleX:{from:0.94,to:1.06},duration:2500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    this.tweens.add({targets:innerGlow,alpha:{from:0.06,to:0.18},duration:1900,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    this.tweens.add({targets:pulse,alpha:{from:0.025,to:0.12},scaleX:{from:0.85,to:1.2},duration:2100,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    return{root,centerX:x,tint,theme,pulse};
  }

  private addHavenPresence(x:number){
    const root=this.add.container(x+145,356).setDepth(8).setAlpha(0.18);
    const halo=this.add.ellipse(0,16,72,118,0xffd88d,0.08).setBlendMode(Phaser.BlendModes.ADD);
    const head=this.add.circle(0,-24,8,0xffe7b5,0.32);
    const body=this.add.ellipse(0,10,22,54,0xffd88d,0.2);
    const ground=this.add.ellipse(0,42,58,12,0xffcf74,0.11).setBlendMode(Phaser.BlendModes.ADD);
    root.add([halo,head,body,ground]);
    this.tweens.add({targets:root,alpha:{from:0.1,to:0.34},duration:2200,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }

  private addAct4Pillars(x:number){
    if(!this.textures.exists("pillar"))return;
    for(let i=0;i<5;i++){
      const px=x-126+i*63;const py=414+Math.abs(2-i)*7;
      const p=this.add.sprite(px,py,"pillar").setDepth(10).setTint(0xffdf8a).setAlpha(0.82).setScale(0.86);
      this.act4Pillars.push(p);
      this.tweens.add({targets:p,alpha:{from:0.48,to:1},duration:1450+i*130,yoyo:true,repeat:-1});
    }
  }

  private addCathedralReveal(){
    const x=2580;
    const root=this.add.container(0,0).setDepth(8).setAlpha(0.08);
    const farHalo=this.add.ellipse(x,336,760,500,0xffd37a,0.1).setBlendMode(Phaser.BlendModes.ADD);
    const aura=this.add.ellipse(x,340,610,410,0xffd37a,0.26).setBlendMode(Phaser.BlendModes.ADD);
    const cathedral=this.add.sprite(x,307,"landmark-cathedral").setTint(0xfff7e6);
    if(cathedral.width>0)cathedral.setScale(Math.min(1.76,310/cathedral.width));
    root.add([farHalo,aura,cathedral]);
    for(let i=0;i<9;i++)root.add(this.add.rectangle(x-220+i*55,238,18,320,0xffe3a1,0.08).setAngle(i%2?5:-5).setBlendMode(Phaser.BlendModes.ADD));
    this.cathedralRoot=root;

    const title=this.add.container(x,455).setDepth(20).setAlpha(0);
    const panel=this.add.rectangle(0,0,430,96,0x080912,0.9).setStrokeStyle(1,0xffd98a,0.62);
    const quote=this.add.text(0,-12,"“Everything brought me here.”",{fontFamily:"Georgia, serif",fontSize:"21px",fontStyle:"italic",color:"#fff5d8",stroke:"#080b1c",strokeThickness:3}).setOrigin(0.5);
    const act=this.add.text(0,24,"ACT V · THE CATHEDRAL",{fontFamily:"system-ui, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffe39a",letterSpacing:4}).setOrigin(0.5);
    title.add([panel,quote,act]);
    this.cathedralTitle=title;
  }

  private onStick(v:{x?:number;y?:number}){this.stick.x=Number(v?.x??0);this.stick.y=Number(v?.y??0);}

  update(time:number,delta:number){
    if(this.exiting||!this.maria?.active)return;

    let dx=this.stick.x;
    if(this.cursors?.right.isDown||this.keyD?.isDown)dx+=1;
    if(this.cursors?.left.isDown||this.keyA?.isDown)dx-=1;
    dx=Phaser.Math.Clamp(dx,-1,1);

    let nearest=9999;let nearestIndex=-1;
    for(let i=0;i<this.memories.length;i++){
      const d=this.maria.x-this.memories[i]!.centerX;
      if(Math.abs(d)<nearest){nearest=Math.abs(d);nearestIndex=i;}
    }

    let pocketSlow=1;
    if(nearestIndex>=0&&nearest<155)pocketSlow=nearestIndex===2?0.58:0.74;
    if(time<this.pauseUntil)pocketSlow=0;

    const moving=Math.abs(dx)>0.05&&pocketSlow>0;
    this.maria.x=Phaser.Math.Clamp(this.maria.x+dx*WALK_SPEED*pocketSlow*Math.min(delta,50)/1000,72,2670);

    if(moving){
      this.maria.setFlipX(dx<0);
      if(time-this.lastWalkFrameAt>=145){this.lastWalkFrameAt=time;this.walkFrame=this.walkFrame===1?2:1;this.maria.setTexture(`maria-side-${this.walkFrame}`);}
      this.maria.y=WALK_Y+Math.sin(time/92)*1.4;
      if(time-this.lastFootGlowAt>=245){this.lastFootGlowAt=time;this.spawnFootGlow();}
    }else{
      this.walkFrame=0;this.maria.setTexture("maria-side-0");this.maria.y+=(WALK_Y-this.maria.y)*0.25;
    }

    nearest=9999;nearestIndex=-1;
    this.memories.forEach((m,index)=>{
      const d=this.maria.x-m.centerX;
      const ad=Math.abs(d);
      if(ad<nearest){nearest=ad;nearestIndex=index;}
      const approach=Phaser.Math.Clamp(1-ad/430,0,1);
      const passed=d>130?Phaser.Math.Clamp(1-(d-130)/350,0.035,1):1;
      const alpha=(0.38+approach*0.62)*passed;
      m.root.setAlpha(alpha);
      m.root.setScale(0.985+approach*0.045);
      if(d>250)m.root.setY(Math.min(16,(d-250)*0.035));
    });

    const inPocket=nearestIndex>=0&&nearest<260;
    const quietGap=this.maria.x>2160&&this.maria.x<2380;
    const cathedralApproach=this.maria.x>=2380;
    const targetVeil=quietGap?0.28:inPocket?0.105:cathedralApproach?0.06:0.17;
    this.worldVeil.alpha+=(targetVeil-this.worldVeil.alpha)*0.045;
    const targetZoom=cathedralApproach?1.065:inPocket?1.035:quietGap?0.99:1;
    this.cameras.main.zoom+=(targetZoom-this.cameras.main.zoom)*0.035;
    const desiredOffsetX=cathedralApproach?-170:inPocket?-132:-118;
    this.cameras.main.setFollowOffset(this.cameras.main.followOffset.x+(desiredOffsetX-this.cameras.main.followOffset.x)*0.04,22);
    this.titleCard?.setAlpha(Phaser.Math.Clamp(1-(this.maria.x-150)/430,0,1));

    if(nearestIndex>=0&&nearest<115){
      if(this.focusMemory!==nearestIndex){this.focusMemory=nearestIndex;this.cueMemoryFocus(nearestIndex);this.cuePocketMotif(nearestIndex);}
      if(!this.reminiscenceShown.has(nearestIndex))this.showReminiscence(nearestIndex);
      if(!this.pausePlayed.has(nearestIndex)){
        this.pausePlayed.add(nearestIndex);
        this.pauseUntil=time+(nearestIndex===2?650:260);
      }
    }

    if(nearestIndex>=0&&nearest<300&&time-this.lastPocketParticleAt>170){
      this.lastPocketParticleAt=time;
      this.spawnPocketParticle(nearestIndex);
    }

    if(this.maria.x>2080){
      this.act4Pillars.forEach((p,i)=>{
        const extinguishAt=2110+i*34;
        if(this.maria.x>extinguishAt)p.alpha=Math.max(0.08,p.alpha-0.035);
      });
    }

    if(this.maria.x>=2320&&!this.butterfly?.active)this.spawnGuidingButterfly();
    if(this.butterfly?.active){
      const lead=this.maria.x>2380?175:105;
      const tx=Math.min(2620,this.maria.x+lead);
      const ty=WALK_Y-70+Math.sin(this.time.now/220)*14;
      this.butterfly.x+=(tx-this.butterfly.x)*(this.maria.x>2380?0.085:0.055);
      this.butterfly.y+=(ty-this.butterfly.y)*0.065;
      if(time-this.lastButterflyTrailAt>=90){this.lastButterflyTrailAt=time;this.spawnButterflyTrail();}
    }

    const gold=Phaser.Math.Clamp((this.maria.x-2290)/290,0,1);
    this.goldRoad.setAlpha(gold*0.34);
    this.cathedralRoot.setAlpha(0.08+gold*0.92);
    this.cathedralRoot.setScale(0.94+gold*0.06);

    if(this.maria.x>=2445&&!this.reminiscenceShown.has(4)){
      this.showReminiscence(4);
      this.cueCathedralSwell();
    }
    if(this.maria.x>=2510){
      this.cathedralTitle.alpha+=(1-this.cathedralTitle.alpha)*0.045;
      if(!this.pausePlayed.has(4)){
        this.pausePlayed.add(4);
        this.pauseUntil=time+900;
      }
    }

    if(this.reminiscenceBubble?.active)this.reminiscenceBubble.setPosition(this.maria.x,this.maria.y-118);
    if(this.maria.x>=2635)this.beginExit();
  }

  private showReminiscence(index:number){
    const line=REMINISCENCES[index];
    if(!line||this.reminiscenceShown.has(index))return;
    this.reminiscenceShown.add(index);
    if(this.reminiscenceBubble?.active){this.tweens.killTweensOf(this.reminiscenceBubble);this.reminiscenceBubble.destroy();}
    const tint=index===4?0xffd98a:(this.memories[index]?.tint??0xe8eeff);
    const width=index===2||index===4?340:300;
    const root=this.add.container(this.maria.x,this.maria.y-118).setDepth(60).setAlpha(0).setScale(0.94);
    const glow=this.add.rectangle(0,-25,width+16,84,tint,0.055).setBlendMode(Phaser.BlendModes.ADD);
    const panel=this.add.rectangle(0,-25,width,72,0x070a16,0.95).setStrokeStyle(1,tint,0.72);
    const text=this.add.text(0,-25,line,{fontFamily:"Georgia, serif",fontSize:"14px",fontStyle:"italic",color:"#fffaf0",align:"center",lineSpacing:3,wordWrap:{width:width-42},stroke:"#050714",strokeThickness:2}).setOrigin(0.5);
    const tail=this.add.triangle(-42,16,0,0,18,0,4,15,0x070a16,0.95).setStrokeStyle(1,tint,0.6);
    root.add([glow,panel,text,tail]);
    this.reminiscenceBubble=root;
    this.tweens.add({targets:root,alpha:1,scale:1,y:root.y-6,duration:340,ease:"Back.easeOut"});
    const hold=index===2?3900:index===4?4200:3000;
    this.time.delayedCall(hold,()=>{if(!root.active)return;this.tweens.add({targets:root,alpha:0,y:root.y-10,duration:560,ease:"Sine.easeIn",onComplete:()=>{if(this.reminiscenceBubble===root)this.reminiscenceBubble=null;root.destroy();}});});
  }

  private cueMemoryFocus(index:number){
    const m=this.memories[index];if(!m)return;
    const ring=this.add.ellipse(m.centerX,427,280,54,m.tint,0.18).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:ring,alpha:0,scaleX:1.65,scaleY:1.4,duration:1100,ease:"Sine.easeOut",onComplete:()=>ring.destroy()});
  }

  private spawnPocketParticle(index:number){
    const m=this.memories[index];if(!m)return;
    const x=m.centerX+Phaser.Math.Between(-190,190);
    const y=Phaser.Math.Between(300,450);
    if(m.theme==="garden"){
      const petal=this.add.ellipse(x,y,8,4,0xffb6d1,0.72).setDepth(17).setAngle(Phaser.Math.Between(-35,35));
      this.tweens.add({targets:petal,x:x+Phaser.Math.Between(18,46),y:y+Phaser.Math.Between(18,42),angle:petal.angle+120,alpha:0,duration:1200,onComplete:()=>petal.destroy()});
    }else if(m.theme==="haven"){
      const glow=this.add.circle(x,y,Phaser.Math.FloatBetween(2,4),0xffd58d,0.66).setDepth(17).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({targets:glow,y:y-28,alpha:0,scale:1.6,duration:1300,onComplete:()=>glow.destroy()});
    }else if(m.theme==="shore"){
      const glint=this.add.rectangle(x,y,14,2,0xbfe5ff,0.7).setDepth(17).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({targets:glint,scaleX:2.1,alpha:0,duration:780,onComplete:()=>glint.destroy()});
    }else{
      const star=this.add.circle(x,y,Phaser.Math.FloatBetween(1.4,2.8),0xdbe5ff,0.78).setDepth(17).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({targets:star,y:y-34,alpha:0,scale:2,duration:1000,onComplete:()=>star.destroy()});
    }
  }

  private spawnFootGlow(){
    const warm=Phaser.Math.Clamp((this.maria.x-2260)/400,0,1);
    const tint=warm>0.15?0xffdc91:0xe4ebff;
    const ripple=this.add.ellipse(this.maria.x-(this.maria.flipX?-4:4),WALK_Y+15,18,6,tint,0.24).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:ripple,alpha:0,scaleX:1.8,scaleY:1.5,duration:540,ease:"Sine.easeOut",onComplete:()=>ripple.destroy()});
  }

  private spawnGuidingButterfly(){
    if(this.butterfly?.active||!this.textures.exists("butterfly"))return;
    this.butterfly=this.add.sprite(this.maria.x+90,WALK_Y-66,"butterfly").setDepth(45).setTint(0xffdc83).setScale(1.3);
    this.tweens.add({targets:this.butterfly,alpha:{from:0.45,to:1},scale:{from:1.02,to:1.38},duration:820,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }

  private spawnButterflyTrail(){
    if(!this.butterfly?.active)return;
    const mote=this.add.circle(this.butterfly.x-8+Phaser.Math.Between(-4,4),this.butterfly.y+Phaser.Math.Between(-4,4),Phaser.Math.FloatBetween(1.2,2.6),0xffe2a0,0.7).setDepth(44).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({targets:mote,x:mote.x-22,y:mote.y+Phaser.Math.Between(-10,10),alpha:0,scale:0.25,duration:680,ease:"Sine.easeOut",onComplete:()=>mote.destroy()});
  }

  private cuePocketMotif(index:number){
    if(this.motifPlayed.has(index)||!this.memoryAudio)return;
    this.motifPlayed.add(index);
    try{
      const ctx=this.memoryAudio;
      const now=ctx.currentTime+0.03;
      const motifs=[[261.63,329.63,392],[293.66,369.99,440],[220,277.18,329.63],[329.63,493.88,659.25]];
      const motif=motifs[index]??motifs[0];
      motif.forEach((freq,i)=>{
        const o=ctx.createOscillator();const g=ctx.createGain();
        o.type=index===3?"sine":"triangle";o.frequency.value=freq;
        g.gain.setValueAtTime(0.0001,now+i*0.13);g.gain.linearRampToValueAtTime(0.022,now+i*0.13+0.08);g.gain.exponentialRampToValueAtTime(0.0001,now+i*0.13+1.5);
        o.connect(g).connect(ctx.destination);o.start(now+i*0.13);o.stop(now+i*0.13+1.6);
      });
    }catch{}
  }

  private startMemoryWalkMusic(){
    try{
      const AC=window.AudioContext??(window as any).webkitAudioContext;if(!AC)return;
      const ctx=new AC();this.memoryAudio=ctx;void ctx.resume();
      const master=ctx.createGain();master.gain.value=0.0001;master.connect(ctx.destination);master.gain.exponentialRampToValueAtTime(0.04,ctx.currentTime+2.4);
      const soft=ctx.createBiquadFilter();soft.type="lowpass";soft.frequency.value=1700;soft.Q.value=0.35;soft.connect(master);
      const hz=(n:number)=>220*Math.pow(2,n/12);
      const melody=[7,12,14,19,16,14,12,9,7,11,14,16,19,21,19,14];
      const bass=[-12,-7,-5,-7];let step=0;let next=ctx.currentTime+0.35;
      const note=(freq:number,at:number,dur:number,gain:number,type:OscillatorType="sine")=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(0.0001,at);g.gain.linearRampToValueAtTime(gain,at+0.08);g.gain.exponentialRampToValueAtTime(0.0001,at+dur);o.connect(g).connect(soft);o.start(at);o.stop(at+dur+0.08);};
      const schedule=()=>{const horizon=ctx.currentTime+1.4;while(next<horizon){const n=melody[step%melody.length]!;note(hz(n),next,2.7,0.15,"sine");if(step%4===0){const b=bass[Math.floor(step/4)%bass.length]!;note(hz(b),next,4.2,0.1,"sine");}next+=1.05;step+=1;}};
      schedule();const timer=window.setInterval(schedule,420);
      const wake=()=>void ctx.resume();window.addEventListener("pointerdown",wake,{passive:true});window.addEventListener("keydown",wake);window.addEventListener("touchstart",wake,{passive:true});
      this.memoryMusicStop=()=>{window.clearInterval(timer);window.removeEventListener("pointerdown",wake);window.removeEventListener("keydown",wake);window.removeEventListener("touchstart",wake);try{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),ctx.currentTime);master.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.8);}catch{}window.setTimeout(()=>{try{void ctx.close();}catch{}},900);};
    }catch(err){console.warn?.("[quest] Memory Walk music unavailable",err);}
  }

  private cueCathedralSwell(){
    if(this.cathedralSwelled||!this.memoryAudio)return;
    this.cathedralSwelled=true;
    try{
      const ctx=this.memoryAudio;const now=ctx.currentTime+0.04;
      [329.63,392,493.88,659.25].forEach((freq,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type=i%2?"triangle":"sine";o.frequency.value=freq;g.gain.setValueAtTime(0.0001,now);g.gain.linearRampToValueAtTime(0.022-i*0.002,now+0.7);g.gain.exponentialRampToValueAtTime(0.0001,now+5.2);o.connect(g).connect(ctx.destination);o.start(now+i*0.08);o.stop(now+5.4);});
    }catch{}
  }

  private stopMemoryWalkMusic(){try{this.memoryMusicStop?.();}catch{}this.memoryMusicStop=null;this.memoryAudio=null;}
  private beginExit(){if(this.exiting)return;this.exiting=true;this.stopMemoryWalkMusic();this.game.events.emit(EV.music,"home");this.cameras.main.fadeOut(1550,255,244,214);this.time.delayedCall(1620,()=>this.finishToCathedral());}
  private finishToCathedral(){if(!this.save)return;try{this.save.current_zone=ACT5;this.save.player_health=5;this.game.events.emit(EV.save,{...this.save});}catch(err){console.warn?.("[quest] Memory Walk save handoff warning",err);}try{this.scene.stop(MEMORY_WALK_SCENE_KEY);this.scene.start("quest",{save:this.save});}catch(err){console.warn?.("[quest] Memory Walk Cathedral handoff failed",err);}}
}
