import { randomUUID } from "node:crypto";
import {
  cleanPlayerName,
  MAX_PLAYERS,
  PLAYER_COLORS,
  PROTOCOL_VERSION,
  sweptContact,
} from "../src/core/network/protocol.js";
import { nearestPoint, inside } from "../src/core/shared/geography/geometry.js";
import { spacedSpawn } from './spawn.js';

// One room per process. Production must run one instance until a shared room store is added.
export class Room {
  constructor(areas, { now = () => Date.now(), reconnectMs = 15000 } = {}) {
    this.areas = areas;
    this.players = new Map();
    this.now = now;
    this.reconnectMs = reconnectMs;
  }
  send(player, message) {
    player.send?.(message);
  }
  publish(message) {
    for (const p of this.players.values()) this.send(p, message);
  }
  expire() {
    for (const [id, p] of this.players)
      if (!p.send && p.expires <= this.now()) this.players.delete(id);
  }
  join(message, send) {
    this.expire();
    if (message.version !== PROTOCOL_VERSION)
      return {
        error: "VERSION",
        message: "Bản game đã đổi. Hãy tải lại trang.",
      };
    const name = cleanPlayerName(message.name);
    if (!name)
      return { error: "NAME", message: "Hãy nhập tên từ 1 đến 18 ký tự." };
    if (!this.areas.has(message.region))
      return { error: "AREA", message: "Khu vực này chưa mở." };
    let p =
      message.token &&
      [...this.players.values()].find((p) => p.token === message.token);
    if (p?.send)
      return {
        error: "SESSION",
        message: "Phiên này đang kết nối ở nơi khác.",
      };
    if (!p) {
      if (this.players.size >= MAX_PLAYERS)
        return {
          error: "FULL",
          message: "Phòng đã đủ 10 người. Hãy thử lại hoặc chọn Khám phá.",
        };
      const used = new Set([...this.players.values()].map((p) => p.color));
      p = {
        id: randomUUID(),
        token: randomUUID(),
        name,
        color: PLAYER_COLORS.find((c) => !used.has(c)),
        region: message.region,
      };
      this.players.set(p.id, p);
      this.spawn(p, message.region);
    } else {
      p.name = name;
      // Client scene may have changed while disconnected. Re-enter at a safe spawn.
      this.spawn(p, message.region);
    }
    p.send = send;
    this.send(p, {
      type: "welcome",
      id: p.id,
      token: p.token,
      player: this.publicPlayer(p),
      limit: MAX_PLAYERS,
    });
    this.snapshot();
    return { player: p };
  }
  contains(region, x, z) {
    return (
      nearestPoint(
        { x, z },
        region.path.map(([x, z]) => ({ x, z })),
      ).distance <= region.radius ||
      (region.extensions || []).some((r) => inside({ x, z }, r))
    );
  }
  spawn(p, id) {
    const area = this.areas.get(id),
      { spawn } = area;
    // Try spaced positions on the route; no user-provided spawn coordinates.
    let x = spawn.x,
      z = spawn.z,
      heading = spawn.heading;
    for (let i = 0; i < MAX_PLAYERS; i++) {
      const candidate = area.spawnSlots?.[i] || spacedSpawn(area, i * 8);
      if (
        this.contains(area.region, candidate.x, candidate.z) &&
        ![...this.players.values()].some(
          (o) =>
            o !== p &&
            o.region === id &&
            Math.hypot(o.x - candidate.x, o.z - candidate.z) < 2,
        )
      ) {
        x = candidate.x;
        z = candidate.z;
        heading = candidate.heading;
        break;
      }
    }
    Object.assign(p, {
      region: id,
      x,
      z,
      y: 0,
      heading,
      speed: 0,
      lean: 0,
      ready: false,
      paused: false,
      seq: -1,
      stamp: this.now(),
      credit: 1.2,
      stunnedUntil: 0,
      immuneUntil: this.now() + 2000,
    });
  }
  region(p, id) {
    if (!this.areas.has(id))
      return this.send(p, {
        type: "error",
        code: "AREA",
        message: "Khu vực này chưa mở.",
      });
    this.spawn(p, id);
    this.send(p, { type: "relocate", player: this.publicPlayer(p) });
    this.snapshot();
  }
  state(p, m) {
    if (m.region !== p.region || !Number.isSafeInteger(m.seq) || m.seq <= p.seq)
      return;
    if (
      !["x", "y", "z", "heading", "speed", "lean"].every((k) =>
        Number.isFinite(m[k]),
      )
    )
      return;
    const now = this.now();
    const elapsed = Math.max(0, now - p.stamp) / 1000;
    p.credit = Math.min(2, p.credit + elapsed * 9.5);
    p.stamp = now;
    p.seq = m.seq;
    const distance = Math.hypot(m.x - p.x, m.z - p.z);
    if (
      now < p.stunnedUntil ||
      Math.abs(m.speed) > 9.1 ||
      m.y < -5 ||
      m.y > 40 ||
      Math.abs(m.lean) > 0.5 ||
      distance > p.credit ||
      !this.contains(this.areas.get(p.region).region, m.x, m.z)
    ) {
      return this.send(p, { type: "correct", player: this.publicPlayer(p) });
    }
    const old = { x: p.x, z: p.z };
    p.credit = Math.max(0, p.credit - distance);
    Object.assign(p, {
      x: m.x,
      y: m.y,
      z: m.z,
      heading: Math.atan2(Math.sin(m.heading), Math.cos(m.heading)),
      speed: m.speed,
      lean: m.lean,
      ready: true,
      paused: false,
      activeAt: now,
    });
    if (now < p.immuneUntil) return;
    for (const other of this.players.values()) {
      if (
        other === p ||
        !other.send ||
        !other.ready ||
        other.region !== p.region ||
        now < other.immuneUntil ||
        (!other.paused && now - other.activeAt > 2000)
      )
        continue;
      if (
        Math.abs(p.speed) + Math.abs(other.speed) < 0.5 ||
        !sweptContact(old, p, other)
      )
        continue;
      p.x = old.x;
      p.z = old.z;
      for (const rider of [p, other]) {
        rider.speed = 0;
        rider.lean = 0;
        rider.stunnedUntil = now + 700;
        rider.immuneUntil = now + 3000;
      }
      const event = {
        type: "collision",
        eventId: randomUUID(),
        players: [this.publicPlayer(p), this.publicPlayer(other)],
      };
      this.publish(event);
      break;
    }
  }
  pause(p, reason = 'background') {
    // Background tabs stop sending motion, but their loaded avatar stays present.
    // Only unloading a region makes its last pose unavailable for rendering.
    p.paused = true;
    p.speed = 0;
    p.lean = 0;
    if (reason === 'region') p.ready = false;
    this.snapshot();
  }
  disconnect(p, intentional = false) {
    if (intentional) this.players.delete(p.id);
    else {
      p.send = null;
      p.ready = false;
      p.expires = this.now() + this.reconnectMs;
    }
    this.snapshot();
  }
  publicPlayer(p) {
    const { id, name, color, region, x, y, z, heading, speed, lean, ready, paused } = p;
    return {
      id,
      name,
      color,
      region,
      x,
      y,
      z,
      heading,
      speed,
      lean,
      ready,
      paused,
      connected: !!p.send,
    };
  }
  snapshot() {
    this.expire();
    this.publish({
      type: "snapshot",
      time: this.now(),
      limit: MAX_PLAYERS,
      occupied: this.players.size,
      players: [...this.players.values()].map((p) => this.publicPlayer(p)),
    });
  }
}
