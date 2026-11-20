import { stickInput } from "./touchMath.js";

export class TouchControls {
  constructor(drag) {
    this.drag = drag;
    this.throttle = 0;
    this.steer = 0;
    this.braking = false;
    this.moveId = null;
    this.cameraId = null;
    this.brakeId = null;
    this.stick = document.querySelector("#move-stick");
    this.thumb = document.querySelector("#stick-thumb");
    const brake = document.querySelector("#touch-brake");
    this.stick.addEventListener("pointerdown", (e) => {
      if (this.moveId !== null || (e.pointerType === "mouse" && e.button !== 0))
        return;
      const bounds = this.stick.getBoundingClientRect();
      if (!(bounds.width > 0)) return;
      e.preventDefault();
      this.moveId = e.pointerId;
      try {
        this.stick.setPointerCapture(e.pointerId);
      } catch {}
      this.center = {
        x: bounds.left + bounds.width / 2,
        y: bounds.top + bounds.height / 2,
      };
      this.radius = bounds.width * 0.32;
      this.stick.classList.add("engaged");
      this.move(e);
    });
    this.stick.addEventListener("pointermove", (e) => {
      if (e.pointerId !== this.moveId) return;
      e.preventDefault();
      this.move(e);
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      this.stick.addEventListener(event, (e) => {
        if (e.pointerId === this.moveId) {
          this.moveId = null;
          this.throttle = this.steer = 0;
          this.thumb.style.transform = "translate(0px,0px)";
          this.stick.classList.remove("engaged");
        }
      });
    this.bindCamera(document.querySelector("#look-pad"));
    this.bindCamera(document.querySelector("#game"));
    brake.addEventListener("pointerdown", (e) => {
      if (this.brakeId !== null) return;
      e.preventDefault();
      this.brakeId = e.pointerId;
      this.braking = true;
      try {
        brake.setPointerCapture(e.pointerId);
      } catch {}
      brake.classList.add("engaged");
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      brake.addEventListener(event, (e) => {
        if (e.pointerId === this.brakeId) {
          this.brakeId = null;
          this.braking = false;
          brake.classList.remove("engaged");
        }
      });
    for (const surface of [
      this.stick,
      brake,
      document.querySelector("#look-pad"),
      document.querySelector("#game"),
    ])
      surface?.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  move(event) {
    if (
      !(this.radius > 0) ||
      !Number.isFinite(event.clientX) ||
      !Number.isFinite(event.clientY)
    )
      return;
    const value = stickInput(
      event.clientX - this.center.x,
      event.clientY - this.center.y,
      this.radius,
    );
    this.throttle = value.throttle;
    this.steer = value.steer;
    this.thumb.style.transform = `translate(${value.x}px,${value.y}px)`;
  }
  bindCamera(surface) {
    if (!surface) return;
    surface.addEventListener("pointerdown", (e) => {
      if (
        this.cameraId !== null ||
        (e.pointerType === "mouse" && e.button !== 0) ||
        !Number.isFinite(e.clientX) ||
        !Number.isFinite(e.clientY)
      )
        return;
      e.preventDefault();
      this.cameraId = e.pointerId;
      try {
        surface.setPointerCapture(e.pointerId);
      } catch {}
      this.drag.active = true;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      surface.classList.add("engaged");
    });
    surface.addEventListener("pointermove", (e) => {
      if (
        e.pointerId !== this.cameraId ||
        !Number.isFinite(e.clientX) ||
        !Number.isFinite(e.clientY)
      )
        return;
      e.preventDefault();
      const nextYaw = this.drag.yaw - (e.clientX - this.drag.x) * 0.005;
      if (Number.isFinite(nextYaw))
        this.drag.yaw = Math.atan2(Math.sin(nextYaw), Math.cos(nextYaw));
      const nextPitch = this.drag.pitch + (e.clientY - this.drag.y) * 0.0035;
      if (Number.isFinite(nextPitch))
        this.drag.pitch = Math.max(0.12, Math.min(1.05, nextPitch));
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
    });
    for (const event of ["pointerup", "pointercancel", "lostpointercapture"])
      surface.addEventListener(event, (e) => {
        if (e.pointerId === this.cameraId) {
          this.cameraId = null;
          this.drag.active = false;
          surface.classList.remove("engaged");
        }
      });
  }
  rebindGameCanvas(canvas) {
    this.reset();
    this.bindCamera(canvas);
    canvas?.addEventListener("contextmenu", (e) => e.preventDefault());
  }
  reset() {
    this.moveId = this.cameraId = this.brakeId = null;
    this.throttle = this.steer = 0;
    this.braking = false;
    this.drag.active = false;
    this.thumb.style.transform = "translate(0px,0px)";
    document
      .querySelectorAll(".touch-controls .engaged, #game.engaged")
      .forEach((e) => e.classList.remove("engaged"));
  }
}
