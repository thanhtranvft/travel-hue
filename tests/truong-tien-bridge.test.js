import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { roads, mainRoads } from "../src/core/shared/geography/map.js";
import {
  GeographicTraffic,
  stitchBridgeRoutes,
} from "../src/core/traffic/GeographicTraffic.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import {
  ROAD_Y,
  TRUONG_TIEN_CAMBER,
  TRUONG_TIEN_ID,
  TRUONG_TIEN_WALK_LIFT,
  roadSurfaceHeight,
  truongTienElevation,
} from "../src/core/world/roadSurface.js";
import { roadWidth } from "../src/core/world/roadProfile.js";
import {
  TRUONG_TIEN_ARCH_COUNT,
  TRUONG_TIEN_PIER_COUNT,
  TRUONG_TIEN_SPANS,
  truongTienDeckQuery,
  truongTienMetrics,
} from "../src/modules/areas/truong-tien/view/BridgeView.js";

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

test("Cầu Trường Tiền elevation curve is flush at both ends and crowns smoothly mid-river", () => {
  assert.ok(Math.abs(truongTienElevation(0) - ROAD_Y) < 1e-10);
  assert.ok(Math.abs(truongTienElevation(1) - ROAD_Y) < 1e-10);
  assert.ok(
    Math.abs(truongTienElevation(0.5) - (ROAD_Y + TRUONG_TIEN_CAMBER)) < 1e-10,
  );
  const road = roads.find((r) => r.id === TRUONG_TIEN_ID);
  assert.equal(roadWidth(road), 14);
  assert.equal(roadSurfaceHeight(road, 0), ROAD_Y);
  assert.equal(roadSurfaceHeight(road, road.points.length - 1), ROAD_Y);
});

test("Cầu Trường Tiền builds 6 vài 12 nhịp, 5 masonry river piers, 2 outer walkways, 10 balconies, dragon boats & aligned traffic", () => {
  const restoreDoc = installMockDocument();
  try {
    const scene = new THREE.Scene();
    const world = new GeographicWorld(scene);
    const ttRoad = roads.find((r) => r.id === TRUONG_TIEN_ID);
    const p0 = ttRoad.points[0];
    const p2 = ttRoad.points.at(-1);
    world.region = {
      id: "truong-tien",
      bounds: { minX: 940, maxX: 1370, minZ: -1590, maxZ: -1178 },
      radius: 65,
      extensions: [],
      path: [
        [p2.x, p2.z],
        [p0.x, p0.z],
      ],
    };
    world.build();

    assert.ok(world.truongTienBridge, "truongTienBridge metadata exists");
    assert.equal(world.truongTienBridge.spanCount, TRUONG_TIEN_SPANS);
    assert.equal(world.truongTienBridge.archCount, TRUONG_TIEN_ARCH_COUNT);
    assert.equal(world.truongTienBridge.pierCount, TRUONG_TIEN_PIER_COUNT);
    assert.equal(world.truongTienBridge.balconyCount, 10);
    assert.ok(
      world.truongTienBridge.boatCount >= 3,
      "traditional Hue dragon boats float on Huong River",
    );

    const group = scene.getObjectByName("truong-tien-bridge");
    assert.ok(group, "truong-tien-bridge group added to scene");
    let instancedCount = 0;
    group.traverse((obj) => {
      if (obj.isInstancedMesh) {
        instancedCount++;
        assert.ok(
          obj.boundingSphere && Number.isFinite(obj.boundingSphere.radius),
          "InstancedMesh has initialized boundingSphere",
        );
      }
    });
    assert.ok(instancedCount >= 10, "structural bridge members use InstancedMesh");

    // Verify deck query & cycling access across roadway, trusses, outer walkways, and balconies
    const m = truongTienMetrics(ttRoad);
    const midS = m.length * 0.5;
    const midX = m.a.x + m.tx * midS;
    const midZ = m.a.z + m.tz * midS;
    const expectedMidY = truongTienElevation(0.5);

    assert.equal(world.canRide(midX, midZ, expectedMidY), true, "central 4-lane roadway rideable");
    assert.ok(Math.abs(world.groundAt(midX, midZ, expectedMidY) - expectedMidY) < 0.05);
    // Outer driving lane (±4.9m) inside 4-lane roadway is also rideable
    for (const side of [-1, 1]) {
      const lx = midX + m.nx * side * 4.9;
      const lz = midZ + m.nz * side * 4.9;
      assert.equal(world.canRide(lx, lz, expectedMidY), true, `outer driving lane side=${side} rideable`);
    }

    // Steel truss line blocks sideways clipping (±7.18m)
    const trussPt = { x: midX + m.nx * 7.18, z: midZ + m.nz * 7.18 };
    assert.equal(world.canRide(trussPt.x, trussPt.z, expectedMidY), false);

    // Both outer pedestrian lanes (±8.55m) are walkable/rideable at +0.08m lift
    for (const side of [-1, 1]) {
      const wx = midX + m.nx * side * 8.55;
      const wz = midZ + m.nz * side * 8.55;
      assert.equal(
        world.canRide(wx, wz, expectedMidY + TRUONG_TIEN_WALK_LIFT),
        true,
        `outer pedestrian lane side=${side} should be rideable`,
      );
      assert.ok(
        Math.abs(
          world.groundAt(wx, wz, expectedMidY + TRUONG_TIEN_WALK_LIFT) -
            (expectedMidY + TRUONG_TIEN_WALK_LIFT),
        ) < 0.05,
      );
    }

    // Viewing balconies over each of the 5 river piers extend safely to ±10.35m
    const pier3S = m.pierStations[2];
    const pier3Base = { x: m.a.x + m.tx * pier3S, z: m.a.z + m.tz * pier3S };
    const balcPt = { x: pier3Base.x + m.nx * 10.35, z: pier3Base.z + m.nz * 10.35 };
    const qBalc = truongTienDeckQuery(ttRoad, balcPt.x, balcPt.z);
    assert.equal(qBalc.onBridge, true);
    assert.equal(qBalc.allowed, true, "viewing balcony over pier 3 is accessible");

    // Outer balustrade prevents falling off the bridge into river (mid-span, away from pier balcony)
    const bayMidS = 12 + 2.5 * m.spanLen;
    const bayMidX = m.a.x + m.tx * bayMidS;
    const bayMidZ = m.a.z + m.tz * bayMidS;
    const riverDropPt = { x: bayMidX + m.nx * 10.6, z: bayMidZ + m.nz * 10.6 };
    assert.equal(world.canRide(riverDropPt.x, riverDropPt.z, expectedMidY), false);

    // Verify subdivided traffic track and 4-lane vehicle/pedestrian placement
    const stitched = stitchBridgeRoutes(mainRoads, world);
    const bridgeRoute = stitched.find((r) => r.id === TRUONG_TIEN_ID);
    assert.ok(bridgeRoute.points.length >= 20, "Truong Tien track subdivided for smooth arch curve");

    const traffic = new GeographicTraffic(scene, world);
    const ttVehicles = traffic.actors.filter(
      (a) => a.type !== "pedestrian" && a.road?.id === TRUONG_TIEN_ID,
    );
    assert.ok(ttVehicles.length >= 1, "vehicles spawn on Truong Tien bridge");
    for (const actor of ttVehicles) {
      for (let p = 0.05; p <= 0.95; p += 0.15) {
        actor.progress = p;
        traffic.place(actor);
        const expected = truongTienElevation(p);
        assert.ok(
          Math.abs(actor.mesh.position.y - expected) < 0.08,
          `Vehicle y=${actor.mesh.position.y} matches deck ${expected}`,
        );
        const rx = actor.mesh.position.x - m.a.x;
        const rz = actor.mesh.position.z - m.a.z;
        const lat = Math.abs(rx * m.nx + rz * m.nz);
        assert.ok(lat < 6.4, `Vehicle lat=${lat} stays cleanly inside 4-lane 2-way roadway`);
      }
    }

    // Verify PedestrianLife places strollers on both outer pedestrian lanes of Truong Tien
    const ttWalkers = world.pedestrianLife.people.filter(
      (p) => p.road?.id === TRUONG_TIEN_ID,
    );
    assert.ok(ttWalkers.length >= 2, "PedestrianLife spawns walkers on Truong Tien walkways");
    for (const walker of ttWalkers) {
      const rx = walker.origin.x - m.a.x;
      const rz = walker.origin.z - m.a.z;
      const lat = Math.abs(rx * m.nx + rz * m.nz);
      assert.ok(
        lat >= 7.5 && lat <= 9.6,
        `Pedestrian lat=${lat} walks cleanly on outer pedestrian lane`,
      );
    }

    // Verify player groundAt across full Truong Tien span (including s=30 and s=370 over underpass footpaths)
    for (const s of [15, 30, 60, 120, 200, 280, 350, 370, 390]) {
      const sx = m.a.x + m.tx * s;
      const sz = m.a.z + m.tz * s;
      const expected = truongTienElevation(s / m.length);
      const yNoRef = world.groundAt(sx, sz);
      const yApproach = world.groundAt(sx, sz, 0.32);
      assert.ok(
        yNoRef >= expected + 0.015 && yApproach >= expected + 0.015,
        `Truong Tien roadway s=${s} clears asphalt surface (${yNoRef}, ${yApproach} >= ${expected + 0.015})`,
      );
      for (const side of [-1, 1]) {
        const wx = sx + m.nx * side * 8.55;
        const wz = sz + m.nz * side * 8.55;
        const wyNoRef = world.groundAt(wx, wz);
        const wyApproach = world.groundAt(wx, wz, 0.32);
        assert.ok(
          wyNoRef >= expected + TRUONG_TIEN_WALK_LIFT + 0.004 &&
            wyApproach >= expected + TRUONG_TIEN_WALK_LIFT + 0.004,
          `Truong Tien walkway s=${s} side=${side} clears stone deck (${wyNoRef}, ${wyApproach})`,
        );
      }
    }
  } finally {
    restoreDoc();
  }
});

test("Truong Tien blocks crossing pedestrians and builds extended Lim boardwalk, under-bridge promenade, hawkers, right café, 4-way signal & Morin Hotel", async () => {
  const { loadGeography } = await import("../src/modules/areas/AreaModel.js");
  const { getMainRoads } = await import("../src/core/shared/geography/activeGeography.js");
  const { BOARDWALK_Y } = await import("../src/core/world/roadSurface.js");
  const { TRUONG_TIEN_NO_CROSS_IDS } = await import("../src/core/world/PedestrianLife.js");
  const { VendorCalls } = await import("../src/core/world/VendorCalls.js");
  const {
    NGA4_MORIN_CENTER,
    NGA4_SIGNAL_CORNERS,
    PROMENADE_Y,
    TRANG_TIEN_CAFE_CENTER,
    UNDER_BRIDGE_PROMENADE_POINTS,
  } = await import("../src/modules/areas/truong-tien/view/TruongTienSurroundings.js");

  const restoreDoc = installMockDocument();
  try {
    const region = await loadGeography("truong-tien");
    const scene = new THREE.Scene();
    const world = new GeographicWorld(scene);
    world.region = region;
    world.build();

    // 1. Extended Cầu Gỗ Lim reaches past Cầu Phú Xuân, under Cầu Tràng Tiền & into Công viên 3/2
    assert.ok(world.boardwalkView, "extended boardwalk builds in truong-tien region");
    assert.ok(
      world.boardwalkView.mainPoints.some((p) => p.x >= 1330 && p.z <= -1340),
      "Cầu Gỗ Lim extends through under Cầu Tràng Tiền into Công viên 3 Tháng 2",
    );
    assert.ok(world.boardwalkView.totalLateralCount >= 8);

    const ttRoad = getMainRoads().find((r) => r.id === TRUONG_TIEN_ID);
    const m = truongTienMetrics(ttRoad);
    // Boardwalk under-bridge crossing point at (1264.5, -1275.5)
    const underBwPt = { x: 1264.5, z: -1275.5 };
    const qUnderBw = truongTienDeckQuery(ttRoad, underBwPt.x, underBwPt.z);
    assert.ok(
      qUnderBw.deckY - BOARDWALK_Y >= 2.2,
      `Cầu Tràng Tiền clearance above boardwalk (${qUnderBw.deckY - BOARDWALK_Y}m) >= 2.2m`,
    );
    assert.ok(
      Math.abs(world.groundAt(underBwPt.x, underBwPt.z, BOARDWALK_Y) - (BOARDWALK_Y + 0.008)) < 0.03,
      "groundAt at boardwalk height under Cầu Tràng Tiền stays on boardwalk",
    );
    assert.equal(world.canRide(underBwPt.x, underBwPt.z, BOARDWALK_Y), true);

    // 2. Under-bridge lakeside promenade, benches, lamps, and strollers
    assert.ok(world.truongTienSurroundings, "TruongTienSurroundings built");
    const promMid = UNDER_BRIDGE_PROMENADE_POINTS[2];
    assert.ok(Math.abs(world.groundAt(promMid.x, promMid.z, PROMENADE_Y) - PROMENADE_Y) < 0.03);
    assert.equal(world.canRide(promMid.x, promMid.z, PROMENADE_Y), true);

    // 3. Under-bridge hawkers emit 'Ăn sáng con ơi' ONLY at ground level, NOT on high bridge deck
    const vendors = world.getVendorPoints();
    const underHawkers = vendors.filter((v) => v.vendorType === "hawker-vendor");
    assert.ok(underHawkers.length >= 3, "under-bridge hawkers exposed via getVendorPoints()");
    const calls = new VendorCalls();
    const targetHawker = underHawkers[0];
    assert.equal(
      calls.update(1, { position: { x: targetHawker.x, y: 3.82, z: targetHawker.z } }, vendors),
      null,
      "bridge deck cyclist above hawker should not trigger under-bridge call",
    );
    const triggered = calls.update(
      2,
      { position: { x: targetHawker.x + 2, y: PROMENADE_Y, z: targetHawker.z + 2 } },
      vendors,
    );
    assert.equal(triggered?.vendorType, "hawker-vendor");

    // 4. Zero pedestrians cut across Cầu Tràng Tiền central roadway or crossing footways
    const traffic = new GeographicTraffic(scene, world);
    const badTrafficPeds = traffic.actors.filter(
      (a) =>
        a.type === "pedestrian" &&
        (a.road?.id === TRUONG_TIEN_ID || TRUONG_TIEN_NO_CROSS_IDS.has(a.road?.id)),
    );
    assert.equal(badTrafficPeds.length, 0, "no GeographicTraffic pedestrians cross Cầu Tràng Tiền");

    for (const person of world.pedestrianLife.people) {
      assert.equal(
        TRUONG_TIEN_NO_CROSS_IDS.has(person.road?.id),
        false,
        `PedestrianLife walker road ${person.road?.id} must not be a Cầu Tràng Tiền crossing way`,
      );
      if (person.road?.id === TRUONG_TIEN_ID) {
        const q = truongTienDeckQuery(ttRoad, person.origin.x, person.origin.z);
        assert.ok(Math.abs(q.lat) >= 7.5, "Truong Tien walkers stay strictly on outer pedestrian lanes");
      }
    }
    assert.ok(
      world.pedestrianLife.people.some((p) => p.underBridgePromenade),
      "dedicated strollers walk the under-bridge riverside promenade & extended boardwalk",
    );

    // 5. Right-side café, 4-way traffic signal intersection & Khách sạn Saigon Morin behind spawn
    assert.ok(world.landmarks.has("trang-tien-cafe"), "right-side café landmark registered");
    assert.equal(
      world.canRide(TRANG_TIEN_CAFE_CENTER.x - 2, TRANG_TIEN_CAFE_CENTER.z - 2, PROMENADE_Y),
      true,
      "outdoor riverside café patio is rideable",
    );
    assert.equal(
      world.canRide(TRANG_TIEN_CAFE_CENTER.x + 2, TRANG_TIEN_CAFE_CENTER.z + 2, PROMENADE_Y),
      false,
      "café pavilion structure blocks riding",
    );
    assert.ok(
      scene.getObjectByName("trang-tien-riverside-cafe"),
      "right-side café 3D group exists in scene",
    );

    assert.equal(world.truongTienSurroundings.signalControllers.length, 4, "4 corner signals at Ngã 4");
    for (const c of NGA4_SIGNAL_CORNERS) {
      assert.ok(Math.hypot(c.x - NGA4_MORIN_CENTER.x, c.z - NGA4_MORIN_CENTER.z) > 15);
    }
    world.truongTienSurroundings.update(1.0);
    const nsPhase1 = world.truongTienSurroundings.signalControllers[2].heads[0][2].color.getHex();
    world.truongTienSurroundings.update(7.0);
    const nsPhase7 = world.truongTienSurroundings.signalControllers[2].heads[0][2].color.getHex();
    assert.notEqual(nsPhase1, nsPhase7, "Ngã 4 traffic signal animates between green and red");

    assert.ok(world.landmarks.has("saigon-morin"), "Khách sạn Saigon Morin landmark registered");
    assert.equal(world.canRide(1320, -1140, 0.32), false, "Khách sạn Saigon Morin interior blocks cycling");
  } finally {
    restoreDoc();
  }
});
