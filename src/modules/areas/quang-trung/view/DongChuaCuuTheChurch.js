import * as THREE from "three";
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
import { hitsCampusWall } from "../../../../core/shared/architecture/CampusWalls.js";

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

function createColonialMonasteryTexture() {
  return createCanvasTexture(512, 384, (ctx, w, h) => {
    // Classic warm cream-ochre French colonial monastery stucco (image_d57e1084.png)
    ctx.fillStyle = "#e8d6a8";
    ctx.fillRect(0, 0, w, h);

    // Subtle lime plaster shading
    for (let i = 0; i < 320; i++) {
      ctx.fillStyle =
        i % 2 === 0 ? "rgba(255,250,235,0.09)" : "rgba(150,120,70,0.06)";
      ctx.fillRect((i * 179) % w, (i * 257) % h, 6, 4);
    }

    // Dark stone base plinth & crisp horizontal stringcourse moldings
    ctx.fillStyle = "#6c675e";
    ctx.fillRect(0, h - 34, w, 34);
    ctx.fillStyle = "#f4ebd2";
    ctx.fillRect(0, h / 2 - 8, w, 14);
    ctx.fillRect(0, 0, w, 16);

    const floors = [0, 1];
    const floorH = (h - 34) / 2;
    for (const f of floors) {
      const topY = f * floorH;
      const winY = topY + 34;
      const winH = floorH - 54;
      for (const wx of [34, 152, 270, 388]) {
        // Pale cream recessed arch frame + deep dark colonial shuttered openings
        ctx.fillStyle = "#f5edd8";
        ctx.fillRect(wx - 5, winY - 5, 96, winH + 10);
        ctx.fillStyle = "#221b18";
        ctx.fillRect(wx, winY, 86, winH);
        ctx.beginPath?.();
        ctx.arc?.(wx + 43, winY + 12, 43, Math.PI, 0);
        ctx.fill?.();

        // Pilasters flanking bays
        ctx.fillStyle = "#dcc692";
        ctx.fillRect(wx - 22, topY + 14, 12, floorH - 18);
      }
    }
  });
}

function createMonasteryPedimentTexture() {
  return createCanvasTexture(512, 224, (ctx, w, h) => {
    ctx.fillStyle = "#e4cf9c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#b49b68";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#4d3c28";
    ctx.font = "bold 40px 'Be Vietnam Pro', Georgia, serif";
    ctx.fillText("DÒNG CHÚA CỨU THẾ", w / 2, h * 0.34, w - 40);
    ctx.fillStyle = "#5c4a34";
    ctx.font = "bold 30px Georgia, serif";
    ctx.fillText("LES PÈRES RÉDEMPTORISTES", w / 2, h * 0.69, w - 40);
  });
}

function createBasilicaStoneTexture() {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#e5d7b4";
    ctx.fillRect(0, 0, w, h);

    // Subtle limestone ashlar joints
    ctx.strokeStyle = "rgba(140, 122, 88, 0.25)";
    ctx.lineWidth = 2;
    for (let y = 0; y < h; y += 32) {
      ctx.beginPath?.();
      ctx.moveTo?.(0, y);
      ctx.lineTo?.(w, y);
      ctx.stroke?.();
    }

    // Carved ground-floor limestone plinth & dado molding so windows sit gracefully above stairs
    ctx.fillStyle = "#b8ab92";
    ctx.fillRect(0, h - 118, w, 118);
    ctx.fillStyle = "#f2ead6";
    ctx.fillRect(0, h - 124, w, 10);
    ctx.fillStyle = "#6c655a";
    ctx.fillRect(0, h - 22, w, 22);

    // Tall cobalt-blue Gothic stained-glass lancet windows above ground plinth
    for (const wx of [44, 184, 324, 444]) {
      const ww = wx === 444 ? 48 : 88;
      ctx.fillStyle = "#f5efdd";
      ctx.fillRect(wx - 6, 48, ww + 12, h - 186);
      ctx.fillStyle = "#195eb8";
      ctx.fillRect(wx, 54, ww, h - 198);
      ctx.fillStyle = "#4fa2f0";
      ctx.fillRect(wx + ww * 0.18, 70, ww * 0.64, h - 230);
      ctx.fillStyle = "#eef4fa";
      ctx.fillRect(wx + ww * 0.46, 58, 5, h - 206);
      ctx.fillRect(wx + 4, 186, ww - 8, 5);
    }
  });
}

function createSilverFenceTexture() {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#485645";
    ctx.fillRect(0, 0, w, h);

    // Split stone low coping wall at bottom (matching image_d57e1084.png)
    ctx.fillStyle = "#6e685f";
    ctx.fillRect(0, 198, w, 58);
    ctx.fillStyle = "#918a7e";
    ctx.fillRect(0, 192, w, 8);

    // Silver-grey ornamental wrought-iron railings
    ctx.fillStyle = "#cfd5da";
    ctx.fillRect(0, 38, w, 9);
    ctx.fillRect(0, 168, w, 9);
    for (let x = 10; x < w; x += 24) {
      ctx.fillRect(x, 12, 8, 180);
      ctx.beginPath?.();
      ctx.arc?.(x + 4, 12, 5, 0, Math.PI * 2);
      ctx.fill?.();
    }
  });
}

function createStonePierTexture() {
  return createCanvasTexture(128, 256, (ctx, w, h) => {
    ctx.fillStyle = "#5c5750";
    ctx.fillRect(0, 0, w, h);
    const stones = ["#7e786e", "#69645c", "#8f887d", "#514d46"];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = stones[(r * 3 + c) % stones.length];
        ctx.fillRect(c * 42 + (r % 2 ? 12 : 0), r * 26 + 2, 38, 22);
      }
    }
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

function createGableRoof(width, depth, ridgeHeight, material) {
  const hw = width / 2;
  const hd = depth / 2;
  const positions = [
    -hw, 0, hd, hw, 0, hd, hw, ridgeHeight, 0,
    -hw, 0, hd, hw, ridgeHeight, 0, -hw, ridgeHeight, 0,
    hw, 0, -hd, -hw, 0, -hd, -hw, ridgeHeight, 0,
    hw, 0, -hd, -hw, ridgeHeight, 0, hw, ridgeHeight, 0,
    -hw, 0, -hd, -hw, 0, hd, -hw, ridgeHeight, 0,
    hw, 0, hd, hw, 0, -hd, hw, ridgeHeight, 0,
  ];
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function createJesusStatueMonument(x, y, z, facingYaw) {
  // Exact visual match for image_5b73abc9.png:
  // Circular landscaped garden base, cylindrical pink-ochre terracotta pedestal,
  // white standing Christ statue with outstretched arms, and twin-ring radial steel halo behind head.
  const group = new THREE.Group();
  group.name = "jesus-christ-statue";
  group.position.set(x, y, z);
  group.rotation.y = facingYaw;

  // Circular stone curb & green manicured garden island
  const borderRing = new THREE.Mesh(
    new THREE.CylinderGeometry(4.0, 4.15, 0.24, 28),
    mat("#b8b3a8", 0.8),
  );
  borderRing.position.y = 0.12;
  const turfCircle = new THREE.Mesh(
    new THREE.CylinderGeometry(3.75, 3.75, 0.28, 28),
    mat("#4f8f3f", 0.9),
  );
  turfCircle.position.y = 0.16;
  group.add(borderRing, turfCircle);

  // Decorative low shrubs around pedestal base
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8 + 0.3;
    const shrub = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.45, 1),
      mat(i % 2 === 0 ? "#2f6b29" : "#438237", 0.86),
    );
    shrub.scale.set(1.1, 0.72, 1.1);
    shrub.position.set(Math.cos(a) * 2.55, 0.44, Math.sin(a) * 2.55);
    group.add(shrub);
  }

  // Tall cylindrical pink-ochre granite/terracotta pedestal
  const terracottaPedestalMat = mat("#b98882", 0.65, 0.08);
  const graniteBase = new THREE.Mesh(
    new THREE.CylinderGeometry(1.18, 1.28, 0.36, 20),
    mat("#d5cec4", 0.72),
  );
  graniteBase.position.y = 0.42;

  const pedestalDrum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.84, 3.05, 24),
    terracottaPedestalMat,
  );
  pedestalDrum.position.y = 2.08;
  pedestalDrum.castShadow = pedestalDrum.receiveShadow = true;

  const pedestalCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.92, 0.78, 0.28, 24),
    mat("#d8cec4", 0.7),
  );
  pedestalCap.position.y = 3.72;
  group.add(graniteBase, pedestalDrum, pedestalCap);

  // Flowing white sculpted robe Christ figure
  const statueWhite = mat("#f6f7f9", 0.48, 0.04);
  const pedestalTop = 3.86;

  const robeLower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.44, 1.55, 16),
    statueWhite,
  );
  robeLower.position.y = pedestalTop + 0.78;
  robeLower.castShadow = true;

  const chestTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.32, 0.78, 16),
    statueWhite,
  );
  chestTorso.position.y = pedestalTop + 1.85;
  chestTorso.castShadow = true;

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 14),
    statueWhite,
  );
  head.position.y = pedestalTop + 2.48;
  head.scale.set(0.92, 1.08, 0.96);

  // Outstretched welcoming arms & draped sleeves
  const armsGroup = new THREE.Group();
  armsGroup.position.set(0, pedestalTop + 2.02, 0.04);
  for (const sx of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.125, 1.25, 10),
      statueWhite,
    );
    arm.rotation.z = sx * (Math.PI * 0.44);
    arm.position.set(sx * 0.72, 0.1, 0);
    arm.castShadow = true;

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), statueWhite);
    hand.position.set(sx * 1.32, 0.22, 0.04);
    armsGroup.add(arm, hand);
  }
  group.add(robeLower, chestTorso, head, armsGroup);

  // Iconic twin-ring radial circular steel halo / cross behind head (image_5b73abc9.png)
  const haloMat = mat("#dde3e8", 0.28, 0.75);
  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, pedestalTop + 2.52, -0.22);

  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.68, 0.025, 8, 32),
    haloMat,
  );
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.02, 8, 28),
    haloMat,
  );
  const vCrossBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 1.56, 8),
    haloMat,
  );
  const hCrossBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 1.56, 8),
    haloMat,
  );
  hCrossBar.rotation.z = Math.PI / 2;

  haloGroup.add(outerRing, innerRing, vCrossBar, hCrossBar);
  group.add(haloGroup);

  return group;
}

export class DongChuaCuuTheChurch {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    const cfg = quangTrungCampuses["nha-tho-dong-chua-cuu-the"];
    this.ring = cfg.ring;
    this.basilicaId = cfg.basilicaId || 1172894102;
    this.colonialIds = cfg.colonialBuildings || [1174028275, 1174028276, 1174028274];
    this.jesusStatuePos = cfg.jesusStatuePos;
    this.roadYaw = quangTrungCampuses.gateHeading;
    this.gatePivot = quangTrungCampuses["quang-trung"].gate;
    this.fwdVec = {
      x: -Math.sin(this.roadYaw),
      z: -Math.cos(this.roadYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "dong-chua-cuu-the-church";
    this.animatedObjects = [];
    this.buildingPolygons = [];
    this.fenceSegments = [];
    this.secondaryGates = [];
    this.stairPortals = [];
    this.stairZones = [];
    this.obstacles = [];

    this.buildGroundsAndFence();
    this.buildColonialTuVien();
    this.buildBasilicaAndStatue();

    world.scene.add(this.group);
  }

  toWorld(side, fwd) {
    return {
      x: this.gatePivot.x + side * this.rightVec.x + fwd * this.fwdVec.x,
      z: this.gatePivot.z + side * this.rightVec.z + fwd * this.fwdVec.z,
    };
  }

  inCompound(wx, wz) {
    return inside({ x: wx, z: wz }, this.ring);
  }

  buildGroundsAndFence() {
    // Clean granite courtyard apron across compound
    const yard = new THREE.Mesh(
      polygonGeometry(this.ring, 0.12),
      mat("#cec9be", 0.86),
    );
    yard.position.y = 0.16;
    yard.receiveShadow = true;
    this.group.add(yard);

    // Rich green monastery garden lawns around front promenade & Basilica plaza
    const lawnMat = createManicuredLawnMaterial(8, 8, { striped: false, rich: true });
    const gWrapper = new THREE.Group();
    gWrapper.position.set(this.gatePivot.x, 0, this.gatePivot.z);
    gWrapper.rotation.y = this.roadYaw;

    for (const [lx, lz, w, d] of [
      [-18, 38, 42, 16],
      [62, 39, 34, 14],
      [176, 36, 48, 22],
    ]) {
      const lawn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), lawnMat);
      lawn.position.set(lx, 0.25, lz);
      lawn.receiveShadow = true;
      gWrapper.add(lawn);
    }

    // Front garden shrine statue framed cleanly behind open Tu viện gate (per image_d57e1084.png)
    const frontStatueGroup = new THREE.Group();
    frontStatueGroup.position.set(36.0, 0.28, 37.5);
    frontStatueGroup.add(
      box([1.1, 1.2, 1.1], "#cfc9be", [0, 0.6, 0]),
      box([0.55, 1.55, 0.45], "#f5f4ef", [0, 1.95, 0]),
    );
    const fHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 10),
      mat("#f5f4ef", 0.5),
    );
    fHead.position.y = 2.9;
    frontStatueGroup.add(fHead);
    gWrapper.add(frontStatueGroup);
    this.group.add(gWrapper);

    // Full-perimeter stone-pier & silver wrought-iron fence around ALL sides of this.ring
    // plus primary Tu viện gate + cổng phụ secondary gates opening onto all surrounding streets
    const stoneTex = createStonePierTexture();
    const fenceTex = createSilverFenceTexture();
    const stoneMat = new THREE.MeshStandardMaterial({
      color: stoneTex ? "#ffffff" : "#6a645c",
      map: stoneTex,
      roughness: 0.85,
    });
    const fenceMat = new THREE.MeshStandardMaterial({
      color: fenceTex ? "#ffffff" : "#9aa4ab",
      map: fenceTex,
      roughness: 0.55,
      metalness: 0.35,
    });
    const capMat = mat("#9c624e", 0.72);

    const fenceGroup = new THREE.Group();
    fenceGroup.name = "dong-chua-cuu-the-perimeter-fence";

    const lerpPt = (a, b, t) => ({
      x: a.x + (b.x - a.x) * t,
      z: a.z + (b.z - a.z) * t,
    });
    const projT = (p, a, b) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const lenSq = dx * dx + dz * dz || 1;
      return ((p.x - a.x) * dx + (p.z - a.z) * dz) / lenSq;
    };

    const r = this.ring;
    // Key perimeter gate definitions mapped onto exact polygon edges
    const tuVienTarget = this.toWorld(36.0, -24.0);
    const eastPlazaTarget = this.toWorld(168.0, -22.5);
    const gateDefs = [
      // 1) Main Tu viện front gate along north edge (v10 -> v11/v0)
      {
        name: "cong-chinh-tu-vien",
        edgeIndex: 11,
        t: projT(tuVienTarget, r[10], r[11]),
        gap: 10.0,
        isMain: true,
      },
      // 2) Cổng phụ quảng trường Basilica / Tượng Chúa (Nguyễn Huệ đông, đối diện Công viên Dự án)
      {
        name: "cong-phu-nguyen-hue-dong",
        edgeIndex: 11,
        t: projT(eastPlazaTarget, r[10], r[11]),
        gap: 8.6,
        isMain: false,
      },
      // 3) Cổng phụ Ngã 3 Nguyễn Huệ × Nguyễn Khuyến (edge 10: v9 -> v10)
      {
        name: "cong-phu-nga-ba-nguyen-khuyen",
        edgeIndex: 10,
        t: 0.5,
        gap: 5.4,
        isMain: false,
      },
      // 4) Cổng phụ đường Nguyễn Khuyến phía Đông (edge 9: v8 -> v9)
      {
        name: "cong-phu-nguyen-khuyen-1",
        edgeIndex: 9,
        t: 0.72,
        gap: 7.4,
        isMain: false,
      },
      // 5) Cổng phụ đường Nguyễn Khuyến phía Nam (edge 9: v8 -> v9)
      {
        name: "cong-phu-nguyen-khuyen-2",
        edgeIndex: 9,
        t: 0.32,
        gap: 7.4,
        isMain: false,
      },
      // 6) Cổng phụ hẻm phía Nam (edge 8: v7 -> v8)
      {
        name: "cong-phu-hem-nam",
        edgeIndex: 8,
        t: 0.5,
        gap: 5.6,
        isMain: false,
      },
      // 7) Cổng phụ tuyến đường phía Tây (edge 1: v0 -> v1)
      {
        name: "cong-phu-duong-tay",
        edgeIndex: 1,
        t: 0.48,
        gap: 6.2,
        isMain: false,
      },
    ];

    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1];
      const b = r[i];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.2) continue;

      const edgeGates = gateDefs
        .filter((g) => g.edgeIndex === i)
        .map((g) => {
          const centerDist = Math.max(g.gap / 2 + 0.5, Math.min(len - g.gap / 2 - 0.5, g.t * len));
          return {
            ...g,
            s0: centerDist - g.gap / 2,
            s1: centerDist + g.gap / 2,
            center: lerpPt(a, b, centerDist / len),
          };
        })
        .sort((g1, g2) => g1.s0 - g2.s0);

      // Record open gate placements & render gate piers + swung-open iron gate leaves
      const yaw = Math.atan2(-dz, dx);
      const nx = -dz / len;
      const nz = dx / len;
      for (const eg of edgeGates) {
        this.secondaryGates.push({
          name: eg.name,
          x: eg.center.x,
          z: eg.center.z,
          gap: eg.gap,
          isMain: eg.isMain,
        });
        for (const [distAlong, dirSign] of [
          [eg.s0, 1],
          [eg.s1, -1],
        ]) {
          const gp = lerpPt(a, b, distAlong / len);
          const pw = eg.isMain ? 0.72 : 0.62;
          const ph = eg.isMain ? 2.55 : 2.38;
          const pier = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, pw), stoneMat);
          pier.position.set(gp.x, ph / 2 + 0.16, gp.z);
          pier.rotation.y = yaw;
          pier.castShadow = true;
          const cap = new THREE.Mesh(new THREE.ConeGeometry(pw * 0.78, 0.28, 4), capMat);
          cap.position.set(gp.x, ph + 0.3, gp.z);
          cap.rotation.y = yaw + Math.PI / 4;
          fenceGroup.add(pier, cap);
          this.obstacles.push({ x: gp.x, z: gp.z, radius: 0.65 });

          // Swung-open iron double gate leaf resting inside compound perpendicular to gate line
          // Ensure normal points inward toward compound interior
          const testPt = { x: eg.center.x + nx * 1.5, z: eg.center.z + nz * 1.5 };
          const inwardSign = inside(testPt, this.ring) ? 1 : -1;
          const leafLen = Math.min(3.8, eg.gap * 0.42);
          const leaf = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 2.05, leafLen),
            fenceMat,
          );
          const ux = dx / len;
          const uz = dz / len;
          leaf.position.set(
            gp.x + ux * dirSign * 0.38 + nx * inwardSign * (leafLen * 0.52),
            1.22,
            gp.z + uz * dirSign * 0.38 + nz * inwardSign * (leafLen * 0.52),
          );
          leaf.rotation.y = yaw;
          fenceGroup.add(leaf);
        }
      }

      // Build continuous pier-and-iron fence spans between gate cuts
      const cuts = [0];
      for (const eg of edgeGates) {
        cuts.push(eg.s0, eg.s1);
      }
      cuts.push(len);

      for (let k = 0; k < cuts.length; k += 2) {
        const startDist = cuts[k];
        const endDist = cuts[k + 1];
        const spanLen = endDist - startDist;
        if (spanLen < 0.35) continue;
        const pA = lerpPt(a, b, startDist / len);
        const pB = lerpPt(a, b, endDist / len);
        this.fenceSegments.push({ a: pA, b: pB });

        const mx = (pA.x + pB.x) / 2;
        const mz = (pA.z + pB.z) / 2;
        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(spanLen, 2.05, 0.22),
          fenceMat,
        );
        panel.position.set(mx, 1.2, mz);
        panel.rotation.y = yaw;
        panel.castShadow = true;
        fenceGroup.add(panel);

        const posts = Math.max(1, Math.round(spanLen / 7.5));
        for (let p = 0; p <= posts; p++) {
          const pp = lerpPt(pA, pB, p / posts);
          const pier = new THREE.Mesh(new THREE.BoxGeometry(0.46, 2.18, 0.46), stoneMat);
          pier.position.set(pp.x, 1.25, pp.z);
          pier.rotation.y = yaw;
          pier.castShadow = true;
          const cap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.24, 4), capMat);
          cap.position.set(pp.x, 2.46, pp.z);
          cap.rotation.y = yaw + Math.PI / 4;
          fenceGroup.add(pier, cap);
        }
      }
    }

    this.group.add(fenceGroup);
  }

  buildColonialTuVien() {
    const colonialTex = createColonialMonasteryTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      color: colonialTex ? "#ffffff" : "#e8d6a8",
      map: colonialTex,
      roughness: 0.72,
    });
    const trimMat = mat("#f3ead0", 0.72);
    const balustradeMat = mat("#d5c294", 0.74);

    const colonialPolys = new Map();
    for (const id of this.colonialIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.buildingPolygons.push(pts);
      colonialPolys.set(id, pts);

      const wallH = id === 1174028275 ? 9.4 : 8.6;
      const geo = polygonGeometry(pts, wallH);
      if (geo.attributes.uv) {
        const uv = geo.attributes.uv;
        const pos = geo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 10.5, pos.getY(i) / wallH);
        }
      }
      const mesh = new THREE.Mesh(geo, wallMat);
      mesh.position.y = 0.28;
      mesh.castShadow = mesh.receiveShadow = true;
      this.group.add(mesh);
      this.world.cameraObstacles.push(mesh);
    }

    // Add formal French-colonial entrance stone staircases & portals to all 3 Tu viện buildings
    const tuVienMain = colonialPolys.get(1174028275);
    if (tuVienMain) {
      this.addPortalOnEdge(tuVienMain, 7, 8, {
        name: "portal-tuvien-north",
        width: 7.2,
        steps: 5,
        stepDepth: 0.44,
        stepRise: 0.18,
        landingDepth: 1.55,
        doorW: 3.6,
        doorH: 3.8,
        style: "colonial",
      });
      this.addPortalOnEdge(tuVienMain, 1, 2, {
        name: "portal-tuvien-south",
        width: 5.8,
        steps: 4,
        stepDepth: 0.42,
        stepRise: 0.18,
        landingDepth: 1.35,
        doorW: 3.0,
        doorH: 3.4,
        style: "colonial",
      });
    }
    const tuVienWest = colonialPolys.get(1174028276);
    if (tuVienWest) {
      this.addPortalOnEdge(tuVienWest, 3, 4, {
        name: "portal-west-wing-north",
        width: 5.4,
        steps: 4,
        stepDepth: 0.42,
        stepRise: 0.18,
        landingDepth: 1.3,
        doorW: 2.8,
        doorH: 3.3,
        style: "colonial",
      });
      this.addPortalOnEdge(tuVienWest, 1, 2, {
        name: "portal-west-wing-south",
        width: 5.4,
        steps: 4,
        stepDepth: 0.42,
        stepRise: 0.18,
        landingDepth: 1.3,
        doorW: 2.8,
        doorH: 3.3,
        style: "colonial",
      });
    }
    const cloisterWing = colonialPolys.get(1174028274);
    if (cloisterWing) {
      this.addPortalOnEdge(cloisterWing, 1, 2, {
        name: "portal-cloister-east",
        width: 5.6,
        steps: 4,
        stepDepth: 0.42,
        stepRise: 0.18,
        landingDepth: 1.35,
        doorW: 2.9,
        doorH: 3.4,
        style: "colonial",
      });
      this.addPortalOnEdge(cloisterWing, 3, 4, {
        name: "portal-cloister-west",
        width: 5.2,
        steps: 4,
        stepDepth: 0.42,
        stepRise: 0.18,
        landingDepth: 1.25,
        doorW: 2.6,
        doorH: 3.2,
        style: "colonial",
      });
    }

    // Iconic front stepped gable, Stone Cross, balcony & perforated balustrade on primary colonial block 1174028275
    const tCenter = this.toWorld(36.0, -50.8);
    const gable = new THREE.Group();
    gable.name = "dong-chua-cuu-the-tuvien-facade";
    gable.position.set(tCenter.x, 0.28, tCenter.z);
    gable.rotation.y = this.roadYaw + Math.PI;

    // Rooftop perforated balustrade parapet across front facade
    gable.add(box([42.0, 0.24, 0.4], trimMat.color.getStyle(), [0, 9.5, 0]));
    gable.add(box([42.0, 0.22, 0.38], trimMat.color.getStyle(), [0, 10.45, 0]));
    for (let bx = -20.4; bx <= 20.4; bx += 0.85) {
      if (Math.abs(bx) < 4.5) continue;
      gable.add(box([0.24, 0.85, 0.26], balustradeMat.color.getStyle(), [bx, 9.96, 0]));
    }

    // Central projecting French-colonial portico & second-story arched balcony
    gable.add(
      box([6.8, 10.6, 1.4], "#e5d19e", [0, 5.3, 0.4]),
      box([3.8, 0.28, 1.2], "#f4ebd4", [0, 5.1, 1.0]),
      box([3.8, 0.72, 0.22], "#d8c492", [0, 5.58, 1.52]),
    );

    // Stepped classical pediment housing the monastery plaque & top Stone Cross (image_d57e1084.png)
    gable.add(
      box([7.4, 1.4, 1.1], "#e4cf9c", [0, 11.2, 0.4]),
      box([5.2, 0.9, 1.0], "#e4cf9c", [0, 12.2, 0.4]),
      box([3.0, 0.7, 0.9], "#e4cf9c", [0, 12.95, 0.4]),
      box([7.8, 0.22, 1.2], "#f4ebd4", [0, 10.55, 0.4]),
    );
    // Flanking urn/sphere finials on gable shoulders
    for (const sx of [-2.9, 2.9]) {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.26, 10, 8),
        trimMat,
      );
      orb.position.set(sx, 12.15, 0.4);
      gable.add(orb);
    }
    // Top Stone Cross
    gable.add(
      box([0.24, 1.65, 0.24], "#f3ead4", [0, 14.0, 0.4]),
      box([1.05, 0.22, 0.22], "#f3ead4", [0, 14.3, 0.4]),
    );

    const plaqueTex = createMonasteryPedimentTexture();
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(6.2, 1.25),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: plaqueTex,
        roughness: 0.48,
      }),
    );
    plaque.position.set(0, 11.25, 0.98);
    gable.add(plaque);

    this.group.add(gable);
  }

  buildBasilicaAndStatue() {
    const stoneTex = createBasilicaStoneTexture();
    const basilicaMat = new THREE.MeshStandardMaterial({
      color: stoneTex ? "#ffffff" : "#e5d7b4",
      map: stoneTex,
      roughness: 0.68,
    });
    const roofMat = mat("#6f392c", 0.72);
    const blueGlassMat = mat("#236ed1", 0.35, 0.15);

    const feature = getById(this.basilicaId);
    let bCenter = this.toWorld(108, -58);
    let basilicaPts = null;
    if (feature) {
      const pts = getPointsOf(feature);
      basilicaPts = pts;
      this.buildingPolygons.push(pts);
      const navH = 16.2;
      const bodyGeo = polygonGeometry(pts, navH);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 10.0, pos.getY(i) / navH);
        }
      }
      const bodyMesh = new THREE.Mesh(bodyGeo, basilicaMat);
      bodyMesh.position.y = 0.28;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);

      const minX = Math.min(...pts.map((p) => p.x));
      const maxX = Math.max(...pts.map((p) => p.x));
      const minZ = Math.min(...pts.map((p) => p.z));
      const maxZ = Math.max(...pts.map((p) => p.z));
      bCenter = { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 };
    }

    // Grand sanctuary stone staircases & cathedral portals on all 4 facades of the Basilica
    if (basilicaPts && basilicaPts.length >= 28) {
      // 1) East Main Sanctuary Portal facing Jesus Christ statue & Ngã 3 Nguyễn Huệ × Nguyễn Khuyến
      this.addPortalOnEdge(basilicaPts, 27, 0, {
        name: "portal-basilica-east-main",
        width: 11.4,
        steps: 7,
        stepDepth: 0.48,
        stepRise: 0.18,
        landingDepth: 2.1,
        doorW: 4.8,
        doorH: 5.4,
        style: "basilica",
      });
      // 2) South Transept Cathedral Portal facing green courtyard lawn
      this.addPortalOnEdge(basilicaPts, 4, 5, {
        name: "portal-basilica-south-transept",
        width: 8.6,
        steps: 5,
        stepDepth: 0.46,
        stepRise: 0.18,
        landingDepth: 1.65,
        doorW: 3.8,
        doorH: 4.6,
        style: "basilica",
      });
      // 3) North Transept Cathedral Portal facing Nguyễn Huệ
      this.addPortalOnEdge(basilicaPts, 22, 23, {
        name: "portal-basilica-north-transept",
        width: 8.6,
        steps: 5,
        stepDepth: 0.46,
        stepRise: 0.18,
        landingDepth: 1.65,
        doorW: 3.8,
        doorH: 4.6,
        style: "basilica",
      });
      // 4) West Apse Chapel Portal facing Tu viện courtyard
      this.addPortalOnEdge(basilicaPts, 13, 14, {
        name: "portal-basilica-west-apse",
        width: 5.2,
        steps: 4,
        stepDepth: 0.44,
        stepRise: 0.18,
        landingDepth: 1.35,
        doorW: 2.8,
        doorH: 3.8,
        style: "basilica",
      });
    }

    // Cruciform Basilica gabled roofs & soaring Bell Tower aligned with Basilica's true OSM axis (~ +0.06 rad from E)
    const basilicaYaw = this.roadYaw + 0.08;
    const basilicaRoofAndTower = new THREE.Group();
    basilicaRoofAndTower.name = "dong-chua-cuu-the-basilica";
    basilicaRoofAndTower.position.set(bCenter.x, 0.28, bCenter.z);
    basilicaRoofAndTower.rotation.y = basilicaYaw;

    // Main vaulted nave pitched roof + perpendicular transept roof
    const mainRoof = createGableRoof(64.0, 22.0, 5.2, roofMat);
    mainRoof.position.y = 16.2;
    const transeptRoof = createGableRoof(16.0, 44.0, 4.4, roofMat);
    transeptRoof.rotation.y = Math.PI / 2;
    transeptRoof.position.set(-10.0, 16.2, 0);
    basilicaRoofAndTower.add(mainRoof, transeptRoof);

    // Tall Basilica Facade & Bell Tower facing East toward the Christ Statue & Nguyễn Khuyến
    const towerX = 33.5;
    this.bellTowerPos = {
      x: bCenter.x + Math.cos(basilicaYaw) * towerX,
      z: bCenter.z - Math.sin(basilicaYaw) * towerX,
    };
    basilicaRoofAndTower.add(
      box([6.6, 26.0, 7.2], "#e8dbb9", [towerX, 13.0, 0]),
      box([5.4, 5.2, 5.4], "#efe4c7", [towerX, 28.0, 0]),
    );
    // Gothic blue stained-glass window panels on Basilica front facing Christ Statue
    for (const wz of [-2.2, 0, 2.2]) {
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.18, 7.8, 1.5), blueGlassMat);
      glass.position.set(towerX + 3.32, 13.2, wz);
      basilicaRoofAndTower.add(glass);
    }
    const belfrySpire = new THREE.Mesh(
      new THREE.ConeGeometry(3.4, 9.2, 4),
      mat("#5e3c34", 0.65),
    );
    belfrySpire.rotation.y = Math.PI / 4;
    belfrySpire.position.set(towerX, 34.8, 0);
    belfrySpire.castShadow = true;

    // Bright beacon Cross atop Basilica bell tower
    const crossMat = new THREE.MeshStandardMaterial({
      color: "#fff8df",
      emissive: "#ffe49e",
      emissiveIntensity: 0.45,
      roughness: 0.35,
    });
    const spireCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.2, 0.32), crossMat);
    spireCrossV.position.set(towerX, 40.6, 0);
    const spireCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 1.9), crossMat);
    spireCrossH.position.set(towerX, 41.2, 0);
    basilicaRoofAndTower.add(belfrySpire, spireCrossV, spireCrossH);

    this.group.add(basilicaRoofAndTower);

    // Monumental Tượng Chúa Giêsu dang tay at exact OSM node 10897887242 overlooking Ngã 3 Nguyễn Huệ × Nguyễn Khuyến
    const jPos = this.jesusStatuePos;
    const junction = quangTrungCampuses["nha-tho-dong-chua-cuu-the"].nguyKhuyenJunction;
    const jYaw = Math.atan2(junction.x - jPos.x, junction.z - jPos.z);
    const statue = createJesusStatueMonument(jPos.x, 0.28, jPos.z, jYaw);
    this.group.add(statue);
    this.obstacles.push({ x: jPos.x, z: jPos.z, radius: 4.1 });
  }

  addPortalOnEdge(
    poly,
    indexA,
    indexB,
    {
      name,
      width = 6.8,
      steps = 5,
      stepDepth = 0.45,
      stepRise = 0.18,
      landingDepth = 1.5,
      doorW = 3.4,
      doorH = 4.0,
      style = "basilica",
    } = {},
  ) {
    const a = poly[indexA];
    const b = poly[indexB];
    if (!a || !b) return null;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const edgeLen = Math.hypot(dx, dz);
    if (edgeLen < 1) return null;

    const mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    let nx = -dz / edgeLen;
    let nz = dx / edgeLen;
    // Flip normal strictly outward from building interior
    if (inside({ x: mid.x + nx * 1.2, z: mid.z + nz * 1.2 }, poly)) {
      nx = -nx;
      nz = -nz;
    }

    const yaw = Math.atan2(nx, nz);
    const portal = new THREE.Group();
    portal.name = name || "dong-chua-cuu-the-stair-portal";
    portal.position.set(mid.x, 0.28, mid.z);
    portal.rotation.y = yaw;

    const maxRise = steps * stepRise;
    const totalDepth = landingDepth + steps * stepDepth;

    // 1) Top stone landing platform anchored slightly inside wall (-0.35..+landingDepth)
    const landingGeo = new THREE.BoxGeometry(width, maxRise, landingDepth + 0.35);
    const stoneColor = "#d9d0be";
    const treadTrim = "#ebe3d3";
    const balustradeHex = "#c7bea9";
    const archStoneHex = "#efe6d2";
    const woodDoorHex = "#4f2c1a";
    const landing = new THREE.Mesh(landingGeo, mat(stoneColor, 0.8));
    landing.position.set(0, maxRise / 2, (landingDepth - 0.35) / 2);
    landing.castShadow = landing.receiveShadow = true;
    portal.add(landing);

    // 2) Tiered stone staircase descending cleanly from landing outward to ground
    for (let s = 0; s < steps; s++) {
      const h = (steps - s) * stepRise;
      const zCenter = landingDepth + s * stepDepth + stepDepth / 2;
      const stepW = width + Math.min(1.0, s * 0.22);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(stepW, h, stepDepth + 0.04),
        mat(s % 2 === 0 ? treadTrim : stoneColor, 0.82),
      );
      stepMesh.position.set(0, h / 2, zCenter);
      stepMesh.castShadow = stepMesh.receiveShadow = true;
      portal.add(stepMesh);
    }

    // 3) Flanking stepped stone cheek balustrades + front newel piers with warm lanterns
    for (const sx of [-1, 1]) {
      const railX = sx * (width / 2 + 0.24);
      // Upper balustrade wall along landing
      portal.add(
        box([0.42, maxRise + 0.72, landingDepth + 0.35], balustradeHex, [
          railX,
          (maxRise + 0.72) / 2,
          (landingDepth - 0.35) / 2,
        ]),
        box([0.52, 0.14, landingDepth + 0.45], archStoneHex, [
          railX,
          maxRise + 0.78,
          (landingDepth - 0.35) / 2,
        ]),
      );
      // Diagonal stepped balustrade wing wall down stair sides
      const slopeLen = steps * stepDepth;
      const cheek = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, maxRise * 0.65 + 0.6, slopeLen),
        mat(balustradeHex, 0.8),
      );
      cheek.position.set(railX, (maxRise * 0.65 + 0.6) / 2, landingDepth + slopeLen / 2);
      cheek.castShadow = true;
      portal.add(cheek);

      // Front square granite newel post + glowing bronze lantern at stair foot
      const postZ = totalDepth - 0.15;
      const postX = sx * (width / 2 + Math.min(0.5, steps * 0.1) + 0.22);
      portal.add(
        box([0.56, 1.35, 0.56], balustradeHex, [postX, 0.675, postZ]),
        box([0.66, 0.14, 0.66], archStoneHex, [postX, 1.4, postZ]),
      );
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 8),
        new THREE.MeshStandardMaterial({
          color: "#fff7db",
          emissive: "#ffe09a",
          emissiveIntensity: 0.4,
          roughness: 0.3,
        }),
      );
      lantern.position.set(postX, 1.66, postZ);
      portal.add(lantern);

      // Register corner pier obstacles in world space (leaving center steps 100% passable)
      this.obstacles.push({
        x: mid.x + (postX * Math.cos(yaw) + postZ * Math.sin(yaw)),
        z: mid.z + (-postX * Math.sin(yaw) + postZ * Math.cos(yaw)),
        radius: 0.55,
      });
    }

    // 4) Grand Sanctuary Entrance Portal Frame, Pilasters & Double Carved Doors sitting atop landing
    const frameW = doorW + 1.5;
    const sillZ = 0.14;
    const baseDoorY = maxRise;
    portal.add(
      // Stone portal pilasters left & right
      box([0.7, doorH + 0.5, 0.72], archStoneHex, [-doorW / 2 - 0.35, baseDoorY + (doorH + 0.5) / 2, sillZ + 0.18]),
      box([0.7, doorH + 0.5, 0.72], archStoneHex, [doorW / 2 + 0.35, baseDoorY + (doorH + 0.5) / 2, sillZ + 0.18]),
      // Heavy carved lintel & cornice pediment
      box([frameW + 0.4, 0.52, 0.85], archStoneHex, [0, baseDoorY + doorH + 0.35, sillZ + 0.22]),
      box([frameW + 0.9, 0.24, 1.05], treadTrim, [0, baseDoorY + doorH + 0.72, sillZ + 0.26]),
    );

    if (style === "basilica") {
      // Gothic pointed stone gable hood, blue stained-glass tympanum & golden cross finial
      const hood = new THREE.Mesh(
        new THREE.ConeGeometry(frameW * 0.42, 1.85, 4),
        mat(archStoneHex, 0.72),
      );
      hood.rotation.y = Math.PI / 4;
      hood.scale.set(1.15, 1, 0.45);
      hood.position.set(0, baseDoorY + doorH + 1.68, sillZ + 0.22);
      portal.add(
        hood,
        box([0.16, 0.95, 0.16], "#fff5d2", [0, baseDoorY + doorH + 2.85, sillZ + 0.22]),
        box([0.62, 0.16, 0.16], "#fff5d2", [0, baseDoorY + doorH + 3.02, sillZ + 0.22]),
      );
      const tympanum = new THREE.Mesh(
        new THREE.CircleGeometry(doorW * 0.44, 18, 0, Math.PI),
        mat("#1c60ba", 0.3, 0.2),
      );
      tympanum.position.set(0, baseDoorY + doorH - 0.55, sillZ + 0.19);
      portal.add(tympanum);
    }

    // Carved dark mahogany sanctuary double doors + central brass cross & handles
    const doorLeafH = doorH - (style === "basilica" ? 0.65 : 0.2);
    portal.add(
      box([doorW, doorLeafH, 0.22], woodDoorHex, [0, baseDoorY + doorLeafH / 2, sillZ]),
      box([0.1, doorLeafH, 0.28], "#2d170c", [0, baseDoorY + doorLeafH / 2, sillZ + 0.02]),
      box([0.12, 0.42, 0.08], "#dfb965", [-0.26, baseDoorY + 1.35, sillZ + 0.13]),
      box([0.12, 0.42, 0.08], "#dfb965", [0.26, baseDoorY + 1.35, sillZ + 0.13]),
    );

    this.group.add(portal);
    this.stairPortals.push(portal);

    // Register smooth walkable stair slope in world space
    this.stairZones.push({
      cx: mid.x,
      cz: mid.z,
      nx,
      nz,
      tx: -nz,
      tz: nx,
      halfW: width / 2 + 0.2,
      landingDepth,
      totalDepth,
      maxRise,
    });
    return portal;
  }

  stairElevationAt(wx, wz) {
    for (const s of this.stairZones) {
      const dx = wx - s.cx;
      const dz = wz - s.cz;
      const lateral = Math.abs(dx * s.tx + dz * s.tz);
      if (lateral > s.halfW) continue;
      const outward = dx * s.nx + dz * s.nz;
      if (outward < -0.25 || outward > s.totalDepth) continue;
      if (outward <= s.landingDepth) return 0.28 + s.maxRise;
      const t = 1 - (outward - s.landingDepth) / (s.totalDepth - s.landingDepth);
      return 0.28 + Math.max(0, Math.min(1, t)) * s.maxRise;
    }
    return null;
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCompound(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.4) return null;
    const stairY = this.stairElevationAt(wx, wz);
    if (stairY !== null) return stairY;
    return 0.28;
  }

  canRide(wx, wz) {
    if (hitsCampusWall({ x: wx, z: wz }, this.fenceSegments, 0.55)) {
      return false;
    }
    if (
      this.secondaryGates.some(
        (g) => Math.hypot(wx - g.x, wz - g.z) <= (g.gap ? g.gap * 0.45 : 2.4),
      )
    ) {
      return true;
    }
    if (!this.inCompound(wx, wz)) return null;
    if (this.buildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
    if (
      this.obstacles.some(
        (o) => Math.hypot(wx - o.x, wz - o.z) < o.radius,
      )
    ) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCompound(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inCompound(wx, wz)) return true;
    return this.secondaryGates.some(
      (g) => Math.hypot(wx - g.x, wz - g.z) < 15.5,
    );
  }

  isPlayerInArea(wx, wz) {
    if (this.inCompound(wx, wz)) return true;
    const hit = nearestPoint({ x: wx, z: wz }, this.ring);
    return hit.distance <= 16;
  }

  getBellSource() {
    return this.bellTowerPos || this.jesusStatuePos;
  }
}
