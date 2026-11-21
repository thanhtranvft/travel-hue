import * as THREE from "three";
import config from "../data/school-gates.json" with { type: "json" };
import { box, mat, roof } from "../../../../core/shared/architecture/shared.js";
import { pointsOf, roads } from "../../../../core/shared/geography/map.js";
import { nearestPoint } from "../../../../core/shared/geography/geometry.js";

function createGateCanvasTexture(width, height, draw) {
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

export function gateNamePanel(title, address, width = 8.6, height = 1.3) {
  const texture = createGateCanvasTexture(1536, 256, (c) => {
    c.fillStyle = "#0863b8";
    c.fillRect(0, 0, 1536, 256);
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "bold 86px Arial";
    c.fillText(title, 768, 110, 1450);
    c.font = "bold 62px Arial";
    c.fillText(address, 768, 210);
  });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide }),
  );
  panel.name = "gate-name-panel";
  return panel;
}

function createQuocHocSignPanel(width = 6.5, height = 0.96) {
  const texture = createGateCanvasTexture(1536, 240, (c, w, h) => {
    c.fillStyle = "#8d2428";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#e0b354";
    c.lineWidth = 18;
    c.strokeRect(10, 10, w - 20, h - 20);
    c.strokeStyle = "#f7dda0";
    c.lineWidth = 4;
    c.strokeRect(26, 26, w - 52, h - 52);

    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#f7d47c";
    c.font = "bold 92px 'Playfair Display', Georgia, serif";
    c.fillText("TRƯỜNG QUỐC HỌC", w / 2, h * 0.44);
    c.fillStyle = "#f5e3b8";
    c.font = "600 34px 'Be Vietnam Pro', sans-serif";
    c.fillText("12 LÊ LỢI · HUẾ · 1896", w / 2, h * 0.78);
  });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.48,
      metalness: 0.14,
      side: THREE.DoubleSide,
    }),
  );
  panel.name = "gate-name-panel";
  return panel;
}

function createQuocHocReliefTexture() {
  return createGateCanvasTexture(128, 128, (c, w, h) => {
    c.fillStyle = "#eee6d6";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#9b2a2f";
    c.lineWidth = 6;
    c.strokeRect(8, 8, w - 16, h - 16);
    c.strokeStyle = "#c99b44";
    c.lineWidth = 5;
    c.strokeRect(24, 24, w - 48, h - 48);
    c.beginPath();
    c.moveTo(w / 2, 24);
    c.lineTo(w / 2, h - 24);
    c.moveTo(24, h / 2);
    c.lineTo(w - 24, h / 2);
    c.stroke();
    c.fillStyle = "#9b2a2f";
    c.fillRect(w / 2 - 12, h / 2 - 12, 24, 24);
  });
}

function createGlazedTileRoof(width, depth, y, ridgeHeight = 1.05) {
  const g = new THREE.Group();
  const nx = 26;
  const nz = 12;
  const vertices = [];
  const uvs = [];
  const indices = [];
  const roofHeight = (x, z) =>
    y +
    ridgeHeight * (1 - Math.abs(z * 2) / depth) +
    0.24 * Math.pow(Math.abs(x * 2) / width, 5) +
    0.2 * Math.pow(Math.abs(z * 2) / depth, 6);

  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= nz; j++) {
      const x = (i / nx - 0.5) * width;
      const z = (j / nz - 0.5) * depth;
      vertices.push(x, roofHeight(x, z), z);
      uvs.push((i / nx) * (width / 0.8), j / nz);
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const a = i * (nz + 1) + j;
      const b = a + nz + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const tileTex = createGateCanvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = "#b95922";
    c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = "#d17c32";
      c.fillRect(x + 2, 0, 14, h);
      c.fillStyle = "#8c3b16";
      c.fillRect(x + 24, 0, 6, h);
    }
    for (let y0 = 0; y0 < h; y0 += 32) {
      c.fillStyle = "rgba(84,32,12,0.28)";
      c.fillRect(0, y0, w, 3);
    }
  });
  if (tileTex) {
    tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const roofMat = new THREE.MeshStandardMaterial({
    color: tileTex ? "#ffffff" : "#b95922",
    map: tileTex,
    roughness: 0.42,
    metalness: 0.08,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, roofMat);
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);

  // White/cream eave fascia and main terracotta ridge beam
  const ridgeY = y + ridgeHeight;
  g.add(
    box([width * 0.94, 0.14, 0.22], "#9f3628", [0, ridgeY + 0.06, 0]),
    box([width * 0.9, 0.1, 0.14], "#efe7d6", [0, ridgeY + 0.16, 0]),
    box([width * 0.99, 0.09, depth * 0.98], "#ece4d2", [0, y + 0.02, 0]),
  );

  // Upturned Hue dragon-scroll finials at ends of ridge and 4 eave corners
  for (const sx of [-1, 1]) {
    const dragonScroll = new THREE.Mesh(
      new THREE.TorusGeometry(0.22, 0.07, 6, 12, Math.PI * 1.4),
      mat("#d9d5c9", 0.65),
    );
    dragonScroll.position.set(sx * (width * 0.46), ridgeY + 0.26, 0);
    dragonScroll.rotation.z = sx > 0 ? -0.35 : 0.35;
    dragonScroll.castShadow = true;
    g.add(dragonScroll);
    for (const sz of [-1, 1]) {
      const cornerHorn = new THREE.Mesh(
        new THREE.ConeGeometry(0.11, 0.36, 6),
        mat("#d8d3c6", 0.62),
      );
      cornerHorn.position.set(sx * (width * 0.49), y + 0.34, sz * (depth * 0.49));
      cornerHorn.rotation.z = -sx * 0.5;
      cornerHorn.rotation.x = sz * 0.35;
      g.add(cornerHorn);
    }
  }
  return g;
}

function createQuocHocGate(data) {
  const group = new THREE.Group();
  group.name = "quoc-hoc-tam-quan-gate";
  const crimson = "#96292f";
  const cream = "#eee6d6";
  const bronzeIron = "#4a3327";
  const reliefTex = createQuocHocReliefTexture();
  const reliefMat = new THREE.MeshStandardMaterial({
    color: "#ffffff",
    map: reliefTex,
    roughness: 0.72,
  });

  // 4 main masonry piers: inner pair frames central 6.5m portal; outer pair frames side 1.75m pedestrian portals
  const innerX = 3.65;
  const outerX = 6.2;
  const pierPositions = [-outerX, -innerX, innerX, outerX];

  for (const px of pierPositions) {
    const isInner = Math.abs(px) < 4.5;
    const w = isInner ? 0.88 : 0.78;
    const h = isInner ? 4.85 : 4.2;
    const d = isInner ? 0.92 : 0.82;
    // White-trimmed stone base plinth + crimson shaft + top capital collar
    group.add(
      box([w + 0.2, 0.36, d + 0.2], cream, [px, 0.18, 0]),
      box([w, h, d], crimson, [px, h / 2 + 0.2, 0]),
      box([w + 0.16, 0.16, d + 0.16], cream, [px, h + 0.18, 0]),
    );
    // White horizontal accent bands & base square relief panels on front/back
    for (const dir of [-1, 1]) {
      const basePlaque = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.66, 0.78),
        reliefMat,
      );
      basePlaque.position.set(px, 0.82, dir * (d / 2 + 0.012));
      if (dir < 0) basePlaque.rotation.y = Math.PI;
      group.add(basePlaque);
    }
  }

  // Central beam & side lintels
  group.add(
    box([innerX * 2 + 0.9, 1.02, 0.76], crimson, [0, 4.35, 0]),
    box([innerX * 2 + 1.1, 0.16, 0.94], cream, [0, 4.92, 0]),
    box([innerX * 2 + 0.9, 0.12, 0.88], cream, [0, 3.82, 0]),
  );

  // Side portal lintels & decorative lattice frieze
  for (const sx of [-1, 1]) {
    const midX = sx * ((innerX + outerX) / 2);
    const span = outerX - innerX;
    group.add(
      box([span, 0.95, 0.68], crimson, [midX, 3.85, 0]),
      box([span + 0.2, 0.14, 0.82], cream, [midX, 4.38, 0]),
    );
    for (const dir of [-1, 1]) {
      const sideMotif = new THREE.Mesh(
        new THREE.PlaneGeometry(0.95, 0.62),
        reliefMat,
      );
      sideMotif.position.set(midX, 3.85, dir * 0.355);
      if (dir < 0) sideMotif.rotation.y = Math.PI;
      group.add(sideMotif);
    }
    // Open wrought-iron pedestrian gate leaves along inner sides of side portals
    for (let bar = 0; bar < 6; bar++) {
      group.add(
        box([0.045, 2.3, 0.045], bronzeIron, [
          sx * (innerX + 0.55 + bar * 0.16),
          1.45,
          0.18,
        ]),
      );
    }
    group.add(
      box([1.0, 0.07, 0.07], bronzeIron, [sx * (innerX + 0.95), 2.55, 0.18]),
      box([1.0, 0.07, 0.07], bronzeIron, [sx * (innerX + 0.95), 0.45, 0.18]),
    );
  }

  // Unobstructed front & rear nameplate: TRƯỜNG QUỐC HỌC
  const frontPanel = createQuocHocSignPanel(6.45, 0.94);
  frontPanel.position.set(0, 4.35, 0.42);
  group.add(frontPanel);

  const backPanel = createQuocHocSignPanel(6.45, 0.94);
  backPanel.position.set(0, 4.35, -0.42);
  backPanel.rotation.y = Math.PI;
  backPanel.name = "gate-name-panel-back";
  group.add(backPanel);

  // Lower tier sweeping glazed-tile roof across all 3 portals (above the nameplate!)
  group.add(createGlazedTileRoof(13.8, 2.85, 5.08, 1.02));

  // Second-tier white perforated balustrade gallery above lower roof
  const balY = 6.26;
  group.add(
    box([10.8, 0.16, 1.25], crimson, [0, balY, 0]),
    box([10.9, 0.12, 1.32], cream, [0, balY + 0.12, 0]),
    box([10.6, 0.12, 0.16], cream, [0, balY + 0.72, 0.54]),
    box([10.6, 0.12, 0.16], cream, [0, balY + 0.72, -0.54]),
  );
  for (let bx = -5.1; bx <= 5.1; bx += 0.68) {
    group.add(
      box([0.14, 0.56, 0.12], cream, [bx, balY + 0.42, 0.54]),
      box([0.14, 0.56, 0.12], cream, [bx, balY + 0.42, -0.54]),
    );
  }
  for (const bx of [-5.2, -2.55, 2.55, 5.2]) {
    group.add(
      box([0.36, 0.88, 0.36], crimson, [bx, balY + 0.48, 0.52]),
      box([0.42, 0.12, 0.42], cream, [bx, balY + 0.94, 0.52]),
    );
  }

  // Upper Cổ Lầu pavilion centered over the middle portal
  const colH = 1.95;
  const colY = balY + 0.18;
  for (const cx of [-2.45, 2.45]) {
    group.add(
      box([0.62, colH, 0.62], crimson, [cx, colY + colH / 2, 0]),
      box([0.74, 0.14, 0.74], cream, [cx, colY + 0.08, 0]),
      box([0.76, 0.14, 0.76], cream, [cx, colY + colH - 0.06, 0]),
      // White curved knee braces (con sơn) under upper eaves
      box([0.46, 0.24, 0.22], cream, [cx - Math.sign(cx) * 0.42, colY + colH - 0.26, 0]),
    );
  }
  group.add(
    box([5.5, 0.34, 0.58], crimson, [0, colY + colH - 0.1, 0]),
    createGlazedTileRoof(7.4, 2.45, colY + colH + 0.04, 0.98),
  );

  // Crowning central solar-pearl & lotus crest atop upper Cổ Lầu ridge
  const crestY = colY + colH + 1.18;
  const sunDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.12, 16),
    mat("#e0b24c", 0.35, 0.5),
  );
  sunDisc.rotation.x = Math.PI / 2;
  sunDisc.position.set(0, crestY + 0.24, 0);
  group.add(
    sunDisc,
    box([1.4, 0.18, 0.16], "#dfd9cc", [0, crestY + 0.08, 0]),
  );

  // Connecting short red masonry flanks tying the outer piers cleanly into the perimeter wall
  for (const sx of [-1, 1]) {
    group.add(
      box([1.15, 2.2, 0.4], crimson, [sx * (outerX + 0.75), 1.1, 0]),
      box([1.2, 0.2, 0.52], "#b85a26", [sx * (outerX + 0.75), 2.26, 0]),
    );
  }

  // Clean stone gate apron connecting Lê Lợi sidewalk through the gate into the school avenue
  group.add(box([7.2, 0.08, 12], "#c8c2b3", [0, -0.02, -3.5]));
  return group;
}

export function schoolGatePlacement(site) {
  const leLoi = roads.filter((r) => r.tags.name === "Lê Lợi");
  if (site.anchor.kind === "mapped-entrance") {
    const hit = leLoi
      .map((r) => nearestPoint(site.sign, r.points))
      .sort((a, b) => a.distance - b.distance)[0];
    return {
      ...site.sign,
      heading: Math.atan2(hit.x - site.sign.x, hit.z - site.sign.z),
      confidence: "mapped",
    };
  }
  const points = pointsOf(site.feature),
    edges = [];
  for (let i = 1; i < points.length; i++) {
    const p = {
        x: (points[i - 1].x + points[i].x) / 2,
        z: (points[i - 1].z + points[i].z) / 2,
      },
      hit = leLoi
        .map((r) => nearestPoint(p, r.points))
        .sort((a, b) => a.distance - b.distance)[0];
    edges.push({ p, hit });
  }
  edges.sort((a, b) => a.hit.distance - b.hit.distance);
  const { p, hit } = edges[0];
  return {
    ...p,
    heading: Math.atan2(hit.x - p.x, hit.z - p.z),
    confidence: "estimated-frontage",
  };
}

function createHaiBaTrungSignPanel(width = 7.0, height = 1.28) {
  const texture = createGateCanvasTexture(1536, 280, (c, w, h) => {
    c.fillStyle = "#f4f0e6";
    c.fillRect(0, 0, w, h);
    c.strokeStyle = "#94272d";
    c.lineWidth = 14;
    c.strokeRect(7, 7, w - 14, h - 14);
    c.strokeStyle = "#b88c46";
    c.lineWidth = 4;
    c.strokeRect(20, 20, w - 40, h - 40);

    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#4d171a";
    c.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
    c.fillText("TRƯỜNG TRUNG HỌC PHỔ THÔNG", w / 2, h * 0.27);
    c.fillStyle = "#7b1d22";
    c.font = "bold 104px 'Playfair Display', Georgia, serif";
    c.fillText("HAI BÀ TRƯNG", w / 2, h * 0.62);
    c.fillStyle = "#624b42";
    c.font = "600 28px 'Be Vietnam Pro', Arial, sans-serif";
    c.fillText("14 LÊ LỢI · HUẾ · 1917", w / 2, h * 0.87);
  });
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.52,
      metalness: 0.06,
      side: THREE.DoubleSide,
    }),
  );
  panel.name = "gate-name-panel";
  return panel;
}

function createHaiBaTrungGate() {
  const group = new THREE.Group();
  group.name = "hai-ba-trung-tam-quan-gate";
  const crimson = "#94272d";
  const cream = "#f0eae0";
  const ironMat = mat("#8b9499", 0.38, 0.72);

  // 4 stepped crimson masonry piers (matching Hai Bà Trưng Tam Quan gate in photo 1)
  const innerX = 3.75;
  const outerX = 6.45;
  for (const px of [-outerX, -innerX, innerX, outerX]) {
    const isInner = Math.abs(px) < 4.5;
    const w = isInner ? 0.92 : 0.76;
    const h = isInner ? 5.25 : 4.1;
    const d = isInner ? 0.96 : 0.82;
    group.add(
      box([w + 0.18, 0.34, d + 0.18], cream, [px, 0.17, 0]),
      box([w, h, d], crimson, [px, h / 2 + 0.2, 0]),
      box([w + 0.14, 0.18, d + 0.14], cream, [px, h + 0.22, 0]),
      box([w + 0.24, 0.22, d + 0.24], crimson, [px, h + 0.38, 0]),
    );
  }

  // Main upper lintel & upturned curved beam tails (đầu đao ngang)
  group.add(
    box([innerX * 2 + 2.6, 1.38, 0.72], crimson, [0, 4.25, 0]),
    box([innerX * 2 + 3.1, 0.16, 0.88], crimson, [0, 4.98, 0]),
    box([innerX * 2 + 2.8, 0.1, 0.84], cream, [0, 3.55, 0]),
  );
  for (const sx of [-1, 1]) {
    // Upturned beam horns at ends of upper and lower lintels
    group.add(
      box([0.45, 0.38, 0.74], crimson, [sx * (innerX + 1.4), 4.7, 0]),
      box([0.42, 0.34, 0.64], crimson, [sx * (outerX + 1.15), 3.78, 0]),
    );
  }

  // Side pedestrian lintels & open silver-grey iron gate leaves
  for (const sx of [-1, 1]) {
    const midX = sx * ((innerX + outerX) / 2);
    const span = outerX - innerX;
    group.add(
      box([span + 1.4, 0.56, 0.6], crimson, [midX + sx * 0.45, 3.45, 0]),
      box([span + 1.6, 0.14, 0.72], crimson, [midX + sx * 0.45, 3.78, 0]),
    );
    // White stepped geometric fretwork brackets (hoa văn chữ Công trắng) under inner & side corners
    group.add(
      box([0.62, 0.14, 0.36], cream, [sx * (innerX - 0.66), 3.46, 0]),
      box([0.14, 0.42, 0.36], cream, [sx * (innerX - 0.92), 3.28, 0]),
      box([0.42, 0.14, 0.36], cream, [sx * (innerX - 1.06), 3.12, 0]),
      box([0.52, 0.12, 0.34], cream, [sx * (innerX + 0.62), 3.12, 0]),
      box([0.12, 0.36, 0.34], cream, [sx * (innerX + 0.84), 2.96, 0]),
      box([0.32, 0.12, 0.34], cream, [sx * (innerX + 0.96), 2.82, 0]),
    );
    // Silver-grey iron pedestrian gate leaf with lower solid kickplate
    for (let bar = 0; bar < 7; bar++) {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 2.35, 0.045),
        ironMat,
      );
      mesh.position.set(sx * (innerX + 0.62 + bar * 0.16), 1.38, 0.16);
      group.add(mesh);
    }
    group.add(
      box([1.15, 0.55, 0.06], "#8c969b", [sx * (innerX + 1.12), 0.48, 0.16]),
      box([1.15, 0.07, 0.07], "#8c969b", [sx * (innerX + 1.12), 2.52, 0.16]),
    );
  }

  // Red oval/rectangular school plaque on right inner pier (matching photo 1)
  group.add(box([0.62, 0.42, 0.06], "#b82e29", [innerX, 2.05, 0.5]));

  // Unobstructed front & back white signboard: TRƯỜNG THPT HAI BÀ TRƯNG
  const frontPanel = createHaiBaTrungSignPanel(6.95, 1.24);
  frontPanel.position.set(0, 4.25, 0.4);
  group.add(frontPanel);

  const backPanel = createHaiBaTrungSignPanel(6.95, 1.24);
  backPanel.position.set(0, 4.25, -0.4);
  backPanel.rotation.y = Math.PI;
  backPanel.name = "gate-name-panel-back";
  group.add(backPanel);

  // Connecting low masonry flanks tying outer piers cleanly into the perimeter fence
  for (const sx of [-1, 1]) {
    group.add(
      box([1.1, 1.9, 0.38], crimson, [sx * (outerX + 0.72), 0.95, 0]),
      box([1.15, 0.16, 0.46], crimson, [sx * (outerX + 0.72), 1.94, 0]),
    );
  }

  // Clean paved stone apron leading from Lê Lợi sidewalk through the gate
  group.add(box([7.4, 0.08, 12], "#c5c0b5", [0, -0.02, -3.5]));
  return group;
}

export function createSchoolGate(site) {
  const data = config[site.id];
  if (!data) return null;
  if (site.id === "quoc-hoc-school") {
    return {
      object: createQuocHocGate(data),
      placement: schoolGatePlacement(site),
    };
  }
  if (site.id === "hai-ba-trung") {
    return {
      object: createHaiBaTrungGate(),
      placement: schoolGatePlacement(site),
    };
  }
  const group = new THREE.Group(),
    w = data.width;
  for (const x of [-w / 2, w / 2]) {
    group.add(
      box([1, 4.7, 1], data.color, [x, 2.35, 0]),
      box([1.35, 0.3, 1.35], data.trim, [x, 4.7, 0]),
      box([1.3, 0.25, 1.3], data.trim, [x, 0.125, 0]),
      box([4, 1.7, 0.4], data.wallColor || data.color, [
        x + Math.sign(x) * 2.5,
        0.85,
        0,
      ]),
    );
  }
  group.add(
    box([w, 1, 0.55], data.color, [0, 4, 0]),
    box([w + 0.6, 0.22, 0.85], data.trim, [0, 4.6, 0]),
  );
  if (data.style === "tiled")
    for (const x of [-w / 2, 0, w / 2]) {
      const r = roof(x === 0 ? 6 : 2.3, 1.7, "#8d392a", 6.1);
      r.position.x = x;
      group.add(r);
      group.add(box([x === 0 ? 6 : 1.1, 0.3, 1.1], data.color, [x, 4.9, 0]));
    }
  else {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(1.7, 0.16, 6, 32, Math.PI),
      new THREE.MeshStandardMaterial({ color: data.trim }),
    );
    arch.position.set(0, 4.65, 0);
    group.add(arch);
  }
  const panel = gateNamePanel(data.title, data.address);
  panel.position.set(0, 4.05, 0.65);
  group.add(panel, box([8, 0.12, 20], "#c7bea7", [0, -0.02, -7]));
  for (const side of [-1, 1])
    for (let i = 0; i < 10; i++)
      group.add(
        box([0.055, 2.1, 0.06], "#435856", [
          side * (w / 2 + 0.3 + i * 0.25),
          1.3,
          0.3,
        ]),
      );
  return { object: group, placement: schoolGatePlacement(site) };
}

