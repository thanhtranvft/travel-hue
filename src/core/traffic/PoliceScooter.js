import * as THREE from "three";
import { makePerson } from "../world/People.js";
import { box, mat } from "../shared/architecture/shared.js";

function officer(driver) {
  const person = makePerson("#ddc37e", true);
  person.name = driver ? "police-driver" : "police-passenger";
  person.traverse((o) => {
    if (o.material?.color?.getHexString() === "38474a")
      o.material = mat("#b49a60");
  });
  for (const arm of person.userData.limbs.arms)
    arm.rotation.x = driver ? -0.85 : -0.15;
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.165, 0.18, 0.09, 16),
    mat("#d7bb6d"),
  );
  cap.position.set(0, 1.74, 0);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.035, 16),
    mat("#a53732"),
  );
  band.position.set(0, 1.69, 0);
  person.add(
    cap,
    band,
    box([0.29, 0.025, 0.17], "#343a35", [0, 1.68, 0.15]),
    box([0.07, 0.08, 0.03], "#edca5c", [0, 1.75, 0.175]),
    box([0.34, 0.035, 0.055], "#b13a35", [0, 1.43, 0.01]),
    box([0.29, 0.05, 0.27], "#66523b", [0, 0.91, 0]),
  );
  person.position.set(0, 0.38, driver ? 0.17 : -0.65);
  person.scale.setScalar(0.85);
  return person;
}
export function policeScooter() {
  const group = new THREE.Group();
  group.name = "police-patrol";
  group.add(
    box([0.6, 0.5, 1.5], "#e6e5d8", [0, 0.6, -0.15]),
    box([0.54, 0.16, 1.3], "#2e3534", [0, 0.95, -0.3]),
    box([0.5, 0.8, 0.22], "#e9e9dd", [0, 0.95, 0.5]),
    box([0.82, 0.06, 0.1], "#68797c", [0, 1.35, 0.45]),
    box([0.36, 0.23, 0.08], "#fff1ad", [0, 1.24, 0.65]),
  );
  for (const z of [-0.75, 0.62]) {
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.065, 8, 16),
      mat("#242a2c"),
    );
    wheel.rotation.y = Math.PI / 2;
    wheel.position.set(0, 0.3, z);
    group.add(wheel);
  }
  for (const x of [-0.43, 0.43])
    group.add(box([0.25, 0.42, 0.58], "#f1efe3", [x, 0.68, -0.65]));
  group.add(officer(true), officer(false));
  group.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return group;
}
