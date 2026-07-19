"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  SHAFT_FLOOR_LEVELS,
  SHAFT_LIMITS,
  SHAFT_SYSTEM_COLORS,
  SHAFT_SYSTEM_ORDER,
  shaftSystemWaves,
  shaftTracerRoutes,
  type ShaftSystemId,
  type ShaftVec3,
} from "@/app/lib/shaft-data";
import type { WeaveSoundFrame } from "./spatial-sound";

export type ShaftJourneyCanvasProps = {
  narrativeFrameRef: RefObject<((progress: number) => void) | null>;
  progressRef: RefObject<number>;
  reducedMotion: boolean;
  soundFrameRef: RefObject<((frame: WeaveSoundFrame) => void) | null>;
  waveLabelRef: RefObject<HTMLDivElement | null>;
};

type OpacityMaterial = THREE.Material & {
  depthWrite: boolean;
  opacity: number;
  transparent: boolean;
};

type MaterialRecord = {
  baseOpacity: number;
  material: OpacityMaterial;
};

type TracerRecord = {
  coreMaterial: THREE.MeshBasicMaterial;
  curve: THREE.Curve<THREE.Vector3>;
  group: THREE.Group;
  haloMaterial: THREE.MeshBasicMaterial;
};

const PAPER = "#F4F3EF";
const PAPER_SOFT = "#E5E4DF";
const GRAPHITE = "#303235";
const STEEL = "#5B5E61";
const LIGHT = "#FFFFFF";

const SYSTEM_FOCUS_X: Record<ShaftSystemId, number> = {
  hvac: -1.2,
  electrical: 1.28,
  plumbing: 2.05,
  fire: -0.1,
  bms: 1.12,
};

const SYSTEM_LANES: Record<ShaftSystemId, { x: number; z: number }> = {
  hvac: { x: -1.72, z: -2.08 },
  electrical: { x: 2.04, z: -1.48 },
  plumbing: { x: 1.03, z: 1.18 },
  fire: { x: -0.48, z: 0.06 },
  bms: { x: 2.04, z: -2.7 },
};

const SYSTEM_FOCUS_STOPS = [
  { at: 0, x: 0 },
  ...SHAFT_SYSTEM_ORDER.map((id) => ({
    at: (shaftSystemWaves[id][0] + shaftSystemWaves[id][1]) / 2,
    x: SYSTEM_FOCUS_X[id],
  })),
  { at: shaftSystemWaves.bms[1], x: 0 },
] as const;

const SYSTEM_MARKER_RADIUS: Record<ShaftSystemId, number> = {
  hvac: 0.075,
  electrical: 0.055,
  plumbing: 0.065,
  fire: 0.075,
  bms: 0.055,
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(from: number, to: number, value: number) {
  const normalized = clamp01((value - from) / Math.max(0.0001, to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function lerp(from: number, to: number, value: number) {
  return from + (to - from) * value;
}

function cameraFocusX(progress: number) {
  for (let index = 1; index < SYSTEM_FOCUS_STOPS.length; index += 1) {
    const previous = SYSTEM_FOCUS_STOPS[index - 1];
    const next = SYSTEM_FOCUS_STOPS[index];
    if (progress <= next.at) {
      return lerp(previous.x, next.x, smoothstep(previous.at, next.at, progress));
    }
  }
  return SYSTEM_FOCUS_STOPS[SYSTEM_FOCUS_STOPS.length - 1].x;
}

function vector(value: ShaftVec3) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function createPolylineCurve(points: readonly ShaftVec3[]) {
  const path = new THREE.CurvePath<THREE.Vector3>();
  for (let index = 1; index < points.length; index += 1) {
    path.add(new THREE.LineCurve3(vector(points[index - 1]), vector(points[index])));
  }
  path.arcLengthDivisions = 180;
  path.updateArcLengths();
  return path;
}

function createTube(
  curve: THREE.Curve<THREE.Vector3>,
  radius: number,
  material: THREE.Material,
  radialSegments = 8,
  tubularSegments = 80,
) {
  return new THREE.Mesh(
    new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false),
    material,
  );
}

function createCylinderBetween(
  from: THREE.Vector3,
  to: THREE.Vector3,
  radius: number,
  material: THREE.Material,
  radialSegments = 12,
) {
  const direction = to.clone().sub(from);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), radialSegments),
    material,
  );
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function addBoxEdges(
  group: THREE.Group,
  mesh: THREE.Mesh<THREE.BoxGeometry, THREE.Material>,
  material: THREE.LineBasicMaterial,
) {
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 18), material);
  edges.position.copy(mesh.position);
  edges.quaternion.copy(mesh.quaternion);
  edges.scale.copy(mesh.scale);
  group.add(edges);
  return edges;
}

function systemEmphasis(id: ShaftSystemId, progress: number) {
  const [start, end] = shaftSystemWaves[id];
  if (progress < start - 0.035) return 0.07;
  if (progress <= end) {
    const local = clamp01((progress - start) / (end - start));
    const arrival = smoothstep(start - 0.035, start + 0.045, progress);
    return lerp(0.07, 0.72 + Math.sin(local * Math.PI) * 0.28, arrival);
  }
  return lerp(0.72, 0.45, smoothstep(end, end + 0.065, progress));
}

export function ShaftJourneyCanvas({
  narrativeFrameRef,
  progressRef,
  reducedMotion,
  soundFrameRef,
  waveLabelRef,
}: ShaftJourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mobileTier, setMobileTier] = useState(false);
  const [compactTier, setCompactTier] = useState(false);

  useEffect(() => {
    const mobileMedia = window.matchMedia("(max-width: 767px), (max-aspect-ratio: 4/5)");
    const compactMedia = window.matchMedia("(max-width: 1279px)");
    const update = () => {
      setMobileTier(mobileMedia.matches);
      setCompactTier(compactMedia.matches);
    };
    update();
    mobileMedia.addEventListener("change", update);
    compactMedia.addEventListener("change", update);
    return () => {
      mobileMedia.removeEventListener("change", update);
      compactMedia.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const waveLabel = waveLabelRef.current;
    const isMobile = mobileTier;
    const isCompact = compactTier;
    let contextFailed = false;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        canvas,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.dataset.failed = "true";
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.setClearColor(0xf4f3ef, 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(PAPER);
    scene.fog = new THREE.Fog(PAPER, 28, 165);

    const camera = new THREE.PerspectiveCamera(isMobile ? 59 : 51, 1, 0.08, 190);
    const shaftRoot = new THREE.Group();
    shaftRoot.name = "engineering-shaft";
    scene.add(shaftRoot);

    const shaftMaterials: MaterialRecord[] = [];
    const systemMaterials = new Map<ShaftSystemId, MaterialRecord[]>();
    const tracers = new Map<ShaftSystemId, TracerRecord>();

    const registerMaterial = <T extends OpacityMaterial>(
      records: MaterialRecord[],
      material: T,
      baseOpacity: number,
    ) => {
      material.transparent = true;
      material.opacity = baseOpacity;
      material.depthWrite = false;
      records.push({ baseOpacity, material });
      return material;
    };

    const registerSystemMaterial = <T extends OpacityMaterial>(
      id: ShaftSystemId,
      material: T,
      baseOpacity: number,
    ) => {
      const records = systemMaterials.get(id) ?? [];
      systemMaterials.set(id, records);
      return registerMaterial(records, material, baseOpacity);
    };

    const structureMaterial = registerMaterial(
      shaftMaterials,
      new THREE.MeshStandardMaterial({
        color: GRAPHITE,
        metalness: 0.66,
        roughness: 0.38,
      }),
      0.46,
    );
    const wallMaterial = registerMaterial(
      shaftMaterials,
      new THREE.MeshBasicMaterial({
        color: PAPER_SOFT,
        side: THREE.DoubleSide,
      }),
      0.2,
    );
    const wallGridMaterial = registerMaterial(
      shaftMaterials,
      new THREE.LineBasicMaterial({ color: STEEL }),
      0.2,
    );

    const shaftHeight = SHAFT_LIMITS.roof - SHAFT_LIMITS.bottom;
    const shaftCenterY = (SHAFT_LIMITS.roof + SHAFT_LIMITS.bottom) / 2;
    const wallWidth = SHAFT_LIMITS.halfWidth * 2;
    const wallDepth = SHAFT_LIMITS.halfDepth * 2;

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(wallWidth, shaftHeight), wallMaterial);
    backWall.position.set(0, shaftCenterY, -SHAFT_LIMITS.halfDepth);
    shaftRoot.add(backWall);

    [-1, 1].forEach((side) => {
      const sideWall = new THREE.Mesh(
        new THREE.PlaneGeometry(wallDepth, shaftHeight),
        wallMaterial,
      );
      sideWall.position.set(side * SHAFT_LIMITS.halfWidth, shaftCenterY, 0);
      sideWall.rotation.y = Math.PI / 2;
      shaftRoot.add(sideWall);
    });

    const columnGeometry = new THREE.BoxGeometry(0.12, shaftHeight, 0.12);
    const columns = new THREE.InstancedMesh(columnGeometry, structureMaterial, 4);
    const instanceMatrix = new THREE.Matrix4();
    [
      [-SHAFT_LIMITS.halfWidth, shaftCenterY, -SHAFT_LIMITS.halfDepth],
      [SHAFT_LIMITS.halfWidth, shaftCenterY, -SHAFT_LIMITS.halfDepth],
      [-SHAFT_LIMITS.halfWidth, shaftCenterY, SHAFT_LIMITS.halfDepth],
      [SHAFT_LIMITS.halfWidth, shaftCenterY, SHAFT_LIMITS.halfDepth],
    ].forEach(([x, y, z], index) => {
      instanceMatrix.makeTranslation(x, y, z);
      columns.setMatrixAt(index, instanceMatrix);
    });
    columns.instanceMatrix.needsUpdate = true;
    shaftRoot.add(columns);

    const levelBeamGeometry = new THREE.BoxGeometry(wallWidth, 0.11, 0.12);
    const levelBeams = new THREE.InstancedMesh(
      levelBeamGeometry,
      structureMaterial,
      SHAFT_FLOOR_LEVELS.length * 2,
    );
    SHAFT_FLOOR_LEVELS.forEach((level, index) => {
      instanceMatrix.makeTranslation(0, level, -SHAFT_LIMITS.halfDepth);
      levelBeams.setMatrixAt(index * 2, instanceMatrix);
      instanceMatrix.makeTranslation(0, level, SHAFT_LIMITS.halfDepth);
      levelBeams.setMatrixAt(index * 2 + 1, instanceMatrix);
    });
    levelBeams.instanceMatrix.needsUpdate = true;
    shaftRoot.add(levelBeams);

    const sideBeamGeometry = new THREE.BoxGeometry(0.12, 0.11, wallDepth);
    const sideBeams = new THREE.InstancedMesh(
      sideBeamGeometry,
      structureMaterial,
      SHAFT_FLOOR_LEVELS.length * 2,
    );
    SHAFT_FLOOR_LEVELS.forEach((level, index) => {
      instanceMatrix.makeTranslation(-SHAFT_LIMITS.halfWidth, level, 0);
      sideBeams.setMatrixAt(index * 2, instanceMatrix);
      instanceMatrix.makeTranslation(SHAFT_LIMITS.halfWidth, level, 0);
      sideBeams.setMatrixAt(index * 2 + 1, instanceMatrix);
    });
    sideBeams.instanceMatrix.needsUpdate = true;
    shaftRoot.add(sideBeams);

    for (let index = -2; index <= 2; index += 1) {
      const x = (index / 2) * SHAFT_LIMITS.halfWidth;
      const verticalGrid = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(x, SHAFT_LIMITS.bottom, -SHAFT_LIMITS.halfDepth + 0.012),
          new THREE.Vector3(x, SHAFT_LIMITS.roof, -SHAFT_LIMITS.halfDepth + 0.012),
        ]),
        wallGridMaterial,
      );
      shaftRoot.add(verticalGrid);
    }

    SHAFT_FLOOR_LEVELS.forEach((level) => {
      const levelLine = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-SHAFT_LIMITS.halfWidth, level, -SHAFT_LIMITS.halfDepth + 0.014),
          new THREE.Vector3(SHAFT_LIMITS.halfWidth, level, -SHAFT_LIMITS.halfDepth + 0.014),
        ]),
        wallGridMaterial,
      );
      shaftRoot.add(levelLine);
    });

    const roofRing = new THREE.Group();
    roofRing.position.y = SHAFT_LIMITS.roof;
    const roofLongGeometry = new THREE.BoxGeometry(wallWidth + 0.5, 0.22, 0.28);
    const roofShortGeometry = new THREE.BoxGeometry(0.28, 0.22, wallDepth + 0.5);
    [-1, 1].forEach((side) => {
      const longBeam = new THREE.Mesh(roofLongGeometry, structureMaterial);
      longBeam.position.z = side * (SHAFT_LIMITS.halfDepth + 0.12);
      roofRing.add(longBeam);
      const shortBeam = new THREE.Mesh(roofShortGeometry, structureMaterial);
      shortBeam.position.x = side * (SHAFT_LIMITS.halfWidth + 0.12);
      roofRing.add(shortBeam);
    });
    const roofLouvers: THREE.Mesh[] = [];
    const roofLouverGeometry = new THREE.BoxGeometry(wallWidth - 0.55, 0.07, 0.34);
    for (let index = 0; index < 7; index += 1) {
      const louver = new THREE.Mesh(roofLouverGeometry, structureMaterial);
      louver.position.set(0, 0.04, lerp(-2.05, 2.05, index / 6));
      roofRing.add(louver);
      roofLouvers.push(louver);
    }
    shaftRoot.add(roofRing);

    const systemGroups = new Map<ShaftSystemId, THREE.Group>();
    const addSystem = (id: ShaftSystemId) => {
      const group = new THREE.Group();
      group.name = `${id}-shaft-system`;
      shaftRoot.add(group);
      systemGroups.set(id, group);
      return group;
    };

    // HVAC — rear-left lane. Every rectangular section meets through a visible
    // collar or elbow casing, so the take-off reads as fabricated ductwork rather
    // than overlapping boxes.
    const hvac = addSystem("hvac");
    const hvacSurface = registerSystemMaterial(
      "hvac",
      new THREE.MeshPhysicalMaterial({
        clearcoat: 0.16,
        clearcoatRoughness: 0.48,
        color: SHAFT_SYSTEM_COLORS.hvac.light,
        metalness: 0.24,
        roughness: 0.42,
        side: THREE.DoubleSide,
      }),
      0.42,
    );
    const hvacEdges = registerSystemMaterial(
      "hvac",
      new THREE.LineBasicMaterial({ color: SHAFT_SYSTEM_COLORS.hvac.dark }),
      0.94,
    );
    const verticalDuct = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, shaftHeight - 1.3, 0.72),
      hvacSurface,
    );
    verticalDuct.position.set(
      SYSTEM_LANES.hvac.x,
      shaftCenterY - 0.2,
      SYSTEM_LANES.hvac.z,
    );
    hvac.add(verticalDuct);
    addBoxEdges(hvac, verticalDuct, hvacEdges);

    const ductBranch = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.72, 0.72), hvacSurface);
    ductBranch.position.set(-0.655, -8.7, SYSTEM_LANES.hvac.z);
    hvac.add(ductBranch);
    addBoxEdges(hvac, ductBranch, hvacEdges);

    const ductTakeoffCollar = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.82, 0.82),
      hvacSurface,
    );
    ductTakeoffCollar.position.set(-1.18, -8.7, SYSTEM_LANES.hvac.z);
    hvac.add(ductTakeoffCollar);
    addBoxEdges(hvac, ductTakeoffCollar, hvacEdges);

    const ductElbow = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.78, 0.78), hvacSurface);
    ductElbow.position.set(0.26, -8.7, SYSTEM_LANES.hvac.z);
    hvac.add(ductElbow);
    addBoxEdges(hvac, ductElbow, hvacEdges);

    const ductForward = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.79), hvacSurface);
    ductForward.position.set(0.26, -8.7, -1.295);
    hvac.add(ductForward);
    addBoxEdges(hvac, ductForward, hvacEdges);

    const ductElbowCollar = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 0.82, 0.1),
      hvacSurface,
    );
    ductElbowCollar.position.set(0.26, -8.7, -1.69);
    hvac.add(ductElbowCollar);
    addBoxEdges(hvac, ductElbowCollar, hvacEdges);

    const ductOutlet = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.58, 0.2), hvacSurface);
    ductOutlet.position.set(0.26, -8.7, -0.78);
    hvac.add(ductOutlet);
    addBoxEdges(hvac, ductOutlet, hvacEdges);

    const outletNeck = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.68, 0.14), hvacSurface);
    outletNeck.position.set(0.26, -8.7, -0.92);
    hvac.add(outletNeck);
    addBoxEdges(hvac, outletNeck, hvacEdges);

    SHAFT_FLOOR_LEVELS.slice(0, -1).forEach((level) => {
      const collar = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(1.16, 0.14, 0.8)),
        hvacEdges,
      );
      collar.position.set(SYSTEM_LANES.hvac.x, level + 0.38, SYSTEM_LANES.hvac.z);
      hvac.add(collar);
    });

    // Electrical — rear-right ladder tray. The horizontal take-off turns toward
    // the side wall and every cable lands inside a proper penetration plate.
    const electrical = addSystem("electrical");
    const trayMaterial = registerSystemMaterial(
      "electrical",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.electrical.primary,
        metalness: 0.68,
        roughness: 0.34,
      }),
      0.92,
    );
    const electricalCableColors = [
      SHAFT_SYSTEM_COLORS.electrical.dark,
      SHAFT_SYSTEM_COLORS.electrical.primary,
      SHAFT_SYSTEM_COLORS.electrical.light,
    ];
    const cableMaterials = electricalCableColors.map((color, index) =>
      registerSystemMaterial(
        "electrical",
        new THREE.MeshStandardMaterial({ color, metalness: 0.28, roughness: 0.46 }),
        index === 0 ? 0.98 : 0.88,
      ),
    );
    const electricalVerticalBottom = SHAFT_LIMITS.bottom + 0.08;
    const electricalVerticalTop = SHAFT_LIMITS.roof - 0.08;
    const electricalVerticalHeight = electricalVerticalTop - electricalVerticalBottom;
    const electricalVerticalCenter =
      (electricalVerticalTop + electricalVerticalBottom) / 2;
    [-0.31, 0.31].forEach((offset) => {
      const rail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, electricalVerticalHeight, 8),
        trayMaterial,
      );
      rail.position.set(
        SYSTEM_LANES.electrical.x + offset,
        electricalVerticalCenter,
        SYSTEM_LANES.electrical.z,
      );
      electrical.add(rail);
    });

    const rungSpacing = isMobile ? 1 : 0.62;
    const rungCount = Math.floor((shaftHeight - 3.2) / rungSpacing);
    const rungGeometry = new THREE.BoxGeometry(0.7, 0.035, 0.055);
    const rungs = new THREE.InstancedMesh(rungGeometry, trayMaterial, rungCount);
    for (let index = 0; index < rungCount; index += 1) {
      instanceMatrix.makeTranslation(
        SYSTEM_LANES.electrical.x,
        lerp(
          electricalVerticalBottom + 0.12,
          electricalVerticalTop - 0.12,
          index / Math.max(1, rungCount - 1),
        ),
        SYSTEM_LANES.electrical.z,
      );
      rungs.setMatrixAt(index, instanceMatrix);
    }
    rungs.instanceMatrix.needsUpdate = true;
    electrical.add(rungs);

    [-0.18, 0, 0.18].forEach((offset, index) => {
      const cable = new THREE.Mesh(
        new THREE.CylinderGeometry(0.027, 0.027, electricalVerticalHeight - 0.08, 7),
        cableMaterials[index],
      );
      cable.position.set(
        SYSTEM_LANES.electrical.x + offset,
        electricalVerticalCenter,
        SYSTEM_LANES.electrical.z + 0.08,
      );
      electrical.add(cable);
    });

    const electricalBranchStart = SYSTEM_LANES.electrical.x;
    const electricalBranchEnd = SHAFT_LIMITS.halfWidth - 0.08;
    [-0.29, 0.29].forEach((zOffset) => {
      const branchRail = createCylinderBetween(
        new THREE.Vector3(
          electricalBranchStart,
          -3.8,
          SYSTEM_LANES.electrical.z + zOffset,
        ),
        new THREE.Vector3(
          electricalBranchEnd,
          -3.8,
          SYSTEM_LANES.electrical.z + zOffset,
        ),
        0.04,
        trayMaterial,
        8,
      );
      electrical.add(branchRail);
    });

    const electricalBranchRungGeometry = new THREE.BoxGeometry(0.035, 0.035, 0.64);
    const electricalBranchRungCount = isMobile ? 4 : 6;
    const electricalBranchRungs = new THREE.InstancedMesh(
      electricalBranchRungGeometry,
      trayMaterial,
      electricalBranchRungCount,
    );
    for (let index = 0; index < electricalBranchRungCount; index += 1) {
      instanceMatrix.makeTranslation(
        lerp(
          electricalBranchStart + 0.08,
          electricalBranchEnd - 0.08,
          index / Math.max(1, electricalBranchRungCount - 1),
        ),
        -3.8,
        SYSTEM_LANES.electrical.z,
      );
      electricalBranchRungs.setMatrixAt(index, instanceMatrix);
    }
    electricalBranchRungs.instanceMatrix.needsUpdate = true;
    electrical.add(electricalBranchRungs);

    [-0.18, 0, 0.18].forEach((verticalOffset, index) => {
      const zOffset = (index - 1) * 0.15;
      const start = new THREE.Vector3(
        SYSTEM_LANES.electrical.x + verticalOffset,
        -4.12,
        SYSTEM_LANES.electrical.z + 0.08,
      );
      const bendEnd = new THREE.Vector3(
        SYSTEM_LANES.electrical.x + 0.28,
        -3.74,
        SYSTEM_LANES.electrical.z + zOffset,
      );
      const cableRoute = new THREE.CurvePath<THREE.Vector3>();
      cableRoute.add(
        new THREE.QuadraticBezierCurve3(
          start,
          new THREE.Vector3(
            SYSTEM_LANES.electrical.x + verticalOffset,
            -3.74,
            SYSTEM_LANES.electrical.z + 0.08,
          ),
          bendEnd,
        ),
      );
      cableRoute.add(
        new THREE.LineCurve3(
          bendEnd,
          new THREE.Vector3(
            electricalBranchEnd,
            -3.74,
            SYSTEM_LANES.electrical.z + zOffset,
          ),
        ),
      );
      electrical.add(createTube(cableRoute, 0.027, cableMaterials[index], 7, 48));
    });

    const electricalPenetrationPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.48, 0.76),
      trayMaterial,
    );
    electricalPenetrationPlate.position.set(
      electricalBranchEnd,
      -3.74,
      SYSTEM_LANES.electrical.z,
    );
    electrical.add(electricalPenetrationPlate);
    [-0.15, 0, 0.15].forEach((zOffset, index) => {
      const gland = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.16, 10),
        cableMaterials[index],
      );
      gland.position.set(
        electricalBranchEnd - 0.08,
        -3.74,
        SYSTEM_LANES.electrical.z + zOffset,
      );
      gland.rotation.z = Math.PI / 2;
      electrical.add(gland);
    });

    // Plumbing — three straight, colour-coded services in the front-right lane.
    const plumbing = addSystem("plumbing");
    const plumbingPipeColors = [
      SHAFT_SYSTEM_COLORS.plumbing.primary,
      SHAFT_SYSTEM_COLORS.plumbing.light,
      SHAFT_SYSTEM_COLORS.plumbing.dark,
    ];
    const plumbingMaterials = plumbingPipeColors.map((color, index) =>
      registerSystemMaterial(
        "plumbing",
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.62,
          roughness: 0.25 + index * 0.03,
        }),
        0.96 - index * 0.05,
      ),
    );
    const plumbingCoupler = registerSystemMaterial(
      "plumbing",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.plumbing.accent,
        metalness: 0.78,
        roughness: 0.26,
      }),
      0.9,
    );
    // Keep the largest service on the outside of the bundle so its take-off can
    // reach the wall without cutting through either neighbouring riser.
    const plumbingXs = [1.3, 1.04, 0.78] as const;
    const plumbingRadii = [0.115, 0.09, 0.072] as const;
    plumbingXs.forEach((x, index) => {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(
          plumbingRadii[index],
          plumbingRadii[index],
          shaftHeight - 1.8,
          12,
        ),
        plumbingMaterials[index],
      );
      pipe.position.set(x, shaftCenterY - 0.15, SYSTEM_LANES.plumbing.z);
      plumbing.add(pipe);
      SHAFT_FLOOR_LEVELS.slice(0, -1).forEach((level) => {
        const coupler = new THREE.Mesh(
          new THREE.CylinderGeometry(
            plumbingRadii[index] * 1.35,
            plumbingRadii[index] * 1.35,
            0.18,
            12,
          ),
          plumbingCoupler,
        );
        coupler.position.set(
          x,
          level + 0.52 + index * 0.08,
          SYSTEM_LANES.plumbing.z,
        );
        plumbing.add(coupler);
      });
    });
    const plumbingBranchEnd = SHAFT_LIMITS.halfWidth - 0.1;
    const plumbingTeeCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.34, 14),
      plumbingCoupler,
    );
    plumbingTeeCollar.position.set(plumbingXs[0], 2, SYSTEM_LANES.plumbing.z);
    plumbing.add(plumbingTeeCollar);
    const plumbingBranch = createCylinderBetween(
      new THREE.Vector3(plumbingXs[0], 2, SYSTEM_LANES.plumbing.z),
      new THREE.Vector3(plumbingBranchEnd, 2, SYSTEM_LANES.plumbing.z),
      0.105,
      plumbingMaterials[0],
    );
    plumbing.add(plumbingBranch);
    const plumbingBranchUnion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.16, 14),
      plumbingCoupler,
    );
    plumbingBranchUnion.position.set(1.5, 2, SYSTEM_LANES.plumbing.z);
    plumbingBranchUnion.rotation.z = Math.PI / 2;
    plumbing.add(plumbingBranchUnion);
    const plumbingValveBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.155, 12, 10),
      plumbingCoupler,
    );
    plumbingValveBody.position.set(1.78, 2, SYSTEM_LANES.plumbing.z);
    plumbingValveBody.scale.set(1, 0.82, 0.82);
    plumbing.add(plumbingValveBody);
    const plumbingValveStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.26, 9),
      plumbingCoupler,
    );
    plumbingValveStem.position.set(1.78, 2.23, SYSTEM_LANES.plumbing.z);
    plumbing.add(plumbingValveStem);
    const plumbingValve = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.022, 8, 22),
      plumbingCoupler,
    );
    plumbingValve.position.set(1.78, 2.36, SYSTEM_LANES.plumbing.z);
    plumbingValve.rotation.x = Math.PI / 2;
    plumbing.add(plumbingValve);

    const plumbingWallSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.24, 16),
      plumbingCoupler,
    );
    plumbingWallSleeve.position.set(plumbingBranchEnd, 2, SYSTEM_LANES.plumbing.z);
    plumbingWallSleeve.rotation.z = Math.PI / 2;
    plumbing.add(plumbingWallSleeve);

    // Fire protection — centre-left riser; its branch passes behind plumbing.
    const fire = addSystem("fire");
    const firePipeMaterial = registerSystemMaterial(
      "fire",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.fire.primary,
        metalness: 0.58,
        roughness: 0.3,
      }),
      0.98,
    );
    const fireFlangeMaterial = registerSystemMaterial(
      "fire",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.fire.dark,
        metalness: 0.72,
        roughness: 0.26,
      }),
      0.96,
    );
    const fireMain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.205, 0.205, shaftHeight - 1.2, 14),
      firePipeMaterial,
    );
    fireMain.position.set(SYSTEM_LANES.fire.x, shaftCenterY - 0.15, SYSTEM_LANES.fire.z);
    fire.add(fireMain);

    [-10.2, -4.7, 0.3, 4.4, 9.3].forEach((level) => {
      [-0.09, 0.09].forEach((offset) => {
        const flange = new THREE.Mesh(
          new THREE.CylinderGeometry(0.34, 0.34, 0.075, 18),
          fireFlangeMaterial,
        );
        flange.position.set(SYSTEM_LANES.fire.x, level + offset, SYSTEM_LANES.fire.z);
        fire.add(flange);
      });
    });
    const fireTeeCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.285, 0.285, 0.34, 16),
      fireFlangeMaterial,
    );
    fireTeeCollar.position.set(SYSTEM_LANES.fire.x, 8.4, SYSTEM_LANES.fire.z);
    fire.add(fireTeeCollar);

    const fireDropX = 0.42;
    const fireElbowRadius = 0.14;
    const fireBranchY = 8.4;
    const fireElbowCenterX = fireDropX - fireElbowRadius;
    const fireElbowCenterY = fireBranchY - fireElbowRadius;
    const fireBranch = createCylinderBetween(
      new THREE.Vector3(SYSTEM_LANES.fire.x, fireBranchY, SYSTEM_LANES.fire.z),
      new THREE.Vector3(fireElbowCenterX, fireBranchY, SYSTEM_LANES.fire.z),
      0.11,
      firePipeMaterial,
      14,
    );
    fire.add(fireBranch);
    const branchFlange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.245, 0.16, 16),
      fireFlangeMaterial,
    );
    branchFlange.position.set(-0.14, 8.4, SYSTEM_LANES.fire.z);
    branchFlange.rotation.z = Math.PI / 2;
    fire.add(branchFlange);

    const fireElbow = new THREE.Mesh(
      new THREE.TorusGeometry(fireElbowRadius, 0.11, 10, 22, Math.PI / 2),
      firePipeMaterial,
    );
    fireElbow.position.set(
      fireElbowCenterX,
      fireElbowCenterY,
      SYSTEM_LANES.fire.z,
    );
    fire.add(fireElbow);

    const fireReducer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.055, 0.18, 12),
      firePipeMaterial,
    );
    fireReducer.position.set(fireDropX, 8.17, SYSTEM_LANES.fire.z);
    fire.add(fireReducer);

    const sprinklerDrop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.7, 9),
      firePipeMaterial,
    );
    sprinklerDrop.position.set(fireDropX, 7.73, SYSTEM_LANES.fire.z);
    fire.add(sprinklerDrop);
    const sprinklerUnion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.082, 0.1, 10),
      fireFlangeMaterial,
    );
    sprinklerUnion.position.set(fireDropX, 7.38, SYSTEM_LANES.fire.z);
    fire.add(sprinklerUnion);
    const sprinklerHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.08, 0.12, 12),
      fireFlangeMaterial,
    );
    sprinklerHead.position.set(fireDropX, 7.28, SYSTEM_LANES.fire.z);
    fire.add(sprinklerHead);
    const sprinklerDeflector = new THREE.Mesh(
      new THREE.CylinderGeometry(0.17, 0.17, 0.025, 14),
      fireFlangeMaterial,
    );
    sprinklerDeflector.position.set(fireDropX, 7.2, SYSTEM_LANES.fire.z);
    fire.add(sprinklerDeflector);

    // BMS — wall-mounted controller with orthogonal, back-wall containment.
    const bms = addSystem("bms");
    const cabinetMaterial = registerSystemMaterial(
      "bms",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.bms.primary,
        metalness: 0.56,
        roughness: 0.38,
      }),
      0.96,
    );
    const cabinetFaceMaterial = registerSystemMaterial(
      "bms",
      new THREE.MeshStandardMaterial({
        color: SHAFT_SYSTEM_COLORS.bms.dark,
        metalness: 0.34,
        roughness: 0.44,
      }),
      0.98,
    );
    const networkMaterial = registerSystemMaterial(
      "bms",
      new THREE.MeshBasicMaterial({ color: SHAFT_SYSTEM_COLORS.bms.accent }),
      0.9,
    );
    const cabinetEdgeMaterial = registerSystemMaterial(
      "bms",
      new THREE.LineBasicMaterial({ color: SHAFT_SYSTEM_COLORS.bms.dark }),
      0.88,
    );
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.72, 0.48), cabinetMaterial);
    cabinet.position.set(SYSTEM_LANES.bms.x, 12.35, -2.7);
    bms.add(cabinet);
    addBoxEdges(bms, cabinet, cabinetEdgeMaterial);
    const cabinetDoor = new THREE.Mesh(
      new THREE.BoxGeometry(0.96, 1.45, 0.035),
      cabinetFaceMaterial,
    );
    cabinetDoor.position.set(SYSTEM_LANES.bms.x, 12.35, -2.445);
    bms.add(cabinetDoor);
    const cabinetScreen = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.24, 0.025),
      networkMaterial,
    );
    cabinetScreen.position.set(SYSTEM_LANES.bms.x, 12.64, -2.415);
    bms.add(cabinetScreen);
    [-0.18, 0, 0.18].forEach((offset) => {
      const indicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 8, 8),
        networkMaterial,
      );
      indicator.position.set(SYSTEM_LANES.bms.x + offset, 12.17, -2.405);
      bms.add(indicator);
    });

    const bmsNetworkRoutes: readonly (readonly ShaftVec3[])[] = [
      shaftTracerRoutes.bms.points,
      [
        [1.78, 11.48, -2.7],
        [1.78, 11.3, -2.7],
        [-1.72, 11.3, -2.7],
      ],
      [
        [2.3, 11.48, -2.7],
        [2.3, 10.65, -2.7],
        [2.04, 10.65, -2.7],
      ],
      [
        [2.28, 13.22, -2.7],
        [2.28, 14.55, -2.7],
        [0.6, 14.55, -2.7],
      ],
    ];
    const bmsGlands: readonly ShaftVec3[] = [
      [2.04, 13.22, -2.7],
      [1.78, 11.48, -2.7],
      [2.3, 11.48, -2.7],
      [2.28, 13.22, -2.7],
    ];
    bmsGlands.forEach(([x, y, z]) => {
      const gland = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.14, 10),
        cabinetFaceMaterial,
      );
      gland.position.set(x, y, z);
      bms.add(gland);
    });

    bmsNetworkRoutes.forEach((points) => {
      const curve = createPolylineCurve(points);
      bms.add(
        createTube(
          curve,
          isMobile ? 0.018 : 0.014,
          networkMaterial,
          5,
          isMobile ? 42 : 72,
        ),
      );
      points.slice(1, -1).forEach(([x, y, z]) => {
        const junction = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 8, 8),
          networkMaterial,
        );
        junction.position.set(x, y, z);
        bms.add(junction);
      });
      const endpoint = points[points.length - 1];
      const terminal = new THREE.Mesh(
        new THREE.BoxGeometry(0.19, 0.19, 0.075),
        cabinetMaterial,
      );
      terminal.position.set(endpoint[0], endpoint[1], endpoint[2] + 0.025);
      bms.add(terminal);
      addBoxEdges(bms, terminal, cabinetEdgeMaterial);
    });

    // One projected tracer follows the currently active, recognizable system.
    SHAFT_SYSTEM_ORDER.forEach((id) => {
      const curve = createPolylineCurve(shaftTracerRoutes[id].points);
      const marker = new THREE.Group();
      marker.name = `${id}-shaft-tracer`;
      marker.visible = false;
      const radius = SYSTEM_MARKER_RADIUS[id];
      const coreMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.NormalBlending,
        color: SHAFT_SYSTEM_COLORS[id].primary,
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        transparent: true,
      });
      const haloMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: SHAFT_SYSTEM_COLORS[id].glow,
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        transparent: true,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), coreMaterial);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 2.1, 12, 12), haloMaterial);
      core.renderOrder = 40;
      halo.renderOrder = 39;
      marker.add(core, halo);
      systemGroups.get(id)?.add(marker);
      tracers.set(id, { coreMaterial, curve, group: marker, haloMaterial });
    });

    const ambient = new THREE.AmbientLight(LIGHT, 1.2);
    const key = new THREE.DirectionalLight(LIGHT, 2.65);
    key.position.set(-8, 22, 16);
    const fill = new THREE.DirectionalLight("#D7D9D8", 1.15);
    fill.position.set(14, 4, -12);
    const tracerLight = new THREE.PointLight(LIGHT, 0, 7, 2);
    scene.add(ambient, key, fill, tracerLight);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const cameraTarget = new THREE.Vector3();
    const markerWorldPosition = new THREE.Vector3();
    const markerScreenPosition = new THREE.Vector3();
    let currentProgress = reducedMotion ? 1 : progressRef.current ?? 0;
    let animationFrame = 0;
    let pageVisible = !document.hidden;
    let inViewport = true;
    let lastFrameTime = performance.now();
    let ready = false;
    let requestRender = () => {};

    const onPointerMove = (event: PointerEvent) => {
      if (isMobile || reducedMotion) return;
      pointerTarget.set(
        event.clientX / Math.max(1, window.innerWidth) - 0.5,
        event.clientY / Math.max(1, window.innerHeight) - 0.5,
      );
      requestRender();
    };

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(1, height);
      camera.fov = isMobile ? 59 : isCompact ? 54 : 51;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.12 : 1.55));
      renderer.setSize(width, height, false);
      requestRender();
    };

    const applyCamera = (progress: number) => {
      const insideProgress = smoothstep(0.015, 0.82, Math.min(progress, 0.82));
      const interiorY = lerp(-15.4, 12.6, insideProgress);
      const focusX = cameraFocusX(progress);

      const interiorPosition = new THREE.Vector3(
        Math.sin(insideProgress * Math.PI * 4.4) * 0.18,
        interiorY,
        isMobile ? 3.15 : 2.85,
      );
      const interiorTarget = new THREE.Vector3(
        focusX * (isMobile ? 1 : 0.5),
        interiorY + (isMobile ? 1.65 : 1.85),
        -1.25,
      );
      const clearPosition = new THREE.Vector3(0.12, 19.4, isMobile ? 5.3 : 4.9);
      const clearTarget = new THREE.Vector3(0, 22, -0.35);

      if (progress <= 0.82) {
        camera.position.copy(interiorPosition);
        cameraTarget.copy(interiorTarget);
      } else {
        const exit = smoothstep(0.82, 0.95, progress);
        camera.position.copy(interiorPosition).lerp(clearPosition, exit);
        cameraTarget.copy(interiorTarget).lerp(clearTarget, exit);
      }

      const exitPointer = 1 - smoothstep(0.86, 0.94, progress);
      camera.position.x += pointer.x * lerp(0.06, 0.18, exitPointer);
      camera.position.y -= pointer.y * lerp(0.04, 0.16, exitPointer);
      cameraTarget.x += pointer.x * 0.08 * exitPointer;
      cameraTarget.y -= pointer.y * 0.05 * exitPointer;
      const interiorFov = isMobile ? 59 : isCompact ? 54 : 51;
      const exitFov = isMobile ? 50 : isCompact ? 47 : 45;
      const nextFov = lerp(interiorFov, exitFov, smoothstep(0.84, 0.94, progress));
      if (Math.abs(camera.fov - nextFov) > 0.01) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(cameraTarget);
    };

    const applyProgress = (progress: number, pointerDamping: number) => {
      pointer.lerp(pointerTarget, pointerDamping);
      const shaftFade = 1 - smoothstep(0.885, 0.955, progress);
      const roofOpen = smoothstep(0.755, 0.875, progress);

      roofLouvers.forEach((louver, index) => {
        louver.rotation.x = roofOpen * (Math.PI * 0.41);
        louver.position.y = 0.04 + Math.sin((index / 6) * Math.PI) * roofOpen * 0.08;
      });

      shaftMaterials.forEach(({ baseOpacity, material }) => {
        material.opacity = baseOpacity * shaftFade;
        material.depthWrite = false;
      });

      systemMaterials.forEach((records, id) => {
        const emphasis = reducedMotion ? 0 : systemEmphasis(id, progress) * shaftFade;
        records.forEach(({ baseOpacity, material }) => {
          material.opacity = baseOpacity * emphasis;
          material.depthWrite = false;
        });
      });

      applyCamera(progress);

      let activeTracer: TracerRecord | undefined;
      let activeSystem: ShaftSystemId | undefined;
      tracers.forEach((tracer, id) => {
        const [start, end] = shaftSystemWaves[id];
        const local = clamp01((progress - start) / (end - start));
        const active =
          !reducedMotion && progress >= start && progress < end && local > 0.015 && local < 0.99;
        tracer.group.visible = active;
        tracer.coreMaterial.opacity = active ? 0.96 : 0;
        tracer.haloMaterial.opacity = active ? 0.1 + Math.sin(local * Math.PI) * 0.12 : 0;
        if (active) {
          tracer.group.position.copy(tracer.curve.getPointAt(smoothstep(0, 1, local)));
          tracer.group.scale.setScalar(0.92 + Math.sin(local * Math.PI) * 0.25);
          activeTracer = tracer;
          activeSystem = id;
        }
      });

      if (activeTracer) {
        activeTracer.group.getWorldPosition(markerWorldPosition);
        tracerLight.position.copy(markerWorldPosition);
        if (activeSystem) tracerLight.color.set(SHAFT_SYSTEM_COLORS[activeSystem].glow);
        tracerLight.intensity = isMobile ? 2.4 : 4.2;
        if (waveLabel) {
          camera.updateMatrixWorld();
          markerScreenPosition.copy(markerWorldPosition).project(camera);
          const rawX = (markerScreenPosition.x * 0.5 + 0.5) * canvas.clientWidth;
          const rawY = (-markerScreenPosition.y * 0.5 + 0.5) * canvas.clientHeight;
          const x = Math.min(canvas.clientWidth - 18, Math.max(18, rawX));
          const y = Math.min(canvas.clientHeight - 48, Math.max(38, rawY));
          const markerInView =
            markerScreenPosition.z >= -1 &&
            markerScreenPosition.z <= 1 &&
            Math.abs(markerScreenPosition.x) <= 1.1 &&
            Math.abs(markerScreenPosition.y) <= 1.1;
          waveLabel.style.setProperty("--shaft-label-x", `${x}px`);
          waveLabel.style.setProperty("--shaft-label-y", `${y}px`);
          waveLabel.dataset.align = rawX > canvas.clientWidth * (isMobile ? 0.54 : 0.7) ? "left" : "right";
          waveLabel.dataset.visible = markerInView ? "true" : "false";
        }
      } else {
        tracerLight.intensity = 0;
        if (waveLabel) waveLabel.dataset.visible = "false";
      }

      if (!activeSystem && waveLabel) waveLabel.dataset.visible = "false";
    };

    const render = (time: number) => {
      animationFrame = 0;
      if (!pageVisible || !inViewport || contextFailed) return;

      const deltaSeconds = Math.min(0.08, Math.max(0.001, (time - lastFrameTime) / 1000));
      lastFrameTime = time;
      const targetProgress = reducedMotion ? 1 : progressRef.current ?? 0;
      const progressDamping = 1 - Math.exp(-8.8 * deltaSeconds);
      const pointerDamping = 1 - Math.exp(-3.6 * deltaSeconds);
      currentProgress += (targetProgress - currentProgress) * progressDamping;
      applyProgress(currentProgress, pointerDamping);
      narrativeFrameRef.current?.(currentProgress);
      soundFrameRef.current?.({ deltaSeconds, progress: currentProgress });
      renderer.render(scene, camera);

      if (!ready) {
        canvas.dataset.ready = "true";
        ready = true;
      }

      const progressSettled = Math.abs(targetProgress - currentProgress) < 0.00005;
      const pointerSettled = pointer.distanceToSquared(pointerTarget) < 0.0000005;
      if (!reducedMotion && !contextFailed && (!progressSettled || !pointerSettled)) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    const startRender = () => {
      if (reducedMotion || contextFailed || !pageVisible || !inViewport || animationFrame !== 0) {
        return;
      }
      lastFrameTime = performance.now();
      animationFrame = window.requestAnimationFrame(render);
    };
    requestRender = startRender;

    const onVisibilityChange = () => {
      pageVisible = !document.hidden;
      if (!pageVisible) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else {
        startRender();
      }
    };

    const viewportObserver = new IntersectionObserver(
      ([entry]) => {
        inViewport = entry?.isIntersecting ?? true;
        if (!inViewport) {
          window.cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        } else {
          startRender();
        }
      },
      { rootMargin: "8% 0px", threshold: 0.01 },
    );

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextFailed = true;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      canvas.dataset.failed = "true";
      if (waveLabel) waveLabel.dataset.visible = "false";
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", startRender, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    viewportObserver.observe(canvas);

    if (reducedMotion) {
      applyProgress(1, 1);
      narrativeFrameRef.current?.(1);
      renderer.render(scene, camera);
      canvas.dataset.ready = "true";
      ready = true;
    } else {
      startRender();
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", startRender);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      viewportObserver.disconnect();
      if (waveLabel) waveLabel.dataset.visible = "false";

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Line ||
          object instanceof THREE.LineSegments ||
          object instanceof THREE.InstancedMesh
        ) {
          geometries.add(object.geometry);
          const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    };
  }, [
    compactTier,
    mobileTier,
    narrativeFrameRef,
    progressRef,
    reducedMotion,
    soundFrameRef,
    waveLabelRef,
  ]);

  return (
    <canvas
      aria-hidden="true"
      className="shaft-canvas"
      ref={canvasRef}
      role="presentation"
    />
  );
}
