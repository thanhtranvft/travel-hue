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

test("all 5 campus student populations expose isStudent=true for collision dispatch", async () => {
  const THREE = await import("three");
  const { loadGeography } = await import("../src/modules/areas/AreaModel.js");
  const { GeographicWorld } = await import("../src/core/world/GeographicWorld.js");
  const prevDoc = globalThis.document;
  const noop = () => {};
  const ctx = {
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "center",
    fillRect: noop,
    strokeRect: noop,
    clearRect: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    fill: noop,
    roundRect: noop,
    fillText: noop,
    scale: noop,
    measureText: () => ({ width: 40 }),
    createLinearGradient: () => ({ addColorStop: noop }),
  };
  globalThis.document = {
    createElement: () => ({ width: 256, height: 256, getContext: () => ctx }),
  };
  try {
    const counts = {};
    for (const areaId of ["quoc-hoc", "nguyen-chi-dieu", "quang-trung"]) {
      const region = await loadGeography(areaId);
      const world = new GeographicWorld(new THREE.Scene());
      world.region = region;
      world.build();
      if (areaId === "quoc-hoc") {
        const qhStudents = world.quocHocCampus?.students?.students || [];
        const hbtStudents = world.haiBaTrungCampus?.students?.students || [];
        assert.ok(qhStudents.length > 0, "quoc-hoc students exist");
        assert.ok(hbtStudents.length > 0, "hai-ba-trung students exist");
        assert.ok(qhStudents.every((s) => s.isStudent === true));
        assert.ok(hbtStudents.every((s) => s.isStudent === true));
        counts["quoc-hoc"] = qhStudents.length;
        counts["hai-ba-trung"] = hbtStudents.length;
      } else if (areaId === "nguyen-chi-dieu") {
        const ncdStudents = world.nguyenChiDieuCampus?.students?.students || [];
        const ctStudents = world.caoThangCampus?.students?.students || [];
        assert.ok(ncdStudents.length > 0, "nguyen-chi-dieu students exist");
        assert.ok(ctStudents.length > 0, "cao-thang students exist");
        assert.ok(ncdStudents.every((s) => s.isStudent === true));
        assert.ok(ctStudents.every((s) => s.isStudent === true));
        counts["nguyen-chi-dieu"] = ncdStudents.length;
        counts["cao-thang"] = ctStudents.length;
      } else if (areaId === "quang-trung") {
        const qtStudents = world.quangTrungCampus?.students?.students || [];
        assert.ok(qtStudents.length > 0, "quang-trung students exist");
        assert.ok(qtStudents.every((s) => s.isStudent === true));
        counts["quang-trung"] = qtStudents.length;
      }
    }
    assert.equal(Object.keys(counts).length, 5);
  } finally {
    globalThis.document = prevDoc;
  }
});
