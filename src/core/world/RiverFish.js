import * as THREE from "three";

export const RIVER_FISH_VISUALS = {
  "ca-bong": {
    length: 0.24,
    height: 0.055,
    width: 0.048,
    bodyColor: "#b8905c",
    bellyColor: "#ebd7b0",
    finColor: "#8f693e",
    spotColor: "#5c4024",
    spotStyle: "speckled",
  },
  "ca-diec": {
    length: 0.31,
    height: 0.095,
    width: 0.058,
    bodyColor: "#cfd9df",
    bellyColor: "#f3f7fa",
    finColor: "#d99e4c",
    spotColor: "#8da1ad",
    spotStyle: "silver",
  },
  "ca-ro-phi": {
    length: 0.39,
    height: 0.135,
    width: 0.078,
    bodyColor: "#5c7a7c",
    bellyColor: "#cbd6d1",
    finColor: "#b55a4a",
    spotColor: "#31494a",
    spotStyle: "banded",
  },
  "ca-chep": {
    length: 0.52,
    height: 0.145,
    width: 0.115,
    bodyColor: "#f4a124",
    bellyColor: "#ffe394",
    finColor: "#f7c24e",
    spotColor: "#c96a08",
    spotStyle: "carp",
  },
  "ca-koi": {
    length: 0.68,
    height: 0.165,
    width: 0.138,
    bodyColor: "#ffffff",
    bellyColor: "#f5f5f5",
    finColor: "#fff0db",
    spotColor: "#e63b24",
    spotStyle: "koi",
  },
};

const sharedMatCache = new Map();
function fishMat(color, roughness = 0.32, metalness = 0.08) {
  const key = `${color}|${roughness}|${metalness}`;
  if (!sharedMatCache.has(key)) {
    sharedMatCache.set(
      key,
      new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    );
  }
  return sharedMatCache.get(key);
}

/**
 * Builds a stylized 3D river fish swimming along +Z (nose at +length/2, tail at -length/2).
 */
export function createRiverFishMesh(speciesId = "ca-chep", { variant = 0 } = {}) {
  const spec = RIVER_FISH_VISUALS[speciesId] || RIVER_FISH_VISUALS["ca-chep"];
  const L = spec.length;
  const H = spec.height;
  const W = spec.width;

  const group = new THREE.Group();
  group.name = `river-fish-${speciesId}`;
  group.userData.speciesId = speciesId;
  group.userData.length = L;

  const bodyMat = fishMat(spec.bodyColor, 0.28, 0.12);
  const bellyMat = fishMat(spec.bellyColor, 0.35, 0.08);
  const finMat = fishMat(spec.finColor, 0.42, 0.04);
  const spotMat = fishMat(spec.spotColor, 0.3, 0.06);
  const inkMat = fishMat("#1d2024", 0.35, 0.05);
  const eyeWhiteMat = fishMat("#ffffff", 0.2, 0.02);

  // Fusiform main body aligned along Z
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), bodyMat);
  body.scale.set(W, H, L * 0.72);
  group.add(body);

  // Lighter lower belly highlight
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 8), bellyMat);
  belly.scale.set(W * 0.82, H * 0.65, L * 0.56);
  belly.position.set(0, -H * 0.15, L * 0.02);
  group.add(belly);

  // Dorsal fin
  const dorsal = new THREE.Mesh(
    new THREE.ConeGeometry(L * 0.14, H * 0.72, 4),
    finMat,
  );
  dorsal.scale.set(0.28, 1, 1.35);
  dorsal.position.set(0, H * 0.52, -L * 0.04);
  dorsal.rotation.x = -0.32;
  group.add(dorsal);

  // Pectoral fins (left/right)
  for (const sx of [-1, 1]) {
    const pec = new THREE.Mesh(
      new THREE.ConeGeometry(L * 0.08, L * 0.2, 4),
      finMat,
    );
    pec.scale.set(1, 0.25, 0.7);
    pec.position.set(sx * W * 0.46, -H * 0.12, L * 0.1);
    pec.rotation.z = sx * -0.5;
    pec.rotation.y = sx * 0.55;
    group.add(pec);
  }

  // Distinct species markings
  if (spec.spotStyle === "koi") {
    const koiPatches = [
      [0, H * 0.34, L * 0.22, W * 0.66, H * 0.22, L * 0.16, spotMat],
      [W * 0.16, H * 0.3, -L * 0.02, W * 0.58, H * 0.22, L * 0.19, spotMat],
      [-W * 0.15, H * 0.28, -L * 0.18, W * 0.48, H * 0.18, L * 0.14, spotMat],
    ];
    if (variant % 3 === 1) {
      // Sanke tricolor accents
      koiPatches.push([
        -W * 0.22,
        H * 0.3,
        L * 0.08,
        W * 0.36,
        H * 0.16,
        L * 0.1,
        inkMat,
      ]);
      koiPatches.push([
        W * 0.18,
        H * 0.26,
        -L * 0.12,
        W * 0.32,
        H * 0.15,
        L * 0.1,
        inkMat,
      ]);
    } else if (variant % 3 === 2) {
      // Yamabuki / Kin Koi gold crown accent
      const goldMat = fishMat("#f7be2e", 0.25, 0.22);
      koiPatches[0][6] = goldMat;
      koiPatches[1][6] = goldMat;
    }
    for (const [px, py, pz, sx, sy, sz, m] of koiPatches) {
      const patch = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 6), m);
      patch.position.set(px, py, pz);
      patch.scale.set(sx, sy, sz);
      group.add(patch);
    }
  } else if (spec.spotStyle === "carp") {
    const ridge = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), spotMat);
    ridge.scale.set(W * 0.65, H * 0.25, L * 0.48);
    ridge.position.set(0, H * 0.32, 0);
    group.add(ridge);
    // Carp barbels near mouth
    for (const sx of [-1, 1]) {
      const barbel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.004, 0.002, L * 0.11, 4),
        finMat,
      );
      barbel.position.set(sx * W * 0.24, -H * 0.12, L * 0.34);
      barbel.rotation.z = sx * 0.7;
      barbel.rotation.x = 0.5;
      group.add(barbel);
    }
  } else if (spec.spotStyle === "banded") {
    for (const bz of [-0.14, 0, 0.14]) {
      const band = new THREE.Mesh(
        new THREE.BoxGeometry(W * 0.88, H * 0.66, L * 0.05),
        spotMat,
      );
      band.position.set(0, H * 0.05, bz * L);
      group.add(band);
    }
  } else if (spec.spotStyle === "speckled") {
    for (const [sx, bz] of [
      [-1, 0.08],
      [1, -0.04],
      [-1, -0.15],
    ]) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(L * 0.04, 6, 5), spotMat);
      dot.position.set(sx * W * 0.38, H * 0.08, bz * L);
      group.add(dot);
    }
  }

  // Articulated caudal tail fin pivot
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0, -L * 0.31);
  const upperLobe = new THREE.Mesh(
    new THREE.ConeGeometry(H * 0.38, L * 0.28, 4),
    finMat,
  );
  upperLobe.scale.set(0.22, 1, 0.85);
  upperLobe.position.set(0, H * 0.18, -L * 0.11);
  upperLobe.rotation.x = -Math.PI * 0.62;
  const lowerLobe = new THREE.Mesh(
    new THREE.ConeGeometry(H * 0.34, L * 0.26, 4),
    finMat,
  );
  lowerLobe.scale.set(0.22, 1, 0.85);
  lowerLobe.position.set(0, -H * 0.16, -L * 0.11);
  lowerLobe.rotation.x = Math.PI * 0.62;
  tailPivot.add(upperLobe, lowerLobe);
  group.add(tailPivot);

  // Eyes
  const eyeR = Math.max(0.011, H * 0.14);
  for (const sx of [-1, 1]) {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(eyeR, 6, 5), eyeWhiteMat);
    sclera.position.set(sx * W * 0.35, H * 0.14, L * 0.24);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(eyeR * 0.58, 6, 5), inkMat);
    pupil.position.set(sx * W * 0.39, H * 0.14, L * 0.255);
    group.add(sclera, pupil);
  }

  group.userData.tailPivot = tailPivot;
  return group;
}
