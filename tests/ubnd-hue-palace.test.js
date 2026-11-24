import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { hitsCampusWall } from "../src/core/shared/architecture/CampusWalls.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { createFountainPark } from "../src/modules/areas/quoc-hoc/view/FountainPark.js";
import { UbndHuePalace } from "../src/modules/areas/quoc-hoc/view/UbndHuePalace.js";

import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";

test("UbndHuePalace aligns opposite FountainPark, opens gates to Le Loi, and animates flag", () => {
  const biaSite = sites.find((s) => s.id === "quoc-hoc");
  const ubndSite = sites.find((s) => s.id === "ubnd");
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
  world.fountainPark = createFountainPark(world, biaSite, heading, {
    ubnd: ubndSite,
  });

  const palace = new UbndHuePalace(world, ubndSite);

  // Aligns symmetrically on central axis opposite FountainPark across Lê Lợi
  assert.ok(
    Math.abs(palace.cx - world.fountainPark.fountainCenterLocal.lx) < 0.5,
    "UBND palace axis must align directly opposite Đài Phun Nước",
  );

  assert.ok(palace.group.getObjectByName("ubnd-palace-facade"));
  assert.ok(palace.group.getObjectByName("ubnd-facade-sign"));
  assert.ok(palace.group.getObjectByName("ubnd-quoc-huy-emblem"));

  // Main ceremonial gate & twin side driveway gates are unobstructed in campusWallSegments
  assert.equal(hitsCampusWall(palace.entrance, world.campusWallSegments), false);
  const leftGate = palace.toWorld(palace.cx - 42.5, palace.bounds.minLz);
  const rightGate = palace.toWorld(palace.cx + 42.5, palace.bounds.minLz);
  assert.equal(hitsCampusWall(leftGate, world.campusWallSegments), false);
  assert.equal(hitsCampusWall(rightGate, world.campusWallSegments), false);

  // Forecourt granite avenue is rideable; palace footprint & flagpole block riding
  const avenuePt = palace.toWorld(palace.cx, 66.0);
  assert.equal(palace.canRide(avenuePt.x, avenuePt.z), true);
  assert.equal(palace.groundAt(avenuePt.x, avenuePt.z, 0.2), 0.24);
  assert.equal(palace.blocksGrass(avenuePt.x, avenuePt.z), true);
  assert.equal(palace.blocksTree(avenuePt.x, avenuePt.z), true);

  const palaceInterior = palace.toWorld(palace.cx, 110.0);
  assert.equal(palace.canRide(palaceInterior.x, palaceInterior.z), false);
  const flagpolePt = palace.toWorld(palace.cx, 75.5);
  assert.equal(palace.canRide(flagpolePt.x, flagpolePt.z), false);

  // Waving flag updates cleanly across frames
  assert.ok(palace.flags.length >= 1);
  palace.update(0.4);
  const zA = palace.flags[0].geometry.attributes.position.getZ(8);
  palace.update(2.1);
  const zB = palace.flags[0].geometry.attributes.position.getZ(8);
  assert.notEqual(zA, zB);
});

test("GeographicWorld (quoc-hoc) integrates UbndHuePalace and expanded YouthPlayground end-to-end", async () => {
  const region = await loadGeography("quoc-hoc");
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
    fillText: noop,
    strokeText: noop,
    ellipse: noop,
    measureText: (t = "") => ({ width: t.length * 24 }),
    scale: noop,
    translate: noop,
    rotate: noop,
    setLineDash: noop,
    createLinearGradient: grad,
    createRadialGradient: grad,
    save: noop,
    restore: noop,
  };
  globalThis.document = {
    createElement: () => ({ width: 512, height: 256, getContext: () => ctx }),
  };
  try {
    const world = new GeographicWorld(new THREE.Scene());
    world.region = region;
    world.build();

    assert.ok(world.ubndPalace, "ubndPalace instantiated on GeographicWorld");
    assert.ok(world.youthPlayground, "youthPlayground instantiated on GeographicWorld");
    assert.ok(world.fountainPark, "fountainPark instantiated on GeographicWorld");

    // Legacy Youth Center internal road 656794242 suppressed cleanly
    assert.equal(
      world.renderRoads.some((r) => r.id === 656794242),
      false,
    );

    // No random roadside trees spawned inside Youth Center or UBND gates/grounds
    for (const tp of world.treePositions) {
      assert.equal(world.youthPlayground.blocksTree(tp.x, tp.z), false);
      assert.equal(world.ubndPalace.blocksTree(tp.x, tp.z), false);
    }

    // World groundAt & canRide delegate to both landmarks
    const youthWalk = world.youthPlayground.toWorld(-4.85, 8.0);
    assert.equal(world.groundAt(youthWalk.x, youthWalk.z, 0.2), 0.22);
    assert.equal(world.canRide(youthWalk.x, youthWalk.z, 0.2), true);

    const ubndAvenue = world.ubndPalace.toWorld(world.ubndPalace.cx, 66.0);
    assert.equal(world.groundAt(ubndAvenue.x, ubndAvenue.z, 0.2), 0.24);
    assert.equal(world.canRide(ubndAvenue.x, ubndAvenue.z, 0.2), true);

    world.update(1.2, new THREE.Vector3(youthWalk.x, 0.2, youthWalk.z));
  } finally {
    globalThis.document = prev;
  }
});
