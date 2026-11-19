import { nearestPoint } from "../shared/geography/geometry.js";
import { roadWidth, isFootway } from "./roadProfile.js";
import { onOtherCarriageway } from "./streetPlacement.js";
export function buildingFrontage(center, roads) {
  const candidates = roads
    .filter((r) => r.tags.name && !isFootway(r))
    .map((road) => ({ road, hit: nearestPoint(center, road.points) }))
    .filter((c) => c.hit.distance < 135)
    .sort((a, b) => a.hit.distance - b.hit.distance);
  for (const { road, hit } of candidates) {
    const dx = Math.sin(hit.heading),
      dz = Math.cos(hit.heading),
      side = (center.x - hit.x) * -dz + (center.z - hit.z) * dx >= 0 ? 1 : -1;
    for (const shift of [0, -6, 6, -12, 12, -20, 20]) {
      const anchor = nearestPoint(
          { x: hit.x + dx * shift, z: hit.z + dz * shift },
          road.points,
        ),
        nx = -Math.cos(anchor.heading) * side,
        nz = Math.sin(anchor.heading) * side,
        offset = roadWidth(road) / 2 + 2.8,
        point = { x: anchor.x + nx * offset, z: anchor.z + nz * offset };
      if (onOtherCarriageway(point, { id: null }, roads, 1)) continue;
      return { ...point, heading: Math.atan2(-nx, -nz), roadId: road.id };
    }
  }
  return null;
}
