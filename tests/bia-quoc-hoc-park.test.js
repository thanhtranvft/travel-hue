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

    // Outside park precinct returns null so other world surfaces stay untouched
    const farPt = park.toWorld(200, 120);
    assert.equal(park.groundAt(farPt.x, farPt.z), null);
    assert.equal(park.canRide(farPt.x, farPt.z), null);
  });
});
