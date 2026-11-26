import "./styles.css";
import "./mobile.css";
import "./touch-layout.css";
import "./ui/session.css";
import "./modules/game-modes/tag-chase/tag-chase.css";
import "./core/world/river-activities.css";
import "./ui/capture-share.css";
import {
  chooseSession,
  createSessionPanel,
  clearSavedPlayerName,
  getSavedAvatar,
} from "./ui/SessionUI.js";
import { cleanAvatarId } from "./core/network/protocol.js";
import {
  cleanMode,
  clearActiveSession,
  loadActiveSession,
  markSessionInactive,
  saveActiveSession,
} from "./core/network/sessionPersistence.js";
import {
  cleanGameModeId,
  DEFAULT_GAME_MODE_ID,
} from "./modules/game-modes/registry.js";
import { setRiderIdentity } from "./core/vehicle/RiderIdentity.js";
import { CityAudio } from "./core/audio/CityAudio.js";
import { GamePresenter as Game } from "./app/GamePresenter.js";
import { geoDistricts as districts } from "./modules/areas/AreaModel.js";
import {
  initializeMobileUI,
  initializeAudioUI,
  initializeLandscapeMode,
  isMobileViewport,
} from "./ui/MobileUI.js";
import { initializeCaptureShareUI } from "./ui/CaptureShareUI.js";
import { bindMultiTouchAction } from "./core/input/TouchControls.js";
import { loadGeography } from "./modules/areas/AreaModel.js";
import { areaIsEnabled, defaultArea } from "./app/catalog.js";

document.querySelector("#app").innerHTML = `
  <canvas id="game"></canvas>
  <div id="speed-vignette" aria-hidden="true"></div>
  <div id="scene-loading" role="status">Đang chuẩn bị hành trình bên sông Hương…</div><div id="asset-notice" role="status" hidden>Một số cảnh vật chưa tải được. Đang dùng mô hình dự phòng.</div>
  <div class="hud">
    <div class="topbar">
      <div class="brand"><div><small>Huế · City Tour</small><h1 id="brand-area-title">${defaultArea?.title || "Huế · City Tour"}</h1><div class="map-note">Tọa độ OSM · kiến trúc ước lượng</div></div><div class="brand-account" id="brand-account" hidden><span id="current-user-name"></span><div class="brand-actions"><button id="home-btn" type="button" title="Về Trang chủ / Đổi chế độ">Về Trang chủ / Đổi chế độ</button><button id="logout-btn" type="button" title="Đăng xuất để đổi tên">Đăng xuất</button></div></div></div>
      <div id="hud-top-center" class="hud-top-center">
        <aside id="boost-banner" role="status" hidden><span class="boost-label">⚡ +10% TỐC ĐỘ</span><i class="boost-track"><b class="boost-fill"></b></i></aside>
        <aside id="charm-toast" role="status" hidden>✨ Vật phẩm bùa tăng tốc vừa làm mới ngẫu nhiên trên bản đồ!</aside>
        <aside id="collision-toast" role="alert" hidden><strong>⚠ Va chạm giao thông!</strong><p id="collision-message"></p><span>Space để phanh · Quan sát và đi bên phải</span></aside>
        <article class="card" id="landmark-card"><span>Di sản bên đường</span><h2></h2><p></p></article>
      </div>
      <div class="topbar-right">
        <div class="topbar-controls-row">
          <div class="utility-buttons"><button id="audio-toggle" type="button" aria-pressed="false" title="Bật / Tắt nhạc">♫</button><button id="landscape-toggle" type="button" aria-pressed="false" title="Chơi ngang">↔</button></div>
          <div class="tour-toolbar"><button id="map-toggle" type="button" title="Hiện / Ẩn bản đồ khu vực [M]" aria-pressed="false" aria-expanded="false" aria-controls="map-panel">🗺 Bản đồ</button><button id="reset" title="Về đầu khu vực [R]">↺ Về đầu</button></div>
        </div>
        <div class="utility-toolbar">
          <div id="sound-settings" hidden><label>Âm lượng <input id="audio-volume" type="range" min="0" max="100" value="45" aria-label="Âm lượng game"></label><span id="sound-location">Giai điệu bên sông Hương</span></div>
          <span id="audio-status" role="status"></span>
        </div>
      </div>
    </div>
    <div class="hud-spacer" aria-hidden="true"></div>
    <div class="bottom">
      <section class="map-panel" id="map-panel" hidden><div class="map-panel-head"><button id="expand-map" title="Mở rộng / Thu nhỏ bản đồ">BẢN ĐỒ KHU VỰC ↗</button><button id="close-map" type="button" title="Ẩn bản đồ [M]" aria-label="Ẩn bản đồ">✕</button></div><div class="map-area-title" id="map-area-title">Khoa Quốc tế → Tràng Tiền</div><canvas id="minimap" width="480" height="340" aria-label="Bản đồ khu vực và tọa độ di chuyển"></canvas><div class="map-coords" id="map-coords">16.45898°N · 107.58096°E</div><div class="map-local-coords" id="map-local-coords">X: 313 m · Z: -283 m</div><a id="open-osm" href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">Đối chiếu OSM ↗</a></section>
      <div class="touch-controls"><div class="thumbstick" id="move-stick" role="group" aria-label="Cần lái bên trái: kéo nhẹ để đi bộ, kéo hết mức để chạy, hoặc rẽ"><span class="stick-arrows" aria-hidden="true">＋</span><span id="stick-thumb" aria-hidden="true"></span><span class="touch-caption">ĐI / RẼ</span></div></div>
      <div class="charm-bar" id="charm-bar" role="group" aria-label="Bùa tăng tốc đã nhặt">
        <button type="button" class="charm-slot" data-tier="10" disabled aria-disabled="true" title="Dùng Bùa +10% tốc độ [1]"><svg class="charm-ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="charm-track" cx="22" cy="22" r="20"/><circle class="charm-arc" cx="22" cy="22" r="20"/></svg><span class="charm-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 13h11l-4-4m4 4-4 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="charm-pct">+10%</span><span class="charm-count">0</span><kbd class="charm-key">1</kbd></button>
        <button type="button" class="charm-slot" data-tier="20" disabled aria-disabled="true" title="Dùng Bùa +20% tốc độ [2]"><svg class="charm-ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="charm-track" cx="22" cy="22" r="20"/><circle class="charm-arc" cx="22" cy="22" r="20"/></svg><span class="charm-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 16l5-4-5-4m7 8l5-4-5-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="charm-pct">+20%</span><span class="charm-count">0</span><kbd class="charm-key">2</kbd></button>
        <button type="button" class="charm-slot" data-tier="30" disabled aria-disabled="true" title="Dùng Bùa +30% tốc độ [3]"><svg class="charm-ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="charm-track" cx="22" cy="22" r="20"/><circle class="charm-arc" cx="22" cy="22" r="20"/></svg><span class="charm-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 3L5 14h6l-1 7 9-11h-6z" fill="currentColor"/></svg></span><span class="charm-pct">+30%</span><span class="charm-count">0</span><kbd class="charm-key">3</kbd></button>
        <button type="button" class="charm-slot" data-tier="100" disabled aria-disabled="true" title="Dùng Bùa +100% siêu tốc [4]"><svg class="charm-ring" viewBox="0 0 44 44" aria-hidden="true"><circle class="charm-track" cx="22" cy="22" r="20"/><circle class="charm-arc" cx="22" cy="22" r="20"/></svg><span class="charm-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2L4 14h6l-2 8 12-13h-6z" fill="currentColor"/></svg></span><span class="charm-pct">+100%</span><span class="charm-count">0</span><kbd class="charm-key">4</kbd></button>
      </div>
      <div class="ride-panel"><div class="status"><strong id="destination">Quốc Học · Lê Lợi</strong><div id="distance">Đang đứng · Vẫy tay</div><div class="progress"><i id="progress"></i></div></div><div class="speed"><strong id="speed">0</strong><span>KM/H</span></div><div class="guide"><b>WASD</b> đi/lái · <b>Shift</b> chạy · <b>1-4</b> bùa tốc độ · <b>M</b> bản đồ</div></div>
    </div>
  </div>
  <aside id="orientation-hint" role="status" hidden><p id="orientation-message"></p><button id="dismiss-orientation">Đã hiểu</button></aside><a class="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors · ODbL</a>`;

const audio = new CityAudio();
const landscape = initializeLandscapeMode();
let autoLandscapeDone = false;
const primeAudio = () => {
  void audio
    .setEnabled(audio.enabled)
    .catch(() => audio.onStatus("Chạm nút Âm thanh để phát tiếng."));
};
const onStart = () => {
  primeAudio();
  if (!autoLandscapeDone && isMobileViewport()) {
    autoLandscapeDone = true;
    void landscape.enter({ showHintOnFailure: true });
  }
};

const savedSession = loadActiveSession();
const resolveAreaId = (candidate) =>
  candidate && areaIsEnabled(candidate) ? candidate : defaultArea?.id;

let initialSession = null;
if (defaultArea) {
  if (savedSession?.active && savedSession.name) {
    const region = resolveAreaId(savedSession.region);
    const gameMode = cleanGameModeId(
      savedSession.gameMode || savedSession.activity || DEFAULT_GAME_MODE_ID,
      region,
    );
    initialSession = {
      ...savedSession,
      mode: cleanMode(savedSession.mode),
      region,
      gameMode,
      activity: gameMode,
      restored: true,
    };
  } else {
    const initRegion = resolveAreaId(savedSession?.region);
    const initGameMode = cleanGameModeId(
      savedSession?.gameMode || savedSession?.activity || DEFAULT_GAME_MODE_ID,
      initRegion,
    );
    const chosen = await chooseSession("", onStart, {
      areas: districts,
      initialRegion: initRegion,
      initialMode: cleanMode(savedSession?.mode || "online"),
      initialTransport: savedSession?.transportMode || "foot",
      initialGameMode: initGameMode,
      initialActivity: initGameMode,
      initialAvatar: savedSession?.avatar || getSavedAvatar(),
    });
    const region = resolveAreaId(chosen.region);
    const gameMode = cleanGameModeId(
      chosen.gameMode || chosen.activity || DEFAULT_GAME_MODE_ID,
      region,
    );
    initialSession = {
      ...chosen,
      mode: cleanMode(chosen.mode),
      region,
      gameMode,
      activity: gameMode,
      onlineToken: null,
      pose: null,
      restored: false,
    };
    saveActiveSession({
      active: true,
      name: initialSession.name,
      mode: initialSession.mode,
      gameMode: initialSession.gameMode,
      activity: initialSession.gameMode,
      avatar: initialSession.avatar,
      region: initialSession.region,
      transportMode: initialSession.transportMode,
      onlineToken: null,
      pose: null,
    });
  }
  await loadGeography(initialSession.region || defaultArea.id);
}

export const game = defaultArea
  ? await Game.create(document.querySelector("#game"), { audio })
  : null;
if (game) {
  let session = initialSession;
  let activePanel = null;
  const userAccountEl = document.querySelector("#brand-account");
  const userNameEl = document.querySelector("#current-user-name");

  const persistGameSnapshot = () => {
    if (!game.sessionActive || !session) return;
    const isExplore = session.mode === "explore";
    const charmState = isExplore ? game.charms?.exportState?.() : null;
    const region = game.world?.region?.id || session.region;
    const gameMode = cleanGameModeId(
      session.gameMode || game.gameMode?.modeId || DEFAULT_GAME_MODE_ID,
      region,
    );
    saveActiveSession({
      active: true,
      name: session.name,
      mode: session.mode,
      gameMode,
      activity: gameMode,
      avatar: game.bike.avatarId,
      region,
      transportMode: game.bike.transportMode,
      pose: {
        x: game.bike.position.x,
        y: game.bike.position.y,
        z: game.bike.position.z,
        heading: game.bike.motion.heading,
      },
      ...(charmState
        ? {
            inventory: charmState.inventory,
            activeBoost: charmState.activeBoost,
          }
        : {}),
    });
  };

  const openSessionPicker = async (previousName, { cleared = false } = {}) => {
    if (!cleared) {
      persistGameSnapshot();
      markSessionInactive();
    } else {
      clearActiveSession();
    }
    game.sessionActive = false;
    game.input.reset();
    game.bike.motion.speed = 0;
    game.online?.dispose();
    game.online = null;
    game.gameMode?.dispose?.();
    activePanel?.remove();
    activePanel = null;
    document.querySelector(".hud").inert = true;
    const currentRegion = game.world?.region?.id || defaultArea?.id;
    const currentGameMode = cleanGameModeId(
      session?.gameMode || game.gameMode?.modeId || DEFAULT_GAME_MODE_ID,
      currentRegion,
    );
    const selected = await chooseSession(previousName, primeAudio, {
      areas: districts,
      initialRegion: currentRegion,
      initialMode: cleanMode(session?.mode || "online"),
      initialTransport: game.bike?.transportMode || "foot",
      initialGameMode: currentGameMode,
      initialActivity: currentGameMode,
      initialAvatar: game.bike?.avatarId || getSavedAvatar(),
    });
    document.querySelector(".hud").inert = false;
    const targetRegion = resolveAreaId(selected.region);
    const nextGameMode = cleanGameModeId(
      selected.gameMode || selected.activity || DEFAULT_GAME_MODE_ID,
      targetRegion,
    );
    const nextSession = {
      ...selected,
      mode: cleanMode(selected.mode),
      region: targetRegion,
      gameMode: nextGameMode,
      activity: nextGameMode,
      onlineToken: null,
      pose: null,
      restored: false,
    };
    saveActiveSession({
      active: true,
      name: nextSession.name,
      mode: nextSession.mode,
      gameMode: nextSession.gameMode,
      activity: nextSession.gameMode,
      avatar: nextSession.avatar,
      region: nextSession.region,
      transportMode: nextSession.transportMode,
      onlineToken: null,
      pose: null,
    });
    if (targetRegion && targetRegion !== game.world?.region?.id) {
      await game.changeRegion(targetRegion);
    }
    await activateSession(nextSession);
    persistGameSnapshot();
  };

  const activateSession = async (next) => {
    const activeRegion = next.region || game.world?.region?.id;
    const activeGameMode = cleanGameModeId(
      next.gameMode || next.activity || DEFAULT_GAME_MODE_ID,
      activeRegion,
    );
    session = {
      ...next,
      gameMode: activeGameMode,
      activity: activeGameMode,
    };
    game.session = session;
    const avatarId = cleanAvatarId(session.avatar || getSavedAvatar());
    game.setAvatar(avatarId);
    game.bike.setTransportMode(session.transportMode || "foot");
    game.gameMode?.activate?.(activeGameMode, activeRegion);
    game.syncMode();
    userNameEl.textContent = session.name;
    userAccountEl.hidden = false;
    setRiderIdentity(game.bike, session.name);
    const panel = createSessionPanel(session, () =>
      openSessionPicker(session.name),
    );
    activePanel = panel;
    if (session.mode === "online") {
      const { OnlineSession } = await import("./core/network/OnlineSession.js");
      game.online = new OnlineSession(game, session.name, panel, districts, {
        token: session.onlineToken || null,
        gameMode: activeGameMode,
        onToken: (tok) => {
          session.onlineToken = tok;
          saveActiveSession({ onlineToken: tok });
        },
      });
    } else {
      game.charms?.onRegionChanged?.();
      if (session.restored) {
        game.charms?.restoreState?.({
          inventory: session.inventory,
          activeBoost: session.activeBoost,
        });
        if (session.pose && session.region === game.world?.region?.id) {
          game.setPose(
            session.pose.x,
            session.pose.z,
            session.pose.heading,
            session.pose.y,
          );
        }
      }
    }
    game.input.reset();
    game.sessionActive = true;
    game.updateHud();
  };

  document.querySelector("#home-btn").addEventListener("click", async () => {
    await openSessionPicker(session.name);
  });
  document.querySelector("#logout-btn").addEventListener("click", async () => {
    clearSavedPlayerName();
    userAccountEl.hidden = true;
    await openSessionPicker("", { cleared: true });
  });

  await activateSession(initialSession);
  persistGameSnapshot();
  game.start();

  setInterval(persistGameSnapshot, 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) persistGameSnapshot();
  });
  addEventListener("pagehide", persistGameSnapshot);

  document.querySelector("#reset").addEventListener("click", () => {
    game.reset();
    persistGameSnapshot();
  });
  const mapPanelEl = document.querySelector("#map-panel");
  const mapToggleBtn = document.querySelector("#map-toggle");
  const setMapOpen = (open) => {
    mapPanelEl.hidden = !open;
    mapToggleBtn.setAttribute("aria-pressed", String(open));
    mapToggleBtn.setAttribute("aria-expanded", String(open));
    mapToggleBtn.classList.toggle("active", open);
    if (open) game.drawMap();
  };
  mapToggleBtn.addEventListener("click", () => setMapOpen(mapPanelEl.hidden));
  document
    .querySelector("#close-map")
    .addEventListener("click", () => setMapOpen(false));
  document
    .querySelector("#expand-map")
    .addEventListener("click", () => mapPanelEl.classList.toggle("expanded"));
  document.querySelectorAll("#charm-bar [data-tier]").forEach((btn) => {
    bindMultiTouchAction(btn, () => {
      if (game.useCharm(btn.dataset.tier)) persistGameSnapshot();
    });
  });
  initializeMobileUI();
  initializeAudioUI(game.audio);
  initializeCaptureShareUI(game, game.audio);
} else {
  document.querySelector("#scene-loading").textContent =
    "Hiện chưa có khu vực tham quan được mở.";
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = true));
}

if (
  import.meta?.env?.PROD &&
  typeof navigator !== "undefined" &&
  "serviceWorker" in navigator
) {
  addEventListener("load", () => {
    void navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}
