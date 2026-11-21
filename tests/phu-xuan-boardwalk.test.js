import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { roads, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import {
  GeographicTraffic,
  stitchBridgeRoutes,
} from "../src/core/traffic/GeographicTraffic.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { BOARDWALK_Y, roadSurfaceHeight } from "../src/core/world/roadSurface.js";

function installMockDocument() {
  const prevDoc = globalThis.document;
  globalThis.document = {
    createElement(tag) {
      if (tag === "canvas") {
        return {
          width: 256,
          height: 256,
          getContext() {
            return {
              fillStyle: "",
              strokeStyle: "",
              lineWidth: 1,
              font: "",
              textAlign: "center",
              fillRect() {},
              strokeRect() {},
              clearRect() {},
              beginPath() {},
              moveTo() {},
              lineTo() {},
              stroke() {},
              fill() {},
              roundRect() {},
              fillText() {},
              scale() {},
              measureText: () => ({ width: 50 }),
              createLinearGradient: () => ({ addColorStop() {} }),
            };
          },
        };
      }
      return {};
    },
  };
  return () => {
    globalThis.document = prevDoc;
  };
}

test("stitchBridgeRoutes unifies Phu Xuan ramps and main river span with continuous heights", () => {
  const stitched = stitchBridgeRoutes(mainRoads, {
    roadHeight: (r, i) => roadSurfaceHeight(r, i),
  });
  const phuXuan = stitched.find((r) => r.id === "phu-xuan-corridor");
  assert.ok(phuXuan, "phu-xuan-corridor route should be created");
  assert.equal(phuXuan.isBridgeRoute, true);
  assert.ok(Math.abs(phuXuan.heights[0] - 0.32) < 1e-6);
  assert.ok(Math.abs(phuXuan.heights.at(-1) - 0.32) < 1e-6);
  // Span points inside river must stay at 4.8m
  assert.ok(phuXuan.heights.some((h) => Math.abs(h - 4.8) < 1e-6));
  // Standalone Phu Xuan fragments must not remain un-stitched
  assert.equal(stitched.some((r) => [39420686, 39419121, 39453301].includes(r.id)), false);
});

test("boardwalk segments maintain uniform 0.68m height across under-bridge span", () => {
  for (const id of [683633953, 1167513733, 1167513732]) {
    const road = roads.find((r) => r.id === id);
    assert.ok(road, `OSM boardwalk way ${id} exists`);
    for (let i = 0; i < road.points.length; i++) {
      assert.equal(roadSurfaceHeight(road, i), BOARDWALK_Y);
    }
  }
});

test("Phu Xuan bridge, boardwalk structure, bridge traffic elevation, and canRide clearance work end-to-end", () => {
  const restoreDoc = installMockDocument();
  try {
    const scene = new THREE.Scene();
    const world = new GeographicWorld(scene);
    world.region = {
      id: "quoc-hoc",
      bounds: { minX: 450, maxX: 1200, minZ: -1300, maxZ: -700 },
      radius: 500,
      extensions: [],
      path: [
        [884.86, -865.65],
        [620.31, -1174.43],
      ],
    };
    world.build();

    // 1. Phu Xuan composite bridge built cleanly with river piers clear of boardwalk
    assert.ok(world.phuXuanBridge, "phuXuanBridge metadata created");
    assert.ok(world.phuXuanBridge.pierCount >= 5, "has twin-column river piers");
    assert.ok(world.phuXuanBridge.lightCount >= 16, "has curved street lights");
    const bridgeGroup = scene.getObjectByName("phu-xuan-bridge");
    assert.ok(bridgeGroup, "phu-xuan-bridge group added to scene");

    // 2. Lim-wood boardwalk built cleanly with lateral cross-bridges, planters & piers
    assert.ok(world.boardwalkView, "boardwalkView metadata created");
    assert.ok(world.boardwalkView.pierCount >= 20, "has river piles");
    assert.ok(world.boardwalkView.slatCount >= 100, "has dense timber slats");
    assert.ok(world.boardwalkView.planterCount >= 8, "has outer planter boxes");
    assert.equal(world.boardwalkView.lateralCount, 4);
    const boardwalkGroup = scene.getObjectByName("lim-wood-boardwalk");
    assert.ok(boardwalkGroup, "lim-wood-boardwalk group added to scene");

    // 3. InstancedMesh bounding spheres initialized on both structures
    for (const grp of [bridgeGroup, boardwalkGroup]) {
      grp.traverse((obj) => {
        if (obj.isInstancedMesh) {
          assert.ok(obj.boundingSphere && Number.isFinite(obj.boundingSphere.radius));
        }
      });
    }

    // 4. Cycling on Phu Xuan deck directly over boardwalk underpass (1167513733) is NOT blocked
    const underpass = roads.find((r) => r.id === 1167513733);
    const span = roads.find((r) => r.id === 39419121);
    const midBoardwalk = {
      x: (underpass.points[0].x + underpass.points[1].x) / 2,
      z: (underpass.points[0].z + underpass.points[1].z) / 2,
    };
    const overPoint = nearestPoint(midBoardwalk, span.points);
    const underSeg = world.boardwalkRails.find(
      (s) => nearestPoint(overPoint, [s.a, s.b]).distance < 4,
    );
    assert.ok(underSeg, "boardwalk rail segment crosses under Phu Xuan");
    const railCross = nearestPoint(overPoint, [underSeg.a, underSeg.b]);
    assert.equal(
      world.canRide(railCross.x, railCross.z, 4.8),
      true,
      "Bike at 4.8m on Phu Xuan should pass cleanly even directly above boardwalk rail below",
    );
    assert.equal(
      world.canRide(railCross.x, railCross.z, 0.68),
      false,
      "Bike at boardwalk height 0.68m is still blocked by the boardwalk rail",
    );
    assert.equal(
      world.canRide(overPoint.x, overPoint.z, 4.8),
      true,
      "Bike at 4.8m on Phu Xuan centerline should pass cleanly over boardwalk below",
    );

    // 5. All vehicles assigned to Phu Xuan bridge stay on deck/ramps and never drop under bridge
    const traffic = new GeographicTraffic(scene, world);
    const phuXuanActors = traffic.actors.filter(
      (a) => a.type !== "pedestrian" && a.road?.id === "phu-xuan-corridor",
    );
    assert.ok(phuXuanActors.length >= 2, "Phu Xuan should have vehicles");

    const dummyBike = {
      position: new THREE.Vector3(0, 0.32, 0),
      motion: { heading: 0, speed: 0 },
    };
    for (const actor of phuXuanActors) {
      // Test full sweep across the bridge progress [0.15..0.85] (main span) and ramps [0..1]
      for (let p = 0.02; p <= 0.98; p += 0.04) {
        actor.progress = p;
        traffic.place(actor);
        assert.ok(
          actor.mesh.position.y >= 0.319,
          `Actor y=${actor.mesh.position.y} fell below road height at p=${p}`,
        );
        if (p >= 0.16 && p <= 0.84) {
          assert.ok(
            actor.mesh.position.y >= 4.75,
            `Actor on Phu Xuan main span dropped under bridge: y=${actor.mesh.position.y} at p=${p}`,
          );
        }
      }
    }
    traffic.step(0.05, dummyBike);
    for (const actor of phuXuanActors) {
      assert.ok(Number.isFinite(actor.mesh.position.y));
    }
  } finally {
    restoreDoc();
  }
});
