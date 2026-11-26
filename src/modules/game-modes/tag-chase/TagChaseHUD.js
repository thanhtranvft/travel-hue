import * as THREE from "three";
import { bindMultiTouchAction } from "../../../core/input/TouchControls.js";
import { EMOTE_LIST, PARTY_ITEM_LIST } from "./constants.js";

function formatClock(ms) {
  const sec = Math.max(0, Math.ceil((ms || 0) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const ITEM_EMOJI = {
  "non-la-shield": "👒",
  "perfume-wind": "💨",
  "salt-coffee": "☕",
};

export class TagChaseHUD {
  constructor(game, { onUsePartyItem, onSendEmote } = {}) {
    this.game = game;
    this.onUsePartyItem = onUsePartyItem;
    this.onSendEmote = onSendEmote;
    this.mounted = false;
    this.toastUntil = 0;
    this.radarPool = [];
    this._projVec = new THREE.Vector3();
    this.boardCollapsed = false;
    this.emotesOpen = false;

    if (typeof document === "undefined") return;
    const host = document.querySelector("#app");
    if (!host) return;
    this.mounted = true;

    this.radarLayer = document.createElement("div");
    this.radarLayer.id = "tag-chase-radar";
    this.radarLayer.setAttribute("aria-hidden", "true");

    this.topbar = document.createElement("aside");
    this.topbar.id = "tag-chase-topbar";
    this.topbar.innerHTML = `
      <div class="tc-top-row">
        <span class="tc-role-pill" id="tc-role-pill">🏃 Người Chạy</span>
        <strong class="tc-timer" id="tc-timer">Chờ bạn (1/2)</strong>
        <span class="tc-score" id="tc-score">0đ</span>
      </div>
      <div class="tc-meta-row" id="tc-meta-row">
        <div class="tc-sub-row" id="tc-hotspot-row" hidden></div>
        <div class="tc-coop-row" id="tc-coop-row" hidden></div>
        <div class="tc-icon-actions" id="tc-icon-actions">
          <button type="button" id="tc-culture-toggle" aria-expanded="false" aria-label="Đọc về địa danh" title="Đọc về địa danh">
            <span class="tc-culture-icon" aria-hidden="true">📖</span>
            <span class="tc-culture-label">Đọc về địa danh</span>
          </button>
        </div>
      </div>
    `;

    this.board = document.createElement("aside");
    this.board.id = "tag-chase-board";
    this.board.innerHTML = `
      <button type="button" class="tc-board-toggle" id="tc-board-toggle" aria-expanded="true">
        <span>🏅 Bảng điểm</span>
        <span class="tc-board-caret">▾</span>
      </button>
      <ol class="tc-board-list" id="tc-board-list"></ol>
    `;

    this.partyBar = document.createElement("div");
    this.partyBar.id = "tag-party-bar";
    this.partyBar.setAttribute("role", "group");
    this.partyBar.setAttribute("aria-label", "Vật phẩm Rượt bắt");
    this.partyBar.innerHTML = `
      <div class="tc-buff-pills" id="tc-buff-pills"></div>
      <div class="tc-party-slots">
        ${PARTY_ITEM_LIST.map(
          (item) => `
            <button type="button" class="tc-party-slot" data-item="${item.id}" disabled aria-disabled="true" title="${esc(item.name)}: ${esc(item.description)} [${item.key}]">
              <span class="tc-party-icon">${ITEM_EMOJI[item.id] || "✨"}</span>
              <span class="tc-party-label">${esc(item.shortName)}</span>
              <span class="tc-party-count">0</span>
              <kbd class="tc-party-key">${item.key}</kbd>
            </button>
          `,
        ).join("")}
      </div>
    `;

    this.emoteBar = document.createElement("div");
    this.emoteBar.id = "tag-emote-bar";
    this.emoteBar.innerHTML = `
      <button type="button" class="tc-emote-toggle" id="tc-emote-toggle" aria-expanded="false" title="Biểu cảm nhanh">💬</button>
      <div class="tc-emote-drawer" id="tc-emote-drawer" hidden>
        ${EMOTE_LIST.map(
          (e) =>
            `<button type="button" class="tc-emote-btn" data-emote="${esc(e.id)}" title="${esc(e.text)}">${esc(e.short)}</button>`,
        ).join("")}
      </div>
    `;

    this.toast = document.createElement("aside");
    this.toast.id = "tag-action-toast";
    this.toast.setAttribute("role", "status");
    this.toast.hidden = true;

    this.roundModal = document.createElement("aside");
    this.roundModal.id = "tag-round-modal";
    this.roundModal.hidden = true;

    const topHost = document.querySelector("#hud-top-center") || host;
    topHost.prepend(this.topbar);
    const boostBanner = topHost.querySelector("#boost-banner");
    if (boostBanner) {
      boostBanner.after(this.toast);
    } else {
      topHost.append(this.toast);
    }

    host.append(
      this.radarLayer,
      this.board,
      this.partyBar,
      this.emoteBar,
      this.roundModal,
    );

    this.rolePillEl = this.topbar.querySelector("#tc-role-pill");
    this.timerEl = this.topbar.querySelector("#tc-timer");
    this.scoreEl = this.topbar.querySelector("#tc-score");
    this.hotspotEl = this.topbar.querySelector("#tc-hotspot-row");
    this.coopEl = this.topbar.querySelector("#tc-coop-row");
    this.iconActionsEl = this.topbar.querySelector("#tc-icon-actions");
    const existingRiverBadge = document.querySelector("#river-score-badge");
    if (existingRiverBadge && this.iconActionsEl) {
      this.iconActionsEl.append(existingRiverBadge);
    }
    this.cultureToggle = this.topbar.querySelector("#tc-culture-toggle");
    this.cultureToggle.addEventListener("click", () => {
      const open = document.body.classList.toggle("tag-culture-open");
      this.cultureToggle.setAttribute("aria-expanded", String(open));
    });
    this.boardListEl = this.board.querySelector("#tc-board-list");
    this.boardToggleEl = this.board.querySelector("#tc-board-toggle");
    this.buffPillsEl = this.partyBar.querySelector("#tc-buff-pills");
    this.emoteDrawerEl = this.emoteBar.querySelector("#tc-emote-drawer");
    this.emoteToggleEl = this.emoteBar.querySelector("#tc-emote-toggle");

    this.boardToggleEl.addEventListener("click", () => {
      this.boardCollapsed = !this.boardCollapsed;
      this.boardListEl.hidden = this.boardCollapsed;
      this.boardToggleEl.setAttribute(
        "aria-expanded",
        String(!this.boardCollapsed),
      );
      this.board.classList.toggle("is-collapsed", this.boardCollapsed);
    });

    this.emoteToggleEl.addEventListener("click", () => {
      this.emotesOpen = !this.emotesOpen;
      this.emoteDrawerEl.hidden = !this.emotesOpen;
      this.emoteToggleEl.setAttribute("aria-expanded", String(this.emotesOpen));
    });

    this.partyButtons = new Map();
    this.partyBar.querySelectorAll("[data-item]").forEach((btn) => {
      const id = btn.dataset.item;
      this.partyButtons.set(id, btn);
      bindMultiTouchAction(btn, () => {
        this.onUsePartyItem?.(id);
      });
    });

    this.emoteBar.querySelectorAll("[data-emote]").forEach((btn) => {
      bindMultiTouchAction(btn, () => {
        this.onSendEmote?.(btn.dataset.emote);
        this.emotesOpen = false;
        this.emoteDrawerEl.hidden = true;
        this.emoteToggleEl.setAttribute("aria-expanded", "false");
      });
    });
  }

  showToast(text, durationMs = 2800, tone = "info") {
    if (!this.mounted || !text) return;
    this.toast.textContent = text;
    this.toast.dataset.tone = tone;
    this.toast.hidden = false;
    this.toastUntil = Date.now() + durationMs;
  }

  updateInventory(inventory, { stunned = false } = {}) {
    if (!this.mounted) return;
    for (const [id, btn] of this.partyButtons) {
      const count = Math.max(0, Number(inventory?.[id] || 0));
      const usable = count > 0 && (!stunned || id === "salt-coffee");
      btn.disabled = !usable;
      btn.setAttribute("aria-disabled", String(!usable));
      btn.classList.toggle("has-item", count > 0);
      btn.classList.toggle("is-ready", usable);
      const badge = btn.querySelector(".tc-party-count");
      if (badge) badge.textContent = String(count);
    }
  }

  updateState(
    tagState,
    selfStatus,
    selfId,
    { shieldMs = 0, slowMs = 0, coffeeMs = 0 } = {},
  ) {
    if (!this.mounted) return;
    const now = Date.now();
    if (!this.toast.hidden && now >= this.toastUntil) {
      this.toast.hidden = true;
    }

    const brandEl = document.querySelector(".brand");
    const topCenterEl = document.querySelector("#hud-top-center");
    if (brandEl && typeof brandEl.getBoundingClientRect === "function") {
      const rect = brandEl.getBoundingClientRect();
      if (rect.height > 0) {
        let boardTop = rect.bottom + 8;
        if (
          topCenterEl &&
          typeof topCenterEl.getBoundingClientRect === "function"
        ) {
          const tcRect = topCenterEl.getBoundingClientRect();
          const stackedBelowBrand =
            tcRect.height > 0 &&
            tcRect.top >= rect.bottom - 4 &&
            tcRect.left < 185;
          if (stackedBelowBrand) {
            boardTop = Math.max(boardTop, tcRect.bottom + 8);
          }
        }
        this.board.style.top = `${Math.round(boardTop)}px`;
      }
    }

    const phase = tagState?.phase || "waiting";
    const stage = phase === "playing" ? tagState?.stage || "chase" : phase;
    document.body.dataset.tagStage = stage;
    this.partyBar.hidden = stage !== "chase";
    this.cultureToggle.hidden = stage === "chase";
    if (this.previousStage !== stage) {
      document.body.classList.remove("tag-culture-open");
      this.cultureToggle.setAttribute("aria-expanded", "false");
      this.previousStage = stage;
    }
    const isHunter = selfStatus?.role === "hunter";
    this.rolePillEl.textContent = isHunter ? "🔥 Người Săn" : "🏃 Người Chạy";
    if (stage !== "chase")
      this.rolePillEl.textContent =
        stage === "cooperation" ? "🤝 Đồng hành" : "🗺️ Khám phá Huế";
    this.rolePillEl.classList.toggle(
      "is-hunter",
      isHunter && stage === "chase",
    );

    this.scoreEl.textContent = `${selfStatus?.score || 0}đ`;

    if (phase === "waiting") {
      const count = tagState?.playerCount || 1;
      this.timerEl.textContent = `Chờ bạn (${count}/2)`;
    } else if (phase === "countdown") {
      const sec = Math.max(1, Math.ceil((tagState?.remainingMs || 0) / 1000));
      this.timerEl.textContent = `Chuẩn bị ${sec}s`;
    } else if (phase === "intermission") {
      const sec = Math.max(1, Math.ceil((tagState?.remainingMs || 0) / 1000));
      this.timerEl.textContent = `Ván mới ${sec}s`;
    } else {
      this.timerEl.textContent = `${stage === "chase" ? "Tranh tài" : stage === "cooperation" ? "Hợp tác" : "Khám phá"} ${formatClock(tagState?.stageRemainingMs)}`;
    }

    // Hotspot
    const hs = tagState?.hotspot;
    const playerPos = this.game?.bike?.position;
    if (hs && phase === "playing") {
      const dist = playerPos
        ? Math.round(Math.hypot(playerPos.x - hs.x, playerPos.z - hs.z))
        : null;
      const inZone = dist !== null && dist <= (hs.radius || 28);
      this.hotspotEl.hidden = false;
      this.hotspotEl.classList.toggle("is-inside", inZone);
      this.hotspotEl.textContent = inZone
        ? `📍 ${hs.title}${stage === "chase" && !isHunter ? " · x2 điểm khi đang chạy trốn" : " · Điểm hẹn"}`
        : `📍 ${hs.title}${dist !== null ? ` · ${dist}m` : ""}`;
    } else {
      this.hotspotEl.hidden = true;
    }

    // Co-op
    const coop = tagState?.coop;
    if (coop?.active) {
      this.coopEl.hidden = false;
      const icon = coop.itemKind === "lotus" ? "🪷" : "🏮";
      const sec = Math.max(0, Math.ceil((coop.remainingMs || 0) / 1000));
      this.coopEl.textContent = `${icon} ${coop.title}: ${coop.collected}/${coop.target} · ${sec}s`;
    } else {
      this.coopEl.hidden = true;
    }

    // Buff pills
    const buffs = [];
    if (shieldMs > 0)
      buffs.push(
        `<span class="tc-buff is-shield">👒 Khiên ${Math.ceil(shieldMs / 1000)}s</span>`,
      );
    if (coffeeMs > 0)
      buffs.push(
        `<span class="tc-buff is-coffee">☕ +25% ${Math.ceil(coffeeMs / 1000)}s</span>`,
      );
    if (slowMs > 0)
      buffs.push(
        `<span class="tc-buff is-slow">💨 Chậm ${Math.ceil(slowMs / 1000)}s</span>`,
      );
    this.buffPillsEl.innerHTML = buffs.join("");

    // Scoreboard top 3
    const board = (tagState?.leaderboard || []).slice(0, 3);
    this.boardListEl.innerHTML = board.length
      ? board
          .map(
            (row, idx) => `
              <li class="${row.id === selfId ? "is-self" : ""}">
                <span class="tc-b-rank">${idx + 1}.</span>
                <span class="tc-b-role">${stage === "chase" ? (row.role === "hunter" ? "🔥" : "🏃") : stage === "cooperation" ? "🤝" : "🗺️"}</span>
                <span class="tc-b-name">${esc(row.name)}</span>
                <strong class="tc-b-score">${row.score}đ</strong>
              </li>
            `,
          )
          .join("")
      : `<li class="tc-b-empty">Chưa có điểm</li>`;

    // End-of-round awards modal
    if (
      phase === "intermission" &&
      Array.isArray(tagState?.awards) &&
      tagState.awards.length
    ) {
      const top3 = (tagState.leaderboard || []).slice(0, 3);
      this.roundModal.hidden = false;
      this.roundModal.innerHTML = `
        <h3>🏁 Tổng kết Ván ${tagState.roundNumber || 1}</h3>
        <div class="tc-awards-grid">
          ${tagState.awards
            .map(
              (a) => `
                <div class="tc-award-card">
                  <span class="tc-award-icon">${esc(a.icon)}</span>
                  <div>
                    <strong>${esc(a.title)}</strong>
                    <small>${esc(a.playerName)} · ${esc(a.detail)}</small>
                  </div>
                </div>
              `,
            )
            .join("")}
        </div>
        ${
          top3.length
            ? `<div class="tc-modal-top">${top3
                .map(
                  (r, i) =>
                    `<span>#${i + 1} ${esc(r.name)} (${r.score}đ)</span>`,
                )
                .join("")}</div>`
            : ""
        }
      `;
    } else {
      this.roundModal.hidden = true;
    }
  }

  updateRadar(players, selfId) {
    if (!this.mounted || !this.game?.camera || !this.game?.bike) return;
    const camera = this.game.camera;
    const bikePos = this.game.bike.position;
    camera.updateMatrixWorld?.();

    const w = typeof window !== "undefined" ? window.innerWidth : 1024;
    const h = typeof window !== "undefined" ? window.innerHeight : 768;
    const padX = Math.max(36, Math.min(64, w * 0.06));
    const padY = Math.max(54, Math.min(84, h * 0.1));

    const offscreen = [];
    for (const p of players || []) {
      if (!p || p.id === selfId || !p.connected || !p.ready) continue;
      if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
      const dist = Math.hypot(p.x - bikePos.x, p.z - bikePos.z);
      if (dist < 4) continue;

      this._projVec.set(p.x, (p.y || 0.2) + 1.2, p.z);
      this._projVec.project(camera);

      const behind = this._projVec.z > 1;
      let nx = behind ? -this._projVec.x : this._projVec.x;
      let ny = behind ? -this._projVec.y : this._projVec.y;

      const onScreen = !behind && Math.abs(nx) <= 0.88 && Math.abs(ny) <= 0.82;
      if (onScreen) continue;

      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;

      const halfW = w / 2 - padX;
      const halfH = h / 2 - padY;
      const scale = Math.min(
        Math.abs(nx) > 1e-4 ? halfW / Math.abs(nx) : Infinity,
        Math.abs(ny) > 1e-4 ? halfH / Math.abs(ny) : Infinity,
      );
      const sx = w / 2 + nx * scale;
      const sy = h / 2 - ny * scale;
      const deg = (Math.atan2(-ny, nx) * 180) / Math.PI;

      offscreen.push({
        id: p.id,
        role: p.modeData?.role || "runner",
        dist: Math.round(dist),
        sx,
        sy,
        deg,
      });
    }

    while (this.radarPool.length < offscreen.length) {
      const node = document.createElement("div");
      node.className = "tc-radar-ping";
      node.innerHTML = `<i class="tc-radar-arrow">➤</i><span></span>`;
      this.radarLayer.append(node);
      this.radarPool.push(node);
    }

    for (let i = 0; i < this.radarPool.length; i++) {
      const node = this.radarPool[i];
      const item = offscreen[i];
      if (!item) {
        node.hidden = true;
        continue;
      }
      node.hidden = false;
      node.classList.toggle("is-hunter", item.role === "hunter");
      node.style.transform = `translate(${item.sx}px, ${item.sy}px) translate(-50%, -50%)`;
      node.querySelector(".tc-radar-arrow").style.transform =
        `rotate(${item.deg}deg)`;
      node.querySelector("span").textContent = `${item.dist}m`;
    }
  }

  dispose() {
    if (!this.mounted) return;
    delete document.body.dataset.tagStage;
    document.body.classList.remove("tag-culture-open");
    const topHost =
      document.querySelector("#hud-top-center") || document.querySelector("#app");
    const riverBadge = this.topbar.querySelector("#river-score-badge");
    if (riverBadge && topHost) topHost.append(riverBadge);
    this.radarLayer.remove();
    this.topbar.remove();
    this.board.remove();
    this.partyBar.remove();
    this.emoteBar.remove();
    this.toast.remove();
    this.roundModal.remove();
    this.radarPool = [];
    this.partyButtons.clear();
    this.mounted = false;
  }
}
