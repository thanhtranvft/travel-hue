export const wrapAngle = (angle) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));
export const damp = (from, to, rate, dt) =>
  from + (to - from) * (1 - Math.exp(-rate * dt));

export class BicycleMotion {
  constructor() {
    this.reset();
  }
  reset(heading = 0) {
    this.speed = 0;
    this.steering = 0;
    this.heading = heading;
    this.lean = 0;
    this.distance = 0;
  }
  step(dt, throttle, steer, brake = false) {
    const targetSteering = (steer * 0.55) / (1 + Math.abs(this.speed) * 0.07);
    // Do not retain left lock for several frames after a new right command.
    if (steer * this.steering < 0) this.steering = 0;
    this.steering = damp(this.steering, targetSteering, steer ? 24 : 18, dt);
    let acceleration = throttle * 4.5 - this.speed * 0.32;
    if (throttle * this.speed < 0)
      acceleration = throttle * 7 - this.speed * 0.32;
    if (brake)
      acceleration =
        -Math.sign(this.speed) * Math.min(Math.abs(this.speed) / dt, 8);
    this.speed = Math.max(-2.3, Math.min(9, this.speed + acceleration * dt));
    if (Math.abs(this.speed) < 0.025 && !throttle) this.speed = 0;
    const yawRate = (this.speed * Math.tan(this.steering)) / 1.18;
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
    const distance = this.speed * dt;
    this.distance += Math.abs(distance);
    return {
      dx: Math.sin(this.heading) * distance,
      dz: Math.cos(this.heading) * distance,
    };
  }
}
