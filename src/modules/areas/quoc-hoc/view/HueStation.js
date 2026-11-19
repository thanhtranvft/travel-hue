import * as THREE from "three";
import config from "../data/station.json" with { type: "json" };
import {
  features,
  pointsOf,
  centroid,
} from "../../../../core/shared/geography/map.js";
import {
  project,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { beam } from "../../../../core/shared/architecture/architecture.js";
import { postedBoard } from "../../../../core/world/TrafficBoard.js";
import { roadWidth } from "../../../../core/world/roadProfile.js";

function strip(points, width, y) {
  const positions = [],
    indices = [];
  points.forEach((p, i) => {
    const a = points[Math.max(0, i - 1)],
      b = points[Math.min(points.length - 1, i + 1)],
      length = Math.hypot(b.x - a.x, b.z - a.z) || 1;
    const nx = (((b.z - a.z) / length) * width) / 2,
      nz = ((-(b.x - a.x) / length) * width) / 2;
    positions.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
    if (i) {
      const k = (i - 1) * 2;
      indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function sign(text, subtitle, width = 10, height = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#164d68";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#f5de9e";
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 1008, 240);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "bold 100px sans-serif";
  ctx.fillText(text, 512, 112, 960);
  ctx.font = "36px sans-serif";
  ctx.fillText(subtitle, 512, 202, 960);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: texture }),
  );
}
function roof(minX, maxX, minZ, maxZ, y) {
  const z = (minZ + maxZ) / 2,
    vertices = [
      minX,
      y,
      minZ,
      maxX,
      y,
      minZ,
      minX,
      y + 2.2,
      z,
      maxX,
      y + 2.2,
      z,
      minX,
      y,
      maxZ,
      maxX,
      y,
      maxZ,
    ];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setIndex([0, 2, 1, 1, 2, 3, 2, 4, 3, 3, 4, 5, 0, 4, 2, 1, 3, 5]);
  g.computeVertexNormals();
  return new THREE.Mesh(
    g,
    new THREE.MeshStandardMaterial({
      color: "#9b4935",
      roughness: 0.9,
      side: THREE.DoubleSide,
    }),
  );
}
function trainCar(locomotive, bodyColor) {
  const group = new THREE.Group(),
    shape = new THREE.Shape();
  shape.moveTo(-1.35, 1);
  shape.lineTo(1.35, 1);
  shape.quadraticCurveTo(1.5, 1, 1.5, 1.2);
  shape.lineTo(1.5, 3.1);
  shape.quadraticCurveTo(1.45, 3.8, 0.9, 3.85);
  shape.lineTo(-0.9, 3.85);
  shape.quadraticCurveTo(-1.45, 3.8, -1.5, 3.1);
  shape.lineTo(-1.5, 1.2);
  shape.quadraticCurveTo(-1.5, 1, -1.35, 1);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 11.6,
    steps: 1,
    bevelEnabled: true,
    bevelSize: 0.06,
    bevelThickness: 0.06,
    bevelSegments: 2,
    curveSegments: 6,
  });
  geometry.translate(0, 0, -5.8);
  group.add(
    new THREE.Mesh(geometry, mat(bodyColor)),
    box([3.06, 0.38, 11.7], "#eee3c5", [0, 1.8, 0]),
    box([2.5, 0.4, 10.6], "#25333c", [0, 0.88, 0]),
  );
  const wheelGeometry = new THREE.CylinderGeometry(0.38, 0.38, 0.2, 12);
  wheelGeometry.rotateZ(Math.PI / 2);
  for (const x of [-1.4, 1.4])
    for (const z of [-4.3, -3.2, 3.2, 4.3]) {
      const wheel = new THREE.Mesh(wheelGeometry, mat("#263038"));
      wheel.position.set(x, 0.62, z);
      group.add(wheel);
    }
  for (const side of [-1, 1])
    for (let i = 0; i < (locomotive ? 2 : 7); i++) {
      const z = locomotive ? 3.2 + i * 1.4 : -4.5 + i * 1.5;
      group.add(
        box([0.08, 0.93, 1.08], "#a1c7d0", [side * 1.60, 2.72, z]),
        box([0.08, 0.05, 1.16], "#e4d8bb", [side * 1.61, 2.2, z]),
      );
    }
  if (locomotive) {
    group.add(
      box([2.25, 0.85, 0.08], "#567d8c", [0, 2.95, 5.88]),
      box([2.6, 0.18, 0.18], "#e9dcc0", [0, 1.22, 5.94]),
    );
    for (const x of [-0.9, 0.9]) {
      const light = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 8, 6),
        new THREE.MeshBasicMaterial({ color: "#fff0ad" }),
      );
      light.position.set(x, 2.05, 5.95);
      group.add(light);
    }
    for (let i = 0; i < 6; i++)
      group.add(box([1.7, 0.045, 0.12], "#3b4850", [0, 2.1 + i * 0.18, -5.9]));
  }
  return group;
}

export class HueStation {
  constructor(world) {
    const building = features.find((f) => f.id === config.buildingOsm);
    if (!building) return;
    this.world = world;
    this.entrance = project(config.entrance);
    this.stats = { trains: 0, bridge: false };
    const group = (this.group = new THREE.Group());
    group.name = "hue-station-details";
    const footprint = pointsOf(building),
      center = centroid(building),
      minX = Math.min(...footprint.map((p) => p.x)),
      maxX = Math.max(...footprint.map((p) => p.x)),
      minZ = Math.min(...footprint.map((p) => p.z)),
      maxZ = Math.max(...footprint.map((p) => p.z));
    group.add(roof(minX - 1, maxX + 1, minZ - 1, maxZ + 1, 6.7));
    const name = sign("GA HUẾ", "HUE RAILWAY STATION", 11, 2.2);
    name.position.set(this.entrance.x, 5.4, this.entrance.z - 3.2);
    name.rotation.y = Math.PI;
    group.add(name);
    for (const dx of [-5, 5])
      group.add(
        box([0.6, 4.2, 0.6], "#eee1b8", [
          this.entrance.x + dx,
          2.33,
          this.entrance.z - 1.5,
        ]),
      );
    group.add(
      box([12, 0.24, 3.5], "#a24b36", [
        this.entrance.x,
        4.55,
        this.entrance.z - 1.3,
      ]),
    );
    const gate = postedBoard("CỔNG GA HUẾ", "Cầu Ga → Lê Lợi", 2.8);
    gate.position.set(this.entrance.x + 8, 0.23, this.entrance.z - 1.5);
    gate.rotation.y = -Math.PI / 2;
    group.add(gate);
    const landmark = world.landmarks.get("station");
    if (landmark)
      Object.assign(landmark, {
        title: config.title,
        description: config.description,
        radius: 48,
      });

    const river = features.find((f) => f.id === config.riverOsm);
    if (river) {
      // Only the station section; keep the existing Huong River polygons intact.
      const local = pointsOf(river).filter(
        (p) => Math.hypot(p.x - center.x, p.z - center.z) < 320,
      );
      if (local.length > 1) {
        this.waterLine = local;
        const water = new THREE.Mesh(
          strip(local, config.waterWidth, 0.035),
          world.waterMaterial,
        );
        water.material.side = THREE.DoubleSide;
        water.name = "an-cuu-river";
        group.add(water);
        const vertices=water.geometry.attributes.position,left=[],right=[];
        for(let i=0;i<vertices.count;i+=2){left.push({x:vertices.getX(i),z:vertices.getZ(i)});right.push({x:vertices.getX(i+1),z:vertices.getZ(i+1)});}
        world.riverRings=[...world.riverRings,[...left,...right.reverse()]];
      }
    }
    const bridge = world.renderRoads.find((r) => r.id === config.bridgeOsm);
    if (bridge) {
      const a = bridge.points[0],
        b = bridge.points.at(-1),
        heading = Math.atan2(b.x - a.x, b.z - a.z),
        length = Math.hypot(b.x - a.x, b.z - a.z),
        width = roadWidth(bridge);
      const deck = box([width + 0.8, 0.4, length], "#c7bfae", [
        (a.x + b.x) / 2,
        0.07,
        (a.z + b.z) / 2,
      ]);
      deck.rotation.y = heading;
      group.add(deck);
      for (const side of [-1, 1]) {
        const nx = Math.cos(heading) * (width / 2 + 0.5) * side,
          nz = -Math.sin(heading) * (width / 2 + 0.5) * side;
        const edgeA = { x: a.x + nx, z: a.z + nz, y: 0.32 },
          edgeB = { x: b.x + nx, z: b.z + nz, y: 0.32 };
        world.boardwalkRails.push({ a: edgeA, b: edgeB });
        for (const y of [0.85, 1.5])
          group.add(
            beam([edgeA.x, y, edgeA.z], [edgeB.x, y, edgeB.z], 0.09, "#e2dfd1"),
          );
        for (let d = 0; d <= length; d += 3) {
          const t = d / length;
          group.add(
            box([0.18, 1.3, 0.18], "#d3cfbf", [
              edgeA.x + (edgeB.x - edgeA.x) * t,
              0.9,
              edgeA.z + (edgeB.z - edgeA.z) * t,
            ]),
          );
        }
      }
      this.stats.bridge = true;
    }
    const rail = features.find((f) => f.id === config.railwayOsm);
    if (rail) {
      this.railway = pointsOf(rail);
      const anchor = nearestPoint(center, this.railway);
      for (const [index, offset] of config.trackOffsets.entries()) {
        const track = [];
        for (let i = 1; i < this.railway.length; i++) {
          const a = this.railway[i - 1],
            b = this.railway[i],
            length = Math.hypot(b.x - a.x, b.z - a.z),
            steps = Math.ceil(length / 3),
            heading = Math.atan2(b.x - a.x, b.z - a.z);
          for (let j = 0; j < steps; j++) {
            const t = j / steps,
              p = {
                x: a.x + (b.x - a.x) * t + Math.cos(heading) * offset,
                z: a.z + (b.z - a.z) * t - Math.sin(heading) * offset,
              };
            if (Math.hypot(p.x - center.x, p.z - center.z) < 115) track.push(p);
          }
        }
        if (track.length > 1) {
          group.add(new THREE.Mesh(strip(track, 4, 0.09), mat("#747b78")));
          for (let i = 1; i < track.length; i++) {
            const a = track[i - 1],
              b = track[i],
              heading = Math.atan2(b.x - a.x, b.z - a.z);
            for (const side of [-0.5, 0.5])
              group.add(
                beam(
                  [
                    a.x + Math.cos(heading) * side,
                    0.24,
                    a.z - Math.sin(heading) * side,
                  ],
                  [
                    b.x + Math.cos(heading) * side,
                    0.24,
                    b.z - Math.sin(heading) * side,
                  ],
                  0.055,
                  "#a4acac",
                ),
              );
            const sleeper = box([2.2, 0.14, 0.2], "#655647", [a.x, 0.15, a.z]);
            sleeper.rotation.y = heading;
            group.add(sleeper);
          }
        }
        const train = new THREE.Group();
        train.name = `hue-train-${index + 1}`;
        const along = index === 0 ? -32 : 20;
        train.position.set(
          anchor.x +
            Math.cos(anchor.heading) * offset +
            Math.sin(anchor.heading) * along,
          0,
          anchor.z -
            Math.sin(anchor.heading) * offset +
            Math.cos(anchor.heading) * along,
        );
        train.rotation.y = anchor.heading;
        train.add(trainCar(true, index ? "#9e4138" : "#315f86"));
        for (let i = 1; i <= config.carriagesPerTrain; i++) {
          const car = trainCar(false, index ? "#47758f" : "#52768d");
          car.position.z = -i * 12.4;
          train.add(car);
        }
        group.add(train);
        this.stats.trains++;
      }
    }
    world.treePositions = world.treePositions.filter(
      (p) =>
        Math.hypot(p.x - this.entrance.x, p.z - this.entrance.z) > 10 &&
        !this.blocks(p.x, p.z),
    );
    world.scene.add(group);
  }
  blocks(x, z) {
    if (
      this.waterLine &&
      nearestPoint({ x, z }, this.waterLine).distance < config.waterWidth / 2
    ) {
      const road = this.world.nearestRoad(x, z);
      if (
        !road.road?.tags.bridge ||
        road.distance > roadWidth(road.road) / 2 + 0.6
      )
        return true;
    }
    if (
      !this.railway ||
      Math.hypot(x - this.entrance.x, z - this.entrance.z) > 115
    )
      return false;
    const hit = nearestPoint({ x, z }, this.railway),
      lateral =
        (x - hit.x) * Math.cos(hit.heading) -
        (z - hit.z) * Math.sin(hit.heading);
    return lateral > -2 && lateral < Math.max(...config.trackOffsets) + 2;
  }
}
