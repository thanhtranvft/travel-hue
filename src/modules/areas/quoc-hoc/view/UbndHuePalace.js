import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
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

function createPalaceFacadeTexture(warmGlow = false) {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      if (warmGlow) {
        ctx.fillStyle = "#1d1407";
        ctx.fillRect(0, 0, w, h);
        // Subtle warm uplight pools at pier bases & warm glowing arched windows
        for (const x of [64, 192, 320, 448]) {
          ctx.fillStyle = "rgba(255, 198, 92, 0.35)";
          ctx.fillRect(x - 40, h - 110, 80, 105);
          ctx.fillStyle = "rgba(255, 214, 128, 0.55)";
          ctx.fillRect(x - 24, 96, 48, 84);
          ctx.fillRect(x - 24, 290, 48, 88);
        }
        return;
      }

      // Rich warm golden-ochre Hue heritage stucco with subtle uplighting tone
      ctx.fillStyle = "#d9a552";
      ctx.fillRect(0, 0, w, h);

      // Rusticated ground plinth (bottom 15%)
      ctx.fillStyle = "#b8955c";
      ctx.fillRect(0, h - 76, w, 76);
      ctx.fillStyle = "#faecc8";
      ctx.fillRect(0, h - 82, w, 10);
      ctx.fillRect(0, h * 0.48 - 10, w, 16);
      ctx.fillRect(0, 0, w, 20);

      // 4 Classical Arched Window Bays across tile
      for (const cx of [64, 192, 320, 448]) {
        // Cream framing pilaster bands
        ctx.fillStyle = "#f7e5bc";
        ctx.fillRect(cx - 56, 20, 14, h - 102);

        // Upper floor arched colonnade window
        ctx.fillStyle = "#f9edd0";
        ctx.fillRect(cx - 32, 84, 64, 120);
        if (typeof ctx.arc === "function") {
          ctx.beginPath();
          ctx.arc(cx, 84, 32, Math.PI, 0);
          ctx.fill();
        }
        ctx.fillStyle = "#3f2e1e";
        ctx.fillRect(cx - 24, 90, 48, 108);
        if (typeof ctx.arc === "function") {
          ctx.beginPath();
          ctx.arc(cx, 90, 24, Math.PI, 0);
          ctx.fill();
        }
        // Warm interior window sheen
        ctx.fillStyle = "#ffd98c";
        ctx.fillRect(cx - 18, 98, 14, 90);
        ctx.fillRect(cx + 4, 98, 14, 90);

        // Ground floor tall French window
        ctx.fillStyle = "#f9edd0";
        ctx.fillRect(cx - 32, 282, 64, 134);
        ctx.fillStyle = "#3b2c1d";
        ctx.fillRect(cx - 24, 290, 48, 118);
        ctx.fillStyle = "#f4ca78";
        ctx.fillRect(cx - 18, 298, 14, 102);
        ctx.fillRect(cx + 4, 298, 14, 102);
      }
    },
    1,
    1,
  );
}

function createTerracottaRoofTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#a2432a";
      ctx.fillRect(0, 0, w, h);
      for (let x = 0; x < w; x += 24) {
        ctx.fillStyle = "#b54f34";
        ctx.fillRect(x + 2, 0, 12, h);
        ctx.fillStyle = "#7e301d";
        ctx.fillRect(x + 18, 0, 5, h);
      }
      for (let y = 0; y < h; y += 22) {
        ctx.fillStyle = "rgba(55,18,10,0.28)";
        ctx.fillRect(0, y, w, 3);
      }
    },
    6,
    2,
  );
}

function createQuocHuyEmblemTexture() {
  return createCanvasTex(256, 256, (ctx, w, h) => {
    ctx.clearRect?.(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    // Outer golden rice wreath rim
    ctx.fillStyle = "#f2c138";
    if (typeof ctx.arc === "function") {
      ctx.beginPath();
      ctx.arc(cx, cy, 116, 0, Math.PI * 2);
      ctx.fill();
      // Crimson central disc
      ctx.fillStyle = "#cf1f1c";
      ctx.beginPath();
      ctx.arc(cx, cy, 92, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(16, 16, w - 32, h - 32);
    }
    // 5-pointed gold star
    ctx.fillStyle = "#ffe033";
    ctx.beginPath?.();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 64 : 25;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo?.(px, py);
      else ctx.lineTo?.(px, py);
    }
    ctx.closePath?.();
    ctx.fill?.();
  });
}

function createUbndPlaqueTexture() {
  return createCanvasTex(1024, 176, (ctx, w, h) => {
    ctx.fillStyle = "#962420";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#f7d46c";
    ctx.lineWidth = 10;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffe68e";
    ctx.font = "bold 54px 'Playfair Display', Georgia, serif";
    ctx.fillText("ỦY BAN NHÂN DÂN THÀNH PHỐ HUẾ", w / 2, h * 0.44);
    ctx.fillStyle = "#f8ecd0";
    ctx.font = "600 28px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("16 LÊ LỢI · THÀNH PHỐ HUẾ", w / 2, h * 0.78);
  });
}

function createGraniteCourtyardTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#cbc4b5";
      ctx.fillRect(0, 0, w, h);
      const s = 64;
      for (let r = 0; r < h / s; r++) {
        for (let c = 0; c < w / s; c++) {
          const d = ((r * 7 + c * 11) % 5) * 3 - 6;
          ctx.fillStyle = `rgb(${202 + d}, ${195 + d}, ${181 + d})`;
          ctx.fillRect(c * s + 1, r * s + 1, s - 2, s - 2);
        }
      }
      ctx.strokeStyle = "rgba(120,112,98,0.28)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += s) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, h);
        ctx.moveTo(0, p);
        ctx.lineTo(w, p);
        ctx.stroke();
      }
    },
    10,
    8,
  );
}

function createVietnamFlagTexture() {
  return createCanvasTex(256, 170, (ctx, w, h) => {
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
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo?.(px, py);
      else ctx.lineTo?.(px, py);
    }
    ctx.closePath?.();
    ctx.fill?.();
  });
}

function createHipRoofMesh(width, depth, ridgeHeight, material) {
  const hw = width / 2;
  const hd = depth / 2;
  const inset = Math.min(hw * 0.72, hd * 0.92);
  const rx = Math.max(0.5, hw - inset);
  const positions = [
    -hw, 0, hd, hw, 0, hd, rx, ridgeHeight, 0,
    -hw, 0, hd, rx, ridgeHeight, 0, -rx, ridgeHeight, 0,
    hw, 0, -hd, -hw, 0, -hd, -rx, ridgeHeight, 0,
    hw, 0, -hd, -rx, ridgeHeight, 0, rx, ridgeHeight, 0,
    -hw, 0, -hd, -hw, 0, hd, -rx, ridgeHeight, 0,
    hw, 0, hd, hw, 0, -hd, rx, ridgeHeight, 0,
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

function createPedimentGroup(width, height, depth, faceMat, trimMat) {
  const g = new THREE.Group();
  const hw = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(0, height);
  shape.closePath();

  const extrude = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  extrude.translate(0, 0, -depth / 2);
  const tympanum = new THREE.Mesh(extrude, faceMat);
  tympanum.castShadow = true;
  g.add(tympanum);

  // Ornate classical horizontal & raking cornice moldings
  const rakeLen = Math.hypot(hw, height);
  const angle = Math.atan2(height, hw);
  g.add(
    new THREE.Mesh(new THREE.BoxGeometry(width + 1.0, 0.36, depth + 0.65), trimMat)
      .translateY(0.18),
  );
  for (const sx of [-1, 1]) {
    const rake = new THREE.Mesh(
      new THREE.BoxGeometry(rakeLen + 0.55, 0.34, depth + 0.68),
      trimMat,
    );
    rake.position.set(sx * (hw / 2), height / 2 + 0.14, 0);
    rake.rotation.z = -sx * angle;
    g.add(rake);
  }
  return g;
}

function createOrnamentalPalm(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const h = 4.8 * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.24 * scale, h, 8),
    mat("#75624f", 0.9),
  );
  trunk.position.y = h / 2;
  trunk.castShadow = true;
  g.add(trunk);
  const frondMat = mat("#3d7631", 0.82);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(0.55 * scale, 2.2 * scale, 5),
      frondMat,
    );
    frond.position.set(
      Math.cos(a) * 0.95 * scale,
      h + 0.15 * scale,
      Math.sin(a) * 0.95 * scale,
    );
    frond.rotation.z = -Math.cos(a) * 0.72;
    frond.rotation.x = Math.sin(a) * 0.72;
    frond.scale.set(1.2, 1, 0.35);
    g.add(frond);
  }
  return g;
}

function createFenceLampPier(x, y, z, isGate = false) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const w = isGate ? 0.95 : 0.48;
  const h = isGate ? 3.3 : 2.15;
  const globeMat = new THREE.MeshStandardMaterial({
    color: "#fff4d1",
    emissive: "#ffc95e",
    emissiveIntensity: 0.95,
    roughness: 0.25,
  });
  g.add(
    box([w + 0.16, 0.35, w + 0.16], "#d6ccb8", [0, 0.175, 0]),
    box([w, h, w], "#f4ebd6", [0, h / 2 + 0.2, 0]),
    box([w + 0.18, 0.16, w + 0.18], "#fff4dc", [0, h + 0.22, 0]),
  );
  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(isGate ? 0.26 : 0.16, 10, 8),
    globeMat,
  );
  globe.position.y = h + (isGate ? 0.56 : 0.44);
  g.add(globe);
  return g;
}

export class UbndHuePalace {
  constructor(world, site) {
    this.world = world;
    this.site = site;

    // Align cleanly in the BiaPark local coordinate system (opposite FountainPark!)
    const biaCenter = world.biaPark?.origin || {
      x: 480.43927587264506,
      z: -498.0574304452289,
    };
    const heading = world.biaPark?.heading ?? 0.7276;
    const cosY = Math.cos(heading);
    const sinY = Math.sin(heading);

    this.origin = biaCenter;
    this.heading = heading;
    this.toWorld = (lx, lz) => ({
      x: biaCenter.x + lx * cosY + lz * sinY,
      z: biaCenter.z - lx * sinY + lz * cosY,
    });
    this.toLocal = (wx, wz) => {
      const dx = wx - biaCenter.x;
      const dz = wz - biaCenter.z;
      return {
        lx: dx * cosY - dz * sinY,
        lz: dx * sinY + dz * cosY,
      };
    };

    // Exact central axis aligned with FountainPark & UBND OSM center
    this.cx = site?.center
      ? this.toLocal(site.center.x, site.center.z).lx
      : 289.46;

    // Parcel bounds in BiaLocal coords (safely inside Lê Lợi lz=48, Lê Lai lx=220.4, road 895459995 lx=355.4)
    this.bounds = {
      minLx: 233.5,
      maxLx: 345.5,
      minLz: 58.8, // Front fence facing Lê Lợi & FountainPark
      maxLz: 132.0,
    };

    this.group = new THREE.Group();
    this.group.name = "ubnd-tp-hue-palace";
    this.group.position.set(biaCenter.x, 0, biaCenter.z);
    this.group.rotation.y = heading;
    world.scene.add(this.group);

    this.animatedObjects = [];
    this.flags = [];

    this.buildPalace();
    this.buildForecourtAndGardens();
    this.buildPerimeterFenceAndGates();

    const gateWorld = this.toWorld(this.cx, this.bounds.minLz);
    this.entrance = {
      x: gateWorld.x,
      z: gateWorld.z,
      heading: heading + Math.PI, // facing Lê Lợi (-lz)
      width: 14.4,
    };
    world.entranceClearances = [
      ...(world.entranceClearances || []),
      this.entrance,
    ];
    if (world.treePositions) {
      world.treePositions = world.treePositions.filter(
        (p) => !this.blocksTree(p.x, p.z),
      );
    }
  }

  buildPalace() {
    const cx = this.cx;
    const pal = new THREE.Group();
    pal.name = "ubnd-palace-facade";
    pal.position.set(cx, 0.24, 0);

    const wallTex = createPalaceFacadeTexture(false);
    const glowTex = createPalaceFacadeTexture(true);
    const roofTex = createTerracottaRoofTexture();
    const quocHuyTex = createQuocHuyEmblemTexture();
    const plaqueTex = createUbndPlaqueTexture();

    const facadeMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#d9a552",
      map: wallTex,
      emissive: "#ffbe59",
      emissiveMap: glowTex,
      emissiveIntensity: 0.45,
      roughness: 0.7,
      metalness: 0.05,
    });
    const warmWallMat = new THREE.MeshStandardMaterial({
      color: "#dfb262",
      emissive: "#ffbe59",
      emissiveIntensity: 0.14,
      roughness: 0.72,
    });
    const creamTrimMat = new THREE.MeshStandardMaterial({
      color: "#fff1d2",
      emissive: "#ffd584",
      emissiveIntensity: 0.18,
      roughness: 0.62,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: roofTex ? "#ffffff" : "#9c432d",
      map: roofTex,
      roughness: 0.64,
      side: THREE.DoubleSide,
    });
    const uplightMat = new THREE.MeshStandardMaterial({
      color: "#ffe7a8",
      emissive: "#ffbf48",
      emissiveIntensity: 1.15,
      roughness: 0.3,
    });

    // Helper: set planar repeat UVs on a BoxGeometry for crisp colonial arched bays
    const wingBox = (w, h, d, repeatX = 3) => {
      const geo = new THREE.BoxGeometry(w, h, d);
      if (geo.attributes.uv) {
        const uv = geo.attributes.uv;
        for (let i = 0; i < uv.count; i++) {
          uv.setX(i, uv.getX(i) * repeatX);
        }
      }
      return geo;
    };

    // 1. GRAND CENTRAL 3-STORY PORTICO & AUDITORIUM HALL (width 21.8m, lz: 95.2 .. 126.8, height 14.4m)
    const centerHall = new THREE.Mesh(
      new THREE.BoxGeometry(21.8, 14.4, 31.6),
      warmWallMat,
    );
    centerHall.position.set(0, 7.2, 111.0);
    centerHall.castShadow = centerHall.receiveShadow = true;
    pal.add(centerHall);
    this.world.cameraObstacles.push(centerHall);

    // Ceremonial Granite Front Steps & Podium facing Lê Lợi (-Z in BiaLocal!)
    for (let s = 0; s < 4; s++) {
      pal.add(
        box([19.2 - s * 0.7, 0.2, 3.8 - s * 0.5], "#d4ccb9", [
          0,
          0.1 + s * 0.2,
          94.2 + s * 0.22,
        ]),
      );
    }

    // Central Recessed Triple-Arch Glazed Entrance Atrium (-Z front = 95.1)
    const darkGlassMat = new THREE.MeshStandardMaterial({
      color: "#2b2016",
      emissive: "#ffcb72",
      emissiveIntensity: 0.38,
      roughness: 0.22,
      metalness: 0.3,
    });
    const centerGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(11.4, 10.6),
      darkGlassMat,
    );
    centerGlass.position.set(0, 6.2, 95.12);
    centerGlass.rotation.y = Math.PI;
    pal.add(centerGlass);

    // 6 Monumental Fluted Classical Columns / Pilasters framing the Grand Portico
    for (const px of [-9.8, -5.8, -2.1, 2.1, 5.8, 9.8]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.54, 12.6, 12),
        creamTrimMat,
      );
      col.position.set(px, 6.9, 94.3);
      col.castShadow = true;
      pal.add(
        col,
        box([1.28, 0.75, 1.28], "#e6d8b8", [px, 0.62, 94.3]),
        box([1.34, 0.45, 1.34], "#fff3d6", [px, 13.3, 94.3]),
      );
      // Warm architectural uplight beacon at column base (as in image_315511fb.png)
      const uplight = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.16, 0.24),
        uplightMat,
      );
      uplight.position.set(px, 0.98, 93.65);
      pal.add(uplight);
    }

    // Classical Balustrade Balcony & "ỦY BAN NHÂN DÂN THÀNH PHỐ HUẾ" Frieze Plaque
    pal.add(
      box([22.8, 0.9, 1.8], "#fff1d2", [0, 13.7, 94.5]),
      box([23.6, 0.45, 2.2], "#f4e1b4", [0, 14.35, 94.5]),
    );
    const signBoard = new THREE.Mesh(
      new THREE.PlaneGeometry(11.6, 1.7),
      new THREE.MeshStandardMaterial({
        map: plaqueTex,
        roughness: 0.45,
        side: THREE.DoubleSide,
      }),
    );
    signBoard.name = "ubnd-facade-sign";
    signBoard.position.set(0, 12.5, 93.75);
    signBoard.rotation.y = Math.PI;
    pal.add(signBoard);

    // Grand Triangular Pediment + Glowing Red & Gold Quốc Huy Emblem
    const mainPediment = createPedimentGroup(
      23.2,
      4.8,
      1.6,
      warmWallMat,
      creamTrimMat,
    );
    mainPediment.position.set(0, 14.55, 94.4);
    pal.add(mainPediment);

    const quocHuy = new THREE.Mesh(
      new THREE.CircleGeometry(1.38, 28),
      new THREE.MeshStandardMaterial({
        map: quocHuyTex,
        transparent: true,
        emissive: "#ffbf36",
        emissiveIntensity: 0.28,
        roughness: 0.32,
        side: THREE.DoubleSide,
      }),
    );
    quocHuy.name = "ubnd-quoc-huy-emblem";
    quocHuy.position.set(0, 16.45, 93.45);
    quocHuy.rotation.y = Math.PI;
    pal.add(quocHuy);

    // Central Terracotta Roof over Main Hall
    const mainRoof = createHipRoofMesh(23.4, 33.4, 3.6, roofMat);
    mainRoof.position.set(0, 14.4, 111.0);
    pal.add(mainRoof);

    // 2. LEFT & RIGHT 2-STORY ARCHED COLONNADE GALLERY WINGS (each ~28m wide, lz: 102.2 .. 116.0, height 10.6m)
    for (const sx of [-1, 1]) {
      const wingCenter = sx * 24.4;
      const wingW = 28.4;
      const wingBody = new THREE.Mesh(
        wingBox(wingW, 10.6, 13.8, 3.5),
        facadeMat,
      );
      wingBody.position.set(wingCenter, 5.3, 109.1);
      wingBody.castShadow = wingBody.receiveShadow = true;
      pal.add(wingBody);
      this.world.cameraObstacles.push(wingBody);

      // Projecting Pilasters & Warm Architectural Uplight Sconces along gallery facade
      const bayCount = 7;
      for (let b = 0; b <= bayCount; b++) {
        const px = wingCenter - wingW / 2 + (b * wingW) / bayCount;
        pal.add(box([0.55, 10.6, 0.55], "#fff0cc", [px, 5.3, 102.05]));
        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(0.42, 0.18, 0.2),
          uplightMat,
        );
        glow.position.set(px, 0.85, 101.7);
        pal.add(glow);
      }

      // Continuous Cornice, Parapet Balustrade & Terracotta Hip Roof
      pal.add(
        box([wingW + 0.8, 0.48, 14.8], "#fff1d2", [wingCenter, 10.75, 109.1]),
        box([wingW + 0.4, 0.68, 0.35], "#f8e8c2", [wingCenter, 11.3, 102.1]),
      );
      const wingRoof = createHipRoofMesh(wingW + 1.4, 15.2, 2.7, roofMat);
      wingRoof.position.set(wingCenter, 10.95, 109.1);
      pal.add(wingRoof);
    }

    // 3. SYMMETRICAL LEFT & RIGHT PROJECTING END GABLE PAVILIONS (lx: ±44.8, width 14.0m, lz: 100.4 .. 118.0, height 12.2m)
    for (const sx of [-1, 1]) {
      const endCenter = sx * 44.8;
      const endW = 14.0;
      const endD = 17.6;
      const endBody = new THREE.Mesh(
        wingBox(endW, 12.2, endD, 1.5),
        facadeMat,
      );
      endBody.position.set(endCenter, 6.1, 109.2);
      endBody.castShadow = endBody.receiveShadow = true;
      pal.add(endBody);
      this.world.cameraObstacles.push(endBody);

      // Corner pilasters & uplights
      for (const px of [-6.4, -2.2, 2.2, 6.4]) {
        pal.add(box([0.65, 12.2, 0.65], "#fff0cc", [endCenter + px, 6.1, 100.25]));
        const glow = new THREE.Mesh(
          new THREE.BoxGeometry(0.45, 0.18, 0.22),
          uplightMat,
        );
        glow.position.set(endCenter + px, 0.9, 99.88);
        pal.add(glow);
      }

      // Side Porch Canopies (matching teal/gold entry porticoes visible on outer wings in photo)
      pal.add(
        box([4.2, 0.28, 2.6], "#1a7268", [endCenter, 3.6, 99.2]),
        box([4.4, 0.14, 2.8], "#fff1d2", [endCenter, 3.78, 99.2]),
      );

      // Top Cornice, Triangular Classical Pediment & Terracotta Roof
      pal.add(
        box([endW + 1.1, 0.48, endD + 1.1], "#fff1d2", [endCenter, 12.35, 109.2]),
      );
      const endPed = createPedimentGroup(
        endW + 0.8,
        3.5,
        1.2,
        warmWallMat,
        creamTrimMat,
      );
      endPed.position.set(endCenter, 12.55, 100.3);
      pal.add(endPed);

      const endRoof = createHipRoofMesh(endW + 1.4, endD + 1.4, 3.3, roofMat);
      endRoof.position.set(endCenter, 12.55, 109.2);
      pal.add(endRoof);
    }

    this.group.add(pal);
  }

  buildForecourtAndGardens() {
    const cx = this.cx;
    const graniteTex = createGraniteCourtyardTexture();
    const graniteMat = new THREE.MeshStandardMaterial({
      color: graniteTex ? "#ffffff" : "#cbc4b5",
      map: graniteTex,
      roughness: 0.78,
      side: THREE.DoubleSide,
    });
    const lawnTex = createManicuredLawnTexture(10, 8, {
      striped: true,
      rich: true,
    });
    const lawnMat = new THREE.MeshStandardMaterial({
      color: lawnTex ? "#ffffff" : "#4b9141",
      map: lawnTex,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });

    // 1. Formal Emerald Forecourt Lawn Base (lz: 59 .. 131.5, lx: 234 .. 345)
    const baseLawn = new THREE.Mesh(
      new THREE.BoxGeometry(111.5, 0.14, 72.5),
      lawnMat,
    );
    baseLawn.position.set(cx, 0.06, 95.25);
    baseLawn.receiveShadow = true;
    this.group.add(baseLawn);

    // 2. Ceremonial Granite Driveway & Forecourt Motor Plaza
    // Central Grand Avenue from Lê Lợi main gate straight to Palace Steps
    const centralAvenue = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 0.24, 38.0),
      graniteMat,
    );
    centralAvenue.position.set(cx, 0.12, 77.5);
    centralAvenue.receiveShadow = true;

    // Wide Palace Forecourt Apron across front of building (lz: 79 .. 98)
    const palaceApron = new THREE.Mesh(
      new THREE.BoxGeometry(92.0, 0.24, 18.0),
      graniteMat,
    );
    palaceApron.position.set(cx, 0.12, 88.5);
    palaceApron.receiveShadow = true;

    // Rear courtyard service apron behind building
    const rearApron = new THREE.Mesh(
      new THREE.BoxGeometry(106.0, 0.22, 16.0),
      graniteMat,
    );
    rearApron.position.set(cx, 0.11, 123.5);
    rearApron.receiveShadow = true;
    this.group.add(centralAvenue, palaceApron, rearApron);

    // Twin Side Entry Drives connecting side gates (lx: cx ± 42.5) to forecourt apron
    for (const sx of [-1, 1]) {
      const sideDrive = new THREE.Mesh(
        new THREE.BoxGeometry(7.2, 0.24, 26.0),
        graniteMat,
      );
      sideDrive.position.set(cx + sx * 42.5, 0.12, 71.5);
      sideDrive.receiveShadow = true;
      this.group.add(sideDrive);
    }

    // 3. Central Tall Flagpole (Cột cờ) & Animated Waving Vietnam Flag (cx, lz = 75.5)
    const fp = new THREE.Group();
    fp.position.set(cx, 0.24, 75.5);
    fp.add(
      box([2.6, 0.24, 2.6], "#dfd7c6", [0, 0.12, 0]),
      box([1.8, 0.28, 1.8], "#ece5d5", [0, 0.36, 0]),
    );
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.1, 13.5, 10),
      mat("#dce2e6", 0.25, 0.85),
    );
    pole.position.y = 7.1;
    pole.castShadow = true;
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 10, 8),
      mat("#f0c146", 0.25, 0.8),
    );
    finial.position.y = 13.9;

    const flagGeo = new THREE.PlaneGeometry(2.85, 1.9, 16, 8);
    flagGeo.translate(1.425, 0, 0);
    const basePos = new Float32Array(flagGeo.attributes.position.array);
    const flagMesh = new THREE.Mesh(
      flagGeo,
      new THREE.MeshStandardMaterial({
        map: createVietnamFlagTexture(),
        roughness: 0.58,
        side: THREE.DoubleSide,
      }),
    );
    flagMesh.position.set(0.06, 12.75, 0);
    flagMesh.userData.basePos = basePos;
    fp.add(pole, finial, flagMesh);
    this.group.add(fp);
    this.flags.push(flagMesh);
    this.animatedObjects.push(flagMesh);

    // 4. Trimmed Formal Forecourt Parterres, Warm Path Bollards & Outer Framing Palms
    const bollardGlow = new THREE.MeshStandardMaterial({
      color: "#fff1c2",
      emissive: "#ffbf48",
      emissiveIntensity: 0.95,
    });
    for (const sx of [-1, 1]) {
      // Boxwood hedge border along central avenue
      const hedge = box([1.1, 0.42, 16.5], "#2f6426", [cx + sx * 9.2, 0.34, 69.5]);
      this.group.add(hedge);

      // Golden marigold blossom strip inside garden beds
      const flowers = box([16.5, 0.22, 4.2], "#e8ac1e", [cx + sx * 24.5, 0.26, 70.5]);
      this.group.add(flowers);

      // Warm golden path bollards flanking central plaza
      for (const bz of [63, 68, 73, 78]) {
        const stem = box([0.14, 0.55, 0.14], "#2a3531", [cx + sx * 8.4, 0.5, bz]);
        const lamp = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 8, 6),
          bollardGlow,
        );
        lamp.position.set(cx + sx * 8.4, 0.82, bz);
        this.group.add(stem, lamp);
      }

      // Ornamental Palms flanking the outer side wings (never blocking center facade!)
      for (const [px, pz, sc] of [
        [cx + sx * 29.5, 66.5, 1.0],
        [cx + sx * 35.5, 72.5, 1.08],
        [cx + sx * 51.0, 76.0, 1.12],
      ]) {
        this.group.add(createOrnamentalPalm(px, 0.2, pz, sc));
      }

      // Tall Twin Forecourt Floodlight Masts matching image_315511fb.png
      const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.18, 16.5, 8),
        mat("#dbe1e5", 0.35, 0.72),
      );
      mast.position.set(cx + sx * 52.5, 8.25, 62.5);
      const head = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.45, 0.45),
        bollardGlow,
      );
      head.position.set(cx + sx * 52.5, 16.6, 62.5);
      this.group.add(mast, head);
    }
  }

  buildPerimeterFenceAndGates() {
    const cx = this.cx;
    const { minLx, maxLx, minLz, maxLz } = this.bounds;
    const worldRing = [
      this.toWorld(minLx, minLz),
      this.toWorld(maxLx, minLz),
      this.toWorld(maxLx, maxLz),
      this.toWorld(minLx, maxLz),
      this.toWorld(minLx, minLz),
    ];

    const mainGateWorld = this.toWorld(cx, minLz);
    const leftDriveGate = { ...this.toWorld(cx - 42.5, minLz), gap: 6.4 };
    const rightDriveGate = { ...this.toWorld(cx + 42.5, minLz), gap: 6.4 };

    const segments = campusWallSegments(
      worldRing,
      mainGateWorld,
      14.4,
      [leftDriveGate, rightDriveGate],
    );
    this.world.campusWallSegments.push(
      ...segments.map((s) => ({ ...s, schoolId: "ubnd" })),
    );

    const plinthParts = [];
    const railParts = [];
    const picketParts = [];
    const piers = new THREE.Group();

    const makeBar = (a, b, h, w, y) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const g = new THREE.BoxGeometry(Math.hypot(dx, dz), h, w);
      g.rotateY(Math.atan2(-dz, dx));
      g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      return g;
    };

    for (const { a, b } of segments) {
      const len = Math.hypot(b.x - a.x, b.z - a.z);
      if (len < 0.1) continue;
      plinthParts.push(makeBar(a, b, 0.56, 0.34, 0.45));
      railParts.push(makeBar(a, b, 0.06, 0.06, 0.92));
      railParts.push(makeBar(a, b, 0.06, 0.06, 1.82));
      for (let d = 0.25; d < len; d += 0.35) {
        const t = d / len;
        const px = a.x + (b.x - a.x) * t;
        const pz = a.z + (b.z - a.z) * t;
        const bar = new THREE.BoxGeometry(0.038, 1.16, 0.038);
        bar.translate(px, 1.34, pz);
        picketParts.push(bar);
      }

      // Classical lit fence piers along Lê Lợi frontage
      const midLocal = this.toLocal((a.x + b.x) / 2, (a.z + b.z) / 2);
      if (Math.abs(midLocal.lz - minLz) < 1.0) {
        const pierCount = Math.max(1, Math.round(len / 7.2));
        for (let k = 0; k <= pierCount; k++) {
          const t = k / pierCount;
          const pLocal = this.toLocal(
            a.x + (b.x - a.x) * t,
            a.z + (b.z - a.z) * t,
          );
          const isGatePier =
            Math.abs(Math.abs(pLocal.lx - cx) - 7.2) < 0.7 ||
            Math.abs(Math.abs(pLocal.lx - cx) - 42.5) < 3.6;
          piers.add(createFenceLampPier(pLocal.lx, 0.16, pLocal.lz, isGatePier));
        }
      }
    }

    const addBatch = (parts, color, rough = 0.78, metal = 0.1) => {
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
    addBatch(plinthParts, "#efe5cf", 0.8);
    addBatch(railParts, "#252e33", 0.45, 0.65);
    addBatch(picketParts, "#252e33", 0.45, 0.65);
    this.group.add(piers);
  }

  inCampus(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    return (
      lx >= this.bounds.minLx &&
      lx <= this.bounds.maxLx &&
      lz >= this.bounds.minLz &&
      lz <= this.bounds.maxLz
    );
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCampus(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.0) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Paved ceremonial avenue & motor plaza
    if (Math.abs(lx - this.cx) <= 8.2 && lz >= 58.5 && lz <= 96) return 0.24;
    if (Math.abs(lx - this.cx) <= 46.0 && lz >= 79.5 && lz <= 97.5) return 0.24;
    if (Math.abs(Math.abs(lx - this.cx) - 42.5) <= 3.6 && lz >= 58.5 && lz <= 85)
      return 0.24;
    if (lz >= 115 && lz <= 132) return 0.22;
    return 0.14;
  }

  canRide(wx, wz) {
    if (!this.inCampus(wx, wz)) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Block Flagpole plinth
    if (Math.hypot(lx - this.cx, lz - 75.5) < 1.9) return false;
    // Block Palace Footprint (main hall + wings)
    if (Math.abs(lx - this.cx) <= 11.2 && lz >= 93.2 && lz <= 127.2) return false;
    if (Math.abs(lx - this.cx) <= 52.2 && lz >= 99.8 && lz <= 118.2) return false;
    return true;
  }

  blocksGrass(wx, wz) {
    if (!this.inCampus(wx, wz)) return false;
    const { lx, lz } = this.toLocal(wx, wz);
    if (Math.abs(lx - this.cx) <= 9.0 && lz >= 58.5 && lz <= 97.5) return true;
    if (Math.abs(lx - this.cx) <= 46.5 && lz >= 79 && lz <= 128) return true;
    if (Math.abs(lx - this.cx) <= 52.5 && lz >= 99 && lz <= 119) return true;
    return false;
  }

  blocksTree(wx, wz) {
    if (this.inCampus(wx, wz)) return true;
    const { lx, lz } = this.toLocal(wx, wz);
    return Math.abs(lx - this.cx) < 16 && lz >= 50 && lz <= 62;
  }

  update(time) {
    for (const flag of this.flags) {
      const posAttr = flag.geometry.attributes.position;
      const basePos = flag.userData.basePos;
      if (!basePos) continue;
      for (let i = 0; i < posAttr.count; i++) {
        const bx = basePos[i * 3];
        const by = basePos[i * 3 + 1];
        const factor = Math.max(0, bx / 2.85);
        posAttr.setZ(
          i,
          Math.sin(bx * 2.8 - time * 4.6 + by * 1.1) * 0.18 * factor,
        );
      }
      posAttr.needsUpdate = true;
    }
  }
}
