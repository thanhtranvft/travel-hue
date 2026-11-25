import * as THREE from "three";
import { TouringBike } from "../vehicle/TouringBike.js";
import { setRiderIdentity } from "../vehicle/RiderIdentity.js";
import { disposeOldScene } from "../shared/resources/sceneResources.js";
import { wrapAngle } from "../vehicle/BicycleMotion.js";
import { cleanAvatarId, cleanBoatIndex, cleanStance } from "./protocol.js";
import { SpeedAuraEffect } from "../world/CharmSceneFX.js";

export class RemotePlayers {
  constructor({ mobile = false } = {}) {
    this.mobile = mobile;
    this.root = new THREE.Group();
    this.root.name = "online-players";
    this.entries = new Map();
    this._targetPos = new THREE.Vector3();
  }
  sync(players, selfId) {
    if (!Array.isArray(players)) return;
    const live = new Set();
    for (const player of players) {
      if (!player || player.id === selfId || !player.connected) continue;
      live.add(player.id);
      const avatarId = cleanAvatarId(player.avatar);
      let entry = this.entries.get(player.id);
      if (!entry) {
        const bike = new TouringBike({ avatar: avatarId, mode: "foot" });
        setRiderIdentity(bike, player.name, player.color, true);
        if (!this.mobile) bike.loadDetailedModel().catch(() => {});
        const aura = new SpeedAuraEffect();
        aura.attachTo(bike);
        entry = { bike, aura, target: player, fresh: true, last: performance.now() };
        this.entries.set(player.id, entry);
        this.root.add(bike);
      } else if (entry.bike.avatarId !== avatarId) {
        entry.bike.setAvatar(avatarId);
      }
      if (entry.target.region !== player.region) entry.fresh = true;
      entry.target = player;
      entry.last = performance.now();
    }
    for (const [id, entry] of this.entries)
      if (!live.has(id)) {
        entry.aura?.dispose?.();
        entry.bike.disposed = true;
        entry.bike.removeFromParent();
        disposeOldScene(entry.bike, new THREE.Group());
        this.entries.delete(id);
      }
  }
  update(dt, region, position, elapsed = performance.now() * 0.001) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    const hasPos =
      position &&
      Number.isFinite(position.x) &&
      Number.isFinite(position.z);
    for (const entry of this.entries.values()) {
      const { bike, target, fresh, last } = entry;
      const validPose =
        target &&
        Number.isFinite(target.x) &&
        Number.isFinite(target.y) &&
        Number.isFinite(target.z) &&
        Number.isFinite(target.heading);
      bike.visible =
        Boolean(target?.ready) &&
        validPose &&
        hasPos &&
        target.region === region &&
        performance.now() - last < 2500 &&
        Math.hypot(target.x - position.x, target.z - position.z) <
          (target.stance === "boat" ? 220 : 150);
      if (!bike.visible) continue;
      const alpha = 1 - Math.exp(-18 * dt);
      if (
        fresh ||
        !Number.isFinite(bike.position.x) ||
        !Number.isFinite(bike.position.z) ||
        Math.hypot(bike.position.x - target.x, bike.position.z - target.z) > 8
      ) {
        bike.position.set(target.x, target.y, target.z);
        bike.motion.heading = target.heading;
        entry.fresh = false;
      } else {
        this._targetPos.set(target.x, target.y, target.z);
        bike.position.lerp(this._targetPos, alpha);
        bike.motion.heading +=
          wrapAngle(target.heading - bike.motion.heading) * alpha;
      }
      // Animate without locally integrating a second network position.
      const poseX = bike.position.x,
        poseY = bike.position.y,
        poseZ = bike.position.z;
      const heading = bike.motion.heading;
      const speed = Number.isFinite(target.speed) ? target.speed : 0;
      const lean = Number.isFinite(target.lean) ? target.lean : 0;
      const stance = cleanStance(target.stance, speed);
      const boatIndex = cleanBoatIndex(target.boatIndex, stance);
      bike.motion.speed = speed;
      bike.motion.steering = 0;
      if (stance === "boat") bike.setBoat?.(boatIndex);
      bike.update(dt, 0, 0, false, { stance, boatIndex, poseOnly: true });
      bike.position.set(poseX, poseY, poseZ);
      bike.motion.heading = heading;
      bike.rotation.y = heading;
      bike.rotation.z = lean;
      const boosted = (target.boostMultiplier || 1) > 1;
      entry.aura?.update(elapsed, {
        active: boosted,
        tierId: target.boostTier || "10",
        speed,
      });
    }
  }
  clear() {
    for (const { bike, aura } of this.entries.values()) {
      aura?.dispose?.();
      bike.disposed = true;
    }
    disposeOldScene(this.root, new THREE.Group());
    this.entries.clear();
  }
}
