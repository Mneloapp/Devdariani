"use client";

import { Line, Sphere, Text } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type SystemDNAChain3DProps = {
  activeIndex?: number;
  progress?: number;
};

const systems = [
  "Structure",
  "HVAC",
  "Electrical",
  "Plumbing",
  "Fire Protection",
  "BMS",
  "Procurement",
  "Commissioning",
  "Orchestrics™",
];

const strandMaterial = {
  line: "#8B8D89",
  ivory: "#F4F1EA",
  graphite: "#A8A29A",
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function labelFade(progress: number, target: number, width: number) {
  const distance = Math.abs(progress - target);
  return clamp(1 - distance / width);
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 760);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return isMobile;
}

function DNAField({
  activeIndex = 0,
  isMobile,
  progress = 0,
}: SystemDNAChain3DProps & { isMobile: boolean }) {
  const group = useRef<THREE.Group>(null);
  const normalized = clamp(progress);
  const revealProgress = clamp((activeIndex - 1) / 8);
  const ordering = Math.max(normalized, revealProgress);
  const spacing = THREE.MathUtils.lerp(0.62, 0.48, smoothstep(0.18, 0.72, ordering));
  const radius = THREE.MathUtils.lerp(isMobile ? 0.78 : 1.05, isMobile ? 0.66 : 0.88, ordering);
  const twist = THREE.MathUtils.lerp(0.78, 1.08, smoothstep(0.28, 0.76, ordering));
  const revealedCount = Math.max(1, Math.min(systems.length, activeIndex));

  const points = useMemo(() => {
    const centerOffset = ((systems.length - 1) * spacing) / 2;
    return systems.map((system, index) => {
      const y = centerOffset - index * spacing;
      const angle = index * twist + ordering * Math.PI * 0.65;
      const strandA = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius * 0.58,
      );
      const strandB = new THREE.Vector3(
        Math.cos(angle + Math.PI) * radius,
        y,
        Math.sin(angle + Math.PI) * radius * 0.58,
      );
      const midpoint = strandA.clone().add(strandB).multiplyScalar(0.5);
      const labelSide = Math.cos(angle) > 0 ? 1 : -1;

      return {
        index,
        labelSide,
        midpoint,
        progressAt: index / (systems.length - 1),
        strandA,
        strandB,
        system,
      };
    });
  }, [ordering, radius, spacing, twist]);

  const strandAPath = points.map((point) => point.strandA);
  const strandBPath = points.map((point) => point.strandB);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (!group.current) return;
    group.current.rotation.y = time * 0.08 + ordering * 0.72;
    group.current.rotation.x = Math.sin(time * 0.1) * 0.045;
  });

  return (
    <group
      ref={group}
      position={[isMobile ? 0.18 : 1.25, isMobile ? 0.02 : -0.16, 0]}
      rotation={[0.05, 0, -0.08]}
      scale={isMobile ? 0.72 : 0.86}
    >
      <Line
        color={strandMaterial.line}
        lineWidth={1}
        opacity={0.1 + ordering * 0.22}
        points={strandAPath}
        transparent
      />
      <Line
        color={strandMaterial.line}
        lineWidth={1}
        opacity={0.1 + ordering * 0.22}
        points={strandBPath}
        transparent
      />

      {points.map((point, index) => {
        const isRevealed = index < revealedCount;
        const isActive = index === Math.max(0, Math.min(systems.length - 1, revealedCount - 1));
        const nodeReveal = smoothstep(point.progressAt - 0.16, point.progressAt + 0.1, ordering);
        const relationOpacity = isRevealed ? 0.16 + nodeReveal * 0.26 : 0.035;
        const nodeOpacity = isActive ? 1 : isRevealed ? 0.46 + nodeReveal * 0.28 : 0.08;
        const labelOpacity = isMobile
          ? 0
          : Math.max(isActive ? 0.9 : 0, labelFade(ordering, point.progressAt, 0.12) * 0.86);
        const activeScale = isActive ? 1.55 : 1;
        const labelX = point.labelSide * 1.72;

        return (
          <group key={point.system}>
            <Line
              color={strandMaterial.graphite}
              lineWidth={isActive ? 1.35 : 1}
              opacity={relationOpacity}
              points={[point.strandA, point.strandB]}
              transparent
            />

            <Sphere args={[0.035, 18, 18]} position={point.strandA}>
              <meshBasicMaterial
                color={strandMaterial.graphite}
                opacity={isRevealed ? 0.42 : 0.1}
                transparent
              />
            </Sphere>
            <Sphere args={[0.035, 18, 18]} position={point.strandB}>
              <meshBasicMaterial
                color={strandMaterial.graphite}
                opacity={isRevealed ? 0.42 : 0.1}
                transparent
              />
            </Sphere>
            <Sphere
              args={[0.075 * activeScale, 28, 28]}
              position={point.midpoint}
            >
              <meshBasicMaterial
                color={isActive ? strandMaterial.ivory : strandMaterial.graphite}
                opacity={nodeOpacity}
                transparent
              />
            </Sphere>

            {!isMobile ? (
              <Text
                anchorX={point.labelSide > 0 ? "left" : "right"}
                anchorY="middle"
                color={strandMaterial.ivory}
                fontSize={isActive ? 0.105 : 0.08}
                letterSpacing={0.08}
                outlineColor="#070707"
                outlineOpacity={0.18}
                outlineWidth={0.006}
                position={[labelX, point.midpoint.y, point.midpoint.z]}
              >
                {point.system.toUpperCase()}
                <meshBasicMaterial
                  color={strandMaterial.ivory}
                  opacity={labelOpacity}
                  transparent
                />
              </Text>
            ) : null}
          </group>
        );
      })}
    </group>
  );
}

export function SystemDNAChain3D({
  activeIndex = 0,
  progress = 0,
}: SystemDNAChain3DProps) {
  const isMobile = useIsMobile();

  return (
    <Canvas
      camera={{ position: [0, 0, isMobile ? 6.4 : 5.8], fov: isMobile ? 44 : 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.95} />
      <DNAField activeIndex={activeIndex} isMobile={isMobile} progress={progress} />
    </Canvas>
  );
}
