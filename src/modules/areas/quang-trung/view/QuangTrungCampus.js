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
import {
  createComNamHawker,
  createXoiPushcartCouple,
} from "./QuangTrungVendors.js";
import {
  buildRoseGardenCafe,
  buildNguyenHueCafeStrip,
} from "./QuangTrungCafes.js";
import { createTeachersChatGroup } from "./QuangTrungTeachers.js";

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
    ctx.fillStyle = "#b7cce0";
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 280; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,255,255,0.09)" : "rgba(70,105,145,0.06)";
      ctx.fillRect((i * 151) % w, (i * 271) % h, 5, 4);
    }

    ctx.fillStyle = "#8a9199";
    ctx.fillRect(0, h - 42, w, 42);
    ctx.fillStyle = "#f2f5f8";
    ctx.fillRect(0, h - 46, w, 8);

    const floorStep = Math.floor((h - 46) / floors);
    for (let f = 0; f < floors; f++) {
      const topY = f * floorStep;
      ctx.fillStyle = "#f3f6f9";
      ctx.fillRect(0, topY, w, 16);
      ctx.fillStyle = "#4d9bd9";
      ctx.fillRect(0, topY + 16, w, 7);

      const winY = topY + 34;
      const winH = Math.max(58, floorStep - 52);

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

function createQuangTrungBrickYardTexture() {
  // Interlocking warm sandstone, cool granite-grey & terracotta-framed schoolyard pavers
  const tex = createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#928b83";
      ctx.fillRect(0, 0, w, h);

      const cols = 8;
      const rows = 8;
      const warmPalette = ["#ded7ca", "#d6cfc2", "#e3dcd0", "#d9d2c5"];
      const coolPalette = ["#d2d4cf", "#c9ccc7", "#d8dad5"];
      const accentPalette = ["#c48f7e", "#bc8675", "#cb9685"];
      const gap = 3;

      for (let c = 0; c < cols; c++) {
        const x0 = Math.round((c * w) / cols);
        const x1 = Math.round(((c + 1) * w) / cols);
        const bw = x1 - x0 - gap;
        const stagger = c % 2 === 1 ? Math.round(h / (rows * 2)) : 0;

        for (let r = -1; r <= rows; r++) {
          const wr = ((r % rows) + rows) % rows;
          const y0 = Math.round((r * h) / rows) + stagger;
          const y1 = Math.round(((r + 1) * h) / rows) + stagger;
          const bh = y1 - y0 - gap;

          const isAccentBand = c === 0 || c === 4 || wr === 0 || wr === 4;
          const seed = (c * 43 + wr * 79) & 255;
          const palette = isAccentBand
            ? accentPalette
            : (c + wr) % 2 === 0
              ? warmPalette
              : coolPalette;

          ctx.fillStyle = palette[seed % palette.length];
          ctx.fillRect(x0 + 1, y0 + 1, bw, bh);

          // Crisp bevel highlight & shadow for individual paver depth
          ctx.fillStyle = "rgba(255, 252, 246, 0.24)";
          ctx.fillRect(x0 + 1, y0 + 1, bw, 2);
          ctx.fillRect(x0 + 1, y0 + 1, 2, bh);
          ctx.fillStyle = "rgba(70, 64, 58, 0.16)";
          ctx.fillRect(x0 + 1, y0 + bh - 1, bw, 2);
        }
      }

      for (let i = 0; i < 1100; i++) {
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(72, 68, 62, 0.08)" : "rgba(255, 255, 252, 0.09)";
        ctx.fillRect((i * 197 + 11) % w, (i * 331 + 23) % h, 2, 2);
      }
    },
    1,
    1,
  );
  if (tex) tex.anisotropy = 8;
  return tex;
}

function createCentralLaneTexture() {
  const tex = createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#b0aba2";
      ctx.fillRect(0, 0, w, h);

      const cols = 4;
      const rows = 8;
      const granite = ["#dbd8d0", "#d4d1c9", "#e0ddd6", "#cfccc3"];
      for (let c = 0; c < cols; c++) {
        const x0 = Math.round((c * w) / cols);
        const x1 = Math.round(((c + 1) * w) / cols);
        for (let r = 0; r < rows; r++) {
          const y0 = Math.round((r * h) / rows);
          const y1 = Math.round(((r + 1) * h) / rows);
          const seed = (c * 53 + r * 97) & 255;
          ctx.fillStyle = granite[seed % granite.length];
          ctx.fillRect(x0 + 2, y0 + 2, x1 - x0 - 4, y1 - y0 - 4);
          ctx.fillStyle = "rgba(255,255,255,0.22)";
          ctx.fillRect(x0 + 2, y0 + 2, x1 - x0 - 4, 2);
        }
      }
      for (let i = 0; i < 700; i++) {
        ctx.fillStyle =
          i % 2 === 0 ? "rgba(70,68,62,0.06)" : "rgba(255,255,255,0.08)";
        ctx.fillRect((i * 181) % w, (i * 293) % h, 2, 2);
      }
    },
    1,
    1,
  );
  if (tex) tex.anisotropy = 8;
  return tex;
}

function createSoccerBallTexture() {
  return createCanvasTexture(256, 128, (ctx, w, h) => {
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1f2428";
    for (let x = 22; x < w; x += 52) {
      for (let y = 22; y < h; y += 44) {
        ctx.fillRect(x - 10, y - 10, 20, 20);
      }
    }
  });
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

function createNoticeBoardTexture() {
  return createCanvasTexture(512, 320, (ctx, w, h) => {
    ctx.fillStyle = "#0e67be";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#b92228";
    ctx.fillRect(14, 14, w - 28, 58);
    ctx.fillStyle = "#fff8dc";
    ctx.fillRect(18, 82, w - 36, h - 100);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe57a";
    ctx.font = "bold 26px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("BẢNG TIN LIÊN ĐỘI · HOA ĐIỂM MƯỜI", w / 2, 43, w - 40);

    ctx.fillStyle = "#1a4d80";
    ctx.font = "bold 22px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("THI ĐUA DẠY TỐT - HỌC TỐT", w / 2, 126, w - 60);
    ctx.fillStyle = "#2b6b3e";
    ctx.font = "600 18px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("5 ĐIỀU BÁC HỒ DẠY THIẾU NIÊN NHI ĐỒNG", w / 2, 174, w - 60);
    ctx.fillStyle = "#c9382b";
    ctx.fillText("AN TOÀN GIAO THÔNG CỔNG TRƯỜNG", w / 2, 224, w - 60);
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

function createRoundedTreeCurb(x, y, z, outerR = 1.24) {
  const curbGroup = new THREE.Group();
  curbGroup.name = "quang-trung-tree-curb";
  curbGroup.position.set(x, y, z);

  // Rounded masonry ring via LatheGeometry (whitewashed base + sky-blue cap lip)
  const innerR = outerR - 0.22;
  const wallProfile = [
    new THREE.Vector2(innerR, 0),
    new THREE.Vector2(outerR + 0.04, 0),
    new THREE.Vector2(outerR, 0.24),
    new THREE.Vector2(outerR + 0.05, 0.25),
    new THREE.Vector2(outerR + 0.05, 0.31),
    new THREE.Vector2(innerR - 0.02, 0.31),
    new THREE.Vector2(innerR, 0.24),
    new THREE.Vector2(innerR, 0),
  ];
  const curbWall = new THREE.Mesh(
    new THREE.LatheGeometry(wallProfile, 24),
    mat("#f2f5f8", 0.78),
  );
  curbWall.castShadow = curbWall.receiveShadow = true;

  const blueCoping = new THREE.Mesh(
    new THREE.TorusGeometry(outerR - 0.08, 0.075, 8, 24),
    mat("#2479cb", 0.62, 0.05),
  );
  blueCoping.rotation.x = Math.PI / 2;
  blueCoping.position.y = 0.295;
  blueCoping.receiveShadow = true;

  // Dark rich garden soil bed & low circular grass collar inside curb
  const soil = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR - 0.01, innerR, 0.22, 20),
    mat("#4e3c2b", 0.96),
  );
  soil.position.y = 0.11;
  soil.receiveShadow = true;

  const grassRing = new THREE.Mesh(
    new THREE.CylinderGeometry(innerR - 0.06, innerR - 0.04, 0.04, 20),
    mat("#468538", 0.92),
  );
  grassRing.position.y = 0.23;
  grassRing.receiveShadow = true;

  curbGroup.add(curbWall, blueCoping, soil, grassRing);
  return curbGroup;
}

function createBroadShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat("#5e4b3a", 0.92);
  const trunkH = 3.4 * scale;
  const trunkR = 0.27 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.68, trunkR * 1.25, trunkH, 8),
    trunkMat,
  );
  trunk.position.y = trunkH / 2 + 0.15;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  // Whitewashed trunk base common in Hue schools
  const limeBand = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.92, trunkR * 1.28, 0.85, 8),
    mat("#eef2f6", 0.85),
  );
  limeBand.position.y = 0.56;
  g.add(limeBand);

  for (let b = 0; b < 4; b++) {
    const a = (b * Math.PI * 2) / 4 + 0.4;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09 * scale, 0.17 * scale, 2.2 * scale, 6),
      trunkMat,
    );
    branch.position.set(
      Math.cos(a) * 0.72 * scale,
      trunkH + 0.72 * scale,
      Math.sin(a) * 0.72 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.64;
    branch.rotation.x = Math.sin(a) * 0.64;
    branch.castShadow = true;
    g.add(branch);
  }

  const greens = ["#2f6b2b", "#3d7c35", "#4f8f40", "#629d4c"];
  [
    [0, trunkH + 2.1 * scale, 0, 2.35 * scale, 0.58],
    [1.6 * scale, trunkH + 1.55 * scale, 0.9 * scale, 1.72 * scale, 0.56],
    [-1.55 * scale, trunkH + 1.6 * scale, 0.85 * scale, 1.74 * scale, 0.56],
    [0.3 * scale, trunkH + 1.5 * scale, -1.55 * scale, 1.68 * scale, 0.58],
    [-0.95 * scale, trunkH + 2.15 * scale, -0.85 * scale, 1.54 * scale, 0.54],
  ].forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[i % greens.length], 0.86),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.22, sy, 1.18);
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

function createMiniGoal(x, y, z, yaw = 0, name = "quang-trung-mini-goal") {
  const g = new THREE.Group();
  g.name = name;
  g.userData.isMiniGoal = true;
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const w = 3.6;
  const h = 2.0;
  const d = 1.15;
  const white = "#f4f7fa";
  const postMat = mat(white, 0.42, 0.25);
  const redTrim = "#d63b3b";

  // Rounded tubular posts & crossbar
  for (const sx of [-w / 2, w / 2]) {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, h, 10),
      postMat,
    );
    post.position.set(sx, h / 2, 0);
    post.castShadow = true;
    const baseCuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.085, 0.24, 10),
      mat(redTrim, 0.55),
    );
    baseCuff.position.set(sx, 0.12, 0);
    g.add(post, baseCuff);
  }
  const crossbar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, w + 0.1, 10),
    postMat,
  );
  crossbar.rotation.z = Math.PI / 2;
  crossbar.position.set(0, h, 0);
  crossbar.castShadow = true;
  g.add(crossbar);

  g.add(
    box([0.07, 0.07, d], white, [-w / 2, 0.035, -d / 2]),
    box([0.07, 0.07, d], white, [w / 2, 0.035, -d / 2]),
    box([w, 0.07, 0.07], white, [0, 0.035, -d]),
    box([0.06, h, 0.06], white, [-w / 2, h / 2, -d * 0.72]),
    box([0.06, h, 0.06], white, [w / 2, h / 2, -d * 0.72]),
    box([w, 0.06, 0.06], white, [0, h, -d * 0.72]),
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

function createCourtLineStrip(w, d, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, d),
    new THREE.MeshStandardMaterial({
      color: "#f7fafc",
      transparent: true,
      opacity: 0.86,
      roughness: 0.88,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  return mesh;
}

function createGuardHouse(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "quang-trung-guard-house";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  g.add(
    box([2.5, 0.16, 2.3], "#9ca4ad", [0, 0.08, 0]),
    box([2.3, 2.35, 2.1], "#eaf2f9", [0, 1.32, 0]),
    box([2.34, 0.75, 2.14], "#b7cce0", [0, 0.54, 0]),
    box([1.45, 0.9, 0.08], "#24435c", [0, 1.65, 1.05]),
    box([1.55, 0.12, 0.2], "#f4f7fa", [0, 1.18, 1.06]),
    box([2.7, 0.24, 2.5], "#1c74c7", [0, 2.6, 0]),
    box([2.85, 0.1, 2.65], "#f4f7fa", [0, 2.75, 0]),
  );
  const signTex = createBannerTexture("PHÒNG BẢO VỆ", "", "#0e67be");
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 0.36),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#0e67be",
      map: signTex,
      roughness: 0.45,
    }),
  );
  sign.position.set(0, 2.32, 1.08);
  g.add(sign);
  return g;
}

function createSchoolDrumStand(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "quang-trung-school-drum";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const woodMat = mat("#6b3f23", 0.76);
  for (const sx of [-0.36, 0.36]) {
    const legA = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.25, 0.08), woodMat);
    legA.position.set(sx, 0.56, 0);
    legA.rotation.x = 0.42;
    const legB = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.25, 0.08), woodMat);
    legB.position.set(sx, 0.56, 0);
    legB.rotation.x = -0.42;
    g.add(legA, legB);
  }
  const barrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.32, 0.82, 14),
    mat("#b82924", 0.55),
  );
  barrel.rotation.z = Math.PI / 2;
  barrel.position.y = 0.96;
  barrel.castShadow = true;
  const head = new THREE.Mesh(
    new THREE.CylinderGeometry(0.31, 0.31, 0.84, 14),
    mat("#ede1c2", 0.82),
  );
  head.rotation.z = Math.PI / 2;
  head.position.y = 0.96;
  g.add(barrel, head);
  return g;
}

function createParkedMotorbike(bodyColor = "#c83232", yaw = 0) {
  const g = new THREE.Group();
  g.rotation.y = yaw;
  const tireMat = mat("#202428", 0.85);
  for (const wz of [-0.46, 0.46]) {
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.055, 8, 14),
      tireMat,
    );
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.24, wz);
    g.add(wheel);
  }
  g.add(
    box([0.28, 0.34, 0.92], bodyColor, [0, 0.52, -0.02]),
    box([0.24, 0.14, 0.56], "#272b30", [0, 0.72, -0.14]),
    box([0.24, 0.48, 0.24], bodyColor, [0, 0.66, 0.34]),
    box([0.52, 0.06, 0.08], "#2c3136", [0, 0.96, 0.36]),
    box([0.16, 0.14, 0.08], "#f4f0cc", [0, 0.82, 0.47]),
  );
  return g;
}

function createParkedBicycle(frameColor = "#2684d4", yaw = 0) {
  const g = new THREE.Group();
  g.rotation.y = yaw;
  const tireMat = mat("#23272b", 0.85);
  for (const wx of [-0.4, 0.4]) {
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.032, 6, 14),
      tireMat,
    );
    wheel.position.set(wx, 0.24, 0);
    g.add(wheel);
  }
  g.add(
    box([0.62, 0.05, 0.05], frameColor, [0, 0.52, 0]),
    box([0.05, 0.44, 0.05], frameColor, [-0.14, 0.42, 0]),
    box([0.05, 0.56, 0.05], "#cfd6dd", [0.3, 0.5, 0]),
    box([0.12, 0.05, 0.34], "#262a2e", [0.3, 0.78, 0]),
  );
  return g;
}

function createSchoolParkingLot(gate, facingGateYaw) {
  const lot = new THREE.Group();
  lot.name = "quang-trung-parking-lot";
  lot.position.set(gate.x, 0, gate.z);
  lot.rotation.y = facingGateYaw;

  // Dedicated paved parking zone beside East classroom wing: side [+29.7..+36.7], fwd [8.8..62.0]
  const lotCenterX = 33.2;
  const lotCenterZ = -35.4;
  const lotW = 6.9;
  const lotD = 53.2;

  const asphalt = new THREE.Mesh(
    new THREE.BoxGeometry(lotW, 0.032, lotD),
    mat("#494f57", 0.92),
  );
  asphalt.position.set(lotCenterX, 0.3, lotCenterZ);
  asphalt.receiveShadow = true;
  lot.add(asphalt);

  // Curbed border separating parking zone from inner walkway & fence (leaving opening at cổng phụ fwd 55.8..61.2)
  lot.add(
    box([0.16, 0.08, lotD], "#e5e8ec", [29.8, 0.32, lotCenterZ]),
    box([0.16, 0.08, 47.0], "#e5e8ec", [36.6, 0.32, -32.3]),
    box([0.16, 0.08, 0.8], "#e5e8ec", [36.6, 0.32, -61.6]),
  );

  // Yellow entry guide lane lines along left side of parking lot (x = 30.8)
  for (let z = -10.5; z >= -59.0; z -= 3.2) {
    lot.add(createCourtLineStrip(0.14, 1.8, 31.35, 0.318, z));
  }

  // Painted parking bays on right side (x = 32.0..36.2)
  for (let z = -12.5; z >= -55.0; z -= 2.2) {
    lot.add(createCourtLineStrip(3.9, 0.09, 34.25, 0.318, z));
  }

  // Shelter 1: NHÀ XE CÁN BỘ · KHÁCH (overflow along East wall, fwd 12.5..28.5 -> z = -20.5)
  const teacherShelter = new THREE.Group();
  teacherShelter.position.set(34.1, 0.3, -20.5);
  for (const sx of [-1.85, 1.85]) {
    for (const sz of [-7.5, -2.5, 2.5, 7.5]) {
      teacherShelter.add(box([0.12, 2.55, 0.12], "#dce3ea", [sx, 1.28, sz]));
    }
  }
  const tRoof = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.12, 16.4),
    mat("#1c73c4", 0.5, 0.2),
  );
  tRoof.position.set(0, 2.65, 0);
  tRoof.rotation.z = -0.12;
  tRoof.castShadow = true;
  teacherShelter.add(tRoof);

  const teacherSignTex = createBannerTexture("NHÀ XE CÁN BỘ · KHÁCH", "KHU VỰC XE MÁY", "#0b5da8");
  const teacherSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.58),
    new THREE.MeshStandardMaterial({
      color: teacherSignTex ? "#ffffff" : "#0b5da8",
      map: teacherSignTex,
      roughness: 0.45,
    }),
  );
  teacherSign.position.set(0, 2.38, 8.24);
  teacherShelter.add(teacherSign);

  const motoColors = ["#c83232", "#1f252c", "#2d64b8", "#e8e6e0", "#8b2f3f", "#455a64"];
  for (let i = 0; i < 6; i++) {
    const mz = -6.2 + i * 2.45;
    const moto = createParkedMotorbike(motoColors[i % motoColors.length], -Math.PI * 0.42);
    moto.position.set(0.25, 0.02, mz);
    teacherShelter.add(moto);
  }
  lot.add(teacherShelter);

  // Shelter 2: NHÀ XE HỌC SINH (Bicycles, fwd 34.5..54.5 -> z = -44.5)
  const studentShelter = new THREE.Group();
  studentShelter.position.set(34.1, 0.3, -44.5);
  for (const sx of [-1.85, 1.85]) {
    for (const sz of [-9.2, -3.1, 3.1, 9.2]) {
      studentShelter.add(box([0.12, 2.4, 0.12], "#dce3ea", [sx, 1.2, sz]));
    }
  }
  const sRoof = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.12, 19.6),
    mat("#2483d6", 0.52, 0.18),
  );
  sRoof.position.set(0, 2.5, 0);
  sRoof.rotation.z = -0.12;
  sRoof.castShadow = true;
  studentShelter.add(sRoof);

  // Galvanized bike rack rail
  studentShelter.add(box([0.14, 0.32, 17.4], "#aeb7c0", [1.3, 0.16, 0]));

  const studentSignTex = createBannerTexture("NHÀ XE HỌC SINH", "KHU VỰC XE ĐẠP", "#156cb8");
  const studentSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.58),
    new THREE.MeshStandardMaterial({
      color: studentSignTex ? "#ffffff" : "#156cb8",
      map: studentSignTex,
      roughness: 0.45,
    }),
  );
  studentSign.position.set(0, 2.25, 9.84);
  studentShelter.add(studentSign);

  const bikeColors = ["#e04b5a", "#2684d4", "#31a354", "#f0b429", "#7b5cc7", "#f26b38", "#2fa4a9", "#d64579"];
  for (let i = 0; i < 8; i++) {
    const bz = -7.7 + i * 2.2;
    const bike = createParkedBicycle(bikeColors[i % bikeColors.length], 0);
    bike.position.set(0.25, 0.02, bz);
    studentShelter.add(bike);
  }
  lot.add(studentShelter);

  // Guard booth & barrier at parking entrance (fwd = 9.8 -> z = -9.8)
  const booth = new THREE.Group();
  booth.name = "quang-trung-parking-booth";
  booth.position.set(35.1, 0.3, -9.8);
  booth.add(
    box([1.85, 2.2, 1.75], "#eaf2f9", [0, 1.1, 0]),
    box([1.89, 0.72, 1.79], "#1c73c4", [0, 0.38, 0]),
    box([1.2, 0.82, 0.08], "#24435c", [-0.94, 1.45, 0]),
    box([2.2, 0.18, 2.1], "#1967b2", [0, 2.28, 0]),
    // Raised yellow/black barie arm
    box([0.16, 0.95, 0.16], "#e5a922", [-1.3, 0.48, 0.6]),
    box([0.08, 0.08, 2.2], "#f4c430", [-1.3, 1.55, -0.3]),
  );
  lot.add(booth);

  return lot;
}

function createTeacherParkingRow(gate, facingGateYaw) {
  // Row of teachers' parking sheds immediately inside the right side of the gate along the front-right perimeter wall:
  // side = +13.0 .. +35.4, fwd = +0.7 .. +4.7 (local z = -0.7 .. -4.7)
  const row = new THREE.Group();
  row.name = "quang-trung-teacher-parking-row";
  row.position.set(gate.x, 0, gate.z);
  row.rotation.y = facingGateYaw;

  const centerSide = 24.2;
  const shedLen = 22.0;
  const shedDepth = 3.8;
  const centerZ = -2.6;

  // Paved asphalt parking apron & curbed courtyard edge
  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(shedLen + 1.0, 0.036, shedDepth + 1.1),
    mat("#4c535b", 0.92),
  );
  pad.position.set(centerSide, 0.302, centerZ - 0.15);
  pad.receiveShadow = true;
  row.add(pad);

  // White concrete curb border along courtyard edge (fwd = 5.05 -> z = -5.05) & wheel stop bar along wall
  row.add(
    box([shedLen + 1.0, 0.08, 0.16], "#eef2f6", [centerSide, 0.32, -5.05]),
    box([shedLen - 0.4, 0.12, 0.14], "#cfd6dd", [centerSide, 0.36, -1.1]),
  );

  // White parking bay lines
  for (let x = centerSide - 9.6; x <= centerSide + 9.6; x += 2.4) {
    row.add(createCourtLineStrip(0.09, shedDepth - 0.3, x, 0.322, centerZ - 0.1));
  }

  // Steel pillars (7 bays along the wall)
  const shelter = new THREE.Group();
  shelter.position.set(centerSide, 0.3, centerZ);
  for (let px = -10.5; px <= 10.5; px += 3.5) {
    shelter.add(
      box([0.13, 2.38, 0.13], "#dce3ea", [px, 1.19, 1.65]),
      box([0.13, 2.7, 0.13], "#dce3ea", [px, 1.35, -1.65]),
    );
    // Sloped roof truss rafter
    const rafter = box([0.1, 0.1, 3.7], "#cfd7df", [px, 2.55, 0]);
    rafter.rotation.x = -0.1;
    shelter.add(rafter);
  }

  // Horizontal steel purlins & back guardrail along perimeter wall
  shelter.add(
    box([shedLen, 0.09, 0.09], "#cfd7df", [0, 2.38, 1.65]),
    box([shedLen, 0.09, 0.09], "#cfd7df", [0, 2.7, -1.65]),
    box([shedLen - 0.2, 0.08, 0.08], "#98a4b0", [0, 0.72, 1.68]),
  );

  // Cobalt-blue corrugated metal roof sloping toward the perimeter wall
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(shedLen + 0.6, 0.11, shedDepth + 0.5),
    mat("#1c73c4", 0.48, 0.22),
  );
  roof.position.set(0, 2.63, 0);
  roof.rotation.x = -0.1;
  roof.castShadow = roof.receiveShadow = true;
  shelter.add(roof);

  // White roof fascia trim & signboard facing inward toward the schoolyard
  shelter.add(box([shedLen + 0.64, 0.16, 0.08], "#f3f6fa", [0, 2.82, -2.14]));

  const signTex = createBannerTexture(
    "NHÀ GIỮ XE GIÁO VIÊN",
    "KHU VỰC ĐỂ XE CÁN BỘ · GIÁO VIÊN",
    "#0b5da8",
  );
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.8, 0.66),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#0b5da8",
      map: signTex,
      roughness: 0.45,
    }),
  );
  sign.position.set(0, 2.44, -2.18);
  sign.rotation.y = Math.PI;
  shelter.add(sign);

  // Neat row of parked teachers' motorbikes & bicycles facing into the yard
  const teacherMotoColors = [
    "#1f252c",
    "#c83232",
    "#2d64b8",
    "#e8e6e0",
    "#455a64",
    "#8b2f3f",
    "#2e6b5e",
    "#c9792b",
  ];
  for (let i = 0; i < 8; i++) {
    const mx = -9.0 + i * 2.15;
    const moto = createParkedMotorbike(
      teacherMotoColors[i % teacherMotoColors.length],
      Math.PI + 0.12,
    );
    moto.position.set(mx, 0.02, 0.05);
    shelter.add(moto);
  }
  const teacherBikeColors = ["#2684d4", "#31a354", "#e04b5a"];
  for (let i = 0; i < 3; i++) {
    const bx = 7.4 + i * 1.45;
    const bike = createParkedBicycle(
      teacherBikeColors[i % teacherBikeColors.length],
      Math.PI * 0.5,
    );
    bike.position.set(bx, 0.02, 0.05);
    shelter.add(bike);
  }

  row.add(shelter);
  return row;
}

function createGreenLibraryZone(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "quang-trung-green-library";
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  // Pergola shade frame & green roof louvers
  const frameMat = mat("#f3f6f9", 0.72);
  for (const sx of [-1.7, 1.7]) {
    for (const sz of [-2.6, 2.6]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.7, 0.16), frameMat);
      col.position.set(sx, 1.35, sz);
      col.castShadow = true;
      g.add(col);
    }
  }
  for (let bz = -2.7; bz <= 2.7; bz += 0.65) {
    g.add(box([3.8, 0.08, 0.12], "#2b7ec9", [0, 2.74, bz]));
  }
  g.add(
    box([0.55, 0.08, 4.4], "#d9b066", [-0.7, 0.44, 0]),
    box([0.55, 0.08, 4.4], "#d9b066", [0.7, 0.44, 0]),
    box([0.8, 0.65, 3.8], "#1c78c8", [0, 0.55, 0]),
    box([0.95, 0.08, 4.0], "#f7f4ec", [0, 0.9, 0]),
  );

  // Ceramic student handwash trough (bồn rửa tay học sinh) at front edge
  g.add(
    box([2.2, 0.65, 0.58], "#eef4f7", [0, 0.325, 3.6]),
    box([2.1, 0.08, 0.48], "#7ec4cf", [0, 0.66, 3.6]),
    box([0.08, 0.25, 0.08], "#c8d2dc", [-0.6, 0.8, 3.45]),
    box([0.08, 0.25, 0.08], "#c8d2dc", [0, 0.8, 3.45]),
    box([0.08, 0.25, 0.08], "#c8d2dc", [0.6, 0.8, 3.45]),
  );
  return g;
}

function createFlowerPlanterPot(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.22, 0.36, 12),
    mat("#d96b43", 0.82),
  );
  pot.position.y = 0.18;
  const foliage = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.36, 1),
    mat("#3e8238", 0.88),
  );
  foliage.position.y = 0.44;
  const blossoms = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.28, 0),
    mat("#f6c632", 0.72),
  );
  blossoms.position.y = 0.58;
  g.add(pot, foliage, blossoms);
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
    new THREE.CylinderGeometry(0.48, 0.6, 0.3, 12),
    baseMat,
  );
  plinth.position.y = 0.15;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.36, 0.24, 12),
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
    this.vendorAnimations = [];
    this.cafeUpdaters = [];
    this.campusBuildingPolygons = [];
    this.cafePolygons = [];
    this.cafeLotBounds = [];
    this.obstacles = [];
    this.outsideObstacles = [];
    this.vendorPoints = [];

    this.buildCourtyard();
    this.buildBuildings();
    this.buildParkingLot();
    this.buildParkingSideGate();
    this.buildGreenery();
    this.buildPrimarySchoolProps();
    this.buildStreetVendors();
    this.buildCafes();
    this.buildStudents();
    this.buildTeachers();

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

  inCafeLot(wx, wz, pad = 0) {
    if (!this.cafeLotBounds.length) return false;
    const { side, fwd } = this.toLocal(wx, wz);
    return this.cafeLotBounds.some(
      (b) =>
        side >= b.minSide - pad &&
        side <= b.maxSide + pad &&
        fwd >= b.minFwd - pad &&
        fwd <= b.maxFwd + pad,
    );
  }

  hitsOutsideProp(wx, wz, extraPad = 0) {
    if (!this.outsideObstacles.length) return false;
    const { side, fwd } = this.toLocal(wx, wz);
    return this.outsideObstacles.some(
      (o) => Math.hypot(side - o.side, fwd - o.fwd) < o.radius + extraPad,
    );
  }

  buildCourtyard() {
    const yardTex = createQuangTrungBrickYardTexture();
    const laneTex = createCentralLaneTexture();
    const flagTex = createVietnamFlagTexture();
    const tileMeters = 2.4;

    const yardMat = new THREE.MeshStandardMaterial({
      color: yardTex ? "#ffffff" : "#d6cfc2",
      map: yardTex,
      roughness: 0.86,
      metalness: 0.02,
      side: THREE.DoubleSide,
    });
    const yardGeo = polygonGeometry(this.campusRings[0], 0.14);
    if (yardGeo.attributes.uv && yardGeo.attributes.position) {
      const uv = yardGeo.attributes.uv;
      const pos = yardGeo.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        const { side, fwd } = this.toLocal(pos.getX(i), pos.getZ(i));
        uv.setXY(i, side / tileMeters, -fwd / tileMeters);
      }
      uv.needsUpdate = true;
    }
    const yardMesh = new THREE.Mesh(yardGeo, yardMat);
    yardMesh.position.y = 0.16;
    yardMesh.receiveShadow = true;
    this.group.add(yardMesh);

    const yard = new THREE.Group();
    yard.name = "quang-trung-courtyard";
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    // Straight central avenue from school gate (fwd = -0.8) straight to ceremonial stage (fwd = 50.0)
    const laneLen = 50.8;
    const laneGeo = new THREE.BoxGeometry(6.4, 0.032, laneLen);
    if (laneGeo.attributes.uv && laneGeo.attributes.position) {
      const uv = laneGeo.attributes.uv;
      const pos = laneGeo.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, pos.getX(i) / 3.0, pos.getZ(i) / 3.0);
      }
      uv.needsUpdate = true;
    }
    const centralLane = new THREE.Mesh(
      laneGeo,
      new THREE.MeshStandardMaterial({
        color: laneTex ? "#ffffff" : "#d8d5cd",
        map: laneTex,
        roughness: 0.8,
        metalness: 0.03,
      }),
    );
    centralLane.name = "quang-trung-central-lane";
    centralLane.position.set(0, 0.298, -24.6);
    centralLane.receiveShadow = true;
    yard.add(centralLane);

    // Crisp curb borders along both edges of the central avenue
    for (const sx of [-3.28, 3.28]) {
      yard.add(box([0.16, 0.055, laneLen], "#f3f6f9", [sx, 0.305, -24.6]));
    }

    // Ceremonial red carpet runner down center avenue approaching stage
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.018, 33.5),
      mat("#a72631", 0.9),
    );
    carpet.position.set(0, 0.318, -32.2);
    carpet.receiveShadow = true;
    yard.add(carpet);

    // Ceremonial elevated stage & backdrop pavilion in front of North portico (fwd = 52.4)
    const stageGroup = new THREE.Group();
    stageGroup.name = "quang-trung-stage";
    stageGroup.position.set(0, 0.3, -52.4);
    const stageDeck = box([12.2, 0.44, 4.6], "#d6d1c6", [0, 0.22, 0]);
    const stageSteps = box([6.6, 0.22, 0.75], "#e2ddd3", [0, 0.11, 2.65]);
    const stageCarpet = box([11.4, 0.04, 4.0], "#a72631", [0, 0.46, 0]);
    const podium = box([0.82, 1.08, 0.56], "#7a3b20", [-3.8, 0.98, 1.15]);
    const backdropTex = createStageBackdropTexture();
    const backdropPanel = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 4.2, 0.16),
      new THREE.MeshStandardMaterial({
        color: backdropTex ? "#ffffff" : "#195ca6",
        map: backdropTex,
        roughness: 0.55,
      }),
    );
    backdropPanel.position.set(0, 2.55, -2.0);
    const stageRoof = box([11.8, 0.18, 4.6], "#2b7ecb", [0, 4.78, -0.2]);
    stageGroup.add(
      stageDeck,
      stageSteps,
      stageCarpet,
      podium,
      backdropPanel,
      stageRoof,
      box([0.22, 4.3, 0.22], "#f4f6f9", [-5.4, 2.55, 1.9]),
      box([0.22, 4.3, 0.22], "#f4f6f9", [5.4, 2.55, 1.9]),
    );
    for (const px of [-5.2, -3.9, 3.9, 5.2]) {
      stageGroup.add(createFlowerPlanterPot(px, 0.0, 2.45));
    }
    yard.add(stageGroup);
    this.obstacles.push({ side: 0, fwd: 52.4, radius: 3.6 });

    // Ceremonial flagpole (just left of stage)
    const fp = createFlagpole(-8.4, 0.3, -49.0, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);
    this.obstacles.push({ side: -8.4, fwd: 49.0, radius: 1.15 });

    // Courtyard manicured front border garden bed on the left side of the gate (right side hosts teacher parking shed row along wall)
    const lawnMat = createManicuredLawnMaterial(4, 4, { striped: false, rich: true });
    const leftBed = new THREE.Mesh(new THREE.BoxGeometry(16.0, 0.14, 3.2), lawnMat);
    leftBed.position.set(-18.0, 0.3, -3.2);
    leftBed.receiveShadow = true;
    yard.add(leftBed);

    // LEFT BRICK COURTYARD: 2 football goals facing each other on brick pavement (side = -14.8, fwd = 14.2 .. 43.8)
    const pitchGroup = new THREE.Group();
    pitchGroup.name = "quang-trung-left-pitch";
    const pitchSide = -14.8;
    const pitchCenterFwd = 29.0;
    const pitchW = 11.4;
    const pitchL = 29.6;
    const lineY = 0.312;

    pitchGroup.add(
      createCourtLineStrip(pitchW, 0.11, pitchSide, lineY, -(pitchCenterFwd - pitchL / 2)),
      createCourtLineStrip(pitchW, 0.11, pitchSide, lineY, -(pitchCenterFwd + pitchL / 2)),
      createCourtLineStrip(0.11, pitchL, pitchSide - pitchW / 2, lineY, -pitchCenterFwd),
      createCourtLineStrip(0.11, pitchL, pitchSide + pitchW / 2, lineY, -pitchCenterFwd),
      createCourtLineStrip(pitchW, 0.11, pitchSide, lineY, -pitchCenterFwd),
    );
    // Penalty area lines in front of both goals
    for (const [gFwd, dir] of [
      [14.2, -1],
      [43.8, 1],
    ]) {
      pitchGroup.add(
        createCourtLineStrip(5.6, 0.1, pitchSide, lineY, -(gFwd - dir * 3.2)),
        createCourtLineStrip(0.1, 3.2, pitchSide - 2.8, lineY, -(gFwd - dir * 1.6)),
        createCourtLineStrip(0.1, 3.2, pitchSide + 2.8, lineY, -(gFwd - dir * 1.6)),
      );
    }
    const centerCircle = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.22, 28),
      new THREE.MeshStandardMaterial({
        color: "#f7fafc",
        transparent: true,
        opacity: 0.85,
        roughness: 0.88,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    );
    centerCircle.rotation.x = -Math.PI / 2;
    centerCircle.position.set(pitchSide, lineY, -pitchCenterFwd);
    pitchGroup.add(centerCircle);

    // Classic soccer ball resting near center spot
    const ballTex = createSoccerBallTexture();
    const soccerBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 14, 12),
      new THREE.MeshStandardMaterial({
        color: ballTex ? "#ffffff" : "#f4f6f8",
        map: ballTex,
        roughness: 0.52,
      }),
    );
    soccerBall.name = "quang-trung-soccer-ball";
    soccerBall.position.set(pitchSide + 0.6, 0.51, -pitchCenterFwd + 1.2);
    soccerBall.castShadow = true;
    pitchGroup.add(soccerBall);
    yard.add(pitchGroup);

    // 2 football goals on the left brick courtyard
    yard.add(
      createMiniGoal(pitchSide, 0.3, -14.2, Math.PI, "quang-trung-mini-goal"),
    );
    this.obstacles.push({ side: pitchSide, fwd: 13.7, radius: 1.55 });
    yard.add(
      createMiniGoal(pitchSide, 0.3, -43.8, 0, "quang-trung-mini-goal-north"),
    );
    this.obstacles.push({ side: pitchSide, fwd: 44.3, radius: 1.55 });

    // Right courtyard mini basketball half-court on brick yard (inside side 9..18, clear of East wing)
    yard.add(createBasketballHoop(18.0, 0.3, -23.5, -Math.PI * 0.5));
    this.obstacles.push({ side: 18.0, fwd: 23.5, radius: 1.35 });
    yard.add(
      createCourtLineStrip(0.11, 12.0, 10.0, lineY, -23.5),
      createCourtLineStrip(8.0, 0.11, 14.0, lineY, -17.5),
      createCourtLineStrip(8.0, 0.11, 14.0, lineY, -29.5),
    );

    // Festive overhead bunting strands spanning from West wing to East wing
    const buntingGroup = new THREE.Group();
    buntingGroup.name = "quang-trung-bunting";
    const anchorA = new THREE.Vector3(-24.0, 6.8, -21.0);
    const anchorB = new THREE.Vector3(20.6, 6.8, -21.0);
    const anchorC = new THREE.Vector3(-24.0, 6.9, -44.0);
    const anchorD = new THREE.Vector3(20.6, 6.9, -44.0);
    const anchorE = new THREE.Vector3(-14.0, 7.0, -59.0);
    const anchorF = new THREE.Vector3(14.0, 7.0, -59.0);
    for (const [p1, p2] of [
      [anchorA, anchorB],
      [anchorC, anchorD],
      [anchorA, anchorD],
      [anchorB, anchorC],
      [anchorC, anchorF],
      [anchorD, anchorE],
    ]) {
      buntingGroup.add(createBuntingStrand(p1, p2, 0.72));
    }
    yard.add(buntingGroup);

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

      const wingCenter = this.toWorld(-28.75, 38.1);
      const wingRoof = createHipRoofMesh(44.4, 8.6, 2.2, roofMat);
      wingRoof.position.set(wingCenter.x, 0.28 + wallHeight, wingCenter.z);
      wingRoof.rotation.y = this.facingGateYaw + Math.PI * 0.5;
      this.group.add(wingRoof);

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

    // 2) North Rear 3-story classroom wing + central projecting 2-story portico (fwd 57.1..70.9)
    const nW = 46.0;
    const nD = 9.4;
    const nH = 10.6;
    const northCorners = [
      this.toWorld(-21.5, 61.5),
      this.toWorld(-4.2, 61.5),
      this.toWorld(-4.2, 57.1),
      this.toWorld(4.2, 57.1),
      this.toWorld(4.2, 61.5),
      this.toWorld(24.5, 61.5),
      this.toWorld(24.5, 70.9),
      this.toWorld(-21.5, 70.9),
    ];
    this.campusBuildingPolygons.push([...northCorners, northCorners[0]]);

    const northWingGroup = new THREE.Group();
    northWingGroup.name = "quang-trung-north-wing";
    const nc = this.toWorld(1.5, 66.2);
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

    // Central projecting 2-story lobby/portico matching school 3D layout
    const portico = new THREE.Group();
    portico.name = "quang-trung-north-portico";
    portico.position.set(-1.5, 0, nD / 2 + 2.2);
    const wallTex2 = createIceBlueWingWallTexture(2);
    const porticoBody = new THREE.Mesh(
      new THREE.BoxGeometry(8.4, 7.0, 4.4),
      new THREE.MeshStandardMaterial({
        color: wallTex2 ? "#ffffff" : "#b7cce0",
        map: wallTex2,
        roughness: 0.74,
      }),
    );
    porticoBody.position.y = 3.5;
    porticoBody.castShadow = porticoBody.receiveShadow = true;
    portico.add(
      porticoBody,
      box([8.9, 0.28, 4.8], "#2c82d2", [0, 7.12, 0]),
      box([9.0, 0.14, 4.9], "#f3f6fa", [0, 7.32, 0]),
      box([3.2, 2.7, 0.12], "#1f3242", [0, 1.4, 2.22]),
      box([4.8, 0.22, 1.1], "#2c82d2", [0, 3.35, 2.45]),
    );
    northWingGroup.add(portico);
    this.world.cameraObstacles.push(porticoBody);

    const nAwning = new THREE.Mesh(
      new THREE.BoxGeometry(nW - 0.5, 0.22, 1.85),
      canopyMat,
    );
    nAwning.position.set(0, 3.6, nD / 2 + 0.85);
    northWingGroup.add(nAwning);
    for (let sx = -21.0; sx <= 21.0; sx += 5.25) {
      northWingGroup.add(
        box([0.38, 3.6, 0.38], "#f3f6fa", [sx, 1.8, nD / 2 + 1.45]),
      );
    }

    const sloganTex = createBannerTexture(
      "VÌ LỢI ÍCH MƯỜI NĂM TRỒNG CÂY, VÌ LỢI ÍCH TRĂM NĂM TRỒNG NGƯỜI",
      "",
      "#0a63bd",
    );
    const sloganPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(20.0, 1.55),
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
      new THREE.PlaneGeometry(7.6, 1.35),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: lowerBannerTex,
        roughness: 0.45,
      }),
    );
    lowerBanner.position.set(-1.5, 4.35, nD / 2 + 4.46);
    northWingGroup.add(lowerBanner);

    this.group.add(northWingGroup);

    // 3) East 3-story classroom wing completing the U-shaped campus (side 21.5..29.1, fwd 15.5..58.8)
    const eW = 7.6;
    const eD = 43.3;
    const eH = 10.6;
    const eastCorners = [
      this.toWorld(21.5, 15.5),
      this.toWorld(29.1, 15.5),
      this.toWorld(29.1, 58.8),
      this.toWorld(21.5, 58.8),
    ];
    this.campusBuildingPolygons.push([...eastCorners, eastCorners[0]]);

    const eastWingGroup = new THREE.Group();
    eastWingGroup.name = "quang-trung-east-wing";
    const ec = this.toWorld(25.3, 37.15);
    eastWingGroup.position.set(ec.x, 0.28, ec.z);
    eastWingGroup.rotation.y = this.facingGateYaw;

    const eBodyGeo = new THREE.BoxGeometry(eW, eH, eD);
    if (eBodyGeo.attributes.uv) {
      const uv = eBodyGeo.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        uv.setX(i, uv.getX(i) * 4.2);
      }
    }
    const eBody = new THREE.Mesh(eBodyGeo, wallMat3);
    eBody.position.y = eH / 2;
    eBody.castShadow = eBody.receiveShadow = true;
    eastWingGroup.add(eBody);
    this.world.cameraObstacles.push(eBody);

    const eRoof = createHipRoofMesh(eD + 0.8, eW + 0.8, 2.2, roofMat);
    eRoof.position.y = eH;
    eRoof.rotation.y = Math.PI * 0.5;
    eastWingGroup.add(eRoof);

    // Inward-facing blue ground-floor verandah awning + white square colonnade columns
    const eAwning = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.22, eD - 1.1),
      canopyMat,
    );
    eAwning.position.set(-eW / 2 - 0.9, 3.57, 0);
    eAwning.castShadow = true;
    eastWingGroup.add(eAwning);

    for (let f = 16.8; f <= 57.8; f += 5.12) {
      const cp = this.toWorld(20.05, f);
      const col = new THREE.BoxGeometry(0.38, 3.6, 0.38);
      col.rotateY(this.facingGateYaw);
      col.translate(cp.x, 0.28 + 1.8, cp.z);
      colonnadeParts.push(col);
    }

    for (const lvY of [4.25, 7.65]) {
      for (let f = 18.2; f <= 56.2; f += 4.2) {
        const pp = this.toWorld(21.25, f);
        const planter = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.36, 1.3),
          mat("#edece7", 0.78),
        );
        planter.position.set(pp.x, lvY, pp.z);
        planter.rotation.y = this.facingGateYaw;
        this.group.add(planter);
      }
    }

    this.group.add(eastWingGroup);

    if (colonnadeParts.length) {
      const m = new THREE.Mesh(mergeGeometries(colonnadeParts), trimMat);
      m.castShadow = m.receiveShadow = true;
      this.group.add(m);
      colonnadeParts.forEach((p) => p.dispose());
    }
  }

  buildParkingLot() {
    const teacherRow = createTeacherParkingRow(this.gate, this.facingGateYaw);
    this.group.add(teacherRow);
    for (const side of [14.5, 17.5, 20.5, 23.5, 26.5, 29.5, 32.5, 34.5]) {
      this.obstacles.push({ side, fwd: 2.6, radius: 1.9 });
    }

    const lot = createSchoolParkingLot(this.gate, this.facingGateYaw);
    this.group.add(lot);
    // Shelters & booth block riding while leaving left aisle (side 30.0..31.8) & rear cổng phụ passable
    for (const fwd of [16, 20, 24, 27, 38, 42, 47, 52]) {
      this.obstacles.push({ side: 34.4, fwd, radius: 2.0 });
    }
    this.obstacles.push({ side: 35.1, fwd: 9.8, radius: 1.5 });
  }

  buildParkingSideGate() {
    // Secondary gate (cổng phụ) at far end of Quang Trung teacher parking lot (side = 37.2, fwd = 58.5)
    // opening straight toward Rose Garden Café's West Side Gate (side = 39.0, fwd = 58.5)
    const gateSide = 37.2;
    const gateFwd = 58.5;
    const gPos = this.toWorld(gateSide, gateFwd);

    const sideGate = new THREE.Group();
    sideGate.name = "quang-trung-side-gate";
    sideGate.position.set(gPos.x, 0, gPos.z);
    sideGate.rotation.y = this.facingGateYaw;

    // Paved passage apron connecting parking lot edge -> East school wall -> Rose Garden West Gate
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.06, 5.4),
      mat("#585f66", 0.88),
    );
    apron.position.set(0.85, 0.27, 0);
    apron.receiveShadow = true;
    sideGate.add(apron);

    // Twin gate piers (local z = ±2.7 -> fwd = 55.8 & 61.2)
    for (const sz of [-2.7, 2.7]) {
      sideGate.add(
        box([0.68, 3.25, 0.68], "#f4f7fa", [0, 1.8, sz]),
        box([0.78, 0.22, 0.78], "#1c73c4", [0, 3.5, sz]),
        box([0.74, 0.2, 0.74], "#1c73c4", [0, 0.38, sz]),
      );
      this.obstacles.push({ side: gateSide, fwd: gateFwd - sz, radius: 0.55 });

      // Swung-open cobalt steel gate leaf folded inward toward parking edge
      const leaf = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 1.85, 0.08),
        mat("#1a6fc2", 0.5, 0.35),
      );
      leaf.position.set(-1.1, 1.22, sz < 0 ? sz + 0.14 : sz - 0.14);
      sideGate.add(leaf);
    }

    // Overhead transom beam & double-sided cổng phụ sign
    sideGate.add(box([0.45, 0.72, 6.2], "#0e67be", [0, 3.85, 0]));
    const bannerTex = createBannerTexture(
      "CỔNG PHỤ · BÃI XE GIÁO VIÊN",
      "THÔNG SANG ROSE GARDEN CAFÉ",
      "#0e67be",
    );
    const signMat = new THREE.MeshStandardMaterial({
      color: bannerTex ? "#ffffff" : "#0e67be",
      map: bannerTex,
      roughness: 0.44,
    });
    const eastFace = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.66), signMat);
    eastFace.position.set(0.24, 3.85, 0);
    eastFace.rotation.y = Math.PI / 2;
    const westFace = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 0.66), signMat);
    westFace.position.set(-0.24, 3.85, 0);
    westFace.rotation.y = -Math.PI / 2;
    sideGate.add(eastFace, westFace);

    this.group.add(sideGate);
  }

  buildGreenery() {
    // 2 parallel avenues of shade trees aligned with gate pillars (side = ±5.4), plus right & corner shade trees
    const trees = [
      // Left avenue row parallel to left gate pillar
      [-5.4, 9.0, 1.06, 1],
      [-5.4, 19.5, 1.08, 2],
      [-5.4, 30.0, 1.05, 3],
      [-5.4, 40.5, 1.08, 4],
      [-5.4, 51.0, 1.04, 5],
      // Right avenue row parallel to right gate pillar
      [5.4, 9.0, 1.06, 6],
      [5.4, 19.5, 1.08, 7],
      [5.4, 30.0, 1.05, 8],
      [5.4, 40.5, 1.08, 9],
      [5.4, 51.0, 1.04, 10],
      // Right courtyard & corner perimeter shade trees (clear of East wing, front teacher parking row & parking aisle)
      [17.2, 10.5, 1.06, 11],
      [17.2, 51.0, 1.06, 12],
      [25.0, 10.6, 1.04, 13],
      [-29.5, 6.8, 1.04, 14],
      [-29.5, 68.0, 1.06, 15],
      [30.0, 66.0, 1.05, 16],
    ];

    for (const [side, fwd, scale, seed] of trees) {
      const p = this.toWorld(side, fwd);
      if (!this.inCampus(p.x, p.z)) continue;
      if (this.campusBuildingPolygons.some((poly) => inside(p, poly))) continue;

      // Every tree gets a circular masonry tree-well curb around its base
      this.group.add(createRoundedTreeCurb(p.x, 0.3, p.z, 1.24));
      this.group.add(createBroadShadeTree(p.x, 0.3, p.z, scale, seed));
      this.obstacles.push({ side, fwd, radius: 1.38 });
    }
  }

  buildPrimarySchoolProps() {
    const yardProps = new THREE.Group();
    yardProps.name = "quang-trung-primary-props";
    yardProps.position.set(this.gate.x, 0, this.gate.z);
    yardProps.rotation.y = this.facingGateYaw;

    // 1) Guard house just inside the right side of gate
    yardProps.add(createGuardHouse(10.2, 0.3, -3.6, -0.35));
    this.obstacles.push({ side: 10.2, fwd: 3.6, radius: 1.7 });

    // 2) Student Liên Đội bulletin board along the right tree avenue
    const boardGroup = new THREE.Group();
    boardGroup.name = "quang-trung-notice-board";
    boardGroup.position.set(9.2, 0.3, -12.2);
    boardGroup.rotation.y = -Math.PI * 0.35;
    boardGroup.add(
      box([0.1, 2.2, 0.1], "#1c73c7", [-1.15, 1.1, 0]),
      box([0.1, 2.2, 0.1], "#1c73c7", [1.15, 1.1, 0]),
      box([2.6, 0.16, 0.52], "#1c73c7", [0, 2.28, 0]),
      box([2.25, 1.35, 0.12], "#f4f7fa", [0, 1.48, 0]),
    );
    const boardTex = createNoticeBoardTexture();
    const boardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(2.12, 1.25),
      new THREE.MeshStandardMaterial({
        color: boardTex ? "#ffffff" : "#0e67be",
        map: boardTex,
        roughness: 0.42,
      }),
    );
    boardFace.position.set(0, 1.48, 0.07);
    boardGroup.add(boardFace);
    yardProps.add(boardGroup);
    this.obstacles.push({ side: 9.2, fwd: 12.2, radius: 1.0 });

    // 3) Traditional wooden school drum near West classroom verandah
    yardProps.add(createSchoolDrumStand(-22.4, 0.3, -52.5, Math.PI * 0.5));
    this.obstacles.push({ side: -22.4, fwd: 52.5, radius: 0.9 });

    // 4) Green library pergola & student handwash station on inner right courtyard (clear of East wing)
    yardProps.add(createGreenLibraryZone(17.6, 0.3, -39.0, 0));
    this.obstacles.push({ side: 17.6, fwd: 39.0, radius: 2.3 });

    // 6) Stone courtyard benches neatly tucked beside tree curbs
    for (const [bx, bf, yaw] of [
      [-7.6, 15.0, -Math.PI * 0.5],
      [7.6, 15.0, Math.PI * 0.5],
      [-7.6, 35.0, -Math.PI * 0.5],
      [7.6, 35.0, Math.PI * 0.5],
      [14.0, 29.0, 0],
      [-21.8, 28.5, Math.PI * 0.5],
    ]) {
      yardProps.add(createBench(bx, 0.3, -bf, yaw));
      this.obstacles.push({ side: bx, fwd: bf, radius: 0.95 });
    }

    this.group.add(yardProps);
  }

  buildStreetVendors() {
    const sidewalk = new THREE.Group();
    sidewalk.name = "quang-trung-street-vendors";
    sidewalk.position.set(this.gate.x, 0.17, this.gate.z);
    sidewalk.rotation.y = this.facingGateYaw;

    // 1) Husband-and-wife xôi pushcart outside right gate fence on Nguyễn Huệ sidewalk
    const xoi = createXoiPushcartCouple();
    xoi.group.position.set(10.6, 0, 2.05);
    xoi.group.rotation.y = -0.15;
    sidewalk.add(xoi.group);
    this.vendorAnimations.push(...xoi.animated);
    this.outsideObstacles.push({ side: 10.6, fwd: -2.05, radius: 1.3 });
    this.vendorPoints.push({
      id: "quang-trung-xoi-couple",
      vendorType: "xoi-vendor",
      title: "Quán xôi sáng",
      dialogue: "Làm tí xôi cho nóng con!",
      ...this.toWorld(10.6, -2.05),
      y: 0.17,
      callDistance: 9.5,
      rearmDistance: 15,
    });

    // 2) Rice-ball (cơm nắm) & street hawker women along the sidewalk outside the school gate
    const hawkerSpecs = [
      { side: -9.8, fwd: -1.9, style: "ganh", shirt: "#8d6b4f", yaw: 0.22 },
      { side: -14.2, fwd: -2.1, style: "met", shirt: "#6c5d87", yaw: 0.1 },
      { side: 16.4, fwd: -1.95, style: "ganh", shirt: "#7f8f69", yaw: -0.2 },
    ];
    hawkerSpecs.forEach((h, index) => {
      const hawker = createComNamHawker({
        style: h.style,
        shirtColor: h.shirt,
        facingYaw: h.yaw,
      });
      hawker.group.position.set(h.side, 0, -h.fwd);
      sidewalk.add(hawker.group);
      this.vendorAnimations.push(...hawker.animated);
      this.outsideObstacles.push({ side: h.side, fwd: h.fwd, radius: 0.95 });
      this.vendorPoints.push({
        id: `quang-trung-hawker-${index + 1}`,
        vendorType: "hawker-vendor",
        title: "Bà bán hàng rong",
        dialogue: "Ăn sáng con ơi!",
        ...this.toWorld(h.side, h.fwd),
        y: 0.17,
        callDistance: 9.5,
        rearmDistance: 15,
      });
    });

    this.sidewalkVendors = sidewalk;
    this.animatedObjects.push(sidewalk);
    this.group.add(sidewalk);
  }

  buildCafes() {
    const roseGarden = buildRoseGardenCafe({
      toWorld: (s, f) => this.toWorld(s, f),
      roadYaw: this.facingGateYaw,
      cameraObstacles: this.world.cameraObstacles,
    });
    this.roseGarden = roseGarden;
    this.group.add(roseGarden.group);
    this.cafePolygons.push(roseGarden.buildingPoly);
    this.cafeLotBounds.push(roseGarden.lotBounds);
    this.outsideObstacles.push(...roseGarden.obstacles);
    if (roseGarden.update) this.cafeUpdaters.push(roseGarden.update);

    const cafeStrip = buildNguyenHueCafeStrip({
      toWorld: (s, f) => this.toWorld(s, f),
      roadYaw: this.facingGateYaw,
      cameraObstacles: this.world.cameraObstacles,
    });
    this.group.add(cafeStrip.group);
    this.cafePolygons.push(...cafeStrip.buildingPolys);
    this.cafeLotBounds.push(...cafeStrip.lotBoundsList);
    this.outsideObstacles.push(...cafeStrip.obstacles);
    if (cafeStrip.update) this.cafeUpdaters.push(cafeStrip.update);
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
      // Students walking straight down the central gate avenue
      { gender: "boy", points: [[-1.6, 3.5], [-1.6, 46.0]], speed: 1.28, offset: 0.1 },
      { gender: "girl", points: [[1.6, 46.0], [1.6, 4.0]], speed: 1.24, offset: 0.45 },
      // Primary students running/playing across the left brick football pitch
      { gender: "boy", points: [[-18.0, 19.0], [-11.5, 36.5]], speed: 1.48, offset: 0.2 },
      { gender: "boy", points: [[-11.8, 22.0], [-17.8, 38.0]], speed: 1.42, offset: 0.65 },
      // Students walking across courtyard toward library & notice board
      { gender: "girl", points: [[-9.5, 45.5], [14.5, 45.5]], speed: 1.22, offset: 0.3 },
      { gender: "girl", points: [[11.5, 25.5], [16.5, 36.0]], speed: 1.26, offset: 0.72 },
    ].filter((w) => w.points.every(([s, f]) => isWalkSafe(s, f)));

    const chatSpots = [
      { side: 10.6, fwd: 14.5, members: ["boy", "girl", "boy"], radius: 0.85 },
      { side: 14.5, fwd: 34.5, members: ["girl", "boy", "girl"], radius: 0.85 },
      { side: -14.8, fwd: 27.5, members: ["boy", "boy", "girl"], radius: 1.1 },
      { side: 12.2, fwd: 47.0, members: ["girl", "boy"], radius: 0.8 },
    ].filter((c) => isWalkSafe(c.side, c.fwd));

    this.students = new CampusStudents({
      parent: this.group,
      toWorld: (side, fwd) => this.toWorld(side, fwd),
      groundAt: () => 0.3,
      walkers,
      chatSpots,
      scale: 0.86,
      includeBike: false,
    });
    this.animatedObjects.push(...this.students.animatedObjects);
  }

  buildTeachers() {
    const center = this.toWorld(6.8, 24.8);
    const chat = createTeachersChatGroup();
    chat.group.position.set(center.x, 0.3, center.z);
    chat.group.rotation.y = this.facingGateYaw;
    this.teachersCenter = center;
    this.teachersGroup = chat.group;
    this.teachersActors = chat.actors;
    this.teachersUpdate = chat.update;
    this.animatedObjects.push(chat.group);
    this.group.add(chat.group);
    this.obstacles.push({ side: 6.8, fwd: 24.8, radius: 1.65 });
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    return 0.3;
  }

  canRide(wx, wz) {
    if (this.hitsOutsideProp(wx, wz)) return false;
    if (this.cafePolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
    const roseRide = this.roseGarden?.canRide(wx, wz);
    if (roseRide === false) return false;
    const { side, fwd } = this.toLocal(wx, wz);
    if (side >= 36.4 && side <= 39.4 && fwd >= 55.8 && fwd <= 61.2) {
      if (
        this.obstacles.some(
          (o) => Math.hypot(side - o.side, fwd - o.fwd) < o.radius,
        )
      ) {
        return false;
      }
      return true;
    }
    if (!this.inCampus(wx, wz)) return roseRide === true ? true : null;
    if (this.campusBuildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
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
    return (
      this.inCampus(wx, wz) ||
      this.inCafeLot(wx, wz, 0.8) ||
      this.hitsOutsideProp(wx, wz, 2.0)
    );
  }

  blocksTree(wx, wz) {
    return (
      this.inCampus(wx, wz) ||
      this.inCafeLot(wx, wz, 1.5) ||
      this.hitsOutsideProp(wx, wz, 2.6)
    );
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

    if (this.sidewalkVendors) {
      const inRange =
        !playerPos ||
        Math.hypot(playerPos.x - this.gate.x, playerPos.z - this.gate.z) < 120;
      this.sidewalkVendors.visible = inRange;
      if (inRange) {
        for (const fn of this.vendorAnimations) fn(time);
      }
    }

    if (
      !playerPos ||
      Math.hypot(playerPos.x - this.gate.x, playerPos.z - this.gate.z) < 145
    ) {
      for (const fn of this.cafeUpdaters) fn(time);
    }

    if (this.teachersGroup && this.teachersCenter) {
      const inRange =
        !playerPos ||
        Math.hypot(
          playerPos.x - this.teachersCenter.x,
          playerPos.z - this.teachersCenter.z,
        ) < 120;
      this.teachersGroup.visible = inRange;
      if (inRange) {
        this.teachersUpdate?.(time);
      }
    }

    this.students?.update(time, playerPos);
  }
}
