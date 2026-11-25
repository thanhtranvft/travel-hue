import * as THREE from "three";
import { createPedalBoat } from "../../modules/areas/quoc-hoc/view/FountainPark.js";
import {
  animateChibiActor,
  buildChibiActor,
} from "../vehicle/ChibiCharacters.js";
import { AVATAR_IDS } from "../network/protocol.js";
import { inside, nearestPoint } from "../shared/geography/geometry.js";

const SWAN_LOOP_EAST_BOUND = [
  { x: 375, z: -535 },
  { x: 485, z: -640 },
  { x: 615, z: -760 },
  { x: 750, z: -875 },
  { x: 905, z: -1010 },
  { x: 1060, z: -1165 },
  { x: 1175, z: -1315 },
  { x: 1110, z: -1395 },
  { x: 965, z: -1245 },
  { x: 785, z: -1075 },
  { x: 590, z: -890 },
  { x: 425, z: -725 },
  { x: 315, z: -600 },
];

const SWAN_LOOP_MID_CHANNEL = [
  { x: 340, z: -565 },
  { x: 455, z: -670 },
  { x: 585, z: -790 },
  { x: 735, z: -925 },
  { x: 910, z: -1075 },
  { x: 1085, z: -1255 },
  { x: 1195, z: -1400 },
  { x: 1130, z: -1445 },
  { x: 970, z: -1290 },
  { x: 755, z: -1085 },
  { x: 535, z: -890 },
  { x: 365, z: -705 },
  { x: 270, z: -610 },
];

const BOAT_PALETTE = [
  "#f5f7fa",
  "#6ab8dc",
  "#eb846c",
  "#5fb3d8",
  "#f4d06f",
  "#7ec8a7",
  "#f5f7fa",
  "#8fb8de",
  "#f19982",
  "#73c4dc",
];

function nudgePointClearOfObstacles(pt, piers, world) {
  let x = pt.x;
  let z = pt.z;

  for (const pier of piers) {
    const dx = x - pier.x;
    const dz = z - pier.z;
    const alongN = dx * pier.nx + dz * pier.nz;
    const alongT = dx * pier.tx + dz * pier.tz;
    const clearN = (pier.halfLen || 10) + 11.5;
    const clearT = (pier.halfWidth || 2.5) + 7.5;
    if (Math.abs(alongN) < clearN && Math.abs(alongT) < clearT) {
      const sign = alongN >= 0 ? 1 : -1;
      const shift = clearN - Math.abs(alongN) + 2.5;
      x += pier.nx * sign * shift;
      z += pier.nz * sign * shift;
    }
  }

  // Keep well off Lim wood boardwalk if present
  if (world?.boardwalkView?.mainPoints?.length) {
    const hit = nearestPoint({ x, z }, world.boardwalkView.mainPoints);
    if (hit.distance < 10) {
      const dx = x - hit.x;
      const dz = z - hit.z;
      const len = Math.hypot(dx, dz) || 1;
      x += (dx / len) * (10 - hit.distance + 2);
      z += (dz / len) * (10 - hit.distance + 2);
    }
  }

  return { x, z };
}

function buildSafeSwanLoop(waypoints, piers, world) {
  const riverRings = world?.riverRings || [];
  const controlPts = waypoints.map((p) => {
    const nudged = nudgePointClearOfObstacles(p, piers, world);
    if (!riverRings.length || riverRings.some((r) => inside(nudged, r))) {
      return nudged;
    }
    return p;
  });

  const curve = new THREE.CatmullRomCurve3(
    controlPts.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    true,
    "catmullrom",
    0.5,
  );
  const sampleCount = 150;
  const pts = [];
  for (let i = 0; i < sampleCount; i++) {
    const v = curve.getPointAt(i / sampleCount);
    const cand = nudgePointClearOfObstacles({ x: v.x, z: v.z }, piers, world);
    const safeCand =
      !riverRings.length || riverRings.some((r) => inside(cand, r))
        ? cand
        : { x: v.x, z: v.z };
    pts.push(safeCand);
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

function sampleLoop(loop, s) {
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

export class AmbientSwanBoats {
  constructor(world, count = 10) {
    this.world = world;
    this.group = new THREE.Group();
    this.group.name = "ambient-swan-pedal-boats";

    const piers = [
      ...(world.phuXuanBridge?.piers || []),
      ...(world.truongTienBridge?.piers || []),
    ];
    this.loops = [
      buildSafeSwanLoop(SWAN_LOOP_EAST_BOUND, piers, world),
      buildSafeSwanLoop(SWAN_LOOP_MID_CHANNEL, piers, world),
    ];

    this.boats = [];
    for (let idx = 0; idx < count; idx++) {
      const loopIndex = idx % 2;
      const loop = this.loops[loopIndex];
      const color = BOAT_PALETTE[idx % BOAT_PALETTE.length];
      const avatarId = AVATAR_IDS[idx % AVATAR_IDS.length];

      const mesh = createPedalBoat(0, 0, 0, 0, color);
      mesh.name = `ambient-swan-boat-${idx}`;

      const rig = buildChibiActor(avatarId, { includeBike: false });
      rig.actor.position.set(idx % 2 === 0 ? -0.26 : 0.26, 0, 0.02);
      mesh.add(rig.actor);

      // Add a second companion rider on select boats for lively sightseeing feel
      let companionRig = null;
      if (idx % 3 === 0) {
        const compAvatar = AVATAR_IDS[(idx + 2) % AVATAR_IDS.length];
        companionRig = buildChibiActor(compAvatar, { includeBike: false });
        companionRig.actor.position.set(idx % 2 === 0 ? 0.26 : -0.26, 0, 0.02);
        mesh.add(companionRig.actor);
      }

      const startU = (Math.floor(idx / 2) + (loopIndex ? 0.42 : 0)) / Math.ceil(count / 2);
      const speed = (2.15 + (idx % 4) * 0.22) * (loopIndex === 1 ? -1 : 1);
      const pose = sampleLoop(loop, startU * loop.total);
      const fwdX = speed >= 0 ? pose.tx : -pose.tx;
      const fwdZ = speed >= 0 ? pose.tz : -pose.tz;

      mesh.position.set(pose.x, 0.03, pose.z);
      mesh.rotation.y = Math.atan2(fwdX, fwdZ);
      this.group.add(mesh);

      this.boats.push({
        id: `ambient-swan-${idx}`,
        index: idx,
        loopIndex,
        startU,
        speed,
        phase: idx * 0.95,
        mesh,
        rig,
        companionRig,
        avatarId,
        x: pose.x,
        y: 0.03,
        z: pose.z,
        tx: fwdX,
        tz: fwdZ,
      });
    }

    world.scene.add(this.group);
    this.update(0);
  }

  update(time = 0) {
    for (const boat of this.boats) {
      const loop = this.loops[boat.loopIndex];
      const dist = boat.startU * loop.total + time * boat.speed;
      const pose = sampleLoop(loop, dist);
      const dirSign = boat.speed >= 0 ? 1 : -1;
      const fwdX = pose.tx * dirSign;
      const fwdZ = pose.tz * dirSign;
      const y =
        this.world.riverSurfaceAt?.(pose.x, pose.z, time) ??
        0.03 + Math.sin(time * 1.6 + boat.phase) * 0.04;

      boat.x = pose.x;
      boat.y = y;
      boat.z = pose.z;
      boat.tx = fwdX;
      boat.tz = fwdZ;
      boat.mesh.position.set(pose.x, y, pose.z);
      boat.mesh.rotation.y = Math.atan2(fwdX, fwdZ);
      boat.mesh.rotation.z = Math.sin(time * 1.5 + boat.phase) * 0.038;
      boat.mesh.rotation.x = Math.cos(time * 1.2 + boat.phase) * 0.018;

      const pedalPhase = time * Math.abs(boat.speed) * 2.9 + boat.phase;
      const steerWave = Math.sin(time * 0.6 + boat.phase) * 0.14;
      animateChibiActor(boat.rig, {
        stance: "boat",
        speed: Math.abs(boat.speed),
        idleTime: time + boat.phase,
        pedalPhase,
        steer: steerWave,
      });
      if (boat.companionRig) {
        animateChibiActor(boat.companionRig, {
          stance: "boat",
          speed: Math.abs(boat.speed),
          idleTime: time + boat.phase + 0.8,
          pedalPhase: pedalPhase + Math.PI * 0.35,
          steer: -steerWave * 0.8,
        });
      }
    }
  }

  hitsBoat(wx, wz, pad = 1.8) {
    for (const b of this.boats) {
      if (Math.hypot(wx - b.x, wz - b.z) < 1.95 + pad) return true;
    }
    return false;
  }
}
