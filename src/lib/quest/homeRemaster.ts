// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const HOUSE_CLEAR_RADIUS = 190;
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

  // Foundation, rose plaster and timber frame.
  R(4,25,48,22,"#716765");
  R(5,27,46,17,"#bd7483");
  R(7,29,42,14,"#d99aa6");
  R(4,44,48,4,"#625b59");
  for(let x=5;x<51;x+=7)R(x,45,5,2,x%2?"#8e8580":"#756e6b");
  R(5,24,46,3,"#4d352d");
  for(const x of [7,27,47])R(x,26,2,18,"#624234");

  // Layered slate roof with visible eaves.
  ctx.fillStyle="#233249";
  ctx.beginPath();ctx.moveTo(1*sx,26*sy);ctx.lineTo(28*sx,5*sy);ctx.lineTo(55*sx,26*sy);ctx.closePath();ctx.fill();
  for(let y=9;y<=23;y+=4){
    const inset=Math.max(0,(22-y)*1.15);
    for(let x=5+inset;x<51-inset;x+=7){
      R(x,y,6,2,y%8?"#41546e":"#4a5e78");
      R(x,y+2,6,1,"#172538");
    }
  }
  R(2,24,52,3,"#1b2839");
  R(25,6,6,2,"#697a91");

  // Masonry chimney with individual blocks.
  R(41,4,7,13,"#766b67");R(40,3,9,3,"#514b49");
  for(const [x,y] of [[42,7],[45,10],[42,13]]){R(x,y,2,2,"#9b8e87");R(x+2,y,2,1,"#5b5451");}

  // Deep arched front door.
  R(20,31,16,15,"#2f201e");
  R(21,32,14,14,"#4c302a");
  ctx.fillStyle="#4c302a";ctx.beginPath();ctx.arc(28*sx,32*sy,7*sx,Math.PI,0);ctx.fill();
  R(22,34,2,10,"#704a3c");R(32,34,2,10,"#34211e");R(32,38,1,1,"#f0c86c");
  R(26,31,4,3,"#55704d");R(27,31,2,2,"#db829d");

  // Warm recessed windows, shutters and flower boxes.
  for(const x of [11,38]){
    R(x-3,27,14,12,"#322724");
    R(x-1,28,10,10,"#574038");
    R(x,29,8,8,"#ffd27c");R(x+1,30,6,6,"#ffe7a8");
    R(x+3.5,29,1,8,"#79594a");R(x,32.5,8,1,"#79594a");
    R(x-5,29,3,9,"#584239");R(x+10,29,3,9,"#584239");
    R(x-2,37,12,3,"#573c32");
    for(const [dx,c] of [[-1,"#dc7897"],[2,"#f0a8bd"],[5,"#cf6088"],[8,"#f1cbd6"]] as any[])R(x+dx,36,2,2,c);
  }

  // Roses and climbing greenery.
  for(const [x,y,c] of [[8,26,"#46633f"],[11,23,"#5f7c4c"],[15,22,"#46633f"],[18,26,"#607c4c"],[44,25,"#46633f"],[42,22,"#607c4c"],[38,21,"#46633f"],[35,26,"#607c4c"],[10,24,"#e27d9c"],[14,22,"#f0a9bc"],[18,26,"#d6698e"],[42,23,"#efa9bc"],[38,21,"#d6698e"],[35,27,"#e98fa8"],[20,30,"#597448"],[18,34,"#597448"],[18,38,"#6a8652"],[36,30,"#597448"],[38,35,"#6a8652"],[37,39,"#597448"],[19,32,"#f0a9bc"],[18,37,"#d6698e"],[36,32,"#e98fa8"],[38,36,"#f2bfd0"]] as [number,number,string][])R(x,y,2,2,c);
  for(const x of [19,35]){R(x,31,2,5,"#292a30");R(x,32,2,2,"#ffd36f");}
  R(21,45,14,2,"#aea39a");R(19,47,18,2,"#706865");
  texture.refresh?.();
}

function removeTreesNearHouse(scene: SceneLike,hx:number,hy:number){
  const near=(o:any)=>o?.active!==false&&o?.texture?.key==="tree"&&Phaser.Math.Distance.Between(o.x??0,o.y??0,hx,hy)<HOUSE_CLEAR_RADIUS;
  for(const child of [...scene.children.list])if(near(child))child.destroy();
  for(const child of [...(scene.solidDecor?.getChildren?.()??[])])if(near(child))child.destroy();
}

function decorateHouseYard(scene: SceneLike,hx:number,hy:number){
  const d=(scene.dsort?.(hy+42)??12)-0.4;
  const g=scene.add.graphics().setDepth(d);
  for(let i=0;i<7;i++){
    g.fillStyle(i%2?0xc5b6a0:0xddd0b9,0.96);
    g.fillRoundedRect(hx-16+(i%2)*7,hy+33+i*10,32,8,3);
  }
  g.fillStyle(0x3f5d3c,0.95);g.fillRoundedRect(hx-88,hy+27,58,26,9);g.fillRoundedRect(hx+30,hy+27,58,26,9);
  for(const [x,y,c] of [[-78,33,0xe1789b],[-65,42,0xf2c3d0],[-52,34,0xd65e88],[-38,42,0xf0a8bc],[38,35,0xf0adbf],[52,43,0xd96f91],[65,34,0xf3d2da],[78,42,0xe481a0]] as [number,number,number][]){g.fillStyle(c,1);g.fillCircle(hx+x,hy+y,3);}
  for(const x of [hx-58,hx+58]){
    g.fillStyle(0x292a30,1);g.fillRect(x-2,hy+42,4,26);
    g.fillStyle(0xf6ca70,1);g.fillRoundedRect(x-5,hy+38,10,11,2);
    for(let r=4;r>0;r--){g.fillStyle(0xffd174,0.01*r);g.fillCircle(x,hy+44,r*11);}
  }
  for(let i=0;i<4;i++){
    const puff=scene.add.ellipse(hx+31+i*3,hy-65-i*13,18+i*5,11+i*4,0xc8c4c3,0.12).setDepth(d-0.1);
    scene.tweens.add({targets:puff,y:puff.y-12,x:puff.x+5,alpha:0.03,duration:2600+i*350,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }
}

function hideOldInteractiveSprites(scene:SceneLike){
  for(const child of scene.children.list as any[]){
    const key=child?.texture?.key;
    if(["bed","chest","hearth"].includes(key))child.setAlpha?.(0);
  }
}

function makeObject(scene:SceneLike,x:number,y:number,draw:(g:Phaser.GameObjects.Graphics)=>void){
  const g=scene.add.graphics();
  draw(g);
  g.setPosition(x,y);
  g.setData("home-remaster-object",true);
  g.setData("home-remaster-anchor",y);
  g.setDepth(1000+y);
  return g;
}

function addSolid(scene:SceneLike,x:number,y:number,w:number,h:number){
  const blocker=scene.add.rectangle(x,y,w,h,0xff00ff,0).setDepth(-1000);
  scene.physics.add.existing(blocker,true);
  blocker.setData("home-remaster-solid",true);
  scene.physics.add.collider(scene.player,blocker);
  return blocker;
}

function drawInterior(scene:SceneLike){
  const ox=(scene.scale.width-ROOM_W)/2;
  const oy=(scene.scale.height-ROOM_H)/2;
  const fy=oy+118;
  const cx=ox+ROOM_W/2;

  const base=scene.add.graphics().setDepth(4.5);
  base.fillStyle(0x1d140f,1);base.fillRect(ox,oy,ROOM_W,ROOM_H);
  base.fillStyle(0xd7b994,1);base.fillRect(ox+12,oy+12,ROOM_W-24,104);
  base.fillStyle(0xcda782,0.22);base.fillRect(ox+12,oy+18,ROOM_W-24,16);
  base.fillStyle(0x4a3327,1);base.fillRect(ox+12,fy-12,ROOM_W-24,16);
  base.fillStyle(0x754b31,1);base.fillRect(ox+12,fy+4,ROOM_W-24,ROOM_H-134);

  // Floor boards with staggered joints, grain and edge highlights.
  for(let y=fy+4;y<oy+ROOM_H-12;y+=20){
    base.fillStyle(0x4f3325,0.56);base.fillRect(ox+12,y,ROOM_W-24,2);
    base.fillStyle(0xc18b58,0.11);base.fillRect(ox+12,y+2,ROOM_W-24,2);
    for(let x=ox+34+(((y-fy)/20)%2)*42;x<ox+ROOM_W-18;x+=84){
      base.fillStyle(0x493023,0.44);base.fillRect(x,y+2,2,18);
      base.fillStyle(0xd3a06a,0.08);base.fillRect(x+2,y+4,22,1);
    }
  }

  // Timber posts and beams.
  for(const x of [ox+14,ox+218,cx,cx+218,ox+ROOM_W-28]){
    base.fillStyle(0x432d24,1);base.fillRect(x,oy+12,14,106);
    base.fillStyle(0x6b4937,0.55);base.fillRect(x+2,oy+13,3,104);
  }
  base.fillStyle(0x39271f,1);base.fillRect(ox+12,oy+12,ROOM_W-24,12);

  // Recessed windows with sill depth and curtains.
  for(const wx of [ox+145,cx+225]){
    base.fillStyle(0x382823,1);base.fillRoundedRect(wx-61,oy+25,122,79,5);
    base.fillStyle(0x4d3730,1);base.fillRoundedRect(wx-57,oy+28,114,72,4);
    base.fillStyle(0x537b91,1);base.fillRect(wx-49,oy+36,98,54);
    base.fillStyle(0xf0d08d,0.30);base.fillRect(wx-49,oy+36,98,17);
    base.fillStyle(0x493228,1);base.fillRect(wx-3,oy+36,6,54);base.fillRect(wx-49,oy+61,98,5);
    base.fillStyle(0x714157,1);base.fillRoundedRect(wx-69,oy+21,23,84,5);base.fillRoundedRect(wx+46,oy+21,23,84,5);
    base.fillStyle(0xbb748f,1);base.fillRect(wx-62,oy+24,7,78);base.fillRect(wx+54,oy+24,7,78);
    base.fillStyle(0x50372b,1);base.fillRect(wx-57,oy+92,114,11);
    base.fillStyle(0x845d43,1);base.fillRect(wx-53,oy+92,106,4);
  }

  const rug=(x:number,y:number,w:number,h:number,fill:number,edge:number)=>{
    base.fillStyle(0x000000,0.18);base.fillRoundedRect(x-5,y+5,w+10,h+10,14);
    base.fillStyle(edge,0.94);base.fillRoundedRect(x-6,y-6,w+12,h+12,14);
    base.fillStyle(fill,0.97);base.fillRoundedRect(x,y,w,h,10);
    base.lineStyle(2,0xe6c795,0.50);base.strokeRoundedRect(x+10,y+10,w-20,h-20,8);
    base.lineStyle(1,0xf2ddb9,0.28);base.strokeRoundedRect(x+20,y+20,w-40,h-40,6);
  };
  rug(ox+38,fy+55,205,158,0x865063,0x50313d);
  rug(cx+50,fy+145,250,185,0x48614b,0x304233);

  // BED — thick frame, raised mattress, quilt and visible feet.
  makeObject(scene,ox+104,fy+90,(g)=>{
    g.fillStyle(0x000000,0.30);g.fillEllipse(0,41,186,48);
    g.fillStyle(0x3d281f,1);g.fillRoundedRect(-91,-39,182,91,10);
    g.fillStyle(0x633f30,1);g.fillRoundedRect(-85,-32,170,74,9);
    g.fillStyle(0x8a6047,1);g.fillRect(-82,35,164,14);
    g.fillStyle(0xdccfc0,1);g.fillRoundedRect(-74,-26,148,50,11);
    g.fillStyle(0xf0e6da,1);g.fillRoundedRect(-61,-21,49,21,10);g.fillRoundedRect(12,-21,49,21,10);
    g.fillStyle(0xbb7288,1);g.fillRoundedRect(-74,-2,148,38,8);
    g.fillStyle(0x985a70,1);g.fillRect(-74,19,148,17);
    g.lineStyle(2,0xd99caf,0.55);for(let x=-55;x<=55;x+=28)g.lineBetween(x,0,x,34);
    g.fillStyle(0x4d3026,1);g.fillRoundedRect(-94,-50,188,18,7);
    g.fillStyle(0x7d543d,1);g.fillRoundedRect(-81,-46,162,10,4);
    for(const x of [-82,82]){g.fillStyle(0x312019,1);g.fillRoundedRect(x-5,43,10,16,3);g.fillStyle(0x8b5c42,1);g.fillCircle(x,45,5);}
  });
  addSolid(scene,ox+104,fy+102,174,74);

  // CHEST — raised lid, iron bands and front face.
  makeObject(scene,ox+96,fy+220,(g)=>{
    g.fillStyle(0x000000,0.30);g.fillEllipse(0,23,92,28);
    g.fillStyle(0x3e271a,1);g.fillRoundedRect(-44,-1,88,38,6);
    g.fillStyle(0x704421,1);g.fillRoundedRect(-41,-17,82,27,11);
    g.fillStyle(0x9a6635,1);g.fillRoundedRect(-35,-11,70,17,8);
    g.fillStyle(0xb37a43,0.55);g.fillRoundedRect(-31,-9,62,6,5);
    g.fillStyle(0x292b31,1);g.fillRect(-32,-15,5,48);g.fillRect(27,-15,5,48);
    g.fillStyle(0x727780,1);g.fillRect(-31,-15,1,48);g.fillRect(28,-15,1,48);
    g.fillStyle(0xd1ab4e,1);g.fillRoundedRect(-7,9,14,17,3);g.fillStyle(0x291a11,1);g.fillRect(-2,15,4,6);
    g.fillStyle(0x321f16,1);g.fillRect(-44,29,88,9);
  });
  addSolid(scene,ox+96,fy+229,86,38);

  // FIREPLACE — deeper stone surround, projecting hearth and animated glow.
  makeObject(scene,cx,fy+34,(g)=>{
    g.fillStyle(0x000000,0.27);g.fillEllipse(0,31,168,38);
    g.fillStyle(0x514b47,1);g.fillRoundedRect(-72,-74,144,103,8);
    for(let r=0;r<5;r++)for(let c=0;c<6;c++){
      g.fillStyle((r+c)%2?0x857d75:0x989087,1);
      g.fillRoundedRect(-65+c*22+(r%2?7:0),-66+r*18,19,14,3);
      g.fillStyle(0xc3b9ae,0.22);g.fillRect(-63+c*22+(r%2?7:0),-64+r*18,15,2);
    }
    g.fillStyle(0x422b20,1);g.fillRoundedRect(-45,-16,90,59,14);
    g.fillStyle(0x120c08,1);g.fillRoundedRect(-37,-8,74,50,12);
    g.fillStyle(0x684327,1);g.fillRect(-27,27,54,8);g.fillStyle(0x795033,1);g.fillRect(-22,22,44,7);
    g.fillStyle(0x4d3428,1);g.fillRoundedRect(-84,-82,168,15,5);g.fillStyle(0x93684a,1);g.fillRoundedRect(-75,-79,150,8,3);
    g.fillStyle(0xff7f28,1);g.fillTriangle(-21,31,0,-5,21,31);g.fillStyle(0xffd16a,1);g.fillTriangle(-11,31,2,8,12,31);
    g.fillStyle(0xa78e7d,1);g.fillRoundedRect(-82,37,164,13,5);
  });
  addSolid(scene,cx,fy+51,154,58);

  // BOOKSHELF — thick side rails, shelves and uneven books.
  makeObject(scene,cx+318,fy+83,(g)=>{
    g.fillStyle(0x000000,0.23);g.fillEllipse(0,58,94,24);
    g.fillStyle(0x3c271e,1);g.fillRoundedRect(-41,-78,82,136,5);
    g.fillStyle(0x6e4734,1);g.fillRect(-34,-70,68,120);
    for(let y=-44;y<=30;y+=37){g.fillStyle(0x422a20,1);g.fillRect(-34,y,68,6);g.fillStyle(0xa06f4c,0.55);g.fillRect(-30,y,60,2);}
    const cols=[0x874d5f,0x47604b,0x526481,0xa27648,0x7b5b83,0x9a6f56];
    for(let r=0;r<3;r++)for(let i=0;i<6;i++){
      g.fillStyle(cols[(r+i)%cols.length],1);g.fillRect(-29+i*10,-66+r*37,7,18+(i%3)*3);
      if(i%2===0){g.fillStyle(0xd1b37f,0.45);g.fillRect(-28+i*10,-63+r*37,1,13);}
    }
  });
  addSolid(scene,cx+318,fy+105,82,74);

  // DINING TABLE — actual apron, legs, runner and tabletop clutter.
  makeObject(scene,ox+245,fy+265,(g)=>{
    g.fillStyle(0x000000,0.25);g.fillEllipse(0,36,184,44);
    g.fillStyle(0x3f291f,1);g.fillRoundedRect(-88,-17,176,61,8);
    g.fillStyle(0x8f6142,1);g.fillRoundedRect(-84,-30,168,28,8);
    g.fillStyle(0xb07c55,1);g.fillRoundedRect(-78,-26,156,20,6);
    g.fillStyle(0xd7b19a,0.72);g.fillRect(-9,-24,18,17);
    g.fillStyle(0x416443,1);g.fillCircle(0,-17,10);
    for(const dx of [-6,0,6]){g.fillStyle(dx===0?0xf0bfd0:0xdd7c9b,1);g.fillCircle(dx,-22,4);}
    for(const x of [-72,72]){g.fillStyle(0x3a241b,1);g.fillRect(x-5,0,10,48);g.fillStyle(0x6e4935,1);g.fillRect(x-3,2,4,43);}
    g.fillStyle(0x553729,1);g.fillRect(-84,-2,168,10);
  });
  addSolid(scene,ox+245,fy+286,170,64);

  // SOFA — raised arms, seat cushions, front skirt and feet.
  makeObject(scene,cx+83,fy+240,(g)=>{
    g.fillStyle(0x000000,0.24);g.fillEllipse(0,34,176,42);
    g.fillStyle(0x2d4436,1);g.fillRoundedRect(-82,-35,164,72,18);
    g.fillStyle(0x46664f,1);g.fillRoundedRect(-69,-28,138,46,13);
    g.fillStyle(0x5a7b61,1);g.fillRoundedRect(-60,-19,56,31,10);g.fillRoundedRect(4,-19,56,31,10);
    g.fillStyle(0xd7b8a5,1);g.fillRoundedRect(-48,-14,32,23,8);g.fillStyle(0xb66f87,1);g.fillRoundedRect(18,-14,32,23,8);
    g.fillStyle(0x26392f,1);g.fillRoundedRect(-88,-20,20,55,10);g.fillRoundedRect(68,-20,20,55,10);
    g.fillStyle(0x233128,1);g.fillRect(-76,23,152,15);
    for(const x of [-66,66]){g.fillStyle(0x2d211a,1);g.fillRect(x-4,35,8,11);}
  });
  addSolid(scene,cx+83,fy+258,174,58);

  // STUDY DESK — raised top, drawers, legs, open book and stacked volumes.
  makeObject(scene,cx+285,fy+350,(g)=>{
    g.fillStyle(0x000000,0.24);g.fillEllipse(0,30,142,34);
    g.fillStyle(0x3f291f,1);g.fillRoundedRect(-64,-17,128,52,7);
    g.fillStyle(0x936344,1);g.fillRoundedRect(-59,-28,118,18,5);
    g.fillStyle(0xb07b56,0.65);g.fillRoundedRect(-52,-25,104,6,4);
    g.fillStyle(0x2f4436,1);g.fillRoundedRect(-48,-52,38,27,4);
    g.fillStyle(0xe9dfca,1);g.fillRoundedRect(10,-47,45,23,3);g.lineStyle(1,0x8f806d,0.8);g.lineBetween(32,-46,32,-25);
    for(const [x,c] of [[-51,0x4f3528],[46,0x4f3528]] as [number,number][]){g.fillStyle(c,1);g.fillRect(x,-9,10,47);}
    g.fillStyle(0x6f4834,1);g.fillRoundedRect(-7,-7,48,28,4);g.fillStyle(0xc69b70,1);g.fillCircle(31,7,2);
  });
  addSolid(scene,cx+285,fy+369,132,52);

  // KITCHEN COUNTER — wall-backed cabinetry with sink and shelf depth.
  makeObject(scene,ox+325,fy+42,(g)=>{
    g.fillStyle(0x000000,0.20);g.fillEllipse(0,37,180,28);
    g.fillStyle(0x463025,1);g.fillRoundedRect(-88,-31,176,69,6);
    g.fillStyle(0x76513a,1);g.fillRect(-82,-22,164,54);
    g.fillStyle(0xa57b59,1);g.fillRoundedRect(-91,-36,182,16,5);
    g.fillStyle(0xc29870,0.7);g.fillRect(-82,-33,164,5);
    for(let x=-72;x<=50;x+=42){g.fillStyle(0x60412f,1);g.fillRoundedRect(x,-14,34,38,3);g.fillStyle(0xd2ad7c,1);g.fillCircle(x+17,4,2);}
    g.fillStyle(0x6f8583,1);g.fillRoundedRect(-29,-32,58,15,4);g.fillStyle(0xaeb9b6,1);g.fillRect(-24,-30,48,4);
    g.lineStyle(4,0x7e807c,1);g.beginPath();g.moveTo(0,-37);g.lineTo(0,-52);g.lineTo(14,-52);g.strokePath();
    g.fillStyle(0x4b3429,1);g.fillRoundedRect(-68,-68,136,9,3);
    for(const x of [-54,-18,18,54]){g.fillStyle(0x8e6a4d,1);g.fillRoundedRect(x-7,-82,14,14,3);g.fillStyle(0x506947,1);g.fillCircle(x,-84,6);}
  });
  addSolid(scene,ox+325,fy+60,182,62);

  // Plants and framed memories.
  for(const [px,py] of [[ox+50,fy+315],[cx+360,fy+292],[ox+345,oy+83]] as [number,number][]){
    const p=makeObject(scene,px,py,(g)=>{g.fillStyle(0x000000,0.16);g.fillEllipse(0,16,34,12);g.fillStyle(0x8b5b41,1);g.fillRoundedRect(-12,4,24,20,5);g.fillStyle(0x3f6642,1);g.fillCircle(0,-2,16);g.fillStyle(0x64885a,1);g.fillCircle(-9,-10,8);g.fillCircle(8,-11,8);});
    p.setDepth(1000+py);
  }
  for(const [px,py,tone] of [[cx-90,oy+53,0x70866f],[cx+74,oy+50,0x906c79]] as [number,number,number][]){
    base.fillStyle(0x4f352b,1);base.fillRect(px-30,py-23,60,47);base.fillStyle(0xb48662,0.65);base.fillRect(px-26,py-19,52,39);base.fillStyle(tone,1);base.fillRect(px-21,py-14,42,30);base.fillStyle(0xe7c886,1);base.fillCircle(px+9,py-5,5);
  }

  // Candles and warm light pools.
  for(const [lx,ly] of [[cx-78,fy+76],[cx+160,fy+332],[ox+406,fy+330]] as [number,number][]){
    const c=scene.add.graphics().setDepth(1000+ly);c.fillStyle(0xe8d8bc,1);c.fillRect(lx-3,ly,6,17);c.fillStyle(0xffc95f,1);c.fillCircle(lx,ly-4,4);
    const light=scene.add.sprite(lx,ly-2,"light-warm").setDepth(999+ly).setBlendMode(Phaser.BlendModes.ADD).setScale(0.48).setAlpha(0.14);
    scene.tweens.add({targets:light,alpha:{from:0.10,to:0.18},scale:{from:0.45,to:0.52},duration:1200+Math.random()*500,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
  }

  // Atmospheric motes, kept subtle.
  for(let i=0;i<10;i++){
    const mote=scene.add.circle(ox+70+(i*71)%(ROOM_W-140),fy+40+(i*83)%(ROOM_H-190),1.2,0xffe8b8,0.13).setDepth(35);
    scene.tweens.add({targets:mote,y:mote.y-7,alpha:{from:0.04,to:0.18},duration:1900+(i%4)*310,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});
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
      if(this.player?.active){
        this.player.setScale(1.08);
        const body=this.player.body as Phaser.Physics.Arcade.Body|undefined;
        body?.setSize?.(14,18,true);
        body?.setOffset?.(5,14);
      }
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
