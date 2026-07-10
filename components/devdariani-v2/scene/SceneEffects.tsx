"use client";

import { Bloom, EffectComposer, Noise, SMAA, Vignette } from "@react-three/postprocessing";

type SceneEffectsProps = {
  enabled: boolean;
};

export function SceneEffects({ enabled }: SceneEffectsProps) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <SMAA />
      <Bloom intensity={0.18} luminanceSmoothing={0.72} luminanceThreshold={0.74} mipmapBlur />
      <Noise opacity={0.018} />
      <Vignette darkness={0.42} eskil={false} offset={0.22} />
    </EffectComposer>
  );
}
