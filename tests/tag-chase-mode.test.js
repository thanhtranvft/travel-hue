import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { WebSocket } from "ws";
import { Room } from "../server/Room.js";
import { createGameServer } from "../server/index.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { TAG_CHASE_CONFIG } from "../src/modules/game-modes/tag-chase/constants.js";
import { tagChaseMode } from "../src/modules/game-modes/tag-chase/index.js";

const region = {
  path: [
    [0, 0],
    [0, 140],
  ],
  radius: 15,
  extensions: [],
};

function createTestAreas() {
  return new Map(
    ["quoc-hoc", "quang-trung"].map((id) => [
      id,
      { spawn: { x: 0, z: 0, heading: 0 }, region },
    ]),
  );
}

function joinTagPlayer(room, name, extra = {}) {
  const messages = [];
  const res = room.join(
    {
      version: PROTOCOL_VERSION,
      name,
      region: "quoc-hoc",
      gameMode: "tag-chase",
      ...extra,
    },
    (msg) => messages.push(structuredClone(msg)),
  );
  return { ...res, messages };
}

function moveMsg(p, seq, x, z, speed = 4) {
  return {
    seq,
    region: p.region,
    x,
    y: 0.25,
    z,
    heading: 0,
    lean: 0,
    speed,
  };
}

test("tag-chase room stays waiting with 1 player, starts countdown and playing with 2+", () => {
  let now = 1000;
  const room = new Room(createTestAreas(), { now: () => now });
  const a = joinTagPlayer(room, "An");
  const modeEntry = room.modeStates.get("quoc-hoc::tag-chase");
  assert.ok(modeEntry);
  assert.equal(modeEntry.state.publicSummary().phase, "waiting");

  const b = joinTagPlayer(room, "Bình");
  assert.equal(modeEntry.state.publicSummary().phase, "countdown");

  // Advance past countdown (4000ms)
  now += TAG_CHASE_CONFIG.countdownMs + 100;
  room.snapshot();
  const playing = modeEntry.state.publicSummary();
  assert.equal(playing.phase, "playing");
  assert.ok(playing.hotspot);
  assert.equal(playing.partyBoxes.length, TAG_CHASE_CONFIG.partyBoxCount);

  const roles = [a.player, b.player].map((p) => p.tagStats.role);
  assert.equal(roles.filter((r) => r === "hunter").length, 1);
  assert.equal(roles.filter((r) => r === "runner").length, 1);
});

test("tag & swap awards points, bounces players, and swaps roles; Khiên Nón Lá blocks tags", () => {
  let now = 1000;
  const room = new Room(createTestAreas(), { now: () => now });
  const a = joinTagPlayer(room, "An");
  const b = joinTagPlayer(room, "Bình");
  now += TAG_CHASE_CONFIG.countdownMs + 3000;
  room.snapshot();

  const hunter = [a, b].find((x) => x.player.tagStats.role === "hunter");
  const runner = [a, b].find((x) => x.player.tagStats.role === "runner");
  assert.ok(hunter && runner);

  // Give runner a Khiên Nón Lá and activate it
  runner.player.partyInventory["non-la-shield"] = 1;
  room.modeAction(runner.player, {
    type: "mode_action",
    action: "use_party_item",
    itemId: "non-la-shield",
  });
  assert.ok(runner.player.shieldUntil > now);

  // Position both ready and immuneExpired
  Object.assign(hunter.player, {
    x: 0,
    z: 0,
    ready: true,
    activeAt: now,
    immuneUntil: 0,
  });
  Object.assign(runner.player, {
    x: 0,
    z: 1.2,
    speed: 4,
    ready: true,
    activeAt: now,
    immuneUntil: 0,
  });

  // Hunter hits shielded runner -> blocked!
  now += 100;
  room.state(hunter.player, moveMsg(hunter.player, 1, 0, 0.7, 5));
  assert.equal(runner.player.tagStats.role, "runner");
  assert.equal(runner.player.tagStats.score, TAG_CHASE_CONFIG.shieldBlockPoints);
  assert.ok(hunter.player.stunnedUntil > now);
  assert.ok(
    runner.messages.some(
      (m) => m.type === "mode_event" && m.event === "shield_block" && m.role === "defender",
    ),
  );

  // Clear immunity & stun -> unshielded tag succeeds and swaps roles
  now += 3500;
  hunter.player.immuneUntil = 0;
  hunter.player.stunnedUntil = 0;
  runner.player.immuneUntil = 0;
  Object.assign(hunter.player, { x: 0, z: 10, activeAt: now });
  Object.assign(runner.player, { x: 0, z: 11.2, speed: 4, activeAt: now });

  room.state(hunter.player, moveMsg(hunter.player, 2, 0, 10.8, 5));
  assert.equal(hunter.player.tagStats.role, "runner");
  assert.equal(runner.player.tagStats.role, "hunter");
  assert.equal(hunter.player.tagStats.score, TAG_CHASE_CONFIG.hunterTagPoints);
  assert.ok(
    hunter.messages.some(
      (m) => m.type === "mode_event" && m.event === "tag_swap" && m.youTagged,
    ),
  );
});

test("Party items (Gió Sông Hương & Cà Phê Muối), Close-Call combo, and Co-op Fireworks work server-side", () => {
  let now = 1000;
  const room = new Room(createTestAreas(), { now: () => now });
  const a = joinTagPlayer(room, "An");
  const b = joinTagPlayer(room, "Bình");
  now += TAG_CHASE_CONFIG.countdownMs + 3000;
  room.snapshot();

  const state = room.modeStates.get("quoc-hoc::tag-chase").state;
  const hunter = [a, b].find((x) => x.player.tagStats.role === "hunter");
  const runner = [a, b].find((x) => x.player.tagStats.role === "runner");

  // 1. Party Box pickup
  const box = state.publicSummary().partyBoxes[0];
  Object.assign(runner.player, { x: box.x, z: box.z, ready: true, activeAt: now });
  room.modeAction(runner.player, {
    type: "mode_action",
    action: "party_pickup",
    boxId: box.id,
  });
  const totalItems = Object.values(runner.player.partyInventory).reduce((s, v) => s + v, 0);
  assert.equal(totalItems, 1);

  // 2. Perfume Wind slows nearby unshielded opponent
  runner.player.partyInventory["perfume-wind"] = 1;
  Object.assign(hunter.player, { x: box.x, z: box.z + 4, ready: true, activeAt: now });
  room.modeAction(runner.player, {
    type: "mode_action",
    action: "use_party_item",
    itemId: "perfume-wind",
  });
  assert.ok(hunter.player.slowedUntil > now);

  // 3. Salt Coffee clears stun/slow and boosts speed
  hunter.player.stunnedUntil = now + 1000;
  hunter.player.partyInventory["salt-coffee"] = 1;
  room.modeAction(hunter.player, {
    type: "mode_action",
    action: "use_party_item",
    itemId: "salt-coffee",
  });
  assert.equal(hunter.player.stunnedUntil, 0);
  assert.equal(hunter.player.slowedUntil, 0);
  assert.ok(state.speedMultiplierFor(hunter.player, now) > TAG_CHASE_CONFIG.hunterSpeedMultiplier);

  // 4. Close-call combo: enter < 5.5m then escape > 10.5m
  now += 2500;
  hunter.player.coffeeBoostUntil = 0;
  hunter.player.stunnedUntil = 0;
  Object.assign(hunter.player, { x: 0, z: 20, ready: true });
  Object.assign(runner.player, { x: 0, z: 24, ready: true });
  room.snapshot(); // enters watch
  now += 500;
  Object.assign(runner.player, { x: 0, z: 36 });
  room.snapshot(); // escapes
  assert.equal(runner.player.tagStats.closeCalls, 1);
  assert.ok(
    runner.messages.some(
      (m) => m.type === "mode_event" && m.event === "close_call",
    ),
  );

  // 5. Co-op trigger at <= 85s remaining and completion
  now += TAG_CHASE_CONFIG.roundDurationMs - TAG_CHASE_CONFIG.coopTriggerRemainingMs;
  room.snapshot();
  const coopSummary = state.publicSummary();
  assert.equal(coopSummary.coop.active, true);
  assert.equal(coopSummary.coop.items.length, TAG_CHASE_CONFIG.coopTargetCount);

  for (const item of [...coopSummary.coop.items]) {
    Object.assign(runner.player, { x: item.x, z: item.z });
    room.modeAction(runner.player, {
      type: "mode_action",
      action: "coop_pickup",
      itemId: item.id,
    });
  }
  assert.equal(state.publicSummary().coop.active, false);
  assert.ok(
    a.messages.some(
      (m) => m.type === "mode_event" && m.event === "coop_end" && m.success === true,
    ),
  );

  // 6. Emote broadcast & room isolation from free-roam
  const freeRoamMessages = [];
  const freeRoam = room.join(
    {
      version: PROTOCOL_VERSION,
      name: "Khách",
      region: "quoc-hoc",
      gameMode: "free-roam",
    },
    (msg) => freeRoamMessages.push(msg),
  );
  assert.ok(freeRoam.player);
  room.modeAction(runner.player, {
    type: "mode_action",
    action: "emote",
    emoteId: "coffee",
  });
  assert.ok(
    a.messages.some((m) => m.type === "mode_event" && m.event === "emote" && m.emoteId === "coffee"),
  );
  assert.equal(
    freeRoamMessages.some((m) => m.type === "mode_event"),
    false,
  );
});

test("tagChaseMode client session runs safely without DOM and computes speedMultiplier", () => {
  const session = tagChaseMode.createClientSession({
    bike: { position: { x: 0, y: 0, z: 0 } },
    sessionActive: true,
    stun: 0,
  });
  assert.equal(session.speedMultiplier, 1);
  session.onSnapshot(
    {
      players: [
        { id: "me", connected: true, ready: true, modeData: { role: "hunter", score: 100 } },
      ],
    },
    "me",
  );
  assert.equal(session.speedMultiplier, TAG_CHASE_CONFIG.hunterSpeedMultiplier);
  session.onServerEvent({ event: "wind_slowed", durationMs: 2000, byName: "Bình" });
  assert.ok(session.speedMultiplier < 1);
  session.onServerEvent({ event: "coffee_boost", durationMs: 2000 });
  assert.ok(session.speedMultiplier > TAG_CHASE_CONFIG.hunterSpeedMultiplier);
  session.dispose();
});

function nextMsg(ws, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off("message", onMessage);
      reject(new Error("Timeout waiting for WebSocket message"));
    }, 5000);
    function onMessage(raw) {
      const msg = JSON.parse(raw);
      if (predicate(msg)) {
        clearTimeout(timer);
        ws.off("message", onMessage);
        resolve(msg);
      }
    }
    ws.on("message", onMessage);
  });
}

test("real WebSocket: 2 clients join tag-chase and exchange emote mode_action", async () => {
  const app = await createGameServer();
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const url = `ws://127.0.0.1:${app.server.address().port}/online`;
  const ws1 = new WebSocket(url);
  const ws2 = new WebSocket(url);
  try {
    await Promise.all([once(ws1, "open"), once(ws2, "open")]);
    const w1 = nextMsg(ws1, (m) => m.type === "welcome");
    const w2 = nextMsg(ws2, (m) => m.type === "welcome");
    ws1.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "Săn 1",
        region: "quoc-hoc",
        gameMode: "tag-chase",
      }),
    );
    ws2.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "Chạy 2",
        region: "quang-trung",
      }),
    );
    const welcome1 = await w1;
    await w2;
    assert.equal(welcome1.player.gameMode, "tag-chase");

    const ws3 = new WebSocket(url);
    await once(ws3, "open");
    const emoteReceived = nextMsg(
      ws1,
      (m) => m.type === "mode_event" && m.event === "emote" && m.emoteId === "wait",
    );
    const w3 = nextMsg(ws3, (m) => m.type === "welcome");
    ws3.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "Chạy 3",
        region: "quoc-hoc",
        gameMode: "tag-chase",
      }),
    );
    await w3;
    ws3.send(
      JSON.stringify({
        type: "mode_action",
        action: "emote",
        emoteId: "wait",
      }),
    );
    const emoteMsg = await emoteReceived;
    assert.equal(emoteMsg.text, "Đợi tui với!");
    ws3.close();
  } finally {
    ws1.close();
    ws2.close();
    app.close();
  }
});
