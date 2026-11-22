import { enabledAreas, areaIsEnabled } from "../../app/catalog.js";
import siteCatalog from "../../data/world/sites.json" with { type: "json" };
import {
  principalCenter,
  resolveSiteAnchor,
} from "../../core/shared/geography/siteAnchors.js";
import {
  project,
  joinLines,
  nearestPoint,
  inside,
} from "../../core/shared/geography/geometry.js";
const loaders = {
  "quoc-hoc": () =>
    import("./quoc-hoc/index.js").then((module) => module.loadModel()),
  "south-bank": () =>
    import("./south-bank/index.js").then((module) => module.loadModel()),
  "truong-tien": () =>
    import("./truong-tien/index.js").then((module) => module.loadModel()),
  "north-bank": () =>
    import("./north-bank/index.js").then((module) => module.loadModel()),
  "imperial-city": () =>
    import("./imperial-city/index.js").then((module) => module.loadModel()),
  "nguyen-chi-dieu": () =>
    import("./nguyen-chi-dieu/index.js").then((module) => module.loadModel()),
};
export const geoDistricts = enabledAreas;
export let features = [],
  roads = [],
  mainRoads = [],
  river = [],
  sites = [],
  mappedSignals = [],
  corridorCrossings = [],
  attribution = {},
  currentRegion = null;
export const byId = (id) => features.find((f) => f.id === id);
export const pointsOf = (feature) =>
  (feature?.geometry || [])
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon))
    .map(project);
export function ringsOf(feature) {
  if (!feature) return [];
  return feature.type === "way"
    ? [pointsOf(feature)]
    : joinLines(
        (feature.members || [])
          .filter((m) => m.role === "outer" && m.geometry)
          .map(pointsOf),
      );
}
export const centroid = (feature) =>
  feature.type === "node"
    ? project(feature)
    : principalCenter(ringsOf(feature));
export const boardwalkWayIds = [1167513732, 1167513733, 683633953];
export const intersection = {
  ...project({ lat: 16.4639209, lon: 107.5866524 }),
  lat: 16.4639209,
  lon: 107.5866524,
  sourceWay: 39420686,
};
export const leLoiTruongTienJunction = {
  x: 1338.200907058125,
  z: -1210.5944864450046,
};
export function regionContains(region, x, z) {
  if (!region) return true;
  const p = { x, z };
  if (
    nearestPoint(
      p,
      region.path.map(([x, z]) => ({ x, z })),
    ).distance <= region.radius
  )
    return true;
  return region.extensions.some((r) => inside(p, r));
}
export async function loadGeography(id) {
  if (!loaders[id] || !areaIsEnabled(id))
    throw new Error(`Khu vực chưa được bật: ${id}`);
  const { default: data } = await loaders[id]();
  features = data.elements;
  currentRegion = data.region;
  attribution = { source: data.source, retrievedAt: data.retrievedAt };
  roads = features
    .filter(
      (f) =>
        f.type === "way" &&
        f.tags?.highway &&
        f.geometry?.length > 1 &&
        !["steps", "construction", "proposed"].includes(f.tags.highway),
    )
    .map((f) => ({ ...f, points: pointsOf(f) }));
  mainRoads = roads.filter((r) =>
    [
      "Lê Lợi",
      "Hà Nội",
      "Trần Hưng Đạo",
      "Cầu Phú Xuân",
      "Cầu Trường Tiền",
      "Lê Duẩn",
      "Đống Đa",
      "Lý Thường Kiệt",
      "Hùng Vương",
      "Bùng binh Hùng Vương",
      "Lê Quý Đôn",
    ].includes(r.tags.name),
  );
  const riverFeature = byId(2393612);
  river = riverFeature ? ringsOf(riverFeature) : [];
  const leLoi = roads.filter((r) => r.tags.name === "Lê Lợi");
  const dongDa = roads.filter((r) => r.tags.name === "Đống Đa");
  const frontageRoads = leLoi.length ? leLoi : dongDa.length ? dongDa : mainRoads;
  sites = siteCatalog.sites.flatMap((site) => {
    const feature = byId(site.osm);
    if (!feature) return [];
    const center = centroid(feature),
      anchor = resolveSiteAnchor(
        feature,
        ringsOf(feature),
        data.entrances,
        ["school", "government", "hospital"].includes(site.kind)
          ? frontageRoads.map((r) => r.points)
          : [],
      );
    return [
      {
        ...site,
        feature,
        center,
        sign: anchor.point,
        anchor,
        source: `https://www.openstreetmap.org/${feature.type}/${feature.id}`,
        anchorSource: `https://www.openstreetmap.org/${anchor.sourceType}/${anchor.sourceId}`,
      },
    ];
  });
  mappedSignals = data.entrances
    .filter((e) => e.type === "node" && e.tags?.highway === "traffic_signals")
    .map((n) => ({ ...project(n), osm: n.id }));
  const findCrossings = (mains, names) =>
    names.flatMap((name) => {
      for (const road of roads.filter((r) => r.tags.name === name))
        for (const point of road.points)
          for (const main of mains)
            if (
              main.points.some(
                (p) => Math.hypot(p.x - point.x, p.z - point.z) < 0.1,
              )
            )
              return [
                {
                  name,
                  point,
                  roadId: road.id,
                  mainId: main.id,
                  heading: nearestPoint(point, main.points).heading,
                },
              ];
      return [];
    });
  corridorCrossings = [
    ...findCrossings(leLoi, ["Phan Bội Châu", "Nguyễn Trường Tộ", "Lê Lai", "Hà Nội"]),
    ...findCrossings(dongDa, ["Lý Thường Kiệt", "Bùng binh Hùng Vương"]),
  ];
  return currentRegion;
}
