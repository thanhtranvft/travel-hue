import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import quangTrungCampuses from "../data/campuses.json" with { type: "json" };
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

function createIceBlueWingWallTexture(floors = 3) {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    // Pale ice-blue & crisp cream-white classroom facade matching Quang Trung photo
    ctx.fillStyle = "#b7cce0";
    ctx.fillRect(0, 0, w, h);

    // Subtle stucco speckle
    for (let i = 0; i < 280; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,255,255,0.09)" : "rgba(70,105,145,0.06)";
      ctx.fillRect((i * 151) % w, (i * 271) % h, 5, 4);
    }

    // Ground stone plinth
    ctx.fillStyle = "#8a9199";
    ctx.fillRect(0, h - 42, w, 42);
    ctx.fillStyle = "#f2f5f8";
    ctx.fillRect(0, h - 46, w, 8);

    const floorStep = Math.floor((h - 46) / floors);
    for (let f = 0; f < floors; f++) {
      const topY = f * floorStep;
      // Crisp white veranda parapet / cornice slab
      ctx.fillStyle = "#f3f6f9";
      ctx.fillRect(0, topY, w, 16);
      // Soft teal awning trim bar
      ctx.fillStyle = "#4d9bd9";
      ctx.fillRect(0, topY + 16, w, 7);

      const winY = topY + 34;
      const winH = Math.max(58, floorStep - 52);

      // Left & right bay tall dark windows + center staircase white horizontal louvers
      for (const [wx, isLouver] of [
        [28, false],
        [192, true],
        [356, false],
      ]) {
        ctx.fillStyle = "#f4f7fa";
        ctx.fillRect(wx - 6, winY - 6, 134, winH + 12);
        if (isLouver) {
          ctx.fillStyle = "#3a4b5c";
          ctx.fillRect(wx, winY, 122, winH);
          ctx.fillStyle = "#eef2f6";
          for (let ly = winY + 6; ly < winY + winH - 4; ly += 10) {
            ctx.fillRect(wx + 2, ly, 118, 5);
          }
        } else {
          ctx.fillStyle = "#1f3242";
          ctx.fillRect(wx, winY, 122, winH);
          // Sky/tree reflection & crisp white security mullions
          ctx.fillStyle = "rgba(130, 185, 220, 0.24)";
          ctx.fillRect(wx + 6, winY + 6, 52, winH - 12);
          ctx.fillStyle = "#dbe4ec";
          ctx.fillRect(wx + 59, winY + 4, 4, winH - 8);
          ctx.fillRect(wx + 4, winY + Math.round(winH * 0.48), 114, 4);
        }
      }
    }
  });
}

function createCheckeredSchoolyardTexture() {
  // Checkered warm terracotta-rose & cool light-grey terrazzo pavers matching Quang Trung photo
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#d5d2cc";
      ctx.fillRect(0, 0, w, h);

      const cell = 64;
      for (let gx = 0; gx < w; gx += cell) {
        for (let gy = 0; gy < h; gy += cell) {
          const isRose = ((gx / cell + gy / cell) & 1) === 0;
          ctx.fillStyle = isRose ? "#c78e84" : "#d9d7d1";
          ctx.fillRect(gx + 1, gy + 1, cell - 2, cell - 2);
          // Subtle recessed court circle / diagonal sheen
          ctx.fillStyle = isRose
            ? "rgba(255,235,228,0.09)"
            : "rgba(90,88,82,0.06)";
          ctx.fillRect(gx + 5, gy + 5, cell - 10, cell - 10);
        }
      }

      // Terrazzo stone speckles
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(75,72,68,0.09)" : "rgba(255,255,255,0.13)";
        ctx.fillRect((i * 197) % w, (i * 331) % h, 3, 3);
      }
    },
    14,
    14,
  );
}

function createBannerTexture(topText, bottomText, bg = "#0b68bd") {
  return createCanvasTexture(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f0f7ff";
    ctx.lineWidth = 7;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (topText && bottomText) {
      ctx.fillStyle = "#ffec8a";
      ctx.font = "bold 34px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(topText, w / 2, h * 0.34, w - 54);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(bottomText, w / 2, h * 0.71, w - 54);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(topText || bottomText, w / 2, h / 2, w - 48);
    }
  });
}

function createStageBackdropTexture() {
  return createCanvasTexture(1024, 512, (ctx, w, h) => {
    ctx.fillStyle = "#195ca6";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#2b74c4";
    ctx.fillRect(24, 24, w - 48, h - 48);
    ctx.strokeStyle = "#ffd766";
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, w - 48, h - 48);

    // Subtle red curtain valance at top
    ctx.fillStyle = "#b92228";
    ctx.fillRect(24, 24, w - 48, 56);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe880";
    ctx.font = "bold 36px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("TRƯỜNG TIỂU HỌC QUANG TRUNG", w / 2, 165, w - 100);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 58px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("CHÀO MỪNG NĂM HỌC MỚI", w / 2, 260, w - 100);
    ctx.fillStyle = "#d9ecff";
    ctx.font = "600 32px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("83 NGUYỄN HUỆ · PHƯỜNG THUẬN HÓA · TP. HUẾ", w / 2, 360, w - 100);
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

function createHipRoofMesh(length, depth, ridgeHeight, material) {
  const hl = length / 2;
  const hd = depth / 2;
  const inset = Math.min(hl * 0.6, hd * 0.88);
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

function createBroadShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat("#5e4b3a", 0.92);
  const trunkH = 3.4 * scale;
  const trunkR = 0.28 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.68, trunkR * 1.25, trunkH, 8),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  for (let b = 0; b < 4; b++) {
    const a = (b * Math.PI * 2) / 4 + 0.4;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09 * scale, 0.17 * scale, 2.2 * scale, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * 0.72 * scale,
      trunkH + 0.65 * scale,
      Math.sin(a) * 0.72 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.64;
    branch.rotation.x = Math.sin(a) * 0.64;
    branch.castShadow = true;
    g.add(branch);
  }

  const greens = ["#2f6b2b", "#3d7c35", "#4f8f40", "#629d4c"];
  [
    [0, trunkH + 2.1 * scale, 0, 2.45 * scale, 0.58],
    [1.65 * scale, trunkH + 1.55 * scale, 0.9 * scale, 1.8 * scale, 0.56],
    [-1.6 * scale, trunkH + 1.6 * scale, 0.85 * scale, 1.82 * scale, 0.56],
    [0.3 * scale, trunkH + 1.5 * scale, -1.65 * scale, 1.75 * scale, 0.58],
    [-1.0 * scale, trunkH + 2.2 * scale, -0.9 * scale, 1.6 * scale, 0.54],
  ].forEach(([cx, cy, cz, r, sy], i) => {
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

function createBuntingStrand(pA, pB, sag = 0.55) {
  const g = new THREE.Group();
  const dx = pB.x - pA.x;
  const dy = pB.y - pA.y;
  const dz = pB.z - pA.z;
  const dist = Math.hypot(dx, dy, dz);
  if (dist < 1) return g;

  const palette = ["#e63946", "#f7c931", "#1d84e3", "#2ea44f", "#f97316", "#a855f7"];
  const step = 0.72;
  const count = Math.floor(dist / step);
  const yaw = Math.atan2(dx, dz);

  // Thin cord segments
  const cord = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.03, dist),
    mat("#ebe7dc", 0.6),
  );
  cord.position.set((pA.x + pB.x) / 2, (pA.y + pB.y) / 2 - sag * 0.45, (pA.z + pB.z) / 2);
  cord.rotation.y = yaw;
  g.add(cord);

  const triGeo = new THREE.ConeGeometry(0.16, 0.34, 3);
  triGeo.rotateX(Math.PI);

  for (let i = 1; i < count; i++) {
    const t = i / count;
    const bx = pA.x + dx * t;
    const bz = pA.z + dz * t;
    const by = pA.y + dy * t - 4 * sag * t * (1 - t);
    const pennant = new THREE.Mesh(
      triGeo,
      new THREE.MeshStandardMaterial({
        color: palette[i % palette.length],
        roughness: 0.55,
      }),
    );
    pennant.position.set(bx, by - 0.17, bz);
    pennant.rotation.y = yaw + Math.PI * 0.5;
    g.add(pennant);
  }
  return g;
}

function createBasketballHoop(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "quang-trung-basketball-hoop";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const frameYellow = mat("#e3b636", 0.4, 0.3);
  const skyBlue = mat("#1c78c8", 0.4, 0.3);
  g.add(
    box([1.1, 0.52, 1.5], skyBlue.color.getStyle(), [0, 0.26, -0.45]),
    box([0.18, 2.8, 0.18], frameYellow.color.getStyle(), [0, 1.7, -0.2]),
    box([0.16, 0.16, 1.1], frameYellow.color.getStyle(), [0, 3.02, 0.4]),
    box([1.72, 1.12, 0.08], "#f5f7fa", [0, 3.22, 1.0]),
  );
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.026, 8, 18),
    mat("#eb5022", 0.42, 0.3),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 2.95, 1.25);
  const net = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.13, 0.36, 12, 1, true),
    mat("#f6f6f6", 0.85, 0, { side: THREE.DoubleSide }),
  );
  net.position.set(0, 2.77, 1.25);
  g.add(rim, net);
  return g;
}

function createMiniGoal(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "quang-trung-mini-goal";
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const w = 3.2;
  const h = 1.95;
  const d = 1.05;
  const white = "#f2f5f8";
  g.add(
    box([0.09, h, 0.09], white, [-w / 2, h / 2, 0]),
    box([0.09, h, 0.09], white, [w / 2, h / 2, 0]),
    box([w + 0.09, 0.09, 0.09], white, [0, h, 0]),
    box([0.07, 0.07, d], white, [-w / 2, 0.04, -d / 2]),
    box([0.07, 0.07, d], white, [w / 2, 0.04, -d / 2]),
    box([w, 0.07, 0.07], white, [0, 0.04, -d]),
    box([0.06, h, 0.06], white, [-w / 2, h / 2, -d * 0.72]),
    box([0.06, h, 0.06], white, [w / 2, h / 2, -d * 0.72]),
  );
  const netMesh = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.12, h - 0.1, d * 0.7),
    new THREE.MeshStandardMaterial({
      color: "#eef2f6",
      transparent: true,
      opacity: 0.24,
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
  netMesh.position.set(0, h / 2, -d * 0.36);
  g.add(netMesh);
  return g;
}

function createBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  for (const sx of [-0.6, 0.6]) {
    g.add(box([0.14, 0.4, 0.42], "#d5cfc4", [sx, 0.2, 0]));
  }
  g.add(
    box([1.6, 0.09, 0.44], "#c7c0b0", [0, 0.43, 0.02]),
    box([1.6, 0.36, 0.08], "#c7c0b0", [0, 0.66, -0.17]),
  );
  return g;
}

function createFlagpole(x, y, z, flagTex) {
  const group = new THREE.Group();
  group.name = "quang-trung-flagpole";
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

export class QuangTrungCampus {
  constructor(world, site, gatePlacement) {
    this.world = world;
    this.site = site;
    const cfg = quangTrungCampuses["quang-trung"];
    this.campusRings = [cfg.ring];
    this.buildingIds = cfg.buildings || [732320417];
    this.gate = { x: gatePlacement.x, z: gatePlacement.z };
    this.facingGateYaw = gatePlacement.heading;
    this.fwdVec = {
      x: -Math.sin(this.facingGateYaw),
      z: -Math.cos(this.facingGateYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "quang-trung-campus";
    this.flags = [];
    this.animatedObjects = [];
    this.campusBuildingPolygons = [];
    this.obstacles = [];

    this.buildCourtyard();
    this.buildBuildings();
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
    const tileTex = createCheckeredSchoolyardTexture();
    const flagTex = createVietnamFlagTexture();

    const yardMat = new THREE.MeshStandardMaterial({
      color: tileTex ? "#ffffff" : "#ceb8b0",
      map: tileTex,
      roughness: 0.84,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const yardGeo = polygonGeometry(this.campusRings[0], 0.14);
    const yardMesh = new THREE.Mesh(yardGeo, yardMat);
    yardMesh.position.y = 0.16;
    yardMesh.receiveShadow = true;
    this.group.add(yardMesh);

    const yard = new THREE.Group();
    yard.name = "quang-trung-courtyard";
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    // Paved central drive extending from 83 Nguyễn Huệ gate toward ceremony stage
    const entryDrive = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.04, 16.0),
      mat("#c9c5bb", 0.86),
    );
    entryDrive.position.set(0, 0.295, -8.0);
    entryDrive.receiveShadow = true;
    yard.add(entryDrive);

    // Ceremonial red runner carpet running through center yard to stage (matching image_c4ad515e.png)
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.025, 34.0),
      mat("#a72631", 0.9),
    );
    carpet.position.set(1.5, 0.312, -33.0);
    carpet.receiveShadow = true;
    yard.add(carpet);

    // Ceremonial elevated stage & backdrop pavilion in front of north classroom wing
    const stageGroup = new THREE.Group();
    stageGroup.name = "quang-trung-stage";
    stageGroup.position.set(1.5, 0.3, -51.8);
    const stageDeck = box([11.4, 0.42, 4.4], "#d2ccc0", [0, 0.21, 0]);
    const stageCarpet = box([10.8, 0.04, 3.8], "#a72631", [0, 0.44, 0]);
    const backdropTex = createStageBackdropTexture();
    const backdropPanel = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 4.1, 0.16),
      new THREE.MeshStandardMaterial({
        color: backdropTex ? "#ffffff" : "#195ca6",
        map: backdropTex,
        roughness: 0.55,
      }),
    );
    backdropPanel.position.set(0, 2.5, -1.9);
    const stageRoof = box([11.2, 0.16, 4.4], "#3182d1", [0, 4.68, -0.2]);
    stageGroup.add(
      stageDeck,
      stageCarpet,
      backdropPanel,
      stageRoof,
      box([0.2, 4.2, 0.2], "#f4f6f9", [-5.1, 2.5, 1.8]),
      box([0.2, 4.2, 0.2], "#f4f6f9", [5.1, 2.5, 1.8]),
    );
    yard.add(stageGroup);
    this.obstacles.push({ side: 1.5, fwd: 51.8, radius: 3.4 });

    // Ceremonial flagpole (just left of stage)
    const fp = createFlagpole(-6.8, 0.3, -46.8, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);
    this.obstacles.push({ side: -6.8, fwd: 46.8, radius: 1.1 });

    // Courtyard planter beds flanking gate inside wall
    const lawnMat = createManicuredLawnMaterial(4, 4, { striped: false, rich: true });
    for (const [lx, lz, w, d] of [
      [-15.5, -4.6, 12.0, 3.6],
      [15.5, -4.6, 12.0, 3.6],
    ]) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), lawnMat);
      bed.position.set(lx, 0.3, lz);
      bed.receiveShadow = true;
      yard.add(bed);
    }

    // Sports zone at right-front yard matching image_d2976dd6.png: basketball hoop + mini soccer goal
    yard.add(createBasketballHoop(23.5, 0.3, -18.5, -Math.PI * 0.42));
    this.obstacles.push({ side: 23.5, fwd: 18.5, radius: 1.4 });
    yard.add(createMiniGoal(21.0, 0.3, -10.8, 0.08));
    this.obstacles.push({ side: 21.0, fwd: 10.8, radius: 1.8 });

    // Crisscross festive triangular bunting strands high above central courtyard (y ~ 6.4..7.0m, well clear of rider!)
    const anchorA = new THREE.Vector3(-23.5, 6.8, -22.0);
    const anchorB = new THREE.Vector3(24.0, 6.8, -22.0);
    const anchorC = new THREE.Vector3(-23.5, 6.9, -42.0);
    const anchorD = new THREE.Vector3(24.0, 6.9, -42.0);
    const anchorE = new THREE.Vector3(-12.0, 7.0, -55.0);
    const anchorF = new THREE.Vector3(14.0, 7.0, -55.0);
    const buntingPairs = [
      [anchorA, anchorB],
      [anchorC, anchorD],
      [anchorA, anchorD],
      [anchorB, anchorC],
      [anchorC, anchorF],
      [anchorD, anchorE],
    ];
    const buntingGroup = new THREE.Group();
    buntingGroup.name = "quang-trung-bunting";
    for (const [p1, p2] of buntingPairs) {
      buntingGroup.add(createBuntingStrand(p1, p2, 0.72));
    }
    yard.add(buntingGroup);

    // Courtyard stone benches under right-side & gate-side shade trees
    for (const [bx, bf, yaw] of [
      [-10.2, 9.6, Math.PI * 0.24],
      [10.2, 9.6, -Math.PI * 0.24],
      [25.5, 29.0, -Math.PI * 0.5],
      [25.5, 39.5, -Math.PI * 0.5],
      [-21.2, 24.5, Math.PI * 0.5],
    ]) {
      yard.add(createBench(bx, 0.3, -bf, yaw));
      this.obstacles.push({ side: bx, fwd: bf, radius: 1.0 });
    }

    this.group.add(yard);
  }

  buildBuildings() {
    const wallTex3 = createIceBlueWingWallTexture(3);
    const wallMat3 = new THREE.MeshStandardMaterial({
      color: wallTex3 ? "#ffffff" : "#b7cce0",
      map: wallTex3,
      roughness: 0.74,
      metalness: 0.04,
    });
    const roofMat = mat("#335c85", 0.65, 0.08);
    const canopyMat = mat("#2c82d2", 0.52, 0.12);
    const trimMat = mat("#f3f6fa", 0.72);
    const colonnadeParts = [];

    // 1) West 3-story classroom wing from real OSM polygon (way 732320417)
    for (const id of this.buildingIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.campusBuildingPolygons.push(pts);

      const wallHeight = 10.6;
      const bodyGeo = polygonGeometry(pts, wallHeight);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 9.2, pos.getY(i) / wallHeight);
        }
      }
      const bodyMesh = new THREE.Mesh(bodyGeo, wallMat3);
      bodyMesh.position.y = 0.28;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);

      // Sloped hip roof atop West wing
      const wingCenter = this.toWorld(-28.75, 38.1);
      const wingRoof = createHipRoofMesh(44.4, 8.6, 2.2, roofMat);
      wingRoof.position.set(wingCenter.x, 0.28 + wallHeight, wingCenter.z);
      wingRoof.rotation.y = this.facingGateYaw + Math.PI * 0.5;
      this.group.add(wingRoof);

      // Iconic sky-blue 1st-floor verandah canopy & crisp white square columns along eastern face (matching image_d2976dd6.png)
      const awningStart = this.toWorld(-24.2, 38.1);
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.22, 43.2),
        canopyMat,
      );
      awning.position.set(awningStart.x, 3.85, awningStart.z);
      awning.rotation.y = this.facingGateYaw;
      awning.castShadow = true;
      this.group.add(awning);

      for (let f = 17.5; f <= 58.8; f += 5.15) {
        const cp = this.toWorld(-23.75, f);
        const col = new THREE.BoxGeometry(0.38, 3.6, 0.38);
        col.rotateY(this.facingGateYaw);
        col.translate(cp.x, 0.28 + 1.8, cp.z);
        colonnadeParts.push(col);
      }

      // 2nd/3rd floor terracotta flower planter boxes on West wing facade
      for (const lvY of [4.25, 7.65]) {
        for (let f = 19.0; f <= 57.0; f += 4.2) {
          const pp = this.toWorld(-24.65, f);
          const planter = new THREE.Mesh(
            new THREE.BoxGeometry(0.45, 0.36, 1.3),
            mat("#edece7", 0.78),
          );
          planter.position.set(pp.x, lvY, pp.z);
          planter.rotation.y = this.facingGateYaw;
          this.group.add(planter);
        }
      }
    }

    // 2) North Rear 3-story classroom wing inside campus polygon (side -21..+24, fwd 56.5..66.5) matching image_c4ad515e.png
    const nW = 45.0;
    const nD = 9.4;
    const nH = 10.6;
    const northCorners = [
      this.toWorld(-21.0, 56.5),
      this.toWorld(24.0, 56.5),
      this.toWorld(24.0, 65.9),
      this.toWorld(-21.0, 65.9),
    ];
    this.campusBuildingPolygons.push([...northCorners, northCorners[0]]);

    const northWingGroup = new THREE.Group();
    northWingGroup.name = "quang-trung-north-wing";
    const nc = this.toWorld(1.5, 61.2);
    northWingGroup.position.set(nc.x, 0.28, nc.z);
    northWingGroup.rotation.y = this.facingGateYaw;

    const nBodyGeo = new THREE.BoxGeometry(nW, nH, nD);
    if (nBodyGeo.attributes.uv) {
      const uv = nBodyGeo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * 4.5);
      }
    }
    const nBody = new THREE.Mesh(nBodyGeo, wallMat3);
    nBody.position.y = nH / 2;
    nBody.castShadow = nBody.receiveShadow = true;
    northWingGroup.add(nBody);
    this.world.cameraObstacles.push(nBody);

    const nRoof = createHipRoofMesh(nW + 0.8, nD + 0.8, 2.4, roofMat);
    nRoof.position.y = nH;
    northWingGroup.add(nRoof);

    // Front verandah pillars & sky-blue overhang roof on north wing
    const nAwning = new THREE.Mesh(
      new THREE.BoxGeometry(nW - 0.5, 0.22, 1.85),
      canopyMat,
    );
    nAwning.position.set(0, 3.6, nD / 2 + 0.85);
    northWingGroup.add(nAwning);
    for (let sx = -20.5; sx <= 20.5; sx += 5.1) {
      northWingGroup.add(
        box([0.38, 3.6, 0.38], "#f3f6fa", [sx, 1.8, nD / 2 + 1.45]),
      );
    }

    // Iconic slogan banner perched high on top fascia of North wing matching image_c4ad515e.png
    const sloganTex = createBannerTexture(
      "VÌ LỢI ÍCH MƯỜI NĂM TRỒNG CÂY, VÌ LỢI ÍCH TRĂM NĂM TRỒNG NGƯỜI",
      "",
      "#0a63bd",
    );
    const sloganPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(19.5, 1.55),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: sloganTex,
        roughness: 0.45,
      }),
    );
    sloganPanel.name = "quang-trung-slogan-banner";
    sloganPanel.position.set(0, 9.55, nD / 2 + 0.16);
    northWingGroup.add(sloganPanel);

    const lowerBannerTex = createBannerTexture(
      "TRƯỜNG TIỂU HỌC QUANG TRUNG",
      "TIÊN HỌC LỄ · HẬU HỌC VĂN",
      "#0b68bd",
    );
    const lowerBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(11.8, 1.75),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: lowerBannerTex,
        roughness: 0.45,
      }),
    );
    lowerBanner.position.set(0, 4.9, nD / 2 + 0.16);
    northWingGroup.add(lowerBanner);

    this.group.add(northWingGroup);

    if (colonnadeParts.length) {
      const m = new THREE.Mesh(mergeGeometries(colonnadeParts), trimMat);
      m.castShadow = m.receiveShadow = true;
      this.group.add(m);
      colonnadeParts.forEach((p) => p.dispose());
    }
  }

  buildGreenery() {
    const trees = [
      [-14.5, 7.2, 1.08, 1],
      [-17.2, 17.5, 1.16, 2],
      [-17.8, 31.0, 1.12, 3],
      [-17.2, 44.5, 1.08, 4],
      [14.5, 7.2, 1.1, 5],
      [17.5, 22.0, 1.14, 6],
      [28.0, 13.0, 1.05, 7],
      [27.8, 30.5, 1.14, 8],
      [27.5, 46.5, 1.1, 9],
      [-26.5, 62.5, 1.05, 10],
    ];
    for (const [side, fwd, scale, seed] of trees) {
      const p = this.toWorld(side, fwd);
      if (!this.inCampus(p.x, p.z)) continue;
      if (this.campusBuildingPolygons.some((poly) => inside(p, poly))) continue;
      this.group.add(createBroadShadeTree(p.x, 0.3, p.z, scale, seed));
      this.obstacles.push({ side, fwd, radius: 1.05 });
    }
  }

  buildStudents() {
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
      { gender: "boy", points: [[-2.0, 4.5], [-2.0, 36.0]], speed: 1.32, offset: 0.12 },
      { gender: "girl", points: [[4.5, 38.0], [4.5, 6.0]], speed: 1.28, offset: 0.52 },
      { gender: "girl", points: [[-10.5, 21.0], [11.0, 21.0]], speed: 1.24, offset: 0.25 },
      { gender: "boy", points: [[11.0, 41.5], [-10.0, 41.5]], speed: 1.35, offset: 0.68 },
    ].filter((w) => w.points.every(([s, f]) => isWalkSafe(s, f)));

    const chatSpots = [
      { side: -7.5, fwd: 14.5, members: ["boy", "girl", "boy"], radius: 0.85 },
      { side: 10.5, fwd: 27.5, members: ["girl", "boy", "girl"], radius: 0.85 },
      { side: 16.5, fwd: 15.5, members: ["boy", "girl"], radius: 0.8 },
    ].filter((c) => isWalkSafe(c.side, c.fwd));

    this.students = new CampusStudents({
      parent: this.group,
      toWorld: (side, fwd) => this.toWorld(side, fwd),
      groundAt: () => 0.3,
      walkers,
      chatSpots,
      scale: 0.94,
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
    this.students?.update(time, playerPos);
  }
}
