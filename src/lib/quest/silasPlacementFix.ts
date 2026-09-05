import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

const SILAS_TX = 75;
const SILAS_TY = 56;

/**
 * Repositions Silas after the Last Crossing installer has created him.
 * Wren starts around design tile 50,56, so 75,56 keeps Silas roughly
 * twenty-five design tiles east on the open Act I approach instead of
 * inside the Warden courtyard.
 */
export function installSilasPlacementFix(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__silasPlacementFixInstalled) return;
  proto.__silasPlacementFixInstalled = true;

  const originalCreate = proto.create;
  proto.create = function silasPlacementCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    if (this.save?.current_zone !== "sunlit_shores") return result;

    const silas = (this.interactables ?? []).find((it: any) => it?.kind === "last-crossing-silas");
    if (!silas?.obj) return result;

    const oldX = Number(silas.obj.x ?? 0);
    const oldY = Number(silas.obj.y ?? 0);
    const targetX = this.wx?.(SILAS_TX) ?? SILAS_TX * 32;
    const targetY = this.wy?.(SILAS_TY) ?? SILAS_TY * 32;

    let sign: Phaser.GameObjects.Sprite | undefined;
    let best = 96;
    for (const child of this.children?.list ?? []) {
      const obj = child as any;
      if (obj?.texture?.key !== "signpost") continue;
      const d = Phaser.Math.Distance.Between(oldX, oldY, Number(obj.x ?? 0), Number(obj.y ?? 0));
      if (d < best) {
        best = d;
        sign = obj as Phaser.GameObjects.Sprite;
      }
    }

    silas.obj.setPosition(targetX, targetY);
    silas.obj.setDepth(this.dsort?.(targetY) ?? 11);
    if (sign) {
      sign.setPosition(targetX - 34, targetY + 8);
      sign.setDepth(this.dsort?.(targetY + 8) ?? 9);
    }

    return result;
  };
}
