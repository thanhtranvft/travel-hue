import { randomUUID } from "node:crypto";
import {
  cleanAvatarId,
  cleanCharmTier,
  cleanPlayerName,
  cleanStance,
  MAX_PLAYERS,
  PLAYER_COLORS,
  PROTOCOL_VERSION,
  sweptContact,
} from "../src/core/network/protocol.js";
import {
  CHARM_TIERS,
  emptyCharmInventory,
  generateRegionCharms,
  randomCharmRefreshMs,
} from "../src/core/world/speedCharms.js";
import { nearestPoint, inside } from "../src/core/shared/geography/geometry.js";
import { spacedSpawn } from './spawn.js';

// One room per process. Production must run one instance until a shared room store is added.
export class Room {
  constructor(areas, { now = () => Date.now(), reconnectMs = 15000 } = {}) {
    this.areas = areas;
    this.players = new Map();
    this.regionCharms = new Map();
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
    const avatar = cleanAvatarId(message.avatar);
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
        avatar,
        stance: "idle",
        color: PLAYER_COLORS.find((c) => !used.has(c)),
        region: message.region,
        inventory: emptyCharmInventory(),
        boostTier: null,
        boostMultiplier: 1,
        boostUntil: 0,
        boostGraceUntil: 0,
      };
      this.players.set(p.id, p);
      this.spawn(p, message.region);
    } else {
      p.name = name;
      p.avatar = avatar;
      p.inventory ||= emptyCharmInventory();
      // Client scene may have changed while disconnected. Re-enter at a safe spawn.
      this.spawn(p, message.region);
    }
    p.send = send;
    const charmEntry = this.ensureRegionCharms(message.region);
    this.send(p, {
      type: "welcome",
      id: p.id,
      token: p.token,
      player: this.publicPlayer(p),
      limit: MAX_PLAYERS,
    });
    this.send(p, {
      type: "charms",
      region: message.region,
      charms: charmEntry.charms,
      nextRefreshAt: charmEntry.nextRefreshAt,
      refreshed: false,
    });
    this.send(p, {
      type: "inventory",
      inventory: { ...p.inventory },
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
    const charmEntry = this.ensureRegionCharms(id);
    this.send(p, { type: "relocate", player: this.publicPlayer(p) });
    this.send(p, {
      type: "charms",
      region: id,
      charms: charmEntry.charms,
      nextRefreshAt: charmEntry.nextRefreshAt,
      refreshed: false,
    });
    this.snapshot();
  }
  ensureRegionCharms(regionId, forceRefresh = false) {
    const area = this.areas.get(regionId);
    if (!area) return { charms: [], nextRefreshAt: this.now() + 30000 };
    const existing = this.regionCharms.get(regionId);
    const now = this.now();
    if (existing && !forceRefresh) return existing;
    const seq = (existing?.seq || 0) + 1;
    const charms = generateRegionCharms(area.region, {
      idPrefix: `${regionId}-${seq}`,
      canPlace: (x, z) => this.contains(area.region, x, z),
      groundAt: () => 0.25,
    });
    const entry = {
      seq,
      charms,
      nextRefreshAt: now + randomCharmRefreshMs(),
    };
    this.regionCharms.set(regionId, entry);
    return entry;
  }
  publishRegionCharms(regionId, entry, refreshed = false) {
    const payload = {
      type: "charms",
      region: regionId,
      charms: entry.charms,
      nextRefreshAt: entry.nextRefreshAt,
      refreshed,
    };
    for (const player of this.players.values()) {
      if (player.send && player.region === regionId) {
        this.send(player, payload);
      }
    }
  }
  tickCharms() {
    const now = this.now();
    for (const [regionId, entry] of this.regionCharms.entries()) {
      if (now < entry.nextRefreshAt) continue;
      const hasPlayers = [...this.players.values()].some(
        (p) => p.send && p.region === regionId,
      );
      if (!hasPlayers) continue;
      const refreshedEntry = this.ensureRegionCharms(regionId, true);
      this.publishRegionCharms(regionId, refreshedEntry, true);
    }
  }
  pickup(p, charmId) {
    if (typeof charmId !== "string" || !charmId || charmId.length > 64) return;
    const entry = this.ensureRegionCharms(p.region);
    const idx = entry.charms.findIndex((c) => c.id === charmId);
    if (idx === -1) {
      return this.send(p, {
        type: "charms",
        region: p.region,
        charms: entry.charms,
        nextRefreshAt: entry.nextRefreshAt,
        refreshed: false,
      });
    }
    const charm = entry.charms[idx];
    if (Math.hypot(p.x - charm.x, p.z - charm.z) > 5.5) {
      return this.send(p, {
        type: "charms",
        region: p.region,
        charms: entry.charms,
        nextRefreshAt: entry.nextRefreshAt,
        refreshed: false,
      });
    }
    entry.charms.splice(idx, 1);
    p.inventory ||= emptyCharmInventory();
    p.inventory[charm.tier] = Math.min(99, (p.inventory[charm.tier] || 0) + 1);
    this.send(p, {
      type: "inventory",
      inventory: { ...p.inventory },
      picked: charm,
    });
    this.publishRegionCharms(p.region, entry, false);
  }
  useCharm(p, tierInput) {
    const tierId = cleanCharmTier(tierInput);
    p.inventory ||= emptyCharmInventory();
    if (!tierId || (p.inventory[tierId] || 0) <= 0) {
      return this.send(p, {
        type: "boost_ack",
        rejected: true,
        inventory: { ...p.inventory },
      });
    }
    const tier = CHARM_TIERS[tierId];
    const now = this.now();
    p.inventory[tierId] -= 1;
    if (p.boostTier === tier.id && p.boostUntil > now) {
      const remaining = Math.min(tier.durationMs * 2, p.boostUntil - now + tier.durationMs);
      p.boostUntil = now + remaining;
    } else {
      if ((p.boostMultiplier || 1) > tier.multiplier && now < (p.boostGraceUntil || 0)) {
        p.prevBoostMultiplier = p.boostMultiplier;
        p.prevBoostGraceUntil = now + 1200;
      }
      p.boostTier = tier.id;
      p.boostMultiplier = tier.multiplier;
      p.boostUntil = now + tier.durationMs;
    }
    p.boostGraceUntil = p.boostUntil + 1200;
    this.send(p, {
      type: "boost_ack",
      rejected: false,
      inventory: { ...p.inventory },
      boostTier: p.boostTier,
      boostMultiplier: p.boostMultiplier,
      remainingMs: Math.max(0, p.boostUntil - now),
    });
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
    const boostMult =
      now < (p.boostGraceUntil || 0) && Number.isFinite(p.boostMultiplier)
        ? Math.max(1, p.boostMultiplier)
        : 1;
    const prevMult =
      now < (p.prevBoostGraceUntil || 0) && Number.isFinite(p.prevBoostMultiplier)
        ? Math.max(1, p.prevBoostMultiplier)
        : 1;
    const activeMult = Math.max(boostMult, prevMult);
    const elapsed = Math.max(0, now - p.stamp) / 1000;
    p.credit = Math.min(2 * activeMult, p.credit + elapsed * 9.5 * activeMult);
    p.stamp = now;
    p.seq = m.seq;
    const distance = Math.hypot(m.x - p.x, m.z - p.z);
    if (
      now < p.stunnedUntil ||
      Math.abs(m.speed) > 9.1 * activeMult ||
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
      avatar: m.avatar ? cleanAvatarId(m.avatar) : cleanAvatarId(p.avatar),
      stance: cleanStance(m.stance, m.speed),
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
    const now = this.now();
    const boosted = now < (p.boostUntil || 0) && (p.boostMultiplier || 1) > 1;
    const {
      id,
      name,
      color,
      avatar,
      stance,
      region,
      x,
      y,
      z,
      heading,
      speed,
      lean,
      ready,
      paused,
    } = p;
    return {
      id,
      name,
      color,
      avatar: cleanAvatarId(avatar),
      stance: cleanStance(stance, speed),
      region,
      x,
      y,
      z,
      heading,
      speed,
      lean,
      ready,
      paused,
      boostTier: boosted ? p.boostTier : null,
      boostMultiplier: boosted ? p.boostMultiplier : 1,
      connected: !!p.send,
    };
  }
  snapshot() {
    this.expire();
    this.tickCharms();
    this.publish({
      type: "snapshot",
      time: this.now(),
      limit: MAX_PLAYERS,
      occupied: this.players.size,
      players: [...this.players.values()].map((p) => this.publicPlayer(p)),
    });
  }
}
