"use client";

import { RoundedBox, Sphere } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  orbitalArcs,
  relationRods,
  spinePlates,
  structuralPlates,
  systemNodes,
} from "./geometry-spec";
import type { SceneKeyframe } from "./scene-keyframes";

type MechanicalOrchestratorProps = {
  activeChapter: string;
  keyframeRef: React.MutableRefObject<SceneKeyframe>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  progressRef: React.MutableRefObject<number>;
};

const graphite = new THREE.MeshPhysicalMaterial({
  clearcoat: 0.22,
  clearcoatRoughness: 0.36,
  color: "#25272A",
  metalness: 0.82,
  roughness: 0.28,
});

const darkSteel = new THREE.MeshPhysicalMaterial({
  clearcoat: 0.12,
  color: "#54575B",
  metalness: 0.75,
  roughness: 0.32,
});

const warmMetal = new THREE.MeshPhysicalMaterial({
  color: "#A99478",
  metalness: 0.7,
  roughness: 0.34,
});

const ivoryLight = new THREE.MeshBasicMaterial({
  color: "#E7E2D8",
});

const dimIvory = new THREE.MeshBasicMaterial({
  color: "#E7E2D8",
  transparent: true,
  opacity: 0.32,
});

function Rod({ from, opacity = 0.4, to }: { from: [number, number, number]; opacity?: number; to: [number, number, number] }) {
  const { midpoint, quaternion, scale } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const length = direction.length();
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      direction.clone().normalize(),
    );

    return { midpoint: mid, quaternion: quat, scale: [0.008, length, 0.008] as [number, number, number] };
  }, [from, to]);

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[scale[0], scale[0], scale[1], 8]} />
      <meshBasicMaterial color="#E7E2D8" opacity={opacity} transparent />
    </mesh>
  );
}

function Arc({
  arc,
  index,
  position,
  radius,
  rotation,
  speed,
  tube,
}: {
  arc: number;
  index: number;
  position: [number, number, number];
  radius: number;
  rotation: [number, number, number];
  speed: number;
  tube: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.z = rotation[2] + clock.elapsedTime * speed;
    ref.current.rotation.y = rotation[1] + Math.sin(clock.elapsedTime * 0.16 + index) * 0.018;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <torusGeometry args={[radius, tube, 10, 96, arc]} />
      <primitive attach="material" object={index % 3 === 0 ? warmMetal : darkSteel} />
    </mesh>
  );
}

export function MechanicalOrchestrator({
  activeChapter,
  keyframeRef,
  pointerRef,
  progressRef,
}: MechanicalOrchestratorProps) {
  const root = useRef<THREE.Group>(null);
  const coreLight = useRef<THREE.PointLight>(null);
  const target = useMemo(
    () => ({
      position: new THREE.Vector3(),
      rotation: new THREE.Euler(),
      scale: 1,
    }),
    [],
  );

  useFrame(({ clock }) => {
    if (!root.current) return;
    const keyframe = keyframeRef.current;
    const pointer = pointerRef.current;
    const progress = progressRef.current;

    target.position.set(...keyframe.sculpturePosition);
    target.position.x += pointer.x * 0.12;
    target.position.y += pointer.y * 0.06;
    target.rotation.set(...keyframe.sculptureRotation);
    target.rotation.y += clock.elapsedTime * (activeChapter === "work" ? 0.025 : 0.075);
    target.rotation.x += pointer.y * 0.035;
    target.rotation.z += pointer.x * 0.02;

    root.current.position.lerp(target.position, 0.055);
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, target.rotation.x, 0.055);
    root.current.rotation.y = THREE.MathUtils.lerp(root.current.rotation.y, target.rotation.y, 0.055);
    root.current.rotation.z = THREE.MathUtils.lerp(root.current.rotation.z, target.rotation.z, 0.055);
    root.current.scale.setScalar(THREE.MathUtils.lerp(root.current.scale.x, keyframe.sculptureScale, 0.055));

    if (coreLight.current) {
      coreLight.current.intensity = THREE.MathUtils.lerp(
        coreLight.current.intensity,
        activeChapter === "orchestrics" ? 2.1 : 1.1 + progress * 0.5,
        0.06,
      );
    }
  });

  const activeNodeLimit =
    activeChapter === "systems"
      ? 9
      : activeChapter === "orchestrics"
        ? 9
        : activeChapter === "work"
          ? 5
          : 2;

  return (
    <group ref={root}>
      <group position={[0.18, -0.24, 0.08]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.16, 72]} />
          <primitive attach="material" object={darkSteel} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.48, 0.035, 12, 96]} />
          <primitive attach="material" object={warmMetal} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.68, 0.018, 10, 96, 5.1]} />
          <primitive attach="material" object={darkSteel} />
        </mesh>
        <Sphere args={[0.08, 32, 32]} position={[0, 0, 0.1]}>
          <primitive attach="material" object={ivoryLight} />
        </Sphere>
        <pointLight ref={coreLight} color="#E7E2D8" distance={3.6} intensity={1.25} position={[0, 0, 0.26]} />
      </group>

      {spinePlates.map((plate, index) => (
        <RoundedBox
          args={[1, 1, 1]}
          key={`spine-${index}`}
          position={plate.position}
          radius={0.015}
          rotation={plate.rotation}
          scale={plate.scale}
          smoothness={2}
        >
          <primitive attach="material" object={index % 2 ? darkSteel : graphite} />
        </RoundedBox>
      ))}

      {structuralPlates.map((plate, index) => (
        <RoundedBox
          args={[1, 1, 1]}
          key={`plate-${index}`}
          position={plate.position}
          radius={0.012}
          rotation={plate.rotation}
          scale={plate.scale}
          smoothness={2}
        >
          <primitive attach="material" object={index % 4 === 0 ? warmMetal : graphite} />
        </RoundedBox>
      ))}

      {orbitalArcs.map((arc, index) => (
        <Arc index={index} key={`arc-${index}`} {...arc} />
      ))}

      {relationRods.map((rod, index) => (
        <Rod
          from={rod.from}
          key={`rod-${index}`}
          opacity={rod.systemIndex !== undefined && rod.systemIndex < activeNodeLimit ? 0.48 : 0.18}
          to={rod.to}
        />
      ))}

      {systemNodes.map((node, index) => {
        const active = index < activeNodeLimit;
        return (
          <Sphere args={[active ? 0.052 : 0.035, 24, 24]} key={node.label} position={node.position}>
            <meshStandardMaterial
              color={active ? "#E7E2D8" : "#8B8D89"}
              emissive={active ? "#2B2925" : "#000000"}
              emissiveIntensity={active ? 0.45 : 0}
              metalness={0.72}
              roughness={0.26}
              transparent
              opacity={active ? 0.95 : 0.32}
            />
          </Sphere>
        );
      })}

      {Array.from({ length: 18 }).map((_, index) => {
        const angle = index * 0.72;
        const y = -1.8 + (index % 9) * 0.42;
        const from: [number, number, number] = [
          Math.cos(angle) * 0.85,
          y,
          Math.sin(angle) * 0.34,
        ];
        const to: [number, number, number] = [
          Math.cos(angle + 0.28) * 1.18,
          y + Math.sin(angle) * 0.08,
          Math.sin(angle + 0.28) * 0.42,
        ];
        return <Rod from={from} key={`micro-${index}`} opacity={0.12} to={to} />;
      })}

      <mesh position={[0.22, -2.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 72]} />
        <primitive attach="material" object={dimIvory} />
      </mesh>
    </group>
  );
}
