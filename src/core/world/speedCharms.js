export const CHARM_TIER_LIST = [
  {
    id: "10",
    percent: 10,
    multiplier: 1.1,
    count: 14,
    durationMs: 6000,
    label: "+10%",
    title: "Bùa Gió Nhẹ",
    color: "#2ee59d",
    glow: "#108f5a",
    accent: "#a8ffd8",
    keyHint: "1",
  },
  {
    id: "20",
    percent: 20,
    multiplier: 1.2,
    count: 8,
    durationMs: 6000,
    label: "+20%",
    title: "Bùa Lướt Gió",
    color: "#38d9ff",
    glow: "#12759e",
    accent: "#b8f3ff",
    keyHint: "2",
  },
  {
    id: "30",
    percent: 30,
    multiplier: 1.3,
    count: 4,
    durationMs: 6000,
    label: "+30%",
    title: "Bùa Tia Chớp",
    color: "#b86bff",
    glow: "#6322b5",
    accent: "#ead1ff",
    keyHint: "3",
  },
  {
    id: "100",
    percent: 100,
    multiplier: 2.0,
    count: 2,
    durationMs: 5500,
    label: "+100%",
    title: "Bùa Siêu Tốc",
    color: "#ffb838",
    glow: "#c94912",
    accent: "#fff0b3",
    keyHint: "4",
  },
];

export const CHARM_TIERS = Object.fromEntries(
  CHARM_TIER_LIST.map((t) => [t.id, t]),
);

export const MAX_BOOST_MULTIPLIER = 2.0;
export const CHARM_REFRESH_MIN_MS = 25000;
export const CHARM_REFRESH_MAX_MS = 35000;
export const CHARM_PICKUP_RADIUS = 2.6;

export function cleanCharmTier(value) {
  const key = String(value ?? "");
  return Object.hasOwn(CHARM_TIERS, key) ? key : null;
}

export function randomCharmRefreshMs(rng = Math.random) {
  return Math.round(
    CHARM_REFRESH_MIN_MS + rng() * (CHARM_REFRESH_MAX_MS - CHARM_REFRESH_MIN_MS),
  );
}

export function emptyCharmInventory() {
  return { 10: 0, 20: 0, 30: 0, 100: 0 };
}

export function sanitizeCharmInventory(raw) {
  const out = emptyCharmInventory();
  if (!raw || typeof raw !== "object") return out;
  for (const tier of CHARM_TIER_LIST) {
    const n = Number(raw[tier.id]);
    out[tier.id] = Number.isFinite(n) && n > 0 ? Math.min(99, Math.floor(n)) : 0;
  }
  return out;
}

function readXZ(pt) {
  if (Array.isArray(pt) && pt.length >= 2) {
    const x = Number(pt[0]);
    const z = Number(pt[1]);
    return Number.isFinite(x) && Number.isFinite(z) ? [x, z] : null;
  }
  if (pt && typeof pt === "object") {
    const x = Number(pt.x);
    const z = Number(pt.z);
    return Number.isFinite(x) && Number.isFinite(z) ? [x, z] : null;
  }
  return null;
}

function collectCandidateAnchors(region, extraRoads = []) {
  const anchors = [];
  const pushSegment = (ax, az, bx, bz, halfWidth = 4.5) => {
    const len = Math.hypot(bx - ax, bz - az);
    if (!(len > 1)) return;
    const steps = Math.max(1, Math.floor(len / 14));
    const nx = -(bz - az) / len;
    const nz = (bx - ax) / len;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      anchors.push({
        x: ax + (bx - ax) * t,
        z: az + (bz - az) * t,
        nx,
        nz,
        halfWidth,
      });
    }
  };

  if (Array.isArray(region?.path)) {
    for (let i = 1; i < region.path.length; i++) {
      const a = readXZ(region.path[i - 1]);
      const b = readXZ(region.path[i]);
      if (a && b) pushSegment(a[0], a[1], b[0], b[1], 5.2);
    }
  }

  for (const road of extraRoads || []) {
    const pts = road?.points;
    if (!Array.isArray(pts) || pts.length < 2) continue;
    for (let i = 1; i < pts.length; i++) {
      const a = readXZ(pts[i - 1]);
      const b = readXZ(pts[i]);
      if (a && b) pushSegment(a[0], a[1], b[0], b[1], 4);
    }
  }

  for (const ext of region?.extensions || []) {
    if (!Array.isArray(ext) || ext.length < 3) continue;
    const pts = ext.map(readXZ).filter(Boolean);
    if (pts.length < 3) continue;
    let cx = 0;
    let cz = 0;
    for (const [px, pz] of pts) {
      cx += px;
      cz += pz;
    }
    cx /= pts.length;
    cz /= pts.length;
    anchors.push({ x: cx, z: cz, nx: 1, nz: 0, halfWidth: 8 });
    for (const [px, pz] of pts) {
      pushSegment(cx, cz, px, pz, 4);
    }
  }

  return anchors;
}

export function generateRegionCharms(
  region,
  {
    idPrefix = "charm",
    extraRoads = [],
    canPlace = () => true,
    groundAt = () => 0.25,
    rng = Math.random,
    minSpacing = 11,
  } = {},
) {
  const anchors = collectCandidateAnchors(region, extraRoads);
  if (!anchors.length) return [];

  const spawned = [];
  let seq = 0;

  // Spawn rarest items first or shuffle candidate points per tier so tiers mix naturally across the map.
  const tiers = [...CHARM_TIER_LIST].reverse();
  for (const tier of tiers) {
    let placed = 0;
    let attempts = 0;
    const maxAttempts = tier.count * 28;
    while (placed < tier.count && attempts < maxAttempts) {
      attempts++;
      const anchor = anchors[Math.floor(rng() * anchors.length)];
      const lateral = (rng() * 2 - 1) * anchor.halfWidth;
      const jitterAlong = (rng() * 2 - 1) * 5;
      const tx = -anchor.nz;
      const tz = anchor.nx;
      const x = Number((anchor.x + anchor.nx * lateral + tx * jitterAlong).toFixed(2));
      const z = Number((anchor.z + anchor.nz * lateral + tz * jitterAlong).toFixed(2));
      if (!Number.isFinite(x) || !Number.isFinite(z)) continue;
      if (!canPlace(x, z)) continue;
      const spacing = attempts > maxAttempts * 0.65 ? minSpacing * 0.5 : minSpacing;
      if (spawned.some((other) => Math.hypot(other.x - x, other.z - z) < spacing)) {
        continue;
      }
      const y = Number(groundAt(x, z)) || 0.25;
      spawned.push({
        id: `${idPrefix}-${tier.id}-${++seq}`,
        tier: tier.id,
        percent: tier.percent,
        multiplier: tier.multiplier,
        x,
        y,
        z,
      });
      placed++;
    }
  }

  return spawned;
}
