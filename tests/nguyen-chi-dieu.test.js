import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import appConfig from "../src/data/app-config.json" with { type: "json" };
import dongDaCampuses from "../src/modules/areas/nguyen-chi-dieu/data/campuses.json" with { type: "json" };
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
import { NguyenChiDieuCampus } from "../src/modules/areas/nguyen-chi-dieu/view/NguyenChiDieuCampus.js";
import { CaoThangCampus } from "../src/modules/areas/nguyen-chi-dieu/view/CaoThangCampus.js";
import { VincomPlazaHue } from "../src/modules/areas/nguyen-chi-dieu/view/VincomPlazaHue.js";
import { GeographicTraffic } from "../src/core/traffic/GeographicTraffic.js";

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

test("Đống Đa / Nguyễn Chí Diểu area loads OSM graph, crossings, 10 online spawn slots, and traffic routes", async () => {
  const areaCfg = appConfig.areas.items.find(
    (d) => d.id === "nguyen-chi-dieu",
  );
  assert.ok(areaCfg && areaCfg.enabled !== false, "nguyen-chi-dieu area enabled");
  assert.equal(areaCfg.spawnSlots.length, 10, "10 online spawn slots exist");

  const region = await loadGeography("nguyen-chi-dieu");
  assert.equal(region.id, "nguyen-chi-dieu");
  assert.ok(regionContains(region, areaCfg.spawn.x, areaCfg.spawn.z));
  for (const [x, z] of region.path) {
    assert.equal(regionContains(region, x, z), true);
  }
  for (const slot of areaCfg.spawnSlots) {
    assert.equal(
      regionContains(region, slot.x, slot.z),
      true,
      "spawn slot stays within active region",
    );
  }

  assert.ok(
    corridorCrossings.some((c) => c.name === "Lý Thường Kiệt"),
    "Đống Đa – Lý Thường Kiệt intersection detected",
  );
  assert.ok(
    corridorCrossings.some((c) => c.name === "Bùng binh Hùng Vương"),
    "Ngã 6 Bùng binh Hùng Vương roundabout crossing detected",
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
  const roadNames = new Set(traffic.actors.map((a) => a.road?.tags?.name).filter(Boolean));
  assert.ok(
    traffic.actors.length > 0 && roadNames.has("Đống Đa"),
    "Đống Đa traffic spawns vehicles and pedestrians on Đống Đa / Hùng Vương / Lý Thường Kiệt",
  );
});

test("Trường THCS Nguyễn Chí Diểu gate, white picket fence + HLC signboard, 3 buildings, flag, and boy/girl students build cleanly", async () => {
  await loadGeography("nguyen-chi-dieu");
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "nguyen-chi-dieu");
    assert.ok(site, "nguyen-chi-dieu site exists");

    const gate = createSchoolGate(site);
    assert.ok(gate, "Nguyễn Chí Diểu gate is built");
    assert.equal(gate.object.name, "nguyen-chi-dieu-gate");

    gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
    gate.object.rotation.y = gate.placement.heading;
    gate.object.updateMatrixWorld(true);

    const panel = gate.object.getObjectByName("gate-name-panel");
    assert.ok(panel, "gate has front gate-name-panel");
    const meshes = [];
    gate.object.traverseVisible((o) => {
      if (o.isMesh) meshes.push(o);
    });
    for (const x of [-2.5, -1, 0, 1, 2.5]) {
      for (const y of [-0.3, 0.25]) {
        const target = panel.localToWorld(new THREE.Vector3(x, y, 0.001));
        const origin = gate.object.localToWorld(new THREE.Vector3(x, 3.8, 12));
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
          `Nguyễn Chí Diểu gate sign unobstructed at (${x}, ${y})`,
        );
      }
    }

    const walls = createCampusWalls(site, gate.placement);
    assert.ok(walls && walls.segments.length > 0, "campus picket fence built");
    assert.equal(
      hitsCampusWall(gate.placement, walls.segments),
      false,
      "central gate opening stays passable through fence",
    );
    assert.ok(
      walls.object.getObjectByName("hlc-signboard"),
      "blue HLC signboard placed along front fence bay to the right of gate",
    );

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const campus = new NguyenChiDieuCampus(world, site, gate.placement);
    assert.equal(
      campus.campusBuildingPolygons.length,
      3,
      "all 3 OSM buildings inside Nguyễn Chí Diểu campus are styled",
    );
    assert.ok(
      campus.group.getObjectByName("nguyen-chi-dieu-flagpole"),
      "flagpole is present",
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
      "Nguyễn Chí Diểu campus has boy and girl students",
    );

    const entryPos = campus.toWorld(0, 8);
    assert.equal(campus.groundAt(entryPos.x, entryPos.z), 0.3);
    assert.equal(campus.canRide(entryPos.x, entryPos.z), true);

    const outsidePos = campus.toWorld(0, -30);
    assert.equal(campus.groundAt(outsidePos.x, outsidePos.z), null);
    assert.equal(campus.canRide(outsidePos.x, outsidePos.z), null);
  });
});

test("Trường THPT Cao Thắng gate, fence, 6 buildings, flagpole, and boy/girl students build cleanly", async () => {
  await loadGeography("nguyen-chi-dieu");
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "cao-thang");
    assert.ok(site, "cao-thang site exists");

    const gate = createSchoolGate(site);
    assert.ok(gate, "Cao Thắng gate is built");
    assert.equal(gate.object.name, "cao-thang-gate");

    gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
    gate.object.rotation.y = gate.placement.heading;
    gate.object.updateMatrixWorld(true);

    const panel = gate.object.getObjectByName("gate-name-panel");
    assert.ok(panel, "gate has front gate-name-panel");
    const meshes = [];
    gate.object.traverseVisible((o) => {
      if (o.isMesh) meshes.push(o);
    });
    for (const x of [-2.4, 0, 2.4]) {
      const target = panel.localToWorld(new THREE.Vector3(x, 0, 0.001));
      const origin = gate.object.localToWorld(new THREE.Vector3(x, 4.0, 12));
      const dir = target.clone().sub(origin);
      const ray = new THREE.Raycaster(
        origin,
        dir.clone().normalize(),
        0,
        dir.length() + 0.01,
      );
      const hit = ray.intersectObjects(meshes, false)[0];
      assert.equal(hit?.object, panel, `Cao Thắng sign unobstructed at ${x}`);
    }

    const walls = createCampusWalls(site, gate.placement);
    assert.ok(walls && walls.segments.length > 0, "Cao Thắng fence built");
    assert.equal(
      hitsCampusWall(gate.placement, walls.segments),
      false,
      "Cao Thắng central gate opening stays passable",
    );

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const campus = new CaoThangCampus(world, site, gate.placement);
    assert.equal(
      campus.campusBuildingPolygons.length,
      6,
      "all 6 OSM buildings inside Cao Thắng campus are styled",
    );
    assert.ok(
      campus.group.getObjectByName("cao-thang-flagpole"),
      "Cao Thắng flagpole is present",
    );

    const counts = campus.students.getCounts();
    assert.ok(
      counts.boys > 0 && counts.girls > 0,
      "Cao Thắng campus has boy and girl students",
    );

    const yardPos = campus.toWorld(0, 8);
    assert.equal(campus.groundAt(yardPos.x, yardPos.z), 0.3);
    assert.equal(campus.canRide(yardPos.x, yardPos.z), true);
  });
});

test("Vincom Plaza Huế skyscraper and Ngã 6 Bùng binh Hùng Vương roundabout island build cleanly", async () => {
  await loadGeography("nguyen-chi-dieu");
  withMockDocument(() => {
    const site = sites.find((s) => s.id === "vincom-hue");
    assert.ok(site, "vincom-hue site exists");

    const world = {
      scene: new THREE.Scene(),
      cameraObstacles: [],
    };
    const vincom = new VincomPlazaHue(world, site);
    assert.ok(
      vincom.group.getObjectByName("vincom-plaza-sign"),
      "VINCOM PLAZA HUẾ marquee built",
    );
    assert.ok(
      vincom.group.getObjectByName("melia-vinpearl-sign"),
      "MELIÁ VINPEARL sky sign built",
    );
    assert.ok(
      vincom.group.getObjectByName("nga-sau-roundabout-island"),
      "Ngã 6 roundabout garden island built",
    );

    // Building footprint & inner garden island block riding, while outer roundabout ring stays open
    assert.equal(vincom.canRide(site.center.x, site.center.z), false);
    const rb = dongDaCampuses.roundabout.center;
    assert.equal(vincom.canRide(rb.x, rb.z), false);
    assert.notEqual(vincom.canRide(rb.x + 20, rb.z), false);
  });
});
