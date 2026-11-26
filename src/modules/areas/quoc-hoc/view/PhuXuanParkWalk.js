import * as THREE from "three";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import {
  applyWorldPlanarUVs,
  createBrickCementWalkMaterial,
  createCanvasTexture,
  createIronwoodWalkMaterial,
  createManicuredLawnMaterial,
  createParkGraniteTexture,
} from "../../../../core/world/turfTextures.js";
import {
  createBadmintonGroup,
  createDaCauGroup,
  createGuitarCircleGroup,
  createKiteFlyingGroup,
  createSeatedBenchCouple,
} from "../../../../core/world/RiversideParkLife.js";

function createMarigoldAccentTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#e8ad14";
      ctx.fillRect(0, 0, w, h);
      const tones = ["#ffd624", "#f5be10", "#ffdf48", "#d9980e", "#5b8c32"];
      for (let i = 0; i < 900; i++) {
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

function buildWalkRibbonGeometry(points, width, y = 0.24) {
  const halfW = width / 2;
  const positions = [];
  const uvs = [];
  const indices = [];
  let arc = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i > 0) {
      arc += Math.hypot(p.lx - points[i - 1].lx, p.lz - points[i - 1].lz);
    }
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.lx - prev.lx;
    const dz = next.lz - prev.lz;
    const len = Math.hypot(dx, dz) || 1;
    const nx = (-dz / len) * halfW;
    const nz = (dx / len) * halfW;

    positions.push(p.lx + nx, y, p.lz + nz, p.lx - nx, y, p.lz - nz);
    uvs.push(0, arc / 6.5, width / 6.5, arc / 6.5);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  applyWorldPlanarUVs(geo, 6.5);
  geo.computeVertexNormals();
  return geo;
}

function buildIronwoodRibbonGeometry(points, width, y = 0.256, plankRepeatLength = 3.2) {
  const halfW = width / 2;
  const positions = [];
  const uvs = [];
  const indices = [];
  let arc = 0;

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i > 0) {
      arc += Math.hypot(p.lx - points[i - 1].lx, p.lz - points[i - 1].lz);
    }
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.lx - prev.lx;
    const dz = next.lz - prev.lz;
    const len = Math.hypot(dx, dz) || 1;
    const nx = (-dz / len) * halfW;
    const nz = (dx / len) * halfW;

    positions.push(p.lx + nx, y, p.lz + nz, p.lx - nx, y, p.lz - nz);
    uvs.push(0, arc / plankRepeatLength, 1, arc / plankRepeatLength);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildRibbonSideCurbGeometry(points, halfOffset, width, topY, bottomY) {
  const halfW = width / 2;
  const positions = [];
  const indices = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.lx - prev.lx;
    const dz = next.lz - prev.lz;
    const len = Math.hypot(dx, dz) || 1;
    const ux = -dz / len;
    const uz = dx / len;
    const cx = p.lx + ux * halfOffset;
    const cz = p.lz + uz * halfOffset;

    positions.push(
      cx + ux * -halfW, bottomY, cz + uz * -halfW,
      cx + ux * -halfW, topY, cz + uz * -halfW,
      cx + ux * halfW, topY, cz + uz * halfW,
      cx + ux * halfW, bottomY, cz + uz * halfW,
    );
    if (i > 0) {
      const b0 = (i - 1) * 4;
      const b1 = i * 4;
      for (let k = 0; k < 4; k++) {
        const kn = (k + 1) % 4;
        indices.push(b0 + k, b0 + kn, b1 + k, b0 + kn, b1 + kn, b1 + k);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildPolygonLawnGeometry(boundaryPoints, tileMeters = 14) {
  const shape = new THREE.Shape(
    boundaryPoints.map((p) => new THREE.Vector2(p.lx, -p.lz)),
  );
  const geo = new THREE.ShapeGeometry(shape);
  geo.rotateX(-Math.PI / 2);
  return applyWorldPlanarUVs(geo, tileMeters);
}

function distPointToSegment(px, pz, a, b) {
  const dx = b.lx - a.lx;
  const dz = b.lz - a.lz;
  const lenSq = dx * dx + dz * dz || 1;
  const t = Math.max(0, Math.min(1, ((px - a.lx) * dx + (pz - a.lz) * dz) / lenSq));
  return Math.hypot(px - (a.lx + dx * t), pz - (a.lz + dz * t));
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

function createParkBench(x, y, z, yaw = Math.PI) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  for (const sx of [-0.72, 0.72]) {
    g.add(
      box([0.08, 0.44, 0.5], "#2f3c38", [sx, 0.22, 0]),
      box([0.07, 0.46, 0.07], "#2f3c38", [sx, 0.64, -0.22]),
    );
  }
  g.add(
    box([1.75, 0.07, 0.46], "#9e6b42", [0, 0.45, 0.02]),
    box([1.75, 0.34, 0.06], "#a67147", [0, 0.72, -0.22]),
  );
  return g;
}

function createFanPalm(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.13;
  const palmH = 5.2 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.27 * scale, palmH, 8),
    mat("#7b6a56", 0.92),
  );
  trunk.position.y = palmH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const frondMat = mat("#427a34", 0.82);
  const brightFrondMat = mat("#589441", 0.8);
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9;
    const tilt = 0.55 + (i % 3) * 0.22;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.66 * scale, 2.4 * scale, 5),
      i % 2 === 0 ? frondMat : brightFrondMat,
    );
    frond.position.set(
      Math.cos(a) * 1.0 * scale,
      palmH + 0.14 * scale - (i % 2) * 0.24 * scale,
      Math.sin(a) * 1.0 * scale,
    );
    frond.rotation.z = -Math.cos(a) * tilt;
    frond.rotation.x = Math.sin(a) * tilt;
    frond.scale.set(1.25, 1, 0.35);
    frond.castShadow = true;
    g.add(frond);
  }
  return g;
}

function createGardenTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.37;
  const trunkH = 2.6 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.24 * scale, trunkH, 7),
    mat("#6a5642", 0.9),
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const tones = ["#3f7735", "#4f8a3f", "#5e9846"];
  const crowns = [
    [0, trunkH + 1.35 * scale, 0, 1.8 * scale, 0.72],
    [0.95 * scale, trunkH + 1.0 * scale, 0.55 * scale, 1.25 * scale, 0.74],
    [-0.95 * scale, trunkH + 1.05 * scale, -0.5 * scale, 1.3 * scale, 0.72],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(tones[i % tones.length], 0.85),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.12, sy, 1.08);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });
  return g;
}

function createTrimmedBedPolygon(points, marigoldMat, { withFlowers = true, seed = 1 } = {}) {
  const g = new THREE.Group();
  const shape = new THREE.Shape(points.map((p) => new THREE.Vector2(p[0], -p[1])));
  const hedgeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.24,
    bevelEnabled: false,
  });
  hedgeGeo.rotateX(-Math.PI / 2);
  const hedge = new THREE.Mesh(hedgeGeo, mat("#366d29", 0.88));
  hedge.position.y = 0.14;
  hedge.castShadow = hedge.receiveShadow = true;
  g.add(hedge);

  // Centroid for ornamental clipped shrubs & flower accent pocket
  let cx = 0;
  let cz = 0;
  for (const [px, pz] of points) {
    cx += px;
    cz += pz;
  }
  cx /= points.length;
  cz /= points.length;

  // Inner pale emerald manicured turf inset slightly raised above border
  const insetPts = points.map(([px, pz]) => [
    cx + (px - cx) * 0.72,
    cz + (pz - cz) * 0.72,
  ]);
  const insetShape = new THREE.Shape(
    insetPts.map((p) => new THREE.Vector2(p[0], -p[1])),
  );
  const insetGeo = new THREE.ExtrudeGeometry(insetShape, {
    depth: 0.27,
    bevelEnabled: false,
  });
  insetGeo.rotateX(-Math.PI / 2);
  const inset = new THREE.Mesh(insetGeo, mat("#518f38", 0.88));
  inset.position.y = 0.14;
  inset.receiveShadow = true;
  g.add(inset);

  // Clipped spherical ornamental shrubs at bed vertices + golden marigold mound
  const shrubMat = mat("#2c6023", 0.84);
  points.forEach(([px, pz], idx) => {
    if (idx % 2 !== seed % 2 && points.length > 3) return;
    const sx = cx + (px - cx) * 0.74;
    const sz = cz + (pz - cz) * 0.74;
    const shrub = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48, 1), shrubMat);
    shrub.position.set(sx, 0.56, sz);
    shrub.scale.set(1.05, 0.8, 1.05);
    shrub.castShadow = true;
    g.add(shrub);
  });

  if (withFlowers) {
    const mound = new THREE.Mesh(
      new THREE.SphereGeometry(2.15, 14, 8),
      marigoldMat,
    );
    mound.position.set(cx, 0.36, cz);
    mound.scale.set(1.25, 0.14, 1.05);
    mound.receiveShadow = true;
    g.add(mound);
  }
  return g;
}

function createPhuXuanLotusCenterpiece(x, y, z, marigoldMat) {
  // Sculptural Hue Lotus Lantern (Đèn Hoa Sen Đá) inside the Phú Xuân circular garden
  const g = new THREE.Group();
  g.position.set(x, y, z);

  const stoneMat = mat("#d5d1c7", 0.78);
  const redTier = box([4.4, 0.28, 4.4], "#8f2724", [0, 0.14, 0]);
  const marigoldRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.45, 8, 28),
    marigoldMat,
  );
  marigoldRing.rotation.x = Math.PI / 2;
  marigoldRing.position.y = 0.25;
  marigoldRing.scale.set(1, 1, 0.45);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.5, 1.85, 0.55, 8),
    stoneMat,
  );
  plinth.position.y = 0.52;
  plinth.castShadow = plinth.receiveShadow = true;

  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.55, 2.3, 12),
    stoneMat,
  );
  column.position.y = 1.9;
  column.castShadow = true;

  const lotusCup = new THREE.Mesh(
    new THREE.ConeGeometry(1.05, 0.95, 8, 1, true),
    mat("#e8c36e", 0.45, 0.25),
  );
  lotusCup.rotation.x = Math.PI;
  lotusCup.position.y = 3.35;

  const lanternOrb = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 12, 10),
    new THREE.MeshStandardMaterial({
      color: "#fff5d6",
      emissive: "#ffcb5c",
      emissiveIntensity: 0.78,
      roughness: 0.2,
    }),
  );
  lanternOrb.position.y = 3.8;

  g.add(redTier, marigoldRing, plinth, column, lotusCup, lanternOrb);
  return g;
}

/**
 * Extended landscaped riverside garden & small granite footpath network
 * seamlessly linking Fountain Park (lx = 366) to Cầu Phú Xuân (lx ≈ 537).
 */
export function createPhuXuanParkWalk(world, biaSite, heading) {
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

  // Smooth southern/eastern boundary hugging outside edge of footpath 1167513717 while clearing slip road 1169319988
  const parkMaxLz = (lx) => {
    if (lx <= 504) return 39.2;
    if (lx <= 513) return 39.2 + ((lx - 504) / 9) * (36.4 - 39.2);
    if (lx <= 522) return 36.4 + ((lx - 513) / 9) * (32.0 - 36.4);
    if (lx <= 532) return 32.0 + ((lx - 522) / 10) * (20.4 - 32.0);
    if (lx <= 535.2) return 20.4 + ((lx - 532) / 3.2) * (12.2 - 20.4);
    if (lx <= 537.2) return 12.2 + ((lx - 535.2) / 2.0) * (0.2 - 12.2);
    return -10.5;
  };

  const shoreCache = new Map();
  const sampleShoreZ = (lx) => {
    const key = Math.round(lx * 2);
    if (shoreCache.has(key)) return shoreCache.get(key);
    let val = -22.2;
    if (world.riverRings?.length) {
      let lo = -55;
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

  const shoreDeckLandZ = (lx) => {
    const base = sampleShoreZ(lx) + 3.3;
    if (lx <= 430.4) return base;
    const u = Math.max(0, Math.min(1, (lx - 430.4) / (437.38 - 430.4)));
    return base * (1 - u) + -18.3 * u;
  };
  const shoreDeckRiverZ = (lx) => {
    const base = sampleShoreZ(lx) - 0.8;
    if (lx <= 430.4) return base;
    const u = Math.max(0, Math.min(1, (lx - 430.4) / (437.38 - 430.4)));
    return base * (1 - u) + -22.5 * u;
  };
  const shoreDeckY = (lx) => {
    if (lx <= 430.4) return 0.36;
    const u = Math.max(0, Math.min(1, (lx - 430.4) / (437.38 - 430.4)));
    return 0.36 + (0.684 - 0.36) * u;
  };

  const group = new THREE.Group();
  group.name = "phu-xuan-park-walk";
  group.position.set(biaSite.center.x, 0, biaSite.center.z);
  group.rotation.y = heading;

  const graniteTex = createParkGraniteTexture(1, 1);
  const graniteMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: graniteTex,
    roughness: 0.72,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const lawnMat = createManicuredLawnMaterial(1, 1);
  const marigoldTex = createMarigoldAccentTexture();
  const marigoldMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: marigoldTex,
    roughness: 0.78,
    metalness: 0.02,
  });
  const curbMat = mat("#d5d1c7", 0.84);

  // 1. CONTINUOUS EMERALD MANICURED PARK LAWN POLYGON (lx: 366 .. 537.5)
  const lawnBoundary = [
    { lx: 366, lz: -16.5 },
    { lx: 439.5, lz: -16.2 },
    { lx: 488, lz: -15.4 },
    { lx: 512, lz: -14.6 },
    { lx: 537.5, lz: -13.2 },
    { lx: 537.2, lz: 0.2 },
    { lx: 535.2, lz: 12.2 },
    { lx: 532, lz: 20.4 },
    { lx: 522, lz: 32.0 },
    { lx: 513, lz: 36.4 },
    { lx: 504, lz: 39.2 },
    { lx: 366, lz: 39.2 },
  ];
  const lawnMesh = new THREE.Mesh(buildPolygonLawnGeometry(lawnBoundary, 14), lawnMat);
  lawnMesh.position.y = 0.13;
  lawnMesh.receiveShadow = true;
  group.add(lawnMesh);

  // Sloped manicured embankment down to Perfume River water line (keeps below Cầu Gỗ Lim)
  const bankPoints = [];
  for (let lx = 366; lx <= 537; lx += 4) {
    bankPoints.push({ lx, zTop: -15.6, zBot: sampleShoreZ(lx) - 0.3 });
  }
  const bPos = [];
  const bUvs = [];
  const bIdx = [];
  bankPoints.forEach((s) => {
    bPos.push(s.lx, 0.2, s.zTop, s.lx, 0.07, s.zBot);
    bUvs.push(s.lx / 14, s.zTop / 14, s.lx / 14, s.zBot / 14);
  });
  for (let i = 1; i < bankPoints.length; i++) {
    const a = (i - 1) * 2;
    bIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute("position", new THREE.Float32BufferAttribute(bPos, 3));
  bankGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bUvs, 2));
  bankGeo.setIndex(bIdx);
  bankGeo.computeVertexNormals();
  const bankMesh = new THREE.Mesh(bankGeo, lawnMat);
  bankMesh.receiveShadow = true;
  group.add(bankMesh);

  // 2. RIVERFRONT BRICK-CEMENT UPPER PROMENADE (Đường xi măng gạch) + SHORELINE WOODEN BOARDWALK TO CẦU GỖ LIM
  const walkPaths = [
    // Continuous Riverfront Brick-Cement Upper Promenade extending from Fountain Park to Cầu Phú Xuân
    {
      width: 4.6,
      points: [
        { lx: 366.02, lz: -14.2 },
        { lx: 402, lz: -14.2 },
        { lx: 437.3, lz: -14.01 },
        { lx: 439.5, lz: -14.0 },
        { lx: 441.7, lz: -13.97 },
        { lx: 488, lz: -13.3 },
        { lx: 512, lz: -12.6 },
        { lx: 536.5, lz: -11.4 },
      ],
    },
    // Mid-Park Serpentine / Axial Promenade (joins Fountain East apse to Phú Xuân footway)
    {
      width: 3.2,
      points: [
        { lx: 366, lz: 6.5 },
        { lx: 396, lz: -2.0 },
        { lx: 439.5, lz: -2.4 },
        { lx: 488.0, lz: -0.8 },
        { lx: 511.5, lz: -0.2 },
        { lx: 536.4, lz: -0.5 },
      ],
    },
    // Lê Lợi Roadside Park Walk (follows OSM 1167513717 hugging slip road curve)
    {
      width: 3.2,
      points: [
        { lx: 366, lz: 37.6 },
        { lx: 396, lz: 37.6 },
        { lx: 439.5, lz: 36.8 },
        { lx: 489.0, lz: 35.7 },
        { lx: 512.4, lz: 34.7 },
        { lx: 518.2, lz: 33.1 },
        { lx: 524.8, lz: 28.1 },
        { lx: 531.6, lz: 18.4 },
        { lx: 534.5, lz: 10.5 },
        { lx: 536.4, lz: -0.5 },
        { lx: 536.6, lz: -11.4 },
      ],
    },
    // Bay 1 (lx 366..439.5): Cross & Diagonal Garden Footpaths (like reference wing!)
    {
      width: 3.2,
      points: [
        { lx: 396, lz: 38.6 },
        { lx: 396, lz: -14.2 },
      ],
    },
    {
      width: 3.0,
      points: [
        { lx: 366, lz: 6.5 },
        { lx: 396, lz: 17.5 },
        { lx: 439.5, lz: 18.0 },
      ],
    },
    {
      width: 2.8,
      points: [
        { lx: 366, lz: 22.0 },
        { lx: 396, lz: 37.6 },
      ],
    },
    {
      width: 2.8,
      points: [
        { lx: 366, lz: -14.2 },
        { lx: 396, lz: -2.0 },
      ],
    },
    {
      width: 2.8,
      points: [
        { lx: 396, lz: 37.6 },
        { lx: 439.5, lz: 18.0 },
      ],
    },
    {
      width: 2.8,
      points: [
        { lx: 396, lz: -2.0 },
        { lx: 439.5, lz: 18.0 },
      ],
    },
    // Bay 2 (lx 439.5..488.5): Cầu Gỗ Lim Approach & Diagonal Diamond Court
    {
      width: 3.6,
      points: [
        { lx: 439.5, lz: 38.4 },
        { lx: 439.5, lz: -2.4 },
        { lx: 439.5, lz: -14.0 },
      ],
    },
    {
      width: 3.0,
      points: [
        { lx: 439.5, lz: 18.0 },
        { lx: 464, lz: 18.0 },
        { lx: 488.7, lz: 18.1 },
      ],
    },
    {
      width: 2.9,
      points: [
        { lx: 439.5, lz: 36.8 },
        { lx: 464, lz: 18.0 },
        { lx: 488.0, lz: -0.8 },
      ],
    },
    {
      width: 2.9,
      points: [
        { lx: 439.5, lz: -2.4 },
        { lx: 464, lz: 18.0 },
        { lx: 489.0, lz: 35.7 },
      ],
    },
    {
      width: 3.2,
      points: [
        { lx: 489.0, lz: 35.7 },
        { lx: 488.0, lz: -13.3 },
      ],
    },
    // Bay 3 (lx 488.5..537): Cardinal paths radiating from Phú Xuân Circular Garden
    {
      width: 3.2,
      points: [
        { lx: 512.4, lz: 37.8 },
        { lx: 511.8, lz: 27.0 },
      ],
    },
    {
      width: 3.2,
      points: [
        { lx: 511.5, lz: 7.0 },
        { lx: 511.3, lz: -12.6 },
      ],
    },
    {
      width: 3.2,
      points: [
        { lx: 488.7, lz: 18.1 },
        { lx: 501.6, lz: 17.4 },
      ],
    },
    {
      width: 3.2,
      points: [
        { lx: 521.4, lz: 17.4 },
        { lx: 531.6, lz: 18.4 },
      ],
    },
  ];

  // Flatten walk segments for fast distance queries
  const walkHeights = [
    0.256,  // 0: riverfront ironwood promenade
    0.24,   // 1: mid-park axial promenade
    0.23,   // 2: Lê Lợi roadside walk
    0.218,  // 3: Bay 1 x=396 N-S
    0.206,  // 4: Bay 1 curved link
    0.194,  // 5: Bay 1 diag NW
    0.182,  // 6: Bay 1 diag SW
    0.170,  // 7: Bay 1 diag SE
    0.158,  // 8: Bay 1 diag NE
    0.218,  // 9: Bay 2 x=439.5 N-S
    0.194,  // 10: Bay 2 center E-W
    0.182,  // 11: Bay 2 X-diag A
    0.170,  // 12: Bay 2 X-diag B
    0.206,  // 13: Bay 2 x=488 N-S
    0.218,  // 14: Bay 3 South spoke
    0.218,  // 15: Bay 3 North spoke
    0.182,  // 16: Bay 3 West spoke
    0.206,  // 17: Bay 3 East spoke
  ];
  const brickCementWalkMat = createBrickCementWalkMaterial(1, 1);
  const cementCurbMat = mat("#b8b4aa", 0.84);
  const ironwoodWalkMat = createIronwoodWalkMaterial(1, 1);
  const timberTrimMat = mat("#4c2d17", 0.84);
  const walkSegments = [];
  const upperPromSegments = [];
  walkPaths.forEach((path, idx) => {
    const isUpperProm = idx === 0;
    const ribbonY = walkHeights[idx] ?? (0.17 + (idx % 5) * 0.011);
    const ribbonMesh = new THREE.Mesh(
      isUpperProm
        ? buildIronwoodRibbonGeometry(path.points, path.width, ribbonY, 4.2)
        : buildWalkRibbonGeometry(path.points, path.width, ribbonY),
      isUpperProm ? brickCementWalkMat : graniteMat,
    );
    ribbonMesh.receiveShadow = true;
    group.add(ribbonMesh);
    if (isUpperProm) {
      const riverCurbChunks = [
        path.points.slice(0, 3), // 366.0 .. 437.3 (opens cleanly at Cầu Gỗ Lim west ramp)
        path.points.slice(4),    // 441.7 .. 536.5
      ];
      for (const chunk of riverCurbChunks) {
        if (chunk.length < 2) continue;
        const riverCurb = new THREE.Mesh(
          buildRibbonSideCurbGeometry(chunk, -(path.width / 2 + 0.09), 0.18, 0.285, 0.08),
          cementCurbMat,
        );
        riverCurb.castShadow = riverCurb.receiveShadow = true;
        group.add(riverCurb);
      }
      const innerCurb = new THREE.Mesh(
        buildRibbonSideCurbGeometry(path.points, path.width / 2 + 0.09, 0.18, 0.285, 0.08),
        cementCurbMat,
      );
      innerCurb.castShadow = innerCurb.receiveShadow = true;
      group.add(innerCurb);
    }
    for (let i = 1; i < path.points.length; i++) {
      const seg = {
        a: path.points[i - 1],
        b: path.points[i],
        halfW: path.width / 2,
      };
      walkSegments.push(seg);
      if (isUpperProm) upperPromSegments.push(seg);
    }
  });

  // Continuous 0.36m shoreline wooden boardwalk connecting FountainPark (366) -> Cầu Gỗ Lim (437.38, y = 0.684m)
  const shoreSamples = [];
  for (let lx = 366.02; lx <= 437.38; lx = Math.min(437.38, lx + 2.0)) {
    shoreSamples.push({
      lx,
      y: shoreDeckY(lx),
      zLand: shoreDeckLandZ(lx),
      zRiver: shoreDeckRiverZ(lx),
    });
    if (lx >= 437.38) break;
  }
  const sPos = [];
  const sUvs = [];
  const sIdx = [];
  const fPos = [];
  const fUvs = [];
  const fIdx = [];
  const lPos = [];
  const lUvs = [];
  const lIdx = [];
  shoreSamples.forEach((s, i) => {
    const u = (s.lx - 366.02) / 3.2;
    sPos.push(s.lx, s.y, s.zLand, s.lx, s.y, s.zRiver);
    sUvs.push(u, 0, u, 1);
    fPos.push(s.lx, s.y, s.zRiver, s.lx, s.y - 0.24, s.zRiver);
    fUvs.push(u, 0, u, 1);
    lPos.push(s.lx, s.y, s.zLand, s.lx, s.y - 0.2, s.zLand);
    lUvs.push(u, 0, u, 1);
    if (i > 0) {
      const a = (i - 1) * 2;
      sIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      fIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      lIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const shoreDeckGeo = new THREE.BufferGeometry();
  shoreDeckGeo.setAttribute("position", new THREE.Float32BufferAttribute(sPos, 3));
  shoreDeckGeo.setAttribute("uv", new THREE.Float32BufferAttribute(sUvs, 2));
  shoreDeckGeo.setIndex(sIdx);
  shoreDeckGeo.computeVertexNormals();
  const shoreDeckMesh = new THREE.Mesh(shoreDeckGeo, ironwoodWalkMat);
  shoreDeckMesh.receiveShadow = true;
  group.add(shoreDeckMesh);

  for (const [posArr, uvArr, idxArr] of [
    [fPos, fUvs, fIdx],
    [lPos, lUvs, lIdx],
  ]) {
    const tGeo = new THREE.BufferGeometry();
    tGeo.setAttribute("position", new THREE.Float32BufferAttribute(posArr, 3));
    tGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvArr, 2));
    tGeo.setIndex(idxArr);
    tGeo.computeVertexNormals();
    const tMesh = new THREE.Mesh(tGeo, timberTrimMat);
    tMesh.castShadow = tMesh.receiveShadow = true;
    group.add(tMesh);
  }

  // Concrete support piles beneath shoreline wooden boardwalk + granite link from upper walk at lx = 396
  const shorePileCoords = [];
  for (let lx = 370; lx <= 435; lx += 6.5) {
    shorePileCoords.push([lx, shoreDeckRiverZ(lx) + 0.65]);
  }
  const shorePiles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.19, 0.21, 0.9, 8),
    mat("#6a6c64", 0.9),
    shorePileCoords.length,
  );
  const pileDummy = new THREE.Object3D();
  shorePileCoords.forEach(([px, pz], i) => {
    pileDummy.position.set(px, -0.1, pz);
    pileDummy.updateMatrix();
    shorePiles.setMatrixAt(i, pileDummy.matrix);
  });
  shorePiles.instanceMatrix.needsUpdate = true;
  shorePiles.computeBoundingSphere();
  group.add(shorePiles);

  {
    const zStart = -16.6;
    const zEnd = shoreDeckLandZ(396) + 0.02;
    const cLen = Math.max(2, Math.abs(zStart - zEnd));
    const midZ = (zStart + zEnd) / 2;
    const shoreLink = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.14, cLen),
      graniteMat,
    );
    shoreLink.position.set(396, 0.23, midZ);
    shoreLink.rotation.x = -Math.atan2(0.11, cLen);
    shoreLink.receiveShadow = true;
    group.add(shoreLink);
  }

  // Circular footpath junction resting nodes
  const walkNodes = [
    { lx: 396, lz: 17.5, radius: 4.8 },
    { lx: 439.5, lz: 18.0, radius: 5.0 },
    { lx: 439.5, lz: -2.4, radius: 4.5 },
    { lx: 464, lz: 18.0, radius: 4.6 },
    { lx: 488.7, lz: 18.1, radius: 4.5 },
  ];
  for (const node of walkNodes) {
    const disk = new THREE.Mesh(
      new THREE.CylinderGeometry(node.radius, node.radius, 0.22, 28),
      graniteMat,
    );
    disk.position.set(node.lx, 0.15, node.lz);
    disk.receiveShadow = true;
    group.add(disk);
  }

  // Bay 3: OSM Phú Xuân Approach Circular Garden (way/1167513729 centered at 511.5, 17.1)
  const circleGarden = { lx: 511.5, lz: 17.1, rMin: 8.2, rMax: 11.7 };
  const ringShape = new THREE.Shape();
  ringShape.absarc(0, 0, circleGarden.rMax, 0, Math.PI * 2, false);
  const ringHole = new THREE.Path();
  ringHole.absarc(0, 0, circleGarden.rMin, 0, Math.PI * 2, true);
  ringShape.holes.push(ringHole);
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
    depth: 0.22,
    bevelEnabled: false,
    curveSegments: 40,
  });
  ringGeo.rotateX(-Math.PI / 2);
  applyWorldPlanarUVs(ringGeo, 6.5);
  const circleWalk = new THREE.Mesh(ringGeo, graniteMat);
  circleWalk.position.set(circleGarden.lx, 0.04, circleGarden.lz);
  circleWalk.receiveShadow = true;
  group.add(circleWalk);

  // Inner lush green circular medallion + trimmed boxwood ring + Hue Lotus Lantern
  const innerLawn = new THREE.Mesh(
    new THREE.CylinderGeometry(7.9, 8.1, 0.24, 36),
    lawnMat,
  );
  innerLawn.position.set(circleGarden.lx, 0.15, circleGarden.lz);
  innerLawn.receiveShadow = true;
  const innerBoxwood = new THREE.Mesh(
    new THREE.TorusGeometry(6.8, 0.48, 8, 36),
    mat("#356c28", 0.86),
  );
  innerBoxwood.rotation.x = Math.PI / 2;
  innerBoxwood.scale.set(1, 1, 0.72);
  innerBoxwood.position.set(circleGarden.lx, 0.37, circleGarden.lz);
  innerBoxwood.castShadow = innerBoxwood.receiveShadow = true;
  group.add(
    innerLawn,
    innerBoxwood,
    createPhuXuanLotusCenterpiece(circleGarden.lx, 0.27, circleGarden.lz, marigoldMat),
  );

  // Curb transition ramps at Lê Lợi entry points
  const curbEntries = [
    { lx: 396, lz: 39.4, w: 4.4 },
    { lx: 439.5, lz: 39.2, w: 5.0 },
    { lx: 489.0, lz: 37.8, w: 4.4 },
    { lx: 512.4, lz: 37.0, w: 4.4 },
  ];
  for (const r of curbEntries) {
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(r.w, 0.14, 2.4), curbMat);
    ramp.position.set(r.lx, 0.13, r.lz);
    ramp.rotation.x = 0.038;
    ramp.receiveShadow = true;
    group.add(ramp);
  }

  // 3. GEOMETRIC BOXWOOD-BORDERED PARTERRE BEDS & GOLDEN MARIGOLD POCKETS
  // Placed symmetrically between the diagonal & orthogonal small footpaths!
  const gardenBeds = [
    {
      // Bay 1 NW triangle bed
      pts: [
        [370, 26],
        [390, 34],
        [370, 34],
      ],
      flowers: true,
    },
    {
      // Bay 1 Upper-Mid wing diamond
      pts: [
        [371, 11],
        [391, 19],
        [391, 32],
        [371, 19],
      ],
      flowers: true,
    },
    {
      // Bay 1 Lower-Mid triangle
      pts: [
        [371, -9.0],
        [391, -4],
        [371, 3],
      ],
      flowers: true,
    },
    {
      // Bay 1 East-North triangle (lx 401..434)
      pts: [
        [402, 34],
        [433, 34],
        [433, 22],
      ],
      flowers: true,
    },
    {
      // Bay 1 East-Center wedge
      pts: [
        [402, 20],
        [433, 19.5],
        [433, 2.5],
        [402, 13],
      ],
      flowers: true,
    },
    {
      // Bay 1 East-South river triangle
      pts: [
        [402, -4.5],
        [434, -4.5],
        [434, -9.0],
        [402, -9.0],
      ],
      flowers: false,
    },
    {
      // Bay 2 North triangle (lx 444..483)
      pts: [
        [445, 34],
        [483, 34],
        [464, 21.5],
      ],
      flowers: true,
    },
    {
      // Bay 2 West wing bed
      pts: [
        [443, 31],
        [458.5, 19.5],
        [443, 19.5],
      ],
      flowers: false,
    },
    {
      // Bay 2 East wing bed
      pts: [
        [484, 31],
        [484, 19.5],
        [469.5, 19.5],
      ],
      flowers: false,
    },
    {
      // Bay 2 South-Mid diamond
      pts: [
        [445, 15.5],
        [464, 15.5],
        [483, 2],
        [445, 1],
      ],
      flowers: true,
    },
    {
      // Bay 2 Riverfront terrace bed
      pts: [
        [445, -4.5],
        [483, -3.5],
        [483, -9.0],
        [445, -9.0],
      ],
      flowers: true,
    },
    {
      // Bay 3 NW Corner pocket beside Phú Xuân circle
      pts: [
        [492, 33],
        [506, 33],
        [500, 26],
        [492, 22],
      ],
      flowers: true,
    },
    {
      // Bay 3 SW river pocket beside Phú Xuân circle
      pts: [
        [492, 13],
        [500, 8],
        [506, 2],
        [492, 2],
      ],
      flowers: true,
    },
  ];
  gardenBeds.forEach((bed, idx) => {
    group.add(
      createTrimmedBedPolygon(bed.pts, marigoldMat, {
        withFlowers: bed.flowers,
        seed: idx + 1,
      }),
    );
  });

  // 4. RIVERSIDE TROPICAL FAN PALMS, 2 TREE ROWS FLANKING BRICK-CEMENT WALK, BENCHES & HERITAGE LAMPS
  const treeColliders = [];
  const registerTree = (tx, tz, r = 0.85) => {
    const wp = toWorld(tx, tz);
    treeColliders.push({ x: wp.x, z: wp.z, r, lx: tx, lz: tz });
  };
  const upperPromCenterZ = (lx) => {
    if (lx <= 402) return -14.2;
    if (lx <= 441.7) return -14.2 + ((lx - 402) / (441.7 - 402)) * (-13.97 - -14.2);
    if (lx <= 488) return -13.97 + ((lx - 441.7) / (488 - 441.7)) * (-13.3 - -13.97);
    if (lx <= 512) return -13.3 + ((lx - 488) / (512 - 488)) * (-12.6 - -13.3);
    return -12.6 + ((lx - 512) / (536.5 - 512)) * (-11.4 - -12.6);
  };
  const palmPositions = [374, 386, 404, 416, 428, 452, 464, 476, 496, 508, 522];
  palmPositions.forEach((px, idx) => {
    group.add(createFanPalm(px, 0.16, -17.6, 0.96 + (idx % 2) * 0.08, idx + 1));
    registerTree(px, -17.6, 0.72);
  });

  const southRowTrees = [386, 404, 416, 428, 452, 464, 476, 496, 506, 522].map((tx, idx) => [
    tx,
    upperPromCenterZ(tx) + 3.5,
    1.02 + (idx % 2) * 0.06,
  ]);
  const shadeTrees = [
    [378, 28.5, 1.05],
    [422, 30.5, 1.12],
    [454, 29.5, 1.08],
    [474, 29.5, 1.1],
    [422, 7.5, 1.04],
    [474, 7.5, 1.06],
    [496, 28.5, 1.02],
    ...southRowTrees,
  ];
  shadeTrees.forEach(([tx, tz, sc], idx) => {
    group.add(createGardenTree(tx, 0.14, tz, sc, idx + 2));
    registerTree(tx, tz, 0.85);
  });

  for (const [bx, bz] of [
    [378, -15.4],
    [390, -15.4],
    [412, -15.4],
    [428, -15.4],
    [454, -15.0],
    [474, -14.8],
    [498, -14.4],
    [524, -13.4],
  ]) {
    group.add(createParkBench(bx, 0.256, bz, Math.PI));
  }
  for (const [bx, bz, yaw] of [
    [396 - 3.2, 17.5, Math.PI / 2],
    [464, 18.0 - 3.2, 0],
    [511.5 - 9.8, 17.1, Math.PI / 2],
    [511.5 + 9.8, 17.1, -Math.PI / 2],
  ]) {
    group.add(createParkBench(bx, 0.24, bz, yaw));
  }
  for (const bx of [380, 412]) {
    group.add(
      createParkBench(bx, shoreDeckY(bx), shoreDeckLandZ(bx) - 0.72, Math.PI),
      createHeritageLamp(bx + 4.2, shoreDeckY(bx), shoreDeckLandZ(bx) - 0.52),
    );
  }

  for (const [lx, lz] of [
    [380, -12.2],
    [418, -12.2],
    [456, -11.8],
    [498, -11.4],
    [530, -10.2],
    [396, 13.5],
    [439.5, 13.8],
    [464, 13.8],
    [488.7, 13.8],
    [511.5, 28.5],
    [511.5, 5.8],
  ]) {
    group.add(createHeritageLamp(lx, lz <= -10.0 ? 0.256 : 0.24, lz));
  }

  const lifeAnimators = [];
  // Seated talking couples on PhuXuan riverfront & circular garden benches
  [
    [378, 0.256, -15.4, Math.PI],
    [412, 0.256, -15.4, Math.PI],
    [454, 0.256, -15.0, Math.PI],
    [498, 0.256, -14.4, Math.PI],
    [524, 0.256, -13.4, Math.PI],
    [396 - 3.2, 0.24, 17.5, Math.PI / 2],
    [464, 0.24, 18.0 - 3.2, 0],
    [511.5 - 9.8, 0.24, 17.1, Math.PI / 2],
  ].forEach(([bx, by, bz, yaw], idx) => {
    const couple = createSeatedBenchCouple({
      x: bx,
      benchBaseY: by,
      z: bz,
      yaw,
      manIndex: idx + 4,
      womanIndex: idx + 3,
      phase: idx * 0.95,
    });
    group.add(couple.group);
    lifeAnimators.push(couple.update);
  });

  // Youth activity groups across open PhuXuan Park lawns
  const pxBadminton = createBadmintonGroup({ x: 383, y: 0.13, z: 6.0, yaw: 0.2, phase: 0.5 });
  const pxKite = createKiteFlyingGroup({ x: 500, y: 0.13, z: -6.5, yaw: 0.1, phase: 1.0 });
  const pxGuitar = createGuitarCircleGroup({ x: 520, y: 0.13, z: -6.0, phase: 0.3 });
  const pxDaCau = createDaCauGroup({ x: 524, y: 0.13, z: 7.5, phase: 0.8 });
  group.add(pxBadminton.group, pxKite.group, pxGuitar.group, pxDaCau.group);
  lifeAnimators.push(pxBadminton.update, pxKite.update, pxGuitar.update, pxDaCau.update);

  world.scene.add(group);
  world.cameraObstacles.push(lawnMesh);

  const update = (time = 0) => {
    for (let i = 0; i < lifeAnimators.length; i++) {
      lifeAnimators[i](time);
    }
  };

  const isOnWalkway = (lx, lz) => {
    if (Math.hypot(lx - circleGarden.lx, lz - circleGarden.lz) >= circleGarden.rMin &&
        Math.hypot(lx - circleGarden.lx, lz - circleGarden.lz) <= circleGarden.rMax) {
      return true;
    }
    if (walkNodes.some((n) => Math.hypot(lx - n.lx, lz - n.lz) <= n.radius + 0.3)) {
      return true;
    }
    return walkSegments.some(
      (s) => distPointToSegment(lx, lz, s.a, s.b) <= s.halfW + 0.35,
    );
  };

  return {
    group,
    walkSegments,
    circleCenterLocal: { lx: circleGarden.lx, lz: circleGarden.lz },
    treeColliders,
    hitsTree(wx, wz) {
      for (let i = 0; i < treeColliders.length; i++) {
        const t = treeColliders[i];
        const dx = wx - t.x;
        const dz = wz - t.z;
        if (dx * dx + dz * dz < t.r * t.r) return true;
      }
      return false;
    },
    isWaterBlocked(wx, wz, pad = 2.0) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx >= 366 && lx <= 437.38) {
        return lz >= shoreDeckRiverZ(lx) - pad && lz <= parkMaxLz(lx) + 2;
      }
      return false;
    },
    update,
    groundAt(wx, wz, referenceY) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < 366 || lx > 537.5 || lz > parkMaxLz(lx) + 1.5) return null;
      const minZ = lx <= 437.38 ? shoreDeckRiverZ(lx) - 0.5 : sampleShoreZ(lx) - 1;
      if (lz < minZ) return null;
      if (Number.isFinite(referenceY) && referenceY > 1.8) return null;

      // Continuous shoreline wooden boardwalk ramping smoothly into Cầu Gỗ Lim (lx = 366..437.38)
      if (
        lx >= 366 &&
        lx <= 437.38 &&
        lz <= shoreDeckLandZ(lx) &&
        lz >= shoreDeckRiverZ(lx)
      ) {
        return shoreDeckY(lx);
      }

      // Yield cleanly where Cầu Gỗ Lim shore ramps rise riverward of the upper brick-cement promenade
      if (Math.abs(lx - 439.5) < 2.35 && lz < -16.1 && lz > -18.5) return null;
      if (Math.abs(lx - 535.0) < 1.9 && lz < -13.2 && lz > -22.5) return null;

      // Granite connecting path at lx = 396 linking upper brick-cement walk to shoreline boardwalk
      if (Math.abs(lx - 396) <= 1.55 && lz < -16.5 && lz >= shoreDeckLandZ(396)) {
        const zEnd = shoreDeckLandZ(396);
        const t = (-16.5 - lz) / Math.max(1, -16.5 - zEnd);
        return 0.256 + t * (shoreDeckY(lx) - 0.256);
      }

      // Curb ramps along Lê Lợi
      for (const r of curbEntries) {
        if (Math.abs(lx - r.lx) <= r.w / 2 && lz > r.lz - 1.2 && lz <= r.lz + 1.2) {
          const t = (r.lz + 1.2 - lz) / 2.4;
          return 0.14 + t * 0.1;
        }
      }

      if (lz > parkMaxLz(lx)) return null;

      if (
        upperPromSegments.some(
          (s) => distPointToSegment(lx, lz, s.a, s.b) <= s.halfW + 0.35,
        )
      ) {
        return 0.256;
      }

      if (isOnWalkway(lx, lz)) return 0.24;

      if (lz < -15.6) {
        const zBot = sampleShoreZ(lx);
        const t = Math.max(0, Math.min(1, (-15.6 - lz) / Math.max(1, -15.6 - zBot)));
        return 0.2 - t * 0.13;
      }
      return 0.13;
    },
    canRide(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      const minRideZ = lx <= 437.38 ? shoreDeckRiverZ(lx) : sampleShoreZ(lx);
      if (lx < 366 || lx > 537.2 || lz < minRideZ || lz > parkMaxLz(lx))
        return null;
      if (
        treeColliders.some(
          (t) => (wx - t.x) ** 2 + (wz - t.z) ** 2 < t.r * t.r,
        )
      ) {
        return false;
      }
      // Block riding straight through the Phú Xuân Lotus stone lantern plinth
      if (Math.hypot(lx - circleGarden.lx, lz - circleGarden.lz) < 2.6) return false;
      if (
        lx >= 366 &&
        lx <= 437.38 &&
        lz <= shoreDeckLandZ(lx) &&
        lz >= shoreDeckRiverZ(lx) + 0.45
      ) {
        return true;
      }
      if (lz >= sampleShoreZ(lx) + 0.8 && lz <= parkMaxLz(lx)) return true;
      return null;
    },
    blocksGrass(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      const minZ = lx <= 437.38 ? shoreDeckRiverZ(lx) - 0.5 : sampleShoreZ(lx) - 1;
      return lx >= 366 && lx <= 537.5 && lz >= minZ && lz <= parkMaxLz(lx) + 1.5;
    },
    blocksTree(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < 366 || lx > 537.5 || lz < shoreDeckRiverZ(lx) - 2 || lz > parkMaxLz(lx) + 2)
        return false;
      // Keep riverfront palm corridor, walkways, and circular garden completely clear of random OSM trees
      if (lz <= -9.5) return true;
      if (Math.hypot(lx - circleGarden.lx, lz - circleGarden.lz) < circleGarden.rMax + 3.5)
        return true;
      return isOnWalkway(lx, lz);
    },
  };
}
