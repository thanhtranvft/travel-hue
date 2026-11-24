import {
  cleanEmoteId,
  cleanPartyItemId,
  COOP_TASKS,
  EMOTE_BY_ID,
  LANDMARK_HOTSPOTS,
  PARTY_ITEM_LIST,
  PARTY_ITEMS,
  TAG_CHASE_CONFIG,
} from "./constants.js";

function emptyPartyInventory() {
  return {
    "non-la-shield": 0,
    "perfume-wind": 0,
    "salt-coffee": 0,
  };
}

function clampBouncePose(room, regionId, x, z, heading) {
  const area = room.areas.get(regionId);
  if (!area) return { x, z, heading };
  if (room.contains(area.region, x, z)) return { x, z, heading };
  return null;
}

export function createTagChaseRoomState(room, roomKey) {
  const regionId = roomKey.includes("::") ? roomKey.split("::")[0] : roomKey;
  const hotspots = LANDMARK_HOTSPOTS[regionId] || [];
  const coopTask = COOP_TASKS[regionId] || {
    id: "lanterns",
    title: "Thắp 15 Đèn Lồng Cố Đô",
    itemKind: "lantern",
  };

  const state = {
    phase: "waiting", // waiting | countdown | playing | intermission
    phaseEndsAt: 0,
    roundNumber: 0,
    hotspotIndex: 0,
    nextHotspotAt: 0,
    surgeTriggered: false,
    partyBoxes: [],
    partySeq: 0,
    nextPartyBoxRefreshAt: 0,
    coopActive: false,
    coopDoneThisRound: false,
    coopEndsAt: 0,
    coopCollected: 0,
    coopItems: [],
    coopSeq: 0,
    lastTickAt: room.now(),
    lastCheckAt: 0,
    lastBroadcastAt: 0,
    lastAwards: null,
  };

  function roomPlayers() {
    return room
      .roomPlayers(roomKey)
      .filter((p) => p && p.send);
  }

  function ensurePlayerStats(p) {
    if (!p.tagStats) {
      p.tagStats = {
        role: "runner",
        score: 0,
        tags: 0,
        closeCalls: 0,
        closeCallCombo: 0,
        lastCloseCallAt: 0,
        charmsUsed: 0,
        partyUsed: 0,
        shieldBlocks: 0,
        survivalCarryMs: 0,
        closeCallWatch: new Map(),
      };
    }
    if (!p.partyInventory) {
      p.partyInventory = emptyPartyInventory();
    }
    return p.tagStats;
  }

  function currentHotspot() {
    if (state.phase !== "playing" || !hotspots.length) return null;
    return hotspots[state.hotspotIndex % hotspots.length];
  }

  function buildLeaderboard(players) {
    return players
      .map((p) => {
        const s = ensurePlayerStats(p);
        return {
          id: p.id,
          name: p.name,
          color: p.color,
          role: s.role,
          score: s.score,
          tags: s.tags,
          closeCalls: s.closeCalls,
          charmsUsed: s.charmsUsed,
          partyUsed: s.partyUsed,
          shieldBlocks: s.shieldBlocks,
        };
      })
      .sort((a, b) => b.score - a.score || b.tags - a.tags);
  }

  function buildAwards(players) {
    const board = buildLeaderboard(players);
    if (!board.length) return [];
    const regionTitle = regionId === "quang-trung" ? "Quang Trung" : "Lê Lợi";
    const awards = [];
    awards.push({
      id: "king",
      icon: "🏆",
      title: `Vua Tốc Độ ${regionTitle}`,
      playerName: board[0].name,
      detail: `${board[0].score} điểm`,
    });
    const evader = [...board].sort((a, b) => b.closeCalls - a.closeCalls)[0];
    if (evader && evader.closeCalls > 0) {
      awards.push({
        id: "evader",
        icon: "💨",
        title: "Thánh Né Xe",
        playerName: evader.name,
        detail: `${evader.closeCalls} pha thoát hiểm`,
      });
    }
    const charmHunter = [...board].sort(
      (a, b) => b.charmsUsed + b.partyUsed - (a.charmsUsed + a.partyUsed),
    )[0];
    if (charmHunter && charmHunter.charmsUsed + charmHunter.partyUsed > 0) {
      awards.push({
        id: "charm",
        icon: "⚡",
        title: "Thợ Săn Bùa",
        playerName: charmHunter.name,
        detail: `${charmHunter.charmsUsed + charmHunter.partyUsed} lần kích hoạt`,
      });
    }
    const shielder = [...board].sort(
      (a, b) => b.shieldBlocks - a.shieldBlocks,
    )[0];
    if (shielder && shielder.shieldBlocks > 0) {
      awards.push({
        id: "shield",
        icon: "👒",
        title: "Nón Lá Bất Bại",
        playerName: shielder.name,
        detail: `${shielder.shieldBlocks} lần đỡ đòn`,
      });
    }
    return awards;
  }

  function spawnPartyBoxes(now) {
    const pts = room.sampleRoadPoints(
      regionId,
      TAG_CHASE_CONFIG.partyBoxCount,
      `pbox-${++state.partySeq}`,
    );
    state.partyBoxes = pts.map((pt, idx) => ({
      id: `pbox-${state.partySeq}-${idx}`,
      x: pt.x,
      y: pt.y,
      z: pt.z,
    }));
    state.nextPartyBoxRefreshAt = now + TAG_CHASE_CONFIG.partyBoxRefreshMs;
  }

  function spawnCoopItems(now) {
    const pts = room.sampleRoadPoints(
      regionId,
      TAG_CHASE_CONFIG.coopTargetCount,
      `coop-${++state.coopSeq}`,
    );
    state.coopItems = pts.map((pt, idx) => ({
      id: `coop-${state.coopSeq}-${idx}`,
      x: pt.x,
      y: pt.y,
      z: pt.z,
      kind: coopTask.itemKind,
    }));
    state.coopCollected = 0;
    state.coopActive = true;
    state.coopDoneThisRound = true;
    state.coopEndsAt = now + TAG_CHASE_CONFIG.coopDurationMs;
  }

  function assignRoles(players, now) {
    const hunterCount = players.length >= 5 ? 2 : 1;
    const pickedIndices = new Set();
    const offset = state.roundNumber % Math.max(1, players.length);
    for (let i = 0; i < hunterCount && pickedIndices.size < players.length; i++) {
      pickedIndices.add((offset + i * 2) % players.length);
    }
    players.forEach((p, idx) => {
      const s = ensurePlayerStats(p);
      s.role = pickedIndices.has(idx) ? "hunter" : "runner";
      s.score = 0;
      s.tags = 0;
      s.closeCalls = 0;
      s.closeCallCombo = 0;
      s.lastCloseCallAt = 0;
      s.charmsUsed = 0;
      s.partyUsed = 0;
      s.shieldBlocks = 0;
      s.survivalCarryMs = 0;
      s.closeCallWatch = new Map();
      p.shieldUntil = 0;
      p.slowedUntil = 0;
      p.coffeeBoostUntil = 0;
      p.immuneUntil = now + 2500;
    });
  }

  function publicSummary(now = room.now()) {
    const players = roomPlayers();
    const hotspot = currentHotspot();
    return {
      event: "tag_state",
      phase: state.phase,
      roundNumber: state.roundNumber,
      remainingMs: state.phaseEndsAt ? Math.max(0, state.phaseEndsAt - now) : 0,
      hotspot: hotspot
        ? { ...hotspot, radius: TAG_CHASE_CONFIG.hotspotRadius }
        : null,
      coop: state.coopActive
        ? {
            active: true,
            title: coopTask.title,
            itemKind: coopTask.itemKind,
            collected: state.coopCollected,
            target: TAG_CHASE_CONFIG.coopTargetCount,
            remainingMs: Math.max(0, state.coopEndsAt - now),
            items: state.coopItems,
          }
        : { active: false },
      partyBoxes: state.partyBoxes,
      leaderboard: buildLeaderboard(players).slice(0, 5),
      awards: state.phase === "intermission" ? state.lastAwards : null,
      playerCount: players.length,
    };
  }

  function broadcastState(now = room.now()) {
    state.lastBroadcastAt = now;
    room.publishToRoom(roomKey, {
      type: "mode_event",
      ...publicSummary(now),
    });
  }

  function startCountdown(players, now) {
    state.roundNumber++;
    state.phase = "countdown";
    state.phaseEndsAt = now + TAG_CHASE_CONFIG.countdownMs;
    state.hotspotIndex = state.roundNumber % Math.max(1, hotspots.length);
    state.surgeTriggered = false;
    state.coopActive = false;
    state.coopDoneThisRound = false;
    state.coopItems = [];
    state.lastAwards = null;
    assignRoles(players, now);
    spawnPartyBoxes(now);
    for (const p of players) {
      room.send(p, {
        type: "mode_event",
        event: "party_inventory",
        inventory: { ...p.partyInventory },
      });
    }
    broadcastState(now);
  }

  function finishRound(players, now) {
    state.phase = "intermission";
    state.phaseEndsAt = now + TAG_CHASE_CONFIG.intermissionMs;
    state.coopActive = false;
    state.coopItems = [];
    state.lastAwards = buildAwards(players);
    room.publishToRoom(roomKey, {
      type: "mode_event",
      event: "round_end",
      leaderboard: buildLeaderboard(players),
      awards: state.lastAwards,
      nextRoundInMs: TAG_CHASE_CONFIG.intermissionMs,
    });
    broadcastState(now);
  }

  return {
    speedMultiplierFor(p, now = room.now()) {
      const s = ensurePlayerStats(p);
      let mult = s.role === "hunter" ? TAG_CHASE_CONFIG.hunterSpeedMultiplier : 1;
      if ((p.coffeeBoostUntil || 0) > now) {
        mult *= TAG_CHASE_CONFIG.coffeeBoostMultiplier;
      }
      return mult;
    },

    publicPlayerData(p, now = room.now()) {
      const s = ensurePlayerStats(p);
      return {
        role: s.role,
        score: s.score,
        tags: s.tags,
        closeCalls: s.closeCalls,
        shielded: (p.shieldUntil || 0) > now,
        slowed: (p.slowedUntil || 0) > now,
        coffeeBoost: (p.coffeeBoostUntil || 0) > now,
      };
    },

    publicSummary() {
      return publicSummary(room.now());
    },

    onJoin(p) {
      const now = room.now();
      ensurePlayerStats(p);
      const players = roomPlayers();
      if (state.phase === "playing") {
        // Joining mid-round enters cleanly as runner with brief immunity
        const hasHunter = players.some((o) => o.tagStats?.role === "hunter");
        p.tagStats.role = hasHunter ? "runner" : "hunter";
        p.immuneUntil = now + 3000;
      }
      if (!state.partyBoxes.length) spawnPartyBoxes(now);
      room.send(p, {
        type: "mode_event",
        event: "party_inventory",
        inventory: { ...p.partyInventory },
      });
      if (
        state.phase === "waiting" &&
        players.length >= TAG_CHASE_CONFIG.minPlayersToStart
      ) {
        startCountdown(players, now);
      } else {
        broadcastState(now);
      }
    },

    onLeave(p) {
      const now = room.now();
      const players = roomPlayers().filter((o) => o !== p);
      if (players.length < TAG_CHASE_CONFIG.minPlayersToStart) {
        state.phase = "waiting";
        state.phaseEndsAt = 0;
        state.coopActive = false;
        state.coopItems = [];
        for (const rem of players) ensurePlayerStats(rem).role = "runner";
        broadcastState(now);
        return;
      }
      if (
        state.phase === "playing" &&
        !players.some((o) => ensurePlayerStats(o).role === "hunter")
      ) {
        const promoted = players[0];
        ensurePlayerStats(promoted).role = "hunter";
        promoted.immuneUntil = now + 2000;
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "tag_banner",
          text: `🔥 ${promoted.name} đảm nhận vai Người Săn mới!`,
        });
        broadcastState(now);
      }
    },

    onCharmUsed(p) {
      ensurePlayerStats(p).charmsUsed++;
    },

    onCollision(p, other, _room, now, oldPose) {
      const sp = ensurePlayerStats(p);
      const so = ensurePlayerStats(other);
      const dx = (other.x - p.x) || Math.sin(p.heading || 0);
      const dz = (other.z - p.z) || Math.cos(p.heading || 0);
      const len = Math.hypot(dx, dz) || 1;
      const nx = dx / len;
      const nz = dz / len;

      const pushP = clampBouncePose(room, p.region, (oldPose?.x ?? p.x) - nx * 1.35, (oldPose?.z ?? p.z) - nz * 1.35, p.heading);
      const pushO = clampBouncePose(room, other.region, other.x + nx * 1.35, other.z + nz * 1.35, other.heading);
      if (pushP) {
        p.x = pushP.x;
        p.z = pushP.z;
      } else if (oldPose) {
        p.x = oldPose.x;
        p.z = oldPose.z;
      }
      if (pushO) {
        other.x = pushO.x;
        other.z = pushO.z;
      }
      p.speed = 0;
      p.lean = 0;
      other.speed = 0;
      other.lean = 0;

      const isHunterVsRunner =
        state.phase === "playing" &&
        ((sp.role === "hunter" && so.role === "runner") ||
          (sp.role === "runner" && so.role === "hunter"));

      if (!isHunterVsRunner) {
        p.stunnedUntil = now + 350;
        other.stunnedUntil = now + 350;
        p.immuneUntil = now + 1800;
        other.immuneUntil = now + 1800;
        room.send(p, {
          type: "mode_event",
          event: "tag_bump",
          relocate: { x: p.x, z: p.z, speed: 0 },
          otherName: other.name,
        });
        room.send(other, {
          type: "mode_event",
          event: "tag_bump",
          relocate: { x: other.x, z: other.z, speed: 0 },
          otherName: p.name,
        });
        return true;
      }

      const hunter = sp.role === "hunter" ? p : other;
      const runner = sp.role === "runner" ? p : other;
      const hunterStats = hunter.tagStats;
      const runnerStats = runner.tagStats;

      if ((runner.shieldUntil || 0) > now) {
        runner.shieldUntil = 0;
        runner.immuneUntil = now + 2200;
        runnerStats.shieldBlocks++;
        runnerStats.score += TAG_CHASE_CONFIG.shieldBlockPoints;

        hunter.stunnedUntil = now + 800;
        hunter.immuneUntil = now + 2200;

        room.send(runner, {
          type: "mode_event",
          event: "shield_block",
          role: "defender",
          points: TAG_CHASE_CONFIG.shieldBlockPoints,
          attackerName: hunter.name,
          relocate: { x: runner.x, z: runner.z, speed: 0 },
        });
        room.send(hunter, {
          type: "mode_event",
          event: "shield_block",
          role: "attacker",
          defenderName: runner.name,
          stunMs: 800,
          relocate: { x: hunter.x, z: hunter.z, speed: 0 },
        });
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "tag_banner",
          text: `👒 ${runner.name} dùng Khiên Nón Lá hất văng ${hunter.name}! (+${TAG_CHASE_CONFIG.shieldBlockPoints}đ)`,
        });
        broadcastState(now);
        return true;
      }

      // Tag & Swap
      hunterStats.tags++;
      hunterStats.score += TAG_CHASE_CONFIG.hunterTagPoints;
      hunterStats.role = "runner";
      runnerStats.role = "hunter";
      runnerStats.closeCallWatch?.clear?.();
      runner.immuneUntil = now + 3000;
      runner.stunnedUntil = now + 450;
      hunter.immuneUntil = now + 2200;

      room.send(hunter, {
        type: "mode_event",
        event: "tag_swap",
        youTagged: true,
        points: TAG_CHASE_CONFIG.hunterTagPoints,
        victimName: runner.name,
        relocate: { x: hunter.x, z: hunter.z, speed: 0 },
      });
      room.send(runner, {
        type: "mode_event",
        event: "tag_swap",
        youWereTagged: true,
        hunterName: hunter.name,
        stunMs: 450,
        relocate: { x: runner.x, z: runner.z, speed: 0 },
      });
      room.publishToRoom(roomKey, {
        type: "mode_event",
        event: "tag_banner",
        text: `🔥 ${hunter.name} bắt trúng ${runner.name}! Đổi vai Người Săn (+${TAG_CHASE_CONFIG.hunterTagPoints}đ)`,
      });
      broadcastState(now);
      return true;
    },

    onAction(p, message, _room, now = room.now()) {
      const s = ensurePlayerStats(p);
      const action = message.action;

      if (action === "party_pickup") {
        const boxId = typeof message.boxId === "string" ? message.boxId : "";
        const idx = state.partyBoxes.findIndex((b) => b.id === boxId);
        if (idx === -1) return;
        const box = state.partyBoxes[idx];
        if (Math.hypot((p.x || 0) - box.x, (p.z || 0) - box.z) > 6.2) return;
        state.partyBoxes.splice(idx, 1);
        const candidates = PARTY_ITEM_LIST.filter(
          (item) => (p.partyInventory[item.id] || 0) < TAG_CHASE_CONFIG.partyMaxPerItem,
        );
        const pool = candidates.length ? candidates : PARTY_ITEM_LIST;
        const lowOwned = pool.filter((item) => (p.partyInventory[item.id] || 0) === 0);
        const pickFrom = lowOwned.length ? lowOwned : pool;
        const chosen = pickFrom[(state.partySeq + Math.floor(now) + idx) % pickFrom.length];
        p.partyInventory[chosen.id] = Math.min(
          TAG_CHASE_CONFIG.partyMaxPerItem,
          (p.partyInventory[chosen.id] || 0) + 1,
        );
        room.send(p, {
          type: "mode_event",
          event: "party_inventory",
          inventory: { ...p.partyInventory },
          pickedItem: chosen.id,
        });
        broadcastState(now);
        return;
      }

      if (action === "use_party_item") {
        const itemId = cleanPartyItemId(message.itemId);
        if (!itemId || (p.partyInventory[itemId] || 0) <= 0) {
          room.send(p, {
            type: "mode_event",
            event: "party_inventory",
            inventory: { ...p.partyInventory },
            rejected: true,
          });
          return;
        }
        p.partyInventory[itemId]--;
        s.partyUsed++;
        if (itemId === "non-la-shield") {
          p.shieldUntil = now + TAG_CHASE_CONFIG.shieldDurationMs;
          room.send(p, {
            type: "mode_event",
            event: "party_used",
            itemId,
            durationMs: TAG_CHASE_CONFIG.shieldDurationMs,
          });
        } else if (itemId === "perfume-wind") {
          const slowedIds = [];
          for (const other of roomPlayers()) {
            if (other === p) continue;
            if ((other.shieldUntil || 0) > now) continue;
            const d = Math.hypot((other.x || 0) - (p.x || 0), (other.z || 0) - (p.z || 0));
            if (d <= TAG_CHASE_CONFIG.windRadius) {
              other.slowedUntil = now + TAG_CHASE_CONFIG.windSlowDurationMs;
              slowedIds.push(other.id);
              room.send(other, {
                type: "mode_event",
                event: "wind_slowed",
                byName: p.name,
                durationMs: TAG_CHASE_CONFIG.windSlowDurationMs,
              });
            }
          }
          room.publishToRoom(roomKey, {
            type: "mode_event",
            event: "wind_gust",
            casterId: p.id,
            x: p.x,
            y: p.y || 0.3,
            z: p.z,
            hitCount: slowedIds.length,
          });
        } else if (itemId === "salt-coffee") {
          p.stunnedUntil = 0;
          p.slowedUntil = 0;
          p.coffeeBoostUntil = now + TAG_CHASE_CONFIG.coffeeBoostDurationMs;
          room.send(p, {
            type: "mode_event",
            event: "coffee_boost",
            durationMs: TAG_CHASE_CONFIG.coffeeBoostDurationMs,
            multiplier: TAG_CHASE_CONFIG.coffeeBoostMultiplier,
          });
        }
        room.send(p, {
          type: "mode_event",
          event: "party_inventory",
          inventory: { ...p.partyInventory },
        });
        broadcastState(now);
        return;
      }

      if (action === "coop_pickup") {
        if (!state.coopActive) return;
        const itemId = typeof message.itemId === "string" ? message.itemId : "";
        const idx = state.coopItems.findIndex((i) => i.id === itemId);
        if (idx === -1) return;
        const item = state.coopItems[idx];
        if (Math.hypot((p.x || 0) - item.x, (p.z || 0) - item.z) > 6.2) return;
        state.coopItems.splice(idx, 1);
        state.coopCollected++;
        s.score += 15;
        if (state.coopCollected >= TAG_CHASE_CONFIG.coopTargetCount) {
          state.coopActive = false;
          state.coopItems = [];
          const players = roomPlayers();
          for (const pl of players) {
            ensurePlayerStats(pl).score += TAG_CHASE_CONFIG.coopRewardPoints;
          }
          room.publishToRoom(roomKey, {
            type: "mode_event",
            event: "coop_end",
            success: true,
            title: coopTask.title,
            reward: TAG_CHASE_CONFIG.coopRewardPoints,
          });
        }
        broadcastState(now);
        return;
      }

      if (action === "emote") {
        const emoteId = cleanEmoteId(message.emoteId);
        if (!emoteId) return;
        if (now - (p.lastEmoteAt || 0) < TAG_CHASE_CONFIG.emoteCooldownMs) return;
        p.lastEmoteAt = now;
        const emote = EMOTE_BY_ID.get(emoteId);
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "emote",
          playerId: p.id,
          playerName: p.name,
          emoteId,
          text: emote.text,
        });
        return;
      }

      if (action === "traffic_shield_block") {
        if ((p.shieldUntil || 0) > now) {
          p.shieldUntil = 0;
          s.shieldBlocks++;
          s.score += 30;
          broadcastState(now);
        }
      }
    },

    tick(_room, _list, now = room.now()) {
      const dtMs = Math.max(0, Math.min(500, now - state.lastTickAt));
      state.lastTickAt = now;
      const players = roomPlayers();

      if (!players.length) {
        state.phase = "waiting";
        state.coopActive = false;
        return;
      }

      if (players.length < TAG_CHASE_CONFIG.minPlayersToStart) {
        if (state.phase !== "waiting") {
          state.phase = "waiting";
          state.phaseEndsAt = 0;
          state.coopActive = false;
          state.coopItems = [];
          for (const p of players) ensurePlayerStats(p).role = "runner";
          broadcastState(now);
        }
        if (!state.partyBoxes.length || now >= state.nextPartyBoxRefreshAt) {
          spawnPartyBoxes(now);
          broadcastState(now);
        }
        return;
      }

      if (state.phase === "waiting") {
        startCountdown(players, now);
        return;
      }

      if (state.phase === "countdown") {
        if (now >= state.phaseEndsAt) {
          state.phase = "playing";
          state.phaseEndsAt = now + TAG_CHASE_CONFIG.roundDurationMs;
          state.nextHotspotAt = now + TAG_CHASE_CONFIG.hotspotIntervalMs;
          broadcastState(now);
        } else if (now - state.lastBroadcastAt >= 500) {
          broadcastState(now);
        }
        return;
      }

      if (state.phase === "intermission") {
        if (now >= state.phaseEndsAt) {
          startCountdown(players, now);
        } else if (now - state.lastBroadcastAt >= 1000) {
          broadcastState(now);
        }
        return;
      }

      // Playing phase
      const remaining = Math.max(0, state.phaseEndsAt - now);
      if (remaining === 0) {
        finishRound(players, now);
        return;
      }

      if (hotspots.length && now >= state.nextHotspotAt) {
        state.hotspotIndex = (state.hotspotIndex + 1) % hotspots.length;
        state.nextHotspotAt = now + TAG_CHASE_CONFIG.hotspotIntervalMs;
        const hs = currentHotspot();
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "tag_banner",
          text: `📍 Điểm nóng mới: ${hs.title} (x2 điểm sinh tồn!)`,
        });
        broadcastState(now);
      }

      if (
        !state.surgeTriggered &&
        remaining <= TAG_CHASE_CONFIG.surgeRemainingMs &&
        players.length >= 5
      ) {
        const hunters = players.filter((p) => ensurePlayerStats(p).role === "hunter");
        const runners = players.filter((p) => ensurePlayerStats(p).role === "runner");
        if (hunters.length < 3 && runners.length >= 2) {
          state.surgeTriggered = true;
          const extra = runners[runners.length - 1];
          extra.tagStats.role = "hunter";
          extra.immuneUntil = now + 2000;
          room.publishToRoom(roomKey, {
            type: "mode_event",
            event: "tag_banner",
            text: `⚡ 35 giây cuối! ${extra.name} gia nhập phe Người Săn!`,
          });
          broadcastState(now);
        }
      }

      if (
        !state.coopDoneThisRound &&
        !state.coopActive &&
        remaining <= TAG_CHASE_CONFIG.coopTriggerRemainingMs &&
        remaining >= 25000 &&
        players.length >= 2
      ) {
        spawnCoopItems(now);
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "coop_start",
          title: coopTask.title,
          target: TAG_CHASE_CONFIG.coopTargetCount,
          durationMs: TAG_CHASE_CONFIG.coopDurationMs,
        });
        broadcastState(now);
      }

      if (state.coopActive && now >= state.coopEndsAt) {
        state.coopActive = false;
        state.coopItems = [];
        room.publishToRoom(roomKey, {
          type: "mode_event",
          event: "coop_end",
          success: false,
          title: coopTask.title,
        });
        broadcastState(now);
      }

      if (!state.partyBoxes.length || now >= state.nextPartyBoxRefreshAt) {
        spawnPartyBoxes(now);
        broadcastState(now);
      }

      // Survival & Close-Call checks every ~200ms
      if (now - state.lastCheckAt >= 200) {
        const stepMs = now - state.lastCheckAt > 1000 ? dtMs : now - state.lastCheckAt;
        state.lastCheckAt = now;
        const hotspot = currentHotspot();
        const activeHunters = players.filter(
          (p) =>
            ensurePlayerStats(p).role === "hunter" &&
            p.ready &&
            now >= (p.stunnedUntil || 0),
        );

        for (const p of players) {
          const s = ensurePlayerStats(p);
          if (s.role !== "runner" || !p.ready) continue;

          const inHotspot =
            hotspot &&
            Math.hypot((p.x || 0) - hotspot.x, (p.z || 0) - hotspot.z) <=
              TAG_CHASE_CONFIG.hotspotRadius;

          s.survivalCarryMs += stepMs * (inHotspot ? 2 : 1);
          if (s.survivalCarryMs >= TAG_CHASE_CONFIG.survivalTickMs) {
            s.survivalCarryMs -= TAG_CHASE_CONFIG.survivalTickMs;
            s.score += TAG_CHASE_CONFIG.survivalPoints;
          }

          for (const h of activeHunters) {
            const dist = Math.hypot((p.x || 0) - (h.x || 0), (p.z || 0) - (h.z || 0));
            const watch = s.closeCallWatch.get(h.id);
            if (!watch) {
              if (
                dist <= TAG_CHASE_CONFIG.closeCallEnterDist &&
                now >= (p.stunnedUntil || 0)
              ) {
                s.closeCallWatch.set(h.id, { enteredAt: now, minDist: dist });
              }
            } else {
              watch.minDist = Math.min(watch.minDist, dist);
              if (now - watch.enteredAt > TAG_CHASE_CONFIG.closeCallWindowMs) {
                s.closeCallWatch.delete(h.id);
              } else if (dist >= TAG_CHASE_CONFIG.closeCallEscapeDist) {
                s.closeCallWatch.delete(h.id);
                if (now - s.lastCloseCallAt <= 15000) {
                  s.closeCallCombo = Math.min(2, (s.closeCallCombo || 1) + 0.5);
                } else {
                  s.closeCallCombo = 1;
                }
                s.lastCloseCallAt = now;
                s.closeCalls++;
                const pts = Math.round(
                  TAG_CHASE_CONFIG.closeCallBasePoints * s.closeCallCombo,
                );
                s.score += pts;
                room.send(p, {
                  type: "mode_event",
                  event: "close_call",
                  points: pts,
                  combo: s.closeCallCombo,
                  hunterName: h.name,
                });
              }
            }
          }
        }
      }

      if (now - state.lastBroadcastAt >= 650) {
        broadcastState(now);
      }
    },
  };
}
