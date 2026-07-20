export type StageId =
  | "identity"
  | "hvac"
  | "electrical"
  | "plumbing"
  | "fire"
  | "bms";

export type SystemId = "hvac" | "electrical" | "plumbing" | "fire" | "bms";

export const systemWaves: Record<SystemId, readonly [number, number]> = {
  hvac: [0.006, 0.17],
  electrical: [0.18, 0.325],
  plumbing: [0.335, 0.505],
  fire: [0.515, 0.685],
  bms: [0.695, 0.832],
};

export type Vec3 = readonly [number, number, number];

export type Route = {
  id: string;
  points: readonly Vec3[];
};

export type DuctRoute = {
  points: readonly Vec3[];
  section: readonly [number, number];
};

export const stages: readonly {
  id: StageId;
  number: string;
  label: string;
  statement: string;
  at: number;
}[] = [
  {
    id: "identity",
    number: "00",
    label: "Identity",
    statement: "DEVDARIANI",
    at: 0,
  },
  {
    id: "hvac",
    number: "01",
    label: "HVAC",
    statement: "Air, given direction.",
    at: 0.006,
  },
  {
    id: "electrical",
    number: "02",
    label: "Electrical",
    statement: "Energy, routed with intent.",
    at: 0.18,
  },
  {
    id: "plumbing",
    number: "03",
    label: "Plumbing",
    statement: "Flow, held in balance.",
    at: 0.335,
  },
  {
    id: "fire",
    number: "04",
    label: "Fire protection",
    statement: "Protection, built into the whole.",
    at: 0.515,
  },
  {
    id: "bms",
    number: "05",
    label: "BMS",
    statement: "Every signal, orchestrated.",
    at: 0.695,
  },
] as const;

export const systemMeta: Record<
  SystemId,
  {
    label: string;
    initialPosition: Vec3;
    initialRotation: Vec3;
  }
> = {
  hvac: {
    label: "HVAC",
    initialPosition: [4.8, 2.4, -5.2],
    initialRotation: [-0.08, -0.14, 0.08],
  },
  electrical: {
    label: "Electrical",
    initialPosition: [5.4, 0.2, 4.2],
    initialRotation: [0.07, 0.14, -0.06],
  },
  plumbing: {
    label: "Plumbing",
    initialPosition: [2.2, -1.2, 1.1],
    initialRotation: [0.025, -0.04, 0.02],
  },
  fire: {
    label: "Fire protection",
    initialPosition: [2.4, -0.9, -1.2],
    initialRotation: [0.02, 0.035, -0.015],
  },
  bms: {
    label: "BMS",
    initialPosition: [6.2, -1.9, 4.7],
    initialRotation: [0.05, -0.12, 0.05],
  },
};

export const hvacRoutes: readonly DuctRoute[] = [
  {
    points: [
      [-7.6, 2.35, -1.75],
      [-3.2, 2.35, -1.75],
      [-2.2, 2.35, -1.75],
      [-1.25, 2.1, -1.33],
      [0.2, 1.72, -0.72],
      [3.5, 1.72, -0.72],
      [8.4, 1.72, -0.72],
    ],
    section: [1.45, 0.82],
  },
  {
    points: [
      [-0.8, 3.35, -4.8],
      [-0.8, 3.35, -0.75],
      [-0.8, 3.35, 0.05],
      [0.15, 3.02, 0.68],
      [1.5, 2.55, 1.55],
      [1.5, 2.55, 3.3],
      [1.5, 2.55, 5.2],
    ],
    section: [1.16, 0.68],
  },
  {
    points: [
      [3.65, 0.35, -4.2],
      [3.65, 0.35, -0.4],
      [3.65, 0.35, 3.3],
    ],
    section: [1.22, 0.72],
  },
] as const;

export const plumbingRoutes: readonly Route[] = [
  {
    id: "plumbing-a",
    points: [
      [1.2, 4.45, -3.45],
      [6.65, 4.45, -3.45],
      [6.65, 4.45, -1.55],
    ],
  },
  {
    id: "plumbing-b",
    points: [
      [1.2, 4.17, -3.18],
      [6.4, 4.17, -3.18],
      [6.4, 4.17, -1.28],
    ],
  },
  {
    id: "plumbing-return",
    points: [
      [1.2, 3.89, -2.91],
      [6.15, 3.89, -2.91],
      [6.15, 3.89, -1.01],
    ],
  },
] as const;

export const fireRoutes: readonly Route[] = [
  {
    id: "fire-main",
    points: [
      [1.65, 1.1, -4.75],
      [6.35, 1.1, -4.75],
    ],
  },
  {
    id: "fire-branch",
    points: [
      [3.7, 1.1, -4.75],
      [3.7, 2, -4.75],
      [6.2, 2, -4.75],
    ],
  },
] as const;

export const electricalRoutes: readonly Route[] = [
  {
    id: "tray-main",
    points: [
      [-8, 0.72, -2.75],
      [-4.6, 0.72, -2.75],
      [-2.45, 0.72, -2.72],
      [-0.65, 0.72, -1.5],
      [1.4, 0.72, -0.8],
      [4.4, 0.72, -0.8],
      [8.35, 0.72, -0.8],
    ],
  },
  {
    id: "tray-cross",
    points: [
      [-2.85, 1.3, -5.1],
      [-2.85, 1.3, -2.1],
      [-2.25, 1.25, 0.15],
      [-2.1, 1.22, 4.65],
    ],
  },
] as const;

export const bmsRoutes: readonly Route[] = Array.from({ length: 8 }, (_, index) => ({
  id: `bms-${index}`,
  points: [
    [-6.2, -2.7 + index * 0.09, 2.65 + index * 0.07] as Vec3,
    [-2.5, -2.48 + index * 0.09, 2.6 + index * 0.07] as Vec3,
    [0.6, -2.25 + index * 0.09, 2.15 + index * 0.07] as Vec3,
    [3.7, -2.0 + index * 0.09, 1.72 + index * 0.07] as Vec3,
    [8.4, -1.68 + index * 0.09, 1.4 + index * 0.07] as Vec3,
  ],
}));
