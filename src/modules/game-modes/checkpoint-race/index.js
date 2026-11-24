export const checkpointRaceMode = {
  id: "checkpoint-race",
  kind: "special",
  title: "Đua Check-point Cố Đô",
  shortTitle: "Đua Check-point",
  description:
    "Chạy tiếp sức hoặc đua thời gian qua các điểm mốc địa danh nổi tiếng trên tuyến 01 & 05.",
  regions: ["quoc-hoc", "quang-trung"],
  enabled: false,
  upcoming: true,
  charmsEnabled: true,
  maxPlayers: 10,
  createClientSession() {
    return {
      update() {},
      onServerEvent() {},
      dispose() {},
    };
  },
  createServerRoomState() {
    return {
      tick() {},
      onJoin() {},
      onLeave() {},
      onCollision() {},
      publicSummary() {
        return null;
      },
    };
  },
};

export default checkpointRaceMode;
