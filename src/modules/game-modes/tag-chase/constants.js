export const TAG_CHASE_CONFIG = {
  minPlayersToStart: 2,
  countdownMs: 4000,
  roundDurationMs: 150000,
  intermissionMs: 10000,
  hotspotIntervalMs: 45000,
  hotspotRadius: 28,
  hunterSpeedMultiplier: 1.08,
  hunterTagPoints: 100,
  shieldBlockPoints: 60,
  survivalTickMs: 5000,
  survivalPoints: 10,
  closeCallEnterDist: 5.5,
  closeCallEscapeDist: 10.5,
  closeCallWindowMs: 3500,
  closeCallBasePoints: 40,
  partyBoxCount: 8,
  partyBoxRefreshMs: 28000,
  partyMaxPerItem: 2,
  shieldDurationMs: 6000,
  windRadius: 9.5,
  windSlowDurationMs: 2000,
  windSlowMultiplier: 0.7,
  coffeeBoostDurationMs: 2000,
  coffeeBoostMultiplier: 1.25,
  coopTriggerRemainingMs: 85000,
  coopDurationMs: 45000,
  coopTargetCount: 15,
  coopRewardPoints: 150,
  emoteCooldownMs: 2000,
  surgeRemainingMs: 35000,
};

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

export const LANDMARK_HOTSPOTS = {
  "quoc-hoc": [
    {
      id: "qh-youth",
      title: "Công viên Thanh Thiếu Niên",
      x: 514.1,
      z: -463.3,
    },
    {
      id: "qh-bia",
      title: "Bia Quốc Học · Lê Lợi",
      x: 677.1,
      z: -608.6,
    },
    {
      id: "qh-ubnd",
      title: "UBND Thành phố Huế",
      x: 888.2,
      z: -799.6,
    },
    {
      id: "qh-truong-tien",
      title: "Ngã ba Lê Lợi · Tràng Tiền",
      x: 1222.4,
      z: -1107.6,
    },
  ],
  "quang-trung": [
    {
      id: "qt-school",
      title: "Trường Tiểu học Quang Trung",
      x: 1747.7,
      z: -234.4,
    },
    {
      id: "qt-rhm",
      title: "Quảng trường RHM · Nguyễn Huệ",
      x: 1816.9,
      z: -222.0,
    },
    {
      id: "qt-church",
      title: "Nhà thờ Dòng Chúa Cứu Thế",
      x: 1979.9,
      z: -193.9,
    },
  ],
};

export const COOP_TASKS = {
  "quoc-hoc": {
    id: "lanterns",
    title: "Thắp 15 Đèn Lồng bên Sông Hương",
    itemKind: "lantern",
  },
  "quang-trung": {
    id: "lotuses",
    title: "Gom 15 Hoa Sen trước Dòng Chúa Cứu Thế",
    itemKind: "lotus",
  },
};

export function cleanPartyItemId(value) {
  return typeof value === "string" && value in PARTY_ITEMS ? value : null;
}

export function cleanEmoteId(value) {
  return typeof value === "string" && EMOTE_BY_ID.has(value) ? value : null;
}
