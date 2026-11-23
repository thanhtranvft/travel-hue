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

function createCaoThangWallTexture() {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    // Warm ivory-ochre classroom block facade
    ctx.fillStyle = "#efe5cf";
    ctx.fillRect(0, 0, w, h);

    // Brick-terracotta plinth along ground level
    ctx.fillStyle = "#7e3630";
    ctx.fillRect(0, h - 52, w, 52);
    ctx.fillStyle = "#d9d1c2";
    ctx.fillRect(0, h - 56, w, 8);

    // Floor cornices
    for (const bandY of [0, 154, 310]) {
      ctx.fillStyle = "#893b34";
      ctx.fillRect(0, bandY, w, 12);
    }

    // Classroom window bays across 3 stories
    for (const floorY of [32, 186, 340]) {
      for (const wx of [34, 198, 362]) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(wx - 6, floorY - 5, 118, 106);
        ctx.fillStyle = "#224d78";
        ctx.fillRect(wx, floorY, 106, 94);
        ctx.fillStyle = "#193858";
        ctx.fillRect(wx + 8, floorY + 8, 90, 78);
        ctx.fillStyle = "#6c97be";
        ctx.fillRect(wx + 51, floorY + 6, 4, 82);
        ctx.fillRect(wx + 6, floorY + 46, 94, 4);
      }
    }
  });
}

function createTerracottaRoofTexture() {
  return createCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#a53f2c";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#ba4c36";
        ctx.fillRect(x + 2, 0, 11, h);
        ctx.fillStyle = "#7d2b1b";
        ctx.fillRect(x + 17, 0, 5, h);
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
      ctx.fillStyle = "#a3a098";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(92,89,82,0.22)";
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

function createCampusTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat("#64513d", 0.9);
  const trunkH = 3.0 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17 * scale, 0.29 * scale, trunkH, 7),
    trunkMat,
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = trunk.receiveShadow = true;
  g.add(trunk);

  const greens = ["#346b2c", "#427d37", "#528e42", "#629c4d"];
  const crowns = [
    [0, trunkH + 1.85 * scale, 0, 2.0 * scale, 0.62],
    [1.35 * scale, trunkH + 1.4 * scale, 0.8 * scale, 1.48 * scale, 0.6],
    [-1.3 * scale, trunkH + 1.45 * scale, 0.75 * scale, 1.5 * scale, 0.6],
    [0.2 * scale, trunkH + 1.35 * scale, -1.35 * scale, 1.48 * scale, 0.62],
  ];
  crowns.forEach(([cx, cy, cz, r, sy], i) => {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r, 1),
      mat(greens[i % greens.length], 0.86),
    );
    c.position.set(cx, cy, cz);
    c.scale.set(1.18, sy, 1.15);
    c.castShadow = c.receiveShadow = true;
    g.add(c);
  });
  return g;
}

function createFlagpole(x, y, z, flagTex) {
  const group = new THREE.Group();
  group.name = "cao-thang-flagpole";
  group.position.set(x, y, z);

  const baseMat = mat("#e3ddd0", 0.78);
  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.42, 0.52, 0.28, 12),
    baseMat,
  );
  plinth.position.y = 0.14;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.34, 0.24, 12),
    baseMat,
  );
  collar.position.y = 0.38;

  const poleH = 12.0;
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

  const flagW = 2.65;
  const flagH = 1.75;
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
  flagMesh.position.set(0.05, poleH - 0.82, 0);
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

export class CaoThangCampus {
  constructor(world, site, gatePlacement) {
    this.world = world;
    this.site = site;
    const cfg = dongDaCampuses["cao-thang"];
    this.campusRings = [cfg.ring];
    this.buildingIds = cfg.buildings || [
      732304133, 732304134, 732304135, 732304136, 732304137, 732304138,
    ];
    this.gate = { x: gatePlacement.x, z: gatePlacement.z };
    this.facingGateYaw = gatePlacement.heading;
    this.fwdVec = {
      x: -Math.sin(this.facingGateYaw),
      z: -Math.cos(this.facingGateYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "cao-thang-campus";
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
    const yardTex = createCourtyardPavingTexture();
    const flagTex = createVietnamFlagTexture();

    const yardMat = new THREE.MeshStandardMaterial({
      color: yardTex ? "#ffffff" : "#a3a098",
      map: yardTex,
      roughness: 0.84,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const lawnMat = createManicuredLawnMaterial(6, 6, {
      striped: true,
      rich: true,
    });

    const yardMesh = new THREE.Mesh(
      polygonGeometry(this.campusRings[0], 0.14),
      yardMat,
    );
    yardMesh.position.y = 0.16;
    yardMesh.receiveShadow = true;
    this.group.add(yardMesh);

    const yard = new THREE.Group();
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    // Front landscaped lawns flanking entry avenue
    for (const [lx, lz, w, d] of [
      [-12.5, -15, 11, 14],
      [15.5, -15, 13, 14],
    ]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), lawnMat);
      lawn.position.set(lx, 0.29, lz);
      lawn.receiveShadow = true;
      yard.add(lawn);
    }

    // Central flagpole on front courtyard plaza (side=0, fwd=16)
    const fp = createFlagpole(0, 0.3, -16, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);
    this.obstacles.push({ side: 0, fwd: 16, radius: 1.2 });

    // Benches around front and inner courtyards
    const benchSpecs = [
      [-10, 26, 0],
      [12, 26, 0],
      [2.5, 45, 0],
      [6.5, 45, 0],
    ];
    for (const [bx, bf, yaw] of benchSpecs) {
      yard.add(createBench(bx, 0.3, -bf, yaw));
      this.obstacles.push({ side: bx, fwd: bf, radius: 1.1 });
    }

    this.group.add(yard);
  }

  buildBuildings() {
    const wallTex = createCaoThangWallTexture();
    const roofTex = createTerracottaRoofTexture();

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#efe5cf",
      map: wallTex,
      roughness: 0.76,
      metalness: 0.04,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#a53f2c",
      map: roofTex,
      roughness: 0.68,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const trimMat = mat("#893b34", 0.72);
    const cornices = [];

    for (const id of this.buildingIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.campusBuildingPolygons.push(pts);

      const isMainU = id === 732304135;
      const isGuard = id === 732304133;
      const wallHeight = isMainU ? 10.6 : isGuard ? 4.4 : 8.2;

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
      const bodyMesh = new THREE.Mesh(bodyGeo, wallMat);
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

        const topCornice = new THREE.BoxGeometry(len + 0.4, 0.28, 0.48);
        topCornice.translate(0, wallHeight - 0.1, 0);
        topCornice.applyMatrix4(matRot);
        cornices.push(topCornice);
      }

      if (!isMainU) {
        const ob = orientedBounds(pts);
        const ridgeH = isGuard ? 1.25 : Math.min(2.8, ob.depth * 0.2 + 0.65);
        const roofObj = createHipRoofMesh(
          ob.length + 0.9,
          ob.depth + 0.9,
          ridgeH,
          roofMat,
        );
        roofObj.position.set(ob.cx, 0.28 + wallHeight, ob.cz);
        roofObj.rotation.y = ob.yaw;
        this.group.add(roofObj);
      } else {
        // Style each wing of U-shaped building cleanly with terracotta roofs
        const wingSpecs = [
          { side: 3.0, fwd: 35.8, length: 52.5, depth: 9.8 },
          { side: -12.6, fwd: 54.0, length: 11.4, depth: 33.5 },
          { side: -0.9, fwd: 68.7, length: 52.2, depth: 10.6 },
        ];
        for (const ws of wingSpecs) {
          const pos = this.toWorld(ws.side, ws.fwd);
          const wingRoof = createHipRoofMesh(ws.length, ws.depth, 2.3, roofMat);
          wingRoof.position.set(pos.x, 0.28 + wallHeight, pos.z);
          wingRoof.rotation.y = this.facingGateYaw;
          this.group.add(wingRoof);
        }
      }
    }

    if (cornices.length) {
      const m = new THREE.Mesh(mergeGeometries(cornices), trimMat);
      m.castShadow = m.receiveShadow = true;
      this.group.add(m);
      cornices.forEach((p) => p.dispose());
    }
  }

  buildGreenery() {
    const candidateSpecs = [
      [-14, 9, 1.38],
      [15, 9, 1.38],
      [-14, 21, 1.34],
      [15, 21, 1.34],
      [28, 12, 1.36],
      [28, 26, 1.36],
      [25, 52, 1.32],
      [-34, 34, 1.35],
      [4, 54, 1.24],
    ];

    candidateSpecs.forEach(([side, fwd, scale], idx) => {
      const w = this.toWorld(side, fwd);
      if (!this.inCampus(w.x, w.z)) return;
      const hitsBuilding = this.campusBuildingPolygons.some(
        (poly) => inside(w, poly) || nearestPoint(w, poly).distance < 2.8,
      );
      if (hitsBuilding) return;

      const planter = new THREE.Mesh(
        new THREE.CylinderGeometry(1.05, 1.1, 0.22, 12),
        mat("#e3ddd0", 0.8),
      );
      planter.position.set(w.x, 0.32, w.z);
      this.group.add(planter);
      this.obstacles.push({ side, fwd, radius: 1.2 });

      this.group.add(createCampusTree(w.x, 0.3, w.z, scale, idx + 1));
    });
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
      { gender: "boy", points: [[-2.4, 3], [-2.4, 26]], speed: 1.34, offset: 0.1 },
      { gender: "girl", points: [[2.6, 26], [2.6, 4]], speed: 1.28, offset: 0.45 },
      { gender: "girl", points: [[-17, 25], [22, 25]], speed: 1.25, offset: 0.2 },
      { gender: "boy", points: [[22, 14], [22, 27]], speed: 1.32, offset: 0.5 },
      { gender: "girl", points: [[14, 48], [14, 61]], speed: 1.2, offset: 0.3 },
      { gender: "boy", points: [[-4, 58], [16, 58]], speed: 1.26, offset: 0.65 },
      { gender: "girl", points: [[-18, 6], [12, 6]], speed: 1.22, offset: 0.35 },
      { gender: "boy", points: [[12, 78], [-12, 78]], speed: 1.3, offset: 0.7 },
    ].filter((w) => w.points.every(([s, f]) => isWalkSafe(s, f)));

    const chatSpots = [
      { side: -7.5, fwd: 15.0, members: ["girl", "boy", "girl"], radius: 0.85 },
      { side: 7.5, fwd: 15.0, members: ["boy", "girl", "boy"], radius: 0.85 },
      { side: 10.0, fwd: 51.0, members: ["girl", "boy", "girl"], radius: 0.85 },
      { side: -1.5, fwd: 51.0, members: ["boy", "girl"], radius: 0.75 },
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
        const u = Math.min(1, Math.max(0, bx / 2.65));
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
