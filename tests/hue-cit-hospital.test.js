import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { hitsCampusWall } from "../src/core/shared/architecture/CampusWalls.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { HueCITBuilding } from "../src/modules/areas/quoc-hoc/view/HueCITBuilding.js";
import { HueCentralHospital } from "../src/modules/areas/quoc-hoc/view/HueCentralHospital.js";
import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";

function withMockDocument(fn) {
  const prev = globalThis.document;
  const noop = () => {};
  const grad = () => ({ addColorStop: noop });
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "center",
    textBaseline: "middle",
    fillRect: noop,
    clearRect: noop,
    strokeRect: noop,
    rect: noop,
    roundRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    quadraticCurveTo: noop,
    bezierCurveTo: noop,
    closePath: noop,
    stroke: noop,
    fill: noop,
    arc: noop,
    clip: noop,
    ellipse: noop,
    scale: noop,
    setLineDash: noop,
    translate: noop,
    rotate: noop,
    save: noop,
    restore: noop,
    fillText: noop,
    strokeText: noop,
    createLinearGradient: grad,
    createRadialGradient: grad,
    measureText: (t) => ({ width: String(t || "").length * 10 }),
  };
  globalThis.document = {
    createElement: () => ({
      width: 512,
      height: 512,
      getContext: () => ctx,
    }),
  };
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      if (prev === undefined) delete globalThis.document;
      else globalThis.document = prev;
    });
}

function makeParkWorld() {
  const biaSite = sites.find((s) => s.id === "quoc-hoc");
  const closest = mainRoads
    .map((r) => nearestPoint(biaSite.sign, r.points))
    .sort((a, b) => a.distance - b.distance)[0];
  const heading = Math.atan2(
    closest.x - biaSite.sign.x,
    closest.z - biaSite.sign.z,
  );
  const world = {
    scene: new THREE.Scene(),
    riverRings: river,
    cameraObstacles: [],
    campusWallSegments: [],
    buildingPolygons: [],
    treePositions: [],
  };
  world.biaPark = createBiaQuocHocPark(world, biaSite, heading);
  return { world, biaSite };
}

test("HueCITBuilding renders winged roof, V-arch canopy, Aptech/Arena banners, boulder, open gate, and animated flag", async () => {
  await withMockDocument(() => {
    const { world } = makeParkWorld();
    const citSite = sites.find((s) => s.id === "hue-cit");
    const cit = new HueCITBuilding(world, citSite);

    assert.ok(cit.group.getObjectByName("hue-cit-cobblestone-courtyard"));
    assert.ok(cit.group.getObjectByName("hue-cit-main-building"));
    assert.ok(cit.group.getObjectByName("hue-cit-winged-roof"));
    assert.ok(cit.group.getObjectByName("hue-cit-v-arch-canopy"));
    assert.ok(cit.group.getObjectByName("hue-cit-aptech-banner"));
    assert.ok(cit.group.getObjectByName("hue-cit-arena-banner"));
    assert.ok(cit.group.getObjectByName("hue-cit-entrance-sign"));
    assert.ok(cit.group.getObjectByName("hue-cit-boulder"));

    // Verify THREE group transform matches toWorld
    cit.group.updateMatrixWorld(true);
    for (const [lx, lz] of [
      [-215.5, 56.6],
      [-220.91, 106.66],
      [-205.0, 75.0],
    ]) {
      const v = new THREE.Vector3(lx, 0, lz);
      cit.group.localToWorld(v);
      const expected = cit.toWorld(lx, lz);
      assert.ok(
        Math.hypot(v.x - expected.x, v.z - expected.z) < 0.05,
        `World transform mismatch at (${lx}, ${lz})`,
      );
    }

    // Entrance gate is completely unobstructed
    assert.equal(hitsCampusWall(cit.entrance, world.campusWallSegments), false);

    // Forecourt cobblestone plaza is rideable, steps climb smoothly, core & V-arch feet block riding
    const forecourt = cit.toWorld(-215.5, 72.0);
    assert.equal(cit.canRide(forecourt.x, forecourt.z), true);
    assert.equal(cit.groundAt(forecourt.x, forecourt.z, 0.2), 0.23);
    assert.equal(cit.blocksGrass(forecourt.x, forecourt.z), true);
    assert.equal(cit.blocksTree(forecourt.x, forecourt.z), true);

    const stepBia = cit.bToBia(0, -17.2);
    const stepWorld = cit.toWorld(stepBia.lx, stepBia.lz);
    assert.ok(cit.groundAt(stepWorld.x, stepWorld.z, 0.3) > 0.45);

    const interiorBia = cit.bToBia(0, 0);
    const interiorWorld = cit.toWorld(interiorBia.lx, interiorBia.lz);
    assert.equal(cit.canRide(interiorWorld.x, interiorWorld.z), false);

    const archFootBia = cit.bToBia(9.6, -25.8);
    const archFootWorld = cit.toWorld(archFootBia.lx, archFootBia.lz);
    assert.equal(cit.canRide(archFootWorld.x, archFootWorld.z), false);

    // Flag waves over time
    assert.equal(cit.flags.length, 1);
    cit.update(0.2);
    const z1 = cit.flags[0].geometry.attributes.position.getZ(8);
    cit.update(1.4);
    const z2 = cit.flags[0].geometry.attributes.position.getZ(8);
    assert.notEqual(z1, z2);
  });
});

test("HueCentralHospital renders curved Heart Center, outpatient clinic, 3 open portals, perimeter fences, and pulsing beacons", async () => {
  await withMockDocument(() => {
    const { world } = makeParkWorld();
    const hospSite = sites.find((s) => s.id === "hospital");
    const hosp = new HueCentralHospital(world, hospSite);

    assert.ok(hosp.group.getObjectByName("hospital-heart-center-pavilion"));
    assert.ok(hosp.group.getObjectByName("hospital-heart-center-sign"));
    assert.ok(hosp.group.getObjectByName("hospital-rear-dispatch-booth"));
    assert.ok(hosp.group.getObjectByName("hospital-rear-outpatient-clinic"));
    assert.equal(
      hosp.group.children.filter((c) => c.name === "hospital-rear-gate-portal")
        .length,
      3,
    );

    // All 3 rear gates are completely unobstructed
    assert.equal(hosp.gates.length, 3);
    for (const gate of hosp.gates) {
      assert.equal(hitsCampusWall(gate, world.campusWallSegments), false);
    }

    // Wall segments built for perimeter
    assert.ok(world.campusWallSegments.length > 30);

    // Rear hospital garden & ambulance bay are rideable while outpatient annex & security booth block riding
    const garden = hosp.toWorld(413.0, 144.0);
    assert.equal(hosp.canRide(garden.x, garden.z), true);
    assert.equal(hosp.blocksGrass(garden.x, garden.z), true);
    assert.equal(hosp.blocksTree(garden.x, garden.z), true);

    const bay = hosp.toWorld(408.0, 97.0);
    assert.equal(hosp.canRide(bay.x, bay.z), true);
    assert.equal(hosp.groundAt(bay.x, bay.z, 0.2), 0.21);

    const clinic = hosp.toWorld(478.0, 145.0);
    assert.equal(hosp.canRide(clinic.x, clinic.z), false);

    const booth = hosp.toWorld(441.8, 113.4);
    assert.equal(hosp.canRide(booth.x, booth.z), false);

    // Ambulance beacons pulse over time
    assert.equal(hosp.beacons.length, 6);
    hosp.update(0.1);
    const e1 = hosp.beacons[0].material.emissiveIntensity;
    hosp.update(0.6);
    const e2 = hosp.beacons[0].material.emissiveIntensity;
    assert.notEqual(e1, e2);
  });
});

test("GeographicWorld integrates HueCITBuilding and HueCentralHospital cleanly into quoc-hoc corridor", async () => {
  await withMockDocument(async () => {
    const region = await loadGeography("quoc-hoc");
    const world = new GeographicWorld(new THREE.Scene());
    world.region = region;
    world.build();

    assert.ok(world.hueCit);
    assert.ok(world.hueHospital);
    assert.ok(world.landmarks.has("hue-cit"));
    assert.ok(world.landmarks.has("hospital"));

    // No generic avenue trees planted inside HueCIT courtyard or Hospital rear zone
    for (const tree of world.treePositions) {
      assert.equal(world.hueCit.inCampus(tree.x, tree.z), false);
      assert.equal(world.hueHospital.inRearZone(tree.x, tree.z), false);
    }

    // All 4 new portals/gates are unobstructed and rideable in GeographicWorld
    assert.equal(
      hitsCampusWall(world.hueCit.entrance, world.campusWallSegments),
      false,
    );
    assert.equal(
      world.canRide(world.hueCit.entrance.x, world.hueCit.entrance.z, 0.23),
      true,
    );
    for (const gate of world.hueHospital.gates) {
      assert.equal(hitsCampusWall(gate, world.campusWallSegments), false);
      assert.equal(world.canRide(gate.x, gate.z, 0.23), true);
    }

    // HueCIT forecourt and Hospital rear park/bay are rideable, while custom buildings block riding
    const citForecourt = world.hueCit.toWorld(-215.5, 72.0);
    assert.equal(world.canRide(citForecourt.x, citForecourt.z, 0.23), true);

    const hospGarden = world.hueHospital.toWorld(413.0, 144.0);
    assert.equal(world.canRide(hospGarden.x, hospGarden.z, 0.2), true);

    const hospClinic = world.hueHospital.toWorld(478.0, 145.0);
    assert.equal(world.canRide(hospClinic.x, hospClinic.z, 0.2), false);

    // Heart Center OSM polygon still tracked for building collision
    const heartCenter = world.hueHospital.toWorld(538.9, 111.1);
    assert.equal(world.canRide(heartCenter.x, heartCenter.z, 0.2), false);

    // World update advances both HueCIT flag and Hospital ambulance beacons cleanly
    world.update(0.5);
    world.update(1.5);
  });
});
