import { systems } from "@/lib/devdariani-v2/copy";

export type PlateSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

export type ArcSpec = {
  arc: number;
  position: [number, number, number];
  radius: number;
  rotation: [number, number, number];
  speed: number;
  tube: number;
};

export type RodSpec = {
  from: [number, number, number];
  to: [number, number, number];
  systemIndex?: number;
};

export type NodeSpec = {
  label: (typeof systems)[number];
  position: [number, number, number];
};

export const spinePlates: PlateSpec[] = [
  { position: [0.16, 0.9, 0.02], rotation: [0.02, -0.08, 0.01], scale: [0.16, 1.72, 0.18] },
  { position: [0.32, 0.18, -0.1], rotation: [0.04, 0.12, -0.015], scale: [0.13, 2.24, 0.14] },
  { position: [0.04, -0.45, 0.12], rotation: [-0.03, -0.18, 0.02], scale: [0.2, 2.82, 0.12] },
  { position: [0.42, -1.1, 0.18], rotation: [0.01, 0.2, 0.018], scale: [0.12, 1.7, 0.2] },
  { position: [-0.08, 1.72, -0.08], rotation: [0.08, -0.16, 0.04], scale: [0.24, 0.82, 0.16] },
  { position: [0.56, 1.28, 0.2], rotation: [-0.05, 0.1, -0.02], scale: [0.18, 1.14, 0.1] },
  { position: [0.26, -2.04, -0.04], rotation: [0.04, -0.08, -0.01], scale: [0.11, 1.28, 0.16] },
  { position: [-0.18, -1.42, 0.22], rotation: [-0.06, 0.18, 0.03], scale: [0.16, 1.86, 0.1] },
];

export const structuralPlates: PlateSpec[] = [
  { position: [-0.9, -0.68, 0.18], rotation: [0.02, 0.05, 0.04], scale: [1.1, 0.11, 0.12] },
  { position: [-0.64, -1.04, -0.16], rotation: [0.04, -0.12, -0.18], scale: [0.74, 0.08, 0.14] },
  { position: [0.92, 0.24, -0.2], rotation: [0.02, -0.1, 0.26], scale: [0.88, 0.07, 0.11] },
  { position: [1.14, -0.48, 0.18], rotation: [0.02, 0.16, -0.1], scale: [0.66, 0.08, 0.1] },
  { position: [-0.42, 1.18, 0.22], rotation: [0.12, -0.22, -0.08], scale: [0.1, 0.92, 0.11] },
  { position: [0.78, 1.0, -0.18], rotation: [-0.08, 0.2, 0.06], scale: [0.1, 1.26, 0.1] },
  { position: [-0.84, 0.38, -0.22], rotation: [0.06, 0.2, -0.48], scale: [0.58, 0.065, 0.1] },
  { position: [0.58, -1.58, 0.24], rotation: [-0.04, -0.1, 0.18], scale: [0.62, 0.07, 0.1] },
  { position: [1.04, 1.54, 0.04], rotation: [0.1, 0.08, 0.1], scale: [0.08, 0.78, 0.12] },
  { position: [-1.02, -1.38, -0.12], rotation: [-0.05, 0.2, -0.08], scale: [0.72, 0.08, 0.1] },
];

export const orbitalArcs: ArcSpec[] = [
  { arc: 4.55, position: [0.08, -0.14, -0.08], radius: 1.36, rotation: [1.58, 0.12, 0.18], speed: 0.055, tube: 0.016 },
  { arc: 3.4, position: [0.14, 0.02, 0.12], radius: 1.08, rotation: [1.42, -0.2, -0.48], speed: -0.04, tube: 0.022 },
  { arc: 2.72, position: [0.2, -0.2, -0.24], radius: 1.72, rotation: [1.64, 0.24, 0.82], speed: 0.026, tube: 0.012 },
  { arc: 2.3, position: [-0.04, 0.12, 0.26], radius: 0.82, rotation: [1.5, -0.42, 2.0], speed: -0.032, tube: 0.018 },
  { arc: 3.88, position: [0.18, -0.1, 0.0], radius: 1.95, rotation: [1.7, 0.1, -1.18], speed: 0.018, tube: 0.01 },
  { arc: 2.86, position: [0.04, 0.34, -0.18], radius: 1.52, rotation: [1.34, -0.16, 1.38], speed: -0.018, tube: 0.012 },
];

export const systemNodes: NodeSpec[] = [
  { label: systems[0], position: [1.86, 0.94, 0.08] },
  { label: systems[1], position: [1.78, 0.54, -0.28] },
  { label: systems[2], position: [1.9, 0.08, 0.2] },
  { label: systems[3], position: [1.64, -0.38, -0.18] },
  { label: systems[4], position: [1.82, -0.82, 0.1] },
  { label: systems[5], position: [1.54, -1.18, -0.3] },
  { label: systems[6], position: [1.74, -1.58, 0.22] },
  { label: systems[7], position: [1.42, -1.98, -0.1] },
  { label: systems[8], position: [0.22, -0.36, 0.42] },
];

export const relationRods: RodSpec[] = [
  ...systemNodes.map((node, index) => ({
    from: [0.22, -0.36, 0.18] as [number, number, number],
    systemIndex: index,
    to: node.position,
  })),
  { from: [-1.08, 0.18, -0.18], to: [0.18, -0.28, 0.22] },
  { from: [-1.26, -0.72, 0.2], to: [0.1, -0.46, -0.2] },
  { from: [1.16, 1.28, -0.12], to: [0.28, 0.16, 0.16] },
  { from: [0.96, -1.72, 0.24], to: [0.18, -0.52, -0.08] },
  { from: [-0.58, 1.46, 0.24], to: [0.22, -0.12, 0.02] },
  { from: [1.42, -0.02, -0.28], to: [0.26, -0.38, 0.26] },
  { from: [-1.12, -1.28, -0.24], to: [0.02, -0.52, 0.1] },
  { from: [0.74, 1.7, 0.1], to: [0.18, 0.02, -0.18] },
];
