import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { stickInput } from "../src/core/input/touchMath.js";
import { RemotePlayers } from "../src/core/network/RemotePlayers.js";
import { TouringBike } from "../src/core/vehicle/TouringBike.js";
import { optimizeMobileStaticScene } from "../src/core/rendering/MobileStaticScene.js";
import { trafficBoard } from "../src/core/world/TrafficBoard.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";

function withMockCanvas(fn) {
  const prevDocument = globalThis.document;
  globalThis.document = {
    createElement(tag) {
      if (tag !== "canvas") return {};
      return {
        width: 0,
        height: 0,
        getContext() {
          return {
            fillStyle: "",
            strokeStyle: "",
            lineWidth: 1,
            font: "",
            textAlign: "",
            textBaseline: "",
            scale() {},
            fillRect() {},
            strokeRect() {},
            fillText() {},
            measureText(text) {
              return { width: String(text || "").length * 10 };
            },
          };
        },
      };
    },
  };
  try {
    return fn();
  } finally {
    globalThis.document = prevDocument;
  }
}

test("stickInput guards non-finite deltas and zero/negative pad radius", () => {
  assert.deepEqual(stickInput(10, -10, 0), {
    x: 0,
    y: 0,
    throttle: 0,
    steer: 0,
  });
  assert.deepEqual(stickInput(NaN, 5, 45), {
    x: 0,
    y: 0,
    throttle: 0,
    steer: 0,
  });
  assert.deepEqual(stickInput(5, Infinity, 45), {
    x: 0,
    y: 0,
    throttle: 0,
    steer: 0,
  });
});

test("RemotePlayers skips GLB model load on mobile and ignores non-finite poses/dt", () => {
  const originalLoad = TouringBike.prototype.loadDetailedModel;
  let detailedLoads = 0;
  TouringBike.prototype.loadDetailedModel = async () => {
    detailedLoads++;
  };
  try {
    withMockCanvas(() => {
      const rp = new RemotePlayers({ mobile: true });
      rp.sync(
        [
          {
            id: "self",
            connected: true,
            ready: true,
            region: "quoc-hoc",
            name: "Me",
            color: "#247bba",
            x: 0,
            y: 0.25,
            z: 0,
            heading: 0,
            speed: 0,
            lean: 0,
          },
          {
            id: "peer-1",
            connected: true,
            ready: true,
            region: "quoc-hoc",
            name: "Bạn 1",
            color: "#c45b4d",
            x: 2,
            y: 0.25,
            z: 4,
            heading: 0.5,
            speed: 3,
            lean: 0.05,
          },
        ],
        "self",
      );
      assert.equal(detailedLoads, 0);
      assert.equal(rp.entries.size, 1);

      const bike = rp.entries.get("peer-1").bike;
      assert.ok(bike.children.length > 0);

      rp.update(0.016, "quoc-hoc", { x: 0, z: 0 });
      assert.equal(bike.visible, true);

      rp.update(0, "quoc-hoc", { x: 0, z: 0 });
      rp.update(NaN, "quoc-hoc", { x: 0, z: 0 });

      rp.sync(
        [
          {
            id: "peer-1",
            connected: true,
            ready: true,
            region: "quoc-hoc",
            name: "Bạn 1",
            color: "#c45b4d",
            x: NaN,
            y: 0.25,
            z: 4,
            heading: 0,
            speed: 0,
            lean: 0,
          },
        ],
        "self",
      );
      rp.update(0.016, "quoc-hoc", { x: 0, z: 0 });
      assert.equal(bike.visible, false);
      assert.ok(Number.isFinite(bike.position.x));
    });
  } finally {
    TouringBike.prototype.loadDetailedModel = originalLoad;
  }
});

test("optimizeMobileStaticScene preserves unrelated obstacles when batching repeated items", () => {
  const scene = new THREE.Scene();
  const sharedObstacle = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "#445566" }),
  );
  const separateObstacle = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    new THREE.MeshStandardMaterial({ color: "#667788", transparent: true }),
  );
  scene.add(sharedObstacle, separateObstacle);

  const world = {
    scene,
    cameraObstacles: [sharedObstacle, separateObstacle],
    pedestrianLife: { people: [] },
    youthPlayground: { equipment: [] },
    propertyEnclosures: { parking: { cars: [] } },
  };
  optimizeMobileStaticScene(world);
  assert.ok(world.cameraObstacles.includes(separateObstacle));
  assert.ok(!world.cameraObstacles.includes(sharedObstacle));
});

test("trafficBoard evicts cached material when disposed", () => {
  withMockCanvas(() => {
    const first = trafficBoard("Cầu Ga", "Lối rẽ", 3.4);
    const second = trafficBoard("Cầu Ga", "Lối rẽ", 3.4);
    assert.equal(first.material, second.material);

    first.material.dispose();
    const third = trafficBoard("Cầu Ga", "Lối rẽ", 3.4);
    assert.notEqual(third.material, first.material);
    third.material.dispose();
  });
});

test("groundAt preserves elevated bridge height when referenceY is supplied", () => {
  const scene = new THREE.Scene();
  const world = new GeographicWorld(scene);
  const lowRoad = {
    id: 1,
    tags: { highway: "residential" },
    points: [
      { x: 0, z: -10 },
      { x: 0, z: 10 },
    ],
  };
  const bridgeRoad = {
    id: 2,
    tags: { highway: "secondary", bridge: "yes" },
    points: [
      { x: -10, z: 0 },
      { x: 10, z: 0 },
    ],
  };
  world.roadHeight = (road) => (road.id === 2 ? 6.5 : 0.23);
  world.roadGrid.set("0,0", [
    { a: lowRoad.points[0], b: lowRoad.points[1], road: lowRoad, index: 1 },
    {
      a: bridgeRoad.points[0],
      b: bridgeRoad.points[1],
      road: bridgeRoad,
      index: 1,
    },
  ]);

  assert.equal(world.groundAt(0, 0), 0.23);
  assert.equal(world.groundAt(0, 0, 6.4), 6.5);
});
