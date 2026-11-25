import { nearestPoint, inside } from "../shared/geography/geometry.js";
import { hitsCampusWall } from "../shared/architecture/CampusWalls.js";
import { isFootway, roadWidth } from "./roadProfile.js";
import { onOtherCarriageway, roadsidePoint } from "./streetPlacement.js";
import { routeTrafficSign } from "./TrafficBoard.js";

const HIGHWAY_RANK = {
  trunk: 6,
  primary: 5,
  secondary: 4,
  tertiary: 3,
  unclassified: 2,
  residential: 1,
  service: 0,
};

function roadRank(road) {
  return HIGHWAY_RANK[road.tags?.highway] ?? 1;
}

function roadBBox(road) {
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const p of road.points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.z < minZ) minZ = p.z;
    if (p.z > maxZ) maxZ = p.z;
  }
  return { minX, maxX, minZ, maxZ };
}

function segmentIntersect2D(a, b, c, d) {
  const rX = b.x - a.x;
  const rZ = b.z - a.z;
  const sX = d.x - c.x;
  const sZ = d.z - c.z;
  const denom = rX * sZ - rZ * sX;
  if (Math.abs(denom) < 1e-6) return null;
  const cax = c.x - a.x;
  const caz = c.z - a.z;
  const t = (cax * sZ - caz * sX) / denom;
  const u = (cax * rZ - caz * rX) / denom;
  if (t >= -0.02 && t <= 1.02 && u >= -0.02 && u <= 1.02) {
    return { x: a.x + rX * t, z: a.z + rZ * t };
  }
  return null;
}

function pointInsideAnyCampus(world, p) {
  const campuses = [
    world.quocHocCampus,
    world.haiBaTrungCampus,
    world.nguyenChiDieuCampus,
    world.caoThangCampus,
    world.quangTrungCampus,
    world.youthPlayground,
    world.ubndPalace,
    world.hoChiMinhMuseum,
    world.hueCit,
    world.vincomPlaza,
    world.benhVienRhmHue,
    world.dongChuaCuuTheChurch,
  ];
  return campuses.some((c) => c?.inCampus?.(p.x, p.z));
}

function isBridgeRoad(r) {
  return (
    r.tags?.bridge === "yes" ||
    r.tags?.name === "Cầu Phú Xuân" ||
    r.id === 174759688
  );
}

export function collectRoadIntersections(renderRoads, clusterRadius = 22) {
  const namedRoads = (renderRoads || []).filter(
    (r) => r.tags?.name && !isFootway(r) && r.points?.length >= 2,
  );
  const boxes = namedRoads.map(roadBBox);
  const raw = [];

  for (let i = 0; i < namedRoads.length; i++) {
    const rA = namedRoads[i];
    const bA = boxes[i];
    for (let j = i + 1; j < namedRoads.length; j++) {
      const rB = namedRoads[j];
      if (rA.tags.name === rB.tags.name) continue;
      const bB = boxes[j];
      if (
        bA.maxX + 4 < bB.minX ||
        bA.minX - 4 > bB.maxX ||
        bA.maxZ + 4 < bB.minZ ||
        bA.minZ - 4 > bB.maxZ
      ) {
        continue;
      }

      let found = false;
      for (let ia = 1; ia < rA.points.length; ia++) {
        const a1 = rA.points[ia - 1];
        const a2 = rA.points[ia];
        for (let ib = 1; ib < rB.points.length; ib++) {
          const b1 = rB.points[ib - 1];
          const b2 = rB.points[ib];
          const hit = segmentIntersect2D(a1, a2, b1, b2);
          if (hit) {
            raw.push({ x: hit.x, z: hit.z, roads: [rA, rB] });
            found = true;
          }
        }
      }
      if (!found) {
        for (const pt of [rA.points[0], rA.points.at(-1)]) {
          const hit = nearestPoint(pt, rB.points);
          if (hit.distance < 2.2) {
            raw.push({ x: hit.x, z: hit.z, roads: [rA, rB] });
          }
        }
        for (const pt of [rB.points[0], rB.points.at(-1)]) {
          const hit = nearestPoint(pt, rA.points);
          if (hit.distance < 2.2) {
            raw.push({ x: hit.x, z: hit.z, roads: [rA, rB] });
          }
        }
      }
    }
  }

  const clusters = [];
  for (const item of raw) {
    let target = clusters.find(
      (c) => Math.hypot(c.center.x - item.x, c.center.z - item.z) < clusterRadius,
    );
    if (!target) {
      target = {
        points: [],
        center: { x: item.x, z: item.z },
        roadSet: new Set(),
      };
      clusters.push(target);
    }
    target.points.push(item);
    for (const r of item.roads) target.roadSet.add(r);
    const n = target.points.length;
    target.center = target.points.reduce(
      (acc, p) => ({ x: acc.x + p.x / n, z: acc.z + p.z / n }),
      { x: 0, z: 0 },
    );
  }

  for (const c of clusters) {
    c.roads = [...c.roadSet].sort((a, b) => roadRank(b) - roadRank(a));
    c.roadNames = [...new Set(c.roads.map((r) => r.tags.name))];
  }
  return clusters;
}

export function addIntersectionDirectionSigns(world) {
  world.routeSignPlacements ??= [];
  const clusters = collectRoadIntersections(world.renderRoads, 22);
  const { scene, renderRoads } = world;

  const isPointClear = (p, minOtherSignDist) => {
    if (
      p.x < world.bounds.minX + 2 ||
      p.x > world.bounds.maxX - 2 ||
      p.z < world.bounds.minZ + 2 ||
      p.z > world.bounds.maxZ - 2
    ) {
      return false;
    }
    if (world.riverRings?.some((r) => inside(p, r))) return false;
    if (onOtherCarriageway(p, { id: null }, renderRoads, 1.3)) return false;
    if (
      world.buildingPolygons?.some(
        (b) =>
          p.x >= b.minX - 0.6 &&
          p.x <= b.maxX + 0.6 &&
          p.z >= b.minZ - 0.6 &&
          p.z <= b.maxZ + 0.6 &&
          inside(p, b.points),
      )
    ) {
      return false;
    }
    if (pointInsideAnyCampus(world, p)) return false;
    if (
      world.campusWallSegments?.length &&
      hitsCampusWall(p, world.nearCampusWalls ? world.nearCampusWalls(p.x, p.z) : world.campusWallSegments, 1.15)
    ) {
      return false;
    }
    if (
      world.schoolGates?.some((g) => Math.hypot(p.x - g.x, p.z - g.z) < 6.5) ||
      world.allGateClearances?.some((g) => Math.hypot(p.x - g.x, p.z - g.z) < 6.0)
    ) {
      return false;
    }
    if (
      world.trafficSignalPositions?.some(
        (s) => Math.hypot(p.x - s.x, p.z - s.z) < 3.0,
      )
    ) {
      return false;
    }
    if (
      world.routeSignPlacements.some(
        (s) => Math.hypot(p.x - s.x, p.z - s.z) < minOtherSignDist,
      )
    ) {
      return false;
    }
    return true;
  };

  for (const cluster of clusters) {
    if (cluster.roadNames.length < 2) continue;
    const hasDirWarning = world.routeSignPlacements.some(
      (s) =>
        s.variant === "direction-warning" &&
        Math.hypot(s.x - cluster.center.x, s.z - cluster.center.z) < 30,
    );
    if (hasDirWarning) continue;

    const groundRoads = cluster.roads.filter((r) => !isBridgeRoad(r));
    if (!groundRoads.length) continue;

    const primaryRoad = groundRoads[0];
    const primaryName = primaryRoad.tags.name;
    const crossNames = cluster.roadNames
      .filter((n) => n !== primaryName)
      .slice(0, 2);
    const title = `GIAO LỘ · ${(crossNames.join(" · ") || primaryName).toUpperCase()}`;
    const subtitle = `ĐƯỜNG ${primaryName.toUpperCase()}`;

    let placed = 0;
    for (const minSignSpacing of [9.0, 4.5, 2.0]) {
      if (placed > 0) break;
      for (const road of groundRoads) {
        if (placed >= 2) break;
        const hit = nearestPoint(cluster.center, road.points);
        const a = road.points[hit.index - 1];
        const b = road.points[hit.index];
        if (!a || !b) continue;
        const segLen = Math.hypot(b.x - a.x, b.z - a.z);
        if (segLen < 0.5) continue;
        const dx = (b.x - a.x) / segLen;
        const dz = (b.z - a.z) / segLen;
        const hitDistAlong = hit.t * segLen;

        for (const alongOffset of [11, 15, 8, 19, 5, 23]) {
          if (placed >= 2) break;
          for (const dir of [-1, 1]) {
            if (placed >= 2) break;
            const dAlong = Math.max(
              1.0,
              Math.min(segLen - 1.0, hitDistAlong + dir * alongOffset),
            );
            for (const latOffset of [
              roadWidth(road) / 2 + 1.5,
              roadWidth(road) / 2 + 1.85,
              roadWidth(road) / 2 + 1.25,
            ]) {
              const cand = roadsidePoint(a, b, dAlong, latOffset, dir);
              if (
                Math.hypot(cand.x - cluster.center.x, cand.z - cluster.center.z) >
                28
              ) {
                continue;
              }
              if (!isPointClear(cand, minSignSpacing)) continue;

              const sign = routeTrafficSign({
                variant: "direction-warning",
                title,
                subtitle,
                warning: "junction",
              });
              const gy = world.groundAt(cand.x, cand.z);
              sign.position.set(cand.x, Number.isFinite(gy) ? gy : 0.23, cand.z);
              // Face approaching cyclists toward the intersection
              sign.rotation.y = Math.atan2(dx * dir, dz * dir);
              scene.add(sign);
              world.routeSignPlacements.push({
                x: cand.x,
                z: cand.z,
                heading: Math.atan2(-dx * dir, -dz * dir),
                roadId: road.id,
                roadName: road.tags.name,
                direction: dir,
                variant: "direction-warning",
              });
              placed++;
              break;
            }
          }
        }
      }
    }
  }
}
