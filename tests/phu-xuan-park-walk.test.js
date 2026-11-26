import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { sites, river, mainRoads } from "../src/core/shared/geography/map.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";
import { createBiaQuocHocPark } from "../src/modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { createFireflyTreePark } from "../src/modules/areas/quoc-hoc/view/FireflyTreePark.js";
import { createFountainPark } from "../src/modules/areas/quoc-hoc/view/FountainPark.js";
import { createPhuXuanParkWalk } from "../src/modules/areas/quoc-hoc/view/PhuXuanParkWalk.js";
import {
  applyWorldPlanarUVs,
  createManicuredLawnMaterial,
  createManicuredLawnTexture,
} from "../src/core/world/turfTextures.js";
import { LivingGrass } from "../src/core/world/LivingLandscape.js";

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

test("FountainPark wings and PhuXuanParkWalk form unbroken footpaths to Cầu Phú Xuân without encroaching on carriageways", () => {
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
    const fireflyPark = createFireflyTreePark(world, biaSite, heading);
    const fountainPark = createFountainPark(world, biaSite, heading, {
      ubnd: ubndSite,
    });
    const phuXuanWalk = createPhuXuanParkWalk(world, biaSite, heading);

    assert.ok(phuXuanWalk.group.getObjectByName("phu-xuan-park-walk") || phuXuanWalk.group.name === "phu-xuan-park-walk");

    // FountainPark East wing footpath meets PhuXuanParkWalk at lx = 366 flush at y = 0.24
    const wingJoinW = biaPark.toWorld(350, 6.5);
    assert.equal(fountainPark.groundAt(wingJoinW.x, wingJoinW.z, 0.2), 0.24);
    assert.equal(fountainPark.canRide(wingJoinW.x, wingJoinW.z), true);

    // Key garden footpath nodes & circular Phu Xuan garden plaza along lx = 366..536
    for (const [lx, lz] of [
      [366, 6.5],
      [396, 17.5],
      [439.5, 18.0],
      [464, 18.0],
      [488.7, 18.1],
      [511.5 + 10, 17.1], // circular walk ring
      [531.6, 18.4],      // east approach path toward Cầu Phú Xuân
      [535.5, -0.5],      // north-east waterfront link at Phú Xuân foot
    ]) {
      const p = biaPark.toWorld(lx, lz);
      assert.equal(
        phuXuanWalk.groundAt(p.x, p.z, 0.2),
        0.24,
        `Footpath (${lx}, ${lz}) should be paved at 0.24m`,
      );
      assert.equal(
        phuXuanWalk.canRide(p.x, p.z),
        true,
        `Footpath (${lx}, ${lz}) should be rideable`,
      );
      assert.equal(phuXuanWalk.blocksGrass(p.x, p.z), true);
    }

    // Continuous 0.256m ironwood riverfront promenade extending across all 4 parks to Cầu Gỗ Lim
    for (const [label, park, lx, lz] of [
      ["BiaQuocHocPark", biaPark, 50, -13.3],
      ["FireflyTreePark", fireflyPark, 144, -13.3],
      ["FountainPark", fountainPark, 292, -14.2],
      ["PhuXuanParkWalk-west", phuXuanWalk, 410, -14.2],
      ["PhuXuanParkWalk-east", phuXuanWalk, 470, -13.6],
    ]) {
      const p = biaPark.toWorld(lx, lz);
      assert.equal(
        park.groundAt(p.x, p.z, 0.2),
        0.256,
        `${label} ironwood riverwalk (${lx}, ${lz}) should sit at 0.256m`,
      );
      assert.equal(park.canRide(p.x, p.z), true, `${label} ironwood riverwalk should be rideable`);
      assert.equal(park.blocksGrass(p.x, p.z), true, `${label} ironwood riverwalk should block wild grass`);
    }

    // Central Lotus lantern plinth at (511.5, 17.1) blocks riding directly through column
    const centerPlinth = biaPark.toWorld(511.5, 17.1);
    assert.equal(phuXuanWalk.canRide(centerPlinth.x, centerPlinth.z), false);

    // Lateral Cầu Gỗ Lim ramps yield groundAt riverward of ironwood promenade
    const limRampWest = biaPark.toWorld(439.5, -17.0);
    const limRampEast = biaPark.toWorld(535.0, -16.0);
    assert.equal(phuXuanWalk.groundAt(limRampWest.x, limRampWest.z, 0.5), null);
    assert.equal(phuXuanWalk.groundAt(limRampEast.x, limRampEast.z, 0.5), null);

    // Axial link from mid-park roundabout (439.5, -2.4) to ironwood riverwalk (439.5, -14.0) is smoothly paved & rideable
    const westApproachMid = biaPark.toWorld(439.5, -10.5);
    assert.equal(phuXuanWalk.groundAt(westApproachMid.x, westApproachMid.z, 0.24), 0.24);
    assert.equal(phuXuanWalk.canRide(westApproachMid.x, westApproachMid.z), true);
    const westIronwoodJoin = biaPark.toWorld(439.5, -14.0);
    assert.equal(phuXuanWalk.groundAt(westIronwoodJoin.x, westIronwoodJoin.z, 0.25), 0.256);
    assert.equal(phuXuanWalk.canRide(westIronwoodJoin.x, westIronwoodJoin.z), true);

    // Slip road 1169319988 & Cầu Phú Xuân carriageway remain completely untouched
    for (const [lx, lz] of [
      [539.4, 20.7],
      [543.9, 8.5],
      [546.5, 15.0],
    ]) {
      const roadPt = biaPark.toWorld(lx, lz);
      assert.equal(phuXuanWalk.groundAt(roadPt.x, roadPt.z, 0.32), null);
      assert.equal(phuXuanWalk.canRide(roadPt.x, roadPt.z), null);
    }

    // Upper riverfront promenade uses brick-cement material & shoreline boardwalk uses ironwood
    for (const parkGrp of [biaPark.group, fireflyPark.group, fountainPark.group, phuXuanWalk.group]) {
      let hasBrickCement = false;
      let hasIronwood = false;
      parkGrp.traverse((obj) => {
        if (!obj.isMesh) return;
        const m = Array.isArray(obj.material) ? obj.material[0] : obj.material;
        if (m?.userData?.surfaceKind === "brick-cement") hasBrickCement = true;
        if (m?.userData?.surfaceKind === "ironwood") hasIronwood = true;
      });
      assert.equal(hasBrickCement, true, `${parkGrp.name} must render upper promenade with brick-cement material`);
      if (parkGrp !== biaPark.group) {
        assert.equal(hasIronwood, true, `${parkGrp.name} must render shoreline boardwalk with ironwood material`);
      }
    }

    // Two symmetrical flanking tree rows block walking/riding through trunks across all 4 parks
    for (const [park, sampleLx, northLz, southLz] of [
      [biaPark, 51, -16.9, -9.6],
      [fireflyPark, 105, -16.9, -9.6],
      [fountainPark, 256, -18.2, -10.2],
      [phuXuanWalk, 386, -17.6, -10.7],
    ]) {
      assert.ok(park.treeColliders.length >= 4, "Park exposes treeColliders");
      const nPt = biaPark.toWorld(sampleLx, northLz);
      const sPt = biaPark.toWorld(sampleLx, southLz);
      assert.equal(park.hitsTree(nPt.x, nPt.z), true, `${park.group.name} north row tree (${sampleLx}, ${northLz}) blocks`);
      assert.equal(park.canRide(nPt.x, nPt.z), false);
      assert.equal(park.hitsTree(sPt.x, sPt.z), true, `${park.group.name} south row tree (${sampleLx}, ${southLz}) blocks`);
      assert.equal(park.canRide(sPt.x, sPt.z), false);
    }

    // Continuous 0.36m shoreline wooden boardwalk from BiaQuocHocPark -> Firefly -> Fountain -> PhuXuan ramping to 0.684m at Cầu Gỗ Lim
    for (const [park, lx, lz, expectedY] of [
      [fireflyPark, 110, -38.0, 0.36],
      [fountainPark, 250, -28.5, 0.36],
      [fountainPark, 330, -24.5, 0.36],
      [phuXuanWalk, 396, -22.0, 0.36],
      [phuXuanWalk, 437.35, -20.4, 0.684],
    ]) {
      const p = biaPark.toWorld(lx, lz);
      const gy = park.groundAt(p.x, p.z, 0.36);
      assert.ok(Math.abs(gy - expectedY) <= 0.02, `Shoreline wooden boardwalk (${lx}, ${lz}) expected ~${expectedY}m, got ${gy}`);
      assert.equal(park.canRide(p.x, p.z), true, `Shoreline wooden boardwalk (${lx}, ${lz}) must be rideable`);
      assert.equal(park.isWaterBlocked(p.x, p.z), true, `Boats blocked under shoreline wooden boardwalk (${lx}, ${lz})`);
    }
  });
});

test("Manicured emerald turf utilities and LivingGrass work cleanly in both mocked and headless modes", () => {
  // Without document (e.g. server or headless test): gracefully skips canvas and provides emerald color fallback
  const headlessMat = createManicuredLawnMaterial(4, 4);
  assert.equal(headlessMat.map, null);
  assert.equal(headlessMat.color.getHexString(), "508d37");

  withMockDocument(() => {
    const tex = createManicuredLawnTexture(6, 6);
    assert.ok(tex);
    assert.equal(tex.colorSpace, THREE.SRGBColorSpace);

    const plane = new THREE.PlaneGeometry(28, 28);
    plane.rotateX(-Math.PI / 2);
    applyWorldPlanarUVs(plane, 14);
    const uvs = plane.attributes.uv;
    assert.ok(uvs.count > 0);
    assert.ok(Math.abs(uvs.getX(0) - (-1)) < 1e-5);

    const mockWorld = {
      scene: new THREE.Scene(),
      riverRings: river,
      buildingPolygons: [],
      parkPolygons: [],
      nearestRoad: () => ({ distance: Infinity }),
      quality: { grassSamples: 120, grassSpan: 40 },
    };
    const grass = new LivingGrass(mockWorld);
    grass.update(new THREE.Vector3(0, 0, 0));
    assert.ok(grass.mesh.count > 0);
  });
});
