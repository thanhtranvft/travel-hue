import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnMaterial } from "../../../../core/world/turfTextures.js";
import { createSeatedCafePatron } from "../../quang-trung/view/QuangTrungCafes.js";
import { CampusStudents } from "../../../../core/world/CampusStudents.js";

// Đống Đa reference coordinate system anchored at Ngã 4 Đống Đa × Lý Thường Kiệt
export const DONG_DA_ORIGIN = { x: 1442.8, z: -396.3 };
export const DONG_DA_FWD = { x: 0.7357, z: -0.6773 };
export const DONG_DA_RIGHT = { x: 0.6773, z: 0.7357 };
export const DONG_DA_ROAD_YAW = Math.atan2(DONG_DA_FWD.x, DONG_DA_FWD.z);
export const DONG_DA_LEFT_FACING_YAW = Math.atan2(DONG_DA_RIGHT.x, DONG_DA_RIGHT.z);
export const DONG_DA_RIGHT_FACING_YAW = DONG_DA_LEFT_FACING_YAW + Math.PI;

// Raised median geometry spans (right ∈ [-8.85, -4.25]) leaving ONLY 2 mid-corridor crossings:
// 1) Opposite Trường THCS Nguyễn Chí Diểu (fwd ∈ [117.5, 133.5])
// 2) Opposite Trường THPT Cao Thắng / Cổng phụ sau ĐH Khoa học (fwd ∈ [188.5, 204.5])
export const DONG_DA_MEDIAN_SEGMENTS = [
  { id: "median-seg-1", minFwd: 31.5, maxFwd: 117.5 },
  { id: "median-seg-2", minFwd: 133.5, maxFwd: 188.5 },
  { id: "median-seg-3", minFwd: 204.5, maxFwd: 281.0 },
  { id: "median-seg-4", minFwd: 304.0, maxFwd: 455.0 },
];

export const DONG_DA_MEDIAN_OPENINGS = [
  { id: "opening-nguyen-chi-dieu", centerFwd: 125.5, minFwd: 117.5, maxFwd: 133.5 },
  { id: "opening-dhkh-secondary", centerFwd: 196.5, minFwd: 188.5, maxFwd: 204.5 },
];

export const DONG_DA_MEDIAN_MIN_RIGHT = -8.85;
export const DONG_DA_MEDIAN_MAX_RIGHT = -4.25;

// OSM generic building IDs replaced by bespoke architectural landmarks on Đống Đa
export const DONG_DA_CUSTOM_BUILDING_IDS = new Set([
  732304132,
  118541373,
  732309911,
  732309912,
  732309982,
  732309983,
  732309984,
  732309985,
  732309986,
  732309987,
  732309988,
  732309989,
  732309990,
  1435252857,
]);

export function dongDaToWorld(fwd, right) {
  return {
    x: DONG_DA_ORIGIN.x + fwd * DONG_DA_FWD.x + right * DONG_DA_RIGHT.x,
    z: DONG_DA_ORIGIN.z + fwd * DONG_DA_FWD.z + right * DONG_DA_RIGHT.z,
  };
}

export function dongDaToLocal(wx, wz) {
  const dx = wx - DONG_DA_ORIGIN.x;
  const dz = wz - DONG_DA_ORIGIN.z;
  return {
    fwd: dx * DONG_DA_FWD.x + dz * DONG_DA_FWD.z,
    right: dx * DONG_DA_RIGHT.x + dz * DONG_DA_RIGHT.z,
  };
}

function createCanvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function createSignMesh(title, subtitle, width, height, {
  bg = "#1e3a5f",
  border = "#e8ca85",
  titleColor = "#ffffff",
  subColor = "#f3d88e",
  emissive = null,
} = {}) {
  const tex = createCanvasTex(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = titleColor;
    ctx.font = "bold 62px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(title, w / 2, subtitle ? h * 0.4 : h * 0.5, w - 56);
    if (subtitle) {
      ctx.fillStyle = subColor;
      ctx.font = "600 30px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(subtitle, w / 2, h * 0.76, w - 56);
    }
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: tex ? "#ffffff" : bg,
      map: tex,
      emissive: emissive || "#000000",
      emissiveIntensity: emissive ? 0.35 : 0,
      roughness: 0.46,
      side: THREE.DoubleSide,
    }),
  );
}

function createCantileverTrafficSignal({ x, z, lookAtX, lookAtZ, phaseGroup = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, 0.17, z);
  g.rotation.y = Math.atan2(lookAtX - x, lookAtZ - z);

  const poleMat = mat("#2a3238", 0.42, 0.65);
  const darkBoxMat = mat("#1a1e22", 0.55, 0.35);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.42, 10),
    mat("#8e918c", 0.86),
  );
  plinth.position.y = 0.21;
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.15, 5.8, 10),
    poleMat,
  );
  mast.position.y = 2.95;
  mast.castShadow = true;

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.09, 4.1, 8),
    poleMat,
  );
  arm.rotation.x = Math.PI / 2;
  arm.position.set(0, 5.45, 2.05);
  arm.castShadow = true;

  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.28), poleMat);
  collar.position.set(0, 5.45, 0);
  g.add(plinth, mast, arm, collar);

  const heads = [];
  const makeHead = (hx, hy, hz, yaw) => {
    const head = new THREE.Group();
    head.position.set(hx, hy, hz);
    head.rotation.y = yaw;
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.18, 0.34), darkBoxMat);
    head.add(housing);
    const lamps = [];
    for (let i = 0; i < 3; i++) {
      const m = new THREE.MeshBasicMaterial({
        color: ["#be342c", "#d9a734", "#28c264"][i],
      });
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.125, 12), m);
      lens.position.set(0, 0.36 - i * 0.36, 0.18);
      head.add(lens);
      lamps.push(m);
    }
    heads.push(lamps);
    g.add(head);
  };

  makeHead(0, 4.95, 3.65, Math.PI);
  makeHead(0, 4.95, 2.35, 0);
  makeHead(0, 3.15, 0.22, Math.PI);
  return { group: g, phaseGroup, heads };
}

function createArchFacadeTexture({
  wall = "#f4ede0",
  plinth = "#b6afa2",
  casing = "#ffffff",
  glass = "#2a4152",
  cols = 4,
  rows = 3,
} = {}) {
  return createCanvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = plinth;
    ctx.fillRect(0, h - 38, w, 38);
    ctx.fillStyle = casing;
    ctx.fillRect(0, 0, w, 14);

    const colW = w / cols;
    const rowH = (h - 54) / rows;
    for (let r = 0; r < rows; r++) {
      const ry = 22 + r * rowH;
      ctx.fillStyle = "#ded4c0";
      ctx.fillRect(0, ry + rowH - 12, w, 8);
      for (let c = 0; c < cols; c++) {
        const cx = c * colW + colW * 0.2;
        const winW = colW * 0.6;
        const winH = rowH * 0.72;
        ctx.fillStyle = casing;
        ctx.fillRect(cx - 5, ry + 6, winW + 10, winH + 10);
        if (ctx.beginPath && ctx.arc) {
          ctx.beginPath();
          ctx.arc(cx + winW / 2, ry + 6 + winW / 2, winW / 2 + 5, Math.PI, 0);
          ctx.fill();
        }
        ctx.fillStyle = glass;
        ctx.fillRect(cx, ry + 12, winW, winH);
        if (ctx.beginPath && ctx.arc) {
          ctx.beginPath();
          ctx.arc(cx + winW / 2, ry + 12 + winW / 2, winW / 2, Math.PI, 0);
          ctx.fill();
        }
        ctx.fillStyle = casing;
        ctx.fillRect(cx + winW / 2 - 2, ry + 8, 4, winH);
        ctx.fillRect(cx, ry + winH * 0.45, winW, 4);
      }
    }
  });
}

function createParkedCar(bodyColor = "#e8ecef", style = "sedan") {
  const car = new THREE.Group();
  const isSuv = style === "suv";
  const isHatch = style === "hatch";
  const len = isHatch ? 3.7 : isSuv ? 4.35 : 4.45;
  const width = isHatch ? 1.68 : 1.82;
  const bodyH = isSuv ? 0.88 : 0.72;
  const cabinH = isSuv ? 0.68 : 0.56;
  const cabinLen = isHatch ? len * 0.64 : isSuv ? len * 0.6 : len * 0.52;

  const paintMat = mat(bodyColor, 0.28, 0.45);
  const darkTrim = mat("#23282d", 0.68, 0.2);
  const glassMat = mat("#243949", 0.14, 0.72);
  const rimMat = mat("#cfd6dc", 0.25, 0.8);
  const tireMat = mat("#1d2024", 0.85, 0.05);

  // Lower chassis + wheel well skirt
  const lower = new THREE.Mesh(
    new THREE.BoxGeometry(width, bodyH, len),
    paintMat,
  );
  lower.position.y = 0.28 + bodyH / 2;
  lower.castShadow = lower.receiveShadow = true;
  car.add(lower);

  // Front & rear black bumper strips
  car.add(
    box([width * 0.98, 0.18, 0.12], "#25292e", [0, 0.34, len / 2 + 0.02]),
    box([width * 0.98, 0.18, 0.12], "#25292e", [0, 0.34, -len / 2 - 0.02]),
  );

  // Cabin greenhouse
  const cabinZ = isHatch ? -0.22 : -0.18;
  const cabin = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.86, cabinH, cabinLen),
    paintMat,
  );
  cabin.position.set(0, 0.28 + bodyH + cabinH / 2 - 0.03, cabinZ);
  cabin.castShadow = true;
  car.add(cabin);

  // Windshield + rear + side windows
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.88, cabinH * 0.74, cabinLen * 0.94),
    glassMat,
  );
  glass.position.set(0, 0.28 + bodyH + cabinH * 0.45, cabinZ);
  car.add(glass);

  // Side mirrors
  for (const sx of [-1, 1]) {
    car.add(box([0.16, 0.1, 0.18], bodyColor, [sx * (width / 2 + 0.06), 0.28 + bodyH + 0.04, cabinZ + cabinLen * 0.25]));
  }

  // Headlights & taillights
  for (const sx of [-width * 0.34, width * 0.34]) {
    car.add(
      box([0.3, 0.14, 0.05], "#fff5cf", [sx, 0.62, len / 2 + 0.02]),
      box([0.32, 0.14, 0.05], "#c92b28", [sx, 0.64, -len / 2 - 0.02]),
    );
  }

  // 4 grounded wheels with rims
  const wheelZ = len * 0.31;
  const wheelR = isSuv ? 0.34 : 0.3;
  for (const wx of [-width * 0.46, width * 0.46]) {
    for (const wz of [-wheelZ, wheelZ]) {
      const tire = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelR, wheelR, 0.22, 14),
        tireMat,
      );
      tire.rotation.z = Math.PI / 2;
      tire.position.set(wx, wheelR, wz);
      const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(wheelR * 0.58, wheelR * 0.58, 0.235, 10),
        rimMat,
      );
      rim.rotation.z = Math.PI / 2;
      rim.position.set(wx, wheelR, wz);
      car.add(tire, rim);
    }
  }

  return car;
}

function createShadeTree(x, y, z, scale = 1, seed = 1, withStakes = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkH = 2.9 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15 * scale, 0.25 * scale, trunkH, 7),
    mat("#64513d", 0.9),
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);

  if (withStakes) {
    const stakeMat = mat("#7b6245", 0.9);
    for (const a of [0.4, 2.5, 4.6]) {
      const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.3, 5), stakeMat);
      stake.position.set(Math.cos(a) * 0.38, 1.0, Math.sin(a) * 0.38);
      stake.rotation.z = Math.cos(a) * 0.24;
      stake.rotation.x = -Math.sin(a) * 0.24;
      g.add(stake);
    }
  }

  const greens = ["#346b2c", "#437f38", "#559444"];
  for (const [cx, cy, cz, r, sy, gi] of [
    [0, trunkH + 1.65 * scale, 0, 1.85 * scale, 0.64, 0],
    [1.15 * scale, trunkH + 1.25 * scale, 0.7 * scale, 1.35 * scale, 0.6, 1],
    [-1.1 * scale, trunkH + 1.3 * scale, -0.6 * scale, 1.38 * scale, 0.62, 2],
  ]) {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[gi], 0.85),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.18, sy, 1.15);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  }
  return g;
}

function createStreetLamp(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const poleMat = mat("#2e3a38", 0.45, 0.65);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.11, 5.4, 8), poleMat);
  pole.position.y = 2.7;
  pole.castShadow = true;
  g.add(pole);
  for (const dir of [-1, 1]) {
    g.add(
      box([0.08, 0.08, 1.15], "#2e3a38", [0, 5.25, dir * 0.55]),
      box([0.24, 0.09, 0.48], "#fff4cf", [0, 5.18, dir * 1.05]),
    );
  }
  return g;
}

export class DongDaCorridor {
  constructor(world) {
    this.world = world;
    this.group = new THREE.Group();
    this.group.name = "dong-da-corridor";
    this.animated = [];
    this.signalControllers = [];
    this.blockingRects = [];
    this.wallSegments = [];
    this.universityCourtyardRects = [];
    this.parkingApronRect = null;

    this.buildNga4SignalsAndCrosswalks();
    this.buildWideMedian();
    this.buildFestivalHotel();
    this.buildFestivalCafe();
    this.buildMienLuongShop();
    this.buildGahiCafe();
    this.buildUniversityRearCampus();
    this.buildParkingBay40DongDa();

    world.scene.add(this.group);
  }

  addBlockingBox(minFwd, maxFwd, minRight, maxRight) {
    this.blockingRects.push({ minFwd, maxFwd, minRight, maxRight });
  }

  buildNga4SignalsAndCrosswalks() {
    const holder = new THREE.Group();
    holder.name = "nga4-dong-da-ly-thuong-kiet";

    // Zebra crosswalks on all 4 arms of Ngã 4 + both mid-corridor median crossings
    const zebraMat = new THREE.MeshStandardMaterial({
      color: "#f4f2eb",
      roughness: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const stripes = [];
    const addCrosswalk = (centerFwd, centerRight, spanWidth, yawOffset = 0, stripeCount = 6) => {
      const p = dongDaToWorld(centerFwd, centerRight);
      const yaw = DONG_DA_ROAD_YAW + yawOffset;
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);
      for (let i = 0; i < stripeCount; i++) {
        const lat = -spanWidth * 0.42 + (i / (stripeCount - 1)) * spanWidth * 0.84;
        const g = new THREE.BoxGeometry(0.54, 0.02, 2.75);
        g.rotateY(yaw);
        g.translate(p.x + cos * lat, 0.245, p.z - sin * lat);
        stripes.push(g);
      }
    };

    // Ngã 4 Đống Đa - Lý Thường Kiệt 4 arms
    addCrosswalk(28.3, 0.0, 6.8, 0, 6);
    addCrosswalk(28.5, -13.1, 6.8, 0, 6);
    addCrosswalk(-22.0, -0.4, 6.8, 0, 6);
    addCrosswalk(-22.1, -13.1, 6.8, 0, 6);
    addCrosswalk(0.0, 8.2, 8.5, Math.PI / 2, 7);
    addCrosswalk(11.5, -20.8, 8.5, Math.PI / 2, 7);

    // Mid-corridor median crossings (only 2 openings along Đống Đa!)
    for (const op of DONG_DA_MEDIAN_OPENINGS) {
      addCrosswalk(op.centerFwd, 0.0, 6.6, 0, 6);
      addCrosswalk(op.centerFwd, -6.55, 4.2, 0, 4);
      addCrosswalk(op.centerFwd, -13.1, 6.6, 0, 6);
    }

    const stripesMesh = new THREE.Mesh(mergeGeometries(stripes), zebraMat);
    stripes.forEach((s) => s.dispose());
    stripesMesh.receiveShadow = true;
    holder.add(stripesMesh);

    // 4-corner animated traffic signal poles at Ngã 4 Đống Đa – Lý Thường Kiệt
    const center = dongDaToWorld(3.0, -6.5);
    const signalSpecs = [
      { id: "dd-ltk-sig-festival", fwd: 27.5, right: -18.5, phaseGroup: 0 },
      { id: "dd-ltk-sig-mienluon", fwd: 19.5, right: 6.0, phaseGroup: 0 },
      { id: "dd-ltk-sig-sw", fwd: -15.5, right: -18.8, phaseGroup: 1 },
      { id: "dd-ltk-sig-nw", fwd: -18.5, right: 6.0, phaseGroup: 1 },
    ];
    for (const sp of signalSpecs) {
      const pos = dongDaToWorld(sp.fwd, sp.right);
      const sig = createCantileverTrafficSignal({
        x: pos.x,
        z: pos.z,
        lookAtX: center.x,
        lookAtZ: center.z,
        phaseGroup: sp.phaseGroup,
      });
      sig.group.name = sp.id;
      holder.add(sig.group);
      this.signalControllers.push(sig);
    }

    this.group.add(holder);
  }

  buildWideMedian() {
    const medianGroup = new THREE.Group();
    medianGroup.name = "dong-da-wide-median";

    const curbMat = mat("#d5cfc1", 0.8);
    const lawnMat = createManicuredLawnMaterial(4, 18, { striped: true, rich: true });
    const shrubMat = mat("#3d7533", 0.85);
    const flowerMat = mat("#d64b67", 0.72);
    const centerR = (DONG_DA_MEDIAN_MIN_RIGHT + DONG_DA_MEDIAN_MAX_RIGHT) / 2;
    const width = DONG_DA_MEDIAN_MAX_RIGHT - DONG_DA_MEDIAN_MIN_RIGHT;

    for (const seg of DONG_DA_MEDIAN_SEGMENTS) {
      const len = seg.maxFwd - seg.minFwd;
      const midFwd = (seg.minFwd + seg.maxFwd) / 2;
      const p = dongDaToWorld(midFwd, centerR);

      const segGroup = new THREE.Group();
      segGroup.name = seg.id;
      segGroup.position.set(p.x, 0.16, p.z);
      segGroup.rotation.y = DONG_DA_ROAD_YAW;

      // Raised concrete curb box + lush turf cap
      const curb = new THREE.Mesh(new THREE.BoxGeometry(width, 0.34, len), curbMat);
      curb.position.y = 0.17;
      curb.receiveShadow = curb.castShadow = true;

      const turf = new THREE.Mesh(new THREE.BoxGeometry(width - 0.56, 0.38, len - 0.56), lawnMat);
      turf.position.y = 0.19;
      turf.receiveShadow = true;
      segGroup.add(curb, turf);

      // Ornamental trimmed shrubs, flower clusters & streetlamps along median spine
      const step = 11.5;
      for (let zOff = -len / 2 + 3.5; zOff <= len / 2 - 3.5; zOff += step) {
        const bush = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.56, 3.2), shrubMat);
        bush.position.set(0, 0.62, zOff);
        bush.castShadow = true;
        segGroup.add(bush);

        const bloom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.42, 0), flowerMat);
        bloom.position.set(0, 0.92, zOff + 2.4);
        bloom.scale.set(1.2, 0.75, 1.2);
        segGroup.add(bloom);
      }

      for (let zOff = -len / 2 + 9; zOff <= len / 2 - 8; zOff += 26) {
        segGroup.add(createStreetLamp(0, 0.36, zOff));
      }

      medianGroup.add(segGroup);
    }

    // Paved asphalt connector deck across the 2 legal median crossing openings
    for (const op of DONG_DA_MEDIAN_OPENINGS) {
      const p = dongDaToWorld(op.centerFwd, centerR);
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(width + 0.8, 0.08, op.maxFwd - op.minFwd),
        mat("#414749", 0.9),
      );
      pad.position.set(p.x, 0.19, p.z);
      pad.rotation.y = DONG_DA_ROAD_YAW;
      pad.receiveShadow = true;
      medianGroup.add(pad);
    }

    this.group.add(medianGroup);
  }

  buildFestivalHotel() {
    // Left side immediately at Ngã 4 Lý Thường Kiệt: fwd 32.5..62.5, right -51.5..-21.5
    const hotel = new THREE.Group();
    hotel.name = "festival-hue-hotel";
    const center = dongDaToWorld(47.5, -36.5);
    hotel.position.set(center.x, 0.23, center.z);
    hotel.rotation.y = DONG_DA_LEFT_FACING_YAW;
    // Note: in this frame (+Y up, rotation.y = DONG_DA_LEFT_FACING_YAW):
    // +Z_local -> +RIGHT (toward Đống Đa), -X_local -> +FWD (toward Nguyễn Chí Diểu), +X_local -> -FWD (toward Ngã 4!)

    const frontWallTex = createArchFacadeTexture({
      wall: "#f5efe0",
      plinth: "#9aa0a4",
      casing: "#ffffff",
      glass: "#284052",
      cols: 5,
      rows: 3,
    });
    const rearWallTex = createArchFacadeTexture({
      wall: "#f7f2e5",
      plinth: "#b8b1a2",
      casing: "#ffffff",
      glass: "#395266",
      cols: 4,
      rows: 4,
    });

    // Paved marble hotel forecourt
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(31, 0.08, 30.5),
      mat("#cec8bb", 0.82),
    );
    apron.position.set(0, 0.04, 0);
    apron.receiveShadow = true;
    hotel.add(apron);

    // 3-story European arched street wing facing Đống Đa & Ngã 4 (z_local = +7.5, depth = 13.5, width = 28)
    const frontWing = new THREE.Mesh(
      new THREE.BoxGeometry(27.5, 11.2, 13.5),
      new THREE.MeshStandardMaterial({
        color: frontWallTex ? "#ffffff" : "#f5efe0",
        map: frontWallTex,
        roughness: 0.65,
      }),
    );
    frontWing.position.set(0.5, 5.64, 7.2);
    frontWing.castShadow = frontWing.receiveShadow = true;
    hotel.add(frontWing);
    this.world.cameraObstacles?.push(frontWing);

    // Horizontal architectural cornices & pitched triangular gable pediment at Ngã 4 corner (+X_local = +14.25)
    hotel.add(
      box([28.2, 0.38, 14.2], "#ffffff", [0.5, 3.85, 7.2]),
      box([28.4, 0.45, 14.4], "#ffffff", [0.5, 11.3, 7.2]),
    );

    const gableGeo = new THREE.ConeGeometry(7.2, 4.4, 4);
    gableGeo.rotateY(Math.PI / 4);
    const gable = new THREE.Mesh(gableGeo, mat("#f5efe0", 0.68));
    gable.scale.set(0.28, 1, 1.32);
    gable.position.set(13.2, 13.3, 7.2);
    gable.castShadow = true;
    hotel.add(gable);

    // Semicircular porte-cochère canopy facing the Ngã 4 corner supported by white columns
    const canopyY = 4.25;
    const canopy = new THREE.Mesh(
      new THREE.CylinderGeometry(5.2, 5.2, 0.42, 24),
      mat("#f7f4ec", 0.55),
    );
    canopy.position.set(14.5, canopyY, 9.8);
    canopy.castShadow = true;
    hotel.add(canopy);
    for (const [cx, cz] of [
      [18.8, 9.8],
      [17.4, 13.5],
      [13.4, 14.2],
      [11.2, 12.2],
    ]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, canopyY - 0.1, 12),
        mat("#ffffff", 0.55),
      );
      col.position.set(cx, (canopyY - 0.1) / 2, cz);
      col.castShadow = true;
      hotel.add(col);
    }

    const canopySign = createSignMesh(
      "Festival hotel",
      "15 LÝ THƯỜNG KIỆT · HUẾ",
      5.4,
      0.85,
      { bg: "#2b4257", border: "#e7c978", titleColor: "#ffffff", subColor: "#f3dc97" },
    );
    canopySign.position.set(17.8, canopyY + 0.02, 13.2);
    canopySign.rotation.y = Math.PI * 0.28;
    hotel.add(canopySign);

    // Green boxwood hedge along Đống Đa street frontage
    hotel.add(box([20.5, 0.95, 0.85], "#3b6e2f", [-2.5, 0.52, 14.3]));

    // 6-story rear tower rising behind the front wing (z_local = -6.8)
    const tower = new THREE.Mesh(
      new THREE.BoxGeometry(21.0, 20.4, 13.0),
      new THREE.MeshStandardMaterial({
        color: rearWallTex ? "#ffffff" : "#f7f2e5",
        map: rearWallTex,
        roughness: 0.65,
      }),
    );
    tower.position.set(-1.5, 10.24, -6.5);
    tower.castShadow = tower.receiveShadow = true;
    hotel.add(tower);
    this.world.cameraObstacles?.push(tower);

    // Rooftop pergola crown + iconic blue "Festival Huế hotel ***" rooftop sign
    hotel.add(box([15.5, 0.45, 10.5], "#ffffff", [-1.5, 20.6, -6.5]));
    for (let px = -7.5; px <= 4.5; px += 2.4) {
      hotel.add(box([0.22, 1.8, 0.22], "#ebe4d6", [px, 21.6, -2.2]));
    }
    hotel.add(box([14.0, 0.28, 6.2], "#f4efe4", [-1.5, 22.5, -5.0]));

    const roofSign = createSignMesh(
      "Festival Huế hotel ★★★",
      "KHÁCH SẠN FESTIVAL HUẾ",
      11.5,
      2.2,
      {
        bg: "#0e64b8",
        border: "#bfe3ff",
        titleColor: "#ffffff",
        subColor: "#d9f0ff",
        emissive: "#0d4a88",
      },
    );
    roofSign.position.set(-1.0, 23.8, -1.8);
    roofSign.rotation.y = Math.PI * 0.14;
    hotel.add(roofSign);

    this.group.add(hotel);
    this.addBlockingBox(32.5, 62.5, -51.5, -21.5);

    this.world.landmarks?.set("festival-hotel", {
      id: "festival-hotel",
      title: "Khách sạn Festival Huế",
      position: dongDaToWorld(44.0, -23.0),
      radius: 42,
      description:
        "Khách sạn Festival Huế 3 sao ngay góc Ngã 4 Đống Đa – Lý Thường Kiệt với mái đón vòm cột trắng và bảng hiệu xanh trên tầng thượng.",
    });
  }

  buildFestivalCafe() {
    // Immediately after Khách sạn Festival: fwd 63.5..83.5, right -36.5..-20.0
    const cafe = new THREE.Group();
    cafe.name = "festival-laporte-cafe";
    const center = dongDaToWorld(73.5, -28.0);
    cafe.position.set(center.x, 0.23, center.z);
    cafe.rotation.y = DONG_DA_LEFT_FACING_YAW;

    // Terracotta-brick tiled patio extending toward Đống Đa (clear of -17.1 road edge)
    const patio = new THREE.Mesh(
      new THREE.BoxGeometry(19.6, 0.08, 15.8),
      mat("#b76d5d", 0.85),
    );
    patio.position.set(0, 0.04, 0.4);
    patio.receiveShadow = true;
    cafe.add(patio);

    // 2-story cafe building (z_local = -3.2, depth = 9.0, height = 7.4)
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(19.0, 7.4, 8.8),
      mat("#ebe0c9", 0.72),
    );
    wall.position.set(0, 3.74, -3.0);
    wall.castShadow = wall.receiveShadow = true;
    cafe.add(wall);
    this.world.cameraObstacles?.push(wall);

    // Warm terracotta-orange ground floor storefront framing glazed arches
    cafe.add(
      box([18.6, 3.4, 0.35], "#d65d31", [0, 1.78, 1.48]),
      box([19.4, 0.32, 3.2], "#dfd3b9", [0, 3.85, 2.55]), // overhanging veranda eave
    );
    for (const bx of [-5.8, 0, 5.8]) {
      cafe.add(
        box([4.4, 2.5, 0.42], "#252f36", [bx, 1.5, 1.54]),
        box([4.0, 2.1, 0.46], "#f3c572", [bx, 1.5, 1.55]),
      );
    }

    // Upper signboard "LA PORTE CAFE & MILKTEA"
    const sign = createSignMesh(
      "LA PORTE · CAFE & MILKTEA",
      "CÀ PHÊ FESTIVAL · TRÀ SỮA · ĐỐNG ĐA",
      13.6,
      1.65,
      { bg: "#ede3cc", border: "#c79a4b", titleColor: "#54321d", subColor: "#9a4124" },
    );
    sign.position.set(0, 5.25, 1.48);
    cafe.add(sign);

    // Festive red Vietnamese & Party flag bunting strung across the veranda eaves
    const flagRedMat = mat("#d9241e", 0.65, 0, { side: THREE.DoubleSide });
    for (let fx = -8.6; fx <= 8.6; fx += 1.05) {
      const pennant = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.34), flagRedMat);
      pennant.position.set(fx, 3.45 - Math.abs(Math.sin(fx * 0.4)) * 0.14, 3.9);
      cafe.add(pennant);
    }

    // Thatched straw garden umbrella on the left bay (+X_local = +6.6)
    const straw = new THREE.Group();
    straw.position.set(6.4, 0.08, 4.6);
    const strawPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, 2.5, 8),
      mat("#6e4d2f", 0.8),
    );
    strawPole.position.y = 1.25;
    const strawRoof = new THREE.Mesh(
      new THREE.ConeGeometry(1.75, 0.72, 12),
      mat("#b89152", 0.92),
    );
    strawRoof.position.y = 2.65;
    strawRoof.castShadow = true;
    straw.add(strawPole, strawRoof);
    cafe.add(straw);

    // Outdoor sidewalk stools, open opposite player seats & animated seated patrons
    for (const [idx, tx, tz, g] of [
      [0, -4.6, 5.2, "man"],
      [1, -1.8, 5.2, "woman"],
      [2, 1.4, 5.2, "man"],
    ]) {
      const tbl = new THREE.Group();
      tbl.position.set(tx, 0.08, tz);
      tbl.add(
        box([0.52, 0.42, 0.52], "#2b3036", [0, 0.21, 0]),
        box([0.36, 0.32, 0.36], "#363c42", [-0.68, 0.16, 0]),
        box([0.36, 0.32, 0.36], "#363c42", [0.68, 0.16, 0]),
      );
      const patron = createSeatedCafePatron({ gender: g, paletteIndex: idx + 1, phase: idx * 1.4 });
      patron.group.position.set(0.68, 0.0, 0.02);
      patron.group.rotation.y = -Math.PI / 2;
      tbl.add(patron.group);
      this.animated.push(patron.animate);
      cafe.add(tbl);

      const tblFwd = 73.5 + tx;
      const tblRight = -28.0 + tz;
      this.addBlockingBox(tblFwd - 0.34, tblFwd + 0.92, tblRight - 0.34, tblRight + 0.34);

      const tblWorld = dongDaToWorld(tblFwd, tblRight);
      const seatWorld = dongDaToWorld(tblFwd - 0.68, tblRight);
      const returnWorld = dongDaToWorld(tblFwd - 0.68, tblRight + 1.15);
      this.world.cafeSpots?.push({
        id: `festival-cafe-seat-${idx}`,
        venueId: "festival-cafe",
        title: "Cafe Festival · La Porte",
        x: seatWorld.x,
        y: 0.31,
        z: seatWorld.z,
        heading: Math.atan2(tblWorld.x - seatWorld.x, tblWorld.z - seatWorld.z),
        returnPose: { x: returnWorld.x, y: 0.31, z: returnWorld.z },
      });
    }

    // White garden picket divider & potted greenery
    cafe.add(box([0.16, 0.85, 3.6], "#f5f4ef", [-8.2, 0.48, 5.2]));
    for (const px of [-8.8, -5.8, 3.6, 8.6]) {
      const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.45, 8), mat("#c2b8a8", 0.85));
      pot.position.set(px, 0.3, 4.0);
      const plant = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), mat("#3f7b35", 0.85));
      plant.position.set(px, 0.82, 4.0);
      cafe.add(pot, plant);
    }

    this.group.add(cafe);
    // Block main Cafe Festival building behind its sidewalk table apron
    this.addBlockingBox(63.5, 83.5, -36.5, -25.8);

    this.world.venues?.push({
      id: "festival-cafe",
      title: "Cafe Festival · La Porte",
      ...dongDaToWorld(73.5, -23.0),
    });
    this.world.landmarks?.set("festival-cafe", {
      id: "festival-cafe",
      title: "Cafe Festival · La Porte",
      position: dongDaToWorld(73.5, -23.0),
      radius: 30,
      description:
        "Quán La Porte Cafe & Milktea nằm ngay giữa Khách sạn Festival và Trường THCS Nguyễn Chí Diểu với giàn cờ đỏ rợp bóng và bàn cà phê vỉa hè.",
    });
  }

  buildMienLuongShop() {
    // Right side at Ngã 4 Lý Thường Kiệt corner: fwd 22.0..44.5, right +9.2..+22.5
    const shop = new THREE.Group();
    shop.name = "quan-mien-luon-dong-da";
    const center = dongDaToWorld(33.25, 15.8);
    shop.position.set(center.x, 0.23, center.z);
    shop.rotation.y = DONG_DA_RIGHT_FACING_YAW;

    const patio = new THREE.Mesh(
      new THREE.BoxGeometry(21.5, 0.08, 13.0),
      mat("#c9c0b2", 0.85),
    );
    patio.position.set(0, 0.04, 0);
    patio.receiveShadow = true;
    shop.add(patio);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(20.5, 4.8, 8.2),
      mat("#f2e4bd", 0.78),
    );
    body.position.set(0, 2.44, -2.0);
    body.castShadow = body.receiveShadow = true;
    shop.add(body);
    this.world.cameraObstacles?.push(body);

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(21.2, 0.28, 9.2),
      mat("#8d3b29", 0.72),
    );
    roof.position.set(0, 4.95, -1.8);
    shop.add(roof);

    // Striped street awning facing Đống Đa (+Z_local)
    const awningTex = createCanvasTex(256, 128, (ctx, w, h) => {
      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = i % 2 === 0 ? "#b8332a" : "#f7f1e3";
        ctx.fillRect((i * w) / 10, 0, w / 10 + 1, h);
      }
    });
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(19.8, 0.14, 2.4),
      new THREE.MeshStandardMaterial({
        color: awningTex ? "#ffffff" : "#b8332a",
        map: awningTex,
        roughness: 0.78,
      }),
    );
    awning.position.set(0, 2.85, 3.15);
    awning.rotation.x = 0.24;
    awning.castShadow = true;
    shop.add(awning);

    const sign = createSignMesh(
      "QUÁN MIẾN LƯƠN XỨ HUẾ",
      "MIẾN LƯƠN XÀO · CHÁO LƯƠN · BÚN LƯƠN · NGÃ 4 ĐỐNG ĐA",
      13.0,
      1.45,
      { bg: "#a8241e", border: "#f5d469", titleColor: "#fff8db", subColor: "#ffe28a" },
    );
    sign.position.set(0, 3.85, 2.15);
    shop.add(sign);

    // Steaming inox broth cauldron cart at front threshold
    shop.add(
      box([2.2, 0.96, 0.85], "#cfd6dc", [-6.5, 0.56, 2.95]),
      box([0.62, 0.48, 0.62], "#e2e7eb", [-6.9, 1.24, 2.95]),
    );

    // Dining tables with seated diners enjoying miến lươn
    for (const [idx, tx, g] of [
      [0, -2.5, "man"],
      [1, 1.5, "woman"],
      [2, 5.5, "man"],
    ]) {
      const tbl = new THREE.Group();
      tbl.position.set(tx, 0.08, 4.3);
      tbl.add(
        box([1.15, 0.06, 0.72], "#d8dce0", [0, 0.7, 0]),
        box([0.08, 0.7, 0.65], "#7a828a", [-0.46, 0.35, 0]),
        box([0.08, 0.7, 0.65], "#7a828a", [0.46, 0.35, 0]),
      );
      for (const sx of [-0.65, 0.65]) {
        tbl.add(box([0.36, 0.42, 0.36], "#1e63b8", [sx, 0.21, 0]));
      }
      const diner = createSeatedCafePatron({ gender: g, paletteIndex: idx + 2, phase: idx * 1.9 });
      diner.group.position.set(0.68, 0.0, 0.02);
      diner.group.rotation.y = -Math.PI / 2;
      tbl.add(diner.group);
      this.animated.push(diner.animate);
      shop.add(tbl);
    }

    this.group.add(shop);
    this.addBlockingBox(22.0, 44.5, 9.2, 22.5);

    this.world.venues?.push({
      id: "mien-luon-dong-da",
      title: "Quán Miến Lươn Đống Đa",
      ...dongDaToWorld(33.25, 11.5),
    });
    this.world.landmarks?.set("mien-luon-dong-da", {
      id: "mien-luon-dong-da",
      title: "Quán Miến Lươn Đống Đa",
      position: dongDaToWorld(33.25, 11.5),
      radius: 30,
      description:
        "Quán Miến Lươn đặc sản xứ Huế nằm ngay góc bên phải Ngã 4 Đống Đa – Lý Thường Kiệt.",
    });
  }

  buildGahiCafe() {
    // Right side next to Quán Miến Lươn: fwd 45.5..75.5, right +9.2..+22.8
    const gahi = new THREE.Group();
    gahi.name = "gahi-cafe-36-dong-da";
    const center = dongDaToWorld(60.5, 16.0);
    gahi.position.set(center.x, 0.23, center.z);
    gahi.rotation.y = DONG_DA_RIGHT_FACING_YAW;

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(29.0, 0.08, 13.4),
      mat("#b9b1a5", 0.84),
    );
    pad.position.set(0, 0.04, 0);
    pad.receiveShadow = true;
    gahi.add(pad);

    // Main Gahi 2-story structure (x_local = -14.0 .. +6.5, width = 20.5)
    // Remember: rotation.y = DONG_DA_RIGHT_FACING_YAW means -X_local -> -FWD (toward Ngã 4), +X_local -> +FWD (toward ĐH Khoa học)
    const gahiBody = new THREE.Mesh(
      new THREE.BoxGeometry(20.4, 7.6, 9.8),
      mat("#33383d", 0.72),
    );
    gahiBody.position.set(-4.0, 3.84, -1.4);
    gahiBody.castShadow = gahiBody.receiveShadow = true;
    gahi.add(gahiBody);
    this.world.cameraObstacles?.push(gahiBody);

    // Warm interior glowing ground-floor café bays (2 wide open steel-framed arch bays)
    for (const bx of [-8.8, 0.2]) {
      gahi.add(
        box([7.8, 3.1, 0.35], "#f4c97d", [bx, 1.68, 3.45]),
        box([8.2, 0.22, 0.55], "#454c54", [bx, 3.3, 3.5]),
      );
    }
    // Central pier with "36 Đống Đa" illuminated address plaque
    gahi.add(box([0.9, 3.4, 0.6], "#4b525a", [-4.3, 1.74, 3.52]));
    const addr = createSignMesh("36", "ĐỐNG ĐA", 0.85, 0.75, {
      bg: "#262c31",
      border: "#ffe39e",
      titleColor: "#fff8db",
      subColor: "#ffe39e",
    });
    addr.position.set(-4.3, 2.55, 3.85);
    gahi.add(addr);

    // Tiled sloped mezzanine roof awning across entire 2-bay width
    const tileAwning = new THREE.Mesh(
      new THREE.BoxGeometry(28.5, 0.24, 2.1),
      mat("#8d7946", 0.7),
    );
    tileAwning.position.set(0, 3.65, 4.15);
    tileAwning.rotation.x = 0.28;
    tileAwning.castShadow = true;
    gahi.add(tileAwning);

    // Upper open-air wooden mezzanine balcony (y = 4.0..7.2) with warm wood ceiling & safety railing
    gahi.add(
      box([19.8, 2.8, 0.35], "#b8743b", [-4.0, 5.4, 3.1]),
      box([20.2, 0.25, 1.6], "#4b3828", [-4.0, 3.98, 4.05]),
      box([20.2, 0.14, 0.12], "#1f2428", [-4.0, 5.05, 4.78]), // railing top bar
      box([20.2, 0.45, 0.4], "#36682f", [-4.0, 4.25, 4.72]), // balcony planter box
    );
    for (let rx = -13.5; rx <= 5.5; rx += 3.8) {
      gahi.add(box([0.14, 1.2, 0.14], "#1f2428", [rx, 4.58, 4.78]));
    }
    // Animated seated guests enjoying Gahi upper balcony!
    for (const [idx, gx, g] of [
      [0, -10.5, "woman"],
      [1, -6.2, "man"],
      [2, -0.5, "woman"],
      [3, 3.2, "man"],
    ]) {
      const patron = createSeatedCafePatron({ gender: g, paletteIndex: idx, phase: idx * 1.6 });
      patron.group.position.set(gx, 4.05, 4.1);
      gahi.add(patron.group);
      this.animated.push(patron.animate);
    }

    // Iconic illuminated rooftop "Gahi Cafe" cursive signboard
    const gahiSign = createSignMesh(
      "Gahi Cafe",
      "36 ĐỐNG ĐA · HUẾ · MỞ CỬA 06:00 - 22:00",
      11.8,
      1.85,
      {
        bg: "#262b30",
        border: "#f7d47c",
        titleColor: "#fff2c2",
        subColor: "#ffdca0",
        emissive: "#574018",
      },
    );
    gahiSign.position.set(-4.0, 7.65, 3.75);
    gahi.add(gahiSign);

    // Adjacent blue "TRƯỜNG TRINH · XIN CHÀO" bay on forward side (+X_local = +10.2) matching photo!
    const blueStall = new THREE.Mesh(
      new THREE.BoxGeometry(7.8, 3.55, 8.8),
      mat("#e9edf2", 0.75),
    );
    blueStall.position.set(10.2, 1.82, -1.2);
    blueStall.castShadow = true;
    gahi.add(blueStall);
    this.world.cameraObstacles?.push(blueStall);

    const blueSign = createSignMesh(
      "TRƯỜNG TRINH · XIN CHÀO",
      "QUÁN ĂN VẶT & NƯỚC GIẢI KHÁT",
      7.2,
      1.15,
      { bg: "#1c75d4", border: "#ffffff", titleColor: "#ffffff", subColor: "#ffe470" },
    );
    blueSign.position.set(10.2, 2.85, 3.3);
    gahi.add(blueSign);

    // Ground-level sidewalk coffee tables + open seats in front of Gahi Cafe
    for (const [idx, tx, tz, g] of [
      [0, -8.8, 4.9, "man"],
      [1, -0.2, 4.9, "woman"],
    ]) {
      const tbl = new THREE.Group();
      tbl.position.set(tx, 0.08, tz);
      tbl.add(
        box([0.54, 0.44, 0.54], "#36322d", [0, 0.22, 0]),
        box([0.36, 0.34, 0.36], "#5e432b", [-0.68, 0.17, 0]),
        box([0.36, 0.34, 0.36], "#5e432b", [0.68, 0.17, 0]),
      );
      const patron = createSeatedCafePatron({ gender: g, paletteIndex: idx + 2, phase: idx * 1.5 });
      patron.group.position.set(0.68, 0.0, 0.02);
      patron.group.rotation.y = -Math.PI / 2;
      tbl.add(patron.group);
      this.animated.push(patron.animate);
      gahi.add(tbl);

      const tblFwd = 60.5 - tx;
      const tblRight = 16.0 - tz;
      this.addBlockingBox(tblFwd - 0.92, tblFwd + 0.34, tblRight - 0.34, tblRight + 0.34);

      const tblWorld = dongDaToWorld(tblFwd, tblRight);
      const seatWorld = dongDaToWorld(tblFwd + 0.68, tblRight);
      const returnWorld = dongDaToWorld(tblFwd + 0.68, tblRight - 1.15);
      this.world.cafeSpots?.push({
        id: `gahi-cafe-seat-${idx}`,
        venueId: "gahi-cafe",
        title: "Gahi Cafe · 36 Đống Đa",
        x: seatWorld.x,
        y: 0.31,
        z: seatWorld.z,
        heading: Math.atan2(tblWorld.x - seatWorld.x, tblWorld.z - seatWorld.z),
        returnPose: { x: returnWorld.x, y: 0.31, z: returnWorld.z },
      });
    }

    this.group.add(gahi);
    // Block main Gahi Cafe building behind its sidewalk patio apron
    this.addBlockingBox(45.5, 75.5, 12.6, 22.8);

    this.world.venues?.push({
      id: "gahi-cafe",
      title: "Gahi Cafe · 36 Đống Đa",
      ...dongDaToWorld(60.5, 11.5),
    });
    this.world.landmarks?.set("gahi-cafe", {
      id: "gahi-cafe",
      title: "Gahi Cafe (36 Đống Đa)",
      position: dongDaToWorld(60.5, 11.5),
      radius: 32,
      description:
        "Quán Gahi Cafe 36 Đống Đa với không gian 2 tầng gỗ ấm cúng, ban công tầng trên nhìn xuống đường Đống Đa và quầy Trường Trinh kế bên.",
    });
  }

  buildUniversityRearCampus() {
    // Toàn bộ mặt sau Trường ĐH Khoa học - ĐH Huế: fwd 77.5 .. 216.0, right +11.4 .. +64.0
    // Broken only by Kiệt 36 Đống Đa alley at fwd 166.5 .. 174.5
    // Has 2 entrances along Đống Đa:
    //   Gate 1 (Cổng sau chính): fwd = 126.0 (opposite Nguyễn Chí Diểu & Median Opening #1)
    //   Gate 2 (Cổng phụ sau):   fwd = 197.0 (opposite Cao Thắng & Median Opening #2)
    const uni = new THREE.Group();
    uni.name = "dhkh-hue-rear-campus";

    const wallMat = mat("#ede7d9", 0.8);
    const trimMat = mat("#9e3d2b", 0.72);
    const ironMat = mat("#264a38", 0.5, 0.55);

    const buildWallSpan = (f1, f2, r) => {
      const len = f2 - f1;
      if (len < 0.3) return;
      const mid = dongDaToWorld((f1 + f2) / 2, r);
      const span = new THREE.Group();
      span.position.set(mid.x, 0.17, mid.z);
      span.rotation.y = DONG_DA_ROAD_YAW;
      span.add(
        box([0.42, 0.95, len], "#e7dfd0", [0, 0.48, 0]),
        box([0.48, 0.14, len], "#8b3a29", [0, 0.98, 0]),
        box([0.16, 1.15, len], "#2a523e", [0, 1.56, 0]),
      );
      const posts = Math.max(1, Math.floor(len / 7.5));
      for (let i = 0; i <= posts; i++) {
        const z = -len / 2 + (i / posts) * len;
        span.add(
          box([0.52, 2.35, 0.52], "#efe8da", [0, 1.18, z]),
          box([0.62, 0.16, 0.62], "#8b3a29", [0, 2.4, z]),
        );
      }
      uni.add(span);

      this.wallSegments.push({
        a: dongDaToWorld(f1, r),
        b: dongDaToWorld(f2, r),
        schoolId: "dhkh-hue-rear",
      });
    };

    const buildUniGate = (fwdCenter, name, title, subtitle) => {
      const g = new THREE.Group();
      g.name = name;
      const p = dongDaToWorld(fwdCenter, 11.4);
      g.position.set(p.x, 0.17, p.z);
      g.rotation.y = DONG_DA_RIGHT_FACING_YAW;

      for (const sx of [-3.6, 3.6]) {
        g.add(
          box([0.92, 0.35, 0.92], "#989286", [sx, 0.18, 0]),
          box([0.82, 4.65, 0.82], "#f4eee0", [sx, 2.45, 0]),
          box([0.94, 0.18, 0.94], "#195394", [sx, 4.82, 0]),
        );
      }
      g.add(
        box([8.4, 1.12, 0.66], "#195394", [0, 4.28, 0]),
        box([8.8, 0.18, 0.82], "#f4eee0", [0, 4.9, 0]),
      );
      const plaque = createSignMesh(title, subtitle, 7.6, 1.0, {
        bg: "#154984",
        border: "#f2cd6b",
        titleColor: "#ffffff",
        subColor: "#ffe57f",
      });
      plaque.position.set(0, 4.28, 0.36);
      const backPlaque = plaque.clone();
      backPlaque.position.set(0, 4.28, -0.36);
      backPlaque.rotation.y = Math.PI;
      g.add(plaque, backPlaque);

      // Swung-open iron leaves parked neatly behind piers
      for (const sx of [-1, 1]) {
        g.add(box([0.1, 2.1, 2.3], ironMat, [sx * 3.1, 1.25, -1.25]));
      }
      // Paved entry threshold crossing sidewalk into courtyard
      g.add(box([6.8, 0.08, 12.0], "#c9c3b6", [0, 0.01, -2.5]));
      uni.add(g);
    };

    // Perimeter fence along Đống Đa with 2 gate openings (122.6..129.4 and 193.6..200.4) & Kiệt 36 alley gap (164.6..178.6)
    buildWallSpan(77.5, 122.6, 11.4);
    buildWallSpan(129.4, 164.6, 11.4);
    buildWallSpan(178.6, 193.6, 11.4);
    buildWallSpan(200.4, 216.0, 11.4);

    // Side & rear return fences closing off courtyard wings cleanly clear of Kiệt 36 Đống Đa
    this.wallSegments.push(
      { a: dongDaToWorld(77.5, 11.4), b: dongDaToWorld(77.5, 58.0), schoolId: "dhkh-hue-rear" },
      { a: dongDaToWorld(164.6, 11.4), b: dongDaToWorld(170.4, 58.0), schoolId: "dhkh-hue-rear" },
      { a: dongDaToWorld(178.6, 11.4), b: dongDaToWorld(184.4, 56.0), schoolId: "dhkh-hue-rear" },
      { a: dongDaToWorld(216.0, 11.4), b: dongDaToWorld(216.0, 56.0), schoolId: "dhkh-hue-rear" },
    );

    buildUniGate(
      126.0,
      "dhkh-rear-gate-1",
      "ĐẠI HỌC KHOA HỌC · ĐẠI HỌC HUẾ",
      "CỔNG VÀO 1 · MẶT SAU ĐƯỜNG ĐỐNG ĐA",
    );
    buildUniGate(
      197.0,
      "dhkh-rear-gate-2",
      "ĐẠI HỌC KHOA HỌC · CỔNG PHỤ ĐỐNG ĐA",
      "CỔNG VÀO 2 · ĐỐI DIỆN THPT CAO THẮNG",
    );

    // Paved interior university courtyards (rideable through both gates!)
    const yardMat = mat("#c6bfb2", 0.86);
    for (const [fMin, fMax, rMin, rMax] of [
      [78.0, 164.4, 11.6, 56.0],
      [178.8, 215.5, 11.6, 54.0],
    ]) {
      const cy = dongDaToWorld((fMin + fMax) / 2, (rMin + rMax) / 2);
      const yard = new THREE.Mesh(
        new THREE.BoxGeometry(rMax - rMin, 0.1, fMax - fMin),
        yardMat,
      );
      yard.position.set(cy.x, 0.21, cy.z);
      yard.rotation.y = DONG_DA_ROAD_YAW;
      yard.receiveShadow = true;
      uni.add(yard);
      this.universityCourtyardRects.push({ minFwd: fMin, maxFwd: fMax, minRight: rMin, maxRight: rMax });
    }

    // 3 Multi-story University of Sciences Rear Academic Buildings (Nhà D, Nhà E, Nhà G)
    const uniFacadeTex = createArchFacadeTexture({
      wall: "#f2ebd8",
      plinth: "#8b8378",
      casing: "#ffffff",
      glass: "#2b5272",
      cols: 6,
      rows: 4,
    });
    const uniWallMat = new THREE.MeshStandardMaterial({
      color: uniFacadeTex ? "#ffffff" : "#f2ebd8",
      map: uniFacadeTex,
      roughness: 0.72,
    });

    const academicBlocks = [
      { name: "dhkh-block-north", fMin: 84, fMax: 152, rMin: 23, rMax: 35, h: 14.2, label: "GIẢNG ĐƯỜNG KHOA HỌC TỰ NHIÊN" },
      { name: "dhkh-block-central", fMin: 92, fMax: 156, rMin: 44, rMax: 58, h: 16.5, label: "TRUNG TÂM NGHIÊN CỨU & THƯ VIỆN" },
      { name: "dhkh-block-south", fMin: 183, fMax: 213, rMin: 24, rMax: 39, h: 13.8, label: "KHOA CÔNG NGHỆ THÔNG TIN & KÝ TÚC" },
    ];
    for (const blk of academicBlocks) {
      const fLen = blk.fMax - blk.fMin;
      const rLen = blk.rMax - blk.rMin;
      const c = dongDaToWorld((blk.fMin + blk.fMax) / 2, (blk.rMin + blk.rMax) / 2);
      const bGroup = new THREE.Group();
      bGroup.name = blk.name;
      bGroup.position.set(c.x, 0.26, c.z);
      bGroup.rotation.y = DONG_DA_RIGHT_FACING_YAW;

      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(fLen, blk.h, rLen),
        uniWallMat,
      );
      mesh.position.y = blk.h / 2;
      mesh.castShadow = mesh.receiveShadow = true;
      bGroup.add(mesh);
      this.world.cameraObstacles?.push(mesh);

      // Terracotta cornice & hipped parapet
      bGroup.add(
        box([fLen + 0.6, 0.35, rLen + 0.6], "#a63e2c", [0, blk.h + 0.18, 0]),
        box([fLen - 1.5, 1.35, rLen - 1.5], "#963525", [0, blk.h + 0.95, 0]),
      );

      const bSign = createSignMesh(
        "TRƯỜNG ĐẠI HỌC KHOA HỌC · ĐẠI HỌC HUẾ",
        blk.label,
        9.4,
        1.5,
        { bg: "#174b87", border: "#f5d472", titleColor: "#ffffff", subColor: "#ffe382" },
      );
      bSign.position.set(0, 4.4, rLen / 2 + 0.12);
      bGroup.add(bSign);

      uni.add(bGroup);
      this.addBlockingBox(blk.fMin, blk.fMax, blk.rMin, blk.rMax);
    }

    // Rear campus shade trees in circular concrete tree pits
    const uniTrees = [
      [92, 16.5],
      [112, 16.5],
      [140, 16.5],
      [158, 16.5],
      [185, 16.5],
      [208, 16.5],
    ];
    uniTrees.forEach(([tf, tr], idx) => {
      const p = dongDaToWorld(tf, tr);
      const curb = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.15, 0.24, 12),
        mat("#e0d9cc", 0.8),
      );
      curb.position.set(p.x, 0.32, p.z);
      uni.add(curb);
      uni.add(createShadeTree(p.x, 0.26, p.z, 1.25, idx + 3));
      this.addBlockingBox(tf - 1.1, tf + 1.1, tr - 1.1, tr + 1.1);
    });

    // College students walking & chatting inside ĐH Khoa học rear yard
    this.uniStudents = new CampusStudents({
      parent: uni,
      toWorld: (side, fwd) => dongDaToWorld(fwd, side),
      groundAt: () => 0.26,
      walkers: [
        { gender: "girl", points: [[15.5, 118], [15.5, 146]], speed: 1.28, offset: 0.2 },
        { gender: "boy", points: [[18.5, 152], [18.5, 102]], speed: 1.35, offset: 0.5 },
        { gender: "girl", points: [[17.0, 183], [17.0, 210]], speed: 1.22, offset: 0.35 },
      ],
      chatSpots: [
        { side: 19.5, fwd: 132, members: ["boy", "girl", "boy"], radius: 0.85 },
        { side: 18.8, fwd: 192, members: ["girl", "boy"], radius: 0.75 },
      ],
    });
    this.animated.push((t, pos) => this.uniStudents.update(t, pos));

    this.group.add(uni);

    this.world.landmarks?.set("dhkh-hue-rear", {
      id: "dhkh-hue-rear",
      title: "Trường Đại học Khoa học Huế (Mặt sau Đống Đa)",
      position: dongDaToWorld(156.0, 14.0),
      radius: 65,
      description:
        "Khuôn viên mặt sau Trường Đại học Khoa học – Đại học Huế kéo dài dọc đường Đống Đa tới đối diện Trường THPT Cao Thắng với 2 cổng vào.",
    });
  }

  buildParkingBay40DongDa() {
    // Immediately following ĐH Khoa học along right side: fwd 220..280, right +4.4..+12.5
    const bay = new THREE.Group();
    bay.name = "dong-da-40-parking-bay";
    const center = dongDaToWorld(250.0, 8.3);
    bay.position.set(center.x, 0.23, center.z);
    bay.rotation.y = DONG_DA_RIGHT_FACING_YAW;
    // Frame note: +X_local -> +FWD, +Z_local -> -RIGHT (toward Đống Đa road at z = +4.1), -Z_local -> +RIGHT (toward fence at z = -3.9)

    this.parkingApronRect = { minFwd: 220.0, maxFwd: 280.0, minRight: 4.4, maxRight: 12.2 };

    // Concrete roadside parking apron flush with Đống Đa right edge
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(60.0, 0.08, 7.8),
      mat("#9ea09d", 0.88),
    );
    apron.position.set(0, 0.04, 0);
    apron.receiveShadow = true;
    bay.add(apron);

    // Dashed white edge line along Đống Đa asphalt border (z_local = +3.75) + angled stall paint lines
    const lineMat = new THREE.MeshStandardMaterial({
      color: "#f4f2ec",
      roughness: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    for (let lx = -28.0; lx <= 28.0; lx += 3.6) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.02, 0.14), lineMat);
      dash.position.set(lx, 0.09, 3.75);
      bay.add(dash);
    }
    const carCentersFwd = [-22.5, -13.8, -5.2, 3.6, 12.4, 21.2];
    for (let sx = -26.8; sx <= 26.8; sx += 8.8) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 5.4), lineMat);
      stripe.position.set(sx, 0.09, 0.8);
      stripe.rotation.y = 0.56;
      bay.add(stripe);
    }

    // Tall green-roofed campus/lot fence behind the parking bay (z_local = -3.85 -> right = +12.15)
    bay.add(
      box([60.0, 0.72, 0.36], "#8c867b", [0, 0.4, -3.85]),
      box([60.0, 1.55, 0.12], "#253139", [0, 1.54, -3.85]),
      box([60.4, 0.18, 2.2], "#3c6942", [0, 2.52, -4.3]), // signature corrugated green awning roof behind fence
    );
    for (let px = -29.0; px <= 29.0; px += 6.44) {
      bay.add(
        box([0.46, 2.45, 0.46], "#c4baa6", [px, 1.25, -3.85]),
        box([0.54, 0.14, 0.54], "#805a3a", [px, 2.52, -3.85]),
      );
    }

    // 3 Roadside fence banners matching b_i____xe_d_c____ng_40___ng__a_de034322.jpg
    const bannerSpecs = [
      [-16.1, "BÃI ĐỖ XE 40 ĐỐNG ĐA", "GIỮ XE Ô TÔ · XE MÁY", "#184f8c"],
      [0.0, "ĐẠI HỌC KHOA HỌC HUẾ", "TUYẾN ĐỖ XE VĂN MINH", "#eff3f6"],
      [16.1, "40 ĐỐNG ĐA · TP HUẾ", "TRẬT TỰ AN TOÀN GIAO THÔNG", "#ece7dc"],
    ];
    for (const [bx, title, sub, bg] of bannerSpecs) {
      const darkText = bg !== "#184f8c";
      const banner = createSignMesh(title, sub, 5.2, 1.35, {
        bg,
        border: darkText ? "#b8362c" : "#f2ce66",
        titleColor: darkText ? "#1a3c6b" : "#ffffff",
        subColor: darkText ? "#9d2520" : "#ffe475",
      });
      banner.position.set(bx, 1.48, -3.62);
      bay.add(banner);
    }

    // 4 leafy roadside trees with wooden support stakes along the fence curb
    [-25.5, -9.2, 8.2, 24.8].forEach((tx, idx) => {
      bay.add(createShadeTree(tx, 0.08, -2.9, 1.28, idx + 7, true));
      const worldFwd = 250 + tx;
      this.addBlockingBox(worldFwd - 0.8, worldFwd + 0.8, 10.4, 12.1);
    });

    // 6 Parked cars angled in the bays matching the photo colors (grey SUV, red hatchback, white sedan, black sedan, white sedan, silver SUV)
    const carConfigs = [
      { lx: -22.5, color: "#4d5257", style: "suv" },
      { lx: -13.8, color: "#be242c", style: "hatch" },
      { lx: -5.2, color: "#f2f4f7", style: "sedan" },
      { lx: 3.6, color: "#1d2228", style: "sedan" },
      { lx: 12.4, color: "#eef1f5", style: "sedan" },
      { lx: 21.2, color: "#aeb6be", style: "suv" },
    ];
    for (const cc of carConfigs) {
      const car = createParkedCar(cc.color, cc.style);
      car.position.set(cc.lx, 0.08, 0.65);
      car.rotation.y = 0.56;
      bay.add(car);
      const worldFwd = 250 + cc.lx;
      // Car hull collision (right ∈ [5.4, 10.2])
      this.addBlockingBox(worldFwd - 2.3, worldFwd + 2.3, 5.4, 10.2);
    }

    // Fence line collision
    this.wallSegments.push({
      a: dongDaToWorld(220.0, 12.1),
      b: dongDaToWorld(280.0, 12.1),
    });

    this.group.add(bay);

    this.world.landmarks?.set("dong-da-40-parking", {
      id: "dong-da-40-parking",
      title: "Bãi đỗ xe dọc đường (40 Đống Đa)",
      position: dongDaToWorld(250.0, 8.0),
      radius: 42,
      description:
        "Bãi đỗ xe ô tô dọc vỉa hè 40 Đống Đa với vạch đỗ xe chéo, hàng rào mái xanh và bóng cây mát rợp.",
    });
  }

  hitsMedian(wx, wz) {
    const { fwd, right } = dongDaToLocal(wx, wz);
    if (right < DONG_DA_MEDIAN_MIN_RIGHT - 0.15 || right > DONG_DA_MEDIAN_MAX_RIGHT + 0.15) {
      return false;
    }
    return DONG_DA_MEDIAN_SEGMENTS.some(
      (s) => fwd >= s.minFwd && fwd <= s.maxFwd,
    );
  }

  onMedianOpening(fwd, right) {
    if (right < DONG_DA_MEDIAN_MIN_RIGHT - 0.5 || right > DONG_DA_MEDIAN_MAX_RIGHT + 0.5) {
      return false;
    }
    return DONG_DA_MEDIAN_OPENINGS.some(
      (op) => fwd >= op.minFwd && fwd <= op.maxFwd,
    );
  }

  groundAt(wx, wz, referenceY) {
    if (Number.isFinite(referenceY) && referenceY >= 1.8) return null;
    const { fwd, right } = dongDaToLocal(wx, wz);
    if (this.hitsMedian(wx, wz)) return 0.38;
    if (this.onMedianOpening(fwd, right)) return 0.23;
    for (const r of this.universityCourtyardRects) {
      if (fwd >= r.minFwd && fwd <= r.maxFwd && right >= r.minRight && right <= r.maxRight) {
        return 0.26;
      }
    }
    if (
      this.parkingApronRect &&
      fwd >= this.parkingApronRect.minFwd &&
      fwd <= this.parkingApronRect.maxFwd &&
      right >= this.parkingApronRect.minRight &&
      right <= this.parkingApronRect.maxRight
    ) {
      return 0.27;
    }
    if (
      (fwd >= 63.5 && fwd <= 83.5 && right > -25.8 && right <= -20.0) ||
      (fwd >= 45.5 && fwd <= 75.5 && right >= 9.2 && right < 12.6)
    ) {
      return 0.31;
    }
    return null;
  }

  canRide(wx, wz, referenceY) {
    if (Number.isFinite(referenceY) && referenceY >= 1.8) return null;
    if (this.hitsMedian(wx, wz)) return false;

    const { fwd, right } = dongDaToLocal(wx, wz);
    for (const b of this.blockingRects) {
      if (
        fwd >= b.minFwd &&
        fwd <= b.maxFwd &&
        right >= b.minRight &&
        right <= b.maxRight
      ) {
        return false;
      }
    }
    for (const seg of this.wallSegments) {
      // Fast point-to-segment check
      const dx = seg.b.x - seg.a.x;
      const dz = seg.b.z - seg.a.z;
      const l2 = dx * dx + dz * dz || 1;
      const t = Math.max(0, Math.min(1, ((wx - seg.a.x) * dx + (wz - seg.a.z) * dz) / l2));
      const px = seg.a.x + dx * t;
      const pz = seg.a.z + dz * t;
      if (Math.hypot(wx - px, wz - pz) < 0.52) return false;
    }
    if (this.onMedianOpening(fwd, right)) {
      return true;
    }
    for (const r of this.universityCourtyardRects) {
      if (fwd >= r.minFwd && fwd <= r.maxFwd && right >= r.minRight && right <= r.maxRight) {
        return true;
      }
    }
    if (
      (fwd >= 63.5 && fwd <= 83.5 && right > -25.8 && right <= -20.0) ||
      (fwd >= 45.5 && fwd <= 75.5 && right >= 9.2 && right < 12.6)
    ) {
      return true;
    }
    return null;
  }

  blocksPedestrian(wx, wz) {
    if (this.hitsMedian(wx, wz)) return true;
    const { fwd, right } = dongDaToLocal(wx, wz);
    return this.blockingRects.some(
      (b) =>
        fwd >= b.minFwd - 0.3 &&
        fwd <= b.maxFwd + 0.3 &&
        right >= b.minRight - 0.3 &&
        right <= b.maxRight + 0.3,
    );
  }

  blocksTree(wx, wz) {
    const { fwd, right } = dongDaToLocal(wx, wz);
    // Keep Ngã 4 signals, median strip, left frontages (Hotel/Cafe), right frontages (Miến Lươn/Gahi/ĐH Khoa học/40 Đống Đa) clear of random street trees
    if (fwd >= -26 && fwd <= 34 && right >= -26 && right <= 26) return true;
    if (fwd >= 26 && fwd <= 460 && right >= DONG_DA_MEDIAN_MIN_RIGHT - 1.4 && right <= DONG_DA_MEDIAN_MAX_RIGHT + 1.4) {
      return true;
    }
    if (fwd >= 28 && fwd <= 86 && right >= -54 && right <= -17.0) return true;
    if (fwd >= 18 && fwd <= 284 && right >= 4.2 && right <= 65.0) return true;
    return false;
  }

  blocksGrass(wx, wz) {
    const { fwd, right } = dongDaToLocal(wx, wz);
    if (fwd >= 28 && fwd <= 458 && right >= DONG_DA_MEDIAN_MIN_RIGHT - 0.4 && right <= DONG_DA_MEDIAN_MAX_RIGHT + 0.4) {
      return true;
    }
    if (fwd >= 28 && fwd <= 86 && right >= -54 && right <= -19.0) return true;
    if (fwd >= 20 && fwd <= 284 && right >= 4.4 && right <= 62.0) return true;
    return false;
  }

  update(time, playerPos = null) {
    for (const fn of this.animated) fn(time, playerPos);
    const cycle = ((time % 12) + 12) % 12;
    for (const sig of this.signalControllers) {
      let state;
      if (sig.phaseGroup === 0) {
        state = cycle < 4.5 ? 2 : cycle < 6.0 ? 1 : 0;
      } else {
        state = cycle < 6.0 ? 0 : cycle < 10.5 ? 2 : 1;
      }
      for (const lamps of sig.heads) {
        lamps[0].color.setHex(state === 0 ? 0xff3b30 : 0x3b1210);
        lamps[1].color.setHex(state === 1 ? 0xffcc29 : 0x3f300c);
        lamps[2].color.setHex(state === 2 ? 0x2de072 : 0x10361e);
      }
    }
  }
}
