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
export const AVATAR_IDS = ["boy", "girl", "dog", "cat", "cow", "buffalo", "scholar", "ao-dai-woman"];
export const DEFAULT_AVATAR_ID = "boy";
export const STANCE_IDS = ["idle", "walk", "run", "bike", "fish", "boat", "cruise"];
export const PEDAL_BOAT_COUNT = 6;
export { cleanCharmTier, MAX_BOOST_MULTIPLIER } from "../world/speedCharms.js";

export const AVATAR_CATALOG = [
  {
    id: "boy",
    label: "Học sinh nam",
    subtitle: "Khăn quàng đỏ · Ba lô sao",
    kind: "human",
    accent: "#2d74d6",
    bikeColor: "#2477d4",
  },
  {
    id: "girl",
    label: "Học sinh nữ",
    subtitle: "Tóc buộc nơ · Đồng phục",
    kind: "human",
    accent: "#df5f86",
    bikeColor: "#d95b84",
  },
  {
    id: "dog",
    label: "Chú chó con",
    subtitle: "Cún vàng đáng yêu",
    kind: "animal",
    accent: "#d68b3d",
    bikeColor: "#2d8d7b",
  },
  {
    id: "cat",
    label: "Chú mèo vàng",
    subtitle: "Mèo mướp cam · Tai vểnh",
    kind: "animal",
    accent: "#eb9430",
    bikeColor: "#337ac2",
  },
  {
    id: "cow",
    label: "Chú bò vàng",
    subtitle: "Bò vàng · Chuông cổ",
    kind: "animal",
    accent: "#cf934a",
    bikeColor: "#378a6a",
  },
  {
    id: "buffalo",
    label: "Chú trâu đen",
    subtitle: "Trâu đồng Việt Nam",
    kind: "animal",
    accent: "#485463",
    bikeColor: "#2d70b3",
  },
  {id:"scholar",label:"Thầy đồ",subtitle:"Áo dài đen · Kính tròn · Gậy gỗ",kind:"human",accent:"#464753",bikeColor:"#24384a"},
  {id:"ao-dai-woman",label:"Nữ sinh áo dài",subtitle:"Áo dài trắng · Nón lá · Tóc dài",kind:"human",accent:"#dfdacb",bikeColor:"#8ca5a5"},
];

export function cleanAvatarId(value) {
  return typeof value === "string" && AVATAR_IDS.includes(value)
    ? value
    : DEFAULT_AVATAR_ID;
}

export function cleanStance(value, speed = 0) {
  if (typeof value === "string" && STANCE_IDS.includes(value)) return value;
  const abs = Math.abs(Number(speed) || 0);
  if (abs >= 5.9) return "bike";
  if (abs >= 2.85) return "run";
  if (abs >= 0.14) return "walk";
  return "idle";
}

export function cleanBoatIndex(value, stance = "idle") {
  if (stance !== "boat") return -1;
  const idx = Number(value);
  return Number.isInteger(idx) && idx >= 0 && idx < PEDAL_BOAT_COUNT ? idx : -1;
}

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

