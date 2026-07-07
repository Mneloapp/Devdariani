"use client";

import { Line, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type RelationalField3DProps = {
  order?: number;
};

const nodes = [
  { label: "Structure", start: [-2.9, 1.2, -0.5], end: [-2.1, 0.86, -0.3] },
  { label: "HVAC", start: [-0.7, 2.15, 0.4], end: [-0.76, 1.28, 0.18] },
  { label: "Electrical", start: [2.75, 1.55, -0.8], end: [1.74, 0.82, -0.26] },
  { label: "Plumbing", start: [1.5, -1.65, 0.6], end: [0.92, -0.82, 0.12] },
  { label: "Fire", start: [-2.4, -1.85, 0.8], end: [-1.38, -0.92, 0.28] },
  { label: "BMS", start: [3.1, -1.2, 0.35], end: [2.16, -0.68, 0.2] },
  { label: "Procurement", start: [-3.3, -2.2, -0.2], end: [-2.22, -1.44, -0.1] },
  { label: "Commissioning", start: [0.2, 0.1, 1.2], end: [0.05, 0.02, 0.48] },
  { label: "Orchestrics", start: [0.8, -0.2, -1.4], end: [0.16, -0.12, -0.12] },
];

const links = [
  [0, 1],
  [1, 2],
  [2, 7],
  [7, 3],
  [3, 5],
  [3, 4],
  [4, 6],
  [0, 4],
  [1, 8],
  [8, 7],
  [5, 8],
];

function interpolate(start: number[], end: number[], amount: number) {
  return new THREE.Vector3(
    THREE.MathUtils.lerp(start[0], end[0], amount),
    THREE.MathUtils.lerp(start[1], end[1], amount),
    THREE.MathUtils.lerp(start[2], end[2], amount),
  );
}

function FieldScene({ order = 0 }: RelationalField3DProps) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<Array<THREE.Mesh | null>>([]);
  const positions = useMemo(
    () => nodes.map((node) => interpolate(node.start, node.end, order)),
    [order],
  );

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(time * 0.18) * 0.08;
      group.current.rotation.x = Math.sin(time * 0.12) * 0.035;
    }

    nodeRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const node = nodes[index];
      const target = interpolate(node.start, node.end, order);
      target.x += Math.sin(time * 0.32 + index) * 0.035;
      target.y += Math.cos(time * 0.28 + index * 0.7) * 0.03;
      mesh.position.lerp(target, 0.08);
    });
  });

  return (
    <group ref={group}>
      {links.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[positions[a], positions[b]]}
          color="#f4f1ea"
          transparent
          opacity={0.16 + order * 0.42}
          lineWidth={0.7}
        />
      ))}
      {nodes.map((node, index) => {
        const isCore = node.label === "Orchestrics";
        return (
          <Sphere
            key={node.label}
            ref={(mesh) => {
              nodeRefs.current[index] = mesh;
            }}
            args={[isCore ? 0.072 : 0.048, 24, 24]}
            position={positions[index]}
          >
            <meshBasicMaterial
              color={isCore ? "#F4F1EA" : "#C9C6BE"}
              transparent
              opacity={isCore ? 0.95 : 0.72}
            />
          </Sphere>
        );
      })}
    </group>
  );
}

export function RelationalField3D({ order = 0 }: RelationalField3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <FieldScene order={order} />
    </Canvas>
  );
}
