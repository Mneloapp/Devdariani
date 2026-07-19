"use client";

import type { RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { WeaveSoundFrame } from "./spatial-sound";
import {
  bmsRoutes,
  electricalRoutes,
  fireRoutes,
  hvacRoutes,
  plumbingRoutes,
  systemWaves as SYSTEM_WAVES,
  systemMeta,
  type SystemId,
  type Vec3,
} from "@/app/lib/weave-data";

type WeaveCanvasProps = {
  narrativeFrameRef: RefObject<((progress: number) => void) | null>;
  progressRef: RefObject<number>;
  reducedMotion: boolean;
  soundFrameRef: RefObject<((frame: WeaveSoundFrame) => void) | null>;
  waveLabelRef: RefObject<HTMLDivElement | null>;
};

type MaterialRecord = {
  baseOpacity: number;
  material: THREE.Material & { opacity: number };
};

type WaveMarkerRecord = {
  coreMaterial: THREE.MeshBasicMaterial;
  group: THREE.Group;
  haloMaterial: THREE.MeshBasicMaterial;
};

type RevealGeometryRecord = {
  atomic: boolean;
  atomicObject?: THREE.Object3D;
  end: number;
  geometry: THREE.BufferGeometry;
  maxCount: number;
  start: number;
  step: number;
};

const PAPER = "#F4F3EF";
const IVORY = "#111214";
const STEEL = "#55585B";
const CHAMPAGNE = "#33363A";
const LIGHT = "#FFFFFF";

const SYSTEM_ORDER: readonly SystemId[] = [
  "hvac",
  "electrical",
  "plumbing",
  "fire",
  "bms",
];

const SYSTEM_WAVE_LIFT: Record<SystemId, number> = {
  hvac: 0.48,
  electrical: -0.34,
  plumbing: 0.42,
  fire: -0.36,
  bms: 0.28,
};

const SYSTEM_CAMERA_SHIFT: Record<SystemId, Vec3> = {
  hvac: [0.48, 0.58, -0.38],
  electrical: [-0.25, 0.16, 0.42],
  plumbing: [0.34, 0.42, -0.5],
  fire: [0.32, 0.18, -0.42],
  bms: [0.38, -0.2, 0.58],
};

const MOBILE_SYSTEM_OFFSET: Record<SystemId, Vec3> = {
  hvac: [0, 0, 0],
  electrical: [0, 0, 0],
  plumbing: [-4.2, -0.1, 1.1],
  fire: [-4.4, 0, 1.2],
  bms: [0, 0, 0],
};

const COMPACT_SYSTEM_OFFSET: Record<SystemId, Vec3> = {
  hvac: [0, 0, 0],
  electrical: [0, 0, 0],
  plumbing: [-3.3, -0.07, 0.9],
  fire: [-3.6, 0, 1],
  bms: [0, 0, 0],
};

const SYSTEM_MARKER_RADIUS: Record<SystemId, number> = {
  hvac: 0.15,
  electrical: 0.095,
  plumbing: 0.15,
  fire: 0.18,
  bms: 0.075,
};

const SYSTEM_MARKER_END: Record<SystemId, number> = {
  hvac: 0.995,
  electrical: 0.995,
  plumbing: 0.94,
  fire: 0.94,
  bms: 0.995,
};

const SYSTEM_FOCUS_DROP: Record<SystemId, number> = {
  hvac: 0.42,
  electrical: 0.46,
  plumbing: 0.62,
  fire: 0.66,
  bms: 0.48,
};

const SYSTEM_ENTRY_BOOST: Record<SystemId, number> = {
  hvac: 0.38,
  electrical: 0.4,
  plumbing: 0.52,
  fire: 0.56,
  bms: 0.42,
};

const SYSTEM_LIGHT_SCALE: Record<SystemId, number> = {
  hvac: 1,
  electrical: 1,
  plumbing: 1.25,
  fire: 1.35,
  bms: 1,
};

function vector(value: Vec3) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(from: number, to: number, value: number) {
  const normalized = clamp01((value - from) / (to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function rangeProgress(range: readonly [number, number], value: number) {
  return clamp01((value - range[0]) / (range[1] - range[0]));
}

function easeOutBack(value: number) {
  const strength = 0.65;
  const shifted = value - 1;
  return 1 + (strength + 1) * shifted ** 3 + strength * shifted ** 2;
}

function createCurve(points: readonly Vec3[]) {
  const curve = new THREE.CatmullRomCurve3(points.map(vector), false, "centripetal", 0.22);
  curve.arcLengthDivisions = 180;
  return curve;
}

function createRoutedCurve(points: readonly Vec3[], elbowRadius = 0.28) {
  const vertices = points.map(vector);
  const path = new THREE.CurvePath<THREE.Vector3>();
  if (vertices.length < 2) return path;

  let cursor = vertices[0].clone();
  for (let index = 1; index < vertices.length - 1; index += 1) {
    const previous = vertices[index - 1];
    const corner = vertices[index];
    const next = vertices[index + 1];
    const incoming = corner.clone().sub(previous);
    const outgoing = next.clone().sub(corner);
    const incomingLength = incoming.length();
    const outgoingLength = outgoing.length();
    if (incomingLength < 0.001 || outgoingLength < 0.001) continue;

    const incomingDirection = incoming.normalize();
    const outgoingDirection = outgoing.normalize();
    const straight = Math.abs(incomingDirection.dot(outgoingDirection)) > 0.999;
    if (straight) {
      path.add(new THREE.LineCurve3(cursor.clone(), corner.clone()));
      cursor = corner.clone();
      continue;
    }

    const trim = Math.min(elbowRadius, incomingLength * 0.34, outgoingLength * 0.34);
    const entry = corner.clone().addScaledVector(incomingDirection, -trim);
    const exit = corner.clone().addScaledVector(outgoingDirection, trim);
    if (cursor.distanceToSquared(entry) > 0.000001) {
      path.add(new THREE.LineCurve3(cursor.clone(), entry));
    }
    const handle = trim * 0.5522848;
    path.add(
      new THREE.CubicBezierCurve3(
        entry,
        entry.clone().addScaledVector(incomingDirection, handle),
        exit.clone().addScaledVector(outgoingDirection, -handle),
        exit,
      ),
    );
    cursor = exit;
  }

  const finalPoint = vertices[vertices.length - 1];
  if (cursor.distanceToSquared(finalPoint) > 0.000001) {
    path.add(new THREE.LineCurve3(cursor, finalPoint.clone()));
  }
  path.arcLengthDivisions = 240;
  path.updateArcLengths();
  return path;
}

function createTube(
  curve: THREE.Curve<THREE.Vector3>,
  radius: number,
  material: THREE.Material,
  radialSegments = 10,
  tubularSegments = 96,
) {
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  return new THREE.Mesh(geometry, material);
}

function createOffsetCurve(
  curve: THREE.Curve<THREE.Vector3>,
  lateralOffset: number,
  verticalOffset = 0,
  sampleCount = 56,
) {
  const up = new THREE.Vector3(0, 1, 0);
  const lastSide = new THREE.Vector3(0, 0, 1);
  const points = Array.from({ length: sampleCount + 1 }, (_, index) => {
    const at = index / sampleCount;
    const point = curve.getPointAt(at);
    const tangent = curve.getTangentAt(at).normalize();
    const side = up.clone().cross(tangent);
    if (side.lengthSq() < 0.0001) {
      side.copy(lastSide);
    } else {
      side.normalize();
      if (side.dot(lastSide) < 0) side.negate();
      lastSide.copy(side);
    }
    return point.addScaledVector(side, lateralOffset).addScaledVector(up, verticalOffset);
  });
  const offsetCurve = new THREE.CatmullRomCurve3(points, false, "centripetal", 0.18);
  offsetCurve.arcLengthDivisions = 180;
  return offsetCurve;
}

function createBoxBetween(
  fromValue: Vec3 | THREE.Vector3,
  toValue: Vec3 | THREE.Vector3,
  height: number,
  depth: number,
  material: THREE.Material,
) {
  const from = fromValue instanceof THREE.Vector3 ? fromValue : vector(fromValue);
  const to = toValue instanceof THREE.Vector3 ? toValue : vector(toValue);
  const direction = to.clone().sub(from);
  const geometry = new THREE.BoxGeometry(direction.length(), height, depth);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), direction.normalize());
  return mesh;
}

function addCoupler(
  group: THREE.Group,
  curve: THREE.Curve<THREE.Vector3>,
  at: number,
  radius: number,
  material: THREE.Material,
) {
  const point = curve.getPointAt(at);
  const tangent = curve.getTangentAt(at).normalize();
  const geometry = new THREE.CylinderGeometry(radius * 1.38, radius * 1.38, radius * 1.65, 12);
  const coupler = new THREE.Mesh(geometry, material);
  coupler.position.copy(point);
  coupler.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
  group.add(coupler);
  return coupler;
}

function createFlangeAssembly(
  curve: THREE.Curve<THREE.Vector3>,
  at: number,
  pipeRadius: number,
  flangeMaterial: THREE.Material,
  boltMaterial: THREE.Material,
  includeBolts: boolean,
) {
  const assembly = new THREE.Group();
  const tangent = curve.getTangentAt(at).normalize();
  assembly.position.copy(curve.getPointAt(at));
  assembly.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);

  const discRadius = pipeRadius * 1.72;
  const discThickness = pipeRadius * 0.22;
  [-pipeRadius * 0.22, pipeRadius * 0.22].forEach((offset) => {
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(discRadius, discRadius, discThickness, 18),
      flangeMaterial,
    );
    disc.position.y = offset;
    assembly.add(disc);
  });

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(pipeRadius * 1.18, pipeRadius * 1.18, pipeRadius * 0.7, 16),
    flangeMaterial,
  );
  assembly.add(collar);

  if (includeBolts) {
    for (let index = 0; index < 4; index += 1) {
      const angle = (index / 4) * Math.PI * 2 + Math.PI / 4;
      const bolt = new THREE.Mesh(
        new THREE.CylinderGeometry(pipeRadius * 0.12, pipeRadius * 0.12, pipeRadius * 0.62, 8),
        boltMaterial,
      );
      bolt.position.set(
        Math.cos(angle) * pipeRadius * 1.38,
        0,
        Math.sin(angle) * pipeRadius * 1.38,
      );
      assembly.add(bolt);
    }
  }

  return assembly;
}

export function WeaveCanvas({
  narrativeFrameRef,
  progressRef,
  reducedMotion,
  soundFrameRef,
  waveLabelRef,
}: WeaveCanvasProps) {
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
    renderer.toneMappingExposure = 0.98;
    renderer.setClearColor(0xf4f3ef, 0);

    const scene = new THREE.Scene();
    scene.background = null;
    scene.fog = new THREE.FogExp2(PAPER, 0.027);

    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, 0.1, 80);
    const root = new THREE.Group();
    root.position.set(isMobile ? 1.15 : 2.7, isMobile ? -1.7 : -0.3, 0);
    scene.add(root);

    const systemGroups = new Map<SystemId, THREE.Group>();
    const systemMaterials = new Map<SystemId, MaterialRecord[]>();
    const signalMaterials: MaterialRecord[] = [];
    const waveMarkerMaterials: THREE.Material[] = [];
    const waveMarkers = new Map<SystemId, WaveMarkerRecord>();
    const wavePaths = new Map<SystemId, THREE.Curve<THREE.Vector3>>();
    const revealGeometries = new Map<SystemId, RevealGeometryRecord[]>();

    const register = <T extends THREE.Material & { opacity: number }>(
      system: SystemId,
      material: T,
      baseOpacity: number,
    ) => {
      material.transparent = true;
      material.opacity = baseOpacity;
      material.depthWrite = false;
      const records = systemMaterials.get(system) ?? [];
      records.push({ baseOpacity, material });
      systemMaterials.set(system, records);
      return material;
    };

    const addSystem = (id: SystemId) => {
      const group = new THREE.Group();
      group.name = id;
      root.add(group);
      systemGroups.set(id, group);
      return group;
    };

    const hvac = addSystem("hvac");
    const hvacSurface = register(
      "hvac",
      new THREE.MeshPhysicalMaterial({
        color: STEEL,
        metalness: 0.22,
        roughness: 0.32,
        side: THREE.DoubleSide,
      }),
      0.18,
    );
    const hvacEdge = register(
      "hvac",
      new THREE.LineBasicMaterial({ color: IVORY }),
      0.62,
    );

    hvacRoutes.forEach((route, index) => {
      const curve = createCurve(route.points);
      if (index === 0) wavePaths.set("hvac", curve);
      const outlineSegmentCount = isMobile ? 28 : 56;
      const outlineFrames = Array.from({ length: outlineSegmentCount + 1 }, (_, frameIndex) => {
        const at = frameIndex / outlineSegmentCount;
        const tangent = curve.getTangentAt(at).normalize();
        return {
          point: curve.getPointAt(at),
          rotation: new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(1, 0, 0),
            tangent,
          ),
        };
      });
      const cornerOffsets: readonly (readonly [number, number])[] = [
        [-route.section[1] / 2, -route.section[0] / 2],
        [-route.section[1] / 2, route.section[0] / 2],
        [route.section[1] / 2, -route.section[0] / 2],
        [route.section[1] / 2, route.section[0] / 2],
      ];
      cornerOffsets.forEach(([yOffset, zOffset]) => {
        const localCorner = new THREE.Vector3(0, yOffset, zOffset);
        const linePoints = outlineFrames.map(({ point, rotation }) =>
          point.clone().add(localCorner.clone().applyQuaternion(rotation)),
        );
        const outline = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(linePoints),
          hvacEdge,
        );
        outline.userData.revealDuration = 0.58;
        outline.userData.revealStart = index * 0.18;
        hvac.add(outline);
      });
      const segmentCount = isMobile ? 12 : index === 2 ? 14 : 22;
      const points = curve.getSpacedPoints(segmentCount);
      for (let pointIndex = 0; pointIndex < points.length - 1; pointIndex += 1) {
        const segment = createBoxBetween(
          points[pointIndex],
          points[pointIndex + 1],
          route.section[1],
          route.section[0],
          hvacSurface,
        );
        segment.scale.x = 1.035;
        hvac.add(segment);
      }
    });

    const plumbing = addSystem("plumbing");
    const plumbingMaterials = [
      register(
        "plumbing",
        new THREE.MeshStandardMaterial({
          color: "#151617",
          emissive: "#08090A",
          emissiveIntensity: 0.18,
          metalness: 0.9,
          roughness: 0.14,
        }),
        0.97,
      ),
      register(
        "plumbing",
        new THREE.MeshStandardMaterial({
          color: "#303235",
          emissive: "#0A0B0C",
          emissiveIntensity: 0.16,
          metalness: 0.88,
          roughness: 0.17,
        }),
        0.95,
      ),
      register(
        "plumbing",
        new THREE.MeshStandardMaterial({
          color: "#5B5E61",
          emissive: "#111214",
          emissiveIntensity: 0.14,
          metalness: 0.86,
          roughness: 0.2,
        }),
        0.92,
      ),
    ];
    const plumbingCoupler = register(
      "plumbing",
      new THREE.MeshStandardMaterial({
        color: CHAMPAGNE,
        metalness: 0.9,
        roughness: 0.24,
      }),
      0.9,
    );

    plumbingRoutes.forEach((route, routeIndex) => {
      const curve = createRoutedCurve(route.points, isMobile ? 0.2 : 0.3);
      if (routeIndex === 0) wavePaths.set("plumbing", curve);
      const desktopRadii = [0.14, 0.115, 0.09] as const;
      const mobileRadii = [0.115, 0.095, 0.075] as const;
      const pipeStarts = [0.015, 0.075, 0.135] as const;
      const pipeDurations = [0.78, 0.76, 0.74] as const;
      const radius = (isMobile ? mobileRadii : desktopRadii)[routeIndex] ?? 0.09;
      const pipeStart = pipeStarts[routeIndex] ?? 0.135;
      const pipeDuration = pipeDurations[routeIndex] ?? 0.74;
      const pipe = createTube(
        curve,
        radius,
        plumbingMaterials[routeIndex] ?? plumbingMaterials[0],
        12,
        isMobile ? 104 : 128,
      );
      pipe.userData.revealStart = pipeStart;
      pipe.userData.revealDuration = pipeDuration;
      plumbing.add(pipe);

      [0.2, 0.48, 0.9].forEach((at) => {
        const fittingAt = at + routeIndex * 0.012;
        const fitting = addCoupler(
          plumbing,
          curve,
          fittingAt,
          radius * 0.9,
          plumbingCoupler,
        );
        fitting.userData.revealStart = pipeStart + fittingAt * pipeDuration + 0.012;
        fitting.userData.revealDuration = 0.07;
        fitting.userData.atomicReveal = true;
      });
    });

    const fire = addSystem("fire");
    const fireMaterial = register(
      "fire",
      new THREE.MeshStandardMaterial({
        color: "#2D2F31",
        emissive: "#0A0B0C",
        emissiveIntensity: 0.18,
        metalness: 0.76,
        roughness: 0.22,
      }),
      0.96,
    );
    const fireFlange = register(
      "fire",
      new THREE.MeshStandardMaterial({
        color: "#55585B",
        emissive: "#101113",
        emissiveIntensity: 0.12,
        metalness: 0.9,
        roughness: 0.24,
      }),
      0.94,
    );
    const fireBolts = register(
      "fire",
      new THREE.MeshStandardMaterial({
        color: CHAMPAGNE,
        metalness: 0.88,
        roughness: 0.28,
      }),
      0.78,
    );

    fireRoutes.forEach((route, index) => {
      const curve = createRoutedCurve(route.points, isMobile ? 0.22 : 0.34);
      if (index === 0) wavePaths.set("fire", curve);
      const pipeRadius = index === 0 ? 0.205 : 0.145;
      const routeStart = index === 0 ? 0.015 : 0.36;
      const routeDuration = index === 0 ? 0.76 : 0.52;
      const pipe = createTube(curve, pipeRadius, fireMaterial, 12, isMobile ? 104 : 128);
      pipe.userData.revealStart = routeStart;
      pipe.userData.revealDuration = routeDuration;
      fire.add(pipe);

      const flangePoints = index === 0 ? [0.23, 0.49, 0.75] : [0.48];
      flangePoints.forEach((at) => {
        const flange = createFlangeAssembly(
          curve,
          at,
          pipeRadius,
          fireFlange,
          fireBolts,
          !isMobile,
        );
        flange.userData.revealStart = routeStart + 0.025 + at * routeDuration;
        flange.userData.revealDuration = 0.065;
        flange.userData.atomicReveal = true;
        fire.add(flange);
      });
    });

    const electrical = addSystem("electrical");
    const trayMaterial = register(
      "electrical",
      new THREE.MeshStandardMaterial({
        color: STEEL,
        emissive: "#0D0E10",
        emissiveIntensity: 0.16,
        metalness: 0.82,
        roughness: 0.3,
      }),
      0.94,
    );
    const cableMaterials = [
      register(
        "electrical",
        new THREE.MeshStandardMaterial({
          color: "#161719",
          emissive: "#08090A",
          emissiveIntensity: 0.12,
          metalness: 0.34,
          roughness: 0.36,
        }),
        0.98,
      ),
      register(
        "electrical",
        new THREE.MeshStandardMaterial({
          color: "#44474A",
          emissive: "#0D0E10",
          emissiveIntensity: 0.14,
          metalness: 0.28,
          roughness: 0.42,
        }),
        0.94,
      ),
      register(
        "electrical",
        new THREE.MeshStandardMaterial({
          color: "#6B6D70",
          emissive: "#111214",
          emissiveIntensity: 0.12,
          metalness: 0.3,
          roughness: 0.4,
        }),
        0.94,
      ),
    ];

    electricalRoutes.forEach((route, routeIndex) => {
      const centerCurve = createCurve(route.points);
      if (routeIndex === 0) wavePaths.set("electrical", centerCurve);
      const routeBase = routeIndex * 0.1;
      const leftLower = createOffsetCurve(centerCurve, -0.34, 0.01);
      const rightLower = createOffsetCurve(centerCurve, 0.34, 0.01);
      const leftUpper = createOffsetCurve(centerCurve, -0.34, 0.2);
      const rightUpper = createOffsetCurve(centerCurve, 0.34, 0.2);

      [leftLower, rightLower, leftUpper, rightUpper].forEach((railCurve, railIndex) => {
        const rail = createTube(railCurve, railIndex < 2 ? 0.05 : 0.042, trayMaterial, 8);
        rail.userData.revealStart = 0.02 + routeBase + railIndex * 0.012;
        rail.userData.revealDuration = 0.48;
        electrical.add(rail);
      });

      const rungCount = isMobile ? 16 : 31;
      for (let index = 0; index <= rungCount; index += 1) {
        const at = index / rungCount;
        const rung = createBoxBetween(
          leftLower.getPointAt(at),
          rightLower.getPointAt(at),
          0.03,
          0.04,
          trayMaterial,
        );
        rung.userData.revealStart = 0.07 + routeBase + at * 0.43;
        rung.userData.revealDuration = 0.045;
        rung.userData.atomicReveal = true;
        electrical.add(rung);
      }

      const cableOffsets = isMobile ? [-0.18, 0, 0.18] : [-0.22, -0.075, 0.075, 0.22];
      cableOffsets.forEach((offset, cableIndex) => {
        const cableCurve = createOffsetCurve(
          centerCurve,
          offset,
          0.085 + (cableIndex % 2) * 0.025,
        );
        const cable = createTube(
          cableCurve,
          isMobile ? 0.03 : 0.034,
          cableMaterials[cableIndex % cableMaterials.length],
          7,
        );
        cable.userData.revealStart = 0.24 + routeBase + cableIndex * 0.024;
        cable.userData.revealDuration = 0.58;
        electrical.add(cable);
      });
    });

    const bms = addSystem("bms");
    const bmsRoutesForTier = isMobile ? bmsRoutes.filter((_, index) => index % 2 === 0) : bmsRoutes;
    const bmsMaterial = register(
      "bms",
      new THREE.MeshBasicMaterial({ color: CHAMPAGNE }),
      0.58,
    );
    signalMaterials.push({ baseOpacity: 0.58, material: bmsMaterial });

    const signalCurves: THREE.Curve<THREE.Vector3>[] = [];
    bmsRoutesForTier.forEach((route, routeIndex) => {
      const curve = createCurve([...route.points].reverse());
      if (routeIndex === 0) wavePaths.set("bms", curve);
      signalCurves.push(curve);
      const signalRoute = createTube(curve, isMobile ? 0.017 : 0.013, bmsMaterial, 5);
      signalRoute.userData.revealStart = 0.1 + routeIndex * 0.025;
      signalRoute.userData.revealDuration = 0.67;
      bms.add(signalRoute);
      [0.28, 0.64, 0.9].forEach((at) => {
        const node = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), bmsMaterial);
        node.position.copy(curve.getPointAt(at));
        node.userData.revealStart = 0.16 + routeIndex * 0.02 + at * 0.58;
        node.userData.revealDuration = 0.05;
        node.userData.atomicReveal = true;
        bms.add(node);
      });
    });

    const cabinetBodyMaterial = register(
      "bms",
      new THREE.MeshStandardMaterial({
        color: "#3C3F42",
        emissive: "#0D0E10",
        emissiveIntensity: 0.14,
        metalness: 0.78,
        roughness: 0.32,
      }),
      0.96,
    );
    const cabinetPanelMaterial = register(
      "bms",
      new THREE.MeshStandardMaterial({
        color: "#151719",
        emissive: "#08090A",
        emissiveIntensity: 0.12,
        metalness: 0.42,
        roughness: 0.4,
      }),
      0.95,
    );
    const cabinetEdgeMaterial = register(
      "bms",
      new THREE.LineBasicMaterial({ color: IVORY }),
      0.78,
    );
    const cabinetIndicatorMaterial = register(
      "bms",
      new THREE.MeshBasicMaterial({ color: CHAMPAGNE }),
      0.92,
    );
    const cabinetPosition = new THREE.Vector3(8.7, -1.35, 1.65);

    const cabinetShell = new THREE.Group();
    cabinetShell.position.copy(cabinetPosition);
    cabinetShell.userData.revealStart = 0.01;
    cabinetShell.userData.revealDuration = 0.12;
    cabinetShell.userData.atomicReveal = true;
    const cabinetBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 1.15, 0.75),
      cabinetBodyMaterial,
    );
    cabinetShell.add(cabinetBody);
    cabinetShell.add(
      new THREE.LineSegments(
        new THREE.EdgesGeometry(cabinetBody.geometry, 20),
        cabinetEdgeMaterial,
      ),
    );
    bms.add(cabinetShell);

    const cabinetDoor = new THREE.Group();
    cabinetDoor.position.copy(cabinetPosition);
    cabinetDoor.userData.revealStart = 0.07;
    cabinetDoor.userData.revealDuration = 0.1;
    cabinetDoor.userData.atomicReveal = true;
    const doorPanel = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.94, 0.59),
      cabinetPanelMaterial,
    );
    doorPanel.position.x = 0.328;
    cabinetDoor.add(doorPanel);
    const doorOutline = new THREE.LineSegments(
      new THREE.EdgesGeometry(doorPanel.geometry, 20),
      cabinetEdgeMaterial,
    );
    doorOutline.position.copy(doorPanel.position);
    cabinetDoor.add(doorOutline);
    bms.add(cabinetDoor);

    const cabinetControls = new THREE.Group();
    cabinetControls.position.copy(cabinetPosition);
    cabinetControls.userData.revealStart = 0.13;
    cabinetControls.userData.revealDuration = 0.1;
    cabinetControls.userData.atomicReveal = true;
    const display = new THREE.Mesh(
      new THREE.BoxGeometry(0.026, 0.18, 0.28),
      cabinetIndicatorMaterial,
    );
    display.position.set(0.355, 0.2, 0.03);
    cabinetControls.add(display);
    const indicatorCount = isMobile ? 2 : 3;
    for (let index = 0; index < indicatorCount; index += 1) {
      const indicator = new THREE.Mesh(
        new THREE.SphereGeometry(0.027, 8, 8),
        cabinetIndicatorMaterial,
      );
      indicator.position.set(0.365, -0.03 - index * 0.1, -0.12);
      cabinetControls.add(indicator);
    }
    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.2, 0.035),
      cabinetIndicatorMaterial,
    );
    handle.position.set(0.36, -0.12, 0.22);
    cabinetControls.add(handle);
    const glandCount = isMobile ? 3 : 5;
    for (let index = 0; index < glandCount; index += 1) {
      const gland = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8),
        cabinetBodyMaterial,
      );
      gland.position.set(-0.35, -0.3 + index * 0.15, -0.2 + index * 0.1);
      gland.rotation.z = Math.PI / 2;
      cabinetControls.add(gland);
    }
    bms.add(cabinetControls);

    const signalMaterial = register(
      "bms",
      new THREE.MeshBasicMaterial({ color: IVORY }),
      0.8,
    );
    const signalNode = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 10), signalMaterial);
    signalNode.userData.revealStart = 0.14;
    signalNode.userData.revealDuration = 0.05;
    signalNode.userData.atomicReveal = true;
    bms.add(signalNode);

    SYSTEM_ORDER.forEach((id) => {
      const group = systemGroups.get(id);
      if (!group) return;
      const branches = [...group.children];
      const records: RevealGeometryRecord[] = [];
      const initializedAtomicObjects = new Set<THREE.Object3D>();
      const staggerSpan = id === "hvac" ? 0.82 : 0.42;
      const revealDuration = id === "hvac" ? 0.12 : 0.58;
      branches.forEach((branch, branchIndex) => {
        const defaultStart = (branchIndex / Math.max(1, branches.length)) * staggerSpan;
        const start =
          typeof branch.userData.revealStart === "number"
            ? branch.userData.revealStart
            : defaultStart;
        const duration =
          typeof branch.userData.revealDuration === "number"
            ? branch.userData.revealDuration
            : revealDuration;
        const end = Math.min(1, start + duration);
        branch.traverse((object) => {
          if (
            !(object instanceof THREE.Mesh) &&
            !(object instanceof THREE.Line) &&
            !(object instanceof THREE.LineSegments)
          ) {
            return;
          }
          const geometry = object.geometry;
          const maxCount = geometry.index?.count ?? geometry.attributes.position?.count ?? 0;
          if (maxCount <= 0) return;
          const atomic = Boolean(branch.userData.atomicReveal || object.userData.atomicReveal);
          const atomicObject = branch.userData.atomicReveal
            ? branch
            : object.userData.atomicReveal
              ? object
              : undefined;
          if (atomicObject && !initializedAtomicObjects.has(atomicObject)) {
            atomicObject.scale.setScalar(0.001);
            initializedAtomicObjects.add(atomicObject);
          }
          const step =
            id === "hvac" && object instanceof THREE.Mesh
              ? maxCount
              : object instanceof THREE.Mesh
                ? 3
                : object instanceof THREE.LineSegments
                  ? 2
                  : 1;
          geometry.setDrawRange(0, 0);
          records.push({ atomic, atomicObject, end, geometry, maxCount, start, step });
        });
      });
      revealGeometries.set(id, records);
    });

    SYSTEM_ORDER.forEach((id) => {
      const radius = SYSTEM_MARKER_RADIUS[id];
      const marker = new THREE.Group();
      marker.name = `${id}-wave-front`;
      marker.visible = false;

      const coreMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.NormalBlending,
        color: IVORY,
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        transparent: true,
      });
      const haloMaterial = new THREE.MeshBasicMaterial({
        blending: THREE.NormalBlending,
        color: CHAMPAGNE,
        depthTest: false,
        depthWrite: false,
        opacity: 0,
        transparent: true,
      });
      const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 14, 14), coreMaterial);
      const halo = new THREE.Mesh(new THREE.SphereGeometry(radius * 2.8, 14, 14), haloMaterial);
      core.renderOrder = 30;
      halo.renderOrder = 29;
      marker.add(core, halo);
      systemGroups.get(id)?.add(marker);
      waveMarkerMaterials.push(coreMaterial, haloMaterial);
      waveMarkers.set(id, { coreMaterial, group: marker, haloMaterial });
    });

    const ambient = new THREE.AmbientLight(LIGHT, 0.92);
    const key = new THREE.DirectionalLight(LIGHT, 2.35);
    key.position.set(-4, 9, 7);
    const warm = new THREE.PointLight("#E1DED8", 10, 24, 2.1);
    warm.position.set(4, 4, 5);
    const waveLight = new THREE.PointLight(LIGHT, 0, 6, 2);
    scene.add(ambient, key, warm, waveLight);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const cameraTarget = new THREE.Vector3();
    const waveWorldPosition = new THREE.Vector3();
    const waveScreenPosition = new THREE.Vector3();
    const startCameraPosition = new THREE.Vector3(15.4, 11.4, 19.2);
    const finalCameraPosition = new THREE.Vector3(13.2, 9.4, 16.4);
    const neutralCameraShift: Vec3 = [0, 0, 0];
    let currentProgress = reducedMotion ? 1 : progressRef.current ?? 0;
    let animationFrame = 0;
    let pageVisible = !document.hidden;
    let inViewport = true;
    let lastFrameTime = performance.now();
    let ready = false;

    const onPointerMove = (event: PointerEvent) => {
      if (isMobile || reducedMotion) return;
      pointerTarget.set(event.clientX / window.innerWidth - 0.5, event.clientY / window.innerHeight - 0.5);
    };

    const resize = () => {
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      const aspect = width / Math.max(1, height);
      const viewHeight = isMobile ? 15.5 : 10.6;
      camera.left = (-viewHeight * aspect) / 2;
      camera.right = (viewHeight * aspect) / 2;
      camera.top = viewHeight / 2;
      camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.15 : 1.65));
      renderer.setSize(width, height, false);
      if (reducedMotion) {
        applyProgress(1, performance.now(), 1);
        renderer.render(scene, camera);
        if (!ready) {
          canvas.dataset.ready = "true";
          ready = true;
        }
      }
    };

    const applyProgress = (progress: number, time: number, pointerDamping: number) => {
      const commission = smoothstep(...SYSTEM_WAVES.bms, progress);
      const [bmsStart, bmsEnd] = SYSTEM_WAVES.bms;
      const bmsLocal = Math.min(1, Math.max(0, (progress - bmsStart) / (bmsEnd - bmsStart)));
      const activeSystem = reducedMotion
        ? undefined
        : SYSTEM_ORDER.find((id) => {
            const [start, end] = SYSTEM_WAVES[id];
            return progress >= start && progress < end;
          });
      const activeRawProgress = activeSystem
        ? rangeProgress(SYSTEM_WAVES[activeSystem], progress)
        : 0;
      const activePulse = activeSystem ? Math.sin(activeRawProgress * Math.PI) : 0;
      let activeMarker: THREE.Group | undefined;

      systemGroups.forEach((group, id) => {
        const meta = systemMeta[id];
        const position = meta.initialPosition;
        const rotation = meta.initialRotation;
        const presentationOffset = isMobile
          ? MOBILE_SYSTEM_OFFSET[id]
          : isCompact
            ? COMPACT_SYSTEM_OFFSET[id]
            : neutralCameraShift;
        const rawWave = rangeProgress(SYSTEM_WAVES[id], progress);
        const wave = smoothstep(...SYSTEM_WAVES[id], progress);
        const arrival = smoothstep(0, 0.24, rawWave);
        const settle = reducedMotion ? wave : easeOutBack(arrival);
        const positionFactor = 1 - settle;
        const rotationFactor = 1 - settle;
        group.position.set(
          position[0] * positionFactor + presentationOffset[0],
          position[1] * positionFactor +
            Math.sin(rawWave * Math.PI) * SYSTEM_WAVE_LIFT[id] +
            presentationOffset[1],
          position[2] * positionFactor + presentationOffset[2],
        );
        group.rotation.set(
          rotation[0] * rotationFactor,
          rotation[1] * rotationFactor,
          rotation[2] * rotationFactor,
        );
        const scale = reducedMotion ? 1 : 0.84 + 0.16 * settle;
        group.scale.setScalar(Math.max(0.82, scale));

        revealGeometries.get(id)?.forEach((record) => {
          const localReveal = smoothstep(record.start, record.end, rawWave);
          if (record.atomicObject) {
            record.atomicObject.scale.setScalar(Math.max(0.001, smoothstep(0, 0.82, localReveal)));
          }
          const drawCount =
            record.atomic
              ? localReveal > 0.015
                ? record.maxCount
                : 0
              : localReveal > 0.999
              ? record.maxCount
              : Math.floor((record.maxCount * localReveal) / record.step) * record.step;
          record.geometry.setDrawRange(0, drawCount);
        });

        const focus =
          activeSystem && activeSystem !== id && wave > 0.001
            ? 1 - SYSTEM_FOCUS_DROP[activeSystem] * activePulse
            : 1;
        const enteringBoost =
          activeSystem === id ? 1 + activePulse * SYSTEM_ENTRY_BOOST[activeSystem] : 1;
        systemMaterials.get(id)?.forEach(({ baseOpacity, material }) => {
          material.opacity = Math.min(1, baseOpacity * wave * focus * enteringBoost);
          material.depthWrite = progress > 0.98 && baseOpacity >= 0.9;
        });

        const marker = waveMarkers.get(id);
        const path = wavePaths.get(id);
        const markerVisible = Boolean(
          marker &&
            path &&
            activeSystem === id &&
            rawWave > 0.01 &&
            rawWave < SYSTEM_MARKER_END[id],
        );
        if (marker && path && markerVisible) {
          marker.group.visible = true;
          marker.group.position.copy(path.getPointAt(wave));
          marker.group.scale.setScalar(0.82 + activePulse * 0.56);
          marker.coreMaterial.opacity = activePulse * 0.95;
          marker.haloMaterial.opacity = activePulse * 0.28;
          activeMarker = marker.group;
        } else if (marker) {
          marker.group.visible = false;
          marker.coreMaterial.opacity = 0;
          marker.haloMaterial.opacity = 0;
        }
      });

      const pulse =
        smoothstep(0.18, 0.5, bmsLocal) * (1 - smoothstep(0.72, 1, bmsLocal));
      signalMaterials.forEach(({ baseOpacity, material }) => {
        const boost = activeSystem === "bms" ? 1 + activePulse * 0.45 : 1;
        material.opacity = Math.min(1, baseOpacity * commission * boost);
      });
      signalNode.visible = pulse > 0.02;
      if (signalNode.visible && signalCurves.length > 0) {
        const phase = ((time * 0.000055 + progress * 0.55) % 1 + 1) % 1;
        signalNode.position.copy(signalCurves[0].getPointAt(phase));
        signalNode.scale.setScalar(0.78 + pulse * 0.42);
      }

      pointer.lerp(pointerTarget, pointerDamping);
      camera.position
        .copy(startCameraPosition)
        .lerp(finalCameraPosition, smoothstep(0.08, 0.832, progress));
      const cameraShift = activeSystem ? SYSTEM_CAMERA_SHIFT[activeSystem] : neutralCameraShift;
      camera.position.x += cameraShift[0] * activePulse;
      camera.position.y += cameraShift[1] * activePulse;
      camera.position.z += cameraShift[2] * activePulse;
      camera.position.x += pointer.x * 0.28;
      camera.position.y -= pointer.y * 0.22;
      cameraTarget.set(isMobile ? 1.4 : 2.15, isMobile ? -0.5 : 0.35, 0);
      cameraTarget.x += cameraShift[0] * activePulse * 0.14;
      cameraTarget.y += cameraShift[1] * activePulse * 0.34;
      cameraTarget.z += cameraShift[2] * activePulse * 0.16;
      cameraTarget.x += pointer.x * 0.12;
      cameraTarget.y -= pointer.y * 0.1;
      camera.lookAt(cameraTarget);
      root.rotation.y = -0.035 + pointer.x * 0.012 + activePulse * 0.008;
      root.rotation.x = pointer.y * 0.007 - activePulse * 0.004;

      if (activeMarker) {
        activeMarker.getWorldPosition(waveWorldPosition);
        waveLight.position.copy(waveWorldPosition);
        waveLight.intensity =
          activePulse * (isMobile ? 4.5 : 9) * (activeSystem ? SYSTEM_LIGHT_SCALE[activeSystem] : 1);
        const label = waveLabel;
        if (label) {
          camera.updateMatrixWorld();
          waveScreenPosition.copy(waveWorldPosition).project(camera);
          const rawX = (waveScreenPosition.x * 0.5 + 0.5) * canvas.clientWidth;
          const rawY = (-waveScreenPosition.y * 0.5 + 0.5) * canvas.clientHeight;
          const x = Math.min(canvas.clientWidth - 16, Math.max(16, rawX));
          const y = Math.min(canvas.clientHeight - 46, Math.max(34, rawY));
          label.style.setProperty("--wave-label-x", `${x}px`);
          label.style.setProperty("--wave-label-y", `${y}px`);
          label.dataset.align = rawX > canvas.clientWidth * (isMobile ? 0.58 : 0.72) ? "left" : "right";
          label.dataset.visible = "true";
        }
      } else {
        waveLight.intensity = 0;
        if (waveLabel) waveLabel.dataset.visible = "false";
      }
    };

    const render = (time: number) => {
      animationFrame = 0;
      if (!pageVisible || !inViewport || contextFailed) {
        return;
      }

      const deltaSeconds = Math.min(0.08, Math.max(0.001, (time - lastFrameTime) / 1000));
      lastFrameTime = time;
      const targetProgress = reducedMotion ? 1 : progressRef.current ?? 0;
      const delta = targetProgress - currentProgress;
      const progressDamping = 1 - Math.exp(-10.5 * deltaSeconds);
      const pointerDamping = 1 - Math.exp(-3.8 * deltaSeconds);
      currentProgress += delta * progressDamping;
      applyProgress(currentProgress, time, pointerDamping);
      narrativeFrameRef.current?.(currentProgress);
      soundFrameRef.current?.({ deltaSeconds, progress: currentProgress });
      renderer.render(scene, camera);
      if (!ready) {
        canvas.dataset.ready = "true";
        ready = true;
      }
      const settledBeyondStory = targetProgress >= 0.999 && currentProgress >= 0.997;
      if (!reducedMotion && !contextFailed && !settledBeyondStory) {
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

    const onScrollWake = () => startRender();

    const onContextLost = (event: Event) => {
      event.preventDefault();
      contextFailed = true;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      canvas.dataset.failed = "true";
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScrollWake, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    viewportObserver.observe(canvas);
    if (reducedMotion) {
      applyProgress(1, performance.now(), 1);
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
      window.removeEventListener("scroll", onScrollWake);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      viewportObserver.disconnect();
      if (waveLabel) waveLabel.dataset.visible = "false";
      root.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
        }
      });
      const materials = new Set<THREE.Material>();
      systemMaterials.forEach((records) => records.forEach(({ material }) => materials.add(material)));
      waveMarkerMaterials.forEach((material) => materials.add(material));
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
      className="weave-canvas"
      ref={canvasRef}
      role="presentation"
    />
  );
}
