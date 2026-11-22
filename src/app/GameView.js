import { unproject } from "../core/shared/geography/geometry.js";
import { geoDistricts as districts } from "../modules/areas/AreaModel.js";
import { AVATAR_CATALOG } from "../core/network/protocol.js";
import { CITY, BRIDGE } from "../core/world/cityLayout.js";
import { formatPlayerCoords } from "../core/world/minimap.js";

const STANCE_LABELS = {
  idle: "Đang đứng · Vẫy tay",
  walk: "Đang đi bộ",
  run: "Đang chạy bộ",
  bike: "Đang đạp xe",
};

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
      transport: document.querySelector("#transport-toggle"),
      touchTransport: document.querySelector("#touch-transport"),
      avatarBtn: document.querySelector("#avatar-toggle"),
      card: document.querySelector("#landmark-card"),
      mapArea: document.querySelector("#map-area-title"),
      mapCoords: document.querySelector("#map-coords"),
      mapLocalCoords: document.querySelector("#map-local-coords"),
      osmLink: document.querySelector("#open-osm"),
    };
  }
  syncMode(game) {
    const isBike = game.bike.transportMode === "bike";
    const stanceText = game.auto
      ? "Tự lái tham quan"
      : STANCE_LABELS[game.bike.stance] || "Đi bộ tự do";
    game.hud.mode.textContent = stanceText;
    game.hud.auto.classList.toggle("active", game.auto);
    game.hud.auto.setAttribute("aria-pressed", String(game.auto));
    if (game.hud.transport) {
      game.hud.transport.textContent = isBike ? "🚲 Đạp xe" : "🚶 Đi bộ";
      game.hud.transport.classList.toggle("active", isBike);
      game.hud.transport.setAttribute("aria-pressed", String(isBike));
    }
    if (game.hud.touchTransport) {
      game.hud.touchTransport.textContent = isBike ? "🚶" : "🚲";
      game.hud.touchTransport.setAttribute(
        "aria-label",
        isBike ? "Chuyển sang đi bộ" : "Chuyển sang đạp xe đạp",
      );
      game.hud.touchTransport.classList.toggle("active", isBike);
    }
    if (game.hud.avatarBtn) {
      const meta = AVATAR_CATALOG.find((a) => a.id === game.bike.avatarId);
      if (meta) game.hud.avatarBtn.textContent = `🎭 ${meta.label}`;
    }
  }
  updateHud(game) {
    const coords = formatPlayerCoords(game.bike.position, unproject);
    if (game.hud.osmLink) {
      game.hud.osmLink.href = `https://www.openstreetmap.org/#map=18/${coords.lat.toFixed(7)}/${coords.lon.toFixed(7)}`;
    }
    if (game.hud.mapArea) {
      game.hud.mapArea.textContent = game.district.title;
    }
    if (game.hud.mapCoords) {
      game.hud.mapCoords.textContent = coords.gpsText;
    }
    if (game.hud.mapLocalCoords) {
      game.hud.mapLocalCoords.textContent = coords.localText;
    }
    game.hud.district.textContent = game.district.title;
    game.hud.speed.textContent = Math.round(
      Math.abs(game.bike.motion.speed) * 3.6,
    );
    if (!game.auto && game.hud.mode) {
      game.hud.mode.textContent =
        STANCE_LABELS[game.bike.stance] || "Đi bộ tự do";
    }
    game.hud.distance.textContent = game.completed
      ? "Đã hoàn thành tuyến"
      : game.auto
        ? `${Math.round((1 - game.routeU) * game.routeLength)} m trên tuyến`
        : STANCE_LABELS[game.bike.stance] || "Tự do khám phá";
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
      const remotePlayers = game.online?.avatars?.entries
        ? [...game.online.avatars.entries.values()]
            .filter(
              (entry) =>
                entry.target?.connected &&
                entry.target.region === game.district?.id,
            )
            .map((entry) => ({
              x: entry.bike.position.x,
              z: entry.bike.position.z,
              color: entry.target.color,
              name: entry.target.name,
            }))
        : [];
      game.world.drawMap(
        game.map,
        game.bike,
        districts,
        game.district.id,
        game.traffic.actors,
        { remotePlayers },
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
