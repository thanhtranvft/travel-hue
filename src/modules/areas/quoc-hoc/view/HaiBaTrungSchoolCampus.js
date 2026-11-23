import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  getCentroid,
  getFeatures,
  getPointsOf,
  getRingsOf,
} from "../../../../core/shared/geography/activeGeography.js";
import {
  inside,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnMaterial } from "../../../../core/world/turfTextures.js";
import { CampusStudents } from "../../../../core/world/CampusStudents.js";

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

function createColonialWallTexture() {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    // Deep Hai Bà Trưng crimson stucco
    ctx.fillStyle = "#992a32";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 420; i++) {
      const x = (i * 193) % w;
      const y = (i * 317) % h;
      ctx.fillStyle =
        i % 2 ? "rgba(255,220,215,0.04)" : "rgba(45,8,12,0.06)";
      ctx.fillRect(x, y, 8, 5);
    }

    // Rusticated split-stone foundation plinth along bottom
    ctx.fillStyle = "#6c6357";
    ctx.fillRect(0, h - 72, w, 72);
    const stoneColors = ["#7c7265", "#5f574d", "#8c8172", "#675e53"];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 10; col++) {
        const sx = col * 52 + (row % 2 ? 22 : 0) - 10;
        const sy = h - 68 + row * 22;
        ctx.fillStyle = stoneColors[(row * 5 + col * 3) % stoneColors.length];
        ctx.fillRect(sx + 2, sy + 2, 46, 18);
      }
    }
    ctx.fillStyle = "#efe7d8";
    ctx.fillRect(0, h - 76, w, 8);
    ctx.fillRect(0, h / 2 - 22, w, 10);
    ctx.fillRect(0, 0, w, 14);

    // Two stories of French-colonial tall shuttered windows
    for (const floorY of [48, 256]) {
      for (const wx of [44, 212, 380]) {
        ctx.fillStyle = "rgba(244,237,225,0.88)";
        for (let q = 0; q < 5; q++) {
          ctx.fillRect(wx - 28, floorY + 8 + q * 30, 14, 5);
        }
        ctx.fillStyle = "#f2ebe0";
        ctx.fillRect(wx - 8, floorY - 12, 104, 14);
        ctx.fillRect(wx - 6, floorY + 138, 100, 10);
        ctx.fillStyle = "#ece4d6";
        ctx.fillRect(wx - 4, floorY, 96, 138);
        ctx.fillStyle = "#3c2217";
        ctx.fillRect(wx + 4, floorY + 8, 80, 126);
        ctx.fillStyle = "#5c3624";
        ctx.fillRect(wx + 42, floorY + 8, 4, 126);
        ctx.fillStyle = "#2b160e";
        for (let sy = floorY + 14; sy < floorY + 130; sy += 9) {
          ctx.fillRect(wx + 7, sy, 32, 3);
          ctx.fillRect(wx + 49, sy, 32, 3);
        }
      }
    }
  });
}

function createSingleStoryWallTexture() {
  return createCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#992a32";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#6c6357";
    ctx.fillRect(0, h - 46, w, 46);
    ctx.fillStyle = "#efe7d8";
    ctx.fillRect(0, h - 50, w, 6);
    ctx.fillRect(0, 0, w, 10);
    for (const wx of [48, 212, 376]) {
      ctx.fillStyle = "#f2ebe0";
      ctx.fillRect(wx - 8, 42, 104, 12);
      ctx.fillRect(wx - 4, 54, 96, 132);
      ctx.fillStyle = "#3c2217";
      ctx.fillRect(wx + 4, 62, 80, 118);
    }
  });
}

function createTerracottaTileRoofTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#b3472e";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#c45438";
        ctx.fillRect(x + 2, 0, 11, h);
        ctx.fillStyle = "#8c321f";
        ctx.fillRect(x + 17, 0, 5, h);
      }
      for (let y = 0; y < h; y += 22) {
        ctx.fillStyle = "rgba(65,18,10,0.28)";
        ctx.fillRect(0, y, w, 3);
      }
    },
    4,
    2,
  );
}

function createCourtyardPavingTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#979690";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1200; i++) {
        const x = (i * 197) % w;
        const y = (i * 331) % h;
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(70,68,64,0.12)" : "rgba(235,232,224,0.1)";
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.strokeStyle = "rgba(115,112,106,0.2)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += 128) {
        ctx.beginPath?.();
        ctx.moveTo?.(p, 0);
        ctx.lineTo?.(p, h);
        ctx.moveTo?.(0, p);
        ctx.lineTo?.(w, p);
        ctx.stroke?.();
      }
    },
    14,
    14,
  );
}

function createTerracottaPlazaTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#b9644b";
      ctx.fillRect(0, 0, w, h);
      const s = 32;
      for (let r = 0; r < h / s; r++) {
        for (let c = 0; c < w / s; c++) {
          const d = ((r * 7 + c * 11) % 5) * 4 - 8;
          ctx.fillStyle = `rgb(${186 + d}, ${100 + Math.round(d * 0.6)}, ${75 + Math.round(d * 0.4)})`;
          ctx.fillRect(c * s + 1, r * s + 1, s - 2, s - 2);
        }
      }
    },
    4,
    4,
  );
}

function createMottoPlaqueTexture(text) {
  return createCanvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#efe8da";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#94272d";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#7a1d22";
    ctx.font = "bold 54px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(text, w / 2, h / 2 + 2);
  });
}

function createBulletinBoardTexture() {
  return createCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#f2ecdf";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#94272d";
    ctx.fillRect(0, 0, w, 46);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f7df9d";
    ctx.font = "bold 24px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("BẢNG TIN ĐOÀN TRƯỜNG HAI BÀ TRƯNG", w / 2, 24);
    ctx.fillStyle = "#d9d0be";
    for (const [x, y, bw, bh] of [
      [26, 68, 140, 156],
      [186, 68, 140, 156],
      [346, 68, 140, 156],
    ]) {
      ctx.fillRect(x, y, bw, bh);
      ctx.fillStyle = "#94272d";
      ctx.fillRect(x + 12, y + 14, bw - 24, 14);
      ctx.fillStyle = "#5a554c";
      ctx.fillRect(x + 12, y + 40, bw - 24, 8);
      ctx.fillRect(x + 12, y + 58, bw - 34, 8);
      ctx.fillRect(x + 12, y + 76, bw - 28, 8);
      ctx.fillStyle = "#d9d0be";
    }
  });
}

function createVietnamFlagTexture() {
  return createCanvasTexture(512, 340, (ctx, w, h) => {
    ctx.fillStyle = "#da251d";
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const outerR = h * 0.31;
    const innerR = outerR * 0.382;
    ctx.fillStyle = "#ffde00";
    ctx.beginPath?.();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo?.(x, y);
      else ctx.lineTo?.(x, y);
    }
    ctx.closePath?.();
    ctx.fill?.();
  });
}

function polygonGeometry(points, height = 0) {
  const shape = new THREE.Shape(
    points.map((p) => new THREE.Vector2(p.x, -p.z)),
  );
  const g = height
    ? new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    : new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  return g;
}

function orientedBounds(points) {
  let maxLen = 0;
  let angle = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dz = points[i].z - points[i - 1].z;
    const len = Math.hypot(dx, dz);
    if (len > maxLen) {
      maxLen = len;
      angle = Math.atan2(-dz, dx);
    }
  }
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  let minU = Infinity,
    maxU = -Infinity,
    minV = Infinity,
    maxV = -Infinity;
  for (const p of points) {
    const u = p.x * cos - p.z * sin;
    const v = p.x * sin + p.z * cos;
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  const cu = (minU + maxU) / 2;
  const cv = (minV + maxV) / 2;
  return {
    cx: cu * cos + cv * sin,
    cz: -cu * sin + cv * cos,
    length: maxU - minU,
    depth: maxV - minV,
    yaw: angle,
  };
}

function createHipRoofMesh(length, depth, ridgeHeight, material) {
  const hl = length / 2;
  const hd = depth / 2;
  const inset = Math.min(hl * 0.68, hd * 0.92);
  const rx = Math.max(0.4, hl - inset);
  const positions = [
    -hl, 0, hd, hl, 0, hd, rx, ridgeHeight, 0,
    -hl, 0, hd, rx, ridgeHeight, 0, -rx, ridgeHeight, 0,
    hl, 0, -hd, -hl, 0, -hd, -rx, ridgeHeight, 0,
    hl, 0, -hd, -rx, ridgeHeight, 0, rx, ridgeHeight, 0,
    -hl, 0, -hd, -hl, 0, hd, -rx, ridgeHeight, 0,
    hl, 0, hd, hl, 0, -hd, rx, ridgeHeight, 0,
  ];
  const uvs = [];
  for (let i = 0; i < positions.length; i += 3) {
    uvs.push(positions[i] / 6, positions[i + 2] / 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function createGableRoofMesh(length, depth, ridgeHeight, material, trimMat) {
  const g = new THREE.Group();
  const hl = length / 2;
  const hd = depth / 2;
  const positions = [
    -hl, 0, hd, hl, 0, hd, hl, ridgeHeight, 0,
    -hl, 0, hd, hl, ridgeHeight, 0, -hl, ridgeHeight, 0,
    hl, 0, -hd, -hl, 0, -hd, -hl, ridgeHeight, 0,
    hl, 0, -hd, -hl, ridgeHeight, 0, hl, ridgeHeight, 0,
  ];
  const uvs = [];
  for (let i = 0; i < positions.length; i += 3) {
    uvs.push(positions[i] / 6, positions[i + 2] / 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  const roof = new THREE.Mesh(geo, material);
  roof.castShadow = roof.receiveShadow = true;
  g.add(roof);

  const gableShape = new THREE.Shape();
  gableShape.moveTo(-hd, 0);
  gableShape.lineTo(hd, 0);
  gableShape.lineTo(0, ridgeHeight);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  for (const sx of [-1, 1]) {
    const gable = new THREE.Mesh(gableGeo, mat("#992a32", 0.8));
    gable.position.set(sx * (hl - 0.15), 0, 0);
    gable.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    g.add(gable);
    const barL = Math.hypot(hd, ridgeHeight);
    for (const sz of [-1, 1]) {
      const barge = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.22, barL + 0.3),
        trimMat,
      );
      barge.position.set(sx * (hl - 0.05), ridgeHeight / 2, sz * (hd / 2));
      barge.rotation.x = sz * Math.atan2(ridgeHeight, hd);
      g.add(barge);
    }
  }
  return g;
}

function createCycadPlant(x, y, z, scale = 1) {
  // Cây vạn tuế around Hai Bà Trưng flagpole quadrants (Photo 2)
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.3 * scale, 0.72 * scale, 10),
    mat("#544335", 0.92),
  );
  trunk.position.y = 0.36 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  const frondMat = mat("#366c2b", 0.78);
  for (let ring = 0; ring < 2; ring++) {
    const count = ring === 0 ? 12 : 8;
    const tilt = ring === 0 ? 1.05 : 0.62;
    const fy = (0.72 + ring * 0.15) * scale;
    for (let i = 0; i < count; i++) {
      const a = (i * Math.PI * 2) / count + ring * 0.25;
      const frond = new THREE.Mesh(
        new THREE.ConeGeometry(0.18 * scale, 1.35 * scale, 5),
        frondMat,
      );
      frond.position.set(
        Math.cos(a) * (0.48 - ring * 0.14) * scale,
        fy + 0.18 * scale,
        Math.sin(a) * (0.48 - ring * 0.14) * scale,
      );
      frond.rotation.z = -Math.cos(a) * tilt;
      frond.rotation.x = Math.sin(a) * tilt;
      frond.castShadow = true;
      g.add(frond);
    }
  }
  return g;
}

function createHaiBaTrungFlagpole(x, y, z, flagTex) {
  // Single tall flagpole with flared conical concrete pedestal (Photo 2)
  const group = new THREE.Group();
  group.name = "hai-ba-trung-flagpole";
  group.position.set(x, y, z);

  const stone = mat("#ded8cb", 0.8);
  const step1 = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.24, 2.8), stone);
  step1.position.y = 0.12;
  const step2 = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.26, 2.15), stone);
  step2.position.y = 0.37;
  // Flared conical base + lotus ring collar matching Photo 2
  const coneBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.92, 1.25, 18),
    mat("#e5dfd2", 0.72),
  );
  coneBase.position.y = 1.12;
  coneBase.castShadow = coneBase.receiveShadow = true;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.36, 0.22, 16),
    stone,
  );
  collar.position.y = 1.82;
  group.add(step1, step2, coneBase, collar);

  // Tall brushed-steel flagpole mast (total ~14.2m)
  const poleH = 12.6;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.1, poleH, 12),
    mat("#d9dfe2", 0.22, 0.86),
  );
  pole.position.y = 1.85 + poleH / 2;
  pole.castShadow = true;
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 10, 8),
    mat("#e8bc46", 0.25, 0.82),
  );
  finial.position.y = 1.85 + poleH + 0.08;
  group.add(pole, finial);

  // Waving red Vietnamese flag
  const flagW = 2.95;
  const flagH = 1.95;
  const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 18, 8);
  flagGeo.translate(flagW / 2, 0, 0);
  const basePos = new Float32Array(flagGeo.attributes.position.array);
  const flagMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: flagTex,
    roughness: 0.62,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.position.set(0.06, 1.85 + poleH - 1.0, 0);
  flagMesh.castShadow = true;
  flagMesh.userData.basePos = basePos;
  group.add(flagMesh);

  return { group, flagMesh };
}

function createCampusBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const stone = "#d2cbbe";
  const seat = "#bfb6a6";
  for (const sx of [-0.62, 0.62]) {
    g.add(box([0.14, 0.42, 0.44], stone, [sx, 0.21, 0]));
  }
  g.add(
    box([1.68, 0.09, 0.46], seat, [0, 0.44, 0.02]),
    box([1.68, 0.38, 0.08], seat, [0, 0.68, -0.18]),
  );
  return g;
}

function createBulletinBoard(x, y, z, yaw, tex) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  for (const sx of [-1.25, 1.25]) {
    g.add(box([0.12, 2.25, 0.12], "#424a46", [sx, 1.12, 0]));
  }
  g.add(box([2.85, 1.48, 0.16], "#8c262c", [0, 1.65, 0]));
  g.add(box([3.0, 0.14, 0.36], "#9b3329", [0, 2.44, 0]));
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 1.32),
    new THREE.MeshStandardMaterial({ color: "#ffffff", map: tex, roughness: 0.5 }),
  );
  face.position.set(0, 1.65, 0.09);
  g.add(face);
  return g;
}

function createCampusLamp(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const poleMat = mat("#2b3634", 0.45, 0.6);
  const globeMat = new THREE.MeshStandardMaterial({
    color: "#fff5d8",
    emissive: "#ffd578",
    emissiveIntensity: 0.65,
    roughness: 0.25,
  });
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.2, 0.55, 8),
    poleMat,
  );
  base.position.y = 0.275;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.09, 4.4, 8),
    poleMat,
  );
  pole.position.y = 2.6;
  pole.castShadow = true;
  g.add(base, pole, box([0.95, 0.06, 0.06], "#2b3634", [0, 4.75, 0]));
  for (const [gx, gy] of [
    [-0.44, 4.92],
    [0.44, 4.92],
    [0, 5.15],
  ]) {
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(0.15, 8, 8),
      globeMat,
    );
    globe.position.set(gx, gy, 0);
    g.add(globe);
  }
  return g;
}

function createWhiteWashedCampusTree(x, y, z, scale = 1, poinciana = false, seed = 1) {
  // Signature tall Hai Bà Trưng trees with white-washed lower trunks (vôi trắng gốc cây, Photos 3 & 4)
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const whiteWashMat = mat("#ece7dc", 0.88);
  const trunkMat = mat("#5e4b39", 0.9);
  const whiteH = 1.55 * scale;
  const upperH = 2.45 * scale;

  const lowerTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * scale, 0.34 * scale, whiteH, 8),
    whiteWashMat,
  );
  lowerTrunk.position.y = whiteH / 2;
  lowerTrunk.castShadow = lowerTrunk.receiveShadow = true;

  const upperTrunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, upperH, 7),
    trunkMat,
  );
  upperTrunk.position.y = whiteH + upperH / 2;
  upperTrunk.castShadow = upperTrunk.receiveShadow = true;
  g.add(lowerTrunk, upperTrunk);

  const forkY = whiteH + upperH;
  for (let b = 0; b < 3; b++) {
    const a = (b * Math.PI * 2) / 3 + 0.4;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07 * scale, 0.13 * scale, 2.2 * scale, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * 0.72 * scale,
      forkY + 0.55 * scale,
      Math.sin(a) * 0.72 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.58;
    branch.rotation.x = Math.sin(a) * 0.58;
    g.add(branch);
  }

  const greens = poinciana
    ? ["#4a8336", "#5b9440", "#3f722e", "#6aa14b"]
    : ["#386e2e", "#49823a", "#599445", "#69a24f"];
  const crowns = [
    [0, forkY + 2.0 * scale, 0, 2.1 * scale, 0.62],
    [1.45 * scale, forkY + 1.45 * scale, 0.8 * scale, 1.55 * scale, 0.6],
    [-1.4 * scale, forkY + 1.5 * scale, 0.7 * scale, 1.6 * scale, 0.6],
    [0.25 * scale, forkY + 1.4 * scale, -1.4 * scale, 1.55 * scale, 0.62],
    [-0.9 * scale, forkY + 2.15 * scale, -0.75 * scale, 1.42 * scale, 0.58],
    [0.95 * scale, forkY + 2.1 * scale, -0.5 * scale, 1.38 * scale, 0.58],
    [0.1 * scale, forkY + 2.55 * scale, 0.45 * scale, 1.3 * scale, 0.55],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[i % greens.length], 0.85),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.18, sy, 1.14);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });

  if (poinciana) {
    const bloomMat = mat("#e34725", 0.62);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI * 2) / 8 + 0.15;
      const r = i < 2 ? 0.4 * scale : 1.52 * scale;
      const bloom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.62 * scale, 0),
        bloomMat,
      );
      bloom.position.set(
        Math.cos(a) * r,
        forkY + (2.2 + (i % 3) * 0.3) * scale,
        Math.sin(a) * r,
      );
      bloom.scale.set(1.22, 0.46, 1.22);
      g.add(bloom);
    }
  }
  return g;
}

function createCurvedParterreBed(x, y, z, outerR, innerR) {
  // Concentric trimmed hedge rings with crisp white concrete curbing (Photo 3)
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const curb = mat("#e8e2d5", 0.82);
  const hedge = mat("#3d7532", 0.88);
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(outerR, 0.14, 6, 28),
    curb,
  );
  outerRing.rotation.x = Math.PI / 2;
  outerRing.position.y = 0.08;

  const outerHedge = new THREE.Mesh(
    new THREE.TorusGeometry(outerR - 0.55, 0.38, 6, 26),
    hedge,
  );
  outerHedge.rotation.x = Math.PI / 2;
  outerHedge.scale.set(1, 1, 0.72);
  outerHedge.position.y = 0.24;

  const innerCurb = new THREE.Mesh(
    new THREE.TorusGeometry(innerR, 0.12, 6, 22),
    curb,
  );
  innerCurb.rotation.x = Math.PI / 2;
  innerCurb.position.y = 0.08;

  const centerShrub = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR * 0.55, innerR * 0.68, 0.48, 12),
    mat("#49863c", 0.86),
  );
  centerShrub.position.y = 0.26;
  const bloom = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.45, 0),
    mat("#df4435", 0.64),
  );
  bloom.position.y = 0.56;
  bloom.scale.set(1.35, 0.55, 1.35);

  g.add(outerRing, outerHedge, innerCurb, centerShrub, bloom);
  return g;
}

export class HaiBaTrungSchoolCampus {
  constructor(world, site, gatePlacement) {
    this.world = world;
    this.site = site;
    this.campusRings = getRingsOf(site.feature);
    this.gate = { x: gatePlacement.x, z: gatePlacement.z };
    this.facingGateYaw = gatePlacement.heading;
    this.fwdVec = {
      x: -Math.sin(this.facingGateYaw),
      z: -Math.cos(this.facingGateYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };
    this.flagpoleLocal = { side: 1.0, fwd: 144.0 };

    this.group = new THREE.Group();
    this.group.name = "hai-ba-trung-school-campus";
    this.flags = [];
    this.animatedObjects = [];
    this.campusBuildingPolygons = [];
    this.plazaPlanters = [];

    this.buildBuildings();
    this.buildCourtyard();
    this.buildGreenery();
    this.buildStudents();

    world.scene.add(this.group);
  }

  toWorld(side, fwd) {
    return {
      x: this.gate.x + side * this.rightVec.x + fwd * this.fwdVec.x,
      z: this.gate.z + side * this.rightVec.z + fwd * this.fwdVec.z,
    };
  }

  toLocal(wx, wz) {
    const dx = wx - this.gate.x;
    const dz = wz - this.gate.z;
    return {
      side: dx * this.rightVec.x + dz * this.rightVec.z,
      fwd: dx * this.fwdVec.x + dz * this.fwdVec.z,
    };
  }

  inCampus(wx, wz) {
    return this.campusRings.some((r) => inside({ x: wx, z: wz }, r));
  }

  buildBuildings() {
    const wallTex = createColonialWallTexture();
    const singleWallTex = createSingleStoryWallTexture();
    const roofTex = createTerracottaTileRoofTexture();

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#992a32",
      map: wallTex,
      roughness: 0.78,
      metalness: 0.04,
    });
    const singleWallMat = new THREE.MeshStandardMaterial({
      color: singleWallTex ? "#ffffff" : "#992a32",
      map: singleWallTex,
      roughness: 0.78,
      metalness: 0.04,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#b3472e",
      map: roofTex,
      roughness: 0.68,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const trimMat = mat("#efe7d8", 0.72);
    const stonePlinthMat = mat("#6f665a", 0.9);
    const darkWoodMat = mat("#3b2217", 0.82);

    const campusBuildings = getFeatures().filter(
      (f) =>
        f.type === "way" &&
        f.tags?.building &&
        f.geometry?.length > 3 &&
        this.campusRings.some((r) => inside(getCentroid(f), r)),
    );

    const pilasters = [];
    const windowHoods = [];
    const corbels = [];
    const cornices = [];
    const plinthTrim = [];

    for (const feature of campusBuildings) {
      const pts = getPointsOf(feature);
      this.campusBuildingPolygons.push(pts);
      const ob = orientedBounds(pts);
      const isCarport = feature.tags?.building === "carport";
      const isMainHall = feature.id === 695770489; // Nhà chơi (Photo 2)
      const isSportsOrHall =
        feature.id === 695770490 || feature.id === 695770491;
      const isSingleStory =
        feature.tags?.["building:levels"] === "1" ||
        feature.id === 695770485 ||
        feature.id === 1457743267;

      if (isCarport) {
        // Open-sided school bicycle shelter with pitched terracotta roof & slender crimson posts
        const shed = new THREE.Group();
        shed.position.set(ob.cx, 0.23, ob.cz);
        shed.rotation.y = ob.yaw;
        shed.add(box([ob.length, 0.14, ob.depth], "#b5b0a5", [0, 0.07, 0]));
        const cols = Math.max(4, Math.floor(ob.length / 4.2));
        for (let i = 0; i <= cols; i++) {
          const px = ((i - cols / 2) * (ob.length - 0.8)) / cols;
          for (const pz of [-ob.depth * 0.42, ob.depth * 0.42]) {
            shed.add(box([0.2, 2.8, 0.2], "#8c262c", [px, 1.4, pz]));
          }
        }
        const shedRoof = createHipRoofMesh(
          ob.length + 0.8,
          ob.depth + 0.8,
          1.35,
          roofMat,
        );
        shedRoof.position.y = 2.8;
        shed.add(shedRoof);
        this.group.add(shed);
        continue;
      }

      const wallHeight = isSportsOrHall
        ? 8.2
        : isMainHall
          ? 6.4
          : isSingleStory
            ? 4.4
            : 7.6;

      const bodyGeo = polygonGeometry(pts, wallHeight);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          const px = pos.getX(i);
          const py = pos.getY(i);
          const pz = pos.getZ(i);
          uv.setXY(i, (px + pz) / 9.5, py / wallHeight);
        }
      }
      const bodyMesh = new THREE.Mesh(
        bodyGeo,
        isSingleStory ? singleWallMat : wallMat,
      );
      bodyMesh.position.y = 0.23;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);

      // 3D architectural stone plinth, cornice, pilasters & window hoods with corbels
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        if (len < 3) continue;
        const yaw = Math.atan2(b.x - a.x, b.z - a.z) - Math.PI / 2;
        const mx = (a.x + b.x) / 2;
        const mz = (a.z + b.z) / 2;
        const matRot = new THREE.Matrix4()
          .makeRotationY(yaw)
          .setPosition(mx, 0.23, mz);

        const plinth = new THREE.BoxGeometry(len + 0.24, 0.7, 0.36);
        plinth.translate(0, 0.35, 0);
        plinth.applyMatrix4(matRot);
        plinthTrim.push(plinth);

        const cornice = new THREE.BoxGeometry(len + 0.45, 0.28, 0.56);
        cornice.translate(0, wallHeight - 0.1, 0);
        cornice.applyMatrix4(matRot);
        cornices.push(cornice);

        if (len > 7 && !isMainHall) {
          const count = Math.min(22, Math.floor(len / 3.6));
          for (let k = 0; k <= count; k++) {
            const x = ((k - count / 2) * len) / (count + 1);
            const pil = new THREE.BoxGeometry(0.3, wallHeight - 0.2, 0.38);
            pil.translate(x, wallHeight / 2, 0);
            pil.applyMatrix4(matRot);
            pilasters.push(pil);

            if (k < count) {
              const wx = ((k + 0.5 - count / 2) * len) / (count + 1);
              for (const wy of isSingleStory ? [2.95] : [2.95, 6.25]) {
                if (wy > wallHeight - 0.8) continue;
                const hood = new THREE.BoxGeometry(1.45, 0.16, 0.44);
                hood.translate(wx, wy, 0);
                hood.applyMatrix4(matRot);
                windowHoods.push(hood);

                for (const sx of [-0.55, 0.55]) {
                  const corbel = new THREE.BoxGeometry(0.14, 0.32, 0.38);
                  corbel.translate(wx + sx, wy - 0.22, 0);
                  corbel.applyMatrix4(matRot);
                  corbels.push(corbel);
                }
              }
            }
          }
        }
      }

      // Pitched terracotta-red roof aligned to building footprint
      const roofY = 0.23 + wallHeight;
      const overhang = 1.15;
      const ridgeH = isMainHall
        ? 4.6
        : isSportsOrHall
          ? 3.2
          : isSingleStory
            ? 1.75
            : Math.min(3.5, ob.depth * 0.22 + 0.8);
      const roofObj = isSportsOrHall
        ? createGableRoofMesh(
            ob.length + overhang,
            ob.depth + overhang,
            ridgeH,
            roofMat,
            trimMat,
          )
        : createHipRoofMesh(
            ob.length + overhang,
            ob.depth + overhang,
            ridgeH,
            roofMat,
          );
      roofObj.position.set(ob.cx, roofY, ob.cz);
      roofObj.rotation.y = ob.yaw;
      this.group.add(roofObj);

      // Iconic Main Hall (695770489 Nhà chơi) matching Photo 2: colonnade arcade, verandah roof, oculus gable & motto plaques
      if (isMainHall) {
        const hall = new THREE.Group();
        const c = getCentroid(feature);
        hall.position.set(c.x, 0.23, c.z);
        hall.rotation.y = this.facingGateYaw;

        const frontWallZ = 7.0;
        const arcadeZ = frontWallZ + 2.35;

        // Ground-floor crimson colonnade arcade piers with white capitals & bases
        hall.add(box([42, 0.32, 3.2], "#cfc8b9", [0, 0.16, arcadeZ - 0.7]));
        const pierXs = [-18, -13.5, -9, -4.5, 0, 4.5, 9, 13.5, 18];
        for (const px of pierXs) {
          hall.add(
            box([0.92, 0.34, 0.92], "#efe7d8", [px, 0.34, arcadeZ]),
            box([0.78, 3.3, 0.78], "#94272d", [px, 1.98, arcadeZ]),
            box([0.96, 0.22, 0.96], "#efe7d8", [px, 3.68, arcadeZ]),
          );
        }
        // Horizontal white arched lintel frieze connecting arcade piers
        hall.add(
          box([37.5, 0.45, 0.72], "#94272d", [0, 3.92, arcadeZ]),
          box([37.8, 0.14, 0.84], "#efe7d8", [0, 4.16, arcadeZ]),
        );

        // Sweeping lower terracotta verandah roof sheltering the colonnade arcade
        const verandahDepth = 3.6;
        const vPositions = [
          -20.5, 4.0, arcadeZ + 0.9,
          20.5, 4.0, arcadeZ + 0.9,
          20.5, 5.15, frontWallZ - 0.4,
          -20.5, 5.15, frontWallZ - 0.4,
        ];
        const vGeo = new THREE.BufferGeometry();
        vGeo.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(vPositions, 3),
        );
        vGeo.setAttribute(
          "uv",
          new THREE.Float32BufferAttribute([0, 0, 7, 0, 7, 1, 0, 1], 2),
        );
        vGeo.setIndex([0, 1, 2, 0, 2, 3]);
        vGeo.computeVertexNormals();
        const verandahRoof = new THREE.Mesh(vGeo, roofMat);
        verandahRoof.castShadow = verandahRoof.receiveShadow = true;
        hall.add(verandahRoof);

        // Central triangular gable dormer with circular oculus window & emblem (Photo 2)
        const dormerZ = frontWallZ + 0.75;
        const dormerW = 9.4;
        const dormerH = 3.85;
        const dormerBaseY = wallHeight - 0.45;
        const gShape = new THREE.Shape();
        gShape.moveTo(-dormerW / 2, 0);
        gShape.lineTo(dormerW / 2, 0);
        gShape.lineTo(0, dormerH);
        gShape.closePath();
        const dormerWall = new THREE.Mesh(
          new THREE.ExtrudeGeometry(gShape, { depth: 3.4, bevelEnabled: false }),
          mat("#992a32", 0.8),
        );
        dormerWall.position.set(0, dormerBaseY, dormerZ - 3.3);
        dormerWall.castShadow = dormerWall.receiveShadow = true;
        hall.add(dormerWall);

        // White ornate gable bargeboards & cornice
        const slopeLen = Math.hypot(dormerW / 2 + 0.4, dormerH);
        const slopeAng = Math.atan2(dormerH, dormerW / 2);
        for (const sx of [-1, 1]) {
          const barge = new THREE.Mesh(
            new THREE.BoxGeometry(slopeLen, 0.24, 0.65),
            trimMat,
          );
          barge.position.set(
            sx * (dormerW / 4),
            dormerBaseY + dormerH / 2 + 0.1,
            dormerZ + 0.12,
          );
          barge.rotation.z = -sx * slopeAng;
          hall.add(barge);

          const eaveRoof = new THREE.Mesh(
            new THREE.BoxGeometry(slopeLen + 0.3, 0.18, 3.8),
            roofMat,
          );
          eaveRoof.position.set(
            sx * (dormerW / 4),
            dormerBaseY + dormerH / 2 + 0.24,
            dormerZ - 1.45,
          );
          eaveRoof.rotation.z = -sx * slopeAng;
          hall.add(eaveRoof);
        }

        // Circular oculus window & white decorative radial ring on central gable
        const oculusY = dormerBaseY + 1.95;
        const oculusRing = new THREE.Mesh(
          new THREE.TorusGeometry(0.82, 0.14, 8, 24),
          trimMat,
        );
        oculusRing.position.set(0, oculusY, dormerZ + 0.16);
        const oculusVoid = new THREE.Mesh(
          new THREE.CircleGeometry(0.72, 20),
          darkWoodMat,
        );
        oculusVoid.position.set(0, oculusY, dormerZ + 0.14);
        const emblem = new THREE.Mesh(
          new THREE.CircleGeometry(0.58, 18),
          mat("#d99c36", 0.45, 0.4),
        );
        emblem.position.set(0, dormerBaseY - 0.1, dormerZ + 0.16);
        hall.add(
          oculusRing,
          oculusVoid,
          emblem,
          box([4.2, 0.22, 0.35], "#efe7d8", [0, dormerBaseY + 0.82, dormerZ + 0.16]),
        );

        // 3 crisp white motto plaques: "THI ĐUA" · "DẠY TỐT" · "HỌC TỐT"
        for (const [mx, label] of [
          [-5.6, "THI ĐUA"],
          [0, "DẠY TỐT"],
          [5.6, "HỌC TỐT"],
        ]) {
          const mTex = createMottoPlaqueTexture(label);
          const plaque = new THREE.Mesh(
            new THREE.PlaneGeometry(3.8, 0.94),
            new THREE.MeshStandardMaterial({
              color: "#ffffff",
              map: mTex,
              roughness: 0.55,
            }),
          );
          plaque.position.set(mx, 4.95, arcadeZ - 0.85);
          hall.add(plaque);
        }

        // Flanking arched louvered dormer windows along the upper verandah (Photo 2)
        for (const ax of [-11.8, -5.6, 5.6, 11.8]) {
          const archRim = new THREE.Mesh(
            new THREE.TorusGeometry(1.55, 0.16, 6, 16, Math.PI),
            trimMat,
          );
          archRim.position.set(ax, 5.45, frontWallZ + 0.55);
          const archFill = new THREE.Mesh(
            new THREE.CircleGeometry(1.42, 16, 0, Math.PI),
            mat("#787066", 0.82),
          );
          archFill.position.set(ax, 5.45, frontWallZ + 0.53);
          hall.add(
            archRim,
            archFill,
            box([3.3, 0.18, 0.3], "#efe7d8", [ax, 5.42, frontWallZ + 0.55]),
            box([2.6, 0.09, 0.16], "#e4ddd0", [ax, 5.85, frontWallZ + 0.56]),
            box([2.1, 0.09, 0.16], "#e4ddd0", [ax, 6.22, frontWallZ + 0.56]),
          );
        }
        this.group.add(hall);
      }
    }

    const addBatch = (parts, material) => {
      if (!parts.length) return;
      const mesh = new THREE.Mesh(mergeGeometries(parts), material);
      mesh.castShadow = mesh.receiveShadow = true;
      this.group.add(mesh);
      parts.forEach((p) => p.dispose());
    };

    addBatch(plinthTrim, stonePlinthMat);
    addBatch(cornices, trimMat);
    addBatch(pilasters, trimMat);
    addBatch(windowHoods, trimMat);
    addBatch(corbels, trimMat);
  }

  buildCourtyard() {
    const pavingTex = createCourtyardPavingTexture();
    const terraTex = createTerracottaPlazaTexture();
    const bulletinTex = createBulletinBoardTexture();
    const flagTex = createVietnamFlagTexture();

    const pavingMat = new THREE.MeshStandardMaterial({
      color: pavingTex ? "#ffffff" : "#979690",
      map: pavingTex,
      roughness: 0.85,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const terraMat = new THREE.MeshStandardMaterial({
      color: terraTex ? "#ffffff" : "#b9644b",
      map: terraTex,
      roughness: 0.78,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const curbMat = mat("#e3ddd0", 0.84);
    const lawnMat = createManicuredLawnMaterial(8, 12, {
      striped: false,
      rich: true,
    });
    const rearLawnMat = createManicuredLawnMaterial(8, 12, {
      striped: true,
      rich: true,
    });

    const yard = new THREE.Group();
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    const flagX = this.flagpoleLocal.side; // +1.0
    const flagZ = -this.flagpoleLocal.fwd; // -144.0

    // 1. Front manicured garden lawns flanking entry avenue (fwd: 7..52)
    for (const [lx, w] of [
      [-17.5, 25],
      [18.5, 21],
    ]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 42), lawnMat);
      lawn.position.set(lx, 0.08, -29);
      lawn.receiveShadow = true;
      yard.add(lawn);
      yard.add(createCurvedParterreBed(lx, 0.15, -29, 5.2, 2.4));
    }

    // 2. Entry avenue straight from front Tam Quan gate toward Flagpole Plaza (fwd: 1..134)
    const avenue = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 0.06, 134),
      pavingMat,
    );
    avenue.position.set(0.5, 0.31, -67);
    avenue.receiveShadow = true;
    yard.add(avenue);
    for (const sx of [-4.05, 5.05]) {
      yard.add(box([0.32, 0.14, 130], "#e3ddd0", [sx, 0.32, -65]));
    }

    // 3. Central Courtyard manicured lawns + curved hedge parterres between classroom wings (fwd: 58..126)
    for (const [lx, w] of [
      [-17.5, 22],
      [19.5, 22],
    ]) {
      const midLawn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, 62), lawnMat);
      midLawn.position.set(lx, 0.09, -92);
      midLawn.receiveShadow = true;
      yard.add(midLawn);
      yard.add(
        createCurvedParterreBed(lx, 0.15, -78, 5.8, 2.7),
        createCurvedParterreBed(lx, 0.15, -106, 5.8, 2.7),
      );
    }

    // 4. Wide Flagpole Plaza paving & cross-courtyard walkways (fwd: 126..170)
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(64, 0.07, 44),
      pavingMat,
    );
    plaza.position.set(1, 0.3, -148);
    plaza.receiveShadow = true;
    yard.add(plaza);

    // Cross-courtyard & wing walkways connecting all front & side colonial blocks
    for (const pz of [-54, -92, -125]) {
      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(64, 0.07, 4.4),
        pavingMat,
      );
      cross.position.set(1, 0.3, pz);
      cross.receiveShadow = true;
      yard.add(cross);
    }
    for (const sx of [-30.5, 31.8]) {
      const wingWalk = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.08, 152),
        pavingMat,
      );
      wingWalk.position.set(sx, 0.3, -94);
      wingWalk.receiveShadow = true;
      yard.add(wingWalk);
    }

    // 5. Flagpole Landscaped Circular Island (Cột cờ trung tâm sân trường - Photo 2)
    const islandCurb = new THREE.Mesh(
      new THREE.CylinderGeometry(11.2, 11.2, 0.18, 40),
      curbMat,
    );
    islandCurb.position.set(flagX, 0.33, flagZ);
    islandCurb.receiveShadow = true;
    const islandGrass = new THREE.Mesh(
      new THREE.CylinderGeometry(10.8, 10.8, 0.2, 40),
      lawnMat,
    );
    islandGrass.position.set(flagX, 0.34, flagZ);
    islandGrass.receiveShadow = true;
    yard.add(islandCurb, islandGrass);

    // Terracotta-tiled cross-paths dividing the flagpole island into 4 grass quadrants
    const crossNS = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.22, 22.0),
      terraMat,
    );
    crossNS.position.set(flagX, 0.35, flagZ);
    crossNS.receiveShadow = true;
    const crossEW = new THREE.Mesh(
      new THREE.BoxGeometry(22.0, 0.22, 2.8),
      terraMat,
    );
    crossEW.position.set(flagX, 0.35, flagZ);
    crossEW.receiveShadow = true;
    yard.add(crossNS, crossEW);

    // 4 sculpted cycad plants (cây vạn tuế) in the 4 grass quadrants around the flagpole
    for (const [dx, dz] of [
      [-4.6, -4.6],
      [4.6, -4.6],
      [-4.6, 4.6],
      [4.6, 4.6],
    ]) {
      yard.add(createCycadPlant(flagX + dx, 0.44, flagZ + dz, 1.05));
    }

    // Central tall flagpole with animated waving Vietnamese flag
    const fp = createHaiBaTrungFlagpole(flagX, 0.44, flagZ, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);

    // 6. Campus Stone Benches, Bulletin Boards (Bảng tin) & Globe Lamps
    for (let bz = -62; bz >= -124; bz -= 15.5) {
      yard.add(
        createCampusBench(-28.0, 0.34, bz, Math.PI / 2),
        createCampusBench(29.3, 0.34, bz, -Math.PI / 2),
      );
    }
    for (const [bx, bz, yaw] of [
      [-12.5, -52.5, 0],
      [14.5, -52.5, 0],
    ]) {
      yard.add(createBulletinBoard(bx, 0.34, bz, yaw, bulletinTex));
    }
    for (const [lx, lz] of [
      [-5.5, -24],
      [6.5, -24],
      [-5.5, -60],
      [6.5, -60],
      [-5.5, -100],
      [6.5, -100],
      [-13, flagZ + 12],
      [15, flagZ + 12],
      [-13, flagZ - 12],
      [15, flagZ - 12],
    ]) {
      yard.add(createCampusLamp(lx, 0.32, lz));
    }

    // 7. Rear Athletic Green Lawn & Outdoor Sports Court (fwd: 238..288)
    const rearLawn = new THREE.Mesh(
      new THREE.BoxGeometry(82, 0.12, 46),
      rearLawnMat,
    );
    rearLawn.position.set(2, 0.08, -264);
    rearLawn.receiveShadow = true;
    const sportPad = new THREE.Mesh(
      new THREE.BoxGeometry(30, 0.08, 17),
      terraMat,
    );
    sportPad.position.set(-14, 0.15, -262);
    sportPad.receiveShadow = true;
    const courtLine = box([27, 0.02, 0.16], "#f3eee2", [-14, 0.2, -262]);
    yard.add(rearLawn, sportPad, courtLine);

    this.group.add(yard);
  }

  buildGreenery() {
    // Tall white-washed-trunk campus shade trees & scarlet Phượng Vĩ (Photos 1, 3, 4)
    const candidateSpecs = [
      // Framing entry avenue behind front gate (keeping |side| >= 11.2 near gate & |side - 0.5| >= 8.5 along avenue)
      [-12.0, 14, 1.38, false],
      [13.0, 14, 1.36, true],
      [-15.5, 24, 1.32, true],
      [16.5, 24, 1.32, false],
      [-9.5, 38, 1.36, false],
      [10.5, 38, 1.34, true],
      [-26.0, 38, 1.4, false],
      [25.0, 38, 1.35, true],
      [-9.5, 58, 1.34, true],
      [10.5, 58, 1.34, false],
      // Framing the wide central courtyard lawns & long classroom wings (Photos 3 & 4)
      [-26.5, 66, 1.42, false],
      [27.5, 66, 1.4, true],
      [-10.0, 78, 1.35, false],
      [11.0, 78, 1.35, true],
      [-26.5, 88, 1.45, true],
      [27.5, 88, 1.42, false],
      [-10.0, 100, 1.36, true],
      [11.0, 100, 1.36, false],
      [-26.5, 112, 1.4, false],
      [27.5, 112, 1.4, true],
      [-10.0, 122, 1.32, false],
      [11.0, 122, 1.32, true],
      [-25.5, 134, 1.38, false],
      [26.5, 134, 1.38, true],
      [-25.5, 154, 1.42, true],
      [26.5, 154, 1.42, false],
      [-17.5, 158, 1.28, false],
      [19.5, 158, 1.28, true],
      // Front boundary corners & outer perimeter avenues
      [-38, 11, 1.42, false],
      [-52, 14, 1.38, true],
      [48, 14, 1.38, false],
      [-52, 48, 1.4, true],
      [50, 48, 1.4, false],
      // Outer side corridors & rear campus grounds
      [-52, 122, 1.44, false],
      [-52, 154, 1.4, true],
      [54, 122, 1.44, true],
      [54, 154, 1.4, false],
      [-25, 198, 1.42, false],
      [20, 198, 1.38, true],
      [-25, 224, 1.4, true],
      [15, 228, 1.36, false],
      [-45, 245, 1.45, false],
      [-15, 248, 1.42, true],
      [18, 248, 1.42, false],
      [44, 246, 1.4, true],
      [-45, 282, 1.44, true],
      [42, 282, 1.4, false],
    ];

    candidateSpecs.forEach(([side, fwd, scale, poinciana], idx) => {
      const w = this.toWorld(side, fwd);
      if (!this.inCampus(w.x, w.z)) return;
      const hitsBuilding = this.campusBuildingPolygons.some(
        (poly) => inside(w, poly) || nearestPoint(w, poly).distance < 3.4,
      );
      if (hitsBuilding) return;
      if (fwd >= 126 && fwd <= 170 && Math.abs(side - 1) <= 29) {
        this.plazaPlanters.push({ side, fwd });
        const planter = new THREE.Group();
        planter.position.set(w.x, 0.34, w.z);
        planter.rotation.y = this.facingGateYaw;
        planter.add(
          box([2.4, 0.14, 2.4], "#e3ddd0", [0, 0.05, 0]),
          box([1.95, 0.16, 1.95], "#488138", [0, 0.06, 0]),
        );
        this.group.add(planter);
      }
      this.group.add(
        createWhiteWashedCampusTree(w.x, 0.14, w.z, scale, poinciana, idx + 1),
      );
    });
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    const { side, fwd } = this.toLocal(wx, wz);

    // Terracotta cross-paths on flagpole island
    const ds = Math.abs(side - this.flagpoleLocal.side);
    const df = Math.abs(fwd - this.flagpoleLocal.fwd);
    if (
      (ds <= 1.45 && df <= 11.2) ||
      (df <= 1.45 && ds <= 11.2)
    ) {
      return 0.46;
    }
    // Entry avenue, flagpole plaza, cross-walks & wing walkways
    if (Math.abs(side - 0.5) <= 4.6 && fwd >= -1 && fwd <= 135) return 0.34;
    if (Math.abs(side - 1) <= 32.5 && fwd >= 125 && fwd <= 171) return 0.34;
    if (
      (Math.abs(fwd - 54) <= 2.3 ||
        Math.abs(fwd - 92) <= 2.3 ||
        Math.abs(fwd - 125) <= 2.3) &&
      side >= -32 &&
      side <= 34
    )
      return 0.34;
    if (
      (Math.abs(side + 30.5) <= 2.9 || Math.abs(side - 31.8) <= 2.9) &&
      fwd >= 16 &&
      fwd <= 172
    )
      return 0.34;
    return null;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    if (
      this.campusBuildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))
    )
      return false;
    const { side, fwd } = this.toLocal(wx, wz);
    const ds = Math.abs(side - this.flagpoleLocal.side);
    const df = Math.abs(fwd - this.flagpoleLocal.fwd);

    // Block solid flagpole pedestal
    if (ds < 1.55 && df < 1.55) return false;
    // Block cycad plants in flagpole quadrants & lawn quadrants outside cross-paths
    if (Math.hypot(ds, df) <= 11.2) {
      if (ds <= 1.4 && df <= 11.0) return true;
      if (df <= 1.4 && ds <= 11.0) return true;
      return false;
    }
    // Block campus stone benches & bulletin boards
    for (let bz = 62; bz <= 124; bz += 15.5) {
      if (
        Math.abs(fwd - bz) < 0.45 &&
        (Math.abs(side + 28.0) < 0.95 || Math.abs(side - 29.3) < 0.95)
      ) {
        return false;
      }
    }
    if (
      Math.abs(fwd - 52.5) < 0.45 &&
      (Math.abs(side + 12.5) < 1.65 || Math.abs(side - 14.5) < 1.65)
    )
      return false;
    if (
      this.plazaPlanters.some(
        (p) => Math.abs(side - p.side) < 1.3 && Math.abs(fwd - p.fwd) < 1.3,
      )
    )
      return false;

    // Rideable paved avenue, flagpole plaza, cross-walks & wing walkways
    if (Math.abs(side - 0.5) <= 4.3 && fwd >= -1 && fwd <= 135) return true;
    if (Math.abs(side - 1) <= 32.0 && fwd >= 125 && fwd <= 170) return true;
    if (
      (Math.abs(fwd - 54) <= 2.1 ||
        Math.abs(fwd - 92) <= 2.1 ||
        Math.abs(fwd - 125) <= 2.1) &&
      side >= -31 &&
      side <= 33
    )
      return true;
    if (
      (Math.abs(side + 30.5) <= 2.7 || Math.abs(side - 31.8) <= 2.7) &&
      fwd >= 16 &&
      fwd <= 171
    )
      return true;
    return null;
  }

  blocksGrass(wx, wz) {
    return this.inCampus(wx, wz);
  }

  blocksTree(wx, wz) {
    return this.inCampus(wx, wz);
  }

  buildStudents() {
    this.students = new CampusStudents({
      parent: this.group,
      toWorld: (side, fwd) => this.toWorld(side, fwd),
      groundAt: (wx, wz) => this.groundAt(wx, wz) ?? 0.34,
      walkers: [
        { gender: "girl", points: [[-1.6, 14], [-1.6, 118]], speed: 1.28, offset: 0.12 },
        { gender: "boy", points: [[2.4, 120], [2.4, 18]], speed: 1.38, offset: 0.52 },
        { gender: "girl", points: [[-29.8, 34], [-29.8, 152]], speed: 1.22, offset: 0.3 },
        { gender: "boy", points: [[31.2, 152], [31.2, 34]], speed: 1.32, offset: 0.72 },
        { gender: "girl", points: [[-26, 92], [26, 92]], speed: 1.26, offset: 0.18 },
        { gender: "boy", points: [[26, 125], [-26, 125]], speed: 1.34, offset: 0.6 },
        { gender: "girl", points: [[1.0, 134], [1.0, 140.5]], speed: 1.1, offset: 0.2 },
        { gender: "boy", points: [[11.0, 144], [21.5, 144]], speed: 1.22, offset: 0.5 },
      ],
      chatSpots: [
        { side: -14.5, fwd: 144, members: ["girl", "girl", "boy"], radius: 0.9 },
        { side: 16.5, fwd: 160, members: ["boy", "girl", "boy"], radius: 0.9 },
        { side: -16, fwd: 160, members: ["girl", "boy"], radius: 0.78 },
        { side: -6, fwd: 54, members: ["boy", "girl"], radius: 0.72 },
      ],
    });
    this.animatedObjects.push(...this.students.animatedObjects);
  }

  update(time, playerPos = null) {
    for (const flag of this.flags) {
      const pos = flag.geometry.attributes.position;
      const base = flag.userData.basePos;
      if (!pos || !base) continue;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const u = Math.min(1, Math.max(0, bx / 2.95));
        const wave =
          Math.sin(u * 4.5 - time * 3.8) * 0.2 * u +
          Math.sin(u * 8.0 - time * 5.6 + by * 0.6) * 0.06 * u;
        const droop = -0.15 * u * u + Math.sin(time * 2.1 + u * 2) * 0.03 * u;
        pos.setZ(i, base[i * 3 + 2] + wave);
        pos.setY(i, by + droop);
      }
      pos.needsUpdate = true;
      flag.geometry.computeVertexNormals();
    }
    this.students?.update(time, playerPos);
  }
}
