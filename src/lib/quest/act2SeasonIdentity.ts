// @ts-nocheck -- Act II-only visual decorator using existing authored sprites.

const ZONE = "wedding_garden";

type SeasonalCluster = {
  name: string;
  x: number;
  y: number;
  treeTint: number;
  flowerTints: number[];
  lampTint?: number;
};

const CLUSTERS: SeasonalCluster[] = [
  {
    name: "Spring",
    x: 18,
    y: 18,
    treeTint: 0x9adf82,
    flowerTints: [0xf3a8c2, 0xffffff, 0xb9f28f],
  },
  {
    name: "Summer",
    x: 96,
    y: 18,
    treeTint: 0x6ea85e,
    flowerTints: [0xffd66f, 0xff9f68, 0xf7c7dd],
    lampTint: 0xffd77a,
  },
  {
    name: "Autumn",
    x: 18,
    y: 82,
    treeTint: 0xb36f3f,
    flowerTints: [0xd98b43, 0xe7b95f, 0xb65e46],
  },
  {
    name: "Winter",
    x: 96,
    y: 82,
    treeTint: 0x9eb5c8,
    flowerTints: [0xffffff, 0xbfd8ef, 0xd9e7f2],
    lampTint: 0xc9ddff,
  },
];

function addDecorSprite(scene: any, key: string, tx: number, ty: number, tint: number, scale: number, alpha = 1) {
  if (!scene.textures?.exists?.(key)) return null;
  const x = scene.wx(tx);
  const y = scene.wy(ty);
  const sprite = scene.add
    .sprite(x, y, key)
    .setTint(tint)
    .setScale(scale)
    .setAlpha(alpha)
    .setDepth(scene.dsort?.(y + 8) ?? 6);
  sprite.setData?.("act2-season-identity", true);
  return sprite;
}

function addCluster(scene: any, cluster: SeasonalCluster) {
  const made: any[] = [];

  // One authored tree silhouette establishes each corner's dominant palette.
  const tree = addDecorSprite(scene, "tree", cluster.x - 7, cluster.y - 6, cluster.treeTint, 0.9, 0.92);
  if (tree) made.push(tree);

  // Designed flower groups create a clear seasonal border around each key.
  const flowerOffsets = [
    [-6, 4],
    [-2, 7],
    [4, 6],
    [7, 2],
    [2, -5],
    [-4, -3],
  ];
  flowerOffsets.forEach(([dx, dy], index) => {
    const tint = cluster.flowerTints[index % cluster.flowerTints.length]!;
    const flower = addDecorSprite(scene, "flowers", cluster.x + dx, cluster.y + dy, tint, 0.72 + (index % 3) * 0.08, 0.94);
    if (flower) made.push(flower);
  });

  // Summer and Winter get a restrained light accent using the existing lamp art.
  if (cluster.lampTint && scene.textures?.exists?.("lamp")) {
    const lamp = addDecorSprite(scene, "lamp", cluster.x + 9, cluster.y - 6, cluster.lampTint, 0.88, 0.92);
    if (lamp) made.push(lamp);
  }

  return made;
}

function applySeasonIdentity(scene: any) {
  if (scene.save?.current_zone !== ZONE || scene.__act2SeasonIdentityApplied) return;
  scene.__act2SeasonIdentityApplied = true;
  scene.__act2SeasonIdentity = CLUSTERS.flatMap((cluster) => addCluster(scene, cluster));
}

export function installAct2SeasonIdentity(QuestScene: any) {
  const proto = QuestScene?.prototype;
  if (!proto || proto.__act2SeasonIdentityInstalled) return;
  proto.__act2SeasonIdentityInstalled = true;

  const originalBuildAct2 = proto.buildAct2;
  proto.buildAct2 = function act2SeasonIdentityBuild(...args: any[]) {
    const result = originalBuildAct2.apply(this, args);
    applySeasonIdentity(this);
    return result;
  };
}
