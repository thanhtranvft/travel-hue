import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { roads, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint, inside } from "../src/core/shared/geography/geometry.js";
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
      bounds: { minX: 450, maxX: 1400, minZ: -1400, maxZ: -700 },
      radius: 500,
      extensions: [],
      path: [
        [884.86, -865.65],
        [1352.58, -1339.96],
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

    // 6. Cầu Gỗ Lim deck height never clips down to 0.07m/0.12m across any segment or corner
    for (const id of [683633953, 1167513733, 1167513732]) {
      const road = roads.find((r) => r.id === id);
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1];
        const b = road.points[i];
        const mx = (a.x + b.x) / 2;
        const mz = (a.z + b.z) / 2;
        const yNoRef = world.groundAt(mx, mz);
        const yFromLow = world.groundAt(mx, mz, 0.12);
        assert.ok(
          yNoRef >= BOARDWALK_Y + 0.004 && yFromLow >= BOARDWALK_Y + 0.004,
          `Boardwalk ${id} seg ${i} stays flush on deck (yNoRef=${yNoRef}, yFromLow=${yFromLow})`,
        );
        assert.equal(world.canRide(mx, mz, yNoRef), true);
      }
    }
    // Check river water 2.7m outside boardwalk railing on segment 683633953 is NEVER rideable
    const riverWalkRoad = roads.find((r) => r.id === 683633953);
    const ra = riverWalkRoad.points[0];
    const rb = riverWalkRoad.points[1];
    const rLen = Math.hypot(rb.x - ra.x, rb.z - ra.z) || 1;
    const rnx = -(rb.z - ra.z) / rLen;
    const rnz = (rb.x - ra.x) / rLen;
    const rmx = (ra.x + rb.x) / 2;
    const rmz = (ra.z + rb.z) / 2;
    for (const side of [-1, 1]) {
      const ox = rmx + rnx * side * 2.7;
      const oz = rmz + rnz * side * 2.7;
      if (world.riverRings.some((ring) => inside({ x: ox, z: oz }, ring))) {
        assert.equal(world.boardwalkView.queryDeck(ox, oz).onBoardwalk, false);
        assert.equal(world.canPlaceCharm(ox, oz), false, `Outside boardwalk water at (${ox}, ${oz}) should never allow charms`);
      }
    }

    // 7. Extended boardwalk reaches past Phu Xuan and under Truong Tien with hawkers and viewing bays
    assert.ok(world.boardwalkView.totalLateralCount >= 8, "includes 4 extended lateral connectors");
    assert.ok(world.boardwalkView.viewingBayCount >= 3, "has semi-circular riverfront viewing bays");
    const sampleBay =
      world.boardwalkView.viewingBays.find(
        (b) => b.x >= world.bounds.minX + 10 && b.x <= world.bounds.maxX - 10,
      ) || world.boardwalkView.viewingBays.at(-1);
    assert.ok(sampleBay, "has viewing bay inside boardwalk test region");
    const bayCenterPt = {
      x: sampleBay.x + sampleBay.nx * sampleBay.side * (world.boardwalkView.halfWidth + 1.2),
      z: sampleBay.z + sampleBay.nz * sampleBay.side * (world.boardwalkView.halfWidth + 1.2),
    };
    const bayQuery = world.boardwalkView.queryDeck(bayCenterPt.x, bayCenterPt.z);
    assert.equal(bayQuery.onBay, true);
    assert.equal(bayQuery.insideDeck, true);
    assert.equal(bayQuery.insideSafeMargin, true);
    assert.equal(world.canRide(bayCenterPt.x, bayCenterPt.z, BOARDWALK_Y), true);

    const bayRailPt = {
      x: sampleBay.x + sampleBay.nx * sampleBay.side * (world.boardwalkView.halfWidth - 0.1 + sampleBay.radius - 0.12),
      z: sampleBay.z + sampleBay.nz * sampleBay.side * (world.boardwalkView.halfWidth - 0.1 + sampleBay.radius - 0.12),
    };
    assert.equal(
      world.canRide(bayRailPt.x, bayRailPt.z, BOARDWALK_Y),
      false,
      "Curved viewing bay railing blocks riding off into river",
    );

    assert.ok(
      world.boardwalkView.mainPoints.some((p) => p.x >= 1260 && p.z <= -1270),
      "boardwalk spans continuously past Cầu Phú Xuân to Cầu Tràng Tiền",
    );
    assert.ok(
      world.boardwalkView.vendorPoints.filter((v) => v.vendorType === "hawker-vendor").length >= 3,
      "under-bridge hawker vendors are present along extended boardwalk",
    );

    // 8. West shore ramp slopes smoothly down to PhuXuanParkWalk ironwood promenade with zero sudden cliff
    const westTip = world.boardwalkView.mainPoints.at(-1);
    const westPrev = world.boardwalkView.mainPoints.at(-2);
    const wLen = Math.hypot(westTip.x - westPrev.x, westTip.z - westPrev.z) || 1;
    const wtx = (westTip.x - westPrev.x) / wLen;
    const wtz = (westTip.z - westPrev.z) / wLen;
    let prevWestY = world.groundAt(westTip.x, westTip.z, 0.68);
    for (let t = 0.25; t <= 4.0; t += 0.25) {
      const px = westTip.x + wtx * t;
      const pz = westTip.z + wtz * t;
      const y = world.groundAt(px, pz, prevWestY);
      assert.equal(world.canRide(px, pz, y), true, `West ramp exit at t=${t} must be rideable`);
      assert.ok(
        Math.abs(y - prevWestY) <= 0.08,
        `West ramp step delta too large at t=${t}: ${prevWestY} -> ${y}`,
      );
      prevWestY = y;
    }

    // 9. East shore ramp curves onto dry land in Công viên 3/2 (footway 257257958) without ending in river
    const eastLanding = { x: 1352.58, z: -1339.96 };
    const eastLandingY = world.groundAt(eastLanding.x, eastLanding.z, 0.3);
    assert.ok(eastLandingY >= 0.22 && eastLandingY <= 0.26, `East ramp lands cleanly at ${eastLandingY}`);
    assert.equal(world.canRide(eastLanding.x, eastLanding.z, eastLandingY), true, "East ramp landing on dry land is rideable");
    assert.equal(world.canRide(1344.8, -1350.6, BOARDWALK_Y), true, "East ramp mouth is open (not blocked by boardwalk rail)");

    // 10. Continuous shoreline wooden boardwalk ramps up cleanly into Cầu Gỗ Lim west mouth (lx ≈ 437.43, lz = -20.4)
    if (world.biaPark?.toWorld) {
      let prevShoreY = null;
      for (const lx of [432.0, 434.5, 436.5, 437.3, 437.5, 438.4, 439.5]) {
        const pt = world.biaPark.toWorld(lx, -20.4);
        const y = world.groundAt(pt.x, pt.z, prevShoreY ?? 0.5);
        assert.equal(world.canRide(pt.x, pt.z, y), true, `Shoreline -> Cau Go Lim join lx=${lx} must be open & rideable`);
        if (prevShoreY !== null) {
          assert.ok(Math.abs(y - prevShoreY) <= 0.14, `Smooth ramp height jump at lx=${lx}: ${prevShoreY} -> ${y}`);
        }
        prevShoreY = y;
      }
      // Opposite (river) side railing stays solid
      const riverRailPt = world.biaPark.toWorld(441.55, -20.4);
      assert.equal(world.canRide(riverRailPt.x, riverRailPt.z, BOARDWALK_Y), false, "River-side Cau Go Lim railing stays solid");
    }
  } finally {
    restoreDoc();
  }
});
