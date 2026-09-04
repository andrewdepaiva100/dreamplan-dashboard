import { Suspense } from "react";
import { Model3D } from "./Model3D";
import { MEADOW, PORTAL_POS } from "./shared";

/** Act I — The Sunlit Meadow. Ground, scattered nature, golden portal. */
export function Meadow() {
  return (
    <group>
      {/* ground */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[110, 64]} />
        <meshStandardMaterial color="#58a24b" />
      </mesh>
      {/* soft meadow tone ring */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
        <circleGeometry args={[60, 48]} />
        <meshStandardMaterial color="#63b154" />
      </mesh>

      <Suspense fallback={null}>
        {MEADOW.map((p, i) => (
          <Model3D
            key={i}
            url={p.url}
            position={[p.x, 0, p.z]}
            scale={p.scale}
            rotY={p.rotY}
            castShadow={p.castShadow}
          />
        ))}
      </Suspense>

      {/* golden portal to Act II (decorative in stage 1) */}
      <group position={[PORTAL_POS.x, 0, PORTAL_POS.z]}>
        <mesh position={[0, 3.4, 0]}>
          <torusGeometry args={[2.6, 0.28, 12, 48]} />
          <meshStandardMaterial color="#e9b949" emissive="#c9922e" emissiveIntensity={1.4} />
        </mesh>
        <pointLight position={[0, 3.4, 1]} intensity={30} color="#ffd977" distance={18} />
        <mesh position={[0, 0.05, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[3.4, 32]} />
          <meshStandardMaterial color="#d9b45c" />
        </mesh>
      </group>
    </group>
  );
}
