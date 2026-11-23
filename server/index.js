import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, WebSocket } from "ws";
import { Room } from "./Room.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css",
  ".json": "application/json",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
};
export async function attachOnlineServer(
  server,
  { now, reconnectMs, rejectUnknownUpgrade = false } = {},
) {
  const catalog = JSON.parse(
    await readFile(resolve(root, "src/data/app-config.json"), "utf8"),
  );
  const config = JSON.parse(
    await readFile(resolve(root, "src/data/online-config.json"), "utf8"),
  );
  const areas = new Map();
  for (const area of catalog.areas.items.filter(
    (a) => a.enabled !== false && a.disabled !== true,
  )) {
    if (!/^[a-z0-9-]+$/.test(area.id)) throw new Error("Invalid area id");
    const { region } = JSON.parse(
      await readFile(
        resolve(root, `src/modules/areas/${area.id}/model/osm.json`),
        "utf8",
      ),
    );
    areas.set(area.id, { ...area, region });
  }
  const room = new Room(areas, {
    now,
    reconnectMs: reconnectMs ?? config.reconnectSeconds * 1000,
  });
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 2048,
    perMessageDeflate: false,
  });
  server.on("upgrade", (req, socket, head) => {
    let pathname = "/";
    try {
      pathname = new URL(req.url, "http://local").pathname;
    } catch {
      if (rejectUnknownUpgrade) {
        socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
      }
      return;
    }
    if (pathname !== config.path) {
      if (rejectUnknownUpgrade) {
        socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      }
      return;
    }
    const origin = req.headers.origin;
    let validOrigin = true;
    try {
      if (origin) {
        const originHost = new URL(origin).host;
        const forwardedHost = String(req.headers["x-forwarded-host"] || "")
          .split(",")[0]
          .trim();
        validOrigin =
          originHost === req.headers.host ||
          (Boolean(forwardedHost) && originHost === forwardedHost) ||
          config.allowedOrigins?.includes(origin);
      }
    } catch {
      validOrigin = false;
    }
    if (!config.enabled || !validOrigin) {
      socket.end("HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n");
      return;
    }
    wss.handleUpgrade(req, socket, head, (ws) =>
      wss.emit("connection", ws, req),
    );
  });
  wss.on("connection", (ws) => {
    let player,
      windowAt = Date.now(),
      messages = 0;
    ws.alive = true;
    ws.on("pong", () => {
      ws.alive = true;
    });
    ws.on("error", () => {});
    const send = (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        if (ws.bufferedAmount > 128 * 1024) return ws.terminate();
        ws.send(JSON.stringify(message));
      }
    };
    const deadline = setTimeout(() => {
      if (!player) ws.close(4001, "Join timeout");
    }, 8000);
    ws.on("message", (data) => {
      if (Date.now() - windowAt > 1000) {
        windowAt = Date.now();
        messages = 0;
      }
      if (++messages > 60) return ws.close(4008, "Too many messages");
      let m;
      try {
        m = JSON.parse(data);
      } catch {
        return ws.close(4002, "Invalid JSON");
      }
      if (!m || typeof m !== "object") return ws.close(4002, "Invalid message");
      if (!player) {
        if (m.type !== "join") return;
        const result = room.join(m, send);
        if (result.error) {
          send({ type: "error", code: result.error, message: result.message });
          ws.close(4003, result.error);
          return;
        }
        player = result.player;
        clearTimeout(deadline);
      } else if (m.type === "state") room.state(player, m);
      else if (m.type === "pickup") room.pickup(player, m.charmId);
      else if (m.type === "use_charm") room.useCharm(player, m.tier);
      else if (m.type === "region") room.region(player, m.region);
      else if (m.type === "pause") {
        room.pause(player, m.reason);
      } else if (m.type === "leave") ws.close(1000, "Leaving");
    });
    ws.on("close", (code) => {
      clearTimeout(deadline);
      if (player) room.disconnect(player, code === 1000);
    });
  });
  const tick = setInterval(() => room.snapshot(), 50);
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) {
        ws.terminate();
        continue;
      }
      ws.alive = false;
      ws.ping();
    }
  }, 5000);
  return {
    room,
    wss,
    async close() {
      clearInterval(tick);
      clearInterval(heartbeat);
      for (const ws of wss.clients) ws.terminate();
      await new Promise((r) => wss.close(r));
    },
  };
}

export async function createGameServer({
  dist = resolve(root, "dist"),
  now,
  reconnectMs,
} = {}) {
  let online;
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(
        new URL(req.url, "http://local").pathname,
      );
      if (path === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ ok: true, players: online?.room.players.size ?? 0 }),
        );
        return;
      }
      if (!["GET", "HEAD"].includes(req.method)) {
        res.writeHead(405);
        res.end();
        return;
      }
      let file = resolve(dist, "." + (path === "/" ? "/index.html" : path));
      if (!file.startsWith(resolve(dist) + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let info;
      try {
        info = await stat(file);
      } catch {
        if (extname(path)) {
          res.writeHead(404);
          res.end();
          return;
        }
        file = resolve(dist, "index.html");
        info = await stat(file);
      }
      if (!info.isFile()) {
        res.writeHead(404);
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Content-Length": info.size,
        "Cache-Control":
          extname(file) === ".html" ? "no-cache" : "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      });
      if (req.method === "HEAD") res.end();
      else
        createReadStream(file)
          .on("error", () => res.destroy())
          .pipe(res);
    } catch {
      res.writeHead(404);
      res.end("Build frontend first: npm run build");
    }
  });
  online = await attachOnlineServer(server, {
    now,
    reconnectMs,
    rejectUnknownUpgrade: true,
  });
  return {
    server,
    room: online.room,
    async close() {
      await online.close();
      await new Promise((r) => server.close(r));
    },
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const app = await createGameServer();
  app.server.listen(Number(process.env.PORT) || 3000, "0.0.0.0", () =>
    console.log(
      `Hue game + online: http://localhost:${app.server.address().port}`,
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.on(signal, () => app.close().then(() => process.exit(0)));
}
