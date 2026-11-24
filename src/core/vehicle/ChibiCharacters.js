import * as THREE from "three";
import { AVATAR_CATALOG, cleanAvatarId } from "../network/protocol.js";
import { markSharedResource } from "../shared/resources/sceneResources.js";

const _avatarMap = new Map(AVATAR_CATALOG.map((item) => [item.id, item]));
const _sharedMatCache = new Map();
const _starTexCache = new Map();
const _faceTexCache = new Map();
const _tubeGeoCache = new Map();

function getAvatarMeta(avatarId) {
  return _avatarMap.get(cleanAvatarId(avatarId)) || AVATAR_CATALOG[0];
}

function makeMat(color, roughness = 0.68, metalness = 0.04, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    ...extra,
  });
}

function getSharedMat(color, roughness = 0.68, metalness = 0.04, extraKey = "", buildExtra = null) {
  const key = `${color}|${roughness}|${metalness}|${extraKey}`;
  let mat = _sharedMatCache.get(key);
  if (!mat) {
    mat = markSharedResource(
      makeMat(color, roughness, metalness, buildExtra ? buildExtra() : {}),
    );
    _sharedMatCache.set(key, mat);
  }
  return mat;
}

function makeCanvas(width, height) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  if (!canvas || typeof canvas.getContext !== "function") return null;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return { canvas, ctx };
}

function drawOval(ctx, x, y, rx, ry, rot = 0) {
  if (typeof ctx.beginPath !== "function") return false;
  if (typeof ctx.ellipse === "function") {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
    return true;
  }
  if (typeof ctx.arc === "function") {
    ctx.beginPath();
    ctx.arc(x, y, (rx + ry) * 0.5, 0, Math.PI * 2);
    return true;
  }
  return false;
}

function drawCircle(ctx, x, y, r) {
  if (typeof ctx.beginPath !== "function" || typeof ctx.arc !== "function") {
    return false;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  return true;
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  if (
    typeof ctx.beginPath !== "function" ||
    typeof ctx.moveTo !== "function" ||
    typeof ctx.lineTo !== "function"
  ) {
    return false;
  }
  let rot = (Math.PI / 2) * 3;
  const step = Math.PI / spikes;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerR);
  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
    rot += step;
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerR);
  ctx.closePath?.();
  return true;
}

function finalizeTexture(canvas, srgb = true) {
  const tex = new THREE.CanvasTexture(canvas);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return markSharedResource(tex);
}

function createStarBadgeTexture(bgColor = "#1f5cb4", starColor = "#ffd24a") {
  const key = `${bgColor}|${starColor}`;
  if (_starTexCache.has(key)) return _starTexCache.get(key);
  const created = makeCanvas(256, 256);
  if (!created) return null;
  const { canvas, ctx } = created;
  ctx.fillStyle = bgColor;
  ctx.fillRect?.(0, 0, 256, 256);
  ctx.fillStyle = "#f2b830";
  ctx.fillRect?.(0, 206, 256, 22);
  ctx.fillStyle = starColor;
  if (drawStar(ctx, 128, 114, 5, 56, 23)) ctx.fill?.();
  else ctx.fillRect?.(100, 88, 56, 56);
  const tex = finalizeTexture(canvas);
  _starTexCache.set(key, tex);
  return tex;
}

function createChibiFaceTexture(avatarId) {
  const id = cleanAvatarId(avatarId);
  if (_faceTexCache.has(id)) return _faceTexCache.get(id);
  const created = makeCanvas(512, 256);
  if (!created) return null;
  const { canvas, ctx } = created;

  const baseColors = {
    boy: "#ffd9be",
    girl: "#ffe0c8",
    dog: "#f3be72",
    cat: "#f8aa44",
    cow: "#e7b15e",
    buffalo: "#4c545f",
  };
  ctx.fillStyle = baseColors[id] || "#ffd9be";
  ctx.fillRect?.(0, 0, 512, 256);

  if (id === "cat") {
    ctx.fillStyle = "#c96f1e";
    for (const [x, w, h] of [
      [256, 12, 34],
      [230, 9, 24],
      [282, 9, 24],
    ]) {
      ctx.fillRect?.(x - w / 2, 18, w, h);
    }
  } else if (id === "dog") {
    ctx.fillStyle = "#fbe4be";
    if (drawOval(ctx, 256, 178, 86, 56)) ctx.fill?.();
  } else if (id === "cow") {
    ctx.fillStyle = "#8a5228";
    if (drawOval(ctx, 186, 98, 42, 36, -0.3)) ctx.fill?.();
    ctx.fillStyle = "#fde7cb";
    if (drawOval(ctx, 256, 182, 92, 54)) ctx.fill?.();
  } else if (id === "buffalo") {
    ctx.fillStyle = "#333942";
    if (drawOval(ctx, 256, 184, 88, 52)) ctx.fill?.();
  }

  const leftEyeX = 214;
  const rightEyeX = 298;
  const eyeY = id === "boy" || id === "girl" ? 132 : 118;

  ctx.fillStyle =
    id === "buffalo" ? "rgba(244, 134, 128, 0.42)" : "rgba(255, 132, 118, 0.52)";
  for (const cx of [178, 334]) {
    if (drawOval(ctx, cx, eyeY + 34, 24, 14)) ctx.fill?.();
  }

  const irisColor =
    id === "boy" || id === "girl"
      ? "#5f341b"
      : id === "cat"
        ? "#4a7b2c"
        : "#2b1d16";

  const canStroke =
    typeof ctx.beginPath === "function" &&
    typeof ctx.moveTo === "function" &&
    typeof ctx.lineTo === "function" &&
    typeof ctx.stroke === "function";

  for (const [ex, isRight] of [
    [leftEyeX, false],
    [rightEyeX, true],
  ]) {
    ctx.fillStyle = "#ffffff";
    if (drawOval(ctx, ex, eyeY, 21, 24)) ctx.fill?.();
    ctx.fillStyle = "#221612";
    if (drawOval(ctx, ex, eyeY + 1, 17, 21)) ctx.fill?.();
    ctx.fillStyle = irisColor;
    if (drawOval(ctx, ex, eyeY + 6, 13, 12)) ctx.fill?.();
    ctx.fillStyle = "#140d0a";
    if (drawOval(ctx, ex, eyeY - 1, 9, 11)) ctx.fill?.();
    ctx.fillStyle = "#ffffff";
    if (drawCircle(ctx, ex - 5, eyeY - 8, 6.2)) ctx.fill?.();
    if (drawCircle(ctx, ex + 5, eyeY + 7, 2.8)) ctx.fill?.();

    ctx.strokeStyle = id === "buffalo" ? "#1e2228" : "#3a251c";
    ctx.lineWidth = id === "girl" ? 4.5 : 3.5;
    ctx.lineCap = "round";
    if (canStroke && typeof ctx.arc === "function") {
      ctx.beginPath();
      ctx.arc(ex, eyeY + 3, 22, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    if (canStroke && id === "girl") {
      ctx.beginPath();
      const dir = isRight ? 1 : -1;
      ctx.moveTo(ex + dir * 18, eyeY - 10);
      ctx.lineTo(ex + dir * 26, eyeY - 16);
      ctx.stroke();
    }
    if (canStroke && (id === "boy" || id === "girl")) {
      ctx.strokeStyle = "#3c2820";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex - 14, eyeY - 30);
      ctx.lineTo(ex + 14, eyeY - 32);
      ctx.stroke();
    }
  }

  if (id === "boy" || id === "girl") {
    ctx.fillStyle = "#e2a286";
    if (drawOval(ctx, 256, 160, 4.5, 3)) ctx.fill?.();
    ctx.fillStyle = "#c94c4c";
    if (canStroke && typeof ctx.quadraticCurveTo === "function") {
      ctx.beginPath();
      ctx.moveTo(240, 177);
      ctx.quadraticCurveTo(256, 198, 272, 177);
      ctx.quadraticCurveTo(256, 181, 240, 177);
      ctx.fill?.();
      ctx.fillStyle = "#ff9797";
      if (drawOval(ctx, 256, 184, 7, 4)) ctx.fill?.();
    } else if (drawOval(ctx, 256, 181, 14, 7)) {
      ctx.fill?.();
    }
  } else if (canStroke && id === "cat") {
    ctx.strokeStyle = "#8a511c";
    ctx.lineWidth = 2.6;
    for (const side of [-1, 1]) {
      for (const dy of [-8, 3]) {
        ctx.beginPath();
        ctx.moveTo(256 + side * 42, 160 + dy);
        ctx.lineTo(256 + side * 86, 154 + dy * 1.4);
        ctx.stroke();
      }
    }
  }

  const tex = finalizeTexture(canvas);
  _faceTexCache.set(id, tex);
  return tex;
}

function addPart(parent, geometry, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.rotation.set(rx, ry, rz);
  mesh.scale.set(sx, sy, sz);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addTube(parent, a, b, radius, material) {
  const p0 = new THREE.Vector3(...a);
  const p1 = new THREE.Vector3(...b);
  const dir = p1.clone().sub(p0);
  const len = dir.length();
  if (len < 1e-4) return null;
  const key = `${radius}|${len.toFixed(4)}`;
  let geo = _tubeGeoCache.get(key);
  if (!geo) {
    geo = markSharedResource(new THREE.CylinderGeometry(radius, radius, len, 12));
    _tubeGeoCache.set(key, geo);
  }
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(p0).addScaledVector(dir, 0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function buildChibiBicycle(frameColor = "#2477d4") {
  const group = new THREE.Group();
  group.name = "chibi-bicycle";

  const frameMat = makeMat(frameColor, 0.28, 0.48);
  const chromeMat = getSharedMat("#d8e0e6", 0.22, 0.85);
  const tireMat = getSharedMat("#262b30", 0.85, 0.05);
  const gripMat = getSharedMat("#2f353b", 0.82, 0.05);
  const seatMat = getSharedMat("#e8a838", 0.52, 0.08);
  const starTex = createStarBadgeTexture(frameColor, "#ffda52");
  const starGuardMat = starTex
    ? getSharedMat("#ffffff", 0.42, 0.2, `star:${frameColor}|#ffda52`, () => ({ map: starTex }))
    : frameMat;

  const wheels = [];
  const wheelR = 0.215;
  const tireTube = 0.028;
  // Total radius = 0.243 => axle y = 0.243 touches y = 0
  for (const [index, z] of [-0.43, 0.43].entries()) {
    const axle = new THREE.Group();
    axle.position.set(0, 0.243, z);
    group.add(axle);

    const spinPivot = new THREE.Group();
    axle.add(spinPivot);
    wheels.push(spinPivot);

    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR, tireTube, 10, 32),
      tireMat,
    );
    tire.rotation.y = Math.PI / 2;
    spinPivot.add(tire);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR - 0.022, 0.01, 8, 28),
      chromeMat,
    );
    rim.rotation.y = Math.PI / 2;
    spinPivot.add(rim);

    addPart(spinPivot, new THREE.CylinderGeometry(0.024, 0.024, 0.07, 12), chromeMat, 0, 0, 0, 0, 0, Math.PI / 2);

    for (let s = 0; s < 10; s++) {
      const a = (s * Math.PI) / 5;
      addTube(
        spinPivot,
        [0, 0, 0],
        [0, Math.sin(a) * (wheelR - 0.02), Math.cos(a) * (wheelR - 0.02)],
        0.004,
        chromeMat,
      );
    }

    // Blue fender arc over each wheel (child of non-spinning axle)
    const fender = new THREE.Mesh(
      new THREE.TorusGeometry(wheelR + 0.044, 0.018, 8, 18, Math.PI * 0.72),
      frameMat,
    );
    fender.rotation.y = Math.PI / 2;
    fender.rotation.z = Math.PI * 0.14;
    axle.add(fender);

    if (index === 1) group.frontAxle = axle;
  }

  // Frame joints matching cute low-step chibi bike in reference
  const rear = [0, 0.243, -0.43];
  const bb = [0, 0.26, -0.05];
  const seatTop = [0, 0.56, -0.17];
  const seatMid = [0, 0.45, -0.13];
  const headBot = [0, 0.48, 0.25];
  const headTop = [0, 0.62, 0.22];
  const front = [0, 0.243, 0.43];

  addTube(group, rear, bb, 0.018, frameMat);
  addTube(group, rear, seatMid, 0.016, frameMat);
  addTube(group, bb, seatTop, 0.021, frameMat);
  addTube(group, bb, headBot, 0.022, frameMat);
  addTube(group, seatMid, headTop, 0.02, frameMat);
  addTube(group, headBot, headTop, 0.022, frameMat);

  // Cute yellow star chain guard plaque like reference bike
  const guard = addPart(
    group,
    new THREE.BoxGeometry(0.055, 0.14, 0.36),
    starGuardMat,
    0.042,
    0.255,
    -0.23,
    0.04,
    0,
    0,
  );
  guard.name = "bike-chain-guard";

  // Spring saddle seat
  addTube(group, seatTop, [0, 0.62, -0.17], 0.015, chromeMat);
  addPart(
    group,
    new THREE.SphereGeometry(0.11, 14, 10),
    seatMat,
    0,
    0.635,
    -0.18,
    0,
    0,
    0,
    0.95,
    0.34,
    1.25,
  );

  // Steering assembly (front fork + swept U handlebars)
  const steerPivot = new THREE.Group();
  steerPivot.position.set(0, 0.62, 0.22);
  group.add(steerPivot);
  // Fork blades in local coords relative to headTop (0, 0.62, 0.22)
  for (const sx of [-0.045, 0.045]) {
    addTube(steerPivot, [sx * 0.6, -0.14, 0.03], [sx, -0.377, 0.21], 0.014, frameMat);
  }
  addTube(steerPivot, [0, 0, 0], [0, 0.13, -0.02], 0.016, chromeMat);
  addTube(steerPivot, [-0.17, 0.13, -0.02], [0.17, 0.13, -0.02], 0.014, chromeMat);
  for (const sx of [-1, 1]) {
    addTube(steerPivot, [sx * 0.17, 0.13, -0.02], [sx * 0.20, 0.155, -0.06], 0.014, chromeMat);
    addPart(
      steerPivot,
      new THREE.CylinderGeometry(0.019, 0.019, 0.085, 10),
      gripMat,
      sx * 0.205,
      0.16,
      -0.065,
      Math.PI / 2.2,
      0,
      sx * 0.25,
    );
  }
  // Yellow head badge star + mini chrome bell
  addPart(group, new THREE.OctahedronGeometry(0.035), makeMat("#ffda52", 0.35, 0.2), 0, 0.56, 0.255, 0, 0, 0, 1, 1, 0.3);
  addPart(steerPivot, new THREE.SphereGeometry(0.024, 10, 8), makeMat("#ffd050", 0.25, 0.7), 0.12, 0.155, -0.03);

  // Rotating Crank & Pedals
  const crank = new THREE.Group();
  crank.position.set(0, 0.26, -0.05);
  group.add(crank);
  addPart(crank, new THREE.CylinderGeometry(0.068, 0.068, 0.016, 16), chromeMat, 0, 0, 0, 0, 0, Math.PI / 2);
  addTube(crank, [-0.145, -0.09, 0], [0.145, 0.09, 0], 0.012, chromeMat);
  const pedalL = addPart(crank, new THREE.BoxGeometry(0.065, 0.022, 0.085), gripMat, -0.145, -0.09, 0);
  const pedalR = addPart(crank, new THREE.BoxGeometry(0.065, 0.022, 0.085), gripMat, 0.145, 0.09, 0);

  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });

  return {
    group,
    wheels,
    crank,
    pedalL,
    pedalR,
    steerPivot,
    setColor(color) {
      frameMat.color.set(color);
    },
  };
}

function buildBackpack(parent, color = "#2260b8") {
  const pack = new THREE.Group();
  pack.name = "chibi-backpack";
  const packMat = getSharedMat(color, 0.72, 0.04);
  const goldMat = getSharedMat("#f2bf38", 0.52, 0.1);
  const starTex = createStarBadgeTexture(color, "#ffd654");
  const frontMat = starTex
    ? getSharedMat("#ffffff", 0.65, 0.05, `star:${color}|#ffd654`, () => ({ map: starTex }))
    : packMat;

  // Main rounded bag
  addPart(pack, new THREE.SphereGeometry(0.145, 16, 14), packMat, 0, 0.19, -0.17, 0, 0, 0, 1.05, 1.18, 0.76);
  // Pocket with star plaque
  addPart(pack, new THREE.BoxGeometry(0.18, 0.15, 0.06), frontMat, 0, 0.15, -0.255);
  // Gold zipper piping & top carry loop
  addPart(pack, new THREE.TorusGeometry(0.042, 0.012, 8, 16, Math.PI), goldMat, 0, 0.355, -0.155);
  // Shoulder straps hugging torso shoulders
  for (const sx of [-0.115, 0.115]) {
    addPart(pack, new THREE.TorusGeometry(0.11, 0.022, 8, 16, Math.PI * 0.95), packMat, sx, 0.24, -0.05, 0, Math.PI / 2, 0);
  }
  parent.add(pack);
  return pack;
}

function buildHumanRig(avatarId) {
  const isGirl = avatarId === "girl";
  const root = new THREE.Group();
  root.name = `chibi-${avatarId}`;

  const skinMat = getSharedMat(isGirl ? "#ffe0c8" : "#ffd9be", 0.62, 0.02);
  const shirtMat = getSharedMat("#f8fafc", 0.72, 0.02);
  const navyMat = getSharedMat(isGirl ? "#2b3854" : "#22324c", 0.76, 0.03);
  const scarfMat = getSharedMat("#dc2f2f", 0.58, 0.04);
  const sockMat = getSharedMat("#ffffff", 0.72, 0.02);
  const shoeMat = getSharedMat(isGirl ? "#323845" : "#2b2f38", 0.58, 0.06);
  const soleMat = getSharedMat("#eceef2", 0.78, 0.02);
  const hairMat = getSharedMat(isGirl ? "#3b2318" : "#3a2820", 0.62, 0.05);
  const bowMat = getSharedMat("#eb678e", 0.52, 0.06);

  // Ground anchor -> Body pivot (for bounce & sitting transition)
  const bodyPivot = new THREE.Group();
  bodyPivot.position.set(0, 0.44, 0);
  root.add(bodyPivot);

  // Pelvis / Shorts / Skirt base (center at bodyPivot origin y=0.44)
  addPart(
    bodyPivot,
    new THREE.SphereGeometry(0.17, 16, 12),
    navyMat,
    0,
    0.02,
    0,
    0,
    0,
    0,
    1.05,
    0.72,
    0.88,
  );
  if (isGirl) {
    // Flared cute pleated schoolgirl skirt
    addPart(
      bodyPivot,
      new THREE.CylinderGeometry(0.16, 0.245, 0.19, 18),
      navyMat,
      0,
      -0.01,
      0,
    );
  }

  // Torso pivot sits on pelvis
  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.04, 0);
  bodyPivot.add(torsoPivot);

  // White school uniform shirt
  addPart(
    torsoPivot,
    new THREE.CylinderGeometry(0.145, 0.165, 0.30, 16),
    shirtMat,
    0,
    0.17,
    0,
    0,
    0,
    0,
    1.08,
    1,
    0.85,
  );
  // Crisp collar
  addPart(
    torsoPivot,
    new THREE.TorusGeometry(0.11, 0.022, 8, 18),
    shirtMat,
    0,
    0.31,
    0.01,
    Math.PI / 2,
    0,
    0,
  );

  // Red Pioneer Scarf (Khăn quàng đỏ)
  addPart(
    torsoPivot,
    new THREE.TorusGeometry(0.115, 0.024, 8, 18),
    scarfMat,
    0,
    0.295,
    0.015,
    Math.PI / 2 + 0.15,
    0,
    0,
  );
  addPart(torsoPivot, new THREE.SphereGeometry(0.032, 10, 8), scarfMat, 0, 0.255, 0.125);
  const scarfTailL = addPart(
    torsoPivot,
    new THREE.ConeGeometry(0.036, 0.16, 8),
    scarfMat,
    -0.034,
    0.17,
    0.135,
    0.1,
    0,
    0.18,
    0.8,
    1,
    0.45,
  );
  const scarfTailR = addPart(
    torsoPivot,
    new THREE.ConeGeometry(0.032, 0.14, 8),
    scarfMat,
    0.036,
    0.18,
    0.132,
    0.1,
    0,
    -0.18,
    0.8,
    1,
    0.45,
  );

  // Backpack
  buildBackpack(torsoPivot, isGirl ? "#df5f86" : "#2260b8");

  // Head pivot
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.34, 0.01);
  torsoPivot.add(headPivot);

  // Neck
  addPart(headPivot, new THREE.CylinderGeometry(0.06, 0.075, 0.09, 12), skinMat, 0, 0.02, 0);

  // Big Chibi Head with high-detail face CanvasTexture
  const faceTex = createChibiFaceTexture(avatarId);
  const headMat = faceTex
    ? getSharedMat("#ffffff", 0.62, 0.02, `face:${avatarId}`, () => ({ map: faceTex }))
    : skinMat;
  const headSphere = addPart(
    headPivot,
    new THREE.SphereGeometry(0.245, 28, 22),
    headMat,
    0,
    0.26,
    0.01,
    0,
    -Math.PI / 2,
    0,
    1.0,
    0.96,
    1.04,
  );
  headSphere.name = "chibi-head-face";

  // Cute 3D ears
  for (const sx of [-1, 1]) {
    addPart(
      headPivot,
      new THREE.SphereGeometry(0.052, 12, 10),
      skinMat,
      sx * 0.245,
      0.23,
      -0.01,
      0,
      0,
      0,
      0.7,
      1.05,
      0.85,
    );
  }

  // Sculpted Chibi Hair
  const hairCap = addPart(
    headPivot,
    new THREE.SphereGeometry(0.258, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
    0,
    0.275,
    -0.01,
    -0.24,
    0,
    0,
    1.04,
    0.98,
    1.06,
  );
  hairCap.castShadow = true;

  // Back hair bowl
  addPart(
    headPivot,
    new THREE.SphereGeometry(0.254, 20, 14, Math.PI * 0.55, Math.PI * 0.9, 0.25, Math.PI * 0.62),
    hairMat,
    0,
    0.255,
    -0.02,
    0,
    Math.PI * 0.5,
    0,
    1.04,
    0.98,
    1.04,
  );

  // Tousled bangs / hair spikes along forehead
  const spikeOffsets = isGirl
    ? [
        [-0.12, 0.42, 0.19, 0.3, 0.2, 0.18],
        [-0.04, 0.435, 0.21, 0.35, 0, 0.08],
        [0.05, 0.435, 0.21, 0.35, 0, -0.08],
        [0.13, 0.415, 0.19, 0.3, -0.2, -0.18],
      ]
    : [
        [-0.13, 0.43, 0.18, 0.4, 0.25, 0.28],
        [-0.04, 0.445, 0.20, 0.45, 0.05, 0.1],
        [0.06, 0.445, 0.20, 0.45, -0.05, -0.12],
        [0.14, 0.425, 0.18, 0.35, -0.25, -0.28],
        [0, 0.535, 0.05, -0.2, 0, 0.2],
        [-0.1, 0.52, -0.02, -0.4, 0, 0.55],
        [0.11, 0.515, -0.03, -0.4, 0, -0.55],
        [0, 0.50, -0.13, -0.7, 0, -0.1],
      ];
  for (const [x, y, z, rx, ry, rz] of spikeOffsets) {
    addPart(
      headPivot,
      new THREE.ConeGeometry(0.07, 0.16, 8),
      hairMat,
      x,
      y,
      z,
      rx,
      ry,
      rz,
      0.95,
      1,
      0.7,
    );
  }

  let hairPigtailL = null;
  let hairPigtailR = null;
  if (isGirl) {
    // Twin cute chibi pigtails + pink hair ribbons
    const buildPigtail = (sx) => {
      const p = new THREE.Group();
      p.position.set(sx * 0.24, 0.34, -0.10);
      addPart(p, new THREE.SphereGeometry(0.035, 10, 8), bowMat, 0, 0.02, 0);
      addPart(p, new THREE.BoxGeometry(0.085, 0.038, 0.032), bowMat, sx * 0.02, 0.03, 0.02, 0, 0, sx * 0.2);
      addPart(p, new THREE.ConeGeometry(0.085, 0.26, 12), hairMat, sx * 0.055, -0.11, -0.04, 0.2, 0, sx * 0.35, 0.85, 1, 0.9);
      addPart(p, new THREE.SphereGeometry(0.072, 12, 10), hairMat, sx * 0.04, -0.06, -0.03);
      headPivot.add(p);
      return p;
    };
    hairPigtailL = buildPigtail(-1);
    hairPigtailR = buildPigtail(1);
  }

  // Arms
  const buildArm = (sx) => {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.20, 0.28, 0);
    // Shirt sleeve
    addPart(arm, new THREE.CylinderGeometry(0.055, 0.062, 0.11, 12), shirtMat, 0, -0.035, 0, 0, 0, sx * 0.12);
    // Upper arm
    addPart(arm, new THREE.CapsuleGeometry(0.042, 0.10, 6, 10), skinMat, 0, -0.11, 0);
    // Forearm + elbow pivot
    const forearm = new THREE.Group();
    forearm.position.set(0, -0.16, 0);
    arm.add(forearm);
    addPart(forearm, new THREE.CapsuleGeometry(0.038, 0.10, 6, 10), skinMat, 0, -0.06, 0);
    // Chibi hand
    addPart(forearm, new THREE.SphereGeometry(0.046, 12, 10), skinMat, 0, -0.135, 0.01);
    arm.forearm = forearm;
    torsoPivot.add(arm);
    return arm;
  };
  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // Legs (anchored at hip relative to bodyPivot y=0.44 -> sole reaches -0.44 => local y=0)
  const buildLeg = (sx) => {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.095, -0.02, 0);
    if (!isGirl) {
      // Navy shorts leg cuff
      addPart(leg, new THREE.CylinderGeometry(0.072, 0.078, 0.16, 14), navyMat, 0, -0.07, 0);
    } else {
      addPart(leg, new THREE.CapsuleGeometry(0.052, 0.12, 6, 10), skinMat, 0, -0.08, 0);
    }
    const shin = new THREE.Group();
    shin.position.set(0, -0.16, 0);
    leg.add(shin);
    // Skin knee + crisp white sock + dark sneaker with thick white sole
    addPart(shin, new THREE.CapsuleGeometry(0.046, 0.08, 6, 10), skinMat, 0, -0.04, 0);
    addPart(shin, new THREE.CylinderGeometry(0.048, 0.046, 0.10, 12), sockMat, 0, -0.12, 0);
    addPart(shin, new THREE.SphereGeometry(0.062, 12, 10), shoeMat, 0, -0.20, 0.025, 0, 0, 0, 0.92, 0.72, 1.38);
    addPart(shin, new THREE.BoxGeometry(0.11, 0.032, 0.168), soleMat, 0, -0.244, 0.025);
    leg.shin = shin;
    bodyPivot.add(leg);
    return leg;
  };
  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  return {
    id: avatarId,
    kind: "human",
    root,
    bodyPivot,
    torsoPivot,
    headPivot,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    scarfTailL,
    scarfTailR,
    hairPigtailL,
    hairPigtailR,
    headTopY: 1.46,
    baseBodyY: 0.44,
  };
}

function buildAnimalRig(avatarId) {
  const root = new THREE.Group();
  root.name = `chibi-${avatarId}`;

  const palette = {
    dog: {
      fur: "#f1b96b",
      belly: "#fce5bd",
      ear: "#b97334",
      collar: "#d93636",
      nose: "#282220",
      paw: "#fbe6c4",
    },
    cat: {
      fur: "#f7a53e",
      belly: "#fde8c8",
      ear: "#f5942c",
      collar: "#2f9c76",
      nose: "#f07c86",
      paw: "#fef0d8",
    },
    cow: {
      fur: "#e6af5d",
      belly: "#fde9ca",
      ear: "#9c5e2c",
      collar: "#cc3a3a",
      nose: "#eb9a9a",
      paw: "#47352c",
    },
    buffalo: {
      fur: "#48505b",
      belly: "#606a78",
      ear: "#3a404a",
      collar: "#d48d2a",
      nose: "#2a2e36",
      paw: "#23262c",
    },
  }[avatarId];

  const furMat = getSharedMat(palette.fur, 0.78, 0.02);
  const bellyMat = getSharedMat(palette.belly, 0.80, 0.02);
  const earMat = getSharedMat(palette.ear, 0.78, 0.02);
  const innerEarMat = getSharedMat("#f6a6b2", 0.72, 0.02);
  const collarMat = getSharedMat(palette.collar, 0.48, 0.08);
  const goldMat = getSharedMat("#ffd34e", 0.25, 0.72);
  const hornMat = getSharedMat(avatarId === "buffalo" ? "#262a31" : "#f4e6c8", 0.45, 0.12);
  const noseMat = getSharedMat(palette.nose, 0.35, 0.08);
  const pawMat = getSharedMat(palette.paw, avatarId === "cow" || avatarId === "buffalo" ? 0.55 : 0.78, 0.05);

  const bodyPivot = new THREE.Group();
  bodyPivot.position.set(0, 0.38, 0);
  root.add(bodyPivot);

  // Spine pivot sits horizontally (0 rad) when walking/running on 4 legs, and rotates upright (-0.75 rad) when riding the bike!
  const spinePivot = new THREE.Group();
  bodyPivot.add(spinePivot);

  // Plump Chibi Animal Torso along Z axis
  addPart(
    spinePivot,
    new THREE.SphereGeometry(0.195, 20, 16),
    furMat,
    0,
    0.04,
    0.02,
    0,
    0,
    0,
    0.98,
    0.94,
    1.36,
  );
  // Soft cream/highlight underbelly
  addPart(
    spinePivot,
    new THREE.SphereGeometry(0.15, 16, 12),
    bellyMat,
    0,
    -0.02,
    0.06,
    0,
    0,
    0,
    0.85,
    0.72,
    1.15,
  );
  // Decorative cow patches
  if (avatarId === "cow") {
    const patchMat = makeMat("#8b5329", 0.78, 0.02);
    addPart(spinePivot, new THREE.SphereGeometry(0.11, 12, 10), patchMat, 0.13, 0.09, -0.06, 0, 0, 0, 0.6, 0.9, 1.1);
    addPart(spinePivot, new THREE.SphereGeometry(0.09, 12, 10), patchMat, -0.14, 0.11, 0.08, 0, 0, 0, 0.5, 0.85, 0.9);
  }
  // Tabby stripes on cat back
  if (avatarId === "cat") {
    const stripeMat = makeMat("#c56d1c", 0.78, 0.02);
    for (const z of [-0.08, 0.0, 0.08]) {
      addPart(spinePivot, new THREE.TorusGeometry(0.14, 0.018, 6, 14, Math.PI * 0.9), stripeMat, 0, 0.09, z, 0, 0, 0);
    }
  }

  // Collar + Golden Bell / Tag at chest-neck junction
  addPart(
    spinePivot,
    new THREE.TorusGeometry(0.135, 0.026, 8, 20),
    collarMat,
    0,
    0.13,
    0.20,
    0.55,
    0,
    0,
  );
  const bell = addPart(
    spinePivot,
    new THREE.SphereGeometry(avatarId === "cow" ? 0.045 : 0.036, 12, 10),
    goldMat,
    0,
    0.05,
    0.30,
  );

  // Cute Articulated Head Pivot attached cleanly to neck front
  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.21, 0.23);
  spinePivot.add(headPivot);

  const faceTex = createChibiFaceTexture(avatarId);
  const headMat = faceTex
    ? getSharedMat("#ffffff", 0.74, 0.02, `face:${avatarId}`, () => ({ map: faceTex }))
    : furMat;
  addPart(
    headPivot,
    new THREE.SphereGeometry(0.225, 24, 20),
    headMat,
    0,
    0.18,
    0.02,
    0,
    -Math.PI / 2,
    0,
    1.04,
    0.94,
    1.02,
  );

  // Cute protruding 3D Muzzle + Glossy Nose
  addPart(
    headPivot,
    new THREE.SphereGeometry(0.095, 14, 12),
    avatarId === "buffalo" ? furMat : bellyMat,
    0,
    0.125,
    0.20,
    0,
    0,
    0,
    1.18,
    0.78,
    0.85,
  );
  addPart(
    headPivot,
    new THREE.SphereGeometry(avatarId === "cow" || avatarId === "buffalo" ? 0.038 : 0.03, 12, 10),
    noseMat,
    0,
    0.155,
    0.265,
    0,
    0,
    0,
    1.3,
    0.85,
    0.85,
  );

  // Distinct species ears & horns
  const earL = new THREE.Group();
  const earR = new THREE.Group();
  headPivot.add(earL, earR);

  if (avatarId === "dog") {
    earL.position.set(-0.20, 0.24, 0.01);
    earR.position.set(0.20, 0.24, 0.01);
    addPart(earL, new THREE.SphereGeometry(0.088, 12, 10), earMat, -0.02, -0.07, 0.01, 0.1, 0, 0.35, 0.52, 1.45, 0.78);
    addPart(earR, new THREE.SphereGeometry(0.088, 12, 10), earMat, 0.02, -0.07, 0.01, 0.1, 0, -0.35, 0.52, 1.45, 0.78);
  } else if (avatarId === "cat") {
    earL.position.set(-0.14, 0.35, 0.01);
    earR.position.set(0.14, 0.35, 0.01);
    addPart(earL, new THREE.ConeGeometry(0.075, 0.15, 4), earMat, 0, 0.05, 0, 0.12, Math.PI / 4, 0.32);
    addPart(earL, new THREE.ConeGeometry(0.045, 0.10, 4), innerEarMat, 0, 0.04, 0.016, 0.12, Math.PI / 4, 0.32);
    addPart(earR, new THREE.ConeGeometry(0.075, 0.15, 4), earMat, 0, 0.05, 0, 0.12, Math.PI / 4, -0.32);
    addPart(earR, new THREE.ConeGeometry(0.045, 0.10, 4), innerEarMat, 0, 0.04, 0.016, 0.12, Math.PI / 4, -0.32);
  } else if (avatarId === "cow") {
    earL.position.set(-0.21, 0.24, -0.01);
    earR.position.set(0.21, 0.24, -0.01);
    addPart(earL, new THREE.SphereGeometry(0.075, 12, 10), earMat, -0.06, -0.02, 0, 0, 0, 1.15, 0.55, 1.35, 0.75);
    addPart(earR, new THREE.SphereGeometry(0.075, 12, 10), earMat, 0.06, -0.02, 0, 0, 0, -1.15, 0.55, 1.35, 0.75);
    // Short rounded ivory cow horns
    for (const sx of [-1, 1]) {
      addPart(headPivot, new THREE.ConeGeometry(0.036, 0.105, 10), hornMat, sx * 0.13, 0.365, 0.02, 0.15, 0, -sx * 0.35);
    }
  } else if (avatarId === "buffalo") {
    earL.position.set(-0.21, 0.21, -0.02);
    earR.position.set(0.21, 0.21, -0.02);
    addPart(earL, new THREE.SphereGeometry(0.072, 12, 10), earMat, -0.06, -0.03, 0, 0, 0, 1.25, 0.5, 1.35, 0.75);
    addPart(earR, new THREE.SphereGeometry(0.072, 12, 10), earMat, 0.06, -0.03, 0, 0, 0, -1.25, 0.5, 1.35, 0.75);
    // Iconic crescent Vietnamese water buffalo horns sweeping out & up
    for (const sx of [-1, 1]) {
      const horn = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.034, 10, 18, Math.PI * 0.72),
        hornMat,
      );
      horn.position.set(sx * 0.17, 0.32, -0.04);
      horn.rotation.set(-0.35, sx * 0.35, sx > 0 ? -Math.PI * 0.18 : Math.PI * 0.46);
      horn.castShadow = true;
      headPivot.add(horn);
    }
  }

  // Articulated Wagging Tail
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0.10, -0.22);
  spinePivot.add(tailPivot);
  if (avatarId === "cat") {
    addPart(tailPivot, new THREE.TorusGeometry(0.12, 0.032, 8, 16, Math.PI * 1.15), furMat, 0, 0.10, -0.08, 0, Math.PI / 2, 0.3);
  } else if (avatarId === "dog") {
    addPart(tailPivot, new THREE.CapsuleGeometry(0.036, 0.14, 6, 10), furMat, 0, 0.08, -0.06, -0.6, 0, 0);
  } else {
    // Cow / buffalo rope-like tail with tuft tip
    addPart(tailPivot, new THREE.CylinderGeometry(0.018, 0.014, 0.22, 8), furMat, 0, -0.07, -0.05, 0.35, 0, 0);
    addPart(tailPivot, new THREE.SphereGeometry(0.038, 10, 8), earMat, 0, -0.17, -0.09);
  }

  // 4 Articulated Legs attached to bodyPivot (stay grounded cleanly in walk/run, fold into handlebars & pedals in bike)
  const makeAnimalLimb = (x, z, len = 0.24) => {
    const leg = new THREE.Group();
    leg.position.set(x, -0.06, z);
    addPart(leg, new THREE.CapsuleGeometry(0.052, len, 6, 10), furMat, 0, -len * 0.45, 0);
    addPart(leg, new THREE.SphereGeometry(0.056, 12, 10), pawMat, 0, -len * 0.92 - 0.02, 0.02, 0, 0, 0, 0.95, 0.72, 1.25);
    bodyPivot.add(leg);
    return leg;
  };

  const frontLeftLeg = makeAnimalLimb(-0.12, 0.15, 0.25);
  const frontRightLeg = makeAnimalLimb(0.12, 0.15, 0.25);
  const backLeftLeg = makeAnimalLimb(-0.12, -0.15, 0.25);
  const backRightLeg = makeAnimalLimb(0.12, -0.15, 0.25);

  return {
    id: avatarId,
    kind: "animal",
    root,
    bodyPivot,
    spinePivot,
    headPivot,
    earL,
    earR,
    bell,
    tailPivot,
    frontLeftLeg,
    frontRightLeg,
    backLeftLeg,
    backRightLeg,
    headTopY: avatarId === "buffalo" ? 1.18 : 1.12,
    baseBodyY: 0.38,
  };
}

export function buildChibiActor(avatarId = "boy", { includeBike = true } = {}) {
  const id = cleanAvatarId(avatarId);
  const meta = getAvatarMeta(id);
  const actor = new THREE.Group();
  actor.name = "chibi-actor";

  const character =
    meta.kind === "human" ? buildHumanRig(id) : buildAnimalRig(id);
  const bike = includeBike ? buildChibiBicycle(meta.bikeColor) : null;
  if (bike) {
    bike.group.visible = false;
    actor.add(bike.group);
  }

  actor.add(character.root);

  return {
    avatarId: id,
    meta,
    actor,
    character,
    bike,
    wheels: bike?.wheels || [],
    crank: bike?.crank || null,
    headTopY: character.headTopY,
  };
}

export function animateChibiActor(
  rig,
  {
    stance = "idle",
    speed = 0,
    phase = 0,
    idleTime = 0,
    pedalPhase = 0,
    steer = 0,
  } = {},
) {
  if (!rig || !rig.character) return;
  const char = rig.character;
  const bike = rig.bike;
  const isBike = Boolean(bike) && stance === "bike";
  const isRun = stance === "run";
  const isWalk = stance === "walk";
  const absSpeed = Math.abs(speed);

  if (bike) {
    bike.group.visible = isBike;
    if (isBike && bike.steerPivot) {
      bike.steerPivot.rotation.y = steer * 0.42;
      bike.pedalL.rotation.x = -pedalPhase;
      bike.pedalR.rotation.x = -pedalPhase;
    }
  }

  if (char.kind === "human") {
    if (isBike) {
      // Seated on bike saddle at (0, 0.635, -0.18), feet cranking pedals, hands gripping handlebars
      char.bodyPivot.position.set(0, 0.62, -0.17);
      char.bodyPivot.rotation.set(0, 0, 0);
      char.torsoPivot.rotation.set(0.24, 0, 0);
      char.headPivot.rotation.set(-0.2, steer * 0.16, 0);

      // Legs pedal cleanly around crank at (0, 0.26, -0.05) relative to bike
      const crankRadius = 0.085;
      const pL = pedalPhase;
      const pR = pedalPhase + Math.PI;
      char.leftLeg.position.set(-0.125, -0.02 + Math.sin(pL) * crankRadius, 0.07 + Math.cos(pL) * 0.05);
      char.rightLeg.position.set(0.125, -0.02 + Math.sin(pR) * crankRadius, 0.07 + Math.cos(pR) * 0.05);
      char.leftLeg.rotation.set(-0.72 + Math.cos(pL) * 0.26, 0, 0);
      char.rightLeg.rotation.set(-0.72 + Math.cos(pR) * 0.26, 0, 0);
      char.leftLeg.shin.rotation.set(0.76 - Math.cos(pL) * 0.24, 0, 0);
      char.rightLeg.shin.rotation.set(0.76 - Math.cos(pR) * 0.24, 0, 0);

      // Arms reach forward smoothly to grip handlebars at y≈0.78, z≈0.16
      char.leftArm.rotation.set(-1.12, 0, -0.08);
      char.rightArm.rotation.set(-1.12, 0, 0.08);
      char.leftArm.forearm.rotation.set(-0.28, 0, 0);
      char.rightArm.forearm.rotation.set(-0.28, 0, 0);

      const wind = Math.sin(idleTime * 8 + absSpeed) * 0.06;
      char.scarfTailL.rotation.x = 0.22 + wind;
      char.scarfTailR.rotation.x = 0.22 - wind;
      if (char.hairPigtailL) {
        char.hairPigtailL.rotation.x = 0.15 + wind * 1.4;
        char.hairPigtailR.rotation.x = 0.15 - wind * 1.4;
      }
      return;
    }

    // Reset hip X/Z & leg positions for ground standing/walking/running
    char.leftLeg.position.set(-0.095, -0.02, 0);
    char.rightLeg.position.set(0.095, -0.02, 0);

    if (isWalk || isRun) {
      const freq = isRun ? 1.35 : 1.0;
      const p = phase * freq;
      const s = Math.sin(p);
      const c = Math.cos(p);
      const hop = isRun ? Math.abs(s) * 0.075 : Math.abs(s) * 0.028;
      const stride = isRun ? 0.78 : 0.44;
      const armSwing = isRun ? 0.88 : 0.46;

      char.bodyPivot.position.set(0, char.baseBodyY + hop, 0);
      char.bodyPivot.rotation.set(0, 0, 0);
      char.torsoPivot.rotation.set(isRun ? 0.24 : 0.06, s * 0.06, 0);
      char.headPivot.rotation.set(isRun ? -0.18 : -0.03, steer * 0.18 - s * 0.04, 0);

      char.leftLeg.rotation.set(s * stride, 0, 0);
      char.rightLeg.rotation.set(-s * stride, 0, 0);
      // High knee bend on back-swing matching chibi sprite sheet in reference!
      char.leftLeg.shin.rotation.set(
        isRun ? Math.max(0.08, -c * 0.95 + 0.35) : Math.max(0, -c * 0.36 + 0.1),
        0,
        0,
      );
      char.rightLeg.shin.rotation.set(
        isRun ? Math.max(0.08, c * 0.95 + 0.35) : Math.max(0, c * 0.36 + 0.1),
        0,
        0,
      );

      char.leftArm.rotation.set(-s * armSwing, 0, 0.06);
      char.rightArm.rotation.set(s * armSwing, 0, -0.06);
      const elbowBend = isRun ? -0.92 : -0.24;
      char.leftArm.forearm.rotation.set(elbowBend, 0, 0);
      char.rightArm.forearm.rotation.set(elbowBend, 0, 0);

      const flutter = Math.sin(p * 1.4) * (isRun ? 0.14 : 0.05);
      char.scarfTailL.rotation.x = 0.14 + flutter;
      char.scarfTailR.rotation.x = 0.14 - flutter;
      if (char.hairPigtailL) {
        char.hairPigtailL.rotation.x = (isRun ? 0.28 : 0.08) + flutter;
        char.hairPigtailR.rotation.x = (isRun ? 0.28 : 0.08) - flutter;
      }
    } else {
      // Idle pose: relaxed breathing + cheerful subtle chibi wave on left arm (like 1st pose of reference sheet!)
      const breathe = Math.sin(idleTime * 2.4);
      const waveCycle = Math.sin(idleTime * 3.8);
      char.bodyPivot.position.set(0, char.baseBodyY + breathe * 0.008, 0);
      char.bodyPivot.rotation.set(0, 0, 0);
      char.torsoPivot.rotation.set(0, 0, 0);
      char.headPivot.rotation.set(breathe * 0.03, Math.sin(idleTime * 0.9) * 0.06, 0);

      char.leftLeg.rotation.set(0, 0, 0.03);
      char.rightLeg.rotation.set(0, 0, -0.03);
      char.leftLeg.shin.rotation.set(0, 0, 0);
      char.rightLeg.shin.rotation.set(0, 0, 0);

      char.leftArm.rotation.set(0.04, 0, 0.08);
      char.leftArm.forearm.rotation.set(-0.08, 0, 0);
      // Friendly wave pose with right hand raised slightly or relaxed breathing
      const waving = Math.max(0, Math.sin(idleTime * 0.65));
      char.rightArm.rotation.set(-0.12 - waving * 1.15, 0, -0.14 - waving * 0.45);
      char.rightArm.forearm.rotation.set(-0.2 - waving * 0.35, 0, waving * waveCycle * 0.28);

      char.scarfTailL.rotation.x = 0.1 + breathe * 0.03;
      char.scarfTailR.rotation.x = 0.1 - breathe * 0.03;
      if (char.hairPigtailL) {
        char.hairPigtailL.rotation.x = breathe * 0.04;
        char.hairPigtailR.rotation.x = breathe * 0.04;
      }
    }
    return;
  }

  // Animal Chibi Rigs (dog, cat, cow, buffalo)
  if (isBike) {
    // Anthropomorphic cute upright sitting pose on saddle
    char.bodyPivot.position.set(0, 0.62, -0.16);
    char.bodyPivot.rotation.set(0, 0, 0);
    char.spinePivot.rotation.set(-0.92, 0, 0);
    char.headPivot.rotation.set(0.88, steer * 0.18, 0);
    char.tailPivot.rotation.set(0.4, Math.sin(idleTime * 5 + absSpeed) * 0.28, 0);

    // Front limbs reach forward cleanly onto bicycle handlebars
    char.frontLeftLeg.position.set(-0.15, 0.22, 0.09);
    char.frontRightLeg.position.set(0.15, 0.22, 0.09);
    char.frontLeftLeg.rotation.set(-1.12, 0, -0.14);
    char.frontRightLeg.rotation.set(-1.12, 0, 0.14);

    // Hind limbs pump pedals cleanly around bottom bracket
    const pL = pedalPhase;
    const pR = pedalPhase + Math.PI;
    char.backLeftLeg.position.set(-0.13, -0.05 + Math.sin(pL) * 0.075, 0.08 + Math.cos(pL) * 0.04);
    char.backRightLeg.position.set(0.13, -0.05 + Math.sin(pR) * 0.075, 0.08 + Math.cos(pR) * 0.04);
    char.backLeftLeg.rotation.set(-0.45 + Math.cos(pL) * 0.3, 0, 0);
    char.backRightLeg.rotation.set(-0.45 + Math.cos(pR) * 0.3, 0, 0);

    const flap = Math.sin(idleTime * 6 + absSpeed * 1.2) * 0.08;
    char.earL.rotation.z = flap;
    char.earR.rotation.z = -flap;
    return;
  }

  // Ground 4-legged stance (idle, walk, run)
  char.spinePivot.rotation.set(0, 0, 0);
  char.frontLeftLeg.position.set(-0.12, -0.06, 0.15);
  char.frontRightLeg.position.set(0.12, -0.06, 0.15);
  char.backLeftLeg.position.set(-0.12, -0.06, -0.15);
  char.backRightLeg.position.set(0.12, -0.06, -0.15);

  if (isRun) {
    // Bounding gallop cycle: front legs pair vs back legs pair with lively bounce
    const p = phase * 1.45;
    const fSwing = Math.sin(p) * 0.72;
    const bSwing = Math.sin(p + Math.PI * 0.85) * 0.72;
    const bounce = Math.abs(Math.sin(p)) * 0.09;

    char.bodyPivot.position.set(0, char.baseBodyY + bounce, 0);
    char.spinePivot.rotation.set(Math.cos(p) * 0.12, 0, 0);
    char.headPivot.rotation.set(-Math.cos(p) * 0.08, steer * 0.2, 0);
    char.frontLeftLeg.rotation.set(fSwing, 0, 0);
    char.frontRightLeg.rotation.set(fSwing + 0.16, 0, 0);
    char.backLeftLeg.rotation.set(bSwing, 0, 0);
    char.backRightLeg.rotation.set(bSwing + 0.16, 0, 0);
    char.tailPivot.rotation.set(-0.15, Math.sin(p * 1.5) * 0.35, 0);
    char.earL.rotation.z = Math.sin(p) * 0.18;
    char.earR.rotation.z = -Math.sin(p) * 0.18;
    char.bell.rotation.x = Math.sin(p) * 0.25;
  } else if (isWalk) {
    // Diagonal 4-beat trot (FL + BR vs FR + BL)
    const p = phase * 1.15;
    const s = Math.sin(p);
    const bounce = Math.abs(s) * 0.03;

    char.bodyPivot.position.set(0, char.baseBodyY + bounce, 0);
    char.headPivot.rotation.set(Math.sin(p * 2) * 0.04, steer * 0.18, 0);
    char.frontLeftLeg.rotation.set(s * 0.46, 0, 0);
    char.backRightLeg.rotation.set(s * 0.46, 0, 0);
    char.frontRightLeg.rotation.set(-s * 0.46, 0, 0);
    char.backLeftLeg.rotation.set(-s * 0.46, 0, 0);
    char.tailPivot.rotation.set(0, Math.sin(p * 1.5) * 0.38, 0);
    char.earL.rotation.z = Math.sin(p) * 0.07;
    char.earR.rotation.z = -Math.sin(p) * 0.07;
    char.bell.rotation.x = Math.sin(p) * 0.1;
  } else {
    // Idle gentle breathing + cheerful tail wag + ear perk
    const breathe = Math.sin(idleTime * 2.5);
    char.bodyPivot.position.set(0, char.baseBodyY + breathe * 0.008, 0);
    char.headPivot.rotation.set(breathe * 0.04, Math.sin(idleTime * 1.1) * 0.08, 0);
    char.frontLeftLeg.rotation.set(0, 0, 0);
    char.frontRightLeg.rotation.set(0, 0, 0);
    char.backLeftLeg.rotation.set(0, 0, 0);
    char.backRightLeg.rotation.set(0, 0, 0);
    char.tailPivot.rotation.set(0, Math.sin(idleTime * 5.2) * 0.42, 0);
    const twitch = Math.max(0, Math.sin(idleTime * 2.2) - 0.85) * 1.2;
    char.earL.rotation.z = twitch;
    char.earR.rotation.z = -twitch;
    char.bell.rotation.x = 0;
  }
}
