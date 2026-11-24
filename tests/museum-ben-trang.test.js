import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { hitsCampusWall } from "../src/core/shared/architecture/CampusWalls.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { HoChiMinhMuseum } from "../src/modules/areas/quoc-hoc/view/HoChiMinhMuseum.js";
import { BenTrangCafe } from "../src/modules/areas/quoc-hoc/view/BenTrangCafe.js";
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
    treePositions: [],
  };
  world.biaPark = createBiaQuocHocPark(world, biaSite, heading);
  return { world, biaSite };
}

test("HoChiMinhMuseum renders 2-tier crimson roof, courtyard, open gates, and animated flags", async () => {
  await withMockDocument(() => {
    const { world } = makeParkWorld();
    const museumSite = sites.find((s) => s.id === "ho-chi-minh-museum");
    const museum = new HoChiMinhMuseum(world, museumSite);

    assert.ok(museum.group.getObjectByName("ho-chi-minh-museum-building"));
    assert.ok(museum.group.getObjectByName("museum-lower-hip-roof"));
    assert.ok(museum.group.getObjectByName("museum-upper-hip-roof"));
    assert.ok(museum.group.getObjectByName("museum-facade-sign"));
    assert.ok(museum.group.getObjectByName("museum-fountain-island"));
    assert.ok(museum.group.getObjectByName("museum-parking-shed"));
    assert.ok(museum.group.getObjectByName("museum-entrance-pylon"));

    // Both gates are completely unobstructed in campusWallSegments
    assert.equal(museum.gates.length, 2);
    for (const gate of museum.gates) {
      assert.equal(hitsCampusWall(gate, world.campusWallSegments), false);
    }

    // Courtyard concrete is rideable, steps rise gently, building & fountain block riding
    const frontCourtyard = museum.toWorld(-202, 27);
    assert.equal(museum.canRide(frontCourtyard.x, frontCourtyard.z), true);
    assert.equal(museum.groundAt(frontCourtyard.x, frontCourtyard.z, 0.2), 0.23);
    assert.equal(museum.blocksGrass(frontCourtyard.x, frontCourtyard.z), true);
    assert.equal(museum.blocksTree(frontCourtyard.x, frontCourtyard.z), true);

    const stepMid = museum.toWorld(museum.cx, 24.5);
    assert.ok(museum.groundAt(stepMid.x, stepMid.z, 0.3) > 0.35);

    const interior = museum.toWorld(museum.cx, museum.cz);
    assert.equal(museum.canRide(interior.x, interior.z), false);
    const fountain = museum.toWorld(museum.cx, 34.5);
    assert.equal(museum.canRide(fountain.x, fountain.z), false);

    // 6 ceremonial flags wave over time
    assert.equal(museum.flags.length, 6);
    museum.update(0.3);
    const z1 = museum.flags[0].geometry.attributes.position.getZ(8);
    museum.update(1.7);
    const z2 = museum.flags[0].geometry.attributes.position.getZ(8);
    assert.notEqual(z1, z2);
  });
});

test("BenTrangCafe aligns 3D group to toWorld, renders 7 paintings, spiral stairs, and walkable patio steps", async () => {
  await withMockDocument(() => {
    const { world } = makeParkWorld();
    const cafe = new BenTrangCafe(world);

    assert.ok(cafe.group.getObjectByName("ben-trang-mossy-stone-wall"));
    assert.ok(cafe.group.getObjectByName("ben-trang-facade-sign"));
    assert.ok(cafe.group.getObjectByName("ben-trang-spiral-staircase"));
    assert.equal(cafe.paintings.length, 7);
    assert.ok(cafe.lights.length >= 20);

    // Verify THREE group transform matches cafe.toWorld(cx, cz) across multiple corners
    cafe.group.updateMatrixWorld(true);
    for (const [cx, cz] of [
      [-9.4, 5.6],
      [3.6, 5.2],
      [9.1, 1.1],
    ]) {
      const vec = new THREE.Vector3(cx, 0, cz);
      cafe.group.localToWorld(vec);
      const expected = cafe.toWorld(cx, cz);
      assert.ok(
        Math.hypot(vec.x - expected.x, vec.z - expected.z) < 0.05,
        `World transform mismatch at (${cx}, ${cz})`,
      );
    }

    // Left terrace stairs smoothly climb from 0.18m to 1.66m
    const stairFoot = cafe.toWorld(-9.4, 7.2);
    const stairMid = cafe.toWorld(-9.4, 5.6);
    const patioSpot = cafe.toWorld(-6.0, 2.0);
    const yFoot = cafe.groundAt(stairFoot.x, stairFoot.z, 0.2);
    const yMid = cafe.groundAt(stairMid.x, stairMid.z, 0.8);
    const yPatio = cafe.groundAt(patioSpot.x, patioSpot.z, 1.6);
    assert.ok(yFoot < yMid && yMid < yPatio);
    assert.equal(yPatio, 1.66);
    assert.equal(cafe.canRide(patioSpot.x, patioSpot.z), true);

    // Retaining wall & main indoor café block riding
    const wallSpot = cafe.toWorld(0, 6.6);
    assert.equal(cafe.canRide(wallSpot.x, wallSpot.z), false);
    const indoorSpot = cafe.toWorld(3.6, 0);
    assert.equal(cafe.canRide(indoorSpot.x, indoorSpot.z), false);

    // Bistro string bulbs shimmer across update(time)
    cafe.update(0.2);
    const i1 = cafe.lights[0].material.emissiveIntensity;
    cafe.update(1.4);
    const i2 = cafe.lights[0].material.emissiveIntensity;
    assert.notEqual(i1, i2);
  });
});

test("GeographicWorld (quoc-hoc) integrates HoChiMinhMuseum and BenTrangCafe without road or tree conflicts", async () => {
  await withMockDocument(async () => {
    const region = await loadGeography("quoc-hoc");
    const world = new GeographicWorld(new THREE.Scene());
    world.region = region;
    world.build();

    assert.ok(world.hoChiMinhMuseum);
    assert.ok(world.benTrangCafe);
    assert.ok(world.landmarks.has("ho-chi-minh-museum"));
    assert.ok(world.landmarks.has("ben-trang-cafe"));

    // Internal service roads inside Museum courtyard are suppressed
    assert.equal(
      world.renderRoads.some((r) => [1473477097, 1473477098].includes(r.id)),
      false,
    );

    // No random avenue trees spawned inside Museum campus or Ben Trang cafe parcel
    for (const p of world.treePositions) {
      assert.equal(world.hoChiMinhMuseum.inCampus(p.x, p.z), false);
      assert.equal(world.benTrangCafe.inParcel(p.x, p.z), false);
    }

    // End-to-end riding & ground query through GeographicWorld
    const cafePatio = world.benTrangCafe.toWorld(-6.0, 2.0);
    assert.equal(world.groundAt(cafePatio.x, cafePatio.z, 1.6), 1.66);
    assert.equal(world.canRide(cafePatio.x, cafePatio.z, 1.66), true);

    const museumFront = world.hoChiMinhMuseum.toWorld(-202, 27);
    assert.equal(world.groundAt(museumFront.x, museumFront.z, 0.2), 0.23);
    assert.equal(world.canRide(museumFront.x, museumFront.z, 0.23), true);

    // Update tick executes cleanly
    world.update(1.25, new THREE.Vector3(museumFront.x, 0.23, museumFront.z));
  });
});
