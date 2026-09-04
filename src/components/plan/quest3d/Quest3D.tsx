import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Meadow } from "./Meadow";
import { Player } from "./Player";
import { FollowCamera } from "./FollowCamera";
import { HUD3D } from "./HUD3D";
import type { InputState } from "./shared";

export default function Quest3D({ onExit }: { onExit: () => void }) {
  const input = useRef<InputState>({ x: 0, z: 0, sprint: false, attack: 0 });
  const playerRef = useRef<THREE.Group>(null);
  const [banner, setBanner] = useState<string | null>("The Sunlit Meadow");

  useEffect(() => {
    const t = setTimeout(() => setBanner(null), 3800);
    return () => clearTimeout(t);
  }, []);

  // keyboard input
  useEffect(() => {
    const keys = new Set<string>();
    const apply = () => {
      const i = input.current;
      i.x = (keys.has("d") || keys.has("arrowright") ? 1 : 0) - (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
      i.z = (keys.has("s") || keys.has("arrowdown") ? 1 : 0) - (keys.has("w") || keys.has("arrowup") ? 1 : 0);
      i.sprint = keys.has("shift");
    };
    const down = (e: KeyboardEvent) => {
      keys.add(e.key.toLowerCase());
      if (e.key === " ") input.current.attack += 1;
      apply();
    };
    const up = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
      apply();
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      input.current.x = 0;
      input.current.z = 0;
    };
  }, []);

  // lock page scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[110] h-[100dvh] w-screen overflow-hidden bg-[#9fd8f7]">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 9, 16], fov: 55, near: 0.1, far: 220 }}
      >
        <color attach="background" args={["#9fd8f7"]} />
        <fog attach="fog" args={["#9fd8f7", 60, 160]} />
        <hemisphereLight args={["#cfe8ff", "#3f7a3a", 0.85]} />
        <directionalLight
          position={[24, 30, 14]}
          intensity={1.7}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
          shadow-camera-far={120}
          shadow-bias={-0.0004}
        />
        <Environment>
          <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
          <Lightformer intensity={1} color="#8bb" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
        </Environment>

        <Meadow />
        <Suspense fallback={null}>
          <Player input={input} playerRef={playerRef} />
        </Suspense>
        <FollowCamera target={playerRef} />
      </Canvas>

      <HUD3D input={input} onExit={onExit} banner={banner} />
    </div>
  );
}
