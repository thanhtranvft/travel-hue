import * as THREE from "three";
import { box } from "./shared.js";
import { inside, nearestPoint } from "../geography/geometry.js";

// Decorative facades follow existing building edges. Heights and architectural
// details are approximations, while footprint and campus membership remain OSM.
export const corridorStyles = {
  station: { wall: '#e7d7aa', trim: '#fff1cf', roof: '#9b4935', columns: true },
  "ho-chi-minh-museum": {
    wall: "#e6ddbf",
    trim: "#f8f1dc",
    roof: "#8c4936",
    columns: true,
  },
  "hue-cit": {
    wall: "#cad8db",
    trim: "#e9f1ee",
    roof: "#87989c",
    modern: true,
  },
  "youth-center": {
    wall: "#e6ca87",
    trim: "#fff3cf",
    roof: "#a55436",
    columns: true,
  },
  "quoc-hoc-school": {
    wall: "#ad4b37",
    trim: "#ead1a0",
    roof: "#93432d",
    columns: true,
  },
  "hai-ba-trung": {
    wall: "#e4cb88",
    trim: "#fff2cd",
    roof: "#a15836",
    columns: true,
  },
  ubnd: { wall: "#ebd9a5", trim: "#fff4d7", roof: "#95533c", columns: true },
  hospital: { wall: "#e4eded", trim: "#c3dcdf", roof: "#99afb5", modern: true },
};
export function siteForBuilding(feature, points, sites, ringsOf) {
  const center = points.reduce(
    (p, q) => ({ x: p.x + q.x / points.length, z: p.z + q.z / points.length }),
    { x: 0, z: 0 },
  );
  return sites.find(
    (s) =>
      corridorStyles[s.id] &&
      (s.osm === feature.id ||
        (!s.feature.tags?.building &&
          ringsOf(s.feature).some((r) => inside(center, r)))),
  );
}
export function decorateCorridorBuilding(points, height, style, roads) {
  const group = new THREE.Group();
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1],
      b = points[i],
      length = Math.hypot(b.x - a.x, b.z - a.z);
    if (length < 3) continue;
    const middle = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    const edge = new THREE.Group();
    edge.position.set(middle.x, 0.23, middle.z);
    edge.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) - Math.PI / 2;
    edge.add(
      box([length + 0.25, 0.25, 0.35], style.trim, [0, height - 0.3, 0]),
      box([length + 0.45, 0.3, 0.65], style.roof, [0, height + 0.1, 0]),
    );
    const floors = Math.max(1, Math.round(height / 3.2)),
      count = Math.min(20, Math.floor(length / 3.3));
    for (let floor = 0; floor < floors; floor++)
      for (let k = 0; k < count; k++) {
        const x = ((k - (count - 1) / 2) * length) / (count + 1),
          y = 1.9 + floor * (height / floors);
        edge.add(
          box([style.modern ? 2.15 : 1.25, 1.65, 0.25], style.trim, [x, y, 0]),
          box(
            [style.modern ? 1.95 : 1.04, 1.43, 0.29],
            style.modern ? "#4c8295" : "#416057",
            [x, y, 0],
          ),
        );
      }
    if (
      style.columns &&
      Math.min(...roads.map((r) => nearestPoint(middle, r.points).distance)) <
        45
    )
      for (let k = 0; k <= count; k++)
        edge.add(
          box([0.32, height, 0.5], style.trim, [
            ((k - count / 2) * length) / (count + 1),
            height / 2,
            0,
          ]),
        );
    group.add(edge);
  }
  return group;
}
