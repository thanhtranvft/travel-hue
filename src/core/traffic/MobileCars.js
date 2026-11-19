import * as THREE from "three";
import { loadSharedModel } from "../shared/resources/sceneResources.js";
export async function loadMobileCars(traffic) {
  const gltf = await loadSharedModel(
      new URL("../../assets/models/waymo_gen6_v4.glb", import.meta.url).href,
    ),
    bounds = new THREE.Box3().setFromObject(gltf.scene),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3()),
    scale = 4.2 / size.z,
    pools = [];
  for (let i = 0; i < 3; i++) {
    const root = new THREE.Group(),
      model = gltf.scene.clone(true),
      meshes = [];
    model.scale.setScalar(scale);
    model.position.set(
      -center.x * scale,
      -bounds.min.y * scale,
      -center.z * scale,
    );
    model.traverse((o) => {
      if (o.isMesh) meshes.push(o);
    });
    root.add(model);
    traffic.scene.add(root);
    pools.push({ root, meshes });
  }
  traffic.mobileCars = {
    update(position) {
      const ordered = traffic.actors
          .filter((a) => a.type === "car")
          .map((actor) => ({
            actor,
            d:
              (actor.mesh.position.x - position.x) ** 2 +
              (actor.mesh.position.z - position.z) ** 2,
          }))
          .sort((a, b) => a.d - b.d),
        selected = ordered.filter((p) => p.d < 70 ** 2).slice(0, pools.length);
      for (const actor of traffic.actors) {
        if (actor.type === "pedestrian") continue;
        actor.mesh.visible =
          (actor.mesh.position.x - position.x) ** 2 +
            (actor.mesh.position.z - position.z) ** 2 <
          180 ** 2;
        actor.cameraMeshes = [];
      }
      pools.forEach((pool, i) => {
        const actor = selected[i]?.actor;
        pool.root.visible = !!actor;
        if (!actor) return;
        actor.mesh.visible = false;
        pool.root.position.copy(actor.mesh.position);
        pool.root.rotation.y = actor.heading;
        pool.root.updateMatrixWorld(true);
        actor.cameraMeshes = pool.meshes;
      });
    },
  };
  const [x, z] = traffic.world.region.path[0];
  traffic.mobileCars.update({ x, z });
}
