import * as THREE from "three";
import quangTrungCampuses from "../data/campuses.json" with { type: "json" };
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { hitsCampusWall } from "../../../../core/shared/architecture/CampusWalls.js";

function createCanvasTex(width, height, draw, repeatX = 1, repeatY = 1) {
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

function createHospitalWallTex(floors = 4) {
  return createCanvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f0f4f6";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#cfdce0";
    ctx.fillRect(0, h - 38, w, 38);
    ctx.fillStyle = "#197682";
    ctx.fillRect(0, h - 44, w, 8);

    const step = Math.floor((h - 44) / floors);
    for (let f = 0; f < floors; f++) {
      const topY = f * step;
      ctx.fillStyle = "#197682";
      ctx.fillRect(0, topY, w, 10);
      const winY = topY + 20;
      const winH = Math.max(36, step - 34);
      for (const wx of [24, 142, 260, 378]) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(wx - 4, winY - 4, 112, winH + 8);
        ctx.fillStyle = "#29586b";
        ctx.fillRect(wx, winY, 104, winH);
        ctx.fillStyle = "rgba(165, 225, 240, 0.25)";
        ctx.fillRect(wx + 6, winY + 5, 44, winH - 10);
        ctx.fillStyle = "#d5e4e8";
        ctx.fillRect(wx + 50, winY + 3, 4, winH - 6);
      }
    }
  });
}

function createMedicalSignTex(title, subtitle) {
  return createCanvasTex(1024, 224, (ctx, w, h) => {
    ctx.fillStyle = "#0e6478";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e8f6f8";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.fillStyle = "#ffffff";
    ctx.beginPath?.();
    ctx.arc?.(96, h / 2, 54, 0, Math.PI * 2);
    ctx.fill?.();
    ctx.fillStyle = "#d62828";
    ctx.fillRect(84, h / 2 - 34, 24, 68);
    ctx.fillRect(62, h / 2 - 12, 68, 24);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 50px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(title, 178, h * 0.38, w - 210);
    ctx.fillStyle = "#c0f2f7";
    ctx.font = "600 32px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(subtitle, 178, h * 0.72, w - 210);
  });
}

function createHospitalFenceTex() {
  return createCanvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#485955";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#eff4f5";
    ctx.fillRect(0, 168, w, 88);
    ctx.fillStyle = "#197682";
    ctx.fillRect(0, 160, w, 10);
    ctx.fillStyle = "#1d5b68";
    ctx.fillRect(0, 24, w, 8);
    ctx.fillRect(0, 140, w, 8);
    for (let x = 10; x < w; x += 24) {
      ctx.fillRect(x, 8, 7, 150);
    }
  });
}

function createParkTileTex() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#c9c6be";
      ctx.fillRect(0, 0, w, h);
      const step = 64;
      const tones = ["#dedbd3", "#d5d2ca", "#e4e1d9", "#cfccc4", "#dad7cf"];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const idx = Math.floor(x / step) * 3 + Math.floor(y / step) * 5;
          ctx.fillStyle = tones[idx % tones.length];
          ctx.fillRect(x + 2, y + 2, step - 4, step - 4);
          ctx.strokeStyle = "rgba(255,255,255,0.22)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 4, y + 4, step - 8, step - 8);
        }
      }
    },
    14,
    9,
  );
}

function createParkLawnTex() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#5b9a3b";
      ctx.fillRect(0, 0, w, h);
      // Subtle sunlit mowed lawn stripes
      for (let x = 0; x < w; x += 64) {
        ctx.fillStyle = (x / 64) % 2 === 0 ? "rgba(132, 190, 78, 0.16)" : "rgba(56, 108, 36, 0.12)";
        ctx.fillRect(x, 0, 64, h);
      }
      for (let i = 0; i < 2200; i++) {
        ctx.fillStyle =
          i % 3 === 0
            ? "rgba(146, 200, 84, 0.24)"
            : i % 3 === 1
              ? "rgba(62, 118, 38, 0.22)"
              : "rgba(170, 214, 105, 0.14)";
        ctx.fillRect((i * 193) % w, (i * 317) % h, 6, 5);
      }
    },
    4,
    3,
  );
}

function createParkSignTex() {
  return createCanvasTex(768, 192, (ctx, w, h) => {
    ctx.fillStyle = "#195836";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f2e6bc";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff9e6";
    ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("CÔNG VIÊN DỰ ÁN", w / 2, h * 0.38, w - 50);
    ctx.fillStyle = "#cbead3";
    ctx.font = "600 26px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("KHÔNG GIAN XANH THƯ GIÃN · ĐỐI DIỆN DÒNG CHÚA CỨU THẾ", w / 2, h * 0.74, w - 50);
  });
}

function createParkTree(x, y, z, scale = 1, seed = 1, blossomColor = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.4;
  const trunkMat = mat("#64503d", 0.9);
  const trunkH = 2.75 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.26 * scale, trunkH, 8),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  // Subtle forked limbs
  for (let b = 0; b < 3; b++) {
    const a = (b * Math.PI * 2) / 3 + 0.3;
    const limb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06 * scale, 0.11 * scale, 1.3 * scale, 6),
      trunkMat,
    );
    limb.position.set(
      Math.cos(a) * 0.42 * scale,
      trunkH + 0.32 * scale,
      Math.sin(a) * 0.42 * scale,
    );
    limb.rotation.z = -Math.cos(a) * 0.55;
    limb.rotation.x = Math.sin(a) * 0.55;
    g.add(limb);
  }

  const greens = ["#3f7930", "#518e3b", "#64a147", "#488536"];
  [
    [0, trunkH + 1.45 * scale, 0, 1.65 * scale, 0.78],
    [0.95 * scale, trunkH + 1.0 * scale, 0.62 * scale, 1.24 * scale, 0.76],
    [-0.9 * scale, trunkH + 1.05 * scale, -0.58 * scale, 1.26 * scale, 0.76],
    [0.35 * scale, trunkH + 1.15 * scale, -0.95 * scale, 1.12 * scale, 0.74],
  ].forEach(([cx, cy, cz, r, sy], i) => {
    const crown = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[(i + seed) % greens.length], 0.86),
    );
    crown.scale.set(1.2, sy, 1.16);
    crown.position.set(cx, cy, cz);
    crown.castShadow = crown.receiveShadow = true;
    g.add(crown);
  });

  if (blossomColor) {
    const bloomMat = mat(blossomColor, 0.62);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI * 2) / 6 + seed * 0.3;
      const r = (0.7 + (i % 2) * 0.55) * scale;
      const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.48 * scale, 0), bloomMat);
      bloom.scale.set(1.25, 0.55, 1.25);
      bloom.position.set(
        Math.cos(a) * r,
        trunkH + (1.6 + (i % 3) * 0.28) * scale,
        Math.sin(a) * r,
      );
      g.add(bloom);
    }
  }
  return g;
}

function createPalmTree(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const trunkMat = mat("#755f49", 0.9);
  for (let s = 0; s < 4; s++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry((0.23 - s * 0.025) * scale, (0.26 - s * 0.025) * scale, 1.15 * scale, 8),
      trunkMat,
    );
    seg.position.set(s * 0.04 * scale, (0.55 + s * 1.05) * scale, 0);
    seg.rotation.z = -0.04;
    seg.castShadow = true;
    g.add(seg);
  }

  const frondMat = mat("#3b782d", 0.78);
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.28 * scale, 2.35 * scale, 5),
      frondMat,
    );
    frond.scale.set(1.0, 1.0, 0.25);
    frond.position.set(
      Math.sin(a) * 1.02 * scale + 0.12 * scale,
      4.25 * scale,
      Math.cos(a) * 1.02 * scale,
    );
    frond.rotation.y = a;
    frond.rotation.x = Math.PI * 0.62;
    frond.castShadow = true;
    g.add(frond);
  }
  return g;
}

function createSquareTreeWell(x, y, z, scale = 1, seed = 1, blossomColor = null) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(
    box([2.05, 0.18, 2.05], "#ebe8e1", [0, 0.09, 0]),
    box([1.62, 0.13, 1.62], "#4c3b2c", [0, 0.13, 0]),
  );
  g.add(createParkTree(0, 0.15, 0, scale, seed, blossomColor));
  return g;
}

function createWhiteBlossomShrubStrip(w, d, x, y, z, accentColors = ["#f7f8f3", "#f0a6be", "#f2cf4e"]) {
  const g = new THREE.Group();
  g.position.set(x, y, z);

  // Granite garden bed curb
  const curb = new THREE.Mesh(new THREE.BoxGeometry(w + 0.22, 0.14, d + 0.22), mat("#e0ddd5", 0.82));
  curb.position.y = 0.07;
  curb.receiveShadow = true;
  const soil = new THREE.Mesh(new THREE.BoxGeometry(w - 0.08, 0.16, d - 0.08), mat("#4d3c2d", 0.94));
  soil.position.y = 0.085;
  g.add(curb, soil);

  // Layered organic rounded shrub mounds instead of solid boxes
  const leafPalette = ["#3d782f", "#4c8a3a", "#5c9b47"];
  const cols = Math.max(2, Math.round(w / 1.15));
  const rows = Math.max(1, Math.round(d / 1.15));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const sx = ((c + 0.5) / cols - 0.5) * Math.max(0.2, w - 0.55);
      const sz = ((r + 0.5) / rows - 0.5) * Math.max(0.2, d - 0.55);
      const rad = 0.46 + (idx % 3) * 0.09;
      const mound = new THREE.Mesh(
        new THREE.DodecahedronGeometry(rad, 1),
        mat(leafPalette[idx % leafPalette.length], 0.88),
      );
      mound.scale.set(1.15, 0.68, 1.1);
      mound.position.set(sx, 0.28, sz);
      mound.castShadow = mound.receiveShadow = true;
      g.add(mound);

      // Flowering accents
      const bloom = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 6, 5),
        mat(accentColors[idx % accentColors.length], 0.65),
      );
      bloom.position.set(sx + (idx % 2 ? 0.16 : -0.14), 0.45, sz + (idx % 3 ? -0.1 : 0.12));
      g.add(bloom);
    }
  }
  return g;
}

function createParkedWhiteSedan(yaw = 0) {
  const g = new THREE.Group();
  g.name = "cong-vien-parked-sedan";
  g.rotation.y = yaw;

  const whitePaint = mat("#f2f4f7", 0.26, 0.22);
  const cabinGlass = mat("#233342", 0.12, 0.65);
  const wheelMat = mat("#1d2024", 0.85);
  const rimMat = mat("#cfd6dc", 0.25, 0.8);

  // Lower body chassis + cabin + hood/trunk slopes
  const lower = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.62, 4.28), whitePaint);
  lower.position.y = 0.52;
  lower.castShadow = lower.receiveShadow = true;

  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.52, 2.05), cabinGlass);
  cabin.position.set(0, 1.05, -0.1);
  cabin.castShadow = true;

  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 1.72), whitePaint);
  roof.position.set(0, 1.32, -0.14);

  g.add(lower, cabin, roof);

  // Headlights & red taillights
  const headMat = mat("#fff8d6", 0.2);
  const tailMat = mat("#d62828", 0.35);
  for (const sx of [-0.64, 0.64]) {
    g.add(
      new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.06), headMat).translateX(sx).translateY(0.56).translateZ(2.15),
      new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.06), tailMat).translateX(sx).translateY(0.6).translateZ(-2.15),
    );
  }

  // 4 tires & metallic hubcaps
  for (const wx of [-0.84, 0.84]) {
    for (const wz of [-1.28, 1.28]) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), wheelMat);
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, 0.3, wz);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.22, 10), rimMat);
      hub.rotation.z = Math.PI / 2;
      hub.position.set(wx, 0.3, wz);
      g.add(tire, hub);
    }
  }
  return g;
}

function createAmbulance(yaw = 0) {
  const g = new THREE.Group();
  g.name = "hospital-ambulance";
  g.rotation.y = yaw;

  const blueLight = new THREE.MeshStandardMaterial({
    color: "#2288ee",
    emissive: "#1c74d4",
    emissiveIntensity: 0.45,
    roughness: 0.25,
  });

  // Box medical rear + cab
  g.add(
    box([2.05, 1.48, 3.1], "#f6f8fa", [0, 1.12, -0.65]),
    box([1.95, 1.18, 1.45], "#f6f8fa", [0, 0.96, 1.55]),
    box([1.8, 0.54, 0.1], "#233a4c", [0, 1.26, 2.26]),
    // Red emergency stripe & medical crosses
    box([2.08, 0.22, 3.12], "#d62828", [0, 0.78, -0.65]),
    box([2.1, 0.52, 0.16], "#d62828", [0, 1.32, -0.65]),
    box([2.1, 0.16, 0.52], "#d62828", [0, 1.32, -0.65]),
  );
  // Roof lightbar
  const beacon = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.16, 0.28), blueLight);
  beacon.position.set(0, 1.65, 1.35);
  g.add(beacon);

  for (const wx of [-0.95, 0.95]) {
    for (const wz of [-1.4, 1.45]) {
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.22, 14),
        mat("#1f2226", 0.85),
      );
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, 0.34, wz);
      g.add(tire);
    }
  }
  return g;
}

function createParkVisitor({ shirt = "#4b6982", pants = "#25292e", seated = false } = {}) {
  const g = new THREE.Group();
  const skin = mat("#e3ba98", 0.75);
  const top = mat(shirt, 0.82);
  const bot = mat(pants, 0.85);
  const hair = mat("#231e1c", 0.85);

  if (seated) {
    for (const sx of [-0.08, 0.08]) {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.34, 4, 8), bot);
      leg.rotation.x = Math.PI * 0.45;
      leg.position.set(sx, 0.08, 0.18);
      g.add(leg);
    }
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.28, 4, 8), top);
    torso.position.set(0, 0.28, 0);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 10), skin);
    head.position.set(0, 0.55, 0);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
      hair,
    );
    cap.position.set(0, 0.57, -0.01);
    g.add(torso, head, cap);
    return g;
  }

  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.46, 4, 8), bot);
  legL.position.set(-0.08, 0.32, 0);
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.46, 4, 8), bot);
  legR.position.set(0.08, 0.32, 0);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.36, 4, 8), top);
  torso.position.set(0, 0.92, 0);
  torso.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), skin);
  head.position.set(0, 1.32, 0);
  const hCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.125, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
  );
  hCap.position.set(0, 1.34, -0.01);
  g.add(legL, legR, torso, head, hCap);
  g.userData.legL = legL;
  g.userData.legR = legR;
  return g;
}

function createParkLamp(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.08, 3.6, 8),
    mat("#2d3439", 0.45, 0.55),
  );
  pole.position.y = 1.8;
  pole.castShadow = true;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.14, 0.16, 12),
    mat("#2a3034", 0.4, 0.5),
  );
  cap.position.y = 3.68;
  const bulb = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.14, 12),
    new THREE.MeshStandardMaterial({
      color: "#fff7db",
      emissive: "#ffe49e",
      emissiveIntensity: 0.35,
      roughness: 0.3,
    }),
  );
  bulb.position.y = 3.55;
  g.add(pole, cap, bulb);
  return g;
}

function createParkBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.name = "cong-vien-bench";
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const frameHex = "#343b42";
  const woodHex = "#b87a44";
  const trimWoodHex = "#a56936";
  // Dark cast-iron/stone side leg frames + curved armrests
  for (const sx of [-0.74, 0.74]) {
    g.add(
      box([0.1, 0.4, 0.46], frameHex, [sx, 0.2, 0]),
      box([0.12, 0.06, 0.52], frameHex, [sx, 0.03, 0]),
      box([0.09, 0.16, 0.44], frameHex, [sx, 0.54, 0.02]),
      box([0.08, 0.36, 0.08], frameHex, [sx, 0.64, -0.22]),
    );
  }
  // Slatted warm teak seat & ergonomically reclined backrest
  for (const sz of [-0.14, 0.01, 0.16]) {
    g.add(box([1.74, 0.055, 0.12], woodHex, [0, 0.43, sz]));
  }
  for (const [sy, sz] of [
    [0.58, -0.22],
    [0.72, -0.25],
    [0.85, -0.28],
  ]) {
    const slat = new THREE.Mesh(
      new THREE.BoxGeometry(1.74, 0.1, 0.045),
      mat(sy > 0.7 ? woodHex : trimWoodHex, 0.58),
    );
    slat.position.set(0, sy, sz);
    slat.rotation.x = -0.14;
    slat.castShadow = slat.receiveShadow = true;
    g.add(slat);
  }
  return g;
}

function createParkBollard(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(
    box([0.16, 0.65, 0.16], "#2e343b", [0, 0.325, 0]),
    box([0.18, 0.08, 0.18], "#1f2429", [0, 0.76, 0]),
  );
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.12, 10),
    new THREE.MeshStandardMaterial({
      color: "#fff7db",
      emissive: "#ffde8a",
      emissiveIntensity: 0.45,
      roughness: 0.25,
    }),
  );
  lens.position.y = 0.68;
  g.add(lens);
  return g;
}

function createTimberPergola(x, y, z, yaw = 0, w = 5.4, d = 3.8) {
  const g = new THREE.Group();
  g.name = "cong-vien-choi-nghi";
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const timberHex = "#8c5731";
  const lightTimberHex = "#b87943";
  const stoneHex = "#d8d5cd";

  // Raised warm stone/wood terrace pad
  const pad = new THREE.Mesh(new THREE.BoxGeometry(w + 1.0, 0.12, d + 1.0), mat(stoneHex, 0.85));
  pad.position.y = 0.06;
  pad.receiveShadow = true;
  g.add(pad);

  // 4 stone footings + cedar posts
  for (const sx of [-w / 2 + 0.25, w / 2 - 0.25]) {
    for (const sz of [-d / 2 + 0.25, d / 2 - 0.25]) {
      g.add(
        box([0.36, 0.24, 0.36], "#c6c3bb", [sx, 0.2, sz]),
        box([0.22, 2.7, 0.22], timberHex, [sx, 1.55, sz]),
      );
    }
  }
  // Perimeter header beams + open pergola rafters + climbing vine accents
  g.add(
    box([w + 0.4, 0.2, 0.22], timberHex, [0, 2.95, -d / 2 + 0.25]),
    box([w + 0.4, 0.2, 0.22], timberHex, [0, 2.95, d / 2 - 0.25]),
    box([0.22, 0.2, d + 0.4], timberHex, [-w / 2 + 0.25, 2.95, 0]),
    box([0.22, 0.2, d + 0.4], timberHex, [w / 2 - 0.25, 2.95, 0]),
  );
  for (let rx = -w / 2 + 0.1; rx <= w / 2 - 0.1; rx += 0.65) {
    g.add(box([0.1, 0.14, d + 0.7], lightTimberHex, [rx, 3.1, 0]));
  }
  // Climbing green foliage + pink flowers over the pergola top
  for (const [vx, vz, col] of [
    [-w * 0.28, -d * 0.18, "#478535"],
    [0.0, d * 0.15, "#569640"],
    [w * 0.25, -d * 0.08, "#478535"],
  ]) {
    const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 0), mat(col, 0.85));
    vine.scale.set(1.5, 0.35, 1.3);
    vine.position.set(vx, 3.24, vz);
    g.add(vine);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.14, 6, 5), mat("#eb6f92", 0.65));
    bloom.position.set(vx + 0.25, 3.36, vz - 0.1);
    g.add(bloom);
  }
  // Two cozy slatted benches tucked inside facing each other + low table
  g.add(
    createParkBench(0, 0.12, -d * 0.28, 0),
    createParkBench(0, 0.12, d * 0.28, Math.PI),
    box([1.1, 0.36, 0.6], "#c98b4e", [0, 0.3, 0]),
  );
  return g;
}

function createPicnicTableSet(x, y, z, yaw = 0, withVisitors = false) {
  const g = new THREE.Group();
  g.name = "cong-vien-picnic-table";
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const woodHex = "#b87a44";
  const frameHex = "#343b42";
  // Table & twin benches
  g.add(
    box([1.75, 0.08, 0.85], woodHex, [0, 0.74, 0]),
    box([0.12, 0.7, 0.12], frameHex, [-0.6, 0.35, 0]),
    box([0.12, 0.7, 0.12], frameHex, [0.6, 0.35, 0]),
    box([1.75, 0.07, 0.34], woodHex, [0, 0.44, 0.74]),
    box([1.75, 0.07, 0.34], woodHex, [0, 0.44, -0.74]),
    box([0.1, 0.42, 0.26], frameHex, [-0.6, 0.21, 0.74]),
    box([0.1, 0.42, 0.26], frameHex, [0.6, 0.21, 0.74]),
    box([0.1, 0.42, 0.26], frameHex, [-0.6, 0.21, -0.74]),
    box([0.1, 0.42, 0.26], frameHex, [0.6, 0.21, -0.74]),
    // Tabletop props (chess/book & cups)
    box([0.38, 0.025, 0.38], "#efe8d4", [-0.12, 0.79, 0.04]),
    box([0.1, 0.12, 0.1], "#f6f8fa", [0.32, 0.84, -0.14]),
  );
  if (withVisitors) {
    const vA = createParkVisitor({ shirt: "#3e708e", pants: "#2b3036", seated: true });
    vA.position.set(-0.35, 0.46, 0.74);
    vA.rotation.y = Math.PI;
    const vB = createParkVisitor({ shirt: "#df7f65", pants: "#2b3036", seated: true });
    vB.position.set(0.32, 0.46, -0.74);
    g.add(vA, vB);
  }
  return g;
}

function createParkFountain(x, y, z) {
  const g = new THREE.Group();
  g.name = "cong-vien-ho-phun-nuoc";
  g.position.set(x, y, z);

  // Granite circular coping rim + inner basin
  const rim = new THREE.Mesh(new THREE.TorusGeometry(3.85, 0.34, 10, 40), mat("#dcd9d0", 0.78));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.26;
  rim.castShadow = rim.receiveShadow = true;

  const baseWall = new THREE.Mesh(new THREE.CylinderGeometry(3.95, 4.15, 0.44, 36), mat("#b6b3aa", 0.85));
  baseWall.position.y = 0.22;
  baseWall.castShadow = baseWall.receiveShadow = true;

  const water = new THREE.Mesh(
    new THREE.CircleGeometry(3.62, 36),
    new THREE.MeshStandardMaterial({
      color: "#38a3b8",
      roughness: 0.12,
      metalness: 0.28,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.36;

  // Sculpted 2-tier center stone lotus pedestal
  const ped1 = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.82, 0.95, 16), mat("#e5e2d9", 0.72));
  ped1.position.y = 0.65;
  const bowl1 = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 0.55, 0.28, 20), mat("#ebe8df", 0.7));
  bowl1.position.y = 1.15;
  const ped2 = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.45, 0.75, 14), mat("#e5e2d9", 0.72));
  ped2.position.y = 1.55;
  const bowl2 = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.32, 0.22, 18), mat("#ebe8df", 0.7));
  bowl2.position.y = 1.95;

  // Animated spray plume & concentric ripple ring
  const jetMat = new THREE.MeshStandardMaterial({
    color: "#e6faff",
    emissive: "#a8ecf8",
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.78,
    roughness: 0.15,
  });
  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.35, 12), jetMat);
  jet.rotation.x = Math.PI;
  jet.position.y = 2.68;

  const ripple = new THREE.Mesh(
    new THREE.RingGeometry(1.4, 1.55, 32),
    new THREE.MeshStandardMaterial({
      color: "#ffffff",
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
    }),
  );
  ripple.rotation.x = -Math.PI / 2;
  ripple.position.y = 0.375;

  g.add(baseWall, rim, water, ped1, bowl1, ped2, bowl2, jet, ripple);
  return { group: g, jet, ripple };
}

function createFitnessCorner(x, y, z) {
  const g = new THREE.Group();
  g.name = "cong-vien-khu-the-duc";
  g.position.set(x, y, z);

  // Soft EPDM rubber safety mat + granite curb
  g.add(
    box([9.2, 0.08, 6.2], "#d8d5cd", [0, 0.04, 0]),
    box([8.6, 0.09, 5.6], "#467d6e", [0, 0.05, 0]),
    box([7.8, 0.095, 4.8], "#c96e54", [0, 0.052, 0]),
  );

  const postHex = "#1e7868";
  const accentHex = "#efb82d";
  // 1) Air-walker glider station (-2.5, 0)
  g.add(
    box([0.14, 1.45, 0.14], postHex, [-2.5, 0.82, 0]),
    box([1.15, 0.1, 0.14], postHex, [-2.5, 1.52, 0]),
    box([0.08, 1.1, 0.08], accentHex, [-2.9, 0.88, 0.15]),
    box([0.08, 1.1, 0.08], accentHex, [-2.1, 0.88, -0.15]),
    box([0.28, 0.08, 0.44], "#2d3238", [-2.9, 0.32, 0.15]),
    box([0.28, 0.08, 0.44], "#2d3238", [-2.1, 0.32, -0.15]),
  );
  // 2) Triple waist-twister station (0, 0)
  g.add(
    box([0.16, 1.38, 0.16], postHex, [0, 0.78, 0]),
    box([1.3, 0.08, 0.08], accentHex, [0, 1.25, 0]),
  );
  for (const [dx, dz] of [
    [-0.55, 0.35],
    [0.55, 0.35],
    [0, -0.55],
  ]) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.08, 14), mat(accentHex, 0.45));
    disc.position.set(dx, 0.16, dz);
    g.add(disc);
  }
  // 3) Double shoulder-wheel spinner (+2.5, 0)
  g.add(box([0.14, 1.55, 0.14], postHex, [2.5, 0.86, 0]));
  for (const sz of [-0.14, 0.14]) {
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.045, 8, 20), mat(accentHex, 0.4, 0.2));
    wheel.position.set(2.5, 1.32, sz);
    g.add(wheel);
  }
  // Exercising visitor
  const athlete = createParkVisitor({ shirt: "#f0f4f7", pants: "#2b323b" });
  athlete.position.set(0.55, 0.12, 0.72);
  athlete.rotation.y = Math.PI;
  g.add(athlete);
  return g;
}

function createFamilyPlayCorner(x, y, z) {
  const g = new THREE.Group();
  g.name = "cong-vien-khu-vui-choi";
  g.position.set(x, y, z);

  g.add(
    box([7.8, 0.07, 5.4], "#d8d5cd", [0, 0.035, 0]),
    box([7.2, 0.08, 4.8], "#528a62", [0, 0.045, 0]),
  );

  // Wooden A-frame double garden swing (-1.5, 0)
  const frameHex = "#8d5832";
  for (const sx of [-2.85, -0.15]) {
    const frontLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.35, 0.12), mat(frameHex, 0.75));
    frontLeg.position.set(sx, 1.15, 0.52);
    frontLeg.rotation.x = 0.22;
    const backLeg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.35, 0.12), mat(frameHex, 0.75));
    backLeg.position.set(sx, 1.15, -0.52);
    backLeg.rotation.x = -0.22;
    g.add(frontLeg, backLeg);
  }
  g.add(box([3.0, 0.14, 0.14], frameHex, [-1.5, 2.25, 0]));

  const swingPivot = new THREE.Group();
  swingPivot.position.set(-1.5, 2.22, 0);
  for (const sx of [-0.55, 0.55]) {
    swingPivot.add(
      box([0.04, 1.55, 0.04], "#444a50", [sx - 0.25, -0.82, 0]),
      box([0.04, 1.55, 0.04], "#444a50", [sx + 0.25, -0.82, 0]),
      box([0.62, 0.07, 0.28], "#e39c36", [sx, -1.6, 0]),
    );
  }
  g.add(swingPivot);

  // Colorful seesaw (+1.85, 0)
  g.add(
    box([0.36, 0.45, 0.36], "#2a6988", [1.85, 0.26, 0]),
    box([2.8, 0.09, 0.26], "#e25848", [1.85, 0.52, 0]),
    box([0.1, 0.24, 0.26], "#f2c12e", [0.75, 0.64, 0]),
    box([0.1, 0.24, 0.26], "#f2c12e", [2.95, 0.64, 0]),
  );

  // Parent & child relaxing nearby
  const parent = createParkVisitor({ shirt: "#6a8e7f", pants: "#2b3036" });
  parent.position.set(0.2, 0.08, 1.5);
  const child = createParkVisitor({ shirt: "#f5c242", pants: "#385e88" });
  child.scale.setScalar(0.68);
  child.position.set(0.75, 0.08, 1.45);
  g.add(parent, child);
  return { group: g, swingPivot };
}

function createParkBin(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(
    box([0.42, 0.72, 0.42], "#256d49", [0, 0.36, 0]),
    box([0.48, 0.08, 0.48], "#1c4f35", [0, 0.76, 0]),
  );
  return g;
}

function createBikeRack(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(box([3.2, 0.06, 0.75], "#464d54", [0, 0.03, 0]));
  const barMat = mat("#cfd6dc", 0.3, 0.8);
  for (let bx = -1.25; bx <= 1.25; bx += 0.625) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.032, 6, 14, Math.PI), barMat);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(bx, 0.26, 0);
    g.add(arch);
  }
  return g;
}

export class QuangTrungEastPrecinct {
  constructor(world) {
    this.world = world;
    this.roadYaw = quangTrungCampuses.gateHeading;
    this.gatePivot = quangTrungCampuses["quang-trung"].gate;
    this.fwdVec = {
      x: -Math.sin(this.roadYaw),
      z: -Math.cos(this.roadYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "quang-trung-east-precinct";

    this.buildingPolygons = [];
    this.fenceSegments = [];
    this.obstacles = [];
    this.strollers = [];
    this.fountainWater = null;
    this.swingPivots = [];

    this.buildBenhVienDaKhoa();
    this.buildHemNho();
    this.buildProjectPark();
    this.registerLandmarks();

    world.scene.add(this.group);
  }

  toWorld(side, fwd) {
    return {
      x: this.gatePivot.x + side * this.rightVec.x + fwd * this.fwdVec.x,
      z: this.gatePivot.z + side * this.rightVec.z + fwd * this.fwdVec.z,
    };
  }

  toLocal(wx, wz) {
    const dx = wx - this.gatePivot.x;
    const dz = wz - this.gatePivot.z;
    return {
      side: dx * this.rightVec.x + dz * this.rightVec.z,
      fwd: dx * this.fwdVec.x + dz * this.fwdVec.z,
    };
  }

  rectPoly(minS, maxS, minF, maxF) {
    return [
      this.toWorld(minS, minF),
      this.toWorld(maxS, minF),
      this.toWorld(maxS, maxF),
      this.toWorld(minS, maxF),
      this.toWorld(minS, minF),
    ];
  }

  buildBenhVienDaKhoa() {
    // East of Rose Garden Café (side 63.0..108.0, fwd 1.0..60.0)
    const minS = 63.0;
    const maxS = 108.0;
    const minF = 1.0;
    const maxF = 60.0;
    const midS = (minS + maxS) / 2; // 85.5
    const midF = (minF + maxF) / 2; // 30.5
    const w = maxS - minS; // 45.0
    const d = maxF - minF; // 59.0

    const hosp = new THREE.Group();
    hosp.name = "benh-vien-da-khoa";
    const c = this.toWorld(midS, midF);
    hosp.position.set(c.x, 0, c.z);
    hosp.rotation.y = this.roadYaw;

    // Paved courtyard concrete pad (y top = 0.28)
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, d),
      mat("#d2cec6", 0.85),
    );
    pad.position.set(0, 0.21, 0);
    pad.receiveShadow = true;
    hosp.add(pad);

    // Front ambulance asphalt driveway apron & manicured lawns
    const drive = new THREE.Mesh(
      new THREE.BoxGeometry(13.0, 0.025, 19.0),
      mat("#555c63", 0.9),
    );
    drive.position.set(0, 0.292, d / 2 - 9.5);
    drive.receiveShadow = true;
    hosp.add(drive);

    const lawnMat = mat("#4e8d3d", 0.9);
    for (const lx of [-14.0, 14.0]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.1, 10.0), lawnMat);
      lawn.position.set(lx, 0.29, d / 2 - 7.0);
      lawn.receiveShadow = true;
      hosp.add(lawn);
    }

    // Perimeter fence around [63..108] x [1..60] leaving 10m main entrance at side [80.5..90.5], fwd = 1.0
    const fenceTex = createHospitalFenceTex();
    const fenceMat = new THREE.MeshStandardMaterial({
      color: fenceTex ? "#ffffff" : "#1d5b68",
      map: fenceTex,
      roughness: 0.7,
    });
    const hw = w / 2; // 22.5
    const hd = d / 2; // 29.5

    const localSpans = [
      [-hw, hd, -5.0, hd],
      [5.0, hd, hw, hd],
      [hw, hd, hw, -hd],
      [hw, -hd, -hw, -hd],
      [-hw, -hd, -hw, hd],
    ];
    for (const [x1, z1, x2, z2] of localSpans) {
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.hypot(dx, dz);
      const yaw = Math.atan2(-dz, dx);
      const wall = new THREE.Mesh(new THREE.BoxGeometry(len, 1.9, 0.24), fenceMat);
      wall.position.set((x1 + x2) / 2, 1.22, (z1 + z2) / 2);
      wall.rotation.y = yaw;
      wall.castShadow = true;
      hosp.add(wall);

      const posts = Math.max(1, Math.round(len / 6.0));
      for (let i = 0; i <= posts; i++) {
        const t = i / posts;
        const px = x1 + dx * t;
        const pz = z1 + dz * t;
        hosp.add(
          box([0.44, 2.08, 0.44], "#eef4f5", [px, 1.3, pz]),
          box([0.54, 0.14, 0.54], "#197682", [px, 2.4, pz]),
        );
      }
      this.fenceSegments.push({
        a: this.toWorld(midS + x1, midF - z1),
        b: this.toWorld(midS + x2, midF - z2),
      });
    }

    // Grand main hospital gate piers & sign at front center (local z = +hd)
    for (const gx of [-5.2, 5.2]) {
      hosp.add(
        box([0.9, 4.2, 0.9], "#f4f8f9", [gx, 2.38, hd]),
        box([1.06, 0.22, 1.06], "#197682", [gx, 4.55, hd]),
        box([0.16, 0.54, 0.08], "#d62828", [gx, 2.6, hd + 0.48]),
        box([0.54, 0.16, 0.08], "#d62828", [gx, 2.6, hd + 0.48]),
      );
      this.obstacles.push({ side: midS + gx, fwd: minF, radius: 0.75 });
    }
    hosp.add(
      box([11.4, 1.25, 0.65], "#0e6478", [0, 5.25, hd]),
      box([11.7, 0.18, 0.86], "#eef6f7", [0, 5.95, hd]),
    );
    const gateSignTex = createMedicalSignTex(
      "BỆNH VIỆN ĐA KHOA",
      "CẤP CỨU 24/24 · KHÁM CHỮA BỆNH",
    );
    const gateSignMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: gateSignTex,
      roughness: 0.42,
    });
    const gFront = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 1.1), gateSignMat);
    gFront.position.set(0, 5.25, hd + 0.35);
    const gBack = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 1.1), gateSignMat);
    gBack.position.set(0, 5.25, hd - 0.35);
    gBack.rotation.y = Math.PI;
    hosp.add(gFront, gBack);

    // Guard kiosk near gate
    hosp.add(
      box([1.8, 2.25, 1.7], "#eef4f5", [7.1, 1.4, hd - 2.1]),
      box([2.0, 0.2, 1.9], "#197682", [7.1, 2.58, hd - 2.1]),
    );
    this.obstacles.push({ side: midS + 7.1, fwd: minF + 2.1, radius: 1.3 });

    // Main 4-story hospital building (fwd 19.5..33.5 -> local z = +4.0, w = 30, d = 14)
    const wallTex4 = createHospitalWallTex(4);
    const wallMat4 = new THREE.MeshStandardMaterial({
      color: wallTex4 ? "#ffffff" : "#f0f4f6",
      map: wallTex4,
      roughness: 0.68,
    });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(30.0, 14.0, 14.0), wallMat4);
    mainBody.position.set(0, 7.28, 4.0);
    mainBody.castShadow = mainBody.receiveShadow = true;
    hosp.add(mainBody);
    this.world.cameraObstacles.push(mainBody);
    this.buildingPolygons.push(this.rectPoly(midS - 15.0, midS + 15.0, 19.5, 33.5));

    // Portico + emergency canopy facing Nguyễn Huệ
    for (const px of [-4.6, 4.6]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 4.4, 12),
        mat("#ffffff", 0.5),
      );
      col.position.set(px, 2.48, 13.8);
      col.castShadow = true;
      hosp.add(col);
    }
    hosp.add(
      box([11.2, 0.8, 4.6], "#197682", [0, 4.88, 12.2]),
      box([11.4, 0.16, 4.8], "#f4f8f9", [0, 5.34, 12.2]),
      box([4.4, 1.4, 2.0], "#e8f2f4", [0, 14.95, 7.0]),
      box([0.36, 0.95, 0.14], "#d62828", [0, 15.0, 8.06]),
      box([0.95, 0.36, 0.14], "#d62828", [0, 15.0, 8.06]),
    );
    const facadeSign = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 2.0), gateSignMat);
    facadeSign.position.set(0, 9.6, 11.08);
    hosp.add(facadeSign);

    // Rear 3-story inpatient block + connecting skybridge (fwd 42.5..53.5 -> local z = -17.5)
    const wallTex3 = createHospitalWallTex(3);
    const wallMat3 = new THREE.MeshStandardMaterial({
      color: wallTex3 ? "#ffffff" : "#f0f4f6",
      map: wallTex3,
      roughness: 0.68,
    });
    const rearBody = new THREE.Mesh(new THREE.BoxGeometry(24.0, 11.2, 11.0), wallMat3);
    rearBody.position.set(0, 5.88, -17.5);
    rearBody.castShadow = rearBody.receiveShadow = true;
    hosp.add(rearBody);
    this.world.cameraObstacles.push(rearBody);
    this.buildingPolygons.push(this.rectPoly(midS - 12.0, midS + 12.0, 42.5, 53.5));

    const skyBridge = new THREE.Mesh(new THREE.BoxGeometry(6.2, 4.6, 9.2), wallMat3);
    skyBridge.position.set(0, 7.4, -7.5);
    skyBridge.castShadow = true;
    hosp.add(skyBridge);

    // 2 parked Ambulances in front bay (side = midS ± 8.5, fwd = 12.0 -> z = +18.5)
    for (const [ax, yaw] of [
      [-8.5, 0.18],
      [8.5, -0.18],
    ]) {
      const amb = createAmbulance(yaw);
      amb.position.set(ax, 0.28, 18.5);
      hosp.add(amb);
      this.obstacles.push({ side: midS + ax, fwd: 12.0, radius: 2.3 });
    }

    // Courtyard shade trees along inner side margins
    for (const [tx, tf, s] of [
      [-18.0, 11.5, 1.0],
      [18.0, 11.5, 1.0],
      [-18.0, 38.0, 1.05],
      [18.0, 38.0, 1.05],
      [-17.5, 55.0, 1.0],
      [17.5, 55.0, 1.0],
    ]) {
      hosp.add(createParkTree(tx, 0.28, midF - tf, s, Math.abs(Math.round(tx + tf))));
      this.obstacles.push({ side: midS + tx, fwd: tf, radius: 1.05 });
    }

    this.group.add(hosp);
  }

  buildHemNho() {
    // Small paved alley immediately east of Bệnh viện Đa Khoa: side 108.5..114.5, fwd -4.0..66.0
    const midS = 111.5;
    const minF = -4.0;
    const maxF = 66.0;
    const midF = (minF + maxF) / 2; // 31.0
    const len = maxF - minF; // 70.0

    const alley = new THREE.Group();
    alley.name = "quang-trung-small-alley";
    const c = this.toWorld(midS, midF);
    alley.position.set(c.x, 0, c.z);
    alley.rotation.y = this.roadYaw;

    const asphalt = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.12, len),
      mat("#4a5057", 0.92),
    );
    asphalt.position.set(0, 0.18, 0);
    asphalt.receiveShadow = true;
    alley.add(asphalt);

    // Side concrete curbs along alley from fwd 1.0..65.5
    for (const sx of [-2.95, 2.95]) {
      alley.add(box([0.16, 0.08, 64.5], "#d8d5cd", [sx, 0.27, -2.25]));
    }
    // Alley yellow centerline dashes
    for (let z = -30.0; z <= 28.0; z += 4.5) {
      alley.add(box([0.12, 0.02, 2.1], "#ead68a", [0, 0.245, z]));
    }
    // Warm alley lamps along east curb
    for (const lf of [14.0, 34.0, 54.0]) {
      alley.add(createParkLamp(2.75, 0.24, midF - lf));
    }

    this.group.add(alley);
  }

  buildProjectPark() {
    // New Project Park east of Hẻm nhỏ, directly opposite & parallel to Dòng Chúa Cứu Thế!
    // side ∈ [115.0 .. 221.0] (w = 106.0), fwd ∈ [0.5 .. 65.0] (d = 64.5)
    const minS = 115.0;
    const maxS = 221.0;
    const minF = 0.5;
    const maxF = 65.0;
    const midS = (minS + maxS) / 2; // 168.0
    const midF = (minF + maxF) / 2; // 32.75
    const w = maxS - minS; // 106.0
    const d = maxF - minF; // 64.5

    const park = new THREE.Group();
    park.name = "quang-trung-project-park";
    const c = this.toWorld(midS, midF);
    park.position.set(c.x, 0, c.z);
    park.rotation.y = this.roadYaw;

    // 1) Base light-grey stone-tile park plaza (y top = 0.28)
    const tileTex = createParkTileTex();
    const plaza = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.14, d),
      new THREE.MeshStandardMaterial({
        color: tileTex ? "#ffffff" : "#d4d2cb",
        map: tileTex,
        roughness: 0.85,
      }),
    );
    plaza.position.set(0, 0.21, 0);
    plaza.receiveShadow = true;
    park.add(plaza);

    // 2) Dark basalt/charcoal side border paths & eastern plaza strips (matching image_6212c3e8.png)
    const darkStone = mat("#4d535a", 0.88);
    // West dark border walkway beside Hẻm nhỏ
    const westStrip = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.02, d - 1.5), darkStone);
    westStrip.position.set(-w / 2 + 2.4, 0.285, 0);
    westStrip.receiveShadow = true;
    // East dark wide strip beside promenade (as in right side of reference render)
    const eastDarkA = new THREE.Mesh(new THREE.BoxGeometry(7.5, 0.02, 42.0), darkStone);
    eastDarkA.position.set(27.0, 0.285, -3.5);
    eastDarkA.receiveShadow = true;
    const eastDarkB = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.02, 42.0), darkStone);
    eastDarkB.position.set(42.0, 0.285, -3.5);
    eastDarkB.receiveShadow = true;
    // Front asphalt street-edge parking bay strip for 3 angled white sedans
    const carBayApron = new THREE.Mesh(new THREE.BoxGeometry(24.0, 0.025, 7.6), mat("#41474e", 0.9));
    carBayApron.position.set(-34.0, 0.285, d / 2 - 3.8);
    carBayApron.receiveShadow = true;
    park.add(westStrip, eastDarkA, eastDarkB, carBayApron);

    // White angled parking stripes + 3 parked white sedans along front bay (matching image_6212c3e8.png)
    for (let i = 0; i < 4; i++) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.015, 5.2),
        mat("#eef2f5", 0.8),
      );
      stripe.position.set(-41.5 + i * 5.0, 0.298, d / 2 - 3.5);
      stripe.rotation.y = -0.35;
      park.add(stripe);
    }
    for (let i = 0; i < 3; i++) {
      const carX = -39.0 + i * 5.0;
      const carZ = d / 2 - 3.6;
      const car = createParkedWhiteSedan(-0.35);
      car.position.set(carX, 0.29, carZ);
      park.add(car);
      this.obstacles.push({ side: midS + carX, fwd: midF - carZ, radius: 2.2 });
    }

    // 3) Large Central Oval Emerald Lawn + Radial Stone Walk Connections
    const ovalX = -15.0;
    const ovalZ = -0.75; // fwd = 33.5
    const lawnTex = createParkLawnTex();
    const ovalGeo = new THREE.CylinderGeometry(20.5, 20.5, 0.08, 48);
    ovalGeo.scale(1.12, 1, 0.84);
    const ovalLawn = new THREE.Mesh(
      ovalGeo,
      new THREE.MeshStandardMaterial({
        color: lawnTex ? "#ffffff" : "#5b9a3b",
        map: lawnTex,
        roughness: 0.92,
      }),
    );
    ovalLawn.position.set(ovalX, 0.29, ovalZ);
    ovalLawn.receiveShadow = true;
    park.add(ovalLawn);

    // Crisp white concrete oval perimeter ring curb bordering the grass & stone promenade
    const curbGeo = new THREE.TorusGeometry(20.65, 0.18, 8, 56);
    curbGeo.rotateX(Math.PI / 2);
    curbGeo.scale(1.12, 1, 0.84);
    const ovalCurb = new THREE.Mesh(curbGeo, mat("#edeae2", 0.78));
    ovalCurb.position.set(ovalX, 0.31, ovalZ);
    park.add(ovalCurb);

    // White concrete outer ring footpath around oval (lighter stone border)
    const ringGeo = new THREE.RingGeometry(21.0, 24.4, 52);
    ringGeo.rotateX(-Math.PI / 2);
    ringGeo.scale(1.12, 1, 0.84);
    const ringPath = new THREE.Mesh(ringGeo, mat("#e2dfd8", 0.84));
    ringPath.position.set(ovalX, 0.284, ovalZ);
    ringPath.receiveShadow = true;
    park.add(ringPath);

    // Connecting warm-granite paths to Front Entrance & East Fountain Plaza
    const pathMat = mat("#e3e0d8", 0.84);
    const eastBridgePath = new THREE.Mesh(new THREE.BoxGeometry(23.5, 0.015, 5.2), pathMat);
    eastBridgePath.position.set(19.0, 0.287, -3.5);
    const fountainApron = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 0.016, 40), pathMat);
    fountainApron.position.set(34.5, 0.286, -3.5);
    fountainApron.receiveShadow = true;
    const frontEntryPath = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.015, 16.5), pathMat);
    frontEntryPath.position.set(0.0, 0.287, 23.0);
    park.add(eastBridgePath, fountainApron, frontEntryPath);

    // Low black bollard garden lights ringing the central oval curb
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI * 2) / 12 + 0.15;
      const bx = ovalX + Math.cos(a) * 21.0 * 1.12;
      const bz = ovalZ + Math.sin(a) * 21.0 * 0.84;
      park.add(createParkBollard(bx, 0.28, bz));
    }

    // Picnic mat & seated visitors relaxing on the central oval grass
    const picnicGroup = new THREE.Group();
    picnicGroup.name = "cong-vien-picnic-group";
    picnicGroup.position.set(ovalX - 5.6, 0.33, ovalZ + 1.8);
    picnicGroup.add(
      box([2.7, 0.02, 2.3], "#f4efe4", [0, 0, 0]),
      box([0.42, 0.24, 0.3], "#c2874c", [0.1, 0.13, -0.05]),
    );
    const picnicColors = ["#f4f6f8", "#3a668a", "#e8b44c", "#d95f76", "#3f7a58"];
    [
      [-0.7, -0.5, 0.4],
      [0.7, -0.5, -0.4],
      [-0.8, 0.55, 2.3],
      [0.75, 0.6, -2.4],
      [0.0, 0.8, Math.PI],
    ].forEach(([vx, vz, vy], idx) => {
      const v = createParkVisitor({ shirt: picnicColors[idx], seated: true });
      v.position.set(vx, 0.02, vz);
      v.rotation.y = vy;
      picnicGroup.add(v);
    });
    park.add(picnicGroup);
    this.obstacles.push({ side: midS + ovalX - 5.6, fwd: midF - (ovalZ + 1.8), radius: 1.9 });

    // Second reading/relaxing lawn mat on east side of the central emerald grass
    const readingGroup = new THREE.Group();
    readingGroup.name = "cong-vien-lawn-reading-group";
    readingGroup.position.set(ovalX + 7.2, 0.33, ovalZ - 3.6);
    readingGroup.add(
      box([2.2, 0.02, 1.8], "#d9e6dc", [0, 0, 0]),
      box([0.36, 0.04, 0.26], "#fff9ee", [0.05, 0.03, 0.08]),
    );
    [
      [-0.55, -0.35, 0.5, "#f0a060"],
      [0.55, -0.3, -0.5, "#47789e"],
      [0.0, 0.5, Math.PI, "#e7ecf0"],
    ].forEach(([vx, vz, vy, shirt]) => {
      const v = createParkVisitor({ shirt, seated: true });
      v.position.set(vx, 0.02, vz);
      v.rotation.y = vy;
      readingGroup.add(v);
    });
    park.add(readingGroup);
    this.obstacles.push({ side: midS + ovalX + 7.2, fwd: midF - (ovalZ - 3.6), radius: 1.6 });

    // 4) Iconic Warm-Timber + Royal-Blue Pitched-Roof Restroom / Service Pavilion (upper-right)
    const pavX = 24.5;
    const pavZ = -20.5; // fwd = 53.25
    const pav = new THREE.Group();
    pav.name = "cong-vien-nha-ve-sinh";
    pav.position.set(pavX, 0.28, pavZ);

    const pavBody = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 3.3, 5.2),
      mat("#c98842", 0.72),
    );
    pavBody.position.y = 1.65;
    pavBody.castShadow = pavBody.receiveShadow = true;
    pav.add(pavBody);
    this.world.cameraObstacles.push(pavBody);

    pav.add(
      box([10.1, 0.18, 5.7], "#dad6ce", [0, 0.09, 0]),
      box([4.2, 2.35, 0.35], "#272320", [0, 1.25, 2.52]),
      box([2.2, 2.25, 0.08], "#7c5838", [0, 1.2, 2.54]),
    );
    for (const sx of [-3.4, 3.4]) {
      pav.add(box([1.4, 1.5, 0.12], "#7a5230", [sx, 1.85, 2.62]));
    }

    const blueRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7.9, 2.0, 4),
      mat("#154aa8", 0.48, 0.12),
    );
    blueRoof.rotation.y = Math.PI / 4;
    blueRoof.scale.set(1.0, 1.0, 6.2 / 9.8);
    blueRoof.position.y = 4.25;
    blueRoof.castShadow = true;
    pav.add(
      blueRoof,
      box([10.6, 0.16, 6.2], "#f4f6f8", [0, 3.34, 0]),
    );

    const pavVisitorA = createParkVisitor({ shirt: "#ece7dc", pants: "#28303b" });
    pavVisitorA.position.set(-0.6, 0.16, 3.2);
    pavVisitorA.rotation.y = 0.5;
    const pavVisitorB = createParkVisitor({ shirt: "#314254", pants: "#1f2328" });
    pavVisitorB.position.set(0.55, 0.16, 3.35);
    pavVisitorB.rotation.y = -0.5;
    pav.add(pavVisitorA, pavVisitorB);
    pav.add(createWhiteBlossomShrubStrip(5.6, 1.6, -5.0, 0.02, 2.8));
    pav.add(createWhiteBlossomShrubStrip(8.0, 1.6, 7.0, 0.02, 2.8));

    park.add(pav);
    this.buildingPolygons.push(this.rectPoly(midS + pavX - 5.1, midS + pavX + 5.1, midF - pavZ - 2.9, midF - pavZ + 2.9));
    this.obstacles.push({ side: midS + pavX, fwd: midF - pavZ, radius: 4.5 });

    // 4b) Shaded Timber Pergolas (Chòi nghỉ mát) overlooking lawn & east plaza
    for (const [px, pz, pyaw] of [
      [-40.5, -15.5, Math.PI * 0.24],
      [34.5, 10.5, Math.PI],
    ]) {
      park.add(createTimberPergola(px, 0.28, pz, pyaw, 5.2, 3.6));
      this.obstacles.push({ side: midS + px, fwd: midF - pz, radius: 2.8 });
    }

    // 4c) Circular Stone Water Fountain & Reflecting Pool in East Relaxation Plaza
    const fountain = createParkFountain(34.5, 0.28, -3.5);
    park.add(fountain.group);
    this.fountainWater = fountain;
    this.obstacles.push({ side: midS + 34.5, fwd: midF - -3.5, radius: 4.35 });

    // Curved ring of 4 benches & visitors enjoying the fountain
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      const bx = 34.5 + Math.cos(a) * 5.85;
      const bz = -3.5 + Math.sin(a) * 5.85;
      const byaw = Math.atan2(34.5 - bx, -3.5 - bz);
      park.add(createParkBench(bx, 0.28, bz, byaw));
      this.obstacles.push({ side: midS + bx, fwd: midF - bz, radius: 0.95 });
      if (i % 2 === 0) {
        const sv = createParkVisitor({ shirt: i === 0 ? "#4e7c9e" : "#e5a34b", seated: true });
        sv.position.set(bx, 0.72, bz);
        sv.rotation.y = byaw;
        park.add(sv);
      }
    }

    // 4d) Outdoor Community Fitness Zone (SE) & Family Play Nook (SW)
    park.add(createFitnessCorner(34.5, 0.28, 20.0));
    this.obstacles.push({ side: midS + 34.5, fwd: midF - 20.0, radius: 3.6 });

    const playCorner = createFamilyPlayCorner(-39.5, 0.28, 17.8);
    park.add(playCorner.group);
    this.swingPivots.push(playCorner.swingPivot);
    this.obstacles.push({ side: midS - 39.5, fwd: midF - 17.8, radius: 3.2 });

    // 5) Organic Layered Flowering Shrub Borders lining outer ring & inner lawn accents
    for (const [sx, sz, sw, sd] of [
      [-15.0, 14.5, 9.5, 1.4],
      [-23.5, -13.5, 7.5, 1.4],
      [-23.0, 19.7, 8.5, 1.5],
      [5.2, 14.2, 6.0, 1.5],
      [-42.5, 2.2, 1.5, 5.2],
      [-32.4, -17.6, 6.5, 1.5],
      [-1.0, -19.5, 6.5, 1.5],
      [-10.0, d / 2 - 4.2, 16.0, 1.9],
      [-26.0, -d / 2 + 3.5, 18.0, 2.1],
      [8.0, -d / 2 + 3.5, 18.0, 2.1],
    ]) {
      park.add(createWhiteBlossomShrubStrip(sw, sd, sx, 0.28, sz));
    }

    // 6) Square white-curbed tree-wells & seasonal blossom shade trees
    const treeWells = [
      [-48.0, 18.5, "#f5cf47"],
      [-43.0, 9.5, null],
      [-21.0, 27.5, null],
      [-13.5, 27.5, "#f07c98"],
      [-6.0, 27.5, null],
      [5.5, 27.5, "#f5cf47"],
      [-43.5, -5.0, null],
      [-46.5, -19.5, "#f07c98"],
      [-36.0, -25.0, null],
      [-24.0, -26.5, null],
      [-10.0, -26.5, "#f5cf47"],
      [4.0, -26.5, null],
      [14.0, -22.5, "#f07c98"],
      [15.0, 19.0, null],
      [16.5, 9.0, "#f5cf47"],
      [16.5, -13.0, null],
      [48.0, 18.0, "#f07c98"],
      [48.5, 8.0, null],
      [48.5, -2.0, "#f5cf47"],
      [48.5, -12.0, null],
      [48.5, -22.0, null],
      [38.0, -25.5, null],
    ];
    treeWells.forEach(([tx, tz, blossom], idx) => {
      park.add(createSquareTreeWell(tx, 0.28, tz, 0.98 + (idx % 3) * 0.09, idx + 1, blossom));
      this.obstacles.push({ side: midS + tx, fwd: midF - tz, radius: 1.2 });
    });

    // 3 Lush Tropical Palms in SE corner
    for (const [px, pz, s] of [
      [39.0, 27.5, 0.98],
      [43.8, 28.0, 1.04],
      [48.5, 27.2, 0.94],
    ]) {
      park.add(createPalmTree(px, 0.28, pz, s));
      this.obstacles.push({ side: midS + px, fwd: midF - pz, radius: 0.95 });
    }

    // 7) Slatted Teak & Iron Park Benches + Shaded Picnic Table Sets + Waste Bins + Bike Rack
    for (const [bx, bz, yaw, hasReader] of [
      [-18.0, 25.0, 0, true],
      [-10.0, 25.0, 0, false],
      [-4.2, 24.8, 0, true],
      [6.0, 25.0, 0, false],
      [-37.5, -6.5, Math.PI * 0.3, false],
      [5.5, -17.5, -Math.PI * 0.72, true],
      [22.0, 3.0, Math.PI / 2, false],
      [45.5, -3.5, -Math.PI / 2, true],
    ]) {
      park.add(createParkBench(bx, 0.28, bz, yaw));
      this.obstacles.push({ side: midS + bx, fwd: midF - bz, radius: 0.95 });
      if (hasReader) {
        const reader = createParkVisitor({
          shirt: bx < 0 ? "#4e7a68" : "#d8a048",
          pants: "#2b3036",
          seated: true,
        });
        reader.position.set(bx, 0.72, bz);
        reader.rotation.y = yaw;
        park.add(reader);
      }
    }

    // Curved rear-north stone/wood amphitheater benches overlooking central oval
    for (let i = -3; i <= 3; i++) {
      const angle = i * 0.22;
      const cx = ovalX - 8.5 + Math.sin(angle) * 5.2;
      const cz = ovalZ - 20.5 - Math.cos(angle) * 2.2;
      park.add(createParkBench(cx, 0.28, cz, angle));
    }

    // Shaded picnic/chess tables under trees
    for (const [tx, tz, tyaw, visitors] of [
      [-45.5, 1.5, 0.2, true],
      [11.5, -12.5, -0.3, true],
      [25.5, 15.5, 0.0, false],
      [41.5, -12.5, 0.15, true],
    ]) {
      park.add(createPicnicTableSet(tx, 0.28, tz, tyaw, visitors));
      this.obstacles.push({ side: midS + tx, fwd: midF - tz, radius: 1.45 });
    }

    // Recycling waste bins & entrance bicycle parking rack
    for (const [bx, bz] of [
      [-20.5, 25.2],
      [28.5, -1.5],
      [20.0, 29.2],
    ]) {
      park.add(createParkBin(bx, 0.28, bz));
    }
    park.add(createBikeRack(23.2, 0.28, d / 2 - 2.8));
    this.obstacles.push({ side: midS + 23.2, fwd: minF + 2.8, radius: 1.6 });

    // 8) Modern park lights lining circular & corridor walks
    for (const [lx, lz] of [
      [-35.0, 13.0],
      [-36.0, -14.5],
      [-16.0, -23.5],
      [4.5, -18.5],
      [12.0, 14.0],
      [15.0, 2.0],
      [25.5, 16.0],
      [42.0, 4.0],
    ]) {
      park.add(createParkLamp(lx, 0.28, lz));
      this.obstacles.push({ side: midS + lx, fwd: midF - lz, radius: 0.45 });
    }

    // 9) Entrance Park Signboard facing Nguyễn Huệ & Dòng Chúa Cứu Thế
    const parkSignTex = createParkSignTex();
    const signGroup = new THREE.Group();
    signGroup.name = "cong-vien-du-an-sign";
    signGroup.position.set(14.5, 0.28, d / 2 - 1.2);
    signGroup.add(
      box([0.14, 2.5, 0.14], "#2f3932", [-2.2, 1.25, 0]),
      box([0.14, 2.5, 0.14], "#2f3932", [2.2, 1.25, 0]),
    );
    const sBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 1.2),
      new THREE.MeshStandardMaterial({
        color: parkSignTex ? "#ffffff" : "#1c5e3a",
        map: parkSignTex,
        roughness: 0.45,
      }),
    );
    sBoard.position.set(0, 2.1, 0.09);
    const sBack = sBoard.clone();
    sBack.position.set(0, 2.1, -0.09);
    sBack.rotation.y = Math.PI;
    signGroup.add(sBoard, sBack);
    park.add(signGroup);
    this.obstacles.push({ side: midS + 14.5, fwd: minF + 1.2, radius: 1.5 });

    // 10) Strolling visitor couples & joggers along the circular & fountain walkways
    const paths = [
      { cx: ovalX, cz: ovalZ, rx: 25.2, rz: 18.9, speed: 0.13, phase: 0.2, shirtA: "#eef2f6", shirtB: "#424a52" },
      { cx: ovalX, cz: ovalZ, rx: 25.8, rz: 19.3, speed: -0.11, phase: 2.1, shirtA: "#c96472", shirtB: "#34495e" },
      { cx: ovalX, cz: ovalZ, rx: 24.6, rz: 18.4, speed: 0.10, phase: 4.0, shirtA: "#4a7856", shirtB: "#f2ead8" },
      { cx: 34.5, cz: -3.5, rx: 4.8, rz: 4.8, speed: 0.22, phase: 1.1, shirtA: "#2f5d8a", shirtB: "#d49b42" },
    ];
    for (const p of paths) {
      const pair = new THREE.Group();
      const v1 = createParkVisitor({ shirt: p.shirtA });
      v1.position.x = -0.32;
      const v2 = createParkVisitor({ shirt: p.shirtB });
      v2.position.x = 0.32;
      pair.add(v1, v2);
      park.add(pair);
      this.strollers.push({ group: pair, v1, v2, ...p });
    }

    this.group.add(park);
  }

  registerLandmarks() {
    if (!this.world.landmarks) return;
    this.world.landmarks.set("benh-vien-da-khoa", {
      id: "benh-vien-da-khoa",
      title: "Bệnh viện Đa Khoa",
      position: this.toWorld(85.5, 4.0),
      radius: 44,
      description:
        "Nằm ngay bên cạnh Rose Garden Café trước hẻm nhỏ trên đường Nguyễn Huệ với cổng lớn, sảnh cấp cứu và đội xe cứu thương túc trực.",
    });
    this.world.landmarks.set("cong-vien-du-an", {
      id: "cong-vien-du-an",
      title: "Công viên Dự Án Nguyễn Huệ",
      position: this.toWorld(156.0, 26.0),
      radius: 62,
      description:
        "Công viên cây xanh cộng đồng đối diện Nhà thờ Dòng Chúa Cứu Thế với thảm cỏ bầu dục dã ngoại, chòi nghỉ giàn hoa gỗ, hồ phun nước, khu tập thể dục và góc vui chơi gia đình.",
    });
  }

  inPrecinct(wx, wz, pad = 0) {
    const { side, fwd } = this.toLocal(wx, wz);
    return (
      side >= 63.0 - pad &&
      side <= 221.0 + pad &&
      fwd >= 0.5 - pad &&
      fwd <= 65.5 + pad
    );
  }

  inAlley(wx, wz) {
    const { side, fwd } = this.toLocal(wx, wz);
    return side >= 108.5 && side <= 114.5 && fwd >= -4.0 && fwd <= 66.0;
  }

  blocksOmittedBuilding(wx, wz) {
    // Prevent generic low-detail OSM boxes/floating signage from spawning across Rose Garden, Bệnh viện Đa Khoa, Hẻm nhỏ, and Công viên Dự Án
    const { side, fwd } = this.toLocal(wx, wz);
    return side >= 37.5 && side <= 223.5 && fwd >= -2.5 && fwd <= 68.0;
  }

  groundAt(wx, wz, referenceY) {
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    if (this.inAlley(wx, wz)) return 0.24;
    if (this.inPrecinct(wx, wz)) return 0.28;
    return null;
  }

  canRide(wx, wz) {
    if (hitsCampusWall({ x: wx, z: wz }, this.fenceSegments, 0.55)) {
      return false;
    }
    if (this.inAlley(wx, wz)) return true;
    if (!this.inPrecinct(wx, wz)) return null;
    if (this.buildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
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
    return this.inPrecinct(wx, wz, 0.8) || this.inAlley(wx, wz);
  }

  blocksTree(wx, wz) {
    const { side, fwd } = this.toLocal(wx, wz);
    if (side >= 37.5 && side <= 222.0 && fwd >= -10.0 && fwd <= 66.5) {
      return true;
    }
    return false;
  }

  update(time, playerPos = null) {
    const center = this.toWorld(168.0, 32.5);
    const inRange =
      !playerPos ||
      Math.hypot(playerPos.x - center.x, playerPos.z - center.z) < 160;
    for (const s of this.strollers) {
      s.group.visible = inRange;
      if (!inRange) continue;
      const t = time * s.speed + s.phase;
      const nx = s.cx + Math.cos(t) * s.rx;
      const nz = s.cz + Math.sin(t) * s.rz;
      const dx = -Math.sin(t) * s.rx * s.speed;
      const dz = Math.cos(t) * s.rz * s.speed;
      s.group.position.set(nx, 0.29, nz);
      s.group.rotation.y = Math.atan2(dx, dz);

      const swing = Math.sin(time * 4.5 + s.phase) * 0.25;
      for (const v of [s.v1, s.v2]) {
        if (v.userData.legL) v.userData.legL.rotation.x = swing;
        if (v.userData.legR) v.userData.legR.rotation.x = -swing;
      }
    }
    if (this.fountainWater && inRange) {
      const pulse = 1 + Math.sin(time * 3.6) * 0.14;
      this.fountainWater.jet.scale.set(1, pulse, 1);
      const rScale = 1 + ((time * 0.55) % 1) * 1.3;
      this.fountainWater.ripple.scale.set(rScale, rScale, 1);
      this.fountainWater.ripple.material.opacity = Math.max(0.05, 0.55 * (1 - ((time * 0.55) % 1)));
    }
    for (let i = 0; i < this.swingPivots.length; i++) {
      this.swingPivots[i].rotation.x = Math.sin(time * 1.9 + i) * 0.14;
    }
  }
}
