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
    globalAlpha: 1,
    lineCap: "butt",
    lineJoin: "miter",
    shadowColor: "",
    shadowBlur: 0,
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
    translate: noop,
    rotate: noop,
    scale: noop,
    setLineDash: noop,
    drawImage: noop,
    measureText: (txt = "") => ({ width: String(txt).length * 8 }),
    createLinearGradient: () => ({ addColorStop: noop }),
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => ({}),
    getImageData: () => ({ data: new Uint8ClampedArray(16) }),
    putImageData: noop,
  });
  globalThis.document = {
    createElement(tag) {
      if (tag === "canvas") {
        return {
          width: 256,
          height: 256,
          getContext: createCtx,
        };
      }
      return { style: {}, append: noop, setAttribute: noop };
    },
  };
}

import { loadGeography } from "../src/modules/areas/AreaModel.js";
import { GeographicWorld } from "../src/core/world/GeographicWorld.js";
import { isFootway, roadWidth } from "../src/core/world/roadProfile.js";
import { hitsCampusWall } from "../src/core/shared/architecture/CampusWalls.js";
import { collectRoadIntersections } from "../src/core/world/IntersectionSigns.js";
import { onOtherCarriageway } from "../src/core/world/streetPlacement.js";
import { nearestPoint, inside } from "../src/core/shared/geography/geometry.js";

const REGIONS = [
  "quoc-hoc",
  "south-bank",
  "truong-tien",
  "nguyen-chi-dieu",
  "quang-trung",
];

function buildWorldSync(region) {
  const scene = new THREE.Scene();
  const world = new GeographicWorld(scene);
  world.quality = {
    mobile: false,
    shadows: false,
    shadowMapSize: 1024,
    grassSamples: 4000,
    grassSpan: 120,
  };
  world.region = region;
  world.build();
  world.scene.updateMatrixWorld(true);
  return world;
}

function isBridgeRoad(r) {
  return (
    r.tags?.bridge === "yes" ||
    r.tags?.name === "Cầu Phú Xuân" ||
    r.id === 174759688
  );
}

function closestSegmentDist(a, b, roadPoints) {
  const mx = (a.x + b.x) / 2;
  const mz = (a.z + b.z) / 2;
  const q1 = { x: a.x * 0.75 + b.x * 0.25, z: a.z * 0.75 + b.z * 0.25 };
  const q3 = { x: a.x * 0.25 + b.x * 0.75, z: a.z * 0.25 + b.z * 0.75 };
  return Math.min(
    nearestPoint(a, roadPoints).distance,
    nearestPoint(q1, roadPoints).distance,
    nearestPoint({ x: mx, z: mz }, roadPoints).distance,
    nearestPoint(q3, roadPoints).distance,
    nearestPoint(b, roadPoints).distance,
  );
}

test("All 5 regions build cleanly with zero road encroachment, complete intersection signs, safe trees, and no coplanar turf Z-fighting", async () => {
  const box = new THREE.Box3();

  for (const regionId of REGIONS) {
    const region = await loadGeography(regionId);
    const world = buildWorldSync(region);
    const carriageways = world.renderRoads.filter((r) => !isFootway(r));
    const minMargin = regionId === "nguyen-chi-dieu" ? 2.4 : 1.9;

    // 1. Zero campus/property wall encroachment onto main carriageways
    const wallViolations = [];
    for (const seg of world.campusWallSegments || []) {
      const a = seg.a || seg;
      const b = seg.b || seg;
      if (!a || !b || !Number.isFinite(a.x) || !Number.isFinite(b.x)) continue;
      for (const road of carriageways) {
        const d = closestSegmentDist(a, b, road.points);
        const minReq = roadWidth(road) / 2 + minMargin;
        if (d < minReq) {
          wallViolations.push({
            schoolId: seg.schoolId || "unknown",
            roadId: road.id,
            roadName: road.tags?.name || road.tags?.highway,
            dist: Number(d.toFixed(3)),
            minReq: Number(minReq.toFixed(3)),
          });
        }
      }
    }
    assert.deepEqual(
      wallViolations,
      [],
      `[${regionId}] Campus walls encroaching onto carriageways: ${JSON.stringify(wallViolations.slice(0, 8))}`,
    );

    // 2. Zero street trees clipping into any campus/property fence
    const treeWallViolations = [];
    for (const t of world.treePositions || []) {
      if (hitsCampusWall(t, world.campusWallSegments || [], 2.05)) {
        treeWallViolations.push(t);
      }
      if (
        world.youthPlayground &&
        hitsCampusWall(t, world.youthPlayground.segments || [], 2.5)
      ) {
        treeWallViolations.push({ ...t, nearYouth: true });
      }
    }
    assert.deepEqual(
      treeWallViolations,
      [],
      `[${regionId}] Street trees clipping campus walls: ${JSON.stringify(treeWallViolations.slice(0, 8))}`,
    );

    // 3. Directional signs at ALL named non-footway intersections + clear placement
    const clusters = collectRoadIntersections(world.renderRoads, 22).filter(
      (c) =>
        c.roadNames.length >= 2 &&
        c.roads.some((r) => !isBridgeRoad(r)) &&
        c.center.x >= world.bounds.minX &&
        c.center.x <= world.bounds.maxX &&
        c.center.z >= world.bounds.minZ &&
        c.center.z <= world.bounds.maxZ,
    );
    const missingIntersections = [];
    for (const c of clusters) {
      const hasSign = (world.routeSignPlacements || []).some(
        (s) =>
          s.variant === "direction-warning" &&
          Math.hypot(s.x - c.center.x, s.z - c.center.z) <= 34,
      );
      if (!hasSign) {
        missingIntersections.push({
          center: c.center,
          roadNames: c.roadNames,
        });
      }
    }
    assert.deepEqual(
      missingIntersections,
      [],
      `[${regionId}] Intersections missing direction-warning signs: ${JSON.stringify(missingIntersections)}`,
    );

    const badSigns = [];
    for (const s of world.routeSignPlacements || []) {
      if (onOtherCarriageway(s, { id: null }, world.renderRoads, 1.1)) {
        badSigns.push({ ...s, reason: "onCarriageway" });
      } else if (world.riverRings?.some((r) => inside(s, r))) {
        badSigns.push({ ...s, reason: "inRiver" });
      } else if (
        world.campusWallSegments?.length &&
        hitsCampusWall(s, world.campusWallSegments, 0.9)
      ) {
        badSigns.push({ ...s, reason: "hitsWall" });
      }
    }
    assert.deepEqual(
      badSigns,
      [],
      `[${regionId}] Badly placed directional signs: ${JSON.stringify(badSigns.slice(0, 8))}`,
    );

    // 4. Coplanar horizontal surface / turf Z-fighting audit (exact downward raycast inside shared AABBs)
    const slabs = [];
    world.scene.traverse((obj) => {
      if (!obj.isMesh || !obj.visible || obj.isInstancedMesh) return;
      const mat = Array.isArray(obj.material) ? obj.material[0] : obj.material;
      if (!mat || mat.polygonOffset || mat.wireframe) return;
      box.setFromObject(obj);
      if (box.isEmpty()) return;
      const dx = box.max.x - box.min.x;
      const dy = box.max.y - box.min.y;
      const dz = box.max.z - box.min.z;
      if (dx < 2.2 || dz < 2.2 || dy > 0.85 || box.max.y > 1.2 || box.max.y < -0.05) {
        return;
      }
      if (dx > 1000 && dz > 1000) return;
      slabs.push({
        mesh: obj,
        name: obj.name || obj.parent?.name || mat.color?.getHexString?.() || "mesh",
        minX: box.min.x,
        maxX: box.max.x,
        minZ: box.min.z,
        maxZ: box.max.z,
        topY: box.max.y,
        color: mat.color?.getHexString?.() || "",
      });
    });

    const ray = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const origin = new THREE.Vector3();
    const coplanarOverlaps = [];
    const checkedPairs = new Set();

    for (let i = 0; i < slabs.length; i++) {
      const a = slabs[i];
      for (let j = i + 1; j < slabs.length; j++) {
        const b = slabs[j];
        if (Math.abs(a.topY - b.topY) >= 0.008) continue;
        const ox0 = Math.max(a.minX, b.minX);
        const ox1 = Math.min(a.maxX, b.maxX);
        const oz0 = Math.max(a.minZ, b.minZ);
        const oz1 = Math.min(a.maxZ, b.maxZ);
        if (ox1 - ox0 <= 0.6 || oz1 - oz0 <= 0.6) continue;

        let foundHit = null;
        for (const fx of [0.2, 0.5, 0.8]) {
          if (foundHit) break;
          for (const fz of [0.2, 0.5, 0.8]) {
            const x = ox0 + (ox1 - ox0) * fx;
            const z = oz0 + (oz1 - oz0) * fz;
            origin.set(x, 3.0, z);
            ray.set(origin, down);
            const hitsA = ray.intersectObject(a.mesh, false).filter((h) => h.face && h.face.normal.y !== 0);
            const hitsB = ray.intersectObject(b.mesh, false).filter((h) => h.face && h.face.normal.y !== 0);
            if (!hitsA.length || !hitsB.length) continue;
            const yA = hitsA[0].point.y;
            const yB = hitsB[0].point.y;
            if (Math.abs(yA - yB) < 0.008 && yA > -0.04 && yA < 1.1) {
              foundHit = { x: Number(x.toFixed(1)), z: Number(z.toFixed(1)), yA: Number(yA.toFixed(4)), yB: Number(yB.toFixed(4)) };
              break;
            }
          }
        }
        if (foundHit) {
          const key = `${i}:${j}`;
          if (!checkedPairs.has(key)) {
            checkedPairs.add(key);
            coplanarOverlaps.push({
              a: `${a.name}(#${a.color})`,
              b: `${b.name}(#${b.color})`,
              ...foundHit,
            });
          }
        }
      }
    }
    assert.deepEqual(
      coplanarOverlaps,
      [],
      `[${regionId}] Coplanar horizontal slab overlaps (<8mm raycast Y delta): ${JSON.stringify(coplanarOverlaps.slice(0, 12))}`,
    );

    // 5. Wild LivingGrass suppression on bespoke manicured parks/campuses
    if (world.grass) {
      const grassCenter = region.spawn || {
        x: (world.bounds.minX + world.bounds.maxX) / 2,
        z: (world.bounds.minZ + world.bounds.maxZ) / 2,
      };
      world.grass.update(grassCenter);
      const blockers = world.grass._job?.blockers || [];
      const isBlocked = (pt) => blockers.some((b) => b.blocksGrass(pt.x, pt.z));

      if (world.quocHocPark) {
        // Test park sample inside Bia Quoc Hoc & Phu Xuan Park lawns
        assert.ok(blockers.includes(world.quocHocPark), "quocHocPark must be a grass blocker");
      }
      if (world.ubndPalace?.site?.center) {
        assert.equal(isBlocked(world.ubndPalace.site.center), true, `[${regionId}] ubndPalace center must block wild grass`);
      }
      if (world.quocHocCampus?.site?.center) {
        assert.equal(isBlocked(world.quocHocCampus.site.center), true, `[${regionId}] quocHocCampus center must block wild grass`);
      }
      if (world.haiBaTrungCampus?.site?.center) {
        assert.equal(isBlocked(world.haiBaTrungCampus.site.center), true, `[${regionId}] haiBaTrungCampus center must block wild grass`);
      }
      if (world.quangTrungCampus?.site?.center) {
        assert.equal(isBlocked(world.quangTrungCampus.site.center), true, `[${regionId}] quangTrungCampus center must block wild grass`);
      }
      if (world.quangTrungEastPrecinct) {
        assert.equal(
          isBlocked(world.quangTrungEastPrecinct.toWorld(125, 25)),
          true,
          `[${regionId}] quangTrungEastPrecinct lawn must block wild grass`,
        );
      }
    }
  }
});
