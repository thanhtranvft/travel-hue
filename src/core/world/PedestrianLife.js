import config from "../../data/world/pedestrians.json" with { type: "json" };
import { getFeatures, getPointsOf } from "../shared/geography/activeGeography.js";
import { inside, nearestPoint } from "../shared/geography/geometry.js";
import { roadWidth, isFootway } from "./roadProfile.js";
import {
  BOARDWALK_Y,
  TRUONG_TIEN_ID,
  TRUONG_TIEN_SIDEWALK_IDS,
  TRUONG_TIEN_WALK_LIFT,
  truongTienHeightAtPoint,
} from "./roadSurface.js";
import { roadsidePoint, onOtherCarriageway } from "./streetPlacement.js";
import { makePerson, animateWalker, SOCIETY_PRESETS } from "./People.js";
import { hitsCampusWall } from "../shared/architecture/CampusWalls.js";
import {
  PROMENADE_Y,
  UNDER_BRIDGE_PROMENADE_POINTS,
} from "../../modules/areas/truong-tien/view/TruongTienSurroundings.js";
import { truongTienDeckQuery } from "../../modules/areas/truong-tien/view/BridgeView.js";

export const TRUONG_TIEN_NO_CROSS_IDS = new Set([
  39421601,
  39420171,
  1167513749,
  1167513750,
  1493443039,
  1167997495,
  1446966276,
  1446966277,
  1443492618,
  1167997493,
  1167529087,
  1167529091,
  257257957,
]);

export function pedestrianGround(world, road, p) {
  if (road.id === TRUONG_TIEN_ID) {
    return truongTienHeightAtPoint(road, p.x, p.z) + TRUONG_TIEN_WALK_LIFT;
  }
  const hit = nearestPoint(p, road.points);
  const y =
    world.roadHeight(road, hit.index - 1) * (1 - hit.t) +
    world.roadHeight(road, hit.index) * hit.t;
  const onPhuXuanSidewalk =
    (!isFootway(road) &&
      road.tags.name === "Cầu Phú Xuân" &&
      (road.tags.bridge === "yes" || road.tags.layer === "2")) ||
    (isFootway(road) && road.tags.layer === "2");
  return onPhuXuanSidewalk ? y + 0.16 : y;
}
// Query at the current position, keeping the reference level for stacked bridges.
export function pedestrianSurface(world, person) {
  const p = person.mesh.position;
  const reference = Number.isFinite(person.fixedY) ? person.fixedY
    : person.road ? pedestrianGround(world, person.road, p) : 0.17;
  const surface = world.groundAt?.(p.x, p.z, reference);
  return Number.isFinite(surface) ? surface : reference;
}
export function pedestrianSafe(world, p, park, walkwayRoad) {
  const bridge =
    walkwayRoad &&
    (walkwayRoad.tags.bridge === "yes" || walkwayRoad.tags.layer === "2");
  const b = world.bounds;
  if (p.x < b.minX || p.x > b.maxX || p.z < b.minZ || p.z > b.maxZ)
    return false;
  if (park && !inside(p, park)) return false;
  if (!bridge && world.riverRings.some((r) => inside(p, r))) return false;
  const local =
      bridge && world.roadGrid
        ? [
            ...new Set(
              (
                world.roadGrid.get(
                  `${Math.floor(p.x / 64)},${Math.floor(p.z / 64)}`,
                ) || []
              ).map((s) => s.road),
            ),
          ]
        : world.renderRoads,
    bridgeY = bridge ? pedestrianGround(world, walkwayRoad, p) : 0;
  const sameLevel = bridge
    ? local.filter((r) => Math.abs(pedestrianGround(world, r, p) - bridgeY) < 1)
    : local;
  if (
    onOtherCarriageway(p, bridge ? walkwayRoad : { id: null }, sameLevel, 0.5)
  )
    return false;
  if (
    hitsCampusWall(
      p,
      world.nearCampusWalls
        ? world.nearCampusWalls(p.x, p.z)
        : world.campusWallSegments || [],
      0.55,
    )
  )
    return false;
  if (!bridge && world.truongTienRoad) {
    const tq = truongTienDeckQuery(world.truongTienRoad, p.x, p.z);
    if (tq.onBridge) {
      const underBridgeLower =
        tq.along >= 348 &&
        tq.along <= 386 &&
        (world.boardwalkView?.queryDeck(p.x, p.z)?.onBoardwalk ||
          world.truongTienSurroundings?.isOnPromenade(p.x, p.z));
      if (!underBridgeLower) return false;
    }
    const approachHit = world.renderRoads
      ?.filter((r) => r.id === 39421601 || r.id === 39420171)
      .some((r) => nearestPoint(p, r.points).distance < 11.5);
    if (approachHit) return false;
  }
  if (walkwayRoad?.id === TRUONG_TIEN_ID) {
    const tq = truongTienDeckQuery(walkwayRoad, p.x, p.z);
    if (!tq.onBridge || tq.along < 15 || tq.along > 394 || Math.abs(tq.lat) < 7.5) {
      return false;
    }
  }
  if (world.dongDaCorridor?.blocksPedestrian?.(p.x, p.z)) return false;
  if (world.hitsTree?.(p.x, p.z, bridge ? bridgeY : 0)) return false;
  if (world.hoChiMinhMuseum?.canRide?.(p.x, p.z) === false) return false;
  return !world.buildingPolygons.some(
    (b) =>
      p.x > b.minX &&
      p.x < b.maxX &&
      p.z > b.minZ &&
      p.z < b.maxZ &&
      inside(p, b.points),
  );
}
export class PedestrianLife {
  constructor(world) {
    this.world = world;
    this.people = [];
    this.stats = { sidewalkLeft: 0, sidewalkRight: 0, parkPeople: 0, parks: 0 };
    this.templates = SOCIETY_PRESETS.map((preset) => makePerson(preset));
    let seed = 1021;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    const add = (point, mode, extra = {}) => {
      const index = this.people.length,
        tpl = this.templates[index % this.templates.length],
        mesh = tpl.clone(true); // Rebind limb references after cloning.
      mesh.userData.role = tpl.userData.role;
      mesh.userData.limbs = { legs: [], arms: [] };
      for (const child of mesh.children) {
        if (child.name === "leg-pivot") mesh.userData.limbs.legs.push(child);
        else if (child.name === "arm-pivot") mesh.userData.limbs.arms.push(child);
        else if (child.isGroup && child.name !== "head-group") {
          if (child.position.y < 1) mesh.userData.limbs.legs.push(child);
          else mesh.userData.limbs.arms.push(child);
        }
      }
      const role = mesh.userData.role;
      const walkSpeed =
        role === "elder-man" || role === "elder-woman"
          ? 0.62
          : role === "boy" || role === "girl"
            ? 0.92
            : 0.8;
      mesh.position.set(
        point.x,
        extra.road ? pedestrianGround(world, extra.road, point) : 0.17,
        point.z,
      );
      mesh.rotation.y = random() * Math.PI * 2;
      mesh.position.y = pedestrianSurface(world, {mesh,...extra});
      world.scene.add(mesh);
      this.people.push({
        type: "pedestrian",
        role,
        speed: mode === "walk" ? walkSpeed : 0,
        pause: 0,
        mesh,
        mode,
        origin: { ...point },
        phase: random() * 6.28,
        ...extra,
      });
    };
    const preferredMain = world.renderRoads.some(
      (r) => r.tags.name === "Lê Lợi",
    )
      ? "Lê Lợi"
      : "Đống Đa";
    const pedestrianRoads = world.renderRoads
      .filter(
        (r) =>
          !TRUONG_TIEN_SIDEWALK_IDS.has(r.id) &&
          !TRUONG_TIEN_NO_CROSS_IDS.has(r.id) &&
          (isFootway(r) ||
            [
              "primary",
              "secondary",
              "tertiary",
              "residential",
              "service",
              "unclassified",
              "living_street",
            ].includes(r.tags.highway)),
      )
      .sort(
        (a, b) =>
          (b.tags.name === preferredMain) - (a.tags.name === preferredMain),
      );
    // Both sides get paired walkers. Validate the entire short shuttle, not just endpoints.
    const routes = [];
    for (const road of pedestrianRoads)
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1],
          b = road.points[i],
          length = Math.hypot(b.x - a.x, b.z - a.z);
        if (length < 12) continue;
        for (let d = 3; d < length - 9; d += 24)
          for (const side of [-1, 1]) {
            const bridge =
                road.tags.bridge === "yes" || road.tags.layer === "2",
              offset = isFootway(road)
                ? 0.75
                : road.id === TRUONG_TIEN_ID
                  ? 8.55
                  : road.tags.name === "Cầu Phú Xuân" && bridge
                    ? roadWidth(road) / 2 + 1.2
                    : bridge
                      ? roadWidth(road) / 2 - 1.5
                      : roadWidth(road) / 2 + 1.1,
              start = roadsidePoint(a, b, d, offset, side),
              end = roadsidePoint(
                a,
                b,
                Math.min(length - 3, d + 18),
                offset,
                side,
              );
            let valid = true;
            for (let t = 0; t <= 1; t += 0.1)
              if (
                !pedestrianSafe(
                  world,
                  {
                    x: start.x + (end.x - start.x) * t,
                    z: start.z + (end.z - start.z) * t,
                  },
                  undefined,
                  road,
                )
              ) {
                valid = false;
                break;
              }
            if (valid) routes.push({ start, end, side, road });
          }
      }
    // Sample across the whole network instead of filling only the first road.
    for (let i = 0; i < Math.min(config.sidewalkWalkers, routes.length); i++) {
      const route =
        routes[
          Math.floor(
            (i * routes.length) /
              Math.min(config.sidewalkWalkers, routes.length),
          )
        ];
      add(route.start, "walk", route);
      this.stats[route.side < 0 ? "sidewalkLeft" : "sidewalkRight"]++;
    }
    for (const feature of getFeatures().filter(
      (f) =>
        f.type === "way" &&
        f.tags?.leisure === "park" &&
        f.geometry?.length > 3,
    )) {
      const polygon = getPointsOf(feature),
        minX = Math.min(...polygon.map((p) => p.x)),
        maxX = Math.max(...polygon.map((p) => p.x)),
        minZ = Math.min(...polygon.map((p) => p.z)),
        maxZ = Math.max(...polygon.map((p) => p.z));
      let placed = 0;
      for (let cluster = 0; cluster < 4; cluster++) {
        let center;
        for (let attempt = 0; attempt < 150; attempt++) {
          const p = {
            x: minX + random() * (maxX - minX),
            z: minZ + random() * (maxZ - minZ),
          };
          if (pedestrianSafe(world, p, polygon)) {
            center = p;
            break;
          }
        }
        if (!center) continue;
        for (let n = 0; n < config.peoplePerPark / 4; n++) {
          const angle = (n * Math.PI) / 3,
            point = {
              x: center.x + Math.cos(angle) * 1.7,
              z: center.z + Math.sin(angle) * 1.7,
            };
          if (!pedestrianSafe(world, point, polygon)) continue;
          add(point, n % 3 === 0 ? "play" : "chat", {
            park: polygon,
            parkId: feature.id,
          });
          this.people.at(-1).mesh.rotation.y = Math.atan2(
            center.x - point.x,
            center.z - point.z,
          );
          placed++;
        }
      }
      if (placed) {
        this.stats.parks++;
        this.stats.parkPeople += placed;
      }
    }

    // Dedicated strollers along the under-bridge riverside promenade & extended Cầu Gỗ Lim
    if (world.truongTienSurroundings) {
      for (let i = 1; i < UNDER_BRIDGE_PROMENADE_POINTS.length; i++) {
        const a = UNDER_BRIDGE_PROMENADE_POINTS[i - 1];
        const b = UNDER_BRIDGE_PROMENADE_POINTS[i];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len;
        const nz = dx / len;
        const sideOffset = (i % 2 === 0 ? 1 : -1) * 1.1;
        const start = { x: a.x + nx * sideOffset, z: a.z + nz * sideOffset };
        const end = { x: b.x + nx * sideOffset, z: b.z + nz * sideOffset };
        add(start, "walk", {
          start,
          end,
          side: i % 2 === 0 ? 1 : -1,
          fixedY: PROMENADE_Y,
          underBridgePromenade: true,
        });
        this.people.at(-1).mesh.position.y = PROMENADE_Y;
      }
    }
    if (world.boardwalkView?.mainPoints?.length > 4) {
      const bwPts = world.boardwalkView.mainPoints;
      const bwStep = Math.max(2, Math.floor(bwPts.length / 18));
      for (let i = 1; i < bwPts.length; i += bwStep) {
        const a = bwPts[i - 1];
        const b = bwPts[Math.min(bwPts.length - 1, i + 1)];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const len = Math.hypot(dx, dz) || 1;
        const nx = -dz / len;
        const nz = dx / len;
        const sideOffset = (i % 2 === 1 ? 1 : -1) * 0.85;
        const start = { x: a.x + nx * sideOffset, z: a.z + nz * sideOffset };
        const end = { x: b.x + nx * sideOffset, z: b.z + nz * sideOffset };
        add(start, "walk", {
          start,
          end,
          side: i % 2 === 1 ? 1 : -1,
          fixedY: BOARDWALK_Y + 0.008,
          underBridgePromenade: true,
        });
        this.people.at(-1).mesh.position.y = BOARDWALK_Y + 0.008;
      }
    }

    // Strollers along the continuous south-bank riverfront ironwood promenade & park plazas
    if (world.biaPark?.toWorld) {
      const parkPromenadeSegments = [
        [-66, -13.3, -38, -13.3, 0.256],
        [36, -13.3, 66, -13.3, 0.256],
        [76, -13.3, 114, -13.3, 0.256],
        [120, -13.3, 152, -13.3, 0.256],
        [158, -13.3, 198, -13.3, 0.256],
        [204, -13.4, 248, -13.2, 0.256],
        [254, -13.2, 282, -13.2, 0.256],
        [297, -13.2, 334, -13.2, 0.256],
        [340, -13.4, 368, -14.1, 0.256],
        [374, -14.1, 412, -14.1, 0.256],
        [418, -14.1, 456, -13.8, 0.256],
        [462, -13.8, 504, -13.4, 0.256],
        [508, -13.3, 530, -12.6, 0.256],
        // Grand plaza & clearing strollers
        [-24, 24, -6, 24, 0.24],
        [6, 24, 24, 24, 0.24],
        [142, 16, 168, 16, 0.24],
        [264, 6.5, 276.5, 6.5, 0.24],
        [302, 6.5, 315, 6.5, 0.24],
        [439.5, 2.0, 439.5, 26.0, 0.24],
        [488.7, 2.0, 488.7, 24.0, 0.24],
      ];
      const safeWalkSeg = (wA, wB, yVal) => {
        for (let t = 0; t <= 1.0001; t += 0.1) {
          const x = wA.x + (wB.x - wA.x) * t;
          const z = wA.z + (wB.z - wA.z) * t;
          if (world.hitsTree?.(x, z, yVal)) return false;
          if (world.quocHocPark?.canRide?.(x, z) === false) return false;
        }
        return true;
      };
      parkPromenadeSegments.forEach(([ax, az, bx, bz, yVal], idx) => {
        const wA = world.biaPark.toWorld(ax, az);
        const wB = world.biaPark.toWorld(bx, bz);
        if (!safeWalkSeg(wA, wB, yVal)) return;
        add(wA, "walk", {
          start: wA,
          end: wB,
          side: idx % 2 === 0 ? 1 : -1,
          fixedY: yVal,
          underBridgePromenade: true,
        });
        this.people.at(-1).mesh.position.y = yVal;
        // A second lane of strollers, with room in the centre for players.
        if (idx < 13) {
          const length = Math.hypot(wB.x-wA.x,wB.z-wA.z) || 1;
          const offset = { x: -(wB.z-wA.z)/length*0.8, z: (wB.x-wA.x)/length*0.8 };
          const start = { x:wB.x+offset.x, z:wB.z+offset.z };
          const end = { x:wA.x+offset.x, z:wA.z+offset.z };
          if (safeWalkSeg(start,end,yVal)) {
            add(start,"walk",{start,end,side:-1,fixedY:yVal,underBridgePromenade:true});
            this.people.at(-1).mesh.position.y=yVal;
          }
        }
      });
      const shoreCenterAtLx = (lx) => {
        const hits = [];
        for (let lz = -54; lz <= -16; lz += 0.5) {
          const wp = world.biaPark.toWorld(lx, lz);
          const gy = world.quocHocPark?.groundAt?.(wp.x, wp.z, 0.36);
          if (gy !== null && gy !== undefined && Math.abs(gy - 0.36) < 0.02) {
            hits.push(lz);
          }
        }
        if (!hits.length) return null;
        return world.biaPark.toWorld(lx, (hits[0] + hits[hits.length - 1]) / 2);
      };
      [
        [72, 110],
        [114, 152],
        [158, 210],
        [224, 254],
        [258, 282],
        [301, 330],
        [334, 362],
        [370, 396],
        [400, 428],
      ].forEach(([lxA, lxB], idx) => {
        const wA = shoreCenterAtLx(lxA);
        const wB = shoreCenterAtLx(lxB);
        if (!wA || !wB || !safeWalkSeg(wA, wB, 0.36)) return;
        add(wA, "walk", {
          start: wA,
          end: wB,
          side: idx % 2 === 0 ? 1 : -1,
          fixedY: 0.36,
          underBridgePromenade: true,
        });
        this.people.at(-1).mesh.position.y = 0.36;
      });
    }
  }
  update(time, bike) {
    if (
      this.world.quality?.mobile &&
      time - (this.lastUpdate ?? -Infinity) < 0.05
    )
      return;
    this.lastUpdate = time;
    for (const person of this.people) {
      const { mesh, origin, phase } = person;
      mesh.visible =
        Math.hypot(origin.x - bike.x, origin.z - bike.z) <
        (this.world.quality?.crowdDistance || config.visibleDistance);
      if (!mesh.visible) continue;
      if (person.pause > 0) {
        person.pause = Math.max(0, person.pause - 0.02);
        continue;
      }
      if (person.mode === "walk") {
        const length = Math.hypot(
            person.end.x - person.start.x,
            person.end.z - person.start.z,
          ),
          u = (Math.sin((time * 0.9) / Math.max(3, length) + phase) + 1) / 2;
        mesh.position.x = person.start.x + (person.end.x - person.start.x) * u;
        mesh.position.z = person.start.z + (person.end.z - person.start.z) * u;
        const direction =
          Math.cos((time * 0.9) / Math.max(3, length) + phase) > 0 ? 1 : -1;
        mesh.rotation.y = Math.atan2(
          (person.end.x - person.start.x) * direction,
          (person.end.z - person.start.z) * direction,
        );
        animateWalker(mesh, time * 3.5 + phase);
      } else if (person.mode === "play") {
        const p = {
          x: origin.x + Math.sin(time * 0.8 + phase) * 0.7,
          z: origin.z + Math.cos(time * 0.8 + phase) * 0.7,
        };
        if (pedestrianSafe(this.world, p, person.park)) {
          mesh.position.x = p.x;
          mesh.position.z = p.z;
        }
        animateWalker(mesh, time * 5 + phase);
      } else {
        for (const [i, arm] of mesh.userData.limbs.arms.entries())
          arm.rotation.x = Math.sin(time * 1.6 + phase + i) * 0.22 - 0.2;
      }
      mesh.position.y = pedestrianSurface(this.world, person);
    }
  }
}
