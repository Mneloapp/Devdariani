"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { SceneKeyframe } from "./scene-keyframes";

type CameraRigProps = {
  keyframeRef: React.MutableRefObject<SceneKeyframe>;
  pointerRef: React.MutableRefObject<{ x: number; y: number }>;
};

export function CameraRig({ keyframeRef, pointerRef }: CameraRigProps) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const target = useMemo(() => new THREE.Vector3(), []);
  const cameraPosition = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!camera.current) return;
    const keyframe = keyframeRef.current;
    const pointer = pointerRef.current;
    cameraPosition.set(...keyframe.camera);
    cameraPosition.x += pointer.x * 0.1;
    cameraPosition.y += pointer.y * 0.06;
    target.set(...keyframe.target);
    target.x += pointer.x * 0.04;
    target.y += pointer.y * 0.025;

    camera.current.position.lerp(cameraPosition, 0.045);
    camera.current.lookAt(target);
  });

  return <PerspectiveCamera makeDefault fov={42} position={[0.1, -0.08, 5.4]} ref={camera} />;
}
