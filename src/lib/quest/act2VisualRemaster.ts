import Phaser from "phaser";

// Wedding Garden visual-only remaster. Gameplay geometry, interactables and collisions stay in scene.ts.
type SceneLike = Phaser.Scene & Record<string, any>;
const TAG = "act2VisualRemaster";
const ZONE = "wedding_garden";

function isAct2(scene: SceneLike) { return scene.save?.current_zone === ZONE; }
function wx(scene: SceneLike, n: number) { return scene.wx(n); }
function wy(scene: SceneLike, n: number) { return scene.wy(n); }
function tag<T extends Phaser.GameObjects.GameObject>(o: T): T { o.setData(TAG, true); return o; }

function cleanup(scene: SceneLike) {
  scene.tweens?.getAllTweens?.().forEach((t: Phaser.Tweens.Tween) => {
    const targets = (t as any).targets ?? [];
    if (targets.some((x: any) => x?.getData?.(TAG))) t.stop();
  });
  scene.children?.list?.filter((o: any) => o?.getData?.(TAG)).forEach((o: any) => o.destroy?.());
}

function canvasTexture(scene: SceneLike, key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, w, h);
  const c = tex.getContext();
  c.imageSmoothingEnabled = false;
  draw(c);
  tex.refresh();
}

function makeTextures(scene: SceneLike) {
  canvasTexture(scene, "act2-hedge-premium", 64, 48, c => {
    c.fillStyle="#173c2b"; c.fillRect(6,15,52,27);
    const leaves=[[9,17,10,"#27583b"],[18,10,13,"#3f754b"],[31,12,14,"#326844"],[44,8,12,"#4c8151"],[52,17,9,"#285b3d"],[13,27,11,"#3a7048"],[27,25,13,"#4a8050"],[42,27,12,"#376b45"]] as const;
    for(const [x,y,r,col] of leaves){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
    c.fillStyle="#76a763"; [[16,12],[35,10],[48,16],[25,23]].forEach(([x,y])=>c.fillRect(x,y,3,3));
    c.fillStyle="#e7c5d3"; [[12,22],[39,18],[53,25]].forEach(([x,y])=>{c.fillRect(x,y,3,2);c.fillRect(x+1,y-1,1,4);});
    c.fillStyle="rgba(10,28,20,.28)";c.fillRect(8,42,48,3);
  });
  canvasTexture(scene,"act2-flowerbed-premium",96,48,c=>{
    c.fillStyle="rgba(56,42,29,.28)";c.beginPath();c.ellipse(48,33,43,11,0,0,Math.PI*2);c.fill();
    const flowers=[[14,26,"#f4e7df"],[24,19,"#e8a6b6"],[34,29,"#fff4d2"],[45,17,"#d8b5dd"],[56,27,"#f4c1c9"],[68,18,"#f8ead8"],[78,28,"#cba5d7"],[86,21,"#f1c7a0"]] as const;
    flowers.forEach(([x,y,col],i)=>{c.strokeStyle="#47714b";c.beginPath();c.moveTo(x,y+10);c.lineTo(x,y+2);c.stroke();c.fillStyle=col;c.fillRect(x-3,y,7,3);c.fillRect(x-1,y-2,3,7);c.fillStyle="#d8ad55";c.fillRect(x,y+1,2,2); if(i%2===0){c.fillStyle="#5d8956";c.fillRect(x-4,y+6,4,2);}});
  });
  canvasTexture(scene,"act2-trellis",72,100,c=>{
    c.strokeStyle="#eee7d8";c.lineWidth=4;c.beginPath();c.moveTo(9,94);c.lineTo(9,30);c.quadraticCurveTo(36,3,63,30);c.lineTo(63,94);c.stroke();
    c.lineWidth=2; for(let x=20;x<60;x+=12){c.beginPath();c.moveTo(x,91);c.lineTo(x-8,30);c.stroke();}
    c.strokeStyle="#568253";c.lineWidth=3;c.beginPath();c.moveTo(12,85);c.bezierCurveTo(48,72,16,51,58,34);c.stroke();
    c.fillStyle="#d98fa8";[[16,76],[40,65],[26,49],[55,39],[35,25]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,4,0,7);c.fill();});
  });
  canvasTexture(scene,"act2-bench",88,48,c=>{
    c.fillStyle="rgba(33,36,31,.22)";c.beginPath();c.ellipse(44,43,38,5,0,0,7);c.fill();
    c.strokeStyle="#51493e";c.lineWidth=3;[18,70].forEach(x=>{c.beginPath();c.moveTo(x,28);c.lineTo(x-3,44);c.stroke();});
    c.fillStyle="#8a654b";c.fillRect(10,18,68,7);c.fillStyle="#ad8060";c.fillRect(12,19,64,2);c.fillStyle="#76543f";c.fillRect(8,29,72,7);c.fillStyle="#b78a67";c.fillRect(11,30,66,2);
  });
  canvasTexture(scene,"act2-lamp",36,88,c=>{
    c.fillStyle="rgba(40,31,22,.2)";c.beginPath();c.ellipse(18,84,13,3,0,0,7);c.fill(); c.fillStyle="#3d4341";c.fillRect(16,28,4,55);c.fillRect(10,80,16,4);
    c.fillStyle="#c6a85d";c.fillRect(9,14,18,18);c.fillStyle="#fff0ae";c.fillRect(12,17,12,12);c.strokeStyle="#ede3cf";c.lineWidth=2;c.strokeRect(8,13,20,20);c.fillStyle="#e8dcc6";c.fillRect(15,7,6,7);
  });
  canvasTexture(scene,"act2-fountain",190,130,c=>{
    c.fillStyle="rgba(38,48,42,.2)";c.beginPath();c.ellipse(95,116,82,10,0,0,7);c.fill();
    c.fillStyle="#b9b7aa";c.beginPath();c.ellipse(95,86,88,31,0,0,7);c.fill();c.fillStyle="#e7e2d0";c.beginPath();c.ellipse(95,80,82,27,0,0,7);c.fill();c.fillStyle="#6fb8bd";c.beginPath();c.ellipse(95,79,70,20,0,0,7);c.fill();c.strokeStyle="#d9f5ef";c.lineWidth=3;c.beginPath();c.ellipse(95,78,54,13,0,0,7);c.stroke();
    c.fillStyle="#d6d2c3";c.fillRect(86,35,18,45);c.fillStyle="#eee8d8";c.fillRect(90,35,7,43);c.beginPath();c.ellipse(95,37,31,9,0,0,7);c.fill();
    c.strokeStyle="#aee8e2";c.lineWidth=3;[-18,0,18].forEach(dx=>{c.beginPath();c.moveTo(95+dx,35);c.quadraticCurveTo(95+dx*1.8,55,95+dx*2,69);c.stroke();});
    c.fillStyle="#8aa56a";[[24,95],[33,104],[157,101],[166,92]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,7,0,7);c.fill();});
    c.fillStyle="#e4a5b7";[[28,91],[161,96]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,4,0,7);c.fill();});
  });
  canvasTexture(scene,"act2-conservatory",360,300,c=>{
    c.fillStyle="rgba(35,45,39,.22)";c.beginPath();c.ellipse(180,284,158,12,0,0,7);c.fill();
    c.fillStyle="#d7d2c2";c.fillRect(24,260,312,22);c.fillStyle="#f4f0e4";c.fillRect(29,261,302,7);
    c.fillStyle="rgba(153,216,205,.38)";c.fillRect(43,112,274,148);
    c.strokeStyle="#f1eee4";c.lineWidth=8;c.strokeRect(39,108,282,154);
    c.beginPath();c.moveTo(39,110);c.quadraticCurveTo(180,-12,321,110);c.stroke();
    c.strokeStyle="#c9ad62";c.lineWidth=3;c.beginPath();c.moveTo(43,108);c.quadraticCurveTo(180,0,317,108);c.stroke();
    c.strokeStyle="#ece8dc";c.lineWidth=4; for(let x=74;x<=286;x+=35){c.beginPath();c.moveTo(x,88);c.lineTo(x,260);c.stroke();}
    c.beginPath();c.moveTo(42,160);c.lineTo(318,160);c.moveTo(42,211);c.lineTo(318,211);c.stroke();
    c.fillStyle="rgba(255,239,176,.22)";c.fillRect(48,116,264,138);
    c.fillStyle="#335c3d";[[62,235],[88,225],[270,231],[298,220]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,20,0,7);c.fill();});
    c.fillStyle="#d78ca7";[[61,219],[93,210],[279,215],[301,203]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,5,0,7);c.fill();});
    c.fillStyle="#f5f0e4";c.fillRect(151,174,58,88);c.strokeStyle="#c7a758";c.lineWidth=4;c.strokeRect(151,174,58,88);c.fillStyle="rgba(87,137,129,.5)";c.fillRect(160,185,40,77);
    c.fillStyle="#c9a95d";c.beginPath();c.moveTo(180,50);c.lineTo(189,64);c.lineTo(205,67);c.lineTo(193,78);c.lineTo(196,94);c.lineTo(180,87);c.lineTo(164,94);c.lineTo(167,78);c.lineTo(155,67);c.lineTo(171,64);c.closePath();c.fill();
    c.strokeStyle="rgba(255,255,255,.8)";c.lineWidth=2;c.beginPath();c.moveTo(65,128);c.lineTo(118,75);c.moveTo(226,92);c.lineTo(286,144);c.stroke();
  });
  const seasonCols: Record<string,[string,string]>={Spring:["#e8a9bd","#72a56c"],Summer:["#f2c35d","#4f8b52"],Autumn:["#c97845","#8b6a43"],Winter:["#cde8ec","#7599a9"]};
  Object.entries(seasonCols).forEach(([name,[accent,leaf]])=>canvasTexture(scene,`act2-shrine-${name.toLowerCase()}`,84,84,c=>{
    c.fillStyle="rgba(40,39,33,.18)";c.beginPath();c.ellipse(42,72,34,7,0,0,7);c.fill(); c.fillStyle="#b9b19d";c.fillRect(19,57,46,13);c.fillStyle="#ded7c4";c.fillRect(23,51,38,9);c.fillStyle="#c9a75b";c.fillRect(40,25,4,28);
    c.fillStyle=leaf;[[17,47],[25,36],[61,46],[57,34]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,8,0,7);c.fill();}); c.fillStyle=accent;[[20,42],[28,31],[61,40],[54,29]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,3,0,7);c.fill();});
    c.strokeStyle=accent;c.lineWidth=2;c.beginPath();c.arc(42,27,10,0,7);c.stroke();
  }));
}

function sprite(scene: SceneLike, x:number,y:number,key:string,depth=2,alpha=1){return tag(scene.add.image(wx(scene,x),wy(scene,y),key).setDepth(depth).setAlpha(alpha));}
function petal(scene: SceneLike,x:number,y:number,col:number){const p=tag(scene.add.circle(wx(scene,x),wy(scene,y),2,col,.65).setDepth(3));scene.tweens.add({targets:p,x:p.x+Phaser.Math.Between(-14,18),y:p.y+Phaser.Math.Between(18,34),alpha:{from:.65,to:.08},duration:Phaser.Math.Between(2600,4200),yoyo:true,repeat:-1,ease:"Sine.easeInOut"});}

function decorate(scene: SceneLike){
  if(!isAct2(scene)) return; cleanup(scene); makeTextures(scene);
  // Premium leafy overlays preserve the original hedge tile collision/layout beneath them.
  const beds:[[number,number,number,number],...Array<[number,number,number,number]>]=[[14,12,20,8],[92,12,20,8],[14,76,20,8],[92,76,20,8],[56,20,20,6]];
  beds.forEach(([x,y,w,h],bi)=>{
    for(let xx=x;xx<=x+w;xx+=3){sprite(scene,xx,y,"act2-hedge-premium",4,.96);sprite(scene,xx,y+h,"act2-hedge-premium",4,.96);}
    for(let yy=y+2;yy<y+h;yy+=3){sprite(scene,x,yy,"act2-hedge-premium",4,.96);sprite(scene,x+w,yy,"act2-hedge-premium",4,.96);}
    sprite(scene,x+w/2,y+h/2,"act2-flowerbed-premium",2,.95).setScale(Math.min(1.35,w/15),1);
    if(bi<4) sprite(scene,x+(bi%2?2:w-2),y+h/2,"act2-trellis",3,.92).setScale(.72);
  });
  // Outer hedge reads as organic without touching its solid tile boundary.
  for(let x=5;x<128;x+=5){sprite(scene,x,3,"act2-hedge-premium",4,.94);sprite(scene,x,98,"act2-hedge-premium",4,.94);} for(let y=8;y<96;y+=5){sprite(scene,3,y,"act2-hedge-premium",4,.94);sprite(scene,128,y,"act2-hedge-premium",4,.94);}
  // Promenade furniture: fewer, better pieces.
  [[58,68],[76,68]].forEach(([x,y])=>sprite(scene,x,y,"act2-bench",5));
  [[30,50],[66,40],[100,60],[48,64]].forEach(([x,y])=>{const l=sprite(scene,x,y,"act2-lamp",5);const glow=tag(scene.add.circle(l.x,l.y-26,18,0xffe7a0,.08).setDepth(4));scene.tweens.add({targets:glow,alpha:{from:.05,to:.14},scale:{from:.9,to:1.08},duration:1900,yoyo:true,repeat:-1});});
  // Fountain court landmark.
  const f=sprite(scene,66,54,"act2-fountain",6);scene.tweens.add({targets:f,alpha:{from:.94,to:1},duration:1800,yoyo:true,repeat:-1});
  for(let i=0;i<7;i++){const r=tag(scene.add.ellipse(f.x,f.y+24,40+i*9,12+i*2,0xd9ffff,0).setStrokeStyle(1,0xd8ffff,.28).setDepth(5));scene.tweens.add({targets:r,alpha:{from:.05,to:.34},scale:{from:.72,to:1.18},duration:1700+i*170,repeat:-1});}
  // Conservatory: large visual shell over the existing marble footprint; door interaction remains untouched.
  const cons=sprite(scene,121,50,"act2-conservatory",7);cons.setOrigin(.72,.5).setScale(1.04);
  const warm=tag(scene.add.ellipse(wx(scene,121),wy(scene,51),190,115,0xffe6a8,.055).setDepth(6));scene.tweens.add({targets:warm,alpha:{from:.035,to:.09},duration:2600,yoyo:true,repeat:-1});
  // Seasonal shrines stay small and never replace the actual key interactables/beacons.
  const seasons=[{n:"spring",x:18,y:18,c:0xf2b8c9},{n:"summer",x:96,y:18,c:0xffd267},{n:"autumn",x:18,y:82,c:0xd4854f},{n:"winter",x:96,y:82,c:0xcdefff}];
  seasons.forEach((s,i)=>{const sh=sprite(scene,s.x,s.y+1,`act2-shrine-${s.n}`,3,.94);sh.setScale(.82);const aura=tag(scene.add.circle(sh.x,sh.y,30,s.c,.055).setDepth(2));scene.tweens.add({targets:aura,alpha:{from:.025,to:.11},scale:{from:.9,to:1.08},duration:2100+i*190,yoyo:true,repeat:-1});for(let j=0;j<3;j++)petal(scene,s.x+Phaser.Math.Between(-3,3),s.y+Phaser.Math.Between(-3,2),s.c);});
  // restrained romantic life; no new gameplay objects.
  [[36,31],[51,73],[83,26],[89,66],[27,58],[72,82]].forEach(([x,y],i)=>{const b=tag(scene.add.ellipse(wx(scene,x),wy(scene,y),5,3,i%2?0xf1c0d0:0xffe7a3,.72).setDepth(8));scene.tweens.add({targets:b,x:b.x+Phaser.Math.Between(-24,24),y:b.y+Phaser.Math.Between(-14,14),angle:{from:-18,to:18},duration:2200+i*210,yoyo:true,repeat:-1,ease:"Sine.easeInOut"});});
}

export function installAct2VisualRemaster(QuestSceneClass:any){
  const proto=QuestSceneClass?.prototype;if(!proto||proto.__act2VisualRemasterInstalled)return;proto.__act2VisualRemasterInstalled=true;
  const originalCreate=proto.create;proto.create=function(...args:any[]){const r=originalCreate.apply(this,args);this.time.delayedCall(260,()=>decorate(this));return r;};
  const originalBuild=proto.buildAct2; if(typeof originalBuild==="function") proto.buildAct2=function(...args:any[]){const r=originalBuild.apply(this,args);this.time.delayedCall(80,()=>decorate(this));return r;};
  const originalResume=proto.onResume; if(typeof originalResume==="function") proto.onResume=function(...args:any[]){const r=originalResume.apply(this,args);if(isAct2(this))this.time.delayedCall(120,()=>decorate(this));return r;};
}
