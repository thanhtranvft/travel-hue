import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { getPointsOf } from "../../../../core/shared/geography/activeGeography.js";
import { createSeatedCafePatron } from "../../quang-trung/view/QuangTrungCafes.js";
import { createSeatedBenchCouple } from "../../../../core/world/RiversideParkLife.js";

export const NGA4_MORIN_CENTER = { x: 1338.2, z: -1210.6 };

export const UNDER_BRIDGE_PROMENADE_POINTS = [
  { x: 1236.0, z: -1220.0 },
  { x: 1269.5, z: -1251.5 },
  { x: 1283.5, z: -1264.5 },
  { x: 1297.0, z: -1280.5 },
  { x: 1313.5, z: -1297.5 },
  { x: 1334.0, z: -1314.5 },
];

export const PROMENADE_HALF_WIDTH = 3.1;
export const PROMENADE_Y = 0.24;

export const TRANG_TIEN_CAFE_CENTER = { x: 1321.5, z: -1272.5, yaw: -2.32 };

export const NGA4_SIGNAL_CORNERS = [
  { id: "nga4-sig-west", x: 1316.2, z: -1210.6, axis: "ew" },
  { id: "nga4-sig-east", x: 1360.2, z: -1210.6, axis: "ew" },
  { id: "nga4-sig-north", x: 1338.2, z: -1230.6, axis: "ns" },
  { id: "nga4-sig-south", x: 1338.2, z: -1191.6, axis: "ns" },
];

export const MORIN_FALLBACK_POLYGON = [
  { x: 1240.1, z: -1109.9 },
  { x: 1291.6, z: -1155.6 },
  { x: 1327.5, z: -1187.4 },
  { x: 1350.0, z: -1187.0 },
  { x: 1379.4, z: -1157.7 },
  { x: 1370.6, z: -1149.7 },
  { x: 1301.2, z: -1086.7 },
  { x: 1274.6, z: -1062.6 },
  { x: 1239.6, z: -1103.7 },
];

function createCanvasTex(w, h, draw, repeatX = 1, repeatY = 1) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function createPromenadeStoneTexture() {
  return createCanvasTex(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#b5ab9b";
      ctx.fillRect(0, 0, w, h);
      const step = 32;
      for (let y = 0; y < h; y += step) {
        const off = (y / step) % 2 ? 16 : 0;
        for (let x = -step; x < w + step; x += step) {
          const shade = ((x / step + y / step) & 1) === 0 ? "#d2cabd" : "#c5bcb0";
          ctx.fillStyle = shade;
          ctx.fillRect(x + off + 2, y + 2, step - 4, step - 4);
        }
      }
      // Subtle edge trim strip
      ctx.fillStyle = "#91897c";
      ctx.fillRect(0, 0, 10, h);
      ctx.fillRect(w - 10, 0, 10, h);
    },
    1,
    18,
  );
}

function createMorinFacadeTexture() {
  return createCanvasTex(
    512,
    512,
    (ctx, w, h) => {
      // Warm French-colonial cream-ivory plaster
      ctx.fillStyle = "#f4ead3";
      ctx.fillRect(0, 0, w, h);
      // Stone base plinth
      ctx.fillStyle = "#cfc3ab";
      ctx.fillRect(0, h - 42, w, 42);
      // Cornice band at top & mid floors
      ctx.fillStyle = "#fcf6e8";
      ctx.fillRect(0, 0, w, 18);
      for (const bandY of [138, 286, 428]) {
        ctx.fillStyle = "#e3d4b5";
        ctx.fillRect(0, bandY, w, 12);
      }

      // 3 rows × 4 bays of French colonial arched/shuttered windows
      const cols = [26, 150, 274, 398];
      const rows = [32, 168, 312];
      for (const ry of rows) {
        for (const cx of cols) {
          // Green wooden louvered shutters (outer pair)
          ctx.fillStyle = "#2d5944";
          ctx.fillRect(cx - 10, ry + 8, 18, 92);
          ctx.fillRect(cx + 80, ry + 8, 18, 92);
          // Cream window casing
          ctx.fillStyle = "#fff8eb";
          ctx.fillRect(cx + 8, ry, 72, 104);
          // Dark glazed interior
          ctx.fillStyle = "#2d404e";
          ctx.fillRect(cx + 15, ry + 8, 58, 90);
          // Warm interior amber reflection on lower panes
          ctx.fillStyle = "rgba(244, 198, 114, 0.38)";
          ctx.fillRect(cx + 17, ry + 48, 54, 48);
          // Mullions
          ctx.fillStyle = "#f4ead3";
          ctx.fillRect(cx + 42, ry + 8, 4, 90);
          ctx.fillRect(cx + 15, ry + 44, 58, 4);
        }
      }
    },
    1,
    1,
  );
}

function createSignMesh(title, subtitle, width, height, { bg, border, titleColor, subColor }) {
  const tex = createCanvasTex(768, 192, (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = titleColor;
    ctx.font = "bold 42px 'Be Vietnam Pro', Georgia, serif";
    ctx.fillText(title, w / 2, h * 0.39, w - 48);
    ctx.fillStyle = subColor;
    ctx.font = "600 24px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(subtitle, w / 2, h * 0.74, w - 48);
  });
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: tex ? "#ffffff" : bg,
      map: tex,
      roughness: 0.55,
      side: THREE.DoubleSide,
    }),
  );
}

function buildPromenadeRibbon(points, halfWidth, y) {
  const positions = [];
  const uvs = [];
  const indices = [];
  let arc = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (i > 0) arc += Math.hypot(p.x - points[i - 1].x, p.z - points[i - 1].z);
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len;
    const nz = dx / len;
    positions.push(
      p.x + nx * -halfWidth,
      y,
      p.z + nz * -halfWidth,
      p.x + nx * halfWidth,
      y,
      p.z + nz * halfWidth,
    );
    uvs.push(0, arc / 6.0, 1, arc / 6.0);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildParkBench() {
  const g = new THREE.Group();
  const wood = mat("#8b5a34", 0.76);
  const iron = mat("#2b3235", 0.45, 0.7);
  // Slatted seat + backrest
  for (const [y, z, rx] of [
    [0.44, 0, 0],
    [0.72, -0.22, -0.2],
    [0.9, -0.25, -0.2],
  ]) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.06, 0.24), wood);
    plank.position.set(0, y, z);
    plank.rotation.x = rx;
    plank.castShadow = true;
    g.add(plank);
  }
  for (const sx of [-0.72, 0.72]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.44, 0.44), iron);
    leg.position.set(sx, 0.22, -0.02);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.08), iron);
    arm.position.set(sx, 0.66, -0.22);
    g.add(leg, arm);
  }
  return g;
}

function buildParkLamp() {
  const g = new THREE.Group();
  const poleMat = mat("#23332d", 0.42, 0.68);
  const glowMat = new THREE.MeshBasicMaterial({ color: "#ffe5a8" });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.45, 8), poleMat);
  base.position.y = 0.225;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 3.1, 8), poleMat);
  shaft.position.y = 1.95;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.1, 8), poleMat);
  cap.position.y = 3.5;
  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), glowMat);
  globe.position.y = 3.74;
  g.add(base, shaft, cap, globe);
  return g;
}

function buildRightSideCafe(animatedPatrons, onOpenSeat = null) {
  const cafeGroup = new THREE.Group();
  cafeGroup.name = "trang-tien-riverside-cafe";

  const patioMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: createPromenadeStoneTexture(),
    roughness: 0.85,
  });
  const patio = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.18, 12.2), patioMat);
  patio.position.set(0, -0.09, 0);
  patio.receiveShadow = true;
  cafeGroup.add(patio);

  // Perimeter low planter border along outer patio sides
  const planterBoxMat = mat("#6c4b34", 0.82);
  const foliageMat = mat("#497e3f", 0.84);
  for (const [px, pz, sx, sz] of [
    [-7.3, 0, 0.55, 11.6],
    [7.3, 0, 0.55, 11.6],
    [0, -5.8, 15.2, 0.55],
  ]) {
    const pBox = new THREE.Mesh(new THREE.BoxGeometry(sx, 0.46, sz), planterBoxMat);
    pBox.position.set(px, 0.23, pz);
    const bush = new THREE.Mesh(
      new THREE.BoxGeometry(Math.max(0.32, sx - 0.12), 0.28, Math.max(0.32, sz - 0.12)),
      foliageMat,
    );
    bush.position.set(px, 0.54, pz);
    cafeGroup.add(pBox, bush);
  }

  // Café garden pavilion shifted to local back (z = -3.1) so waterfront terrace faces bridge & river (+Z)
  const pav = new THREE.Group();
  pav.position.set(0, 0, -3.1);

  const wallTex = createCanvasTex(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#f2e7cf";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#6c5340";
    ctx.fillRect(0, h - 26, w, 26);
    for (const wx of [44, 200, 356]) {
      ctx.fillStyle = "#4d392b";
      ctx.fillRect(wx - 5, 42, 122, 160);
      ctx.fillStyle = "#f4cb80";
      ctx.fillRect(wx, 48, 112, 148);
      ctx.fillStyle = "#4d392b";
      ctx.fillRect(wx + 54, 48, 4, 148);
    }
  });
  const wallMat = new THREE.MeshStandardMaterial({
    color: wallTex ? "#ffffff" : "#f2e7cf",
    map: wallTex,
    roughness: 0.78,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(7.6, 3.6, 4.6), wallMat);
  body.position.y = 1.8;
  body.castShadow = body.receiveShadow = true;
  pav.add(body);

  // Dark hardwood structural corner columns
  const timberMat = mat("#4b3423", 0.72);
  for (const cx of [-3.85, 3.85]) {
    for (const cz of [-2.35, 2.35]) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.7, 0.24), timberMat);
      col.position.set(cx, 1.85, cz);
      col.castShadow = true;
      pav.add(col);
    }
  }

  // Terracotta pitched Huế pavilion roof + upper lantern tier
  const roofMat = mat("#9f4733", 0.74);
  const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(5.9, 1.45, 4), roofMat);
  lowerRoof.rotation.y = Math.PI / 4;
  lowerRoof.scale.set(1.25, 1, 0.86);
  lowerRoof.position.y = 4.3;
  lowerRoof.castShadow = true;
  const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(3.1, 0.95, 4), roofMat);
  upperRoof.rotation.y = Math.PI / 4;
  upperRoof.scale.set(1.2, 1, 0.82);
  upperRoof.position.y = 5.2;
  pav.add(lowerRoof, upperRoof);

  // Front outdoor striped awning facing +Z (toward Cầu Tràng Tiền & Perfume River)
  const awningTex = createCanvasTex(256, 128, (ctx, w, h) => {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#245743" : "#f6eedc";
      ctx.fillRect((i * w) / 10, 0, w / 10 + 1, h);
    }
  });
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(7.4, 0.14, 2.0),
    new THREE.MeshStandardMaterial({
      color: awningTex ? "#ffffff" : "#245743",
      map: awningTex,
      roughness: 0.76,
    }),
  );
  awning.position.set(0, 2.75, 3.15);
  awning.rotation.x = 0.24;
  awning.castShadow = true;
  pav.add(awning);

  // Front signboards (both toward river/bridge AND toward street side)
  const frontSign = createSignMesh(
    "CÀ PHÊ TRÀNG TIỀN",
    "RIVERSIDE GARDEN CAFÉ · HUẾ",
    4.6,
    1.05,
    {
      bg: "#1f4938",
      border: "#e8ca85",
      titleColor: "#fff8e8",
      subColor: "#f2d28a",
    },
  );
  frontSign.position.set(0, 3.38, 2.38);
  pav.add(frontSign);

  // Espresso service counter at open front bay
  pav.add(
    box([4.2, 0.96, 0.72], "#63412b", [0, 0.48, 2.45]),
    box([4.35, 0.08, 0.82], "#efe6d6", [0, 0.98, 2.45]),
  );

  cafeGroup.add(pav);

  // 4 Riverside outdoor patio table sets + parasols + seated animated patrons + open player seats
  const patioSpots = [
    { x: -4.4, z: 2.3, umbrella: "#2d6b4f", patrons: ["man", null] },
    { x: -1.4, z: 3.1, umbrella: "#c49445", patrons: ["woman", "man"] },
    { x: 1.7, z: 3.1, umbrella: "#2d6b4f", patrons: [null, "woman"] },
    { x: 4.5, z: 2.2, umbrella: "#a64343", patrons: ["woman", null] },
  ];
  patioSpots.forEach((spot, idx) => {
    const set = new THREE.Group();
    set.position.set(spot.x, 0, spot.z);
    const stemMat = mat("#363d42", 0.4, 0.7);
    const tableBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26, 0.3, 0.04, 12),
      stemMat,
    );
    tableBase.position.y = 0.02;
    const tableLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.04, 0.72, 8),
      stemMat,
    );
    tableLeg.position.y = 0.38;
    const tableTop = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.045, 16),
      mat("#f3ede1", 0.4),
    );
    tableTop.position.y = 0.74;
    tableTop.castShadow = tableTop.receiveShadow = true;

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 2.35, 8),
      stemMat,
    );
    pole.position.y = 1.2;
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(1.28, 0.4, 10, 1, true),
      mat(spot.umbrella, 0.78, 0.02, { side: THREE.DoubleSide }),
    );
    canopy.position.y = 2.38;
    canopy.castShadow = true;
    set.add(tableBase, tableLeg, tableTop, pole, canopy);

    // Chairs & seated patrons
    const angles = [-0.9, 2.2];
    spot.patrons.forEach((gender, pIdx) => {
      const ang = angles[pIdx];
      const cx = Math.sin(ang) * 0.72;
      const cz = Math.cos(ang) * 0.72;
      const chair = new THREE.Group();
      chair.position.set(cx, 0, cz);
      chair.rotation.y = ang + Math.PI;
      chair.add(
        box([0.4, 0.05, 0.38], "#7d5436", [0, 0.44, 0]),
        box([0.4, 0.44, 0.05], "#7d5436", [0, 0.68, -0.17]),
      );
      set.add(chair);

      if (gender) {
        const patron = createSeatedCafePatron({
          gender,
          paletteIndex: idx + pIdx,
          phase: idx * 1.4 + pIdx * 2.1,
        });
        patron.group.position.copy(chair.position);
        patron.group.rotation.y = chair.rotation.y;
        set.add(patron.group);
        animatedPatrons.push(patron.animate);
      } else if (onOpenSeat) {
        onOpenSeat({
          id: `trang-tien-seat-${idx}-${pIdx}`,
          lx: spot.x + cx,
          lz: spot.z + cz,
          tableLx: spot.x,
          tableLz: spot.z,
          returnLx: spot.x + Math.sin(ang) * 1.25,
          returnLz: spot.z + Math.cos(ang) * 1.25,
        });
      }
    });

    cafeGroup.add(set);
  });

  return cafeGroup;
}

function buildCantileverTrafficSignal({ x, z, lookAtX, lookAtZ, phaseGroup = 0 }) {
  const g = new THREE.Group();
  g.position.set(x, 0.16, z);
  const yaw = Math.atan2(lookAtX - x, lookAtZ - z);
  g.rotation.y = yaw;

  const poleMat = mat("#274036", 0.42, 0.65);
  const darkBoxMat = mat("#1d2226", 0.55, 0.35);

  const plinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.28, 0.45, 10),
    mat("#8e918c", 0.88),
  );
  plinth.position.y = 0.225;
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.15, 5.6, 10),
    poleMat,
  );
  mast.position.y = 2.95;
  mast.castShadow = true;

  // Horizontal mast arm projecting forward toward intersection center
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.085, 3.8, 8),
    poleMat,
  );
  arm.rotation.x = Math.PI / 2;
  arm.position.set(0, 5.45, 1.9);
  arm.castShadow = true;

  // Vertical pillar signal box (for pedestrians/cyclists near pole) + overhead box on arm
  const heads = [];
  for (const [hx, hy, hz, scale] of [
    [0, 3.15, 0.18, 0.85],
    [0, 5.1, 3.1, 1.05],
  ]) {
    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.46 * scale, 1.38 * scale, 0.36 * scale),
      darkBoxMat,
    );
    housing.position.set(hx, hy, hz);
    housing.castShadow = true;
    g.add(housing);

    const colors = ["#e63935", "#f0b429", "#2dbd6e"];
    const lamps = colors.map((col, idx) => {
      const m = new THREE.MeshBasicMaterial({ color: col });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(0.13 * scale, 14), m);
      disc.position.set(hx, hy + (1 - idx) * 0.4 * scale, hz + 0.19 * scale);
      g.add(disc);
      // Back-side indicator disc too so viewable from behind spawn too
      const discBack = new THREE.Mesh(new THREE.CircleGeometry(0.11 * scale, 12), m);
      discBack.rotation.y = Math.PI;
      discBack.position.set(hx, hy + (1 - idx) * 0.4 * scale, hz - 0.19 * scale);
      g.add(discBack);
      return m;
    });
    heads.push(lamps);
  }

  g.add(plinth, mast, arm);
  return { group: g, heads, phaseGroup };
}

function buildSaigonMorinHotel(polyPoints) {
  const morin = new THREE.Group();
  morin.name = "hotel-saigon-morin";
  const height = 14.2;

  // Extrude full footprint mass + central French courtyard recess detail
  const shape = new THREE.Shape(polyPoints.map((p) => new THREE.Vector2(p.x, -p.z)));
  const bodyGeo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
  bodyGeo.rotateX(-Math.PI / 2);

  // Normalize planar UVs on side walls so colonial facade texture tiles crisply
  const posAttr = bodyGeo.attributes.position;
  const normAttr = bodyGeo.attributes.normal;
  const uvAttr = bodyGeo.attributes.uv;
  if (posAttr && normAttr && uvAttr) {
    for (let i = 0; i < posAttr.count; i++) {
      const ny = Math.abs(normAttr.getY(i));
      if (ny < 0.5) {
        const horiz = posAttr.getX(i) + posAttr.getZ(i);
        uvAttr.setXY(i, horiz / 16, posAttr.getY(i) / height);
      } else {
        uvAttr.setXY(i, posAttr.getX(i) / 14, posAttr.getZ(i) / 14);
      }
    }
    uvAttr.needsUpdate = true;
  }

  const facadeTex = createMorinFacadeTexture();
  const wallMat = new THREE.MeshStandardMaterial({
    color: facadeTex ? "#ffffff" : "#f4ead3",
    map: facadeTex,
    roughness: 0.78,
  });
  const topMat = mat("#c8bba2", 0.85);
  const body = new THREE.Mesh(bodyGeo, [topMat, wallMat]);
  body.position.y = 0.23;
  body.castShadow = body.receiveShadow = true;
  morin.add(body);

  // Cream perimeter cornice ledge & pitched terracotta hipped roof cap
  const corniceShape = new THREE.Shape(
    polyPoints.map((p) => new THREE.Vector2(p.x, -p.z)),
  );
  const corniceGeo = new THREE.ExtrudeGeometry(corniceShape, {
    depth: 0.55,
    bevelEnabled: true,
    bevelThickness: 0.22,
    bevelSize: 0.55,
    bevelSegments: 1,
  });
  corniceGeo.rotateX(-Math.PI / 2);
  const cornice = new THREE.Mesh(corniceGeo, mat("#fbf4e4", 0.72));
  cornice.position.y = height + 0.1;
  morin.add(cornice);

  // Stepped terracotta roof tiers crowning the hotel
  const cx = polyPoints.reduce((s, p) => s + p.x, 0) / polyPoints.length;
  const cz = polyPoints.reduce((s, p) => s + p.z, 0) / polyPoints.length;
  const roofMat = mat("#9c4430", 0.74);
  for (let tier = 0; tier < 3; tier++) {
    const scale = 1 - tier * 0.08;
    const rPts = polyPoints.map((p) => ({
      x: cx + (p.x - cx) * scale,
      z: cz + (p.z - cz) * scale,
    }));
    const rShape = new THREE.Shape(rPts.map((p) => new THREE.Vector2(p.x, -p.z)));
    const rGeo = new THREE.ExtrudeGeometry(rShape, { depth: 0.95, bevelEnabled: false });
    rGeo.rotateX(-Math.PI / 2);
    const rMesh = new THREE.Mesh(rGeo, roofMat);
    rMesh.position.y = height + 0.75 + tier * 0.95;
    rMesh.castShadow = true;
    morin.add(rMesh);
  }

  // Iconic chamfered corner grand entrance facing Ngã 4 (1338.2, -1210.6)
  // Edge [1327.5, -1187.4] -> [1350.0, -1187.0]
  const cornerMidX = (1327.5 + 1350.0) / 2;
  const cornerMidZ = (-1187.4 + -1187.0) / 2;
  const cornerEntry = new THREE.Group();
  cornerEntry.position.set(cornerMidX, 0.23, cornerMidZ);
  cornerEntry.rotation.y = Math.atan2(
    NGA4_MORIN_CENTER.x - cornerMidX,
    NGA4_MORIN_CENTER.z - cornerMidZ,
  );

  // Granite steps + grand cream colonnade portico + burgundy porte-cochère canopy
  cornerEntry.add(
    box([14.5, 0.35, 3.2], "#d8d1c2", [0, 0.175, 1.4]),
    box([12.5, 0.35, 2.2], "#e5decb", [0, 0.45, 0.9]),
    box([13.2, 0.55, 3.8], "#731e24", [0, 4.6, 1.8]),
    box([13.5, 0.16, 4.0], "#e8ca85", [0, 4.92, 1.8]),
  );
  for (const px of [-5.8, -2.2, 2.2, 5.8]) {
    const pil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 4.5, 12),
      mat("#f7efe0", 0.65),
    );
    pil.position.set(px, 2.35, 3.2);
    pil.castShadow = true;
    cornerEntry.add(pil);
  }

  // Classic heritage signs on canopy & upper facade overlooking Ngã 4 intersection
  const canopySign = createSignMesh(
    "SAIGON MORIN HOTEL",
    "KHÁCH SẠN SAIGON MORIN · 30 LÊ LỢI",
    11.4,
    1.15,
    {
      bg: "#5e181e",
      border: "#ebd08b",
      titleColor: "#fff8e8",
      subColor: "#f3d792",
    },
  );
  canopySign.position.set(0, 4.62, 3.85);
  cornerEntry.add(canopySign);

  const rooftopSign = createSignMesh(
    "KHÁCH SẠN SAIGON MORIN · EST. 1901",
    "HOTEL SAIGON MORIN · HUẾ HERITAGE LANDMARK",
    16.5,
    2.4,
    {
      bg: "#26362e",
      border: "#ebd08b",
      titleColor: "#ffefc7",
      subColor: "#d9e3d5",
    },
  );
  rooftopSign.position.set(0, height + 2.2, 0.6);
  cornerEntry.add(rooftopSign);

  // Rooftop flagpole & Vietnamese red star flag
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 4.8, 8),
    mat("#d9d5cc", 0.35, 0.8),
  );
  flagPole.position.set(0, height + 5.0, -0.5);
  const flagTex = createCanvasTex(192, 128, (ctx, w, h) => {
    ctx.fillStyle = "#c82328";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#f7d436";
    if (ctx.beginPath && ctx.moveTo && ctx.lineTo) {
      ctx.beginPath();
      const cx0 = w / 2;
      const cy0 = h / 2;
      const r1 = 30;
      const r2 = 12;
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const r = i % 2 === 0 ? r1 : r2;
        if (i === 0) ctx.moveTo(cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r);
        else ctx.lineTo(cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r);
      }
      ctx.closePath?.();
      ctx.fill();
    }
  });
  const flagMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.1, 1.35),
    new THREE.MeshStandardMaterial({
      color: flagTex ? "#ffffff" : "#c82328",
      map: flagTex,
      roughness: 0.72,
      side: THREE.DoubleSide,
    }),
  );
  flagMesh.position.set(1.05, height + 6.7, -0.5);
  cornerEntry.add(flagPole, flagMesh);

  morin.add(cornerEntry);

  // Additional Lê Lợi street frontage signboard along western arcade
  const leLoiSign = createSignMesh(
    "SAIGON MORIN HOTEL",
    "30 LÊ LỢI · PHÚ HỘI · HUẾ",
    9.2,
    1.5,
    {
      bg: "#5e181e",
      border: "#ebd08b",
      titleColor: "#fff8e8",
      subColor: "#f3d792",
    },
  );
  leLoiSign.position.set(1284.0, 5.2, -1150.2);
  leLoiSign.rotation.y = Math.atan2(-0.67, -0.74);
  morin.add(leLoiSign);

  return { group: morin, body, polyPoints };
}

export class TruongTienSurroundings {
  constructor(world, activeFeatures = []) {
    this.world = world;
    this.group = new THREE.Group();
    this.group.name = "truong-tien-surroundings";
    this.animated = [];
    this.signalControllers = [];

    // 1. Tuyến đường đi bộ dạo mát ven sông dưới chân cầu Tràng Tiền
    const promGeo = buildPromenadeRibbon(
      UNDER_BRIDGE_PROMENADE_POINTS,
      PROMENADE_HALF_WIDTH,
      PROMENADE_Y,
    );
    const promMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: createPromenadeStoneTexture(),
      roughness: 0.86,
      side: THREE.DoubleSide,
    });
    const promMesh = new THREE.Mesh(promGeo, promMat);
    promMesh.receiveShadow = true;
    this.group.add(promMesh);

    // Granite riverside edge curbing + benches + park lamps along under-bridge promenade
    const curbGeo = buildPromenadeRibbon(UNDER_BRIDGE_PROMENADE_POINTS, 0.28, PROMENADE_Y + 0.08);
    const curbMesh = new THREE.Mesh(curbGeo, mat("#878073", 0.85));
    curbMesh.position.y = 0.02;
    this.group.add(curbMesh);

    const benchCoords = [
      { x: 1261.5, z: -1245.5, yaw: -2.32 },
      { x: 1281.5, z: -1267.5, yaw: -2.32 },
      { x: 1303.5, z: -1289.5, yaw: -2.32 },
      { x: 1322.5, z: -1306.5, yaw: -2.32 },
    ];
    benchCoords.forEach((bc, idx) => {
      const bench = buildParkBench();
      bench.position.set(bc.x, PROMENADE_Y, bc.z);
      bench.rotation.y = bc.yaw;
      this.group.add(bench);
      if (idx !== 1) {
        const couple = createSeatedBenchCouple({
          x: bc.x,
          benchBaseY: PROMENADE_Y,
          z: bc.z,
          yaw: bc.yaw,
          manIndex: idx + 1,
          womanIndex: idx + 2,
          phase: idx * 1.15,
        });
        this.group.add(couple.group);
        this.animated.push(couple.update);
      }
    });
    const lampCoords = [
      { x: 1254.0, z: -1236.5 },
      { x: 1272.0, z: -1253.0 },
      { x: 1295.0, z: -1277.5 },
      { x: 1316.0, z: -1297.5 },
      { x: 1335.0, z: -1315.5 },
    ];
    for (const lc of lampCoords) {
      const lamp = buildParkLamp();
      lamp.position.set(lc.x, PROMENADE_Y, lc.z);
      this.group.add(lamp);
    }

    // 2. Quán Café phía bên phải Cầu Tràng Tiền (trong Công viên 3 Tháng 2 ven sông)
    const cafeHolder = new THREE.Group();
    cafeHolder.position.set(
      TRANG_TIEN_CAFE_CENTER.x,
      PROMENADE_Y,
      TRANG_TIEN_CAFE_CENTER.z,
    );
    const cafeLocalToWorld = (lx, lz) => {
      const c = Math.cos(TRANG_TIEN_CAFE_CENTER.yaw);
      const s = Math.sin(TRANG_TIEN_CAFE_CENTER.yaw);
      return {
        x: TRANG_TIEN_CAFE_CENTER.x + lx * c + lz * s,
        z: TRANG_TIEN_CAFE_CENTER.z - lx * s + lz * c,
      };
    };
    cafeHolder.add(
      buildRightSideCafe(this.animated, (seat) => {
        const sWorld = cafeLocalToWorld(seat.lx, seat.lz);
        const tWorld = cafeLocalToWorld(seat.tableLx, seat.tableLz);
        const rWorld = cafeLocalToWorld(seat.returnLx, seat.returnLz);
        world.cafeSpots?.push({
          id: seat.id,
          venueId: "trang-tien-riverside-cafe",
          title: "Cà phê Tràng Tiền",
          x: sWorld.x,
          y: PROMENADE_Y,
          z: sWorld.z,
          heading: Math.atan2(tWorld.x - sWorld.x, tWorld.z - sWorld.z),
          returnPose: { x: rWorld.x, y: PROMENADE_Y, z: rWorld.z },
        });
      }),
    );
    this.group.add(cafeHolder);

    // Connector walkway linking riverside promenade seamlessly into right-side café terrace
    const cafeConnGeo = buildPromenadeRibbon(
      [
        { x: 1309.6, z: -1287.4 },
        { x: 1314.8, z: -1280.0 },
      ],
      2.2,
      PROMENADE_Y + 0.022,
    );
    const cafeConn = new THREE.Mesh(cafeConnGeo, promMat);
    cafeConn.receiveShadow = true;
    this.group.add(cafeConn);

    // Café pavilion collision rectangle in café local coordinates (z = -5.4 .. -0.8, x = -3.9 .. +3.9)
    this.cafeCenter = TRANG_TIEN_CAFE_CENTER;

    if (world.venues) {
      world.venues.push({
        id: "trang-tien-riverside-cafe",
        title: "Cà phê Tràng Tiền · Bên phải Cầu",
        x: TRANG_TIEN_CAFE_CENTER.x,
        z: TRANG_TIEN_CAFE_CENTER.z,
      });
    }
    world.landmarks?.set("trang-tien-cafe", {
      id: "trang-tien-riverside-cafe",
      title: "Quán Café bên phải Cầu Tràng Tiền",
      position: { x: TRANG_TIEN_CAFE_CENTER.x, z: TRANG_TIEN_CAFE_CENTER.z },
      radius: 36,
      description:
        "Quán cà phê sân vườn ven sông Hương ngay phía bên phải Cầu Tràng Tiền (Công viên 3 Tháng 2).",
    });

    // 3. Ngã 4 Đèn Xanh Đỏ phía sau điểm xuất phát (Lê Lợi × Hùng Vương)
    // Zebra crosswalk markings across all 4 arms + 4 animated corner traffic signals
    const zebraMat = new THREE.MeshStandardMaterial({
      color: "#f4f2eb",
      roughness: 0.72,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const crosswalkArms = [
      // Cầu Trường Tiền NW arm
      { x: 1326.5, z: -1221.8, yaw: Math.atan2(-0.729, -0.684), width: 12.2 },
      // Hùng Vương SE arm
      { x: 1349.5, z: -1200.0, yaw: Math.atan2(0.729, 0.684), width: 12.2 },
      // Lê Lợi SW arm
      { x: 1326.8, z: -1200.2, yaw: Math.atan2(-0.742, 0.670), width: 12.0 },
      // Lê Lợi NE arm
      { x: 1349.6, z: -1221.0, yaw: Math.atan2(0.742, -0.670), width: 12.0 },
    ];
    const stripeParts = [];
    for (const arm of crosswalkArms) {
      const nStripes = 7;
      for (let i = 0; i < nStripes; i++) {
        const lat = -arm.width * 0.42 + (i / (nStripes - 1)) * arm.width * 0.84;
        const g = new THREE.BoxGeometry(0.55, 0.02, 2.8);
        g.rotateY(arm.yaw);
        g.translate(
          arm.x + Math.cos(arm.yaw) * lat,
          0.335,
          arm.z - Math.sin(arm.yaw) * lat,
        );
        stripeParts.push(g);
      }
    }
    const stripesMesh = new THREE.Mesh(mergeGeometries(stripeParts), zebraMat);
    stripeParts.forEach((g) => g.dispose());
    stripesMesh.receiveShadow = true;
    this.group.add(stripesMesh);

    for (const corner of NGA4_SIGNAL_CORNERS) {
      const sig = buildCantileverTrafficSignal({
        x: corner.x,
        z: corner.z,
        lookAtX: NGA4_MORIN_CENTER.x,
        lookAtZ: NGA4_MORIN_CENTER.z,
        phaseGroup: corner.axis === "ns" ? 0 : 1,
      });
      this.group.add(sig.group);
      this.signalControllers.push(sig);
    }

    // 4. Khách sạn Saigon Morin (30 Lê Lợi, ngay phía sau Ngã 4 Lê Lợi × Hùng Vương)
    const morinFeature = activeFeatures.find((f) => f.id === 239566031);
    const morinRawPts = morinFeature?.geometry?.length
      ? getPointsOf(morinFeature)
      : MORIN_FALLBACK_POLYGON;
    const morinPts =
      morinRawPts.length > 2 &&
      Math.hypot(
        morinRawPts[0].x - morinRawPts.at(-1).x,
        morinRawPts[0].z - morinRawPts.at(-1).z,
      ) < 0.2
        ? morinRawPts.slice(0, -1)
        : morinRawPts;
    const morinBuild = buildSaigonMorinHotel(morinPts);
    this.morinPolygon = {
      points: morinPts,
      minX: Math.min(...morinPts.map((p) => p.x)),
      maxX: Math.max(...morinPts.map((p) => p.x)),
      minZ: Math.min(...morinPts.map((p) => p.z)),
      maxZ: Math.max(...morinPts.map((p) => p.z)),
    };
    this.group.add(morinBuild.group);
    world.cameraObstacles?.push(morinBuild.body);
    world.buildingPolygons?.push(this.morinPolygon);
    world.landmarks?.set("saigon-morin", {
      id: "saigon-morin",
      title: "Khách sạn Saigon Morin (30 Lê Lợi)",
      position: { x: 1338.8, z: -1187.2 },
      radius: 75,
      description:
        "Khách sạn lịch sử Saigon Morin phong cách kiến trúc Pháp cổ điển từ năm 1901 ngay sau Ngã 4 Lê Lợi × Hùng Vương (đầu Cầu Tràng Tiền).",
    });

    world.scene.add(this.group);
  }

  cafeLocalCoords(x, z) {
    const dx = x - this.cafeCenter.x;
    const dz = z - this.cafeCenter.z;
    const c = Math.cos(-this.cafeCenter.yaw);
    const s = Math.sin(-this.cafeCenter.yaw);
    return {
      lx: dx * c + dz * s,
      lz: -dx * s + dz * c,
    };
  }

  isOnPromenade(x, z) {
    const hit = nearestPoint({ x, z }, UNDER_BRIDGE_PROMENADE_POINTS);
    return hit.distance <= PROMENADE_HALF_WIDTH + 0.35;
  }

  isOnCafePatio(x, z) {
    const { lx, lz } = this.cafeLocalCoords(x, z);
    return Math.abs(lx) <= 7.8 && Math.abs(lz) <= 6.3;
  }

  isInsideCafePavilion(x, z) {
    const { lx, lz } = this.cafeLocalCoords(x, z);
    return Math.abs(lx) <= 4.15 && lz >= -5.65 && lz <= -0.55;
  }

  isInsideMorin(x, z) {
    const m = this.morinPolygon;
    return (
      m &&
      x >= m.minX &&
      x <= m.maxX &&
      z >= m.minZ &&
      z <= m.maxZ &&
      inside({ x, z }, m.points)
    );
  }

  groundAt(x, z, referenceY) {
    if (Number.isFinite(referenceY) && referenceY >= 2.2) return null;
    if (this.isOnPromenade(x, z) || this.isOnCafePatio(x, z)) {
      return PROMENADE_Y;
    }
    return null;
  }

  canRide(x, z, referenceY) {
    if (Number.isFinite(referenceY) && referenceY >= 2.2) return null;
    if (this.isInsideCafePavilion(x, z) || this.isInsideMorin(x, z)) return false;
    if (this.isOnPromenade(x, z) || this.isOnCafePatio(x, z)) return true;
    return null;
  }

  blocksTree(x, z) {
    return (
      this.isOnPromenade(x, z) ||
      this.isOnCafePatio(x, z) ||
      this.isInsideMorin(x, z) ||
      Math.hypot(x - NGA4_MORIN_CENTER.x, z - NGA4_MORIN_CENTER.z) < 26
    );
  }

  blocksGrass(x, z) {
    return (
      this.isOnPromenade(x, z) ||
      this.isOnCafePatio(x, z) ||
      this.isInsideMorin(x, z)
    );
  }

  update(time) {
    for (const fn of this.animated) fn(time);
    // 12-second 4-way traffic signal cycle:
    // Group 0 (Bridge/Hung Vuong): 0-4.5s Green, 4.5-6.0s Amber, 6.0-12.0s Red
    // Group 1 (Le Loi):            0-6.0s Red,   6.0-10.5s Green, 10.5-12.0s Amber
    const cycle = ((time % 12) + 12) % 12;
    for (const sig of this.signalControllers) {
      let state; // 0 = red, 1 = amber, 2 = green
      if (sig.phaseGroup === 0) {
        state = cycle < 4.5 ? 2 : cycle < 6.0 ? 1 : 0;
      } else {
        state = cycle < 6.0 ? 0 : cycle < 10.5 ? 2 : 1;
      }
      for (const lamps of sig.heads) {
        lamps[0].color.setHex(state === 0 ? 0xff3b30 : 0x3b1210);
        lamps[1].color.setHex(state === 1 ? 0xffcc29 : 0x3f300c);
        lamps[2].color.setHex(state === 2 ? 0x2de072 : 0x10361e);
      }
    }
  }
}
