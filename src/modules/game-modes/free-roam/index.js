import { handleRiverRewardAction } from "../../../server/riverActivity.js";

export const freeRoamMode = {
  id: "free-roam",
  kind: "default",
  title: "Dạo phố tự do",
  shortTitle: "Dạo phố tự do",
  description:
    "Tự do tham quan phố Huế, nghe chuông chùa, tiếng rao và nhặt bùa tăng tốc trên đường.",
  regions: "*",
  enabled: true,
  upcoming: false,
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
      onAction(p, message, room, now) {
        if (handleRiverRewardAction(p, message, room, now)) {
          room.snapshot();
        }
      },
      publicSummary() {
        return null;
      },
    };
  },
};

export default freeRoamMode;
