import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import config from "../data/youth-playground.json" with { type: "json" };
import { byId, pointsOf } from "../../../../core/shared/geography/map.js";
import {
  inside,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { schoolGatePlacement } from "./SchoolGates.js";
import { campusWallSegments } from "../../../../core/shared/architecture/CampusWalls.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { beam } from "../../../../core/shared/architecture/architecture.js";
import { onOtherCarriageway } from "../../../../core/world/streetPlacement.js";
import { createManicuredLawnTexture } from "../../../../core/world/turfTextures.js";

function createCanvasTex(width, height, draw, repeatX = 1, repeatY = 1) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function createBrickPaverTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#c99f5e";
      ctx.fillRect(0, 0, w, h);
      const bw = 32;
      const bh = 16;
      const tones = ["#d4aa68", "#c29656", "#cca261", "#dbb374"];
      for (let r = 0; r < h / bh; r++) {
        const off = (r % 2) * (bw / 2);
        for (let c = -1; c <= w / bw; c++) {
          ctx.fillStyle = tones[(r * 7 + (c + 2) * 3) % tones.length];
          ctx.fillRect(c * bw + off + 1, r * bh + 1, bw - 2, bh - 2);
        }
      }
    },
    18,
    12,
  );
}

function createRedBrickCladdingTexture() {
  return createCanvasTex(
    256,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = "#a34a43";
      ctx.fillRect(0, 0, w, h);
      const tones = ["#ae544c", "#97423b", "#b85d54", "#9e4841"];
      for (let r = 0; r < 8; r++) {
        const off = (r % 2) * 16;
        for (let c = -1; c < 9; c++) {
          ctx.fillStyle = tones[(r * 5 + c + 3) % tones.length];
          ctx.fillRect(c * 32 + off + 1, r * 16 + 1, 30, 14);
        }
      }
    },
    6,
    2,
  );
}

function createGlassMullionTexture() {
  return createCanvasTex(
    256,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = "#22343d";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#37505c";
      for (let c = 0; c < 4; c++) {
        ctx.fillRect(c * 64 + 6, 8, 52, 52);
        ctx.fillRect(c * 64 + 6, 68, 52, 52);
      }
      ctx.strokeStyle = "#e8eef2";
      ctx.lineWidth = 4;
      for (let c = 0; c <= 4; c++) {
        ctx.beginPath();
        ctx.moveTo(c * 64, 0);
        ctx.lineTo(c * 64, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, 64);
      ctx.lineTo(w, 64);
      ctx.stroke();
    },
    3,
    1,
  );
}

function createBuildingSignTexture() {
  return createCanvasTex(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = "#f2f5f7";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#23889a";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 72px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillStyle = "#946816";
    ctx.fillText("NHÀ THIẾU NHI HUẾ", w / 2 + 2, h / 2 + 3);
    ctx.fillStyle = "#e2ad28";
    ctx.fillText("NHÀ THIẾU NHI HUẾ", w / 2, h / 2);
  });
}

function createGateSignTexture() {
  return createCanvasTex(1536, 256, (ctx, w, h) => {
    ctx.fillStyle = "#0e5d7a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f7d463";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 76px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("TRUNG TÂM THANH THIẾU NHI HUẾ", w / 2, h * 0.42);
    ctx.fillStyle = "#ffe382";
    ctx.font = "bold 48px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("8 LÊ LỢI · KHU VUI CHƠI THIẾU NHI", w / 2, h * 0.78);
  });
}

function createVietnamFlagTexture() {
  return createCanvasTex(256, 170, (ctx, w, h) => {
    ctx.fillStyle = "#da251d";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const outerR = h * 0.31;
    const innerR = outerR * 0.382;
    ctx.fillStyle = "#ffde00";
    ctx.beginPath?.();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo?.(px, py);
      else ctx.lineTo?.(px, py);
    }
    ctx.closePath?.();
    ctx.fill?.();
  });
}

export function youthCampusFrame(feature = byId(config.campusOSM)) {
  const pts = pointsOf(feature);
  const pA = pts[1]; // SW along Lê Lợi
  const pB = pts[0]; // NE along Lê Lợi
  const dx = pB.x - pA.x;
  const dz = pB.z - pA.z;
  const len = Math.hypot(dx, dz) || 1;
  const uAxis = { x: dx / len, z: dz / len };
  const inAxis = { x: -uAxis.z, z: uAxis.x };
  const origin = { x: (pA.x + pB.x) / 2, z: (pA.z + pB.z) / 2 };
  const ry = Math.atan2(-uAxis.z, uAxis.x);

  const toWorld = (side, fwd) => ({
    x: origin.x + side * uAxis.x + fwd * inAxis.x,
    z: origin.z + side * uAxis.z + fwd * inAxis.z,
  });
  const toLocal = (wx, wz) => {
    const vx = wx - origin.x;
    const vz = wz - origin.z;
    return {
      side: vx * uAxis.x + vz * uAxis.z,
      fwd: vx * inAxis.x + vz * inAxis.z,
    };
  };
  return { origin, uAxis, inAxis, ry, toWorld, toLocal };
}

export function expandedYouthCampusRing(feature = byId(config.campusOSM)) {
  const { toWorld } = youthCampusFrame(feature);
  // Expanded safely up to ~14,500 m2 while keeping clear of Lê Lợi, Trần Thúc Nhẫn, Quốc Học, and southern residential road 1572356605
  const localRing = [
    [-33.5, 0.2],
    [-41.0, 1.8],
    [-47.5, 6.8],
    [-51.0, 14.0],
    [-63.0, 74.0],
    [-69.0, 98.0],
    [-73.5, 114.0],
    [-78.5, 139.0],
    [42.5, 139.0],
    [42.5, 12.0],
    [36.5, 0.2],
    [-33.5, 0.2],
  ];
  return localRing.map(([s, f]) => toWorld(s, f));
}

export function playgroundSpots(world, ring, count = config.equipmentCount) {
  const minX = Math.min(...ring.map((p) => p.x)),
    maxX = Math.max(...ring.map((p) => p.x)),
    minZ = Math.min(...ring.map((p) => p.z)),
    maxZ = Math.max(...ring.map((p) => p.z)),
    radius = config.equipmentRadius,
    result = [];
  let seed = 2401;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 9000 && result.length < count; i++) {
    const p = {
      x: minX + random() * (maxX - minX),
      z: minZ + random() * (maxZ - minZ),
    };
    if (
      !inside(p, ring) ||
      nearestPoint(p, ring).distance < radius + 2 ||
      onOtherCarriageway(p, { id: null }, world.renderRoads, radius)
    )
      continue;
    if (
      world.buildingPolygons.some(
        (b) =>
          inside(p, b.points) ||
          nearestPoint(p, b.points).distance < radius + 2,
      )
    )
      continue;
    if (result.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < radius * 2 + 2.5))
      continue;
    result.push({
      ...p,
      radius,
      type: config.types[result.length % config.types.length],
    });
  }
  return result;
}

function createSwingEquipment() {
  const group = new THREE.Group();
  const post = (x, z) =>
    group.add(box([0.16, 2.9, 0.16], "#2c86b5", [x, 1.45, z]));
  for (const x of [-2.2, 2.2]) for (const z of [-1.0, 1.0]) post(x, z);
  group.add(beam([-2.3, 2.85, 0], [2.3, 2.85, 0], 0.1, "#f29d38"));
  const animated = new THREE.Group();
  animated.position.y = 2.8;
  for (const sx of [-0.95, 0.95]) {
    for (const r of [-0.36, 0.36]) {
      animated.add(beam([sx + r, 0, 0], [sx + r, -1.9, 0], 0.024, "#596b73"));
    }
    animated.add(
      box([0.95, 0.14, 0.48], sx < 0 ? "#ef5d48" : "#f5c23e", [sx, -1.9, 0]),
    );
  }
  group.add(animated);
  return { group, animated, type: "swings" };
}

function createSeesawEquipment() {
  const group = new THREE.Group();
  group.add(box([0.55, 0.9, 0.75], "#4a8da3", [0, 0.45, 0]));
  const animated = new THREE.Group();
  animated.position.y = 0.92;
  animated.add(box([4.8, 0.16, 0.48], "#f2be42"));
  for (const side of [-1, 1]) {
    animated.add(
      box([0.7, 0.14, 0.74], side < 0 ? "#e65b4a" : "#3a9ad9", [side * 1.9, 0.12, 0]),
      beam([side * 1.6, 0.1, 0], [side * 1.6, 0.58, 0], 0.04, "#3b5660"),
      beam([side * 1.6, 0.58, -0.22], [side * 1.6, 0.58, 0.22], 0.035, "#3b5660"),
    );
  }
  group.add(animated);
  return { group, animated, type: "seesaw" };
}

function createSandboxEquipment() {
  const group = new THREE.Group();
  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 0.22, 24),
    mat("#edd497", 0.95),
  );
  sand.position.y = 0.11;
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(3.2, 0.18, 8, 28),
    mat("#ba7547", 0.78),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.22;
  group.add(
    sand,
    rim,
    box([0.9, 0.55, 0.9], "#dfba72", [0.8, 0.35, -0.4]),
    box([0.45, 0.4, 0.45], "#dfba72", [0.8, 0.75, -0.4]),
    box([0.5, 0.35, 0.5], "#e65e46", [-0.9, 0.32, 0.6]),
    box([0.6, 0.28, 0.45], "#3b92c9", [-0.2, 0.28, 1.1]),
  );
  return { group, animated: null, type: "sandbox" };
}

function createHeroRollerCoaster() {
  const group = new THREE.Group();
  group.name = "youth-roller-coaster";

  // Elevated undulating closed oval/figure-loop (44m x 26m, height 2.4m .. 7.8m)
  const pts = [];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * 19.5 + Math.sin(a * 2) * 2.2;
    const z = Math.sin(a) * 11.8;
    const y =
      2.65 +
      2.55 * (1 - Math.cos(a)) +
      1.35 * Math.sin(a * 2 + 0.4) * Math.max(0, Math.sin(a * 0.5));
    pts.push(new THREE.Vector3(x, y, z));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.5);

  // Colored steel twin-rail spine + cross ties
  const centerGeo = new THREE.TubeGeometry(curve, 140, 0.22, 8, true);
  const spineMesh = new THREE.Mesh(centerGeo, mat("#e84b3c", 0.42, 0.45));
  spineMesh.castShadow = true;
  group.add(spineMesh);

  const railOffsets = [-0.45, 0.45];
  const sampleCount = 120;
  const up = new THREE.Vector3(0, 1, 0);
  const tieGeos = [];
  for (const offset of railOffsets) {
    const railPts = [];
    for (let i = 0; i < sampleCount; i++) {
      const t = i / sampleCount;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t).normalize();
      const side = new THREE.Vector3().crossVectors(up, tan).normalize();
      railPts.push(p.clone().addScaledVector(side, offset).add(new THREE.Vector3(0, 0.24, 0)));
    }
    const rCurve = new THREE.CatmullRomCurve3(railPts, true);
    const rMesh = new THREE.Mesh(
      new THREE.TubeGeometry(rCurve, 120, 0.08, 6, true),
      mat("#f5c736", 0.35, 0.6),
    );
    rMesh.castShadow = true;
    group.add(rMesh);
  }

  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).normalize();
    const tie = new THREE.BoxGeometry(1.15, 0.1, 0.14);
    const yaw = Math.atan2(tan.x, tan.z);
    tie.rotateY(yaw);
    tie.translate(p.x, p.y + 0.16, p.z);
    tieGeos.push(tie);

    if (i % 3 === 0) {
      const colH = p.y - 0.1;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, colH, 8),
        mat(i % 6 === 0 ? "#2484c6" : "#f2a024", 0.48, 0.4),
      );
      col.position.set(p.x, colH / 2, p.z);
      col.castShadow = true;
      group.add(col);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.36, 0.18, 10),
        mat("#cfd5d8", 0.8),
      );
      base.position.set(p.x, 0.09, p.z);
      group.add(base);
    }
  }
  const tieMesh = new THREE.Mesh(mergeGeometries(tieGeos), mat("#d8e0e6", 0.4, 0.55));
  group.add(tieMesh);
  tieGeos.forEach((g) => g.dispose());

  // Boarding Station Pavilion on front straight (a ~ 0 -> x ~ +19.5, z ~ 0)
  const station = new THREE.Group();
  station.position.set(19.5, 0, 0);
  station.add(
    box([3.6, 0.55, 8.6], "#d9d1c2", [0, 0.28, 0]),
    box([0.16, 3.2, 0.16], "#2484c6", [-1.5, 1.8, -3.6]),
    box([0.16, 3.2, 0.16], "#2484c6", [1.5, 1.8, -3.6]),
    box([0.16, 3.2, 0.16], "#2484c6", [-1.5, 1.8, 3.6]),
    box([0.16, 3.2, 0.16], "#2484c6", [1.5, 3.2 * 0.5 + 0.2, 3.6]),
    box([4.2, 0.28, 9.2], "#e8543e", [0, 3.55, 0]),
    box([4.4, 0.14, 9.4], "#fff0c2", [0, 3.74, 0]),
  );
  group.add(station);

  // 4-Car Animated Coaster Train
  const carColors = ["#ff4e38", "#f7be2e", "#27a5d8", "#48bd6e"];
  const cars = carColors.map((col, idx) => {
    const car = new THREE.Group();
    car.name = `coaster-car-${idx}`;
    car.add(
      box([1.1, 0.58, 1.75], col, [0, 0.45, 0]),
      box([0.96, 0.22, 1.2], "#fff4d9", [0, 0.82, -0.15]),
      box([0.92, 0.35, 0.35], "#273742", [0, 0.72, 0.55]),
    );
    if (idx === 0) {
      const nose = new THREE.Mesh(
        new THREE.ConeGeometry(0.55, 0.85, 8),
        mat("#ffd63b", 0.35, 0.35),
      );
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, 0.46, 1.2);
      car.add(nose);
    }
    group.add(car);
    return car;
  });

  return { group, curve, cars, type: "rollercoaster" };
}

function createHeroSlideTower() {
  const group = new THREE.Group();
  group.name = "youth-multi-slide";

  // Rubberized colorful safety turf pad (16m x 14m)
  group.add(
    box([16.4, 0.1, 14.4], "#509c5a", [0, 0.05, 0]),
    box([12.2, 0.12, 10.2], "#df8354", [0, 0.06, 0]),
  );

  // Main Tower Deck (x: -2.2, z: -1.5) & Secondary Deck (x: +2.6, z: -1.5)
  const posts = [
    [-4.0, -3.2],
    [-0.4, -3.2],
    [-4.0, 0.4],
    [-0.4, 0.4],
    [1.2, -3.0],
    [4.2, -3.0],
    [1.2, 0.2],
    [4.2, 0.2],
  ];
  for (const [px, pz] of posts) {
    const h = px < 0.5 ? 5.2 : 4.2;
    group.add(box([0.22, h, 0.22], "#1f7ab8", [px, h / 2, pz]));
  }
  // Elevated Platforms
  group.add(
    box([4.0, 0.26, 3.8], "#f5b82e", [-2.2, 2.75, -1.4]),
    box([3.4, 0.24, 3.4], "#42b36a", [2.7, 2.1, -1.4]),
    // Connecting arched bridge
    box([1.8, 0.2, 1.8], "#ef6a42", [0.4, 2.42, -1.4]),
  );
  // Bright Turret Roofs
  const roofL = new THREE.Mesh(
    new THREE.ConeGeometry(3.0, 1.9, 4),
    mat("#e84938", 0.55),
  );
  roofL.rotation.y = Math.PI / 4;
  roofL.position.set(-2.2, 6.0, -1.4);
  const roofR = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 1.6, 4),
    mat("#279bd6", 0.55),
  );
  roofR.rotation.y = Math.PI / 4;
  roofR.position.set(2.7, 4.95, -1.4);
  group.add(roofL, roofR);

  // Climbing Steps at back (-Z)
  for (let i = 0; i < 8; i++) {
    group.add(
      box([1.5, 0.14, 0.38], "#ffcf42", [-2.2, 0.35 + i * 0.33, -5.2 + i * 0.25]),
    );
  }
  group.add(
    beam([-3.05, 0.2, -5.3], [-3.05, 3.2, -3.3], 0.06, "#2c8ac4"),
    beam([-1.35, 0.2, -5.3], [-1.35, 3.2, -3.3], 0.06, "#2c8ac4"),
  );

  // Straight Double-Lane Wave Slide (+Z front from Main Tower)
  const waveSlide = box([2.1, 0.16, 5.4], "#f04e37", [-2.2, 1.48, 2.55]);
  waveSlide.rotation.x = 0.48;
  const sideL = box([0.14, 0.45, 5.4], "#ffd147", [-3.22, 1.66, 2.55]);
  sideL.rotation.x = 0.48;
  const sideR = box([0.14, 0.45, 5.4], "#ffd147", [-1.18, 1.66, 2.55]);
  sideR.rotation.x = 0.48;
  group.add(waveSlide, sideL, sideR);

  // Curved Spiral Tube Slide from Tower 2 (+X / +Z sweep)
  const spiralPts = [
    new THREE.Vector3(2.7, 2.1, 0.2),
    new THREE.Vector3(4.2, 1.75, 1.8),
    new THREE.Vector3(5.2, 1.25, 3.6),
    new THREE.Vector3(3.8, 0.72, 5.1),
    new THREE.Vector3(1.8, 0.38, 4.8),
  ];
  const spiralCurve = new THREE.CatmullRomCurve3(spiralPts);
  const spiralMesh = new THREE.Mesh(
    new THREE.TubeGeometry(spiralCurve, 32, 0.46, 12, false),
    mat("#279dd9", 0.32, 0.1),
  );
  spiralMesh.castShadow = true;
  group.add(spiralMesh);

  // Junior Slide on left flank
  const juniorSlide = box([1.25, 0.14, 3.8], "#f5b82e", [-5.4, 1.1, 0.8]);
  juniorSlide.rotation.z = 0.5;
  juniorSlide.rotation.y = Math.PI / 2;
  group.add(juniorSlide);

  return { group, animated: null, type: "slide" };
}

function createSpringFishRider(color, accent, phase) {
  const group = new THREE.Group();
  group.name = "rocking-fish-rider";

  // Rubberized safety disc + base flange
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.2, 0.12, 18),
    mat("#3e8f66", 0.82),
  );
  disc.position.y = 0.06;
  const basePlate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.1, 12),
    mat("#546269", 0.5, 0.6),
  );
  basePlate.position.y = 0.14;
  group.add(disc, basePlate);

  // Visible helical coil spring rings
  const springMat = mat("#c6cfd4", 0.32, 0.78);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.032, 8, 16),
      springMat,
    );
    ring.rotation.x = Math.PI / 2 + 0.12;
    ring.position.y = 0.24 + i * 0.11;
    group.add(ring);
  }

  // Animated sculpted colorful fish body above spring
  const rider = new THREE.Group();
  rider.position.y = 0.66;
  rider.userData.phase = phase;

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.48, 16, 12),
    mat(color, 0.38, 0.08),
  );
  body.scale.set(0.74, 0.86, 1.48);
  body.position.y = 0.38;
  body.castShadow = true;

  // Tail fin
  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.48, 4),
    mat(accent, 0.42),
  );
  tail.rotation.x = -Math.PI / 2;
  tail.scale.set(0.35, 1, 1.2);
  tail.position.set(0, 0.42, -0.78);

  // Dorsal fin
  const dorsal = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.36, 4),
    mat(accent, 0.42),
  );
  dorsal.position.set(0, 0.82, -0.05);
  dorsal.rotation.x = -0.35;

  // Eyes & saddle handlebars
  for (const sx of [-1, 1]) {
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 8, 8),
      mat("#ffffff", 0.2),
    );
    eye.position.set(sx * 0.24, 0.54, 0.48);
    const pupil = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 6, 6),
      mat("#11171b", 0.2),
    );
    pupil.position.set(sx * 0.28, 0.54, 0.52);
    rider.add(eye, pupil);
  }
  rider.add(
    body,
    tail,
    dorsal,
    box([0.52, 0.12, 0.44], accent, [0, 0.72, 0.05]),
    box([0.56, 0.06, 0.06], "#dce3e6", [0, 0.92, 0.32]),
  );
  group.add(rider);
  return { group, rider };
}

function createHeroKiddieCarTrack() {
  const group = new THREE.Group();
  group.name = "youth-kiddie-car-track";

  // Oval loop: straight length 20m, radius 7.5m -> total ~20m x 36m
  const rx = 7.6;
  const rz = 15.2;
  const trackPts = [];
  const samples = 40;
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    trackPts.push(new THREE.Vector3(Math.cos(a) * rx, 0, Math.sin(a) * rz));
  }
  const curve = new THREE.CatmullRomCurve3(trackPts, true);

  // Pave oval base deck + center manicured lawn island + road ribbon
  const outerDeck = new THREE.Mesh(
    new THREE.CylinderGeometry(10.8, 10.8, 0.1, 36),
    mat("#3e464d", 0.86),
  );
  outerDeck.scale.set(1.0, 1, 1.72);
  outerDeck.position.y = 0.05;
  outerDeck.receiveShadow = true;
  group.add(outerDeck);

  const centerLawn = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 4.8, 0.14, 28),
    mat("#4f9948", 0.9),
  );
  centerLawn.scale.set(1.0, 1, 2.35);
  centerLawn.position.y = 0.07;
  group.add(centerLawn);

  // Red & white safety curb blocks + dashed lane stripes along curve
  const curbGeosRed = [];
  const curbGeosWhite = [];
  const dashGeos = [];
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 48; i++) {
    const t = i / 48;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(up, tan).normalize();
    const yaw = Math.atan2(tan.x, tan.z);

    const dash = new THREE.BoxGeometry(0.16, 0.04, 1.2);
    dash.rotateY(yaw);
    dash.translate(p.x, 0.11, p.z);
    dashGeos.push(dash);

    for (const s of [-2.4, 2.4]) {
      const c = new THREE.BoxGeometry(0.32, 0.22, 1.45);
      c.rotateY(yaw);
      c.translate(p.x + side.x * s, 0.16, p.z + side.z * s);
      (i % 2 === 0 ? curbGeosRed : curbGeosWhite).push(c);
    }
  }
  group.add(
    new THREE.Mesh(mergeGeometries(dashGeos), mat("#f5d14b", 0.65)),
    new THREE.Mesh(mergeGeometries(curbGeosRed), mat("#df4b3e", 0.7)),
    new THREE.Mesh(mergeGeometries(curbGeosWhite), mat("#f2f4f5", 0.7)),
  );
  dashGeos.forEach((g) => g.dispose());
  curbGeosRed.forEach((g) => g.dispose());
  curbGeosWhite.forEach((g) => g.dispose());

  // Start / Finish Gantry Gate across West straight (-rx, 0)
  const gantry = new THREE.Group();
  gantry.position.set(-rx, 0, 0);
  gantry.add(
    box([0.24, 3.1, 0.24], "#f4f6f7", [-2.2, 1.55, 0]),
    box([0.24, 3.1, 0.24], "#f4f6f7", [2.2, 1.55, 0]),
    box([4.8, 0.68, 0.3], "#e84938", [0, 3.0, 0]),
    box([4.9, 0.14, 0.36], "#ffd33f", [0, 3.38, 0]),
  );
  group.add(gantry);

  // 4 Animated Kiddie Cars
  const specs = [
    { color: "#f04637", offset: 0.0, speed: 0.055, lane: -0.7 },
    { color: "#2c98df", offset: 0.25, speed: 0.062, lane: 0.7 },
    { color: "#f6be2e", offset: 0.5, speed: 0.052, lane: -0.7 },
    { color: "#4ac173", offset: 0.75, speed: 0.06, lane: 0.7 },
  ];
  const cars = specs.map((spec, idx) => {
    const car = new THREE.Group();
    car.name = `kiddie-car-${idx}`;
    car.userData = { ...spec };
    car.add(
      box([1.15, 0.42, 1.95], spec.color, [0, 0.34, 0]),
      box([0.92, 0.24, 0.72], "#dcebf7", [0, 0.64, 0.12]),
      box([0.95, 0.28, 0.5], "#27333d", [0, 0.56, -0.45]),
      // Headlights
      box([0.18, 0.14, 0.08], "#fff4ab", [-0.36, 0.38, 0.98]),
      box([0.18, 0.14, 0.08], "#fff4ab", [0.36, 0.38, 0.98]),
    );
    const wheelGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.16, 12);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelMat = mat("#23272b", 0.75);
    for (const [wx, wz] of [
      [-0.58, 0.62],
      [0.58, 0.62],
      [-0.58, -0.62],
      [0.58, -0.62],
    ]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.22, wz);
      car.add(w);
    }
    group.add(car);
    return car;
  });

  return { group, curve, cars, type: "kiddie-cars" };
}

function createHeroCarousel() {
  const group = new THREE.Group();
  group.name = "youth-carnival-carousel";

  // Static floor deck
  const deck = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 5.8, 0.24, 32),
    mat("#e8c86b", 0.55),
  );
  deck.position.y = 0.12;
  deck.receiveShadow = true;
  group.add(deck);

  const rotor = new THREE.Group();
  const centerPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.52, 0.72, 4.8, 16),
    mat("#e84d3a", 0.42),
  );
  centerPole.position.y = 2.5;
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(5.6, 2.0, 16),
    mat("#2794d4", 0.45),
  );
  canopy.position.y = 5.4;
  canopy.castShadow = true;
  const trimRing = new THREE.Mesh(
    new THREE.CylinderGeometry(5.65, 5.65, 0.42, 24),
    mat("#f7be31", 0.42),
  );
  trimRing.position.y = 4.35;
  rotor.add(centerPole, canopy, trimRing);

  const seatColors = ["#ef5340", "#f6c133", "#40b672", "#47a8e0"];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const rx = Math.cos(a) * 4.1;
    const rz = Math.sin(a) * 4.1;
    rotor.add(
      beam([rx, 4.2, rz], [rx, 1.3, rz], 0.04, "#e6ecf0"),
      box([0.75, 0.48, 0.75], seatColors[i % seatColors.length], [rx, 1.25, rz]),
    );
  }
  group.add(rotor);
  return { group, animated: rotor, type: "carousel" };
}

function createMotorbikeShelter() {
  const group = new THREE.Group();
  group.name = "motorbike-shelter";
  const steelMat = mat("#64727a", 0.5, 0.6);
  const roof = box([14.2, 0.12, 4.2], "#4c8094", [0, 2.75, 0]);
  roof.rotation.x = 0.12;
  group.add(roof);
  for (const x of [-6.6, -2.2, 2.2, 6.6]) {
    for (const z of [-1.7, 1.7]) {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.07, 2.75, 8),
        steelMat,
      );
      p.position.set(x, 1.38, z);
      group.add(p);
    }
  }
  const bikeColors = ["#27343d", "#b5362e", "#e2e6ea", "#2a629a", "#4a5359", "#c74238"];
  for (let i = 0; i < 6; i++) {
    const bx = -5.4 + i * 2.15;
    const bike = new THREE.Group();
    bike.position.set(bx, 0, 0.2);
    bike.rotation.y = (i % 2 ? 0.08 : -0.06);
    bike.add(
      box([0.42, 0.62, 1.45], bikeColors[i], [0, 0.58, 0]),
      box([0.55, 0.08, 0.18], "#273036", [0, 0.96, 0.48]),
    );
    const wGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 10);
    wGeo.rotateZ(Math.PI / 2);
    for (const wz of [-0.52, 0.52]) {
      const w = new THREE.Mesh(wGeo, mat("#1e2326", 0.8));
      w.position.set(0, 0.24, wz);
      bike.add(w);
    }
    group.add(bike);
  }
  return group;
}

function createCourtyardTree(x, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, 0.18, z);
  g.rotation.y = seed * 1.4;
  const trunkH = 3.1 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.32 * scale, trunkH, 7),
    mat("#68533f", 0.9),
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const greens = ["#346b2d", "#437f38", "#539243"];
  const puffs = [
    [0, trunkH + 1.9 * scale, 0, 2.0 * scale],
    [1.3 * scale, trunkH + 1.35 * scale, 0.8 * scale, 1.45 * scale],
    [-1.3 * scale, trunkH + 1.4 * scale, -0.7 * scale, 1.5 * scale],
    [0.2 * scale, trunkH + 1.45 * scale, -1.3 * scale, 1.4 * scale],
  ];
  puffs.forEach(([px, py, pz, r], idx) => {
    const m = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[idx % greens.length], 0.86),
    );
    m.position.set(px, py, pz);
    m.scale.set(1.15, 0.68, 1.15);
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  });
  return g;
}

function createParkBench(x, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, 0.2, z);
  g.rotation.y = yaw;
  g.add(
    box([1.8, 0.08, 0.48], "#e48c38", [0, 0.44, 0]),
    box([1.8, 0.36, 0.08], "#2d89bd", [0, 0.72, -0.2]),
    box([0.14, 0.44, 0.44], "#3e4e54", [-0.72, 0.22, 0]),
    box([0.14, 0.44, 0.44], "#3e4e54", [0.72, 0.22, 0]),
  );
  return g;
}

export class YouthPlayground {
  constructor(world) {
    this.world = world;
    const feature = byId(config.campusOSM);
    this.frame = youthCampusFrame(feature);
    this.expandedRing = expandedYouthCampusRing(feature);

    // Center main entrance directly along Main Building atrium axis (side = -4.85, fwd = 0.2)
    const placedEntrance = schoolGatePlacement({
      feature,
      anchor: { kind: "area-label" },
    });
    const gateWorld = this.frame.toWorld(-4.85, 0.2);
    this.entrance = {
      ...placedEntrance,
      x: gateWorld.x,
      z: gateWorld.z,
      heading: Math.atan2(-this.frame.inAxis.x, -this.frame.inAxis.z),
    };

    this.segments = campusWallSegments(
      this.expandedRing,
      this.entrance,
      config.entranceWidth,
    );
    this.equipment = [];
    this.animatedObjects = [];
    this.rockingFish = [];
    this.carTracks = [];
    this.rollerCoasters = [];
    this.flags = [];
    this.solidZones = [];

    // Scratch vectors for zero-allocation animations
    this._tmpVecA = new THREE.Vector3();
    this._tmpVecB = new THREE.Vector3();
    this._tmpVecC = new THREE.Vector3();
    this._tmpUp = new THREE.Vector3(0, 1, 0);

    // 1. Expanded Perimeter Fence (turquoise steel pickets over brick plinth)
    this.buildFence(world);

    // 2. Modern Entrance Gate along Lê Lợi
    this.buildGate(world);

    // 3. Root Campus Local Group aligned with Lê Lợi frontage (+X = side, +Z = fwd)
    this.campusGroup = new THREE.Group();
    this.campusGroup.name = "youth-center-campus";
    this.campusGroup.position.set(this.frame.origin.x, 0, this.frame.origin.z);
    this.campusGroup.rotation.y = this.frame.ry;
    world.scene.add(this.campusGroup);

    // 4. Expanded Grounds Paving, Brick Courtyard, Circular Lotus Pond & Crescent Gardens
    this.buildCourtyardAndPaths();

    // 5. Hero Main Building ("NHÀ THIẾU NHI HUẾ" matching photo)
    this.buildMainBuilding();

    // 6. Expanded Children's Amusement Park Zones (Roller Coaster, Slides, Rocking Fish, Kiddie Cars, Carousel, Swings, Seesaws, Sandbox)
    this.buildAmusementZones();

    // Register legacy playgroundAreas for grass/tree clearances & tests
    this.spots = playgroundSpots(world, this.expandedRing);
    world.playgroundAreas = this.spots;

    if (world.treePositions) {
      world.treePositions = world.treePositions.filter(
        (p) => !this.blocksTree(p.x, p.z),
      );
    }
  }

  toWorld(side, fwd) {
    return this.frame.toWorld(side, fwd);
  }

  toLocal(wx, wz) {
    return this.frame.toLocal(wx, wz);
  }

  inCampus(wx, wz) {
    return inside({ x: wx, z: wz }, this.expandedRing);
  }

  buildFence(world) {
    const fenceParts = [];
    const plinthParts = [];
    for (const { a, b } of this.segments) {
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      if (length < 0.08) continue;
      const plinth = beam([a.x, 0.25, a.z], [b.x, 0.25, b.z], 0.14, "#b25b4e");
      plinth.updateMatrix();
      plinthParts.push(plinth.geometry.clone().applyMatrix4(plinth.matrix));
      plinth.geometry.dispose();

      for (const height of [0.5, config.fenceHeight]) {
        const part = beam(
          [a.x, height, a.z],
          [b.x, height, b.z],
          0.04,
          config.fenceColor,
        );
        part.updateMatrix();
        fenceParts.push(part.geometry.clone().applyMatrix4(part.matrix));
        part.geometry.dispose();
      }
      for (let d = 0; d <= length; d += 0.85) {
        const t = d / length;
        const part = box(
          [0.06, config.fenceHeight - 0.35, 0.06],
          config.fenceColor,
          [
            a.x + (b.x - a.x) * t,
            0.35 + (config.fenceHeight - 0.35) / 2,
            a.z + (b.z - a.z) * t,
          ],
        );
        part.updateMatrix();
        fenceParts.push(part.geometry.clone().applyMatrix4(part.matrix));
        part.geometry.dispose();
      }
    }
    if (fenceParts.length) {
      const fenceMesh = new THREE.Mesh(
        mergeGeometries(fenceParts),
        mat(config.fenceColor, 0.65, 0.25),
      );
      fenceMesh.castShadow = true;
      world.scene.add(fenceMesh);
      world.cameraObstacles.push(fenceMesh);
      fenceParts.forEach((g) => g.dispose());
    }
    if (plinthParts.length) {
      const plinthMesh = new THREE.Mesh(
        mergeGeometries(plinthParts),
        mat("#b25b4e", 0.85),
      );
      plinthMesh.castShadow = plinthMesh.receiveShadow = true;
      world.scene.add(plinthMesh);
      plinthParts.forEach((g) => g.dispose());
    }
    world.campusWallSegments.push(
      ...this.segments.map((s) => ({ ...s, schoolId: "youth-center" })),
    );
  }

  buildGate(world) {
    this.gate = new THREE.Group();
    this.gate.name = "youth-center-main-gate";
    const halfW = config.entranceWidth / 2;
    for (const side of [-1, 1]) {
      this.gate.add(
        box([0.85, 0.45, 0.85], "#a64c43", [side * halfW, 0.22, 0]),
        box([0.68, 4.6, 0.68], "#f4f6f7", [side * halfW, 2.5, 0]),
        box([0.92, 0.22, 0.92], "#1f7d8c", [side * halfW, 4.9, 0]),
      );
    }
    this.gate.add(
      box([config.entranceWidth + 1.2, 0.34, 0.72], "#1f7d8c", [0, 4.72, 0]),
      box([config.entranceWidth + 1.5, 0.16, 0.92], "#f4f6f7", [0, 5.0, 0]),
      box([config.entranceWidth - 0.8, 0.1, 14], "#cfa668", [0, -0.04, -3]),
    );

    const signTex = createGateSignTexture();
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(8.8, 1.38),
      new THREE.MeshStandardMaterial({
        map: signTex,
        side: THREE.DoubleSide,
        roughness: 0.45,
      }),
    );
    panel.name = "gate-name-panel";
    panel.position.set(0, 4.45, 0.42);
    this.gate.add(panel);

    const backPanel = panel.clone();
    backPanel.position.z = -0.42;
    backPanel.rotation.y = Math.PI;
    this.gate.add(backPanel);

    this.gate.position.set(this.entrance.x, 0.17, this.entrance.z);
    this.gate.rotation.y = this.entrance.heading;
    world.scene.add(this.gate);

    world.entranceClearances = [
      ...(world.entranceClearances || []),
      { ...this.entrance, width: config.entranceWidth },
    ];
  }

  buildCourtyardAndPaths() {
    const brickTex = createBrickPaverTexture();
    const brickMat = new THREE.MeshStandardMaterial({
      color: brickTex ? "#ffffff" : "#c99f5e",
      map: brickTex,
      roughness: 0.82,
      side: THREE.DoubleSide,
    });
    const lawnTex = createManicuredLawnTexture(14, 14, {
      striped: true,
      rich: true,
    });
    const lawnMat = new THREE.MeshStandardMaterial({
      color: lawnTex ? "#ffffff" : "#559646",
      map: lawnTex,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const walkMat = mat("#d5cab3", 0.84);

    // Full green campus ground pad so internal paths & rides never expose raw asphalt
    const campusShape = new THREE.Shape(
      [
        [-33.2, 0.5],
        [-40.8, 2.0],
        [-47.2, 6.8],
        [-50.8, 14.0],
        [-62.6, 74.0],
        [-68.6, 98.0],
        [-73.2, 114.0],
        [-78.0, 138.5],
        [42.0, 138.5],
        [42.0, 12.0],
        [36.2, 0.5],
      ].map(([s, f]) => new THREE.Vector2(s, -f)),
    );
    const turfGeo = new THREE.ExtrudeGeometry(campusShape, {
      depth: 0.14,
      bevelEnabled: false,
    });
    turfGeo.rotateX(-Math.PI / 2);
    const turfMesh = new THREE.Mesh(turfGeo, lawnMat);
    turfMesh.position.y = 0.04;
    turfMesh.receiveShadow = true;
    this.campusGroup.add(turfMesh);

    // Wide Tan-Brick Front Courtyard matching image_052b7c49.png (side: -35..+27, fwd: 1.5..41.5)
    const frontPlaza = new THREE.Mesh(new THREE.BoxGeometry(62, 0.08, 40), brickMat);
    frontPlaza.position.set(-4.85, 0.18, 21.2);
    frontPlaza.receiveShadow = true;
    this.campusGroup.add(frontPlaza);

    // Circular Brick-Curbed Fountain / Lotus Pond in front of entrance (side: -4.85, fwd: 20.5)
    const fx = -4.85;
    const fz = 20.5;
    const pondOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(6.0, 6.2, 0.44, 36),
      mat("#a85447", 0.8),
    );
    pondOuter.position.set(fx, 0.4, fz);
    pondOuter.castShadow = pondOuter.receiveShadow = true;
    const pondRim = new THREE.Mesh(
      new THREE.TorusGeometry(5.85, 0.24, 8, 36),
      mat("#d9d3c6", 0.72),
    );
    pondRim.rotation.x = Math.PI / 2;
    pondRim.position.set(fx, 0.64, fz);
    const pondWater = new THREE.Mesh(
      new THREE.CylinderGeometry(5.55, 5.55, 0.1, 32),
      new THREE.MeshPhysicalMaterial({
        color: "#2c8279",
        roughness: 0.16,
        clearcoat: 1,
      }),
    );
    pondWater.position.set(fx, 0.48, fz);
    this.campusGroup.add(pondOuter, pondRim, pondWater);

    // Floating lily pads in pond
    for (let i = 0; i < 14; i++) {
      const a = i * 1.9;
      const r = 1.4 + (i % 4) * 0.95;
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.32, 0.03, 10),
        mat("#498e41", 0.78),
      );
      pad.position.set(fx + Math.cos(a) * r, 0.54, fz + Math.sin(a) * r);
      this.campusGroup.add(pad);
    }
    this.solidZones.push({ kind: "circle", side: fx, fwd: fz, radius: 6.4 });

    // Symmetrical Crescent Grass Planters around front pond (matching image_052b7c49.png)
    for (const sx of [-1, 1]) {
      const bed = new THREE.Mesh(
        new THREE.CylinderGeometry(4.6, 4.9, 0.18, 18, 1, false, 0, Math.PI),
        lawnMat,
      );
      bed.position.set(fx + sx * 12.2, 0.24, fz);
      bed.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      bed.receiveShadow = true;
      this.campusGroup.add(bed);
    }

    // Continuous Walkways linking Front Plaza -> East Rides -> Back Coaster & Slide Tower -> West Playgrounds
    const paths = [
      // East promenade past main hall to Kiddie Cars & Coaster
      { s: 27.5, f: 75, w: 6.5, l: 108 },
      // West promenade past auditorium wing to Rocking Fish & Carousel
      { s: -42.5, f: 86, w: 6.5, l: 104 },
      // Back main east-west park boulevard connecting all rear attractions
      { s: -16, f: 99, w: 108, l: 6.5 },
      // Outer loop behind Coaster & Slide Tower
      { s: -18, f: 135, w: 104, l: 4.5 },
    ];
    for (const p of paths) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(p.w, 0.08, p.l), walkMat);
      m.position.set(p.s, 0.18, p.f);
      m.receiveShadow = true;
      this.campusGroup.add(m);
    }

    // Lush framing courtyard trees on outer flanks (keeping center facade clear!)
    const trees = [
      [-28.5, 11.5, 1.1],
      [-31.5, 25.0, 1.2],
      [21.5, 11.5, 1.15],
      [25.5, 27.5, 1.1],
      [35.5, 42.0, 1.05],
      [-48.0, 44.0, 1.1],
      [-64.5, 102.0, 1.15],
      [38.5, 104.0, 1.1],
      [-36.0, 134.0, 1.05],
      [38.0, 134.0, 1.05],
    ];
    trees.forEach(([tx, tz, sc], idx) => {
      this.campusGroup.add(createCourtyardTree(tx, tz, sc, idx + 1));
    });

    // Colorful Park Benches around fountain & rear amusement promenade
    for (const [bx, bz, yaw] of [
      [-15.5, 12.0, 0.3],
      [6.0, 12.0, -0.3],
      [-38.5, 97.0, 0],
      [-8.0, 97.0, 0],
      [22.0, 97.0, 0],
      [-40.5, 126.0, Math.PI / 2],
    ]) {
      this.campusGroup.add(createParkBench(bx, bz, yaw));
    }
  }

  buildMainBuilding() {
    const cx = -4.85;
    const g = new THREE.Group();
    g.name = "nha-thieu-nhi-hue-building";
    g.position.set(cx, 0.2, 0);

    const brickTex = createRedBrickCladdingTexture();
    const brickMat = new THREE.MeshStandardMaterial({
      color: brickTex ? "#ffffff" : "#a34a43",
      map: brickTex,
      roughness: 0.85,
    });
    const whiteMat = mat("#f4f6f7", 0.72);
    const glassTex = createGlassMullionTexture();
    const glassMat = new THREE.MeshStandardMaterial({
      color: glassTex ? "#ffffff" : "#253944",
      map: glassTex,
      roughness: 0.22,
      metalness: 0.35,
    });
    const roofMat = mat("#9a353a", 0.65);

    // Helper for 2-story flanking wing
    const addWing = (xCenter, width, zCenter, depth) => {
      // Ground brick cladding (y: 0..3.6m) + White upper story (y: 3.6..8.2m)
      const lower = new THREE.Mesh(
        new THREE.BoxGeometry(width, 3.6, depth),
        brickMat,
      );
      lower.position.set(xCenter, 1.8, zCenter);
      lower.castShadow = lower.receiveShadow = true;

      const upper = new THREE.Mesh(
        new THREE.BoxGeometry(width, 4.6, depth),
        whiteMat,
      );
      upper.position.set(xCenter, 5.9, zCenter);
      upper.castShadow = upper.receiveShadow = true;

      // White structural columns along front & back of wing
      for (let i = -2; i <= 2; i++) {
        const px = xCenter + (i * width) / 4.3;
        g.add(
          box([0.45, 8.2, depth + 0.36], "#f5f7f8", [px, 4.1, zCenter]),
        );
      }

      // Ribbon dark glass windows on front face (-Z local facing Lê Lợi)
      const frontWinZ = zCenter - depth / 2 - 0.04;
      for (const wy of [2.1, 5.9]) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(width - 1.6, 1.95),
          glassMat,
        );
        win.position.set(xCenter, wy, frontWinZ);
        win.rotation.y = Math.PI;
        g.add(win);
      }

      // Overhanging white soffit & red hip roof
      g.add(
        lower,
        upper,
        box([width + 1.8, 0.28, depth + 1.8], "#f4f6f7", [xCenter, 8.34, zCenter]),
      );
      const roof = new THREE.Mesh(
        new THREE.ConeGeometry(Math.max(width, depth) * 0.72, 2.2, 4),
        roofMat,
      );
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(width / Math.max(width, depth), 1, depth / Math.max(width, depth));
      roof.position.set(xCenter, 9.5, zCenter);
      roof.castShadow = true;
      g.add(roof);
    };

    // Left Wing & Right Wing (each 18.8m wide, z = 51.0, depth = 13.8m)
    addWing(-18.6, 18.8, 51.0, 13.8);
    addWing(18.6, 18.8, 51.0, 13.8);

    // Rear Auditorium Hall behind left wing (side offset -23.5, z = 75.5, depth = 35m)
    addWing(-23.5, 19.5, 75.5, 35.0);

    // Central 3-Story Projecting Pavilion (width 18.6m, z: 40.6..61.8, height 12.6m)
    const centerBody = new THREE.Mesh(
      new THREE.BoxGeometry(18.6, 12.6, 21.2),
      whiteMat,
    );
    centerBody.position.set(0, 6.3, 51.2);
    centerBody.castShadow = centerBody.receiveShadow = true;
    const centerBase = new THREE.Mesh(
      new THREE.BoxGeometry(18.68, 3.6, 21.28),
      brickMat,
    );
    centerBase.position.set(0, 1.8, 51.2);
    g.add(centerBody, centerBase);

    // 4 Tall White Front Pier Columns framing central pavilion
    for (const px of [-8.8, -4.4, 4.4, 8.8]) {
      g.add(box([0.75, 12.6, 0.9], "#f8fafb", [px, 6.3, 40.5]));
    }

    // Tall Central Semicircular Arched Glass Atrium facing Lê Lợi (z = 40.52)
    const archGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(7.2, 6.2),
      glassMat,
    );
    archGlass.position.set(0, 4.9, 40.52);
    archGlass.rotation.y = Math.PI;
    const archCircle = new THREE.Mesh(
      new THREE.CircleGeometry(3.6, 24, 0, Math.PI),
      glassMat,
    );
    archCircle.position.set(0, 7.2, 40.5);
    archCircle.rotation.y = Math.PI;
    const archTrim = new THREE.Mesh(
      new THREE.TorusGeometry(3.65, 0.22, 8, 28, Math.PI),
      whiteMat,
    );
    archTrim.position.set(0, 7.2, 40.42);
    g.add(archGlass, archCircle, archTrim);

    // Flanking 2nd floor glass bays + ground white bulletin boards on center pavilion
    for (const sx of [-6.6, 6.6]) {
      const bayWin = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.2),
        glassMat,
      );
      bayWin.position.set(sx, 6.2, 40.52);
      bayWin.rotation.y = Math.PI;
      g.add(
        bayWin,
        box([3.2, 1.55, 0.14], "#edf1f4", [sx, 3.05, 40.42]),
      );
    }

    // Upper Frieze: White Louvers + Turquoise Emblem + "NHÀ THIẾU NHI HUẾ" Gold Sign
    const signTex = createBuildingSignTexture();
    const mainSign = new THREE.Mesh(
      new THREE.PlaneGeometry(9.6, 1.45),
      new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.42,
        side: THREE.DoubleSide,
      }),
    );
    mainSign.name = "nha-thieu-nhi-facade-sign";
    mainSign.position.set(0, 9.65, 40.46);
    mainSign.rotation.y = Math.PI;
    g.add(mainSign);

    // White horizontal louvers & turquoise diamond emblem at y = 11.4m
    for (const ly of [10.85, 11.15, 11.45, 11.75]) {
      g.add(box([7.8, 0.08, 0.24], "#edf2f5", [0, ly, 40.42]));
    }
    const emblem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.78, 0),
      mat("#2ba0b0", 0.35, 0.2),
    );
    emblem.scale.set(1, 1, 0.25);
    emblem.position.set(0, 11.3, 40.28);
    g.add(emblem);

    // Deep Overhanging White Soffit Roof + Central Triangular Gable + Red Hip Roof
    g.add(
      box([21.2, 0.38, 23.6], "#f5f7f8", [0, 12.75, 51.2]),
      box([6.8, 0.28, 1.2], "#ffffff", [0, 13.25, 39.7]),
    );
    const gable = new THREE.Mesh(
      new THREE.ConeGeometry(3.8, 1.5, 4),
      whiteMat,
    );
    gable.rotation.y = Math.PI / 4;
    gable.scale.set(1.3, 1, 0.3);
    gable.position.set(0, 13.55, 39.8);
    const centerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(13.5, 2.7, 4),
      roofMat,
    );
    centerRoof.rotation.y = Math.PI / 4;
    centerRoof.scale.set(1.05, 1, 1.1);
    centerRoof.position.set(0, 14.2, 51.2);
    centerRoof.castShadow = true;
    g.add(gable, centerRoof);

    // Entrance Canopy Portico (z: 35.8..40.6, matching red-tiled porch & Vietnam flag in photo!)
    g.add(
      box([6.4, 0.45, 4.8], "#d8d4ca", [0, 0.22, 38.2]),
      box([7.2, 0.22, 1.2], "#d2cec4", [0, 0.11, 35.4]),
    );
    for (const px of [-2.8, 2.8]) {
      for (const pz of [36.2, 39.8]) {
        g.add(
          box([0.55, 1.0, 0.55], "#a34a43", [px, 0.9, pz]),
          box([0.42, 2.6, 0.42], "#f5f7f8", [px, 2.55, pz]),
        );
      }
    }
    const porchRoof = new THREE.Mesh(
      new THREE.ConeGeometry(4.8, 1.45, 4),
      mat("#a8383b", 0.58),
    );
    porchRoof.rotation.y = Math.PI / 4;
    porchRoof.scale.set(1.12, 1, 0.88);
    porchRoof.position.set(0, 4.55, 38.0);
    porchRoof.castShadow = true;
    g.add(
      box([7.2, 0.24, 5.4], "#f4f6f7", [0, 3.85, 38.0]),
      porchRoof,
    );

    // Flagpole rising from entrance porch + animated waving Vietnam flag
    const flagTex = createVietnamFlagTexture();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 5.6, 8),
      mat("#dce2e6", 0.28, 0.8),
    );
    pole.position.set(0, 7.0, 36.6);
    const flagGeo = new THREE.PlaneGeometry(1.65, 1.1, 12, 6);
    flagGeo.translate(0.825, 0, 0);
    const basePos = new Float32Array(flagGeo.attributes.position.array);
    const flagMesh = new THREE.Mesh(
      flagGeo,
      new THREE.MeshStandardMaterial({
        map: flagTex,
        side: THREE.DoubleSide,
        roughness: 0.6,
      }),
    );
    flagMesh.position.set(0.04, 9.2, 36.6);
    flagMesh.userData.basePos = basePos;
    g.add(pole, flagMesh);
    this.flags.push(flagMesh);
    this.animatedObjects.push(flagMesh);

    // Left-Wing Motorbike Awning & Notice Boards (matching left side of photo!)
    const shelter = createMotorbikeShelter();
    shelter.position.set(-20.2, 0, 41.6);
    g.add(shelter);

    // Right-Wing Blue Notice Board
    g.add(box([2.2, 2.6, 0.25], "#1d4f82", [23.8, 1.6, 42.6]));

    this.campusGroup.add(g);
    this.world.cameraObstacles.push(centerBody);

    // Solid zones for riding collision around main building
    this.solidZones.push(
      { kind: "box", minS: -32.8, maxS: 23.8, minF: 36.0, maxF: 61.8 },
      { kind: "box", minS: -39.5, maxS: -13.5, minF: 57.0, maxF: 97.5 },
    );
  }

  buildAmusementZones() {
    // 1. TÀU LƯỢN SIÊU TỐC MINI (Back-East Amusement Zone: side = +14.5, fwd = 117.5)
    const coaster = createHeroRollerCoaster();
    coaster.group.position.set(14.5, 0.2, 117.5);
    this.campusGroup.add(coaster.group);
    this.rollerCoasters.push(coaster);
    this.animatedObjects.push(...coaster.cars);
    this.solidZones.push({
      kind: "box",
      minS: 32.0,
      maxS: 36.5,
      minF: 112.5,
      maxF: 122.5,
    });

    // 2. KHU LÁI XE Ô TÔ THIẾU NHI (East-Side Driving Circuit: side = +26.5, fwd = 78.0)
    const carTrack = createHeroKiddieCarTrack();
    carTrack.group.position.set(26.5, 0.2, 78.0);
    this.campusGroup.add(carTrack.group);
    this.carTracks.push(carTrack);
    this.animatedObjects.push(...carTrack.cars);
    this.solidZones.push({
      kind: "box",
      minS: 21.5,
      maxS: 31.5,
      minF: 66.5,
      maxF: 89.5,
    });

    // 3. TỔ HỢP CẦU TRƯỢT ĐA SẮC (Back-Center Adventure Slides: side = -23.5, fwd = 117.0)
    const slideTower = createHeroSlideTower();
    slideTower.group.position.set(-23.5, 0.2, 117.0);
    this.campusGroup.add(slideTower.group);
    this.equipment.push(slideTower);
    this.solidZones.push({
      kind: "box",
      minS: -28.5,
      maxS: -18.5,
      minF: 112.0,
      maxF: 122.5,
    });

    // 4. BÃI CÁ LẮC LÒ XO (West-Side Zone: side = -55.5, fwd = 86.0)
    const fishSpecs = [
      [-60.5, 79.5, "#ff6a2e", "#ffd542", 0.0, 0.4],
      [-54.5, 79.5, "#239be2", "#b8e6ff", 1.1, -0.3],
      [-49.0, 82.0, "#f6b728", "#ffea85", 2.2, 0.2],
      [-61.5, 89.0, "#ef5d94", "#ffd1e3", 3.3, -0.5],
      [-55.5, 91.5, "#2db8a0", "#b8f5e8", 4.1, 0.1],
      [-49.5, 91.0, "#8866dd", "#dfd1ff", 5.0, -0.2],
    ];
    for (const [fx, fz, col, acc, phase, yaw] of fishSpecs) {
      const fish = createSpringFishRider(col, acc, phase);
      fish.group.position.set(fx, 0.2, fz);
      fish.group.rotation.y = yaw;
      this.campusGroup.add(fish.group);
      this.rockingFish.push(fish.rider);
      this.animatedObjects.push(fish.rider);
      this.solidZones.push({ kind: "circle", side: fx, fwd: fz, radius: 1.3 });
    }

    // 5. ĐU QUAY GHẾ BAY (West-Back Corner: side = -56.0, fwd = 118.0)
    const carousel = createHeroCarousel();
    carousel.group.position.set(-56.0, 0.2, 118.0);
    this.campusGroup.add(carousel.group);
    this.equipment.push(carousel);
    this.animatedObjects.push(carousel.group);
    this.solidZones.push({ kind: "circle", side: -56.0, fwd: 118.0, radius: 5.8 });

    // 6. XÍCH ĐU, BẬP BÊNH & SÂN CÁT (West Front & Mid Lawns)
    const swing1 = createSwingEquipment();
    swing1.group.position.set(-48.0, 0.2, 52.0);
    swing1.group.rotation.y = 0.25;
    this.campusGroup.add(swing1.group);
    this.equipment.push(swing1);
    this.animatedObjects.push(swing1.group);

    const swing2 = createSwingEquipment();
    swing2.group.position.set(-52.5, 0.2, 61.0);
    swing2.group.rotation.y = -0.2;
    this.campusGroup.add(swing2.group);
    this.equipment.push(swing2);
    this.animatedObjects.push(swing2.group);

    const seesaw1 = createSeesawEquipment();
    seesaw1.group.position.set(-44.0, 0.2, 70.0);
    this.campusGroup.add(seesaw1.group);
    this.equipment.push(seesaw1);
    this.animatedObjects.push(seesaw1.group);

    const seesaw2 = createSeesawEquipment();
    seesaw2.group.position.set(-68.5, 0.2, 128.0);
    seesaw2.group.rotation.y = 0.6;
    this.campusGroup.add(seesaw2.group);
    this.equipment.push(seesaw2);
    this.animatedObjects.push(seesaw2.group);

    const sandbox = createSandboxEquipment();
    sandbox.group.position.set(-46.0, 0.2, 36.0);
    this.campusGroup.add(sandbox.group);
    this.equipment.push(sandbox);
    this.solidZones.push({ kind: "circle", side: -46.0, fwd: 36.0, radius: 3.3 });
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.2) return null;
    return 0.22;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    const { side, fwd } = this.toLocal(wx, wz);
    for (const z of this.solidZones) {
      if (z.kind === "circle") {
        if (Math.hypot(side - z.side, fwd - z.fwd) <= z.radius) return false;
      } else {
        if (
          side >= z.minS &&
          side <= z.maxS &&
          fwd >= z.minF &&
          fwd <= z.maxF
        ) {
          return false;
        }
      }
    }
    return true;
  }

  blocksGrass(wx, wz) {
    if (!this.inCampus(wx, wz)) return false;
    const { side, fwd } = this.toLocal(wx, wz);
    // Block wild grass on brick plaza, building footprint, paths, coaster/car track decks & slide safety pads
    if (fwd >= 0 && fwd <= 41.5 && side >= -36 && side <= 28) return true;
    if (side >= -33 && side <= 24 && fwd >= 36 && fwd <= 62) return true;
    if (side >= -40 && side <= -13 && fwd >= 57 && fwd <= 98) return true;
    if (side >= 16 && side <= 37 && fwd >= 58 && fwd <= 98) return true; // kiddie cars
    if (side >= -10 && side <= 39 && fwd >= 101 && fwd <= 137) return true; // coaster
    if (side >= -33 && side <= -14 && fwd >= 107 && fwd <= 127) return true; // slide tower
    if (Math.hypot(side - -56, fwd - 118) < 6.4) return true; // carousel
    if (Math.hypot(side - -46, fwd - 36) < 4.0) return true; // sandbox
    if (fwd >= 95 && fwd <= 103 && side >= -72 && side <= 39) return true; // main promenade
    if (side >= 24 && side <= 31 && fwd >= 20 && fwd <= 132) return true; // east walk
    if (side >= -46 && side <= -39 && fwd >= 32 && fwd <= 137) return true; // west walk
    return false;
  }

  blocksTree(wx, wz) {
    if (this.inCampus(wx, wz)) return true;
    return Math.hypot(wx - this.entrance.x, wz - this.entrance.z) < 16.5;
  }

  update(time) {
    for (const e of this.equipment) {
      if (!e.animated) continue;
      if (e.type === "carousel") e.animated.rotation.y = time * 0.48;
      else if (e.type === "swings")
        e.animated.rotation.x = Math.sin(time * 1.45) * 0.34;
      else e.animated.rotation.z = Math.sin(time * 1.35) * 0.16;
    }

    // Rocking fish springs oscillate briskly at varied phases
    for (const rider of this.rockingFish) {
      const p = rider.userData.phase || 0;
      const wave = Math.sin(time * 2.6 + p);
      rider.rotation.x = wave * 0.24;
      rider.position.y = 0.66 + Math.abs(wave) * 0.04;
    }

    // Kiddie cars cruise around the mini oval driving circuit
    for (const track of this.carTracks) {
      for (const car of track.cars) {
        const u = (time * car.userData.speed + car.userData.offset) % 1;
        const pos = track.curve.getPointAt(u, this._tmpVecA);
        const tan = track.curve.getTangentAt(u, this._tmpVecB).normalize();
        const sideX = tan.z;
        const sideZ = -tan.x;
        car.position.set(
          pos.x + sideX * car.userData.lane,
          0.11,
          pos.z + sideZ * car.userData.lane,
        );
        car.rotation.y = Math.atan2(tan.x, tan.z);
      }
    }

    // Mini Roller Coaster 4-car train glides smoothly along 3D elevated spline
    for (const coaster of this.rollerCoasters) {
      const baseU = (time * 0.085) % 1;
      for (let i = 0; i < coaster.cars.length; i++) {
        const car = coaster.cars[i];
        const u = (baseU - i * 0.017 + 1) % 1;
        const pos = coaster.curve.getPointAt(u, this._tmpVecA);
        const tan = coaster.curve.getTangentAt(u, this._tmpVecB).normalize();
        car.position.set(pos.x, pos.y + 0.22, pos.z);
        car.rotation.order = "YXZ";
        car.rotation.y = Math.atan2(tan.x, tan.z);
        car.rotation.x = -Math.asin(Math.max(-0.98, Math.min(0.98, tan.y)));
      }
    }

    // Waving Vietnam flag atop main entrance portico
    for (const flag of this.flags) {
      const posAttr = flag.geometry.attributes.position;
      const basePos = flag.userData.basePos;
      if (!basePos) continue;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const factor = Math.max(0, bx / 1.65);
        posAttr.setZ(
          i,
          Math.sin(bx * 3.8 - time * 5.2 + by * 1.4) * 0.14 * factor,
        );
      }
      posAttr.needsUpdate = true;
    }
  }
}
