import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { quocHoc } from "../src/modules/areas/quoc-hoc/view/BiaQuocHoc.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";

function withMockDocument(fn) {
  const prev = globalThis.document;
  const noop = () => {};
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "center",
    textBaseline: "middle",
    fillRect: noop,
    strokeRect: noop,
    roundRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    arc: noop,
    fillText: noop,
  };
  globalThis.document = {
    createElement: () => ({ width: 256, height: 256, getContext: () => ctx }),
  };
  try {
    return fn();
  } finally {
    globalThis.document = prev;
  }
}

test("Bia Quốc Học monument and riverside park build cleanly with rideable overlook and clear sightlines", () => {
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "quoc-hoc");
    assert.ok(site, "quoc-hoc site exists");

    const closest = mainRoads
      .map((r) => nearestPoint(site.sign, r.points))
      .sort((a, b) => a.distance - b.distance)[0];
    const heading = Math.atan2(
      closest.x - site.sign.x,
      closest.z - site.sign.z,
    );

    const monument = quocHoc.create();
    assert.ok(
      monument.children.length > 20,
      "monument has rich multi-part architecture",
    );

    const world = {
      scene: new THREE.Scene(),
      riverRings: river,
      cameraObstacles: [],
    };
    const park = createBiaQuocHocPark(world, site, heading);
    assert.ok(
      park.group.children.length > 15,
      "park has plaza, terraces, wooden deck, pergola, and trees",
    );

    // Front plaza (between monument and Le Loi) is rideable, flat, and blocks random trees/wild grass
    const plazaPt = park.toWorld(0, 20);
    assert.equal(park.groundAt(plazaPt.x, plazaPt.z, 0.24), 0.24);
    assert.equal(park.blocksGrass(plazaPt.x, plazaPt.z), true);
    assert.equal(park.blocksTree(plazaPt.x, plazaPt.z), true);

    // Monument core & Tru Bieu pillars block riding
    const monumentCore = park.toWorld(0, 0);
    assert.equal(park.canRide(monumentCore.x, monumentCore.z), false);
    const truBieu = park.toWorld(13.2, 9.2);
    assert.equal(park.canRide(truBieu.x, truBieu.z), false);

    // Cantilevered wooden riverfront overlook deck is rideable at 0.36m
    const overlookPt = park.toWorld(0, -52);
    assert.equal(park.canRide(overlookPt.x, overlookPt.z), true);
    assert.equal(park.groundAt(overlookPt.x, overlookPt.z, 0.3), 0.36);

    // Rear terraces & twin walkways slope monotonically downward toward the riverfront deck
    const rearCrest = park.toWorld(0, -14);
    const slopeTop = park.toWorld(0, -20);
    const slopeMid = park.toWorld(0, -30);
    const slopeLow = park.toWorld(0, -40);
    const yCrest = park.groundAt(rearCrest.x, rearCrest.z, 1.5);
    const yTop = park.groundAt(slopeTop.x, slopeTop.z, 1.3);
    const yMid = park.groundAt(slopeMid.x, slopeMid.z, 0.9);
    const yLow = park.groundAt(slopeLow.x, slopeLow.z, 0.5);
    assert.ok(yCrest > 1.2, `rear crest must be elevated above riverfront deck, got ${yCrest}`);
    assert.ok(
      yCrest > yTop && yTop > yMid && yMid > yLow && yLow > 0.36,
      `rear lawn must slope monotonically down toward river: ${yCrest} > ${yTop} > ${yMid} > ${yLow} > 0.36`,
    );

    const walkTop = park.toWorld(14.5, -18);
    const walkLow = park.toWorld(14.5, -40);
    assert.equal(park.canRide(walkTop.x, walkTop.z), true);
    assert.ok(
      park.groundAt(walkTop.x, walkTop.z, 1.4) > park.groundAt(walkLow.x, walkLow.z, 0.6),
      "twin walkways must slope downward toward the river",
    );

    // Seated youth/family circles and kite flying behind Bia Quoc Hoc
    let circleCount = 0;
    let kiteCount = 0;
    park.group.traverse((obj) => {
      if (obj.name === "youth-sitting-circle" || obj.name === "family-sitting-circle") {
        circleCount++;
      } else if (obj.name === "kite-flying-group") {
        kiteCount++;
      }
    });
    assert.ok(circleCount >= 6, `expected >= 6 seated circles behind Bia Quoc Hoc, got ${circleCount}`);
    assert.ok(kiteCount >= 2, `expected >= 2 kite-flying groups in Bia Quoc Hoc park, got ${kiteCount}`);

    // Outside park precinct returns null so other world surfaces stay untouched
    const farPt = park.toWorld(200, 120);
    assert.equal(park.groundAt(farPt.x, farPt.z), null);
    assert.equal(park.canRide(farPt.x, farPt.z), null);
  });
});
