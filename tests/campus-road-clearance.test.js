import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";

if (typeof globalThis.document === "undefined") {
  const noop = () => {};
  const createCtx = () => ({
    fillStyle: "",
    strokeStyle: "",
    font: "",
    textAlign: "left",
    textBaseline: "alphabetic",
    lineWidth: 1,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    moveTo: noop,
    lineTo: noop,
    arc: noop,
    rect: noop,
    roundRect: noop,
    fill: noop,
    stroke: noop,
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    fillText: noop,
    strokeText: noop,
    measureText: (t = "") => ({ width: String(t).length * 8 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({}),
  });
  globalThis.document = {
    createElement: (tag) =>
      tag === "canvas"
        ? { width: 256, height: 256, getContext: createCtx }
        : { style: {}, append: noop, setAttribute: noop },
  };
}

import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { isFootway, roadWidth } from "../src/core/world/roadProfile.js";
import { nearestPoint } from "../src/core/shared/geography/geometry.js";

function segmentMinRoadDist(a, b, roadPoints) {
  let min = Infinity;
  for (let i = 0; i <= 4; i++) {
    const t = i / 4;
    const p = { x: a.x + (b.x - a.x) * t, z: a.z + (b.z - a.z) * t };
    const d = nearestPoint(p, roadPoints).distance;
    if (d < min) min = d;
  }
  return min;
}

test("all special compound fences across quoc-hoc, nguyen-chi-dieu, and quang-trung clear every carriageway", async () => {
  for (const regionId of ["quoc-hoc", "nguyen-chi-dieu", "quang-trung"]) {
    const region = await loadGeography(regionId);
    const world = new GeographicWorld(new THREE.Scene());
    world.quality = {
      mobile: false,
      shadows: false,
      shadowMapSize: 512,
      grassSamples: 1000,
      grassSpan: 80,
    };
    world.region = region;
    world.build();

    const carriageways = world.renderRoads.filter((r) => !isFootway(r));
    const fenceSources = [
      ...(world.youthPlayground?.segments || []).map((s) => ({ ...s, src: "youthPlayground" })),
      ...(world.hueHospital?.wallSegments || []).map((s) => ({ ...s, src: "hueHospital" })),
      ...(world.vincomPlaza?.wallSegments || []).map((s) => ({ ...s, src: "vincomPlaza" })),
      ...(world.benhVienRhmHue?.fenceSegments || []).map((s) => ({ ...s, src: "benhVienRhmHue" })),
      ...(world.dongChuaCuuTheChurch?.fenceSegments || []).map((s) => ({ ...s, src: "dongChuaCuuThe" })),
      ...(world.quangTrungEastPrecinct?.wallSegments || []).map((s) => ({ ...s, src: "quangTrungEast" })),
    ];

    const violations = [];
    for (const seg of fenceSources) {
      const a = seg.a || seg;
      const b = seg.b || seg;
      if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
      for (const road of carriageways) {
        const d = segmentMinRoadDist(a, b, road.points);
        const minReq = roadWidth(road) / 2 + 1.85;
        if (d < minReq) {
          violations.push({
            regionId,
            src: seg.src,
            roadId: road.id,
            roadName: road.tags?.name || road.tags?.highway,
            dist: Number(d.toFixed(2)),
            minReq: Number(minReq.toFixed(2)),
          });
        }
      }
    }
    assert.deepEqual(
      violations,
      [],
      `[${regionId}] Compound fence overlaps carriageway: ${JSON.stringify(violations.slice(0, 6))}`,
    );
  }
});
