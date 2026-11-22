import * as THREE from "three";
import quangTrungCampuses from "../data/campuses.json" with { type: "json" };
import {
  getById,
  getPointsOf,
} from "../../../../core/shared/geography/activeGeography.js";
import { inside } from "../../../../core/shared/geography/geometry.js";
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

function createHospitalSignTexture() {
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
    ctx.fillText("BỆNH VIỆN RĂNG HÀM MẶT HUẾ", 174, h * 0.38, w - 210);
    ctx.fillStyle = "#b8f2ee";
    ctx.font = "600 32px 'Be Vietnam Pro', Arial, sans-serif";
    ctx.fillText("SỐ 83 NGUYỄN HUỆ · PHƯỜNG THUẬN HÓA · TP. HUẾ", 174, h * 0.72, w - 210);
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

    this.buildGrounds();
    this.buildMainHospital();

    world.scene.add(this.group);
  }

  toWorld(side, fwd) {
    return {
      x: this.entrance.x + side * this.rightVec.x + fwd * this.fwdVec.x,
      z: this.entrance.z + side * this.rightVec.z + fwd * this.fwdVec.z,
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

    // Low sculpted front medical garden borders flanking open driveway
    const lawnMat = createManicuredLawnMaterial(4, 4, { striped: false, rich: true });
    for (const sx of [-11.5, 11.5]) {
      const curb = box([7.8, 0.36, 0.4], "#dfe5e6", [sx, 0.36, -0.4]);
      const planter = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.18, 2.8), lawnMat);
      planter.position.set(sx, 0.28, -2.5);
      foreGroup.add(curb, planter);
    }

    // Drop-off circular turn lane stripe in front of portico
    const laneArc = new THREE.Mesh(
      new THREE.RingGeometry(4.5, 4.68, 28),
      mat("#f5f5ef", 0.9),
    );
    laneArc.rotation.x = -Math.PI / 2;
    laneArc.position.set(0, 0.295, -7.0);
    foreGroup.add(laneArc);

    this.group.add(foreGroup);
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
    if (!this.inCompound(wx, wz)) return null;
    if (this.buildingPolygons.some((poly) => inside({ x: wx, z: wz }, poly))) {
      return false;
    }
    return true;
  }

  blocksGrass(wx, wz) {
    return this.inCompound(wx, wz);
  }

  blocksTree(wx, wz) {
    return this.inCompound(wx, wz);
  }
}
