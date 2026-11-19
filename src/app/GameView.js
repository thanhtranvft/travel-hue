import { unproject } from "../core/shared/geography/geometry.js";
import { geoDistricts as districts } from "../core/shared/geography/map.js";
import { CITY, BRIDGE } from "../core/world/cityLayout.js";
export class GameView {
  constructor() {
    this.map = document.querySelector("#minimap").getContext("2d");
    this.hud = {
      district: document.querySelector("#destination"),
      speed: document.querySelector("#speed"),
      distance: document.querySelector("#distance"),
      progress: document.querySelector("#progress"),
      mode: document.querySelector("#mode-label"),
      auto: document.querySelector("#autopilot"),
      card: document.querySelector("#landmark-card"),
    };
  }
  syncMode(game) {
    game.hud.mode.textContent = game.auto ? "Tự lái tham quan" : "Đạp tự do";
    game.hud.auto.classList.toggle("active", game.auto);
    game.hud.auto.setAttribute("aria-pressed", String(game.auto));
  }
  updateHud(game) {
    const osmLink = document.querySelector("#open-osm");
    if (osmLink) {
      const gps = unproject(game.bike.position);
      osmLink.href = `https://www.openstreetmap.org/#map=18/${gps.lat.toFixed(7)}/${gps.lon.toFixed(7)}`;
    }
    game.hud.district.textContent = game.district.title;
    game.hud.speed.textContent = Math.round(
      Math.abs(game.bike.motion.speed) * 3.6,
    );
    game.hud.distance.textContent = game.completed
      ? "Đã hoàn thành tuyến"
      : game.auto
        ? `${Math.round((1 - game.routeU) * game.routeLength)} m trên tuyến`
        : "Tự do khám phá";
    game.hud.progress.style.width = `${game.completed ? 100 : game.routeU * 100}%`;
    const soundLocation = document.querySelector("#sound-location");
    if (soundLocation)
      soundLocation.textContent =
        game.audio.venueLevel > 0.07
          ? `Nhạc ven quán · ${game.audio.nearbyVenue.title}`
          : "Giai điệu bên sông Hương";
    let near = null,
      distance = Infinity;
    for (const lm of game.world.landmarks.values()) {
      const d = Math.hypot(
        lm.position.x - game.bike.position.x,
        lm.position.z - game.bike.position.z,
      );
      if (d < distance && d < lm.radius) {
        distance = d;
        near = lm;
      }
    }
    game.hud.card.classList.toggle("visible", !!near);
    if (near) {
      game.hud.card.querySelector("h2").textContent = near.title;
      game.hud.card.querySelector("p").textContent = near.description;
    }
  }
  drawMap(game) {
    if (game.world.drawMap) {
      game.world.drawMap(
        game.map,
        game.bike,
        districts,
        game.district.id,
        game.traffic.actors,
      );
      return;
    }
    const ctx = game.map,
      w = 240,
      h = 170,
      toX = (x) => ((x + 85) / 125) * w,
      toY = (z) => ((z + 82) / 145) * h;
    ctx.fillStyle = "#102420";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#326d78";
    ctx.fillRect(
      0,
      toY(-CITY.riverHalfWidth),
      w,
      toY(CITY.riverHalfWidth) - toY(-CITY.riverHalfWidth),
    );
    ctx.strokeStyle = "#829183";
    ctx.lineWidth = (CITY.roadWidth / 145) * h;
    for (const z of [-CITY.roadCenter, CITY.roadCenter]) {
      ctx.beginPath();
      ctx.moveTo(0, toY(z));
      ctx.lineTo(w, toY(z));
      ctx.stroke();
    }
    ctx.lineWidth = (BRIDGE.width / 125) * w;
    ctx.beginPath();
    ctx.moveTo(toX(BRIDGE.x), toY(-34));
    ctx.lineTo(toX(BRIDGE.x), toY(34));
    ctx.stroke();
    ctx.lineWidth = 2;
    for (const district of districts) {
      ctx.strokeStyle =
        district.id === game.district.id ? district.color : "#4a6257";
      ctx.beginPath();
      district.path.forEach(([x, z], i) =>
        i ? ctx.lineTo(toX(x), toY(z)) : ctx.moveTo(toX(x), toY(z)),
      );
      ctx.stroke();
      ctx.fillStyle = district.color;
      ctx.beginPath();
      ctx.arc(toX(district.spawn.x), toY(district.spawn.z), 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.save();
    ctx.translate(toX(game.bike.position.x), toY(game.bike.position.z));
    ctx.rotate(-game.bike.motion.heading);
    ctx.fillStyle = "#fff0bb";
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(-4, -4);
    ctx.lineTo(0, -2);
    ctx.lineTo(4, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    for (const actor of game.traffic.actors) {
      ctx.fillStyle = actor.type === "pedestrian" ? "#a6c6a0" : "#e7a184";
      ctx.fillRect(
        toX(actor.mesh.position.x) - 1,
        toY(actor.mesh.position.z) - 1,
        2,
        2,
      );
    }
  }
}
