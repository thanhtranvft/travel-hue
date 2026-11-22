import config from "../../data/online-config.json" with { type: "json" };
import { cleanAvatarId, DEFAULT_AVATAR_ID, PROTOCOL_VERSION } from "./protocol.js";

export class OnlineClient extends EventTarget {
  constructor(name, region, avatar = DEFAULT_AVATAR_ID) {
    super();
    this.name = name;
    this.region = region;
    this.avatar = cleanAvatarId(avatar);
    this.status = "idle";
    this.stopped = false;
    this.attempt = 0;
  }
  emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }
  setStatus(value) {
    this.status = value;
    this.emit("status", value);
  }
  send(message) {
    if (this.socket?.readyState === WebSocket.OPEN)
      this.socket.send(JSON.stringify(message));
  }
  connect() {
    this.setStatus(this.token ? "reconnecting" : "connecting");
    const endpoint =
      import.meta.env.VITE_ONLINE_URL ||
      config.endpoint ||
      `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}${config.path}`;
    const socket = (this.socket = new WebSocket(endpoint));
    let timeout = setTimeout(() => socket.close(), 15000);
    socket.onopen = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => socket.close(), 8000);
      this.send({
        type: "join",
        version: PROTOCOL_VERSION,
        name: this.name,
        avatar: this.avatar,
        region: this.region,
        token: this.token,
      });
    };
    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      if (message.type === "welcome") {
        clearTimeout(timeout);
        this.id = message.id;
        this.token = message.token;
        this.attempt = 0;
        this.setStatus("connected");
      }
      if (message.type === "error") {
        this.stopped = true;
        this.setStatus("error");
      }
      this.emit(message.type, message);
    };
    socket.onerror = () => {};
    socket.onclose = () => {
      clearTimeout(timeout);
      if (this.stopped) return;
      if (!this.token && this.attempt >= 3) {
        this.stopped = true;
        this.setStatus("error");
        this.emit("error", {
          type: "error",
          code: "UNAVAILABLE",
          message: "Không kết nối được máy chủ Online.",
        });
        return;
      }
      this.setStatus("reconnecting");
      this.retry = setTimeout(
        () => this.connect(),
        Math.min(4000, 500 * 2 ** Math.min(this.attempt++, 3)),
      );
    };
  }
  leave() {
    this.stopped = true;
    clearTimeout(this.retry);
    this.send({ type: "leave" });
    this.socket?.close(1000, "Leaving");
    this.setStatus("closed");
  }
}
