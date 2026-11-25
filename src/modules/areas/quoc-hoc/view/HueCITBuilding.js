import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import {
  campusWallSegments,
  hitsCampusWall,
} from "../../../../core/shared/architecture/CampusWalls.js";
import {
  filterSegmentsClearOfRoads,
  insetRingClearOfRoads,
} from "../../../../core/world/streetPlacement.js";

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

function createCobblestoneTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#b8b4aa";
      ctx.fillRect(0, 0, w, h);
      const bw = 32;
      const bh = 16;
      for (let r = 0; r < h / bh; r++) {
        const offset = (r % 2) * (bw / 2);
        for (let c = -1; c < w / bw + 1; c++) {
          const shade = ((r * 13 + c * 7) % 5) * 4 - 8;
          ctx.fillStyle = `rgb(${182 + shade}, ${178 + shade}, ${168 + shade})`;
          ctx.fillRect(c * bw + offset + 1, r * bh + 1, bw - 2, bh - 2);
        }
      }
      ctx.strokeStyle = "rgba(92, 88, 80, 0.3)";
      ctx.lineWidth = 1;
      for (let y = 0; y <= h; y += bh) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
    },
    10,
    12,
  );
}

function createCurtainGridTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#799ab0";
      ctx.fillRect(0, 0, w, h);
      const cols = 6;
      const rows = 5;
      const cw = w / cols;
      const ch = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cw;
          const y = r * ch;
          ctx.fillStyle = r % 2 === 0 ? "#8db0c4" : "#6c8ea3";
          ctx.fillRect(x + 3, y + 3, cw - 6, ch - 6);
        }
      }
      ctx.strokeStyle = "#dce4ea";
      ctx.lineWidth = 4;
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cw, 0);
        ctx.lineTo(c * cw, h);
        ctx.stroke();
      }
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        ctx.moveTo(0, r * ch);
        ctx.lineTo(w, r * ch);
        ctx.stroke();
      }
    },
    1,
    1,
  );
}

function createBannerTexture(title, subtitle, accentColor, bgColor = "#f7f8fa") {
  return createCanvasTex(512, 128, (ctx, w, h) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = accentColor;
    ctx.fillRect(0, 0, 26, h);
    ctx.fillRect(w - 26, 0, 26, h);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, w - 8, h - 8);
    ctx.fillStyle = accentColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(title, w / 2, h * 0.4);
    ctx.fillStyle = "#2b333d";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(subtitle, w / 2, h * 0.74);
  });
}

function createPortalSignTexture() {
  return createCanvasTex(768, 160, (ctx, w, h) => {
    ctx.fillStyle = "#195c9e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e6eef6";
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 48px sans-serif";
    ctx.fillText("HUECIT · TRUNG TÂM CNTT", w / 2, h * 0.42);
    ctx.fillStyle = "#d9ecff";
    ctx.font = "600 28px sans-serif";
    ctx.fillText("6 LÊ LỢI · THÀNH PHỐ HUẾ", w / 2, h * 0.76);
  });
}

function createPoincianaTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.37;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.3 * scale, 3.0 * scale, 7),
    mat("#6a5643", 0.9),
  );
  trunk.position.y = 1.5 * scale;
  trunk.castShadow = true;
  g.add(trunk);

  const canopy = new THREE.Mesh(
    new THREE.DodecahedronGeometry(2.6 * scale, 1),
    mat("#3b7c2f", 0.85),
  );
  canopy.position.set(0, 4.1 * scale, 0);
  canopy.scale.set(1.3, 0.56, 1.3);
  canopy.castShadow = true;
  g.add(canopy);

  // Flame-red Poinciana blossom clusters
  const bloomMat = mat("#dc3826", 0.75);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6;
    const bloom = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55 * scale, 0),
      bloomMat,
    );
    bloom.position.set(
      Math.cos(a) * 1.45 * scale,
      4.55 * scale,
      Math.sin(a) * 1.45 * scale,
    );
    bloom.scale.set(1.2, 0.5, 1.2);
    g.add(bloom);
  }
  return g;
}

function createWhiteVan(x, y, z, yaw) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const body = box([1.85, 1.45, 4.7], "#eef1f4", [0, 0.96, 0]);
  const windows = box([1.88, 0.58, 3.3], "#24313b", [0, 1.25, -0.15]);
  const bumper = box([1.9, 0.24, 4.82], "#3c4146", [0, 0.34, 0]);
  body.castShadow = true;
  g.add(body, windows, bumper);
  const wGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.22, 10);
  wGeo.rotateZ(Math.PI / 2);
  const wMat = mat("#202226", 0.86);
  for (const wx of [-0.88, 0.88]) {
    for (const wz of [-1.45, 1.45]) {
      const w = new THREE.Mesh(wGeo, wMat);
      w.position.set(wx, 0.32, wz);
      g.add(w);
    }
  }
  return g;
}

export class HueCITBuilding {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    this.flags = [];
    this.animatedObjects = [];

    const origin = world.biaPark
      ? world.biaPark.toWorld(0, 0)
      : { x: 480.43927587264506, z: -498.0574304452289 };

    if (world.biaPark) {
      this.biaToWorld = world.biaPark.toWorld;
      this.biaToLocal = world.biaPark.toLocal;
    } else {
      const heading = 41.69 * (Math.PI / 180);
      const cosY = Math.cos(heading);
      const sinY = Math.sin(heading);
      this.biaToWorld = (lx, lz) => ({
        x: origin.x + lx * cosY + lz * sinY,
        z: origin.z - lx * sinY + lz * cosY,
      });
      this.biaToLocal = (wx, wz) => {
        const dx = wx - origin.x;
        const dz = wz - origin.z;
        return {
          lx: dx * cosY - dz * sinY,
          lz: dx * sinY + dz * cosY,
        };
      };
    }

    const p0 = this.biaToWorld(0, 0);
    const px = this.biaToWorld(10, 0);
    this.biaHeading = Math.atan2(-(px.z - p0.z), px.x - p0.x);

    // BiaLocal wrapper functions match UbndHuePalace API cleanly
    this.toWorld = this.biaToWorld;
    this.toLocal = this.biaToLocal;

    this.group = new THREE.Group();
    this.group.name = "hue-cit-campus";
    this.group.position.set(p0.x, 0, p0.z);
    this.group.rotation.y = this.biaHeading;

    // Campus perimeter cleanly tucked between Khoa Quốc Tế (-236.5), Trần Thúc Nhẫn (-191..-208) and Lê Lợi (56.6)
    const rawLocalPoly = [
      { x: -236.5, z: 56.6 },
      { x: -191.5, z: 56.6 },
      { x: -208.5, z: 134.0 },
      { x: -242.0, z: 134.0 },
    ];

    // Building local basis matched exactly to OSM way/354775345
    // Front faces toward Lê Lợi (-uZ), right wing (+uX) toward Trần Thúc Nhẫn
    this.bCenter = { lx: -220.91, lz: 106.66 };
    // In front-facing building frame: +X = left (from building's view toward Trần Thúc Nhẫn), +Z = toward Lê Lợi (-depthDir)
    this.uRight = { x: 0.9775, z: 0.2109 }; // +lx (East toward Trần Thúc Nhẫn)
    this.uDepth = { x: -0.211, z: 0.9775 }; // +lz (away from Lê Lợi)
    this.bWidth = 23.8;
    this.bDepth = 33.3;

    const insetWorldPoly = insetRingClearOfRoads(
      rawLocalPoly.map((p) => this.toWorld(p.x, p.z)),
      world?.renderRoads,
      2.3,
      { centerHint: this.toWorld(this.bCenter.lx, this.bCenter.lz) },
    );
    this.campusPoly = insetWorldPoly.map((w) => {
      const l = this.toLocal(w.x, w.z);
      return { x: l.lx, z: l.lz };
    });

    // Wide entrance gate along Lê Lợi cobblestone plaza
    const gateHit = nearestPoint(this.toWorld(-215.5, 56.6), insetWorldPoly);
    this.entrance = { x: gateHit.x, z: gateHit.z };
    this.gateLocal = this.toLocal(this.entrance.x, this.entrance.z);

    this.buildCourtyardGrounds();
    this.buildMainPavilion();
    this.buildPerimeterBlueFenceAndProps();

    world.scene.add(this.group);
  }

  bToBia(bx, bz) {
    return {
      lx: this.bCenter.lx + bx * this.uRight.x + bz * this.uDepth.x,
      lz: this.bCenter.lz + bx * this.uRight.z + bz * this.uDepth.z,
    };
  }

  biaToB(lx, lz) {
    const dx = lx - this.bCenter.lx;
    const dz = lz - this.bCenter.lz;
    return {
      bx: dx * this.uRight.x + dz * this.uRight.z,
      bz: dx * this.uDepth.x + dz * this.uDepth.z,
    };
  }

  inCampus(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    if (lx < -243 || lx > -190 || lz < 56 || lz > 135) return false;
    return inside({ x: lx, z: lz }, this.campusPoly);
  }

  buildCourtyardGrounds() {
    const cobbleMat = new THREE.MeshStandardMaterial({
      color: "#cfcbc0",
      map: createCobblestoneTexture(),
      roughness: 0.88,
      metalness: 0.03,
    });

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
    const courtyard = new THREE.Mesh(slabGeo, cobbleMat);
    courtyard.name = "hue-cit-cobblestone-courtyard";
    courtyard.position.y = 0.01;
    courtyard.receiveShadow = true;
    this.group.add(courtyard);
    this.world.cameraObstacles.push(courtyard);

    // Entry cobblestone apron connecting Lê Lợi footway to front gate
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(10.8, 0.16, 3.6),
      cobbleMat,
    );
    apron.position.set(this.gateLocal.lx, 0.14, this.gateLocal.lz - 1.4);
    apron.receiveShadow = true;
    this.group.add(apron);
  }

  buildMainPavilion() {
    const bGroup = new THREE.Group();
    bGroup.name = "hue-cit-main-building";
    bGroup.position.set(this.bCenter.lx, 0.23, this.bCenter.lz);
    bGroup.rotation.y = -Math.atan2(this.uRight.z, this.uRight.x);
    this.group.add(bGroup);

    const blueStuccoMat = mat("#a8c7e4", 0.78);
    const cobaltMat = mat("#1f68b8", 0.55);
    const whiteMat = mat("#f6f7f9", 0.65);
    const glassGridMat = new THREE.MeshStandardMaterial({
      color: "#7ca2b8",
      map: createCurtainGridTexture(),
      roughness: 0.24,
      metalness: 0.35,
    });
    const darkStepMat = mat("#42464a", 0.82);

    // Note: Building local space: -Z points toward Lê Lợi (front), +X points East (left in photo view!), -X points West (right in photo view!)
    // 1. Dark Granite Steps & Ground Podium
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(23.6, 0.72, 33.0),
      mat("#c8cdd2", 0.84),
    );
    plinth.position.set(0, 0.36, 0);
    plinth.receiveShadow = true;
    bGroup.add(plinth);
    this.world.cameraObstacles.push(plinth);

    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(12.2, 0.14, 2.8 - s * 0.46),
        darkStepMat,
      );
      step.position.set(0, 0.08 + s * 0.14, -17.3 + s * 0.22);
      bGroup.add(step);
    }

    // 2. Main 4-Story Structural Core
    const rearCore = new THREE.Mesh(
      new THREE.BoxGeometry(22.4, 15.0, 29.0),
      blueStuccoMat,
    );
    rearCore.position.set(0, 7.8, 1.8);
    rearCore.castShadow = rearCore.receiveShadow = true;
    bGroup.add(rearCore);
    this.world.cameraObstacles.push(rearCore);

    // Dark recessed lobby entrance & ground office glass windows
    const lobbyDark = box([6.6, 3.3, 0.4], "#1f2429", [0, 2.35, -12.8]);
    bGroup.add(lobbyDark);
    for (const wx of [-8.0, 8.0]) {
      const gw = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 2.55, 0.25),
        glassGridMat,
      );
      gw.position.set(wx, 2.35, -12.75);
      bGroup.add(gw);
    }

    // Center recessed stairwell glass curtain wall (Floors 2, 3, 4)
    for (const fy of [6.1, 9.8, 13.4]) {
      const centerWin = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 2.75, 0.28),
        glassGridMat,
      );
      centerWin.position.set(0, fy, -12.75);
      bGroup.add(centerWin);
    }

    // Tall Cylindrical White Pillars flanking front facade bays (4 pairs)
    const colGeo = new THREE.CylinderGeometry(0.42, 0.44, 15.2, 12);
    for (const cx of [-10.4, -3.5, 3.5, 10.4]) {
      const frontCol = new THREE.Mesh(colGeo, whiteMat);
      frontCol.position.set(cx, 7.9, -15.6);
      frontCol.castShadow = true;
      bGroup.add(frontCol);
    }

    // Floors 2, 3, 4 Wing Balconies + Cobalt-Blue Beams + Projecting Blue Fin Brackets
    for (const [floorIdx, fy] of [4.2, 7.85, 11.55].entries()) {
      for (const sx of [-1, 1]) {
        const wingX = sx * 7.0;
        // Floor slab edge beam in iconic cobalt blue
        const slab = box([7.4, 0.42, 3.6], "#1f68b8", [wingX, fy, -14.1]);
        // White slatted railing
        const rail = box([6.9, 0.88, 0.14], "#f4f6f8", [wingX, fy + 0.64, -15.65]);
        // Angular blue projecting gusset brackets along outer edges
        const fin = box([0.28, 0.85, 1.15], "#1f68b8", [sx * 10.75, fy + 0.15, -15.7]);
        fin.rotation.x = 0.35;
        // Inner gallery office window
        const wingWin = new THREE.Mesh(
          new THREE.BoxGeometry(4.8, 2.15, 0.25),
          glassGridMat,
        );
        wingWin.position.set(wingX, fy + 1.55, -12.75);
        bGroup.add(slab, rail, fin, wingWin);

        // Promotional Aptech / Arena Multimedia banners on 3rd-floor rail
        if (floorIdx === 1) {
          const bTex = createBannerTexture(
            sx > 0 ? "APTECH" : "ARENA",
            sx > 0 ? "LẬP TRÌNH VIÊN QUỐC TẾ" : "MULTIMEDIA DESIGN",
            sx > 0 ? "#8a2248" : "#c73828",
          );
          const banner = new THREE.Mesh(
            new THREE.PlaneGeometry(5.6, 0.92),
            bTex
              ? new THREE.MeshStandardMaterial({ map: bTex, roughness: 0.55 })
              : whiteMat,
          );
          banner.name = sx > 0 ? "hue-cit-aptech-banner" : "hue-cit-arena-banner";
          banner.position.set(wingX, fy + 0.66, -15.74);
          banner.rotation.y = Math.PI;
          bGroup.add(banner);
        }
      }
    }

    // 3. Sweeping Winged White Roof + Central Pitched Gable Truss (exact match to image_a8ee24a9.png)
    const roofGroup = new THREE.Group();
    roofGroup.name = "hue-cit-winged-roof";
    roofGroup.position.set(0, 15.65, -1.0);
    bGroup.add(roofGroup);

    // Center pitched white gable slopes
    for (const sx of [-1, 1]) {
      const centerSlope = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 0.35, 36.2),
        whiteMat,
      );
      centerSlope.position.set(sx * 2.95, 1.8, 0);
      centerSlope.rotation.z = -sx * 0.42;
      centerSlope.castShadow = true;
      roofGroup.add(centerSlope);

      // Winged flaring cantilever eaves extending left & right
      const wingSlope = new THREE.Mesh(
        new THREE.BoxGeometry(9.4, 0.34, 35.8),
        whiteMat,
      );
      wingSlope.position.set(sx * 9.8, 0.72, 0);
      wingSlope.rotation.z = sx * 0.14;
      wingSlope.castShadow = true;
      roofGroup.add(wingSlope);
    }

    // Open triangular gable truss struts under center peak
    const trussBar = box([9.8, 0.18, 0.18], "#dce2e8", [0, 0.55, -16.2]);
    const strutL = box([0.16, 1.85, 0.16], "#dce2e8", [-1.6, 1.4, -16.2]);
    strutL.rotation.z = -0.35;
    const strutR = box([0.16, 1.85, 0.16], "#dce2e8", [1.6, 1.4, -16.2]);
    strutR.rotation.z = 0.35;
    roofGroup.add(trussBar, strutL, strutR);

    // 4. Iconic Concrete A-Frame / V-Arch Entrance Canopy & Glass Skylight Pyramid
    const archGroup = new THREE.Group();
    archGroup.name = "hue-cit-v-arch-canopy";
    bGroup.add(archGroup);

    // Lawn islands under the 2 sweeping V-arch feet
    for (const sx of [-1, 1]) {
      const grassFoot = new THREE.Mesh(
        new THREE.BoxGeometry(4.4, 0.16, 5.2),
        mat("#4e8d34", 0.9),
      );
      grassFoot.position.set(sx * 9.6, 0.09, -25.8);
      archGroup.add(grassFoot);

      // Sweeping diagonal light-grey concrete leg from ground to porch roof
      const legLen = Math.hypot(5.8, 4.45);
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(legLen, 0.72, 1.45),
        mat("#cfd4d8", 0.78),
      );
      leg.position.set(sx * 7.6, 2.38, -23.6);
      leg.rotation.z = -sx * Math.atan2(4.45, 5.6);
      leg.rotation.y = sx * 0.42;
      leg.castShadow = leg.receiveShadow = true;
      archGroup.add(leg);
    }

    // Flat horizontal concrete canopy bridge slab (y = 4.6)
    const canopySlab = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 0.52, 6.2),
      mat("#d2d7db", 0.76),
    );
    canopySlab.position.set(0, 4.65, -20.2);
    canopySlab.castShadow = true;
    archGroup.add(canopySlab);

    // Triangular Glass & Steel Space-Frame Skylight Pyramid above canopy
    const pyrGeo = new THREE.ConeGeometry(4.4, 2.75, 4);
    pyrGeo.rotateY(Math.PI / 4);
    const glassPyr = new THREE.Mesh(
      pyrGeo,
      new THREE.MeshStandardMaterial({
        color: "#a7cadc",
        roughness: 0.18,
        metalness: 0.35,
        transparent: true,
        opacity: 0.68,
      }),
    );
    glassPyr.position.set(0, 6.22, -20.0);
    glassPyr.scale.set(1.25, 1, 1.0);
    const pyrWire = new THREE.Mesh(
      pyrGeo,
      new THREE.MeshStandardMaterial({
        color: "#eef2f5",
        wireframe: true,
      }),
    );
    pyrWire.position.copy(glassPyr.position);
    pyrWire.scale.copy(glassPyr.scale);
    archGroup.add(glassPyr, pyrWire);

    // Waving Red-Gold National Flag at Canopy Center
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.05, 4.2, 8),
      mat("#d8dee3", 0.35, 0.75),
    );
    pole.position.set(0, 6.9, -22.2);
    archGroup.add(pole);
    const flagGeo = new THREE.PlaneGeometry(1.5, 0.96, 10, 4);
    flagGeo.translate(0.75, 0, 0);
    const basePos = new Float32Array(flagGeo.attributes.position.array);
    const flag = new THREE.Mesh(
      flagGeo,
      new THREE.MeshStandardMaterial({
        color: "#c92028",
        side: THREE.DoubleSide,
        roughness: 0.7,
      }),
    );
    flag.userData.basePos = basePos;
    flag.position.set(0, 8.45, -22.2);
    flag.rotation.y = Math.PI * 0.25;
    archGroup.add(flag);
    this.flags.push(flag);
    this.animatedObjects.push(flag);
  }

  buildPerimeterBlueFenceAndProps() {
    const ringWorld = this.campusPoly.map((p) => this.toWorld(p.x, p.z));
    ringWorld.push(ringWorld[0]);
    const segments = filterSegmentsClearOfRoads(
      campusWallSegments(ringWorld, this.entrance, 9.6),
      this.world?.renderRoads,
      2.15,
    );
    this.wallSegments = segments;
    this.world.campusWallSegments.push(
      ...segments.map((s) => ({ ...s, schoolId: "hue-cit" })),
    );

    const plinthParts = [];
    const picketParts = [];
    const railParts = [];
    const westWallParts = [];

    const makeBar = (a, b, h, w, y) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const g = new THREE.BoxGeometry(Math.hypot(dx, dz), h, w);
      g.rotateY(Math.atan2(-dz, dx));
      g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      return g;
    };

    for (const { a, b } of segments) {
      const ma = this.toLocal(a.x, a.z);
      const mb = this.toLocal(b.x, b.z);
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      if (len < 0.2) continue;

      // White masonry separating wall along West boundary (Khoa Quốc Tế side, right side of image_a8ee24a9.png)
      if (ma.lx < -234 && mb.lx < -234) {
        westWallParts.push(makeBar(a, b, 2.2, 0.3, 1.1));
        continue;
      }

      // Iconic Sky-Blue Iron Picket Fence on cream plinth along Lê Lợi & Trần Thúc Nhẫn!
      plinthParts.push(makeBar(a, b, 0.55, 0.34, 0.38));
      railParts.push(makeBar(a, b, 0.06, 0.06, 0.9));
      railParts.push(makeBar(a, b, 0.06, 0.06, 1.78));
      for (let d = 0.25; d < len; d += 0.35) {
        const t = d / len;
        const px = a.x + (b.x - a.x) * t;
        const pz = a.z + (b.z - a.z) * t;
        const bar = new THREE.BoxGeometry(0.04, 1.15, 0.04);
        bar.translate(px, 1.28, pz);
        picketParts.push(bar);
      }
    }

    const addBatch = (parts, color, rough = 0.65, metal = 0.25) => {
      if (!parts.length) return;
      const mesh = new THREE.Mesh(
        mergeGeometries(parts),
        mat(color, rough, metal),
      );
      mesh.castShadow = mesh.receiveShadow = true;
      this.world.scene.add(mesh);
      this.world.cameraObstacles.push(mesh);
      parts.forEach((p) => p.dispose());
    };
    addBatch(plinthParts, "#eaecf0", 0.85, 0.05);
    addBatch(westWallParts, "#f2f3f5", 0.82, 0.05);
    addBatch(railParts, "#227bc7", 0.45, 0.55);
    addBatch(picketParts, "#227bc7", 0.45, 0.55);

    // Gate Piers & HueCIT Signboard at Lê Lợi Entrance
    for (const gx of [this.gateLocal.lx - 4.9, this.gateLocal.lx + 4.9]) {
      this.group.add(
        box([0.65, 2.4, 0.65], "#eef1f4", [gx, 1.2, this.gateLocal.lz]),
        box([0.78, 0.22, 0.78], "#227bc7", [gx, 2.45, this.gateLocal.lz]),
      );
    }
    const signTex = createPortalSignTexture();
    const portalSign = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 1.1, 0.2),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
        : mat("#195c9e"),
    );
    portalSign.name = "hue-cit-entrance-sign";
    portalSign.position.set(this.gateLocal.lx + 7.4, 1.65, this.gateLocal.lz - 0.3);
    this.group.add(portalSign);

    // Sculpted Natural Boulder Stone ("Đá phong thủy") & Bench on left lawn edge
    const boulderPos = this.bToBia(11.6, -24.8);
    const boulder = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.15, 0),
      mat("#585b5e", 0.9),
    );
    boulder.name = "hue-cit-boulder";
    boulder.scale.set(0.95, 1.45, 0.75);
    boulder.position.set(boulderPos.lx, 1.1, boulderPos.lz);
    boulder.castShadow = true;
    this.group.add(boulder);

    // Parked White Service Van on left forecourt (like image_a8ee24a9.png)
    const vanPos = this.bToBia(14.5, -16.0);
    this.group.add(createWhiteVan(vanPos.lx, 0.22, vanPos.lz, -0.25));

    // Flowering Bougainvillea Bed, Mushroom Lamps & Royal Poinciana Trees
    this.group.add(
      createPoincianaTree(-199.5, 0.22, 65.5, 1.22, 1),
      createPoincianaTree(-204.5, 0.22, 74.0, 1.08, 2),
      createPoincianaTree(-233.2, 0.22, 64.5, 1.15, 4),
    );

    // Green hedge strips + red flower dots framing East & West front borders
    for (const [bx, bz] of [
      [-199.0, 61.2],
      [-232.0, 62.0],
    ]) {
      this.group.add(
        box([4.2, 0.65, 1.4], "#3e782b", [bx, 0.55, bz]),
        box([0.28, 0.28, 0.28], "#df384b", [bx - 0.8, 0.92, bz]),
        box([0.28, 0.28, 0.28], "#df384b", [bx + 0.9, 0.92, bz - 0.2]),
      );
    }

    // White garden pedestal light poles along right side of courtyard
    for (const bz of [63.5, 72.5, 81.5]) {
      const lamp = new THREE.Group();
      lamp.position.set(-234.0, 0.22, bz);
      lamp.add(
        box([0.1, 2.8, 0.1], "#cdd3d8", [0, 1.4, 0]),
        new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 8, 6),
          new THREE.MeshStandardMaterial({
            color: "#fff4d1",
            emissive: "#ffd57a",
            emissiveIntensity: 0.75,
          }),
        ).translateY(2.85),
      );
      this.group.add(lamp);
    }
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.2) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    const { bx, bz } = this.biaToB(lx, lz);
    if (Math.abs(bx) <= 6.2 && bz >= -18.8 && bz <= -15.6) {
      const t = Math.max(0, Math.min(1, (bz + 18.8) / 3.2));
      return 0.23 + t * 0.68;
    }
    return 0.23;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    const { bx, bz } = this.biaToB(lx, lz);
    // Block Main Building Core
    if (Math.abs(bx) <= 11.8 && bz >= -16.2 && bz <= 16.5) return false;
    // Block V-Arch Foot Lawns & Boulder
    if (Math.abs(Math.abs(bx) - 9.6) <= 2.3 && bz >= -28.4 && bz <= -23.2) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCampus(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inCampus(wx, wz)) return true;
    if (
      this.wallSegments &&
      hitsCampusWall({ x: wx, z: wz }, this.wallSegments, 2.4)
    ) {
      return true;
    }
    const { lx, lz } = this.toLocal(wx, wz);
    return lx >= -236 && lx <= -196 && lz >= 50 && lz <= 60;
  }

  update(time) {
    for (const flag of this.flags) {
      const posAttr = flag.geometry.attributes.position;
      const basePos = flag.userData.basePos;
      if (!basePos) continue;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const factor = Math.max(0, bx / 1.5);
        posAttr.setZ(
          i,
          Math.sin(bx * 3.5 - time * 4.8 + by * 1.1) * 0.14 * factor,
        );
      }
      posAttr.needsUpdate = true;
    }
  }
}
