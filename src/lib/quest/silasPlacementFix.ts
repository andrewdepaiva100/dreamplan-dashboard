// @ts-nocheck -- Dynamic Phaser scene decorators are validated against the runtime scene.
import * as Phaser from "phaser";

type SceneLike = Phaser.Scene & Record<string, any>;
type SceneCtor = { prototype: SceneLike };

function safeBridgeSide(scene: SceneLike, bridgeX: number, bridgeY: number) {
  const candidates: [number, number][] = [
    [bridgeX - 96, bridgeY + 44],
    [bridgeX - 96, bridgeY - 44],
    [bridgeX + 96, bridgeY + 44],
    [bridgeX + 96, bridgeY - 44],
    [bridgeX - 128, bridgeY],
    [bridgeX + 128, bridgeY],
  ];
  for (const [x, y] of candidates) {
    const tile = scene.layer?.getTileAtWorldXY?.(x, y);
    if (tile && !tile.collides) return { x, y };
  }
  return { x: bridgeX - 96, y: bridgeY + 44 };
}

/** Places Silas beside Act I's central river bridge on a safe walkable bank. */
export function installSilasPlacementFix(QuestScene: SceneCtor) {
  const proto = QuestScene.prototype;
  if (proto.__silasPlacementFixInstalled) return;
  proto.__silasPlacementFixInstalled = true;

  const originalCreate = proto.create;
  proto.create = function silasPlacementCreate(this: SceneLike, ...args: any[]) {
    const result = originalCreate.apply(this, args);
    if (this.save?.current_zone !== "sunlit_shores") return result;

    this.time.delayedCall(20, () => {
      const silas = (this.interactables ?? []).find((it: any) => it?.kind === "last-crossing-silas");
      if (!silas?.obj?.active) return;

      const oldX = Number(silas.obj.x ?? 0);
      const oldY = Number(silas.obj.y ?? 0);
      const expectedX = this.wx?.(60) ?? 60 * 32;
      const expectedY = this.wy?.(51) ?? 51 * 32;
      const bridges = (this.children?.list ?? []).filter((child: any) => child?.texture?.key === "bridge" && child.active);
      const bridge = bridges.sort(
        (a: any, b: any) =>
          Phaser.Math.Distance.Between(a.x, a.y, expectedX, expectedY) -
          Phaser.Math.Distance.Between(b.x, b.y, expectedX, expectedY),
      )[0] as Phaser.GameObjects.Sprite | undefined;
      const bridgeX = Number(bridge?.x ?? expectedX);
      const bridgeY = Number(bridge?.y ?? expectedY);
      const target = safeBridgeSide(this, bridgeX, bridgeY);

      let sign: Phaser.GameObjects.Sprite | undefined;
      let best = 120;
      for (const child of this.children?.list ?? []) {
        const obj = child as any;
        if (obj?.texture?.key !== "signpost") continue;
        const d = Phaser.Math.Distance.Between(oldX, oldY, Number(obj.x ?? 0), Number(obj.y ?? 0));
        if (d < best) {
          best = d;
          sign = obj as Phaser.GameObjects.Sprite;
        }
      }

      silas.obj.setPosition(target.x, target.y);
      silas.obj.setDepth(this.dsort?.(target.y) ?? 11);
      if (silas.obj.body) silas.obj.body.reset(target.x, target.y);
      if (sign) {
        sign.setPosition(target.x - 34, target.y + 8);
        sign.setDepth(this.dsort?.(target.y + 8) ?? 9);
      }
    });

    return result;
  };
}
