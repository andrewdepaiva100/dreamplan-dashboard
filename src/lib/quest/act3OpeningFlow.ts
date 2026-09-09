// @ts-nocheck -- Act III narrative sequencing only; boss balance/progression is unchanged.
import * as Phaser from "phaser";

const ZONE = "the_haven";
const PENDING = "act3ClamourPending";
const AWAKENED = "act3ClamourAwakened";

// The dialogue presentation recognizes this marker and expands it into the
// longer Andrew/Maria conversation. Mechanics still come from the original
// Andrew interaction: Love Sword grant, saves, objectives and sheet tracking.
const ANDREW_INTRO =
  "Maria... there you are. I know I was supposed to be waiting for you at the Cathedral. I promise I'll explain. But first — I have something for you. A sword. Yours, if you'll take it.";

export function installAct3OpeningFlow(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act3OpeningFlowInstalled) return;
  proto.__act3OpeningFlowInstalled = true;

  const originalBuildAct3 = proto.buildAct3;
  const originalInteract = proto.interact;
  const originalResume = proto.onResume;
  const originalOpenModal = proto.openModal;

  // Build Haven exactly as before, except hold back its opening boss until
  // Maria has actually met Andrew by the fountain.
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

  // Keep every mechanical effect of Andrew's original first interaction, but
  // replace only its spoken line. The custom Haven dialogue expands this into
  // a warm multi-beat exchange: Cathedral explanation, Love Sword, then sheets.
  proto.openModal = function act3AndrewStoryModal(payload: any) {
    if (
      this.save?.current_zone === ZONE &&
      payload?.type === "andrew" &&
      !this.save?.weapons?.includes?.("love-sword")
    ) {
      return originalOpenModal.call(this, { ...payload, line: ANDREW_INTRO });
    }
    return originalOpenModal.call(this, payload);
  };

  // The first Andrew conversation still grants the Love Sword and starts the
  // sheet story exactly as before. We only mark the Clamour to awaken once
  // that modal closes.
  proto.interact = function act3OpeningInteract(...args: any[]) {
    const scene = this;
    const beforeHadLoveSword = scene.save?.weapons?.includes?.("love-sword") === true;
    const nearbyAndrew =
      scene.save?.current_zone === ZONE &&
      !beforeHadLoveSword &&
      scene.interactables?.find?.((it: any) =>
        it?.enabled &&
        it?.obj?.active &&
        it.kind === "andrew" &&
        Phaser.Math.Distance.Between(scene.player.x, scene.player.y, it.obj.x, it.obj.y) <= (it.radius ?? 54),
      );

    const result = originalInteract.apply(scene, args);
    if (nearbyAndrew && scene.save?.weapons?.includes?.("love-sword") === true) scene.zoneState[PENDING] = true;
    return result;
  };

  proto.onResume = function act3OpeningResume(...args: any[]) {
    const result = originalResume.apply(this, args);
    const scene = this;
    if (
      scene.save?.current_zone !== ZONE ||
      !scene.zoneState?.[PENDING] ||
      scene.zoneState?.[AWAKENED] ||
      scene.boss?.active
    ) return result;

    scene.zoneState[PENDING] = false;
    scene.zoneState[AWAKENED] = true;
    const held = scene.zoneState.act3HeldClamour ?? { tx: 66, ty: 28 };

    scene.time.delayedCall(280, () => {
      if (!scene.scene?.isActive?.() || scene.save?.current_zone !== ZONE || scene.boss?.active) return;
      const x = scene.wx(held.tx);
      const y = scene.wy(held.ty);
      scene.spawnSparkle(x, y, 0xd9a441, 20);
      scene.cameras.main.flash(220, 217, 164, 65);
      scene.spawnActBoss(held.tx, held.ty, held.override);
      scene.emitToast("A restless murmur rises from the Town Hall steps.");
    });

    return result;
  };
}
