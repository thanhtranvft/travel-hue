import * as THREE from "three";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnTexture } from "../../../../core/world/turfTextures.js";

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

function createParkingAsphaltTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#5b6066";
      ctx.fillRect(0, 0, w, h);
      // Concrete joint grid + subtle weathered tire/aggregate grain
      for (let i = 0; i < 2400; i++) {
        const x = (i * 173 + 29) % w;
        const y = (i * 311 + 61) % h;
        ctx.fillStyle =
          i % 3 === 0
            ? "rgba(220,224,228,0.09)"
            : i % 3 === 1
              ? "rgba(42,46,50,0.12)"
              : "rgba(140,144,150,0.08)";
        ctx.fillRect(x, y, 2 + (i % 2), 2);
      }
      ctx.strokeStyle = "rgba(38, 42, 46, 0.32)";
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
    6,
    6,
  );
}

function createCafeFlagstoneTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#988e7e";
      ctx.fillRect(0, 0, w, h);
      const tile = 64;
      for (let r = 0; r < h / tile; r++) {
        for (let c = 0; c < w / tile; c++) {
          const shift = ((r * 7 + c * 11) % 5) * 4 - 8;
          ctx.fillStyle = `rgb(${182 + shift}, ${166 + shift}, ${144 + shift})`;
          const ox = r % 2 === 0 ? 0 : tile / 2;
          ctx.fillRect((c * tile + ox) % w + 2, r * tile + 2, tile - 4, tile - 4);
        }
      }
    },
    8,
    6,
  );
}

function createTimberDeckTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#7a5335";
      ctx.fillRect(0, 0, w, h);
      const rows = 10;
      const rh = h / rows;
      for (let r = 0; r < rows; r++) {
        const y0 = r * rh;
        ctx.fillStyle = r % 2 === 0 ? "#855b3b" : "#734d30";
        ctx.fillRect(0, y0, w, rh - 2);
        ctx.fillStyle = "#4b301c";
        ctx.fillRect(0, y0 + rh - 2, w, 2);
      }
    },
    4,
    3,
  );
}

function createParkingSignTexture() {
  return createCanvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#174b8c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f2f5f8";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    // Bold P badge on left
    ctx.fillStyle = "#f5f8fc";
    ctx.roundRect?.(28, 36, 118, 184, 14);
    ctx.fill?.();
    ctx.fillStyle = "#174b8c";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 124px sans-serif";
    ctx.fillText("P", 87, 132);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = "bold 34px sans-serif";
    ctx.fillText("BÃI ĐỖ XE", 170, 78);
    ctx.fillStyle = "#ffe074";
    ctx.font = "bold 25px sans-serif";
    ctx.fillText("BẢO TÀNG HỒ CHÍ MINH", 170, 128);
    ctx.fillStyle = "#dce9fa";
    ctx.font = "600 24px sans-serif";
    ctx.fillText("XE MÁY · Ô TÔ DU LỊCH", 170, 180);
  });
}

function createCaySiSignTexture(subtitle = "CÀ PHÊ SÂN VƯỜN · BÊN BẢO TÀNG HCM") {
  return createCanvasTex(640, 192, (ctx, w, h) => {
    ctx.fillStyle = "#2b1e14";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d9b268";
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#3f5d32";
    ctx.fillRect(22, 22, w - 44, h - 44);
    ctx.fillStyle = "#fff1cf";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 56px Georgia, serif";
    ctx.fillText("CAFÉ CÂY SI", w / 2, h * 0.42);
    ctx.fillStyle = "#f0cf82";
    ctx.font = "600 22px sans-serif";
    ctx.fillText(subtitle, w / 2, h * 0.76);
  });
}

function createMenuBoardTexture() {
  return createCanvasTex(256, 384, (ctx, w, h) => {
    ctx.fillStyle = "#232a24";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#8a623c";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, w - 10, h - 10);
    ctx.fillStyle = "#f4df9e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 28px Georgia, serif";
    ctx.fillText("CAFÉ CÂY SI", w / 2, 54);
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px sans-serif";
    ctx.fillText("Cà phê Muối Huế", w / 2, 128);
    ctx.fillText("Cà phê Sữa Đá", w / 2, 174);
    ctx.fillText("Trà Sen Cung Đình", w / 2, 220);
    ctx.fillText("Nước Ép Dứa Tươi", w / 2, 266);
    ctx.fillStyle = "#e8a55c";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("Dưới Tán Phượng Vĩ", w / 2, 330);
  });
}

function createGroundStencilTexture(text, bgColor = "#5b6066") {
  return createCanvasTex(512, 192, (ctx, w, h) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f2f4f7";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#f6f7f9";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 72px sans-serif";
    ctx.fillText(text, w / 2, h / 2);
  });
}

// Composite parked car (8 parts: chassis, lower body, cabin, glass, bumpers, headlights, taillights, 4 wheels + rims)
function createParkedCar(x, y, z, yaw, bodyColor, isSuv = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const bodyH = isSuv ? 0.78 : 0.66;
  const cabinH = isSuv ? 0.64 : 0.54;
  const cabinLen = isSuv ? 2.55 : 2.05;
  const cabinZ = isSuv ? -0.22 : -0.15;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.82, bodyH, 4.35),
    new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.34,
      metalness: 0.42,
    }),
  );
  body.position.set(0, 0.3 + bodyH / 2, 0);
  body.castShadow = body.receiveShadow = true;

  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(1.58, cabinH, cabinLen),
    new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.36,
      metalness: 0.38,
    }),
  );
  cabin.position.set(0, 0.3 + bodyH + cabinH / 2 - 0.04, cabinZ);
  cabin.castShadow = true;

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(1.62, cabinH * 0.76, cabinLen - 0.22),
    new THREE.MeshStandardMaterial({
      color: "#1b2833",
      roughness: 0.14,
      metalness: 0.55,
    }),
  );
  glass.position.copy(cabin.position);

  const frontBumper = box([1.78, 0.2, 0.14], "#23272c", [0, 0.34, 2.18]);
  const rearBumper = box([1.78, 0.2, 0.14], "#23272c", [0, 0.34, -2.18]);
  const headMat = new THREE.MeshStandardMaterial({
    color: "#fff7dc",
    emissive: "#ffe49a",
    emissiveIntensity: 0.28,
    roughness: 0.2,
  });
  const tailMat = mat("#c42828", 0.35, 0.2);

  g.add(body, cabin, glass, frontBumper, rearBumper);
  for (const sx of [-0.62, 0.62]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.08), headMat);
    hl.position.set(sx, 0.62, 2.19);
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.08), tailMat);
    tl.position.set(sx, 0.66, -2.19);
    g.add(hl, tl);
  }

  const tireMat = mat("#1d2023", 0.88);
  const rimMat = mat("#c8cdd2", 0.32, 0.75);
  const tireGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 12);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.19, 0.19, 0.24, 10);
  rimGeo.rotateZ(Math.PI / 2);

  for (const wx of [-0.86, 0.86]) {
    for (const wz of [-1.28, 1.32]) {
      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.position.set(wx, 0.33, wz);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.position.set(wx, 0.33, wz);
      g.add(tire, rim);
    }
  }
  return g;
}

// Composite parked motorbike / scooter (7 parts: main body, front apron, seat, handlebars + mirrors, headlight, 2 wheels)
function createParkedMotorbike(x, y, z, yaw, color) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.46, 1.44),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.35 }),
  );
  body.position.set(0, 0.52, -0.02);
  body.castShadow = true;

  const frontShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.54, 0.34),
    new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.35 }),
  );
  frontShield.position.set(0, 0.68, 0.46);
  frontShield.rotation.x = -0.22;
  frontShield.castShadow = true;

  const seat = box([0.36, 0.14, 0.68], "#202226", [0, 0.82, -0.14]);
  const handle = box([0.66, 0.08, 0.1], "#b8bec4", [0, 1.0, 0.44]);
  const headlight = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.12, 0.08),
    mat("#fff6d4", 0.25),
  );
  headlight.position.set(0, 0.88, 0.61);

  g.add(body, frontShield, seat, handle, headlight);

  for (const mx of [-0.28, 0.28]) {
    g.add(box([0.04, 0.16, 0.04], "#2d3033", [mx, 1.08, 0.44]));
  }

  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  const tireMat = mat("#1d1f22", 0.88);
  for (const wz of [-0.52, 0.55]) {
    const w = new THREE.Mesh(wheelGeo, tireMat);
    w.position.set(0, 0.24, wz);
    g.add(w);
  }
  return g;
}

// Large Royal Poinciana / Cây Phượng Vĩ lớn with wide umbrella crown & crimson-scarlet blossoms + fallen petals
function createLargeFlamboyantTree(x, y, z, scale = 1.0, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.43;

  const barkMat = mat("#64574a", 0.92);
  const trunkH = 3.3 * scale;

  // Flared trunk base + main trunk
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28 * scale, 0.52 * scale, 1.0 * scale, 9),
    barkMat,
  );
  base.position.y = 0.5 * scale;
  base.castShadow = base.receiveShadow = true;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.3 * scale, trunkH, 8),
    barkMat,
  );
  trunk.position.y = trunkH / 2 + 0.3 * scale;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(base, trunk);

  // 5 wide-spreading forked boughs creating the iconic flat umbrella silhouette
  const boughAngles = [0.2, 1.45, 2.75, 4.05, 5.25];
  const greenTones = ["#3b752f", "#4b8a39", "#5a9a43", "#326728"];
  const blossomTones = ["#e03320", "#ec4827", "#cf241a", "#f2632c"];

  boughAngles.forEach((ang, i) => {
    const bLen = (2.8 + (i % 2) * 0.55) * scale;
    const bough = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085 * scale, 0.17 * scale, bLen, 7),
      barkMat,
    );
    bough.position.set(
      Math.cos(ang) * (bLen * 0.45),
      trunkH + 0.72 * scale,
      Math.sin(ang) * (bLen * 0.45),
    );
    bough.rotation.z = -Math.cos(ang) * 0.88;
    bough.rotation.x = Math.sin(ang) * 0.88;
    bough.castShadow = true;
    g.add(bough);

    // Broad feathery green umbrella foliage pad at each bough tip
    const tipR = (1.85 + (i % 2) * 0.35) * scale;
    const tipDist = (2.15 + (i % 2) * 0.4) * scale;
    const tipY = trunkH + (1.75 + (i % 3) * 0.25) * scale;
    const pad = new THREE.Mesh(
      new THREE.DodecahedronGeometry(tipR, 1),
      mat(greenTones[i % greenTones.length], 0.86),
    );
    pad.position.set(Math.cos(ang) * tipDist, tipY, Math.sin(ang) * tipDist);
    pad.scale.set(1.32, 0.46, 1.28);
    pad.castShadow = pad.receiveShadow = true;
    g.add(pad);

    // Rich scarlet-vermilion Hoa Phượng blossom canopy clusters crowning the outer & upper branch
    for (let k = 0; k < 2; k++) {
      const subAng = ang + (k === 0 ? -0.22 : 0.26);
      const blDist = tipDist + (0.45 + k * 0.35) * scale;
      const blossom = new THREE.Mesh(
        new THREE.DodecahedronGeometry((0.92 - k * 0.16) * scale, 1),
        mat(blossomTones[(i + k) % blossomTones.length], 0.64),
      );
      blossom.position.set(
        Math.cos(subAng) * blDist,
        tipY + (0.44 - k * 0.14) * scale,
        Math.sin(subAng) * blDist,
      );
      blossom.scale.set(1.35, 0.45, 1.3);
      blossom.castShadow = true;
      g.add(blossom);
    }
  });

  // Broad upper central crown pad + vibrant scarlet top bloom dome
  const centerCrown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.65 * scale, 1),
    mat("#468536", 0.85),
  );
  centerCrown.position.set(0, trunkH + 2.35 * scale, 0);
  centerCrown.scale.set(1.36, 0.44, 1.36);
  centerCrown.castShadow = centerCrown.receiveShadow = true;
  g.add(centerCrown);

  for (let c = 0; c < 4; c++) {
    const ca = (c * Math.PI) / 2 + 0.5;
    const topBloom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.15 * scale, 1),
      mat(blossomTones[c % blossomTones.length], 0.62),
    );
    topBloom.position.set(
      Math.cos(ca) * 1.15 * scale,
      trunkH + 2.72 * scale,
      Math.sin(ca) * 1.15 * scale,
    );
    topBloom.scale.set(1.3, 0.42, 1.25);
    g.add(topBloom);
  }

  // Subtle fallen crimson phượng petals scattered on the ground around trunk base
  const petalMat = mat("#d63a28", 0.78);
  for (let p = 0; p < 7; p++) {
    const pa = p * 0.91 + seed;
    const pr = (0.9 + (p % 3) * 0.85) * scale;
    const petalPatch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45 * scale, 0.52 * scale, 0.025, 7),
      petalMat,
    );
    petalPatch.position.set(Math.cos(pa) * pr, 0.022, Math.sin(pa) * pr);
    petalPatch.scale.set(1.2, 1, 0.85);
    g.add(petalPatch);
  }

  return g;
}

// Iconic Ancient Banyan / Cây Si Cổ Thụ with hanging aerial prop roots & golden fairy lights
function createAncientCaySiTree(x, y, z, lightsOut) {
  const g = new THREE.Group();
  g.name = "cay-si-ancient-banyan";
  g.position.set(x, y, z);

  const barkMat = mat("#554334", 0.94);
  const rootMat = mat("#644e3c", 0.9);

  // Fluted multi-stem trunk core
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.65, 4.4, 12),
    barkMat,
  );
  core.position.y = 2.2;
  core.castShadow = core.receiveShadow = true;
  g.add(core);

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const buttress = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.46, 3.2, 7),
      barkMat,
    );
    buttress.position.set(Math.cos(a) * 0.95, 1.4, Math.sin(a) * 0.95);
    buttress.rotation.z = -Math.cos(a) * 0.35;
    buttress.rotation.x = Math.sin(a) * 0.35;
    buttress.castShadow = true;
    g.add(buttress);
  }

  // 7 wide spreading banyan limbs
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7 + 0.3;
    const len = 5.4 + (i % 2) * 1.1;
    const bough = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.42, len, 8),
      barkMat,
    );
    bough.position.set(Math.cos(a) * (len * 0.45), 4.6, Math.sin(a) * (len * 0.45));
    bough.rotation.z = -Math.cos(a) * 1.12;
    bough.rotation.x = Math.sin(a) * 1.12;
    bough.castShadow = true;
    g.add(bough);
  }

  // 24 characteristic hanging Cây Si aerial prop roots draping down from the boughs
  for (let i = 0; i < 24; i++) {
    const a = i * 2.39996;
    const r = 2.1 + (i % 5) * 0.85;
    const rootLen = 2.4 + ((i * 7) % 10) * 0.22;
    const aerial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.052, rootLen, 6),
      rootMat,
    );
    aerial.position.set(
      Math.cos(a) * r,
      5.15 - rootLen / 2,
      Math.sin(a) * r,
    );
    aerial.rotation.z = Math.sin(i) * 0.05;
    aerial.castShadow = true;
    g.add(aerial);
  }

  // Dense deep-emerald banyan canopy (~14m spread)
  const canopyTones = ["#245821", "#2f6829", "#3c7a32", "#47883a"];
  const domes = [
    [0, 7.6, 0, 4.4, 0.62],
    [0, 9.1, 0, 3.1, 0.64],
  ];
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9;
    const r = 4.2 + (i % 2) * 0.95;
    domes.push([
      Math.cos(a) * r,
      6.4 + (i % 3) * 0.45,
      Math.sin(a) * r,
      2.85 + (i % 2) * 0.45,
      0.62,
    ]);
  }
  domes.forEach(([cx, cy, cz, r, sy], idx) => {
    const dome = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(canopyTones[idx % canopyTones.length], 0.86),
    );
    dome.position.set(cx, cy, cz);
    dome.scale.set(1.12, sy, 1.12);
    dome.castShadow = dome.receiveShadow = true;
    g.add(dome);
  });

  // Warm golden café string bulbs nestled under the Cây Si canopy
  const bulbGeo = new THREE.SphereGeometry(0.085, 8, 6);
  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI * 2) / 18;
    const r = 3.2 + (i % 3) * 1.15;
    const bulbMat = new THREE.MeshStandardMaterial({
      color: "#fff0ba",
      emissive: "#ffbf48",
      emissiveIntensity: 0.9,
      roughness: 0.25,
    });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(Math.cos(a) * r, 4.45 + (i % 2) * 0.35, Math.sin(a) * r);
    bulb.userData.phase = i * 0.63;
    g.add(bulb);
    if (lightsOut) lightsOut.push(bulb);
  }

  return g;
}

function createCafeTableSet(x, y, z, parasolColor = null, withPatron = false, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const woodMat = mat("#7b5031", 0.76);
  const metalMat = mat("#23272b", 0.48, 0.56);

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.55, 0.06, 12),
    woodMat,
  );
  top.position.y = 0.74;
  top.castShadow = true;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.72, 8),
    metalMat,
  );
  stem.position.y = 0.36;
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.3, 0.05, 10),
    metalMat,
  );
  foot.position.y = 0.025;
  g.add(top, stem, foot);

  for (const [idx, cx, cz, ry] of [
    [0, -0.74, 0, Math.PI / 2],
    [1, 0.74, 0, -Math.PI / 2],
  ]) {
    const chair = new THREE.Group();
    chair.position.set(cx, 0, cz);
    chair.rotation.y = ry;
    chair.add(
      box([0.44, 0.05, 0.44], "#8b5a37", [0, 0.44, 0]),
      box([0.44, 0.42, 0.05], "#8b5a37", [0, 0.66, -0.2]),
      box([0.05, 0.44, 0.05], "#272b2e", [-0.18, 0.22, -0.18]),
      box([0.05, 0.44, 0.05], "#272b2e", [0.18, 0.22, -0.18]),
      box([0.05, 0.44, 0.05], "#272b2e", [-0.18, 0.22, 0.18]),
      box([0.05, 0.44, 0.05], "#272b2e", [0.18, 0.22, 0.18]),
    );
    g.add(chair);

    if (withPatron && idx === seed % 2) {
      const shirtColors = ["#e8dfcc", "#486b7a", "#b8644d", "#5a7c54", "#d9a44e"];
      const patron = new THREE.Group();
      patron.position.set(cx, 0.47, cz);
      patron.rotation.y = ry;
      patron.add(
        box([0.34, 0.45, 0.24], shirtColors[(seed + idx) % shirtColors.length], [0, 0.25, 0]),
        box([0.32, 0.14, 0.36], "#2f3845", [0, 0.07, 0.12]),
      );
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 8),
        mat("#e5be9e", 0.72),
      );
      head.position.set(0, 0.6, 0.02);
      patron.add(head);
      g.add(patron);
    }
  }

  for (const oz of [-0.13, 0.14]) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.036, 0.08, 8),
      mat("#f7f4ec", 0.28),
    );
    cup.position.set(oz * 0.45, 0.81, oz);
    g.add(cup);
  }

  if (parasolColor) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.045, 2.55, 8),
      mat("#4c3624", 0.78),
    );
    pole.position.y = 1.28;
    pole.castShadow = true;
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.75, 0.55, 8),
      mat(parasolColor, 0.84),
    );
    canopy.position.y = 2.52;
    canopy.castShadow = canopy.receiveShadow = true;
    g.add(pole, canopy);
  }

  return g;
}

function createParkBench(x, y, z, yaw = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  for (const sx of [-0.72, 0.72]) {
    g.add(
      box([0.08, 0.44, 0.5], "#2f3c38", [sx, 0.22, 0]),
      box([0.07, 0.46, 0.07], "#2f3c38", [sx, 0.64, -0.22]),
    );
  }
  g.add(
    box([1.75, 0.07, 0.46], "#9e6b42", [0, 0.45, 0.02]),
    box([1.75, 0.34, 0.06], "#a67147", [0, 0.72, -0.22]),
  );
  return g;
}

export class MuseumParkingAndCaySiCafe {
  constructor(world) {
    this.world = world;
    this.lights = [];
    this.animatedObjects = [];
    this.treeTrunks = [];
    this.obstacles = [];

    if (world.biaPark) {
      this.toWorld = world.biaPark.toWorld;
      this.toLocal = world.biaPark.toLocal;
    } else {
      const origin = { x: 480.43927587264506, z: -498.0574304452289 };
      const heading = 41.69 * (Math.PI / 180);
      const cosY = Math.cos(heading);
      const sinY = Math.sin(heading);
      this.toWorld = (lx, lz) => ({
        x: origin.x + lx * cosY + lz * sinY,
        z: origin.z - lx * sinY + lz * cosY,
      });
      this.toLocal = (wx, wz) => {
        const dx = wx - origin.x;
        const dz = wz - origin.z;
        return {
          lx: dx * cosY - dz * sinY,
          lz: dx * sinY + dz * cosY,
        };
      };
    }

    const p0 = this.toWorld(0, 0);
    const px = this.toWorld(10, 0);
    const frameHeading = Math.atan2(-(px.z - p0.z), px.x - p0.x);

    this.group = new THREE.Group();
    this.group.name = "museum-parking-and-cay-si-cafe";
    this.group.position.set(p0.x, 0, p0.z);
    this.group.rotation.y = frameHeading;

    // 1. Bãi đỗ xe máy & ô tô ngay cạnh Bảo tàng Hồ Chí Minh (clear of service road 39417236 & footway 1473289087)
    this.parkingPoly = [
      { x: -166.5, z: 35.6 },
      { x: -130.5, z: 35.6 },
      { x: -130.5, z: 22.0 },
      { x: -135.5, z: 10.0 },
      { x: -163.5, z: 10.0 },
    ];
    this.parkingEntrance = this.toWorld(-150.5, 36.4);

    // 2. Quán Café Cây Si ngay cạnh bãi đỗ xe (clear of footways 1167513737 & 1167513738)
    this.cafePoly = [
      { x: -117.5, z: 6.0 },
      { x: -109.5, z: 19.5 },
      { x: -95.5, z: 25.5 },
      { x: -77.5, z: 26.5 },
      { x: -77.5, z: -2.5 },
      { x: -97.5, z: -4.5 },
      { x: -112.5, z: 0.5 },
    ];
    this.cafeEntrance = this.toWorld(-111.5, 13.0);
    this.caySiPos = { lx: -99.0, lz: 11.5 };
    this.pavilionPos = { lx: -85.5, lz: 15.0 };

    this.buildParkingLot();
    this.buildCaySiCafe();
    this.buildFlamboyantGrove();
    this.animatedObjects.push(...this.lights);

    world.scene.add(this.group);
  }

  inParkingLot(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    if (lx < -167.0 || lx > -130.0 || lz < 9.5 || lz > 38.0) return false;
    if (lx >= -157.5 && lx <= -143.5 && lz > 35.4 && lz <= 37.8) return true;
    return inside({ x: lx, z: lz }, this.parkingPoly);
  }

  inCafeParcel(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    if (lx < -118.0 || lx > -77.0 || lz < -5.0 || lz > 27.0) return false;
    return inside({ x: lx, z: lz }, this.cafePoly);
  }

  inParcel(wx, wz) {
    return this.inParkingLot(wx, wz) || this.inCafeParcel(wx, wz);
  }

  _extrudePolygonSlab(poly, height, material, name) {
    const shape = new THREE.Shape();
    poly.forEach((p, idx) => {
      if (idx === 0) shape.moveTo(p.x, -p.z);
      else shape.lineTo(p.x, -p.z);
    });
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height,
      bevelEnabled: false,
    });
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, material);
    mesh.name = name;
    mesh.position.y = 0.01;
    mesh.receiveShadow = true;
    return mesh;
  }

  buildParkingLot() {
    const g = new THREE.Group();
    g.name = "museum-car-motorbike-parking-lot";
    this.group.add(g);

    const asphaltMat = new THREE.MeshStandardMaterial({
      color: "#6b7076",
      map: createParkingAsphaltTexture(),
      roughness: 0.88,
      metalness: 0.04,
    });
    const concreteMat = mat("#c6c9cd", 0.84);
    const curbMat = mat("#aeb3b9", 0.86);
    const stripeMat = new THREE.MeshStandardMaterial({
      color: "#f2f4f7",
      roughness: 0.7,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });

    // Paved parking lot slab (top at y = 0.23m)
    const lotSlab = this._extrudePolygonSlab(
      this.parkingPoly,
      0.22,
      asphaltMat,
      "museum-parking-lot-slab",
    );
    g.add(lotSlab);
    this.world.cameraObstacles.push(lotSlab);

    // Smooth entry driveway apron connecting to Lê Lợi footway (without touching Lê Lợi carriageway)
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(13.6, 0.16, 2.5),
      concreteMat,
    );
    apron.position.set(-150.5, 0.13, 36.65);
    apron.rotation.x = 0.032;
    apron.receiveShadow = true;
    g.add(apron);

    // Perimeter low stone curbs along non-entrance edges
    for (const [cx, cz, len, yaw] of [
      [-165.0, 22.8, 25.4, Math.PI / 2 - 0.12],
      [-149.5, 10.1, 27.6, 0],
      [-133.0, 16.0, 12.8, Math.PI / 2 - 0.39],
      [-130.6, 28.8, 13.4, Math.PI / 2],
      [-161.8, 35.5, 9.2, 0],
      [-137.0, 35.5, 12.8, 0],
    ]) {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 0.28), curbMat);
      curb.position.set(cx, 0.28, cz);
      curb.rotation.y = yaw;
      curb.castShadow = curb.receiveShadow = true;
      g.add(curb);
    }

    // Security / Ticket Kiosk (Trạm bảo vệ / Giữ xe) near entry
    const kiosk = new THREE.Group();
    kiosk.name = "museum-parking-kiosk";
    kiosk.position.set(-158.8, 0.23, 33.4);
    const kBase = box([2.4, 0.22, 2.2], "#8f959c", [0, 0.11, 0]);
    const kBody = box([2.1, 2.25, 1.9], "#ede7da", [0, 1.32, 0]);
    const kWindow = new THREE.Mesh(
      new THREE.BoxGeometry(1.45, 0.92, 1.96),
      new THREE.MeshStandardMaterial({
        color: "#2a4352",
        roughness: 0.2,
        metalness: 0.45,
      }),
    );
    kWindow.position.set(0, 1.56, 0);
    const kRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.92, 0.72, 4),
      mat("#2e5f45", 0.65),
    );
    kRoof.position.y = 2.82;
    kRoof.rotation.y = Math.PI / 4;
    kRoof.castShadow = true;
    kiosk.add(kBase, kBody, kWindow, kRoof);
    g.add(kiosk);
    this.world.cameraObstacles.push(kBody);
    this.obstacles.push({ type: "box", cx: -158.8, cz: 33.4, hw: 1.5, hd: 1.4 });

    // Open Striped Boom Gate Barrier & Upright Blue Parking Signboard
    const barrierPost = box([0.28, 1.05, 0.28], "#d89c28", [-156.2, 0.75, 35.1]);
    const barrierArm = box([0.1, 0.09, 3.6], "#d9322b", [-156.2, 2.65, 35.1]);
    barrierArm.rotation.z = -1.22; // Open upward so players & vehicles pass freely
    const barrierTip = box([0.11, 0.09, 1.1], "#f6f7f9", [-155.3, 3.3, 35.1]);
    barrierTip.rotation.z = -1.22;
    g.add(barrierPost, barrierArm, barrierTip);

    const signBoard = new THREE.Group();
    signBoard.name = "museum-parking-sign";
    signBoard.position.set(-142.8, 0.23, 35.1);
    signBoard.add(
      box([0.12, 2.85, 0.12], "#39424a", [-1.1, 1.425, 0]),
      box([0.12, 2.85, 0.12], "#39424a", [1.1, 1.425, 0]),
    );
    const signTex = createParkingSignTexture();
    const face = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 1.32, 0.1),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
        : mat("#174b8c"),
    );
    face.position.y = 2.45;
    face.castShadow = true;
    signBoard.add(face);
    g.add(signBoard);
    this.obstacles.push({ type: "box", cx: -142.8, cz: 35.1, hw: 1.4, hd: 0.5 });

    // --- ZONE A: KHU ĐỖ Ô TÔ (South side lz: 11.4 .. 17.6, lx: -161.5 .. -137.5) ---
    // Painted white bay dividers for 7 car stalls (3.2m pitch)
    const carBayCount = 7;
    const carStartX = -161.2;
    const carPitch = 3.35;
    for (let i = 0; i <= carBayCount; i++) {
      const bx = carStartX + i * carPitch;
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.14, 5.4),
        stripeMat,
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(bx, 0.245, 14.3);
      g.add(line);
    }
    // Concrete wheel-stop curbs & parked cars in 5 of the 7 car bays
    const carSpecs = [
      { bay: 0, color: "#eceff2", suv: true, yaw: 0.04 },
      { bay: 1, color: "#425263", suv: false, yaw: -0.03 },
      { bay: 3, color: "#cfd5dc", suv: false, yaw: 0.02 },
      { bay: 4, color: "#282e35", suv: true, yaw: -0.05 },
      { bay: 6, color: "#a83333", suv: false, yaw: 0.03 },
    ];
    for (let i = 0; i < carBayCount; i++) {
      const cx = carStartX + (i + 0.5) * carPitch;
      const stop = box([1.95, 0.14, 0.22], "#d5d8dc", [cx, 0.3, 12.1]);
      stop.castShadow = true;
      g.add(stop);
    }
    for (const spec of carSpecs) {
      const cx = carStartX + (spec.bay + 0.5) * carPitch;
      const cz = 14.5;
      const car = createParkedCar(cx, 0.23, cz, spec.yaw, spec.color, spec.suv);
      g.add(car);
      this.obstacles.push({ type: "box", cx, cz, hw: 1.15, hd: 2.35 });
    }

    // Ground painted stencil "P · Ô TÔ" on central driving lane
    const carStencilTex = createGroundStencilTexture("P · Ô TÔ");
    if (carStencilTex) {
      const stencil = new THREE.Mesh(
        new THREE.PlaneGeometry(4.4, 1.65),
        new THREE.MeshStandardMaterial({
          map: carStencilTex,
          roughness: 0.85,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        }),
      );
      stencil.rotation.x = -Math.PI / 2;
      stencil.position.set(-151.0, 0.246, 20.6);
      g.add(stencil);
    }

    // --- ZONE B: KHU ĐỖ XE MÁY CÓ MÁI CHE (East/North-East side lx: -146.5 .. -132.5, lz: 24.5 .. 33.4) ---
    const shed = new THREE.Group();
    shed.name = "museum-motorbike-parking-shed";
    shed.position.set(-139.2, 0.23, 30.8);
    g.add(shed);

    // Concrete platform under motorbike shelter
    const bikePad = box([13.4, 0.06, 5.2], "#b8bcc0", [0, 0.03, 0]);
    bikePad.receiveShadow = true;
    shed.add(bikePad);

    const postMat = mat("#3c464f", 0.45, 0.6);
    for (const px of [-6.2, -2.05, 2.05, 6.2]) {
      for (const pz of [-2.15, 2.15]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.075, 0.085, 2.55, 8),
          postMat,
        );
        post.position.set(px, 1.28, pz);
        post.castShadow = true;
        shed.add(post);
      }
    }
    const bikeRoof = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 0.14, 5.8),
      mat("#265c47", 0.58, 0.18),
    );
    bikeRoof.position.set(0, 2.62, 0);
    bikeRoof.rotation.x = 0.07;
    bikeRoof.castShadow = bikeRoof.receiveShadow = true;
    shed.add(bikeRoof);
    this.world.cameraObstacles.push(bikeRoof);
    this.obstacles.push({ type: "box", cx: -139.2, cz: 30.8, hw: 7.0, hd: 2.8 });

    // Painted motorbike slot stripes & 16 detailed parked motorbikes in 2 tidy rows!
    const bikeColors = [
      "#c42f2f",
      "#274b7a",
      "#2a2e33",
      "#e2e6ea",
      "#1c6b63",
      "#8d3345",
      "#4f5b66",
      "#d4892a",
    ];
    for (let i = 0; i < 10; i++) {
      const bx = -5.4 + i * 1.18;
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.06, 1.95),
        stripeMat,
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(bx, 0.072, -1.15);
      shed.add(line);
      if (i < 9) {
        const bike = createParkedMotorbike(
          bx + 0.58,
          0.06,
          -1.05,
          Math.PI + ((i % 3) - 1) * 0.07,
          bikeColors[i % bikeColors.length],
        );
        shed.add(bike);
      }
    }
    // Second neat row of motorbikes along south half of the shed + open bays
    for (let i = 0; i < 7; i++) {
      const bx = -4.8 + i * 1.35;
      const bike = createParkedMotorbike(
        bx,
        0.06,
        1.15,
        ((i % 3) - 1) * 0.08,
        bikeColors[(i + 3) % bikeColors.length],
      );
      shed.add(bike);
    }

    const bikeStencilTex = createGroundStencilTexture("XE MÁY", "#6b7076");
    if (bikeStencilTex) {
      const bStencil = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 1.4),
        new THREE.MeshStandardMaterial({
          map: bikeStencilTex,
          roughness: 0.85,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        }),
      );
      bStencil.rotation.x = -Math.PI / 2;
      bStencil.position.set(-139.2, 0.246, 26.2);
      g.add(bStencil);
    }
  }

  buildCaySiCafe() {
    const g = new THREE.Group();
    g.name = "cay-si-cafe-precinct";
    this.group.add(g);

    const lawnTex = createManicuredLawnTexture(8, 6, { striped: true, rich: true });
    const lawnMat = new THREE.MeshStandardMaterial({
      color: "#5f9d40",
      map: lawnTex,
      roughness: 0.9,
    });
    const flagstoneMat = new THREE.MeshStandardMaterial({
      color: "#cfc5b4",
      map: createCafeFlagstoneTexture(),
      roughness: 0.84,
    });
    const deckMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: createTimberDeckTexture(),
      roughness: 0.78,
    });

    // 1. Manicured garden turf base covering the Café Cây Si island
    const turfSlab = this._extrudePolygonSlab(
      this.cafePoly,
      0.21,
      lawnMat,
      "cay-si-garden-turf",
    );
    g.add(turfSlab);

    // 2. Warm flagstone & timber terrace patio centered around the Cây Si & Café Pavilion
    const patio = new THREE.Mesh(
      new THREE.BoxGeometry(23.5, 0.14, 18.0),
      flagstoneMat,
    );
    patio.name = "cay-si-cafe-patio";
    patio.position.set(-93.0, 0.21, 10.5);
    patio.receiveShadow = true;
    g.add(patio);

    // Stepped stone entrance walkway linking West edge (facing parking lot & footpath) to patio
    const entryWalk = new THREE.Mesh(
      new THREE.BoxGeometry(11.5, 0.14, 3.6),
      flagstoneMat,
    );
    entryWalk.position.set(-110.2, 0.195, 11.8);
    entryWalk.rotation.y = 0.22;
    entryWalk.receiveShadow = true;
    g.add(entryWalk);

    // East garden walk toward Bia Quốc Học Park
    const eastWalk = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.14, 3.2),
      flagstoneMat,
    );
    eastWalk.position.set(-80.2, 0.195, 8.5);
    eastWalk.receiveShadow = true;
    g.add(eastWalk);

    // 3. ICONIC GIANT CÂY SI (ANCIENT BANYAN TREE) WITH CIRCULAR BRICK PLANTER RING
    const sx = this.caySiPos.lx;
    const sz = this.caySiPos.lz;
    const planterRim = new THREE.Mesh(
      new THREE.CylinderGeometry(3.15, 3.35, 0.42, 24),
      mat("#9c5840", 0.84),
    );
    planterRim.position.set(sx, 0.42, sz);
    planterRim.castShadow = planterRim.receiveShadow = true;
    const planterSoil = new THREE.Mesh(
      new THREE.CylinderGeometry(2.82, 2.82, 0.44, 20),
      mat("#473928", 0.94),
    );
    planterSoil.position.set(sx, 0.43, sz);
    g.add(planterRim, planterSoil);

    const caySiTree = createAncientCaySiTree(sx, 0.48, sz, this.lights);
    g.add(caySiTree);
    this.treeTrunks.push({ lx: sx, lz: sz, r: 3.35 });
    this.world.cameraObstacles.push(caySiTree);
    this.obstacles.push({ type: "circle", cx: sx, cz: sz, r: 3.35 });

    // 4. OPEN-AIR HUẾ GARDEN CAFÉ PAVILION ("CAFÉ CÂY SI")
    const pav = new THREE.Group();
    pav.name = "cay-si-cafe-pavilion";
    pav.position.set(this.pavilionPos.lx, 0.28, this.pavilionPos.lz);
    pav.rotation.y = -0.35; // Angled warmly toward the Cây Si terrace & parking entrance
    g.add(pav);

    // Timber deck floor
    const deck = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.16, 6.6), deckMat);
    deck.position.y = 0.08;
    deck.receiveShadow = true;
    pav.add(deck);

    // Warm cream Huế plaster rear wall & dark ironwood columns
    const backWall = box([9.2, 3.1, 0.36], "#efe5d2", [0, 1.7, -2.9]);
    const sideWall = box([0.36, 3.1, 5.8], "#efe5d2", [4.42, 1.7, -0.1]);
    backWall.castShadow = sideWall.castShadow = true;
    pav.add(backWall, sideWall);
    this.world.cameraObstacles.push(backWall, sideWall);

    for (const px of [-4.4, -1.5, 1.5, 4.4]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.17, 3.25, 10),
        mat("#533722", 0.78),
      );
      col.position.set(px, 1.75, 2.9);
      col.castShadow = true;
      pav.add(col);
    }

    // Two-tier dark terracotta/brown Huế tiled hip roof
    const lowerRoof = new THREE.Mesh(
      new THREE.ConeGeometry(7.2, 1.55, 4),
      mat("#8d3c2b", 0.72),
    );
    lowerRoof.position.set(0, 4.08, 0);
    lowerRoof.rotation.y = Math.PI / 4;
    lowerRoof.scale.set(1.25, 1, 0.92);
    lowerRoof.castShadow = lowerRoof.receiveShadow = true;

    const upperRoof = new THREE.Mesh(
      new THREE.ConeGeometry(3.6, 1.05, 4),
      mat("#7a3223", 0.72),
    );
    upperRoof.position.set(0, 4.98, 0);
    upperRoof.rotation.y = Math.PI / 4;
    upperRoof.scale.set(1.22, 1, 0.88);
    upperRoof.castShadow = true;
    pav.add(lowerRoof, upperRoof);

    // Bar Counter, Espresso Machine & Barista NPC
    const counter = box([5.6, 1.04, 0.82], "#6d482b", [-0.6, 0.68, -0.6]);
    const counterTop = box([5.85, 0.08, 0.96], "#d9ceb9", [-0.6, 1.24, -0.6]);
    const espressoBody = box([0.68, 0.44, 0.42], "#b8bfc5", [-1.6, 1.5, -0.62]);
    const pastryGlass = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 0.48, 0.48),
      new THREE.MeshStandardMaterial({
        color: "#d4edf5",
        roughness: 0.18,
        metalness: 0.35,
        transparent: true,
        opacity: 0.68,
      }),
    );
    pastryGlass.position.set(0.3, 1.52, -0.6);
    pav.add(counter, counterTop, espressoBody, pastryGlass);

    // Barista NPC in olive apron behind counter
    const barista = new THREE.Group();
    barista.position.set(-0.5, 0.16, -1.55);
    barista.add(
      box([0.42, 0.68, 0.26], "#2f573a", [0, 0.86, 0]),
      box([0.14, 0.44, 0.14], "#e5be9e", [-0.28, 0.86, 0]),
      box([0.14, 0.44, 0.14], "#e5be9e", [0.28, 0.86, 0]),
    );
    const bHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 10, 8),
      mat("#f0c9a8", 0.72),
    );
    bHead.position.y = 1.38;
    barista.add(bHead);
    pav.add(barista);

    // Hanging warm rattan pendant lanterns along the café eaves
    for (const lx of [-3.2, -1.1, 1.1, 3.2]) {
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 8),
        new THREE.MeshStandardMaterial({
          color: "#ffe7a8",
          emissive: "#ffb840",
          emissiveIntensity: 0.95,
          roughness: 0.3,
        }),
      );
      lantern.position.set(lx, 2.95, 2.35);
      lantern.userData.phase = lx * 0.7;
      pav.add(lantern);
      this.lights.push(lantern);
    }

    // Prominent Fascia Signboard "CAFÉ CÂY SI"
    const signTex = createCaySiSignTexture();
    const facadeSign = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 1.28, 0.14),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
        : mat("#2b1e14"),
    );
    facadeSign.name = "cay-si-cafe-facade-sign";
    facadeSign.position.set(0, 3.36, 3.15);
    pav.add(facadeSign);

    this.obstacles.push({
      type: "box",
      cx: this.pavilionPos.lx,
      cz: this.pavilionPos.lz,
      hw: 5.0,
      hd: 3.6,
    });

    // 5. Entrance Welcome Sign & Chalk Menu Board at the West Entrance (facing Parking Lot)
    const welcomeBoard = new THREE.Group();
    welcomeBoard.name = "cay-si-welcome-board";
    welcomeBoard.position.set(-111.2, 0.22, 14.8);
    welcomeBoard.rotation.y = -0.62;
    welcomeBoard.add(
      box([0.1, 2.2, 0.1], "#4a3322", [-1.15, 1.1, 0]),
      box([0.1, 2.2, 0.1], "#4a3322", [1.15, 1.1, 0]),
    );
    const wFace = new THREE.Mesh(
      new THREE.BoxGeometry(2.55, 0.95, 0.1),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.5 })
        : mat("#3f5d32"),
    );
    wFace.position.y = 1.82;
    welcomeBoard.add(wFace);
    g.add(welcomeBoard);

    const menuTex = createMenuBoardTexture();
    const menuAFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.95, 1.42, 0.12),
      menuTex
        ? new THREE.MeshStandardMaterial({ map: menuTex, roughness: 0.6 })
        : mat("#232a24"),
    );
    menuAFrame.position.set(-93.8, 0.95, 17.4);
    menuAFrame.rotation.y = -0.35;
    g.add(menuAFrame);

    // 6. Outdoor Garden Café Table Sets, Market Parasols & Patrons beneath Cây Si
    const tableConfigs = [
      [-103.5, 7.2, "#c8b393", true, 1],
      [-103.5, 15.2, "#b55d45", false, 2],
      [-99.5, 17.5, null, true, 3],
      [-98.2, 4.5, "#677d56", true, 4],
      [-93.2, 5.2, null, false, 5],
      [-92.5, 11.2, "#c8b393", true, 6],
      [-87.5, 6.2, "#b55d45", true, 7],
      [-83.0, 4.8, null, false, 8],
      [-82.0, 10.2, "#677d56", true, 9],
      [-107.2, 9.2, "#c8b393", false, 10],
    ];
    for (const [tx, tz, parasol, patron, seed] of tableConfigs) {
      g.add(createCafeTableSet(tx, 0.28, tz, parasol, patron, seed));
      this.obstacles.push({ type: "circle", cx: tx, cz: tz, r: 1.05 });
    }

    // 7. Decorative Stone Lotus Basin & Terracotta Planters
    const lotusBasin = new THREE.Group();
    lotusBasin.position.set(-101.8, 0.28, 11.8);
    lotusBasin.add(
      new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 0.95, 0.44, 16),
        mat("#7c7a72", 0.85),
      ),
    );
    const waterDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.98, 0.98, 0.06, 16),
      mat("#2a6f7d", 0.2, 0.35),
    );
    waterDisc.position.y = 0.21;
    lotusBasin.add(waterDisc);
    for (const [lx, lz] of [
      [-0.3, -0.2],
      [0.32, 0.18],
      [0.05, -0.35],
    ]) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.03, 10),
        mat("#427b35", 0.72),
      );
      pad.position.set(lx, 0.26, lz);
      lotusBasin.add(pad);
    }
    g.add(lotusBasin);
    this.obstacles.push({ type: "circle", cx: -101.8, cz: 11.8, r: 1.35 });
  }

  buildFlamboyantGrove() {
    const g = new THREE.Group();
    g.name = "hue-flamboyant-grove";
    this.group.add(g);

    // 24 Large Red-Blossoming Flamboyant Trees (Cây Phượng Vĩ lớn)
    // Carefully verified to clear every carriageway (>=2.6m) & footway (>=1.0m)
    const treeSpecs = [
      // Shading the Parking Lot perimeter (right next to Bảo tàng Hồ Chí Minh)
      [-165.0, 29.0, 1.24],
      [-163.0, 14.0, 1.3],
      [-150.0, 8.5, 1.34],
      [-134.0, 8.5, 1.28],
      [-126.0, 26.0, 1.32],
      [-121.0, 33.0, 1.22],
      [-140.0, 34.8, 1.18],
      // Framing Quán Café Cây Si
      [-115.0, 7.0, 1.26],
      [-108.0, 17.5, 1.22],
      [-95.0, 24.0, 1.35],
      [-79.0, 23.0, 1.28],
      [-79.0, 2.0, 1.3],
      [-96.0, -3.0, 1.25],
      // Mid-park shade belt between Parking Lot and Perfume River
      [-155.0, -3.0, 1.32],
      [-143.0, -5.0, 1.28],
      [-131.0, -8.0, 1.24],
      // Riverside Flamboyant Grove toward Perfume River & Bia Quốc Học
      [-123.0, -24.0, 1.38],
      [-108.0, -26.0, 1.42],
      [-92.0, -24.0, 1.34],
      [-80.0, -28.0, 1.3],
      [-126.0, -40.0, 1.44],
      [-110.0, -43.0, 1.36],
      [-93.0, -41.0, 1.4],
      [-80.0, -45.0, 1.32],
    ];

    treeSpecs.forEach(([lx, lz, sc], idx) => {
      const wp = this.toWorld(lx, lz);
      const baseY = this.inParcel(wp.x, wp.z) ? 0.22 : 0.08;
      const tree = createLargeFlamboyantTree(lx, baseY, lz, sc, idx + 1);
      g.add(tree);
      this.treeTrunks.push({ lx, lz, r: 0.9 * sc });
    });

    // A couple of park benches under the riverside phượng trees
    for (const [bx, bz, yaw] of [
      [-116.0, -22.5, Math.PI],
      [-87.0, -22.5, Math.PI],
    ]) {
      g.add(createParkBench(bx, 0.08, bz, yaw));
    }
  }

  groundAt(wx, wz, referenceY) {
    if (Number.isFinite(referenceY) && referenceY > 2.2) return null;
    const { lx, lz } = this.toLocal(wx, wz);

    // Entry driveway apron smoothly sloping down to Lê Lợi footway
    if (lx >= -157.5 && lx <= -143.5 && lz > 35.6 && lz <= 37.9) {
      const t = (37.9 - lz) / 2.3;
      return 0.14 + t * 0.09;
    }

    if (inside({ x: lx, z: lz }, this.parkingPoly)) {
      if (
        lx >= -146.2 &&
        lx <= -132.2 &&
        lz >= 28.1 &&
        lz <= 33.5
      ) {
        return 0.29; // Raised motorbike shelter concrete pad
      }
      return 0.23;
    }

    if (inside({ x: lx, z: lz }, this.cafePoly)) {
      // Cafe pavilion wooden deck
      const dx = lx - this.pavilionPos.lx;
      const dz = lz - this.pavilionPos.lz;
      const rx = dx * Math.cos(0.35) - dz * Math.sin(0.35);
      const rz = dx * Math.sin(0.35) + dz * Math.cos(0.35);
      if (Math.abs(rx) <= 4.8 && Math.abs(rz) <= 3.3) {
        return 0.36;
      }
      // Flagstone café courtyard & entry walk
      if (lx >= -104.8 && lx <= -81.2 && lz >= 1.5 && lz <= 19.5) {
        return 0.28;
      }
      return 0.22;
    }

    return null;
  }

  canRide(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);

    // Prevent riding directly into solid tree trunks of the flamboyant grove & Cây Si
    for (const t of this.treeTrunks) {
      if (Math.hypot(lx - t.lx, lz - t.lz) < t.r) return false;
    }

    const inParking = this.inParkingLot(wx, wz);
    const inCafe = this.inCafeParcel(wx, wz);
    if (!inParking && !inCafe) return null;

    for (const obs of this.obstacles) {
      if (obs.type === "circle") {
        if (Math.hypot(lx - obs.cx, lz - obs.cz) < obs.r) return false;
      } else if (obs.type === "box") {
        if (Math.abs(lx - obs.cx) < obs.hw && Math.abs(lz - obs.cz) < obs.hd) {
          return false;
        }
      }
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inParcel(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inParcel(wx, wz)) return true;
    const { lx, lz } = this.toLocal(wx, wz);
    for (const t of this.treeTrunks) {
      if (Math.hypot(lx - t.lx, lz - t.lz) < 4.5) return true;
    }
    // Keep parking entrance clear of random OSM trees
    if (lx >= -160 && lx <= -140 && lz >= 33 && lz <= 42) return true;
    return false;
  }

  update(time = 0) {
    for (const light of this.lights) {
      const phase = light.userData.phase || 0;
      light.material.emissiveIntensity =
        0.72 + Math.sin(time * 2.1 + phase) * 0.24;
    }
  }
}
