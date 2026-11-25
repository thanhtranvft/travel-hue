import * as THREE from "three";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnTexture } from "../../../../core/world/turfTextures.js";

function createCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
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

function createFountainGraniteTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#d4d0c7";
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let r = 0; r < h / tile; r++) {
        for (let c = 0; c < w / tile; c++) {
          const shade = ((r * 7 + c * 11) % 5) * 3 - 6;
          ctx.fillStyle = `rgb(${210 + shade}, ${206 + shade}, ${196 + shade})`;
          ctx.fillRect(c * tile + 1, r * tile + 1, tile - 2, tile - 2);
        }
      }
      // Wet glossy granite sheen bands & subtle joints
      ctx.strokeStyle = "rgba(128, 125, 118, 0.34)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += tile) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
    },
    10,
    10,
  );
}

function createMarigoldLawnTexture() {
  return createManicuredLawnTexture(10, 8, { striped: true, rich: true });
}

function createMarigoldBloomTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#e8ad14";
      ctx.fillRect(0, 0, w, h);
      const tones = ["#ffd624", "#f5be10", "#ffdf48", "#d9980e", "#5b8c32"];
      for (let i = 0; i < 950; i++) {
        const x = (i * 113) % w;
        const y = (i * 199) % h;
        const r = 3 + (i % 4);
        ctx.fillStyle = tones[i % 9 === 0 ? 4 : i % 4];
        if (typeof ctx.arc === "function") {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(x - r, y - r, r * 2, r * 2);
        }
      }
    },
    3,
    3,
  );
}

function createScallopedCopingGeometry(outerR, innerR, lobes, height, segments = 96) {
  const outerShape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = outerR + 0.85 * Math.cos(lobes * a);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) outerShape.moveTo(x, y);
    else outerShape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = innerR + 0.78 * Math.cos(lobes * a);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  outerShape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(outerShape, {
    depth: height,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.05,
    bevelSegments: 2,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createScallopedWaterGeometry(radius, lobes, segments = 96) {
  const shape = new THREE.Shape();
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const r = radius + 0.78 * Math.cos(lobes * a);
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createCornerParterre(sx, sz, cx, cz, marigoldMat) {
  // Formal wedge/quadrant bed matching aerial photo: trimmed green hedge + golden marigold core
  const g = new THREE.Group();
  const innerR = 21.8;
  const outerX = 22.8;
  const outerZ = 22.5;
  const shape = new THREE.Shape();
  const steps = 16;
  // Inner curved arc facing central circle, outer straight garden borders
  const startA = sx > 0 && sz > 0 ? 0.24 : sx < 0 && sz > 0 ? Math.PI / 2 + 0.24 : sx < 0 && sz < 0 ? Math.PI + 0.24 : Math.PI * 1.5 + 0.24;
  const endA = startA + Math.PI / 2 - 0.48;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = startA + ((endA - startA) * i) / steps;
    pts.push([Math.cos(a) * innerR, Math.sin(a) * innerR]);
  }
  // Outer corner point + intermediate wing corners
  const cornerX = sx * outerX;
  const cornerZ = sz * outerZ;
  shape.moveTo(pts[0][0], -pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    shape.lineTo(pts[i][0], -pts[i][1]);
  }
  shape.lineTo(cornerX * 0.3, -cornerZ);
  shape.lineTo(cornerX, -cornerZ);
  shape.lineTo(cornerX, -cornerZ * 0.3);
  shape.closePath();

  const hedgeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.34,
    bevelEnabled: false,
  });
  hedgeGeo.rotateX(-Math.PI / 2);
  const hedge = new THREE.Mesh(hedgeGeo, mat("#38702b", 0.88));
  hedge.position.set(cx, 0.22, cz);
  hedge.castShadow = hedge.receiveShadow = true;
  g.add(hedge);

  // Golden marigold flower mound inside each quadrant
  const flowerX = cx + sx * 16.4;
  const flowerZ = cz + sz * 16.4;
  const marigold = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 16, 10),
    marigoldMat,
  );
  marigold.position.set(flowerX, 0.36, flowerZ);
  marigold.scale.set(1.18, 0.14, 1.18);
  marigold.receiveShadow = true;
  g.add(marigold);

  // Trim clipped ornamental spheres along the outer edge
  for (let k = 0; k < 3; k++) {
    const shrub = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55, 1),
      mat("#2d6124", 0.85),
    );
    shrub.position.set(
      cx + sx * (21.6 - k * 2.2),
      0.66,
      cz + sz * 21.2,
    );
    shrub.scale.set(1, 0.82, 1);
    shrub.castShadow = true;
    g.add(shrub);
  }
  return g;
}

function createSideSemiFountain(x, y, z, facingSign) {
  // Semi-circular flanking fountain on West (-1) & East (+1) plaza wings
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (facingSign < 0) g.rotation.y = Math.PI;

  const rOuter = 5.4;
  const rInner = 4.9;
  const shape = new THREE.Shape();
  const segs = 24;
  for (let i = 0; i <= segs; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / segs;
    const px = Math.cos(a) * rOuter;
    const py = Math.sin(a) * rOuter;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  shape.closePath();

  const hole = new THREE.Path();
  for (let i = 0; i <= segs; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / segs;
    const px = Math.cos(a) * rInner;
    const py = Math.sin(a) * rInner;
    if (i === 0) hole.moveTo(px, py);
    else hole.lineTo(px, py);
  }
  hole.closePath();
  shape.holes.push(hole);

  const rimGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.42,
    bevelEnabled: false,
  });
  rimGeo.rotateX(-Math.PI / 2);
  const rim = new THREE.Mesh(rimGeo, mat("#d3cfc4", 0.72));
  rim.castShadow = rim.receiveShadow = true;

  const waterShape = new THREE.Shape();
  for (let i = 0; i <= segs; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / segs;
    const px = Math.cos(a) * rInner;
    const py = Math.sin(a) * rInner;
    if (i === 0) waterShape.moveTo(px, py);
    else waterShape.lineTo(px, py);
  }
  waterShape.closePath();
  const waterGeo = new THREE.ShapeGeometry(waterShape);
  waterGeo.rotateX(-Math.PI / 2);
  const water = new THREE.Mesh(
    waterGeo,
    new THREE.MeshPhysicalMaterial({
      color: "#2c8e8a",
      roughness: 0.16,
      metalness: 0.05,
      clearcoat: 1,
    }),
  );
  water.position.y = 0.28;

  g.add(rim, water);
  return g;
}

function createGoldenFloralCenterpiece(x, y, z, marigoldMat) {
  // Golden sculptural dragon & stepped crimson-gold flower stage on the riverward edge
  const g = new THREE.Group();
  g.position.set(x, y, z);

  // Red & gold terraced floral stage
  g.add(
    box([9.4, 0.34, 3.8], "#9b2a26", [0, 0.17, 0]),
    box([7.8, 0.28, 2.8], "#d19c1d", [0, 0.48, 0]),
  );

  // Flanking marigold flower mounds
  for (const sx of [-3.4, 3.4]) {
    const mound = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.15, 1),
      marigoldMat,
    );
    mound.position.set(sx, 0.78, 0.2);
    mound.scale.set(1.25, 0.55, 1.1);
    g.add(mound);
  }

  // Sculpted Golden Dragon arch centerpiece (Rồng Vàng)
  const goldMat = mat("#f3bc26", 0.32, 0.65);
  const amberMat = mat("#d48914", 0.4, 0.45);
  const archLeft = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.26, 8, 18, Math.PI * 1.15),
    goldMat,
  );
  archLeft.position.set(-1.1, 1.35, 0);
  archLeft.rotation.z = -0.35;
  archLeft.castShadow = true;

  const archRight = new THREE.Mesh(
    new THREE.TorusGeometry(1.35, 0.26, 8, 18, Math.PI * 1.15),
    goldMat,
  );
  archRight.position.set(1.1, 1.35, 0);
  archRight.rotation.z = 0.35;
  archRight.castShadow = true;

  const crest = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.68, 0),
    goldMat,
  );
  crest.position.set(0, 2.65, 0.1);
  crest.scale.set(1.35, 0.9, 0.85);
  crest.castShadow = true;

  const pearl = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 12, 10),
    new THREE.MeshStandardMaterial({
      color: "#fff3b0",
      emissive: "#ffbe26",
      emissiveIntensity: 0.45,
      roughness: 0.2,
    }),
  );
  pearl.position.set(0, 1.85, 0.35);

  const plaque = box([2.6, 0.65, 0.22], "#7a1d1a", [0, 0.92, 0.95]);
  const trim = box([2.75, 0.1, 0.26], "#f3bc26", [0, 1.25, 0.95]);
  const plinth = box([2.9, 0.4, 1.2], amberMat.color, [0, 0.72, 0.15]);

  g.add(archLeft, archRight, crest, pearl, plaque, trim, plinth);
  return g;
}

function createTropicalFanPalm(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.1;

  const trunkMat = mat("#7b6a56", 0.92);
  const palmH = 5.4 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.27 * scale, palmH, 8),
    trunkMat,
  );
  trunk.position.y = palmH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const frondMat = mat("#427a34", 0.82);
  const brightFrondMat = mat("#568f40", 0.8);
  const frondCount = 9;
  for (let i = 0; i < frondCount; i++) {
    const a = (i * Math.PI * 2) / frondCount;
    const tilt = 0.55 + (i % 3) * 0.22;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.68 * scale, 2.5 * scale, 5),
      i % 2 === 0 ? frondMat : brightFrondMat,
    );
    frond.position.set(
      Math.cos(a) * 1.05 * scale,
      palmH + 0.15 * scale - (i % 2) * 0.25 * scale,
      Math.sin(a) * 1.05 * scale,
    );
    frond.rotation.z = -Math.cos(a) * tilt;
    frond.rotation.x = Math.sin(a) * tilt;
    frond.scale.set(1.25, 1, 0.35);
    frond.castShadow = true;
    g.add(frond);
  }
  return g;
}

export const PEDAL_BOAT_SPECS = [
  { index: 0, dx: 10.0, yaw: -0.25, color: "#f5f7fa", label: "Thiên Nga Trắng 01" },
  { index: 1, dx: 12.6, yaw: -0.18, color: "#6ab8dc", label: "Vịt Xanh Biển 02" },
  { index: 2, dx: 15.2, yaw: -0.28, color: "#f5f7fa", label: "Thiên Nga Trắng 03" },
  { index: 3, dx: 18.0, yaw: -0.2, color: "#eb846c", label: "Vịt Hồng San Hô 04" },
  { index: 4, dx: 20.6, yaw: -0.24, color: "#5fb3d8", label: "Vịt Lam Ngọc 05" },
  { index: 5, dx: 23.2, yaw: -0.15, color: "#f5f7fa", label: "Thiên Nga Trắng 06" },
];

export function createPedalBoat(x, y, z, yaw, bodyColor = "#f5f7fa") {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const hull = box([1.45, 0.42, 2.75], bodyColor, [0, 0.22, 0]);
  const seatL = box([0.46, 0.14, 0.56], "#2c3d48", [-0.3, 0.46, -0.15]);
  const seatR = box([0.46, 0.14, 0.56], "#2c3d48", [0.3, 0.46, -0.15]);
  const canopyPoleL = box([0.06, 1.1, 0.06], "#dce2e6", [-0.58, 0.9, -0.3]);
  const canopyPoleR = box([0.06, 1.1, 0.06], "#dce2e6", [0.58, 0.9, -0.3]);
  const canopy = box([1.35, 0.12, 1.55], "#f7f5ee", [0, 1.46, -0.25]);
  const neck = box([0.24, 0.85, 0.24], "#ffffff", [0, 0.72, 1.08]);
  neck.rotation.x = 0.22;
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 8, 6),
    mat("#ffffff", 0.4),
  );
  head.position.set(0, 1.18, 1.24);
  const beak = box([0.1, 0.08, 0.18], "#eb7b28", [0, 1.14, 1.38]);

  g.add(hull, seatL, seatR, canopyPoleL, canopyPoleR, canopy, neck, head, beak);
  return g;
}

function createHeritageLamp(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const darkBronze = mat("#2a3734", 0.5, 0.55);
  const globeMat = new THREE.MeshStandardMaterial({
    color: "#fff4d2",
    emissive: "#ffd57a",
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 0.6, 8),
    darkBronze,
  );
  base.position.y = 0.3;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.11, 3.8, 8),
    darkBronze,
  );
  pole.position.y = 2.35;
  pole.castShadow = true;
  const arm = box([0.85, 0.05, 0.05], "#2a3734", [0, 4.15, 0]);
  g.add(base, pole, arm);
  for (const gx of [-0.38, 0.38]) {
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 10, 8),
      globeMat,
    );
    globe.position.set(gx, 4.32, 0);
    g.add(globe);
  }
  return g;
}

export function createFountainPark(world, biaSite, heading, options = {}) {
  const cosY = Math.cos(heading);
  const sinY = Math.sin(heading);

  const toWorld = (lx, lz) => ({
    x: biaSite.center.x + lx * cosY + lz * sinY,
    z: biaSite.center.z - lx * sinY + lz * cosY,
  });
  const toLocal = (wx, wz) => {
    const dx = wx - biaSite.center.x;
    const dz = wz - biaSite.center.z;
    return {
      lx: dx * cosY - dz * sinY,
      lz: dx * sinY + dz * cosY,
    };
  };

  let cx = 289.4;
  if (options.ubnd?.center) {
    cx = toLocal(options.ubnd.center.x, options.ubnd.center.z).lx;
  }
  const cz = 6.5;

  const shoreCache = new Map();
  const sampleShoreZ = (lx) => {
    const key = Math.round(lx * 2);
    if (shoreCache.has(key)) return shoreCache.get(key);
    let val = -44.2 + 0.055 * lx;
    if (world.riverRings?.length) {
      let lo = -65;
      let hi = 5;
      if (
        world.riverRings.some((r) => inside(toWorld(lx, lo), r)) &&
        !world.riverRings.some((r) => inside(toWorld(lx, hi), r))
      ) {
        for (let k = 0; k < 20; k++) {
          const mid = (lo + hi) / 2;
          if (world.riverRings.some((r) => inside(toWorld(lx, mid), r))) lo = mid;
          else hi = mid;
        }
        val = hi;
      }
    }
    shoreCache.set(key, val);
    return val;
  };

  const group = new THREE.Group();
  group.name = "fountain-park";
  group.position.set(biaSite.center.x, 0, biaSite.center.z);
  group.rotation.y = heading;

  const graniteTex = createFountainGraniteTexture();
  const lawnTex = createMarigoldLawnTexture();
  const marigoldTex = createMarigoldBloomTexture();

  const graniteMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: graniteTex,
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const lawnMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: lawnTex,
    roughness: 0.9,
    metalness: 0.01,
    side: THREE.DoubleSide,
  });
  const marigoldMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: marigoldTex,
    roughness: 0.78,
    metalness: 0.02,
  });
  const curbMat = mat("#d5d1c7", 0.84);

  // 1. LUSH FORMAL PARK LAWN BASE (lx: 218..366, lz: -18..+39)
  const baseLawn = new THREE.Mesh(
    new THREE.BoxGeometry(148, 0.14, 58),
    lawnMat,
  );
  baseLawn.position.set(292, 0.06, 10.5);
  baseLawn.receiveShadow = true;
  group.add(baseLawn);

  // Terraced green riverbank embankment down to Perfume River water line
  const bankPoints = [];
  for (let lx = 218; lx <= 366; lx += 4) {
    bankPoints.push({ lx, zTop: -16.5, zBot: sampleShoreZ(lx) - 0.3 });
  }
  const bPos = [];
  const bUvs = [];
  const bIdx = [];
  bankPoints.forEach((s, i) => {
    const u = i / (bankPoints.length - 1);
    bPos.push(s.lx, 0.21, s.zTop, s.lx, 0.08, s.zBot);
    bUvs.push(u * 10, 0, u * 10, 1);
    if (i > 0) {
      const a = (i - 1) * 2;
      bIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute("position", new THREE.Float32BufferAttribute(bPos, 3));
  bankGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bUvs, 2));
  bankGeo.setIndex(bIdx);
  bankGeo.computeVertexNormals();
  const bankMesh = new THREE.Mesh(bankGeo, lawnMat);
  bankMesh.receiveShadow = true;
  group.add(bankMesh);

  // 2. CIRCULAR GRANITE PLAZA & CROSS-AXIAL PROMENADES
  const plazaRadius = 21.2;
  const plazaDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(plazaRadius, plazaRadius, 0.24, 56),
    graniteMat,
  );
  plazaDisk.position.set(cx, 0.14, cz);
  plazaDisk.receiveShadow = true;

  // North-South Promenade straight from UBND Lê Lợi entrance to riverfront terrace (split clear of riverWalk/plazaDisk/frontWalk)
  const nsWalk = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.24, 47.8),
    graniteMat,
  );
  nsWalk.position.set(cx, 0.12, 12.1);
  nsWalk.receiveShadow = true;

  // Approach ramp at Lê Lợi sidewalk
  const frontRamp = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.14, 3.0),
    curbMat,
  );
  frontRamp.position.set(cx, 0.13, 39.2);
  frontRamp.rotation.x = 0.035;

  // East-West Promenade connecting central plaza & side semi-circular fountains (inside plazaDisk + apses)
  const ewWalk = new THREE.Mesh(
    new THREE.BoxGeometry(72, 0.24, 8.6),
    graniteMat,
  );
  ewWalk.position.set(cx, 0.11, cz);
  ewWalk.receiveShadow = true;

  // Curved semi-circular apse aprons framing side fountains (top 0.24m)
  for (const sx of [-1, 1]) {
    const apse = new THREE.Mesh(
      new THREE.CylinderGeometry(11.5, 11.5, 0.24, 32),
      graniteMat,
    );
    apse.position.set(cx + sx * 27, 0.12, cz);
    apse.receiveShadow = true;
    group.add(apse);
  }

  // Continuous Riverfront Promenade connecting FireflyTreePark (lx=218) -> East (lx=366)
  const riverWalk = new THREE.Mesh(
    new THREE.BoxGeometry(148, 0.24, 4.8),
    graniteMat,
  );
  riverWalk.position.set(292, 0.12, -14.2);
  riverWalk.receiveShadow = true;

  // Lê Lợi South Perimeter Walk linking wing footpaths along Lê Lợi curb
  const frontWalk = new THREE.Mesh(
    new THREE.BoxGeometry(148, 0.24, 3.2),
    graniteMat,
  );
  frontWalk.position.set(292, 0.12, 37.6);
  frontWalk.receiveShadow = true;

  // Small Diagonal & Branching Wing Footpaths radiating from Fountain Plaza (top 0.22m so zero overlap Z-fighting with main walks/apses)
  const wingWalkSegments = [
    // West wing connecting to FireflyTreePark (lx = 218)
    { a: { lx: cx - 36, lz: cz }, b: { lx: 218, lz: cz }, width: 3.4 },
    { a: { lx: cx - 35, lz: cz + 4 }, b: { lx: 234, lz: 37.6 }, width: 3.0 },
    { a: { lx: cx - 35, lz: cz - 4 }, b: { lx: 232, lz: -14.2 }, width: 3.0 },
    { a: { lx: 234, lz: 37.6 }, b: { lx: 218, lz: 22.0 }, width: 2.8 },
    // East wing connecting seamlessly into PhuXuanParkWalk (lx = 366 -> Cầu Phú Xuân)
    { a: { lx: cx + 36, lz: cz }, b: { lx: 366, lz: cz }, width: 3.4 },
    { a: { lx: cx + 35, lz: cz + 4 }, b: { lx: 345, lz: 37.6 }, width: 3.0 },
    { a: { lx: cx + 35, lz: cz - 4 }, b: { lx: 348, lz: -14.2 }, width: 3.0 },
    { a: { lx: 345, lz: 37.6 }, b: { lx: 366, lz: 22.0 }, width: 2.8 },
    { a: { lx: 348, lz: -14.2 }, b: { lx: 366, lz: cz }, width: 2.8 },
  ];
  const buildWingRibbon = (a, b, width, tierIdx) => {
    const dx = b.lx - a.lx;
    const dz = b.lz - a.lz;
    const len = Math.hypot(dx, dz) || 1;
    const topY = 0.222 - tierIdx * 0.01;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.24, len + 0.6),
      graniteMat,
    );
    mesh.position.set((a.lx + b.lx) / 2, topY - 0.12, (a.lz + b.lz) / 2);
    mesh.rotation.y = Math.atan2(dx, dz);
    mesh.receiveShadow = true;
    return mesh;
  };
  wingWalkSegments.forEach((seg, idx) =>
    group.add(buildWingRibbon(seg.a, seg.b, seg.width, idx < 4 ? idx : idx - 4)),
  );

  // Boxwood-trimmed wing parterres & rounded clipped shrubs on left & right wings
  const buildWingHedgeBed = (pts, withMarigold = false) => {
    const g = new THREE.Group();
    const s = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const hGeo = new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: false });
    hGeo.rotateX(-Math.PI / 2);
    const hedge = new THREE.Mesh(hGeo, mat("#366d29", 0.88));
    hedge.position.y = 0.13;
    hedge.castShadow = hedge.receiveShadow = true;
    g.add(hedge);
    let mx = 0;
    let mz = 0;
    for (const [x, z] of pts) {
      mx += x;
      mz += z;
    }
    mx /= pts.length;
    mz /= pts.length;
    for (const [x, z] of pts) {
      const shrub = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.46, 1),
        mat("#2b5e22", 0.84),
      );
      shrub.position.set(mx + (x - mx) * 0.68, 0.52, mz + (z - mz) * 0.68);
      shrub.scale.set(1.05, 0.82, 1.05);
      shrub.castShadow = true;
      g.add(shrub);
    }
    if (withMarigold) {
      const mound = new THREE.Mesh(new THREE.SphereGeometry(2.0, 12, 8), marigoldMat);
      mound.position.set(mx, 0.34, mz);
      mound.scale.set(1.2, 0.14, 1.0);
      g.add(mound);
    }
    return g;
  };
  group.add(
    buildWingHedgeBed([[336, 33], [358, 22], [358, 11], [336, 15]], true),
    buildWingHedgeBed([[336, 1], [358, 1], [349, -10]], false),
    buildWingHedgeBed([[224, 33], [244, 15], [224, 15]], true),
    buildWingHedgeBed([[224, 1], [242, 1], [231, -10]], false),
  );

  // Central riverfront granite stairway down to the Perfume River edge
  const stairTopZ = -16.5;
  const stairBotZ = sampleShoreZ(cx) + 0.5;
  const stairLen = Math.max(4, stairTopZ - stairBotZ);
  const riverStair = new THREE.Mesh(
    new THREE.BoxGeometry(8.4, 0.18, stairLen),
    graniteMat,
  );
  riverStair.position.set(cx, 0.16, (stairTopZ + stairBotZ) / 2);
  riverStair.rotation.x = -Math.atan2(0.14, stairLen);
  riverStair.receiveShadow = true;

  group.add(plazaDisk, nsWalk, frontRamp, ewWalk, riverWalk, frontWalk, riverStair);

  // 3. CENTRAL SCALLOPED / LOBED FOUNTAIN BASIN (cx, cz)
  const basinRadius = 11.0;
  const copingMesh = new THREE.Mesh(
    createScallopedCopingGeometry(basinRadius, basinRadius - 0.65, 8, 0.52),
    curbMat,
  );
  copingMesh.position.set(cx, 0.24, cz);
  copingMesh.castShadow = copingMesh.receiveShadow = true;

  const waterPool = new THREE.Mesh(
    createScallopedWaterGeometry(basinRadius - 0.55, 8),
    new THREE.MeshPhysicalMaterial({
      color: "#2a8b87",
      roughness: 0.14,
      metalness: 0.06,
      clearcoat: 1,
    }),
  );
  waterPool.position.set(cx, 0.52, cz);

  // Inner raised circular jet ring & central stone nozzle spire
  const innerRingWall = new THREE.Mesh(
    new THREE.TorusGeometry(4.4, 0.3, 8, 36),
    curbMat,
  );
  innerRingWall.rotation.x = Math.PI / 2;
  innerRingWall.position.set(cx, 0.58, cz);

  const nozzleBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 1.15, 0.95, 14),
    mat("#8b877c", 0.65),
  );
  nozzleBase.position.set(cx, 0.72, cz);

  group.add(copingMesh, waterPool, innerRingWall, nozzleBase);

  // Animated Fountain Water Jets (InstancedMesh with zero per-frame allocation)
  const jetCount = 1 + 12 + 24 + 10; // central plume + 12 inner + 24 parabolic arcs + 10 side-fountain jets
  const jetGeo = new THREE.CylinderGeometry(0.055, 0.11, 1, 8);
  jetGeo.translate(0, 0.5, 0);
  const jetMat = new THREE.MeshStandardMaterial({
    color: "#eefbff",
    emissive: "#a4e6f2",
    emissiveIntensity: 0.32,
    transparent: true,
    opacity: 0.82,
    roughness: 0.18,
  });
  const jets = new THREE.InstancedMesh(jetGeo, jetMat, jetCount);
  jets.name = "fountain-water-jets";
  const jetSpecs = [];
  const dummy = new THREE.Object3D();

  // 0: Tall central geyser plume
  jetSpecs.push({
    x: cx,
    y: 0.95,
    z: cz,
    rx: 0,
    rz: 0,
    baseH: 5.8,
    baseW: 2.3,
    phase: 0,
    amp: 0.65,
  });
  // 1..12: Inner crown vertical spray jets
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    jetSpecs.push({
      x: cx + Math.cos(a) * 2.7,
      y: 0.55,
      z: cz + Math.sin(a) * 2.7,
      rx: Math.sin(a) * 0.16,
      rz: -Math.cos(a) * 0.16,
      baseH: 2.5,
      baseW: 1.0,
      phase: i * 0.5,
      amp: 0.38,
    });
  }
  // 13..36: Outer ring of 24 inward-arching parabolic jets
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    jetSpecs.push({
      x: cx + Math.cos(a) * 8.2,
      y: 0.56,
      z: cz + Math.sin(a) * 8.2,
      rx: -Math.sin(a) * 0.62,
      rz: Math.cos(a) * 0.62,
      baseH: 4.1,
      baseW: 0.95,
      phase: i * 0.28,
      amp: 0.42,
    });
  }
  // 37..46: Side semi-circular fountains (5 jets on West, 5 jets on East)
  for (const sx of [-1, 1]) {
    for (let k = 0; k < 5; k++) {
      const a = -0.75 + k * 0.375;
      const fx = cx + sx * (27.5 + Math.cos(a) * 2.4);
      const fz = cz + Math.sin(a) * 2.4;
      jetSpecs.push({
        x: fx,
        y: 0.54,
        z: fz,
        rx: 0,
        rz: 0,
        baseH: 2.35 + (k === 2 ? 0.65 : 0),
        baseW: 0.95,
        phase: k * 0.6 + (sx > 0 ? 1.2 : 0),
        amp: 0.35,
      });
    }
  }
  const magentaCol = new THREE.Color("#ff6be0");
  const cyanCol = new THREE.Color("#5be8ff");
  const warmGoldCol = new THREE.Color("#ffd06b");
  jetSpecs.forEach((j, i) => {
    dummy.position.set(j.x, j.y, j.z);
    dummy.rotation.set(j.rx, 0, j.rz);
    dummy.scale.set(j.baseW, j.baseH, j.baseW);
    dummy.updateMatrix();
    jets.setMatrixAt(i, dummy.matrix);
    if (i === 0 || (i >= 13 && i <= 36)) {
      jets.setColorAt?.(i, i % 3 === 0 ? warmGoldCol : magentaCol);
    } else {
      jets.setColorAt?.(i, cyanCol);
    }
  });
  jets.instanceMatrix.needsUpdate = true;
  if (jets.instanceColor) jets.instanceColor.needsUpdate = true;
  jets.computeBoundingSphere();
  group.add(jets);

  // Illuminated submerged LED fountain ring matching evening plaza glow
  const ledRing = new THREE.Mesh(
    new THREE.TorusGeometry(9.6, 0.14, 6, 48),
    new THREE.MeshStandardMaterial({
      color: "#ff9ce8",
      emissive: "#ff48c4",
      emissiveIntensity: 0.9,
      roughness: 0.2,
    }),
  );
  ledRing.rotation.x = Math.PI / 2;
  ledRing.position.set(cx, 0.56, cz);
  group.add(ledRing);

  // Shimmering white foam ring at center of pool
  const foamRing = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 3.6, 32),
    new THREE.MeshBasicMaterial({
      color: "#effdff",
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    }),
  );
  foamRing.rotation.x = -Math.PI / 2;
  foamRing.position.set(cx, 0.54, cz);
  group.add(foamRing);

  // 4. FOUR SYMMETRICAL TRIMMED-HEDGE & GOLDEN MARIGOLD PARTERRES
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    group.add(createCornerParterre(sx, sz, cx, cz, marigoldMat));
  }

  // 5. TWO FLANKING SEMI-CIRCULAR SIDE FOUNTAINS
  group.add(createSideSemiFountain(cx - 27.5, 0.24, cz, 1));
  group.add(createSideSemiFountain(cx + 27.5, 0.24, cz, -1));

  // 6. GOLDEN DRAGON & FLORAL SCULPTURAL CENTERPIECE (on riverward side of circle)
  group.add(createGoldenFloralCenterpiece(cx, 0.24, -10.8, marigoldMat));

  // 7. ROW OF TROPICAL FAN PALMS ALONG THE RIVERFRONT TERRACE + HERITAGE LAMPS
  for (const [idx, px] of [
    cx - 25.5,
    cx - 19.5,
    cx - 13.5,
    cx - 7.5,
    cx + 7.5,
    cx + 13.5,
    cx + 19.5,
    cx + 25.5,
  ].entries()) {
    group.add(createTropicalFanPalm(px, 0.22, -18.6, 1.0 + (idx % 2) * 0.08, idx + 1));
  }
  for (const [lx, lz] of [
    [cx - 22, 22],
    [cx + 22, 22],
    [cx - 22, -9],
    [cx + 22, -9],
    [234, -12.5],
    [346, -12.5],
  ]) {
    group.add(createHeritageLamp(lx, 0.24, lz));
  }

  // Warm golden walkway border bollards framing the 4 quadrant beds
  const bollardMat = new THREE.MeshStandardMaterial({
    color: "#fff3cc",
    emissive: "#ffbe45",
    emissiveIntensity: 0.95,
  });
  const bollardCoords = [];
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      for (const d of [7.5, 13.5, 19.5]) {
        bollardCoords.push([cx + sx * 6.4, cz + sz * d]);
        bollardCoords.push([cx + sx * d, cz + sz * 5.2]);
      }
    }
  }
  for (const [bx, bz] of bollardCoords) {
    const post = box([0.14, 0.48, 0.14], "#2a3531", [bx, 0.46, bz]);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 6), bollardMat);
    cap.position.set(bx, 0.74, bz);
    group.add(post, cap);
  }

  // 8. MOORED SWAN / DRAGON PEDAL BOATS ON THE PERFUME RIVER EDGE + TIMBER LANDING PIER
  const boats = [];
  const boatWorldSpecs = [];
  PEDAL_BOAT_SPECS.forEach((spec, idx) => {
    const bx = cx + spec.dx;
    const bz = sampleShoreZ(bx) - 4.4 - (idx % 2) * 0.9;
    const boat = createPedalBoat(bx, 0.02, bz, spec.yaw, spec.color);
    boat.userData.baseZ = bz;
    boat.userData.phase = idx * 0.9;
    group.add(boat);
    boats.push(boat);
    const wPos = toWorld(bx, bz);
    boatWorldSpecs.push({
      index: idx,
      x: wPos.x,
      z: wPos.z,
      yaw: heading + spec.yaw,
      launchHeading: heading + Math.PI - 0.18,
      color: spec.color,
      label: spec.label,
    });
  });

  // Timber landing pier extending cleanly riverward from the granite river stair (zero XZ overlap with riverStair)
  const pierStartZ = stairBotZ - 0.06;
  const pierLen = 3.0;
  const pierCenterZ = pierStartZ - pierLen / 2;
  const pierCenterX = cx + 1.5;
  const pierY = 0.22;
  const pierDeck = new THREE.Mesh(
    new THREE.BoxGeometry(6.0, 0.16, pierLen),
    mat("#8d613c", 0.8),
  );
  pierDeck.position.set(pierCenterX, pierY - 0.08, pierCenterZ);
  pierDeck.castShadow = pierDeck.receiveShadow = true;
  group.add(pierDeck);
  for (const px of [pierCenterX - 2.6, pierCenterX, pierCenterX + 2.6]) {
    for (const pz of [pierStartZ - 0.4, pierStartZ - pierLen + 0.35]) {
      const pile = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.16, 0.72, 8),
        mat("#543a24", 0.9),
      );
      pile.position.set(px, -0.1, pz);
      group.add(pile);
    }
  }
  for (const bx of [pierCenterX - 2.6, pierCenterX + 2.6]) {
    const bollard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.13, 0.48, 8),
      mat("#3e2c1c", 0.85),
    );
    bollard.position.set(bx, pierY + 0.24, pierStartZ - pierLen + 0.3);
    group.add(bollard);
  }

  // Lifebuoy stand + Redesigned Signboard (unobstructed lettering + swan icon) + Rental Attendant NPC
  const vendorLx = cx - 2.1;
  const vendorLz = stairBotZ + 0.45;
  const dockBooth = new THREE.Group();
  dockBooth.name = "pedal-dock-booth";
  dockBooth.position.set(vendorLx, 0.18, vendorLz);

  const postLeft = box([0.08, 1.98, 0.08], "#523a23", [-1.96, 0.99, -0.1]);
  postLeft.name = "dock-sign-post-left";
  const postRight = box([0.08, 1.98, 0.08], "#523a23", [0.46, 0.99, -0.1]);
  postRight.name = "dock-sign-post-right";
  const topRail = box([2.5, 0.08, 0.06], "#523a23", [-0.75, 1.62, -0.05]);
  const lowerRail = box([2.42, 0.06, 0.05], "#523a23", [-0.75, 1.15, -0.05]);
  const signBacking = box([2.34, 0.74, 0.045], "#103237", [-0.75, 1.62, 0.0]);
  const signTrimTop = box([2.38, 0.04, 0.06], "#f2cb6d", [-0.75, 1.99, 0.0]);
  const signTrimBot = box([2.38, 0.04, 0.06], "#f2cb6d", [-0.75, 1.25, 0.0]);
  dockBooth.add(
    postLeft,
    postRight,
    topRail,
    lowerRail,
    signBacking,
    signTrimTop,
    signTrimBot,
  );

  if (typeof document !== "undefined") {
    const dockSignTex = createCanvasTexture(512, 160, (ctx, w, h) => {
      if (typeof ctx.createLinearGradient === "function") {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, "#123c42");
        grad.addColorStop(1, "#1c565d");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#144248";
      }
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "#f2cb6d";
      ctx.lineWidth = 6;
      ctx.strokeRect(7, 7, w - 14, h - 14);
      ctx.strokeStyle = "rgba(242, 203, 109, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(14, 14, w - 28, h - 28);

      // Left emblem badge: Swan pedal-boat icon ("biểu tượng đạp vịt")
      const cxIcon = 78;
      const cyIcon = 80;
      if (typeof ctx.arc === "function") {
        ctx.fillStyle = "rgba(242, 203, 109, 0.16)";
        ctx.beginPath();
        ctx.arc(cxIcon, cyIcon, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f2cb6d";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Water ripples under swan
        ctx.strokeStyle = "#8ce0ea";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cxIcon - 34, cyIcon + 28);
        ctx.quadraticCurveTo?.(cxIcon - 12, cyIcon + 23, cxIcon, cyIcon + 28);
        ctx.quadraticCurveTo?.(cxIcon + 14, cyIcon + 33, cxIcon + 34, cyIcon + 27);
        ctx.stroke();

        // Canopy poles + striped roof
        ctx.strokeStyle = "#e6eef0";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cxIcon - 18, cyIcon + 8);
        ctx.lineTo(cxIcon - 18, cyIcon - 18);
        ctx.moveTo(cxIcon + 2, cyIcon + 8);
        ctx.lineTo(cxIcon + 2, cyIcon - 18);
        ctx.stroke();
        ctx.fillStyle = "#f7e3a8";
        ctx.fillRect(cxIcon - 25, cyIcon - 23, 34, 7);

        // Swan boat hull + curved neck + orange beak
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cxIcon - 28, cyIcon + 10);
        ctx.lineTo(cxIcon + 14, cyIcon + 10);
        ctx.quadraticCurveTo?.(cxIcon + 26, cyIcon + 10, cxIcon + 24, cyIcon - 6);
        ctx.quadraticCurveTo?.(cxIcon + 22, cyIcon - 26, cxIcon + 32, cyIcon - 24);
        ctx.quadraticCurveTo?.(cxIcon + 39, cyIcon - 22, cxIcon + 36, cyIcon - 14);
        ctx.quadraticCurveTo?.(cxIcon + 29, cyIcon - 15, cxIcon + 30, cyIcon - 2);
        ctx.quadraticCurveTo?.(cxIcon + 30, cyIcon + 21, cxIcon + 12, cyIcon + 22);
        ctx.lineTo(cxIcon - 22, cyIcon + 22);
        ctx.closePath?.();
        ctx.fill();

        // Swan orange beak + eye + wing accent
        ctx.fillStyle = "#f07c2b";
        ctx.beginPath();
        ctx.moveTo(cxIcon + 36, cyIcon - 21);
        ctx.lineTo(cxIcon + 46, cyIcon - 17);
        ctx.lineTo(cxIcon + 35, cyIcon - 14);
        ctx.closePath?.();
        ctx.fill();
        ctx.fillStyle = "#193b42";
        ctx.beginPath();
        ctx.arc(cxIcon + 32, cyIcon - 20, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // Unobstructed right-hand title + subtitle
      const textCenterX = 314;
      ctx.fillStyle = "#ffe9a8";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText?.("ĐẠP VỊT SÔNG HƯƠNG", textCenterX, 62);

      ctx.fillStyle = "#d9f0ec";
      ctx.font = "600 18px sans-serif";
      ctx.fillText?.("BẾN THUYỀN ĐÀI PHUN NƯỚC · [G]", textCenterX, 106);
    });
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(2.26, 0.68),
      new THREE.MeshStandardMaterial({
        map: dockSignTex,
        roughness: 0.65,
        side: THREE.DoubleSide,
      }),
    );
    signBoard.name = "dock-signboard";
    signBoard.position.set(-0.75, 1.62, 0.032);
    dockBooth.add(signBoard);
  }
  const ringBuoy = new THREE.Mesh(
    new THREE.TorusGeometry(0.28, 0.08, 8, 16),
    mat("#eb6b38", 0.55),
  );
  ringBuoy.name = "dock-lifebuoy";
  ringBuoy.position.set(-0.75, 0.82, 0.05);
  dockBooth.add(ringBuoy);

  // Rental attendant NPC wearing lifevest + nón lá
  const npc = new THREE.Group();
  npc.position.set(0.75, 0, 0.08);
  npc.rotation.y = Math.PI;
  npc.add(
    box([0.16, 0.55, 0.16], "#243442", [-0.11, 0.275, 0]),
    box([0.16, 0.55, 0.16], "#243442", [0.11, 0.275, 0]),
    box([0.42, 0.58, 0.26], "#ef7c38", [0, 0.84, 0]),
    box([0.12, 0.42, 0.12], "#33759e", [-0.28, 0.82, 0]),
    box([0.12, 0.42, 0.12], "#33759e", [0.28, 0.82, 0]),
  );
  const nHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    mat("#f6d2b5", 0.75),
  );
  nHead.position.set(0, 1.31, 0);
  const nHat = new THREE.Mesh(
    new THREE.ConeGeometry(0.31, 0.19, 14),
    mat("#e5cf95", 0.82),
  );
  nHat.position.set(0, 1.51, 0);
  npc.add(nHead, nHat);
  dockBooth.add(npc);
  group.add(dockBooth);

  let occupiedBoatSet = new Set();
  const setOccupiedBoats = (occupiedSet) => {
    occupiedBoatSet = new Set(occupiedSet || []);
    boats.forEach((boat, idx) => {
      boat.visible = !occupiedBoatSet.has(idx);
    });
  };

  world.scene.add(group);
  world.cameraObstacles.push(copingMesh);

  const animatedObjects = [jets, foamRing, ...boats];
  const update = (time) => {
    for (let i = 0; i < jetSpecs.length; i++) {
      const j = jetSpecs[i];
      const h = j.baseH + Math.sin(time * 4.2 + j.phase) * j.amp;
      dummy.position.set(j.x, j.y, j.z);
      dummy.rotation.set(j.rx, 0, j.rz);
      dummy.scale.set(j.baseW, Math.max(0.35, h), j.baseW);
      dummy.updateMatrix();
      jets.setMatrixAt(i, dummy.matrix);
    }
    jets.instanceMatrix.needsUpdate = true;

    const foamScale = 1 + Math.sin(time * 3.1) * 0.06;
    foamRing.scale.set(foamScale, foamScale, 1);

    for (const boat of boats) {
      if (!boat.visible) continue;
      boat.position.y = 0.03 + Math.sin(time * 1.6 + boat.userData.phase) * 0.045;
      boat.rotation.z = Math.sin(time * 1.3 + boat.userData.phase) * 0.035;
    }
  };

  const vendorPos = toWorld(vendorLx, vendorLz);
  const pierReturnWorld = toWorld(pierCenterX, pierStartZ - 1.1);
  const dockLaunchWorld = toWorld(pierCenterX, pierStartZ - pierLen - 2.6);
  const pedalDock = {
    vendorPos: { ...vendorPos, y: 0.18 },
    pierReturnPos: { ...pierReturnWorld, y: pierY },
    dockWaterPos: { ...dockLaunchWorld, y: 0.03, heading: heading + Math.PI },
    boats: boatWorldSpecs,
    isDockBlocked(wx, wz, excludeBoatIndex = -1) {
      const { lx, lz } = toLocal(wx, wz);
      if (
        lx >= pierCenterX - 3.6 &&
        lx <= pierCenterX + 3.6 &&
        lz >= pierStartZ - pierLen - 1.2 &&
        lz <= pierStartZ + 1.0
      ) {
        return true;
      }
      for (const spec of boatWorldSpecs) {
        if (spec.index === excludeBoatIndex) continue;
        if (occupiedBoatSet.has(spec.index)) continue;
        if (Math.hypot(wx - spec.x, wz - spec.z) < 2.35) return true;
      }
      return false;
    },
  };

  return {
    group,
    fountainCenterLocal: { lx: cx, lz: cz },
    animatedObjects,
    pedalDock,
    setOccupiedBoats,
    isWaterBlocked(wx, wz, pad = 2.0) {
      const { lx, lz } = toLocal(wx, wz);
      return lx >= 218 && lx <= 366 && lz >= sampleShoreZ(lx) - pad && lz <= 41;
    },
    update,
    groundAt(wx, wz, referenceY) {
      const { lx, lz } = toLocal(wx, wz);
      if (
        lx >= pierCenterX - 3.0 &&
        lx <= pierCenterX + 3.0 &&
        lz >= pierStartZ - pierLen &&
        lz <= pierStartZ
      ) {
        if (!Number.isFinite(referenceY) || referenceY < 1.8) return pierY;
      }
      if (lx < 218 || lx > 366 || lz < sampleShoreZ(lx) - 1 || lz > 41)
        return null;
      if (Number.isFinite(referenceY) && referenceY > 1.8) return null;

      // Central circular plaza & cross-axial granite promenades + wing small footpaths
      if (Math.hypot(lx - cx, lz - cz) <= plazaRadius + 0.5) return 0.24;
      if (Math.abs(lx - cx) <= 5.8 && lz >= -16.6 && lz <= 38.8) return 0.24;
      if (Math.abs(lx - cx) <= 36 && Math.abs(lz - cz) <= 4.3) return 0.24;
      if (Math.hypot(lx - (cx - 27), lz - cz) <= 11.5) return 0.24;
      if (Math.hypot(lx - (cx + 27), lz - cz) <= 11.5) return 0.24;
      if (lz >= -16.6 && lz <= -11.8) return 0.24;
      if (lz >= 36.0 && lz <= 39.2) return 0.24;
      for (const seg of wingWalkSegments) {
        const dx = seg.b.lx - seg.a.lx;
        const dz = seg.b.lz - seg.a.lz;
        const lenSq = dx * dx + dz * dz || 1;
        const t = Math.max(
          0,
          Math.min(1, ((lx - seg.a.lx) * dx + (lz - seg.a.lz) * dz) / lenSq),
        );
        const dist = Math.hypot(
          lx - (seg.a.lx + dx * t),
          lz - (seg.a.lz + dz * t),
        );
        if (dist <= seg.width / 2 + 0.35) return 0.24;
      }

      // Approach ramp at Lê Lợi
      if (Math.abs(lx - cx) <= 6.1 && lz > 38.8 && lz <= 40.7) {
        const t = (40.7 - lz) / 1.9;
        return 0.14 + t * 0.1;
      }

      // Central granite stairway down to river shore
      if (Math.abs(lx - cx) <= 4.2 && lz < -16.5 && lz >= sampleShoreZ(lx)) {
        const t = (-16.5 - lz) / Math.max(1, -16.5 - sampleShoreZ(cx));
        return 0.24 - t * 0.14;
      }

      if (lz < -16.5) {
        const zBot = sampleShoreZ(lx);
        const t = Math.max(0, Math.min(1, (-16.5 - lz) / Math.max(1, -16.5 - zBot)));
        return 0.2 - t * 0.12;
      }
      return 0.13;
    },
    canRide(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      if (
        lx >= pierCenterX - 2.8 &&
        lx <= pierCenterX + 2.8 &&
        lz >= pierStartZ - pierLen + 0.2 &&
        lz <= pierStartZ + 0.2
      ) {
        return true;
      }
      if (lx < 218 || lx > 366 || lz < sampleShoreZ(lx) || lz > 40.5)
        return null;

      // Block riding into the central scalloped fountain pool
      if (Math.hypot(lx - cx, lz - cz) < basinRadius + 0.8) return false;
      // Block riding into the West & East semi-circular fountains
      if (Math.hypot(lx - (cx - 27.5), lz - cz) < 5.6 && lx <= cx - 27.2)
        return false;
      if (Math.hypot(lx - (cx + 27.5), lz - cz) < 5.6 && lx >= cx + 27.2)
        return false;
      // Block golden dragon floral centerpiece
      if (Math.abs(lx - cx) < 4.9 && Math.abs(lz - -10.8) < 2.1) return false;
      // Block pedal rental stall & NPC hitbox
      if (Math.hypot(lx - vendorLx, lz - vendorLz) < 0.95) return false;

      if (lz >= sampleShoreZ(lx) + 0.8 && lz <= 40.2) return true;
      return null;
    },
    blocksGrass(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      return lx >= 218 && lx <= 366 && lz >= sampleShoreZ(lx) - 1 && lz <= 41;
    },
    blocksTree(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      // Keep the entire Fountain Plaza, cross-axial promenades, and riverfront fan palm row clear of random OSM trees
      if (Math.hypot(lx - cx, lz - cz) < 38) return true;
      if (lx >= 218 && lx <= 366 && lz >= -28 && lz <= -10) return true;
      if (Math.abs(lx - cx) < 16 && lz >= -20 && lz <= 42) return true;
      return false;
    },
  };
}
