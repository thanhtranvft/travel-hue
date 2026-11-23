import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import appConfig from "../src/data/app-config.json" with { type: "json" };
import quangTrungCampuses from "../src/modules/areas/quang-trung/data/campuses.json" with { type: "json" };
import {
  loadGeography,
  regionContains,
  corridorCrossings,
  sites,
  roads,
  currentRegion,
} from "../src/modules/areas/AreaModel.js";
import { createSchoolGate } from "../src/modules/areas/quoc-hoc/view/SchoolGates.js";
import {
  createCampusWalls,
  hitsCampusWall,
} from "../src/core/shared/architecture/CampusWalls.js";
import { QuangTrungCampus } from "../src/modules/areas/quang-trung/view/QuangTrungCampus.js";
import { BenhVienRhmHue } from "../src/modules/areas/quang-trung/view/BenhVienRhmHue.js";
import { DongChuaCuuTheChurch } from "../src/modules/areas/quang-trung/view/DongChuaCuuTheChurch.js";
import { GeographicTraffic } from "../src/core/traffic/GeographicTraffic.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";

function withMockDocument(fn) {
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
    return fn();
  } finally {
    globalThis.document = prev;
  }
}

test("83 Nguyễn Huệ · Quang Trung -> Dòng Chúa Cứu Thế area loads OSM graph, crossings, 10 online spawn slots, and traffic routes", async () => {
  const areaCfg = appConfig.areas.items.find((d) => d.id === "quang-trung");
  assert.ok(areaCfg && areaCfg.enabled !== false, "quang-trung area enabled");
  assert.equal(areaCfg.spawnSlots.length, 10, "10 online spawn slots exist");

  const region = await loadGeography("quang-trung");
  assert.equal(region.id, "quang-trung");
  assert.ok(regionContains(region, areaCfg.spawn.x, areaCfg.spawn.z));
  for (const [x, z] of region.path) {
    assert.equal(regionContains(region, x, z), true);
  }
  for (const slot of areaCfg.spawnSlots) {
    assert.equal(
      regionContains(region, slot.x, slot.z),
      true,
      "spawn slot stays within active quang-trung region",
    );
  }

  assert.ok(
    corridorCrossings.some((c) => c.name === "Nguyễn Khuyến"),
    "Ngã 3 Nguyễn Huệ – Nguyễn Khuyến crossing detected",
  );

  const trafficScene = new THREE.Scene();
  const trafficWorld = {
    scene: trafficScene,
    groundAt: () => 0.23,
    roadHeight: () => 0.23,
    region: currentRegion,
    bounds: region.bounds,
    roads,
  };
  const traffic = new GeographicTraffic(trafficScene, trafficWorld);
  const roadNames = new Set(
    traffic.actors.map((a) => a.road?.tags?.name).filter(Boolean),
  );
  assert.ok(
    traffic.actors.length > 0 && roadNames.has("Nguyễn Huệ"),
    "Quang Trung traffic spawns vehicles and pedestrians on Nguyễn Huệ",
  );
});

test("Trường Tiểu học Quang Trung gate, fence, ice-blue wings, festival bunting, stage, flagpole, sports court, and boy/girl students build cleanly", async () => {
  await loadGeography("quang-trung");
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "quang-trung");
    assert.ok(site, "quang-trung site exists");

    const gate = createSchoolGate(site);
    assert.ok(gate, "Quang Trung gate is built");
    assert.equal(gate.object.name, "quang-trung-gate");

    gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
    gate.object.rotation.y = gate.placement.heading;
    gate.object.updateMatrixWorld(true);

    const panel = gate.object.getObjectByName("gate-name-panel");
    assert.ok(panel, "gate has front gate-name-panel");
    const meshes = [];
    gate.object.traverseVisible((o) => {
      if (o.isMesh) meshes.push(o);
    });
    for (const x of [-2.8, -1, 0, 1, 2.8]) {
      for (const y of [-0.35, 0.35]) {
        const target = panel.localToWorld(new THREE.Vector3(x, y, 0.001));
        const origin = gate.object.localToWorld(new THREE.Vector3(x, 4.4, 12));
        const dir = target.clone().sub(origin);
        const ray = new THREE.Raycaster(
          origin,
          dir.clone().normalize(),
          0,
          dir.length() + 0.01,
        );
        const hit = ray.intersectObjects(meshes, false)[0];
        assert.equal(
          hit?.object,
          panel,
          `Quang Trung gate sign unobstructed at (${x}, ${y})`,
        );
      }
    }

    const walls = createCampusWalls(site, gate.placement);
    assert.ok(walls && walls.segments.length > 0, "Quang Trung fence built");
    assert.equal(
      hitsCampusWall(gate.placement, walls.segments),
      false,
      "central gate opening stays passable through fence",
    );

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const campus = new QuangTrungCampus(world, site, gate.placement);
    assert.equal(
      campus.campusBuildingPolygons.length,
      2,
      "West OSM wing + North ceremony wing polygons built",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-flagpole"),
      "flagpole is present",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-stage") &&
        campus.group.getObjectByName("quang-trung-slogan-banner") &&
        campus.group.getObjectByName("quang-trung-bunting"),
      "ceremony stage, slogan banner, and festival bunting strings built",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-basketball-hoop") &&
        campus.group.getObjectByName("quang-trung-mini-goal") &&
        campus.group.getObjectByName("quang-trung-mini-goal-north") &&
        campus.group.getObjectByName("quang-trung-left-pitch") &&
        campus.group.getObjectByName("quang-trung-soccer-ball"),
      "sports court hoop and 2 left-side mini football goals + soccer ball built",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-central-lane") &&
        campus.group.getObjectByName("quang-trung-guard-house") &&
        campus.group.getObjectByName("quang-trung-notice-board") &&
        campus.group.getObjectByName("quang-trung-school-drum") &&
        campus.group.getObjectByName("quang-trung-green-library") &&
        campus.group.getObjectByName("quang-trung-bike-shed"),
      "central gate lane and detailed primary school props built",
    );

    const treeCurbs = [];
    let comNamVendors = 0;
    campus.group.traverse((o) => {
      if (o.name === "quang-trung-tree-curb") treeCurbs.push(o);
      if (o.name === "quang-trung-com-nam-vendor") comNamVendors++;
    });
    assert.ok(treeCurbs.length >= 14, "every campus shade tree has a rounded tree curb");
    assert.ok(
      campus.group.getObjectByName("quang-trung-xoi-cart"),
      "husband-and-wife xôi pushcart outside gate built",
    );
    assert.equal(comNamVendors, 3, "3 cơm nắm / street-hawker vendors outside gate built");

    assert.equal(campus.flags.length, 1);

    const flagAttr = campus.flags[0].geometry.attributes.position;
    const zBefore = flagAttr.getZ(flagAttr.count - 1);
    campus.update(1.7);
    const zAfter = flagAttr.getZ(flagAttr.count - 1);
    assert.notEqual(zAfter, zBefore, "flag cloth waves during update");

    const counts = campus.students.getCounts();
    assert.ok(
      counts.boys > 0 && counts.girls > 0,
      "Quang Trung campus has both boy and girl students",
    );

    const yardPt = campus.toWorld(0, 12);
    assert.equal(campus.groundAt(yardPt.x, yardPt.z), 0.3);
    assert.equal(campus.canRide(yardPt.x, yardPt.z), true);

    const leftTreeCurb = campus.toWorld(-5.4, 19.5);
    assert.equal(campus.canRide(leftTreeCurb.x, leftTreeCurb.z), false);

    const xoiCartSpot = campus.toWorld(10.6, -2.05);
    assert.equal(campus.canRide(xoiCartSpot.x, xoiCartSpot.z), false);
    assert.equal(campus.blocksTree(xoiCartSpot.x, xoiCartSpot.z), true);

    const gateSidewalkClear = campus.toWorld(0, -2.0);
    assert.equal(campus.canRide(gateSidewalkClear.x, gateSidewalkClear.z), null);

    const insideWestWing = campus.toWorld(-28.5, 35);
    assert.equal(campus.canRide(insideWestWing.x, insideWestWing.z), false);
  });
});

test("Bệnh viện Răng Hàm Mặt Huế (83 Nguyễn Huệ) & Nhà thờ Dòng Chúa Cứu Thế + Tượng Chúa Giêsu dang tay build cleanly", async () => {
  await loadGeography("quang-trung");
  withMockDocument(() => {
    const hospSite = sites.find((s) => s.id === "benh-vien-rhm-hue");
    const churchSite = sites.find((s) => s.id === "nha-tho-dong-chua-cuu-the");
    assert.ok(hospSite, "benh-vien-rhm-hue site exists");
    assert.ok(churchSite, "nha-tho-dong-chua-cuu-the site exists");

    const world = { scene: new THREE.Scene(), cameraObstacles: [] };
    const hosp = new BenhVienRhmHue(world, hospSite);
    assert.ok(
      hosp.group.getObjectByName("benh-vien-rhm-hue-sign"),
      "Bệnh viện RHM Huế portico & sign built",
    );
    const hospYard = hosp.toWorld(0, 8);
    assert.equal(hosp.groundAt(hospYard.x, hospYard.z), 0.28);
    assert.equal(hosp.canRide(hospYard.x, hospYard.z), true);
    const hospBuildingPt = hosp.toWorld(-2, 19);
    assert.equal(hosp.canRide(hospBuildingPt.x, hospBuildingPt.z), false);

    const church = new DongChuaCuuTheChurch(world, churchSite);
    assert.ok(
      church.group.getObjectByName("dong-chua-cuu-the-tuvien-facade") &&
        church.group.getObjectByName("dong-chua-cuu-the-basilica") &&
        church.group.getObjectByName("jesus-christ-statue"),
      "Colonial Tu viện facade, Basilica, and Jesus Christ statue built",
    );

    const gateOpening = church.toWorld(36, -25);
    assert.equal(
      church.canRide(gateOpening.x, gateOpening.z),
      true,
      "Tu viện gate opening stays passable",
    );
    const statuePos = quangTrungCampuses["nha-tho-dong-chua-cuu-the"].jesusStatuePos;
    assert.equal(
      church.canRide(statuePos.x, statuePos.z),
      false,
      "Christ statue garden island blocks riding through pedestal",
    );
  });
});

test("Every school campus across all districts contains both boy and girl students inside its yard", async () => {
  const checks = [
    ["quoc-hoc", "quocHocCampus", "quoc-hoc-school"],
    ["quoc-hoc", "haiBaTrungCampus", "hai-ba-trung"],
    ["nguyen-chi-dieu", "nguyenChiDieuCampus", "nguyen-chi-dieu"],
    ["nguyen-chi-dieu", "caoThangCampus", "cao-thang"],
    ["quang-trung", "quangTrungCampus", "quang-trung"],
  ];
  for (const [areaId, propName, siteId] of checks) {
    const region = await loadGeography(areaId);
    withMockDocument(() => {
      const world = new GeographicWorld(new THREE.Scene());
      world.region = region;
      world.build();
      const campus = world[propName];
      assert.ok(campus, `${siteId} campus instantiated on GeographicWorld`);
      const counts = campus.students?.getCounts?.();
      assert.ok(
        counts && counts.boys > 0 && counts.girls > 0,
        `${siteId} has boy and girl students (${JSON.stringify(counts)})`,
      );
    });
  }
});
