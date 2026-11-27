import * as THREE from "three";
import { BicycleMotion } from "./BicycleMotion.js";
import {
  cleanAvatarId,
  cleanBoatIndex,
  cleanStance,
  DEFAULT_AVATAR_ID,
} from "../network/protocol.js";
import { disposeOldScene } from "../shared/resources/sceneResources.js";
import { animateChibiActor, buildChibiActor } from "./ChibiCharacters.js";
import {
  createPedalBoat,
  PEDAL_BOAT_SPECS,
} from "../../modules/areas/quoc-hoc/view/FountainPark.js";
import { createDragonCruiseBoat } from "../world/DragonBoatBuilder.js";

export class TouringBike extends THREE.Group {
  constructor({ avatar = DEFAULT_AVATAR_ID, mode = "foot" } = {}) {
    super();
    this.motion = new BicycleMotion(mode);
    this.avatarId = cleanAvatarId(avatar);
    this.transportMode = this.motion.mode;
    this.pedalPhase = 0;
    this.walkPhase = 0;
    this.idleTime = 0;
    this.boatIndex = -1;
    this.boatHull = null;
    this.boatHullIndex = -1;
    this.cruiseBoat = null;
    this.activityStance = null;
    this.fishState = null;
    this.rider = new THREE.Group();
    this.rider.name = "chibi-rider-anchor";
    this.add(this.rider);

    this.rig = null;
    this.wheels = [];
    this.crank = new THREE.Group();
    this.legs = [];
    this.headTopY = 1.46;
    this.playerColor = null;

    this.setAvatar(this.avatarId);
  }
  get stance() {
    return this.motion.stance;
  }
  ensureBoatHull(boatIndex) {
    const idx = cleanBoatIndex(boatIndex, "boat");
    const safeIdx = idx >= 0 ? idx : 0;
    if (!this.boatHull || this.boatHullIndex !== safeIdx) {
      if (this.boatHull) {
        this.boatHull.removeFromParent();
        disposeOldScene(this.boatHull, new THREE.Group());
      }
      const spec = PEDAL_BOAT_SPECS[safeIdx] || PEDAL_BOAT_SPECS[0];
      this.boatHull = createPedalBoat(0, 0, 0, 0, spec.color);
      this.boatHullIndex = safeIdx;
      this.add(this.boatHull);
    }
    return this.boatHull;
  }
  ensureCruiseBoat() {
    if (!this.cruiseBoat) {
      this.cruiseBoat = createDragonCruiseBoat();
      this.cruiseBoat.group.visible = false;
      this.add(this.cruiseBoat.group);
    }
    return this.cruiseBoat;
  }
  syncCruiseSeatTransform(active) {
    if (!this.rig?.actor) return;
    if (active && this.cruiseBoat?.playerSeatOffset) {
      const seat = this.cruiseBoat.playerSeatOffset;
      this.rig.actor.position.set(seat.x, seat.y, seat.z);
      this.rig.actor.rotation.y = seat.yaw || 0;
      if (this.identityTag) {
        this.identityTag.position.set(seat.x, seat.y + this.headTopY + 0.34, seat.z);
      }
    } else {
      this.rig.actor.position.set(0, 0, 0);
      this.rig.actor.rotation.y = 0;
      if (this.identityTag) {
        this.identityTag.position.set(0, this.headTopY + 0.34, 0);
      }
    }
  }
  setBoat(boatIndex) {
    const next = cleanBoatIndex(boatIndex, "boat");
    this.boatIndex = next;
    if (this.activityStance === "boat" || this.motion.stance === "boat") {
      const hull = this.ensureBoatHull(next);
      hull.visible = true;
    }
    return this.boatIndex;
  }
  setActivityStance(stance, options = {}) {
    if (stance === "fish" || stance === "boat" || stance === "cruise") {
      this.activityStance = stance;
      this.motion.stance = stance;
      this.fishState = options.fishState ?? this.fishState;
      if (stance === "boat") {
        const idx = cleanBoatIndex(
          options.boatIndex ?? (this.boatIndex >= 0 ? this.boatIndex : 0),
          "boat",
        );
        this.boatIndex = idx >= 0 ? idx : 0;
        const hull = this.ensureBoatHull(this.boatIndex);
        hull.visible = true;
        if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
        this.syncCruiseSeatTransform(false);
      } else if (stance === "cruise") {
        this.boatIndex = -1;
        if (this.boatHull) this.boatHull.visible = false;
        const cruise = this.ensureCruiseBoat();
        cruise.group.visible = true;
        cruise.update(this.idleTime);
        this.syncCruiseSeatTransform(true);
      } else {
        this.boatIndex = -1;
        if (this.boatHull) this.boatHull.visible = false;
        if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
        this.syncCruiseSeatTransform(false);
      }
    } else {
      this.activityStance = null;
      this.boatIndex = -1;
      this.fishState = null;
      if (this.boatHull) this.boatHull.visible = false;
      if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
      this.syncCruiseSeatTransform(false);
      this.motion.speed = 0;
      this.motion.lean = 0;
      this.motion.stance = this.transportMode === "bike" ? "bike" : "idle";
    }
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
      fishState: this.fishState,
    });
    return this.motion.stance;
  }
  setAvatar(avatarId) {
    const nextId = cleanAvatarId(avatarId);
    if (this.rig && this.avatarId === nextId) return this.avatarId;
    if (this.rig) {
      this.rig.actor.removeFromParent();
      disposeOldScene(this.rig.actor, new THREE.Group());
    }
    this.avatarId = nextId;
    this.rig = buildChibiActor(nextId);
    if (this.playerColor) this.rig.bike.setColor(this.playerColor);
    this.add(this.rig.actor);
    this.wheels = this.rig.wheels;
    this.crank = this.rig.crank;
    this.headTopY = this.rig.headTopY;
    this.syncCruiseSeatTransform(this.motion.stance === "cruise");
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
      fishState: this.fishState,
    });
    return this.avatarId;
  }
  setBikeColor(color) {
    this.playerColor = color;
    this.rig?.bike?.setColor(color);
  }
  setTransportMode(mode) {
    const next = mode === "bike" ? "bike" : "foot";
    this.activityStance = null;
    this.boatIndex = -1;
    if (this.boatHull) this.boatHull.visible = false;
    if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
    this.syncCruiseSeatTransform(false);
    this.transportMode = this.motion.setMode(next);
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
      fishState: null,
    });
    return this.transportMode;
  }
  toggleTransportMode() {
    return this.setTransportMode(this.transportMode === "bike" ? "foot" : "bike");
  }
  async loadDetailedModel() {
    return Promise.resolve();
  }
  reset(x, z, heading) {
    this.position.set(x, 0, z);
    this.rotation.set(0, heading, 0);
    this.activityStance = null;
    this.boatIndex = -1;
    this.fishState = null;
    if (this.boatHull) this.boatHull.visible = false;
    if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
    this.syncCruiseSeatTransform(false);
    this.motion.reset(heading, this.transportMode);
    this.pedalPhase = 0;
    this.walkPhase = 0;
    this.idleTime = 0;
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: 0,
      phase: 0,
      idleTime: 0,
      pedalPhase: 0,
      steer: 0,
      fishState: null,
    });
  }
  update(dt, throttle, steer, brake = false, options = {}) {
    const sprint = Boolean(options?.sprint);
    const speedMultiplier = Number.isFinite(options?.speedMultiplier)
      ? options.speedMultiplier
      : 1;
    const forcedStance = options?.stance
      ? cleanStance(options.stance, this.motion.speed)
      : this.activityStance;

    if (
      options?.poseOnly ||
      forcedStance === "fish" ||
      forcedStance === "boat" ||
      forcedStance === "cruise"
    ) {
      if (forcedStance) {
        this.motion.stance = forcedStance;
      } else {
        this.motion.stance = cleanStance(options?.stance, this.motion.speed);
      }
      if (this.motion.stance === "boat") {
        const bIdx = cleanBoatIndex(
          options?.boatIndex ?? (this.boatIndex >= 0 ? this.boatIndex : 0),
          "boat",
        );
        this.boatIndex = bIdx >= 0 ? bIdx : 0;
        const hull = this.ensureBoatHull(this.boatIndex);
        hull.visible = true;
        if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
        this.syncCruiseSeatTransform(false);
      } else if (this.motion.stance === "cruise") {
        this.boatIndex = -1;
        if (this.boatHull) this.boatHull.visible = false;
        const cruise = this.ensureCruiseBoat();
        cruise.group.visible = true;
        this.syncCruiseSeatTransform(true);
      } else {
        if (this.boatHull) this.boatHull.visible = false;
        if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
        this.syncCruiseSeatTransform(false);
      }
    } else {
      if (this.boatHull) this.boatHull.visible = false;
      if (this.cruiseBoat) this.cruiseBoat.group.visible = false;
      this.syncCruiseSeatTransform(false);
      const step = this.motion.step(dt, throttle, steer, brake, sprint, speedMultiplier);
      this.position.x += step.dx;
      this.position.z += step.dz;
      this.rotation.y = this.motion.heading;
      this.rotation.z = this.motion.lean;
    }

    const stance = forcedStance || this.motion.stance;
    this.motion.stance = stance;

    this.idleTime += dt;
    const absSpeed = Math.abs(this.motion.speed);
    this.pedalPhase += (stance === "boat" ? Math.max(0.8, this.motion.speed) : this.motion.speed) * dt * 3.1;
    if (stance === "walk" || stance === "run") {
      this.walkPhase += Math.max(1.2, absSpeed) * dt * 2.55;
    }

    if (stance === "bike") {
      for (const w of this.wheels) {
        w.rotation.x += (this.motion.speed * dt) / 0.243;
      }
      this.crank.rotation.x = this.pedalPhase;
    }

    if (stance === "cruise" && this.cruiseBoat) {
      this.cruiseBoat.update(this.idleTime);
    }

    animateChibiActor(this.rig, {
      stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
      fishState: options?.fishState ?? this.fishState,
    });
  }
}
