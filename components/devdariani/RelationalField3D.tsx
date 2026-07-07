"use client";

import { Html, Line, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type RelationalField3DProps = {
  order?: number;
};

const nodes = [
  { label: "Structure", start: [-3.7, 1.8, -0.9], end: [-2.05, 0.9, -0.28] },
  { label: "HVAC", start: [-0.2, 2.9, 0.8], end: [-0.72, 1.38, 0.16] },
  { label: "Electrical", start: [3.7, 1.95, -1.1], end: [1.84, 0.78, -0.22] },
  { label: "Plumbing", start: [2.2, -2.55, 0.8], end: [0.98, -0.86, 0.1] },
  { label: "Fire", start: [-3.2, -2.35, 1], end: [-1.42, -0.96, 0.26] },
  { label: "BMS", start: [3.9, -1.8, 0.45], end: [2.15, -0.7, 0.18] },
  { label: "Procurement", start: [-4.1, -2.85, -0.3], end: [-2.24, -1.48, -0.08] },
  { label: "Commissioning", start: [0.45, 0.28, 1.65], end: [0.08, 0.03, 0.46] },
  { label: "Orchestrics", start: [1.7, -0.45, -1.8], end: [0.12, -0.1, -0.1] },
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
      group.current.rotation.y = Math.sin(time * 0.16) * 0.11 + order * 0.08;
      group.current.rotation.x = Math.sin(time * 0.12) * 0.04;
    }

    nodeRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const node = nodes[index];
      const target = interpolate(node.start, node.end, order);
      target.x += Math.sin(time * 0.42 + index) * (0.05 - order * 0.02);
      target.y += Math.cos(time * 0.34 + index * 0.7) * (0.045 - order * 0.018);
      mesh.position.lerp(target, 0.075);
    });
  });

  return (
    <group ref={group} position={[-0.24, 0, 0]} scale={0.88}>
      {links.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          points={[positions[a], positions[b]]}
          color="#f4f1ea"
          transparent
          opacity={0.22 + order * 0.5}
          lineWidth={1}
        />
      ))}
      {nodes.map((node, index) => {
        const isCore = node.label === "Orchestrics";
        return (
          <group key={node.label} position={positions[index]}>
            <Sphere
              ref={(mesh) => {
                nodeRefs.current[index] = mesh;
              }}
              args={[isCore ? 0.12 : 0.07, 32, 32]}
            >
              <meshBasicMaterial
                color={isCore ? "#F4F1EA" : "#C9C6BE"}
                transparent
                opacity={isCore ? 1 : 0.82}
              />
            </Sphere>
            {isCore ? (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[0.23, 0.006, 12, 80]} />
                <meshBasicMaterial color="#F4F1EA" transparent opacity={0.34 + order * 0.35} />
              </mesh>
            ) : null}
            <Html
              center
              distanceFactor={7}
              position={[0, isCore ? -0.34 : -0.24, 0]}
              style={{ pointerEvents: "none" }}
            >
              <span
                style={{
                  color: "rgba(244,241,234,0.64)",
                  display: "block",
                  fontSize: isCore ? "10px" : "8px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {node.label}
              </span>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

export function RelationalField3D({ order = 0 }: RelationalField3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6.2], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <FieldScene order={order} />
    </Canvas>
  );
}
