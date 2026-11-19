import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import config from "../data/youth-playground.json" with { type: "json" };
import { byId, pointsOf } from "../../../../core/shared/geography/map.js";
import {
  inside,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { schoolGatePlacement, gateNamePanel } from "./SchoolGates.js";
import { campusWallSegments } from "../../../../core/shared/architecture/CampusWalls.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { beam } from "../../../../core/shared/architecture/architecture.js";
import { onOtherCarriageway } from "../../../../core/world/streetPlacement.js";

export function playgroundSpots(world, ring, count = config.equipmentCount) {
  const minX = Math.min(...ring.map((p) => p.x)),
    maxX = Math.max(...ring.map((p) => p.x)),
    minZ = Math.min(...ring.map((p) => p.z)),
    maxZ = Math.max(...ring.map((p) => p.z)),
    radius = config.equipmentRadius,
    result = [];
  let seed = 2401;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  for (let i = 0; i < 6000 && result.length < count; i++) {
    const p = {
      x: minX + random() * (maxX - minX),
      z: minZ + random() * (maxZ - minZ),
    };
    if (
      !inside(p, ring) ||
      nearestPoint(p, ring).distance < radius + 2 ||
      onOtherCarriageway(p, { id: null }, world.renderRoads, radius)
    )
      continue;
    if (
      world.buildingPolygons.some(
        (b) =>
          inside(p, b.points) ||
          nearestPoint(p, b.points).distance < radius + 2,
      )
    )
      continue;
    if (result.some((q) => Math.hypot(q.x - p.x, q.z - p.z) < radius * 2 + 3))
      continue;
    result.push({
      ...p,
      radius,
      type: config.types[result.length % config.types.length],
    });
  }
  return result;
}
function equipment(type) {
  const group = new THREE.Group();
  let animated;
  const post = (x, z) =>
    group.add(box([0.18, 2.9, 0.18], "#4285a8", [x, 1.45, z]));
  if (type === "swings") {
    for (const x of [-2, 2]) for (const z of [-1, 1]) post(x, z);
    group.add(beam([-2, 2.8, 0], [2, 2.8, 0], 0.1, "#d28a3c"));
    animated = new THREE.Group();
    animated.position.y = 2.7;
    for (const x of [-0.7, 0.7])
      animated.add(beam([x, 0, 0], [x, -1.9, 0], 0.025, "#4c5e66"));
    animated.add(box([1.8, 0.15, 0.6], "#d45e49", [0, -1.9, 0]));
    group.add(animated);
  } else if (type === "slide") {
    for (const x of [-1, 1]) for (const z of [-1, 1]) post(x, z);
    group.add(box([2.4, 0.2, 2.4], "#ecb649", [0, 2, 0]));
    const slide = box([1.5, 0.14, 3.8], "#d65e45", [0, 1.15, 2.35]);
    slide.rotation.x = 0.48;
    group.add(slide);
    for (let i = 0; i < 7; i++)
      group.add(
        box([1.4, 0.09, 0.12], "#f6da71", [0, 0.3 + i * 0.27, -1.8 + i * 0.1]),
      );
    for (const x of [-0.8, 0.8])
      group.add(beam([x, 0.1, -1.9], [x, 2.4, -1], 0.055, "#4b8fbd"));
  } else if (type === "seesaw") {
    group.add(box([0.5, 0.9, 0.7], "#5a8b9a", [0, 0.45, 0]));
    animated = new THREE.Group();
    animated.position.y = 0.9;
    animated.add(box([4.5, 0.15, 0.5], "#e6b045"));
    for (const side of [-1, 1])
      animated.add(
        box([0.65, 0.12, 0.75], "#d75e54", [side * 1.8, 0.12, 0]),
        beam([side * 1.6, 0.1, 0], [side * 1.6, 0.6, 0], 0.04, "#4b6e78"),
      );
    group.add(animated);
  } else if (type === "carousel") {
    animated = new THREE.Group();
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 1.9, 0.2, 24),
      mat("#dcad45"),
    );
    platform.position.y = 0.35;
    animated.add(platform);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      animated.add(
        beam(
          [0, 0.5, 0],
          [Math.sin(a) * 1.6, 0.5, Math.cos(a) * 1.6],
          0.05,
          "#5d8ca1",
        ),
        box([0.6, 0.2, 0.6], i % 2 ? "#df6e51" : "#5c9bc2", [
          Math.sin(a) * 1.3,
          0.7,
          Math.cos(a) * 1.3,
        ]),
      );
    }
    group.add(animated);
  } else {
    const sand = new THREE.Mesh(
      new THREE.CylinderGeometry(2.6, 2.6, 0.2, 24),
      mat("#ead399"),
    );
    sand.position.y = 0.2;
    group.add(sand);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(2.6, 0.14, 8, 24),
      mat("#ba7950"),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.3;
    group.add(
      rim,
      box([0.6, 0.4, 0.6], "#d6624b", [0.6, 0.5, 0]),
      box([0.8, 0.3, 0.5], "#5b91b4", [-0.7, 0.4, 0.7]),
    );
  }
  return { group, animated, type };
}
export class YouthPlayground {
  constructor(world) {
    const feature = byId(config.campusOSM),
      ring = pointsOf(feature);
    this.entrance = schoolGatePlacement({
      feature,
      anchor: { kind: "area-label" },
    });
    this.segments = campusWallSegments(
      ring,
      this.entrance,
      config.entranceWidth,
    );
    this.equipment = [];
    const fence = [];
    for (const { a, b } of this.segments) {
      const length = Math.hypot(b.x - a.x, b.z - a.z);
      for (const height of [0.35, config.fenceHeight]) {
        const part = beam(
          [a.x, height, a.z],
          [b.x, height, b.z],
          0.04,
          config.fenceColor,
        );
        part.updateMatrix();
        fence.push(part.geometry.clone().applyMatrix4(part.matrix));
        part.geometry.dispose();
      }
      for (let d = 0; d <= length; d += 0.7) {
        const t = d / length,
          part = box([0.06, config.fenceHeight, 0.06], config.fenceColor, [
            a.x + (b.x - a.x) * t,
            config.fenceHeight / 2,
            a.z + (b.z - a.z) * t,
          ]);
        part.updateMatrix();
        fence.push(part.geometry.clone().applyMatrix4(part.matrix));
        part.geometry.dispose();
      }
    }
    const mesh = new THREE.Mesh(mergeGeometries(fence), mat(config.fenceColor));
    mesh.castShadow = true;
    world.scene.add(mesh);
    world.cameraObstacles.push(mesh);
    fence.forEach((g) => g.dispose());
    world.campusWallSegments.push(
      ...this.segments.map((s) => ({ ...s, schoolId: "youth-center" })),
    );
    this.gate = new THREE.Group();
    for (const side of [-1, 1])
      this.gate.add(
        box([0.6, 4.2, 0.6], "#eee9d9", [
          (side * config.entranceWidth) / 2,
          2.1,
          0,
        ]),
        box([0.8, 0.2, 0.8], config.fenceColor, [
          (side * config.entranceWidth) / 2,
          4.2,
          0,
        ]),
      );
    this.gate.add(
      box([config.entranceWidth + 0.6, 0.3, 0.6], config.fenceColor, [0, 4, 0]),
      box([config.entranceWidth - 0.8, 0.1, 18], "#c7bea7", [0, -0.06, -5]),
    );
    const namePanel = gateNamePanel(
      "TRUNG TÂM THANH THIẾU NHI HUẾ",
      "8 Lê Lợi",
      7.4,
      1.2,
    );
    namePanel.position.set(0, 3.9, 0.45);
    this.gate.add(namePanel);
    this.gate.position.set(this.entrance.x, 0.17, this.entrance.z);
    this.gate.rotation.y = this.entrance.heading;
    world.scene.add(this.gate);
    world.entranceClearances = [
      ...(world.entranceClearances || []),
      { ...this.entrance, width: config.entranceWidth },
    ];
    world.treePositions = world.treePositions.filter(
      (p) => Math.hypot(p.x - this.entrance.x, p.z - this.entrance.z) > 15,
    );
    this.spots = playgroundSpots(world, ring);
    world.playgroundAreas = this.spots;
    world.treePositions = world.treePositions.filter(
      (p) =>
        !this.spots.some(
          (s) => Math.hypot(p.x - s.x, p.z - s.z) < s.radius + 3,
        ),
    );
    for (const p of this.spots) {
      const object = equipment(p.type);
      object.group.position.set(p.x, 0.17, p.z);
      world.scene.add(object.group);
      this.equipment.push(object);
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(p.radius, 24),
        mat("#c4b393"),
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(p.x, 0.065, p.z);
      world.scene.add(pad);
    }
  }
  update(time) {
    for (const e of this.equipment)
      if (e.animated) {
        if (e.type === "carousel") e.animated.rotation.y = time * 0.4;
        else if (e.type === "swings")
          e.animated.rotation.x = Math.sin(time * 1.3) * 0.3;
        else e.animated.rotation.z = Math.sin(time) * 0.14;
      }
  }
}
