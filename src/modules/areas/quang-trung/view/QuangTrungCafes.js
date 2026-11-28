import * as THREE from "three";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { hitsCampusWall } from "../../../../core/shared/architecture/CampusWalls.js";

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

function createRoseFenceTexture() {
  return createCafeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#485942";
    ctx.fillRect(0, 0, w, h);
    // Cream stone wall plinth along bottom 34%
    ctx.fillStyle = "#f2ebe2";
    ctx.fillRect(0, 166, w, 90);
    ctx.fillStyle = "#b85c6b";
    ctx.fillRect(0, 158, w, 10);
    // Decorative wrought-iron fence pickets
    ctx.fillStyle = "#2b3238";
    ctx.fillRect(0, 26, w, 8);
    ctx.fillRect(0, 138, w, 8);
    for (let x = 10; x < w; x += 24) {
      ctx.fillStyle = "#343b42";
      ctx.fillRect(x, 10, 7, 150);
    }
  });
}

const MALE_CAFE_PALETTES = [
  { shirt: "#2f6499", pants: "#28303b", hair: "#201c1a" },
  { shirt: "#e6dfd2", pants: "#384654", hair: "#2b2420" },
  { shirt: "#3e6e58", pants: "#26282b", hair: "#1e1a18" },
  { shirt: "#8d583a", pants: "#2b313a", hair: "#26211e" },
];

const FEMALE_CAFE_PALETTES = [
  { shirt: "#d86b7d", pants: "#2b303a", hair: "#201a18" },
  { shirt: "#f2e5b8", pants: "#3c506b", hair: "#2a201c" },
  { shirt: "#6b93b8", pants: "#f0ece4", hair: "#1c1816" },
  { shirt: "#b87fa3", pants: "#2d323a", hair: "#281e1a" },
];

export function createSeatedCafePatron({
  gender = "man",
  paletteIndex = 0,
  phase = 0,
} = {}) {
  const palette =
    gender === "woman"
      ? FEMALE_CAFE_PALETTES[paletteIndex % FEMALE_CAFE_PALETTES.length]
      : MALE_CAFE_PALETTES[paletteIndex % MALE_CAFE_PALETTES.length];

  const g = new THREE.Group();
  g.name = "cafe-seated-patron";
  g.userData.gender = gender;

  const skinMat = mat("#e4ba96", 0.72);
  const shirtMat = mat(palette.shirt, 0.78);
  const pantsMat = mat(palette.pants, 0.84);
  const hairMat = mat(palette.hair, 0.82);

  // Seated hip height matching patio chair seat (y = 0.46)
  const seatY = 0.47;

  // Thighs horizontal on seat + lower shins vertical to ground
  for (const sx of [-0.085, 0.085]) {
    const thigh = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.052, 0.22, 4, 8),
      pantsMat,
    );
    thigh.rotation.x = Math.PI * 0.5;
    thigh.position.set(sx, seatY + 0.03, 0.12);
    thigh.castShadow = true;

    const shin = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.044, 0.28, 4, 8),
      pantsMat,
    );
    shin.position.set(sx, 0.24, 0.26);
    shin.castShadow = true;

    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.05, 0.17),
      mat(gender === "woman" ? "#4e3438" : "#25282c", 0.75),
    );
    shoe.position.set(sx, 0.025, 0.31);
    g.add(thigh, shin, shoe);
  }

  // Torso (slim-waisted blouse for woman, slightly broader shoulder for man)
  const torsoRadius = gender === "woman" ? 0.135 : 0.155;
  const torso = new THREE.Mesh(
    new THREE.CapsuleGeometry(torsoRadius, 0.32, 5, 10),
    shirtMat,
  );
  torso.position.set(0, seatY + 0.24, 0.01);
  torso.castShadow = true;
  g.add(torso);

  // Head + Hair
  const headPivot = new THREE.Group();
  headPivot.position.set(0, seatY + 0.56, 0.02);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 12), skinMat);
  head.castShadow = true;
  headPivot.add(head);

  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.132, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
  );
  hairCap.position.set(0, 0.018, -0.008);
  headPivot.add(hairCap);

  if (gender === "woman") {
    // Graceful shoulder-length back hair & hair clip
    const backHair = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.095, 0.16, 4, 8),
      hairMat,
    );
    backHair.position.set(0, -0.06, -0.09);
    const ribbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.035, 0.03),
      mat("#d94c68", 0.6),
    );
    ribbon.position.set(0, 0.03, -0.13);
    headPivot.add(backHair, ribbon);
  } else {
    // Short side trim
    const frontQuiff = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 0.06),
      hairMat,
    );
    frontQuiff.position.set(0, 0.105, 0.05);
    headPivot.add(frontQuiff);
  }
  g.add(headPivot);

  // Left arm resting comfortably forward toward table edge
  const shoulderX = gender === "woman" ? 0.17 : 0.195;
  const leftArm = new THREE.Group();
  leftArm.position.set(-shoulderX, seatY + 0.38, 0.02);
  const lSleeve = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.26, 4, 8),
    shirtMat,
  );
  lSleeve.position.y = -0.13;
  const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinMat);
  lHand.position.y = -0.29;
  leftArm.add(lSleeve, lHand);
  leftArm.rotation.x = -0.62;
  g.add(leftArm);

  // Right arm holding ceramic coffee cup & saucer at chest/mouth level
  const rightArm = new THREE.Group();
  rightArm.position.set(shoulderX, seatY + 0.38, 0.02);
  const rUpper = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.042, 0.24, 4, 8),
    shirtMat,
  );
  rUpper.position.y = -0.12;
  const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), skinMat);
  rHand.position.set(-0.02, -0.26, 0.04);

  const coffeeCup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.038, 0.028, 0.07, 10),
    mat("#faf7f0", 0.3),
  );
  coffeeCup.position.set(-0.04, -0.24, 0.11);
  coffeeCup.rotation.x = Math.PI * 0.42;
  const coffeeSurface = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.01, 10),
    mat("#3b2314", 0.25),
  );
  coffeeSurface.position.set(-0.04, -0.215, 0.12);
  coffeeSurface.rotation.x = Math.PI * 0.42;

  rightArm.add(rUpper, rHand, coffeeCup, coffeeSurface);
  rightArm.rotation.x = -0.92;
  rightArm.rotation.z = 0.18;
  g.add(rightArm);

  const animate = (time) => {
    const sip = Math.max(0, Math.sin(time * 0.75 + phase));
    rightArm.rotation.x = -0.88 - sip * 0.56;
    headPivot.rotation.x = -0.05 + sip * 0.12;
    headPivot.rotation.y = Math.sin(time * 0.65 + phase * 1.7) * 0.14;
  };

  return { group: g, animate };
}

function createPatioTableSet(
  umbrellaColor = "#b93d4c",
  withUmbrella = true,
  patrons = ["man", "woman"],
  animators = null,
  seed = 0,
) {
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

  // Small coffee cups & saucers on table
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

  // 2 cafe chairs facing table, with seated men/women enjoying coffee
  const chairSides = [-0.66, 0.66];
  chairSides.forEach((sx, idx) => {
    const chair = new THREE.Group();
    chair.position.set(sx, 0, 0);
    chair.rotation.y = sx < 0 ? Math.PI * 0.5 : -Math.PI * 0.5;
    chair.add(
      box([0.38, 0.04, 0.38], "#8c5c38", [0, 0.44, 0]),
      box([0.38, 0.38, 0.04], "#8c5c38", [0, 0.65, -0.17]),
    );
    for (const lx of [-0.15, 0.15]) {
      for (const lz of [-0.15, 0.15]) {
        chair.add(box([0.04, 0.44, 0.04], "#363b40", [lx, 0.22, lz]));
      }
    }

    const gender = patrons?.[idx];
    if (gender) {
      const patron = createSeatedCafePatron({
        gender,
        paletteIndex: seed + idx,
        phase: (seed + idx * 1.4) * 1.3,
      });
      patron.group.position.set(0, 0.02, 0.02);
      chair.add(patron.group);
      animators?.push(patron.animate);
    }

    g.add(chair);
  });

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

function addFenceSpan(parent, fenceMat, pierMat, capMat, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dz);
  if (len < 0.2) return;
  const yaw = Math.atan2(-dz, dx);
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;

  const panel = new THREE.Mesh(new THREE.BoxGeometry(len, 1.58, 0.18), fenceMat);
  panel.position.set(mx, 0.86, mz);
  panel.rotation.y = yaw;
  panel.castShadow = panel.receiveShadow = true;
  parent.add(panel);

  const posts = Math.max(1, Math.round(len / 5.2));
  for (let i = 0; i <= posts; i++) {
    const t = i / posts;
    const px = x1 + dx * t;
    const pz = z1 + dz * t;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.78, 0.36), pierMat);
    post.position.set(px, 0.96, pz);
    post.rotation.y = yaw;
    post.castShadow = true;
    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.46), capMat);
    cap.position.set(px, 1.88, pz);
    cap.rotation.y = yaw;
    parent.add(post, cap);
  }
}

export function buildRoseGardenCafe({ toWorld, roadYaw, cameraObstacles = [] }) {
  // Expanded Rose Garden Café immediately east of Quang Trung campus:
  // side ∈ [39.0 .. 61.5] (w = 22.5), fwd ∈ [1.5 .. 63.5] (d = 62.0)
  // Connects to Quang Trung's teacher parking cổng phụ at side = 37.2, fwd = 58.5
  const group = new THREE.Group();
  group.name = "quang-trung-rose-garden-cafe";

  const animators = [];
  const minSide = 39.0;
  const maxSide = 61.5;
  const minFwd = 1.5;
  const maxFwd = 63.5;
  const centerSide = (minSide + maxSide) / 2; // 50.25
  const centerFwd = (minFwd + maxFwd) / 2; // 32.5
  const w = maxSide - minSide; // 22.5
  const d = maxFwd - minFwd; // 62.0
  const hw = w / 2; // 11.25
  const hd = d / 2; // 31.0

  const origin = toWorld(centerSide, centerFwd);
  group.position.set(origin.x, 0.23, origin.z);
  group.rotation.y = roadYaw;

  // Notice: in local frame (rotation.y = roadYaw): worldSide = centerSide + x, worldFwd = centerFwd - z
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

  // Ornamental rear grass lawns flanking central walkway
  const grassMat = mat("#4d8b3e", 0.9);
  for (const gx of [-6.4, 6.4]) {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.04, 24.0), grassMat);
    bed.position.set(gx, 0.09, -14.8);
    bed.receiveShadow = true;
    group.add(bed);
  }

  // Full 4-sided Rose Garden perimeter fence with 2 open gates:
  // 1) Front Rose Arch Gate on Nguyễn Huệ: x ∈ [-2.4 .. 2.4], z = +hd (fwd = 1.5)
  // 2) West Side Gate opposite Quang Trung cổng phụ (fwd = 58.5 -> z = 32.5 - 58.5 = -26.0): z ∈ [-28.2 .. -23.8], x = -hw
  const fenceGroup = new THREE.Group();
  fenceGroup.name = "rose-garden-fence";
  const fenceTex = createRoseFenceTexture();
  const fenceMat = new THREE.MeshStandardMaterial({
    color: fenceTex ? "#ffffff" : "#343b42",
    map: fenceTex,
    roughness: 0.72,
  });
  const pierMat = mat("#f4ede3", 0.78);
  const capMat = mat("#b85c6b", 0.65);

  const localWallSpans = [
    // Front edge (z = +hd) leaving 4.8m front arch gate
    [-hw, hd, -2.4, hd],
    [2.4, hd, hw, hd],
    // East edge (x = +hw) full length
    [hw, hd, hw, -hd],
    // Rear edge (z = -hd) full length
    [hw, -hd, -hw, -hd],
    // West edge (x = -hw) leaving 4.4m side gate at z ∈ [-28.2 .. -23.8] (fwd 56.3..60.7)
    [-hw, -hd, -hw, -28.2],
    [-hw, -23.8, -hw, hd],
  ];

  const fenceSegments = [];
  for (const [x1, z1, x2, z2] of localWallSpans) {
    addFenceSpan(fenceGroup, fenceMat, pierMat, capMat, x1, z1, x2, z2);
    fenceSegments.push({
      a: toWorld(centerSide + x1, centerFwd - z1),
      b: toWorld(centerSide + x2, centerFwd - z2),
    });
  }
  group.add(fenceGroup);

  // Main 2-story Rose Garden Villa Café house centered near z = +4.8 (fwd = 27.7)
  const houseW = 12.2;
  const houseD = 8.8;
  const houseH = 6.6;
  const houseZ = 4.8;
  const wallTex = createCafeWallTexture("#f6ece0", "#7b4b4c", true);
  const houseMesh = new THREE.Mesh(
    new THREE.BoxGeometry(houseW, houseH, houseD),
    new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#f6ece0",
      map: wallTex,
      roughness: 0.72,
    }),
  );
  houseMesh.position.set(0, houseH / 2 + 0.08, houseZ);
  houseMesh.castShadow = houseMesh.receiveShadow = true;
  group.add(houseMesh);
  cameraObstacles.push(houseMesh);

  // Terracotta-rose pitched roof
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(houseW * 0.76, 2.4, 4),
    mat("#9e4a4e", 0.68),
  );
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1, 1, houseD / houseW);
  roof.position.set(0, houseH + 1.24, houseZ);
  roof.castShadow = true;
  group.add(roof);

  // Front & rear pergola verandas overlooking courtyard gardens
  for (const pDir of [1, -1]) {
    const vz = houseZ + pDir * (houseD / 2 + 1.15);
    for (let px = -5.4; px <= 5.4; px += 2.7) {
      group.add(box([0.18, 3.1, 0.18], "#6b442b", [px, 1.62, vz]));
    }
    group.add(box([12.0, 0.16, 2.2], "#f4eadc", [0, 3.16, vz - pDir * 0.25]));
  }

  // Storefront illuminated "ROSE GARDEN · COFFEE & TEA" signboard
  const signTex = createCafeSignTexture("ROSE GARDEN", "COFFEE · TEA · SÂN VƯỜN", {
    bg: "#5c2735",
    border: "#f4c2cb",
    titleColor: "#fff4f6",
    subColor: "#ffd8df",
    accent: "rose",
  });
  const mainSign = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 1.5),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#5c2735",
      map: signTex,
      roughness: 0.42,
    }),
  );
  mainSign.position.set(0, 4.2, houseZ + houseD / 2 + 0.16);
  group.add(mainSign);

  // Front Rose floral entrance arch at z = +hd
  for (const ax of [-2.4, 2.4]) {
    group.add(box([0.3, 3.0, 0.3], "#f4efe8", [ax, 1.55, hd]));
    group.add(createRoseBush(ax, 0.08, hd - 0.55, 0.95, "#e0486d"));
  }
  const archTop = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.15, 8, 18, Math.PI),
    mat("#3e7c39", 0.8),
  );
  archTop.position.set(0, 2.95, hd);
  group.add(archTop);

  const gateSign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.75),
    new THREE.MeshStandardMaterial({
      color: signTex ? "#ffffff" : "#5c2735",
      map: signTex,
      roughness: 0.45,
    }),
  );
  gateSign.position.set(0, 3.65, hd + 0.06);
  group.add(gateSign);

  // West Side Gate ("LỐI VÀO CỔNG PHỤ") facing Quang Trung teacher parking side gate
  const sideGateGroup = new THREE.Group();
  sideGateGroup.name = "rose-garden-west-gate";
  sideGateGroup.position.set(-hw, 0.08, -26.0);
  sideGateGroup.rotation.y = -Math.PI / 2;
  for (const sx of [-2.2, 2.2]) {
    sideGateGroup.add(box([0.36, 2.75, 0.36], "#f4ede3", [sx, 1.38, 0]));
    sideGateGroup.add(box([0.46, 0.16, 0.46], "#b85c6b", [sx, 2.8, 0]));
  }
  sideGateGroup.add(box([4.8, 0.22, 0.32], "#b85c6b", [0, 2.92, 0]));
  group.add(sideGateGroup);

  // Front garden stone fountain planter (z = +21.5 -> fwd = 11.0)
  const fountain = new THREE.Group();
  fountain.position.set(0, 0.08, 21.5);
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(1.25, 1.35, 0.44, 18),
    mat("#eae3d8", 0.78),
  );
  basin.position.y = 0.22;
  fountain.add(basin, createRoseBush(0, 0.38, 0, 1.32, "#ec5c7d"));
  group.add(fountain);

  // Rear garden open pergola pavilion (gazebo) at z = -19.5 (fwd = 52.0)
  const gazebo = new THREE.Group();
  gazebo.name = "rose-garden-rear-gazebo";
  gazebo.position.set(0, 0.08, -19.5);
  for (const gx of [-2.4, 2.4]) {
    for (const gz of [-2.4, 2.4]) {
      gazebo.add(box([0.22, 2.95, 0.22], "#6b442b", [gx, 1.48, gz]));
    }
  }
  const gRoof = new THREE.Mesh(
    new THREE.ConeGeometry(4.2, 1.35, 4),
    mat("#9e4a4e", 0.68),
  );
  gRoof.rotation.y = Math.PI / 4;
  gRoof.position.y = 3.55;
  gRoof.castShadow = true;
  gazebo.add(gRoof);
  group.add(gazebo);

  // Rear reflecting pool at z = -9.5 (fwd = 42.0)
  const pond = new THREE.Group();
  pond.position.set(0, 0.08, -9.5);
  const pondRim = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.2, 0.32, 22),
    mat("#e5ded2", 0.8),
  );
  pondRim.position.y = 0.16;
  const pondWater = new THREE.Mesh(
    new THREE.CylinderGeometry(1.85, 1.85, 0.26, 22),
    mat("#2f8fa1", 0.18, 0.1),
  );
  pondWater.position.y = 0.21;
  pond.add(pondRim, pondWater);
  group.add(pond);

  // Outdoor patio tables with seated coffee patrons + open player seats throughout front courtyard AND spacious rear sanctuary
  const tableSpecs = [
    // Front rose courtyard (6 tables)
    [-6.0, 14.5, "#b93d4c", ["man", null]],
    [6.0, 14.5, "#2f7556", ["woman", "man"]],
    [-6.0, 20.5, "#2f7556", [null, "woman"]],
    [6.0, 20.5, "#b93d4c", ["woman", "man"]],
    [-6.0, 26.2, "#b93d4c", ["woman", null]],
    [6.0, 26.2, "#2f7556", ["man", "man"]],
    // Rear garden sanctuary (6 tables)
    [-6.4, -7.2, "#2f7556", ["man", null]],
    [6.4, -7.2, "#b93d4c", ["woman", "man"]],
    [-6.4, -14.8, "#b93d4c", [null, "man"]],
    [6.4, -14.8, "#2f7556", ["man", "woman"]],
    [-6.4, -22.2, "#2f7556", ["man", null]],
    [6.4, -22.2, "#b93d4c", ["woman", "man"]],
  ];
  const cafeSpots = [];
  tableSpecs.forEach(([tx, tz, uColor, patrons], idx) => {
    const t = createPatioTableSet(uColor, true, patrons, animators, idx);
    t.position.set(tx, 0.08, tz);
    group.add(t);
    const tblWorld = toWorld(centerSide + tx, centerFwd - tz);
    [-0.66, 0.66].forEach((sx, cIdx) => {
      if (patrons[cIdx]) return;
      const seatWorld = toWorld(centerSide + tx + sx, centerFwd - tz);
      const returnWorld = toWorld(centerSide + tx + sx * 1.8, centerFwd - tz);
      cafeSpots.push({
        id: `rose-garden-seat-${idx}-${cIdx}`,
        venueId: "rose-garden-cafe",
        title: "Rose Garden Coffee & Tea",
        x: seatWorld.x,
        y: 0.31,
        z: seatWorld.z,
        heading: Math.atan2(tblWorld.x - seatWorld.x, tblWorld.z - seatWorld.z),
        returnPose: { x: returnWorld.x, y: 0.31, z: returnWorld.z },
      });
    });
  });

  // Rose bushes bordering pathways
  for (let z = -27.5; z <= 27.5; z += 6.8) {
    if (Math.abs(z + 26.0) > 2.5) {
      group.add(createRoseBush(-9.8, 0.08, z, 0.95, "#e25072"));
    }
    group.add(createRoseBush(9.8, 0.08, z, 0.95, "#f07292"));
  }

  // Footprints & obstacles in world/quangTrung coords
  const halfHW = houseW / 2;
  const halfHD = houseD / 2;
  const houseFwd = centerFwd - houseZ;
  const buildingPoly = [
    toWorld(centerSide - halfHW, houseFwd - halfHD),
    toWorld(centerSide + halfHW, houseFwd - halfHD),
    toWorld(centerSide + halfHW, houseFwd + halfHD),
    toWorld(centerSide - halfHW, houseFwd + halfHD),
    toWorld(centerSide - halfHW, houseFwd - halfHD),
  ];

  const obstacles = [
    { side: centerSide, fwd: centerFwd - 21.5, radius: 1.55 }, // front fountain
    { side: centerSide, fwd: centerFwd + 9.5, radius: 2.3 }, // rear pond
    { side: centerSide, fwd: centerFwd + 19.5, radius: 2.8 }, // rear gazebo
    ...tableSpecs.map(([tx, tz]) => ({
      side: centerSide + tx,
      fwd: centerFwd - tz,
      radius: 0.5,
    })),
  ];

  const lotBounds = {
    minSide: minSide - 0.5,
    maxSide: maxSide + 0.5,
    minFwd: minFwd - 0.5,
    maxFwd: maxFwd + 0.5,
  };

  const lotPoly = [
    toWorld(minSide, minFwd),
    toWorld(maxSide, minFwd),
    toWorld(maxSide, maxFwd),
    toWorld(minSide, maxFwd),
    toWorld(minSide, minFwd),
  ];

  const inLot = (wx, wz) => inside({ x: wx, z: wz }, lotPoly);

  const canRide = (wx, wz) => {
    if (hitsCampusWall({ x: wx, z: wz }, fenceSegments, 0.55)) return false;
    if (!inLot(wx, wz)) return null;
    if (inside({ x: wx, z: wz }, buildingPoly)) return false;
    return true;
  };

  return {
    group,
    buildingPoly,
    obstacles,
    fenceSegments,
    lotBounds,
    lotPoly,
    cafeSpots,
    venue: {
      id: "rose-garden-cafe",
      title: "Rose Garden Coffee & Tea",
      ...toWorld(centerSide, centerFwd - hd),
    },
    inLot,
    canRide,
    update: (time) => {
      for (const fn of animators) fn(time);
    },
  };
}

export function buildNguyenHueCafeStrip({ toWorld, roadYaw, cameraObstacles = [] }) {
  // Strip of 5 cafés on the south side of Nguyễn Huệ (opposite Bệnh viện RHM Huế -> Dòng Chúa Cứu Thế)
  const stripGroup = new THREE.Group();
  stripGroup.name = "quang-trung-nguyen-hue-cafes";
  const animators = [];

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
  const cafeSpots = [];
  const venues = [];
  let tableSeed = 10;

  for (const spec of cafeSpecs) {
    const cafe = new THREE.Group();
    cafe.name = spec.name;
    const pos = toWorld(spec.side, spec.fwd);
    cafe.position.set(pos.x, 0.23, pos.z);
    // Rotate Math.PI around Y relative to roadYaw so +z faces +fwd (across Nguyễn Huệ toward Bệnh viện RHM Huế)
    cafe.rotation.y = roadYaw + Math.PI;

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

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(spec.w * 0.74, 1.65, 4),
      mat(spec.roofHex, 0.7),
    );
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1, 1, spec.d / spec.w);
    roof.position.set(0, spec.h + 0.88, -0.3);
    roof.castShadow = true;
    cafe.add(roof);

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(spec.w - 0.3, 0.14, 1.4),
      mat(spec.awningHex, 0.75),
    );
    awning.position.set(0, 2.75, spec.d / 2 + 0.25);
    awning.rotation.x = 0.28;
    awning.castShadow = true;
    cafe.add(awning);

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

    // Outdoor sidewalk patio seating tables with seated patrons & open player seats
    const displayTitle = spec.title
      .toLowerCase()
      .replace(/(^|\s)\S/g, (m) => m.toUpperCase());
    spec.patioOffsets.forEach((tx, idx) => {
      const patrons = idx % 2 === 0 ? ["man", null] : [null, "woman"];
      const tableZ = spec.d / 2 + 0.9;
      const table = createPatioTableSet(
        spec.umbrellaHex,
        true,
        patrons,
        animators,
        tableSeed++,
      );
      table.position.set(tx, 0.07, tableZ);
      cafe.add(table);
      const tblSide = spec.side - tx;
      const tblFwd = spec.fwd + tableZ;
      obstacles.push({
        side: tblSide,
        fwd: tblFwd,
        radius: 0.5,
      });
      const tblWorld = toWorld(tblSide, tblFwd);
      [-0.66, 0.66].forEach((sx, cIdx) => {
        if (patrons[cIdx]) return;
        const seatWorld = toWorld(spec.side - (tx + sx), tblFwd);
        const returnWorld = toWorld(spec.side - (tx + sx * 1.85), tblFwd);
        cafeSpots.push({
          id: `${spec.name}-seat-${idx}-${cIdx}`,
          venueId: spec.name,
          title: displayTitle,
          x: seatWorld.x,
          y: 0.3,
          z: seatWorld.z,
          heading: Math.atan2(tblWorld.x - seatWorld.x, tblWorld.z - seatWorld.z),
          returnPose: { x: returnWorld.x, y: 0.3, z: returnWorld.z },
        });
      });
    });
    venues.push({
      id: spec.name,
      title: displayTitle,
      ...toWorld(spec.side, spec.fwd + spec.d / 2 + 1.0),
    });

    for (const px of [-spec.w / 2 + 0.45, spec.w / 2 - 0.45]) {
      cafe.add(createRoseBush(px, 0.07, spec.d / 2 + 1.25, 0.72, "#e65a7b"));
    }

    stripGroup.add(cafe);

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

  return {
    group: stripGroup,
    buildingPolys,
    obstacles,
    lotBoundsList,
    cafeSpots,
    venues,
    update: (time) => {
      for (const fn of animators) fn(time);
    },
  };
}
