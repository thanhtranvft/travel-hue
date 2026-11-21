import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { nearestPoint } from "../geography/geometry.js";
import { ringsOf } from "../geography/map.js";
import config from "../../../modules/areas/quoc-hoc/data/school-gates.json" with { type: "json" };

function createQuocHocWallTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Deep crimson wall field
    ctx.fillStyle = "#96292f";
    ctx.fillRect(0, 0, 512, 256);
    // White stone base plinth along bottom
    ctx.fillStyle = "#dcd4c4";
    ctx.fillRect(0, 212, 512, 44);
    ctx.fillStyle = "#efe8da";
    ctx.fillRect(0, 206, 512, 8);
    // Top cream cornice band
    ctx.fillStyle = "#efe8da";
    ctx.fillRect(0, 0, 512, 18);
    // White framed recessed relief panels (3 bay rhythm)
    for (const [x, w] of [
      [18, 128],
      [172, 168],
      [366, 128],
    ]) {
      ctx.strokeStyle = "#f2ebdd";
      ctx.lineWidth = 8;
      ctx.strokeRect(x, 34, w, 152);
      ctx.fillStyle = x === 172 ? "#e8e0cf" : "#872328";
      ctx.fillRect(x + 12, 46, w - 24, 128);
      if (x === 172) {
        ctx.strokeStyle = "#c9bfa9";
        ctx.lineWidth = 4;
        ctx.strokeRect(x + 22, 56, w - 44, 108);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// Split by arc length, including a gate exactly at a corner of the closed ring.
export function campusWallSegments(points, gate, gap = 10) {
  const ring = points.slice();
  if (Math.hypot(ring[0].x - ring.at(-1).x, ring[0].z - ring.at(-1).z) > 0.01)
    ring.push(ring[0]);
  const distances = [0];
  for (let i = 1; i < ring.length; i++)
    distances.push(
      distances.at(-1) +
        Math.hypot(ring[i].x - ring[i - 1].x, ring[i].z - ring[i - 1].z),
    );
  const total = distances.at(-1),
    hit = nearestPoint(gate, ring),
    center =
      distances[hit.index - 1] +
      hit.t * (distances[hit.index] - distances[hit.index - 1]),
    segments = [];
  for (let i = 1; i < ring.length; i++) {
    const start = distances[i - 1],
      end = distances[i],
      length = end - start;
    if (length < 0.01) continue;
    const cuts = [start, end];
    for (const wrap of [-total, 0, total])
      for (const boundary of [center - gap / 2 + wrap, center + gap / 2 + wrap])
        if (boundary > start && boundary < end) cuts.push(boundary);
    cuts.sort((a, b) => a - b);
    for (let j = 1; j < cuts.length; j++) {
      const mid = (cuts[j - 1] + cuts[j]) / 2,
        d = Math.abs(mid - center);
      if (Math.min(d, total - d) < gap / 2) continue;
      const at = (value) => {
        const t = (value - start) / length;
        return {
          x: ring[i - 1].x + (ring[i].x - ring[i - 1].x) * t,
          z: ring[i - 1].z + (ring[i].z - ring[i - 1].z) * t,
        };
      };
      segments.push({ a: at(cuts[j - 1]), b: at(cuts[j]) });
    }
  }
  return segments;
}
export const hitsCampusWall = (point, segments, radius = 0.45) =>
  segments.some((s) => nearestPoint(point, [s.a, s.b]).distance < radius);

function createQuocHocWallObject(segments, data) {
  const object = new THREE.Group();
  const wallTex = createQuocHocWallTexture();
  const wallBodies = [];
  const wallCaps = [];
  const pilasters = [];
  const pilasterTrim = [];
  const lotusBases = [];
  const lotusBuds = [];

  const segmentGeo = (a, b, height, width, y, uScale = 0) => {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      len = Math.hypot(dx, dz),
      g = new THREE.BoxGeometry(len, height, width);
    if (uScale > 0 && g.attributes.uv) {
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * (len / uScale));
      }
    }
    g.rotateY(Math.atan2(-dz, dx));
    g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
    return g;
  };

  for (const { a, b } of segments) {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      len = Math.hypot(dx, dz);
    if (len < 0.1) continue;
    wallBodies.push(
      segmentGeo(a, b, data.wallHeight, data.wallThickness, 0.17 + data.wallHeight / 2, 7.2),
    );
    wallCaps.push(
      segmentGeo(a, b, 0.24, data.wallThickness + 0.22, 0.17 + data.wallHeight + 0.12),
    );
    const posts = Math.max(1, Math.floor(len / 8));
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const yaw = Math.atan2(-dz, dx);

      const post = new THREE.BoxGeometry(0.62, data.wallHeight + 0.42, 0.62);
      post.rotateY(yaw);
      post.translate(px, 0.17 + (data.wallHeight + 0.42) / 2, pz);
      pilasters.push(post);

      const collar = new THREE.BoxGeometry(0.76, 0.16, 0.76);
      collar.rotateY(yaw);
      collar.translate(px, 0.17 + data.wallHeight + 0.44, pz);
      pilasterTrim.push(collar);

      const base = new THREE.CylinderGeometry(0.18, 0.24, 0.14, 8);
      base.translate(px, 0.17 + data.wallHeight + 0.59, pz);
      lotusBases.push(base);

      const bud = new THREE.SphereGeometry(0.19, 8, 8);
      bud.scale(1, 1.45, 1);
      bud.translate(px, 0.17 + data.wallHeight + 0.86, pz);
      lotusBuds.push(bud);
    }
  }

  const addBatch = (parts, material) => {
    if (!parts.length) return;
    const mesh = new THREE.Mesh(mergeGeometries(parts), material);
    mesh.castShadow = mesh.receiveShadow = true;
    object.add(mesh);
    parts.forEach((p) => p.dispose());
  };

  addBatch(
    wallBodies,
    new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#96292f",
      map: wallTex,
      roughness: 0.84,
    }),
  );
  addBatch(
    wallCaps,
    new THREE.MeshStandardMaterial({ color: "#b85a26", roughness: 0.56 }),
  );
  addBatch(
    pilasters,
    new THREE.MeshStandardMaterial({ color: "#96292f", roughness: 0.84 }),
  );
  addBatch(
    pilasterTrim,
    new THREE.MeshStandardMaterial({ color: "#eee6d6", roughness: 0.75 }),
  );
  addBatch(
    lotusBases,
    new THREE.MeshStandardMaterial({ color: "#d7cfbe", roughness: 0.74 }),
  );
  addBatch(
    lotusBuds,
    new THREE.MeshStandardMaterial({ color: "#ece6d8", roughness: 0.65 }),
  );
  return object;
}

function createHaiBaTrungWallTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Upper sky-transparent-looking iron picket zone & white baluster railing
    ctx.fillStyle = "#8a272d";
    ctx.fillRect(0, 0, 512, 256);

    // Lower solid crimson brick base (lower 32%)
    ctx.fillStyle = "#91292f";
    ctx.fillRect(0, 174, 512, 82);
    ctx.fillStyle = "#c8bfb1";
    ctx.fillRect(0, 166, 512, 10);

    // Dark recessed background behind white spindle balusters (mid band 56..166)
    ctx.fillStyle = "#3a4536";
    ctx.fillRect(0, 56, 512, 110);

    // Repeating sculpted white concrete vase balusters (con tiện trắng)
    for (let x = 14; x < 512; x += 36) {
      ctx.fillStyle = "#e8e2d6";
      ctx.fillRect(x, 62, 18, 102);
      ctx.fillStyle = "#f4efe4";
      ctx.fillRect(x + 3, 66, 12, 94);
      // Narrow waist & curved vase belly illusion
      ctx.fillStyle = "#3a4536";
      ctx.fillRect(x, 76, 4, 16);
      ctx.fillRect(x + 14, 76, 4, 16);
      ctx.fillStyle = "#f4efe4";
      ctx.fillRect(x - 2, 102, 22, 34);
    }

    // Crimson concrete handrail over balusters + top silver iron pickets
    ctx.fillStyle = "#94272d";
    ctx.fillRect(0, 42, 512, 20);
    ctx.fillStyle = "#5a6852";
    ctx.fillRect(0, 0, 512, 42);
    ctx.fillStyle = "#b5bec2";
    ctx.fillRect(0, 22, 512, 4);
    for (let x = 8; x < 512; x += 24) {
      ctx.fillRect(x, 2, 4, 40);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function createHaiBaTrungWallObject(segments, data) {
  const object = new THREE.Group();
  const wallTex = createHaiBaTrungWallTexture();
  const wallBodies = [];
  const wallCaps = [];
  const piers = [];
  const pierCaps = [];

  const segmentGeo = (a, b, height, width, y, uScale = 0) => {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      len = Math.hypot(dx, dz),
      g = new THREE.BoxGeometry(len, height, width);
    if (uScale > 0 && g.attributes.uv) {
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * (len / uScale));
      }
    }
    g.rotateY(Math.atan2(-dz, dx));
    g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
    return g;
  };

  for (const { a, b } of segments) {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      len = Math.hypot(dx, dz);
    if (len < 0.1) continue;
    wallBodies.push(
      segmentGeo(a, b, data.wallHeight, data.wallThickness, 0.17 + data.wallHeight / 2, 5.8),
    );
    wallCaps.push(
      segmentGeo(a, b, 0.14, data.wallThickness + 0.14, 0.17 + 1.72),
    );
    const posts = Math.max(1, Math.floor(len / 7.2));
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const yaw = Math.atan2(-dz, dx);

      const post = new THREE.BoxGeometry(0.56, data.wallHeight + 0.2, 0.56);
      post.rotateY(yaw);
      post.translate(px, 0.17 + (data.wallHeight + 0.2) / 2, pz);
      piers.push(post);

      const cap = new THREE.BoxGeometry(0.68, 0.16, 0.68);
      cap.rotateY(yaw);
      cap.translate(px, 0.17 + data.wallHeight + 0.22, pz);
      pierCaps.push(cap);
    }
  }

  const addBatch = (parts, material) => {
    if (!parts.length) return;
    const mesh = new THREE.Mesh(mergeGeometries(parts), material);
    mesh.castShadow = mesh.receiveShadow = true;
    object.add(mesh);
    parts.forEach((p) => p.dispose());
  };

  addBatch(
    wallBodies,
    new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#94272d",
      map: wallTex,
      roughness: 0.78,
    }),
  );
  addBatch(
    wallCaps,
    new THREE.MeshStandardMaterial({ color: "#94272d", roughness: 0.82 }),
  );
  addBatch(
    piers,
    new THREE.MeshStandardMaterial({ color: "#94272d", roughness: 0.82 }),
  );
  addBatch(
    pierCaps,
    new THREE.MeshStandardMaterial({ color: "#ece5d8", roughness: 0.74 }),
  );
  return object;
}

export function createCampusWalls(site, gate) {
  const data = config[site.id];
  if (!data) return null;
  const gap = site.id === "quoc-hoc-school" ? 13.6 : site.id === "hai-ba-trung" ? 14.2 : data.width;
  const segments = ringsOf(site.feature).flatMap((ring) =>
    campusWallSegments(ring, gate, gap),
  );
  if (site.id === "quoc-hoc-school") {
    return {
      object: createQuocHocWallObject(segments, data),
      segments: segments.map((s) => ({ ...s, schoolId: site.id })),
    };
  }
  if (site.id === "hai-ba-trung") {
    return {
      object: createHaiBaTrungWallObject(segments, data),
      segments: segments.map((s) => ({ ...s, schoolId: site.id })),
    };
  }
  const walls = [],
    caps = [];
  const geometry = (a, b, height, width, y) => {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      g = new THREE.BoxGeometry(Math.hypot(dx, dz), height, width);
    g.rotateY(Math.atan2(-dz, dx));
    g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
    return g;
  };
  for (const { a, b } of segments) {
    walls.push(
      geometry(
        a,
        b,
        data.wallHeight,
        data.wallThickness,
        0.17 + data.wallHeight / 2,
      ),
    );
    caps.push(
      geometry(a, b, 0.16, data.wallThickness + 0.14, 0.17 + data.wallHeight),
    );
  }
  const object = new THREE.Group();
  for (const [parts, color] of [
    [walls, data.wallColor || data.color],
    [caps, data.trim],
  ])
    if (parts.length) {
      const mesh = new THREE.Mesh(
        mergeGeometries(parts),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
      );
      mesh.castShadow = mesh.receiveShadow = true;
      object.add(mesh);
      parts.forEach((p) => p.dispose());
    }
  return {
    object,
    segments: segments.map((s) => ({ ...s, schoolId: site.id })),
  };
}

