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

export function onOtherCarriageway(point, road, roads, margin = 0, ignoreRoadIds = null) {
  return roads.some((other) => {
    if (
      other.id === road.id ||
      isFootway(other) ||
      ignoreRoadIds?.has?.(other.id)
    )
      return false;
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

export function carriagewayClearance(point, roads, ignoreRoadIds = null) {
  if (!roads?.length) return Infinity;
  let minClr = Infinity;
  for (const road of roads) {
    if (isFootway(road) || ignoreRoadIds?.has?.(road.id)) continue;
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

function ringArea2(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p.x * q.z - q.x * p.z;
  }
  return Math.abs(a);
}

export function insetRingClearOfRoads(
  ring,
  roads,
  minClearance = 2.2,
  options = {},
) {
  if (!ring || ring.length < 3 || !roads?.length) return ring;
  const { ignoreRoadIds = null, centerHint = null, sampleStep = 4.0, passes = 6 } =
    options;
  const activeRoads = roads.filter(
    (r) => !isFootway(r) && !ignoreRoadIds?.has?.(r.id),
  );
  if (!activeRoads.length) return ring;

  const wasClosed =
    ring.length > 3 &&
    Math.hypot(ring[0].x - ring.at(-1).x, ring[0].z - ring.at(-1).z) < 0.05;
  const open = (wasClosed ? ring.slice(0, -1) : ring).map((p) => ({
    x: p.x,
    z: p.z,
  }));
  if (open.length < 3) return ring;

  const center =
    centerHint ||
    open.reduce(
      (acc, p) => ({ x: acc.x + p.x / open.length, z: acc.z + p.z / open.length }),
      { x: 0, z: 0 },
    );

  // Subdivide only edges that pass near a carriageway so curved roads trace cleanly
  const work = [];
  for (let i = 0; i < open.length; i++) {
    const a = open[i];
    const b = open[(i + 1) % open.length];
    work.push({ x: a.x, z: a.z });
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    if (
      len > sampleStep &&
      segmentHitsCarriageway(a, b, activeRoads, minClearance + 2.5, 2.0)
    ) {
      const steps = Math.ceil(len / sampleStep);
      for (let k = 1; k < steps; k++) {
        const t = k / steps;
        work.push({
          x: a.x + (b.x - a.x) * t,
          z: a.z + (b.z - a.z) * t,
        });
      }
    }
  }

  const origArea = ringArea2(open);
  for (let pass = 0; pass < passes; pass++) {
    let moved = false;
    for (const p of work) {
      for (const road of activeRoads) {
        const box = roadBox(road);
        const half = roadWidth(road) / 2;
        const targetDist = half + minClearance + 0.06;
        if (
          p.x < box.minX - targetDist ||
          p.x > box.maxX + targetDist ||
          p.z < box.minZ - targetDist ||
          p.z > box.maxZ + targetDist
        ) {
          continue;
        }
        const hit = nearestPoint(p, road.points);
        if (hit.distance >= targetDist) continue;
        const dx = p.x - hit.x;
        const dz = p.z - hit.z;
        const toCenterX = center.x - hit.x;
        const toCenterZ = center.z - hit.z;
        let nx, nz;
        if (hit.distance > 0.12 && dx * toCenterX + dz * toCenterZ >= 0) {
          nx = dx / hit.distance;
          nz = dz / hit.distance;
        } else {
          const hitC = nearestPoint(center, road.points);
          const cdx = center.x - hitC.x;
          const cdz = center.z - hitC.z;
          const clen = Math.hypot(cdx, cdz);
          if (clen > 0.05) {
            nx = cdx / clen;
            nz = cdz / clen;
          } else {
            const pLen = Math.hypot(center.x - p.x, center.z - p.z) || 1;
            nx = (center.x - p.x) / pLen;
            nz = (center.z - p.z) / pLen;
          }
        }
        p.x = hit.x + nx * targetDist;
        p.z = hit.z + nz * targetDist;
        moved = true;
      }
    }
    if (!moved) break;
  }

  // Deduplicate tiny adjacent vertices
  const cleaned = [];
  for (const p of work) {
    const prev = cleaned.at(-1);
    if (!prev || Math.hypot(p.x - prev.x, p.z - prev.z) > 0.25) {
      cleaned.push(p);
    }
  }
  if (
    cleaned.length > 3 &&
    Math.hypot(cleaned[0].x - cleaned.at(-1).x, cleaned[0].z - cleaned.at(-1).z) <
      0.25
  ) {
    cleaned.pop();
  }
  if (cleaned.length < 3 || (origArea > 1 && ringArea2(cleaned) < origArea * 0.25)) {
    return ring;
  }
  if (wasClosed) cleaned.push({ ...cleaned[0] });
  return cleaned;
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

