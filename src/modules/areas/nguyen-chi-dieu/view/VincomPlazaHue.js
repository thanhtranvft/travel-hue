import * as THREE from "three";
import dongDaCampuses from "../data/campuses.json" with { type: "json" };
import {
  getById,
  getCentroid,
  getPointsOf,
} from "../../../../core/shared/geography/activeGeography.js";
import {
  inside,
  nearestPoint,
} from "../../../../core/shared/geography/geometry.js";
import { box, mat } from "../../../../core/shared/architecture/shared.js";
import { createManicuredLawnMaterial } from "../../../../core/world/turfTextures.js";

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

function createCurtainWallTexture() {
  return createCanvasTexture(
    512,
    512,
    (ctx, w, h) => {
      ctx.fillStyle = "#315b7d";
      ctx.fillRect(0, 0, w, h);

      // Horizontal floor spandrel bands & vertical aluminum mullions
      for (let y = 0; y < h; y += 64) {
        ctx.fillStyle = "#527d9e";
        ctx.fillRect(0, y + 4, w, 40);
        ctx.fillStyle = "#87b5d4";
        ctx.fillRect(0, y + 6, w, 12);
        ctx.fillStyle = "#cfd8e0";
        ctx.fillRect(0, y + 48, w, 14);
      }
      ctx.fillStyle = "#b5c2cc";
      for (let x = 0; x < w; x += 42) {
        ctx.fillRect(x, 0, 5, h);
      }
    },
    3,
    10,
  );
}

function createPodiumMallTexture() {
  return createCanvasTexture(
    512,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = "#ede6d6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#b5965d";
      ctx.fillRect(0, 0, w, 18);
      ctx.fillRect(0, h - 22, w, 22);
      for (let x = 18; x < w; x += 82) {
        ctx.fillStyle = "#355570";
        ctx.fillRect(x, 34, 62, 180);
        ctx.fillStyle = "#76a2c4";
        ctx.fillRect(x + 6, 42, 50, 96);
        ctx.fillStyle = "#dfd4bd";
        ctx.fillRect(x - 4, 24, 70, 10);
      }
    },
    6,
    2,
  );
}

function createBrandSignTexture(mainText, subText, bgColor, textColor, accent) {
  return createCanvasTexture(1024, 256, (ctx, w, h) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 10;
    ctx.strokeRect(10, 10, w - 20, h - 20);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.font = "900 84px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText(mainText, w / 2, subText ? h * 0.42 : h * 0.5, w - 70);
    if (subText) {
      ctx.fillStyle = accent;
      ctx.font = "700 34px 'Be Vietnam Pro', Arial, sans-serif";
      ctx.fillText(subText, w / 2, h * 0.78, w - 70);
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

function scalePolygonAround(points, center, factor) {
  return points.map((p) => ({
    x: center.x + (p.x - center.x) * factor,
    z: center.z + (p.z - center.z) * factor,
  }));
}

export class VincomPlazaHue {
  constructor(world, site) {
    this.world = world;
    this.site = site;
    const cfg = dongDaCampuses["vincom-hue"];
    this.wayId = cfg?.wayId || 749331141;
    this.feature = getById(this.wayId) || site?.feature || null;
    this.roundabout = dongDaCampuses.roundabout || {
      center: { x: 1815.52, z: -758.57 },
      radius: 26.1,
    };
    this.islandRadius = 14.8;

    this.group = new THREE.Group();
    this.group.name = "vincom-plaza-hue";
    this.animatedObjects = [];
    this.buildingPolygon = this.feature ? getPointsOf(this.feature) : [];
    this.podiumPolygon = [];

    this.buildVincomTower();
    this.buildRoundaboutCenterpiece();

    world.scene.add(this.group);
  }

  buildVincomTower() {
    if (!this.buildingPolygon.length) return;
    const center = getCentroid(this.feature);
    const pts = this.buildingPolygon;
    this.podiumPolygon = scalePolygonAround(pts, center, 1.04);

    // Granite entrance apron around Vincom Plaza footprint
    const plazaGeo = polygonGeometry(scalePolygonAround(pts, center, 1.07), 0.14);
    const plazaMesh = new THREE.Mesh(
      plazaGeo,
      mat("#cfcac0", 0.78, 0.06),
    );
    plazaMesh.position.y = 0.14;
    plazaMesh.receiveShadow = true;
    this.group.add(plazaMesh);

    // 5-story sleek commercial retail podium matching OSM building polygon
    const podiumH = 21.0;
    const podiumTex = createPodiumMallTexture();
    const podiumGeo = polygonGeometry(pts, podiumH);
    if (podiumGeo.attributes.uv) {
      const uv = podiumGeo.attributes.uv;
      const pos = podiumGeo.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 24, pos.getY(i) / podiumH);
      }
    }
    const podiumMesh = new THREE.Mesh(
      podiumGeo,
      new THREE.MeshStandardMaterial({
        color: podiumTex ? "#ffffff" : "#ede6d6",
        map: podiumTex,
        roughness: 0.45,
        metalness: 0.18,
      }),
    );
    podiumMesh.position.y = 0.28;
    podiumMesh.castShadow = podiumMesh.receiveShadow = true;
    this.group.add(podiumMesh);
    this.world.cameraObstacles.push(podiumMesh);

    // Champagne-gold roof cornice trimming the retail podium
    const podiumTrim = new THREE.Mesh(
      polygonGeometry(scalePolygonAround(pts, center, 1.02), 1.1),
      mat("#d4b472", 0.35, 0.55),
    );
    podiumTrim.position.y = 0.28 + podiumH - 0.5;
    this.group.add(podiumTrim);

    // Towering 39-story Meliá Vinpearl / Vincom curtain-wall skyscraper rising inset above podium
    const towerPts = scalePolygonAround(pts, center, 0.56);
    const towerH = 122.0;
    const glassTex = createCurtainWallTexture();
    const towerGeo = polygonGeometry(towerPts, towerH);
    if (towerGeo.attributes.uv) {
      const uv = towerGeo.attributes.uv;
      const pos = towerGeo.attributes.position;
      for (let i = 0; i < uv.count; i++) {
        uv.setXY(i, (pos.getX(i) + pos.getZ(i)) / 18, pos.getY(i) / towerH);
      }
    }
    const towerMesh = new THREE.Mesh(
      towerGeo,
      new THREE.MeshStandardMaterial({
        color: glassTex ? "#ffffff" : "#3a698e",
        map: glassTex,
        roughness: 0.24,
        metalness: 0.55,
      }),
    );
    towerMesh.position.y = 0.28 + podiumH;
    towerMesh.castShadow = towerMesh.receiveShadow = true;
    this.group.add(towerMesh);
    this.world.cameraObstacles.push(towerMesh);

    // Tapered sculptural crown parapet + helipad/spire frame atop skyscraper
    const crownBaseY = 0.28 + podiumH + towerH;
    const crownMesh = new THREE.Mesh(
      polygonGeometry(scalePolygonAround(pts, center, 0.5), 7.5),
      mat("#dde4ea", 0.35, 0.55),
    );
    crownMesh.position.y = crownBaseY;
    const crownFin = new THREE.Mesh(
      polygonGeometry(scalePolygonAround(pts, center, 0.36), 5.5),
      mat("#d6b569", 0.3, 0.65),
    );
    crownFin.position.y = crownBaseY + 7.5;
    this.group.add(crownMesh, crownFin);

    // Direction toward Ngã 6 Bùng binh Hùng Vương center & exact front wall distance
    const rb = this.roundabout.center;
    const dirX = rb.x - center.x;
    const dirZ = rb.z - center.z;
    const dirLen = Math.hypot(dirX, dirZ) || 1;
    const ux = dirX / dirLen;
    const uz = dirZ / dirLen;
    const faceYaw = Math.atan2(dirX, dirZ);

    let frontWallDist = 33.5;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const sx = b.x - a.x;
      const sz = b.z - a.z;
      const denom = ux * sz - uz * sx;
      if (Math.abs(denom) > 1e-6) {
        const t = ((a.x - center.x) * sz - (a.z - center.z) * sx) / denom;
        const u = ((a.x - center.x) * uz - (a.z - center.z) * ux) / denom;
        if (t > 0 && u >= 0 && u <= 1) {
          frontWallDist = t;
          break;
        }
      }
    }

    // Illuminated entrance canopy & "VINCOM PLAZA HUẾ" marquee facing Ngã 6 & Đống Đa
    const marquee = new THREE.Group();
    marquee.position.set(center.x, 0.28, center.z);
    marquee.rotation.y = faceYaw;

    const vincomTex = createBrandSignTexture(
      "VINCOM PLAZA HUẾ",
      "50A HÙNG VƯƠNG · NGÃ 6",
      "#9d1920",
      "#ffffff",
      "#f2cb68",
    );
    const podiumSign = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 4.6),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: vincomTex,
        emissive: "#481012",
        emissiveIntensity: 0.45,
        roughness: 0.35,
      }),
    );
    podiumSign.name = "vincom-plaza-sign";
    podiumSign.position.set(0, 15.8, frontWallDist + 0.35);

    const meliaTex = createBrandSignTexture(
      "MELIÁ VINPEARL",
      "VINCOM TOWER",
      "#132c4c",
      "#f5d678",
      "#e2c16b",
    );
    const skySign = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 4.8),
      new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: meliaTex,
        emissive: "#1b365d",
        emissiveIntensity: 0.5,
        roughness: 0.3,
      }),
    );
    skySign.name = "melia-vinpearl-sign";
    skySign.position.set(0, crownBaseY + 3.8, frontWallDist * 0.5 + 0.35);

    // Projecting entrance canopy over podium front
    marquee.add(
      box([18, 0.65, 5.2], "#b89656", [0, 5.4, frontWallDist + 2.4]),
      box([16.8, 0.4, 4.6], "#1b2836", [0, 5.1, frontWallDist + 2.4]),
      podiumSign,
      skySign,
    );
    this.group.add(marquee);
  }

  buildRoundaboutCenterpiece() {
    const rb = this.roundabout.center;
    const island = new THREE.Group();
    island.name = "nga-sau-roundabout-island";
    island.position.set(rb.x, 0.23, rb.z);

    // Outer stepped white stone curb keeping surrounding roundabout asphalt wide & driveable
    const curbOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(this.islandRadius, this.islandRadius + 0.35, 0.32, 48),
      mat("#dbd5c7", 0.78),
    );
    curbOuter.position.y = 0.16;
    curbOuter.receiveShadow = true;

    const turf = new THREE.Mesh(
      new THREE.CylinderGeometry(this.islandRadius - 0.55, this.islandRadius - 0.55, 0.36, 48),
      createManicuredLawnMaterial(4, 4, { striped: false, rich: true }),
    );
    turf.position.y = 0.19;
    turf.receiveShadow = true;
    island.add(curbOuter, turf);

    // Floral concentric flower rings (gold marigold & magenta bougainvillea)
    for (const [r, color, tube] of [
      [11.4, "#e6a62e", 0.55],
      [8.2, "#c83e6b", 0.5],
      [4.9, "#417a36", 0.45],
    ]) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, tube, 8, 36),
        mat(color, 0.72),
      );
      ring.rotation.x = Math.PI / 2;
      ring.scale.set(1, 1, 0.65);
      ring.position.y = 0.46;
      island.add(ring);
    }

    // Modern stepped granite pedestal & ornamental lotus-spire landmark centerpiece at Ngã 6 center
    const pedestal1 = new THREE.Mesh(
      new THREE.CylinderGeometry(3.2, 3.6, 0.55, 24),
      mat("#d5cfc1", 0.75),
    );
    pedestal1.position.y = 0.62;
    const pedestal2 = new THREE.Mesh(
      new THREE.CylinderGeometry(1.9, 2.3, 1.35, 16),
      mat("#8f2b2e", 0.65),
    );
    pedestal2.position.y = 1.55;
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.62, 5.2, 12),
      mat("#e5be58", 0.32, 0.68),
    );
    spire.position.y = 4.65;
    spire.castShadow = true;
    const crownOrb = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.68, 1),
      mat("#f7dc7e", 0.25, 0.75),
    );
    crownOrb.position.y = 7.45;
    island.add(pedestal1, pedestal2, spire, crownOrb);

    this.group.add(island);
  }

  groundAt(wx, wz, referenceY) {
    if (
      this.podiumPolygon.length &&
      inside({ x: wx, z: wz }, this.podiumPolygon) &&
      (!Number.isFinite(referenceY) || referenceY < 1.8)
    ) {
      return 0.28;
    }
    return null;
  }

  canRide(wx, wz) {
    if (this.buildingPolygon.length && inside({ x: wx, z: wz }, this.buildingPolygon)) {
      return false;
    }
    const rb = this.roundabout.center;
    if (Math.hypot(wx - rb.x, wz - rb.z) < this.islandRadius + 0.4) {
      return false;
    }
    return null;
  }

  blocksTree(wx, wz) {
    if (
      this.podiumPolygon.length &&
      (inside({ x: wx, z: wz }, this.podiumPolygon) ||
        nearestPoint({ x: wx, z: wz }, this.podiumPolygon).distance < 4)
    ) {
      return true;
    }
    const rb = this.roundabout.center;
    return Math.hypot(wx - rb.x, wz - rb.z) < this.roundabout.radius + 4;
  }
}
