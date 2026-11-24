import {
  animateChibiActor as animatePrimaryStudent,
  buildChibiActor,
} from "../vehicle/ChibiCharacters.js";
import * as THREE from "three";
import {
  buildHighSchoolStudent,
  animateHighSchoolStudent,
} from "./HighSchoolStudent.js";

function animateChibiActor(rig, state) {
  if (rig.highSchool) animateHighSchoolStudent(rig, state);
  else animatePrimaryStudent(rig, state);
}

function yawFromDelta(dx, dz) {
  return Math.atan2(dx, dz);
}

export class CampusStudents {
  constructor({
    scene,
    parent,
    toWorld,
    groundAt,
    walkers = [],
    chatSpots = [],
    distanceCutoff = 120,
    scale = 1.0,
    includeBike = false,
    schoolLevel = "primary",
    benchSpots = [],
  } = {}) {
    this.target = parent || scene;
    this.toWorld = toWorld || ((side, fwd) => ({ x: side, z: fwd }));
    this.groundAt = groundAt || (() => 0.34);
    this.distanceCutoffSq = distanceCutoff * distanceCutoff;
    this.animatedObjects = [];
    this.students = [];
    this.lastTime = null;
    this.shuttleGroups = [];
    const buildStudent = (gender) =>
      schoolLevel === "high-school"
        ? buildHighSchoolStudent(gender)
        : buildChibiActor(gender, { includeBike });

    let seed = 1;

    for (const spec of walkers) {
      const gender = spec.gender === "girl" ? "girl" : "boy";
      const rig = buildStudent(gender);
      const pts = (spec.points || []).map(([side, fwd]) =>
        this.toWorld(side, fwd),
      );
      if (pts.length < 2) continue;

      const segLengths = [];
      let totalLen = 0;
      for (let i = 1; i < pts.length; i++) {
        const len = Math.hypot(
          pts[i].x - pts[i - 1].x,
          pts[i].z - pts[i - 1].z,
        );
        segLengths.push(len);
        totalLen += len;
      }
      if (totalLen < 0.2) continue;

      const startPos = pts[0];
      const y = this.groundAt(startPos.x, startPos.z) ?? 0.34;
      const walkSpeed = spec.speed || 1.25 + (seed % 4) * 0.14;
      rig.actor.name = `campus-student-${gender}`;
      rig.actor.userData.studentGender = gender;
      rig.actor.scale.setScalar(spec.scale || scale);
      rig.actor.position.set(startPos.x, y, startPos.z);

      this.target?.add(rig.actor);
      this.animatedObjects.push(rig.actor);

      this.students.push({
        type: "pedestrian",
        isStudent: true,
        kind: "walker",
        gender,
        rig,
        mesh: rig.actor,
        radius: 0.38,
        pts,
        segLengths,
        totalLen,
        baseSpeed: walkSpeed,
        speed: walkSpeed,
        heading: rig.actor.rotation.y,
        previous: { x: startPos.x, z: startPos.z },
        pause: 0,
        pauseOffset: 0,
        offset: spec.offset ?? (seed * 0.29) % 1,
        phaseSeed: seed * 1.37,
        animState: {
          stance: "walk",
          speed: walkSpeed,
          phase: 0,
          idleTime: 0,
          steer: 0,
        },
      });
      seed++;
    }

    for (const spot of [
      ...chatSpots,
      ...benchSpots.map((b) => ({
        ...b,
        activity: "seated",
        members: ["boy", "girl"],
        radius: 0.42,
      })),
    ]) {
      const center = this.toWorld(spot.side, spot.fwd);
      const members = spot.members || ["boy", "girl"];
      const radius = spot.radius ?? 0.95;
      const baseAngle = spot.angleOffset ?? seed * 0.6;

      members.forEach((rawGender, idx) => {
        const gender = rawGender === "girl" ? "girl" : "boy";
        const a = baseAngle + (idx * Math.PI * 2) / members.length;
        const seated = spot.activity === "seated";
        const offset = (idx - (members.length - 1) / 2) * 0.65;
        const seatWorld = seated
          ? this.toWorld(
              spot.side + Math.cos(spot.yaw || 0) * offset,
              spot.fwd + Math.sin(spot.yaw || 0) * offset,
            )
          : null;
        const wx = seatWorld?.x ?? center.x + Math.cos(a) * radius;
        const wz = seatWorld?.z ?? center.z + Math.sin(a) * radius;
        const y = this.groundAt(wx, wz) ?? 0.34;

        const rig = buildStudent(gender);
        rig.actor.name = `campus-student-${gender}`;
        rig.actor.userData.studentGender = gender;
        rig.actor.scale.setScalar(spot.scale || scale);
        rig.actor.position.set(wx, y, wz);
        rig.actor.rotation.y = yawFromDelta(center.x - wx, center.z - wz);
        if (seated) {
          const facing = this.toWorld(
            spot.side + Math.sin(spot.yaw || 0),
            spot.fwd - Math.cos(spot.yaw || 0),
          );
          rig.actor.rotation.y = yawFromDelta(
            facing.x - center.x,
            facing.z - center.z,
          );
        }

        this.target?.add(rig.actor);
        this.animatedObjects.push(rig.actor);

        const animState = {
          stance: "idle",
          speed: 0,
          phase: 0,
          idleTime: seed * 1.15 + idx * 0.9,
          steer: 0,
          activity: spot.activity || "chat",
        };
        animateChibiActor(rig, animState);

        this.students.push({
          type: "pedestrian",
          isStudent: true,
          kind: "chat",
          activity: spot.activity || "chat",
          kickIndex: idx,
          kickMembers: members.length,
          gender,
          rig,
          mesh: rig.actor,
          radius: 0.38,
          baseSpeed: 0,
          speed: 0,
          heading: rig.actor.rotation.y,
          previous: { x: wx, z: wz },
          pause: 0,
          baseX: wx,
          baseZ: wz,
          baseYaw: rig.actor.rotation.y,
          phaseSeed: seed * 0.91 + idx * 1.17,
          animState,
        });
      });
      if (spot.activity === "shuttlecock") {
        const shuttle = new THREE.Group();
        shuttle.name = "school-shuttlecock";
        const base = new THREE.Mesh(
          new THREE.CylinderGeometry(0.055, 0.07, 0.04, 8),
          new THREE.MeshStandardMaterial({ color: "#df6336" }),
        );
        shuttle.add(base);
        const featherMat = new THREE.MeshStandardMaterial({
          color: "#fff1c6",
          side: THREE.DoubleSide,
        });
        for (let i = 0; i < 3; i++) {
          const feather = new THREE.Mesh(
            new THREE.PlaneGeometry(0.07, 0.23),
            featherMat,
          );
          feather.position.y = 0.12;
          feather.rotation.y = (i * Math.PI) / 3;
          shuttle.add(feather);
        }
        this.target?.add(shuttle);
        this.animatedObjects.push(shuttle);
        this.shuttleGroups.push({
          mesh: shuttle,
          center,
          radius,
          baseAngle,
          count: members.length,
        });
      }
      seed++;
    }

    this.update(0, null);
  }

  getCounts() {
    let boys = 0;
    let girls = 0;
    for (const s of this.students) {
      if (s.gender === "boy") boys++;
      else girls++;
    }
    return { total: this.students.length, boys, girls };
  }

  update(time = 0, playerPos = null) {
    const dt =
      this.lastTime === null
        ? 0
        : Math.max(0, Math.min(0.25, time - this.lastTime));
    this.lastTime = time;

    for (const s of this.students) {
      const actor = s.rig.actor;
      s.previous = { x: actor.position.x, z: actor.position.z };

      if (playerPos) {
        const dx = actor.position.x - playerPos.x;
        const dz = actor.position.z - playerPos.z;
        const inRange = dx * dx + dz * dz <= this.distanceCutoffSq;
        actor.visible = inRange;
        if (!inRange) continue;
      } else {
        actor.visible = true;
      }

      if (s.pause > 0) {
        s.pause = Math.max(0, s.pause - dt);
        if (s.kind === "walker") s.pauseOffset += dt;
        s.speed = 0;
        s.animState.stance = "idle";
        s.animState.speed = 0;
        s.animState.idleTime = time + s.phaseSeed;
        s.animState.activity = s.activity;
        s.animState.kickPhase =
          ((time / 1.3 - s.kickIndex) * Math.PI * 2) / (s.kickMembers || 1);
        animateChibiActor(s.rig, s.animState);
        s.heading = actor.rotation.y;
        continue;
      }

      if (s.kind === "walker") {
        s.speed = s.baseSpeed;
        const effectiveTime = Math.max(0, time - s.pauseOffset);
        const travel =
          (effectiveTime * s.baseSpeed + s.offset * s.totalLen * 2) %
          (s.totalLen * 2);
        const forward = travel <= s.totalLen;
        let dist = forward ? travel : s.totalLen * 2 - travel;

        let segIdx = 0;
        while (
          segIdx < s.segLengths.length - 1 &&
          dist > s.segLengths[segIdx]
        ) {
          dist -= s.segLengths[segIdx];
          segIdx++;
        }
        const len = s.segLengths[segIdx] || 1;
        const t = Math.max(0, Math.min(1, dist / len));
        const a = s.pts[segIdx];
        const b = s.pts[segIdx + 1];
        const wx = a.x + (b.x - a.x) * t;
        const wz = a.z + (b.z - a.z) * t;
        const y = this.groundAt(wx, wz) ?? actor.position.y;

        actor.position.set(wx, y, wz);
        const dirSign = forward ? 1 : -1;
        actor.rotation.y = yawFromDelta(
          (b.x - a.x) * dirSign,
          (b.z - a.z) * dirSign,
        );
        s.heading = actor.rotation.y;

        s.animState.stance = "walk";
        s.animState.speed = s.baseSpeed;
        s.animState.phase = effectiveTime * s.baseSpeed * 4.4 + s.phaseSeed;
        s.animState.idleTime = time + s.phaseSeed;
        animateChibiActor(s.rig, s.animState);
      } else {
        s.speed = 0;
        s.animState.stance = "idle";
        s.animState.idleTime = time + s.phaseSeed;
        s.animState.activity = s.activity;
        s.animState.kickPhase =
          ((time / 1.3 - s.kickIndex) * Math.PI * 2) / (s.kickMembers || 1);
        actor.rotation.y =
          s.baseYaw + Math.sin(time * 0.8 + s.phaseSeed) * 0.08;
        s.heading = actor.rotation.y;
        animateChibiActor(s.rig, s.animState);
      }
    }
    for (const group of this.shuttleGroups) {
      const { mesh, center, radius, baseAngle, count } = group;
      mesh.visible =
        !playerPos ||
        Math.hypot(center.x - playerPos.x, center.z - playerPos.z) <=
          Math.sqrt(this.distanceCutoffSq);
      if (!mesh.visible) continue;
      const cycle = time / 1.3,
        from = Math.floor(cycle) % count,
        u = cycle % 1;
      const a = baseAngle + (from * Math.PI * 2) / count,
        b = baseAngle + (((from + 1) % count) * Math.PI * 2) / count;
      const x =
        center.x + (Math.cos(a) * (1 - u) + Math.cos(b) * u) * (radius - 0.3);
      const z =
        center.z + (Math.sin(a) * (1 - u) + Math.sin(b) * u) * (radius - 0.3);
      mesh.position.set(
        x,
        (this.groundAt(x, z) ?? 0.34) + 0.25 + Math.sin(u * Math.PI) * 1.65,
        z,
      );
      mesh.rotation.set(u * 2, cycle * 2, Math.sin(u * Math.PI) * 0.25);
    }
  }
}
