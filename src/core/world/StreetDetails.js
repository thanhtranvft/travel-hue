import * as THREE from "three";
import { roadWidth, isFootway } from "./roadProfile.js";
import { nearestPoint, inside } from "../shared/geography/geometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { roadsidePoint, onOtherCarriageway } from "./streetPlacement.js";
import { buildingDetails } from "../shared/data/buildingCatalog.js";
import { routeTrafficSign, civicPlaqueBoard } from "./TrafficBoard.js";
import { buildingFrontage } from "./BuildingFrontage.js";
import { hitsCampusWall } from "../shared/architecture/CampusWalls.js";

function createSignFactory() {
  const matCache = new Map();
  const geoCache = new Map();
  return (text, width = 7) => {
    let mat = matCache.get(text);
    if (!mat) {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 80;
      const c = canvas.getContext("2d");
      c.fillStyle = "#174b56";
      c.fillRect(0, 0, 512, 80);
      c.strokeStyle = "#f0ead6";
      c.lineWidth = 3;
      c.strokeRect(2.5, 2.5, 507, 75);
      let size = 30;
      do {
        c.font = `bold ${size--}px sans-serif`;
      } while (c.measureText(text).width > 485 && size > 9);
      c.fillStyle = "#fff5d9";
      c.textAlign = "center";
      c.fillText(text, 256, 51.5);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      mat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      matCache.set(text, mat);
    }
    let geo = geoCache.get(width);
    if (!geo) {
      geo = new THREE.PlaneGeometry(width, width / 6.4);
      geoCache.set(width, geo);
    }
    return new THREE.Mesh(geo, mat);
  };
}
export function addStreetDetails(world, features) {
  const { scene, renderRoads } = world;
  const sign = createSignFactory();
  world.buildingLabels = [];
  world.streetLampPositions = [];
  world.routeSignPlacements ??= [];
  let markers = 0;
  const paint = [];
  const addPaint = (mesh) => {
    mesh.updateMatrix();
    const geometry = mesh.geometry.clone().applyMatrix4(mesh.matrix);
    paint.push(geometry);
    mesh.geometry.dispose();
  };
  const material = new THREE.MeshStandardMaterial({
      color: "#eadfac",
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    white = new THREE.MeshStandardMaterial({
      color: "#eee9da",
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
  const lampPoleMat = new THREE.MeshStandardMaterial({
      color: "#455755",
      roughness: 0.75,
      metalness: 0.05,
    }),
    lampHeadMat = new THREE.MeshStandardMaterial({
      color: "#f2e1ad",
      roughness: 0.75,
      metalness: 0.05,
    }),
    lampPostGeo = new THREE.BoxGeometry(0.18, 7, 0.18),
    lampArmGeo = new THREE.BoxGeometry(1.4, 0.14, 0.2),
    lampHeadGeo = new THREE.BoxGeometry(0.8, 0.12, 0.4);
  const routeDestinations = {
    "Lê Lợi": ["CẦU TRÀNG TIỀN →", "CẦU PHÚ XUÂN →", "GA HUẾ · 800M"],
    "Nguyễn Huệ": ["ĐH KHOA HỌC →", "NHÀ THỜ DÒNG CHÚA CỨU THẾ", "TRUNG TÂM HUẾ →"],
    "Đống Đa": ["NGÃ TƯ LÝ THƯỜNG KIỆT →", "VINCOM PLAZA HUẾ →", "HÙNG VƯƠNG →"],
    "Hùng Vương": ["CẦU TRÀNG TIỀN →", "NGÃ 6 HÙNG VƯƠNG", "ĐỐNG ĐA →"],
    "Trần Hưng Đạo": ["CẦU TRÀNG TIỀN →", "CẦU PHÚ XUÂN →", "CHỢ ĐÔNG BA →"],
    "Lý Thường Kiệt": ["ĐỐNG ĐA →", "HÙNG VƯƠNG →", "NGUYỄN HUỆ →"],
  };
  let routeSignIndex = 0;
  for (const road of renderRoads.filter(
    (r) => !isFootway(r) && r.tags.name !== "Cầu Phú Xuân" && r.id !== 174759688,
  )) {
    const paintSurface = road.id !== 828329033 && road.id !== 835629406;
    let distance = 0,
      lastLamp = -140,
      lastSign = -170;
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1],
        b = road.points[i],
        dx = b.x - a.x,
        dz = b.z - a.z,
        len = Math.hypot(dx, dz);
      if (!len) continue;
      const nx = -dz / len,
        nz = dx / len;
      const surface = (d) =>
        world.roadHeight(road, i - 1) * (1 - d / len) +
        (world.roadHeight(road, i) * d) / len;
      if (paintSurface)
        for (let d = 1; d < len; d += 2) {
          const length = Math.min(2, len - d),
            mid = d + length / 2,
            p = roadsidePoint(a, b, mid, 0);
          if (onOtherCarriageway(p, road, renderRoads, 1)) continue;
          if (Math.floor((distance + d) / 3) % 2) {
            const dash = new THREE.Mesh(
              new THREE.PlaneGeometry(0.15, length),
              material,
            );
            dash.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz));
            dash.position.set(p.x, surface(mid) + 0.035, p.z);
            addPaint(dash);
            markers++;
          }
          for (const side of [-1, 1]) {
            const e = roadsidePoint(a, b, mid, roadWidth(road) / 2 - 0.4, side);
            if (onOtherCarriageway(e, road, renderRoads, 1)) continue;
            const edge = new THREE.Mesh(
              new THREE.PlaneGeometry(0.12, length),
              white,
            );
            edge.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz));
            edge.position.set(e.x, surface(mid) + 0.03, e.z);
            addPaint(edge);
          }
        }
      const blockedProp = (p) =>
        world.quocHocPark?.blocksTree(p.x, p.z) ||
        world.quocHocCampus?.blocksTree(p.x, p.z) ||
        world.haiBaTrungCampus?.blocksTree(p.x, p.z) ||
        world.nguyenChiDieuCampus?.blocksTree(p.x, p.z) ||
        world.caoThangCampus?.blocksTree(p.x, p.z) ||
        world.vincomPlaza?.blocksTree(p.x, p.z) ||
        world.quangTrungCampus?.blocksTree(p.x, p.z) ||
        world.quangTrungEastPrecinct?.blocksTree(p.x, p.z) ||
        world.benhVienRhmHue?.blocksTree(p.x, p.z) ||
        world.dongChuaCuuTheChurch?.blocksTree(p.x, p.z) ||
        world.youthPlayground?.blocksTree(p.x, p.z) ||
        world.ubndPalace?.blocksTree(p.x, p.z) ||
        world.hoChiMinhMuseum?.blocksTree(p.x, p.z) ||
        world.benTrangCafe?.blocksTree(p.x, p.z) ||
        world.hueCit?.blocksTree(p.x, p.z) ||
        world.hueHospital?.blocksTree(p.x, p.z) ||
        world.truongTienSurroundings?.blocksTree(p.x, p.z) ||
        world.dongDaCorridor?.blocksTree(p.x, p.z) ||
        (world.campusWallSegments?.length &&
          hitsCampusWall(
            p,
            world.nearCampusWalls ? world.nearCampusWalls(p.x, p.z) : world.campusWallSegments,
            1.35,
          )) ||
        world.allGateClearances?.some(
          (g) => Math.hypot(p.x - g.x, p.z - g.z) < (g.radius || 14.5),
        ) ||
        world.schoolGates?.some((g) => Math.hypot(p.x - g.x, p.z - g.z) < 14.5);
      if (road.tags.name && distance - lastSign > 165 && len > 10) {
        const onewayDirs =
          road.tags.oneway === "yes"
            ? [1]
            : road.tags.oneway === "-1"
              ? [-1]
              : len > 28
                ? [1, -1]
                : [routeSignIndex % 2 === 0 ? 1 : -1];
        for (const direction of onewayDirs) {
          const distAlong =
            direction > 0
              ? Math.min(10, len * 0.3)
              : len > 28
                ? Math.max(len * 0.72, len - 10)
                : Math.min(12, len / 2);
          const p = roadsidePoint(
            a,
            b,
            distAlong,
            roadWidth(road) / 2 + 1.55,
            direction,
          );
          if (
            onOtherCarriageway(p, { id: null }, renderRoads, 1.5) ||
            blockedProp(p) ||
            world.routeSignPlacements.some(
              (s) => Math.hypot(s.x - p.x, s.z - p.z) < 24,
            )
          )
            continue;
          const isMajorCorridor = [
            "primary",
            "secondary",
            "trunk",
            "tertiary",
          ].includes(road.tags.highway);
          const destList = routeDestinations[road.tags.name];
          const nearSchool = world.schoolGates?.some(
            (g) => Math.hypot(p.x - g.x, p.z - g.z) < 65,
          );
          let spec;
          if (nearSchool) {
            spec = {
              variant: "direction-warning",
              title: `KHU VỰC TRƯỜNG HỌC`,
              subtitle: `ĐƯỜNG ${road.tags.name.toUpperCase()}`,
              warning: "school",
            };
          } else if (!isMajorCorridor && routeSignIndex % 2 === 0) {
            spec = {
              variant: "street-name",
              title: `ĐƯỜNG ${road.tags.name.toUpperCase()}`,
            };
          } else {
            const cycle = routeSignIndex % 4;
            if (cycle === 0) {
              spec = {
                variant: "no-car-time",
                timeText: "6:00 - 22:00",
                distanceText: "1000 m",
                bannerText: `CẤM Ô TÔ · ${road.tags.name.toUpperCase()}`,
              };
            } else if (cycle === 1) {
              const target = destList
                ? destList[routeSignIndex % destList.length]
                : `TUYẾN ${road.tags.name.toUpperCase()}`;
              spec = {
                variant: "direction-warning",
                title: `HƯỚNG ĐI · ${target}`,
                subtitle: `ĐƯỜNG ${road.tags.name.toUpperCase()}`,
                warning: "junction",
              };
            } else if (cycle === 2) {
              spec = {
                variant: "no-parking",
                timeText: "6:00 - 22:00",
                distanceText: "THEO TUYẾN",
              };
            } else {
              spec = {
                variant: "speed-limit",
                speedText: isMajorCorridor ? "50" : "40",
                bannerText: "GIẢM TỐC ĐỘ",
                subBanner: `ĐƯỜNG ${road.tags.name.toUpperCase()}`,
                distanceText: "500 m",
              };
            }
          }
          routeSignIndex++;
          const signObj = routeTrafficSign(spec);
          signObj.position.set(p.x, surface(distAlong), p.z);
          signObj.rotation.y = Math.atan2(-dx * direction, -dz * direction);
          scene.add(signObj);
          world.routeSignPlacements.push({
            x: p.x,
            z: p.z,
            heading: Math.atan2(dx * direction, dz * direction),
            roadId: road.id,
            roadName: road.tags.name,
            direction,
            variant: spec.variant,
          });
        }
        lastSign = distance;
      }
      if (road.tags.name && distance - lastLamp > 120 && len > 6) {
        lastLamp = distance;
        if (road.tags.bridge !== "yes" && road.tags.name !== "Cầu Phú Xuân")
          for (const side of [-1, 1]) {
            const p = roadsidePoint(
              a,
              b,
              Math.min(12, len / 2),
              roadWidth(road) / 2 + 1.8,
              side,
            );
            if (
              onOtherCarriageway(p, { id: null }, renderRoads, 1) ||
              blockedProp(p)
            )
              continue;
            const lamp = new THREE.Group();
            lamp.position.set(p.x, surface(Math.min(12, len / 2)), p.z);
            const post = new THREE.Mesh(lampPostGeo, lampPoleMat);
            post.position.set(0, 3.5, 0);
            post.castShadow = post.receiveShadow = true;
            const arm = new THREE.Mesh(lampArmGeo, lampPoleMat);
            arm.position.set(0.6, 7, 0);
            arm.castShadow = arm.receiveShadow = true;
            const head = new THREE.Mesh(lampHeadGeo, lampHeadMat);
            head.position.set(1, 6.9, 0);
            head.castShadow = head.receiveShadow = true;
            lamp.add(post, arm, head);
            scene.add(lamp);
            world.streetLampPositions.push(p);
          }
      }
      distance += len;
    }
  }
  const customLandmarkBuildings = new Set([
    732304130, 732304131, 1416873568,
    732304133, 732304134, 732304135, 732304136, 732304137, 732304138,
    749331141, 732320417, 732309927, 1172894102, 1174028275, 1174028276, 1174028274, 240266284,
    354775345, 240252008, 1210477658, 942532232, 942532233, 942532235,
  ]);
  for (const f of features.filter(
    (f) => f.type === "way" && f.tags?.building && f.geometry?.length > 3,
  )) {
    if (customLandmarkBuildings.has(f.id)) continue;
    const points = f.geometry.map((p) => world.projectPoint(p)),
      center = points.reduce(
        (a, p) => ({
          x: a.x + p.x / points.length,
          z: a.z + p.z / points.length,
        }),
        { x: 0, z: 0 },
      );
    if (
      center.x < world.bounds.minX ||
      center.x > world.bounds.maxX ||
      center.z < world.bounds.minZ ||
      center.z > world.bounds.maxZ
    )
      continue;
    if (world.quangTrungEastPrecinct?.blocksOmittedBuilding?.(center.x, center.z))
      continue;
    if (!world.buildingPolygons.some((b) => inside(center, b.points))) continue;
    const hit = renderRoads
      .filter((r) => r.tags.name && !isFootway(r))
      .map((r) => ({ ...nearestPoint(center, r.points), road: r }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (!hit || hit.distance > 135) continue;
    const details = buildingDetails(f),
      title = details.needsName
        ? details.name
        : `${details.code || ""} · ${details.name}`;
    const label = sign(
      `${title} · ${details.address || "Chưa có địa chỉ"}`,
      12,
      Boolean(world.quality?.mobile),
    );
    label.userData.building = details;
    label.position.set(
      center.x,
      Math.min(
        45,
        Number.parseFloat(f.tags.height) ||
          Number(f.tags["building:levels"] || 2) * 3.2,
      ) + 3,
      center.z,
    );
    scene.add(label);
    world.buildingLabels.push(label);
    if (!details.needsName) {
      const p = buildingFrontage(center, renderRoads);
      if (p) {
        const post = civicPlaqueBoard(
          details.name,
          details.address || "Chưa có số nhà",
          1.45,
        );
        post.position.set(p.x, world.groundAt(p.x, p.z), p.z);
        post.rotation.y = p.heading;
        post.userData.building = details;
        scene.add(post);
        (world.buildingPostPositions ??= []).push({
          ...p,
          code: details.code,
          name: details.name,
        });
      }
    }
  }
  // Trees follow pavements, with river/building rejection; these are landscape decorations.
  const preferredTreeRoad = renderRoads.some((r) => r.tags.name === "Lê Lợi")
    ? "Lê Lợi"
    : renderRoads.some((r) => r.tags.name === "Nguyễn Huệ")
      ? "Nguyễn Huệ"
      : "Đống Đa";
  for (const road of renderRoads
    .filter((r) => !isFootway(r) && r.tags.name)
    .sort(
      (a, b) =>
        (b.tags.name === preferredTreeRoad) -
        (a.tags.name === preferredTreeRoad),
    ))
    for (let i = 1; i < road.points.length; i++) {
      const a = road.points[i - 1],
        b = road.points[i],
        dx = b.x - a.x,
        dz = b.z - a.z,
        len = Math.hypot(dx, dz);
      for (let d = 6; d < len; d += 16)
        for (const side of [-1, 1]) {
          const p = roadsidePoint(a, b, d, roadWidth(road) / 2 + 3, side);
          if (
            world.isTreePositionSafe
              ? !world.isTreePositionSafe(p)
              : world.riverRings.some((r) => inside(p, r)) ||
                world.buildingPolygons.some((b) => inside(p, b.points)) ||
                world.quocHocPark?.blocksTree(p.x, p.z) ||
                world.quocHocCampus?.blocksTree(p.x, p.z) ||
                world.haiBaTrungCampus?.blocksTree(p.x, p.z) ||
                world.nguyenChiDieuCampus?.blocksTree(p.x, p.z) ||
                world.caoThangCampus?.blocksTree(p.x, p.z) ||
                world.vincomPlaza?.blocksTree(p.x, p.z) ||
                world.quangTrungCampus?.blocksTree(p.x, p.z) ||
                world.quangTrungEastPrecinct?.blocksTree(p.x, p.z) ||
                world.benhVienRhmHue?.blocksTree(p.x, p.z) ||
                world.dongChuaCuuTheChurch?.blocksTree(p.x, p.z) ||
                world.truongTienSurroundings?.blocksTree(p.x, p.z) ||
                world.dongDaCorridor?.blocksTree(p.x, p.z) ||
                onOtherCarriageway(p, road, renderRoads, 2)
          )
            continue;
          if (
            world.treePositions.length < 480 &&
            !world.treePositions.some(
              (q) => Math.hypot(q.x - p.x, q.z - p.z) < 5,
            )
          )
            world.treePositions.push(p);
        }
    }
  if (paint.length) {
    scene.add(new THREE.Mesh(mergeGeometries(paint), white));
    paint.forEach((g) => g.dispose());
  }
  world.treePositions = world.treePositions.filter((p) =>
    world.isTreePositionSafe
      ? world.isTreePositionSafe(p)
      : !world.schoolGates?.some((g) => Math.hypot(p.x - g.x, p.z - g.z) < 14.5) &&
        !world.allGateClearances?.some(
          (g) => Math.hypot(p.x - g.x, p.z - g.z) < (g.radius || 14.5),
        ),
  );
  const streetTrunkGeo = new THREE.BoxGeometry(0.24, 3, 0.24);
  const streetTrunkMat = new THREE.MeshStandardMaterial({
    color: "#796346",
    roughness: 0.75,
    metalness: 0.05,
  });
  const streetCrownGeos = [0, 1, 2].map(
    (j) => new THREE.ConeGeometry(1.5 - j * 0.28, 2.5, 10),
  );
  const streetCrownMats = ["#486d47", "#527e49", "#68964c"].map(
    (color) => new THREE.MeshStandardMaterial({ color }),
  );
  for (let i = 0; i < world.treePositions.length; i += 7) {
    const p = world.treePositions[i],
      tree = new THREE.Group();
    const trunk = new THREE.Mesh(streetTrunkGeo, streetTrunkMat);
    trunk.position.set(0, 1.5, 0);
    trunk.castShadow = trunk.receiveShadow = true;
    tree.add(trunk);
    for (let j = 0; j < 3; j++) {
      const crown = new THREE.Mesh(streetCrownGeos[j], streetCrownMats[j]);
      crown.position.y = 3 + j * 0.9;
      tree.add(crown);
    }
    tree.position.set(p.x, 0, p.z);
    scene.add(tree);
  }
  world.streetDetailCounts = {
    laneMarkers: markers,
    buildingLabels: world.buildingLabels.length,
  };
}
