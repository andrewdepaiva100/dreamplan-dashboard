import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";
import type { MutableRefObject, RefObject } from "react";
import { COLLIDERS, WORLD_R, WALK_SPEED, SPRINT_MULT, type InputState } from "./shared";

const FADE = 0.22;
const _desired = new THREE.Vector3();
const _camDir = new THREE.Vector3();

/** Normalize a KayKit character to `height` world units with feet at y=0. */
function useCharacter(source: THREE.Group, height: number) {
  return useMemo(() => {
    const object = SkeletonUtils.clone(source);
    object.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    object.scale.setScalar(height / (size.y || 1));
    const scaled = new THREE.Box3().setFromObject(object);
    const center = scaled.getCenter(new THREE.Vector3());
    object.position.x -= center.x;
    object.position.z -= center.z;
    object.position.y -= scaled.min.y;
    return object;
  }, [source, height]);
}

export function Player({
  input,
  playerRef,
}: {
  input: MutableRefObject<InputState>;
  playerRef: RefObject<THREE.Group | null>;
}) {
  const { scene, animations } = useGLTF("/models/Mage.glb");
  const model = useCharacter(scene as THREE.Group, 1.7);
  const { actions } = useAnimations(animations, playerRef as RefObject<THREE.Group>);

  const vel = useRef(new THREE.Vector3());
  const current = useRef<string>("Idle");
  const attackLock = useRef(0);
  const lastAttack = useRef(0);

  const play = (name: string) => {
    if (current.current === name) return;
    const prev = actions[current.current];
    const next = actions[name];
    if (!next) return;
    prev?.fadeOut(FADE);
    next.reset().fadeIn(FADE).play();
    current.current = name;
  };

  useEffect(() => {
    actions["Idle"]?.play();
  }, [actions]);

  const { camera } = useThree();

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const g = playerRef.current;
    if (!g) return;
    const inp = input.current;

    // attack one-shot
    if (inp.attack !== lastAttack.current) {
      lastAttack.current = inp.attack;
      const atk = actions["Spellcast_Shoot"];
      if (atk) {
        actions[current.current]?.fadeOut(0.1);
        atk.setLoop(THREE.LoopOnce, 1);
        atk.clampWhenFinished = true;
        atk.reset().fadeIn(0.1).play();
        current.current = "Spellcast_Shoot";
        attackLock.current = 0.9;
      }
    }
    if (attackLock.current > 0) attackLock.current -= dt;

    // camera-relative movement direction
    camera.getWorldDirection(_camDir);
    const yaw = Math.atan2(_camDir.x, _camDir.z);
    const ix = inp.x;
    const iz = inp.z;
    const len = Math.hypot(ix, iz);
    const cl = Math.min(len, 1);
    let mx = 0;
    let mz = 0;
    if (cl > 0.05) {
      const ang = Math.atan2(ix, -iz) + yaw; // forward = -z of camera
      mx = Math.sin(ang) * cl;
      mz = Math.cos(ang) * cl;
    }
    const speed = WALK_SPEED * (inp.sprint ? SPRINT_MULT : 1);
    _desired.set(mx * speed, 0, mz * speed);
    vel.current.lerp(_desired, 1 - Math.exp(-10 * dt));

    g.position.x += vel.current.x * dt;
    g.position.z += vel.current.z * dt;

    // world bounds
    const d = Math.hypot(g.position.x, g.position.z);
    if (d > WORLD_R) {
      g.position.x *= WORLD_R / d;
      g.position.z *= WORLD_R / d;
    }

    // circle colliders (trees, rocks)
    for (const c of COLLIDERS) {
      const dx = g.position.x - c.x;
      const dz = g.position.z - c.z;
      const dist = Math.hypot(dx, dz);
      const min = c.r + 0.55;
      if (dist > 0.001 && dist < min) {
        g.position.x = c.x + (dx / dist) * min;
        g.position.z = c.z + (dz / dist) * min;
      }
    }

    // face movement direction
    const sp = Math.hypot(vel.current.x, vel.current.z);
    if (sp > 0.4) {
      const targetRot = Math.atan2(vel.current.x, vel.current.z);
      let diff = targetRot - g.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.rotation.y += diff * (1 - Math.exp(-12 * dt));
    }

    // animation state
    if (attackLock.current <= 0) {
      play(sp > 7 ? "Running_A" : sp > 0.5 ? "Walking_A" : "Idle");
    }
  });

  return (
    <group ref={playerRef} position={[0, 0, 6]}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload("/models/Mage.glb");
