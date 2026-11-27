import * as THREE from "three";
import { inside, project } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { tiledRoof } from "../../../../core/shared/architecture/architecture.js";
import { createManicuredLawnTexture } from "../../../../core/world/turfTextures.js";

const NGHENH_LUONG_DINH = project({
  lat: 16.46479800528459,
  lon: 107.58139831689907,
});
const PHU_VAN_LAU = project({
  lat: 16.465502914711085,
  lon: 107.58089252961778,
});
const KY_DAI = project({
  lat: 16.46632905717507,
  lon: 107.58027070092146,
});

// Direction facing from Kỳ Đài -> Phu Văn Lâu -> Nghênh Lương Đình -> Perfume River
const IMPERIAL_AXIS_YAW = Math.atan2(
  NGHENH_LUONG_DINH.x - KY_DAI.x,
  NGHENH_LUONG_DINH.z - KY_DAI.z,
);

function createVietnamFlagTexture() {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#da251d";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle fabric weave shading
    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    for (let y = 0; y < canvas.height; y += 8) {
      ctx.fillRect(0, y, canvas.width, 2);
    }

    // Crisp 5-pointed golden star
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const outerR = canvas.height * 0.31;
    const innerR = outerR * 0.382;
    ctx.fillStyle = "#ffde00";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? outerR : innerR;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath?.();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function imperialTierRoof(width, depth, y, tileColor = "#a8643c", goldTrim = "#d2a854") {
  const g = tiledRoof(width, depth, y, tileColor);
  const ridgeY = y + 1.25;
  g.add(
    box([width * 0.94, 0.16, 0.2], "#8c4d2d", [0, ridgeY, 0]),
    box([width * 0.86, 0.1, 0.14], goldTrim, [0, ridgeY + 0.1, 0]),
  );
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const finial = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.38, 6),
        mat(goldTrim, 0.45, 0.25),
      );
      finial.position.set(sx * width * 0.48, y + 0.32, sz * depth * 0.48);
      finial.rotation.z = -sx * 0.42;
      finial.rotation.x = sz * 0.35;
      g.add(finial);
    }
  }
  return g;
}

function createNghenhLuongDinh(x, z, yaw) {
  const g = new THREE.Group();
  g.name = "nghenh-luong-dinh";
  g.position.set(x, 0, z);
  g.rotation.y = yaw;

  // Stone river landing & descending steps into the Perfume River
  g.add(
    box([16.5, 0.65, 12.2], "#bfb5a0", [0, 0.325, 0.6]),
    box([15.2, 0.45, 10.6], "#cfc5b0", [0, 0.82, 0]),
  );
  for (let s = 0; s < 5; s++) {
    g.add(
      box([7.4, 0.16, 0.55], "#c5baa4", [0, 0.68 - s * 0.14, 5.8 + s * 0.52]),
    );
  }

  // Crimson-lacquered open pavilion columns
  const colPositionsX = [-5.4, -2.7, 0, 2.7, 5.4];
  const colPositionsZ = [-3.6, 0, 3.6];
  const colGeo = new THREE.CylinderGeometry(0.16, 0.19, 3.3, 10);
  const colMat = mat("#922c24", 0.52, 0.08);
  for (const cx of colPositionsX) {
    for (const cz of colPositionsZ) {
      if (cx === 0 && cz === 0) continue;
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 2.68, cz);
      col.castShadow = col.receiveShadow = true;
      g.add(col);
    }
  }

  // Timber eaves beams & crimson balustrade panels
  g.add(
    box([11.8, 0.42, 8.2], "#7a3022", [0, 4.35, 0]),
    box([11.2, 0.25, 7.6], "#c79a4c", [0, 4.65, 0]),
    box([3.8, 0.65, 0.18], "#98362a", [-3.6, 1.38, 3.6]),
    box([3.8, 0.65, 0.18], "#98362a", [3.6, 1.38, 3.6]),
    box([0.18, 0.65, 7.4], "#98362a", [-5.4, 1.38, 0]),
    box([0.18, 0.65, 7.4], "#98362a", [5.4, 1.38, 0]),
  );

  // Double-tiered imperial glazed terracotta roof (mái chồng diêm)
  g.add(imperialTierRoof(14.8, 10.6, 4.7, "#a65c34", "#d6ad58"));
  g.add(box([9.8, 0.65, 5.6], "#8e3428", [0, 5.78, 0]));
  g.add(imperialTierRoof(11.6, 7.4, 6.08, "#9b502b", "#dfb760"));

  return g;
}

function createPhuVanLau(x, z, yaw) {
  const g = new THREE.Group();
  g.name = "phu-van-lau";
  g.position.set(x, 0, z);
  g.rotation.y = yaw;

  // Raised sandstone plaza terrace & front steps
  g.add(
    box([20.5, 0.72, 16.0], "#c4b9a3", [0, 0.36, 0]),
    box([18.4, 0.42, 14.0], "#d4cab4", [0, 0.92, 0]),
  );
  for (let s = 0; s < 4; s++) {
    g.add(box([6.6, 0.18, 0.55], "#cbc0aa", [0, 0.88 - s * 0.2, 7.2 + s * 0.52]));
  }

  // Ground-floor open colonnade & warm ochre wall core
  g.add(box([12.2, 3.2, 7.6], "#d9b977", [0, 2.72, -0.3]));
  const colGeo = new THREE.CylinderGeometry(0.18, 0.21, 3.4, 10);
  const colMat = mat("#952d24", 0.5, 0.08);
  for (const cx of [-6.8, -3.4, 0, 3.4, 6.8]) {
    for (const cz of [-4.8, 4.8]) {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 2.82, cz);
      col.castShadow = col.receiveShadow = true;
      g.add(col);
    }
  }
  for (const cz of [-1.6, 1.6]) {
    for (const cx of [-6.8, 6.8]) {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(cx, 2.82, cz);
      g.add(col);
    }
  }

  // Lower tier roof + upper story pavilion ("Phu Văn Lâu" 2-story structure)
  g.add(imperialTierRoof(16.8, 12.6, 4.52, "#a85f36", "#d8b05c"));
  g.add(
    box([10.6, 2.35, 6.6], "#dfb86b", [0, 6.42, 0]),
    box([10.8, 0.18, 6.8], "#943228", [0, 5.45, 0]),
    box([4.2, 1.45, 0.22], "#8c2b22", [0, 6.35, 3.35]),
  );
  g.add(imperialTierRoof(13.2, 9.2, 7.55, "#9a502c", "#e2ba64"));

  return g;
}

function createKyDaiHue(x, z, yaw) {
  const g = new THREE.Group();
  g.name = "ky-dai-hue";
  g.position.set(x, 0, z);
  g.rotation.y = yaw;

  // Three-tiered Imperial Flag Tower Bastion (scaled so it reads crisply across the river)
  const tier1 = box([42, 4.4, 28], "#958367", [0, 2.2, 0]);
  const tier1Cap = box([42.8, 0.35, 28.8], "#b6a484", [0, 4.55, 0]);
  const tier2 = box([31, 4.0, 20.5], "#a49273", [0, 6.65, 0]);
  const tier2Cap = box([31.8, 0.35, 21.3], "#c2b08d", [0, 8.75, 0]);
  const tier3 = box([20, 3.6, 13.5], "#b3a17f", [0, 10.65, 0]);
  const tier3Cap = box([20.8, 0.4, 14.3], "#cec09e", [0, 12.6, 0]);
  g.add(tier1, tier1Cap, tier2, tier2Cap, tier3, tier3Cap);

  // Subtle corner bastion piers & axial front stair ramp
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      g.add(box([3.2, 4.9, 3.2], "#86765d", [sx * 20.4, 2.45, sz * 13.4]));
    }
  }
  for (let s = 0; s < 6; s++) {
    g.add(
      box([6.8, 0.72, 1.15], "#bcae90", [0, 0.4 + s * 0.7, 15.8 - s * 0.95]),
    );
  }

  // Flagpole plinth & tall white-silver flagpole rising high above the north bank treeline
  const poleBaseY = 12.8;
  const poleHeight = 34.0;
  g.add(
    box([3.6, 1.4, 3.6], "#cfc1a2", [0, poleBaseY + 0.7, 0]),
    box([2.2, 0.9, 2.2], "#ded4bc", [0, poleBaseY + 1.85, 0]),
  );

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.38, poleHeight, 12),
    mat("#ebe7dc", 0.36, 0.58),
  );
  pole.position.y = poleBaseY + 1.8 + poleHeight / 2;
  pole.castShadow = true;
  g.add(pole);

  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 10, 8),
    mat("#e5b84b", 0.3, 0.7),
  );
  finial.position.y = poleBaseY + 1.8 + poleHeight + 0.3;
  g.add(finial);

  // Animated waving Vietnamese red flag with golden star
  const flagW = 11.4;
  const flagH = 7.2;
  const flagGeo = new THREE.PlaneGeometry(flagW, flagH, 16, 4);
  flagGeo.translate(flagW / 2, 0, 0);
  const flagBaseZ = new Float32Array(flagGeo.attributes.position.count);
  const posAttr = flagGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    flagBaseZ[i] = posAttr.getZ(i);
  }

  const flagTex = createVietnamFlagTexture();
  const flagMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: flagTex,
    roughness: 0.62,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const flagMesh = new THREE.Mesh(flagGeo, flagMat);
  flagMesh.name = "ky-dai-flag";
  flagMesh.position.set(0.24, poleBaseY + 1.8 + poleHeight - flagH * 0.54, 0);
  // Orient flag slightly diagonally so its broad silhouette faces across the Perfume River
  flagMesh.rotation.y = -0.38;
  g.add(flagMesh);

  const updateFlag = (time = 0) => {
    const p = flagGeo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i);
      const py = p.getY(i);
      const u = px / flagW;
      const wave =
        (Math.sin(u * 6.5 - time * 3.6) * 0.72 +
          Math.cos(u * 10.5 - time * 5.2 + py * 0.4) * 0.24) *
        u;
      p.setZ(i, flagBaseZ[i] + wave);
    }
    p.needsUpdate = true;
    flagGeo.computeVertexNormals();
  };
  updateFlag(0);

  return { group: g, updateFlag };
}

export function createNorthBankVista(world, biaPark) {
  if (!world?.scene || !biaPark) return null;

  const group = new THREE.Group();
  group.name = "north-bank-vista";

  const riverRings = world.riverRings || [];
  const sampleNorthShoreZ = (lx) => {
    let val = -424 + 0.21 * lx;
    if (!riverRings.length) return val;
    let lo = -560;
    let hi = -260;
    const pLo = biaPark.toWorld(lx, lo);
    const pHi = biaPark.toWorld(lx, hi);
    if (
      !riverRings.some((r) => inside(pLo, r)) &&
      riverRings.some((r) => inside(pHi, r))
    ) {
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        if (riverRings.some((r) => inside(biaPark.toWorld(lx, mid), r))) hi = mid;
        else lo = mid;
      }
      val = lo;
    }
    return val;
  };

  // 1. CONTINUOUS NORTH BANK GREEN EMBANKMENT & RIVER QUAY WALL (lx: -260 .. +525)
  const bankSamples = [];
  for (let lx = -260; lx <= 520; lx += 10) {
    const zWater = sampleNorthShoreZ(lx);
    const p0 = biaPark.toWorld(lx, zWater - 2.0);
    const p1 = biaPark.toWorld(lx, zWater - 46.0);
    bankSamples.push({ lx, p0, p1 });
  }

  const bankPos = [];
  const bankUvs = [];
  const bankIdx = [];
  const wallPos = [];
  const wallIdx = [];
  bankSamples.forEach((s, i) => {
    const u = i * 0.4;
    bankPos.push(s.p0.x, 0.42, s.p0.z, s.p1.x, 0.36, s.p1.z);
    bankUvs.push(u, 0, u, 1);
    wallPos.push(s.p0.x, 0.46, s.p0.z, s.p0.x, -0.1, s.p0.z);
    if (i > 0) {
      const a = (i - 1) * 2;
      bankIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      wallIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  });

  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute("position", new THREE.Float32BufferAttribute(bankPos, 3));
  bankGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bankUvs, 2));
  bankGeo.setIndex(bankIdx);
  bankGeo.computeVertexNormals();
  const bankMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: createManicuredLawnTexture(16, 4, { striped: false, rich: true }),
    roughness: 0.92,
    metalness: 0.01,
    side: THREE.DoubleSide,
  });
  const bankMesh = new THREE.Mesh(bankGeo, bankMat);
  bankMesh.receiveShadow = true;
  group.add(bankMesh);

  const wallGeo = new THREE.BufferGeometry();
  wallGeo.setAttribute("position", new THREE.Float32BufferAttribute(wallPos, 3));
  wallGeo.setIndex(wallIdx);
  wallGeo.computeVertexNormals();
  group.add(new THREE.Mesh(wallGeo, mat("#b9b19e", 0.88, 0.02)));

  // 2. INSTANCED LUSH GREEN RIVERSIDE TREE LINE ("dãy hàng cây xanh") ACROSS NORTH SHORE
  const treePositions = [];
  for (let lx = -255; lx <= 515; lx += 13) {
    // Keep Cầu Phú Xuân approach corridor clear (~540..565)
    if (lx > 532 && lx < 568) continue;
    const zShore = sampleNorthShoreZ(lx);
    for (let row = 0; row < 3; row++) {
      // Leave a clean ceremonial opening right at Nghênh Lương Đình waterfront (lx ~ 183..207)
      if (row === 0 && Math.abs(lx - 195) < 16) continue;
      if (Math.abs(lx - 207) < 13 && row >= 1 && zShore - (8 + row * 15) < -485) {
        continue;
      }
      const jitterX = Math.sin(lx * 0.37 + row * 2.1) * 3.8;
      const depth = 7.5 + row * 14.5 + Math.cos(lx * 0.51 + row) * 3.2;
      const wp = biaPark.toWorld(lx + jitterX, zShore - depth);
      if (riverRings.some((r) => inside(wp, r))) continue;
      if (Math.hypot(wp.x - PHU_VAN_LAU.x, wp.z - PHU_VAN_LAU.z) < 14) continue;
      if (Math.hypot(wp.x - NGHENH_LUONG_DINH.x, wp.z - NGHENH_LUONG_DINH.z) < 12) continue;
      if (Math.hypot(wp.x - KY_DAI.x, wp.z - KY_DAI.z) < 26) continue;
      treePositions.push({
        x: wp.x,
        z: wp.z,
        scale: 0.92 + (((Math.abs(Math.round(lx)) + row * 7) % 5) * 0.14),
        yaw: (lx * 0.23 + row * 1.7) % (Math.PI * 2),
        tone: (Math.abs(Math.round(lx)) + row) % 3,
      });
    }
  }

  if (treePositions.length > 0) {
    const count = treePositions.length;
    const trunkGeo = new THREE.CylinderGeometry(0.24, 0.38, 4.4, 7);
    trunkGeo.translate(0, 2.2, 0);
    const canopyMainGeo = new THREE.DodecahedronGeometry(3.4, 1);
    canopyMainGeo.scale(1.15, 0.78, 1.1);
    canopyMainGeo.translate(0, 6.4, 0);
    const canopySideGeo = new THREE.DodecahedronGeometry(2.35, 1);
    canopySideGeo.scale(1.1, 0.8, 1.05);
    canopySideGeo.translate(1.5, 5.6, 1.1);

    const trunks = new THREE.InstancedMesh(
      trunkGeo,
      mat("#64513d", 0.9),
      count,
    );
    const canopyMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.86,
      metalness: 0.02,
    });
    const canopiesA = new THREE.InstancedMesh(canopyMainGeo, canopyMat, count);
    const canopiesB = new THREE.InstancedMesh(canopySideGeo, canopyMat, count);
    canopiesA.castShadow = canopiesA.receiveShadow = true;

    const palette = [
      new THREE.Color("#3b7333"),
      new THREE.Color("#49823c"),
      new THREE.Color("#2f632b"),
    ];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const tp = treePositions[i];
      dummy.position.set(tp.x, 0.3, tp.z);
      dummy.rotation.set(0, tp.yaw, 0);
      dummy.scale.setScalar(tp.scale);
      dummy.updateMatrix();
      trunks.setMatrixAt(i, dummy.matrix);
      canopiesA.setMatrixAt(i, dummy.matrix);
      canopiesB.setMatrixAt(i, dummy.matrix);
      canopiesA.setColorAt(i, palette[tp.tone]);
      canopiesB.setColorAt(i, palette[(tp.tone + 1) % palette.length]);
    }
    trunks.instanceMatrix.needsUpdate = true;
    canopiesA.instanceMatrix.needsUpdate = true;
    canopiesB.instanceMatrix.needsUpdate = true;
    if (canopiesA.instanceColor) canopiesA.instanceColor.needsUpdate = true;
    if (canopiesB.instanceColor) canopiesB.instanceColor.needsUpdate = true;
    trunks.computeBoundingSphere();
    canopiesA.computeBoundingSphere();
    canopiesB.computeBoundingSphere();
    group.add(trunks, canopiesA, canopiesB);
  }

  // 3. NGHÊNH LƯƠNG ĐÌNH, PHU VĂN LÂU & KỲ ĐÀI HUẾ ALONG THE IMPERIAL AXIS
  const nghenhLuongDinh = createNghenhLuongDinh(
    NGHENH_LUONG_DINH.x,
    NGHENH_LUONG_DINH.z,
    IMPERIAL_AXIS_YAW,
  );
  const phuVanLau = createPhuVanLau(
    PHU_VAN_LAU.x,
    PHU_VAN_LAU.z,
    IMPERIAL_AXIS_YAW,
  );
  const kyDai = createKyDaiHue(KY_DAI.x, KY_DAI.z, IMPERIAL_AXIS_YAW);
  group.add(nghenhLuongDinh, phuVanLau, kyDai.group);

  world.scene.add(group);

  return {
    group,
    treeCount: treePositions.length,
    nghenhLuongDinhPos: { ...NGHENH_LUONG_DINH },
    phuVanLauPos: { ...PHU_VAN_LAU },
    kyDaiPos: { ...KY_DAI },
    update(time = 0) {
      kyDai.updateFlag(time);
    },
  };
}
