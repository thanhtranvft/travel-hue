import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import {
  createBrickCementPromenadeGeometry,
  createBrickCementWalkMaterial,
  createIronwoodWalkMaterial,
  createManicuredLawnTexture,
} from "../../../../core/world/turfTextures.js";
import {
  createBadmintonGroup,
  createDaCauGroup,
  createGuitarCircleGroup,
  createKiteFlyingGroup,
  createSeatedBenchCouple,
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

function createSandyPlazaTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#d9cdb6";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 3200; i++) {
        const x = (i * 197 + 23) % w;
        const y = (i * 313 + 71) % h;
        const s = 1 + (i % 3);
        ctx.fillStyle =
          i % 4 === 0
            ? "rgba(165, 149, 122, 0.35)"
            : i % 4 === 1
              ? "rgba(242, 234, 218, 0.38)"
              : "rgba(196, 181, 154, 0.28)";
        ctx.fillRect(x, y, s, s);
      }
      // Subtle swept concentric sandy rings
      if (typeof ctx.arc === "function") {
        ctx.strokeStyle = "rgba(170, 154, 128, 0.14)";
        ctx.lineWidth = 2;
        for (let r = 36; r < 250; r += 28) {
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    },
    6,
    6,
  );
}

function createGraniteWalkTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#cbc7bc";
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let r = 0; r < h / tile; r++) {
        for (let c = 0; c < w / tile; c++) {
          const shade = ((r * 5 + c * 11) % 5) * 3 - 6;
          ctx.fillStyle = `rgb(${202 + shade}, ${198 + shade}, ${189 + shade})`;
          ctx.fillRect(c * tile + 1, r * tile + 1, tile - 2, tile - 2);
        }
      }
    },
    10,
    4,
  );
}

function createLawnTexture() {
  return createManicuredLawnTexture(10, 8, { striped: true, rich: true });
}

function createParkBench(x, y, z, yaw = 0) {
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
    box([1.75, 0.07, 0.46], "#9c6840", [0, 0.45, 0.02]),
    box([1.75, 0.34, 0.06], "#a67147", [0, 0.72, -0.22]),
  );
  return g;
}

function createParkLamp(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const darkBronze = mat("#2a3734", 0.5, 0.55);
  const globeMat = new THREE.MeshStandardMaterial({
    color: "#fff4d2",
    emissive: "#ffd57a",
    emissiveIntensity: 0.78,
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

function createShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.4;
  const trunkMat = mat("#695541", 0.9);
  const trunkH = 2.7 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.26 * scale, trunkH, 7),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const colors = ["#3f7436", "#4f873f", "#5b9445"];
  const crowns = [
    [0, trunkH + 1.45 * scale, 0, 1.9 * scale, 0.72],
    [1.0 * scale, trunkH + 1.1 * scale, 0.6 * scale, 1.3 * scale, 0.74],
    [-1.0 * scale, trunkH + 1.15 * scale, -0.55 * scale, 1.35 * scale, 0.72],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(colors[i % colors.length], 0.85),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.12, sy, 1.08);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });
  return g;
}

function createCarvedMonolith(x, y, z, yaw = 0, scale = 1) {
  // Tall carved basalt art stele like the left foreground sculpture in Lý Tự Trọng park
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const darkStone = mat("#5e6362", 0.88);
  const paleCarve = mat("#9ca09d", 0.82);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15 * scale, 1.35 * scale, 0.36 * scale, 7),
    mat("#6d716e", 0.9),
  );
  plinth.position.y = 0.18 * scale;
  plinth.receiveShadow = true;

  const baseRock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.95 * scale, 0),
    darkStone,
  );
  baseRock.position.set(0, 0.85 * scale, 0);
  baseRock.scale.set(0.95, 1.15, 0.7);
  baseRock.castShadow = baseRock.receiveShadow = true;

  const shaft = box(
    [0.92 * scale, 3.35 * scale, 0.62 * scale],
    "#636867",
    [0, 2.35 * scale, 0],
  );
  shaft.castShadow = shaft.receiveShadow = true;

  const relief = box(
    [0.54 * scale, 2.2 * scale, 0.68 * scale],
    "#9da29f",
    [0.06 * scale, 2.55 * scale, 0],
  );
  relief.castShadow = true;

  const crown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55 * scale, 0),
    paleCarve,
  );
  crown.position.set(-0.08 * scale, 4.1 * scale, 0);
  crown.scale.set(0.9, 1.25, 0.65);
  crown.castShadow = true;

  g.add(plinth, baseRock, shaft, relief, crown);
  return g;
}

function createWhitePhotoArch(x, y, z, yaw = 0) {
  // Sculptural crescent/ribbon white check-in arch visible in background right
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const whiteMat = mat("#efede6", 0.6);
  const accentMat = mat("#8eb868", 0.8);

  const base = box([6.6, 0.22, 2.1], "#bcb8ab", [0, 0.11, 0]);
  const mainArch = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.3, 10, 28, Math.PI),
    whiteMat,
  );
  mainArch.position.set(0, 0.22, 0);
  mainArch.castShadow = true;

  const innerRingL = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.18, 8, 18),
    whiteMat,
  );
  innerRingL.position.set(-2.3, 2.15, 0);
  const innerRingR = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.18, 8, 18),
    whiteMat,
  );
  innerRingR.position.set(2.3, 2.15, 0);

  const planter = box([4.8, 0.35, 1.1], "#577d3f", [0, 0.36, 0.35]);
  const shrub = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.55, 0),
    accentMat,
  );
  shrub.position.set(0, 0.72, 0.35);
  shrub.scale.set(2.6, 0.7, 0.9);

  g.add(base, mainArch, innerRingL, innerRingR, planter, shrub);
  return g;
}

export function createFireflyTreePark(world, biaSite, heading, options = {}) {
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

  // Determine exact center lx directly opposite Trường Hai Bà Trưng gate
  let treeLx = 155.1;
  if (options.haiBaTrung?.sign) {
    treeLx = toLocal(options.haiBaTrung.sign.x, options.haiBaTrung.sign.z).lx;
  }
  const treeLz = 3.5;

  const shoreCache = new Map();
  const sampleShoreZ = (lx) => {
    const key = Math.round(lx * 2);
    if (shoreCache.has(key)) return shoreCache.get(key);
    let val = -50.4 + 0.095 * lx;
    if (world.riverRings?.length) {
      let lo = -75;
      let hi = -10;
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
    const blend = Math.max(0, Math.min(1, (lx - 64) / 10));
    return sampleShoreZ(lx) + 4.8 * (1 - blend) + 3.8 * blend;
  };
  const shoreDeckRiverZ = (lx) => {
    const blend = Math.max(0, Math.min(1, (lx - 64) / 10));
    return sampleShoreZ(lx) - (1.2 * (1 - blend) + 0.8 * blend);
  };
  const shoreDeckY = 0.36;

  const group = new THREE.Group();
  group.name = "firefly-tree-park";
  group.position.set(biaSite.center.x, 0, biaSite.center.z);
  group.rotation.y = heading;

  const sandyTex = createSandyPlazaTexture();
  const graniteTex = createGraniteWalkTexture();
  const lawnTex = createLawnTexture();

  const sandyMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: sandyTex,
    roughness: 0.9,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const graniteMat = new THREE.MeshStandardMaterial({
    color: "#dad7ce",
    map: graniteTex,
    roughness: 0.84,
    metalness: 0.03,
    side: THREE.DoubleSide,
  });
  const lawnMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: lawnTex,
    roughness: 0.92,
    metalness: 0.01,
    side: THREE.DoubleSide,
  });
  const curbMat = mat("#cfc9bb", 0.86);

  // 1. CONTINUOUS LUSH PARK LAWN BASE (lx: +68 to +218, lz: -28 to +38.8)
  const lawnSpanX = 149.9;
  const lawnCenterX = 143.0;
  const lawnMesh = new THREE.Mesh(
    new THREE.BoxGeometry(lawnSpanX, 0.14, 67),
    lawnMat,
  );
  lawnMesh.position.set(lawnCenterX, 0.06, 5.3);
  lawnMesh.receiveShadow = true;
  group.add(lawnMesh);

  // Riverbank green embankment strip down to Perfume River water line
  const shorePoints = [];
  for (let lx = 68; lx <= 218; lx += 4) {
    shorePoints.push({ lx, zTop: -15.5, zBot: sampleShoreZ(lx) - 0.3 });
  }
  const bankPos = [];
  const bankUvs = [];
  const bankIdx = [];
  shorePoints.forEach((s, i) => {
    const u = i / (shorePoints.length - 1);
    bankPos.push(s.lx, 0.2, s.zTop, s.lx, 0.08, s.zBot);
    bankUvs.push(u * 10, 0, u * 10, 1);
    if (i > 0) {
      const a = (i - 1) * 2;
      bankIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });
  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute("position", new THREE.Float32BufferAttribute(bankPos, 3));
  bankGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bankUvs, 2));
  bankGeo.setIndex(bankIdx);
  bankGeo.computeVertexNormals();
  const bankMesh = new THREE.Mesh(bankGeo, lawnMat);
  bankMesh.receiveShadow = true;
  group.add(bankMesh);

  // 2. CONTINUOUS BRICK-CEMENT (XI MĂNG GẠCH) UPPER PROMENADE & SHORELINE WOODEN BOARDWALK
  const brickCementWalkMat = createBrickCementWalkMaterial(1, 1);
  const ironwoodWalkMat = createIronwoodWalkMaterial(1, 1);
  const promenade = new THREE.Mesh(
    createBrickCementPromenadeGeometry(149.96, 0.256, 4.4, 4.2),
    brickCementWalkMat,
  );
  promenade.position.set(143.0, 0.128, -13.3);
  promenade.receiveShadow = true;

  // River-side & inner light cement curbs framing the upper brick-cement promenade
  const riverWall = new THREE.Mesh(
    new THREE.BoxGeometry(149.96, 0.29, 0.28),
    mat("#b8b4aa", 0.84),
  );
  riverWall.position.set(143.0, 0.145, -15.65);
  const innerCurb = new THREE.Mesh(
    new THREE.BoxGeometry(149.96, 0.28, 0.16),
    mat("#b8b4aa", 0.84),
  );
  innerCurb.position.set(143.0, 0.14, -11.0);
  group.add(innerCurb);

  // Continuous 0.36m shoreline wooden boardwalk connecting BiaQuocHocPark (lx=64) -> FountainPark (lx=218)
  const shoreSamples = [];
  for (let lx = 64.02; lx <= 217.98; lx = Math.min(217.98, lx + 2.5)) {
    shoreSamples.push({
      lx,
      zLand: shoreDeckLandZ(lx),
      zRiver: shoreDeckRiverZ(lx),
    });
    if (lx >= 217.98) break;
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
    const u = (s.lx - 64.02) / 3.2;
    sPos.push(s.lx, shoreDeckY, s.zLand, s.lx, shoreDeckY, s.zRiver);
    sUvs.push(u, 0, u, 1);
    fPos.push(s.lx, shoreDeckY, s.zRiver, s.lx, shoreDeckY - 0.24, s.zRiver);
    fUvs.push(u, 0, u, 1);
    lPos.push(s.lx, shoreDeckY, s.zLand, s.lx, shoreDeckY - 0.2, s.zLand);
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

  const timberTrimMat = mat("#4c2d17", 0.84);
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

  // Submerged concrete support piles beneath the shoreline boardwalk
  const shorePileCoords = [];
  for (let lx = 68; lx <= 214; lx += 6.5) {
    shorePileCoords.push([lx, shoreDeckRiverZ(lx) + 0.65]);
  }
  const shorePiles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.19, 0.21, 0.85, 8),
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

  // Granite connecting footpaths linking upper brick-cement walk down to shoreline boardwalk
  const shoreConnectors = [98, 155, 198];
  for (const cxLink of shoreConnectors) {
    const zStart = -15.8;
    const zEnd = shoreDeckLandZ(cxLink) + 0.02;
    const cLen = Math.max(2, Math.abs(zStart - zEnd));
    const midZ = (zStart + zEnd) / 2;
    const linkMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.14, cLen),
      graniteMat,
    );
    linkMesh.position.set(cxLink, 0.23, midZ);
    linkMesh.rotation.x = -Math.atan2(0.11, cLen);
    linkMesh.receiveShadow = true;
    group.add(linkMesh);
  }

  // Approach walkway from Lê Lợi sidewalk directly opposite Trường Hai Bà Trưng gate
  const gateWalk = new THREE.Mesh(
    new THREE.BoxGeometry(9.2, 0.205, 21),
    graniteMat,
  );
  gateWalk.position.set(treeLx, 0.1025, 29.2);
  gateWalk.receiveShadow = true;

  const approachRamp = new THREE.Mesh(
    new THREE.BoxGeometry(9.6, 0.14, 3.0),
    curbMat,
  );
  approachRamp.position.set(treeLx, 0.13, 39.2);
  approachRamp.rotation.x = 0.035;

  // East garden walkway linking Firefly clearing directly to FountainPark West wing (lx=218, lz=6.5)
  const eastLinkWalk = new THREE.Mesh(
    new THREE.BoxGeometry(218 - (treeLx + 20), 0.205, 3.4),
    graniteMat,
  );
  eastLinkWalk.position.set((treeLx + 20 + 218) / 2, 0.1025, 6.5);
  eastLinkWalk.receiveShadow = true;

  // Neat dark-green trimmed boxwood borders flanking the lawn wings (kept clear of south tree row at lz = -9.6)
  for (const [bx, bw, bz, bd] of [
    [98, 42, 34.5, 0.5],
    [98, 42, -7.6, 0.5],
    [200, 26, 34.5, 0.5],
    [200, 26, -7.6, 0.5],
  ]) {
    const hedge = new THREE.Mesh(
      new THREE.BoxGeometry(bw, 0.26, bd),
      mat("#366d29", 0.88),
    );
    hedge.position.set(bx, 0.24, bz);
    hedge.castShadow = hedge.receiveShadow = true;
    group.add(hedge);
  }

  group.add(promenade, riverWall, gateWalk, approachRamp, eastLinkWalk);

  // 3. CIRCULAR SUNLIT SANDY-GRAVEL CLEARING AROUND CÂY ĐOM ĐÓM (r = 22.5m)
  const clearingRadius = 22.5;
  const clearingRim = new THREE.Mesh(
    new THREE.CylinderGeometry(clearingRadius + 0.45, clearingRadius + 0.55, 0.22, 48),
    curbMat,
  );
  clearingRim.position.set(treeLx, 0.11, treeLz);
  clearingRim.receiveShadow = true;

  const clearingDisk = new THREE.Mesh(
    new THREE.CylinderGeometry(clearingRadius, clearingRadius, 0.24, 48),
    sandyMat,
  );
  clearingDisk.position.set(treeLx, 0.12, treeLz);
  clearingDisk.receiveShadow = true;
  group.add(clearingRim, clearingDisk);

  // 4. MASSIVE ANCIENT WISHING TREE (CÂY ĐOM ĐÓM / CÂY ĐA ƯỚC NGUYỆN)
  const wishingTree = new THREE.Group();
  wishingTree.name = "cay-dom-dom-wishing-tree";
  wishingTree.position.set(treeLx, 0.24, treeLz);

  const barkMat = mat("#4b3b2c", 0.94);
  const rootMat = mat("#594635", 0.92);

  // Main gnarled trunk & flared root base
  const mainTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(1.45, 2.25, 4.8, 12),
    barkMat,
  );
  mainTrunk.position.y = 2.4;
  mainTrunk.castShadow = mainTrunk.receiveShadow = true;
  wishingTree.add(mainTrunk);

  // 7 buttressed surface roots radiating into the gravel clearing
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7 + 0.2;
    const root = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.58, 3.6, 7),
      rootMat,
    );
    root.position.set(Math.cos(a) * 1.9, 0.65, Math.sin(a) * 1.9);
    root.rotation.z = -Math.cos(a) * 1.05;
    root.rotation.x = Math.sin(a) * 1.05;
    root.castShadow = root.receiveShadow = true;
    wishingTree.add(root);
  }

  // 8 wide-spreading gnarled boughs supporting the vast umbrella canopy
  const boughTips = [];
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + 0.15;
    const boughLen = 8.4 + (i % 2) * 1.6;
    const bough = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.56, boughLen, 8),
      barkMat,
    );
    bough.position.set(
      Math.cos(a) * (boughLen * 0.48),
      5.2,
      Math.sin(a) * (boughLen * 0.48),
    );
    bough.rotation.z = -Math.cos(a) * 1.18;
    bough.rotation.x = Math.sin(a) * 1.18;
    bough.castShadow = true;
    wishingTree.add(bough);
    boughTips.push({ a, r: boughLen });
  }

  // Dense multi-tiered emerald banyan canopy (spanning ~25m wide x 13.5m high)
  const canopyTones = ["#2e6426", "#39732e", "#468337", "#538f40"];
  const domeSpecs = [
    [0, 9.6, 0, 5.8, 0.64],
    [0, 11.4, 0, 4.1, 0.62],
  ];
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI * 2) / 10;
    const r = 6.2 + (i % 2) * 1.4;
    domeSpecs.push([
      Math.cos(a) * r,
      7.9 + (i % 3) * 0.65,
      Math.sin(a) * r,
      4.15 + (i % 2) * 0.55,
      0.66,
    ]);
  }
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12 + 0.25;
    const r = 9.5 + (i % 2) * 0.9;
    domeSpecs.push([
      Math.cos(a) * r,
      6.7 + (i % 2) * 0.45,
      Math.sin(a) * r,
      2.95,
      0.62,
    ]);
  }
  domeSpecs.forEach(([cx, cy, cz, rad, sy], idx) => {
    const dome = new THREE.Mesh(
      new THREE.DodecahedronGeometry(rad, 1),
      mat(canopyTones[idx % canopyTones.length], 0.86),
    );
    dome.position.set(cx, cy, cz);
    dome.scale.set(1.12, sy, 1.12);
    dome.castShadow = dome.receiveShadow = true;
    wishingTree.add(dome);
  });

  // Circular wrap-around timber bench ring around the trunk base (r = 4.6m)
  const benchRadius = 4.6;
  const benchRing = new THREE.Mesh(
    new THREE.TorusGeometry(benchRadius, 0.28, 6, 36),
    mat("#8d5b34", 0.78),
  );
  benchRing.rotation.x = Math.PI / 2;
  benchRing.scale.set(1, 1, 0.35);
  benchRing.position.y = 0.46;
  benchRing.castShadow = benchRing.receiveShadow = true;
  wishingTree.add(benchRing);

  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const leg = box([0.14, 0.44, 0.36], "#353c38", [
      Math.cos(a) * benchRadius,
      0.22,
      Math.sin(a) * benchRadius,
    ]);
    leg.rotation.y = -a;
    wishingTree.add(leg);
  }

  // 5. HANGING CRIMSON-RED WISH RIBBONS (Dải lụa đỏ ước nguyện)
  const ribbonCount = 180;
  const ribbonGeo = new THREE.PlaneGeometry(0.11, 2.35, 1, 4);
  ribbonGeo.translate(0, -1.175, 0); // Pivot at top attachment point under canopy!
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: "#df2622",
    emissive: "#6b0d0b",
    emissiveIntensity: 0.28,
    roughness: 0.52,
    side: THREE.DoubleSide,
  });
  const ribbons = new THREE.InstancedMesh(ribbonGeo, ribbonMat, ribbonCount);
  ribbons.name = "wish-ribbons";
  const ribbonData = [];
  const dummy = new THREE.Object3D();
  for (let i = 0; i < ribbonCount; i++) {
    const angle = (i * 2.39996) % (Math.PI * 2); // golden-angle distribution around canopy
    const band = i % 3;
    const radius = band === 0 ? 7.2 + (i % 5) * 0.45 : band === 1 ? 9.6 + (i % 4) * 0.55 : 11.4 + (i % 3) * 0.45;
    const attachY = band === 0 ? 5.15 : band === 1 ? 5.35 : 5.55;
    const scaleY = 0.78 + ((i * 17) % 10) * 0.05;
    const rx = Math.cos(angle) * radius;
    const rz = Math.sin(angle) * radius;
    const phase = i * 0.47;
    ribbonData.push({ rx, attachY, rz, angle, scaleY, phase });

    dummy.position.set(rx, attachY, rz);
    dummy.rotation.set(0.08, -angle, 0.1);
    dummy.scale.set(1, scaleY, 1);
    dummy.updateMatrix();
    ribbons.setMatrixAt(i, dummy.matrix);
  }
  ribbons.instanceMatrix.needsUpdate = true;
  ribbons.computeBoundingSphere();
  wishingTree.add(ribbons);

  // 6. TWINKLING GOLDEN FIREFLY LIGHTS (Đèn đom đóm)
  const fireflyCount = 96;
  const fireflyGeo = new THREE.SphereGeometry(0.11, 8, 6);
  const fireflyMat = new THREE.MeshBasicMaterial({
    color: "#ffe77a",
  });
  const fireflies = new THREE.InstancedMesh(fireflyGeo, fireflyMat, fireflyCount);
  fireflies.name = "firefly-lights";
  const fireflyData = [];
  for (let i = 0; i < fireflyCount; i++) {
    const angle = (i * 2.39996 + 0.5) % (Math.PI * 2);
    const radius = 5.4 + ((i * 7) % 13) * 0.62;
    const baseY = 3.1 + ((i * 11) % 9) * 0.42;
    const fx = Math.cos(angle) * radius;
    const fz = Math.sin(angle) * radius;
    const phase = i * 0.73;
    fireflyData.push({ fx, baseY, fz, phase });

    dummy.position.set(fx, baseY, fz);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.setScalar(1);
    dummy.updateMatrix();
    fireflies.setMatrixAt(i, dummy.matrix);
  }
  fireflies.instanceMatrix.needsUpdate = true;
  fireflies.computeBoundingSphere();
  wishingTree.add(fireflies);

  group.add(wishingTree);

  // 7. CARVED STONE MONOLITH SCULPTURES & DECORATIVE CHECK-IN ARCH
  group.add(createCarvedMonolith(treeLx - 15.5, 0.24, treeLz + 13.5, 0.35, 1.05));
  group.add(createCarvedMonolith(treeLx + 17.5, 0.24, treeLz + 10.5, -0.45, 0.82));
  group.add(createCarvedMonolith(treeLx - 27, 0.13, -4.5, 0.2, 0.92));
  group.add(createWhitePhotoArch(treeLx + 22, 0.14, -5.5, -0.35));

  // 8. BENCHES, HERITAGE LAMPS & FRAMING SHADE TREES (2 symmetrical rows along upper brick-cement walk + shoreline lamps/benches)
  for (const bx of [86, 106, 126, 178, 198, 212]) {
    group.add(createParkBench(bx, 0.256, -14.2, Math.PI));
  }
  for (const bx of [86, 126, 178, 208]) {
    group.add(
      createParkBench(bx, shoreDeckY, shoreDeckLandZ(bx) - 0.75, Math.PI),
      createParkLamp(bx + 4.5, shoreDeckY, shoreDeckLandZ(bx) - 0.55),
    );
  }
  for (const [lx, lz] of [
    [92, -12],
    [122, -12],
    [treeLx - 18, 24],
    [treeLx + 18, 24],
    [186, -12],
    [212, -12],
  ]) {
    group.add(createParkLamp(lx, lz <= -11 ? 0.256 : 0.23, lz));
  }

  const promenadeRowLxs = [75, 88, 105, 118, 130, 180, 190, 204, 213];
  const promenadeRowTrees = promenadeRowLxs.flatMap((lx, i) => {
    const northScale = 1.06 + (i % 3) * 0.05;
    const southScale = 1.05 + ((i + 1) % 3) * 0.05;
    return [
      [lx, -16.9, northScale],
      [lx, -9.6, southScale],
    ];
  });

  const framingTrees = [
    [82, 26, 1.18],
    [96, 14, 1.28],
    [104, 30, 1.12],
    [116, 4, 1.24],
    [118, 28, 1.1],
    [192, 28, 1.15],
    [196, 10, 1.26],
    [208, 26, 1.18],
    [212, 2, 1.22],
    ...promenadeRowTrees,
  ];
  const treeColliders = [];
  const wishingTreeWorld = toWorld(treeLx, treeLz);
  treeColliders.push({ x: wishingTreeWorld.x, z: wishingTreeWorld.z, r: 2.35, lx: treeLx, lz: treeLz });
  framingTrees.forEach(([tx, tz, sc], idx) => {
    group.add(createShadeTree(tx, tz < -15 ? 0.18 : 0.13, tz, sc, idx + 1));
    const wp = toWorld(tx, tz);
    treeColliders.push({ x: wp.x, z: wp.z, r: 0.85, lx: tx, lz: tz });
  });

  const lifeAnimators = [];
  // Talking couples on promenade benches & circular Wishing Tree bench ring
  [86, 126, 178, 212].forEach((bx, idx) => {
    const couple = createSeatedBenchCouple({
      x: bx,
      benchBaseY: 0.256,
      z: -14.2,
      yaw: Math.PI,
      manIndex: idx + 1,
      womanIndex: idx + 2,
      phase: idx * 0.9,
    });
    group.add(couple.group);
    lifeAnimators.push(couple.update);
  });
  [0.65, 2.75, 4.75].forEach((a, idx) => {
    const couple = createSeatedBenchCouple({
      x: Math.cos(a) * benchRadius,
      benchBaseY: 0,
      seatDeltaY: 0.07,
      z: Math.sin(a) * benchRadius,
      yaw: Math.PI / 2 - a,
      manIndex: idx + 3,
      womanIndex: idx,
      phase: idx * 1.4,
    });
    wishingTree.add(couple.group);
    lifeAnimators.push(couple.update);
  });

  // Youth & community activity groups on sunlit lawns
  const ffKiteWest = createKiteFlyingGroup({ x: 84, y: 0.13, z: 2, yaw: 0.1, phase: 0.5 });
  const ffKiteEast = createKiteFlyingGroup({ x: 204, y: 0.13, z: 16, yaw: -0.15, phase: 1.3 });
  const ffBadminton = createBadmintonGroup({ x: 106, y: 0.13, z: 21, yaw: 0.4, phase: 0.6 });
  const ffGuitar = createGuitarCircleGroup({ x: 124, y: 0.13, z: 18, phase: 0.9 });
  const ffDaCau = createDaCauGroup({ x: 186, y: 0.13, z: 20, phase: 0.4 });
  group.add(
    ffKiteWest.group,
    ffKiteEast.group,
    ffBadminton.group,
    ffGuitar.group,
    ffDaCau.group,
  );
  lifeAnimators.push(
    ffKiteWest.update,
    ffKiteEast.update,
    ffBadminton.update,
    ffGuitar.update,
    ffDaCau.update,
  );

  world.scene.add(group);
  world.cameraObstacles.push(mainTrunk);

  const parkCenter = toWorld(138, 0);
  const animatedObjects = [ribbons, fireflies];
  const update = (time, position = null) => {
    if (
      position &&
      Number.isFinite(position.x) &&
      Number.isFinite(position.z) &&
      (position.x - parkCenter.x) ** 2 + (position.z - parkCenter.z) ** 2 >
        210 * 210
    ) {
      return;
    }
    for (let i = 0; i < ribbonCount; i++) {
      const r = ribbonData[i];
      const sway = Math.sin(time * 1.45 + r.phase) * 0.14;
      const twist = Math.cos(time * 0.95 + r.phase * 1.3) * 0.12;
      dummy.position.set(r.rx, r.attachY, r.rz);
      dummy.rotation.set(0.08 + sway * 0.6, -r.angle + twist, 0.12 + sway);
      dummy.scale.set(1, r.scaleY, 1);
      dummy.updateMatrix();
      ribbons.setMatrixAt(i, dummy.matrix);
    }
    ribbons.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < fireflyCount; i++) {
      const f = fireflyData[i];
      const pulse = 0.65 + 0.55 * Math.sin(time * 2.8 + f.phase);
      const bobY = Math.sin(time * 1.3 + f.phase) * 0.22;
      const driftX = Math.cos(time * 0.9 + f.phase) * 0.14;
      dummy.position.set(f.fx + driftX, f.baseY + bobY, f.fz);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      fireflies.setMatrixAt(i, dummy.matrix);
    }
    fireflies.instanceMatrix.needsUpdate = true;
    for (let i = 0; i < lifeAnimators.length; i++) {
      lifeAnimators[i](time);
    }
  };

  return {
    group,
    treeCenterLocal: { lx: treeLx, lz: treeLz },
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
      return lx >= 64 && lx <= 218 && lz >= shoreDeckRiverZ(lx) - pad && lz <= 41;
    },
    animatedObjects,
    update,
    groundAt(wx, wz, referenceY) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < 64 || lx > 218 || lz < shoreDeckRiverZ(lx) - 0.5 || lz > 41)
        return null;
      if (Number.isFinite(referenceY) && referenceY > 1.8) return null;

      // Continuous shoreline wooden boardwalk (y = 0.36m)
      if (lx >= 64 && lx <= 218 && lz <= shoreDeckLandZ(lx) && lz >= shoreDeckRiverZ(lx)) {
        return shoreDeckY;
      }
      if (lx < 68) return null;

      // Granite connecting paths from upper brick-cement walk down to shoreline boardwalk
      if (
        shoreConnectors.some((cxLink) => Math.abs(lx - cxLink) <= 1.55) &&
        lz < -15.5 &&
        lz >= shoreDeckLandZ(lx)
      ) {
        const zEnd = shoreDeckLandZ(lx);
        const t = (-15.5 - lz) / Math.max(1, -15.5 - zEnd);
        return 0.256 + t * (shoreDeckY - 0.256);
      }

      // Continuous upper brick-cement promenade
      if (lz >= -15.6 && lz <= -11.0) return 0.256;
      // Sandy circular clearing
      if (Math.hypot(lx - treeLx, lz - treeLz) <= clearingRadius + 0.4) {
        return 0.24;
      }
      // Hai Bà Trưng approach walk & East garden link to Fountain Park
      if (Math.abs(lx - treeLx) <= 4.7 && lz >= 18 && lz <= 38.8) return 0.205;
      if (lx >= treeLx + 20 && lx <= 218 && Math.abs(lz - 6.5) <= 2.0) return 0.205;
      // Approach ramp at Lê Lợi
      if (Math.abs(lx - treeLx) <= 4.8 && lz > 38.8 && lz <= 40.7) {
        const t = (40.7 - lz) / 1.9;
        return 0.14 + t * 0.1;
      }
      if (lz < -15.5) {
        const zBot = sampleShoreZ(lx);
        const t = Math.max(0, Math.min(1, (-15.5 - lz) / Math.max(1, -15.5 - zBot)));
        return 0.2 - t * 0.12;
      }
      return 0.13;
    },
    canRide(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      if (lx < 64 || lx > 218 || lz < shoreDeckRiverZ(lx) || lz > 40.5)
        return null;
      if (
        treeColliders.some(
          (t) => (wx - t.x) ** 2 + (wz - t.z) ** 2 < t.r * t.r,
        )
      ) {
        return false;
      }
      // Solid trunk + circular wrap-around bench ring
      if (Math.hypot(lx - treeLx, lz - treeLz) < benchRadius + 0.6) {
        return false;
      }
      // Carved stone monolith sculptures
      if (
        Math.hypot(lx - (treeLx - 15.5), lz - (treeLz + 13.5)) < 1.8 ||
        Math.hypot(lx - (treeLx + 17.5), lz - (treeLz + 10.5)) < 1.5 ||
        Math.hypot(lx - (treeLx - 27), lz - -4.5) < 1.6 ||
        (Math.abs(lx - (treeLx + 22)) < 3.6 && Math.abs(lz - -5.5) < 1.3)
      ) {
        return false;
      }
      // Shoreline wooden boardwalk
      if (lx >= 64 && lx <= 218 && lz <= shoreDeckLandZ(lx) && lz >= shoreDeckRiverZ(lx) + 0.45) {
        return true;
      }
      if (lx < 68) return null;
      // Park grounds & upper brick-cement promenade are smoothly rideable
      if (lz >= sampleShoreZ(lx) + 0.8 && lz <= 40.2) return true;
      return null;
    },
    blocksGrass(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      return lx >= 64 && lx <= 218 && lz >= shoreDeckRiverZ(lx) - 0.5 && lz <= 41;
    },
    blocksTree(wx, wz) {
      const { lx, lz } = toLocal(wx, wz);
      // Keep the entire Cây Đom Đóm clearing, approach from Hai Bà Trưng, and promenade clear of generic OSM trees
      if (lx >= 64 && lx <= 218 && lz >= shoreDeckRiverZ(lx) - 2 && lz <= -10) return true;
      if (Math.hypot(lx - treeLx, lz - treeLz) < clearingRadius + 6) return true;
      if (Math.abs(lx - treeLx) < 14 && lz >= 0 && lz <= 42) return true;
      return false;
    },
  };
}
