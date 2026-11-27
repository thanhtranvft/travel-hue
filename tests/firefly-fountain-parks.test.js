import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { createFireflyTreePark } from "../src/modules/areas/quoc-hoc/view/FireflyTreePark.js";
import { createFountainPark } from "../src/modules/areas/quoc-hoc/view/FountainPark.js";
import { schoolGatePlacement } from "../src/modules/areas/quoc-hoc/view/SchoolGates.js";

function withMockDocument(fn) {
  const prev = globalThis.document;
  globalThis.document = {
    createElement() {
      return {
        width: 0,
        height: 0,
        getContext() {
          return {
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 1,
            fillRect() {},
            strokeRect() {},
            beginPath() {},
            moveTo() {},
            lineTo() {},
            stroke() {},
            arc() {},
            fill() {},
          };
        },
      };
    },
  };
  try {
    return fn();
  } finally {
    if (prev === undefined) delete globalThis.document;
    else globalThis.document = prev;
  }
}

test("FireflyTreePark aligns opposite Hai Ba Trung gate and animates wish ribbons & fireflies", () => {
  withMockDocument(() => {
    const biaSite = sites.find((s) => s.id === "quoc-hoc");
    const hbtSite = sites.find((s) => s.id === "hai-ba-trung");
    const hbtGate = schoolGatePlacement(hbtSite);
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
    };
    const biaPark = createBiaQuocHocPark(world, biaSite, heading);
    const fireflyPark = createFireflyTreePark(world, biaSite, heading, {
      haiBaTrung: { ...hbtSite, sign: hbtGate },
    });

    assert.ok(fireflyPark.group.getObjectByName("cay-dom-dom-wishing-tree"));
    assert.ok(fireflyPark.group.getObjectByName("wish-ribbons"));
    assert.ok(fireflyPark.group.getObjectByName("firefly-lights"));
    for (const crowd of fireflyPark.group.children.filter(c => c.name.startsWith("river-lawn-"))) {
      const p = biaPark.toWorld(crowd.position.x, crowd.position.z);
      assert.equal(fireflyPark.canRide(p.x,p.z),true, crowd.name+" must stay clear of park structures");
      assert.ok(Math.abs(fireflyPark.groundAt(p.x,p.z,0.13)-crowd.position.y)<0.02,crowd.name+" must sit on grass");
    }

    // Tree center aligns directly with Hai Ba Trung front gate lx
    const gateLocal = biaPark.toLocal(hbtGate.x, hbtGate.z);
    assert.ok(
      Math.abs(fireflyPark.treeCenterLocal.lx - gateLocal.lx) < 0.5,
      "Cây Đom Đóm must align directly opposite Hai Bà Trưng gate",
    );

    // Trunk & bench ring block riding, sandy clearing perimeter is rideable
    const treeWorld = biaPark.toWorld(
      fireflyPark.treeCenterLocal.lx,
      fireflyPark.treeCenterLocal.lz,
    );
    assert.equal(fireflyPark.canRide(treeWorld.x, treeWorld.z), false);
    assert.equal(fireflyPark.blocksGrass(treeWorld.x, treeWorld.z), true);
    assert.equal(fireflyPark.blocksTree(treeWorld.x, treeWorld.z), true);

    const clearingEdge = biaPark.toWorld(
      fireflyPark.treeCenterLocal.lx + 10,
      fireflyPark.treeCenterLocal.lz,
    );
    assert.equal(fireflyPark.canRide(clearingEdge.x, clearingEdge.z), true);
    assert.equal(fireflyPark.groundAt(clearingEdge.x, clearingEdge.z, 0.2), 0.24);

    // Animation runs cleanly across ticks
    fireflyPark.update(0.5);
    fireflyPark.update(2.5);
  });
});

test("FountainPark aligns opposite UBND Hue and animates water jets & pedal boats", () => {
  withMockDocument(() => {
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
    };
    const biaPark = createBiaQuocHocPark(world, biaSite, heading);
    const fountainPark = createFountainPark(world, biaSite, heading, {
      ubnd: ubndSite,
    });

    assert.ok(fountainPark.group.getObjectByName("fountain-water-jets"));
    for (const crowd of fountainPark.group.children.filter(c => c.name.startsWith("river-lawn-"))) {
      const p = biaPark.toWorld(crowd.position.x, crowd.position.z);
      assert.equal(fountainPark.canRide(p.x,p.z),true,crowd.name+" must stay clear of fountain and structures");
      assert.ok(Math.abs(fountainPark.groundAt(p.x,p.z,0.13)-crowd.position.y)<0.02,crowd.name+" must sit on grass");
    }

    const ubndLocal = biaPark.toLocal(ubndSite.center.x, ubndSite.center.z);
    assert.ok(
      Math.abs(fountainPark.fountainCenterLocal.lx - ubndLocal.lx) < 0.5,
      "Đài Phun Nước must align directly opposite UBND TP Huế",
    );

    // Central water basin blocks riding; circular plaza perimeter is rideable
    const centerWorld = biaPark.toWorld(
      fountainPark.fountainCenterLocal.lx,
      fountainPark.fountainCenterLocal.lz,
    );
    assert.equal(fountainPark.canRide(centerWorld.x, centerWorld.z), false);
    assert.equal(fountainPark.blocksGrass(centerWorld.x, centerWorld.z), true);
    assert.equal(fountainPark.blocksTree(centerWorld.x, centerWorld.z), true);

    const plazaWalk = biaPark.toWorld(
      fountainPark.fountainCenterLocal.lx + 15.5,
      fountainPark.fountainCenterLocal.lz,
    );
    assert.equal(fountainPark.canRide(plazaWalk.x, plazaWalk.z), true);
    assert.equal(fountainPark.groundAt(plazaWalk.x, plazaWalk.z, 0.2), 0.24);

    // Animation runs cleanly across ticks
    fountainPark.update(0.5);
    fountainPark.update(3.2);
  });
});
