import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "../server/Room.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { BicycleMotion } from "../src/core/vehicle/BicycleMotion.js";
import { CityAudio } from "../src/core/audio/CityAudio.js";
import {
  CHARM_REFRESH_MAX_MS,
  CHARM_REFRESH_MIN_MS,
  CHARM_TIERS,
  generateRegionCharms,
  randomCharmRefreshMs,
} from "../src/core/world/speedCharms.js";

const longRegion = {
  path: [
    [0, 0],
    [0, 120],
    [120, 120],
    [120, 240],
    [240, 240],
  ],
  radius: 16,
  extensions: [
    [
      [-20, -20],
      [20, -20],
      [20, 20],
      [-20, 20],
    ],
  ],
};

test("generateRegionCharms spawns fewer charms for higher boosts and honors canPlace", () => {
  const charms = generateRegionCharms(longRegion, {
    idPrefix: "test",
    canPlace: (x, z) => x >= -25 && z >= -25,
    groundAt: () => 0.3,
  });
  const counts = { 10: 0, 20: 0, 30: 0, 100: 0 };
  for (const c of charms) {
    assert.ok(c.x >= -25 && c.z >= -25);
    counts[c.tier]++;
  }
  assert.equal(counts["10"], CHARM_TIERS["10"].count);
  assert.equal(counts["20"], CHARM_TIERS["20"].count);
  assert.equal(counts["30"], CHARM_TIERS["30"].count);
  assert.equal(counts["100"], CHARM_TIERS["100"].count);
  assert.ok(counts["10"] > counts["20"]);
  assert.ok(counts["20"] > counts["30"]);
  assert.ok(counts["30"] > counts["100"]);

  for (let i = 0; i < 20; i++) {
    const ms = randomCharmRefreshMs();
    assert.ok(ms >= CHARM_REFRESH_MIN_MS && ms <= CHARM_REFRESH_MAX_MS);
  }
});

test("BicycleMotion scales top speed on bike and foot and smoothly slows down after boost", () => {
  const bike = new BicycleMotion("bike");
  for (let i = 0; i < 240; i++) bike.step(1 / 30, 1, 0, false, false, 1);
  assert.ok(bike.speed <= 9.01 && bike.speed > 7.5);

  const boostedBike = new BicycleMotion("bike");
  for (let i = 0; i < 240; i++) boostedBike.step(1 / 30, 1, 0, false, false, 2.0);
  assert.ok(boostedBike.speed > 16.5 && boostedBike.speed <= 18.01);

  const beforeDrop = boostedBike.speed;
  boostedBike.step(1 / 30, 1, 0, false, false, 1);
  assert.ok(boostedBike.speed < beforeDrop && boostedBike.speed > 15);

  const foot = new BicycleMotion("foot");
  for (let i = 0; i < 180; i++) foot.step(1 / 30, 1, 0, false, true, 1);
  assert.ok(foot.speed <= 5.65 && foot.speed > 5.0);

  const boostedFoot = new BicycleMotion("foot");
  for (let i = 0; i < 180; i++) boostedFoot.step(1 / 30, 1, 0, false, true, 2.0);
  assert.ok(boostedFoot.speed > 10.5 && boostedFoot.speed <= 11.25);
});

test("Room validates charm pickup, inventory stacks, speed boost anti-cheat, and ~30s refresh", () => {
  let now = 1000;
  const areas = new Map([
    ["a", { spawn: { x: 0, z: 0, heading: 0 }, region: longRegion }],
  ]);
  const room = new Room(areas, { now: () => now });

  const msgA = [];
  const msgB = [];
  const a = room.join(
    { version: PROTOCOL_VERSION, name: "An", region: "a" },
    (m) => msgA.push(structuredClone(m)),
  ).player;
  const b = room.join(
    { version: PROTOCOL_VERSION, name: "Bình", region: "a" },
    (m) => msgB.push(structuredClone(m)),
  ).player;

  const initCharmsMsg = msgA.find((m) => m.type === "charms");
  assert.ok(initCharmsMsg);
  assert.equal(initCharmsMsg.charms.length, 28);
  assert.ok(msgA.find((m) => m.type === "inventory"));

  // Pick a charm of tier 100
  const target = initCharmsMsg.charms.find((c) => c.tier === "100");
  assert.ok(target);

  // Too far away -> rejected, charm still in region
  room.pickup(a, target.id);
  assert.equal(a.inventory["100"], 0);
  assert.equal(room.regionCharms.get("a").charms.some((c) => c.id === target.id), true);

  // Move player next to charm and pick up
  a.x = target.x;
  a.z = target.z;
  room.pickup(a, target.id);
  assert.equal(a.inventory["100"], 1);
  assert.equal(room.regionCharms.get("a").charms.some((c) => c.id === target.id), false);

  // Second player cannot double-pick the same charm
  b.x = target.x;
  b.z = target.z;
  room.pickup(b, target.id);
  assert.equal(b.inventory["100"], 0);

  // Without boost, speed 17.5 triggers server correct
  now += 200;
  a.x = 0;
  a.z = 0;
  const beforeCorrect = msgA.filter((m) => m.type === "correct").length;
  room.state(a, {
    seq: 1,
    region: "a",
    x: 0,
    z: 3.4,
    y: 0,
    heading: 0,
    speed: 17.5,
    lean: 0,
  });
  assert.equal(msgA.filter((m) => m.type === "correct").length, beforeCorrect + 1);

  // Use +100% charm -> stack decrements, boostTier/boostMultiplier replicate, speed 17.5 accepted
  room.useCharm(a, "100");
  assert.equal(a.inventory["100"], 0);
  assert.equal(room.publicPlayer(a).boostTier, "100");
  assert.equal(room.publicPlayer(a).boostMultiplier, 2.0);
  const ack = msgA.filter((m) => m.type === "boost_ack").at(-1);
  assert.equal(ack.rejected, false);
  assert.equal(ack.boostMultiplier, 2.0);

  now += 200;
  room.state(a, {
    seq: 2,
    region: "a",
    x: 0,
    z: 3.4,
    y: 0,
    heading: 0,
    speed: 17.5,
    lean: 0,
  });
  assert.equal(msgA.filter((m) => m.type === "correct").length, beforeCorrect + 1);
  assert.equal(a.z, 3.4);

  // Empty tier use is rejected cleanly
  room.useCharm(a, "100");
  assert.equal(msgA.filter((m) => m.type === "boost_ack").at(-1).rejected, true);

  // Advancing past nextRefreshAt refreshes map charms
  const entry = room.regionCharms.get("a");
  const prevFirstId = entry.charms[0].id;
  now = entry.nextRefreshAt + 10;
  room.snapshot();
  const refreshedMsg = msgA.filter((m) => m.type === "charms" && m.refreshed).at(-1);
  assert.ok(refreshedMsg);
  assert.equal(refreshedMsg.charms.length, 28);
  assert.notEqual(refreshedMsg.charms[0].id, prevFirstId);
});

test("CityAudio exposes safe playCharmPickup and playSpeedBoost helpers", () => {
  const audio = new CityAudio();
  assert.equal(typeof audio.playCharmPickup, "function");
  assert.equal(typeof audio.playSpeedBoost, "function");
  assert.doesNotThrow(() => {
    audio.playCharmPickup(30);
    audio.playSpeedBoost(100);
  });
});
