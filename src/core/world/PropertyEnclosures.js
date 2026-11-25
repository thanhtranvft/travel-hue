import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import data from "../../data/world/property-enclosures.json" with { type: "json" };
import { project, inside, nearestPoint } from "../shared/geography/geometry.js";
import { campusWallSegments } from "../shared/architecture/CampusWalls.js";
import { buildingFrontage } from "./BuildingFrontage.js";
import { segmentHitsCarriageway } from "./streetPlacement.js";
import {
  CITParking,
  parkingGate,
} from "../../modules/areas/quoc-hoc/view/CITParking.js";
import { propertyGateModel } from "./PropertyGate.js";
import { getFeatures } from "../shared/geography/activeGeography.js";
import { buildings } from "../shared/data/buildingCatalog.js";

export const propertyRecords = data.properties;
export function propertyGate(ring, roads) {
  const center = ring.reduce(
      (p, q) => ({ x: p.x + q.x / ring.length, z: p.z + q.z / ring.length }),
      { x: 0, z: 0 },
    ),
    front = buildingFrontage(center, roads);
  if (!front) return ring[0];
  return nearestPoint(front, [...ring, ring[0]]);
}
function segmentGeometry(a, b, height, depth, y) {
  const dx = b.x - a.x,
    dz = b.z - a.z,
    g = new THREE.BoxGeometry(Math.hypot(dx, dz), height, depth);
  g.rotateY(Math.atan2(-dz, dx));
  g.translate((a.x + b.x) / 2, y, (a.z + b.z) / 2);
  return g;
}
export class PropertyEnclosures {
  constructor(world) {
    this.records = [];
    this.stats = {
      properties: 0,
      coveredBuildings: 0,
      segments: 0,
      omittedAtRoadOrBuilding: 0,
    };
    const gateClearances = propertyRecords
        .filter((p) => p.frontage)
        .map((p) => ({
          id: p.id,
          point: project(p.frontage.gate),
          radius: p.entranceWidth / 2 + 0.6,
        })),
      batches = new Map(),
      add = (geometry, color) => {
        if (!batches.has(color)) batches.set(color, []);
        batches.get(color).push(geometry);
      };
    const available = new Set(
        getFeatures()
          .filter((f) => f.tags?.building)
          .map((f) => `${f.type}/${f.id}`),
      ),
      activeCodes = new Set(
        buildings.filter((b) => available.has(b.osmKey)).map((b) => b.code),
      );
    for (const property of propertyRecords) {
      if (
        property.managedExternally ||
        !property.members.some((code) => activeCodes.has(code))
      )
        continue;
      const rings = property.rings.map((r) => r.map(project)),
        frontage = propertyGate(rings[0], world.renderRoads),
        gate = property.frontage?.gate
          ? nearestPoint(project(property.frontage.gate), [
              ...rings[0],
              rings[0][0],
            ])
          : property.id === "hue-cit"
            ? parkingGate(world, rings[0], frontage)
            : frontage,
        segments = [];
      for (const ring of rings)
        for (const whole of campusWallSegments(
          ring,
          gate,
          property.entranceWidth,
        )) {
          const length = Math.hypot(
              whole.b.x - whole.a.x,
              whole.b.z - whole.a.z,
            ),
            parts = Math.ceil(length / 3);
          for (let i = 0; i < parts; i++) {
            const at = (t) => ({
                x: whole.a.x + (whole.b.x - whole.a.x) * t,
                z: whole.a.z + (whole.b.z - whole.a.z) * t,
              }),
              a = at(i / parts),
              b = at((i + 1) / parts),
              middle = at((i + 0.5) / parts);
            if (
              gateClearances.some(
                (g) =>
                  g.id !== property.id &&
                  nearestPoint(g.point, [a, b]).distance < g.radius,
              ) ||
              segmentHitsCarriageway(a, b, world.renderRoads, 0.75, 0.5) ||
              world.buildingPolygons.some((p) => inside(middle, p.points))
            ) {
              this.stats.omittedAtRoadOrBuilding++;
              continue;
            }
            segments.push({ a, b, schoolId: property.id });
            if (property.style === "wall") {
              add(
                segmentGeometry(
                  a,
                  b,
                  property.height,
                  0.32,
                  0.17 + property.height / 2,
                ),
                property.color,
              );
              add(
                segmentGeometry(a, b, 0.12, 0.42, 0.17 + property.height),
                "#deded5",
              );
            } else {
              for (const y of [0.4, property.height])
                add(segmentGeometry(a, b, 0.065, 0.065, y), property.color);
              add(
                segmentGeometry(
                  a,
                  { x: a.x + 0.07, z: a.z },
                  property.height,
                  0.07,
                  property.height / 2,
                ),
                property.color,
              );
              const dx = b.x - a.x,
                dz = b.z - a.z;
              for (let k = 1; k < 4; k++) {
                const p = { x: a.x + (dx * k) / 4, z: a.z + (dz * k) / 4 };
                add(
                  segmentGeometry(
                    p,
                    { x: p.x + 0.035, z: p.z },
                    property.height,
                    0.035,
                    property.height / 2,
                  ),
                  property.color,
                );
              }
            }
          }
        }
      world.campusWallSegments.push(...segments);
      const record = { ...property, rings, gate, segments };
      this.records.push(record);
      if (property.frontage) {
        const road = world.renderRoads
          .filter((r) => r.tags.name === "Lê Lợi")
          .map((r) => nearestPoint(gate, r.points))
          .sort((a, b) => a.distance - b.distance)[0];
        world.scene.add(
          propertyGateModel(
            record,
            Math.atan2(road.x - gate.x, road.z - gate.z),
          ),
        );
      }
      this.stats.properties++;
      this.stats.coveredBuildings += property.members.length;
      this.stats.segments += segments.length;
    }
    for (const [color, geometries] of batches) {
      if (!geometries.length) continue;
      const mesh = new THREE.Mesh(
        mergeGeometries(geometries),
        new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
      );
      mesh.castShadow = mesh.receiveShadow = true;
      world.scene.add(mesh);
      if (color === "#f2f0e5") world.cameraObstacles.push(mesh);
      geometries.forEach((g) => g.dispose());
    }
    const cit = this.records.find((p) => p.id === "hue-cit");
    this.parking = cit ? new CITParking(world, cit) : null;
  }
  update(time) {
    this.parking?.update(time);
  }
}
