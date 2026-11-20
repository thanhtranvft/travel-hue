import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MINIMAP_WIDTH,
  MINIMAP_HEIGHT,
  createMapProjection,
  appendTrailPoint,
  formatPlayerCoords,
  renderAreaMap,
} from "../src/core/world/minimap.js";

test("area map projection centers every enabled region and maps player movement monotonically", () => {
  const cfg = JSON.parse(fs.readFileSync("src/data/app-config.json", "utf8"));
  for (const area of cfg.areas.items.filter((a) => a.enabled !== false)) {
    const osm = JSON.parse(
      fs.readFileSync(`src/modules/areas/${area.id}/model/osm.json`, "utf8"),
    );
    const proj = createMapProjection(osm.region.bounds);
    const sx = proj.toX(area.spawn.x);
    const sy = proj.toY(area.spawn.z);
    assert.ok(sx >= 5 && sx <= MINIMAP_WIDTH - 5, `${area.id} spawnX=${sx}`);
    assert.ok(sy >= 5 && sy <= MINIMAP_HEIGHT - 5, `${area.id} spawnY=${sy}`);

    const movedX = proj.toX(area.spawn.x + 25);
    const movedY = proj.toY(area.spawn.z - 25);
    assert.ok(movedX > sx, "moving +X shifts marker right");
    assert.ok(movedY < sy, "moving -Z (north) shifts marker up");
  }
});

test("player movement trail records steps >= minStep and live coordinates update with movement", () => {
  const trail = [];
  appendTrailPoint(trail, 76, -66, 3.5);
  appendTrailPoint(trail, 77, -66.5, 3.5);
  assert.equal(trail.length, 1);

  appendTrailPoint(trail, 82, -70, 3.5);
  assert.equal(trail.length, 2);

  const a = formatPlayerCoords({ x: 76, z: -66 });
  const b = formatPlayerCoords({ x: 82, z: -70 });
  assert.notEqual(a.gpsText, b.gpsText);
  assert.notEqual(a.localText, b.localText);
  assert.match(a.gpsText, /16\.\d{5}°N · 107\.\d{5}°E/);
  assert.equal(a.localText, "X: 76 m · Z: -66 m");
});

test("renderAreaMap draws crosshair and player marker for active district without DOM", () => {
  const calls = [];
  const ctx = {
    canvas: { width: 480, height: 340 },
    save: () => calls.push("save"),
    restore: () => calls.push("restore"),
    setTransform: (...args) => calls.push(["setTransform", ...args]),
    fillRect: (...args) => calls.push(["fillRect", ...args]),
    beginPath: () => calls.push("beginPath"),
    closePath: () => calls.push("closePath"),
    moveTo: (...args) => calls.push(["moveTo", ...args]),
    lineTo: (...args) => calls.push(["lineTo", ...args]),
    arc: (...args) => calls.push(["arc", ...args]),
    fill: () => calls.push("fill"),
    stroke: () => calls.push("stroke"),
    translate: (...args) => calls.push(["translate", ...args]),
    rotate: (...args) => calls.push(["rotate", ...args]),
    setLineDash: (...args) => calls.push(["setLineDash", ...args]),
    fillText: (...args) => calls.push(["fillText", ...args]),
  };
  renderAreaMap(ctx, {
    regionId: "quoc-hoc",
    bounds: { minX: -140, maxX: 1480, minZ: -1350, maxZ: 130 },
    riverRings: [],
    roads: [{ points: [{ x: 0, z: 0 }, { x: 100, z: -100 }] }],
    mainRoads: [{ points: [{ x: 0, z: 0 }, { x: 100, z: -100 }] }],
    district: {
      id: "quoc-hoc",
      path: [
        [10, -10],
        [100, -100],
      ],
      spawn: { x: 10, z: -10 },
    },
    landmarks: [],
    bike: { position: { x: 76, z: -66 }, motion: { heading: 2.34 } },
    trail: [
      { x: 10, z: -10 },
      { x: 76, z: -66 },
    ],
    remotePlayers: [{ x: 90, z: -80, color: "#5ce1ff", name: "Bạn" }],
  });
  assert.ok(calls.some((c) => c[0] === "setTransform" && c[1] === 2 && c[2] === 0));
  assert.ok(calls.some((c) => c[0] === "setLineDash"));
  assert.ok(calls.some((c) => c[0] === "rotate" && Math.abs(c[1] + 2.34) < 1e-6));
});
