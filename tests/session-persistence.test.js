import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { WebSocket } from "ws";
import {
  ACTIVE_SESSION_STORAGE_KEY,
  clearActiveSession,
  loadActiveSession,
  markSessionInactive,
  saveActiveSession,
} from "../src/core/network/sessionPersistence.js";
import { PROTOCOL_VERSION } from "../src/core/network/protocol.js";
import { Room } from "../server/Room.js";
import { createGameServer } from "../server/index.js";

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
  };
}

const region = {
  path: [
    [0, 0],
    [0, 100],
  ],
  radius: 15,
  extensions: [],
};
const areas = new Map(
  ["a", "b"].map((id) => [id, { spawn: { x: 0, z: 0, heading: 0 }, region }]),
);

function nextMessage(ws, type) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.off("message", onMessage);
      reject(new Error(`Timeout ${type}`));
    }, 5000);
    function onMessage(data) {
      const m = JSON.parse(data);
      if (m.type === type) {
        clearTimeout(timer);
        ws.off("message", onMessage);
        resolve(m);
      }
    }
    ws.on("message", onMessage);
  });
}

test("sessionPersistence saves, restores, sanitizes expired boost, marks inactive, and clears", () => {
  const storage = createMemoryStorage();
  assert.equal(loadActiveSession(storage, 1000), null);

  saveActiveSession(
    {
      active: true,
      name: "  <Minh>  ",
      mode: "explore",
      activity: "speed-hunt",
      avatar: "cat",
      region: "quang-trung",
      transportMode: "bike",
      onlineToken: "tok-123",
      pose: { x: 1680, y: 0.25, z: -245, heading: 1.4 },
      inventory: { 10: 2, 20: 1, 30: 0, 100: 1 },
      activeBoost: {
        tier: "30",
        percent: 30,
        multiplier: 1.3,
        durationMs: 6000,
        expiresAt: 10000,
      },
    },
    storage,
    5000,
  );

  const restored = loadActiveSession(storage, 7000);
  assert.equal(restored.active, true);
  assert.equal(restored.name, "Minh");
  // When exploreEnabled is false in config, mode defaults safely to online
  assert.equal(restored.mode, "online");
  assert.equal(restored.activity, "speed-hunt");
  assert.equal(restored.avatar, "cat");
  assert.equal(restored.region, "quang-trung");
  assert.equal(restored.transportMode, "bike");
  assert.equal(restored.onlineToken, "tok-123");
  assert.deepEqual(restored.pose, { x: 1680, y: 0.25, z: -245, heading: 1.4 });
  assert.equal(restored.inventory["10"], 2);
  assert.equal(restored.inventory["100"], 1);
  assert.equal(restored.activeBoost.tier, "30");

  // Expired boost at t=12000 is automatically stripped on load
  const afterBoostExpired = loadActiveSession(storage, 12000);
  assert.equal(afterBoostExpired.activeBoost, null);

  // Returning to Home Screen marks session inactive & clears onlineToken, keeps preferences
  markSessionInactive(storage, 13000);
  const inactive = loadActiveSession(storage, 13000);
  assert.equal(inactive.active, false);
  assert.equal(inactive.onlineToken, null);
  assert.equal(inactive.region, "quang-trung");
  assert.equal(inactive.transportMode, "bike");

  // Logout clears everything
  clearActiveSession(storage);
  assert.equal(storage.getItem(ACTIVE_SESSION_STORAGE_KEY), null);
  assert.equal(loadActiveSession(storage, 14000), null);

  // Corrupt JSON does not throw
  storage.setItem(ACTIVE_SESSION_STORAGE_KEY, "{bad json");
  assert.equal(loadActiveSession(storage, 14000), null);
});

test("Room.join preserves position, inventory, active boost and reports summary on same-region reconnect", () => {
  let now = 1000;
  const room = new Room(areas, { now: () => now, reconnectMs: 60000 });
  const msgs1 = [];
  const res1 = room.join(
    { version: PROTOCOL_VERSION, name: "Lan", region: "a", avatar: "girl" },
    (m) => msgs1.push(structuredClone(m)),
  );
  const p = res1.player;
  p.x = 2.5;
  p.y = 0.3;
  p.z = 42;
  p.heading = 0.8;
  p.inventory["20"] = 3;
  room.useCharm(p, "20");

  const summaryBefore = room.summary();
  assert.equal(summaryBefore.players, 1);
  assert.equal(summaryBefore.connected, 1);
  assert.equal(summaryBefore.regions.a, 1);

  room.disconnect(p, false);
  now = 2500;

  const msgs2 = [];
  const res2 = room.join(
    {
      version: PROTOCOL_VERSION,
      name: "Lan",
      region: "a",
      avatar: "girl",
      token: p.token,
    },
    (m) => msgs2.push(structuredClone(m)),
  );
  assert.equal(res2.player.id, p.id);
  assert.equal(res2.player.x, 2.5);
  assert.equal(res2.player.z, 42);
  assert.equal(res2.player.heading, 0.8);
  assert.equal(msgs2.find((m) => m.type === "welcome").reconnected, true);
  assert.equal(msgs2.find((m) => m.type === "inventory").inventory["20"], 2);
  const boostAck = msgs2.find((m) => m.type === "boost_ack");
  assert.equal(boostAck.boostTier, "20");
  assert.ok(boostAck.remainingMs > 0);
});

test("real WebSocket: reload close (3001) keeps player pose and slot across reconnect, and /health exposes room summary", async () => {
  const app = await createGameServer();
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const port = app.server.address().port;
  const wsUrl = `ws://127.0.0.1:${port}/online`;
  const healthUrl = `http://127.0.0.1:${port}/health`;

  const ws1 = new WebSocket(wsUrl);
  try {
    await once(ws1, "open");
    const welcome1Promise = nextMessage(ws1, "welcome");
    ws1.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "Tùng",
        region: "quoc-hoc",
        avatar: "dog",
      }),
    );
    const welcome1 = await welcome1Promise;

    // Move slightly along Lê Lợi
    const startX = welcome1.player.x;
    const startZ = welcome1.player.z;
    ws1.send(
      JSON.stringify({
        type: "state",
        seq: 1,
        region: "quoc-hoc",
        x: startX + 0.6,
        y: welcome1.player.y || 0,
        z: startZ - 0.6,
        heading: 2.1,
        speed: 3.2,
        lean: 0,
        avatar: "dog",
        stance: "bike",
      }),
    );
    await new Promise((r) => setTimeout(r, 40));

    const healthRes = await fetch(healthUrl);
    const health = await healthRes.json();
    assert.equal(health.ok, true);
    assert.equal(health.players, 1);
    assert.equal(health.limit, 10);
    assert.equal(health.regions["quoc-hoc"], 1);

    // Simulate reload: pause + non-1000 close (3001)
    ws1.send(JSON.stringify({ type: "pause", reason: "background" }));
    const closed = once(ws1, "close");
    ws1.close(3001, "reload");
    await closed;
    await new Promise((r) => setTimeout(r, 40));

    assert.equal(app.room.players.size, 1);

    const ws2 = new WebSocket(wsUrl);
    await once(ws2, "open");
    const welcome2Promise = nextMessage(ws2, "welcome");
    ws2.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "Tùng",
        region: "quoc-hoc",
        avatar: "dog",
        token: welcome1.token,
      }),
    );
    const welcome2 = await welcome2Promise;
    assert.equal(welcome2.id, welcome1.id);
    assert.equal(welcome2.reconnected, true);
    assert.ok(Math.abs(welcome2.player.x - (startX + 0.6)) < 0.05);
    assert.ok(Math.abs(welcome2.player.z - (startZ - 0.6)) < 0.05);
    ws2.close(1000);
  } finally {
    ws1.terminate();
    await app.close();
  }
});
