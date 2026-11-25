import * as THREE from "three";
// Keep each person's pose/collider, but render identical body parts together.
export class MobileCrowd {
  constructor(world, traffic) {
    this.world = world;
    this.people = [
      ...world.pedestrianLife.people,
      ...traffic.actors.filter((a) => a.type === "pedestrian"),
    ];
    this.batches = new Map();
    this.parts = new Map();
    for (const person of this.people) {
      const parts = [];
      person.mesh.traverse((o) => {
        if (!o.isMesh || Array.isArray(o.material)) return;
        const key = `${o.geometry.type}/${JSON.stringify(o.geometry.parameters)}/${o.material.color.getHexString()}/${o.material.roughness}/${o.material.metalness}/${o.material.map?.uuid || ""}`;
        if (!this.batches.has(key)) {
          const mesh = new THREE.InstancedMesh(
            o.geometry,
            o.material,
            Math.max(this.people.length * 4, 64),
          );
          mesh.frustumCulled = false;
          world.scene.add(mesh);
          this.batches.set(key, { mesh, count: 0 });
        }
        parts.push({ object: o, batch: this.batches.get(key) });
      });
      this.parts.set(person, parts);
      person.mesh.removeFromParent();
    }
  }
  update(position) {
    for (const batch of this.batches.values()) batch.count = 0;
    let visible = 0;
    for (const person of this.people) {
      if (
        (person.mesh.position.x - position.x) ** 2 +
          (person.mesh.position.z - position.z) ** 2 >
        this.world.quality.crowdDistance ** 2
      )
        continue;
      person.mesh.updateMatrixWorld(true);
      visible++;
      for (const { object, batch } of this.parts.get(person))
        batch.mesh.setMatrixAt(batch.count++, object.matrixWorld);
    }
    for (const batch of this.batches.values()) {
      batch.mesh.count = batch.count;
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
    this.visiblePeople = visible;
  }
}
