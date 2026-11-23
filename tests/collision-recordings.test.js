import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CollisionVoice,
  collisionRecordingURLs,
} from "../src/core/audio/CollisionVoice.js";

test("all collision and vendor recordings exist and have WAV headers", async () => {
  for (const type of [
    "pedestrian",
    "scooter",
    "police",
    "player",
    "car",
    "xoi-vendor",
    "hawker-vendor",
  ]) {
    const bytes = await readFile(new URL(collisionRecordingURLs[type]));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
    assert.ok(bytes.length > 1000);
  }
  assert.equal(Array.isArray(collisionRecordingURLs.student), true);
  assert.equal(collisionRecordingURLs.student.length, 2);
  for (const url of collisionRecordingURLs.student) {
    const bytes = await readFile(new URL(url));
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WAVE");
    assert.ok(bytes.length > 1000);
  }
  assert.ok(decodeURIComponent(collisionRecordingURLs.student[0]).includes("08-10-28"));
  assert.ok(decodeURIComponent(collisionRecordingURLs.student[1]).includes("08-10-36"));
  assert.ok(
    decodeURIComponent(collisionRecordingURLs["xoi-vendor"]).includes(
      "Làm tí xôi cho nóng con",
    ),
  );
  assert.ok(
    decodeURIComponent(collisionRecordingURLs["hawker-vendor"]).includes(
      "Ăn sáng con ơi",
    ),
  );
});

test("muting while a recording loads prevents delayed playback", async () => {
  const originalFetch = globalThis.fetch;
  let complete,
    starts = 0;
  try {
    globalThis.fetch = () =>
      new Promise((resolve) => {
        complete = () =>
          resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
      });
    const ctx = {
        state: "running",
        decodeAudioData: async () => ({ duration: 2 }),
        createBufferSource: () => ({
          connect() {},
          disconnect() {},
          start() {
            starts++;
          },
          stop() {},
        }),
      },
      voice = new CollisionVoice(ctx, {}),
      pending = voice.play("pedestrian");
    voice.stop();
    complete();
    assert.equal(await pending, false);
    assert.equal(starts, 0);
    assert.equal(await voice.play("pedestrian"), true);
    assert.equal(starts, 1);
    assert.equal(voice.lastPlayed.type, "pedestrian");
    voice.stop();
    assert.equal(voice.active, null);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("student collision randomly selects between the two student WAV variants", async () => {
  const originalFetch = globalThis.fetch;
  const fetchedUrls = [];
  let seq = 0;
  const picks = [0.1, 0.85];
  try {
    globalThis.fetch = async (url) => {
      fetchedUrls.push(String(url));
      return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) };
    };
    const ctx = {
      state: "running",
      decodeAudioData: async () => ({ duration: 1.5 }),
      createBufferSource: () => ({
        connect() {},
        disconnect() {},
        start() {},
        stop() {},
      }),
    };
    const voice = new CollisionVoice(ctx, {}, () => {}, () => picks[seq++]);
    await voice.play("student");
    assert.equal(voice.lastPlayed.type, "student");
    assert.equal(voice.lastPlayed.variant, 0);
    await voice.play("student");
    assert.equal(voice.lastPlayed.type, "student");
    assert.equal(voice.lastPlayed.variant, 1);
    assert.equal(fetchedUrls[0], collisionRecordingURLs.student[0]);
    assert.equal(fetchedUrls[1], collisionRecordingURLs.student[1]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
