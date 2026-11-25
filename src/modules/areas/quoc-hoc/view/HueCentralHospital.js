import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { getById, getPointsOf, getRingsOf } from "../../../../core/shared/geography/activeGeography.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { campusWallSegments } from "../../../../core/shared/architecture/CampusWalls.js";
import { segmentHitsCarriageway } from "../../../../core/world/streetPlacement.js";
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

function createHospitalGlassTexture() {
  return createCanvasTex(
    512,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#e8ecee";
      ctx.fillRect(0, 0, w, h);
      const floors = 4;
      const fh = h / floors;
      for (let f = 0; f < floors; f++) {
        const y = f * fh;
        // Creamy hospital spandrel band
        ctx.fillStyle = "#f2f5f7";
        ctx.fillRect(0, y, w, fh * 0.34);
        // Clinical sky-teal curtain window band
        ctx.fillStyle = "#2b6e82";
        ctx.fillRect(0, y + fh * 0.34, w, fh * 0.6);
        for (let x = 16; x < w; x += 32) {
          ctx.fillStyle = "#5ba4b8";
          ctx.fillRect(x, y + fh * 0.38, 22, fh * 0.5);
        }
      }
    },
    3,
    1,
  );
}

function createHospitalGateSignTexture(title, subtitle) {
  return createCanvasTex(1024, 192, (ctx, w, h) => {
    ctx.fillStyle = "#0e5c78";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Medical Red Cross Badge on Left & Right
    for (const cx of [86, w - 86]) {
      ctx.fillStyle = "#ffffff";
      if (typeof ctx.arc === "function") {
        ctx.beginPath();
        ctx.arc(cx, h / 2, 54, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(cx - 50, h / 2 - 50, 100, 100);
      }
      ctx.fillStyle = "#d12630";
      ctx.fillRect(cx - 12, h / 2 - 36, 24, 72);
      ctx.fillRect(cx - 36, h / 2 - 12, 72, 24);
    }

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 46px sans-serif";
    ctx.fillText(title, w / 2, h * 0.38);
    ctx.fillStyle = "#cbeeff";
    ctx.font = "bold 30px sans-serif";
    ctx.fillText(subtitle, w / 2, h * 0.74);
  });
}

function createConcreteCourtyardTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#ccd0d4";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(128, 134, 142, 0.35)";
      ctx.lineWidth = 2;
      for (let p = 0; p <= w; p += 64) {
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

function extrudeFootprint(points, height, yBase, material) {
  const shape = new THREE.Shape();
  points.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, -p.z);
    else shape.lineTo(p.x, -p.z);
  });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.y = yBase;
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}

function createAmbulanceMesh(x, y, z, yaw, beaconsOut) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  const whiteBox = box([2.05, 1.55, 4.9], "#f6f8fa", [0, 1.06, -0.3]);
  const cab = box([1.95, 1.25, 1.4], "#f6f8fa", [0, 0.9, 2.25]);
  const stripe = box([2.08, 0.24, 4.85], "#d62a34", [0, 0.92, -0.3]);
  const windshield = box([1.88, 0.56, 0.16], "#23323e", [0, 1.18, 2.9]);
  whiteBox.castShadow = cab.castShadow = true;
  g.add(whiteBox, cab, stripe, windshield);

  // Red Cross on Both Sides
  for (const sx of [-1.05, 1.05]) {
    g.add(
      box([0.04, 0.52, 0.16], "#d62a34", [sx, 1.38, -0.4]),
      box([0.04, 0.16, 0.52], "#d62a34", [sx, 1.38, -0.4]),
    );
  }

  // Emergency Roof Lightbar (Blue + Red)
  const barMatR = new THREE.MeshStandardMaterial({
    color: "#ff3344",
    emissive: "#ff2233",
    emissiveIntensity: 0.9,
  });
  const barMatB = new THREE.MeshStandardMaterial({
    color: "#3388ff",
    emissive: "#1166ff",
    emissiveIntensity: 0.9,
  });
  const rLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.24), barMatR);
  rLight.position.set(-0.34, 1.92, 1.65);
  const bLight = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.16, 0.24), barMatB);
  bLight.position.set(0.34, 1.92, 1.65);
  g.add(rLight, bLight);
  if (beaconsOut) beaconsOut.push(rLight, bLight);

  const wGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 10);
  wGeo.rotateZ(Math.PI / 2);
  const wMat = mat("#1f2226", 0.86);
  for (const wx of [-0.95, 0.95]) {
    for (const wz of [-1.6, 2.0]) {
      const w = new THREE.Mesh(wGeo, wMat);
      w.position.set(wx, 0.34, wz);
      g.add(w);
    }
  }
  return g;
}

function createHospitalShadeTree(x, y, z, scale = 1, seed = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.29;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.26 * scale, 2.8 * scale, 7),
    mat("#6a5844", 0.9),
  );
  trunk.position.y = 1.4 * scale;
  trunk.castShadow = true;
  g.add(trunk);
  for (const [ox, oy, oz, r, col] of [
    [0, 3.8, 0, 2.0, "#357630"],
    [-1.0, 3.3, 0.6, 1.45, "#46893b"],
    [1.0, 3.4, -0.6, 1.5, "#3e8036"],
  ]) {
    const c = new THREE.Mesh(
      new THREE.DodecahedronGeometry(r * scale, 1),
      mat(col, 0.84),
    );
    c.position.set(ox * scale, oy * scale, oz * scale);
    c.scale.y = 0.72;
    c.castShadow = true;
    g.add(c);
  }
  return g;
}

function createRoyalPalm(x, y, z, h = 7.4, seed = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.rotation.y = seed * 1.15;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.24, h * 0.8, 8),
    mat("#8a877c", 0.85),
  );
  trunk.position.y = h * 0.4;
  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, h * 0.2, 8),
    mat("#467c36", 0.72),
  );
  shaft.position.y = h * 0.9;
  g.add(trunk, shaft);
  const fMat = mat("#2f722a", 0.72);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.set(0, h, 0);
    pivot.rotation.y = a;
    pivot.rotation.x = 0.45 + (i % 2) * 0.25;
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.4, 2.4, 5), fMat);
    f.scale.set(0.6, 1, 0.22);
    f.rotation.x = Math.PI / 2;
    f.position.z = 1.15;
    pivot.add(f);
    g.add(pivot);
  }
  return g;
}

export class HueCentralHospital {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    this.beacons = [];
    this.animatedObjects = [];
    this.gates = [];

    if (world.biaPark) {
      this.toWorld = world.biaPark.toWorld;
      this.toLocal = world.biaPark.toLocal;
    } else {
      const origin = { x: 480.43927587264506, z: -498.0574304452289 };
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

    const p0 = this.toWorld(0, 0);
    const px = this.toWorld(10, 0);
    const frameHeading = Math.atan2(-(px.z - p0.z), px.x - p0.x);

    this.group = new THREE.Group();
    this.group.name = "hue-central-hospital-rear";
    this.group.position.set(p0.x, 0, p0.z);
    this.group.rotation.y = frameHeading;

    // 3 Upgraded Hospital Gates facing Lê Lợi (cạnh UBND đến Cầu Phú Xuân)
    this.gate1Local = { lx: 375.0, lz: 59.7 }; // Cổng Phụ cạnh UBND (road 1210477664)
    this.gate2Local = { lx: 422.5, lz: 59.7 }; // Cổng Sau Chính mặt Lê Lợi (road 1210477663)
    this.gate3Local = { lx: 556.0, lz: 87.5 }; // Cổng Góc Cầu Phú Xuân / Đường Hà Nội

    this.gates = [
      this.toWorld(this.gate1Local.lx, this.gate1Local.lz),
      this.toWorld(this.gate2Local.lx, this.gate2Local.lz),
      this.toWorld(this.gate3Local.lx, this.gate3Local.lz),
    ];
    this.entrance = this.gates[1];

    // Hospital rear precinct polygon between UBND (360) and Cầu Phú Xuân / Hà Nội (526..612)
    this.rearZonePoly = [
      { x: 360.2, z: 59.7 },
      { x: 526.0, z: 59.7 },
      { x: 612.6, z: 140.2 },
      { x: 608.0, z: 245.0 },
      { x: 361.0, z: 245.0 },
    ];

    this.buildCourtyardAndGardens();
    this.buildRearHospitalBuildings();
    this.buildAmbulanceBayAndOutpatientWing();
    this.buildHospitalPerimeterWallsAndGates();

    world.scene.add(this.group);
  }

  inRearZone(wx, wz) {
    const { lx, lz } = this.toLocal(wx, wz);
    if (lx < 359 || lx > 614 || lz < 58 || lz > 246) return false;
    return inside({ x: lx, z: lz }, this.rearZonePoly);
  }

  buildCourtyardAndGardens() {
    const concreteMat = new THREE.MeshStandardMaterial({
      color: "#d4d8dc",
      map: createConcreteCourtyardTexture(),
      roughness: 0.85,
    });
    const lawnMat = createManicuredLawnTexture
      ? new THREE.MeshStandardMaterial({
          color: "#57963c",
          map: createManicuredLawnTexture(10, 8, { striped: true, rich: true }),
          roughness: 0.9,
        })
      : mat("#57963c", 0.9);

    // 1. Central Rear Hospital Garden Park & Walkways (cạnh UBND lx 378..506, lz 82..176)
    const gardenLawn = new THREE.Mesh(
      new THREE.BoxGeometry(62.0, 0.14, 48.0),
      lawnMat,
    );
    gardenLawn.position.set(413.0, 0.08, 144.0);
    gardenLawn.receiveShadow = true;
    this.group.add(gardenLawn);

    // Cross-axis stone promenade paths & waiting benches for relatives
    const mainWalk = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.18, 52.0),
      concreteMat,
    );
    mainWalk.position.set(413.0, 0.11, 142.0);
    mainWalk.receiveShadow = true;
    const crossWalk = new THREE.Mesh(
      new THREE.BoxGeometry(62.0, 0.18, 3.8),
      concreteMat,
    );
    crossWalk.position.set(413.0, 0.11, 144.0);
    crossWalk.receiveShadow = true;
    this.group.add(mainWalk, crossWalk);

    // Stone resting benches along garden path
    for (const [bx, bz, ry] of [
      [409.5, 134.0, Math.PI / 2],
      [409.5, 152.0, Math.PI / 2],
      [416.5, 134.0, -Math.PI / 2],
      [416.5, 152.0, -Math.PI / 2],
    ]) {
      const bench = new THREE.Group();
      bench.position.set(bx, 0.2, bz);
      bench.rotation.y = ry;
      bench.add(
        box([1.8, 0.08, 0.52], "#cfd4d8", [0, 0.44, 0]),
        box([0.18, 0.42, 0.44], "#7e848a", [-0.65, 0.21, 0]),
        box([0.18, 0.42, 0.44], "#7e848a", [0.65, 0.21, 0]),
      );
      this.group.add(bench);
    }

    // Lush shaded landscaping trees & royal palms in hospital rear gardens
    const trees = [
      [388, 128, 1.12],
      [388, 160, 1.2],
      [402, 160, 1.1],
      [428, 126, 1.15],
      [428, 160, 1.22],
      [476, 94, 1.08],
      [496, 94, 1.14],
      [366, 95, 1.15],
      [366, 135, 1.18],
    ];
    trees.forEach(([tx, tz, sc], i) => {
      this.group.add(createHospitalShadeTree(tx, 0.15, tz, sc, i + 1));
    });

    // Royal Palms framing main rear gates & Heart Center frontage
    for (const [px, pz, idx] of [
      [383, 64.5, 0],
      [412, 64.5, 1],
      [433, 64.5, 2],
      [462, 64.5, 3],
      [492, 64.5, 4],
      [522, 69.0, 5],
    ]) {
      this.group.add(createRoyalPalm(px, 0.16, pz, 7.6, idx));
    }

    // Front Lê Lợi grass buffer strip inside perimeter wall (lx: 363..520, lz: 60.2..64.8)
    for (const [gx, gw] of [
      [366.5, 9.0],
      [398.5, 34.0],
      [472.0, 86.0],
    ]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(gw, 0.14, 4.2),
        lawnMat,
      );
      strip.position.set(gx, 0.08, 62.6);
      strip.receiveShadow = true;
      this.group.add(strip);
    }

    // Courtyard plaza around Curved Heart Center (240252008)
    const heartPlaza = new THREE.Mesh(
      new THREE.BoxGeometry(58.0, 0.18, 64.0),
      concreteMat,
    );
    heartPlaza.position.set(542.0, 0.1, 112.0);
    heartPlaza.receiveShadow = true;
    this.group.add(heartPlaza);
  }

  buildRearHospitalBuildings() {
    const glassMat = new THREE.MeshStandardMaterial({
      color: "#2b6e82",
      map: createHospitalGlassTexture(),
      roughness: 0.25,
      metalness: 0.35,
    });
    const creamMat = mat("#f1f4f6", 0.72);
    const tealAccentMat = mat("#166a88", 0.52);

    // 1. Curved Crescent Heart & High-Tech Center at Cầu Phú Xuân Corner (OSM way/240252008)
    const heartFeature = getById(240252008);
    if (heartFeature) {
      const localPts = getPointsOf(heartFeature).map((p) => {
        const l = this.toLocal(p.x, p.z);
        return { x: l.lx, z: l.lz };
      });
      const heartGroup = new THREE.Group();
      heartGroup.name = "hospital-heart-center-pavilion";
      this.group.add(heartGroup);

      // Base podium + 5-story curved glass medical tower + white cornice crown
      const body = extrudeFootprint(localPts, 18.2, 0.22, glassMat);
      const roof = extrudeFootprint(localPts, 0.85, 18.4, creamMat);
      const trim = extrudeFootprint(localPts, 0.55, 19.25, tealAccentMat);
      heartGroup.add(body, roof, trim);
      this.world.cameraObstacles.push(body);

      // Horizontal cantilevered white sun-breaker fins around the curved outer facade
      for (const fy of [4.2, 8.0, 11.8, 15.6]) {
        const fin = extrudeFootprint(localPts, 0.28, fy, creamMat);
        fin.scale.set(1.01, 1, 1.01);
        heartGroup.add(fin);
      }

      // Cantilevered Emergency Drop-Off Canopy on Courtyard Side (lx ≈ 528, lz ≈ 84)
      const canopy = box([14.0, 0.45, 7.2], "#f4f6f8", [528.5, 4.35, 84.5]);
      canopy.rotation.y = -0.25;
      canopy.castShadow = true;
      heartGroup.add(canopy);
      for (const px of [-5.2, 5.2]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.24, 0.26, 4.2, 8),
          creamMat,
        );
        col.position.set(528.5 + px, 2.2, 82.0);
        heartGroup.add(col);
      }

      // Glowing Medical Red-Cross Crown & Facade Signboard facing Cầu Phú Xuân
      const signTex = createHospitalGateSignTexture(
        "BỆNH VIỆN TRUNG ƯƠNG HUẾ",
        "TRUNG TÂM TIM MẠCH · KHU KỸ THUẬT CAO",
      );
      const heartSign = new THREE.Mesh(
        new THREE.PlaneGeometry(15.5, 2.8),
        signTex
          ? new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.45 })
          : tealAccentMat,
      );
      heartSign.name = "hospital-heart-center-sign";
      heartSign.position.set(546.5, 16.5, 95.5);
      heartSign.rotation.y = Math.PI * 0.74;
      heartGroup.add(heartSign);
    }

    // 2. Upgraded Hospital Security & Dispatch Booth (OSM way/1210477658)
    const booth = new THREE.Group();
    booth.name = "hospital-rear-dispatch-booth";
    booth.position.set(441.8, 0.22, 113.4);
    booth.add(
      box([12.0, 3.2, 6.2], "#eef2f5", [0, 1.6, 0]),
      box([11.2, 1.3, 6.32], "#2b6e82", [0, 1.9, 0]),
      box([13.2, 0.35, 7.4], "#156582", [0, 3.35, 0]),
    );
    this.group.add(booth);

    // 3. Large Rear Inpatient Clinical Blocks (OSM 942532232, 942532233, 942532235)
    for (const [id, floors, roofCol] of [
      [942532232, 4, "#8a4236"],
      [942532233, 4, "#156582"],
      [942532235, 5, "#156582"],
    ]) {
      const f = getById(id);
      if (!f) continue;
      const pts = getPointsOf(f).map((p) => {
        const l = this.toLocal(p.x, p.z);
        return { x: l.lx, z: l.lz };
      });
      const h = floors * 3.6;
      const block = extrudeFootprint(pts, h, 0.22, glassMat);
      const parapet = extrudeFootprint(pts, 0.7, h + 0.22, creamMat);
      const cap = extrudeFootprint(pts, 0.55, h + 0.92, mat(roofCol, 0.65));
      this.group.add(block, parapet, cap);
      this.world.cameraObstacles.push(block);
    }
  }

  buildAmbulanceBayAndOutpatientWing() {
    // 1. Paved Ambulance & Emergency Drop-Off Apron (cạnh UBND, lx: 384..432, lz: 84..112)
    const baySlab = new THREE.Mesh(
      new THREE.BoxGeometry(48.0, 0.16, 26.0),
      new THREE.MeshStandardMaterial({
        color: "#c8cdd2",
        map: createConcreteCourtyardTexture(),
        roughness: 0.85,
      }),
    );
    baySlab.position.set(408.0, 0.12, 97.0);
    baySlab.receiveShadow = true;
    this.group.add(baySlab);

    // White parking stall lines + Red Cross Emergency Bay shelter canopy
    for (let sx = 392; sx <= 420; sx += 5.5) {
      this.group.add(box([0.14, 0.03, 5.4], "#f4f6f8", [sx, 0.21, 90.0]));
    }
    this.group.add(
      createAmbulanceMesh(394.8, 0.2, 90.0, Math.PI, this.beacons),
      createAmbulanceMesh(400.3, 0.2, 90.0, Math.PI, this.beacons),
      createAmbulanceMesh(405.8, 0.2, 90.0, Math.PI, this.beacons),
    );
    for (const b of this.beacons) this.animatedObjects.push(b);

    // Visitor sedans parked on East half of bay
    for (const [cx, col] of [
      [414.5, "#dbe0e5"],
      [419.5, "#5a6875"],
      [424.5, "#2b3036"],
    ]) {
      const car = new THREE.Group();
      car.position.set(cx, 0.2, 90.0);
      car.add(
        box([1.75, 0.66, 4.2], col, [0, 0.52, 0]),
        box([1.5, 0.54, 2.0], "#1f2c36", [0, 1.06, -0.1]),
      );
      this.group.add(car);
    }

    // 2. Clean 3-Story Outpatient Clinic Pavilion & Covered Walkway (lx: 454..502, lz: 126..164)
    // Positioned safely inside open lawn clear of all OSM roads!
    const clinic = new THREE.Group();
    clinic.name = "hospital-rear-outpatient-clinic";
    clinic.position.set(478.0, 0.2, 145.0);
    this.group.add(clinic);

    const clinicMat = new THREE.MeshStandardMaterial({
      color: "#f0f4f7",
      map: createHospitalGlassTexture(),
      roughness: 0.35,
    });
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(44.0, 10.8, 22.0),
      clinicMat,
    );
    wing.position.y = 5.4;
    wing.castShadow = wing.receiveShadow = true;
    clinic.add(wing);
    this.world.cameraObstacles.push(wing);

    clinic.add(
      box([45.6, 0.5, 23.6], "#ffffff", [0, 10.95, 0]),
      box([42.0, 0.45, 20.0], "#146684", [0, 11.4, 0]),
      // Entrance portico facing Ambulance & Central Lawn
      box([12.0, 0.35, 5.2], "#ffffff", [0, 3.8, -13.0]),
      box([0.45, 3.7, 0.45], "#e6ecf0", [-5.0, 1.85, -15.0]),
      box([0.45, 3.7, 0.45], "#e6ecf0", [5.0, 1.85, -15.0]),
    );

    // Covered glass-roofed pedestrian walkway linking Outpatient Wing to Lê Lợi Gate 2 axis
    const walkwayRoof = box([3.6, 0.14, 24.0], "#a8d2e6", [468.0, 3.1, 118.0]);
    this.group.add(walkwayRoof);
    for (let wz = 107; wz <= 129; wz += 5.5) {
      for (const wx of [466.4, 469.6]) {
        const p = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.09, 3.0, 6),
          mat("#dde4ea", 0.5),
        );
        p.position.set(wx, 1.6, wz);
        this.group.add(p);
      }
    }
  }

  buildHospitalPerimeterWallsAndGates() {
    const rel = getById(21912794);
    const rings = rel ? getRingsOf(rel) : [];

    const plinthParts = [];
    const picketParts = [];
    const railParts = [];

    const makeBar = (a, b, h, w, y) => {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const g = new THREE.BoxGeometry(Math.hypot(dx, dz), h, w);
      g.rotateY(Math.atan2(-dz, dx));
      g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
      return g;
    };

    if (rings.length) {
      for (const ring of rings) {
        const ringLocal = ring.map((p) => this.toLocal(p.x, p.z));
        const isSouthRing = ringLocal.some((p) => p.lz > 360);

        const segs = isSouthRing
          ? campusWallSegments(
              ring,
              this.toWorld(315, 368),
              8.0,
            )
          : campusWallSegments(
              ring,
              this.gates[1], // Main Lê Lợi Rear Gate (422.5, 59.7)
              10.2,
              [
                { ...this.gates[0], gap: 8.8 }, // Near UBND gate (375, 59.7)
                { ...this.gates[2], gap: 8.2 }, // Phu Xuan corner gate (556, 87.5)
              ],
            );

        for (const whole of segs) {
          const length = Math.hypot(whole.b.x - whole.a.x, whole.b.z - whole.a.z);
          const parts = Math.max(1, Math.ceil(length / 4));
          for (let i = 0; i < parts; i++) {
            const t0 = i / parts;
            const t1 = (i + 1) / parts;
            const a = {
              x: whole.a.x + (whole.b.x - whole.a.x) * t0,
              z: whole.a.z + (whole.b.z - whole.a.z) * t0,
            };
            const b = {
              x: whole.a.x + (whole.b.x - whole.a.x) * t1,
              z: whole.a.z + (whole.b.z - whole.a.z) * t1,
            };
            const mid = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };

            if (
              segmentHitsCarriageway(a, b, this.world.renderRoads, 0.75, 0.5) ||
              this.world.buildingPolygons?.some((bp) => inside(mid, bp.points))
            ) {
              continue;
            }
            this.world.campusWallSegments.push({ a, b, schoolId: "hospital" });

            const segLen = Math.hypot(b.x - a.x, b.z - a.z);
            if (segLen < 0.2) continue;
            plinthParts.push(makeBar(a, b, isSouthRing ? 0.5 : 0.72, 0.34, 0.45));
            railParts.push(makeBar(a, b, 0.06, 0.06, 0.96));
            railParts.push(makeBar(a, b, 0.06, 0.06, 1.92));
            for (let d = 0.25; d < segLen; d += 0.38) {
              const tt = d / segLen;
              const px = a.x + (b.x - a.x) * tt;
              const pz = a.z + (b.z - a.z) * tt;
              const bar = new THREE.BoxGeometry(0.038, 1.2, 0.038);
              bar.translate(px, 1.38, pz);
              picketParts.push(bar);
            }
          }
        }
      }
    }

    const addBatch = (parts, color, rough = 0.72, metal = 0.25) => {
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
    addBatch(plinthParts, "#eef2f4", 0.85, 0.04);
    addBatch(railParts, "#21677f", 0.45, 0.55);
    addBatch(picketParts, "#21677f", 0.45, 0.55);

    // Grand Medical Gate Portals along Lê Lợi & Cầu Phú Xuân Corner
    this.buildGatePortal(
      this.gate1Local.lx,
      this.gate1Local.lz,
      0,
      8.8,
      "BỆNH VIỆN TRUNG ƯƠNG HUẾ",
      "CỔNG SỐ 2 · KHU KHÁM & CẤP CỨU",
    );
    this.buildGatePortal(
      this.gate2Local.lx,
      this.gate2Local.lz,
      0,
      10.2,
      "BỆNH VIỆN TRUNG ƯƠNG HUẾ",
      "CỔNG LÊ LỢI · TRUNG TÂM ĐIỀU TRỊ",
    );
    this.buildGatePortal(
      this.gate3Local.lx,
      this.gate3Local.lz,
      -0.75,
      8.2,
      "BỆNH VIỆN TRUNG ƯƠNG HUẾ",
      "CỔNG CẦU PHÚ XUÂN · ĐƯỜNG HÀ NỘI",
    );
  }

  buildGatePortal(gx, gz, ry, gap, title, subtitle) {
    const portal = new THREE.Group();
    portal.name = "hospital-rear-gate-portal";
    portal.position.set(gx, 0.18, gz);
    portal.rotation.y = ry;
    this.group.add(portal);

    const hw = gap / 2 + 0.45;
    for (const sx of [-1, 1]) {
      portal.add(
        box([0.92, 4.4, 0.92], "#f4f6f8", [sx * hw, 2.2, 0]),
        box([1.06, 0.28, 1.06], "#166885", [sx * hw, 4.45, 0]),
      );
      const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 8, 6),
        new THREE.MeshStandardMaterial({
          color: "#fff5d6",
          emissive: "#ffcf70",
          emissiveIntensity: 0.85,
        }),
      );
      lamp.position.set(sx * hw, 4.78, 0);
      portal.add(lamp);
    }

    // Overhead archway lintel beam with Medical Signboard facing Lê Lợi (-Z)
    portal.add(box([gap + 1.5, 1.5, 0.55], "#125c78", [0, 4.15, 0]));
    const tex = createHospitalGateSignTexture(title, subtitle);
    const frontFace = new THREE.Mesh(
      new THREE.PlaneGeometry(gap + 0.8, 1.32),
      tex
        ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 })
        : mat("#0e5c78"),
    );
    frontFace.position.set(0, 4.15, -0.3);
    frontFace.rotation.y = Math.PI;
    const backFace = frontFace.clone();
    backFace.position.z = 0.3;
    backFace.rotation.y = 0;
    portal.add(frontFace, backFace);
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inRearZone(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 2.2) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Paved aprons & internal walkways sit cleanly at 0.21..0.22
    if (lz >= 83 && lz <= 112 && lx >= 384 && lx <= 432) return 0.21;
    if (lx >= 512 && lx <= 575 && lz >= 80 && lz <= 145) return 0.21;
    return 0.18;
  }

  canRide(wx, wz) {
    if (!this.inRearZone(wx, wz)) return null;
    const { lx, lz } = this.toLocal(wx, wz);
    // Block Clinic Annex (456..500, 134..156)
    if (lx >= 455.5 && lx <= 500.5 && lz >= 133.5 && lz <= 156.5) return false;
    // Block Security Booth (435.5..448.2, 110..117)
    if (lx >= 435.5 && lx <= 448.2 && lz >= 109.8 && lz <= 117.0) return false;
    // Defer to world.buildingPolygons for OSM 240252008 / 942532232 / 942532233 / 942532235
    if (
      this.world.buildingPolygons?.some(
        (b) =>
          wx >= b.minX &&
          wx <= b.maxX &&
          wz >= b.minZ &&
          wz <= b.maxZ &&
          inside({ x: wx, z: wz }, b.points),
      )
    ) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inRearZone(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inRearZone(wx, wz)) return true;
    const { lx, lz } = this.toLocal(wx, wz);
    // Keep Lê Lợi hospital front gates clear
    if (lx >= 362 && lx <= 565 && lz >= 50 && lz <= 62) return true;
    return false;
  }

  update(time) {
    for (let i = 0; i < this.beacons.length; i++) {
      const b = this.beacons[i];
      const pulse = Math.sin(time * 6.5 + i * Math.PI * 0.5);
      b.material.emissiveIntensity = pulse > 0 ? 1.2 : 0.35;
    }
  }
}
