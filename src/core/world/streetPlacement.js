import { nearestPoint } from "../shared/geography/geometry.js";
import { roadWidth, isFootway } from "./roadProfile.js";
export function roadsidePoint(a, b, distance, offset, direction = 1) {
  const length = Math.hypot(b.x - a.x, b.z - a.z) || 1,
    dx = (b.x - a.x) / length,
    dz = (b.z - a.z) / length;
  return {
    x: a.x + dx * distance - dz * offset * direction,
    z: a.z + dz * distance + dx * offset * direction,
  };
}
const bounds = new WeakMap();

function roadBox(road) {
  let box = bounds.get(road);
  if (!box) {
    box = {
      minX: Math.min(...road.points.map((p) => p.x)),
      maxX: Math.max(...road.points.map((p) => p.x)),
      minZ: Math.min(...road.points.map((p) => p.z)),
      maxZ: Math.max(...road.points.map((p) => p.z)),
    };
    bounds.set(road, box);
  }
  return box;
}

export function onOtherCarriageway(point, road, roads, margin = 0) {
  return roads.some((other) => {
    if (other.id === road.id || isFootway(other)) return false;
    const box = roadBox(other);
    const radius = roadWidth(other) / 2 + margin;
    if (
      point.x < box.minX - radius ||
      point.x > box.maxX + radius ||
      point.z < box.minZ - radius ||
      point.z > box.maxZ + radius
    )
      return false;
    return nearestPoint(point, other.points).distance < radius;
  });
}

export function carriagewayClearance(point, roads) {
  if (!roads?.length) return Infinity;
  let minClr = Infinity;
  for (const road of roads) {
    if (isFootway(road)) continue;
    const box = roadBox(road);
    const half = roadWidth(road) / 2;
    const reach = half + Math.max(0, minClr);
    if (
      point.x < box.minX - reach ||
      point.x > box.maxX + reach ||
      point.z < box.minZ - reach ||
      point.z > box.maxZ + reach
    ) {
      continue;
    }
    const clr = nearestPoint(point, road.points).distance - half;
    if (clr < minClr) minClr = clr;
  }
  return minClr;
}

export function segmentHitsCarriageway(a, b, roads, margin = 0.65, step = 1.0) {
  if (!roads?.length) return false;
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  const count = Math.max(2, Math.ceil(len / step));
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    const pt = { x: a.x + dx * t, z: a.z + dz * t };
    if (onOtherCarriageway(pt, { id: null }, roads, margin)) {
      return true;
    }
  }
  return false;
}

export function filterSegmentsClearOfRoads(
  segments,
  roads,
  margin = 0.65,
  sampleStep = 0.5,
  minSpanLength = 0.35,
) {
  if (!roads?.length) return segments;
  const dummyRoad = { id: null };
  const result = [];
  for (const seg of segments) {
    const { a, b, ...rest } = seg;
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    if (len < minSpanLength) continue;
    const steps = Math.max(2, Math.ceil(len / sampleStep));
    const at = (t) => ({ x: a.x + dx * t, z: a.z + dz * t });
    const safeSample = new Array(steps + 1);
    for (let i = 0; i <= steps; i++) {
      safeSample[i] = !onOtherCarriageway(at(i / steps), dummyRoad, roads, margin);
    }
    let startIdx = null;
    for (let i = 0; i < steps; i++) {
      const intervalSafe = safeSample[i] && safeSample[i + 1];
      if (intervalSafe && startIdx === null) {
        startIdx = i;
      } else if (!intervalSafe && startIdx !== null) {
        const spanLen = ((i - startIdx) / steps) * len;
        if (spanLen >= minSpanLength) {
          result.push({ ...rest, a: at(startIdx / steps), b: at(i / steps) });
        }
        startIdx = null;
      }
    }
    if (startIdx !== null) {
      const spanLen = ((steps - startIdx) / steps) * len;
      if (spanLen >= minSpanLength) {
        result.push({ ...rest, a: at(startIdx / steps), b: at(1) });
      }
    }
  }
  return result;
}

