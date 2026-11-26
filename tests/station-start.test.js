import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import config from "../src/data/app-config.json" with { type: "json" };
import { project, nearestPoint } from "../src/core/shared/geography/geometry.js";

test("Le Loi starts at Khoa Quoc Te, Dai hoc Hue; pre-start bloat removed; ten online slots stay on Le Loi", async () => {
  const area = config.areas.items.find((a) => a.id === "quoc-hoc");
  const data = JSON.parse(
    await readFile(
      new URL("../src/modules/areas/quoc-hoc/model/osm.json", import.meta.url),
      "utf8",
    ),
  );
  assert.deepEqual(data.region.path, area.path);

  // Khoa Quốc tế, Đại học Huế (way/695775617) is preserved as the starting landmark
  const kqt = data.elements.find((f) => f.id === 695775617);
  assert.ok(kqt, "Khoa Quoc Te building must exist in trimmed quoc-hoc model");

  // Ga Huế and pre-start roads/buildings before Khoa Quốc tế are removed
  for (const removedId of [175063593, 39411821, 631848433, 240266283, 240267335, 251616147]) {
    assert.equal(
      data.elements.find((f) => f.id === removedId),
      undefined,
      `Pre-start element ${removedId} should be removed`,
    );
  }

  // Lê Lợi road starts right beside Khoa Quốc tế (does not stretch back to Ga Huế)
  const leLoiRoad = data.elements
    .find((f) => f.id === 626373586)
    .geometry.map(project);
  assert.ok(leLoiRoad.every((p) => p.x >= 285 && p.z <= -260));

  const kqtPts = kqt.geometry.map(project);
  const kqtCenter = {
    x: kqtPts.reduce((s, p) => s + p.x, 0) / kqtPts.length,
    z: kqtPts.reduce((s, p) => s + p.z, 0) / kqtPts.length,
  };
  const startVertex = { x: area.path[0][0], z: area.path[0][1] };
  assert.ok(
    Math.hypot(startVertex.x - kqtCenter.x, startVertex.z - kqtCenter.z) < 60,
    "Tour start vertex should be directly beside Khoa Quoc Te",
  );

  // Ten non-overlapping online spawn slots stay along the starting Lê Lợi road right in front of HueCIT
  assert.deepEqual(area.spawn, area.spawnSlots[0]);
  assert.equal(area.spawnSlots.length, 10);
  const hueCitGate = { x: 357.15, z: -312.47 };
  assert.ok(
    Math.hypot(area.spawn.x - hueCitGate.x, area.spawn.z - hueCitGate.z) < 15,
    "Primary player spawn should sit right in front of HueCIT on Le Loi",
  );
  for (const slot of area.spawnSlots) {
    const hit = nearestPoint(slot, leLoiRoad);
    assert.ok(hit.distance < 5 && hit.t > 0 && hit.t < 1);
  }
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < i; j++) {
      assert.ok(
        Math.hypot(
          area.spawnSlots[i].x - area.spawnSlots[j].x,
          area.spawnSlots[i].z - area.spawnSlots[j].z,
        ) > 2,
      );
    }
  }
});
