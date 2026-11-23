import { unproject } from "../shared/geography/geometry.js";

export const MINIMAP_WIDTH = 240;
export const MINIMAP_HEIGHT = 170;

export function createMapProjection(
  bounds,
  width = MINIMAP_WIDTH,
  height = MINIMAP_HEIGHT,
  pad = 10,
) {
  const b = bounds || { minX: -100, maxX: 100, minZ: -100, maxZ: 100 };
  const spanX = Math.max(1, b.maxX - b.minX);
  const spanZ = Math.max(1, b.maxZ - b.minZ);
  const innerW = Math.max(1, width - pad * 2);
  const innerH = Math.max(1, height - pad * 2);
  const s = Math.min(innerW / spanX, innerH / spanZ);
  const offsetX = pad + (innerW - spanX * s) / 2;
  const offsetY = pad + (innerH - spanZ * s) / 2;
  const toX = (x) => offsetX + (x - b.minX) * s;
  const toY = (z) => offsetY + (z - b.minZ) * s;
  return {
    s,
    offsetX,
    offsetY,
    toX,
    toY,
    clampX: (px) => Math.max(5, Math.min(width - 5, px)),
    clampY: (py) => Math.max(5, Math.min(height - 5, py)),
  };
}

export function appendTrailPoint(trail, x, z, minStep = 3.5, maxPoints = 360) {
  if (!Array.isArray(trail) || !Number.isFinite(x) || !Number.isFinite(z)) {
    return trail;
  }
  const last = trail.at(-1);
  if (!last || Math.hypot(x - last.x, z - last.z) >= minStep) {
    trail.push({ x, z });
    if (trail.length > maxPoints) {
      trail.splice(0, trail.length - maxPoints);
    }
  }
  return trail;
}

export function formatPlayerCoords(position, unprojectFn = unproject) {
  const x = Number.isFinite(position?.x) ? position.x : 0;
  const z = Number.isFinite(position?.z) ? position.z : 0;
  const gps = unprojectFn({ x, z });
  const latHem = gps.lat >= 0 ? "N" : "S";
  const lonHem = gps.lon >= 0 ? "E" : "W";
  return {
    lat: gps.lat,
    lon: gps.lon,
    gpsText: `${Math.abs(gps.lat).toFixed(5)}°${latHem} · ${Math.abs(gps.lon).toFixed(5)}°${lonHem}`,
    localText: `X: ${Math.round(x)} m · Z: ${Math.round(z)} m`,
  };
}

function drawStaticLayer(ctx, state, proj) {
  const w = MINIMAP_WIDTH;
  const h = MINIMAP_HEIGHT;
  const { bounds, riverRings, roads, mainRoads, district, landmarks } = state;
  const { s, toX, toY } = proj;

  ctx.fillStyle = "#122b22";
  ctx.fillRect(0, 0, w, h);

  // Coordinate grid (100m or 200m spacing based on area span)
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
  const gridStep = span > 700 ? 200 : 100;
  ctx.strokeStyle = "rgba(205, 226, 210, 0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (
    let gx = Math.ceil(bounds.minX / gridStep) * gridStep;
    gx <= bounds.maxX;
    gx += gridStep
  ) {
    const x = toX(gx);
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (
    let gz = Math.ceil(bounds.minZ / gridStep) * gridStep;
    gz <= bounds.maxZ;
    gz += gridStep
  ) {
    const y = toY(gz);
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // River polygons
  ctx.fillStyle = "#2d7281";
  ctx.strokeStyle = "#4c9bab";
  ctx.lineWidth = 0.8;
  for (const ring of riverRings || []) {
    if (!ring.length) continue;
    ctx.beginPath();
    ring.forEach((p, i) =>
      i ? ctx.lineTo(toX(p.x), toY(p.z)) : ctx.moveTo(toX(p.x), toY(p.z)),
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Secondary streets inside area
  const mainSet = new Set(mainRoads || []);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#577264";
  ctx.lineWidth = 1;
  for (const road of roads || []) {
    if (mainSet.has(road) || !road.points?.length) continue;
    ctx.beginPath();
    road.points.forEach((p, i) =>
      i ? ctx.lineTo(toX(p.x), toY(p.z)) : ctx.moveTo(toX(p.x), toY(p.z)),
    );
    ctx.stroke();
  }

  // Main arterial roads
  ctx.strokeStyle = "#95ab99";
  ctx.lineWidth = 1.8;
  for (const road of mainRoads || []) {
    if (!road.points?.length) continue;
    ctx.beginPath();
    road.points.forEach((p, i) =>
      i ? ctx.lineTo(toX(p.x), toY(p.z)) : ctx.moveTo(toX(p.x), toY(p.z)),
    );
    ctx.stroke();
  }

  // Active district tour route + start/end markers
  if (district?.path?.length) {
    ctx.strokeStyle = "#0e221b";
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    district.path.forEach(([x, z], i) =>
      i ? ctx.lineTo(toX(x), toY(z)) : ctx.moveTo(toX(x), toY(z)),
    );
    ctx.stroke();

    ctx.strokeStyle = "#f0ca75";
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    district.path.forEach(([x, z], i) =>
      i ? ctx.lineTo(toX(x), toY(z)) : ctx.moveTo(toX(x), toY(z)),
    );
    ctx.stroke();

    const startPt = district.spawn || {
      x: district.path[0][0],
      z: district.path[0][1],
    };
    ctx.fillStyle = "#56d388";
    ctx.strokeStyle = "#0e221b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(toX(startPt.x), toY(startPt.z), 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    const endPt = district.path.at(-1);
    if (endPt) {
      ctx.fillStyle = "#122b22";
      ctx.strokeStyle = "#f0ca75";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(toX(endPt[0]), toY(endPt[1]), 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Area landmarks
  if (landmarks) {
    ctx.fillStyle = "#ffd479";
    for (const lm of landmarks.values ? landmarks.values() : landmarks) {
      if (!lm?.position) continue;
      ctx.beginPath();
      ctx.arc(toX(lm.position.x), toY(lm.position.z), 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Scale bar at bottom-right
  const targetPx = 42;
  const rawMeters = targetPx / Math.max(0.001, s);
  const scaleMeters =
    [50, 100, 200, 500].find((m) => m * s >= 24) || Math.round(rawMeters);
  const barW = scaleMeters * s;
  const bx = w - 8 - barW;
  const by = h - 7;
  ctx.fillStyle = "rgba(12, 30, 24, 0.72)";
  ctx.fillRect(bx - 4, by - 11, barW + 8, 14);
  ctx.strokeStyle = "#cfe0d2";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(bx, by - 2);
  ctx.lineTo(bx, by);
  ctx.lineTo(bx + barW, by);
  ctx.lineTo(bx + barW, by - 2);
  ctx.stroke();
  ctx.fillStyle = "#dce8de";
  ctx.font = "600 8px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${scaleMeters} m`, bx + barW / 2, by - 3);
}

export function renderAreaMap(ctx, state) {
  const w = MINIMAP_WIDTH;
  const h = MINIMAP_HEIGHT;
  const scaleX = (ctx.canvas?.width || w) / w;
  const scaleY = (ctx.canvas?.height || h) / h;
  const proj = createMapProjection(state.bounds, w, h, 10);

  ctx.save();
  ctx.setTransform?.(scaleX, 0, 0, scaleY, 0, 0);

  // Cache static area geometry layer if an offscreen canvas is supported
  const cacheKey = `${state.regionId || ""}:${state.district?.id || ""}:${scaleX}x${scaleY}`;
  let drewStatic = false;
  if (
    state.staticCache &&
    typeof document !== "undefined" &&
    typeof document.createElement === "function"
  ) {
    if (state.staticCache.key !== cacheKey) {
      const offscreen =
        state.staticCache.canvas || document.createElement("canvas");
      offscreen.width = ctx.canvas?.width || w;
      offscreen.height = ctx.canvas?.height || h;
      const octx = offscreen.getContext("2d");
      if (octx) {
        octx.setTransform?.(scaleX, 0, 0, scaleY, 0, 0);
        drawStaticLayer(octx, state, proj);
        state.staticCache.canvas = offscreen;
        state.staticCache.key = cacheKey;
      }
    }
    if (state.staticCache.canvas && state.staticCache.key === cacheKey) {
      ctx.drawImage(state.staticCache.canvas, 0, 0, w, h);
      drewStatic = true;
    }
  }
  if (!drewStatic) {
    drawStaticLayer(ctx, state, proj);
  }

  // Player movement trail
  if (state.trail?.length > 1) {
    ctx.strokeStyle = "#ff9052";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    state.trail.forEach((p, i) =>
      i
        ? ctx.lineTo(proj.toX(p.x), proj.toY(p.z))
        : ctx.moveTo(proj.toX(p.x), proj.toY(p.z)),
    );
    ctx.stroke();
  }

  // Active speed charms on the map
  const charmColors = {
    10: "#2ee59d",
    20: "#38d9ff",
    30: "#b86bff",
    100: "#ffb838",
  };
  for (const charm of state.charms || []) {
    const cx = proj.clampX(proj.toX(charm.x));
    const cy = proj.clampY(proj.toY(charm.z));
    ctx.fillStyle = charmColors[charm.tier] || "#2ee59d";
    ctx.beginPath();
    ctx.arc(cx, cy, charm.tier === "100" ? 2.8 : 1.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Remote online players in the same area
  for (const remote of state.remotePlayers || []) {
    const rx = proj.clampX(proj.toX(remote.x));
    const ry = proj.clampY(proj.toY(remote.z));
    ctx.fillStyle = remote.color || "#5ce1ff";
    ctx.strokeStyle = "#0e221b";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(rx, ry, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Current player position + coordinate crosshair + directional arrow
  const pos = state.bike?.position || { x: 0, z: 0 };
  const heading = state.bike?.motion?.heading || 0;
  const px = proj.clampX(proj.toX(pos.x));
  const py = proj.clampY(proj.toY(pos.z));

  ctx.save();
  ctx.strokeStyle = "rgba(255, 224, 140, 0.42)";
  ctx.lineWidth = 1;
  ctx.setLineDash?.([3, 3]);
  ctx.beginPath();
  ctx.moveTo(0, py);
  ctx.lineTo(w, py);
  ctx.moveTo(px, 0);
  ctx.lineTo(px, h);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(255, 98, 66, 0.34)";
  ctx.beginPath();
  ctx.arc(px, py, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(-heading);
  ctx.fillStyle = "#ff5e3a";
  ctx.strokeStyle = "#fff9e8";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, 7.2);
  ctx.lineTo(-4.8, -4.4);
  ctx.lineTo(0, -1.8);
  ctx.lineTo(4.8, -4.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff9e8";
  ctx.beginPath();
  ctx.arc(0, 0.5, 1.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}
