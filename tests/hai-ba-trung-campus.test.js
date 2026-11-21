import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites } from "../src/core/shared/geography/map.js";
import { createSchoolGate } from "../src/modules/areas/quoc-hoc/view/SchoolGates.js";
import {
  createCampusWalls,
  hitsCampusWall,
} from "../src/core/shared/architecture/CampusWalls.js";
import { HaiBaTrungSchoolCampus } from "../src/modules/areas/quoc-hoc/view/HaiBaTrungSchoolCampus.js";

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
    closePath: noop,
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

test("Hai Bà Trưng Tam Quan gate, baluster fence, 12 buildings, flagpole island, and white-washed trees build cleanly", () => {
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "hai-ba-trung");
    assert.ok(site, "hai-ba-trung site exists");

    const gate = createSchoolGate(site);
    assert.ok(gate, "Hai Bà Trưng gate is built");
    assert.equal(gate.object.name, "hai-ba-trung-tam-quan-gate");

    gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
    gate.object.rotation.y = gate.placement.heading;
    gate.object.updateMatrixWorld(true);

    const panel = gate.object.getObjectByName("gate-name-panel");
    assert.ok(panel, "gate has front gate-name-panel");
    const meshes = [];
    gate.object.traverseVisible((o) => {
      if (o.isMesh) meshes.push(o);
    });
    for (const x of [-3, -1.5, 0, 1.5, 3]) {
      for (const y of [-0.35, 0.2]) {
        const target = panel.localToWorld(new THREE.Vector3(x, y, 0.001));
        const origin = gate.object.localToWorld(new THREE.Vector3(x, 3.5, 12));
        const dir = target.clone().sub(origin);
        const ray = new THREE.Raycaster(
          origin,
          dir.clone().normalize(),
          0,
          dir.length() + 0.01,
        );
        const hit = ray.intersectObjects(meshes, false)[0];
        assert.equal(hit?.object, panel, `gate sign unobstructed at (${x}, ${y})`);
      }
    }

    const walls = createCampusWalls(site, gate.placement);
    assert.ok(walls && walls.segments.length > 0, "campus fence built");
    assert.equal(
      hitsCampusWall(gate.placement, walls.segments),
      false,
      "central gate opening stays passable through fence",
    );

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const campus = new HaiBaTrungSchoolCampus(world, site, gate.placement);
    assert.equal(
      campus.campusBuildingPolygons.length,
      12,
      "all 12 OSM buildings inside Hai Bà Trưng campus are styled",
    );
    assert.ok(
      campus.group.getObjectByName("hai-ba-trung-flagpole"),
      "central flagpole monument is present",
    );
    assert.equal(campus.flags.length, 1, "central flagpole has waving flag");

    const flagAttr = campus.flags[0].geometry.attributes.position;
    const zBefore = flagAttr.getZ(flagAttr.count - 1);
    campus.update(1.7);
    const zAfter = flagAttr.getZ(flagAttr.count - 1);
    assert.notEqual(zAfter, zBefore, "flag cloth waves during update");

    // Flagpole pedestal blocked; terracotta cross-path rideable; entry avenue & wing walks rideable
    const flagpolePos = campus.toWorld(
      campus.flagpoleLocal.side,
      campus.flagpoleLocal.fwd,
    );
    assert.equal(campus.groundAt(flagpolePos.x, flagpolePos.z), 0.46);
    assert.equal(campus.canRide(flagpolePos.x, flagpolePos.z), false);

    const crossPathPos = campus.toWorld(
      campus.flagpoleLocal.side,
      campus.flagpoleLocal.fwd - 5,
    );
    assert.equal(campus.groundAt(crossPathPos.x, crossPathPos.z), 0.46);
    assert.equal(campus.canRide(crossPathPos.x, crossPathPos.z), true);

    const avenuePos = campus.toWorld(0.5, 45);
    assert.equal(campus.groundAt(avenuePos.x, avenuePos.z), 0.34);
    assert.equal(campus.canRide(avenuePos.x, avenuePos.z), true);

    // Main Hall (Nhà chơi) blocks riding
    const mainHallPos = campus.toWorld(1.2, 177.2);
    assert.equal(campus.canRide(mainHallPos.x, mainHallPos.z), false);

    // Plaza tree planter box blocks riding, while open plaza next to it is rideable
    const planterPos = campus.toWorld(-25.5, 134);
    assert.equal(campus.canRide(planterPos.x, planterPos.z), false);
    const openPlazaPos = campus.toWorld(-18, 134);
    assert.equal(campus.canRide(openPlazaPos.x, openPlazaPos.z), true);

    assert.equal(campus.blocksTree(avenuePos.x, avenuePos.z), true);
    assert.equal(campus.blocksGrass(avenuePos.x, avenuePos.z), true);

    const outsidePos = campus.toWorld(0, -40);
    assert.equal(campus.groundAt(outsidePos.x, outsidePos.z), null);
    assert.equal(campus.canRide(outsidePos.x, outsidePos.z), null);
  });
});
