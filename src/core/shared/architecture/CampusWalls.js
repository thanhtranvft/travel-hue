import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { nearestPoint } from "../geography/geometry.js";
import { getRingsOf } from "../geography/activeGeography.js";
import config from "../../../modules/areas/quoc-hoc/data/school-gates.json" with { type: "json" };
import dongDaCampuses from "../../../modules/areas/nguyen-chi-dieu/data/campuses.json" with { type: "json" };
import quangTrungCampuses from "../../../modules/areas/quang-trung/data/campuses.json" with { type: "json" };

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

// Split by arc length, including gates at corners or side edges of the closed ring.
export function campusWallSegments(points, gate, gap = 10, extraGates = []) {
  const ring = points.slice();
  if (Math.hypot(ring[0].x - ring.at(-1).x, ring[0].z - ring.at(-1).z) > 0.01)
    ring.push(ring[0]);
  const distances = [0];
  for (let i = 1; i < ring.length; i++)
    distances.push(
      distances.at(-1) +
        Math.hypot(ring[i].x - ring[i - 1].x, ring[i].z - ring[i - 1].z),
    );
  const total = distances.at(-1);
  const openings = [
    { point: gate, gap },
    ...(extraGates || []).map((g) => ({ point: g, gap: g.gap ?? gap })),
  ]
    .filter((o) => o.point && Number.isFinite(o.point.x) && Number.isFinite(o.point.z))
    .map((o) => {
      const hit = nearestPoint(o.point, ring);
      return {
        center:
          distances[hit.index - 1] +
          hit.t * (distances[hit.index] - distances[hit.index - 1]),
        halfGap: (o.gap ?? gap) / 2,
      };
    });

  const segments = [];
  for (let i = 1; i < ring.length; i++) {
    const start = distances[i - 1],
      end = distances[i],
      length = end - start;
    if (length < 0.01) continue;
    const cuts = [start, end];
    for (const o of openings) {
      for (const wrap of [-total, 0, total]) {
        for (const boundary of [o.center - o.halfGap + wrap, o.center + o.halfGap + wrap]) {
          if (boundary > start && boundary < end) cuts.push(boundary);
        }
      }
    }
    cuts.sort((a, b) => a - b);
    for (let j = 1; j < cuts.length; j++) {
      if (cuts[j] - cuts[j - 1] < 0.01) continue;
      const mid = (cuts[j - 1] + cuts[j]) / 2;
      if (
        openings.some((o) => {
          const d = Math.abs(mid - o.center);
          return Math.min(d, total - d) < o.halfGap;
        })
      ) {
        continue;
      }
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

function createSplitStoneWallTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#6e6961";
    ctx.fillRect(0, 0, 512, 128);
    const tones = ["#8b857b", "#5c5750", "#9c958a", "#787268", "#655f57"];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 10; col++) {
        const x = col * 52 + (row % 2 ? 24 : 0) - 10;
        const y = row * 32;
        ctx.fillStyle = tones[(row * 7 + col * 3) % tones.length];
        ctx.fillRect(x + 2, y + 2, 48, 28);
      }
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function createWhitePicketFenceTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    // Open sky/garden backdrop behind vertical white steel pickets
    ctx.fillStyle = "#41563b";
    ctx.fillRect(0, 0, 512, 256);

    // Lower gray-brown split stone base (bottom 30%)
    ctx.fillStyle = "#777269";
    ctx.fillRect(0, 178, 512, 78);
    const stoneTones = ["#8f897e", "#635e56", "#9f998e", "#746e64"];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 10; c++) {
        ctx.fillStyle = stoneTones[(r * 5 + c * 3) % stoneTones.length];
        ctx.fillRect(c * 52 + (r % 2 ? 18 : 0) - 6, 182 + r * 24, 46, 20);
      }
    }
    ctx.fillStyle = "#ece6d8";
    ctx.fillRect(0, 172, 512, 8);

    // Horizontal white fence rails & crisp vertical white pickets (matching photo)
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(0, 26, 512, 11);
    ctx.fillRect(0, 150, 512, 11);
    for (let x = 10; x < 512; x += 28) {
      ctx.fillStyle = "#f7f8fa";
      ctx.fillRect(x, 6, 12, 166);
      ctx.fillStyle = "#d9dee3";
      ctx.fillRect(x + 10, 6, 3, 166);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function createHlcSignTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#1769b8";
    ctx.fillRect(0, 0, 1024, 512);
    ctx.strokeStyle = "#e8f2fc";
    ctx.lineWidth = 14;
    ctx.strokeRect(14, 14, 996, 484);

    // Emblem circle on top-left
    ctx.fillStyle = "#ffffff";
    ctx.beginPath?.();
    ctx.arc?.(118, 126, 54, 0, Math.PI * 2);
    ctx.fill?.();
    ctx.fillStyle = "#1769b8";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px Arial, sans-serif";
    ctx.fillText("HLC", 118, 128);

    // "TRUNG TÂM NGOẠI NGỮ" + big bold "HLC"
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("TRUNG TÂM NGOẠI NGỮ", 200, 108);
    ctx.fillStyle = "#ffe568";
    ctx.font = "bold 36px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("TIẾNG ANH · TIN HỌC", 200, 162);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 124px Arial, sans-serif";
    ctx.fillText("HLC", 965, 142);

    ctx.fillStyle = "#e2effc";
    ctx.fillRect(46, 226, 932, 8);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 34px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("BOI DUONG KIENTHUC & NGOAI NGU THCS", 512, 304);
    ctx.fillStyle = "#ffe77a";
    ctx.font = "bold 36px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("11 ĐỐNG ĐA · THÀNH PHỐ HUẾ", 512, 390);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function createNguyenChiDieuWallObject(segments, data, gate) {
  const object = new THREE.Group();
  object.name = "nguyen-chi-dieu-perimeter-fence";
  const fenceTex = createWhitePicketFenceTexture();
  const stoneTex = createSplitStoneWallTexture();

  const fenceBodies = [];
  const basePlinths = [];
  const piers = [];
  const pierCaps = [];

  const segmentGeo = (a, b, height, width, y, uScale = 0) => {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(len, height, width);
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
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) continue;

    // Split-stone low masonry base + crisp white vertical picket fence panel above
    basePlinths.push(segmentGeo(a, b, 0.56, 0.38, 0.28, 3.6));
    fenceBodies.push(
      segmentGeo(a, b, data.wallHeight, data.wallThickness, 0.17 + data.wallHeight / 2, 4.6),
    );

    const posts = Math.max(1, Math.floor(len / 4.8));
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const yaw = Math.atan2(-dz, dx);

      const post = new THREE.BoxGeometry(0.46, data.wallHeight + 0.18, 0.46);
      post.rotateY(yaw);
      post.translate(px, 0.17 + (data.wallHeight + 0.18) / 2, pz);
      piers.push(post);

      const cap = new THREE.BoxGeometry(0.58, 0.15, 0.58);
      cap.rotateY(yaw);
      cap.translate(px, 0.17 + data.wallHeight + 0.18, pz);
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
    fenceBodies,
    new THREE.MeshStandardMaterial({
      color: fenceTex ? "#ffffff" : "#f4f5f6",
      map: fenceTex,
      roughness: 0.72,
    }),
  );
  addBatch(
    basePlinths,
    new THREE.MeshStandardMaterial({
      color: stoneTex ? "#ffffff" : "#787268",
      map: stoneTex,
      roughness: 0.9,
    }),
  );
  addBatch(
    piers,
    new THREE.MeshStandardMaterial({ color: "#f5f1e7", roughness: 0.76 }),
  );
  addBatch(
    pierCaps,
    new THREE.MeshStandardMaterial({ color: "#f3e38a", roughness: 0.65 }),
  );

  // Iconic blue rectangular "HLC" signboard rising behind the front fence bay to the right (+uAxis) of gate (matching reference photo!)
  if (gate && dongDaCampuses?.uAxis) {
    const hlcOffset = 14.2;
    const hlc = new THREE.Group();
    hlc.name = "hlc-signboard";
    hlc.position.set(
      gate.x + dongDaCampuses.uAxis.x * hlcOffset - dongDaCampuses.swAxis.x * 0.45,
      0.17,
      gate.z + dongDaCampuses.uAxis.z * hlcOffset - dongDaCampuses.swAxis.z * 0.45,
    );
    hlc.rotation.y = dongDaCampuses.gateHeading;

    const steelMat = new THREE.MeshStandardMaterial({
      color: "#d4dce2",
      roughness: 0.35,
      metalness: 0.65,
    });
    for (const sx of [-1.75, 1.75]) {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 4.35, 8),
        steelMat,
      );
      post.position.set(sx, 2.18, 0);
      hlc.add(post);
    }
    const boardBacking = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 2.55, 0.14),
      new THREE.MeshStandardMaterial({ color: "#155ba2", roughness: 0.55 }),
    );
    boardBacking.position.set(0, 3.6, 0);
    boardBacking.castShadow = true;
    hlc.add(boardBacking);

    const hlcTex = createHlcSignTexture();
    const frontFace = new THREE.Mesh(
      new THREE.PlaneGeometry(5.05, 2.42),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: hlcTex,
        roughness: 0.45,
      }),
    );
    frontFace.position.set(0, 3.6, 0.08);
    const backFace = frontFace.clone();
    backFace.position.set(0, 3.6, -0.08);
    backFace.rotation.y = Math.PI;
    hlc.add(frontFace, backFace);
    object.add(hlc);
  }

  return object;
}

function createCaoThangWallTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#3e4b3d";
    ctx.fillRect(0, 0, 512, 256);
    // Masonry wall base (lower 42%)
    ctx.fillStyle = "#e8e2d5";
    ctx.fillRect(0, 148, 512, 108);
    ctx.fillStyle = "#7c322d";
    ctx.fillRect(0, 142, 512, 10);
    ctx.fillRect(0, 224, 512, 32);
    // Dark iron picket fence top band
    ctx.fillStyle = "#26313b";
    ctx.fillRect(0, 16, 512, 10);
    ctx.fillRect(0, 128, 512, 10);
    for (let x = 12; x < 512; x += 26) {
      ctx.fillRect(x, 6, 8, 136);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function createCaoThangWallObject(segments, data) {
  const object = new THREE.Group();
  object.name = "cao-thang-perimeter-fence";
  const wallTex = createCaoThangWallTexture();
  const wallBodies = [];
  const piers = [];
  const pierCaps = [];

  const segmentGeo = (a, b, height, width, y, uScale = 0) => {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(len, height, width);
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
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) continue;
    wallBodies.push(
      segmentGeo(a, b, data.wallHeight, data.wallThickness, 0.17 + data.wallHeight / 2, 5.2),
    );
    const posts = Math.max(1, Math.floor(len / 6.2));
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const yaw = Math.atan2(-dz, dx);

      const post = new THREE.BoxGeometry(0.5, data.wallHeight + 0.22, 0.5);
      post.rotateY(yaw);
      post.translate(px, 0.17 + (data.wallHeight + 0.22) / 2, pz);
      piers.push(post);

      const cap = new THREE.BoxGeometry(0.62, 0.16, 0.62);
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
      color: wallTex ? "#ffffff" : "#e8e2d5",
      map: wallTex,
      roughness: 0.78,
    }),
  );
  addBatch(
    piers,
    new THREE.MeshStandardMaterial({ color: "#efeae0", roughness: 0.8 }),
  );
  addBatch(
    pierCaps,
    new THREE.MeshStandardMaterial({ color: "#7d3330", roughness: 0.7 }),
  );
  return object;
}

function createQuangTrungWallTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#3f533a";
    ctx.fillRect(0, 0, 512, 256);
    // Crisp white concrete wall base (lower 38%)
    ctx.fillStyle = "#eef2f6";
    ctx.fillRect(0, 158, 512, 98);
    ctx.fillStyle = "#1a73c8";
    ctx.fillRect(0, 150, 512, 10);
    ctx.fillStyle = "#8a9199";
    ctx.fillRect(0, 226, 512, 30);
    // Cobalt-blue vertical steel picket fence band
    ctx.fillStyle = "#1a73c8";
    ctx.fillRect(0, 18, 512, 10);
    ctx.fillRect(0, 134, 512, 10);
    for (let x = 12; x < 512; x += 26) {
      ctx.fillStyle = "#2b86db";
      ctx.fillRect(x, 6, 8, 144);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

function createQuangTrungWallObject(segments, data) {
  const object = new THREE.Group();
  object.name = "quang-trung-perimeter-fence";
  const wallTex = createQuangTrungWallTexture();
  const wallBodies = [];
  const piers = [];
  const pierCaps = [];

  const segmentGeo = (a, b, height, width, y, uScale = 0) => {
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(len, height, width);
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
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < 0.1) continue;
    wallBodies.push(
      segmentGeo(a, b, data.wallHeight, data.wallThickness, 0.17 + data.wallHeight / 2, 5.2),
    );
    const posts = Math.max(1, Math.floor(len / 5.8));
    for (let i = 0; i <= posts; i++) {
      const t = i / posts;
      const px = a.x + dx * t;
      const pz = a.z + dz * t;
      const yaw = Math.atan2(-dz, dx);

      const post = new THREE.BoxGeometry(0.48, data.wallHeight + 0.2, 0.48);
      post.rotateY(yaw);
      post.translate(px, 0.17 + (data.wallHeight + 0.2) / 2, pz);
      piers.push(post);

      const cap = new THREE.BoxGeometry(0.6, 0.15, 0.6);
      cap.rotateY(yaw);
      cap.translate(px, 0.17 + data.wallHeight + 0.2, pz);
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
      color: wallTex ? "#ffffff" : "#eef2f6",
      map: wallTex,
      roughness: 0.76,
    }),
  );
  addBatch(
    piers,
    new THREE.MeshStandardMaterial({ color: "#f3f6fa", roughness: 0.78 }),
  );
  addBatch(
    pierCaps,
    new THREE.MeshStandardMaterial({ color: "#1a73c8", roughness: 0.65 }),
  );
  return object;
}

export function createCampusWalls(site, gate, extraGates = []) {
  const data = config[site.id];
  if (!data) return null;
  const gap =
    site.id === "quoc-hoc-school"
      ? 13.6
      : site.id === "hai-ba-trung"
        ? 14.2
        : site.id === "nguyen-chi-dieu"
          ? 13.8
          : site.id === "cao-thang"
            ? 13.0
            : site.id === "quang-trung"
              ? 13.6
              : data.width;
  const precomputedRing =
    dongDaCampuses[site.id]?.ring || quangTrungCampuses[site.id]?.ring;
  const rings = precomputedRing ? [precomputedRing] : getRingsOf(site.feature);
  const segments = rings.flatMap((ring) =>
    campusWallSegments(ring, gate, gap, extraGates),
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
  if (site.id === "nguyen-chi-dieu") {
    return {
      object: createNguyenChiDieuWallObject(segments, data, gate),
      segments: segments.map((s) => ({ ...s, schoolId: site.id })),
    };
  }
  if (site.id === "cao-thang") {
    return {
      object: createCaoThangWallObject(segments, data),
      segments: segments.map((s) => ({ ...s, schoolId: site.id })),
    };
  }
  if (site.id === "quang-trung") {
    return {
      object: createQuangTrungWallObject(segments, data),
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

