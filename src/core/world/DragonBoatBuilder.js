import * as THREE from "three";

const _texCache = new Map();
const _matCache = new Map();
const _v0 = new THREE.Vector3();
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _n = new THREE.Vector3();
const _nMat = new THREE.Matrix3();

function createCanvasTex(key, w, h, draw) {
  if (_texCache.has(key)) return _texCache.get(key);
  if (typeof document === "undefined") {
    return null;
  }
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext?.("2d");
  if (
    !ctx ||
    typeof ctx.arc !== "function" ||
    typeof ctx.createLinearGradient !== "function"
  ) {
    return null;
  }
  draw(ctx, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  _texCache.set(key, tex);
  return tex;
}

function getScaleHullTex(accent = "#1895b8") {
  return createCanvasTex(`hull-scales-${accent}`, 512, 128, (ctx, w, h) => {
    // Upper turquoise/sky gunwale stripe + golden-orange overlapping dragon scales + blue Hue wave scrolls
    ctx.fillStyle = "#e68a1e";
    ctx.fillRect(0, 0, w, h);

    // Overlapping dragon scales
    for (let row = 0; row < 4; row++) {
      const y = 26 + row * 19;
      const offset = (row % 2) * 16;
      for (let x = -16; x < w + 32; x += 32) {
        ctx.fillStyle = row % 2 === 0 ? "#f4c238" : "#d94f26";
        ctx.beginPath();
        ctx.arc(x + offset, y, 15, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = "#8e2212";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Top gunwale cyan/turquoise border with white fret pattern
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, w, 24);
    ctx.fillStyle = "#eef9fc";
    for (let x = 6; x < w; x += 22) {
      ctx.fillRect(x, 6, 10, 4);
      ctx.fillRect(x + 6, 13, 10, 4);
    }

    // Lower wave scroll motifs
    ctx.fillStyle = "#16688f";
    ctx.fillRect(0, h - 30, w, 30);
    ctx.strokeStyle = "#dff6ff";
    ctx.lineWidth = 3;
    for (let x = 0; x < w; x += 48) {
      ctx.beginPath();
      ctx.arc(x + 24, h - 18, 16, Math.PI, Math.PI * 2);
      ctx.stroke();
    }
  });
}

function getClassicTimberHullTex() {
  return createCanvasTex("hull-classic-timber", 512, 128, (ctx, w, h) => {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#3a3536");
    grad.addColorStop(0.55, "#262324");
    grad.addColorStop(1, "#181617");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "#4c4648";
    ctx.lineWidth = 2;
    for (let y = 18; y < h; y += 22) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Gold bottom waterline & heritage crest emblem
    ctx.fillStyle = "#c99a3e";
    ctx.fillRect(0, h - 12, w, 5);
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.52, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#262324";
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.52, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#e8c468";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText?.("HRS · NAM XUÂN", w * 0.5 + 24, h * 0.58);
  });
}

function getRoofTex(baseHex, stripeHex) {
  return createCanvasTex(`roof-${baseHex}-${stripeHex}`, 256, 128, (ctx, w, h) => {
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = stripeHex;
    for (let x = 0; x < w; x += 16) {
      ctx.fillRect(x, 0, 5, h);
    }
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let y = 0; y < h; y += 28) {
      ctx.fillRect(0, y, w, 2);
    }
  });
}

function getTouristSideTex(style) {
  return createCanvasTex(`cabin-side-${style}`, 512, 128, (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h);
    // White stern registration & "TOURIST" plate (seen on real Hue boats)
    ctx.fillStyle = "#f4f7f9";
    ctx.fillRect(0, 6, 118, h - 12);
    ctx.fillStyle = "#1a3c58";
    ctx.fillRect(0, 6, 118, 6);
    ctx.fillStyle = "#162a3d";
    ctx.font = "bold 18px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText?.(style === 1 ? "35K TTH" : "HUẾ RIVER", 59, 42);
    ctx.fillStyle = "#c92e2e";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText?.("TOURIST", 59, 76);
    ctx.fillStyle = "#1c7293";
    ctx.fillRect(8, 92, 102, 5);

    if (style === 3) {
      // Single-boat white side wall with decorative golden-orange lotus flower
      ctx.fillStyle = "#f2f7fa";
      ctx.fillRect(118, 6, 120, h - 12);
      ctx.fillStyle = "#eb6b2b";
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(178 + Math.cos(ang) * 16, 64 + Math.sin(ang) * 16, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f4c842";
      ctx.beginPath();
      ctx.arc(178, 64, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

function sharedMat(color, roughness = 0.65, metalness = 0.08, extra = {}) {
  const key = `${color}|${roughness}|${metalness}|${extra.doubleSide ? 1 : 0}|${extra.emissive || ""}|${extra.opacity ?? 1}|${extra.map?.uuid || ""}`;
  if (_matCache.has(key)) return _matCache.get(key);
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness,
    side: extra.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
    ...(extra.map ? { map: extra.map } : {}),
    ...(extra.transparent ? { transparent: true, opacity: extra.opacity ?? 1 } : {}),
    ...(extra.emissive
      ? { emissive: extra.emissive, emissiveIntensity: extra.emissiveIntensity ?? 1.0 }
      : {}),
  });
  _matCache.set(key, m);
  return m;
}

function buildSculptedDragonHead(sideMat, goldMat, redMat, cyanMat, scale = 1) {
  const g = new THREE.Group();

  // S-curved scaly dragon neck rising gracefully from prow
  const neckLow = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.92, 8), sideMat);
  neckLow.position.set(0, 0.38, 0.16);
  neckLow.rotation.x = 0.42;

  const neckUp = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, 0.78, 8), cyanMat);
  neckUp.position.set(0, 1.02, 0.36);
  neckUp.rotation.x = 0.08;

  // Golden throat / chest plates along dragon neck
  for (let i = 0; i < 4; i++) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.11, 0.16), goldMat);
    plate.position.set(0, 0.22 + i * 0.24, 0.16 + i * 0.09);
    plate.rotation.x = 0.32;
    g.add(plate);
  }

  // Head skull, upper snout, flared nostrils & open red mouth
  const skull = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.56), goldMat);
  skull.position.set(0, 1.44, 0.5);
  skull.rotation.x = -0.1;

  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 0.42), goldMat);
  snout.position.set(0, 1.46, 0.88);

  const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.36), redMat);
  lowerJaw.position.set(0, 1.27, 0.8);
  lowerJaw.rotation.x = 0.28;

  // White fangs inside open jaw
  for (const sx of [-0.08, 0.08]) {
    const fang = new THREE.Mesh(
      new THREE.ConeGeometry(0.025, 0.09, 4),
      sharedMat("#f8fafc", 0.4),
    );
    fang.position.set(sx, 1.37, 0.98);
    fang.rotation.x = Math.PI;
    g.add(fang);
  }

  // Flowing red-crimson mane fins & golden antlers swept back
  for (const sx of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.036, 0.48, 5), goldMat);
    horn.position.set(sx * 0.13, 1.72, 0.24);
    horn.rotation.set(-0.68, 0, sx * -0.22);

    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.52), redMat);
    mane.position.set(sx * 0.18, 1.42, 0.18);
    mane.rotation.set(-0.22, sx * 0.22, 0);

    const whisker = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.01, 0.36, 5), cyanMat);
    whisker.position.set(sx * 0.16, 1.32, 0.72);
    whisker.rotation.set(1.15, sx * 0.45, 0);

    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), sharedMat("#ffffff", 0.3));
    eyeWhite.position.set(sx * 0.17, 1.5, 0.62);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.032, 5, 4), sharedMat("#15181c", 0.2));
    pupil.position.set(sx * 0.195, 1.5, 0.635);

    g.add(horn, mane, whisker, eyeWhite, pupil);
  }

  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 5), redMat);
  crown.position.set(0, 1.66, 0.56);
  crown.rotation.x = -0.35;

  g.add(neckLow, neckUp, skull, snout, lowerJaw, crown);
  g.scale.setScalar(scale);
  return g;
}

function addOccupant(parent, { x, y, z, yaw = 0, seated = true, shirt = "#e6b83a", pants = "#273342", hair = "#1f1916", skin = "#eec29f", hat = null, aoDai = false }) {
  const p = new THREE.Group();
  p.position.set(x, y, z);
  p.rotation.y = yaw;

  const shirtMat = sharedMat(shirt, 0.76);
  const pantsMat = sharedMat(pants, 0.82);
  const skinMat = sharedMat(skin, 0.72);
  const hairMat = sharedMat(hair, 0.84);

  const torsoH = aoDai ? 0.66 : 0.44;
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, aoDai ? 0.19 : 0.15, torsoH, 7),
    shirtMat,
  );
  torso.position.y = seated ? 0.46 : 0.98;
  p.add(torso);

  if (seated) {
    const lap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.13, 0.3), pantsMat);
    lap.position.set(0, 0.2, 0.14);
    const shins = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.3, 0.12), pantsMat);
    shins.position.set(0, 0.08, 0.26);
    p.add(lap, shins);
  } else {
    for (const sx of [-0.08, 0.08]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.62, 6), aoDai ? shirtMat : pantsMat);
      leg.position.set(sx, 0.34, 0);
      p.add(leg);
    }
  }

  for (const sx of [-0.18, 0.18]) {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.036, 0.34, 6), shirtMat);
    arm.position.set(sx, seated ? 0.44 : 0.96, 0.08);
    arm.rotation.x = seated ? -0.55 : -0.15;
    p.add(arm);
  }

  const headY = seated ? 0.82 : 1.36;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 8, 6), skinMat);
  head.position.y = headY;
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.142, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
  );
  hairCap.position.y = headY + 0.015;
  p.add(head, hairCap);

  if (hat === "non-la") {
    const non = new THREE.Mesh(
      new THREE.ConeGeometry(0.27, 0.14, 10),
      sharedMat("#e5ce90", 0.85),
    );
    non.position.set(0, headY + 0.12, 0);
    non.rotation.x = -0.06;
    p.add(non);
  } else if (hat === "cap") {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.148, 8, 4, 0, Math.PI * 2, 0, Math.PI * 0.5),
      sharedMat("#285588", 0.72),
    );
    cap.position.set(0, headY + 0.025, 0);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.11), sharedMat("#285588", 0.72));
    brim.position.set(0, headY + 0.05, 0.12);
    p.add(cap, brim);
  }

  parent.add(p);
}

function mergeStaticBoatParts(boat) {
  boat.updateMatrixWorld(true);
  const batches = new Map();
  const matBatches = new Map();
  const matPool = new Map();
  const toRemove = [];

  const getBatchMat = (roughness, metalness, side) => {
    const r = Math.round(roughness * 2) / 2;
    const m = metalness > 0.35 ? 0.75 : 0;
    const k = `${r}|${m}|${side}`;
    if (!matPool.has(k)) {
      matPool.set(
        k,
        new THREE.MeshStandardMaterial({
          color: "#ffffff",
          vertexColors: true,
          roughness: r,
          metalness: m,
          side,
        }),
      );
    }
    return { k, mat: matPool.get(k) };
  };

  boat.traverse((obj) => {
    if (!obj.isMesh || obj.isInstancedMesh) return;
    const m = obj.material;
    if (!m?.isMeshStandardMaterial || m.vertexColors) return;
    const pos = obj.geometry?.attributes?.position;
    const nor = obj.geometry?.attributes?.normal;
    if (!pos || !nor) return;

    const mtx = obj.matrixWorld;
    _nMat.getNormalMatrix(mtx);
    const idx = obj.geometry.index;
    const total = idx ? idx.count : pos.count;

    if (
      m.map ||
      m.transparent ||
      (m.emissive && m.emissive.getHex() !== 0)
    ) {
      const uv = obj.geometry?.attributes?.uv;
      let mb = matBatches.get(m.uuid);
      if (!mb) {
        mb = { mat: m, positions: [], normals: [], uvs: [], hasUv: Boolean(uv), count: 0 };
        matBatches.set(m.uuid, mb);
      }
      if (!uv) mb.hasUv = false;
      for (let i = 0; i < total; i += 3) {
        const i0 = idx ? idx.getX(i) : i;
        const i1 = idx ? idx.getX(i + 1) : i + 1;
        const i2 = idx ? idx.getX(i + 2) : i + 2;
        _v0.fromBufferAttribute(pos, i0).applyMatrix4(mtx);
        _v1.fromBufferAttribute(pos, i1).applyMatrix4(mtx);
        _v2.fromBufferAttribute(pos, i2).applyMatrix4(mtx);
        mb.positions.push(_v0.x, _v0.y, _v0.z, _v1.x, _v1.y, _v1.z, _v2.x, _v2.y, _v2.z);
        _n.fromBufferAttribute(nor, i0).applyMatrix3(_nMat).normalize();
        mb.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(nor, i1).applyMatrix3(_nMat).normalize();
        mb.normals.push(_n.x, _n.y, _n.z);
        _n.fromBufferAttribute(nor, i2).applyMatrix3(_nMat).normalize();
        mb.normals.push(_n.x, _n.y, _n.z);
        if (mb.hasUv && uv) {
          mb.uvs.push(
            uv.getX(i0), uv.getY(i0),
            uv.getX(i1), uv.getY(i1),
            uv.getX(i2), uv.getY(i2),
          );
        }
      }
      mb.count++;
      toRemove.push(obj);
      return;
    }

    const { k, mat } = getBatchMat(m.roughness ?? 0.7, m.metalness ?? 0.05, m.side ?? THREE.FrontSide);
    let b = batches.get(k);
    if (!b) {
      b = { mat, positions: [], normals: [], colors: [], count: 0 };
      batches.set(k, b);
    }
    const cr = m.color.r;
    const cg = m.color.g;
    const cb = m.color.b;
    for (let i = 0; i < total; i += 3) {
      const i0 = idx ? idx.getX(i) : i;
      const i1 = idx ? idx.getX(i + 1) : i + 1;
      const i2 = idx ? idx.getX(i + 2) : i + 2;
      _v0.fromBufferAttribute(pos, i0).applyMatrix4(mtx);
      _v1.fromBufferAttribute(pos, i1).applyMatrix4(mtx);
      _v2.fromBufferAttribute(pos, i2).applyMatrix4(mtx);
      b.positions.push(_v0.x, _v0.y, _v0.z, _v1.x, _v1.y, _v1.z, _v2.x, _v2.y, _v2.z);
      b.colors.push(cr, cg, cb, cr, cg, cb, cr, cg, cb);
      _n.fromBufferAttribute(nor, i0).applyMatrix3(_nMat).normalize();
      b.normals.push(_n.x, _n.y, _n.z);
      _n.fromBufferAttribute(nor, i1).applyMatrix3(_nMat).normalize();
      b.normals.push(_n.x, _n.y, _n.z);
      _n.fromBufferAttribute(nor, i2).applyMatrix3(_nMat).normalize();
      b.normals.push(_n.x, _n.y, _n.z);
    }
    b.count++;
    toRemove.push(obj);
  });

  for (const obj of toRemove) obj.removeFromParent();
  for (const b of batches.values()) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(b.positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(b.normals, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(b.colors, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, b.mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    boat.add(mesh);
  }
  for (const mb of matBatches.values()) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(mb.positions, 3));
    geo.setAttribute("normal", new THREE.Float32BufferAttribute(mb.normals, 3));
    if (mb.hasUv && mb.uvs.length) {
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(mb.uvs, 2));
    }
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, mb.mat);
    mesh.castShadow = !mb.mat.transparent;
    mesh.receiveShadow = !mb.mat.transparent;
    boat.add(mesh);
  }
}

function buildDoubleDragonBoat(variant, boat) {
  const isRedRoof = variant % 4 === 1;
  const roofColor = isRedRoof ? "#a62b36" : "#1c7b55";
  const roofStripe = isRedRoof ? "#801e27" : "#135d3f";
  const accentHex = isRedRoof ? "#1895b8" : "#1e7c9e";

  const scaleTex = getScaleHullTex(accentHex);
  const hullSideMat = scaleTex
    ? sharedMat("#ffffff", 0.56, 0.08, { map: scaleTex, doubleSide: true })
    : sharedMat("#d97824", 0.6, 0.08, { doubleSide: true });
  const roofTex = getRoofTex(roofColor, roofStripe);
  const roofMat = roofTex
    ? sharedMat("#ffffff", 0.54, 0.14, { map: roofTex, doubleSide: true })
    : sharedMat(roofColor, 0.54, 0.14, { doubleSide: true });

  const trimMat = sharedMat(accentHex, 0.48, 0.12);
  const redMat = sharedMat("#c92c27", 0.5, 0.1);
  const goldMat = sharedMat("#e8b838", 0.36, 0.55);
  const woodMat = sharedMat("#6d4628", 0.78);
  const steelMat = sharedMat("#e4eaef", 0.38, 0.52);
  const glassMat = sharedMat("#98c8dd", 0.2, 0.1, { transparent: true, opacity: 0.28, doubleSide: true });
  const lanternMat = sharedMat("#ffe7a0", 0.28, 0, { emissive: "#ffac38", emissiveIntensity: 1.05 });

  // Twin catamaran hull keels + broad main wooden deck (14m x 3.8m)
  for (const sx of [-1.25, 1.25]) {
    const hullPts = [
      new THREE.Vector2(0.01, -6.5),
      new THREE.Vector2(0.55, -5.0),
      new THREE.Vector2(0.68, 0),
      new THREE.Vector2(0.55, 5.2),
      new THREE.Vector2(0.01, 6.7),
    ];
    const hGeo = new THREE.LatheGeometry(hullPts, 8);
    hGeo.rotateX(Math.PI / 2);
    hGeo.scale(1, 0.55, 1);
    const keel = new THREE.Mesh(hGeo, sharedMat("#263b47", 0.72));
    keel.position.set(sx, 0.18, 0);
    boat.add(keel);
  }

  // Outer painted dragon-scale hull skirting panels
  for (const sx of [-1.92, 1.92]) {
    const sideHull = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 0.85), hullSideMat);
    sideHull.position.set(sx, 0.44, -0.35);
    sideHull.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(sideHull);
  }

  // Main wooden deck + open bow boarding gangplank (matching real Hue twin-dragon boats)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.16, 11.4), woodMat);
  deck.position.set(0, 0.44, -0.3);
  const bowRamp = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 1.85), woodMat);
  bowRamp.position.set(0, 0.42, 5.65);
  bowRamp.rotation.x = 0.06;
  boat.add(deck, bowRamp);

  // Twin sculpted upturned Dragon Heads at bow + curved dragon tails at stern
  for (const sx of [-1.28, 1.28]) {
    const prow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 1.45), trimMat);
    prow.position.set(sx, 0.46, 5.85);
    prow.rotation.x = -0.22;
    const dHead = buildSculptedDragonHead(
      sharedMat("#e06e24", 0.52),
      goldMat,
      redMat,
      sharedMat("#239fc2", 0.46),
      1.02,
    );
    dHead.position.set(sx, 0.52, 6.08);

    const sternTail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.05, 0.44), goldMat);
    sternTail.position.set(sx, 0.92, -6.15);
    sternTail.rotation.x = -0.4;
    const sternTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.52, 5), redMat);
    sternTip.position.set(sx, 1.48, -6.36);
    sternTip.rotation.x = -0.48;
    boat.add(prow, dHead, sternTail, sternTip);
  }

  // Forward railing & colorful Dragon Gate portal arch
  const frontGateArch = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.22, 0.24), goldMat);
  frontGateArch.position.set(0, 2.15, 4.15);
  const archTop = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.48, 4), goldMat);
  archTop.position.set(0, 2.45, 4.15);
  boat.add(frontGateArch, archTop);
  for (const sx of [-1.45, -0.7, 0.7, 1.45]) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.65, 6), goldMat);
    col.position.set(sx, 1.3, 4.15);
    boat.add(col);
  }

  // Perimeter safety railings + stern TOURIST sign plate + lifebuoys
  for (const sx of [-1.84, 1.84]) {
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 10.6), steelMat);
    topRail.position.set(sx, 1.15, -0.25);
    const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 10.6), steelMat);
    midRail.position.set(sx, 0.82, -0.25);
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.05), glassMat);
    windowGlass.position.set(sx * 0.96, 1.5, -0.1);
    windowGlass.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(topRail, midRail, windowGlass);

    for (let pz = -5.0; pz <= 4.6; pz += 1.2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 5), steelMat);
      post.position.set(sx, 0.8, pz);
      boat.add(post);
    }

    // Orange lifebuoy hung on side rail
    const buoy = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.065, 6, 12),
      sharedMat("#f05a28", 0.55),
    );
    buoy.position.set(sx + (sx > 0 ? 0.06 : -0.06), 0.95, 2.4);
    buoy.rotation.y = Math.PI / 2;
    boat.add(buoy);
  }

  // Stern tourist placard texture
  const sideTex = getTouristSideTex(variant % 4);
  if (sideTex) {
    const signMat = sharedMat("#ffffff", 0.6, 0.04, { map: sideTex, transparent: true, doubleSide: true });
    for (const sx of [-1.86, 1.86]) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 1.1), signMat);
      panel.position.set(sx, 1.25, -2.55);
      panel.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      boat.add(panel);
    }
  }

  // Cabin structural pillars & two-tier upturned roof with dragon-fin corner eaves
  for (const sx of [-1.72, 1.72]) {
    for (let pz = -4.6; pz <= 3.8; pz += 1.68) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 1.72, 6),
        isRedRoof ? steelMat : goldMat,
      );
      pillar.position.set(sx, 1.32, pz);
      boat.add(pillar);
    }
  }

  // Lower roof slope (2 pitched eaves)
  for (const sx of [-1, 1]) {
    const eave = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.09, 9.6), roofMat);
    eave.position.set(sx * 0.96, 2.26, -0.35);
    eave.rotation.z = sx * -0.22;
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 9.65), trimMat);
    fascia.position.set(sx * 1.94, 2.04, -0.35);
    boat.add(eave, fascia);
  }
  // Upper raised clerestory tier + golden corner finials
  for (const sx of [-1, 1]) {
    const topEave = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.08, 6.2), roofMat);
    topEave.position.set(sx * 0.54, 2.66, -0.45);
    topEave.rotation.z = sx * -0.2;
    boat.add(topEave);
    for (const sz of [-5.0, 4.35]) {
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.42, 4), goldMat);
      finial.position.set(sx * 1.88, 2.24, sz);
      finial.rotation.z = sx * -0.45;
      boat.add(finial);
    }
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 6.6), goldMat);
  ridge.position.set(0, 2.8, -0.45);
  boat.add(ridge);

  // Festive hanging cabin lanterns
  for (const sx of [-1.55, 1.55]) {
    for (const sz of [-3.6, -1.2, 1.2, 3.6]) {
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), lanternMat);
      lantern.position.set(sx, 1.96, sz);
      boat.add(lantern);
    }
  }

  // Interior tables, benches & 10-11 lively seated/standing occupants!
  for (const sx of [-1.08, 1.08]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 6.8), woodMat);
    bench.position.set(sx, 0.65, -0.25);
    boat.add(bench);
  }
  const centerTable = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.52, 5.4), woodMat);
  centerTable.position.set(0, 0.72, -0.2);
  const helmConsole = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.85, 0.46), woodMat);
  helmConsole.position.set(0.32, 0.9, 4.1);
  const helmWheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 5, 10), steelMat);
  helmWheel.position.set(0.32, 1.32, 4.25);
  helmWheel.rotation.x = 0.55;
  boat.add(centerTable, helmConsole, helmWheel);

  // Helmsman with nón lá + bow tourist/performer in áo dài + 8 seated guests
  addOccupant(boat, {
    x: 0.32,
    y: 0.52,
    z: 3.55,
    yaw: 0,
    seated: true,
    shirt: "#f5f7f8",
    hat: "non-la",
  });
  addOccupant(boat, {
    x: -0.68,
    y: 0.52,
    z: 4.55,
    yaw: 0.25,
    seated: false,
    shirt: isRedRoof ? "#1e56b8" : "#187a62",
    aoDai: true,
    hat: isRedRoof ? null : "non-la",
  });

  const shirtPool = ["#e8b838", "#2d82b5", "#8a428c", "#d9504a", "#f0f4f7", "#36946b", "#e37e32", "#476299"];
  const guestSlots = [-3.0, -1.65, -0.25, 1.15, 2.45];
  guestSlots.forEach((gz, i) => {
    addOccupant(boat, {
      x: -1.04,
      y: 0.52,
      z: gz,
      yaw: Math.PI / 2,
      seated: true,
      shirt: shirtPool[i % shirtPool.length],
      hat: i === 2 ? "cap" : null,
    });
    if (i < 4) {
      addOccupant(boat, {
        x: 1.04,
        y: 0.52,
        z: gz + 0.35,
        yaw: -Math.PI / 2,
        seated: true,
        shirt: shirtPool[(i + 3) % shirtPool.length],
        hat: i === 1 ? "non-la" : null,
      });
    }
  });
}

function buildHeritageTimberBoat(boat) {
  const hullTex = getClassicTimberHullTex();
  const hullMat = hullTex
    ? sharedMat("#ffffff", 0.72, 0.08, { map: hullTex, doubleSide: true })
    : sharedMat("#2c292b", 0.74, 0.08, { doubleSide: true });
  const darkWood = sharedMat("#3a2b25", 0.8);
  const redCabin = sharedMat("#b82121", 0.48, 0.08);
  const roofBrown = sharedMat("#4a342a", 0.82);
  const teakMat = sharedMat("#9c6a3e", 0.7);
  const brassMat = sharedMat("#d8a742", 0.36, 0.56);
  const glassMat = sharedMat("#b8d7e4", 0.18, 0.12, { transparent: true, opacity: 0.25, doubleSide: true });
  const warmGlow = sharedMat("#ffdfa0", 0.25, 0, { emissive: "#ff9b38", emissiveIntensity: 1.1 });

  // Sleek dark heritage hull (~14.2m x 3.1m)
  const hullPts = [
    new THREE.Vector2(0.01, -6.9),
    new THREE.Vector2(1.05, -4.8),
    new THREE.Vector2(1.48, 0),
    new THREE.Vector2(1.12, 4.6),
    new THREE.Vector2(0.01, 7.1),
  ];
  const hGeo = new THREE.LatheGeometry(hullPts, 10);
  hGeo.rotateX(Math.PI / 2);
  hGeo.scale(1, 0.44, 1);
  const hull = new THREE.Mesh(hGeo, darkWood);
  hull.position.y = 0.26;
  boat.add(hull);

  for (const sx of [-1.45, 1.45]) {
    const flank = new THREE.Mesh(new THREE.PlaneGeometry(10.6, 0.72), hullMat);
    flank.position.set(sx, 0.46, 0);
    flank.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(flank);
  }

  // Curved upward heritage bowsprit & stern finial
  const bowSpire = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.34, 1.6), darkWood);
  bowSpire.position.set(0, 0.72, 6.7);
  bowSpire.rotation.x = -0.38;
  const bowTip = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.55, 5), brassMat);
  bowTip.position.set(0, 1.05, 7.45);
  bowTip.rotation.x = 1.15;
  boat.add(bowSpire, bowTip);

  // Main deck + raised aft lounge + lacquered red cabin framing
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.72, 0.14, 10.8), teakMat);
  deck.position.y = 0.46;
  const lowRedWall = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.56, 7.6), redCabin);
  lowRedWall.position.set(0, 0.72, 0.1);
  boat.add(deck, lowRedWall);

  // Open red framed cabin columns & panoramic glass windows
  for (const sx of [-1.28, 1.28]) {
    const topBeam = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 7.7), redCabin);
    topBeam.position.set(sx, 2.02, 0.1);
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 1.02), glassMat);
    windowGlass.position.set(sx, 1.44, 0.1);
    windowGlass.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(topBeam, windowGlass);
    for (let pz = -3.6; pz <= 3.8; pz += 1.22) {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.15, 0.1), redCabin);
      post.position.set(sx, 1.48, pz);
      boat.add(post);
    }
  }
  const frontCab = new THREE.Mesh(new THREE.BoxGeometry(2.62, 1.32, 0.12), redCabin);
  frontCab.position.set(0, 1.38, 3.88);
  boat.add(frontCab);

  // Arched curved dark-brown shingled canopy roof
  for (const sx of [-1, 1]) {
    const slope = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.11, 8.6), roofBrown);
    slope.position.set(sx * 0.76, 2.24, 0.1);
    slope.rotation.z = sx * -0.24;
    boat.add(slope);
  }
  const roofCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 8.8, 8), roofBrown);
  roofCrown.rotation.x = Math.PI / 2;
  roofCrown.position.set(0, 2.48, 0.1);
  boat.add(roofCrown);

  // Orange lifebuoy mounted at stern rail
  const buoy = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.075, 6, 12),
    sharedMat("#ee4e22", 0.55),
  );
  buoy.position.set(1.25, 0.92, -4.45);
  buoy.rotation.y = Math.PI / 2;
  boat.add(buoy);

  // Interior warm dining tables, glowing table lamps & 8 occupants
  for (const tz of [-1.8, 0.2, 2.1]) {
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.44, 0.78), teakMat);
    table.position.set(0, 0.75, tz);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 6, 5), warmGlow);
    lamp.position.set(0, 1.04, tz);
    boat.add(table, lamp);
  }
  // Helmsman at front red wheelhouse + 7 seated guests
  addOccupant(boat, { x: -0.45, y: 0.52, z: 3.35, yaw: 0, seated: true, shirt: "#f4f6f7", hat: "cap" });
  const shirts = ["#c9883a", "#e4d2a4", "#8a2c38", "#355e7a", "#d6a43e", "#446e55", "#c25648"];
  [-1.9, 0.1, 2.0].forEach((gz, i) => {
    addOccupant(boat, { x: -0.78, y: 0.54, z: gz, yaw: Math.PI / 2, seated: true, shirt: shirts[i] });
    addOccupant(boat, { x: 0.78, y: 0.54, z: gz, yaw: -Math.PI / 2, seated: true, shirt: shirts[i + 3] });
  });
  addOccupant(boat, { x: 0.35, y: 0.54, z: -3.2, yaw: 0, seated: true, shirt: shirts[6] });
}

function buildSingleDragonBoat(boat) {
  const hullTex = getScaleHullTex("#1590b8");
  const hullMat = hullTex
    ? sharedMat("#ffffff", 0.56, 0.08, { map: hullTex, doubleSide: true })
    : sharedMat("#df7c24", 0.58, 0.08, { doubleSide: true });
  const roofTex = getRoofTex("#eaf3f8", "#cfe4f0");
  const roofMat = roofTex
    ? sharedMat("#ffffff", 0.55, 0.08, { map: roofTex, doubleSide: true })
    : sharedMat("#e6f1f6", 0.55, 0.08, { doubleSide: true });
  const blueMat = sharedMat("#1895bd", 0.48, 0.1);
  const goldMat = sharedMat("#e8b83a", 0.36, 0.55);
  const redMat = sharedMat("#c92f28", 0.5, 0.1);
  const woodMat = sharedMat("#7a4f2c", 0.78);
  const lanternMat = sharedMat("#ffe7a0", 0.28, 0, { emissive: "#ffad3a", emissiveIntensity: 1.0 });

  // Graceful single sampan hull (~13.2m x 2.65m)
  const hullPts = [
    new THREE.Vector2(0.01, -6.5),
    new THREE.Vector2(0.95, -4.4),
    new THREE.Vector2(1.32, 0),
    new THREE.Vector2(0.98, 4.4),
    new THREE.Vector2(0.01, 6.6),
  ];
  const hGeo = new THREE.LatheGeometry(hullPts, 10);
  hGeo.rotateX(Math.PI / 2);
  hGeo.scale(1, 0.44, 1);
  const hull = new THREE.Mesh(hGeo, blueMat);
  hull.position.y = 0.25;
  boat.add(hull);

  for (const sx of [-1.28, 1.28]) {
    const flank = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 0.74), hullMat);
    flank.position.set(sx, 0.46, 0);
    flank.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(flank);
  }

  // White cabin lower side panels with lotus flower decal
  const sideTex = getTouristSideTex(3);
  if (sideTex) {
    const panelMat = sharedMat("#ffffff", 0.6, 0.04, { map: sideTex, transparent: true, doubleSide: true });
    for (const sx of [-1.22, 1.22]) {
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 0.85), panelMat);
      panel.position.set(sx, 0.96, -0.4);
      panel.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      boat.add(panel);
    }
  }

  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.14, 9.2), woodMat);
  deck.position.y = 0.46;
  boat.add(deck);

  // Single ornate tall Dragon Head prow & curved stern tail
  const dHead = buildSculptedDragonHead(
    sharedMat("#e06e24", 0.52),
    goldMat,
    redMat,
    blueMat,
    1.12,
  );
  dHead.position.set(0, 0.48, 5.75);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.25, 0.46), goldMat);
  tail.position.set(0, 1.02, -6.05);
  tail.rotation.x = -0.38;
  const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 5), redMat);
  tailFin.position.set(0, 1.62, -6.28);
  tailFin.rotation.x = -0.45;
  boat.add(dHead, tail, tailFin);

  // Open white-and-blue cabin pillars + arched roof + golden crest
  for (const sx of [-1.06, 1.06]) {
    for (let pz = -3.2; pz <= 3.0; pz += 1.55) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.48, 6), blueMat);
      col.position.set(sx, 1.26, pz);
      boat.add(col);
    }
  }
  for (const sx of [-1, 1]) {
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.08, 7.6), roofMat);
    roof.position.set(sx * 0.62, 2.12, -0.1);
    roof.rotation.z = sx * -0.25;
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 7.65), blueMat);
    trim.position.set(sx * 1.24, 1.94, -0.1);
    boat.add(roof, trim);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.14, 7.8), goldMat);
  ridge.position.set(0, 2.34, -0.1);
  boat.add(ridge);

  for (const sx of [-1.08, 1.08]) {
    for (const sz of [-2.4, 0, 2.4]) {
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), lanternMat);
      lantern.position.set(sx, 1.76, sz);
      boat.add(lantern);
    }
  }

  // Boatswain + Ca Huế singer + 5 seated guests inside
  addOccupant(boat, { x: 0, y: 0.48, z: -4.15, yaw: 0, seated: true, shirt: "#285886", hat: "non-la" });
  addOccupant(boat, { x: 0, y: 0.48, z: 2.75, yaw: Math.PI, seated: false, shirt: "#7f286e", aoDai: true });
  const guestCols = ["#e8b838", "#3489b5", "#e26856", "#f2f4f6", "#3d8c65"];
  [-1.9, -0.5, 0.9].forEach((gz, i) => {
    addOccupant(boat, { x: -0.68, y: 0.5, z: gz, yaw: Math.PI / 2, seated: true, shirt: guestCols[i] });
    if (i < 2) {
      addOccupant(boat, { x: 0.68, y: 0.5, z: gz + 0.3, yaw: -Math.PI / 2, seated: true, shirt: guestCols[i + 3] });
    }
  });
}

export function createDragonBoat(variant = 0) {
  const boat = new THREE.Group();
  const style = Math.abs(Math.floor(variant)) % 4;
  boat.name = `dragon-boat-style-${style}`;

  if (style === 0 || style === 1) {
    buildDoubleDragonBoat(style, boat);
  } else if (style === 2) {
    buildHeritageTimberBoat(boat);
  } else {
    buildSingleDragonBoat(boat);
  }

  // Merge all static opaque non-textured parts per boat into 1-2 vertex-colored meshes
  // so 20+ richly detailed dragon boats with 7-11 people cost minimal draw calls.
  mergeStaticBoatParts(boat);
  return boat;
}

function buildCruisePerformer({
  x,
  y,
  z,
  yaw = 0,
  role = "woman-purple",
  aoDaiColor = "#7c2ea0",
  pantsColor = "#f4f6fa",
  hairColor = "#1a1513",
  skinColor = "#f0c5a2",
  turban = false,
  longHair = false,
  hasFan = false,
}) {
  const root = new THREE.Group();
  root.name = `cruise-performer-${role}`;
  root.position.set(x, y, z);
  root.rotation.y = yaw;

  const tunicMat = sharedMat(aoDaiColor, 0.68, 0.06);
  const pantsMat = sharedMat(pantsColor, 0.78);
  const skinMat = sharedMat(skinColor, 0.7);
  const hairMat = sharedMat(hairColor, 0.82);
  const goldMat = sharedMat("#e8b942", 0.36, 0.48);

  // Legs in flowing silk trousers
  for (const sx of [-0.075, 0.075]) {
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.052, 0.62, 6),
      pantsMat,
    );
    leg.position.set(sx, 0.31, 0);
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.05, 0.14),
      sharedMat("#1e1a18", 0.7),
    );
    shoe.position.set(sx, 0.025, 0.02);
    root.add(leg, shoe);
  }

  const torsoPivot = new THREE.Group();
  torsoPivot.position.set(0, 0.62, 0);
  root.add(torsoPivot);

  // Fitted upper áo dài tunic + front & back long flowing tà panels
  const upperBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.135, 0.145, 0.44, 8),
    tunicMat,
  );
  upperBody.position.y = 0.22;
  torsoPivot.add(upperBody);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.09, 0.06, 8),
    tunicMat,
  );
  collar.position.y = 0.45;
  torsoPivot.add(collar);

  for (const sz of [-0.095, 0.095]) {
    const flap = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.48, 0.032),
      tunicMat,
    );
    flap.position.set(0, -0.14, sz);
    flap.rotation.x = sz > 0 ? -0.06 : 0.06;
    torsoPivot.add(flap);
  }

  if (turban) {
    // Traditional golden brocade chest medallion on the man's áo dài
    const sash = new THREE.Mesh(
      new THREE.CylinderGeometry(0.142, 0.142, 0.06, 8),
      goldMat,
    );
    sash.position.y = 0.28;
    torsoPivot.add(sash);
  }

  // Articulated arms for expressive Hò Đối Đáp singing gestures
  const makeArm = (sx) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(sx * 0.175, 0.38, 0);
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.044, 0.036, 0.34, 6),
      tunicMat,
    );
    sleeve.position.y = -0.15;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), skinMat);
    hand.position.y = -0.34;
    armPivot.add(sleeve, hand);
    if (hasFan && sx > 0) {
      const fan = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.02, 0.02, 6, 1, false, -0.7, 1.4),
        sharedMat("#f9e29c", 0.55),
      );
      fan.position.set(0.03, -0.36, 0.08);
      fan.rotation.x = Math.PI / 2 - 0.35;
      armPivot.add(fan);
    }
    torsoPivot.add(armPivot);
    return armPivot;
  };
  const leftArm = makeArm(-1);
  const rightArm = makeArm(1);

  const headPivot = new THREE.Group();
  headPivot.position.set(0, 0.54, 0);
  torsoPivot.add(headPivot);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.135, 10, 8), skinMat);
  head.position.y = 0.1;
  const hairCap = new THREE.Mesh(
    new THREE.SphereGeometry(0.142, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.58),
    hairMat,
  );
  hairCap.position.y = 0.115;
  headPivot.add(head, hairCap);

  if (longHair) {
    const hairBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.36, 0.07),
      hairMat,
    );
    hairBack.position.set(0, -0.04, -0.11);
    const hairRibbon = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.035, 0.08),
      tunicMat,
    );
    hairRibbon.position.set(0, 0.08, -0.115);
    headPivot.add(hairBack, hairRibbon);
  }

  if (turban) {
    // Layered coiled khăn đóng (traditional Huế turban headwrap)
    for (let ring = 0; ring < 3; ring++) {
      const coil = new THREE.Mesh(
        new THREE.TorusGeometry(0.132 - ring * 0.008, 0.028, 6, 14),
        ring === 1 ? goldMat : tunicMat,
      );
      coil.position.set(0, 0.155 + ring * 0.034, 0);
      coil.rotation.x = Math.PI / 2 - 0.08;
      headPivot.add(coil);
    }
    const crownFold = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.125, 0.055, 10),
      tunicMat,
    );
    crownFold.position.set(0, 0.215, 0);
    headPivot.add(crownFold);
  }

  return { root, torsoPivot, headPivot, leftArm, rightArm, role };
}

function buildSeatedCruiseTourist({
  x,
  y,
  z,
  yaw = 0,
  shirt = "#e8b838",
  pants = "#273342",
  hat = null,
}) {
  const p = new THREE.Group();
  p.position.set(x, y, z);
  p.rotation.y = yaw;
  addOccupant(p, {
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    seated: true,
    shirt,
    pants,
    hat,
  });
  return p;
}

export function createDragonCruiseBoat() {
  const boat = new THREE.Group();
  boat.name = "dragon-cruise-ho-doi-dap";

  const scaleTex = getScaleHullTex("#1c7b9e");
  const hullSideMat = scaleTex
    ? sharedMat("#ffffff", 0.54, 0.08, { map: scaleTex, doubleSide: true })
    : sharedMat("#d97824", 0.6, 0.08, { doubleSide: true });
  const roofTex = getRoofTex("#9e2230", "#721621");
  const roofMat = roofTex
    ? sharedMat("#ffffff", 0.52, 0.14, { map: roofTex, doubleSide: true })
    : sharedMat("#9e2230", 0.52, 0.14, { doubleSide: true });

  const trimMat = sharedMat("#1a88ab", 0.46, 0.12);
  const redMat = sharedMat("#c92c27", 0.5, 0.1);
  const goldMat = sharedMat("#e8b838", 0.36, 0.55);
  const woodMat = sharedMat("#6d4628", 0.78);
  const velvetMat = sharedMat("#8a2432", 0.72);
  const steelMat = sharedMat("#e4eaef", 0.38, 0.52);
  const lanternMat = sharedMat("#ffe7a0", 0.28, 0, {
    emissive: "#ffac38",
    emissiveIntensity: 1.15,
  });

  // Twin hull keels + painted scale flanks
  for (const sx of [-1.25, 1.25]) {
    const hullPts = [
      new THREE.Vector2(0.01, -6.6),
      new THREE.Vector2(0.55, -5.0),
      new THREE.Vector2(0.68, 0),
      new THREE.Vector2(0.55, 5.2),
      new THREE.Vector2(0.01, 6.8),
    ];
    const hGeo = new THREE.LatheGeometry(hullPts, 8);
    hGeo.rotateX(Math.PI / 2);
    hGeo.scale(1, 0.55, 1);
    const keel = new THREE.Mesh(hGeo, sharedMat("#263b47", 0.72));
    keel.position.set(sx, 0.18, 0);
    boat.add(keel);
  }
  for (const sx of [-1.92, 1.92]) {
    const sideHull = new THREE.Mesh(new THREE.PlaneGeometry(11.8, 0.85), hullSideMat);
    sideHull.position.set(sx, 0.44, -0.35);
    sideHull.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
    boat.add(sideHull);
  }

  // Main wooden deck + open bow gangplank + red performance stage carpet
  const deck = new THREE.Mesh(new THREE.BoxGeometry(3.78, 0.16, 11.6), woodMat);
  deck.position.set(0, 0.44, -0.3);
  const bowRamp = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.08, 1.85), woodMat);
  bowRamp.position.set(0, 0.42, 5.7);
  bowRamp.rotation.x = 0.06;
  const stageCarpet = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.03, 2.2), velvetMat);
  stageCarpet.position.set(0, 0.535, 2.65);
  boat.add(deck, bowRamp, stageCarpet);

  // Twin sculpted Dragon Heads at bow + curved dragon tails at stern
  for (const sx of [-1.28, 1.28]) {
    const prow = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.44, 1.45), trimMat);
    prow.position.set(sx, 0.46, 5.85);
    prow.rotation.x = -0.22;
    const dHead = buildSculptedDragonHead(
      sharedMat("#e06e24", 0.52),
      goldMat,
      redMat,
      sharedMat("#239fc2", 0.46),
      1.04,
    );
    dHead.position.set(sx, 0.52, 6.1);

    const sternTail = new THREE.Mesh(new THREE.BoxGeometry(0.32, 1.05, 0.44), goldMat);
    sternTail.position.set(sx, 0.92, -6.15);
    sternTail.rotation.x = -0.4;
    const sternTip = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.52, 5), redMat);
    sternTip.position.set(sx, 1.48, -6.36);
    sternTip.rotation.x = -0.48;
    boat.add(prow, dHead, sternTail, sternTip);
  }

  // Open-air perimeter rails (no tinted glass so performers & tourists stay crisp!)
  for (const sx of [-1.84, 1.84]) {
    const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 10.6), goldMat);
    topRail.position.set(sx, 1.12, -0.25);
    const midRail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 10.6), steelMat);
    midRail.position.set(sx, 0.8, -0.25);
    boat.add(topRail, midRail);
    for (let pz = -5.0; pz <= 4.6; pz += 1.2) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.68, 5), steelMat);
      post.position.set(sx, 0.78, pz);
      boat.add(post);
    }
  }

  // High open sightseeing canopy pillars & imperial roof (y ≈ 2.55..2.98 for open camera view)
  for (const sx of [-1.74, 1.74]) {
    for (let pz = -4.6; pz <= 3.8; pz += 2.1) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 2.02, 6),
        goldMat,
      );
      pillar.position.set(sx, 1.48, pz);
      boat.add(pillar);
    }
  }
  for (const sx of [-1, 1]) {
    const eave = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.09, 9.6), roofMat);
    eave.position.set(sx * 0.96, 2.56, -0.35);
    eave.rotation.z = sx * -0.2;
    const fascia = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 9.65), trimMat);
    fascia.position.set(sx * 1.94, 2.36, -0.35);
    boat.add(eave, fascia);
  }
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 7.6), goldMat);
  ridge.position.set(0, 2.86, -0.35);
  boat.add(ridge);

  for (const sx of [-1.55, 1.55]) {
    for (const sz of [-3.4, -1.0, 1.4, 3.6]) {
      const lantern = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), lanternMat);
      lantern.position.set(sx, 2.24, sz);
      boat.add(lantern);
    }
  }

  // Side tourist benches + VIP passenger cushion + central tea table & stern helm
  for (const sx of [-1.18, 1.18]) {
    const bench = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 5.2), woodMat);
    bench.position.set(sx, 0.65, -1.05);
    boat.add(bench);
  }
  const vipChair = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.28, 0.56), velvetMat);
  vipChair.position.set(0.66, 0.62, -0.35);
  const centerTable = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.46, 3.4), woodMat);
  centerTable.position.set(0, 0.72, -1.35);
  const helmConsole = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.8, 0.44), woodMat);
  helmConsole.position.set(-0.92, 0.88, -4.15);
  const helmWheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.03, 5, 10), steelMat);
  helmWheel.position.set(-0.92, 1.28, -3.98);
  helmWheel.rotation.x = -0.5;
  boat.add(vipChair, centerTable, helmConsole, helmWheel);

  // Helmsman at stern steering wheel
  addOccupant(boat, {
    x: -0.92,
    y: 0.52,
    z: -4.65,
    yaw: 0,
    seated: true,
    shirt: "#23577a",
    hat: "non-la",
  });

  // Merge static architecture + helmsman before adding animated performers & tourists
  mergeStaticBoatParts(boat);

  const dynamicGroup = new THREE.Group();
  dynamicGroup.name = "dragon-cruise-dynamic-crew";

  // Seated tourists ("du khách ngồi ghế") watching the Hò Đối Đáp performance
  const touristSlots = [
    { x: -1.16, z: -2.95, yaw: 0.55, shirt: "#e68a38", hat: "cap" },
    { x: -1.16, z: -1.65, yaw: 0.65, shirt: "#2e84b8", hat: null },
    { x: -1.16, z: -0.35, yaw: 0.72, shirt: "#d85050", hat: "non-la" },
    { x: -1.16, z: 0.9, yaw: 0.62, shirt: "#f0f4f7", hat: null },
    { x: 1.16, z: -2.85, yaw: -0.55, shirt: "#38946e", hat: null },
    { x: 1.16, z: -1.55, yaw: -0.65, shirt: "#8d4992", hat: "non-la" },
    { x: 1.16, z: 0.9, yaw: -0.62, shirt: "#4c679c", hat: "cap" },
  ];
  const tourists = touristSlots.map((slot, idx) => {
    const t = buildSeatedCruiseTourist({
      x: slot.x,
      y: 0.52,
      z: slot.z,
      yaw: slot.yaw,
      shirt: slot.shirt,
      hat: slot.hat,
    });
    t.userData.phase = idx * 0.85;
    dynamicGroup.add(t);
    return t;
  });

  // Hò Đối Đáp Trio on the bow performance deck:
  // 2 young women in purple & yellow áo dài + 1 man in traditional áo dài & khăn đóng turban
  const womanPurple = buildCruisePerformer({
    x: -0.68,
    y: 0.55,
    z: 2.32,
    yaw: Math.PI - 0.52,
    role: "woman-purple",
    aoDaiColor: "#7c2ea0",
    longHair: true,
    hasFan: true,
  });
  const womanYellow = buildCruisePerformer({
    x: 0.68,
    y: 0.55,
    z: 2.32,
    yaw: -Math.PI + 0.52,
    role: "woman-yellow",
    aoDaiColor: "#eab308",
    longHair: true,
    hasFan: true,
  });
  const manTurban = buildCruisePerformer({
    x: 0,
    y: 0.55,
    z: 3.12,
    yaw: Math.PI,
    role: "man-turban",
    aoDaiColor: "#1d3e6e",
    turban: true,
  });
  const performers = [womanPurple, womanYellow, manTurban];
  dynamicGroup.add(womanPurple.root, womanYellow.root, manTurban.root);
  boat.add(dynamicGroup);

  const playerSeatOffset = { x: 0.66, y: 0.54, z: -0.35, yaw: -0.22 };

  const update = (time = 0) => {
    const callPhase = Math.sin(time * 0.95);
    const manLead = Math.max(0, callPhase);
    const womenLead = Math.max(0, -callPhase);
    const beat = Math.sin(time * 3.1);

    // Man singing Hò Đối Đáp call phrase
    manTurban.torsoPivot.rotation.set(
      0.04 + manLead * 0.08,
      Math.sin(time * 0.8) * 0.12,
      Math.sin(time * 1.4) * 0.05,
    );
    manTurban.headPivot.rotation.set(
      -0.04 + beat * 0.06 * (0.4 + manLead * 0.6),
      Math.sin(time * 0.9) * 0.16,
      0,
    );
    manTurban.rightArm.rotation.set(
      -0.45 - manLead * 0.85 + beat * 0.12,
      0.15,
      0.18 + manLead * 0.16,
    );
    manTurban.leftArm.rotation.set(-0.28 - manLead * 0.25, -0.1, -0.14);

    // 2 young women in purple & yellow áo dài responding in duet
    [womanPurple, womanYellow].forEach((w, idx) => {
      const sign = idx === 0 ? 1 : -1;
      const sway = Math.sin(time * 1.65 + idx * 0.45);
      w.torsoPivot.rotation.set(
        0.04 + womenLead * 0.07,
        sign * -0.12 + sway * 0.09,
        sway * 0.05,
      );
      w.headPivot.rotation.set(
        beat * 0.05 * (0.35 + womenLead * 0.65),
        sign * 0.14 + sway * 0.1,
        0,
      );
      w.rightArm.rotation.set(
        -0.38 - womenLead * 0.72 + Math.sin(time * 2.8 + idx) * 0.14,
        0.1,
        0.22 + womenLead * 0.18,
      );
      w.leftArm.rotation.set(
        -0.32 - womenLead * 0.48 - Math.sin(time * 2.8 + idx) * 0.1,
        -0.08,
        -0.18,
      );
    });

    for (const t of tourists) {
      const ph = t.userData.phase || 0;
      t.rotation.z = Math.sin(time * 1.5 + ph) * 0.03;
    }
  };

  boat.userData.dynamicGroup = dynamicGroup;
  boat.userData.performers = performers;
  boat.userData.tourists = tourists;
  boat.userData.playerSeatOffset = playerSeatOffset;
  boat.userData.update = update;
  update(0);

  return {
    group: boat,
    dynamicGroup,
    performers,
    tourists,
    playerSeatOffset,
    update,
  };
}
