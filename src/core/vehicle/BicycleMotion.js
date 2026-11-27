export const wrapAngle = (angle) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));
export const damp = (from, to, rate, dt) =>
  from + (to - from) * (1 - Math.exp(-rate * dt));
export const FOOT_MAX_SPEED = 20 / 3.6;

export class BicycleMotion {
  constructor(mode = "bike") {
    this.mode = mode === "foot" ? "foot" : "bike";
    this.reset();
  }
  reset(heading = 0, mode = this.mode) {
    this.mode = mode === "foot" ? "foot" : "bike";
    this.speed = 0;
    this.steering = 0;
    this.heading = heading;
    this.lean = 0;
    this.distance = 0;
    this.runCharge = 0;
    this.resetJump();
    this.stance = this.mode === "bike" ? "bike" : "idle";
  }
  setMode(mode) {
    const next = mode === "foot" ? "foot" : "bike";
    if (next === this.mode) return this.mode;
    this.mode = next;
    this.resetJump();
    this.runCharge = 0;
    if (next === "foot") {
      this.speed = Math.max(-1.8, Math.min(FOOT_MAX_SPEED, this.speed));
      this.lean = 0;
      this.stance =
        Math.abs(this.speed) >= 2.75
          ? "run"
          : Math.abs(this.speed) >= 0.14
            ? "walk"
            : "idle";
    } else {
      this.stance = "bike";
    }
    return this.mode;
  }
  resetJump() {
    this.jumpHeight = 0;
    this.jumpVelocity = 0;
    this.jumpCooldown = 0;
    this.jumpBoostRemaining = 0;
  }
  jump() {
    if(this.mode !== "foot" || !["idle","walk","run"].includes(this.stance) || this.jumpHeight > .01 || this.jumpCooldown > 0)return false;
    this.jumpVelocity = 7.4;
    this.jumpHeight = .001;
    this.jumpCooldown = 1.05;
    this.jumpBoostRemaining = 1;
    this.runCharge = 1;
    if(this.speed > .1)this.speed = Math.max(this.speed,Math.min(FOOT_MAX_SPEED,this.speed+1.6));
    return true;
  }
  step(dt, throttle, steer, brake = false, sprint = false, speedMultiplier = 1) {
    const mult = Number.isFinite(speedMultiplier) && speedMultiplier > 0 ? speedMultiplier : 1;
    if (this.mode === "foot") {
      return this.stepFoot(dt, throttle, steer, brake, sprint, mult);
    }
    const targetSteering = (steer * 0.55) / (1 + Math.abs(this.speed) * 0.07);
    // Do not retain left lock for several frames after a new right command.
    if (steer * this.steering < 0) this.steering = 0;
    this.steering = damp(this.steering, targetSteering, steer ? 24 : 18, dt);
    const maxForward = 9 * mult;
    let acceleration = throttle * 4.5 * Math.max(1, mult * 0.9) - this.speed * 0.32;
    if (throttle * this.speed < 0)
      acceleration = throttle * 7 - this.speed * 0.32;
    if (brake)
      acceleration =
        -Math.sign(this.speed) * Math.min(Math.abs(this.speed) / dt, 8);
    if (this.speed > maxForward && !brake) {
      this.speed = Math.max(maxForward, this.speed - 9 * dt);
    } else {
      this.speed = Math.max(
        -2.3,
        Math.min(maxForward, this.speed + acceleration * dt),
      );
    }
    if (Math.abs(this.speed) < 0.025 && !throttle) this.speed = 0;
    const turnSpeed =
      this.speed >= 0
        ? Math.max(this.speed, throttle > 0.05 ? 2.2 : 0)
        : this.speed;
    const yawRate = (turnSpeed * Math.tan(this.steering)) / 1.18;
    this.heading = wrapAngle(this.heading + yawRate * dt);
    this.lean = damp(
      this.lean,
      Math.max(
        -0.33,
        Math.min(0.33, -Math.atan((this.speed * yawRate) / 9.81) * 0.55),
      ),
      7,
      dt,
    );
    this.stance = "bike";
    const distance = this.speed * dt;
    this.distance += Math.abs(distance);
    return {
      dx: Math.sin(this.heading) * distance,
      dz: Math.cos(this.heading) * distance,
    };
  }
  stepFoot(
    dt,
    throttle,
    steer,
    brake = false,
    sprint = false,
    speedMultiplier = 1,
  ) {
    this.jumpCooldown = Math.max(0,this.jumpCooldown-dt);
    this.jumpBoostRemaining = Math.max(0,this.jumpBoostRemaining-dt);
    if(this.jumpHeight>0){
      this.jumpHeight = Math.max(0,this.jumpHeight+this.jumpVelocity*dt-8*dt*dt);
      this.jumpVelocity -= 16*dt;
      if(this.jumpHeight === 0)this.jumpVelocity=0;
    }
    const mult = Number.isFinite(speedMultiplier) && speedMultiplier > 0 ? speedMultiplier : 1;
    const absThrottle = Math.abs(throttle);
    if (throttle > 0.35 && !brake) {
      const chargeRate = sprint || mult > 1 ? 2.4 : 0.72;
      this.runCharge = Math.min(1, this.runCharge + dt * chargeRate);
    } else {
      this.runCharge = Math.max(0, this.runCharge - dt * 1.9);
    }
    // Walk briskly first (~2.4 m/s), then smoothly transition into running (~5.6 m/s) when holding forward or Shift.
    const runRatio = sprint || this.jumpBoostRemaining > 0
      ? 1
      : Math.max(0, Math.min(1, (this.runCharge - 0.38) / 0.52));
    const maxForward = (2.4 + runRatio * (FOOT_MAX_SPEED-2.4)) * mult;
    let targetSpeed = 0;
    if (!brake && absThrottle > 0.04) {
      targetSpeed =
        throttle >= 0
          ? Math.min(maxForward, throttle * maxForward)
          : Math.max(-1.8, throttle * 1.8);
    }
    const accelRate = brake
      ? 16
      : absThrottle > 0.04
        ? 6.5 * Math.max(1, mult * 0.85)
        : 10.5;
    this.speed = damp(this.speed, targetSpeed, accelRate, dt);
    if (Math.abs(this.speed) < 0.03 && absThrottle <= 0.04) this.speed = 0;

    // On foot: responsive turning even while standing still (turn in place).
    this.steering = damp(this.steering, steer * 0.55, steer ? 18 : 16, dt);
    const turnSpeed = 2.55 - Math.min(0.85, Math.abs(this.speed) * 0.14);
    const reverseSign = this.speed < -0.25 ? -1 : 1;
    this.heading = wrapAngle(
      this.heading + steer * turnSpeed * reverseSign * dt,
    );
    this.lean = damp(
      this.lean,
      Math.max(-0.14, Math.min(0.14, -steer * Math.abs(this.speed) * 0.02)),
      10,
      dt,
    );

    const absSpeed = Math.abs(this.speed);
    this.stance =
      absSpeed >= 2.75 ? "run" : absSpeed >= 0.14 ? "walk" : "idle";

    const distance = this.speed * dt;
    this.distance += Math.abs(distance);
    return {
      dx: Math.sin(this.heading) * distance,
      dz: Math.cos(this.heading) * distance,
    };
  }
}

