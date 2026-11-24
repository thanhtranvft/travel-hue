import { isFootway } from "./roadProfile.js";
export const ROAD_Y = 0.32;
export const FOOTWAY_Y = 0.12;
export const SIDEWALK_Y = 0.16;
const BOARDWALK_IDS = new Set([1167513732, 1167513733, 683633953]);
export const BOARDWALK_Y = 0.68;
export const TRUONG_TIEN_ID = 174759688;
export const TRUONG_TIEN_SIDEWALK_IDS = new Set([1167997494, 1493443040]);
export const TRUONG_TIEN_CAMBER = 4.45;
export const TRUONG_TIEN_WALK_LIFT = 0.08;

export function truongTienElevation(t) {
  const u = Math.max(0, Math.min(1, t));
  if (u <= 0 || u >= 1) return ROAD_Y;
  const arch = 1 - Math.pow(1 - Math.sin(Math.PI * u), 3.2);
  return ROAD_Y + TRUONG_TIEN_CAMBER * arch;
}

export function truongTienProgress(road, x, z) {
  const pts = road?.points;
  if (!pts?.length) return 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const lenSq = dx * dx + dz * dz || 1;
  return Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / lenSq));
}

export function truongTienHeightAtPoint(road, x, z) {
  return truongTienElevation(truongTienProgress(road, x, z));
}

export function roadSurfaceHeight(road, index) {
  const base = isFootway(road) ? FOOTWAY_Y : ROAD_Y;
  // Phu Xuan is above the layer-1 riverside boardwalk. OSM vertex spacing
  // must not turn its long first segment into a ramp at river level.
  if (road.tags.name === "Cầu Phú Xuân") {
    if (road.tags.bridge === "yes") return 4.8;
    let total = 0,
      distance = 0;
    for (let i = 1; i < road.points.length; i++) {
      const d = Math.hypot(
        road.points[i].x - road.points[i - 1].x,
        road.points[i].z - road.points[i - 1].z,
      );
      total += d;
      if (i <= index) distance += d;
    }
    const t = distance / (total || 1);
    return ROAD_Y + (4.8 - ROAD_Y) * (1 - t);
  }
  if (BOARDWALK_IDS.has(road.id)) return BOARDWALK_Y;
  if (road.id === TRUONG_TIEN_ID) {
    const t = index / Math.max(1, road.points.length - 1);
    return truongTienElevation(t);
  }
  if (TRUONG_TIEN_SIDEWALK_IDS.has(road.id)) {
    const t = index / Math.max(1, road.points.length - 1);
    return truongTienElevation(t) + TRUONG_TIEN_WALK_LIFT;
  }
  if (isFootway(road) && road.tags.layer === "2") return 4.8;
  if (road.tags.bridge === "yes" || road.tags.layer === "2") {
    const t = index / Math.max(1, road.points.length - 1);
    return base + Math.sin(Math.PI * t) * (isFootway(road) ? 0.5 : 4);
  }
  return base;
}
