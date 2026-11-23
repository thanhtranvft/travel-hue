import * as THREE from "three";
import { BicycleMotion } from "./BicycleMotion.js";
import { cleanAvatarId, cleanStance, DEFAULT_AVATAR_ID } from "../network/protocol.js";
import { disposeOldScene } from "../shared/resources/sceneResources.js";
import { animateChibiActor, buildChibiActor } from "./ChibiCharacters.js";

export class TouringBike extends THREE.Group {
  constructor({ avatar = DEFAULT_AVATAR_ID, mode = "foot" } = {}) {
    super();
    this.motion = new BicycleMotion(mode);
    this.avatarId = cleanAvatarId(avatar);
    this.transportMode = this.motion.mode;
    this.pedalPhase = 0;
    this.walkPhase = 0;
    this.idleTime = 0;
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
    if (this.identityTag) {
      this.identityTag.position.y = this.headTopY + 0.34;
    }
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
    });
    return this.avatarId;
  }
  setBikeColor(color) {
    this.playerColor = color;
    this.rig?.bike?.setColor(color);
  }
  setTransportMode(mode) {
    const next = mode === "bike" ? "bike" : "foot";
    this.transportMode = this.motion.setMode(next);
    animateChibiActor(this.rig, {
      stance: this.motion.stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
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
    });
  }
  update(dt, throttle, steer, brake = false, options = {}) {
    const sprint = Boolean(options?.sprint);
    const step = this.motion.step(dt, throttle, steer, brake, sprint);
    this.position.x += step.dx;
    this.position.z += step.dz;
    this.rotation.y = this.motion.heading;
    this.rotation.z = this.motion.lean;

    const stance = options?.stance
      ? cleanStance(options.stance, this.motion.speed)
      : this.motion.stance;
    this.motion.stance = stance;

    this.idleTime += dt;
    const absSpeed = Math.abs(this.motion.speed);
    this.pedalPhase += this.motion.speed * dt * 3.1;
    if (stance === "walk" || stance === "run") {
      this.walkPhase += Math.max(1.2, absSpeed) * dt * 2.55;
    }

    if (stance === "bike") {
      for (const w of this.wheels) {
        w.rotation.x += (this.motion.speed * dt) / 0.243;
      }
      this.crank.rotation.x = this.pedalPhase;
    }

    animateChibiActor(this.rig, {
      stance,
      speed: this.motion.speed,
      phase: this.walkPhase,
      idleTime: this.idleTime,
      pedalPhase: this.pedalPhase,
      steer: this.motion.steering,
    });
  }
}

