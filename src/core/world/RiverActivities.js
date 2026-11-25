import { wrapAngle } from "../vehicle/BicycleMotion.js";
import { cleanBoatIndex } from "../network/protocol.js";

export const FISH_SPECIES = [
  {
    id: "ca-bong",
    title: "Cá bống sông Hương",
    rarity: "Thường",
    points: 15,
    weight: 34,
    targetWidth: 0.3,
    cursorSpeed: 1.05,
    badgeColor: "#8ecae6",
  },
  {
    id: "ca-chep",
    title: "Cá chép vàng",
    rarity: "Khá",
    points: 25,
    weight: 26,
    targetWidth: 0.26,
    cursorSpeed: 1.25,
    badgeColor: "#f6bd60",
  },
  {
    id: "ca-loc",
    title: "Cá lóc đồng",
    rarity: "Ít gặp",
    points: 35,
    weight: 18,
    targetWidth: 0.22,
    cursorSpeed: 1.45,
    badgeColor: "#90be6d",
  },
  {
    id: "ca-dieu-hong",
    title: "Cá điêu hồng",
    rarity: "Hiếm",
    points: 45,
    weight: 14,
    targetWidth: 0.19,
    cursorSpeed: 1.68,
    badgeColor: "#f28482",
  },
  {
    id: "ca-hoang-de",
    title: "Cá tiến vua Ngự Hà",
    rarity: "Cực hiếm",
    points: 65,
    weight: 8,
    targetWidth: 0.16,
    cursorSpeed: 1.92,
    badgeColor: "#ffd166",
  },
];

function pickRandomSpecies(rng = Math.random) {
  const total = FISH_SPECIES.reduce((acc, s) => acc + s.weight, 0);
  let r = rng() * total;
  for (const spec of FISH_SPECIES) {
    r -= spec.weight;
    if (r <= 0) return spec;
  }
  return FISH_SPECIES[0];
}

export function createFishingGameState() {
  const state = {
    phase: "ready",
    waitTimer: 0,
    biteTimer: 0,
    resultTimer: 0,
    cursor: 0.5,
    cursorDir: 1,
    targetCenter: 0.5,
    targetWidth: 0.28,
    cursorSpeed: 1.15,
    progress: 0,
    species: null,
    lastCatch: null,
    lastFeedback: "Nhấn Quăng cần để thả câu xuống sông Hương",
    startCast(rng = Math.random) {
      state.phase = "waiting";
      state.waitTimer = 1.4 + rng() * 2.1;
      state.biteTimer = 0;
      state.resultTimer = 0;
      state.progress = 0;
      state.cursor = 0.5;
      state.cursorDir = 1;
      state.species = null;
      state.lastFeedback = "Đang thả mồi... Chờ phao động đậy";
      return { action: "cast" };
    },
    step(dt, rng = Math.random) {
      if (!Number.isFinite(dt) || dt <= 0) return {};
      if (state.phase === "waiting") {
        state.waitTimer -= dt;
        if (state.waitTimer <= 0) {
          const spec = pickRandomSpecies(rng);
          state.species = spec;
          state.phase = "bite";
          state.biteTimer = 3.2;
          state.targetWidth = spec.targetWidth;
          state.cursorSpeed = spec.cursorSpeed;
          state.targetCenter = 0.24 + rng() * 0.52;
          state.cursor = 0.5;
          state.cursorDir = rng() > 0.5 ? 1 : -1;
          state.progress = 0.34;
          state.lastFeedback = "Phao chìm! Nhấn Giật cần ngay!";
          return { bitten: true, species: spec };
        }
      } else if (state.phase === "bite") {
        state.biteTimer -= dt;
        if (state.biteTimer <= 0) {
          state.phase = "escaped";
          state.resultTimer = 2.2;
          state.lastFeedback = "Cá đã nhả mồi mất rồi!";
          return { escaped: true };
        }
      } else if (state.phase === "reeling") {
        state.cursor += state.cursorDir * state.cursorSpeed * dt;
        if (state.cursor >= 1) {
          state.cursor = 1;
          state.cursorDir = -1;
        } else if (state.cursor <= 0) {
          state.cursor = 0;
          state.cursorDir = 1;
        }
        state.progress -= dt * 0.085;
        if (state.progress <= 0) {
          state.progress = 0;
          state.phase = "escaped";
          state.resultTimer = 2.2;
          state.lastFeedback = "Dây câu bị chùng, cá chạy mất!";
          return { escaped: true };
        }
      } else if (state.phase === "caught" || state.phase === "escaped") {
        state.resultTimer -= dt;
        if (state.resultTimer <= 0) {
          state.phase = "ready";
          state.lastFeedback = "Nhấn Quăng cần để tiếp tục câu";
        }
      }
      return {};
    },
    pullReel(rng = Math.random) {
      if (
        state.phase === "ready" ||
        state.phase === "caught" ||
        state.phase === "escaped"
      ) {
        return state.startCast(rng);
      }
      if (state.phase === "waiting") {
        state.lastFeedback = "Chưa có cá cắn câu, ráng chờ thêm chút nữa!";
        return { action: "early" };
      }
      if (state.phase === "bite") {
        state.phase = "reeling";
        state.progress = 0.42;
        state.lastFeedback = "Đã dính! Canh con trỏ vào vùng xanh để kéo lên!";
        return { action: "hooked", species: state.species };
      }
      if (state.phase === "reeling") {
        const hit =
          Math.abs(state.cursor - state.targetCenter) <=
          state.targetWidth * 0.56;
        if (hit) {
          state.progress = Math.min(1, state.progress + 0.33);
          if (state.progress >= 1) {
            state.phase = "caught";
            state.lastCatch = state.species;
            state.resultTimer = 2.5;
            state.lastFeedback = `Tuyệt vời! Câu được ${state.species?.title || "cá"}!`;
            return { action: "caught", species: state.species };
          }
          state.targetCenter = 0.22 + rng() * 0.56;
          state.lastFeedback = "Kéo chuẩn rồi! Tiếp tục nhịp kế!";
          return { action: "hit", progress: state.progress };
        }
        state.progress = Math.max(0.06, state.progress - 0.14);
        state.lastFeedback = "Trượt nhịp! Canh vào ô xanh lá!";
        return { action: "miss", progress: state.progress };
      }
      return { action: "noop" };
    },
    reset() {
      state.phase = "ready";
      state.waitTimer = 0;
      state.biteTimer = 0;
      state.resultTimer = 0;
      state.progress = 0;
      state.cursor = 0.5;
      state.cursorDir = 1;
      state.targetCenter = 0.5;
      state.species = null;
      state.lastFeedback = "Nhấn Quăng cần để thả câu xuống sông Hương";
    },
  };
  return state;
}

export class RiverActivities {
  constructor(game) {
    this.game = game;
    this.mode = null; // null | "fishing" | "boating"
    this.activeBoatIndex = -1;
    this.fishing = createFishingGameState();
    this.riverScore = 0;
    this.fishCount = 0;
    this.cruiseDistance = 0;
    this.pendingPrompt = null; // null | { kind: "fishing" | "boat", availableCount }
    this.declinedKind = null;
    this.declinedUntil = -Infinity;
    this.seatPose = null;
    this.returnLandPose = null;
    this.remoteOccupiedBoats = new Set();
    this.nearReturnDock = false;
    this.toastUntil = -Infinity;
    this.ui = null;
    if (typeof document !== "undefined") {
      this.mountUi();
    }
  }

  isActive() {
    return this.mode === "fishing" || this.mode === "boating";
  }

  mountUi() {
    const host = document.querySelector("#app");
    if (!host) return;
    const toastHost = document.querySelector("#hud-top-center") || host;

    const scoreBadge = document.createElement("div");
    scoreBadge.id = "river-score-badge";
    scoreBadge.hidden = true;
    scoreBadge.innerHTML =
      '<span class="river-badge-icon" aria-hidden="true">🎣</span><span id="river-score-text">0 cá · 0đ</span>';
    toastHost.append(scoreBadge);

    const rewardToast = document.createElement("aside");
    rewardToast.id = "river-reward-toast";
    rewardToast.hidden = true;
    rewardToast.setAttribute("role", "status");
    toastHost.append(rewardToast);

    const promptEl = document.createElement("section");
    promptEl.id = "river-rental-prompt";
    promptEl.hidden = true;
    promptEl.setAttribute("role", "dialog");
    promptEl.setAttribute("aria-live", "polite");
    promptEl.innerHTML = `
      <div class="river-prompt-head">
        <span class="river-prompt-icon" id="river-prompt-icon">🎣</span>
        <div>
          <strong id="river-prompt-title">Thuê cần câu cá</strong>
          <p id="river-prompt-desc"></p>
        </div>
      </div>
      <div class="river-prompt-actions">
        <button type="button" id="river-accept-btn" class="river-btn river-btn-primary">Đồng ý [G]</button>
        <button type="button" id="river-decline-btn" class="river-btn river-btn-ghost">Để sau</button>
      </div>
    `;
    host.append(promptEl);

    const fishingEl = document.createElement("section");
    fishingEl.id = "fishing-minigame";
    fishingEl.hidden = true;
    fishingEl.innerHTML = `
      <div class="fishing-head">
        <div>
          <span class="fishing-kicker">Bờ sông Bia Quốc Học</span>
          <strong>🎣 Câu cá sông Hương</strong>
        </div>
        <button type="button" id="fishing-exit-btn" class="river-btn river-btn-ghost">Đứng dậy · Trả cần [Esc]</button>
      </div>
      <div class="fishing-status-row">
        <span id="fishing-phase-badge" class="fishing-phase-badge">Sẵn sàng</span>
        <span id="fishing-species-label" class="fishing-species-label">Chưa có cá</span>
      </div>
      <p id="fishing-feedback" class="fishing-feedback"></p>
      <div class="fishing-meter-group">
        <div class="fishing-bar" aria-label="Thanh canh nhịp kéo cần">
          <div id="fishing-sweetspot" class="fishing-sweetspot"></div>
          <div id="fishing-cursor" class="fishing-cursor"></div>
        </div>
        <div class="fishing-progress-track">
          <div id="fishing-progress-fill" class="fishing-progress-fill"></div>
        </div>
      </div>
      <div class="fishing-actions">
        <button type="button" id="fishing-action-btn" class="river-btn river-btn-primary">Quăng cần [Space]</button>
      </div>
    `;
    host.append(fishingEl);

    const boatEl = document.createElement("section");
    boatEl.id = "boat-controls-bar";
    boatEl.hidden = true;
    boatEl.innerHTML = `
      <div class="boat-bar-info">
        <strong id="boat-bar-title">🦢 Đạp vịt sông Hương</strong>
        <span id="boat-bar-sub">0 / 90m (+15đ)</span>
      </div>
      <div class="boat-bar-actions">
        <button type="button" id="boat-return-dock-btn" class="river-btn river-btn-primary" hidden>Trả thuyền tại bến [G]</button>
        <button type="button" id="boat-quick-exit-btn" class="river-btn river-btn-ghost">Lên bờ nhanh</button>
      </div>
    `;
    host.append(boatEl);

    this.ui = {
      scoreBadge,
      scoreText: scoreBadge.querySelector("#river-score-text"),
      rewardToast,
      promptEl,
      promptIcon: promptEl.querySelector("#river-prompt-icon"),
      promptTitle: promptEl.querySelector("#river-prompt-title"),
      promptDesc: promptEl.querySelector("#river-prompt-desc"),
      acceptBtn: promptEl.querySelector("#river-accept-btn"),
      declineBtn: promptEl.querySelector("#river-decline-btn"),
      fishingEl,
      phaseBadge: fishingEl.querySelector("#fishing-phase-badge"),
      speciesLabel: fishingEl.querySelector("#fishing-species-label"),
      feedback: fishingEl.querySelector("#fishing-feedback"),
      sweetspot: fishingEl.querySelector("#fishing-sweetspot"),
      cursor: fishingEl.querySelector("#fishing-cursor"),
      progressFill: fishingEl.querySelector("#fishing-progress-fill"),
      actionBtn: fishingEl.querySelector("#fishing-action-btn"),
      exitFishingBtn: fishingEl.querySelector("#fishing-exit-btn"),
      boatEl,
      boatTitle: boatEl.querySelector("#boat-bar-title"),
      boatSub: boatEl.querySelector("#boat-bar-sub"),
      boatReturnBtn: boatEl.querySelector("#boat-return-dock-btn"),
      boatQuickExitBtn: boatEl.querySelector("#boat-quick-exit-btn"),
    };

    this.ui.acceptBtn.addEventListener("click", () => this.acceptPendingPrompt());
    this.ui.declineBtn.addEventListener("click", () => this.declinePendingPrompt());
    this.ui.actionBtn.addEventListener("click", () => this.handleSpaceAction());
    this.ui.exitFishingBtn.addEventListener("click", () => this.exitFishing());
    this.ui.boatReturnBtn.addEventListener("click", () => this.exitBoat(true));
    this.ui.boatQuickExitBtn.addEventListener("click", () => this.exitBoat(false));
  }

  getOccupiedBoatSet() {
    const occupied = new Set(this.remoteOccupiedBoats);
    if (this.mode === "boating" && this.activeBoatIndex >= 0) {
      occupied.add(this.activeBoatIndex);
    }
    return occupied;
  }

  syncDockOccupancy() {
    const fp = this.game.world?.fountainPark;
    if (!fp?.setOccupiedBoats) return;
    fp.setOccupiedBoats(this.getOccupiedBoatSet());
  }

  onServerSnapshot(snapshot, selfId) {
    const occupied = new Set();
    const players = snapshot?.players || [];
    for (const p of players) {
      if (!p || !p.connected || p.region !== "quoc-hoc") continue;
      if (p.id === selfId) {
        if (Number.isFinite(p.riverScore)) {
          this.riverScore = Math.max(this.riverScore, p.riverScore);
        }
        if (Number.isFinite(p.fishCount)) {
          this.fishCount = Math.max(this.fishCount, p.fishCount);
        }
        if (p.stance === "boat" && this.mode === "boating") {
          const srvIdx = cleanBoatIndex(p.boatIndex, "boat");
          if (srvIdx >= 0 && srvIdx !== this.activeBoatIndex) {
            this.activeBoatIndex = srvIdx;
            this.game.bike.setBoat?.(srvIdx);
          }
        }
      } else if (p.stance === "boat") {
        const idx = cleanBoatIndex(p.boatIndex, "boat");
        if (idx >= 0) occupied.add(idx);
      }
    }
    this.remoteOccupiedBoats = occupied;
    this.syncDockOccupancy();
    this.refreshScoreBadge();
  }

  onServerEvent(event) {
    if (!event || event.event !== "river_reward") return;
    if (Number.isFinite(event.riverScore)) this.riverScore = event.riverScore;
    if (Number.isFinite(event.fishCount)) this.fishCount = event.fishCount;
    this.showRewardToast(
      `+${event.points || 0}đ · ${event.label || "Hoạt động sông Hương"}`,
    );
    this.refreshScoreBadge();
  }

  restoreOnlineBoat(player) {
    if (!player || player.region !== "quoc-hoc" || player.stance !== "boat") {
      return;
    }
    const idx = cleanBoatIndex(player.boatIndex, "boat");
    if (idx < 0) return;
    const dock = this.game.world?.fountainPark?.pedalDock;
    this.mode = "boating";
    this.activeBoatIndex = idx;
    this.returnLandPose = dock?.pierReturnPos
      ? { ...dock.pierReturnPos, heading: this.game.bike.motion.heading }
      : { x: 480, z: -498, y: 0.24, heading: 0 };
    this.game.bike.setActivityStance("boat", { boatIndex: idx });
    this.syncDockOccupancy();
    this.game.syncMode?.();
    this.refreshPanels();
  }

  handleServerRejectBoat(pose) {
    if (this.mode !== "boating") return;
    this.mode = null;
    this.activeBoatIndex = -1;
    this.game.bike.setActivityStance(null);
    if (Number.isFinite(pose?.x) && Number.isFinite(pose?.z)) {
      this.game.bike.position.set(
        pose.x,
        this.game.world.groundAt(pose.x, pose.z, pose.y),
        pose.z,
      );
    }
    this.syncDockOccupancy();
    this.game.syncMode?.();
    this.refreshPanels();
  }

  findAvailableBoatIndex(nearPos) {
    const dock = this.game.world?.fountainPark?.pedalDock;
    const boats = dock?.boats || [];
    const occupied = this.remoteOccupiedBoats;
    let bestIdx = -1;
    let bestDist = Infinity;
    for (const b of boats) {
      if (occupied.has(b.index)) continue;
      const d = nearPos
        ? Math.hypot(nearPos.x - b.x, nearPos.z - b.z)
        : 0;
      if (d < bestDist) {
        bestDist = d;
        bestIdx = b.index;
      }
    }
    return bestIdx;
  }

  getAvailableBoatCount() {
    const dock = this.game.world?.fountainPark?.pedalDock;
    const total = dock?.boats?.length || 6;
    return Math.max(0, total - this.remoteOccupiedBoats.size);
  }

  detectNearbyRental() {
    const world = this.game.world;
    if (!world || world.region?.id !== "quoc-hoc") return null;
    const pos = this.game.bike.position;

    const fishSpot = world.biaPark?.fishingSpot;
    if (fishSpot) {
      const distVendor = Math.hypot(
        pos.x - fishSpot.vendorPos.x,
        pos.z - fishSpot.vendorPos.z,
      );
      if (
        distVendor <= 5.5 ||
        fishSpot.isNearDeckEdge?.(pos.x, pos.z, 4.2)
      ) {
        return { kind: "fishing" };
      }
    }

    const dock = world.fountainPark?.pedalDock;
    if (dock) {
      const distVendor = Math.hypot(
        pos.x - dock.vendorPos.x,
        pos.z - dock.vendorPos.z,
      );
      const distPier = Math.hypot(
        pos.x - dock.pierReturnPos.x,
        pos.z - dock.pierReturnPos.z,
      );
      const nearAnyBoat = dock.boats?.some(
        (b) => Math.hypot(pos.x - b.x, pos.z - b.z) <= 6.2,
      );
      if (distVendor <= 6.0 || distPier <= 4.8 || nearAnyBoat) {
        return {
          kind: "boat",
          availableCount: this.getAvailableBoatCount(),
        };
      }
    }
    return null;
  }

  acceptPendingPrompt() {
    if (!this.pendingPrompt) return false;
    const kind = this.pendingPrompt.kind;
    this.pendingPrompt = null;
    if (kind === "fishing") return this.enterFishing();
    if (kind === "boat") return this.enterBoat();
    return false;
  }

  declinePendingPrompt() {
    if (!this.pendingPrompt) return;
    this.declinedKind = this.pendingPrompt.kind;
    this.declinedUntil = (this.game.elapsed || 0) + 8;
    this.pendingPrompt = null;
    this.refreshPanels();
  }

  enterFishing() {
    const fishSpot = this.game.world?.biaPark?.fishingSpot;
    if (!fishSpot) return false;
    const bike = this.game.bike;
    this.returnLandPose = {
      x: bike.position.x,
      y: bike.position.y,
      z: bike.position.z,
      heading: bike.motion.heading,
    };
    const seat = fishSpot.seatAtWorld(bike.position.x, bike.position.z);
    this.seatPose = seat;
    this.mode = "fishing";
    this.fishing.reset();
    bike.position.set(seat.x, seat.y, seat.z);
    bike.motion.heading = seat.heading;
    bike.rotation.y = seat.heading;
    bike.motion.speed = 0;
    bike.motion.lean = 0;
    bike.setActivityStance("fish", { fishState: "idle" });
    this.game.cameraYaw = seat.heading;
    this.game.input?.reset?.();
    this.game.syncMode?.();
    this.refreshPanels();
    return true;
  }

  exitFishing() {
    if (this.mode !== "fishing") return false;
    this.mode = null;
    this.fishing.reset();
    const bike = this.game.bike;
    bike.setActivityStance(null);
    if (this.seatPose) {
      // Step 1.2m back inland on deck from the rim so the player never stays on water edge
      const backX =
        this.seatPose.x - Math.sin(this.seatPose.heading) * 1.3;
      const backZ =
        this.seatPose.z - Math.cos(this.seatPose.heading) * 1.3;
      if (this.game.world?.canRide?.(backX, backZ, this.seatPose.y)) {
        bike.position.set(
          backX,
          this.game.world.groundAt(backX, backZ, this.seatPose.y),
          backZ,
        );
      } else if (this.returnLandPose) {
        bike.position.set(
          this.returnLandPose.x,
          this.returnLandPose.y,
          this.returnLandPose.z,
        );
      }
    }
    this.seatPose = null;
    this.declinedKind = "fishing";
    this.declinedUntil = (this.game.elapsed || 0) + 4;
    this.game.syncMode?.();
    this.refreshPanels();
    return true;
  }

  findSafeBoatSpawn(spec, dock, boatIndex) {
    const world = this.game.world;
    const candidates = [
      { x: spec.x, z: spec.z, heading: spec.yaw },
      {
        x: spec.x - Math.sin(spec.yaw) * 1.4,
        z: spec.z - Math.cos(spec.yaw) * 1.4,
        heading: spec.yaw,
      },
      {
        x: dock.dockWaterPos.x,
        z: dock.dockWaterPos.z,
        heading: dock.dockWaterPos.heading,
      },
    ];
    for (let step = 1; step <= 6; step++) {
      const dist = step * 1.4;
      candidates.push({
        x: dock.dockWaterPos.x - Math.sin(dock.dockWaterPos.heading) * dist,
        z: dock.dockWaterPos.z - Math.cos(dock.dockWaterPos.heading) * dist,
        heading: dock.dockWaterPos.heading,
      });
    }
    for (const c of candidates) {
      if (world?.canBoat?.(c.x, c.z, boatIndex)) return c;
    }
    return {
      x: dock.dockWaterPos.x,
      z: dock.dockWaterPos.z,
      heading: dock.dockWaterPos.heading,
    };
  }

  enterBoat() {
    const dock = this.game.world?.fountainPark?.pedalDock;
    if (!dock) return false;
    const idx = this.findAvailableBoatIndex(this.game.bike.position);
    if (idx < 0) {
      this.showRewardToast("Hiện cả 6 thuyền vịt đều đang có người đạp!");
      return false;
    }
    const spec = dock.boats[idx];
    const spawn = this.findSafeBoatSpawn(spec, dock, idx);
    this.returnLandPose = {
      ...dock.pierReturnPos,
      heading: this.game.bike.motion.heading,
    };
    this.mode = "boating";
    this.activeBoatIndex = idx;
    this.cruiseDistance = 0;
    this.nearReturnDock = false;
    const bike = this.game.bike;
    bike.position.set(
      spawn.x,
      this.game.world.riverSurfaceAt?.(spawn.x, spawn.z, this.game.elapsed || 0) ??
        0.03,
      spawn.z,
    );
    bike.motion.heading = spawn.heading;
    bike.rotation.y = spawn.heading;
    bike.motion.speed = 0;
    bike.motion.lean = 0;
    bike.setActivityStance("boat", { boatIndex: idx });
    this.game.cameraYaw = spawn.heading;
    this.game.input?.reset?.();
    this.syncDockOccupancy();
    this.game.audio?.playBoatBell?.();
    this.game.syncMode?.();
    this.refreshPanels();
    return true;
  }

  exitBoat(requireDockCheck = false) {
    if (this.mode !== "boating") return false;
    if (requireDockCheck && !this.nearReturnDock) return false;
    const dock = this.game.world?.fountainPark?.pedalDock;
    const land = dock?.pierReturnPos || this.returnLandPose;
    this.mode = null;
    this.activeBoatIndex = -1;
    this.nearReturnDock = false;
    const bike = this.game.bike;
    bike.setActivityStance(null);
    if (land) {
      const y = this.game.world?.groundAt?.(land.x, land.z, land.y) ?? land.y ?? 0.22;
      bike.position.set(land.x, y, land.z);
      bike.motion.speed = 0;
    }
    this.declinedKind = "boat";
    this.declinedUntil = (this.game.elapsed || 0) + 4;
    this.syncDockOccupancy();
    this.game.syncMode?.();
    this.refreshPanels();
    return true;
  }

  handleKeyG() {
    if (this.pendingPrompt) {
      return this.acceptPendingPrompt();
    }
    if (this.mode === "boating" && this.nearReturnDock) {
      return this.exitBoat(true);
    }
    return false;
  }

  handleSpaceAction() {
    if (this.mode !== "fishing") return false;
    const res = this.fishing.pullReel();
    if (res.action === "cast") {
      this.game.audio?.playWaterSplash?.();
    } else if (res.action === "hooked" || res.action === "hit") {
      this.game.audio?.playFishBiteAlert?.();
    } else if (res.action === "caught") {
      this.game.audio?.playFishCatchFanfare?.();
      this.awardFishCatch(res.species);
    }
    this.refreshFishingUi();
    return true;
  }

  handleEscape() {
    if (this.mode === "fishing") {
      return this.exitFishing();
    }
    if (this.pendingPrompt) {
      this.declinePendingPrompt();
      return true;
    }
    return false;
  }

  awardFishCatch(species) {
    const spec = species || FISH_SPECIES[0];
    this.fishCount += 1;
    this.riverScore += spec.points;
    this.showRewardToast(`+${spec.points}đ · Bắt được ${spec.title}!`);
    this.refreshScoreBadge();
    if (this.game.online) {
      this.game.online.sendModeAction("river_reward", {
        kind: "fish_catch",
        speciesId: spec.id,
      });
    }
  }

  awardBoatCruise() {
    this.riverScore += 15;
    this.showRewardToast("+15đ · Du ngoạn trên sông Hương!");
    this.game.audio?.playBoatBell?.();
    this.refreshScoreBadge();
    if (this.game.online) {
      this.game.online.sendModeAction("river_reward", {
        kind: "boat_cruise",
      });
    }
  }

  stepPhysics(dt, { throttle = 0, steer = 0, brake = false, speedMultiplier = 1 } = {}) {
    const bike = this.game.bike;
    if (this.mode === "fishing") {
      if (this.seatPose) {
        bike.position.set(this.seatPose.x, this.seatPose.y, this.seatPose.z);
        bike.motion.heading = this.seatPose.heading;
        bike.rotation.y = this.seatPose.heading;
        bike.rotation.z = 0;
      }
      bike.motion.speed = 0;
      const fishState =
        this.fishing.phase === "reeling" || this.fishing.phase === "bite"
          ? "reel"
          : this.fishing.phase === "waiting"
            ? "wait"
            : "idle";
      bike.update(dt, 0, 0, false, {
        stance: "fish",
        poseOnly: true,
        fishState,
      });
      return true;
    }

    if (this.mode === "boating") {
      const world = this.game.world;
      const maxFwd = 6.8 * speedMultiplier;
      const maxRev = -2.2;
      let speed = bike.motion.speed || 0;
      if (brake) {
        const drop = Math.min(Math.abs(speed), 8.0 * dt);
        speed -= Math.sign(speed) * drop;
      } else if (Math.abs(throttle) > 0.05) {
        const target = throttle > 0 ? maxFwd * throttle : Math.abs(maxRev) * throttle;
        const accel = throttle > 0 ? 5.8 * speedMultiplier : 4.2;
        speed += Math.sign(target - speed) * Math.min(Math.abs(target - speed), accel * dt);
      } else {
        const drag = Math.min(Math.abs(speed), 2.4 * dt);
        speed -= Math.sign(speed) * drag;
      }
      speed = Math.max(maxRev, Math.min(maxFwd, speed));

      const turnSign = speed < -0.25 ? -1 : 1;
      const heading = wrapAngle(
        bike.motion.heading + steer * 1.65 * turnSign * dt,
      );
      bike.motion.heading = heading;
      bike.motion.speed = speed;
      bike.motion.steering = steer;
      bike.motion.lean =
        -steer * 0.08 +
        Math.sin((this.game.elapsed || 0) * 2.1 + this.activeBoatIndex) * 0.032;

      const oldX = bike.position.x;
      const oldZ = bike.position.z;
      const nextX = oldX + Math.sin(heading) * speed * dt;
      const nextZ = oldZ + Math.cos(heading) * speed * dt;

      if (world?.canBoat?.(nextX, nextZ, this.activeBoatIndex)) {
        bike.position.x = nextX;
        bike.position.z = nextZ;
      } else if (world?.canBoat?.(nextX, oldZ, this.activeBoatIndex)) {
        bike.position.x = nextX;
        bike.position.z = oldZ;
        bike.motion.speed *= 0.72;
      } else if (world?.canBoat?.(oldX, nextZ, this.activeBoatIndex)) {
        bike.position.x = oldX;
        bike.position.z = nextZ;
        bike.motion.speed *= 0.72;
      } else {
        bike.position.x = oldX;
        bike.position.z = oldZ;
        bike.motion.speed = 0;
      }

      bike.position.y =
        world?.riverSurfaceAt?.(
          bike.position.x,
          bike.position.z,
          this.game.elapsed || 0,
        ) ?? 0.03;
      bike.rotation.y = heading;
      bike.rotation.z = bike.motion.lean;

      bike.update(dt, throttle, steer, brake, {
        stance: "boat",
        boatIndex: this.activeBoatIndex,
        poseOnly: true,
      });

      const moved = Math.hypot(bike.position.x - oldX, bike.position.z - oldZ);
      if (moved > 0 && moved < 2.0) {
        this.cruiseDistance += moved;
        if (this.cruiseDistance >= 90) {
          this.cruiseDistance -= 90;
          this.awardBoatCruise();
        }
      }
      return true;
    }

    return false;
  }

  update(dt, elapsed) {
    if (this.ui?.rewardToast && elapsed > this.toastUntil) {
      this.ui.rewardToast.hidden = true;
    }
    this.syncDockOccupancy();

    if (this.mode === "fishing") {
      const ev = this.fishing.step(dt);
      if (ev.bitten) this.game.audio?.playFishBiteAlert?.();
      if (ev.escaped) this.game.audio?.playWaterSplash?.();
      this.refreshFishingUi();
      return;
    }

    if (this.mode === "boating") {
      const dock = this.game.world?.fountainPark?.pedalDock;
      if (dock) {
        const d = Math.hypot(
          this.game.bike.position.x - dock.pierReturnPos.x,
          this.game.bike.position.z - dock.pierReturnPos.z,
        );
        this.nearReturnDock = d <= 9.5;
      } else {
        this.nearReturnDock = false;
      }
      this.refreshBoatUi();
      return;
    }

    const near = this.detectNearbyRental();
    if (
      near &&
      !(this.declinedKind === near.kind && elapsed < this.declinedUntil)
    ) {
      if (
        !this.pendingPrompt ||
        this.pendingPrompt.kind !== near.kind ||
        this.pendingPrompt.availableCount !== near.availableCount
      ) {
        this.pendingPrompt = near;
        this.refreshPanels();
      }
    } else if (this.pendingPrompt) {
      this.pendingPrompt = null;
      this.refreshPanels();
    }
    this.refreshScoreBadge();
  }

  showRewardToast(text) {
    if (!this.ui?.rewardToast) return;
    this.ui.rewardToast.textContent = text;
    this.ui.rewardToast.hidden = false;
    this.toastUntil = (this.game.elapsed || 0) + 3.8;
  }

  refreshScoreBadge() {
    if (!this.ui?.scoreBadge) return;
    const inQuocHoc = this.game.world?.region?.id === "quoc-hoc";
    this.ui.scoreBadge.hidden = !(inQuocHoc || this.riverScore > 0);
    if (this.ui.scoreText) {
      this.ui.scoreText.textContent = `${this.fishCount} cá · ${this.riverScore}đ sông`;
    }
  }

  refreshFishingUi() {
    if (!this.ui?.fishingEl) return;
    const f = this.fishing;
    this.ui.fishingEl.hidden = this.mode !== "fishing";
    if (this.mode !== "fishing") return;

    const phaseMap = {
      ready: "Sẵn sàng",
      waiting: "Đang chờ...",
      bite: "CÁ CẮN!",
      reeling: "Đang kéo",
      caught: "Trúng lớn!",
      escaped: "Sẩy mất",
    };
    this.ui.phaseBadge.textContent = phaseMap[f.phase] || f.phase;
    this.ui.phaseBadge.dataset.phase = f.phase;
    this.ui.speciesLabel.textContent = f.species
      ? `${f.species.title} (+${f.species.points}đ)`
      : "Thả câu bên Bia Quốc Học";
    this.ui.feedback.textContent = f.lastFeedback;

    const leftPct = Math.max(0, (f.targetCenter - f.targetWidth / 2) * 100);
    const widthPct = Math.min(100 - leftPct, f.targetWidth * 100);
    this.ui.sweetspot.style.left = `${leftPct.toFixed(1)}%`;
    this.ui.sweetspot.style.width = `${widthPct.toFixed(1)}%`;
    this.ui.cursor.style.left = `${(f.cursor * 100).toFixed(1)}%`;
    this.ui.progressFill.style.width = `${Math.round(f.progress * 100)}%`;

    if (f.phase === "ready" || f.phase === "caught" || f.phase === "escaped") {
      this.ui.actionBtn.textContent = "Quăng cần [Space]";
    } else if (f.phase === "waiting") {
      this.ui.actionBtn.textContent = "Đang chờ cá cắn câu…";
    } else if (f.phase === "bite") {
      this.ui.actionBtn.textContent = "GIẬT CẦN NGAY! [Space]";
    } else {
      this.ui.actionBtn.textContent = "Kéo nhịp trong vùng xanh [Space]";
    }
  }

  refreshBoatUi() {
    if (!this.ui?.boatEl) return;
    this.ui.boatEl.hidden = this.mode !== "boating";
    if (this.mode !== "boating") return;
    const dock = this.game.world?.fountainPark?.pedalDock;
    const spec = dock?.boats?.[this.activeBoatIndex];
    this.ui.boatTitle.textContent = `🦢 ${spec?.label || "Vịt Sông Hương"} · Đang đạp vịt`;
    const remain = Math.round(this.cruiseDistance);
    this.ui.boatSub.textContent = this.nearReturnDock
      ? `Đã cập bến! Nhấn [G] để trả thuyền`
      : `Hành trình: ${remain} / 90m (+15đ) · WASD để lái`;
    this.ui.boatReturnBtn.hidden = !this.nearReturnDock;
  }

  refreshPanels() {
    this.refreshScoreBadge();
    if (!this.ui) return;

    if (this.pendingPrompt && !this.mode) {
      this.ui.promptEl.hidden = false;
      if (this.pendingPrompt.kind === "fishing") {
        this.ui.promptIcon.textContent = "🎣";
        this.ui.promptTitle.textContent = "Thuê cần câu cá bên sông Hương?";
        this.ui.promptDesc.textContent =
          "Ngồi dọc sàn gỗ Bia Quốc Học, câu các loài cá sông Hương để tích thêm điểm thưởng.";
      } else {
        const avail = this.pendingPrompt.availableCount ?? 6;
        this.ui.promptIcon.textContent = "🦢";
        this.ui.promptTitle.textContent = `Thuê xe đạp vịt sông Hương? (${avail}/6 sẵn sàng)`;
        this.ui.promptDesc.textContent =
          "Đạp vịt dạo mát trên sông Hương, thưởng +15đ mỗi 90m và nghe Ca Huế vọng từ xa.";
      }
      this.ui.acceptBtn.disabled =
        this.pendingPrompt.kind === "boat" &&
        (this.pendingPrompt.availableCount ?? 0) <= 0;
    } else {
      this.ui.promptEl.hidden = true;
    }

    this.refreshFishingUi();
    this.refreshBoatUi();
  }

  reset() {
    const wasActive = this.isActive();
    this.mode = null;
    this.activeBoatIndex = -1;
    this.pendingPrompt = null;
    this.seatPose = null;
    this.returnLandPose = null;
    this.nearReturnDock = false;
    this.cruiseDistance = 0;
    this.fishing.reset();
    if (wasActive && this.game.bike) {
      this.game.bike.setActivityStance(null);
    }
    this.syncDockOccupancy();
    this.refreshPanels();
  }
}
