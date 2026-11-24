import { OnlineClient } from "./OnlineClient.js";
import { RemotePlayers } from "./RemotePlayers.js";
import { setRiderIdentity } from "../vehicle/RiderIdentity.js";
import {
  cleanGameModeId,
  DEFAULT_GAME_MODE_ID,
} from "../../modules/game-modes/registry.js";

export class OnlineSession {
  constructor(
    game,
    name,
    panel,
    areas,
    { token = null, onToken = null, gameMode = DEFAULT_GAME_MODE_ID } = {},
  ) {
    this.game = game;
    this.panel = panel;
    this.areas = areas;
    this.onToken = onToken;
    this.avatars = new RemotePlayers({ mobile: !!game.quality?.mobile });
    this.attachScene(game.scene);
    this.client = new OnlineClient(
      name,
      game.world.region.id,
      game.bike.avatarId,
      token,
      gameMode,
    );
    this.seq = 0;
    this.nextSend = 0;
    this.client.addEventListener("status", ({ detail }) => {
      panel.status(
        {
          connecting: "Đang vào phòng…",
          connected: "Đã kết nối",
          reconnecting: "Mất kết nối · Đang nối lại…",
          error: "Chưa vào được phòng",
          closed: "",
        }[detail],
      );
      if (detail !== "connected") {
        game.input.reset();
        game.bike.motion.speed = 0;
        this.avatars.root.visible = false;
      } else this.avatars.root.visible = true;
    });
    this.client.addEventListener("welcome", ({ detail }) => {
      this.awaitingRegion = false;
      game.onlineResetRequested = false;
      this.onToken?.(detail.token, detail.player, Boolean(detail.reconnected));
      setRiderIdentity(game.bike, name, detail.player.color);
      if (detail.reconnected && detail.player.stance === "bike") {
        game.bike.setTransportMode("bike");
        game.syncMode?.();
      }
      const nextRegion = detail.player?.region || game.world.region.id;
      const nextMode = cleanGameModeId(
        detail.player?.gameMode || gameMode,
        nextRegion,
      );
      if (
        game.gameMode &&
        (game.gameMode.modeId !== nextMode || !game.gameMode.runtime)
      ) {
        game.gameMode.activate?.(nextMode, nextRegion);
      }
      this.applyPose(detail.player, true);
      this.client.region = detail.player.region;
    });
    this.client.addEventListener("relocate", ({ detail }) => {
      this.awaitingRegion = false;
      this.applyPose(detail.player, true);
    });
    this.client.addEventListener("correct", ({ detail }) =>
      this.applyPose(detail.player, false),
    );
    this.client.addEventListener("snapshot", ({ detail }) => {
      this.avatars.sync(detail.players, this.client.id);
      panel.snapshot(detail, this.client.id, areas);
      game.gameMode?.onSnapshot?.(detail, this.client.id);
    });
    this.client.addEventListener("charms", ({ detail }) => {
      game.charms?.applyServerCharms?.(detail);
    });
    this.client.addEventListener("inventory", ({ detail }) => {
      game.charms?.applyServerInventory?.(detail);
    });
    this.client.addEventListener("boost_ack", ({ detail }) => {
      game.charms?.applyServerBoostAck?.(detail);
    });
    this.client.addEventListener("mode_event", ({ detail }) => {
      if (detail?.relocate) {
        this.applyPose(
          {
            region: game.world.region.id,
            y: game.bike.position.y,
            heading: game.bike.motion.heading,
            ...detail.relocate,
          },
          false,
        );
      }
      game.gameMode?.onServerEvent?.(detail);
    });
    this.client.addEventListener("error", ({ detail }) =>
      panel.status(
        detail.message +
          " Chọn Về Trang chủ / Đổi chế độ để thử lại hoặc đổi khu vực.",
      ),
    );
    this.client.addEventListener("collision", ({ detail }) => {
      if (!detail?.players || game.isLoadingRegion) return;
      for (const p of detail.players)
        if (p.id === this.client.id) {
          const other = detail.players.find((o) => o.id !== p.id) || {};
          this.applyPose(p);
          game.crash(
            {
              type: "player",
              name: other.name || "người chơi khác",
              heading: Number.isFinite(other.heading)
                ? other.heading
                : game.bike.motion.heading,
              speed: 0,
            },
            Number.isFinite(p.x) ? p.x : game.bike.position.x,
            Number.isFinite(p.z) ? p.z : game.bike.position.z,
          );
        }
    });
    this.client.connect();
    this.onVisibility = () => {
      if (document.hidden) {
        this.client.send({ type: "pause", reason: "background" });
        game.bike.motion.speed = 0;
      }
    };
    this.onHide = () => this.client.disconnectForReload();
    document.addEventListener("visibilitychange", this.onVisibility);
    addEventListener("pagehide", this.onHide);
  }
  get canMove() {
    return this.client.status === "connected" && !this.awaitingRegion;
  }
  attachScene(scene) {
    scene.add(this.avatars.root);
  }
  applyPose(p, snapCamera = false) {
    const { game } = this;
    if (!p || game.world.region.id !== p.region) return;
    if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) return;
    const refY = Number.isFinite(p.y) ? p.y : game.bike.position.y;
    const y = game.world.groundAt(p.x, p.z, refY);
    game.bike.position.set(p.x, y, p.z);
    if (Number.isFinite(p.speed)) game.bike.motion.speed = p.speed;
    if (Number.isFinite(p.heading)) {
      game.bike.motion.heading = p.heading;
      game.bike.rotation.y = p.heading;
      if (snapCamera) {
        game.cameraYaw = p.heading;
        game.input.drag.yaw = 0;
        game.input.recenterRequested = true;
      }
    }
    if (Number.isFinite(p.lean)) game.bike.motion.lean = p.lean;
  }
  update(dt) {
    const game = this.game,
      region = game.world.region.id;
    this.avatars.update(dt, region, game.bike.position);
    if (this.client.status !== "connected" || document.hidden) return;
    if (this.client.region !== region || game.onlineResetRequested) {
      this.client.region = region;
      this.awaitingRegion = true;
      game.onlineResetRequested = false;
      this.client.send({ type: "region", region });
      return;
    }
    if (this.awaitingRegion || performance.now() < this.nextSend) return;
    this.nextSend = performance.now() + 50;
    const p = game.bike.position,
      m = game.bike.motion;
    this.client.send({
      type: "state",
      seq: ++this.seq,
      region,
      x: p.x,
      y: p.y,
      z: p.z,
      heading: m.heading,
      speed: m.speed,
      lean: m.lean,
      avatar: game.bike.avatarId,
      stance: game.bike.stance,
    });
  }
  sendPickup(charmId) {
    this.client.send({ type: "pickup", charmId });
  }
  sendUseCharm(tier) {
    this.client.send({ type: "use_charm", tier });
  }
  sendModeAction(action, payload = {}) {
    this.client.send({ type: "mode_action", action, ...payload });
  }
  pauseRegion() {
    this.awaitingRegion = true;
    this.client.send({ type: "pause", reason: "region" });
  }
  dispose() {
    this.client.leave();
    document.removeEventListener("visibilitychange", this.onVisibility);
    removeEventListener("pagehide", this.onHide);
    this.avatars.root.removeFromParent();
    this.avatars.clear();
    this.panel.remove();
  }
}
