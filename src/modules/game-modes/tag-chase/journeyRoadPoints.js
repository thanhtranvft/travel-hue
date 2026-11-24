// Densely sample existing road geometry; do not invent routes or move landmarks.
export function journeyRoadPoints(room, regionId) {
  const sampler = room.createRoadSampler(regionId);
  if (!sampler) return [];
  const paths = sampler.areaRoads.length
    ? sampler.areaRoads.map((road) => road.points)
    : [sampler.area.region.path];
  const points = [];
  const seen = new Set();
  for (const path of paths) {
    for (let i = 1; i < (path?.length || 0); i++) {
      const point = (p) => (Array.isArray(p) ? { x: p[0], z: p[1] } : p);
      const a = point(path[i - 1]),
        b = point(path[i]);
      const steps = Math.max(
        1,
        Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 8),
      );
      for (let j = 0; j <= steps; j++) {
        const x = a.x + ((b.x - a.x) * j) / steps,
          z = a.z + ((b.z - a.z) * j) / steps;
        const key = `${Math.round(x / 4)},${Math.round(z / 4)}`;
        if (seen.has(key) || !sampler.canPlace(x, z)) continue;
        seen.add(key);
        points.push({ x, z, y: sampler.groundAt(x, z) });
      }
    }
  }
  return points;
}
