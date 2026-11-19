import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { loadSharedModel } from "../shared/resources/sceneResources.js";

export async function loadMobileTrees(world) {
  const gltf = await loadSharedModel(
      new URL("../../assets/models/trees_v4.glb", import.meta.url).href,
    ),
    template = gltf.scene.getObjectByName("Tree_CoastLiveOak_V4");
  gltf.scene.updateMatrixWorld(true);
  const inverse = template.matrixWorld.clone().invert(),
    probe = template.clone(true);
  probe.position.set(0, 0, 0);
  probe.rotation.set(0, 0, 0);
  probe.scale.setScalar(1);
  probe.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(probe),
    height = bounds.max.y - bounds.min.y,
    center = bounds.getCenter(new THREE.Vector3()),
    parts = [],
    capacity = 24;
  template.traverse((o) => {
    if (!o.isMesh) return;
    const mesh = new THREE.InstancedMesh(o.geometry, o.material, capacity);
    mesh.frustumCulled = false;
    world.scene.add(mesh);
    parts.push({ mesh, local: inverse.clone().multiply(o.matrixWorld) });
  });
  const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.2, 2, 5);
  trunkGeometry.translate(0, 1, 0);
  const crowns = [];
  for (const [x, y, z, r] of [
    [0, 2.8, 0, 1.2],
    [0.7, 2.7, 0.3, 0.9],
    [-0.6, 2.5, -0.3, 0.9],
  ]) {
    const geometry = new THREE.SphereGeometry(r, 7, 5);
    geometry.translate(x, y, z);
    crowns.push(geometry);
  }
  const crownGeometry = mergeGeometries(crowns);
  crowns.forEach((g) => g.dispose());
  const farTrunks = new THREE.InstancedMesh(
      trunkGeometry,
      new THREE.MeshStandardMaterial({ color: "#806c51" }),
      world.treePositions.length,
    ),
    farCrowns = new THREE.InstancedMesh(
      crownGeometry,
      new THREE.MeshStandardMaterial({ color: "#64844b" }),
      world.treePositions.length,
    );
  farTrunks.frustumCulled = farCrowns.frustumCulled = false;
  world.scene.add(farTrunks, farCrowns);
  let last = { x: Infinity, z: Infinity };
  const dummy = new THREE.Object3D(),
    matrix = new THREE.Matrix4();
  world.mobileTrees = {
    update(position) {
      if (Math.hypot(position.x - last.x, position.z - last.z) < 8) return;
      last = { x: position.x, z: position.z };
      const ordered = world.treePositions
          .map((p, i) => ({
            p,
            i,
            d: (p.x - position.x) ** 2 + (p.z - position.z) ** 2,
          }))
          .filter((p) => p.d < 320 ** 2)
          .sort((a, b) => a.d - b.d),
        near = ordered.filter((p) => p.d < 85 ** 2).slice(0, capacity),
        nearIds = new Set(near.map((p) => p.i));
      for (const [j, { p, i }] of near.entries()) {
        const scale = (i % 5 === 0 ? 3 : 6 + (i % 6)) / height;
        dummy.position.set(
          p.x - center.x * scale,
          -bounds.min.y * scale,
          p.z - center.z * scale,
        );
        dummy.rotation.set(0, i * 2.4, 0);
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        for (const part of parts) {
          matrix.multiplyMatrices(dummy.matrix, part.local);
          part.mesh.setMatrixAt(j, matrix);
        }
      }
      for (const part of parts) {
        part.mesh.count = near.length;
        part.mesh.instanceMatrix.needsUpdate = true;
      }
      let count = 0;
      for (const { p, i } of ordered) {
        if (nearIds.has(i)) continue;
        dummy.position.set(p.x, 0, p.z);
        dummy.rotation.set(0, i * 2.4, 0);
        dummy.scale.setScalar((i % 5 === 0 ? 3 : 6 + (i % 6)) / 4);
        dummy.updateMatrix();
        farTrunks.setMatrixAt(count, dummy.matrix);
        farCrowns.setMatrixAt(count, dummy.matrix);
        count++;
      }
      farTrunks.count = farCrowns.count = count;
      farTrunks.instanceMatrix.needsUpdate =
        farCrowns.instanceMatrix.needsUpdate = true;
    },
  };
  const [x, z] = world.region.path[0];
  world.mobileTrees.update({ x, z });
}
