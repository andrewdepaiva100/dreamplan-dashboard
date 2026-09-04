// Shared types + world constants for the 3D realm.

export interface InputState {
  /** -1..1 movement axes from keyboard or joystick (x = right, z = toward camera) */
  x: number;
  z: number;
  sprint: boolean;
  /** increments each time the player taps attack */
  attack: number;
}

export interface CircleCollider {
  x: number;
  z: number;
  r: number;
}

export const WORLD_R = 88; // playable radius
export const WALK_SPEED = 6;
export const SPRINT_MULT = 1.7;

// deterministic RNG so the meadow is identical on every device
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Placement {
  url: string;
  x: number;
  z: number;
  scale: number;
  rotY: number;
  colliderR: number; // 0 = walk-through decoration
  castShadow: boolean;
}

const TREES = ["/models/tree_default.glb", "/models/tree_oak.glb", "/models/tree_fat.glb", "/models/tree_pineTallA.glb"];
const ROCKS = ["/models/rock_largeA.glb", "/models/rock_smallA.glb", "/models/rock_smallB.glb"];
const FLOWERS = ["/models/flower_purpleA.glb", "/models/flower_redA.glb", "/models/flower_yellowA.glb"];
const GRASS = ["/models/grass_large.glb", "/models/plant_bush.glb", "/models/mushroom_red.glb"];

export function generateMeadow(): Placement[] {
  const rnd = mulberry32(20260904);
  const placed: Placement[] = [];
  const treeSpots: { x: number; z: number }[] = [];

  const distTo = (x: number, z: number, list: { x: number; z: number }[]) =>
    Math.min(...list.map((p) => Math.hypot(p.x - x, p.z - z)), Infinity);

  // trees — spaced out, away from spawn (0,0) and the portal (0,-78)
  let tries = 0;
  while (treeSpots.length < 30 && tries++ < 800) {
    const a = rnd() * Math.PI * 2;
    const d = 18 + rnd() * (WORLD_R - 24);
    const x = Math.cos(a) * d;
    const z = Math.sin(a) * d;
    if (Math.hypot(x, z - -78) < 14) continue; // portal clearing
    if (distTo(x, z, treeSpots) < 9) continue; // no tree clusters
    treeSpots.push({ x, z });
    placed.push({
      url: TREES[Math.floor(rnd() * TREES.length)],
      x, z,
      scale: 1.6 + rnd() * 1.2,
      rotY: rnd() * Math.PI * 2,
      colliderR: 1.1,
      castShadow: true,
    });
  }

  // rocks
  for (let i = 0; i < 12; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 12 + rnd() * (WORLD_R - 18);
    placed.push({
      url: ROCKS[Math.floor(rnd() * ROCKS.length)],
      x: Math.cos(a) * d, z: Math.sin(a) * d,
      scale: 0.8 + rnd() * 0.9,
      rotY: rnd() * Math.PI * 2,
      colliderR: 0.9,
      castShadow: true,
    });
  }

  // flowers (purple / red / white-ish yellow / pink tones handled by model colors)
  for (let i = 0; i < 42; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 4 + rnd() * (WORLD_R - 10);
    placed.push({
      url: FLOWERS[Math.floor(rnd() * FLOWERS.length)],
      x: Math.cos(a) * d, z: Math.sin(a) * d,
      scale: 0.9 + rnd() * 0.7,
      rotY: rnd() * Math.PI * 2,
      colliderR: 0,
      castShadow: false,
    });
  }

  // grass tufts, bushes, mushrooms
  for (let i = 0; i < 34; i++) {
    const a = rnd() * Math.PI * 2;
    const d = 5 + rnd() * (WORLD_R - 10);
    placed.push({
      url: GRASS[Math.floor(rnd() * GRASS.length)],
      x: Math.cos(a) * d, z: Math.sin(a) * d,
      scale: 0.9 + rnd() * 0.8,
      rotY: rnd() * Math.PI * 2,
      colliderR: 0,
      castShadow: false,
    });
  }

  return placed;
}

export const MEADOW = generateMeadow();
export const COLLIDERS: CircleCollider[] = MEADOW.filter((p) => p.colliderR > 0).map((p) => ({
  x: p.x,
  z: p.z,
  r: p.colliderR * p.scale,
}));

export const PORTAL_POS = { x: 0, z: -78 };
