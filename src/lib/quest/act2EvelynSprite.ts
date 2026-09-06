// @ts-nocheck -- Small Act II presentation decorator.

const ZONE = "wedding_garden";
const KEEPER_KIND = "garden-keeper";
const EVELYN_X = 91;
const EVELYN_Y = 58;
const TEXTURE_KEY = "evelyn-world";

/**
 * Draw Evelyn at the same compact 24x35 overworld scale used by the game's
 * named NPC sprites. Keeping this texture local avoids changing shared guide
 * art in any other act.
 */
function ensureEvelynTexture(scene: any) {
  if (scene.textures?.exists?.(TEXTURE_KEY)) return;
  const texture = scene.textures?.createCanvas?.(TEXTURE_KEY, 24, 35);
  const ctx = texture?.getContext?.();
  if (!texture || !ctx) return;

  ctx.imageSmoothingEnabled = false;
  const px = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };

  // Soft ground shadow.
  px(5, 32, 14, 2, "rgba(25,35,31,.28)");

  // Hair silhouette and head — deliberately chunky pixels to match the
  // existing 24x34/24x35 NPC proportions rather than an oversized guide.
  px(7, 2, 10, 2, "#514c50");
  px(5, 4, 14, 8, "#625d62");
  px(4, 7, 3, 9, "#625d62");
  px(17, 7, 3, 9, "#625d62");
  px(7, 6, 10, 9, "#e2b58f");
  px(8, 7, 8, 2, "#f0c6a0");
  px(8, 10, 2, 2, "#3b3538");
  px(14, 10, 2, 2, "#3b3538");
  px(9, 14, 6, 2, "#d9d5c9");
  px(7, 15, 10, 3, "#dedbd1");

  // Sage keeper coat, cream blouse and gold rose clasp.
  px(5, 17, 14, 12, "#557c58");
  px(3, 19, 3, 9, "#476a4d");
  px(18, 19, 3, 9, "#476a4d");
  px(9, 17, 6, 11, "#eee4c9");
  px(11, 18, 2, 2, "#d8b85c");
  px(5, 27, 4, 4, "#426147");
  px(15, 27, 4, 4, "#426147");

  // Hands and boots.
  px(3, 27, 3, 3, "#d8aa83");
  px(18, 27, 3, 3, "#d8aa83");
  px(7, 29, 4, 4, "#493a32");
  px(13, 29, 4, 4, "#493a32");

  texture.refresh?.();
}

function polishEvelyn(scene: any) {
  if (scene.save?.current_zone !== ZONE) return;
  ensureEvelynTexture(scene);
  const keeper = (scene.interactables ?? []).find((it: any) => it?.kind === KEEPER_KIND);
  if (!keeper?.obj) return;

  const x = scene.wx(EVELYN_X);
  const y = scene.wy(EVELYN_Y);
  keeper.obj.setPosition?.(x, y);
  keeper.obj.setTexture?.(TEXTURE_KEY);
  keeper.obj.clearTint?.();
  keeper.obj.setScale?.(1);
  keeper.obj.setDepth?.(scene.dsort?.(y) ?? 11);

  // Keep Evelyn's station centered around her new, closer-to-spawn location.
  // The station art was authored relative to the previous keeper anchor, so
  // shift those decorative pieces as a group when Phaser exposes them.
  const art = scene.__act2KeeperArt;
  if (art) {
    const dx = x - art.x;
    const dy = y - art.y;
    art.x = x;
    art.y = y;
    if (art.glow) {
      art.glow.x += dx;
      art.glow.y += dy;
    }
    for (const obj of art.seasonal ?? []) {
      if (!obj?.active) continue;
      obj.x += dx;
      obj.y += dy;
    }
  }
}

export function installAct2EvelynSprite(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2EvelynSpriteInstalled) return;
  proto.__act2EvelynSpriteInstalled = true;

  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function act2EvelynSpriteBuild() {
    const result = originalBuildAct2.call(this);
    polishEvelyn(this);
    return result;
  };
}
