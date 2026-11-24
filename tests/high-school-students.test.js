import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { CampusStudents } from "../src/core/world/CampusStudents.js";

test("THPT uniforms, seated conversation and alternating shuttlecock kicks animate independently", () => {
  const crowd = new CampusStudents({
    parent: new THREE.Group(),
    schoolLevel: "high-school",
    walkers: [
      {
        gender: "boy",
        points: [
          [0, 0],
          [0, 8],
        ],
      },
      {
        gender: "girl",
        points: [
          [2, 0],
          [2, 8],
        ],
      },
    ],
    chatSpots: [
      {
        side: 5,
        fwd: 5,
        activity: "shuttlecock",
        radius: 2,
        members: ["boy", "girl", "boy"],
      },
    ],
    benchSpots: [{ side: 10, fwd: 5, yaw: 0 }],
  });
  assert.ok(
    crowd.students.every((s) => s.mesh.userData.schoolLevel === "high-school"),
  );
  assert.equal(
    crowd.students[0].mesh.userData.uniform,
    "white-shirt-blue-trousers",
  );
  assert.equal(crowd.students[1].mesh.userData.uniform, "white-ao-dai");
  const seated = crowd.students.find((s) => s.activity === "seated");
  crowd.update(0);
  assert.equal(seated.rig.legs[0].hip.rotation.x, -Math.PI / 2);
  const kicker = crowd.students.find((s) => s.activity === "shuttlecock");
  const initialKick = kicker.rig.legs[0].hip.rotation.x;
  const initialBall = crowd.shuttleGroups[0].mesh.position.clone();
  crowd.update(0.65);
  assert.notEqual(kicker.rig.legs[0].hip.rotation.x, initialKick);
  assert.ok(crowd.shuttleGroups[0].mesh.position.distanceTo(initialBall) > 0.5);
  crowd.update(1, { x: 1000, z: 1000 });
  assert.ok(crowd.students.every((s) => !s.mesh.visible));
  assert.equal(crowd.shuttleGroups[0].mesh.visible, false);
});
