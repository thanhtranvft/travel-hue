import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { nearestPoint } from "../geography/geometry.js";
import { ringsOf } from "../geography/map.js";
import config from "../../../modules/areas/quoc-hoc/data/school-gates.json" with { type: "json" };

// Split by arc length, including a gate exactly at a corner of the closed ring.
export function campusWallSegments(points, gate, gap = 10) {
  const ring = points.slice();
  if (Math.hypot(ring[0].x - ring.at(-1).x, ring[0].z - ring.at(-1).z) > 0.01)
    ring.push(ring[0]);
  const distances = [0];
  for (let i = 1; i < ring.length; i++)
    distances.push(
      distances.at(-1) +
        Math.hypot(ring[i].x - ring[i - 1].x, ring[i].z - ring[i - 1].z),
    );
  const total = distances.at(-1),
    hit = nearestPoint(gate, ring),
    center =
      distances[hit.index - 1] +
      hit.t * (distances[hit.index] - distances[hit.index - 1]),
    segments = [];
  for (let i = 1; i < ring.length; i++) {
    const start = distances[i - 1],
      end = distances[i],
      length = end - start;
    if (length < 0.01) continue;
    const cuts = [start, end];
    for (const wrap of [-total, 0, total])
      for (const boundary of [center - gap / 2 + wrap, center + gap / 2 + wrap])
        if (boundary > start && boundary < end) cuts.push(boundary);
    cuts.sort((a, b) => a - b);
    for (let j = 1; j < cuts.length; j++) {
      const mid = (cuts[j - 1] + cuts[j]) / 2,
        d = Math.abs(mid - center);
      if (Math.min(d, total - d) < gap / 2) continue;
      const at = (value) => {
        const t = (value - start) / length;
        return {
          x: ring[i - 1].x + (ring[i].x - ring[i - 1].x) * t,
          z: ring[i - 1].z + (ring[i].z - ring[i - 1].z) * t,
        };
      };
      segments.push({ a: at(cuts[j - 1]), b: at(cuts[j]) });
    }
  }
  return segments;
}
export const hitsCampusWall = (point, segments, radius = 0.45) =>
  segments.some((s) => nearestPoint(point, [s.a, s.b]).distance < radius);
export function createCampusWalls(site, gate) {
  const data = config[site.id];
  if (!data) return null;
  const segments = ringsOf(site.feature).flatMap((ring) =>
      campusWallSegments(ring, gate, data.width),
    ),
    walls = [],
    caps = [];
  const geometry = (a, b, height, width, y) => {
    const dx = b.x - a.x,
      dz = b.z - a.z,
      g = new THREE.BoxGeometry(Math.hypot(dx, dz), height, width);
    g.rotateY(Math.atan2(-dz, dx));
    g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
    return g;
  };
  for (const { a, b } of segments) {
    walls.push(
      geometry(
        a,
        b,
        data.wallHeight,
        data.wallThickness,
        0.17 + data.wallHeight / 2,
      ),
    );
    caps.push(
      geometry(a, b, 0.16, data.wallThickness + 0.14, 0.17 + data.wallHeight),
    );
  }
  const object = new THREE.Group();
  for (const [parts, color] of [
    [walls, data.wallColor || data.color],
    [caps, data.trim],
  ])
    if (parts.length) {
      const mesh = new THREE.Mesh(
        mergeGeometries(parts),
        new THREE.MeshStandardMaterial({ color, roughness: 0.9 }),
      );
      mesh.castShadow = mesh.receiveShadow = true;
      object.add(mesh);
      parts.forEach((p) => p.dispose());
    }
  return {
    object,
    segments: segments.map((s) => ({ ...s, schoolId: site.id })),
  };
}
