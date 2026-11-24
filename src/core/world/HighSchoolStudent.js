import * as THREE from "three";

// Campus NPC only: deliberately separate from the playable primary-school avatars.
export function buildHighSchoolStudent(gender = "boy") {
  const girl = gender === "girl";
  const actor = new THREE.Group();
  actor.userData.schoolLevel = "high-school";
  actor.userData.uniform = girl ? "white-ao-dai" : "white-shirt-blue-trousers";
  const material = (color) =>
    new THREE.MeshStandardMaterial({ color, roughness: 0.85 });
  const white = material("#fffdf4"),
    blue = material("#193b68"),
    skin = material("#e7b68d"),
    hair = material("#25201d"),
    shoe = material("#252b31");
  const part = (parent, geometry, mat, x, y, z, name) => {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.name = name || "";
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const body = new THREE.Group();
  actor.add(body);
  part(
    body,
    new THREE.CylinderGeometry(0.18, 0.16, 0.48, 10),
    white,
    0,
    1.19,
    0,
    "white-shirt",
  );
  part(body, new THREE.CylinderGeometry(0.065, 0.07, 0.1, 8), skin, 0, 1.46, 0);
  part(
    body,
    new THREE.SphereGeometry(0.17, 12, 10),
    skin,
    0,
    1.65,
    0,
    "head",
  ).scale.set(0.88, 1.12, 0.88);
  const hairCap = part(
    body,
    new THREE.SphereGeometry(0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hair,
    0,
    1.69,
    0,
  );
  if (girl)
    part(
      body,
      new THREE.BoxGeometry(0.27, 0.39, 0.11),
      hair,
      0,
      1.52,
      -0.11,
      "long-hair",
    );
  for (const x of [-0.055, 0.055])
    part(
      body,
      new THREE.SphereGeometry(0.013, 6, 4),
      hair,
      x,
      1.66,
      0.14,
      "eye",
    );
  const arms = [],
    legs = [],
    panels = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(side * 0.22, 1.37, 0);
    body.add(arm);
    part(
      arm,
      new THREE.CylinderGeometry(0.055, 0.05, girl ? 0.43 : 0.2, 8),
      white,
      0,
      girl ? -0.2 : -0.08,
      0,
      "sleeve",
    );
    part(
      arm,
      new THREE.CylinderGeometry(0.038, 0.032, girl ? 0.12 : 0.27, 8),
      skin,
      0,
      girl ? -0.46 : -0.31,
      0,
      "hand",
    );
    arms.push(arm);
    const leg = new THREE.Group();
    leg.position.set(side * 0.09, 0.95, 0);
    body.add(leg);
    part(
      leg,
      new THREE.CylinderGeometry(
        girl ? 0.075 : 0.067,
        girl ? 0.08 : 0.06,
        0.43,
        8,
      ),
      girl ? white : blue,
      0,
      -0.21,
      0,
      "trouser-upper",
    );
    const knee = new THREE.Group();
    knee.position.y = -0.43;
    leg.add(knee);
    part(
      knee,
      new THREE.CylinderGeometry(girl ? 0.08 : 0.06, 0.065, 0.43, 8),
      girl ? white : blue,
      0,
      -0.21,
      0,
      "trouser-lower",
    );
    part(
      knee,
      new THREE.BoxGeometry(0.13, 0.08, 0.23),
      shoe,
      0,
      -0.44,
      0.05,
      "shoe",
    );
    legs.push({ hip: leg, knee });
  }
  if (girl) {
    part(
      body,
      new THREE.CylinderGeometry(0.07, 0.075, 0.1, 8),
      white,
      0,
      1.45,
      0,
      "ao-dai-collar",
    );
    // Separate front/back panels leave visible side slits and white trousers.
    for (const sign of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, 1.02, sign * 0.1);
      body.add(pivot);
      const panel = part(
        pivot,
        new THREE.PlaneGeometry(0.36, 0.75, 2, 4),
        white,
        0,
        -0.36,
        0,
        "ao-dai-panel",
      );
      panel.material = white;
      white.side = THREE.DoubleSide;
      panels.push(pivot);
    }
  }
  return { actor, body, arms, legs, panels, highSchool: true };
}

export function animateHighSchoolStudent(rig, state) {
  const t = state.idleTime || 0,
    walk = state.stance === "walk";
  const kick =
    state.activity === "shuttlecock"
      ? Math.pow(Math.max(0, Math.cos(state.kickPhase || 0)), 12)
      : 0;
  const seated = state.activity === "seated";
  rig.body.position.y = seated
    ? -0.45
    : walk
      ? Math.abs(Math.sin(state.phase || 0)) * 0.018
      : Math.sin(t * 1.7) * 0.006;
  rig.legs.forEach(({ hip, knee }, i) => {
    hip.rotation.x = seated
      ? -Math.PI / 2
      : walk
        ? Math.sin((state.phase || 0) + i * Math.PI) * 0.36
        : i === 0
          ? -kick * 0.95
          : 0;
    knee.rotation.x = seated ? Math.PI / 2 : i === 0 ? kick * 0.5 : 0;
  });
  rig.arms.forEach((arm, i) => {
    arm.rotation.x = walk
      ? -Math.sin((state.phase || 0) + i * Math.PI) * 0.28
      : -0.16 + Math.sin(t * 1.4 + i) * 0.13;
    arm.rotation.z = (i === 0 ? 1 : -1) * (0.08 + kick * 0.15);
  });
  rig.panels.forEach((panel, i) => {
    panel.rotation.x =
      Math.sin(t * 2 + i) * 0.035 +
      (walk ? Math.sin(state.phase || 0) * 0.07 : 0) +
      (seated ? (i === 1 ? -0.9 : 0.15) : 0);
  });
}
