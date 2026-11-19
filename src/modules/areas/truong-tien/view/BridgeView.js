import * as THREE from "three";
import { beam } from "../../../../core/shared/architecture/architecture.js";
export function addTruongTienBridge(world, road) {
  if (!road) return;
  const curve = new THREE.CurvePath();
  for (let i = 1; i < road.points.length; i++)
    curve.add(
      new THREE.LineCurve3(
        new THREE.Vector3(road.points[i - 1].x, 0, road.points[i - 1].z),
        new THREE.Vector3(road.points[i].x, 0, road.points[i].z),
      ),
    );
  for (let span = 0; span < 6; span++)
    for (const side of [-1, 1])
      for (let j = 0; j < 12; j++) {
        const t = (span + j / 12) / 6,
          u = (span + (j + 1) / 12) / 6,
          p = curve.getPointAt(t),
          q = curve.getPointAt(u),
          tangent = curve.getTangentAt(t),
          nx = -tangent.z * 6.2 * side,
          nz = tangent.x * 6.2 * side,
          y =
            world.groundAt(p.x, p.z) + 0.4 + 6.5 * Math.sin((j / 12) * Math.PI),
          yy =
            world.groundAt(q.x, q.z) +
            0.4 +
            6.5 * Math.sin(((j + 1) / 12) * Math.PI);
        world.scene.add(
          beam([p.x + nx, y, p.z + nz], [q.x + nx, yy, q.z + nz], 0.16),
          beam(
            [p.x + nx, world.groundAt(p.x, p.z), p.z + nz],
            [p.x + nx, y, p.z + nz],
            0.09,
          ),
        );
      }
}
