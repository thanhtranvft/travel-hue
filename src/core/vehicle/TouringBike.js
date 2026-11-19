import * as THREE from "three";
import { beam } from "../shared/architecture/architecture.js";
import { mat } from "../shared/architecture/shared.js";
import { BicycleMotion } from "./BicycleMotion.js";
import { SharedModelLoader } from "../shared/resources/sceneResources.js";

export class TouringBike extends THREE.Group {
  constructor() {
    super();
    this.motion = new BicycleMotion();
    this.wheels = [];
    this.pedalPhase = 0;
    this.rider = new THREE.Group();
    const rubber = mat("#242a28", 0.85),
      silver = mat("#b5c1ba", 0.28, 0.7),
      fur = mat("#b97c43"),
      cream = mat("#e7c99b");
    const sphere = (parent, r, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), material);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      parent.add(m);
      return m;
    };
    for (const z of [-0.59, 0.59]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 0.43, z);
      this.add(pivot);
      this.wheels.push(pivot);
      const tire = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.045, 10, 40),
        rubber,
      );
      tire.rotation.y = Math.PI / 2;
      pivot.add(tire);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.375, 0.012, 6, 40),
        silver,
      );
      rim.rotation.y = Math.PI / 2;
      pivot.add(rim);
      for (let i = 0; i < 16; i++) {
        const a = (i * Math.PI) / 8;
        pivot.add(
          beam(
            [0, 0, 0],
            [0, Math.sin(a) * 0.37, Math.cos(a) * 0.37],
            0.004,
            "#aebbb7",
          ),
        );
      }
    }
    const joints = [
      [0, 0.43, -0.59],
      [0, 0.46, 0],
      [0, 0.9, -0.12],
      [0, 1, 0.42],
      [0, 0.43, 0.59],
    ];
    for (const [a, b] of [
      [0, 1],
      [0, 2],
      [1, 2],
      [2, 3],
      [1, 3],
      [3, 4],
    ])
      this.add(beam(joints[a], joints[b], 0.028, "#3e887b"));
    this.add(
      beam([0, 1, 0.42], [0, 1.18, 0.42], 0.023, "#9ca9a1"),
      beam([-0.24, 1.18, 0.42], [0.24, 1.18, 0.42], 0.024, "#35453f"),
    );
    const seat = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 8), rubber);
    seat.scale.set(0.8, 0.25, 1.2);
    seat.position.set(0, 0.99, -0.15);
    this.add(seat);
    this.add(
      beam([0, 0.46, -0.05], [0, 0.43, -0.59], 0.009, "#47504b"),
      beam([0, 0.4, -0.06], [0, 0.4, -0.59], 0.009, "#47504b"),
    );
    this.crank = new THREE.Group();
    this.crank.position.set(0, 0.46, 0);
    this.crank.add(beam([-0.18, -0.13, 0], [0.18, 0.13, 0], 0.02, "#c6ccc3"));
    this.add(this.crank);
    this.rider.position.set(0, 0.98, -0.12);
    this.add(this.rider);
    sphere(this.rider, 0.26, fur, 0, 0.25, 0, 0.8, 1.35, 1);
    sphere(this.rider, 0.23, fur, 0, 0.69, 0.12, 1, 1, 1);
    sphere(this.rider, 0.13, cream, 0, 0.61, 0.32, 1, 0.8, 1.3);
    sphere(this.rider, 0.045, rubber, 0, 0.65, 0.45, 1, 0.7, 0.65);
    for (const x of [-0.105, 0.105]) {
      sphere(this.rider, 0.026, rubber, x, 0.75, 0.3);
      sphere(this.rider, 0.011, mat("#f4f0d9"), x - 0.006, 0.758, 0.318);
      sphere(this.rider, 0.12, fur, x * 2, 0.65, 0.08, 0.55, 1.7, 0.8);
    }
    const hat = new THREE.Mesh(
      new THREE.ConeGeometry(0.34, 0.19, 36),
      mat("#c4aa73"),
    );
    hat.position.set(0, 0.94, 0.12);
    this.rider.add(hat);
    const tail = new THREE.Mesh(
      new THREE.TorusGeometry(0.17, 0.055, 8, 16, Math.PI * 1.5),
      fur,
    );
    tail.position.set(0, 0.24, -0.3);
    tail.rotation.y = Math.PI / 2;
    this.rider.add(tail);
    for (const x of [-0.15, 0.15])
      this.rider.add(beam([x, 0.38, 0.08], [x, 0.18, 0.51], 0.055, "#b5804c"));
    this.legs = [];
    for (const x of [-0.15, 0.15]) {
      const leg = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.065, 0.26, 4, 8),
        fur,
      );
      leg.position.set(x, -0.15, 0);
      this.rider.add(leg);
      this.legs.push(leg);
    }
    this.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.fallbackParts = this.children.filter((part) => part !== this.rider);
  }
  async loadDetailedModel() {
    const gltf = await new SharedModelLoader().loadAsync(
      new URL("../../assets/models/priority_gbike_v9.glb", import.meta.url)
        .href,
    );
    if (this.disposed) return;
    const model = gltf.scene.clone(true);
    model.rotation.y = Math.PI;
    model.scale.setScalar(1.0875);
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    this.assetWheels = ["Priority_Wheel_Front_V9", "Priority_Wheel_Rear_V9"]
      .map((name) => model.getObjectByName(name))
      .filter(Boolean);
    this.assetCrank = model.getObjectByName("Priority_Crank_V9");
    for (const part of this.fallbackParts) part.visible = false;
    this.add(model);
    this.rider.position.y = 0.86;
  }
  reset(x, z, heading) {
    this.position.set(x, 0.25, z);
    this.rotation.set(0, heading, 0);
    this.motion.reset(heading);
  }
  update(dt, throttle, steer, brake) {
    const step = this.motion.step(dt, throttle, steer, brake);
    this.position.x += step.dx;
    this.position.z += step.dz;
    this.rotation.y = this.motion.heading;
    this.rotation.z = this.motion.lean;
    this.pedalPhase += this.motion.speed * dt * 2.4;
    for (const w of this.wheels) w.rotation.x += (this.motion.speed * dt) / 0.4;
    for (const w of this.assetWheels || [])
      w.rotation.x -= (this.motion.speed * dt) / 0.363;
    this.crank.rotation.x = this.pedalPhase;
    if (this.assetCrank) this.assetCrank.rotation.x = -this.pedalPhase;
    this.legs.forEach((leg, i) => {
      leg.position.y = -0.15 + Math.sin(this.pedalPhase + i * Math.PI) * 0.09;
      leg.rotation.x = Math.cos(this.pedalPhase + i * Math.PI) * 0.45;
    });
  }
}
