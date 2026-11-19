import * as THREE from "three";
import { mat, box } from "../shared/architecture/shared.js";

export function makePerson(color = "#739ba7", seated = false) {
  const group = new THREE.Group(),
    skin = mat("#c59d78"),
    cloth = mat(color),
    trousers = mat("#38474a");
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), skin);
  head.position.y = 1.53;
  group.add(head);
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(0.154, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    mat("#35312b"),
  );
  hair.position.y = 1.55;
  group.add(hair);
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.18, 0.4, 4, 10),
    cloth,
  );
  body.position.y = 1.13;
  group.add(body);
  const legs = [],
    arms = [];
  for (const x of [-0.105, 0.105]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, 0.85, 0);
    const leg = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.065, 0.55, 3, 8),
      trousers,
    );
    leg.position.y = -0.32;
    pivot.add(leg, box([0.14, 0.09, 0.26], "#3a3831", [0, -0.72, 0.05]));
    if (seated) pivot.rotation.x = -1.2;
    group.add(pivot);
    legs.push(pivot);
    const arm = new THREE.Group();
    arm.position.set(x * 2.2, 1.34, 0);
    const sleeve = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.055, 0.42, 3, 8),
      cloth,
    );
    sleeve.position.y = -0.24;
    arm.add(sleeve);
    group.add(arm);
    arms.push(arm);
  }
  if (seated) group.position.y = -0.27;
  group.userData.limbs = { legs, arms };
  group.traverse((o) => {
    if (o.isMesh) o.castShadow = true;
  });
  return group;
}
export function animateWalker(group, phase) {
  const { legs, arms } = group.userData.limbs;
  legs.forEach(
    (leg, i) => (leg.rotation.x = Math.sin(phase + i * Math.PI) * 0.35),
  );
  arms.forEach(
    (arm, i) => (arm.rotation.x = -Math.sin(phase + i * Math.PI) * 0.25),
  );
}
