import * as THREE from "three";
import quangTrungCampuses from "../data/campuses.json" with { type: "json" };
import {
  getById,
  getPointsOf,
} from "../../../../core/shared/geography/activeGeography.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnMaterial } from "../../../../core/world/turfTextures.js";
import { hitsCampusWall } from "../../../../core/shared/architecture/CampusWalls.js";
import { filterSegmentsClearOfRoads } from "../../../../core/world/streetPlacement.js";

function createCanvasTexture(width, height, draw, repeatX = 1, repeatY = 1) {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) draw(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  return tex;
}

function createHospitalWallTexture() {
  return createCanvasTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = "#f2f6f7";
    ctx.fillRect(0, 0, w, h);

    // Subtle clinical ceramic tile grid & base plinth
    ctx.fillStyle = "#d5e4e6";
    ctx.fillRect(0, h - 42, w, 42);
    ctx.fillStyle = "#2b898c";
    ctx.fillRect(0, h - 48, w, 8);

    const floorStep = Math.floor((h - 48) / 3);
    for (let f = 0; f < 3; f++) {
      const topY = f * floorStep;
      ctx.fillStyle = "#2b898c";
      ctx.fillRect(0, topY, w, 12);

      const winY = topY + 26;
      const winH = floorStep - 44;
      for (const wx of [26, 144, 262, 380]) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(wx - 4, winY - 4, 112, winH + 8);
        ctx.fillStyle = "#2a5d6d";
        ctx.fillRect(wx, winY, 104, winH);
        ctx.fillStyle = "rgba(150, 220, 232, 0.25)";
        ctx.fillRect(wx + 6, winY + 6, 44, winH - 12);
        ctx.fillStyle = "#d7e6ea";
        ctx.fillRect(wx + 50, winY + 4, 4, winH - 8);
      }
    }
  });
}

function createHospitalSignTexture(
  title = "BỆNH VIỆN RĂNG HÀM MẶT HUẾ",
  subtitle = "SỐ 83 NGUYỄN HUỆ · PHƯỜNG THUẬN HÓA · TP. HUẾ",
) {
  return createCanvasTexture(1024, 224, (ctx, w, h) => {
    ctx.fillStyle = "#0e6b6e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#e4f4f4";
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, w - 16, h - 16);

    // Medical red cross emblem on left
    ctx.fillStyle = "#ffffff";
    ctx.beginPath?.();
    ctx.arc?.(94, h / 2, 54, 0, Math.PI * 2);
    ctx.fill?.();
    ctx.fillStyle = "#d62828";
    ctx.fillRect(82, h / 2 - 34, 24, 68);
    ctx.fillRect(60, h / 2 - 12, 68, 24);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 46px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(title, 174, h * 0.38, w - 210);
    ctx.fillStyle = "#b8f2ee";
    ctx.font = "600 32px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(subtitle, 174, h * 0.72, w - 210);
  });
}

function createHospitalFenceTexture() {
  return createCanvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = "#485855";
    ctx.fillRect(0, 0, w, h);
    // Low cream masonry base
    ctx.fillStyle = "#eef4f4";
    ctx.fillRect(0, 166, w, 90);
    ctx.fillStyle = "#1a797c";
    ctx.fillRect(0, 158, w, 10);
    // Teal vertical iron pickets
    ctx.fillStyle = "#166b6e";
    ctx.fillRect(0, 24, w, 9);
    ctx.fillRect(0, 140, w, 9);
    for (let x = 10; x < w; x += 24) {
      ctx.fillStyle = "#228c8f";
      ctx.fillRect(x, 8, 7, 150);
    }
  });
}

function polygonGeometry(points, height = 0) {
  const shape = new THREE.Shape(
    points.map((p) => new THREE.Vector2(p.x, -p.z)),
  );
  const g = height
    ? new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false })
    : new THREE.ShapeGeometry(shape);
  g.rotateX(-Math.PI / 2);
  return g;
}

function cutRingGateSpans(a, b, gateCenter, gapWidth) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  if (len < 0.2) return [];
  const ux = dx / len;
  const uz = dz / len;
  const distToLine = Math.abs((gateCenter.x - a.x) * -uz + (gateCenter.z - a.z) * ux);
  if (distToLine > 3.5) return [{ a, b }];

  const proj = (gateCenter.x - a.x) * ux + (gateCenter.z - a.z) * uz;
  const half = gapWidth / 2;
  const t0 = proj - half;
  const t1 = proj + half;
  if (t1 <= 0 || t0 >= len) return [{ a, b }];

  const out = [];
  if (t0 > 0.35) {
    out.push({
      a,
      b: { x: a.x + ux * t0, z: a.z + uz * t0 },
    });
  }
  if (t1 < len - 0.35) {
    out.push({
      a: { x: a.x + ux * t1, z: a.z + uz * t1 },
      b,
    });
  }
  return out;
}

function createCompoundTree(x, y, z, scale = 1) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16 * scale, 0.22 * scale, 2.4 * scale, 8),
    mat("#63503e", 0.9),
  );
  trunk.position.y = 1.2 * scale;
  trunk.castShadow = true;
  const crown = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.45 * scale, 1),
    mat("#3e7c38", 0.86),
  );
  crown.scale.set(1.15, 0.78, 1.15);
  crown.position.y = 2.9 * scale;
  crown.castShadow = true;
  g.add(trunk, crown);
  return g;
}

export class BenhVienRhmHue {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    const cfg = quangTrungCampuses["benh-vien-rhm-hue"];
    this.ring = cfg.ring;
    this.entrance = cfg.entrance;
    this.buildingIds = cfg.buildings || [732309927];
    this.roadYaw = quangTrungCampuses.gateHeading;
    this.fwdVec = {
      x: -Math.sin(this.roadYaw),
      z: -Math.cos(this.roadYaw),
    };
    this.rightVec = { x: -this.fwdVec.z, z: this.fwdVec.x };

    this.group = new THREE.Group();
    this.group.name = "benh-vien-rhm-hue";
    this.animatedObjects = [];
    this.buildingPolygons = [];
    this.fenceSegments = [];
    this.obstacles = [];

    this.buildGrounds();
    this.buildPerimeterAndMainGate();
    this.buildMainHospital();

    world.scene.add(this.group);
  }

  toWorld(side, fwd) {
    return {
      x: this.entrance.x + side * this.rightVec.x + fwd * this.fwdVec.x,
      z: this.entrance.z + side * this.rightVec.z + fwd * this.fwdVec.z,
    };
  }

  toLocal(wx, wz) {
    const dx = wx - this.entrance.x;
    const dz = wz - this.entrance.z;
    return {
      side: dx * this.rightVec.x + dz * this.rightVec.z,
      fwd: dx * this.fwdVec.x + dz * this.fwdVec.z,
    };
  }

  inCompound(wx, wz) {
    return inside({ x: wx, z: wz }, this.ring);
  }

  buildGrounds() {
    // Crisp concrete paved hospital forecourt & ambulance bay
    const forecourt = new THREE.Mesh(
      polygonGeometry(this.ring, 0.12),
      mat("#cfcbc3", 0.85),
    );
    forecourt.position.y = 0.16;
    forecourt.receiveShadow = true;
    this.group.add(forecourt);

    const foreGroup = new THREE.Group();
    foreGroup.position.set(this.entrance.x, 0, this.entrance.z);
    foreGroup.rotation.y = this.roadYaw;

    // Landscaped medical courtyard lawns inside fence flanking wide clear main driveway
    const lawnMat = createManicuredLawnMaterial(4, 4, { striped: false, rich: true });
    for (const sx of [-8.8, 8.8]) {
      const curb = box([4.8, 0.34, 0.38], "#dfe5e6", [sx, 0.35, -1.6]);
      const planter = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.18, 2.8), lawnMat);
      planter.position.set(sx, 0.28, -3.2);
      foreGroup.add(curb, planter);
      this.obstacles.push({ side: sx, fwd: 3.0, radius: 1.8 });
    }

    // Drop-off circular turn lane stripe in front of portico (kept completely clear for vehicles/bikes)
    const laneArc = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 4.68, 28),
      mat("#f5f5ef", 0.9),
    );
    laneArc.rotation.x = -Math.PI / 2;
    laneArc.position.set(0, 0.295, -7.2);
    foreGroup.add(laneArc);

    // Ornamental shade trees tucked along far inner corners (well away from gate opening and road curbs)
    for (const [tx, tf] of [
      [-11.2, 8.2],
      [10.6, 8.2],
      [-12.6, 39.5],
      [10.8, 39.5],
    ]) {
      foreGroup.add(createCompoundTree(tx, 0.28, -tf, 0.95));
      this.obstacles.push({ side: tx, fwd: tf, radius: 1.05 });
    }

    this.group.add(foreGroup);
  }

  buildPerimeterAndMainGate() {
    const fenceTex = createHospitalFenceTexture();
    const fenceMat = new THREE.MeshStandardMaterial({
      color: fenceTex ? "#ffffff" : "#228c8f",
      map: fenceTex,
      roughness: 0.68,
    });
    const pierMat = mat("#eef4f4", 0.72);
    const capMat = mat("#156b6e", 0.55);

    const fenceGroup = new THREE.Group();
    fenceGroup.name = "benh-vien-rhm-hue-fence";

    const gateWidth = 11.6;
    const rawSpans = [];
    for (let i = 1; i < this.ring.length; i++) {
      rawSpans.push(
        ...cutRingGateSpans(
          this.ring[i - 1],
          this.ring[i],
          this.entrance,
          gateWidth,
        ),
      );
    }
    const safeSpans = filterSegmentsClearOfRoads(
      rawSpans,
      this.world?.renderRoads,
      0.65,
    );
    for (const seg of safeSpans) {
      this.fenceSegments.push(seg);
      const dx = seg.b.x - seg.a.x;
      const dz = seg.b.z - seg.a.z;
      const len = Math.hypot(dx, dz);
        if (len < 0.25) continue;
        const yaw = Math.atan2(-dz, dx);
        const mx = (seg.a.x + seg.b.x) / 2;
        const mz = (seg.a.z + seg.b.z) / 2;

        const panel = new THREE.Mesh(
          new THREE.BoxGeometry(len, 1.95, 0.24),
          fenceMat,
        );
        panel.position.set(mx, 0.24 + 0.98, mz);
        panel.rotation.y = yaw;
        panel.castShadow = panel.receiveShadow = true;
        fenceGroup.add(panel);

        const posts = Math.max(1, Math.round(len / 5.5));
        for (let p = 0; p <= posts; p++) {
          const t = p / posts;
          const px = seg.a.x + dx * t;
          const pz = seg.a.z + dz * t;
          const post = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 2.15, 0.46),
            pierMat,
          );
          post.position.set(px, 0.24 + 1.075, pz);
          post.rotation.y = yaw;
          post.castShadow = true;
          const cap = new THREE.Mesh(
            new THREE.BoxGeometry(0.56, 0.14, 0.56),
            capMat,
          );
          cap.position.set(px, 0.24 + 2.2, pz);
          cap.rotation.y = yaw;
        fenceGroup.add(post, cap);
      }
    }
    this.group.add(fenceGroup);

    // Grand main hospital entrance gate at this.entrance (wide 11.6m open passage)
    const gate = new THREE.Group();
    gate.name = "benh-vien-rhm-hue-main-gate";
    gate.position.set(this.entrance.x, 0.24, this.entrance.z);
    gate.rotation.y = this.roadYaw;

    for (const sx of [-5.8, 5.8]) {
      gate.add(
        box([1.08, 0.45, 1.08], "#cfdadc", [sx, 0.22, 0]),
        box([0.92, 4.4, 0.92], "#f4f8f9", [sx, 2.4, 0]),
        box([0.98, 0.28, 0.98], "#177679", [sx, 1.25, 0]),
        box([0.98, 0.28, 0.98], "#177679", [sx, 3.85, 0]),
        box([1.12, 0.22, 1.12], "#146669", [sx, 4.65, 0]),
        // Red medical cross emblem on front of each main gate pier
        box([0.16, 0.54, 0.08], "#d62828", [sx, 2.55, 0.49]),
        box([0.54, 0.16, 0.08], "#d62828", [sx, 2.55, 0.49]),
      );
      const lampGlobe = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 10),
        new THREE.MeshStandardMaterial({
          color: "#fff7db",
          emissive: "#ffe39c",
          emissiveIntensity: 0.35,
          roughness: 0.3,
        }),
      );
      lampGlobe.position.set(sx, 4.98, 0);
      gate.add(lampGlobe);
      this.obstacles.push({ side: sx, fwd: 0, radius: 0.85 });

      // Swung-open iron double gate leaves resting parallel to driveway edges
      const openLeaf = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 2.05, 4.4),
        mat("#176d70", 0.55, 0.35),
      );
      openLeaf.position.set(sx < 0 ? sx + 0.55 : sx - 0.55, 1.15, -2.35);
      gate.add(openLeaf);
    }

    // Elevated gate arch beam & double-sided hospital entrance fascia
    gate.add(
      box([12.8, 0.24, 1.1], "#f4f8f9", [0, 4.75, 0]),
      box([12.5, 1.35, 0.72], "#0e6b6e", [0, 5.5, 0]),
      box([12.8, 0.18, 0.94], "#e5f2f2", [0, 6.24, 0]),
    );
    const gateSignTex = createHospitalSignTexture(
      "BỆNH VIỆN RĂNG HÀM MẶT HUẾ",
      "83 NGUYỄN HUỆ · CỔNG CHÍNH",
    );
    const signMat = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      map: gateSignTex,
      roughness: 0.42,
    });
    const frontFace = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 1.2), signMat);
    frontFace.position.set(0, 5.5, 0.38);
    const backFace = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 1.2), signMat);
    backFace.position.set(0, 5.5, -0.38);
    backFace.rotation.y = Math.PI;
    gate.add(frontFace, backFace);

    // Compact security guard kiosk tucked neatly inside right gate pillar (clear of driveway)
    gate.add(
      box([1.85, 2.35, 1.75], "#eef4f5", [7.6, 1.18, -2.1]),
      box([2.05, 0.22, 1.95], "#177679", [7.6, 2.42, -2.1]),
      box([1.1, 0.78, 0.08], "#254957", [7.6, 1.5, -1.2]),
    );
    this.obstacles.push({ side: 7.6, fwd: 2.1, radius: 1.3 });

    this.group.add(gate);
  }

  buildMainHospital() {
    const wallTex = createHospitalWallTexture();
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallTex ? "#ffffff" : "#f2f6f7",
      map: wallTex,
      roughness: 0.68,
      metalness: 0.05,
    });

    for (const id of this.buildingIds) {
      const feature = getById(id);
      if (!feature) continue;
      const pts = getPointsOf(feature);
      this.buildingPolygons.push(pts);

      const height = 11.2;
      const bodyGeo = polygonGeometry(pts, height);
      if (bodyGeo.attributes.uv) {
        const uv = bodyGeo.attributes.uv;
        const pos = bodyGeo.attributes.position;
        for (let i = 0; i < uv.count; i++) {
          uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 8.8, pos.getY(i) / height);
        }
      }
      const bodyMesh = new THREE.Mesh(bodyGeo, wallMat);
      bodyMesh.position.y = 0.28;
      bodyMesh.castShadow = bodyMesh.receiveShadow = true;
      this.group.add(bodyMesh);
      this.world.cameraObstacles.push(bodyMesh);
    }

    // Projecting clinical portico, rooftop teal crown & signage facing 83 Nguyễn Huệ
    const portico = new THREE.Group();
    portico.name = "benh-vien-rhm-hue-sign";
    const pCenter = this.toWorld(0, 14.5);
    portico.position.set(pCenter.x, 0.28, pCenter.z);
    portico.rotation.y = this.roadYaw;

    // White cylindrical canopy columns + crisp teal medical portico slab
    for (const sx of [-4.2, 4.2]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 4.2, 12),
        mat("#ffffff", 0.5),
      );
      col.position.set(sx, 2.1, 2.8);
      col.castShadow = true;
      portico.add(col);
    }
    portico.add(
      box([10.4, 0.9, 4.2], "#1a797c", [0, 4.35, 1.4]),
      box([10.6, 0.16, 4.4], "#f4f8f9", [0, 4.86, 1.4]),
    );

    const signTex = createHospitalSignTexture();
    const signPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(9.6, 1.9),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: signTex,
        roughness: 0.42,
      }),
    );
    signPanel.position.set(0, 7.6, 0.6);
    portico.add(signPanel);

    // Rooftop Red Cross medical crest pavilion at roof edge
    portico.add(
      box([4.2, 1.4, 2.2], "#e8f0f1", [0, 11.7, -3.5]),
      box([0.36, 1.0, 0.14], "#d62828", [0, 11.8, -2.36]),
      box([1.0, 0.36, 0.14], "#d62828", [0, 11.8, -2.36]),
    );

    this.group.add(portico);
  }

  groundAt(wx, wz, referenceY) {
    if (!this.inCompound(wx, wz)) return null;
    if (Number.isFinite(referenceY) && referenceY > 1.8) return null;
    return 0.28;
  }

  canRide(wx, wz) {
    if (hitsCampusWall({ x: wx, z: wz }, this.fenceSegments, 0.55)) {
      return false;
    }
    const { side, fwd } = this.toLocal(wx, wz);
    if (Math.abs(side) < 5.0 && Math.abs(fwd) <= 1.2) {
      return true;
    }
    if (!this.inCompound(wx, wz)) return null;
    if (this.buildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
    if (
      this.obstacles.some(
        (o) => Math.hypot(side - o.side, fwd - o.fwd) < o.radius,
      )
    ) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCompound(wx, wz);
  }

  blocksTree(wx, wz) {
    if (this.inCompound(wx, wz)) return true;
    const { side, fwd } = this.toLocal(wx, wz);
    // Keep front sidewalk & gate approach zone completely clear of roadside trees
    if (Math.abs(side) < 17.5 && fwd > -14 && fwd < 6) return true;
    return Math.hypot(wx - this.entrance.x, wz - this.entrance.z) < 14.5;
  }
}

