export function campusWallIndex(segments) {
  const grid = new Map();
  for (const s of segments)
    for (
      let x = Math.floor((Math.min(s.a.x, s.b.x) - 1) / 32);
      x <= Math.floor((Math.max(s.a.x, s.b.x) + 1) / 32);
      x++
    )
      for (
        let z = Math.floor((Math.min(s.a.z, s.b.z) - 1) / 32);
        z <= Math.floor((Math.max(s.a.z, s.b.z) + 1) / 32);
        z++
      ) {
        const key = `${x},${z}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key).push(s);
      }
  return grid;
}
export const nearbyWalls = (grid, x, z) =>
  grid.get(`${Math.floor(x / 32)},${Math.floor(z / 32)}`) || [];
