export const PROTOCOL_VERSION = 1;
export const MAX_PLAYERS = 10;
export const PLAYER_COLORS = [
  "#247bba",
  "#b35252",
  "#37866b",
  "#885db0",
  "#c38a29",
  "#329a9b",
  "#bd668e",
  "#6475be",
  "#868936",
  "#bd713f",
];
export function cleanPlayerName(value) {
  return typeof value === "string"
    ? Array.from(
        value
          .normalize("NFC")
          .replace(/[\p{C}<>]/gu, "")
          .replace(/\s+/g, " ")
          .trim(),
      )
        .slice(0, 18)
        .join("")
    : "";
}
export function sweptContact(a, b, other, radius = 1.1) {
  const dx = b.x - a.x,
    dz = b.z - a.z;
  const t = Math.max(
    0,
    Math.min(
      1,
      ((other.x - a.x) * dx + (other.z - a.z) * dz) / (dx * dx + dz * dz || 1),
    ),
  );
  return Math.hypot(a.x + dx * t - other.x, a.z + dz * t - other.z) < radius;
}
