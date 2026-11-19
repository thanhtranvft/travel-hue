import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { WebSocket } from "ws";
import { Room } from "../server/Room.js";
import { createGameServer } from "../server/index.js";
import {
  cleanPlayerName,
  PROTOCOL_VERSION,
} from "../src/core/network/protocol.js";
const region = {
  path: [
    [0, 0],
    [0, 100],
  ],
  radius: 10,
  extensions: [],
};
const areas = new Map(
  ["a", "b"].map((id) => [id, { spawn: { x: 0, z: 0, heading: 0 }, region }]),
);
const join = (room, name = "Cún", extra = {}) => {
  const messages = [];
  const result = room.join(
    { version: PROTOCOL_VERSION, name, region: "a", ...extra },
    (m) => messages.push(structuredClone(m)),
  );
  return { ...result, messages };
};
const move = (p, seq, x, z, speed = 3) => ({
  seq,
  region: p.region,
  x,
  z,
  y: 0,
  heading: 0,
  lean: 0,
  speed,
});

test("name is plain bounded Unicode text; room counts reserved slots and expires them", () => {
  assert.equal(cleanPlayerName("  <Cún>\n con  "), "Cún con");
  assert.equal(Array.from(cleanPlayerName("😀".repeat(30))).length, 18);
  let now = 0;
  const room = new Room(areas, { now: () => now, reconnectMs: 15000 });
  const players = Array.from({ length: 10 }, () => join(room).player);
  assert.equal(new Set(players.map((p) => p.color)).size, 10);
  assert.equal(join(room).error, "FULL");
  room.disconnect(players[0]);
  assert.equal(join(room).error, "FULL");
  const resumed = join(room, "Cún nối lại", { token: players[0].token });
  assert.equal(resumed.player.id, players[0].id);
  assert.equal(room.players.size, 10);
  assert.equal(
    join(room, "duplicate", { token: players[0].token }).error,
    "SESSION",
  );
  room.disconnect(players[0]);
  now = 15001;
  room.expire();
  assert.equal(room.players.size, 9);
  assert.ok(join(room).player);
  room.disconnect(players[1], true);
  assert.equal(room.players.size, 9);
});
test("server rejects disabled areas, invalid poses and impossible movement", () => {
  let now = 0;
  const room = new Room(areas, { now: () => now });
  assert.equal(join(room, "Cún", { region: "disabled" }).error, "AREA");
  const { player: p, messages } = join(room);
  room.state(p, move(p, 0, 0, 500));
  assert.equal(p.z, 0);
  assert.equal(messages.at(-1).type, "correct");
  now = 100;
  room.state(p, move(p, 1, 0, 0.5));
  assert.equal(p.z, 0.5);
  room.state(p, move(p, 2, NaN, 1));
  assert.equal(p.z, 0.5);
  room.state(p, move(p, 3, 30, 0.5));
  assert.equal(p.x, 0);
  room.region(p, "disabled");
  assert.equal(p.region, "a");
  room.region(p, "b");
  assert.equal(p.region, "b");
  assert.equal(p.ready, false);
});
test("one server collision stops both players, has cooldown, and never crosses regions", () => {
  let now = 0;
  const room = new Room(areas, { now: () => now });
  const a = join(room, "A"),
    b = join(room, "B");
  Object.assign(a.player, {
    x: 0,
    z: 0,
    ready: true,
    activeAt: 3000,
    immuneUntil: 0,
  });
  Object.assign(b.player, {
    x: 0,
    z: 1.3,
    speed: 3,
    ready: true,
    activeAt: 3000,
    immuneUntil: 0,
  });
  now = 3000;
  room.state(a.player, move(a.player, 0, 0, 0.5));
  const collision = a.messages.find((m) => m.type === "collision");
  assert.ok(collision);
  assert.equal(
    b.messages.find((m) => m.type === "collision").eventId,
    collision.eventId,
  );
  assert.equal(a.player.speed, 0);
  assert.equal(b.player.speed, 0);
  room.state(a.player, move(a.player, 1, 0, 0.6));
  assert.equal(a.player.z, 0);
  assert.equal(a.messages.filter((m) => m.type === "collision").length, 1);
  now = 7000;
  Object.assign(b.player, { region: "b", immuneUntil: 0, activeAt: now });
  room.state(a.player, move(a.player, 2, 0, 0.5));
  assert.equal(a.messages.filter((m) => m.type === "collision").length, 1);
});
test('background rider stays visible and collidable; only region loading hides it', () => {
  let now = 0;
  const room = new Room(areas, { now: () => now });
  const a = join(room, 'Trước'), b = join(room, 'Sau');
  Object.assign(a.player, { x: 0, z: 0, ready: true, activeAt: 0, immuneUntil: 0 });
  Object.assign(b.player, { x: 0, z: 1.3, speed: 3, ready: true, activeAt: 0, immuneUntil: 0 });
  room.pause(b.player, 'background');
  assert.equal(b.player.ready, true);
  assert.equal(b.player.speed, 0);
  assert.equal(room.publicPlayer(b.player).paused, true);
  now = 4000;
  room.state(a.player, move(a.player, 0, 0, .5));
  assert.ok(a.messages.some(m => m.type === 'collision'));
  assert.equal(b.player.ready, true);
  now = 8000;
  room.state(b.player, move(b.player, 0, 0, 1.3, 0));
  assert.equal(b.player.paused, false);
  assert.equal(b.player.ready, true);
  room.pause(b.player, 'region');
  assert.equal(b.player.ready, false);
});

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
test("real WebSocket: 10 joins, client 11 rejected, leaving frees slot, resume works", async () => {
  const app = await createGameServer();
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const url = `ws://127.0.0.1:${app.server.address().port}/online`,
    sockets = [];
  const connect = async (name, token) => {
    const ws = new WebSocket(url);
    sockets.push(ws);
    await once(ws, "open");
    const result = nextMessage(ws, "welcome");
    ws.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name,
        region: "quoc-hoc",
        token,
      }),
    );
    return { ws, welcome: await result };
  };
  try {
    const entries = [];
    for (let i = 0; i < 10; i++) entries.push(await connect(`Cún ${i}`));
    assert.equal(app.room.players.size, 10);
    const extra = new WebSocket(url);
    sockets.push(extra);
    await once(extra, "open");
    const rejected = nextMessage(extra, "error");
    extra.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "11",
        region: "quoc-hoc",
      }),
    );
    assert.equal((await rejected).code, "FULL");
    const first = entries[0];
    const closed = once(first.ws, "close");
    first.ws.close(1000);
    await closed;
    await new Promise((r) => setTimeout(r, 30));
    assert.equal(app.room.players.size, 9);
    const replacement = await connect("Người mới");
    assert.ok(replacement.welcome.id);
    const second = entries[1];
    const lost = once(second.ws, "close");
    second.ws.terminate();
    await lost;
    await new Promise((r) => setTimeout(r, 30));
    const resumed = await connect("Cún nối lại", second.welcome.token);
    assert.equal(resumed.welcome.id, second.welcome.id);
    assert.equal(app.room.players.size, 10);
  } finally {
    for (const ws of sockets) ws.terminate();
    await app.close();
  }
});
test("WebSocket accepts proxied X-Forwarded-Host and configured allowedOrigins, rejects foreign origin", async () => {
  const app = await createGameServer();
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const url = `ws://127.0.0.1:${app.server.address().port}/online`;
  try {
    const proxied = new WebSocket(url, {
      headers: {
        host: "localhost:3000",
        origin: "https://preview.example.run.app",
        "x-forwarded-host": "preview.example.run.app",
      },
    });
    await once(proxied, "open");
    const welcome = nextMessage(proxied, "welcome");
    proxied.send(
      JSON.stringify({
        type: "join",
        version: PROTOCOL_VERSION,
        name: "ProxyUser",
        region: "quoc-hoc",
      }),
    );
    assert.ok((await welcome).id);
    proxied.close(1000);

    const rejected = new WebSocket(url, {
      headers: {
        host: "localhost:3000",
        origin: "https://evil.example",
        "x-forwarded-host": "preview.example.run.app",
      },
    });
    const [err] = await once(rejected, "error");
    assert.ok(err);
  } finally {
    await app.close();
  }
});
