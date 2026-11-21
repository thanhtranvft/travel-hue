import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { BOARDWALK_Y } from "../../../../core/world/roadSurface.js";

const MAIN_BOARDWALK_IDS = [683633953, 1167513733, 1167513732];
export const LATERAL_BRIDGE_IDS = [1473289702, 1493443035, 1493443034, 1493443036];
const BANK_PROMENADE_ID = 1167513730;
const PHU_XUAN_SPAN_ID = 39419121;

export function lateralBridgeHeight(road, index, mainPoints) {
  if (!road?.points?.length || !mainPoints?.length) return 0.26;
  const pts = road.points;
  const d0 = nearestPoint(pts[0], mainPoints).distance;
  const d1 = nearestPoint(pts.at(-1), mainPoints).distance;
  const startAtBoardwalk = d0 <= d1;
  let total = 0;
  let dist = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    total += seg;
    if (i <= index) dist += seg;
  }
  const t = dist / (total || 1);
  const ratio = startAtBoardwalk ? 1 - t : t;
  return 0.26 + (BOARDWALK_Y - 0.26) * ratio;
}

function createLimWoodTexture(mobile = false) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#7a4a27";
  ctx.fillRect(0, 0, size, size);

  let seed = 313;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  // Horizontal planks in UV space (maps across deck width X, repeats along length Y)
  const plankCount = 16;
  const plankH = size / plankCount;
  const tones = ["#85522d", "#794825", "#8f5a33", "#6f4120", "#7f4d29"];
  for (let p = 0; p < plankCount; p++) {
    const y0 = p * plankH;
    ctx.fillStyle = tones[Math.floor(rand() * tones.length)];
    ctx.fillRect(0, y0, size, plankH - 1.5);

    // Subtle timber grain streaks running across the plank (horizontal)
    for (let g = 0; g < (mobile ? 10 : 20); g++) {
      const gy = y0 + 2 + rand() * (plankH - 4);
      ctx.fillStyle =
        rand() > 0.5 ? "rgba(42,20,8,0.18)" : "rgba(182,126,74,0.14)";
      ctx.fillRect(rand() * size * 0.4, gy, size * (0.35 + rand() * 0.65), 1.1);
    }

    // Dark recessed seam between adjacent ironwood planks
    ctx.fillStyle = "#3a200e";
    ctx.fillRect(0, y0 + plankH - 1.6, size, 1.6);
  }

  // Faint lengthwise bolt/board edge shadow near outer plank ends
  ctx.fillStyle = "rgba(38,20,9,0.2)";
  ctx.fillRect(0, 0, 5, size);
  ctx.fillRect(size - 5, 0, 5, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = mobile ? 2 : 4;
  return texture;
}

function stitchMainBoardwalk(roads) {
  const segA = roads.find((r) => r.id === 683633953);
  const segB = roads.find((r) => r.id === 1167513733);
  const segC = roads.find((r) => r.id === 1167513732);
  if (!segA || !segB || !segC) return [];
  const raw = [
    ...segA.points,
    ...segB.points.slice(1),
    ...segC.points.slice(1),
  ].map((p) => ({ x: p.x, z: p.z, y: BOARDWALK_Y }));
  return raw;
}

function buildFrames(points) {
  let arc = 0;
  return points.map((p, i) => {
    if (i > 0) {
      arc += Math.hypot(p.x - points[i - 1].x, p.z - points[i - 1].z);
    }
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    return {
      x: p.x,
      z: p.z,
      y: p.y ?? BOARDWALK_Y,
      s: arc,
      tx: dx / len,
      tz: dz / len,
      nx: -dz / len,
      nz: dx / len,
    };
  });
}

function frameAtArc(frames, s) {
  if (!frames.length) return null;
  if (s <= frames[0].s) return frames[0];
  if (s >= frames.at(-1).s) return frames.at(-1);
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1];
    const b = frames[i];
    if (s <= b.s) {
      const t = (s - a.s) / (b.s - a.s || 1);
      const tx = a.tx + (b.tx - a.tx) * t;
      const tz = a.tz + (b.tz - a.tz) * t;
      const len = Math.hypot(tx, tz) || 1;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        y: a.y + (b.y - a.y) * t,
        s,
        tx: tx / len,
        tz: tz / len,
        nx: -tz / len,
        nz: tx / len,
      };
    }
  }
  return frames.at(-1);
}

function buildTopDeck(frames, halfWidth, yTopOffset = 0, plankRepeatLength = 3.2) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const y = f.y + yTopOffset;
    positions.push(
      f.x + f.nx * -halfWidth,
      y,
      f.z + f.nz * -halfWidth,
      f.x + f.nx * halfWidth,
      y,
      f.z + f.nz * halfWidth,
    );
    uvs.push(0, f.s / plankRepeatLength, 1, f.s / plankRepeatLength);
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

function buildExtrudedStrip(frames, profile, uRepeat = 6) {
  const ring = profile.length;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    for (let k = 0; k < ring; k++) {
      const [lat, dy] = profile[k];
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

export function addLimWoodBoardwalk(world, roads) {
  const mainPoints = stitchMainBoardwalk(roads);
  if (mainPoints.length < 2) return null;

  const mobile = Boolean(world.quality?.mobile);
  const group = new THREE.Group();
  group.name = "lim-wood-boardwalk";

  const woodTex = createLimWoodTexture(mobile);
  const deckMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: woodTex,
    roughness: 0.78,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const fasciaMat = new THREE.MeshStandardMaterial({
    color: "#57381f",
    roughness: 0.85,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const railMat = new THREE.MeshStandardMaterial({
    color: "#7a4e2c",
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const pierMat = new THREE.MeshStandardMaterial({
    color: "#5e6159",
    roughness: 0.92,
    metalness: 0.05,
  });
  const concreteWallMat = new THREE.MeshStandardMaterial({
    color: "#b8b4aa",
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const soilMat = new THREE.MeshStandardMaterial({
    color: "#3d2f22",
    roughness: 0.95,
  });
  const shrubMat = new THREE.MeshStandardMaterial({
    color: "#55823b",
    roughness: 0.82,
  });

  const mainFrames = buildFrames(mainPoints);
  const totalMainLen = mainFrames.at(-1).s;
  const halfW = 2.1; // 4.2m total boardwalk width

  const deckParts = [];
  const beamParts = [];

  // 1. Main boardwalk plank top (y = 0.68m) + thick structural timber fascia/slab (y = 0.42..0.68m)
  deckParts.push(buildTopDeck(mainFrames, halfW, 0.004, 3.2));
  beamParts.push(
    buildExtrudedStrip(
      mainFrames,
      [
        [-halfW - 0.06, 0.0],
        [-halfW - 0.06, -0.28],
        [halfW + 0.06, -0.28],
        [halfW + 0.06, 0.0],
        [halfW - 0.02, 0.0],
        [halfW - 0.02, -0.2],
        [-halfW + 0.02, -0.2],
        [-halfW + 0.02, 0.0],
      ],
      6,
    ),
  );

  // Entry/exit timber shore ramps sloping cleanly down to footpath level (0.14m)
  for (const end of [
    { origin: mainFrames[0], dir: -1 },
    { origin: mainFrames.at(-1), dir: 1 },
  ]) {
    const f = end.origin;
    const rampPts = [
      { x: f.x, z: f.z, y: BOARDWALK_Y },
      { x: f.x + f.tx * end.dir * 4.5, z: f.z + f.tz * end.dir * 4.5, y: 0.14 },
    ];
    const rFrames = buildFrames(
      end.dir < 0 ? [rampPts[1], rampPts[0]] : rampPts,
    );
    deckParts.push(buildTopDeck(rFrames, halfW, 0.002, 3.2));
    beamParts.push(
      buildExtrudedStrip(
        rFrames,
        [
          [-halfW - 0.04, 0],
          [-halfW - 0.04, -0.2],
          [halfW + 0.04, -0.2],
          [halfW + 0.04, 0],
        ],
        4,
      ),
    );
  }

  // 2. Collect lateral cross-bridge junctions & construct the 4 lateral wooden footbridges
  const lateralJunctions = [];
  const lateralPiers = [];
  const bankPoints = [];
  const slatTransforms = [];
  const newelTransforms = [];
  const handrailParts = [];

  for (const latId of LATERAL_BRIDGE_IDS) {
    const road = roads.find((r) => r.id === latId);
    if (!road || road.points.length < 2) continue;
    const d0 = nearestPoint(road.points[0], mainPoints).distance;
    const d1 = nearestPoint(road.points.at(-1), mainPoints).distance;
    const startAtBoardwalk = d0 <= d1;
    const ordered = startAtBoardwalk
      ? road.points
      : road.points.slice().reverse();
    lateralJunctions.push(ordered[0]);
    bankPoints.push(ordered.at(-1));

    // Compute arc-length heights sloping from BOARDWALK_Y (0.68) at boardwalk to 0.24m at bank quay
    let latTotal = 0;
    for (let i = 1; i < ordered.length; i++) {
      latTotal += Math.hypot(
        ordered[i].x - ordered[i - 1].x,
        ordered[i].z - ordered[i - 1].z,
      );
    }
    let run = 0;
    const latWithY = ordered.map((p, i) => {
      if (i > 0) {
        run += Math.hypot(p.x - ordered[i - 1].x, p.z - ordered[i - 1].z);
      }
      const t = run / (latTotal || 1);
      return { x: p.x, z: p.z, y: BOARDWALK_Y * (1 - t) + 0.26 * t };
    });
    const lFrames = buildFrames(latWithY);
    const lHalfW = 1.5;

    deckParts.push(buildTopDeck(lFrames, lHalfW, 0.003, 2.8));
    beamParts.push(
      buildExtrudedStrip(
        lFrames,
        [
          [-lHalfW - 0.05, 0],
          [-lHalfW - 0.05, -0.24],
          [lHalfW + 0.05, -0.24],
          [lHalfW + 0.05, 0],
        ],
        5,
      ),
    );

    // Mid-span river piers supporting lateral footbridges
    for (const ratio of [0.35, 0.68]) {
      const pf = frameAtArc(lFrames, lFrames.at(-1).s * ratio);
      if (pf) lateralPiers.push(pf);
    }

    // Railings along both sides of lateral cross-bridge (trimmed clean at main boardwalk outer edge)
    const lLen = lFrames.at(-1).s;
    const trimStart = Math.min(2.05, lLen * 0.25);
    const trimmedRailFrames = [
      frameAtArc(lFrames, trimStart),
      ...lFrames.filter((lf) => lf.s > trimStart),
    ].filter(Boolean);
    for (const side of [-1, 1]) {
      const rLat = side * (lHalfW - 0.08);
      if (trimmedRailFrames.length >= 2) {
        handrailParts.push(
          buildExtrudedStrip(
            trimmedRailFrames,
            [
              [rLat - 0.06, 0.96],
              [rLat - 0.06, 1.03],
              [rLat + 0.06, 1.03],
              [rLat + 0.06, 0.96],
            ],
            4,
          ),
        );
      }
      const yaw = Math.atan2(lFrames[0].tx, lFrames[0].tz);
      for (let d = trimStart + 0.25; d <= lLen - 0.3; d += 0.34) {
        const sf = frameAtArc(lFrames, d);
        if (!sf) continue;
        slatTransforms.push({
          x: sf.x + sf.nx * rLat,
          y: sf.y + 0.49,
          z: sf.z + sf.nz * rLat,
          yaw: Math.atan2(sf.tx, sf.tz),
        });
      }
      for (let d = trimStart; d <= lLen - 0.2; d += 2.2) {
        const nf = frameAtArc(lFrames, d);
        if (!nf) continue;
        newelTransforms.push({
          x: nf.x + nf.nx * rLat,
          y: nf.y + 0.52,
          z: nf.z + nf.nz * rLat,
          yaw: Math.atan2(nf.tx, nf.tz) || yaw,
        });
      }
    }
  }

  // 3. Determine which side of main boardwalk faces river vs bank
  const isBankOpening = (x, z) =>
    lateralJunctions.some((j) => Math.hypot(x - j.x, z - j.z) < 2.1);

  // Split main boardwalk railings into continuous runs skipping lateral bridge openings
  for (const side of [-1, 1]) {
    const rLat = side * (halfW - 0.1);
    let currentRun = [];
    const flushRun = () => {
      if (currentRun.length >= 2) {
        const runFrames = buildFrames(currentRun);
        handrailParts.push(
          buildExtrudedStrip(
            runFrames,
            [
              [-0.065, 0.96],
              [-0.065, 1.04],
              [0.065, 1.04],
              [0.065, 0.96],
            ],
            4,
          ),
        );
        handrailParts.push(
          buildExtrudedStrip(
            runFrames,
            [
              [-0.04, 0.12],
              [-0.04, 0.18],
              [0.04, 0.18],
              [0.04, 0.12],
            ],
            4,
          ),
        );
      }
      currentRun = [];
    };

    for (let s = 0.5; s <= totalMainLen - 0.5; s += 0.33) {
      const f = frameAtArc(mainFrames, s);
      if (!f) continue;
      const rx = f.x + f.nx * rLat;
      const rz = f.z + f.nz * rLat;
      if (isBankOpening(rx, rz)) {
        flushRun();
        continue;
      }
      currentRun.push({ x: rx, z: rz, y: f.y });
      slatTransforms.push({
        x: rx,
        y: f.y + 0.49,
        z: rz,
        yaw: Math.atan2(f.tx, f.tz),
      });
    }
    flushRun();

    for (let s = 0.5; s <= totalMainLen - 0.5; s += 2.3) {
      const f = frameAtArc(mainFrames, s);
      if (!f) continue;
      const rx = f.x + f.nx * rLat;
      const rz = f.z + f.nz * rLat;
      if (isBankOpening(rx, rz)) continue;
      newelTransforms.push({
        x: rx,
        y: f.y + 0.52,
        z: rz,
        yaw: Math.atan2(f.tx, f.tz),
      });
    }
  }

  // Merge main deck, fascia/beams, and railings
  const deckGeo = mergeGeometries(deckParts);
  deckParts.forEach((g) => g.dispose());
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  const beamGeo = mergeGeometries(beamParts);
  beamParts.forEach((g) => g.dispose());
  const beamMesh = new THREE.Mesh(beamGeo, fasciaMat);
  beamMesh.castShadow = true;
  beamMesh.receiveShadow = true;
  group.add(beamMesh);

  if (handrailParts.length) {
    const hrGeo = mergeGeometries(handrailParts);
    handrailParts.forEach((g) => g.dispose());
    const hrMesh = new THREE.Mesh(hrGeo, railMat);
    hrMesh.castShadow = true;
    group.add(hrMesh);
  }

  const dummy = new THREE.Object3D();

  // Instanced dense vertical timber slats
  if (slatTransforms.length) {
    const slatGeo = new THREE.BoxGeometry(0.055, 0.98, 0.055);
    const slats = new THREE.InstancedMesh(
      slatGeo,
      railMat,
      slatTransforms.length,
    );
    slatTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      slats.setMatrixAt(i, dummy.matrix);
    });
    slats.instanceMatrix.needsUpdate = true;
    slats.computeBoundingSphere();
    group.add(slats);
  }

  // Instanced main timber posts
  if (newelTransforms.length) {
    const postGeo = new THREE.BoxGeometry(0.115, 1.06, 0.115);
    const posts = new THREE.InstancedMesh(
      postGeo,
      fasciaMat,
      newelTransforms.length,
    );
    newelTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      posts.setMatrixAt(i, dummy.matrix);
    });
    posts.instanceMatrix.needsUpdate = true;
    posts.computeBoundingSphere();
    group.add(posts);
  }

  // 4. River concrete/pile piers & cross-beams supporting the boardwalk & cross-bridges
  const mainPierFrames = [];
  for (let s = 4; s <= totalMainLen - 4; s += 6.5) {
    const f = frameAtArc(mainFrames, s);
    if (f) mainPierFrames.push(f);
  }
  const allPierPiles = [];
  const allCrossBeams = [];
  for (const f of mainPierFrames) {
    allCrossBeams.push({ x: f.x, y: f.y - 0.34, z: f.z, yaw: Math.atan2(f.tx, f.tz), scaleX: 1 });
    for (const side of [-1, 1]) {
      allPierPiles.push({
        x: f.x + f.nx * side * 1.45,
        y: (f.y - 0.34 - 0.65) / 2,
        z: f.z + f.nz * side * 1.45,
        h: f.y + 0.35,
      });
    }
  }
  for (const f of lateralPiers) {
    allCrossBeams.push({ x: f.x, y: f.y - 0.3, z: f.z, yaw: Math.atan2(f.tx, f.tz), scaleX: 0.72 });
    for (const side of [-1, 1]) {
      allPierPiles.push({
        x: f.x + f.nx * side * 1.02,
        y: (f.y - 0.3 - 0.65) / 2,
        z: f.z + f.nz * side * 1.02,
        h: f.y + 0.4,
      });
    }
  }

  if (allPierPiles.length) {
    const pileGeo = new THREE.CylinderGeometry(0.22, 0.24, 1.0, 10);
    const piles = new THREE.InstancedMesh(pileGeo, pierMat, allPierPiles.length);
    allPierPiles.forEach((p, i) => {
      dummy.position.set(p.x, -0.6 + p.h / 2, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, p.h, 1);
      dummy.updateMatrix();
      piles.setMatrixAt(i, dummy.matrix);
    });
    piles.instanceMatrix.needsUpdate = true;
    piles.computeBoundingSphere();
    group.add(piles);
  }

  if (allCrossBeams.length) {
    const crossGeo = new THREE.BoxGeometry(4.45, 0.26, 0.3);
    const crosses = new THREE.InstancedMesh(
      crossGeo,
      pierMat,
      allCrossBeams.length,
    );
    allCrossBeams.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.yaw, 0);
      dummy.scale.set(b.scaleX, 1, 1);
      dummy.updateMatrix();
      crosses.setMatrixAt(i, dummy.matrix);
    });
    crosses.instanceMatrix.needsUpdate = true;
    crosses.computeBoundingSphere();
    group.add(crosses);
  }

  // 5. Outer riverside rectangular timber planter boxes with green shrubs (skip under Phu Xuan bridge)
  const phuXuanRoad = roads.find((r) => r.id === PHU_XUAN_SPAN_ID);
  const planterFrames = [];
  for (let s = 14; s <= totalMainLen - 14; s += 8.5) {
    const f = frameAtArc(mainFrames, s);
    if (!f) continue;
    if (
      phuXuanRoad &&
      nearestPoint({ x: f.x, z: f.z }, phuXuanRoad.points).distance < 14
    ) {
      continue;
    }
    // Place planter box on the open river side (beyond the narrow bank inlet)
    const plusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x + f.nx * 26, z: f.z + f.nz * 26 }, ring),
    );
    const minusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x - f.nx * 26, z: f.z - f.nz * 26 }, ring),
    );
    const side =
      plusInRiver && !minusInRiver
        ? 1
        : minusInRiver && !plusInRiver
          ? -1
          : 1;
    planterFrames.push({ f, side });
  }

  if (planterFrames.length) {
    const boxGeo = new THREE.BoxGeometry(0.56, 0.52, 3.4);
    const soilGeo = new THREE.BoxGeometry(0.46, 0.08, 3.25);
    const shrubGeo = new THREE.DodecahedronGeometry(0.32, 0);

    const boxes = new THREE.InstancedMesh(boxGeo, railMat, planterFrames.length);
    const soils = new THREE.InstancedMesh(soilGeo, soilMat, planterFrames.length);
    const shrubs = new THREE.InstancedMesh(
      shrubGeo,
      shrubMat,
      planterFrames.length * 4,
    );

    let shrubIdx = 0;
    planterFrames.forEach(({ f, side }, idx) => {
      const yaw = Math.atan2(f.tx, f.tz);
      const px = f.x + f.nx * side * (halfW + 0.24);
      const pz = f.z + f.nz * side * (halfW + 0.24);

      dummy.position.set(px, f.y + 0.16, pz);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      boxes.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, f.y + 0.4, pz);
      dummy.updateMatrix();
      soils.setMatrixAt(idx, dummy.matrix);

      for (const offset of [-1.1, -0.36, 0.38, 1.1]) {
        dummy.position.set(
          px + f.tx * offset,
          f.y + 0.56 + ((shrubIdx % 3) * 0.04),
          pz + f.tz * offset,
        );
        dummy.rotation.set(0, yaw + shrubIdx * 0.6, 0);
        dummy.scale.set(1.05, 0.72, 1.15);
        dummy.updateMatrix();
        shrubs.setMatrixAt(shrubIdx++, dummy.matrix);
      }
    });

    for (const inst of [boxes, soils, shrubs]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      group.add(inst);
    }
  }

  // 6. Concrete south-bank retaining quay wall along mapped bank promenade (1167513730) & lateral bridge landings
  const bankRoad = roads.find((r) => r.id === BANK_PROMENADE_ID);
  if (bankRoad && bankRoad.points.length >= 2) {
    // Combine bank promenade points with ordered western lateral landings toward 1167513742
    const quayPts = [...bankRoad.points];
    for (const id of [1493443035, 1473289702]) {
      const lr = roads.find((r) => r.id === id);
      if (!lr) continue;
      const d0 = nearestPoint(lr.points[0], mainPoints).distance;
      const d1 = nearestPoint(lr.points.at(-1), mainPoints).distance;
      const bankEnd = d0 > d1 ? lr.points[0] : lr.points.at(-1);
      if (quayPts.every((q) => Math.hypot(q.x - bankEnd.x, q.z - bankEnd.z) > 3)) {
        quayPts.push(bankEnd);
      }
    }
    const qFrames = buildFrames(
      quayPts.map((p) => ({ x: p.x, z: p.z, y: 0.36 })),
    );
    const quayGeo = buildExtrudedStrip(
      qFrames,
      [
        [-0.35, 0.04],
        [-0.35, -0.95],
        [2.8, -0.95],
        [2.8, 0.04],
      ],
      8,
    );
    const quayMesh = new THREE.Mesh(quayGeo, concreteWallMat);
    quayMesh.receiveShadow = true;
    group.add(quayMesh);
  }

  world.scene.add(group);
  world.boardwalkView = {
    group,
    pierCount: allPierPiles.length,
    slatCount: slatTransforms.length,
    planterCount: planterFrames.length,
    lateralCount: LATERAL_BRIDGE_IDS.length,
    lateralJunctions,
  };
  return world.boardwalkView;
}
