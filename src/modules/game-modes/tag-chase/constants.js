import journey from "./journey-config.json" with { type: "json" };

export const TAG_CHASE_CONFIG = journey.rules;

export const PARTY_ITEMS = {
  "non-la-shield": {
    id: "non-la-shield",
    name: "Khiên Nón Lá",
    shortName: "Nón Lá",
    key: "Q",
    color: "#ffd36a",
    glow: "rgba(255, 211, 106, 0.48)",
    description: "Chặn 1 cú húc hoặc miễn nhiễm choáng giao thông trong 6s",
  },
  "perfume-wind": {
    id: "perfume-wind",
    name: "Gió Sông Hương",
    shortName: "Gió Hương",
    key: "E",
    color: "#6ee7ff",
    glow: "rgba(110, 231, 255, 0.45)",
    description: "Làm chậm 30% đối thủ bám sát trong 2s",
  },
  "salt-coffee": {
    id: "salt-coffee",
    name: "Cà Phê Muối",
    shortName: "Cà Phê",
    key: "F",
    color: "#ff9b54",
    glow: "rgba(255, 155, 84, 0.48)",
    description: "Giải choáng ngay lập tức và vọt +25% tốc độ trong 2s",
  },
};

export const PARTY_ITEM_LIST = [
  PARTY_ITEMS["non-la-shield"],
  PARTY_ITEMS["perfume-wind"],
  PARTY_ITEMS["salt-coffee"],
];

export const EMOTE_LIST = [
  { id: "wait", text: "Đợi tui với!", short: "Đợi tui!" },
  { id: "watch", text: "Coi chừng!", short: "Coi chừng!" },
  { id: "coffee", text: "Cà phê không?", short: "Cà phê?" },
  { id: "bolt", text: "⚡ Bứt tốc!", short: "⚡" },
  { id: "laugh", text: "😂 Hụt rồi!", short: "😂" },
];

export const EMOTE_BY_ID = new Map(EMOTE_LIST.map((e) => [e.id, e]));

export const LANDMARK_HOTSPOTS = journey.landmarks;

export const COOP_TASKS = journey.coopTasks;

export function cleanPartyItemId(value) {
  return typeof value === "string" && value in PARTY_ITEMS ? value : null;
}

export function cleanEmoteId(value) {
  return typeof value === "string" && EMOTE_BY_ID.has(value) ? value : null;
}
