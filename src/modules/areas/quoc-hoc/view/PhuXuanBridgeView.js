import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { boardwalkWayIds } from "../../../../core/shared/geography/map.js";
import { ROAD_Y, roadSurfaceHeight } from "../../../../core/world/roadSurface.js";

const PHU_XUAN_RAMP_SOUTH = 39420686;
const PHU_XUAN_SPAN = 39419121;
const PHU_XUAN_RAMP_NORTH = 39453301;

function createAsphaltTexture(mobile = false) {
  const width = 512;
  const height = 256;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#565b5e";
  ctx.fillRect(0, 0, width, height);

  let seed = 131;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < (mobile ? 4500 : 11000); i++) {
    const shade = Math.floor(68 + rand() * 44);
    ctx.fillStyle = `rgba(${shade},${shade + 2},${shade + 3},0.28)`;
    ctx.fillRect(rand() * width, rand() * height, 2, 2);
  }

  // Subtle tire wear lanes (4-lane deck: two lanes per direction)
  for (const laneCenter of [0.16, 0.34, 0.66, 0.84]) {
    const x = laneCenter * width;
    const grad = ctx.createLinearGradient(x - 28, 0, x + 28, 0);
    grad.addColorStop(0, "rgba(40,43,45,0)");
    grad.addColorStop(0.5, "rgba(40,43,45,0.22)");
    grad.addColorStop(1, "rgba(40,43,45,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(x - 28, 0, 56, height);
  }

  // Outer white edge lines
  ctx.fillStyle = "#e8e6dc";
  ctx.fillRect(10, 0, 5, height);
  ctx.fillRect(width - 15, 0, 5, height);

  // Double yellow/white center divider
  ctx.fillStyle = "#e3c567";
  ctx.fillRect(width / 2 - 5, 0, 3, height);
  ctx.fillRect(width / 2 + 2, 0, 3, height);

  // Dashed lane dividers at quarter widths (each carriageway has 2 lanes)
  ctx.fillStyle = "#eceae0";
  for (const x of [width * 0.25 - 2, width * 0.75 - 2]) {
    for (let y = 12; y < height; y += 84) {
      ctx.fillRect(x, y, 4, 46);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function createConcreteTexture(mobile = false) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#cfcbc0";
  ctx.fillRect(0, 0, size, size);

  let seed = 89;
  const rand = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < (mobile ? 2500 : 6000); i++) {
    const v = Math.floor(178 + rand() * 44);
    ctx.fillStyle = `rgba(${v},${v - 2},${v - 6},0.22)`;
    ctx.fillRect(rand() * size, rand() * size, 2, 2);
  }
  // Subtle concrete panel expansion seams
  ctx.strokeStyle = "rgba(120,116,108,0.22)";
  ctx.lineWidth = 2;
  for (let y = 0; y < size; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 4;
  return texture;
}

function sampleCorridor(south, span, north) {
  const pts = [];
  const appendSegment = (points, heights, includeFirst, isSpan) => {
    for (let i = includeFirst ? 0 : 1; i < points.length; i++) {
      pts.push({
        x: points[i].x,
        z: points[i].z,
        y: heights[i],
        isSpan,
      });
    }
  };
  if (south && span) {
    const southPts = south.points.slice().reverse();
    const southH = south.points
      .map((_, i) => roadSurfaceHeight(south, i))
      .reverse();
    appendSegment(southPts, southH, true, false);
    const spanH = span.points.map((_, i) => roadSurfaceHeight(span, i));
    appendSegment(span.points, spanH, false, true);
    if (north) {
      const northH = north.points.map((_, i) => roadSurfaceHeight(north, i));
      appendSegment(north.points, northH, false, false);
    }
  } else if (span) {
    const spanH = span.points.map((_, i) => roadSurfaceHeight(span, i));
    appendSegment(span.points, spanH, true, true);
    if (north) {
      const northH = north.points.map((_, i) => roadSurfaceHeight(north, i));
      appendSegment(north.points, northH, false, false);
    }
  }

  // Resample long segments (~10m steps) so lighting, curvature, and girder soffit stay crisp
  const dense = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const dist = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = Math.max(1, Math.ceil(dist / 10));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      dense.push({
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        y: a.y + (b.y - a.y) * t,
        isSpan: Math.abs(a.y - 4.8) < 0.05 && Math.abs(b.y - 4.8) < 0.05,
      });
    }
  }
  if (pts.length) dense.push(pts.at(-1));

  // Compute arc length & smoothed horizontal frames
  let arc = 0;
  for (let i = 0; i < dense.length; i++) {
    if (i > 0) {
      arc += Math.hypot(
        dense[i].x - dense[i - 1].x,
        dense[i].z - dense[i - 1].z,
      );
    }
    const prev = dense[Math.max(0, i - 1)];
    const next = dense[Math.min(dense.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    dense[i].s = arc;
    dense[i].tx = dx / len;
    dense[i].tz = dz / len;
    dense[i].nx = -dz / len;
    dense[i].nz = dx / len;
  }
  return dense;
}

function buildStripRibbon(frames, leftOffset, rightOffset, yOffset, uRepeatLength = 12) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const y = f.y + (typeof yOffset === "function" ? yOffset(f) : yOffset);
    positions.push(
      f.x + f.nx * leftOffset,
      y,
      f.z + f.nz * leftOffset,
      f.x + f.nx * rightOffset,
      y,
      f.z + f.nz * rightOffset,
    );
    uvs.push(0, f.s / uRepeatLength, 1, f.s / uRepeatLength);
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

function buildExtrudedProfile(frames, profileFn, uRepeatLength = 8) {
  // profile: array of [lateralOffset, yDelta] around closed loop (CCW looking forward)
  const sampleProfile = profileFn(frames[0]);
  const ringCount = sampleProfile.length;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const prof = profileFn(f);
    for (let k = 0; k < ringCount; k++) {
      const [lat, dy] = prof[k];
      positions.push(f.x + f.nx * lat, f.y + dy, f.z + f.nz * lat);
      uvs.push(k / ringCount, f.s / uRepeatLength);
    }
    if (i > 0) {
      const base0 = (i - 1) * ringCount;
      const base1 = i * ringCount;
      for (let k = 0; k < ringCount; k++) {
        const kn = (k + 1) % ringCount;
        indices.push(
          base0 + k,
          base0 + kn,
          base1 + k,
          base0 + kn,
          base1 + kn,
          base1 + k,
        );
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

function frameAtDistance(frames, s) {
  if (!frames.length) return null;
  if (s <= frames[0].s) return frames[0];
  if (s >= frames.at(-1).s) return frames.at(-1);
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1];
    const b = frames[i];
    if (s <= b.s) {
      const span = b.s - a.s || 1;
      const t = (s - a.s) / span;
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
        isSpan: a.isSpan && b.isSpan,
      };
    }
  }
  return frames.at(-1);
}

export function addPhuXuanBridge(world, roads) {
  const south = roads.find((r) => r.id === PHU_XUAN_RAMP_SOUTH);
  const span = roads.find((r) => r.id === PHU_XUAN_SPAN);
  const north = roads.find((r) => r.id === PHU_XUAN_RAMP_NORTH);
  if (!span) return null;

  const mobile = Boolean(world.quality?.mobile);
  const frames = sampleCorridor(south, span, north);
  if (frames.length < 2) return null;

  const group = new THREE.Group();
  group.name = "phu-xuan-bridge";

  const concreteTex = createConcreteTexture(mobile);
  const asphaltTex = createAsphaltTexture(mobile);

  const concreteMat = new THREE.MeshStandardMaterial({
    color: "#d9d6cc",
    map: concreteTex,
    roughness: 0.86,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const soffitMat = new THREE.MeshStandardMaterial({
    color: "#b8b4aa",
    map: concreteTex,
    roughness: 0.9,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: asphaltTex,
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: "#cdd4da",
    roughness: 0.36,
    metalness: 0.65,
    side: THREE.DoubleSide,
  });
  const pileCapMat = new THREE.MeshStandardMaterial({
    color: "#4d524c",
    roughness: 0.94,
    metalness: 0.04,
  });
  const lampHeadMat = new THREE.MeshStandardMaterial({
    color: "#f2f4f0",
    emissive: "#ffe9bc",
    emissiveIntensity: 0.45,
    roughness: 0.3,
  });

  // 1. 4-lane asphalt carriageway (+0.015m above concrete deck substrate)
  const asphaltGeo = buildStripRibbon(frames, -7.0, 7.0, 0.015, 16);
  const asphaltMesh = new THREE.Mesh(asphaltGeo, asphaltMat);
  asphaltMesh.receiveShadow = true;
  group.add(asphaltMesh);

  // 2. Concrete box-girder superstructure + raised pedestrian sidewalks & curbs
  // Left & right raised sidewalks: outer edge ±10.35m, inner curb ±7.05m, top y+0.16m
  const structureParts = [];
  for (const side of [-1, 1]) {
    // Inner sidewalk curb riser, top walking deck (y+0.16), and outer fascia edge
    structureParts.push(
      buildExtrudedProfile(
        frames,
        () => [
          [side * 7.02, 0.0],
          [side * 7.05, 0.16],
          [side * 10.35, 0.16],
          [side * 10.42, -0.32],
          [side * 7.02, -0.32],
        ],
        8,
      ),
    );
  }
  // Roadway slab underside + cantilevered concrete deck fascia
  const deckSoffitGeo = buildExtrudedProfile(
    frames,
    (f) => {
      const rampRatio = THREE.MathUtils.clamp((f.y - ROAD_Y) / 4.48, 0, 1);
      const girderDepth = -(0.45 + rampRatio * 0.72);
      const halfSpan = f.y > 0.7 ? 1 : 0;
      if (!halfSpan) {
        return [
          [-7.05, -0.02],
          [7.05, -0.02],
          [7.05, -0.25],
          [-7.05, -0.25],
        ];
      }
      return [
        [-10.42, -0.3],
        [10.42, -0.3],
        [6.4, girderDepth + 0.35],
        [5.3, girderDepth],
        [-5.3, girderDepth],
        [-6.4, girderDepth + 0.35],
      ];
    },
    10,
  );
  const soffitMesh = new THREE.Mesh(deckSoffitGeo, soffitMat);
  soffitMesh.castShadow = true;
  soffitMesh.receiveShadow = true;
  group.add(soffitMesh);

  const approxLen = frames.at(-1).s;
  for (const segFrames of [
    frames.filter((f) => f.y >= 0.45 && f.y < 4.78 && f.s < approxLen * 0.4),
    frames.filter((f) => f.y >= 0.45 && f.y < 4.78 && f.s > approxLen * 0.6),
  ]) {
    if (segFrames.length < 2) continue;
    structureParts.push(
      buildExtrudedProfile(
        segFrames,
        (f) => [
          [-8.6, -0.02],
          [-8.6, -f.y + 0.08],
          [8.6, -f.y + 0.08],
          [8.6, -0.02],
        ],
        8,
      ),
    );
  }

  const structureGeo = mergeGeometries(structureParts);
  structureParts.forEach((g) => g.dispose());
  const structureMesh = new THREE.Mesh(structureGeo, concreteMat);
  structureMesh.castShadow = true;
  structureMesh.receiveShadow = true;
  group.add(structureMesh);

  // 3. Galvanized steel outer guardrails along both sidewalks (±10.12m)
  const railGeoParts = [];
  const railHeights = [0.42, 0.74, 1.06];
  for (const side of [-1, 1]) {
    const lat = side * 10.12;
    for (const h of railHeights) {
      railGeoParts.push(
        buildExtrudedProfile(
          frames,
          () => [
            [lat - 0.035, 0.16 + h - 0.03],
            [lat + 0.035, 0.16 + h - 0.03],
            [lat + 0.035, 0.16 + h + 0.03],
            [lat - 0.035, 0.16 + h + 0.03],
          ],
          6,
        ),
      );
    }
  }
  const railsMesh = new THREE.Mesh(mergeGeometries(railGeoParts), steelMat);
  railGeoParts.forEach((g) => g.dispose());
  group.add(railsMesh);

  const totalLen = frames.at(-1).s;
  const postFrames = [];
  for (let s = 2; s <= totalLen - 2; s += 2.6) {
    postFrames.push(frameAtDistance(frames, s));
  }
  const postBaseGeo = new THREE.BoxGeometry(0.08, 1.08, 0.08);
  const railPosts = new THREE.InstancedMesh(
    postBaseGeo,
    steelMat,
    postFrames.length * 2,
  );
  const dummy = new THREE.Object3D();
  let postIdx = 0;
  for (const f of postFrames) {
    const yaw = Math.atan2(f.tx, f.tz);
    for (const side of [-1, 1]) {
      dummy.position.set(
        f.x + f.nx * side * 10.12,
        f.y + 0.16 + 0.54,
        f.z + f.nz * side * 10.12,
      );
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      railPosts.setMatrixAt(postIdx++, dummy.matrix);
    }
  }
  railPosts.instanceMatrix.needsUpdate = true;
  railPosts.computeBoundingSphere();
  group.add(railPosts);

  // 4. River twin-column concrete piers with hammerhead caps & wet pile caps
  // Verify every pier clears Cầu Gỗ Lim boardwalk & lateral cross-bridges (>= 12m)
  const boardwalkSegments = [];
  const boardwalkCheckIds = new Set([
    ...boardwalkWayIds,
    1473289702,
    1493443035,
    1493443034,
    1493443036,
  ]);
  for (const r of roads.filter((road) => boardwalkCheckIds.has(road.id))) {
    for (let i = 1; i < r.points.length; i++) {
      boardwalkSegments.push([r.points[i - 1], r.points[i]]);
    }
  }
  const clearsBoardwalk = (x, z) =>
    boardwalkSegments.every(
      (seg) => nearestPoint({ x, z }, seg).distance >= 11,
    );

  const spanFrames = frames.filter((f) => f.isSpan);
  const spanStartS = spanFrames[0]?.s ?? 40;
  const spanEndS = spanFrames.at(-1)?.s ?? totalLen - 40;
  const pierCenters = [];
  // Candidate river pier spacing ~56m across span, skipping boardwalk clearance zone
  for (let s = spanStartS + 62; s <= spanEndS - 18; s += 56) {
    const f = frameAtDistance(frames, s);
    if (
      f &&
      clearsBoardwalk(f.x, f.z) &&
      clearsBoardwalk(f.x + f.nx * 5, f.z + f.nz * 5) &&
      clearsBoardwalk(f.x - f.nx * 5, f.z - f.nz * 5)
    ) {
      pierCenters.push(f);
    }
  }
  // North bank transition pier near span end
  const northPier = frameAtDistance(frames, spanEndS - 4);
  if (northPier && clearsBoardwalk(northPier.x, northPier.z)) {
    pierCenters.push(northPier);
  }

  if (pierCenters.length) {
    const pileCapGeo = new THREE.BoxGeometry(13.6, 1.1, 3.2);
    const colGeo = new THREE.CylinderGeometry(0.72, 0.78, 3.4, 14);
    const capBeamGeo = new THREE.BoxGeometry(15.8, 1.0, 1.65);

    const pileCaps = new THREE.InstancedMesh(
      pileCapGeo,
      pileCapMat,
      pierCenters.length,
    );
    const columns = new THREE.InstancedMesh(
      colGeo,
      soffitMat,
      pierCenters.length * 2,
    );
    const capBeams = new THREE.InstancedMesh(
      capBeamGeo,
      concreteMat,
      pierCenters.length,
    );

    let colIdx = 0;
    pierCenters.forEach((f, idx) => {
      const yaw = Math.atan2(f.tx, f.tz);
      // Pile cap footing sitting in river water (-0.5m..+0.6m)
      dummy.position.set(f.x, 0.05, f.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      pileCaps.setMatrixAt(idx, dummy.matrix);

      // Twin concrete columns (y = 0.5m..3.3m)
      for (const side of [-1, 1]) {
        dummy.position.set(
          f.x + f.nx * side * 4.6,
          1.95,
          f.z + f.nz * side * 4.6,
        );
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        columns.setMatrixAt(colIdx++, dummy.matrix);
      }

      // Hammerhead cap beam directly supporting box-girder soffit
      dummy.position.set(f.x, f.y - 1.55, f.z);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      capBeams.setMatrixAt(idx, dummy.matrix);
    });

    for (const inst of [pileCaps, columns, capBeams]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      inst.castShadow = true;
      inst.receiveShadow = true;
      group.add(inst);
    }
  }

  // 5. Curved silver street light poles along both bridge sidewalks
  const lightFrames = [];
  for (let s = 18; s <= totalLen - 18; s += 34) {
    lightFrames.push(frameAtDistance(frames, s));
  }
  if (lightFrames.length) {
    const mastGeo = new THREE.CylinderGeometry(0.075, 0.125, 6.8, 10);
    const armGeo = new THREE.CylinderGeometry(0.05, 0.07, 2.2, 8);
    const luminaireGeo = new THREE.BoxGeometry(0.85, 0.14, 0.34);

    const masts = new THREE.InstancedMesh(
      mastGeo,
      steelMat,
      lightFrames.length * 2,
    );
    const arms = new THREE.InstancedMesh(
      armGeo,
      steelMat,
      lightFrames.length * 2,
    );
    const luminaires = new THREE.InstancedMesh(
      luminaireGeo,
      lampHeadMat,
      lightFrames.length * 2,
    );

    let lightIdx = 0;
    for (const f of lightFrames) {
      const yaw = Math.atan2(f.tx, f.tz);
      for (const side of [-1, 1]) {
        const px = f.x + f.nx * side * 10.12;
        const pz = f.z + f.nz * side * 10.12;
        const baseY = f.y + 0.16;

        // Vertical pole shaft
        dummy.position.set(px, baseY + 3.4, pz);
        dummy.rotation.set(0, yaw, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        masts.setMatrixAt(lightIdx, dummy.matrix);

        // Angled overhang arm curving inward toward roadway
        const armMidX = px - f.nx * side * 0.95;
        const armMidZ = pz - f.nz * side * 0.95;
        dummy.position.set(armMidX, baseY + 7.12, armMidZ);
        dummy.rotation.set(0, Math.atan2(-f.nx * side, -f.nz * side), 0);
        dummy.rotateX(Math.PI / 2 - 0.34);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        arms.setMatrixAt(lightIdx, dummy.matrix);

        // Luminaire head over outer lane
        const headX = px - f.nx * side * 1.95;
        const headZ = pz - f.nz * side * 1.95;
        dummy.position.set(headX, baseY + 7.45, headZ);
        dummy.rotation.set(0, Math.atan2(-f.nx * side, -f.nz * side) + Math.PI / 2, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        luminaires.setMatrixAt(lightIdx, dummy.matrix);

        lightIdx++;
      }
    }

    for (const inst of [masts, arms, luminaires]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      group.add(inst);
    }
  }

  world.scene.add(group);
  world.cameraObstacles?.push(structureMesh, soffitMesh);
  world.phuXuanBridge = {
    group,
    pierCount: pierCenters.length,
    lightCount: lightFrames.length * 2,
    frameCount: frames.length,
  };
  return world.phuXuanBridge;
}
