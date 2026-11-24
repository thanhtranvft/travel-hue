import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { campusWallSegments } from "../../../../core/shared/architecture/CampusWalls.js";
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

function createConcreteCourtyardTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#c9ccd0";
      ctx.fillRect(0, 0, w, h);
      const step = 64;
      for (let r = 0; r < h / step; r++) {
        for (let c = 0; c < w / step; c++) {
          const d = ((r * 11 + c * 7) % 5) * 2 - 4;
          ctx.fillStyle = `rgb(${198 + d}, ${201 + d}, ${205 + d})`;
          ctx.fillRect(c * step + 1, r * step + 1, step - 2, step - 2);
        }
      }
      ctx.strokeStyle = "rgba(118, 124, 130, 0.34)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += step) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
    },
    10,
    9,
  );
}

function createCrimsonRoofTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#c42e40";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 22) {
        ctx.fillStyle = "#d43b4d";
        ctx.fillRect(x + 2, 0, 12, h);
        ctx.fillStyle = "#9b2030";
        ctx.fillRect(x + 17, 0, 4, h);
      }
      for (let y = 0; y < h; y += 20) {
        ctx.fillStyle = "rgba(75, 14, 22, 0.25)";
        ctx.fillRect(0, y, w, 3);
      }
    },
    8,
    3,
  );
}

function createMuseumWallTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#e6d4dd";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(182, 160, 170, 0.25)";
      ctx.lineWidth = 2;
      for (let y = 32; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    },
    4,
    2,
  );
}

function createRibbonWindowTexture() {
  return createCanvasTex(
    512,
    128,
    (ctx, w, h) => {
      ctx.fillStyle = "#1f2a32";
      ctx.fillRect(0, 0, w, h);
      for (let x = 8; x < w; x += 48) {
        const g = ctx.createLinearGradient?.(x, 0, x + 38, h);
        if (g) {
          g.addColorStop(0, "#3b4f5c");
          g.addColorStop(0.45, "#23303a");
          g.addColorStop(1, "#485e6c");
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = "#2b3b45";
        }
        ctx.fillRect(x, 8, 38, h - 16);
        ctx.fillStyle = "#8a9aa4";
        ctx.fillRect(x + 38, 0, 10, h);
      }
      ctx.fillStyle = "#cad2d8";
      ctx.fillRect(0, 0, w, 6);
      ctx.fillRect(0, h - 6, w, 6);
    },
    3,
    1,
  );
}

function createMuseumSignTexture(title, subtitle) {
  return createCanvasTex(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = "#e8d6df";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#b89da8";
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#5a2d33";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 56px Georgia, serif";
    ctx.fillText(title, w / 2, h * 0.42);
    if (subtitle) {
      ctx.fillStyle = "#6e474b";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(subtitle, w / 2, h * 0.75);
    }
  });
}

function createEntrancePylonTexture() {
  return createCanvasTex(384, 640, (ctx, w, h) => {
    ctx.fillStyle = "#1f2326";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#e0bd66";
    ctx.fillRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = "#262b30";
    ctx.fillRect(24, 24, w - 48, h - 48);

    // Golden round crest medallion
    if (typeof ctx.arc === "function") {
      ctx.beginPath();
      ctx.arc(w / 2, 185, 86, 0, Math.PI * 2);
      ctx.fillStyle = "#d9af4e";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, 185, 70, 0, Math.PI * 2);
      ctx.fillStyle = "#8a222b";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w / 2, 185, 36, 0, Math.PI * 2);
      ctx.fillStyle = "#f2d272";
      ctx.fill();
    }

    ctx.fillStyle = "#f2ce6d";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 38px Georgia, serif";
    ctx.fillText("BẢO TÀNG", w / 2, 345);
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillText("HỒ CHÍ MINH", w / 2, 405);
    ctx.fillStyle = "#ded9cc";
    ctx.font = "600 22px sans-serif";
    ctx.fillText("THÀNH PHỐ HUẾ", w / 2, 472);
    ctx.fillStyle = "#d9af4e";
    ctx.fillRect(72, 515, w - 144, 4);
    ctx.font = "500 20px sans-serif";
    ctx.fillText("7 LÊ LỢI · HUẾ", w / 2, 554);
  });
}

function createHipRoofMesh(width, depth, height, insetX, insetZ, material) {
  const hw = width / 2;
  const hd = depth / 2;
  const tw = Math.max(0.2, hw - insetX);
  const td = Math.max(0.2, hd - insetZ);

  const pos = [
    // Front (+Z) slope
    -hw, 0, hd, hw, 0, hd, tw, height, td,
    -hw, 0, hd, tw, height, td, -tw, height, td,
    // Back (-Z) slope
    hw, 0, -hd, -hw, 0, -hd, -tw, height, -td,
    hw, 0, -hd, -tw, height, -td, tw, height, -td,
    // Left (-X) slope
    -hw, 0, -hd, -hw, 0, hd, -tw, height, td,
    -hw, 0, -hd, -tw, height, td, -tw, height, -td,
    // Right (+X) slope
    hw, 0, hd, hw, 0, -hd, tw, height, -td,
    hw, 0, hd, tw, height, -td, tw, height, td,
    // Top cap
    -tw, height, td, tw, height, td, tw, height, -td,
    -tw, height, td, tw, height, -td, -tw, height, -td,
  ];
  const uvs = [];
  for (let i = 0; i < pos.length / 3; i++) {
    uvs.push(pos[i * 3] / 6 + 0.5, pos[i * 3 + 2] / 6 + 0.5);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function createRoyalPalm(x, y, z, height = 8.4, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.41;

  // Slender tapering ringed grey trunk + smooth green crownshaft
  const lowerH = height * 0.78;
  const crownShaftH = height * 0.22;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.27, lowerH, 9),
    mat("#8d8b80", 0.86),
  );
  trunk.position.y = lowerH / 2;
  trunk.castShadow = true;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.17, crownShaftH, 8),
    mat("#467b36", 0.72),
  );
  shaft.position.y = lowerH + crownShaftH / 2;
  g.add(trunk, shaft);

  const frondMat = mat("#2f702b", 0.72);
  const topY = height;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const tilt = 0.35 + (i % 3) * 0.26;
    const frondPivot = new THREE.Group();
    frondPivot.position.set(0, topY, 0);
    frondPivot.rotation.y = a;
    frondPivot.rotation.x = tilt;
    const arch = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 2.75, 5),
      frondMat,
    );
    arch.scale.set(0.6, 1, 0.22);
    arch.rotation.x = Math.PI / 2;
    arch.position.z = 1.35;
    frondPivot.add(arch);
    g.add(frondPivot);
  }
  return g;
}

function createPottedCycad(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62 * scale, 0.48 * scale, 0.56 * scale, 10),
    mat("#8b6e58", 0.84),
  );
  pot.position.y = 0.28 * scale;
  pot.castShadow = true;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2 * scale, 0.24 * scale, 0.42 * scale, 7),
    mat("#5d4b37", 0.9),
  );
  stem.position.y = 0.7 * scale;
  g.add(pot, stem);

  const leafMat = mat("#33722b", 0.7);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.26 * scale, 1.3 * scale, 4),
      leafMat,
    );
    frond.scale.set(0.65, 1, 0.25);
    frond.position.set(
      Math.cos(a) * 0.58 * scale,
      0.92 * scale,
      Math.sin(a) * 0.58 * scale,
    );
    frond.rotation.y = -a + Math.PI / 2;
    frond.rotation.x = 1.05;
    g.add(frond);
  }
  return g;
}

function createShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.13;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.3 * scale, 2.8 * scale, 7),
    mat("#6a5640", 0.9),
  );
  trunk.position.y = 1.4 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  const canopyColors = ["#2f6f2e", "#3b8035", "#4a8e3e"];
  for (const [ox, oy, oz, r, ci] of [
    [0, 4.1, 0, 2.2, 0],
    [-1.2, 3.6, 0.8, 1.65, 1],
    [1.2, 3.7, -0.7, 1.7, 2],
    [0.2, 4.8, 0.6, 1.55, 1],
  ]) {
    const leaf = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r * scale, 1),
      mat(canopyColors[ci], 0.84),
    );
    leaf.position.set(ox * scale, oy * scale, oz * scale);
    leaf.scale.y = 0.72;
    leaf.castShadow = leaf.receiveShadow = true;
    g.add(leaf);
  }
  return g;
}

function createSedanMesh(x, y, z, yaw, bodyColor) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const body = box([1.78, 0.68, 4.25], bodyColor, [0, 0.52, 0]);
  const cabin = box([1.54, 0.56, 2.05], bodyColor, [0, 1.08, -0.15]);
  const glass = box([1.58, 0.44, 1.82], "#1f2c36", [0, 1.08, -0.15]);
  body.castShadow = cabin.castShadow = true;
  g.add(body, cabin, glass);
  const wheelMat = mat("#1f2226", 0.85);
  const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const wx of [-0.84, 0.84]) {
    for (const wz of [-1.25, 1.25]) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, 0.32, wz);
      g.add(w);
    }
  }
  return g;
}

function createMotorbikeMesh(x, y, z, yaw, color) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  g.add(
    box([0.42, 0.52, 1.45], color, [0, 0.54, 0]),
    box([0.38, 0.14, 0.66], "#232528", [0, 0.84, -0.1]),
    box([0.64, 0.1, 0.12], "#c8cdd2", [0, 0.96, 0.46]),
  );
  const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.12, 8);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const wz of [-0.52, 0.54]) {
    const w = new THREE.Mesh(wheelGeo, mat("#202224", 0.85));
    w.position.set(0, 0.24, wz);
    g.add(w);
  }
  return g;
}

export class HoChiMinhMuseum {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    this.flags = [];
    this.animatedObjects = [];

    const origin = world.biaPark
      ? world.biaPark.toWorld(0, 0)
      : { x: 480.43927587264506, z: -498.0574304452289 };

    // Reuse BiaQuocHocPark's exact Lê Lợi local axis frame when available
    if (world.biaPark) {
      this.toWorld = world.biaPark.toWorld;
      this.toLocal = world.biaPark.toLocal;
    } else {
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

    // Derive frame heading for Three.js group orientation
    const p0 = this.toWorld(0, 0);
    const px = this.toWorld(10, 0);
    const frameHeading = Math.atan2(-(px.z - p0.z), px.x - p0.x);

    this.group = new THREE.Group();
    this.group.name = "ho-chi-minh-museum-campus";
    this.group.position.set(p0.x, 0, p0.z);
    this.group.rotation.y = frameHeading;

    // Exact campus polygon safely clear of Điện Biên Phủ, Service Road 39417236 & Lê Lợi footway
    this.campusPoly = [
      { x: -268.0, z: 36.8 },
      { x: -188.0, z: 36.8 },
      { x: -179.5, z: -28.0 },
      { x: -230.5, z: -28.0 },
    ];

    // Building footprint in local frame (way/240266284)
    this.cx = -211.4;
    this.cz = 8.45;
    this.bWidth = 32.0;
    this.bDepth = 33.0;

    // Twin symmetrical driveway gates facing Lê Lợi
    this.leftGateLocal = { lx: -254.0, lz: 36.8 };
    this.rightGateLocal = { lx: -196.5, lz: 36.8 };
    this.entrance = this.toWorld(this.rightGateLocal.lx, this.rightGateLocal.lz);
    this.gates = [
      this.toWorld(this.leftGateLocal.lx, this.leftGateLocal.lz),
      this.toWorld(this.rightGateLocal.lx, this.rightGateLocal.lz),
    ];

    this.buildGrounds();
    this.buildMuseumBuilding();
    this.buildForecourtAndFountain();
    this.buildParkingShedAndCars();
    this.buildHedgeFenceAndSignboard();
    this.buildLandscaping();

    world.scene.add(this.group);
  }

  inCampus(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    if (lx < -268.5 || lx > -179.0 || lz < -28.5 || lz > 37.2) return false;
    return inside({ x: lx, z: lz }, this.campusPoly);
  }

  buildGrounds() {
    const concreteMat = new THREE.MeshStandardMaterial({
      color: "#d4d7da",
      map: createConcreteCourtyardTexture(),
      roughness: 0.86,
      metalness: 0.04,
    });
    const lawnMat = createManicuredLawnTexture
      ? new THREE.MeshStandardMaterial({
          color: "#5b9a3e",
          map: createManicuredLawnTexture(10, 8, { striped: true, rich: true }),
          roughness: 0.9,
        })
      : mat("#5b9a3e", 0.9);

    // Tapered courtyard polygon extruded as thin concrete slab
    const shape = new THREE.Shape();
    this.campusPoly.forEach((p, idx) => {
      if (idx === 0) shape.moveTo(p.x, -p.z);
      else shape.lineTo(p.x, -p.z);
    });
    shape.closePath();
    const slabGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.22,
      bevelEnabled: false,
    });
    slabGeo.rotateX(-Math.PI / 2);
    const courtyard = new THREE.Mesh(slabGeo, concreteMat);
    courtyard.name = "museum-courtyard-slab";
    courtyard.position.y = 0.01;
    courtyard.receiveShadow = true;
    this.group.add(courtyard);
    this.world.cameraObstacles.push(courtyard);

    // Smooth entry aprons bridging gates to Lê Lợi footway
    for (const gx of [this.leftGateLocal.lx, this.rightGateLocal.lx]) {
      const apron = new THREE.Mesh(
        new THREE.BoxGeometry(8.6, 0.16, 3.6),
        concreteMat,
      );
      apron.position.set(gx, 0.14, 38.4);
      apron.receiveShadow = true;
      this.group.add(apron);
    }

    // Lush backyard & outer side garden strips
    const rearLawn = new THREE.Mesh(
      new THREE.BoxGeometry(44.0, 0.08, 17.5),
      lawnMat,
    );
    rearLawn.position.set(-206.5, 0.24, -18.5);
    rearLawn.receiveShadow = true;
    this.group.add(rearLawn);
  }

  buildMuseumBuilding() {
    const g = new THREE.Group();
    g.name = "ho-chi-minh-museum-building";
    g.position.set(this.cx, 0.23, this.cz);
    this.group.add(g);

    const wallMat = new THREE.MeshStandardMaterial({
      color: "#ebd9e2",
      map: createMuseumWallTexture(),
      roughness: 0.78,
    });
    const whiteTrimMat = mat("#f6f4ef", 0.65);
    const towerMat = mat("#71767c", 0.8);
    const colMat = mat("#7e838a", 0.76);
    const glassMat = new THREE.MeshStandardMaterial({
      color: "#2a3942",
      map: createRibbonWindowTexture(),
      roughness: 0.22,
      metalness: 0.45,
    });
    const redRoofMat = new THREE.MeshStandardMaterial({
      color: "#cc3446",
      map: createCrimsonRoofTexture(),
      roughness: 0.62,
      metalness: 0.08,
    });

    // Raised granite podium under building
    const podium = new THREE.Mesh(
      new THREE.BoxGeometry(33.2, 0.42, 34.0),
      mat("#b7bbc0", 0.85),
    );
    podium.position.y = 0.21;
    podium.receiveShadow = podium.castShadow = true;
    g.add(podium);
    this.world.cameraObstacles.push(podium);

    // Front Crimson Carpeted Entry Steps (+Z faces Lê Lợi)
    const stepsGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const stepD = 2.8 - i * 0.58;
      const stepY = 0.1 + i * 0.11;
      const stoneStep = new THREE.Mesh(
        new THREE.BoxGeometry(10.6, 0.12, stepD),
        mat("#c9cbcf", 0.82),
      );
      stoneStep.position.set(0, stepY, 16.5 + (2.8 - stepD) * 0.5);
      const redCarpet = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 0.13, stepD - 0.04),
        mat("#a82c34", 0.85),
      );
      redCarpet.position.set(0, stepY + 0.01, 16.5 + (2.8 - stepD) * 0.5);
      stepsGroup.add(stoneStep, redCarpet);
    }
    g.add(stepsGroup);

    // Ground Floor Inner Core & Front/Rear Colonnade
    const groundCore = new THREE.Mesh(
      new THREE.BoxGeometry(27.0, 3.7, 25.0),
      wallMat,
    );
    groundCore.position.y = 2.25;
    groundCore.castShadow = groundCore.receiveShadow = true;
    g.add(groundCore);
    this.world.cameraObstacles.push(groundCore);

    // Glazed double lobby entrance
    const lobbyGlass = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 3.1, 0.28),
      glassMat,
    );
    lobbyGlass.position.set(0, 1.95, 12.6);
    g.add(lobbyGlass);

    // Square colonnade piers across ground front & back porticos
    for (const px of [-9.6, -6.0, -2.4, 2.4, 6.0, 9.6]) {
      for (const pz of [15.8, -15.8]) {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.66, 3.75, 0.66),
          colMat,
        );
        col.position.set(px, 2.28, pz);
        col.castShadow = col.receiveShadow = true;
        g.add(col);
      }
    }

    // Chamfered Dark Slate-Grey Corner Towers (4 octagonal/faceted vertical cores)
    const towerGeo = new THREE.CylinderGeometry(4.2, 4.2, 10.3, 8);
    towerGeo.rotateY(Math.PI / 8);
    for (const [tx, tz] of [
      [-12.6, 12.8],
      [12.6, 12.8],
      [-12.6, -12.8],
      [12.6, -12.8],
    ]) {
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.position.set(tx, 5.55, tz);
      tower.castShadow = tower.receiveShadow = true;
      g.add(tower);
      this.world.cameraObstacles.push(tower);

      // Vertical stairwell glass window slit on outward chamfer
      const slit = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 7.8, 0.16),
        glassMat,
      );
      slit.position.set(tx + Math.sign(tx) * 2.7, 5.6, tz + Math.sign(tz) * 2.7);
      slit.rotation.y = Math.atan2(Math.sign(tx), Math.sign(tz));
      g.add(slit);
    }

    // 2nd Floor Pinkish-Lavender Masonry Bands & Continuous Ribbon Windows
    const f2LowerBand = new THREE.Mesh(
      new THREE.BoxGeometry(24.0, 1.35, 32.8),
      wallMat,
    );
    f2LowerBand.position.y = 4.78;
    f2LowerBand.castShadow = f2LowerBand.receiveShadow = true;

    const f2Windows = new THREE.Mesh(
      new THREE.BoxGeometry(23.6, 1.85, 32.4),
      glassMat,
    );
    f2Windows.position.y = 6.32;

    const f2UpperBand = new THREE.Mesh(
      new THREE.BoxGeometry(24.0, 0.85, 32.8),
      wallMat,
    );
    f2UpperBand.position.y = 7.65;
    g.add(f2LowerBand, f2Windows, f2UpperBand);

    // Side ribbon window bands on East & West flanks
    for (const sx of [-1, 1]) {
      const sideWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 3.8, 22.0),
        wallMat,
      );
      sideWall.position.set(sx * 15.8, 5.9, 0);
      const sideGlass = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 1.85, 21.4),
        glassMat,
      );
      sideGlass.position.set(sx * 15.85, 6.32, 0);
      g.add(sideWall, sideGlass);
    }

    // Crisp Front Fascia Sign "BẢO TÀNG HỒ CHÍ MINH - THỪA THIÊN HUẾ"
    const facadeTex = createMuseumSignTexture(
      "BẢO TÀNG HỒ CHÍ MINH",
      "THỪA THIÊN HUẾ",
    );
    const facadeSign = new THREE.Mesh(
      new THREE.PlaneGeometry(14.8, 2.05),
      facadeTex
        ? new THREE.MeshStandardMaterial({ map: facadeTex, roughness: 0.72 })
        : wallMat,
    );
    facadeSign.name = "museum-facade-sign";
    facadeSign.position.set(0, 4.78, 16.46);
    g.add(facadeSign);

    // 3rd Floor Recessed Open Gallery Loggia & Deep Cantilevered White Eave
    const f3Core = new THREE.Mesh(
      new THREE.BoxGeometry(27.0, 2.75, 27.5),
      mat("#372d32", 0.85),
    );
    f3Core.position.y = 9.4;
    const f3Parapet = new THREE.Mesh(
      new THREE.BoxGeometry(24.2, 0.95, 32.8),
      wallMat,
    );
    f3Parapet.position.y = 8.55;
    const f3RoofEave = new THREE.Mesh(
      new THREE.BoxGeometry(35.4, 0.38, 36.2),
      whiteTrimMat,
    );
    f3RoofEave.position.y = 10.65;
    f3RoofEave.castShadow = true;
    g.add(f3Core, f3Parapet, f3RoofEave);

    for (const px of [-9.6, -4.8, 0, 4.8, 9.6]) {
      for (const pz of [16.1, -16.1]) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 2.4, 0.42),
          whiteTrimMat,
        );
        post.position.set(px, 9.45, pz);
        g.add(post);
      }
    }

    // Iconic 2-Tier Crimson-Red Hipped Roof
    const lowerRoof = createHipRoofMesh(36.2, 37.0, 3.85, 11.4, 11.6, redRoofMat);
    lowerRoof.name = "museum-lower-hip-roof";
    lowerRoof.position.y = 10.82;
    g.add(lowerRoof);

    // Clerestory Upper Monitor Tier
    const monitor = new THREE.Mesh(
      new THREE.BoxGeometry(13.6, 1.15, 14.0),
      mat("#f1ede5", 0.72),
    );
    monitor.position.y = 15.05;
    const upperEave = new THREE.Mesh(
      new THREE.BoxGeometry(15.2, 0.28, 15.6),
      whiteTrimMat,
    );
    upperEave.position.y = 15.68;
    const upperRoof = createHipRoofMesh(15.6, 16.0, 2.25, 6.2, 6.4, redRoofMat);
    upperRoof.name = "museum-upper-hip-roof";
    upperRoof.position.y = 15.8;
    const ridgeCap = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.24, 3.4),
      whiteTrimMat,
    );
    ridgeCap.position.y = 18.08;
    g.add(monitor, upperEave, upperRoof, ridgeCap);
  }

  buildForecourtAndFountain() {
    const cx = this.cx;

    // 1. Central Semi-Circular Garden Island & Dark Bronze Fountain (near front hedge)
    const island = new THREE.Group();
    island.name = "museum-fountain-island";
    island.position.set(cx, 0.23, 36.2);

    const islandGrass = new THREE.Mesh(
      new THREE.CylinderGeometry(6.2, 6.4, 0.26, 20, 1, false, Math.PI * 0.5, Math.PI),
      mat("#4d8c37", 0.88),
    );
    islandGrass.rotation.y = Math.PI * 0.5;
    islandGrass.position.y = 0.13;
    island.add(islandGrass);

    // Semi-circular stone border ring & dark ornamental foliage shrubs
    const curb = new THREE.Mesh(
      new THREE.TorusGeometry(6.2, 0.24, 8, 24, Math.PI),
      mat("#474c50", 0.8),
    );
    curb.rotation.x = Math.PI / 2;
    curb.rotation.z = Math.PI;
    curb.position.y = 0.26;
    island.add(curb);

    // Dark Bronze Basin & Monument Urn Centerpiece
    const bronzeMat = mat("#3b342b", 0.42, 0.58);
    const waterMat = new THREE.MeshStandardMaterial({
      color: "#1b4d58",
      roughness: 0.18,
      metalness: 0.35,
    });
    const basin = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.25, 0.42, 16),
      mat("#404448", 0.78),
    );
    basin.position.set(0, 0.28, -2.1);
    const poolWater = new THREE.Mesh(
      new THREE.CylinderGeometry(1.86, 1.86, 0.08, 16),
      waterMat,
    );
    poolWater.position.set(0, 0.48, -2.1);
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.72, 1.35, 12),
      bronzeMat,
    );
    pedestal.position.set(0, 1.05, -2.1);
    const lowerBowl = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 0.42, 0.38, 14),
      bronzeMat,
    );
    lowerBowl.position.set(0, 1.72, -2.1);
    const lotusFinial = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 12, 10),
      bronzeMat,
    );
    lotusFinial.scale.y = 1.45;
    lotusFinial.position.set(0, 2.25, -2.1);
    island.add(basin, poolWater, pedestal, lowerBowl, lotusFinial);
    this.group.add(island);

    // 2. Row of Tall Slender Royal Palms (Hàng cau vua) across front plaza
    for (const [idx, px] of [-251, -242, -233, -224, -216, -206, -198, -191].entries()) {
      this.group.add(createRoyalPalm(px, 0.22, 31.8, 8.2 + (idx % 3) * 0.45, idx));
    }

    // 3. Potted Ornamental Cycads (Chậu vạn tuế) inside the front hedge
    for (const [idx, px] of [-249, -243, -237, -231, -225, -203, -198, -193].entries()) {
      this.group.add(createPottedCycad(px, 0.22, 34.8, 0.95 + (idx % 2) * 0.1));
    }

    // 4. Multi-Colored Ceremonial Flag Row (Cờ hội ngũ sắc & Cờ đỏ)
    const flagColors = ["#c9242e", "#e6b828", "#2369c4", "#2f8f46", "#d8347a", "#c9242e"];
    const poleMat = mat("#c8cdd2", 0.38, 0.72);
    flagColors.forEach((col, i) => {
      const fx = cx - 8.5 + i * 3.4;
      const fz = 29.2;
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.065, 5.4, 8),
        poleMat,
      );
      pole.position.set(fx, 2.9, fz);
      pole.castShadow = true;
      this.group.add(pole);

      const flagGeo = new THREE.PlaneGeometry(1.55, 0.98, 10, 4);
      flagGeo.translate(0.78, 0, 0);
      const basePos = new Float32Array(flagGeo.attributes.position.array);
      const flag = new THREE.Mesh(
        flagGeo,
        new THREE.MeshStandardMaterial({
          color: col,
          side: THREE.DoubleSide,
          roughness: 0.72,
        }),
      );
      flag.userData.basePos = basePos;
      flag.userData.phase = i * 0.7;
      flag.position.set(fx, 5.05, fz);
      flag.rotation.y = Math.PI * 0.18;
      this.group.add(flag);
      this.flags.push(flag);
      this.animatedObjects.push(flag);
    });
  }

  buildParkingShedAndCars() {
    // Covered Parking Shed (Nhà xe mái tôn bên cánh trái)
    const shed = new THREE.Group();
    shed.name = "museum-parking-shed";
    shed.position.set(-251.5, 0.23, 19.5);
    shed.rotation.y = -0.51;

    // Low brick apron
    shed.add(box([15.5, 0.12, 5.8], "#b85c3a", [0, 0.06, 0]));
    for (const px of [-6.8, -2.3, 2.3, 6.8]) {
      for (const pz of [-2.2, 2.2]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.09, 2.65, 6),
          mat("#5a6166", 0.5, 0.55),
        );
        post.position.set(px, 1.32, pz);
        shed.add(post);
      }
    }
    const roof = box([16.2, 0.16, 6.2], "#8f3b3a", [0, 2.75, 0]);
    roof.rotation.x = 0.09;
    roof.castShadow = true;
    shed.add(roof);

    // Parked motorbikes & sedan inside/near shelter
    shed.add(
      createSedanMesh(-4.5, 0.06, 0.2, 0.08, "#e6e8eb"),
      createMotorbikeMesh(1.5, 0.06, 0.1, 0.05, "#b8353b"),
      createMotorbikeMesh(2.6, 0.06, 0.1, -0.04, "#334d72"),
      createMotorbikeMesh(3.7, 0.06, 0.1, 0.02, "#2f3338"),
    );
    this.group.add(shed);

    // Additional visitor cars neatly parked on West & East courtyards
    this.group.add(
      createSedanMesh(-234.5, 0.23, 18.0, 0.38, "#c7ccd1"),
      createSedanMesh(-231.0, 0.23, 25.0, 0.42, "#586674"),
      createSedanMesh(-190.5, 0.23, 26.5, -0.15, "#23282e"),
      createSedanMesh(-191.2, 0.23, -8.5, 0.05, "#d8dce0"),
    );
  }

  buildHedgeFenceAndSignboard() {
    // Lê Lợi Frontage Hedge Line + Twin Gate Piers + Boundary Walls
    const ringWorld = this.campusPoly.map((p) => this.toWorld(p.x, p.z));
    ringWorld.push(ringWorld[0]);
    const extraGate = { ...this.toWorld(this.leftGateLocal.lx, this.leftGateLocal.lz), gap: 8.2 };
    const segments = campusWallSegments(ringWorld, this.entrance, 8.2, [extraGate]);
    this.world.campusWallSegments.push(
      ...segments.map((s) => ({ ...s, schoolId: "ho-chi-minh-museum" })),
    );

    // Front ornamental stone gate piers at Left Gate & Right Gate
    for (const gx of [this.leftGateLocal.lx, this.rightGateLocal.lx]) {
      for (const side of [-4.2, 4.2]) {
        const pier = box([0.66, 1.85, 0.66], "#7a8086", [gx + side, 0.96, 36.8]);
        const cap = box([0.78, 0.18, 0.78], "#c9ccd0", [gx + side, 1.94, 36.8]);
        pier.castShadow = true;
        this.group.add(pier, cap);
      }
    }

    // Lush Manicured Green Hedge Boxes along Lê Lợi frontage
    for (const [x0, x1] of [
      [-267.5, -258.5],
      [-249.5, -217.8],
      [-205.0, -201.0],
      [-192.0, -188.4],
    ]) {
      const len = x1 - x0;
      const hedge = box([len, 0.92, 0.85], "#346927", [(x0 + x1) / 2, 0.62, 36.75]);
      hedge.castShadow = hedge.receiveShadow = true;
      this.group.add(hedge);
    }

    // Perimeter low brick/iron boundary fence along East, West, Rear
    const wallParts = [];
    for (const { a, b } of segments) {
      const ma = this.toLocal(a.x, a.z);
      const mb = this.toLocal(b.x, b.z);
      if (ma.lz > 35.8 && mb.lz > 35.8) continue;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.2) continue;
      const bar = new THREE.BoxGeometry(len, 1.25, 0.26);
      bar.rotateY(Math.atan2(-dz, dx));
      bar.translate((a.x + b.x) / 2, 0.75, (a.z + b.z) / 2);
      wallParts.push(bar);
    }
    if (wallParts.length) {
      const wallMesh = new THREE.Mesh(
        mergeGeometries(wallParts),
        mat("#7c8084", 0.85),
      );
      wallMesh.castShadow = wallMesh.receiveShadow = true;
      this.world.scene.add(wallMesh);
      this.world.cameraObstacles.push(wallMesh);
      wallParts.forEach((p) => p.dispose());
    }

    // Iconic Vertical Golden Architectural Signboard near Right Gate
    const pylon = new THREE.Group();
    pylon.name = "museum-entrance-pylon";
    pylon.position.set(-189.6, 0.22, 35.6);
    pylon.rotation.y = 0.08;
    pylon.add(
      box([2.5, 0.35, 0.9], "#3a3e42", [0, 0.175, 0]),
      box([2.25, 3.7, 0.42], "#25292d", [0, 2.15, 0]),
    );
    const pylonTex = createEntrancePylonTexture();
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(2.15, 3.56),
      pylonTex
        ? new THREE.MeshStandardMaterial({ map: pylonTex, roughness: 0.45 })
        : mat("#d9af4e"),
    );
    face.position.set(0, 2.15, 0.22);
    const backFace = face.clone();
    backFace.rotation.y = Math.PI;
    backFace.position.z = -0.22;
    pylon.add(face, backFace);
    this.group.add(pylon);
  }

  buildLandscaping() {
    // Lush Hue Shade Trees framing outer edges & rear garden (center sightline clear!)
    const treeSpecs = [
      // West border behind parking shed
      [-255, 29, 1.15],
      [-245, 28, 1.05],
      [-240, 2, 1.28],
      [-236, -12, 1.2],
      // East border flanking courtyard
      [-186, 20, 1.18],
      [-185, 6, 1.25],
      [-184, -8, 1.22],
      [-183, -21, 1.16],
      // Rear garden bordering Sông Hương direction
      [-222, -19, 1.2],
      [-210, -21, 1.3],
      [-196, -20, 1.24],
    ];
    treeSpecs.forEach(([tx, tz, sc], idx) => {
      this.group.add(createShadeTree(tx, 0.22, tz, sc, idx + 1));
    });

    // Sculpted ornamental bonsai planter near right museum wall
    for (const [bx, bz] of [
      [-190.5, 13.5],
      [-190.5, 8.0],
    ]) {
      this.group.add(createPottedCycad(bx, 0.22, bz, 1.25));
    }
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.2) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Front entry steps up toward lobby
    if (
      Math.abs(lx - this.cx) <= 5.2 &&
      lz >= 23.0 &&
      lz <= 26.5
    ) {
      const t = Math.max(0, Math.min(1, (26.5 - lz) / 3.5));
      return 0.24 + t * 0.42;
    }
    return 0.23;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Block Main Museum Building Footprint
    if (
      Math.abs(lx - this.cx) <= 16.5 &&
      lz >= this.cz - 16.8 &&
      lz <= this.cz + 16.8
    ) {
      return false;
    }
    // Block Central Semi-Circular Fountain Island
    if (Math.hypot(lx - this.cx, lz - 36.2) < 6.4 && lz <= 36.6) return false;
    // Block Entrance Pylon & Shed Pillars
    if (Math.hypot(lx + 189.6, lz - 35.6) < 1.8) return false;
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCampus(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inCampus(wx, wz)) return true;
    const { lx, lz } = this.toLocal(wx, wz);
    // Protect Lê Lợi gate approaches & front sightline
    if (lz >= 34 && lz <= 43 && lx >= -265 && lx <= -186) return true;
    return false;
  }

  update(time) {
    for (const flag of this.flags) {
      const posAttr = flag.geometry.attributes.position;
      const basePos = flag.userData.basePos;
      if (!basePos) continue;
      const phase = flag.userData.phase || 0;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const factor = Math.max(0, bx / 1.55);
        posAttr.setZ(
          i,
          Math.sin(bx * 3.4 - time * 4.5 + by * 1.2 + phase) * 0.14 * factor,
        );
      }
      posAttr.needsUpdate = true;
    }
  }
}
