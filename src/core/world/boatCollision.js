// Oriented hulls shared by local navigation and the online server.
export function boatHull(pose, halfLength = 8.4, halfWidth = 2.4) {
  const tx = pose.tx ?? Math.sin(pose.heading || 0);
  const tz = pose.tz ?? Math.cos(pose.heading || 0);
  const length = Math.hypot(tx, tz) || 1;
  return { ...pose, tx: tx / length, tz: tz / length, halfLength, halfWidth };
}

export function boatHullsOverlap(a, b, padding = 0.8) {
  const dx = b.x - a.x,
    dz = b.z - a.z;
  const al = (a.halfLength ?? 8.4) + padding / 2;
  const aw = (a.halfWidth ?? 2.4) + padding / 2;
  const bl = (b.halfLength ?? 8.4) + padding / 2;
  const bw = (b.halfWidth ?? 2.4) + padding / 2;
  if (Math.hypot(dx, dz) > Math.hypot(al, aw) + Math.hypot(bl, bw))
    return false;
  for (const [x, z] of [
    [a.tx, a.tz],
    [-a.tz, a.tx],
    [b.tx, b.tz],
    [-b.tz, b.tx],
  ]) {
    const ra =
      al * Math.abs(a.tx * x + a.tz * z) + aw * Math.abs(-a.tz * x + a.tx * z);
    const rb =
      bl * Math.abs(b.tx * x + b.tz * z) + bw * Math.abs(-b.tz * x + b.tx * z);
    if (Math.abs(dx * x + dz * z) > ra + rb) return false;
  }
  return true;
}
