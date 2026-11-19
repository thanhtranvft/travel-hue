import { readFile, writeFile } from "node:fs/promises";
import {
  project,
  nearestPoint,
} from "../src/core/shared/geography/geometry.js";
const read = async (p) => JSON.parse(await readFile(p, "utf8"));
const config = await read("src/data/app-config.json");
const snapshot = await read("src/assets/maps/source/osm-snapshot.json");
const station = await read("src/modules/areas/quoc-hoc/data/station.json");
const area = config.areas.items.find((a) => a.id === "quoc-hoc");
const forecourt = snapshot.elements
  .find((f) => f.id === station.forecourtRoadOsm)
  .geometry.map(project);
const start = nearestPoint(project(station.entrance), forecourt);
const junction = project(
  snapshot.elements.find((f) => f.id === 39411821).geometry.at(-1),
);
const joinIndex = area.path.findIndex(
  ([x, z]) => Math.hypot(x - junction.x, z - junction.z) < 0.1,
);
if (joinIndex < 0) throw new Error("Missing original route junction");
const towardBridge = forecourt
  .slice(0, start.index)
  .reverse()
  .map((p) => [p.x, p.z]);
area.path = [
  [start.x, start.z],
  ...towardBridge,
  ...area.path.slice(joinIndex),
];
area.path = area.path.filter(
  (p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 0.01,
);
if (!area.spawnSlots?.length) area.spawn = {
  x: start.x,
  z: start.z,
  heading: Math.atan2(area.path[1][0] - start.x, area.path[1][1] - start.z),
};
await writeFile(
  "src/data/app-config.json",
  JSON.stringify(config, null, 2) + "\n",
);
const file = "src/modules/areas/quoc-hoc/model/osm.json",
  data = await read(file);
data.region.path = area.path;
data.region.bounds.minX = Math.min(
  data.region.bounds.minX,
  start.x - data.region.radius,
);
data.region.bounds.maxZ = Math.max(
  data.region.bounds.maxZ,
  start.z + data.region.radius,
);
// Retain the existing snapshot and other area packages; only extend this area's route.
await writeFile(file, JSON.stringify(data));
console.log(
  JSON.stringify({
    spawn: area.spawn,
    routeStart: area.path.slice(0, 6),
    features: data.elements.length,
  }),
);
