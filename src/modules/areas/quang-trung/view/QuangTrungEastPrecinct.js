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
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#c7c5bf";
      ctx.fillRect(0, 0, w, h);
      const step = 32;
      const tones = ["#d9d7d0", "#d1cfc8", "#e0ded8", "#cccac2"];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          ctx.fillStyle = tones[((x / step) * 3 + (y / step) * 5) % tones.length];
          ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
        }
      }
    },
    18,
    12,
  );
}

function createParkLawnTex() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#629b3e";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle =
          i % 3 === 0
            ? "rgba(130, 184, 74, 0.28)"
            : i % 3 === 1
              ? "rgba(68, 122, 42, 0.24)"
              : "rgba(155, 202, 92, 0.16)";
        ctx.fillRect((i * 193) % w, (i * 317) % h, 8, 6);
      }
    },
    4,
    3,
  );
}

function createParkSignTex() {
  return createCanvasTex(768, 192, (ctx, w, h) => {
    ctx.fillStyle = "#1c5e3a";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f2e6bc";
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff9e6";
    ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("CÔNG VIÊN DỰ ÁN", w / 2, h * 0.39, w - 50);
    ctx.fillStyle = "#cbead3";
    ctx.font = "600 28px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("ĐỐI DIỆN DÒNG CHÚA CỨU THẾ · TP. HUẾ", w / 2, h * 0.74, w - 50);
  });
}

function createParkTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.4;
  const trunkH = 2.6 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.22 * scale, trunkH, 8),
    mat("#63513f", 0.9),
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  const greens = ["#467d34", "#558f3d", "#67a148"];
  [
    [0, trunkH + 1.35 * scale, 0, 1.55 * scale],
    [0.85 * scale, trunkH + 0.9 * scale, 0.55 * scale, 1.15 * scale],
    [-0.8 * scale, trunkH + 0.95 * scale, -0.5 * scale, 1.18 * scale],
  ].forEach(([cx, cy, cz, r], i) => {
    const crown = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[(i + seed) % greens.length], 0.86),
    );
    crown.scale.set(1.18, 0.82, 1.14);
    crown.position.set(cx, cy, cz);
    crown.castShadow = crown.receiveShadow = true;
    g.add(crown);
  });
  return g;
}

function createPalmTree(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.24 * scale, 4.2 * scale, 8),
    mat("#735e4a", 0.9),
  );
  trunk.position.y = 2.1 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  const frondMat = mat("#3b762d", 0.82);
  for (let i = 0; i < 7; i++) {
    const a = (i * Math.PI * 2) / 7;
    const frond = new THREE.Mesh(
      new THREE.BoxGeometry(0.45 * scale, 0.08 * scale, 2.2 * scale),
      frondMat,
    );
    frond.position.set(
      Math.sin(a) * 0.95 * scale,
      4.15 * scale,
      Math.cos(a) * 0.95 * scale,
    );
    frond.rotation.y = a;
    frond.rotation.x = 0.28;
    frond.castShadow = true;
    g.add(frond);
  }
  return g;
}

function createSquareTreeWell(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.add(
    box([1.85, 0.16, 1.85], "#eceae4", [0, 0.08, 0]),
    box([1.52, 0.12, 1.52], "#4c3b2c", [0, 0.12, 0]),
  );
  g.add(createParkTree(0, 0.14, 0, scale, seed));
  return g;
}

function createWhiteBlossomShrubStrip(w, d, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.28, d), mat("#3d752e", 0.9));
  bed.position.y = 0.14;
  bed.castShadow = bed.receiveShadow = true;
  g.add(bed);

  const count = Math.max(3, Math.floor((w * d) / 1.4));
  const bloomMat = mat("#f6f7f2", 0.7);
  for (let i = 0; i < count; i++) {
    const bx = (((i * 73) % 100) / 100 - 0.5) * (w - 0.35);
    const bz = (((i * 41) % 100) / 100 - 0.5) * (d - 0.35);
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), bloomMat);
    bloom.position.set(bx, 0.31, bz);
    g.add(bloom);
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
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  g.add(
    box([1.85, 0.12, 0.58], "#d4d2cc", [0, 0.42, 0]),
    box([0.22, 0.38, 0.5], "#b9b7b0", [-0.7, 0.19, 0]),
    box([0.22, 0.38, 0.5], "#b9b7b0", [0.7, 0.19, 0]),
  );
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

    // 3) Large Central Oval Emerald Lawn (shifted slightly left-center: ovalX = -15.0 -> side = 153.0, fwd = 33.5)
    const ovalX = -15.0;
    const ovalZ = -0.75; // fwd = 33.5
    const lawnTex = createParkLawnTex();
    const ovalGeo = new THREE.CylinderGeometry(20.5, 20.5, 0.08, 48);
    ovalGeo.scale(1.12, 1, 0.84);
    const ovalLawn = new THREE.Mesh(
      ovalGeo,
      new THREE.MeshStandardMaterial({
        color: lawnTex ? "#ffffff" : "#629b3e",
        map: lawnTex,
        roughness: 0.92,
      }),
    );
    ovalLawn.position.set(ovalX, 0.29, ovalZ);
    ovalLawn.receiveShadow = true;
    park.add(ovalLawn);

    // Crisp white concrete oval perimeter ring curb bordering the grass & stone promenade
    const curbGeo = new THREE.TorusGeometry(20.65, 0.16, 8, 56);
    curbGeo.rotateX(Math.PI / 2);
    curbGeo.scale(1.12, 1, 0.84);
    const ovalCurb = new THREE.Mesh(curbGeo, mat("#edeae2", 0.78));
    ovalCurb.position.set(ovalX, 0.31, ovalZ);
    park.add(ovalCurb);

    // White concrete outer ring footpath ring around oval (lighter stone border)
    const ringGeo = new THREE.RingGeometry(21.0, 24.4, 52);
    ringGeo.rotateX(-Math.PI / 2);
    ringGeo.scale(1.12, 1, 0.84);
    const ringPath = new THREE.Mesh(ringGeo, mat("#e2dfd8", 0.84));
    ringPath.position.set(ovalX, 0.284, ovalZ);
    ringPath.receiveShadow = true;
    park.add(ringPath);

    // Picnic mat & seated visitors relaxing in the middle of the central oval grass (image_6212c3e8.png)
    const picnicGroup = new THREE.Group();
    picnicGroup.name = "cong-vien-picnic-group";
    picnicGroup.position.set(ovalX - 5.2, 0.33, ovalZ + 1.5);
    const matBlanket = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.02, 2.2),
      mat("#f2ede3", 0.9),
    );
    picnicGroup.add(matBlanket);
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
    this.obstacles.push({ side: midS + ovalX - 5.2, fwd: midF - (ovalZ + 1.5), radius: 1.9 });

    // 4) Iconic Warm-Timber + Royal-Blue Pitched-Roof Restroom / Kiosk Pavilion (image_6212c3e8.png upper-right)
    const pavX = 24.5;
    const pavZ = -20.5; // fwd = 53.25
    const pav = new THREE.Group();
    pav.name = "cong-vien-nha-ve-sinh";
    pav.position.set(pavX, 0.28, pavZ);

    const pavBody = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 3.3, 5.2),
      mat("#c98842", 0.72), // warm golden-oak timber cladding
    );
    pavBody.position.y = 1.65;
    pavBody.castShadow = pavBody.receiveShadow = true;
    pav.add(pavBody);
    this.world.cameraObstacles.push(pavBody);

    // Recessed dark doorway alcove & stone concrete plinth
    pav.add(
      box([10.1, 0.18, 5.7], "#dad6ce", [0, 0.09, 0]),
      box([4.2, 2.35, 0.35], "#272320", [0, 1.25, 2.52]),
      box([2.2, 2.25, 0.08], "#7c5838", [0, 1.2, 2.54]),
    );

    // Royal cobalt-blue pitched hip roof with overhanging white eaves
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

    // 2 chatting visitors in front of pavilion entrance + flanking white-blossom planters
    const pavVisitorA = createParkVisitor({ shirt: "#ece7dc", pants: "#28303b" });
    pavVisitorA.position.set(-0.6, 0.16, 3.2);
    pavVisitorA.rotation.y = 0.5;
    const pavVisitorB = createParkVisitor({ shirt: "#314254", pants: "#1f2328" });
    pavVisitorB.position.set(0.55, 0.16, 3.35);
    pavVisitorB.rotation.y = -0.5;
    pav.add(pavVisitorA, pavVisitorB);
    pav.add(createWhiteBlossomShrubStrip(5.6, 1.8, -5.0, 0.02, 2.8));
    pav.add(createWhiteBlossomShrubStrip(8.0, 1.8, 7.0, 0.02, 2.8));

    park.add(pav);
    this.buildingPolygons.push(this.rectPoly(midS + pavX - 5.1, midS + pavX + 5.1, midF - pavZ - 2.9, midF - pavZ + 2.9));
    this.obstacles.push({ side: midS + pavX, fwd: midF - pavZ, radius: 4.5 });

    // 5) White-blossom shrub borders lining oval ring & perimeter paths
    for (const [sx, sz, sw, sd] of [
      [ovalX - 19.0, ovalZ + 12.0, 6.8, 1.5],
      [ovalX - 7.5, ovalZ + 17.5, 9.5, 1.5],
      [ovalX + 8.5, ovalZ + 16.5, 8.5, 1.5],
      [ovalX - 18.0, ovalZ - 14.0, 7.5, 1.5],
      [ovalX + 12.0, ovalZ - 15.0, 7.5, 1.5],
      [ovalX - 24.5, ovalZ - 2.0, 1.6, 9.0],
      [-8.0, d / 2 - 4.2, 24.0, 2.0],
      [-26.0, -d / 2 + 3.5, 18.0, 2.2],
      [8.0, -d / 2 + 3.5, 18.0, 2.2],
    ]) {
      park.add(createWhiteBlossomShrubStrip(sw, sd, sx, 0.28, sz));
    }

    // 6) Square white-curbed tree-wells & perimeter park groves (image_6212c3e8.png)
    const treeWells = [
      // Foreground avenue along Nguyễn Huệ
      [-48.0, 18.5], [-43.0, 9.5], [-21.0, 27.5], [-13.5, 27.5], [-6.0, 27.5], [2.5, 27.5],
      // Framing left diagonal & west border
      [-43.5, -5.0], [-42.5, -18.0], [-36.0, -25.0], [-24.0, -26.5],
      // North arc behind oval lawn
      [-10.0, -26.5], [4.0, -26.5], [14.0, -22.5],
      // Tree row dividing oval promenade & right plaza corridor
      [15.0, 19.0], [16.5, 9.0], [16.5, -2.0], [16.5, -13.0],
      // Eastern green belt framing right edge
      [48.0, 18.0], [48.5, 8.0], [48.5, -2.0], [48.5, -12.0], [48.5, -22.0], [38.0, -25.5],
    ];
    treeWells.forEach(([tx, tz], idx) => {
      park.add(createSquareTreeWell(tx, 0.28, tz, 0.96 + (idx % 3) * 0.08, idx + 1));
      this.obstacles.push({ side: midS + tx, fwd: midF - tz, radius: 1.2 });
    });

    // 3 Tropical Palms in SE corner (matching bottom-right corner of image_6212c3e8.png)
    for (const [px, pz, s] of [
      [39.0, 27.5, 0.98],
      [43.8, 28.0, 1.04],
      [48.5, 27.2, 0.94],
    ]) {
      park.add(createPalmTree(px, 0.28, pz, s));
      this.obstacles.push({ side: midS + px, fwd: midF - pz, radius: 0.95 });
    }

    // 7) Straight granite benches along front walk & curved north amphitheater bench
    for (const [bx, bz, yaw] of [
      [-18.0, 25.0, 0],
      [-10.0, 25.0, 0],
      [-2.0, 25.0, 0],
      [6.0, 25.0, 0],
      [-37.5, -6.5, Math.PI * 0.3],
      [5.5, -17.5, -Math.PI * 0.72],
    ]) {
      park.add(createParkBench(bx, 0.28, bz, yaw));
      this.obstacles.push({ side: midS + bx, fwd: midF - bz, radius: 0.95 });
    }
    // Curved rear-north stone bench overlooking central oval (as in top-left of reference image)
    for (let i = -3; i <= 3; i++) {
      const angle = i * 0.22;
      const cx = ovalX - 8.5 + Math.sin(angle) * 5.2;
      const cz = ovalZ - 20.5 - Math.cos(angle) * 2.2;
      park.add(createParkBench(cx, 0.28, cz, angle));
    }

    // 8) Modern park lights lining circular & corridor walks
    for (const [lx, lz] of [
      [-34.0, 15.0],
      [-34.0, -14.0],
      [-16.0, -23.5],
      [4.5, -18.5],
      [12.0, 14.0],
      [15.0, 2.0],
      [25.5, 16.0],
    ]) {
      park.add(createParkLamp(lx, 0.28, lz));
      this.obstacles.push({ side: midS + lx, fwd: midF - lz, radius: 0.45 });
    }

    // 9) Entrance Park Signboard facing Nguyễn Huệ & Dòng Chúa Cứu Thế
    const parkSignTex = createParkSignTex();
    const signGroup = new THREE.Group();
    signGroup.name = "cong-vien-du-an-sign";
    signGroup.position.set(16.0, 0.28, d / 2 - 1.2);
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
    this.obstacles.push({ side: midS + 16.0, fwd: minF + 1.2, radius: 1.5 });

    // 10) Strolling visitor couples along the circular & corridor walkways
    const paths = [
      { cx: ovalX, cz: ovalZ, rx: 22.8, rz: 17.8, speed: 0.14, phase: 0.2, shirtA: "#eef2f6", shirtB: "#424a52" },
      { cx: ovalX, cz: ovalZ, rx: 23.4, rz: 18.2, speed: -0.12, phase: 2.1, shirtA: "#c96472", shirtB: "#34495e" },
      { cx: ovalX, cz: ovalZ, rx: 22.4, rz: 17.4, speed: 0.11, phase: 4.0, shirtA: "#4a7856", shirtB: "#f2ead8" },
      { cx: 34.0, cz: 4.0, rx: 4.5, rz: 16.0, speed: 0.18, phase: 1.1, shirtA: "#2f5d8a", shirtB: "#d49b42" },
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
        "Công viên cây xanh mới xây dựng đối diện và chạy song song với khuôn viên Nhà thờ Dòng Chúa Cứu Thế, nổi bật với bãi cỏ bầu dục trung tâm, đường dạo đá xám và nhà dịch vụ mái ngói xanh.",
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
  }
}
