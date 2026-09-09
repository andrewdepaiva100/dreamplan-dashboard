// @ts-nocheck -- Act III narrative sequencing only; boss balance/progression is unchanged.
import * as Phaser from "phaser";

const ZONE = "the_haven";
const PENDING = "act3ClamourPending";
const AWAKENED = "act3ClamourAwakened";
const FIRST_MARKER = "act3AndrewFirstConversation";

const ANDREW_INTRO =
  "Maria... there you are. I know I was supposed to be waiting for you at the Cathedral. I promise I'll explain. But first — I have something for you. A sword. Yours, if you'll take it.";

function addAndrewPortrait(scene: any, andrew: any) {
  const overlay = document.querySelector(".quest-act3-andrew-dialogue") as HTMLElement | null;
  if (!overlay || overlay.querySelector(".quest-act3-andrew-portrait")) return;
  const card = overlay.firstElementChild as HTMLElement | null;
  const sprite = andrew?.obj;
  const frame = sprite?.frame;
  const source = frame?.source?.image;
  if (!card || !frame || !source) return;

  const portrait = document.createElement("div");
  portrait.className = "quest-act3-andrew-portrait";
  Object.assign(portrait.style, {
    width: "96px", height: "96px", float: "right", margin: "0 0 14px 20px",
    borderRadius: "22px", border: "2px solid rgba(255,159,197,.8)",
    background: "radial-gradient(circle,rgba(255,159,197,.18),rgba(7,18,33,.96))",
    boxShadow: "0 10px 28px rgba(0,0,0,.38),0 0 20px rgba(255,159,197,.15)",
    display: "grid", placeItems: "center", overflow: "hidden"
  });
  const canvas = document.createElement("canvas");
  canvas.width = 96; canvas.height = 96;
  Object.assign(canvas.style, { width: "88px", height: "88px", imageRendering: "pixelated" });
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const sw = frame.cutWidth ?? frame.width;
  const sh = frame.cutHeight ?? frame.height;
  const scale = Math.min(76 / sw, 76 / sh);
  const dw = sw * scale, dh = sh * scale;
  ctx.drawImage(source, frame.cutX ?? 0, frame.cutY ?? 0, sw, sh, (96 - dw) / 2, 96 - dh - 7, dw, dh);
  portrait.append(canvas);
  card.insertBefore(portrait, card.firstChild);
}

export function installAct3OpeningFlow(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3OpeningFlowInstalled) return;
  proto.__act3OpeningFlowInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  const originalInteract = proto.interact;
  const originalResume = proto.onResume;
  const originalOpenModal = proto.openModal;

  proto.buildAct3 = function act3OpeningBuild(...args: any[]) {
    const scene = this;
    const originalSpawnActBoss = scene.spawnActBoss;
    let heldOpeningBoss: { tx: number; ty: number; override?: any } | null = null;

    scene.spawnActBoss = function holdOpeningClamour(tx: number, ty: number, override?: any) {
      if (!override && scene.save?.current_zone === ZONE && !scene.zoneState?.[AWAKENED]) {
        heldOpeningBoss = { tx, ty, override };
        return undefined;
      }
      return originalSpawnActBoss.call(scene, tx, ty, override);
    };

    try {
      const result = originalBuildAct3.apply(scene, args);
      if (heldOpeningBoss) scene.zoneState.act3HeldClamour = heldOpeningBoss;
      return result;
    } finally {
      scene.spawnActBoss = originalSpawnActBoss;
    }
  };

  proto.openModal = function act3AndrewStoryModal(payload: any) {
    if (this.save?.current_zone === ZONE && payload?.type === "andrew" && this.zoneState?.[FIRST_MARKER]) {
      return originalOpenModal.call(this, { ...payload, line: ANDREW_INTRO, act3FirstAndrew: true });
    }
    return originalOpenModal.call(this, payload);
  };

  proto.interact = function act3OpeningInteract(...args: any[]) {
    const scene = this;
    const beforeHadLoveSword = scene.save?.weapons?.includes?.("love-sword") === true;
    const anyNearbyAndrew =
      scene.save?.current_zone === ZONE &&
      scene.interactables?.find?.((it: any) =>
        it?.enabled && it?.obj?.active && it.kind === "andrew" &&
        Phaser.Math.Distance.Between(scene.player.x, scene.player.y, it.obj.x, it.obj.y) <= (it.radius ?? 54),
      );
    const firstAndrew = anyNearbyAndrew && !beforeHadLoveSword;

    // act3AndrewDialogue is installed outside this decorator and normally sees
    // the base modal first. For the first meeting, temporarily route that modal
    // through an explicit intro payload so the sword AND sheet story appear in
    // the same uninterrupted conversation.
    const liveOpenModal = scene.openModal;
    if (firstAndrew) {
      scene.zoneState[FIRST_MARKER] = true;
      scene.openModal = function firstAndrewModal(payload: any) {
        if (payload?.type === "andrew") return liveOpenModal.call(scene, { ...payload, line: ANDREW_INTRO, act3FirstAndrew: true });
        return liveOpenModal.call(scene, payload);
      };
    }

    try {
      const result = originalInteract.apply(scene, args);
      if (firstAndrew && scene.save?.weapons?.includes?.("love-sword") === true) scene.zoneState[PENDING] = true;
      if (anyNearbyAndrew) addAndrewPortrait(scene, anyNearbyAndrew);
      return result;
    } finally {
      if (firstAndrew) {
        scene.openModal = liveOpenModal;
        scene.zoneState[FIRST_MARKER] = false;
      }
    }
  };

  proto.onResume = function act3OpeningResume(...args: any[]) {
    const result = originalResume.apply(this, args);
    const scene = this;
    if (
      scene.save?.current_zone !== ZONE || !scene.zoneState?.[PENDING] ||
      scene.zoneState?.[AWAKENED] || scene.boss?.active
    ) return result;

    scene.zoneState[PENDING] = false;
    scene.zoneState[AWAKENED] = true;
    const held = scene.zoneState.act3HeldClamour ?? { tx: 66, ty: 28 };

    scene.time.delayedCall(280, () => {
      if (!scene.scene?.isActive?.() || scene.save?.current_zone !== ZONE || scene.boss?.active) return;
      const x = scene.wx(held.tx), y = scene.wy(held.ty);
      scene.spawnSparkle(x, y, 0xd9a441, 20);
      scene.cameras.main.flash(220, 217, 164, 65);
      scene.spawnActBoss(held.tx, held.ty, held.override);
      scene.emitToast("A restless murmur rises from the Town Hall steps.");
    });
    return result;
  };
}
