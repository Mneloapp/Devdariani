"use client";

import { AdaptiveDpr, Grid, OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import type { SceneKeyframe } from "./scene-keyframes";
import { sceneKeyframes } from "./scene-keyframes";
import { CameraRig } from "./CameraRig";
import { MechanicalOrchestrator } from "./MechanicalOrchestrator";
import { SceneEffects } from "./SceneEffects";
import { SceneLighting } from "./SceneLighting";

type OrchestricsSceneProps = {
  activeChapter: string;
  debug: boolean;
  keyframeRef: React.MutableRefObject<SceneKeyframe>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
};

export function OrchestricsScene({
  activeChapter,
  debug,
  keyframeRef,
  pointerRef,
  progressRef,
  reducedMotion,
}: OrchestricsSceneProps) {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 0.92;
  }, [gl]);

  useFrame(() => {
    const progress = progressRef.current;
    const keyframe =
      sceneKeyframes.find(({ progress: [start, end] }) => progress >= start && progress <= end) ??
      sceneKeyframes[sceneKeyframes.length - 1];
    keyframeRef.current = keyframe;
  });

  return (
    <>
      <color args={["#050607"]} attach="background" />
      <AdaptiveDpr pixelated />
      <CameraRig keyframeRef={keyframeRef} pointerRef={pointerRef} />
      <SceneLighting />
      <MechanicalOrchestrator
        activeChapter={activeChapter}
        keyframeRef={keyframeRef}
        pointerRef={pointerRef}
        progressRef={progressRef}
      />
      <SceneEffects enabled={!reducedMotion} />
      {debug ? (
        <>
          <OrbitControls enablePan enableZoom />
          <axesHelper args={[2]} />
          <Grid args={[6, 6]} cellColor="#54575B" cellSize={0.5} position={[0, -2.65, 0]} sectionColor="#A99478" />
        </>
      ) : null}
    </>
  );
}
