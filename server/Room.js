import { randomUUID } from "node:crypto";
import {
  cleanAvatarId,
  cleanBoatIndex,
  cleanCharmTier,
  cleanPlayerName,
  cleanStance,
  MAX_PLAYERS,
  PEDAL_BOAT_COUNT,
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
import { roadWidth } from "../src/core/world/roadProfile.js";
import {
  BOARDWALK_Y,
  TRUONG_TIEN_ID,
  roadSurfaceHeight,
} from "../src/core/world/roadSurface.js";
import {
  TRUONG_TIEN_ROAD_HALF,
  TRUONG_TIEN_WALK_INNER,
  TRUONG_TIEN_WALK_OUTER,
  truongTienDeckQuery,
} from "../src/modules/areas/truong-tien/view/BridgeView.js";
import {
  lateralBridgeHeight,
  stitchMainBoardwalk,
} from "../src/modules/areas/south-bank/view/BoardwalkView.js";
import { spacedSpawn } from './spawn.js';

import {
  cleanGameModeId,
  DEFAULT_GAME_MODE_ID,
  getGameMode,
  roomKeyFor,
} from "../src/modules/game-modes/registry.js";

import onlineConfig from "../src/data/online-config.json" with { type: "json" };

const BOARDWALK_WAY_IDS = new Set([683633953, 1167513733, 1167513732]);
const LATERAL_BOARDWALK_IDS = new Set([1473289702, 1493443035, 1493443034, 1493443036]);

// One server room manager per process. Each (region, gameMode) room allows up to 10 players independently.
export class Room {
  constructor(
    areas,
    {
      now = () => Date.now(),
      reconnectMs = 15000,
      maxPlayersPerRegion = onlineConfig.maxPlayersPerRegion || MAX_PLAYERS,
      maxTotalPlayers = onlineConfig.maxTotalPlayers || 80,
    } = {},
  ) {
    this.areas = areas;
    this.players = new Map();
    this.regionCharms = new Map();
    this.modeStates = new Map();
    this.now = now;
    this.reconnectMs = reconnectMs;
    this.maxPlayersPerRegion = maxPlayersPerRegion;
    this.maxTotalPlayers = maxTotalPlayers;
  }
  roomKeyForPlayer(p) {
    return roomKeyFor(p?.region, p?.gameMode || DEFAULT_GAME_MODE_ID);
  }
  roomPlayers(roomKey, exclude = null) {
    return [...this.players.values()].filter(
      (p) => p !== exclude && this.roomKeyForPlayer(p) === roomKey,
    );
  }
  roomCount(roomKey, exclude = null) {
    let count = 0;
    for (const p of this.players.values()) {
      if (p !== exclude && this.roomKeyForPlayer(p) === roomKey) count++;
    }
    return count;
  }
  regionPlayers(regionId, exclude = null) {
    return [...this.players.values()].filter(
      (p) => p !== exclude && p.region === regionId,
    );
  }
  regionCount(regionId, exclude = null) {
    let count = 0;
    for (const p of this.players.values()) {
      if (p !== exclude && p.region === regionId) count++;
    }
    return count;
  }
  pickRoomColor(roomKey, exclude = null) {
    const used = new Set(
      this.roomPlayers(roomKey, exclude).map((p) => p.color),
    );
    return PLAYER_COLORS.find((c) => !used.has(c)) || PLAYER_COLORS[0];
  }
  ensureModeState(roomKey, gameMode = DEFAULT_GAME_MODE_ID) {
    let entry = this.modeStates.get(roomKey);
    if (!entry) {
      const def = getGameMode(gameMode);
      entry = {
        modeId: def.id,
        state: def.createServerRoomState?.(this, roomKey) || {},
      };
      this.modeStates.set(roomKey, entry);
    }
    return entry.state;
  }
  send(player, message) {
    player.send?.(message);
  }
  publish(message) {
    for (const p of this.players.values()) this.send(p, message);
  }
  publishToRoom(roomKey, message) {
    for (const p of this.players.values()) {
      if (p.send && this.roomKeyForPlayer(p) === roomKey) {
        this.send(p, message);
      }
    }
  }
  expire() {
    for (const [id, p] of this.players) {
      if (!p.send && p.expires <= this.now()) {
        this.modeStates.get(this.roomKeyForPlayer(p))?.state?.onLeave?.(p, this);
        this.players.delete(id);
      }
    }
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
    const gameMode = cleanGameModeId(message.gameMode, message.region);
    const targetRoomKey = roomKeyFor(message.region, gameMode);
    let p =
      message.token &&
      [...this.players.values()].find((p) => p.token === message.token);
    if (p?.send)
      return {
        error: "SESSION",
        message: "Phiên này đang kết nối ở nơi khác.",
      };
    if (!p) {
      if (this.players.size >= this.maxTotalPlayers) {
        return {
          error: "FULL",
          message:
            "Máy chủ hiện đang đủ tải. Vui lòng thử lại sau ít phút.",
        };
      }
      if (this.roomCount(targetRoomKey) >= this.maxPlayersPerRegion)
        return {
          error: "FULL",
          message:
            "Phòng chơi này đã đủ 10 người. Hãy chọn khu vực hoặc chế độ khác.",
        };
      p = {
        id: randomUUID(),
        token: randomUUID(),
        name,
        avatar,
        stance: "idle",
        boatIndex: -1,
        riverScore: 0,
        fishCount: 0,
        color: this.pickRoomColor(targetRoomKey),
        region: message.region,
        gameMode,
        roomKey: targetRoomKey,
        inventory: emptyCharmInventory(),
        boostTier: null,
        boostMultiplier: 1,
        boostUntil: 0,
        boostGraceUntil: 0,
      };
      this.players.set(p.id, p);
      this.spawn(p, message.region, targetRoomKey);
    } else {
      const prevRoomKey = this.roomKeyForPlayer(p);
      if (
        targetRoomKey !== prevRoomKey &&
        this.roomCount(targetRoomKey, p) >= this.maxPlayersPerRegion
      ) {
        return {
          error: "FULL",
          message:
            "Phòng chơi này đã đủ 10 người. Hãy chọn khu vực hoặc chế độ khác.",
        };
      }
      if (targetRoomKey !== prevRoomKey) {
        this.modeStates.get(prevRoomKey)?.state?.onLeave?.(p, this);
      }
      p.name = name;
      p.avatar = avatar;
      p.gameMode = gameMode;
      p.roomKey = targetRoomKey;
      p.inventory ||= emptyCharmInventory();
      if (
        targetRoomKey === prevRoomKey &&
        Number.isFinite(p.x) &&
        Number.isFinite(p.z) &&
        this.contains(this.areas.get(p.region).region, p.x, p.z)
      ) {
        Object.assign(p, {
          speed: 0,
          lean: 0,
          ready: false,
          paused: false,
          seq: -1,
          stamp: this.now(),
          activeAt: this.now(),
          credit: 1.2,
          stunnedUntil: 0,
          immuneUntil: this.now() + 2000,
        });
      } else {
        p.color = this.pickRoomColor(targetRoomKey, p);
        this.spawn(p, message.region, targetRoomKey);
      }
    }
    p.send = send;
    const now = this.now();
    const charmEntry = this.ensureRegionCharms(message.region, false, gameMode);
    this.send(p, {
      type: "welcome",
      id: p.id,
      token: p.token,
      reconnected: Boolean(message.token && p.token === message.token && Number.isFinite(p.x)),
      player: this.publicPlayer(p),
      limit: this.maxPlayersPerRegion,
    });
    const modeState = this.ensureModeState(targetRoomKey, gameMode);
    modeState?.onJoin?.(p, this);
    this.send(p, {
      type: "charms",
      region: message.region,
      gameMode,
      charms: charmEntry.charms,
      nextRefreshAt: charmEntry.nextRefreshAt,
      refreshed: false,
    });
    this.send(p, {
      type: "inventory",
      inventory: { ...p.inventory },
    });
    if (p.boostUntil > now && p.boostTier && (p.boostMultiplier || 1) > 1) {
      this.send(p, {
        type: "boost_ack",
        rejected: false,
        inventory: { ...p.inventory },
        boostTier: p.boostTier,
        boostMultiplier: p.boostMultiplier,
        remainingMs: Math.max(0, p.boostUntil - now),
      });
    }
    const modeSummary = modeState?.publicSummary?.(this);
    if (modeSummary) {
      this.send(p, { type: "mode_event", ...modeSummary });
    }
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
  spawn(p, id, targetRoomKey = this.roomKeyForPlayer(p)) {
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
            this.roomKeyForPlayer(o) === targetRoomKey &&
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
      roomKey: targetRoomKey,
      x,
      z,
      y: 0,
      heading,
      speed: 0,
      lean: 0,
      ready: false,
      paused: false,
      boatIndex: -1,
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
    const nextGameMode = cleanGameModeId(
      p.gameMode || DEFAULT_GAME_MODE_ID,
      id,
    );
    const nextRoomKey = roomKeyFor(id, nextGameMode);
    const prevRoomKey = this.roomKeyForPlayer(p);
    if (
      nextRoomKey !== prevRoomKey &&
      this.roomCount(nextRoomKey, p) >= this.maxPlayersPerRegion
    )
      return this.send(p, {
        type: "error",
        code: "FULL",
        message: "Khu vực này đã đủ 10 người. Hãy chọn khu vực khác.",
      });
    if (nextRoomKey !== prevRoomKey) {
      this.modeStates.get(prevRoomKey)?.state?.onLeave?.(p, this);
      p.color = this.pickRoomColor(nextRoomKey, p);
    }
    p.gameMode = nextGameMode;
    p.roomKey = nextRoomKey;
    this.spawn(p, id, nextRoomKey);
    const charmEntry = this.ensureRegionCharms(id, false, nextGameMode);
    this.send(p, { type: "relocate", player: this.publicPlayer(p) });
    this.ensureModeState(nextRoomKey, nextGameMode)?.onJoin?.(p, this);
    this.send(p, {
      type: "charms",
      region: id,
      gameMode: nextGameMode,
      charms: charmEntry.charms,
      nextRefreshAt: charmEntry.nextRefreshAt,
      refreshed: false,
    });
    this.snapshot();
  }
  createRoadSampler(regionId) {
    const area = this.areas.get(regionId);
    if (!area) return null;
    const areaRoads = Array.isArray(area.roads) ? area.roads : [];
    const riverRings = Array.isArray(area.riverRings) ? area.riverRings : [];
    const truongTienRoad = areaRoads.find((r) => r.id === TRUONG_TIEN_ID);
    const boardwalkMainPoints = stitchMainBoardwalk(areaRoads);
    const nearestAreaRoad = (x, z) => {
      let best = { distance: Infinity, road: null, index: 1, t: 0 };
      for (const road of areaRoads) {
        if (!road?.points?.length) continue;
        const hit = nearestPoint({ x, z }, road.points);
        if (hit.distance < best.distance) {
          best = { ...hit, road };
        }
      }
      return best;
    };
    const roadHeightAtHit = (hit) => {
      if (!hit.road) return 0.25;
      if (BOARDWALK_WAY_IDS.has(hit.road.id)) return BOARDWALK_Y + 0.008;
      const i = Math.max(1, hit.index || 1);
      if (LATERAL_BOARDWALK_IDS.has(hit.road.id) && boardwalkMainPoints.length) {
        const y0 = lateralBridgeHeight(hit.road, i - 1, boardwalkMainPoints);
        const y1 = lateralBridgeHeight(hit.road, i, boardwalkMainPoints);
        return y0 * (1 - (hit.t || 0)) + y1 * (hit.t || 0) + 0.008;
      }
      const y0 = roadSurfaceHeight(hit.road, i - 1);
      const y1 = roadSurfaceHeight(hit.road, i);
      return y0 * (1 - (hit.t || 0)) + y1 * (hit.t || 0);
    };
    const canPlace = (x, z) => {
      if (!this.contains(area.region, x, z)) return false;
      if (!areaRoads.length) return true;
      if (truongTienRoad) {
        const q = truongTienDeckQuery(truongTienRoad, x, z);
        if (q.onBridge) {
          if (!q.allowed) return false;
          const absLat = Math.abs(q.lat);
          return (
            absLat <= TRUONG_TIEN_ROAD_HALF - 0.65 ||
            (absLat >= TRUONG_TIEN_WALK_INNER + 0.25 &&
              absLat <= TRUONG_TIEN_WALK_OUTER - 0.45)
          );
        }
      }
      const hit = nearestAreaRoad(x, z);
      if (!hit.road) return false;
      const inRiver = riverRings.some((r) => inside({ x, z }, r));
      if (inRiver) {
        const isBridgeOrBoardwalk =
          hit.road.tags?.name === "Cầu Phú Xuân" ||
          hit.road.tags?.bridge === "yes" ||
          BOARDWALK_WAY_IDS.has(hit.road.id) ||
          LATERAL_BOARDWALK_IDS.has(hit.road.id);
        if (!isBridgeOrBoardwalk) return false;
        if (roadHeightAtHit(hit) < 0.32) return false;
      }
      const half = roadWidth(hit.road) / 2;
      return hit.distance <= Math.max(0.45, half - 0.5);
    };
    const groundAt = (x, z) => {
      if (!areaRoads.length) return 0.25;
      if (truongTienRoad) {
        const q = truongTienDeckQuery(truongTienRoad, x, z);
        if (q.onBridge) return q.deckY;
      }
      return roadHeightAtHit(nearestAreaRoad(x, z));
    };
    return { area, areaRoads, canPlace, groundAt };
  }
  sampleRoadPoints(regionId, count = 8, idPrefix = "pt") {
    const sampler = this.createRoadSampler(regionId);
    if (!sampler) return [];
    const pool = generateRegionCharms(sampler.area.region, {
      idPrefix,
      extraRoads: sampler.areaRoads,
      canPlace: sampler.canPlace,
      groundAt: sampler.groundAt,
    });
    if (!pool.length) return [];
    const step = Math.max(1, Math.floor(pool.length / Math.max(1, count)));
    const result = [];
    for (let i = 0; i < pool.length && result.length < count; i += step) {
      const c = pool[i];
      result.push({ x: c.x, y: c.y, z: c.z });
    }
    let idx = 1;
    while (result.length < count && idx < pool.length) {
      const c = pool[idx];
      if (!result.some((r) => Math.hypot(r.x - c.x, r.z - c.z) < 6)) {
        result.push({ x: c.x, y: c.y, z: c.z });
      }
      idx++;
    }
    return result;
  }
  ensureRegionCharms(
    regionId,
    forceRefresh = false,
    gameMode = DEFAULT_GAME_MODE_ID,
  ) {
    let baseRegionId = regionId;
    let modeId = gameMode;
    if (typeof regionId === "string" && regionId.includes("::")) {
      const [reg, mode] = regionId.split("::");
      baseRegionId = reg;
      modeId = mode || gameMode;
    }
    const cleanMode = cleanGameModeId(modeId, baseRegionId);
    const roomKey = roomKeyFor(baseRegionId, cleanMode);
    const sampler = this.createRoadSampler(baseRegionId);
    if (!sampler) {
      return {
        region: baseRegionId,
        gameMode: cleanMode,
        charms: [],
        nextRefreshAt: this.now() + 30000,
      };
    }
    const existing = this.regionCharms.get(roomKey);
    const now = this.now();
    if (existing && !forceRefresh) return existing;
    const seq = (existing?.seq || 0) + 1;
    const charms = generateRegionCharms(sampler.area.region, {
      idPrefix: `${roomKey}-${seq}`,
      extraRoads: sampler.areaRoads,
      canPlace: sampler.canPlace,
      groundAt: sampler.groundAt,
    });
    const entry = {
      seq,
      region: baseRegionId,
      gameMode: cleanMode,
      charms,
      nextRefreshAt: now + randomCharmRefreshMs(),
    };
    this.regionCharms.set(roomKey, entry);
    return entry;
  }
  publishRegionCharms(roomKey, entry, refreshed = false) {
    const region =
      entry?.region || (roomKey.includes("::") ? roomKey.split("::")[0] : roomKey);
    const payload = {
      type: "charms",
      region,
      gameMode: entry?.gameMode || DEFAULT_GAME_MODE_ID,
      charms: entry.charms,
      nextRefreshAt: entry.nextRefreshAt,
      refreshed,
    };
    for (const player of this.players.values()) {
      if (player.send && this.roomKeyForPlayer(player) === roomKey) {
        this.send(player, payload);
      }
    }
  }
  tickCharms() {
    const now = this.now();
    for (const [roomKey, entry] of this.regionCharms.entries()) {
      if (now < entry.nextRefreshAt) continue;
      const hasPlayers = [...this.players.values()].some(
        (p) => p.send && this.roomKeyForPlayer(p) === roomKey,
      );
      if (!hasPlayers) continue;
      const refreshedEntry = this.ensureRegionCharms(
        entry.region || roomKey,
        true,
        entry.gameMode || DEFAULT_GAME_MODE_ID,
      );
      this.publishRegionCharms(roomKey, refreshedEntry, true);
    }
  }
  pickup(p, charmId) {
    if (typeof charmId !== "string" || !charmId || charmId.length > 64) return;
    const roomKey = this.roomKeyForPlayer(p);
    const gameMode = p.gameMode || DEFAULT_GAME_MODE_ID;
    const entry = this.ensureRegionCharms(p.region, false, gameMode);
    const idx = entry.charms.findIndex((c) => c.id === charmId);
    if (idx === -1) {
      return this.send(p, {
        type: "charms",
        region: p.region,
        gameMode,
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
        gameMode,
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
    this.publishRegionCharms(roomKey, entry, false);
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
    this.modeStates
      .get(this.roomKeyForPlayer(p))
      ?.state?.onCharmUsed?.(p, tier, this, now);
    this.snapshot();
  }
  modeAction(p, message) {
    if (!p || !message || typeof message !== "object") return;
    const roomKey = this.roomKeyForPlayer(p);
    this.modeStates
      .get(roomKey)
      ?.state?.onAction?.(p, message, this, this.now());
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
    const pRoomKey = this.roomKeyForPlayer(p);
    const modeState = this.modeStates.get(pRoomKey)?.state;
    const boostMult =
      now < (p.boostGraceUntil || 0) && Number.isFinite(p.boostMultiplier)
        ? Math.max(1, p.boostMultiplier)
        : 1;
    const prevMult =
      now < (p.prevBoostGraceUntil || 0) && Number.isFinite(p.prevBoostMultiplier)
        ? Math.max(1, p.prevBoostMultiplier)
        : 1;
    const modeMult = Math.max(1, modeState?.speedMultiplierFor?.(p, now) ?? 1);
    const activeMult = Math.max(boostMult, prevMult) * modeMult;
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
    const nextStance = cleanStance(m.stance, m.speed);
    let nextBoatIndex = cleanBoatIndex(m.boatIndex, nextStance);
    if (nextStance === "boat") {
      const takenBoats = new Set(
        this.roomPlayers(pRoomKey, p)
          .filter(
            (other) =>
              other.send &&
              other.ready &&
              cleanStance(other.stance, other.speed) === "boat" &&
              other.boatIndex >= 0,
          )
          .map((other) => other.boatIndex),
      );
      if (nextBoatIndex < 0 || takenBoats.has(nextBoatIndex)) {
        let free = -1;
        for (let bi = 0; bi < PEDAL_BOAT_COUNT; bi++) {
          if (!takenBoats.has(bi)) {
            free = bi;
            break;
          }
        }
        nextBoatIndex = free;
      }
      if (nextBoatIndex < 0) {
        p.boatIndex = -1;
        p.stance = "idle";
        p.speed = 0;
        return this.send(p, { type: "correct", player: this.publicPlayer(p) });
      }
    } else {
      nextBoatIndex = -1;
    }
    Object.assign(p, {
      x: m.x,
      y: m.y,
      z: m.z,
      heading: Math.atan2(Math.sin(m.heading), Math.cos(m.heading)),
      speed: m.speed,
      lean: m.lean,
      avatar: m.avatar ? cleanAvatarId(m.avatar) : cleanAvatarId(p.avatar),
      stance: nextStance,
      boatIndex: nextBoatIndex,
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
        this.roomKeyForPlayer(other) !== pRoomKey ||
        now < other.immuneUntil ||
        (!other.paused && now - other.activeAt > 2000)
      )
        continue;
      if (
        Math.abs(p.speed) + Math.abs(other.speed) < 0.5 ||
        !sweptContact(old, p, other)
      )
        continue;
      const handled = modeState?.onCollision?.(p, other, this, now, old);
      if (!handled) {
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
        this.publishToRoom(pRoomKey, event);
      }
      break;
    }
  }
  pause(p, reason = 'background') {
    // Background tabs stop sending motion, but their loaded avatar stays present.
    // Only unloading a region makes its last pose unavailable for rendering.
    p.paused = true;
    p.speed = 0;
    p.lean = 0;
    if (reason === 'region') {
      p.ready = false;
      p.boatIndex = -1;
    }
    this.snapshot();
  }
  disconnect(p, intentional = false) {
    if (intentional) {
      this.modeStates.get(this.roomKeyForPlayer(p))?.state?.onLeave?.(p, this);
      this.players.delete(p.id);
    } else {
      p.send = null;
      p.ready = false;
      p.boatIndex = -1;
      p.expires = this.now() + this.reconnectMs;
    }
    this.snapshot();
  }
  publicPlayer(p) {
    const now = this.now();
    const boosted = now < (p.boostUntil || 0) && (p.boostMultiplier || 1) > 1;
    const modeData =
      this.modeStates
        .get(this.roomKeyForPlayer(p))
        ?.state?.publicPlayerData?.(p, now) || null;
    const {
      id,
      name,
      color,
      avatar,
      stance,
      boatIndex,
      riverScore,
      fishCount,
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
    const cleanS = cleanStance(stance, speed);
    return {
      id,
      name,
      color,
      avatar: cleanAvatarId(avatar),
      stance: cleanS,
      boatIndex: cleanBoatIndex(boatIndex, cleanS),
      riverScore: riverScore || 0,
      fishCount: fishCount || 0,
      region,
      gameMode: p.gameMode || DEFAULT_GAME_MODE_ID,
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
      ...(modeData ? { modeData } : {}),
    };
  }
  summary() {
    this.expire();
    const regions = {};
    const rooms = {};
    let connected = 0;
    for (const p of this.players.values()) {
      if (p.send) connected++;
      if (p.region) regions[p.region] = (regions[p.region] || 0) + 1;
      const roomKey = this.roomKeyForPlayer(p);
      if (roomKey) rooms[roomKey] = (rooms[roomKey] || 0) + 1;
    }
    return {
      ok: true,
      players: this.players.size,
      connected,
      limit: this.maxPlayersPerRegion,
      maxTotalPlayers: this.maxTotalPlayers,
      regions,
      rooms,
    };
  }
  snapshot() {
    this.expire();
    this.tickCharms();
    const time = this.now();
    const byRoom = new Map();
    for (const p of this.players.values()) {
      const roomKey = this.roomKeyForPlayer(p);
      let list = byRoom.get(roomKey);
      if (!list) {
        list = [];
        byRoom.set(roomKey, list);
      }
      list.push(this.publicPlayer(p));
    }
    for (const [roomKey, list] of byRoom.entries()) {
      this.modeStates.get(roomKey)?.state?.tick?.(this, list, time);
    }
    for (const p of this.players.values()) {
      if (!p.send) continue;
      const roomKey = this.roomKeyForPlayer(p);
      const list = byRoom.get(roomKey) || [];
      this.send(p, {
        type: "snapshot",
        time,
        region: p.region,
        gameMode: p.gameMode || DEFAULT_GAME_MODE_ID,
        limit: this.maxPlayersPerRegion,
        occupied: list.length,
        players: list,
      });
    }
  }
}
