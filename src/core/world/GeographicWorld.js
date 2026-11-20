import * as THREE from "three";
import { addTruongTienBridge } from "../../modules/areas/truong-tien/view/BridgeView.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { SharedModelLoader as GLTFLoader } from "../shared/resources/sceneResources.js";
import {
  features,
  roads,
  mainRoads,
  river,
  sites,
  pointsOf,
  ringsOf,
  centroid,
  intersection,
  boardwalkWayIds,
  mappedSignals,
} from "../shared/geography/map.js";
import { inside, nearestPoint, project } from "../shared/geography/geometry.js";
import { appendTrailPoint, renderAreaMap } from "./minimap.js";
import { addStreetDetails } from "./StreetDetails.js";
import { roadWidth } from "./roadProfile.js";
import { roadSurfaceHeight } from "./roadSurface.js";
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
import { regionContains, byId } from "../../modules/areas/AreaModel.js";
import { loadSharedModel } from "../shared/resources/sceneResources.js";
export { roadWidth } from "./roadProfile.js";
import { landmarkModules } from "../shared/architecture/registry.js";
import { surfaceTexture } from "./surfaceTextures.js";
import { box, mat } from "../shared/architecture/shared.js";
import { beam } from "../shared/architecture/architecture.js";
import { corridorCrossings } from "../shared/geography/map.js";
import {
  corridorStyles,
  siteForBuilding,
  decorateCorridorBuilding,
} from "../shared/architecture/CorridorArchitecture.js";

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
function board(title, subtitle, mobile = false) {
  const canvas = document.createElement("canvas");
  canvas.width = mobile ? 512 : 1024;
  canvas.height = mobile ? 128 : 256;
  const ctx = canvas.getContext("2d");
  if (mobile) ctx.scale(0.5, 0.5);
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
  if (mobile) {
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
  }
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
    this.venues = features
      .filter(
        (f) =>
          f.type === "node" && ["restaurant", "cafe"].includes(f.tags?.amenity),
      )
      .map((f) => ({
        id: `osm-${f.id}`,
        title: f.tags.name || "Quán ăn",
        ...centroid(f),
      }));
    this.roadSegments = [];
    this.roadGrid = new Map();
    this.trail = [];
    this.staticMapCache = {};
    this.bounds = { minX: -350, maxX: 1700, minZ: -1900, maxZ: 200 };
  }
  build() {
    this.trail = [];
    this.staticMapCache = {};
    if (this.region) this.bounds = { ...this.region.bounds };
    this.loadedFeatureCount = features.length;
    const scene = this.scene;
    scene.background = new THREE.Color("#b8d2dd");
    scene.fog = new THREE.Fog("#b8d2dd", 450, 1800);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6500, 6500),
      mat("#79916a"),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);
    const waterMaterial = riverMaterial();
    this.waterMaterial = waterMaterial;
    for (const ring of river) {
      const water = new THREE.Mesh(polygonGeometry(ring), waterMaterial);
      water.position.y = 0.02;
      scene.add(water);
    }
    for (const feature of features.filter(
      (f) =>
        f.type === "way" &&
        f.geometry?.length > 3 &&
        (f.tags?.leisure === "park" || f.tags?.landuse === "grass"),
    )) {
      const mesh = new THREE.Mesh(
        polygonGeometry(pointsOf(feature)),
        mat("#70935c"),
      );
      mesh.position.y = 0.05;
      scene.add(mesh);
    }
    this.renderRoads = roads.filter((r) =>
      r.points.some(
        (p) =>
          p.x >= this.bounds.minX &&
          p.x <= this.bounds.maxX &&
          p.z >= this.bounds.minZ &&
          p.z <= this.bounds.maxZ,
      ),
    );
    const paved = [],
      walkways = [],
      wooden = [],
      sidewalks = [];
    for (const road of this.renderRoads) {
      const width = roadWidth(road),
        foot = ["footway", "path", "pedestrian"].includes(road.tags.highway);
      const height = (i) => this.roadHeight(road, i);
      (boardwalkWayIds.includes(road.id)
        ? wooden
        : foot
          ? walkways
          : paved
      ).push(ribbon(road.points, width, height));
      if (!foot && !road.tags.bridge)
        sidewalks.push(ribbon(road.points, width + 4, 0.16));
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
    addMerged(wooden, "#947052");
    addTruongTienBridge(
      this,
      roads.find((r) => r.id === 174759688),
    );
    const buildingGroups = [[], [], []],
      roofGroups = [];
    let rendered = 0;
    for (const feature of features.filter(
      (f) => f.type === "way" && f.tags?.building && f.geometry?.length > 3,
    )) {
      const points = pointsOf(feature),
        center = centroid(feature);
      if (
        center.x < this.bounds.minX ||
        center.x > this.bounds.maxX ||
        center.z < this.bounds.minZ ||
        center.z > this.bounds.maxZ
      )
        continue;
      if (!mainRoads.some((r) => nearestPoint(center, r.points).distance < 135))
        continue;
      if (
        sites.some(
          (s) =>
            ["ngo-mon", "ky-dai"].includes(s.id) &&
            Math.hypot(s.center.x - center.x, s.center.z - center.z) < 30,
        )
      )
        continue;
      const height =
        Number.parseFloat(feature.tags.height) ||
        Number(feature.tags["building:levels"] || 2) * 3.2;
      const institution = siteForBuilding(feature, points, sites, ringsOf);
      if (institution) {
        const style = corridorStyles[institution.id],
          body = new THREE.Mesh(
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
            mainRoads.filter((r) => r.tags.name === "Lê Lợi"),
          ),
        );
        this.buildingPolygons.push({
          points,
          minX: Math.min(...points.map((p) => p.x)),
          maxX: Math.max(...points.map((p) => p.x)),
          minZ: Math.min(...points.map((p) => p.z)),
          maxZ: Math.max(...points.map((p) => p.z)),
        });
        this.cameraObstacles.push(body);
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
    for (const site of sites) {
      if (site.kind === "school") {
        const gate = createSchoolGate(site);
        if (gate) {
          gate.object.position.set(gate.placement.x, 0.17, gate.placement.z);
          gate.object.rotation.y = gate.placement.heading;
          scene.add(gate.object);
          this.schoolGates.push({ id: site.id, ...gate.placement });
          const walls = createCampusWalls(site, gate.placement);
          if (walls) {
            scene.add(walls.object);
            this.cameraObstacles.push(...walls.object.children);
            this.campusWallSegments.push(...walls.segments);
          }
        }
      }
      if (!["bridge", "boardwalk", "school", "youth"].includes(site.kind)) {
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
      const closest = mainRoads
        .map((r) => nearestPoint(site.sign, r.points))
        .sort((a, b) => a.distance - b.distance)[0];
      sign.rotation.y = Math.atan2(
        closest.x - site.sign.x,
        closest.z - site.sign.z,
      );
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
      if (site.kind === "school" || site.kind === "station") {
        sign.removeFromParent();
        this.areaLabels = this.areaLabels.filter((label) => label !== sign);
      }
      this.landmarks.set(site.id, {
        id: site.id,
        title: site.title,
        position: site.sign,
        radius: isArea ? 100 : 45,
        description: `${site.address}. ${isArea ? "Nhãn khuôn viên; chưa xác định cổng từ dữ liệu OSM." : site.anchor.kind === "mapped-entrance" ? "Cổng được OSM ghi nhận." : "Điểm địa danh OSM."} Nguồn: ${site.anchor.sourceType}/${site.anchor.sourceId}. Kiến trúc vẫn là dựng ước lượng.`,
      });
      const module = landmarkModules.find((m) => m.id === site.id);
      if (module && site.id !== "truong-tien") {
        const object = module.create();
        object.position.set(site.center.x, 0.23, site.center.z);
        object.rotation.y = sign.rotation.y;
        scene.add(object);
      }
    }
    for (const crossing of corridorCrossings) {
      const road = roads.find((r) => r.id === crossing.mainId),
        hit = nearestPoint(crossing.point, road.points),
        a = road.points[hit.index - 1],
        b = road.points[hit.index];
      for (const direction of [1, -1]) {
        const length = Math.hypot(b.x - a.x, b.z - a.z),
          dx = (b.x - a.x) / length,
          dz = (b.z - a.z) / length,
          offset = roadWidth(road) / 2 + 3,
          sign = postedBoard(`Lê Lợi × ${crossing.name}`, "Giao lộ", 3.6);
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
    for (const source of mappedSignals)
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
    // Decorative trees on the river side of Le Loi; individual tree GPS is not surveyed.
    for (const road of mainRoads.filter((r) => r.tags.name === "Lê Lợi"))
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
          if (
            !river.some((r) => inside(p, r)) &&
            !this.buildingPolygons.some((poly) => inside(p, poly.points))
          )
            this.treePositions.push(p);
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
          const p = {
            x: a.x + ((b.x - a.x) * d) / length + 4,
            z: a.z + ((b.z - a.z) * d) / length,
          };
          if (
            !river.some((r) => inside(p, r)) &&
            p.x >= 0 &&
            p.x < 1450 &&
            p.z < 0 &&
            p.z > -1700
          )
            this.treePositions.push(p);
        }
      }
    this.treePositions = this.treePositions.slice(0, 95);
    this.projectPoint = project;
    this.riverRings = river;
    addStreetDetails(this, features);
    this.boardwalkRails = [];
    for (const road of this.renderRoads.filter((r) =>
      boardwalkWayIds.includes(r.id),
    )) {
      const segments = railSegments(road, roadWidth(road), (i) =>
        this.roadHeight(road, i),
      );
      this.boardwalkRails.push(...segments);
      for (const { a, b } of segments) {
        for (const y of [0.55, 1.15])
          scene.add(
            beam([a.x, a.y + y, a.z], [b.x, b.y + y, b.z], 0.075, "#785638"),
          );
        const length = Math.hypot(b.x - a.x, b.z - a.z);
        for (let d = 0; d < length; d += 2) {
          const t = d / length,
            x = a.x + (b.x - a.x) * t,
            z = a.z + (b.z - a.z) * t,
            y = a.y + (b.y - a.y) * t;
          scene.add(box([0.12, 1.25, 0.12], "#735335", [x, y + 0.625, z]));
        }
      }
    }
    this.youthPlayground = byId(695775607) ? new YouthPlayground(this) : null;
    this.propertyEnclosures = new PropertyEnclosures(this);
    this.station = byId(175063593) ? new HueStation(this) : null;
    this.campusWallGrid = campusWallIndex(this.campusWallSegments);
    this.grass = new LivingGrass(this);
    this.pedestrianLife = new PedestrianLife(this);
    scene.add(new THREE.HemisphereLight("#d9edff", "#687348", 2));
    this.sun = new THREE.DirectionalLight("#fff1d5", 3);
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
    const candidates = [];
    for (const segment of this.roadGrid.get(
      `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
    ) || []) {
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
  nearCampusWalls(x, z) {
    return this.campusWallGrid
      ? nearbyWalls(this.campusWallGrid, x, z)
      : this.campusWallSegments || [];
  }
  canRide(x, z) {
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
    if (hitsRail({ x, z, y: this.groundAt(x, z) }, this.boardwalkRails || []))
      return false;
    const hit = this.nearestRoad(x, z);
    if (hit.road && hit.distance < roadWidth(hit.road) / 2 + 1.2) return true;
    if (river.some((r) => inside({ x, z }, r))) return false;
    return !this.buildingPolygons.some(
      (b) =>
        x > b.minX &&
        x < b.maxX &&
        z > b.minZ &&
        z < b.maxZ &&
        inside({ x, z }, b.points),
    );
  }
  update(time, position) {
    if (this.waterMaterial) this.waterMaterial.userData.time.value = time;
    this.youthPlayground?.update(time);
    this.propertyEnclosures?.update(time);
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
      const tree = template.clone(true),
        scale = (i % 5 === 0 ? 3 : 6 + (i % 6)) / height;
      tree.scale.setScalar(scale);
      tree.position.set(p.x, -bounds.min.y * scale, p.z);
      tree.rotation.y = i * 2.4;
      tree.traverse((o) => {
        if (o.isMesh) o.castShadow = true;
      });
      this.scene.add(tree);
      if (i % 3 === 0) {
        const shrub = new THREE.Mesh(
          new THREE.SphereGeometry(1.1, 10, 7),
          mat(i % 2 ? "#527f46" : "#8d9d53"),
        );
        shrub.scale.set(1, 0.65, 1);
        shrub.position.set(p.x + 1.6, 0.65, p.z + 1.5);
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
      riverRings: this.riverRings || river,
      roads: this.renderRoads || roads,
      mainRoads,
      district: districts.find((d) => d.id === selected),
      landmarks: this.landmarks,
      bike,
      trail: this.trail,
      remotePlayers: options.remotePlayers || [],
      staticCache: this.staticMapCache,
    });
  }
}
