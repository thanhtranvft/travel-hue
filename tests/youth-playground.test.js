import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  YouthPlayground,
  expandedYouthCampusRing,
  playgroundSpots,
} from "../src/modules/areas/quoc-hoc/view/YouthPlayground.js";
import {
  features,
  pointsOf,
  byId,
  roads,
} from "../src/core/shared/geography/map.js";
import {
  inside,
  nearestPoint,
} from "../src/core/shared/geography/geometry.js";
import { hitsCampusWall } from "../src/core/shared/architecture/CampusWalls.js";
import schools from "../src/modules/areas/quoc-hoc/data/school-gates.json" with { type: "json" };

test("Hai Ba Trung wall is red matching Quoc Hoc independently of gate color", () => {
  assert.equal(
    schools["hai-ba-trung"].wallColor,
    schools["quoc-hoc-school"].color,
  );
});

test("all playground equipment fits inside expanded youth campus and outside buildings", () => {
  const polygon = expandedYouthCampusRing(byId(695775607));
  const buildingPolygons = features
    .filter(
      (f) =>
        f.type === "way" &&
        f.tags?.building &&
        f.geometry?.length > 3 &&
        ![695775618, 695775619].includes(f.id),
    )
    .map((f) => ({ points: pointsOf(f) }));

  const spots = playgroundSpots(
    { renderRoads: roads, buildingPolygons },
    polygon,
  );
  assert.equal(spots.length, 16);
  assert.equal(new Set(spots.map((s) => s.type)).size, 8);
  for (const p of spots) {
    assert.ok(inside(p, polygon));
    assert.ok(nearestPoint(p, polygon).distance > p.radius);
    assert.ok(
      !buildingPolygons.some(
        (b) =>
          inside(p, b.points) ||
          nearestPoint(p, b.points).distance < p.radius,
      ),
    );
  }
});

test("YouthPlayground expands grounds cleanly, adds rides and animates train, cars, fish and flag", () => {
  const ring = expandedYouthCampusRing(byId(695775607));
  // Ensure expanded grounds stay clear of Lê Lợi, Trần Thúc Nhẫn & southern residential road 1572356605
  for (const roadId of [39413124, 1572356605]) {
    const road = roads.find((r) => r.id === roadId);
    assert.ok(road, `Missing road ${roadId}`);
    for (const v of ring) {
      assert.ok(
        nearestPoint(v, road.points).distance > 3.5,
        `Expanded Youth Center overlaps road ${roadId}`,
      );
    }
  }

  const buildingPolygons = features
    .filter(
      (f) =>
        f.type === "way" &&
        f.tags?.building &&
        f.geometry?.length > 3 &&
        ![695775618, 695775619].includes(f.id),
    )
    .map((f) => ({ points: pointsOf(f) }));

  const world = {
    scene: new THREE.Scene(),
    cameraObstacles: [],
    campusWallSegments: [],
    renderRoads: roads,
    buildingPolygons,
    treePositions: [],
  };
  const playground = new YouthPlayground(world);

  // Hero building & all requested amusement rides exist
  assert.ok(playground.campusGroup.getObjectByName("nha-thieu-nhi-hue-building"));
  assert.ok(playground.campusGroup.getObjectByName("youth-roller-coaster"));
  assert.ok(playground.campusGroup.getObjectByName("youth-multi-slide"));
  assert.ok(playground.campusGroup.getObjectByName("youth-kiddie-car-track"));
  assert.ok(playground.campusGroup.getObjectByName("youth-carnival-carousel"));
  assert.equal(playground.rockingFish.length, 6);
  assert.equal(playground.rollerCoasters[0].cars.length, 4);
  assert.equal(playground.carTracks[0].cars.length, 4);

  // Main entrance is open (does not collide with fence segments)
  assert.equal(hitsCampusWall(playground.entrance, playground.segments), false);

  // Courtyard path & rear promenade are rideable; main hall & lotus pond block riding
  const courtyardWalk = playground.toWorld(-4.85, 8.0);
  assert.equal(playground.canRide(courtyardWalk.x, courtyardWalk.z), true);
  assert.equal(playground.groundAt(courtyardWalk.x, courtyardWalk.z, 0.2), 0.22);
  assert.equal(playground.blocksGrass(courtyardWalk.x, courtyardWalk.z), true);
  assert.equal(playground.blocksTree(courtyardWalk.x, courtyardWalk.z), true);

  const pondCenter = playground.toWorld(-4.85, 20.5);
  assert.equal(playground.canRide(pondCenter.x, pondCenter.z), false);
  const hallCenter = playground.toWorld(-4.85, 48.0);
  assert.equal(playground.canRide(hallCenter.x, hallCenter.z), false);

  // Update moves roller coaster cars, kiddie cars, and rocking fish
  playground.update(0.5);
  const coasterPosA = playground.rollerCoasters[0].cars[0].position.clone();
  const kiddiePosA = playground.carTracks[0].cars[0].position.clone();
  const fishRotA = playground.rockingFish[0].rotation.x;

  playground.update(3.2);
  const coasterPosB = playground.rollerCoasters[0].cars[0].position.clone();
  const kiddiePosB = playground.carTracks[0].cars[0].position.clone();
  const fishRotB = playground.rockingFish[0].rotation.x;

  assert.ok(coasterPosA.distanceTo(coasterPosB) > 0.5);
  assert.ok(kiddiePosA.distanceTo(kiddiePosB) > 0.5);
  assert.notEqual(fishRotA, fishRotB);
});
