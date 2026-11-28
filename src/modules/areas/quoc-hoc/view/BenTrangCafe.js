import * as THREE from "three";
import { box, mat } from "../../../../core/shared/architecture/shared.js";

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

function createMossyStoneWallTexture() {
  return createCanvasTex(
    1024,
    256,
    (ctx, w, h) => {
      // Dark stone mortar base
      ctx.fillStyle = "#484a45";
      ctx.fillRect(0, 0, w, h);

      // Irregular polygonal granite rubble stones across retaining wall
      const shades = ["#686a64", "#777971", "#5b5d57", "#84857c", "#50524c"];
      const cols = 32;
      const rows = 8;
      const cw = w / cols;
      const ch = h / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const jitterX = ((r * 17 + c * 31) % 7) - 3;
          const jitterY = ((r * 13 + c * 23) % 5) - 2;
          const x = c * cw + (r % 2 ? cw * 0.35 : 0) + jitterX;
          const y = r * ch + jitterY;
          ctx.fillStyle = shades[(r * 5 + c * 3) % shades.length];
          ctx.fillRect(x + 2, y + 2, cw - 5, ch - 5);
        }
      }

      // Rich cascading emerald-olive moss patches draping along top & stone seams
      const mossTones = ["#52752c", "#668b38", "#446324", "#769c42"];
      for (let i = 0; i < 42; i++) {
        const mx = (i * 25.4) % w;
        const drop = 42 + ((i * 37) % 145);
        const rad = 18 + ((i * 19) % 28);
        ctx.fillStyle = mossTones[i % mossTones.length];
        if (typeof ctx.arc === "function") {
          for (let y = 0; y < drop; y += 16) {
            ctx.beginPath();
            ctx.arc(
              mx + Math.sin(y * 0.08 + i) * 7,
              y,
              Math.max(7, rad * (1 - y / (drop * 1.15))),
              0,
              Math.PI * 2,
            );
            ctx.fill();
          }
        } else {
          ctx.fillRect(mx - rad / 2, 0, rad, drop);
        }
      }
      // Continuous mossy top strip
      ctx.fillStyle = "#5b8032";
      ctx.fillRect(0, 0, w, 18);
    },
    1,
    1,
  );
}

function createTimberCladdingTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#7a5337";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        const shade = ((x * 7) % 5) * 4 - 8;
        ctx.fillStyle = `rgb(${118 + shade}, ${80 + shade}, ${54 + shade})`;
        ctx.fillRect(x + 1, 0, 21, h);
        ctx.fillStyle = "rgba(44, 26, 15, 0.45)";
        ctx.fillRect(x, 0, 2, h);
      }
    },
    3,
    1,
  );
}

function createPaintingTexture(index) {
  return createCanvasTex(256, 160, (ctx, w, h) => {
    const palettes = [
      ["#d4e6ef", "#eef3dc", "#84a46a", "#5f7a4e"], // Misty river horizon
      ["#dce8ee", "#f3e5c7", "#5c92a4", "#3d6140"], // Boats on Perfume River
      ["#cde4f2", "#f6edd7", "#3f7d99", "#8c9f58"], // Lagoon & coastal clouds
      ["#f0d8b2", "#d98e54", "#6e7e46", "#3d4632"], // Hue citadel sunset
      ["#f5e4aa", "#f7c462", "#d97a41", "#4a5a68"], // Warm sunset water
      ["#e5eff5", "#c85d46", "#588b54", "#8a7866"], // Street café & pagoda
      ["#cfe7f5", "#65aac8", "#357196", "#e6c78c"], // Ocean wave & mountain
    ];
    const [skyTop, skyMid, water, land] = palettes[index % palettes.length];
    const g = ctx.createLinearGradient?.(0, 0, 0, h * 0.6);
    if (g) {
      g.addColorStop(0, skyTop);
      g.addColorStop(1, skyMid);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = skyTop;
    }
    ctx.fillRect(0, 0, w, h * 0.62);

    ctx.fillStyle = water;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

    // Distant mountains / riverbank trees
    ctx.fillStyle = land;
    ctx.beginPath?.();
    ctx.moveTo?.(0, h * 0.62);
    ctx.lineTo?.(w * 0.25, h * 0.44);
    ctx.lineTo?.(w * 0.56, h * 0.56);
    ctx.lineTo?.(w * 0.82, h * 0.41);
    ctx.lineTo?.(w, h * 0.6);
    ctx.lineTo?.(w, h * 0.65);
    ctx.lineTo?.(0, h * 0.65);
    ctx.fill?.();

    // Sun / highlights & foreground boat silhouette
    ctx.fillStyle = "rgba(255, 245, 205, 0.72)";
    if (typeof ctx.arc === "function") {
      ctx.beginPath();
      ctx.arc(w * (0.3 + (index % 3) * 0.2), h * 0.34, 15, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = "#3a2b20";
    ctx.fillRect(w * 0.28 + (index % 2) * 32, h * 0.7, 52, 8);
  });
}

function createBenTrangFasciaSignTexture() {
  return createCanvasTex(1024, 384, (ctx, w, h) => {
    ctx.fillStyle = "#f7f6f1";
    ctx.fillRect(0, 0, w, h);

    // Subtle crisp top & bottom hairline trim
    ctx.fillStyle = "#e6e2d8";
    ctx.fillRect(0, h - 8, w, 8);

    // Iconic Red Octagonal Sun-Over-Waves Crest on Left
    const cx = 246;
    const cy = h * 0.48;
    const r = 112;
    ctx.fillStyle = "#8a2326";
    if (typeof ctx.moveTo === "function") {
      ctx.beginPath?.();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo?.(px, py);
      }
      ctx.closePath?.();
      ctx.fill?.();

      ctx.strokeStyle = "#f7f6f1";
      ctx.lineWidth = 4;
      ctx.beginPath?.();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const px = cx + Math.cos(a) * (r - 12);
        const py = cy + Math.sin(a) * (r - 12);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo?.(px, py);
      }
      ctx.closePath?.();
      ctx.stroke?.();

      // Sun/Moon & River Waves inside octagon
      if (typeof ctx.arc === "function") {
        ctx.fillStyle = "#f7f6f1";
        ctx.beginPath?.();
        ctx.arc(cx + 12, cy - 30, 22, 0, Math.PI * 2);
        ctx.fill?.();
      }
      if (typeof ctx.quadraticCurveTo === "function") {
        ctx.strokeStyle = "#f7f6f1";
        ctx.lineWidth = 5;
        for (const wy of [cy + 8, cy + 28, cy + 48]) {
          ctx.beginPath?.();
          ctx.moveTo(cx - 58, wy);
          ctx.quadraticCurveTo(cx - 24, wy - 14, cx, wy);
          ctx.quadraticCurveTo(cx + 28, wy + 12, cx + 60, wy - 4);
          ctx.stroke?.();
        }
      }
    }

    // Bold Crimson-Brown Brand Typography "BẾN TRĂNG / CAFÉ & BAR"
    ctx.fillStyle = "#8a2326";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 76px Georgia, serif";
    ctx.fillText("BẾN", 392, h * 0.3);
    ctx.font = "bold 78px Georgia, serif";
    ctx.fillText("TRĂNG", 392, h * 0.54);
    ctx.fillStyle = "#5c342e";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("CAFÉ & BAR", 396, h * 0.77);
  });
}

function createWelcomeSignTexture() {
  return createCanvasTex(384, 192, (ctx, w, h) => {
    ctx.fillStyle = "#3f2c1f";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#d9b97e";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.fillStyle = "#f7ead0";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px Georgia, serif";
    ctx.fillText("BẾN TRĂNG CAFÉ", w / 2, h * 0.36);
    ctx.fillStyle = "#e0c28c";
    ctx.font = "600 28px sans-serif";
    ctx.fillText("5 LÊ LỢI · HUẾ", w / 2, h * 0.7);
  });
}

function createMarketParasol(x, y, z, canopyColor = "#b9a78e") {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.055, 2.55, 8),
    mat("#4f3827", 0.75),
  );
  pole.position.y = 1.28;
  pole.castShadow = true;
  const canopy = new THREE.Mesh(
    new THREE.ConeGeometry(1.75, 0.58, 8),
    mat(canopyColor, 0.85),
  );
  canopy.position.y = 2.52;
  canopy.castShadow = canopy.receiveShadow = true;
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 6),
    mat("#4f3827", 0.6),
  );
  finial.position.y = 2.83;
  g.add(pole, canopy, finial);
  return g;
}

function createCafeTableSet(x, y, z, withPatron = false, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const woodMat = mat("#7d5233", 0.76);
  const metalMat = mat("#26292c", 0.5, 0.55);

  const tableTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.54, 0.54, 0.06, 12),
    woodMat,
  );
  tableTop.position.y = 0.74;
  tableTop.castShadow = true;
  const tableLeg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.05, 0.72, 8),
    metalMat,
  );
  tableLeg.position.y = 0.36;
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.3, 0.05, 10),
    metalMat,
  );
  base.position.y = 0.025;
  g.add(tableTop, tableLeg, base);

  // Two wooden/rattan café chairs & coffee cups
  for (const [idx, cx, cz, ry] of [
    [0, -0.74, 0, Math.PI / 2],
    [1, 0.74, 0, -Math.PI / 2],
  ]) {
    const chair = new THREE.Group();
    chair.position.set(cx, 0, cz);
    chair.rotation.y = ry;
    chair.add(
      box([0.44, 0.05, 0.44], "#8a5a38", [0, 0.44, 0]),
      box([0.44, 0.42, 0.05], "#8a5a38", [0, 0.66, -0.2]),
      box([0.05, 0.44, 0.05], "#292c2e", [-0.18, 0.22, -0.18]),
      box([0.05, 0.44, 0.05], "#292c2e", [0.18, 0.22, -0.18]),
      box([0.05, 0.44, 0.05], "#292c2e", [-0.18, 0.22, 0.18]),
      box([0.05, 0.44, 0.05], "#292c2e", [0.18, 0.22, 0.18]),
    );
    g.add(chair);

    if (withPatron && idx === seed % 2) {
      const shirtColors = ["#e5dcc9", "#4f6d7a", "#b56a52", "#5d7d57"];
      const patron = new THREE.Group();
      patron.position.set(cx, 0.47, cz);
      patron.rotation.y = ry;
      patron.add(
        box([0.34, 0.45, 0.24], shirtColors[(seed + idx) % shirtColors.length], [0, 0.25, 0]),
        box([0.32, 0.14, 0.36], "#323c4a", [0, 0.07, 0.12]),
      );
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 10, 8),
        mat("#e0b899", 0.7),
      );
      head.position.set(0, 0.6, 0.02);
      patron.add(head);
      g.add(patron);
    }
  }

  // Tiny white coffee cups on tabletop
  for (const oz of [-0.12, 0.14]) {
    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.038, 0.08, 8),
      mat("#f6f2e8", 0.3),
    );
    cup.position.set(oz * 0.5, 0.81, oz);
    g.add(cup);
  }
  return g;
}

function createPlanterFoliage(x, y, z, width, count = 14) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const tones = ["#3a7228", "#4e8b34", "#66a342", "#2f5f22"];
  for (let i = 0; i < count; i++) {
    const lx = ((i + 0.5) / count - 0.5) * width;
    const lz = Math.sin(i * 1.9) * 0.22;
    const h = 0.52 + (i % 3) * 0.2;
    const cluster = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.36 + (i % 2) * 0.1, 0),
      mat(tones[i % tones.length], 0.84),
    );
    cluster.position.set(lx, h * 0.45, lz);
    cluster.scale.set(1.15, h * 1.35, 0.95);
    cluster.castShadow = true;
    g.add(cluster);
  }
  return g;
}

function createSlenderTree(x, y, z, height = 6.2, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.31;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, height * 0.62, 7),
    mat("#6a5948", 0.88),
  );
  trunk.position.y = height * 0.31;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 4; i++) {
    const leaf = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.05 - i * 0.12, 1),
      mat(i % 2 ? "#478535" : "#386f2c", 0.82),
    );
    leaf.position.set(
      Math.cos(i * 1.7) * 0.45,
      height * (0.58 + i * 0.11),
      Math.sin(i * 1.7) * 0.45,
    );
    leaf.scale.y = 0.78;
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

export class BenTrangCafe {
  constructor(world) {
    this.world = world;
    this.lights = [];
    this.animatedObjects = [];
    this.paintings = [];

    // Reference frame aligned with BiaQuocHocPark local coords
    if (world.biaPark) {
      this.biaToWorld = world.biaPark.toWorld;
      this.biaToLocal = world.biaPark.toLocal;
    } else {
      const origin = { x: 480.43927587264506, z: -498.0574304452289 };
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

    // Verified spot around node/13296108686 (Bến Trăng) clear >= 4.5m of all roads
    // Café +Z faces Điện Biên Phủ (-0.7866, -0.6174); Café -X (stairs) faces Perfume River (+0.6174, -0.7866)
    this.centerLocal = { lx: -191.0, lz: -56.0 };
    this.uX = { x: -0.6174, z: 0.7866 };
    this.uZ = { x: -0.7866, z: -0.6174 };
    this.localAngleY = Math.atan2(this.uZ.x, this.uZ.z);

    this.toWorld = (cx, cz) => {
      const lx = this.centerLocal.lx + cx * this.uX.x + cz * this.uZ.x;
      const lz = this.centerLocal.lz + cx * this.uX.z + cz * this.uZ.z;
      return this.biaToWorld(lx, lz);
    };
    this.toLocal = (wx, wz) => {
      const { lx, lz } = this.biaToLocal(wx, wz);
      const dx = lx - this.centerLocal.lx;
      const dz = lz - this.centerLocal.lz;
      return {
        cx: dx * this.uX.x + dz * this.uX.z,
        cz: dx * this.uZ.x + dz * this.uZ.z,
      };
    };

    const cw = this.biaToWorld(this.centerLocal.lx, this.centerLocal.lz);
    const p0 = this.biaToWorld(0, 0);
    const px = this.biaToWorld(10, 0);
    const biaHeading = Math.atan2(-(px.z - p0.z), px.x - p0.x);

    this.group = new THREE.Group();
    this.group.name = "ben-trang-cafe";
    this.group.position.set(cw.x, 0, cw.z);
    this.group.rotation.y = biaHeading + this.localAngleY;

    // Main street-side entrance stair foot
    this.entrance = this.toWorld(-9.35, 7.8);

    this.buildRetainingWallAndPaintings();
    this.buildTerraceAndStairs();
    this.buildMainPavilion();
    this.buildWhiteSpiralStaircase();
    this.buildRooftopGardenAndLights();
    this.buildOutdoorCafeAndTrees();

    world.scene.add(this.group);
  }

  buildRetainingWallAndPaintings() {
    // Lower Street-Level Stone Promenade Apron (cz: +6.8..+10.0)
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(22.4, 0.18, 3.4),
      mat("#c6bfae", 0.88),
    );
    apron.position.set(0, 0.09, 8.35);
    apron.receiveShadow = true;
    this.group.add(apron);

    // Mossy Stone Retaining Wall across front (cz: +6.25..+6.85)
    const stoneTex = createMossyStoneWallTexture();
    const retainingWall = new THREE.Mesh(
      new THREE.BoxGeometry(19.0, 1.72, 0.65),
      new THREE.MeshStandardMaterial({
        color: "#888c82",
        map: stoneTex,
        roughness: 0.92,
      }),
    );
    retainingWall.name = "ben-trang-mossy-stone-wall";
    retainingWall.position.set(1.3, 0.96, 6.52);
    retainingWall.castShadow = retainingWall.receiveShadow = true;
    this.group.add(retainingWall);
    this.world.cameraObstacles.push(retainingWall);

    // Lower planter bed & lush green foliage along retaining wall base
    const planterBox = box([16.4, 0.34, 0.92], "#4c5048", [0.2, 0.25, 7.22]);
    this.group.add(planterBox);
    this.group.add(createPlanterFoliage(0.2, 0.35, 7.22, 15.4, 18));

    // Upper manicured green hedge along top ledge of retaining wall
    const topHedge = box([16.8, 0.38, 0.42], "#45742c", [0.4, 1.98, 6.45]);
    this.group.add(topHedge);

    // 7 Framed Landscape Exhibition Paintings along the stone wall (exact match to image_851864de.png)
    const frameMat = mat("#eae6dd", 0.55);
    const backingMat = mat("#2b2926", 0.8);
    for (let i = 0; i < 7; i++) {
      const px = -6.2 + i * 2.15;
      const frame = new THREE.Group();
      frame.name = `ben-trang-painting-${i + 1}`;
      frame.position.set(px, 1.18, 6.89);

      const border = new THREE.Mesh(
        new THREE.BoxGeometry(1.84, 1.16, 0.08),
        frameMat,
      );
      const back = new THREE.Mesh(
        new THREE.BoxGeometry(1.72, 1.04, 0.09),
        backingMat,
      );
      const artTex = createPaintingTexture(i);
      const canvasMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.66, 0.98),
        artTex
          ? new THREE.MeshStandardMaterial({ map: artTex, roughness: 0.6 })
          : mat("#c8d6df"),
      );
      canvasMesh.position.z = 0.05;
      frame.add(border, back, canvasMesh);
      this.group.add(frame);
      this.paintings.push(frame);
    }

    // Welcome wooden signboard at foot of river-view stairs
    const welcomeSign = new THREE.Group();
    welcomeSign.position.set(-10.5, 0.18, 7.55);
    welcomeSign.rotation.y = 0.25;
    welcomeSign.add(
      box([0.1, 1.35, 0.1], "#4e3626", [-0.55, 0.68, 0]),
      box([0.1, 1.35, 0.1], "#4e3626", [0.55, 0.68, 0]),
    );
    const signTex = createWelcomeSignTexture();
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.72, 0.08),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.55 })
        : mat("#3f2c1f"),
    );
    board.position.y = 1.05;
    welcomeSign.add(board);
    this.group.add(welcomeSign);
  }

  buildTerraceAndStairs() {
    // Elevated Open-Air Café Terrace Deck (y = 1.65)
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(21.6, 1.56, 12.8),
      mat("#b8ae9e", 0.84),
    );
    deck.name = "ben-trang-terrace-deck";
    deck.position.set(0, 0.87, -0.1);
    deck.receiveShadow = deck.castShadow = true;
    this.group.add(deck);
    this.world.cameraObstacles.push(deck);

    // Warm timber plank overlay across left open-air patio
    const patioFloor = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 0.05, 11.8),
      new THREE.MeshStandardMaterial({
        color: "#9a7652",
        map: createTimberCladdingTexture(),
        roughness: 0.78,
      }),
    );
    patioFloor.position.set(-5.6, 1.66, -0.1);
    patioFloor.receiveShadow = true;
    this.group.add(patioFloor);

    // Left Concrete Ascent Steps leading up from promenade (cz: +7.4 -> +3.8)
    for (let s = 0; s < 8; s++) {
      const t = s / 7;
      const sy = 0.22 + t * 1.44;
      const sz = 7.25 - t * 3.2;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(2.65, 0.22, 0.52),
        mat("#d4cfc2", 0.85),
      );
      step.position.set(-9.4, sy, sz);
      step.receiveShadow = step.castShadow = true;
      this.group.add(step);
    }

    // Minimalist black iron terrace safety railing along Left & Riverward edges
    const railMat = mat("#23272b", 0.45, 0.6);
    const backRail = new THREE.Mesh(
      new THREE.BoxGeometry(10.2, 0.05, 0.05),
      railMat,
    );
    backRail.position.set(-5.6, 2.55, -6.3);
    const sideRail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 9.8),
      railMat,
    );
    sideRail.position.set(-10.65, 2.55, -1.4);
    this.group.add(backRail, sideRail);
    for (let x = -10.5; x <= -0.8; x += 1.6) {
      const p = box([0.04, 0.9, 0.04], "#23272b", [x, 2.1, -6.3]);
      this.group.add(p);
    }
    for (let z = -6.2; z <= 3.5; z += 1.6) {
      const p = box([0.04, 0.9, 0.04], "#23272b", [-10.65, 2.1, z]);
      this.group.add(p);
    }
  }

  buildMainPavilion() {
    const g = new THREE.Group();
    g.name = "ben-trang-main-pavilion";
    g.position.set(3.6, 1.66, -0.5);
    this.group.add(g);

    const timberMat = new THREE.MeshStandardMaterial({
      color: "#885b3a",
      map: createTimberCladdingTexture(),
      roughness: 0.76,
    });
    const whiteMat = mat("#f6f5f0", 0.68);
    const creamMat = mat("#ece9e0", 0.78);
    const glassMat = new THREE.MeshStandardMaterial({
      color: "#2a3338",
      roughness: 0.2,
      metalness: 0.42,
      transparent: true,
      opacity: 0.82,
    });

    // Warm interior espresso glow + lower café room
    const core = new THREE.Mesh(
      new THREE.BoxGeometry(8.8, 3.0, 8.2),
      mat("#3e2b1f", 0.85),
    );
    core.position.set(0, 1.5, 0);
    g.add(core);
    this.world.cameraObstacles.push(core);

    // Warm interior espresso bar glow lamps
    const bulbMat = new THREE.MeshStandardMaterial({
      color: "#ffe4aa",
      emissive: "#ffb84d",
      emissiveIntensity: 1.0,
    });
    for (const bx of [-2.4, 0, 2.4]) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bulbMat);
      lamp.position.set(bx, 2.45, 3.6);
      g.add(lamp);
    }

    // Dark Timber Cladding + Glazed Café Frontage & Exposed Wooden Rafter Tails
    const frontTimber = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 2.95, 0.22),
      timberMat,
    );
    frontTimber.position.set(-1.9, 1.48, 4.15);
    const frontGlass = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 2.65, 0.16),
      glassMat,
    );
    frontGlass.position.set(-1.9, 1.4, 4.2);
    const rightStucco = new THREE.Mesh(
      new THREE.BoxGeometry(3.9, 2.95, 0.26),
      creamMat,
    );
    rightStucco.position.set(2.55, 1.48, 4.15);
    g.add(frontTimber, frontGlass, rightStucco);

    // Warm wall sconce lights on cream lower wall
    for (const sx of [1.8, 3.5]) {
      g.add(
        box([0.16, 0.28, 0.14], "#27292c", [sx, 1.65, 4.32]),
        new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), bulbMat),
      );
      g.children[g.children.length - 1].position.set(sx, 1.5, 4.34);
    }

    // Exposed Wooden Rafter Beam Tails under the White Cantilevered Upper Box
    for (let rx = -4.1; rx <= 4.3; rx += 1.2) {
      const rafter = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.22, 1.4),
        mat("#5c3a24", 0.8),
      );
      rafter.position.set(rx, 2.86, 4.45);
      g.add(rafter);
    }

    // Iconic Bright White Cantilevered Upper Fascia Box (y = 3.0..5.25 above patio)
    const upperBox = new THREE.Mesh(
      new THREE.BoxGeometry(9.6, 2.22, 9.6),
      whiteMat,
    );
    upperBox.name = "ben-trang-white-fascia";
    upperBox.position.set(0, 4.12, 0.35);
    upperBox.castShadow = upperBox.receiveShadow = true;
    g.add(upperBox);
    this.world.cameraObstacles.push(upperBox);

    // Bold Front Signage Panel ("BẾN TRĂNG CAFÉ & BAR" + Red Octagonal Crest)
    const signTex = createBenTrangFasciaSignTexture();
    const signPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(6.8, 2.1),
      signTex
        ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.48 })
        : whiteMat,
    );
    signPanel.name = "ben-trang-facade-sign";
    signPanel.position.set(-1.1, 4.12, 5.18);
    g.add(signPanel);
  }

  buildWhiteSpiralStaircase() {
    // White Curved Spiral Staircase on far right (+X) rising from y=1.66 to rooftop y=6.92
    const stairGroup = new THREE.Group();
    stairGroup.name = "ben-trang-spiral-staircase";
    stairGroup.position.set(9.15, 1.66, 1.15);
    this.group.add(stairGroup);

    const whiteSteel = mat("#f3f2ed", 0.42, 0.25);

    // Central structural white column
    const centerPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 5.4, 12),
      whiteSteel,
    );
    centerPole.position.y = 2.7;
    centerPole.castShadow = true;
    stairGroup.add(centerPole);

    const stepsCount = 16;
    const totalHeight = 5.26;
    const radius = 1.65;
    const startAngle = 0.2;
    const sweepAngle = Math.PI * 1.45;
    const railPts = [];

    for (let i = 0; i < stepsCount; i++) {
      const t = i / (stepsCount - 1);
      const a = startAngle + t * sweepAngle;
      const sy = 0.22 + t * (totalHeight - 0.22);

      // Step tread plate
      const treadPivot = new THREE.Group();
      treadPivot.position.y = sy;
      treadPivot.rotation.y = a;
      const tread = new THREE.Mesh(
        new THREE.BoxGeometry(radius, 0.08, 0.48),
        whiteSteel,
      );
      tread.position.x = radius / 2;
      tread.castShadow = true;
      treadPivot.add(tread);

      // Outer vertical white baluster post
      const baluster = new THREE.Mesh(
        new THREE.CylinderGeometry(0.028, 0.028, 1.05, 6),
        whiteSteel,
      );
      baluster.position.set(radius - 0.08, 0.52, 0);
      treadPivot.add(baluster);

      stairGroup.add(treadPivot);

      railPts.push(
        new THREE.Vector3(
          Math.cos(-a) * (radius - 0.08),
          sy + 1.04,
          Math.sin(-a) * (radius - 0.08),
        ),
      );
    }

    // Smooth curved helical white handrail
    const railCurve = new THREE.CatmullRomCurve3(railPts);
    const railGeo = new THREE.TubeGeometry(railCurve, 36, 0.045, 8, false);
    const handrail = new THREE.Mesh(railGeo, whiteSteel);
    handrail.castShadow = true;
    stairGroup.add(handrail);

    // Rooftop landing bridge connecting top step to rooftop deck
    const landing = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.14, 1.8),
      whiteSteel,
    );
    landing.position.set(-1.3, totalHeight, -0.4);
    stairGroup.add(landing);
  }

  buildRooftopGardenAndLights() {
    const roofY = 6.9;
    // Rooftop wooden floor inside white parapet
    const roofFloor = new THREE.Mesh(
      new THREE.BoxGeometry(9.0, 0.08, 9.0),
      mat("#8c6c4d", 0.84),
    );
    roofFloor.position.set(3.6, roofY, -0.15);
    roofFloor.receiveShadow = true;
    this.group.add(roofFloor);

    // Rooftop perimeter planter troughs bursting with lush green foliage & palms
    this.group.add(createPlanterFoliage(3.6, roofY + 0.04, 4.15, 8.6, 11));
    this.group.add(createPlanterFoliage(7.9, roofY + 0.04, -0.15, 0.9, 6));
    this.group.add(createSlenderTree(5.8, roofY, 1.8, 3.8, 3));
    this.group.add(createSlenderTree(1.2, roofY, -2.5, 4.2, 5));

    // Cozy Rooftop Café Tables & Terracotta Umbrella
    this.group.add(
      createCafeTableSet(2.2, roofY + 0.04, 1.4, true, 1),
      createCafeTableSet(5.2, roofY + 0.04, -1.6, true, 2),
      createMarketParasol(5.6, roofY + 0.04, 0.8, "#a64c38"),
    );

    // Overhead Bistro String-Light Poles & Shimmering Warm Bulbs
    const poleMat = mat("#262b2e", 0.55);
    const posts = [
      [-0.6, 4.2],
      [7.8, 4.2],
      [-0.6, -4.4],
      [7.8, -4.4],
    ];
    for (const [px, pz] of posts) {
      const p = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 2.7, 6),
        poleMat,
      );
      p.position.set(px, roofY + 1.35, pz);
      this.group.add(p);
    }

    const spans = [
      [posts[0], posts[1]],
      [posts[2], posts[3]],
      [posts[0], posts[3]],
    ];
    spans.forEach(([a, b], sIdx) => {
      const count = 9;
      for (let i = 1; i < count; i++) {
        const t = i / count;
        const bx = a[0] + (b[0] - a[0]) * t;
        const bz = a[1] + (b[1] - a[1]) * t;
        const sag = Math.sin(t * Math.PI) * 0.45;
        const bulbMat = new THREE.MeshStandardMaterial({
          color: "#fff1c2",
          emissive: "#ffbe4f",
          emissiveIntensity: 0.95,
          roughness: 0.25,
        });
        const bulb = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 6, 6),
          bulbMat,
        );
        bulb.name = "ben-trang-bistro-bulb";
        bulb.position.set(bx, roofY + 2.65 - sag, bz);
        bulb.userData.phase = sIdx * 1.4 + i * 0.55;
        this.group.add(bulb);
        this.lights.push(bulb);
        this.animatedObjects.push(bulb);
      }
    });
  }

  buildOutdoorCafeAndTrees() {
    // Elevated River-View Open-Air Patio Seating & Beige Market Parasols
    const patioY = 1.68;
    const tableDefs = [
      [-7.8, patioY, 2.2, true, 0],
      [-5.1, patioY, 2.8, true, 1],
      [-2.8, patioY, 1.9, true, 2],
      [-6.4, patioY, -2.2, false, 3],
      [-3.2, patioY, -2.8, true, 0],
    ];
    for (const [tx, ty, tz, withPatron, seed] of tableDefs) {
      this.group.add(createCafeTableSet(tx, ty, tz, withPatron, seed));
      const tblWorld = this.toWorld(tx, tz);
      for (const [idx, ox] of [
        [0, -0.74],
        [1, 0.74],
      ]) {
        if (withPatron && idx === seed % 2) continue;
        const seatWorld = this.toWorld(tx + ox, tz);
        const returnWorld = this.toWorld(tx + ox * 1.65, tz);
        this.world?.cafeSpots?.push({
          id: `ben-trang-seat-${tx}-${tz}-${idx}`,
          venueId: "ben-trang-cafe",
          title: "Bến Trăng Café & Bar",
          x: seatWorld.x,
          y: 1.66,
          z: seatWorld.z,
          heading: Math.atan2(tblWorld.x - seatWorld.x, tblWorld.z - seatWorld.z),
          returnPose: { x: returnWorld.x, y: 1.66, z: returnWorld.z },
        });
      }
    }
    if (
      this.world?.venues &&
      !this.world.venues.some((v) => v.id === "ben-trang-cafe")
    ) {
      this.world.venues.push({
        id: "ben-trang-cafe",
        title: "Bến Trăng Café & Bar",
        ...this.entrance,
      });
    }
    this.group.add(
      createMarketParasol(-8.2, patioY, 2.0, "#b8a68e"),
      createMarketParasol(-4.8, patioY, 2.5, "#b3a087"),
      createMarketParasol(-3.0, patioY, -2.4, "#bda991"),
    );

    // Street-Side Ornamental Vertical Trees Framing the Cafe (like image_851864de.png)
    for (const [tx, ty, tz, h, seed] of [
      [-9.8, 0.18, 5.2, 6.2, 1],
      [-3.5, 0.18, 7.2, 5.6, 2],
      [4.5, 0.18, 7.2, 6.4, 4],
      [-1.8, 1.66, -5.2, 7.5, 6],
      [9.6, 0.18, -4.5, 6.8, 7],
    ]) {
      this.group.add(createSlenderTree(tx, ty, tz, h, seed));
    }
  }

  inParcel(wx, wz) {
    const { cx, cz } = this.toLocal(wx, wz);
    return cx >= -11.4 && cx <= 11.4 && cz >= -6.6 && cz <= 10.2;
  }

  groundAt(wx, wz, referenceY) {
    const { cx, cz } = this.toLocal(wx, wz);
    if (cx < -11.2 || cx > 11.2 || cz < -6.4 || cz > 10.1) return null;

    // Street-level promenade apron in front of retaining wall
    if (cz >= 7.2 && cz <= 10.1) return 0.18;

    // Left terrace staircase ramp (smoothly walkable/rideable!)
    if (cx >= -10.8 && cx <= -7.9 && cz >= 3.8 && cz < 7.4) {
      const t = Math.max(0, Math.min(1, (7.4 - cz) / 3.6));
      return 0.18 + t * 1.48;
    }

    // Elevated patio deck (y = 1.66)
    if (cx >= -10.8 && cx <= 10.8 && cz >= -6.3 && cz <= 6.4) {
      if (!Number.isFinite(referenceY) || referenceY < 5.0) return 1.66;
      return 6.92;
    }

    return 0.18;
  }

  canRide(wx, wz) {
    const { cx, cz } = this.toLocal(wx, wz);
    if (cx < -11.4 || cx > 11.4 || cz < -6.6 || cz > 10.2) return null;

    // Block lower retaining wall + planters (cx: -7.8..+10.8 along front edge cz: 6.1..7.5)
    if (cx >= -7.8 && cx <= 10.8 && cz >= 6.1 && cz <= 7.5) return false;
    // Block Main Pavilion core
    if (cx >= -1.0 && cx <= 8.5 && cz >= -5.2 && cz <= 4.3) return false;
    // Block Spiral Staircase column
    if (Math.hypot(cx - 9.15, cz - 1.15) < 1.8) return false;
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inParcel(wx, wz);
  }

  blocksTree(wx, wz) {
    const { cx, cz } = this.toLocal(wx, wz);
    return cx >= -13.0 && cx <= 13.0 && cz >= -8.0 && cz <= 12.0;
  }

  update(time) {
    for (const bulb of this.lights) {
      const phase = bulb.userData.phase || 0;
      bulb.material.emissiveIntensity =
        0.78 + 0.25 * Math.sin(time * 2.6 + phase);
    }
  }
}
