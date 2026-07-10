"use client";

import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { useMotionValueEvent } from "framer-motion";
import { Suspense, useEffect, useRef } from "react";
import type { SceneKeyframe } from "./scene-keyframes";
import { sceneKeyframes } from "./scene-keyframes";
import { OrchestricsScene } from "./OrchestricsScene";

type OrchestricsCanvasProps = {
  activeChapter: string;
  debug: boolean;
  progress: MotionValue<number>;
  reducedMotion: boolean;
};

export function OrchestricsCanvas({
  activeChapter,
  debug,
  progress,
  reducedMotion,
}: OrchestricsCanvasProps) {
  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const keyframeRef = useRef<SceneKeyframe>(sceneKeyframes[0]);

  useMotionValueEvent(progress, "change", (latest) => {
    progressRef.current = latest;
  });

  useEffect(() => {
    function onPointerMove(event: PointerEvent) {
      pointerRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: -(event.clientY / window.innerHeight - 0.5) * 2,
      };
    }

    if (reducedMotion) return;
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_42%,rgba(233,230,223,0.13),transparent_18rem)]">
        <div className="absolute right-[18%] top-[22%] h-[46vh] w-px bg-[var(--line-strong)]" />
        <div className="absolute right-[12%] top-[32%] h-[28vh] w-[22vw] rounded-full border border-[var(--line)]" />
      </div>
    );
  }

  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 1.55]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <OrchestricsScene
          activeChapter={activeChapter}
          debug={debug}
          keyframeRef={keyframeRef}
          pointerRef={pointerRef}
          progressRef={progressRef}
          reducedMotion={reducedMotion}
        />
      </Suspense>
    </Canvas>
  );
}
