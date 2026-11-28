import * as THREE from "three";
import { markSharedResource } from "../shared/resources/sceneResources.js";

const _matCache = new Map();
const _geoCache = new Map();

function sharedMat(color, roughness = 0.76, metalness = 0.04) {
  const key = `${color}|${roughness}|${metalness}`;
  let m = _matCache.get(key);
  if (!m) {
    m = markSharedResource(
      new THREE.MeshStandardMaterial({ color, roughness, metalness }),
    );
    _matCache.set(key, m);
  }
  return m;
}

function sharedBoxGeo(w, h, d) {
  const key = `box|${w}|${h}|${d}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.BoxGeometry(w, h, d));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedSphereGeo(r, ws = 12, hs = 10, phiS = 0, phiL = Math.PI * 2, thS = 0, thL = Math.PI) {
  const key = `sph|${r}|${ws}|${hs}|${phiS}|${phiL}|${thS}|${thL}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.SphereGeometry(r, ws, hs, phiS, phiL, thS, thL));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedCylGeo(rt, rb, h, seg = 10) {
  const key = `cyl|${rt}|${rb}|${h}|${seg}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.CylinderGeometry(rt, rb, h, seg));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedCapsuleGeo(r, l, capSeg = 4, radSeg = 8) {
  const key = `cap|${r}|${l}|${capSeg}|${radSeg}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.CapsuleGeometry(r, l, capSeg, radSeg));
    _geoCache.set(key, g);
  }
  return g;
}

function sharedConeGeo(r, h, seg = 12) {
  const key = `cone|${r}|${h}|${seg}`;
  let g = _geoCache.get(key);
  if (!g) {
    g = markSharedResource(new THREE.ConeGeometry(r, h, seg));
    _geoCache.set(key, g);
  }
  return g;
}

function addMesh(parent, geo, mat, [x, y, z], [rx = 0, ry = 0, rz = 0] = []) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  if (rx || ry || rz) m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  parent.add(m);
  return m;
}

export const PERSON_ROLES = [
  "man",
  "woman",
  "elder-man",
  "elder-woman",
  "boy",
  "girl",
];

export const SOCIETY_PRESETS = [
  { role: "man", shirt: "#3e6b89", pants: "#2a3138", skin: "#dfb28e", hair: "#241d19", accessory: "bag" },
  { role: "woman", shirt: "#e27d8b", pants: "#2b3342", skin: "#ecc3a1", hair: "#221a16", hairStyle: "ponytail", accessory: "tote", skirt: true },
  { role: "elder-man", shirt: "#e4dec9", pants: "#464b4e", skin: "#d9ac89", hair: "#b8bec4", accessory: "cane", hat: "flat-cap" },
  { role: "elder-woman", shirt: "#8ca894", pants: "#232528", skin: "#e0b694", hair: "#c7ccd1", hairStyle: "bun", hat: "non-la" },
  { role: "boy", shirt: "#f0b643", pants: "#334d6e", skin: "#ecc19d", hair: "#261f1b", shorts: true, accessory: "backpack" },
  { role: "girl", shirt: "#f5e6ea", pants: "#b44a6e", skin: "#f0c8a8", hair: "#251c18", hairStyle: "pigtails", skirt: true, accessory: "backpack" },
  { role: "man", shirt: "#eceef0", pants: "#2f3c4c", skin: "#d5a37e", hair: "#1f1b18", hat: "cap" },
  { role: "woman", shirt: "#56968a", pants: "#ece7dc", skin: "#e9be9b", hair: "#2b1f19", hairStyle: "long", accessory: "tote" },
  { role: "man", shirt: "#c46b4b", pants: "#38474a", skin: "#dfb28e", hair: "#2a211c", accessory: "watch" },
  { role: "woman", shirt: "#c996d4", pants: "#2b303a", skin: "#ecc3a1", hair: "#211915", hairStyle: "bun", hat: "non-la" },
  { role: "elder-man", shirt: "#869ab0", pants: "#35393d", skin: "#d7a985", hair: "#c2c7cc", accessory: "cane" },
  { role: "elder-woman", shirt: "#d8a87b", pants: "#222427", skin: "#e2b895", hair: "#cfd4d8", hairStyle: "bun", accessory: "basket" },
  { role: "boy", shirt: "#4c89b8", pants: "#2b323b", skin: "#e8bb95", hair: "#231c18", shorts: true, hat: "cap" },
  { role: "girl", shirt: "#f4d06f", pants: "#436d8e", skin: "#f1c9a8", hair: "#2a1e18", hairStyle: "pigtails", skirt: true },
  { role: "woman", shirt: "#eb9256", pants: "#2c343f", skin: "#e7bc99", hair: "#281d18", hairStyle: "ponytail" },
  { role: "man", shirt: "#507a58", pants: "#363b40", skin: "#cfa07b", hair: "#1c1815", accessory: "bag" },
];

export function makePerson(colorOrOptions = "#739ba7", seated = false) {
  const opts =
    typeof colorOrOptions === "string"
      ? { shirt: colorOrOptions, seated }
      : { ...colorOrOptions, seated: colorOrOptions?.seated ?? seated };

  const role = PERSON_ROLES.includes(opts.role) ? opts.role : "man";
  const isChild = role === "boy" || role === "girl";
  const isFemale = role === "woman" || role === "elder-woman" || role === "girl";
  const isElder = role === "elder-man" || role === "elder-woman";
  const isSeated = Boolean(opts.seated);
  const isOnMat = Boolean(opts.onMat);

  const group = new THREE.Group();
  group.name = `person-${role}`;
  group.userData.role = role;

  const shirtColor = opts.shirt || "#739ba7";
  // Keep default #38474a when called with legacy string signature so PoliceScooter trouser recoloring stays intact
  const pantsColor =
    opts.pants ||
    (typeof colorOrOptions === "string"
      ? "#38474a"
      : isFemale && opts.skirt
        ? "#2d3b4e"
        : "#333e46");
  const skinColor = opts.skin || (isFemale || isChild ? "#ecc2a0" : "#dfb28d");
  const hairColor =
    opts.hair || (isElder ? "#bfc4ca" : "#261f1b");
  const shoeColor = opts.shoes || (isChild ? "#f2f4f7" : isFemale ? "#4a3338" : "#2b2d30");

  const skinMat = sharedMat(skinColor, 0.72);
  const clothMat = sharedMat(shirtColor, 0.78);
  const collarMat = sharedMat("#f4f6f7", 0.75);
  const trouserMat = sharedMat(pantsColor, 0.84);
  const hairMat = sharedMat(hairColor, 0.82);
  const shoeMat = sharedMat(shoeColor, 0.76);
  const eyeWhiteMat = sharedMat("#f8fafc", 0.35);
  const irisMat = sharedMat("#1f1612", 0.3);
  const lipMat = sharedMat(isFemale ? "#c85d66" : "#a8645a", 0.65);

  const bodyR = isFemale ? 0.145 : isChild ? 0.14 : 0.168;
  const shoulderX = isFemale ? 0.185 : isChild ? 0.175 : 0.21;
  const hipX = isFemale ? 0.088 : 0.098;
  const headR = isChild ? 0.155 : 0.138;
  const headY = 1.54;

  // Neck
  addMesh(group, sharedCylGeo(0.052, 0.06, 0.12, 8), skinMat, [0, 1.39, 0]);

  // Sculpted Head + Face + Ears + Hair
  const headGroup = new THREE.Group();
  headGroup.name = "head-group";
  headGroup.position.set(0, headY, 0);

  addMesh(headGroup, sharedSphereGeo(headR, 12, 10), skinMat, [0, 0, 0]);
  // Ears
  for (const sx of [-1, 1]) {
    addMesh(
      headGroup,
      sharedSphereGeo(headR * 0.22, 6, 6),
      skinMat,
      [sx * headR * 0.96, -0.01, -0.01],
    );
  }
  // Eyes + Eyebrows + Nose + Smile
  const eyeZ = headR * 0.88;
  const eyeX = headR * 0.34;
  for (const sx of [-1, 1]) {
    addMesh(
      headGroup,
      sharedSphereGeo(headR * 0.15, 8, 6),
      eyeWhiteMat,
      [sx * eyeX, 0.015, eyeZ],
    );
    addMesh(
      headGroup,
      sharedSphereGeo(headR * 0.1, 8, 6),
      irisMat,
      [sx * eyeX, 0.014, eyeZ + headR * 0.065],
    );
    addMesh(
      headGroup,
      sharedBoxGeo(headR * 0.24, 0.014, 0.018),
      hairMat,
      [sx * eyeX, headR * 0.34, eyeZ + 0.008],
      [0, 0, sx * -0.08],
    );
    if (isFemale || isChild) {
      addMesh(
        headGroup,
        sharedSphereGeo(headR * 0.13, 6, 6),
        sharedMat("#f29c94", 0.75),
        [sx * headR * 0.56, -headR * 0.18, eyeZ - 0.015],
      );
    }
  }
  // Subtle nose & mouth
  addMesh(headGroup, sharedSphereGeo(headR * 0.11, 6, 6), skinMat, [0, -0.015, headR * 0.98]);
  addMesh(headGroup, sharedBoxGeo(headR * 0.34, 0.016, 0.02), lipMat, [0, -headR * 0.42, headR * 0.88]);

  if (role === "elder-man") {
    // Neat silver moustache
    addMesh(
      headGroup,
      sharedBoxGeo(headR * 0.46, 0.026, 0.025),
      hairMat,
      [0, -headR * 0.28, headR * 0.94],
    );
    // Reading glasses
    const glassMat = sharedMat("#404850", 0.3, 0.7);
    for (const sx of [-1, 1]) {
      addMesh(headGroup, sharedBoxGeo(0.044, 0.028, 0.012), glassMat, [sx * eyeX, 0.015, eyeZ + 0.025]);
    }
    addMesh(headGroup, sharedBoxGeo(0.03, 0.008, 0.01), glassMat, [0, 0.02, eyeZ + 0.025]);
  }

  // Hair cap
  addMesh(
    headGroup,
    sharedSphereGeo(headR * 1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56),
    hairMat,
    [0, 0.016, -0.008],
  );

  const hairStyle =
    opts.hairStyle ||
    (role === "woman"
      ? "long"
      : role === "elder-woman"
        ? "bun"
        : role === "girl"
          ? "pigtails"
          : "short");

  if (hairStyle === "long") {
    addMesh(headGroup, sharedCapsuleGeo(headR * 0.72, 0.18, 4, 8), hairMat, [0, -0.07, -headR * 0.65]);
  } else if (hairStyle === "ponytail") {
    addMesh(
      headGroup,
      sharedCapsuleGeo(headR * 0.36, 0.16, 4, 8),
      hairMat,
      [0, -0.04, -headR * 1.02],
      [0.35, 0, 0],
    );
    addMesh(headGroup, sharedBoxGeo(0.055, 0.03, 0.03), sharedMat("#df5a78", 0.55), [0, 0.03, -headR * 0.98]);
  } else if (hairStyle === "bun") {
    addMesh(headGroup, sharedSphereGeo(headR * 0.44, 8, 8), hairMat, [0, 0.01, -headR * 1.05]);
  } else if (hairStyle === "pigtails") {
    const clipMat = sharedMat("#f06b8d", 0.55);
    for (const sx of [-1, 1]) {
      addMesh(
        headGroup,
        sharedCapsuleGeo(headR * 0.28, 0.12, 4, 6),
        hairMat,
        [sx * headR * 0.96, -0.04, -0.03],
        [0, 0, sx * -0.22],
      );
      addMesh(headGroup, sharedSphereGeo(0.026, 6, 6), clipMat, [sx * headR * 0.88, 0.05, 0.0]);
    }
  } else if (!opts.hat) {
    // Styled short front hair tuft
    addMesh(headGroup, sharedBoxGeo(headR * 1.15, 0.038, 0.06), hairMat, [0, headR * 0.78, headR * 0.36]);
  }

  // Optional Hats (Nón lá, baseball cap, flat cap, motorbike helmet)
  if (opts.hat === "non-la") {
    addMesh(
      headGroup,
      sharedConeGeo(0.28, 0.15, 16),
      sharedMat("#e3cc92", 0.85),
      [0, headR + 0.035, 0],
      [-0.08, 0, 0],
    );
  } else if (opts.hat === "cap") {
    const capCol = sharedMat(opts.hatColor || "#2c5b8c", 0.72);
    addMesh(
      headGroup,
      sharedSphereGeo(headR * 1.08, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5),
      capCol,
      [0, 0.025, 0],
    );
    addMesh(headGroup, sharedBoxGeo(0.18, 0.022, 0.13), capCol, [0, 0.055, headR * 0.92]);
  } else if (opts.hat === "flat-cap") {
    const capCol = sharedMat("#5e5246", 0.82);
    addMesh(headGroup, sharedCylGeo(headR * 1.02, headR * 1.08, 0.065, 12), capCol, [0, headR * 0.68, -0.01]);
    addMesh(headGroup, sharedBoxGeo(0.17, 0.02, 0.11), capCol, [0, headR * 0.45, headR * 0.85]);
  } else if (opts.hat === "helmet") {
    const hMat = sharedMat(opts.helmetColor || "#e4d29e", 0.35, 0.12);
    addMesh(
      headGroup,
      sharedSphereGeo(headR * 1.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hMat,
      [0, 0.022, -0.01],
    );
    addMesh(headGroup, sharedBoxGeo(0.19, 0.022, 0.085), sharedMat("#262b30", 0.45), [0, 0.03, headR * 1.05]);
  }

  group.add(headGroup);

  // Torso (layered shirt/blouse + collar + belt/skirt)
  addMesh(group, sharedCapsuleGeo(bodyR, 0.36, 4, 10), clothMat, [0, 1.13, 0]);
  // Crisp collar accent
  addMesh(group, sharedCylGeo(0.085, 0.105, 0.05, 10), collarMat, [0, 1.33, 0.01]);

  if (opts.skirt) {
    // Pleated skirt / áo dài tunic hem
    addMesh(
      group,
      sharedCylGeo(bodyR * 0.98, bodyR * 1.48, 0.32, 12),
      trouserMat,
      [0, 0.84, 0],
    );
  } else {
    // Waist belt
    addMesh(
      group,
      sharedCylGeo(bodyR * 0.96, bodyR * 0.98, 0.045, 12),
      sharedMat("#28231e", 0.65),
      [0, 0.92, 0],
    );
  }

  // Optional accessories on torso
  if (opts.accessory === "backpack") {
    addMesh(
      group,
      sharedBoxGeo(0.24, 0.3, 0.12),
      sharedMat(isChild ? "#3872b8" : "#445a4c", 0.76),
      [0, 1.14, -bodyR - 0.04],
    );
  } else if (opts.accessory === "bag") {
    addMesh(
      group,
      sharedBoxGeo(0.07, 0.22, 0.24),
      sharedMat("#5b412d", 0.72),
      [bodyR + 0.03, 0.94, 0],
    );
  }

  // Articulated Legs & Arms (explicitly named so PedestrianLife cloning rebinds cleanly)
  const legs = [];
  const arms = [];
  const legScaleY = opts.shorts ? 0.52 : 1;

  for (const sx of [-1, 1]) {
    const legPivot = new THREE.Group();
    legPivot.name = "leg-pivot";
    legPivot.position.set(sx * hipX, 0.85, 0);

    if (isOnMat) {
      // Crossed legs resting cleanly on picnic/lawn mat
      addMesh(
        legPivot,
        sharedCapsuleGeo(0.058, 0.24, 3, 8),
        trouserMat,
        [sx * 0.05, -0.02, 0.14],
        [Math.PI * 0.5, sx * 0.52, 0],
      );
      addMesh(
        legPivot,
        sharedCapsuleGeo(0.048, 0.22, 3, 8),
        opts.shorts ? skinMat : trouserMat,
        [-sx * 0.02, -0.03, 0.26],
        [Math.PI * 0.5, -sx * 0.65, 0],
      );
    } else if (isSeated) {
      // Bent knees: horizontal thigh + vertical lower shin + resting shoe
      addMesh(
        legPivot,
        sharedCapsuleGeo(0.06, 0.24, 3, 8),
        trouserMat,
        [0, -0.02, 0.15],
        [Math.PI * 0.5, 0, 0],
      );
      addMesh(
        legPivot,
        sharedCapsuleGeo(0.052, 0.28, 3, 8),
        opts.shorts ? skinMat : trouserMat,
        [0, -0.23, 0.3],
      );
      addMesh(
        legPivot,
        sharedBoxGeo(0.11, 0.07, 0.2),
        shoeMat,
        [0, -0.43, 0.35],
      );
    } else {
      if (opts.shorts) {
        addMesh(legPivot, sharedCapsuleGeo(0.068, 0.22, 3, 8), trouserMat, [0, -0.15, 0]);
        addMesh(legPivot, sharedCapsuleGeo(0.052, 0.32, 3, 8), skinMat, [0, -0.42, 0]);
        addMesh(legPivot, sharedCylGeo(0.054, 0.05, 0.09, 8), collarMat, [0, -0.63, 0]);
      } else {
        addMesh(
          legPivot,
          sharedCapsuleGeo(0.062, 0.52 * legScaleY, 3, 8),
          trouserMat,
          [0, -0.32, 0],
        );
      }
      addMesh(legPivot, sharedBoxGeo(0.125, 0.085, 0.23), shoeMat, [0, -0.71, 0.045]);
    }
    group.add(legPivot);
    legs.push(legPivot);

    const armPivot = new THREE.Group();
    armPivot.name = "arm-pivot";
    armPivot.position.set(sx * shoulderX, 1.32, 0);
    // Upper sleeve + skin forearm + hand
    addMesh(armPivot, sharedCapsuleGeo(0.052, 0.24, 3, 8), clothMat, [0, -0.14, 0]);
    addMesh(armPivot, sharedCapsuleGeo(0.042, 0.17, 3, 8), skinMat, [0, -0.35, 0]);
    addMesh(armPivot, sharedSphereGeo(0.044, 6, 6), skinMat, [0, -0.46, 0]);

    if (sx > 0 && !isSeated) {
      if (opts.accessory === "cane") {
        // Walking cane held in right hand
        const caneMat = sharedMat("#5d3e26", 0.65);
        addMesh(armPivot, sharedCylGeo(0.018, 0.014, 0.86, 8), caneMat, [0, -0.86, 0.08]);
        addMesh(armPivot, sharedBoxGeo(0.03, 0.035, 0.11), caneMat, [0, -0.44, 0.04]);
      } else if (opts.accessory === "tote") {
        addMesh(armPivot, sharedBoxGeo(0.09, 0.24, 0.2), sharedMat("#c98a5e", 0.78), [0.03, -0.58, 0.02]);
      } else if (opts.accessory === "basket") {
        addMesh(armPivot, sharedCylGeo(0.14, 0.1, 0.22, 10), sharedMat("#b88d52", 0.86), [0.05, -0.56, 0.04]);
      }
    }

    if (isSeated) armPivot.rotation.x = -0.32;
    group.add(armPivot);
    arms.push(armPivot);
  }

  if (isChild) {
    const s = role === "girl" ? 0.7 : 0.73;
    group.scale.setScalar(s);
  } else if (role === "elder-woman") {
    group.scale.setScalar(0.91);
  } else if (role === "woman") {
    group.scale.setScalar(0.95);
  } else if (role === "elder-man") {
    group.scale.setScalar(0.96);
  }

  if (isOnMat) {
    for (const ch of group.children) {
      ch.position.y -= 0.78;
    }
  } else if (isSeated) {
    // Keep legacy y offset for scooter/bench compatibility when no custom bench wrapper overrides it
    group.position.y = -0.27;
  }
  group.userData.limbs = { legs, arms };
  return group;
}

export function makeSocietyPerson(index = 0, overrides = {}) {
  const preset = SOCIETY_PRESETS[Math.abs(index) % SOCIETY_PRESETS.length];
  return makePerson({ ...preset, ...overrides });
}

export function animateWalker(group, phase) {
  const { legs = [], arms = [] } = group.userData.limbs || {};
  const role = group.userData.role;
  const stride = role === "elder-man" || role === "elder-woman" ? 0.24 : role === "boy" || role === "girl" ? 0.42 : 0.34;
  legs.forEach(
    (leg, i) => (leg.rotation.x = Math.sin(phase + i * Math.PI) * stride),
  );
  arms.forEach(
    (arm, i) => (arm.rotation.x = -Math.sin(phase + i * Math.PI) * (stride * 0.72)),
  );
}

export const JOGGER_SPEED_KMH = 12;
export const JOGGER_SPEED_MPS = JOGGER_SPEED_KMH / 3.6;

export const JOGGER_PRESETS = [
  { role: "man", shirt: "#1e88e5", stripe: "#ffe066", pants: "#1c2430", shoes: "#f4f7fa", sole: "#ff5a36", skin: "#dfb28e", hair: "#211a16", accessory: "headband", bandColor: "#ffe066" },
  { role: "woman", shirt: "#e94e77", stripe: "#ffffff", pants: "#222938", shoes: "#ffffff", sole: "#4ee0b5", skin: "#ecc3a1", hair: "#241b16", hairStyle: "ponytail", accessory: "visor", bandColor: "#e94e77" },
  { role: "man", shirt: "#28a97a", stripe: "#d9ff70", pants: "#1d2229", shoes: "#eef3f7", sole: "#28a97a", skin: "#d7a57f", hair: "#1c1815", accessory: "cap", bandColor: "#1d2229" },
  { role: "woman", shirt: "#ff7f3f", stripe: "#fff3cc", pants: "#242c3d", shoes: "#f7f9fc", sole: "#ff7f3f", skin: "#e9be9b", hair: "#291e19", hairStyle: "ponytail", accessory: "headband", bandColor: "#ffffff" },
  { role: "man", shirt: "#f5f7fa", stripe: "#d93644", pants: "#263245", shoes: "#1e242d", sole: "#d93644", skin: "#dfb28e", hair: "#241d19", accessory: "headband", bandColor: "#d93644" },
  { role: "woman", shirt: "#3bb2b8", stripe: "#fefefe", pants: "#1c222b", shoes: "#f4f7fb", sole: "#ff6ea8", skin: "#f0c8a8", hair: "#221915", hairStyle: "bun", accessory: "visor", bandColor: "#3bb2b8" },
  { role: "man", shirt: "#e0b326", stripe: "#1b2430", pants: "#1f2630", shoes: "#ffffff", sole: "#3a86ff", skin: "#d6a47e", hair: "#1f1a17", accessory: "cap", bandColor: "#264e86" },
  { role: "woman", shirt: "#7b5cd6", stripe: "#ffd166", pants: "#202531", shoes: "#f5f7fa", sole: "#ffd166", skin: "#ecc19d", hair: "#261c18", hairStyle: "ponytail", accessory: "headband", bandColor: "#ffd166" },
  { role: "man", shirt: "#243b55", stripe: "#56ccf2", pants: "#1b2028", shoes: "#f0f4f8", sole: "#56ccf2", skin: "#dfb28e", hair: "#261e19", accessory: "headband", bandColor: "#56ccf2" },
  { role: "woman", shirt: "#45b649", stripe: "#ffffff", pants: "#232a36", shoes: "#ffffff", sole: "#f7b731", skin: "#ecc3a1", hair: "#231a16", hairStyle: "ponytail", accessory: "visor", bandColor: "#45b649" },
];

export function makeJogger(index = 0) {
  const preset = JOGGER_PRESETS[Math.abs(index) % JOGGER_PRESETS.length];
  const isFemale = preset.role === "woman";
  const group = new THREE.Group();
  group.name = `jogger-${index}`;
  group.userData.role = preset.role;
  group.userData.isJogger = true;

  const skinMat = sharedMat(preset.skin, 0.72);
  const jerseyMat = sharedMat(preset.shirt, 0.74);
  const stripeMat = sharedMat(preset.stripe, 0.65);
  const shortsMat = sharedMat(preset.pants, 0.82);
  const hairMat = sharedMat(preset.hair, 0.82);
  const shoeMat = sharedMat(preset.shoes, 0.55);
  const soleMat = sharedMat(preset.sole, 0.65);
  const sockMat = sharedMat("#f3f5f8", 0.76);
  const bandMat = sharedMat(preset.bandColor || preset.stripe, 0.68);
  const eyeWhiteMat = sharedMat("#f8fafc", 0.35);
  const irisMat = sharedMat("#1f1612", 0.3);
  const lipMat = sharedMat(isFemale ? "#c85d66" : "#a8645a", 0.65);

  const bodyR = isFemale ? 0.142 : 0.162;
  const shoulderX = isFemale ? 0.182 : 0.205;
  const hipX = isFemale ? 0.088 : 0.098;
  const headR = 0.138;

  const bodyPivot = new THREE.Group();
  bodyPivot.name = "jogger-body";
  group.add(bodyPivot);

  // Neck + Head
  addMesh(bodyPivot, sharedCylGeo(0.052, 0.06, 0.12, 8), skinMat, [0, 1.39, 0]);
  const headGroup = new THREE.Group();
  headGroup.name = "head-group";
  headGroup.position.set(0, 1.54, 0);
  addMesh(headGroup, sharedSphereGeo(headR, 12, 10), skinMat, [0, 0, 0]);
  for (const sx of [-1, 1]) {
    addMesh(headGroup, sharedSphereGeo(headR * 0.21, 6, 6), skinMat, [sx * headR * 0.96, -0.01, -0.01]);
    addMesh(headGroup, sharedSphereGeo(headR * 0.14, 8, 6), eyeWhiteMat, [sx * headR * 0.34, 0.015, headR * 0.88]);
    addMesh(headGroup, sharedSphereGeo(headR * 0.095, 8, 6), irisMat, [sx * headR * 0.34, 0.014, headR * 0.945]);
    addMesh(headGroup, sharedBoxGeo(headR * 0.24, 0.014, 0.018), hairMat, [sx * headR * 0.34, headR * 0.34, headR * 0.89], [0, 0, sx * -0.08]);
  }
  addMesh(headGroup, sharedSphereGeo(headR * 0.1, 6, 6), skinMat, [0, -0.015, headR * 0.98]);
  addMesh(headGroup, sharedBoxGeo(headR * 0.32, 0.016, 0.02), lipMat, [0, -headR * 0.42, headR * 0.88]);
  addMesh(headGroup, sharedSphereGeo(headR * 1.05, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat, [0, 0.016, -0.008]);

  if (preset.hairStyle === "ponytail") {
    addMesh(headGroup, sharedCapsuleGeo(headR * 0.34, 0.18, 4, 8), hairMat, [0, -0.03, -headR * 1.05], [0.42, 0, 0]);
    addMesh(headGroup, sharedBoxGeo(0.055, 0.03, 0.03), bandMat, [0, 0.03, -headR * 0.98]);
  } else if (preset.hairStyle === "bun") {
    addMesh(headGroup, sharedSphereGeo(headR * 0.4, 8, 8), hairMat, [0, 0.03, -headR * 1.04]);
  } else {
    addMesh(headGroup, sharedBoxGeo(headR * 1.1, 0.035, 0.055), hairMat, [0, headR * 0.78, headR * 0.35]);
  }

  if (preset.accessory === "headband") {
    addMesh(headGroup, sharedCylGeo(headR * 1.09, headR * 1.09, 0.038, 16), bandMat, [0, headR * 0.34, 0]);
  } else if (preset.accessory === "visor") {
    addMesh(headGroup, sharedCylGeo(headR * 1.09, headR * 1.09, 0.034, 16), bandMat, [0, headR * 0.36, 0]);
    addMesh(headGroup, sharedBoxGeo(0.18, 0.018, 0.12), bandMat, [0, headR * 0.32, headR * 0.96], [0.14, 0, 0]);
  } else if (preset.accessory === "cap") {
    addMesh(headGroup, sharedSphereGeo(headR * 1.08, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), bandMat, [0, 0.025, 0]);
    addMesh(headGroup, sharedBoxGeo(0.18, 0.02, 0.125), bandMat, [0, 0.052, headR * 0.92]);
  }
  bodyPivot.add(headGroup);

  // Sporty athletic jersey + horizontal chest race stripe + shorts waistband
  const torsoPivot = new THREE.Group();
  torsoPivot.name = "torso-pivot";
  torsoPivot.position.set(0, 0.94, 0);
  addMesh(torsoPivot, sharedCapsuleGeo(bodyR, 0.35, 4, 10), jerseyMat, [0, 0.19, 0]);
  addMesh(torsoPivot, sharedCylGeo(bodyR * 1.03, bodyR * 1.03, 0.07, 12), stripeMat, [0, 0.24, 0]);
  addMesh(torsoPivot, sharedCylGeo(bodyR * 0.99, bodyR * 1.02, 0.06, 12), shortsMat, [0, -0.02, 0]);
  bodyPivot.add(torsoPivot);

  const legs = [];
  const shins = [];
  const arms = [];
  const forearms = [];

  for (const sx of [-1, 1]) {
    // Articulated Thigh + Shin + Sport Running Shoe
    const legPivot = new THREE.Group();
    legPivot.name = "leg-pivot";
    legPivot.position.set(sx * hipX, 0.85, 0);
    addMesh(legPivot, sharedCapsuleGeo(0.066, 0.2, 3, 8), shortsMat, [0, -0.14, 0]);
    addMesh(legPivot, sharedCapsuleGeo(0.052, 0.1, 3, 8), skinMat, [0, -0.28, 0]);

    const shinPivot = new THREE.Group();
    shinPivot.name = "shin-pivot";
    shinPivot.position.set(0, -0.35, 0);
    addMesh(shinPivot, sharedCapsuleGeo(0.048, 0.2, 3, 8), skinMat, [0, -0.13, 0]);
    addMesh(shinPivot, sharedCylGeo(0.052, 0.048, 0.09, 8), sockMat, [0, -0.27, 0]);
    // Cushioned athletic running shoe (upper + accent midsole + grip heel)
    addMesh(shinPivot, sharedBoxGeo(0.125, 0.068, 0.235), shoeMat, [0, -0.34, 0.045]);
    addMesh(shinPivot, sharedBoxGeo(0.13, 0.032, 0.245), soleMat, [0, -0.375, 0.045]);
    legPivot.add(shinPivot);
    bodyPivot.add(legPivot);
    legs.push(legPivot);
    shins.push(shinPivot);

    // Articulated Athletic Arm + Forearm + Sweatband
    const armPivot = new THREE.Group();
    armPivot.name = "arm-pivot";
    armPivot.position.set(sx * shoulderX, 1.32, 0);
    addMesh(armPivot, sharedCapsuleGeo(0.05, 0.14, 3, 8), jerseyMat, [0, -0.08, 0]);
    addMesh(armPivot, sharedCapsuleGeo(0.044, 0.1, 3, 8), skinMat, [0, -0.18, 0]);

    const forearmPivot = new THREE.Group();
    forearmPivot.name = "forearm-pivot";
    forearmPivot.position.set(0, -0.24, 0);
    addMesh(forearmPivot, sharedCapsuleGeo(0.04, 0.16, 3, 8), skinMat, [0, -0.1, 0]);
    addMesh(forearmPivot, sharedCylGeo(0.046, 0.046, 0.045, 8), bandMat, [0, -0.17, 0]);
    addMesh(forearmPivot, sharedSphereGeo(0.044, 6, 6), skinMat, [0, -0.21, 0]);
    armPivot.add(forearmPivot);
    bodyPivot.add(armPivot);
    arms.push(armPivot);
    forearms.push(forearmPivot);
  }

  if (isFemale) {
    group.scale.setScalar(0.95);
  }
  group.userData.limbs = {
    bodyPivot,
    headGroup,
    torsoPivot,
    legs,
    shins,
    arms,
    forearms,
  };
  return group;
}

export function animateJogger(group, phase) {
  const {
    bodyPivot,
    headGroup,
    torsoPivot,
    legs = [],
    shins = [],
    arms = [],
    forearms = [],
  } = group.userData.limbs || {};
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  const bounce = Math.abs(s) * 0.068;

  if (bodyPivot) bodyPivot.position.y = bounce;
  if (torsoPivot) torsoPivot.rotation.set(0.16, s * 0.08, 0);
  if (headGroup) headGroup.rotation.set(-0.08, -s * 0.05, 0);

  if (legs[0]) legs[0].rotation.x = s * 0.76;
  if (legs[1]) legs[1].rotation.x = -s * 0.76;
  if (shins[0]) shins[0].rotation.x = Math.max(0.1, -c * 0.88 + 0.34);
  if (shins[1]) shins[1].rotation.x = Math.max(0.1, c * 0.88 + 0.34);

  if (arms[0]) arms[0].rotation.set(-s * 0.82, 0, 0.08);
  if (arms[1]) arms[1].rotation.set(s * 0.82, 0, -0.08);
  if (forearms[0]) forearms[0].rotation.x = -1.18 + Math.max(0, -s) * 0.25;
  if (forearms[1]) forearms[1].rotation.x = -1.18 + Math.max(0, s) * 0.25;
}
