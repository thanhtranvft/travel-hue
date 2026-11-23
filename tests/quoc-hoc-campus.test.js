import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites } from "../src/core/shared/geography/map.js";
import { createSchoolGate } from "../src/modules/areas/quoc-hoc/view/SchoolGates.js";
import {
  createCampusWalls,
  hitsCampusWall,
} from "../src/core/shared/architecture/CampusWalls.js";
import { QuocHocSchoolCampus } from "../src/modules/areas/quoc-hoc/view/QuocHocSchoolCampus.js";

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

test("Quốc Học Tam Quan gate, lotus-finial walls, statue dais, twin flagpoles, buildings, and greenery build cleanly", () => {
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "quoc-hoc-school");
    assert.ok(site, "quoc-hoc-school site exists");

    const gate = createSchoolGate(site);
    assert.ok(gate, "Quoc Hoc gate is built");
    assert.equal(gate.object.name, "quoc-hoc-tam-quan-gate");
    assert.equal(gate.placement.confidence, "mapped");

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
    assert.ok(walls && walls.segments.length > 0, "campus walls built");
    assert.equal(
      hitsCampusWall(gate.placement, walls.segments),
      false,
      "central gate opening stays passable through walls",
    );

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const campus = new QuocHocSchoolCampus(world, site, gate.placement);
    assert.equal(
      campus.campusBuildingPolygons.length,
      19,
      "all 19 OSM buildings inside Quốc Học campus are styled",
    );
    assert.ok(
      campus.group.getObjectByName("nguyen-tat-thanh-monument"),
      "Nguyễn Tất Thành statue monument is present",
    );
    assert.equal(campus.flags.length, 2, "twin flagpoles with two flags exist");

    // Flag animation updates vertex positions cleanly
    const flagAttr = campus.flags[0].geometry.attributes.position;
    const zBefore = flagAttr.getZ(flagAttr.count - 1);
    campus.update(1.7);
    const zAfter = flagAttr.getZ(flagAttr.count - 1);
    assert.notEqual(zAfter, zBefore, "flag cloth waves during update");

    // Ground & rideability contracts inside campus
    const statuePos = campus.toWorld(0, campus.axisLength);
    assert.equal(campus.groundAt(statuePos.x, statuePos.z), 0.74);
    assert.equal(campus.canRide(statuePos.x, statuePos.z), false);

    const flagpolePos = campus.toWorld(-3.2, campus.axisLength + 9.4);
    assert.equal(campus.canRide(flagpolePos.x, flagpolePos.z), false);

    const avenuePos = campus.toWorld(0, 45);
    assert.equal(campus.groundAt(avenuePos.x, avenuePos.z), 0.34);
    assert.equal(campus.canRide(avenuePos.x, avenuePos.z), true);

    const wingWalkPos = campus.toWorld(-37.5, 100);
    assert.equal(campus.groundAt(wingWalkPos.x, wingWalkPos.z), 0.34);
    assert.equal(campus.canRide(wingWalkPos.x, wingWalkPos.z), true);

    assert.equal(campus.blocksTree(avenuePos.x, avenuePos.z), true);
    assert.equal(campus.blocksGrass(avenuePos.x, avenuePos.z), true);

    const counts = campus.students.getCounts();
    assert.ok(counts.boys > 0 && counts.girls > 0, "Quốc Học has boy and girl students");
    assert.equal(
      campus.animatedObjects.some((o) => o.userData?.studentGender === "boy"),
      true,
    );
    assert.equal(
      campus.animatedObjects.some((o) => o.userData?.studentGender === "girl"),
      true,
    );

    // Outside campus returns null
    const outsidePos = campus.toWorld(0, -40);
    assert.equal(campus.groundAt(outsidePos.x, outsidePos.z), null);
    assert.equal(campus.canRide(outsidePos.x, outsidePos.z), null);
  });
});
