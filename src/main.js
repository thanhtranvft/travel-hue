import "./styles.css";
import "./mobile.css";
import "./touch-layout.css";
import "./ui/session.css";
import {
  chooseSession,
  createSessionPanel,
  clearSavedPlayerName,
  getSavedAvatar,
  renderAvatarGrid,
  saveAvatar,
} from "./ui/SessionUI.js";
import { cleanAvatarId } from "./core/network/protocol.js";
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
import { loadGeography } from "./modules/areas/AreaModel.js";
import { defaultArea } from "./app/catalog.js";

document.querySelector("#app").innerHTML = `
  <canvas id="game"></canvas>
  <aside id="collision-toast" role="alert" hidden><strong>⚠ Va chạm giao thông!</strong><p id="collision-message"></p><span>Space để phanh · Quan sát và đi bên phải</span></aside>
  <div id="scene-loading" role="status">Đang chuẩn bị hành trình bên sông Hương…</div><div id="asset-notice" role="status" hidden>Một số cảnh vật chưa tải được. Đang dùng mô hình dự phòng.</div>
  <div class="hud">
    <div class="topbar">
      <div class="brand"><div><small>Huế · City Tour</small><h1>Chibi dạo phố Huế</h1><div class="map-note">Tọa độ OSM · kiến trúc ước lượng</div></div><div class="brand-account" id="brand-account" hidden><span id="current-user-name"></span><button id="logout-btn" type="button" title="Đăng xuất để đổi tên">Đăng xuất</button></div></div>
      <div class="tour-toolbar"><button id="free-roam" class="mode-pill"><span id="mode-label">Đang đứng · Vẫy tay</span></button><button id="transport-toggle" type="button" title="Chuyển Đi bộ / Đạp xe [E]" aria-pressed="false">🚶 Đi bộ</button><button id="avatar-toggle" type="button" title="Đổi mẫu nhân vật Chibi" aria-expanded="false">🎭 Nhân vật</button><button id="autopilot">T · Tham quan</button><button id="reset" title="Về đầu khu vực [R]">↺</button></div>
    </div>
    <nav class="destinations" aria-label="Chọn khu vực"><button id="toggle-districts" aria-expanded="true" aria-controls="district-list">☰ Khu vực <span aria-hidden="true">⌄</span></button><div id="district-list">${districts.map((p, i) => `<button data-district="${p.id}" aria-pressed="false" style="--district-color:${p.color}"><small>0${i + 1}</small><span>${p.title}<em>${p.subtitle}</em></span><b>↗</b></button>`).join("")}<p>Chọn để đến ngay · T để tự lái</p></div></nav>
    <div class="utility-toolbar"><div class="utility-buttons"><button id="audio-toggle" aria-pressed="false">♫ Bật nhạc</button><button id="landscape-toggle" aria-pressed="false">↔ Chơi ngang</button></div><div id="sound-settings" hidden><label>Âm lượng <input id="audio-volume" type="range" min="0" max="100" value="45" aria-label="Âm lượng game"></label><span id="sound-location">Giai điệu bên sông Hương</span></div><span id="audio-status" role="status"></span></div>
    <div class="bottom">
      <section class="map-panel" id="map-panel"><button id="expand-map" title="Mở rộng bản đồ [M]">M · BẢN ĐỒ KHU VỰC ↗</button><div class="map-area-title" id="map-area-title">Khoa Quốc tế → Tràng Tiền</div><canvas id="minimap" width="480" height="340" aria-label="Bản đồ khu vực và tọa độ di chuyển"></canvas><div class="map-coords" id="map-coords">16.45898°N · 107.58096°E</div><div class="map-local-coords" id="map-local-coords">X: 313 m · Z: -283 m</div><a id="open-osm" href="https://www.openstreetmap.org/" target="_blank" rel="noopener noreferrer">Đối chiếu OSM ↗</a></section>
      <div class="touch-controls"><div class="thumbstick" id="move-stick" role="group" aria-label="Cần lái bên trái: kéo nhẹ để đi bộ, kéo hết mức để chạy, hoặc rẽ"><span class="stick-arrows" aria-hidden="true">＋</span><span id="stick-thumb" aria-hidden="true"></span><span class="touch-caption">ĐI / RẼ</span></div><div class="camera-pad" id="look-pad" role="group" aria-label="Vùng vuốt bên phải để xoay góc nhìn"><span aria-hidden="true">⌖</span><span class="touch-caption">VUỐT NHÌN</span></div><button id="touch-transport" type="button" aria-label="Chuyển sang đạp xe đạp">🚲</button><button id="touch-brake" type="button" aria-label="Giữ để dừng">■<span>DỪNG</span></button></div>
      <div class="ride-panel"><div class="status"><strong id="destination">Quốc Học · Lê Lợi</strong><div id="distance">Đang đứng · Vẫy tay</div><div class="progress"><i id="progress"></i></div></div><div class="speed"><strong id="speed">0</strong><span>KM/H</span></div><div class="guide"><b>WASD</b> đi/lái · <b>Shift</b> chạy · <b>E</b> xe đạp · <b>Space</b> dừng</div></div>
    </div>
  </div>
  <section id="avatar-picker" hidden role="dialog" aria-label="Đổi nhân vật Chibi"><div class="avatar-picker-head"><strong>Chọn mẫu nhân vật Chibi 3D</strong><button type="button" id="close-avatar-picker">Đóng</button></div><div id="hud-avatar-grid">${renderAvatarGrid(getSavedAvatar())}</div></section>
  <article class="card" id="landmark-card"><span>Di sản bên đường</span><h2></h2><p></p></article>
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
const initialSession = defaultArea ? await chooseSession("", onStart) : null;
if (defaultArea) await loadGeography(defaultArea.id);
document.querySelector("#district-list p").textContent =
  "Chọn khu để tải · Di chuyển trong khu đã chọn";
export const game = defaultArea
  ? await Game.create(document.querySelector("#game"), { audio })
  : null;
if (game) {
  let session = initialSession;
  let activePanel = null;
  const userAccountEl = document.querySelector("#brand-account");
  const userNameEl = document.querySelector("#current-user-name");
  const avatarPickerEl = document.querySelector("#avatar-picker");
  const avatarToggleBtn = document.querySelector("#avatar-toggle");
  const syncAvatarPickerSelection = (avatarId) => {
    const id = cleanAvatarId(avatarId);
    avatarPickerEl.querySelectorAll("[data-avatar]").forEach((btn) => {
      btn.setAttribute("aria-checked", String(btn.dataset.avatar === id));
    });
  };
  const setAvatarPickerOpen = (open) => {
    avatarPickerEl.hidden = !open;
    avatarToggleBtn.setAttribute("aria-expanded", String(open));
  };
  avatarToggleBtn.addEventListener("click", () => {
    setAvatarPickerOpen(avatarPickerEl.hidden);
  });
  document
    .querySelector("#close-avatar-picker")
    .addEventListener("click", () => setAvatarPickerOpen(false));
  avatarPickerEl.addEventListener("click", (event) => {
    const btn = event.target.closest?.("[data-avatar]");
    if (!btn) return;
    const chosen = saveAvatar(btn.dataset.avatar);
    game.setAvatar(chosen);
    syncAvatarPickerSelection(chosen);
    setAvatarPickerOpen(false);
  });

  const openSessionPicker = async (previousName) => {
    setAvatarPickerOpen(false);
    game.sessionActive = false;
    game.input.reset();
    game.auto = false;
    game.bike.motion.speed = 0;
    game.online?.dispose();
    game.online = null;
    activePanel?.remove();
    activePanel = null;
    document.querySelector(".hud").inert = true;
    const selected = await chooseSession(previousName, primeAudio);
    document.querySelector(".hud").inert = false;
    await activateSession(selected);
  };
  const activateSession = async (next) => {
    session = next;
    game.session = next;
    const avatarId = cleanAvatarId(next.avatar || getSavedAvatar());
    game.setAvatar(avatarId);
    syncAvatarPickerSelection(avatarId);
    userNameEl.textContent = next.name;
    userAccountEl.hidden = false;
    setRiderIdentity(game.bike, next.name);
    const panel = createSessionPanel(next, () => openSessionPicker(session.name));
    activePanel = panel;
    if (next.mode === "online") {
      const { OnlineSession } = await import("./core/network/OnlineSession.js");
      game.online = new OnlineSession(game, next.name, panel, districts);
    }
    game.input.reset();
    game.sessionActive = true;
  };
  document.querySelector("#logout-btn").addEventListener("click", async () => {
    clearSavedPlayerName();
    userAccountEl.hidden = true;
    await openSessionPicker("");
  });
  await activateSession(initialSession);
  game.start();
  document
    .querySelector("#transport-toggle")
    .addEventListener("click", () => game.toggleTransportMode());
  document
    .querySelector("#touch-transport")
    .addEventListener("click", () => game.toggleTransportMode());
  document
    .querySelector("#autopilot")
    .addEventListener("click", () => game.toggleAutopilot());
  document.querySelector("#free-roam").addEventListener("click", () => {
    game.auto = false;
    game.syncMode();
  });
  document
    .querySelector("#reset")
    .addEventListener("click", () => game.reset());
  document
    .querySelectorAll("[data-district]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        game.travelTo(button.dataset.district),
      ),
    );
  document
    .querySelector("#expand-map")
    .addEventListener("click", () =>
      document.querySelector("#map-panel").classList.toggle("expanded"),
    );
  initializeMobileUI();
  initializeAudioUI(game.audio);
} else {
  document.querySelector("#scene-loading").textContent =
    "Hiện chưa có khu vực tham quan được mở.";
  document
    .querySelectorAll("button")
    .forEach((button) => (button.disabled = true));
}

