import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "../server/Room.js";
import { createGameServer } from "../server/index.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { TAG_CHASE_CONFIG as C } from "../src/modules/game-modes/tag-chase/constants.js";

function fixture(count = 2) {
  let now = 1000;
  const region = {
    path: [
      [490, -463.3],
      [550, -463.3],
      [677.1, -608.6],
    ],
    radius: 20,
    extensions: [],
  };
  const room = new Room(
    new Map([
      ["quoc-hoc", { region, spawn: { x: 490, z: -463.3, heading: 0 } }],
    ]),
    { now: () => now },
  );
  const players = Array.from(
    { length: count },
    (_, i) =>
      room.join(
        {
          version: PROTOCOL_VERSION,
          name: `Bạn ${i}`,
          region: "quoc-hoc",
          gameMode: "tag-chase",
        },
        () => {},
      ).player,
  );
  players.forEach((p) => Object.assign(p, { ready: true, x: 490, z: -463.3 }));
  const mode = room.modeStates.get("quoc-hoc::tag-chase").state;
  const advance = (ms) => {
    now += ms;
    room.snapshot();
  };
  advance(C.countdownMs);
  return { room, players, mode, advance };
}

test("exploration awards distinct visits once, never idle, and does not swap roles", () => {
  const { players, mode, advance, room } = fixture();
  const a = players[0],
    b = players[1];
  assert.equal(mode.publicSummary().stage, "exploration");
  for (let i = 0; i < 10; i++) advance(500);
  assert.equal(a.tagStats.score, 0);
  const h = mode.publicSummary().hotspot;
  Object.assign(a, { x: h.x, z: h.z });
  advance(200);
  assert.equal(a.tagStats.visited.size, 1);
  assert.equal(a.tagStats.score, C.visitPoints);
  advance(500);
  assert.equal(a.tagStats.score, C.visitPoints);
  a.x = 490;
  advance(200);
  a.x = h.x;
  advance(200);
  assert.equal(a.tagStats.score, C.visitPoints);
  const roles = players.map((p) => p.tagStats.role);
  mode.onCollision(a, b, room, 10000, { x: a.x, z: a.z });
  assert.deepEqual(
    players.map((p) => p.tagStats.role),
    roles,
  );
  assert.equal(
    mode.speedMultiplierFor(players.find((p) => p.tagStats.role === "hunter")),
    1,
  );
});

test("short chase then scalable cooperation; remote pickups and idle rewards rejected", () => {
  for (const count of [2, 10]) {
    const { players, mode, advance, room } = fixture(count);
    advance(C.explorationDurationMs);
    assert.equal(mode.publicSummary().stage, "chase");
    for (let i = 0; i < 12; i++) advance(500);
    assert.ok(players.every((p) => p.tagStats.score === 0));
    advance(C.chaseDurationMs - 6000);
    const summary = mode.publicSummary();
    assert.equal(summary.stage, "cooperation");
    assert.ok(
      summary.coop.target <=
        Math.min(
          C.coopMaxItems,
          Math.max(C.coopMinItems, count * C.coopItemsPerPlayer),
        ),
    );
    assert.ok(summary.coop.target >= C.coopMinItems);
    if (count === 10) assert.ok(summary.coop.target > C.coopMinItems);
    const target = summary.hotspot;
    assert.ok(
      summary.coop.items.every(
        (p) => Math.hypot(p.x - target.x, p.z - target.z) <= C.coopRadius,
      ),
    );
    const a = players[0];
    const first = summary.coop.items[0];
    Object.assign(a, { x: first.x + 200, z: first.z });
    room.modeAction(a, { action: "coop_pickup", itemId: first.id });
    assert.equal(mode.publicSummary().coop.collected, 0);
    for (const item of [...summary.coop.items]) {
      Object.assign(a, { x: item.x, z: item.z });
      room.modeAction(a, { action: "coop_pickup", itemId: item.id });
    }
    assert.equal(a.tagStats.coopContributions, summary.coop.target);
    assert.equal(
      a.tagStats.score,
      summary.coop.target * C.coopPickupPoints + C.coopRewardPoints,
    );
    assert.equal(
      players[1].tagStats.score,
      0,
      "idle spectator gets no cooperative reward",
    );
    assert.equal(mode.publicSummary().coop.active, false);
  }
});

test("real OSM maps provide road-valid landmark rendezvous and cooperative points", async () => {
  const app = await createGameServer();
  try {
    for (const region of ["quoc-hoc", "quang-trung"]) {
      const a = app.room.join(
        {
          version: PROTOCOL_VERSION,
          name: "Một",
          region,
          gameMode: "tag-chase",
        },
        () => {},
      ).player;
      app.room.join(
        {
          version: PROTOCOL_VERSION,
          name: "Hai",
          region,
          gameMode: "tag-chase",
        },
        () => {},
      );
      const mode = app.room.modeStates.get(`${region}::tag-chase`).state;
      let now = app.room.now() + C.countdownMs + 1;
      mode.tick(null, null, now);
      const h = mode.publicSummary().hotspot;
      assert.ok(h, `${region} has a real landmark approach`);
      const sampler = app.room.createRoadSampler(region);
      assert.ok(sampler.canPlace(h.x, h.z));
      assert.ok(
        Math.hypot(a.x - h.x, a.z - h.z) < 350,
        "initial rendezvous is near spawn",
      );
      mode.tick(null, null, (now += C.explorationDurationMs));
      mode.tick(null, null, (now += C.chaseDurationMs));
      const coop = mode.publicSummary().coop;
      assert.ok(coop.active);
      assert.equal(coop.target, C.coopMinItems);
      assert.ok(coop.items.every((p) => sampler.canPlace(p.x, p.z)));
    }
  } finally {
    app.close();
  }
});
