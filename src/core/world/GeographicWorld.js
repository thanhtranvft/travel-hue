import * as THREE from "three";
import {
  addTruongTienBridge,
  TRUONG_TIEN_ROAD_HALF,
  TRUONG_TIEN_WALK_INNER,
  TRUONG_TIEN_WALK_OUTER,
  truongTienDeckQuery,
} from "../../modules/areas/truong-tien/view/BridgeView.js";
import { addPhuXuanBridge } from "../../modules/areas/quoc-hoc/view/PhuXuanBridgeView.js";
import {
  addLimWoodBoardwalk,
  BOARDWALK_EXTENSION_POINTS,
  LATERAL_BRIDGE_IDS,
  lateralBridgeHeight,
  stitchMainBoardwalk,
} from "../../modules/areas/south-bank/view/BoardwalkView.js";
import { TruongTienSurroundings } from "../../modules/areas/truong-tien/view/TruongTienSurroundings.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { SharedModelLoader as GLTFLoader } from "../shared/resources/sceneResources.js";
import {
  getFeatures,
  getRoads,
  getMainRoads,
  getRiver,
  getSites,
  getPointsOf,
  getRingsOf,
  getCentroid,
  getById,
  getBoardwalkWayIds,
  getMappedSignals,
  getCorridorCrossings,
} from "../shared/geography/activeGeography.js";
import { intersection } from "../shared/geography/map.js";
import { inside, nearestPoint, project } from "../shared/geography/geometry.js";
import { appendTrailPoint, renderAreaMap } from "./minimap.js";
import { addStreetDetails } from "./StreetDetails.js";
import { roadsidePoint } from "./streetPlacement.js";
import { isFootway, roadWidth } from "./roadProfile.js";
import {
  BOARDWALK_Y,
  roadSurfaceHeight,
  TRUONG_TIEN_ID,
  TRUONG_TIEN_SIDEWALK_IDS,
} from "./roadSurface.js";
import {
  railSegments,
  hitsRail,
} from "../../modules/areas/south-bank/view/BoardwalkRails.js";
import { LivingGrass, riverMaterial } from "./LivingLandscape.js";
import { placeTrafficSignal } from "./TrafficSignalPlacement.js";
import { PedestrianLife } from "./PedestrianLife.js";
import { postedBoard, mountSignPanel } from "./TrafficBoard.js";
import { createSchoolGate } from "../../modules/areas/quoc-hoc/view/SchoolGates.js";
import { buildingFrontage } from "./BuildingFrontage.js";
import {
  createCampusWalls,
  hitsCampusWall,
} from "../shared/architecture/CampusWalls.js";
import { YouthPlayground } from "../../modules/areas/quoc-hoc/view/YouthPlayground.js";
import { HueStation } from "../../modules/areas/quoc-hoc/view/HueStation.js";
import { PropertyEnclosures } from "./PropertyEnclosures.js";
import { campusWallIndex, nearbyWalls } from "./CampusWallIndex.js";
import { regionContains } from "../../modules/areas/AreaModel.js";
import { loadSharedModel } from "../shared/resources/sceneResources.js";
export { roadWidth } from "./roadProfile.js";
import { landmarkModules } from "../shared/architecture/registry.js";
import { createBiaQuocHocPark } from "../../modules/areas/quoc-hoc/view/BiaQuocHocPark.js";
import { createFireflyTreePark } from "../../modules/areas/quoc-hoc/view/FireflyTreePark.js";
import { createFountainPark } from "../../modules/areas/quoc-hoc/view/FountainPark.js";
import { createPhuXuanParkWalk } from "../../modules/areas/quoc-hoc/view/PhuXuanParkWalk.js";
import { QuocHocSchoolCampus } from "../../modules/areas/quoc-hoc/view/QuocHocSchoolCampus.js";
import { HaiBaTrungSchoolCampus } from "../../modules/areas/quoc-hoc/view/HaiBaTrungSchoolCampus.js";
import { NguyenChiDieuCampus } from "../../modules/areas/nguyen-chi-dieu/view/NguyenChiDieuCampus.js";
import { CaoThangCampus } from "../../modules/areas/nguyen-chi-dieu/view/CaoThangCampus.js";
import { VincomPlazaHue } from "../../modules/areas/nguyen-chi-dieu/view/VincomPlazaHue.js";
import { QuangTrungCampus } from "../../modules/areas/quang-trung/view/QuangTrungCampus.js";
import { BenhVienRhmHue } from "../../modules/areas/quang-trung/view/BenhVienRhmHue.js";
import { DongChuaCuuTheChurch } from "../../modules/areas/quang-trung/view/DongChuaCuuTheChurch.js";
import { QuangTrungEastPrecinct } from "../../modules/areas/quang-trung/view/QuangTrungEastPrecinct.js";
import {
  DongDaCorridor,
  DONG_DA_CUSTOM_BUILDING_IDS,
  dongDaToWorld,
} from "../../modules/areas/nguyen-chi-dieu/view/DongDaCorridor.js";
import quangTrungCampuses from "../../modules/areas/quang-trung/data/campuses.json" with { type: "json" };
import {
  applyWorldPlanarUVs,
  createManicuredLawnMaterial,
} from "./turfTextures.js";
import { surfaceTexture } from "./surfaceTextures.js";
import { box, mat } from "../shared/architecture/shared.js";
import { beam } from "../shared/architecture/architecture.js";
import {
  corridorStyles,
  siteForBuilding,
  decorateCorridorBuilding,
} from "../shared/architecture/CorridorArchitecture.js";

const CUSTOM_LANDMARK_BUILDING_IDS = new Set([
  732304130,
  732304131,
  1416873568,
  732304133,
  732304134,
  732304135,
  732304136,
  732304137,
  732304138,
  749331141,
  732320417,
  732309927,
  1172894102,
  1174028275,
  1174028276,
  1174028274,
  239566031,
  239972926,
]);

const QUANG_TRUNG_SUPPRESSED_ROAD_IDS = new Set([
  1416699224,
  1572355191,
  895576841,
]);

function isQuangTrungEastPrecinctBuilding(center) {
  const gate = quangTrungCampuses["quang-trung"]?.gate;
  const h = quangTrungCampuses.gateHeading;
  if (!gate || !Number.isFinite(h)) return false;
  const fx = -Math.sin(h);
  const fz = -Math.cos(h);
  const rx = -fz;
  const rz = fx;
  const dx = center.x - gate.x;
  const dz = center.z - gate.z;
  const side = dx * rx + dz * rz;
  const fwd = dx * fx + dz * fz;
  return side >= 37.5 && side <= 223.5 && fwd >= -2.5 && fwd <= 68.0;
}

export function ribbon(points, width, height = 0.23) {
  const vertices = [],
    indices = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i],
      before = points[Math.max(0, i - 1)],
      after = points[Math.min(points.length - 1, i + 1)],
      dx = after.x - before.x,
      dz = after.z - before.z,
      length = Math.hypot(dx, dz) || 1,
      nx = ((-dz / length) * width) / 2,
      nz = ((dx / length) * width) / 2,
      y = typeof height === "function" ? height(i) : height;
    vertices.push(p.x + nx, y, p.z + nz, p.x - nx, y, p.z - nz);
    if (i) {
      const a = (i - 1) * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
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
function board(title, subtitle) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#143c35";
  ctx.fillRect(0, 0, 1024, 256);
  ctx.strokeStyle = "#dfc78c";
  ctx.lineWidth = 9;
  ctx.strokeRect(12, 12, 1000, 232);
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff0ce";
  let size = 64;
  do {
    ctx.font = `bold ${size--}px sans-serif`;
  } while (ctx.measureText(title).width > 960 && size > 22);
  ctx.fillText(title, 512, 115);
  ctx.font = "32px sans-serif";
  ctx.fillStyle = "#c9ddcd";
  ctx.fillText(subtitle, 512, 182);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 1.75),
    new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.9,
    }),
  );
  return mountSignPanel(mesh, 3, [-2.7, 2.7], "#4e5c50");
}
function facade() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#e2d9bf";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#ada38d";
  ctx.fillRect(0, 232, 256, 6);
  for (const x of [24, 152]) {
    ctx.fillStyle = "#eee8d5";
    ctx.fillRect(x - 5, 40, 85, 151);
    ctx.fillStyle = "#52706d";
    ctx.fillRect(x, 47, 75, 130);
    ctx.strokeStyle = "#acbaa6";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, 47, 75, 130);
    ctx.beginPath();
    ctx.moveTo(x + 37, 47);
    ctx.lineTo(x + 37, 177);
    ctx.moveTo(x, 89);
    ctx.lineTo(x + 75, 89);
    ctx.stroke();
    ctx.fillStyle = "#c4b59a";
    ctx.fillRect(x - 8, 182, 91, 9);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(0.16, 0.26);
  return texture;
}
export class GeographicWorld {
  constructor(scene) {
    this.scene = scene;
    this.landmarks = new Map();
    this.cameraObstacles = [];
    this.treePositions = [];
    this.buildingPolygons = [];
    this.areaLabels = [];
    this.venues = getFeatures()
      .filter(
        (f) =>
          f.type === "node" && ["restaurant", "cafe"].includes(f.tags?.amenity),
      )
      .map((f) => ({
        id: `osm-${f.id}`,
        title: f.tags.name || "Quán ăn",
        ...getCentroid(f),
      }));
    this.roadSegments = [];
    this.roadGrid = new Map();
    this.trail = [];
    this.staticMapCache = {};
    this.bounds = { minX: -350, maxX: 1700, minZ: -1900, maxZ: 200 };
  }
  build() {
    const activeFeatures = getFeatures();
    const activeRoads = getRoads();
    const activeMainRoads = getMainRoads();
    const activeRiver = getRiver();
    const activeSites = getSites();
    const activeBoardwalkWayIds = getBoardwalkWayIds();
    const activeMappedSignals = getMappedSignals();
    const activeCorridorCrossings = getCorridorCrossings();

    this.trail = [];
    this.staticMapCache = {};
    if (this.region) this.bounds = { ...this.region.bounds };
    this.loadedFeatureCount = activeFeatures.length;
    this.venues = activeFeatures
      .filter(
        (f) =>
          f.type === "node" && ["restaurant", "cafe"].includes(f.tags?.amenity),
      )
      .map((f) => ({
        id: `osm-${f.id}`,
        title: f.tags.name || "Quán ăn",
        ...getCentroid(f),
      }));
    const scene = this.scene;
    scene.background = new THREE.Color("#b8d2dd");
    scene.fog = new THREE.Fog("#b8d2dd", 450, 1800);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6500, 6500),
      createManicuredLawnMaterial(360, 360, { striped: false, rich: true }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    const waterMaterial = riverMaterial();
    this.waterMaterial = waterMaterial;
    this.riverRings = activeRiver;
    for (const ring of activeRiver) {
      const water = new THREE.Mesh(polygonGeometry(ring), waterMaterial);
      water.position.y = 0.02;
      scene.add(water);
    }
    this.parkPolygons = [];
    const parkGeos = [];
    const parkBorderGeos = [];
    for (const feature of activeFeatures.filter(
      (f) =>
        f.type === "way" &&
        f.geometry?.length > 3 &&
        (f.tags?.leisure === "park" || f.tags?.landuse === "grass"),
    )) {
      const pts = getPointsOf(feature);
      this.parkPolygons.push({
        points: pts,
        minX: Math.min(...pts.map((p) => p.x)),
        maxX: Math.max(...pts.map((p) => p.x)),
        minZ: Math.min(...pts.map((p) => p.z)),
        maxZ: Math.max(...pts.map((p) => p.z)),
      });
      parkGeos.push(applyWorldPlanarUVs(polygonGeometry(pts), 14));
      if (pts.length >= 3) {
        parkBorderGeos.push(ribbon([...pts, pts[0]], 0.55, 0.12));
      }
    }
    if (parkGeos.length) {
      const mergedParks = new THREE.Mesh(
        mergeGeometries(parkGeos),
        createManicuredLawnMaterial(1, 1, { striped: true, rich: true }),
      );
      mergedParks.position.y = 0.08;
      mergedParks.receiveShadow = true;
      scene.add(mergedParks);
      parkGeos.forEach((g) => g.dispose());
    }
    if (parkBorderGeos.length) {
      const borderMesh = new THREE.Mesh(
        mergeGeometries(parkBorderGeos),
        mat("#366d29", 0.88),
      );
      borderMesh.receiveShadow = true;
      scene.add(borderMesh);
      parkBorderGeos.forEach((g) => g.dispose());
    }
    this.renderRoads = activeRoads.filter(
      (r) =>
        !(this.region?.id === "quang-trung" && QUANG_TRUNG_SUPPRESSED_ROAD_IDS.has(r.id)) &&
        r.points.some(
          (p) =>
            p.x >= this.bounds.minX &&
            p.x <= this.bounds.maxX &&
            p.z >= this.bounds.minZ &&
            p.z <= this.bounds.maxZ,
        ),
    );
    this.boardwalkMainPoints = stitchMainBoardwalk(activeRoads);
    const customSurfaceIds = new Set([
      ...activeBoardwalkWayIds,
      ...LATERAL_BRIDGE_IDS,
      TRUONG_TIEN_ID,
      ...TRUONG_TIEN_SIDEWALK_IDS,
      39420686,
      39419121,
      39453301,
      1167997489,
      1167997491,
    ]);
    const paved = [],
      walkways = [],
      sidewalks = [];
    for (const road of this.renderRoads) {
      const width = roadWidth(road),
        foot = ["footway", "path", "pedestrian"].includes(road.tags.highway);
      const height = (i) => this.roadHeight(road, i);
      if (!customSurfaceIds.has(road.id) && road.tags.name !== "Cầu Phú Xuân") {
        (foot ? walkways : paved).push(ribbon(road.points, width, height));
      }
      if (
        !foot &&
        !road.tags.bridge &&
        !customSurfaceIds.has(road.id) &&
        road.tags.name !== "Cầu Phú Xuân"
      )
        sidewalks.push(
          ribbon(
            road.points,
            width + (this.region?.id === "nguyen-chi-dieu" ? 5 : 4),
            0.16,
          ),
        );
      for (let i = 1; i < road.points.length; i++)
        this.roadSegments.push({
          a: road.points[i - 1],
          b: road.points[i],
          width,
          road,
        });
    }
    for (const road of this.renderRoads)
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1],
          b = road.points[i],
          width = roadWidth(road) + 6,
          segment = { a, b, road, index: i };
        for (
          let x = Math.floor((Math.min(a.x, b.x) - width) / 64);
          x <= Math.floor((Math.max(a.x, b.x) + width) / 64);
          x++
        )
          for (
            let z = Math.floor((Math.min(a.z, b.z) - width) / 64);
            z <= Math.floor((Math.max(a.z, b.z) + width) / 64);
            z++
          ) {
            const key = `${x},${z}`;
            if (!this.roadGrid.has(key)) this.roadGrid.set(key, []);
            this.roadGrid.get(key).push(segment);
          }
      }
    const addMerged = (geometries, color) => {
      if (!geometries.length) return;
      const geometry = mergeGeometries(geometries),
        mesh = new THREE.Mesh(geometry, mat(color));
      mesh.material.side = THREE.DoubleSide;
      mesh.receiveShadow = true;
      scene.add(mesh);
      geometries.forEach((g) => g.dispose());
    };
    addMerged(sidewalks, "#c9c1ad");
    addMerged(paved, "#414749");
    addMerged(walkways, "#b4a78b");
    this.truongTienRoad = activeRoads.find((r) => r.id === TRUONG_TIEN_ID) || null;
    addTruongTienBridge(this, this.truongTienRoad);
    addPhuXuanBridge(this, activeRoads);
    const buildingGroups = [[], [], []],
      roofGroups = [];
    let rendered = 0;
    for (const feature of activeFeatures.filter(
      (f) => f.type === "way" && f.tags?.building && f.geometry?.length > 3,
    )) {
      const points = getPointsOf(feature),
        center = getCentroid(feature);
      if (
        center.x < this.bounds.minX ||
        center.x > this.bounds.maxX ||
        center.z < this.bounds.minZ ||
        center.z > this.bounds.maxZ
      )
        continue;
      if (
        !activeMainRoads.some(
          (r) => nearestPoint(center, r.points).distance < 135,
        )
      )
        continue;
      if (
        activeSites.some(
          (s) =>
            ["ngo-mon", "ky-dai"].includes(s.id) &&
            Math.hypot(s.center.x - center.x, s.center.z - center.z) < 30,
        )
      )
        continue;
      if (this.region?.id === "quang-trung" && isQuangTrungEastPrecinctBuilding(center))
        continue;
      if (
        this.region?.id === "nguyen-chi-dieu" &&
        DONG_DA_CUSTOM_BUILDING_IDS.has(feature.id)
      ) {
        rendered++;
        continue;
      }
      if (CUSTOM_LANDMARK_BUILDING_IDS.has(feature.id)) {
        this.buildingPolygons.push({
          points,
          minX: Math.min(...points.map((p) => p.x)),
          maxX: Math.max(...points.map((p) => p.x)),
          minZ: Math.min(...points.map((p) => p.z)),
          maxZ: Math.max(...points.map((p) => p.z)),
        });
        rendered++;
        continue;
      }
      const height =
        Number.parseFloat(feature.tags.height) ||
        Number(feature.tags["building:levels"] || 2) * 3.2;
      const institution = siteForBuilding(feature, points, activeSites, getRingsOf);
      if (institution) {
        const style = corridorStyles[institution.id];
        if (
          style &&
          ![
            "quoc-hoc-school",
            "hai-ba-trung",
            "nguyen-chi-dieu",
            "cao-thang",
            "vincom-hue",
          ].includes(institution.id)
        ) {
          const body = new THREE.Mesh(
            polygonGeometry(points, Math.min(45, height)),
            mat(style.wall),
          );
          body.position.y = 0.23;
          body.castShadow = body.receiveShadow = true;
          scene.add(
            body,
            decorateCorridorBuilding(
              points,
              Math.min(45, height),
              style,
              activeMainRoads.filter((r) =>
                ["Lê Lợi", "Đống Đa"].includes(r.tags.name),
              ),
            ),
          );
          this.cameraObstacles.push(body);
        }
        this.buildingPolygons.push({
          points,
          minX: Math.min(...points.map((p) => p.x)),
          maxX: Math.max(...points.map((p) => p.x)),
          minZ: Math.min(...points.map((p) => p.z)),
          maxZ: Math.max(...points.map((p) => p.z)),
        });
        rendered++;
        continue;
      }
      const geometry = polygonGeometry(points, Math.min(45, height));
      geometry.translate(0, 0.23, 0);
      const flat = geometry.index ? geometry.toNonIndexed() : geometry;
      for (const group of flat.groups) {
        const part = new THREE.BufferGeometry();
        for (const name of ["position", "normal", "uv"]) {
          const attr = flat.attributes[name];
          part.setAttribute(
            name,
            new THREE.BufferAttribute(
              attr.array.slice(
                group.start * attr.itemSize,
                (group.start + group.count) * attr.itemSize,
              ),
              attr.itemSize,
            ),
          );
        }
        (group.materialIndex === 1
          ? buildingGroups[feature.id % 3]
          : roofGroups
        ).push(part);
      }
      this.buildingPolygons.push({
        points,
        minX: Math.min(...points.map((p) => p.x)),
        maxX: Math.max(...points.map((p) => p.x)),
        minZ: Math.min(...points.map((p) => p.z)),
        maxZ: Math.max(...points.map((p) => p.z)),
      });
      rendered++;
    }
    const walls = facade();
    buildingGroups.forEach((geometries, i) => {
      if (!geometries.length) return;
      const material = mat(["#fff8e7", "#e3d2b0", "#cda285"][i]);
      material.map = walls;
      const mesh = new THREE.Mesh(mergeGeometries(geometries), material);
      mesh.castShadow = mesh.receiveShadow = true;
      scene.add(mesh);
      this.cameraObstacles.push(mesh);
      geometries.forEach((g) => g.dispose());
    });
    addMerged(roofGroups, "#927760");
    this.buildingCount = rendered;
    this.schoolGates = [];
    this.campusWallSegments = [];
    for (const site of activeSites) {
      if (site.kind === "school") {
        const gate = createSchoolGate(site);
        if (gate) {
          gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
          gate.object.rotation.y = gate.placement.heading;
          scene.add(gate.object);
          this.schoolGates.push({ id: site.id, ...gate.placement });
          const extraGates = [];
          if (site.id === "quang-trung") {
            const h = gate.placement.heading;
            const fx = -Math.sin(h);
            const fz = -Math.cos(h);
            const rx = -fz;
            const rz = fx;
            extraGates.push({
              x: gate.placement.x + 37.2 * rx + 58.5 * fx,
              z: gate.placement.z + 37.2 * rz + 58.5 * fz,
              gap: 5.4,
            });
          }
          const walls = createCampusWalls(site, gate.placement, extraGates);
          if (walls) {
            scene.add(walls.object);
            this.cameraObstacles.push(...walls.object.children);
            this.campusWallSegments.push(...walls.segments);
          }
          if (site.id === "quoc-hoc-school") {
            this.quocHocCampus = new QuocHocSchoolCampus(
              this,
              site,
              gate.placement,
            );
          } else if (site.id === "hai-ba-trung") {
            this.haiBaTrungCampus = new HaiBaTrungSchoolCampus(
              this,
              site,
              gate.placement,
            );
          } else if (site.id === "nguyen-chi-dieu") {
            this.nguyenChiDieuCampus = new NguyenChiDieuCampus(
              this,
              site,
              gate.placement,
            );
          } else if (site.id === "cao-thang") {
            this.caoThangCampus = new CaoThangCampus(
              this,
              site,
              gate.placement,
            );
          } else if (site.id === "quang-trung") {
            this.quangTrungCampus = new QuangTrungCampus(
              this,
              site,
              gate.placement,
            );
          }
        }
      }
      if (site.id === "vincom-hue") {
        this.vincomPlaza = new VincomPlazaHue(this, site);
      } else if (site.id === "benh-vien-rhm-hue") {
        this.benhVienRhmHue = new BenhVienRhmHue(this, site);
      } else if (site.id === "nha-tho-dong-chua-cuu-the") {
        this.dongChuaCuuTheChurch = new DongChuaCuuTheChurch(this, site);
      }
      if (
        !["bridge", "boardwalk", "school", "youth", "commercial"].includes(site.kind) &&
        site.id !== "benh-vien-rhm-hue"
      ) {
        const frontage = buildingFrontage(site.sign, this.renderRoads);
        if (frontage) {
          const post = postedBoard(site.title, site.address, 2.8);
          post.position.set(
            frontage.x,
            this.groundAt(frontage.x, frontage.z),
            frontage.z,
          );
          post.rotation.y = frontage.heading;
          scene.add(post);
        }
      }
      const isArea = site.anchor.kind === "area-label",
        sign = board(
          site.title,
          isArea ? `${site.address} · khuôn viên` : site.address,
          Boolean(this.quality?.mobile),
        );
      sign.position.set(site.sign.x, 0.23, site.sign.z);
      const closest = activeMainRoads
        .map((r) => nearestPoint(site.sign, r.points))
        .sort((a, b) => a.distance - b.distance)[0];
      if (closest) {
        sign.rotation.y = Math.atan2(
          closest.x - site.sign.x,
          closest.z - site.sign.z,
        );
      }
      if (isArea) {
        sign.children.slice(1).forEach((child) => (child.visible = false));
        sign.position.y = 6;
        this.areaLabels.push(sign);
      }
      scene.add(sign);
      if (isArea) {
        const height =
          Number.parseFloat(site.feature.tags?.height) ||
          Number(site.feature.tags?.["building:levels"] || 3) * 3.2;
        sign.position.y = Math.min(45, height) + 2;
        sign.scale.setScalar(1.7);
      }
      if (
        site.kind === "school" ||
        site.kind === "station" ||
        site.id === "truong-tien" ||
        site.id === "quoc-hoc" ||
        site.id === "vincom-hue" ||
        site.id === "benh-vien-rhm-hue" ||
        site.id === "nha-tho-dong-chua-cuu-the"
      ) {
        sign.removeFromParent();
        this.areaLabels = this.areaLabels.filter((label) => label !== sign);
      }
      const module = landmarkModules.find((m) => m.id === site.id);
      this.landmarks.set(site.id, {
        id: site.id,
        title: site.title,
        position: site.sign,
        radius: isArea ? 100 : site.id === "quoc-hoc" ? 55 : site.id === "vincom-hue" ? 68 : 48,
        description:
          site.id === "quoc-hoc" && module?.description
            ? `${site.address}. ${module.description}`
            : site.id === "nguyen-chi-dieu"
              ? `${site.address} · Ngôi trường THCS khang trang bên đường Đống Đa với hàng rào trắng, bảng HLC và sân trường rợp bóng cây xanh.`
              : site.id === "cao-thang"
                ? `${site.address} · Trường THPT Cao Thắng nằm cạnh Trường THCS Nguyễn Chí Diểu với sân trường rộng rãi và các dãy phòng học mái ngói đỏ.`
                : site.id === "vincom-hue"
                  ? `${site.address} · Tổ hợp trung tâm thương mại Vincom Plaza Huế & khách sạn Meliá Vinpearl cao 39 tầng ngay vòng xoay Ngã 6 Hùng Vương.`
                  : site.id === "quang-trung"
                    ? `${site.address} · Trường Tiểu học Quang Trung với các dãy phòng học xanh trắng, sân cờ, sân khấu lễ hội và sân thể thao rợp bóng cây.`
                    : site.id === "benh-vien-rhm-hue"
                      ? `${site.address} · Bệnh viện Răng Hàm Mặt Huế ngay trên trục đường Nguyễn Huệ.`
                      : site.id === "nha-tho-dong-chua-cuu-the"
                        ? `${site.address} · Quần thể Tu viện Dòng Chúa Cứu Thế, Vương cung Thánh đường Đức Mẹ Hằng Cứu Giúp và Tượng Chúa Giêsu dang tay tại Ngã 3 Nguyễn Huệ × Nguyễn Khuyến.`
                        : `${site.address}. ${isArea ? "Nhãn khuôn viên; chưa xác định cổng từ dữ liệu OSM." : site.anchor.kind === "mapped-entrance" ? "Cổng được OSM ghi nhận." : "Điểm địa danh OSM."} Nguồn: ${site.anchor.sourceType}/${site.anchor.sourceId}. Kiến trúc vẫn là dựng ước lượng.`,
      });
      if (module && site.id !== "truong-tien") {
        const object = module.create();
        object.position.set(site.center.x, 0.23, site.center.z);
        object.rotation.y = sign.rotation.y;
        scene.add(object);
        if (site.id === "quoc-hoc") {
          const haiBaTrungSite = activeSites.find((s) => s.id === "hai-ba-trung");
          const ubndSite = activeSites.find((s) => s.id === "ubnd");
          this.biaPark = createBiaQuocHocPark(this, site, sign.rotation.y);
          this.fireflyPark = createFireflyTreePark(this, site, sign.rotation.y, {
            haiBaTrung: haiBaTrungSite
              ? {
                  ...haiBaTrungSite,
                  sign:
                    this.schoolGates.find((g) => g.id === "hai-ba-trung") ||
                    haiBaTrungSite.sign,
                }
              : null,
          });
          this.fountainPark = createFountainPark(this, site, sign.rotation.y, {
            ubnd: ubndSite,
          });
          this.phuXuanParkWalk = createPhuXuanParkWalk(this, site, sign.rotation.y);
          this.riversideParks = [
            this.biaPark,
            this.fireflyPark,
            this.fountainPark,
            this.phuXuanParkWalk,
          ];
          this.quocHocPark = {
            groundAt: (wx, wz, referenceY) => {
              for (const park of this.riversideParks) {
                const y = park.groundAt(wx, wz, referenceY);
                if (y !== null && y !== undefined) return y;
              }
              return null;
            },
            canRide: (wx, wz) => {
              for (const park of this.riversideParks) {
                const ride = park.canRide(wx, wz);
                if (ride !== null && ride !== undefined) return ride;
              }
              return null;
            },
            blocksGrass: (wx, wz) =>
              this.riversideParks.some((park) => park.blocksGrass(wx, wz)),
            blocksTree: (wx, wz) =>
              this.riversideParks.some((park) => park.blocksTree(wx, wz)),
          };
          if (haiBaTrungSite && this.fireflyPark?.treeCenterLocal) {
            const c = this.biaPark.toWorld(
              this.fireflyPark.treeCenterLocal.lx,
              this.fireflyPark.treeCenterLocal.lz,
            );
            this.landmarks.set("firefly-park", {
              id: "firefly-park",
              title: "Công viên Cây Đom Đóm",
              position: c,
              radius: 42,
              description:
                "Đối diện cổng Trường Hai Bà Trưng · Cây đa ước nguyện với hàng trăm dải lụa đỏ và đèn đom đóm lung linh bên bờ sông Hương.",
            });
          }
          if (ubndSite && this.fountainPark?.fountainCenterLocal) {
            const f = this.biaPark.toWorld(
              this.fountainPark.fountainCenterLocal.lx,
              this.fountainPark.fountainCenterLocal.lz,
            );
            this.landmarks.set("fountain-park", {
              id: "fountain-park",
              title: "Công viên Đài Phun Nước",
              position: f,
              radius: 45,
              description:
                "Đối diện UBND Thành phố Huế · Quảng trường đài phun nước trung tâm, thảm hoa cúc vàng và hàng cọ ven sông Hương.",
            });
          }
          if (this.phuXuanParkWalk?.circleCenterLocal) {
            const pw = this.biaPark.toWorld(
              this.phuXuanParkWalk.circleCenterLocal.lx,
              this.phuXuanParkWalk.circleCenterLocal.lz,
            );
            this.landmarks.set("phu-xuan-park-walk", {
              id: "phu-xuan-park-walk",
              title: "Vườn hoa & Đường dạo Cầu Phú Xuân",
              position: pw,
              radius: 42,
              description:
                "Hệ thống đường đi bộ nhỏ nối liền từ Công viên Đài Phun Nước qua các thảm cỏ xanh mướt tới chân Cầu Phú Xuân và Cầu Gỗ Lim.",
            });
          }
          this.cameraObstacles.push(object);
        }
      }
    }
    if (this.region?.id === "quang-trung") {
      this.quangTrungEastPrecinct = new QuangTrungEastPrecinct(this);
    }
    if (this.region?.id === "nguyen-chi-dieu") {
      this.dongDaCorridor = new DongDaCorridor(this);
    }
    this.allGateClearances = [
      ...(this.schoolGates || []).map((g) => ({ x: g.x, z: g.z, radius: 14.5 })),
    ];
    if (this.benhVienRhmHue?.entrance) {
      this.allGateClearances.push({
        x: this.benhVienRhmHue.entrance.x,
        z: this.benhVienRhmHue.entrance.z,
        radius: 15.0,
      });
    }
    if (this.quangTrungCampus) {
      this.allGateClearances.push(
        { ...this.quangTrungCampus.toWorld(37.2, 58.5), radius: 14.5 },
        { ...this.quangTrungCampus.toWorld(50.25, 1.5), radius: 14.5 },
        { ...this.quangTrungCampus.toWorld(39.0, 58.5), radius: 14.5 },
      );
    }
    if (this.quangTrungEastPrecinct) {
      this.allGateClearances.push({
        ...this.quangTrungEastPrecinct.toWorld(85.5, 1.0),
        radius: 14.5,
      });
    }
    if (this.dongDaCorridor) {
      this.allGateClearances.push(
        { ...dongDaToWorld(126.0, 11.4), radius: 14.5 },
        { ...dongDaToWorld(197.0, 11.4), radius: 14.5 },
        { ...dongDaToWorld(35.0, -22.0), radius: 15.0 },
      );
    }
    if (this.dongChuaCuuTheChurch?.secondaryGates) {
      for (const g of this.dongChuaCuuTheChurch.secondaryGates) {
        this.allGateClearances.push({ x: g.x, z: g.z, radius: 16.0 });
      }
    }
    for (const crossing of activeCorridorCrossings) {
      const road = activeRoads.find((r) => r.id === crossing.mainId);
      if (!road) continue;
      const hit = nearestPoint(crossing.point, road.points),
        a = road.points[hit.index - 1],
        b = road.points[hit.index];
      for (const direction of [1, -1]) {
        const length = Math.hypot(b.x - a.x, b.z - a.z),
          dx = (b.x - a.x) / length,
          dz = (b.z - a.z) / length,
          offset = roadWidth(road) / 2 + 3,
          sign = postedBoard(`${road.tags?.name || "Lê Lợi"} × ${crossing.name}`, "Giao lộ", 3.6);
        sign.position.set(
          crossing.point.x - dx * 18 * direction - dz * offset * direction,
          0.32,
          crossing.point.z - dz * 18 * direction + dx * offset * direction,
        );
        sign.rotation.y = Math.atan2(-dx * direction, -dz * direction);
        scene.add(sign);
      }
    }
    this.trafficSignalPositions = [];
    for (const source of activeMappedSignals)
      for (const signal of placeTrafficSignal(source, this.renderRoads)) {
        if (
          this.trafficSignalPositions.some(
            (p) => Math.hypot(p.x - signal.x, p.z - signal.z) < 3,
          )
        )
          continue;
        const group = new THREE.Group();
        group.add(
          box([0.15, 4, 0.15], "#3d4943", [0, 2, 0]),
          box([0.5, 1.35, 0.35], "#26302b", [0, 4.2, 0]),
        );
        for (let i = 0; i < 3; i++) {
          const light = new THREE.Mesh(
            new THREE.CircleGeometry(0.12, 12),
            new THREE.MeshBasicMaterial({
              color: ["#be4f43", "#d9b255", "#5ca16a"][i],
            }),
          );
          light.position.set(0, 4.6 - i * 0.4, 0.19);
          group.add(light);
        }
        group.position.set(
          signal.x,
          this.groundAt(signal.x, signal.z),
          signal.z,
        );
        group.rotation.y = signal.heading + Math.PI;
        scene.add(group);
        this.trafficSignalPositions.push(signal);
      }
    // Decorative trees on avenue sides; individual tree GPS is not surveyed.
    for (const road of activeMainRoads.filter((r) =>
      ["Lê Lợi", "Đống Đa", "Nguyễn Huệ"].includes(r.tags.name),
    ))
      for (let i = 1; i < road.points.length; i++) {
        let a = road.points[i - 1],
          b = road.points[i];
        if (a.x > b.x) [a, b] = [b, a];
        const dx = b.x - a.x,
          dz = b.z - a.z,
          length = Math.hypot(dx, dz);
        for (let d = 12; d < length; d += 28) {
          const offset = roadWidth(road) / 2 + 10,
            p = {
              x: a.x + (dx * d) / length + (dz / length) * offset,
              z: a.z + (dz * d) / length - (dx / length) * offset,
            };
          if (this.isTreePositionSafe(p)) this.treePositions.push(p);
        }
      }
    // Decorative greenery follows mapped public paths; individual tree GPS is not surveyed.
    for (const road of this.renderRoads.filter(
      (r) => r.tags.highway === "footway",
    ))
      for (let i = 1; i < road.points.length; i++) {
        const a = road.points[i - 1],
          b = road.points[i],
          length = Math.hypot(a.x - b.x, a.z - b.z);
        for (let d = 8; d < length; d += 25) {
          for (const side of [-1, 1]) {
            const p = roadsidePoint(a, b, d, 3.0, side);
            if (this.isTreePositionSafe(p)) {
              this.treePositions.push(p);
              break;
            }
          }
        }
      }
    const filterCampusTrees = () => {
      this.treePositions = this.treePositions.filter((p) =>
        this.isTreePositionSafe(p),
      );
    };
    filterCampusTrees();
    this.treePositions = this.treePositions.slice(0, 95);
    this.projectPoint = project;
    this.riverRings = activeRiver;
    addStreetDetails(this, activeFeatures);
    if (
      this.truongTienRoad ||
      getById(239566031) ||
      getById(39421601)
    ) {
      this.truongTienSurroundings = new TruongTienSurroundings(
        this,
        activeFeatures,
      );
    }
    filterCampusTrees();
    const boardwalkView = addLimWoodBoardwalk(this, activeRoads);
    const lateralJunctions = boardwalkView?.lateralJunctions || [];
    this.boardwalkRails = [];
    for (const road of this.renderRoads.filter((r) =>
      activeBoardwalkWayIds.includes(r.id),
    )) {
      const segments = railSegments(road, roadWidth(road), (i) =>
        this.roadHeight(road, i),
      ).filter(({ a, b }) => {
        const mx = (a.x + b.x) / 2;
        const mz = (a.z + b.z) / 2;
        return lateralJunctions.every(
          (j) => Math.hypot(mx - j.x, mz - j.z) >= 2.1,
        );
      });
      this.boardwalkRails.push(...segments);
    }
    if (boardwalkView) {
      const extRoad = {
        points: [
          { x: 1082.6392924302818, z: -1099.6975024450662 },
          ...BOARDWALK_EXTENSION_POINTS,
        ],
      };
      const extSegments = railSegments(extRoad, 4.2, () => BOARDWALK_Y).filter(
        ({ a, b }) => {
          const mx = (a.x + b.x) / 2;
          const mz = (a.z + b.z) / 2;
          return lateralJunctions.every(
            (j) => Math.hypot(mx - j.x, mz - j.z) >= 2.1,
          );
        },
      );
      this.boardwalkRails.push(...extSegments);
    }
    this.youthPlayground = getById(695775607) ? new YouthPlayground(this) : null;
    this.propertyEnclosures = new PropertyEnclosures(this);
    this.station = getById(175063593) ? new HueStation(this) : null;
    this.campusWallGrid = campusWallIndex(this.campusWallSegments);
    this.buildTreeGrid();
    this.grass = new LivingGrass(this);
    this.pedestrianLife = new PedestrianLife(this);
    scene.add(new THREE.HemisphereLight("#d9edff", "#5c8a45", 2));
    this.sun = new THREE.DirectionalLight(
      this.region?.id === "truong-tien" ? "#ffebd0" : "#fff1d5",
      this.region?.id === "truong-tien" ? 3.2 : 3,
    );
    this.sun.castShadow = Boolean(this.quality?.shadows);
    this.sun.shadow.mapSize.set(2048, 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -110,
      right: 110,
      top: 110,
      bottom: -110,
      near: 1,
      far: 400,
    });
    this.sun.shadow.normalBias = 0.04;
    scene.add(this.sun, this.sun.target);
  }
  roadHeight(road, index) {
    if (LATERAL_BRIDGE_IDS.includes(road.id) && this.boardwalkMainPoints?.length) {
      return lateralBridgeHeight(road, index, this.boardwalkMainPoints);
    }
    return roadSurfaceHeight(road, index);
  }
  nearestRoad(x, z) {
    let result = { distance: Infinity };
    for (const segment of this.roadGrid.get(
      `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
    ) || []) {
      const hit = nearestPoint({ x, z }, [segment.a, segment.b]);
      if (hit.distance < result.distance)
        result = { ...hit, index: segment.index, road: segment.road };
    }
    return result;
  }
  groundAt(x, z, referenceY) {
    const campusY =
      this.quocHocCampus?.groundAt(x, z, referenceY) ??
      this.haiBaTrungCampus?.groundAt(x, z, referenceY) ??
      this.nguyenChiDieuCampus?.groundAt(x, z, referenceY) ??
      this.caoThangCampus?.groundAt(x, z, referenceY) ??
      this.vincomPlaza?.groundAt(x, z, referenceY) ??
      this.quangTrungCampus?.groundAt(x, z, referenceY) ??
      this.quangTrungEastPrecinct?.groundAt(x, z, referenceY) ??
      this.benhVienRhmHue?.groundAt(x, z, referenceY) ??
      this.dongChuaCuuTheChurch?.groundAt(x, z, referenceY) ??
      this.dongDaCorridor?.groundAt(x, z, referenceY);
    if (campusY !== null && campusY !== undefined) return campusY;
    if (Number.isFinite(referenceY) && referenceY < 2.2) {
      const lowBwY = this.boardwalkView?.groundAt?.(x, z, referenceY);
      if (lowBwY !== null && lowBwY !== undefined) return lowBwY;
      const lowSurrY = this.truongTienSurroundings?.groundAt?.(x, z, referenceY);
      if (lowSurrY !== null && lowSurrY !== undefined) return lowSurrY;
    }
    if (this.truongTienRoad) {
      const q = truongTienDeckQuery(this.truongTienRoad, x, z);
      if (
        q.onBridge &&
        (q.allowed || !Number.isFinite(referenceY)) &&
        (!Number.isFinite(referenceY) ||
          referenceY >= 0.28 ||
          q.deckY < 1.85 ||
          Math.abs(q.deckY - referenceY) < 1.8)
      ) {
        return q.deckY;
      }
    }
    const boardwalkY = this.boardwalkView?.groundAt?.(x, z, referenceY);
    if (boardwalkY !== null && boardwalkY !== undefined) return boardwalkY;
    const surrY = this.truongTienSurroundings?.groundAt?.(x, z, referenceY);
    if (surrY !== null && surrY !== undefined) return surrY;
    const parkY = this.quocHocPark?.groundAt(x, z, referenceY);
    if (
      parkY !== null &&
      parkY !== undefined &&
      (!Number.isFinite(referenceY) || referenceY < 1.8)
    ) {
      return parkY;
    }
    const candidates = [];
    for (const segment of this.roadGrid.get(
      `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
    ) || []) {
      if (
        segment.road.id === TRUONG_TIEN_ID ||
        TRUONG_TIEN_SIDEWALK_IDS.has(segment.road.id)
      ) {
        continue;
      }
      if (
        this.boardwalkView &&
        (!Number.isFinite(referenceY) || referenceY < 2.2) &&
        ([683633953, 1167513733, 1167513732].includes(segment.road.id) ||
          LATERAL_BRIDGE_IDS.includes(segment.road.id))
      ) {
        continue;
      }
      const hit = nearestPoint({ x, z }, [segment.a, segment.b]);
      if (hit.distance > roadWidth(segment.road) / 2 + 0.6) continue;
      const y =
        this.roadHeight(segment.road, segment.index - 1) * (1 - hit.t) +
        this.roadHeight(segment.road, segment.index) * hit.t;
      candidates.push({ y, distance: hit.distance });
    }
    if (!candidates.length) return 0.23;
    candidates.sort((a, b) =>
      Number.isFinite(referenceY)
        ? Math.abs(a.y - referenceY) - Math.abs(b.y - referenceY) ||
          a.distance - b.distance
        : a.y - b.y || a.distance - b.distance,
    );
    return candidates[0].y;
  }
  isTreePositionSafe(p, roadMargin = 2.6, footwayMargin = 0.8) {
    if (
      p.x < this.bounds.minX ||
      p.x > this.bounds.maxX ||
      p.z < this.bounds.minZ ||
      p.z > this.bounds.maxZ
    )
      return false;
    if (this.riverRings?.some((r) => inside(p, r))) return false;
    if (
      this.buildingPolygons.some(
        (b) =>
          p.x >= b.minX &&
          p.x <= b.maxX &&
          p.z >= b.minZ &&
          p.z <= b.maxZ &&
          inside(p, b.points),
      )
    )
      return false;
    if (this.schoolGates?.some((g) => Math.hypot(p.x - g.x, p.z - g.z) < 14.5))
      return false;
    if (
      this.allGateClearances?.some(
        (g) => Math.hypot(p.x - g.x, p.z - g.z) < (g.radius || 14.5),
      )
    )
      return false;
    if (
      this.benhVienRhmHue?.entrance &&
      Math.hypot(p.x - this.benhVienRhmHue.entrance.x, p.z - this.benhVienRhmHue.entrance.z) < 14.5
    )
      return false;
    if (
      this.quocHocPark?.blocksTree(p.x, p.z) ||
      this.quocHocCampus?.blocksTree(p.x, p.z) ||
      this.haiBaTrungCampus?.blocksTree(p.x, p.z) ||
      this.nguyenChiDieuCampus?.blocksTree(p.x, p.z) ||
      this.caoThangCampus?.blocksTree(p.x, p.z) ||
      this.vincomPlaza?.blocksTree(p.x, p.z) ||
      this.quangTrungCampus?.blocksTree(p.x, p.z) ||
      this.quangTrungEastPrecinct?.blocksTree(p.x, p.z) ||
      this.benhVienRhmHue?.blocksTree(p.x, p.z) ||
      this.dongChuaCuuTheChurch?.blocksTree(p.x, p.z) ||
      this.truongTienSurroundings?.blocksTree(p.x, p.z) ||
      this.dongDaCorridor?.blocksTree(p.x, p.z)
    )
      return false;
    const gx = Math.floor(p.x / 64);
    const gz = Math.floor(p.z / 64);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oz = -1; oz <= 1; oz++) {
        for (const seg of this.roadGrid.get(`${gx + ox},${gz + oz}`) || []) {
          const hit = nearestPoint(p, [seg.a, seg.b]);
          const clearance =
            roadWidth(seg.road) / 2 +
            (isFootway(seg.road) ? footwayMargin : roadMargin);
          if (hit.distance < clearance) return false;
        }
      }
    }
    return true;
  }
  buildTreeGrid() {
    this.treeGrid = new Map();
    for (const p of this.treePositions) {
      const x0 = Math.floor((p.x - 1) / 32);
      const x1 = Math.floor((p.x + 1) / 32);
      const z0 = Math.floor((p.z - 1) / 32);
      const z1 = Math.floor((p.z + 1) / 32);
      for (let gx = x0; gx <= x1; gx++) {
        for (let gz = z0; gz <= z1; gz++) {
          const key = `${gx},${gz}`;
          if (!this.treeGrid.has(key)) this.treeGrid.set(key, []);
          this.treeGrid.get(key).push(p);
        }
      }
    }
  }
  hitsTree(x, z, referenceY) {
    if (Number.isFinite(referenceY) && referenceY >= 2.2) return false;
    const list = this.treeGrid
      ? this.treeGrid.get(`${Math.floor(x / 32)},${Math.floor(z / 32)}`)
      : this.treePositions;
    if (!list?.length) return false;
    return list.some((p) => (x - p.x) ** 2 + (z - p.z) ** 2 < 0.75 ** 2);
  }
  campusStudents() {
    return [
      this.quocHocCampus,
      this.haiBaTrungCampus,
      this.nguyenChiDieuCampus,
      this.caoThangCampus,
      this.quangTrungCampus,
      this.dongDaCorridor?.uniStudents
        ? { students: this.dongDaCorridor.uniStudents }
        : null,
    ].flatMap((campus) => campus?.students?.students || []);
  }
  getVendorPoints() {
    return [
      ...(this.quangTrungCampus?.vendorPoints || []),
      ...(this.boardwalkView?.vendorPoints || []),
      ...(this.truongTienSurroundings?.vendorPoints || []),
    ];
  }
  nearCampusWalls(x, z) {
    return this.campusWallGrid
      ? nearbyWalls(this.campusWallGrid, x, z)
      : this.campusWallSegments || [];
  }
  canRide(x, z, referenceY) {
    if (this.station?.blocks(x, z)) return false;
    if (!regionContains(this.region, x, z)) return false;
    if (
      x < this.bounds.minX ||
      x > this.bounds.maxX ||
      z < this.bounds.minZ ||
      z > this.bounds.maxZ
    )
      return false;
    if (hitsCampusWall({ x, z }, this.nearCampusWalls(x, z))) return false;
    if (
      hitsRail(
        { x, z, y: this.groundAt(x, z, referenceY) },
        this.boardwalkRails || [],
      )
    )
      return false;
    const vincomRide = this.vincomPlaza?.canRide(x, z);
    if (vincomRide === false) return false;
    const hospRide = this.benhVienRhmHue?.canRide(x, z);
    if (hospRide === false) return false;
    const churchRide = this.dongChuaCuuTheChurch?.canRide(x, z);
    if (churchRide === false) return false;
    const eastRide = this.quangTrungEastPrecinct?.canRide(x, z);
    if (eastRide === false) return false;
    const surrRide = this.truongTienSurroundings?.canRide(x, z, referenceY);
    if (surrRide === false) return false;
    const ddRide = this.dongDaCorridor?.canRide(x, z, referenceY);
    if (ddRide === false) return false;
    const activeRiver = this.riverRings || getRiver();
    const inRiver = activeRiver.some((r) => inside({ x, z }, r));
    if (this.boardwalkView && (!Number.isFinite(referenceY) || referenceY < 2.2)) {
      const bw = this.boardwalkView.queryDeck(x, z);
      if (bw.onBoardwalk) {
        if (bw.insideDeck && !this.hitsTree(x, z, referenceY)) return true;
        if (inRiver) return false;
      }
    }
    if (surrRide === true && !this.hitsTree(x, z, referenceY)) return true;
    const parkRide =
      Number.isFinite(referenceY) && referenceY >= 1.8
        ? null
        : this.quocHocPark?.canRide(x, z);
    if (parkRide !== null && parkRide !== undefined) return parkRide;
    const campusRide =
      this.quocHocCampus?.canRide(x, z) ??
      this.haiBaTrungCampus?.canRide(x, z) ??
      this.nguyenChiDieuCampus?.canRide(x, z) ??
      this.caoThangCampus?.canRide(x, z) ??
      this.quangTrungCampus?.canRide(x, z);
    if (campusRide === false) return false;
    if (this.hitsTree(x, z, referenceY)) return false;
    if (eastRide === true) return true;
    if (ddRide === true) return true;
    if (campusRide === true) {
      const blockedByBuilding = this.buildingPolygons.some(
        (b) =>
          x > b.minX &&
          x < b.maxX &&
          z > b.minZ &&
          z < b.maxZ &&
          inside({ x, z }, b.points),
      );
      if (!blockedByBuilding) return true;
    }
    if (this.truongTienRoad) {
      const q = truongTienDeckQuery(this.truongTienRoad, x, z);
      if (
        q.onBridge &&
        (!Number.isFinite(referenceY) ||
          referenceY >= 0.28 ||
          q.deckY < 1.85 ||
          Math.abs(q.deckY - referenceY) < 1.8)
      ) {
        if (q.allowed) return true;
        if (inRiver) return false;
      }
    }
    const hit = this.nearestRoad(x, z);
    if (inRiver) {
      if (
        hit.road &&
        (hit.road.tags?.bridge === "yes" ||
          hit.road.tags?.name === "Cầu Phú Xuân") &&
        hit.distance <= roadWidth(hit.road) / 2 + 0.4
      ) {
        return true;
      }
      return false;
    }
    if (hit.road && hit.distance < roadWidth(hit.road) / 2 + 1.2) return true;
    return !this.buildingPolygons.some(
      (b) =>
        x > b.minX &&
        x < b.maxX &&
        z > b.minZ &&
        z < b.maxZ &&
        inside({ x, z }, b.points),
    );
  }
  canPlaceCharm(x, z) {
    if (!regionContains(this.region, x, z)) return false;
    if (
      x < this.bounds.minX ||
      x > this.bounds.maxX ||
      z < this.bounds.minZ ||
      z > this.bounds.maxZ
    ) {
      return false;
    }
    const y = this.groundAt(x, z);
    if (!this.canRide(x, z, y)) return false;

    if (this.truongTienRoad) {
      const q = truongTienDeckQuery(this.truongTienRoad, x, z);
      if (q.onBridge) {
        if (!q.allowed) return false;
        const absLat = Math.abs(q.lat);
        const onRoadway = absLat <= TRUONG_TIEN_ROAD_HALF - 0.65;
        const onWalkway =
          absLat >= TRUONG_TIEN_WALK_INNER + 0.25 &&
          absLat <= TRUONG_TIEN_WALK_OUTER - 0.45;
        return onRoadway || onWalkway;
      }
    }

    if (this.boardwalkView) {
      const bw = this.boardwalkView.queryDeck(x, z);
      if (bw.onBoardwalk) {
        return Boolean(bw.insideSafeMargin);
      }
    }

    const activeRiver = this.riverRings || getRiver();
    const inRiver = activeRiver.some((r) => inside({ x, z }, r));
    const hit = this.nearestRoad(x, z);
    if (inRiver) {
      return Boolean(
        hit.road &&
          (hit.road.tags?.name === "Cầu Phú Xuân" ||
            hit.road.tags?.bridge === "yes") &&
          hit.distance <= Math.max(0.5, roadWidth(hit.road) / 2 - 0.6),
      );
    }

    return Boolean(
      hit.road &&
        hit.distance <= Math.max(0.45, roadWidth(hit.road) / 2 - 0.45),
    );
  }
  update(time, position) {
    if (this.waterMaterial) this.waterMaterial.userData.time.value = time;
    this.truongTienBridge?.update?.(time);
    this.fireflyPark?.update?.(time);
    this.fountainPark?.update?.(time);
    this.youthPlayground?.update(time);
    this.propertyEnclosures?.update(time);
    this.quocHocCampus?.update(time, position);
    this.haiBaTrungCampus?.update(time, position);
    this.nguyenChiDieuCampus?.update(time, position);
    this.caoThangCampus?.update(time, position);
    this.quangTrungCampus?.update(time, position);
    this.quangTrungEastPrecinct?.update(time, position);
    this.boardwalkView?.update?.(time);
    this.truongTienSurroundings?.update?.(time);
    this.dongDaCorridor?.update?.(time, position);
    if (position) {
      this.grass?.update(position);
      this.pedestrianLife?.update(time, position);
    }
    if (position && this.sun) {
      this.sun.position.set(position.x - 70, 160, position.z + 70);
      this.sun.target.position.set(position.x, 0, position.z);
      for (const label of [
        ...this.areaLabels,
        ...(this.buildingLabels || []),
      ]) {
        label.visible = label.position.distanceTo(position) < 110;
        label.rotation.y = Math.atan2(
          position.x - label.position.x,
          position.z - label.position.z,
        );
      }
    }
  }
  async loadDetailedTrees() {
    const gltf = await new GLTFLoader().loadAsync(
        new URL("../../assets/models/trees_v4.glb", import.meta.url).href,
      ),
      template = gltf.scene.getObjectByName("Tree_CoastLiveOak_V4"),
      bounds = new THREE.Box3().setFromObject(template),
      height = bounds.max.y - bounds.min.y;
    for (const [i, p] of this.treePositions.entries()) {
      if (i % 7 === 0) continue;
      const tree = template.clone(true),
        scale = (i % 5 === 0 ? 3 : 6 + (i % 6)) / height;
      tree.scale.setScalar(scale);
      tree.position.set(p.x, -bounds.min.y * scale, p.z);
      tree.rotation.y = i * 2.4;
      tree.traverse((o) => {
        if (o.isMesh) o.castShadow = true;
      });
      this.scene.add(tree);
      const shrubPos = { x: p.x + 1.6, z: p.z + 1.5 };
      if (
        i % 3 === 0 &&
        (!this.isTreePositionSafe || this.isTreePositionSafe(shrubPos, 2.5, 0.8))
      ) {
        const shrub = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 10, 7),
          mat(i % 2 ? "#527f46" : "#8d9d53"),
        );
        shrub.scale.set(1, 0.65, 1);
        shrub.position.set(shrubPos.x, 0.65, shrubPos.z);
        this.scene.add(shrub);
      }
    }
  }
  drawMap(ctx, bike, districts, selected, actors, options = {}) {
    if (bike?.position) {
      appendTrailPoint(this.trail, bike.position.x, bike.position.z);
    }
    renderAreaMap(ctx, {
      regionId: this.region?.id,
      bounds: this.bounds,
      riverRings: this.riverRings || getRiver(),
      roads: this.renderRoads || getRoads(),
      mainRoads: getMainRoads(),
      district: districts.find((d) => d.id === selected),
      landmarks: this.landmarks,
      bike,
      trail: this.trail,
      remotePlayers: options.remotePlayers || [],
      charms: options.charms || [],
      staticCache: this.staticMapCache,
    });
  }
}
