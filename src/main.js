import './styles.css';
import { CityGame as Game } from './core/CityGame.js';
import { districts } from './routes/districts.js';

document.querySelector('#app').innerHTML = `
  <canvas id="game"></canvas>
  <aside id="collision-toast" role="alert" hidden><strong>⚠ Va chạm giao thông!</strong><p id="collision-message"></p><span>Space để phanh · Quan sát và đi bên phải</span></aside>
  <div id="scene-loading" role="status">Đang chuẩn bị hành trình bên sông Hương…</div><div id="asset-notice" role="status" hidden>Một số cảnh vật chưa tải được. Đang dùng mô hình dự phòng.</div>
  <div class="hud">
    <div class="topbar">
      <div class="brand"><small>Huế · City Ride</small><h1>Cún con đi dạo</h1><div class="map-note">Bố cục thử nghiệm · đang đối chiếu bản đồ</div></div>
      <div class="tour-toolbar"><button id="free-roam" class="mode-pill"><span id="mode-label">Đạp tự do</span></button><button id="autopilot">T · Tham quan</button><button id="reset" title="Về đầu khu vực [R]">↺</button></div>
    </div>
    <nav class="destinations" aria-label="Chọn khu vực"><span>ĐẾN KHU VỰC</span>${districts.map((p,i)=>`<button data-district="${p.id}" aria-pressed="false" style="--district-color:${p.color}"><small>0${i+1}</small><span>${p.title}<em>${p.subtitle}</em></span><b>↗</b></button>`).join('')}<p>Chọn để đến ngay · T để tự lái</p></nav>
    <div class="bottom">
      <section class="map-panel" id="map-panel"><button id="expand-map" title="Mở rộng bản đồ [M]">M · BẢN ĐỒ KHU VỰC ↗</button><canvas id="minimap" width="240" height="170" aria-label="Sơ đồ tuyến và vị trí xe"></canvas><span>Sơ đồ thử nghiệm</span></section>
      <div class="mobile-controls"><button data-key="w" aria-label="Đạp tới">▲</button><button data-key="a" aria-label="Rẽ trái">◀</button><button data-key="s" aria-label="Lùi">▼</button><button data-key="d" aria-label="Rẽ phải">▶</button><button data-key=" " aria-label="Phanh">■</button></div>
      <div class="ride-panel"><div class="status"><strong id="destination">Quốc Học · Lê Lợi</strong><div id="distance">Tự do khám phá</div><div class="progress"><i id="progress"></i></div></div><div class="speed"><strong id="speed">0</strong><span>KM/H</span></div><div class="guide"><b>WASD</b> đạp xe · <b>Space</b> phanh · <b>kéo chuột</b> ngắm cảnh</div></div>
    </div>
  </div>
  <article class="card" id="landmark-card"><span>Di sản bên đường</span><h2></h2><p></p></article>`;

export const game = new Game(document.querySelector('#game'));
game.start();
document.querySelector('#autopilot').addEventListener('click', () => game.toggleAutopilot());
document.querySelector('#free-roam').addEventListener('click', () => {game.auto=false;game.syncMode();});
document.querySelector('#reset').addEventListener('click', () => game.reset());
document.querySelectorAll('[data-district]').forEach(button=>button.addEventListener('click',()=>game.travelTo(button.dataset.district)));
document.querySelector('#expand-map').addEventListener('click',()=>document.querySelector('#map-panel').classList.toggle('expanded'));
