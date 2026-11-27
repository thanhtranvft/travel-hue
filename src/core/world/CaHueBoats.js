import * as THREE from "three";
import { createDragonBoat } from "./DragonBoatBuilder.js";
import { inside } from "../shared/geography/geometry.js";

const CA_HUE_AUDIO_URLS = [
  new URL("../../assets/music/ho-doi-dap-song-huong-01.mp3", import.meta.url).href,
  new URL("../../assets/music/ho-doi-dap-song-huong-02.mp3", import.meta.url).href,
  new URL("../../assets/music/ho-doi-dap-song-huong-03.mp3", import.meta.url).href,
  new URL("../../assets/music/ho-doi-dap-song-huong-04.mp3", import.meta.url).href,
];

export const CA_HUE_SONGS = [
  {
    id: "ho-mai-nhi",
    title: "Hò Mái Nhì — Điệu hò sông Hương",
    shortTitle: "Hò Mái Nhì",
    tempo: 0.78,
    notes: [62, 67, 69, 72, 69, 67, 64, 62, 60, 62, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[0],
  },
  {
    id: "nam-ai",
    title: "Nam Ai — Khúc sầu Cố đô",
    shortTitle: "Nam Ai",
    tempo: 0.92,
    notes: [60, 63, 67, 70, 67, 63, 62, 60, 58, 60, 63, null],
    audioUrl: CA_HUE_AUDIO_URLS[1],
  },
  {
    id: "ly-muoi-thuong",
    title: "Lý Mười Thương — Dân ca Bình Trị Thiên",
    shortTitle: "Lý Mười Thương",
    tempo: 0.68,
    notes: [64, 67, 69, 71, 74, 71, 69, 67, 64, 62, 64, null],
    audioUrl: CA_HUE_AUDIO_URLS[2],
  },
  {
    id: "phu-luc",
    title: "Phú Lục — Ca Huế trên thuyền rồng",
    shortTitle: "Phú Lục",
    tempo: 0.74,
    notes: [67, 69, 72, 74, 76, 74, 72, 69, 67, 64, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[3],
  },
  {
    id: "nam-binh",
    title: "Nam Bình — Đêm trăng Vĩ Dạ",
    shortTitle: "Nam Bình",
    tempo: 0.84,
    notes: [62, 65, 67, 70, 69, 67, 65, 62, 60, 62, 65, null],
    audioUrl: CA_HUE_AUDIO_URLS[0],
  },
  {
    id: "luu-thuy-kim-tien",
    title: "Lưu Thủy Kim Tiền — Nhã nhạc cung đình",
    shortTitle: "Lưu Thủy Kim Tiền",
    tempo: 0.64,
    notes: [67, 69, 71, 74, 76, 74, 71, 69, 67, 64, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[1],
  },
  {
    id: "co-ban",
    title: "Cổ Bản — Khúc dạo sông Hương",
    shortTitle: "Cổ Bản",
    tempo: 0.76,
    notes: [60, 64, 67, 69, 72, 69, 67, 64, 62, 60, 64, null],
    audioUrl: CA_HUE_AUDIO_URLS[2],
  },
  {
    id: "tu-dai-canh",
    title: "Tứ Đại Cảnh — Bến Ngự chiều thu",
    shortTitle: "Tứ Đại Cảnh",
    tempo: 0.82,
    notes: [64, 67, 71, 72, 74, 72, 69, 67, 64, 62, 64, null],
    audioUrl: CA_HUE_AUDIO_URLS[3],
  },
  {
    id: "long-ngam",
    title: "Long Ngâm — Vọng cầu Trường Tiền",
    shortTitle: "Long Ngâm",
    tempo: 0.88,
    notes: [62, 67, 70, 72, 74, 72, 70, 67, 65, 62, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[0],
  },
  {
    id: "hanh-van",
    title: "Hành Vân — Gió lộng bến Phu Văn",
    shortTitle: "Hành Vân",
    tempo: 0.72,
    notes: [65, 67, 69, 72, 74, 72, 69, 67, 65, 62, 65, null],
    audioUrl: CA_HUE_AUDIO_URLS[2],
  },
  {
    id: "ly-tinh-tang",
    title: "Lý Tình Tang — Vang vọng bến Ngự",
    shortTitle: "Lý Tình Tang",
    tempo: 0.7,
    notes: [64, 67, 72, 69, 67, 64, 62, 64, 67, 69, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[1],
  },
  {
    id: "ly-con-sao",
    title: "Lý Con Sáo Huế — Nắng chiều Gia Hội",
    shortTitle: "Lý Con Sáo Huế",
    tempo: 0.66,
    notes: [67, 71, 74, 72, 69, 67, 64, 67, 69, 72, 71, null],
    audioUrl: CA_HUE_AUDIO_URLS[3],
  },
  {
    id: "ho-gia-gao",
    title: "Hò Giã Gạo — Nhịp chày đêm Kim Long",
    shortTitle: "Hò Giã Gạo",
    tempo: 0.74,
    notes: [62, 64, 67, 69, 67, 64, 62, 60, 62, 67, 64, null],
    audioUrl: CA_HUE_AUDIO_URLS[0],
  },
  {
    id: "kim-tien",
    title: "Kim Tiền — Đèn hoa bến Nghinh Lương",
    shortTitle: "Kim Tiền",
    tempo: 0.65,
    notes: [69, 72, 74, 76, 74, 72, 69, 67, 69, 72, 74, null],
    audioUrl: CA_HUE_AUDIO_URLS[1],
  },
  {
    id: "xuan-phong",
    title: "Xuân Phong — Sóng biếc cầu Phú Xuân",
    shortTitle: "Xuân Phong",
    tempo: 0.72,
    notes: [64, 67, 69, 72, 74, 72, 69, 67, 64, 67, 69, null],
    audioUrl: CA_HUE_AUDIO_URLS[2],
  },
  {
    id: "long-ho",
    title: "Long Hổ Hội — Rồng lượn sông Hương",
    shortTitle: "Long Hổ Hội",
    tempo: 0.78,
    notes: [60, 64, 67, 72, 69, 67, 64, 62, 60, 64, 67, null],
    audioUrl: CA_HUE_AUDIO_URLS[3],
  },
  {
    id: "van-thien-tuong",
    title: "Vạn Thiên Tường — Trăng soi Thiên Mụ",
    shortTitle: "Vạn Thiên Tường",
    tempo: 0.86,
    notes: [62, 65, 69, 72, 70, 69, 65, 62, 60, 62, 65, null],
    audioUrl: CA_HUE_AUDIO_URLS[0],
  },
  {
    id: "ly-chieu-chieu",
    title: "Lý Chiều Chiều — Hoàng hôn Cồn Hến",
    shortTitle: "Lý Chiều Chiều",
    tempo: 0.8,
    notes: [64, 67, 71, 69, 67, 64, 62, 60, 64, 67, 69, null],
    audioUrl: CA_HUE_AUDIO_URLS[1],
  },
];

const RAW_LOOP_WAYPOINTS = [
  { x: 354.17, z: -563.68 },
  { x: 476.14, z: -674.92 },
  { x: 605.28, z: -793.12 },
  { x: 777.29, z: -938.94 },
  { x: 956.59, z: -1098.79 },
  { x: 1132.85, z: -1290.51 },
  { x: 1226.87, z: -1423.41 },
  { x: 1142.47, z: -1453.01 },
  { x: 959.25, z: -1268.48 },
  { x: 725.98, z: -1049.36 },
  { x: 496.63, z: -854.94 },
  { x: 284.69, z: -642.56 },
];

function nudgePointClearOfPiers(pt, piers) {
  let x = pt.x;
  let z = pt.z;
  for (const pier of piers) {
    const dx = x - pier.x;
    const dz = z - pier.z;
    const alongN = dx * pier.nx + dz * pier.nz;
    const alongT = dx * pier.tx + dz * pier.tz;
    const clearN = (pier.halfLen || 10) + 12.5;
    const clearT = (pier.halfWidth || 2.5) + 8.0;
    if (Math.abs(alongN) < clearN && Math.abs(alongT) < clearT) {
      const sign = alongN >= 0 ? 1 : -1;
      const shift = clearN - Math.abs(alongN) + 2.5;
      x += pier.nx * sign * shift;
      z += pier.nz * sign * shift;
    }
  }
  return { x, z };
}

function buildClosedLoopSamples(piers, riverRings) {
  const controlPts = RAW_LOOP_WAYPOINTS.map((p) => {
    const nudged = nudgePointClearOfPiers(p, piers);
    if (!riverRings?.length || riverRings.some((r) => inside(nudged, r))) {
      return nudged;
    }
    return p;
  });

  const vectors = controlPts.map((p) => new THREE.Vector3(p.x, 0, p.z));
  const curve = new THREE.CatmullRomCurve3(vectors, true, "catmullrom", 0.5);
  const sampleCount = 160;
  const pts = [];
  for (let i = 0; i < sampleCount; i++) {
    const v = curve.getPointAt(i / sampleCount);
    const nudged = nudgePointClearOfPiers({ x: v.x, z: v.z }, piers);
    if (!riverRings?.length || riverRings.some((r) => inside(nudged, r))) {
      pts.push(nudged);
    } else {
      pts.push({ x: v.x, z: v.z });
    }
  }

  let total = 0;
  const arc = [0];
  for (let i = 1; i <= pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i % pts.length];
    total += Math.hypot(b.x - a.x, b.z - a.z);
    arc.push(total);
  }
  return { pts, arc, total: total || 1 };
}

function sampleLoopAtDistance(loop, s) {
  const { pts, arc, total } = loop;
  const target = ((s % total) + total) % total;
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const s0 = arc[i];
    const s1 = arc[i + 1];
    if (target <= s1 || i === n - 1) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const span = s1 - s0 || 1;
      const t = Math.max(0, Math.min(1, (target - s0) / span));
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      return {
        x: a.x + dx * t,
        z: a.z + dz * t,
        tx: dx / len,
        tz: dz / len,
      };
    }
  }
  return { x: pts[0].x, z: pts[0].z, tx: 1, tz: 0 };
}

export class CaHueBoats {
  constructor(world) {
    this.world = world;
    this.group = new THREE.Group();
    this.group.name = "ca-hue-cruising-boats";

    this.piers = [
      ...(world.phuXuanBridge?.piers || []),
      ...(world.truongTienBridge?.piers || []),
    ];
    this.loop = buildClosedLoopSamples(this.piers, world.riverRings);
    this.speed = 3.3;

    const lanes = [-8.2, -3.2, 3.2, 8.2];
    this.boats = CA_HUE_SONGS.map((song, idx) => {
      const mesh = createDragonBoat(idx);
      const stageGlow = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.16, 0),
        new THREE.MeshStandardMaterial({
          color: "#ffe7a8",
          emissive: idx % 2 === 0 ? "#ffb338" : "#ff6b8b",
          emissiveIntensity: 1.05,
          roughness: 0.25,
        }),
      );
      stageGlow.position.set(0, 2.78, 2.0);
      mesh.add(stageGlow);

      const startU = idx / CA_HUE_SONGS.length;
      const dir = idx % 3 === 1 ? -1 : 1;
      const laneOffset = lanes[idx % lanes.length];
      const boatSpeed = 2.95 + (idx % 4) * 0.22;
      const pose = this.sampleSafeBoatPose(startU * this.loop.total, laneOffset);
      const fwdX = pose.tx * dir;
      const fwdZ = pose.tz * dir;
      mesh.position.set(pose.x, 0.03, pose.z);
      mesh.rotation.y = Math.atan2(fwdX, fwdZ);
      this.group.add(mesh);

      return {
        id: `ca-hue-boat-${idx}`,
        boatIndex: idx,
        song,
        startU,
        dir,
        speed: boatSpeed,
        laneOffset,
        phase: idx * 1.4,
        mesh,
        x: pose.x,
        y: 0.03,
        z: pose.z,
        tx: fwdX,
        tz: fwdZ,
      };
    });

    world.scene.add(this.group);
    this.update(0);
  }

  sampleSafeBoatPose(dist, laneOffset = 0) {
    const base = sampleLoopAtDistance(this.loop, dist);
    if (!laneOffset) return base;
    const rx = -base.tz;
    const rz = base.tx;
    const shifted = {
      x: base.x + rx * laneOffset,
      z: base.z + rz * laneOffset,
    };
    const safe = nudgePointClearOfPiers(shifted, this.piers);
    const inRiver =
      !this.world.riverRings?.length ||
      this.world.riverRings.some((r) => inside(safe, r));
    if (!inRiver) return base;
    return {
      x: safe.x,
      z: safe.z,
      tx: base.tx,
      tz: base.tz,
    };
  }

  update(time = 0, position = null) {
    const hasPos = Boolean(position && Number.isFinite(position.x) && Number.isFinite(position.z));
    for (const boat of this.boats) {
      const dist = boat.startU * this.loop.total + time * (boat.speed ?? this.speed) * (boat.dir ?? 1);
      const pose = this.sampleSafeBoatPose(dist, boat.laneOffset);
      const fwdX = pose.tx * (boat.dir ?? 1);
      const fwdZ = pose.tz * (boat.dir ?? 1);
      boat.x = pose.x;
      boat.z = pose.z;
      boat.tx = fwdX;
      boat.tz = fwdZ;

      if (hasPos) {
        const cullDist = this.world.quality?.mobile ? 320 : 440;
        const dx = pose.x - position.x;
        const dz = pose.z - position.z;
        const visible = dx * dx + dz * dz <= cullDist * cullDist;
        boat.mesh.visible = visible;
        if (!visible) {
          boat.y = 0.03;
          continue;
        }
      } else {
        boat.mesh.visible = true;
      }

      const y =
        this.world.riverSurfaceAt?.(pose.x, pose.z, time) ??
        0.03 + Math.sin(time * 1.5 + boat.phase) * 0.04;
      boat.y = y;
      boat.mesh.position.set(pose.x, y, pose.z);
      boat.mesh.rotation.y = Math.atan2(fwdX, fwdZ);
      boat.mesh.rotation.z = Math.sin(time * 1.1 + boat.phase) * 0.025;
      boat.mesh.rotation.x = Math.cos(time * 0.9 + boat.phase) * 0.015;
    }
  }

  getAudioSources() {
    return this.boats.map((b) => ({
      id: b.id,
      boatIndex: b.boatIndex,
      x: b.x,
      y: b.y,
      z: b.z,
      song: b.song,
    }));
  }

  hitsBoat(wx, wz, pad = 2.8) {
    for (const b of this.boats) {
      const dx = wx - b.x;
      const dz = wz - b.z;
      const along = Math.abs(dx * b.tx + dz * b.tz);
      const lat = Math.abs(-dx * b.tz + dz * b.tx);
      if (along < 6.8 + pad && lat < 1.65 + pad) return true;
    }
    return false;
  }
}
