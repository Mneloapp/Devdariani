"use client";

import { Html, Line, Sphere } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type RelationalField3DProps = {
  activeLabel?: string;
  order?: number;
  revealedLabels?: string[];
  tone?: "dark" | "light";
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

const orbitPoints = [
  { radiusX: 2.9, radiusY: 1.08, z: -0.18, tilt: 0.28, opacity: 0.2 },
  { radiusX: 2.35, radiusY: 1.72, z: 0.08, tilt: -0.42, opacity: 0.16 },
  { radiusX: 3.2, radiusY: 0.68, z: 0.2, tilt: 0.86, opacity: 0.12 },
].map((orbit) => ({
  ...orbit,
  points: Array.from({ length: 132 }, (_, index) => {
    const angle = (index / 131) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * orbit.radiusX,
      Math.sin(angle) * orbit.radiusY,
      orbit.z + Math.sin(angle * 2) * 0.08,
    );
  }),
}));

function interpolate(start: number[], end: number[], amount: number) {
  return new THREE.Vector3(
    THREE.MathUtils.lerp(start[0], end[0], amount),
    THREE.MathUtils.lerp(start[1], end[1], amount),
    THREE.MathUtils.lerp(start[2], end[2], amount),
  );
}

function FieldScene({
  activeLabel = "Orchestrics",
  order = 0,
  revealedLabels = [],
  tone = "dark",
}: RelationalField3DProps) {
  const group = useRef<THREE.Group>(null);
  const nodeRefs = useRef<Array<THREE.Group | null>>([]);
  const palette = tone === "light"
    ? {
        line: "#111111",
        core: "#111111",
        node: "#2B2B2B",
        label: "rgba(17,17,17,0.58)",
      }
    : {
        line: "#f4f1ea",
        core: "#F4F1EA",
        node: "#C9C6BE",
        label: "rgba(244,241,234,0.64)",
      };
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

    nodeRefs.current.forEach((nodeGroup, index) => {
      if (!nodeGroup) return;
      const node = nodes[index];
      const target = interpolate(node.start, node.end, order);
      const drift = Math.max(0.012, 0.07 - order * 0.04);
      target.x += Math.sin(time * 0.42 + index) * drift;
      target.y += Math.cos(time * 0.34 + index * 0.7) * drift;
      target.z += Math.sin(time * 0.26 + index * 1.3) * drift * 0.7;
      nodeGroup.position.lerp(target, 0.075);
    });
  });

  return (
    <group ref={group} position={[-0.04, 0, 0]} scale={1.02}>
      {orbitPoints.map((orbit, index) => (
        <group
          key={`${orbit.radiusX}-${orbit.radiusY}`}
          rotation={[orbit.tilt, index * 0.42, orbit.tilt * 0.3]}
        >
          <Line
            points={orbit.points}
            color={palette.line}
            transparent
            opacity={tone === "light" ? orbit.opacity + order * 0.09 : orbit.opacity + order * 0.12}
            lineWidth={1}
          />
        </group>
      ))}
      {links.map(([a, b]) => (
        (() => {
          const aLabel = nodes[a].label;
          const bLabel = nodes[b].label;
          const isRevealed =
            revealedLabels.includes(aLabel) && revealedLabels.includes(bLabel);
          const isActive = aLabel === activeLabel || bLabel === activeLabel;
          return (
            <Line
              key={`${a}-${b}`}
              points={[positions[a], positions[b]]}
              color={palette.line}
              transparent
              opacity={
                isActive
                  ? 0.42 + order * 0.34
                  : isRevealed
                    ? 0.16 + order * 0.18
                    : 0.025
              }
              lineWidth={isActive ? 1.4 : 1}
            />
          );
        })()
      ))}
      {nodes.map((node, index) => {
        const isCore = node.label === "Orchestrics";
        const isActive = node.label === activeLabel;
        const isRevealed = revealedLabels.includes(node.label) || isActive;
        const nodeOpacity = isActive
          ? 1
          : isRevealed
            ? tone === "light" ? 0.42 : 0.52
            : 0.08;
        return (
          <group
            key={node.label}
            ref={(nodeGroup) => {
              nodeRefs.current[index] = nodeGroup;
            }}
            position={positions[index]}
          >
            <Sphere
              args={[isCore ? 0.16 : 0.075, 32, 32]}
            >
              <meshBasicMaterial
                color={isCore ? palette.core : palette.node}
                transparent
                opacity={nodeOpacity}
              />
            </Sphere>
            {isCore || isActive ? (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[isActive ? 0.34 : 0.32, 0.006, 12, 96]} />
                <meshBasicMaterial
                  color={palette.core}
                  transparent
                  opacity={
                    isActive
                      ? 0.42 + order * 0.28
                      : tone === "light" ? 0.12 + order * 0.14 : 0.18 + order * 0.22
                  }
                />
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
                  color: palette.label,
                  display: "block",
                  fontSize: isCore ? "10px" : "8px",
                  letterSpacing: "0.22em",
                  opacity: isActive ? 1 : isRevealed ? 0.42 : 0,
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

export function RelationalField3D({
  activeLabel = "Orchestrics",
  order = 0,
  revealedLabels = [],
  tone = "dark",
}: RelationalField3DProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <FieldScene
        activeLabel={activeLabel}
        order={order}
        revealedLabels={revealedLabels}
        tone={tone}
      />
    </Canvas>
  );
}
