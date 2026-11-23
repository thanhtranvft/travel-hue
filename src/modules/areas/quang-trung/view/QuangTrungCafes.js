import * as THREE from "three";
import { box, mat } from "../../../../core/shared/architecture/shared.js";

function createCafeCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
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

function createCafeSignTexture(title, subtitle, {
  bg = "#2b4638",
  border = "#e7c98b",
  titleColor = "#fff8e7",
  subColor = "#f4d38c",
  accent = null,
} = {}) {
  return createCafeCanvasTexture(768, 192, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    if (accent === "rose" && ctx.beginPath && ctx.arc) {
      ctx.fillStyle = "#d95b72";
      ctx.beginPath();
      ctx.arc(84, h / 2, 42, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f7a8b8";
      ctx.beginPath();
      ctx.arc(84, h / 2, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = titleColor;
    ctx.font = "bold 46px 'Be Vietnam Pro', Georgia, serif";
    ctx.fillText(title, accent ? w * 0.56 : w / 2, h * 0.39, w - (accent ? 170 : 60));
    ctx.fillStyle = subColor;
    ctx.font = "600 26px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(subtitle, accent ? w * 0.56 : w / 2, h * 0.74, w - (accent ? 170 : 60));
  });
}

function createCafeWallTexture(wallHex = "#efe5d1", trimHex = "#5d4230", warmWindow = true) {
  return createCafeCanvasTexture(512, 384, (ctx, w, h) => {
    ctx.fillStyle = wallHex;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#7a736b";
    ctx.fillRect(0, h - 36, w, 36);
    ctx.fillStyle = trimHex;
    ctx.fillRect(0, 0, w, 16);

    for (const wx of [44, 196, 348]) {
      ctx.fillStyle = trimHex;
      ctx.fillRect(wx - 6, 62, 132, 210);
      ctx.fillStyle = warmWindow ? "#f4c87a" : "#3a5064";
      ctx.fillRect(wx, 68, 120, 198);
      if (warmWindow) {
        ctx.fillStyle = "rgba(255, 245, 210, 0.52)";
        ctx.fillRect(wx + 12, 82, 46, 170);
      }
      ctx.fillStyle = trimHex;
      ctx.fillRect(wx + 58, 68, 5, 198);
      ctx.fillRect(wx, 158, 120, 5);
    }
  });
}

function createCobbleTexture(base = "#cbc3b6", stone = "#b3ab9d") {
  return createCafeCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#8a8277";
      ctx.fillRect(0, 0, w, h);
      const step = 32;
      for (let y = 0; y < h; y += step) {
        const off = (y / step) % 2 ? 16 : 0;
        for (let x = -step; x < w + step; x += step) {
          ctx.fillStyle = ((x + y) / step) % 2 === 0 ? base : stone;
          ctx.fillRect(x + off + 2, y + 2, step - 4, step - 4);
        }
      }
    },
    4,
    4,
  );
}

function createPatioTableSet(umbrellaColor = "#b93d4c", withUmbrella = true) {
  const g = new THREE.Group();
  const metal = mat("#363b40", 0.45, 0.6);
  const wood = mat("#9a6a42", 0.72);

  // Table base, stem, round tabletop
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.04, 12),
    metal,
  );
  base.position.y = 0.02;
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.72, 8),
    metal,
  );
  stem.position.y = 0.38;
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.45, 0.045, 16),
    wood,
  );
  top.position.y = 0.74;
  top.castShadow = top.receiveShadow = true;
  g.add(base, stem, top);

  // Small coffee cups on table
  for (const [cx, cz] of [
    [-0.14, 0.08],
    [0.14, -0.06],
  ]) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.032, 0.07, 8),
      mat("#f7f4ec", 0.35),
    );
    cup.position.set(cx, 0.79, cz);
    g.add(cup);
  }

  // 2 cafe chairs facing table
  for (const sx of [-0.66, 0.66]) {
    const chair = new THREE.Group();
    chair.position.set(sx, 0, 0);
    chair.rotation.y = sx < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    chair.add(
      box([0.36, 0.04, 0.36], "#8c5c38", [0, 0.44, 0]),
      box([0.36, 0.36, 0.04], "#8c5c38", [0, 0.64, -0.16]),
    );
    for (const lx of [-0.14, 0.14]) {
      for (const lz of [-0.14, 0.14]) {
        chair.add(box([0.04, 0.44, 0.04], "#363b40", [lx, 0.22, lz]));
      }
    }
    g.add(chair);
  }

  if (withUmbrella) {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.024, 2.25, 8),
      metal,
    );
    pole.position.y = 1.15;
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 0.36, 10, 1, true),
      mat(umbrellaColor, 0.8, 0, { side: THREE.DoubleSide }),
    );
    canopy.position.y = 2.25;
    canopy.castShadow = true;
    g.add(pole, canopy);
  }

  return g;
}

function createRoseBush(x, y, z, scale = 1, blossomHex = "#e25072") {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const bush = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.46 * scale, 1),
    mat("#357431", 0.86),
  );
  bush.scale.set(1.25, 0.82, 1.15);
  bush.position.y = 0.34 * scale;
  bush.castShadow = true;
  g.add(bush);

  const roseMat = mat(blossomHex, 0.65);
  for (const [rx, ry, rz] of [
    [0.18, 0.52, 0.15],
    [-0.22, 0.46, 0.18],
    [0.02, 0.62, -0.14],
    [-0.14, 0.44, -0.22],
    [0.24, 0.38, -0.1],
  ]) {
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.08 * scale, 7, 6), roseMat);
    bloom.position.set(rx * scale, ry * scale, rz * scale);
    g.add(bloom);
  }
  return g;
}

export function buildRoseGardenCafe({ toWorld, roadYaw, cameraObstacles = [] }) {
  // Located directly beside Trường Tiểu học Quang Trung's right fence: side [38.5..55.5], fwd [1.5..22.5]
  const group = new THREE.Group();
  group.name = "quang-trung-rose-garden-cafe";

  const centerSide = 47.0;
  const centerFwd = 12.0;
  const origin = toWorld(centerSide, centerFwd);
  group.position.set(origin.x, 0.23, origin.z);
  group.rotation.y = roadYaw;

  // Notice: in this local group (rotation.y = roadYaw), +x = +side, -z = +fwd (away from Nguyễn Huệ), +z = -fwd (toward Nguyễn Huệ)
  const w = 16.6;
  const d = 20.6;
  const cobbleTex = createCobbleTexture("#dfd6c8", "#c9beb0");
  const terrace = new THREE.Mesh(
    new THREE.BoxGeometry(w, 0.08, d),
    new THREE.MeshStandardMaterial({
      color: cobbleTex ? "#ffffff" : "#d8cfc1",
      map: cobbleTex,
      roughness: 0.85,
    }),
  );
  terrace.position.set(0, 0.04, 0);
  terrace.receiveShadow = true;
  group.add(terrace);

  // Main 2-story Rose Garden Villa Café house at rear half of lot (local z = -4.5 -> fwd = 16.5)
  const houseW = 11.4;
  const houseD = 8.4;
  const houseH = 6.6;
  const wallTex = createCafeWallTexture("#f6ece0", "#7b4b4c", true);
  const houseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(houseW, houseH, houseD),
    new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#f6ece0",
      map: wallTex,
      roughness: 0.72,
    }),
  );
  houseMesh.position.set(0, houseH / 2 + 0.08, -4.4);
  houseMesh.castShadow = houseMesh.receiveShadow = true;
  group.add(houseMesh);
  cameraObstacles.push(houseMesh);

  // Terracotta-rose pitched roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(houseW * 0.76, 2.3, 4),
    mat("#9e4a4e", 0.68),
  );
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, houseD / houseW);
  roof.position.set(0, houseH + 1.2, -4.4);
  roof.castShadow = true;
  group.add(roof);

  // Wooden front pergola veranda overlooking garden courtyard
  for (let px = -5.0; px <= 5.0; px += 2.5) {
    group.add(box([0.18, 3.1, 0.18], "#6b442b", [px, 1.62, 1.4]));
  }
  for (let pz = -0.2; pz <= 1.6; pz += 0.45) {
    group.add(box([11.2, 0.09, 0.12], "#7a4e32", [0, 3.22, pz]));
  }
  group.add(box([11.4, 0.16, 2.2], "#f4eadc", [0, 3.14, 0.6]));

  // Storefront illuminated "ROSE GARDEN · COFFEE & TEA" signboard
  const signTex = createCafeSignTexture("ROSE GARDEN", "COFFEE · TEA · GARDEN", {
    bg: "#5c2735",
    border: "#f4c2cb",
    titleColor: "#fff4f6",
    subColor: "#ffd8df",
    accent: "rose",
  });
  const mainSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6.8, 1.45),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#5c2735",
      map: signTex,
      roughness: 0.42,
    }),
  );
  mainSign.position.set(0, 4.15, -0.12);
  group.add(mainSign);

  // Low white perimeter garden fence along Nguyễn Huệ frontage with central Rose Arch Entrance
  for (const [fx, fw] of [
    [-5.3, 5.8],
    [5.3, 5.8],
  ]) {
    group.add(
      box([fw, 0.85, 0.18], "#f4efe8", [fx, 0.5, 10.1]),
      box([fw + 0.1, 0.1, 0.24], "#b85c6b", [fx, 0.96, 10.1]),
    );
  }
  // Rose floral entrance arch
  for (const ax of [-2.0, 2.0]) {
    group.add(box([0.24, 2.9, 0.24], "#f4efe8", [ax, 1.5, 10.1]));
    group.add(createRoseBush(ax, 0.08, 9.65, 0.95, "#e0486d"));
  }
  const archTop = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.14, 8, 18, Math.PI),
    mat("#3e7c39", 0.8),
  );
  archTop.position.set(0, 2.85, 10.1);
  group.add(archTop);

  const gateSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.68),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#5c2735",
      map: signTex,
      roughness: 0.45,
    }),
  );
  gateSign.position.set(0, 3.45, 10.15);
  group.add(gateSign);

  // Outdoor garden patio table sets + lush blooming rose bushes + center ornamental planter
  const tableOffsets = [
    [-4.6, 4.2, "#b93d4c"],
    [4.6, 4.2, "#2f7556"],
    [-4.6, 7.6, "#2f7556"],
    [4.6, 7.6, "#b93d4c"],
  ];
  for (const [tx, tz, uColor] of tableOffsets) {
    const t = createPatioTableSet(uColor, true);
    t.position.set(tx, 0.08, tz);
    group.add(t);
  }

  // Central stone rose fountain planter in garden courtyard
  const fountain = new THREE.Group();
  fountain.position.set(0, 0.08, 5.8);
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.1, 1.2, 0.42, 16),
    mat("#eae3d8", 0.78),
  );
  basin.position.y = 0.21;
  const centerBush = createRoseBush(0, 0.36, 0, 1.25, "#ec5c7d");
  fountain.add(basin, centerBush);
  group.add(fountain);

  for (const [rx, rz, col] of [
    [-6.9, 2.2, "#e25072"],
    [-6.9, 6.0, "#f28ca6"],
    [-6.9, 8.8, "#d93b5c"],
    [6.9, 2.2, "#f28ca6"],
    [6.9, 6.0, "#e25072"],
    [6.9, 8.8, "#d93b5c"],
  ]) {
    group.add(createRoseBush(rx, 0.08, rz, 1.0, col));
  }

  // Return polygon footprints & obstacle circles for world collision / grass-tree exclusion
  const halfHW = houseW / 2;
  const halfHD = houseD / 2;
  const houseFwd = centerFwd + 4.4;
  const buildingPoly = [
    toWorld(centerSide - halfHW, houseFwd - halfHD),
    toWorld(centerSide + halfHW, houseFwd - halfHD),
    toWorld(centerSide + halfHW, houseFwd + halfHD),
    toWorld(centerSide - halfHW, houseFwd + halfHD),
    toWorld(centerSide - halfHW, houseFwd - halfHD),
  ];

  const obstacles = [
    { side: centerSide, fwd: centerFwd - 5.8, radius: 1.4 }, // fountain
    ...tableOffsets.map(([tx, tz]) => ({
      side: centerSide + tx,
      fwd: centerFwd - tz,
      radius: 1.15,
    })),
  ];

  const lotBounds = {
    minSide: centerSide - w / 2 - 0.5,
    maxSide: centerSide + w / 2 + 0.5,
    minFwd: centerFwd - d / 2 - 0.5,
    maxFwd: centerFwd + d / 2 + 0.5,
  };

  return { group, buildingPoly, obstacles, lotBounds };
}

export function buildNguyenHueCafeStrip({ toWorld, roadYaw, cameraObstacles = [] }) {
  // Strip of 5 cafés on the south side of Nguyễn Huệ (opposite Bệnh viện RHM Huế -> Dòng Chúa Cứu Thế)
  const stripGroup = new THREE.Group();
  stripGroup.name = "quang-trung-nguyen-hue-cafes";

  const cafeSpecs = [
    {
      name: "cafe-muoi-hue",
      title: "CÀ PHÊ MUỐI HUẾ",
      subtitle: "ĐẶC SẢN CỐ ĐÔ · TAKE AWAY",
      side: -72.2,
      fwd: -22.2,
      w: 7.4,
      d: 4.6,
      h: 4.4,
      floors: 1,
      wallHex: "#e8cfa4",
      trimHex: "#5f3924",
      roofHex: "#8d3c28",
      signBg: "#4f2d1b",
      signBorder: "#f2c678",
      awningHex: "#9e3e28",
      umbrellaHex: "#b8452e",
      patioOffsets: [-2.1, 2.1],
    },
    {
      name: "cafe-co-do",
      title: "CỐ ĐÔ COFFEE & TEA",
      subtitle: "KHÔNG GIAN SÂN VƯỜN · HƯƠNG HUẾ",
      side: -61.8,
      fwd: -24.4,
      w: 9.2,
      d: 6.8,
      h: 7.2,
      floors: 2,
      wallHex: "#efe2c8",
      trimHex: "#355342",
      roofHex: "#693e2e",
      signBg: "#244736",
      signBorder: "#ebd08b",
      awningHex: "#2e6347",
      umbrellaHex: "#2a6f54",
      patioOffsets: [-2.8, 0, 2.8],
    },
    {
      name: "cafe-moc-garden",
      title: "MỘC CAFÉ",
      subtitle: "CÀ PHÊ RANG XAY · BÁNH NGỌT",
      side: -51.8,
      fwd: -23.2,
      w: 7.4,
      d: 5.6,
      h: 4.6,
      floors: 1,
      wallHex: "#d8b48a",
      trimHex: "#4b3322",
      roofHex: "#544133",
      signBg: "#3d281a",
      signBorder: "#e8be76",
      awningHex: "#c26c34",
      umbrellaHex: "#c96c32",
      patioOffsets: [-2.0, 2.0],
    },
    {
      name: "cafe-hue-xua",
      title: "HUẾ XƯA CAFÉ",
      subtitle: "ĐỐI DIỆN CỔNG TRƯỜNG · TRÀ & CÀ PHÊ",
      side: -31.0,
      fwd: -21.8,
      w: 8.4,
      d: 4.2,
      h: 4.8,
      floors: 1,
      wallHex: "#f2e7cf",
      trimHex: "#285740",
      roofHex: "#7c3c2e",
      signBg: "#1e4b35",
      signBorder: "#f0d285",
      awningHex: "#286949",
      umbrellaHex: "#2e7351",
      patioOffsets: [-2.4, 2.4],
    },
    {
      name: "cafe-la-nguyen-hue",
      title: "LA CAFÉ · BISTRO",
      subtitle: "ESPRESSO · MATCHA · DÒNG CHÚA CỨU THẾ",
      side: -20.6,
      fwd: -21.8,
      w: 8.4,
      d: 4.2,
      h: 5.0,
      floors: 1,
      wallHex: "#ebe8e1",
      trimHex: "#2e3d4c",
      roofHex: "#3a4c5e",
      signBg: "#213242",
      signBorder: "#e5c882",
      awningHex: "#2466a8",
      umbrellaHex: "#1d6ab5",
      patioOffsets: [-2.4, 2.4],
    },
  ];

  const buildingPolys = [];
  const obstacles = [];
  const lotBoundsList = [];

  for (const spec of cafeSpecs) {
    const cafe = new THREE.Group();
    cafe.name = spec.name;
    const pos = toWorld(spec.side, spec.fwd);
    cafe.position.set(pos.x, 0.23, pos.z);
    // Rotate Math.PI around Y relative to roadYaw so +z faces +fwd (across Nguyễn Huệ toward Bệnh viện RHM Huế)
    cafe.rotation.y = roadYaw + Math.PI;

    // Front cobblestone sidewalk terrace extending cleanly toward street edge without entering walker lane
    const terraceD = spec.d + 1.8;
    const cobbleTex = createCobbleTexture("#d4cbbe", "#beb5a6");
    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w + 0.8, 0.07, terraceD),
      new THREE.MeshStandardMaterial({
        color: cobbleTex ? "#ffffff" : "#d0c8bb",
        map: cobbleTex,
        roughness: 0.85,
      }),
    );
    pad.position.set(0, 0.035, 0.6);
    pad.receiveShadow = true;
    cafe.add(pad);

    // Cafe building shell
    const wallTex = createCafeWallTexture(spec.wallHex, spec.trimHex, true);
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w, spec.h, spec.d),
      new THREE.MeshStandardMaterial({
        color: wallTex ? "#ffffff" : spec.wallHex,
        map: wallTex,
        roughness: 0.72,
      }),
    );
    body.position.set(0, spec.h / 2 + 0.07, -0.3);
    body.castShadow = body.receiveShadow = true;
    cafe.add(body);
    cameraObstacles.push(body);

    // Pitched hip/gable cap roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(spec.w * 0.74, 1.65, 4),
      mat(spec.roofHex, 0.7),
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, spec.d / spec.w);
    roof.position.set(0, spec.h + 0.88, -0.3);
    roof.castShadow = true;
    cafe.add(roof);

    // Sloped canvas storefront awning facing Nguyễn Huệ
    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w - 0.3, 0.14, 1.4),
      mat(spec.awningHex, 0.75),
    );
    awning.position.set(0, 2.75, spec.d / 2 + 0.25);
    awning.rotation.x = 0.28;
    awning.castShadow = true;
    cafe.add(awning);

    // Crisp printed café signboard
    const signTex = createCafeSignTexture(spec.title, spec.subtitle, {
      bg: spec.signBg,
      border: spec.signBorder,
    });
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(spec.w * 0.82, 1.15),
      new THREE.MeshStandardMaterial({
        color: signTex ? "#ffffff" : spec.signBg,
        map: signTex,
        roughness: 0.44,
      }),
    );
    signMesh.position.set(0, 3.62, spec.d / 2 - 0.25);
    cafe.add(signMesh);

    // Outdoor sidewalk patio seating tables + potted rose planters
    for (const tx of spec.patioOffsets) {
      const table = createPatioTableSet(spec.umbrellaHex, true);
      table.position.set(tx, 0.07, spec.d / 2 + 0.9);
      cafe.add(table);
      obstacles.push({
        side: spec.side - tx,
        fwd: spec.fwd + (spec.d / 2 + 0.9),
        radius: 0.95,
      });
    }
    for (const px of [-spec.w / 2 + 0.45, spec.w / 2 - 0.45]) {
      cafe.add(createRoseBush(px, 0.07, spec.d / 2 + 1.25, 0.72, "#e65a7b"));
    }

    stripGroup.add(cafe);

    // Building footprint in world space (building centered at local z = -0.3 -> world fwd = spec.fwd - 0.3)
    const hw = spec.w / 2;
    const hd = spec.d / 2;
    const bFwd = spec.fwd - 0.3;
    buildingPolys.push([
      toWorld(spec.side - hw, bFwd - hd),
      toWorld(spec.side + hw, bFwd - hd),
      toWorld(spec.side + hw, bFwd + hd),
      toWorld(spec.side - hw, bFwd + hd),
      toWorld(spec.side - hw, bFwd - hd),
    ]);

    lotBoundsList.push({
      minSide: spec.side - hw - 0.6,
      maxSide: spec.side + hw + 0.6,
      minFwd: spec.fwd - hd - 0.6,
      maxFwd: spec.fwd + hd + 1.8,
    });
  }

  return { group: stripGroup, buildingPolys, obstacles, lotBoundsList };
}
