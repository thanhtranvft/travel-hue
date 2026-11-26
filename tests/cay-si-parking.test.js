import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint, inside } from "../src/core/shared/geography/geometry.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { MuseumParkingAndCaySiCafe } from "../src/modules/areas/quoc-hoc/view/MuseumParkingAndCaySiCafe.js";
import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { roadWidth, isFootway } from "../src/core/world/roadProfile.js";

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
    createPattern: () => ({}),
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
  return world;
}

test("MuseumParkingAndCaySiCafe builds car & motorbike parking lot, Cafe Cay Si, and 24 large flamboyant trees", async () => {
  await withMockDocument(() => {
    const world = makeParkWorld();
    const precinct = new MuseumParkingAndCaySiCafe(world);

    assert.ok(precinct.group.getObjectByName("museum-car-motorbike-parking-lot"));
    assert.ok(precinct.group.getObjectByName("museum-parking-lot-slab"));
    assert.ok(precinct.group.getObjectByName("museum-parking-kiosk"));
    assert.ok(precinct.group.getObjectByName("museum-parking-sign"));
    assert.ok(precinct.group.getObjectByName("museum-motorbike-parking-shed"));
    assert.ok(precinct.group.getObjectByName("cay-si-cafe-precinct"));
    assert.ok(precinct.group.getObjectByName("cay-si-ancient-banyan"));
    assert.ok(precinct.group.getObjectByName("cay-si-cafe-pavilion"));
    assert.ok(precinct.group.getObjectByName("cay-si-cafe-facade-sign"));
    assert.ok(precinct.group.getObjectByName("cay-si-welcome-board"));
    assert.ok(precinct.group.getObjectByName("hue-flamboyant-grove"));

    // 24 large flamboyant trees + 1 ancient Cay Si trunk registered
    assert.equal(precinct.treeTrunks.length, 25);
    assert.ok(precinct.lights.length >= 20);

    // Rideable parking aisle & Cafe courtyard, while cars/pavilion/Cay Si trunk block riding
    const aisle = precinct.toWorld(-148, 22);
    assert.equal(precinct.canRide(aisle.x, aisle.z), true);
    assert.equal(precinct.groundAt(aisle.x, aisle.z, 0.2), 0.23);
    assert.equal(precinct.blocksGrass(aisle.x, aisle.z), true);

    const parkedCarSpot = precinct.toWorld(-159.5, 14.5);
    assert.equal(precinct.canRide(parkedCarSpot.x, parkedCarSpot.z), false);

    const bikeShedSpot = precinct.toWorld(-139.2, 30.8);
    assert.equal(precinct.canRide(bikeShedSpot.x, bikeShedSpot.z), false);

    const cafeWalk = precinct.toWorld(-129.0, -47.0);
    assert.equal(precinct.canRide(cafeWalk.x, cafeWalk.z), true);

    const caySiTrunk = precinct.toWorld(-120.5, -46.5);
    assert.equal(precinct.canRide(caySiTrunk.x, caySiTrunk.z), false);

    const pavilionDeck = precinct.toWorld(-107.0, -40.5);
    assert.equal(precinct.groundAt(pavilionDeck.x, pavilionDeck.z, 0.3), 0.36);
    assert.equal(precinct.canRide(pavilionDeck.x, pavilionDeck.z), false);

    // String lights shimmer over update(time)
    precinct.update(0.1);
    const i1 = precinct.lights[0].material.emissiveIntensity;
    precinct.update(0.8);
    const i2 = precinct.lights[0].material.emissiveIntensity;
    assert.notEqual(i1, i2);
  });
});

test("GeographicWorld (quoc-hoc) integrates parking lot, Cafe Cay Si, and flamboyant grove clear of roads and river", async () => {
  await withMockDocument(async () => {
    const region = await loadGeography("quoc-hoc");
    const world = new GeographicWorld(new THREE.Scene());
    world.region = region;
    world.build();

    assert.ok(world.museumParkingCafe);
    assert.ok(world.landmarks.has("museum-parking"));
    assert.ok(world.landmarks.has("cay-si-cafe"));

    // Verify zero overlap of parkingPoly & cafePoly with any carriageway, footway, or river
    for (const poly of [
      world.museumParkingCafe.parkingPoly,
      world.museumParkingCafe.cafePoly,
    ]) {
      const xs = poly.map((p) => p.x);
      const zs = poly.map((p) => p.z);
      for (let lx = Math.min(...xs); lx <= Math.max(...xs); lx += 1) {
        for (let lz = Math.min(...zs); lz <= Math.max(...zs); lz += 1) {
          if (!inside({ x: lx, z: lz }, poly)) continue;
          const w = world.museumParkingCafe.toWorld(lx, lz);
          assert.equal(
            world.riverRings.some((r) => inside(w, r)),
            false,
            `Parcel overlaps river at (${lx}, ${lz})`,
          );
          for (const road of world.renderRoads) {
            const clearance = nearestPoint(w, road.points).distance - roadWidth(road) / 2;
            assert.ok(
              clearance >= (isFootway(road) ? 0.8 : 2.2),
              `Road clearance too tight (${clearance.toFixed(2)}m) for road ${road.id} at (${lx}, ${lz})`,
            );
          }
        }
      }
    }

    // Verify all flamboyant & Cay Si trunks clear roads & footways
    for (const t of world.museumParkingCafe.treeTrunks) {
      const w = world.museumParkingCafe.toWorld(t.lx, t.lz);
      for (const road of world.renderRoads) {
        const clearance = nearestPoint(w, road.points).distance - roadWidth(road) / 2;
        assert.ok(
          clearance >= (isFootway(road) ? 0.8 : 2.0),
          `Tree trunk too close (${clearance.toFixed(2)}m) to road ${road.id} at (${t.lx}, ${t.lz})`,
        );
      }
    }

    // No random generic avenue trees spawned inside parking or cafe parcel
    for (const p of world.treePositions) {
      assert.equal(world.museumParkingCafe.inParcel(p.x, p.z), false);
    }

    // End-to-end riding & ground queries through GeographicWorld
    const parkingAisle = world.museumParkingCafe.toWorld(-148, 22);
    assert.equal(world.groundAt(parkingAisle.x, parkingAisle.z, 0.2), 0.23);
    assert.equal(world.canRide(parkingAisle.x, parkingAisle.z, 0.23), true);

    const cafeYard = world.museumParkingCafe.toWorld(-129.0, -47.0);
    assert.equal(world.groundAt(cafeYard.x, cafeYard.z, 0.2), 0.22);
    assert.equal(world.canRide(cafeYard.x, cafeYard.z, 0.22), true);

    // Cafe Cay Si sits near the Perfume River & beside Ben Trang (not on Le Loi roadside)
    const minRiverDist = Math.min(
      ...world.riverRings.map((ring) => nearestPoint(world.museumParkingCafe.cafeEntrance, ring).distance),
    );
    assert.ok(minRiverDist < 40, `Cafe Cay Si should sit near the Perfume River (${minRiverDist.toFixed(1)}m)`);
    assert.ok(
      Math.hypot(
        world.museumParkingCafe.cafeEntrance.x - world.benTrangCafe.entrance.x,
        world.museumParkingCafe.cafeEntrance.z - world.benTrangCafe.entrance.z,
      ) < 70,
      "Cafe Cay Si should sit near Ben Trang Cafe",
    );

    world.update(1.1, new THREE.Vector3(cafeYard.x, 0.22, cafeYard.z));
  });
});
