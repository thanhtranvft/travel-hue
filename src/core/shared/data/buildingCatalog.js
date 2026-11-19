import catalog from "../../../data/world/buildings.json" with { type: "json" };
export const buildings = catalog.buildings;
const byOSM = new Map(buildings.map((b) => [b.osmKey, b]));
export function resolveBuildingRecord(record, tags = {}) {
  const code = record?.code || null,
    name = record?.name ?? tags.name ?? record?.osm?.name;
  const houseNumber =
    record?.houseNumber ??
    tags["addr:housenumber"] ??
    record?.osm?.houseNumber ??
    "";
  const street =
    record?.street ?? tags["addr:street"] ?? record?.osm?.street ?? "";
  return {
    code,
    name: name || `Tòa nhà ${code || "chưa đăng ký"}`,
    houseNumber,
    street,
    address: [houseNumber, street].filter(Boolean).join(" "),
    needsName: !name,
  };
}
export function buildingDetails(feature) {
  return resolveBuildingRecord(
    byOSM.get(`${feature.type}/${feature.id}`),
    feature.tags,
  );
}
