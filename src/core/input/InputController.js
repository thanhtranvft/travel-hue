import { TouchControls } from "./TouchControls.js";
import { drivingKey } from "./keyboardInput.js";
export class InputController {
  constructor(canvas) {
    this.keys = new Set();
    this.drag = { active: false, x: 0, y: 0, yaw: 0, pitch: 0.38 };
    addEventListener("keydown", (e) => {
      if (e.target.closest?.('input,select,textarea,[contenteditable="true"]'))
        return;
      const key = drivingKey(e);
      if (!key) return;
      e.preventDefault();
      this.keys.add(key);
      if (!e.repeat && !this.drag.active) {
        this.drag.yaw = 0;
        this.recenterRequested = true;
      }
    });
    addEventListener("keyup", (e) => {
      const key = drivingKey(e);
      if (key) this.keys.delete(key);
    });
    this.touch = new TouchControls(this.drag);
    addEventListener("blur", () => this.reset());
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.reset();
    });
    document.querySelector("#app").addEventListener("selectstart", (event) => {
      if (!event.target.closest?.("input,textarea")) event.preventDefault();
    });
    document.querySelector("#app").addEventListener("contextmenu", (event) => {
      if (!event.target.closest?.("input,textarea")) event.preventDefault();
    });
  }
  reset() {
    this.keys.clear();
    this.touch.reset();
  }
  get throttle() {
    const keyboard =
      (this.keys.has("w") || this.keys.has("arrowup") ? 1 : 0) -
      (this.keys.has("s") || this.keys.has("arrowdown") ? 1 : 0);
    return keyboard || this.touch.throttle;
  }
  get steer() {
    const keyboard =
      (this.keys.has("a") || this.keys.has("arrowleft") ? 1 : 0) -
      (this.keys.has("d") || this.keys.has("arrowright") ? 1 : 0);
    return keyboard || this.touch.steer;
  }
  get brake() {
    return this.keys.has(" ") || this.touch.braking;
  }
  get sprint() {
    return this.keys.has("shift") || this.touch.throttle > 0.88;
  }
}

