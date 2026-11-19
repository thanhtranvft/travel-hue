export function hull(points) {
  const sorted = [
      ...new Map(points.map((p) => [`${p.x},${p.z}`, p])).values(),
    ].sort((a, b) => a.x - b.x || a.z - b.z),
    cross = (a, b, c) => (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x),
    half = (list) => {
      const out = [];
      for (const p of list) {
        while (out.length > 1 && cross(out.at(-2), out.at(-1), p) <= 0)
          out.pop();
        out.push(p);
      }
      return out;
    };
  if (sorted.length < 3) return sorted;
  return [
    ...half(sorted).slice(0, -1),
    ...half(sorted.slice().reverse()).slice(0, -1),
  ];
}
// Keep n·p <= limit. This clips inferred lots away from neighboring parcels/roads.
export function clipPolygon(points, nx, nz, limit) {
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length],
      da = nx * a.x + nz * a.z - limit,
      db = nx * b.x + nz * b.z - limit;
    if (da <= 1e-7) out.push(a);
    if ((da < 0 && db > 0) || (da > 0 && db < 0)) {
      const t = da / (da - db);
      out.push({ x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t });
    }
  }
  return out;
}
export function bufferedHull(points, padding) {
  const base = hull(points),
    xs = base.map((p) => p.x),
    zs = base.map((p) => p.z);
  let result = [
    { x: Math.min(...xs) - padding, z: Math.min(...zs) - padding },
    { x: Math.max(...xs) + padding, z: Math.min(...zs) - padding },
    { x: Math.max(...xs) + padding, z: Math.max(...zs) + padding },
    { x: Math.min(...xs) - padding, z: Math.max(...zs) + padding },
  ];
  for (let i = 0; i < base.length; i++) {
    const a = base[i],
      b = base[(i + 1) % base.length],
      nx = b.z - a.z,
      nz = a.x - b.x;
    result = clipPolygon(
      result,
      nx,
      nz,
      nx * a.x + nz * a.z + padding * Math.hypot(nx, nz),
    );
  }
  return result;
}
