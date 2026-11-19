import { OnlineClient } from "./OnlineClient.js";
import { RemotePlayers } from "./RemotePlayers.js";
import { setRiderIdentity } from "../vehicle/RiderIdentity.js";

export class OnlineSession {
  constructor(game, name, panel, areas) {
    this.game = game;
    this.panel = panel;
    this.areas = areas;
    this.avatars = new RemotePlayers();
    this.attachScene(game.scene);
    this.client = new OnlineClient(name, game.world.region.id);
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
      setRiderIdentity(game.bike, name, detail.player.color);
      this.applyPose(detail.player);
      this.client.region = detail.player.region;
    });
    this.client.addEventListener("relocate", ({ detail }) => {
      this.awaitingRegion = false;
      this.applyPose(detail.player);
    });
    this.client.addEventListener("correct", ({ detail }) =>
      this.applyPose(detail.player),
    );
    this.client.addEventListener("snapshot", ({ detail }) => {
      this.avatars.sync(detail.players, this.client.id);
      panel.snapshot(detail, this.client.id, areas);
    });
    this.client.addEventListener("error", ({ detail }) =>
      panel.status(
        detail.message + " Chọn Đổi chế độ để thử lại hoặc Khám phá.",
      ),
    );
    this.client.addEventListener("collision", ({ detail }) => {
      for (const p of detail.players)
        if (p.id === this.client.id) {
          const other = detail.players.find((o) => o.id !== p.id);
          this.applyPose(p);
          game.crash(
            {
              type: "player",
              name: other.name,
              heading: other.heading,
              speed: 0,
            },
            p.x,
            p.z,
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
    this.onHide = () => this.client.leave();
    document.addEventListener("visibilitychange", this.onVisibility);
    addEventListener("pagehide", this.onHide);
  }
  get canMove() {
    return this.client.status === "connected" && !this.awaitingRegion;
  }
  attachScene(scene) {
    scene.add(this.avatars.root);
  }
  applyPose(p) {
    const { game } = this;
    if (game.world.region.id !== p.region) return;
    game.bike.position.set(p.x, game.world.groundAt(p.x, p.z), p.z);
    game.bike.motion.speed = p.speed;
    game.bike.motion.heading = p.heading;
    game.bike.motion.lean = p.lean;
    game.bike.rotation.y = p.heading;
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
    });
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
