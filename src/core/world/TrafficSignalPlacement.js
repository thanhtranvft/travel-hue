import { nearestPoint } from "../shared/geography/geometry.js";
import { isFootway, roadWidth } from "./roadProfile.js";
import { onOtherCarriageway } from "./streetPlacement.js";

export function placeTrafficSignal(signal, roads) {
  const candidates = roads.filter((r) => r.tags.name && !isFootway(r));
  const nearest = candidates
    .map((road) => ({ road, hit: nearestPoint(signal, road.points) }))
    .sort((a, b) => a.hit.distance - b.hit.distance)[0];
  if (!nearest) return [];
  const { road, hit } = nearest,
    directions =
      road.tags.oneway === "yes"
        ? [1]
        : road.tags.oneway === "-1"
          ? [-1]
          : [1, -1],
    placements = [];
  for (const direction of directions) {
    let selected;
    for (const setback of [10, 16, 24, 32, 42]) {
      if (selected) break;
      const approach = nearestPoint(
          {
            x: hit.x - Math.sin(hit.heading) * setback * direction,
            z: hit.z - Math.cos(hit.heading) * setback * direction,
          },
          road.points,
        ),
        heading = approach.heading + (direction < 0 ? Math.PI : 0);
      for (const extra of [1.5, 2.5, 4]) {
        const offset = roadWidth(road) / 2 + extra,
          point = {
            x: approach.x - Math.cos(heading) * offset,
            z: approach.z + Math.sin(heading) * offset,
          };
        if (onOtherCarriageway(point, { id: null }, roads, 1)) continue;
        selected = {
          ...point,
          heading,
          roadId: road.id,
          roadName: road.tags.name,
          direction,
          osm: signal.osm,
          sourcePosition: { x: signal.x, z: signal.z },
        };
        break;
      }
    }
    if (selected) placements.push(selected);
  }
  return placements;
}
