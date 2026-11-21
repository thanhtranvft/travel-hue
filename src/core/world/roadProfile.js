export const isFootway = (r) =>
  ["footway", "path", "pedestrian", "steps"].includes(r.tags.highway);
export function roadWidth(r) {
  if (isFootway(r)) return Number.parseFloat(r.tags.width) || 4;
  const mapped = Number.parseFloat(r.tags.width) || 0;
  return Math.max(
    mapped,
    r.tags.name === "Cầu Trường Tiền" || r.tags.name === "Cầu Phú Xuân"
      ? 14
      : r.tags.name === "Lê Lợi"
        ? 14
        : ["primary", "secondary", "tertiary"].includes(r.tags.highway)
          ? 12
          : 8,
  );
}
