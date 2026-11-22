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
import {
  applyWorldPlanarUVs,
  createManicuredLawnMaterial,
} from "../../../../core/world/turfTextures.js";
import { CampusStudents } from "../../../../core/world/CampusStudents.js";

const QUOC_HOC_STATUE_NODE_ID = 13516238185;
const FALLBACK_STATUE = { x: 585.9926923575766, z: -374.803926445244 };

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
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      // Deep Quốc Học crimson stucco
      ctx.fillStyle = "#982a32";
      ctx.fillRect(0, 0, w, h);

      // Subtle plaster variation
      for (let i = 0; i < 420; i++) {
        const x = (i * 193) % w;
        const y = (i * 317) % h;
        ctx.fillStyle =
          i % 2 ? "rgba(255,220,215,0.04)" : "rgba(45,8,12,0.06)";
        ctx.fillRect(x, y, 8, 5);
      }

      // Rusticated split-stone foundation plinth along bottom (lower ~14%)
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
      // Crisp white stone-cap string course above plinth & mid-floor band
      ctx.fillStyle = "#eee6d8";
      ctx.fillRect(0, h - 76, w, 8);
      ctx.fillRect(0, h / 2 - 22, w, 10);
      ctx.fillRect(0, 0, w, 14);

      // Two stories of French-colonial arched/shuttered dark-wood windows
      for (const floorY of [48, 256]) {
        for (const wx of [44, 212, 380]) {
          // White pilaster quoin dashes between bays
          ctx.fillStyle = "rgba(244,237,225,0.88)";
          for (let q = 0; q < 5; q++) {
            ctx.fillRect(wx - 28, floorY + 8 + q * 30, 14, 5);
          }
          // White window hood & sill
          ctx.fillStyle = "#f2ebe0";
          ctx.fillRect(wx - 8, floorY - 12, 104, 14);
          ctx.fillRect(wx - 6, floorY + 138, 100, 10);
          // White window surround
          ctx.fillStyle = "#ece4d6";
          ctx.fillRect(wx - 4, floorY, 96, 138);
          // Deep recessed dark-wood louvered shutters
          ctx.fillStyle = "#3c2217";
          ctx.fillRect(wx + 4, floorY + 8, 80, 126);
          // Central vertical shutter mullion & louver slats
          ctx.fillStyle = "#5c3624";
          ctx.fillRect(wx + 42, floorY + 8, 4, 126);
          ctx.fillStyle = "#2b160e";
          for (let sy = floorY + 14; sy < floorY + 130; sy += 9) {
            ctx.fillRect(wx + 7, sy, 32, 3);
            ctx.fillRect(wx + 49, sy, 32, 3);
          }
        }
      }
    },
    1,
    1,
  );
}

function createTerracottaTileRoofTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#b9462d";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#c95337";
        ctx.fillRect(x + 2, 0, 11, h);
        ctx.fillStyle = "#91321e";
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

function createCourtyardStoneTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#9b9a95";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1200; i++) {
        const x = (i * 197) % w;
        const y = (i * 331) % h;
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(70,68,64,0.12)" : "rgba(235,232,224,0.1)";
        ctx.fillRect(x, y, 3, 3);
      }
      ctx.strokeStyle = "rgba(115,112,106,0.22)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += 128) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
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
      ctx.strokeStyle = "rgba(92,45,32,0.34)";
      ctx.lineWidth = 1.5;
      for (let p = 0; p <= w; p += s) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
    },
    6,
    6,
  );
}

function createPedestalPlaqueTexture() {
  return createCanvasTexture(512, 160, (ctx, w, h) => {
    ctx.fillStyle = "#17191b";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#caa249";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f2ca68";
    ctx.font = "bold 42px 'Playfair Display', Georgia, serif";
    ctx.fillText("NGUYỄN TẤT THÀNH", w / 2, h * 0.46);
    ctx.fillStyle = "#d9bd79";
    ctx.font = "600 20px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("CHỦ TỊCH HỒ CHÍ MINH", w / 2, h * 0.76);
  });
}

function createMainHallCrestTexture() {
  return createCanvasTexture(1024, 224, (ctx, w, h) => {
    ctx.fillStyle = "#f2ecdf";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#982a32";
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = "#982a32";
    ctx.fillRect(46, 52, w - 92, 86);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#f7df9d";
    ctx.font = "bold 36px 'Playfair Display', Georgia, serif";
    ctx.fillText("HIỀN TÀI LÀ NGUYÊN KHÍ CỦA QUỐC GIA", w / 2, 95);
    ctx.fillStyle = "#982a32";
    ctx.font = "bold 28px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("TRƯỜNG THPT CHUYÊN QUỐC HỌC HUẾ · 1896", w / 2, 174);
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
    // Front slope
    -hl, 0, hd, hl, 0, hd, rx, ridgeHeight, 0,
    -hl, 0, hd, rx, ridgeHeight, 0, -rx, ridgeHeight, 0,
    // Back slope
    hl, 0, -hd, -hl, 0, -hd, -rx, ridgeHeight, 0,
    hl, 0, -hd, -rx, ridgeHeight, 0, rx, ridgeHeight, 0,
    // Left hip
    -hl, 0, -hd, -hl, 0, hd, -rx, ridgeHeight, 0,
    // Right hip
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
    // Side slopes along length
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

  // Triangular gable ends in crimson & white cornice
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-hd, 0);
  gableShape.lineTo(hd, 0);
  gableShape.lineTo(0, ridgeHeight);
  gableShape.closePath();
  const gableGeo = new THREE.ShapeGeometry(gableShape);
  for (const sx of [-1, 1]) {
    const gable = new THREE.Mesh(gableGeo, mat("#982a32", 0.8));
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

function createBonsaiPot(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const potMat = mat("#6b4a33", 0.68, 0.08);
  const potRimMat = mat("#8b6142", 0.62, 0.08);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.34, 0.46, 12),
    potMat,
  );
  pot.position.y = 0.23;
  pot.castShadow = pot.receiveShadow = true;
  const rim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.5, 0.1, 12),
    potRimMat,
  );
  rim.position.y = 0.48;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 1.4, 7),
    mat("#5e4632", 0.9),
  );
  trunk.position.y = 1.1;
  g.add(pot, rim, trunk);

  const greens = ["#2f662d", "#3a7834", "#46893e", "#539947"];
  const tiers = [
    [0.72, 0.62, 0.38],
    [1.12, 0.5, 0.35],
    [1.48, 0.38, 0.32],
    [1.79, 0.24, 0.28],
  ];
  tiers.forEach(([ty, r, h], idx) => {
    const tier = new THREE.Mesh(
      new THREE.ConeGeometry(r, h, 10),
      mat(greens[idx % greens.length], 0.85),
    );
    tier.position.y = ty;
    tier.castShadow = tier.receiveShadow = true;
    g.add(tier);
  });
  return g;
}

function createNguyenTatThanhStatue(plaqueTex) {
  const g = new THREE.Group();
  g.name = "nguyen-tat-thanh-monument";

  // Stepped dark polished granite pedestal
  const blackGranite = mat("#1d2023", 0.24, 0.16);
  const darkBase = mat("#2c3034", 0.45, 0.08);
  g.add(
    new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.24, 2.15), darkBase).translateY(0.12),
    new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.26, 1.72), darkBase).translateY(0.37),
  );
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(1.24, 1.88, 1.24),
    blackGranite,
  );
  plinth.position.y = 1.44;
  plinth.castShadow = plinth.receiveShadow = true;
  g.add(plinth);
  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.14, 1.38),
    blackGranite,
  );
  cap.position.y = 2.45;
  g.add(cap);

  // Engraved gold nameplate on front (+Z in statue local frame, facing gate)
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(0.96, 0.3),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: plaqueTex,
      roughness: 0.35,
      metalness: 0.35,
    }),
  );
  plaque.position.set(0, 1.78, 0.63);
  g.add(plaque);

  // Sculpted bronze-gold full-body statue of young Nguyễn Tất Thành (áo dài + book)
  const bronze = mat("#deb048", 0.26, 0.72);
  const bronzeDark = mat("#bf8d32", 0.34, 0.72);
  const statue = new THREE.Group();
  statue.position.y = 2.52;

  // Low bronze plinth under feet
  const footBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.5, 0.12, 16),
    bronzeDark,
  );
  footBase.position.y = 0.06;
  statue.add(footBase);

  // Flowing traditional áo dài robe sculpted via LatheGeometry
  const robePoints = [
    new THREE.Vector2(0.01, 0.12),
    new THREE.Vector2(0.38, 0.14),
    new THREE.Vector2(0.33, 0.65),
    new THREE.Vector2(0.27, 1.25),
    new THREE.Vector2(0.24, 1.68),
    new THREE.Vector2(0.29, 2.08),
    new THREE.Vector2(0.34, 2.34),
    new THREE.Vector2(0.14, 2.48),
    new THREE.Vector2(0.01, 2.50),
  ];
  const robe = new THREE.Mesh(new THREE.LatheGeometry(robePoints, 18), bronze);
  robe.scale.set(1.06, 1, 0.76);
  robe.castShadow = robe.receiveShadow = true;
  statue.add(robe);

  // Vertical tunic front fold crease
  const fold = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.18, 1.65, 8),
    bronzeDark,
  );
  fold.position.set(0.04, 1.0, 0.17);
  fold.scale.set(0.8, 1, 0.45);
  statue.add(fold);

  // Right arm resting naturally along side
  const rightUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.085, 0.45, 6, 10),
    bronze,
  );
  rightUpper.position.set(-0.34, 2.02, 0.02);
  rightUpper.rotation.z = -0.14;
  const rightFore = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.072, 0.42, 6, 10),
    bronze,
  );
  rightFore.position.set(-0.38, 1.56, 0.08);
  rightFore.rotation.x = 0.18;
  statue.add(rightUpper, rightFore);

  // Left arm bent holding a book against side/waist (as in photo)
  const leftUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.085, 0.42, 6, 10),
    bronze,
  );
  leftUpper.position.set(0.35, 2.02, 0.02);
  leftUpper.rotation.z = 0.2;
  const leftFore = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.072, 0.36, 6, 10),
    bronze,
  );
  leftFore.position.set(0.32, 1.68, 0.18);
  leftFore.rotation.x = 0.75;
  leftFore.rotation.z = -0.25;
  const book = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.32, 0.24),
    bronzeDark,
  );
  book.position.set(0.28, 1.72, 0.26);
  book.rotation.y = 0.25;
  statue.add(leftUpper, leftFore, book);

  // Collar, neck & sculpted head
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.1, 12),
    bronze,
  );
  collar.position.y = 2.48;
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.11, 0.16, 12),
    bronze,
  );
  neck.position.y = 2.57;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 14), bronze);
  head.scale.set(0.86, 1.14, 0.96);
  head.position.set(0, 2.79, 0.02);
  head.castShadow = true;
  const brow = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    bronzeDark,
  );
  brow.scale.set(0.9, 0.55, 0.95);
  brow.position.set(0, 2.89, -0.02);
  statue.add(collar, neck, head, brow);

  statue.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  g.add(statue);
  return g;
}

function createFlagpole(x, y, z, flagTex, seed = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);

  // Stepped concrete pedestal base
  const baseMat = mat("#e3ddd0", 0.78);
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.36, 0.44, 0.26, 12),
    baseMat,
  );
  plinth.position.y = 0.13;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.3, 0.24, 12),
    baseMat,
  );
  collar.position.y = 0.36;

  // Tall brushed stainless-steel mast
  const poleH = 12.2;
  const poleMat = mat("#d9dfe2", 0.24, 0.85);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.09, poleH, 12),
    poleMat,
  );
  pole.position.y = poleH / 2 + 0.3;
  pole.castShadow = true;

  // Golden spear/orb finial
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 8),
    mat("#e5b842", 0.25, 0.82),
  );
  finial.position.y = poleH + 0.34;
  group.add(plinth, collar, pole, finial);

  // Animated waving red Vietnamese flag cloth
  const flagW = 2.65;
  const flagH = 1.75;
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
  flagMesh.position.set(0.05, poleH - 0.82, 0);
  flagMesh.castShadow = true;
  flagMesh.userData.basePos = basePos;
  flagMesh.userData.seed = seed;
  group.add(flagMesh);

  return { group, flagMesh };
}

function createCampusBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const stone = "#cbc4b5";
  const seat = "#b9b09f";
  for (const sx of [-0.62, 0.62]) {
    g.add(box([0.14, 0.42, 0.44], stone, [sx, 0.21, 0]));
  }
  g.add(
    box([1.65, 0.09, 0.46], seat, [0, 0.44, 0.02]),
    box([1.65, 0.38, 0.08], seat, [0, 0.68, -0.18]),
  );
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

function createCampusTree(x, y, z, scale = 1, poinciana = false, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat("#64513e", 0.9);
  const trunkH = 3.2 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.19 * scale, 0.34 * scale, trunkH, 7),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  for (let b = 0; b < 3; b++) {
    const a = (b * Math.PI * 2) / 3 + 0.35;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08 * scale, 0.14 * scale, 2.0 * scale, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * 0.65 * scale,
      trunkH + 0.5 * scale,
      Math.sin(a) * 0.65 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.56;
    branch.rotation.x = Math.sin(a) * 0.56;
    g.add(branch);
  }

  const greens = poinciana
    ? ["#447b34", "#558f3d", "#3a6b2b", "#649c48"]
    : ["#32652b", "#417a35", "#518c40", "#619a4c"];
  const crowns = [
    [0, trunkH + 2.0 * scale, 0, 2.1 * scale, 0.66],
    [1.45 * scale, trunkH + 1.45 * scale, 0.85 * scale, 1.58 * scale, 0.65],
    [-1.4 * scale, trunkH + 1.5 * scale, 0.75 * scale, 1.62 * scale, 0.64],
    [0.25 * scale, trunkH + 1.38 * scale, -1.45 * scale, 1.6 * scale, 0.68],
    [-0.95 * scale, trunkH + 2.15 * scale, -0.8 * scale, 1.45 * scale, 0.62],
    [1.0 * scale, trunkH + 2.1 * scale, -0.55 * scale, 1.4 * scale, 0.62],
    [0.1 * scale, trunkH + 2.55 * scale, 0.45 * scale, 1.35 * scale, 0.58],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[i % greens.length], 0.86),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.18, sy, 1.14);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });

  if (poinciana) {
    // Vibrant scarlet-red Phượng Vĩ blossom clusters atop canopy
    const bloomMat = mat("#e14424", 0.62);
    for (let i = 0; i < 9; i++) {
      const a = (i * Math.PI * 2) / 9 + 0.2;
      const r = i < 2 ? 0.45 * scale : 1.58 * scale;
      const bloom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.65 * scale, 0),
        bloomMat,
      );
      bloom.position.set(
        Math.cos(a) * r,
        trunkH + (2.15 + (i % 3) * 0.35) * scale,
        Math.sin(a) * r,
      );
      bloom.scale.set(1.25, 0.48, 1.25);
      g.add(bloom);
    }
  }
  return g;
}

function createPalmTree(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11 * scale, 0.17 * scale, 3.6 * scale, 7),
    mat("#73614d", 0.9),
  );
  trunk.position.y = 1.8 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  const frondMat = mat("#3d7936", 0.82);
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.24 * scale, 1.65 * scale, 5),
      frondMat,
    );
    frond.position.set(
      Math.cos(a) * 0.65 * scale,
      3.55 * scale,
      Math.sin(a) * 0.65 * scale,
    );
    frond.rotation.z = -Math.cos(a) * 1.15;
    frond.rotation.x = Math.sin(a) * 1.15;
    g.add(frond);
  }
  return g;
}

export class QuocHocSchoolCampus {
  constructor(world, site, gatePlacement) {
    this.world = world;
    this.site = site;
    this.campusRings = getRingsOf(site.feature);
    this.gate = { x: gatePlacement.x, z: gatePlacement.z };

    const statueNode = getFeatures().find((f) => f.id === QUOC_HOC_STATUE_NODE_ID);
    this.statue = statueNode ? getCentroid(statueNode) : FALLBACK_STATUE;

    const dx = this.statue.x - this.gate.x;
    const dz = this.statue.z - this.gate.z;
    const len = Math.hypot(dx, dz) || 1;
    this.fwdVec = { x: dx / len, z: dz / len };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };
    this.axisLength = len; // ~105.39m from gate to statue
    this.facingGateYaw = Math.atan2(-this.fwdVec.x, -this.fwdVec.z);

    this.group = new THREE.Group();
    this.group.name = "quoc-hoc-school-campus";
    this.flags = [];
    this.animatedObjects = [];
    this.campusBuildingPolygons = [];

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
    const roofTex = createTerracottaTileRoofTexture();
    const crestTex = createMainHallCrestTexture();

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#982a32",
      map: wallTex,
      roughness: 0.78,
      metalness: 0.04,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#b9462d",
      map: roofTex,
      roughness: 0.68,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const trimMat = mat("#efe7d8", 0.72);
    const stonePlinthMat = mat("#6f665a", 0.9);
    const darkWoodMat = mat("#3b2217", 0.8);

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

      const isMainHall = feature.id === 695775639;
      const isSportsHall = feature.id === 695775628;
      const isSmallBooth = pts.length <= 5 && orientedBounds(pts).length < 14;
      const wallHeight = isSmallBooth ? 4.2 : isSportsHall ? 8.2 : isMainHall ? 8.8 : 7.6;

      // Extrude exact OSM footprint with colonial wall texture
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
      const bodyMesh = new THREE.Mesh(bodyGeo, wallMat);
      bodyMesh.position.y = 0.23;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);

      // Detailed 3D edge moldings (rusticated plinth base, pilasters, window hoods with brackets, top cornice)
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

        // Stone base plinth & top white eaves cornice
        const plinth = new THREE.BoxGeometry(len + 0.24, 0.72, 0.36);
        plinth.translate(0, 0.36, 0);
        plinth.applyMatrix4(matRot);
        plinthTrim.push(plinth);

        const cornice = new THREE.BoxGeometry(len + 0.45, 0.28, 0.56);
        cornice.translate(0, wallHeight - 0.1, 0);
        cornice.applyMatrix4(matRot);
        cornices.push(cornice);

        // Pilasters & projecting white window hoods + corbel brackets along long facades
        if (len > 7 && !isSmallBooth) {
          const count = Math.min(18, Math.floor(len / 3.6));
          for (let k = 0; k <= count; k++) {
            const x = ((k - count / 2) * len) / (count + 1);
            const pil = new THREE.BoxGeometry(0.3, wallHeight - 0.2, 0.38);
            pil.translate(x, wallHeight / 2, 0);
            pil.applyMatrix4(matRot);
            pilasters.push(pil);

            if (k < count) {
              const wx = ((k + 0.5 - count / 2) * len) / (count + 1);
              for (const wy of [2.95, 6.25]) {
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

      // Pitched terracotta-red hip or gable roof matched to OSM footprint orientation
      const ob = orientedBounds(pts);
      const roofY = 0.23 + wallHeight;
      const overhang = 1.1;
      const ridgeH = isSmallBooth ? 1.3 : isSportsHall ? 3.2 : Math.min(3.4, ob.depth * 0.22 + 0.8);
      const roofObj = isSportsHall
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

      // Main Hall (695775639) iconic white ornate pediment crest, veranda balcony & colonnade porch facing statue
      if (isMainHall) {
        const hall = new THREE.Group();
        const c = getCentroid(feature);
        hall.position.set(c.x, 0.23, c.z);
        hall.rotation.y = this.facingGateYaw;

        // Grand front portico steps & ground colonnade pillars facing the statue (+Z local)
        const porticoZ = 10.6;
        hall.add(
          box([12.4, 0.32, 3.6], "#cfc8b9", [0, 0.16, porticoZ]),
          box([11.4, 0.22, 2.8], "#d8d1c2", [0, 0.38, porticoZ - 0.4]),
          // Upper 2nd floor balcony balustrade
          box([16.5, 0.22, 1.3], "#efe7d8", [0, 4.35, porticoZ - 0.7]),
          box([16.5, 0.14, 0.18], "#efe7d8", [0, 5.25, porticoZ - 0.1]),
        );
        for (let bx = -7.8; bx <= 7.8; bx += 0.75) {
          hall.add(box([0.14, 0.82, 0.14], "#efe7d8", [bx, 4.84, porticoZ - 0.1]));
        }
        for (const px of [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5]) {
          hall.add(
            box([0.52, 4.35, 0.52], "#982a32", [px, 2.18, porticoZ - 0.2]),
            box([0.66, 0.2, 0.66], "#efe7d8", [px, 4.25, porticoZ - 0.2]),
          );
        }

        // Iconic white neoclassical ornate roof crest on the front parapet facing the statue
        const crestZ = porticoZ + 0.08;
        const crestY = wallHeight + 0.92;
        const crestFrame = box([14.4, 2.05, 0.52], "#efe7d8", [0, crestY, crestZ]);
        const crestTop = box([8.8, 0.72, 0.58], "#efe7d8", [0, crestY + 1.2, crestZ]);
        const crestPlaque = new THREE.Mesh(
          new THREE.PlaneGeometry(13.6, 1.86),
          new THREE.MeshStandardMaterial({
            color: "#ffffff",
            map: crestTex,
            roughness: 0.55,
          }),
        );
        crestPlaque.position.set(0, crestY, crestZ + 0.27);
        hall.add(crestFrame, crestTop, crestPlaque);
        for (const sx of [-1, 1]) {
          hall.add(
            box([0.95, 1.38, 0.6], "#efe7d8", [sx * 7.5, crestY - 0.25, crestZ]),
            box([0.65, 2.8, 0.3], darkWoodMat, [sx * 2.8, 2.2, porticoZ - 1.2]),
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
    const stoneTex = createCourtyardStoneTexture();
    const terraTex = createTerracottaPlazaTexture();
    const plaqueTex = createPedestalPlaqueTexture();
    const flagTex = createVietnamFlagTexture();

    const stoneMat = new THREE.MeshStandardMaterial({
      color: stoneTex ? "#ffffff" : "#9c9b95",
      map: stoneTex,
      roughness: 0.84,
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
    const curbMat = mat("#d5cfc1", 0.85);
    const lawnMat = createManicuredLawnMaterial(8, 12, { striped: false, rich: true });
    const rearLawnMat = createManicuredLawnMaterial(8, 12, { striped: true, rich: true });

    const yard = new THREE.Group();
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;
    // Note: in yard local frame, facingGateYaw points +Z toward Lê Lợi and -Z straight into campus!
    // Let's keep helper for local-Z: zLocal = -fwd, xLocal = -side?
    // Wait: let's verify! In Three.js: rotation.y = yaw maps local (0, 0, -1) to (-sin(yaw), 0, -cos(yaw)).
    // Since facingGateYaw = atan2(-fwdVec.x, -fwdVec.z), -sin(yaw) = fwdVec.x, -cos(yaw) = fwdVec.z!
    // And local (1, 0, 0) maps to (cos(yaw), 0, -sin(yaw)) = (-fwdVec.z, 0, fwdVec.x) = rightVec!
    // So in `yard` local coords: X = side, Z = -fwd! Let's verify:
    // Local (0, 0, -105.39) -> world (gate.x + 105.39*fwdVec.x, gate.z + 105.39*fwdVec.z) = statue! Exact!

    const statueZ = -this.axisLength; // -105.39

    // 1. Front manicured lawns flanking the entry avenue (fwd: 4..91, side: ±4.8..±34)
    for (const sx of [-1, 1]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(24, 0.14, 84), lawnMat);
      lawn.position.set(sx * 16.8, 0.06, -48);
      lawn.receiveShadow = true;
      yard.add(lawn);
    }

    // 2. Clean stone-curbed entry avenue (fwd: 1..92) over bare service road
    const avenue = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 0.06, 92),
      stoneMat,
    );
    avenue.position.set(0, 0.31, -46);
    avenue.receiveShadow = true;
    yard.add(avenue);
    for (const sx of [-4.35, 4.35]) {
      yard.add(box([0.36, 0.16, 90], "#d5cfc1", [sx, 0.32, -45]));
    }

    // 3. Circular courtyard roundabout around Nguyễn Tất Thành Statue
    const roundaboutOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(14.2, 14.2, 0.08, 40),
      curbMat,
    );
    roundaboutOuter.position.set(0, 0.3, statueZ);
    roundaboutOuter.receiveShadow = true;
    const roundabout = new THREE.Mesh(
      new THREE.CylinderGeometry(13.85, 13.85, 0.09, 40),
      stoneMat,
    );
    roundabout.position.set(0, 0.31, statueZ);
    roundabout.receiveShadow = true;
    yard.add(roundaboutOuter, roundabout);

    // 4. Raised square terracotta-tiled ceremonial dais (11.4m x 11.4m, top y = 0.74m)
    const dais = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.42, 11.4),
      terraMat,
    );
    dais.position.set(0, 0.53, statueZ);
    dais.castShadow = dais.receiveShadow = true;
    yard.add(dais);
    // Granite coping rim around dais
    for (const sz of [-5.75, 5.75]) {
      yard.add(box([11.7, 0.12, 0.24], "#d8d2c5", [0, 0.7, statueZ + sz]));
    }
    for (const sx of [-5.75, 5.75]) {
      yard.add(box([0.24, 0.12, 11.7], "#d8d2c5", [sx, 0.7, statueZ]));
    }
    // 3 perimeter granite steps on all 4 sides of dais
    for (let s = 0; s < 3; s++) {
      const span = 6.2 + (2 - s) * 0.55;
      const stepY = 0.34 + s * 0.13;
      const offset = 6.35 - s * 0.3;
      for (const dir of [-1, 1]) {
        yard.add(
          box([span, 0.13, 0.34], "#cbc5b7", [0, stepY, statueZ + dir * offset]),
          box([0.34, 0.13, span], "#cbc5b7", [dir * offset, stepY, statueZ]),
        );
      }
    }

    // 5. Tượng đài Nguyễn Tất Thành (facing +Z toward front gate)
    const monument = createNguyenTatThanhStatue(plaqueTex);
    monument.position.set(0, 0.74, statueZ);
    yard.add(monument);

    // 6. 8 trimmed conical ornamental evergreen trees in ceramic pots on & flanking the dais
    const bonsaiCoords = [
      [-2.8, 0.74, statueZ + 2.4],
      [2.8, 0.74, statueZ + 2.4],
      [-4.6, 0.74, statueZ + 4.6],
      [4.6, 0.74, statueZ + 4.6],
      [-4.6, 0.74, statueZ - 4.6],
      [4.6, 0.74, statueZ - 4.6],
      [-2.8, 0.74, statueZ - 3.0],
      [2.8, 0.74, statueZ - 3.0],
    ];
    for (const [bx, by, bz] of bonsaiCoords) {
      yard.add(createBonsaiPot(bx, by, bz));
    }

    // 7. Twin Tall Flagpoles (Cột cờ đôi) just behind statue dais (fwd: 114.8, side: ±3.2)
    for (const [idx, sx] of [-3.2, 3.2].entries()) {
      const fp = createFlagpole(sx, 0.34, statueZ - 9.4, flagTex, idx * 2.1);
      yard.add(fp.group);
      this.flags.push(fp.flagMesh);
      this.animatedObjects.push(fp.flagMesh);
    }

    // 8. Central Ceremonial Red-Brick Runners & Landscaped Flowerbed Island (fwd: 117..139)
    for (const sx of [-5.2, 5.2]) {
      const runner = new THREE.Mesh(
        new THREE.BoxGeometry(2.7, 0.08, 24),
        terraMat,
      );
      runner.position.set(sx, 0.31, -128);
      runner.receiveShadow = true;
      yard.add(runner);
    }
    // Central green garden island between flagpoles and Main Hall
    const centerGarden = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 0.16, 17),
      lawnMat,
    );
    centerGarden.position.set(0, 0.34, -128);
    centerGarden.receiveShadow = true;
    yard.add(centerGarden);
    yard.add(
      box([7.1, 0.2, 0.28], "#d5cfc1", [0, 0.36, -119.5]),
      box([7.1, 0.2, 0.28], "#d5cfc1", [0, 0.36, -136.5]),
    );
    // Ornamental hedges, scarlet/gold blooms & 4 palms flanking central garden
    for (const fz of [-123, -128, -133]) {
      const hedge = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.3, 0.42, 12),
        mat("#3f7734", 0.86),
      );
      hedge.position.set(0, 0.56, fz);
      yard.add(hedge);
      const bloom = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.45, 0),
        mat(fz === -128 ? "#e0a92f" : "#d9433b", 0.65),
      );
      bloom.position.set(0, 0.8, fz);
      bloom.scale.set(1.3, 0.65, 1.3);
      yard.add(bloom);
    }
    for (const [px, pz] of [
      [-2.3, -121.5],
      [2.3, -121.5],
      [-2.3, -134.5],
      [2.3, -134.5],
    ]) {
      yard.add(createPalmTree(px, 0.36, pz, 0.92));
    }

    // 9. Cross-courtyard & Classroom Wing Walkways (connecting statue plaza to both long wings)
    for (const pz of [statueZ, -138.5]) {
      const cross = new THREE.Mesh(
        new THREE.BoxGeometry(72, 0.07, 4.2),
        stoneMat,
      );
      cross.position.set(-2, 0.3, pz);
      cross.receiveShadow = true;
      yard.add(cross);
    }
    // Walkways along inner facades of symmetric classroom wings
    for (const sx of [-37.5, 31.5]) {
      const wingWalk = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.08, 88),
        stoneMat,
      );
      wingWalk.position.set(sx, 0.3, -103);
      wingWalk.receiveShadow = true;
      yard.add(wingWalk);
    }
    // Manicured courtyard grass lawns flanking the central ceremonial axis
    for (const [lx, lz, w, d] of [
      [-21, -120, 22, 40],
      [17, -120, 18, 40],
    ]) {
      const patch = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, d), lawnMat);
      patch.position.set(lx, 0.12, lz);
      patch.receiveShadow = true;
      yard.add(patch);
    }

    // 10. Campus Stone Benches & Heritage Globe Lampposts
    for (let bz = -68; bz >= -140; bz -= 14) {
      yard.add(
        createCampusBench(-35.2, 0.34, bz, Math.PI / 2),
        createCampusBench(29.2, 0.34, bz, -Math.PI / 2),
      );
    }
    for (const [lx, lz] of [
      [-11.5, statueZ + 10.5],
      [11.5, statueZ + 10.5],
      [-11.5, statueZ - 10.5],
      [11.5, statueZ - 10.5],
      [-7.2, -123],
      [7.2, -123],
      [-7.2, -135],
      [7.2, -135],
      [-6.5, -26],
      [6.5, -26],
      [-6.5, -62],
      [6.5, -62],
    ]) {
      yard.add(createCampusLamp(lx, 0.32, lz));
    }

    // 11. Rear Athletic Green Lawn & Outdoor Sports Court (fwd: 168..205)
    const rearLawn = new THREE.Mesh(new THREE.BoxGeometry(66, 0.12, 38), rearLawnMat);
    rearLawn.position.set(-2, 0.08, -184);
    rearLawn.receiveShadow = true;
    const sportPad = new THREE.Mesh(new THREE.BoxGeometry(28, 0.08, 16), terraMat);
    sportPad.position.set(-14, 0.15, -183);
    sportPad.receiveShadow = true;
    const courtLine = box([26, 0.02, 0.16], "#f3eee2", [-14, 0.2, -183]);
    yard.add(rearLawn, sportPad, courtLine);

    this.group.add(yard);
  }

  buildGreenery() {
    // Rich campus tree canopy: shade trees (Xà cừ/Bàng) & scarlet Phượng Vĩ
    const candidateSpecs = [
      // Framing entry avenue behind front gate (clear of Tam Quan roof eaves & central sightline)
      [-11.8, 13, 1.38, false],
      [11.8, 13, 1.34, true],
      [-14.5, 22, 1.28, true],
      [14.5, 22, 1.3, false],
      [-10.2, 36, 1.35, false],
      [10.2, 36, 1.3, true],
      [-23, 40, 1.38, false],
      [21, 40, 1.35, false],
      [-9.5, 54, 1.28, true],
      [9.5, 54, 1.26, false],
      [-21, 56, 1.42, false],
      [19, 56, 1.4, true],
      [-9.5, 72, 1.3, false],
      [9.5, 72, 1.32, true],
      [-22, 74, 1.45, true],
      [20, 74, 1.42, false],
      [-10.5, 88, 1.25, false],
      [10.5, 88, 1.25, true],
      // Framing front boundary wall left & right of Tam Quan gate
      [-38, 14, 1.45, false],
      [-52, 16, 1.4, true],
      [36, 14, 1.42, true],
      [50, 16, 1.38, false],
      // Shaded canopy along left & right inner classroom wing courtyards (matching photo 3 & 4)
      [-31, 64, 1.35, false],
      [-30, 80, 1.42, true],
      [-31, 96, 1.38, false],
      [-30, 112, 1.4, false],
      [-31, 128, 1.36, true],
      [-29, 144, 1.32, false],
      [25, 64, 1.35, true],
      [24, 80, 1.4, false],
      [25, 96, 1.36, false],
      [24, 112, 1.42, true],
      [25, 128, 1.34, false],
      [23, 144, 1.32, true],
      // Framing courtyard outer edges & Main Hall flanks
      [-22, 92, 1.28, false],
      [18, 92, 1.28, true],
      [-22, 122, 1.35, true],
      [18, 122, 1.34, false],
      [-28, 152, 1.36, false],
      [22, 152, 1.36, true],
      // Outer campus edges & rear sports yard
      [-62, 60, 1.45, false],
      [-64, 100, 1.4, true],
      [-64, 142, 1.42, false],
      [58, 60, 1.44, true],
      [58, 105, 1.38, false],
      [58, 142, 1.4, true],
      [-36, 174, 1.42, false],
      [-20, 174, 1.35, true],
      [16, 174, 1.38, false],
      [32, 174, 1.4, true],
      [-36, 198, 1.45, true],
      [22, 198, 1.4, false],
      [38, 196, 1.36, true],
      [-32, 220, 1.38, false],
      [18, 222, 1.35, true],
    ];

    candidateSpecs.forEach(([side, fwd, scale, poinciana], idx) => {
      const w = this.toWorld(side, fwd);
      if (!this.inCampus(w.x, w.z)) return;
      // Guarantee zero building overlap
      const hitsBuilding = this.campusBuildingPolygons.some(
        (poly) =>
          inside(w, poly) || nearestPoint(w, poly).distance < 3.4,
      );
      if (hitsBuilding) return;
      this.group.add(
        createCampusTree(w.x, 0.14, w.z, scale, poinciana, idx + 1),
      );
    });
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    const { side, fwd } = this.toLocal(wx, wz);

    // Raised square statue dais (side: ±5.7, fwd: axisLength ± 5.7)
    const df = Math.abs(fwd - this.axisLength);
    const ds = Math.abs(side);
    if (ds <= 5.75 && df <= 5.75) return 0.74;
    // 4 perimeter steps onto statue dais
    if (
      (ds <= 3.5 && df > 5.75 && df <= 6.85) ||
      (df <= 3.5 && ds > 5.75 && ds <= 6.85)
    ) {
      const dist = Math.max(df, ds);
      const t = Math.max(0, Math.min(1, (6.85 - dist) / 1.1));
      return 0.34 + t * 0.4;
    }
    // Roundabout plaza, entry avenue, ceremonial runners & courtyard walkways
    if (Math.hypot(side, fwd - this.axisLength) <= 14.2) return 0.34;
    if (Math.abs(side) <= 4.6 && fwd >= -1 && fwd <= 94) return 0.34;
    if (Math.abs(Math.abs(side) - 5.2) <= 1.5 && fwd >= 114 && fwd <= 141)
      return 0.34;
    if (
      (Math.abs(fwd - this.axisLength) <= 2.2 ||
        Math.abs(fwd - 138.5) <= 2.2) &&
      side >= -38 &&
      side <= 34
    )
      return 0.34;
    if (
      (Math.abs(side + 37.5) <= 2.8 || Math.abs(side - 31.5) <= 2.8) &&
      fwd >= 58 &&
      fwd <= 148
    )
      return 0.34;
    return null;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    const { side, fwd } = this.toLocal(wx, wz);
    const df = Math.abs(fwd - this.axisLength);
    const ds = Math.abs(side);

    // Block riding through the solid Nguyễn Tất Thành pedestal
    if (ds < 1.35 && df < 1.35) return false;
    // Block twin flagpole pedestals
    if (Math.abs(fwd - (this.axisLength + 9.4)) < 0.75 && Math.abs(Math.abs(side) - 3.2) < 0.75)
      return false;
    // Block central flowerbed island
    if (Math.abs(side) < 3.6 && fwd >= 119 && fwd <= 137) return false;
    // Block potted bonsai around dais corners
    if (
      (Math.abs(ds - 4.6) < 0.75 && Math.abs(df - 4.6) < 0.75) ||
      (Math.abs(ds - 2.8) < 0.7 && (Math.abs(fwd - (this.axisLength - 2.4)) < 0.7 || Math.abs(fwd - (this.axisLength + 3.0)) < 0.7))
    )
      return false;
    // Block campus stone benches along wing walkways
    for (let bz = 68; bz <= 140; bz += 14) {
      if (Math.abs(fwd - bz) < 0.45 && (Math.abs(side + 35.2) < 0.95 || Math.abs(side - 29.2) < 0.95)) {
        return false;
      }
    }

    // Allow riding on dais, steps, roundabout, avenue, ceremonial runners & courtyard walkways
    if (ds <= 6.85 && df <= 6.85) return true;
    if (Math.hypot(side, fwd - this.axisLength) <= 14.2) return true;
    if (Math.abs(side) <= 4.1 && fwd >= -1 && fwd <= 94) return true;
    if (Math.abs(Math.abs(side) - 5.2) <= 1.35 && fwd >= 114 && fwd <= 141) return true;
    if (
      (Math.abs(fwd - this.axisLength) <= 2.1 || Math.abs(fwd - 138.5) <= 2.1) &&
      side >= -38 &&
      side <= 34
    )
      return true;
    if (
      (Math.abs(side + 37.5) <= 2.7 || Math.abs(side - 31.5) <= 2.7) &&
      fwd >= 58 &&
      fwd <= 148
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
        { gender: "girl", points: [[-2.4, 16], [-2.4, 82]], speed: 1.32, offset: 0.1 },
        { gender: "boy", points: [[2.5, 84], [2.5, 22]], speed: 1.4, offset: 0.45 },
        { gender: "girl", points: [[-36.8, 66], [-36.8, 134]], speed: 1.24, offset: 0.25 },
        { gender: "boy", points: [[31.0, 136], [31.0, 68]], speed: 1.36, offset: 0.65 },
        { gender: "girl", points: [[-34, this.axisLength], [-14.5, this.axisLength]], speed: 1.28, offset: 0.2 },
        { gender: "boy", points: [[14.5, this.axisLength], [30, this.axisLength]], speed: 1.3, offset: 0.5 },
        { gender: "girl", points: [[-5.2, 118], [-5.2, 138]], speed: 1.18, offset: 0.35 },
        { gender: "boy", points: [[5.2, 138], [5.2, 118]], speed: 1.22, offset: 0.7 },
      ],
      chatSpots: [
        { side: -10.5, fwd: this.axisLength - 7.5, members: ["girl", "boy", "girl"], radius: 0.9 },
        { side: 10.5, fwd: this.axisLength + 6.5, members: ["boy", "girl", "boy"], radius: 0.9 },
        { side: -22, fwd: 138.5, members: ["girl", "boy"], radius: 0.75 },
        { side: 19, fwd: 138.5, members: ["boy", "girl"], radius: 0.75 },
      ],
    });
    this.animatedObjects.push(...this.students.animatedObjects);
  }

  update(time, playerPos = null) {
    for (const flag of this.flags) {
      const pos = flag.geometry.attributes.position;
      const base = flag.userData.basePos;
      const seed = flag.userData.seed || 0;
      if (!pos || !base) continue;
      for (let i = 0; i < pos.count; i++) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const u = Math.min(1, Math.max(0, bx / 2.65));
        const wave =
          Math.sin(u * 4.5 - time * 3.8 + seed) * 0.18 * u +
          Math.sin(u * 8.0 - time * 5.6 + seed + by * 0.6) * 0.06 * u;
        const droop = -0.14 * u * u + Math.sin(time * 2.1 + u * 2 + seed) * 0.03 * u;
        pos.setZ(i, base[i * 3 + 2] + wave);
        pos.setY(i, by + droop);
      }
      pos.needsUpdate = true;
      flag.geometry.computeVertexNormals();
    }
    this.students?.update(time, playerPos);
  }
}
