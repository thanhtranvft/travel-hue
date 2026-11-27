import * as THREE from "three";

const _partSize = new THREE.Vector3();
const _geoKeyCache = new WeakMap();

function getGeometryBatchKey(geometry) {
  let cached = _geoKeyCache.get(geometry);
  if (!cached) {
    cached = `${geometry.type}/${JSON.stringify(geometry.parameters)}`;
    _geoKeyCache.set(geometry, cached);
  }
  return cached;
}

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
    const enableShadows = Boolean(world.quality?.shadows);
    const maxPerBatch = Math.max(Math.min(this.people.length * 2, 260), 64);

    for (const person of this.people) {
      const parts = [];
      person.mesh.traverse((o) => {
        if (!o.isMesh || Array.isArray(o.material)) return;
        const key = `${getGeometryBatchKey(o.geometry)}/${o.material.color.getHexString()}/${o.material.roughness}/${o.material.metalness}/${o.material.map?.uuid || ""}`;
        let batch = this.batches.get(key);
        if (!batch) {
          const mesh = new THREE.InstancedMesh(
            o.geometry,
            o.material,
            maxPerBatch,
          );
          mesh.frustumCulled = false;
          mesh.count = 0;
          if (enableShadows && o.castShadow) {
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            o.geometry.boundingBox.getSize(_partSize);
            mesh.castShadow = Math.max(_partSize.x, _partSize.y, _partSize.z) >= 0.14;
          }
          world.scene.add(mesh);
          batch = { mesh, count: 0, capacity: maxPerBatch };
          this.batches.set(key, batch);
        }
        parts.push({ object: o, batch });
      });
      this.parts.set(person, parts);
      person.mesh.removeFromParent();
    }
  }
  update(position) {
    for (const batch of this.batches.values()) batch.count = 0;
    const dist = this.world.quality?.crowdDistance || 140;
    const distSq = dist * dist;
    let visible = 0;
    for (let i = 0; i < this.people.length; i++) {
      const person = this.people[i];
      const dx = person.mesh.position.x - position.x;
      const dz = person.mesh.position.z - position.z;
      if (dx * dx + dz * dz > distSq) continue;
      person.mesh.updateMatrixWorld(true);
      visible++;
      const personParts = this.parts.get(person);
      for (let j = 0; j < personParts.length; j++) {
        const { object, batch } = personParts[j];
        if (batch.count < batch.capacity) {
          batch.mesh.setMatrixAt(batch.count++, object.matrixWorld);
        }
      }
    }
    for (const batch of this.batches.values()) {
      batch.mesh.count = batch.count;
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
    this.visiblePeople = visible;
  }
}
