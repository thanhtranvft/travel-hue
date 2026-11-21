import { isFootway } from "./roadProfile.js";
export const ROAD_Y = 0.32;
export const FOOTWAY_Y = 0.12;
export const SIDEWALK_Y = 0.16;
const BOARDWALK_IDS = new Set([1167513732, 1167513733, 683633953]);
export const BOARDWALK_Y = 0.68;
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
  if (isFootway(road) && road.tags.layer === "2") return 4.8;
  if (road.tags.bridge === "yes" || road.tags.layer === "2") {
    const t = index / Math.max(1, road.points.length - 1);
    return base + Math.sin(Math.PI * t) * (isFootway(road) ? 0.5 : 4);
  }
  return base;
}
