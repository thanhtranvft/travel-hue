import test from "node:test";
import assert from "node:assert/strict";
import {
  cleanGameModeId,
  DEFAULT_GAME_MODE_ID,
  GAME_MODES,
  getModesForRegion,
  MAX_SPECIAL_MODES_PER_REGION,
  regionSupportsSpecialModes,
  roomKeyFor,
  SPECIAL_MODE_REGIONS,
} from "../src/modules/game-modes/registry.js";
import {
  loadActiveSession,
  saveActiveSession,
} from "../src/core/network/sessionPersistence.js";
import { renderGameModePicker } from "../src/ui/SessionUI.js";
import { Room } from "../server/Room.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

test("game-modes registry restricts 1-2 special modes to maps 01 & 05 and enables charms by default", () => {
  assert.equal(DEFAULT_GAME_MODE_ID, "free-roam");
  assert.deepEqual(SPECIAL_MODE_REGIONS, ["quoc-hoc", "quang-trung"]);
  assert.equal(MAX_SPECIAL_MODES_PER_REGION, 2);

  for (const mode of GAME_MODES) {
    assert.equal(mode.charmsEnabled, true);
  }

  for (const reg of ["quoc-hoc", "quang-trung"]) {
    assert.equal(regionSupportsSpecialModes(reg), true);
    const modes = getModesForRegion(reg, { includeUpcoming: true });
    assert.equal(modes[0].id, "free-roam");
    assert.equal(modes.length, 3);
    assert.ok(modes.length - 1 <= MAX_SPECIAL_MODES_PER_REGION);
  }

  for (const reg of ["south-bank", "truong-tien", "nguyen-chi-dieu"]) {
    assert.equal(regionSupportsSpecialModes(reg), false);
    const modes = getModesForRegion(reg, { includeUpcoming: true });
    assert.deepEqual(
      modes.map((m) => m.id),
      ["free-roam"],
    );
  }

  // Enabled special mode works on Maps 01 & 05; disabled/upcoming/unsupported modes normalize to free-roam
  assert.equal(cleanGameModeId("tag-chase", "quoc-hoc"), "tag-chase");
  assert.equal(cleanGameModeId("tag-chase", "quang-trung"), "tag-chase");
  assert.equal(cleanGameModeId("tag-chase", "south-bank"), "free-roam");
  assert.equal(cleanGameModeId("checkpoint-race", "quoc-hoc"), "free-roam");
  assert.equal(cleanGameModeId("unknown-mode", "quang-trung"), "free-roam");
  assert.equal(cleanGameModeId("free-roam", "truong-tien"), "free-roam");

  assert.equal(roomKeyFor("quoc-hoc", "free-roam"), "quoc-hoc");
  assert.equal(roomKeyFor("quoc-hoc", "tag-chase"), "quoc-hoc::tag-chase");
});

test("renderGameModePicker shows default mode without speed-charm title bloat and displays special slots on 01 & 05", () => {
  const html01 = renderGameModePicker("quoc-hoc", "free-roam", { "quoc-hoc": 3 }, 10);
  assert.ok(html01.includes("Dạo phố tự do"));
  assert.ok(html01.includes("3/10 người"));
  assert.ok(html01.includes("Rượt bắt tốc độ"));
  assert.ok(html01.includes("Đua Check-point Cố Đô"));
  assert.equal(html01.includes("Dạo phố Online &amp; Săn bùa tốc độ"), false);

  const html02 = renderGameModePicker("south-bank", "free-roam", { "south-bank": 1 }, 10);
  assert.ok(html02.includes("Dạo phố tự do"));
  assert.equal(html02.includes("Rượt bắt tốc độ"), false);
  assert.ok(html02.includes("Map 01 &amp; Map 05"));
});

test("sessionPersistence validates and restores gameMode safely", () => {
  const storage = createMemoryStorage();
  saveActiveSession(
    {
      active: true,
      name: "Huy",
      region: "quang-trung",
      gameMode: "invalid-mode",
      transportMode: "bike",
    },
    storage,
    1000,
  );
  const loaded = loadActiveSession(storage, 2000);
  assert.equal(loaded.gameMode, "free-roam");
  assert.equal(loaded.region, "quang-trung");
});

test("Room enforces maxTotalPlayers and exposes rooms map in summary()", () => {
  const region = {
    path: [
      [0, 0],
      [0, 100],
    ],
    radius: 15,
    extensions: [],
  };
  const areas = new Map(
    ["quoc-hoc", "quang-trung"].map((id) => [
      id,
      { spawn: { x: 0, z: 0, heading: 0 }, region },
    ]),
  );
  const room = new Room(areas, { maxPlayersPerRegion: 10, maxTotalPlayers: 3 });

  const p1 = room.join(
    { version: PROTOCOL_VERSION, name: "A", region: "quoc-hoc", gameMode: "free-roam" },
    () => {},
  );
  const p2 = room.join(
    { version: PROTOCOL_VERSION, name: "B", region: "quang-trung", gameMode: "free-roam" },
    () => {},
  );
  const p3 = room.join(
    { version: PROTOCOL_VERSION, name: "C", region: "quoc-hoc", gameMode: "free-roam" },
    () => {},
  );
  assert.ok(p1.player && p2.player && p3.player);
  assert.equal(p1.player.gameMode, "free-roam");

  const overflow = room.join(
    { version: PROTOCOL_VERSION, name: "D", region: "quang-trung", gameMode: "free-roam" },
    () => {},
  );
  assert.equal(overflow.error, "FULL");

  const summary = room.summary();
  assert.equal(summary.players, 3);
  assert.equal(summary.maxTotalPlayers, 3);
  assert.equal(summary.rooms["quoc-hoc"], 2);
  assert.equal(summary.rooms["quang-trung"], 1);
});
