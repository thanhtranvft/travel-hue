import * as THREE from "three";
import { mat } from "./shared.js";

export function beam(a, b, r = 0.06, color = "#62696a") {
  const start = new THREE.Vector3(...a),
    end = new THREE.Vector3(...b),
    delta = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(r, r, delta.length(), 6),
    mat(color, 0.65, 0.25),
  );
  mesh.position.copy(start.add(end).multiplyScalar(0.5));
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    delta.normalize(),
  );
  mesh.castShadow = true;
  return mesh;
}

// Swept ceramic roof with lifted eaves, ridge and individual tile ribs.
export function tiledRoof(width, depth, y, color = "#b89b43") {
  const group = new THREE.Group(),
    vertices = [],
    indices = [],
    nx = 30,
    nz = 20;
  const height = (x, z) =>
    y +
    1.15 * (1 - (Math.abs(z) * 2) / depth) +
    0.32 * Math.pow((Math.abs(x) * 2) / width, 6) +
    0.26 * Math.pow((Math.abs(z) * 2) / depth, 8);
  for (let i = 0; i <= nx; i++)
    for (let j = 0; j <= nz; j++) {
      const x = (i / nx - 0.5) * width,
        z = (j / nz - 0.5) * depth;
      vertices.push(x, height(x, z), z);
    }
  for (let i = 0; i < nx; i++)
    for (let j = 0; j < nz; j++) {
      const a = i * (nz + 1) + j,
        b = a + nz + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = mat(color);
  material.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  for (let x = -width / 2; x <= width / 2; x += 0.22) {
    const points = [];
    for (let j = 0; j <= 16; j++) {
      const z = (j / 16 - 0.5) * depth;
      points.push(new THREE.Vector3(x, height(x, z) + 0.025, z));
    }
    group.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(points),
          16,
          0.025,
          4,
          false,
        ),
        mat(color),
      ),
    );
  }
  group.add(
    beam([-width / 2, y + 1.2, 0], [width / 2, y + 1.2, 0], 0.09, "#817351"),
  );
  return group;
}
