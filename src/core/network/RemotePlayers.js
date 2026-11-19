import * as THREE from "three";
import { TouringBike } from "../vehicle/TouringBike.js";
import { setRiderIdentity } from "../vehicle/RiderIdentity.js";
import { disposeOldScene } from "../shared/resources/sceneResources.js";
import { wrapAngle } from "../vehicle/BicycleMotion.js";

export class RemotePlayers {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = "online-players";
    this.entries = new Map();
  }
  sync(players, selfId) {
    const live = new Set();
    for (const player of players) {
      if (player.id === selfId || !player.connected) continue;
      live.add(player.id);
      let entry = this.entries.get(player.id);
      if (!entry) {
        const bike = new TouringBike();
        setRiderIdentity(bike, player.name, player.color, true);
        bike.loadDetailedModel().catch(() => {});
        entry = { bike, target: player, fresh: true, last: performance.now() };
        this.entries.set(player.id, entry);
        this.root.add(bike);
      }
      if (entry.target.region !== player.region) entry.fresh = true;
      entry.target = player;
      entry.last = performance.now();
    }
    for (const [id, entry] of this.entries)
      if (!live.has(id)) {
        entry.bike.disposed = true;
        entry.bike.removeFromParent();
        disposeOldScene(entry.bike, new THREE.Group());
        this.entries.delete(id);
      }
  }
  update(dt, region, position) {
    for (const { bike, target, fresh, last } of this.entries.values()) {
      bike.visible =
        target.ready &&
        target.region === region &&
        performance.now() - last < 2500 &&
        Math.hypot(target.x - position.x, target.z - position.z) < 150;
      if (!bike.visible) continue;
      const entry = this.entries.get(target.id);
      const alpha = 1 - Math.exp(-18 * dt);
      if (
        fresh ||
        Math.hypot(bike.position.x - target.x, bike.position.z - target.z) > 8
      ) {
        bike.position.set(target.x, target.y, target.z);
        bike.motion.heading = target.heading;
        entry.fresh = false;
      } else {
        bike.position.lerp(
          new THREE.Vector3(target.x, target.y, target.z),
          alpha,
        );
        bike.motion.heading +=
          wrapAngle(target.heading - bike.motion.heading) * alpha;
      }
      // Animate without locally integrating a second network position.
      const pose = bike.position.clone();
      const heading = bike.motion.heading;
      bike.motion.speed = target.speed;
      bike.motion.steering = 0;
      bike.update(dt, (target.speed * 0.32) / 4.5, 0, false);
      bike.position.copy(pose);
      bike.motion.heading = heading;
      bike.rotation.y = heading;
      bike.rotation.z = target.lean;
    }
  }
  clear() {
    for (const { bike } of this.entries.values()) bike.disposed = true;
    disposeOldScene(this.root, new THREE.Group());
    this.entries.clear();
  }
}
