import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RefObject } from "react";

const offset = new THREE.Vector3(0, 7.2, 9.5);
const _target = new THREE.Vector3();
const _look = new THREE.Vector3();

export function FollowCamera({ target }: { target: RefObject<THREE.Group | null> }) {
  useFrame(({ camera }, delta) => {
    const g = target.current;
    if (!g) return;
    _target.copy(g.position).add(offset);
    camera.position.lerp(_target, 1 - Math.exp(-4.5 * delta));
    _look.copy(g.position);
    _look.y += 1.6;
    camera.lookAt(_look);
  });
  return null;
}
