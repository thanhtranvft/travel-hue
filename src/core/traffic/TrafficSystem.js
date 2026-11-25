import * as THREE from "three";
import { box, mat } from "../shared/architecture/shared.js";
import { makePerson, makeSocietyPerson, animateWalker } from "../world/People.js";
import { CITY, BRIDGE } from "../world/cityLayout.js";
import { sweptContact } from "./collision.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { loadSharedModel } from "../shared/resources/sceneResources.js";

export function car(color) {
  const g = new THREE.Group();
  g.add(box([1.8, 0.65, 3.8], color, [0, 0.8, 0]));
  const cabin = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.7, 1.1, 4, 12),
    mat(color, 0.3, 0.3),
  );
  cabin.rotation.x = Math.PI / 2;
  cabin.scale.set(1, 0.8, 0.8);
  cabin.position.set(0, 1.16, -0.1);
  g.add(cabin);
  g.add(
    box([1.45, 0.65, 1.55], "#506d78", [0, 1.27, -0.08]),
    box([1.65, 0.08, 1.6], color, [0, 1.64, -0.1]),
  );
  for (const x of [-0.9, 0.9])
    for (const z of [-1.15, 1.15]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.16, 16),
        mat("#242a28"),
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.42, z);
      g.add(wheel);
    }
  for (const x of [-0.6, 0.6]) {
    g.add(
      box([0.38, 0.18, 0.06], "#fff0bf", [x, 0.87, 1.93]),
      box([0.38, 0.18, 0.06], "#a73f32", [x, 0.87, -1.93]),
    );
  }
  g.add(box([1.55, 0.12, 0.12], "#919b95", [0, 0.55, 1.97]));
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return g;
}
export function scooter(colorOrOptions = "#65878a") {
  const opts =
    typeof colorOrOptions === "string"
      ? { color: colorOrOptions }
      : colorOrOptions || {};
  const color = opts.color || "#65878a";
  const variant = opts.variant || "tay-ga";
  const g = new THREE.Group();
  g.name = `motorbike-${variant}`;

  // Step-through chassis, front apron, side fairings, seat & grab rail
  g.add(
    box([0.48, 0.14, 0.92], "#2a2f33", [0, 0.34, 0.04]), // floorboard
    box([0.52, 0.44, 0.88], color, [0, 0.66, -0.26]), // rear body fairing
    box([0.46, 0.78, 0.2], color, [0, 0.82, 0.48]), // front apron
    box([0.36, 0.24, 0.28], color, [0, 1.24, 0.44]), // headlight cowl
    box([0.46, 0.15, 0.76], "#2a2826", [0, 0.93, -0.22]), // sculpted leather seat
    box([0.44, 0.05, 0.18], "#bcc4c9", [0, 0.92, -0.68]), // silver rear grab rail
    // Headlight & amber turn signals
    box([0.18, 0.12, 0.06], "#fff6c8", [0, 1.24, 0.59]),
    box([0.07, 0.08, 0.05], "#f09d2c", [-0.17, 1.18, 0.56]),
    box([0.07, 0.08, 0.05], "#f09d2c", [0.17, 1.18, 0.56]),
    // Rear taillight & Huế 75 license plate
    box([0.2, 0.1, 0.05], "#cf2c2c", [0, 0.78, -0.71]),
    box([0.2, 0.14, 0.03], "#f2f4f6", [0, 0.58, -0.71]),
    // Chrome exhaust muffler on right side
    box([0.1, 0.13, 0.68], "#8e969c", [0.28, 0.34, -0.28]),
    // Front telescopic fork & fender
    box([0.14, 0.56, 0.14], "#525a60", [0, 0.58, 0.56]),
    box([0.18, 0.09, 0.32], color, [0, 0.55, 0.62]),
    // Handlebars & twin rearview mirrors
    box([0.78, 0.055, 0.08], "#343b3e", [0, 1.32, 0.41]),
    box([0.03, 0.16, 0.03], "#4a5258", [-0.3, 1.41, 0.41]),
    box([0.03, 0.16, 0.03], "#4a5258", [0.3, 1.41, 0.41]),
    box([0.13, 0.08, 0.03], "#242a2e", [-0.33, 1.5, 0.4]),
    box([0.13, 0.08, 0.03], "#242a2e", [0.33, 1.5, 0.4]),
  );

  for (const z of [-0.58, 0.62]) {
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.24, 0.068, 8, 16),
      mat("#222729"),
    );
    tire.rotation.y = Math.PI / 2;
    tire.position.set(0, 0.3, z);
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12),
      mat("#b8c0c6", 0.35, 0.65),
    );
    hub.rotation.z = Math.PI / 2;
    hub.position.set(0, 0.3, z);
    g.add(tire, hub);
  }

  if (variant === "shipper") {
    // Rear insulated delivery box (Vietnamese shipper style)
    g.add(
      box([0.48, 0.42, 0.46], opts.boxColor || "#228b54", [0, 1.18, -0.48]),
      box([0.5, 0.06, 0.48], "#f2f4f6", [0, 1.36, -0.48]),
    );
  }

  const rider = makePerson({
    role: opts.riderRole === "woman" ? "woman" : "man",
    shirt: opts.riderShirt || (opts.riderRole === "woman" ? "#df96a8" : "#56798f"),
    pants: opts.riderPants || "#2a323b",
    hairStyle: opts.riderRole === "woman" ? "ponytail" : "short",
    hat: "helmet",
    helmetColor: opts.helmetColor || (opts.riderRole === "woman" ? "#f2d6df" : "#e6d8ad"),
    seated: true,
  });
  rider.position.set(0, 0.35, -0.02);
  rider.scale.multiplyScalar(0.86);
  for (const arm of rider.userData.limbs.arms) {
    arm.rotation.x = -0.88;
  }
  g.add(rider);

  if (opts.hasPassenger && variant !== "shipper") {
    const pRole = opts.passengerRole || "woman";
    const passenger = makePerson({
      role: pRole,
      shirt: opts.passengerShirt || (pRole === "boy" ? "#f0b643" : pRole === "girl" ? "#f5d0d8" : "#6ca898"),
      pants: "#2d3540",
      hat: "helmet",
      helmetColor: opts.passengerHelmet || "#cde4ee",
      seated: true,
    });
    passenger.position.set(0, 0.36, -0.45);
    passenger.scale.multiplyScalar(0.84);
    for (const arm of passenger.userData.limbs.arms) {
      arm.rotation.x = -0.42;
    }
    g.add(passenger);
  }

  return g;
}

export class TrafficSystem {
  constructor(scene, world) {
    this.scene = scene;
    this.world = world;
    this.actors = [];
    this.time = 0;
    this.enabled = true;
    for (const side of [-1, 1])
      for (const direction of [-1, 1])
        for (let i = 0; i < 3; i++) {
          const type = i === 1 ? "scooter" : "car",
            mesh =
              type === "car"
                ? car(["#d8d3bb", "#688b83", "#a75e4f"][i])
                : scooter("#8f6d4d");
          this.add(
            type,
            mesh,
            {
              x: -115 + i * 70 + (side > 0 ? 12 : 0),
              z: side * CITY.roadCenter + direction * 3.5,
            },
            (direction * Math.PI) / 2,
            type === "car" ? 5.5 : 6.7,
            "x",
            direction,
          );
        }
    for (const direction of [-1, 1])
      this.add(
        "car",
        car("#a6b5af"),
        { x: BRIDGE.x - direction * 3.5, z: direction > 0 ? -40 : 40 },
        direction > 0 ? 0 : Math.PI,
        4.2,
        "z",
        direction,
      );
    for (let i = 0; i < 20; i++) {
      const side = i % 2 ? 1 : -1,
        z = side * (i % 3 === 0 ? CITY.promenade : CITY.sidewalk),
        direction = i % 4 < 2 ? 1 : -1;
      this.add(
        "pedestrian",
        makeSocietyPerson(i),
        { x: -115 + i * 12, z },
        (direction * Math.PI) / 2,
        0.7 + (i % 3) * 0.15,
        "x",
        direction,
      );
    }
  }
  add(type, mesh, position, heading, speed, axis, direction) {
    mesh.position.set(
      position.x,
      this.world.groundAt(position.x, position.z),
      position.z,
    );
    mesh.rotation.y = heading;
    this.scene.add(mesh);
    this.actors.push({
      type,
      mesh,
      heading,
      baseSpeed: speed,
      speed,
      axis,
      direction,
      radius: type === "car" ? 1.65 : type === "scooter" ? 0.65 : 0.35,
      previous: { ...position },
      pause: 0,
    });
  }
  step(dt, bike) {
    if (!this.enabled) return;
    this.time += dt;
    for (const actor of this.actors) {
      const p = actor.mesh.position;
      actor.previous = { x: p.x, z: p.z };
      let speed = actor.baseSpeed;
      if (actor.pause > 0) {
        actor.pause -= dt;
        speed = 0;
      }
      if (actor.type !== "pedestrian") {
        const forward =
            (actor.axis === "x"
              ? bike.position.x - p.x
              : bike.position.z - p.z) * actor.direction,
          lateral = Math.abs(
            actor.axis === "x" ? bike.position.z - p.z : bike.position.x - p.x,
          ),
          sameDirection = Math.cos(bike.motion.heading - actor.heading) > 0.5;
        if (sameDirection && forward > 0 && forward < 10 && lateral < 1.8)
          speed =
            forward < 4 ? 0 : Math.min(speed, Math.max(0, bike.motion.speed));
        for (const other of this.actors) {
          if (
            other === actor ||
            other.type === "pedestrian" ||
            other.axis !== actor.axis ||
            other.direction !== actor.direction
          )
            continue;
          const gap =
              (other.mesh.position[actor.axis] - p[actor.axis]) *
              actor.direction,
            lane = Math.abs(
              actor.axis === "x"
                ? other.mesh.position.z - p.z
                : other.mesh.position.x - p.x,
            );
          if (gap > 0 && gap < 5 && lane < 1.5) speed = 0;
        }
      }
      actor.speed = speed;
      p[actor.axis] += speed * actor.direction * dt;
      const limit = actor.axis === "x" ? 135 : 42;
      if (Math.abs(p[actor.axis]) > limit) {
        p[actor.axis] = -Math.sign(p[actor.axis]) * limit;
        actor.previous = { x: p.x, z: p.z };
      }
      p.y = this.world.groundAt(p.x, p.z);
      if (actor.type === "pedestrian")
        animateWalker(actor.mesh, this.time * 4 + this.actors.indexOf(actor));
    }
  }
  contact(oldPosition, bike) {
    if (!this.enabled) return null;
    for (const actor of this.actors) {
      if (Math.abs(actor.mesh.position.y - bike.position.y) > 1) continue;
      if (
        sweptContact(
          oldPosition,
          bike.position,
          actor.previous,
          actor.mesh.position,
          actor.radius + 0.45,
        )
      )
        return actor;
    }
    return null;
  }
  async loadDetailedCars() {
    const gltf = await loadSharedModel(
        new URL("../../assets/models/waymo_gen6_v4.glb", import.meta.url).href,
      ),
      bounds = new THREE.Box3().setFromObject(gltf.scene),
      size = bounds.getSize(new THREE.Vector3()),
      center = bounds.getCenter(new THREE.Vector3()),
      scale = 4.2 / size.z;
    for (const actor of this.actors.filter((a) => a.type === "car")) {
      for (const child of actor.mesh.children) child.visible = false;
      const wrapper = new THREE.Group(),
        model = gltf.scene.clone(true);
      model.scale.setScalar(scale);
      model.position.set(
        -center.x * scale,
        -bounds.min.y * scale,
        -center.z * scale,
      );
      wrapper.add(model);
      actor.cameraMeshes = [];
      wrapper.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          actor.cameraMeshes.push(o);
        }
      });
      actor.mesh.add(wrapper);
    }
  }
  cameraObstacles(position) {
    return this.actors
      .filter(
        (a) =>
          a.type === "car" && a.mesh.position.distanceToSquared(position) < 144,
      )
      .flatMap((a) => a.cameraMeshes || []);
  }
  clearSpawn(position) {
    for (const actor of this.actors) {
      if (actor.mesh.position.distanceTo(position) > 8) continue;
      const p = actor.mesh.position,
        limit = actor.axis === "x" ? 135 : 42;
      p[actor.axis] += actor.direction * 15;
      if (Math.abs(p[actor.axis]) > limit)
        p[actor.axis] = -Math.sign(p[actor.axis]) * limit;
      p.y = this.world.groundAt(p.x, p.z);
      actor.previous = { x: p.x, z: p.z };
    }
  }
  hasVehicleAhead(bike, distance = 7) {
    return this.actors.some((actor) => {
      const dx = actor.mesh.position.x - bike.position.x,
        dz = actor.mesh.position.z - bike.position.z,
        forward =
          dx * Math.sin(bike.motion.heading) +
          dz * Math.cos(bike.motion.heading),
        lateral = Math.abs(
          dx * Math.cos(bike.motion.heading) -
            dz * Math.sin(bike.motion.heading),
        );
      return (
        forward > 0 &&
        forward < (actor.type === "pedestrian" ? 3 : distance) &&
        lateral < (actor.type === "pedestrian" ? 1 : 2) &&
        Math.abs(actor.mesh.position.y - bike.position.y) < 1
      );
    });
  }
}
