// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };
const ZONE = "wedding_garden";
const VISUALS = ["enemy-thorn-wisp", "enemy-rose-crawler", "enemy-hedge-spirit"] as const;

function canvas(scene: SceneLike, key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) {
  if (scene.textures.exists(key)) return;
  const t = scene.textures.createCanvas(key, w, h); if (!t) return;
  const c = t.getContext(); c.imageSmoothingEnabled = false; c.clearRect(0,0,w,h); draw(c); t.refresh();
}
function leaf(c:CanvasRenderingContext2D,x:number,y:number,rx:number,ry:number,col:string,a=0){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=col;c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI*2);c.fill();c.restore();}
function rose(c:CanvasRenderingContext2D,x:number,y:number,col="#d56f91"){c.fillStyle="#7b3c58";c.fillRect(x-3,y-2,7,5);c.fillStyle=col;c.fillRect(x-2,y-3,5,7);c.fillStyle="#f0b4c4";c.fillRect(x,y-1,2,2);}
function makeTextures(scene:SceneLike){
  canvas(scene,"enemy-thorn-wisp",38,42,c=>{
    c.fillStyle="rgba(20,35,25,.22)";c.beginPath();c.ellipse(19,38,12,3,0,0,7);c.fill();
    c.strokeStyle="#273e2d";c.lineWidth=5;c.beginPath();c.moveTo(19,32);c.quadraticCurveTo(12,24,18,13);c.stroke();
    [[12,21,-.5],[26,19,.5],[10,29,-.8],[27,28,.7]].forEach(([x,y,a])=>leaf(c,x,y,6,3,"#47734c",a));
    c.strokeStyle="#5f8758";c.lineWidth=2;c.beginPath();c.moveTo(16,23);c.lineTo(6,14);c.lineTo(10,9);c.moveTo(22,24);c.lineTo(31,13);c.lineTo(28,8);c.stroke();
    c.fillStyle="#b9f0b0";c.fillRect(14,14,3,3);c.fillRect(22,14,3,3);c.fillStyle="#203126";c.fillRect(15,15,1,1);c.fillRect(23,15,1,1);rose(c,20,8,"#d889a2");
  });
  canvas(scene,"enemy-rose-crawler",46,32,c=>{
    c.fillStyle="rgba(20,30,22,.24)";c.beginPath();c.ellipse(23,28,18,3,0,0,7);c.fill();
    c.strokeStyle="#26392b";c.lineWidth=8;c.beginPath();c.moveTo(8,23);c.bezierCurveTo(15,12,30,12,39,22);c.stroke();
    c.strokeStyle="#5d754b";c.lineWidth=3;[[8,23,3,28],[16,22,12,30],[30,22,34,30],[39,22,43,28]].forEach(([x,y,x2,y2])=>{c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();});
    [[13,15,-.4],[23,12,.1],[33,16,.5]].forEach(([x,y,a])=>leaf(c,x,y,7,4,"#4e7448",a));rose(c,16,11);rose(c,29,10,"#c85d7e");
    c.fillStyle="#ffe1b0";c.fillRect(38,17,3,2);c.fillStyle="#4b2732";c.fillRect(39,17,1,1);
  });
  canvas(scene,"enemy-hedge-spirit",42,48,c=>{
    c.fillStyle="rgba(21,34,24,.23)";c.beginPath();c.ellipse(21,44,14,3,0,0,7);c.fill();
    c.fillStyle="#24402d";c.fillRect(11,17,20,23);leaf(c,9,21,8,7,"#3c6743",-.2);leaf(c,33,21,8,7,"#48754a",.2);leaf(c,17,31,10,9,"#31593a",-.2);leaf(c,27,32,10,9,"#416c45",.2);
    c.strokeStyle="#617c54";c.lineWidth=3;c.beginPath();c.moveTo(13,27);c.lineTo(5,37);c.moveTo(30,27);c.lineTo(37,38);c.stroke();
    c.fillStyle="#ddd5bd";c.beginPath();c.ellipse(21,15,10,9,0,0,7);c.fill();c.fillStyle="#6f685b";c.fillRect(15,14,4,2);c.fillRect(24,14,4,2);c.fillStyle="#292d28";c.fillRect(16,14,2,2);c.fillRect(25,14,2,2);c.strokeStyle="#b9ad91";c.lineWidth=1;c.beginPath();c.moveTo(17,20);c.quadraticCurveTo(21,22,25,20);c.stroke();
    rose(c,11,8,"#e0a1b4");leaf(c,30,8,6,3,"#6c9561",.3);
  });
  canvas(scene,"enemy-bramble-guardian",62,62,c=>{
    c.fillStyle="rgba(20,29,21,.28)";c.beginPath();c.ellipse(31,57,22,5,0,0,7);c.fill();
    c.fillStyle="#27382a";c.beginPath();c.moveTo(17,50);c.lineTo(12,27);c.lineTo(20,12);c.lineTo(31,7);c.lineTo(44,15);c.lineTo(50,34);c.lineTo(44,52);c.closePath();c.fill();
    c.fillStyle="#405b3c";c.beginPath();c.moveTo(21,48);c.lineTo(18,28);c.lineTo(26,15);c.lineTo(35,13);c.lineTo(43,25);c.lineTo(42,47);c.closePath();c.fill();
    c.strokeStyle="#6f8656";c.lineWidth=6;c.beginPath();c.moveTo(17,27);c.lineTo(7,43);c.moveTo(45,28);c.lineTo(55,45);c.stroke();
    c.fillStyle="#c8c1ae";c.beginPath();c.moveTo(38,11);c.lineTo(51,8);c.lineTo(48,26);c.lineTo(39,24);c.closePath();c.fill();c.strokeStyle="#918978";c.lineWidth=2;c.beginPath();c.moveTo(42,13);c.lineTo(47,22);c.moveTo(48,11);c.lineTo(42,20);c.stroke();
    c.fillStyle="#f0d39a";c.fillRect(24,23,4,3);c.fillRect(34,23,4,3);c.fillStyle="#513d30";c.fillRect(25,24,2,1);c.fillRect(35,24,2,1);rose(c,22,12);rose(c,42,34,"#d47d9a");
    c.fillStyle="#6c7d50";[[14,18],[47,20],[11,34],[51,36]].forEach(([x,y])=>{c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y-7);c.lineTo(x+2,y-3);c.closePath();c.fill();});
  });
}
function chooseVisual(x:number,y:number){const n=Math.abs(Math.floor(x/32)*17+Math.floor(y/32)*31)%3;return VISUALS[n]!;}
function gardenBurst(scene:SceneLike,e:any,heavy=false){if(!e?.active)return;const cols=heavy?[0xd47d9a,0x78945f,0xd8c997]:[0xe8a4b7,0x7ba86d,0xf1d27c];for(let i=0;i<(heavy?9:5);i++){const p=scene.add.ellipse(e.x+Phaser.Math.Between(-7,7),e.y+Phaser.Math.Between(-6,5),Phaser.Math.Between(2,5),2,cols[i%cols.length],.8).setDepth((scene.dsort?.(e.y)??18)+1).setAngle(Phaser.Math.Between(-35,35));scene.tweens.add({targets:p,x:p.x+Phaser.Math.Between(-18,18),y:p.y-Phaser.Math.Between(10,28),alpha:0,duration:380,onComplete:()=>p.destroy()});}}
export function installAct2Enemies(QuestScene:SceneCtor){
  const p=QuestScene.prototype;if(p.__act2EnemiesInstalled)return;p.__act2EnemiesInstalled=true;
  const create=p.create;p.create=function(...args:any[]){const r=create.apply(this,args);makeTextures(this);return r;};
  const spawn=p.spawnEnemy;p.spawnEnemy=function(x:number,y:number,key:string,speed:number,temp:boolean){
    if(this.save?.current_zone!==ZONE)return spawn.call(this,x,y,key,speed,temp);
    makeTextures(this);
    const heavy=key==="enemy-brute";
    // Build through the already-upgraded enemy constructor so HP, damage, telegraph,
    // drops and collision remain identical; only swap the Wedding Garden artwork.
    const e=spawn.call(this,x,y,key,speed,temp) as Phaser.Physics.Arcade.Sprite|null;if(!e)return e;
    if(key.startsWith("enemy-") && !key.startsWith("enemy-bramble") && !key.startsWith("enemy-thorn") && !key.startsWith("enemy-rose") && !key.startsWith("enemy-hedge")){
      e.setTexture(heavy?"enemy-bramble-guardian":chooseVisual(x,y));e.setData("act2GardenEnemy",true);e.setData("act2GardenHeavy",heavy);e.clearTint();
      if(heavy){e.setScale(1.55);e.setCircle(16,8,8);} else {e.setScale(1.08);e.setCircle(10);}
    }
    return e;
  };
  const transform=p.transformEnemy;p.transformEnemy=function(e:any,...args:any[]){if(this.save?.current_zone===ZONE&&e?.getData?.("act2GardenEnemy"))gardenBurst(this,e,e.getData("act2GardenHeavy")===true);return transform.call(this,e,...args);};
}
