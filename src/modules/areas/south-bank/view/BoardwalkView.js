import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { inside, nearestPoint } from "../../../../core/shared/geography/geometry.js";
import { BOARDWALK_Y, TRUONG_TIEN_ID } from "../../../../core/world/roadSurface.js";
import { createIronwoodPlankTexture } from "../../../../core/world/turfTextures.js";
import { createComNamHawker } from "../../quang-trung/view/QuangTrungVendors.js";

const MAIN_BOARDWALK_IDS = [683633953, 1167513733, 1167513732];
export const LATERAL_BRIDGE_IDS = [1473289702, 1493443035, 1493443034, 1493443036];
const BANK_PROMENADE_ID = 1167513730;
const PHU_XUAN_SPAN_ID = 39419121;

// Seamless riverside extension from east end of OSM 683633953 ([1082.6, -1099.7]),
// continuing along the south riverbank edge cleanly underneath Cầu Tràng Tiền (s ~ 358)
// into Công viên 3 Tháng 2 waterfront.
export const BOARDWALK_EXTENSION_POINTS = [
  { x: 1093.0, z: -1109.5 },
  { x: 1140.0, z: -1152.0 },
  { x: 1195.0, z: -1202.0 },
  { x: 1242.0, z: -1245.5 },
  { x: 1255.0, z: -1264.0 },
  { x: 1264.5, z: -1275.5 },
  { x: 1275.0, z: -1286.5 },
  { x: 1296.0, z: -1305.5 },
  { x: 1320.0, z: -1328.0 },
  { x: 1344.0, z: -1350.0 },
];

// Lateral wooden connecting bridges linking extended Cầu Gỗ Lim to the south-bank promenade
export const UNDER_BRIDGE_LATERAL_BRIDGES = [
  {
    id: "ext-lat-diem-phung-thi",
    points: [
      { x: 1195.0, z: -1202.0 },
      { x: 1210.5, z: -1188.0 },
    ],
  },
  {
    id: "ext-lat-truong-tien-west",
    points: [
      { x: 1255.0, z: -1264.0 },
      { x: 1269.5, z: -1251.5 },
    ],
  },
  {
    id: "ext-lat-truong-tien-east",
    points: [
      { x: 1283.5, z: -1294.0 },
      { x: 1297.0, z: -1280.5 },
    ],
  },
  {
    id: "ext-lat-cong-vien-32",
    points: [
      { x: 1320.0, z: -1328.0 },
      { x: 1334.0, z: -1314.5 },
    ],
  },
];

export function lateralBridgeHeight(road, index, mainPoints) {
  if (!road?.points?.length || !mainPoints?.length) return 0.26;
  const pts = road.points;
  const d0 = nearestPoint(pts[0], mainPoints).distance;
  const d1 = nearestPoint(pts.at(-1), mainPoints).distance;
  const startAtBoardwalk = d0 <= d1;
  let total = 0;
  let dist = 0;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].z - pts[i - 1].z);
    total += seg;
    if (i <= index) dist += seg;
  }
  const t = dist / (total || 1);
  const ratio = startAtBoardwalk ? 1 - t : t;
  return 0.26 + (BOARDWALK_Y - 0.26) * ratio;
}

export function stitchMainBoardwalk(roads) {
  const segA = roads.find((r) => r.id === 683633953);
  const segB = roads.find((r) => r.id === 1167513733);
  const segC = roads.find((r) => r.id === 1167513732);
  if (!segA || !segB || !segC) return [];
  const extEastToWest = BOARDWALK_EXTENSION_POINTS.slice().reverse();
  return [
    ...extEastToWest,
    ...segA.points,
    ...segB.points.slice(1),
    ...segC.points.slice(1),
  ].map((p) => ({ x: p.x, z: p.z, y: BOARDWALK_Y }));
}

function buildFrames(points) {
  let arc = 0;
  return points.map((p, i) => {
    if (i > 0) {
      arc += Math.hypot(p.x - points[i - 1].x, p.z - points[i - 1].z);
    }
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(points.length - 1, i + 1)];
    const dx = next.x - prev.x;
    const dz = next.z - prev.z;
    const len = Math.hypot(dx, dz) || 1;
    return {
      x: p.x,
      z: p.z,
      y: p.y ?? BOARDWALK_Y,
      s: arc,
      tx: dx / len,
      tz: dz / len,
      nx: -dz / len,
      nz: dx / len,
    };
  });
}

function frameAtArc(frames, s) {
  if (!frames.length) return null;
  if (s <= frames[0].s) return frames[0];
  if (s >= frames.at(-1).s) return frames.at(-1);
  for (let i = 1; i < frames.length; i++) {
    const a = frames[i - 1];
    const b = frames[i];
    if (s <= b.s) {
      const t = (s - a.s) / (b.s - a.s || 1);
      const tx = a.tx + (b.tx - a.tx) * t;
      const tz = a.tz + (b.tz - a.tz) * t;
      const len = Math.hypot(tx, tz) || 1;
      return {
        x: a.x + (b.x - a.x) * t,
        z: a.z + (b.z - a.z) * t,
        y: a.y + (b.y - a.y) * t,
        s,
        tx: tx / len,
        tz: tz / len,
        nx: -tz / len,
        nz: tx / len,
      };
    }
  }
  return frames.at(-1);
}

function buildTopDeck(frames, halfWidth, yTopOffset = 0, plankRepeatLength = 3.2) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const y = f.y + yTopOffset;
    positions.push(
      f.x + f.nx * -halfWidth,
      y,
      f.z + f.nz * -halfWidth,
      f.x + f.nx * halfWidth,
      y,
      f.z + f.nz * halfWidth,
    );
    uvs.push(0, f.s / plankRepeatLength, 1, f.s / plankRepeatLength);
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

function buildViewingBayDeck(frame, side, halfW, bayRadius, yTopOffset = 0.004, plankRepeatLength = 3.2) {
  const segs = 16;
  const positions = [];
  const uvs = [];
  const indices = [];
  const y = frame.y + yTopOffset;

  // Vertex pairs along outer deck edge (chord c_i) and semicircle (arc a_i), starting strictly at |lat| >= halfW
  for (let i = 0; i <= segs; i++) {
    const alpha = (i / segs) * Math.PI;
    const tangentOff = -Math.cos(alpha) * bayRadius;
    const radialOut = Math.sin(alpha) * bayRadius;

    const cx = frame.x + frame.tx * tangentOff + frame.nx * side * halfW;
    const cz = frame.z + frame.tz * tangentOff + frame.nz * side * halfW;
    const ax = frame.x + frame.tx * tangentOff + frame.nx * side * (halfW + radialOut);
    const az = frame.z + frame.tz * tangentOff + frame.nz * side * (halfW + radialOut);

    const vCoord = (frame.s + tangentOff) / plankRepeatLength;
    positions.push(cx, y, cz, ax, y, az);
    uvs.push(0, vCoord, radialOut / (halfW * 2), vCoord);
  }

  for (let i = 0; i < segs; i++) {
    const p0 = i * 2;
    const p1 = (i + 1) * 2;
    if (i === 0) {
      indices.push(p0, p1 + 1, p1);
    } else if (i === segs - 1) {
      indices.push(p0, p0 + 1, p1);
    } else {
      indices.push(p0, p0 + 1, p1, p0 + 1, p1 + 1, p1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildExtrudedStrip(frames, profile, uRepeat = 6) {
  const ring = profile.length;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    for (let k = 0; k < ring; k++) {
      const [lat, dy] = profile[k];
      positions.push(f.x + f.nx * lat, f.y + dy, f.z + f.nz * lat);
      uvs.push(k / ring, f.s / uRepeat);
    }
    if (i > 0) {
      const b0 = (i - 1) * ring;
      const b1 = i * ring;
      for (let k = 0; k < ring; k++) {
        const kn = (k + 1) % ring;
        indices.push(b0 + k, b0 + kn, b1 + k, b0 + kn, b1 + kn, b1 + k);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function addLimWoodBoardwalk(world, roads) {
  const mainPoints = stitchMainBoardwalk(roads);
  if (mainPoints.length < 2) return null;

  const mobile = Boolean(world.quality?.mobile);
  const group = new THREE.Group();
  group.name = "lim-wood-boardwalk";

  const woodTex = createIronwoodPlankTexture(1, 1, { mobile, rich: true });
  const deckMat = new THREE.MeshStandardMaterial({
    color: woodTex ? "#ffffff" : "#7b4c28",
    map: woodTex,
    roughness: 0.62,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });
  const fasciaMat = new THREE.MeshStandardMaterial({
    color: "#4a2b14",
    roughness: 0.78,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const railMat = new THREE.MeshStandardMaterial({
    color: "#6e4221",
    roughness: 0.68,
    metalness: 0.06,
    side: THREE.DoubleSide,
  });
  const metalRailMat = new THREE.MeshStandardMaterial({
    color: "#8f958f",
    roughness: 0.36,
    metalness: 0.64,
    side: THREE.DoubleSide,
  });
  const bronzeCapMat = new THREE.MeshStandardMaterial({
    color: "#2c241d",
    roughness: 0.44,
    metalness: 0.56,
  });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: "#fff4d4",
    emissive: "#ffbe48",
    emissiveIntensity: 0.95,
    roughness: 0.22,
  });
  const pierMat = new THREE.MeshStandardMaterial({
    color: "#5e6159",
    roughness: 0.9,
    metalness: 0.05,
  });
  const concreteWallMat = new THREE.MeshStandardMaterial({
    color: "#b8b4aa",
    roughness: 0.88,
    metalness: 0.04,
    side: THREE.DoubleSide,
  });
  const soilMat = new THREE.MeshStandardMaterial({
    color: "#3d2f22",
    roughness: 0.95,
  });
  const shrubMat = new THREE.MeshStandardMaterial({
    color: "#4a7d35",
    roughness: 0.82,
  });
  const bloomMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    roughness: 0.68,
    metalness: 0.02,
  });

  const mainFrames = buildFrames(mainPoints);
  const totalMainLen = mainFrames.at(-1).s;
  const halfW = 2.1; // 4.2m total boardwalk width

  const deckParts = [];
  const beamParts = [];

  // 1. Main boardwalk plank top (y = 0.684m) + thick dark-ironwood fascia/curb (y = 0.40..0.68m)
  deckParts.push(buildTopDeck(mainFrames, halfW, 0.004, 3.2));
  beamParts.push(
    buildExtrudedStrip(
      mainFrames,
      [
        [-halfW - 0.06, -0.025],
        [-halfW - 0.06, -0.28],
        [halfW + 0.06, -0.28],
        [halfW + 0.06, -0.025],
        [halfW - 0.02, -0.025],
        [halfW - 0.02, -0.2],
        [-halfW + 0.02, -0.2],
        [-halfW + 0.02, -0.025],
      ],
      6,
    ),
  );

  const rampCorridors = [];
  // Entry/exit timber shore ramps sloping cleanly down to promenade level (east 0.24m, west 0.256m ironwood walk)
  for (const end of [
    { origin: mainFrames[0], dir: -1, endY: 0.24 },
    { origin: mainFrames.at(-1), dir: 1, endY: 0.256 },
  ]) {
    const f = end.origin;
    const rampPts = [
      { x: f.x, z: f.z, y: BOARDWALK_Y },
      { x: f.x + f.tx * end.dir * 4.5, z: f.z + f.tz * end.dir * 4.5, y: end.endY },
    ];
    const rFrames = buildFrames(
      end.dir < 0 ? [rampPts[1], rampPts[0]] : rampPts,
    );
    rampCorridors.push(rFrames);
    deckParts.push(buildTopDeck(rFrames, halfW, 0.004, 3.2));
    beamParts.push(
      buildExtrudedStrip(
        rFrames,
        [
          [-halfW - 0.04, -0.025],
          [-halfW - 0.04, -0.2],
          [halfW + 0.04, -0.2],
          [halfW + 0.04, -0.025],
        ],
        4,
      ),
    );
  }

  // 2. Collect lateral cross-bridge junctions & construct the lateral wooden footbridges
  const lateralJunctions = [];
  const lateralCorridors = [];
  const lateralPiers = [];
  const bankPoints = [];
  const slatTransforms = [];
  const metalBalusterTransforms = [];
  const newelTransforms = [];
  const lanternTransforms = [];
  const handrailParts = [];
  const metalRailParts = [];

  const allLateralSpecs = [
    ...LATERAL_BRIDGE_IDS.map((id) => roads.find((r) => r.id === id)).filter(Boolean),
    ...UNDER_BRIDGE_LATERAL_BRIDGES,
  ];

  for (const road of allLateralSpecs) {
    if (!road || road.points.length < 2) continue;
    const d0 = nearestPoint(road.points[0], mainPoints).distance;
    const d1 = nearestPoint(road.points.at(-1), mainPoints).distance;
    const startAtBoardwalk = d0 <= d1;
    const ordered = startAtBoardwalk
      ? road.points
      : road.points.slice().reverse();
    lateralJunctions.push(ordered[0]);
    bankPoints.push(ordered.at(-1));

    let latTotal = 0;
    for (let i = 1; i < ordered.length; i++) {
      latTotal += Math.hypot(
        ordered[i].x - ordered[i - 1].x,
        ordered[i].z - ordered[i - 1].z,
      );
    }
    let run = 0;
    const latWithY = ordered.map((p, i) => {
      if (i > 0) {
        run += Math.hypot(p.x - ordered[i - 1].x, p.z - ordered[i - 1].z);
      }
      const t = run / (latTotal || 1);
      return { x: p.x, z: p.z, y: BOARDWALK_Y * (1 - t) + 0.26 * t };
    });
    const lFrames = buildFrames(latWithY);
    const lHalfW = 1.5;
    lateralCorridors.push({ frames: lFrames, halfW: lHalfW });

    const lLen = lFrames.at(-1).s;
    const trimDeckStart = Math.min(halfW - 0.04, lLen * 0.25);
    const trimmedDeckFrames = [
      frameAtArc(lFrames, trimDeckStart),
      ...lFrames.filter((lf) => lf.s > trimDeckStart),
    ].filter(Boolean);
    deckParts.push(buildTopDeck(trimmedDeckFrames, lHalfW, 0.004, 2.8));
    beamParts.push(
      buildExtrudedStrip(
        trimmedDeckFrames,
        [
          [-lHalfW - 0.05, -0.025],
          [-lHalfW - 0.05, -0.24],
          [lHalfW + 0.05, -0.24],
          [lHalfW + 0.05, -0.025],
        ],
        5,
      ),
    );

    for (const ratio of [0.35, 0.68]) {
      const pf = frameAtArc(lFrames, lFrames.at(-1).s * ratio);
      if (pf) lateralPiers.push(pf);
    }

    // Lateral railings: warm timber top cap rail + galvanized steel mid/bottom rails & vertical balusters
    const trimStart = Math.min(2.05, lLen * 0.25);
    const trimmedRailFrames = [
      frameAtArc(lFrames, trimStart),
      ...lFrames.filter((lf) => lf.s > trimStart),
    ].filter(Boolean);
    for (const side of [-1, 1]) {
      const rLat = side * (lHalfW - 0.08);
      if (trimmedRailFrames.length >= 2) {
        handrailParts.push(
          buildExtrudedStrip(
            trimmedRailFrames,
            [
              [rLat - 0.065, 0.96],
              [rLat - 0.065, 1.035],
              [rLat + 0.065, 1.035],
              [rLat + 0.065, 0.96],
            ],
            4,
          ),
        );
        metalRailParts.push(
          buildExtrudedStrip(
            trimmedRailFrames,
            [
              [rLat - 0.026, 0.44],
              [rLat - 0.026, 0.48],
              [rLat + 0.026, 0.48],
              [rLat + 0.026, 0.44],
            ],
            4,
          ),
          buildExtrudedStrip(
            trimmedRailFrames,
            [
              [rLat - 0.03, 0.11],
              [rLat - 0.03, 0.16],
              [rLat + 0.03, 0.16],
              [rLat + 0.03, 0.11],
            ],
            4,
          ),
        );
      }
      const yaw = Math.atan2(lFrames[0].tx, lFrames[0].tz);
      for (let d = trimStart + 0.2; d <= lLen - 0.25; d += 0.24) {
        const sf = frameAtArc(lFrames, d);
        if (!sf) continue;
        metalBalusterTransforms.push({
          x: sf.x + sf.nx * rLat,
          y: sf.y + 0.5,
          z: sf.z + sf.nz * rLat,
          yaw: Math.atan2(sf.tx, sf.tz),
        });
      }
      for (let d = trimStart; d <= lLen - 0.2; d += 2.2) {
        const nf = frameAtArc(lFrames, d);
        if (!nf) continue;
        newelTransforms.push({
          x: nf.x + nf.nx * rLat,
          y: nf.y + 0.53,
          z: nf.z + nf.nz * rLat,
          yaw: Math.atan2(nf.tx, nf.tz) || yaw,
        });
      }
    }
  }

  // 3. Semi-circular riverfront viewing bays ("vọng cảnh bán nguyệt") along open river stretches
  const phuXuanRoad = roads.find((r) => r.id === PHU_XUAN_SPAN_ID);
  const truongTienRoad = roads.find((r) => r.id === TRUONG_TIEN_ID);
  const segA683 = roads.find((r) => r.id === 683633953);
  const protectedTestPts = segA683?.points?.slice(0, 2) || [];

  const bayRadius = 3.2;
  const viewingBays = [];
  const bayMouthOpenings = [];
  const bayRailSegments = [];
  const bayBenchParts = [];
  const bayPlanterSites = [];

  for (let s = 44; s <= totalMainLen - 44 && viewingBays.length < 5; s += 12) {
    if (viewingBays.some((b) => Math.abs(b.s - s) < 120)) continue;
    const f = frameAtArc(mainFrames, s);
    if (!f) continue;
    const fPrev = frameAtArc(mainFrames, s - 7);
    const fNext = frameAtArc(mainFrames, s + 7);
    if (!fPrev || !fNext || fPrev.tx * fNext.tx + fPrev.tz * fNext.tz < 0.92) continue;

    if (
      (phuXuanRoad && nearestPoint({ x: f.x, z: f.z }, phuXuanRoad.points).distance < 18) ||
      (truongTienRoad && nearestPoint({ x: f.x, z: f.z }, truongTienRoad.points).distance < 20) ||
      lateralJunctions.some((j) => Math.hypot(f.x - j.x, f.z - j.z) < 14) ||
      protectedTestPts.some((pt) => Math.hypot(f.x - pt.x, f.z - pt.z) < 26)
    ) {
      continue;
    }

    const plusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x + f.nx * 24, z: f.z + f.nz * 24 }, ring),
    );
    const minusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x - f.nx * 24, z: f.z - f.nz * 24 }, ring),
    );
    if (plusInRiver === minusInRiver) continue;
    const side = plusInRiver ? 1 : -1;

    // Ensure outer bay nose is strictly inside open river water
    const nosePt = {
      x: f.x + f.nx * side * (halfW + bayRadius + 1.2),
      z: f.z + f.nz * side * (halfW + bayRadius + 1.2),
    };
    if (!world.riverRings?.some((ring) => inside(nosePt, ring))) continue;

    viewingBays.push({
      s,
      x: f.x,
      z: f.z,
      y: f.y,
      tx: f.tx,
      tz: f.tz,
      nx: f.nx,
      nz: f.nz,
      side,
      radius: bayRadius,
    });

    bayMouthOpenings.push({
      x: f.x + f.nx * side * (halfW - 0.1),
      z: f.z + f.nz * side * (halfW - 0.1),
      halfOpening: bayRadius - 0.25,
    });

    // Semi-circular deck (strictly outside main deck boundary |lat| >= halfW)
    deckParts.push(buildViewingBayDeck(f, side, halfW, bayRadius, 0.004, 3.2));

    // Curved fascia + curved handrail along outer semicircular rim
    const arcSegs = 16;
    const fasciaArcPts = [];
    const railArcPts = [];
    const rRail = bayRadius - 0.12;
    for (let k = 0; k <= arcSegs; k++) {
      const alpha = (k / arcSegs) * Math.PI;
      const tOff = -Math.cos(alpha) * (bayRadius + 0.04);
      const rOff = Math.sin(alpha) * (bayRadius + 0.04);
      fasciaArcPts.push({
        x: f.x + f.tx * tOff + f.nx * side * (halfW + rOff),
        z: f.z + f.tz * tOff + f.nz * side * (halfW + rOff),
        y: f.y,
      });

      const rtOff = -Math.cos(alpha) * rRail;
      const rrOff = Math.sin(alpha) * rRail;
      railArcPts.push({
        x: f.x + f.tx * rtOff + f.nx * side * (halfW - 0.1 + rrOff),
        z: f.z + f.tz * rtOff + f.nz * side * (halfW - 0.1 + rrOff),
        y: f.y,
      });
    }

    const fasciaArcFrames = buildFrames(fasciaArcPts);
    beamParts.push(
      buildExtrudedStrip(
        fasciaArcFrames,
        [
          [-0.08, -0.025],
          [-0.08, -0.28],
          [0.06, -0.28],
          [0.06, -0.025],
        ],
        4,
      ),
    );

    const railArcFrames = buildFrames(railArcPts);
    handrailParts.push(
      buildExtrudedStrip(
        railArcFrames,
        [
          [-0.075, 0.96],
          [-0.075, 1.035],
          [0.075, 1.035],
          [0.075, 0.96],
        ],
        4,
      ),
      buildExtrudedStrip(
        railArcFrames,
        [
          [-0.032, 0.45],
          [-0.032, 0.5],
          [0.032, 0.5],
          [0.032, 0.45],
        ],
        4,
      ),
      buildExtrudedStrip(
        railArcFrames,
        [
          [-0.04, 0.12],
          [-0.04, 0.18],
          [0.04, 0.18],
          [0.04, 0.12],
        ],
        4,
      ),
    );

    for (let i = 1; i < railArcPts.length; i++) {
      bayRailSegments.push({ a: railArcPts[i - 1], b: railArcPts[i] });
    }

    const railArcLen = railArcFrames.at(-1).s;
    for (let d = 0.22; d <= railArcLen - 0.22; d += 0.22) {
      const sf = frameAtArc(railArcFrames, d);
      if (!sf) continue;
      slatTransforms.push({
        x: sf.x,
        y: sf.y + 0.5,
        z: sf.z,
        yaw: Math.atan2(sf.tx, sf.tz),
      });
    }
    for (let pIdx = 0; pIdx <= 4; pIdx++) {
      const nf = frameAtArc(railArcFrames, (railArcLen * pIdx) / 4);
      if (!nf) continue;
      const yaw = Math.atan2(nf.tx, nf.tz);
      const postT = { x: nf.x, y: nf.y + 0.53, z: nf.z, yaw };
      newelTransforms.push(postT);
      if (pIdx === 0 || pIdx === 2 || pIdx === 4) {
        lanternTransforms.push({
          x: nf.x,
          y: nf.y + 1.15,
          z: nf.z,
          yaw,
        });
      }
    }

    // 2 concrete support piles under outer semicircle
    for (const alpha of [Math.PI * 0.32, Math.PI * 0.68]) {
      const ptOff = -Math.cos(alpha) * (bayRadius * 0.65);
      const prOff = Math.sin(alpha) * (bayRadius * 0.65);
      viewingBays.at(-1).piles = viewingBays.at(-1).piles || [];
      viewingBays.at(-1).piles.push({
        x: f.x + f.tx * ptOff + f.nx * side * (halfW + prOff),
        z: f.z + f.tz * ptOff + f.nz * side * (halfW + prOff),
        y: f.y,
      });
    }

    // Built-in curved ironwood bench facing the main boardwalk inside outer bay arc
    const benchPts = [];
    for (let k = 0; k <= 6; k++) {
      const alpha = Math.PI * (0.3 + 0.4 * (k / 6));
      const btOff = -Math.cos(alpha) * (bayRadius - 0.52);
      const brOff = Math.sin(alpha) * (bayRadius - 0.52);
      benchPts.push({
        x: f.x + f.tx * btOff + f.nx * side * (halfW - 0.08 + brOff),
        z: f.z + f.tz * btOff + f.nz * side * (halfW - 0.08 + brOff),
        y: f.y,
      });
    }
    const benchFrames = buildFrames(benchPts);
    bayBenchParts.push(
      buildExtrudedStrip(
        benchFrames,
        [
          [-0.21, 0.4],
          [-0.21, 0.47],
          [0.21, 0.47],
          [0.21, 0.4],
        ],
        3,
      ),
    );
    for (const ratio of [0.15, 0.5, 0.85]) {
      const bf = frameAtArc(benchFrames, benchFrames.at(-1).s * ratio);
      if (!bf) continue;
      const leg = new THREE.BoxGeometry(0.1, 0.4, 0.36);
      leg.rotateY(Math.atan2(bf.tx, bf.tz));
      leg.translate(bf.x, bf.y + 0.2, bf.z);
      bayBenchParts.push(leg);
    }

    // Flanking bougainvillea planter boxes outside bay shoulders
    for (const sign of [-1, 1]) {
      const sf = frameAtArc(mainFrames, s + sign * (bayRadius + 1.8));
      if (sf) bayPlanterSites.push({ f: sf, side });
    }
  }

  // 4. Main boardwalk railings (skipping lateral bridge openings & viewing bay mouths)
  const isBankOpening = (x, z) =>
    lateralJunctions.some((j) => Math.hypot(x - j.x, z - j.z) < 2.1) ||
    bayMouthOpenings.some((b) => Math.hypot(x - b.x, z - b.z) < b.halfOpening);

  for (const side of [-1, 1]) {
    const rLat = side * (halfW - 0.1);
    let currentRun = [];
    const flushRun = () => {
      if (currentRun.length >= 2) {
        const runFrames = buildFrames(currentRun);
        handrailParts.push(
          buildExtrudedStrip(
            runFrames,
            [
              [-0.075, 0.96],
              [-0.075, 1.035],
              [0.075, 1.035],
              [0.075, 0.96],
            ],
            4,
          ),
          buildExtrudedStrip(
            runFrames,
            [
              [-0.032, 0.45],
              [-0.032, 0.5],
              [0.032, 0.5],
              [0.032, 0.45],
            ],
            4,
          ),
          buildExtrudedStrip(
            runFrames,
            [
              [-0.04, 0.12],
              [-0.04, 0.18],
              [0.04, 0.18],
              [0.04, 0.12],
            ],
            4,
          ),
        );
      }
      currentRun = [];
    };

    for (let s = 0.5; s <= totalMainLen - 0.5; s += 0.22) {
      const f = frameAtArc(mainFrames, s);
      if (!f) continue;
      const rx = f.x + f.nx * rLat;
      const rz = f.z + f.nz * rLat;
      if (isBankOpening(rx, rz)) {
        flushRun();
        continue;
      }
      currentRun.push({ x: rx, z: rz, y: f.y });
      slatTransforms.push({
        x: rx,
        y: f.y + 0.5,
        z: rz,
        yaw: Math.atan2(f.tx, f.tz),
      });
    }
    flushRun();

    let postIdx = 0;
    for (let s = 0.5; s <= totalMainLen - 0.5; s += 2.3) {
      const f = frameAtArc(mainFrames, s);
      if (!f) continue;
      const rx = f.x + f.nx * rLat;
      const rz = f.z + f.nz * rLat;
      if (isBankOpening(rx, rz)) continue;
      const yaw = Math.atan2(f.tx, f.tz);
      newelTransforms.push({
        x: rx,
        y: f.y + 0.53,
        z: rz,
        yaw,
      });
      if (postIdx % 2 === 0) {
        lanternTransforms.push({
          x: rx,
          y: f.y + 1.15,
          z: rz,
          yaw,
        });
      }
      postIdx++;
    }
  }

  // Merge main deck, fascia/beams, benches, and railings
  const deckGeo = mergeGeometries(deckParts);
  deckParts.forEach((g) => g.dispose());
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.receiveShadow = true;
  group.add(deckMesh);

  const beamGeo = mergeGeometries(beamParts);
  beamParts.forEach((g) => g.dispose());
  const beamMesh = new THREE.Mesh(beamGeo, fasciaMat);
  beamMesh.castShadow = true;
  beamMesh.receiveShadow = true;
  group.add(beamMesh);

  if (handrailParts.length) {
    const hrGeo = mergeGeometries(handrailParts);
    handrailParts.forEach((g) => g.dispose());
    const hrMesh = new THREE.Mesh(hrGeo, railMat);
    hrMesh.castShadow = true;
    group.add(hrMesh);
  }

  if (metalRailParts.length) {
    const mrGeo = mergeGeometries(metalRailParts);
    metalRailParts.forEach((g) => g.dispose());
    const mrMesh = new THREE.Mesh(mrGeo, metalRailMat);
    mrMesh.castShadow = true;
    group.add(mrMesh);
  }

  if (bayBenchParts.length) {
    const bbGeo = mergeGeometries(bayBenchParts);
    bayBenchParts.forEach((g) => g.dispose());
    const bbMesh = new THREE.Mesh(bbGeo, railMat);
    bbMesh.castShadow = bbMesh.receiveShadow = true;
    group.add(bbMesh);
  }

  const dummy = new THREE.Object3D();

  // Instanced dense vertical ironwood slats
  if (slatTransforms.length) {
    const slatGeo = new THREE.BoxGeometry(0.052, 0.98, 0.052);
    const slats = new THREE.InstancedMesh(
      slatGeo,
      railMat,
      slatTransforms.length,
    );
    slatTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      slats.setMatrixAt(i, dummy.matrix);
    });
    slats.instanceMatrix.needsUpdate = true;
    slats.computeBoundingSphere();
    group.add(slats);
  }

  // Instanced galvanized steel lateral cross-bridge balusters
  if (metalBalusterTransforms.length) {
    const balGeo = new THREE.BoxGeometry(0.036, 0.96, 0.036);
    const bals = new THREE.InstancedMesh(
      balGeo,
      metalRailMat,
      metalBalusterTransforms.length,
    );
    metalBalusterTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      bals.setMatrixAt(i, dummy.matrix);
    });
    bals.instanceMatrix.needsUpdate = true;
    bals.computeBoundingSphere();
    group.add(bals);
  }

  // Instanced main timber posts + dark bronze caps + warm glowing bollard lights
  if (newelTransforms.length) {
    const postGeo = new THREE.BoxGeometry(0.13, 1.08, 0.13);
    const capGeo = new THREE.BoxGeometry(0.16, 0.04, 0.16);
    const posts = new THREE.InstancedMesh(
      postGeo,
      fasciaMat,
      newelTransforms.length,
    );
    const caps = new THREE.InstancedMesh(
      capGeo,
      bronzeCapMat,
      newelTransforms.length,
    );
    newelTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      posts.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, t.y + 0.55, t.z);
      dummy.updateMatrix();
      caps.setMatrixAt(i, dummy.matrix);
    });
    for (const inst of [posts, caps]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      group.add(inst);
    }
  }

  if (lanternTransforms.length) {
    const globeGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.13, 8);
    const globes = new THREE.InstancedMesh(
      globeGeo,
      lanternMat,
      lanternTransforms.length,
    );
    lanternTransforms.forEach((t, i) => {
      dummy.position.set(t.x, t.y, t.z);
      dummy.rotation.set(0, t.yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      globes.setMatrixAt(i, dummy.matrix);
    });
    globes.instanceMatrix.needsUpdate = true;
    globes.computeBoundingSphere();
    group.add(globes);
  }

  // 5. River concrete/pile piers & cross-beams supporting the boardwalk, viewing bays & cross-bridges
  const mainPierFrames = [];
  for (let s = 4; s <= totalMainLen - 4; s += 6.5) {
    const f = frameAtArc(mainFrames, s);
    if (f) mainPierFrames.push(f);
  }
  const allPierPiles = [];
  const allCrossBeams = [];
  for (const f of mainPierFrames) {
    allCrossBeams.push({ x: f.x, y: f.y - 0.34, z: f.z, yaw: Math.atan2(f.tx, f.tz), scaleX: 1 });
    for (const side of [-1, 1]) {
      allPierPiles.push({
        x: f.x + f.nx * side * 1.45,
        z: f.z + f.nz * side * 1.45,
        h: f.y + 0.35,
      });
    }
  }
  for (const bay of viewingBays) {
    for (const p of bay.piles || []) {
      allPierPiles.push({ x: p.x, z: p.z, h: p.y + 0.35 });
    }
  }
  for (const f of lateralPiers) {
    allCrossBeams.push({ x: f.x, y: f.y - 0.3, z: f.z, yaw: Math.atan2(f.tx, f.tz), scaleX: 0.72 });
    for (const side of [-1, 1]) {
      allPierPiles.push({
        x: f.x + f.nx * side * 1.02,
        z: f.z + f.nz * side * 1.02,
        h: f.y + 0.4,
      });
    }
  }

  if (allPierPiles.length) {
    const pileGeo = new THREE.CylinderGeometry(0.22, 0.24, 1.0, 10);
    const piles = new THREE.InstancedMesh(pileGeo, pierMat, allPierPiles.length);
    allPierPiles.forEach((p, i) => {
      dummy.position.set(p.x, -0.6 + p.h / 2, p.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, p.h, 1);
      dummy.updateMatrix();
      piles.setMatrixAt(i, dummy.matrix);
    });
    piles.instanceMatrix.needsUpdate = true;
    piles.computeBoundingSphere();
    group.add(piles);
  }

  if (allCrossBeams.length) {
    const crossGeo = new THREE.BoxGeometry(4.45, 0.26, 0.3);
    const crosses = new THREE.InstancedMesh(
      crossGeo,
      pierMat,
      allCrossBeams.length,
    );
    allCrossBeams.forEach((b, i) => {
      dummy.position.set(b.x, b.y, b.z);
      dummy.rotation.set(0, b.yaw, 0);
      dummy.scale.set(b.scaleX, 1, 1);
      dummy.updateMatrix();
      crosses.setMatrixAt(i, dummy.matrix);
    });
    crosses.instanceMatrix.needsUpdate = true;
    crosses.computeBoundingSphere();
    group.add(crosses);
  }

  // 6. Outer riverside timber planter boxes with green shrubs & vibrant Bougainvillea blooms (Hoa Giấy)
  const planterFrames = [...bayPlanterSites];
  for (let s = 14; s <= totalMainLen - 14; s += 8.5) {
    const f = frameAtArc(mainFrames, s);
    if (!f) continue;
    if (
      (phuXuanRoad &&
        nearestPoint({ x: f.x, z: f.z }, phuXuanRoad.points).distance < 14) ||
      (truongTienRoad &&
        nearestPoint({ x: f.x, z: f.z }, truongTienRoad.points).distance < 15) ||
      viewingBays.some((b) => Math.hypot(f.x - b.x, f.z - b.z) < b.radius + 3.4)
    ) {
      continue;
    }
    const plusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x + f.nx * 26, z: f.z + f.nz * 26 }, ring),
    );
    const minusInRiver = world.riverRings?.some((ring) =>
      inside({ x: f.x - f.nx * 26, z: f.z - f.nz * 26 }, ring),
    );
    const side =
      plusInRiver && !minusInRiver
        ? 1
        : minusInRiver && !plusInRiver
          ? -1
          : 1;
    planterFrames.push({ f, side });
  }

  if (planterFrames.length) {
    const boxGeo = new THREE.BoxGeometry(0.58, 0.54, 3.4);
    const soilGeo = new THREE.BoxGeometry(0.46, 0.08, 3.25);
    const shrubGeo = new THREE.DodecahedronGeometry(0.34, 0);
    const bloomGeo = new THREE.DodecahedronGeometry(0.24, 0);

    const boxes = new THREE.InstancedMesh(boxGeo, fasciaMat, planterFrames.length);
    const soils = new THREE.InstancedMesh(soilGeo, soilMat, planterFrames.length);
    const shrubs = new THREE.InstancedMesh(
      shrubGeo,
      shrubMat,
      planterFrames.length * 4,
    );
    const blooms = new THREE.InstancedMesh(
      bloomGeo,
      bloomMat,
      planterFrames.length * 5,
    );

    const bloomPalette = [
      new THREE.Color("#d93870"),
      new THREE.Color("#ff6b9d"),
      new THREE.Color("#e84855"),
      new THREE.Color("#f472b6"),
    ];

    let shrubIdx = 0;
    let bloomIdx = 0;
    planterFrames.forEach(({ f, side }, idx) => {
      const yaw = Math.atan2(f.tx, f.tz);
      const px = f.x + f.nx * side * (halfW + 0.26);
      const pz = f.z + f.nz * side * (halfW + 0.26);

      dummy.position.set(px, f.y + 0.17, pz);
      dummy.rotation.set(0, yaw, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      boxes.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(px, f.y + 0.42, pz);
      dummy.updateMatrix();
      soils.setMatrixAt(idx, dummy.matrix);

      for (const offset of [-1.1, -0.36, 0.38, 1.1]) {
        dummy.position.set(
          px + f.tx * offset,
          f.y + 0.58 + (shrubIdx % 3) * 0.04,
          pz + f.tz * offset,
        );
        dummy.rotation.set(0, yaw + shrubIdx * 0.6, 0);
        dummy.scale.set(1.08, 0.78, 1.16);
        dummy.updateMatrix();
        shrubs.setMatrixAt(shrubIdx++, dummy.matrix);
      }

      for (let b = 0; b < 5; b++) {
        const offset = -1.25 + b * 0.62;
        const latJ = (b % 2 === 0 ? 1 : -1) * 0.08;
        dummy.position.set(
          px + f.tx * offset + f.nx * latJ,
          f.y + 0.76 + (b % 3) * 0.06,
          pz + f.tz * offset + f.nz * latJ,
        );
        dummy.rotation.set(0.2 * b, yaw + b * 0.9, 0);
        dummy.scale.set(1.15, 0.85, 1.1);
        dummy.updateMatrix();
        blooms.setMatrixAt(bloomIdx, dummy.matrix);
        blooms.setColorAt?.(
          bloomIdx,
          bloomPalette[(idx + b) % bloomPalette.length],
        );
        bloomIdx++;
      }
    });

    if (blooms.instanceColor) blooms.instanceColor.needsUpdate = true;
    for (const inst of [boxes, soils, shrubs, blooms]) {
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
      group.add(inst);
    }
  }

  // 7. Concrete south-bank retaining quay wall along mapped bank promenade (1167513730) & lateral bridge landings
  const bankRoad = roads.find((r) => r.id === BANK_PROMENADE_ID);
  if (bankRoad && bankRoad.points.length >= 2) {
    const quayPts = [...bankRoad.points];
    for (const id of [1493443035, 1473289702]) {
      const lr = roads.find((r) => r.id === id);
      if (!lr) continue;
      const d0 = nearestPoint(lr.points[0], mainPoints).distance;
      const d1 = nearestPoint(lr.points.at(-1), mainPoints).distance;
      const bankEnd = d0 > d1 ? lr.points[0] : lr.points.at(-1);
      if (quayPts.every((q) => Math.hypot(q.x - bankEnd.x, q.z - bankEnd.z) > 3)) {
        quayPts.push(bankEnd);
      }
    }
    const qFrames = buildFrames(
      quayPts.map((p) => ({ x: p.x, z: p.z, y: 0.36 })),
    );
    const quayGeo = buildExtrudedStrip(
      qFrames,
      [
        [-0.35, 0.04],
        [-0.35, -0.95],
        [2.8, -0.95],
        [2.8, 0.04],
      ],
      8,
    );
    const quayMesh = new THREE.Mesh(quayGeo, concreteWallMat);
    quayMesh.receiveShadow = true;
    group.add(quayMesh);
  }

  const closestOnFrames = (frames, px, pz) => {
    let bestDist = Infinity;
    let bestY = BOARDWALK_Y;
    for (let i = 1; i < frames.length; i++) {
      const a = frames[i - 1];
      const b = frames[i];
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const lenSq = dx * dx + dz * dz;
      const t = lenSq > 1e-8 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / lenSq)) : 0;
      const cx = a.x + dx * t;
      const cz = a.z + dz * t;
      const d = Math.hypot(px - cx, pz - cz);
      if (d < bestDist) {
        bestDist = d;
        bestY = a.y + (b.y - a.y) * t;
      }
    }
    return { dist: bestDist, y: bestY };
  };

  const queryDeck = (x, z) => {
    const mainHit = closestOnFrames(mainFrames, x, z);
    const onMain = mainHit.dist <= halfW + 0.08;
    let onRamp = false;
    let onLateral = false;
    let onBay = false;
    let bayInsideDeck = false;
    let bayInsideSafe = false;
    let bestDeckY = onMain ? mainHit.y + 0.008 : -Infinity;
    let minCenterDist = onMain ? mainHit.dist : Infinity;
    let insideSafeMargin = onMain && mainHit.dist <= halfW - 0.55;

    for (const rf of rampCorridors) {
      const hit = closestOnFrames(rf, x, z);
      if (hit.dist <= halfW + 0.08) {
        onRamp = true;
        bestDeckY = Math.max(bestDeckY, hit.y + 0.007);
        minCenterDist = Math.min(minCenterDist, hit.dist);
        if (hit.dist <= halfW - 0.55) insideSafeMargin = true;
      }
    }

    for (const { frames: lf, halfW: lhw } of lateralCorridors) {
      const hit = closestOnFrames(lf, x, z);
      if (hit.dist <= lhw + 0.08) {
        onLateral = true;
        bestDeckY = Math.max(bestDeckY, hit.y + 0.008);
        minCenterDist = Math.min(minCenterDist, hit.dist);
        if (hit.dist <= lhw - 0.5) insideSafeMargin = true;
      }
    }

    for (const b of viewingBays) {
      const dx = x - b.x;
      const dz = z - b.z;
      const dt = dx * b.tx + dz * b.tz;
      const dn = dx * b.nx * b.side + dz * b.nz * b.side;
      if (dn >= halfW - 0.12) {
        const radial = Math.hypot(dt, Math.max(0, dn - halfW));
        if (radial <= b.radius + 0.08) {
          onBay = true;
          bestDeckY = Math.max(bestDeckY, b.y + 0.008);
          minCenterDist = Math.min(minCenterDist, radial);
          if (radial <= b.radius - 0.18) bayInsideDeck = true;
          if (radial <= b.radius - 0.65) {
            bayInsideSafe = true;
            insideSafeMargin = true;
          }
        }
      }
    }

    const onBoardwalk = onMain || onRamp || onLateral || onBay;
    if (!onBoardwalk) return { onBoardwalk: false };
    const insideDeck =
      (onMain && mainHit.dist <= halfW - 0.14) ||
      (onRamp && minCenterDist <= halfW - 0.14) ||
      (onLateral && minCenterDist <= 1.38) ||
      bayInsideDeck;
    return {
      onBoardwalk: true,
      insideDeck,
      insideSafeMargin: insideSafeMargin || bayInsideSafe,
      onMain,
      onRamp,
      onLateral,
      onBay,
      dist: minCenterDist,
      deckY: bestDeckY,
    };
  };

  // 8. Các bà bán hàng rong dưới chân cầu Tràng Tiền / bờ Cầu Gỗ Lim ("Ăn sáng con ơi")
  const hawkerAnimations = [];
  const hawkerPoints = [];
  const underBridgeHawkers = [
    {
      id: "under-bridge-hawker-west",
      x: 1271.5,
      y: 0.24,
      z: -1255.2,
      style: "ganh",
      shirtColor: "#8b5e42",
      yaw: -2.4,
      title: "Bà bán hàng rong dưới chân cầu",
    },
    {
      id: "under-bridge-hawker-center",
      x: 1278.5,
      y: 0.24,
      z: -1263.8,
      style: "tray",
      shirtColor: "#5a7c6c",
      yaw: -2.35,
      title: "Bà bán hàng rong dưới chân cầu",
    },
    {
      id: "under-bridge-hawker-east",
      x: 1293.5,
      y: 0.24,
      z: -1277.5,
      style: "ganh",
      shirtColor: "#7c6790",
      yaw: -2.25,
      title: "Bà bán hàng rong ven sông",
    },
  ];

  for (const spec of underBridgeHawkers) {
    const hawker = createComNamHawker({
      style: spec.style,
      shirtColor: spec.shirtColor,
      facingYaw: spec.yaw,
    });
    hawker.group.position.set(spec.x, spec.y, spec.z);
    group.add(hawker.group);
    hawkerAnimations.push(...hawker.animated);
    hawkerPoints.push({
      id: spec.id,
      vendorType: "hawker-vendor",
      title: spec.title,
      dialogue: "Ăn sáng con ơi",
      x: spec.x,
      y: spec.y,
      z: spec.z,
      callDistance: 9.5,
      rearmDistance: 15,
    });
  }

  world.scene.add(group);
  world.boardwalkView = {
    group,
    mainPoints,
    halfWidth: halfW,
    pierCount: allPierPiles.length,
    slatCount: slatTransforms.length,
    planterCount: planterFrames.length,
    viewingBayCount: viewingBays.length,
    viewingBays,
    bayMouthOpenings,
    bayRailSegments,
    lateralCount: LATERAL_BRIDGE_IDS.length,
    totalLateralCount: allLateralSpecs.length,
    lateralJunctions,
    vendorPoints: hawkerPoints,
    queryDeck,
    groundAt(x, z, referenceY) {
      if (Number.isFinite(referenceY) && referenceY >= 2.2) return null;
      const q = queryDeck(x, z);
      return q.onBoardwalk ? q.deckY : null;
    },
    update(time) {
      for (const fn of hawkerAnimations) fn(time);
    },
  };
  return world.boardwalkView;
}
