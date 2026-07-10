import type { ChapterId } from "@/lib/devdariani-v2/copy";

export type SceneKeyframe = {
  chapter: ChapterId;
  progress: [number, number];
  camera: [number, number, number];
  target: [number, number, number];
  sculpturePosition: [number, number, number];
  sculptureRotation: [number, number, number];
  sculptureScale: number;
  arcSpread: number;
  detailOpacity: number;
  nodeIntensity: number;
};

export const sceneKeyframes: SceneKeyframe[] = [
  {
    arcSpread: 0.16,
    camera: [0.1, -0.08, 5.4],
    chapter: "home",
    detailOpacity: 0.9,
    nodeIntensity: 0.16,
    progress: [0, 0.13],
    sculpturePosition: [1.18, -0.05, 0],
    sculptureRotation: [0.02, -0.28, -0.02],
    sculptureScale: 1,
    target: [0.2, -0.28, 0],
  },
  {
    arcSpread: 0.48,
    camera: [0.22, -0.18, 4.85],
    chapter: "philosophy",
    detailOpacity: 0.76,
    nodeIntensity: 0.22,
    progress: [0.13, 0.27],
    sculpturePosition: [1.08, -0.02, 0.06],
    sculptureRotation: [0.04, -0.18, 0.02],
    sculptureScale: 1.06,
    target: [0.16, -0.34, 0.02],
  },
  {
    arcSpread: 0.28,
    camera: [-0.1, -0.08, 5.15],
    chapter: "approach",
    detailOpacity: 0.9,
    nodeIntensity: 0.34,
    progress: [0.27, 0.43],
    sculpturePosition: [1.22, -0.04, 0],
    sculptureRotation: [0.02, 0.02, -0.03],
    sculptureScale: 1.02,
    target: [0.18, -0.34, 0],
  },
  {
    arcSpread: 0.18,
    camera: [0.08, -0.04, 5.25],
    chapter: "systems",
    detailOpacity: 1,
    nodeIntensity: 1,
    progress: [0.43, 0.59],
    sculpturePosition: [0.92, -0.02, 0.02],
    sculptureRotation: [0.02, 0.2, 0.01],
    sculptureScale: 1,
    target: [0.16, -0.32, 0],
  },
  {
    arcSpread: 0.06,
    camera: [0, -0.08, 4.95],
    chapter: "orchestrics",
    detailOpacity: 0.88,
    nodeIntensity: 0.74,
    progress: [0.59, 0.73],
    sculpturePosition: [1.08, -0.02, 0],
    sculptureRotation: [0, 0.38, 0],
    sculptureScale: 1.05,
    target: [0.22, -0.36, 0],
  },
  {
    arcSpread: 0.12,
    camera: [0.26, -0.02, 5.9],
    chapter: "work",
    detailOpacity: 0.52,
    nodeIntensity: 0.32,
    progress: [0.73, 0.88],
    sculpturePosition: [1.74, -0.08, -0.12],
    sculptureRotation: [0.02, 0.5, -0.02],
    sculptureScale: 0.72,
    target: [0.28, -0.38, 0],
  },
  {
    arcSpread: 0.02,
    camera: [0.18, -0.06, 6.1],
    chapter: "contact",
    detailOpacity: 0.26,
    nodeIntensity: 0.2,
    progress: [0.88, 1],
    sculpturePosition: [1.72, -0.08, -0.24],
    sculptureRotation: [0, 0.62, 0],
    sculptureScale: 0.66,
    target: [0.2, -0.36, 0],
  },
];

export function findSceneKeyframe(progress: number) {
  return (
    sceneKeyframes.find(({ progress: [start, end] }) => progress >= start && progress <= end) ??
    sceneKeyframes[sceneKeyframes.length - 1]
  );
}
