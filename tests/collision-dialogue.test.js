import test from "node:test";
import assert from "node:assert/strict";
import { CityAudio } from "../src/core/audio/CityAudio.js";
import { VendorCalls } from "../src/core/world/VendorCalls.js";
import { GamePresenter } from "../src/app/GamePresenter.js";
import lines from "../src/data/audio/collision-dialogue.json" with { type: "json" };

test("collision dispatch selects the correct recording and respects mute", () => {
  const played = [],
    audio = Object.create(CityAudio.prototype);
  Object.assign(audio, {
    enabled: true,
    ctx: { state: "running", currentTime: 10 },
    collisionVoice: {
      active: null,
      play: (type) => {
        played.push(type);
        return true;
      },
    },
  });
  assert.ok(audio.speakCollision("pedestrian"));
  assert.ok(audio.speakCollision("scooter"));
  assert.ok(audio.speakCollision("student"));
  assert.equal(audio.speakVendorCall("xoi-vendor"), false);
  audio.ctx.currentTime += 5;
  assert.ok(audio.speakVendorCall("xoi-vendor"));
  assert.ok(audio.speakVendorCall("hawker-vendor"));
  assert.deepEqual(played, [
    "pedestrian",
    "scooter",
    "student",
    "xoi-vendor",
    "hawker-vendor",
  ]);
  assert.equal(lines.pedestrian, "Đi đứng kiểu chi rứa hả?");
  assert.equal(lines.scooter, "Bị đui hay răng mà không thấy?");
  assert.equal(lines.student, "Cẩn thận bạn ơi!");
  assert.equal(lines["xoi-vendor"], "Làm tí xôi cho nóng con!");
  assert.equal(lines["hawker-vendor"], "Ăn sáng con ơi!");
  audio.enabled = false;
  assert.equal(audio.speakCollision("pedestrian"), false);
  assert.equal(audio.speakVendorCall("xoi-vendor"), false);
  assert.equal(played.length, 5);
});

test("student collision in GamePresenter.crash dispatches 'student' recording instead of generic pedestrian", () => {
  const spoken = [];
  const msgEl = { textContent: "" };
  const toastEl = { hidden: true };
  const prevDoc = globalThis.document;
  globalThis.document = {
    querySelector: (sel) =>
      sel === "#collision-message"
        ? msgEl
        : sel === "#collision-toast"
          ? toastEl
          : null,
  };
  try {
    const fake = {
      bike: {
        position: { x: 10, y: 0.3, z: 10, copy() {} },
        motion: { speed: 2, heading: 0 },
      },
      impact: { position: { copy() {}, y: 0 }, visible: false },
      crashCount: 0,
      syncMode() {},
      audio: {
        collision() {},
        speakCollision(type) {
          spoken.push(type);
        },
      },
    };
    GamePresenter.prototype.crash.call(
      fake,
      { type: "pedestrian", isStudent: true, heading: 0, pause: 0 },
      10,
      10,
    );
    assert.deepEqual(spoken, ["student"]);
    assert.ok(msgEl.textContent.includes("Cẩn thận bạn ơi!"));
  } finally {
    globalThis.document = prevDoc;
  }
});

test("VendorCalls triggers xoi-vendor and hawker-vendor cleanly by proximity", () => {
  const calls = new VendorCalls({
    callDistance: 9.5,
    rearmDistance: 15,
    cooldownSeconds: 12,
    typeCooldownSeconds: 4,
  });
  const vendors = [
    { id: "xoi", vendorType: "xoi-vendor", x: 10, y: 0.2, z: 0 },
    { id: "hawker-1", vendorType: "hawker-vendor", x: -10, y: 0.2, z: 0 },
  ];
  // Far away -> nothing
  assert.equal(calls.update(1, { position: { x: 40, y: 0.2, z: 0 } }, vendors), null);
  // Near xoi couple -> triggers xoi-vendor
  const hitXoi = calls.update(2, { position: { x: 12, y: 0.2, z: 2 } }, vendors);
  assert.equal(hitXoi?.vendorType, "xoi-vendor");
  // Still near -> does not retrigger immediately
  assert.equal(calls.update(3, { position: { x: 11, y: 0.2, z: 2 } }, vendors), null);
  // Near hawker -> triggers hawker-vendor
  const hitHawker = calls.update(4, { position: { x: -9, y: 0.2, z: 2 } }, vendors);
  assert.equal(hitHawker?.vendorType, "hawker-vendor");
});
