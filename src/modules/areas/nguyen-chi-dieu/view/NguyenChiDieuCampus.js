import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import dongDaCampuses from "../data/campuses.json" with { type: "json" };
import {
  getById,
  getCentroid,
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

function createCreamClassroomWallTexture() {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    // Pale cream-yellow Hue school facade stucco matching photo
    ctx.fillStyle = "#f2e59f";
    ctx.fillRect(0, 0, w, h);

    // Subtle stone plinth
    ctx.fillStyle = "#918a7f";
    ctx.fillRect(0, h - 54, w, 54);
    ctx.fillStyle = "#faf6e8";
    ctx.fillRect(0, h - 58, w, 8);

    // Three floor horizontal cream fascia bands
    for (const bandY of [0, 152, 304]) {
      ctx.fillStyle = "#faf6e8";
      ctx.fillRect(0, bandY, w, 14);
    }

    // 3 stories of green-framed classroom windows matching photo
    for (const floorY of [32, 184, 336]) {
      for (const wx of [34, 198, 362]) {
        ctx.fillStyle = "#faf6e8";
        ctx.fillRect(wx - 6, floorY - 6, 118, 108);
        ctx.fillStyle = "#2d6a3e";
        ctx.fillRect(wx, floorY, 106, 96);
        ctx.fillStyle = "#234f31";
        ctx.fillRect(wx + 8, floorY + 8, 90, 80);
        // Window mullions & white vertical louver ribs
        ctx.fillStyle = "#6fa37b";
        ctx.fillRect(wx + 51, floorY + 6, 4, 84);
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
      ctx.fillStyle = "#b8452e";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#ca5239";
        ctx.fillRect(x + 2, 0, 11, h);
        ctx.fillStyle = "#8e301d";
        ctx.fillRect(x + 17, 0, 5, h);
      }
      for (let y = 0; y < h; y += 22) {
        ctx.fillStyle = "rgba(65,18,10,0.25)";
        ctx.fillRect(0, y, w, 3);
      }
    },
    4,
    2,
  );
}

function createSchoolyardStoneTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#aba89f";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle =
          i % 3 === 0 ? "rgba(85,82,76,0.12)" : "rgba(242,240,235,0.11)";
        ctx.fillRect((i * 197) % w, (i * 331) % h, 4, 4);
      }
      ctx.strokeStyle = "rgba(120,117,110,0.22)";
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

function createBroadShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.618;
  const trunkMat = mat("#64513d", 0.9);
  const trunkH = 3.1 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.31 * scale, trunkH, 7),
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
      trunkH + 0.48 * scale,
      Math.sin(a) * 0.65 * scale,
    );
    branch.rotation.z = -Math.cos(a) * 0.56;
    branch.rotation.x = Math.sin(a) * 0.56;
    g.add(branch);
  }

  const greens = ["#346b2c", "#427e36", "#539242", "#629f4d"];
  const crowns = [
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
    c.scale.set(1.22, sy, 1.18);
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
    new THREE.CylinderGeometry(0.42, 0.52, 0.28, 12),
    baseMat,
  );
  plinth.position.y = 0.14;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.34, 0.24, 12),
    baseMat,
  );
  collar.position.y = 0.38;

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
    const yardTex = createSchoolyardStoneTexture();
    const flagTex = createVietnamFlagTexture();

    const yardMat = new THREE.MeshStandardMaterial({
      color: yardTex ? "#ffffff" : "#aba89f",
      map: yardTex,
      roughness: 0.84,
      metalness: 0.03,
      side: THREE.DoubleSide,
    });
    const lawnMat = createManicuredLawnMaterial(6, 6, {
      striped: false,
      rich: true,
    });

    // Paved courtyard matching exact campus footprint polygon
    const yardGeo = polygonGeometry(this.campusRings[0], 0.14);
    const yardMesh = new THREE.Mesh(yardGeo, yardMat);
    yardMesh.position.y = 0.16;
    yardMesh.receiveShadow = true;
    this.group.add(yardMesh);

    const yard = new THREE.Group();
    yard.position.set(this.gate.x, 0, this.gate.z);
    yard.rotation.y = this.facingGateYaw;

    // Entry plaza drive connecting Đống Đa gate into courtyard
    const entryDrive = new THREE.Mesh(
      new THREE.BoxGeometry(10.4, 0.05, 22),
      yardMat,
    );
    entryDrive.position.set(0, 0.29, -10);
    entryDrive.receiveShadow = true;
    yard.add(entryDrive);

    // Side garden beds flanking the gate interior
    for (const [lx, lz, w, d] of [
      [-14.5, -5.5, 9.5, 4.2],
      [13.5, -5.5, 11.5, 4.2],
    ]) {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), lawnMat);
      bed.position.set(lx, 0.29, lz);
      bed.receiveShadow = true;
      yard.add(bed);
    }

    // Ceremonial flagpole visible straight ahead behind the open sky-blue gate
    const fp = createFlagpole(4.5, 0.3, -15.5, flagTex);
    yard.add(fp.group);
    this.flags.push(fp.flagMesh);
    this.animatedObjects.push(fp.flagMesh);
    this.obstacles.push({ side: 4.5, fwd: 15.5, radius: 1.15 });

    // Courtyard stone benches (placed clear of main drive & buildings)
    const benchSpecs = [
      [-10.5, 10.5, Math.PI * 0.25],
      [11.5, 11.5, -Math.PI * 0.25],
      [15.5, 22.0, -Math.PI * 0.5],
      [13.5, 58.0, -Math.PI * 0.5],
    ];
    for (const [bx, bf, yaw] of benchSpecs) {
      yard.add(createBench(bx, 0.3, -bf, yaw));
      this.obstacles.push({ side: bx, fwd: bf, radius: 1.1 });
    }

    this.group.add(yard);
  }

  buildBuildings() {
    const wallTex = createCreamClassroomWallTexture();
    const roofTex = createTerracottaRoofTexture();

    const wallMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#f2e59f",
      map: wallTex,
      roughness: 0.76,
      metalness: 0.04,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#b8452e",
      map: roofTex,
      roughness: 0.68,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const trimMat = mat("#faf6e8", 0.72);
    const cornices = [];
    const midBands = [];

    for (const id of this.buildingIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.campusBuildingPolygons.push(pts);

      const isMain = id === 732304130;
      const isRearGym = id === 1416873568;
      const wallHeight = isMain ? 10.4 : isRearGym ? 7.6 : 6.8;

      const bodyGeo = polygonGeometry(pts, wallHeight);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          const px = pos.getX(i);
          const py = pos.getY(i);
          const pz = pos.getZ(i);
          uv.setXY(i, (px + pz) / 9.0, py / wallHeight);
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

        for (const bandH of isMain ? [3.4, 6.8] : [3.4]) {
          const band = new THREE.BoxGeometry(len + 0.22, 0.2, 0.34);
          band.translate(0, bandH, 0);
          band.applyMatrix4(matRot);
          midBands.push(band);
        }
      }

      const ob = orientedBounds(pts);
      const ridgeH = Math.min(3.1, ob.depth * 0.2 + 0.7);
      const roofObj = createHipRoofMesh(
        ob.length + 1.0,
        ob.depth + 1.0,
        ridgeH,
        roofMat,
      );
      roofObj.position.set(ob.cx, 0.28 + wallHeight, ob.cz);
      roofObj.rotation.y = ob.yaw;
      this.group.add(roofObj);

      // Add a crisp central gabled portico porch on main school block facing courtyard
      if (isMain) {
        const mainCenter = getCentroid(feature);
        const plaqueTex = createCanvasTexture(512, 112, (ctx, w, h) => {
          ctx.fillStyle = "#bc1e1e";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#f7df78";
          ctx.lineWidth = 6;
          ctx.strokeRect(6, 6, w - 12, h - 12);
          ctx.fillStyle = "#ffe55e";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "bold 30px 'Be Vietnam Pro', Arial, sans-serif";
          ctx.fillText("DẠY TỐT · HỌC TỐT", w / 2, h / 2);
        });
        const mottoBoard = new THREE.Mesh(
          new THREE.PlaneGeometry(5.2, 1.15),
          new THREE.MeshStandardMaterial({
            color: "#ffffff",
            map: plaqueTex,
            roughness: 0.5,
          }),
        );
        const toYard = this.toWorld(4, 24);
        mottoBoard.position.set(
          (mainCenter.x + toYard.x) / 2,
          4.1,
          (mainCenter.z + toYard.z) / 2,
        );
        mottoBoard.rotation.y = this.facingGateYaw;
        this.group.add(mottoBoard);
      }
    }

    for (const batch of [cornices, midBands]) {
      if (!batch.length) continue;
      const m = new THREE.Mesh(mergeGeometries(batch), trimMat);
      m.castShadow = m.receiveShadow = true;
      this.group.add(m);
      batch.forEach((p) => p.dispose());
    }
  }

  buildGreenery() {
    // Lush shade trees matching reference photo (rising behind gate & shading campus yard)
    const candidateSpecs = [
      [-12.8, 7.5, 1.45],
      [11.5, 9.0, 1.48],
      [-23.5, 4.5, 1.38],
      [19.2, 6.2, 1.4],
      [19.8, 22.0, 1.42],
      [-7.5, 22.5, 1.32],
      [19.5, 36.0, 1.35],
      [-10.5, 58.0, 1.34],
      [20.2, 54.0, 1.38],
      [18.5, 76.0, 1.36],
      [-8.0, 90.0, 1.32],
    ];

    candidateSpecs.forEach(([side, fwd, scale], idx) => {
      const w = this.toWorld(side, fwd);
      if (!this.inCampus(w.x, w.z)) return;
      const hitsBuilding = this.campusBuildingPolygons.some(
        (poly) =>
          inside(w, poly) || nearestPoint(w, poly).distance < 2.8,
      );
      if (hitsBuilding) return;

      const planter = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.15, 0.22, 12),
        mat("#e5dfd2", 0.8),
      );
      planter.position.set(w.x, 0.32, w.z);
      this.group.add(planter);
      this.obstacles.push({ side, fwd, radius: 1.25 });

      this.group.add(createBroadShadeTree(w.x, 0.3, w.z, scale, idx + 1));
    });
  }

  buildStudents() {
    const isWalkSafe = (side, fwd) => {
      const w = this.toWorld(side, fwd);
      return (
        this.inCampus(w.x, w.z) &&
        !this.campusBuildingPolygons.some(
          (poly) => inside(w, poly) || nearestPoint(w, poly).distance < 1.2,
        )
      );
    };

    const walkers = [
      { gender: "girl", points: [[-2.0, 3], [-2.0, 20]], speed: 1.28, offset: 0.1 },
      { gender: "boy", points: [[1.6, 21], [1.6, 4]], speed: 1.36, offset: 0.45 },
      { gender: "girl", points: [[-10, 12], [11, 12]], speed: 1.22, offset: 0.25 },
      { gender: "boy", points: [[15.5, 10], [16.5, 42]], speed: 1.34, offset: 0.6 },
      { gender: "girl", points: [[16.5, 44], [15.5, 68]], speed: 1.26, offset: 0.35 },
      { gender: "boy", points: [[12, 62], [-2, 62]], speed: 1.3, offset: 0.5 },
      { gender: "girl", points: [[2.5, 58], [14, 58]], speed: 1.2, offset: 0.2 },
      { gender: "boy", points: [[14, 16], [19, 16]], speed: 1.25, offset: 0.7 },
    ].filter((w) => w.points.every(([s, f]) => isWalkSafe(s, f)));

    const chatSpots = [
      { side: -6.2, fwd: 15.5, members: ["girl", "boy", "girl"], radius: 0.85 },
      { side: 9.2, fwd: 19.5, members: ["boy", "girl", "boy"], radius: 0.85 },
      { side: 13.8, fwd: 27.5, members: ["girl", "boy"], radius: 0.75 },
      { side: 10.5, fwd: 54.0, members: ["boy", "girl", "boy"], radius: 0.85 },
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
    this.students?.update(time, playerPos);
  }
}
