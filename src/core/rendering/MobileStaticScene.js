import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Batch only fixed, untextured standard meshes. Characters, rides, cars and
// water keep their own transforms/materials and continue updating normally.
export function optimizeMobileStaticScene(world) {
  const excluded = new Set([
      ...(world.pedestrianLife?.people.map((p) => p.mesh) || []),
      ...(world.youthPlayground?.equipment.map((e) => e.group) || []),
      ...(world.propertyEnclosures?.parking?.cars || []),
      ...(world.truongTienBridge?.animatedObjects || []),
      ...(world.fireflyPark?.animatedObjects || []),
      ...(world.fountainPark?.animatedObjects || []),
      ...(world.quocHocCampus?.animatedObjects || []),
      ...(world.haiBaTrungCampus?.animatedObjects || []),
      ...(world.nguyenChiDieuCampus?.animatedObjects || []),
      ...(world.caoThangCampus?.animatedObjects || []),
      ...(world.quangTrungCampus?.animatedObjects || []),
      ...(world.vincomPlaza?.animatedObjects || []),
    ]),
    batches = new Map(),
    loose = [],
    oldObstacles = new Set(world.cameraObstacles),
    remainingObstacles = world.cameraObstacles.slice();
  world.scene.updateMatrixWorld(true);
  const collect = (object, dynamic = false) => {
    if (!object.visible) return;
    dynamic ||= excluded.has(object);
    if (dynamic) return;
    const material = object.material;
    if (
      object.isMesh &&
      !object.isInstancedMesh &&
      material?.isMeshStandardMaterial &&
      !material.map &&
      !material.transparent &&
      !material.vertexColors &&
      !material.flatShading &&
      !(material.emissive && material.emissive.getHex() !== 0) &&
      !object.geometry?.attributes?.color &&
      !material.onBeforeCompile.toString().includes("landscapeTime") &&
      !material.isMeshPhysicalMaterial
    ) {
      const position = object.geometry.attributes.position,
        index = object.geometry.index,
        normal = object.geometry.attributes.normal;
      if (!position || !normal) return;
      const key = `${material.color.getHexString()}/${material.roughness}/${material.metalness}/${material.side}`,
        matrix = object.matrixWorld.clone(),
        normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);
      let source = object.geometry;
      // Transform the geometry once; triangles are then assigned to 64 m tiles.
      object.geometry.computeBoundingBox();
      const size = object.geometry.boundingBox.getSize(new THREE.Vector3());
      if (position.count < 10 && Math.max(size.x, size.z) > 200) return;
      source = source.clone().applyMatrix4(matrix);
      const p = source.attributes.position,
        idx = source.index,
        total = idx ? idx.count : p.count;
      for (let i = 0; i < total; i += 3) {
        const ids = [0, 1, 2].map((j) => (idx ? idx.getX(i + j) : i + j)),
          x = ids.reduce((n, k) => n + p.getX(k), 0) / 3,
          z = ids.reduce((n, k) => n + p.getZ(k), 0) / 3,
          tile = `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
          batchKey = `${tile}/${key}`;
        if (!batches.has(batchKey))
          batches.set(batchKey, {
            tile,
            material,
            positions: [],
            normals: [],
            obstacle: false,
          });
        const batch = batches.get(batchKey);
        batch.obstacle ||= oldObstacles.has(object);
        for (const k of ids) {
          batch.positions.push(p.getX(k), p.getY(k), p.getZ(k));
          batch.normals.push(
            source.attributes.normal.getX(k),
            source.attributes.normal.getY(k),
            source.attributes.normal.getZ(k),
          );
        }
      }
      source.dispose();
      object.removeFromParent();
      if (oldObstacles.has(object)) {
        const idx = remainingObstacles.indexOf(object);
        if (idx !== -1) remainingObstacles.splice(idx, 1);
      }
      return;
    }
    for (const child of [...object.children]) collect(child, dynamic);
  };
  // Keep traversal separate from insertion so generated batches aren't reprocessed.
  for (const root of [...world.scene.children]) collect(root);
  world.mobileStaticTiles = [];
  for (const batch of batches.values()) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(batch.positions, 3),
    );
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(batch.normals, 3),
    );
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, batch.material);
    world.scene.add(mesh);
    world.mobileStaticTiles.push({ mesh, sphere: geometry.boundingSphere });
    if (batch.obstacle) remainingObstacles.push(mesh);
  }
  world.cameraObstacles = remainingObstacles;
  // Textured buildings and boards retain their UVs; broad merged building meshes
  // remain camera blockers. Nearby blockers are filtered before raycasting.
  world.mobileStaticStats = { batches: batches.size };
}
export function updateMobileStaticScene(world, position) {
  const distance = world.quality.staticDistance;
  for (const { mesh, sphere } of world.mobileStaticTiles || []) {
    const dx = sphere.center.x - position.x,
      dz = sphere.center.z - position.z;
    mesh.visible = dx * dx + dz * dz < (distance + sphere.radius) ** 2;
  }
}
