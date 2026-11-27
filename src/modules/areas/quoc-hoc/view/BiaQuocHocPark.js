import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import {
  createBrickCementPromenadeGeometry,
  createBrickCementWalkMaterial,
  createManicuredLawnTexture,
} from "../../../../core/world/turfTextures.js";
import { createRiverFishMesh } from "../../../../core/world/RiverFish.js";
import {
  createBadmintonGroup,
  createDaCauGroup,
  createFishingAnglerRow,
  createGuitarCircleGroup,
  createKiteFlyingGroup,
  createSeatedBenchCouple,
  createSittingCircleGroup,
} from "../../../../core/world/RiversideParkLife.js";

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

function createGranitePlazaTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#cecbc2";
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let r = 0; r < h / tile; r++) {
        for (let c = 0; c < w / tile; c++) {
          const shade = ((r * 7 + c * 13) % 5) * 3 - 6;
          ctx.fillStyle = `rgb(${205 + shade}, ${202 + shade}, ${193 + shade})`;
          ctx.fillRect(c * tile + 1, r * tile + 1, tile - 2, tile - 2);
        }
      }
      // Subtle granite mineral speckle
      for (let i = 0; i < 900; i++) {
        const x = (i * 193) % w;
        const y = (i * 347) % h;
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(95,92,86,0.14)" : "rgba(255,252,244,0.14)";
        ctx.fillRect(x, y, 2, 2);
      }
      ctx.strokeStyle = "rgba(130, 127, 118, 0.35)";
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
    14,
    11,
  );
}

function createTerraceGrassTexture() {
  return createManicuredLawnTexture(8, 3, { striped: true, rich: true });
}

function createOverlookWoodTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#8c6646";
      ctx.fillRect(0, 0, w, h);
      const planks = 12;
      const ph = h / planks;
      const tones = ["#946d4b", "#866040", "#9c7552", "#7e593a"];
      for (let p = 0; p < planks; p++) {
        const y0 = p * ph;
        ctx.fillStyle = tones[p % tones.length];
        ctx.fillRect(0, y0, w, ph - 1.5);
        for (let g = 0; g < 14; g++) {
          ctx.fillStyle =
            g % 2 ? "rgba(54,32,16,0.16)" : "rgba(202,160,118,0.14)";
          ctx.fillRect(((g * 43 + p * 19) % w) * 0.4, y0 + 3 + (g % 12), w * 0.65, 1.1);
        }
        ctx.fillStyle = "#4d321c";
        ctx.fillRect(0, y0 + ph - 1.5, w, 1.5);
      }
    },
    10,
    3,
  );
}

function buildStripMesh(samples, profile, material, yOffset = 0) {
  const positions = [];
  const uvs = [];
  const indices = [];
  const n = samples.length;
  for (let i = 0; i < n; i++) {
    const s = samples[i];
    const u = i / Math.max(1, n - 1);
    for (let k = 0; k < profile.length; k++) {
      const { x, y, z, v } = profile[k](s);
      positions.push(x, y + yOffset, z);
      uvs.push(u * 4, v);
    }
    if (i > 0) {
      const stride = profile.length;
      const a0 = (i - 1) * stride;
      const a1 = i * stride;
      for (let k = 0; k < stride - 1; k++) {
        indices.push(a0 + k, a0 + k + 1, a1 + k, a0 + k + 1, a1 + k + 1, a1 + k);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.receiveShadow = true;
  return mesh;
}

function buildCurbLine(samples, width, height, material, getPoint) {
  const parts = [];
  for (let i = 1; i < samples.length; i++) {
    const a = getPoint(samples[i - 1]);
    const b = getPoint(samples[i]);
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.05) continue;
    const geo = new THREE.BoxGeometry(width, height, len + 0.08);
    const yaw = Math.atan2(dx, dz);
    const m = new THREE.Matrix4()
      .makeRotationY(yaw)
      .setPosition((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
    geo.applyMatrix4(m);
    parts.push(geo);
  }
  if (!parts.length) return new THREE.Group();
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  const mesh = new THREE.Mesh(merged, material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function heritageBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  // Cast-iron legs + warm timber seat & backrest
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

function heritageLamp(x, y, z, tall = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const h = tall ? 5.6 : 3.7;
  const darkBronze = mat("#2a3734", 0.5, 0.55);
  const globeMat = new THREE.MeshStandardMaterial({
    color: "#fff4d2",
    emissive: "#ffd57a",
    emissiveIntensity: 0.75,
    roughness: 0.25,
  });
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.24, 0.65, 8),
    darkBronze,
  );
  base.position.y = 0.325;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.11, h, 8),
    darkBronze,
  );
  pole.position.y = h / 2 + 0.45;
  pole.castShadow = true;
  g.add(base, pole);

  if (tall) {
    // Classic Hue 3-lantern heritage plaza lamp
    const arm = box([1.1, 0.06, 0.06], "#2a3734", [0, h + 0.18, 0]);
    g.add(arm);
    for (const [gx, gy] of [
      [-0.5, h + 0.34],
      [0.5, h + 0.34],
      [0, h + 0.58],
    ]) {
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(0.17, 10, 8),
        globeMat,
      );
      globe.position.set(gx, gy, 0);
      g.add(globe);
    }
  } else {
    // Twin riverfront park lantern
    const arm = box([0.82, 0.05, 0.05], "#2a3734", [0, h + 0.2, 0]);
    g.add(arm);
    for (const gx of [-0.38, 0.38]) {
      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 10, 8),
        globeMat,
      );
      globe.position.set(gx, h + 0.35, 0);
      g.add(globe);
    }
  }
  return g;
}

function hueParkTree(x, y, z, scale = 1, poinciana = false, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.37;
  const trunkMat = mat("#6c5843", 0.9);
  const trunkH = 2.8 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.27 * scale, trunkH, 7),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  // Forked upper boughs
  for (let b = 0; b < 3; b++) {
    const a = (b * Math.PI * 2) / 3 + 0.4;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07 * scale, 0.12 * scale, 1.8 * scale, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * 0.55 * scale,
      trunkH + 0.45 * scale,
      Math.sin(a) * 0.55 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.52;
    branch.rotation.x = Math.sin(a) * 0.52;
    g.add(branch);
  }

  const foliageColors = poinciana
    ? ["#4a8038", "#578c41", "#3f7330"]
    : ["#3f7436", "#4f873f", "#5b9445"];
  const crowns = [
    [0, trunkH + 1.5 * scale, 0, 1.95 * scale, 0.72],
    [1.1 * scale, trunkH + 1.15 * scale, 0.65 * scale, 1.35 * scale, 0.74],
    [-1.05 * scale, trunkH + 1.2 * scale, 0.55 * scale, 1.4 * scale, 0.72],
    [0.15 * scale, trunkH + 1.1 * scale, -1.1 * scale, 1.45 * scale, 0.74],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(foliageColors[i % foliageColors.length], 0.85),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.12, sy, 1.08);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });

  if (poinciana) {
    // Royal Poinciana (Hoa Phượng Vĩ) scarlet-vermilion blossom clusters
    const blossomMat = mat("#dc482c", 0.68);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + 0.3;
      const b = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.62 * scale, 0),
        blossomMat,
      );
      b.position.set(
        Math.cos(a) * 1.35 * scale,
        trunkH + (1.55 + (i % 2) * 0.38) * scale,
        Math.sin(a) * 1.35 * scale,
      );
      b.scale.set(1.15, 0.55, 1.15);
      g.add(b);
    }
  }
  return g;
}

function flowerIsland(x, y, z, radius, blossomColor = "#d94d5b") {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.14, 6, 20),
    mat("#c8c1b2", 0.85),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.08;
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(radius - 0.06, radius - 0.06, 0.12, 18),
    mat("#493929", 0.95),
  );
  soil.position.y = 0.06;
  const hedge = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.78, radius * 0.88, 0.32, 16),
    mat("#4a7c38", 0.85),
  );
  hedge.position.y = 0.22;
  g.add(rim, soil, hedge);

  const flowerMat = mat(blossomColor, 0.65);
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 6;
    const r = i === 0 ? 0 : radius * 0.52;
    const bloom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.26, 0),
      flowerMat,
    );
    bloom.position.set(Math.cos(a) * r, i === 0 ? 0.44 : 0.36, Math.sin(a) * r);
    bloom.scale.set(1.15, 0.7, 1.15);
    g.add(bloom);
  }
  return g;
}

function redPergola(startX, endX, zCenter) {
  const g = new THREE.Group();
  const len = Math.abs(endX - startX);
  const cx = (startX + endX) / 2;

  const cols = 7;
  const redMat = mat("#9e2d25", 0.48, 0.08);
  const creamMat = mat("#efe9dc", 0.72);
  const vineMat = mat("#4b7b38", 0.86);
  const bloomMat = mat("#ce4a82", 0.65);

  for (let i = 0; i < cols; i++) {
    const x = startX + ((endX - startX) * i) / (cols - 1);
    for (const sz of [-1.45, 1.45]) {
      const plinth = new THREE.Mesh(
        new THREE.BoxGeometry(0.38, 0.26, 0.38),
        creamMat,
      );
      plinth.position.set(x, 0.386, zCenter + sz);
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.15, 2.95, 10),
        redMat,
      );
      col.position.set(x, 1.92, zCenter + sz);
      col.castShadow = col.receiveShadow = true;
      g.add(plinth, col);
    }
    // Crossbeam rafter
    const rafter = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.22, 3.55),
      creamMat,
    );
    rafter.position.set(x, 3.46, zCenter);
    rafter.castShadow = true;
    g.add(rafter);

    if (i % 2 === 0) {
      for (const sz of [-0.9, 0.7]) {
        const vine = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.58, 0),
          vineMat,
        );
        vine.position.set(x + 0.5, 3.66, zCenter + sz);
        vine.scale.set(1.6, 0.45, 1.1);
        const bloom = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.38, 0),
          bloomMat,
        );
        bloom.position.set(x + 0.7, 3.74, zCenter + sz * 0.8);
        bloom.scale.set(1.3, 0.48, 1.0);
        g.add(vine, bloom);
      }
    }
  }
  // Longitudinal white beams
  for (const sz of [-1.45, 0, 1.45]) {
    const beamMesh = new THREE.Mesh(
      new THREE.BoxGeometry(len + 1.2, 0.16, 0.16),
      creamMat,
    );
    beamMesh.position.set(cx, 3.36, zCenter + sz);
    beamMesh.castShadow = true;
    g.add(beamMesh);
  }
  return g;
}

export function createBiaQuocHocPark(world, site, heading) {
  const cosY = Math.cos(heading);
  const sinY = Math.sin(heading);

  const toWorld = (lx, lz) => ({
    x: site.center.x + lx * cosY + lz * sinY,
    z: site.center.z - lx * sinY + lz * cosY,
  });
  const toLocal = (wx, wz) => {
    const dx = wx - site.center.x;
    const dz = wz - site.center.z;
    return {
      lx: dx * cosY - dz * sinY,
      lz: dx * sinY + dz * cosY,
    };
  };

  // Sample exact OSM Perfume River shoreline in Bia local space
  const shoreCache = new Map();
  const sampleShoreZ = (lx) => {
    const key = Math.round(lx * 2);
    if (shoreCache.has(key)) return shoreCache.get(key);
    let val = -50.47 + 0.145 * lx;
    if (world.riverRings?.length) {
      let lo = -75;
      let hi = -22;
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

  const deckLandZ = (lx) => sampleShoreZ(lx) + 4.8;
  const deckRiverZ = (lx) =>
    sampleShoreZ(lx) - (1.2 + 5.6 * Math.exp(-((lx / 20) ** 2)));

  const group = new THREE.Group();
  group.name = "bia-quoc-hoc-park";
  group.position.set(site.center.x, 0, site.center.z);
  group.rotation.y = heading;

  const graniteTex = createGranitePlazaTexture();
  const grassTex = createTerraceGrassTexture();
  const woodTex = createOverlookWoodTexture();

  const graniteMat = new THREE.MeshStandardMaterial({
    color: "#dad7cf",
    map: graniteTex,
    roughness: 0.84,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  const axisGraniteMat = new THREE.MeshStandardMaterial({
    color: "#8f8d84",
    roughness: 0.82,
    metalness: 0.04,
  });
  const grassMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: grassTex,
    roughness: 0.92,
    metalness: 0.01,
    side: THREE.DoubleSide,
  });
  const curbMat = mat("#d0cbc0", 0.86);
  const woodDeckMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: woodTex,
    roughness: 0.78,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const woodTrimMat = mat("#63452c", 0.85);

  const CREST_Y = 1.56;
  const deckY = 0.36;

  const upperTerraceY = (lx) => {
    if (lx >= -35.5 && lx <= 31.5) return CREST_Y;
    if (lx > 31.5) {
      if (lx <= 44.0) {
        const u = (lx - 31.5) / 12.5;
        return CREST_Y + (0.256 - CREST_Y) * u;
      }
      return 0.256;
    }
    if (lx >= -46.0) {
      const u = (-35.5 - lx) / 10.5;
      return CREST_Y + (0.256 - CREST_Y) * u;
    }
    return 0.256;
  };

  const zTopAt = (lx) => -15.4 - Math.max(0, Math.abs(lx) - 34) * 0.42;
  const amphitheaterY = (lx, lz) => {
    const zTop = zTopAt(lx);
    const zBot = deckLandZ(lx);
    const t = Math.max(0, Math.min(1, (zTop - lz) / Math.max(1, zTop - zBot)));
    let yTop = upperTerraceY(lx);
    if (lx > 48.0) {
      const u = Math.min(1, (lx - 48.0) / 12.0);
      yTop = 0.256 + (0.2 - 0.256) * u;
    }
    return yTop + (deckY - yTop) * t;
  };

  // 1. GRAND CEREMONIAL GRANITE PLAZA: FRONT APRON (y = 0.24m) + ELEVATED MONUMENT & REAR CREST (y = 1.56m)
  const plazaW = 67;
  const plazaCx = -2.0;

  // Front plaza apron facing Lê Lợi (lz: +13.5 to +36.8, top at y = 0.24m)
  const frontD = 23.3;
  const frontCz = 25.15;
  const plazaFloor = new THREE.Mesh(
    new THREE.BoxGeometry(plazaW, 0.24, frontD),
    graniteMat,
  );
  plazaFloor.position.set(plazaCx, 0.12, frontCz);
  plazaFloor.receiveShadow = true;
  group.add(plazaFloor);

  // Elevated monument & rear riverfront balcony terrace (lz: -15.5 to +10.2, top at CREST_Y = 1.56m)
  const upperD = 25.7;
  const upperCz = -2.65;
  const upperTerrace = new THREE.Mesh(
    new THREE.BoxGeometry(plazaW, CREST_Y, upperD),
    graniteMat,
  );
  upperTerrace.position.set(plazaCx, CREST_Y / 2, upperCz);
  upperTerrace.receiveShadow = true;
  group.add(upperTerrace);

  // Side granite retaining cheek walls along elevated podium (lx = -35.5 and +31.5)
  for (const wallX of [-35.55, 31.55]) {
    group.add(
      box([0.28, CREST_Y, 26.2], "#c5bfb2", [wallX, CREST_Y / 2, -2.4]),
    );
  }

  // Front approach accessible side ramps (lx: -35.5..-12 & +12..+31.5) & grand central stairway (lx: -12..+12)
  for (const rampRange of [
    [{ lx: -35.5 }, { lx: -12.0 }],
    [{ lx: 12.0 }, { lx: 31.5 }],
  ]) {
    group.add(
      buildStripMesh(
        rampRange,
        [
          (s) => ({ x: s.lx, y: CREST_Y, z: 10.2, v: 0 }),
          (s) => ({ x: s.lx, y: 0.24, z: 13.5, v: 1 }),
        ],
        graniteMat,
      ),
    );
  }
  // Sloped backing under central steps so stairs look solid from every angle without Z-fighting
  group.add(
    buildStripMesh(
      [{ lx: -12.0 }, { lx: 12.0 }],
      [
        (s) => ({ x: s.lx, y: CREST_Y - 0.16, z: 10.2, v: 0 }),
        (s) => ({ x: s.lx, y: 0.16, z: 13.5, v: 1 }),
      ],
      curbMat,
    ),
  );
  const frontSteps = 7;
  for (let s = 0; s < frontSteps; s++) {
    const f = (s + 0.5) / frontSteps;
    const stepY = 0.24 + (CREST_Y - 0.24) * f;
    const stepZ = 13.5 - f * 3.3;
    group.add(box([24.0, 0.22, 0.52], "#d4cec2", [0, stepY - 0.1, stepZ]));
  }

  // Gentle granite approach ramp from Le Loi sidewalk (lz: 36.8 -> 39.6)
  const rampGeo = new THREE.BoxGeometry(plazaW, 0.14, 3.0);
  const rampMesh = new THREE.Mesh(rampGeo, curbMat);
  rampMesh.position.set(plazaCx, 0.13, 38.1);
  rampMesh.rotation.x = 0.035;
  rampMesh.receiveShadow = true;
  group.add(rampMesh);

  // Axial ceremonial granite runner (Trục Thần Đạo facing Trường Quốc Học)
  const axisRunner = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 0.02, 23.0),
    axisGraniteMat,
  );
  axisRunner.position.set(0, 0.25, 25.2);
  axisRunner.receiveShadow = true;
  group.add(axisRunner);

  // Concentric granite medallion on front plaza (lz = 22.8)
  const medOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(4.8, 4.8, 0.024, 32),
    mat("#b8b3a6", 0.82),
  );
  medOuter.position.set(0, 0.268, 22.8);
  medOuter.receiveShadow = true;
  const medInner = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 0.026, 28),
    mat("#8d8b82", 0.8),
  );
  medInner.position.set(0, 0.287, 22.8);
  medInner.receiveShadow = true;
  group.add(medOuter, medInner);

  // Brick-and-cement (xi măng gạch) upper riverfront promenade wings sloping cleanly down to y = 0.256m
  const brickCementWalkMat = createBrickCementWalkMaterial(1, 1);
  const westWing = new THREE.Mesh(
    createBrickCementPromenadeGeometry(26.0, 0.256, 4.4, 4.2),
    brickCementWalkMat,
  );
  westWing.position.set(-59.0, 0.128, -13.3);
  westWing.receiveShadow = true;
  const eastWing = new THREE.Mesh(
    createBrickCementPromenadeGeometry(24.0, 0.256, 4.4, 4.2),
    brickCementWalkMat,
  );
  eastWing.position.set(56.0, 0.128, -13.3);
  eastWing.receiveShadow = true;
  group.add(westWing, eastWing);

  // Sloped brick-cement transition ramps connecting elevated rear crest (1.56m) to flat wings (0.256m)
  const westWingSamples = [{ lx: -46.0 }, { lx: -35.5 }];
  const eastWingSamples = [{ lx: 31.5 }, { lx: 44.0 }];
  for (const rampPts of [westWingSamples, eastWingSamples]) {
    group.add(
      buildStripMesh(
        rampPts,
        [
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx), z: -15.5, v: 0 }),
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx), z: -11.1, v: 1 }),
        ],
        brickCementWalkMat,
      ),
      buildStripMesh(
        rampPts,
        [
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx) + 0.04, z: -15.65, v: 0 }),
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx) + 0.04, z: -15.5, v: 1 }),
        ],
        curbMat,
      ),
      buildStripMesh(
        rampPts,
        [
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx) + 0.04, z: -11.1, v: 0 }),
          (s) => ({ x: s.lx, y: upperTerraceY(s.lx) + 0.04, z: -10.95, v: 1 }),
        ],
        curbMat,
      ),
    );
  }
  for (const [cxW, wLen] of [
    [-59.0, 26.0],
    [56.0, 24.0],
  ]) {
    for (const edgeZ of [-15.58, -11.02]) {
      group.add(box([wLen, 0.285, 0.14], "#b8b4aa", [cxW, 0.1425, edgeZ]));
    }
  }

  // Stone perimeter bollards along Le Loi plaza edge (open 18m central ceremonial gateway)
  const bollardGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.62, 8);
  const bollardCapGeo = new THREE.SphereGeometry(0.15, 8, 6);
  const bollardCoords = [];
  for (let lx = -34; lx <= -10; lx += 4) bollardCoords.push([lx, 36.2]);
  for (let lx = 10; lx <= 30; lx += 4) bollardCoords.push([lx, 36.2]);
  const bollardPosts = new THREE.InstancedMesh(
    bollardGeo,
    curbMat,
    bollardCoords.length,
  );
  const bollardCaps = new THREE.InstancedMesh(
    bollardCapGeo,
    mat("#9f8e70", 0.65),
    bollardCoords.length,
  );
  const dummy = new THREE.Object3D();
  bollardCoords.forEach(([bx, bz], i) => {
    dummy.position.set(bx, 0.54, bz);
    dummy.updateMatrix();
    bollardPosts.setMatrixAt(i, dummy.matrix);
    dummy.position.set(bx, 0.89, bz);
    dummy.updateMatrix();
    bollardCaps.setMatrixAt(i, dummy.matrix);
  });
  bollardPosts.instanceMatrix.needsUpdate = true;
  bollardCaps.instanceMatrix.needsUpdate = true;
  bollardPosts.computeBoundingSphere();
  bollardCaps.computeBoundingSphere();
  group.add(bollardPosts, bollardCaps);

  // Front plaza floral parterres flanking the ceremonial entrance
  for (const fx of [-22.5, 20.5]) {
    group.add(flowerIsland(fx, 0.24, 31.8, 2.35, "#d84654"));
  }

  // 2. DOWNWARD-SLOPING THREE-TIER EMERALD GRASS AMPHITHEATER (lz: -15.4 down to riverfront deck)
  const samples = [];
  for (let lx = -60; lx <= 60; lx += 3) {
    const zTop = zTopAt(lx);
    const zBot = deckLandZ(lx) + 0.15;
    samples.push({ lx, zTop, zBot });
  }
  for (let t = 0; t < 3; t++) {
    const f0 = t / 3;
    const f1 = (t + 1) / 3;
    group.add(
      buildStripMesh(
        samples,
        [
          (s) => {
            const z = s.zTop + (s.zBot - s.zTop) * f0;
            return { x: s.lx, y: amphitheaterY(s.lx, z), z, v: 0 };
          },
          (s) => {
            const z = s.zTop + (s.zBot - s.zTop) * f1;
            return { x: s.lx, y: amphitheaterY(s.lx, z), z, v: 1 };
          },
        ],
        grassMat,
      ),
    );
    if (t > 0) {
      // Crisp horizontal granite divider path across the sloped lawn (matching reference photo)
      group.add(
        buildStripMesh(
          samples,
          [
            (s) => {
              const z = s.zTop + (s.zBot - s.zTop) * f0 + 0.45;
              return { x: s.lx, y: amphitheaterY(s.lx, z) + 0.025, z, v: 0 };
            },
            (s) => {
              const z = s.zTop + (s.zBot - s.zTop) * f0 - 0.45;
              return { x: s.lx, y: amphitheaterY(s.lx, z) + 0.025, z, v: 1 };
            },
          ],
          graniteMat,
        ),
      );
    }
  }
  // Bottom granite toe-curb meeting the wooden riverfront overlook deck
  group.add(
    buildCurbLine(samples, 0.36, 0.24, curbMat, (s) => ({
      x: s.lx,
      y: deckY - 0.04,
      z: s.zBot,
    })),
  );

  // Twin straight downward-sloping granite walkways cutting through the grass terraces
  for (const sx of [-14.5, 14.5]) {
    const zStart = -15.4;
    const zEnd = deckLandZ(sx);
    const walkSamples = [
      { lx: sx - 1.6 },
      { lx: sx + 1.6 },
    ];
    group.add(
      buildStripMesh(
        walkSamples,
        [
          (s) => ({ x: s.lx, y: amphitheaterY(sx, zStart) + 0.032, z: zStart, v: 0 }),
          (s) => ({ x: s.lx, y: deckY + 0.02, z: zEnd, v: 1 }),
        ],
        graniteMat,
      ),
    );
    // Low sloped stone border curbs along walkways
    for (const side of [-1.72, 1.72]) {
      const len = Math.abs(zStart - zEnd);
      const yTopW = amphitheaterY(sx, zStart);
      const dyW = yTopW - deckY;
      const slopeAng = Math.atan2(dyW, len);
      const curbMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.18, Math.hypot(len, dyW) + 0.2),
        curbMat,
      );
      curbMesh.position.set(sx + side, (yTopW + deckY) / 2 + 0.05, (zStart + zEnd) / 2);
      curbMesh.rotation.x = slopeAng;
      curbMesh.receiveShadow = true;
      group.add(curbMesh);
    }
  }

  // 3. CURVED / SCALLOPED WOODEN RIVERSIDE OVERLOOK DECK (Sàn gỗ ven sông Hương)
  const deckSamples = [];
  for (let lx = -64; lx <= 64; lx += 2) {
    deckSamples.push({
      lx,
      zLand: deckLandZ(lx),
      zRiver: deckRiverZ(lx),
    });
  }
  // Timber top deck
  group.add(
    buildStripMesh(
      deckSamples,
      [
        (s) => ({ x: s.lx, y: deckY, z: s.zLand, v: 0 }),
        (s) => ({ x: s.lx, y: deckY, z: s.zRiver, v: 1 }),
      ],
      woodDeckMat,
    ),
  );
  // Thick timber fascia rim along riverward curved edge
  group.add(
    buildStripMesh(
      deckSamples,
      [
        (s) => ({ x: s.lx, y: deckY, z: s.zRiver, v: 0 }),
        (s) => ({ x: s.lx, y: deckY - 0.24, z: s.zRiver, v: 1 }),
      ],
      woodTrimMat,
    ),
  );
  // Submerged concrete support piles beneath the cantilevered wooden overlook
  const pileGeo = new THREE.CylinderGeometry(0.2, 0.22, 0.9, 8);
  const pileCoords = [];
  for (let lx = -60; lx <= 60; lx += 6) {
    pileCoords.push([lx, deckRiverZ(lx) + 0.7]);
    if (Math.abs(lx) <= 24) {
      pileCoords.push([lx, (deckLandZ(lx) + deckRiverZ(lx)) / 2]);
    }
  }
  const piles = new THREE.InstancedMesh(
    pileGeo,
    mat("#6a6c64", 0.9),
    pileCoords.length,
  );
  pileCoords.forEach(([px, pz], i) => {
    dummy.position.set(px, -0.1, pz);
    dummy.updateMatrix();
    piles.setMatrixAt(i, dummy.matrix);
  });
  piles.instanceMatrix.needsUpdate = true;
  piles.computeBoundingSphere();
  group.add(piles);

  // Subtle riverside deck bench seating boxes & warm low bollard lights along overlook
  for (const lx of [-28, -10, 10, 28]) {
    group.add(
      heritageBench(lx, deckY, deckLandZ(lx) - 0.85, Math.PI),
      heritageLamp(lx + 4.5, deckY, deckLandZ(lx) - 0.7, false),
    );
  }

  // 3B. RIVERSIDE FISHING ROD RENTAL STALL ("CHO THUÊ CẦN CÂU") ON WOODEN DECK
  const stallLx = -18;
  const stallLz = deckLandZ(stallLx) - 1.35;
  const stall = new THREE.Group();
  stall.name = "fishing-rental-stall";
  stall.position.set(stallLx, deckY, stallLz);
  stall.rotation.y = Math.PI;

  const counterWood = mat("#7b5230", 0.82);
  const roofMat = mat("#c6a05d", 0.85);
  stall.add(
    box([2.1, 0.92, 0.7], "#7b5230", [0, 0.46, 0]),
    box([2.26, 0.08, 0.84], "#9c6d44", [0, 0.96, 0]),
    box([0.1, 2.25, 0.1], "#5c3d22", [-0.95, 1.125, -0.3]),
    box([0.1, 2.25, 0.1], "#5c3d22", [0.95, 1.125, -0.3]),
    box([0.1, 2.05, 0.1], "#5c3d22", [-0.95, 1.025, 0.35]),
    box([0.1, 2.05, 0.1], "#5c3d22", [0.95, 1.025, 0.35]),
  );
  const awning = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.07, 1.3), roofMat);
  awning.position.set(0, 2.22, 0.05);
  awning.rotation.x = 0.14;
  awning.castShadow = true;
  stall.add(awning);

  if (typeof document !== "undefined") {
    const signTex = createCanvasTexture(256, 64, (ctx, w, h) => {
      ctx.fillStyle = "#14423b";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#f2cb6d";
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, w - 8, h - 8);
      ctx.fillStyle = "#fff4d2";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText?.("CHO THUÊ CẦN CÂU", w / 2, h / 2);
    });
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 0.44),
      new THREE.MeshStandardMaterial({
        map: signTex,
        roughness: 0.7,
        side: THREE.DoubleSide,
      }),
    );
    signBoard.position.set(0, 1.92, -0.36);
    signBoard.rotation.y = Math.PI;
    stall.add(signBoard);
  }

  // Bamboo rod rack & 3 slanted fishing rods + bait bucket
  stall.add(box([0.5, 0.65, 0.32], "#634125", [1.32, 0.325, 0.05]));
  for (let r = 0; r < 3; r++) {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.024, 1.95, 6),
      mat("#b48a46", 0.7),
    );
    rod.position.set(1.18 + r * 0.14, 1.05, 0.04);
    rod.rotation.x = -0.18;
    rod.rotation.z = -0.06 + r * 0.05;
    stall.add(rod);
  }
  const bucket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.14, 0.32, 10),
    mat("#2d7ea1", 0.6),
  );
  bucket.position.set(-1.28, 0.16, -0.15);
  stall.add(bucket);

  // Friendly riverside rental vendor NPC wearing nón lá & teal áo dài
  const vendor = new THREE.Group();
  vendor.position.set(0, 0, 0.68);
  vendor.rotation.y = Math.PI;
  vendor.add(
    box([0.16, 0.56, 0.16], "#23303d", [-0.11, 0.28, 0]),
    box([0.16, 0.56, 0.16], "#23303d", [0.11, 0.28, 0]),
    box([0.42, 0.62, 0.26], "#1d6f72", [0, 0.86, 0]),
    box([0.12, 0.44, 0.12], "#1d6f72", [-0.28, 0.84, 0]),
    box([0.12, 0.44, 0.12], "#1d6f72", [0.28, 0.84, 0]),
  );
  const vHead = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8),
    mat("#f6d2b5", 0.75),
  );
  vHead.position.set(0, 1.34, 0);
  const nonLa = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.2, 14),
    mat("#e5cf95", 0.82),
  );
  nonLa.position.set(0, 1.54, 0);
  vendor.add(vHead, nonLa);
  stall.add(vendor);
  group.add(stall);

  // 4. FLANKING SHADY PARK LAWNS, RED PERGOLA, FLOWER BEDS & HUE TREES
  // Lush green park lawns flanking West (lx: -72..-46) and East (lx: +44..+68) plus sloped side berms meeting the elevated terrace
  const westLawn = new THREE.Mesh(
    new THREE.BoxGeometry(26.0, 0.14, 46),
    grassMat,
  );
  westLawn.position.set(-59.0, 0.06, 11.5);
  westLawn.receiveShadow = true;
  const eastLawn = new THREE.Mesh(
    new THREE.BoxGeometry(24.0, 0.14, 44),
    grassMat,
  );
  eastLawn.position.set(56.0, 0.06, 10.5);
  eastLawn.receiveShadow = true;
  group.add(westLawn, eastLawn);

  // Sloped grassy berms connecting elevated side retaining edges (1.56m) gently down to outer side lawns (0.13m)
  group.add(
    buildStripMesh(
      [{ lz: -11.1 }, { lz: 10.2 }],
      [
        (s) => ({ x: -46.0, y: 0.13, z: s.lz, v: 0 }),
        (s) => ({ x: -35.5, y: CREST_Y - 0.04, z: s.lz, v: 1 }),
      ],
      grassMat,
    ),
    buildStripMesh(
      [{ lz: -11.1 }, { lz: 10.2 }],
      [
        (s) => ({ x: 31.5, y: CREST_Y - 0.04, z: s.lz, v: 0 }),
        (s) => ({ x: 44.0, y: 0.13, z: s.lz, v: 1 }),
      ],
      grassMat,
    ),
  );

  // Red-columned Hue Pergola on West riverside promenade (flat y = 0.256m segment)
  group.add(redPergola(-69, -49, -13.3));

  // Flanking floral islands & park benches along upper promenade
  for (const bx of [-26, -10, 10, 24, 46, 56]) {
    group.add(heritageBench(bx, upperTerraceY(bx), -14.2, Math.PI));
  }
  for (const [fx, fz, col] of [
    [-48, 16, "#e3a634"],
    [-58, 26, "#9e5cb8"],
    [46, 16, "#d94d5b"],
    [56, 24, "#e3a634"],
  ]) {
    group.add(flowerIsland(fx, 0.12, fz, 2.2, col));
  }

  // Classic Hue Heritage Lamps lining plaza & riverside promenade
  for (const [lx, lz, tall] of [
    [-19, 8.5, true],
    [19, 8.5, true],
    [-19, -9.5, true],
    [19, -9.5, true],
    [-28, 34, false],
    [26, 34, false],
    [-33, -12, false],
    [31, -12, false],
    [48, -12, false],
  ]) {
    const baseY = lz > 13.5 ? 0.24 : upperTerraceY(lx);
    group.add(heritageLamp(lx, baseY, lz, tall));
  }

  // Lush layered Hue trees framing the West & East park wings + 2 symmetrical rows flanking the brick-cement walk
  const promenadeRowTrees = [
    [-66, -16.9, 1.06, false],
    [-66, -9.6, 1.08, true],
    [-54, -16.9, 1.12, true],
    [-54, -9.6, 1.08, false],
    [-42, -16.9, 1.08, false],
    [-42, -9.6, 1.12, true],
    [-26, -17.2, 1.06, false],
    [-26, -9.6, 1.06, true],
    [26, -17.2, 1.06, true],
    [26, -9.6, 1.06, false],
    [39, -16.9, 1.1, false],
    [39, -9.6, 1.12, true],
    [51, -16.9, 1.12, true],
    [51, -9.6, 1.08, false],
    [62, -16.9, 1.08, false],
    [62, -9.6, 1.1, true],
  ];
  const parkTrees = [
    [-38, 33, 1.05, true],
    [-46, 30, 1.25, false],
    [-58, 32, 1.15, false],
    [-49, 4, 1.3, false],
    [-55, 8, 1.18, true],
    [-64, 14, 1.35, false],
    [-65, -4, 1.22, false],
    [-49, -23, 1.15, false],
    [35, 32, 1.12, true],
    [46, 30, 1.28, false],
    [56, 31, 1.2, false],
    [46, 6, 1.26, false],
    [51, 2, 1.15, true],
    [59, 12, 1.32, false],
    [60, -4, 1.18, false],
    [48, -22, 1.1, false],
    ...promenadeRowTrees,
  ];
  const treeColliders = [];
  parkTrees.forEach(([tx, tz, sc, poinciana], idx) => {
    let ty = 0.12;
    if (tz < -15.4) {
      ty = amphitheaterY(tx, tz) - 0.04;
    } else if (tz <= -9.0) {
      ty = upperTerraceY(tx) - 0.03;
    } else if (tx >= -35.5 && tx <= 31.5 && tz <= 10.2) {
      ty = CREST_Y - 0.02;
    } else if (tx > 31.5 && tx < 44.0 && tz <= 10.2) {
      ty = 0.13 + ((44.0 - tx) / 12.5) * (CREST_Y - 0.17);
    } else if (tx < -35.5 && tx > -46.0 && tz <= 10.2) {
      ty = 0.13 + ((tx + 46.0) / 10.5) * (CREST_Y - 0.17);
    }
    group.add(hueParkTree(tx, ty, tz, sc, poinciana, idx + 1));
    const wp = toWorld(tx, tz);
    treeColliders.push({ x: wp.x, z: wp.z, r: 0.85, lx: tx, lz: tz });
  });

  // 5. VIBRANT CÁ CHÉP & CÁ KOI SHOAL SWIMMING ALONG BIA QUỐC HỌC RIVERFRONT
  const fishGroup = new THREE.Group();
  fishGroup.name = "bia-river-carp-koi-shoal";
  const riverFishSwimmers = [];
  const rippleMat = new THREE.MeshBasicMaterial({
    color: "#d9fbff",
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const rippleGeo = new THREE.RingGeometry(0.16, 0.24, 16);
  rippleGeo.rotateX(-Math.PI / 2);

  for (let i = 0; i < 24; i++) {
    const isKoi = i % 2 === 0;
    const speciesId = isKoi ? "ca-koi" : "ca-chep";
    const mesh = createRiverFishMesh(speciesId, { variant: i });
    const visualScale = isKoi ? 1.15 + (i % 3) * 0.12 : 1.08 + (i % 3) * 0.1;
    mesh.scale.setScalar(visualScale);

    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    ripple.position.set(0, 0.06, 0);
    mesh.add(ripple);

    const baseLx = -46 + (i / 23) * 92;
    const riverOffset = 2.0 + (i % 5) * 1.45;
    const swimmer = {
      speciesId,
      mesh,
      ripple,
      baseLx,
      baseRiverOffset: riverOffset,
      ampX: 3.4 + (i % 4) * 1.1,
      ampZ: 1.05 + (i % 3) * 0.45,
      speed: 0.55 + (i % 5) * 0.13,
      phase: i * 0.85,
      prevLx: baseLx,
      prevLz: deckRiverZ(baseLx) - riverOffset,
      yaw: 0,
    };
    mesh.position.set(swimmer.prevLx, 0.0, swimmer.prevLz);
    fishGroup.add(mesh);
    riverFishSwimmers.push(swimmer);
  }
  group.add(fishGroup);

  // 6. ROW OF 10 ANIMATED ANGLERS, BENCH COUPLES & YOUTH RIVERFRONT ACTIVITIES
  const parkLifeAnimators = [];

  // 10 NPC anglers along the curved overlook deck rim (leaving stallLx = -18 area open for player)
  const anglerSlots = [-44, -38, -32, -26, -10, -3, 4, 11, 18, 25].map((lx, idx) => ({
    lx,
    deckY,
    lz: deckRiverZ(lx) + 0.56,
    yaw: Math.PI,
    waterOffset: 2.55 + (idx % 3) * 0.25,
    phase: idx * 0.92,
  }));
  const anglerRow = createFishingAnglerRow(anglerSlots);
  group.add(anglerRow.group);
  parkLifeAnimators.push(anglerRow.update);

  // Talking male-female couples seated on overlook & promenade benches
  for (const [idx, [bx, by, bz]] of [
    [-28, deckY, deckLandZ(-28) - 0.85],
    [10, deckY, deckLandZ(10) - 0.85],
    [28, deckY, deckLandZ(28) - 0.85],
    [-26, CREST_Y, -14.2],
    [10, CREST_Y, -14.2],
    [46, 0.256, -14.2],
    [56, 0.256, -14.2],
  ].entries()) {
    const couple = createSeatedBenchCouple({
      x: bx,
      benchBaseY: by,
      z: bz,
      yaw: Math.PI,
      manIndex: idx,
      womanIndex: idx + 1,
      phase: idx * 1.1,
    });
    group.add(couple.group);
    parkLifeAnimators.push(couple.update);
  }

  // Small seated youth & family circles ("nhiều nhóm thanh niên, gia đình ngồi chơi thành vòng tròn nhỏ")
  // placed across the sloped grass amphitheater behind Bia Quốc Học and on the wooden overlook deck
  const slopePitchAt = (lx) => {
    const dz = Math.max(4, Math.abs(zTopAt(lx) - deckLandZ(lx)));
    const dy = upperTerraceY(lx) - deckY;
    return -Math.atan2(dy, dz);
  };
  const rearCircleSpecs = [
    { lx: -24, lz: -22.5, kind: "family", count: 4, matColor: null, phase: 0.3 },
    { lx: -5.5, lz: -24.5, kind: "youth", count: 4, matColor: "#d99d5c", phase: 0.9 },
    { lx: 5.5, lz: -34.0, kind: "family", count: 4, matColor: null, phase: 1.5 },
    { lx: 24, lz: -23.5, kind: "youth", count: 3, matColor: null, phase: 2.1 },
    { lx: -23, lz: -36.5, kind: "youth", count: 4, matColor: "#c88652", phase: 2.7 },
    { lx: 22.5, lz: -36.5, kind: "family", count: 4, matColor: null, phase: 3.2 },
    { lx: 2.0, lz: deckLandZ(2.0) - 2.4, y: deckY, kind: "youth", count: 3, matColor: null, pitchX: 0, phase: 3.8 },
  ];
  for (const spec of rearCircleSpecs) {
    const circle = createSittingCircleGroup({
      x: spec.lx,
      y: spec.y ?? amphitheaterY(spec.lx, spec.lz),
      z: spec.lz,
      pitchX: spec.pitchX ?? slopePitchAt(spec.lx),
      kind: spec.kind,
      count: spec.count,
      matColor: spec.matColor,
      phase: spec.phase,
    });
    group.add(circle.group);
    parkLifeAnimators.push(circle.update);
  }

  // Kite-flying groups right behind Bia Quốc Học on the open riverfront grass slopes + side lawns
  const biaRearKitesWest = createKiteFlyingGroup({
    x: -31,
    y: amphitheaterY(-31, -28.5),
    z: -28.5,
    yaw: 0.12,
    phase: 0.35,
  });
  const biaRearKitesEast = createKiteFlyingGroup({
    x: 29,
    y: amphitheaterY(29, -29.5),
    z: -29.5,
    yaw: -0.1,
    phase: 1.45,
  });
  const biaGuitar = createGuitarCircleGroup({ x: -57, y: 0.13, z: -1.5, phase: 0.4 });
  const biaBadminton = createBadmintonGroup({ x: -50, y: 0.13, z: 24, yaw: 0.3, phase: 0.8 });
  const biaKites = createKiteFlyingGroup({ x: 52, y: 0.13, z: 15.5, yaw: 0.15, phase: 0.2 });
  const biaDaCau = createDaCauGroup({ x: 52, y: 0.13, z: 23.5, phase: 1.1 });
  group.add(
    biaRearKitesWest.group,
    biaRearKitesEast.group,
    biaGuitar.group,
    biaBadminton.group,
    biaKites.group,
    biaDaCau.group,
  );
  parkLifeAnimators.push(
    biaRearKitesWest.update,
    biaRearKitesEast.update,
    biaGuitar.update,
    biaBadminton.update,
    biaKites.update,
    biaDaCau.update,
  );

  let fishingActive = false;
  let fishingAnchorLx = stallLx;

  const update = (time = 0) => {
    const paceMul = fishingActive ? 1.35 : 0.88;
    const baseY = fishingActive ? 0.01 : -0.025;
    for (let i = 0; i < riverFishSwimmers.length; i++) {
      const f = riverFishSwimmers[i];
      // During fishing mode, pull a dense colorful cluster closer to the player's fishing spot
      let centerLx = f.baseLx;
      let offsetFromEdge = f.baseRiverOffset;
      if (fishingActive && i < 12) {
        const slot = i - 5.5;
        centerLx = Math.max(-48, Math.min(48, fishingAnchorLx + slot * 2.1));
        offsetFromEdge = 1.65 + (i % 4) * 0.95;
      }
      const lx = centerLx + Math.sin(time * f.speed * paceMul + f.phase) * f.ampX;
      const lz =
        deckRiverZ(lx) -
        offsetFromEdge -
        Math.cos(time * f.speed * 1.15 * paceMul + f.phase) * f.ampZ;
      const dx = lx - f.prevLx;
      const dz = lz - f.prevLz;
      if (Math.hypot(dx, dz) > 0.0005) {
        f.yaw = Math.atan2(dx, dz);
      }
      f.prevLx = lx;
      f.prevLz = lz;

      const bob = Math.sin(time * 2.4 + f.phase) * 0.022;
      f.mesh.position.set(lx, baseY + bob, lz);
      f.mesh.rotation.y = f.yaw;
      if (f.mesh.userData.tailPivot) {
        f.mesh.userData.tailPivot.rotation.y =
          Math.sin(time * (fishingActive ? 11.5 : 7.5) + f.phase) * 0.36;
      }
      const rScale = 0.8 + ((time * 1.4 + f.phase) % 1) * (fishingActive ? 1.1 : 0.75);
      f.ripple.scale.set(rScale, 1, rScale);
      f.ripple.visible = fishingActive || i % 2 === 0;
    }
    for (let i = 0; i < parkLifeAnimators.length; i++) {
      parkLifeAnimators[i](time);
    }
  };
  update(0);

  world.scene.add(group);
  world.cameraObstacles.push(plazaFloor);

  const riverAhead = toWorld(stallLx, deckRiverZ(stallLx) - 12);
  const riverRim = toWorld(stallLx, deckRiverZ(stallLx));
  const seatHeading = Math.atan2(
    riverAhead.x - riverRim.x,
    riverAhead.z - riverRim.z,
  );
  const vendorPos = toWorld(stallLx, stallLz);
  const fishingSpot = {
    vendorPos: { ...vendorPos, y: deckY },
    seatY: deckY,
    seatHeading,
    deckLandZ,
    deckRiverZ,
    fishShoal: riverFishSwimmers,
    isFishingActive: () => fishingActive,
    setFishingActive(active, anchorWorldPos = null) {
      fishingActive = Boolean(active);
      if (anchorWorldPos && Number.isFinite(anchorWorldPos.x) && Number.isFinite(anchorWorldPos.z)) {
        const loc = toLocal(anchorWorldPos.x, anchorWorldPos.z);
        fishingAnchorLx = Math.max(-46, Math.min(46, loc.lx));
      } else {
        fishingAnchorLx = stallLx;
      }
    },
    seatAtWorld(wx, wz) {
      const loc = toLocal(wx, wz);
      const clampedLx = Math.max(-48, Math.min(48, Number.isFinite(loc.lx) ? loc.lx : stallLx));
      const seatLz = deckRiverZ(clampedLx) + 0.42;
      const w = toWorld(clampedLx, seatLz);
      return {
        x: w.x,
        y: deckY,
        z: w.z,
        heading: seatHeading,
        lx: clampedLx,
        lz: seatLz,
      };
    },
    isNearDeckEdge(wx, wz, margin = 4.2) {
      const loc = toLocal(wx, wz);
      if (loc.lx < -54 || loc.lx > 54) return false;
      const rz = deckRiverZ(loc.lx);
      return loc.lz >= rz - 0.6 && loc.lz <= rz + margin;
    },
  };

  return {
    group,
    toLocal,
    toWorld,
    fishingSpot,
    fishShoal: riverFishSwimmers,
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
    update,
    isWaterBlocked(wx, wz, pad = 2.0) {
      const { lx, lz } = toLocal(wx, wz);
      return lx >= -66 && lx <= 66 && lz >= deckRiverZ(lx) - pad && lz <= deckLandZ(lx) + 2;
    },
    groundAt(wx, wz, referenceY) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < -74 || lx > 72 || lz < -62 || lz > 41) return null;

      // Monument steps & upper terrace if riding right up onto the monument steps
      if (Math.abs(lx) <= 12.6 && Math.abs(lz) <= 8.2) {
        if (Math.abs(lx) < 2.7 && Math.abs(lz) > 5.6 && Math.abs(lz) <= 7.9) {
          const t = (7.9 - Math.abs(lz)) / 2.3;
          return CREST_Y + t * 0.96;
        }
        return CREST_Y;
      }

      // Continuous Brick-Cement Riverfront Promenade Wings (ramping smoothly from CREST_Y to 0.256m)
      if (
        ((lx >= -72 && lx < -35.5) || (lx > 31.5 && lx <= 68)) &&
        lz >= -15.5 &&
        lz <= -11.1
      ) {
        return upperTerraceY(lx);
      }
      // Elevated Bia Quốc Học terrace & rear balcony promenade (lz: -15.5 to +10.2)
      if (lx >= -35.5 && lx <= 31.5 && lz >= -15.5 && lz <= 10.2) {
        return CREST_Y;
      }
      // Front ceremonial steps & ramps (lz: +10.2 to +13.5) ascending 0.24m -> 1.56m
      if (lx >= -35.5 && lx <= 31.5 && lz > 10.2 && lz < 13.5) {
        const t = (13.5 - lz) / 3.3;
        return 0.24 + (CREST_Y - 0.24) * t;
      }
      // Front granite plaza facing Lê Lợi (lz: +13.5 to +36.8)
      if (lx >= -35.5 && lx <= 31.5 && lz >= 13.5 && lz <= 36.8) {
        return 0.24;
      }

      // Le Loi front approach ramp
      if (lx >= -35.5 && lx <= 31.5 && lz > 36.8 && lz <= 39.6) {
        const t = (39.6 - lz) / 2.8;
        return 0.14 + t * 0.1;
      }

      // Curved wooden riverside overlook deck
      if (lx >= -64 && lx <= 64 && lz <= deckLandZ(lx) && lz >= deckRiverZ(lx)) {
        if (!Number.isFinite(referenceY) || referenceY < 1.2) return deckY;
      }

      // Twin sloped granite walkways through terraced grass
      if (
        (Math.abs(lx + 14.5) <= 1.7 || Math.abs(lx - 14.5) <= 1.7) &&
        lz < -15.4 &&
        lz >= deckLandZ(lx)
      ) {
        return amphitheaterY(lx, lz) + 0.025;
      }

      // Sloped flanking grassy berms beside the elevated terrace
      if (lx > 31.5 && lx <= 44.0 && lz > -11.1 && lz <= 10.2) {
        const u = (44.0 - lx) / 12.5;
        return 0.13 + (CREST_Y - 0.17) * u;
      }
      if (lx < -35.5 && lx >= -46.0 && lz > -11.1 && lz <= 10.2) {
        const u = (lx + 46.0) / 10.5;
        return 0.13 + (CREST_Y - 0.17) * u;
      }

      // Continuous downward-sloping three-tier emerald grass amphitheater
      if (lx >= -60 && lx <= 60) {
        const zTop = zTopAt(lx);
        const zBot = deckLandZ(lx);
        if (lz <= zTop && lz >= zBot) {
          return amphitheaterY(lx, lz);
        }
      }

      return null;
    },
    canRide(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < -74 || lx > 72 || lz < -62 || lz > 41) return null;

      // Block riding through solid Bia Quốc Học monument lower/upper terrace walls (except outer apron)
      if (Math.abs(lx) < 12.5 && Math.abs(lz) < 5.8) return false;
      // Block Trụ Biểu bases
      if (Math.abs(Math.abs(lx) - 13.2) < 1.4 && Math.abs(lz - 9.2) < 1.4)
        return false;
      // Block fishing rental stall counter & rod rack
      if (Math.abs(lx - stallLx) < 1.55 && Math.abs(lz - stallLz) < 1.1)
        return false;
      // Block riding through any park tree trunk
      const wxPt = toWorld(lx, lz);
      if (
        treeColliders.some(
          (t) => (wxPt.x - t.x) ** 2 + (wxPt.z - t.z) ** 2 < t.r * t.r,
        )
      ) {
        return false;
      }
      // Allow riding along the rear upper promenade & twin sloped walkways down to the riverfront deck
      if (
        lx >= -35.5 &&
        lx <= 31.5 &&
        lz >= -15.5 &&
        lz <= -8.5
      ) {
        return true;
      }
      if (
        (Math.abs(lx + 14.5) <= 1.7 || Math.abs(lx - 14.5) <= 1.7) &&
        lz < -15.4 &&
        lz >= deckLandZ(lx)
      ) {
        return true;
      }
      // Allow riding along the brick-cement riverside promenade wings
      if (
        ((lx >= -72 && lx < -35.5) || (lx > 31.5 && lx <= 68)) &&
        lz >= -15.5 &&
        lz <= -11.1
      ) {
        return true;
      }
      // Allow riding onto the cantilevered curved wooden riverside overlook deck!
      if (
        lx >= -63.5 &&
        lx <= 63.5 &&
        lz <= deckLandZ(lx) &&
        lz >= deckRiverZ(lx) + 0.5
      ) {
        return true;
      }
      return null;
    },
    blocksGrass(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      // Skip wild grass blades across the entire paved plaza, monument, pergola, terraced lawns & wooden deck
      return lx >= -74 && lx <= 72 && lz >= -62 && lz <= 41;
    },
    blocksTree(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      // Keep central ceremonial plaza & riverfront grass amphitheater sightline completely clear
      if (lx >= -35 && lx <= 31 && lz >= -56 && lz <= 42) return true;
      if (lx >= -62 && lx <= 60 && lz >= -58 && lz <= -12) return true;
      return false;
    },
  };
}
