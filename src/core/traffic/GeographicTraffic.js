import * as THREE from "three";
import { TrafficSystem } from "./TrafficSystem.js";
import { getMainRoads, getRoads } from "../shared/geography/activeGeography.js";
import { wrapAngle } from "../vehicle/BicycleMotion.js";
import { animateWalker, makeSocietyPerson } from "../world/People.js";
import { roadWidth } from "../world/roadProfile.js";
import {
  TRUONG_TIEN_ID,
  TRUONG_TIEN_SIDEWALK_IDS,
  TRUONG_TIEN_WALK_LIFT,
  truongTienElevation,
} from "../world/roadSurface.js";
import { TRUONG_TIEN_NO_CROSS_IDS } from "../world/PedestrianLife.js";
import { box, mat } from "../shared/architecture/shared.js";
import { sweptContact } from "./collision.js";
import { policeScooter } from "./PoliceScooter.js";
import { PatrolWarnings } from "./PatrolWarnings.js";
import patrolConfig from "../../data/world/police-patrols.json" with { type: "json" };

import { car, scooter } from "./TrafficSystem.js";
function truck() {
  const g = new THREE.Group();
  g.add(
    box([2.2, 2.5, 3.8], "#d4d6c8", [0, 1.9, -0.8]),
    box([2.1, 1.8, 1.7], "#4c8491", [0, 1.45, 1.8]),
    box([1.85, 0.65, 0.05], "#324d58", [0, 1.95, 2.67]),
    box([2.2, 0.22, 0.22], "#b5bcb5", [0, 0.65, 2.72]),
  );
  for (const x of [-1.1, 1.1])
    for (const z of [-2, 1.8]) {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.22, 16),
        mat("#252b2b"),
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.49, z);
      g.add(wheel);
    }
  return g;
}

const PHU_XUAN_RAMP_SOUTH = 39420686;
const PHU_XUAN_SPAN = 39419121;
const PHU_XUAN_RAMP_NORTH = 39453301;

export function stitchBridgeRoutes(roads, world) {
  const heightAt = (road, index) =>
    world?.roadHeight ? world.roadHeight(road, index) : 0.32;
  const south = roads.find((r) => r.id === PHU_XUAN_RAMP_SOUTH);
  const span = roads.find((r) => r.id === PHU_XUAN_SPAN);
  const north = roads.find((r) => r.id === PHU_XUAN_RAMP_NORTH);
  const phuXuanIds = new Set([
    PHU_XUAN_RAMP_SOUTH,
    PHU_XUAN_SPAN,
    PHU_XUAN_RAMP_NORTH,
  ]);
  const stitched = [];
  for (const road of roads) {
    if (phuXuanIds.has(road.id)) continue;
    if (road.id === TRUONG_TIEN_ID && road.points.length >= 2) {
      const a = road.points[0];
      const b = road.points[road.points.length - 1];
      const mid = road.points.length > 2 ? road.points[1] : null;
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      const nx = -dz / len;
      const nz = dx / len;
      const midLat = mid ? (mid.x - a.x) * nx + (mid.z - a.z) * nz : 0;
      const steps = 24;
      const points = [];
      const heights = [];
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const latShift = 4 * t * (1 - t) * midLat;
        points.push({
          x: a.x + dx * t + nx * latShift,
          z: a.z + dz * t + nz * latShift,
        });
        heights.push(truongTienElevation(t));
      }
      stitched.push({
        ...road,
        isBridgeRoute: true,
        points,
        heights,
      });
    } else if (road.tags.bridge === "yes") {
      stitched.push({
        ...road,
        isBridgeRoute: true,
        heights: road.points.map((_, i) => heightAt(road, i)),
      });
    } else {
      stitched.push(road);
    }
  }
  if (south && span) {
    const southPts = south.points.slice().reverse();
    const southH = south.points.map((_, i) => heightAt(south, i)).reverse();
    const spanPts = span.points.slice(1);
    const spanH = span.points.slice(1).map((_, i) => heightAt(span, i + 1));
    const northPts = north ? north.points.slice(1) : [];
    const northH = north
      ? north.points.slice(1).map((_, i) => heightAt(north, i + 1))
      : [];
    stitched.unshift({
      ...span,
      id: "phu-xuan-corridor",
      tags: {
        ...span.tags,
        name: "Cầu Phú Xuân",
        bridge: "yes",
        lanes: "4",
      },
      isBridgeRoute: true,
      points: [...southPts, ...spanPts, ...northPts],
      heights: [...southH, ...spanH, ...northH],
    });
  } else {
    for (const road of roads) {
      if (!phuXuanIds.has(road.id)) continue;
      stitched.push({
        ...road,
        isBridgeRoute: true,
        heights: road.points.map((_, i) => heightAt(road, i)),
      });
    }
  }
  return stitched;
}

export class GeographicTraffic extends TrafficSystem {
  constructor(scene, world) {
    super(scene, world);
    const scooterSpecs = [
      { color: "#65878a", variant: "tay-ga", riderRole: "woman", riderShirt: "#e6a3b5", hasPassenger: false },
      { color: "#a64d42", variant: "xe-so", riderRole: "man", riderShirt: "#466885", hasPassenger: true, passengerRole: "woman" },
      { color: "#d5ccb8", variant: "tay-ga", riderRole: "woman", riderShirt: "#7aa899", hasPassenger: true, passengerRole: "girl" },
      { color: "#3d556b", variant: "shipper", riderRole: "man", riderShirt: "#2c8a56", boxColor: "#228b54" },
      { color: "#c26c48", variant: "xe-so", riderRole: "man", riderShirt: "#e4dec9", hasPassenger: false },
      { color: "#5e8378", variant: "tay-ga", riderRole: "woman", riderShirt: "#f0c869", hasPassenger: true, passengerRole: "boy" },
    ];
    for (let i = 0; i < 12; i++) {
      this.add(
        "car",
        car(["#b7c4c1", "#a26951", "#eee7d4"][i % 3]),
        { x: 0, z: 0 },
        0,
        4.5 + (i % 3),
        "x",
        1,
      );
      this.add(
        "scooter",
        scooter(scooterSpecs[i % scooterSpecs.length]),
        { x: 0, z: 0 },
        0,
        5.5 + (i % 2),
        "x",
        1,
      );
    }
    for (let i = 0; i < 5; i++) {
      this.add("truck", truck(), { x: 0, z: 0 }, 0, 3.8 + i * 0.15, "x", 1);
      this.actors.at(-1).radius = 2.1;
    }
    for (let i = 0; i < 38; i++)
      this.add(
        "pedestrian",
        makeSocietyPerson(i),
        { x: 0, z: 0 },
        0,
        0.65 + (i % 4) * 0.14,
        "x",
        1,
      );
    const roads = getRoads(),
      mainRoads = getMainRoads(),
      bounds = this.world?.bounds,
      inBounds = (r) =>
        !bounds ||
        r.points.some(
          (p) =>
            p.x >= bounds.minX &&
            p.x <= bounds.maxX &&
            p.z >= bounds.minZ &&
            p.z <= bounds.maxZ,
        ),
      preferredMain = mainRoads.some((r) => r.tags.name === "Lê Lợi")
        ? "Lê Lợi"
        : "Đống Đa",
      rawVehicleRoadsAll = mainRoads.filter(
        (r) => r.points.length > 2 || r.tags?.junction === "roundabout",
      ),
      scopedVehicleRoads = rawVehicleRoadsAll.filter(inBounds),
      rawVehicleRoads = (
        scopedVehicleRoads.length ? scopedVehicleRoads : rawVehicleRoadsAll
      ).sort(
        (a, b) =>
          (b.tags.name === preferredMain) - (a.tags.name === preferredMain),
      ),
      vehicleRoads = stitchBridgeRoutes(rawVehicleRoads, this.world),
      footpaths = roads.filter(
        (r) =>
          r.tags.highway === "footway" &&
          !TRUONG_TIEN_SIDEWALK_IDS.has(r.id) &&
          !TRUONG_TIEN_NO_CROSS_IDS.has(r.id) &&
          r.id !== 1167513741 &&
          r.points.length > 3 &&
          inBounds(r),
      ),
      pedestrianVehicleRoads = vehicleRoads.filter(
        (r) =>
          r.id !== TRUONG_TIEN_ID &&
          !TRUONG_TIEN_NO_CROSS_IDS.has(r.id),
      );
    this.patrolWarnings = new PatrolWarnings(patrolConfig);
    if (patrolConfig.enabled && vehicleRoads.length) {
      const named = new Map();
      const length = (r) =>
        r.points
          .slice(1)
          .reduce(
            (sum, p, i) =>
              sum + Math.hypot(p.x - r.points[i].x, p.z - r.points[i].z),
            0,
          );
      for (const road of vehicleRoads)
        if (
          !named.has(road.tags.name) ||
          length(road) > length(named.get(road.tags.name))
        )
          named.set(road.tags.name, road);
      const patrolRoads = [...named.values()]
        .filter((r) => length(r) > 40)
        .sort((a, b) => length(b) - length(a))
        .slice(0, patrolConfig.maxPatrolsPerArea);
      patrolRoads.forEach((road, index) => {
        this.add(
          "scooter",
          policeScooter(),
          { x: 0, z: 0 },
          0,
          patrolConfig.speed,
          "x",
          1,
        );
        Object.assign(this.actors.at(-1), {
          isPolice: true,
          patrolRoad: road,
          patrolIndex: index,
          radius: 0.8,
        });
      });
    }
    const bridgeRoads = vehicleRoads.filter((r) => r.isBridgeRoute);
    this.actors.forEach((actor, index) => {
      const pedVehiclePool = pedestrianVehicleRoads.length
          ? pedestrianVehicleRoads
          : vehicleRoads,
        pavement =
          actor.type === "pedestrian" &&
          (index % 2 === 0 || !footpaths.length),
        candidates =
          actor.type === "pedestrian" && !pavement
            ? footpaths
            : actor.type === "pedestrian"
              ? pedVehiclePool
              : vehicleRoads,
        road =
          actor.patrolRoad ||
          (actor.type !== "pedestrian" &&
          bridgeRoads.length &&
          index % 4 === 1
            ? bridgeRoads[Math.floor(index / 4) % bridgeRoads.length]
            : candidates[
                actor.type !== "pedestrian" && index % 2 === 0
                  ? index %
                    Math.max(
                      1,
                      candidates.filter((r) => r.tags.name === preferredMain)
                        .length,
                    )
                  : index % candidates.length
              ]),
        points = road.points;
      actor.road = road;
      actor.track = new THREE.CurvePath();
      for (let i = 1; i < points.length; i++) {
        const y0 = road.heights
            ? road.heights[i - 1]
            : this.world.roadHeight(road, i - 1),
          y1 = road.heights ? road.heights[i] : this.world.roadHeight(road, i);
        actor.track.add(
          new THREE.LineCurve3(
            new THREE.Vector3(points[i - 1].x, y0, points[i - 1].z),
            new THREE.Vector3(points[i].x, y1, points[i].z),
          ),
        );
      }
      actor.trackLength = actor.track.getLength();
      actor.progress = actor.isPolice
        ? 0.07 + actor.patrolIndex * 0.5
        : (index * 0.173) % 1;
      actor.direction = road.tags.oneway === "yes" ? 1 : index % 2 ? 1 : -1;
      actor.lane =
        actor.type === "pedestrian"
          ? pavement
            ? road.id === TRUONG_TIEN_ID
              ? 8.55
              : roadWidth(road) / 2 + 1.1
            : 0
          : road.isBridgeRoute
            ? roadWidth(road) *
              (actor.type === "scooter" ||
              (actor.type === "car" && index % 2 === 1)
                ? 0.355
                : 0.135)
            : roadWidth(road) * 0.25;
      this.place(actor);
    });
  }
  place(actor) {
    const p = actor.track.getPointAt(actor.progress),
      t = actor.track.getTangentAt(actor.progress),
      hLen = Math.hypot(t.x, t.z) || 1,
      tx = t.x / hLen,
      tz = t.z / hLen,
      x = p.x - tz * actor.lane * actor.direction,
      z = p.z + tx * actor.lane * actor.direction,
      baseY = actor.road?.isBridgeRoute
        ? p.y
        : p.y > 0.45
          ? p.y
          : this.world.groundAt(x, z, p.y),
      y =
        baseY +
        (actor.type === "pedestrian" && actor.road?.id === TRUONG_TIEN_ID
          ? TRUONG_TIEN_WALK_LIFT
          : actor.type === "pedestrian" &&
              actor.road?.tags?.name === "Cầu Phú Xuân" &&
              p.y > 4
            ? 0.16
            : 0);
    actor.mesh.position.set(x, y, z);
    actor.heading = Math.atan2(tx * actor.direction, tz * actor.direction);
    actor.mesh.rotation.y = actor.heading;
    actor.previous = { x: actor.mesh.position.x, z: actor.mesh.position.z };
  }
  step(dt, bike) {
    if (!this.enabled) return;
    this.time += dt;
    for (const actor of this.actors) {
      const old = { x: actor.mesh.position.x, z: actor.mesh.position.z };
      let speed = actor.baseSpeed;
      if (actor.pause > 0) {
        actor.pause -= dt;
        speed = 0;
      }
      const dx = bike.position.x - old.x,
        dz = bike.position.z - old.z,
        forward = dx * Math.sin(actor.heading) + dz * Math.cos(actor.heading),
        lateral = Math.abs(
          dx * Math.cos(actor.heading) - dz * Math.sin(actor.heading),
        );
      if (
        actor.type !== "pedestrian" &&
        Math.cos(bike.motion.heading - actor.heading) > 0.5 &&
        forward > 0 &&
        forward < 9 &&
        lateral < 1.8
      )
        speed =
          forward < 4 ? 0 : Math.min(speed, Math.max(0, bike.motion.speed));
      if (actor.type !== "pedestrian")
        for (const other of this.actors) {
          if (
            other === actor ||
            other.type === "pedestrian" ||
            (other.track !== actor.track &&
              Math.cos(other.heading - actor.heading) < 0.7)
          )
            continue;
          const gap =
              (other.mesh.position.x - old.x) * Math.sin(actor.heading) +
              (other.mesh.position.z - old.z) * Math.cos(actor.heading),
            lane = Math.abs(
              (other.mesh.position.x - old.x) * Math.cos(actor.heading) -
                (other.mesh.position.z - old.z) * Math.sin(actor.heading),
            );
          if (gap > 0 && gap < (actor.type === "truck" ? 10 : 7) && lane < 2)
            speed = Math.min(speed, Math.max(0, (gap - 4) * 0.7));
        }
      actor.speed = speed;
      const next =
          actor.progress + (speed * actor.direction * dt) / actor.trackLength,
        wrapped = next < 0 || next > 1;
      actor.progress = (next + 1) % 1;
      this.place(actor);
      actor.previous = wrapped
        ? { x: actor.mesh.position.x, z: actor.mesh.position.z }
        : old;
      if (actor.type === "pedestrian")
        animateWalker(actor.mesh, this.time * 4 + actor.progress * 10);
    }
  }
  contact(oldPosition, bike) {
    const original = super.contact(oldPosition, bike);
    if (original || !this.enabled) return original;
    for (const person of this.world.pedestrianLife?.people || []) {
      if (Math.abs(person.mesh.position.y - bike.position.y) > 1) continue;
      if (
        sweptContact(
          oldPosition,
          bike.position,
          person.mesh.position,
          person.mesh.position,
          0.75,
        )
      )
        return person;
    }
    const campusPeople =
      this.world.campusStudents?.() ||
      [
        this.world.nguyenChiDieuCampus,
        this.world.caoThangCampus,
        this.world.quocHocCampus,
        this.world.haiBaTrungCampus,
        this.world.quangTrungCampus,
      ].flatMap((c) => c?.students?.students || []);
    for (const student of campusPeople) {
      const mesh = student.mesh || student.rig?.actor;
      if (!mesh || mesh.visible === false) continue;
      if (Math.abs(mesh.position.y - bike.position.y) > 1.2) continue;
      if (
        sweptContact(
          oldPosition,
          bike.position,
          student.previous || mesh.position,
          mesh.position,
          (student.radius || 0.35) + 0.4,
        )
      )
        return student;
    }
    return null;
  }
  patrolWarning(bike) {
    return this.enabled
      ? this.patrolWarnings.update(this.time, bike, this.actors)
      : null;
  }
  clearSpawn(position) {
    for (const actor of this.actors) {
      if (actor.mesh.position.distanceTo(position) > 8) continue;
      actor.progress = (actor.progress + 0.04) % 1;
      this.place(actor);
    }
  }
}
