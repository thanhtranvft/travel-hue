export const isFootway = (r) =>
  ["footway", "path", "pedestrian", "steps"].includes(r.tags.highway);
export const isTruongTienSpan = (r) =>
  r?.id === 174759688 ||
  (r?.tags?.name === "Cầu Trường Tiền" &&
    (r?.tags?.bridge === "yes" || r?.tags?.layer === "2"));
export function roadWidth(r) {
  if (isFootway(r)) return Number.parseFloat(r.tags.width) || 4;
  const mapped = Number.parseFloat(r.tags.width) || 0;
  if (isTruongTienSpan(r)) return Math.max(mapped, 14);
  if (r.tags?.name === "Đống Đa" && r.tags?.oneway === "yes")
    return Math.max(mapped, 8);
  return Math.max(
    mapped,
    r.tags.name === "Cầu Phú Xuân"
      ? 14
      : r.tags.name === "Lê Lợi"
        ? 14
        : ["primary", "secondary", "tertiary"].includes(r.tags.highway)
          ? 12
          : 8,
  );
}
