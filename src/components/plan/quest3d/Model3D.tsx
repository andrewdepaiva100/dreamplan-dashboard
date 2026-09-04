import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { SkeletonUtils } from "three-stdlib";

/** Static scatter prop — clones the cached GLB scene and enables shadows. */
export function Model3D({
  url,
  position,
  scale = 1,
  rotY = 0,
  castShadow = true,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  rotY?: number;
  castShadow?: boolean;
}) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  useEffect(() => {
    obj.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = castShadow;
        o.receiveShadow = true;
      }
    });
  }, [obj, castShadow]);

  return <primitive object={obj} position={position} scale={scale} rotation-y={rotY} />;
}
