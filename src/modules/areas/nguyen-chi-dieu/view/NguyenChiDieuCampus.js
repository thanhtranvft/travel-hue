import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import dongDaCampuses from "../data/campuses.json" with { type: "json" };
import {
  getById,
  getPointsOf,
} from "../../../../core/shared/geography/activeGeography.js";
import {
  inside,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnMaterial } from "../../../../core/world/turfTextures.js";
import { CampusStudents } from "../../../../core/world/CampusStudents.js";
import { buildChibiActor } from "../../../../core/vehicle/ChibiCharacters.js";

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

function createGoldenSchoolWallTexture(floors = 3) {
  const texH = floors === 3 ? 512 : 384;
  return createCanvasTexture(512, texH, (ctx, w, h) => {
    // Signature warm golden-yellow facade stucco matching Nguyễn Chí Diểu campus photo
    ctx.fillStyle = "#f0cb5c";
    ctx.fillRect(0, 0, w, h);

    // Subtle plaster texture speckle
    for (let i = 0; i < 360; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,248,215,0.08)" : "rgba(170,128,28,0.05)";
      ctx.fillRect((i * 173) % w, (i * 293) % h, 6, 4);
    }

    // Ground stone plinth
    ctx.fillStyle = "#8a857b";
    ctx.fillRect(0, h - 46, w, 46);
    ctx.fillStyle = "#faf6e9";
    ctx.fillRect(0, h - 50, w, 8);

    const floorStep = Math.floor((h - 50) / floors);
    for (let f = 0; f < floors; f++) {
      const topY = f * floorStep;
      // Crisp white horizontal floor cornice band
      ctx.fillStyle = "#faf6e9";
      ctx.fillRect(0, topY, w, 13);

      const winY = topY + 28;
      const winH = Math.max(66, floorStep - 48);
      for (const wx of [34, 198, 362]) {
        // White window surround
        ctx.fillStyle = "#faf6e9";
        ctx.fillRect(wx - 6, winY - 6, 118, winH + 12);
        // Dark-green louvered Hue wooden shutter frame
        ctx.fillStyle = "#1f5a38";
        ctx.fillRect(wx, winY, 106, winH);
        ctx.fillStyle = "#164329";
        ctx.fillRect(wx + 8, winY + 8, 90, winH - 16);

        // Louver slats + crisp white security bars matching photo
        ctx.fillStyle = "#2b6f47";
        for (let sy = winY + 14; sy < winY + winH - 12; sy += 9) {
          ctx.fillRect(wx + 10, sy, 38, 3);
          ctx.fillRect(wx + 58, sy, 38, 3);
        }
        ctx.fillStyle = "#dce5dc";
        ctx.fillRect(wx + 51, winY + 6, 4, winH - 12);
        ctx.fillRect(wx + 6, winY + Math.round(winH * 0.48), 94, 4);
      }
    }
  });
}

function createTerracottaRoofTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#ad3f28";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#bf4c34";
        ctx.fillRect(x + 2, 0, 11, h);
        ctx.fillStyle = "#862b18";
        ctx.fillRect(x + 17, 0, 5, h);
      }
      for (let y = 0; y < h; y += 22) {
        ctx.fillStyle = "rgba(65,18,10,0.26)";
        ctx.fillRect(0, y, w, 3);
      }
    },
    4,
    2,
  );
}

function createSchoolyardStripedTileTexture() {
  // Terracotta-rose & light-grey alternating terrazzo walkway strips matching photo
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#d3d1cc";
      ctx.fillRect(0, 0, w, h);

      const stripeW = 64;
      for (let x = 0; x < w; x += stripeW * 2) {
        // Warm terracotta-brick strip
        ctx.fillStyle = "#be8277";
        ctx.fillRect(x, 0, stripeW, h);
        // Subtle inner highlight / brick joint variation
        for (let y = 0; y < h; y += 32) {
          ctx.fillStyle =
            ((x / stripeW + y / 32) & 1) === 0
              ? "rgba(255,235,228,0.08)"
              : "rgba(95,40,34,0.08)";
          ctx.fillRect(x + 2, y + 2, stripeW - 4, 28);
        }
      }

      // Light-grey terrazzo pavers subtle speckles & tile joints
      for (let i = 0; i < 800; i++) {
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(85,82,76,0.09)" : "rgba(255,255,255,0.12)";
        ctx.fillRect((i * 197) % w, (i * 331) % h, 3, 3);
      }
      ctx.strokeStyle = "rgba(110,106,100,0.22)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += 64) {
        ctx.beginPath?.();
        ctx.moveTo?.(p, 0);
        ctx.lineTo?.(p, h);
        ctx.moveTo?.(0, p);
        ctx.lineTo?.(w, p);
        ctx.stroke?.();
      }
    },
    10,
    10,
  );
}

function createBlueBannerTexture(topLine, mainLine, bg = "#0b5ec2") {
  return createCanvasTexture(1024, 224, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e6f2ff";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (topLine) {
      ctx.fillStyle = "#edf6ff";
      ctx.font = "bold 36px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(topLine, w / 2, h * 0.31, w - 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 62px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(mainLine, w / 2, h * 0.71, w - 60);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(mainLine, w / 2, h / 2 + 2, w - 54);
    }
  });
}

function createGreenNoticeBoardTexture() {
  return createCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#1a523e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d9d4c7";
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.textAlign = "center";
    ctx.fillStyle = "#f7f3df";
    ctx.font = "bold 28px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("BẢNG TIN LIÊN ĐỘI THCS NGUYỄN CHÍ DIỂU", w / 2, 46, w - 40);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(42, 72, 196, 146);
    ctx.fillRect(274, 72, 196, 146);
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
  const inset = Math.min(hl * 0.65, hd * 0.9);
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

function createBroadShadeTree(x, y, z, scale = 1, seed = 1, ancient = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat(ancient ? "#524234" : "#64513d", 0.92);
  const trunkH = (ancient ? 3.8 : 3.1) * scale;
  const trunkR = (ancient ? 0.42 : 0.24) * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.68, trunkR * 1.25, trunkH, 8),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const branchCount = ancient ? 5 : 3;
  for (let b = 0; b < branchCount; b++) {
    const a = (b * Math.PI * 2) / branchCount + 0.35;
    const bLen = (ancient ? 3.2 : 2.0) * scale;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09 * scale, 0.17 * scale, bLen, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * (ancient ? 1.15 : 0.65) * scale,
      trunkH + 0.62 * scale,
      Math.sin(a) * (ancient ? 1.15 : 0.65) * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.64;
    branch.rotation.x = Math.sin(a) * 0.64;
    branch.castShadow = true;
    g.add(branch);
  }

  const greens = ["#2f6929", "#3e7b34", "#4f903f", "#609d4a"];
  const crowns = ancient
    ? [
        [0, trunkH + 2.4 * scale, 0, 2.9 * scale, 0.56],
        [2.2 * scale, trunkH + 1.85 * scale, 1.2 * scale, 2.15 * scale, 0.54],
        [-2.1 * scale, trunkH + 1.9 * scale, 1.1 * scale, 2.2 * scale, 0.54],
        [0.4 * scale, trunkH + 1.75 * scale, -2.1 * scale, 2.1 * scale, 0.56],
        [-1.5 * scale, trunkH + 2.4 * scale, -1.3 * scale, 1.9 * scale, 0.52],
        [1.7 * scale, trunkH + 2.35 * scale, -1.0 * scale, 1.85 * scale, 0.52],
        [0, trunkH + 3.05 * scale, 0.2 * scale, 2.1 * scale, 0.5],
      ]
    : [
        [0, trunkH + 1.95 * scale, 0, 2.25 * scale, 0.6],
        [1.5 * scale, trunkH + 1.45 * scale, 0.9 * scale, 1.65 * scale, 0.58],
        [-1.45 * scale, trunkH + 1.5 * scale, 0.8 * scale, 1.68 * scale, 0.58],
        [0.25 * scale, trunkH + 1.38 * scale, -1.5 * scale, 1.62 * scale, 0.6],
        [-0.95 * scale, trunkH + 2.1 * scale, -0.8 * scale, 1.48 * scale, 0.56],
        [1.0 * scale, trunkH + 2.05 * scale, -0.55 * scale, 1.44 * scale, 0.56],
      ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[i % greens.length], 0.86),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.24, sy, 1.2);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });
  return g;
}

function createFlagpole(x, y, z, flagTex) {
  const group = new THREE.Group();
  group.name = "nguyen-chi-dieu-flagpole";
  group.position.set(x, y, z);

  const baseMat = mat("#e3ddd0", 0.78);
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.56, 0.3, 12),
    baseMat,
  );
  plinth.position.y = 0.15;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.34, 0.24, 12),
    baseMat,
  );
  collar.position.y = 0.4;

  const poleH = 11.4;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.085, poleH, 10),
    mat("#d9dfe2", 0.24, 0.85),
  );
  pole.position.y = poleH / 2 + 0.32;
  pole.castShadow = true;

  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 8),
    mat("#e5b842", 0.25, 0.82),
  );
  finial.position.y = poleH + 0.36;
  group.add(plinth, collar, pole, finial);

  const flagW = 2.55;
  const flagH = 1.68;
  const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 16, 8);
  flagGeo.translate(flagW / 2, 0, 0);
  const basePos = new Float32Array(flagGeo.attributes.position.array);
  const flagMesh = new THREE.Mesh(
    flagGeo,
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: flagTex,
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
  );
  flagMesh.position.set(0.05, poleH - 0.8, 0);
  flagMesh.castShadow = true;
  flagMesh.userData.basePos = basePos;
  group.add(flagMesh);

  return { group, flagMesh };
}

function createBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  for (const sx of [-0.6, 0.6]) {
    g.add(box([0.14, 0.4, 0.42], "#d2cbc0", [sx, 0.2, 0]));
  }
  g.add(
    box([1.6, 0.09, 0.44], "#c2baa9", [0, 0.43, 0.02]),
    box([1.6, 0.36, 0.08], "#c2baa9", [0, 0.66, -0.17]),
  );
  return g;
}

function createMonumentBust(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "nguyen-chi-dieu-monument";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const blackGranite = mat("#232528", 0.35, 0.12);
  const bronzeMat = mat("#8a6835", 0.38, 0.65);

  // Stepped dark marble plinth & inscribed base matching photo
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.22, 1.25), blackGranite);
  step.position.y = 0.11;
  const pedestal = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 1.48, 0.82),
    blackGranite,
  );
  pedestal.position.y = 0.96;
  const cap = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.12, 0.92), blackGranite);
  cap.position.y = 1.76;

  // Name plaque
  const plaqueTex = createCanvasTexture(512, 192, (ctx, w, h) => {
    ctx.fillStyle = "#191c1f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d9b45a";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#ffd970";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("NGUYỄN CHÍ DIỂU", w / 2, h * 0.42);
    ctx.fillStyle = "#f2e7c4";
    ctx.font = "600 26px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("1908 – 1939", w / 2, h * 0.72);
  });
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.76, 0.32),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: plaqueTex,
      roughness: 0.4,
    }),
  );
  plaque.position.set(0, 1.18, 0.42);

  // Bronze shoulder bust + sculpted head
  const shoulders = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.42, 0.34),
    bronzeMat,
  );
  shoulders.position.y = 2.02;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), bronzeMat);
  head.position.y = 2.42;
  head.scale.set(0.9, 1.1, 0.95);

  g.add(step, pedestal, cap, plaque, shoulders, head);

  // Flanking round trimmed potted shrubs matching photo
  const potMat = mat("#dcd4c6", 0.78);
  const shrubMat = mat("#2e662b", 0.85);
  for (const sx of [-1.2, 1.2]) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.22, 0.42, 10),
      potMat,
    );
    pot.position.set(sx, 0.21, 0.15);
    const bush1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 1), shrubMat);
    bush1.position.set(sx, 0.72, 0.15);
    const bush2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 1), shrubMat);
    bush2.position.set(sx, 1.18, 0.15);
    g.add(pot, bush1, bush2);
  }
  return g;
}

function createBasketballHoop(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "nguyen-chi-dieu-basketball-hoop";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const skyBlue = mat("#1588d8", 0.38, 0.35);
  const darkMetal = mat("#24303a", 0.45, 0.65);

  // Heavy blue steel rolling pedestal base
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.65, 1.75), skyBlue);
  base.position.set(0, 0.325, -0.5);
  base.castShadow = true;

  // Angled blue truss column leaning toward court (+z)
  const col = new THREE.Mesh(new THREE.BoxGeometry(0.22, 2.95, 0.22), skyBlue);
  col.position.set(0, 1.9, -0.2);
  col.rotation.x = 0.26;
  col.castShadow = true;

  const boom = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 1.25), skyBlue);
  boom.position.set(0, 3.12, 0.48);

  // Crisp white framed glass/acrylic backboard + red shooter square + rim
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(1.78, 1.15, 0.08),
    mat("#f6f7f9", 0.3, 0.05),
  );
  board.position.set(0, 3.32, 1.12);
  board.castShadow = true;

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.028, 8, 18),
    mat("#ea5322", 0.42, 0.3),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.05, 1.38);

  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(0.23, 0.13, 0.38, 12, 1, true),
    mat("#f5f5f5", 0.85, 0, { side: THREE.DoubleSide }),
  );
  net.position.set(0, 2.86, 1.38);

  // Subtle strut braces
  const brace = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.9), darkMetal);
  brace.position.set(0, 2.75, 0.35);
  brace.rotation.x = -0.55;

  g.add(base, col, boom, board, rim, net, brace);
  return g;
}

function buildShuttlecock() {
  const root = new THREE.Group();
  root.name = "da-cau-shuttlecock";

  // Rubber weighted base disc + brass washer + short plastic stalk
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.028, 14),
    mat("#22252a", 0.72),
  );
  const washer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.044, 0.032, 14),
    mat("#ebc346", 0.28, 0.7),
  );
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.02, 0.09, 8),
    mat("#e83d58", 0.5),
  );
  stem.position.y = 0.05;
  root.add(disc, washer, stem);

  // Bright colorful traditional Vietnamese đá cầu feathers
  const featherColors = ["#ff3f80", "#ffd633", "#2ec8ff", "#ff7c38", "#6be052"];
  for (let i = 0; i < featherColors.length; i++) {
    const fPivot = new THREE.Group();
    fPivot.rotation.y = (i * Math.PI * 2) / featherColors.length;
    const feather = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.19, 0.012),
      new THREE.MeshStandardMaterial({
        color: featherColors[i],
        roughness: 0.48,
        emissive: featherColors[i],
        emissiveIntensity: 0.18,
      }),
    );
    feather.position.set(0, 0.16, 0.048);
    feather.rotation.x = 0.38;
    fPivot.add(feather);
    root.add(fPivot);
  }
  return root;
}

function buildDaCauCircle({ parent, center, radius = 1.85, groundY = 0.3, phaseOffset = 0, scale = 1.0 }) {
  const group = new THREE.Group();
  group.name = "nguyen-chi-dieu-da-cau";
  group.position.set(center.x, groundY, center.z);

  // Crisp subtle chalk circle marking the kicking ring
  const ringMark = new THREE.Mesh(
    new THREE.RingGeometry(radius - 0.06, radius + 0.04, 32),
    new THREE.MeshStandardMaterial({
      color: "#f5efe0",
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  ringMark.rotation.x = -Math.PI / 2;
  ringMark.position.y = 0.015;
  group.add(ringMark);

  const members = [
    { gender: "boy", angle: 0.35 },
    { gender: "girl", angle: Math.PI * 0.5 + 0.35 },
    { gender: "boy", angle: Math.PI + 0.35 },
    { gender: "girl", angle: Math.PI * 1.5 + 0.35 },
  ];

  const players = members.map((m, idx) => {
    const rig = buildChibiActor(m.gender);
    rig.actor.name = `da-cau-player-${idx}`;
    rig.actor.scale.setScalar(scale);
    const px = Math.cos(m.angle) * radius;
    const pz = Math.sin(m.angle) * radius;
    rig.actor.position.set(px, 0, pz);
    const baseYaw = Math.atan2(-px, -pz);
    rig.actor.rotation.y = baseYaw;
    group.add(rig.actor);

    const kickOffset = 0.42;
    return {
      idx,
      rig,
      baseYaw,
      px,
      pz,
      hitX: px + Math.sin(baseYaw) * kickOffset,
      hitZ: pz + Math.cos(baseYaw) * kickOffset,
      useRightLeg: idx % 2 === 0,
    };
  });

  const shuttlecock = buildShuttlecock();
  shuttlecock.scale.setScalar(1.25);
  shuttlecock.position.set(0, 0.9, 0);
  group.add(shuttlecock);

  const shuttleShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 14),
    new THREE.MeshBasicMaterial({
      color: "#2a2b2e",
      transparent: true,
      opacity: 0.32,
    }),
  );
  shuttleShadow.rotation.x = -Math.PI / 2;
  shuttleShadow.position.y = 0.02;
  group.add(shuttleShadow);

  parent.add(group);

  // Criss-cross kick rally order: 0 -> 2 -> 1 -> 3 -> 0
  const rallyOrder = [0, 2, 1, 3];
  const passDuration = 0.95;

  const update = (time = 0) => {
    const cycleTime = Math.max(0, time + phaseOffset);
    const stepFloat = cycleTime / passDuration;
    const stepIdx = Math.floor(stepFloat);
    const u = stepFloat - stepIdx; // 0..1 within current shuttlecock flight

    const fromPlayerIdx = rallyOrder[stepIdx % rallyOrder.length];
    const toPlayerIdx = rallyOrder[(stepIdx + 1) % rallyOrder.length];
    const nextToPlayerIdx = rallyOrder[(stepIdx + 2) % rallyOrder.length];

    const fromP = players[fromPlayerIdx];
    const toP = players[toPlayerIdx];

    // Parabolic flight arc from kicker instep -> peak -> receiver instep
    const sx = fromP.hitX + (toP.hitX - fromP.hitX) * u;
    const sz = fromP.hitZ + (toP.hitZ - fromP.hitZ) * u;
    const arcHeight = 1.65;
    const contactY = 0.36 * scale;
    const sy = contactY + 4 * arcHeight * u * (1 - u);

    shuttlecock.position.set(sx, sy, sz);
    const dx = toP.hitX - fromP.hitX;
    const dz = toP.hitZ - fromP.hitZ;
    const moveYaw = Math.atan2(dx, dz);
    const vyNorm = (1 - 2 * u) * 0.95;
    shuttlecock.rotation.set(vyNorm, moveYaw + cycleTime * 7.5, Math.sin(cycleTime * 11) * 0.14);

    shuttleShadow.position.set(sx, 0.02, sz);
    const shadowScale = Math.max(0.45, 1.15 - sy * 0.28);
    shuttleShadow.scale.setScalar(shadowScale);

    // Animate all 4 student Chibi rigs
    for (const p of players) {
      const char = p.rig.character;
      const isKicker = p.idx === toPlayerIdx;
      const isFollowThrough = p.idx === fromPlayerIdx && u < 0.32;
      const isAnticipating = p.idx === nextToPlayerIdx && u > 0.55;

      // Kick intensity envelope peaking right as shuttlecock hits receiver's foot (u near 0.92..1.0 or follow-through)
      let kickStrength = 0;
      if (isKicker && u > 0.62) {
        const k = (u - 0.62) / 0.38;
        kickStrength = Math.sin(Math.min(1, k) * Math.PI * 0.65);
      } else if (isFollowThrough) {
        const k = 1 - u / 0.32;
        kickStrength = k * 0.85;
      }

      const bouncePhase = cycleTime * 5.2 + p.idx * 1.4;
      const readyHop = Math.abs(Math.sin(bouncePhase)) * (isAnticipating ? 0.045 : 0.022);
      const liftHop = kickStrength * 0.055;

      char.bodyPivot.position.set(0, char.baseBodyY + readyHop + liftHop, 0);
      char.bodyPivot.rotation.set(0, 0, 0);

      // Subtle lean toward shuttlecock + head tracking
      const trackYaw = Math.atan2(sx - p.px, sz - p.pz) - p.baseYaw;
      const clampedTrack = Math.max(-0.55, Math.min(0.55, trackYaw));
      p.rig.actor.rotation.y = p.baseYaw + clampedTrack * 0.45;
      char.torsoPivot.rotation.set(
        -kickStrength * 0.22 + 0.06,
        clampedTrack * 0.2,
        kickStrength * (p.useRightLeg ? -0.14 : 0.14),
      );
      char.headPivot.rotation.set(
        Math.min(0.35, Math.max(-0.25, (sy - 1.1) * 0.22)),
        clampedTrack * 0.5,
        0,
      );

      // Active kicking leg vs planted leg
      const kickLeg = p.useRightLeg ? char.rightLeg : char.leftLeg;
      const plantLeg = p.useRightLeg ? char.leftLeg : char.rightLeg;
      const legSign = p.useRightLeg ? 1 : -1;

      if (kickStrength > 0.01) {
        kickLeg.rotation.set(
          -1.15 * kickStrength,
          legSign * 0.35 * kickStrength,
          legSign * 0.55 * kickStrength,
        );
        kickLeg.shin.rotation.set(0.68 * kickStrength, 0, -legSign * 0.42 * kickStrength);
        plantLeg.rotation.set(0.08 * kickStrength, 0, -legSign * 0.05);
        plantLeg.shin.rotation.set(0.12 * kickStrength, 0, 0);
      } else {
        const kneeBounce = Math.sin(bouncePhase) * 0.08;
        char.leftLeg.rotation.set(-0.08 + kneeBounce, 0, 0.05);
        char.rightLeg.rotation.set(-0.08 - kneeBounce, 0, -0.05);
        char.leftLeg.shin.rotation.set(0.14 + Math.max(0, kneeBounce), 0, 0);
        char.rightLeg.shin.rotation.set(0.14 + Math.max(0, -kneeBounce), 0, 0);
      }

      // Arms flare naturally for balance during kicks
      const armFlare = 0.24 + kickStrength * 0.72 + Math.sin(bouncePhase) * 0.06;
      char.leftArm.rotation.set(-0.22 - kickStrength * 0.45, 0, armFlare);
      char.rightArm.rotation.set(-0.22 - kickStrength * 0.45, 0, -armFlare);
      char.leftArm.forearm.rotation.set(-0.45, 0, 0);
      char.rightArm.forearm.rotation.set(-0.45, 0, 0);

      // Dynamic pioneer scarf & pigtail bounce
      const scarfSwing = 0.14 + kickStrength * 0.25 + Math.abs(Math.sin(bouncePhase)) * 0.06;
      char.scarfTailL.rotation.x = scarfSwing;
      char.scarfTailR.rotation.x = scarfSwing;
      if (char.hairPigtailL) {
        char.hairPigtailL.rotation.x = scarfSwing * 1.1;
        char.hairPigtailR.rotation.x = scarfSwing * 1.1;
      }
    }
  };

  update(0);
  return { group, shuttlecock, players, update };
}

export class NguyenChiDieuCampus {
  constructor(world, site, gatePlacement) {
    this.world = world;
    this.site = site;
    const cfg = dongDaCampuses["nguyen-chi-dieu"];
    this.campusRings = [cfg.ring];
    this.buildingIds = cfg.buildings || [732304130, 732304131, 1416873568];
    this.gate = { x: gatePlacement.x, z: gatePlacement.z };
    this.facingGateYaw = gatePlacement.heading;
    this.fwdVec = {
      x: -Math.sin(this.facingGateYaw),
      z: -Math.cos(this.facingGateYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "nguyen-chi-dieu-campus";
    this.flags = [];
    this.animatedObjects = [];
    this.daCauMatches = [];
    this.campusBuildingPolygons = [];
    this.obstacles = [];

    this.buildCourtyard();
    this.buildBuildings();
    this.buildRearPassageAndYard();
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

  buildCourtyard() {
    const yardTex = createSchoolyardStripedTileTexture();
    const flagTex = createVietnamFlagTexture();

    const yardMat = new THREE.MeshStandardMaterial({
      color: yardTex ? "#ffffff" : "#c7b2ab",
      map: yardTex,
      roughness: 0.84,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const pathPaveMat = mat("#c6c2b8", 0.86);
    const lawnMat = createManicuredLawnMaterial(6, 6, {
      striped: false,
      rich: true,
    });

    // Paved red-and-grey striped schoolyard matching entire campus polygon
    const yardGeo = polygonGeometry(this.campusRings[0], 0.14);
    const yardMesh = new THREE.Mesh(yardGeo, yardMat);
    yardMesh.position.y = 0.16;
    yardMesh.receiveShadow = true;
    this.group.add(yardMesh);

    const yard = new THREE.Group();
    yard.name = "nguyen-chi-dieu-front-courtyard";
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    // Entry plaza drive connecting Đống Đa gate directly into the courtyard
    const entryDrive = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 0.045, 22),
      pathPaveMat,
    );
    entryDrive.position.set(0, 0.295, -10.5);
    entryDrive.receiveShadow = true;
    yard.add(entryDrive);

    // Side garden beds flanking the gate interior
    for (const [lx, lz, w, d] of [
      [-15.5, -5.0, 9.5, 4.0],
      [14.2, -5.0, 11.5, 4.0],
    ]) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), lawnMat);
      bed.position.set(lx, 0.29, lz);
      bed.receiveShadow = true;
      yard.add(bed);
    }

    // Subtle white basketball court lines in front-right yard (matching photo)
    const courtMat = mat("#f6f2e8", 0.9);
    yard.add(
      box([9.2, 0.015, 0.12], "#f6f2e8", [4.8, 0.308, -23.0]),
      box([9.2, 0.015, 0.12], "#f6f2e8", [4.8, 0.308, -31.8]),
      box([0.12, 0.015, 8.8], "#f6f2e8", [0.2, 0.308, -27.4]),
      box([0.12, 0.015, 8.8], "#f6f2e8", [9.4, 0.308, -27.4]),
    );

    // Ceremonial flagpole on the left-front of the main block (visible upon entering gate)
    const fp = createFlagpole(-12.2, 0.3, -19.8, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);
    this.obstacles.push({ side: -12.2, fwd: 19.8, radius: 1.15 });

    // Nguyễn Chí Diểu bust monument & potted shrubs centered along front facade
    const pFrontA = this.toWorld(-18.15, 23.75);
    const pFrontB = this.toWorld(17.9, 41.06);
    const fdx = pFrontB.x - pFrontA.x;
    const fdz = pFrontB.z - pFrontA.z;
    let fnx = -fdz;
    let fnz = fdx;
    if ((this.gate.x - (pFrontA.x + pFrontB.x) / 2) * fnx + (this.gate.z - (pFrontA.z + pFrontB.z) / 2) * fnz < 0) {
      fnx = -fnx;
      fnz = -fnz;
    }
    const frontCenterAngle = Math.atan2(fnx, fnz);
    const monument = createMonumentBust(-2.2, 0.3, -29.2, frontCenterAngle - this.facingGateYaw);
    yard.add(monument);
    this.obstacles.push({ side: -2.2, fwd: 29.2, radius: 1.65 });

    // Portable blue basketball hoop (right side of main courtyard, clear of passage!)
    const hoop = createBasketballHoop(9.6, 0.3, -31.6, frontCenterAngle - this.facingGateYaw - 0.15);
    yard.add(hoop);
    this.obstacles.push({ side: 9.6, fwd: 31.6, radius: 1.4 });

    // Green wooden school bulletin board near left porch steps
    const boardGroup = new THREE.Group();
    boardGroup.position.set(-14.2, 0.3, -23.4);
    boardGroup.rotation.y = frontCenterAngle - this.facingGateYaw;
    boardGroup.add(
      box([0.12, 1.9, 0.12], "#1f5a38", [-1.3, 0.95, 0]),
      box([0.12, 1.9, 0.12], "#1f5a38", [1.3, 0.95, 0]),
    );
    const boardTex = createGreenNoticeBoardTexture();
    const boardPanel = new THREE.Mesh(
      new THREE.BoxGeometry(2.75, 1.38, 0.1),
      new THREE.MeshStandardMaterial({
        color: boardTex ? "#ffffff" : "#1a523e",
        map: boardTex,
        roughness: 0.65,
      }),
    );
    boardPanel.position.y = 1.45;
    boardGroup.add(boardPanel);
    yard.add(boardGroup);
    this.obstacles.push({ side: -14.2, fwd: 23.4, radius: 1.25 });

    // Stone benches in front & rear yards (all clear of walkways)
    const benchSpecs = [
      [-10.2, 10.0, Math.PI * 0.25],
      [14.2, 10.8, -Math.PI * 0.3],
      [21.6, 62.0, -Math.PI * 0.5],
      [21.6, 82.0, -Math.PI * 0.5],
      [9.5, 55.2, 0],
    ];
    for (const [bx, bf, yaw] of benchSpecs) {
      yard.add(createBench(bx, 0.3, -bf, yaw));
      this.obstacles.push({ side: bx, fwd: bf, radius: 1.05 });
    }

    this.group.add(yard);
  }

  buildBuildings() {
    const wallTex3 = createGoldenSchoolWallTexture(3);
    const wallTex2 = createGoldenSchoolWallTexture(2);
    const roofTex = createTerracottaRoofTexture();

    const makeWallMat = (tex) =>
      new THREE.MeshStandardMaterial({
        color: tex ? "#ffffff" : "#f0cb5c",
        map: tex,
        roughness: 0.74,
        metalness: 0.04,
      });
    const wallMat3 = makeWallMat(wallTex3);
    const wallMat2 = makeWallMat(wallTex2);

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#ad3f28",
      map: roofTex,
      roughness: 0.68,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const trimMat = mat("#faf6e9", 0.72);
    const cornices = [];
    const midBands = [];
    const colonnadeParts = [];

    for (const id of this.buildingIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.campusBuildingPolygons.push(pts);

      const isMain = id === 732304130;
      const isRearMain = id === 1416873568;
      const wallHeight = isMain ? 10.6 : isRearMain ? 7.4 : 6.9;

      const bodyGeo = polygonGeometry(pts, wallHeight);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          const px = pos.getX(i);
          const py = pos.getY(i);
          const pz = pos.getZ(i);
          uv.setXY(i, (px + pz) / 9.2, py / wallHeight);
        }
      }
      const bodyMesh = new THREE.Mesh(bodyGeo, isMain ? wallMat3 : wallMat2);
      bodyMesh.position.y = 0.28;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);

      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const len = Math.hypot(b.x - a.x, b.z - a.z);
        if (len < 2.5) continue;
        const yaw = Math.atan2(b.x - a.x, b.z - a.z) - Math.PI / 2;
        const mx = (a.x + b.x) / 2;
        const mz = (a.z + b.z) / 2;
        const matRot = new THREE.Matrix4()
          .makeRotationY(yaw)
          .setPosition(mx, 0.28, mz);

        const topCornice = new THREE.BoxGeometry(len + 0.4, 0.3, 0.5);
        topCornice.translate(0, wallHeight - 0.1, 0);
        topCornice.applyMatrix4(matRot);
        cornices.push(topCornice);

        for (const bandH of isMain ? [3.5, 7.0] : [3.5]) {
          const band = new THREE.BoxGeometry(len + 0.24, 0.22, 0.36);
          band.translate(0, bandH, 0);
          band.applyMatrix4(matRot);
          midBands.push(band);
        }
      }

      // Fit roofs cleanly without hanging awkwardly over L-wing courtyard notches
      if (isMain) {
        // Exact outward courtyard normal for main facade (-18.15,23.75 -> 17.90,41.06)
        const pFA = this.toWorld(-18.15, 23.75);
        const pFB = this.toWorld(17.9, 41.06);
        const fdx = pFB.x - pFA.x;
        const fdz = pFB.z - pFA.z;
        let fnx = -fdz;
        let fnz = fdx;
        if ((this.gate.x - (pFA.x + pFB.x) / 2) * fnx + (this.gate.z - (pFA.z + pFB.z) / 2) * fnz < 0) {
          fnx = -fnx;
          fnz = -fnz;
        }
        const frontAxisYaw = Math.atan2(fnx, fnz);

        // Left rectangular wing + long front-facing diagonal 3-story wing
        const pLeftCenter = this.toWorld(-29.4, 17.4);
        const leftRoof = createHipRoofMesh(15.2, 24.4, 2.2, roofMat);
        leftRoof.position.set(pLeftCenter.x, 0.28 + wallHeight, pLeftCenter.z);
        leftRoof.rotation.y = this.facingGateYaw + Math.PI * 0.5;
        this.group.add(leftRoof);

        const pFrontCenter = this.toWorld(-4.6, 36.5);
        const frontRoof = createHipRoofMesh(44.0, 12.6, 2.7, roofMat);
        frontRoof.position.set(pFrontCenter.x, 0.28 + wallHeight, pFrontCenter.z);
        frontRoof.rotation.y = frontAxisYaw;
        this.group.add(frontRoof);

        // Cream ground-floor verandah pillars & steps along main courtyard facade (-16,24.8 -> +16,40.2)
        for (let t = 0.08; t <= 0.94; t += 0.115) {
          const sSide = -17.5 + t * 34.5;
          const sFwd = 24.0 + t * 16.5 - 0.9;
          const pw = this.toWorld(sSide, sFwd);
          const col = new THREE.BoxGeometry(0.42, 3.35, 0.42);
          col.rotateY(frontAxisYaw);
          col.translate(pw.x, 0.28 + 1.68, pw.z);
          colonnadeParts.push(col);
        }

        // Royal-blue iconic facade banner: TRƯỜNG TRUNG HỌC CƠ SỞ NGUYỄN CHÍ DIỂU / THI ĐUA DẠY TỐT, HỌC TỐT
        const mainSignTex = createBlueBannerTexture(
          "TRƯỜNG TRUNG HỌC CƠ SỞ NGUYỄN CHÍ DIỂU",
          "THI ĐUA DẠY TỐT, HỌC TỐT",
        );
        const mainSign = new THREE.Mesh(
          new THREE.PlaneGeometry(11.4, 2.45),
          new THREE.MeshStandardMaterial({
            color: "#ffffff",
            map: mainSignTex,
            roughness: 0.45,
          }),
        );
        mainSign.name = "nguyen-chi-dieu-main-sign";
        const signPt = this.toWorld(-2.0, 29.8);
        mainSign.position.set(signPt.x, 4.95, signPt.z);
        mainSign.rotation.y = frontAxisYaw;
        this.group.add(mainSign);
      } else {
        const ob = orientedBounds(pts);
        const ridgeH = Math.min(2.8, ob.depth * 0.2 + 0.65);
        const roofObj = createHipRoofMesh(
          ob.length + 0.9,
          ob.depth + 0.9,
          ridgeH,
          roofMat,
        );
        roofObj.position.set(ob.cx, 0.28 + wallHeight, ob.cz);
        roofObj.rotation.y = ob.yaw;
        this.group.add(roofObj);

        if (isRearMain) {
          // East-facing verandah columns & royal-blue school banner on Rear Building facing rear yard!
          const pRA = this.toWorld(2.13, 63.99);
          const pRB = this.toWorld(12.04, 89.37);
          const rdx = pRB.x - pRA.x;
          const rdz = pRB.z - pRA.z;
          const rearYardPt = this.toWorld(18, 76);
          let rnx = -rdz;
          let rnz = rdx;
          if ((rearYardPt.x - (pRA.x + pRB.x) / 2) * rnx + (rearYardPt.z - (pRA.z + pRB.z) / 2) * rnz < 0) {
            rnx = -rnx;
            rnz = -rnz;
          }
          const rearFaceYaw = Math.atan2(rnx, rnz);

          for (let t = 0.1; t <= 0.92; t += 0.16) {
            const rs = 2.6 + t * 9.8 + 0.55;
            const rf = 64.5 + t * 25.0 - 0.25;
            const rw = this.toWorld(rs, rf);
            const col = new THREE.BoxGeometry(0.38, 3.35, 0.38);
            col.rotateY(rearFaceYaw);
            col.translate(rw.x, 0.28 + 1.68, rw.z);
            colonnadeParts.push(col);
          }

          const rearBannerTex = createBlueBannerTexture(
            "THCS NGUYỄN CHÍ DIỂU · KHU PHÒNG HỌC B",
            "TIÊN HỌC LỄ · HẬU HỌC VĂN",
          );
          const rearBanner = new THREE.Mesh(
            new THREE.PlaneGeometry(8.2, 1.7),
            new THREE.MeshStandardMaterial({
              color: "#ffffff",
              map: rearBannerTex,
              roughness: 0.45,
            }),
          );
          rearBanner.name = "nguyen-chi-dieu-rear-building-sign";
          const bPt = this.toWorld(7.7, 76.4);
          rearBanner.position.set(bPt.x, 4.45, bPt.z);
          rearBanner.rotation.y = rearFaceYaw;
          this.group.add(rearBanner);
        }
      }
    }

    for (const batch of [cornices, midBands, colonnadeParts]) {
      if (!batch.length) continue;
      const m = new THREE.Mesh(mergeGeometries(batch), trimMat);
      m.castShadow = m.receiveShadow = true;
      this.group.add(m);
      batch.forEach((p) => p.dispose());
    }
  }

  buildRearPassageAndYard() {
    // Covered connecting corridor & open roadway between the 2 buildings leading out to the rear building and rear schoolyard
    const passageGroup = new THREE.Group();
    passageGroup.name = "nguyen-chi-dieu-rear-passage";
    passageGroup.position.set(this.gate.x, 0, this.gate.z);
    passageGroup.rotation.y = this.facingGateYaw;

    // 1) Crisp stone-bordered roadway from front yard (fwd 32) straight between the 2 buildings into the rear yard (fwd 92)
    const roadMat = mat("#c6c1b4", 0.85);
    const curbMat = mat("#ebe6d8", 0.8);
    const roadStrip = new THREE.Mesh(
      new THREE.BoxGeometry(4.9, 0.05, 58),
      roadMat,
    );
    roadStrip.position.set(20.55, 0.295, -62.0);
    roadStrip.receiveShadow = true;
    passageGroup.add(roadStrip);

    // Cross walkway connecting behind main building (fwd 57) between Building 1, Building 2, and Building 3
    const crossRoad = new THREE.Mesh(
      new THREE.BoxGeometry(27.0, 0.048, 7.6),
      roadMat,
    );
    crossRoad.position.set(6.5, 0.295, -57.2);
    crossRoad.receiveShadow = true;
    passageGroup.add(crossRoad);

    // White-cream edge curbs guiding eye from front yard into the rear corridor
    for (const cx of [18.0, 23.1]) {
      const curb = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.08, 56),
        curbMat,
      );
      curb.position.set(cx, 0.31, -62.0);
      passageGroup.add(curb);
    }

    // 2) Covered breezeway portico standing cleanly at the entry of the between-buildings passage
    const archFwd = -44.2;
    const archLeftSide = 18.0;
    const archRightSide = 23.1;
    const archCenterSide = (archLeftSide + archRightSide) / 2;
    const archSpan = archRightSide - archLeftSide;

    const colMat = mat("#f0cb5c", 0.76);
    const capMat = mat("#faf6e9", 0.72);
    for (const sx of [archLeftSide, archRightSide]) {
      for (const sz of [archFwd - 1.5, archFwd + 1.5]) {
        const pillar = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 4.1, 0.42),
          colMat,
        );
        pillar.position.set(sx, 2.32, sz);
        pillar.castShadow = true;
        passageGroup.add(pillar);
        this.obstacles.push({ side: sx, fwd: -sz, radius: 0.48 });
      }
    }

    // Overhead cream-yellow canopy roof slab (clear height >= 4.2m)
    const canopyRoof = new THREE.Mesh(
      new THREE.BoxGeometry(archSpan + 1.2, 0.36, 4.4),
      colMat,
    );
    canopyRoof.position.set(archCenterSide, 4.55, archFwd);
    canopyRoof.castShadow = true;
    const canopyTrim = new THREE.Mesh(
      new THREE.BoxGeometry(archSpan + 1.5, 0.18, 4.65),
      capMat,
    );
    canopyTrim.position.set(archCenterSide, 4.78, archFwd);
    passageGroup.add(canopyRoof, canopyTrim);

    // Royal-blue overhead passage banner matching photo: "CHẤT LƯỢNG LÀ DANH DỰ CỦA NHÀ TRƯỜNG"
    const passBannerTex = createBlueBannerTexture(
      null,
      "CHẤT LƯỢNG LÀ DANH DỰ CỦA NHÀ TRƯỜNG",
    );
    const frontBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(archSpan + 0.5, 0.88),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: passBannerTex,
        roughness: 0.45,
      }),
    );
    frontBanner.name = "nguyen-chi-dieu-passage-banner";
    frontBanner.position.set(archCenterSide, 4.28, archFwd + 2.24);
    const backBanner = frontBanner.clone();
    backBanner.position.set(archCenterSide, 4.28, archFwd - 2.24);
    backBanner.rotation.y = Math.PI;
    passageGroup.add(frontBanner, backBanner);

    // 3) Rear schoolyard distinct court markings & flower bed borders around Rear Building 3
    const rearYard = new THREE.Group();
    rearYard.name = "nguyen-chi-dieu-rear-yard";
    const lawnMat = createManicuredLawnMaterial(4, 4, {
      striped: false,
      rich: true,
    });
    const rearBed = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.14, 3.2), lawnMat);
    rearBed.position.set(17.5, 0.3, -93.8);
    rearBed.receiveShadow = true;
    rearYard.add(rearBed);
    passageGroup.add(rearYard);

    this.group.add(passageGroup);
  }

  buildGreenery() {
    // Ancient centerpiece tree (with circular bench ring matching photo) + shade trees in front & rear yards
    const candidateSpecs = [
      // Giant spreading ancient tree on right-front yard beside basketball hoop & passage entrance
      [11.4, 21.8, 1.72, true],
      [-14.8, 7.2, 1.4, false],
      [16.2, 8.8, 1.38, false],
      [-23.5, 4.2, 1.35, false],
      [-7.2, 20.8, 1.28, false],
      [22.0, 29.0, 1.35, false],
      // Rear schoolyard & passage shade trees
      [12.8, 53.6, 1.36, false],
      [-10.8, 53.5, 1.32, false],
      [22.4, 66.5, 1.36, false],
      [14.2, 89.2, 1.38, false],
      [-8.5, 89.5, 1.34, false],
    ];

    candidateSpecs.forEach(([side, fwd, scale, ancient], idx) => {
      const w = this.toWorld(side, fwd);
      if (!this.inCampus(w.x, w.z)) return;
      const hitsBuilding = this.campusBuildingPolygons.some(
        (poly) =>
          inside(w, poly) || nearestPoint(w, poly).distance < 2.6,
      );
      if (hitsBuilding) return;

      const planterR = ancient ? 1.85 : 1.05;
      const planter = new THREE.Mesh(
        new THREE.CylinderGeometry(planterR, planterR + 0.08, 0.28, 16),
        mat("#e5dfd2", 0.8),
      );
      planter.position.set(w.x, 0.34, w.z);
      this.group.add(planter);

      if (ancient) {
        const seatRing = new THREE.Mesh(
          new THREE.CylinderGeometry(planterR + 0.34, planterR + 0.34, 0.36, 18, 1, true),
          mat("#c8c1b4", 0.78, 0.02, { side: THREE.DoubleSide }),
        );
        seatRing.position.set(w.x, 0.36, w.z);
        this.group.add(seatRing);
      }

      this.obstacles.push({ side, fwd, radius: planterR + 0.25 });
      this.group.add(createBroadShadeTree(w.x, 0.3, w.z, scale, idx + 1, ancient));
    });
  }

  buildStudents() {
    // 1) Animated Đá Cầu (Shuttlecock Kicking) student circles:
    //    - Featured group in the Rear Schoolyard right beside Rear Building & down the passage
    //    - Welcome group in the Front Schoolyard immediately visible upon entering the gate
    const daCauSpots = [
      { side: 14.0, fwd: 74.2, radius: 1.85, phaseOffset: 0.0 },
      { side: -5.4, fwd: 12.6, radius: 1.75, phaseOffset: 0.48 },
    ];
    for (const spot of daCauSpots) {
      const w = this.toWorld(spot.side, spot.fwd);
      if (!this.inCampus(w.x, w.z)) continue;
      const match = buildDaCauCircle({
        parent: this.group,
        center: w,
        radius: spot.radius,
        groundY: 0.3,
        phaseOffset: spot.phaseOffset,
        scale: 1.0,
      });
      this.daCauMatches.push(match);
      this.animatedObjects.push(match.group);
      this.obstacles.push({
        side: spot.side,
        fwd: spot.fwd,
        radius: spot.radius + 0.55,
      });
    }

    // 2) Walking & chatting Chibi students circulating both front yard, rear passage, and rear yard
    const isWalkSafe = (side, fwd) => {
      const w = this.toWorld(side, fwd);
      return (
        this.inCampus(w.x, w.z) &&
        !this.campusBuildingPolygons.some(
          (poly) => inside(w, poly) || nearestPoint(w, poly).distance < 1.15,
        )
      );
    };

    const walkers = [
      { gender: "girl", points: [[-1.8, 3.5], [-1.8, 19.5]], speed: 1.28, offset: 0.1 },
      { gender: "boy", points: [[2.0, 20.0], [2.0, 4.0]], speed: 1.34, offset: 0.45 },
      // Walking right through the covered between-buildings passage into the rear yard!
      { gender: "girl", points: [[19.2, 26], [19.2, 58], [13.5, 58]], speed: 1.3, offset: 0.18 },
      { gender: "boy", points: [[20.2, 86], [20.2, 42]], speed: 1.32, offset: 0.62 },
      { gender: "boy", points: [[13.0, 62], [-2.5, 62]], speed: 1.26, offset: 0.35 },
      { gender: "girl", points: [[13.5, 84], [19.5, 84]], speed: 1.22, offset: 0.55 },
    ].filter((w) => w.points.every(([s, f]) => isWalkSafe(s, f)));

    const chatSpots = [
      { side: 6.2, fwd: 15.8, members: ["boy", "girl", "boy"], radius: 0.85 },
      { side: -14.8, fwd: 14.5, members: ["girl", "boy"], radius: 0.8 },
      { side: 10.6, fwd: 59.5, members: ["girl", "boy", "girl"], radius: 0.85 },
    ].filter((c) => isWalkSafe(c.side, c.fwd));

    this.students = new CampusStudents({
      parent: this.group,
      toWorld: (side, fwd) => this.toWorld(side, fwd),
      groundAt: () => 0.3,
      walkers,
      chatSpots,
    });
    this.animatedObjects.push(...this.students.animatedObjects);
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    return 0.3;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    if (this.campusBuildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
    const { side, fwd } = this.toLocal(wx, wz);
    if (
      this.obstacles.some(
        (o) => Math.hypot(side - o.side, fwd - o.fwd) < o.radius,
      )
    ) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCampus(wx, wz);
  }

  blocksTree(wx, wz) {
    return this.inCampus(wx, wz);
  }

  update(time, playerPos = null) {
    for (const flag of this.flags) {
      const pos = flag.geometry.attributes.position;
      const base = flag.userData.basePos;
      if (!pos || !base) continue;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const u = Math.min(1, Math.max(0, bx / 2.55));
        const wave =
          Math.sin(u * 4.5 - time * 3.8) * 0.18 * u +
          Math.sin(u * 8.0 - time * 5.6 + by * 0.6) * 0.06 * u;
        const droop = -0.14 * u * u + Math.sin(time * 2.1 + u * 2) * 0.03 * u;
        pos.setZ(i, base[i * 3 + 2] + wave);
        pos.setY(i, by + droop);
      }
      pos.needsUpdate = true;
      flag.geometry.computeVertexNormals();
    }
    for (const match of this.daCauMatches) {
      if (playerPos) {
        const dx = match.group.position.x - playerPos.x;
        const dz = match.group.position.z - playerPos.z;
        const visible = dx * dx + dz * dz <= 14400;
        match.group.visible = visible;
        if (!visible) continue;
      } else {
        match.group.visible = true;
      }
      match.update(time);
    }
    this.students?.update(time, playerPos);
  }
}
