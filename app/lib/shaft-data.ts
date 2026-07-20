export type ShaftStageId =
  | "identity"
  | "hvac"
  | "electrical"
  | "plumbing"
  | "fire"
  | "bms";

export type ShaftSystemId = Exclude<ShaftStageId, "identity">;

export type ShaftVec3 = readonly [number, number, number];

export type ShaftRoute = {
  id: string;
  points: readonly ShaftVec3[];
};

export type ShaftSystemPalette = {
  accent: string;
  dark: string;
  glow: string;
  light: string;
  primary: string;
};

export const SHAFT_SYSTEM_ORDER: readonly ShaftSystemId[] = [
  "hvac",
  "electrical",
  "plumbing",
  "fire",
  "bms",
] as const;

export const shaftSystemWaves: Record<
  ShaftSystemId,
  readonly [number, number]
> = {
  hvac: [0.07, 0.22],
  electrical: [0.22, 0.37],
  plumbing: [0.37, 0.52],
  fire: [0.52, 0.67],
  bms: [0.67, 0.82],
};

/*
 * The colours are intentionally desaturated: each discipline remains immediately
 * legible without turning the white, drawing-led shaft into a conventional BIM
 * coordination viewer.
 */
export const SHAFT_SYSTEM_COLORS: Record<ShaftSystemId, ShaftSystemPalette> = {
  hvac: {
    primary: "#79B6CF",
    light: "#C7DEE7",
    dark: "#397D99",
    accent: "#9AC9DA",
    glow: "#A7D8EA",
  },
  electrical: {
    primary: "#C39843",
    light: "#E1C889",
    dark: "#7C5C20",
    accent: "#D8B664",
    glow: "#E8C976",
  },
  plumbing: {
    primary: "#258FA8",
    light: "#72C8D2",
    dark: "#176074",
    accent: "#45AFC0",
    glow: "#6AD4DF",
  },
  fire: {
    primary: "#B84842",
    light: "#D67A73",
    dark: "#792C29",
    accent: "#C95B54",
    glow: "#E27A73",
  },
  bms: {
    primary: "#7469A3",
    light: "#AAA3C5",
    dark: "#49416F",
    accent: "#3F908B",
    glow: "#6EB8B2",
  },
};

export const shaftStages: readonly {
  id: ShaftStageId;
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
    statement: "Air, carried through the core.",
    at: shaftSystemWaves.hvac[0],
  },
  {
    id: "electrical",
    number: "02",
    label: "Electrical",
    statement: "Power, contained and continuous.",
    at: shaftSystemWaves.electrical[0],
  },
  {
    id: "plumbing",
    number: "03",
    label: "Plumbing",
    statement: "Water, balanced floor by floor.",
    at: shaftSystemWaves.plumbing[0],
  },
  {
    id: "fire",
    number: "04",
    label: "Fire protection",
    statement: "Life safety, rising with the building.",
    at: shaftSystemWaves.fire[0],
  },
  {
    id: "bms",
    number: "05",
    label: "BMS",
    statement: "Every signal, brought into one intelligence.",
    at: shaftSystemWaves.bms[0],
  },
] as const;

/*
 * Routes share one vertical datum, but each discipline owns a coordinated lane:
 * HVAC at the rear-left, electrical at the rear-right, fire at the centre-left,
 * plumbing at the front-right, and BMS against the back wall. Horizontal
 * take-offs remain inside their lane so no service physically intersects another.
 */
export const shaftTracerRoutes: Record<ShaftSystemId, ShaftRoute> = {
  hvac: {
    id: "hvac-riser",
    points: [
      [-1.72, -14.5, -2.08],
      [-1.72, -10.7, -2.08],
      [-1.72, -8.7, -2.08],
      [-0.66, -8.7, -2.08],
      [0.26, -8.7, -2.08],
      [0.26, -8.7, -1.3],
      [0.26, -8.7, -0.78],
    ],
  },
  electrical: {
    id: "electrical-riser",
    points: [
      [2.04, -10.1, -1.4],
      [2.04, -7.2, -1.4],
      [2.04, -4.12, -1.4],
      [2.12, -3.86, -1.45],
      [2.32, -3.74, -1.48],
      [3.07, -3.74, -1.48],
    ],
  },
  plumbing: {
    id: "plumbing-riser",
    points: [
      [1.3, -2.4, 1.18],
      [1.3, 0.3, 1.18],
      [1.3, 2, 1.18],
      [2.05, 2, 1.18],
      [3.05, 2, 1.18],
    ],
  },
  fire: {
    id: "fire-riser",
    points: [
      [-0.48, 4.6, 0.06],
      [-0.48, 6.9, 0.06],
      [-0.48, 8.4, 0.06],
      [0.28, 8.4, 0.06],
      [0.334, 8.389, 0.06],
      [0.379, 8.359, 0.06],
      [0.409, 8.314, 0.06],
      [0.42, 8.26, 0.06],
      [0.42, 7.73, 0.06],
      [0.42, 7.2, 0.06],
    ],
  },
  bms: {
    id: "bms-network",
    points: [
      [2.04, 13.22, -2.7],
      [2.04, 13.42, -2.7],
      [0.5, 13.42, -2.7],
      [-1.58, 13.42, -2.7],
      [-1.58, 14.15, -2.7],
    ],
  },
};

export const SHAFT_LIMITS = {
  bottom: -18,
  halfDepth: 3,
  halfWidth: 3.15,
  roof: 15.5,
} as const;

export const SHAFT_FLOOR_LEVELS = [
  -15,
  -10,
  -5,
  0,
  5,
  10,
  15,
] as const;
