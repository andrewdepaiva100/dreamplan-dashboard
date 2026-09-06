// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const TRACK = "lastCrossingDefense";

function act1(s: SceneLike) {
  return s.save?.current_zone === "sunlit_shores";
}

function wardenDown(s: SceneLike) {
  return Boolean(s.save?.relics_collected?.includes?.("lantern"));
}

function tracked<T extends any>(o: T): T {
  o?.setData?.(TRACK, true);
  return o;
}

function cleanup(s: SceneLike) {
  for (const child of [...(s.children?.list ?? [])]) {
    const o = child as any;
    if (!o?.getData?.(TRACK)) continue;
    s.tweens?.killTweensOf?.(o);
    o.destroy?.();
  }
}

function makeTextures(s: SceneLike) {
  const canvas = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
    if (s.textures.exists(key)) return;
    const t = s.textures.createCanvas(key, w, h)!;
    const c = t.getContext();
    c.imageSmoothingEnabled = false;
    c.clearRect(0, 0, w, h);
    draw(c);
    t.refresh();
  };

  canvas("crossing-defense-timber", 58, 30, (c) => {
    c.fillStyle = "rgba(34,25,18,.22)";
    c.beginPath();
    c.ellipse(29, 26, 25, 4, 0, 0, Math.PI * 2);
    c.fill();
    [[5, 17, 49, 7, -.07], [9, 9, 43, 7, .05]].forEach(([x, y, w, h, a], i) => {
      c.save();
      c.translate(Number(x) + Number(w) / 2, Number(y) + Number(h) / 2);
      c.rotate(Number(a));
      c.fillStyle = i ? "#765138" : "#60412f";
      c.fillRect(-Number(w) / 2, -Number(h) / 2, Number(w), Number(h));
      c.fillStyle = "rgba(224,177,111,.28)";
      c.fillRect(-Number(w) / 2 + 3, -Number(h) / 2 + 1, Number(w) - 8, 1);
      c.strokeStyle = "#3e2d23";
      c.beginPath();
      c.moveTo(-18, 1);
      c.lineTo(13, -1);
      c.moveTo(-8, 2);
      c.lineTo(20, 1);
      c.stroke();
      c.restore();
    });
    c.strokeStyle = "#b59a69";
    c.lineWidth = 2;
    c.beginPath();
    c.arc(18, 14, 7, .2, 2.8);
    c.stroke();
  });

  canvas("crossing-defense-supplies", 42, 34, (c) => {
    c.fillStyle = "rgba(40,28,19,.2)";
    c.beginPath();
    c.ellipse(21, 30, 17, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#674831";
    c.beginPath();
    c.moveTo(5, 13);
    c.lineTo(31, 11);
    c.lineTo(35, 28);
    c.lineTo(7, 29);
    c.closePath();
    c.fill();
    c.strokeStyle = "#a27a4e";
    c.strokeRect(9, 15, 21, 11);
    c.strokeStyle = "#3e2d24";
    c.beginPath();
    c.moveTo(10, 16);
    c.lineTo(29, 25);
    c.moveTo(29, 16);
    c.lineTo(10, 25);
    c.stroke();
    c.fillStyle = "#9d5861";
    c.beginPath();
    c.moveTo(22, 7);
    c.quadraticCurveTo(33, 4, 37, 12);
    c.lineTo(29, 15);
    c.quadraticCurveTo(26, 10, 22, 7);
    c.fill();
  });

  canvas("crossing-defense-sign", 42, 44, (c) => {
    c.fillStyle = "rgba(34,24,17,.2)";
    c.beginPath();
    c.ellipse(21, 40, 13, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#4a3427";
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(20, 41);
    c.lineTo(21, 15);
    c.stroke();
    c.fillStyle = "#6f4b33";
    c.beginPath();
    c.moveTo(3, 8);
    c.lineTo(37, 6);
    c.lineTo(39, 22);
    c.lineTo(5, 24);
    c.closePath();
    c.fill();
    c.strokeStyle = "#a87d50";
    c.lineWidth = 1;
    c.stroke();
    c.fillStyle = "#ead7a6";
    c.font = "bold 5px serif";
    c.textAlign = "center";
    c.fillText("RIVER CROSSING", 21, 13);
    c.fillText("KEEP BACK", 21, 19);
  });

  canvas("crossing-defense-tools", 42, 28, (c) => {
    c.fillStyle = "rgba(38,27,19,.18)";
    c.beginPath();
    c.ellipse(20, 25, 17, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#654631";
    c.beginPath();
    c.moveTo(5, 12);
    c.lineTo(31, 10);
    c.lineTo(35, 24);
    c.lineTo(6, 25);
    c.closePath();
    c.fill();
    c.strokeStyle = "#b08350";
    c.strokeRect(9, 14, 21, 8);
    c.strokeStyle = "#c8b17d";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(28, 5);
    c.lineTo(17, 19);
    c.stroke();
    c.fillStyle = "#62676a";
    c.fillRect(26, 3, 9, 5);
  });

  canvas("crossing-defense-herbs", 46, 34, (c) => {
    c.fillStyle = "rgba(37,31,21,.16)";
    c.beginPath();
    c.ellipse(23, 30, 17, 3, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#7b573b";
    c.beginPath();
    c.moveTo(7, 19);
    c.lineTo(38, 18);
    c.lineTo(35, 29);
    c.lineTo(10, 30);
    c.closePath();
    c.fill();
    c.fillStyle = "#55724a";
    for (let i = 0; i < 6; i++) {
      const x = 11 + i * 5;
      c.fillRect(x, 8, 1, 12);
      c.beginPath();
      c.ellipse(x - 2, 10 + i % 3, 3, 2, -.5, 0, Math.PI * 2);
      c.ellipse(x + 2, 14 - i % 2, 3, 2, .5, 0, Math.PI * 2);
      c.fill();
    }
    c.fillStyle = "#f0d9b8";
    c.fillRect(27, 20, 8, 5);
    c.fillStyle = "#b86d83";
    c.fillRect(29, 18, 4, 2);
  });

  canvas("crossing-defense-shield", 30, 34, (c) => {
    c.fillStyle = "rgba(31,24,19,.18)";
    c.beginPath();
    c.ellipse(15, 31, 11, 2, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#707b82";
    c.beginPath();
    c.moveTo(5, 5);
    c.quadraticCurveTo(15, 1, 25, 5);
    c.lineTo(23, 20);
    c.quadraticCurveTo(15, 29, 7, 20);
    c.closePath();
    c.fill();
    c.strokeStyle = "#b38b55";
    c.lineWidth = 2;
    c.stroke();
    c.strokeStyle = "#4c5960";
    c.beginPath();
    c.moveTo(15, 5);
    c.lineTo(15, 24);
    c.moveTo(8, 11);
    c.lineTo(22, 11);
    c.stroke();
    c.strokeStyle = "#3e4447";
    c.beginPath();
    c.moveTo(7, 8);
    c.lineTo(12, 13);
    c.lineTo(9, 18);
    c.stroke();
  });

  canvas("crossing-defense-flowers", 44, 26, (c) => {
    c.fillStyle = "rgba(44,47,29,.12)";
    c.beginPath();
    c.ellipse(22, 23, 18, 3, 0, 0, Math.PI * 2);
    c.fill();
    for (let i = 0; i < 9; i++) {
      const x = 5 + i * 4;
      const y = 17 - (i % 3) * 3;
      c.strokeStyle = "#55784d";
      c.beginPath();
      c.moveTo(x, 23);
      c.lineTo(x, y);
      c.stroke();
      c.fillStyle = i % 2 ? "#f3b5c7" : "#fff0d6";
      c.beginPath();
      c.arc(x - 2, y, 2, 0, Math.PI * 2);
      c.arc(x + 2, y, 2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#d9ad50";
      c.fillRect(x, y, 1, 1);
    }
  });
}

function prop(s: SceneLike, key: string, x: number, y: number, scale = 1, angle = 0) {
  return tracked(s.add.sprite(x, y, key).setScale(scale).setAngle(angle).setDepth(s.dsort?.(y) ?? 10));
}

function decorate(s: SceneLike) {
  cleanup(s);
  if (!act1(s)) return;
  const c = s.__lastCrossingCenter;
  if (!c) return;
  makeTextures(s);
  const safe = wardenDown(s);

  if (!safe) {
    prop(s, "crossing-defense-timber", c.x + 188, c.y - 28, .95, -4);
    prop(s, "crossing-defense-supplies", c.x + 151, c.y + 84, .9, 2);
    prop(s, "crossing-defense-sign", c.x + 232, c.y - 34, .92, -3);
    prop(s, "crossing-defense-shield", c.x - 148, c.y + 4, .92, -9);
  } else {
    prop(s, "crossing-defense-flowers", c.x + 190, c.y - 25, 1.05, -2);
    prop(s, "crossing-defense-flowers", c.x + 150, c.y + 84, .88, 4);
    prop(s, "crossing-defense-sign", c.x + 232, c.y - 34, .72, -8).setAlpha(.62);
  }

  const tools = prop(s, "crossing-defense-tools", c.x + 128, c.y + 20, .9, -4);
  const herbs = prop(s, "crossing-defense-herbs", c.x - 8, c.y + 98, .95, 2);

  for (const it of (s.interactables ?? []).filter((x: any) => x?.kind === "last-crossing-npc" && x?.obj?.active)) {
    const npc = it.obj as Phaser.GameObjects.Sprite;
    const id = String(it.id);
    s.tweens.killTweensOf(npc);
    const delay = id === "elara" ? 900 : id === "pip" ? 1500 : 2200;
    s.tweens.add({
      targets: npc,
      angle: id === "elara" ? (safe ? { from: -1, to: 1 } : { from: -3, to: 2 }) : id === "pip" ? { from: -2, to: 3 } : { from: -1, to: 2 },
      y: npc.y + (id === "maeve" ? 2 : 1),
      duration: id === "pip" ? 720 : 980,
      yoyo: true,
      repeat: -1,
      repeatDelay: delay,
      ease: "Sine.easeInOut",
    });
    if (id === "pip" && !safe) {
      s.tweens.add({ targets: tools, angle: { from: -5, to: 2 }, duration: 420, yoyo: true, repeat: -1, repeatDelay: 1900, ease: "Sine.easeInOut" });
    }
    if (id === "maeve") {
      s.tweens.add({ targets: herbs, y: herbs.y - 1, duration: 1100, yoyo: true, repeat: -1, repeatDelay: 1500, ease: "Sine.easeInOut" });
    }
  }
}

export function installLastCrossingDefense(QuestScene: SceneCtor) {
  const p = QuestScene.prototype;
  if (p.__lastCrossingDefenseInstalled) return;
  p.__lastCrossingDefenseInstalled = true;

  const create = p.create;
  p.create = function crossingDefenseCreate(this: SceneLike, ...a: any[]) {
    const r = create.apply(this, a);
    this.time.delayedCall(260, () => decorate(this));
    return r;
  };

  const build = p.buildAct1;
  p.buildAct1 = function crossingDefenseBuild(this: SceneLike, ...a: any[]) {
    const r = build.apply(this, a);
    this.time.delayedCall(180, () => decorate(this));
    return r;
  };

  const defeat = p.defeatActBoss;
  p.defeatActBoss = function crossingDefenseDefeat(this: SceneLike, ...a: any[]) {
    const was = act1(this) && this.bossName === "Warden of Rushing Water";
    const r = defeat.apply(this, a);
    if (was) this.time.delayedCall(120, () => decorate(this));
    return r;
  };
}
