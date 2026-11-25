import * as THREE from "three";
import { box } from "../shared/architecture/shared.js";

function wrap(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const materials = new Map();
const routeMatCache = new Map();

function makeCanvasTexture(width, height, draw) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function drawRedProhibitionCircle(ctx, cx, cy, r, drawInner) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath?.();
  ctx.arc?.(cx, cy, r, 0, Math.PI * 2);
  ctx.fill?.();

  ctx.strokeStyle = "#d32424";
  ctx.lineWidth = r * 0.24;
  ctx.beginPath?.();
  ctx.arc?.(cx, cy, r * 0.86, 0, Math.PI * 2);
  ctx.stroke?.();

  drawInner?.(ctx, cx, cy, r * 0.68);

  // Diagonal prohibition slash
  ctx.strokeStyle = "#d32424";
  ctx.lineWidth = r * 0.2;
  ctx.beginPath?.();
  ctx.moveTo?.(cx - r * 0.58, cy - r * 0.58);
  ctx.lineTo?.(cx + r * 0.58, cy + r * 0.58);
  ctx.stroke?.();
}

function drawWarningTriangleTexture(kind = "junction") {
  const key = `warn|${kind}`;
  if (routeMatCache.has(key)) return routeMatCache.get(key);
  const tex = makeCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#f4c41f";
    ctx.fillRect(0, 0, w, h);

    // Outer rounded red triangle border
    ctx.fillStyle = "#d32424";
    ctx.beginPath?.();
    ctx.moveTo?.(w * 0.5, 14);
    ctx.lineTo?.(w - 14, h - 18);
    ctx.lineTo?.(14, h - 18);
    ctx.closePath?.();
    ctx.fill?.();

    // Inner yellow warning field
    ctx.fillStyle = "#f4c41f";
    ctx.beginPath?.();
    ctx.moveTo?.(w * 0.5, 50);
    ctx.lineTo?.(w - 46, h - 38);
    ctx.lineTo?.(46, h - 38);
    ctx.closePath?.();
    ctx.fill?.();

    ctx.fillStyle = "#181a1c";
    if (kind === "school") {
      // Children crossing silhouette
      ctx.beginPath?.();
      ctx.arc?.(112, 134, 11, 0, Math.PI * 2);
      ctx.arc?.(146, 142, 9, 0, Math.PI * 2);
      ctx.fill?.();
      ctx.fillRect(102, 147, 20, 34);
      ctx.fillRect(138, 153, 16, 28);
      ctx.fillRect(100, 181, 8, 20);
      ctx.fillRect(114, 181, 8, 20);
      ctx.fillRect(137, 181, 7, 18);
      ctx.fillRect(148, 181, 7, 18);
    } else if (kind === "crosswalk") {
      // Pedestrian crosswalk stripes + walker
      for (let sx = 78; sx <= 162; sx += 21) {
        ctx.fillRect(sx, 186, 13, 14);
      }
      ctx.beginPath?.();
      ctx.arc?.(128, 124, 11, 0, Math.PI * 2);
      ctx.fill?.();
      ctx.fillRect(120, 137, 16, 30);
      ctx.fillRect(114, 167, 9, 17);
      ctx.fillRect(132, 167, 9, 17);
    } else {
      // T-junction or crossroad (matching image_42e6d6ba.png)
      ctx.fillRect(118, 108, 20, 88);
      ctx.fillRect(88, 142, 34, 16);
    }
  });
  const mat = new THREE.MeshStandardMaterial({
    color: tex ? "#ffffff" : "#f4c41f",
    map: tex,
    roughness: 0.45,
  });
  routeMatCache.set(key, mat);
  return mat;
}

function getRegulatoryStackMat(spec) {
  const key = `reg|${spec.variant}|${spec.timeText || ""}|${spec.distanceText || ""}|${spec.bannerText || ""}`;
  if (routeMatCache.has(key)) return routeMatCache.get(key);
  const tex = makeCanvasTexture(256, 512, (ctx, w, h) => {
    // Crisp white composite regulatory sign board (matching image_42e6d6ba.png)
    ctx.fillStyle = "#f4f6f8";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#cfd6dc";
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    if (spec.variant === "no-car-time") {
      // Top sign: No Cars (with time window)
      drawRedProhibitionCircle(ctx, 128, 92, 72, (c, cx, cy) => {
        c.fillStyle = "#181a1c";
        c.fillRect(cx - 26, cy - 8, 52, 20);
        c.fillRect(cx - 18, cy - 22, 36, 16);
        c.fillRect(cx - 22, cy + 12, 10, 8);
        c.fillRect(cx + 12, cy + 12, 10, 8);
      });
      // Time plate 1
      ctx.strokeStyle = "#181a1c";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 174, 196, 38);
      ctx.fillStyle = "#181a1c";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(spec.timeText || "6:00 - 22:00", 128, 194);

      // Middle sign: No U-turn
      drawRedProhibitionCircle(ctx, 128, 290, 68, (c, cx, cy) => {
        c.strokeStyle = "#181a1c";
        c.lineWidth = 10;
        c.beginPath?.();
        c.arc?.(cx, cy - 8, 18, Math.PI, 0, false);
        c.stroke?.();
        c.fillStyle = "#181a1c";
        c.fillRect(cx - 23, cy - 8, 10, 32);
        c.fillRect(cx + 13, cy - 8, 10, 22);
      });

      // Blue route-regulation banner
      ctx.fillStyle = "#0f65b4";
      ctx.fillRect(24, 376, 208, 44);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillText(spec.bannerText || "TUYẾN CẤM Ô TÔ", 128, 399, 196);

      // Distance sub-plate (1000 m)
      ctx.strokeStyle = "#181a1c";
      ctx.lineWidth = 4;
      ctx.strokeRect(46, 434, 164, 52);
      ctx.fillStyle = "#181a1c";
      ctx.font = "bold 32px Arial, sans-serif";
      ctx.fillText(spec.distanceText || "1000 m", 128, 461);
    } else if (spec.variant === "no-parking") {
      // Cấm dừng & đỗ xe + Sub-plate
      drawRedProhibitionCircle(ctx, 128, 118, 86, () => {});
      ctx.strokeStyle = "#d32424";
      ctx.lineWidth = 17;
      ctx.beginPath?.();
      ctx.moveTo?.(128 + 52, 118 - 52);
      ctx.lineTo?.(128 - 52, 118 + 52);
      ctx.stroke?.();

      // Blue P / route effective sub-plate
      ctx.fillStyle = "#0f65b4";
      ctx.fillRect(24, 232, 208, 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CẤM ĐỖ XE", 128, 262);

      ctx.strokeStyle = "#181a1c";
      ctx.lineWidth = 4;
      ctx.strokeRect(30, 310, 196, 86);
      ctx.fillStyle = "#181a1c";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.fillText(spec.timeText || "6:00 - 22:00", 128, 338);
      ctx.font = "bold 24px Arial, sans-serif";
      ctx.fillText(spec.distanceText || "THEO TUYẾN", 128, 374);

      ctx.fillStyle = "#1672ba";
      ctx.fillRect(28, 418, 200, 62);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillText("LÀN XE ĐẠP BÊN PHẢI", 128, 449, 190);
    } else {
      // Speed limit 40 / 50 + School / Residential alert
      ctx.fillStyle = "#ffffff";
      ctx.beginPath?.();
      ctx.arc?.(128, 122, 88, 0, Math.PI * 2);
      ctx.fill?.();
      ctx.strokeStyle = "#d32424";
      ctx.lineWidth = 22;
      ctx.beginPath?.();
      ctx.arc?.(128, 122, 76, 0, Math.PI * 2);
      ctx.stroke?.();
      ctx.fillStyle = "#181a1c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 88px Arial, sans-serif";
      ctx.fillText(spec.speedText || "40", 128, 126);

      ctx.fillStyle = "#0f65b4";
      ctx.fillRect(22, 236, 212, 68);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial, sans-serif";
      ctx.fillText(spec.bannerText || "GIẢM TỐC ĐỘ", 128, 258, 196);
      ctx.font = "600 18px Arial, sans-serif";
      ctx.fillText(spec.subBanner || "KHU VỰC ĐÔNG DÂN CƯ", 128, 286, 196);

      ctx.strokeStyle = "#181a1c";
      ctx.lineWidth = 4;
      ctx.strokeRect(32, 326, 192, 66);
      ctx.fillStyle = "#181a1c";
      ctx.font = "bold 28px Arial, sans-serif";
      ctx.fillText(spec.distanceText || "500 m", 128, 359);

      // Small pedestrian priority strip
      ctx.fillStyle = "#197648";
      ctx.fillRect(32, 414, 192, 64);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px Arial, sans-serif";
      ctx.fillText("ƯU TIÊN XE ĐẠP", 128, 446, 180);
    }
  });

  const mat = new THREE.MeshStandardMaterial({
    color: tex ? "#ffffff" : "#f4f6f8",
    map: tex,
    roughness: 0.45,
  });
  routeMatCache.set(key, mat);
  return mat;
}

function getBlueDirectionBoardMat(title, subtitle = "", isStreetName = false) {
  const key = `dir|${isStreetName ? "sn" : "rt"}|${title}|${subtitle}`;
  if (routeMatCache.has(key)) return routeMatCache.get(key);
  const w = isStreetName ? 512 : 512;
  const h = isStreetName ? 160 : 320;
  const tex = makeCanvasTexture(w, h, (ctx, cw, ch) => {
    ctx.fillStyle = "#0d66b8";
    ctx.fillRect(0, 0, cw, ch);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = isStreetName ? 8 : 12;
    ctx.strokeRect(10, 10, cw - 20, ch - 20);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (isStreetName) {
      let font = 54;
      do {
        ctx.font = `bold ${font--}px Arial, sans-serif`;
      } while (ctx.measureText(title).width > cw - 52 && font > 20);
      ctx.fillText(title, cw / 2, ch * 0.52, cw - 44);
      return;
    }

    let font = 56;
    let lines;
    do {
      ctx.font = `bold ${font}px Arial, sans-serif`;
      lines = wrap(ctx, title, cw - 54);
      if (lines.length <= 2) break;
      font -= 4;
    } while (font > 26);
    const startY = subtitle ? ch * 0.36 : ch * 0.5;
    lines.slice(0, 2).forEach((line, i) => {
      ctx.fillText(
        line,
        cw / 2,
        startY + (i - (Math.min(2, lines.length) - 1) / 2) * font * 1.18,
        cw - 48,
      );
    });
    if (subtitle) {
      ctx.fillStyle = "#dceeff";
      ctx.font = "bold 34px Arial, sans-serif";
      ctx.fillText(subtitle, cw / 2, ch * 0.77, cw - 48);
    }
  });
  const mat = new THREE.MeshStandardMaterial({
    color: tex ? "#ffffff" : "#0d66b8",
    map: tex,
    roughness: 0.48,
  });
  routeMatCache.set(key, mat);
  return mat;
}

export function routeTrafficSign(spec = {}) {
  const group = new THREE.Group();
  const variant = spec.variant || "direction-warning";
  group.name = `route-sign-${variant}`;
  group.userData.routeSign = {
    variant,
    title: spec.title || variant,
  };

  if (variant === "street-name") {
    // Sleek Vietnamese corner street-name plaque
    const poleMat = new THREE.MeshStandardMaterial({
      color: "#5d6870",
      roughness: 0.5,
      metalness: 0.35,
    });
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.052, 2.75, 10),
      poleMat,
    );
    pole.position.set(0, 1.375, 0);
    pole.castShadow = true;
    const plateMat = getBlueDirectionBoardMat(
      spec.title || "ĐƯỜNG LÊ LỢI",
      "",
      true,
    );
    const front = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.37), plateMat);
    front.position.set(0, 2.55, 0.06);
    front.userData.signFace = true;
    const back = front.clone();
    back.position.z = -0.06;
    back.rotation.y = Math.PI;
    back.userData.signFace = true;
    group.add(
      pole,
      box([1.22, 0.4, 0.09], "#25578a", [0, 2.55, 0]),
      front,
      back,
    );
    return group;
  }

  if (
    variant === "no-car-time" ||
    variant === "no-parking" ||
    variant === "speed-limit"
  ) {
    // White-orange striped galvanized pole + vertical regulatory composite panel (image_42e6d6ba.png)
    const poleWhite = new THREE.MeshStandardMaterial({
      color: "#edf0f2",
      roughness: 0.5,
      metalness: 0.25,
    });
    const poleOrange = new THREE.MeshStandardMaterial({
      color: "#df601f",
      roughness: 0.48,
      metalness: 0.2,
    });
    for (let s = 0; s < 5; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.048, 0.052, 0.36, 10),
        s % 2 === 0 ? poleWhite : poleOrange,
      );
      seg.position.set(0, 0.18 + s * 0.36, -0.05);
      seg.castShadow = true;
      group.add(seg);
    }
    const upperPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.048, 1.85, 10),
      poleWhite,
    );
    upperPole.position.set(0, 1.8 + 0.925, -0.05);
    upperPole.castShadow = true;
    group.add(
      upperPole,
      box([0.28, 0.1, 0.28], "#9ca4aa", [0, 0.05, -0.05]),
    );

    const panelW = 0.82;
    const panelH = 1.72;
    const boardY = 2.68;
    const regMat = getRegulatoryStackMat(spec);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(panelW, panelH), regMat);
    face.position.set(0, boardY, 0.032);
    face.userData.signFace = true;
    const back = box([panelW + 0.03, panelH + 0.03, 0.04], "#8f989e", [
      0,
      boardY,
      0.008,
    ]);
    group.add(face, back);
    return group;
  }

  // "direction-warning" or "school-warning": Blue pole + upper blue route instruction + lower yellow warning triangle
  const bluePole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.068, 0.075, 4.1, 12),
    new THREE.MeshStandardMaterial({
      color: "#1573bc",
      roughness: 0.45,
      metalness: 0.25,
    }),
  );
  bluePole.position.set(0, 2.05, -0.06);
  bluePole.castShadow = true;
  group.add(
    bluePole,
    box([0.36, 0.14, 0.36], "#9fa6ab", [0, 0.07, -0.06]),
  );

  // Upper blue directional route board (human scale: 1.56m x 0.94m)
  const dirW = 1.56;
  const dirH = 0.94;
  const dirY = 3.55;
  const dirMat = getBlueDirectionBoardMat(
    spec.title || "HƯỚNG ĐI TRUNG TÂM →",
    spec.subtitle || "6:00 - 22:00",
    false,
  );
  const dirFace = new THREE.Mesh(new THREE.PlaneGeometry(dirW, dirH), dirMat);
  dirFace.position.set(0, dirY, 0.045);
  dirFace.userData.signFace = true;
  const dirBack = box([dirW + 0.04, dirH + 0.04, 0.05], "#8d969c", [
    0,
    dirY,
    0.015,
  ]);

  // Lower yellow triangular warning sign (matching image_42e6d6ba.png)
  const warnY = 2.48;
  const warnMat = drawWarningTriangleTexture(spec.warning || "junction");
  const warnFace = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.72), warnMat);
  warnFace.position.set(0, warnY, 0.045);
  warnFace.userData.signFace = true;
  const warnBack = box([0.82, 0.76, 0.04], "#8d969c", [0, warnY, 0.018]);

  group.add(dirFace, dirBack, warnFace, warnBack);
  return group;
}

export function trafficBoard(title, subtitle = "", size = 3.4) {
  const key = `${title}\n${subtitle}`;
  if (materials.has(key))
    return new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      materials.get(key),
    );
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d");
  c.scale(0.5, 0.5);
  c.fillStyle = "#0863b8";
  c.fillRect(0, 0, 1024, 1024);
  c.strokeStyle = "#ffffff";
  c.lineWidth = 16;
  c.strokeRect(22, 22, 980, 980);
  c.fillStyle = "#fff";
  c.textAlign = "center";
  c.textBaseline = "middle";
  let font = 150,
    lines;
  do {
    c.font = `bold ${font}px Arial, sans-serif`;
    lines = wrap(c, title, 900);
    if (lines.length * font * 1.16 < 650) break;
    font -= 6;
  } while (font > 48);
  const top = subtitle ? 390 : 512;
  lines.forEach((line, i) =>
    c.fillText(line, 512, top + (i - (lines.length - 1) / 2) * font * 1.16),
  );
  if (subtitle) {
    c.font = "bold 78px Arial, sans-serif";
    const sub = wrap(c, subtitle, 900);
    sub.slice(0, 3).forEach((line, i) => c.fillText(line, 512, 760 + i * 86));
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
    roughness: 0.85,
  });
  material.addEventListener("dispose", () => {
    if (materials.get(key) === material) materials.delete(key);
  });
  materials.set(key, material);
  return new THREE.Mesh(new THREE.PlaneGeometry(size, size), material);
}

export function mountSignPanel(
  panel,
  height = 3.5,
  poleXs = [0],
  color = "#626e72",
) {
  const group = new THREE.Group();
  panel.position.set(0, height, 0);
  panel.userData.signFace = true;
  group.add(panel);
  // Two readable faces enclose the support. A double-sided plane alone lets
  // the pole cover the lettering whenever the player approaches from behind.
  const back = panel.clone();
  back.position.z = -0.4;
  back.rotation.y = Math.PI;
  back.userData.signFace = true;
  group.add(back);
  const { width, height: panelHeight } = panel.geometry.parameters;
  const backing = box([width, panelHeight, 0.34], "#28547d", [0, height, -0.2]);
  group.add(backing);
  for (const x of poleXs) {
    const pole = box([0.15, height, 0.15], color, [x, height / 2, -0.2]);
    pole.userData.signPole = true;
    group.add(pole);
  }
  return group;
}

export function postedBoard(title, subtitle = "", size = 3.4) {
  return mountSignPanel(trafficBoard(title, subtitle, size));
}

export function civicPlaqueBoard(title, subtitle = "", width = 1.45) {
  const height = width * 0.56;
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    getBlueDirectionBoardMat(title, subtitle, false),
  );
  return mountSignPanel(panel, 2.25, [0], "#5a666b");
}
