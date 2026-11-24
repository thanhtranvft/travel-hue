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

function createPedalBoat(x, y, z, yaw, bodyColor) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const hull = box([1.45, 0.42, 2.75], bodyColor, [0, 0.22, 0]);
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

  g.add(hull, canopyPoleL, canopyPoleR, canopy, neck, head, beak);
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
  plazaDisk.position.set(cx, 0.125, cz);
  plazaDisk.receiveShadow = true;

  // North-South Promenade straight from UBND Lê Lợi entrance to riverfront terrace
  const nsWalk = new THREE.Mesh(
    new THREE.BoxGeometry(11.6, 0.24, 57.5),
    graniteMat,
  );
  nsWalk.position.set(cx, 0.12, 10.6);
  nsWalk.receiveShadow = true;

  // Approach ramp at Lê Lợi sidewalk
  const frontRamp = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.14, 3.0),
    curbMat,
  );
  frontRamp.position.set(cx, 0.13, 39.2);
  frontRamp.rotation.x = 0.035;

  // East-West Promenade through central circle & side semi-circular fountains
  const ewWalk = new THREE.Mesh(
    new THREE.BoxGeometry(72, 0.24, 8.6),
    graniteMat,
  );
  ewWalk.position.set(cx, 0.12, cz);
  ewWalk.receiveShadow = true;

  // Curved semi-circular apse aprons framing side fountains
  for (const sx of [-1, 1]) {
    const apse = new THREE.Mesh(
      new THREE.CylinderGeometry(11.5, 11.5, 0.24, 32),
      graniteMat,
    );
    apse.position.set(cx + sx * 27, 0.122, cz);
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

  // Small Diagonal & Branching Wing Footpaths radiating from Fountain Plaza (lx = 218..254 & 325..366)
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
  const buildWingRibbon = (a, b, width) => {
    const dx = b.lx - a.lx;
    const dz = b.lz - a.lz;
    const len = Math.hypot(dx, dz) || 1;
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.24, len + 0.6),
      graniteMat,
    );
    mesh.position.set((a.lx + b.lx) / 2, 0.12, (a.lz + b.lz) / 2);
    mesh.rotation.y = Math.atan2(dx, dz);
    mesh.receiveShadow = true;
    return mesh;
  };
  wingWalkSegments.forEach((seg) => group.add(buildWingRibbon(seg.a, seg.b, seg.width)));

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

  // 8. MOORED SWAN / DRAGON PEDAL BOATS ON THE PERFUME RIVER EDGE
  const boats = [];
  const boatConfigs = [
    [cx + 10, -0.25, "#f5f7fa"],
    [cx + 12.6, -0.18, "#6ab8dc"],
    [cx + 15.2, -0.28, "#f5f7fa"],
    [cx + 18.0, -0.2, "#eb846c"],
    [cx + 20.6, -0.24, "#5fb3d8"],
    [cx + 23.2, -0.15, "#f5f7fa"],
  ];
  boatConfigs.forEach(([bx, yaw, color], idx) => {
    const bz = sampleShoreZ(bx) - 4.4 - (idx % 2) * 0.9;
    const boat = createPedalBoat(bx, 0.02, bz, yaw, color);
    boat.userData.baseZ = bz;
    boat.userData.phase = idx * 0.9;
    group.add(boat);
    boats.push(boat);
  });

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
      boat.position.y = 0.03 + Math.sin(time * 1.6 + boat.userData.phase) * 0.045;
      boat.rotation.z = Math.sin(time * 1.3 + boat.userData.phase) * 0.035;
    }
  };

  return {
    group,
    fountainCenterLocal: { lx: cx, lz: cz },
    animatedObjects,
    update,
    groundAt(wx, wz, referenceY) {
      const { lx, lz } = toLocal(wx, wz);
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

      if (lz >= sampleShoreZ(lx) + 0.8 && lz <= 40.2) return true;
      return null;
    },
    blocksGrass(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      return lx >= 218 && lx <= 366 && lz >= sampleShoreZ(lx) - 1 && lz <= 40.2;
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
