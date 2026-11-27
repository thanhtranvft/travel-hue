import {
  AVATAR_CATALOG,
  cleanAvatarId,
  cleanPlayerName,
  DEFAULT_AVATAR_ID,
} from "../core/network/protocol.js";
import {
  cleanMode,
  cleanTransport,
  isExploreModeEnabled,
} from "../core/network/sessionPersistence.js";
import {
  cleanGameModeId,
  DEFAULT_GAME_MODE_ID,
  getGameMode,
  getModesForRegion,
  regionSupportsSpecialModes,
  roomKeyFor,
} from "../modules/game-modes/registry.js";
import { enabledAreas } from "../app/catalog.js";
import config from "../data/online-config.json" with { type: "json" };

export const PLAYER_NAME_STORAGE_KEY = "hue-player-name";
export const PLAYER_AVATAR_STORAGE_KEY = "hue-player-avatar";

export function getSavedPlayerName(storage = globalThis.localStorage) {
  try {
    return cleanPlayerName(storage?.getItem(PLAYER_NAME_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

export function savePlayerName(name, storage = globalThis.localStorage) {
  const cleaned = cleanPlayerName(name);
  if (!cleaned) return "";
  try {
    storage?.setItem(PLAYER_NAME_STORAGE_KEY, cleaned);
  } catch {}
  return cleaned;
}

export function clearSavedPlayerName(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(PLAYER_NAME_STORAGE_KEY);
  } catch {}
}

export function getSavedAvatar(storage = globalThis.localStorage) {
  try {
    return cleanAvatarId(
      storage?.getItem(PLAYER_AVATAR_STORAGE_KEY) || DEFAULT_AVATAR_ID,
    );
  } catch {
    return DEFAULT_AVATAR_ID;
  }
}

export function saveAvatar(avatarId, storage = globalThis.localStorage) {
  const cleaned = cleanAvatarId(avatarId);
  try {
    storage?.setItem(PLAYER_AVATAR_STORAGE_KEY, cleaned);
  } catch {}
  return cleaned;
}

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

function safeAssetUrl(relativePath) {
  try {
    return new URL(relativePath, import.meta.url).href;
  } catch {
    return "";
  }
}

function chibiBadgeSvg(id) {
  const icons = {
    scholar: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M17 29V14Q32 0 47 14v15" fill="#191d25"/><path d="M18 15q14-9 28 0m-28 5q14-8 28 0" stroke="#55535c" fill="none" stroke-width="3"/><ellipse cx="32" cy="31" rx="15" ry="17" fill="#edc39e"/><path d="M20 29h10v7H20zm14 0h10v7H34z" fill="#15232d"/><path d="M30 31h4" stroke="#17191d" stroke-width="2"/><path d="M27 41q5 3 10 0" fill="none" stroke="#9c5c42" stroke-width="2"/><path d="M14 64V52q18-14 36 0v12" fill="#171b22"/><path d="M27 48v7h10v-7" fill="#393942"/></svg>`,
    "ao-dai-woman": `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M13 54V26Q14 7 32 7t19 19v28" fill="#201c20"/><ellipse cx="32" cy="29" rx="15" ry="18" fill="#ffe0c8"/><path d="M17 24Q21 8 34 11l14 13Q38 20 33 15q-7 9-16 9" fill="#201c20"/><path d="M21 29q4-3 8 0m6 0q4-3 8 0" stroke="#34232a" stroke-width="2" fill="none"/><path d="M27 39q5 4 10 0" stroke="#bf7174" stroke-width="2" fill="none"/><path d="M13 64V52l14-8v7h10v-7l14 8v12" fill="#fffaf0"/><path d="M33 51v13" stroke="#d8d7cf"/></svg>`,
    boy: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="30" r="18" fill="#ffd9be"/><path d="M13 28c0-13 9-20 19-20s19 7 19 20c-3-7-9-11-19-11s-16 4-19 11z" fill="#3a2820"/><path d="M22 14l4-6 6 5 6-5 4 6z" fill="#3a2820"/><circle cx="25" cy="31" r="3.4" fill="#2a1a12"/><circle cx="39" cy="31" r="3.4" fill="#2a1a12"/><circle cx="24" cy="29.8" r="1.2" fill="#fff"/><circle cx="38" cy="29.8" r="1.2" fill="#fff"/><path d="M26 39q6 5 12 0" stroke="#c94c4c" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M18 48h28v10H18z" fill="#f8fafc"/><path d="M24 48l8 10 8-10z" fill="#dc2f2f"/></svg>`,
    girl: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="14" cy="26" r="7" fill="#3b2318"/><circle cx="50" cy="26" r="7" fill="#3b2318"/><circle cx="15" cy="20" r="4" fill="#eb678e"/><circle cx="49" cy="20" r="4" fill="#eb678e"/><circle cx="32" cy="30" r="18" fill="#ffe0c8"/><path d="M14 28c1-13 9-20 18-20s17 7 18 20c-4-7-10-10-18-10s-14 3-18 10z" fill="#3b2318"/><circle cx="25" cy="31" r="3.4" fill="#2a1a12"/><circle cx="39" cy="31" r="3.4" fill="#2a1a12"/><circle cx="24" cy="29.8" r="1.2" fill="#fff"/><circle cx="38" cy="29.8" r="1.2" fill="#fff"/><path d="M27 39q5 4 10 0" stroke="#c94c4c" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M19 48h26v10H19z" fill="#f8fafc"/><path d="M24 48l8 9 8-9z" fill="#dc2f2f"/></svg>`,
    dog: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="14" cy="32" rx="6" ry="12" fill="#b97334" transform="rotate(14 14 32)"/><ellipse cx="50" cy="32" rx="6" ry="12" fill="#b97334" transform="rotate(-14 50 32)"/><circle cx="32" cy="32" r="18" fill="#f1b96b"/><ellipse cx="32" cy="39" rx="11" ry="8" fill="#fce5bd"/><circle cx="25" cy="28" r="3.2" fill="#241812"/><circle cx="39" cy="28" r="3.2" fill="#241812"/><circle cx="24" cy="27" r="1.1" fill="#fff"/><circle cx="38" cy="27" r="1.1" fill="#fff"/><ellipse cx="32" cy="35" rx="4" ry="2.8" fill="#282220"/><path d="M20 49h24v6H20z" fill="#d93636"/><circle cx="32" cy="54" r="3.5" fill="#ffd34e"/></svg>`,
    cat: `<svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="14,24 18,7 29,18" fill="#f5942c"/><polygon points="50,24 46,7 35,18" fill="#f5942c"/><polygon points="17,22 19,11 26,18" fill="#f6a6b2"/><polygon points="47,22 45,11 38,18" fill="#f6a6b2"/><circle cx="32" cy="33" r="18" fill="#f7a53e"/><rect x="30.5" y="16" width="3" height="6" rx="1.5" fill="#c96f1e"/><circle cx="25" cy="31" r="3.3" fill="#2a4518"/><circle cx="39" cy="31" r="3.3" fill="#2a4518"/><circle cx="24" cy="29.8" r="1.1" fill="#fff"/><circle cx="38" cy="29.8" r="1.1" fill="#fff"/><ellipse cx="32" cy="37" rx="3.4" ry="2.5" fill="#f07c86"/><path d="M13 36l9 2M13 40l9-1M51 36l-9 2M51 40l-9-1" stroke="#8a511c" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    cow: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 17c-2-6 1-10 5-7l3 5zM46 17c2-6-1-10-5-7l-3 5z" fill="#f4e6c8"/><ellipse cx="12" cy="27" rx="6" ry="3.5" fill="#9c5e2c" transform="rotate(-18 12 27)"/><ellipse cx="52" cy="27" rx="6" ry="3.5" fill="#9c5e2c" transform="rotate(18 52 27)"/><circle cx="32" cy="31" r="17" fill="#e6af5d"/><circle cx="24" cy="24" r="5" fill="#8a5228"/><ellipse cx="32" cy="39" rx="12" ry="7.5" fill="#fde9ca"/><circle cx="25" cy="28" r="3" fill="#241812"/><circle cx="39" cy="28" r="3" fill="#241812"/><circle cx="28" cy="38" r="1.8" fill="#eb9a9a"/><circle cx="36" cy="38" r="1.8" fill="#eb9a9a"/><circle cx="32" cy="54" r="4" fill="#ffd34e"/></svg>`,
    buffalo: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M18 22C9 19 6 10 14 7c-2 5 2 9 7 10zM46 22c9-3 12-12 4-15 2 5-2 9-7 10z" fill="#262a31"/><ellipse cx="12" cy="28" rx="6" ry="3.2" fill="#3a404a" transform="rotate(-15 12 28)"/><ellipse cx="52" cy="28" rx="6" ry="3.2" fill="#3a404a" transform="rotate(15 52 28)"/><circle cx="32" cy="32" r="17" fill="#48505b"/><ellipse cx="32" cy="40" rx="11" ry="7" fill="#333942"/><circle cx="25" cy="29" r="3" fill="#17191d"/><circle cx="39" cy="29" r="3" fill="#17191d"/><circle cx="24" cy="28" r="1.1" fill="#fff"/><circle cx="38" cy="28" r="1.1" fill="#fff"/><circle cx="28" cy="39" r="1.8" fill="#1b1e24"/><circle cx="36" cy="39" r="1.8" fill="#1b1e24"/></svg>`,
  };
  return icons[id] || icons.boy;
}

function areaArtwork(area) {
  const color = area.color || "#e7bd77";
  const photos = {
    "quoc-hoc": safeAssetUrl("../assets/bia quoc hoc hue.jpg"),
    "truong-tien": safeAssetUrl("../assets/cau truong tien.jpg"),
  };
  const svgs = {
    "quoc-hoc": `<svg viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="qhSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e4d55"/><stop offset="1" stop-color="#19332d"/></linearGradient></defs><rect width="120" height="76" fill="url(#qhSky)"/><path d="M0 58h120v18H0z" fill="#233f37"/><path d="M22 58V34l18-10 18 10v24z" fill="#9e3d39"/><path d="M35 58V43h10v15z" fill="#5e2320"/><path d="M68 58V39h30v19z" fill="#d9b97c"/><path d="M64 39l19-11 19 11z" fill="#8b332d"/><circle cx="96" cy="18" r="6" fill="#f7cb74" opacity=".85"/></svg>`,
    "south-bank": `<svg viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="sbSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#214c54"/><stop offset="1" stop-color="#163a35"/></linearGradient></defs><rect width="120" height="76" fill="url(#sbSky)"/><path d="M0 44c26-5 54 6 82 1 16-3 28-4 38-2v33H0z" fill="#1e5c6b"/><path d="M0 54h120v9H0z" fill="#b77d48"/><path d="M10 54v-5M28 54v-5M46 54v-5M64 54v-5M82 54v-5M100 54v-5" stroke="#edd29b" stroke-width="2"/><path d="M0 49h120" stroke="#f0d7a3" stroke-width="2"/><circle cx="90" cy="20" r="7" fill="#ffd47f" opacity=".82"/></svg>`,
    "truong-tien": `<svg viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="ttSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a435a"/><stop offset="1" stop-color="#19333a"/></linearGradient></defs><rect width="120" height="76" fill="url(#ttSky)"/><path d="M0 50h120v26H0z" fill="#1d4f63"/><path d="M0 47h120" stroke="#e8edf2" stroke-width="3"/><path d="M6 47q18-24 36 0q18-24 36 0q18-24 36 0" fill="none" stroke="#dbe5ee" stroke-width="2.6"/><circle cx="24" cy="19" r="6" fill="#ffcf77" opacity=".8"/></svg>`,
    "nguyen-chi-dieu": `<svg viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="ncdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#483b54"/><stop offset="1" stop-color="#1f3534"/></linearGradient></defs><rect width="120" height="76" fill="url(#ncdSky)"/><path d="M0 58h120v18H0z" fill="#2c3e3a"/><rect x="14" y="34" width="28" height="24" rx="2" fill="#e0b27c"/><rect x="48" y="25" width="26" height="33" rx="2" fill="#5d7f8b"/><rect x="80" y="18" width="24" height="40" rx="2" fill="#3a6073"/><path d="M84 25h16M84 32h16M84 39h16M84 46h16" stroke="#a6d6e8" stroke-width="2"/></svg>`,
    "quang-trung": `<svg viewBox="0 0 120 76" aria-hidden="true"><defs><linearGradient id="qtSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c485a"/><stop offset="1" stop-color="#1a3432"/></linearGradient></defs><rect width="120" height="76" fill="url(#qtSky)"/><path d="M0 58h120v18H0z" fill="#283d38"/><rect x="12" y="38" width="38" height="20" fill="#e4c37b"/><path d="M10 38l21-9 21 9z" fill="#9c4236"/><path d="M74 58V32l12-18 12 18v26z" fill="#c9bfa9"/><path d="M86 10v8M82 14h8" stroke="#ffe19e" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  };
  const photo = photos[area.id] || "";
  return `<span class="map-card-thumb" style="--area-accent:${escapeHtml(color)}">${svgs[area.id] || svgs["quoc-hoc"]}${
    photo
      ? `<img src="${escapeHtml(photo)}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`
      : ""
  }</span>`;
}

async function defaultFetchLobbySummary() {
  if (typeof fetch !== "function") return null;
  const controller =
    typeof AbortController === "function" ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), 2000) : null;
  try {
    const res = await fetch("/health", {
      cache: "no-store",
      signal: controller?.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === "object" ? data : null;
  } catch {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export function renderAvatarGrid(selectedId = DEFAULT_AVATAR_ID) {
  const active = cleanAvatarId(selectedId);
  return `<div class="avatar-grid" role="radiogroup" aria-label="Chọn nhân vật Chibi">${AVATAR_CATALOG.map(
    (a) =>
      `<button type="button" class="avatar-card" data-avatar="${a.id}" role="radio" aria-checked="${String(a.id === active)}" style="--avatar-accent:${a.accent}">
        <span class="avatar-icon">${chibiBadgeSvg(a.id)}</span>
        <span class="avatar-meta"><strong>${a.label}</strong><small>${a.subtitle}</small></span>
      </button>`,
  ).join("")}</div>`;
}

export function renderGameModePicker(
  regionId,
  selectedGameMode = DEFAULT_GAME_MODE_ID,
  roomCounts = {},
  maxPerRegion = 10,
) {
  const activeMode = cleanGameModeId(selectedGameMode, regionId);
  const modes = getModesForRegion(regionId, { includeUpcoming: true });
  const cards = modes
    .map((m) => {
      const rKey = roomKeyFor(regionId, m.id);
      const count = Number(roomCounts[rKey] || 0);
      const isUpcoming = Boolean(m.upcoming && !m.enabled);
      const isSelected = !isUpcoming && m.id === activeMode;
      const badgeText = isUpcoming
        ? "Sắp mở"
        : count >= maxPerRegion
          ? `Đầy ${count}/${maxPerRegion}`
          : `${count}/${maxPerRegion} người`;
      const badgeClass = isUpcoming
        ? "mode-occupancy is-soon"
        : "mode-occupancy";
      return `<button type="button" class="activity-card${isUpcoming ? " is-upcoming" : ""}" data-game-mode="${escapeHtml(m.id)}" role="radio" aria-checked="${String(isSelected)}" ${isUpcoming ? 'disabled aria-disabled="true"' : ""}>
        <span class="mode-card-head">
          <strong>${escapeHtml(m.title)}</strong>
          <span class="${badgeClass}" data-mode-occupancy="${escapeHtml(rKey)}">${badgeText}</span>
        </span>
        <span>${escapeHtml(m.description)}</span>
      </button>`;
    })
    .join("");
  const regionNote = regionSupportsSpecialModes(regionId)
    ? `<p class="mode-region-note">Map trọng điểm (01 &amp; 05) có tối đa 1–2 phòng chế độ đặc biệt · Bùa tốc độ bật mặc định trong mọi phòng.</p>`
    : `<p class="mode-region-note">Chế độ đặc biệt chỉ mở ở Map 01 &amp; Map 05 · Mọi chế độ đều có sẵn bùa tốc độ trên đường.</p>`;
  return `${cards}${regionNote}`;
}

export function renderGameModeRules(modeId) {
  const mode = getGameMode(modeId);
  const instructions = mode.lobbyInstructions?.length ? mode.lobbyInstructions : mode.instructions?.length ? mode.instructions : [
    "Tự do khám phá khu vực đã chọn, gặp gỡ người chơi, nghe âm thanh đường phố và tìm hiểu các địa danh Huế.",
    "WASD hoặc phím mũi tên để di chuyển; kéo chuột để xoay camera. Trên điện thoại dùng cần điều khiển bên trái và kéo vùng nhìn bên phải.",
    "Nhặt bùa tăng tốc trên đường, dùng phím 1–4 hoặc chạm biểu tượng. Đi chậm gần người đi bộ và xe cộ; mở Bản đồ để xem vị trí.",
  ];
  return `<h2 id="lobby-rules-heading">Luật chơi <span>· ${escapeHtml(mode.shortTitle)}</span></h2><ol class="lobby-rules-list">${instructions.map(text=>`<li>${escapeHtml(text)}</li>`).join("")}</ol>`;
}

export function chooseSession(
  previousName = "",
  onStart = () => {},
  options = {},
) {
  const areas =
    Array.isArray(options.areas) && options.areas.length
      ? options.areas
      : enabledAreas;
  const exploreAllowed = isExploreModeEnabled();
  const maxPerRegion = config.maxPlayersPerRegion || 10;
  const savedName = cleanPlayerName(previousName) || getSavedPlayerName();
  let editingName = !savedName;
  let selectedAvatar = cleanAvatarId(options.initialAvatar || getSavedAvatar());
  let selectedRegion =
    areas.find((a) => a.id === options.initialRegion)?.id ||
    areas[0]?.id ||
    "quoc-hoc";
  let selectedMode = cleanMode(options.initialMode || "online");
  let selectedGameMode = cleanGameModeId(
    options.initialGameMode || options.initialActivity || DEFAULT_GAME_MODE_ID,
    selectedRegion,
  );
  let selectedTransport = cleanTransport(options.initialTransport || "foot");
  const regionCounts = {};
  const roomCounts = {};

  const fetchSummary =
    typeof options.fetchLobbySummary === "function"
      ? options.fetchLobbySummary
      : defaultFetchLobbySummary;

  return new Promise((resolve) => {
    const overlay = document.createElement("section");
    overlay.className = "session-overlay";
    overlay.id = "session-entry";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute(
      "aria-label",
      "Trang chủ · Chọn khu vực, nhân vật và chế độ chơi",
    );

    overlay.innerHTML = `<form class="session-form lobby-shell" novalidate>
      <header class="lobby-header">
        <div class="lobby-title-group">
          <small class="lobby-kicker">HUẾ HERITAGE · ONLINE CITY</small>
          <h1>Chibi dạo phố Huế</h1>
          <p class="lobby-lead">Chọn khu vực, nhân vật và phương tiện trước khi vào map · Tối đa ${maxPerRegion} người mỗi khu vực</p>
        </div>
        <div class="lobby-identity">
          <div class="identity-saved" ${editingName ? "hidden" : ""}>
            <span class="identity-label">Tên người chơi</span>
            <div class="identity-saved-row">
              <strong id="saved-player-name">${escapeHtml(savedName)}</strong>
              <button type="button" id="edit-name-btn" class="identity-edit-btn">Đổi tên</button>
            </div>
          </div>
          <div class="identity-input-wrap" ${editingName ? "" : "hidden"}>
            <label for="player-name">Tên hiển thị của bạn</label>
            <input id="player-name" name="playerName" maxlength="36" autocomplete="nickname" placeholder="Nhập tên (1–18 ký tự)" value="${escapeHtml(savedName)}" required>
          </div>
        </div>
      </header>

      <div class="lobby-grid">
        <div class="lobby-main">
          <section class="lobby-section" aria-labelledby="lobby-maps-heading">
            <div class="lobby-section-head">
              <h2 id="lobby-maps-heading">1. Chọn map khu vực</h2>
              <span class="lobby-hint">Tối đa ${maxPerRegion} người / khu</span>
            </div>
            <div class="map-picker-grid" role="radiogroup" aria-label="Chọn khu vực">
              ${areas
                .map(
                  (area, idx) => `<button type="button" class="map-card" data-region="${escapeHtml(area.id)}" role="radio" aria-checked="${String(area.id === selectedRegion)}" style="--area-accent:${escapeHtml(area.color || "#e7bd77")}">
                  ${areaArtwork(area)}
                  <span class="map-card-body">
                    <span class="map-card-top">
                      <span class="map-card-index">0${idx + 1}</span>
                      <strong>${escapeHtml(area.title)}</strong>
                    </span>
                    <em class="map-card-sub">${escapeHtml(area.subtitle || "")}</em>
                    <span class="map-card-meta" data-region-count="${escapeHtml(area.id)}">0/${maxPerRegion} người · Sẵn sàng</span>
                  </span>
                </button>`,
                )
                .join("")}
            </div>
          </section>

          <section class="lobby-section" aria-labelledby="lobby-avatar-heading">
            <div class="lobby-section-head">
              <h2 id="lobby-avatar-heading">2. Nhân vật &amp; Phương tiện</h2>
              <div class="transport-switch" role="radiogroup" aria-label="Chọn phương tiện xuất phát">
                <button type="button" class="transport-btn" data-transport="foot" role="radio" aria-checked="${String(selectedTransport === "foot")}">🚶 Đi bộ</button>
                <button type="button" class="transport-btn" data-transport="bike" role="radio" aria-checked="${String(selectedTransport === "bike")}">🚲 Xe đạp</button>
              </div>
            </div>
            ${renderAvatarGrid(selectedAvatar)}
          </section>
        </div>

        <aside class="lobby-aside">
          <section class="lobby-section" aria-labelledby="lobby-mode-heading">
            <div class="lobby-section-head">
              <h2 id="lobby-mode-heading">3. Chế độ chơi</h2>
              <span class="lobby-hint" data-room-occupancy>Online · ${maxPerRegion} người/map</span>
            </div>
            ${
              exploreAllowed
                ? `<div class="mode-picker" role="radiogroup" aria-label="Chọn chế độ kết nối">
                    <button type="button" class="mode-card" data-mode="online" role="radio" aria-checked="${String(selectedMode === "online")}" ${config.enabled ? "" : "disabled"}>
                      <span class="mode-card-head">
                        <strong>Online · Phòng ${maxPerRegion} người/map</strong>
                        <span class="mode-occupancy" data-selected-map-occupancy>0/${maxPerRegion} người</span>
                      </span>
                      <span class="mode-card-desc">Gặp gỡ người chơi cùng map, săn bùa tốc độ và tương tác trực tiếp.</span>
                    </button>
                    <button type="button" class="mode-card" data-mode="explore" role="radio" aria-checked="${String(selectedMode === "explore")}">
                      <span class="mode-card-head">
                        <strong>Khám phá · Chơi đơn</strong>
                        <span class="mode-occupancy">Một mình</span>
                      </span>
                      <span class="mode-card-desc">Tự do dạo phố Huế và thử bùa tăng tốc một mình.</span>
                    </button>
                  </div>`
                : ""
            }
            <div class="activity-picker" id="game-mode-picker" role="radiogroup" aria-label="Chọn chế độ chơi">
              ${renderGameModePicker(selectedRegion, selectedGameMode, roomCounts, maxPerRegion)}
            </div>
          </section>

          <div class="lobby-launch">
            <p class="lobby-selection-summary" id="lobby-selection-summary"></p>
            <p id="entry-error" role="alert"></p>
            <button type="submit" class="lobby-cta">Vào Map Online</button>
            <p class="session-note">Vào game sẽ giữ nguyên khu vực, nhân vật và phương tiện đã chọn. Muốn đổi hãy nhấn “Về Trang chủ / Đổi chế độ”.</p>
          </div>
        </aside>
      </div>
      <section id="game-mode-rules" class="lobby-rules-footer" aria-labelledby="lobby-rules-heading"></section>
    </form>`;

    document.querySelector("#app").append(overlay);

    const form = overlay.querySelector("form");
    const input = overlay.querySelector("#player-name");
    const identitySavedEl = overlay.querySelector(".identity-saved");
    const identityInputWrapEl = overlay.querySelector(".identity-input-wrap");
    const editNameBtn = overlay.querySelector("#edit-name-btn");
    const errorEl = overlay.querySelector("#entry-error");
    const summaryEl = overlay.querySelector("#lobby-selection-summary");

    const avatarButtons = [...overlay.querySelectorAll("[data-avatar]")];
    const regionButtons = [...overlay.querySelectorAll("[data-region]")];
    const modeButtons = [...overlay.querySelectorAll("[data-mode]")];
    const transportButtons = [...overlay.querySelectorAll("[data-transport]")];
    const gameModePickerEl = overlay.querySelector("#game-mode-picker");
    let currentLimit = maxPerRegion;

    const bindGameModeButtons = () => {
      overlay.querySelectorAll("[data-game-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (btn.disabled) return;
          selectedGameMode = cleanGameModeId(
            btn.dataset.gameMode,
            selectedRegion,
          );
          errorEl.textContent = "";
          syncRadios();
        });
      });
    };

    const refreshModePicker = () => {
      selectedGameMode = cleanGameModeId(selectedGameMode, selectedRegion);
      if (gameModePickerEl) {
        gameModePickerEl.innerHTML = renderGameModePicker(
          selectedRegion,
          selectedGameMode,
          roomCounts,
          currentLimit,
        );
        bindGameModeButtons();
      }
    };

    const syncRadios = () => {
      selectedGameMode = cleanGameModeId(selectedGameMode, selectedRegion);
      const rulesEl = overlay.querySelector("#game-mode-rules");
      if (rulesEl && rulesEl.dataset.mode !== selectedGameMode) {
        rulesEl.innerHTML = renderGameModeRules(selectedGameMode);
        rulesEl.dataset.mode = selectedGameMode;
      }
      avatarButtons.forEach((btn) =>
        btn.setAttribute(
          "aria-checked",
          String(btn.dataset.avatar === selectedAvatar),
        ),
      );
      regionButtons.forEach((btn) =>
        btn.setAttribute(
          "aria-checked",
          String(btn.dataset.region === selectedRegion),
        ),
      );
      modeButtons.forEach((btn) =>
        btn.setAttribute(
          "aria-checked",
          String(btn.dataset.mode === selectedMode),
        ),
      );
      overlay.querySelectorAll("[data-game-mode]").forEach((btn) =>
        btn.setAttribute(
          "aria-checked",
          String(!btn.disabled && btn.dataset.gameMode === selectedGameMode),
        ),
      );
      transportButtons.forEach((btn) =>
        btn.setAttribute(
          "aria-checked",
          String(btn.dataset.transport === selectedTransport),
        ),
      );
      const areaTitle =
        areas.find((a) => a.id === selectedRegion)?.title || selectedRegion;
      const avatarTitle =
        AVATAR_CATALOG.find((a) => a.id === selectedAvatar)?.label ||
        selectedAvatar;
      const transportLabel =
        selectedTransport === "bike" ? "Xe đạp" : "Đi bộ";
      const modeTitle = getGameMode(selectedGameMode).shortTitle;
      const activeRoomKey = roomKeyFor(selectedRegion, selectedGameMode);
      const countInRoom = Number(
        roomCounts[activeRoomKey] ?? regionCounts[selectedRegion] ?? 0,
      );
      overlay
        .querySelectorAll("[data-selected-map-occupancy]")
        .forEach((el) => {
          el.textContent =
            countInRoom >= currentLimit
              ? `Đầy ${countInRoom}/${currentLimit}`
              : `${countInRoom}/${currentLimit} người`;
        });
      summaryEl.textContent = `${areaTitle} · ${modeTitle} · ${avatarTitle} · ${transportLabel}${
        exploreAllowed
          ? ` · ${selectedMode === "explore" ? "Chơi đơn" : "Online"}`
          : " · Online"
      }`;
    };

    bindGameModeButtons();
    syncRadios();

    editNameBtn?.addEventListener("click", () => {
      editingName = true;
      identitySavedEl.hidden = true;
      identityInputWrapEl.hidden = false;
      input?.focus();
      input?.select?.();
    });

    avatarButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedAvatar = cleanAvatarId(btn.dataset.avatar);
        syncRadios();
      }),
    );

    regionButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedRegion = btn.dataset.region;
        errorEl.textContent = "";
        refreshModePicker();
        syncRadios();
      }),
    );

    modeButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        if (btn.disabled) return;
        selectedMode = cleanMode(btn.dataset.mode);
        syncRadios();
      }),
    );

    transportButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        selectedTransport = cleanTransport(btn.dataset.transport);
        syncRadios();
      }),
    );

    let disposed = false;
    void Promise.resolve(fetchSummary()).then((summary) => {
      if (disposed || !summary || !overlay.isConnected) return;
      currentLimit = Number.isFinite(summary.limit)
        ? summary.limit
        : maxPerRegion;
      const occEl = overlay.querySelector("[data-room-occupancy]");
      if (occEl && Number.isFinite(summary.players)) {
        occEl.textContent = `${summary.players} người đang online`;
      }
      if (summary.rooms && typeof summary.rooms === "object") {
        for (const [k, v] of Object.entries(summary.rooms)) {
          roomCounts[k] = Number(v || 0);
        }
      }
      if (summary.regions && typeof summary.regions === "object") {
        for (const area of areas) {
          const count = Number(summary.regions[area.id] || 0);
          regionCounts[area.id] = count;
          if (!(area.id in roomCounts)) roomCounts[area.id] = count;
          const countEl = overlay.querySelector(
            `[data-region-count="${area.id}"]`,
          );
          if (countEl) {
            if (!regionSupportsSpecialModes(area.id) && count >= currentLimit) {
              countEl.textContent = `Đầy ${count}/${currentLimit} người`;
              countEl.classList.add("is-full");
              countEl.classList.remove("is-active");
            } else {
              countEl.textContent =
                count > 0
                  ? `${count} người đang ở khu này`
                  : `0/${currentLimit} người · Sẵn sàng`;
              countEl.classList.toggle("is-active", count > 0);
              countEl.classList.toggle(
                "is-full",
                !regionSupportsSpecialModes(area.id) && count >= currentLimit,
              );
            }
          }
        }
      }
      refreshModePicker();
      syncRadios();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = editingName
        ? cleanPlayerName(input?.value || "")
        : savedName || cleanPlayerName(input?.value || "");
      if (!name) {
        editingName = true;
        identitySavedEl.hidden = true;
        identityInputWrapEl.hidden = false;
        errorEl.textContent = "Hãy nhập tên hiển thị từ 1 đến 18 ký tự.";
        input?.focus();
        return;
      }
      const mode = exploreAllowed ? cleanMode(selectedMode) : "online";
      const gameMode = cleanGameModeId(selectedGameMode, selectedRegion);
      const activeRoomKey = roomKeyFor(selectedRegion, gameMode);
      if (
        mode === "online" &&
        Number(roomCounts[activeRoomKey] || 0) >= currentLimit
      ) {
        errorEl.textContent =
          "Phòng chơi này đã đủ 10 người. Hãy chọn khu vực hoặc chế độ khác.";
        return;
      }
      disposed = true;
      savePlayerName(name);
      saveAvatar(selectedAvatar);
      onStart();
      overlay.remove();
      resolve({
        name,
        mode,
        gameMode,
        avatar: selectedAvatar,
        region: selectedRegion,
        transportMode: selectedTransport,
        activity: gameMode,
      });
    });

    if (editingName) {
      input?.focus();
    } else {
      overlay.querySelector(".lobby-cta")?.focus();
    }
  });
}

export function createSessionPanel(session) {
  document.querySelector("#session-panel")?.remove();
  const panel = document.createElement("section");
  panel.id = "session-panel";
  panel.innerHTML =
    '<details><summary></summary><ul></ul></details><span class="connection-status" role="status"></span>';
  const summary = panel.querySelector("summary"),
    list = panel.querySelector("ul"),
    status = panel.querySelector(".connection-status");
  const modeTitle = getGameMode(
    session.gameMode || session.activity || DEFAULT_GAME_MODE_ID,
  ).shortTitle;
  summary.textContent =
    session.mode === "online"
      ? `${modeTitle} · Đang kết nối…`
      : `${session.name} · Khám phá`;
  document.querySelector(".utility-toolbar").append(panel);
  return {
    status(text) {
      status.textContent = text;
    },
    snapshot(message, selfId, areas) {
      const limit = Number.isFinite(message.limit) ? message.limit : 10;
      const label = getGameMode(
        message.gameMode || session.gameMode || DEFAULT_GAME_MODE_ID,
      ).shortTitle;
      summary.textContent = `${label} · ${message.players.filter((p) => p.connected).length}/${limit} người`;
      list.replaceChildren(
        ...message.players.map((p) => {
          const li = document.createElement("li");
          li.textContent = `${p.name}${p.id === selfId ? " (bạn)" : ""} · ${areas.find((a) => a.id === p.region)?.title || p.region}${p.connected ? "" : " · Mất kết nối"}`;
          return li;
        }),
      );
    },
    remove() {
      panel.remove();
    },
  };
}
