// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const HOUSE_CLEAR_RADIUS = 185;
const ROOM_W = 860;
const ROOM_H = 560;

function canvasTexture(scene: SceneLike, key: string) {
  if (!scene.textures.exists(key)) return null;
  const texture = scene.textures.get(key) as any;
  const source = texture.getSourceImage?.();
  if (!(source instanceof HTMLCanvasElement)) return null;
  return { texture, canvas: source as HTMLCanvasElement };
}

function redrawCottage(scene: SceneLike) {
  const entry = canvasTexture(scene, "cottage");
  if (!entry) return;
  const { texture, canvas } = entry;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  const sx = canvas.width / 56;
  const sy = canvas.height / 50;
  const R = (x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*sx),Math.round(y*sy),Math.ceil(w*sx),Math.ceil(h*sy));};

  R(4,25,48,22,"#756968");
  R(5,27,46,17,"#bd7483");
  R(7,29,42,14,"#d795a2");
  R(4,44,48,4,"#665f5d");
  for(let x=5;x<51;x+=7)R(x,45,5,2,x%2?"#8a817c":"#77706d");

  R(5,24,46,3,"#51382f");
  for(const x of [7,27,47]) R(x,26,2,18,"#644436");

  ctx.fillStyle="#26364c";
  ctx.beginPath();ctx.moveTo(1*sx,26*sy);ctx.lineTo(28*sx,5*sy);ctx.lineTo(55*sx,26*sy);ctx.closePath();ctx.fill();
  for(let y=10;y<=23;y+=4){
    const inset=Math.max(0,(22-y)*1.15);
    for(let x=5+inset;x<51-inset;x+=7){R(x,y,6,2,"#40536d");R(x,y+2,6,1,"#1e2b3e");}
  }
  R(25,6,6,2,"#65758b");

  R(41,4,7,13,"#746a66");R(40,3,9,3,"#514b49");R(42,7,2,2,"#9a8d86");R(45,11,2,2,"#5f5754");

  R(21,31,14,14,"#34221f");R(22,32,12,13,"#4d3029");
  ctx.fillStyle="#4d3029";ctx.beginPath();ctx.arc(28*sx,32*sy,6*sx,Math.PI,0);ctx.fill();
  R(23,34,2,9,"#704a3c");R(31,38,1,1,"#f0c86c");R(26,31,4,3,"#56704d");R(27,31,2,2,"#db829d");

  for(const x of [11,38]){
    R(x-2,28,12,10,"#3f302c");R(x,29,8,8,"#ffd27c");R(x+1,30,6,6,"#ffe7a8");
    R(x+3.5,29,1,8,"#79594a");R(x,32.5,8,1,"#79594a");
    R(x-4,29,2,9,"#574239");R(x+10,29,2,9,"#574239");R(x-2,37,12,3,"#5b4034");
    for(const [dx,c] of [[-1,"#dc7897"],[2,"#f0a8bd"],[5,"#cf6088"],[8,"#f1cbd6"]] as any[])R(x+dx,36,2,2,c);
  }

  for(const [x,y,c] of [[8,26,"#46633f"],[11,23,"#5f7c4c"],[15,22,"#46633f"],[18,26,"#607c4c"],[44,25,"#46633f"],[42,22,"#607c4c"],[38,21,"#46633f"],[35,26,"#607c4c"],[10,24,"#e27d9c"],[14,22,"#f0a9bc"],[18,26,"#d6698e"],[42,23,"#efa9bc"],[38,21,"#d6698e"],[35,27,"#e98fa8"],[20,30,"#597448"],[18,34,"#597448"],[18,38,"#6a8652"],[36,30,"#597448"],[38,35,"#6a8652"],[37,39,"#597448"],[19,32,"#f0a9bc"],[18,37,"#d6698e"],[36,32,"#e98fa8"],[38,36,"#f2bfd0"]] as [number,number,string][])R(x,y,2,2,c);

  for(const x of [19,35]){R(x,31,2,5,"#292a30");R(x,32,2,2,"#ffd36f");}
  R(21,45,14,2,"#aaa096");R(19,47,18,2,"#716966");
  texture.refresh?.();
}

function removeTreesNearHouse(scene: SceneLike, hx:number, hy:number){
  const near=(o:any)=>o?.active!==false&&o?.texture?.key==="tree"&&Phaser.Math.Distance.Between(o.x??0,o.y??0,hx,hy)<HOUSE_CLEAR_RADIUS;
  for(const child of [...scene.children.list]) if(near(child)) child.destroy();
  for(const child of [...(scene.solidDecor?.getChildren?.()??[])]) if(near(child)) child.destroy();
}

function decorateHouseYard(scene: SceneLike,hx:number,hy:number){
  const d=(scene.dsort?.(hy+42)??12)-0.4;
  const g=scene.add.graphics().setDepth(d);
  for(let i=0;i<6;i++){g.fillStyle(i%2?0xc6b8a1:0xd9ccb5,0.95);g.fillRoundedRect(hx-15+(i%2)*6,hy+34+i*11,30,8,3);}
  g.fillStyle(0x47623f,0.94);g.fillRoundedRect(hx-82,hy+29,54,23,8);g.fillRoundedRect(hx+28,hy+29,54,23,8);
  for(const [x,y,c] of [[-73,34,0xe1789b],[-61,42,0xf2c3d0],[-49,34,0xd65e88],[-36,41,0xf0a8bc],[36,35,0xf0adbf],[49,42,0xd96f91],[62,34,0xf3d2da],[74,41,0xe481a0]] as [number,number,number][]) {g.fillStyle(c,1);g.fillCircle(hx+x,hy+y,3);}
  for(const x of [hx-55,hx+55]){g.fillStyle(0x292a30,1);g.fillRect(x-2,hy+43,4,25);g.fillStyle(0xf6ca70,1);g.fillRoundedRect(x-5,hy+39,10,10,2);}
  for(let i=0;i<4;i++){
    const puff=scene.add.ellipse(hx+31+i*3,hy-65-i*13,18+i*5,11+i*4,0xc8c4c3,0.12).setDepth(d-0.1);
    scene.tweens.add({targets:puff,y:puff.y-12,x:puff.x+5,alpha:0.03,duration:2600+i*350,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }
}

function hideOldInteractiveSprites(scene:SceneLike){
  for(const child of scene.children.list as any[]){
    const key=child?.texture?.key;
    if(["bed","chest","hearth"].includes(key)) child.setAlpha?.(0);
  }
}

function makeObject(scene:SceneLike, x:number, y:number, draw:(g:Phaser.GameObjects.Graphics)=>void){
  const g=scene.add.graphics();
  draw(g);
  g.setPosition(x,y);
  g.setData("home-remaster-object",true);
  g.setData("home-remaster-anchor",y);
  g.setDepth(1000+y);
  return g;
}

function drawInterior(scene:SceneLike){
  const ox=(scene.scale.width-ROOM_W)/2;
  const oy=(scene.scale.height-ROOM_H)/2;
  const fy=oy+118;
  const cx=ox+ROOM_W/2;

  const base=scene.add.graphics().setDepth(4.5);
  base.fillStyle(0x201611,1);base.fillRect(ox,oy,ROOM_W,ROOM_H);
  base.fillStyle(0xd7b994,1);base.fillRect(ox+12,oy+12,ROOM_W-24,104);
  base.fillStyle(0x51382a,1);base.fillRect(ox+12,fy-12,ROOM_W-24,16);
  base.fillStyle(0x7b5235,1);base.fillRect(ox+12,fy+4,ROOM_W-24,ROOM_H-134);
  for(let y=fy+4;y<oy+ROOM_H-12;y+=20){
    base.fillStyle(0x593a29,0.5);base.fillRect(ox+12,y,ROOM_W-24,2);
    base.fillStyle(0xc18b58,0.10);base.fillRect(ox+12,y+2,ROOM_W-24,2);
    for(let x=ox+34+(((y-fy)/20)%2)*42;x<ox+ROOM_W-18;x+=84)base.fillRect(x,y+2,2,18);
  }
  for(const x of [ox+14,ox+218,cx,cx+218,ox+ROOM_W-28]){base.fillStyle(0x493228,1);base.fillRect(x,oy+12,14,106);}
  base.fillStyle(0x3d2a21,1);base.fillRect(ox+12,oy+12,ROOM_W-24,12);

  for(const wx of [ox+145,cx+225]){
    base.fillStyle(0x493228,1);base.fillRoundedRect(wx-58,oy+28,116,72,4);
    base.fillStyle(0x547a90,1);base.fillRect(wx-49,oy+36,98,54);
    base.fillStyle(0xf0d08d,0.28);base.fillRect(wx-49,oy+36,98,17);
    base.fillStyle(0x493228,1);base.fillRect(wx-3,oy+36,6,54);base.fillRect(wx-49,oy+61,98,5);
    base.fillStyle(0x75465b,1);base.fillRoundedRect(wx-68,oy+22,22,82,5);base.fillRoundedRect(wx+46,oy+22,22,82,5);
    base.fillStyle(0xb76f89,1);base.fillRect(wx-61,oy+24,7,78);base.fillRect(wx+54,oy+24,7,78);
    base.fillStyle(0x5c4031,1);base.fillRect(wx-55,oy+92,110,9);
  }

  const rug=(x:number,y:number,w:number,h:number,fill:number,edge:number)=>{base.fillStyle(edge,0.9);base.fillRoundedRect(x-6,y-6,w+12,h+12,14);base.fillStyle(fill,0.95);base.fillRoundedRect(x,y,w,h,10);base.lineStyle(2,0xe6c795,0.48);base.strokeRoundedRect(x+10,y+10,w-20,h-20,8);};
  rug(ox+42,fy+55,190,150,0x865063,0x50313d);
  rug(cx+60,fy+150,235,175,0x48614b,0x304233);

  makeObject(scene,ox+104,fy+90,(g)=>{
    g.fillStyle(0x000000,0.28);g.fillEllipse(-70,28,170,54);
    g.fillStyle(0x4b3024,1);g.fillRoundedRect(-84,-34,168,74,10);
    g.fillStyle(0x704936,1);g.fillRoundedRect(-78,-28,156,58,8);
    g.fillStyle(0xd8c8b8,1);g.fillRoundedRect(-69,-23,138,45,10);
    g.fillStyle(0xb96c82,1);g.fillRoundedRect(-69,-2,138,37,8);
    g.fillStyle(0x8f5065,1);g.fillRoundedRect(-69,23,138,18,5);
    g.fillStyle(0x5a3829,1);g.fillRect(-84,35,168,12);
    g.fillStyle(0x744a35,1);g.fillRect(-78,41,156,8);
    g.fillStyle(0xeee2d4,1);g.fillRoundedRect(-52,-18,45,20,9);g.fillRoundedRect(7,-18,45,20,9);
    g.fillStyle(0x543429,1);g.fillRoundedRect(-86,-46,172,17,7);
    g.fillStyle(0x7d513c,1);g.fillRoundedRect(-75,-43,150,11,5);
    for(const x of [-75,75]){g.fillStyle(0x3f281f,1);g.fillCircle(x,43,5);}
  });

  makeObject(scene,ox+96,fy+210,(g)=>{
    g.fillStyle(0x000000,0.28);g.fillEllipse(0,18,88,30);
    g.fillStyle(0x4a2d1d,1);g.fillRoundedRect(-42,-2,84,36,6);
    g.fillStyle(0x754823,1);g.fillRoundedRect(-39,-15,78,25,10);
    g.fillStyle(0x966031,1);g.fillRoundedRect(-34,-10,68,16,8);
    g.fillStyle(0x2f3137,1);g.fillRect(-31,-14,5,45);g.fillRect(26,-14,5,45);
    g.fillStyle(0xcfa84b,1);g.fillRoundedRect(-7,8,14,16,3);g.fillStyle(0x2b1b11,1);g.fillRect(-2,14,4,6);
    g.fillStyle(0x3b2418,1);g.fillRect(-42,26,84,9);
  });

  makeObject(scene,cx,fy+34,(g)=>{
    g.fillStyle(0x000000,0.26);g.fillEllipse(0,26,150,36);
    g.fillStyle(0x5b5551,1);g.fillRoundedRect(-68,-70,136,98,8);
    for(let r=0;r<5;r++)for(let c=0;c<6;c++){g.fillStyle((r+c)%2?0x8c837a:0x9b9186,1);g.fillRoundedRect(-61+c*21+(r%2?7:0),-62+r*18,18,14,3);}
    g.fillStyle(0x4b2f22,1);g.fillRoundedRect(-42,-15,84,54,14);
    g.fillStyle(0x140d09,1);g.fillRoundedRect(-35,-8,70,46,12);
    g.fillStyle(0x5a3823,1);g.fillRect(-26,26,52,7);
    g.fillStyle(0x6a4427,1);g.fillRect(-21,21,42,7);
    g.fillStyle(0x5b3b2b,1);g.fillRoundedRect(-80,-79,160,14,5);
    g.fillStyle(0x8c6044,1);g.fillRoundedRect(-73,-76,146,7,3);
    g.fillStyle(0xff8a2b,1);g.fillTriangle(-20,27,0,-3,20,27);g.fillStyle(0xffd166,1);g.fillTriangle(-10,27,2,8,12,27);
  });

  makeObject(scene,cx+320,fy+72,(g)=>{
    g.fillStyle(0x000000,0.22);g.fillEllipse(0,56,90,24);g.fillStyle(0x4b3024,1);g.fillRoundedRect(-38,-72,76,126,5);
    g.fillStyle(0x744a35,1);g.fillRect(-31,-64,62,112);
    for(let y=-42;y<=25;y+=34){g.fillStyle(0x4d3225,1);g.fillRect(-31,y,62,5);}
    const cols=[0x874d5f,0x47604b,0x526481,0xa27648,0x7b5b83];
    for(let r=0;r<3;r++)for(let i=0;i<6;i++){g.fillStyle(cols[(r+i)%cols.length],1);g.fillRect(-27+i*9,-60+r*34,6,17+(i%2)*4);}
  });

  makeObject(scene,cx+285,fy+282,(g)=>{
    g.fillStyle(0x000000,0.24);g.fillEllipse(0,22,128,30);g.fillStyle(0x4f3326,1);g.fillRoundedRect(-58,-16,116,42,6);g.fillStyle(0x936344,1);g.fillRoundedRect(-52,-25,104,18,5);
    g.fillStyle(0x2f4436,1);g.fillRoundedRect(-42,-49,36,25,4);g.fillStyle(0xe9dfca,1);g.fillRoundedRect(8,-44,42,22,3);g.lineStyle(1,0x8f806d,0.8);g.lineBetween(29,-43,29,-23);
  });

  for(const [px,py,tone] of [[cx-90,oy+53,0x70866f],[cx+74,oy+50,0x906c79]] as [number,number,number][]) {base.fillStyle(0x583a2d,1);base.fillRect(px-28,py-21,56,43);base.fillStyle(tone,1);base.fillRect(px-21,py-14,42,30);base.fillStyle(0xe7c886,1);base.fillCircle(px+9,py-5,5);}
  for(const [px,py] of [[ox+48,fy+286],[cx+350,fy+248],[ox+335,oy+82]] as [number,number][]) {base.fillStyle(0x936043,1);base.fillRoundedRect(px-11,py+8,22,17,4);base.fillStyle(0x3f6642,1);base.fillCircle(px,py,15);base.fillStyle(0x64885a,1);base.fillCircle(px-9,py-8,8);base.fillCircle(px+8,py-9,8);}

  for(let i=0;i<14;i++){
    const mote=scene.add.circle(ox+70+(i*53)%(ROOM_W-140),fy+40+(i*79)%(ROOM_H-190),1.4,0xffe8b8,0.18).setDepth(35);
    scene.tweens.add({targets:mote,y:mote.y-8,alpha:{from:0.06,to:0.24},duration:1800+(i%4)*320,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }
}

export function installHomeRemaster(QuestScene:SceneCtor,QuestHouseScene:SceneCtor){
  const world=QuestScene.prototype;
  if(!world.__homeExteriorRemasterInstalled){
    world.__homeExteriorRemasterInstalled=true;
    const originalCreate=world.create;
    world.create=function(this:SceneLike,...args:any[]){
      const result=originalCreate.apply(this,args);
      redrawCottage(this);
      const spot=this.houseSpot?.() as [number,number]|null|undefined;
      if(spot){const [hx,hy]=spot;removeTreesNearHouse(this,hx,hy);decorateHouseYard(this,hx,hy);}
      return result;
    };
  }

  const house=QuestHouseScene.prototype;
  if(!house.__homeInteriorRemasterInstalled){
    house.__homeInteriorRemasterInstalled=true;
    const originalCreate=house.create;
    const originalUpdate=house.update;
    house.create=function(this:SceneLike,...args:any[]){
      const result=originalCreate.apply(this,args);
      hideOldInteractiveSprites(this);
      drawInterior(this);
      if(this.player?.active)this.player.setScale(1.08);
      return result;
    };
    house.update=function(this:SceneLike,...args:any[]){
      const result=originalUpdate?.apply(this,args);
      if(this.player?.active)this.player.setDepth(1000+this.player.y);
      const shadow=(this.children?.list??[]).find((o:any)=>o?.name==="shadow");
      if(shadow?.active){shadow.setPosition(this.player.x,this.player.y+18);shadow.setDepth(999+this.player.y);}
      return result;
    };
  }
}
