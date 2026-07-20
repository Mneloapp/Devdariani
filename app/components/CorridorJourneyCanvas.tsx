"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { SHAFT_SYSTEM_COLORS } from "@/app/lib/shaft-data";
import type { ShaftTheme } from "./ShaftJourneyCanvas";

export type CorridorJourneyCanvasProps = {
  progressRef: RefObject<number>;
  renderRequestRef: RefObject<(() => void) | null>;
  reducedMotion: boolean;
  theme: ShaftTheme;
};

type CorridorPalette = {
  ambientDay: number;
  ambientNight: number;
  ceiling: string;
  cityDay: readonly [string, string, string, string];
  cityNight: readonly [string, string, string, string];
  corridor: string;
  duskSky: string;
  floor: string;
  frame: string;
  nightSky: string;
  sky: string;
  wall: string;
  window: string;
};

const CORRIDOR_PALETTES: Record<ShaftTheme, CorridorPalette> = {
  bronze: {
    ambientDay: 1.18,
    ambientNight: 0.38,
    ceiling: "#39332E",
    cityDay: ["#817B75", "#A19A91", "#6E7475", "#B4A99B"],
    cityNight: ["#25272A", "#303135", "#1C2429", "#39332F"],
    corridor: "#4B433C",
    duskSky: "#76666A",
    floor: "#302C29",
    frame: "#C5B9A8",
    nightSky: "#171C22",
    sky: "#9EAAA9",
    wall: "#514A43",
    window: "#A7C5CA",
  },
  dark: {
    ambientDay: 1.12,
    ambientNight: 0.34,
    ceiling: "#39474B",
    cityDay: ["#77878A", "#94A0A0", "#68777C", "#A6ADAA"],
    cityNight: ["#17232A", "#253138", "#142029", "#303B3F"],
    corridor: "#47565A",
    duskSky: "#65616D",
    floor: "#303B3F",
    frame: "#C1C9C7",
    nightSky: "#121D24",
    sky: "#AABCC0",
    wall: "#516064",
    window: "#A4CCD2",
  },
  light: {
    ambientDay: 1.35,
    ambientNight: 0.48,
    ceiling: "#D7D7D2",
    cityDay: ["#A6ADAE", "#C0C2BE", "#929EA2", "#D0CBC3"],
    cityNight: ["#26333B", "#364149", "#202D36", "#41484B"],
    corridor: "#D8D8D2",
    duskSky: "#827A82",
    floor: "#B8BAB7",
    frame: "#555B5D",
    nightSky: "#18242C",
    sky: "#C4D2D3",
    wall: "#E0DFD9",
    window: "#BDD9DD",
  },
  mineral: {
    ambientDay: 1.14,
    ambientNight: 0.36,
    ceiling: "#39423C",
    cityDay: ["#7C8780", "#9DA39B", "#6A7872", "#B0ADA2"],
    cityNight: ["#1A2825", "#293531", "#172420", "#353B35"],
    corridor: "#465049",
    duskSky: "#6C6669",
    floor: "#303832",
    frame: "#C1C6BB",
    nightSky: "#141F20",
    sky: "#ADBAB5",
    wall: "#505A52",
    window: "#A8C9C4",
  },
};

const CORRIDOR = {
  ceiling: 6.55,
  endZ: -59,
  halfWidth: 5.8,
  length: 72,
  startZ: 12,
} as const;

const IDENTITY_QUATERNION = new THREE.Quaternion();

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function lerp(from: number, to: number, value: number) {
  return from + (to - from) * value;
}

function smoothstep(from: number, to: number, value: number) {
  const normalized = clamp01((value - from) / Math.max(0.0001, to - from));
  return normalized * normalized * (3 - 2 * normalized);
}

function colorBetween(
  target: THREE.Color,
  from: THREE.Color,
  to: THREE.Color,
  amount: number,
) {
  target.copy(from).lerp(to, clamp01(amount));
}

function createLongitudinalCylinder(
  radius: number,
  length: number,
  material: THREE.Material,
  radialSegments = 10,
) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, radialSegments),
    material,
  );
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

export function CorridorJourneyCanvas({
  progressRef,
  renderRequestRef,
  reducedMotion,
  theme,
}: CorridorJourneyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const palette = CORRIDOR_PALETTES[theme];
    let renderer: THREE.WebGLRenderer;
    let contextFailed = false;

    canvas.dataset.failed = "false";
    canvas.dataset.ready = "false";

    try {
      renderer = new THREE.WebGLRenderer({
        alpha: false,
        antialias: window.devicePixelRatio < 2.25,
        canvas,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.dataset.failed = "true";
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme === "light" ? 1.04 : 1.08;

    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(palette.sky);
    const duskColor = new THREE.Color(palette.duskSky);
    const nightColor = new THREE.Color(palette.nightSky);
    const currentSkyColor = skyColor.clone();
    scene.background = currentSkyColor;
    scene.fog = new THREE.Fog(currentSkyColor.clone(), 62, 178);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.08, 230);
    camera.position.set(0, 2.25, 10.5);

    const corridorRoot = new THREE.Group();
    corridorRoot.name = "orchestrics-corridor";
    scene.add(corridorRoot);

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: palette.floor,
      metalness: 0.34,
      roughness: 0.38,
    });
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: palette.wall,
      metalness: 0.08,
      roughness: 0.66,
    });
    const ceilingMaterial = new THREE.MeshStandardMaterial({
      color: palette.ceiling,
      metalness: 0.26,
      roughness: 0.52,
    });
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: palette.frame,
      metalness: 0.72,
      roughness: 0.3,
    });
    const detailMaterial = new THREE.MeshStandardMaterial({
      color: palette.frame,
      metalness: 0.62,
      opacity: 0.38,
      roughness: 0.34,
      transparent: true,
    });

    const corridorCenterZ = (CORRIDOR.startZ + CORRIDOR.endZ) / 2;
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.18, CORRIDOR.length),
      floorMaterial,
    );
    floor.position.set(0, -0.09, corridorCenterZ);
    corridorRoot.add(floor);

    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.16, CORRIDOR.length),
      ceilingMaterial,
    );
    ceiling.position.set(0, CORRIDOR.ceiling + 0.08, corridorCenterZ);
    corridorRoot.add(ceiling);

    const wallGeometry = new THREE.BoxGeometry(0.2, CORRIDOR.ceiling, 5.55);
    const bayCount = 12;
    const walls = new THREE.InstancedMesh(wallGeometry, wallMaterial, bayCount * 2);
    const matrix = new THREE.Matrix4();
    for (let index = 0; index < bayCount; index += 1) {
      const z = lerp(8.45, -55.55, index / Math.max(1, bayCount - 1));
      matrix.makeTranslation(-CORRIDOR.halfWidth, CORRIDOR.ceiling / 2, z);
      walls.setMatrixAt(index * 2, matrix);
      matrix.makeTranslation(CORRIDOR.halfWidth, CORRIDOR.ceiling / 2, z);
      walls.setMatrixAt(index * 2 + 1, matrix);
    }
    walls.instanceMatrix.needsUpdate = true;
    corridorRoot.add(walls);

    const columnGeometry = new THREE.BoxGeometry(0.22, CORRIDOR.ceiling, 0.22);
    const beamGeometry = new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.18, 0.2);
    const frameCount = bayCount + 1;
    const columns = new THREE.InstancedMesh(columnGeometry, frameMaterial, frameCount * 2);
    const beams = new THREE.InstancedMesh(beamGeometry, frameMaterial, frameCount);
    for (let index = 0; index < frameCount; index += 1) {
      const z = lerp(11.2, -58.4, index / Math.max(1, frameCount - 1));
      matrix.makeTranslation(-CORRIDOR.halfWidth + 0.03, CORRIDOR.ceiling / 2, z);
      columns.setMatrixAt(index * 2, matrix);
      matrix.makeTranslation(CORRIDOR.halfWidth - 0.03, CORRIDOR.ceiling / 2, z);
      columns.setMatrixAt(index * 2 + 1, matrix);
      matrix.makeTranslation(0, CORRIDOR.ceiling - 0.02, z);
      beams.setMatrixAt(index, matrix);
    }
    columns.instanceMatrix.needsUpdate = true;
    beams.instanceMatrix.needsUpdate = true;
    corridorRoot.add(columns, beams);

    const floorJointGeometry = new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.012, 0.025);
    const floorJoints = new THREE.InstancedMesh(floorJointGeometry, detailMaterial, 18);
    for (let index = 0; index < 18; index += 1) {
      matrix.makeTranslation(0, 0.011, lerp(9.5, -57.2, index / 17));
      floorJoints.setMatrixAt(index, matrix);
    }
    floorJoints.instanceMatrix.needsUpdate = true;
    corridorRoot.add(floorJoints);

    const floorGuideGeometry = new THREE.BoxGeometry(0.018, 0.014, CORRIDOR.length - 1.2);
    const floorGuides = new THREE.InstancedMesh(floorGuideGeometry, detailMaterial, 3);
    [-2.9, 0, 2.9].forEach((x, index) => {
      matrix.makeTranslation(x, 0.012, corridorCenterZ);
      floorGuides.setMatrixAt(index, matrix);
    });
    floorGuides.instanceMatrix.needsUpdate = true;
    corridorRoot.add(floorGuides);

    // The coordinated ceiling is deliberately lane-based. Every service remains
    // longitudinal and occupies a unique x/y datum, making crossings impossible.
    const services = new THREE.Group();
    services.name = "coordinated-ceiling-services";
    corridorRoot.add(services);
    const serviceLength = 64.2;
    const serviceCenterZ = -23.8;

    const createServiceMaterial = (color: string, emissiveScale = 0.1) =>
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: emissiveScale,
        metalness: 0.58,
        roughness: 0.31,
      });

    const hvacMaterial = createServiceMaterial(SHAFT_SYSTEM_COLORS.hvac.primary, 0.08);
    const hvacCollarMaterial = createServiceMaterial(SHAFT_SYSTEM_COLORS.hvac.light, 0.1);
    const electricalMaterial = createServiceMaterial(
      SHAFT_SYSTEM_COLORS.electrical.primary,
      0.07,
    );
    const plumbingMaterial = createServiceMaterial(
      SHAFT_SYSTEM_COLORS.plumbing.primary,
      0.08,
    );
    const plumbingSecondaryMaterial = createServiceMaterial(
      SHAFT_SYSTEM_COLORS.plumbing.light,
      0.07,
    );
    const fireMaterial = createServiceMaterial(SHAFT_SYSTEM_COLORS.fire.primary, 0.08);
    const bmsMaterial = createServiceMaterial(SHAFT_SYSTEM_COLORS.bms.primary, 0.1);
    const serviceMaterials = [
      hvacMaterial,
      hvacCollarMaterial,
      electricalMaterial,
      plumbingMaterial,
      plumbingSecondaryMaterial,
      fireMaterial,
      bmsMaterial,
    ];

    const ductCount = 13;
    const ductSegmentLength = serviceLength / ductCount - 0.11;
    const ductGeometry = new THREE.BoxGeometry(1.22, 0.66, ductSegmentLength);
    const ducts = new THREE.InstancedMesh(ductGeometry, hvacMaterial, ductCount);
    for (let index = 0; index < ductCount; index += 1) {
      matrix.makeTranslation(
        -3.52,
        5.42,
        7.95 - serviceLength / ductCount / 2 - (index * serviceLength) / ductCount,
      );
      ducts.setMatrixAt(index, matrix);
    }
    ducts.instanceMatrix.needsUpdate = true;
    services.add(ducts);

    const ductCollarGeometry = new THREE.BoxGeometry(1.32, 0.76, 0.075);
    const ductCollars = new THREE.InstancedMesh(
      ductCollarGeometry,
      hvacCollarMaterial,
      ductCount + 1,
    );
    for (let index = 0; index <= ductCount; index += 1) {
      matrix.makeTranslation(-3.52, 5.42, 7.95 - (index * serviceLength) / ductCount);
      ductCollars.setMatrixAt(index, matrix);
    }
    ductCollars.instanceMatrix.needsUpdate = true;
    services.add(ductCollars);

    [-0.38, 0.38].forEach((offset) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.075, 0.09, serviceLength),
        electricalMaterial,
      );
      rail.position.set(3.38 + offset, 5.35, serviceCenterZ);
      services.add(rail);
    });
    const rungGeometry = new THREE.BoxGeometry(0.84, 0.055, 0.065);
    const rungCount = 45;
    const trayRungs = new THREE.InstancedMesh(rungGeometry, electricalMaterial, rungCount);
    for (let index = 0; index < rungCount; index += 1) {
      matrix.makeTranslation(3.38, 5.32, lerp(7.8, -55.8, index / (rungCount - 1)));
      trayRungs.setMatrixAt(index, matrix);
    }
    trayRungs.instanceMatrix.needsUpdate = true;
    services.add(trayRungs);
    [-0.22, 0, 0.22].forEach((offset) => {
      const cable = createLongitudinalCylinder(0.028, serviceLength, electricalMaterial, 7);
      cable.position.set(3.38 + offset, 5.39, serviceCenterZ);
      services.add(cable);
    });

    const plumbingPrimary = createLongitudinalCylinder(
      0.115,
      serviceLength,
      plumbingMaterial,
      12,
    );
    plumbingPrimary.position.set(0.45, 5.02, serviceCenterZ);
    const plumbingSecondary = createLongitudinalCylinder(
      0.085,
      serviceLength,
      plumbingSecondaryMaterial,
      10,
    );
    plumbingSecondary.position.set(0.88, 4.84, serviceCenterZ);
    services.add(plumbingPrimary, plumbingSecondary);

    const fireMain = createLongitudinalCylinder(0.105, serviceLength, fireMaterial, 12);
    fireMain.position.set(-0.92, 4.73, serviceCenterZ);
    services.add(fireMain);
    const sprinklerDropGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.48, 8);
    const sprinklerHeadGeometry = new THREE.CylinderGeometry(0.105, 0.075, 0.045, 12);
    const sprinklerCount = 8;
    const sprinklerDrops = new THREE.InstancedMesh(
      sprinklerDropGeometry,
      fireMaterial,
      sprinklerCount,
    );
    const sprinklerHeads = new THREE.InstancedMesh(
      sprinklerHeadGeometry,
      fireMaterial,
      sprinklerCount,
    );
    for (let index = 0; index < sprinklerCount; index += 1) {
      const z = lerp(5.5, -53.5, index / (sprinklerCount - 1));
      matrix.makeTranslation(-0.92, 4.45, z);
      sprinklerDrops.setMatrixAt(index, matrix);
      matrix.makeTranslation(-0.92, 4.19, z);
      sprinklerHeads.setMatrixAt(index, matrix);
    }
    sprinklerDrops.instanceMatrix.needsUpdate = true;
    sprinklerHeads.instanceMatrix.needsUpdate = true;
    services.add(sprinklerDrops, sprinklerHeads);

    const bmsConduit = createLongitudinalCylinder(0.045, serviceLength, bmsMaterial, 8);
    bmsConduit.position.set(2.05, 4.62, serviceCenterZ);
    services.add(bmsConduit);
    const bmsBoxGeometry = new THREE.BoxGeometry(0.34, 0.22, 0.12);
    const bmsBoxes = new THREE.InstancedMesh(bmsBoxGeometry, bmsMaterial, 9);
    for (let index = 0; index < 9; index += 1) {
      matrix.makeTranslation(2.05, 4.62, lerp(6, -54, index / 8));
      bmsBoxes.setMatrixAt(index, matrix);
    }
    bmsBoxes.instanceMatrix.needsUpdate = true;
    services.add(bmsBoxes);

    const hangerMaterial = new THREE.MeshStandardMaterial({
      color: palette.frame,
      metalness: 0.76,
      roughness: 0.3,
    });
    const hangerGeometry = new THREE.BoxGeometry(0.025, 1.45, 0.025);
    const hangerCount = 16;
    const hangers = new THREE.InstancedMesh(hangerGeometry, hangerMaterial, hangerCount);
    for (let index = 0; index < hangerCount / 2; index += 1) {
      const z = lerp(5.4, -53.6, index / (hangerCount / 2 - 1));
      matrix.makeTranslation(-4.02, 5.8, z);
      hangers.setMatrixAt(index * 2, matrix);
      matrix.makeTranslation(3.85, 5.75, z);
      hangers.setMatrixAt(index * 2 + 1, matrix);
    }
    hangers.instanceMatrix.needsUpdate = true;
    services.add(hangers);

    // The end frame hides clean service terminations while preserving a single,
    // uninterrupted panoramic opening toward the central-city skyline.
    const windowFrame = new THREE.Group();
    windowFrame.name = "city-window-frame";
    const windowZ = CORRIDOR.endZ - 0.1;
    const verticalFrameGeometry = new THREE.BoxGeometry(0.3, CORRIDOR.ceiling, 0.32);
    [-CORRIDOR.halfWidth + 0.08, CORRIDOR.halfWidth - 0.08].forEach((x) => {
      const side = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
      side.position.set(x, CORRIDOR.ceiling / 2, windowZ);
      windowFrame.add(side);
    });
    const topFrame = new THREE.Mesh(
      new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.36, 0.34),
      frameMaterial,
    );
    topFrame.position.set(0, CORRIDOR.ceiling - 0.08, windowZ);
    const lowerFrame = new THREE.Mesh(
      new THREE.BoxGeometry(CORRIDOR.halfWidth * 2, 0.22, 0.34),
      frameMaterial,
    );
    lowerFrame.position.set(0, 0.02, windowZ);
    windowFrame.add(topFrame, lowerFrame);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: palette.window,
      depthWrite: false,
      metalness: 0.05,
      opacity: 0.11,
      roughness: 0.08,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(CORRIDOR.halfWidth * 2 - 0.45, CORRIDOR.ceiling - 0.42),
      glassMaterial,
    );
    glass.position.set(0, CORRIDOR.ceiling / 2, windowZ - 0.04);
    glass.renderOrder = 18;
    windowFrame.add(glass);
    scene.add(windowFrame);

    type Building = {
      d: number;
      h: number;
      material: number;
      w: number;
      x: number;
      z: number;
    };
    const buildingSpecs: readonly Building[] = [
      { d: 8, h: 13, material: 1, w: 7, x: -20, z: -104 },
      { d: 7, h: 21, material: 2, w: 5.6, x: -13.2, z: -116 },
      { d: 6, h: 10, material: 0, w: 7.2, x: -13.5, z: -88 },
      { d: 7, h: 27, material: 3, w: 5.4, x: -7.2, z: -126 },
      { d: 6, h: 17, material: 1, w: 5.8, x: -6.4, z: -98 },
      { d: 7, h: 34, material: 2, w: 6.2, x: 0, z: -134 },
      { d: 5, h: 14, material: 0, w: 5.4, x: 0.5, z: -94 },
      { d: 7, h: 25, material: 1, w: 6.4, x: 7.4, z: -120 },
      { d: 6, h: 12, material: 3, w: 6.2, x: 7.1, z: -91 },
      { d: 7, h: 19, material: 0, w: 5.7, x: 13.5, z: -108 },
      { d: 8, h: 11, material: 2, w: 7.5, x: 15.2, z: -88 },
      { d: 8, h: 15, material: 3, w: 7.2, x: 21, z: -115 },
      { d: 7, h: 9, material: 1, w: 7.5, x: -23, z: -84 },
      { d: 8, h: 8, material: 0, w: 8, x: 23, z: -86 },
    ];

    const buildingGeometry = new THREE.BoxGeometry(1, 1, 1);
    const buildingMaterials = palette.cityDay.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          metalness: 0.3,
          roughness: 0.52,
        }),
    );
    buildingMaterials.forEach((material, materialIndex) => {
      const matches = buildingSpecs.filter((building) => building.material === materialIndex);
      const mesh = new THREE.InstancedMesh(buildingGeometry, material, matches.length);
      matches.forEach((building, index) => {
        matrix.compose(
          new THREE.Vector3(building.x, building.h / 2 - 0.05, building.z),
          IDENTITY_QUATERNION,
          new THREE.Vector3(building.w, building.h, building.d),
        );
        mesh.setMatrixAt(index, matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      scene.add(mesh);
    });

    const crownMaterial = new THREE.MeshStandardMaterial({
      color: palette.cityDay[2],
      metalness: 0.58,
      roughness: 0.34,
    });
    const centralCrown = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.2, 4.8), crownMaterial);
    centralCrown.position.set(0, 35.05, -134);
    scene.add(centralCrown);

    const windowMatrices: THREE.Matrix4[] = [];
    const litWindowMatrices: THREE.Matrix4[][] = Array.from({ length: 8 }, () => []);
    buildingSpecs.forEach((building, buildingIndex) => {
      const columnsCount = Math.max(2, Math.floor(building.w / 1.05));
      const rowsCount = Math.max(3, Math.floor((building.h - 1.2) / 1.28));
      for (let row = 0; row < rowsCount; row += 1) {
        for (let column = 0; column < columnsCount; column += 1) {
          const x =
            building.x - building.w * 0.39 +
            (column / Math.max(1, columnsCount - 1)) * building.w * 0.78;
          const y = 0.8 + (row / Math.max(1, rowsCount - 1)) * (building.h - 1.65);
          const z = building.z + building.d / 2 + 0.012;
          const windowMatrix = new THREE.Matrix4().compose(
            new THREE.Vector3(x, y, z),
            IDENTITY_QUATERNION,
            new THREE.Vector3(0.34, 0.26, 1),
          );
          windowMatrices.push(windowMatrix);
          const hash = (buildingIndex * 29 + row * 17 + column * 11) % 17;
          if (hash < 11) {
            litWindowMatrices[(buildingIndex + row * 3 + column * 5) % 8].push(
              windowMatrix.clone(),
            );
          }
        }
      }
    });

    const windowGeometry = new THREE.PlaneGeometry(1, 1);
    const darkWindowMaterial = new THREE.MeshBasicMaterial({
      color: "#26373D",
      opacity: 0.5,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const darkWindows = new THREE.InstancedMesh(
      windowGeometry,
      darkWindowMaterial,
      windowMatrices.length,
    );
    windowMatrices.forEach((windowMatrix, index) => darkWindows.setMatrixAt(index, windowMatrix));
    darkWindows.instanceMatrix.needsUpdate = true;
    darkWindows.renderOrder = 4;
    scene.add(darkWindows);

    const cityLightMaterials: THREE.MeshBasicMaterial[] = [];
    litWindowMatrices.forEach((matrices, groupIndex) => {
      const material = new THREE.MeshBasicMaterial({
        blending: THREE.AdditiveBlending,
        color: groupIndex % 3 === 0 ? "#FFF0C2" : groupIndex % 3 === 1 ? "#FFD488" : "#D9E7E5",
        depthWrite: false,
        opacity: 0,
        side: THREE.DoubleSide,
        transparent: true,
      });
      cityLightMaterials.push(material);
      const mesh = new THREE.InstancedMesh(windowGeometry, material, matrices.length);
      matrices.forEach((windowMatrix, index) => {
        const illuminatedMatrix = windowMatrix.clone();
        illuminatedMatrix.elements[14] += 0.018;
        mesh.setMatrixAt(index, illuminatedMatrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.renderOrder = 6 + groupIndex;
      scene.add(mesh);
    });

    const cityGroundMaterial = new THREE.MeshStandardMaterial({
      color: "#222B2E",
      metalness: 0.2,
      roughness: 0.72,
    });
    const cityGround = new THREE.Mesh(new THREE.BoxGeometry(62, 0.25, 82), cityGroundMaterial);
    cityGround.position.set(0, -0.2, -105);
    scene.add(cityGround);
    const roadMaterial = new THREE.MeshStandardMaterial({
      color: "#171D20",
      metalness: 0.25,
      roughness: 0.58,
    });
    const road = new THREE.Mesh(new THREE.BoxGeometry(12, 0.08, 74), roadMaterial);
    road.position.set(0, -0.03, -103);
    scene.add(road);

    const lampPoleMaterial = new THREE.MeshStandardMaterial({
      color: "#526064",
      metalness: 0.78,
      roughness: 0.3,
    });
    const lampGeometry = new THREE.CylinderGeometry(0.035, 0.045, 1.3, 7);
    const lampBulbGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const lampCount = 18;
    const lampPoles = new THREE.InstancedMesh(lampGeometry, lampPoleMaterial, lampCount);
    const lampMaterial = new THREE.MeshBasicMaterial({
      blending: THREE.AdditiveBlending,
      color: "#FFD58F",
      depthWrite: false,
      opacity: 0,
      transparent: true,
    });
    const lampBulbs = new THREE.InstancedMesh(lampBulbGeometry, lampMaterial, lampCount);
    for (let index = 0; index < lampCount / 2; index += 1) {
      const z = lerp(-70, -125, index / (lampCount / 2 - 1));
      [-6.6, 6.6].forEach((x, sideIndex) => {
        const instance = index * 2 + sideIndex;
        matrix.makeTranslation(x, 0.64, z);
        lampPoles.setMatrixAt(instance, matrix);
        matrix.makeTranslation(x, 1.31, z);
        lampBulbs.setMatrixAt(instance, matrix);
      });
    }
    lampPoles.instanceMatrix.needsUpdate = true;
    lampBulbs.instanceMatrix.needsUpdate = true;
    lampBulbs.renderOrder = 16;
    scene.add(lampPoles, lampBulbs);

    const ambient = new THREE.AmbientLight("#F5F0E8", palette.ambientDay);
    const hemisphere = new THREE.HemisphereLight("#C9D9DE", "#313739", 1.05);
    const daylight = new THREE.DirectionalLight("#FFF6E7", 2.35);
    daylight.position.set(-18, 26, 20);
    const cityFill = new THREE.DirectionalLight("#8FAEC0", 0.74);
    cityFill.position.set(16, 10, -34);
    scene.add(ambient, hemisphere, daylight, cityFill);

    const practicalLights: THREE.PointLight[] = [];
    [2, -15, -32, -49].forEach((z) => {
      const practical = new THREE.PointLight("#F5E4C7", 0.42, 18, 2);
      practical.position.set(0, 5.9, z);
      practicalLights.push(practical);
      scene.add(practical);
      const luminaire = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 0.035, 0.12),
        new THREE.MeshBasicMaterial({ color: "#E8DFCE" }),
      );
      luminaire.position.set(0, 6.29, z);
      corridorRoot.add(luminaire);
    });

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const cameraTarget = new THREE.Vector3();
    const buildingDayColors = palette.cityDay.map((color) => new THREE.Color(color));
    const buildingNightColors = palette.cityNight.map((color) => new THREE.Color(color));
    const buildingCurrentColor = new THREE.Color();
    let currentProgress = reducedMotion ? 1 : clamp01(progressRef.current ?? 0);
    let animationFrame = 0;
    let pageVisible = !document.hidden;
    let inViewport = true;
    let lastFrameTime = performance.now();
    let mobile = window.matchMedia("(max-width: 767px), (max-aspect-ratio: 4/5)").matches;
    let requestRender = () => {};

    const updateCamera = (progress: number) => {
      const approach = smoothstep(0, 0.79, progress);
      const finalApproach = smoothstep(0.79, 1, progress);
      const startZ = 10.7;
      const windowApproachZ = mobile ? -48.2 : -50.2;
      const finalZ = mobile ? -51.3 : -53.1;
      camera.position.set(
        Math.sin(approach * Math.PI * 1.35) * 0.13 + pointer.x * (mobile ? 0 : 0.34),
        lerp(2.22, 2.48, approach) - pointer.y * (mobile ? 0 : 0.18),
        lerp(lerp(startZ, windowApproachZ, approach), finalZ, finalApproach),
      );
      cameraTarget.set(
        pointer.x * (mobile ? 0 : 0.16),
        lerp(2.32, 3.1, smoothstep(0.62, 1, progress)) - pointer.y * 0.08,
        lerp(camera.position.z - 17, -112, smoothstep(0.7, 1, progress)),
      );
      const nextFov = lerp(mobile ? 60 : 50, mobile ? 53 : 44, smoothstep(0.62, 1, progress));
      if (Math.abs(camera.fov - nextFov) > 0.01) {
        camera.fov = nextFov;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(cameraTarget);
    };

    const updateDaylight = (progress: number) => {
      const dayToDusk = smoothstep(0.72, 0.86, progress);
      const duskToNight = smoothstep(0.86, 1, progress);
      colorBetween(currentSkyColor, skyColor, duskColor, dayToDusk);
      currentSkyColor.lerp(nightColor, duskToNight);
      if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(currentSkyColor);

      const night = smoothstep(0.74, 1, progress);
      ambient.intensity = lerp(palette.ambientDay, palette.ambientNight, night);
      hemisphere.intensity = lerp(1.05, 0.3, night);
      daylight.intensity = lerp(2.35, 0.12, night);
      cityFill.intensity = lerp(0.74, 0.34, night);
      practicalLights.forEach((light, index) => {
        light.intensity = lerp(0.42, 1.28, smoothstep(0.76 + index * 0.025, 0.9 + index * 0.018, progress));
      });
      serviceMaterials.forEach((material) => {
        material.emissiveIntensity = lerp(0.08, 0.2, night);
      });

      buildingMaterials.forEach((material, index) => {
        colorBetween(
          buildingCurrentColor,
          buildingDayColors[index],
          buildingNightColors[index],
          night,
        );
        material.color.copy(buildingCurrentColor);
      });
      colorBetween(
        buildingCurrentColor,
        buildingDayColors[2],
        buildingNightColors[2],
        night,
      );
      crownMaterial.color.copy(buildingCurrentColor);

      cityLightMaterials.forEach((material, index) => {
        material.opacity = smoothstep(0.77 + index * 0.022, 0.85 + index * 0.02, progress);
      });
      lampMaterial.opacity = smoothstep(0.83, 0.96, progress);
      darkWindowMaterial.opacity = lerp(0.42, 0.78, night);
      glassMaterial.opacity = lerp(0.09, 0.16, night);
    };

    const applyProgress = (progress: number, pointerDamping: number) => {
      pointer.lerp(pointerTarget, pointerDamping);
      updateCamera(progress);
      updateDaylight(progress);
    };

    const render = (time: number) => {
      animationFrame = 0;
      if (!pageVisible || !inViewport || contextFailed) return;
      const deltaSeconds = Math.min(0.08, Math.max(0.001, (time - lastFrameTime) / 1000));
      lastFrameTime = time;
      const targetProgress = reducedMotion ? 1 : clamp01(progressRef.current ?? 0);
      const progressDamping = 1 - Math.exp(-8.2 * deltaSeconds);
      const pointerDamping = 1 - Math.exp(-4.2 * deltaSeconds);
      currentProgress += (targetProgress - currentProgress) * progressDamping;
      applyProgress(currentProgress, pointerDamping);
      renderer.render(scene, camera);
      canvas.dataset.ready = "true";

      const progressSettled = Math.abs(targetProgress - currentProgress) < 0.00005;
      const pointerSettled = pointer.distanceToSquared(pointerTarget) < 0.0000005;
      if (!reducedMotion && (!progressSettled || !pointerSettled)) {
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
    renderRequestRef.current = startRender;

    const onPointerMove = (event: PointerEvent) => {
      if (mobile || reducedMotion) return;
      pointerTarget.set(
        event.clientX / Math.max(1, window.innerWidth) - 0.5,
        event.clientY / Math.max(1, window.innerHeight) - 0.5,
      );
      startRender();
    };

    const resize = () => {
      mobile = window.matchMedia("(max-width: 767px), (max-aspect-ratio: 4/5)").matches;
      const width = canvas.clientWidth || window.innerWidth;
      const height = canvas.clientHeight || window.innerHeight;
      camera.aspect = width / Math.max(1, height);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.15 : 1.6));
      renderer.setSize(width, height, false);
      requestRender();
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
      { rootMargin: "12% 0px", threshold: 0.01 },
    );

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
    window.addEventListener("scroll", startRender, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    canvas.addEventListener("webglcontextlost", onContextLost);
    viewportObserver.observe(canvas);

    if (reducedMotion) {
      applyProgress(1, 1);
      renderer.render(scene, camera);
      canvas.dataset.ready = "true";
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
      if (renderRequestRef.current === startRender) renderRequestRef.current = null;

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
  }, [progressRef, reducedMotion, renderRequestRef, theme]);

  return (
    <canvas
      aria-hidden="true"
      className="corridor-canvas"
      ref={canvasRef}
      role="presentation"
    />
  );
}
