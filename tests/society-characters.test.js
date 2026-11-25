import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  PERSON_ROLES,
  SOCIETY_PRESETS,
  animateWalker,
  makePerson,
  makeSocietyPerson,
} from "../src/core/world/People.js";
import { PedestrianLife } from "../src/core/world/PedestrianLife.js";
import { scooter } from "../src/core/traffic/TrafficSystem.js";
import { GeographicTraffic } from "../src/core/traffic/GeographicTraffic.js";
import { policeScooter } from "../src/core/traffic/PoliceScooter.js";
import { MobileCrowd } from "../src/core/rendering/MobileCrowd.js";
import { loadGeography, roads } from "../src/modules/areas/AreaModel.js";

test("People builds diverse society demographics, seated/mat poses, PoliceScooter compatibility, and isolated limb pivots", () => {
  const builtRoles = new Set();
  for (let i = 0; i < SOCIETY_PRESETS.length; i++) {
    const p = makeSocietyPerson(i);
    builtRoles.add(p.userData.role);
    assert.equal(p.userData.limbs.legs.length, 2);
    assert.equal(p.userData.limbs.arms.length, 2);
    for (const leg of p.userData.limbs.legs) {
      assert.equal(leg.name, "leg-pivot");
    }
    for (const arm of p.userData.limbs.arms) {
      assert.equal(arm.name, "arm-pivot");
    }
    const head = p.getObjectByName("head-group");
    assert.ok(head, "person builds named head-group");
    animateWalker(p, 1.3);
    assert.equal(head.rotation.x, 0, "animateWalker never pitches head-group");
  }
  for (const role of PERSON_ROLES) {
    assert.ok(builtRoles.has(role), `SOCIETY_PRESETS covers role ${role}`);
  }

  const child = makePerson({ role: "girl", shirt: "#f5e6ea", skirt: true });
  const adult = makePerson({ role: "man", shirt: "#3e6b89" });
  assert.ok(child.scale.y < adult.scale.y, "child scale is smaller than adult");

  const seated = makePerson({ role: "elder-woman", seated: true });
  assert.equal(seated.position.y, -0.27);
  const matSitter = makePerson({ role: "boy", onMat: true });
  assert.equal(matSitter.position.y, 0);

  // PoliceScooter relies on legacy string argument keeping #38474a trousers to recolor khaki
  const patrol = policeScooter();
  let khakiCount = 0;
  patrol.traverse((o) => {
    if (o.isMesh && o.material?.color?.getHexString() === "b49a60") {
      khakiCount++;
    }
  });
  assert.ok(khakiCount >= 2, "PoliceScooter recolors officer trousers cleanly");
});

test("Motorbike variants (tay-ga, xe-so, shipper, passengers) and GeographicTraffic spawn realistic diverse crowds", async () => {
  for (const spec of [
    { color: "#65878a", variant: "tay-ga", riderRole: "woman" },
    {
      color: "#a64d42",
      variant: "xe-so",
      riderRole: "man",
      hasPassenger: true,
      passengerRole: "girl",
    },
    { color: "#3d556b", variant: "shipper", riderRole: "man" },
  ]) {
    const bike = scooter(spec);
    assert.equal(bike.name, `motorbike-${spec.variant}`);
    let riderCount = 0;
    bike.traverse((o) => {
      if (o.name?.startsWith("person-")) riderCount++;
    });
    assert.equal(
      riderCount,
      spec.hasPassenger ? 2 : 1,
      `motorbike-${spec.variant} carries expected riders`,
    );
  }

  const region = await loadGeography("quang-trung");
  const scene = new THREE.Scene();
  const world = {
    scene,
    region,
    bounds: region.bounds,
    renderRoads: roads.filter((r) =>
      r.points.some(
        (p) =>
          p.x >= region.bounds.minX &&
          p.x <= region.bounds.maxX &&
          p.z >= region.bounds.minZ &&
          p.z <= region.bounds.maxZ,
      ),
    ),
    riverRings: [],
    buildingPolygons: [],
    quality: { crowdDistance: 250 },
    groundAt: () => 0.23,
    roadHeight: () => 0.23,
  };

  world.pedestrianLife = new PedestrianLife(world);
  const pedRoles = new Set(world.pedestrianLife.people.map((p) => p.role));
  assert.ok(pedRoles.size >= 4, `PedestrianLife spawns varied society roles (${[...pedRoles].join(", ")})`);
  for (const person of world.pedestrianLife.people.slice(0, 12)) {
    assert.equal(person.mesh.userData.limbs.legs.length, 2);
    assert.equal(person.mesh.userData.limbs.arms.length, 2);
  }

  const traffic = new GeographicTraffic(scene, world);
  const crowd = new MobileCrowd(world, traffic);
  const focusPoint =
    world.pedestrianLife.people[0]?.mesh?.position || new THREE.Vector3();
  crowd.update(focusPoint);
  assert.ok(crowd.visiblePeople > 0, "MobileCrowd instances visible diverse pedestrians");
  for (const batch of crowd.batches.values()) {
    assert.ok(
      batch.count <= batch.mesh.instanceMatrix.count,
      `InstancedMesh buffer capacity sufficient (${batch.count} <= ${batch.mesh.instanceMatrix.count})`,
    );
  }
});
