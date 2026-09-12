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
const MARIA_SCALE = 1.357; // 15% larger than the previous 1.18 scale.
const WALK_SPEED = 86.4; // 20% slower than the previous 108 speed.
const REMINISCENCES = [
  "I remember thinking the road ahead was endless.",
  "This was when love started to feel like home.",
  "I didn’t know how much this place would stay with me.",
  "I was afraid… but I kept climbing.",
  "Everything brought me here.",
];

type MemoryGroup = {
  root: Phaser.GameObjects.Container;
  centerX: number;
  tint: number;
};

export class MemoryWalkScene extends Phaser.Scene {
  save: any;
  maria!: Phaser.GameObjects.Sprite;
  butterfly: Phaser.GameObjects.Sprite | null = null;
  stick = { x: 0, y: 0 };
  exiting = false;
  lastMilestone = -1;
  memories: MemoryGroup[] = [];
  titleCard!: Phaser.GameObjects.Container;
  private walkFrame = 0;
  private lastWalkFrameAt = 0;
  private lastFootGlowAt = 0;
  private lastButterflyTrailAt = 0;
  private lastAmbientSparkleAt = 0;
  private memoryAudio: AudioContext | null = null;
  private memoryMusicStop: (() => void) | null = null;
  private cathedralSwelled = false;
  private focusMemory = -1;
  private reminiscenceShown = new Set<number>();
  private reminiscenceBubble: Phaser.GameObjects.Container | null = null;

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
    const moodStops = [[160,0xffc66e,0.045],[720,0xff8fbd,0.05],[1240,0xe5aa63,0.045],[1760,0x799cff,0.055],[2220,0xffd680,0.05]];
    moodStops.forEach(([x,tint,alpha]) => { moods.fillStyle(tint,alpha); moods.fillEllipse(x,300,760,520); });

    const hazeBack = this.add.graphics().setDepth(0).setScrollFactor(0.82,1);
    for (let i=0;i<8;i++) { const x=210+i*405; const tint=i>=6?0xffd792:i%2?0x7967b4:0x6d8bc4; hazeBack.fillStyle(tint,0.035+(i%3)*0.012); hazeBack.fillEllipse(x,250+(i%2)*35,420,210); }
    const hazeFront = this.add.graphics().setDepth(1).setScrollFactor(0.93,1);
    for (let i=0;i<10;i++) { const x=90+i*315; hazeFront.fillStyle(i>7?0xffdb98:0xbfc8ff,0.018+(i%2)*0.014); hazeFront.fillEllipse(x,386+(i%3)*20,260,92); }

    for (let i=0;i<175;i++) {
      const x=22+((i*197)%(WORLD_W-44)); const y=18+((i*83)%455); const r=i%13===0?2.4:i%4===0?1.45:0.8; const tint=x>2180?0xffe2a0:i%5===0?0xc8ddff:0xffffff;
      const star=this.add.circle(x,y,r,tint,i%4===0?0.82:0.5).setDepth(1);
      if(i%11===0)this.tweens.add({targets:star,alpha:{from:0.25,to:0.98},scale:{from:0.72,to:1.35},duration:1450+(i%6)*190,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
    }

    const constellations=this.add.graphics().setDepth(1).setScrollFactor(0.88,1);
    [420,970,1500,2010,2520].forEach((cx,idx)=>{const tint=idx===4?0xffdf94:idx===1?0xffaad0:0xc9d4ff;const pts=[[cx-72,95+idx*7],[cx-25,72+idx*4],[cx+18,108-idx*2],[cx+66,78+idx*5]];constellations.lineStyle(1,tint,0.12);for(let p=0;p<pts.length-1;p++)constellations.lineBetween(pts[p]![0],pts[p]![1],pts[p+1]![0],pts[p+1]![1]);pts.forEach(([px,py])=>{constellations.fillStyle(tint,0.42);constellations.fillCircle(px,py,2.1);});});

    const pathGlow=this.add.graphics().setDepth(2);pathGlow.fillStyle(0x8fa9ff,0.07);pathGlow.fillRoundedRect(-20,PATH_TOP-12,WORLD_W+40,142,54);pathGlow.fillStyle(0xdce7ff,0.09);pathGlow.fillRoundedRect(-8,PATH_TOP-4,WORLD_W+16,126,50);
    const path=this.add.graphics().setDepth(3);path.fillGradientStyle(0x7188bd,0xaec2ec,0x34466e,0x596f9e,0.94);path.fillRoundedRect(0,PATH_TOP,WORLD_W,112,44);path.fillStyle(0xf9f4e6,0.12);path.fillRoundedRect(18,PATH_TOP+17,WORLD_W-36,76,34);path.fillStyle(0xffffff,0.08);path.fillRoundedRect(28,PATH_TOP+34,WORLD_W-56,34,17);path.lineStyle(2,0xe8efff,0.45);path.strokeRoundedRect(0,PATH_TOP,WORLD_W,112,44);
    const goldWash=this.add.graphics().setDepth(3);goldWash.fillGradientStyle(0xffd98a,0xffedbd,0xffbd62,0xffd98a,0.22);goldWash.fillRoundedRect(1980,PATH_TOP+3,WORLD_W-1980,106,41);
    for(let x=72;x<WORLD_W;x+=78){const warm=Phaser.Math.Clamp((x-1840)/820,0,1);const tint=warm>0.35?0xffde8f:0xe6ecff;const dot=this.add.circle(x,WALK_Y+8+Math.sin(x*0.031)*10,4.5+warm*3,tint,0.2+warm*0.24).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);if(x%156===72)this.tweens.add({targets:dot,alpha:{from:0.12,to:0.58+warm*0.2},scale:{from:0.75,to:1.3},duration:1500+(x%5)*120,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}
    const guide=this.add.rectangle(WORLD_W/2,PATH_TOP+83,WORLD_W-90,2,0xf7f1dc,0.22).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:guide,alpha:{from:0.12,to:0.4},duration:1900,yoyo:true,repeat:-1});

    this.addOpeningTitle();this.addMemorySeparator(725,0xbfd1ff);this.addMemorySeparator(1235,0xf6b2d1);this.addMemorySeparator(1745,0xf2c582);this.addMemorySeparator(2255,0xb6c8ff);
    this.memories.push(this.addMemory(470,"ACT I","Sunlit Shores",0xffd48a,"landmark-temple",["tree","fountain"],"Every beginning is a promise we do not yet know we are making.","shore"));
    this.memories.push(this.addMemory(980,"ACT II","Wedding Garden",0xff9fca,"landmark-conservatory",["flowers","arbor"],"Love does not bloom once. It chooses every season.","garden"));
    this.memories.push(this.addMemory(1490,"ACT III","The Haven",0xf1c27f,"landmark-townhall",["house","lamp"],"Home is not where the road ends. It is who waits there with you.","haven"));
    this.memories.push(this.addMemory(2000,"ACT IV","Starry Ascent",0x9ab7ff,"landmark-observatory",["pillar","adriel"],"Some climbs change the view. Others change the heart.","stars"));
    this.addAct4Pillars(2000);this.addCathedralReveal();

    const foreground=this.add.graphics().setDepth(28).setScrollFactor(1.035,1);foreground.fillStyle(0x050711,0.44);for(let i=0;i<18;i++){const x=20+i*165;const h=18+(i%4)*6;foreground.fillEllipse(x,PATH_TOP+111,95,h);}
    this.maria=this.add.sprite(110,WALK_Y,"maria-side-0").setDepth(40).setScale(MARIA_SCALE);this.maria.setFlipX(false);
    this.cameras.main.startFollow(this.maria,true,0.08,0.08,-118,22);this.cameras.main.setDeadzone(220,120);
    this.game.events.on(EV.stick,this.onStick,this);this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{this.game.events.off(EV.stick,this.onStick,this);this.stopMemoryWalkMusic();});this.cameras.main.fadeIn(1000,5,8,23);
  }

  private addOpeningTitle(){const root=this.add.container(160,204).setDepth(30);const glow=this.add.rectangle(250,0,530,190,0x7e8cff,0.035).setBlendMode(Phaser.BlendModes.ADD);const veil=this.add.rectangle(0,0,510,178,0x050817,0.44).setOrigin(0,0.5).setStrokeStyle(1,0xd9e3ff,0.12);const small=this.add.text(14,-52,"BETWEEN ACT IV & ACT V",{fontFamily:"system-ui, sans-serif",fontSize:"12px",fontStyle:"bold",color:"#d9e3ff",letterSpacing:4});const title=this.add.text(10,-18,"MEMORY WALK",{fontFamily:"Georgia, serif",fontSize:"38px",color:"#ffe7ae",stroke:"#080b1c",strokeThickness:6,letterSpacing:5});const sub=this.add.text(14,39,"Walk forward. Let every chapter pass beside you.",{fontFamily:"Georgia, serif",fontSize:"14px",fontStyle:"italic",color:"#f0f2ff"});const star=this.add.circle(438,-20,3,0xffe5a3,0.85).setBlendMode(Phaser.BlendModes.ADD);root.add([glow,veil,small,title,sub,star]);this.tweens.add({targets:star,scale:{from:0.7,to:1.8},alpha:{from:0.35,to:1},duration:1400,yoyo:true,repeat:-1});this.tweens.add({targets:glow,alpha:{from:0.02,to:0.07},duration:2200,yoyo:true,repeat:-1});this.titleCard=root;}
  private addMemorySeparator(x:number,tint:number){const root=this.add.container(x,0).setDepth(6);const line=this.add.rectangle(0,335,1.5,245,tint,0.09).setBlendMode(Phaser.BlendModes.ADD);const flare=this.add.ellipse(0,335,54,190,tint,0.03).setBlendMode(Phaser.BlendModes.ADD);root.add([flare,line]);for(let i=0;i<5;i++){const mote=this.add.circle(-13+i*7,250+i*38,1.4+(i%2),tint,0.28).setBlendMode(Phaser.BlendModes.ADD);root.add(mote);this.tweens.add({targets:mote,y:mote.y-24,alpha:{from:0.12,to:0.55},duration:1300+i*180,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}}

  private addMemory(x:number,act:string,title:string,tint:number,landmarkKey:string,accents:string[],quote:string,theme:"shore"|"garden"|"haven"|"stars"):MemoryGroup{
    const root=this.add.container(x,0).setDepth(7);const beam=this.add.rectangle(0,320,150,300,tint,0.025).setAngle(theme==="garden"?-4:theme==="stars"?4:0).setBlendMode(Phaser.BlendModes.ADD);const crownGlow=this.add.ellipse(0,285,280,185,tint,0.055).setBlendMode(Phaser.BlendModes.ADD);const outerGlow=this.add.ellipse(0,334,440,306,tint,0.095).setBlendMode(Phaser.BlendModes.ADD);const innerGlow=this.add.ellipse(0,344,326,232,tint,0.14).setBlendMode(Phaser.BlendModes.ADD);const floorGlow=this.add.ellipse(0,437,340,58,tint,0.1).setBlendMode(Phaser.BlendModes.ADD);const echo=this.add.sprite(8,342,landmarkKey).setTint(tint).setAlpha(0.08);const landmark=this.add.sprite(0,332,landmarkKey).setAlpha(1);if(landmark.width>0)landmark.setScale(Math.min(1.28,218/landmark.width));echo.setScale(landmark.scaleX*1.045,landmark.scaleY*1.045);root.add([beam,crownGlow,outerGlow,innerGlow,floorGlow,echo,landmark]);
    const vignette=this.add.graphics();if(theme==="shore"){vignette.lineStyle(2,0x8fc7ff,0.24);for(let i=0;i<4;i++)vignette.strokeEllipse(-110+i*72,433+(i%2)*7,72,14);vignette.fillStyle(0xffd98b,0.18);vignette.fillCircle(-156,352,18);vignette.lineStyle(1,0xffefbd,0.22);for(let i=0;i<7;i++)vignette.lineBetween(-156,352,-196+i*13,322+Math.abs(3-i)*5);}else if(theme==="garden"){vignette.fillStyle(0xffa6c9,0.2);for(let i=0;i<12;i++)vignette.fillCircle(-170+i*31,424-(i%3)*8,5+(i%2));vignette.lineStyle(1,0xb6d993,0.2);for(let i=0;i<8;i++)vignette.lineBetween(-158+i*45,440,-150+i*45,414-(i%2)*12);}else if(theme==="haven"){vignette.fillStyle(0xffcc7f,0.16);for(let i=0;i<6;i++)vignette.fillRoundedRect(-150+i*58,414+(i%2)*6,34,18,4);vignette.fillStyle(0xffe2a5,0.42);for(let i=0;i<5;i++)vignette.fillCircle(-120+i*60,410,3.5);}else{vignette.lineStyle(1.5,0xc7d5ff,0.22);for(let i=0;i<5;i++)vignette.strokeCircle(-126+i*63,421+Math.abs(2-i)*7,15+(i%2)*4);vignette.fillStyle(0x9cbcff,0.18);for(let i=0;i<11;i++)vignette.fillCircle(-180+i*36,392-(i%3)*15,2.5);}root.add(vignette);
    accents.forEach((key,i)=>{if(!this.textures.exists(key))return;const side=i===0?-1:1;const a=this.add.sprite(side*138,408-i*18,key).setAlpha(0.9);if(theme==="stars"||i===0)a.setTint(tint);a.setScale(key==="pillar"?1.15:key==="adriel"?1.06:0.9);root.add(a);});
    for(let i=0;i<20;i++){const mote=this.add.circle(-185+((i*43)%370),258+((i*31)%186),i%4===0?2.5:1.25,tint,0.68);root.add(mote);this.tweens.add({targets:mote,y:mote.y-18-(i%5)*4,alpha:0.16,duration:1350+i*82,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}
    const actText=this.add.text(0,172,act,{fontFamily:"system-ui, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8eabf",letterSpacing:4}).setOrigin(0.5).setAlpha(0.94);const titleText=this.add.text(0,205,title,{fontFamily:"Georgia, serif",fontSize:"27px",color:"#ffffff",stroke:"#080b1c",strokeThickness:5}).setOrigin(0.5);const quoteAura=this.add.rectangle(0,458,378,90,tint,0.035).setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD);const quotePanel=this.add.rectangle(0,458,354,72,0x070b19,0.86).setOrigin(0.5).setStrokeStyle(1,tint,0.45);const quoteInner=this.add.rectangle(0,458,340,60,0x11182c,0.18).setOrigin(0.5).setStrokeStyle(1,0xffffff,0.06);const quoteText=this.add.text(0,458,`“${quote}”`,{fontFamily:"Georgia, serif",fontSize:"13px",fontStyle:"italic",color:"#fffaf0",align:"center",lineSpacing:4,wordWrap:{width:306},stroke:"#050817",strokeThickness:2}).setOrigin(0.5);const ornaments=this.add.graphics();ornaments.lineStyle(1,tint,0.56);for(const sx of[-1,1]){ornaments.lineBetween(sx*177,431,sx*156,431);ornaments.lineBetween(sx*177,431,sx*177,444);ornaments.lineBetween(sx*177,485,sx*156,485);ornaments.lineBetween(sx*177,485,sx*177,472);ornaments.fillStyle(tint,0.72);ornaments.fillCircle(sx*177,458,2.2);}root.add([actText,titleText,quoteAura,quotePanel,quoteInner,quoteText,ornaments]);
    this.tweens.add({targets:outerGlow,alpha:{from:0.05,to:0.17},scaleX:{from:0.94,to:1.06},duration:2500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});this.tweens.add({targets:innerGlow,alpha:{from:0.08,to:0.21},duration:1900,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});this.tweens.add({targets:beam,alpha:{from:0.012,to:0.055},scaleX:{from:0.85,to:1.18},duration:2800,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});this.tweens.add({targets:quoteAura,alpha:{from:0.015,to:0.07},duration:2100,yoyo:true,repeat:-1});return{root,centerX:x,tint};
  }

  private addAct4Pillars(x:number){if(!this.textures.exists("pillar"))return;for(let i=0;i<5;i++){const px=x-126+i*63;const py=414+Math.abs(2-i)*7;const p=this.add.sprite(px,py,"pillar").setDepth(10).setTint(0xffdf8a).setAlpha(0.88).setScale(0.86);const halo=this.add.ellipse(px,py+18,50,20,0xffd98a,0.08).setDepth(9).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:p,alpha:{from:0.64,to:1},duration:1600+i*130,yoyo:true,repeat:-1});this.tweens.add({targets:halo,alpha:{from:0.03,to:0.15},scaleX:{from:0.8,to:1.25},duration:1500+i*100,yoyo:true,repeat:-1});}}
  private addCathedralReveal(){const x=2580;const farHalo=this.add.ellipse(x,336,760,500,0xffd37a,0.09).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);const aura=this.add.ellipse(x,340,610,410,0xffd37a,0.21).setDepth(3).setBlendMode(Phaser.BlendModes.ADD);const innerAura=this.add.ellipse(x,346,410,300,0xffefbd,0.09).setDepth(4).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:farHalo,alpha:{from:0.035,to:0.14},scale:{from:0.94,to:1.09},duration:3100,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});this.tweens.add({targets:aura,alpha:{from:0.09,to:0.36},scale:{from:0.9,to:1.12},duration:2200,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});this.tweens.add({targets:innerAura,alpha:{from:0.04,to:0.15},duration:1700,yoyo:true,repeat:-1});const cathedral=this.add.sprite(x,307,"landmark-cathedral").setDepth(10).setTint(0xfff7e6).setAlpha(1);if(cathedral.width>0)cathedral.setScale(Math.min(1.76,310/cathedral.width));const echo=this.add.sprite(x,315,"landmark-cathedral").setDepth(9).setTint(0xffc85a).setAlpha(0.2);echo.setScale(cathedral.scaleX*1.15,cathedral.scaleY*1.15);for(let i=0;i<11;i++){const beam=this.add.rectangle(x-235+i*47,232,18,330,0xffe3a1,0.075).setDepth(4).setAngle(i%2?5:-5).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:beam,alpha:{from:0.02,to:0.19},duration:1650+i*145,yoyo:true,repeat:-1});}for(let i=0;i<28;i++){const mote=this.add.circle(x-260+((i*47)%520),220+((i*37)%250),i%5===0?3:1.4,i%3===0?0xffffff:0xffdc8a,0.58).setDepth(12).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:mote,y:mote.y-26-(i%4)*7,alpha:{from:0.16,to:0.82},duration:1350+i*72,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}const quoteAura=this.add.rectangle(x,455,430,94,0xffd37a,0.075).setDepth(18).setBlendMode(Phaser.BlendModes.ADD);const quotePanel=this.add.rectangle(x,455,408,78,0x0a0b15,0.87).setDepth(19).setStrokeStyle(1,0xffd98a,0.56);const quoteInner=this.add.rectangle(x,455,394,64,0x251b12,0.13).setDepth(19).setStrokeStyle(1,0xffffff,0.06);this.add.text(x,445,"“Everything led me here.”",{fontFamily:"Georgia, serif",fontSize:"21px",fontStyle:"italic",color:"#fff5d8",stroke:"#080b1c",strokeThickness:3}).setOrigin(0.5).setDepth(20);this.add.text(x,479,"ACT V · THE CATHEDRAL",{fontFamily:"system-ui, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffe39a",letterSpacing:4}).setOrigin(0.5).setDepth(20).setAlpha(0.96);this.tweens.add({targets:quoteAura,alpha:{from:0.035,to:0.12},scaleX:{from:0.95,to:1.05},duration:2100,yoyo:true,repeat:-1});}

  private onStick(v:{x?:number;y?:number}){this.stick.x=Number(v?.x??0);this.stick.y=Number(v?.y??0);}
  update(time:number,delta:number){
    if(this.exiting||!this.maria?.active)return;const kb=this.input.keyboard;let dx=this.stick.x;if(kb?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).isDown||kb?.addKey(Phaser.Input.Keyboard.KeyCodes.D).isDown)dx+=1;if(kb?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).isDown||kb?.addKey(Phaser.Input.Keyboard.KeyCodes.A).isDown)dx-=1;dx=Phaser.Math.Clamp(dx,-1,1);const moving=Math.abs(dx)>0.05;this.maria.x=Phaser.Math.Clamp(this.maria.x+dx*WALK_SPEED*Math.min(delta,50)/1000,72,2670);
    if(moving){this.maria.setFlipX(dx<0);if(time-this.lastWalkFrameAt>=145){this.lastWalkFrameAt=time;this.walkFrame=this.walkFrame===1?2:1;this.maria.setTexture(`maria-side-${this.walkFrame}`);}this.maria.y=WALK_Y+Math.sin(time/92)*1.4;if(time-this.lastFootGlowAt>=245){this.lastFootGlowAt=time;this.spawnFootGlow();}}else{this.walkFrame=0;this.maria.setTexture("maria-side-0");this.maria.y+=(WALK_Y-this.maria.y)*0.25;}
    let nearest=9999;let nearestIndex=-1;this.memories.forEach((m,index)=>{const d=this.maria.x-m.centerX;if(Math.abs(d)<nearest){nearest=Math.abs(d);nearestIndex=index;}const approach=Phaser.Math.Clamp(1-Math.abs(d)/500,0,1);const passedFade=d>300?Phaser.Math.Clamp(1-(d-300)/330,0.08,1):1;const alpha=Math.min(1,0.8+approach*0.2)*passedFade;m.root.setAlpha(alpha);const focusScale=1+approach*0.028+(d>300?(1-passedFade)*0.012:0);m.root.setScale(focusScale);});
    const cathedralApproach=this.maria.x>2240;const targetZoom=cathedralApproach?1.055:nearest<265?1.035:1;this.cameras.main.zoom+=(targetZoom-this.cameras.main.zoom)*0.035;const desiredOffsetX=cathedralApproach?-150:nearest<265&&nearestIndex>=0?-128:-118;this.cameras.main.setFollowOffset(this.cameras.main.followOffset.x+(desiredOffsetX-this.cameras.main.followOffset.x)*0.04,22);
    if(nearestIndex!==this.focusMemory&&nearest<210){this.focusMemory=nearestIndex;this.cueMemoryFocus(nearestIndex);}this.titleCard?.setAlpha(Phaser.Math.Clamp(1-(this.maria.x-150)/430,0,1));
    const milestones=[340,850,1360,1870,2240];const reached=milestones.reduce((n,m,i)=>this.maria.x>=m?i:n,-1);if(reached>this.lastMilestone){this.lastMilestone=reached;if(reached>=0&&!this.butterfly?.active)this.spawnGuidingButterfly();if(reached===4)this.cueCathedralSwell();this.showReminiscence(reached);}
    if(this.butterfly?.active){const tx=Math.min(2620,this.maria.x+105);const ty=WALK_Y-66+Math.sin(this.time.now/240)*15;this.butterfly.x+=(tx-this.butterfly.x)*0.055;this.butterfly.y+=(ty-this.butterfly.y)*0.065;this.butterfly.setFlipX(tx<this.butterfly.x);if(time-this.lastButterflyTrailAt>=105){this.lastButterflyTrailAt=time;this.spawnButterflyTrail();}}
    if(this.reminiscenceBubble?.active){this.reminiscenceBubble.setPosition(this.maria.x,this.maria.y-92);}
    if(time-this.lastAmbientSparkleAt>=520&&nearest<330){this.lastAmbientSparkleAt=time;this.spawnAmbientSparkle(nearestIndex);}if(this.maria.x>=2635)this.beginExit();
  }

  private showReminiscence(index:number){
    const line=REMINISCENCES[index];if(!line||this.reminiscenceShown.has(index))return;this.reminiscenceShown.add(index);
    if(this.reminiscenceBubble?.active){this.tweens.killTweensOf(this.reminiscenceBubble);this.reminiscenceBubble.destroy();}
    const root=this.add.container(this.maria.x,this.maria.y-92).setDepth(60).setAlpha(0).setScale(0.94);const tint=index===4?0xffd98a:(this.memories[index]?.tint??0xe8eeff);
    const glow=this.add.rectangle(0,-25,300,72,tint,0.055).setOrigin(0.5).setBlendMode(Phaser.BlendModes.ADD);const panel=this.add.rectangle(0,-25,284,62,0x070a16,0.94).setOrigin(0.5).setStrokeStyle(1,tint,0.7);const inner=this.add.rectangle(0,-25,274,52,0x15192b,0.3).setOrigin(0.5).setStrokeStyle(1,0xffffff,0.08);const text=this.add.text(0,-25,line,{fontFamily:"Georgia, serif",fontSize:"14px",fontStyle:"italic",color:"#fffaf0",align:"center",lineSpacing:3,wordWrap:{width:244},stroke:"#050714",strokeThickness:2}).setOrigin(0.5);const tail=this.add.triangle(-44,11,0,0,18,0,4,15,0x070a16,0.94).setStrokeStyle(1,tint,0.6);const star=this.add.circle(128,-51,2.2,tint,0.9).setBlendMode(Phaser.BlendModes.ADD);root.add([glow,panel,inner,text,tail,star]);this.reminiscenceBubble=root;
    this.tweens.add({targets:root,alpha:1,scale:1,y:root.y-5,duration:320,ease:"Back.easeOut"});this.tweens.add({targets:star,alpha:{from:0.35,to:1},scale:{from:0.7,to:1.6},duration:800,yoyo:true,repeat:2});
    this.time.delayedCall(index===4?3300:2900,()=>{if(!root.active)return;this.tweens.add({targets:root,alpha:0,y:root.y-9,duration:520,ease:"Sine.easeIn",onComplete:()=>{if(this.reminiscenceBubble===root)this.reminiscenceBubble=null;root.destroy();}});});
  }

  private cueMemoryFocus(index:number){const m=this.memories[index];if(!m)return;const ring=this.add.ellipse(m.centerX,427,280,54,m.tint,0.12).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:ring,alpha:0,scaleX:1.45,scaleY:1.3,duration:950,ease:"Sine.easeOut",onComplete:()=>ring.destroy()});}
  private spawnAmbientSparkle(index:number){const m=this.memories[index];if(!m)return;const sparkle=this.add.circle(m.centerX+Phaser.Math.Between(-155,155),Phaser.Math.Between(245,430),Phaser.Math.FloatBetween(1.2,2.2),m.tint,0.55).setDepth(16).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:sparkle,y:sparkle.y-25,alpha:0,scale:1.8,duration:900,ease:"Sine.easeOut",onComplete:()=>sparkle.destroy()});}
  private spawnFootGlow(){const warm=Phaser.Math.Clamp((this.maria.x-1880)/760,0,1);const tint=warm>0.3?0xffdc91:0xe4ebff;const shadow=this.add.ellipse(this.maria.x,WALK_Y+17,28,8,0x111526,0.2).setDepth(5);const ripple=this.add.ellipse(this.maria.x-(this.maria.flipX?-4:4),WALK_Y+15,18,6,tint,0.24).setDepth(6).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:shadow,alpha:0,scaleX:1.25,duration:520,onComplete:()=>shadow.destroy()});this.tweens.add({targets:ripple,alpha:0,scaleX:1.8,scaleY:1.5,duration:540,ease:"Sine.easeOut",onComplete:()=>ripple.destroy()});}
  private spawnGuidingButterfly(){if(this.butterfly?.active||!this.textures.exists("butterfly"))return;this.butterfly=this.add.sprite(this.maria.x+90,WALK_Y-66,"butterfly").setDepth(45).setTint(0xffdc83).setScale(1.3);this.tweens.add({targets:this.butterfly,alpha:{from:0.45,to:1},scale:{from:1.02,to:1.38},duration:820,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}
  private spawnButterflyTrail(){if(!this.butterfly?.active)return;const mote=this.add.circle(this.butterfly.x-8+Phaser.Math.Between(-4,4),this.butterfly.y+Phaser.Math.Between(-4,4),Phaser.Math.FloatBetween(1.2,2.6),0xffe2a0,0.7).setDepth(44).setBlendMode(Phaser.BlendModes.ADD);this.tweens.add({targets:mote,x:mote.x-22,y:mote.y+Phaser.Math.Between(-10,10),alpha:0,scale:0.25,duration:680,ease:"Sine.easeOut",onComplete:()=>mote.destroy()});}

  private startMemoryWalkMusic(){try{const AC=window.AudioContext??(window as any).webkitAudioContext;if(!AC)return;const ctx=new AC();this.memoryAudio=ctx;void ctx.resume();const master=ctx.createGain();master.gain.value=0.0001;master.connect(ctx.destination);master.gain.exponentialRampToValueAtTime(0.048,ctx.currentTime+2.4);const soft=ctx.createBiquadFilter();soft.type="lowpass";soft.frequency.value=1800;soft.Q.value=0.35;soft.connect(master);const hz=(n:number)=>220*Math.pow(2,n/12);const melody=[7,12,14,19,16,14,12,9,7,11,14,16,19,21,19,14];const bass=[-12,-7,-5,-7];let step=0;let next=ctx.currentTime+0.35;const note=(freq:number,at:number,dur:number,gain:number,type:OscillatorType="sine")=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,at);g.gain.setValueAtTime(0.0001,at);g.gain.linearRampToValueAtTime(gain,at+0.08);g.gain.exponentialRampToValueAtTime(0.0001,at+dur);o.connect(g).connect(soft);o.start(at);o.stop(at+dur+0.08);};const schedule=()=>{const horizon=ctx.currentTime+1.4;while(next<horizon){const n=melody[step%melody.length]!;note(hz(n),next,2.7,0.18,"sine");note(hz(n+12),next+0.06,1.5,0.04,"triangle");if(step%4===0){const b=bass[Math.floor(step/4)%bass.length]!;note(hz(b),next,4.2,0.12,"sine");}next+=1.05;step+=1;}};schedule();const timer=window.setInterval(schedule,420);const wake=()=>void ctx.resume();window.addEventListener("pointerdown",wake,{passive:true});window.addEventListener("keydown",wake);window.addEventListener("touchstart",wake,{passive:true});this.memoryMusicStop=()=>{window.clearInterval(timer);window.removeEventListener("pointerdown",wake);window.removeEventListener("keydown",wake);window.removeEventListener("touchstart",wake);try{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setValueAtTime(Math.max(master.gain.value,0.0001),ctx.currentTime);master.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+0.8);}catch{}window.setTimeout(()=>{try{void ctx.close();}catch{}},900);};}catch(err){console.warn?.("[quest] Memory Walk music unavailable",err);}}
  private cueCathedralSwell(){if(this.cathedralSwelled||!this.memoryAudio)return;this.cathedralSwelled=true;try{const ctx=this.memoryAudio;const now=ctx.currentTime+0.04;const chord=[329.63,392.0,493.88,659.25];chord.forEach((freq,i)=>{const o=ctx.createOscillator();const g=ctx.createGain();o.type=i%2?"triangle":"sine";o.frequency.value=freq;g.gain.setValueAtTime(0.0001,now);g.gain.linearRampToValueAtTime(0.018-i*0.002,now+0.7);g.gain.exponentialRampToValueAtTime(0.0001,now+4.6);o.connect(g).connect(ctx.destination);o.start(now+i*0.06);o.stop(now+4.8);});}catch{}}
  private stopMemoryWalkMusic(){try{this.memoryMusicStop?.();}catch{}this.memoryMusicStop=null;this.memoryAudio=null;}
  private beginExit(){if(this.exiting)return;this.exiting=true;this.stopMemoryWalkMusic();this.game.events.emit(EV.music,"home");this.cameras.main.fadeOut(1550,255,244,214);this.time.delayedCall(1620,()=>this.finishToCathedral());}
  private finishToCathedral(){if(!this.save)return;try{this.save.current_zone=ACT5;this.save.player_health=5;this.game.events.emit(EV.save,{...this.save});}catch(err){console.warn?.("[quest] Memory Walk save handoff warning",err);}try{this.scene.stop(MEMORY_WALK_SCENE_KEY);this.scene.start("quest",{save:this.save});}catch(err){console.warn?.("[quest] Memory Walk Cathedral handoff failed",err);}}
}
