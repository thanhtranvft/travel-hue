import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  box,
  label,
  mat,
} from "../../../../core/shared/architecture/shared.js";
import {
  beam,
  tiledRoof,
} from "../../../../core/shared/architecture/architecture.js";

function createCanvasTexture(width, height, draw) {
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

function createStelePlaqueTexture() {
  return createCanvasTexture(1024, 512, (ctx, w, h) => {
    // Cream-ivory weathered plaster field
    ctx.fillStyle = "#f2e4bf";
    ctx.fillRect(0, 0, w, h);

    // Subtle aged stone mottling
    if (typeof ctx.arc === "function") {
      for (let i = 0; i < 420; i++) {
        const x = (i * 197) % w;
        const y = (i * 313) % h;
        const r = 6 + (i % 18);
        ctx.fillStyle =
          i % 2 ? "rgba(182, 152, 102, 0.09)" : "rgba(255, 248, 226, 0.12)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Outer imperial ochre & crimson double border
    ctx.strokeStyle = "#8a5a32";
    ctx.lineWidth = 22;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    ctx.strokeStyle = "#b98a4a";
    ctx.lineWidth = 8;
    ctx.strokeRect(38, 38, w - 76, h - 76);

    // Corner Hue floral scroll accents
    ctx.fillStyle = "#486b82";
    for (const [cx, cy] of [
      [58, 58],
      [w - 58, 58],
      [58, h - 58],
      [w - 58, h - 58],
    ]) {
      ctx.fillRect(cx - 9, cy - 9, 18, 18);
    }

    // Monumental Vietnamese calligraphy inscription
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#982b21";
    ctx.font = "700 84px 'Playfair Display', Georgia, serif";
    ctx.fillText("TỔ QUỐC GHI ƠN", w / 2, h * 0.34);

    ctx.fillStyle = "#6c3024";
    ctx.font = "600 40px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("ĐÀI TƯỞNG NIỆM · BIA QUỐC HỌC", w / 2, h * 0.60);

    ctx.fillStyle = "#7a5b34";
    ctx.font = "600 28px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("BỜ NAM SÔNG HƯƠNG · CỐ ĐÔ HUẾ", w / 2, h * 0.78);
  });
}

function createAtticTabletTexture() {
  return createCanvasTexture(512, 256, (ctx, w, h) => {
    ctx.fillStyle = "#efe1ba";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#8b5d33";
    ctx.lineWidth = 14;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = "#c59852";
    ctx.lineWidth = 5;
    ctx.strokeRect(26, 26, w - 52, h - 52);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#922d22";
    ctx.font = "700 48px 'Playfair Display', Georgia, serif";
    ctx.fillText("BIA QUỐC HỌC", w / 2, h * 0.44);
    ctx.fillStyle = "#6d4c2a";
    ctx.font = "600 24px 'Be Vietnam Pro', sans-serif";
    ctx.fillText("HUẾ · 1920", w / 2, h * 0.72);
  });
}

function createThoPanelTexture() {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#973b2c";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e8cf95";
    ctx.lineWidth = 10;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    // Geometric Hue Longevity (Chữ Thọ) meander
    ctx.strokeStyle = "#ecd7a4";
    ctx.lineWidth = 8;
    const pad = 42;
    const s = w - pad * 2;
    ctx.strokeRect(pad, pad, s, s);
    ctx.strokeRect(pad + 28, pad + 28, s - 56, s - 56);
    ctx.beginPath();
    ctx.moveTo(w / 2, pad);
    ctx.lineTo(w / 2, h - pad);
    ctx.moveTo(pad, h / 2);
    ctx.lineTo(w - pad, h / 2);
    ctx.stroke();
    ctx.fillStyle = "#973b2c";
    ctx.fillRect(w / 2 - 22, h / 2 - 22, 44, 44);
    ctx.strokeRect(w / 2 - 22, h / 2 - 22, 44, 44);
  });
}

function createStoneDadoTexture() {
  return createCanvasTexture(512, 128, (ctx, w, h) => {
    ctx.fillStyle = "#b8a684";
    ctx.fillRect(0, 0, w, h);
    // Recessed dark weathered mortar panels along terrace walls
    for (let x = 16; x < w - 16; x += 120) {
      ctx.fillStyle = "#7a6f5b";
      ctx.fillRect(x, 22, 98, h - 44);
      ctx.strokeStyle = "#d5c6a3";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, 22, 98, h - 44);
      ctx.fillStyle = "#5f5646";
      ctx.fillRect(x + 12, 34, 74, h - 68);
    }
    ctx.fillStyle = "#d7c9a6";
    ctx.fillRect(0, 0, w, 14);
    ctx.fillRect(0, h - 14, w, 14);
  });
}

function createPillarInscriptionTexture() {
  return createCanvasTexture(128, 512, (ctx, w, h) => {
    ctx.fillStyle = "#efe0b9";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#9b3c2c";
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.fillStyle = "#8f2c22";
    for (let y = 56; y < h - 44; y += 54) {
      ctx.fillRect(w * 0.3, y, w * 0.4, 12);
      ctx.fillRect(w * 0.38, y + 18, w * 0.24, 10);
    }
  });
}

function lotusFinial(color = "#96876b", gold = "#c79e52", scale = 1) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.28 * scale, 0.16 * scale, 8),
    mat(color, 0.78),
  );
  base.position.y = 0.08 * scale;
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24 * scale, 0.16 * scale, 0.16 * scale, 8),
    mat(gold, 0.45, 0.35),
  );
  collar.position.y = 0.22 * scale;
  const bud = new THREE.Mesh(
    new THREE.SphereGeometry(0.21 * scale, 12, 10),
    mat(color, 0.72),
  );
  bud.scale.set(1, 1.38, 1);
  bud.position.y = 0.42 * scale;
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.11 * scale, 0.2 * scale, 8),
    mat(gold, 0.38, 0.45),
  );
  tip.position.y = 0.68 * scale;
  g.add(base, collar, bud, tip);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}

function guardianLion(scale = 1) {
  const g = new THREE.Group();
  const stone = "#8c826f";
  const accent = "#b3a588";
  const pedestal = box([0.7 * scale, 0.36 * scale, 0.85 * scale], accent, [
    0,
    0.18 * scale,
    0,
  ]);
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.42 * scale, 0.56 * scale, 0.52 * scale),
    mat(stone, 0.82),
  );
  body.position.set(0, 0.62 * scale, -0.04 * scale);
  body.rotation.x = -0.18;
  const head = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.24 * scale, 0),
    mat(stone, 0.78),
  );
  head.position.set(0, 0.96 * scale, 0.14 * scale);
  const mane = new THREE.Mesh(
    new THREE.TorusGeometry(0.2 * scale, 0.065 * scale, 6, 12),
    mat(accent, 0.8),
  );
  mane.position.set(0, 0.94 * scale, 0.08 * scale);
  const paws = box([0.44 * scale, 0.22 * scale, 0.26 * scale], stone, [
    0,
    0.47 * scale,
    0.22 * scale,
  ]);
  g.add(pedestal, body, head, mane, paws);
  g.traverse((o) => {
    if (o.isMesh) o.castShadow = o.receiveShadow = true;
  });
  return g;
}

function curvedTileRoof(width, depth, y, color = "#9c7a4c", ribColor = "#806139") {
  const group = tiledRoof(width, depth, y, color);
  // Add terracotta-gold ridge crest & upturned Hue corner finials (đầu đao)
  const ridgeY = y + 1.28;
  group.add(
    box([width * 0.96, 0.14, 0.18], ribColor, [0, ridgeY, 0]),
    box([width * 0.88, 0.09, 0.12], "#c59f58", [0, ridgeY + 0.1, 0]),
  );
  for (const sx of [-1, 1]) {
    const scroll = new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.055, 6, 12, Math.PI * 1.4),
      mat("#b69760", 0.55, 0.2),
    );
    scroll.position.set(sx * (width * 0.48), ridgeY + 0.18, 0);
    scroll.rotation.z = sx > 0 ? -0.3 : 0.3;
    group.add(scroll);
    for (const sz of [-1, 1]) {
      const eave = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.32, 6),
        mat("#b99c68", 0.55, 0.2),
      );
      eave.position.set(sx * (width * 0.49), y + 0.32, sz * (depth * 0.49));
      eave.rotation.z = -sx * 0.45;
      eave.rotation.x = sz * 0.35;
      group.add(eave);
    }
  }
  return group;
}

function buildBalustradeRun(start, end, y, postEvery = 2.1, skipPostStart = false, skipPostEnd = false) {
  const g = new THREE.Group();
  const dx = end[0] - start[0];
  const dz = end[1] - start[1];
  const len = Math.hypot(dx, dz);
  if (len < 0.2) return g;
  const yaw = Math.atan2(dx, dz);

  // Bottom plinth & top coping rail
  const rail = new THREE.Group();
  rail.position.set((start[0] + end[0]) / 2, y, (start[1] + end[1]) / 2);
  rail.rotation.y = yaw;
  rail.add(
    box([0.28, 0.14, len], "#c8b998", [0, 0.07, 0]),
    box([0.24, 0.11, len], "#d4c6a6", [0, 0.66, 0]),
  );
  // Carved balusters merged for efficiency
  const balusters = [];
  for (let d = 0.42; d < len - 0.32; d += 0.36) {
    const b = new THREE.BoxGeometry(0.11, 0.46, 0.11);
    b.translate(0, 0.37, d - len / 2);
    balusters.push(b);
  }
  if (balusters.length) {
    const merged = mergeGeometries(balusters);
    balusters.forEach((b) => b.dispose());
    const m = new THREE.Mesh(merged, mat("#a89b80", 0.8));
    m.castShadow = m.receiveShadow = true;
    rail.add(m);
  }
  g.add(rail);

  const count = Math.max(1, Math.round(len / postEvery));
  for (let i = 0; i <= count; i++) {
    if (i === 0 && skipPostStart) continue;
    if (i === count && skipPostEnd) continue;
    const t = i / count;
    const px = start[0] + dx * t;
    const pz = start[1] + dz * t;
    const post = new THREE.Group();
    post.position.set(px, y, pz);
    post.add(box([0.34, 0.78, 0.34], "#b5a687", [0, 0.39, 0]));
    const urn = lotusFinial("#9c8f73", "#c29d55", 0.42);
    urn.position.y = 0.78;
    post.add(urn);
    g.add(post);
  }
  return g;
}

function buildTruBieu(x, z, inscriptionTex) {
  const g = new THREE.Group();
  g.position.set(x, 0.01, z);

  // Three-tiered square stone plinth
  g.add(
    box([2.25, 0.28, 2.25], "#9a8f7b", [0, 0.14, 0]),
    box([1.85, 0.34, 1.85], "#b8a784", [0, 0.45, 0]),
    box([1.45, 0.38, 1.45], "#cbb993", [0, 0.81, 0]),
  );

  // Main tall octagonal/square chamfered shaft with recessed calligraphy panels
  g.add(box([1.06, 4.9, 1.06], "#c6b38b", [0, 3.45, 0]));
  for (const [rx, rz, rot] of [
    [0, 0.54, 0],
    [0, -0.54, Math.PI],
    [0.54, 0, Math.PI / 2],
    [-0.54, 0, -Math.PI / 2],
  ]) {
    const panelMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: inscriptionTex,
      roughness: 0.72,
    });
    const panel = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 3.9),
      panelMat,
    );
    panel.position.set(rx, 3.45, rz);
    panel.rotation.y = rot;
    g.add(panel);
  }
  // Vertical crimson corner flutes
  for (const sx of [-0.46, 0.46])
    for (const sz of [-0.46, 0.46])
      g.add(box([0.16, 4.95, 0.16], "#934535", [sx, 3.45, sz]));

  // Molded double lotus capital collar
  g.add(
    box([1.36, 0.24, 1.36], "#9c8b6e", [0, 6.02, 0]),
    box([1.52, 0.22, 1.52], "#cfb888", [0, 6.25, 0]),
    box([1.14, 0.72, 1.14], "#b39f79", [0, 6.72, 0]),
    box([1.42, 0.18, 1.42], "#8f7d5f", [0, 7.17, 0]),
  );
  // Square lantern crown & royal lotus-nghê finial
  g.add(box([0.78, 0.52, 0.78], "#a84434", [0, 7.52, 0]));
  const finial = lotusFinial("#8b7f68", "#cfa454", 1.35);
  finial.position.y = 7.78;
  g.add(finial);

  return g;
}

export const quocHoc = {
  id: "quoc-hoc",
  title: "Bia Quốc Học",
  position: { x: -42, z: 26 },
  radius: 12,
  referenceImage: new URL(
    "../../../../assets/bia quoc hoc hue.jpg",
    import.meta.url,
  ).href,
  description:
    "Khuôn viên Bia Quốc Học và công viên bờ sông Hương đối diện Trường Quốc Học: bình phong cổ kính, bệ tam cấp lan can đá, cặp trụ biểu, bậc cỏ giật cấp và sàn gỗ ven sông.",
  create() {
    const g = new THREE.Group();
    g.name = "bia-quoc-hoc-monument";

    const steleTex = createStelePlaqueTexture();
    const atticTex = createAtticTabletTexture();
    const thoTex = createThoPanelTexture();
    const dadoTex = createStoneDadoTexture();
    const pillarTex = createPillarInscriptionTexture();

    const dadoMat = new THREE.MeshStandardMaterial({
      color: "#d4c8ae",
      map: dadoTex,
      roughness: 0.85,
      metalness: 0.04,
    });
    const steleMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: steleTex,
      roughness: 0.68,
      metalness: 0.04,
    });
    const atticMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: atticTex,
      roughness: 0.68,
      metalness: 0.04,
    });
    const thoMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: thoTex,
      roughness: 0.62,
      metalness: 0.08,
    });

    // 1. LOWER IMPERIAL TERRACE (24.4m x 11.4m, height 0.96m sitting on plaza y=0.01)
    const lowerY = 0.01;
    const lowerTop = 0.97;
    // Red-brick & dark-stone base trim
    g.add(box([24.7, 0.14, 11.7], "#8f4335", [0, lowerY + 0.07, 0]));
    const lowerBody = new THREE.Mesh(
      new THREE.BoxGeometry(24.4, 0.82, 11.4),
      dadoMat,
    );
    lowerBody.position.set(0, lowerY + 0.55, 0);
    lowerBody.castShadow = lowerBody.receiveShadow = true;
    g.add(lowerBody);
    // Lower terrace paved sandstone floor + perimeter coping
    g.add(box([24.6, 0.08, 11.6], "#d6ccb4", [0, lowerTop - 0.02, 0]));

    // Balustrades around lower terrace (open at front & rear 5.4m central stairways)
    const lxMax = 12.0;
    const lzMax = 5.5;
    const stairHalf = 2.85;
    for (const sz of [-1, 1]) {
      g.add(
        buildBalustradeRun([-lxMax, sz * lzMax], [-stairHalf, sz * lzMax], lowerTop, 2.2),
        buildBalustradeRun([stairHalf, sz * lzMax], [lxMax, sz * lzMax], lowerTop, 2.2),
      );
    }
    for (const sx of [-1, 1]) {
      g.add(
        buildBalustradeRun([sx * lxMax, -lzMax], [sx * lxMax, lzMax], lowerTop, 2.2, true, true),
      );
    }

    // 2. GRAND FRONT (+Z facing Trường Quốc Học) & REAR (-Z facing Sông Hương) STAIRWAYS
    for (const dir of [-1, 1]) {
      const steps = 7;
      for (let i = 0; i < steps; i++) {
        const stepH = (lowerTop - lowerY) / steps;
        const stepY = lowerY + stepH * (i + 0.5);
        const stepZ = dir * (5.65 + (steps - 1 - i) * 0.34);
        g.add(box([5.4, stepH, 0.38], "#cfc7b4", [0, stepY, stepZ]));
      }
      // Sloped stone cheek walls + guardian stone Nghê + upper urn pillars
      for (const sx of [-1, 1]) {
        g.add(
          box([0.48, 0.68, 2.5], "#b3a588", [sx * 2.95, lowerY + 0.36, dir * 6.85]),
          box([0.56, 0.16, 2.6], "#8f836e", [sx * 2.95, lowerY + 0.72, dir * 6.85]),
        );
        const lion = guardianLion(0.88);
        lion.position.set(sx * 3.0, lowerY, dir * 8.35);
        if (dir < 0) lion.rotation.y = Math.PI;
        g.add(lion);
      }
    }

    // 3. UPPER CEREMONIAL TERRACE (14.6m x 6.6m, height 0.70m -> y=1.67m)
    const upperTop = 1.67;
    const upperBody = new THREE.Mesh(
      new THREE.BoxGeometry(14.6, 0.7, 6.6),
      dadoMat,
    );
    upperBody.position.set(0, lowerTop + 0.35, 0);
    upperBody.castShadow = upperBody.receiveShadow = true;
    g.add(upperBody);
    g.add(box([14.8, 0.08, 6.8], "#d9cfb7", [0, upperTop - 0.02, 0]));

    for (const dir of [-1, 1]) {
      for (let i = 0; i < 5; i++) {
        const stepH = (upperTop - lowerTop) / 5;
        g.add(
          box([4.2, stepH, 0.32], "#d5ccb8", [
            0,
            lowerTop + stepH * (i + 0.5),
            dir * (3.3 + (4 - i) * 0.28),
          ]),
        );
      }
      g.add(
        buildBalustradeRun([-7.1, dir * 3.15], [-2.2, dir * 3.15], upperTop, 2.45),
        buildBalustradeRun([2.2, dir * 3.15], [7.1, dir * 3.15], upperTop, 2.45),
      );
    }
    for (const sx of [-1, 1]) {
      g.add(
        buildBalustradeRun([sx * 7.1, -3.15], [sx * 7.1, 3.15], upperTop, 2.1, true, true),
      );
    }

    // 4. MONUMENTAL BIA QUỐC HỌC IMPERIAL SCREEN (Bình phong chính)
    const plinthTop = upperTop + 0.62;
    g.add(
      box([11.0, 0.24, 2.75], "#847967", [0, upperTop + 0.12, 0]),
      box([10.5, 0.22, 2.45], "#b8a784", [0, upperTop + 0.35, 0]),
      box([10.1, 0.18, 2.15], "#d2c29d", [0, upperTop + 0.54, 0]),
    );

    // Central stele wall (5.1m x 3.05m x 0.96m) with double-sided "TỔ QUỐC GHI ƠN" tablet
    g.add(
      box([5.15, 3.05, 0.96], "#c5ab7d", [0, plinthTop + 1.52, 0]),
      box([5.35, 0.22, 1.15], "#a68b5f", [0, plinthTop + 3.06, 0]),
    );
    for (const dir of [-1, 1]) {
      // Recessed stele frame + ceremonial plaque
      g.add(
        box([3.95, 2.08, 0.1], "#8f6b43", [0, plinthTop + 1.48, dir * 0.49]),
      );
      const plaque = new THREE.Mesh(
        new THREE.PlaneGeometry(3.75, 1.9),
        steleMat,
      );
      plaque.position.set(0, plinthTop + 1.48, dir * 0.55);
      if (dir < 0) plaque.rotation.y = Math.PI;
      g.add(plaque);

      // Blue-and-ochre glazed ceramic frieze above plaque
      g.add(
        box([4.2, 0.28, 0.12], "#4c6c82", [0, plinthTop + 2.72, dir * 0.49]),
        box([4.35, 0.1, 0.14], "#d2b47c", [0, plinthTop + 2.9, dir * 0.5]),
      );
    }

    // Four sculpted cylindrical lotus-bud columns flanking the central stele
    for (const sx of [-2.22, 2.22]) {
      for (const sz of [-0.46, 0.46]) {
        const col = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.21, 2.45, 12),
          mat("#d4b483", 0.65),
        );
        col.position.set(sx, plinthTop + 1.24, sz);
        col.castShadow = col.receiveShadow = true;
        g.add(col);
        // Painted royal blue & terracotta bands + lotus bud cap
        for (const [ry, c] of [
          [0.45, "#a64532"],
          [1.25, "#3f6780"],
          [2.05, "#a64532"],
        ]) {
          const ring = new THREE.Mesh(
            new THREE.CylinderGeometry(0.205, 0.205, 0.14, 12),
            mat(c, 0.55),
          );
          ring.position.set(sx, plinthTop + ry, sz);
          g.add(ring);
        }
        const bud = lotusFinial("#d9c89f", "#b68341", 0.55);
        bud.position.set(sx, plinthTop + 2.46, sz);
        g.add(bud);
      }
    }

    // Perforated hexagonal masonry wings between central stele & side pavilions
    for (const sx of [-1, 1]) {
      const wx = sx * 2.96;
      g.add(
        box([0.82, 0.22, 0.68], "#9b8c72", [wx, plinthTop + 0.11, 0]),
        box([0.82, 0.22, 0.68], "#9b8c72", [wx, plinthTop + 2.72, 0]),
      );
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 2; col++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.16, 0.048, 6, 6),
            mat("#b7aa8e", 0.78),
          );
          ring.position.set(
            wx + (col - 0.5) * 0.36,
            plinthTop + 0.48 + row * 0.58,
            0,
          );
          g.add(ring);
        }
      }
    }

    // Flanking Square Pavilions (Tả Lâu & Hữu Lâu) with crimson-gold Chữ Thọ panels
    for (const sx of [-1, 1]) {
      const px = sx * 4.28;
      g.add(
        box([1.95, 2.95, 1.75], "#cbb488", [px, plinthTop + 1.48, 0]),
        box([2.12, 0.24, 1.92], "#8f7e63", [px, plinthTop + 2.98, 0]),
      );
      // Ochre corner pilasters
      for (const cx of [-0.88, 0.88])
        for (const cz of [-0.78, 0.78])
          g.add(box([0.24, 3.05, 0.24], "#b39463", [px + cx, plinthTop + 1.52, cz]));

      // Front & Back Chữ Thọ panels
      for (const dir of [-1, 1]) {
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.56), thoMat);
        panel.position.set(px, plinthTop + 1.55, dir * 0.89);
        if (dir < 0) panel.rotation.y = Math.PI;
        g.add(panel);
      }
      // Outer side Chữ Thọ panel
      const sidePanel = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 1.56), thoMat);
      sidePanel.position.set(px + sx * 0.99, plinthTop + 1.55, 0);
      sidePanel.rotation.y = sx > 0 ? Math.PI / 2 : -Math.PI / 2;
      g.add(sidePanel);

      // Side pavilion curved glazed tile roof
      g.add(curvedTileRoof(2.65, 2.45, plinthTop + 3.05, "#9c7847", "#7e5d33"));
    }

    // Sweeping Central Curved Imperial Roof (Mái bình phong chính)
    g.add(curvedTileRoof(6.6, 2.75, plinthTop + 3.12, "#a3804e", "#836339"));

    // Upper Attic Pavilion (Cổ Lầu / Vọng Lâu)
    const atticY = plinthTop + 4.18;
    g.add(
      box([3.1, 0.22, 1.65], "#96856a", [0, atticY, 0]),
      box([2.8, 1.38, 1.35], "#cdb688", [0, atticY + 0.78, 0]),
    );
    for (const dir of [-1, 1]) {
      const tablet = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 0.95), atticMat);
      tablet.position.set(0, atticY + 0.8, dir * 0.69);
      if (dir < 0) tablet.rotation.y = Math.PI;
      g.add(tablet);
    }
    for (const sx of [-1.32, 1.32])
      for (const sz of [-0.6, 0.6])
        g.add(box([0.2, 1.44, 0.2], "#a88757", [sx, atticY + 0.78, sz]));

    const atticRoof = curvedTileRoof(3.75, 2.35, atticY + 1.46, "#926f41", "#78572e");
    g.add(atticRoof);
    // Crowning central solar-pearl finial atop Cổ Lầu
    const crownPearl = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 10),
      mat("#d4a448", 0.35, 0.55),
    );
    crownPearl.position.set(0, atticY + 2.98, 0);
    g.add(crownPearl);

    // 5. TWIN ROYAL TRỤ BIỂU (Ceremonial Obelisk Pillars flanking the front plaza)
    for (const sx of [-1, 1]) {
      g.add(buildTruBieu(sx * 13.2, 9.2, pillarTex));
    }

    const name = label("Bia Quốc Học");
    name.position.y = 10.6;
    g.add(name);
    return g;
  },
};
