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
import { ChurchBellController } from "../src/core/audio/ChurchBellController.js";

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
      3,
      "West OSM wing + North ceremony wing + East 3-story wing polygons built",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-east-wing") &&
        campus.group.getObjectByName("quang-trung-north-portico") &&
        campus.group.getObjectByName("quang-trung-teacher-parking-row") &&
        campus.group.getObjectByName("quang-trung-parking-lot") &&
        campus.group.getObjectByName("quang-trung-parking-booth"),
      "East 3-story wing, North central portico, front-right teacher parking shed row, and school parking lot + booth built",
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
        campus.group.getObjectByName("quang-trung-green-library"),
      "central gate lane and detailed primary school props built",
    );
    assert.ok(
      campus.group.getObjectByName("quang-trung-rose-garden-cafe") &&
        campus.group.getObjectByName("quang-trung-nguyen-hue-cafes") &&
        campus.group.getObjectByName("cafe-muoi-hue") &&
        campus.group.getObjectByName("cafe-co-do") &&
        campus.group.getObjectByName("cafe-moc-garden") &&
        campus.group.getObjectByName("cafe-hue-xua") &&
        campus.group.getObjectByName("cafe-la-nguyen-hue"),
      "Rose Garden café beside school and 5-café strip opposite Bệnh viện RHM Huế -> Dòng Chúa Cứu Thế built",
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
    assert.equal(
      campus.vendorPoints.filter((v) => v.vendorType === "xoi-vendor").length,
      1,
      "xoi vendor audio trigger registered",
    );
    assert.equal(
      campus.vendorPoints.filter((v) => v.vendorType === "hawker-vendor").length,
      3,
      "3 hawker vendor audio triggers registered",
    );

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
    for (const s of campus.students.students) {
      assert.equal(s.rig.bike, null, "Quang Trung students do not have bicycles");
      assert.notEqual(s.animState.stance, "bike", "Quang Trung students walk or stand, never ride");
      let hasBikeMesh = false;
      s.rig.actor.traverse((o) => {
        if (o.name === "chibi-bicycle") hasBikeMesh = true;
      });
      assert.equal(hasBikeMesh, false, "no chibi-bicycle descendant under Quang Trung student");
    }

    const teachersGroup = campus.group.getObjectByName("quang-trung-teachers-group");
    assert.ok(teachersGroup, "group of chatting female teachers in áo dài built");
    const teacherActors = [];
    teachersGroup.traverse((o) => {
      if (o.name === "quang-trung-ao-dai-teacher") teacherActors.push(o);
    });
    assert.equal(teacherActors.length, 4, "4 female teachers wearing áo dài in group");
    const teacherPos = campus.toWorld(6.8, 24.8);
    assert.equal(campus.inCampus(teacherPos.x, teacherPos.z), true, "teachers positioned inside campus");
    assert.equal(campus.canRide(teacherPos.x, teacherPos.z), false, "teacher chat circle blocks riding through");
    const yawBefore = teacherActors[0].rotation.y;
    campus.update(2.4);
    assert.notEqual(teacherActors[0].rotation.y, yawBefore, "teachers animate subtly while chatting");

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

    const insideEastWing = campus.toWorld(25.3, 36);
    assert.equal(campus.canRide(insideEastWing.x, insideEastWing.z), false);

    const teacherParkingRowSpot = campus.toWorld(22.0, 2.6);
    assert.equal(campus.canRide(teacherParkingRowSpot.x, teacherParkingRowSpot.z), false);
    const teacherParkingFrontApron = campus.toWorld(22.0, 7.2);
    assert.equal(campus.canRide(teacherParkingFrontApron.x, teacherParkingFrontApron.z), true);

    const parkingAisle = campus.toWorld(30.8, 22);
    assert.equal(campus.canRide(parkingAisle.x, parkingAisle.z), true);
    const parkingShelter = campus.toWorld(34.4, 24);
    assert.equal(campus.canRide(parkingShelter.x, parkingShelter.z), false);

    // Requirement B: Seated men & women coffee patrons across roadside cafés and Rose Garden
    let seatedMen = 0;
    let seatedWomen = 0;
    campus.group.traverse((o) => {
      if (o.name === "cafe-seated-patron") {
        if (o.userData.gender === "man") seatedMen++;
        if (o.userData.gender === "woman") seatedWomen++;
      }
    });
    assert.ok(
      seatedMen > 0 && seatedWomen > 0,
      `cafés feature seated men (${seatedMen}) and women (${seatedWomen}) drinking coffee`,
    );
    campus.update(4.1);

    // Requirement C & D: Parking rear cổng phụ + expanded & fenced Rose Garden Café
    assert.ok(
      campus.group.getObjectByName("quang-trung-side-gate"),
      "cổng phụ beside teacher parking lot built",
    );
    assert.ok(
      campus.group.getObjectByName("rose-garden-fence") &&
        campus.group.getObjectByName("rose-garden-west-gate") &&
        campus.group.getObjectByName("rose-garden-rear-gazebo"),
      "expanded Rose Garden fence, west connecting gate, and rear gazebo built",
    );
    const sideGatePt = campus.toWorld(37.2, 58.5);
    const wallsWithSideGate = createCampusWalls(site, gate.placement, [
      { x: sideGatePt.x, z: sideGatePt.z, gap: 5.4 },
    ]);
    assert.equal(
      hitsCampusWall(sideGatePt, wallsWithSideGate.segments),
      false,
      "school east perimeter wall opens cleanly at parking cổng phụ",
    );
    assert.equal(campus.canRide(sideGatePt.x, sideGatePt.z), true);
    const roseWestGate = campus.toWorld(39.0, 58.5);
    assert.equal(campus.canRide(roseWestGate.x, roseWestGate.z), true);

    const roseFrontArch = campus.toWorld(50.25, 1.5);
    assert.equal(campus.canRide(roseFrontArch.x, roseFrontArch.z), true);
    const roseFrontCourtyard = campus.toWorld(47.0, 16.4);
    assert.equal(campus.canRide(roseFrontCourtyard.x, roseFrontCourtyard.z), true);
    assert.equal(campus.blocksTree(roseFrontCourtyard.x, roseFrontCourtyard.z), true);

    const insideRoseVilla = campus.toWorld(50.25, 27.7);
    assert.equal(campus.canRide(insideRoseVilla.x, insideRoseVilla.z), false);
    const roseEastFence = campus.toWorld(61.5, 32.0);
    assert.equal(campus.canRide(roseEastFence.x, roseEastFence.z), false);
    const roseRearFence = campus.toWorld(50.25, 63.5);
    assert.equal(campus.canRide(roseRearFence.x, roseRearFence.z), false);

    const insideCafeStrip = campus.toWorld(-61.8, -24.7);
    assert.equal(campus.canRide(insideCafeStrip.x, insideCafeStrip.z), false);
    assert.equal(campus.blocksTree(insideCafeStrip.x, insideCafeStrip.z), true);

    const southSidewalkClear = campus.toWorld(-61.8, -17.5);
    assert.equal(campus.canRide(southSidewalkClear.x, southSidewalkClear.z), null);
  });
});

test("Bệnh viện Răng Hàm Mặt Huế (83 Nguyễn Huệ) & Nhà thờ Dòng Chúa Cứu Thế + hàng rào & cổng phụ build cleanly", async () => {
  await loadGeography("quang-trung");
  withMockDocument(() => {
    const hospSite = sites.find((s) => s.id === "benh-vien-rhm-hue");
    const churchSite = sites.find((s) => s.id === "nha-tho-dong-chua-cuu-the");
    assert.ok(hospSite, "benh-vien-rhm-hue site exists");
    assert.ok(churchSite, "nha-tho-dong-chua-cuu-the site exists");

    const world = { scene: new THREE.Scene(), cameraObstacles: [] };
    const hosp = new BenhVienRhmHue(world, hospSite);
    assert.ok(
      hosp.group.getObjectByName("benh-vien-rhm-hue-sign") &&
        hosp.group.getObjectByName("benh-vien-rhm-hue-fence") &&
        hosp.group.getObjectByName("benh-vien-rhm-hue-main-gate"),
      "Bệnh viện RHM Huế portico, exterior courtyard fence, and grand main gate built",
    );
    assert.ok(hosp.fenceSegments.length > 0, "hospital perimeter fence segments registered");
    assert.equal(
      hosp.canRide(hosp.entrance.x, hosp.entrance.z),
      true,
      "hospital grand main gate stays passable",
    );
    const hospYard = hosp.toWorld(0, 8);
    assert.equal(hosp.groundAt(hospYard.x, hospYard.z), 0.28);
    assert.equal(hosp.canRide(hospYard.x, hospYard.z), true);
    const hospBuildingPt = hosp.toWorld(-2, 19);
    assert.equal(hosp.canRide(hospBuildingPt.x, hospBuildingPt.z), false);
    const hospFrontApproach = hosp.toWorld(0, -4);
    assert.equal(
      hosp.blocksTree(hospFrontApproach.x, hospFrontApproach.z),
      true,
      "trees blocked from growing in front of Bệnh viện RHM main gate",
    );
    assert.equal(
      hitsCampusWall(hosp.entrance, hosp.fenceSegments, 0.55),
      false,
      "hospital main gate cuts clean opening in fence",
    );

    const church = new DongChuaCuuTheChurch(world, churchSite);
    assert.ok(
      church.group.getObjectByName("dong-chua-cuu-the-tuvien-facade") &&
        church.group.getObjectByName("dong-chua-cuu-the-basilica") &&
        church.group.getObjectByName("jesus-christ-statue") &&
        church.group.getObjectByName("dong-chua-cuu-the-perimeter-fence"),
      "Colonial Tu viện facade, Basilica, Christ statue, and full perimeter iron fence built",
    );
    assert.ok(
      church.secondaryGates.length >= 6,
      `church compound provides main gate + multiple cổng phụ (${church.secondaryGates.length})`,
    );
    for (const g of church.secondaryGates) {
      assert.equal(
        church.canRide(g.x, g.z),
        true,
        `church gate ${g.name} opens cleanly through perimeter fence`,
      );
    }
    assert.ok(church.fenceSegments.length >= 10, "all unfenced ring edges enclosed with fence spans");
    for (const seg of church.fenceSegments) {
      const mid = { x: (seg.a.x + seg.b.x) / 2, z: (seg.a.z + seg.b.z) / 2 };
      assert.equal(
        hitsCampusWall(mid, church.fenceSegments, 0.55),
        true,
        "continuous iron fence span blocks riding across wall",
      );
    }

    assert.ok(
      church.stairPortals.length === 10 &&
        church.group.getObjectByName("portal-basilica-east-main") &&
        church.group.getObjectByName("portal-basilica-south-transept") &&
        church.group.getObjectByName("portal-basilica-north-transept") &&
        church.group.getObjectByName("portal-tuvien-north"),
      "all Colonial Tu viện & Basilica buildings feature stone stair portals",
    );
    const southTranseptStairY = church.groundAt(1845.5, -139.0);
    assert.ok(
      southTranseptStairY > 0.35 && church.canRide(1845.5, -139.0) === true,
      "walking onto Basilica sanctuary staircase smoothly elevates player",
    );
    assert.equal(church.isPlayerInArea(1845, -170), true);
    assert.equal(church.isPlayerInArea(1670.5, -246.4), false);
    const bellSrc = church.getBellSource();
    assert.ok(Number.isFinite(bellSrc?.x) && Number.isFinite(bellSrc?.z));

    const gateOpening = church.toWorld(36, -24);
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

test("Bệnh viện Đa Khoa, Hẻm nhỏ, Công viên Dự Án & tree-clearance integrate cleanly in GeographicWorld (quang-trung)", async () => {
  const region = await loadGeography("quang-trung");
  withMockDocument(() => {
    const world = new GeographicWorld(new THREE.Scene());
    world.region = region;
    world.build();

    const east = world.quangTrungEastPrecinct;
    assert.ok(east, "quangTrungEastPrecinct instantiated on GeographicWorld");
    assert.ok(
      east.group.getObjectByName("benh-vien-da-khoa") &&
        east.group.getObjectByName("quang-trung-small-alley") &&
        east.group.getObjectByName("quang-trung-project-park") &&
        east.group.getObjectByName("cong-vien-nha-ve-sinh") &&
        east.group.getObjectByName("cong-vien-picnic-group") &&
        east.group.getObjectByName("cong-vien-du-an-sign"),
      "Bệnh viện Đa Khoa, Hẻm nhỏ, and Công viên Dự Án landmarks built",
    );

    let ambulanceCount = 0;
    let sedanCount = 0;
    east.group.traverse((o) => {
      if (o.name === "hospital-ambulance") ambulanceCount++;
      if (o.name === "cong-vien-parked-sedan") sedanCount++;
    });
    assert.equal(ambulanceCount, 2, "2 ambulances parked in Bệnh viện Đa Khoa forecourt");
    assert.equal(sedanCount, 3, "3 white sedans parked at Công viên Dự Án bay");

    assert.ok(world.landmarks.has("benh-vien-da-khoa"), "Bệnh viện Đa Khoa landmark registered");
    assert.ok(world.landmarks.has("cong-vien-du-an"), "Công viên Dự Án landmark registered");

    const daKhoaGate = east.toWorld(85.5, 1.0);
    assert.equal(east.canRide(daKhoaGate.x, daKhoaGate.z), true, "Bệnh viện Đa Khoa main gate passable");
    const daKhoaBuilding = east.toWorld(85.5, 26.0);
    assert.equal(east.canRide(daKhoaBuilding.x, daKhoaBuilding.z), false, "Bệnh viện Đa Khoa main block solid");

    const hemPt = east.toWorld(111.5, 30.0);
    assert.equal(east.groundAt(hemPt.x, hemPt.z), 0.24, "Hẻm nhỏ paved elevation");
    assert.equal(east.canRide(hemPt.x, hemPt.z), true, "Hẻm nhỏ passable");

    const parkWalkway = east.toWorld(168.0, 12.0);
    assert.equal(east.groundAt(parkWalkway.x, parkWalkway.z), 0.28, "Công viên Dự Án plaza elevation");
    assert.equal(east.canRide(parkWalkway.x, parkWalkway.z), true, "Công viên Dự Án walkway passable");
    assert.equal(east.blocksGrass(parkWalkway.x, parkWalkway.z), true);
    assert.equal(east.blocksTree(parkWalkway.x, parkWalkway.z), true);

    const parkPavilion = east.toWorld(192.5, 53.25);
    assert.equal(east.canRide(parkPavilion.x, parkPavilion.z), false, "Công viên service pavilion solid");

    // Verify no ambient world trees obstruct Bệnh viện RHM gate or east precinct lots
    const hospEntrance = world.benhVienRhmHue.entrance;
    for (const tp of world.treePositions) {
      assert.ok(
        Math.hypot(tp.x - hospEntrance.x, tp.z - hospEntrance.z) >= 14.5,
        "no ambient tree spawned inside Bệnh viện RHM gate approach",
      );
      const local = east.toLocal(tp.x, tp.z);
      const inProtectedEastZone =
        local.side >= 37.5 && local.side <= 222.0 && local.fwd >= -10.0 && local.fwd <= 66.5;
      assert.equal(
        inProtectedEastZone,
        false,
        "no ambient roadside tree intrudes on Rose Garden / Bệnh viện Đa Khoa / Hẻm nhỏ / Công viên Dự Án",
      );
      for (const g of world.allGateClearances || []) {
        assert.ok(
          Math.hypot(tp.x - g.x, tp.z - g.z) >= (g.radius || 14.5),
          `no ambient tree blocks gate clearance (${g.x.toFixed(1)}, ${g.z.toFixed(1)})`,
        );
      }
    }
    east.update(3.2, parkWalkway);
  });
});

test("ChurchBellController stays silent outside church and chimes every 30-60s inside Dòng Chúa Cứu Thế", () => {
  const spans = [0.0, 0.5, 1.0];
  let idx = 0;
  const bell = new ChurchBellController({
    minInterval: 30,
    maxInterval: 60,
    initialDelay: 1.5,
    rng: () => spans[idx++ % spans.length],
  });

  // Never rings outside church compound
  for (let t = 0; t <= 120; t += 1) {
    assert.equal(bell.update(t, false), false);
  }

  // Player enters church at t = 121 -> chimes after initialDelay (122.5)
  assert.equal(bell.update(121.0, true), false);
  assert.equal(bell.update(122.5, true), true); // rng=0 -> next interval +30s -> 152.5

  // Quiet before 30s passes
  assert.equal(bell.update(140.0, true), false);
  assert.equal(bell.update(152.4, true), false);
  assert.equal(bell.update(152.5, true), true); // rng=0.5 -> next interval +45s -> 197.5

  assert.equal(bell.update(197.4, true), false);
  assert.equal(bell.update(197.5, true), true); // rng=1.0 -> next interval +60s -> 257.5

  // Leaves church -> silent even past 257.5
  assert.equal(bell.update(260.0, false), false);
  // Re-enters quickly after < 30s since last toll at 197.5 (e.g. t = 210 vs >227.5):
  bell.reset();
  assert.equal(bell.update(300.0, true), false);
  assert.equal(bell.update(301.5, true), true);
  // Step outside and step right back in within 10s -> must NOT double chime
  assert.equal(bell.update(305.0, false), false);
  assert.equal(bell.update(310.0, true), false);
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
