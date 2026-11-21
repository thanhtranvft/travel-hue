import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import {
  ROAD_Y,
  TRUONG_TIEN_CAMBER,
  TRUONG_TIEN_WALK_LIFT,
  truongTienElevation,
} from "../../../../core/world/roadSurface.js";

export const TRUONG_TIEN_SPANS = 6;
export const TRUONG_TIEN_ARCH_COUNT = 12;
export const TRUONG_TIEN_PIER_COUNT = 5;
export const TRUONG_TIEN_TRUSS_START_S = 12;
export const TRUONG_TIEN_TRUSS_END_S = 397;
export const TRUONG_TIEN_ROAD_HALF = 6.8;
export const TRUONG_TIEN_TRUSS_HALF = 7.18;
export const TRUONG_TIEN_WALK_INNER = 7.42;
export const TRUONG_TIEN_WALK_OUTER = 9.65;
export const TRUONG_TIEN_BALCONY_OUTER = 11.05;

const PANELS_PER_SPAN = 10;
const BALCONY_HALF_LEN = 4.6;

const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _u = new THREE.Vector3();
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _xAxis = new THREE.Vector3();
const _yAxis = new THREE.Vector3();
const _zAxis = new THREE.Vector3();
const _mid = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();

function setMemberMatrix(mat4, a, b, thicknessW, thicknessV, refNormal) {
  _vA.set(a.x, a.y, a.z);
  _vB.set(b.x, b.y, b.z);
  _u.subVectors(_vB, _vA);
  const len = _u.length();
  if (len < 1e-4) return false;
  _u.divideScalar(len);
  _w.copy(refNormal).addScaledVector(_u, -refNormal.dot(_u));
  if (_w.lengthSq() < 1e-6) {
    _w.set(1, 0, 0).addScaledVector(_u, -_u.x);
  }
  _w.normalize();
  _v.crossVectors(_u, _w).normalize();
  _mid.addVectors(_vA, _vB).multiplyScalar(0.5);
  _xAxis.copy(_w).multiplyScalar(thicknessW);
  _yAxis.copy(_u).multiplyScalar(len);
  _zAxis.copy(_v).multiplyScalar(thicknessV);
  mat4.makeBasis(_xAxis, _yAxis, _zAxis);
  mat4.setPosition(_mid);
  return true;
}

export function truongTienMetrics(road) {
  if (!road?.points?.length) return null;
  const a = road.points[0];
  const b = road.points[road.points.length - 1];
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const length = Math.hypot(dx, dz) || 1;
  const tx = dx / length;
  const tz = dz / length;
  const nx = -tz;
  const nz = tx;
  const spanLen =
    (TRUONG_TIEN_TRUSS_END_S - TRUONG_TIEN_TRUSS_START_S) / TRUONG_TIEN_SPANS;
  const pierStations = [];
  for (let i = 1; i <= TRUONG_TIEN_PIER_COUNT; i++) {
    pierStations.push(TRUONG_TIEN_TRUSS_START_S + i * spanLen);
  }
  return { a, b, dx, dz, length, tx, tz, nx, nz, spanLen, pierStations };
}

export function truongTienDeckQuery(road, x, z) {
  const m = truongTienMetrics(road);
  if (!m) return { onBridge: false };
  const rx = x - m.a.x;
  const rz = z - m.a.z;
  const along = rx * m.tx + rz * m.tz;
  const lat = rx * m.nx + rz * m.nz;
  const absLat = Math.abs(lat);
  if (along < -1.5 || along > m.length + 1.5 || absLat > 12.2) {
    return { onBridge: false };
  }
  const t = Math.max(0, Math.min(1, along / m.length));
  const baseY = truongTienElevation(t);
  const inTrussZone =
    along >= TRUONG_TIEN_TRUSS_START_S && along <= TRUONG_TIEN_TRUSS_END_S;

  if (!inTrussZone) {
    const allowed = absLat <= 9.6;
    const isSidewalk = absLat >= TRUONG_TIEN_WALK_INNER - 0.1;
    return {
      onBridge: true,
      allowed,
      deckY: baseY + (isSidewalk ? TRUONG_TIEN_WALK_LIFT : 0),
      along,
      lat,
    };
  }

  // Inside 6-span truss corridor: separate roadway vs 2 outer walkways + 5 balcony pairs
  if (absLat <= TRUONG_TIEN_ROAD_HALF - 0.12) {
    return { onBridge: true, allowed: true, deckY: baseY, along, lat };
  }
  // Physical barrier along the left/right steel truss lines (±3.82m)
  if (absLat < TRUONG_TIEN_WALK_INNER - 0.05) {
    return { onBridge: true, allowed: false, deckY: baseY, along, lat };
  }
  const nearPier = m.pierStations.find(
    (ps) => Math.abs(along - ps) <= BALCONY_HALF_LEN,
  );
  let outerLimit = TRUONG_TIEN_WALK_OUTER - 0.16;
  if (nearPier !== undefined) {
    const taper = Math.max(
      0,
      1 - Math.abs(along - nearPier) / BALCONY_HALF_LEN,
    );
    const balconyExtend = Math.min(1, taper * 2.2);
    outerLimit =
      TRUONG_TIEN_WALK_OUTER -
      0.16 +
      (TRUONG_TIEN_BALCONY_OUTER - TRUONG_TIEN_WALK_OUTER) * balconyExtend;
  }
  const allowed = absLat <= outerLimit;
  return {
    onBridge: true,
    allowed,
    deckY: baseY + TRUONG_TIEN_WALK_LIFT,
    along,
    lat,
  };
}

function archHeight(u) {
  return 2.25 + 6.75 * Math.sin(Math.PI * Math.max(0, Math.min(1, u)));
}

function createBridgeAsphaltTexture(mobile = false) {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#484e52";
  ctx.fillRect(0, 0, width, height);

  let seed = 211;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < (mobile ? 3600 : 8000); i++) {
    const s = Math.floor(58 + rand() * 38);
    ctx.fillStyle = `rgba(${s},${s + 2},${s + 4},0.28)`;
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }

  // Subtle tire wear bands for all 4 two-way lanes
  for (const cx of [0.15, 0.375, 0.625, 0.85]) {
    const x = cx * width;
    const grad = ctx.createLinearGradient(x - 28, 0, x + 28, 0);
    grad.addColorStop(0, "rgba(32,35,38,0)");
    grad.addColorStop(0.5, "rgba(32,35,38,0.22)");
    grad.addColorStop(1, "rgba(32,35,38,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - 28, 0, 56, height);
  }

  // White carriageway outer edge stripes
  ctx.fillStyle = "#ebe6d8";
  ctx.fillRect(10, 0, 5, height);
  ctx.fillRect(width - 15, 0, 5, height);

  // Dashed white lane dividers separating inner & outer lanes on both directions
  ctx.fillStyle = "rgba(235, 230, 216, 0.9)";
  for (const lx of [width * 0.265, width * 0.735]) {
    for (let y = 12; y < height; y += 64) {
      ctx.fillRect(lx - 2, y, 4, 32);
    }
  }

  // Double solid golden-yellow 2-way center divider
  ctx.fillStyle = "#ebc262";
  ctx.fillRect(width / 2 - 6, 0, 4, height);
  ctx.fillRect(width / 2 + 2, 0, 4, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = mobile ? 2 : 4;
  return tex;
}

function createWalkwayStoneTexture(mobile = false) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#c3baa6";
  ctx.fillRect(0, 0, size, size);

  let seed = 409;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Granite/terracotta Huế promenade stone tile courses
  const rows = 8;
  const cols = 4;
  const rowH = size / rows;
  const colW = size / cols;
  const tones = ["#c8bfaa", "#bdb4a0", "#cfc6b2", "#b7ae9b", "#c5bca8"];
  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (colW / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * colW + offset;
      const y = r * rowH;
      ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
      ctx.fillRect(x + 1.5, y + 1.5, colW - 3, rowH - 3);
    }
  }

  // Subtle weathered stone speckles
  for (let i = 0; i < (mobile ? 1200 : 2800); i++) {
    const g = Math.floor(150 + rand() * 60);
    ctx.fillStyle = `rgba(${g},${g - 4},${g - 10},0.16)`;
    ctx.fillRect(rand() * size, rand() * size, 2, 2);
  }

  // Light granite edge curbs along both sides of walkway
  ctx.fillStyle = "#dad3c1";
  ctx.fillRect(0, 0, 12, size);
  ctx.fillRect(size - 12, 0, 12, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = mobile ? 2 : 4;
  return tex;
}

function createMasonryPierTexture(mobile = false) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#69675d";
  ctx.fillRect(0, 0, size, size);

  let seed = 773;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const rows = 10;
  const cols = 5;
  const rowH = size / rows;
  const colW = size / cols;
  for (let r = 0; r < rows; r++) {
    const shift = (r % 2) * (colW / 2);
    const wetDarken = r >= rows - 3 ? 0.72 : 1;
    for (let c = -1; c <= cols; c++) {
      const v = Math.floor((95 + rand() * 34) * wetDarken);
      ctx.fillStyle = `rgb(${v},${v - 2},${v - 8})`;
      ctx.fillRect(c * colW + shift + 1.5, r * rowH + 1.5, colW - 3, rowH - 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = mobile ? 1 : 2;
  return tex;
}

function sampleBridgeFrames(road) {
  const m = truongTienMetrics(road);
  if (!m) return null;
  const { a, b, length, tx, tz, nx, nz } = m;
  const pMid = road.points.length > 2 ? road.points[1] : null;
  const midLat = pMid
    ? (pMid.x - a.x) * nx + (pMid.z - a.z) * nz
    : 0;

  const stations = new Set([0, length]);
  for (let i = 0; i <= 72; i++) stations.add((i / 72) * length);
  stations.add(TRUONG_TIEN_TRUSS_START_S);
  stations.add(TRUONG_TIEN_TRUSS_END_S);
  for (const ps of m.pierStations) {
    stations.add(ps - BALCONY_HALF_LEN);
    stations.add(ps - BALCONY_HALF_LEN + 2.0);
    stations.add(ps);
    stations.add(ps + BALCONY_HALF_LEN - 2.0);
    stations.add(ps + BALCONY_HALF_LEN);
  }
  const sorted = [...stations]
    .filter((s) => s >= 0 && s <= length)
    .sort((p, q) => p - q);
  const frames = [];
  for (const s of sorted) {
    if (frames.length && Math.abs(s - frames.at(-1).s) < 0.05) continue;
    const t = s / length;
    const latShift = 4 * t * (1 - t) * midLat;
    frames.push({
      s,
      t,
      x: a.x + (b.x - a.x) * t + nx * latShift,
      z: a.z + (b.z - a.z) * t + nz * latShift,
      y: truongTienElevation(t),
      tx,
      tz,
      nx,
      nz,
    });
  }
  return { metrics: m, frames };
}

function frameAt(frames, s) {
  if (!frames.length) return null;
  if (s <= frames[0].s) return frames[0];
  if (s >= frames.at(-1).s) return frames.at(-1);
  for (let i = 1; i < frames.length; i++) {
    const f0 = frames[i - 1];
    const f1 = frames[i];
    if (s <= f1.s) {
      const ratio = (s - f0.s) / (f1.s - f0.s || 1);
      return {
        s,
        t: f0.t + (f1.t - f0.t) * ratio,
        x: f0.x + (f1.x - f0.x) * ratio,
        z: f0.z + (f1.z - f0.z) * ratio,
        y: truongTienElevation(f0.t + (f1.t - f0.t) * ratio),
        tx: f0.tx,
        tz: f0.tz,
        nx: f0.nx,
        nz: f0.nz,
      };
    }
  }
  return frames.at(-1);
}

function buildQuadStrip(frames, leftFn, rightFn, yFn, uRepeat = 12) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const left = typeof leftFn === "function" ? leftFn(f) : leftFn;
    const right = typeof rightFn === "function" ? rightFn(f) : rightFn;
    const dy = typeof yFn === "function" ? yFn(f) : yFn;
    const y = f.y + dy;
    positions.push(
      f.x + f.nx * left,
      y,
      f.z + f.nz * left,
      f.x + f.nx * right,
      y,
      f.z + f.nz * right,
    );
    uvs.push(0, f.s / uRepeat, 1, f.s / uRepeat);
    if (i > 0) {
      const base = (i - 1) * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildExtrudedStrip(frames, profileFn, uRepeat = 8) {
  const ring = profileFn(frames[0]).length;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const prof = profileFn(f);
    for (let k = 0; k < ring; k++) {
      const [lat, dy] = prof[k];
      positions.push(f.x + f.nx * lat, f.y + dy, f.z + f.nz * lat);
      uvs.push(k / ring, f.s / uRepeat);
    }
    if (i > 0) {
      const b0 = (i - 1) * ring;
      const b1 = i * ring;
      for (let k = 0; k < ring; k++) {
        const kn = (k + 1) % ring;
        indices.push(b0 + k, b0 + kn, b1 + k, b0 + kn, b1 + kn, b1 + k);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function createCutwaterPierGeometry(width, depth, height, bevel = 0.9) {
  // Oval / hexagonal cutwater pier cross-section in XZ, extruded along Y
  const hw = width / 2;
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + bevel, -hd);
  shape.lineTo(hw - bevel, -hd);
  shape.lineTo(hw, 0);
  shape.lineTo(hw - bevel, hd);
  shape.lineTo(-hw + bevel, hd);
  shape.lineTo(-hw, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
    curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function createDragonBoat(variant = 0) {
  const boat = new THREE.Group();
  const hullMat = new THREE.MeshStandardMaterial({
    color: "#3d2619",
    roughness: 0.78,
    metalness: 0.06,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: variant % 2 === 0 ? "#b8332a" : "#9d2b24",
    roughness: 0.5,
    metalness: 0.14,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: "#e2b24c",
    roughness: 0.34,
    metalness: 0.62,
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: variant % 2 === 0 ? "#d79e3b" : "#c58d35",
    roughness: 0.52,
    metalness: 0.18,
  });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: "#ffd98c",
    emissive: "#ffaa3b",
    emissiveIntensity: 1.0,
    roughness: 0.3,
  });

  // 1. Curved sampan hull
  const hullPts = [
    new THREE.Vector2(0.01, -6.8),
    new THREE.Vector2(1.15, -4.4),
    new THREE.Vector2(1.55, 0),
    new THREE.Vector2(1.15, 4.4),
    new THREE.Vector2(0.01, 6.8),
  ];
  const hullGeo = new THREE.LatheGeometry(hullPts, 10);
  hullGeo.rotateX(Math.PI / 2);
  hullGeo.scale(1, 0.42, 1);
  const hull = new THREE.Mesh(hullGeo, hullMat);
  hull.position.y = 0.25;
  boat.add(hull);

  // 2. Deck platform & red gunwale trim
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.14, 9.2), hullMat);
  deck.position.y = 0.46;
  boat.add(deck);

  for (const sx of [-1.22, 1.22]) {
    const gunwale = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.28, 9.8),
      trimMat,
    );
    gunwale.position.set(sx, 0.6, 0);
    boat.add(gunwale);
  }

  // 3. Sculpted Dragon Head Prow (bow) & Curved Phoenix Tail (stern)
  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.35, 0.65), trimMat);
  neck.position.set(0, 1.05, 6.1);
  neck.rotation.x = 0.32;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.56, 1.15), goldMat);
  head.position.set(0, 1.72, 6.5);
  head.rotation.x = -0.15;
  const crest = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 6), trimMat);
  crest.position.set(0, 2.15, 6.22);
  crest.rotation.x = -0.45;
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.25, 0.55), goldMat);
  tail.position.set(0, 1.05, -6.15);
  tail.rotation.x = -0.36;
  boat.add(neck, head, crest, tail);

  // 4. Imperial Pavilion Canopy & Upturned Roof Ridge
  for (const sx of [-1.05, 1.05]) {
    for (const sz of [-3.1, 0, 3.1]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.45, 6),
        trimMat,
      );
      col.position.set(sx, 1.25, sz);
      boat.add(col);
    }
  }
  const roofLeft = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.09, 7.6),
    roofMat,
  );
  roofLeft.position.set(-0.62, 2.08, 0);
  roofLeft.rotation.z = 0.26;
  const roofRight = new THREE.Mesh(
    new THREE.BoxGeometry(1.42, 0.09, 7.6),
    roofMat,
  );
  roofRight.position.set(0.62, 2.08, 0);
  roofRight.rotation.z = -0.26;
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 7.9), goldMat);
  ridge.position.y = 2.3;
  boat.add(roofLeft, roofRight, ridge);

  // 5. Glowing festival lanterns along canopy eaves
  for (const sx of [-1.18, 1.18]) {
    for (const sz of [-2.4, 0, 2.4]) {
      const lantern = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.15, 0),
        lanternMat,
      );
      lantern.position.set(sx, 1.72, sz);
      boat.add(lantern);
    }
  }

  return boat;
}

export function addTruongTienBridge(world, road) {
  if (!road) return null;
  const sampled = sampleBridgeFrames(road);
  if (!sampled || sampled.frames.length < 2) return null;

  const { metrics, frames } = sampled;
  const mobile = Boolean(world.quality?.mobile);
  const group = new THREE.Group();
  group.name = "truong-tien-bridge";

  // 1. Materials & SRGB procedural CanvasTextures
  const asphaltTex = createBridgeAsphaltTexture(mobile);
  const stoneTex = createWalkwayStoneTexture(mobile);
  const masonryTex = createMasonryPierTexture(mobile);

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: asphaltTex,
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const stoneWalkMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: stoneTex,
    roughness: 0.86,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const masonryMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: masonryTex,
    roughness: 0.92,
    metalness: 0.05,
  });
  const steelTrussMat = new THREE.MeshStandardMaterial({
    color: "#e8eef3",
    roughness: 0.3,
    metalness: 0.28,
  });
  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: "#99a6b2",
    roughness: 0.38,
    metalness: 0.3,
  });
  const deckConcreteMat = new THREE.MeshStandardMaterial({
    color: "#c5c1b5",
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const balustradeMat = new THREE.MeshStandardMaterial({
    color: "#7a8691",
    roughness: 0.38,
    metalness: 0.32,
    side: THREE.DoubleSide,
  });
  const goldGlowMat = new THREE.MeshStandardMaterial({
    color: "#ffe199",
    emissive: "#ffb347",
    emissiveIntensity: 1.05,
    roughness: 0.25,
    metalness: 0.1,
  });
  const lanternGlowMat = new THREE.MeshStandardMaterial({
    color: "#fff4d2",
    emissive: "#ffd278",
    emissiveIntensity: 1.1,
    roughness: 0.2,
  });
  const archAccentMat = new THREE.MeshStandardMaterial({
    color: "#f4d28b",
    emissive: "#ffbe55",
    emissiveIntensity: 0.65,
    roughness: 0.3,
  });

  // 2. Smooth 4-lane 2-way Asphalt Roadway & Flared Approach Aprons
  const asphaltGeo = buildQuadStrip(
    frames,
    (f) => {
      if (f.s < TRUONG_TIEN_TRUSS_START_S) {
        const k = 1 - f.s / TRUONG_TIEN_TRUSS_START_S;
        return -(TRUONG_TIEN_ROAD_HALF - 0.8 * k);
      }
      if (f.s > TRUONG_TIEN_TRUSS_END_S) {
        const k =
          (f.s - TRUONG_TIEN_TRUSS_END_S) /
          (metrics.length - TRUONG_TIEN_TRUSS_END_S || 1);
        return -(TRUONG_TIEN_ROAD_HALF - 0.8 * k);
      }
      return -TRUONG_TIEN_ROAD_HALF;
    },
    (f) => {
      if (f.s < TRUONG_TIEN_TRUSS_START_S) {
        const k = 1 - f.s / TRUONG_TIEN_TRUSS_START_S;
        return TRUONG_TIEN_ROAD_HALF - 0.8 * k;
      }
      if (f.s > TRUONG_TIEN_TRUSS_END_S) {
        const k =
          (f.s - TRUONG_TIEN_TRUSS_END_S) /
          (metrics.length - TRUONG_TIEN_TRUSS_END_S || 1);
        return TRUONG_TIEN_ROAD_HALF - 0.8 * k;
      }
      return TRUONG_TIEN_ROAD_HALF;
    },
    0.015,
    12,
  );
  const asphaltMesh = new THREE.Mesh(asphaltGeo, asphaltMat);
  asphaltMesh.receiveShadow = true;
  group.add(asphaltMesh);

  // 3. 2 Cantilevered Pedestrian Walkways + 5 Pairs of Viewing Balconies
  const balconyOuterAt = (s) => {
    for (const ps of metrics.pierStations) {
      const dist = Math.abs(s - ps);
      if (dist <= BALCONY_HALF_LEN) {
        const ratio = Math.min(1, ((BALCONY_HALF_LEN - dist) / 2.0));
        return (
          TRUONG_TIEN_WALK_OUTER +
          (TRUONG_TIEN_BALCONY_OUTER - TRUONG_TIEN_WALK_OUTER) * ratio
        );
      }
    }
    return TRUONG_TIEN_WALK_OUTER;
  };

  const walkFrames = frames.filter(
    (f) =>
      f.s >= TRUONG_TIEN_TRUSS_START_S - 1 &&
      f.s <= TRUONG_TIEN_TRUSS_END_S + 1,
  );
  const walkTopGeos = [];
  const deckStructureGeos = [];

  for (const side of [-1, 1]) {
    walkTopGeos.push(
      buildQuadStrip(
        walkFrames,
        (f) =>
          side < 0 ? -balconyOuterAt(f.s) : TRUONG_TIEN_WALK_INNER,
        (f) =>
          side < 0 ? -TRUONG_TIEN_WALK_INNER : balconyOuterAt(f.s),
        TRUONG_TIEN_WALK_LIFT + 0.004,
        4.2,
      ),
    );
    // Outer walkway structural slab, curb lip, and angled cantilever fascia
    deckStructureGeos.push(
      buildExtrudedStrip(
        walkFrames,
        (f) => {
          const outer = balconyOuterAt(f.s);
          return [
            [side * TRUONG_TIEN_WALK_INNER, TRUONG_TIEN_WALK_LIFT],
            [side * outer, TRUONG_TIEN_WALK_LIFT],
            [side * (outer + 0.06), -0.34],
            [side * TRUONG_TIEN_WALK_INNER, -0.44],
          ];
        },
        8,
      ),
    );
    // Inner roadway wheel-guard curb along trusses
    deckStructureGeos.push(
      buildExtrudedStrip(
        walkFrames,
        () => [
          [side * (TRUONG_TIEN_ROAD_HALF - 0.02), 0.0],
          [side * (TRUONG_TIEN_ROAD_HALF - 0.02), 0.16],
          [side * (TRUONG_TIEN_TRUSS_HALF + 0.22), 0.16],
          [side * (TRUONG_TIEN_TRUSS_HALF + 0.22), -0.45],
          [side * (TRUONG_TIEN_ROAD_HALF - 0.02), -0.45],
        ],
        8,
      ),
    );
  }

  // Main carriageway structural box-slab underside
  deckStructureGeos.push(
    buildExtrudedStrip(
      frames,
      () => [
        [-TRUONG_TIEN_ROAD_HALF - 0.1, -0.02],
        [TRUONG_TIEN_ROAD_HALF + 0.1, -0.02],
        [TRUONG_TIEN_ROAD_HALF + 0.1, -0.46],
        [-TRUONG_TIEN_ROAD_HALF - 0.1, -0.46],
      ],
      10,
    ),
  );

  // Continuous lower steel chord girder along both truss lines (±3.82m)
  const lowerChordGeos = [];
  for (const side of [-1, 1]) {
    const cx = side * TRUONG_TIEN_TRUSS_HALF;
    lowerChordGeos.push(
      buildExtrudedStrip(
        walkFrames,
        () => [
          [cx - 0.19, 0.22],
          [cx + 0.19, 0.22],
          [cx + 0.19, -0.44],
          [cx - 0.19, -0.44],
        ],
        6,
      ),
    );
  }

  const walkTopMesh = new THREE.Mesh(mergeGeometries(walkTopGeos), stoneWalkMat);
  walkTopGeos.forEach((g) => g.dispose());
  walkTopMesh.receiveShadow = true;
  group.add(walkTopMesh);

  const deckMesh = new THREE.Mesh(
    mergeGeometries(deckStructureGeos),
    deckConcreteMat,
  );
  deckStructureGeos.forEach((g) => g.dispose());
  deckMesh.castShadow = true;
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  const lowerChordMesh = new THREE.Mesh(
    mergeGeometries(lowerChordGeos),
    steelTrussMat,
  );
  lowerChordGeos.forEach((g) => g.dispose());
  lowerChordMesh.castShadow = true;
  lowerChordMesh.receiveShadow = true;
  group.add(lowerChordMesh);

  // Outer balustrade top & bottom rails following walkways & viewing balconies
  const railProfileGeos = [];
  for (const side of [-1, 1]) {
    for (const [ry, halfThick] of [
      [TRUONG_TIEN_WALK_LIFT + 1.04, 0.045],
      [TRUONG_TIEN_WALK_LIFT + 0.12, 0.03],
    ]) {
      railProfileGeos.push(
        buildExtrudedStrip(
          walkFrames,
          (f) => {
            const lat = side * (balconyOuterAt(f.s) - 0.07);
            return [
              [lat - halfThick, ry - halfThick],
              [lat + halfThick, ry - halfThick],
              [lat + halfThick, ry + halfThick],
              [lat - halfThick, ry + halfThick],
            ];
          },
          6,
        ),
      );
    }
  }
  const outerRailMesh = new THREE.Mesh(
    mergeGeometries(railProfileGeos),
    balustradeMat,
  );
  railProfileGeos.forEach((g) => g.dispose());
  group.add(outerRailMesh);

  // 4. "6 Vài 12 Nhịp" Steel Pratt/Parker Arch Trusses & Overhead Cross-Portal Bracing
  const chordSegments = [];
  const verticalPosts = [];
  const diagonalBars = [];
  const overheadStruts = [];
  const gussetNodes = [];
  const accentStrips = [];
  const lanternPositions = [];

  const nVec = new THREE.Vector3(metrics.nx, 0, metrics.nz);
  const tVec = new THREE.Vector3(metrics.tx, 0, metrics.tz);

  const nodeAt = (s, lat, dy) => {
    const f = frameAt(frames, s);
    return {
      x: f.x + f.nx * lat,
      y: f.y + dy,
      z: f.z + f.nz * lat,
      deckY: f.y,
    };
  };

  for (let span = 0; span < TRUONG_TIEN_SPANS; span++) {
    const s0 = TRUONG_TIEN_TRUSS_START_S + span * metrics.spanLen;
    for (const side of [-1, 1]) {
      const lat = side * TRUONG_TIEN_TRUSS_HALF;
      const topNodes = [];
      const botNodes = [];
      for (let k = 0; k <= PANELS_PER_SPAN; k++) {
        const u = k / PANELS_PER_SPAN;
        const s = s0 + u * metrics.spanLen;
        const h = archHeight(u);
        const top = nodeAt(s, lat, h);
        const bot = nodeAt(s, lat, 0.06);
        topNodes.push(top);
        botNodes.push(bot);
        verticalPosts.push({ a: bot, b: top });
        gussetNodes.push(top);
      }

      for (let k = 0; k < PANELS_PER_SPAN; k++) {
        chordSegments.push({ a: topNodes[k], b: topNodes[k + 1] });
        if (k >= 1 && k <= PANELS_PER_SPAN - 2) {
          accentStrips.push({
            a: {
              x: topNodes[k].x,
              y: topNodes[k].y - 0.19,
              z: topNodes[k].z,
            },
            b: {
              x: topNodes[k + 1].x,
              y: topNodes[k + 1].y - 0.19,
              z: topNodes[k + 1].z,
            },
          });
        }
        // Pratt primary diagonal rising toward mid-span + counter-diagonal in center bays
        if (k < PANELS_PER_SPAN / 2) {
          diagonalBars.push({ a: botNodes[k], b: topNodes[k + 1] });
          if (k >= 1) diagonalBars.push({ a: topNodes[k], b: botNodes[k + 1] });
        } else {
          diagonalBars.push({ a: topNodes[k], b: botNodes[k + 1] });
          if (k <= PANELS_PER_SPAN - 2) {
            diagonalBars.push({ a: botNodes[k], b: topNodes[k + 1] });
          }
        }
      }

      // Heritage warm bridge lanterns inside trusses (bays 1, 3, 5, 7, 9)
      for (const k of [1, 3, 5, 7, 9]) {
        const u = k / PANELS_PER_SPAN;
        const f = frameAt(frames, s0 + u * metrics.spanLen);
        lanternPositions.push({
          x: f.x + f.nx * side * (TRUONG_TIEN_TRUSS_HALF - 0.34),
          y: f.y + 3.45,
          z: f.z + f.nz * side * (TRUONG_TIEN_TRUSS_HALF - 0.34),
          side,
          f,
        });
      }
    }

    // Overhead cross-portal beams, knee-braces & top X-bracing between left & right arches
    const portalPanels = [2, 3, 4, 5, 6, 7, 8];
    const leftTops = portalPanels.map((k) => {
      const u = k / PANELS_PER_SPAN;
      return nodeAt(
        s0 + u * metrics.spanLen,
        -TRUONG_TIEN_TRUSS_HALF,
        archHeight(u),
      );
    });
    const rightTops = portalPanels.map((k) => {
      const u = k / PANELS_PER_SPAN;
      return nodeAt(
        s0 + u * metrics.spanLen,
        TRUONG_TIEN_TRUSS_HALF,
        archHeight(u),
      );
    });
    for (let idx = 0; idx < portalPanels.length; idx++) {
      const lt = leftTops[idx];
      const rt = rightTops[idx];
      overheadStruts.push({ a: lt, b: rt });
      // Corner knee-braces down along vertical end-posts
      for (const [edge, sign] of [
        [lt, 1],
        [rt, -1],
      ]) {
        const inner = {
          x: edge.x + metrics.nx * sign * 1.65,
          y: edge.y - 0.05,
          z: edge.z + metrics.nz * sign * 1.65,
        };
        const lower = { x: edge.x, y: edge.y - 1.55, z: edge.z };
        diagonalBars.push({ a: inner, b: lower });
      }
      if (idx < portalPanels.length - 1) {
        overheadStruts.push({ a: lt, b: rightTops[idx + 1] });
        overheadStruts.push({ a: rt, b: leftTops[idx + 1] });
      }
    }
  }

  const unitBox = new THREE.BoxGeometry(1, 1, 1);

  const buildInstancedMembers = (
    items,
    material,
    w,
    v,
    refVec,
    castShadow = true,
  ) => {
    if (!items.length) return null;
    const inst = new THREE.InstancedMesh(unitBox, material, items.length);
    let idx = 0;
    for (const item of items) {
      if (setMemberMatrix(_mat4, item.a, item.b, w, v, refVec)) {
        inst.setMatrixAt(idx++, _mat4);
      }
    }
    inst.count = idx;
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.castShadow = castShadow;
    inst.receiveShadow = true;
    group.add(inst);
    return inst;
  };

  buildInstancedMembers(chordSegments, steelTrussMat, 0.36, 0.32, nVec, true);
  buildInstancedMembers(verticalPosts, steelTrussMat, 0.24, 0.24, nVec, true);
  buildInstancedMembers(diagonalBars, steelDarkMat, 0.13, 0.13, nVec, true);
  buildInstancedMembers(overheadStruts, steelDarkMat, 0.16, 0.16, tVec, false);
  buildInstancedMembers(accentStrips, archAccentMat, 0.09, 0.09, nVec, false);

  // Riveted gusset joint blocks at upper arch chord vertices
  if (gussetNodes.length) {
    const gussetGeo = new THREE.BoxGeometry(0.42, 0.36, 0.56);
    const gussets = new THREE.InstancedMesh(
      gussetGeo,
      steelDarkMat,
      gussetNodes.length,
    );
    const yaw = Math.atan2(metrics.tx, metrics.tz);
    const dummy = new THREE.Object3D();
    gussetNodes.forEach((n, i) => {
      dummy.position.set(n.x, n.y, n.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      gussets.setMatrixAt(i, dummy.matrix);
    });
    gussets.instanceMatrix.needsUpdate = true;
    gussets.computeBoundingSphere();
    group.add(gussets);
  }

  // 5. Under-Deck Transverse Cantilever Floor Beams (~120 beams supporting roadway & walkways)
  const crossBeamFrames = [];
  for (
    let s = TRUONG_TIEN_TRUSS_START_S;
    s <= TRUONG_TIEN_TRUSS_END_S;
    s += 3.21
  ) {
    crossBeamFrames.push(frameAt(frames, s));
  }
  if (crossBeamFrames.length) {
    const cbGeo = new THREE.BoxGeometry(19.3, 0.32, 0.24);
    const crossBeams = new THREE.InstancedMesh(
      cbGeo,
      steelDarkMat,
      crossBeamFrames.length,
    );
    const yaw = Math.atan2(metrics.tx, metrics.tz);
    const dummy = new THREE.Object3D();
    crossBeamFrames.forEach((f, i) => {
      dummy.position.set(f.x, f.y - 0.54, f.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      crossBeams.setMatrixAt(i, dummy.matrix);
    });
    crossBeams.instanceMatrix.needsUpdate = true;
    crossBeams.computeBoundingSphere();
    group.add(crossBeams);
  }

  // 6. Outer Diamond-Lattice Balustrade Stanchions & X-Panels
  const balustradeStep = mobile ? 2.8 : 2.15;
  const stanchions = [];
  const latticeBars = [];
  for (const side of [-1, 1]) {
    let prevPt = null;
    for (
      let s = TRUONG_TIEN_TRUSS_START_S;
      s <= TRUONG_TIEN_TRUSS_END_S + 0.01;
      s += balustradeStep
    ) {
      const cs = Math.min(s, TRUONG_TIEN_TRUSS_END_S);
      const f = frameAt(frames, cs);
      const lat = side * (balconyOuterAt(cs) - 0.07);
      const basePt = {
        x: f.x + f.nx * lat,
        y: f.y + TRUONG_TIEN_WALK_LIFT + 0.04,
        z: f.z + f.nz * lat,
      };
      const topPt = {
        x: basePt.x,
        y: basePt.y + 1.0,
        z: basePt.z,
      };
      stanchions.push({ a: basePt, b: topPt });
      if (prevPt) {
        latticeBars.push({ a: prevPt.base, b: topPt });
        latticeBars.push({ a: prevPt.top, b: basePt });
      }
      prevPt = { base: basePt, top: topPt };
    }
  }
  buildInstancedMembers(stanchions, balustradeMat, 0.06, 0.06, nVec, false);
  buildInstancedMembers(latticeBars, balustradeMat, 0.035, 0.035, nVec, false);

  // 7. 5 Rounded Stone Masonry River Piers + 2 Shore Stone Abutments
  const yaw = Math.atan2(metrics.tx, metrics.tz);
  const dummy = new THREE.Object3D();
  const pierGroup = new THREE.Group();
  const pierSubmergedGeo = createCutwaterPierGeometry(23.2, 3.8, 1.2, 1.25);
  const pierShaftGeo = createCutwaterPierGeometry(22.2, 3.0, 3.8, 1.1);
  const pierCapGeo = createCutwaterPierGeometry(22.8, 3.4, 0.36, 1.15);

  const submergedInst = new THREE.InstancedMesh(
    pierSubmergedGeo,
    masonryMat,
    TRUONG_TIEN_PIER_COUNT,
  );
  const shaftInst = new THREE.InstancedMesh(
    pierShaftGeo,
    masonryMat,
    TRUONG_TIEN_PIER_COUNT,
  );
  const capInst = new THREE.InstancedMesh(
    pierCapGeo,
    deckConcreteMat,
    TRUONG_TIEN_PIER_COUNT,
  );
  const bearingGeo = new THREE.BoxGeometry(0.95, 0.42, 1.35);
  const bearingInst = new THREE.InstancedMesh(
    bearingGeo,
    steelDarkMat,
    TRUONG_TIEN_PIER_COUNT * 2,
  );
  const pierGlowGeo = new THREE.BoxGeometry(19.6, 0.14, 3.06);
  const pierGlowInst = new THREE.InstancedMesh(
    pierGlowGeo,
    goldGlowMat,
    TRUONG_TIEN_PIER_COUNT,
  );

  let bearingIdx = 0;
  metrics.pierStations.forEach((ps, idx) => {
    const f = frameAt(frames, ps);
    const pierTopY = f.y - 0.42;
    const shaftHeight = Math.max(1.2, pierTopY - 0.15);

    dummy.position.set(f.x, -0.85, f.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    submergedInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(f.x, 0.15, f.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, shaftHeight / 3.8, 1);
    dummy.updateMatrix();
    shaftInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(f.x, pierTopY - 0.24, f.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    capInst.setMatrixAt(idx, dummy.matrix);

    // Warm golden uplight collar under balcony/pier cap
    dummy.position.set(f.x, pierTopY - 0.36, f.z);
    dummy.rotation.set(0, yaw, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    pierGlowInst.setMatrixAt(idx, dummy.matrix);

    // Twin steel bearing shoes directly supporting the 2 side arch trusses
    for (const side of [-1, 1]) {
      dummy.position.set(
        f.x + f.nx * side * TRUONG_TIEN_TRUSS_HALF,
        pierTopY + 0.08,
        f.z + f.nz * side * TRUONG_TIEN_TRUSS_HALF,
      );
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bearingInst.setMatrixAt(bearingIdx++, dummy.matrix);
    }
  });

  for (const inst of [
    submergedInst,
    shaftInst,
    capInst,
    bearingInst,
    pierGlowInst,
  ]) {
    inst.instanceMatrix.needsUpdate = true;
    inst.computeBoundingSphere();
    inst.castShadow = inst !== pierGlowInst;
    inst.receiveShadow = true;
    pierGroup.add(inst);
  }
  group.add(pierGroup);

  // 2 Shore Stone Abutments + 4 Ceremonial Huế Bridgehead Lantern Pylons
  const abutmentGeo = new THREE.BoxGeometry(20.6, 2.0, 3.0);
  const pylonBaseGeo = new THREE.BoxGeometry(0.95, 2.6, 0.95);
  const pylonCapGeo = new THREE.BoxGeometry(1.18, 0.22, 1.18);
  const pylonLanternGeo = new THREE.CylinderGeometry(0.28, 0.24, 0.56, 6);
  const pylonRoofGeo = new THREE.ConeGeometry(0.46, 0.34, 6);

  for (const [endIdx, sAbut] of [
    TRUONG_TIEN_TRUSS_START_S,
    TRUONG_TIEN_TRUSS_END_S,
  ].entries()) {
    const dir = endIdx === 0 ? -1 : 1;
    const f = frameAt(frames, sAbut);
    const abut = new THREE.Mesh(abutmentGeo, masonryMat);
    abut.position.set(f.x, f.y - 0.98, f.z);
    abut.rotation.y = yaw;
    abut.castShadow = true;
    abut.receiveShadow = true;
    group.add(abut);

    const pFrame = frameAt(frames, sAbut + dir * 1.4);
    for (const side of [-1, 1]) {
      const px = pFrame.x + pFrame.nx * side * 9.72;
      const pz = pFrame.z + pFrame.nz * side * 9.72;
      const pylon = new THREE.Group();
      const plinth = new THREE.Mesh(pylonBaseGeo, deckConcreteMat);
      plinth.position.y = 1.3;
      const cornice = new THREE.Mesh(pylonCapGeo, masonryMat);
      cornice.position.y = 2.66;
      const lantern = new THREE.Mesh(pylonLanternGeo, lanternGlowMat);
      lantern.position.y = 3.05;
      const roof = new THREE.Mesh(pylonRoofGeo, balustradeMat);
      roof.position.y = 3.48;
      pylon.add(plinth, cornice, lantern, roof);
      pylon.position.set(px, pFrame.y - 0.1, pz);
      pylon.rotation.y = yaw;
      group.add(pylon);
    }
  }

  // 8. Golden-Amber Fascia Decorative Lights & Heritage Truss Lanterns ("Hoa Lệ")
  const fasciaLightFrames = [];
  for (
    let s = TRUONG_TIEN_TRUSS_START_S + 3.2;
    s <= TRUONG_TIEN_TRUSS_END_S - 3.2;
    s += 6.42
  ) {
    fasciaLightFrames.push(frameAt(frames, s));
  }
  if (fasciaLightFrames.length) {
    const fLightGeo = new THREE.BoxGeometry(0.14, 0.2, 0.85);
    const fasciaLights = new THREE.InstancedMesh(
      fLightGeo,
      goldGlowMat,
      fasciaLightFrames.length * 2,
    );
    let idx = 0;
    for (const f of fasciaLightFrames) {
      const outer = balconyOuterAt(f.s);
      for (const side of [-1, 1]) {
        dummy.position.set(
          f.x + f.nx * side * (outer + 0.05),
          f.y - 0.12,
          f.z + f.nz * side * (outer + 0.05),
        );
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        fasciaLights.setMatrixAt(idx++, dummy.matrix);
      }
    }
    fasciaLights.instanceMatrix.needsUpdate = true;
    fasciaLights.computeBoundingSphere();
    group.add(fasciaLights);
  }

  if (lanternPositions.length) {
    const bracketGeo = new THREE.BoxGeometry(0.36, 0.08, 0.08);
    const globeGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.28, 6);
    const brackets = new THREE.InstancedMesh(
      bracketGeo,
      balustradeMat,
      lanternPositions.length,
    );
    const globes = new THREE.InstancedMesh(
      globeGeo,
      lanternGlowMat,
      lanternPositions.length,
    );
    lanternPositions.forEach((lp, i) => {
      dummy.position.set(
        lp.x + lp.f.nx * lp.side * 0.18,
        lp.y + 0.14,
        lp.z + lp.f.nz * lp.side * 0.18,
      );
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      brackets.setMatrixAt(i, dummy.matrix);

      dummy.position.set(lp.x, lp.y, lp.z);
      dummy.updateMatrix();
      globes.setMatrixAt(i, dummy.matrix);
    });
    for (const inst of [brackets, globes]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      group.add(inst);
    }
  }

  // 9. Traditional Huế Dragon Boats (Thuyền Rồng) & River Navigation Buoys on the Hương River
  const boats = [];
  const buoys = [];
  const animatedObjects = [];
  const riverRings = world.riverRings || [];
  const inRiver = (pt) =>
    !riverRings.length || riverRings.some((ring) => inside(pt, ring));
  const boatConfigs = [
    { s: 108, lat: -52, yawOffset: 1.35, phase: 0.2 },
    { s: 175, lat: -74, yawOffset: -1.65, phase: 1.7 },
    { s: 245, lat: -48, yawOffset: 1.52, phase: 3.1 },
    { s: 158, lat: 62, yawOffset: -1.48, phase: 4.5 },
  ];
  boatConfigs.forEach((cfg, idx) => {
    const f = frameAt(frames, cfg.s);
    const bx = f.x + f.nx * cfg.lat;
    const bz = f.z + f.nz * cfg.lat;
    if (!inRiver({ x: bx, z: bz })) return;
    const boat = createDragonBoat(idx);
    boat.position.set(bx, 0.04, bz);
    boat.rotation.y = yaw + cfg.yawOffset;
    group.add(boat);
    boats.push({
      mesh: boat,
      baseX: bx,
      baseZ: bz,
      baseYaw: yaw + cfg.yawOffset,
      phase: cfg.phase,
    });
    animatedObjects.push(boat);
  });

  const buoyCoords = [
    { s: 120, lat: -26, color: "#c94538" },
    { s: 255, lat: -30, color: "#c94538" },
    { s: 145, lat: 28, color: "#2d8a64" },
    { s: 270, lat: 34, color: "#c94538" },
  ];
  const buoyBaseMat = (color) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.25 });
  for (const [idx, b] of buoyCoords.entries()) {
    const f = frameAt(frames, b.s);
    const x = f.x + f.nx * b.lat;
    const z = f.z + f.nz * b.lat;
    if (!inRiver({ x, z })) continue;
    const buoy = new THREE.Group();
    const floatRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.65, 0.36, 10),
      buoyBaseMat(b.color),
    );
    floatRing.position.y = 0.14;
    const tower = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.9, 8),
      steelTrussMat,
    );
    tower.position.y = 0.72;
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 8, 6),
      goldGlowMat,
    );
    beacon.position.y = 1.22;
    buoy.add(floatRing, tower, beacon);
    buoy.position.set(x, 0.02, z);
    group.add(buoy);
    buoys.push({ mesh: buoy, phase: idx * 1.4 });
    animatedObjects.push(buoy);
  }

  world.scene.add(group);
  world.cameraObstacles?.push(deckMesh, walkTopMesh);

  world.truongTienBridge = {
    group,
    spanCount: TRUONG_TIEN_SPANS,
    archCount: TRUONG_TIEN_ARCH_COUNT,
    pierCount: TRUONG_TIEN_PIER_COUNT,
    balconyCount: TRUONG_TIEN_PIER_COUNT * 2,
    boatCount: boats.length,
    roadHalfWidth: TRUONG_TIEN_ROAD_HALF,
    walkwayBounds: [TRUONG_TIEN_WALK_INNER, TRUONG_TIEN_WALK_OUTER],
    animatedObjects,
    road,
    update(time) {
      for (const b of boats) {
        b.mesh.position.y = 0.04 + Math.sin(time * 1.3 + b.phase) * 0.045;
        b.mesh.rotation.z = Math.sin(time * 1.05 + b.phase) * 0.022;
        b.mesh.rotation.x = Math.cos(time * 0.85 + b.phase) * 0.014;
        b.mesh.position.x =
          b.baseX + Math.sin(time * 0.18 + b.phase) * 0.9 * metrics.nx;
        b.mesh.position.z =
          b.baseZ + Math.sin(time * 0.18 + b.phase) * 0.9 * metrics.nz;
      }
      for (const buoy of buoys) {
        buoy.mesh.position.y =
          0.02 + Math.sin(time * 1.8 + buoy.phase) * 0.035;
        buoy.mesh.rotation.z = Math.sin(time * 1.4 + buoy.phase) * 0.06;
      }
    },
  };

  return world.truongTienBridge;
}
